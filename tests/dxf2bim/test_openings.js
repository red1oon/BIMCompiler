// ⚠ DO NOT REMOVE — Witness tests O1-O5 for openings. Spec: docs/DXF2BIM_SPEC.md §9.6-9.7. Read the log after every run.
'use strict';
const crypto = require('crypto'), path = require('path');
const DxfParser = require(path.join(__dirname, '../../deploy/dev/dxf-parser.js'));
const D = require(path.join(__dirname, '../../deploy/dev/dxf2bim.js'));
const hashHex = s => crypto.createHash('sha256').update(s).digest('hex');
const g = (c, v) => c + '\n' + v + '\n';
const line = (h, l, x1, y1, x2, y2) => g(0, 'LINE') + g(5, h) + g(8, l) + g(10, x1) + g(20, y1) + g(30, 0) + g(11, x2) + g(21, y2) + g(31, 0);
const arc = (h, l, cx, cy, r, a0, a1) => g(0, 'ARC') + g(5, h) + g(8, l) + g(10, cx) + g(20, cy) + g(30, 0) + g(40, r) + g(50, a0) + g(51, a1);
function f2(order) {
  const e = {
    A1: line('A1', 'A-WALL', 0, 0, 5, 0), A2: line('A2', 'A-WALL', 5, 0, 5, 4), A3: line('A3', 'A-WALL', 5, 4, 0, 4), A4: line('A4', 'A-WALL', 0, 4, 0, 0),
    F1: arc('F1', 'A-OPENING', 2, 0, 0.9, 0, 90),            // on wall A1
    F2: arc('F2', 'A-OPENING', 50, 50, 0.9, 0, 90),          // far from every wall
    F3: line('F3', 'A-OPENING', 4, 4, 4.1, 4), F4: line('F4', 'A-OPENING', 4.1, 4, 4.1, 4.1), F5: line('F5', 'A-OPENING', 4.1, 4.1, 4, 4.1),
    F6: arc('F6', 'A-OPENING', 0, 0, 0.8, 0, 90)             // corner: distance 0 to A1 and A4
  };
  return g(0, 'SECTION') + g(2, 'HEADER') + g(9, '$INSUNITS') + g(70, 6) + g(0, 'ENDSEC') + g(0, 'SECTION') + g(2, 'ENTITIES') +
    (order || Object.keys(e)).map(k => e[k]).join('') + g(0, 'ENDSEC') + g(0, 'EOF');
}
const MAP = { version: 1, rules: [{ match: 'suffix', pattern: 'A-WALL', type: 'wall' }, { match: 'suffix', pattern: 'A-OPENING', type: 'opening' }] };
const CFG = { version: 1, units: 'm', snap_tol: 0.001, host_tol: 0.3, wall: { thickness: 0.2, height: 3.0, base: 0.0 }, opening: { door: { height: 2.1 } } };
const go = (txt, cfg) => D.run(txt, MAP, cfg || CFG, { DxfParser, hashHex, library: [] });
let fails = 0;
const check = (id, issue, ok, d) => { if (!ok) fails++; console.log((ok ? 'PASS ' : 'FAIL ') + id + ' | ' + issue + ' | ' + d); };
const openingFor = (r, h) => r.ops.find(o => o.op_type === 'DXF_OPENING' && o.params.handle === h);
const wallGuid = (r, h) => r.ops.find(o => o.op_type === 'DXF_WALL' && o.params.handle === h).output_guid;
const gapsFor = (r, h) => r.ops.filter(o => o.op_type === 'DXF_GAP' && o.params.handle === h).map(o => o.params.code);

const r = go(f2());
// O1
const o1 = openingFor(r, 'F1');
check('O1', 'opening width invented/wrong or wrong host wall', !!o1 && o1.params.width === 0.9 && o1.params.hinge.join() === '2,0' &&
  o1.params.host_wall === wallGuid(r, 'A1') && o1.params.host_handle === 'A1' && o1.params.swing_start_deg === 0 && o1.params.swing_end_deg === 90,
  o1 ? 'width=' + o1.params.width + ' hinge=' + o1.params.hinge + ' host=' + o1.params.host_handle + ' swing=' + o1.params.swing_start_deg + '..' + o1.params.swing_end_deg : 'no opening');
// O2
check('O2', 'far opening silently snapped to a wall', !openingFor(r, 'F2') && gapsFor(r, 'F2').join() === 'GAP:no_host', 'F2 gaps=' + gapsFor(r, 'F2'));
// O3
const lineGaps = ['F3', 'F4', 'F5'].map(h => gapsFor(r, h).join());
check('O3', 'loose LINEs guessed into a window', lineGaps.every(x => x === 'GAP:opening_unclassified') && !['F3', 'F4', 'F5'].some(h => openingFor(r, h)), 'gaps=' + lineGaps);
// O4: corner tie → lowest handle (A1) across 20 deterministic permutations
let seed = 12345; const rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
const keys = ['A1', 'A2', 'A3', 'A4', 'F1', 'F2', 'F3', 'F4', 'F5', 'F6'];
let hosts = new Set(), n = 0;
for (let i = 0; i < 20; i++) { const k = keys.slice().sort(() => rnd() - 0.5); const x = openingFor(go(f2(k)), 'F6'); hosts.add(x && x.params.host_handle); n++; }
check('O4', 'host choice depends on file order (R2)', hosts.size === 1 && hosts.has('A1'), 'permutations=' + n + ' hosts=' + [...hosts]);
// O5
const cfg5 = JSON.parse(JSON.stringify(CFG)); delete cfg5.opening;
const r5 = go(f2(), cfg5);
check('O5', 'default door height invented', !openingFor(r5, 'F1') && gapsFor(r5, 'F1').join() === 'GAP:no_dimension', 'F1 gaps=' + gapsFor(r5, 'F1'));
// extra: every emitted opening carries no_host_cut gap (SPEC 9.5)
check('O6', 'cut silently implied (9.5: no cut in v1)', ['F1', 'F6'].every(h => gapsFor(r, h).includes('GAP:no_host_cut')), 'F1=' + gapsFor(r, 'F1') + ' F6=' + gapsFor(r, 'F6'));
// O13/O14 min door width (SPEC 21 F8)
const smallArc = g(0, 'SECTION') + g(2, 'ENTITIES') + line('A1', 'A-WALL', 0, 0, 5, 0) + arc('F1', 'A-OPENING', 2, 0, 0.174, 0, 90) + arc('F2', 'A-OPENING', 3, 0, 0.9, 0, 90) + g(0, 'ENDSEC') + g(0, 'EOF');
const cfg13 = JSON.parse(JSON.stringify(CFG)); cfg13.opening.door.min_width = 0.5;
const r13 = go(smallArc, cfg13), r13b = go(smallArc);
check('O13', 'a 0.174 m arc emitted as a door despite min_width / hidden default filter', !openingFor(r13, 'F1') && gapsFor(r13, 'F1').join() === 'GAP:door_below_min_width' && !!openingFor(r13b, 'F1'),
  'with min_width: opening=' + !!openingFor(r13, 'F1') + ' gaps=' + gapsFor(r13, 'F1') + ' | key absent: opening=' + !!openingFor(r13b, 'F1'));
check('O14', 'min_width removes a legitimate 0.9 m door', !!openingFor(r13, 'F2') && openingFor(r13, 'F2').params.width === 0.9, 'F2 opening=' + !!openingFor(r13, 'F2'));
console.log('SUMMARY fail=' + fails); process.exit(fails ? 1 : 0);
