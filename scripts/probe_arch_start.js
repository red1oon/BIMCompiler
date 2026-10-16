#!/usr/bin/env node
// probe_arch_start.js — STUDY ONLY, no fix (2026-08-12, bim-compiler
// prompts/4D_SCHEDULE_PERFECTION.md; user: "the ARCH starting first day part is too fast").
//
// ISSUE this probe exposes: on the DISPLAY timeline the movie actually plays (the shipped
// _twoTierRemap + _midairRepair output that kernel_ops is written from), WHEN does each phase
// first appear, and how much of the building lands in the opening slice of the film.
// If a large share of elements — in particular Architecture (ARCH) — starts at day ~0, the film's
// first day is doing work that a real programme spreads over months, which is what "too fast"
// looks like on screen.
//
// Reported per building, every number derived, none assumed:
//   §ARCH_PHASE   per phase: first start day, last end day, element count, at RAW / REMAP / REPAIR
//   §ARCH_FRONT   share of elements whose START lands in the first 1d / 1% / 5% / 10% of the span
//   §ARCH_D1      what actually starts on day <=1, by phase and class
//   §ARCH_AUTH    §PHASE_OVERLAP_BAND authored bar start day per phase (planner-facing artefact)
//   §ARCH_TIME    wall-clock ms per generation stage (observation only — perf lane is elsewhere)
//
// ⚠ §SERVED_BYTES (2026-08-13) — WHICH .db YOU POINT THIS AT IS PART OF THE MEASUREMENT.
// `~/bim-ootb/buildings/Hospital_extracted.db` (264,642,560 B, Aug 3) is NOT the object the viewer
// loads. The live viewer fetches the OCI-served copy (263,307,264 B, Jun 5). They are the same
// model — identical class histogram, identical 63,182 scheduled elements, identical
// totSecs=92,135,244, ZERO numerically-differing element_transforms rows — but the local file is a
// NEWER RE-EXTRACTION with a finer storey taxonomy: 21 storey names ("Level 3 TOS", "Level 1
// Ceiling", …) against the served copy's 9 ("Level 1".."Level 7A"), differing on 7,365 elements.
// `storey` IS the zone key (_zoneOf), and §TIER_SERIAL_BY_ZONE serializes per zone, so the whole
// remap changes: Hospital totalDays 1926.4 (local) vs 2014.7 (served) — 4.6% on the taxonomy alone,
// with every other input byte-identical. The live browser at the same commit printed 2019.6; the
// remaining 0.24% is its IndexedDB holding a slightly older vintage of the same object (raw server
// bytes are cached at first load and never content-revalidated — §PATCH-SELFHEAL).
// So: MEASURE AGAINST THE SERVED BYTES when comparing to anything a user saw, and never treat a
// local-vs-browser span difference as a code defect before checking the two DBs are the same object.
// Corollary worth its own line: re-extracting a building silently re-dates its whole schedule.
//
// Command (from bim-compiler/):
//   VIEWER_DIR=~/bim-ootb/viewer BLD_DIR=~/bim-ootb/buildings node scripts/probe_arch_start.js
// To measure a specific revision rather than the working tree, export it first:
//   mkdir -p /tmp/vw && cd ~/bim-ootb && for f in schedule_gate.js schedule_author.js \
//     time_machine.js rates.js; do git show origin/main:viewer/$f > /tmp/vw/$f; done && \
//     mkdir -p /tmp/vw/rates && git show origin/main:viewer/rates/sequence_rules.json > /tmp/vw/rates/
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
// NOTE: time_machine.js at origin/main add18e5 defines _midairRepair TWICE (:4248 and :4391).
// JS function declarations hoist, so the LAST one wins at runtime — the browser runs #1.
// MR env selects which copy this probe runs: 0 = first (what the witnesses slice), 1 = last
// (what the browser executes). Default 1 = ship truth.
const MR = parseInt(process.env.MR || '1', 10);
const tierOrderLine = "var _TIER1_ORDER = ['Substructure', 'Superstructure', 'Architecture'];";
// §ZONE_INDEX (bim-ootb #1313): _buildXrayElements now reads the shared memoized zone index, so
// the probe must slice it too. sliceFn returns null on an older tmSrc that predates it, and
// filter(Boolean) below drops it — so this file still measures pre-#1313 revisions unchanged.
const zoneParts = [sliceFn(tmSrc, '_zoneIndexBuild'), sliceFn(tmSrc, '_zoneIndex')].filter(Boolean);
// §TIER_SERIAL_BY_ZONE's zone key helper — optional the same way, so pre-change revisions still run.
const zoneOfPart = sliceFn(tmSrc, '_zoneOf') || '';
const sliced = [tierOrderLine,
  (zoneParts.length === 2 ? 'var _zoneMemo = [];' : ''), zoneParts[0] || '', zoneParts[1] || '',
  zoneOfPart,
  sliceFn(tmSrc, '_promoteRoofLoadPath'), sliceFn(tmSrc, '_buildXrayElements'),
  sliceFn(tmSrc, '_tier1Extents'), sliceFn(tmSrc, '_tier1Serialize'),
  sliceFn(tmSrc, '_tier1Protrusion'), sliceFn(tmSrc, '_tierAuditRegate'),
  sliceFn(tmSrc, '_twoTierRemap'), sliceFn(tmSrc, '_contactGraph'),
  sliceFn(tmSrc, '_midairAudit'), sliceFn(tmSrc, '_midairRepair', MR)].join('\n');

