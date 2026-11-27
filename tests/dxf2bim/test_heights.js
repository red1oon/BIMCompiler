// ⚠ DO NOT REMOVE — Witness tests HT1-HT10 (wall and door heights from marked elevations). Spec: docs/DXF2BIM_SPEC.md §28. Read the log after every run.
'use strict';
const crypto = require('crypto'), path = require('path');
const DxfParser = require(path.join(__dirname, '../../deploy/dev/dxf-parser.js'));
const B = require(path.join(__dirname, '../../deploy/dev/dxf2bim.js'));
const MK = require(path.join(__dirname, '../../deploy/dev/dxf2marks.js'));
const E = require(path.join(__dirname, '../../deploy/dev/dxf2elev.js'));
const Mesh = require(path.join(__dirname, '../../deploy/dev/dxf2mesh.js'));
const hashHex = s => crypto.createHash('sha256').update(s).digest('hex');
const g = (c, v) => c + '\n' + v + '\n';
const poly = (h, l, pts) => g(0, 'LWPOLYLINE') + g(5, h) + g(8, l) + g(100, 'AcDbPolyline') + g(90, pts.length) + g(70, 1) + pts.map(p => g(10, p[0]) + g(20, p[1])).join('');
const rectP = (h, l, x0, y0, x1, y1) => poly(h, l, [[x0, y0], [x1, y0], [x1, y1], [x0, y1]]);
const arc = (h, l, cx, cy, r, a0, a1) => g(0, 'ARC') + g(5, h) + g(8, l) + g(10, cx) + g(20, cy) + g(30, 0) + g(40, r) + g(50, a0) + g(51, a1);
const dxf = parts => g(0, 'SECTION') + g(2, 'ENTITIES') + parts.join('') + g(0, 'ENDSEC') + g(0, 'EOF');
const T = (text, x, y) => ({ text: text, x: x || 0, y: y || 0 });
const PLANMARKS = lvl => [T('@SET=T'), T('@VIEW=PLAN'), T('@LEVEL=' + lvl), T('@UNITS=mm'), T('@GRIDX=A', 0, 0), T('@GRIDX=B', 5000, 0), T('@GRIDY=1', 0, 0), T('@GRIDY=2', 0, 4000)];
const ELEVMARKS = (face, hax, a, b) => [T('@SET=T'), T('@VIEW=ELEV'), T('@FACE=' + face), T('@HAXIS=' + hax), T('@UNITS=mm'), T('@GRIDH=' + a[0], a[1], 0), T('@GRIDH=' + b[0], b[1], 0), T('@Z=0', 0, 0), T('@Z=3', 0, 3000)];
const MAP_PLAN = { version: 1, rules: [{ match: 'exact', pattern: 'A-WALL-FULL', type: 'wall' }, { match: 'exact', pattern: 'A-DOOR', type: 'opening' }] };
const MAP_ELEV = { version: 1, rules: [{ match: 'exact', pattern: 'A-ELEV-WALL', type: 'elevwall' }, { match: 'exact', pattern: 'A-DOOR', type: 'elevdoor' }] };
const CFG = { version: 1, units: 'mm', snap_tol: 0.001, host_tol: 0.1, align_tol: 0.01, wall_mode: 'footprint', wall: { height_from_elevation: true }, opening: { door: { from_elevation: true } } };
const deps = { DxfParser, hashHex, library: [] };
const parse = t => new DxfParser().parseSync(t);
const BASEWALLS = [rectP('A1', 'A-WALL-FULL', 0, 0, 5000, 200), rectP('A2', 'A-WALL-FULL', 0, 3800, 5000, 4000), rectP('A3', 'A-WALL-FULL', 0, 200, 200, 3800), rectP('A4', 'A-WALL-FULL', 4800, 200, 5000, 3800)];
function plan(extra, lvl, cfg) { const txt = MK.writeMarks(dxf(BASEWALLS.concat(extra || [])), PLANMARKS(lvl || 0)); const r = B.run(txt, MAP_PLAN, cfg || CFG, deps); return { r, d: MK.describe(MK.readMarks(parse(txt).entities)).desc }; }
function elev(face, hax, a, b, parts) { const txt = MK.writeMarks(dxf(parts), ELEVMARKS(face, hax, a, b)); const d = parse(txt); return { d, desc: MK.describe(MK.readMarks(d.entities)).desc }; }
function prep(pl, el) { const al = MK.align(pl.d, el.desc, 0.001); if (!al.ok) throw new Error(JSON.stringify(al.errors)); return { face: el.desc.face, walls: E.elevWallRects(el.d.entities, MAP_ELEV, al.map), doors: E.elevClusters(el.d.entities, MAP_ELEV, al.map, 0.001, 'elevdoor') }; }
const wallsOf = r => r.ops.filter(o => o.op_type === 'DXF_WALL'), doorsOf = r => r.ops.filter(o => o.op_type === 'DXF_OPENING' && o.params.kind === 'door');
const gapsFor = (r, h) => r.ops.filter(o => o.op_type === 'DXF_GAP' && o.params.handle === h).map(o => o.params.code);
const byH = (r, h) => wallsOf(r).find(o => o.params.handle === h);
let fails = 0; const check = (id, issue, ok, d) => { if (!ok) fails++; console.log((ok ? 'PASS ' : 'FAIL ') + id + ' | ' + issue + ' | ' + d); };
const FRONT = parts => elev('minY', '+X', ['A', 0], ['B', 5000], parts);
const R1 = rectP('E1', 'A-ELEV-WALL', 0, 0, 5000, 3100);                       // front wall, storey 1: plan [0,5] z 0..3.1

