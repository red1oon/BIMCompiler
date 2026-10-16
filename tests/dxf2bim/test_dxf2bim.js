// ⚠ DO NOT REMOVE — Witness tests for deploy/dev/dxf2bim.js. Spec: docs/DXF2BIM_SPEC.md §7.3-7.4.
// Scope: T1,T2,T3,T4,T5,T7,T9 on fixture F1 (generated here, hand-computed expectations). Read the log after every run.
// Usage: node tests/dxf2bim/test_dxf2bim.js   (log: tests/dxf2bim/test.log written by caller via tee)
'use strict';
const crypto = require('crypto');
const path = require('path');
const DxfParser = require(path.join(__dirname, '../../deploy/dev/dxf-parser.js'));
const D = require(path.join(__dirname, '../../deploy/dev/dxf2bim.js'));
const hashHex = s => crypto.createHash('sha256').update(s).digest('hex');

// ---- F1 generator (handles fixed; entity order controllable) ----
function g(code, val) { return code + '\n' + val + '\n'; }
function line(h, layer, x1, y1, x2, y2) { return g(0, 'LINE') + g(5, h) + g(8, layer) + g(10, x1) + g(20, y1) + g(30, 0) + g(11, x2) + g(21, y2) + g(31, 0); }
function lwpoly(h, layer, pts, closed) {
  let s = g(0, 'LWPOLYLINE') + g(5, h) + g(8, layer) + g(100, 'AcDbPolyline') + g(90, pts.length) + g(70, closed ? 1 : 0);
  pts.forEach(p => { s += g(10, p[0]) + g(20, p[1]); }); return s;
}
function insert(h, layer, name, x, y) { return g(0, 'INSERT') + g(5, h) + g(8, layer) + g(2, name) + g(10, x) + g(20, y) + g(30, 0) + g(50, 0); }
function dimension(h, layer) { return g(0, 'DIMENSION') + g(5, h) + g(8, layer) + g(2, '*D1') + g(10, 0) + g(20, 0) + g(30, 0) + g(11, 1) + g(21, 1) + g(31, 0) + g(70, 0) + g(1, ''); }
function f1(order, opts) {
  opts = opts || {};
  const ents = {
    A1: line('A1', 'A-WALL', 0, 0, 5, 0), A2: line('A2', 'A-WALL', 5, 0, 5, 4),
    A3: line('A3', 'A-WALL', 5, 4, 0, 4), A4: line('A4', 'A-WALL', 0, 4, 0, 0),
    B1: lwpoly('B1', 'S-SLAB', [[0, 0], [5, 0], [5, 4], [0, 4]], !opts.openSlab),
    C1: insert('C1', 'A-DOOR', 'DOOR900', 2, 0), D1: dimension('D1', 'A-DIMS-1'), E1: line('E1', 'JUNK', 1, 1, 2, 2)
  };
  const keys = order || Object.keys(ents);
  return g(0, 'SECTION') + g(2, 'HEADER') + g(9, '$INSUNITS') + g(70, 6) + g(0, 'ENDSEC') +
         g(0, 'SECTION') + g(2, 'ENTITIES') + keys.map(k => ents[k]).join('') + g(0, 'ENDSEC') + g(0, 'EOF');
}
const MAP = { version: 1, rules: [
  { match: 'suffix', pattern: 'A-WALL', type: 'wall' }, { match: 'suffix', pattern: 'S-SLAB', type: 'slab' },
  { match: 'suffix', pattern: 'A-DOOR', type: 'component' }, { match: 'suffix', pattern: 'A-OPENING', type: 'opening' },
  { match: 'exact', pattern: 'A-DIMS-1', type: 'ignore' } ] };
const CFG = { version: 1, units: 'm', snap_tol: 0.001, wall_mode: 'centreline',
  wall: { thickness: 0.2, height: 3.0, base: 0.0 }, slab: { thickness: 0.2, level: 0.0 } };
const deps = lib => ({ DxfParser, hashHex, library: lib });
const go = (txt, cfg, lib) => D.run(txt, MAP, cfg || CFG, deps(lib || ['DOOR900']));

