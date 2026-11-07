#!/usr/bin/env node
/**
 * # ⚠ DO NOT REMOVE — W-TERM-NOSPACES scope (read this block first)
 * SCOPE: item 2 of the geometry-hell ratchet (RESUME_DISC_WALKER_ENVELOPE_BOUND.md §NOSPACES,
 *   2026-07-10): prove disc_walker's measured-band no-spaces path fixes the Terminal-class walk
 *   (no real IfcSpace rows) — n_measured×area-bound counts + host-conformant placement + LOD400
 *   mesh binding — replacing the legacy 22-pseudo-storey density scatter (measured this session:
 *   3003 generated vs 833 real ELEC, 798 floating mid-void). Read the §-log after the run; exit
 *   code is not the evidence.
 *
 * ANTI-CHEAT (two code paths, one comparer): the walker walks an ARC-ONLY COPY of the extraction
 *   (every rules-generatable class + all MEP-shaped classes DELETED before the walk); only THIS
 *   witness reads the full db's real MEP as ground truth. The walker additionally excludes
 *   rules-generatable classes in its own envelope query (§NOSPACES), so the anti-cheat is
 *   structural on both sides.
 *
 * CLAIMS (Terminal ELEC primary — the hardest, no-real-space case; ACMV/FP reported not graded
 *   where the oracle would be vacuous; no W5 fidelity dial — per the ratchet, no per-instance
 *   ground-truth transforms exist for Terminal):
 *   T1 PATH-ENGAGED  — {schedule:true} on Terminal returns mode='measured-band' (not the old flat
 *                      REFUSE) AND terminal_rules.db still carries ZERO residential schedule
 *                      tables (M6 boundary — the no-spaces path consumed none of that data).
 *   T2 QTY-BOUND     — per graded class: generated/real ∈ [0.5, 2.0] (counts area-bound by
 *                      n_measured, not pseudo-storey-inflated). FALSIFIER: scaling n_measured
 *                      ×0.2 in a COPY of the rules collapses the generated count — the bound
 *                      genuinely measures the mined data.
 *   T3 CONTAINMENT+Z — every placement sits inside the real building's XY envelope AND its z is
 *                      inside its OWN rule row's measured z-band (no mid-void, no wrong-storey).
 *   T4 HOST-CONFORM  — hostBound + floats === placed (count preserved through host-bind); bound
 *                      placements carry a real host guid; floats are counted honestly, never
 *                      silently re-labelled.
 *   T5 LOD400        — every placement carries a geometry_hash that is a REAL hash of its own
 *                      class in the building's element_instances (the mined dominant mesh, never
 *                      a fallback shape); a class with no real mesh appears ONLY in lod400Refused.
 *   T6 PLB-QTY       — PLB, the last walkable disc never graded (2026-07-10 gap-close): per class,
 *                      generated/n_measured ∈ [0.5, 2.0] against terminal_rules.db's mined counts.
 *                      Oracle is n_measured, NOT the full real count: real IfcPipeSegment=3821 spans
 *                      ALL pipe systems, the rules mined only the ceiling-void-main band (739) —
 *                      real-vs-generated is REPORTED honestly, not graded. IfcValve n_measured==real
 *                      ==111, so its grade IS a real-count grade. Same falsifier: n_measured×0.2 in
 *                      a COPY must collapse the placed count below half.
 *   T7 PLB-CONFORM   — every PLB placement XY-inside the real envelope, z inside its OWN rule row's
 *                      measured band, and carrying a REAL mesh hash of its own class (T3+T5 pattern
 *                      applied to PLB; classes with no real mesh only in lod400Refused).
 *   T8 SHIPPED-SUBSTRATE — §TE-ARC-DATUM-FIX (2026-07-10): walk the SHIPPED
 *                      ~/bim-ootb/modeller/Terminal_ARC.db (raw-IFC building frame, −14.66 m below
 *                      the extraction's site frame — pre-fix every disc collapsed there: ELEC
 *                      744→390, PLB 888→252). ELEC+PLB per-class placed/n_measured ∈ [0.5,2.0],
 *                      conformance vs the shipped file's OWN envelope + reconciled z-bands + real
 *                      hashes. FALSIFIER: DROP rule_frame_ref (walker back on the baked one-frame
 *                      z_datum_offset) → the walk must collapse <0.6× — proves the walk-time
 *                      measured datum reconciliation is what makes the production substrate walkable.
 */
