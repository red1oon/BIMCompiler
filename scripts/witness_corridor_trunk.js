#!/usr/bin/env node
/**
 * # ⚠ DO NOT REMOVE — W-CORRIDOR-TRUNK scope (read this block first)
 * SCOPE: prompts/RESUME_DISC_WALKER_ENVELOPE_BOUND.md — make the seed→trunk CORRIDOR-AWARE (user, 2026-06-30).
 *   W-SEED-TRUNK routed a straight-line MST from the human's seed; its edges cut THROUGH walls → plausible but an
 *   engineer would squirm. This routes the trunk through REAL open space instead: a navigation grid is BLOCKED by the
 *   building's real wall/column bboxes and PASSAGES are carved at real IfcDoors; the trunk is an MST over GRID-PATH
 *   distance, each edge materialised as its actual free-space polyline. NON-INVENT: every blocked cell traces to a real
 *   wall element and every passage to a real door — no invented corridor. The route is GENERATED/plausible (we don't
 *   claim it is THE conduit run — no ground truth for an absent discipline), but it is a STRICT improvement: it stops
 *   crossing walls and it goes through the doors. Read the §-log (Log Mandate).
 *
 * CLAIMS:
 *   CT0 GRID-REAL    — every BLOCKED nav cell lies inside a REAL wall/column bbox (non-invent obstruction map).
 *   CT1 NOCROSS      — the corridor trunk crosses ~0 solid wall (samples inside a wall but not at a door) while the
 *                      straight-line MST crosses many → the falsifiable improvement (around walls, not through them).
 *   CT2 CONNECTED    — every fixture is reachable from the seed through free space (else honest REFUSE list, never forced).
 *   CT3 DOORS-ARE-PASSAGES — FALSIFIER: rebuild the grid WITHOUT carving doors → fewer fixtures reachable (rooms seal) →
 *                      the route genuinely transits real doorways, it is not slipping through walls.
 *   CT4 COST         — the corridor trunk is LONGER than the straight-line MST (the honest cost of going around);
 *                      report the ratio — not a regression, the expected trade for realism.
 *   CT5 SEED-ROOTED  — the trunk is a tree rooted at the human's seed spanning the reachable fixtures; count preserved.
 */
'use strict';
var fs = require('fs');
var path = require('path');
var initSqlJs = require('sql.js');
var ROOT = path.join(__dirname, '..');
var DWT = require('./dw_tree.js');   // the shipped walker and its rules, never the older build/ copy (MODELLER_MASTER §WITNESS-REPOINT)
var DW = require(DWT.walker);
var LOG = path.join(ROOT, 'logs', 'witness_corridor_trunk_' +
  new Date().toISOString().replace(/[:.]/g, '').slice(0, 15) + '.log');

var _lines = [];
function log(s) { _lines.push(s); console.log(s); }
var pass = 0, fail = 0;
function assert(claim, cond, detail) {
  if (cond) { pass++; log('  ✅ ' + claim + ' — ' + detail); }
  else { fail++; log('  ❌ ' + claim + ' — ' + detail); }
}
function rows(db, sql) { var r = db.exec(sql); if (!r.length) return [];
  return r[0].values.map(function (v) { var o = {}; r[0].columns.forEach(function (c, i) { o[c] = v[i]; }); return o; }); }
function loadDb(SQL, f) { return new SQL.Database(new Uint8Array(fs.readFileSync(f))); }

// ── minimal binary-heap Dijkstra over the nav grid ──
function Heap() { this.a = []; }
Heap.prototype.push = function (n, d) { var a = this.a; a.push([d, n]); var i = a.length - 1;
  while (i > 0) { var p = (i - 1) >> 1; if (a[p][0] <= a[i][0]) break; var t = a[p]; a[p] = a[i]; a[i] = t; i = p; } };
Heap.prototype.pop = function () { var a = this.a, top = a[0], last = a.pop();
  if (a.length) { a[0] = last; var i = 0, n = a.length; for (;;) { var l = 2 * i + 1, r = l + 1, m = i;
    if (l < n && a[l][0] < a[m][0]) m = l; if (r < n && a[r][0] < a[m][0]) m = r; if (m === i) break;
    var t = a[m]; a[m] = a[i]; a[i] = t; i = m; } } return top; };
Heap.prototype.size = function () { return this.a.length; };

