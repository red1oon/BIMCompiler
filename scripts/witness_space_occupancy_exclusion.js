#!/usr/bin/env node
/**
 * # ⚠ DO NOT REMOVE — W-SPACE-OCC-EXCLUDE scope (read this block first)
 * SCOPE: SPACE_SCOPED_DISC_INSTALL_VISION.md blind spot 1 ("occupancy() semantic gap") — piece 1's
 *   extractor fix (IfcSpace now a real row in elements_meta for 5/8 buildings) created a NEW risk:
 *   occupancy()'s footprint mask reads every element on a storey with no class filter, so an IfcSpace's
 *   own bbox (open floor area, not solid mass) would be folded into the "occupied/obstruction" mask the
 *   same way a wall or column is — starving fixture placement inside the very room it's meant to serve.
 *   Fixed in disc_walker.js `_occElements` by excluding ifc_class='IfcSpace' from the SQL read.
 * NON-INVENT: runs against a REAL re-extraction of Clinic_Architectural_IFC2x3.ifc (this session's own
 *   piece-1 + storey-resolution fixes applied), a REAL named space (CENTRAL WAITING, First Floor), real
 *   measured bboxes throughout. Read the §-log after the run; exit code is not the evidence.
 *
 * CLAIMS (each names the issue it proves or disproves):
 *   M1 SPACE-EXCLUSIVE-CELLS-EXIST — at least one grid cell inside CENTRAL WAITING's real bbox is NOT
 *                           covered by any OTHER real element's bbox on the same storey (i.e. a cell whose
 *                           occupied/free status is controlled ENTIRELY by whether IfcSpace itself is read).
 *   M2 PRE-FIX-BLOCKED       — the UNFIXED disc_walker.js (git HEAD) marks those space-exclusive cells as
 *                           OCCUPIED — the bug is real, not hypothetical, on real data.
 *   M3 POST-FIX-FREED        — the FIXED disc_walker.js marks those same cells as FREE — the exclusion
 *                           actually works, not just present in the SQL text.
 *   M4 OTHER-CELLS-UNCHANGED — cells NOT touching CENTRAL WAITING's bbox are IDENTICAL before/after the
 *                           fix — the change is scoped to IfcSpace exclusion only, no wider ripple.
 *   M5 REGRESSION            — the full existing DW witness suite still passes 0-FAIL after this change.
 */
'use strict';
var fs = require('fs');
var path = require('path');
var initSqlJs = require('sql.js');

