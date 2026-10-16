#!/usr/bin/env node
// probe_s32_level_coverage.js — §S32.4 MEASUREMENT (2026-08-19). STUDY ONLY, READ-ONLY, nothing in
// viewer/ or buildings/*.db changes. It answers the ONE question §S32.4 sets as the acceptance bar
// for any future runtime level-derivation pass:
//
//   For every scheduled element on every one of the 7 fleet buildings, can a runtime pass assign a
//   LEVEL (an ordered storey/elevation identity) with 100% coverage, reading the FROZEN DB only?
//
// The fallback ladder, most-declared first (task spec, verbatim):
//   T1 declared  — rel_contained_in_space -> space -> its parent storey (spatial_structure,
//                  type=IfcBuildingStorey) -> that storey's center_z
//   T2 declared  — elements_meta.storey NAME -> a spatial_structure storey row of the SAME NAME
//                  carrying a real center_z (name-keyed, since storey guids in these DBs are
//                  synthetic/name-derived per §S31.4)
//   T3 derived   — the element's OWN geometry z (base_z/top_z from element_transforms, already
//                  computed by ScheduleAuthor._buildScheduleElements), banded into BAND_M levels
//   T4 default   — nothing worked (would mean base_z/top_z is non-finite — see §S32_SELFTEST case D)
//
// Population = ScheduleAuthor._buildScheduleElements() output, i.e. exactly the elements that reach
// the schedule (IfcOpeningElement / IfcSpace already excluded upstream, "noGeo" all-zero-transform
// rows already dropped upstream) — this is the literal "every scheduled element" the ruling asks
// about, not the raw elements_meta row count.
//
// ⚠ DO NOT REMOVE — read the log after every run; exit code is not evidence.
// Instrument discipline (this lane's most reliable failure — §STATUS "Standing instrument rule"):
// every tier count and every "zero"/"100%" claim below is paired with a guard that proves the
// classifier COULD have produced a different answer — §S32_SELFTEST exercises all 4 tiers on
// synthetic fixtures (including a deliberately-broken one that MUST land on T4), and §S32_T1CHECK
// cross-checks this probe's own T1 counts against §S26.16's independently-measured
// rel_contained_in_space coverage (Hospital 8474, Clinic 2133, Terminal 1009, JKR 107, HHS 88, LTU 0).
//
// Usage:  node scripts/probe_s32_level_coverage.js            (whole fleet)
//         ONLY=Duplex_extracted node scripts/probe_s32_level_coverage.js
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = process.env.OOTB || path.join(require('os').homedir(), 'bim-ootb');
const initSqlJs = require(path.join(ROOT, 'modeller', 'lib', 'sql-wasm.js'));
const ScheduleAuthor = require(path.join(ROOT, 'viewer', 'schedule_author.js'));

const BLD = path.join(ROOT, 'buildings');
const DEFAULT_FLEET = ['Terminal_meta', 'Hospital_meta', 'Clinic_meta', 'LTU_AHouse_meta',
                       'Duplex_extracted', 'HHS_Office_Federated_extracted', 'JKR_extracted'];
const FLEET = (process.env.ONLY || DEFAULT_FLEET.join(',')).split(',');
const BAND_M = Number(process.env.BAND_M || 3);          // T3 clustering width — the shipped §S1_BAND_RANK convention
const INCONSISTENT_M = Number(process.env.INCONSISTENT_M || 3);  // task-specified "more than 3m away" threshold

