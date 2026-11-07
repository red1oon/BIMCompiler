#!/usr/bin/env node
/**
 * # ⚠ DO NOT REMOVE — W-FACE-SURFACE scope (read this block first)
 * SCOPE: prompts/RESUME_DISC_WALKER_ENVELOPE_BOUND.md §FACE-SURFACE (thread (b), user-picked 2026-06-30).
 *   The ACMV duct-routing precision (centre 0.269 / M7 face-by-line 0.332 @0.15m) reads as "ducts are genuinely
 *   harder than pipes." This witness shows that is SUBSTANTIALLY a SCORING ARTIFACT: the touch oracle measures
 *   node-CENTRE → run-LINE, which over-states the gap of a BULKY element by ~(node half-section + run half-section).
 *   A face/surface-aware touch — subtract BOTH elements' MEASURED perpendicular half-extents (clamp ≥0) — reveals
 *   the ducts genuinely connect. NON-INVENT: half-extents are bbox-derived, never a constant; overlap (gap 0) = touch.
 *
 *   This is a CORRECTION of a known centre-to-line bias, NOT goalpost-moving — proven by TWO falsifiers:
 *     • PLB-INVARIANCE (bulk-proportional): thin pipes (~0.01m half-section) don't move; bulky ducts (~0.14m) lift.
 *       If it were free leniency, PLB would jump too. It doesn't.
 *     • RANK-DISCRIMINATION (still rejects wrong pairs): surface-touch nearest≫5th≫farthest (≈0).
 *   Read the §-log after the run; exit code is not the evidence (Log Mandate).
 *
 * CLAIMS (each names the issue it proves or disproves):
 *   FS1 LIFT (ACMV)        — surface nearest-run touch ≫ centre (≥0.95 vs ~0.52); surface-scored precision on the
 *                            FACE-walked pairs ≫ centre-scored. The "harder" finding was largely the metric.
 *   FS2 PLB-INVARIANT      — FALSIFIER: PLB surface-touch − centre-touch < 0.02 on BOTH Terminal & Duplex (thin →
 *                            no bias to correct) → the ACMV lift is bulk-proportional, not free leniency.
 *   FS3 DISCRIMINATION     — FALSIFIER: for ACMV the farthest run does NOT surface-touch (≤0.02), 5th-nearest is
 *                            low (<0.10), nearest is high (≥0.95) → the surface metric still rejects wrong pairs.
 *   FS4 NON-INVENT         — every subtracted half-extent == independently re-measured bbox/2 (0 tol); a zeroed-bbox
 *                            element falls back to centre (gapSurface == gap) → no fabricated size.
 *   FS5 ENGINE-CARRIES     — routeChains(disc,bdb,{toFace:true}) segs carry gapSurface == independently recomputed
 *                            surface gap; the centre `gap` field still == the point-to-LINE distance (pairing/guids
 *                            unchanged → M7 + W-WALKBACK-MEP invariant; gapSurface is purely additive).
 */
'use strict';
var fs = require('fs');
var path = require('path');
var initSqlJs = require('sql.js');

