// ⚠ DO NOT REMOVE — Witness tests PW1-PW11, EX2-EX3 (pair walls, exclusion regions). Spec: docs/DXF2BIM_SPEC.md §34. Read the log after every run.
'use strict';
const crypto = require('crypto'), path = require('path');
const DxfParser = require(path.join(__dirname, '../../deploy/dev/dxf-parser.js'));
const D = require(path.join(__dirname, '../../deploy/dev/dxf2bim.js'));
const hashHex = s => crypto.createHash('sha256').update(s).digest('hex');
const g = (c, v) => c + '\n' + v + '\n';
const line = (h, l, x1, y1, x2, y2) => g(0, 'LINE') + g(5, h) + g(8, l) + g(10, x1) + g(20, y1) + g(30, 0) + g(11, x2) + g(21, y2) + g(31, 0);
const dxf = parts => g(0, 'SECTION') + g(2, 'ENTITIES') + parts.join('') + g(0, 'ENDSEC') + g(0, 'EOF');
const MAP = { version: 1, rules: [{ match: 'exact', pattern: 'WL', type: 'wallline' }] };
const CFG = { version: 1, units: 'm', snap_tol: 0.001, wall_mode: 'pair', wall: { height: 3, base: 0, pair_thicknesses: [0.1], pair_tol: 0.001, pair_min_overlap: 0.5 } };
const go = (parts, cfg, deps) => D.run(dxf(parts), MAP, cfg || CFG, Object.assign({ DxfParser, hashHex, library: [] }, deps || {}));
const wallsOf = r => r.ops.filter(o => o.op_type === 'DXF_WALL');
const gapsFor = (r, h) => r.ops.filter(o => o.op_type === 'DXF_GAP' && o.params.handle === h).map(o => o.params.code);
const rects = r => wallsOf(r).map(o => o.params.rect);
let fails = 0; const check = (id, issue, ok, d) => { if (!ok) fails++; console.log((ok ? 'PASS ' : 'FAIL ') + id + ' | ' + issue + ' | ' + d); };
const J = JSON.stringify;

// PW1
const r1 = go([line('A1', 'WL', 0, 0, 10, 0), line('A2', 'WL', 0, 0.1, 10, 0.1)]); const w1 = wallsOf(r1)[0];
check('PW1', 'pair of lines not read as one wall', wallsOf(r1).length === 1 && J(w1.params.rect) === '[0,0,10,0.1]' && w1.params.length === 10 && w1.params.thickness === 0.1 && J(w1.params.start) === '[0,0.05]' && J(w1.params.end) === '[10,0.05]' && J(w1.params.pair) === '["A1","A2"]',
  w1 ? J(w1.params.rect) + ' len=' + w1.params.length + ' t=' + w1.params.thickness + ' pair=' + J(w1.params.pair) : 'no wall');
