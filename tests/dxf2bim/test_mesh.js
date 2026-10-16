// ⚠ DO NOT REMOVE — Witness tests MS1-MS9 for deploy/dev/dxf2mesh.js. Spec: docs/DXF2BIM_SPEC.md §13. Read the log after every run.
// Volumes are hand-computed in the comments, never taken from program output. Volume/watertight checks are recomputed from triangles.
'use strict';
const crypto = require('crypto'), path = require('path');
const DxfParser = require(path.join(__dirname, '../../deploy/dev/dxf-parser.js'));
const B = require(path.join(__dirname, '../../deploy/dev/dxf2bim.js'));
const M = require(path.join(__dirname, '../../deploy/dev/dxf2mesh.js'));
const hashHex = s => crypto.createHash('sha256').update(s).digest('hex');
const g = (c, v) => c + '\n' + v + '\n';
const line = (h, l, x1, y1, x2, y2) => g(0, 'LINE') + g(5, h) + g(8, l) + g(10, x1) + g(20, y1) + g(30, 0) + g(11, x2) + g(21, y2) + g(31, 0);
const arc = (h, l, cx, cy, r, a0, a1) => g(0, 'ARC') + g(5, h) + g(8, l) + g(10, cx) + g(20, cy) + g(30, 0) + g(40, r) + g(50, a0) + g(51, a1);
const lwp = (h, l, pts) => g(0, 'LWPOLYLINE') + g(5, h) + g(8, l) + g(100, 'AcDbPolyline') + g(90, pts.length) + g(70, 1) + pts.map(p => g(10, p[0]) + g(20, p[1])).join('');
const rectL = (hs, pts) => hs.map((h, i) => line(h, 'A-OPENING', pts[i][0], pts[i][1], pts[(i + 1) % 4][0], pts[(i + 1) % 4][1]));
function dxf(parts, order) {
  const keys = order || Object.keys(parts);
  return g(0, 'SECTION') + g(2, 'HEADER') + g(9, '$INSUNITS') + g(70, 6) + g(0, 'ENDSEC') + g(0, 'SECTION') + g(2, 'ENTITIES') +
    keys.map(k => parts[k].join('')).join('') + g(0, 'ENDSEC') + g(0, 'EOF');
}
const walls = { A1: [line('A1', 'A-WALL', 0, 0, 5, 0)], A2: [line('A2', 'A-WALL', 5, 0, 5, 4)], A3: [line('A3', 'A-WALL', 5, 4, 0, 4)], A4: [line('A4', 'A-WALL', 0, 4, 0, 0)] };
const slab = { B1: [lwp('B1', 'S-SLAB', [[0, 0], [5, 0], [5, 4], [0, 4]])] };
const door = { F1: [arc('F1', 'A-OPENING', 2, 0, 0.9, 0, 90)] };
const rect = { R1: rectL(['2A', '2B', '2C', '2D'], [[1, 3.9], [2.5, 3.9], [2.5, 4.1], [1, 4.1]]) };
const MAP = { version: 1, rules: [{ match: 'suffix', pattern: 'A-WALL', type: 'wall' }, { match: 'suffix', pattern: 'S-SLAB', type: 'slab' }, { match: 'suffix', pattern: 'A-OPENING', type: 'opening' }] };
const CFG = { version: 1, units: 'm', snap_tol: 0.001, host_tol: 0.15, align_tol: 0.05, wall: { thickness: 0.2, height: 3.0, base: 0 }, slab: { thickness: 0.2, level: 0 },
  opening: { door: { height: 2.1 }, rect: { sill: 0.9, height: 1.2 } } };
const deps = { DxfParser, hashHex, library: [] };
let fails = 0;
const check = (id, issue, ok, d) => { if (!ok) fails++; console.log((ok ? 'PASS ' : 'FAIL ') + id + ' | ' + issue + ' | ' + d); };
const near = (a, b, t) => Math.abs(a - b) <= (t || 2e-6);
const meshOf = (parts, cfg, level) => { const r = B.run(dxf(parts), MAP, cfg || CFG, deps); return M.meshFromOps(r.ops, { level: level || 0, hashHex, snapTol: (cfg || CFG).snap_tol }); };
const vol = els => els.reduce((s, e) => s + M.volume(e), 0);
const byHandle = (m, h) => m.elements.filter(e => e.handle === h);

// MS1 single wall box
const m1 = meshOf({ A1: walls.A1 });
check('MS1', 'box inside-out, open, or wrong size', m1.elements.length === 1 && near(M.volume(m1.elements[0]), 3.0) && M.watertight(m1.elements[0]),
  'volume=' + M.volume(m1.elements[0]) + ' (hand 5*0.2*3=3.0) watertight=' + M.watertight(m1.elements[0]));

