#!/usr/bin/env node
// probe_door_wall.js — STUDY ONLY, no fix (2026-08-12, bim-compiler
// prompts/4D_SCHEDULE_PERFECTION.md §DOOR_WINDOW_HOST_WALL).
//
// WHY: §DOOR_WINDOW_HOST_WALL (viewer/schedule_gate.js openingGate, 2026-08-11) cites "measured on
// all 7 shipped buildings (probe_door_wall.js)" — but no such file was ever committed. This is that
// file, written 2026-08-12 for the user-reported "HHS_Office_Federated Level 3 doors float"
// (a door visible before its host wall exists). Every number here is measured, none assumed.
//
// ISSUE this probe exposes: openingGate only ever consults `wallGrid`, and place() fills wallGrid
// from `el.cls.indexOf('IfcWall') === 0`. A door cut into anything NOT literally prefixed IfcWall
// (IfcCurtainWall, IfcPlate/IfcMember curtain-wall panels, ...) finds ZERO candidates and falls
// through ungated. This probe answers, per storey, with real data:
//   §DW_CLASS      per storey: door/window count, and the classes of every element that
//                  geometrically brackets them (openingGate's own predicate), split into
//                  IN-wallGrid (indexOf('IfcWall')===0) vs OUT-of-wallGrid.
//   §DW_COVER      per storey: how many doors/windows have >=1 wallGrid candidate (gate-able) vs
//                  ZERO (structurally ungated — openingGate returns baseMs for them).
//   §DW_EARLY      per storey: on the RAW generative timeline AND on the DISPLAY timeline the movie
//                  plays (post _twoTierRemap + _midairRepair), how many doors/windows start before
//                  their bracketing host finishes, and by how many days at worst.
//
// Command (from bim-compiler/):
//   VIEWER_DIR=~/bim-ootb/viewer BLD_DIR=~/bim-ootb/buildings node scripts/probe_door_wall.js
//   ONLY=HHS_Office_Federated ... node scripts/probe_door_wall.js     # one building
// Read the log, not the exit code.
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const HOME = require('os').homedir();
const VIEWER_DIR = process.env.VIEWER_DIR || path.join(HOME, 'bim-ootb', 'viewer');
const SQLJS_DIR = process.env.SQLJS_DIR || path.join(HOME, 'bim-ootb', 'modeller', 'lib');
const initSqlJs = require(path.join(SQLJS_DIR, 'sql-wasm.js'));
const ScheduleGate = require(path.join(VIEWER_DIR, 'schedule_gate.js'));
const ScheduleAuthor = require(path.join(VIEWER_DIR, 'schedule_author.js'));
const tmSrc = fs.readFileSync(path.join(VIEWER_DIR, 'time_machine.js'), 'utf8');

// ── harness: identical slicing to probe_arch_start.js so both probes measure the SAME pipeline ──
const OPTIONAL = { _zoneIndexBuild: 1, _zoneIndex: 1, _zoneOf: 1 };
function sliceFn(src, name, which) {
  let from = 0;
  for (let pass = 0; pass <= (which || 0); pass++) {
    const idx = src.indexOf('function ' + name + '(', from);
    if (idx < 0) { if (OPTIONAL[name]) return null; throw new Error(name + ' #' + (which || 0) + ' not found'); }
    let depth = 0, i = idx, seenOpen = false;
    for (; i < src.length; i++) {
      if (src[i] === '{') { depth++; seenOpen = true; }
      else if (src[i] === '}') { depth--; if (seenOpen && depth === 0) break; }
    }
    if (pass === (which || 0)) return src.slice(idx, i + 1);
    from = i + 1;
  }
  throw new Error('unreachable');
}
const MR = parseInt(process.env.MR || '1', 10);
const tierOrderLine = "var _TIER1_ORDER = ['Substructure', 'Superstructure', 'Architecture'];";
const zoneParts = [sliceFn(tmSrc, '_zoneIndexBuild'), sliceFn(tmSrc, '_zoneIndex')].filter(Boolean);
const zoneOfPart = sliceFn(tmSrc, '_zoneOf') || '';
const sliced = [tierOrderLine,
  (zoneParts.length === 2 ? 'var _zoneMemo = [];' : ''), zoneParts[0] || '', zoneParts[1] || '',
  zoneOfPart,
  sliceFn(tmSrc, '_promoteRoofLoadPath'), sliceFn(tmSrc, '_buildXrayElements'),
  sliceFn(tmSrc, '_tier1Extents'), sliceFn(tmSrc, '_tier1Serialize'),
  sliceFn(tmSrc, '_tier1Protrusion'), sliceFn(tmSrc, '_tierAuditRegate'),
  sliceFn(tmSrc, '_twoTierRemap'), sliceFn(tmSrc, '_contactGraph'),
  sliceFn(tmSrc, '_midairAudit'), sliceFn(tmSrc, '_midairRepair', MR)].join('\n');

