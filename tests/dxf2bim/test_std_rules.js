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
  check('DP2', 'an A-DOOR entity attached to no door was absorbed or vanished (it must stay a gap: rect cluster or opening_unclassified, as before)', !inAnyDoor(r.ops, K.far) && gapOf(K.far).length > 0, 'far casing ' + K.far + ' gaps ' + J(gapOf(K.far)));
  const b = doorSet({ both: true }), rb = runD(b.w.out()), gb = rb.report.gaps.filter(g => g.handle === b.K.both);
  check('DP3', 'an entity touching two doors was given to one of them', J(gb.map(g => g.code)) === '["GAP:door_part_ambiguous"]' && !rb.ops.some(o => o.op_type === 'DXF_OPENING' && (o.params.parts || []).some(p => p.handle === b.K.both)), J(gb));
  const m = doorSet({ dx: 2 }), rm = runD(m.w.out());
  check('DP4', 'mutation: an outline 2 mm (2 x snap_tol) off the hinge was still absorbed', !inAnyDoor(rm.ops, m.K.frame) && rm.report.gaps.some(g => g.handle === m.K.frame), J(rm.report.gaps.filter(g => g.handle === m.K.frame).map(g => g.code)));
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

say('\nSUMMARY fail=' + fails);
fs.writeFileSync(path.join(__dirname, 'test_std_rules.log'), lines.join('\n') + '\n');
process.exit(fails ? 1 : 0);
