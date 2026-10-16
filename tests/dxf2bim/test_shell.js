// ⚠ DO NOT REMOVE — Unit tests for the basic shapes (walls F9/F5b/W-H3, slabs, roof, openings bridged in drawn gaps, LOD400 fills).
// Spec: docs/DXF2BIM_BASIC_SHAPES_SPEC.md. Every check names the issue it proves. Read test_shell.log after every run; exit code is not evidence.
'use strict';
const crypto = require('crypto'), path = require('path'), fs = require('fs');
const DxfParser = require(path.join(__dirname, '../../deploy/dev/dxf-parser.js'));
const B = require(path.join(__dirname, '../../deploy/dev/dxf2bim.js'));
const M = require(path.join(__dirname, '../../deploy/dev/dxf2mesh.js'));
const MK = require(path.join(__dirname, '../../deploy/dev/dxf2marks.js'));
const S = require(path.join(__dirname, '../../deploy/dev/dxf2shell.js'));
const hashHex = s => crypto.createHash('sha256').update(s).digest('hex');
const g = (c, v) => c + '\n' + v + '\n';
const poly = (h, l, pts) => g(0, 'LWPOLYLINE') + g(5, h) + g(8, l) + g(100, 'AcDbPolyline') + g(90, pts.length) + g(70, 1) + pts.map(p => g(10, p[0]) + g(20, p[1])).join('');
const rectP = (h, x0, y0, x1, y1) => poly(h, 'A-WALL-FULL', [[x0, y0], [x1, y0], [x1, y1], [x0, y1]]);
const dxf = parts => g(0, 'SECTION') + g(2, 'ENTITIES') + parts.join('') + g(0, 'ENDSEC') + g(0, 'EOF');
const MAP = { version: 1, rules: [{ match: 'exact', pattern: 'A-WALL-FULL', type: 'wall' }] };
const CFG = { version: 1, units: 'mm', snap_tol: 0.001, wall_mode: 'footprint', wall: { height: 3.1, base: 0, polygon_footprint: true } };
const deps = { DxfParser, hashHex, library: [] };
const run = (parts, cfg) => B.run(dxf(parts), MAP, cfg || CFG, deps);
const wallsOf = r => r.ops.filter(o => o.op_type === 'DXF_WALL');
const gapsOf = (r, c) => r.ops.filter(o => o.op_type === 'DXF_GAP' && o.params.code === c);
const J = JSON.stringify, near = (a, b, t) => Math.abs(a - b) <= (t || 1e-6);
const lines = []; let fails = 0;
const check = (id, issue, ok, d) => { if (!ok) fails++; const l = (ok ? 'PASS ' : 'FAIL ') + id + ' | ' + issue + ' | ' + d; lines.push(l); console.log(l); };

