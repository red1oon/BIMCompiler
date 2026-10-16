// ⚠ DO NOT REMOVE — unit tests for lane spec DXF2BIM_MODELLER_LANE.md §L2.6: A per-wall @WALLTOP, B door symbol accounting, C door heights from the
// schedule, G door hinge on the wall face. Fixtures are written here; each test names the issue it exposes. Read the log (test_std_rules.log).
// Usage: node tests/dxf2bim/test_std_rules.js
'use strict';
const fs = require('fs'), crypto = require('crypto'), path = require('path');
const DD = path.join(__dirname, '../../deploy/dev/');
const DxfParser = require(DD + 'dxf-parser.js'), B = require(DD + 'dxf2bim.js'), MK = require(DD + 'dxf2marks.js'), E = require(DD + 'dxf2elev.js'), S = require(DD + 'dxf2shell.js');
const C = require('./set_configs.js');
const hashHex = s => crypto.createHash('sha256').update(s).digest('hex'), J = JSON.stringify;
const lines = []; let fails = 0;
const say = s => { lines.push(s); console.log(s); };
const check = (id, issue, ok, d) => { if (!ok) fails++; say((ok ? 'PASS ' : 'FAIL ') + id + ' | ' + issue + ' | ' + d); };
const marks = ts => MK.describe(ts.map((t, i) => ({ raw: t, x: 0, y: 0, handle: (0x900 + i).toString(16).toUpperCase() })));

// ================= A: @WALLTOP grammar + applyWallTops =================
{
  const d = marks(['@WALLTOP=handle:9f,3.1', '@WALLTOP=0,slab_above']);
  check('A1', 'per-wall @WALLTOP not read (or its handle not normalised)', J(d.desc.walltop_walls.map(w => [w.wall, w.z])) === '[["9F",3.1]]' && d.desc.walltop.length === 1 && !d.errors.some(e => /WALLTOP/.test(e.message)), J(d.desc.walltop_walls) + ' ' + J(d.errors));
  const c = marks(['@WALLTOP=handle:9F,3.1', '@WALLTOP=handle:9F,3.2']);
  check('A2', 'two tops for one wall accepted silently', c.errors.some(e => e.code === 'MARK:conflict'), J(c.errors.map(e => e.code)));
  const m = marks(['@WALLTOP=handle:XYZ!,3', '@WALLTOP=handle:9F,', '@WALLTOP=3.1,slab_below']);
  check('A3', 'a malformed @WALLTOP accepted', m.errors.filter(e => e.code === 'MARK:malformed').length === 3, J(m.errors.map(e => e.code)));
  const wall = (h, part) => ({ op_type: 'DXF_WALL', output_guid: 'g' + h + part, params: { handle: h, part, rect: [0, 0, 1, 0.1], pending_elevation: true } });
  const gap = (h, part) => ({ op_type: 'DXF_GAP', params: { handle: h, part, code: 'GAP:no_elevation_height' } });
  const before = [wall('A', 0), wall('B', 0)], after = [gap('A', 0), gap('B', 0)];
  const r = E.applyWallTops(after, before, { walltop: [{ level: 0, rule: 'slab_above' }], walltop_walls: [{ wall: 'A', z: 2.5 }] }, 0, 2.795);
  const hA = r.ops.find(o => o.params.handle === 'A'), hB = r.ops.find(o => o.params.handle === 'B');
  check('A4', 'the per-wall top does not win over the storey rule, or a wall gets no stated height', hA.op_type === 'DXF_WALL' && hA.params.height === 2.5 && hA.params.height_source === 'marking' && hB.params.height === 2.795 && hB.params.height_source === 'slab_above_marking', J(r.ops.map(o => [o.op_type, o.params.handle, o.params.height, o.params.height_source])));
  const mu = E.applyWallTops(after, before, { walltop: [], walltop_walls: [{ wall: 'C', z: 2.5 }] }, 0, 2.795);
  check('A5', 'mutation: a per-wall marking on a wrong handle still gave a height (gap must stay)', mu.ops.every(o => o.op_type === 'DXF_GAP'), J(mu.report));
  const nu = E.applyWallTops(after, before, { walltop: [{ level: 0, rule: 'slab_above' }], walltop_walls: [] }, 0, undefined);
  check('A6', 'the storey rule invented a height without a drawn slab underside', nu.ops.every(o => o.op_type === 'DXF_GAP'), J(nu.report));
}

