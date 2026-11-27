// ⚠ DO NOT REMOVE — Witness tests ST1-ST9 (wall stubs take their axis from neighbouring wall pieces). Spec: docs/DXF2BIM_SPEC.md §46. Read test_stub.log after every run; exit code is not evidence.
'use strict';
const crypto = require('crypto'), path = require('path'), fs = require('fs');
const DxfParser = require(path.join(__dirname, '../../deploy/dev/dxf-parser.js'));
const B = require(path.join(__dirname, '../../deploy/dev/dxf2bim.js'));
const hashHex = s => crypto.createHash('sha256').update(s).digest('hex');
const g = (c, v) => c + '\n' + v + '\n';
const poly = (h, l, pts) => g(0, 'LWPOLYLINE') + g(5, h) + g(8, l) + g(100, 'AcDbPolyline') + g(90, pts.length) + g(70, 1) + pts.map(p => g(10, p[0]) + g(20, p[1])).join('');
const rectP = (h, x0, y0, x1, y1) => poly(h, 'A-WALL-FULL', [[x0, y0], [x1, y0], [x1, y1], [x0, y1]]);
const dxf = parts => g(0, 'SECTION') + g(2, 'ENTITIES') + parts.join('') + g(0, 'ENDSEC') + g(0, 'EOF');
const MAP = { version: 1, rules: [{ match: 'exact', pattern: 'A-WALL-FULL', type: 'wall' }, { match: 'exact', pattern: 'A-GLAZ', type: 'glazing' }] };
const CFG = { version: 1, units: 'mm', snap_tol: 0.001, wall_mode: 'footprint', wall: { height: 3.1, base: 0 }, opening: { gap_min: 0.3, gap_max: 2.6, window: { sill: 0.9, height: 1.2 } }, host_tol: 0.1 };
const deps = { DxfParser, hashHex, library: [] };
const run = (parts, cfg) => B.run(dxf(parts), MAP, cfg || CFG, deps);
const wall = (r, h) => r.ops.find(o => o.op_type === 'DXF_WALL' && o.params.handle === h).params;
const gaps = (r, c) => r.ops.filter(o => o.op_type === 'DXF_GAP' && o.params.code === c);
const lines = []; let fails = 0; const J = JSON.stringify;
const check = (id, issue, ok, d) => { if (!ok) fails++; const l = (ok ? 'PASS ' : 'FAIL ') + id + ' | ' + issue + ' | ' + d; lines.push(l); console.log(l); };
// front wall 200 mm deep along x with two openings; the pier P (100 mm along x) sits between them
const L = rectP('L1', 0, 0, 1000, 200), PIER = rectP('P1', 1300, 0, 1400, 200), R = rectP('R1', 1700, 0, 5000, 200);
const base = run([L, PIER, R]);
// ST1
{ const p = wall(base, 'P1');
  check('ST1', 'pier between openings kept the across-wall axis (thickness 0.1 instead of the wall depth 0.2)', p.thickness === 0.2 && p.length === 0.1 && J(p.start) === '[1.3,0.1]' && J(p.end) === '[1.4,0.1]' && p.orient_source === 'neighbour' && p.orient_from === 'L1', 'thickness=' + p.thickness + ' length=' + p.length + ' start=' + J(p.start) + ' end=' + J(p.end) + ' from=' + p.orient_from); }
// ST2 no gap_max in config → unchanged
{ const c = JSON.parse(J(CFG)); delete c.opening; const p = wall(run([L, PIER, R], c), 'P1');
  check('ST2', 'reorientation happened without opening.gap_max (default invented)', p.thickness === 0.1 && p.orient_source === undefined, 'thickness=' + p.thickness); }
