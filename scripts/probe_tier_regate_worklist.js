#!/usr/bin/env node
// probe_tier_regate_worklist.js — A/B harness, git-committed OLD full-rescan `_tierAuditRegate`
// vs the CURRENT WORKING TREE's worklist/dirty-queue rewrite (2026-08-14, bim-compiler
// prompts/4D_SCHEDULE_PERFECTION.md §TIER_REGATE_WORKLIST — the dedicated follow-up session
// SESSION 7 named: "_tierAuditRegate's full-array-rescan fixpoint is the dominant cost of the
// ENTIRE 4D generation pipeline on large/complex buildings" — 15,466ms of Terminal's 19,773ms
// _twoTierRemap total).
//
// STUDY ONLY — proves equivalence + measures speedup before/after the shipped-file edit. Not a
// witness (no `assert`), a probe: read the numbers, don't trust the exit code.
//
// Method: build real `items` for each building the SAME way probe_arch_start.js does
// (_buildXrayElements -> ScheduleAuthor classify -> ScheduleGate.computeSchedule) — geometry is
// pulled from the WORKING TREE (both variants run against the identical building data, only the
// _tierAuditRegate/_twoTierRemap SOURCE differs) — then run _twoTierRemap on two independent
// clones: OLD is `git show <OLD_REF>:viewer/time_machine.js`, NEW is the working tree's own
// viewer/time_machine.js. Diffs every guid's final `.s`/`.e` — must be byte-identical, not just
// matching pass/fail counts, per this project's own §DEQ_REPAIR precedent.
//
// Command (from bim-compiler/, VIEWER_DIR a git worktree):
//   VIEWER_DIR=/tmp/wt-tier-audit-regate/viewer OLD_REF=14c042bcd1 BLD_DIR=~/bim-ootb/buildings \
//     node scripts/probe_tier_regate_worklist.js
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { execFileSync } = require('child_process');
const HOME = require('os').homedir();
const VIEWER_DIR = process.env.VIEWER_DIR || path.join(HOME, 'bim-ootb', 'viewer');
const SQLJS_DIR = process.env.SQLJS_DIR || path.join(HOME, 'bim-ootb', 'modeller', 'lib');
const OLD_REF = process.env.OLD_REF || 'origin/main';
const initSqlJs = require(path.join(SQLJS_DIR, 'sql-wasm.js'));
const ScheduleGate = require(path.join(VIEWER_DIR, 'schedule_gate.js'));
const ScheduleAuthor = require(path.join(VIEWER_DIR, 'schedule_author.js'));
const newTmSrc = fs.readFileSync(path.join(VIEWER_DIR, 'time_machine.js'), 'utf8');
const REPO_ROOT = execFileSync('git', ['-C', VIEWER_DIR, 'rev-parse', '--show-toplevel']).toString('utf8').trim();
const VIEWER_REL = path.relative(REPO_ROOT, VIEWER_DIR).split(path.sep).join('/');
const oldTmSrc = execFileSync('git', ['-C', VIEWER_DIR, 'show', OLD_REF + ':' + VIEWER_REL + '/time_machine.js'], { maxBuffer: 1 << 28 }).toString('utf8');

