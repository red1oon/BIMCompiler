#!/usr/bin/env node
// witness_level_derive.js — the standing gate for build/level_deriver.js (§S32 runtime level
// derivation · §S34 tie-break). READ-ONLY: it opens the frozen buildings/*.db through sql.js's
// in-memory buffer and never writes.
//
// ⚠ DO NOT REMOVE — read the log after every run; exit code is not evidence.
//
// §VERIFICATION rule 1 (this file's own standing discipline): hand-verified synthetic cases are the
// PRIMARY proof. Part A below is 14 fixtures whose expected level is computed BY HAND from a stated
// grid, before the engine runs — each one names the rule it proves or disproves (§VERIFICATION
// rule: "a test that passes without revealing whether the issue is solved is not a test"). Part B
// is the fleet run, secondary confirmation only.
//
// The grid used by Part A, hand-written, is Terminal_meta's real declared grid rounded for legibility:
//   Z = [ 0, 4, 8, 12 ]   gaps 4,4,4 → medianGap 4, so every band is [Z_i − 4, Z_i+1)
//
// Usage:  node scripts/witness_level_derive.js            (fixtures + fleet)
//         FIXTURES_ONLY=1 node scripts/witness_level_derive.js
'use strict';
const fs = require('fs');
const path = require('path');
const LD = require(path.join(__dirname, '..', 'build', 'level_deriver.js'));

const TAG = '§W_LEVEL';
let pass = 0, fail = 0;
function check(name, proves, got, want) {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  ok ? pass++ : fail++;
  console.log(TAG + ' ' + (ok ? 'PASS' : '✗ FAIL') + ' ' + name +
    ' want=' + JSON.stringify(want) + ' got=' + JSON.stringify(got) + ' | proves: ' + proves);
  return ok;
}