// ST3 gap beyond gap_max (pier 3 m from both neighbours)
{ const p = wall(run([rectP('L1', 0, 0, 1000, 200), rectP('P1', 4100, 0, 4200, 200), rectP('R1', 7500, 0, 9000, 200)]), 'P1');
  check('ST3', 'a pier farther than gap_max from every neighbour was reoriented', p.thickness === 0.1 && p.orient_source === undefined, 'thickness=' + p.thickness); }
// ST4 T-joint partition: 100 wide, runs from y 200 up to 3000; its y-range exceeds the strip
{ const r = run([L, rectP('T1', 1300, 200, 1400, 3000), R]), p = wall(r, 'T1');
  check('ST4', 'a perpendicular partition (T-joint) was turned into a stub of the wall', p.thickness === 0.1 && p.length === 2.8 && p.orient_source === undefined, 'thickness=' + p.thickness + ' length=' + p.length); }
// ST5 horizontal neighbour on one side, vertical neighbour (same x-range) above → ambiguous, own orientation kept, logged, piece not lost
{ const r = run([L, rectP('P1', 1300, 0, 1400, 200), rectP('V1', 1300, 400, 1400, 3000)]), p = wall(r, 'P1');
  check('ST5', 'conflicting neighbour votes were resolved silently', p.thickness === 0.1 && p.orient_source === undefined && gaps(r, 'GAP:wall_orientation_ambiguous').length === 1, 'thickness=' + p.thickness + ' ambiguous gaps=' + gaps(r, 'GAP:wall_orientation_ambiguous').length); }
// ST6 square piece between openings: untouched (orientation irrelevant), not a voter
{ const r = run([L, rectP('S1', 1300, 0, 1500, 200), rectP('R1', 1800, 0, 5000, 200)]), p = wall(r, 'S1');
  check('ST6', 'a square piece was reoriented', p.thickness === 0.2 && p.orient_source === undefined && gaps(r, 'GAP:wall_orientation_ambiguous').length === 0, 'thickness=' + p.thickness); }
// ST7 order independence
{ const parts = [L, PIER, R, rectP('B1', 0, 3800, 5000, 4000)], key = r => J(r.ops.map(o => [o.op_type, o.params.handle, o.params.thickness, o.params.length, o.params.start, o.params.code]).sort()); const b = key(run(parts)); let ok = true;
  for (let i = 0; i < 20; i++) if (key(run(parts.slice().sort(() => Math.random() - 0.5))) !== b) ok = false;
  check('ST7', 'orientation result depends on polyline order', ok, '20 shuffles'); }
// ST8 accounting: 3 polylines → 3 walls, no gap lost
{ const w = base.ops.filter(o => o.op_type === 'DXF_WALL').length, gp = base.ops.filter(o => o.op_type === 'DXF_GAP').length;
  check('ST8', 'a polyline vanished when pieces were reoriented', w === 3 && gp === 0, 'walls=' + w + ' gaps=' + gp); }
// ST9 voted by one side only: left neighbour near, right neighbour beyond gap_max
{ const p = wall(run([L, PIER, rectP('R1', 5000, 0, 6000, 200)]), 'P1');
  check('ST9', 'a single near neighbour did not decide (or a far one did)', p.thickness === 0.2 && p.orient_from === 'L1', 'thickness=' + p.thickness + ' from=' + p.orient_from); }
// ST10 vertical wall (x 0..200) with an opening: the pier (100 along y) is 200 wide; T-joint partition horizontal beside it is not turned
{ const r = run([rectP('A1', 0, 0, 200, 1000), rectP('P1', 0, 1300, 200, 1400), rectP('C1', 0, 1700, 200, 5000)]), p = wall(r, 'P1');
  const r2 = run([rectP('A1', 0, 0, 200, 1000), rectP('P1', 100, 1300, 300, 1400), rectP('C1', 0, 1700, 200, 5000)]), p2 = wall(r2, 'P1');
  check('ST10', 'vertical wall: pier not reoriented, or an offset piece (x-range not equal to the strip) was', p.thickness === 0.2 && p.length === 0.1 && J(p.start) === '[0.1,1.3]' && p.orient_source === 'neighbour' && p2.orient_source === undefined, 'in strip: thickness=' + p.thickness + ' start=' + J(p.start) + ' | offset piece orient_source=' + p2.orient_source); }