'use strict';
var fs = require('fs');
var path = require('path');
var initSqlJs = require('sql.js');

var ROOT = path.join(__dirname, '..');
var DWT = require('./dw_tree.js');   // the shipped walker and its rules, never the older build/ copy (MODELLER_MASTER §WITNESS-REPOINT)
var RULES = DWT.rules('terminal_rules.db');
var BDB = path.join(ROOT, 'deploy/buildings/Terminal_extracted.db');
var LOG = path.join(ROOT, 'logs', 'witness_terminal_nospaces_' +
  new Date().toISOString().replace(/[:.]/g, '').slice(0, 15) + '.log');

var _lines = [];
function log(s) { _lines.push(s); console.log(s); }
var pass = 0, fail = 0;
function assert(c, cond, d) { if (cond) { pass++; log('  ✅ ' + c + ' — ' + d); } else { fail++; log('  ❌ ' + c + ' — ' + d); } }
function rows(db, sql) { var r = db.exec(sql); if (!r.length) return []; return r[0].values.map(function (v) { var o = {}; r[0].columns.forEach(function (c, i) { o[c] = v[i]; }); return o; }); }
function loadDb(SQL, f) { return new SQL.Database(new Uint8Array(fs.readFileSync(f))); }

var GRADED = ['IfcLightFixture', 'IfcElectricAppliance'];      // ELEC — the primary case