// §S26.16 rel_contained_in_space row counts, independently measured and already committed to
// prompts/4D_GANTT_TM_REFACTOR.md line 1121. This probe's T1 (element resolves through
// rel_contained_in_space -> space -> storey-with-center_z) must equal these counts EXACTLY on the
// buildings where §S26.16 measured them, because every space referenced by rel_contained_in_space
// in this fleet turns out to route to a storey that DOES carry center_z (verified by direct query
// before writing this probe) — so a mismatch here is proof this probe's join logic is wrong, not a
// property of the data. This is the "judgeCanFail" guard for the T1 tier.
const S26_16_T1_EXPECT = { Hospital_meta: 8474, Clinic_meta: 2133, Terminal_meta: 1009,
  JKR_extracted: 107, HHS_Office_Federated_extracted: 88, LTU_AHouse_meta: 0 };
  // Duplex_extracted: no rel_contained_in_space table at all — expect 0, checked separately.

// ── column-shape landmine, noted not hidden: LTU_AHouse_meta declares
//    `rel_contained_in_space (element_guid TEXT, space_guid TEXT)` — REVERSED column order vs every
//    other building's `(space_guid TEXT, element_guid TEXT)`. Selecting by NAME (not position) below
//    is what makes this harmless; a positional `row[0]/row[1]` read would silently swap LTU's pairs. ──

function tableExists(db, name) {
  const r = db.exec("SELECT name FROM sqlite_master WHERE type='table' AND name=" + JSON.stringify(name));
  return !!(r.length && r[0].values.length);
}
function columnExists(db, table, col) {
  const r = db.exec('PRAGMA table_info(' + table + ')');
  if (!r.length) return false;
  const nameIdx = r[0].columns.indexOf('name');
  return r[0].values.some(row => row[nameIdx] === col);
}

// ── the classifier itself — pure function, fixture-testable (§S32_SELFTEST below exercises it) ────
// lookups = { elementSpaces: guid -> [space_guid...], spaceParent: guid -> storey_guid,
//             storeyCenterZ: guid -> center_z|null, storeyNameCenterZ: name -> center_z|null }
function classifyLevel(el, rawStorey, lookups) {
  // T1 — rel_contained_in_space -> space -> parent storey -> center_z
  const spaces = lookups.elementSpaces[el.guid];
  if (spaces) {
    for (let i = 0; i < spaces.length; i++) {
      const storeyGuid = lookups.spaceParent[spaces[i]];
      if (storeyGuid == null) continue;
      const cz = lookups.storeyCenterZ[storeyGuid];
      if (cz != null && Number.isFinite(cz)) return { tier: 'T1', level: cz };
    }
  }
  // T2 — elements_meta.storey NAME -> spatial_structure storey of same name with real center_z
  if (rawStorey && rawStorey !== '_UNKNOWN' && !/^unknown$/i.test(rawStorey)) {
    const cz = lookups.storeyNameCenterZ[rawStorey];
    if (cz != null && Number.isFinite(cz)) return { tier: 'T2', level: cz };
  }
  // T3 — own geometry z, banded
  const center = (el.base_z + el.top_z) / 2;
  if (Number.isFinite(center)) return { tier: 'T3', level: Math.floor(center / BAND_M) * BAND_M };
  // T4 — nothing worked
  return { tier: 'T4', level: null };
}

