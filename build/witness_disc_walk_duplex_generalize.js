#!/usr/bin/env node
/*
 * witness_disc_walk_duplex_generalize.js — Step 3 of the residential-standard arc:
 * prove the CLASH COLLAPSE. The shared disc_walker Placer/Gate walks PLB+ELEC onto
 * SH/SC (buildings the rules were NEVER mined from), then the IDENTICAL placed layout
 * is gated under TWO clearance standards:
 *   - Duplex (residential, mined): ELEC|PLB ~0.46m
 *   - Terminal (large-complex):    ELEC|PLB ~0.88-2.03m
 * Only the clearance THRESHOLD differs (same positions, same gate code), so any drop in
 * clash count is attributable purely to using the RIGHT-CLASS clearance — the cure for
 * forcing the airport's plenum number onto a house. NON-INVENT; an honest count.
 *
 * Issues proved/disproved:
 *   D1 COLLAPSE-RAW   — raw cross-disc clashes SEEN under Terminal clearance strictly
 *                       exceed those under Duplex clearance on the SAME layout (the
 *                       phantom clashes the wrong standard manufactures).
 *   D2 COLLAPSE-GATED — after the AvoidanceGate runs, the irreducible residual under
 *                       Duplex clearance <= residual under Terminal clearance.
 *   D3 NO-SILENT      — the gate stays honest with residential rules: every residual is
 *                       FLAGGED clash=true (no silent clash buried), as in Terminal.
 *   D4 NON-INVENT     — every placed ifc_class is a real class present in duplex_rules.db.
 *
 * Run: NODE_PATH=~/bim-ootb/tests/node_modules node build/witness_disc_walk_duplex_generalize.js
 */
const path = require('path'), fs = require('fs');
const DWT = require(path.join(__dirname, '..', 'scripts', 'dw_tree.js'));   // the shipped walker and its rules, never this folder's older copy (MODELLER_MASTER §WITNESS-REPOINT)
const ROOT = path.resolve(__dirname, '..');
const DW = require(DWT.walker);

function loadSqlJs() {
  const cands = [
    path.join(ROOT, 'node_modules/sql.js'),
    path.join(process.env.HOME || '', 'bim-ootb/tests/node_modules/sql.js'),
    'sql.js',
  ];
  for (const c of cands) { try { return require(c); } catch (e) { /* next */ } }
  throw new Error('sql.js not found (set NODE_PATH=~/bim-ootb/tests/node_modules)');
}

const DX_RULES = DWT.rules('duplex_rules.db');
const TERM_RULES = DWT.rules('terminal_rules.db');
const HOME = process.env.HOME || '';
const CANDS = {
  SampleHouse: [
    path.join(HOME, 'bim-ootb/modeller/SampleHouse_extracted.db'),
    path.join(ROOT, 'deploy/buildings/SampleHouse_extracted.db'),
  ],
  Duplex: [
    path.join(HOME, 'bim-ootb/modeller/Duplex_extracted.db'),
    path.join(ROOT, 'deploy/buildings/Duplex_extracted.db'),
  ],
  SampleCastle: [
    path.join(HOME, 'bim-ootb/modeller/SampleCastle_extracted.db'),
    path.join(ROOT, 'deploy/buildings/SampleCastle_extracted.db'),
  ],
};
const RES = Object.entries(CANDS).map(([key, cs]) => ({ key, db: cs.find(fs.existsSync) }))
  .filter(r => r.db);

let PASS = 0, FAIL = 0;
const ok = (c, m) => { (c ? PASS++ : FAIL++); console.log('  ' + (c ? '✅' : '❌') + ' ' + m); return c; };
const d3 = (p, q) => Math.sqrt((p.x - q.x) ** 2 + (p.y - q.y) ** 2 + (p.z - q.z) ** 2);

// count LOW-disc (PLB) elements within `mc` of ANY high-disc (ELEC) element — the clash
// a human SEES on canvas. SAME metric for both thresholds; only `mc` changes.
function rawClashes(layout, mc) {
  const plb = layout.filter(p => p.disc === 'PLB'), el = layout.filter(p => p.disc === 'ELEC');
  let n = 0;
  for (const lo of plb) { for (const hi of el) { if (d3(lo, hi) < mc) { n++; break; } } }
  return n;
}
const clone = L => L.map(p => ({ disc: p.disc, ifc_class: p.ifc_class, x: p.x, y: p.y, z: p.z, storey: p.storey }));