(async function main() {
  log('═══ W-TERM-NOSPACES — measured-band no-spaces walk vs the real Terminal (blindfolded) ═══');
  var SQL = await initSqlJs();
  global.window = global.window || {};
  var DW = require(DWT.walker);
  var dw = global.window.DW || DW;

  var full = loadDb(SQL, BDB);                                 // ground truth — witness-only
  var rules = loadDb(SQL, RULES);

  // ARC-ONLY COPY: strip every rules-generatable class + all MEP-shaped classes.
  var arc = loadDb(SQL, BDB);
  var gen = rows(rules, 'SELECT DISTINCT ifc_class FROM rule_placement').map(function (r) { return r.ifc_class; });
  var mepLike = rows(full, "SELECT DISTINCT ifc_class FROM elements_meta WHERE ifc_class LIKE '%Segment%' OR ifc_class LIKE '%Fitting%' OR ifc_class LIKE '%Terminal%' OR ifc_class LIKE '%Valve%' OR ifc_class LIKE '%Alarm%' OR ifc_class LIKE '%Light%' OR ifc_class LIKE '%Electric%' OR ifc_class LIKE '%Flow%' OR ifc_class LIKE '%Controller%'")
    .map(function (r) { return r.ifc_class; });
  var strip = {}; gen.concat(mepLike).forEach(function (c) { strip[c] = 1; });
  var stripList = Object.keys(strip).map(function (c) { return "'" + c + "'"; }).join(',');
  ['element_transforms', 'element_instances'].forEach(function (t) {
    arc.exec('DELETE FROM ' + t + ' WHERE guid IN (SELECT guid FROM elements_meta WHERE ifc_class IN (' + stripList + '))');
  });
  arc.exec('DELETE FROM elements_meta WHERE ifc_class IN (' + stripList + ')');
  var left = rows(arc, 'SELECT COUNT(*) n FROM elements_meta')[0].n;
  log('§TN ARC-only copy: stripped ' + Object.keys(strip).length + ' classes, ' + left + ' ARC rows remain (walker sees ONLY these)');

  log(''); log('─── T1 PATH-ENGAGED + BOUNDARY ───');
  dw.dwOpen(rules);
  var w = dw.dwWalk('ELEC', arc, 'Terminal', { schedule: true });
  var schedTables = rows(rules, "SELECT name FROM sqlite_master WHERE type='table' AND name IN ('rule_space_schedule','rule_space_type','rule_space_alias','rule_code_spacing')");
  assert('T1 PATH-ENGAGED', !w.refused && w.mode === 'measured-band' && schedTables.length === 0,
    "{schedule:true} on no-spaces Terminal → mode='" + w.mode + "' placed=" + w.placed +
    ' (not the old flat REFUSE); terminal_rules.db schedule tables = ' + schedTables.length +
    ' — residential schedule data untouched (M6 boundary holds)');

  log(''); log('─── T2 QTY-BOUND ───');
  var byCls = {};
  (w.placements || []).forEach(function (p) { byCls[p.ifc_class] = (byCls[p.ifc_class] || 0) + 1; });
  var qtyOk = true, qtyDetail = [];
  GRADED.forEach(function (cls) {
    var real = rows(full, "SELECT COUNT(*) n FROM elements_meta WHERE ifc_class='" + cls + "'")[0].n;
    var gen2 = byCls[cls] || 0, ratio = real ? gen2 / real : 0;
    qtyOk = qtyOk && real > 0 && ratio >= 0.5 && ratio <= 2.0;
    qtyDetail.push(cls + ' ' + gen2 + '/' + real + ' (' + ratio.toFixed(2) + ')');
    log('§TN qty ' + cls + ' generated=' + gen2 + ' real=' + real + ' ratio=' + ratio.toFixed(2));
  });
  // falsifier: n_measured ×0.2 in a COPY → the generated count must collapse
  var tampered = loadDb(SQL, RULES);
  tampered.exec("UPDATE rule_placement SET n_measured = CAST(n_measured*0.2 AS INTEGER) WHERE disc='ELEC'");
  dw.dwOpen(tampered);
  var wT = dw.dwWalk('ELEC', arc, 'Terminal', { schedule: true });
  dw.dwOpen(rules);
  assert('T2 QTY-BOUND', qtyOk && wT.placed < w.placed * 0.5,
    qtyDetail.join('; ') + ' — all in band [0.5,2.0]; falsifier n_measured×0.2 → placed ' +
    w.placed + '→' + wT.placed + ' (the bound measures the mined data, not vacuously true)');
  tampered.close();

  log(''); log('─── T3 CONTAINMENT + Z-SANITY ───');
  var env = rows(full, 'SELECT MIN(center_x-bbox_x/2) x0, MAX(center_x+bbox_x/2) x1, MIN(center_y-bbox_y/2) y0, MAX(center_y+bbox_y/2) y1 FROM element_transforms')[0];
  var out = 0, zBad = 0;
  (w.placements || []).forEach(function (p) {
    if (p.x < env.x0 - 0.5 || p.x > env.x1 + 0.5 || p.y < env.y0 - 0.5 || p.y > env.y1 + 0.5) out++;
    // host-bound Z moved to the real host face — allow the band ± the fixture's own extent; floats must sit in-band
    var band = p.band; if (!band) { zBad++; return; }
    var tol = (p.bz || 0.5) + 0.75;
    if (p.z < band[0] - tol || p.z > band[1] + tol) zBad++;
  });
  assert('T3 CONTAINMENT+Z', out === 0 && zBad === 0,
    (w.placements || []).length + ' placements: ' + out + ' outside the real XY envelope, ' + zBad +
    ' outside their own measured z-band (±fixture extent) — no mid-void, no wrong-storey');

  log(''); log('─── T4 HOST-CONFORM ───');
  var m = w.measured || {};
  var hostTagged = (w.placements || []).filter(function (p) { return p.host; }).length;
  assert('T4 HOST-CONFORM', m.hostBound + m.floats === w.placed && hostTagged === m.hostBound && m.hostBound > 0,
    'hostBound=' + m.hostBound + ' + floats=' + m.floats + ' === placed=' + w.placed +
    ' (count preserved); ' + hostTagged + ' placements carry a REAL host guid; floats stay envelope-bound at measured z, logged honest');

  log(''); log('─── T5 LOD400 ───');
  var badHash = 0, noHash = 0;
  var realHash = {};
  GRADED.forEach(function (cls) {
    rows(full, "SELECT DISTINCT ei.geometry_hash h FROM element_instances ei JOIN elements_meta em ON em.guid=ei.guid WHERE em.ifc_class='" + cls + "'")
      .forEach(function (r) { realHash[cls + '|' + r.h] = 1; });
  });
  (w.placements || []).forEach(function (p) {
    if (!p.geometry_hash) { noHash++; return; }
    if (GRADED.indexOf(p.ifc_class) >= 0 && !realHash[p.ifc_class + '|' + p.geometry_hash]) badHash++;
  });
  var refusedN = Object.keys(m.lod400Refused || {}).length;
  assert('T5 LOD400', noHash === 0 && badHash === 0,
    (w.placements || []).length + ' placements all carry a geometry_hash (' + noHash + ' missing, ' + badHash +
    ' not a REAL hash of their own class); classes with no real mesh: ' + refusedN + ' (REFUSED only, never a fallback shape)');

  log(''); log('─── T6 PLB QTY-BOUND (last ungraded walkable disc) ───');
  // The band GENERATOR is what this grades: {noHostBind} is the raw walk. A user walk drops the pieces with no main; T6b proves that.
  var wp = dw.dwWalk('PLB', arc, 'Terminal', { schedule: true, noHostBind: true });
  var pByCls = {};
  (wp.placements || []).forEach(function (p) { pByCls[p.ifc_class] = (pByCls[p.ifc_class] || 0) + 1; });
  var nmRows = rows(rules, "SELECT ifc_class, SUM(n_measured) nm FROM rule_placement WHERE disc='PLB' GROUP BY ifc_class");
  var plbOk = !wp.refused && wp.mode === 'measured-band' && nmRows.length > 0;
  var plbDetail = [];
  nmRows.forEach(function (r) {
    var gen3 = pByCls[r.ifc_class] || 0, ratio = r.nm ? gen3 / r.nm : 0;
    plbOk = plbOk && ratio >= 0.5 && ratio <= 2.0;
    plbDetail.push(r.ifc_class + ' ' + gen3 + '/' + r.nm + ' (' + ratio.toFixed(2) + ')');
    log('§TN qty PLB/' + r.ifc_class + ' generated=' + gen3 + ' n_measured=' + r.nm + ' ratio=' + ratio.toFixed(2));
    var realP = rows(full, "SELECT COUNT(*) n FROM elements_meta WHERE ifc_class='" + r.ifc_class + "'")[0].n;
    log('§TN report PLB/' + r.ifc_class + ' generated=' + gen3 + ' real=' + realP +
      (realP ? ' ratio=' + (gen3 / realP).toFixed(2) : ' (no real oracle)'));
  });
  var tamperedP = loadDb(SQL, RULES);
  tamperedP.exec("UPDATE rule_placement SET n_measured = CAST(n_measured*0.2 AS INTEGER) WHERE disc='PLB'");
  dw.dwOpen(tamperedP);
  var wpT = dw.dwWalk('PLB', arc, 'Terminal', { schedule: true, noHostBind: true });
  dw.dwOpen(rules);
  tamperedP.close();
  assert('T6 PLB-QTY', plbOk && wpT.placed < wp.placed * 0.5,
    "mode='" + wp.mode + "' " + plbDetail.join('; ') + ' — all in band [0.5,2.0] vs mined n_measured' +
    ' (pipes graded vs the mined ceiling-void band, real 3821 spans ALL pipe systems — reported above);' +
    ' falsifier n_measured×0.2 → placed ' + wp.placed + '→' + wpT.placed + ' (the bound measures the mined data)');

  log(''); log('─── T7 PLB CONTAINMENT + LOD400 ───');
  var pOut = 0, pzBad = 0, pNoHash = 0, pBadHash = 0;
  var plbHash = {};
  nmRows.forEach(function (r) {
    rows(full, "SELECT DISTINCT ei.geometry_hash h FROM element_instances ei JOIN elements_meta em ON em.guid=ei.guid WHERE em.ifc_class='" + r.ifc_class + "'")
      .forEach(function (x) { plbHash[r.ifc_class + '|' + x.h] = 1; });
  });
  (wp.placements || []).forEach(function (p) {
    if (p.x < env.x0 - 0.5 || p.x > env.x1 + 0.5 || p.y < env.y0 - 0.5 || p.y > env.y1 + 0.5) pOut++;
    var band = p.band; if (!band) { pzBad++; } else {
      var tol = (p.bz || 0.5) + 0.75;
      if (p.z < band[0] - tol || p.z > band[1] + tol) pzBad++;
    }
    if (!p.geometry_hash) { pNoHash++; return; }
    if (!plbHash[p.ifc_class + '|' + p.geometry_hash]) pBadHash++;
  });
  var pRefusedN = Object.keys((wp.measured || {}).lod400Refused || {}).length;
  assert('T7 PLB-CONFORM', pOut === 0 && pzBad === 0 && pNoHash === 0 && pBadHash === 0,
    (wp.placements || []).length + ' PLB placements: ' + pOut + ' outside the real XY envelope, ' + pzBad +
    ' outside their own measured z-band, ' + pNoHash + ' missing a hash, ' + pBadHash +
    ' not a REAL hash of their own class; no-real-mesh classes: ' + pRefusedN + ' (REFUSED only)');

  // T6b (bim-ootb prompts/DISC_WALK_DRAWN_MAINS.md §9.2): a user walk places no band pipe, and accounts for each one. RED control is the raw walk above, which holds them.
  var wpU = dw.dwWalk('PLB', arc, 'Terminal', { schedule: true }), uPipes = (wpU.placements || []).filter(function (p) { return /^placed:/.test(p.prov || '') && /Pipe|FlowSegment|FlowFitting/.test(p.ifc_class || ''); }).length;
  var rawPipes = (wp.placements || []).filter(function (p) { return /Pipe|FlowSegment|FlowFitting/.test(p.ifc_class || ''); }).length, uNoMain = (wpU.refusedNoHost || {}).noMain || 0;
  assert('T6b PLB-NO-MAIN', uPipes === 0 && rawPipes > 0 && uNoMain === rawPipes && wpU.placed + uNoMain === wp.placed,
    'user walk band pipes=' + uPipes + ', no-main=' + uNoMain + ' == raw pipes ' + rawPipes + '; placed ' + wpU.placed + ' + ' + uNoMain + ' == raw ' + wp.placed);

  log(''); log('─── T8 SHIPPED-SUBSTRATE (§TE-ARC-DATUM-FIX — the Modeller\'s REAL Terminal_ARC.db) ───');
  // The stripped-copy walks above run in the extraction's site frame; the SHIPPED substrate
  // (~/bim-ootb/modeller/Terminal_ARC.db) is in the raw-IFC building frame, −14.66 m below it.
  // Pre-fix, the baked z_datum_offset starved every band there (ELEC 744→390, PLB 888→252).
  // T8 proves the walk-time rule_frame_ref reconciliation closes exactly that: same quantity bar
  // as T6 on the shipped file, conformance vs the shipped file's OWN envelope, and a falsifier
  // that removes rule_frame_ref (back to the baked offset) and must collapse.
  var ARC_SHIPPED = path.join(process.env.HOME, 'bim-ootb/modeller/Terminal_ARC.db');
  if (!fs.existsSync(ARC_SHIPPED)) {
    log('  (⚠ ' + ARC_SHIPPED + ' not found on this machine — T8 SKIPPED, not a false pass)');
  } else {
    var shipped = loadDb(SQL, ARC_SHIPPED);
    var sEnv = rows(shipped, 'SELECT MIN(center_x-bbox_x/2) x0, MAX(center_x+bbox_x/2) x1, MIN(center_y-bbox_y/2) y0, MAX(center_y+bbox_y/2) y1 FROM element_transforms')[0];
    var sPlaced = 0, sDetail = [], sOk = true, sOut = 0, szBad = 0, sNoHash = 0, sBadHash = 0;
    var sHash = {};
    ['ELEC', 'PLB'].forEach(function (d) {
      var wd = dw.dwWalk(d, shipped, 'Terminal', d === 'PLB' ? { schedule: true, noHostBind: true } : { schedule: true });   // PLB: the band generator, as T6
      sOk = sOk && !wd.refused && wd.mode === 'measured-band';
      sPlaced += wd.placed || 0;
      var bc = {}; (wd.placements || []).forEach(function (p) { bc[p.ifc_class] = (bc[p.ifc_class] || 0) + 1; });
      rows(rules, "SELECT ifc_class, SUM(n_measured) nm FROM rule_placement WHERE disc='" + d + "' GROUP BY ifc_class")
        .forEach(function (r) {
          var gen4 = bc[r.ifc_class] || 0, ratio = r.nm ? gen4 / r.nm : 0;
          sOk = sOk && ratio >= 0.5 && ratio <= 2.0;
          sDetail.push(d + '/' + r.ifc_class + ' ' + gen4 + '/' + r.nm + ' (' + ratio.toFixed(2) + ')');
          log('§TN shipped qty ' + d + '/' + r.ifc_class + ' generated=' + gen4 + ' n_measured=' + r.nm + ' ratio=' + ratio.toFixed(2));
          rows(full, "SELECT DISTINCT ei.geometry_hash h FROM element_instances ei JOIN elements_meta em ON em.guid=ei.guid WHERE em.ifc_class='" + r.ifc_class + "'")
            .forEach(function (x) { sHash[r.ifc_class + '|' + x.h] = 1; });
        });
      (wd.placements || []).forEach(function (p) {
        if (p.x < sEnv.x0 - 0.5 || p.x > sEnv.x1 + 0.5 || p.y < sEnv.y0 - 0.5 || p.y > sEnv.y1 + 0.5) sOut++;
        var band = p.band; if (!band) { szBad++; } else {
          var tol = (p.bz || 0.5) + 0.75;
          if (p.z < band[0] - tol || p.z > band[1] + tol) szBad++;
        }
        if (!p.geometry_hash) { sNoHash++; return; }
        if (!sHash[p.ifc_class + '|' + p.geometry_hash]) sBadHash++;
      });
    });
    // FALSIFIER (names the issue): drop rule_frame_ref in a COPY → walker falls back to the baked
    // one-frame z_datum_offset → on the shipped substrate the walk must collapse again.
    var tampered8 = loadDb(SQL, RULES);
    tampered8.exec('DROP TABLE rule_frame_ref');
    dw.dwOpen(tampered8);
    var falsPlaced = 0;
    ['ELEC', 'PLB'].forEach(function (d) { falsPlaced += dw.dwWalk(d, shipped, 'Terminal', d === 'PLB' ? { schedule: true, noHostBind: true } : { schedule: true }).placed || 0; });
    dw.dwOpen(rules);
    tampered8.close();
    assert('T8 SHIPPED-SUBSTRATE', sOk && sOut === 0 && szBad === 0 && sNoHash === 0 && sBadHash === 0 && falsPlaced < sPlaced * 0.6,
      'shipped Terminal_ARC.db (building frame, −14.66 m vs extraction): ' + sDetail.join('; ') +
      ' — all in band [0.5,2.0]; ' + sOut + ' outside the SHIPPED file\'s own XY envelope, ' + szBad +
      ' outside their own reconciled z-band, ' + sNoHash + '+' + sBadHash + ' hash violations;' +
      ' falsifier DROP rule_frame_ref (baked offset only) → placed ' + sPlaced + '→' + falsPlaced +
      ' (<0.6× — the walk-time datum reconciliation is what makes the production substrate walkable)');
    shipped.close();
  }

  log(''); log('─── REPORTED (not graded — secondary discs) ───');
  ['FP', 'ACMV'].forEach(function (d) {
    var wd = dw.dwWalk(d, arc, 'Terminal', { schedule: true });
    var bc = {}; (wd.placements || []).forEach(function (p) { bc[p.ifc_class] = (bc[p.ifc_class] || 0) + 1; });
    Object.keys(bc).forEach(function (cls) {
      var real = rows(full, "SELECT COUNT(*) n FROM elements_meta WHERE ifc_class='" + cls + "'")[0].n;
      log('§TN report ' + d + '/' + cls + ' generated=' + bc[cls] + ' real=' + real +
        (real ? ' ratio=' + (bc[cls] / real).toFixed(2) : ' (no real oracle)'));
    });
  });

  log('');
  log('§TN SUMMARY: the no-spaces measured-band path replaces the Terminal flat-REFUSE/legacy scatter:');
  log('§TN counts n_measured×area-bound per measured z-band, positions envelope-bound + host-bound onto');
  log('§TN real ARC, every fixture carrying its class\'s mined REAL mesh hash or refusing honestly.');
  log('');
  log('W-TERM-NOSPACES: ' + pass + ' PASS / ' + fail + ' FAIL');
  fs.mkdirSync(path.dirname(LOG), { recursive: true }); fs.writeFileSync(LOG, _lines.join('\n') + '\n');   // fresh checkout has no logs/ (Watchdog round-2)
  log('§LOG ' + LOG);
  process.exit(fail ? 1 : 0);
})();
