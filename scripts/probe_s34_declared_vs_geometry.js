#!/usr/bin/env node
// probe_s34_declared_vs_geometry.js — §S33.1's OPEN DESIGN DECISION, MEASURED FIRST (2026-08-19).
// STUDY ONLY, READ-ONLY. Nothing in viewer/ or buildings/*.db changes (db.run() is never called;
// sql.js loads a byte buffer, never writes back — md5sum before/after is printed by the caller).
//
// §S33.1 left ONE thing undecided and correctly refused to guess it: where a DECLARED level (ladder
// tiers T1/T2) contradicts the element's OWN geometry, which wins? The number that raised it was a
// bare |declaredZ - ownCenterZ| > 3m count (Terminal T2 21.1%, Hospital T1 6.6%). That statistic
// cannot distinguish four completely different situations, which need four different rulings:
//
//   AGREE     — declared and geometry pick the same storey. No tie-break needed.
//   SPAN      — the element PHYSICALLY CONTAINS its declared elevation (base_z <= declZ <= top_z).
//               A 4m column on a 3m storey is "3m away" from its own storey center by construction.
//               This is legitimate and a distance threshold miscounts it as a contradiction.
//   ADJACENT  — geometry says the storey next door. Boundary/datum noise, or a real one-off.
//   FAR       — geometry says a storey 2+ apart AND the element does not reach its declared level.
//               This is the only class that is a genuine contradiction.
//
// It also never asked WHICH DATUM the declared value is keyed to — base_z, center_z or top_z. The
// §S32 probe assumed center_z. If declared elevations are floor levels, base_z is the right
// comparator and part of the "21.1%" is an instrument artifact, not data.
//
// ⚠ DO NOT REMOVE — read the log after every run; exit code is not evidence.
// Instrument discipline (§STATUS "Standing instrument rule" — three false zeros in this lane):
//   §S34_SELFTEST  — 8 synthetic fixtures, every classification bucket reached including FAR.
//   §S34_TIERCHECK — this probe's own T1/T2 counts must equal §S33.1's committed table EXACTLY,
//                    or its ladder has drifted from the one that produced the published numbers.
//   §S34_CONTROL   — labels are SHUFFLED within the building and the whole measurement re-run. If
//                    real declared labels do not score dramatically better than random ones, the
//                    metric is measuring nothing and every number below is void.
//
// Usage:  node scripts/probe_s34_declared_vs_geometry.js
//         ONLY=Terminal_meta node scripts/probe_s34_declared_vs_geometry.js
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
const SPAN_EPS = Number(process.env.SPAN_EPS || 0.05);   // metres of slack on the containment test

// §S33.1's committed tier table — the drift guard for this probe's ladder (copied verbatim from
// prompts/4D_GANTT_TM_REFACTOR.md §S33.1, which was itself independently re-run and verified).
const S33_1_TIERS = {
  Hospital_meta: { n: 63182, T1: 8474, T2: 45033, T3: 9675 },
  HHS_Office_Federated_extracted: { n: 6839, T1: 88, T2: 4586, T3: 2165 },
  Clinic_meta: { n: 16071, T1: 2133, T2: 3594, T3: 10344 },
  JKR_extracted: { n: 8985, T1: 107, T2: 1910, T3: 6968 },
  Terminal_meta: { n: 48428, T1: 1009, T2: 10224, T3: 37195 },
  LTU_AHouse_meta: { n: 122330, T1: 0, T2: 0, T3: 122330 },
  Duplex_extracted: { n: 1119, T1: 0, T2: 0, T3: 1119 },
};

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

// ── the ladder, T1/T2 only (T3/T4 need no tie-break — they ARE geometry) ─────────────────────────
function declaredLevel(el, rawStorey, L) {
  const spaces = L.elementSpaces[el.guid];
  if (spaces) {
    for (let i = 0; i < spaces.length; i++) {
      const sg = L.spaceParent[spaces[i]];
      if (sg == null) continue;
      const cz = L.storeyCenterZ[sg];
      if (cz != null && Number.isFinite(cz)) return { tier: 'T1', level: cz };
    }
  }
  if (rawStorey && rawStorey !== '_UNKNOWN' && !/^unknown$/i.test(rawStorey)) {
    const cz = L.storeyNameCenterZ[rawStorey];
    if (cz != null && Number.isFinite(cz)) return { tier: 'T2', level: cz };
  }
  return { tier: 'T3', level: null };
}

