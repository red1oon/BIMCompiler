#!/usr/bin/env node
/**
 * # ⚠ DO NOT REMOVE — W-RULE-CONNECTOR scope (read this block first)
 * SCOPE: §3c prereq — make the FIXTURE→SERVICE connector hookup a FIRST-CLASS PROJECTED rule so the modeller
 *   (which carries only *_rules.db, never disc_patterns.db) can render connector edges with NO caller percept.
 *   build/project_rule_connector.py projects disc_patterns.ad_assembly_connector(+manifest) → a `rule_connector`
 *   table per *_rules.db, keyed (disc, ifc_class), DECISIVE-only (exactly one assembly w/ a SERVICE connector),
 *   face/Ø/connects_to read VERBATIM, standoff = manifest clearance. disc_walker.connectorEnrich() reads it via
 *   _loadConnectors when no opts.connectors are passed — the projected path must equal the caller-passed path.
 *   NON-INVENT: no mapping → no row → fixture left untouched. Read the §-log; exit code is not the evidence.
 *
 * CLAIMS:
 *   RC0 PROJECTED        — terminal_rules.rule_connector carries FP/IfcFireSuppressionTerminal→SPRINKLER AND
 *                          ELEC/IfcLightFixture→LIGHT (each provenance projected:ad_assembly_connector%);
 *                          duplex_rules has 0 rows (generic IfcFlow* have no assembly mapping — honest, not a gap).
 *   RC1 TRACEABLE        — every projected row's face/connector_type/Ø/connects_to == the verbatim
 *                          ad_assembly_connector SERVICE row for that assembly (no fabrication).
 *   RC2 SELF-CONTAINED   — connectorEnrich(live SC FP sprinklers) with NO opts (projected path) gives the SAME
 *                          enriched connector (face/dia/connects_to/standoff/posStood) as the caller-passed path.
 *   RC3 NON-INVENT-SKIP  — a disc/class with no projected row (duplex ELEC flow) → 0 enriched, untouched, count kept.
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
var LOG = path.join(ROOT, 'logs', 'witness_rule_connector_' +
  new Date().toISOString().replace(/[:.]/g, '').slice(0, 15) + '.log');

var _lines = [];
function log(s) { _lines.push(s); console.log(s); }
var pass = 0, fail = 0;
function assert(c, cond, d) { if (cond) { pass++; log('  ✅ ' + c + ' — ' + d); } else { fail++; log('  ❌ ' + c + ' — ' + d); } }
function rows(db, sql) { var r = db.exec(sql); if (!r.length) return []; return r[0].values.map(function (v) { var o = {}; r[0].columns.forEach(function (c, i) { o[c] = v[i]; }); return o; }); }
function loadDb(SQL, f) { return new SQL.Database(new Uint8Array(fs.readFileSync(f))); }

(async function main() {
  log('═══ W-RULE-CONNECTOR — first-class projected rule_connector (modeller reads it with no caller percept) ═══');
  var SQL = await initSqlJs();
  var dx = loadDb(SQL, DX_RULES), te = loadDb(SQL, TE_RULES), sc = loadDb(SQL, SC), pat = loadDb(SQL, PATTERNS);

  // ── RC0 PROJECTED ──
  var teConn = rows(te, "SELECT disc, ifc_class, assembly_id, face, connector_type, diameter_mm, connects_to, standoff_m, provenance FROM rule_connector ORDER BY disc, ifc_class");
  var dxConn = rows(dx, "SELECT disc, ifc_class FROM rule_connector");
  var spr = teConn.filter(function (r) { return r.disc === 'FP' && r.ifc_class === 'IfcFireSuppressionTerminal' && r.assembly_id === 'SPRINKLER'; })[0];
  var lit = teConn.filter(function (r) { return r.disc === 'ELEC' && r.ifc_class === 'IfcLightFixture' && r.assembly_id === 'LIGHT'; })[0];
  var allProv = teConn.every(function (r) { return /^projected:ad_assembly_connector/.test(r.provenance); });
  log('§RC0 terminal_rules.rule_connector=' + teConn.length + ' [' + teConn.map(function (r) { return r.disc + '/' + r.ifc_class.replace('Ifc', '') + '→' + r.assembly_id + '(' + r.face + ',Ø' + r.diameter_mm + ',' + r.connects_to + ')'; }).join(' ') + '] ; duplex_rules.rule_connector=' + dxConn.length);
  assert('RC0 PROJECTED', spr && lit && allProv && dxConn.length === 0,
    'SPRINKLER + LIGHT projected in terminal (provenance projected:ad_assembly_connector%); duplex 0 (honest)');

  // ── RC1 TRACEABLE ── each projected row == the verbatim SERVICE connector row.
  var badTrace = 0;
  teConn.forEach(function (r) {
    var raw = rows(pat, "SELECT face, connector_type, diameter_mm, connects_to FROM ad_assembly_connector WHERE assembly_id='" + r.assembly_id + "' AND connects_to IS NOT NULL AND connects_to<>''");
    var match = raw.filter(function (x) { return x.face === r.face && x.connector_type === r.connector_type && x.diameter_mm === r.diameter_mm && x.connects_to === r.connects_to; });
    if (!match.length) { badTrace++; log('   ⚠ no verbatim source for ' + JSON.stringify(r)); }
  });
  log('§RC1 traceable: ' + teConn.length + ' rows, non-traceable=' + badTrace);
  assert('RC1 TRACEABLE', teConn.length > 0 && badTrace === 0,
    'every projected connector row reads verbatim from a real ad_assembly_connector SERVICE row — no fabrication');

  // ── live SC FP sprinkler walk (borrow FP from terminal_rules), enriched TWO ways ──
  DW.dwOpen(dx); DW.dwBorrow('FP', te);
  function freshSprinklers() {
    var fp = DW.dwWalk('FP', sc, 'SampleCastle');
    return fp.placements.filter(function (p) { return p.ifc_class === 'IfcFireSuppressionTerminal'; });
  }
  var sCaller = freshSprinklers(), sProj = freshSprinklers();
  // caller-passed path (the W-ASSEMBLE-CONNECT inputs)
  var connectors = rows(pat, "SELECT assembly_id, face, connector_type, diameter_mm, connects_to FROM ad_assembly_connector");
  var manifest = rows(pat, "SELECT assembly_id, face, interface_type, clearance_m FROM ad_assembly_manifest");
  var rCaller = DW.connectorEnrich(sCaller, { assemblyKey: { IfcFireSuppressionTerminal: 'SPRINKLER' }, connectors: connectors, manifest: manifest });
  var rProj = DW.connectorEnrich(sProj);   // PROJECTED — no opts

  // ── RC2 SELF-CONTAINED == CALLER ──
  var same = sCaller.length === sProj.length && sCaller.length > 0;
  var fieldMismatch = 0;
  for (var i = 0; same && i < sCaller.length; i++) {
    var a = sCaller[i].connector, b = sProj[i].connector;
    if (!a || !b) { fieldMismatch++; continue; }
    if (a.face !== b.face || a.dia_mm !== b.dia_mm || a.connects_to !== b.connects_to ||
        JSON.stringify(a.faceDir) !== JSON.stringify(b.faceDir) ||
        sCaller[i].standoff_m !== sProj[i].standoff_m ||
        JSON.stringify(sCaller[i].posStood) !== JSON.stringify(sProj[i].posStood)) fieldMismatch++;
  }
  log('§RC2 caller-enriched=' + rCaller.enriched + ' projected-enriched=' + rProj.enriched + ' fieldMismatch=' + fieldMismatch +
    ' (sample proj connector ' + JSON.stringify(sProj[0] && sProj[0].connector) + ')');
  assert('RC2 SELF-CONTAINED', same && rCaller.enriched === rProj.enriched && rProj.enriched > 0 && fieldMismatch === 0,
    rProj.enriched + ' sprinklers enriched identically by the PROJECTED path (no caller percept) and the caller-passed path');

  // ── RC3 NON-INVENT-SKIP ── a class with no projected connector (duplex ELEC flow) → untouched.
  var elec = DW.dwWalk('ELEC', sc, 'SampleCastle');
  var ep = (elec.placements || []).slice();
  var beforeN = ep.length;
  var r3 = DW.connectorEnrich(ep);   // projected path, ELEC has 0 rows in duplex_rules
  var untouched = ep.every(function (p) { return !p.connector && !p.posStood; });
  log('§RC3 duplex ELEC placements=' + beforeN + ' enriched=' + r3.enriched + ' untouched=' + untouched);
  assert('RC3 NON-INVENT-SKIP', beforeN > 0 && r3.enriched === 0 && untouched && ep.length === beforeN,
    'duplex ELEC (no projected connector) → 0 enriched, every placement untouched, count preserved — no fabrication');

  DW.dwBorrow('FP', null);
  dx.close(); te.close(); sc.close(); pat.close();
  log('───────────────────────────────────────────────');
  log('§RC SUMMARY: rule_connector is now first-class (' + teConn.length + ' terminal rows, 0 duplex) — the live SC FP ' +
    'sprinkler walk gets its SPRINKLER→FP_MAIN hookup from the PROJECTION alone (no disc_patterns.db, no caller percept), ' +
    'identical to the caller-passed path. The modeller can render connector edges from the deployed *_rules.db. §3c prereq.');
  log('W-RULE-CONNECTOR: ' + pass + ' PASS / ' + fail + ' FAIL');
  try { fs.mkdirSync(path.dirname(LOG), { recursive: true }); fs.writeFileSync(LOG, _lines.join('\n')); log('§LOG ' + LOG); } catch (e) {}
  process.exit(fail ? 1 : 0);
})();
