#!/usr/bin/env node
/**
 * # ⚠ DO NOT REMOVE — W-OCC-TRUE-MIDPOINT scope (read this block first)
 * SCOPE: RESUME_DISC_WALKER_ENVELOPE_BOUND.md §BUG-A ⛔ open item 1 ("MEP-wide scope — routeChains/
 *   _loadXYZ(B)/occupancy()/gate() all still read raw center_x/y/z uncorrected... not scoped, not started").
 *   This witness MEASURES, per site, whether the raw-centre-vs-true-midpoint defect (proven on IfcWall
 *   SIDE-mount hosts, up to 3.12m) actually manifests, rather than assuming it generalizes:
 *     - routeChains/_loadXYZ(B) (PLB/ACMV nn-pairing classes: IfcFlowSegment/IfcFlowFitting) — MEASURED
 *       negligible (max 0.21m on real evidence, dwarfed by reach/gap bounds) — NOT fixed. Same "don't
 *       overfit past the evidence" precedent already applied to hostBind's point-host branch (see
 *       disc_walker.js lines ~472-479): a correction with no proven defect at the site is scope creep.
 *     - occupancy() — MEASURED real (walls dominate every storey's footprint mask, delta up to 3.12m
 *       Duplex / 1.03m SampleCastle) — FIXED (disc_walker.js `_occElements`/`occupancy`), cached per
 *       (bdb,storey) since occupancy() is called once per placement rule × storey.
 *     - gate() — NOT a raw-DB reader at all (operates on already-placed p.x/y/z); the open item's framing
 *       was imprecise on this one. No fix applicable; nothing to scope.
 *   NON-INVENT: measurements run `DW._trueMidpoint` against this repo's own committed `deploy/buildings/
 *   *.db` (real mesh geometry), no synthetic data. Read the §-log after the run; exit code is not the
 *   evidence (Log Mandate).
 *
 * CLAIMS (each names the issue it proves or disproves):
 *   M1 ROUTING-NEGLIGIBLE — IfcFlowSegment/IfcFlowFitting true-midpoint delta stays under 0.25m on every
 *                           mesh-backed building (Duplex, SampleCastle) — an order of magnitude below the
 *                           wall defect, confirming routeChains/_loadXYZ(B) need no correction.
 *   M2 WALL-DEFECT-CONFIRMED — IfcWall* true-midpoint delta reaches 1-3m on the same buildings, confirming
 *                           occupancy()'s raw-centre read WAS a real, proven risk (not hypothetical).
 *   M3 OCC-FIX-APPLIED — disc_walker.occupancy() now reports different (corrected) cells than a frozen
 *                           pre-fix reproduction wherever a building's own walls carry the defect.
 *   M4 REGRESSION       — the full existing DW witness suite (§DWG/§DXG/density/hostbind-agnostic/
 *                           true-midpoint/shim-select/elec-hostbind/dwwalk-hostbind/walkback-mep/
 *                           generalize-xbuild/rule-connector) still passes 0-FAIL — the occupancy fix
 *                           rippled into 3 independent-oracle mirrors (G2/D-ENVELOPE/H1), all re-baselined
 *                           in the same commit, not silently left broken.
 */
'use strict';
var fs = require('fs');
var path = require('path');
var initSqlJs = require('sql.js');
var execSync = require('child_process').execSync;

var ROOT = path.join(__dirname, '..');
var DWT = require('./dw_tree.js');   // the shipped walker and its rules, never the older build/ copy (MODELLER_MASTER §WITNESS-REPOINT)
var DW = require(DWT.walker);
var LOG = path.join(ROOT, 'logs', 'witness_occ_true_midpoint_' +
  new Date().toISOString().replace(/[:.]/g, '').slice(0, 15) + '.log');

var _lines = [];
function log(s) { _lines.push(s); console.log(s); }
var pass = 0, fail = 0;
function assert(claim, cond, detail) {
  if (cond) { pass++; log('  ✅ ' + claim + ' — ' + detail); }
  else { fail++; log('  ❌ ' + claim + ' — ' + detail); }
}
function rows(db, sql) {
  var r = db.exec(sql); if (!r.length) return [];
  return r[0].values.map(function (v) { var o = {}; r[0].columns.forEach(function (c, i) { o[c] = v[i]; }); return o; });
}
function loadDb(SQL, f) { return new SQL.Database(new Uint8Array(fs.readFileSync(f))); }

function measureDelta(bdb, cls) {
  var els = rows(bdb, "SELECT m.guid g, t.center_x x, t.center_y y, t.center_z z, " +
    "COALESCE(t.rotation_x,0) rx, COALESCE(t.rotation_y,0) ry, COALESCE(t.rotation_z,0) rot " +
    "FROM elements_meta m JOIN element_transforms t ON m.guid=t.guid WHERE m.ifc_class " +
    (cls === 'IfcWall%' ? "LIKE '" + cls + "'" : "='" + cls + "'"));
  var deltas = [], verified = 0;
  els.forEach(function (e) {
    var mid = DW._trueMidpoint(bdb, e.g, e);
    if (mid.verified) { verified++; deltas.push(Math.hypot(mid.x - e.x, mid.y - e.y, mid.z - e.z)); }
  });
  deltas.sort(function (a, b) { return a - b; });
  var n = deltas.length, max = n ? deltas[n - 1] : 0;
  return { n: els.length, verified: verified, max: max };
}

