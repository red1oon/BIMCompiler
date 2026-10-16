#!/usr/bin/env node
// probe_hospital_day37_hanging.js — STUDY ONLY (2026-08-14, follow-up to
// prompts/4D_SCHEDULE_PERFECTION.md §TIER_REGATE_WORKLIST).
//
// User flagged a live Time Machine screenshot: Hospital, Day 37 / 9/29/2026 07:23 AM, "5035 placed"
// — visibly teal (STR-discipline, A.DISC_COLORS) roof/deck panels floating disconnected in open air
// above a building whose SUPER tier has only reached Level 1/4/5 by that date. Hypothesis to check
// with real numbers, not eyeballing: for elements already VISIBLE (item.s <= cutoff) at high top_z,
// is there a real, ALSO-VISIBLE structural element directly beneath them (xy-overlap, comparable
// top_z near their base_z)? If not, that is the mid-air/hosted-before-host gating gap made concrete
// with actual guids — same code area as this session's §TIER_REGATE_WORKLIST work
// (_tierAuditRegate/_twoTierRemap/_midairRepair in time_machine.js), not a phase-classification bug
// (§CLASS_UNMATCHED_FALLBACK is already loud, checked separately) and not §CPE_DISCIPLINE_REVEAL
// (this screenshot is plain TM scrubbing, no Alt+C/MaxQ bake in view).
//
// Same slice-and-vm harness as probe_arch_start.js / probe_tier_regate_worklist.js — reused, not
// forked: _buildXrayElements -> ScheduleAuthor classify -> ScheduleGate.computeSchedule ->
// _twoTierRemap -> _midairRepair, against the REAL Hospital_meta.db, same pipeline the live movie
// runs. Read the log, not the exit code.
//
// Command (from bim-compiler/):
//   VIEWER_DIR=~/bim-ootb/viewer BLD_DIR=~/bim-ootb/buildings node scripts/probe_hospital_day37_hanging.js
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

function sliceFn(src, name, which) {
  let from = 0;
  for (let pass = 0; pass <= (which || 0); pass++) {
    const idx = src.indexOf('function ' + name + '(', from);
    if (idx < 0) return null;
    let depth = 0, i = idx, seenOpen = false;
    for (; i < src.length; i++) {
      if (src[i] === '{') { depth++; seenOpen = true; }
      else if (src[i] === '}') { depth--; if (seenOpen && depth === 0) break; }
    }
    if (pass === (which || 0)) return src.slice(idx, i + 1);
    from = i + 1;
  }
  return null;
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
  sliceFn(tmSrc, '_midairAudit'), sliceFn(tmSrc, '_midairRepair')].filter(Boolean).join('\n');

function loadShipTables() {
  const txt = fs.readFileSync(path.join(VIEWER_DIR, 'rates.js'), 'utf8');
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
  const shiftM = txt.match(/var SHIFT_HOURS = (\d+(\.\d+)?);/);
  const shiftHours = shiftM ? Number(shiftM[1]) : 24;
  return (new Function([blk('RATES', '{'), blk('SEQUENCE_RULES', '{'), blk('LABOR_RATES', '{'),
    blk('SEQUENCE_DEFAULT', '{'), blk('SEQUENCE_NAME_OVERRIDES', '[')].join(';\n') +
    ';\n return { RATES: RATES, SR: SEQUENCE_RULES, LR: LABOR_RATES,' +
    ' SD: SEQUENCE_DEFAULT, NO: SEQUENCE_NAME_OVERRIDES, SHIFT_HOURS: ' + shiftHours + ' };'))();
}

const BLD_DIR = process.env.BLD_DIR || path.join(HOME, 'bim-ootb', 'buildings');
const D = 86400000;

