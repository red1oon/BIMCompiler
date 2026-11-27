// ⚠ DO NOT REMOVE — Witness tests WN1-WN7 (windows from glazing clusters). Spec: docs/DXF2BIM_SPEC.md §22. Read the log after every run.
'use strict';
const crypto = require('crypto'), path = require('path');
const DxfParser = require(path.join(__dirname, '../../deploy/dev/dxf-parser.js'));
const D = require(path.join(__dirname, '../../deploy/dev/dxf2bim.js'));
const hashHex = s => crypto.createHash('sha256').update(s).digest('hex');
const g = (c, v) => c + '\n' + v + '\n';
const poly = (h, l, pts) => g(0, 'LWPOLYLINE') + g(5, h) + g(8, l) + g(100, 'AcDbPolyline') + g(90, pts.length) + g(70, 1) + pts.map(p => g(10, p[0]) + g(20, p[1])).join('');
const rectP = (h, l, x0, y0, x1, y1) => poly(h, l, [[x0, y0], [x1, y0], [x1, y1], [x0, y1]]);
const line = (h, l, x1, y1, x2, y2) => g(0, 'LINE') + g(5, h) + g(8, l) + g(10, x1) + g(20, y1) + g(30, 0) + g(11, x2) + g(21, y2) + g(31, 0);
const dxf = parts => g(0, 'SECTION') + g(2, 'ENTITIES') + parts.join('') + g(0, 'ENDSEC') + g(0, 'EOF');
const MAP = { version: 1, rules: [{ match: 'exact', pattern: 'A-WALL-FULL', type: 'wall' }, { match: 'exact', pattern: 'A-GLAZ', type: 'glazing' }] };
const CFG = { version: 1, units: 'mm', snap_tol: 0.001, host_tol: 0.1, wall_mode: 'footprint', wall: { height: 3.1, base: 0 }, opening: { window: { sill: 0.9, height: 1.2 } } };
const go = (parts, cfg) => D.run(dxf(parts), MAP, cfg || CFG, { DxfParser, hashHex, library: [] });
let fails = 0; const check = (id, issue, ok, d) => { if (!ok) fails++; console.log((ok ? 'PASS ' : 'FAIL ') + id + ' | ' + issue + ' | ' + d); };
const wins = r => r.ops.filter(o => o.op_type === 'DXF_OPENING' && o.params.kind === 'window');
const gapsOf = (r, h) => r.ops.filter(o => o.op_type === 'DXF_GAP' && o.params.handle === h).map(o => o.params.code);
const walls = [rectP('A1', 'A-WALL-FULL', 0, 0, 1000, 200), rectP('A2', 'A-WALL-FULL', 3000, 0, 5000, 200), rectP('A3', 'A-WALL-FULL', 7000, 0, 8000, 200)];
const win1 = [rectP('B1', 'A-GLAZ', 1000, 0, 3000, 20), rectP('B2', 'A-GLAZ', 1000, 180, 3000, 200), rectP('B3', 'A-GLAZ', 1000, 0, 1020, 200), line('B4', 'A-GLAZ', 1000, 100, 3000, 100)];
const win2 = [rectP('C1', 'A-GLAZ', 8000, 0, 9000, 200)];

// WN1 hand: bbox (1,0)-(3,0.2) -> width 2.0, depth 0.2, centre (2.0,0.1), angle 0, host A1 (distance 0 to A1 and A2, lowest handle)
const r1 = go(walls.slice(0, 2).concat(win1)); const w1 = wins(r1)[0];
check('WN1', 'window cluster values wrong or invented', wins(r1).length === 1 && w1.params.width === 2 && w1.params.depth === 0.2 && w1.params.centre.join() === '2,0.1' && w1.params.angle_deg === 0 &&
  w1.params.host_handle === 'A1' && w1.params.members.length === 4 && w1.params.sill === 0.9 && w1.params.height === 1.2,
  w1 ? 'w=' + w1.params.width + ' d=' + w1.params.depth + ' c=' + w1.params.centre + ' host=' + w1.params.host_handle + ' members=' + w1.params.members.length : 'none');
