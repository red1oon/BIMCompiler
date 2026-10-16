#!/usr/bin/env node
// probe_s36_tiebreak_sensitivity.js — THREE CHECKS ON §S34/§S35 BEFORE ANY SPEC (2026-08-19).
// STUDY ONLY, READ-ONLY. db.run() is never called; the caller md5sums all 7 frozen DBs around this.
// Nothing is adopted, switched or wired here — this file produces NUMBERS ONLY.
//
//   Q1  §S35.5's uniform-3m fallback carries LTU (122,330 elements = 45.8% of the fleet) on a grid
//       level_deriver.js's own comment calls wrong by construction, and §S29.2 named floor(z/3) the
//       deepest assumption in the design. HOW MUCH does it cost? Elements landing in a different
//       level under uniform-3m vs a per-building DERIVED grid (slab-top clustering).
//   Q2  levelFor() resolves a declared storey by nearestIdx(grid, declZ) — by ELEVATION, not
//       identity. Does that ever snap a declared storey onto a line that is not its own?
//   Q3  declaredBandOf extends DOWN by the FULL local storey gap, so a level's validation band
//       reaches the floor line below. Sweep down = 0, 0.25x, 0.5x, 0.75x, 1.0x, 1.5x, 2.0x of the
//       local gap and see whether 1.0x sits on a PLATEAU or on a SLOPE.
//
// ⚠ DO NOT REMOVE — read the log after every run; exit code is not evidence.
// Instrument discipline (§STATUS standing rule): §S36_SELFTEST fixtures every pure function used
// below, each including a case that MUST come out negative/different, so a quiet number can be told
// from a branch that never ran.
//
// Usage:  node scripts/probe_s36_tiebreak_sensitivity.js
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = process.env.OOTB || path.join(require('os').homedir(), 'bim-ootb');
const initSqlJs = require(path.join(ROOT, 'modeller', 'lib', 'sql-wasm.js'));
const ScheduleAuthor = require(path.join(ROOT, 'viewer', 'schedule_author.js'));
const LD = require(path.join(__dirname, '..', 'build', 'level_deriver.js'));
const BLD = path.join(ROOT, 'buildings');
const FLEET = (process.env.ONLY || ['Terminal_meta', 'Hospital_meta', 'Clinic_meta', 'LTU_AHouse_meta',
  'Duplex_extracted', 'HHS_Office_Federated_extracted', 'JKR_extracted'].join(',')).split(',');

const CLUSTER_BW = Number(process.env.CLUSTER_BW || 0.5);   // m — merge slab tops within this
const CLUSTER_MIN = Number(process.env.CLUSTER_MIN || 5);   // slabs needed to call it a floor line

// ── Q1 machinery ──────────────────────────────────────────────────────────────────────────────
// deriveGridFromSlabs(tops) — agglomerative 1D merge: sort, start a cluster, extend while the next
// point is within CLUSTER_BW of the cluster's LAST point; a cluster with >= CLUSTER_MIN members
// becomes a floor line at its MEAN. Physical basis: a floor line is where a building's slabs are.
function deriveGridFromSlabs(tops) {
  const zs = tops.filter(Number.isFinite).slice().sort((a, b) => a - b);
  if (!zs.length) return { grid: [], clusters: [] };
  const clusters = [];
  let cur = [zs[0]];
  for (let i = 1; i < zs.length; i++) {
    if (zs[i] - cur[cur.length - 1] <= CLUSTER_BW) cur.push(zs[i]);
    else { clusters.push(cur); cur = [zs[i]]; }
  }
  clusters.push(cur);
  const kept = clusters.filter(c => c.length >= CLUSTER_MIN);
  const grid = kept.map(c => Number((c.reduce((s, z) => s + z, 0) / c.length).toFixed(3)));
  return { grid, clusters: kept.map(c => ({ z: c.reduce((s, z) => s + z, 0) / c.length, n: c.length })) };
}
// partitionDisagreement(a, b) — a and b are arrays of level ids, one per element, from two grids.
// The level VALUES differ by construction, so what is compared is the GROUPING: map each a-group to
// the b-group most of its members land in, then count members that do not follow their own group's
// plurality. That is literally "how many elements land in a different level".
function partitionDisagreement(a, b) {
  const tally = {};
  for (let i = 0; i < a.length; i++) {
    (tally[a[i]] || (tally[a[i]] = {}))[b[i]] = ((tally[a[i]] || {})[b[i]] || 0) + 1;
  }
  const plurality = {};
  Object.keys(tally).forEach(k => {
    plurality[k] = Object.keys(tally[k]).reduce((x, y) => tally[k][x] >= tally[k][y] ? x : y);
  });
  let bad = 0;
  for (let i = 0; i < a.length; i++) if (String(b[i]) !== String(plurality[a[i]])) bad++;
  return { disagree: bad, pct: 100 * bad / (a.length || 1), groupsA: Object.keys(tally).length };
}