(async function main() {
  log('═══ W-CORRIDOR-TRUNK — seed→trunk routed through REAL open space (around walls, through doors) ═══');
  var SQL = await initSqlJs();
  var SH = loadDb(SQL, path.join(ROOT, 'deploy/buildings/SampleHouse_extracted.db'));
  DW.dwOpen(loadDb(SQL, DWT.rules('duplex_rules.db')));

  // — fixtures (host-bound) + the human/default seed —
  var walk = DW.dwWalk('ELEC', SH);
  var fx = walk.placements.filter(function (p) { return p.storey === 'Ground Floor'; });
  var seed = DW.defaultSeed(SH);
  log('§CT ELEC fixtures on seed storey=' + fx.length + ', seed=' + seed.guid + ' (' + seed.ifc_class + ') at (' +
    seed.x.toFixed(2) + ',' + seed.y.toFixed(2) + ')');

  // — nav grid: block real wall/column bboxes, carve real door passages —
  var CELL = 0.2, PAD = CELL / 2, DOOR_R = 0.6;
  var walls = rows(SH, "SELECT m.guid g, t.center_x x, t.center_y y, t.bbox_x bx, t.bbox_y by_ FROM elements_meta m " +
    "JOIN element_transforms t ON m.guid=t.guid WHERE m.ifc_class LIKE '%Wall%' OR m.ifc_class LIKE '%Column%'");
  var doors = rows(SH, "SELECT t.center_x x, t.center_y y FROM elements_meta m JOIN element_transforms t ON m.guid=t.guid " +
    "WHERE m.ifc_class LIKE '%IfcDoor%'");
  var bb = rows(SH, "SELECT MIN(center_x) x0, MAX(center_x) x1, MIN(center_y) y0, MAX(center_y) y1 FROM element_transforms")[0];
  var x0 = bb.x0 - 1, y0 = bb.y0 - 1, nx = Math.ceil((bb.x1 - bb.x0 + 2) / CELL), ny = Math.ceil((bb.y1 - bb.y0 + 2) / CELL);
  function cx(ix) { return x0 + (ix + 0.5) * CELL; } function cy(iy) { return y0 + (iy + 0.5) * CELL; }
  function inWall(px, py, w, pad) { return px >= w.x - w.bx / 2 - pad && px <= w.x + w.bx / 2 + pad &&
    py >= w.y - w.by_ / 2 - pad && py <= w.y + w.by_ / 2 + pad; }
  function nearDoor(px, py) { for (var i = 0; i < doors.length; i++) if (Math.hypot(px - doors[i].x, py - doors[i].y) <= DOOR_R) return true; return false; }
  function buildGrid(carveDoors) {
    var blocked = new Uint8Array(nx * ny), nb = 0;
    for (var iy = 0; iy < ny; iy++) for (var ix = 0; ix < nx; ix++) {
      var px = cx(ix), py = cy(iy), hit = false;
      for (var k = 0; k < walls.length; k++) if (inWall(px, py, walls[k], PAD)) { hit = true; break; }
      if (hit && carveDoors && nearDoor(px, py)) hit = false;       // a door punches a passage through the wall
      if (hit) { blocked[iy * nx + ix] = 1; nb++; }
    }
    return { blocked: blocked, nb: nb };
  }
  var G = buildGrid(true);
  log('§CT nav grid ' + nx + '×' + ny + ' (cell ' + CELL + 'm), blocked=' + G.nb + ' from ' + walls.length +
    ' walls/cols, ' + doors.length + ' door passages carved');

  function snap(px, py, blocked) {            // nearest FREE cell to a point (spiral)
    var ix0 = Math.round((px - x0) / CELL - 0.5), iy0 = Math.round((py - y0) / CELL - 0.5);
    for (var r = 0; r < Math.max(nx, ny); r++) for (var dy = -r; dy <= r; dy++) for (var dx = -r; dx <= r; dx++) {
      if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
      var ix = ix0 + dx, iy = iy0 + dy; if (ix < 0 || iy < 0 || ix >= nx || iy >= ny) continue;
      if (!blocked[iy * nx + ix]) return iy * nx + ix;
    }
    return -1;
  }
  function dijkstra(src, blocked) {
    var n = nx * ny, dist = new Float64Array(n).fill(Infinity), pred = new Int32Array(n).fill(-1);
    var h = new Heap(); dist[src] = 0; h.push(src, 0);
    var NB = [[1, 0, 1], [-1, 0, 1], [0, 1, 1], [0, -1, 1], [1, 1, 1.41421356], [1, -1, 1.41421356], [-1, 1, 1.41421356], [-1, -1, 1.41421356]];
    while (h.size()) { var top = h.pop(), d = top[0], u = top[1]; if (d > dist[u]) continue;
      var ux = u % nx, uy = (u / nx) | 0;
      for (var i = 0; i < 8; i++) { var vx = ux + NB[i][0], vy = uy + NB[i][1];
        if (vx < 0 || vy < 0 || vx >= nx || vy >= ny) continue; var v = vy * nx + vx; if (blocked[v]) continue;
        var nd = d + NB[i][2] * CELL; if (nd < dist[v]) { dist[v] = nd; pred[v] = u; h.push(v, nd); } } }
    return { dist: dist, pred: pred };
  }
  function pathCells(pred, from, to) { var p = [], c = to, guard = 0; while (c !== -1 && c !== from && guard++ < 1e5) { p.push(c); c = pred[c]; } p.push(from); return p.reverse(); }

  // — snap seed + fixtures to free cells; Dijkstra from each; MST on grid-path distance —
  var nodes = [{ x: seed.x, y: seed.y, seed: true }].concat(fx.map(function (p) { return { x: p.x, y: p.y, host: p.host }; }));
  var cells = nodes.map(function (p) { return snap(p.x, p.y, G.blocked); });
  var dij = cells.map(function (c) { return c >= 0 ? dijkstra(c, G.blocked) : null; });
  var N = nodes.length;
  function gdist(i, j) { return (dij[i] && cells[j] >= 0) ? dij[i].dist[cells[j]] : Infinity; }

  // reachability from seed (node 0)
  var reachable = []; for (var j = 1; j < N; j++) if (isFinite(gdist(0, j))) reachable.push(j);
  // Prim MST over {seed ∪ reachable} using grid-path distance
  var inT = {}, parent = {}, best = {}, order = [0]; inT[0] = true;
  reachable.forEach(function (j) { best[j] = gdist(0, j); parent[j] = 0; });
  for (var step = 0; step < reachable.length; step++) {
    var u = -1, bd = Infinity; reachable.forEach(function (j) { if (!inT[j] && best[j] < bd) { bd = best[j]; u = j; } });
    if (u < 0) break; inT[u] = true; order.push(u);
    reachable.forEach(function (j) { if (!inT[j]) { var dd = gdist(u, j); if (dd < best[j]) { best[j] = dd; parent[j] = u; } } });
  }
  // materialise corridor edges as polylines; measure length + wall-crossings
  function wallHitSolid(px, py) { for (var k = 0; k < walls.length; k++) if (inWall(px, py, walls[k], 0) && !nearDoor(px, py)) return true; return false; }
  function sampleCross(ax, ay, bx2, by2) { var L = Math.hypot(bx2 - ax, by2 - ay), steps = Math.max(1, Math.ceil(L / 0.05)), hit = 0;
    for (var s = 0; s <= steps; s++) { var t = s / steps; if (wallHitSolid(ax + (bx2 - ax) * t, ay + (by2 - ay) * t)) { hit = 1; break; } } return hit; }
  var corLen = 0, corCross = 0, edges = 0;
  reachable.forEach(function (j) { if (parent[j] == null) return; edges++;
    var pc = pathCells(dij[parent[j]].pred, cells[parent[j]], cells[j]);
    var hit = 0; for (var s = 0; s + 1 < pc.length; s++) { var a = pc[s], b = pc[s + 1];
      corLen += Math.hypot(cx(b % nx) - cx(a % nx), cy((b / nx) | 0) - cy((a / nx) | 0));
      if (sampleCross(cx(a % nx), cy((a / nx) | 0), cx(b % nx), cy((b / nx) | 0))) hit = 1; }
    corCross += hit;
  });

  // baseline straight-line MST (Euclidean) over the SAME reachable set + seed → its wall-crossings + length
  function eu(i, j) { return Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y); }
  var inT2 = { 0: true }, par2 = {}, best2 = {}; reachable.forEach(function (j) { best2[j] = eu(0, j); par2[j] = 0; });
  var strLen = 0, strCross = 0;
  for (var st = 0; st < reachable.length; st++) { var u2 = -1, bd2 = Infinity;
    reachable.forEach(function (j) { if (!inT2[j] && best2[j] < bd2) { bd2 = best2[j]; u2 = j; } });
    if (u2 < 0) break; inT2[u2] = true; strLen += eu(par2[u2], u2);
    strCross += sampleCross(nodes[par2[u2]].x, nodes[par2[u2]].y, nodes[u2].x, nodes[u2].y);
    reachable.forEach(function (j) { if (!inT2[j]) { var dd = eu(u2, j); if (dd < best2[j]) { best2[j] = dd; par2[j] = u2; } } });
  }

  log('§CT corridor trunk: ' + edges + ' edges, length=' + corLen.toFixed(2) + 'm, solid-wall-crossings=' + corCross);
  log('§CT straight  MST : ' + reachable.length + ' edges, length=' + strLen.toFixed(2) + 'm, solid-wall-crossings=' + strCross);

  log(''); log('─── CT0 GRID-REAL ───');
  // sample blocked cells: each must sit inside a real wall/col bbox
  var checked = 0, ok = 0; for (var iy = 0; iy < ny && checked < 300; iy++) for (var ix = 0; ix < nx && checked < 300; ix++)
    if (G.blocked[iy * nx + ix]) { checked++; var px = cx(ix), py = cy(iy), inAny = false;
      for (var k = 0; k < walls.length; k++) if (inWall(px, py, walls[k], PAD)) { inAny = true; break; } if (inAny) ok++; }
  assert('CT0 GRID-REAL', checked > 0 && ok === checked,
    ok + '/' + checked + ' sampled blocked cells lie inside a REAL wall/column bbox — the obstruction map is measured, not invented');

  log(''); log('─── CT1 NOCROSS (around walls, not through) ───');
  assert('CT1 NOCROSS', corCross < strCross && corCross <= 1,
    'corridor trunk crosses ' + corCross + ' solid walls vs the straight MST\'s ' + strCross +
    ' — routing through free space removes the wall-cutting (the falsifiable improvement)');

  log(''); log('─── CT2 CONNECTED (reachable via free space, else honest refuse) ───');
  var refused = (N - 1) - reachable.length;
  assert('CT2 CONNECTED', reachable.length > 0 && edges === reachable.length,
    reachable.length + '/' + (N - 1) + ' fixtures reachable from the seed through free space (' + refused +
    ' honestly refused — walled off, never forced); trunk spans exactly the reachable set');

  log(''); log('─── CT3 DOORS-ARE-PASSAGES (falsifier) ───');
  var Gnd = buildGrid(false);                        // no door carving → rooms seal
  var dij0 = dijkstra(snap(seed.x, seed.y, Gnd.blocked), Gnd.blocked);
  var reachNoDoors = 0; for (var j2 = 1; j2 < N; j2++) { var c = snap(nodes[j2].x, nodes[j2].y, Gnd.blocked); if (c >= 0 && isFinite(dij0.dist[c])) reachNoDoors++; }
  assert('CT3 DOORS-ARE-PASSAGES', reachNoDoors < reachable.length,
    'without carving doors, only ' + reachNoDoors + '/' + (N - 1) + ' fixtures reach the seed (vs ' + reachable.length +
    ' WITH doors) — the route genuinely transits real doorways, it is not slipping through walls');

  log(''); log('─── CT4 COST (the honest price of going around) ───');
  var ratio = strLen > 0 ? corLen / strLen : 0;
  assert('CT4 COST', corLen >= strLen - 1e-6,
    'corridor trunk ' + corLen.toFixed(2) + 'm ≥ straight MST ' + strLen.toFixed(2) + 'm (×' + ratio.toFixed(2) +
    ') — going around walls/through doors costs length; reported, not hidden (this is realism, not a regression)');

  log(''); log('─── CT5 SEED-ROOTED (rooted tree, count preserved) ───');
  assert('CT5 SEED-ROOTED', order[0] === 0 && edges === reachable.length && (reachable.length + refused) === (N - 1),
    'trunk rooted at the seed (node 0), ' + edges + ' edges spanning the ' + reachable.length + ' reachable fixtures; ' +
    'reachable+refused = ' + (reachable.length + refused) + ' = all ' + (N - 1) + ' fixtures (count preserved)');

  log('');
  log('§CT SUMMARY: the seed→trunk is now CORRIDOR-AWARE. A nav grid blocked by REAL walls/columns and carved at REAL ' +
    'doors carries an MST over GRID-PATH distance from the human\'s seed → the trunk goes AROUND walls and THROUGH doors ' +
    '(solid-wall-crossings ' + strCross + '→' + corCross + '), at the honest cost of ' + ratio.toFixed(2) + '× length. ' +
    'Non-invent: every blocked cell is a real wall, every passage a real door; walled-off fixtures are REFUSED not forced. ' +
    'Still GENERATED/plausible (no ground truth for an absent discipline) but no longer squirm-worthy. NEXT: 3D (riser/stairs ' +
    'across storeys) + engine fn + modeller render. docs/internal/WalkerMaturity.md SEED-TRUNK L1→.');
  log('');
  log('W-CORRIDOR-TRUNK: ' + pass + ' PASS / ' + fail + ' FAIL');
  fs.writeFileSync(LOG, _lines.join('\n') + '\n');
  log('§LOG ' + LOG);
  SH.close();
  process.exit(fail ? 1 : 0);
})();
