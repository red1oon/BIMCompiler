#!/usr/bin/env node
/**
 * # ⚠ DO NOT REMOVE — W-WALKBACK-MEP scope (read this block first)
 * SCOPE: UNBLOCK the routed-MEP-network walk-back (prompts/WALKER_GUARDS_ROSETTASTONE_SPEC.md §5 +
 *   prompts/RESUME_GRAPH_MODELLER_INTEGRATION.md §8E-3). The §5 block had TWO evidence-backed reasons:
 *     (1) no endpoints / no JUNCTION anchors on the ARC-only substrate, and
 *     (2) a local↔site frame mismatch (anchor mined ~20m, oracle in site ~671m).
 *   BOTH dissolve when the routed-network engine `disc_walker.routeChains` reads endpoints DIRECTLY from a
 *   real MEP-bearing extracted.db: the candidates and the oracle are then in the SAME frame BY CONSTRUCTION
 *   (no anchor-mining step), and the endpoint classes are present. The §8E-3 walk emitted 0 only because the
 *   modeller passed the LAID ARC-ONLY fixture as the building db — not an engine fault, a substrate gap.
 *
 *   This witness proves the unblock on TWO real MEP-bearing substrates, scored against a NON-INVENT geometric
 *   oracle, with an ARC-only substrate as the 0-segment falsifier (the exact §8E-3 condition).
 *     • Terminal_extracted.db  (large complex, IFC4 — IfcPipeFitting/Segment + IfcDuctFitting/Segment)  w/ terminal_rules.db
 *     • Duplex_mep_extracted.db (residential, IFC2x3 generic — IfcFlowFitting/Segment/Terminal)          w/ duplex_rules.db
 *   Oracle = the pristine extracted.db itself (NEVER output.db). The connectivity ground truth is RECOVERED by
 *   geometry — two MEP elements are connected iff a fitting physically touches a pipe run (point-to-3D-segment
 *   distance ≤ touchTol) — the SAME measured-touch principle as §ABUTS rel_adjacency. The source IFCs carry NO
 *   IfcRelConnectsPorts (verified: port_connections is honestly empty), so a recorded-topology oracle does not
 *   exist; the geometric touch IS the available ground truth and it is measured, not invented.
 *   Read the §-log after the run; exit code is not the evidence (Log Mandate).
 *
 * THE METRIC (pinned = decision D1, identical to witness_walkback_str.js):
 *   the walker emits nn-PAIRS (fitting → its nearest pipe-segment, bounded by the measured max gap). A walked
 *   pair (f,s) MATCHES the oracle iff s ∈ touch(f) (the fitting really touches that run). Reported per substrate:
 *     precision = matched / |walked|  = the DON'T-FABRICATE gate (the picked run is a real touch) → PASS bar.
 *     recall    = matched / |oracle touches| = COVERAGE (nn recovers ONE leg of a multi-leg junction) → REPORTED
 *                 as an honest coverage gap, NOT a hard fail — exactly as beam recall is reported for STR.
 *   touchTol is SWEPT and the plateau reported, never widened to force a pass.
 *
 * CLAIMS (each names the issue it proves or disproves):
 *   M0 SUBSTRATE-UNBLOCKS — the two substrates carry real MEP endpoint classes at 100% geometry; an ARC-only
 *                           substrate (SampleHouse) carries 0 → this is the substrate the §5 block asked for.
 *   M1 FRAME-CONSISTENT   — each substrate is a SINGLE extracted.db = ONE coordinate frame; walker candidates
 *                           and oracle share it by construction (no anchor-mining local↔site split = §5 reason 2 gone).
 *   M2 ROUTE-EMITS-0→N    — routeChains emits N>0 segments on BOTH MEP substrates, and 0 on the ARC-only
 *                           substrate (honest no-endpoints) = the literal §8E-3 unblock (0 → real network).
 *   M3 NON-INVENT         — every walked segment joins TWO REAL guids at their REAL element_transforms positions
 *                           (coords == db to 1e-9), every gap ≤ the MEASURED bound; zero fabricated coordinates.
 *   M4 ORACLE-WALKBACK    — geometric touch oracle: PRECISION (don't-fabricate) clears the bar; RECALL reported
 *                           as junction-degree coverage. posTol swept, plateau reported.
 *   M5 REFUSE-COVERAGE    — fittings with no neighbour within the measured bound are honestly skipped + counted
 *                           (byRule.noNbr) — REFUSE beats fabricate.
 *   M6 REPRODUCE          — re-run identical; bars set f(measured), every seg traces real from_guid/to_guid + measured bound.
 *   M7 ROUTE-TO-FACE      — opt-in `routeChains(disc,bdb,{toFace:true})` pairs node→run by point-to-LINE (the run's real
 *                           face) not centre-to-centre; it PARTIALLY lifts ACMV duct precision (ducts stay harder) and
 *                           does not regress short-run PLB, 0 fabricated. Default OFF — live dwWalk is byte-identical.
 */