function loadRatesTable() {
  const txt = fs.readFileSync(path.join(VIEWER_DIR, 'rates.js'), 'utf8');
  const start = txt.indexOf('var RATES = {');
  const defIdx = txt.indexOf('var SEQUENCE_DEFAULT');
  return (new Function(txt.slice(start, txt.indexOf('};', defIdx) + 2) + '\n return RATES;'))();
}

const BLD_DIR = process.env.BLD_DIR || path.join(HOME, 'bim-ootb', 'buildings');
const DB_FILE = { LTU_AHouse: 'LTU_AHouse_meta.db' };
const BUILDINGS = (process.env.ONLY || 'Terminal,Hospital,Duplex,HHS_Office_Federated,Clinic,LTU_AHouse,JKR').split(',');
const D = 86400000;

// openingGate's own primitives, verbatim from schedule_gate.js (CELL/EPS are exported by the module
// so this probe can never drift from the gate it is measuring).
const CELL = ScheduleGate.CELL != null ? ScheduleGate.CELL : 4;
const EPS  = ScheduleGate.EPS  != null ? ScheduleGate.EPS  : 0.05;
const overlap = (a, b) => a.x0 <= b.x1 && a.x1 >= b.x0 && a.y0 <= b.y1 && a.y1 >= b.y0;
const cellsOf = e => { const o = [];
  for (let i = Math.floor(e.x0 / CELL); i <= Math.floor(e.x1 / CELL); i++)
    for (let j = Math.floor(e.y0 / CELL); j <= Math.floor(e.y1 / CELL); j++) o.push(i + ',' + j);
  return o; };
// what openingGate is gated on today
const inWallGrid = cls => !!cls && cls.indexOf('IfcWall') === 0;
const isOpening  = cls => cls === 'IfcDoor' || cls === 'IfcWindow';