let fails = 0;
function check(id, issue, ok, detail) { if (!ok) fails++; console.log((ok ? 'PASS ' : 'FAIL ') + id + ' | ' + issue + ' | ' + detail); }
const opsKey = r => JSON.stringify(r.ops);   // no timestamps in ops (timestamp is added by commitOp, outside this module)

// T1 determinism
const a = go(f1()), b = go(f1());
check('T1', 'output depends on something other than inputs', opsKey(a) === opsKey(b) && a.run_id === b.run_id, 'run_id=' + a.run_id.slice(0, 12) + ' ops=' + a.ops.length);

// T2 file order independence of ELEMENT ops: same entities, different file order.
// run_id differs (dxf text differs) so compare element ops with run_id stripped.
const strip = r => JSON.stringify(r.ops.map(o => ({ t: o.op_type, p: Object.assign({}, o.params, { run_id: 0, dxf_hash: 0 }) })));
const sh = go(f1(['E1', 'D1', 'C1', 'B1', 'A4', 'A3', 'A2', 'A1']));
check('T2', 'output depends on file order instead of handle order (R2)', strip(a) === strip(sh), 'ops=' + sh.ops.length);

// T3 values vs hand-computed list (SPEC 7.3)
const walls = a.ops.filter(o => o.op_type === 'DXF_WALL'), slabs = a.ops.filter(o => o.op_type === 'DXF_SLAB');
const comps = a.ops.filter(o => o.op_type === 'DXF_COMPONENT'), gaps = a.ops.filter(o => o.op_type === 'DXF_GAP');
const lens = walls.map(o => o.params.length);
const okT3 = walls.length === 4 && JSON.stringify(lens) === JSON.stringify([5, 4, 5, 4]) &&
  walls.every(o => o.params.thickness === 0.2 && o.params.height === 3.0 && o.params.base === 0) &&
  slabs.length === 1 && slabs[0].params.area === 20 && slabs[0].params.thickness === 0.2 &&
  comps.length === 1 && comps[0].params.block === 'DOOR900' && comps[0].params.position.join() === '2,0' &&
  a.report.counts.ignored === 1 && gaps.length === 1 && gaps[0].params.code === 'GAP:unmapped_layer' && gaps[0].params.layer === 'JUNK';
check('T3', 'pipeline produces wrong or invented geometry', okT3, 'walls=' + lens + ' slabArea=' + (slabs[0] && slabs[0].params.area) + ' comps=' + comps.length + ' gaps=' + gaps.map(x => x.params.code));

// T4 no default height
const cfg4 = JSON.parse(JSON.stringify(CFG)); delete cfg4.wall.height;
const r4 = go(f1(), cfg4);
const n4 = r4.ops.filter(o => o.op_type === 'DXF_GAP' && o.params.code === 'GAP:no_dimension').length;
check('T4', 'a default wall height is silently invented (R3)', r4.ops.filter(o => o.op_type === 'DXF_WALL').length === 0 && n4 === 4, 'walls=0? gap no_dimension=' + n4);

// T5 open slab polyline not auto-closed
const r5 = go(f1(null, { openSlab: true }));
check('T5', 'open outline silently auto-closed', r5.ops.filter(o => o.op_type === 'DXF_SLAB').length === 0 &&
  r5.ops.some(o => o.op_type === 'DXF_GAP' && o.params.code === 'GAP:unclosed'), 'gaps=' + r5.report.gaps.map(x => x.code));

// T7 accounting + provenance + object params
const emitted = a.ops.filter(o => /^DXF_(WALL|SLAB|COMPONENT)$/.test(o.op_type));
const handles = new Set(emitted.map(o => o.params.handle).concat(a.report.ignored.map(x => x.handle), a.report.gaps.map(x => x.handle)));
const prov = emitted.every(o => o.params.handle && o.params.layer && typeof o.params === 'object' && typeof JSON.parse(JSON.stringify(o.params)) === 'object');
check('T7', 'entity vanishes with no trace / provenance missing (R4)', handles.size === a.report.counts.entities && prov,
  'entities=' + a.report.counts.entities + ' accounted=' + handles.size + ' provenance=' + prov);

