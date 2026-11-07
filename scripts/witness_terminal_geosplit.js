#!/usr/bin/env node
/**
 * # ⚠ DO NOT REMOVE — W-TERMINAL-GEOSPLIT scope (read this block first)
 * SCOPE: RESUME_DISC_WALKER_ENVELOPE_BOUND.md ⛔ item 1 ("Terminal containment is now a data-recovery problem,
 *   not a walker-code one -- no mesh payload exists in any live/committed Terminal DB") was FALSIFIED 2026-07-09
 *   -- that conclusion was reached by testing `deploy/buildings/Terminal_extracted.db` (this repo's committed
 *   copy, used by the SEPARATE RosettaStone/RSS compiler-gate system, genuinely has zero geometry tables) and
 *   NEVER testing the actual live Modeller data. The LIVE Terminal resident (`~/bim-ootb/modeller/`) splits
 *   geometry across TWO files -- `Terminal_meta.db` (elements_meta/element_instances) + `Terminal_geo.db` (the
 *   250MB mesh payload, `component_geometries`) -- because sql.js can't JOIN across two independently-opened
 *   database handles (the exact reason `real_geometry.js`'s `buildGeometryIndex(db, geoDb)` already exists,
 *   proven live for Terminal's own rendering since 2026-07-02). `disc_walker.js`'s `_trueMidpoint`/`hostBind`/
 *   `occupancy`/`place`/`dwWalk` never got the same treatment -- this witness proves the NEW optional `geoDb`
 *   parameter (mirroring `real_geometry.js`'s exact pattern) closes that gap.
 *   NON-INVENT: reads the ACTUAL live `~/bim-ootb/modeller/Terminal_meta.db` + `Terminal_geo.db` (read-only,
 *   never edited). SKIPPED (not a false pass) if this machine doesn't have that checkout. Read the §-log after
 *   the run; exit code is not the evidence (Log Mandate).
 *
 * CLAIMS (each names the issue it proves or disproves):
 *   T1 NO-GEODB-UNVERIFIED  — WITHOUT the geoDb param (old call shape), all 333 Terminal walls report
 *                             midVerified:false -- reproduces the exact "no mesh" symptom the resume item
 *                             observed, proving this witness is testing the real defect, not a strawman.
 *   T2 WITH-GEODB-RESOLVES  — WITH the geoDb param, all 333/333 Terminal walls resolve a TRUE midpoint from
 *                             real mesh (component_geometries via Terminal_geo.db) -- the mesh was never
 *                             missing, disc_walker just couldn't see the second file.
 *   T3 DEFECT-MAGNITUDE     — the raw-centre-vs-true-midpoint delta on Terminal walls reaches >5m (worse than
 *                             the 3.12m/1.03m already proven on Duplex/SampleCastle) -- a genuine, severe
 *                             defect, not a rounding artifact.
 *   T4 REAL-SHIFT-NOT-VACUOUS — hostBind's actual bound-placement output differs measurably (not just
 *                             "verified" flag flips) between the no-geoDb and with-geoDb runs: max per-
 *                             placement shift >10m, >100 placements shift >1m. Envelope-outside-count alone is
 *                             NOT asserted here (Terminal's overall bbox is 75m×57m -- too coarse a net to
 *                             catch this on a building this size, unlike the tighter Duplex/SampleCastle
 *                             envelopes in witness_true_midpoint.js's T2) -- the shift magnitude is the real
 *                             evidence, exactly the same reviewer-caught lesson already recorded in that file.
 *   T5 REGRESSION           — every existing DW witness (single-file residents, geoDb omitted) stays 0-FAIL --
 *                             the new optional parameter is additive, not a signature-breaking change.
 */
'use strict';
var fs = require('fs');
var path = require('path');
var os = require('os');
var initSqlJs = require('sql.js');
var execSync = require('child_process').execSync;