// HT1
const p1 = plan(), e1 = prep(p1, FRONT([R1])), r1 = E.applyWallHeights(p1.r.ops, [e1], CFG, { level: 0 });
const a1 = byH(r1, 'A1');
check('HT1', 'exterior wall height/base from the long elevation rect wrong', !!a1 && a1.params.height === 3.1 && a1.params.base === 0 && a1.params.height_source === 'elevation', a1 ? 'height=' + a1.params.height + ' base=' + a1.params.base + ' src=' + a1.params.height_source : 'wall dropped: ' + gapsFor(r1, 'A1'));
// HT2 two storeys: rects 0..3100 and 3100..6000
const R2 = rectP('E2', 'A-ELEV-WALL', 0, 3100, 5000, 6000);
const e2 = prep(p1, FRONT([R1, R2])), pL1 = plan(), pL2 = plan([], 3.1);
const rL1 = E.applyWallHeights(pL1.r.ops, [e2], CFG, { level: 0 }), rL2 = E.applyWallHeights(pL2.r.ops, [e2], CFG, { level: 3.1 });
check('HT2', 'a storey takes the other storey\'s wall rect', byH(rL1, 'A1').params.height === 3.1 && byH(rL2, 'A1').params.height === 2.9 && byH(rL2, 'A1').params.base === 0, 'L1 height=' + byH(rL1, 'A1').params.height + ' | L2 height=' + byH(rL2, 'A1').params.height + ' base=' + byH(rL2, 'A1').params.base);
// HT3 interior wall with exact rect takes that rect, not the long one; interior wall without exact rect gets nothing
const IN1 = rectP('I1', 'A-WALL-FULL', 1500, 800, 1624, 2400), IN2 = rectP('I2', 'A-WALL-FULL', 3000, 800, 3124, 2400);
const p3 = plan([IN1, IN2]), e3 = prep(p3, FRONT([R1, rectP('E3', 'A-ELEV-WALL', 1500, 0, 1624, 2795)])), r3 = E.applyWallHeights(p3.r.ops, [e3], CFG, { level: 0 });
check('HT3', 'interior wall took the exterior rect height (or exact rect ignored)', byH(r3, 'I1') && byH(r3, 'I1').params.height === 2.795 && !byH(r3, 'I2') && gapsFor(r3, 'I2').join() === 'GAP:no_elevation_height',
  'I1 height=' + (byH(r3, 'I1') && byH(r3, 'I1').params.height) + ' | I2 gaps=' + gapsFor(r3, 'I2'));