// PW2 opening gap 4..5 in both lines
const r2 = go([line('A1', 'WL', 0, 0, 4, 0), line('A2', 'WL', 5, 0, 10, 0), line('B1', 'WL', 0, 0.1, 4, 0.1), line('B2', 'WL', 5, 0.1, 10, 0.1)]);
check('PW2', 'wall continued across the opening gap or pieces lost', J(rects(r2).sort((a, b) => a[0] - b[0])) === '[[0,0,4,0.1],[5,0,10,0.1]]', J(rects(r2)));
// PW3 corner: outer lines run to the corner, inner lines stop at the perpendicular wall's inner face
const r3 = go([line('A1', 'WL', 0, 0, 10, 0), line('A2', 'WL', 0.1, 0.1, 10, 0.1), line('B1', 'WL', 0, 0, 0, 8), line('B2', 'WL', 0.1, 0.1, 0.1, 8)]);
check('PW3', 'corner pieces do not reach the corner (union rule)', J(rects(r3).map(J).sort().map(JSON.parse)) === '[[0,0,0.1,8],[0,0,10,0.1]]', J(rects(r3)));
// PW4 decking: 5 equally spaced parallel lines
const deck = [0, 0.1, 0.2, 0.3, 0.4].map((y, i) => line('D' + (i + 1), 'WL', 0, y, 3, y));
const r4 = go(deck);
check('PW4', 'a run of equally spaced lines (decking) produced a wall, or a line vanished', wallsOf(r4).length === 0 && ['D1', 'D2', 'D3', 'D4', 'D5'].every(h => gapsFor(r4, h).join() === 'GAP:wall_pair_ambiguous'), 'walls=' + wallsOf(r4).length + ' gaps=' + ['D1', 'D2', 'D3', 'D4', 'D5'].map(h => gapsFor(r4, h)));
// PW5 separation outside tolerance
const r5 = go([line('A1', 'WL', 0, 0, 10, 0), line('A2', 'WL', 0, 0.15, 10, 0.15)]);
check('PW5', 'lines outside the thickness tolerance paired', wallsOf(r5).length === 0 && gapsFor(r5, 'A1').join() === 'GAP:wall_line_unpaired' && gapsFor(r5, 'A2').join() === 'GAP:wall_line_unpaired', 'walls=' + wallsOf(r5).length + ' gaps=' + gapsFor(r5, 'A1') + ' ' + gapsFor(r5, 'A2'));
// PW6 diagonal
const r6 = go([line('A1', 'WL', 0, 0, 3, 3)]);
check('PW6', 'diagonal line silently dropped or used', gapsFor(r6, 'A1').join() === 'GAP:wall_line_diagonal' && wallsOf(r6).length === 0, 'gaps=' + gapsFor(r6, 'A1'));
// PW7 missing pair_thicknesses
const cfg7 = JSON.parse(JSON.stringify(CFG)); delete cfg7.wall.pair_thicknesses;
const r7 = go([line('A1', 'WL', 0, 0, 10, 0), line('A2', 'WL', 0, 0.1, 10, 0.1)], cfg7);
check('PW7', 'default thickness invented', wallsOf(r7).length === 0 && gapsFor(r7, 'A1').join() === 'GAP:no_dimension', 'gaps=' + gapsFor(r7, 'A1'));
// PW8 order independence
let seed = 3; const rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
const all = [line('A1', 'WL', 0, 0, 10, 0), line('A2', 'WL', 0.1, 0.1, 10, 0.1), line('B1', 'WL', 0, 0, 0, 8), line('B2', 'WL', 0.1, 0.1, 0.1, 8), line('C1', 'WL', 3, 2, 3, 5), line('C2', 'WL', 3.1, 2, 3.1, 5)];
const sig = r => J(wallsOf(r).map(o => [o.params.rect, o.params.pair]));
const base = sig(go(all)); let same = 0; for (let i = 0; i < 20; i++) if (sig(go(all.slice().sort(() => rnd() - 0.5))) === base) same++;
check('PW8', 'pairing depends on entity order (R2)', same === 20, 'identical in ' + same + '/20 (' + wallsOf(go(all)).length + ' walls)');
// PW9 overlap shorter than min
const r9 = go([line('A1', 'WL', 0, 0, 0.3, 0), line('A2', 'WL', 0, 0.1, 0.3, 0.1)]);
check('PW9', 'short overlap paired despite pair_min_overlap', wallsOf(r9).length === 0 && gapsFor(r9, 'A1').join() === 'GAP:wall_line_unpaired', 'walls=' + wallsOf(r9).length);
// PW10 two thicknesses
const cfg10 = JSON.parse(JSON.stringify(CFG)); cfg10.wall.pair_thicknesses = [0.1, 0.15];
const r10 = go([line('A1', 'WL', 0, 0, 5, 0), line('A2', 'WL', 0, 0.1, 5, 0.1), line('B1', 'WL', 0, 2, 5, 2), line('B2', 'WL', 0, 2.15, 5, 2.15)], cfg10);
check('PW10', 'a thickness from the list not recognised or taken from the wrong entry', J(wallsOf(r10).map(o => o.params.thickness).sort()) === '[0.1,0.15]', J(wallsOf(r10).map(o => o.params.thickness)));
// PW11 decking next to a wall: found with the pattern guard only and with an exclusion region
const wall = [line('W1', 'WL', 0, 0, 10, 0), line('W2', 'WL', 0, 0.1, 10, 0.1)];
const decking = [0, 1, 2, 3, 4, 5].map((k, i) => line('K' + (i + 1), 'WL', 11 + k * 0.1, 0, 11 + k * 0.1, 2));
const r11a = go(wall.concat(decking)), r11b = go(wall.concat(decking), CFG, { exclude: [[10.9, -0.5, 12, 2.5]] });
check('PW11', 'decking became a wall, or the wall was lost (guard only / exclusion region)', J(rects(r11a)) === '[[0,0,10,0.1]]' && J(rects(r11b)) === '[[0,0,10,0.1]]' && r11b.report.exclude.excluded === 6 && decking.every((_, i) => gapsFor(r11a, 'K' + (i + 1)).join() === 'GAP:wall_pair_ambiguous'),
  'guard only: walls=' + J(rects(r11a)) + ' | with exclude: walls=' + J(rects(r11b)) + ' excluded=' + r11b.report.exclude.excluded);
// EX2 counts: entities fully inside excluded, straddling kept
const exTxt = wall.concat([line('X1', 'WL', 5, 5, 6, 5), line('X2', 'WL', 5, 6, 6, 6), line('X3', 'WL', 5.5, 7, 9, 7)]);   // X1,X2 inside [4,4,7,8]; X3 straddles
const rx = go(exTxt, CFG, { exclude: [[4, 4, 7, 8]] });
check('EX2', 'exclusion counted wrongly or a straddling entity dropped', rx.report.exclude.excluded === 2 && rx.report.exclude.exclude_straddle === 1 && rx.report.counts.entities === 3 && gapsFor(rx, 'X3').includes('GAP:wall_line_unpaired'),
  '5 entities - 2 excluded = 3 kept; excluded=' + rx.report.exclude.excluded + ' straddle=' + rx.report.exclude.exclude_straddle + ' kept=' + rx.report.counts.entities + ' X3 gaps=' + gapsFor(rx, 'X3'));