// ================= B: door symbol accounting =================
function W() {
  let h = 0x100; const ents = []; const H = () => (h++).toString(16).toUpperCase();
  return { ents,
    rect: (L, x0, y0, x1, y1) => { const k = H(); ents.push({ k, g: ['0', 'LWPOLYLINE', '5', k, '8', L, '90', 4, '70', 1, '10', x0, '20', y0, '10', x1, '20', y0, '10', x1, '20', y1, '10', x0, '20', y1] }); return k; },
    line: (L, a, b) => { const k = H(); ents.push({ k, g: ['0', 'LINE', '5', k, '8', L, '10', a[0], '20', a[1], '30', 0, '11', b[0], '21', b[1], '31', 0] }); return k; },
    arc: (L, c, r, a0, a1) => { const k = H(); ents.push({ k, g: ['0', 'ARC', '5', k, '8', L, '10', c[0], '20', c[1], '30', 0, '40', r, '50', a0, '51', a1] }); return k; },
    out: order => ['0', 'SECTION', '2', 'HEADER', '9', '$INSUNITS', '70', 4, '0', 'ENDSEC', '0', 'SECTION', '2', 'ENTITIES'].concat(...(order || ents).map(e => e.g), ['0', 'ENDSEC', '0', 'EOF']).join('\n') + '\n' };
}
function doorSet(o) {
  o = o || {}; const w = W(), d = o.dx || 0, K = {};
  w.rect('A-WALL-FULL', 0, 0, 1000, 200); w.rect('A-WALL-FULL', 1900, 0, 5000, 200); w.rect('A-WALL-FULL', 5900, 0, 7000, 200);
  K.d1 = w.arc('A-DOOR', [1000, 200], 900, 0, 90); K.d2 = w.arc('A-DOOR', [5000, 200], 900, 0, 90);
  K.frame = w.rect('A-DOOR', 1000 + d, 150, 1050 + d, 250);          // touches the hinge (1000,200) mid-segment, not at a vertex
  K.leaf = w.line('A-DOOR', [1000, 200], [1000, 1100]);
  K.far = w.rect('A-DOOR', 1000, -25, 1076, 0);                       // casing on the far wall face: 200 mm from the hinge
  if (o.both) K.both = w.line('A-DOOR', [1000, 1100], [5000, 1100]);  // touches an arc end of BOTH doors
  if (o.panel) K.panel = w.rect('A-DOOR', 1200, 90, 1800, 110);      // a leaf panel inside the drawn gap, touching no hinge/arc end
  if (o.beyond) K.beyond = w.rect('A-DOOR', 1902, -25, 1978, 0);      // casing beyond the jamb (s1 = 1900) + 2 x snap_tol
  if (o.double) { K.d3 = w.arc('A-DOOR', [5900, 200], 500, 90, 180); K.mid = w.rect('A-DOOR', 5150, 90, 5300, 110); }   // a second leaf in door 2's gap: the panel lies in both boxes
  return { w, K };
}
const runD = t => B.run(t, C.STD.MAP_PLAN, C.DX.CFG, { DxfParser, hashHex, library: [] });
{
  const { w, K } = doorSet(), r = runD(w.out()), doors = r.ops.filter(o => o.op_type === 'DXF_OPENING' && o.params.kind === 'door');
  const d1 = doors.find(o => o.params.handle === K.d1), parts = [...new Set(d1.params.parts.map(p => p.handle))];
  const gapOf = h => r.report.gaps.filter(g => g.handle === h).map(g => g.code);
  check('DP1', 'a door outline touching the hinge mid-segment is not absorbed WHOLE (a part left as opening_unclassified)', parts.indexOf(K.frame) >= 0 && d1.params.parts.filter(p => p.handle === K.frame).length === 4 && gapOf(K.frame).length === 0 && parts.indexOf(K.leaf) >= 0,
    'door ' + K.d1 + ' parts ' + J(parts) + ' frame segs=' + d1.params.parts.filter(p => p.handle === K.frame).length + ' frame gaps=' + J(gapOf(K.frame)));
  const inAnyDoor = (ops, h) => ops.some(o => o.op_type === 'DXF_OPENING' && o.params.kind === 'door' && (o.params.parts || []).some(p => p.handle === h));
  check('DB1', 'casing on the far wall face (inside the opening box, touching no hinge) is not part of its door (L2.7 rule 1)', parts.indexOf(K.far) >= 0 && gapOf(K.far).length === 0, 'far casing ' + K.far + ' in door ' + K.d1 + '=' + (parts.indexOf(K.far) >= 0) + ' box ' + J(d1.params.opening_box));
  const pn = doorSet({ panel: true }), rp = runD(pn.w.out());
  check('DB2', 'a leaf panel inside the drawn gap is not part of its door', inAnyDoor(rp.ops, pn.K.panel) && !rp.report.gaps.some(g => g.handle === pn.K.panel), J(rp.report.gaps.filter(g => g.handle === pn.K.panel)));
  const dd = doorSet({ double: true }), rd = runD(dd.w.out());
  check('DB4', 'an entity inside two doors\' boxes was given to one of them', rd.report.gaps.some(g => g.handle === dd.K.mid && g.code === 'GAP:door_part_ambiguous') && !inAnyDoor(rd.ops, dd.K.mid), J(rd.report.gaps.filter(g => g.handle === dd.K.mid)));
  const b = doorSet({ both: true }), rb = runD(b.w.out()), gb = rb.report.gaps.filter(g => g.handle === b.K.both);
  check('DP3', 'an entity touching two doors was given to one of them', J(gb.map(g => g.code)) === '["GAP:door_part_ambiguous"]' && !rb.ops.some(o => o.op_type === 'DXF_OPENING' && (o.params.parts || []).some(p => p.handle === b.K.both)), J(gb));
  const m = doorSet({ beyond: true }), rm = runD(m.w.out());
  check('DB5', 'mutation: an entity beyond the jamb (s1 + 2 x snap_tol) was still absorbed', !inAnyDoor(rm.ops, m.K.beyond) && rm.report.gaps.some(g => g.handle === m.K.beyond), J(rm.report.gaps.filter(g => g.handle === m.K.beyond).map(g => g.code)));
  const rs = runD(w.out(w.ents.slice().reverse())), noRun = ops => J(ops.map(o => Object.assign({}, o, { params: Object.assign({}, o.params, { run_id: null, dxf_hash: null, host_wall: null }), output_guid: null, input_guids: null })));   // run_id, dxf_hash and guids hash the file bytes
  check('DP5', 'door parts depend on file order', noRun(rs.ops) === noRun(r.ops), 'equal=' + (noRun(rs.ops) === noRun(r.ops)));
}