// nearest storey index on the DECLARED elevation grid
function nearestIdx(grid, z) {
  let best = 0, bd = Infinity;
  for (let i = 0; i < grid.length; i++) { const d = Math.abs(z - grid[i]); if (d < bd) { bd = d; best = i; } }
  return best;
}

// classify ONE declared element against its own geometry.
//   grid      — sorted distinct declared storey elevations for this building
//   declZ     — the ladder's declared level
//   base/top  — the element's own vertical extent
// returns AGREE | SPAN | ADJACENT | FAR  (+ the storey-index distance and the metric distance)
function classifyAgreement(grid, declZ, base_z, top_z) {
  const declIdx = nearestIdx(grid, declZ);
  const geomIdx = nearestIdx(grid, base_z);          // datum choice measured separately below
  const dIdx = Math.abs(declIdx - geomIdx);
  const spans = (base_z - SPAN_EPS) <= declZ && declZ <= (top_z + SPAN_EPS);
  let cls;
  if (dIdx === 0) cls = 'AGREE';
  else if (spans) cls = 'SPAN';
  else if (dIdx === 1) cls = 'ADJACENT';
  else cls = 'FAR';
  return { cls, dIdx, spans, declIdx, geomIdx };
}

// ── the INTERVAL model — what the first run showed the nearest-elevation test gets wrong ────────
// Storey elevations are FLOOR levels, not band centres: storey i owns [Z[i], Z[i+1]). An element
// standing on the upper half of its own storey is NEARER the next storey's elevation, and the
// nearest-elevation test above calls that ADJACENT — 21.9% of Terminal, 25.1% of JKR. Physically it
// is not a contradiction at all. `overlapsDeclared` asks the question that actually matters: does
// the element's own vertical extent intersect the interval its declared storey owns?
function storeyInterval(grid, idx) {
  return { lo: idx === 0 ? -Infinity : grid[idx], hi: idx === grid.length - 1 ? Infinity : grid[idx + 1] };
}
function intervalIdx(grid, z) {           // which storey's interval contains z
  let idx = 0;
  for (let i = 0; i < grid.length; i++) if (z >= grid[i]) idx = i;
  if (z < grid[0]) idx = 0;               // below the lowest floor belongs to the lowest storey
  return idx;
}
function overlapsDeclared(grid, declZ, base_z, top_z) {
  const di = nearestIdx(grid, declZ);
  const iv = storeyInterval(grid, di);
  return (base_z - SPAN_EPS) < iv.hi && (top_z + SPAN_EPS) > iv.lo;
}