(async () => {
  const SQL = await initSqlJs({ wasmBinary: fs.readFileSync(path.join(SQLJS_DIR, 'sql-wasm.wasm')) });
  const _ship = loadShipTables();
  const SR = _ship.SR, SD = _ship.SD, LR = _ship.LR, NO = _ship.NO, RATES = _ship.RATES;

  const dbPath = path.join(BLD_DIR, 'Hospital_meta.db');
  const db = new SQL.Database(fs.readFileSync(dbPath));
  const sandbox = { console: { log: () => {}, warn: () => {} }, performance: { now: () => Date.now() },
    window: { SEQUENCE_RULES: SR, SEQUENCE_DEFAULT: SD, SEQUENCE_NAME_OVERRIDES: NO },
    ScheduleGate: ScheduleGate, Math: Math, RegExp: RegExp, Object: Object, Infinity: Infinity,
    A: () => ({ db: db, activeBuilding: 'Hospital', _metaGen: 0 }) };
  vm.createContext(sandbox);
  vm.runInContext(sliced + '\nthis.__bxe = _buildXrayElements; this.__remap = _twoTierRemap; this.__repair = _midairRepair;', sandbox);
  const els = sandbox.__bxe();
  if (!els || !els.length) { console.log('§HANG_PROBE Hospital element build produced nothing'); return; }

  const nameOf = {}, storeyOf = {};
  const nr = db.exec("SELECT guid, ifc_class, COALESCE(element_name,''), storey FROM elements_meta");
  if (nr.length) nr[0].values.forEach(v => { nameOf[v[0]] = v[2]; storeyOf[v[0]] = v[3]; });

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

  const maxCrews = {};
  const quiet = console.log; console.log = () => {};
  let sched;
  try { sched = ScheduleGate.computeSchedule(geoEls, 0, 1, maxCrews, _ship.SHIFT_HOURS); } finally { console.log = quiet; }
  db.close();

  const items = geoEls.map(e => ({ guid: e.guid, s: sched[e.guid].start, e: sched[e.guid].end,
    bz: e.base_z, tz: e.top_z, x0: e.x0, x1: e.x1, y0: e.y0, y1: e.y1, cls: e.cls, seq: e.seq, phase: e.phase,
    storey: e.storey, name: nameOf[e.guid] || '', rawStorey: storeyOf[e.guid] || '' }));

  const base = Math.min.apply(null, items.map(i => i.s));
  sandbox.console = { log: () => {}, warn: () => {} };
  sandbox.__items = items;
  vm.runInContext('this.__remap(this.__items);', sandbox);
  vm.runInContext('this.__repair(this.__items);', sandbox);

  // §HANG_PROBE cutoff — computeSchedule was called with baseMs=0 (same as probe_arch_start.js), so
  // item.s/.e are ms-since-PROJECT-START, not real calendar time. The screenshot's own "DAY 37 | HR
  // 16" IS that day-index directly (Gantt axis: Aug 26 = d0) — no calendar-date conversion needed.
  const cutoff = base + (37 + 16 / 24) * D;
  const placed = items.filter(it => it.s <= cutoff);
  console.log('§HANG_PROBE Hospital base=' + base.toFixed(0) + 'ms cutoffDay=' + ((cutoff - base) / D).toFixed(2) +
    ' placedTotal=' + placed.length + '/' + items.length);

  function xyOverlap(a, b) { return a.x0 < b.x1 && a.x1 > b.x0 && a.y0 < b.y1 && a.y1 > b.y0; }
  // STR-ish bearing classes worth checking as "support beneath" candidates — mirrors _tierAuditRegate's
  // own bearing test shape (xyOverlap + below), not re-deriving new class logic.
  const bearingCls = /Column|Beam|Wall|Slab|Footing|Pile|Truss|Girder/i;
  const placedBearing = placed.filter(it => bearingCls.test(it.cls));

  const strPlaced = placed.filter(it => it.phase === 'Superstructure' || it.phase === 'Substructure');
  // High-elevation candidates: top 15% of placed STR/Substructure elements by base_z (roof/deck-height pieces).
  const sortedByBz = strPlaced.slice().sort((a, b) => b.bz - a.bz);
  const highCount = Math.max(1, Math.ceil(sortedByBz.length * 0.15));
  const highCandidates = sortedByBz.slice(0, highCount);

  const GAP_THRESHOLD = 3.0; // metres — more than one storey's worth of nothing below counts as "floating"
  const floaters = [];
  highCandidates.forEach(t => {
    let bestGap = Infinity, bestSupportGuid = null, bestSupportTz = null;
    placedBearing.forEach(s => {
      if (s.guid === t.guid) return;
      if (s.tz > t.bz + 0.05) return; // must actually be BELOW t's base, not overlapping/above
      if (!xyOverlap(s, t)) return;
      const gap = t.bz - s.tz;
      if (gap < bestGap) { bestGap = gap; bestSupportGuid = s.guid; bestSupportTz = s.tz; }
    });
    if (bestGap === Infinity || bestGap > GAP_THRESHOLD) {
      floaters.push({ t: t, gap: bestGap === Infinity ? null : bestGap, supportGuid: bestSupportGuid, supportTz: bestSupportTz });
    }
  });

  console.log('§HANG_PROBE Hospital highCandidates=' + highCandidates.length + ' (top 15% by base_z among placed STR/Substructure) floaters=' + floaters.length);
  floaters.slice(0, 15).forEach(f => {
    const t = f.t;
    console.log('  §HANG_FLOATER guid=' + t.guid + ' cls=' + t.cls + ' name="' + t.name + '" storey=' + t.storey +
      ' (rawStorey=' + t.rawStorey + ') phase=' + t.phase +
      ' bz=' + t.bz.toFixed(2) + ' tz=' + t.tz.toFixed(2) +
      ' sDay=' + ((t.s - base) / D).toFixed(2) + ' eDay=' + ((t.e - base) / D).toFixed(2) +
      ' nearestSupportBelow=' + (f.supportGuid || 'NONE') +
      (f.gap != null ? ' gapM=' + f.gap.toFixed(2) : ' gapM=inf(no xy-overlapping bearing element below it at all, placed or not)'));
  });

  // §HANG_PROBE_MEP (2026-08-14) — the user's own hypothesis, checked directly, not assumed: are the
  // elements shown floating actually MEP parts (pipe/duct/cable/fire/light/etc), and is their PHASE
  // wrong (e.g. silently bucketed into Superstructure)? Both checked against the real classified
  // items, not just source-reading matchRule in isolation.
  const mepPhases = ['MEP Rough-in', 'MEP Final'];
  const mepAll = items.filter(it => mepPhases.indexOf(it.phase) >= 0);
  const minMepS = mepAll.length ? Math.min.apply(null, mepAll.map(it => it.s)) : null;
  console.log('§HANG_PROBE_MEP Hospital mepTotal=' + mepAll.length +
    (minMepS != null ? ' earliestMepStartDay=' + ((minMepS - base) / D).toFixed(1) : ' (none found — check classification)'));
  const mepEarly = mepAll.filter(it => it.s <= cutoff);
  console.log('§HANG_PROBE_MEP Hospital MEP elements already visible by cutoff day ' + ((cutoff - base) / D).toFixed(2) + ': ' + mepEarly.length);
  mepEarly.slice(0, 15).forEach(it => {
    console.log('  §HANG_MEP_EARLY guid=' + it.guid + ' cls=' + it.cls + ' name="' + it.name + '" phase=' + it.phase +
      ' storey=' + it.storey + ' sDay=' + ((it.s - base) / D).toFixed(2));
  });
})();