// ---------- §2.1 F9 polygon footprint ----------
const TRAP = poly('T1', 'A-WALL-FULL', [[0, 0], [2000, 0], [4675, 0], [4675, 417], [417, 417]]);   // mitred left end, one collinear extra vertex
{ const r = run([TRAP]), w = wallsOf(r);
  const p = w[0] && w[0].params;
  check('WP1', 'a mitred outline was dropped or replaced by its bounding box', w.length === 1 && p.polygon === true && J(p.outline) === J([[0, 0], [4.675, 0], [4.675, 0.417], [0.417, 0.417]]) && J(p.rect) === J([0, 0, 4.675, 0.417]) && p.thickness === 0.417 && p.length === 4.675,
    'walls=' + w.length + ' outline=' + J(p && p.outline) + ' rect=' + J(p && p.rect) + ' t=' + (p && p.thickness)); }
{ const c = JSON.parse(J(CFG)); delete c.wall.polygon_footprint; const r = run([TRAP], c);
  check('WP2', 'polygon walls appear without the opt-in flag (hidden behaviour change)', wallsOf(r).length === 0 && gapsOf(r, 'GAP:wall_footprint_not_rect').length === 1, 'walls=' + wallsOf(r).length + ' not_rect gaps=' + gapsOf(r, 'GAP:wall_footprint_not_rect').length); }
{ const r = run([poly('X1', 'A-WALL-FULL', [[0, 0], [1000, 1000], [1000, 0], [0, 1000]])]);
  check('WP3', 'a self-crossing outline was accepted as a wall', wallsOf(r).length === 0 && gapsOf(r, 'GAP:wall_footprint_not_rect').length === 1, 'walls=' + wallsOf(r).length); }
{ const r = run([TRAP]), m = M.meshFromOps(r.ops, { level: 0, hashHex, snapTol: 0.001 }), e = m.elements[0];
  const area = (4.675 + (4.675 - 0.417)) / 2 * 0.417;                                     // trapezoid, hand
  check('WP4', 'the polygon wall mesh is open, inside out or has the wrong volume', m.elements.length === 1 && e.watertight && near(e.volume, area * 3.1, 1e-5), 'volume=' + (e && e.volume) + ' expected=' + (area * 3.1).toFixed(6) + ' watertight=' + (e && e.watertight)); }
{ const strip = o => { const p = Object.assign({}, o.params); delete p.run_id; return J([o.op_type, p]); };
  const parts = [rectP('R1', 0, 0, 3000, 200), poly('L1', 'A-WALL-FULL', [[0, 1000], [2000, 1000], [2000, 1500], [500, 1500], [500, 3000], [0, 3000]])];
  const c = JSON.parse(J(CFG)); delete c.wall.polygon_footprint;
  const a = run(parts).ops.filter(o => o.op_type !== 'DXF_RUN').map(strip), b = run(parts, c).ops.filter(o => o.op_type !== 'DXF_RUN').map(strip);
  check('WP5', 'the polygon rule changed rectangles or rectilinear splits (F1/F6 hijacked)', a.length === b.length && a.every((x, i) => x === b[i]) && a.every(x => !/"polygon"/.test(x)), 'ops with flag=' + a.length + ' without=' + b.length + ' identical=' + a.every((x, i) => x === b[i])); }

// ---------- §2.2 F5b min_thickness after orientation ----------
const CT = { version: 1, units: 'mm', snap_tol: 0.001, wall_mode: 'footprint', wall: { height: 3.1, base: 0, min_thickness: 0.05 }, opening: { gap_min: 0.3, gap_max: 2.6 } };
{ const r = run([rectP('L1', 0, 0, 1000, 124), rectP('P1', 1762, 0, 1782, 124)], CT), p = wallsOf(r).find(o => o.params.handle === 'P1');
  check('WT1', 'a real pier (20 mm along the wall, 124 mm deep) was dropped as a thin strip', !!p && p.params.thickness === 0.124 && J(p.params.start) === '[1.762,0.062]' && gapsOf(r, 'GAP:wall_below_min_thickness').length === 0,
    'pier=' + (p ? 't ' + p.params.thickness + ' start ' + J(p.params.start) : 'missing') + ' below_min gaps=' + gapsOf(r, 'GAP:wall_below_min_thickness').length); }
{ const r = run([rectP('L1', 0, 0, 1000, 124), rectP('S1', 0, 5000, 800, 5019)], CT);
  check('WT2', 'min_thickness no longer drops a thin strip with no voter', !wallsOf(r).some(o => o.params.handle === 'S1') && gapsOf(r, 'GAP:wall_below_min_thickness').length === 1, 'strip emitted=' + wallsOf(r).some(o => o.params.handle === 'S1') + ' gaps=' + gapsOf(r, 'GAP:wall_below_min_thickness').length); }
{ const c = JSON.parse(J(CT)); c.wall.min_thickness = 0.12;
  const r = run([rectP('L1', 0, 0, 1000, 200), rectP('P1', 1300, 0, 1400, 200), rectP('S1', 1300, 400, 1400, 3000)], c), p = wallsOf(r).find(o => o.params.handle === 'P1');
  check('WT3', 'a dropped thin piece voted and steered another piece (ambiguity), so a real pier was lost', !!p && p.params.thickness === 0.2 && !wallsOf(r).some(o => o.params.handle === 'S1') && gapsOf(r, 'GAP:wall_orientation_ambiguous').length === 0,
    'pier=' + (p ? 't ' + p.params.thickness : 'missing') + ' S1 emitted=' + wallsOf(r).some(o => o.params.handle === 'S1') + ' ambiguous=' + gapsOf(r, 'GAP:wall_orientation_ambiguous').length); }