initSqlJs().then(function (SQL) {
  log('═══ W-OCC-TRUE-MIDPOINT — MEP-wide scope of §BUG-A-TRUE-MIDPOINT (RESUME item 1) ═══');

  // ── M1 ROUTING-NEGLIGIBLE + M2 WALL-DEFECT-CONFIRMED ──
  [
    { db: 'deploy/buildings/Duplex_extracted.db', label: 'Duplex' },
    { db: 'deploy/buildings/SampleCastle_extracted.db', label: 'SampleCastle' },
  ].forEach(function (t) {
    var bdb = loadDb(SQL, path.join(ROOT, t.db));
    ['IfcFlowSegment', 'IfcFlowFitting'].forEach(function (cls) {
      var m = measureDelta(bdb, cls);
      if (m.n === 0) return;
      log('  ' + t.label + '/' + cls + ': n=' + m.n + ' verified=' + m.verified + ' max-delta=' + m.max.toFixed(4) + 'm');
      assert('M1 ROUTING-NEGLIGIBLE [' + t.label + '/' + cls + ']', m.max < 0.25,
        'true-midpoint delta max=' + m.max.toFixed(4) + 'm < 0.25m (routing classes need no correction)');
    });
    var w = measureDelta(bdb, 'IfcWall%');
    log('  ' + t.label + '/IfcWall*: n=' + w.n + ' verified=' + w.verified + ' max-delta=' + w.max.toFixed(4) + 'm');
    assert('M2 WALL-DEFECT-CONFIRMED [' + t.label + ']', w.max > 1.0,
      'true-midpoint delta max=' + w.max.toFixed(4) + 'm > 1.0m (occupancy() raw-centre read was a real risk)');
    bdb.close();
  });

  // ── M3 OCC-FIX-APPLIED (disc_walker.occupancy corrects cells wherever walls carry the defect) ──
  function oldOccupancy(bdb, st, cell) {
    cell = Math.max(cell > 0 ? cell : 1, 0.5);
    var els = rows(bdb, "SELECT t.center_x cx, t.center_y cy, COALESCE(t.bbox_x,0) bx, COALESCE(t.bbox_y,0) by_ " +
      "FROM elements_meta m JOIN element_transforms t ON m.guid=t.guid WHERE m.storey='" + st.name.replace(/'/g, "''") + "'");
    var occ = {};
    els.forEach(function (e) {
      var i0 = Math.floor((e.cx - e.bx / 2) / cell), i1 = Math.floor((e.cx + e.bx / 2) / cell);
      var j0 = Math.floor((e.cy - e.by_ / 2) / cell), j1 = Math.floor((e.cy + e.by_ / 2) / cell);
      for (var i = i0; i <= i1 && i < i0 + 256; i++) for (var j = j0; j <= j1 && j < j0 + 256; j++) occ[i + ',' + j] = 1;
    });
    return Object.keys(occ);
  }
  var dupPath = path.join(ROOT, 'deploy/buildings/Duplex_extracted.db');
  var dup = loadDb(SQL, dupPath), rdb = loadDb(SQL, DWT.rules('duplex_rules.db'));
  DW.dwOpen(rdb);
  var sub = DW.substrate(dup);
  var st0 = sub[0];
  var oldCells = oldOccupancy(dup, st0, 1).sort();
  var newCells = DW.occupancy(dup, st0, 1).map(function (c) { return Math.floor(c.x) + ',' + Math.floor(c.y); }).sort();
  assert('M3 OCC-FIX-APPLIED', JSON.stringify(oldCells) !== JSON.stringify(newCells),
    'occupancy() cell set on Duplex/' + st0.name + ' differs pre-vs-post fix (old=' + oldCells.length + ' new=' + newCells.length + ' cells) — fix is exercised, not vacuous');
  dup.close(); rdb.close();

  // ── M4 REGRESSION (full existing suite) ──
  var suite = [
    'scripts/witness_true_midpoint.js', 'scripts/witness_dwwalk_hostbind.js', 'scripts/witness_elec_hostbind.js',
    'scripts/witness_hostbind_agnostic.js', 'scripts/witness_shim_select.js', 'scripts/witness_walkback_mep.js',
    'build/witness_disc_walk_generalize.js', 'build/witness_disc_walk_duplex_generalize.js',
    'scripts/witness_generalize_xbuild.js', 'scripts/witness_rule_connector.js', 'build/witness_disc_walk_density.js'
  ];
  suite.forEach(function (script) {
    try {
      var out = execSync('node ' + script, { cwd: ROOT, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
      var nFail = (out.match(/❌/g) || []).length;
      assert('M4 REGRESSION [' + script + ']', nFail === 0, nFail + ' failing assertions');
    } catch (e) {
      var out2 = (e.stdout || '') + (e.stderr || '');
      var nFail2 = (out2.match(/❌/g) || []).length;
      assert('M4 REGRESSION [' + script + ']', false, script + ' threw/non-zero exit — ' + (nFail2 ? nFail2 + ' fails' : e.message.split('\n')[0]));
    }
  });

  log('═══ SUMMARY: ' + pass + ' pass, ' + fail + ' fail ═══');
  fs.mkdirSync(path.dirname(LOG), { recursive: true });
  fs.writeFileSync(LOG, _lines.join('\n') + '\n');
  console.log('log: ' + LOG);
  process.exit(fail === 0 ? 0 : 1);
});