// ── §S34_SELFTEST — every bucket must be reachable, including FAR. A classifier that cannot say
// FAR would make "no contradictions found" meaningless (this lane's repeat failure). ─────────────
function selftest() {
  const grid = [0, 4, 8, 12, 16];   // 5 storeys, 4m apart
  const cases = [
    { name: 'A_agree_same_storey',        declZ: 8,  base: 8.1,  top: 9.0,  expect: 'AGREE' },
    { name: 'B_agree_despite_3m_center',  declZ: 8,  base: 8.0,  top: 14.0, expect: 'AGREE' },  // center=11, 3m off, still same storey by base
    { name: 'C_span_tall_column',         declZ: 8,  base: 4.2,  top: 8.4,  expect: 'SPAN' },   // base nearest 4, but reaches its declared level
    { name: 'D_adjacent_one_off',         declZ: 8,  base: 4.1,  top: 4.9,  expect: 'ADJACENT' },
    { name: 'E_far_two_storeys_off',      declZ: 16, base: 0.2,  top: 1.0,  expect: 'FAR' },
    { name: 'F_far_below_declared',       declZ: 0,  base: 15.5, top: 15.9, expect: 'FAR' },
    // G/H corrected 2026-08-19 after the first run: the FIXTURES were wrong, not the classifier.
    // G — a full-height curtain wall based at -0.1 is nearest storey 0, which IS its declared level,
    //     so AGREE (the dIdx==0 test fires before the span test). SPAN only exists to rescue an
    //     element whose BASE lands on a different storey than the one it reaches.
    // H — base 6.0 on a [0,4,8,...] grid is an EXACT tie between storey 4 and storey 8; the tie
    //     resolves to the lower index, which is the declared one, so AGREE. Kept as a documented
    //     tie case, with a separate unambiguous ADJACENT at 6.5.
    { name: 'G_full_height_wall_agrees',  declZ: 0,  base: -0.1, top: 16.2, expect: 'AGREE' },
    { name: 'H_exact_tie_lower_wins',     declZ: 4,  base: 6.0,  top: 6.2,  expect: 'AGREE' },
    { name: 'I_adjacent_unambiguous',     declZ: 4,  base: 6.5,  top: 6.7,  expect: 'ADJACENT' },
  ];
  let pass = 0;
  cases.forEach(c => {
    const got = classifyAgreement(grid, c.declZ, c.base, c.top);
    const ok = got.cls === c.expect;
    if (ok) pass++;
    console.log('§S34_SELFTEST case=' + c.name + ' expect=' + c.expect + ' got=' + got.cls +
      ' dIdx=' + got.dIdx + ' spans=' + got.spans + (ok ? ' PASS' : ' ✗ FAIL'));
  });
  // interval-test fixtures — same grid, and it must be able to answer NO
  const ivCases = [
    { name: 'J_iv_inside_own_storey',   declZ: 4,  base: 6.5,  top: 6.7,  expect: true },   // upper half of storey 4
    { name: 'K_iv_riser_spans_up',      declZ: 4,  base: 4.1,  top: 15.0, expect: true },
    { name: 'L_iv_entirely_elsewhere',  declZ: 16, base: 0.2,  top: 1.0,  expect: false },  // must be able to say NO
    { name: 'M_iv_just_below_floor',    declZ: 8,  base: 7.0,  top: 7.5,  expect: false },
  ];
  ivCases.forEach(c => {
    const got = overlapsDeclared(grid, c.declZ, c.base, c.top);
    const ok = got === c.expect;
    if (ok) pass++;
    console.log('§S34_SELFTEST case=' + c.name + ' expect=overlap:' + c.expect + ' got=' + got + (ok ? ' PASS' : ' ✗ FAIL'));
  });
  const total = cases.length + ivCases.length;
  const buckets = {};
  cases.forEach(c => { buckets[c.expect] = 1; });
  const allBuckets = ['AGREE', 'SPAN', 'ADJACENT', 'FAR'].every(b => buckets[b]);
  const ok = pass === total && allBuckets;
  console.log('§S34_SELFTEST_VERDICT ' + pass + '/' + total +
    ' allBucketsExercised=' + allBuckets + ' intervalTestCanSayNo=' + (!overlapsDeclared(grid, 16, 0.2, 1.0)) +
    (ok ? ' — both classifiers proven capable of a NEGATIVE answer; numbers below are falsifiable'
        : '  ⚠ SELFTEST FAILURE — do not trust anything below'));
  return ok;
}