// WN2 two separate clusters
const r2 = go(walls.concat(win1, win2)); const ws2 = wins(r2);
check('WN2', 'separate windows merged or one lost', ws2.length === 2 && ws2.some(o => o.params.centre.join() === '8.5,0.1' && o.params.width === 1 && o.params.host_handle === 'A3'), 'windows=' + ws2.length + ' ' + ws2.map(o => o.params.centre + ' host=' + o.params.host_handle).join(' | '));
// WN3 far from any wall
const far = [rectP('D1', 'A-GLAZ', 50000, 50000, 51000, 50200), line('D2', 'A-GLAZ', 50000, 50100, 51000, 50100)];
const r3 = go(walls.concat(far));
check('WN3', 'far window attached to a wall', wins(r3).length === 0 && gapsOf(r3, 'D1').join() === 'GAP:no_host' && gapsOf(r3, 'D2').join() === 'GAP:no_host', 'gaps D1=' + gapsOf(r3, 'D1') + ' D2=' + gapsOf(r3, 'D2'));
// WN4 missing height
const cfg4 = JSON.parse(JSON.stringify(CFG)); delete cfg4.opening.window.height;
const r4 = go(walls.concat(win1), cfg4);
check('WN4', 'default window height invented', wins(r4).length === 0 && gapsOf(r4, 'B1').join() === 'GAP:no_dimension', 'gaps B1=' + gapsOf(r4, 'B1'));
// WN5 order independence
let seed = 99; const rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
const all = walls.concat(win1, win2); const sig = r => JSON.stringify(wins(r).map(o => [o.params.members, o.params.host_handle, o.params.width, o.params.centre]));
const base = sig(go(all)); let same = 0; for (let i = 0; i < 20; i++) if (sig(go(all.slice().sort(() => rnd() - 0.5))) === base) same++;
check('WN5', 'window clustering/host depends on file order (R2)', same === 20, 'identical in ' + same + '/20');
// WN6 the glazing part gap (bim-ootb §D55: pieces within WINDOW_PART_GAP = 0.05 m are ONE window, measured on JKR): 100 mm apart stays two windows, 5 mm apart joins into one
const wallBase = [rectP('A1', 'A-WALL-FULL', 0, 200, 3000, 400)];
const apart = go(wallBase.concat([rectP('E1', 'A-GLAZ', 0, 0, 1000, 200), rectP('E2', 'A-GLAZ', 1100, 0, 2000, 200)]));
const joined = go(wallBase.concat([rectP('E1', 'A-GLAZ', 0, 0, 1000, 200), rectP('E2', 'A-GLAZ', 1005, 0, 2000, 200)]));
check('WN6', 'the glazing part gap ignored when clustering glazing', wins(apart).length === 2 && wins(joined).length === 1, '100 mm apart windows=' + wins(apart).length + ' | 5 mm apart windows=' + wins(joined).length);
// WN7 accounting
const handles = new Set(); const rr = go(walls.concat(win1, win2, far));
rr.ops.filter(o => o.op_type === 'DXF_OPENING' && o.params.kind === 'window').forEach(o => o.params.members.forEach(m => handles.add(m.handle)));
rr.ops.filter(o => o.op_type === 'DXF_GAP').forEach(o => handles.add(o.params.handle));
const glaz = ['B1', 'B2', 'B3', 'B4', 'C1', 'D1', 'D2'];
check('WN7', 'glazing entity vanished with no trace', glaz.every(h => handles.has(h)), 'accounted=' + glaz.filter(h => handles.has(h)).length + '/' + glaz.length);
console.log('SUMMARY fail=' + fails); process.exit(fails ? 1 : 0);