// ══ §RULES_TABLE_SOURCE (2026-08-13, bim-compiler prompts/4D_SCHEDULE_PERFECTION.md) ═══════════
// THIS PROBE WAS MEASURING A TABLE THE VIEWER NEVER LOADS, and every §-number it produced since it
// was written inherited the error. It read rates/sequence_rules.json for SEQUENCE_RULES /
// LABOR_RATES / SEQUENCE_DEFAULT / NAME_OVERRIDES. viewer/rates.js:239 states the opposite, in the
// shipped source, in its own words: "viewer.html does NOT call initRateTemplate()/
// loadSequenceRules() (only mep_report.html/boq_charts.html do), so this hardcoded copy, NOT the
// JSON, is what actually runs in the main viewer/Time Machine/Author wizard." Confirmed by grep:
// nothing on the viewer's load path calls loadSequenceRules().
//
// The two sources HAVE DRIFTED, so this was not a harmless equivalence. MEASURED, Hospital:
//   LABOR_RATES.ELECTRICIAN.productivity — rates.js 15 class keys, JSON 8. The JSON is missing
//   IfcSwitchingDevice, IfcSensor, IfcActuator, IfcFlowInstrument, IfcDistributionControlElement,
//   IfcProtectiveDeviceTrippingUnit, IfcUnitaryControlElement (all productivity 10). Those classes
//   therefore fell through to _installSecs' no-match default in every probe/witness run, and
//   carried their real 2880 s in the browser.
//   Hospital displaySpan 1889.4d (JSON) -> 1926.4d (ship tables); MEP Final occupancy 14.1% ->
//   21.0%; §HOSTED_BEFORE_HOST hostFixed 80, openFixed 14.
// SEQUENCE_RULES (58 keys), SEQUENCE_DEFAULT and NAME_OVERRIDES are value-identical between the two
// (NAME_OVERRIDES differ only in a `reason` prose field) — ELECTRICIAN is the whole measured drift.
// RULES=json reverts to the old reading for an A/B against numbers recorded before this date.
function loadShipTables() {
  const txt = fs.readFileSync(path.join(VIEWER_DIR, 'rates.js'), 'utf8');
  // Brace/bracket-matched extraction of one top-level `var NAME = {...}` / `[...]` literal. The old
  // single-slice trick (RATES..first '};' after SEQUENCE_DEFAULT) only ever worked because those
  // three happen to be adjacent; matching properly lets NAME_OVERRIDES come from the same file.
  const blk = (name, open) => {
    const i = txt.indexOf('var ' + name + ' = ' + open);
    if (i < 0) throw new Error('rates.js: ' + name + ' not found');
    const close = open === '[' ? ']' : '}';
    let d = 0, j = i, seen = false;
    for (; j < txt.length; j++) {
      if (txt[j] === open) { d++; seen = true; }
      else if (txt[j] === close) { d--; if (seen && d === 0) break; }
    }
    return txt.slice(i, j + 1);
  };
  // §SHIFT_HOURS (2026-08-13): a plain scalar, not brace/bracket-matched like the tables above.
  const shiftM = txt.match(/var SHIFT_HOURS = (\d+(\.\d+)?);/);
  const shiftHours = shiftM ? Number(shiftM[1]) : 24;
  return (new Function([blk('RATES', '{'), blk('SEQUENCE_RULES', '{'), blk('LABOR_RATES', '{'),
    blk('SEQUENCE_DEFAULT', '{'), blk('SEQUENCE_NAME_OVERRIDES', '[')].join(';\n') +
    ';\n return { RATES: RATES, SR: SEQUENCE_RULES, LR: LABOR_RATES,' +
    ' SD: SEQUENCE_DEFAULT, NO: SEQUENCE_NAME_OVERRIDES, SHIFT_HOURS: ' + shiftHours + ' };'))();
}

const BLD_DIR = process.env.BLD_DIR || path.join(HOME, 'bim-ootb', 'buildings');
const DB_FILE = { LTU_AHouse: 'LTU_AHouse_meta.db' };
const BUILDINGS = (process.env.ONLY || 'Terminal,Hospital,Duplex,HHS_Office_Federated,Clinic,LTU_AHouse,JKR').split(',');
const D = 86400000;
const now = () => Number(process.hrtime.bigint() / 1000000n);

function extents(items, key) {
  const ext = {};
  items.forEach(it => {
    const x = ext[it.phase] || (ext[it.phase] = { minS: Infinity, maxE: -Infinity, n: 0 });
    if (it[key.s] < x.minS) x.minS = it[key.s];
    if (it[key.e] > x.maxE) x.maxE = it[key.e];
    x.n++;
  });
  return ext;
}
const PH_ORDER = ['Substructure', 'Superstructure', 'Architecture', 'MEP Rough-in', 'MEP Final', 'Finishes'];
function fmtExt(ext, base) {
  return Object.keys(ext).sort((a, b) => {
    const ia = PH_ORDER.indexOf(a), ib = PH_ORDER.indexOf(b);
    return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
  }).map(ph => ph + '=[' + ((ext[ph].minS - base) / D).toFixed(1) + '..' +
    ((ext[ph].maxE - base) / D).toFixed(1) + ']d n=' + ext[ph].n).join(' ');
}

