// ⚠ DO NOT REMOVE — Witness tests FP1-FP6 (footprint wall mode). Spec: docs/DXF2BIM_SPEC.md §15. Read the log after every run.
'use strict';
const crypto = require('crypto'), path = require('path');
const DxfParser = require(path.join(__dirname, '../../deploy/dev/dxf-parser.js'));
const D = require(path.join(__dirname, '../../deploy/dev/dxf2bim.js'));
const hashHex = s => crypto.createHash('sha256').update(s).digest('hex');
const g = (c, v) => c + '\n' + v + '\n';
const poly = (h, l, pts, closed) => g(0, 'LWPOLYLINE') + g(5, h) + g(8, l) + g(100, 'AcDbPolyline') + g(90, pts.length) + g(70, closed ? 1 : 0) + pts.map(p => g(10, p[0]) + g(20, p[1])).join('');
const line = (h, l, x1, y1, x2, y2) => g(0, 'LINE') + g(5, h) + g(8, l) + g(10, x1) + g(20, y1) + g(30, 0) + g(11, x2) + g(21, y2) + g(31, 0);
const dxf = parts => g(0, 'SECTION') + g(2, 'ENTITIES') + parts.join('') + g(0, 'ENDSEC') + g(0, 'EOF');
const MAP = { version: 1, rules: [{ match: 'exact', pattern: 'A-WALL-FULL', type: 'wall' }, { match: 'exact', pattern: 'A-WALL-PRTN', type: 'wall' }, { match: 'exact', pattern: 'A-WALL-PATT', type: 'ignore' }] };
const CFG = { version: 1, units: 'mm', snap_tol: 0.0005, wall_mode: 'footprint', wall: { height: 3.1, base: 0 } };   // no wall.thickness on purpose (FP6)
const go = (parts, cfg, map) => D.run(dxf(parts), map || MAP, cfg || CFG, { DxfParser, hashHex, library: [] });
let fails = 0; const check = (id, issue, ok, d) => { if (!ok) fails++; console.log((ok ? 'PASS ' : 'FAIL ') + id + ' | ' + issue + ' | ' + d); };
const walls = r => r.ops.filter(o => o.op_type === 'DXF_WALL'), gaps = (r, h) => r.ops.filter(o => o.op_type === 'DXF_GAP' && o.params.handle === h).map(o => o.params.code);

// FP1: 5000 x 200 mm rectangle at (0,0) with extra collinear vertices and repeated start (as the real writer emits). Hand: length 5, thickness 0.2, axis y=0.1 from x 0 to 5.
const r1 = go([poly('A1', 'A-WALL-FULL', [[0, 0], [2500, 0], [5000, 0], [5000, 200], [2500, 200], [0, 200], [0, 0]], true)]);
const w1 = walls(r1)[0];
check('FP1', 'footprint rectangle mis-read (length/thickness/axis)', !!w1 && w1.params.length === 5 && w1.params.thickness === 0.2 && w1.params.start.join() === '0,0.1' && w1.params.end.join() === '5,0.1' && w1.params.footprint === true,
  w1 ? 'len=' + w1.params.length + ' t=' + w1.params.thickness + ' ' + w1.params.start + '->' + w1.params.end : 'no wall');
