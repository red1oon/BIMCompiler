#!/usr/bin/env node
/**
 * # ⚠ DO NOT REMOVE — W-ASSEMBLE-CONNECT scope (read this block first)
 * SCOPE: roadmap #3b — connector-face ORIENTATION + clearance STANDOFF. A named assembly
 *   (disc_patterns.ad_assembly_connector) declares the FIXTURE→SERVICE hookup: which FACE connects to which
 *   SERVICE at what Ø (e.g. SPRINKLER TOP SUPPLY_IN Ø25 → FP_MAIN), and ad_assembly_manifest gives the standoff
 *   clearance per face. `disc_walker.connectorFor()` reads that hookup; `connectorEnrich()` attaches it to placed
 *   parts and stands the pose OFF along the connector face by the measured clearance.
 *
 *   ORACLE/APPLICATION = the LIVE SampleCastle FP sprinkler walk (dwWalk('FP', SC) borrowing terminal_rules):
 *   each of its IfcFireSuppressionTerminal sprinklers maps to the 'SPRINKLER' assembly → gets its measured
 *   TOP→FP_MAIN hookup (Ø25). NON-INVENT: face/Ø/connects_to/clearance are READ verbatim from the pattern store;
 *   only faceDir (face NAME → local axis) is a frame convention; a fixture with no mapped assembly is untouched.
 *   The ifc_class→assembly map is caller-passed for now (a projected rule_connector is the later first-class step,
 *   mirroring rule_shim/rule_joint_piece). Read the §-log; exit code is not the evidence.
 *
 * CLAIMS:
 *   C0 CONNECTOR-READ     — connectorFor('SPRINKLER', …) == the verbatim ad_assembly_connector row (face=TOP,
 *                           connects_to=FP_MAIN, Ø=25) with faceDir the TOP convention [0,0,1] + manifest standoff.
 *   C1 ENRICH-WALK        — connectorEnrich on the live SC FP sprinkler walk enriches every sprinkler; count preserved.
 *   C2 FACEDIR-UNIT       — every enriched connector.faceDir is unit-length and == the face-name convention.
 *   C3 STANDOFF-MATH      — posStood == pos + faceDir·standoff_m EXACTLY (real sprinkler standoff is the measured
 *                           flush 0; a synthetic nonzero clearance proves the offset is genuinely applied).
 *   C4 SERVICE-TRACEABLE  — every enriched connects_to/Ø traces to a real ad_assembly_connector row (no fabrication).
 *   C5 NON-INVENT-UNMAPPED— a fixture class with NO assembly mapping is left untouched (no .connector); count preserved.
 */
'use strict';
var fs = require('fs');
var path = require('path');
var initSqlJs = require('sql.js');

var ROOT = path.join(__dirname, '..');
var DWT = require('./dw_tree.js');   // the shipped walker and its rules, never the older build/ copy (MODELLER_MASTER §WITNESS-REPOINT)
var DW = require(DWT.walker);
var DX_RULES = DWT.rules('duplex_rules.db');
var TE_RULES = DWT.rules('terminal_rules.db');
var SC = path.join(ROOT, 'deploy/buildings/SampleCastle_extracted.db');
var PATTERNS = path.join(ROOT, 'library/disc_patterns.db');
var LOG = path.join(ROOT, 'logs', 'witness_assemble_connect_' +
  new Date().toISOString().replace(/[:.]/g, '').slice(0, 15) + '.log');

var _lines = [];
function log(s) { _lines.push(s); console.log(s); }
var pass = 0, fail = 0;
function assert(c, cond, d) { if (cond) { pass++; log('  ✅ ' + c + ' — ' + d); } else { fail++; log('  ❌ ' + c + ' — ' + d); } }
function rows(db, sql) { var r = db.exec(sql); if (!r.length) return []; return r[0].values.map(function (v) { var o = {}; r[0].columns.forEach(function (c, i) { o[c] = v[i]; }); return o; }); }
function loadDb(SQL, f) { return new SQL.Database(new Uint8Array(fs.readFileSync(f))); }