// ---------- §2.3 W-H3 slab-above convention ----------
const pendW = (h, part) => ({ op_type: 'DXF_WALL', output_guid: 'g' + h, params: { handle: h, part: part, rect: [0, 0, 1, 0.1], start: [0, 0.05], end: [1, 0.05], thickness: 0.1, height: null, base: null, pending_elevation: true } });
const gapW = (h, part) => ({ op_type: 'DXF_GAP', output_guid: null, params: { handle: h, part: part, code: 'GAP:no_elevation_height' } });
const seenW = (h) => ({ op_type: 'DXF_WALL', output_guid: 'g' + h, params: { handle: h, part: 0, rect: [0, 1, 1, 1.1], start: [0, 1.05], end: [1, 1.05], thickness: 0.1, base: 0, height: 3.1, height_source: 'elevation' } });
{ const r = S.applySlabAbove([gapW('A', 0), seenW('B')], [pendW('A', 0), pendW('B', 0)], 2.795, 0), a = r.ops.find(o => o.params.handle === 'A');
  check('WH1', 'an unseen wall got a height without the slab-above label, or from the wrong storey', r.n === 1 && a.op_type === 'DXF_WALL' && a.params.height === 2.795 && a.params.base === 0 && a.params.height_source === 'slab_above', J(a.params)); }
{ const r = S.applySlabAbove([gapW('A', 0)], [pendW('A', 0)], undefined, 0);
  check('WH2', 'a wall height was invented when no slab underside is known', r.n === 0 && r.ops[0].op_type === 'DXF_GAP', 'n=' + r.n + ' op=' + r.ops[0].op_type); }
{ const r = S.applySlabAbove([seenW('B')], [pendW('B', 0)], 2.795, 0);
  check('WH3', 'the convention overwrote a height read from an elevation', r.ops[0].params.height === 3.1 && r.ops[0].params.height_source === 'elevation', J(r.ops[0].params)); }

// ---------- §3 SH-M rectilinear prism ----------
{ const m = S.prismRect([[0, 0], [2, 0], [2, 3], [0, 3]], [], 0, 0.5);
  check('SM1', 'a slab box is open, inside out or has the wrong volume', M.watertight(m) && near(M.volume(m), 3.0), 'volume=' + M.volume(m) + ' watertight=' + M.watertight(m)); }
{ const m = S.prismRect([[0, 0], [2, 0], [2, 3], [0, 3]], [[[0.5, 1], [1.5, 1], [1.5, 2], [0.5, 2]]], 0, 0.5);
  check('SM2', 'a slab hole was filled or left open', M.watertight(m) && near(M.volume(m), 2.5), 'volume=' + M.volume(m) + ' expected 2.5 watertight=' + M.watertight(m)); }
{ const m = S.prismRect([[0, 0], [4, 0], [4, 2], [2, 2], [2, 6], [0, 6]], [], 1, 1.2);
  check('SM3', 'a concave (L) slab has the wrong area', M.watertight(m) && near(M.volume(m), 16 * 0.2, 1e-9), 'volume=' + M.volume(m) + ' expected ' + (16 * 0.2)); }
{ const m = S.prismRect([[0, 0], [2, 0], [1, 2]], [], 0, 1);
  check('SM4', 'a non-rectilinear outline was meshed (area invented by the grid)', m === null, 'mesh=' + (m === null ? 'null' : 'built')); }

// ---------- §4 slabs ----------
const W = (h, rect, extra) => { const w = rect[2] - rect[0], hh = rect[3] - rect[1], hz = w >= hh, cx = (rect[0] + rect[2]) / 2, cy = (rect[1] + rect[3]) / 2;
  return { op_type: 'DXF_WALL', output_guid: 'g' + h, params: Object.assign({ handle: h, part: 0, rect, start: hz ? [rect[0], cy] : [cx, rect[1]], end: hz ? [rect[2], cy] : [cx, rect[3]], thickness: hz ? hh : w, length: hz ? w : hh, base: 0, height: 3, height_source: 'elevation' }, extra || {}) }; };
