// ⚠ DO NOT REMOVE — Witness tests O7-O12 (door parts, rectangle openings). Spec: docs/DXF2BIM_SPEC.md §12. Read the log after every run.
// DXF handles must be hex (sorted numerically). All expected values are hand-computed in the comments.
'use strict';
const crypto = require('crypto'), path = require('path');
const DxfParser = require(path.join(__dirname, '../../deploy/dev/dxf-parser.js'));
const D = require(path.join(__dirname, '../../deploy/dev/dxf2bim.js'));
const hashHex = s => crypto.createHash('sha256').update(s).digest('hex');
const g = (c, v) => c + '\n' + v + '\n';
const line = (h, l, x1, y1, x2, y2) => g(0, 'LINE') + g(5, h) + g(8, l) + g(10, x1) + g(20, y1) + g(30, 0) + g(11, x2) + g(21, y2) + g(31, 0);
const arc = (h, l, cx, cy, r, a0, a1) => g(0, 'ARC') + g(5, h) + g(8, l) + g(10, cx) + g(20, cy) + g(30, 0) + g(40, r) + g(50, a0) + g(51, a1);
const rectLines = (hs, pts) => hs.map((h, i) => line(h, 'A-OPENING', pts[i][0], pts[i][1], pts[(i + 1) % 4][0], pts[(i + 1) % 4][1]));
const c30 = Math.cos(Math.PI / 6), s30 = 0.5;     // tilted rect: centre (5,2), long 1.0 along 30°, short 0.2
const tilt = [[-0.5, -0.1], [0.5, -0.1], [0.5, 0.1], [-0.5, 0.1]].map(([a, b]) => [5 + a * c30 - b * s30, 2 + a * s30 + b * c30]);
function fx(order) {
  const e = {
    A1: [line('A1', 'A-WALL', 0, 0, 5, 0)], A2: [line('A2', 'A-WALL', 5, 0, 5, 4)], A3: [line('A3', 'A-WALL', 5, 4, 0, 4)], A4: [line('A4', 'A-WALL', 0, 4, 0, 0)],
    F1: [arc('F1', 'A-OPENING', 2, 0, 0.9, 0, 90)],                       // door, hinge (2,0), end point (2,0.9)
    L1: [line('1A', 'A-OPENING', 2, 0, 2, 0.9)],                            // leaf line: touches hinge and arc end → door part (O7)
    R1: rectLines(['2A', '2B', '2C', '2D'], [[1, 3.9], [2.5, 3.9], [2.5, 4.1], [1, 4.1]]),  // O8: width 1.5 depth 0.2 centre (1.75,4) angle 0 host A3
    S1: [line('3A', 'A-OPENING', 30, 30, 31, 30)],                          // stray → gap (O9)
    U1: [line('4A', 'A-OPENING', 10, 10, 11, 10), line('4B', 'A-OPENING', 11, 10, 11, 11), line('4C', 'A-OPENING', 11, 11, 10, 11)], // open U → gaps (O9)
    T1: rectLines(['5A', '5B', '5C', '5D'], tilt)                           // O11: width 1.0 depth 0.2 centre (5,2) angle 30 host A2
  };
  return g(0, 'SECTION') + g(2, 'HEADER') + g(9, '$INSUNITS') + g(70, 6) + g(0, 'ENDSEC') + g(0, 'SECTION') + g(2, 'ENTITIES') +
    (order || Object.keys(e)).map(k => e[k].join('')).join('') + g(0, 'ENDSEC') + g(0, 'EOF');
}
const MAP = { version: 1, rules: [{ match: 'suffix', pattern: 'A-WALL', type: 'wall' }, { match: 'suffix', pattern: 'A-OPENING', type: 'opening' }] };
const CFG = { version: 1, units: 'm', snap_tol: 0.001, host_tol: 0.3, wall: { thickness: 0.2, height: 3.0, base: 0 },
  opening: { door: { height: 2.1 }, rect: { sill: 0.9, height: 1.2 } } };
