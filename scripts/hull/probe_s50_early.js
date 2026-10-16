#!/usr/bin/env node
// probe_s50_early.js — §S50.1.g EARLY MEASUREMENT (4D_GANTT_TM_REFACTOR.md §S50, 2026-08-21).
// STUDY ONLY, READ-ONLY, nothing shipped by this file. Run BEFORE the cell scheduler is built.
//
// ISSUE this probe proves/disproves (pass mark declared in §S50.1.g BEFORE this ran):
//   a building takes the CELL path only if hang-aware representability >= 0.88 (§S48.3's measured
//   split). Compiled-room coverage on LTU/Duplex is UNMEASURED; this measures it, plus the gate
//   quantity per building, on the WHOLE scheduled population (§S46 subset trap: population stated
//   on every line; the one restricted-population figure printed carries its own whole-pop control).
//
// Instruments named: RoomWalker.compileRooms (viewer/lib/room_walker.js v3, fresh in-memory,
// nothing written), LevelDeriver (§S35, bim-compiler build/level_deriver.js), CpmSchedule
// .contactGraph/.designatedSupport (the judge's own election, unchanged), §S47b representability
// formula (grid_probe.js lines 746-775 lineage).
//
// Command: BLD_DIR=~/bim-ootb/buildings node tests/probe_s50_early.js   (from viewer/)
// Read the § log lines, not the exit code.
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const initSqlJs = require(path.join(__dirname, '..', '..', 'modeller', 'lib', 'sql-wasm.js'));
const ScheduleGate = require(path.join(__dirname, '..', 'schedule_gate.js'));
const ScheduleAuthor = require(path.join(__dirname, '..', 'schedule_author.js'));
const CpmSchedule = require(path.join(__dirname, '..', 'cpm_schedule.js'));
const RoomWalker = require(path.join(__dirname, '..', 'lib', 'room_walker.js'));
const BIMC = process.env.BIM_COMPILER || path.join(require('os').homedir(), 'bim-compiler');
const LevelDeriver = require(path.join(BIMC, 'build', 'level_deriver.js'));
const tmSrc = fs.readFileSync(path.join(__dirname, '..', 'time_machine.js'), 'utf8');

const PASS_MARK = 0.88;   // §S50.1.g — declared before the run, from §S48.3's measured split

function sliceFn(src, name, which, optional) {
  let from = 0;
  for (let p = 0; p <= (which || 0); p++) {
    const idx = src.indexOf('function ' + name + '(', from);
    if (idx < 0) { if (optional) return null; throw new Error(name + ' not found'); }
    let depth = 0, i = idx, seenOpen = false;
    for (; i < src.length; i++) {
      if (src[i] === '{') { depth++; seenOpen = true; }
      else if (src[i] === '}') { depth--; if (seenOpen && depth === 0) break; }
    }
    if (p === (which || 0)) return src.slice(idx, i + 1);
    from = i + 1;
  }
}
const zoneParts = [sliceFn(tmSrc, '_zoneIndexBuild', 0, true), sliceFn(tmSrc, '_zoneIndex', 0, true)].filter(Boolean);
const classifyParts = [sliceFn(tmSrc, '_classifyNameOverride', 0, true), sliceFn(tmSrc, '_classifyRule', 0, true)].filter(Boolean);
const sliced = ['var _CPM_DISPLAY = true;',
  (zoneParts.length === 2 ? 'var _zoneMemo = [];' : ''), zoneParts[0] || '', zoneParts[1] || '',
  sliceFn(tmSrc, '_zoneOf', 0, true) || '',
  classifyParts[0] || '', classifyParts[1] || '',
  sliceFn(tmSrc, '_promoteRoofLoadPath'), sliceFn(tmSrc, '_buildXrayElements')].join('\n');

const BLD_DIR = process.env.BLD_DIR || path.join(require('os').homedir(), 'bim-ootb', 'buildings');
function resolveDbFile(bld) {
  const meta = path.join(BLD_DIR, bld + '_meta.db');
  const extracted = path.join(BLD_DIR, bld + '_extracted.db');
  if (fs.existsSync(meta)) return { path: meta, kind: 'meta' };
  return { path: extracted, kind: 'extracted' };
}
const BUILDINGS = (process.env.ONLY || 'Terminal,Hospital,Duplex,HHS_Office_Federated,Clinic,LTU_AHouse,JKR').split(',');