// ── selftests — every function must be shown able to produce a NEGATIVE / different answer ──────
function selftest() {
  let pass = 0, n = 0;
  const t = (name, got, want, proves) => {
    n++; const ok = JSON.stringify(got) === JSON.stringify(want); if (ok) pass++;
    console.log('§S36_SELFTEST ' + (ok ? 'PASS' : '✗ FAIL') + ' ' + name +
      ' want=' + JSON.stringify(want) + ' got=' + JSON.stringify(got) + ' | proves: ' + proves);
  };
  // cluster: three clean floors + a 2-member sliver that must be REJECTED by CLUSTER_MIN
  t('cluster_finds_floors',
    deriveGridFromSlabs([0, 0.1, 0.2, 0.05, 0.15, 3, 3.1, 3.05, 3.2, 3.15, 6.5, 6.4, 6.6, 6.45, 6.55, 9.9, 9.95]).grid,
    [0.1, 3.1, 6.5], 'clustering finds real floor lines and drops a sub-threshold sliver (9.9 pair)');
  t('cluster_can_return_empty', deriveGridFromSlabs([1, 2, 3]).grid, [],
    'clustering can say "no grid" — it is not guaranteed to produce lines');
  // partition metric: identical partitions → 0; half-band offset → large
  const A = [0, 0, 3, 3, 6, 6], B = [0, 0, 3, 3, 6, 6], C = [0, 3, 3, 6, 6, 9];
  t('partition_identical_is_zero', partitionDisagreement(A, B).disagree, 0,
    'the metric reports 0 when two grids group identically');
  t('partition_offset_is_nonzero', partitionDisagreement(A, C).disagree > 0, true,
    'the metric can go RED — an offset grid is not scored as agreement');
  // snap check: a declared z absent from the grid must be detected
  t('snap_detects_mismatch', Math.abs([0, 4, 8][LD.nearestIdx([0, 4, 8], 5.9)] - 5.9) > 1e-9, true,
    'the snap check can detect a declared elevation that is not its own grid line');
  t('snap_exact_is_clean', Math.abs([0, 4, 8][LD.nearestIdx([0, 4, 8], 4)] - 4) > 1e-9, false,
    'and does not false-positive on an exact line');
  console.log('§S36_SELFTEST_VERDICT ' + pass + '/' + n +
    (pass === n ? ' ALL PASS — every metric below is falsifiable' : '  ⚠ SELFTEST FAILURE — void the numbers'));
  return pass === n;
}

// plain non-overlapping placement, identical to level_deriver.geomIdx but grid-parameterised
function place(grid, z) { let i = 0; for (let k = 0; k < grid.length; k++) if (z >= grid[k] - LD.EPS) i = k; return grid.length ? grid[i] : null; }