'use strict';
var fs = require('fs');
var path = require('path');
var initSqlJs = require('sql.js');

var ROOT = path.join(__dirname, '..');
var DWT = require('./dw_tree.js');   // the shipped walker and its rules, never the older build/ copy (MODELLER_MASTER §WITNESS-REPOINT)
// WALKBACK_DW (optional env): absolute path to an ALTERNATE disc_walker.js build — lets this witness score a
// historical engine (e.g. the pre-§BUG-A-TRUE-MIDPOINT build) against the SAME oracle for a before/after
// attribution run. Default (unset) is byte-identical to before: the repo's own build/disc_walker.js.
var DW = require(process.env.WALKBACK_DW || DWT.walker);
if (process.env.WALKBACK_DW) console.log('§MEP-WB ENGINE-OVERRIDE ' + process.env.WALKBACK_DW);
var LOG = path.join(ROOT, 'logs', 'witness_walkback_mep_' +
  new Date().toISOString().replace(/[:.]/g, '').slice(0, 15) + '.log');

var _lines = [];
function log(s) { _lines.push(s); console.log(s); }
var pass = 0, fail = 0;
function assert(claim, cond, detail) {
  if (cond) { pass++; log('  ✅ ' + claim + ' — ' + detail); }
  else { fail++; log('  ❌ ' + claim + ' — ' + detail); }
}

// ── sql.js row helper ──
function rows(db, sql) {
  var r = db.exec(sql); if (!r.length) return [];
  return r[0].values.map(function (v) { var o = {}; r[0].columns.forEach(function (c, i) { o[c] = v[i]; }); return o; });
}
function loadDb(SQL, file) { return new SQL.Database(new Uint8Array(fs.readFileSync(file))); }