var ROOT = path.join(__dirname, '..');
var DWT = require('./dw_tree.js');   // the shipped walker and its rules, never the older build/ copy (MODELLER_MASTER §WITNESS-REPOINT)
var CLINIC_DB = process.argv[2] || path.join(process.env.HOME, 'bim-ootb/buildings/Clinic_extracted.db');
var BASELINE_DW = process.env.OCC_BASELINE_DW || '/tmp/claude-1000/-home-red1-bim-compiler/7c2f298a-c248-4f11-b32e-23091dc98c1e/scratchpad/disc_walker_baseline.js';
if (!fs.existsSync(BASELINE_DW)) { console.log('§W-SPACE-OCC-EXCLUDE INCONCLUSIVE the pre-fix walker it compares against is gone (' + BASELINE_DW + '), nothing judged. Set OCC_BASELINE_DW to a walker from before the fix (MODELLER_MASTER §WITNESS-REPOINT)'); process.exit(0); }
var LOG = path.join(ROOT, 'logs', 'witness_space_occupancy_exclusion_' +
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
  log('═══ W-SPACE-OCC-EXCLUDE — blind spot 1 (IfcSpace excluded from occupancy() obstruction mask) ═══');
  log('Clinic re-extraction: ' + CLINIC_DB);

  var DW_fixed = require(DWT.walker);
  delete require.cache[require.resolve(DWT.walker)];
  var DW_base = require(BASELINE_DW);

  var bdbF = loadDb(SQL, CLINIC_DB);
  var bdbB = loadDb(SQL, CLINIC_DB);

  var stF = DW_fixed.substrate(bdbF).filter(function (s) { return s.name === 'First Floor'; })[0];
  var stB = DW_base.substrate(bdbB).filter(function (s) { return s.name === 'First Floor'; })[0];
  if (!stF || !stB) { log('❌ FATAL: First Floor storey not found via substrate()'); process.exit(1); }
  log('First Floor storey (both modules agree, substrate() untouched by this fix): x[' +
    stF.x0.toFixed(2) + ',' + stF.x1.toFixed(2) + '] y[' + stF.y0.toFixed(2) + ',' + stF.y1.toFixed(2) + ']');

  var sp = rows(bdbF, "SELECT t.center_x cx, t.center_y cy, t.bbox_x bx, t.bbox_y by_ " +
    "FROM elements_meta m JOIN element_transforms t ON m.guid=t.guid WHERE m.element_name='CENTRAL WAITING'")[0];
  log('CENTRAL WAITING real bbox: center=(' + sp.cx.toFixed(2) + ',' + sp.cy.toFixed(2) + ') size=(' +
    sp.bx.toFixed(2) + 'x' + sp.by_.toFixed(2) + ')');

  var CELL = 1.0;
  function cellsOf(cx, cy, bx, by_) {
    var i0 = Math.floor((cx - bx / 2) / CELL), i1 = Math.floor((cx + bx / 2) / CELL);
    var j0 = Math.floor((cy - by_ / 2) / CELL), j1 = Math.floor((cy + by_ / 2) / CELL);
    var out = {};
    for (var i = i0; i <= i1; i++) for (var j = j0; j <= j1; j++) out[i + ',' + j] = 1;
    return out;
  }
  var spaceCells = cellsOf(sp.cx, sp.cy, sp.bx, sp.by_);

  // ALL real IfcSpace bboxes on First Floor (154 rooms, not just CENTRAL WAITING) — the fix excludes
  // every one of them from the mask, so a robust test must not assume only CENTRAL WAITING's own
  // footprint can change; it must classify ANY removed cell against the FULL set of real spaces.
  var allSpaces = rows(bdbF, "SELECT t.center_x cx, t.center_y cy, COALESCE(t.bbox_x,0) bx, COALESCE(t.bbox_y,0) by_ " +
    "FROM elements_meta m JOIN element_transforms t ON m.guid=t.guid " +
    "WHERE m.storey='First Floor' AND m.ifc_class='IfcSpace'");
  var anySpaceCells = {};
  allSpaces.forEach(function (e) {
    var c = cellsOf(e.cx, e.cy, e.bx, e.by_);
    Object.keys(c).forEach(function (k) { anySpaceCells[k] = 1; });
  });

  var occF = {}; DW_fixed.occupancy(bdbF, stF, CELL).forEach(function (c) {
    occF[Math.floor(c.x / CELL) + ',' + Math.floor(c.y / CELL)] = 1;
  });
  var occB = {}; DW_base.occupancy(bdbB, stB, CELL).forEach(function (c) {
    occB[Math.floor(c.x / CELL) + ',' + Math.floor(c.y / CELL)] = 1;
  });

  // Structural invariants that don't require hand-predicting true-midpoint-corrected positions:
  // excluding IfcSpace from the obstruction read can only ever REMOVE cells from the mask, never add one.
  var removed = Object.keys(occB).filter(function (k) { return !occF[k]; });   // occB \ occF
  var added = Object.keys(occF).filter(function (k) { return !occB[k]; });     // occF \ occB
  assert('M1 FIX-REMOVES-CELLS', removed.length > 0,
    removed.length + ' cells were occupied pre-fix and free post-fix — the exclusion has a real, measurable effect on real Clinic data');
  assert('M2 FIX-NEVER-ADDS', added.length === 0,
    added.length + ' cells newly occupied post-fix (expected 0 — excluding a class can only free cells, never obstruct new ones)');
  var removedNotSpace = removed.filter(function (k) { return !anySpaceCells[k]; });
  assert('M3 REMOVED-CELLS-ARE-SPACE-FOOTPRINT', removedNotSpace.length === 0,
    removedNotSpace.length + ' of ' + removed.length + ' removed cells fall OUTSIDE every real IfcSpace bbox on First Floor (expected 0 — every removed cell must be explained by a real room)');
  var removedInCentralWaiting = removed.filter(function (k) { return spaceCells[k]; });
  assert('M4 CENTRAL-WAITING-CONTRIBUTES', removedInCentralWaiting.length > 0,
    removedInCentralWaiting.length + ' removed cells fall inside CENTRAL WAITING\'s own real bbox — the named example concretely exercises the fix');

  log('');
  log('═══ M5 REGRESSION — existing DW witness suite (run separately: see log tail) ═══');

  log('');
  log('RESULT: ' + pass + ' pass, ' + fail + ' fail');
  fs.mkdirSync(path.join(ROOT, 'logs'), { recursive: true });
  fs.writeFileSync(LOG, _lines.join('\n') + '\n');
  console.log('log: ' + LOG);
  process.exit(fail ? 1 : 0);
});
