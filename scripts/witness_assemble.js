#!/usr/bin/env node
/**
 * # ⚠ DO NOT REMOVE — W-ASSEMBLE scope (read this block first)
 * SCOPE: the ROUTE→ASSEMBLE bridge (docs/WalkerDoctrine.md roadmap #3). routeChains gives the real nn-NETWORK
 *   (segments between real extracted element guids on a MEP-bearing building). `disc_walker.assemble()` turns that
 *   network into instantiated catalog PARTS: at each routed NODE, instantiate the matching catalog piece
 *   (disc_patterns._import_joint_piece_types, by ifc_class) — POSE from the REAL node, TYPE+Ø from the catalog
 *   (MEASURED, mined off the SAME source building), ORIENTATION from the incident run direction.
 *
 *   ORACLE = Duplex-MEP (`build/Duplex_mep_extracted.db`, IFC2x3 generic IfcFlow*). The real extracted fittings/
 *   segments ARE the parts, and the catalog Ø was mined from this very building — so assemble is non-invent by
 *   construction: every assembled part sits on a real element and carries that class's measured catalog Ø. This is
 *   the LANDED class for assembly (real→real), the analogue of W-WALKBACK-MEP for routing. Read the §-log; exit
 *   code is not the evidence.
 *
 * CLAIMS:
 *   J1 PROJECTED-SOURCE   — (roadmap #3a) assemble with NO caller catalog reads the first-class PROJECTED
 *                           `rule_joint_piece` table (build/project_rule_joint_piece.py) and still instantiates parts.
 *   J2 PROJECTED-TRACEABLE— every projected-path part Ø == its rule_joint_piece row (the projected measured median).
 *   J3 PROJECTED-NON-INVENT — the projected Ø == an INDEPENDENT median of the source catalog for that class.
 *   J4 REFUSE-WHEN-ABSENT — with NEITHER caller catalog NOR a rule_joint_piece table, assemble REFUSES (no fabrication).
 *   A1 INSTANTIATED       — assemble('PLB', DXMEP, {catalog}) produces parts > 0 at the routed nodes.
 *   A2 LAND-ON-REAL       — every part.guid is a REAL elements_meta row and part.pos == its element_transforms
 *                           centre (1e-6). Pose is NOT fabricated — it is a real extracted element.
 *   A3 CATALOG-MEASURED-Ø — every part.diameter_mm == the INDEPENDENTLY re-measured median catalog Ø for its
 *                           ifc_class (0 tol). Size traces to _import_joint_piece_types; never a constant.
 *   A4 RUN-ORIENTED       — every part.dir is a UNIT vector (1e-6); directions VARY across parts (>1 distinct) →
 *                           derived from real per-node run geometry, not a fixed orientation. Spot-check: a part on
 *                           a single incident segment points along that segment's unit vector.
 *   A5 NON-INVENT-COUNT   — parts == unique routed nodes whose class has a catalog match (nodes-skipped); joints ==
 *                           segs; every part traces to (real guid + a catalog row). Zero fabricated guids.
 *   A6 JOINTS-CATALOG-Ø   — every joint carries dia_from/dia_to from the catalog (the join Ø pair, e.g.
 *                           FlowFitting Ø ↔ FlowSegment Ø) — traceable, reported (not asserted equal: a fitting↔
 *                           segment join legitimately changes Ø).
 */
'use strict';
var fs = require('fs');
var path = require('path');
var initSqlJs = require('sql.js');

var ROOT = path.join(__dirname, '..');
var DWT = require('./dw_tree.js');   // the shipped walker and its rules, never the older build/ copy (MODELLER_MASTER §WITNESS-REPOINT)
var DW = require(DWT.walker);
var DX_RULES = DWT.rules('duplex_rules.db');
var DXMEP = path.join(ROOT, 'build/Duplex_mep_extracted.db');
var PATTERNS = path.join(ROOT, 'library/disc_patterns.db');
var LOG = path.join(ROOT, 'logs', 'witness_assemble_' +
  new Date().toISOString().replace(/[:.]/g, '').slice(0, 15) + '.log');