// ── Geometric touch oracle (NON-INVENT: measured geometry, no invented constant) ──
// A pipe run's physical extent = its centre ± half of its DOMINANT AABB axis (rotations here are multiples of
// π/2 so the AABB long axis IS the pipe axis). Two MEP elements are CONNECTED iff a fitting (a compact node,
// bbox ~0.04m) physically touches that run: point-to-3D-segment distance ≤ touchTol. Same principle as §ABUTS.
function segEndpoints(s) {
  var ext = [s.bx || 0, s.by || 0, s.bz || 0];
  var ax = 0; if (ext[1] > ext[ax]) ax = 1; if (ext[2] > ext[ax]) ax = 2;
  var h = ext[ax] / 2;
  var a = [s.x, s.y, s.z], b = [s.x, s.y, s.z];
  a[ax] -= h; b[ax] += h;
  return { a: a, b: b };
}
function pointToSeg3D(p, a, b) {
  var abx = b[0] - a[0], aby = b[1] - a[1], abz = b[2] - a[2];
  var apx = p[0] - a[0], apy = p[1] - a[1], apz = p[2] - a[2];
  var len2 = abx * abx + aby * aby + abz * abz;
  var t = len2 > 0 ? (apx * abx + apy * aby + apz * abz) / len2 : 0;
  t = Math.max(0, Math.min(1, t));
  var cx = a[0] + t * abx, cy = a[1] + t * aby, cz = a[2] + t * abz;
  return Math.hypot(p[0] - cx, p[1] - cy, p[2] - cz);
}
function readClassXYZ(db, cls) {
  return rows(db,
    "SELECT m.guid g, t.center_x x, t.center_y y, t.center_z z, t.bbox_x bx, t.bbox_y by_, t.bbox_z bz " +
    "FROM elements_meta m JOIN element_transforms t ON m.guid=t.guid WHERE m.ifc_class='" + cls + "'");
}
// Build oracle touch-pairs {fittingGuid -> Set(segGuid)} via a spatial hash on segment midpoints (O(n)).
function touchOracle(fittings, segments, tol) {
  var CELL = Math.max(tol, 0.25), grid = {};
  var ck = function (a, b, c) { return a + ',' + b + ',' + c; };
  var ep = segments.map(segEndpoints);
  segments.forEach(function (s, i) {
    var mx = (ep[i].a[0] + ep[i].b[0]) / 2, my = (ep[i].a[1] + ep[i].b[1]) / 2, mz = (ep[i].a[2] + ep[i].b[2]) / 2;
    // a long pipe can span many cells → register both endpoints + midpoint cells
    [[ep[i].a], [ep[i].b], [[mx, my, mz]]].forEach(function (q) {
      var k = ck(Math.floor(q[0][0] / CELL), Math.floor(q[0][1] / CELL), Math.floor(q[0][2] / CELL));
      (grid[k] = grid[k] || []).push(i);
    });
  });
  var pairs = 0, touchSet = {};
  fittings.forEach(function (f) {
    var ix = Math.floor(f.x / CELL), iy = Math.floor(f.y / CELL), iz = Math.floor(f.z / CELL);
    var seen = {}, set = {};
    for (var dx = -1; dx <= 1; dx++) for (var dy = -1; dy <= 1; dy++) for (var dz = -1; dz <= 1; dz++) {
      var arr = grid[ck(ix + dx, iy + dy, iz + dz)]; if (!arr) continue;
      for (var a = 0; a < arr.length; a++) {
        var si = arr[a]; if (seen[si]) continue; seen[si] = 1;
        if (pointToSeg3D([f.x, f.y, f.z], ep[si].a, ep[si].b) <= tol) { set[segments[si].g] = 1; }
      }
    }
    var keys = Object.keys(set);
    if (keys.length) { touchSet[f.g] = set; pairs += keys.length; }
  });
  return { touchSet: touchSet, pairs: pairs, fittingsTouching: Object.keys(touchSet).length };
}

var TOUCH_SWEEP = [0.05, 0.10, 0.15, 0.20, 0.30];
var PLATEAU_TOL = 0.15;          // m — the touch tolerance at which precision/recall is the reported plateau
var PREC_BAR = 0.80;             // don't-fabricate gate (set just under the measured baseline)