// deterministic shuffle (mulberry32) so the control is reproducible run to run
function rng(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0;
  let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
  return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

async function runBuilding(SQL, RATES, bld) {
  const dbPath = path.join(BLD, bld + '.db');
  if (!fs.existsSync(dbPath)) { console.log('§S34_SKIP ' + bld + ' (no db file)'); return null; }
  const db = new SQL.Database(fs.readFileSync(dbPath));

  const elements = ScheduleAuthor._buildScheduleElements(db, RATES.SEQUENCE_RULES, {
    laborRates: RATES.LABOR_RATES, rates: RATES.RATES,
    nameOverrides: RATES.SEQUENCE_NAME_OVERRIDES, defaultRule: RATES.SEQUENCE_DEFAULT });
  const n = elements.length;
  if (!n) { console.log('§S34_SKIP ' + bld + ' (0 scheduled elements)'); db.close(); return null; }

  const rawStoreyByGuid = {};
  db.exec('SELECT guid, storey FROM elements_meta').forEach(res => {
    res.values.forEach(row => { rawStoreyByGuid[row[0]] = row[1]; });
  });

  const elementSpaces = {};
  if (tableExists(db, 'rel_contained_in_space')) {
    db.exec('SELECT space_guid, element_guid FROM rel_contained_in_space').forEach(res => {
      res.values.forEach(row => { (elementSpaces[row[1]] || (elementSpaces[row[1]] = [])).push(row[0]); });
    });
  }
  const spaceParent = {}, storeyCenterZ = {}, nameZ = {};
  if (tableExists(db, 'spatial_structure')) {
    const hasCz = columnExists(db, 'spatial_structure', 'center_z');
    const cols = hasCz ? 'guid, type, name, parent_guid, center_z' : 'guid, type, name, parent_guid';
    db.exec('SELECT ' + cols + ' FROM spatial_structure').forEach(res => {
      res.values.forEach(row => {
        const guid = row[0], type = row[1], name = row[2], parent = row[3], cz = hasCz ? row[4] : null;
        if (type === 'IfcSpace') spaceParent[guid] = parent;
        if (type === 'IfcBuildingStorey' && cz != null) { storeyCenterZ[guid] = cz; if (name && nameZ[name] == null) nameZ[name] = cz; }
      });
    });
  }
  const L = { elementSpaces, spaceParent, storeyCenterZ, storeyNameCenterZ: nameZ };

  // the DECLARED elevation grid — sorted distinct storey elevations that the ladder can actually cite
  const grid = Array.from(new Set(Object.values(storeyCenterZ).concat(Object.values(nameZ))))
    .filter(Number.isFinite).sort((a, b) => a - b);

  const decl = [];   // every T1/T2 element
  const tierCount = { T1: 0, T2: 0, T3: 0 };
  elements.forEach(el => {
    const r = declaredLevel(el, rawStoreyByGuid[el.guid], L);
    tierCount[r.tier]++;
    if (r.tier === 'T1' || r.tier === 'T2') {
      decl.push({ guid: el.guid, cls: el.cls, tier: r.tier, declZ: r.level,
                  base_z: el.base_z, top_z: el.top_z, h: el.top_z - el.base_z });
    }
  });

  // §S34_TIERCHECK — ladder drift guard against §S33.1's published table
  const exp = S33_1_TIERS[bld];
  if (exp) {
    const ok = (n === exp.n && tierCount.T1 === exp.T1 && tierCount.T2 === exp.T2);
    console.log('§S34_TIERCHECK ' + bld + ' n=' + n + '/' + exp.n + ' T1=' + tierCount.T1 + '/' + exp.T1 +
      ' T2=' + tierCount.T2 + '/' + exp.T2 + ' ' + (ok ? 'MATCH (§S33.1)' : '✗ MISMATCH — ladder drifted, numbers below are not comparable'));
  }
  console.log('§S34_GRID ' + bld + ' storeyElevations=[' + grid.map(z => z.toFixed(2)).join(', ') + ']' +
    ' k=' + grid.length + ' minGap=' + (grid.length > 1 ? Math.min(...grid.slice(1).map((z, i) => z - grid[i])).toFixed(2) : 'n/a') + 'm');

  if (!decl.length || grid.length < 2) {
    console.log('§S34_AGREE ' + bld + ' declared=' + decl.length + ' grid=' + grid.length +
      ' — no declared population or no grid, tie-break is MOOT on this building (pure T3)');
    db.close();
    return { bld, n, declared: decl.length, moot: true };
  }

  // ── DATUM QUESTION: which of base_z / center_z / top_z best predicts the declared storey? ──────
  const datumHit = { base_z: 0, center_z: 0, top_z: 0 };
  decl.forEach(d => {
    const declIdx = nearestIdx(grid, d.declZ);
    if (nearestIdx(grid, d.base_z) === declIdx) datumHit.base_z++;
    if (nearestIdx(grid, (d.base_z + d.top_z) / 2) === declIdx) datumHit.center_z++;
    if (nearestIdx(grid, d.top_z) === declIdx) datumHit.top_z++;
  });
  console.log('§S34_DATUM ' + bld + ' declared=' + decl.length +
    ' sameStoreyAs_base_z=' + datumHit.base_z + ' (' + (100 * datumHit.base_z / decl.length).toFixed(2) + '%)' +
    ' center_z=' + datumHit.center_z + ' (' + (100 * datumHit.center_z / decl.length).toFixed(2) + '%)' +
    ' top_z=' + datumHit.top_z + ' (' + (100 * datumHit.top_z / decl.length).toFixed(2) + '%)' +
    ' bestDatum=' + Object.keys(datumHit).reduce((a, b) => datumHit[a] >= datumHit[b] ? a : b));

  // ── the four buckets, per tier and overall ────────────────────────────────────────────────────
  function bucketize(rows) {
    const c = { AGREE: 0, SPAN: 0, ADJACENT: 0, FAR: 0 };
    const farRows = [];
    rows.forEach(d => {
      const r = classifyAgreement(grid, d.declZ, d.base_z, d.top_z);
      c[r.cls]++;
      if (r.cls === 'FAR') farRows.push(Object.assign({ dIdx: r.dIdx, geomIdx: r.geomIdx, declIdx: r.declIdx }, d));
    });
    return { c, farRows };
  }
  const overall = bucketize(decl);
  const pc = k => (100 * overall.c[k] / decl.length).toFixed(2);
  console.log('§S34_AGREE ' + bld + ' declared=' + decl.length +
    ' AGREE=' + overall.c.AGREE + ' (' + pc('AGREE') + '%)' +
    ' SPAN=' + overall.c.SPAN + ' (' + pc('SPAN') + '%)' +
    ' ADJACENT=' + overall.c.ADJACENT + ' (' + pc('ADJACENT') + '%)' +
    ' FAR=' + overall.c.FAR + ' (' + pc('FAR') + '%)' +
    ' contradictionRate=' + pc('FAR') + '%');
  ['T1', 'T2'].forEach(t => {
    const rows = decl.filter(d => d.tier === t);
    if (!rows.length) { console.log('§S34_AGREE_TIER ' + bld + ' tier=' + t + ' n=0'); return; }
    const b = bucketize(rows).c;
    console.log('§S34_AGREE_TIER ' + bld + ' tier=' + t + ' n=' + rows.length +
      ' AGREE=' + (100 * b.AGREE / rows.length).toFixed(2) + '%' +
      ' SPAN=' + (100 * b.SPAN / rows.length).toFixed(2) + '%' +
      ' ADJACENT=' + (100 * b.ADJACENT / rows.length).toFixed(2) + '%' +
      ' FAR=' + (100 * b.FAR / rows.length).toFixed(2) + '%');
  });

  // ── what ARE the FAR ones? class mix + how far, in storeys and metres ─────────────────────────
  if (overall.farRows.length) {
    const byCls = {};
    overall.farRows.forEach(r => { byCls[r.cls] = (byCls[r.cls] || 0) + 1; });
    const top = Object.entries(byCls).sort((a, b) => b[1] - a[1]).slice(0, 5)
      .map(([c, k]) => c + '=' + k + '(' + (100 * k / overall.farRows.length).toFixed(1) + '%)').join(' ');
    const dIdxHist = {};
    overall.farRows.forEach(r => { dIdxHist[r.dIdx] = (dIdxHist[r.dIdx] || 0) + 1; });
    const metres = overall.farRows.map(r => Math.abs(r.declZ - r.base_z)).sort((a, b) => a - b);
    const q = p => metres[Math.min(metres.length - 1, Math.floor(p * metres.length))].toFixed(2);
    console.log('§S34_FAR_CLASS ' + bld + ' n=' + overall.farRows.length + ' topClasses: ' + top);
    console.log('§S34_FAR_DIST ' + bld + ' storeyIdxDistance=' + JSON.stringify(dIdxHist) +
      ' metresFromDeclared p50=' + q(0.5) + ' p90=' + q(0.9) + ' max=' + metres[metres.length - 1].toFixed(2));
    // are the FAR ones a systematic block (one declared storey) or scattered?
    const byDecl = {};
    overall.farRows.forEach(r => { byDecl[r.declZ.toFixed(2)] = (byDecl[r.declZ.toFixed(2)] || 0) + 1; });
    console.log('§S34_FAR_BYDECL ' + bld + ' ' + JSON.stringify(byDecl));
  }

  // ── THE DECISION NUMBER: under the interval model, how many declared elements are genuinely
  // outside the storey they claim? That population, and only it, needs a tie-break ruling. ───────
  const noOverlap = decl.filter(d => !overlapsDeclared(grid, d.declZ, d.base_z, d.top_z));
  const ivPct = (100 * noOverlap.length / decl.length).toFixed(2);
  console.log('§S34_OVERLAP ' + bld + ' declared=' + decl.length +
    ' overlapsOwnStorey=' + (decl.length - noOverlap.length) + ' (' + (100 - ivPct).toFixed(2) + '%)' +
    ' NO_OVERLAP=' + noOverlap.length + ' (' + ivPct + '%)' +
    ' — NO_OVERLAP is the population a declared-vs-geometry tie-break actually decides');
  if (noOverlap.length) {
    const byCls = {};
    noOverlap.forEach(r => { byCls[r.cls] = (byCls[r.cls] || 0) + 1; });
    const top = Object.entries(byCls).sort((a, b) => b[1] - a[1]).slice(0, 6)
      .map(([c, k]) => c + '=' + k + '(' + (100 * k / noOverlap.length).toFixed(1) + '%)').join(' ');
    console.log('§S34_OVERLAP_CLASS ' + bld + ' n=' + noOverlap.length + ' ' + top);
    // MEP share — the hypothesis the FAR class-mix raised
    const MEP = /^Ifc(Pipe|Duct|Flow|Distribution|Cable|Valve|Switching|Electric|Air|Sanitary|Fire|Junction|Energy|Light|Protective|Outlet|Motor|Controller|Sensor|Actuator|Tank|Pump|Fan|Boiler|Chiller|Coil|Filter|Damper|Terminal)/;
    const mep = noOverlap.filter(r => MEP.test(r.cls)).length;
    console.log('§S34_OVERLAP_MEP ' + bld + ' mepShareOfNoOverlap=' + mep + '/' + noOverlap.length +
      ' (' + (100 * mep / noOverlap.length).toFixed(1) + '%)' +
      ' mepShareOfAllDeclared=' + (100 * decl.filter(d => MEP.test(d.cls)).length / decl.length).toFixed(1) + '%');
    // ── SIGNED: is the element BELOW its declared floor line (the hosted-at-level datum convention —
    // a slab's top IS the level, a beam hangs under it) or genuinely somewhere else in the building?
    // A downward tolerance turns the first kind back into agreement; the second kind is the real
    // tie-break population. Sweeping the tolerance shows where, and whether, that stops paying.
    let below = 0, above = 0;
    const belowGap = [];
    noOverlap.forEach(r => {
      const di = nearestIdx(grid, r.declZ), iv = storeyInterval(grid, di);
      if (r.top_z <= iv.lo) { below++; belowGap.push(iv.lo - r.top_z); }
      else above++;
    });
    console.log('§S34_SIGNED ' + bld + ' n=' + noOverlap.length +
      ' belowOwnFloorLine=' + below + ' (' + (100 * below / noOverlap.length).toFixed(1) + '%)' +
      ' aboveOwnCeiling=' + above + ' (' + (100 * above / noOverlap.length).toFixed(1) + '%)');
    [0.5, 1.0, 2.0, 3.0, 5.0].forEach(tol => {
      const rescued = belowGap.filter(g => g <= tol).length;
      const remain = noOverlap.length - rescued;
      console.log('§S34_TOLSWEEP ' + bld + ' downTol=' + tol.toFixed(1) + 'm rescued=' + rescued +
        ' remaining=' + remain + ' (' + (100 * remain / decl.length).toFixed(2) + '% of declared)');
    });
    // ── the tolerance, EXTRACTED not invented: the sweep's knee is ~3m on every building, which is
    // ~one storey height — so use the LOCAL storey gap (this storey's floor line minus the one
    // below), per building, per storey. Nothing to tune, and it adapts to a building whose storeys
    // are 2.5m apart or 7m apart (§S29 generality).
    const gaps = grid.slice(1).map((z, i) => z - grid[i]);
    const medGap = gaps.length ? gaps.slice().sort((a, b) => a - b)[Math.floor(gaps.length / 2)] : 3;
    function downTolFor(idx) { return idx > 0 ? (grid[idx] - grid[idx - 1]) : medGap; }
    let gapRemain = 0;
    const gapRemainRows = [];
    noOverlap.forEach(r => {
      const di = nearestIdx(grid, r.declZ), iv = storeyInterval(grid, di);
      const tol = downTolFor(di);
      if (!(r.top_z <= iv.lo && (iv.lo - r.top_z) <= tol)) { gapRemain++; gapRemainRows.push(r); }
    });
    console.log('§S34_GAPTOL ' + bld + ' medianStoreyGap=' + medGap.toFixed(2) + 'm' +
      ' perStoreyTol=[' + grid.map((z, i) => downTolFor(i).toFixed(2)).join(',') + ']' +
      ' remainingAfterGapTol=' + gapRemain + ' (' + (100 * gapRemain / decl.length).toFixed(2) + '% of declared, ' +
      (100 * gapRemain / n).toFixed(3) + '% of all scheduled)');
    if (gapRemainRows.length) {
      const byCls2 = {};
      gapRemainRows.forEach(r => { byCls2[r.cls] = (byCls2[r.cls] || 0) + 1; });
      console.log('§S34_GAPTOL_CLASS ' + bld + ' ' + Object.entries(byCls2).sort((a, b) => b[1] - a[1]).slice(0, 6)
        .map(([c, k]) => c + '=' + k + '(' + (100 * k / gapRemainRows.length).toFixed(1) + '%)').join(' '));
    }
    const dz = noOverlap.map(r => Math.abs(r.declZ - r.base_z)).sort((a, b) => a - b);
    console.log('§S34_OVERLAP_DIST ' + bld + ' metresOutside p50=' + dz[Math.floor(dz.length / 2)].toFixed(2) +
      ' p90=' + dz[Math.floor(dz.length * 0.9)].toFixed(2) + ' max=' + dz[dz.length - 1].toFixed(2));
  }

  // ── §S34_CONTROL — shuffle the declared labels within the building and re-measure. Real labels
  // must beat random ones by a wide margin or this whole measurement is noise. ──────────────────
  const rand = rng(20260819);
  const shuffled = decl.map(d => d.declZ);
  for (let i = shuffled.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); const t = shuffled[i]; shuffled[i] = shuffled[j]; shuffled[j] = t; }
  const ctrl = { AGREE: 0, SPAN: 0, ADJACENT: 0, FAR: 0 };
  let ctrlNoOverlap = 0;
  decl.forEach((d, i) => {
    ctrl[classifyAgreement(grid, shuffled[i], d.base_z, d.top_z).cls]++;
    if (!overlapsDeclared(grid, shuffled[i], d.base_z, d.top_z)) ctrlNoOverlap++;
  });
  const realNo = 100 * noOverlap.length / decl.length, ctrlNo = 100 * ctrlNoOverlap / decl.length;
  console.log('§S34_CONTROL_OVERLAP ' + bld + ' shuffled NO_OVERLAP=' + ctrlNoOverlap + ' (' + ctrlNo.toFixed(2) + '%)' +
    ' vs real ' + noOverlap.length + ' (' + realNo.toFixed(2) + '%)' +
    ' ratio=' + (realNo > 0 ? (ctrlNo / realNo).toFixed(1) + 'x' : 'inf') +
    ' intervalMetricDiscriminates=' + (ctrlNo > realNo * 2 ? 'YES' : 'NO — ⚠ void'));
  const realFar = 100 * overall.c.FAR / decl.length, ctrlFar = 100 * ctrl.FAR / decl.length;
  console.log('§S34_CONTROL ' + bld + ' shuffledLabels FAR=' + ctrl.FAR + ' (' + ctrlFar.toFixed(2) + '%)' +
    ' vs real FAR=' + overall.c.FAR + ' (' + realFar.toFixed(2) + '%)' +
    ' ratio=' + (realFar > 0 ? (ctrlFar / realFar).toFixed(1) + 'x' : 'inf') +
    ' metricDiscriminates=' + (ctrlFar > realFar * 2 || (realFar === 0 && ctrlFar > 5) ? 'YES' : 'NO — ⚠ metric does not separate real labels from random, void the numbers'));

  db.close();
  return { bld, n, declared: decl.length, grid: grid.length, buckets: overall.c,
           datum: datumHit, ctrlFar: ctrl.FAR, noOverlap: noOverlap.length };
}