const RING = [W('S', [0, 0, 10, 0.4]), W('N', [0, 7.6, 10, 8]), W('Wx', [0, 0.4, 0.3, 7.6]), W('E', [9.7, 0.4, 10, 7.6]), W('P', [4, 0.4, 4.1, 7.6], { height: 2.7 })];
{ const r = S.innerRing(RING, { snap_tol: 0.001 });
  check('SO1', 'the slab outline is not the inner faces of the exterior walls (hand)', J(r.outline) === J([[0.3, 0.4], [9.7, 0.4], [9.7, 7.6], [0.3, 7.6]]) && r.gaps.length === 0, 'outline=' + J(r.outline) + ' gaps=' + J(r.gaps)); }
{ const r = S.innerRing(RING.concat([W('S2', [0, 0, 3, 0.5])]), { snap_tol: 0.001 });
  check('SO2', 'exterior pieces of one face disagree and an outline was still made', r.outline === null && r.gaps.some(x => x.code === 'GAP:slab_inner_face_conflict' && x.face === 'minY'), J(r.gaps)); }
{ const r = S.innerRing(RING.filter(o => o.params.handle !== 'E'), { snap_tol: 0.001 });
  check('SO3', 'a face without an exterior wall got an invented inner line', r.outline === null && r.gaps.some(x => x.code === 'GAP:slab_no_exterior_wall' && x.face === 'maxX'), J(r.gaps)); }
const UP = { level: 3, ops: RING.map(o => W(o.params.handle, o.params.rect, { base: 0, height: 3 })) };
const LOW = (tops) => ({ level: 0, ops: RING.slice(0, 4).map(o => W(o.params.handle, o.params.rect, { height: 3 })).concat(tops.map((t, i) => W('I' + i, [5 + i, 0.4, 5.1 + i, 7.6], { height: t }))) });
{ const r = S.slabZ(UP, LOW([2.795, 2.795]), { snap_tol: 0.001, elev_tol: 0.003 });
  check('SZ1', 'the underside was taken from a wall that reaches the floor, or is wrong (hand 2.795)', r.top === 3 && r.bottom === 2.795 && r.thickness === 0.205 && r.gaps.length === 0, J({ top: r.top, bottom: r.bottom, t: r.thickness, gaps: r.gaps })); }
{ const r = S.slabZ(UP, LOW([2.795, 2.6]), { snap_tol: 0.001, elev_tol: 0.003 });
  check('SZ2', 'conflicting undersides were averaged or the first one taken', r.thickness === null && r.gaps.some(x => x.code === 'GAP:slab_underside_conflict'), J(r.gaps)); }
{ const r = S.slabZ(UP, null, { snap_tol: 0.001, elev_tol: 0.003 });
  check('SZ3', 'a slab thickness was invented with no storey below', r.top === 3 && r.thickness === null && r.gaps.some(x => x.code === 'GAP:slab_no_underside'), J(r)); }
{ const up2 = { level: 3, ops: UP.ops.map((o, i) => i === 0 ? W(o.params.handle, o.params.rect, { base: 0.2 }) : o) };
  const r = S.slabZ(up2, LOW([2.795]), { snap_tol: 0.001, elev_tol: 0.003 });
  check('SZ4', 'disagreeing exterior wall bases gave a slab top', r.top === null && r.gaps.some(x => x.code === 'GAP:slab_top_conflict'), J(r.gaps)); }

// ---------- §5 roof ----------
{ const d = MK.describe([{ raw: '@ROOF=6.5', x: 0, y: 0, handle: '1' }]), bad = MK.describe([{ raw: '@ROOF=abc', x: 0, y: 0, handle: '1' }]), two = MK.describe([{ raw: '@ROOF=6.5', x: 0, y: 0, handle: '1' }, { raw: '@ROOF=6.4', x: 0, y: 0, handle: '2' }]);
  check('MK-R', 'a roof height was read from a bad or contradictory marking', d.desc.roof === 6.5 && d.errors.filter(e => e.code !== 'MARK:missing').length === 0 && bad.errors.some(e => e.code === 'MARK:malformed') && two.errors.some(e => e.code === 'MARK:conflict'), 'roof=' + d.desc.roof + ' bad=' + J(bad.errors.map(e => e.code)) + ' two=' + J(two.errors.map(e => e.code))); }