(async () => {
  const SQL = await initSqlJs({ wasmBinary: fs.readFileSync(path.join(SQLJS_DIR, 'sql-wasm.wasm')) });
  // §RULES_TABLE_SOURCE — ship reads rates.js's hardcoded tables, not the JSON. See loadShipTables().
  const _ship = loadShipTables();
  const _json = (() => { try {
    return JSON.parse(fs.readFileSync(path.join(VIEWER_DIR, 'rates', 'sequence_rules.json'), 'utf8'));
  } catch (e) { return null; } })();
  const _useJson = process.env.RULES === 'json' && _json;
  const SR = _useJson ? _json.SEQUENCE_RULES : _ship.SR;
  const SD = _useJson ? _json.SEQUENCE_DEFAULT : _ship.SD;
  const LR = _useJson ? _json.LABOR_RATES : _ship.LR;
  const NO = _useJson ? (_json.NAME_OVERRIDES || []) : _ship.NO;
  const RATES = _ship.RATES;
  console.log('§RULES_TABLE_SOURCE ' + (_useJson ? 'rates/sequence_rules.json (A/B ONLY — NOT what the viewer runs)'
    : 'viewer/rates.js hardcoded (what viewer.html actually runs — rates.js:239)') +
    ' rules=' + Object.keys(SR).length + ' labor=' + Object.keys(LR).length +
    ' nameOverrides=' + NO.length +
    ' electricianProductivityKeys=' + Object.keys((LR.ELECTRICIAN || {}).productivity || {}).length);
  console.log('§ARCH_PROBE midairRepairCopy=' + MR + ' (0=first def / witness-sliced, 1=last def / browser-executed)');

  for (const bld of BUILDINGS) {
    const dbPath = path.join(BLD_DIR, DB_FILE[bld] || (bld + '_extracted.db'));
    if (!fs.existsSync(dbPath)) { console.log('§ARCH ' + bld + ' fixture missing: ' + dbPath); continue; }
    const t = {};
    let t0 = now();
    const db = new SQL.Database(fs.readFileSync(dbPath));
    t.dbOpen = now() - t0;
    const sandbox = { console: { log: () => {}, warn: () => {} }, performance: { now: () => Date.now() },
      window: { SEQUENCE_RULES: SR, SEQUENCE_DEFAULT: SD, SEQUENCE_NAME_OVERRIDES: NO },
      ScheduleGate: ScheduleGate, Math: Math, RegExp: RegExp, Object: Object, Infinity: Infinity,
      A: () => ({ db: db, activeBuilding: bld, _metaGen: 0 }) };
    vm.createContext(sandbox);
    vm.runInContext(sliced + '\nthis.__bxe = _buildXrayElements; this.__remap = _twoTierRemap; this.__repair = _midairRepair;', sandbox);
    t0 = now();
    const els = sandbox.__bxe();
    t.xray = now() - t0;
    if (!els || !els.length) { console.log('§ARCH ' + bld + ' element build produced nothing'); db.close(); continue; }

    const nameOf = {};
    const nr = db.exec("SELECT guid, ifc_class, COALESCE(element_name,'') FROM elements_meta");
    if (nr.length) nr[0].values.forEach(v => { nameOf[v[0]] = v[2]; });

    t0 = now();
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
    t.classify = now() - t0;

    // ── authored bars (planner-facing): capture §PHASE_OVERLAP_BAND / §PHASE_DURATION lines ──
    const authLines = [];
    const realLog = console.log;
    t0 = now();
    try {
      console.log = (...a) => { const s = a.join(' '); if (/^§PHASE_(OVERLAP_BAND|DURATION)/.test(s)) authLines.push(s); };
      global.SEQUENCE_RULES = SR; global.SEQUENCE_DEFAULT = SD; global.LABOR_RATES = LR;
      global.SEQUENCE_NAME_OVERRIDES = NO; global.RATES = RATES;
      ScheduleAuthor.materializeDefault(db, SR, { laborRates: LR, rates: RATES, nameOverrides: NO, defaultRule: SD });
    } catch (err) { console.log = realLog; console.log('  §ARCH_AUTH ' + bld + ' materializeDefault threw: ' + err.message); }
    console.log = realLog;
    t.authored = now() - t0;
    db.close();

    // §CREW_AUTOSCALE (bim-ootb, injectGantt): mirrors the shipped formula so this probe measures
    // the SAME schedule the viewer generates. crews(T) = max(base, ceil(workDays(T)/projectDays)),
    // workDays from installSecs/28800, projectDays from the existing §4D length. CREWS=base env
    // reverts to the pre-autoscale table for an A/B.
    const crewWorkDays = {};
    geoEls.forEach(e => { const r = e.resource || '_DEFAULT';
      crewWorkDays[r] = (crewWorkDays[r] || 0) + (e.installSecs || 0) / 28800; });
    let totSecs = 0; geoEls.forEach(e => { totSecs += e.installSecs || 0; });
    const projDays = Math.max(10, Math.ceil(totSecs * 1000 / 86400000));
    const maxCrews = {}, crewNote = [];
    for (const rk in LR) {
      if (!LR[rk].max_crews && LR[rk].max_crews_fixed == null) continue;
      const base = LR[rk].max_crews || 0, wd = crewWorkDays[rk] || 0;
      const need = Math.ceil(wd / projDays);
      const use = (LR[rk].max_crews_fixed != null) ? LR[rk].max_crews_fixed
                : (process.env.CREWS === 'base' ? base : Math.max(base, need));
      maxCrews[rk] = use;
      if (use !== base) crewNote.push(rk + ' ' + base + '->' + use + '(wd=' + wd.toFixed(0) + ')');
    }
    console.log('  §CREW_AUTOSCALE ' + bld + ' projectDays=' + projDays + ' scaled: ' +
      (crewNote.length ? crewNote.join(' ') : 'none — baseline table already sufficient'));

    const quiet = console.log; console.log = () => {};
    let sched;
    t0 = now();
    try { sched = ScheduleGate.computeSchedule(geoEls, 0, 1, maxCrews, _ship.SHIFT_HOURS); } finally { console.log = quiet; }
    t.compute = now() - t0;

    const items = geoEls.map(e => ({ guid: e.guid, s: sched[e.guid].start, e: sched[e.guid].end,
      rawS: sched[e.guid].start, rawE: sched[e.guid].end,
      bz: e.base_z, tz: e.top_z, x0: e.x0, x1: e.x1, y0: e.y0, y1: e.y1, cls: e.cls, seq: e.seq, phase: e.phase,
      storey: e.storey }));   // §TIER_SERIAL_BY_ZONE: storey comes from _buildXrayElements' median-Z banding — derived from the model, never configured

    // RAW generative extents
    const rawBase = Math.min.apply(null, items.map(i => i.rawS));
    const rawExt = extents(items, { s: 'rawS', e: 'rawE' });

    sandbox.console = { log: () => {}, warn: () => {} };
    sandbox.__items = items;
    t0 = now();
    vm.runInContext('this.__remap(this.__items);', sandbox);
    t.remap = now() - t0;
    const remapS = items.map(i => i.s), remapE = items.map(i => i.e);
    const remapBase = rawBase;   // ONE epoch for all three rows — remap/repair only ever shift later,
                                 // so a per-row min would silently re-zero the axis and fake an "earlier" move
    const remapExt = extents(items.map((it, i) => ({ phase: it.phase, s: remapS[i], e: remapE[i] })), { s: 's', e: 'e' });

    t0 = now();
    vm.runInContext('this.__repair(this.__items);', sandbox);
    t.repair = now() - t0;

    const dispMin = Math.min.apply(null, items.map(i => i.s));
    const base = rawBase;
    const endAll = Math.max.apply(null, items.map(i => i.e));
    const spanD = (endAll - base) / D;
    const dispExt = extents(items, { s: 's', e: 'e' });

    // ── §TIER1_HANDOFF (2026-08-12) — user: "the ARCH is a gap after piling done. make things
    // back to back as usual if so." ──────────────────────────────────────────────────────────
    // The ORIGINAL contract (W-TS-1, §TIER_SERIAL) is that the Tier-1 backbone
    // Substructure→Superstructure→Architecture is STRICTLY SERIAL with no dead air between
    // consecutive phases. #1314 §TIER_SERIAL_BY_ZONE rescoped that barrier per zone. Two framings
    // can disagree wildly and only one of them is what a viewer sees:
    //   GLOBAL — max Substructure end over the WHOLE model vs min next-phase start over the whole
    //            model. Across zones this is not a gap at all: the latest zone's piling can finish
    //            long after the earliest zone's walls started, so it reads NEGATIVE (overlap).
    //   PER ZONE — for each derived storey band, the gap between consecutive PRESENT backbone
    //            phases. THIS is the predicate _tier1Serialize actually enforces, so it is the one
    //            that can be broken by the zone rescope.
    // Both are printed, plus the only number that decides whether the user is seeing dead air:
    // how much work is actually ON SCREEN in the window between global last-Substructure-end and
    // global first-Architecture-start. Zero starts AND zero WIP there = a real hole. Work there =
    // Superstructure legitimately sitting between the two phases, which is the correct programme.
    (() => {
      const T1 = ['Substructure', 'Superstructure', 'Architecture'];
      const zoneOf = it => it.storey || '_ALL';
      const dd = ms => (ms / D).toFixed(1);
      const ext1 = (set) => {
        const x = {};
        set.forEach(it => {
          if (T1.indexOf(it.phase) < 0) return;
          const p = x[it.phase] || (x[it.phase] = { minS: Infinity, maxE: -Infinity, n: 0 });
          if (it.s < p.minS) p.minS = it.s;
          if (it.e > p.maxE) p.maxE = it.e;
          p.n++;
        });
        return x;
      };
      // ── GLOBAL framing ──
      const gAll = ext1(items);
      const gSer = ext1(items.filter(it => !it._t1Straggler));   // the population _tier1Extents sees
      const gLine = (lbl, g) => {
        const seg = [];
        for (let i = 0; i + 1 < T1.length; i++) {
          const a = g[T1[i]], b = g[T1[i + 1]];
          if (!a || !b) continue;
          seg.push(T1[i].slice(0, 6) + '→' + T1[i + 1].slice(0, 6) + '=' + dd(b.minS - a.maxE) + 'd');
        }
        if (g[T1[0]] && g[T1[2]]) seg.push('Substr→Archit=' + dd(g[T1[2]].minS - g[T1[0]].maxE) + 'd');
        return lbl + ' ' + T1.filter(p => g[p]).map(p =>
          p.slice(0, 6) + '=[' + dd(g[p].minS - base) + '..' + dd(g[p].maxE - base) + ']d n=' + g[p].n).join(' ') +
          ' | gaps ' + seg.join(' ');
      };
      console.log('  §TIER1_HANDOFF ' + bld + ' GLOBAL     ' + gLine('all', gAll));
      console.log('  §TIER1_HANDOFF ' + bld + ' GLOBAL_SER ' + gLine('stragglerExcluded', gSer));

      // ── PER-ZONE framing — the predicate _tier1Serialize enforces ──
      const byZ = {};
      items.forEach(it => { if (!it._t1Straggler) (byZ[zoneOf(it)] ||= []).push(it); });
      const zGaps = [];      // one entry per consecutive-present-phase pair per zone
      Object.keys(byZ).forEach(z => {
        const g = ext1(byZ[z]);
        const present = T1.filter(p => g[p]);
        for (let i = 0; i + 1 < present.length; i++) {
          zGaps.push({ z: z, pair: present[i].slice(0, 6) + '→' + present[i + 1].slice(0, 6),
            gapD: (g[present[i + 1]].minS - g[present[i]].maxE) / D,
            nPrev: g[present[i]].n, nNext: g[present[i + 1]].n });
        }
      });
      const zs = zGaps.map(x => x.gapD).sort((a, b) => a - b);
      const med = zs.length ? zs[Math.floor(zs.length / 2)] : 0;
      const pos = zGaps.filter(x => x.gapD > 0.5).sort((a, b) => b.gapD - a.gapD);
      console.log('  §TIER1_HANDOFF ' + bld + ' PER_ZONE   zones=' + Object.keys(byZ).length +
        ' consecutivePairs=' + zGaps.length +
        ' gapD min=' + (zs.length ? zs[0].toFixed(1) : 'n/a') +
        ' med=' + med.toFixed(1) + ' max=' + (zs.length ? zs[zs.length - 1].toFixed(1) : 'n/a') +
        ' pairsWithGap>0.5d=' + pos.length + '/' + zGaps.length +
        (pos.length ? ' worst=' + pos.slice(0, 4).map(x =>
          '"' + x.z + '" ' + x.pair + ' ' + x.gapD.toFixed(1) + 'd(n=' + x.nPrev + '→' + x.nNext + ')').join(' ') : ''));

      // ── the decisive number: is the Substructure→Architecture window actually EMPTY on screen? ──
      const sub = gAll['Substructure'], arch = gAll['Architecture'];
      if (sub && arch && arch.minS > sub.maxE) {
        const w0 = sub.maxE, w1 = arch.minS, wD = (w1 - w0) / D;
        const startsIn = items.filter(it => it.s >= w0 && it.s < w1);
        let workD = 0;
        items.forEach(it => { const ov = Math.min(it.e, w1) - Math.max(it.s, w0); if (ov > 0) workD += ov / D; });
        const phBk = {};
        startsIn.forEach(it => { phBk[it.phase] = (phBk[it.phase] || 0) + 1; });
        console.log('  §TIER1_HANDOFF ' + bld + ' WINDOW lastSubstrEnd=day' + dd(w0 - base) +
          ' firstArchStart=day' + dd(w1 - base) + ' width=' + wD.toFixed(1) + 'd' +
          ' startsInWindow=' + startsIn.length + ' workDaysInWindow=' + workD.toFixed(1) +
          ' meanConcurrency=' + (wD > 0 ? (workD / wD).toFixed(2) : 'n/a') +
          ' by phase{' + Object.keys(phBk).sort((a, b) => phBk[b] - phBk[a]).map(p => p + ':' + phBk[p]).join(' ') + '}' +
          ' → ' + (startsIn.length === 0 && workD < 0.5 ? 'GENUINELY EMPTY — a real hole'
            : 'OCCUPIED — the window between piling and ARCH is doing real work, not dead air'));
      } else if (sub && arch) {
        console.log('  §TIER1_HANDOFF ' + bld + ' WINDOW lastSubstrEnd=day' + dd(sub.maxE - base) +
          ' firstArchStart=day' + dd(arch.minS - base) +
          ' → NO global window at all: Architecture starts BEFORE the last Substructure element ends' +
          ' (overlap ' + dd(sub.maxE - arch.minS) + 'd) — global "piling→ARCH gap" is not a thing here');
      }
    })();

    // ── §TIER_SERIAL_BY_ZONE (2026-08-12) — SIMULATION ONLY, shipped code untouched ──────────
    // §TIER_SERIAL makes the Tier-1 backbone (Substructure→Superstructure→Architecture) strictly
    // serial GLOBALLY: all Superstructure everywhere finishes before any Architecture starts. That
    // is what inflates the programme 1.7-3.7x over RAW and creates the dead air. Its own header
    // cites the user ruling it implements — "separate unrelated disciplines can run parallel
    // thereafter if construction practice permits" — and real practice starts walls on level 1
    // while level 7 is still framing.
    // This measures what happens if the SAME shipped remap runs per DERIVED STOREY BAND instead of
    // once globally. Nothing is hardcoded and nothing is per-building: the band key is the storey
    // already assigned by _buildXrayElements' median-Z ranking, straight out of the IFC. A model
    // with one storey collapses to exactly today's behaviour.
    const bandOf = {};
    items.forEach(it => { bandOf[it.storey || '_UNKNOWN'] = 1; });
    const bandKeys = Object.keys(bandOf);
    const simItems = items.map(it => ({ guid: it.guid, s: it.rawS, e: it.rawE,
      bz: it.bz, tz: it.tz, x0: it.x0, x1: it.x1, y0: it.y0, y1: it.y1,
      cls: it.cls, seq: it.seq, phase: it.phase, storey: it.storey }));
    const byBand = {};
    simItems.forEach(it => { (byBand[it.storey || '_UNKNOWN'] ||= []).push(it); });
    for (const bk of bandKeys) {
      sandbox.__band = byBand[bk];
      if (!sandbox.__band || !sandbox.__band.length) continue;
      vm.runInContext('this.__remap(this.__band); this.__repair(this.__band);', sandbox);
    }
    const simEnd = Math.max.apply(null, simItems.map(i => i.e));
    const simSpanD = (simEnd - base) / D;
    const simOcc = {};
    simItems.forEach(it => {
      const x = simOcc[it.phase] || (simOcc[it.phase] = { w: 0, s: Infinity, e: -Infinity, n: 0 });
      x.w += (it.e - it.s) / D; x.n++;
      if (it.s < x.s) x.s = it.s;
      if (it.e > x.e) x.e = it.e;
    });
    const simSpanMs = Math.max(1, simEnd - base);
    const simHist = new Array(100).fill(0);
    simItems.forEach(it => { simHist[Math.min(99, Math.floor((it.s - base) / simSpanMs * 100))]++; });
    let simBest = 0, simCur = 0;
    for (let b = 0; b < 100; b++) { if (simHist[b] === 0) { simCur++; if (simCur > simBest) simBest = simCur; } else simCur = 0; }
    console.log('  §TIER_SERIAL_BY_ZONE ' + bld + ' bands=' + bandKeys.length +
      ' spanD ' + spanD.toFixed(1) + ' → ' + simSpanD.toFixed(1) +
      ' (' + (simSpanD / spanD).toFixed(2) + 'x, RAW was ' + ((Math.max.apply(null, items.map(i => i.rawE)) - rawBase) / D).toFixed(1) + ')' +
      ' longestEmptyRun ' + '→' + simBest + '%' +
      ' occ=' + Object.keys(simOcc).sort((a, b2) => {
        const ia = PH_ORDER.indexOf(a), ib = PH_ORDER.indexOf(b2);
        return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
      }).map(ph => { const x = simOcc[ph], w = (x.e - x.s) / D;
        return ph.slice(0, 6) + '=' + (w > 0 ? (100 * x.w / w).toFixed(0) : '0') + '%'; }).join(' '));

    console.log('\n════ ' + bld + '  elements=' + items.length + '  displaySpan=' + spanD.toFixed(1) +
      'd  firstElementStartsDay=' + ((dispMin - rawBase) / D).toFixed(1) + ' (all rows share the RAW epoch)');
    console.log('  §ARCH_PHASE RAW    ' + fmtExt(rawExt, rawBase));
    console.log('  §ARCH_PHASE REMAP  ' + fmtExt(remapExt, remapBase));
    console.log('  §ARCH_PHASE REPAIR ' + fmtExt(dispExt, base));

    // ── §STAGE_OCC (2026-08-13) — WHICH STAGE creates the idle? ──────────────────────────────
    // §ARCH_PHASE above prints each stage's phase EXTENTS. Extents alone cannot say whether a
    // stage widened a window around the same work or genuinely rescheduled it. This prints the
    // same three stages as occupancy (work-days / window-days), which can only move when the ratio
    // moves — so it attributes the idle to a stage instead of leaving it to inference. MEASURED,
    // Hospital, and the two phases the user named split cleanly between two different stages:
    //   MEP Final   RAW 176% (win 120d) -> REMAP 21% (win 1009d)   — COMPACT generatively; the
    //               display remap stretched it 8.4x without adding one work-day. The remap owns it.
    //   Architecture RAW 34% zone-mean 5% (win 891d)               — ALREADY sparse before any
    //               remap runs. computeSchedule's support gate owns it; the remap only inherits.
    // Read with §ZONE_BAR_TAIL below: RAW-vs-REMAP says WHICH LAYER, phase-vs-zone says WHICH UNIT.
    (() => {
      const occOf = (getS, getE) => {
        const o = {};
        items.forEach((it, i) => {
          const s = getS(it, i), e = getE(it, i);
          const x = o[it.phase] || (o[it.phase] = { w: 0, s: Infinity, e: -Infinity });
          x.w += (e - s) / D; if (s < x.s) x.s = s; if (e > x.e) x.e = e;
        });
        const zz = {};
        items.forEach((it, i) => {
          const s = getS(it, i), e = getE(it, i), k = (it.storey || '_U') + '|' + it.phase;
          const x = zz[k] || (zz[k] = { w: 0, s: Infinity, e: -Infinity });
          x.w += (e - s) / D; if (s < x.s) x.s = s; if (e > x.e) x.e = e;
        });
        return PH_ORDER.filter(p => o[p]).map(p => {
          const x = o[p], w = (x.e - x.s) / D;
          const ks = Object.keys(zz).filter(k => k.slice(k.lastIndexOf('|') + 1) === p);
          const zw = ks.reduce((a, k) => a + zz[k].w, 0);
          const zwin = ks.reduce((a, k) => a + (zz[k].e - zz[k].s) / D, 0);
          return p.slice(0, 6) + '=' + (w > 0 ? (100 * x.w / w).toFixed(0) : '0') + '%/zone' +
            (zwin > 0 ? (100 * zw / zwin).toFixed(0) : '0') + '%(win' + w.toFixed(0) + 'd)';
        }).join(' ');
      };
      console.log('  §STAGE_OCC ' + bld + ' RAW    ' + occOf(it => it.rawS, it => it.rawE));
      console.log('  §STAGE_OCC ' + bld + ' REMAP  ' + occOf((it, i) => remapS[i], (it, i) => remapE[i]));
      console.log('  §STAGE_OCC ' + bld + ' REPAIR ' + occOf(it => it.s, it => it.e) +
        '   (phase%/zone-mean% — zone% is the honest work-package unit)');
    })();

    // ── front-loading: share of the model whose START lands in the opening slice ──
    const cuts = [{ lbl: 'day<=1', ms: base + 1 * D }, { lbl: 'day<=2', ms: base + 2 * D },
      { lbl: 'day<=7', ms: base + 7 * D },
      { lbl: '1%', ms: base + (endAll - base) * 0.01 }, { lbl: '5%', ms: base + (endAll - base) * 0.05 },
      { lbl: '10%', ms: base + (endAll - base) * 0.10 }, { lbl: '25%', ms: base + (endAll - base) * 0.25 }];
    const front = cuts.map(c => {
      const n = items.filter(it => it.s <= c.ms).length;
      return c.lbl + '=' + n + '(' + (100 * n / items.length).toFixed(1) + '%)';
    });
    console.log('  §ARCH_FRONT ' + bld + ' startedBy ' + front.join(' '));

    // ── §DAY_GAP (added 2026-08-12, user: "at Day 14 onwards nothing happens and when scrub
    // forward it jumps to Day 48 with construction resuming") ────────────────────────────────
    // Buckets every element's display START into 1%-of-span slices and reports the longest run of
    // slices with ZERO starts. Percent-of-span, deliberately: the browser maps this generated
    // timeline through ONE global affine into the captured project window (the user's Hospital run
    // shows 1186.3 generated days served as a 126-day film), and an affine preserves relative
    // position — so a dead stretch is the SAME percentage of the film either way, while raw days
    // are not comparable. Their report is day 14→48 of 126 = 11.1%→38.1% of the film.
    const NB = 100, hist = new Array(NB).fill(0), spanMs = Math.max(1, endAll - base);
    items.forEach(it => { hist[Math.min(NB - 1, Math.floor((it.s - base) / spanMs * NB))]++; });
    let bestLo = -1, bestN = 0, curLo = -1, curN = 0;
    for (let b = 0; b < NB; b++) {
      if (hist[b] === 0) { if (curN === 0) curLo = b; curN++; if (curN > bestN) { bestN = curN; bestLo = curLo; } }
      else curN = 0;
    }
    const dayOf = pct => (pct / 100 * spanD).toFixed(1);
    console.log('  §DAY_GAP ' + bld + ' longestEmptyRun=' + bestN + '%' +
      (bestN ? ' at ' + bestLo + '%..' + (bestLo + bestN) + '% of the film (raw day ' +
        dayOf(bestLo) + '..' + dayOf(bestLo + bestN) + ' of ' + spanD.toFixed(1) + ')' : '') +
      ' — a run of film with ZERO element starts');
    // The whole shape, not just the worst run: starts per 5% of film, so a reader can see where the
    // work actually sits without trusting the single max above.
    const per5 = [];
    for (let b = 0; b < NB; b += 5) per5.push(hist.slice(b, b + 5).reduce((a, c) => a + c, 0));
    console.log('  §DAY_GAP_HIST ' + bld + ' startsPer5%=[' + per5.join(',') + ']');

    // ── §DAY_GAP_WIP (2026-08-12) — the measurement §DAY_GAP was MISSING, and the one that decides
    // whether the "dead air" is a schedule defect or an honest crew-limited grind ─────────────────
    // §DAY_GAP counts STARTS only. A band with zero starts is not the same as a band with no work:
    // time_machine.js:1544 records that the real frontier on Hospital is "only ~7 elements at a time
    // (crew-cap)", so a long pole being ground out by a capped crew produces exactly zero starts
    // while being a perfectly truthful programme. The two cases demand OPPOSITE fixes:
    //   WIP > 0 through the gap  → the schedule is honest; re-timing starts to fill the window
    //                              would fabricate dates to fix a VIEWING complaint. Do not.
    //   WIP = 0 through the gap  → genuinely nothing is happening; that is an artificial hole in
    //                              the gating, and the fix belongs in the gate, not in a stretch.
    // Same buckets, same items, no new data — an element is in progress in bucket b if it started
    // at or before the bucket's midpoint and had not yet ended.
    // ⚠ MEASURED BY OVERLAP, NOT BY SAMPLING — the first cut of this probe sampled ONE instant per
    // band (`it.s <= t && it.e > t` at the band midpoint) and reported minWIP=0/maxWIP=0 everywhere,
    // which read as "every dead band is genuinely idle". That was a SAMPLING ARTEFACT, not a
    // finding: on Hospital a 1% band is 11.7 days while p50 element duration is 0.015d, so a single
    // instant has a ~0.1% chance of landing on any given element. With true concurrency near 1, an
    // instantaneous sample returns 0 most of the time by luck alone. Correct measure = total
    // element-days of work falling INSIDE the band ÷ band length = mean concurrency over the band.
    const wip = new Array(NB).fill(0);
    const bandMs = spanMs / NB;
    for (const it of items) {
      const b0 = Math.max(0, Math.min(NB - 1, Math.floor((it.s - base) / spanMs * NB)));
      const b1 = Math.max(0, Math.min(NB - 1, Math.floor((it.e - base) / spanMs * NB)));
      for (let b = b0; b <= b1; b++) {
        const lo = base + b * bandMs, hi = lo + bandMs;
        const ov = Math.min(it.e, hi) - Math.max(it.s, lo);
        if (ov > 0) wip[b] += ov / bandMs;   // fraction of the band this element occupies
      }
    }
    const wip5 = [];
    for (let b = 0; b < NB; b += 5) wip5.push((wip.slice(b, b + 5).reduce((a, c) => a + c, 0) / 5).toFixed(1));
    console.log('  §DAY_GAP_WIP ' + bld + ' meanInProgressPer5%=[' + wip5.join(',') + ']');
    // ── §DAY_GAP_DUR — why WIP is ~0 everywhere, not just in the gaps ─────────────────────────
    // If mean in-progress is 0-3 on a 63k-element building, elements are not "being built slowly in
    // a long window" — they are POINT EVENTS. Measure the duration distribution directly and state
    // it as a share of the programme, because that is the number that decides whether the gap is a
    // placement problem (fix by moving starts) or a duration problem (fix by giving work real time).
    const durD = items.map(it => (it.e - it.s) / D).sort((a, b) => a - b);
    const sumD = durD.reduce((a, c) => a + c, 0);
    const q = f => durD[Math.min(durD.length - 1, Math.floor(durD.length * f))];
    console.log('  §DAY_GAP_DUR ' + bld + ' n=' + durD.length +
      ' meanDur=' + (sumD / durD.length).toFixed(3) + 'd' +
      ' p50=' + q(0.5).toFixed(3) + 'd p90=' + q(0.9).toFixed(3) + 'd max=' + durD[durD.length - 1].toFixed(2) + 'd' +
      ' spanD=' + spanD.toFixed(1) +
      ' sumWorkDays=' + sumD.toFixed(1) +
      ' occupancy=' + (100 * sumD / spanD).toFixed(1) + '%' +
      ' (occupancy = mean elements in progress if work were spread evenly over the whole programme)');

    // ── §DAY_GAP_PHASE_OCC — the number that decides WHOSE window is wrong ────────────────────
    // Global occupancy (~100%) is dominated by the huge late phases; it hides the early ones. Per
    // phase: work-days inside that phase vs the width of the window it was given. A phase at ~100%
    // is honestly full. A phase at single-digit % has been handed a window tens of times longer
    // than its own work content — and THAT is what a viewer sees as dead air.
    const occPh = {};
    items.forEach(it => {
      const x = occPh[it.phase] || (occPh[it.phase] = { w: 0, s: Infinity, e: -Infinity, n: 0 });
      x.w += (it.e - it.s) / D; x.n++;
      if (it.s < x.s) x.s = it.s;
      if (it.e > x.e) x.e = it.e;
    });
    console.log('  §DAY_GAP_PHASE_OCC ' + bld + ' ' + Object.keys(occPh).sort((a, b) => {
      const ia = PH_ORDER.indexOf(a), ib = PH_ORDER.indexOf(b);
      return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
    }).map(ph => {
      const x = occPh[ph], winD = (x.e - x.s) / D;
      return ph + '=' + (winD > 0 ? (100 * x.w / winD).toFixed(1) : '0.0') + '%' +
        '(work=' + x.w.toFixed(1) + 'd win=' + winD.toFixed(1) + 'd n=' + x.n + ')';
    }).join(' '));

    // ── §ZONE_BAR_TAIL (2026-08-13, user: "the rush to build at onset leaving the rest idle is a
    // bug", "not following its gantt bar length.. which gets idle the rest of it") ──────────────
    // §DAY_GAP_PHASE_OCC above measures the PHASE-level bar. That is the wrong unit to diagnose in,
    // and reading it alone points at the wrong fix. A phase bar is the UNION of one bar per zone
    // (storey), so a phase can read "idle" purely because its zones are staggered — every zone busy,
    // the union mostly empty — or because the zone bars are themselves empty. Those demand opposite
    // fixes, and only this split tells them apart. MEASURED on Hospital, both cases are live at once:
    //   Finishes      phase 5.6%  -> zone-mean 26.6%   (staggering; the zone packages ARE dense —
    //                                                   Level 2 47%, Level 4 80%, Level 6 200%)
    //   Architecture  phase 24.0% -> zone-mean  3.6%   (NOT staggering; the zone bars are 7x emptier
    //                                                   than the phase bar — Level 5 Ceiling holds
    //                                                   512 elements and 2.1 work-days over 969d)
    //
    // The second number here is the one that decides whether "trim the bar to the last real
    // activity" is a fix or a cosmetic: it reports what each zone bar's width WOULD be if it ended
    // at its own 95%-of-work point, and the occupancy that would follow. Hospital, measured:
    //   MEP Final     1207d -> 310d (26%)  occ 17.5% -> 68.4%   trimming IS most of the fix here
    //   Architecture  8444d -> 5487d (65%) occ  3.6% ->  5.5%   trimming is nearly worthless here
    // So the trailing dead air is real and large in some phases and irrelevant in others; a single
    // display-side trim cannot be the whole answer, and this line is what says which is which.
    // tailN is reported next to it deliberately: the elements past the 95% mark are REAL scheduled
    // elements (Architecture Level 4: 874 of 3293), so trimming the drawn bar would put hundreds of
    // genuinely-scheduled elements outside their own bar. Reported, never silently trimmed.
    (() => {
      const zp = {};
      items.forEach(it => { (zp[(it.storey || '_UNKNOWN') + '|' + it.phase] ||= []).push(it); });
      PH_ORDER.forEach(ph => {
        const ks = Object.keys(zp).filter(k => k.slice(k.lastIndexOf('|') + 1) === ph);
        if (!ks.length) return;
        const rows = ks.map(k => {
          const set = zp[k];
          const s0 = Math.min.apply(null, set.map(i => i.s)), e1 = Math.max.apply(null, set.map(i => i.e));
          const win = (e1 - s0) / D, work = set.reduce((a, i) => a + (i.e - i.s) / D, 0);
          // 95%-of-work point: walk the bar's elements by END time, accumulating work-days
          const byEnd = set.slice().sort((a, b) => a.e - b.e);
          let run = 0, p95e = e1;
          for (const it of byEnd) { run += (it.e - it.s) / D; if (run >= 0.95 * work) { p95e = it.e; break; } }
          return { z: k.slice(0, k.lastIndexOf('|')), win: win, work: work, n: set.length,
            occ: win > 0 ? 100 * work / win : 0, tail: set.filter(i => i.e > p95e).length,
            p95: (e1 > s0) ? 100 * (p95e - s0) / (e1 - s0) : 100 };
        }).sort((a, b) => b.win - a.win);
        const sumWin = rows.reduce((a, r) => a + r.win, 0);
        const sumWork = rows.reduce((a, r) => a + r.work, 0);
        const trimmed = rows.reduce((a, r) => a + r.win * r.p95 / 100, 0);
        const phWin = (occPh[ph].e - occPh[ph].s) / D;
        console.log('  §ZONE_BAR_TAIL ' + bld + ' ' + ph + ' zones=' + rows.length +
          ' phaseBarOcc=' + (phWin > 0 ? (100 * sumWork / phWin).toFixed(1) : '0.0') + '%' +
          ' zoneMeanOcc=' + (sumWin > 0 ? (100 * sumWork / sumWin).toFixed(1) : '0.0') + '%' +
          ' (zoneMean>>phase = staggered zones, zoneMean<<phase = the zone bars are themselves empty)' +
          ' | sumZoneWin=' + sumWin.toFixed(0) + 'd trimmedTo95%work=' + trimmed.toFixed(0) + 'd' +
          ' (' + (sumWin > 0 ? (100 * trimmed / sumWin).toFixed(0) : '0') + '%) occIfTrimmed=' +
          (trimmed > 0 ? (100 * sumWork / trimmed).toFixed(1) : '0.0') + '%' +
          ' | widest=' + rows.slice(0, 3).map(r => '"' + r.z + '" ' + r.win.toFixed(0) + 'd work=' +
            r.work.toFixed(1) + 'd occ=' + r.occ.toFixed(1) + '% n=' + r.n + ' 95%workAt=' +
            r.p95.toFixed(0) + '% tailN=' + r.tail).join(' | '));
      });
    })();

    // ── §DAY_GAP_TAIL — is a phase's empty window caused by a FEW straggler elements? ─────────
    // Superstructure's Hospital window moved 306.6→486.0 between REMAP and REPAIR while its work
    // content stayed 116d. If a phase's last half of elapsed time holds only a handful of elements,
    // the window is being dragged by a thin tail, NOT by the tier-serialization contract — which
    // matters enormously, because a tail is fixable without touching the user-confirmed strictly-
    // serial guarantee, and the contract is not.
    console.log('  §DAY_GAP_TAIL ' + bld + ' ' + Object.keys(occPh).sort((a, b) => {
      const ia = PH_ORDER.indexOf(a), ib = PH_ORDER.indexOf(b);
      return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
    }).map(ph => {
      const set = items.filter(it => it.phase === ph);
      if (!set.length) return null;
      const s0 = Math.min.apply(null, set.map(i => i.s)), e1 = Math.max.apply(null, set.map(i => i.e));
      const mid = s0 + (e1 - s0) / 2;
      const late = set.filter(i => i.s >= mid).length;
      // when did 95% of this phase's elements have started, as a % of its own window?
      const ss = set.map(i => i.s).sort((a, b) => a - b);
      const p95 = ss[Math.min(ss.length - 1, Math.floor(ss.length * 0.95))];
      const p95pct = (e1 > s0) ? (100 * (p95 - s0) / (e1 - s0)) : 0;
      return ph.slice(0, 6) + ': lastHalfOfWindow=' + late + '/' + set.length +
        '(' + (100 * late / set.length).toFixed(1) + '%) 95%startedBy=' + p95pct.toFixed(0) + '%ofWindow';
    }).filter(Boolean).join(' | '));

    // ── §DAY_GAP_TAIL_WHO — name the stragglers, don't just count them ────────────────────────
    // If ~13 of 2,603 elements drag a phase's window across 238 days, those 13 are either honestly
    // late (a real dependency) or artefacts of a single bad support edge. Either way they are
    // identifiable, and they are the cheapest thing in this whole study to act on. Reported for the
    // worst offender phase per building: how far each straggler sits past the phase's 95% mark.
    (() => {
      let worst = null;
      Object.keys(occPh).forEach(ph => {
        const set = items.filter(it => it.phase === ph);
        if (set.length < 50) return;
        const s0 = Math.min.apply(null, set.map(i => i.s)), e1 = Math.max.apply(null, set.map(i => i.e));
        const ss = set.map(i => i.s).sort((a, b) => a - b);
        const p95 = ss[Math.floor(ss.length * 0.95)];
        const tailDays = (e1 - p95) / D, tailN = set.filter(i => i.s > p95).length;
        if (!worst || tailDays > worst.tailDays) worst = { ph, set, p95, e1, tailDays, tailN, s0 };
      });
      if (!worst) return;
      const late = worst.set.filter(i => i.s > worst.p95)
        .sort((a, b) => b.s - a.s).slice(0, 8);
      const byCls = {};
      worst.set.filter(i => i.s > worst.p95).forEach(i => { byCls[i.cls] = (byCls[i.cls] || 0) + 1; });
      console.log('  §DAY_GAP_TAIL_WHO ' + bld + ' worstPhase="' + worst.ph + '" tail=' + worst.tailN +
        ' elements spanning ' + worst.tailDays.toFixed(1) + 'd past its own 95% mark' +
        ' | classes=' + Object.keys(byCls).sort((a, b) => byCls[b] - byCls[a])
          .slice(0, 6).map(c => c + '×' + byCls[c]).join(',') +
        ' | latest=' + late.slice(0, 4).map(i =>
          i.cls + '@day' + ((i.s - base) / D).toFixed(0) + '/bz' + i.bz.toFixed(1)).join(' '));
    })();

    // ── §HOSTED_BEFORE_HOST — the predicate NO witness owned, and the one the user actually sees ──
    // User, live 2026-08-12: "electrical outlets and hanging elements appearing bit early." Every
    // shipped witness checks BEARING support (does this sit on something), class totals, or zone
    // serialization. None asks the question a viewer asks: did a HOSTED element appear before the
    // thing it hangs on? That gap is exactly why five green witnesses coexisted with a visible bug.
    //
    // Host is inferred, not read from IFC (IFC ships no host link for most outlets): the nearest
    // wall/slab whose bbox contains or touches the hosted element's centre. Generic — the hosted
    // set is anything whose class is EA-priced and small, the host set is the M2 structural/arch
    // classes. Reports the count and the worst offender; never gates here (this is the study
    // probe), but the number is what a real witness should assert at 0.
    (() => {
      const HOSTED = /^(IfcOutlet|IfcLightFixture|IfcSwitchingDevice|IfcSensor|IfcAlarm|IfcFlowTerminal|IfcAirTerminal|IfcElectricAppliance|IfcFireSuppressionTerminal)$/;
      const HOSTS  = /^(IfcWall|IfcWallStandardCase|IfcSlab|IfcRoof|IfcCovering|IfcCurtainWall)$/;
      const hosted = items.filter(it => HOSTED.test(it.cls));
      const hosts  = items.filter(it => HOSTS.test(it.cls));
      if (!hosted.length || !hosts.length) {
        console.log('  §HOSTED_BEFORE_HOST ' + bld + ' hosted=' + hosted.length + ' hosts=' + hosts.length + ' — nothing to check');
        return;
      }
      // coarse XY grid so this stays O(n) on 122k elements
      const CELL = 4, grid = {};
      const cells = e => { const o = [];
        for (let i = Math.floor(e.x0 / CELL); i <= Math.floor(e.x1 / CELL); i++)
          for (let j = Math.floor(e.y0 / CELL); j <= Math.floor(e.y1 / CELL); j++) o.push(i + ',' + j);
        return o; };
      hosts.forEach(h => cells(h).forEach(c => (grid[c] || (grid[c] = [])).push(h)));
      let early = 0, worstD = 0, worst = null, matched = 0;
      hosted.forEach(e => {
        const cx = (e.x0 + e.x1) / 2, cy = (e.y0 + e.y1) / 2, cz = (e.bz + e.tz) / 2;
        const cand = grid[Math.floor(cx / CELL) + ',' + Math.floor(cy / CELL)];
        if (!cand) return;
        let best = null, bestD = Infinity;
        for (const h of cand) {
          if (cz < h.bz - 1 || cz > h.tz + 1) continue;            // not at this host's height
          const d = Math.abs((h.x0 + h.x1) / 2 - cx) + Math.abs((h.y0 + h.y1) / 2 - cy);
          if (d < bestD) { bestD = d; best = h; }
        }
        if (!best) return;
        matched++;
        const dDays = (best.s - e.s) / D;                           // >0 = hosted starts BEFORE host
        if (dDays > 0) { early++; if (dDays > worstD) { worstD = dDays; worst = e.cls + '@' + best.cls; } }
      });
      console.log('  §HOSTED_BEFORE_HOST ' + bld + ' hosted=' + hosted.length + ' hostMatched=' + matched +
        ' EARLY=' + early + ' (' + (matched ? (100 * early / matched).toFixed(1) : '0') + '%)' +
        ' worst=' + worstD.toFixed(1) + 'd' + (worst ? ' ' + worst : '') +
        ' — EARLY>0 means a hosted element appears before what it hangs on; a real witness should assert 0');
    })();

    // Focused readout over the dead run §DAY_GAP just found, plus the zero-start bands generally.
    const deadBands = [];
    for (let b = 0; b < NB; b++) if (hist[b] === 0) deadBands.push(b);
    const wipInDead = deadBands.map(b => wip[b]);
    const zeroWipDead = wipInDead.filter(w => w < 0.005).length;   // <0.5% of a band occupied = idle
    console.log('  §DAY_GAP_WIP ' + bld + ' zeroStartBands=' + deadBands.length +
      ' ofWhichAlsoZeroWork=' + zeroWipDead +
      ' minWIP=' + (wipInDead.length ? Math.min.apply(null, wipInDead).toFixed(2) : 'n/a') +
      ' maxWIP=' + (wipInDead.length ? Math.max.apply(null, wipInDead).toFixed(2) : 'n/a') +
      ' → ' + (deadBands.length === 0 ? 'no dead bands'
        : zeroWipDead === 0 ? 'EVERY zero-start band still has work in progress — crew-limited grind, NOT a hole'
        : zeroWipDead === deadBands.length ? 'EVERY zero-start band is also zero-work — a real hole in the gating'
        : 'MIXED — ' + zeroWipDead + ' of ' + deadBands.length + ' zero-start bands are genuinely idle'));

    // per phase: how much of THAT phase lands in its own first day / first 10% of the span
    PH_ORDER.forEach(ph => {
      const set = items.filter(it => it.phase === ph);
      if (!set.length) return;
      const ph0 = Math.min.apply(null, set.map(i => i.s));
      const inD1 = set.filter(it => it.s <= ph0 + 1 * D).length;
      const in10 = set.filter(it => it.s <= ph0 + (endAll - base) * 0.10).length;
      console.log('    §ARCH_PHASE_FRONT ' + bld + ' ' + ph + ' startsDay=' + ((ph0 - base) / D).toFixed(1) +
        ' ownFirstDay=' + inD1 + '/' + set.length + '(' + (100 * inD1 / set.length).toFixed(1) + '%)' +
        ' ownFirst10%ofFilm=' + in10 + '/' + set.length + '(' + (100 * in10 / set.length).toFixed(1) + '%)');
    });

    // ── what exactly is on screen in day <=1 ──
    const d1 = items.filter(it => it.s <= base + 1 * D);
    const byPh = {}, byCls = {};
    d1.forEach(it => { byPh[it.phase] = (byPh[it.phase] || 0) + 1; byCls[it.cls] = (byCls[it.cls] || 0) + 1; });
    const top = k => Object.keys(k).sort((a, b) => k[b] - k[a]).slice(0, 8).map(c => c + ':' + k[c]).join(' ');
    console.log('  §ARCH_D1 ' + bld + ' n=' + d1.length + ' phases{' + top(byPh) + '} classes{' + top(byCls) + '}');

    // ── authored (planner-facing) bar starts ──
    authLines.filter(l => /OVERLAP_BAND/.test(l)).forEach(l => console.log('  §ARCH_AUTH ' + bld + ' ' + l.replace('§PHASE_OVERLAP_BAND ', '')));

    console.log('  §ARCH_TIME ' + bld + ' dbOpen=' + t.dbOpen + 'ms xray=' + t.xray + 'ms classify=' + t.classify +
      'ms authoredBars=' + t.authored + 'ms computeSchedule=' + t.compute + 'ms twoTierRemap=' + t.remap +
      'ms midairRepair=' + t.repair + 'ms TOTAL=' + Object.keys(t).reduce((a, k) => a + t[k], 0) + 'ms');
  }
})();