// ================= C: door heights from the schedule =================
{
  const wallOp = { op_type: 'DXF_WALL', output_guid: 'W1', params: { handle: 'W', part: 0, rect: [0, 0, 3, 0.2], start: [0, 0.1], end: [3, 0.1], thickness: 0.2, length: 3 } };
  const door = lab => ({ op_type: 'DXF_OPENING', output_guid: 'D1', params: Object.assign({ handle: 'D', kind: 'door', hinge: [1, 0], width: 0.9, swing_start_deg: 0, swing_end_deg: 90, host_wall: 'W1', pending_elevation: true, height: null, height_fallback: null }, lab === undefined ? {} : { label: lab }) });
  const sch = { D1: { class: 'door', width: 0.9, height: 2.1 }, WIN: { class: 'window', width: 0.9, height: 2.1 } };
  const cfg = C.DX.CFG, el0 = [{ face: 'minY', doors: [] }], el1 = [{ face: 'minY', doors: [{ p0: 1, p1: 1.9, z0: 0, z1: 2.05, handles: ['E1'] }] }];
  const h = (ops) => { const d = ops.find(o => o.params.handle === 'D'); return d.op_type + ':' + d.params.height + ':' + (d.params.height_source || d.params.code); };
  const r1 = E.applyDoorHeights([wallOp, door('D1')], el0, cfg, { level: 0, schedule: sch });
  check('DS1', 'a tagged door no elevation shows did not take the scheduled height (height_source schedule)', h(r1.ops) === 'DXF_OPENING:2.1:schedule', h(r1.ops) + ' ' + J(r1.report));
  const r2 = E.applyDoorHeights([wallOp, door('D1')], el1, cfg, { level: 0, schedule: sch });
  check('DS2', 'the schedule overrode a drawn elevation height', h(r2.ops) === 'DXF_OPENING:2.05:elevation', h(r2.ops));
  const r3 = E.applyDoorHeights([wallOp, door()], el0, cfg, { level: 0, schedule: sch });
  check('DS3', 'an untagged door got a height without any source', h(r3.ops) === 'DXF_GAP:undefined:GAP:no_elevation_height', h(r3.ops));
  const r4 = E.applyDoorHeights([wallOp, door('WIN')], el0, cfg, { level: 0, schedule: sch });
  check('DS4', 'a window schedule row was used for a door', h(r4.ops) === 'DXF_GAP:undefined:GAP:no_elevation_height', h(r4.ops));
  const r5 = E.applyDoorHeights([wallOp, door('D9')], el0, cfg, { level: 0, schedule: sch });
  check('DS5', 'mutation: a tag text not in the schedule still gave a height', h(r5.ops) === 'DXF_GAP:undefined:GAP:no_elevation_height', h(r5.ops));
  const r6 = E.applyDoorHeights([wallOp, door('D1')], el0, cfg, { level: 0 });
  check('DS6', 'without a schedule the old behaviour changed (gap expected)', h(r6.ops) === 'DXF_GAP:undefined:GAP:no_elevation_height' && r6.report.schedule === undefined, h(r6.ops) + ' ' + J(r6.report));
}