const RMAP = { version: 1, rules: [{ match: 'exact', pattern: 'A-ROOF', type: 'roof' }, { match: 'exact', pattern: 'A-GLAZ', type: 'glazing' }] };
const pe = (h, l, pts) => ({ handle: h, layer: l, type: 'LWPOLYLINE', shape: true, vertices: pts.map(p => ({ x: p[0], y: p[1] })) });
{ const ents = [pe('1', 'A-ROOF', [[0, 0], [10000, 0], [10000, 8000], [0, 8000]]), pe('2', 'A-GLAZ', [[2000, 2000], [3000, 2000], [3000, 3000], [2000, 3000]])];
  const r = S.roofPlan(ents, RMAP, 0.001, [0, 0, 10, 8], [[0.3, 0.4], [9.7, 0.4], [9.7, 7.6], [0.3, 7.6]], { snap_tol: 0.001 });
  const bad = S.roofPlan([pe('1', 'A-ROOF', [[0, 0], [9000, 0], [9000, 8000], [0, 8000]])], RMAP, 0.001, [0, 0, 10, 8], [[0.3, 0.4], [9.7, 0.4], [9.7, 7.6], [0.3, 7.6]], { snap_tol: 0.001 });
  check('RP1', 'a roof was built over a plan outline that is not the storey envelope, or a drawn skylight was not made a hole', r.ok && r.holes.length === 1 && J(r.holes[0].rect) === J([2, 2, 3, 3]) && !bad.ok && bad.gaps[0].code === 'GAP:roof_outline_mismatch', 'holes=' + J(r.holes.map(h => h.rect)) + ' mismatch=' + J(bad.gaps)); }
{ const top = { level: 3, ops: UP.ops };
  const ok = S.roofZ(top, [{ name: 'F', roof: 6.5, lines: [{ z: 6.5, handle: 'L1' }] }, { name: 'L', roof: 6.5, lines: [{ z: 6.5, handle: 'L2' }] }], { snap_tol: 0.001, elev_tol: 0.003 });
  const nd = S.roofZ(top, [{ name: 'F', roof: 6.5, lines: [{ z: 6.0, handle: 'L1' }] }], { snap_tol: 0.001, elev_tol: 0.003 });
  const none = S.roofZ(top, [{ name: 'F', lines: [] }], { snap_tol: 0.001, elev_tol: 0.003 });
  const conf = S.roofZ(top, [{ name: 'F', roof: 6.5, lines: [{ z: 6.5 }] }, { name: 'L', roof: 6.4, lines: [{ z: 6.4 }] }], { snap_tol: 0.001, elev_tol: 0.003 });
  check('RZ1', 'roof bottom/top not taken from the top storey walls and the marked, drawn roof line', ok.bottom === 6 && ok.top === 6.5 && ok.thickness === 0.5, J({ b: ok.bottom, t: ok.top, th: ok.thickness, g: ok.gaps }));
  check('RZ2', 'a roof top was accepted that no drawn level line carries, was invented, or conflicting marks were resolved', nd.top === null && nd.gaps.some(x => x.code === 'GAP:roof_top_not_drawn') && none.top === null && none.gaps.some(x => x.code === 'GAP:roof_no_top') && conf.top === null && conf.gaps.some(x => x.code === 'GAP:roof_top_conflict'),
    J({ nd: nd.gaps, none: none.gaps, conf: conf.gaps })); }