// EX3 run id changes with the exclusion list
const rn = go(exTxt), re1 = go(exTxt, CFG, { exclude: [[4, 4, 7, 8]] }), re2 = go(exTxt, CFG, { exclude: [[4, 4, 7, 9]] });
check('EX3', 'run id ignores the exclusion list', rn.run_id !== re1.run_id && re1.run_id !== re2.run_id, 'ids differ: none/excl=' + (rn.run_id !== re1.run_id) + ' excl/excl2=' + (re1.run_id !== re2.run_id));
// PW12 T-joint: inner line interrupted by a 0.1 gap (= join gap): one wall; PW13 gap 0.3 not bridged; PW14 no join key: old behaviour; PW15 members/accounting
const cfgJ = JSON.parse(JSON.stringify(CFG)); cfgJ.wall.pair_join_gap = 0.1;
const tj = [line('A1', 'WL', 0, 0, 10, 0), line('B1', 'WL', 0.1, 0.1, 4.95, 0.1), line('B2', 'WL', 5.05, 0.1, 10, 0.1)];
const r12 = go(tj, cfgJ), r14 = go(tj);
check('PW12', 'T-joint (inner line interrupted by one wall thickness) not joined into one wall', J(rects(r12)) === '[[0,0,10,0.1]]' && J(wallsOf(r12)[0].params.members.slice().sort()) === '["A1","B1","B2"]', J(rects(r12)) + ' members=' + J(wallsOf(r12)[0] && wallsOf(r12)[0].params.members));
const wide = [line('A1', 'WL', 0, 0, 10, 0), line('B1', 'WL', 0.1, 0.1, 4.7, 0.1), line('B2', 'WL', 5.0, 0.1, 10, 0.1)];     // gap 0.3 > 0.1
const r13 = go(wide, cfgJ);
check('PW13', 'a gap wider than pair_join_gap was bridged, or a line vanished', wallsOf(r13).length === 0 && ['A1', 'B1', 'B2'].every(h => gapsFor(r13, h).join() === 'GAP:wall_pair_ambiguous'), 'walls=' + wallsOf(r13).length + ' gaps=' + ['A1', 'B1', 'B2'].map(h => gapsFor(r13, h)));
check('PW14', 'without pair_join_gap the T-joint is joined anyway', wallsOf(r14).length === 0 && ['A1', 'B1', 'B2'].every(h => gapsFor(r14, h).join() === 'GAP:wall_pair_ambiguous'), 'walls=' + wallsOf(r14).length);
const accounted = new Set(wallsOf(r12).flatMap(o => o.params.members).concat(r12.report.gaps.map(x => x.handle)));
check('PW15', 'a line of a joined wall is not accounted', ['A1', 'B1', 'B2'].every(h => accounted.has(h)) && r12.report.gaps.length === 0, 'accounted=' + [...accounted].sort());
// PW16 the Farmhouse south-wall case in inches: three inner segments with exactly 3.5 in gaps (float edge: 0.0889000000000024 m vs 0.0889 m) must join
const IN = 0.0254, cfgIn = { version: 1, units: 'in', snap_tol: 0.0005, wall_mode: 'pair', wall: { height_from_elevation: true, pair_thicknesses: [3.5 * IN], pair_tol: 0.0005, pair_min_overlap: 12 * IN, pair_join_gap: 3.5 * IN } };
const fm = [line('37F', 'WL', 2046.75, 6577.27, 2126.25, 6577.27), line('382', 'WL', 2046.75, 6580.77, 2072.5, 6580.77), line('328', 'WL', 2076, 6580.77, 2108.5, 6580.77), line('344', 'WL', 2112, 6580.77, 2126.25, 6580.77)];
const r16 = go(fm, cfgIn), w16 = wallsOf(r16)[0];
check('PW16', 'a gap of exactly one wall thickness (inches, float edge) was not joined', wallsOf(r16).length === 1 && J(w16.params.rect.map(v => +(v / IN).toFixed(2))) === '[2046.75,6577.27,2126.25,6580.77]' && J(w16.params.members.slice().sort()) === '["328","344","37F","382"]' && r16.report.gaps.length === 0,
  w16 ? J(w16.params.rect.map(v => +(v / IN).toFixed(2))) + ' members=' + J(w16.params.members.slice().sort()) + ' gaps=' + r16.report.gaps.length : 'no wall, gaps=' + J(r16.report.gaps.map(x => x.handle + ':' + x.code)));
console.log('SUMMARY fail=' + fails); process.exit(fails ? 1 : 0);