var _lines = [];
function log(s) { _lines.push(s); console.log(s); }
var pass = 0, fail = 0;
function assert(c, cond, d) { if (cond) { pass++; log('  ✅ ' + c + ' — ' + d); } else { fail++; log('  ❌ ' + c + ' — ' + d); } }
function rows(db, sql) { var r = db.exec(sql); if (!r.length) return []; return r[0].values.map(function (v) { var o = {}; r[0].columns.forEach(function (c, i) { o[c] = v[i]; }); return o; }); }
function loadDb(SQL, f) { return new SQL.Database(new Uint8Array(fs.readFileSync(f))); }
function med(a) { a = a.filter(function (v) { return v != null; }).slice().sort(function (x, y) { return x - y; }); return a.length ? a[Math.floor(a.length / 2)] : 0; }

(async function main() {
  log('═══ W-ASSEMBLE — ROUTE→ASSEMBLE bridge: instantiate catalog parts at routed nodes (oracle=Duplex-MEP) ═══');
  var SQL = await initSqlJs();
  var rdb = loadDb(SQL, DX_RULES), dx = loadDb(SQL, DXMEP), pat = loadDb(SQL, PATTERNS);
  if (!rows(pat, "SELECT name FROM sqlite_master WHERE type='table' AND name='_import_joint_piece_types'").length) { console.log('§W-ASSEMBLE INCONCLUSIVE ' + PATTERNS + ' has no _import_joint_piece_types table, nothing judged: the catalog it grades against is not in this checkout (MODELLER_MASTER §WITNESS-REPOINT)'); process.exit(0); }
  DW.dwOpen(rdb);

  // catalog = the joint-piece percepts mined off Duplex (keyed by ifc_class)
  var catalog = rows(pat, "SELECT ifc_class, piece_type, diameter_mm, length_mm FROM _import_joint_piece_types " +
    "WHERE source_building LIKE '%Duplex%' AND ifc_class LIKE 'IfcFlow%'");
  log('§AS catalog rows (Duplex IfcFlow*): ' + catalog.length + ' over classes ' +
    JSON.stringify(Array.from(new Set(catalog.map(function (c) { return c.ifc_class; }))).sort()));

  // ── J1 PROJECTED-SOURCE (roadmap #3a): assemble with NO caller catalog reads the first-class rule_joint_piece ──
  var proj = DW.assemble('PLB', dx);                            // no opts.catalog → projected rule_joint_piece
  var rjp = rows(rdb, "SELECT ifc_class, diameter_mm FROM rule_joint_piece WHERE disc='PLB'");
  var rjpDia = {}; rjp.forEach(function (r) { rjpDia[r.ifc_class] = r.diameter_mm; });
  log('§AS J1 assemble PLB (PROJECTED, no caller catalog): refused=' + proj.refused + ' parts=' + (proj.parts || []).length +
    ' rule_joint_piece(PLB)=' + JSON.stringify(rjpDia));
  assert('J1 PROJECTED-SOURCE', !proj.refused && proj.parts.length > 0 && rjp.length > 0,
    proj.parts.length + ' parts from the PROJECTED rule_joint_piece table (no caller catalog needed) — §SHIM-SELECT/routing pattern');

  // ── J2 TRACEABLE: every projected-path part Ø == its rule_joint_piece row (the projected measured median) ──
  var jBad = proj.parts.filter(function (p) { return Math.abs(p.diameter_mm - rjpDia[p.ifc_class]) > 1e-9; }).length;
  assert('J2 PROJECTED-TRACEABLE', jBad === 0,
    'every projected part Ø == rule_joint_piece.diameter_mm for its (disc,ifc_class) (mismatch=' + jBad + ') — traceable to the projection');

  // ── J3 NON-INVENT: the projected Ø == an INDEPENDENT median of the source catalog for that class ──
  function pyMedian(a) { a = a.filter(function (v) { return v != null; }).slice().sort(function (x, y) { return x - y; });
    var n = a.length; if (!n) return null; var m = Math.floor(n / 2); return n % 2 ? a[m] : (a[m - 1] + a[m]) / 2; }
  var jInvent = 0;
  Object.keys(rjpDia).forEach(function (k) {
    var src = rows(pat, "SELECT diameter_mm d FROM _import_joint_piece_types WHERE ifc_class='" + k + "' AND source_building LIKE '%Duplex%'").map(function (r) { return r.d; });
    if (Math.abs(pyMedian(src) - rjpDia[k]) > 1e-9) jInvent++;
  });
  log('§AS J3 projected Ø re-measured from source catalog: classes=' + Object.keys(rjpDia).length + ' invented=' + jInvent);
  assert('J3 PROJECTED-NON-INVENT', jInvent === 0,
    'every rule_joint_piece Ø == independent median of disc_patterns catalog for class+source (invented=' + jInvent + ') — non-invent projection');

  // ── J4 REFUSE-WHEN-ABSENT: with NEITHER caller catalog NOR a rule_joint_piece table, assemble REFUSES (no fabrication) ──
  var bare = loadDb(SQL, DX_RULES); bare.run("DROP TABLE IF EXISTS rule_joint_piece");
  DW.dwOpen(bare);
  var noCat = DW.assemble('PLB', dx);
  DW.dwOpen(rdb);                                               // restore the projected rules DB for the rest
  log('§AS J4 assemble (no catalog + no rule_joint_piece): refused=' + noCat.refused + ' reason=' + (noCat.reason || '-'));
  assert('J4 REFUSE-WHEN-ABSENT', noCat.refused === true && /catalog/.test(noCat.reason || ''),
    'with no caller catalog AND no projected table, assemble REFUSES (' + (noCat.reason || '') + ') — parts come from the pattern store, never fabricated');

  // ── A1 INSTANTIATED ──
  var res = DW.assemble('PLB', dx, { catalog: catalog });
  log('§AS A1 assemble PLB: refused=' + res.refused + ' parts=' + (res.parts || []).length + ' joints=' +
    (res.joints || []).length + ' segs=' + res.segs + ' nodes=' + res.nodes + ' skipped=' + res.skipped);
  assert('A1 INSTANTIATED', !res.refused && res.parts.length > 0,
    res.parts.length + ' parts instantiated at routed nodes (segs=' + res.segs + ', nodes=' + res.nodes + ')');

  // oracle maps: real guid → centre
  var ctr = {}; rows(dx, "SELECT m.guid g, t.center_x x, t.center_y y, t.center_z z " +
    "FROM elements_meta m JOIN element_transforms t ON m.guid=t.guid").forEach(function (r) { ctr[r.g] = r; });
  var cls = {}; rows(dx, "SELECT guid g, ifc_class c FROM elements_meta").forEach(function (r) { cls[r.g] = r.c; });

  // ── A2 LAND-ON-REAL ──
  var offMax = 0, badGuid = 0;
  res.parts.forEach(function (p) {
    var o = ctr[p.guid];
    if (!o || cls[p.guid] !== p.ifc_class) { badGuid++; return; }
    var d = Math.max(Math.abs(p.pos[0] - o.x), Math.abs(p.pos[1] - o.y), Math.abs(p.pos[2] - o.z));
    if (d > offMax) offMax = d;
  });
  log('§AS A2 land: badGuid=' + badGuid + ' maxPosDrift=' + offMax.toExponential(2) + 'm (every part on a real element)');
  assert('A2 LAND-ON-REAL', badGuid === 0 && offMax < 1e-6,
    'all ' + res.parts.length + ' parts sit on a REAL extracted element at its exact centre (drift ' + offMax.toExponential(2) + 'm) — pose non-invent');

  // ── A3 CATALOG-MEASURED-Ø ──  independent re-measure of the median Ø per class
  var oracleDia = {};
  Array.from(new Set(catalog.map(function (c) { return c.ifc_class; }))).forEach(function (k) {
    oracleDia[k] = med(catalog.filter(function (c) { return c.ifc_class === k; }).map(function (c) { return c.diameter_mm; }));
  });
  var diaBad = res.parts.filter(function (p) { return Math.abs(p.diameter_mm - oracleDia[p.ifc_class]) > 1e-9; }).length;
  var diaSeen = {}; res.parts.forEach(function (p) { diaSeen[p.ifc_class] = p.diameter_mm; });
  log('§AS A3 catalog-Ø per class: ' + JSON.stringify(diaSeen) + ' (oracle ' + JSON.stringify(oracleDia) + ') mismatch=' + diaBad);
  assert('A3 CATALOG-MEASURED-Ø', diaBad === 0 && res.parts.length > 0,
    'every part Ø == independently re-measured median catalog Ø for its class (mismatch=' + diaBad + ') — measured, traceable to _import_joint_piece_types');

  // ── A4 RUN-ORIENTED ──
  var notUnit = 0, dirKeys = {};
  res.parts.forEach(function (p) {
    var L = Math.sqrt(p.dir[0] * p.dir[0] + p.dir[1] * p.dir[1] + p.dir[2] * p.dir[2]);
    if (Math.abs(L - 1) > 1e-6) notUnit++;
    dirKeys[p.dir.map(function (v) { return v.toFixed(3); }).join(',')] = 1;
  });
  var distinctDirs = Object.keys(dirKeys).length;
  // spot-check: re-derive a single-incident node's dir from its one segment, independently
  var segByFrom = {}, deg = {};
  res.joints.forEach(function (j) { deg[j.from_guid] = (deg[j.from_guid] || 0) + 1; deg[j.to_guid] = (deg[j.to_guid] || 0) + 1; segByFrom[j.from_guid] = j; });
  var spotOk = true, spotInfo = '(no single-incident from-node found)';
  var solo = res.parts.find(function (p) { return deg[p.guid] === 1 && segByFrom[p.guid]; });
  if (solo) {
    var j = segByFrom[solo.guid], a = ctr[j.from_guid], b = ctr[j.to_guid];
    var dx2 = b.x - a.x, dy2 = b.y - a.y, dz2 = b.z - a.z, LL = Math.sqrt(dx2 * dx2 + dy2 * dy2 + dz2 * dz2) || 1;
    var exp = [dx2 / LL, dy2 / LL, dz2 / LL];
    var dd = Math.max(Math.abs(solo.dir[0] - exp[0]), Math.abs(solo.dir[1] - exp[1]), Math.abs(solo.dir[2] - exp[2]));
    spotOk = dd < 1e-6; spotInfo = 'solo node dir==seg unit-vec drift=' + dd.toExponential(2);
  }
  log('§AS A4 orient: notUnit=' + notUnit + ' distinctDirs=' + distinctDirs + ' ' + spotInfo);
  assert('A4 RUN-ORIENTED', notUnit === 0 && distinctDirs > 1 && spotOk,
    'all part.dir unit-length, ' + distinctDirs + ' distinct directions (from real run geometry, not a constant); ' + spotInfo);

  // ── A5 NON-INVENT-COUNT ──
  var matchClasses = {}; catalog.forEach(function (c) { matchClasses[c.ifc_class] = 1; });
  var expectParts = res.nodes - res.skipped;
  var allTrace = res.parts.every(function (p) { return ctr[p.guid] && matchClasses[p.ifc_class] && /^assembled:/.test(p.prov); });
  log('§AS A5 parts=' + res.parts.length + ' == nodes(' + res.nodes + ')-skipped(' + res.skipped + ')=' + expectParts +
    ' ; joints=' + res.joints.length + ' == segs=' + res.segs + ' ; allTrace=' + allTrace);
  assert('A5 NON-INVENT-COUNT', res.parts.length === expectParts && res.joints.length === res.segs && allTrace,
    'parts==matched-nodes, joints==segs, every part traces to (real guid + catalog row), prov=assembled:* — zero fabricated');

  // ── A6 JOINTS-CATALOG-Ø ──
  var jWithDia = res.joints.filter(function (j) { return j.dia_from_mm != null && j.dia_to_mm != null; }).length;
  var sample = res.joints[0];
  log('§AS A6 joints with both Ø from catalog: ' + jWithDia + '/' + res.joints.length +
    ' (sample ' + (sample ? sample.dia_from_mm + 'mm↔' + sample.dia_to_mm + 'mm' : '-') + ')');
  assert('A6 JOINTS-CATALOG-Ø', jWithDia === res.joints.length && res.joints.length > 0,
    'every joint carries both connector Ø from the catalog (' + jWithDia + '/' + res.joints.length + ') — the join Ø pair is traceable, not invented');

  rdb.close(); dx.close(); pat.close();
  log('───────────────────────────────────────────────');
  log('§AS SUMMARY: ' + (res.parts || []).length + ' catalog parts assembled onto the Duplex-MEP routed network — ' +
    'pose from real nodes (drift ' + offMax.toExponential(1) + 'm), Ø from measured catalog, orientation from real run ' +
    'geometry; ' + res.joints.length + ' joints carry their catalog Ø pair. LANDED/real→real, nothing fabricated. ' +
    'docs/WalkerDoctrine.md roadmap #3 (ROUTE→ASSEMBLE).');
  log('W-ASSEMBLE: ' + pass + ' PASS / ' + fail + ' FAIL');
  try { fs.mkdirSync(path.dirname(LOG), { recursive: true }); fs.writeFileSync(LOG, _lines.join('\n')); log('§LOG ' + LOG); } catch (e) {}
  process.exit(fail ? 1 : 0);
})();