// ---------- §6 openings bridged in drawn gaps ----------
const A = W('A', [0, 0, 2, 0.2], { height: 3 }), Bw = W('B', [3, 0, 6, 0.2], { height: 3 });
const win = (h, sill, ht, x0, x1) => ({ op_type: 'DXF_OPENING', output_guid: 'o' + h + sill, params: { handle: h, kind: 'window', bbox: [x0, 0, x1, 0.2], sill, height: ht, host_wall: 'gA' } });
const OC = { snap_tol: 0.001, elev_tol: 0.003 }, OO = { level: 0, hashHex };
const vol = ops => ops.reduce((n, o) => n + o.params.length * o.params.thickness * o.params.height, 0);
{ const r = S.bridgeOpenings([A, Bw, win('W1', 0.9, 1.2, 2, 3)], OC, OO);
  check('OP1', 'the wall below the sill / above the head of a window is missing, or the void is filled', r.infill.length === 2 && J(r.infill.map(o => [o.params.base, o.params.height])) === J([[0, 0.9], [2.1, 0.9]]) && near(vol(r.infill), 1 * 0.2 * 1.8, 1e-9),
    'infill=' + J(r.infill.map(o => [o.params.base, o.params.height, o.params.rect])) + ' volume=' + vol(r.infill)); }
{ const r = S.bridgeOpenings([A, Bw, win('W1', 0.1, 0.759, 2, 3), win('W1', 0.9255, 0.759, 2, 3), win('W1', 1.751, 0.759, 2, 3)], OC, OO);
  check('OP2', 'stacked windows: wall between them (mullion strips) missing or wrong', J(r.infill.map(o => [o.params.base, o.params.height])) === J([[0, 0.1], [0.859, 0.0665], [1.6845, 0.0665], [2.51, 0.49]]), J(r.infill.map(o => [o.params.base, o.params.height]))); }
{ const door = { op_type: 'DXF_OPENING', output_guid: 'oD', params: { handle: 'D1', kind: 'door', hinge: [2, 0.1], width: 1, swing_start_deg: 0, swing_end_deg: 90, height: 2.1, host_wall: 'gA' } };
  const r = S.bridgeOpenings([A, Bw, door], OC, OO);
  check('OP3', 'a door got a sill, or no lintel', r.infill.length === 1 && r.infill[0].params.base === 2.1 && r.infill[0].params.height === 0.9 && J(r.voids[0].s) === '[2,3]', J(r.infill.map(o => [o.params.base, o.params.height])) + ' void=' + J(r.voids[0] && r.voids[0].s)); }
{ const r = S.bridgeOpenings([A, W('B', [3, 0, 6, 0.2], { height: 2.8 }), win('W1', 0.9, 1.2, 2, 3)], OC, OO);
  check('OP4', 'a gap between walls of different heights was bridged with a guessed height', r.infill.length === 0 && r.gaps.some(x => x.code === 'GAP:gap_height_conflict'), J(r.gaps)); }
{ const r = S.bridgeOpenings([W('A', [0, 0, 6, 0.2], { height: 3 }), win('W1', 0.9, 1.2, 2, 3)], OC, OO);
  check('OP5', 'an opening inside an undivided piece was silently ignored or bridged', r.infill.length === 0 && r.gaps.some(x => x.code === 'GAP:opening_inside_piece'), J(r.gaps)); }
{ const r = S.bridgeOpenings([A, Bw], OC, OO);
  check('OP6', 'a drawn gap with no opening was filled (invented wall) or not reported', r.infill.length === 0 && r.notes.length === 1 && J(r.notes[0].s) === '[2,3]', J(r.notes)); }
{ const base = [A, Bw, win('W1', 0.1, 0.759, 2, 3), win('W1', 0.9255, 0.759, 2, 3), win('W1', 1.751, 0.759, 2, 3)], ref = J(S.bridgeOpenings(base, OC, OO));
  let same = 0; for (let k = 0; k < 20; k++) { const p = base.slice(); for (let i = p.length - 1; i > 0; i--) { const j = (k * 7 + i * 13) % (i + 1); [p[i], p[j]] = [p[j], p[i]]; } if (J(S.bridgeOpenings(p, OC, OO)) === ref) same++; }
  check('OP7', 'the bridged result depends on op order', same === 20, 'identical=' + same + '/20'); }

{ const corner = W('C', [2, 0, 2.2, 0.2], { height: 3 }), right = W('R', [3, 0, 6, 0.2], { height: 3 });
  const w = { op_type: 'DXF_OPENING', output_guid: 'oX', params: { handle: 'WX', kind: 'window', bbox: [2.2, 0, 3, 0.2], sill: 0.9, height: 1.2, host_wall: 'gC' } };
  const r = S.bridgeOpenings([corner, right, w], OC, OO);
  check('OP8', 'a window hosted by a square corner piece took the wrong axis (its own drawn box must give axis and strip)', r.infill.length === 2 && J(r.voids[0].s) === '[2.2,3]', J(r.gaps) + ' voids=' + J(r.voids.map(v => v.s))); }