// FP2: vertical 200 x 3000 at (1000,-4000). Hand: length 3, thickness 0.2, axis x=1.1 from y -4 to -1.
const r2 = go([poly('A2', 'A-WALL-PRTN', [[1000, -4000], [1200, -4000], [1200, -1000], [1000, -1000]], true)]);
const w2 = walls(r2)[0];
check('FP2', 'vertical footprint axis wrong', !!w2 && w2.params.length === 3 && w2.params.thickness === 0.2 && w2.params.start.join() === '1.1,-4' && w2.params.end.join() === '1.1,-1', w2 ? w2.params.start + '->' + w2.params.end : 'no wall');
// FP3 (revised for §18): an outline with a diagonal edge is neither a rectangle nor rectilinear -> gap
const r3 = go([poly('A3', 'A-WALL-FULL', [[0, 0], [2000, 0], [2000, 500], [1000, 1000], [0, 500]], true)]);
check('FP3', 'non-rectangular outline silently boxed', walls(r3).length === 0 && gaps(r3, 'A3').join() === 'GAP:wall_footprint_not_rect', 'gaps=' + gaps(r3, 'A3'));
// FP4: LINE and open polyline on a wall layer in footprint mode
const r4 = go([line('A4', 'A-WALL-FULL', 0, 0, 1000, 0), poly('A5', 'A-WALL-FULL', [[0, 0], [1000, 0], [1000, 300]], false)]);
check('FP4', 'centreline guessed from strokes in footprint mode', walls(r4).length === 0 && gaps(r4, 'A4').join() === 'GAP:wall_not_footprint' && gaps(r4, 'A5').join() === 'GAP:wall_not_footprint', 'gaps=' + gaps(r4, 'A4') + ' ' + gaps(r4, 'A5'));
// FP5: duplicate rectangle on a second wall layer (hatch copy mapped as wall by mistake): lowest handle wins
const rect = [[0, 0], [1000, 0], [1000, 200], [0, 200]];
const MAP5 = { version: 1, rules: [{ match: 'exact', pattern: 'A-WALL-FULL', type: 'wall' }, { match: 'exact', pattern: 'A-WALL-PATT', type: 'wall' }] };
const r5 = go([poly('B2', 'A-WALL-PATT', rect, true), poly('B1', 'A-WALL-FULL', rect, true)], CFG, MAP5);
check('FP5', 'duplicate footprint double counted', walls(r5).length === 1 && walls(r5)[0].params.handle === 'B1' && gaps(r5, 'B2').join() === 'GAP:duplicate_footprint', 'walls=' + walls(r5).length + ' kept=' + (walls(r5)[0] && walls(r5)[0].params.handle) + ' gaps(B2)=' + gaps(r5, 'B2'));
// FP6: thickness comes from the drawing, a conflicting config thickness is ignored
const cfg6 = JSON.parse(JSON.stringify(CFG)); cfg6.wall.thickness = 0.9;
const r6 = go([poly('A1', 'A-WALL-FULL', [[0, 0], [5000, 0], [5000, 200], [0, 200]], true)], cfg6);
check('FP6', 'config thickness overrides the drawing', walls(r6)[0].params.thickness === 0.2 && walls(r1)[0].params.thickness === 0.2, 'thickness=' + walls(r6)[0].params.thickness + ' with config.thickness=0.9; absent-config run produced no gap');
// FP7: 19 mm strip (cabinet outline) filtered only when the user supplies wall.min_thickness
const strip = [poly('C1', 'A-WALL-PRTN', [[0, 0], [800, 0], [800, 19], [0, 19]], true)];
const cfg7 = JSON.parse(JSON.stringify(CFG)); cfg7.wall.min_thickness = 0.05;
const r7 = go(strip, cfg7), r7b = go(strip);
check('FP7', 'thin strip kept as a wall despite min_thickness / hidden default filter', walls(r7).length === 0 && gaps(r7, 'C1').join() === 'GAP:wall_below_min_thickness' && walls(r7b).length === 1,
  'with min_thickness=0.05: walls=' + walls(r7).length + ' gaps=' + gaps(r7, 'C1') + ' | key absent: walls=' + walls(r7b).length);
// ---- §18 rectilinear split ----
const area = P => { let a = 0; for (let i = 0; i < P.length; i++) { const q = P[(i + 1) % P.length]; a += P[i][0] * q[1] - q[0] * P[i][1]; } return Math.abs(a) / 2; };
const pieces = r => walls(r).map(o => o.params);
const pieceArea = r => pieces(r).reduce((n, q) => n + q.length * q.thickness, 0);
const L = [[0, 0], [2000, 0], [2000, 500], [500, 500], [500, 2000], [0, 2000]];
const U = [[0, 0], [3000, 0], [3000, 1000], [2000, 1000], [2000, 200], [1000, 200], [1000, 1000], [0, 1000]];
// FP8 L-shape: A 2.0 x 0.5 axis y 0.25 x 0..2 ; B 1.5 x 0.5 axis x 0.25 y 0.5..2.0 (hand)
const r8 = go([poly('D1', 'A-WALL-FULL', L, true)]); const p8 = pieces(r8);
check('FP8', 'L-shaped outline split wrongly', p8.length === 2 && p8[0].start.join() === '0,0.25' && p8[0].end.join() === '2,0.25' && p8[0].thickness === 0.5 &&
  p8[1].start.join() === '0.25,0.5' && p8[1].end.join() === '0.25,2' && p8[1].length === 1.5 && p8.every(q => q.split_from === true),
  p8.map(q => q.start + '->' + q.end + ' t=' + q.thickness).join(' | '));
// FP9 U-shape: (0,0,3000,200) (0,200,1000,1000) (2000,200,3000,1000) in mm
const r9 = go([poly('D2', 'A-WALL-FULL', U, true)]); const p9 = pieces(r9);
check('FP9', 'U-shaped outline split wrongly', p9.length === 3 && JSON.stringify(p9.map(q => q.rect)) === JSON.stringify([[0, 0, 3, 0.2], [0, 0.2, 1, 1], [2, 0.2, 3, 1]]), JSON.stringify(p9.map(q => q.rect)));
// FP10 area conservation (pieces tile the polygon; polygon area computed independently in metres)
const mm = P => P.map(q => [q[0] / 1000, q[1] / 1000]);
const notch = [[0, 0], [4000, 0], [4000, 3000], [3000, 3000], [3000, 1000], [1000, 1000], [1000, 3000], [0, 3000]];
const r10 = go([poly('D3', 'A-WALL-FULL', notch, true)]);
check('FP10', 'split pieces overlap or leave holes (area not conserved)', near2(pieceArea(r8), area(mm(L))) && near2(pieceArea(r9), area(mm(U))) && near2(pieceArea(r10), area(mm(notch))),
  'L ' + pieceArea(r8) + ' vs ' + area(mm(L)) + ' | U ' + pieceArea(r9) + ' vs ' + area(mm(U)) + ' | notch ' + pieceArea(r10) + ' vs ' + area(mm(notch)));