// T9 unknown block
const r9 = go(f1(), CFG, []);
check('T9', 'unknown block silently placed with guessed size', r9.ops.filter(o => o.op_type === 'DXF_COMPONENT').length === 0 &&
  r9.report.gaps.some(x => x.code === 'GAP:unknown_block'), 'gaps=' + r9.report.gaps.map(x => x.code));

// U1 unit scaling: F1 drawn in mm (x1000, $INSUNITS=4, no config.units) must equal F1 in m
function f1mm() {
  return f1().replace(/\n10\n([-\d.]+)\n20\n([-\d.]+)/g, (m, x, y) => '\n10\n' + x * 1000 + '\n20\n' + y * 1000)
             .replace(/\n11\n([-\d.]+)\n21\n([-\d.]+)/g, (m, x, y) => '\n11\n' + x * 1000 + '\n21\n' + y * 1000)
             .replace('$INSUNITS\n70\n6', '$INSUNITS\n70\n4');
}
const cfgU = JSON.parse(JSON.stringify(CFG)); delete cfgU.units;
const rU = go(f1mm(), cfgU);
const pm = r => JSON.stringify(r.ops.filter(o => /WALL|SLAB|COMPONENT/.test(o.op_type)).map(o => Object.assign({}, o.params, { run_id: 0 })));
check('U1', 'unit scaling wrong (mm drawing placed 1000x too large or unscaled)', pm(rU) === pm(a) && rU.ops[0].params.units === 'mm',
  'units=' + rU.ops[0].params.units + ' factor=' + rU.ops[0].params.factor_to_m + ' wall1=' + JSON.stringify(rU.ops.find(o => o.op_type === 'DXF_WALL').params.length));

// U2 header-derived units must be flagged; config-supplied must not; extent must be logged
const rH = rU, rC = a;   // rU: units from header (cfgU has no units); a: config.units='m'
check('U2', 'header units trusted silently (wrong $INSUNITS scales the model with no warning)',
  rH.report.warnings.length === 1 && /units_from_header/.test(rH.report.warnings[0]) && rC.report.warnings.length === 0 &&
  rC.ops[0].params.units_source === 'config' && JSON.stringify(rC.report.extent_m) === JSON.stringify({ min: [0, 0], max: [5, 4] }),
  'header warn=' + JSON.stringify(rH.report.warnings) + ' config warn=' + rC.report.warnings.length + ' extent=' + JSON.stringify(rC.report.extent_m));

// T10 markings on the reserved layer must not change any geometry or gap
const MKm = require(path.join(__dirname, '../../deploy/dev/dxf2marks.js'));
const marked = MKm.writeMarks(f1(), [{ text: '@SET=T' }, { text: '@VIEW=PLAN' }, { text: '@LEVEL=0' }]);
const rM = go(marked);
const elemSig = r => JSON.stringify(r.ops.filter(o => o.op_type !== 'DXF_RUN').map(o => [o.op_type, Object.assign({}, o.params, { run_id: 0 })]));
check('T10', 'marker entities change geometry or create gaps', elemSig(rM) === elemSig(a) && rM.report.counts.ignored === a.report.counts.ignored + 3 && rM.report.gaps.length === a.report.gaps.length,
  'ignored ' + a.report.counts.ignored + ' -> ' + rM.report.counts.ignored + ' gaps ' + a.report.gaps.length + ' -> ' + rM.report.gaps.length + ' same elements=' + (elemSig(rM) === elemSig(a)));

// T11 region filter (SPEC §31 V3): hand-counted fixture, region [0,0,10,10] m
const regTxt = g(0, 'SECTION') + g(2, 'HEADER') + g(9, '$INSUNITS') + g(70, 6) + g(0, 'ENDSEC') + g(0, 'SECTION') + g(2, 'ENTITIES') +
  line('A1', 'A-WALL', 0, 0, 5, 0) + line('A2', 'A-WALL', 5, 0, 5, 4) + line('A3', 'A-WALL', 5, 4, 0, 4) + line('A4', 'A-WALL', 0, 4, 0, 0) + insert('C1', 'A-DOOR', 'DOOR900', 2, 0) +
  line('B1', 'A-WALL', 20, 0, 25, 0) +             // second sheet: fully outside
  line('B2', 'A-WALL', 8, 1, 12, 1) +              // straddles the region edge
  g(0, 'ENDSEC') + g(0, 'EOF');