// ── Part A — hand-computed fixtures ────────────────────────────────────────────────────────────
function fixtures() {
  const grid = [0, 4, 8, 12];
  const G = { grid: grid, medGap: 4, source: 'declared' };
  const L0 = { elementSpaces: {}, spaceParent: {}, storeyCenterZ: {}, storeyNameCenterZ: {}, rawStorey: {} };
  const withName = (nm, z) => Object.assign({}, L0, { storeyNameCenterZ: { [nm]: z } });
  const withSpace = (guid, z) => Object.assign({}, L0, {
    elementSpaces: { [guid]: ['sp1'] }, spaceParent: { sp1: 'st1' }, storeyCenterZ: { st1: z } });
  const el = (guid, base, top) => ({ guid, cls: 'IfcWall', base_z: base, top_z: top });
  const r = (e, raw, L) => LD.levelFor(e, raw, L, G);

  // A1 — a wall standing on storey 8, declared "L8". Declared and geometry agree. Level = 8.
  check('A1_declared_agrees', 'the common case: declared kept, no override',
    (x => [x.tier, x.source, x.level, x.overridden])(r(el('e1', 8.1, 10.9), 'L8', withName('L8', 8))),
    ['T2', 'declared', 8, false]);

  // A2 — a SLAB whose top IS the floor line: extent [7.7, 8.0], declared "L8". Hand-check: band(8)
  // = [8−4, 12) = [4, 12); 7.7 < 12 and 8.0 > 4 → overlaps → declared kept. This is the §S34.1
  // datum case that a |declZ − centerZ| test would have called a contradiction.
  check('A2_slab_below_floor_line', 'the §S34.1 hosted-at-level datum is NOT a contradiction',
    (x => [x.source, x.level, x.overridden])(r(el('e2', 7.7, 8.0), 'L8', withName('L8', 8))),
    ['declared', 8, false]);

  // A3 — a beam hanging one full storey below its declared level: extent [3.5, 4.0], declared "L8".
  // band(8) = [4, 12); top 4.0 + EPS(0.05) = 4.05 > 4 → still overlaps → declared kept. Exactly the
  // local-gap allowance §S34.1's tolerance sweep measured (knee at one storey height).
  check('A3_one_storey_below_still_declared', 'the local-gap allowance is one storey, not a constant',
    (x => [x.source, x.level, x.overridden])(r(el('e3', 3.5, 4.0), 'L8', withName('L8', 8))),
    ['declared', 8, false]);

  // A4 — an MEP fitting declared "L12" but sitting at 0.2–0.4 (ground). band(12) = [8, ∞);
  // 0.4 + 0.05 < 8 → NO overlap → GEOMETRY WINS. geom: base 0.2 ∈ band(0) = [−4, 4) → level 0.
  check('A4_far_miss_geometry_wins', '§S34.3 rule 2 — the override branch fires and is flagged',
    (x => [x.tier, x.source, x.level, x.overridden])(r(el('e4', 0.2, 0.4), 'L12', withName('L12', 12))),
    ['T3', 'geometry', 0, true]);

  // A5 — the same element WITHOUT a declared value: geometry, but NOT flagged as an override
  // (nothing was overridden — §S34.3 rule 3, no tie-break exists).
  check('A5_no_declared_not_an_override', 'override count ≠ geometry count; only real conflicts count',
    (x => [x.tier, x.source, x.level, x.overridden])(r(el('e5', 0.2, 0.4), 'Unknown', L0)),
    ['T3', 'geometry', 0, false]);

  // A6 — T1 beats T2: space→storey says 4, the name says 12. T1 must win (ladder order, §S33.1).
  check('A6_T1_beats_T2', 'ladder priority: containment outranks a name',
    (x => [x.tier, x.level])(r(el('e6', 4.1, 6.0), 'L12',
      Object.assign(withSpace('e6', 4), { storeyNameCenterZ: { L12: 12 } }))),
    ['T1', 4]);

  // A7 — a full-height riser [0.1, 11.9] declared "L0": band(0) = [−4, 4); 0.1 < 4 → overlaps →
  // declared kept. A tall element is not a contradiction (the §S34 SPAN case).
  check('A7_full_height_riser', 'a spanning element keeps its declared base level',
    (x => [x.source, x.level, x.overridden])(r(el('e7', 0.1, 11.9), 'L0', withName('L0', 0))),
    ['declared', 0, false]);

  // A8 — declared name that is not in the grid at all (no center_z for it): falls through to
  // geometry as T3, and is NOT an override (there was no declared VALUE to override).
  check('A8_unmatched_name_is_T3', 'a name without an elevation is not a declared value',
    (x => [x.tier, x.source, x.overridden])(r(el('e8', 8.2, 9.0), 'Mezzanine', withName('L8', 8))),
    ['T3', 'geometry', false]);

  // A9 — literal '_UNKNOWN' and 'Unknown' are both non-declarations (§S31.3's real finding: 32% of
  // Clinic resolves to storey Unknown).
  check('A9_unknown_sentinels', 'both Unknown spellings are treated as no declaration',
    [r(el('e9', 8.2, 9.0), '_UNKNOWN', withName('L8', 8)).tier,
     r(el('e9', 8.2, 9.0), 'unknown', withName('L8', 8)).tier], ['T3', 'T3']);

  // A10 — non-finite geometry with no declaration → T4, reported, NOT defaulted to a level.
  check('A10_T4_stays_uncovered', 'T4 is counted, never silently defaulted (§S32.4)',
    (x => [x.tier, x.source, x.level])(r(el('e10', NaN, NaN), 'Unknown', L0)), ['T4', 'none', null]);

  // A11 — non-finite geometry WITH a declaration → the declared value stands (nothing to check it
  // against). Coverage is preserved without inventing a position.
  check('A11_declared_survives_bad_geometry', 'a declared value is not thrown away for missing geometry',
    (x => [x.tier, x.source, x.level])(r(el('e11', NaN, NaN), 'L8', withName('L8', 8))), ['T2', 'declared', 8]);

  // A12 — element BELOW the lowest band's own extension (base −9, band(0) = [−4, 4)): geomIdx
  // cannot find a containing band and falls back to the nearest floor line, 0. Total, not undefined.
  check('A12_below_all_bands', 'the geometry tier is total even off the bottom of the grid',
    (x => [x.tier, x.level])(r(el('e12', -9, -8.5), 'Unknown', L0)), ['T3', 0]);

  // A13 — top band is open-ended: an element at 40 lands on 12, not off the end.
  check('A13_above_all_bands', 'the top band is [Z_last − gap, ∞), so nothing falls off the top',
    (x => [x.tier, x.level])(r(el('e13', 40, 41), 'Unknown', L0)), ['T3', 12]);

  // A14 — INSTRUMENT GUARD: the same element, one metre apart, must produce DIFFERENT levels.
  // If this passes while A4 also passes, the classifier is responding to input, not returning a
  // constant — the specific failure this lane produced three times (§STATUS instrument rule).
  const a = r(el('e14', 3.9, 4.0), 'Unknown', L0).level;
  const b = r(el('e14', 4.1, 4.2), 'Unknown', L0).level;
  check('A14_responds_to_input', 'the classifier is not a constant — 3.9m→0, 4.1m→4', [a, b], [0, 4]);

  console.log(TAG + '_FIXTURES pass=' + pass + ' fail=' + fail +
    (fail === 0 ? ' — ALL HAND-COMPUTED CASES PASS' : '  ⚠ FIXTURE FAILURE — do not trust the fleet run below'));
  return fail === 0;
}