// ST11 overlapping neighbour is not an opening gap: a piece overlapping the wall strip piece must not take its axis
{ const p = wall(run([rectP('L1', 0, 0, 1000, 200), rectP('P1', 800, 0, 900, 200)]), 'P1');
  const pv = wall(run([rectP('A1', 0, 0, 200, 1000), rectP('P1', 0, 800, 200, 900)]), 'P1');
  check('ST11', 'a piece overlapping a neighbour (negative gap, horizontal or vertical) was reoriented', p.thickness === 0.1 && p.orient_source === undefined && pv.thickness === 0.1 && pv.orient_source === undefined, 'horizontal thickness=' + p.thickness + ' | vertical: thickness=' + pv.thickness + ' source=' + pv.orient_source); }
// ST12-ST14 windows vote (SPEC §49). Windows are glazing rectangles on A-GLAZ.
const glz = (h, x0, y0, x1, y1) => poly(h, 'A-GLAZ', [[x0, y0], [x1, y0], [x1, y1], [x0, y1]]);
const WA = glz('G1', 100, 0, 1000, 200), WB = glz('G2', 1100, 0, 2000, 200);
{ const r = run([rectP('P1', 1000, 0, 1100, 200), WA, WB]), p = wall(r, 'P1');
  check('ST12', 'a pier between two windows (no wall beside it) kept the across-wall axis', p.thickness === 0.2 && p.length === 0.1 && p.orient_source === 'neighbour' && ['G1', 'G2'].includes(p.orient_from), 'thickness=' + p.thickness + ' length=' + p.length + ' from=' + p.orient_from + ' windows=' + r.ops.filter(o => o.params.kind === 'window').length); }
{ const r = run([rectP('P1', 1000, 0, 1100, 200), glz('G1', 100, 50, 1000, 250), glz('G2', 1100, 50, 2000, 250)]), p = wall(r, 'P1');
  check('ST13', 'a window whose cross-axis range is offset from the pier voted', p.thickness === 0.1 && p.orient_source === undefined, 'thickness=' + p.thickness); }
{ const r = run([rectP('P1', 5000, 0, 5100, 200), glz('G1', 100, 0, 1000, 200), glz('G2', 9100, 0, 10000, 200)]), p = wall(r, 'P1');
  check('ST14', 'a window beyond gap_max voted', p.thickness === 0.1 && p.orient_source === undefined, 'thickness=' + p.thickness); }
// ST15 a square window (no axis) must not vote; ST16 vertical strip: pier between two windows of a vertical wall
{ const r = run([rectP('P1', 1000, 0, 1100, 50), glz('G1', 1000, 100, 1100, 200)]), p = wall(r, 'P1');
  check('ST15', 'a square window (no wall axis) voted', p.thickness === 0.05 && p.orient_source === undefined, 'thickness=' + p.thickness + ' windows=' + r.ops.filter(o => o.params.kind === 'window').length); }
{ const r = run([rectP('P1', 0, 1000, 200, 1100), glz('G1', 0, 100, 200, 1000), glz('G2', 0, 1100, 200, 2000)]), p = wall(r, 'P1');
  check('ST16', 'vertical wall: pier between two windows kept the across-wall axis', p.thickness === 0.2 && p.length === 0.1 && J(p.start) === '[0.1,1]' && p.orient_source === 'neighbour', 'thickness=' + p.thickness + ' length=' + p.length + ' start=' + J(p.start)); }
console.log('SUMMARY fail=' + fails); lines.push('SUMMARY fail=' + fails);
fs.writeFileSync(path.join(__dirname, 'test_stub.log'), lines.join('\n') + '\n');
process.exit(fails ? 1 : 0);
