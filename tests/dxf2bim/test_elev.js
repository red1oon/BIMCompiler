// ⚠ DO NOT REMOVE — Witness tests EL1-EL9 (window heights from marked elevations). Spec: docs/DXF2BIM_SPEC.md §26. Read the log after every run.
'use strict';
const crypto = require('crypto'), path = require('path');
const DxfParser = require(path.join(__dirname, '../../deploy/dev/dxf-parser.js'));
const B = require(path.join(__dirname, '../../deploy/dev/dxf2bim.js'));
const MK = require(path.join(__dirname, '../../deploy/dev/dxf2marks.js'));
const E = require(path.join(__dirname, '../../deploy/dev/dxf2elev.js'));
const hashHex = s => crypto.createHash('sha256').update(s).digest('hex');
const g = (c, v) => c + '\n' + v + '\n';
const poly = (h, l, pts) => g(0, 'LWPOLYLINE') + g(5, h) + g(8, l) + g(100, 'AcDbPolyline') + g(90, pts.length) + g(70, 1) + pts.map(p => g(10, p[0]) + g(20, p[1])).join('');
const rectP = (h, l, x0, y0, x1, y1) => poly(h, l, [[x0, y0], [x1, y0], [x1, y1], [x0, y1]]);
const dxf = parts => g(0, 'SECTION') + g(2, 'ENTITIES') + parts.join('') + g(0, 'ENDSEC') + g(0, 'EOF');
const T = (text, x, y) => ({ text: text, x: x || 0, y: y || 0 });
// building 5000 x 4000 mm, walls 200 thick (footprint rectangles); envelope x 0..5, y 0..4 m
const WALLS = [rectP('A1', 'A-WALL-FULL', 0, 0, 5000, 200), rectP('A2', 'A-WALL-FULL', 0, 3800, 5000, 4000), rectP('A3', 'A-WALL-FULL', 0, 200, 200, 3800), rectP('A4', 'A-WALL-FULL', 4800, 200, 5000, 3800)];
const PLANMARKS = lvl => [T('@SET=T'), T('@VIEW=PLAN'), T('@LEVEL=' + lvl), T('@UNITS=mm'), T('@GRIDX=A', 0, 0), T('@GRIDX=B', 5000, 0), T('@GRIDY=1', 0, 0), T('@GRIDY=2', 0, 4000)];
const ELEVMARKS = (face, hax, a, b) => [T('@SET=T'), T('@VIEW=ELEV'), T('@FACE=' + face), T('@HAXIS=' + hax), T('@UNITS=mm'), T('@GRIDH=' + a[0], a[1], 0), T('@GRIDH=' + b[0], b[1], 0), T('@Z=0', 0, 0), T('@Z=3', 0, 3000)];
const MAP = { version: 1, rules: [{ match: 'exact', pattern: 'A-WALL-FULL', type: 'wall' }, { match: 'exact', pattern: 'A-GLAZ', type: 'glazing' }] };
const CFG = { version: 1, units: 'mm', snap_tol: 0.001, host_tol: 0.1, align_tol: 0.01, wall_mode: 'footprint', wall: { height: 3.1, base: 0 }, opening: { window: { from_elevation: true } } };
const deps = { DxfParser, hashHex, library: [] };
const parse = txt => new DxfParser().parseSync(txt);
function planOps(winRects, lvl) { const txt = MK.writeMarks(dxf(WALLS.concat(winRects)), PLANMARKS(lvl)); const r = B.run(txt, MAP, CFG, deps); return { r, d: MK.describe(MK.readMarks(parse(txt).entities)).desc }; }
function elev(face, hax, a, b, parts) { const txt = MK.writeMarks(dxf(parts), ELEVMARKS(face, hax, a, b)); const d = parse(txt); return { d, desc: MK.describe(MK.readMarks(d.entities)).desc }; }
function prep(plan, el) { const al = MK.align(plan.d, el.desc, 0.001); if (!al.ok) throw new Error('align ' + JSON.stringify(al.errors)); return { face: el.desc.face, clusters: E.elevClusters(el.d.entities, MAP, al.map, 0.001) }; }
const wins = r => r.ops.filter(o => o.op_type === 'DXF_OPENING' && o.params.kind === 'window');
const gapsOf = (r, c) => r.ops.filter(o => o.op_type === 'DXF_GAP' && o.params.code === c);
let fails = 0; const check = (id, issue, ok, d) => { if (!ok) fails++; console.log((ok ? 'PASS ' : 'FAIL ') + id + ' | ' + issue + ' | ' + d); };
const apply = (plan, els, lvl) => E.applyElevations(plan.r.ops, els, CFG, { level: lvl || 0, hashHex });
const WIN = rectP('B1', 'A-GLAZ', 1000, 0, 3000, 200);                        // plan window on the minY face, plan interval x [1,3]
const FRONT = (zs) => elev('minY', '+X', ['A', 0], ['B', 5000], zs.map((z, i) => rectP('E' + (i + 1), 'A-GLAZ', 1000, z[0] * 1000, 3000, z[1] * 1000)));

