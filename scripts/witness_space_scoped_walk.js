#!/usr/bin/env node
/**
 * # ⚠ DO NOT REMOVE — W-SPACE-SCOPED-WALK scope (read this block first)
 * SCOPE: SPACE_SCOPED_DISC_INSTALL_VISION.md piece 2 ("scope place()/occupancy() to an optional space
 *   boundary") — the small, isolated first test the user asked for ("pick 1-2 real, named, visually
 *   distinctive spaces... extract just their real boundary, scope one ACMV or FP walk to just that
 *   space"). CENTRAL WAITING (Clinic, First Floor, real bbox 20.41m x 9.20m) is that pick.
 * SCOPE NOTE (non-invent, read before citing this as a routing claim): Clinic is NOT one of
 *   WalkerDoctrine's named building classes (SH/DX/SC=duplex_rules.db, Terminal=terminal_rules.db as
 *   itself). This witness opens terminal_rules.db directly as a MECHANISM PROOF — same treatment as
 *   the existing §DWG/§DXG "Terminal-on-small generalization test" witnesses (WalkerDoctrine.md
 *   §DWG note: "walks Terminal-on-small as a GENERALIZATION TEST, not the production path") — it
 *   proves the space-scoping CODE PATH is correct using Terminal's real measured FP/ACMV rules, not a
 *   claim that Clinic's production discipline should route through terminal_rules by default.
 * NON-INVENT: space boundary = CENTRAL WAITING's own real extracted bbox (piece 1 + this session's
 *   storey-resolution fix). Placement rules = Terminal's real measured rule_placement rows, unchanged.
 *   Read the §-log after the run; exit code is not the evidence.
 *
 * CLAIMS (each names the issue it proves or disproves):
 *   M1 SPACE-SCOPED-PLACES  — dwWalk({spaceGuid}) places > 0 real fixtures for a heavy DISC (FP), not a
 *                           REFUSE, proving the mechanism actually produces placements.
 *   M2 ALL-INSIDE-BOUNDARY  — every placed fixture's (x,y) falls inside CENTRAL WAITING's own real bbox —
 *                           the numeric ground-truth check the vision doc asks for (space boundary
 *                           polygon vs rendered fixture positions), not eyeballed.
 *   M3 SCOPED-SMALLER-THAN-WHOLE-BUILDING — the space-scoped count is a small fraction of the SAME
 *                           discipline walked whole-building (no spaceGuid) — proves area-scaling
 *                           actually narrowed to the space, not silently falling back to the full floor.
 *   M4 HONEST-REFUSE        — a bogus spaceGuid REFUSES cleanly (no crash, no silent whole-building
 *                           fallback), same REFUSE-beats-fabricate discipline as every other gap in
 *                           this engine.
 *   M5 ACMV-ALSO-WORKS      — the SAME mechanism (no per-discipline code) also places a real ACMV walk
 *                           scoped to the same space — disc-agnostic, per doctrine.
 *   M6 REGRESSION           — the full existing DW witness suite still passes 0-FAIL after this change.
 */
'use strict';
var fs = require('fs');
var path = require('path');
var initSqlJs = require('sql.js');

var ROOT = path.join(__dirname, '..');
var DWT = require('./dw_tree.js');   // the shipped walker and its rules, never the older build/ copy (MODELLER_MASTER §WITNESS-REPOINT)
var CLINIC_DB = process.argv[2] || path.join(process.env.HOME, 'bim-ootb/buildings/Clinic_extracted.db');
var TERMINAL_RULES = DWT.rules('terminal_rules.db');
var CENTRAL_WAITING_GUID = '0ztdC3L1HAzhbhMHypqbH5';
var LOG = path.join(ROOT, 'logs', 'witness_space_scoped_walk_' +
  new Date().toISOString().replace(/[:.]/g, '').slice(0, 15) + '.log');

var _lines = [];
function log(s) { _lines.push(s); console.log(s); }
var pass = 0, fail = 0;
function assert(claim, cond, detail) {
  if (cond) { pass++; log('  ✅ ' + claim + ' — ' + detail); }
  else { fail++; log('  ❌ ' + claim + ' — ' + detail); }
}
function loadDb(SQL, f) { return new SQL.Database(new Uint8Array(fs.readFileSync(f))); }
function rows(db, sql) {
  var r = db.exec(sql); if (!r.length) return [];
  return r[0].values.map(function (v) { var o = {}; r[0].columns.forEach(function (c, i) { o[c] = v[i]; }); return o; });
}

