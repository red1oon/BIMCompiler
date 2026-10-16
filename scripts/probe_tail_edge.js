#!/usr/bin/env node
// probe_tail_edge.js — §DAY_GAP_TAIL root-cause probe (2026-08-12, bim-compiler
// prompts/4D_SCHEDULE_PERFECTION.md §DAY_GAP_TAIL).
//
// ISSUE THIS PROBE EXPOSES: the film's residual dead run moved to the END — a thin straggler tail
// (LTU Superstructure 313 elements spanning 1386.3d past its 95% mark; Hospital MEP Rough-in 1918
// spanning 320.8d) drags its whole phase window. The geometry-outlier theory is DISPROVEN (see the
// prompts file). The remaining suspect is the PUSH PATH. This probe answers the named question:
//
//   for each straggler element, WHICH support/contact edge — which other element, via which gate —
//   produced its FINAL (latest) start day?
//
// It never re-implements a gate. Every gate body is the SHIPPED source, sliced out of
// schedule_gate.js / time_machine.js and instrumented with attribution-only recording (assignments
// to _WHO/_TATTR; not one predicate, constant or ordering is changed). The `--selfcheck` mode
// re-runs the UNPATCHED modules and asserts the instrumented run produces byte-identical start
// times, so a divergence is a failure, not a silent bias.
//
// Reported per building, every number derived, none assumed:
//   §TAIL_EDGE   the worst phase's tail: n, p95 day, span past p95
//   §TAIL_ATTR   histogram of the FINAL mutating stage/gate over the tail population
//   §TAIL_SRC    the recurring driver elements — "does ONE bad edge drag many?"
//   §TAIL_CHAIN  the full stage-by-stage chain for the single worst straggler
//   §TAIL_SELF   instrumented-vs-shipped equality check (0 = the instrumentation is inert)
//
// Command (from bim-compiler/):
//   VIEWER_DIR=/tmp/wt-day-gap-tail/viewer BLD_DIR=$HOME/bim-ootb/buildings node scripts/probe_tail_edge.js
//   ONLY=LTU_AHouse ... node scripts/probe_tail_edge.js        # one building
//   ... node scripts/probe_tail_edge.js --selfcheck            # prove the instrumentation is inert
// Read the log, not the exit code.
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const HOME = require('os').homedir();
const VIEWER_DIR = process.env.VIEWER_DIR || path.join(HOME, 'bim-ootb', 'viewer');
const SQLJS_DIR = process.env.SQLJS_DIR || path.join(HOME, 'bim-ootb', 'modeller', 'lib');
const initSqlJs = require(path.join(SQLJS_DIR, 'sql-wasm.js'));
const ScheduleAuthor = require(path.join(VIEWER_DIR, 'schedule_author.js'));
const ScheduleGatePlain = require(path.join(VIEWER_DIR, 'schedule_gate.js'));
const sgSrc = fs.readFileSync(path.join(VIEWER_DIR, 'schedule_gate.js'), 'utf8');
const tmSrc = fs.readFileSync(path.join(VIEWER_DIR, 'time_machine.js'), 'utf8');
const SELFCHECK = process.argv.indexOf('--selfcheck') >= 0;
const D = 86400000;

// ── surgical string patching: replace the Nth occurrence, and FAIL LOUD if it is not there ──────
// A silently-missed patch would produce an "unattributed" verdict that looks like a finding. Every
// patch is asserted.
let _patchN = 0;
function patch(src, needle, repl, which) {
  let from = 0, idx = -1;
  for (let p = 0; p <= (which || 0); p++) {
    idx = src.indexOf(needle, from);
    if (idx < 0) throw new Error('PATCH MISS #' + (which || 0) + ': ' + needle.slice(0, 70));
    from = idx + 1;
  }
  _patchN++;
  return src.slice(0, idx) + repl + src.slice(idx + needle.length);
}

// ══ 1. schedule_gate.js — attribute the RAW generative start to the gate that won ══════════════
// The five `g = S.end` sites are, in file order: geoGate, hangGate(band), hangGate(§HANG_NEAREST),
// wallGate, openingGate. Each records WHICH S it took its value from; nothing else changes.
let sgi = sgSrc;
sgi = patch(sgi, 'var grid = {}, wallGrid = {}, out = {}, c, cs, k, arr, S;',
  'var grid = {}, wallGrid = {}, out = {}, c, cs, k, arr, S;\n    var _WHO = {}, _ATTR = {}; global.__SG_ATTR = _ATTR;');