// ── §S32_SELFTEST — proves the classifier is capable of landing on EVERY tier, run once, printed
// before any real building is touched. A ladder that always reports the same tier regardless of
// input would be exactly the kind of false-positive this lane keeps producing (§STATUS "Standing
// instrument rule"): this fixture-tests all 4 branches independently. ────────────────────────────
function selftest() {
  const cases = [
    { name: 'A_T1_via_space', el: { guid: 'e1', base_z: 999, top_z: 999 }, rawStorey: '_UNKNOWN',
      lookups: { elementSpaces: { e1: ['s1'] }, spaceParent: { s1: 'st1' }, storeyCenterZ: { st1: 5.0 }, storeyNameCenterZ: {} },
      expect: 'T1' },
    { name: 'B_T2_via_name', el: { guid: 'e2', base_z: 999, top_z: 999 }, rawStorey: 'Level 2',
      lookups: { elementSpaces: {}, spaceParent: {}, storeyCenterZ: {}, storeyNameCenterZ: { 'Level 2': 8.5 } },
      expect: 'T2' },
    { name: 'C_T3_own_geometry', el: { guid: 'e3', base_z: 10.4, top_z: 11.0 }, rawStorey: 'Unknown',
      lookups: { elementSpaces: {}, spaceParent: {}, storeyCenterZ: {}, storeyNameCenterZ: {} },
      expect: 'T3' },
    { name: 'D_T4_nothing_works', el: { guid: 'e4', base_z: NaN, top_z: NaN }, rawStorey: '_UNKNOWN',
      lookups: { elementSpaces: {}, spaceParent: {}, storeyCenterZ: {}, storeyNameCenterZ: {} },
      expect: 'T4' },
    // priority checks: T1 must win even when T2/T3 would ALSO resolve, T2 must win over T3
    { name: 'E_T1_beats_T2_and_T3', el: { guid: 'e5', base_z: 1, top_z: 1 }, rawStorey: 'Level 2',
      lookups: { elementSpaces: { e5: ['s1'] }, spaceParent: { s1: 'st1' }, storeyCenterZ: { st1: 5.0 }, storeyNameCenterZ: { 'Level 2': 999 } },
      expect: 'T1' },
    { name: 'F_T2_beats_T3', el: { guid: 'e6', base_z: 1, top_z: 1 }, rawStorey: 'Level 3',
      lookups: { elementSpaces: {}, spaceParent: {}, storeyCenterZ: {}, storeyNameCenterZ: { 'Level 3': 8.5 } },
      expect: 'T2' },
  ];
  let pass = 0;
  cases.forEach(c => {
    const got = classifyLevel(c.el, c.rawStorey, c.lookups);
    const ok = got.tier === c.expect;
    if (ok) pass++;
    console.log('§S32_SELFTEST case=' + c.name + ' expect=' + c.expect + ' got=' + got.tier + (ok ? ' PASS' : ' ✗ FAIL'));
  });
  console.log('§S32_SELFTEST_VERDICT ' + pass + '/' + cases.length + (pass === cases.length ? ' ALL PASS — classifier proven capable of every tier, including T4' : '  ⚠ SELFTEST FAILURE — do not trust tier counts below'));
  return pass === cases.length;
}

