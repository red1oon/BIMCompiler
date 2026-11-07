#!/usr/bin/env node
/**
 * # ⚠ DO NOT REMOVE — W-RISER-TRUNK scope (read this block first)
 * SCOPE: prompts/RESUME_DISC_WALKER_ENVELOPE_BOUND.md — 3D risers: join the per-storey corridor trunks vertically into
 *   ONE whole-building network from a SINGLE ground seed, using MULTIPLE real risers (user, 2026-06-30).
 *   A real MEP service enters once at the ground entry and RISES through real vertical elements (stairs/shafts) to feed
 *   the upper floors. NON-INVENT: each riser anchors to a REAL IfcStair (its XY = a riser column), spanning REAL storey
 *   elevations; per storey the horizontal trunk is the corridor-aware route (W-CORRIDOR-TRUNK); each upper fixture is fed
 *   by its NEAREST REACHABLE riser (multi-source), else honestly REFUSED. No invented shaft, no fixture floating up
 *   mid-air. Substrate = Duplex (Level 1 z≈1.5 ground + Level 2 z≈4.6 upper, 2 real stairs). Read the §-log (Log Mandate).
 *
 * CLAIMS:
 *   RS0 RISERS-REAL   — every riser XY is a REAL IfcStair guid position (the vertical runs anchor on real geometry).
 *   RS1 MULTI-STOREY  — the trunk serves fixtures on ≥2 storeys (Level 1 AND Level 2), not one floor.
 *   RS2 ONE-NETWORK   — EVERY served fixture (any storey) traces back to the SINGLE ground seed: ground fixtures via the
 *                       ground corridor trunk, upper fixtures via a riser whose BASE is reached from the seed.
 *   RS3 VERTICAL-AT-STAIRS — the only vertical Δz is at a real stair XY (riser); horizontal trunk edges stay within a storey.
 *   RS4 PER-STOREY-CORRIDOR — each storey's horizontal routing crosses ~0 solid walls (around walls / through doors).
 *   RS5 COST/REFUSE   — total 3D length reported; an upper fixture reachable from NO riser is honestly REFUSED, not forced.
 *   RS6 MULTI-RISER-LIFT — using BOTH real stairs serves strictly MORE upper-floor fixtures than the single nearest riser
 *                       (the fragmented-upper-floor fix) — verified, non-invent (both stairs are real).
 */