const GTAG = ['geo', 'hang', 'hangNear', 'wall', 'open'];
for (let i = 0; i < 5; i++) {
  // every site is the tail of an `if (...) g = S.end; } }` — braces keep it a single statement
  sgi = patch(sgi, 'g = S.end; } }', '{ g = S.end; _WHO.' + GTAG[i] + ' = S.guid; } } }', 0);
  // ^ replaces the FIRST remaining unpatched site each pass (patched text no longer matches)
}
// placeStruct: hoist the two terms so the winner is nameable. Same values, same Math.max.
sgi = patch(sgi,
  '      var slot = claimCrew(el.resource);\n      var start = Math.max(geoGate(el), slot.time);',
  '      var slot = claimCrew(el.resource);\n' +
  '      _WHO = {}; var _vGeo = geoGate(el), _vCrew = slot.time;\n' +
  '      var start = Math.max(_vGeo, _vCrew);\n' +
  '      _ATTR[el.guid] = { gates: { geoGate: _vGeo, crew: _vCrew }, who: _WHO, start: start };');
// placeNonst: identical hoist. geoGate/wallGate are pure w.r.t. the grid between the two original
// calls (place() runs after), so reusing the cached values keeps _bmGatedB byte-identical.
sgi = patch(sgi,
  '      var bg = bandGate(el);\n' +
  '      var start = Math.max(geoGate(el), wallGate(el), hangGate(el), openingGate(el), tg, bg, slot.time);',
  '      var bg = bandGate(el);\n' +
  '      _WHO = {};\n' +
  '      var _vGeo = geoGate(el), _vWall = wallGate(el), _vHang = hangGate(el), _vOpen = openingGate(el);\n' +
  '      var start = Math.max(_vGeo, _vWall, _vHang, _vOpen, tg, bg, slot.time);\n' +
  '      _ATTR[el.guid] = { gates: { geoGate: _vGeo, wallGate: _vWall, hangGate: _vHang, openingGate: _vOpen,\n' +
  '        phaseTradeGate: tg, bandGate: bg, crew: slot.time }, who: _WHO, start: start };');
sgi = patch(sgi, 'if (bg > baseMs && bg >= Math.max(geoGate(el), wallGate(el), tg)) _bmGatedB++;',
  'if (bg > baseMs && bg >= Math.max(_vGeo, _vWall, tg)) _bmGatedB++;');

function loadInstrumentedGate() {
  const box = { console: { log: () => {}, warn: () => {} }, Math: Math, Object: Object, Infinity: Infinity,
    Uint8Array: Uint8Array, Int32Array: Int32Array, Array: Array, Number: Number, isFinite: isFinite,
    performance: { now: () => Date.now() }, module: { exports: {} } };
  box.window = box; box.globalThis = box;
  vm.createContext(box);
  vm.runInContext(sgi + '\nthis.__API = this.ScheduleGate;', box);
  return box;
}

// ══ 2. time_machine.js — slice the shipped push passes, then instrument their mutation points ══
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
// _midairRepair is defined TWICE (a known defect, see the prompts file). Declarations hoist, so the
// LAST one is what the browser runs — MR=1 is ship truth and the default.
const MR = parseInt(process.env.MR || '1', 10);