async function runBuilding(SQL, RATES, bld) {
  const dbPath = path.join(BLD, bld + '.db');
  if (!fs.existsSync(dbPath)) { console.log('§S32_SKIP ' + bld + ' (no db file)'); return null; }
  // read-only: sql.js loads the file into an in-memory buffer; db.run() is never called anywhere in
  // this script (only db.exec() for SELECT/PRAGMA), and the buffer is never written back to disk.
  const db = new SQL.Database(fs.readFileSync(dbPath));

  const elements = ScheduleAuthor._buildScheduleElements(db, RATES.SEQUENCE_RULES, {
    laborRates: RATES.LABOR_RATES, rates: RATES.RATES,
    nameOverrides: RATES.SEQUENCE_NAME_OVERRIDES, defaultRule: RATES.SEQUENCE_DEFAULT });
  const n = elements.length;
  if (!n) { console.log('§S32_SKIP ' + bld + ' (0 scheduled elements)'); db.close(); return null; }

  // raw elements_meta.storey (pre-median-Z-reassignment — _buildScheduleElements already overwrote
  // `storey` with its own nearest-storey guess, which is a DIFFERENT derivation than T2 below; T2
  // must see the ORIGINAL declared name, "Unknown" included, so it is re-queried here from source).
  const rawStoreyByGuid = {};
  db.exec('SELECT guid, storey FROM elements_meta').forEach(res => {
    res.values.forEach(row => { rawStoreyByGuid[row[0]] = row[1]; });
  });

  // rel_contained_in_space (Duplex_extracted has no such table — tableExists guards it)
  const elementSpaces = {};
  let relRows = 0;
  if (tableExists(db, 'rel_contained_in_space')) {
    db.exec('SELECT space_guid, element_guid FROM rel_contained_in_space').forEach(res => {
      relRows = res.values.length;
      res.values.forEach(row => {
        const sg = row[0], eg = row[1];
        (elementSpaces[eg] || (elementSpaces[eg] = [])).push(sg);
      });
    });
  }

  // spatial_structure (Duplex_extracted has no such table)
  const spaceParent = {}, storeyCenterZ = {}, storeyNameCenterZAll = {};
  let storeyRows = 0, storeyRowsWithZ = 0, ambiguousNames = [];
  if (tableExists(db, 'spatial_structure')) {
    const hasCenterZ = columnExists(db, 'spatial_structure', 'center_z');
    const cols = hasCenterZ ? 'guid, type, name, parent_guid, center_z' : 'guid, type, name, parent_guid';
    db.exec('SELECT ' + cols + ' FROM spatial_structure').forEach(res => {
      res.values.forEach(row => {
        const guid = row[0], type = row[1], name = row[2], parent = row[3];
        const cz = hasCenterZ ? row[4] : null;
        if (type === 'IfcSpace') spaceParent[guid] = parent;
        if (type === 'IfcBuildingStorey') {
          storeyRows++;
          if (cz != null) {
            storeyRowsWithZ++;
            storeyCenterZ[guid] = cz;
            if (name) {
              if (!storeyNameCenterZAll[name]) storeyNameCenterZAll[name] = [];
              storeyNameCenterZAll[name].push(cz);
            }
          }
        }
      });
    });
  }
  // T2 lookup table + ambiguity check (§S31.4 measured 0 ambiguous on this fleet — re-verified here,
  // not assumed, because a name mapping to two different elevations would make T2 UNSAFE)
  const storeyNameCenterZ = {};
  Object.keys(storeyNameCenterZAll).forEach(name => {
    const zs = storeyNameCenterZAll[name];
    const min = Math.min(...zs), max = Math.max(...zs);
    storeyNameCenterZ[name] = zs[0];
    if (max - min > 0.01) ambiguousNames.push(name + ' spread=' + (max - min).toFixed(2) + 'm (n=' + zs.length + ')');
  });

  const lookups = { elementSpaces, spaceParent, storeyCenterZ, storeyNameCenterZ };

  const tierCount = { T1: 0, T2: 0, T3: 0, T4: 0 };
  const declared = []; // {tier, declaredZ, ownZ} for T1/T2 consistency check
  elements.forEach(el => {
    const rawStorey = rawStoreyByGuid[el.guid];
    const r = classifyLevel(el, rawStorey, lookups);
    tierCount[r.tier]++;
    if (r.tier === 'T1' || r.tier === 'T2') {
      const ownZ = (el.base_z + el.top_z) / 2;
      declared.push({ tier: r.tier, declaredZ: r.level, ownZ });
    }
  });

  const pct = t => (100 * tierCount[t] / n).toFixed(2);
  console.log('§S32_BUILD ' + bld + ' n=' + n + ' relContainedRows=' + relRows +
    ' storeyRows=' + storeyRows + ' storeyRowsWithCenterZ=' + storeyRowsWithZ +
    ' ambiguousStoreyNames=' + ambiguousNames.length);
  ambiguousNames.forEach(a => console.log('§S32_AMBIGUOUS ' + bld + ' ' + a));
  console.log('§S32_TIER ' + bld + ' n=' + n +
    ' T1=' + tierCount.T1 + ' (' + pct('T1') + '%)' +
    ' T2=' + tierCount.T2 + ' (' + pct('T2') + '%)' +
    ' T3=' + tierCount.T3 + ' (' + pct('T3') + '%)' +
    ' T4=' + tierCount.T4 + ' (' + pct('T4') + '%)' +
    ' T4zero=' + (tierCount.T4 === 0 ? 'YES' : 'NO — GAP FOUND'));

  // guard: T1 cross-check against §S26.16's independently-measured rel_contained_in_space coverage
  if (Object.prototype.hasOwnProperty.call(S26_16_T1_EXPECT, bld)) {
    const expect = S26_16_T1_EXPECT[bld];
    const match = tierCount.T1 === expect;
    console.log('§S32_T1CHECK ' + bld + ' measured=' + tierCount.T1 + ' expected(§S26.16)=' + expect +
      ' ' + (match ? 'MATCH' : '✗ MISMATCH — T1 join logic disagrees with the independently-measured baseline'));
  } else if (bld === 'Duplex_extracted') {
    console.log('§S32_T1CHECK ' + bld + ' measured=' + tierCount.T1 + ' expected(§S31.4)=0 (no rel_contained_in_space table)' +
      ' ' + (tierCount.T1 === 0 ? 'MATCH' : '✗ MISMATCH'));
  }

  // declared-vs-geometry consistency: does the DECLARED elevation (T1/T2) agree with the element's
  // own z? A declared value that contradicts geometry is worse than a derived one (task spec).
  ['T1', 'T2'].forEach(tier => {
    const rows = declared.filter(d => d.tier === tier);
    if (!rows.length) { console.log('§S32_CONSISTENCY ' + bld + ' tier=' + tier + ' n=0 (no elements at this tier)'); return; }
    const bad = rows.filter(d => Math.abs(d.declaredZ - d.ownZ) > INCONSISTENT_M);
    console.log('§S32_CONSISTENCY ' + bld + ' tier=' + tier + ' n=' + rows.length +
      ' inconsistentGt' + INCONSISTENT_M + 'm=' + bad.length +
      ' (' + (100 * bad.length / rows.length).toFixed(2) + '%)');
    bad.slice(0, 3).forEach(d => console.log('§S32_CONSISTENCY_EG ' + bld + ' tier=' + tier +
      ' declaredZ=' + d.declaredZ.toFixed(2) + ' ownZ=' + d.ownZ.toFixed(2) +
      ' diff=' + Math.abs(d.declaredZ - d.ownZ).toFixed(2) + 'm'));
  });

  db.close();
  return { bld, n, tierCount };
}