(async () => {
  const SQL = await initSqlJs({ wasmBinary: fs.readFileSync(path.join(__dirname, '..', '..', 'modeller', 'lib', 'sql-wasm.wasm')) });
  const rulesJson = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'rates', 'sequence_rules.json'), 'utf8'));
  const SR = rulesJson.SEQUENCE_RULES, SD = rulesJson.SEQUENCE_DEFAULT;
  const NO = rulesJson.SEQUENCE_NAME_OVERRIDES || rulesJson.NAME_OVERRIDES || [];
  const fleet = { pass: [], fail: [] };

  for (const bld of BUILDINGS) {
    const dbPick = resolveDbFile(bld);
    console.log('§S50_PROBE_DB ' + bld + ' using=' + path.basename(dbPick.path) + ' kind=' + dbPick.kind);
    if (!fs.existsSync(dbPick.path)) { console.log('§S50_PROBE ' + bld + ' MISSING DB'); continue; }
    const db = new SQL.Database(fs.readFileSync(dbPick.path));
    const sandbox = { console: { log: () => {}, warn: () => {} }, performance: { now: () => Date.now() },
      window: { SEQUENCE_RULES: SR, SEQUENCE_DEFAULT: SD, SEQUENCE_NAME_OVERRIDES: NO },
      ScheduleGate: ScheduleGate, Math: Math, A: () => ({ db: db }), URLSearchParams: URLSearchParams };
    vm.createContext(sandbox);
    vm.runInContext(sliced + '\nthis.__bxe = _buildXrayElements;', sandbox);
    const els = sandbox.__bxe();
    if (!els || !els.length) { console.log('§S50_PROBE ' + bld + ' element build produced nothing'); db.close(); continue; }
    const geoEls = els.filter(e => !(e.x0 === e.x1 && e.y0 === e.y1 && e.base_z === e.top_z));
    // phase via the same classify chain the witness uses (needed only for the §S46 control key)
    const nameOf = {};
    const nr = db.exec("SELECT guid, COALESCE(element_name,'') FROM elements_meta");
    if (nr.length) nr[0].values.forEach(v => { nameOf[v[0]] = v[1]; });
    geoEls.forEach(e => {
      const rule = ScheduleAuthor.matchNameOverride(e.cls, nameOf[e.guid] || '', NO) || ScheduleAuthor.matchRule(e.cls, SR, SD);
      if (!e.phase) e.phase = rule.phase;
    });

    // ── vertical axis: §S35 LevelDeriver, as built ────────────────────────────────────────────
    const L = LevelDeriver.readLookups(db);
    const G = LevelDeriver.buildGrid(L, geoEls); G.medGap = LevelDeriver.medianGap(G.grid);
    const lvlOf = {};   // guid -> grid idx (or -1)
    let t4 = 0;
    geoEls.forEach(e => {
      const r = LevelDeriver.levelFor(e, L.rawStorey[e.guid], L, G);
      lvlOf[e.guid] = (r.idx == null ? -1 : r.idx);
      if (r.tier === 'T4') t4++;
    });

    // ── persisted RM_ rows (reported, NOT used for filing — version skew, see §S50.2) ─────────
    let persistedRM = 0, persistedNonRM = 0;
    try {
      const pr = db.exec("SELECT COUNT(*), SUM(CASE WHEN space_guid NOT LIKE 'RM_%' THEN 1 ELSE 0 END) FROM rel_contained_in_space");
      if (pr.length) { persistedRM = pr[0].values[0][0] - (pr[0].values[0][1] || 0); persistedNonRM = pr[0].values[0][1] || 0; }
    } catch (e) { /* no table */ }

    // ── compiled rooms: fresh, in-memory, current walker version — NOTHING WRITTEN ────────────
    const t0 = Date.now();
    let compiled;
    const quiet = console.log; console.log = () => {};
    try { compiled = RoomWalker.compileRooms(db); } finally { console.log = quiet; }
    const compileMs = Date.now() - t0;
    const rooms = compiled.rooms.filter(r => !r.suspect);   // same exclusion writeRooms applies
    // containment join — IDENTICAL math to writeRooms (via the exported helpers)
    const floorAnchorsAcc = {};
    rooms.forEach(r => {
      const cf = RoomWalker._canonicalFloor(r.storey);
      if (cf !== null) (floorAnchorsAcc[cf] = floorAnchorsAcc[cf] || []).push(r.cz);
    });
    const floorAnchors = {};
    Object.keys(floorAnchorsAcc).forEach(cf => {
      const v = floorAnchorsAcc[cf];
      floorAnchors[cf] = v.reduce((s, x) => s + x, 0) / v.length;
    });
    const joinKey = RoomWalker._makeJoinKey(floorAnchors);
    const byst = {};
    rooms.forEach(r => { const k = joinKey(r.storey, r.cz); (byst[k] = byst[k] || []).push(r); });
    const roomOf = {};   // guid -> room guid
    const roomLvl = {};  // room guid -> grid idx (geomIdx of the room's own z anchor)
    rooms.forEach(r => { roomLvl[r.guid] = G.grid.length ? LevelDeriver.geomIdx(G.grid, r.cz) : -1; });
    // element raw storey + center for the join — writeRooms' own inputs (m.storey, t.center_z)
    geoEls.forEach(e => {
      const cz = (e.base_z + e.top_z) / 2;
      const cand = byst[joinKey(L.rawStorey[e.guid], cz)] || [];
      const ex = (e.x0 + e.x1) / 2, ey = (e.y0 + e.y1) / 2;
      for (let i = 0; i < cand.length; i++) {
        const r = cand[i], rcs = r.rects || [r];
        let hit = false;
        for (let q = 0; q < rcs.length; q++) {
          if (Math.abs(ex - rcs[q].cx) <= rcs[q].sx / 2 && Math.abs(ey - rcs[q].cy) <= rcs[q].sy / 2) { hit = true; break; }
        }
        if (hit) { roomOf[e.guid] = r.guid; break; }
      }
    });
    const nRoomed = Object.keys(roomOf).length;
    const N = geoEls.length;
    console.log('§S50_COVERAGE ' + bld + ' population=' + N + ' (ALL scheduled geo elements — not a subset)' +
      ' declaredIFC=' + persistedNonRM + ' persistedRM=' + persistedRM + ' (reported, not used: version-skewed old compile)' +
      ' freshCompiledRooms=' + rooms.length + ' (+' + (compiled.rooms.length - rooms.length) + ' suspect excluded)' +
      ' elementsInCompiledRoom=' + nRoomed + ' (' + (100 * nRoomed / N).toFixed(2) + '%)' +
      ' levelOnly=' + (N - nRoomed) + ' (' + (100 * (N - nRoomed) / N).toFixed(2) + '%)' +
      ' lvlT4=' + t4 + ' lvlGridSource=' + G.source + ' compileMs=' + compileMs);

    // ── final filing: room level wins for roomed elements; then §S47b hang promotion ──────────
    const items = geoEls.map(e => ({ guid: e.guid, cls: e.cls, seq: e.seq,
      bz: e.base_z, tz: e.top_z, x0: e.x0, x1: e.x1, y0: e.y0, y1: e.y1 }));
    const lvl1 = {};   // pre-promotion level
    geoEls.forEach(e => {
      lvl1[e.guid] = roomOf[e.guid] != null ? roomLvl[roomOf[e.guid]] : lvlOf[e.guid];
    });
    const Gc = CpmSchedule.contactGraph(items);
    const des = CpmSchedule.designatedSupport(items, Gc);
    const lvl2 = {}, loc2 = {};
    geoEls.forEach(e => { lvl2[e.guid] = lvl1[e.guid]; loc2[e.guid] = roomOf[e.guid] || ('L' + lvl1[e.guid]); });
    let promoted = 0;
    for (let i = 0; i < des.length; i++) {
      if (des[i] < 0) continue;
      const a = items[des[i]], b = items[i];
      if (lvl1[a.guid] > lvl1[b.guid]) { lvl2[b.guid] = lvl1[a.guid]; loc2[b.guid] = loc2[a.guid]; promoted++; }
    }
    const trdOf = it => (typeof it.seq === 'number' ? it.seq : 99);
    // gate quantity — §S47b formula at LEVEL grain (the grain §S48.3's 0.88 was calibrated on)
    let intra = 0, ok = 0, refused = 0;
    // room-grain split, for the record (same edges, finer key)
    let cIntra = 0, cParallel = 0, cOk = 0, cRefused = 0;
    for (let i = 0; i < des.length; i++) {
      if (des[i] < 0) continue;
      const a = items[des[i]], b = items[i];
      const la = lvl2[a.guid], lb = lvl2[b.guid], ta = trdOf(a), tb = trdOf(b);
      if (la === lb && ta === tb) intra++;
      else if (lb >= la && tb >= ta) ok++;
      else refused++;
      if (la === lb && ta === tb) { if (loc2[a.guid] === loc2[b.guid]) cIntra++; else cParallel++; }
      else if (lb >= la && tb >= ta) cOk++;
      else cRefused++;
    }
    const total = intra + ok + refused;
    const repr = total ? (intra + ok) / total : 1;
    const gate = repr >= PASS_MARK ? 'cell' : 'graph';
    (gate === 'cell' ? fleet.pass : fleet.fail).push(bld);
    console.log('§S50_GATE ' + bld + ' population=' + N + ' E1edges=' + total +
      ' insideLT=' + intra + ' representable=' + ok + ' REFUSED=' + refused +
      ' repr=' + (100 * repr).toFixed(2) + '% mark=' + (100 * PASS_MARK) + '% path=' + gate.toUpperCase() +
      ' promoted=' + promoted + ' (' + (100 * promoted / N).toFixed(2) + '%)' +
      ' [instrument: §S47b formula, level grain, designatedSupport unchanged]');
    console.log('§S50_ROOMGRAIN ' + bld + ' sameLT_sameRoom=' + cIntra + ' sameLT_crossRoom(PARALLEL,unordered)=' + cParallel +
      ' representable=' + cOk + ' refused=' + cRefused +
      ' — cross-room same-(level,trade) edges are NOT ordered by the grid; packing (bz,guid) is all that orders them');
    // §S46 control: the ROOMED subpopulation's repr, next to the SAME subpopulation at coarse
    // storey|phase... repr is not a cycle test, so the honest control is subset-vs-whole: if the
    // roomed subset reads much better than the whole population, the subset is doing the work.
    let rIn = 0, rOkN = 0, rRef = 0;
    for (let i = 0; i < des.length; i++) {
      if (des[i] < 0) continue;
      const a = items[des[i]], b = items[i];
      if (!roomOf[a.guid] || !roomOf[b.guid]) continue;
      const la = lvl2[a.guid], lb = lvl2[b.guid], ta = trdOf(a), tb = trdOf(b);
      if (la === lb && ta === tb) rIn++;
      else if (lb >= la && tb >= ta) rOkN++;
      else rRef++;
    }
    const rTot = rIn + rOkN + rRef;
    console.log('§S50_SUBSET_CONTROL ' + bld + ' roomedPop=' + nRoomed + ' edgesBothRoomed=' + rTot +
      ' reprOnSubset=' + (rTot ? (100 * (rIn + rOkN) / rTot).toFixed(2) : 'n/a') + '%' +
      ' vs reprWholePop=' + (100 * repr).toFixed(2) + '% (§S46 discipline: a subset figure never stands alone)');
    db.close();
  }
  console.log('§S50_PROBE_VERDICT pathCELL=[' + fleet.pass.join(',') + '] pathGRAPH=[' + fleet.fail.join(',') + ']' +
    ' — mark declared before the run; no tuning. GUARD: this probe CAN fail a building (any repr<' + PASS_MARK +
    ' routes to graph) and CAN pass one; both outcomes present above = the gate is exercised, neither is a structural constant.');
})();