function instrumentTM(instrument) {
  const P = instrument ? patch : ((s) => s);
  let serialize = sliceFn(tmSrc, '_tier1Serialize');
  let regate = sliceFn(tmSrc, '_tierAuditRegate');
  let remap = sliceFn(tmSrc, '_twoTierRemap');
  let midair = sliceFn(tmSrc, '_midairRepair', MR);
  if (instrument) {
    // _tier1Serialize — the uniform per-zone/per-phase group shift
    serialize = P(serialize, 'if (d) { it.s += d; it.e += d; }',
      "if (d) { it.s += d; it.e += d; _TATTR(it, { st: 'T1SERIAL', zone: _zoneOf(it), ph: it.phase, d: d }); }");
    // _tierAuditRegate — seFor's winning support S, and the push that consumes it
    regate = P(regate, 'var se = 0, hasBearing = false, seen = {}, cs = cellsOf(T), p, c, k, arr, S;',
      'var se = 0, hasBearing = false, seen = {}, cs = cellsOf(T), p, c, k, arr, S; _SEWHO = null; _SEKIND = null;');
    regate = P(regate, 'hasBearing = true;\n              if (S.e > se) se = S.e;',
      "hasBearing = true;\n              if (S.e > se) { se = S.e; _SEWHO = S; _SEKIND = 'bearing'; }");
    regate = P(regate, 'hasHang = true;\n              if (S.e > se) se = S.e;',
      "hasHang = true;\n              if (S.e > se) { se = S.e; _SEWHO = S; _SEKIND = 'hang'; }");
    regate = P(regate, 'if (S.e > se) se = S.e; } } }',
      "if (S.e > se) { se = S.e; _SEWHO = S; _SEKIND = 'hangNearest'; } } } }");
    regate = P(regate, 'T.s = se; T.e = se + dur;',
      "T.s = se; T.e = se + dur;\n          _TATTR(T, { st: 'REGATE', kind: _SEKIND, src: _SEWHO && _SEWHO.guid,\n" +
      '            srcCls: _SEWHO && _SEWHO.cls, srcPhase: _SEWHO && _SEWHO.phase, sweep: sweeps });');
    // _twoTierRemap — the §TIER2_AFTER_TIER1 per-zone uniform shift
    remap = P(remap, 'if (d > 0) { it.s += d; it.e += d; if (d > tier2Shift) tier2Shift = d; }',
      "if (d > 0) { it.s += d; it.e += d; if (d > tier2Shift) tier2Shift = d;\n" +
      "        _TATTR(it, { st: 'TIER2SHIFT', zone: z, d: d }); }");
    // _midairRepair — which CONTACT supplied the first-appearance bar
    midair = P(midair, 'for (k = 0; k < list2.length; k++) { var s2 = items[list2[k]].s; if (s2 < first) first = s2; }',
      'var _mw = -1;\n        for (k = 0; k < list2.length; k++) { var s2 = items[list2[k]].s; if (s2 < first) { first = s2; _mw = list2[k]; } }');
    midair = P(midair, 'items[i].s += d; items[i].e += d;',
      "items[i].s += d; items[i].e += d;\n          _TATTR(items[i], { st: 'MIDAIR', src: _mw >= 0 && items[_mw].guid,\n" +
      "            srcCls: _mw >= 0 && items[_mw].cls, srcPhase: _mw >= 0 && items[_mw].phase, sweep: stats.sweeps });");
  }
  const zoneParts = [sliceFn(tmSrc, '_zoneIndexBuild'), sliceFn(tmSrc, '_zoneIndex')].filter(Boolean);
  return ["var _TIER1_ORDER = ['Substructure', 'Superstructure', 'Architecture'];",
    'var _SEWHO = null, _SEKIND = null;',
    (zoneParts.length === 2 ? 'var _zoneMemo = [];' : ''), zoneParts[0] || '', zoneParts[1] || '',
    sliceFn(tmSrc, '_zoneOf') || '',
    sliceFn(tmSrc, '_promoteRoofLoadPath'), sliceFn(tmSrc, '_buildXrayElements'),
    sliceFn(tmSrc, '_tier1Extents'), serialize, sliceFn(tmSrc, '_tier1Protrusion'), regate,
    remap, sliceFn(tmSrc, '_contactGraph'), sliceFn(tmSrc, '_midairAudit'), midair].join('\n');
}

function loadRatesTable() {
  const txt = fs.readFileSync(path.join(VIEWER_DIR, 'rates.js'), 'utf8');
  const start = txt.indexOf('var RATES = {');
  const defIdx = txt.indexOf('var SEQUENCE_DEFAULT');
  return (new Function(txt.slice(start, txt.indexOf('};', defIdx) + 2) + '\n return RATES;'))();
}

const BLD_DIR = process.env.BLD_DIR || path.join(HOME, 'bim-ootb', 'buildings');
const DB_FILE = { LTU_AHouse: 'LTU_AHouse_meta.db' };
const BUILDINGS = (process.env.ONLY || 'LTU_AHouse,Hospital,Clinic').split(',');
const PH_ORDER = ['Substructure', 'Superstructure', 'Architecture', 'MEP Rough-in', 'MEP Final', 'Finishes'];
const TOPN = parseInt(process.env.TOPN || '8', 10);

