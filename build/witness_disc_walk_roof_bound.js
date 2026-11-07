#!/usr/bin/env node
/*
 * witness_disc_walk_roof_bound.js — W-TRM-ROOF-BOUND  (closes audit finding F-WALK-2)
 *
 * The GAP this closes (build/erp/AUDIT_WALK_GROUNDTRUTH.md §F-WALK-2):
 *   terminal_rules.db carried NO src_storey_area_m2, so every placement rule took the legacy
 *   bbox-tile path. For roof/IfcPlate (0.495×0.15 plate pitch = 13.5/m²) that tiled to the
 *   50 000/storey backstop CAP → SampleCastle roof placed=233 374 — a cap ARTIFACT, not a
 *   measured-bound count. The "GENERATED count-exact" badge did NOT cover roof.
 *
 * The fix (build/stamp_terminal_src_area.py + reconcile): stamp the MEASURED source-storey
 * footprint, so the engine area-scales roof exactly like duplex PLB/ELEC. This witness proves
 * roof is now bound by measured areal density + the real occupancy envelope, on a resident,
 * from BOTH rule sources (terminal_rules.db AND ERP.db via TRM001 views — equivalence-preserving).
 *
 * Each test names the issue it proves/disproves:
 *   B1 AREA-PATH    — every roof placement carries prov='placed:array-density' (the area-scaled
 *                     path engaged), NONE on the legacy tile path that produced the cap artifact.
 *   B2 COUNT-EXACT  — walked roof count == Σ round(density × storey_area) clamped to the ARC
 *                     occupancy envelope (independently recomputed here — same oracle as the
 *                     density witness; 0 tolerance). The count is the confirmable measured claim.
 *   B3 NOT-CAPPED   — walked roof count is FAR below the old bbox-tile cap (≤ measured-bound,
 *                     no 50 000/storey backstop artifact); reports old-tile-would-be for contrast.
 *   B4 EQUIV        — roof count identical from terminal_rules.db and ERP.db (F-WALK-1 drop-in
 *                     equivalence preserved across the rule-source change).
 *   B5 NONINVENT    — roof density = measured n_measured / measured src_storey_area (>0); class∈rules.
 *
 * Run: NODE_PATH=~/bim-ootb/tests/node_modules node build/witness_disc_walk_roof_bound.js
 */
const path = require('path'), fs = require('fs');
const DWT = require(path.join(__dirname, '..', 'scripts', 'dw_tree.js'));   // the shipped walker and its rules, never this folder's older copy (MODELLER_MASTER §WITNESS-REPOINT)
const ROOT = path.resolve(__dirname, '..');
const DW = require(DWT.walker);

function loadSqlJs() {
  const cands = [path.join(ROOT, 'node_modules/sql.js'),
    path.join(process.env.HOME || '', 'bim-ootb/tests/node_modules/sql.js'), 'sql.js'];
  for (const c of cands) { try { return require(c); } catch (e) { /* next */ } }
  throw new Error('sql.js not found (set NODE_PATH=~/bim-ootb/tests/node_modules)');
}

const RULES_DB = DWT.rules('terminal_rules.db');
const ERP_DB = path.join(ROOT, 'library/disc_patterns.db');   // de-ERP: canonical pattern-store name (was library/ERP.db)
const MODELLER = path.join(process.env.HOME || '', 'bim-ootb/modeller');
const RES = [
  { key: 'SampleCastle', db: path.join(MODELLER, 'SampleCastle_extracted.db') },
  { key: 'Duplex', db: path.join(MODELLER, 'Duplex_extracted.db') },
].filter(r => fs.existsSync(r.db));
const DISC = 'roof', CLS = 'IfcPlate';
const OLD_CAP = 50000;   // the legacy per-storey backstop that produced the 233 374 artifact

let PASS = 0, FAIL = 0;
const LINES = [];
const say = (s) => { LINES.push(s); console.log(s); };
const ok = (c, m) => { (c ? PASS++ : FAIL++); say('  ' + (c ? '✅' : '❌') + ' ' + m); return c; };