const go = (txt, cfg) => D.run(txt, MAP, cfg || CFG, { DxfParser, hashHex, library: [] });
let fails = 0;
const check = (id, issue, ok, d) => { if (!ok) fails++; console.log((ok ? 'PASS ' : 'FAIL ') + id + ' | ' + issue + ' | ' + d); };
const gapsFor = (r, h) => r.ops.filter(o => o.op_type === 'DXF_GAP' && o.params.handle === h).map(o => o.params.code);
const rects = r => r.ops.filter(o => o.op_type === 'DXF_OPENING' && o.params.kind === 'rect');
const wallGuid = (r, h) => r.ops.find(o => o.op_type === 'DXF_WALL' && o.params.handle === h).output_guid;
const r = go(fx());

const door = r.ops.find(o => o.op_type === 'DXF_OPENING' && o.params.kind === 'door');
check('O7', 'door leaf line reported as a gap / not tied to its door', JSON.stringify(door.params.parts) === JSON.stringify([{ handle: '1A', part: 0 }]) && gapsFor(r, '1A').length === 0,
  'parts=' + JSON.stringify(door.params.parts) + ' gaps(1A)=' + gapsFor(r, '1A'));

const byH = h => rects(r).find(o => o.params.members.some(m => m.handle === h));
const q = byH('2A');
check('O8', 'rectangle opening values wrong or invented', !!q && q.params.width === 1.5 && q.params.depth === 0.2 && q.params.centre.join() === '1.75,4' && q.params.angle_deg === 0 &&
  q.params.host_wall === wallGuid(r, 'A3') && q.params.members.length === 4 && q.params.sill === 0.9 && q.params.height === 1.2,
  q ? 'w=' + q.params.width + ' d=' + q.params.depth + ' c=' + q.params.centre + ' ang=' + q.params.angle_deg + ' host=' + q.params.host_handle : 'none');

check('O9', 'open U / stray line guessed into an opening', ['3A', '4A', '4B', '4C'].every(h => gapsFor(r, h).join() === 'GAP:opening_unclassified') && rects(r).length === 2,
  'gaps=' + ['3A', '4A', '4B', '4C'].map(h => gapsFor(r, h)) + ' rect openings=' + rects(r).length);

const cfg10 = JSON.parse(JSON.stringify(CFG)); delete cfg10.opening.rect.height;
const r10 = go(fx(), cfg10);
check('O10', 'default rectangle height invented', rects(r10).length === 0 && ['2A', '2B', '2C', '2D'].filter(h => gapsFor(r10, h).includes('GAP:no_dimension')).length >= 1 &&
  gapsFor(r10, '2A').includes('GAP:no_dimension'), 'gaps(2A)=' + gapsFor(r10, '2A') + ' rects=' + rects(r10).length);

const t = byH('5A');
// Tolerance is stated, not hidden: corners are rounded to 1e-6 m (N5) before lengths are derived, so a tilted rect's
// width/depth carry up to 2e-6 m and its angle up to 1e-3 deg of quantisation noise.
const near = (x, y, tol) => Math.abs(x - y) <= tol;
check('O11', 'tilted rectangle angle/width wrong (tol 2e-6 m, 1e-3 deg)', !!t && near(t.params.width, 1, 2e-6) && near(t.params.depth, 0.2, 2e-6) && near(t.params.angle_deg, 30, 1e-3) &&
  near(t.params.centre[0], 5, 2e-6) && near(t.params.centre[1], 2, 2e-6) && t.params.host_handle === 'A2',
  t ? 'w=' + t.params.width + ' d=' + t.params.depth + ' ang=' + t.params.angle_deg + ' c=' + t.params.centre + ' host=' + t.params.host_handle : 'none');

let seed = 777; const rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
const keys = ['A1', 'A2', 'A3', 'A4', 'F1', 'L1', 'R1', 'S1', 'U1', 'T1'];
const sig = x => JSON.stringify(rects(x).map(o => [o.params.members, o.params.host_handle, o.params.width, o.params.centre, o.params.angle_deg]));
const base = sig(r); let same = 0;
for (let i = 0; i < 20; i++) { const k = keys.slice().sort(() => rnd() - 0.5); if (sig(go(fx(k))) === base) same++; }
check('O12', 'rectangle grouping/host depends on file order (R2)', same === 20, 'identical in ' + same + '/20 permutations');
console.log('SUMMARY fail=' + fails); process.exit(fails ? 1 : 0);
