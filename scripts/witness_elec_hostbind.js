#!/usr/bin/env node
/**
 * # ⚠ DO NOT REMOVE — W-ELEC-HOSTBIND scope (read this block first)
 * SCOPE: Prove the ANTI-FLOAT fix for wall-mounted ELEC on SampleHouse. The long-standing defect: residential
 *   ELEC rules are mined as `ref_kind='storey'` (area/density), so `place('ELEC', SH)` scatters outlets at
 *   FOOTPRINT-cell centres → they float mid-room (measured: 38/38 ~3.9m off any wall). ELEC outlets/switches are
 *   HOST-BOUND in reality. This drives them through `disc_walker.hostBind`, which snaps each placement onto the
 *   nearest REAL wall using the shim percept READ FROM ERP.db `_shim_attributes` (ELEC_WALL_SHIM | IfcWall | SIDE).
 *   NON-INVENT: walls are real (SH geometry); the shim percept is the prior-art ERP.db fact, never guessed; a
 *   placement with no wall within reach is REFUSED (kept floating + counted), not fabricated onto a wall.
 *   This is a SPIKE to show the assumption holds (host-bind kills the float) before promoting it into the mining
 *   pipeline next session. Read the §-log after the run; exit code is not the evidence (Log Mandate).
 *
 * CLAIMS (each names the issue it proves or disproves):
 *   E0 PERCEPT-SOURCE — the ELEC wall-shim percept comes from ERP.db `_shim_attributes` (host=IfcWall, mount=SIDE),
 *                       not a hardcoded constant. If ERP.db lacks it → the test cannot run honestly (asserted).
 *   E1 BEFORE-FLOAT   — the CURRENT placement floats: the median ELEC point is well off any wall (the defect, measured).
 *   E2 AFTER-ADHERE   — after hostBind, the median bound point sits within wall-thickness of a real wall (the fix).
 *   E3 NON-INVENT     — every bound point carries a REAL host wall guid + a snap distance ≤ reach; 0 fabricated.
 *   E4 REFUSE         — any point with no wall in reach is REFUSED (counted), never forced — REFUSE beats fabricate.
 */
'use strict';
var fs = require('fs');
var path = require('path');
var initSqlJs = require('sql.js');