function near2(a, b) { return Math.abs(a - b) < 1e-6; }
// FP11 thin leg 30 mm dropped by min_thickness 0.05, thick part kept
const thin = [[0, 0], [2000, 0], [2000, 500], [30, 500], [30, 2000], [0, 2000]];
const cfg11 = JSON.parse(JSON.stringify(CFG)); cfg11.wall.min_thickness = 0.05;
const r11 = go([poly('D4', 'A-WALL-FULL', thin, true)], cfg11);
check('FP11', 'min_thickness not applied per split piece', pieces(r11).length === 1 && pieces(r11)[0].length === 2 && gaps(r11, 'D4').join() === 'GAP:wall_below_min_thickness', 'pieces=' + pieces(r11).length + ' gaps=' + gaps(r11, 'D4'));
// FP12 mitred trapezoid (45 degree end) stays a gap
const mit = [[0, 0], [2000, 0], [1700, 300], [0, 300]];
const r12 = go([poly('D5', 'A-WALL-FULL', mit, true)]);
check('FP12', 'mitred outline boxed or split (would invent wall)', walls(r12).length === 0 && gaps(r12, 'D5').join() === 'GAP:wall_footprint_not_rect', 'walls=' + walls(r12).length + ' gaps=' + gaps(r12, 'D5'));
// FP13 same polygon, vertex order rotated and reversed -> identical pieces
const sig = r => JSON.stringify(pieces(r).map(q => q.rect));
const rot = U.slice(3).concat(U.slice(0, 3)), rev = U.slice().reverse();
check('FP13', 'split depends on vertex order or direction', sig(go([poly('D2', 'A-WALL-FULL', rot, true)])) === sig(r9) && sig(go([poly('D2', 'A-WALL-FULL', rev, true)])) === sig(r9),
  'rotated=' + (sig(go([poly('D2', 'A-WALL-FULL', rot, true)])) === sig(r9)) + ' reversed=' + (sig(go([poly('D2', 'A-WALL-FULL', rev, true)])) === sig(r9)));

// FP14 collinear extra vertex on the long left edge of an L: y-sweep makes 3 bands, vertical merge must restore 2 pieces
const Lc = [[0, 0], [2000, 0], [2000, 500], [500, 500], [500, 2000], [0, 2000], [0, 1000]];
const r14 = go([poly('D6', 'A-WALL-FULL', Lc, true)]);
check('FP14', 'extra collinear vertex fragments a wall (vertical merge missing); tie must pick the y-sweep tiling', pieces(r14).length === 2 && near2(pieceArea(r14), 1.75) && JSON.stringify(pieces(r14).map(q => q.rect)) === JSON.stringify([[0, 0, 2, 0.5], [0, 0.5, 0.5, 2]]), 'pieces=' + pieces(r14).length + ' area=' + pieceArea(r14) + ' rects=' + JSON.stringify(pieces(r14).map(q => q.rect)));
// FP15 T-shape lying on its side: y-sweep gives 3 rectangles, x-sweep 2 -> the fewer-rectangles rule must pick x-sweep: (0,0,0.5,3.0) and (0.5,1.0,2.0,2.0)
const T = [[0, 0], [500, 0], [500, 1000], [2000, 1000], [2000, 2000], [500, 2000], [500, 3000], [0, 3000]];
const r15 = go([poly('D7', 'A-WALL-FULL', T, true)]);
check('FP15', 'split not minimal (fewer-rectangles rule not applied)', pieces(r15).length === 2 && JSON.stringify(pieces(r15).map(q => q.rect)) === JSON.stringify([[0, 0, 0.5, 3], [0.5, 1, 2, 2]]), JSON.stringify(pieces(r15).map(q => q.rect)));

// FP16 self-intersecting rectilinear outline: band areas sum to 7.0 m2 but the shoelace area is 9.0 m2 -> must be rejected
const bow = [[0, 0], [2000, 0], [2000, 2000], [1000, 2000], [1000, 1000], [3000, 1000], [3000, 3000], [0, 3000]];
const r16 = go([poly('D8', 'A-WALL-FULL', bow, true)]);
check('FP16', 'self-intersecting outline split into overlapping pieces (area check missing)', walls(r16).length === 0 && gaps(r16, 'D8').join() === 'GAP:wall_footprint_not_rect', 'walls=' + walls(r16).length + ' gaps=' + gaps(r16, 'D8'));
console.log('SUMMARY fail=' + fails); process.exit(fails ? 1 : 0);