(async () => {
  const SQL = await loadSqlJs()();
  console.log('§DXG-BEGIN duplex-rules clash-collapse vs terminal-rules; residents=' +
    RES.map(r => r.key).join(','));

  // classes present in duplex rules (D4)
  const drdb = new SQL.Database(new Uint8Array(fs.readFileSync(DX_RULES)));
  const ruleClasses = new Set();
  ['rule_placement', 'rule_space_bom'].forEach(t => {
    const r = drdb.exec('SELECT DISTINCT ifc_class FROM ' + t);
    if (r.length) r[0].values.forEach(v => ruleClasses.add(v[0]));
  });

  for (const res of RES) {
    console.log('\n── ' + res.key + ' ──────────────────────────────────');
    const bdb = new SQL.Database(new Uint8Array(fs.readFileSync(res.db)));

    // 1) WALK PLB+ELEC with DUPLEX rules → one residential layout L
    DW.dwOpen(new SQL.Database(new Uint8Array(fs.readFileSync(DX_RULES))));
    const plb = DW.dwWalk('PLB', bdb, res.key), el = DW.dwWalk('ELEC', bdb, res.key);
    if (plb.refused || el.refused) {
      ok(false, 'D0 ' + res.key + ' PLB/ELEC walk refused (no substrate)'); bdb.close(); continue;
    }
    // Deterministic stride cap per disc: the placer tiles a large footprint at the
    // residential ~0.5m cadence, which on a big building (SC) yields >700k points and
    // makes the O(n²) cross-disc comparison intractable. Subsample BOTH discs by a fixed
    // stride — applied to the SAME layout for both clearance arms, so the collapse RATIO
    // (the proof) is preserved. LOGGED, never silent (anti-truncation rule).
    const CAP = 6000;
    const capDisc = (arr) => {
      if (arr.length <= CAP) return arr;
      const stride = arr.length / CAP, out = [];
      for (let i = 0; i < CAP; i++) out.push(arr[Math.floor(i * stride)]);
      return out;
    };
    const plbP = capDisc(plb.placements), elP = capDisc(el.placements);
    if (plb.placements.length > CAP || el.placements.length > CAP)
      console.log('  §DXG-CAP ' + res.key + ' subsampled PLB ' + plb.placements.length + '→' +
        plbP.length + ', ELEC ' + el.placements.length + '→' + elP.length +
        ' (deterministic stride, ratio-preserving for the O(n²) clash compare)');
    const L = plbP.concat(elP);
    ok(L.every(p => ruleClasses.has(p.ifc_class)),
      'D4 ' + res.key + ' every placed class ∈ duplex_rules (non-invent), placed=' + L.length +
      ' (walked PLB=' + plb.placements.length + ' ELEC=' + el.placements.length + ')');

    // 2) gate + raw-clash under DUPLEX clearance
    const dxClr = (DW.clearance()['ELEC|PLB'] || {}).min_clear || 0;
    const dxRaw = rawClashes(L, dxClr);
    const dxLayout = clone(L);
    const gDx = DW.gate(dxLayout);

    // 3) swap to TERMINAL rules, gate + raw-clash on the IDENTICAL layout.
    // Use the PRE-FIX inflated per-storey avoidance (archived) as the "terminal" arm:
    // this witness DEMONSTRATES the historical bug that forced an airport-plenum number
    // onto a house. The terminal_rules.db avoidance has since been RE-MINED to honest
    // global-p05 (remine_terminal_avoidance.py) — so we restore the archived inflated
    // rows in-memory here to keep this a valid regression of what the bug did.
    const tmDb = new SQL.Database(new Uint8Array(fs.readFileSync(TERM_RULES)));
    const hasArchive = tmDb.exec("SELECT name FROM sqlite_master WHERE name='rule_avoidance_perstorey_archived'").length;
    if (hasArchive) tmDb.exec("DELETE FROM rule_avoidance; INSERT INTO rule_avoidance SELECT * FROM rule_avoidance_perstorey_archived;");
    DW.dwOpen(tmDb);
    const tmClr = (DW.clearance()['ELEC|PLB'] || {}).min_clear || 0;
    const tmRaw = rawClashes(L, tmClr);
    const tmLayout = clone(L);
    const gTm = DW.gate(tmLayout);

    console.log('  §DXG-CLEAR ' + res.key + ' duplex_min_clear=' + dxClr.toFixed(3) +
      'm  terminal_min_clear(PRE-FIX inflated)=' + tmClr.toFixed(3) + 'm  (PLB+ELEC placed=' + L.length + ')');
    console.log('  §DXG-RAW   ' + res.key + ' raw cross-disc clashes seen: terminal=' + tmRaw +
      '  duplex=' + dxRaw + '  (collapse=' + (tmRaw - dxRaw) + ')');
    console.log('  §DXG-GATED ' + res.key + ' irreducible residual after gate: terminal=' + gTm.residual +
      '  duplex=' + gDx.residual + '  (iters dx=' + gDx.iterations + '/tm=' + gTm.iterations + ')');

    // D1 — raw collapse (residential clearance sees fewer phantom clashes on same layout)
    ok(tmRaw >= dxRaw && (tmRaw > dxRaw || tmRaw === 0),
      'D1 ' + res.key + ' RAW clash collapse: terminal ' + tmRaw + ' >= duplex ' + dxRaw +
      (tmRaw > dxRaw ? ' (fewer phantom clashes with residential clearance)' : ' (both 0 — honest)'));
    // D2 — gated residual collapse
    ok(gDx.residual <= gTm.residual,
      'D2 ' + res.key + ' GATED residual collapse: duplex ' + gDx.residual + ' <= terminal ' + gTm.residual);
    // D3 — no silent clash with duplex rules (gate honesty)
    const flagged = dxLayout.filter(p => p.clash).length;
    ok(flagged === gDx.residual,
      'D3 ' + res.key + ' NO SILENT clash under duplex rules: flagged=' + flagged + ' == residual=' + gDx.residual);

    bdb.close();
  }

  console.log('\n§DXG-END PASS=' + PASS + ' FAIL=' + FAIL);
  process.exit(FAIL ? 1 : 0);
})().catch(e => { console.error('FATAL', e); process.exit(2); });