const rR = D.run(regTxt, MAP, CFG, { DxfParser, hashHex, library: ['DOOR900'], region: [0, 0, 10, 10] });
const wallsR = rR.ops.filter(o => o.op_type === 'DXF_WALL').map(o => o.params.handle).join();
check('T11', 'region filter keeps/drops the wrong entities or counts them wrongly', wallsR === 'A1,A2,A3,A4' && rR.report.counts.entities === 5 && rR.report.region.file_entities === 7 && rR.report.region.outside_region === 1 && rR.report.region.straddle === 1 &&
  rR.report.region.straddle_list[0].handle === 'B2' && rR.ops.filter(o => o.op_type === 'DXF_COMPONENT').length === 1,
  'walls=' + wallsR + ' kept=' + rR.report.counts.entities + ' file=' + rR.report.region.file_entities + ' outside=' + rR.report.region.outside_region + ' straddle=' + rR.report.region.straddle + ' ' + JSON.stringify(rR.report.region.straddle_list.map(x => x.handle)));
// T12 region = whole file equals no region (elements), and the run id changes with the region
const rAll = D.run(regTxt, MAP, CFG, { DxfParser, hashHex, library: ['DOOR900'], region: [-1e9, -1e9, 1e9, 1e9] }), rNone = D.run(regTxt, MAP, CFG, { DxfParser, hashHex, library: ['DOOR900'] });
const esig = r => JSON.stringify(r.ops.filter(o => o.op_type !== 'DXF_RUN').map(o => [o.op_type, Object.assign({}, o.params, { run_id: 0 })]));
check('T12', 'whole-file region changes the geometry, or run id ignores the region', esig(rAll) === esig(rNone) && rAll.run_id !== rNone.run_id && rR.run_id !== rAll.run_id, 'same elements=' + (esig(rAll) === esig(rNone)) + ' run ids differ: all vs none=' + (rAll.run_id !== rNone.run_id) + ', small vs all=' + (rR.run_id !== rAll.run_id));

// T13 SPLINE anchors (control points): inside kept, outside counted as outside, none left without an anchor
const spline = (h, layer, pts) => g(0, 'SPLINE') + g(5, h) + g(8, layer) + g(70, 8) + g(71, 3) + g(72, 8) + g(73, pts.length) + [0, 0, 0, 0, 1, 1, 1, 1].map(k => g(40, k)).join('') + pts.map(p => g(10, p[0]) + g(20, p[1]) + g(30, 0)).join('');
const spTxt = g(0, 'SECTION') + g(2, 'ENTITIES') + spline('S1', 'A-NOTE', [[1, 1], [2, 2], [3, 2], [4, 1]]) + spline('S2', 'A-NOTE', [[21, 1], [22, 2], [23, 2], [24, 1]]) + g(0, 'ENDSEC') + g(0, 'EOF');
const rS = D.run(spTxt, { version: 1, rules: [{ match: 'exact', pattern: 'A-NOTE', type: 'ignore' }] }, { version: 1, units: 'm' }, { DxfParser, hashHex, library: [], region: [0, 0, 10, 10] });
check('T13', 'SPLINE entities have no anchor in the region filter', rS.report.region.no_anchor === 0 && rS.report.region.outside_region === 1 && rS.report.counts.entities === 1 && rS.report.counts.ignored === 1,
  'no_anchor=' + rS.report.region.no_anchor + ' outside=' + rS.report.region.outside_region + ' kept=' + rS.report.counts.entities + ' ignored=' + rS.report.counts.ignored);

console.log('SUMMARY fail=' + fails);
process.exit(fails ? 1 : 0);