async function main() {
  const ok = selftest();
  const SQL = await initSqlJs({ wasmBinary: fs.readFileSync(path.join(ROOT, 'modeller', 'lib', 'sql-wasm.wasm')) });
  const src = fs.readFileSync(path.join(ROOT, 'viewer', 'rates.js'), 'utf8');
  const RATES = (new Function(src + '\nreturn {SEQUENCE_RULES:SEQUENCE_RULES, SEQUENCE_DEFAULT:SEQUENCE_DEFAULT,' +
    ' SEQUENCE_NAME_OVERRIDES:SEQUENCE_NAME_OVERRIDES, LABOR_RATES:LABOR_RATES, RATES:RATES};'))();

  for (const bld of FLEET) {
    const p = path.join(BLD, bld + '.db');
    if (!fs.existsSync(p)) { console.log('§S36_SKIP ' + bld); continue; }
    const db = new SQL.Database(fs.readFileSync(p));
    const elements = ScheduleAuthor._buildScheduleElements(db, RATES.SEQUENCE_RULES, {
      laborRates: RATES.LABOR_RATES, rates: RATES.RATES,
      nameOverrides: RATES.SEQUENCE_NAME_OVERRIDES, defaultRule: RATES.SEQUENCE_DEFAULT });
    const L = LD.readLookups(db);
    const G = LD.buildGrid(L, elements); G.medGap = LD.medianGap(G.grid);

    // ── Q1 — only meaningful where the shipped grid IS the uniform fallback ────────────────────
    if (G.source !== 'declared') {
      let tops = [];
      db.exec("SELECT t.center_z + t.bbox_z/2.0 FROM elements_meta m JOIN element_transforms t ON t.guid=m.guid " +
              "WHERE m.ifc_class IN ('IfcSlab','IfcSlabStandardCase','IfcRoof') AND t.bbox_z IS NOT NULL")
        .forEach(r => r.values.forEach(v => tops.push(v[0])));
      const der = deriveGridFromSlabs(tops);
      // how federated is it? (the reason the comment says "wrong by construction")
      let nBuildings = 0;
      try { db.exec("SELECT COUNT(*) FROM spatial_structure WHERE type='IfcBuilding'").forEach(r => { nBuildings = r.values[0][0]; }); } catch (e) { nBuildings = -1; }
      console.log('§S36_Q1_GRID ' + bld + ' uniformK=' + G.grid.length +
        ' slabTops=' + tops.length + ' derivedK=' + der.grid.length +
        ' derived=[' + der.grid.slice(0, 14).map(z => z.toFixed(2)).join(',') + (der.grid.length > 14 ? ',…' : '') + ']' +
        ' clusterSizes=[' + der.clusters.slice(0, 14).map(c => c.n).join(',') + (der.clusters.length > 14 ? ',…' : '') + ']' +
        ' IfcBuildingRows=' + nBuildings + ' bw=' + CLUSTER_BW + 'm min=' + CLUSTER_MIN);
      if (der.grid.length) {
        const uni = elements.map(e => place(G.grid, e.base_z));
        const drv = elements.map(e => place(der.grid, e.base_z));
        const d = partitionDisagreement(uni, drv);
        const dRev = partitionDisagreement(drv, uni);
        // controls: a grid against itself must be 0; a half-band shift must be large
        const self = partitionDisagreement(uni, elements.map(e => place(G.grid, e.base_z)));
        const shifted = partitionDisagreement(uni, elements.map(e => place(G.grid.map(z => z + 1.5), e.base_z)));
        console.log('§S36_Q1_COST ' + bld + ' n=' + elements.length +
          ' uniformGroups=' + d.groupsA + ' derivedGroups=' + dRev.groupsA +
          ' elementsInDifferentLevel=' + d.disagree + ' (' + d.pct.toFixed(2) + '%)' +
          ' reverse=' + dRev.disagree + ' (' + dRev.pct.toFixed(2) + '%)');
        console.log('§S36_Q1_CONTROL ' + bld + ' selfVsSelf=' + self.disagree + ' (must be 0)' +
          ' halfBandShift=' + shifted.disagree + ' (' + shifted.pct.toFixed(2) + '%, must be large)' +
          ' metricResponds=' + (self.disagree === 0 && shifted.pct > 5 ? 'YES' : 'NO — ⚠ void'));
      } else {
        console.log('§S36_Q1_COST ' + bld + ' derived grid EMPTY — clustering produced no floor lines, no comparison possible');
      }
    }

    // ── Q2 — does nearestIdx snap a declared storey onto a line that is not its own? ───────────
    if (G.source === 'declared') {
      const declZs = [];
      Object.keys(L.storeyCenterZ).forEach(k => declZs.push({ id: 'guid:' + k, z: L.storeyCenterZ[k] }));
      Object.keys(L.storeyNameCenterZ).forEach(k => declZs.push({ id: 'name:' + k, z: L.storeyNameCenterZ[k] }));
      let storeyMis = 0, minSep = Infinity, nearPairs = [];
      declZs.forEach(d => {
        const got = G.grid[LD.nearestIdx(G.grid, d.z)];
        if (Math.abs(got - d.z) > 1e-9) { storeyMis++; console.log('§S36_Q2_MISSNAP ' + bld + ' ' + d.id + ' declZ=' + d.z + ' snappedTo=' + got); }
      });
      for (let i = 1; i < G.grid.length; i++) {
        const sep = G.grid[i] - G.grid[i - 1];
        if (sep < minSep) minSep = sep;
        if (sep < 0.5) nearPairs.push(G.grid[i - 1].toFixed(3) + '/' + G.grid[i].toFixed(3) + ' sep=' + sep.toFixed(3) + 'm');
      }
      // per-element: how many declared elements sit on a line that has a NEAR TWIN (<0.5m) — the
      // population whose level identity is carried only by an elevation that nearly collides
      let atRisk = 0, byLine = {};
      elements.forEach(el => {
        const r = LD.levelFor(el, L.rawStorey[el.guid], L, G);
        if (r.source !== 'declared') return;
        const i = r.idx;
        const twin = (i > 0 && G.grid[i] - G.grid[i - 1] < 0.5) || (i < G.grid.length - 1 && G.grid[i + 1] - G.grid[i] < 0.5);
        if (twin) { atRisk++; byLine[G.grid[i].toFixed(3)] = (byLine[G.grid[i].toFixed(3)] || 0) + 1; }
      });
      console.log('§S36_Q2 ' + bld + ' declaredStoreyValues=' + declZs.length +
        ' snappedToAForeignLine=' + storeyMis +
        ' minLineSeparation=' + (isFinite(minSep) ? minSep.toFixed(3) + 'm' : 'n/a') +
        ' nearTwinPairs=' + nearPairs.length + (nearPairs.length ? ' [' + nearPairs.join(' · ') + ']' : '') +
        ' declaredElementsOnATwinnedLine=' + atRisk + ' byLine=' + JSON.stringify(byLine));
    }

    // ── Q3 — tolerance sensitivity: is 1.0x a plateau or a slope? ─────────────────────────────
    if (G.source === 'declared') {
      const decl = [];
      elements.forEach(el => {
        // recover the declared value independently of the tie-break outcome
        let z = null, tier = null;
        const sp = L.elementSpaces[el.guid];
        if (sp) for (let i = 0; i < sp.length; i++) { const sg = L.spaceParent[sp[i]]; if (sg != null && L.storeyCenterZ[sg] != null) { z = L.storeyCenterZ[sg]; tier = 'T1'; break; } }
        const raw = L.rawStorey[el.guid];
        if (z === null && raw && raw !== '_UNKNOWN' && !/^unknown$/i.test(raw) && L.storeyNameCenterZ[raw] != null) { z = L.storeyNameCenterZ[raw]; tier = 'T2'; }
        if (z !== null) decl.push({ cls: el.cls, base_z: el.base_z, top_z: el.top_z, declZ: z, tier });
      });
      const curve = [];
      [0, 0.25, 0.5, 0.75, 1.0, 1.5, 2.0].forEach(f => {
        let ov = 0; const cls = {};
        decl.forEach(d => {
          const di = LD.nearestIdx(G.grid, d.declZ);
          const down = (di > 0 ? (G.grid[di] - G.grid[di - 1]) : G.medGap) * f;
          const lo = G.grid[di] - down, hi = (di === G.grid.length - 1) ? Infinity : G.grid[di + 1];
          if (!((d.base_z - LD.EPS) < hi && (d.top_z + LD.EPS) > lo)) { ov++; cls[d.cls] = (cls[d.cls] || 0) + 1; }
        });
        curve.push({ f, ov, pct: 100 * ov / (decl.length || 1) });
      });
      console.log('§S36_Q3_SWEEP ' + bld + ' declared=' + decl.length + ' medGap=' + G.medGap.toFixed(2) + 'm  ' +
        curve.map(c => c.f + 'x=' + c.ov + '(' + c.pct.toFixed(2) + '%)').join(' '));
      const at = f => curve.find(c => c.f === f).pct;
      const step0510 = at(0.5) - at(1.0), step1020 = at(1.0) - at(2.0);
      console.log('§S36_Q3_SHAPE ' + bld +
        ' drop_0.5x→1.0x=' + step0510.toFixed(2) + 'pp' +
        ' drop_1.0x→2.0x=' + step1020.toFixed(2) + 'pp' +
        ' ratio=' + (step1020 > 0.001 ? (step0510 / step1020).toFixed(1) + 'x' : 'inf') +
        ' verdict=' + (step0510 <= 0.5 ? 'PLATEAU at 1.0x (tightening to 0.5x costs <0.5pp)'
                     : step0510 > 3 * Math.max(step1020, 0.05) ? 'SLOPE — 1.0x is doing real work vs 0.5x'
                     : 'SHOULDER — modest slope below 1.0x'));
      // what does the outer half of the tolerance actually rescue? (0.5x → 1.0x population)
      const rescued = [];
      decl.forEach(d => {
        const di = LD.nearestIdx(G.grid, d.declZ);
        const gap = (di > 0 ? (G.grid[di] - G.grid[di - 1]) : G.medGap);
        const hi = (di === G.grid.length - 1) ? Infinity : G.grid[di + 1];
        const inAt = f => ((d.base_z - LD.EPS) < hi && (d.top_z + LD.EPS) > (G.grid[di] - gap * f));
        if (inAt(1.0) && !inAt(0.5)) rescued.push(d);
      });
      if (rescued.length) {
        const byCls = {};
        rescued.forEach(r => { byCls[r.cls] = (byCls[r.cls] || 0) + 1; });
        const gaps = rescued.map(r => {
          const di = LD.nearestIdx(G.grid, r.declZ);
          return (G.grid[di] - r.top_z) / (di > 0 ? (G.grid[di] - G.grid[di - 1]) : G.medGap);
        }).sort((a, b) => a - b);
        console.log('§S36_Q3_OUTERHALF ' + bld + ' rescuedOnlyBy_0.5x_to_1.0x=' + rescued.length +
          ' (' + (100 * rescued.length / decl.length).toFixed(2) + '% of declared)' +
          ' depthBelowFloorLine_asFractionOfGap p50=' + gaps[Math.floor(gaps.length / 2)].toFixed(2) +
          ' p90=' + gaps[Math.floor(gaps.length * 0.9)].toFixed(2) +
          ' topClasses=' + JSON.stringify(Object.keys(byCls).sort((a, b) => byCls[b] - byCls[a]).slice(0, 5)
            .reduce((o, k) => { o[k] = byCls[k]; return o; }, {})));
      }
    }
    db.close();
  }
  console.log('§S36_VERDICT selftestOk=' + ok + ' — READ-ONLY PROBE, no adoption, no wiring, buildings/*.db untouched');
}
main().catch(e => { console.error('§S36_ERROR ' + (e && e.stack || e)); process.exit(2); });