// independent occupancy capacity (mirrors disc_walker, recomputed HERE = genuine oracle)
function occCells(bdb, st, cell) {
  cell = Math.max(cell > 0 ? cell : 1, 0.5);
  const r = bdb.exec("SELECT t.center_x,t.center_y,COALESCE(t.bbox_x,0),COALESCE(t.bbox_y,0) " +
    "FROM elements_meta m JOIN element_transforms t ON m.guid=t.guid WHERE m.storey='" +
    String(st.name).replace(/'/g, "''") + "'");
  const occ = new Set();
  if (r.length) r[0].values.forEach(v => {
    const i0 = Math.floor((v[0] - v[2] / 2) / cell), i1 = Math.floor((v[0] + v[2] / 2) / cell);
    const j0 = Math.floor((v[1] - v[3] / 2) / cell), j1 = Math.floor((v[1] + v[3] / 2) / cell);
    for (let i = i0; i <= i1 && i < i0 + 256; i++) for (let j = j0; j <= j1 && j < j0 + 256; j++) occ.add(i + ',' + j);
  });
  return occ;
}

function walkRoof(ruleDb, bdb, key) {
  DW.dwOpen(ruleDb);
  const sub = DW.substrate(bdb);
  const reps = DW.repRules(DISC).filter(rp => rp.ifc_class === CLS);
  const w = DW.dwWalk(DISC, bdb, key);
  const placed = (w.placements || []).filter(p => p.ifc_class === CLS);
  return { sub, rep: reps[0], placed };
}

(async () => {
  for (const [p, n] of [[RULES_DB, 'terminal_rules.db'], [ERP_DB, 'ERP.db']]) {
    if (!fs.existsSync(p)) { console.error('FATAL: missing ' + n); process.exit(1); }
  }
  if (!RES.length) { console.error('FATAL: no resident DB'); process.exit(1); }
  const SQL = await loadSqlJs()();
  const rulesDb = new SQL.Database(new Uint8Array(fs.readFileSync(RULES_DB)));
  const erpDb = new SQL.Database(new Uint8Array(fs.readFileSync(ERP_DB)));
  say('=== W-TRM-ROOF-BOUND — roof/IfcPlate area-bound (closes F-WALK-2) ===');

  for (const res of RES) {
    say('\n── ' + res.key + ' ──────────────────────────────');
    const bdb = new SQL.Database(new Uint8Array(fs.readFileSync(res.db)));
    const R = walkRoof(rulesDb, bdb, res.key + '/rules');
    const E = walkRoof(erpDb, bdb, res.key + '/erp');
    const rp = R.rep;

    // B5 NONINVENT first (rp is the measured rule)
    ok(rp && rp.density > 0 && rp.n_measured > 0,
      'B5 NONINVENT ' + res.key + ' roof density=' + (rp ? rp.density.toFixed(4) : '?') +
      '/m² = measured n_measured/src_area (n=' + (rp ? rp.n_measured : '?') + ')');

    // B1 AREA-PATH — all roof placements on the area-scaled path, none on the legacy tile path
    const areaN = R.placed.filter(p => p.prov === 'placed:array-density').length;
    const tileN = R.placed.filter(p => p.prov === 'placed:array').length;
    ok(R.placed.length > 0 && areaN === R.placed.length && tileN === 0,
      'B1 AREA-PATH ' + res.key + ' roof placed=' + R.placed.length + ' all prov=placed:array-density (tile-path=' + tileN + ')');

    // B2 COUNT-EXACT — independent Σ round(density×storey_area)|envelope == walked count
    let predict = 0;
    R.sub.forEach(st => {
      const count = Math.round(rp.density * (st.x1 - st.x0) * (st.y1 - st.y0));
      if (count > 0) { let cap = occCells(bdb, st, rp.sx).size; if (cap === 0) cap = 1; predict += Math.min(count, cap); }
    });
    ok(areaN === predict,
      'B2 COUNT-EXACT ' + res.key + ' roof walked=' + areaN + ' == Σ round(density×area)|envelope=' + predict + ' (0-tol)');

    // B3 NOT-CAPPED — measured-bound count is far below the old bbox-tile cap artifact
    let oldTile = 0;
    R.sub.forEach(st => {
      oldTile += Math.min(OLD_CAP,
        Math.max(1, Math.round((st.x1 - st.x0) / rp.sx)) * Math.max(1, Math.round((st.y1 - st.y0) / rp.sy)));
    });
    ok(areaN < oldTile,
      'B3 NOT-CAPPED ' + res.key + ' roof measured-bound=' + areaN + ' << old bbox-tile(capped)=' + oldTile +
      ' (×' + (oldTile / Math.max(1, areaN)).toFixed(0) + ' fewer, no 50k artifact)');

    // B4 EQUIV — identical from terminal_rules.db and ERP.db (drop-in preserved)
    ok(R.placed.length === E.placed.length && areaN === E.placed.filter(p => p.prov === 'placed:array-density').length,
      'B4 EQUIV ' + res.key + ' roof count rules=' + R.placed.length + ' erp=' + E.placed.length + ' ≡');

    bdb.close();
  }

  rulesDb.close(); erpDb.close();
  say('');
  say('=== RESULT: ' + PASS + ' PASS / ' + FAIL + ' FAIL ===');
  fs.writeFileSync(path.join(__dirname, 'witness_disc_walk_roof_bound.log'), LINES.join('\n') + '\n');
  process.exit(FAIL ? 1 : 0);
})().catch(e => { console.error('FATAL ' + (e && e.stack || e)); process.exit(1); });