(async () => {
  const SQL = await initSqlJs({ wasmBinary: fs.readFileSync(path.join(SQLJS_DIR, 'sql-wasm.wasm')) });
  const rulesJson = JSON.parse(fs.readFileSync(path.join(VIEWER_DIR, 'rates', 'sequence_rules.json'), 'utf8'));
  const SR = rulesJson.SEQUENCE_RULES, SD = rulesJson.SEQUENCE_DEFAULT, LR = rulesJson.LABOR_RATES;
  const NO = rulesJson.NAME_OVERRIDES || [];
  const RATES = loadRatesTable();
  console.log('§DW_PROBE viewer=' + VIEWER_DIR + ' CELL=' + CELL + ' EPS=' + EPS);

  for (const bld of BUILDINGS) {
    const dbPath = path.join(BLD_DIR, DB_FILE[bld] || (bld + '_extracted.db'));
    if (!fs.existsSync(dbPath)) { console.log('§DW ' + bld + ' fixture missing: ' + dbPath); continue; }
    const db = new SQL.Database(fs.readFileSync(dbPath));
    const sandbox = { console: { log: () => {}, warn: () => {} }, performance: { now: () => Date.now() },
      window: { SEQUENCE_RULES: SR, SEQUENCE_DEFAULT: SD, SEQUENCE_NAME_OVERRIDES: NO },
      ScheduleGate: ScheduleGate, Math: Math, RegExp: RegExp, Object: Object, Infinity: Infinity,
      A: () => ({ db: db, activeBuilding: bld, _metaGen: 0 }) };
    vm.createContext(sandbox);
    vm.runInContext(sliced + '\nthis.__bxe = _buildXrayElements; this.__remap = _twoTierRemap; this.__repair = _midairRepair;', sandbox);
    const els = sandbox.__bxe();
    if (!els || !els.length) { console.log('§DW ' + bld + ' element build produced nothing'); db.close(); continue; }

    const nameOf = {}, dbStorey = {};
    const nr = db.exec("SELECT guid, ifc_class, COALESCE(element_name,''), COALESCE(storey,'') FROM elements_meta");
    if (nr.length) nr[0].values.forEach(v => { nameOf[v[0]] = v[2]; dbStorey[v[0]] = v[3]; });

    const frag = ScheduleAuthor._classFragmentation(db, RATES);
    const lin = ScheduleAuthor._linearWeighting(db, RATES);
    const geoEls = els.filter(e => !(e.x0 === e.x1 && e.y0 === e.y1 && e.base_z === e.top_z));
    geoEls.forEach(e => {
      const rule = ScheduleAuthor.matchNameOverride(e.cls, nameOf[e.guid] || '', NO) || ScheduleAuthor.matchRule(e.cls, SR, SD);
      if (!e.phase) e.phase = rule.phase;
      e.resource = rule.resource || '_DEFAULT';
      const realQty = (frag.fragmented[e.cls] && frag.area[e.guid] != null) ? frag.area[e.guid] : null;
      const span = Math.max(e.x1 - e.x0, e.y1 - e.y0, e.top_z - e.base_z);
      const avgLen = lin.avgLength[e.cls];
      const lengthRatio = (realQty == null && span > 0 && avgLen > 0) ? span / avgLen : null;
      e.installSecs = ScheduleAuthor._installSecs(e.cls, rule, LR, realQty, lengthRatio);
    });
    db.close();

    // §CREW_AUTOSCALE — mirrors injectGantt so this probe schedules what the viewer schedules
    const crewWorkDays = {};
    geoEls.forEach(e => { const r = e.resource || '_DEFAULT';
      crewWorkDays[r] = (crewWorkDays[r] || 0) + (e.installSecs || 0) / 28800; });
    let totSecs = 0; geoEls.forEach(e => { totSecs += e.installSecs || 0; });
    const projDays = Math.max(10, Math.ceil(totSecs * 1000 / 86400000));
    const maxCrews = {};
    for (const rk in LR) {
      if (!LR[rk].max_crews && LR[rk].max_crews_fixed == null) continue;
      const base0 = LR[rk].max_crews || 0, wd = crewWorkDays[rk] || 0;
      maxCrews[rk] = (LR[rk].max_crews_fixed != null) ? LR[rk].max_crews_fixed
                   : Math.max(base0, Math.ceil(wd / projDays));
    }

    const quiet = console.log; console.log = () => {};
    let sched;
    try { sched = ScheduleGate.computeSchedule(geoEls, 0, 1, maxCrews); } finally { console.log = quiet; }

    const items = geoEls.map(e => ({ guid: e.guid, s: sched[e.guid].start, e: sched[e.guid].end,
      rawS: sched[e.guid].start, rawE: sched[e.guid].end,
      bz: e.base_z, tz: e.top_z, x0: e.x0, x1: e.x1, y0: e.y0, y1: e.y1, cls: e.cls, seq: e.seq,
      phase: e.phase, storey: e.storey }));
    const base = Math.min.apply(null, items.map(i => i.rawS));

    // DISPLAY timeline — the one the movie plays
    sandbox.console = { log: () => {}, warn: () => {} };
    sandbox.__items = items;
    vm.runInContext('this.__remap(this.__items);', sandbox);
    vm.runInContext('this.__repair(this.__items);', sandbox);

    // ── index EVERY element by openingGate's own cell grid, so we can see what a door really
    // brackets, not only what the gate currently looks at ──
    const grid = {};
    items.forEach(it => { if (isOpening(it.cls)) return;
      cellsOf(it).forEach(c => (grid[c] || (grid[c] = [])).push(it)); });
    // openingGate's predicate, evaluated against an arbitrary candidate set
    const bracketing = (op) => {
      const seen = {}, out = [];
      cellsOf(op).forEach(c => { const arr = grid[c]; if (!arr) return;
        for (const S of arr) { if (seen[S.guid]) continue;
          if (S.bz <= op.tz + EPS && S.tz >= op.bz - EPS && overlap(S, op)) { seen[S.guid] = 1; out.push(S); } } });
      return out;
    };

    const openings = items.filter(it => isOpening(it.cls));
    if (!openings.length) { console.log('  §DW_COVER ' + bld + ' openings=0 — nothing to check'); continue; }

    // per-storey accumulators. `storey` is _buildXrayElements' derived band (same key every other
    // §-number in this lane is broken out by); DB storey is printed alongside for cross-reference.
    // POOLS — the whole point of the split. WALLGRID is what openingGate can see TODAY; WALLLIKE
    // adds only classes actually observed bracketing openings in this data (never a guessed name —
    // the set is derived below from §DW_CLASS's own NOTinWallGrid tally); ALL is every bracketing
    // element, the upper bound. A gate that works shows early=0 in its own pool.
    const WALLLIKE = /^(IfcWall|IfcWallStandardCase|IfcCurtainWall|IfcPlate|IfcMember)$/;
    const POOLS = [
      ['wallGrid', S => inWallGrid(S.cls)],
      ['wallLike', S => WALLLIKE.test(S.cls || '')],
      ['any',      () => true]
    ];
    const byStorey = {};
    const bucket = st => byStorey[st] || (byStorey[st] = { n: 0, gateable: 0, ungated: 0,
      inCls: {}, outCls: {}, ungatedCls: {}, dbSt: {},
      p: POOLS.map(() => ({ matched: 0, rawEarly: 0, dispEarly: 0, rawWorst: 0, dispWorst: 0, rawWho: '', dispWho: '' })) });

    openings.forEach(op => {
      const b = bucket(op.storey || '_UNKNOWN');
      b.n++;
      b.dbSt[dbStorey[op.guid] || '(none)'] = (b.dbSt[dbStorey[op.guid] || '(none)'] || 0) + 1;
      const cand = bracketing(op);
      const inG = cand.filter(S => inWallGrid(S.cls));
      cand.forEach(S => { const t = inWallGrid(S.cls) ? b.inCls : b.outCls; t[S.cls] = (t[S.cls] || 0) + 1; });
      if (inG.length) b.gateable++;
      else { b.ungated++; cand.forEach(S => { b.ungatedCls[S.cls] = (b.ungatedCls[S.cls] || 0) + 1; }); }
      POOLS.forEach(([, pred], pi) => {
        const pool = cand.filter(pred);
        if (!pool.length) return;
        const acc = b.p[pi]; acc.matched++;
        let rd = 0, rw = '', dd2 = 0, dw = '';
        pool.forEach(S => {
          const r = (S.rawE - op.rawS) / D; if (r > rd) { rd = r; rw = S.cls; }
          const d = (S.e - op.s) / D;       if (d > dd2) { dd2 = d; dw = S.cls; }
        });
        if (rd > 0) { acc.rawEarly++; if (rd > acc.rawWorst) { acc.rawWorst = rd; acc.rawWho = rw; } }
        if (dd2 > 0) { acc.dispEarly++; if (dd2 > acc.dispWorst) { acc.dispWorst = dd2; acc.dispWho = dw; } }
      });
    });

    // DETAIL=<pool> dumps the individual offenders — the only way to confirm a bracketing element is
    // a real HOST (a full-height frame the opening sits inside) rather than a coincidental neighbour.
    if (process.env.DETAIL) {
      const want = process.env.DETAIL;
      const pred = (POOLS.find(p => p[0] === want) || POOLS[0])[1];
      const rows = [];
      openings.forEach(op => {
        const cand = bracketing(op).filter(pred);
        cand.forEach(S => {
          const d = (S.e - op.s) / D; if (d <= 0) return;
          rows.push({ d: d, st: op.storey, opCls: op.cls, opG: op.guid, hCls: S.cls, hG: S.guid,
            opS: (op.s - base) / D, hE: (S.e - base) / D, hS: (S.s - base) / D,
            // geometry of the relation: does the host span the opening's full height (a frame) or
            // sit above/below it (a peer panel)?
            spansZ: (S.bz <= op.bz + 0.05 && S.tz >= op.tz - 0.05),
            dzBase: S.bz - op.bz, dzTop: S.tz - op.tz,
            encloseXY: (S.x0 <= op.x0 && S.x1 >= op.x1 && S.y0 <= op.y0 && S.y1 >= op.y1) });
        });
      });
      rows.sort((a, b) => b.d - a.d);
      console.log('  §DW_WHO ' + bld + ' pool=' + want + ' offendingPairs=' + rows.length + ' (top 12 by days early)');
      rows.slice(0, 12).forEach(r => console.log('      §DW_WHO ' + bld + ' [' + r.st + '] ' + r.opCls +
        ' ' + r.opG + ' starts day' + r.opS.toFixed(1) + ' | host ' + r.hCls + ' ' + r.hG +
        ' runs day' + r.hS.toFixed(1) + '..' + r.hE.toFixed(1) + ' → ' + r.d.toFixed(1) + 'd early' +
        ' | spansZ=' + r.spansZ + ' dzBase=' + r.dzBase.toFixed(2) + ' dzTop=' + r.dzTop.toFixed(2) +
        ' enclosesXY=' + r.encloseXY));
    }
    const top = o => Object.keys(o).sort((a, c) => o[c] - o[a]).slice(0, 6).map(k => k + '×' + o[k]).join(',') || 'none';
    const sts = Object.keys(byStorey).sort();
    const tot = { n: 0, ungated: 0, p: POOLS.map(() => ({ matched: 0, rawEarly: 0, dispEarly: 0, rawWorst: 0, dispWorst: 0 })) };
    sts.forEach(st => { const b = byStorey[st]; tot.n += b.n; tot.ungated += b.ungated;
      b.p.forEach((a, pi) => { const T = tot.p[pi]; T.matched += a.matched; T.rawEarly += a.rawEarly;
        T.dispEarly += a.dispEarly; if (a.rawWorst > T.rawWorst) T.rawWorst = a.rawWorst;
        if (a.dispWorst > T.dispWorst) T.dispWorst = a.dispWorst; }); });
    const pct = (a, b2) => b2 ? (100 * a / b2).toFixed(1) : '0.0';
    console.log('  §DW_COVER ' + bld + ' openings=' + tot.n + ' ungated=' + tot.ungated +
      ' (' + pct(tot.ungated, tot.n) + '% have ZERO wallGrid candidate ⇒ openingGate returns baseMs) | ' +
      POOLS.map(([nm], pi) => { const T = tot.p[pi];
        return nm + ': matched=' + T.matched + ' rawEARLY=' + T.rawEarly + '(' + pct(T.rawEarly, T.matched) +
          '%) dispEARLY=' + T.dispEarly + '(' + pct(T.dispEarly, T.matched) + '%) worstDisp=' + T.dispWorst.toFixed(1) + 'd'; }).join(' | '));
    sts.forEach(st => {
      const b = byStorey[st];
      console.log('    §DW_CLASS ' + bld + ' [' + st + '] n=' + b.n +
        ' gateable=' + b.gateable + ' ungated=' + b.ungated +
        ' | inWallGrid{' + top(b.inCls) + '}' +
        ' | NOTinWallGrid{' + top(b.outCls) + '}' +
        ' | whatBracketsTheUngated{' + top(b.ungatedCls) + '}' +
        ' | dbStorey{' + top(b.dbSt) + '}');
      POOLS.forEach(([nm], pi) => {
        const a = b.p[pi];
        console.log('    §DW_EARLY ' + bld + ' [' + st + '] pool=' + nm + ' matched=' + a.matched + '/' + b.n +
          ' rawEARLY=' + a.rawEarly + '(' + pct(a.rawEarly, a.matched) + '%) worst=' + a.rawWorst.toFixed(1) + 'd' +
          (a.rawWho ? '@' + a.rawWho : '') +
          ' | dispEARLY=' + a.dispEarly + '(' + pct(a.dispEarly, a.matched) + '%) worst=' + a.dispWorst.toFixed(1) + 'd' +
          (a.dispWho ? '@' + a.dispWho : ''));
      });
    });
  }
})();