// ================= G: door hinge on the wall face =================
{
  const ws = [{ op_type: 'DXF_WALL', params: { handle: 'S', rect: [0, 0, 3, 0.2] } }];
  const d = hinge => ({ params: { hinge, width: 0.9, swing_start_deg: 0, swing_end_deg: 90 } });
  const c = S.doorStrip(d([1, 0.1]), ws, 0.001), f = S.doorStrip(d([1, 0.2]), ws, 0.001), o = S.doorStrip(d([1, 0.35]), ws, 0.001);
  check('DH0', 'a hinge on the wall centre line (old set) is no longer hosted', !c.gap && c.strip[0].params.handle === 'S', J(c.gap || c.strip.map(w => w.params.handle)));
  check('DH1', 'a hinge on the wall face (std set, L1.2 R9) finds no strip', !f.gap && f.strip[0].params.handle === 'S', J(f.gap || f.strip.map(w => w.params.handle)));
  check('DH2', 'a hinge outside the wall band was hosted', o.gap === 'GAP:door_no_strip', J(o));
}

// ================= L2.7 (2): cut and fill from drawn evidence =================
{
  const sch = { D1: { class: 'door', width: 0.9, height: 2.032 } }, wallOp = { op_type: 'DXF_WALL', output_guid: 'W1', params: { handle: 'W', part: 0, rect: [0, 0, 3, 0.2] } };
  const door = { op_type: 'DXF_OPENING', output_guid: 'D1', params: { handle: 'D', kind: 'door', hinge: [1, 0.2], width: 0.9, swing_start_deg: 0, swing_end_deg: 90, host_wall: 'W1', pending_elevation: true, height: null, height_fallback: null, label: 'D1' } };
  const hd = (o) => E.applyDoorHeights([wallOp, door], [{ face: 'minY', doors: [] }], C.DX.CFG, Object.assign({ level: 0, schedule: sch }, o)).ops.find(x => x.params.handle === 'D').params;
  const p1 = hd({ schedule_head_frame: 0.076 }), p0 = hd({});
  check('DF0', 'the schedule head frame is not added to the opening (or the leaf height is lost)', p1.height === 2.108 && p1.leaf_height === 2.032 && p0.height === 2.032, J([p1.height, p1.leaf_height, p0.height]));
  // placeFills: a one-geometry library product 1.052 x 0.2 x 2.108 (frame included) against the drawn frame extent 0.9 + 2 x 0.076
  const box = (w, d, h) => { const V = [[0, 0, 0], [w, 0, 0], [w, d, 0], [0, d, 0], [0, 0, h], [w, 0, h], [w, d, h], [0, d, h]], F = []; for (let i = 0; i < 14; i++) F.push([0, 1, 2]); return { vertices: V, faces: F, bbox: { min: [0, 0, 0], max: [w, d, h] } }; };
  const G = Object.assign({ element_ref: 'door:0900 x 2032mm', ifc_class: 'IfcDoor', geometry_hash: 'g1' }, box(1.052, 0.2, 2.108));
  const lib = { families: [{ family_id: 'FAM_D', ifc_class: 'IfcDoor', description: 'door 0900 x 2032' }], geoms: [G] };
  const fop = (h, ob) => ({ op_type: 'DXF_OPENING', output_guid: 'D1', params: Object.assign({ handle: 'D', kind: 'door', width: 0.9, height: h, type: { type_id: 'FAM_D' } }, ob ? { opening_box: ob } : {}) });
  const voidOf = { D1: { axis: 'x', s: [1, 1.9], centre_xy: [1.45, 0.1] } }, ob = { axis: 'x', s: [1, 1.9], along: [0.924, 1.976], band: [0, 0.2] };
  let r1, r2, r3; const fam = S.familyToRef(lib.families[0], lib.geoms);
  try { r1 = S.placeFills([fop(2.108, ob)], lib, { level: 0, hashHex, size_tol: 0.005, voidOf }); r2 = S.placeFills([fop(2.032, ob)], lib, { level: 0, hashHex, size_tol: 0.005, voidOf }); r3 = S.placeFills([fop(2.108)], lib, { level: 0, hashHex, size_tol: 0.005, voidOf }); } catch (e) { r1 = r2 = r3 = { gaps: [{ code: 'HARD ' + e.message }] }; }
  const codes = r => J(r.gaps.map(g => g.code + (g.delta_w !== undefined ? ' dw=' + g.delta_w + ' dh=' + g.delta_h : '')));
  say('  (library ref for the fixture: ' + J(fam) + ')');
  check('DF1', 'the fill is compared with the leaf instead of the drawn opening (frame extent): the product incl. frame is reported as a mismatch', r1.gaps.length === 0, codes(r1));
  check('DF3', 'mutation: without the head frame the opening height still matched the product (dh 0.076 must show)', r2.gaps.some(g => g.code === 'GAP:fill_size_mismatch' && Math.abs(g.delta_h - 0.076) < 1e-6), codes(r2));
  check('DF2', 'without a drawn frame (no opening box) the fill used something other than the wall gap (dw must be 1.052 - 0.9)', r3.gaps.some(g => g.code === 'GAP:fill_size_mismatch' && Math.abs(g.delta_w - 0.152) < 1e-6), codes(r3));
}