// ── Part B — fleet run against the frozen DBs (secondary confirmation) ─────────────────────────
async function fleet() {
  const ROOT = process.env.OOTB || path.join(require('os').homedir(), 'bim-ootb');
  const initSqlJs = require(path.join(ROOT, 'modeller', 'lib', 'sql-wasm.js'));
  const ScheduleAuthor = require(path.join(ROOT, 'viewer', 'schedule_author.js'));
  const BLD = path.join(ROOT, 'buildings');
  const FLEET = (process.env.ONLY || ['Terminal_meta', 'Hospital_meta', 'Clinic_meta', 'LTU_AHouse_meta',
    'Duplex_extracted', 'HHS_Office_Federated_extracted', 'JKR_extracted'].join(',')).split(',');

  const SQL = await initSqlJs({ wasmBinary: fs.readFileSync(path.join(ROOT, 'modeller', 'lib', 'sql-wasm.wasm')) });
  const src = fs.readFileSync(path.join(ROOT, 'viewer', 'rates.js'), 'utf8');
  const RATES = (new Function(src + '\nreturn {SEQUENCE_RULES:SEQUENCE_RULES, SEQUENCE_DEFAULT:SEQUENCE_DEFAULT,' +
    ' SEQUENCE_NAME_OVERRIDES:SEQUENCE_NAME_OVERRIDES, LABOR_RATES:LABOR_RATES, RATES:RATES};'))();

  const rows = [];
  for (const bld of FLEET) {
    const p = path.join(BLD, bld + '.db');
    if (!fs.existsSync(p)) { console.log(TAG + '_SKIP ' + bld); continue; }
    const db = new SQL.Database(fs.readFileSync(p));
    const elements = ScheduleAuthor._buildScheduleElements(db, RATES.SEQUENCE_RULES, {
      laborRates: RATES.LABOR_RATES, rates: RATES.RATES,
      nameOverrides: RATES.SEQUENCE_NAME_OVERRIDES, defaultRule: RATES.SEQUENCE_DEFAULT });
    const res = LD.derive(db, elements, { label: bld });
    rows.push({ bld, n: res.n, T4: res.tier.T4, declared: res.source.declared,
                geometry: res.source.geometry, overrides: res.overrides.length, gridSource: res.gridSource });
    db.close();
  }
  const totT4 = rows.reduce((s, r) => s + r.T4, 0);
  const totN = rows.reduce((s, r) => s + r.n, 0);
  const totOv = rows.reduce((s, r) => s + r.overrides, 0);
  const totDecl = rows.reduce((s, r) => s + r.declared, 0);
  console.log(TAG + '_FLEET ' + JSON.stringify(rows));
  console.log(TAG + '_FLEET_VERDICT buildings=' + rows.length + ' elements=' + totN +
    ' uncovered(T4)=' + totT4 + ' coverage=' + (100 * (totN - totT4) / totN).toFixed(3) + '%' +
    ' declaredKept=' + totDecl + ' geometryOverrides=' + totOv +
    ' (' + (100 * totOv / Math.max(1, totDecl + totOv)).toFixed(2) + '% of elements that had a declared value)' +
    ' ' + (totT4 === 0 ? 'TOTAL=YES' : 'TOTAL=NO — §S32.4 STOP-AND-REPORT'));
  return totT4 === 0;
}

(async function main() {
  const fx = fixtures();
  if (process.env.FIXTURES_ONLY) { process.exit(fx ? 0 : 1); }
  const fl = await fleet();
  console.log(TAG + '_VERDICT fixtures=' + (fx ? 'PASS' : 'FAIL') + ' fleetTotal=' + (fl ? 'PASS' : 'FAIL') +
    ' — READ-ONLY, buildings/*.db unchanged (verify with md5sum), not wired into the scheduler');
  process.exit(fx && fl ? 0 : 1);
})().catch(e => { console.error(TAG + '_ERROR ' + (e && e.stack || e)); process.exit(2); });