(async () => {
  const SQL = await initSqlJs({ wasmBinary: fs.readFileSync(path.join(SQLJS_DIR, 'sql-wasm.wasm')) });
  const rulesJson = JSON.parse(fs.readFileSync(path.join(VIEWER_DIR, 'rates', 'sequence_rules.json'), 'utf8'));
  const SR = rulesJson.SEQUENCE_RULES, SD = rulesJson.SEQUENCE_DEFAULT, LR = rulesJson.LABOR_RATES;
  const NO = rulesJson.NAME_OVERRIDES || [];
  const RATES = loadRatesTable();
  console.log('§TAIL_PROBE viewer=' + VIEWER_DIR + ' midairRepairCopy=' + MR +
    ' patches=' + _patchN + ' selfcheck=' + SELFCHECK);

  for (const bld of BUILDINGS) {
    const dbPath = path.join(BLD_DIR, DB_FILE[bld] || (bld + '_extracted.db'));
    if (!fs.existsSync(dbPath)) { console.log('§TAIL ' + bld + ' fixture missing: ' + dbPath); continue; }
    const db = new SQL.Database(fs.readFileSync(dbPath));

    // ── element build: the shipped _buildXrayElements + ScheduleAuthor classification ──────────
    const tmBox = { console: { log: () => {}, warn: () => {} }, performance: { now: () => Date.now() },
      window: { SEQUENCE_RULES: SR, SEQUENCE_DEFAULT: SD, SEQUENCE_NAME_OVERRIDES: NO },
      ScheduleGate: ScheduleGatePlain, Math: Math, RegExp: RegExp, Object: Object, Infinity: Infinity,
      Uint8Array: Uint8Array, Int32Array: Int32Array, Array: Array, Number: Number, isFinite: isFinite,
      A: () => ({ db: db, activeBuilding: bld, _metaGen: 0 }) };
    // attribution sink — a real function in the sandbox, keyed by guid, last-writer-wins + history
    const TATTR = {};
    tmBox._TATTR = (it, rec) => {
      const h = TATTR[it.guid] || (TATTR[it.guid] = []);
      if (h.length < 40) h.push(rec); else h[39] = rec;   // bounded; the LAST record is what matters
    };
    vm.createContext(tmBox);
    vm.runInContext(instrumentTM(true) +
      '\nthis.__bxe = _buildXrayElements; this.__ser = _tier1Serialize; this.__remap = _twoTierRemap; this.__repair = _midairRepair;', tmBox);
    const els = tmBox.__bxe();
    if (!els || !els.length) { console.log('§TAIL ' + bld + ' element build produced nothing'); db.close(); continue; }

    const nameOf = {};
    const nr = db.exec("SELECT guid, ifc_class, COALESCE(element_name,'') FROM elements_meta");
    if (nr.length) nr[0].values.forEach(v => { nameOf[v[0]] = v[2]; });

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

    // §CREW_AUTOSCALE — mirrors injectGantt exactly (same as probe_arch_start.js)
    const crewWorkDays = {};
    let totSecs = 0;
    geoEls.forEach(e => { const r = e.resource || '_DEFAULT';
      crewWorkDays[r] = (crewWorkDays[r] || 0) + (e.installSecs || 0) / 28800; totSecs += e.installSecs || 0; });
    const projDays = Math.max(10, Math.ceil(totSecs * 1000 / D));
    const maxCrews = {};
    for (const rk in LR) {
      if (!LR[rk].max_crews && LR[rk].max_crews_fixed == null) continue;
      const base = LR[rk].max_crews || 0;
      maxCrews[rk] = (LR[rk].max_crews_fixed != null) ? LR[rk].max_crews_fixed
        : Math.max(base, Math.ceil((crewWorkDays[rk] || 0) / projDays));
    }

    // ── RAW generative, through the INSTRUMENTED gate module ──────────────────────────────────
    const sgBox = loadInstrumentedGate();
    const SGi = sgBox.__API;
    const sched = SGi.computeSchedule(geoEls, 0, 1, maxCrews);
    const RAWATTR = sgBox.__SG_ATTR;

    if (SELFCHECK) {   // the instrumentation must be INERT — prove it, don't assert it
      const schedPlain = ScheduleGatePlain.computeSchedule(geoEls.map(e => Object.assign({}, e)), 0, 1, maxCrews);
      let diff = 0;
      geoEls.forEach(e => { if (sched[e.guid].start !== schedPlain[e.guid].start ||
        sched[e.guid].end !== schedPlain[e.guid].end) diff++; });
      console.log('  §TAIL_SELF ' + bld + ' rawStartMismatch=' + diff + '/' + geoEls.length +
        ' (0 = instrumented gates identical to shipped)');
    }

    const items = geoEls.map(e => ({ guid: e.guid, s: sched[e.guid].start, e: sched[e.guid].end,
      rawS: sched[e.guid].start, rawE: sched[e.guid].end,
      bz: e.base_z, tz: e.top_z, x0: e.x0, x1: e.x1, y0: e.y0, y1: e.y1,
      cls: e.cls, seq: e.seq, phase: e.phase, storey: e.storey }));
    const byGuid = {}; items.forEach(it => { byGuid[it.guid] = it; });
    const base = Math.min.apply(null, items.map(i => i.rawS));

    tmBox.__items = items;
    vm.runInContext('this.__remap(this.__items);', tmBox);
    const remapS = {}; items.forEach(it => { remapS[it.guid] = it.s; });
    vm.runInContext('this.__repair(this.__items);', tmBox);

    if (SELFCHECK) {   // the push passes must be inert too — same run, uninstrumented slices
      const plainBox = Object.assign({}, tmBox);
      plainBox.console = { log: () => {}, warn: () => {} };
      vm.createContext(plainBox);
      vm.runInContext(instrumentTM(false) +
        '\nthis.__remap2 = _twoTierRemap; this.__repair2 = _midairRepair;', plainBox);
      const pItems = geoEls.map(e => ({ guid: e.guid, s: sched[e.guid].start, e: sched[e.guid].end,
        bz: e.base_z, tz: e.top_z, x0: e.x0, x1: e.x1, y0: e.y0, y1: e.y1,
        cls: e.cls, seq: e.seq, phase: e.phase, storey: e.storey }));
      plainBox.__p = pItems;
      vm.runInContext('this.__remap2(this.__p); this.__repair2(this.__p);', plainBox);
      let pd = 0;
      pItems.forEach((p, i) => { if (p.s !== items[i].s || p.e !== items[i].e) pd++; });
      console.log('  §TAIL_SELF ' + bld + ' pushPassMismatch=' + pd + '/' + items.length +
        ' (0 = instrumented push passes identical to shipped)');
    }

    // ── the tail, defined EXACTLY as §DAY_GAP_TAIL_WHO defines it ─────────────────────────────
    const phases = {};
    items.forEach(it => { (phases[it.phase] || (phases[it.phase] = [])).push(it); });
    let worst = null;
    Object.keys(phases).forEach(ph => {
      const set = phases[ph];
      if (set.length < 50) return;
      const ss = set.map(i => i.s).sort((a, b) => a - b);
      const p95 = ss[Math.floor(ss.length * 0.95)];
      const e1 = Math.max.apply(null, set.map(i => i.e));
      const tailDays = (e1 - p95) / D, tailN = set.filter(i => i.s > p95).length;
      if (!worst || tailDays > worst.tailDays) worst = { ph, set, p95, e1, tailDays, tailN };
    });
    if (!worst) { console.log('§TAIL ' + bld + ' no phase >=50 elements'); continue; }
    // ALL phases, not just the worst — otherwise a before/after comparison silently changes subject
    // when the worst-phase LABEL moves (measured: Hospital's worst went MEP Rough-in → Architecture
    // across one change, which reads as a regression until every phase is on the page).
    console.log('  §TAIL_ALLPH ' + bld + ' ' + Object.keys(phases).sort((a, b) => {
      const ia = PH_ORDER.indexOf(a), ib = PH_ORDER.indexOf(b);
      return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
    }).map(ph => {
      const set = phases[ph]; if (set.length < 50) return null;
      const ss = set.map(i => i.s).sort((a, b) => a - b);
      const p95 = ss[Math.floor(ss.length * 0.95)];
      const e1 = Math.max.apply(null, set.map(i => i.e));
      return ph.slice(0, 6) + '=' + set.filter(i => i.s > p95).length + '/' + set.length +
        '@' + ((e1 - p95) / D).toFixed(1) + 'd';
    }).filter(Boolean).join(' '));
    const tail = worst.set.filter(i => i.s > worst.p95).sort((a, b) => b.s - a.s);
    console.log('\n════ ' + bld + '  worstPhase=' + worst.ph +
      '  §TAIL_EDGE tail=' + worst.tailN + '/' + worst.set.length +
      ' spanning ' + worst.tailDays.toFixed(1) + 'd past its 95% mark (day ' +
      ((worst.p95 - base) / D).toFixed(1) + ') latestStart=day' +
      ((tail[0].s - base) / D).toFixed(1) + '/' + tail[0].cls);

    // ── attribution: the LAST stage that moved each straggler, and its edge ───────────────────
    function finalOf(it) {
      const h = TATTR[it.guid];
      if (h && h.length) return h[h.length - 1];
      const a = RAWATTR[it.guid];
      if (!a) return { st: 'RAW', gate: 'unattributed' };
      let bestGate = null, bestV = -1;
      for (const g in a.gates) if (a.gates[g] >= bestV && a.gates[g] === a.start) { bestGate = g; bestV = a.gates[g]; }
      if (!bestGate) { bestGate = 'crew'; }   // start above every gate ⇒ the crew slot set it
      const whoKey = { geoGate: 'geo', hangGate: 'hang', wallGate: 'wall', openingGate: 'open' }[bestGate];
      let src = a.who[whoKey];
      if (bestGate === 'hangGate' && !src) src = a.who.hangNear;
      return { st: 'RAW', gate: bestGate, src: src, srcCls: src && byGuid[src] && byGuid[src].cls,
        srcPhase: src && byGuid[src] && byGuid[src].phase };
    }
    const attrHist = {}, srcHist = {};
    tail.forEach(it => {
      const f = finalOf(it);
      const key = f.st + (f.gate ? ':' + f.gate : '') + (f.kind ? ':' + f.kind : '');
      attrHist[key] = (attrHist[key] || 0) + 1;
      if (f.src) {
        const s = srcHist[f.src] || (srcHist[f.src] = { n: 0, cls: f.srcCls, ph: f.srcPhase, via: {} });
        s.n++; s.via[key] = (s.via[key] || 0) + 1;
      }
    });
    console.log('  §TAIL_ATTR ' + bld + ' finalMover: ' + Object.keys(attrHist)
      .sort((a, b) => attrHist[b] - attrHist[a])
      .map(k => k + '=' + attrHist[k] + '(' + (100 * attrHist[k] / tail.length).toFixed(0) + '%)').join(' '));

    const srcKeys = Object.keys(srcHist).sort((a, b) => srcHist[b].n - srcHist[a].n);
    console.log('  §TAIL_SRC ' + bld + ' distinctDrivers=' + srcKeys.length + '/' + tail.length +
      ' top' + TOPN + ': ' + (srcKeys.length ? srcKeys.slice(0, TOPN).map(g => {
        const s = srcHist[g], d = byGuid[g];
        return g.slice(0, 10) + '×' + s.n + '[' + (s.cls || '?') + '/' + (s.ph || '?') +
          (d ? '/start=day' + ((d.s - base) / D).toFixed(1) + '/end=day' + ((d.e - base) / D).toFixed(1) +
               '/bz' + d.bz.toFixed(1) : '') + ']';
      }).join(' ') : 'none — no edge-bearing stage set any straggler\'s final start'));

    // ── §TAIL_MIDAIR — the WHOLE-MODEL population of the pattern the tail exposed ─────────────
    // The support POOL is not invented here: it is the identical membership test structGrid +
    // wallGrid use in _tierAuditRegate (seq<=4 ∪ promoted IfcSlab ∪ IfcWall*), which is itself the
    // mirror of schedule_gate.js's grid/wallGrid. Question asked: does _midairRepair ever gate a
    // POOL member (real structure) on a NON-POOL element (MEP/fixture/furniture)?
    const isPool = (it) => !!it && (it.seq <= 4 || (it.cls === 'IfcSlab' && it.seq > 4) || it.cls.indexOf('IfcWall') === 0);
    const EPSg = ScheduleGatePlain.EPS, GAPg = ScheduleGatePlain.GAP;
    const clauseOf = (T, S) => {
      if (!T || !S) return '?';
      if (S.bz < T.bz - EPSg && S.tz >= T.bz - GAPg) return 'bearingBelow';
      if (S.bz >= T.tz - GAPg && S.tz > T.tz + EPSg) return 'carrierAbove';
      if (S.bz <= T.bz + EPSg && S.tz >= T.tz - EPSg) return 'embedded';
      return 'none';
    };
    const mx = { n: 0, poolOnNonpool: 0, days: 0, maxDays: 0, byPair: {}, byClause: {}, worst: null };
    items.forEach(it => {
      const h = TATTR[it.guid]; if (!h) return;
      const last = h[h.length - 1];
      if (last.st !== 'MIDAIR' || !last.src) return;
      mx.n++;
      const src = byGuid[last.src];
      if (isPool(it) && !isPool(src)) {
        mx.poolOnNonpool++;
        const moved = (it.s - it.rawS) / D;
        mx.days += moved;
        if (moved > mx.maxDays) { mx.maxDays = moved; mx.worst = { it, src, moved }; }
        const pk = it.cls + '←' + src.cls;
        mx.byPair[pk] = (mx.byPair[pk] || 0) + 1;
        const ck = clauseOf(it, src);
        mx.byClause[ck] = (mx.byClause[ck] || 0) + 1;
      }
    });
    console.log('  §TAIL_MIDAIR ' + bld + ' finalMoverIsMidair=' + mx.n + '/' + items.length +
      ' ofWhich POOL-gated-on-NONPOOL=' + mx.poolOnNonpool +
      ' (real structure told to wait for an MEP/fixture element it merely touches)' +
      ' totalDaysMoved=' + mx.days.toFixed(0) + ' maxDays=' + mx.maxDays.toFixed(1) +
      ' clause=' + JSON.stringify(mx.byClause) +
      ' topPairs=' + Object.keys(mx.byPair).sort((a, b) => mx.byPair[b] - mx.byPair[a]).slice(0, 6)
        .map(k => k + '×' + mx.byPair[k]).join(' '));

    // ── §TAIL_CONTACTS — the decisive discriminator: does a dragged structural element have ANY
    // support-pool contact at all, or ONLY non-pool ones? ─────────────────────────────────────
    // If it has pool contacts, pool-scoping the repair just re-picks the argmin and the element
    // stays gated on real structure (no new midair). If it has NONE, pool-scoping makes it an
    // ORPHAN — left at its generative start — and W-MZ-2's pool-blind census would call that
    // "hanging". That is the difference between a safe fix and a contract collision, so it is
    // measured, not assumed. Uses the SHIPPED _contactGraph, unmodified.
    tmBox.__cgItems = items;
    vm.runInContext('this.__cg = _contactGraph(this.__cgItems);', tmBox);
    const CG = tmBox.__cg;
    if (CG && CG.ok) {
      const cls2 = { poolOnly: 0, nonpoolOnly: 0, mixed: 0, none: 0 };
      const victims = items.filter(it => {
        const h = TATTR[it.guid]; if (!h) return false;
        const last = h[h.length - 1];
        return last.st === 'MIDAIR' && last.src && isPool(it) && !isPool(byGuid[last.src]);
      });
      victims.forEach(it => {
        const i = items.indexOf(it), list = CG.contacts[i];
        let p = 0, np = 0;
        if (list) list.forEach(j => { if (isPool(items[j])) p++; else np++; });
        cls2[!list ? 'none' : (p && np ? 'mixed' : (p ? 'poolOnly' : 'nonpoolOnly'))]++;
      });
      // WHAT are the nonpoolOnly ones? If they are degenerate/zero-volume bboxes they are already
      // the documented "extraction limit" population (_midairRepair's own orphans counter), and
      // delaying them does not make them supported — it only makes them appear late.
      const npo = victims.filter(it => {
        const list = CG.contacts[items.indexOf(it)];
        return list && !list.some(j => isPool(items[j]));
      });
      const degen = npo.filter(it => (it.x1 - it.x0) < 0.01 || (it.y1 - it.y0) < 0.01 || (it.tz - it.bz) < 0.01);
      const clsH = {}; npo.forEach(it => { clsH[it.cls] = (clsH[it.cls] || 0) + 1; });
      const vols = npo.map(it => (it.x1 - it.x0) * (it.y1 - it.y0) * (it.tz - it.bz)).sort((a, b) => a - b);
      console.log('  §TAIL_ORPHANRISK ' + bld + ' nonpoolOnly=' + npo.length +
        ' ofWhich degenerateBBox(any dim <1cm)=' + degen.length +
        ' bboxVol p50=' + (vols.length ? vols[Math.floor(vols.length / 2)].toFixed(3) : '-') +
        'm3 max=' + (vols.length ? vols[vols.length - 1].toFixed(3) : '-') + 'm3' +
        ' classes=' + JSON.stringify(clsH) +
        ' medianDelay=' + (npo.length ? (npo.map(it => (it.s - it.rawS) / D).sort((a, b) => a - b)[Math.floor(npo.length / 2)]).toFixed(1) : '-') + 'd');
      console.log('  §TAIL_CONTACTS ' + bld + ' poolVictims=' + victims.length +
        ' contactMix: mixed(has pool contacts too)=' + cls2.mixed +
        ' nonpoolOnly(pool-scoping ⇒ NEW orphan)=' + cls2.nonpoolOnly +
        ' poolOnly=' + cls2.poolOnly + ' none=' + cls2.none);
      // the named worst case, with the geometry that produced the edge
      if (victims.length) {
        const v = victims.slice().sort((a, b) => (b.s - b.rawS) - (a.s - a.rawS))[0];
        const vi = items.indexOf(v), vlist = CG.contacts[vi] || [];
        const pooled = vlist.filter(j => isPool(items[j])).map(j => items[j]).sort((a, b) => a.s - b.s);
        const bx = (e) => '[' + (e.x1 - e.x0).toFixed(1) + '×' + (e.y1 - e.y0).toFixed(1) + '×' + (e.tz - e.bz).toFixed(1) + 'm bz' + e.bz.toFixed(2) + '..' + e.tz.toFixed(2) + ']';
        const last = TATTR[v.guid][TATTR[v.guid].length - 1];
        const S = byGuid[last.src];
        console.log('  §TAIL_WORSTEDGE ' + bld + ' ' + v.guid.slice(0, 12) + ' ' + v.cls + '/' + v.phase +
          ' ' + bx(v) + ' moved +' + ((v.s - v.rawS) / D).toFixed(1) + 'd' +
          '\n      driver ' + String(last.src).slice(0, 12) + ' ' + S.cls + '/' + S.phase + ' ' + bx(S) +
          ' clause=' + clauseOf(v, S) + ' start=day' + ((S.s - base) / D).toFixed(1) +
          '\n      contacts=' + vlist.length + ' poolContacts=' + pooled.length +
          (pooled.length ? ' earliestPoolContact=' + pooled[0].cls + '/' + pooled[0].phase +
            '@day' + ((pooled[0].s - base) / D).toFixed(1) + ' ' + bx(pooled[0]) : ' — NO structural contact at all'));
      }
    }

    // ── the full chain for the worst offenders — the named element, stage by stage ────────────
    tail.slice(0, Math.min(3, tail.length)).forEach((it, rank) => {
      const h = TATTR[it.guid] || [];
      const raw = RAWATTR[it.guid];
      const gateStr = raw ? Object.keys(raw.gates).filter(g => raw.gates[g] > 0)
        .map(g => g + '=day' + ((raw.gates[g] - base) / D).toFixed(1)).join(',') || 'allZero' : 'none';
      console.log('  §TAIL_CHAIN ' + bld + ' #' + (rank + 1) + ' ' + it.guid.slice(0, 12) + ' ' + it.cls +
        '/' + it.phase + '/zone=' + (it.storey || '_ALL') + ' bz=' + it.bz.toFixed(2) +
        ' rawStart=day' + ((it.rawS - base) / D).toFixed(1) +
        ' afterRemap=day' + ((remapS[it.guid] - base) / D).toFixed(1) +
        ' FINAL=day' + ((it.s - base) / D).toFixed(1) +
        '\n      rawGates: ' + gateStr +
        '\n      pushes(' + h.length + '): ' + (h.length ? h.map(r => r.st +
          (r.kind ? '/' + r.kind : '') + (r.zone ? '/' + r.zone : '') +
          (r.d != null ? '/+' + (r.d / D).toFixed(1) + 'd' : '') +
          (r.src ? '/from ' + String(r.src).slice(0, 10) + '(' + r.srcCls + '/' + r.srcPhase +
            (byGuid[r.src] ? ',end=day' + ((byGuid[r.src].e - base) / D).toFixed(1) : '') + ')' : '')
        ).join(' → ') : 'none — the RAW generative gate is its final start'));
    });
  }
})();