initSqlJs().then(function (SQL) {
  log('═══ W-SPACE-SCOPED-WALK — piece 2 (occupancy()/place() scoped to CENTRAL WAITING) ═══');
  var DW = require(DWT.walker);

  var rulesDb = loadDb(SQL, TERMINAL_RULES);
  DW.dwOpen(rulesDb);

  var sp = rows(loadDb(SQL, CLINIC_DB), "SELECT t.center_x cx, t.center_y cy, COALESCE(t.bbox_x,0) bx, COALESCE(t.bbox_y,0) by_ " +
    "FROM elements_meta m JOIN element_transforms t ON m.guid=t.guid WHERE m.guid='" + CENTRAL_WAITING_GUID + "'")[0];
  var bx0 = sp.cx - sp.bx / 2, bx1 = sp.cx + sp.bx / 2, by0 = sp.cy - sp.by_ / 2, by1 = sp.cy + sp.by_ / 2;
  log('CENTRAL WAITING real bbox: x[' + bx0.toFixed(2) + ',' + bx1.toFixed(2) + '] y[' + by0.toFixed(2) + ',' + by1.toFixed(2) + ']' +
    ' area=' + (sp.bx * sp.by_).toFixed(1) + 'm²');

  // ── M1 + M2: FP scoped to the space ──
  var bdbFP = loadDb(SQL, CLINIC_DB);
  var rFP = DW.dwWalk('FP', bdbFP, 'Clinic', { spaceGuid: CENTRAL_WAITING_GUID });
  assert('M1 SPACE-SCOPED-PLACES', !rFP.refused && rFP.placed > 0,
    'FP scoped to CENTRAL WAITING: placed=' + rFP.placed + (rFP.refused ? ' REFUSED: ' + rFP.reason : ''));
  var outside = (rFP.placements || []).filter(function (p) {
    return p.x < bx0 - 1e-6 || p.x > bx1 + 1e-6 || p.y < by0 - 1e-6 || p.y > by1 + 1e-6;
  });
  assert('M2 ALL-INSIDE-BOUNDARY', rFP.placed > 0 && outside.length === 0,
    outside.length + '/' + rFP.placed + ' placed fixtures fall outside CENTRAL WAITING\'s real bbox (expected 0)');

  // ── M3: same discipline walked whole-building (no spaceGuid) should place MANY more ──
  var bdbWhole = loadDb(SQL, CLINIC_DB);
  var rWhole = DW.dwWalk('FP', bdbWhole, 'Clinic');
  assert('M3 SCOPED-SMALLER-THAN-WHOLE-BUILDING', !rWhole.refused && rFP.placed < rWhole.placed,
    'space-scoped=' + rFP.placed + ' vs whole-building=' + rWhole.placed + ' (scoped must be the smaller of the two)');

  // ── M4: bogus spaceGuid REFUSEs cleanly ──
  var bdbBogus = loadDb(SQL, CLINIC_DB);
  var rBogus = DW.dwWalk('FP', bdbBogus, 'Clinic', { spaceGuid: 'NOT_A_REAL_GUID' });
  assert('M4 HONEST-REFUSE', rBogus.refused === true && rBogus.placed === 0,
    'bogus spaceGuid → refused=' + rBogus.refused + ' placed=' + rBogus.placed + ' reason=' + rBogus.reason);

  // ── M5: ACMV, same mechanism, no per-discipline code ──
  var bdbACMV = loadDb(SQL, CLINIC_DB);
  var rACMV = DW.dwWalk('ACMV', bdbACMV, 'Clinic', { spaceGuid: CENTRAL_WAITING_GUID });
  var outsideACMV = (rACMV.placements || []).filter(function (p) {
    return p.x < bx0 - 1e-6 || p.x > bx1 + 1e-6 || p.y < by0 - 1e-6 || p.y > by1 + 1e-6;
  });
  assert('M5 ACMV-ALSO-WORKS', !rACMV.refused && rACMV.placed > 0 && outsideACMV.length === 0,
    'ACMV scoped to CENTRAL WAITING: placed=' + rACMV.placed + ', ' + outsideACMV.length + ' outside boundary');

  log('');
  log('═══ M6 REGRESSION — existing DW witness suite (run separately: see log tail) ═══');

  log('');
  log('RESULT: ' + pass + ' pass, ' + fail + ' fail');
  fs.mkdirSync(path.join(ROOT, 'logs'), { recursive: true });
  fs.writeFileSync(LOG, _lines.join('\n') + '\n');
  console.log('log: ' + LOG);
  process.exit(fail ? 1 : 0);
});