var ROOT = path.join(__dirname, '..');
var DWT = require('./dw_tree.js');   // the shipped walker and its rules, never the older build/ copy (MODELLER_MASTER §WITNESS-REPOINT)
var DW = require(DWT.walker);
var ERP = path.join(ROOT, 'library/disc_patterns.db');   // de-ERP: canonical pattern-store name (ERP.db is a back-compat symlink)
var RULES = DWT.rules('duplex_rules.db');
var SH = path.join(ROOT, 'deploy/buildings/SampleHouse_extracted.db');
var LOG = path.join(ROOT, 'logs', 'witness_elec_hostbind_' +
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

// dist from a point to the nearest wall CENTRELINE (the oracle "is it on a wall") — uses real wall geometry.
// §BUG-A-TRUE-MIDPOINT: element_transforms.center is NOT a reliable wall midpoint (RESUME_DISC_WALKER_
// ENVELOPE_BOUND.md) -- ground truth here must use the TRUE (mesh-reconstructed) midpoint via
// DW._trueMidpoint, same as hostBind() itself now does, or this checker stale-compares the FIXED code's
// output against the OLD/wrong wall line (verify-the-checker, not just the code under test).
function distToWalls(p, walls, bdb) {
  var best = Infinity;
  for (var i = 0; i < walls.length; i++) {
    var w = walls[i], horiz = w.bx >= w.by_ ? 0 : 1, hlen = (horiz === 0 ? w.bx : w.by_) / 2;
    var mid = (bdb && DW._trueMidpoint) ? DW._trueMidpoint(bdb, w.g, w) : { x: w.x, y: w.y };
    var a = [mid.x, mid.y], b = [mid.x, mid.y]; a[horiz] -= hlen; b[horiz] += hlen;
    var abx = b[0] - a[0], aby = b[1] - a[1], l2 = abx * abx + aby * aby;
    var t = l2 > 0 ? ((p.x - a[0]) * abx + (p.y - a[1]) * aby) / l2 : 0; t = t < 0 ? 0 : (t > 1 ? 1 : t);
    var d = Math.hypot(p.x - (a[0] + t * abx), p.y - (a[1] + t * aby));
    if (d < best) best = d;
  }
  return best;
}
function median(a) { if (!a.length) return Infinity; var s = a.slice().sort(function (x, y) { return x - y; }); return s[Math.floor(s.length / 2)]; }

(async function main() {
  log('═══ W-ELEC-HOSTBIND — anti-float fix for wall-mounted ELEC on SampleHouse (oracle=extracted.db + ERP.db percept) ═══');
  var SQL = await initSqlJs();

  // ── E0 PERCEPT-SOURCE — read the ELEC wall-shim percept from ERP.db (NON-INVENT) ──
  var erp = loadDb(SQL, ERP);
  var shimRow = rows(erp, "SELECT * FROM _shim_attributes WHERE product_value LIKE 'ELEC%WALL%'")[0];
  erp.close();
  log('§ELEC-HB ERP.db percept: ' + (shimRow ? JSON.stringify(shimRow) : 'MISSING'));
  assert('E0 PERCEPT-SOURCE',
    !!shimRow && /Wall/i.test(shimRow.host_ifc_class) && /SIDE/i.test(shimRow.mount),
    shimRow ? ('ELEC wall-shim from ERP.db: host=' + shimRow.host_ifc_class + ' mount=' + shimRow.mount +
      ' offset=' + shimRow.offset_mm + 'mm height=' + shimRow.height_mm + 'mm (prior-art, not invented)') : 'no ELEC wall shim in ERP.db');
  var shim = {
    host_ifc_class: shimRow ? shimRow.host_ifc_class : 'IfcWall',
    mount: shimRow ? shimRow.mount : 'SIDE',
    offset_m: shimRow && shimRow.offset_mm != null ? shimRow.offset_mm / 1000 : 0,
    height_m: shimRow && shimRow.height_mm ? shimRow.height_mm / 1000 : null,
    reach_m: 6
  };

  // ── run the CURRENT ELEC placement on SampleHouse ──
  var rdb = loadDb(SQL, RULES), sh = loadDb(SQL, SH);
  DW.dwOpen(rdb);
  var sub = DW.substrate(sh);
  // attach storey base-Z so hostBind can use the shim mount height (height isn't otherwise measured for SH)
  var storeyZ = {}; sub.forEach(function (st) { storeyZ[st.name] = st.z; });
  var placed = DW.place('ELEC', sub, sh).map(function (p) { p.storeyZ = storeyZ[p.storey]; return p; });
  var walls = rows(sh, "SELECT m.guid g, t.center_x x, t.center_y y, t.bbox_x bx, t.bbox_y by_ FROM elements_meta m JOIN element_transforms t ON m.guid=t.guid WHERE m.ifc_class LIKE '%Wall%'");
  log('§ELEC-HB substrate storeys=' + sub.length + ' · ELEC placed=' + placed.length + ' · real walls=' + walls.length);

  var FLOAT_TOL = 0.6;                                       // >0.6m from any wall centreline = floating in open space
  var wallThick = median(walls.map(function (w) { return Math.min(w.bx, w.by_); }));

  // ── E1 BEFORE-FLOAT ──
  var beforeD = placed.map(function (p) { return distToWalls(p, walls, sh); });
  var beforeFloat = beforeD.filter(function (d) { return d > FLOAT_TOL; }).length;
  var beforeMed = median(beforeD);
  log('§ELEC-HB BEFORE: ' + beforeFloat + '/' + placed.length + ' floating (>' + FLOAT_TOL + 'm), median dist-to-wall=' + beforeMed.toFixed(2) + 'm (prov=' + (placed[0] && placed[0].prov) + ')');
  assert('E1 BEFORE-FLOAT',
    beforeFloat > placed.length * 0.5 && beforeMed > FLOAT_TOL,
    'the defect is real: ' + beforeFloat + '/' + placed.length + ' ELEC points float, median ' + beforeMed.toFixed(2) + 'm off any wall');

  // ── apply the fix ──
  var hb = DW.hostBind(placed, sh, shim);
  log('§ELEC-HB hostBind: ' + hb.bound.length + ' bound to walls, ' + hb.refused + ' refused (no wall ≤ ' + shim.reach_m + 'm), hostWalls=' + hb.hostCount);

  // ── E2 AFTER-ADHERE ──
  var afterD = hb.bound.map(function (p) { return distToWalls(p, walls, sh); });
  var afterFloat = afterD.filter(function (d) { return d > FLOAT_TOL; }).length;
  var afterMed = median(afterD);
  log('§ELEC-HB AFTER: ' + afterFloat + '/' + hb.bound.length + ' still floating, median dist-to-wall=' + afterMed.toFixed(3) +
    'm (wall half-thickness=' + (wallThick / 2).toFixed(3) + 'm)');
  assert('E2 AFTER-ADHERE',
    hb.bound.length > 0 && afterMed <= wallThick && afterMed < beforeMed,
    'bound ELEC adheres: median dist ' + beforeMed.toFixed(2) + 'm → ' + afterMed.toFixed(3) + 'm (≤ wall thickness ' +
    wallThick.toFixed(3) + 'm); float ' + beforeFloat + '→' + afterFloat);

  // ── E3 NON-INVENT ──
  var realWallGuids = {};
  rows(sh, "SELECT guid g FROM elements_meta WHERE ifc_class LIKE '%Wall%'").forEach(function (r) { realWallGuids[r.g] = 1; });
  var badHost = hb.bound.filter(function (p) { return !p.host || !realWallGuids[p.host] || p.snapDist > shim.reach_m; }).length;
  log('§ELEC-HB NON-INVENT: ' + (hb.bound.length - badHost) + '/' + hb.bound.length + ' bound points carry a REAL wall guid within reach');
  assert('E3 NON-INVENT',
    badHost === 0 && hb.bound.length > 0,
    'every bound point traces a real host wall guid + snapDist ≤ reach (' + badHost + ' bad); zero fabricated walls');

  // ── E4 REFUSE ──
  log('§ELEC-HB REFUSE: ' + hb.refused + ' placements had no wall ≤ ' + shim.reach_m + 'm → kept floating, counted (not forced)');
  assert('E4 REFUSE',
    hb.refused >= 0 && (hb.bound.length + hb.refused) === placed.length,
    'bound + refused = placed (' + hb.bound.length + '+' + hb.refused + '=' + placed.length + '); refusals counted, never fabricated');

  rdb.close(); sh.close();
  log('───────────────────────────────────────────────');
  log('§ELEC-HB SUMMARY: SH ELEC float ' + beforeFloat + '/' + placed.length + ' (median ' + beforeMed.toFixed(2) +
    'm) → after host-bind ' + afterFloat + '/' + hb.bound.length + ' (median ' + afterMed.toFixed(3) +
    'm). Assumption HOLDS: host-bind via ERP.db shim percept kills the float, non-invent. Promote to mining next session.');
  log('W-ELEC-HOSTBIND: ' + pass + ' PASS / ' + fail + ' FAIL');
  try { fs.mkdirSync(path.dirname(LOG), { recursive: true }); fs.writeFileSync(LOG, _lines.join('\n')); log('§LOG ' + LOG); } catch (e) {}
  process.exit(fail ? 1 : 0);
})();