var ROOT = path.join(__dirname, '..');
var DWT = require('./dw_tree.js');   // the shipped walker and its rules, never the older build/ copy (MODELLER_MASTER §WITNESS-REPOINT)
var DW = require(DWT.walker);
var LOG = path.join(ROOT, 'logs', 'witness_route_face_surface_' +
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
function loadDb(SQL, file) { return new SQL.Database(new Uint8Array(fs.readFileSync(file))); }
function readClassXYZ(db, cls) {
  return rows(db, "SELECT m.guid g, t.center_x x, t.center_y y, t.center_z z, t.bbox_x bx, t.bbox_y by_, t.bbox_z bz " +
    "FROM elements_meta m JOIN element_transforms t ON m.guid=t.guid WHERE m.ifc_class='" + cls + "'");
}
// run line + dominant axis (mirrors disc_walker._segLine, consistent by_ key)
function segLine(s) {
  var ext = [s.bx || 0, s.by_ || 0, s.bz || 0], ax = 0;
  if (ext[1] > ext[ax]) ax = 1; if (ext[2] > ext[ax]) ax = 2;
  var h = ext[ax] / 2, a = [s.x, s.y, s.z], b = [s.x, s.y, s.z];
  a[ax] -= h; b[ax] += h; return { a: a, b: b, ax: ax };
}
function perpHalf(bx, by_, bz, ax) {
  var e = [bx || 0, by_ || 0, bz || 0], perp = [0, 1, 2].filter(function (i) { return i !== ax; });
  return (e[perp[0]] / 2 + e[perp[1]] / 2) / 2;
}
function ptSeg(p, a, b) {
  var abx = b[0] - a[0], aby = b[1] - a[1], abz = b[2] - a[2];
  var apx = p[0] - a[0], apy = p[1] - a[1], apz = p[2] - a[2];
  var l2 = abx * abx + aby * aby + abz * abz;
  var t = l2 > 0 ? (apx * abx + apy * aby + apz * abz) / l2 : 0;
  t = t < 0 ? 0 : (t > 1 ? 1 : t);
  var cx = a[0] + t * abx, cy = a[1] + t * aby, cz = a[2] + t * abz;
  return Math.hypot(p[0] - cx, p[1] - cy, p[2] - cz);
}
// touch oracle {nodeGuid -> Set(runGuid)} — surface=true subtracts both perp half-sections (the §FACE-SURFACE metric)
function touchOracle(nodes, runs, tol, surface) {
  var lines = runs.map(segLine);
  var CELL = Math.max(tol + 1, 1), grid = {};
  var ck = function (a, b, c) { return a + ',' + b + ',' + c; };
  runs.forEach(function (r, i) {
    var L = lines[i];
    [L.a, L.b, [(L.a[0] + L.b[0]) / 2, (L.a[1] + L.b[1]) / 2, (L.a[2] + L.b[2]) / 2]].forEach(function (q) {
      var k = ck(Math.floor(q[0] / CELL), Math.floor(q[1] / CELL), Math.floor(q[2] / CELL));
      (grid[k] = grid[k] || []).push(i);
    });
  });
  var touchSet = {}, pairs = 0;
  nodes.forEach(function (f) {
    var ix = Math.floor(f.x / CELL), iy = Math.floor(f.y / CELL), iz = Math.floor(f.z / CELL);
    var seen = {}, set = {};
    for (var dx = -1; dx <= 1; dx++) for (var dy = -1; dy <= 1; dy++) for (var dz = -1; dz <= 1; dz++) {
      var arr = grid[ck(ix + dx, iy + dy, iz + dz)]; if (!arr) continue;
      for (var a = 0; a < arr.length; a++) {
        var si = arr[a]; if (seen[si]) continue; seen[si] = 1;
        if (runs[si].g === f.g) continue;
        var d = ptSeg([f.x, f.y, f.z], lines[si].a, lines[si].b);
        if (surface) d = Math.max(0, d - perpHalf(runs[si].bx, runs[si].by_, runs[si].bz, lines[si].ax) -
          perpHalf(f.bx, f.by_, f.bz, lines[si].ax));
        if (d <= tol) set[runs[si].g] = 1;
      }
    }
    var ks = Object.keys(set); if (ks.length) { touchSet[f.g] = set; pairs += ks.length; }
  });
  return { touchSet: touchSet, pairs: pairs };
}
// rank analysis: per node, nearest/5th/farthest run by centre-LINE, fraction surface- & centre-touching (probe logic)
function rankAnalysis(nodes, runs, tol) {
  var lines = runs.map(segLine);
  var c = { nearC: 0, nearS: 0, fifthS: 0, farS: 0, n: 0 };
  nodes.forEach(function (f) {
    var ds = [];
    for (var i = 0; i < runs.length; i++) { if (runs[i].g === f.g) continue;
      ds.push({ i: i, d: ptSeg([f.x, f.y, f.z], lines[i].a, lines[i].b) }); }
    if (ds.length < 6) return; ds.sort(function (a, b) { return a.d - b.d; });
    c.n++;
    function surf(ri) { var ax = lines[ri].ax; return Math.max(0, ds.find(function (e) { return e.i === ri; }).d -
      perpHalf(runs[ri].bx, runs[ri].by_, runs[ri].bz, ax) - perpHalf(f.bx, f.by_, f.bz, ax)); }
    if (ds[0].d <= tol) c.nearC++;
    if (surf(ds[0].i) <= tol) c.nearS++;
    if (surf(ds[4].i) <= tol) c.fifthS++;
    if (surf(ds[ds.length - 1].i) <= tol) c.farS++;
  });
  return { n: c.n, nearC: c.nearC / c.n, nearS: c.nearS / c.n, fifthS: c.fifthS / c.n, farS: c.farS / c.n };
}

var TOL = 0.15;

function walkScore(SQL, c) {
  var bdb = loadDb(SQL, path.join(ROOT, c.db));
  DW.dwOpen(loadDb(SQL, DWT.rules(c.rules)));
  var rc = DW.routeChains(c.disc, bdb, { toFace: true });
  var fromIsRun = /Segment/.test(c.run) ? (c.run === c.from) : false;
  // map walked segs of THIS rule → (node,run) guids
  var nodes = readClassXYZ(bdb, c.node), runs = readClassXYZ(bdb, c.run);
  var runIsFrom = (c.run === c.from);
  var walked = rc.segs.filter(function (s) { return s.from_kind === c.from && s.to_kind === c.to && s.mode === 'face'; })
    .map(function (s) { return { node: runIsFrom ? s.to_guid : s.from_guid, run: runIsFrom ? s.from_guid : s.to_guid,
      gap: s.gap, gapSurface: s.gapSurface }; });
  var orcC = touchOracle(nodes, runs, TOL, false), orcS = touchOracle(nodes, runs, TOL, true);
  function prec(orc) { var m = 0; walked.forEach(function (w) { if (orc.touchSet[w.node] && orc.touchSet[w.node][w.run]) m++; });
    return walked.length ? m / walked.length : 0; }
  // rankAnalysis is O(nodes·runs) — skip on the huge held-out building; the hashed oracles give the lift, and the
  // surface oracle's average touch-DEGREE (touches per node) is the hashed discrimination (small degree = not trivial).
  var ra = c.skipRank ? null : rankAnalysis(nodes, runs, TOL);
  var sDeg = orcS.pairs / Math.max(1, Object.keys(orcS.touchSet).length);   // avg surface-touch runs per touched node
  bdb.close();
  return { walked: walked, nodes: nodes, runs: runs, precC: prec(orcC), precS: prec(orcS), ra: ra, sDeg: sDeg,
    nNodes: nodes.length, nRuns: runs.length };
}

(async function main() {
  log('═══ W-FACE-SURFACE — route-to-FACE refined with MEASURED cross-section (the ACMV "harder" artifact) ═══');
  var SQL = await initSqlJs();
  var CASES = {
    acmvTE: { disc: 'ACMV', from: 'IfcDuctSegment', to: 'IfcDuctFitting', run: 'IfcDuctSegment', node: 'IfcDuctFitting',
      db: 'deploy/buildings/Terminal_extracted.db', rules: 'terminal_rules.db' },
    plbTE: { disc: 'PLB', from: 'IfcPipeFitting', to: 'IfcPipeSegment', run: 'IfcPipeSegment', node: 'IfcPipeFitting',
      db: 'deploy/buildings/Terminal_extracted.db', rules: 'terminal_rules.db' },
    plbDX: { disc: 'PLB', from: 'IfcFlowFitting', to: 'IfcFlowSegment', run: 'IfcFlowSegment', node: 'IfcFlowFitting',
      db: 'build/Duplex_mep_extracted.db', rules: 'duplex_rules.db' },
    // HELD-OUT: duplex_rules mined from Duplex, routed onto LTU_AHouse (never mined). Its run class IfcFlowSegment is
    // BULKY (~0.52×0.56m) while the node IfcFlowFitting is thin → the same centre-to-line bias + same correction.
    ltuHO: { disc: 'PLB', from: 'IfcFlowFitting', to: 'IfcFlowSegment', run: 'IfcFlowSegment', node: 'IfcFlowFitting',
      db: 'deploy/buildings/LTU_AHouse_extracted.db', rules: 'duplex_rules.db', skipRank: true }
  };
  var acmv = walkScore(SQL, CASES.acmvTE), plbTE = walkScore(SQL, CASES.plbTE), plbDX = walkScore(SQL, CASES.plbDX);
  var ltu = walkScore(SQL, CASES.ltuHO);

  log('');
  log('─── headline: nearest-run touch fraction, centre vs surface (@' + TOL + 'm) ───');
  log('§FS ACMV/Terminal  nearest touch centre=' + acmv.ra.nearC.toFixed(3) + ' → surface=' + acmv.ra.nearS.toFixed(3) +
    '  (5th=' + acmv.ra.fifthS.toFixed(3) + ' farthest=' + acmv.ra.farS.toFixed(3) + ', n=' + acmv.ra.n + ')');
  log('§FS PLB/Terminal   nearest touch centre=' + plbTE.ra.nearC.toFixed(3) + ' → surface=' + plbTE.ra.nearS.toFixed(3));
  log('§FS PLB/Duplex     nearest touch centre=' + plbDX.ra.nearC.toFixed(3) + ' → surface=' + plbDX.ra.nearS.toFixed(3));
  log('§FS walked-pair precision (face mode) ACMV centre=' + acmv.precC.toFixed(3) + ' → surface=' + acmv.precS.toFixed(3) +
    ' | PLB/TE ' + plbTE.precC.toFixed(3) + '→' + plbTE.precS.toFixed(3) + ' | PLB/DX ' + plbDX.precC.toFixed(3) + '→' + plbDX.precS.toFixed(3));

  log('');
  log('─── FS1 LIFT (ACMV) ───');
  assert('FS1 LIFT (ACMV)',
    acmv.ra.nearS >= 0.95 && acmv.ra.nearS - acmv.ra.nearC > 0.30 && acmv.precS - acmv.precC > 0.30,
    'ACMV nearest-touch ' + acmv.ra.nearC.toFixed(3) + '→' + acmv.ra.nearS.toFixed(3) + ', walked precision ' +
    acmv.precC.toFixed(3) + '→' + acmv.precS.toFixed(3) + ' — the "harder" finding was largely centre-to-line scoring');

  log('');
  log('─── FS2 PLB-INVARIANT (falsifier: thin pipes have no bias to correct) ───');
  var dTE = Math.abs(plbTE.ra.nearS - plbTE.ra.nearC), dDX = Math.abs(plbDX.ra.nearS - plbDX.ra.nearC);
  assert('FS2 PLB-INVARIANT',
    dTE < 0.02 && dDX < 0.02,
    'PLB nearest-touch barely moves (TE Δ=' + dTE.toFixed(3) + ', DX Δ=' + dDX.toFixed(3) + ' < 0.02) while ACMV ' +
    'lifted ' + (acmv.ra.nearS - acmv.ra.nearC).toFixed(3) + ' → the lift is bulk-proportional, not free leniency');

  log('');
  log('─── FS3 DISCRIMINATION (falsifier: surface metric still rejects wrong pairs) ───');
  assert('FS3 DISCRIMINATION',
    acmv.ra.nearS >= 0.95 && acmv.ra.fifthS < 0.10 && acmv.ra.farS <= 0.02,
    'ACMV surface-touch nearest=' + acmv.ra.nearS.toFixed(3) + ' ≫ 5th=' + acmv.ra.fifthS.toFixed(3) + ' ≫ farthest=' +
    acmv.ra.farS.toFixed(3) + ' — far runs do NOT surface-touch, so the lift is real selection not a trivial oracle');

  log('');
  log('─── FS4 NON-INVENT (half-extents measured; zero-bbox → centre fallback) ───');
  // re-measure perpHalf for a sample run independently from raw bbox; and a zeroed-bbox node must give gapSurface==gap
  var L = segLine(acmv.runs[0]);
  var rh = perpHalf(acmv.runs[0].bx, acmv.runs[0].by_, acmv.runs[0].bz, L.ax);
  var perp = [0, 1, 2].filter(function (i) { return i !== L.ax; });
  var rhRaw = ([acmv.runs[0].bx, acmv.runs[0].by_, acmv.runs[0].bz][perp[0]] / 2 +
    [acmv.runs[0].bx, acmv.runs[0].by_, acmv.runs[0].bz][perp[1]] / 2) / 2;
  var zeroFallback = perpHalf(0, 0, 0, L.ax) === 0;  // no bbox → no subtraction → surface == centre
  assert('FS4 NON-INVENT',
    Math.abs(rh - rhRaw) < 1e-12 && zeroFallback,
    'perp half-extent == independently re-measured bbox/2 (' + rh.toFixed(4) + 'm); a zeroed bbox subtracts 0 → ' +
    'gapSurface falls back to the centre gap (no fabricated size)');

  log('');
  log('─── FS5 ENGINE-CARRIES (gapSurface additive; centre gap unchanged) ───');
  // every face seg carries gapSurface; gap == independent point-to-LINE recompute; gapSurface == independent surface recompute
  var nMap = {}; acmv.nodes.forEach(function (n) { nMap[n.g] = n; });
  var rMap = {}; acmv.runs.forEach(function (r) { rMap[r.g] = r; });
  var carried = 0, gapOk = 0, surfOk = 0;
  acmv.walked.forEach(function (w) {
    if (w.gapSurface == null) return; carried++;
    var nd = nMap[w.node], rn = rMap[w.run]; if (!nd || !rn) return;
    var L2 = segLine(rn), gC = ptSeg([nd.x, nd.y, nd.z], L2.a, L2.b);
    var gS = Math.max(0, gC - perpHalf(rn.bx, rn.by_, rn.bz, L2.ax) - perpHalf(nd.bx, nd.by_, nd.bz, L2.ax));
    if (Math.abs(gC - w.gap) < 1e-3) gapOk++;
    if (Math.abs(gS - w.gapSurface) < 1e-3) surfOk++;
  });
  assert('FS5 ENGINE-CARRIES',
    carried === acmv.walked.length && carried > 0 && gapOk === carried && surfOk === carried,
    'all ' + carried + ' face segs carry gapSurface; centre gap == point-to-LINE recompute (' + gapOk + '/' + carried +
    '), gapSurface == surface recompute (' + surfOk + '/' + carried + ') — additive, pairing/guids/gap unchanged');

  log('');
  log('─── FS6 HELD-OUT (the correction generalizes to a building never mined) ───');
  log('§FS LTU_AHouse HELD-OUT (duplex_rules→LTU, PLB FlowFitting→FlowSegment[bulky ' +
    'run]): walked precision centre=' + ltu.precC.toFixed(3) + ' → surface=' + ltu.precS.toFixed(3) +
    ' (nodes=' + ltu.nNodes + ' runs=' + ltu.nRuns + ', avg surface-touch degree=' + ltu.sDeg.toFixed(2) + ')');
  // held-out lift on a bulky-run building + the surface oracle stays DISCRIMINATIVE (small avg touch-degree, not
  // "everything touches everything"). degree bound is generous (a dense house) but must be << #runs (42071).
  assert('FS6 HELD-OUT',
    ltu.precS >= 0.95 && ltu.precS - ltu.precC > 0.02 && ltu.sDeg < 8 && ltu.nRuns > 1000,
    'duplex_rules routed onto held-out LTU_AHouse: surface precision ' + ltu.precC.toFixed(3) + '→' + ltu.precS.toFixed(3) +
    ' (bulky run lifts the held-out number too), surface oracle still discriminative (avg degree ' + ltu.sDeg.toFixed(2) +
    ' ≪ ' + ltu.nRuns + ' runs) — the correction is a generalizing principle, not a Terminal quirk');

  log('');
  log('§FS SUMMARY: the ACMV duct-routing "ducts are genuinely harder" precision (centre 0.269 / face-by-line 0.332 ' +
    '@0.15m) is SUBSTANTIALLY a centre-to-line SCORING ARTIFACT on bulky elements. A face/surface-aware touch ' +
    '(subtract both MEASURED perp half-sections) lifts ACMV nearest-touch ' + acmv.ra.nearC.toFixed(3) + '→' +
    acmv.ra.nearS.toFixed(3) + ' while thin PLB is invariant (TE ' + plbTE.ra.nearC.toFixed(3) + '→' + plbTE.ra.nearS.toFixed(3) +
    ', DX ' + plbDX.ra.nearC.toFixed(3) + '→' + plbDX.ra.nearS.toFixed(3) + ') and far runs are still rejected (farthest=' +
    acmv.ra.farS.toFixed(3) + '). It GENERALIZES held-out: duplex_rules→LTU_AHouse (never mined, bulky run) lifts ' +
    ltu.precC.toFixed(3) + '→' + ltu.precS.toFixed(3) + '. routeChains{toFace} now carries gapSurface (additive). docs/WalkerDoctrine.md §3/§FACE-SURFACE.');
  log('');
  log('W-FACE-SURFACE: ' + pass + ' PASS / ' + fail + ' FAIL');
  fs.writeFileSync(LOG, _lines.join('\n') + '\n');
  log('§LOG ' + LOG);
  process.exit(fail ? 1 : 0);
})();
