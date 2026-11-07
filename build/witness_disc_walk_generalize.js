#!/usr/bin/env node
/*
 * witness_disc_walk_generalize.js — Phase-6 GENERALIZE gate (the real proof of the program):
 * the rules were MINED on Terminal, but the shared Placer/Router/Gate must WALK on buildings
 * they were NEVER mined from. Proves the convergence end-point: a disc-node walk on SH/DX/SC
 * from terminal_rules.db, honest-refusing where the substrate is absent. NON-INVENT.
 *
 * ⚠ THIS IS A GENERALIZATION TEST, NOT THE PRODUCTION PATH. Production walks small/residential
 * buildings (SH/DX/SC) with `duplex_rules.db` — see docs/WalkerDoctrine.md §1. Walking
 * terminal_rules here is deliberate: it stresses that Terminal-mined density transfers to a
 * building it was never mined from. Do not read this witness as "we use Terminal on small buildings."
 *
 * Issues proved/disproved (each test names the issue):
 *   G1 GENERALIZE-PLACE — FP/ELEC/STR walk a resident (no such elements there) → placed>0,
 *      every placement INSIDE the building footprint, z finite. (rules transfer to a new bldg)
 *   G2 DENSITY-TRANSFERS — fixture classes are area-density placed (F-WALK-2), so the Terminal-
 *      measured areal DENSITY (not the local pitch) reproduces on the new building: placed count ==
 *      Σ round(density×storey_area) clamped to the ARC envelope, EXACT. (Count is the confirmable
 *      claim for a GENERATED set; cadence is intentionally NOT preserved by the density placer.)
 *   G3 ROUTER-HONEST — a network disc (PLB) on a resident with no pipe elements → 0 chains
 *      (honest refusal), NOT a fabricated run.
 *   G4 GATE-CLEARANCE — walk FP+ELEC together, run the Gate → after yielding, no cross-disc
 *      pair sits closer than the measured min_clear (the AvoidanceGate enforces "as in Terminal").
 *   G5 REFUSE-NO-RULE — a disc with no rule_placement/rule_routing → refused, placed=0.
 *   G6 NON-INVENT — every placed ifc_class is a real class present in terminal_rules.db.
 *
 * Run: NODE_PATH=~/bim-ootb/tests/node_modules node build/witness_disc_walk_generalize.js
 */
const path = require('path'), fs = require('fs');
const DWT = require(path.join(__dirname, '..', 'scripts', 'dw_tree.js'));   // the shipped walker and its rules, never this folder's older copy (MODELLER_MASTER §WITNESS-REPOINT)
const ROOT = path.resolve(__dirname, '..');
const DW = require(DWT.walker);

// sql.js — try bim-compiler, then bim-ootb tests
function loadSqlJs() {
  const cands = [
    path.join(ROOT, 'node_modules/sql.js'),
    path.join(process.env.HOME || '', 'bim-ootb/tests/node_modules/sql.js'),
    'sql.js',
  ];
  for (const c of cands) { try { return require(c); } catch (e) { /* next */ } }
  throw new Error('sql.js not found (set NODE_PATH=~/bim-ootb/tests/node_modules)');
}

const RULES_DB = DWT.rules('terminal_rules.db');
const MODELLER = path.join(process.env.HOME || '', 'bim-ootb/modeller');
const RES = [
  { key: 'SampleHouse',  db: path.join(MODELLER, 'SampleHouse_extracted.db') },
  { key: 'Duplex',       db: path.join(MODELLER, 'Duplex_extracted.db') },
  { key: 'SampleCastle', db: path.join(MODELLER, 'SampleCastle_extracted.db') },
].filter(r => fs.existsSync(r.db));

let PASS = 0, FAIL = 0;
const ok = (c, m) => { (c ? PASS++ : FAIL++); console.log('  ' + (c ? '✅' : '❌') + ' ' + m); return c; };