async function main() {
  const selftestOk = selftest();

  const SQL = await initSqlJs({ wasmBinary: fs.readFileSync(path.join(ROOT, 'modeller', 'lib', 'sql-wasm.wasm')) });
  const src = fs.readFileSync(path.join(ROOT, 'viewer', 'rates.js'), 'utf8');
  const RATES = (new Function(src + '\nreturn {SEQUENCE_RULES:SEQUENCE_RULES, SEQUENCE_DEFAULT:SEQUENCE_DEFAULT,' +
    ' SEQUENCE_NAME_OVERRIDES:SEQUENCE_NAME_OVERRIDES, LABOR_RATES:LABOR_RATES, RATES:RATES};'))();

  const all = [];
  for (const b of FLEET) { const r = await runBuilding(SQL, RATES, b); if (r) all.push(r); }

  const totalT4 = all.reduce((s, r) => s + r.tierCount.T4, 0);
  const allZero = all.every(r => r.tierCount.T4 === 0);
  console.log('§S32_FLEET ' + JSON.stringify(all.map(r => [r.bld, r.n, r.tierCount])));
  console.log('§S32_VERDICT buildings=' + all.length + ' selftestOk=' + selftestOk +
    ' totalT4=' + totalT4 + ' T4ZeroOnAllBuildings=' + (allZero ? 'YES' : 'NO') +
    ' BAND_M=' + BAND_M + ' INCONSISTENT_M=' + INCONSISTENT_M +
    ' — READ-ONLY PROBE, buildings/*.db and viewer/ unchanged');
}
main().catch(e => { console.error('§S32_ERROR ' + (e && e.stack || e)); process.exit(2); });