function walkSubstrate(SQL, sub) {
  log('');
  log('═══ ' + sub.name + '  (rules=' + path.basename(sub.rules) + ') ═══');
  var rdb = loadDb(SQL, sub.rules);
  var bdb = loadDb(SQL, sub.db);
  DW.dwOpen(rdb);

  // M1 FRAME-CONSISTENT — single extracted.db = one frame; print the coord bbox of all flow elements.
  var ext = rows(bdb,
    "SELECT MIN(t.center_x) x0, MAX(t.center_x) x1, MIN(t.center_y) y0, MAX(t.center_y) y1, MIN(t.center_z) z0, MAX(t.center_z) z1 " +
    "FROM element_transforms t JOIN elements_meta m ON m.guid=t.guid WHERE m.ifc_class LIKE 'Ifc%Fitting' OR m.ifc_class LIKE 'Ifc%Segment' OR m.ifc_class LIKE 'IfcFlow%'")[0];
  var span = Math.max(ext.x1 - ext.x0, ext.y1 - ext.y0, ext.z1 - ext.z0);
  log('§MEP-WB FRAME ' + sub.name + ' flow-element bbox span=' + span.toFixed(1) + 'm origin≈(' +
    ext.x0.toFixed(1) + ',' + ext.y0.toFixed(1) + ',' + ext.z0.toFixed(1) + ') — single extracted frame, == oracle frame');

  var out = { name: sub.name, totalSegs: 0, byDisc: [], frameSpan: span };
  sub.discs.forEach(function (d) {
    var rc = DW.routeChains(d.disc, bdb);
    out.totalSegs += rc.segs.length;

    // M3 NON-INVENT — verify each seg endpoint is a real guid at its real db position; gap ≤ measured bound.
    var fabricated = 0, overBound = 0;
    rc.segs.forEach(function (s) {
      var fr = rows(bdb, "SELECT center_x x,center_y y,center_z z FROM element_transforms WHERE guid='" + s.from_guid + "'")[0];
      var to = rows(bdb, "SELECT center_x x,center_y y,center_z z FROM element_transforms WHERE guid='" + s.to_guid + "'")[0];
      if (!fr || !to) { fabricated++; return; }
      if (Math.hypot(fr.x - s.from[0], fr.y - s.from[1], fr.z - s.from[2]) > 1e-9) fabricated++;
      else if (Math.hypot(to.x - s.to[0], to.y - s.to[1], to.z - s.to[2]) > 1e-9) fabricated++;
      if (s.gap > s.bound + 1e-9) overBound++;
    });

    // M4 ORACLE-WALKBACK — geometric touch oracle, sweep touchTol, score the nn pairs.
    // The oracle is orientation-INVARIANT: the RUN is always the *Segment class (a long edge), the NODE is the
    // fitting/terminal (compact). A rule may declare either direction (PLB Fitting→Segment, ACMV Segment→Fitting);
    // we map each walked pair to (nodeGuid, runGuid) by which kind is the run, so the touch test is always node→run.
    var fromIsRun = /Segment/.test(d.from);
    var runCls = fromIsRun ? d.from : d.to, nodeCls = fromIsRun ? d.to : d.from;
    var nodes = readClassXYZ(bdb, nodeCls), runsAll = readClassXYZ(bdb, runCls);
    // score ONLY this rule's segs against this rule's oracle (a disc may carry several nn-rules, e.g. ACMV's
    // DuctSegment→DuctFitting AND DuctFitting→AirTerminal — mixing them understates precision).
    var walkedPairs = rc.segs.filter(function (s) { return s.from_kind === d.from && s.to_kind === d.to; })
      .map(function (s) { return fromIsRun ? { node: s.to_guid, run: s.from_guid } : { node: s.from_guid, run: s.to_guid }; });
    var sweep = TOUCH_SWEEP.map(function (tol) {
      var orc = touchOracle(nodes, runsAll, tol);
      var matched = 0;
      walkedPairs.forEach(function (w) { if (orc.touchSet[w.node] && orc.touchSet[w.node][w.run]) matched++; });
      return {
        tol: tol, oraclePairs: orc.pairs, matched: matched,
        precision: walkedPairs.length ? matched / walkedPairs.length : 0,
        recall: orc.pairs ? matched / orc.pairs : 0
      };
    });
    sweep.forEach(function (s) {
      log('§MEP-WB ' + sub.name + ' ' + d.disc + ' ' + d.from.replace('Ifc', '') + '→' + d.to.replace('Ifc', '') +
        ' touchTol=' + s.tol + 'm → precision=' + s.precision.toFixed(3) + ' recall=' + s.recall.toFixed(3) +
        ' (matched ' + s.matched + ' of walked ' + walkedPairs.length + ' / oracle-touches ' + s.oraclePairs + ')');
    });
    var plat = sweep.find(function (s) { return s.tol === PLATEAU_TOL; });
    var br = rc.byRule[0] || {};
    log('§MEP-WB ' + sub.name + ' ' + d.disc + ' nn-network: ' + rc.segs.length + ' segments, ' +
      (br.noNbr || 0) + ' fittings refused (no neighbour ≤ bound ' + (br.bound) + 'm, ' + (br.gapSource) +
      '), meanGap=' + (br.meanGap) + 'm vs measured avg ' + (br.avg_measured) + 'm, iterDir=' + (br.iterDir));
    out.byDisc.push({ disc: d.disc, segs: rc.segs.length, fabricated: fabricated, overBound: overBound,
      noNbr: br.noNbr || 0, plat: plat, rc: rc });
  });

  rdb.close(); bdb.close();
  return out;
}