// EL1 hand: elevation box h 1000..3000, y 900..2100 -> plan [1,3], z 0.9..2.1 -> sill 0.9 height 1.2 at level 0
const p1 = planOps([WIN], 0), e1 = prep(p1, FRONT([[0.9, 2.1]])), r1 = apply(p1, [e1]);
const w1 = wins(r1)[0];
check('EL1', 'sill/height from the elevation wrong or invented', wins(r1).length === 1 && !!w1 && w1.params.sill === 0.9 && w1.params.height === 1.2 && w1.params.from_elevation === true && w1.params.face === 'minY' && w1.params.pending_elevation === false,
  w1 ? 'sill=' + w1.params.sill + ' height=' + w1.params.height + ' face=' + w1.params.face : 'no window');
// EL2 stacked
const e2 = prep(p1, FRONT([[0.9, 1.5], [1.8, 2.7]])), r2 = apply(p1, [e2]);
check('EL2', 'stacked windows merged or one lost', wins(r2).length === 2 && wins(r2).map(o => o.params.sill + '/' + o.params.height).join() === '0.9/0.6,1.8/0.9', wins(r2).map(o => o.params.sill + '/' + o.params.height).join(' | '));
// EL3 storey z range: same plan interval; clusters at z 0.9..2.1 and 4.0..5.2; level 0 takes the first, level 3.1 the second (sill relative to its level)
const e3 = prep(p1, FRONT([[0.9, 2.1], [4.0, 5.2]]));
const pA = planOps([WIN], 0), pB = planOps([WIN], 3.1), rA = apply(pA, [e3], 0), rB = apply(pB, [e3], 3.1);
check('EL3', 'a storey takes a cluster from another storey', wins(rA).length === 1 && wins(rA)[0].params.sill === 0.9 && wins(rB).length === 1 && Math.abs(wins(rB)[0].params.sill - 0.9) < 1e-9 && wins(rB)[0].params.height === 1.2,
  'level 0: sill=' + (wins(rA)[0] && wins(rA)[0].params.sill) + ' | level 3.1: sill=' + (wins(rB)[0] && wins(rB)[0].params.sill) + ' (4.0-3.1=0.9)');