// ================= L2.7 (3): tag -> door by box =================
{
  const T = require(DD + 'dxf2types.js');
  const d = (h, hinge, a0, a1, ob) => ({ op_type: 'DXF_OPENING', output_guid: 'G' + h, params: Object.assign({ handle: h, kind: 'door', hinge, width: 0.8, swing_start_deg: a0, swing_end_deg: a1, height: 2 }, ob ? { opening_box: ob } : {}) });
  // two doors whose hinges are 0.22 m apart (std FF 14C / 158 situation): A in a wall along x, B in a wall along y
  const A = d('A', [2.526, -10.094], 270, 0, { axis: 'x', s: [2.526, 3.288], along: [2.45, 3.364], band: [-10.094, -9.970] });
  const Bd = d('B', [2.506, -9.870], 0, 90, { axis: 'y', s: [-9.870, -9.006], along: [-9.946, -8.930], band: [2.382, 2.506] });
  const tag = (x, y, t) => ({ desc: { view: 'PLAN', units: 'm', tags: [{ class: 'door', x, y, text: t }] } });
  const run = (tags) => T.applyTags([A, Bd], tags, MK.UNITS, { snap_tol: 0.001, level: 0 });
  const r1 = run([tag(2.907, -10.032, 'TA'), tag(2.444, -9.438, 'TB')]), lab = (r, h) => (r.ops.find(o => o.params && o.params.handle === h) || { params: {} }).params.label;
  check('DT1', 'a tag at the door opening centre does not bind to that door', lab(r1, 'A') === 'TA', 'A=' + lab(r1, 'A') + ' gaps=' + J(r1.gaps.map(g => g.params.code)));
  check('DT2', 'two adjacent doors (hinges 0.22 m apart) are not told apart by their boxes', lab(r1, 'B') === 'TB' && r1.gaps.length === 0, 'B=' + lab(r1, 'B') + ' gaps=' + J(r1.gaps.map(g => g.params.code)));
  const r3 = run([tag(5, 5, 'TX')]);
  check('DT3', 'mutation: a tag outside every door box still bound', r3.gaps.length === 1 && r3.gaps[0].params.code === 'GAP:label_unmatched', J(r3.gaps.map(g => g.params.code)));
}

