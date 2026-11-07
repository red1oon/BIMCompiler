#!/usr/bin/env node
/**
 * # ⚠ DO NOT REMOVE — W-BORROW-FP scope (read this block first)
 * SCOPE: per-discipline BORROW (docs/WalkerDoctrine.md §2). A residential building walks its native disciplines
 *   (ELEC/ACMV/PLB) from `duplex_rules.db`, but FP/sprinkler is ABSENT from the residential set — so it is BORROWED
 *   from `terminal_rules.db` WITHOUT switching the building's class. The walk axis stays BUILDING-CLASS; borrow is a
 *   PER-DISCIPLINE source map (`dwBorrow('FP', terminalDb)`): per-discipline reads (placement/space_bom/routing/shim)
 *   route to the borrowed DB, while cross-disc tables (rule_avoidance/place_order, the gate) stay on the PRIMARY
 *   residential DB. NON-INVENT: FP reuses Terminal's MEASURED rows (count/size/host) — nothing fabricated; sprinklers
 *   host-bind to real ceilings or honestly refuse. Read the §-log after the run; exit code is not the evidence.
 *
 * BUILDING = SampleCastle (residential class → duplex_rules primary; 7 storeys, 1262 IfcCovering ceilings to host on).
 *
 * CLAIMS:
 *   B0 FP-ABSENT-RESIDENTIAL — with duplex_rules as the only source, dwWalk('FP', SC) REFUSES (no measured FP rule):
 *                              residential genuinely lacks FP. (proves the borrow is needed, not redundant)
 *   B1 BORROW-WALKS         — after dwBorrow('FP', terminalDb), dwWalk('FP', SC) places > 0: FP is now walkable on a
 *                              residential building, and 'FP' appears in disciplines() roster.
 *   B2 SOURCE-ISOLATION     — borrowed FP classes are Terminal's (IfcFireSuppressionTerminal/IfcAlarm — NOT in
 *                              duplex_rules), while ELEC still resolves from duplex_rules (generic IfcFlow*). Borrow is
 *                              per-discipline, NOT a global switch to Terminal.
 *   B3 HOST-BOUND-SPRINKLER — FP sprinklers host-bind to IfcCovering (BOTTOM) by default, on REAL ceiling guids, prim
 *                              tag='sprinkler' (the LOD400 render seam), count preserved.
 *   B4 NON-INVENT-SIZE+COUNT— every FP fixture carries Terminal's MEASURED bbox (traceable to the borrow source); the
 *                              count == Σ round(terminal_density × storey_area) ∩ ARC envelope (bounded, not an area
 *                              explosion), re-derived independently here.
 *   B5 GATE-STAYS-PRIMARY   — clearance()/order() (cross-disc) still read the PRIMARY duplex_rules (4 avoidance rows),
 *                              NOT Terminal's (10): borrow does not leak the LOD400 clearance standard.
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
var LOG = path.join(ROOT, 'logs', 'witness_borrow_fp_' +
  new Date().toISOString().replace(/[:.]/g, '').slice(0, 15) + '.log');

var _lines = [];
function log(s) { _lines.push(s); console.log(s); }
var pass = 0, fail = 0;
function assert(c, cond, d) { if (cond) { pass++; log('  ✅ ' + c + ' — ' + d); } else { fail++; log('  ❌ ' + c + ' — ' + d); } }
function rows(db, sql) { var r = db.exec(sql); if (!r.length) return []; return r[0].values.map(function (v) { var o = {}; r[0].columns.forEach(function (c, i) { o[c] = v[i]; }); return o; }); }
function loadDb(SQL, f) { return new SQL.Database(new Uint8Array(fs.readFileSync(f))); }

(async function main() {
  log('═══ W-BORROW-FP — residential walk borrows FP/sprinkler from terminal_rules (per-discipline source map) ═══');
  var SQL = await initSqlJs();
  var dx = loadDb(SQL, DX_RULES), te = loadDb(SQL, TE_RULES), sc = loadDb(SQL, SC);

  // ── B0 FP-ABSENT-RESIDENTIAL ──
  DW.dwOpen(dx);                                               // primary = residential duplex_rules
  var fpNoBorrow = DW.dwWalk('FP', sc, 'SampleCastle');
  log('§BF B0 dwWalk FP (duplex only): refused=' + fpNoBorrow.refused + ' reason=' + (fpNoBorrow.reason || '-'));
  assert('B0 FP-ABSENT-RESIDENTIAL', fpNoBorrow.refused === true && /no measured rule/.test(fpNoBorrow.reason || ''),
    'residential duplex_rules has no FP → dwWalk FP REFUSES (' + (fpNoBorrow.reason || '') + ') — borrow is genuinely needed');

  // ── B1 BORROW-WALKS ──
  DW.dwBorrow('FP', te);                                       // borrow FP from terminal_rules
  var fp = DW.dwWalk('FP', sc, 'SampleCastle');
  var roster = DW.disciplines();
  log('§BF B1 dwWalk FP (FP borrowed from terminal): placed=' + fp.placed + ' refused=' + fp.refused + ' roster=' + JSON.stringify(roster));
  assert('B1 BORROW-WALKS', !fp.refused && fp.placed > 0 && roster.indexOf('FP') >= 0,
    'FP now walks on residential SC: placed=' + fp.placed + ', FP in roster — borrowed without switching class');

  // ── B2 SOURCE-ISOLATION: FP classes are Terminal's; ELEC still resolves from duplex ──
  var fpClasses = Array.from(new Set(fp.placements.map(function (p) { return p.ifc_class; }))).sort();
  var dxFpClasses = rows(dx, "SELECT DISTINCT ifc_class FROM rule_placement WHERE disc='FP'").map(function (r) { return r.ifc_class; });
  var el = DW.dwWalk('ELEC', sc, 'SampleCastle');
  var elClasses = Array.from(new Set(el.placements.map(function (p) { return p.ifc_class; }))).sort();
  var dxElClasses = rows(dx, "SELECT DISTINCT ifc_class FROM rule_placement WHERE disc='ELEC'").map(function (r) { return r.ifc_class; });
  var fpFromTerminal = fpClasses.every(function (c) { return /FireSuppressionTerminal|Alarm/.test(c); }) && dxFpClasses.length === 0;
  var elFromDuplex = elClasses.length > 0 && elClasses.every(function (c) { return dxElClasses.indexOf(c) >= 0; });
  log('§BF B2 FP classes=' + JSON.stringify(fpClasses) + ' (duplex FP classes=' + JSON.stringify(dxFpClasses) + '); ELEC classes=' +
    JSON.stringify(elClasses) + ' (∈ duplex ELEC=' + JSON.stringify(dxElClasses) + ')');
  assert('B2 SOURCE-ISOLATION', fpFromTerminal && elFromDuplex,
    'FP classes come from Terminal (' + fpClasses.join(',') + '; duplex has none) while ELEC stays on duplex (' + elClasses.join(',') + ') — per-discipline borrow');

  // ── B3 HOST-BOUND-SPRINKLER ──
  var covGuids = {}; rows(sc, "SELECT guid g FROM elements_meta WHERE ifc_class LIKE '%Covering%'").forEach(function (r) { covGuids[r.g] = 1; });
  var sprinklers = fp.placements.filter(function (p) { return p.ifc_class === 'IfcFireSuppressionTerminal'; });
  var boundSpr = sprinklers.filter(function (p) { return p.host; });
  var onCovering = boundSpr.filter(function (p) { return covGuids[p.host] && p.mount === 'BOTTOM'; }).length;
  var primOk = sprinklers.every(function (p) { return p.prim === 'sprinkler'; });
  var fpRaw = DW.dwWalk('FP', sc, 'SampleCastle', { noHostBind: true });
  log('§BF B3 sprinklers=' + sprinklers.length + ' bound=' + boundSpr.length + ' on-covering(BOTTOM)=' + onCovering +
    ' prim=sprinkler? ' + primOk + ' hostBind.byClass=' + JSON.stringify(fp.hostBind && fp.hostBind.byClass));
  assert('B3 HOST-BOUND-SPRINKLER',
    boundSpr.length > 0 && onCovering === boundSpr.length && primOk && fp.placed === fpRaw.placed,
    boundSpr.length + ' sprinklers host-bound to REAL ceilings (BOTTOM), prim=sprinkler (LOD400 seam), count preserved (' +
    fp.placed + ' == raw ' + fpRaw.placed + ')');

  // ── B4 NON-INVENT-SIZE+COUNT ──
  var teBbox = rows(te, "SELECT bbox_dx,bbox_dy,bbox_dz FROM rule_placement WHERE disc='FP' AND ifc_class='IfcFireSuppressionTerminal' LIMIT 1")[0];
  var bboxOk = sprinklers.length > 0 && sprinklers.every(function (p) {
    return Math.abs(p.bx - teBbox.bbox_dx) < 1e-6 && Math.abs(p.by - teBbox.bbox_dy) < 1e-6 && Math.abs(p.bz - teBbox.bbox_dz) < 1e-6;
  });
  // independent count oracle: Σ round(density × storey_area) clamped to the ARC occupancy cells (mirrors place()).
  var sub = DW.substrate(sc);
  var reps = DW.repRules('FP').filter(function (r) { return r.density > 0 && r.sx > 0; });
  var predict = 0;
  reps.forEach(function (rp) {
    sub.forEach(function (st) {
      var count = Math.round(rp.density * (st.x1 - st.x0) * (st.y1 - st.y0));
      if (count > 0) { var cap = DW.occupancy(sc, st, rp.sx).length || 1; predict += Math.min(count, cap); }
    });
  });
  var got = fp.placements.filter(function (p) { return reps.some(function (r) { return r.ifc_class === p.ifc_class; }); }).length;
  log('§BF B4 FP bbox==terminal-measured? ' + bboxOk + ' (' + teBbox.bbox_dx.toFixed(4) + '×' + teBbox.bbox_dy.toFixed(4) + '×' +
    teBbox.bbox_dz.toFixed(4) + 'm); count walked=' + got + ' == Σ round(density×area)∩envelope=' + predict);
  assert('B4 NON-INVENT-SIZE+COUNT', bboxOk && got === predict && got > 0,
    'FP fixtures carry Terminal MEASURED bbox + count==' + got + ' (bounded by density×area∩envelope, not an area explosion) — non-invent');

  // ── B5 GATE-STAYS-PRIMARY: clearance() (cross-disc) reads the PRIMARY duplex pair-set, NOT Terminal's ──
  function pairSet(db) { return rows(db, "SELECT DISTINCT disc_a, disc_b FROM rule_avoidance")
    .map(function (r) { return [r.disc_a, r.disc_b].sort().join('|'); }).sort(); }
  var clrKeys = Object.keys(DW.clearance()).sort();
  var dxPairs = pairSet(dx), tePairs = pairSet(te);
  var eq = function (a, b) { return a.length === b.length && a.every(function (x, i) { return x === b[i]; }); };
  log('§BF B5 clearance() pairs=' + JSON.stringify(clrKeys) + ' | duplex=' + JSON.stringify(dxPairs) + ' | terminal=' + JSON.stringify(tePairs));
  assert('B5 GATE-STAYS-PRIMARY', eq(clrKeys, dxPairs) && !eq(clrKeys, tePairs),
    'cross-disc clearance pair-set == PRIMARY duplex (' + clrKeys.length + ' pairs), ≠ terminal (' + tePairs.length +
    ') — borrow does not leak the LOD400 clearance standard');

  DW.dwBorrow('FP', null);                                     // clean up the borrow
  dx.close(); te.close(); sc.close();
  log('───────────────────────────────────────────────');
  log('§BF SUMMARY: SampleCastle (residential) walks ELEC/ACMV/PLB from duplex_rules and BORROWS FP/sprinkler from ' +
    'terminal_rules (' + sprinklers.length + ' sprinklers host-bound to real ceilings, prim=sprinkler LOD400 seam, count ' +
    'bounded+measured) — per-discipline source map, gate stays residential, nothing fabricated. docs/WalkerDoctrine.md §2.');
  log('W-BORROW-FP: ' + pass + ' PASS / ' + fail + ' FAIL');
  try { fs.mkdirSync(path.dirname(LOG), { recursive: true }); fs.writeFileSync(LOG, _lines.join('\n')); log('§LOG ' + LOG); } catch (e) {}
  process.exit(fail ? 1 : 0);
})();