// HT4 conflict: end-on west wall A3 interval [0,0.2]: two minY elevations disagree
const eA = prep(p1, FRONT([rectP('E4', 'A-ELEV-WALL', 0, 0, 200, 3100)])), eB = prep(p1, FRONT([rectP('E5', 'A-ELEV-WALL', 0, 0, 200, 2800)]));
const r4 = E.applyWallHeights(p1.r.ops, [eA, eB], CFG, { level: 0 });
check('HT4', 'conflicting elevation heights averaged or one chosen silently', !byH(r4, 'A3') && gapsFor(r4, 'A3').join() === 'GAP:elevation_height_conflict', 'A3 gaps=' + gapsFor(r4, 'A3') + ' report=' + JSON.stringify(r4.report));
// HT5 no candidate: gap; with config fallback: height from config tagged config
const e5 = prep(p1, FRONT([R1])), r5 = E.applyWallHeights(p1.r.ops, [e5], CFG, { level: 0 });
const CFGF = JSON.parse(JSON.stringify(CFG)); CFGF.wall.height = 2.5; CFGF.wall.base = 0;
const p5f = plan([], 0, CFGF), r5f = E.applyWallHeights(p5f.r.ops, [prep(p5f, FRONT([R1]))], CFGF, { level: 0 });
check('HT5', 'missing elevation height defaulted silently / fallback not labelled', gapsFor(r5, 'A3').join() === 'GAP:no_elevation_height' && byH(r5f, 'A3') && byH(r5f, 'A3').params.height === 2.5 && byH(r5f, 'A3').params.height_source === 'config' && byH(r5f, 'A1').params.height_source === 'elevation',
  'no config: A3 ' + gapsFor(r5, 'A3') + ' | with config: A3 height=' + (byH(r5f, 'A3') && byH(r5f, 'A3').params.height) + ' src=' + (byH(r5f, 'A3') && byH(r5f, 'A3').params.height_source) + ', A1 src=' + byH(r5f, 'A1').params.height_source);
// HT6 exact beats containment: front wall piece [1,2] with an exact rect z 0..2.5 and the long rect z 0..3.1
const PIECES = [rectP('B0', 'A-WALL-FULL', 0, 0, 1000, 200), rectP('B1', 'A-WALL-FULL', 1000, 0, 2000, 200), rectP('B2', 'A-WALL-FULL', 2000, 0, 5000, 200), BASEWALLS[1], BASEWALLS[2], BASEWALLS[3]];   // front wall in 3 pieces, proper envelope
const p6 = { r: B.run(MK.writeMarks(dxf(PIECES), PLANMARKS(0)), MAP_PLAN, CFG, deps), d: p1.d };
const e6 = prep(p6, FRONT([R1, rectP('E6', 'A-ELEV-WALL', 1000, 0, 2000, 2500)])), r6 = E.applyWallHeights(p6.r.ops, [e6], CFG, { level: 0 });
check('HT6', 'containment overrode an exact rect', byH(r6, 'B1') && byH(r6, 'B1').params.height === 2.5 && byH(r6, 'B0').params.height === 3.1 && byH(r6, 'B2').params.height === 3.1, 'B1 height=' + (byH(r6, 'B1') && byH(r6, 'B1').params.height) + ' (exact 2.5) | neighbours B0=' + (byH(r6, 'B0') && byH(r6, 'B0').params.height) + ' B2=' + (byH(r6, 'B2') && byH(r6, 'B2').params.height) + ' (long rect 3.1)');
// HT7 door on the back wall seen in a mirrored REAR elevation: hinge (1.0,3.9) r 0.9 0..90 -> span x [1.0,1.9]; elevdoor h -1900..-1000, y 0..2100 -> height 2.1
const p7 = plan([arc('F1', 'A-DOOR', 1000, 3900, 900, 0, 90)]);
const rear = elev('maxY', '-X', ['A', 0], ['B', -5000], [rectP('E7', 'A-DOOR', -1900, 0, -1000, 2100)]);
const e7 = prep(p7, rear), r7 = E.applyDoorHeights(p7.r.ops, [e7], CFG, { level: 0 });
const d7 = doorsOf(r7)[0];
check('HT7', 'door height from the mirrored elevation wrong', !!d7 && d7.params.height === 2.1 && d7.params.height_source === 'elevation' && d7.params.face === 'maxY', d7 ? 'height=' + d7.params.height + ' src=' + d7.params.height_source + ' face=' + d7.params.face : 'no door: ' + gapsFor(r7, 'F1'));
// HT8 order independence
let seed = 5; const rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
const sig = (pl, parts) => JSON.stringify(wallsOf(E.applyWallHeights(pl.r.ops, [prep(pl, FRONT(parts))], CFG, { level: 0 })).map(o => [o.params.handle, o.params.height, o.params.base]));
const parts8 = [R1, rectP('E3', 'A-ELEV-WALL', 1500, 0, 1624, 2795), rectP('E4', 'A-ELEV-WALL', 0, 0, 200, 3100)];
const base8 = sig(p3, parts8); let same = 0; for (let i = 0; i < 20; i++) if (sig(p3, parts8.slice().sort(() => rnd() - 0.5)) === base8) same++;
check('HT8', 'wall heights depend on entity order in the elevation (R2)', same === 20, 'identical in ' + same + '/20');
// HT9 pending wall and pending door are never meshed
const m9 = Mesh.meshFromOps(p7.r.ops, { level: 0, hashHex, snapTol: 0.001 });
check('HT9', 'a wall or door without a height was meshed', m9.elements.length === 0 && m9.gaps.some(x => x.code === 'GAP:no_height'), 'elements=' + m9.elements.length + ' gaps=' + m9.gaps.map(x => x.code).filter((v, i, a) => a.indexOf(v) === i));
// HT10 hidden back wall must not take the FRONT elevation height by equal interval
const e10 = prep(p1, FRONT([R1])), r10 = E.applyWallHeights(p1.r.ops, [e10], CFG, { level: 0 });
check('HT10', 'back wall took its height from the front elevation (hidden wall)', !byH(r10, 'A2') && gapsFor(r10, 'A2').join() === 'GAP:no_elevation_height', 'A2 gaps=' + gapsFor(r10, 'A2'));
// HT11 door storey filter: two elevdoor clusters with the same interval, z0 = 0 and z0 = 3.1; level 0 takes the first (2.1), level 3.1 the second
const rear2 = elev('maxY', '-X', ['A', 0], ['B', -5000], [rectP('E7', 'A-DOOR', -1900, 0, -1000, 2100), rectP('E8', 'A-DOOR', -1900, 3100, -1000, 5300)]);
const e11 = prep(p7, rear2), p11b = plan([arc('F1', 'A-DOOR', 1000, 3900, 900, 0, 90)], 3.1);
const r11a = E.applyDoorHeights(p7.r.ops, [e11], CFG, { level: 0 }), r11b = E.applyDoorHeights(p11b.r.ops, [e11], CFG, { level: 3.1 });
check('HT11', 'door took a cluster from another storey (or two storeys conflict)', doorsOf(r11a)[0] && doorsOf(r11a)[0].params.height === 2.1 && doorsOf(r11b)[0] && Math.abs(doorsOf(r11b)[0].params.height - 2.2) < 1e-9,
  'level 0 height=' + (doorsOf(r11a)[0] && doorsOf(r11a)[0].params.height) + ' | level 3.1 height=' + (doorsOf(r11b)[0] && doorsOf(r11b)[0].params.height) + ' (5.3-3.1=2.2)');