// ================= L2.7 (4): T-junction hosting =================
{
  // hinge (2.506,-9.870) lies on the faces of a vertical line (x 2.382..2.506) AND of a horizontal stub (y -9.870..-9.746 band); the closed leaf runs along y
  const W = (h, r) => ({ op_type: 'DXF_WALL', params: { handle: h, rect: r } });
  const ws = [W('V1', [2.382, -11.674, 2.506, -9.870]), W('V2', [2.382, -9.006, 2.506, -6.25]), W('H1', [2.506, -9.870, 3.2, -9.746])];
  const door = { params: { hinge: [2.506, -9.870], width: 0.864, swing_start_deg: 0, swing_end_deg: 90, opening_box: { axis: 'y', s: [-9.870, -9.006], along: [-9.946, -8.930], band: [2.382, 2.506] } } };
  const h = S.doorStrip(door, ws, 0.001);
  check('DH3', 'a T-junction hinge (on two strips\' faces) is not hosted by the wall parallel to the closed leaf', !h.gap && J(h.strip.map(w => w.params.handle)) === '["V1","V2"]' && h.ai === 1, J(h.gap || h.strip.map(w => w.params.handle)));
  const nob = { params: Object.assign({}, door.params, { opening_box: undefined }) }, ws2 = ws.concat([W('H2', [3.37, -9.870, 4.0, -9.746])]), h2 = S.doorStrip({ params: Object.assign({}, nob.params, { swing_start_deg: 0, swing_end_deg: 90 }) }, ws2, 0.001);
  check('DH4', 'without an opening box, two bounded candidate spans were tie-broken (must stay ambiguous or single by geometry)', h2.gap === 'GAP:door_host_ambiguous' || (!h2.gap && h2.strip.length > 0), J(h2.gap || h2.strip.map(w => w.params.handle)));
}