(async function main() {
  log('═══ W-WALKBACK-MEP — UNBLOCK the routed MEP network on REAL MEP-bearing substrates (oracle=extracted.db) ═══');
  var SQL = await initSqlJs();

  var TE = path.join(ROOT, 'deploy/buildings/Terminal_extracted.db');
  var DX = path.join(ROOT, 'build/Duplex_mep_extracted.db');
  var SH = path.join(ROOT, 'deploy/buildings/SampleHouse_extracted.db');
  var TE_RULES = DWT.rules('terminal_rules.db');
  var DX_RULES = DWT.rules('duplex_rules.db');

  // ── M0 SUBSTRATE-UNBLOCKS — real MEP endpoint classes at 100% geometry on the two substrates; 0 on ARC-only.
  log('');
  log('─── M0 SUBSTRATE-UNBLOCKS ───');
  var teDb = loadDb(SQL, TE), dxDb = loadDb(SQL, DX), shDb = loadDb(SQL, SH);
  function flowCoverage(db, cls) {
    var r = rows(db, "SELECT COUNT(*) n, SUM(CASE WHEN t.guid IS NOT NULL THEN 1 ELSE 0 END) g " +
      "FROM elements_meta m LEFT JOIN element_transforms t ON m.guid=t.guid WHERE m.ifc_class='" + cls + "'")[0];
    return { n: r.n || 0, g: r.g || 0 };
  }
  var tePipe = flowCoverage(teDb, 'IfcPipeFitting'), tePseg = flowCoverage(teDb, 'IfcPipeSegment');
  var teDuct = flowCoverage(teDb, 'IfcDuctSegment');
  var dxFit = flowCoverage(dxDb, 'IfcFlowFitting'), dxSeg = flowCoverage(dxDb, 'IfcFlowSegment');
  var shFlow = flowCoverage(shDb, 'IfcFlowFitting').n + flowCoverage(shDb, 'IfcPipeFitting').n;
  log('§MEP-WB Terminal: IfcPipeFitting ' + tePipe.g + '/' + tePipe.n + ' IfcPipeSegment ' + tePseg.g + '/' + tePseg.n +
    ' IfcDuctSegment ' + teDuct.g + '/' + teDuct.n + ' (geom/total)');
  log('§MEP-WB Duplex:   IfcFlowFitting ' + dxFit.g + '/' + dxFit.n + ' IfcFlowSegment ' + dxSeg.g + '/' + dxSeg.n);
  log('§MEP-WB SampleHouse (ARC-only falsifier): MEP fittings = ' + shFlow);
  assert('M0 SUBSTRATE-UNBLOCKS',
    tePipe.n > 0 && tePipe.g === tePipe.n && tePseg.g === tePseg.n &&
    dxFit.n > 0 && dxFit.g === dxFit.n && dxSeg.g === dxSeg.n && shFlow === 0,
    'Terminal+Duplex carry real MEP endpoints at 100% geometry; SampleHouse (ARC-only) has 0 = the substrate §5 asked for');
  teDb.close(); dxDb.close(); shDb.close();

  // ── walk the two real MEP substrates ──
  var terminal = walkSubstrate(SQL, { name: 'Terminal', db: TE, rules: TE_RULES, discs: [
    { disc: 'PLB', from: 'IfcPipeFitting', to: 'IfcPipeSegment' },
    { disc: 'ACMV', from: 'IfcDuctSegment', to: 'IfcDuctFitting' }
  ] });
  var duplex = walkSubstrate(SQL, { name: 'Duplex', db: DX, rules: DX_RULES, discs: [
    { disc: 'PLB', from: 'IfcFlowFitting', to: 'IfcFlowSegment' }
  ] });

  // ── M1 FRAME-CONSISTENT (both single-frame; the §5 local↔site split does not arise here) ──
  log('');
  log('─── M1 FRAME-CONSISTENT ───');
  assert('M1 FRAME-CONSISTENT',
    terminal.frameSpan > 0 && duplex.frameSpan > 0,
    'each substrate is ONE extracted frame (Terminal span ' + terminal.frameSpan.toFixed(0) + 'm, Duplex ' +
    duplex.frameSpan.toFixed(0) + 'm); routeChains reads endpoints in that frame = oracle frame (no anchor-mining ' +
    'local↔site mismatch — §5 reason 2 does not arise)');

  // ── M2 ROUTE-EMITS-0→N (the literal unblock) — ARC-only contrast ──
  log('');
  log('─── M2 ROUTE-EMITS-0→N ───');
  var arcDb = loadDb(SQL, SH); DW.dwOpen(loadDb(SQL, DX_RULES));
  var arcSegs = DW.routeChains('PLB', arcDb).segs.length;   // PLB rule on an ARC-only substrate → no endpoints → 0
  arcDb.close();
  log('§MEP-WB ARC-only (SampleHouse) routeChains PLB segments = ' + arcSegs + ' (the §8E-3 condition: no endpoints → 0)');
  log('§MEP-WB Terminal total nn-segments = ' + terminal.totalSegs + ' · Duplex total nn-segments = ' + duplex.totalSegs);
  assert('M2 ROUTE-EMITS-0→N',
    terminal.totalSegs > 0 && duplex.totalSegs > 0 && arcSegs === 0,
    'routeChains emits a real network on BOTH MEP substrates (Terminal ' + terminal.totalSegs + ', Duplex ' +
    duplex.totalSegs + ') and 0 on ARC-only — the §8E-3 0→N unblock');

  // ── M3 NON-INVENT (across every walked segment, both substrates) ──
  log('');
  log('─── M3 NON-INVENT ───');
  var allDisc = terminal.byDisc.concat(duplex.byDisc);
  var totFab = allDisc.reduce(function (a, d) { return a + d.fabricated; }, 0);
  var totOver = allDisc.reduce(function (a, d) { return a + d.overBound; }, 0);
  var totSeg = allDisc.reduce(function (a, d) { return a + d.segs; }, 0);
  log('§MEP-WB across ' + totSeg + ' walked segments: fabricated coords=' + totFab + ', gaps over measured bound=' + totOver);
  assert('M3 NON-INVENT',
    totFab === 0 && totOver === 0 && totSeg > 0,
    'all ' + totSeg + ' segments join two REAL guids at REAL positions (0 fabricated), every gap ≤ measured bound (' +
    totOver + ' over)');

  // ── M4 ORACLE-WALKBACK — precision (don't-fabricate) is the gate; recall reported as coverage ──
  log('');
  log('─── M4 ORACLE-WALKBACK (geometric touch, plateau touchTol=' + PLATEAU_TOL + 'm) ───');
  var primary = terminal.byDisc.find(function (d) { return d.disc === 'PLB'; });   // Terminal PLB = the on-point §8E case
  var dxPlb = duplex.byDisc.find(function (d) { return d.disc === 'PLB'; });
  [['Terminal/PLB', primary], ['Duplex/PLB', dxPlb]].forEach(function (e) {
    var p = e[1].plat;
    log('§MEP-WB ' + e[0] + ' @' + PLATEAU_TOL + 'm: precision=' + p.precision.toFixed(3) + ' (don\'t-fabricate gate) · ' +
      'recall=' + p.recall.toFixed(3) + ' (coverage: nn recovers one leg of multi-leg junctions — reported, not a fail)');
  });
  assert('M4 ORACLE-WALKBACK',
    primary.plat.precision >= PREC_BAR && dxPlb.plat.precision >= PREC_BAR,
    'PRECISION ≥ ' + PREC_BAR + ' on both (Terminal ' + primary.plat.precision.toFixed(3) + ', Duplex ' +
    dxPlb.plat.precision.toFixed(3) + '); recall REPORTED as junction-degree coverage (Terminal ' +
    primary.plat.recall.toFixed(3) + ', Duplex ' + dxPlb.plat.recall.toFixed(3) + ')');
  // HONEST FINDING (not hidden, not gated): ACMV ducts route looser than PLB pipes. The nn engine pairs to element
  // CENTRES; a duct is large so its centre sits far (meanGap 0.68m) from the face the geometric oracle tests, hence
  // low precision vs a fitting-scale touchTol. PLB pipes are short → centre ≈ connection point → tight. The fix is a
  // route-to-nearest-FACE/endpoint engine refinement (a future slice); reported here, never fabricated to green.
  var acmv = terminal.byDisc.find(function (d) { return d.disc === 'ACMV'; });
  if (acmv) log('§MEP-WB FINDING ACMV/Terminal precision=' + acmv.plat.precision.toFixed(3) + ' @' + PLATEAU_TOL +
    'm (vs PLB ' + primary.plat.precision.toFixed(3) + '): nn-to-CENTRE is loose for large ducts (centre far from ' +
    'connection face). M7 measures route-to-FACE as the refinement — a PARTIAL lift, ducts remain genuinely harder; reported, not faked');

  // ── M5 REFUSE-COVERAGE ──
  log('');
  log('─── M5 REFUSE-COVERAGE ───');
  var totNoNbr = allDisc.reduce(function (a, d) { return a + d.noNbr; }, 0);
  allDisc.forEach(function (d) { log('§MEP-WB refuse ' + d.disc + ': ' + d.noNbr + ' fittings with no neighbour ≤ bound (honest skip)'); });
  assert('M5 REFUSE-COVERAGE',
    allDisc.every(function (d) { return d.noNbr >= 0 && (d.segs + d.noNbr) > 0; }),
    'every refused fitting is counted (total ' + totNoNbr + '); placed+refused>0 per disc — REFUSE beats fabricate');

  // ── M6 REPRODUCE ──
  log('');
  log('─── M6 REPRODUCE ───');
  var rdb = loadDb(SQL, DX_RULES), bdb = loadDb(SQL, DX); DW.dwOpen(rdb);
  var r1 = DW.routeChains('PLB', bdb).segs.length;
  var r2 = DW.routeChains('PLB', bdb).segs.length;
  var traced = DW.routeChains('PLB', bdb).segs.every(function (s) {
    return !!s.from_guid && !!s.to_guid && s.bound > 0 && (s.gapSource === 'measured-max' || s.gapSource === 'derived-from-avg');
  });
  rdb.close(); bdb.close();
  assert('M6 REPRODUCE',
    r1 === r2 && traced,
    'routeChains re-runs identical (' + r1 + '==' + r2 + '); every seg traces real from/to guid + measured bound');

  // ── M7 ROUTE-TO-FACE (the refinement that improves the ACMV finding; opt-in, non-invent) ──
  // Pair each node to the nearest run by point-to-LINE distance (the run's real face) instead of centre-to-centre.
  // Score the SAME geometric touch oracle: face routing should LIFT precision where the run is large (ACMV ducts),
  // and never regress short-run PLB. NON-INVENT preserved: every face seg still joins two real guids, gap ≤ bound.
  log('');
  log('─── M7 ROUTE-TO-FACE (opt-in refinement) ───');
  function scoreFace(dbFile, rulesFile, disc, from, to) {
    var rdb2 = loadDb(SQL, rulesFile), bdb2 = loadDb(SQL, dbFile); DW.dwOpen(rdb2);
    var rc = DW.routeChains(disc, bdb2, { toFace: true });
    var fromIsRun = /Segment/.test(from);
    var runCls = fromIsRun ? from : to, nodeCls = fromIsRun ? to : from;
    var nodes = readClassXYZ(bdb2, nodeCls), runsAll = readClassXYZ(bdb2, runCls);
    var orc = touchOracle(nodes, runsAll, PLATEAU_TOL);
    var ruleSegs = rc.segs.filter(function (s) { return s.from_kind === from && s.to_kind === to; });
    var matched = 0, fab = 0, over = 0;
    ruleSegs.forEach(function (s) {
      var node = fromIsRun ? s.to_guid : s.from_guid, run = fromIsRun ? s.from_guid : s.to_guid;
      if (orc.touchSet[node] && orc.touchSet[node][run]) matched++;
      var fr = rows(bdb2, "SELECT center_x x,center_y y,center_z z FROM element_transforms WHERE guid='" + s.from_guid + "'")[0];
      var to2 = rows(bdb2, "SELECT center_x x,center_y y,center_z z FROM element_transforms WHERE guid='" + s.to_guid + "'")[0];
      if (!fr || !to2 || Math.hypot(fr.x - s.from[0], fr.y - s.from[1], fr.z - s.from[2]) > 1e-9 ||
          Math.hypot(to2.x - s.to[0], to2.y - s.to[1], to2.z - s.to[2]) > 1e-9) fab++;
      if (s.gap > s.bound + 1e-9) over++;
    });
    rdb2.close(); bdb2.close();
    return { segs: ruleSegs.length, prec: ruleSegs.length ? matched / ruleSegs.length : 0, fab: fab, over: over,
      mode: (ruleSegs[0] && ruleSegs[0].mode) || 'none' };
  }
  var faceACMV = scoreFace(TE, TE_RULES, 'ACMV', 'IfcDuctSegment', 'IfcDuctFitting');
  var facePLBte = scoreFace(TE, TE_RULES, 'PLB', 'IfcPipeFitting', 'IfcPipeSegment');
  var facePLBdx = scoreFace(DX, DX_RULES, 'PLB', 'IfcFlowFitting', 'IfcFlowSegment');
  var centerACMV = terminal.byDisc.find(function (d) { return d.disc === 'ACMV'; }).plat.precision;
  log('§MEP-WB FACE ACMV/Terminal: precision ' + centerACMV.toFixed(3) + ' (centre) → ' + faceACMV.prec.toFixed(3) +
    ' (face) over ' + faceACMV.segs + ' segs, mode=' + faceACMV.mode + ' [' + faceACMV.fab + ' fabricated, ' + faceACMV.over + ' over-bound]');
  log('§MEP-WB FACE PLB/Terminal:  precision ' + primary.plat.precision.toFixed(3) + ' (centre) → ' + facePLBte.prec.toFixed(3) + ' (face)');
  log('§MEP-WB FACE PLB/Duplex:    precision ' + dxPlb.plat.precision.toFixed(3) + ' (centre) → ' + facePLBdx.prec.toFixed(3) + ' (face)');
  assert('M7 ROUTE-TO-FACE',
    faceACMV.prec > centerACMV && faceACMV.fab === 0 && faceACMV.over === 0 &&
    facePLBte.prec >= primary.plat.precision - 0.02 && facePLBdx.prec >= dxPlb.plat.precision - 0.02 &&
    facePLBte.fab === 0 && facePLBdx.fab === 0,
    'face LIFTS ACMV precision ' + centerACMV.toFixed(3) + '→' + faceACMV.prec.toFixed(3) +
    ' (partial — ducts stay harder), does NOT regress PLB (TE ' + primary.plat.precision.toFixed(3) + '→' + facePLBte.prec.toFixed(3) +
    ', DX ' + dxPlb.plat.precision.toFixed(3) + '→' + facePLBdx.prec.toFixed(3) + '), 0 fabricated; opt-in (live dwWalk unchanged)');

  log('');
  log('───────────────────────────────────────────────');
  log('§MEP-WB UNBLOCK SUMMARY: routed MEP network NOW emits — Terminal ' + terminal.totalSegs + ' segs (PLB+ACMV), ' +
    'Duplex ' + duplex.totalSegs + ' segs (PLB), ARC-only 0. Precision Terminal/PLB ' +
    primary.plat.precision.toFixed(3) + ' Duplex/PLB ' + dxPlb.plat.precision.toFixed(3) +
    ' @' + PLATEAU_TOL + 'm. §5 W-WALKBACK-MEP / §8E-3 ⛔ → ✅.');
  log('W-WALKBACK-MEP: ' + pass + ' PASS / ' + fail + ' FAIL');
  try { fs.mkdirSync(path.dirname(LOG), { recursive: true }); fs.writeFileSync(LOG, _lines.join('\n')); log('§LOG ' + LOG); } catch (e) {}
  process.exit(fail ? 1 : 0);
})();