// HT12 door hosted by a 100 mm stub next to the gap still gets its height (span from both swing end points)
const STUBW = [rectP('S1', 'A-WALL-FULL', 0, 0, 1000, 200), rectP('S2', 'A-WALL-FULL', 1000, 0, 1100, 200), rectP('S3', 'A-WALL-FULL', 2100, 0, 5000, 200), BASEWALLS[1], BASEWALLS[2], BASEWALLS[3]];
const p12 = { r: B.run(MK.writeMarks(dxf(STUBW.concat([arc('F1', 'A-DOOR', 1100, 100, 1000, 0, 90)])), PLANMARKS(0)), MAP_PLAN, CFG, deps), d: p1.d };
const front12 = FRONT([rectP('E9', 'A-DOOR', 1100, 0, 2100, 2100)]), e12 = prep(p12, front12), r12 = E.applyDoorHeights(p12.r.ops, [e12], CFG, { level: 0 });
const d12 = doorsOf(r12)[0], host12 = p12.r.ops.find(o => o.op_type === 'DXF_OPENING' && o.params.kind === 'door');
check('HT12', 'door beside a wall stub got no height (host-axis dependent span)', !!d12 && d12.params.height === 2.1 && d12.params.height_source === 'elevation' && host12.params.host_handle === 'S2',
  d12 ? 'height=' + d12.params.height + ' host=' + host12.params.host_handle + ' (stub)' : 'no door: ' + gapsFor(r12, 'F1') + ' host=' + host12.params.host_handle);
// HT13 both swing spans match clusters with different heights -> conflict
const e13a = prep(p12, FRONT([rectP('E9', 'A-DOOR', 1100, 0, 2100, 2100)])), e13b = prep(p12, FRONT([rectP('E10', 'A-DOOR', 1100, 0, 1100.4, 2400)]));   // separate drawings: the clusters must not merge
const r13 = E.applyDoorHeights(p12.r.ops, [e13a, e13b], CFG, { level: 0 });
check('HT13', 'two matching door spans with different heights resolved silently', gapsFor(r13, 'F1').includes('GAP:elevation_height_conflict') && doorsOf(r13).length === 0, 'gaps=' + gapsFor(r13, 'F1'));
console.log('SUMMARY fail=' + fails); process.exit(fails ? 1 : 0);