// ================= L2.7 (5): @BY =================
{
  const M = ts => MK.describe(ts.map((t, i) => ({ raw: t, x: 0, y: 0, handle: (0xA00 + i).toString(16).toUpperCase() })));
  const a = M(['@LEVEL=3.1 @BY=user', '@WALLTOP=handle:99,5.695 @BY=model', '@WALLTOP=3.1,slab_above']);
  check('BY1', 'the @BY suffix is not read, or the marking in the same TEXT is lost', a.desc.level === 3.1 && a.desc.by.LEVEL === 'user' && a.desc.walltop_walls[0].by === 'model' && a.desc.walltop[0].by === 'file' && !a.errors.some(e => e.code === 'MARK:by_invalid'), J({ by: a.desc.by, ww: a.desc.walltop_walls, wt: a.desc.walltop }));
  const b2 = M(['@BY=model']), b3 = M(['@LEVEL=3.1 @BY=model @BY=user']), b4 = M(['@LEVEL=3.1 @BY=robot']);
  check('BY2', 'a TEXT holding only @BY is accepted', b2.errors.some(e => e.code === 'MARK:by_invalid'), J(b2.errors.map(e => e.code)));
  check('BY3', 'a second @BY in one TEXT is accepted', b3.errors.some(e => e.code === 'MARK:by_invalid') && b3.desc.level === undefined, J(b3.errors.map(e => e.code)));
  check('BY4', 'a @BY value other than model|user is accepted', b4.errors.some(e => e.code === 'MARK:by_invalid') && b4.desc.level === undefined, J(b4.errors.map(e => e.code)));
  const b5 = M(['@LEVEL=3.1']);
  check('BY5', 'a marking without @BY is not read as stated (file)', b5.desc.by.LEVEL === 'file', J(b5.desc.by));
  const b6 = M(['@WALLTOP=handle:99,5.695 @BY=model', '@WALLTOP=handle:9B,5.695']);
  check('BY6', '@BY leaked to the next TEXT (it qualifies only its own TEXT)', b6.desc.walltop_walls.find(w => w.wall === '9B').by === 'file', J(b6.desc.walltop_walls));
  const b7 = M(['@WALLTOP=handle:99,5.695', '@BY=model']);
  check('BY7', 'mutation: @BY in a separate TEXT next to the marking was applied to it (must be by_invalid, marking stays file)', b7.errors.some(e => e.code === 'MARK:by_invalid') && b7.desc.walltop_walls[0].by === 'file', J(b7.errors.map(e => e.code)) + ' ' + J(b7.desc.walltop_walls));
}

// ================= L2.8 (1): wall base from the lowest stated source =================
{
  const Wl = (h, r, base, height, src) => ({ op_type: 'DXF_WALL', output_guid: 'g' + h, params: { handle: h, part: 0, rect: r, base, height, height_source: src } });
  // FF level 3.1, GF level 0; section cut X = 2.30425, h = plan y
  const sec = (ws) => ({ walls: ws, axis: 'X', at: 2.30425 });
  const ff = [Wl('A', [0.417, -6.25, 2.506, -6.126], 0, 2.9, 'slab_above_marking'), Wl('E', [0, -0.417, 8.8, 0], 0, 2.9, 'elevation'), Wl('I', [6.294, -11.674, 8.383, -11.55], 0, 2.9, 'slab_above_marking')];
  const gfPieces = [[0, -0.417, 8.8, 0]];
  const swalls = [{ h: [-6.25, -6.126], bottom: 2.612, top: 3.1, handle: 'B5' }, { h: [-6.25, -6.126], bottom: 5.132, top: 6, handle: 'B7' }, { h: [-0.417, 0], bottom: 0, top: 3.1, handle: 'BD' }, { h: [-0.417, 0], bottom: 3.1, top: 3.2, handle: 'B3' }];
  const r = S.applyWallBases(ff, { level: 3.1, lowerLevel: 0, lowerPieces: gfPieces, section: sec(swalls), tol: 0.001 }), by = h => r.ops.find(o => o.params.handle === h).params;
  check('WB1', 'a section-cut piece does not take the section base (2.612)', by('A').base_source === 'section' && Math.abs(by('A').base - (2.612 - 3.1)) < 1e-9 && Math.abs(3.1 + by('A').base + by('A').height - 6) < 1e-9, J(by('A')));
  check('WB2', 'a stacked lower-plan wall rect (BD 0..3.1, GF draws that line) was taken as the FF base', by('E').base_source === 'section' && by('E').base === 0, J([by('E').base, by('E').base_source, by('E').base_from]));
  const gf = [Wl('G', [0.417, -10.218, 4.618, -9.725], 0, 2.795, 'elevation')], fnd = [{ h: [-10.218, -9.725], bottom: -1.25, top: 0, handle: 'A3' }, { h: [-10.218, -9.725], bottom: 0, top: 2.795, handle: 'AA' }];
  const rg = S.applyWallBases(gf, { level: 0, section: sec(fnd), tol: 0.001 }).ops[0].params;
  check('WB3', 'a foundation rect below the lowest plan was taken as a wall base', rg.base === 0 && rg.base_source === 'section', J([rg.base, rg.base_source, rg.base_from]));
  check('WB4', 'an uncut interior piece did not fall back to the plan level with the advisory', by('I').base_source === 'plan_level' && by('I').base === 0 && r.advisories.some(a => a.handle === 'I' && a.code === 'GAP:wall_base_from_plan_level'), J(r.advisories));
  const moved = swalls.map(w => w.handle === 'B5' ? Object.assign({}, w, { bottom: 2.562 }) : w), rm = S.applyWallBases(ff, { level: 3.1, lowerLevel: 0, lowerPieces: gfPieces, section: sec(moved), tol: 0.001 }).ops.find(o => o.params.handle === 'A').params;
  check('WB5', 'mutation: the section rect moved 50 mm down and the base did not follow (or a slab was used)', Math.abs(rm.base - (2.562 - 3.1)) < 1e-9, J([rm.base, rm.base_from]));
  // a cut through a door opening states the base of its two jamb pieces
  const J1 = Wl('J1', [0.417, -6.25, 1.483, -6.126], 0, 2.9, 'slab_above_marking'), J2 = Wl('J2', [2.347, -6.25, 2.506, -6.126], 0, 2.9, 'slab_above_marking');
  const dr = { op_type: 'DXF_OPENING', params: { handle: 'D', kind: 'door', opening_box: { axis: 'x', s: [1.483, 2.347], along: [1.407, 2.423], band: [-6.25, -6.126] } } };
  const rj = S.applyWallBases([J1, J2, dr], { level: 3.1, lowerLevel: 0, lowerPieces: gfPieces, section: sec(swalls), tol: 0.001 }).ops;
  check('WB6', 'a section cut inside a drawn door opening does not state the base of its jamb pieces', rj.filter(o => o.op_type === 'DXF_WALL').every(o => o.params.base_source === 'section' && Math.abs(o.params.base + 0.488) < 1e-9), J(rj.filter(o => o.op_type === 'DXF_WALL').map(o => [o.params.handle, o.params.base, o.params.base_source])));
}

