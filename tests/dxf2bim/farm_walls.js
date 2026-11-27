// ⚠ DO NOT REMOVE — SANDBOX pair-wall run on the Farmhouse 1st floor plan (SPEC §34-§35). Work: Jay Osborne "American Farmhouse", CC BY-SA. File not in repo.
// Reads the MARKED copy (farm_mark.js), applies the region + exclusion rectangles from the markings, pairs layer-1 lines 3.5 in apart into walls and checks the
// result against evidence in the drawing (outer dimensions, openings measured earlier, accounting). Usage: node tests/dxf2bim/farm_walls.js <marked.dxf>
'use strict';
const fs = require('fs'), crypto = require('crypto'), path = require('path');
const DxfParser = require(path.join(__dirname, '../../deploy/dev/dxf-parser.js'));
const B = require(path.join(__dirname, '../../deploy/dev/dxf2bim.js'));
const MK = require(path.join(__dirname, '../../deploy/dev/dxf2marks.js'));
const txt = fs.readFileSync(process.argv[2], 'utf8'), hashHex = s => crypto.createHash('sha256').update(s).digest('hex');
const parsed = new DxfParser().parseSync(txt);
const views = MK.describeAll(MK.readMarks(parsed.entities)), plan = views.find(v => v.desc.view === 'PLAN');
let fails = 0; const check = (id, issue, ok, d) => { if (!ok) fails++; console.log((ok ? 'PASS ' : 'FAIL ') + id + ' | ' + issue + ' | ' + d); };
const IN = 0.0254;
console.log('plan region ' + JSON.stringify(plan.region) + ' exclude ' + JSON.stringify(plan.desc.excludes));
const MAP = { version: 1, rules: [{ match: 'exact', pattern: '1', type: 'wallline' }].concat(['0', '2', '3', '5', 'A-TEXTx', 'A-DIMSx', 'A-LINK', 'A-SYMB', 'L-PLNT', 'A-ELEC', 'A-TEXT', '0-NPLT', 'A-DIMS', 'A-DIMSx'].map(l => ({ match: 'exact', pattern: l, type: 'ignore' }))) };
// pair thickness 3.5 in (the structural wall: layer-1 lines 3.5 in apart, see SPEC §34); tolerances are sandbox values stated here
const CFG = { version: 1, units: 'in', snap_tol: 0.0005, wall_mode: 'pair', wall: { height_from_elevation: true, pair_thicknesses: [3.5 * IN], pair_tol: 0.0005, pair_min_overlap: 12 * IN, pair_join_gap: 3.5 * IN } };
const run = B.run(txt, MAP, CFG, { DxfParser, hashHex, library: [], region: plan.region, exclude: plan.desc.excludes });
const r = run.report, c = r.counts;
console.log('file entities ' + r.region.file_entities + ' -> in region ' + c.entities + ' + outside ' + r.region.outside_region + ' (straddle ' + r.region.straddle + ') ; excluded ' + (r.exclude && r.exclude.excluded) + ' straddle ' + (r.exclude && r.exclude.exclude_straddle));
const gc = {}; r.gaps.forEach(g => { gc[g.code] = (gc[g.code] || 0) + 1; }); console.log('elements=' + c.elements + ' ignored=' + c.ignored + ' gaps ' + JSON.stringify(gc));
const walls = run.ops.filter(o => o.op_type === 'DXF_WALL');
const rin = o => o.params.rect.map(v => +(v / IN).toFixed(2));
console.log('wall pieces: ' + walls.length);
walls.slice().sort((a, b) => a.params.rect[1] - b.params.rect[1] || a.params.rect[0] - b.params.rect[0]).forEach(o => { const q = rin(o); console.log('  [' + q.join(', ') + ']  ' + (q[2] - q[0]).toFixed(2) + ' x ' + (q[3] - q[1]).toFixed(2) + ' in  pair ' + o.params.pair.join('+')); });
// ---- checks against drawing evidence ----
const xs0 = Math.min(...walls.map(o => rin(o)[0])), xs1 = Math.max(...walls.map(o => rin(o)[2])), ys0 = Math.min(...walls.map(o => rin(o)[1])), ys1 = Math.max(...walls.map(o => rin(o)[3]));
check('ENVELOPE', 'outer extent of the walls is not 32\'-0" x 16\'-0" (printed overall dimensions, tol 0.05 in)', Math.abs((xs1 - xs0) - 384) <= 0.05 && Math.abs((ys1 - ys0) - 192) <= 0.05, 'x ' + xs0 + '..' + xs1 + ' (' + (xs1 - xs0).toFixed(2) + ' in), y ' + ys0 + '..' + ys1 + ' (' + (ys1 - ys0).toFixed(2) + ' in)');
const south = walls.filter(o => Math.abs(rin(o)[1] - plan.desc.gridsY.SOUTH_FACE) < 0.05 && (rin(o)[3] - rin(o)[1]) < 4).map(o => [rin(o)[0], rin(o)[2]]).sort((a, b) => a[0] - b[0]);
const gaps = []; for (let i = 1; i < south.length; i++) gaps.push([south[i - 1][1], south[i][0], +(south[i][0] - south[i - 1][1]).toFixed(2)]);
check('SOUTH-OPENINGS', 'the south wall pieces do not leave exactly the 3 openings measured in the drawing (31.5, 37.5, 31.5 in)', JSON.stringify(gaps.map(g => g[2])) === '[31.5,37.5,31.5]' && south[0][0] === 1836 && south[south.length - 1][1] === 2220, 'pieces=' + south.length + ' gaps=' + JSON.stringify(gaps.map(g => g.map(v => +v.toFixed(2)))));
// printed top dimension string 12'-0" + 8'-0" + 12'-0" (read from the rendered sheet): the two long interior partitions should have faces 12 ft and 20 ft from the west outer face
const west = plan.desc.gridsX.WEST_FACE, parts = walls.filter(o => { const q = rin(o); return (q[2] - q[0]) < 4 && (q[3] - q[1]) > 12 && q[0] > west + 20 && q[2] < plan.desc.gridsX.EAST_FACE - 20; }).map(o => rin(o)).sort((a, b) => a[0] - b[0]);
console.log('interior vertical wall pieces, 3.5 in thick (x0..x1, length in): ' + JSON.stringify(parts.map(q => [q[0], q[2], +(q[3] - q[1]).toFixed(2)])));
check('DIMS-12-8-12', 'no interior vertical wall piece has its west face 144 in, or none has its east face 240 in, from the west outer face (printed 12\'-0" + 8\'-0" + 12\'-0", tol 0.05 in)', parts.length >= 2 && parts.some(q => Math.abs(q[0] - west - 144) <= 0.05) && parts.some(q => Math.abs(q[2] - west - 240) <= 0.05), 'faces from west (west face / east face): ' + parts.map(q => +(q[0] - west).toFixed(2) + ' / ' + +(q[2] - west).toFixed(2)).join(' | '));
const inDeck = walls.filter(o => plan.desc.excludes.some(rc => { const q = o.params.rect.map(v => v / IN); return q[0] >= rc[0] && q[2] <= rc[2] && q[1] >= rc[1] && q[3] <= rc[3]; }));
check('NO-DECKING-WALLS', 'a wall was created inside an exclusion region (decking became a wall)', inDeck.length === 0, 'walls inside exclusion rectangles = ' + inDeck.length);
// accounting: every wallline entity in the region is excluded, in a pair, or logged
const lines = parsed.entities.filter(e => e.layer === '1' && e.type === 'LINE' && e.vertices.every(v => v.x >= plan.region[0] && v.x <= plan.region[2] && v.y >= plan.region[1] && v.y <= plan.region[3]));
const exc = e => plan.desc.excludes.some(rc => e.vertices.every(v => v.x >= rc[0] && v.x <= rc[2] && v.y >= rc[1] && v.y <= rc[3]));
const paired = new Set(walls.flatMap(o => o.params.members)), gapped = new Set(r.gaps.map(g => g.handle));
const lost = lines.filter(e => !exc(e) && !paired.has(e.handle) && !gapped.has(e.handle));
check('ACCOUNTING', 'a layer-1 line vanished with no wall, gap or exclusion', lost.length === 0, 'layer-1 lines in region=' + lines.length + ' excluded=' + lines.filter(exc).length + ' in walls=' + lines.filter(e => paired.has(e.handle)).length + ' gapped=' + lines.filter(e => !exc(e) && !paired.has(e.handle) && gapped.has(e.handle)).length + ' lost=' + lost.length);
const run2 = B.run(txt, MAP, CFG, { DxfParser, hashHex, library: [], region: plan.region, exclude: plan.desc.excludes });
check('DETERMINISM', 'two runs differ', JSON.stringify(run.ops) === JSON.stringify(run2.ops), 'run_id=' + run.run_id.slice(0, 12));
console.log('SUMMARY fail=' + fails);
// ---- debug: lost lines and the missing middle south piece ----
if (process.env.FARM_DEBUG) {
  lost.forEach(e => console.log('  LOST ' + e.handle + ' (' + e.vertices.map(v => v.x.toFixed(2) + ',' + v.y.toFixed(2)).join(' -> ') + ')'));
  const sy = plan.desc.gridsY.SOUTH_FACE;
  parsed.entities.filter(e => e.layer === '1' && e.type === 'LINE' && Math.abs(e.vertices[0].y - sy) < 4 && Math.abs(e.vertices[1].y - sy) < 4 && e.vertices[0].x > 1890 && e.vertices[0].x < 2130).forEach(e => {
    const st = paired.has(e.handle) ? 'WALL' : (gapped.has(e.handle) ? 'GAP:' + r.gaps.filter(g => g.handle === e.handle).map(g => g.code) : (exc(e) ? 'EXCLUDED' : '??'));
    console.log('  south-zone line ' + e.handle + ' y=' + e.vertices[0].y.toFixed(2) + ' x ' + Math.min(e.vertices[0].x, e.vertices[1].x).toFixed(2) + '..' + Math.max(e.vertices[0].x, e.vertices[1].x).toFixed(2) + ' -> ' + st); });
}