async function main() {
  const ok = selftest();
  const SQL = await initSqlJs({ wasmBinary: fs.readFileSync(path.join(ROOT, 'modeller', 'lib', 'sql-wasm.wasm')) });
  const src = fs.readFileSync(path.join(ROOT, 'viewer', 'rates.js'), 'utf8');
  const RATES = (new Function(src + '\nreturn {SEQUENCE_RULES:SEQUENCE_RULES, SEQUENCE_DEFAULT:SEQUENCE_DEFAULT,' +
    ' SEQUENCE_NAME_OVERRIDES:SEQUENCE_NAME_OVERRIDES, LABOR_RATES:LABOR_RATES, RATES:RATES};'))();
  const all = [];
  for (const b of FLEET) { const r = await runBuilding(SQL, RATES, b); if (r) all.push(r); }
  const withDecl = all.filter(r => !r.moot);
  const totDecl = withDecl.reduce((s, r) => s + r.declared, 0);
  const totFar = withDecl.reduce((s, r) => s + r.buckets.FAR, 0);
  const totSpan = withDecl.reduce((s, r) => s + r.buckets.SPAN, 0);
  const totAgree = withDecl.reduce((s, r) => s + r.buckets.AGREE, 0);
  const totAdj = withDecl.reduce((s, r) => s + r.buckets.ADJACENT, 0);
  const totNoOv = withDecl.reduce((s, r) => s + r.noOverlap, 0);
  const totScheduled = all.reduce((s, r) => s + r.n, 0);
  console.log('§S34_FLEET_OVERLAP declaredTotal=' + totDecl + ' NO_OVERLAP=' + totNoOv +
    ' (' + (100 * totNoOv / Math.max(1, totDecl)).toFixed(2) + '% of declared, ' +
    (100 * totNoOv / Math.max(1, totScheduled)).toFixed(3) + '% of all ' + totScheduled + ' scheduled elements)');
  console.log('§S34_FLEET declaredTotal=' + totDecl + ' AGREE=' + totAgree + ' SPAN=' + totSpan +
    ' ADJACENT=' + totAdj + ' FAR=' + totFar +
    ' fleetContradictionRate=' + (100 * totFar / Math.max(1, totDecl)).toFixed(2) + '%');
  console.log('§S34_VERDICT buildings=' + all.length + ' selftestOk=' + ok + ' SPAN_EPS=' + SPAN_EPS +
    ' — READ-ONLY PROBE, buildings/*.db and viewer/ unchanged');
}
main().catch(e => { console.error('§S34_ERROR ' + (e && e.stack || e)); process.exit(2); });