// EL4 no cluster at that interval
const e4 = prep(p1, elev('minY', '+X', ['A', 0], ['B', 5000], [rectP('E1', 'A-GLAZ', 3500, 900, 4500, 2100)])), r4 = apply(p1, [e4]);
check('EL4', 'window kept with a placeholder height when no elevation matches', wins(r4).length === 0 && gapsOf(r4, 'GAP:no_elevation_match').length === 1, 'windows=' + wins(r4).length + ' gaps=' + gapsOf(r4, 'GAP:no_elevation_match').length);
// EL5 face without elevation: supply only a maxY elevation
const e5 = prep(p1, elev('maxY', '-X', ['A', 0], ['B', -5000], [rectP('E1', 'A-GLAZ', -3000, 900, -1000, 2100)])), r5 = apply(p1, [e5]);
check('EL5', 'window on a face with no elevation not reported', wins(r5).length === 0 && gapsOf(r5, 'GAP:no_elevation_for_face').length === 1, 'gaps=' + gapsOf(r5, 'GAP:no_elevation_for_face').length);
// EL6 REAR mirrored: window on maxY face at plan x [1,3]; REAR HAXIS -X so h = -x: cluster h -3000..-1000
const WINR = rectP('B1', 'A-GLAZ', 1000, 3800, 3000, 4000), p6 = planOps([WINR], 0);
const e6 = prep(p6, elev('maxY', '-X', ['A', 0], ['B', -5000], [rectP('E1', 'A-GLAZ', -3000, 900, -1000, 2100)])), r6 = apply(p6, [e6]);
check('EL6', 'mirrored elevation maps to the wrong plan interval', e6.clusters[0].p0 === 1 && e6.clusters[0].p1 === 3 && wins(r6).length === 1 && wins(r6)[0].params.face === 'maxY', 'cluster plan interval=' + e6.clusters[0].p0 + '..' + e6.clusters[0].p1 + ' windows=' + wins(r6).length);
// EL7 order independence of elevation entities
let seed = 7; const rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
const zs7 = [[0.9, 1.5], [1.8, 2.7], [2.8, 2.95]]; const base7 = JSON.stringify(wins(apply(p1, [prep(p1, FRONT(zs7))])).map(o => [o.params.sill, o.params.height, o.output_guid]));
let same = 0; for (let i = 0; i < 20; i++) { const sh = zs7.slice().sort(() => rnd() - 0.5); const el = FRONT(sh); if (JSON.stringify(wins(apply(p1, [prep(p1, el)])).map(o => [o.params.sill, o.params.height])) === JSON.stringify(JSON.parse(base7).map(x => [x[0], x[1]]))) same++; }
check('EL7', 'result depends on entity order in the elevation (R2)', same === 20, 'identical in ' + same + '/20');
// EL8 unmatched elevation cluster reported not emitted
const e8 = prep(p1, FRONT([[0.9, 2.1], [0.9, 2.1]].slice(0, 1).concat([])));
const extra = elev('minY', '+X', ['A', 0], ['B', 5000], [rectP('E1', 'A-GLAZ', 1000, 900, 3000, 2100), rectP('E2', 'A-GLAZ', 3500, 900, 4500, 2100)]);
const r8 = apply(p1, [prep(p1, extra)]);
check('EL8', 'elevation-only cluster emitted as a window or silently dropped', wins(r8).length === 1 && r8.unmatched_elev.length === 1 && r8.unmatched_elev[0].p0 === 3.5, 'windows=' + wins(r8).length + ' unmatched_elev=' + JSON.stringify(r8.unmatched_elev.map(u => [u.face, u.p0, u.p1])));
// EL9 corner window touching minY and minX: plan bbox x 0..0.4 (wall zone) y 0..1.2 touches both
const CORNER = rectP('B1', 'A-GLAZ', 0, 0, 400, 1200), p9 = planOps([CORNER], 0);
const eF = prep(p9, elev('minY', '+X', ['A', 0], ['B', 5000], [rectP('E1', 'A-GLAZ', 0, 900, 400, 2100)]));
const eL = prep(p9, elev('minX', '+Y', ['1', 0], ['2', 4000], [rectP('E1', 'A-GLAZ', 0, 900, 1200, 2100)]));
const r9 = apply(p9, [eF, eL]);
check('EL9', 'corner window (two faces) duplicated or lost', wins(r9).length === 1 && wins(r9)[0].params.sill === 0.9 && wins(r9)[0].params.height === 1.2, 'windows=' + wins(r9).length + (wins(r9)[0] ? ' face=' + wins(r9)[0].params.face : ''));
console.log('SUMMARY fail=' + fails); process.exit(fails ? 1 : 0);