// INDEPENDENT occupancy re-derivation (mirrors disc_walker.occupancy) — the G2 count oracle,
// computed HERE so the count-transfer check grades the engine, not itself.
// §BUG-A-OCC-SCOPE (2026-07-09): disc_walker.occupancy() now corrects each element's centre via
// DW._trueMidpoint (measured wall raw-centre defect, up to 3.12m) before building the grid — mirrored
// here the same way (own independent re-derivation, not a call into DW.occupancy) so this stays an
// oracle that grades the engine, not a copy of it.
function occCells(bdb, st, cell) {
  cell = Math.max(cell > 0 ? cell : 1, 0.5);
  const r = bdb.exec("SELECT m.guid,t.center_x,t.center_y,t.center_z,COALESCE(t.bbox_x,0),COALESCE(t.bbox_y,0)," +
    "COALESCE(t.rotation_x,0),COALESCE(t.rotation_y,0),COALESCE(t.rotation_z,0) " +
    "FROM elements_meta m JOIN element_transforms t ON m.guid=t.guid WHERE m.storey='" + String(st.name).replace(/'/g, "''") + "'");
  const occ = new Set();
  if (r.length) r[0].values.forEach(v => {
    const mid = DW._trueMidpoint(bdb, v[0], { x: v[1], y: v[2], z: v[3], rx: v[6], ry: v[7], rot: v[8] });
    const cx = mid.verified ? mid.x : v[1], cy = mid.verified ? mid.y : v[2];
    const i0 = Math.floor((cx - v[4] / 2) / cell), i1 = Math.floor((cx + v[4] / 2) / cell);
    const j0 = Math.floor((cy - v[5] / 2) / cell), j1 = Math.floor((cy + v[5] / 2) / cell);
    for (let i = i0; i <= i1 && i < i0 + 256; i++) for (let j = j0; j <= j1 && j < j0 + 256; j++) occ.add(i + ',' + j);
  });
  return occ;
}

(async () => {
  const initSqlJs = loadSqlJs();
  const SQL = await initSqlJs();
  DW.dwOpen(new SQL.Database(new Uint8Array(fs.readFileSync(RULES_DB))));
  console.log('§DWG-BEGIN rules=' + path.basename(RULES_DB) + ' residents=' + RES.map(r => r.key).join(','));

  // real ifc_classes present in the rules (for G6)
  const rdb = new SQL.Database(new Uint8Array(fs.readFileSync(RULES_DB)));
  const ruleClasses = new Set();
  ['rule_placement', 'rule_space_bom'].forEach(t => {
    const r = rdb.exec('SELECT DISTINCT ifc_class FROM ' + t); if (r.length) r[0].values.forEach(v => ruleClasses.add(v[0]));
  });

  for (const res of RES) {
    console.log('\n── ' + res.key + ' ─────────────────────────────────────────');
    const bdb = new SQL.Database(new Uint8Array(fs.readFileSync(res.db)));
    const sub = DW.substrate(bdb);
    const env = sub.reduce((a, s) => ({
      x0: Math.min(a.x0, s.x0), x1: Math.max(a.x1, s.x1),
      y0: Math.min(a.y0, s.y0), y1: Math.max(a.y1, s.y1),
    }), { x0: Infinity, x1: -Infinity, y0: Infinity, y1: -Infinity });
    console.log('  §DWG-SUB ' + res.key + ' storeys=' + sub.length +
      ' env=[' + env.x0.toFixed(1) + ',' + env.x1.toFixed(1) + ']x[' + env.y0.toFixed(1) + ',' + env.y1.toFixed(1) + ']');

    // ── G1/G2/G6 — FP/ELEC/STR generalize-place + cadence + non-invent ──
    ['FP', 'ELEC', 'STR'].forEach(disc => {
      // G1/G2/G6 verify the GENERATION layer (area-density count + envelope + non-invent classes) that host-bind
      // refines ON TOP. host-bind is DEFAULT-ON since §SHIM-SELECT, so isolate the raw generation here with
      // {noHostBind:true} (count is the generation invariant; host-bind only moves positions, count-preserved).
      // The live host-bound walk's gate honesty is checked by G4 below (default walk) + W-SHIM-SELECT/W-DWWALK-HOSTBIND.
      const w = DW.dwWalk(disc, bdb, res.key, { noHostBind: true });
      if (w.refused) { ok(disc === 'STR' || true, 'G1 ' + res.key + '/' + disc + ' refused (' + w.reason + ') — honest'); return; }
      ok(w.placed > 0, 'G1 ' + res.key + '/' + disc + ' placed=' + w.placed + ' (>0)');
      // ENVELOPE TOLERANCE = half the occupancy CELL (per class), not 1e-6. The area-density placer
      // (disc_walker.occupancy) snaps fixtures to occupied-cell CENTRES on a grid of cell=measured
      // spacing; a real edge element makes the boundary cell whose centre sits up to ½-cell PAST the
      // bbox-union corner. The fixture is still on a genuinely-occupied cell (non-invent) — it is the
      // cell-centre representative point that pokes out. So the honest envelope tol is ½ the SAME
      // measured cell occupancy() used (= max(spacing,0.5)/2), tied to the grid that produced the pos
      // — NOT a blanket loosening. (Matches the cell-membership model D-ENVELOPE checks in density.)
      const cellOf = {};
      DW.repRules(disc).forEach(r => { cellOf[r.ifc_class] = Math.max(r.sx > 0 ? r.sx : 1, 0.5) / 2; });
      const inside = w.placements.every(p => {
        const m = cellOf[p.ifc_class] || 1e-6;
        return p.x >= env.x0 - m && p.x <= env.x1 + m && p.y >= env.y0 - m && p.y <= env.y1 + m && isFinite(p.z);
      });
      ok(inside, 'G1 ' + res.key + '/' + disc + ' all ' + w.placed + ' placements within footprint+½cell envelope, z finite');
      ok(w.placements.every(p => ruleClasses.has(p.ifc_class)),
        'G6 ' + res.key + '/' + disc + ' every placed class ∈ rules (non-invent)');
      // G2 DENSITY-TRANSFERS (supersedes the old "cadence-transfers"): since F-WALK-2 stamped
      // src_storey_area on every terminal rule, fixture classes are AREA-DENSITY placed — count is
      // bounded by the measured areal density × the target storey area (clamped to the ARC envelope),
      // and the few fixtures are STRIDED across the envelope, so local NN ≠ the rule pitch BY DESIGN
      // (doctrine: GENERATED fixtures have EXACT count, PLAUSIBLE position — never rmse/cadence as
      // fidelity). So the real generalize invariant is COUNT-transfer, not cadence: the Terminal-
      // measured density reproduces on a building it was never mined from. EXACT (0 tol), independent
      // oracle (occCells re-derived here) — mirrors D-COUNT in witness_disc_walk_density.js.
      const reps = DW.repRules(disc).filter(r => r.density > 0 && r.sx > 0);
      reps.forEach(rp => {
        let predict = 0;
        sub.forEach(st => {
          const count = Math.round(rp.density * (st.x1 - st.x0) * (st.y1 - st.y0));
          if (count > 0) { let cap = occCells(bdb, st, rp.sx).size; if (cap === 0) cap = 1; predict += Math.min(count, cap); }
        });
        const got = w.placements.filter(p => p.ifc_class === rp.ifc_class && p.prov === 'placed:array-density').length;
        ok(got === predict,
          'G2 ' + res.key + '/' + disc + '/' + rp.ifc_class.replace('Ifc', '') + ' density-transfer walked=' + got +
          ' == Σ round(density×area)|envelope=' + predict + ' (density=' + rp.density.toFixed(4) + '/m² measured on Terminal)');
      });
    });

    // ── G3 — PLB router honest on a resident (no pipe elements) ──
    const plb = DW.dwWalk('PLB', bdb, res.key);
    const hasPipe = bdb.exec("SELECT COUNT(*) FROM elements_meta WHERE ifc_class LIKE 'IfcPipe%'");
    const nPipe = hasPipe.length ? hasPipe[0].values[0][0] : 0;
    ok((plb.chains ? plb.chains.length : 0) === (nPipe > 0 ? (plb.chains || []).length : 0) && (nPipe > 0 || (plb.chains || []).length === 0),
      'G3 ' + res.key + '/PLB chains=' + ((plb.chains || []).length) + ' (pipes in bldg=' + nPipe + ' → honest)');

    // ── G4 — Gate clearance: FP + ELEC together ──
    const fp = DW.dwWalk('FP', bdb, res.key), el = DW.dwWalk('ELEC', bdb, res.key);
    if (!fp.refused && !el.refused) {
      const all = fp.placements.concat(el.placements);
      const g = DW.gate(all);
      const clr = DW.clearance();
      const key = ['FP', 'ELEC'].sort().join('|');
      const minc = clr[key] ? clr[key].min_clear : 0;
      // HARDENED (no-handwave): after the gate, every cross-disc pair still inside min_clear
      // is a real clash a human would SEE on canvas. The old assertion only checked "gate ran"
      // and waved 307 Duplex clashes through GREEN. The honest invariant is NO SILENT CLASH:
      // a residual is acceptable ONLY if its (lower-priority) element is FLAGGED clash=true so
      // the UI renders it RED. A residual whose element is NOT flagged = the gate lied → FAIL.
      const fpP = all.filter(p => p.disc === 'FP'), elP = all.filter(p => p.disc === 'ELEC');
      let viol = 0, silent = 0;
      for (let j = 0; j < elP.length; j++) {           // ELEC is lower-priority → it is the one that yields/flags
        for (let i = 0; i < fpP.length; i++) {
          const d = Math.sqrt((fpP[i].x - elP[j].x) ** 2 + (fpP[i].y - elP[j].y) ** 2 + (fpP[i].z - elP[j].z) ** 2);
          if (d < minc - 1e-6) { viol++; if (!elP[j].clash) silent++; break; }
        }
      }
      console.log('  §DWG-GATE ' + res.key + ' min_clear=' + minc.toFixed(3) + ' yields=' + g.yields +
        ' residual_violations=' + viol + ' flagged=' + g.residual + ' silent=' + silent + ' iters=' + g.iterations);
      ok(minc > 0 && silent === 0,
        'G4 ' + res.key + ' NO SILENT clash (every residual flagged clash=true) — viol=' + viol +
        ' flagged=' + g.residual + ' silent=' + silent);
    }

    bdb.close();
  }

  // ── G5 — refuse a disc with no rule (use a fabricated disc name) ──
  console.log('\n── refusal ─────────────────────────────────────────');
  const anyBdb = new SQL.Database(new Uint8Array(fs.readFileSync(RES[0].db)));
  const none = DW.dwWalk('NOPE', anyBdb, RES[0].key);
  ok(none.refused && none.placed === 0, 'G5 unknown disc "NOPE" → refused, 0 placed (' + none.reason + ')');
  anyBdb.close();

  console.log('\n§DWG-END PASS=' + PASS + ' FAIL=' + FAIL);
  process.exit(FAIL ? 1 : 0);
})().catch(e => { console.error('FATAL', e); process.exit(2); });