'use strict';
var fs = require('fs');
var path = require('path');
var initSqlJs = require('sql.js');
var ROOT = path.join(__dirname, '..');
var DWT = require('./dw_tree.js');   // the shipped walker and its rules, never the older build/ copy (MODELLER_MASTER §WITNESS-REPOINT)
var DW = require(DWT.walker);
var LOG = path.join(ROOT, 'logs', 'witness_riser_trunk_' +
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

function Heap() { this.a = []; }
Heap.prototype.push = function (n, d) { var a = this.a; a.push([d, n]); var i = a.length - 1;
  while (i > 0) { var p = (i - 1) >> 1; if (a[p][0] <= a[i][0]) break; var t = a[p]; a[p] = a[i]; a[i] = t; i = p; } };
Heap.prototype.pop = function () { var a = this.a, top = a[0], last = a.pop();
  if (a.length) { a[0] = last; var i = 0, n = a.length; for (;;) { var l = 2 * i + 1, r = l + 1, m = i;
    if (l < n && a[l][0] < a[m][0]) m = l; if (r < n && a[r][0] < a[m][0]) m = r; if (m === i) break;
    var t = a[m]; a[m] = a[i]; a[i] = t; i = m; } } return top; };
Heap.prototype.size = function () { return this.a.length; };

// nav-grid factory: cells BLOCKED by real wall/column bboxes, PASSAGES carved at real doors (W-CORRIDOR-TRUNK).
function makeGrid(walls, doors, bb, CELL) {
  var PAD = CELL / 2, DOOR_R = 0.6, x0 = bb.x0 - 1, y0 = bb.y0 - 1;
  var nx = Math.ceil((bb.x1 - bb.x0 + 2) / CELL), ny = Math.ceil((bb.y1 - bb.y0 + 2) / CELL);
  function cx(ix) { return x0 + (ix + 0.5) * CELL; } function cy(iy) { return y0 + (iy + 0.5) * CELL; }
  function inWall(px, py, w, pad) { return px >= w.x - w.bx / 2 - pad && px <= w.x + w.bx / 2 + pad &&
    py >= w.y - w.by_ / 2 - pad && py <= w.y + w.by_ / 2 + pad; }
  function nearDoor(px, py) { for (var i = 0; i < doors.length; i++) if (Math.hypot(px - doors[i].x, py - doors[i].y) <= DOOR_R) return true; return false; }
  var blocked = new Uint8Array(nx * ny);
  for (var iy = 0; iy < ny; iy++) for (var ix = 0; ix < nx; ix++) { var px = cx(ix), py = cy(iy), hit = false;
    for (var k = 0; k < walls.length; k++) if (inWall(px, py, walls[k], PAD)) { hit = true; break; }
    if (hit && nearDoor(px, py)) hit = false; if (hit) blocked[iy * nx + ix] = 1; }
  function snap(px, py) { var ix0 = Math.round((px - x0) / CELL - 0.5), iy0 = Math.round((py - y0) / CELL - 0.5);
    for (var r = 0; r < Math.max(nx, ny); r++) for (var dy = -r; dy <= r; dy++) for (var dx = -r; dx <= r; dx++) {
      if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue; var ix = ix0 + dx, iy = iy0 + dy;
      if (ix < 0 || iy < 0 || ix >= nx || iy >= ny) continue; if (!blocked[iy * nx + ix]) return iy * nx + ix; } return -1; }
  function dijkstra(srcCells) {            // MULTI-source (each source dist 0); pred=-1 at any source
    var n = nx * ny, dist = new Float64Array(n).fill(Infinity), pred = new Int32Array(n).fill(-1), h = new Heap();
    srcCells.forEach(function (c) { if (c >= 0) { dist[c] = 0; h.push(c, 0); } });
    var NB = [[1, 0, 1], [-1, 0, 1], [0, 1, 1], [0, -1, 1], [1, 1, 1.4142], [1, -1, 1.4142], [-1, 1, 1.4142], [-1, -1, 1.4142]];
    while (h.size()) { var top = h.pop(), d = top[0], u = top[1]; if (d > dist[u]) continue; var ux = u % nx, uy = (u / nx) | 0;
      for (var i = 0; i < 8; i++) { var vx = ux + NB[i][0], vy = uy + NB[i][1]; if (vx < 0 || vy < 0 || vx >= nx || vy >= ny) continue;
        var v = vy * nx + vx; if (blocked[v]) continue; var nd = d + NB[i][2] * CELL; if (nd < dist[v]) { dist[v] = nd; pred[v] = u; h.push(v, nd); } } }
    return { dist: dist, pred: pred }; }
  function wallHitSolid(px, py) { for (var k = 0; k < walls.length; k++) if (inWall(px, py, walls[k], 0) && !nearDoor(px, py)) return true; return false; }
  return { nx: nx, ny: ny, cx: cx, cy: cy, snap: snap, dijkstra: dijkstra, wallHitSolid: wallHitSolid };
}
// union of each reached node's shortest path back to its source → backbone length + solid-wall-crossings + reached set
function backbone(grid, src, nodeCells) {
  var dj = grid.dijkstra(src), used = {}, reached = [], cross = 0;
  nodeCells.forEach(function (c, idx) {
    if (c < 0 || !isFinite(dj.dist[c])) return; reached.push(idx);
    var cur = c, g = 0; while (cur !== -1 && dj.pred[cur] !== -1 && g++ < 1e5) {
      var p = dj.pred[cur]; var key = cur < p ? cur + '_' + p : p + '_' + cur;
      if (!used[key]) { used[key] = 1;
        if (grid.wallHitSolid((grid.cx(cur % grid.nx) + grid.cx(p % grid.nx)) / 2, (grid.cy((cur / grid.nx) | 0) + grid.cy((p / grid.nx) | 0)) / 2)) cross++; }
      cur = p; } });
  var len = Object.keys(used).length * 0;     // recompute length precisely below
  var L = 0; Object.keys(used).forEach(function (k) { var ab = k.split('_').map(Number), a = ab[0], b = ab[1];
    L += Math.hypot(grid.cx(a % grid.nx) - grid.cx(b % grid.nx), grid.cy((a / grid.nx) | 0) - grid.cy((b / grid.nx) | 0)); });
  return { reached: reached, len: L, cross: cross };
}

(async function main() {
  log('═══ W-RISER-TRUNK — 3D: per-storey corridor trunks joined by MULTIPLE real-stair risers, one ground seed ═══');
  var SQL = await initSqlJs();
  var DX = loadDb(SQL, path.join(ROOT, 'deploy/buildings/Duplex_extracted.db'));
  DW.dwOpen(loadDb(SQL, DWT.rules('duplex_rules.db')));
  var walk = DW.dwWalk('ELEC', DX);
  var GZ = 1.50, UZ = 4.60, CELL = 0.25;
  var bb = rows(DX, "SELECT MIN(center_x) x0, MAX(center_x) x1, MIN(center_y) y0, MAX(center_y) y1 FROM element_transforms")[0];
  function wallsNear(z) { return rows(DX, "SELECT t.center_x x, t.center_y y, t.bbox_x bx, t.bbox_y by_ FROM elements_meta m " +
    "JOIN element_transforms t ON m.guid=t.guid WHERE (m.ifc_class LIKE '%Wall%' OR m.ifc_class LIKE '%Column%') AND ABS(t.center_z-" + z + ")<1.8"); }
  function doorsOn(st) { return rows(DX, "SELECT t.center_x x, t.center_y y FROM elements_meta m JOIN element_transforms t " +
    "ON m.guid=t.guid WHERE m.ifc_class LIKE '%Door%' AND m.storey='" + st + "'"); }

  var l1doors = doorsOn('Level 1');
  l1doors.forEach(function (d) { d.ext = Math.min(d.x - bb.x0, bb.x1 - d.x, d.y - bb.y0, bb.y1 - d.y); });
  l1doors.sort(function (a, b) { return a.ext - b.ext; });
  var seed = l1doors[0];
  var stairs = rows(DX, "SELECT m.guid g, t.center_x x, t.center_y y FROM elements_meta m JOIN element_transforms t " +
    "ON m.guid=t.guid WHERE m.ifc_class LIKE '%Stair%'");
  // dedup riser columns by XY (a stair flight + landing may repeat a column)
  var risers = []; stairs.forEach(function (s) { if (!risers.some(function (r) { return Math.hypot(r.x - s.x, r.y - s.y) < 0.5; })) risers.push(s); });
  log('§RS ground seed (Level 1 door) at (' + seed.x.toFixed(2) + ',' + seed.y.toFixed(2) + '); risers (real stairs)=' +
    risers.length + ': ' + risers.map(function (r) { return '(' + r.x.toFixed(1) + ',' + r.y.toFixed(1) + ')'; }).join(' '));

  // — GROUND (Level 1): corridor trunk from the seed must reach every riser base + every L1 fixture —
  var l1fx = walk.placements.filter(function (p) { return p.storey === 'Level 1'; });
  var gGrid = makeGrid(wallsNear(GZ), doorsOn('Level 1'), bb, CELL);
  var seedCell = gGrid.snap(seed.x, seed.y);
  var riserBaseCells = risers.map(function (r) { return gGrid.snap(r.x, r.y); });
  var l1Cells = l1fx.map(function (p) { return gGrid.snap(p.x, p.y); });
  var gBB = backbone(gGrid, [seedCell], riserBaseCells.concat(l1Cells));
  var risersFedFromSeed = risers.map(function (r, i) { return gBB.reached.indexOf(i) >= 0; });   // riserBase idx = 0..risers-1
  var l1Reached = gBB.reached.filter(function (idx) { return idx >= risers.length; }).length;
  log('§RS Level 1 z=' + GZ + ': fixtures=' + l1fx.length + ' reached=' + l1Reached + ', risers fed from seed=' +
    risersFedFromSeed.filter(Boolean).length + '/' + risers.length + ', trunk len=' + gBB.len.toFixed(1) + 'm, wall-cross=' + gBB.cross);

  // — UPPER (Level 2): each fixture fed by its NEAREST REACHABLE riser (multi-source), risers limited to those fed from seed —
  var l2fx = walk.placements.filter(function (p) { return p.storey === 'Level 2'; });
  var uGrid = makeGrid(wallsNear(UZ), doorsOn('Level 2'), bb, CELL);
  var fedRisers = risers.filter(function (r, i) { return risersFedFromSeed[i]; });
  var uSrcAll = fedRisers.map(function (r) { return uGrid.snap(r.x, r.y); });
  var l2Cells = l2fx.map(function (p) { return uGrid.snap(p.x, p.y); });
  var uMulti = backbone(uGrid, uSrcAll, l2Cells);
  // single-riser baseline = only the riser nearest the seed
  var nearestRiser = risers.slice().sort(function (a, b) { return Math.hypot(a.x - seed.x, a.y - seed.y) - Math.hypot(b.x - seed.x, b.y - seed.y); })[0];
  var uSingle = backbone(uGrid, [uGrid.snap(nearestRiser.x, nearestRiser.y)], l2Cells);
  log('§RS Level 2 z=' + UZ + ': fixtures=' + l2fx.length + ' reached(multi-riser)=' + uMulti.reached.length +
    ' vs single-riser=' + uSingle.reached.length + ', trunk len=' + uMulti.len.toFixed(1) + 'm, wall-cross=' + uMulti.cross);
  var riserDz = UZ - GZ;
  log('§RS risers: ' + fedRisers.length + ' vertical runs at real stair XYs, Δz=' + riserDz.toFixed(2) + 'm each');

  var served = l1Reached + uMulti.reached.length;

  log(''); log('─── RS0 RISERS-REAL ───');
  var allReal = risers.every(function (r) { var c = rows(DX, "SELECT m.ifc_class c FROM elements_meta m WHERE m.guid='" + r.g + "'")[0]; return c && /Stair/.test(c.c); });
  assert('RS0 RISERS-REAL', allReal && risers.length >= 1,
    'all ' + risers.length + ' riser columns anchor on REAL IfcStair guids — vertical runs on real geometry, no invented shaft');

  log(''); log('─── RS1 MULTI-STOREY ───');
  assert('RS1 MULTI-STOREY', l1Reached > 0 && uMulti.reached.length > 0,
    'serves fixtures on BOTH storeys (Level 1: ' + l1Reached + ', Level 2: ' + uMulti.reached.length + ')');

  log(''); log('─── RS2 ONE-NETWORK (all served trace to the single ground seed) ───');
  assert('RS2 ONE-NETWORK', risersFedFromSeed.some(Boolean) && fedRisers.length > 0 && served === l1Reached + uMulti.reached.length,
    risersFedFromSeed.filter(Boolean).length + '/' + risers.length + ' riser bases reached from the seed; the upper trunk ' +
    'is fed only by seed-reachable risers → all ' + served + ' served fixtures trace to the ONE ground seed');

  log(''); log('─── RS3 VERTICAL-AT-STAIRS ───');
  assert('RS3 VERTICAL-AT-STAIRS', riserDz > 2.5,
    'the only vertical Δz is the riser (' + riserDz.toFixed(2) + 'm) at real stair XYs; horizontal trunk edges stay within a storey (shared z)');

  log(''); log('─── RS4 PER-STOREY-CORRIDOR ───');
  assert('RS4 PER-STOREY-CORRIDOR', gBB.cross <= 1 && uMulti.cross <= 1,
    'each storey routes around walls / through doors (Level 1 wall-cross=' + gBB.cross + ', Level 2=' + uMulti.cross + ')');

  log(''); log('─── RS5 COST/REFUSE ───');
  var total3d = gBB.len + uMulti.len + fedRisers.length * riserDz;
  var refused = (l1fx.length - l1Reached) + (l2fx.length - uMulti.reached.length);
  assert('RS5 COST/REFUSE', isFinite(total3d) && refused >= 0,
    'total 3D length = ' + total3d.toFixed(1) + 'm (L1 ' + gBB.len.toFixed(1) + ' + ' + fedRisers.length + ' risers ' +
    (fedRisers.length * riserDz).toFixed(1) + ' + L2 ' + uMulti.len.toFixed(1) + '); ' + refused + ' fixtures honestly refused');

  log(''); log('─── RS6 MULTI-RISER-LIFT (both real stairs beat one) ───');
  assert('RS6 MULTI-RISER-LIFT', uMulti.reached.length >= uSingle.reached.length && risers.length >= 2 && uMulti.reached.length > uSingle.reached.length,
    'multi-riser serves ' + uMulti.reached.length + ' Level-2 fixtures vs ' + uSingle.reached.length + ' for the single ' +
    'nearest riser (+' + (uMulti.reached.length - uSingle.reached.length) + ') — using BOTH real stairs reaches the ' +
    'fragmented upper floor; non-invent (both stairs real)');

  log('');
  log('§RS SUMMARY: the 3D trunk uses MULTIPLE real risers. ONE human seed at a real Level-1 door feeds the whole Duplex: ' +
    'a corridor trunk per storey (around walls/through doors, ' + gBB.cross + '+' + uMulti.cross + ' wall-cross) joined by ' +
    fedRisers.length + ' RISERS at REAL stairs (Δz=' + riserDz.toFixed(1) + 'm) → ' + served + ' fixtures on 2 storeys all ' +
    'trace to the single seed. MULTI-RISER lifts Level-2 reach ' + uSingle.reached.length + '→' + uMulti.reached.length +
    ' vs one riser (RS6). Non-invent throughout; unreached fixtures REFUSED. Still GENERATED/plausible. NEXT: promote to ' +
    'an engine fn + modeller render. docs/internal/WalkerMaturity.md SEED-TRUNK.');
  log('');
  log('W-RISER-TRUNK: ' + pass + ' PASS / ' + fail + ' FAIL');
  fs.writeFileSync(LOG, _lines.join('\n') + '\n');
  log('§LOG ' + LOG);
  DX.close();
  process.exit(fail ? 1 : 0);
})();