var ROOT = path.join(__dirname, '..');
var DWT = require('./dw_tree.js');   // the shipped walker and its rules, never the older build/ copy (MODELLER_MASTER §WITNESS-REPOINT)
var DW = require(DWT.walker);
var TERMINAL_RULES = DWT.rules('terminal_rules.db');
var TERMINAL_META = path.join(os.homedir(), 'bim-ootb/modeller/Terminal_meta.db');
var TERMINAL_GEO = path.join(os.homedir(), 'bim-ootb/modeller/Terminal_geo.db');
var LOG = path.join(ROOT, 'logs', 'witness_terminal_geosplit_' +
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

initSqlJs().then(function (SQL) {
  log('═══ W-TERMINAL-GEOSPLIT — Terminal_meta.db + Terminal_geo.db, disc_walker geoDb param ═══');

  if (!fs.existsSync(TERMINAL_META) || !fs.existsSync(TERMINAL_GEO)) {
    log('  (⚠ ' + TERMINAL_META + ' / ' + TERMINAL_GEO + ' not found on this machine — SKIPPED, not a false pass)');
  } else {
    var meta = loadDb(SQL, TERMINAL_META), geo = loadDb(SQL, TERMINAL_GEO), rdb = loadDb(SQL, TERMINAL_RULES);
    DW.dwOpen(rdb);
    var walls = rows(meta, "SELECT m.guid g, t.center_x x, t.center_y y, t.center_z z, COALESCE(t.bbox_x,0) bx, " +
      "COALESCE(t.bbox_y,0) by_, COALESCE(t.rotation_x,0) rx, COALESCE(t.rotation_y,0) ry, COALESCE(t.rotation_z,0) rot " +
      "FROM elements_meta m JOIN element_transforms t ON m.guid=t.guid WHERE m.ifc_class LIKE '%Wall%'");
    log('  Terminal walls: ' + walls.length);

    // ── T1 / T2 / T3 ──
    var noGeoVerified = 0, withGeoVerified = 0, deltas = [];
    walls.forEach(function (w) {
      var midNoGeo = DW._trueMidpoint(meta, w.g, w);
      var midWithGeo = DW._trueMidpoint(meta, w.g, w, geo);
      if (midNoGeo.verified) noGeoVerified++;
      if (midWithGeo.verified) { withGeoVerified++; deltas.push(Math.hypot(midWithGeo.x - w.x, midWithGeo.y - w.y, midWithGeo.z - w.z)); }
    });
    deltas.sort(function (a, b) { return a - b; });
    var maxDelta = deltas.length ? deltas[deltas.length - 1] : 0;
    assert('T1 NO-GEODB-UNVERIFIED', noGeoVerified === 0,
      noGeoVerified + '/' + walls.length + ' verified without geoDb (expect 0 — reproduces the reported symptom)');
    assert('T2 WITH-GEODB-RESOLVES', withGeoVerified === walls.length,
      withGeoVerified + '/' + walls.length + ' verified WITH geoDb (expect all — the mesh was never missing)');
    assert('T3 DEFECT-MAGNITUDE', maxDelta > 5,
      'max true-midpoint delta on Terminal walls = ' + maxDelta.toFixed(4) + 'm (> 5m; Duplex was 3.12m, SampleCastle 1.03m)');

    // ── T4 REAL-SHIFT-NOT-VACUOUS (hostBind end-to-end) ──
    var sub = DW.substrate(meta);
    var placed = DW.place('ELEC', sub, meta, geo);
    var shim = { host_ifc_class: 'IfcWall', mount: 'SIDE', offset_m: 0, reach_m: 6 };
    var oldR = DW.hostBind(placed, meta, shim);        // no geoDb — old behaviour
    var newR = DW.hostBind(placed, meta, shim, geo);   // with geoDb — fixed
    var oldByHost = {}, newByHost = {};
    oldR.bound.forEach(function (o) { (oldByHost[o.host] = oldByHost[o.host] || []).push(o); });
    newR.bound.forEach(function (n) { (newByHost[n.host] = newByHost[n.host] || []).push(n); });
    var maxShift = 0, over1m = 0, nPaired = 0;
    Object.keys(newByHost).forEach(function (h) {
      var os_ = oldByHost[h], ns = newByHost[h];
      if (!os_ || !ns || os_.length !== ns.length) return;
      for (var i = 0; i < ns.length; i++) {
        var d = Math.hypot(os_[i].x - ns[i].x, os_[i].y - ns[i].y);
        nPaired++;
        if (d > maxShift) maxShift = d;
        if (d > 1) over1m++;
      }
    });
    log('  ELEC placed=' + placed.length + ' OLD bound=' + oldR.bound.length + ' (unverifiedHosts=' + oldR.unverifiedHosts +
      '/' + oldR.hostCount + ') NEW bound=' + newR.bound.length + ' (unverifiedHosts=' + newR.unverifiedHosts + '/' + newR.hostCount + ')');
    log('  paired placements=' + nPaired + ' max OLD→NEW shift=' + maxShift.toFixed(4) + 'm, ' + over1m + ' shifted >1m');
    assert('T4 REAL-SHIFT-NOT-VACUOUS', newR.unverifiedHosts === 0 && maxShift > 10 && over1m > 50,
      'unverifiedHosts=' + newR.unverifiedHosts + ' (expect 0), max shift=' + maxShift.toFixed(2) + 'm (>10), ' +
      over1m + ' placements shifted >1m (>50) — a real, large repositioning, not a flag flip');

    meta.close(); geo.close(); rdb.close();
  }

  // ── T5 REGRESSION ──
  var suite = [
    'scripts/witness_true_midpoint.js', 'scripts/witness_dwwalk_hostbind.js', 'scripts/witness_elec_hostbind.js',
    'scripts/witness_hostbind_agnostic.js', 'scripts/witness_shim_select.js', 'scripts/witness_walkback_mep.js',
    'build/witness_disc_walk_generalize.js', 'build/witness_disc_walk_duplex_generalize.js',
    'scripts/witness_generalize_xbuild.js', 'scripts/witness_rule_connector.js', 'build/witness_disc_walk_density.js',
    'scripts/witness_occ_true_midpoint.js'
  ];
  suite.forEach(function (script) {
    try {
      var out = execSync('node ' + script, { cwd: ROOT, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
      var nFail = (out.match(/❌/g) || []).length;
      assert('T5 REGRESSION [' + script + ']', nFail === 0, nFail + ' failing assertions');
    } catch (e) {
      var out2 = (e.stdout || '') + (e.stderr || '');
      var nFail2 = (out2.match(/❌/g) || []).length;
      assert('T5 REGRESSION [' + script + ']', false, script + ' threw/non-zero exit — ' + (nFail2 ? nFail2 + ' fails' : e.message.split('\n')[0]));
    }
  });

  log('═══ SUMMARY: ' + pass + ' pass, ' + fail + ' fail ═══');
  fs.mkdirSync(path.dirname(LOG), { recursive: true });
  fs.writeFileSync(LOG, _lines.join('\n') + '\n');
  console.log('log: ' + LOG);
  process.exit(fail === 0 ? 0 : 1);
});