// ---------- §6.1 door swing ----------
{ const host = W('A', [0, 0, 2, 0.2]);
  const d1 = { params: { hinge: [2, 0.1], width: 1, swing_start_deg: 0, swing_end_deg: 90 } }, d2 = { params: { hinge: [3, 0.1], width: 1, swing_start_deg: 180, swing_end_deg: 270 } };
  const s1 = S.doorSwing(d1, [host], 0.001), s2 = S.doorSwing(d2, [host], 0.001);
  check('DS1', 'door swing side or hinge jamb read wrongly from the arc (hand: hinge at -x jamb opens to +y; hinge at +x jamb opens to -y)', s1.opens_to === '+y' && s1.hinge_jamb === '-x' && s2.opens_to === '-y' && s2.hinge_jamb === '+x', J([s1, s2])); }

{ // T-junction (Duplex L2 door 164): hinge at the end of a vertical partition, leaf closed along a horizontal wall 6 mm off the partition axis
  const horiz = W('H1', [2.526, -10.094, 3.288, -9.97]), vert = W('V1', [2.382, -11.674, 2.506, -9.87]);
  const d = { params: { hinge: [2.45, -10.032], width: 0.914, swing_start_deg: 0, swing_end_deg: 90 } };
  const st = S.doorStrip(d, [vert, horiz], 0.001), amb = S.doorStrip({ params: { hinge: [0.1, 0.1], width: 1, swing_start_deg: 0, swing_end_deg: 90 } }, [W('X1', [-2, 0, 0, 0.2]), W('Y1', [0, -2, 0.2, 0])], 0.001);
  check('DS2', 'a door at a T-junction was hosted by the nearest piece instead of the wall its closed leaf lies in; or a two-way case was resolved by a guess', !st.gap && st.ai === 0 && J(st.strip.map(w => w.params.handle)) === '["H1"]' && amb.gap === 'GAP:door_host_ambiguous', J({ ai: st.ai, strip: st.strip && st.strip.map(w => w.params.handle), amb: amb.gap })); }

// ---------- §7 LOD400 fills ----------
const cube = (n) => { const V = [], F = []; for (let i = 0; i < n; i++) { V.push([i, 0, 0], [i, 1, 0], [i, 0, 1]); F.push([3 * i, 3 * i + 1, 3 * i + 2]); } return { V, F }; };
const geom = (ref, hash, dx, dy, dz, tris) => { const c = cube(tris || 20); const V = [[-dx / 2, -dy / 2, -dz / 2], [dx / 2, dy / 2, dz / 2]].concat(c.V.map(v => [Math.min(dx / 2, Math.max(-dx / 2, v[0] * 0)), 0, 0])); return { element_ref: ref, ifc_class: 'IfcWindow', geometry_hash: hash, vertices: V, faces: c.F, bbox: { min: [-dx / 2, -dy / 2, -dz / 2], max: [dx / 2, dy / 2, dz / 2] } }; };
const LIB = { families: [{ family_id: 'DUPLEX_LIVING_WINDOW', ifc_class: 'IfcWindow', description: 'M_Fixed 4835×2420mm. Large living room window.' }, { family_id: 'US_FIXED_4835', ifc_class: 'IfcWindow', description: 'US picture 4835x2420mm' },
  { family_id: 'NOPE', ifc_class: 'IfcWindow', description: 'Mystery 1234x999mm' }, { family_id: 'AMB', ifc_class: 'IfcWindow', description: 'Generic 819x759mm' }, { family_id: 'BOXY', ifc_class: 'IfcWindow', description: 'Box 1000x1000mm' }],
  geoms: [geom('M_Fixed:4835mm x 2420mm:4835mm x 2420mm', 'bb', 4.835, 0.417, 2.42), geom('M_Fixed:4835mm x 2420mm:4835mm x 2420mm', 'aa', 4.835, 0.417, 2.42), geom('M_Fixed:4835mm x 2420mm:4835mm x 2420mm', 'cc', 0.417, 4.835, 2.42),
    geom('M_Fixed:819mm x 759mm:819mm x 759mm', 'd1', 0.819, 0.417, 0.759), geom('M_Casement:819mm x 759mm:819mm x 759mm', 'd2', 0.819, 0.417, 0.759), geom('Box:1000mm x 1000mm', 'ee', 1, 0.2, 1, 12)] };