// MS2 slab rectangle and L-shape
const m2 = meshOf({ B1: slab.B1 });
const Lshape = M.prism([[0, 0], [4, 0], [4, 2], [2, 2], [2, 4], [0, 4]], 0, 0.2);   // area = 16 - 4 = 12
const Lcw = M.prism([[0, 0], [0, 4], [2, 4], [2, 2], [4, 2], [4, 0]], 0, 0.2);        // same L, clockwise input
check('MS2', 'bad triangulation of rectangle / concave polygon / wrong winding', near(M.volume(m2.elements[0]), 4.0) && M.watertight(m2.elements[0]) &&
  near(M.volume(Lshape), 2.4) && M.watertight(Lshape) && near(M.volume(Lcw), 2.4) && M.watertight(Lcw),
  'rect=' + M.volume(m2.elements[0]) + ' (4.0) L=' + M.volume(Lshape) + ' (2.4) Lcw=' + M.volume(Lcw));

// MS3 + MS4 walls with openings
const full = Object.assign({}, walls, door, rect);
const m3 = meshOf(full);
const vA1 = vol(byHandle(m3, 'A1')), vA3 = vol(byHandle(m3, 'A3')), vA2 = vol(byHandle(m3, 'A2')), vA4 = vol(byHandle(m3, 'A4'));
check('MS3', 'hole not removed / wrong cut volume', near(vA1, 2.622) && near(vA3, 2.64) && near(vA2, 2.4) && near(vA4, 2.4) && near(vol(m3.elements), 10.062, 4e-6) && m3.elements.every(e => e.watertight && e.volume > 0),
  'A1=' + vA1 + ' (2.622) A3=' + vA3 + ' (2.64) A2=' + vA2 + ' A4=' + vA4 + ' total=' + vol(m3.elements));
// door span [2.0,2.9] on A1: A1 pieces are x 0..2 full, 2..2.9 above door, 2.9..5 full. Check by piece x-ranges.
const xr = e => [Math.min(...e.vertices.map(v => v[0])), Math.max(...e.vertices.map(v => v[0]))];
const a1p = byHandle(m3, 'A1').map(xr).sort((p, q) => p[0] - q[0]);
check('MS4', 'door jamb on the wrong side / wrong span', a1p.length === 3 && near(a1p[0][1], 2.0) && near(a1p[1][0], 2.0) && near(a1p[1][1], 2.9) && near(a1p[2][0], 2.9),
  'A1 piece x-ranges=' + JSON.stringify(a1p) + ' (hand: [0,2] [2,2.9 lintel] [2.9,5])');

// MS5 opening past the wall end
const farRect = { R1: rectL(['2A', '2B', '2C', '2D'], [[4.5, 3.9], [5.5, 3.9], [5.5, 4.1], [4.5, 4.1]]) };  // centre (5,4): half 0.5 → s runs past wall A3 start
const m5 = meshOf(Object.assign({}, walls, farRect));
check('MS5', 'opening silently clipped at the wall end', near(vol(byHandle(m5, 'A3')), 3.0) && m5.gaps.some(x => x.code === 'GAP:opening_outside_wall'),
  'A3 volume=' + vol(byHandle(m5, 'A3')) + ' gaps=' + m5.gaps.map(x => x.code));

// MS6 two overlapping openings on A3: rect 1.0..2.5 and a second rect 2.0..3.0
const two = { R1: rectL(['2A', '2B', '2C', '2D'], [[1, 3.9], [2.5, 3.9], [2.5, 4.1], [1, 4.1]]), R2: rectL(['3A', '3B', '3C', '3D'], [[2.0, 3.9], [3.0, 3.9], [3.0, 4.1], [2.0, 4.1]]) };
const m6 = meshOf(Object.assign({}, walls, two));
const rem6 = 3.0 - 1.5 * 0.2 * 1.2;   // only the first opening (lowest s along A3 from x=5 → rect at x 3.0..2.0 comes first) is cut — checked below
const a3v = vol(byHandle(m6, 'A3'));
check('MS6', 'overlapping openings double-subtracted', m6.gaps.some(x => x.code === 'GAP:opening_overlap') && (near(a3v, 3.0 - 1.0 * 0.2 * 1.2) || near(a3v, rem6)) && a3v > 2.0,
  'A3=' + a3v + ' (one cut only: 2.76 [1.0 wide] or 2.64 [1.5 wide]) gaps=' + m6.gaps.map(x => x.code));