// ================= L2.8 (2): one wall per footprint across consecutive plans =================
{
  const Wl = (h, r, base, height, src) => ({ op_type: 'DXF_WALL', output_guid: 'g' + h, params: { handle: h, part: 0, rect: r, base, height, height_source: src } });
  const st = (lowOps, upOps) => [{ name: 'L1', level: 0, ops: lowOps }, { name: 'L2', level: 3.1, ops: upOps }];
  const r1 = S.mergeStacked(st([Wl('a', [0, 0, 5, 0.2], 0, 6, 'elevation')], [Wl('b', [0, 0, 5, 0.2], -3.1, 6, 'elevation')]), 0.001, 0.003);
  check('MS1', 'a two-storey wall drawn on both plans (heights 0..6 each) is counted twice', r1.storeys[0].ops.length === 1 && r1.storeys[1].ops.length === 0 && r1.storeys[0].ops[0].params.base === 0 && r1.storeys[0].ops[0].params.height === 6 && r1.merged.length === 1, J(r1.merged) + ' ' + J(r1.storeys.map(x => x.ops.length)));
  const r2 = S.mergeStacked(st([Wl('a', [0, 0, 5, 0.2], 0, 6, 'elevation')], [Wl('b', [0.01, 0, 5.01, 0.2], -3.1, 6, 'elevation')]), 0.001, 0.003);
  check('MS2', 'mutation: a footprint shifted 10 mm was still merged (must be two walls)', r2.storeys[0].ops.length === 1 && r2.storeys[1].ops.length === 1 && r2.merged.length === 0, J(r2.merged));
  const r3 = S.mergeStacked(st([Wl('a', [0, 0, 5, 0.2], 0, 2.8, 'elevation')], [Wl('b', [0, 0, 5, 0.2], 0, 2.9, 'elevation')]), 0.001, 0.003);
  check('MS3', 'walls separated by a z gap (0..2.8 / 3.1..6.0) were merged', r3.merged.length === 0 && r3.storeys[1].ops.length === 1, J(r3.merged));
}

say('\nSUMMARY fail=' + fails);
fs.writeFileSync(path.join(__dirname, 'test_std_rules.log'), lines.join('\n') + '\n');
process.exit(fails ? 1 : 0);