const wop = (tid, bbox, sill, h) => ({ op_type: 'DXF_OPENING', output_guid: 'o' + tid + bbox[0], params: { handle: 'H' + tid, kind: 'window', bbox, sill, height: h, type: tid ? { type_id: tid } : undefined } });
const FO = { level: 3.1, hashHex, size_tol: 0.005 };
{ const m = S.familyToRef(LIB.families[0], LIB.geoms);
  check('GF1', 'a family with a type token and size did not map to its one type name', m.ref === 'M_Fixed:4835mm x 2420mm:4835mm x 2420mm', J(m)); }
{ const m = S.familyToRef(LIB.families[1], LIB.geoms);
  check('GF2', 'a size-only family (US row) did not map to the one type of that size', m.ref === 'M_Fixed:4835mm x 2420mm:4835mm x 2420mm', J(m)); }
const throws = f => { try { f(); return null; } catch (e) { return e; } };
{ const e = throws(() => S.placeFills([wop('NOPE', [0, 0, 1.234, 0.417], 0.1, 0.999)], LIB, FO));
  check('GF3', 'a bound product without LOD400 geometry was skipped or boxed instead of a hard fail', !!e && /HARD FAIL/.test(e.message) && e.hard.some(x => x.code === 'GAP:no_lod400_geometry'), e ? e.message : 'no throw'); }
{ const e = throws(() => S.placeFills([wop('AMB', [0, 0, 0.819, 0.417], 0.1, 0.759)], LIB, FO));
  check('GF4', 'two type names of the same size were resolved by a guess', !!e && e.hard.some(x => x.code === 'GAP:lod400_ambiguous'), e ? e.message : 'no throw'); }
{ const r = S.placeFills([wop('DUPLEX_LIVING_WINDOW', [0, 0, 0.417, 4.835], 0.1, 2.42)], LIB, FO);
  const lib2 = { families: LIB.families, geoms: LIB.geoms.filter(x => x.geometry_hash !== 'cc') }, e = throws(() => S.placeFills([wop('DUPLEX_LIVING_WINDOW', [0, 0, 0.417, 4.835], 0.1, 2.42)], lib2, FO));
  check('GF5', 'a fill was placed across the wall (orientation ignored) or a missing orientation did not hard-fail', r.elements[0].geometry_hash === 'cc' && !!e && e.hard.some(x => x.code === 'GAP:lod400_orientation'), 'picked=' + r.elements[0].geometry_hash + ' missing-orientation=' + (e ? e.hard.map(x => x.code) : 'no throw')); }
{ const e = throws(() => S.placeFills([wop('BOXY', [0, 0, 1, 0.2], 0.1, 1)], LIB, FO));
  check('GF6', 'a 12-triangle envelope was accepted as LOD400 geometry', !!e && e.hard.some(x => x.code === 'GAP:lod400_envelope'), e ? e.message : 'no throw'); }
{ const r = S.placeFills([wop('DUPLEX_LIVING_WINDOW', [1, 2, 5.835, 2.417], 0.1, 2.42)], LIB, FO), el = r.elements[0];
  const xs = el.vertices.map(v => v[0]), zs = el.vertices.map(v => v[2]);
  check('GF7', 'the fill is not centred on the opening or not at the sill height (hand: x 1..5.835, z 3.2..5.62)', el.geometry_hash === 'aa' && near(Math.min(...xs), 1) && near(Math.max(...xs), 5.835) && near(Math.min(...zs), 3.2) && near(Math.max(...zs), 5.62) && J(el.centre) === J([3.4175, 2.2085, 4.41]),
    'hash=' + el.geometry_hash + ' x ' + Math.min(...xs) + '..' + Math.max(...xs) + ' z ' + Math.min(...zs) + '..' + Math.max(...zs) + ' centre=' + J(el.centre)); }
{ const r = S.placeFills([wop(null, [0, 0, 1, 0.2], 0.1, 1)], LIB, FO);
  check('GF8', 'an unbound opening got a geometry or caused a hard fail', r.elements.length === 0 && r.gaps.length === 1 && r.gaps[0].code === 'GAP:fill_unbound', J(r.gaps)); }

console.log('SUMMARY fail=' + fails);
fs.writeFileSync(path.join(__dirname, 'test_shell.log'), lines.join('\n') + '\nSUMMARY fail=' + fails + '\n');