// MS7 determinism across runs and entity order
const fullKeys = Object.keys(Object.assign({}, full, slab));
const parts7 = Object.assign({}, full, slab);
const hs = order => { const r = B.run(dxf(parts7, order), MAP, CFG, deps); return hashHex(JSON.stringify(M.meshFromOps(r.ops, { level: 0, hashHex }).elements.map(e => [e.class, e.handle, e.piece, e.vertices, e.faces]))); };
const sa = hs(), sb = hs(), sc = hs(fullKeys.slice().reverse());
check('MS7', 'mesh depends on run or file order', sa === sb && sa === sc, 'hash=' + sa.slice(0, 12) + ' rerun=' + (sa === sb) + ' reversed=' + (sa === sc));

// MS8 assembly
const txt = dxf(Object.assign({}, full, slab));
const man = { name: 'house', storeys: [{ name: 'GF', level: 0, file: 'p' }, { name: 'L1', level: 3.0, file: 'p' }] };
const asm = M.assemble(man, { p: txt }, MAP, CFG, deps);
const single = B.run(txt, MAP, CFG, deps); const sm = M.meshFromOps(single.ops, { level: 0, hashHex });
const zmin = st => Math.min(...asm.elements.filter(e => e.storey === st && e.class === 'IfcWall').flatMap(e => e.vertices.map(v => v[2])));
const guids = new Set(asm.elements.map(e => e.guid));
const man2 = JSON.parse(JSON.stringify(man)); man2.storeys[1].level = 3.2;
const asm2 = M.assemble(man2, { p: txt }, MAP, CFG, deps);
const shifted = B.run(dxf(Object.assign({}, full, slab)).replace(/\n10\n([-\d.]+)\n20\n/g, (m, x) => '\n10\n' + (+x + 1) + '\n20\n'), MAP, CFG, deps);
const asm3 = M.assemble({ name: 'h', storeys: [{ name: 'GF', level: 0, file: 'p' }, { name: 'L1', level: 3, file: 'q' }] }, { p: txt, q: dxf(Object.assign({}, full, slab)).replace(/\n10\n([-\d.]+)\n20\n/g, (m, x) => '\n10\n' + (+x + 1) + '\n20\n') }, MAP, CFG, deps);
check('MS8', 'wrong storey z offset / duplicate ids / unchecked misalignment / run_id ignores level',
  near(vol(asm.elements), 2 * vol(sm.elements), 4e-6) && near(zmin('GF'), 0) && near(zmin('L1'), 3.0) && guids.size === asm.elements.length &&
  asm.run_id !== asm2.run_id && asm.warnings.filter(w => /storey_extent_mismatch/.test(w)).length === 0 && asm3.warnings.some(w => /storey_extent_mismatch/.test(w)),
  'volume=' + vol(asm.elements) + ' (2x ' + vol(sm.elements) + ') zmin GF=' + zmin('GF') + ' L1=' + zmin('L1') + ' unique guids=' + guids.size + '/' + asm.elements.length +
  ' run_id changes with level=' + (asm.run_id !== asm2.run_id) + ' mismatch warn=' + asm3.warnings.filter(w => /mismatch/.test(w)).length);

// MS10 door in a drawn gap: arc centre at the end of A1, span [5,5.9] beyond L=5
const gapDoor = { F1: [arc('F1', 'A-OPENING', 5, 0, 0.9, 0, 90)] };
const m10 = meshOf(Object.assign({}, walls, gapDoor));
check('MS10', 'drawn-gap opening reported as an error or cut into thin air', m10.notes.some(n => n.code === 'NOTE:opening_in_drawn_gap') &&
  !m10.gaps.some(x => x.code === 'GAP:opening_outside_wall') && near(vol(byHandle(m10, 'A1')), 3.0),
  'notes=' + m10.notes.map(n => n.code + JSON.stringify(n.s)) + ' gaps=' + m10.gaps.map(x => x.code) + ' A1=' + vol(byHandle(m10, 'A1')));

// MS9 OBJ round trip
const obj = M.toObj(asm.elements), back = M.parseObj(obj);
check('MS9', 'export loses geometry', back.faces.length === asm.elements.reduce((n, e) => n + e.faces.length, 0) && near(M.volume(back), vol(asm.elements), 4e-6) || false,
  'faces=' + back.faces.length + ' volume(obj)=' + M.volume(back) + ' vs ' + vol(asm.elements));
console.log('SUMMARY fail=' + fails); process.exit(fails ? 1 : 0);