function sliceFn(src, name, which) {
  let from = 0;
  for (let pass = 0; pass <= (which || 0); pass++) {
    const idx = src.indexOf('function ' + name + '(', from);
    if (idx < 0) throw new Error(name + ' #' + (which || 0) + ' not found');
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

function commonPartsFrom(src) {
  const tierOrderLine = "var _TIER1_ORDER = ['Substructure', 'Superstructure', 'Architecture'];";
  const zoneParts = [sliceFn(src, '_zoneIndexBuild'), sliceFn(src, '_zoneIndex')];
  const zoneOfPart = sliceFn(src, '_zoneOf');
  return [tierOrderLine, 'var _zoneMemo = [];', zoneParts[0], zoneParts[1], zoneOfPart,
    sliceFn(src, '_promoteRoofLoadPath'), sliceFn(src, '_buildXrayElements'),
    sliceFn(src, '_tier1Extents'), sliceFn(src, '_tier1Serialize'),
    sliceFn(src, '_tier1Protrusion')].join('\n');
}

// Each variant is sliced ENTIRELY from its own source revision — old regate/remap text from
// OLD_REF, new regate/remap text from the working tree — no hand-copied prototype in this file at
// all, so this is a true A/B of what was actually committed vs what actually ships.
const oldFull = commonPartsFrom(oldTmSrc) + '\n' + sliceFn(oldTmSrc, '_tierAuditRegate') + '\n' + sliceFn(oldTmSrc, '_twoTierRemap');
const newFull = commonPartsFrom(newTmSrc) + '\n' + sliceFn(newTmSrc, '_tierAuditRegate') + '\n' + sliceFn(newTmSrc, '_twoTierRemap');

const BLD_DIR = process.env.BLD_DIR || path.join(HOME, 'bim-ootb', 'buildings');
const DB_FILE = { LTU_AHouse: 'LTU_AHouse_meta.db' };
const BUILDINGS = (process.env.ONLY || 'Terminal,Hospital,Duplex,HHS_Office_Federated,Clinic,LTU_AHouse,JKR').split(',');
const now = () => Number(process.hrtime.bigint() / 1000000n);

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

(async () => {
  const SQL = await initSqlJs({ wasmBinary: fs.readFileSync(path.join(SQLJS_DIR, 'sql-wasm.wasm')) });
  const _ship = loadShipTables();
  const SR = _ship.SR, SD = _ship.SD, LR = _ship.LR, NO = _ship.NO, RATES = _ship.RATES;

  console.log('§TIER_REGATE_WL_PROBE viewer=' + VIEWER_DIR + ' oldRef=' + OLD_REF);

  function makeSandbox(fullSrc) {
    const sandbox = { console: { log: () => {}, warn: () => {} }, performance: { now: () => Date.now() },
      window: { SEQUENCE_RULES: SR, SEQUENCE_DEFAULT: SD, SEQUENCE_NAME_OVERRIDES: NO },
      ScheduleGate: ScheduleGate, Math: Math, RegExp: RegExp, Object: Object, Infinity: Infinity,
      WeakMap: WeakMap, A: () => ({}) };
    vm.createContext(sandbox);
    vm.runInContext(fullSrc + '\nthis.__bxe = _buildXrayElements; this.__remap = _twoTierRemap;', sandbox);
    return sandbox;
  }
  const oldSandbox = makeSandbox(oldFull);
  const newSandbox = makeSandbox(newFull);

  let allMatch = true;
  for (const bld of BUILDINGS) {
    const dbPath = path.join(BLD_DIR, DB_FILE[bld] || (bld + '_extracted.db'));
    if (!fs.existsSync(dbPath)) { console.log('§TIER_REGATE_WL ' + bld + ' fixture missing: ' + dbPath); continue; }
    const db = new SQL.Database(fs.readFileSync(dbPath));
    const A = () => ({ db: db, activeBuilding: bld, _metaGen: 0 });
    oldSandbox.A = A; newSandbox.A = A;

    const els = oldSandbox.__bxe();
    if (!els || !els.length) { console.log('§TIER_REGATE_WL ' + bld + ' element build produced nothing'); db.close(); continue; }
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

    const crewWorkDays = {};
    geoEls.forEach(e => { const r = e.resource || '_DEFAULT';
      crewWorkDays[r] = (crewWorkDays[r] || 0) + (e.installSecs || 0) / 28800; });
    let totSecs = 0; geoEls.forEach(e => { totSecs += e.installSecs || 0; });
    const projDays = Math.max(10, Math.ceil(totSecs * 1000 / 86400000));
    const maxCrews = {};
    for (const rk in LR) {
      if (!LR[rk].max_crews && LR[rk].max_crews_fixed == null) continue;
      const base = LR[rk].max_crews || 0, wd = crewWorkDays[rk] || 0;
      const need = Math.ceil(wd / projDays);
      maxCrews[rk] = (LR[rk].max_crews_fixed != null) ? LR[rk].max_crews_fixed : Math.max(base, need);
    }
    const sched = ScheduleGate.computeSchedule(geoEls, 0, 1, maxCrews, _ship.SHIFT_HOURS);

    const mkItems = () => geoEls.map(e => ({ guid: e.guid, s: sched[e.guid].start, e: sched[e.guid].end,
      bz: e.base_z, tz: e.top_z, x0: e.x0, x1: e.x1, y0: e.y0, y1: e.y1, cls: e.cls, seq: e.seq, phase: e.phase,
      storey: e.storey }));

    const itemsOld = mkItems(), itemsNew = mkItems();
    let t0 = now();
    oldSandbox.__items = itemsOld;
    vm.runInContext('this.__remap(this.__items);', oldSandbox);
    const msOld = now() - t0;

    t0 = now();
    newSandbox.__items = itemsNew;
    vm.runInContext('this.__remap(this.__items);', newSandbox);
    const msNew = now() - t0;

    const byGuidOld = {}; itemsOld.forEach(it => { byGuidOld[it.guid] = it; });
    let mismatches = 0, worstDelta = 0, worstGuid = null;
    itemsNew.forEach(it => {
      const o = byGuidOld[it.guid];
      if (!o || o.s !== it.s || o.e !== it.e) {
        mismatches++;
        const d = Math.abs((o ? o.s : 0) - it.s);
        if (d > worstDelta) { worstDelta = d; worstGuid = it.guid; }
      }
    });
    if (mismatches) allMatch = false;
    console.log('§TIER_REGATE_WL ' + bld + ' n=' + geoEls.length +
      ' msOld=' + msOld.toFixed(0) + ' msNew=' + msNew.toFixed(0) +
      ' speedup=' + (msOld / Math.max(1, msNew)).toFixed(1) + 'x' +
      ' mismatches=' + mismatches + (mismatches ? ' worstDeltaMs=' + worstDelta + ' guid=' + worstGuid : ' (byte-identical)'));
  }
  console.log('§TIER_REGATE_WL_RESULT ' + (allMatch ? 'ALL BUILDINGS BYTE-IDENTICAL' : 'MISMATCH FOUND — DO NOT SHIP'));
})();