(async function main() {
  log('═══ W-ASSEMBLE-CONNECT — connector-face orientation + clearance standoff (apply to the live SC sprinkler walk) ═══');
  var SQL = await initSqlJs();
  var dx = loadDb(SQL, DX_RULES), te = loadDb(SQL, TE_RULES), sc = loadDb(SQL, SC), pat = loadDb(SQL, PATTERNS);
  var connectors = rows(pat, "SELECT assembly_id, face, connector_type, diameter_mm, connects_to FROM ad_assembly_connector");
  var manifest = rows(pat, "SELECT assembly_id, face, interface_type, clearance_m FROM ad_assembly_manifest");

  // ── C0 CONNECTOR-READ ──
  var con = DW.connectorFor('SPRINKLER', connectors, manifest);
  var raw = rows(pat, "SELECT face, connector_type, diameter_mm, connects_to FROM ad_assembly_connector WHERE assembly_id='SPRINKLER'")[0];
  log('§AC C0 connectorFor(SPRINKLER)=' + JSON.stringify({ face: con.face, faceDir: con.faceDir, dia: con.dia_mm, to: con.connects_to, standoff: con.standoff_m }) +
    ' (raw row ' + JSON.stringify(raw) + ')');
  assert('C0 CONNECTOR-READ', con.face === raw.face && con.connects_to === raw.connects_to && con.dia_mm === raw.diameter_mm &&
    JSON.stringify(con.faceDir) === JSON.stringify([0, 0, 1]),
    'connectorFor reads the verbatim hookup: face=' + con.face + ' connects_to=' + con.connects_to + ' Ø=' + con.dia_mm + ' faceDir=TOP[0,0,1]');

  // ── live SC FP sprinkler walk (borrow FP from terminal_rules) ──
  DW.dwOpen(dx); DW.dwBorrow('FP', te);
  var fp = DW.dwWalk('FP', sc, 'SampleCastle');
  var sprinklers = fp.placements.filter(function (p) { return p.ifc_class === 'IfcFireSuppressionTerminal'; });
  var key = { IfcFireSuppressionTerminal: 'SPRINKLER' };

  // ── C1 ENRICH-WALK ──
  var before = sprinklers.length;
  var res = DW.connectorEnrich(sprinklers, { assemblyKey: key, connectors: connectors, manifest: manifest });
  log('§AC C1 sprinklers=' + before + ' enriched=' + res.enriched + ' (count after=' + sprinklers.length + ')');
  assert('C1 ENRICH-WALK', before > 0 && res.enriched === before && sprinklers.length === before,
    res.enriched + ' SC sprinklers enriched with their SPRINKLER→FP_MAIN connector (count preserved ' + before + ')');

  // ── C2 FACEDIR-UNIT ──
  var notUnit = 0, badFace = 0;
  sprinklers.forEach(function (p) {
    var d = p.connector.faceDir, L = Math.sqrt(d[0] * d[0] + d[1] * d[1] + d[2] * d[2]);
    if (Math.abs(L - 1) > 1e-9) notUnit++;
    if (p.connector.face === 'TOP' && JSON.stringify(d) !== JSON.stringify([0, 0, 1])) badFace++;
  });
  log('§AC C2 faceDir notUnit=' + notUnit + ' badFaceConvention=' + badFace);
  assert('C2 FACEDIR-UNIT', notUnit === 0 && badFace === 0,
    'every enriched faceDir is unit-length and == the face-name convention (TOP→[0,0,1])');

  // ── C3 STANDOFF-MATH ──  real sprinkler standoff (measured) + synthetic nonzero offset proof
  var mathBad = sprinklers.filter(function (p) {
    var s = p.standoff_m, d = p.connector.faceDir, pos = p.pos || [p.x, p.y, p.z];
    return Math.abs(p.posStood[0] - (pos[0] + d[0] * s)) > 1e-9 ||
           Math.abs(p.posStood[1] - (pos[1] + d[1] * s)) > 1e-9 ||
           Math.abs(p.posStood[2] - (pos[2] + d[2] * s)) > 1e-9;
  }).length;
  var realStandoff = sprinklers.length ? sprinklers[0].standoff_m : null;
  // synthetic: a part on a fake assembly with a 0.5m TOP clearance must offset +0.5 in Z
  var synthPart = [{ ifc_class: 'IfcSynth', pos: [1, 2, 3] }];
  DW.connectorEnrich(synthPart, { assemblyKey: { IfcSynth: 'SYN' },
    connectors: [{ assembly_id: 'SYN', face: 'TOP', connector_type: 'HOOKUP', diameter_mm: 10, connects_to: 'X' }],
    manifest: [{ assembly_id: 'SYN', face: 'TOP', interface_type: 'CLEARANCE', clearance_m: 0.5 }] });
  var synthOk = JSON.stringify(synthPart[0].posStood) === JSON.stringify([1, 2, 3.5]);
  log('§AC C3 standoff math: badRows=' + mathBad + ' realSprinklerStandoff=' + realStandoff + 'm (flush) ; synthetic 0.5m offset → posStood=' + JSON.stringify(synthPart[0].posStood));
  assert('C3 STANDOFF-MATH', mathBad === 0 && synthOk,
    'posStood == pos + faceDir·standoff EXACTLY (sprinkler standoff measured ' + realStandoff + 'm flush; synthetic 0.5m → +0.5 Z proven)');

  // ── C4 SERVICE-TRACEABLE ──
  var realTo = {}; connectors.forEach(function (c) { if (c.connects_to) realTo[c.connects_to] = 1; });
  var badTo = sprinklers.filter(function (p) { return p.connector.connects_to !== 'FP_MAIN' || !realTo[p.connector.connects_to] || p.connector.dia_mm !== raw.diameter_mm; }).length;
  log('§AC C4 service-traceable: every sprinkler connects_to=FP_MAIN Ø=' + raw.diameter_mm + ' bad=' + badTo);
  assert('C4 SERVICE-TRACEABLE', badTo === 0 && before > 0,
    'every enriched connects_to (FP_MAIN) + Ø(' + raw.diameter_mm + ') traces to a real ad_assembly_connector row — non-invent');

  // ── C5 NON-INVENT-UNMAPPED ──
  var mixed = sprinklers.slice(0, 3).map(function (p) { return { ifc_class: 'IfcUnmapped', pos: [0, 0, 0] }; });
  var r2 = DW.connectorEnrich(mixed, { assemblyKey: key, connectors: connectors, manifest: manifest });
  var untouched = mixed.every(function (p) { return !p.connector && !p.posStood; });
  log('§AC C5 unmapped fixtures: enriched=' + r2.enriched + ' untouched=' + untouched);
  assert('C5 NON-INVENT-UNMAPPED', r2.enriched === 0 && untouched,
    'a fixture class with no assembly mapping is LEFT UNTOUCHED (no .connector, count preserved) — no fabricated hookup');

  DW.dwBorrow('FP', null);
  dx.close(); te.close(); sc.close(); pat.close();
  log('───────────────────────────────────────────────');
  log('§AC SUMMARY: the ' + before + ' live SampleCastle FP sprinklers now carry their MEASURED SPRINKLER→FP_MAIN ' +
    'hookup (face=TOP, Ø=' + raw.diameter_mm + ', standoff=' + realStandoff + 'm flush) read verbatim from ' +
    'disc_patterns.ad_assembly_connector/manifest — orientation by connector face, stand-off by measured clearance, ' +
    'nothing fabricated. docs/WalkerDoctrine.md roadmap #3b (connector-face orient + clearance standoff).');
  log('W-ASSEMBLE-CONNECT: ' + pass + ' PASS / ' + fail + ' FAIL');
  try { fs.mkdirSync(path.dirname(LOG), { recursive: true }); fs.writeFileSync(LOG, _lines.join('\n')); log('§LOG ' + LOG); } catch (e) {}
  process.exit(fail ? 1 : 0);
})();
