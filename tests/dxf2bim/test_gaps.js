// ⚠ DO NOT REMOVE — Witness tests GO1-GO12 (openings from drawn gaps, classified by marked elevation openings). Spec: docs/DXF2BIM_SPEC.md §36. Read the log after every run.
'use strict';
const crypto = require('crypto'), path = require('path');
const DxfParser = require(path.join(__dirname, '../../deploy/dev/dxf-parser.js'));
const B = require(path.join(__dirname, '../../deploy/dev/dxf2bim.js'));
const MK = require(path.join(__dirname, '../../deploy/dev/dxf2marks.js'));
const E = require(path.join(__dirname, '../../deploy/dev/dxf2elev.js'));
const Mesh = require(path.join(__dirname, '../../deploy/dev/dxf2mesh.js'));
const hashHex = s => crypto.createHash('sha256').update(s).digest('hex');
const g = (c, v) => c + '\n' + v + '\n';
const poly = (h, l, pts) => g(0, 'LWPOLYLINE') + g(5, h) + g(8, l) + g(100, 'AcDbPolyline') + g(90, pts.length) + g(70, 1) + pts.map(p => g(10, p[0]) + g(20, p[1])).join('');
const rectP = (h, x0, y0, x1, y1) => poly(h, 'A-WALL-FULL', [[x0, y0], [x1, y0], [x1, y1], [x0, y1]]);
const dxf = parts => g(0, 'SECTION') + g(2, 'ENTITIES') + parts.join('') + g(0, 'ENDSEC') + g(0, 'EOF');
const T = (text, x, y) => ({ text: text, x: x || 0, y: y || 0 });
const MAP = { version: 1, rules: [{ match: 'exact', pattern: 'A-WALL-FULL', type: 'wall' }] };
const CFG = { version: 1, units: 'mm', snap_tol: 0.001, align_tol: 0.01, elev_centre_tol: 0.05, storey_height: 3.1, wall_mode: 'footprint', wall: { height_from_elevation: true }, opening: { gap_min: 0.5, gap_max: 2.5 } };
const CFGH = JSON.parse(JSON.stringify(CFG)); CFGH.wall = { height: 3.1, base: 0 };       // walls with heights, for the mesh test
const deps = { DxfParser, hashHex, library: [] };
const parse = t => new DxfParser().parseSync(t);
// building 5 x 4 m, walls 200 mm; the front wall (y 0..200) has a gap x 1000..1900
const BACK = rectP('A2', 0, 3800, 5000, 4000), LEFT = rectP('A3', 0, 200, 200, 3800), RIGHT = rectP('A4', 4800, 200, 5000, 3800);
const FRONT2 = [rectP('P1', 0, 0, 1000, 200), rectP('P2', 1900, 0, 5000, 200)];
const PLANMARKS = lvl => [T('@SET=T'), T('@VIEW=PLAN'), T('@LEVEL=' + lvl), T('@UNITS=mm'), T('@GRIDX=A', 0, 0), T('@GRIDX=B', 5000, 0), T('@GRIDY=1', 0, 0), T('@GRIDY=2', 0, 4000)];
const ELEV = (face, hax, a, b, openings) => [T('@SET=T'), T('@VIEW=ELEV'), T('@FACE=' + face), T('@HAXIS=' + hax), T('@UNITS=mm'), T('@GRIDH=' + a[0], a[1], 0), T('@GRIDH=' + b[0], b[1], 0), T('@Z=0', 0, 0), T('@Z=3', 0, 3000)].concat(openings.map(o => T('@OPENING=' + o, 0, 0)));
function plan(parts, cfg, lvl) { const txt = MK.writeMarks(dxf(parts), PLANMARKS(lvl || 0)); return { r: B.run(txt, MAP, cfg || CFG, deps), d: MK.describe(MK.readMarks(parse(txt).entities)).desc }; }
function elev(pl, face, hax, a, b, openings) { const txt = MK.writeMarks(dxf([]), ELEV(face, hax, a, b, openings)); const de = MK.describe(MK.readMarks(parse(txt).entities)).desc; const al = MK.align(pl.d, de, 0.001); if (!al.ok) throw new Error(JSON.stringify(al.errors)); return { face: de.face, openings: E.elevMarkOpenings(de, al.map) }; }
const FRONTE = (pl, ops) => elev(pl, 'minY', '+X', ['A', 0], ['B', 5000], ops);
function classify(pl, els, cfg, lvl) { const cand = E.gapOpenings(pl.r.ops, cfg || CFG, { hashHex }); const all = pl.r.ops.concat(cand.ops); return Object.assign({ cand: cand, all: all }, E.classifyOpenings(all, els, cfg || CFG, { level: lvl || 0, hashHex })); }
const opens = r => r.ops.filter(o => o.op_type === 'DXF_OPENING'), gaps = (r, c) => r.ops.filter(o => o.op_type === 'DXF_GAP' && o.params.code === c);
let fails = 0; const check = (id, issue, ok, d) => { if (!ok) fails++; console.log((ok ? 'PASS ' : 'FAIL ') + id + ' | ' + issue + ' | ' + d); };
const J = JSON.stringify;
const base = [BACK, LEFT, RIGHT].concat(FRONT2), p0 = plan(base);

// GO1
const c1 = E.gapOpenings(p0.r.ops, CFG, { hashHex }), k1 = c1.ops[0];
const guid = h => p0.r.ops.find(o => o.op_type === 'DXF_WALL' && o.params.handle === h).output_guid;
check('GO1', 'gap between collinear pieces not turned into the right candidate', c1.n === 1 && J(k1.params.centre) === '[1.45,0.1]' && k1.params.width === 0.9 && k1.params.depth === 0.2 && k1.params.angle_deg === 0 && k1.params.axis === 'X' && J(k1.params.bbox) === '[1,0,1.9,0.2]' &&
  J(k1.params.gap_between) === J([guid('P1'), guid('P2')]) && k1.params.pending_classification === true, c1.n ? 'centre=' + J(k1.params.centre) + ' width=' + k1.params.width + ' depth=' + k1.params.depth + ' bbox=' + J(k1.params.bbox) : 'none');
// GO2 gap below gap_min (0.3) and above gap_max (2.6)
const pSmall = plan([BACK, LEFT, RIGHT, rectP('P1', 0, 0, 1000, 200), rectP('P2', 1300, 0, 5000, 200)]), pBig = plan([BACK, LEFT, RIGHT, rectP('P1', 0, 0, 1000, 200), rectP('P2', 3600, 0, 5000, 200)]);
check('GO2', 'a gap outside [gap_min, gap_max] became an opening', E.gapOpenings(pSmall.r.ops, CFG, { hashHex }).n === 0 && E.gapOpenings(pBig.r.ops, CFG, { hashHex }).n === 0, 'gap 0.3: ' + E.gapOpenings(pSmall.r.ops, CFG, { hashHex }).n + ' | gap 2.6: ' + E.gapOpenings(pBig.r.ops, CFG, { hashHex }).n);
// GO3 different thickness / offset axes
const pThick = plan([BACK, LEFT, RIGHT, rectP('P1', 0, 0, 1000, 200), rectP('P2', 1900, 0, 5000, 250)]), pOff = plan([BACK, LEFT, RIGHT, rectP('P1', 0, 0, 1000, 200), rectP('P2', 1900, 100, 5000, 300)]);
check('GO3', 'pieces of different thickness or offset axes were treated as one wall', E.gapOpenings(pThick.r.ops, CFG, { hashHex }).n === 0 && E.gapOpenings(pOff.r.ops, CFG, { hashHex }).n === 0, 'thickness: ' + E.gapOpenings(pThick.r.ops, CFG, { hashHex }).n + ' | offset: ' + E.gapOpenings(pOff.r.ops, CFG, { hashHex }).n);
// GO4 vertical gap in the left wall
const pV = plan([BACK, RIGHT, rectP('P1', 0, 0, 5000, 200), rectP('L1', 0, 200, 200, 1000), rectP('L2', 0, 1900, 200, 3800)]);
const kV = E.gapOpenings(pV.r.ops, CFG, { hashHex }).ops[0];
check('GO4', 'vertical wall gap wrong (axis/angle/centre)', !!kV && kV.params.axis === 'Y' && kV.params.angle_deg === 90 && J(kV.params.centre) === '[0.1,1.45]' && J(kV.params.bbox) === '[0,1,0.2,1.9]', kV ? kV.params.axis + ' angle=' + kV.params.angle_deg + ' centre=' + J(kV.params.centre) : 'none');
// GO5 window mark centre 1450 (h 900..2000), y 900..2100
const e5 = FRONTE(p0, ['window,900,900,2000,2100']), r5 = classify(p0, [e5]), o5 = opens(r5)[0];
check('GO5', 'classified opening values wrong or invented', opens(r5).length === 1 && o5.params.category === 'window' && o5.params.sill === 0.9 && o5.params.height === 1.2 && o5.params.width === 0.9 && o5.params.height_source === 'marked_elevation' && o5.params.face === 'minY' && !o5.params.pending_classification,
  o5 ? o5.params.category + ' sill=' + o5.params.sill + ' height=' + o5.params.height + ' width=' + o5.params.width + ' src=' + o5.params.height_source : 'none: ' + r5.ops.filter(o => o.op_type === 'DXF_GAP').map(o => o.params.code));
// GO6 stacked
const r6 = classify(p0, [FRONTE(p0, ['window,900,900,2000,1500', 'window,900,1800,2000,2700'])]);
check('GO6', 'stacked marks merged or one lost', opens(r6).length === 2 && opens(r6).map(o => o.params.sill + '/' + o.params.height).join() === '0.9/0.6,1.8/0.9', opens(r6).map(o => o.params.sill + '/' + o.params.height).join(' | '));
// GO7 door
const r7 = classify(p0, [FRONTE(p0, ['door,1000,0,1900,2100'])]), o7 = opens(r7)[0];
check('GO7', 'door mark not classified as a door with sill 0', !!o7 && o7.params.category === 'door' && o7.params.sill === 0 && o7.params.height === 2.1, o7 ? o7.params.category + ' sill=' + o7.params.sill + ' height=' + o7.params.height : 'none');
// GO8 no matching mark
const r8 = classify(p0, [FRONTE(p0, ['window,3000,900,3900,2100'])]);
check('GO8', 'unmatched gap defaulted, or unmatched mark lost', opens(r8).length === 0 && gaps(r8, 'GAP:no_elevation_match').length === 1 && r8.unmatched_elev.length === 1 && r8.unmatched_elev[0].p0 === 3, 'openings=' + opens(r8).length + ' gap=' + gaps(r8, 'GAP:no_elevation_match').length + ' unmatched marks=' + r8.unmatched_elev.length);
// GO9 centre tolerance: 49 mm off matches, 51 mm off does not
const r9a = classify(p0, [FRONTE(p0, ['window,949,900,2049,2100'])]), r9b = classify(p0, [FRONTE(p0, ['window,951,900,2051,2100'])]);
check('GO9', 'centre tolerance wrong (49 mm should match, 51 mm should not, tol 50 mm)', opens(r9a).length === 1 && opens(r9b).length === 0, 'matches: 49 mm off=' + opens(r9a).length + ', 51 mm off=' + opens(r9b).length);
// GO10 mirrored REAR: gap in the back wall
const BACK2 = [rectP('A2a', 0, 3800, 1000, 4000), rectP('A2b', 1900, 3800, 5000, 4000)], pR = plan([rectP('A1', 0, 0, 5000, 200), LEFT, RIGHT].concat(BACK2));
const eR = elev(pR, 'maxY', '-X', ['A', 0], ['B', -5000], ['window,-2000,900,-900,2100']), rR = classify(pR, [eR]), oR = opens(rR)[0];
check('GO10', 'mirrored elevation maps to the wrong plan centre', eR.openings[0].p0 === 0.9 && eR.openings[0].p1 === 2 && !!oR && oR.params.face === 'maxY' && J(oR.params.centre) === '[1.45,3.9]', 'mark plan interval=' + eR.openings[0].p0 + '..' + eR.openings[0].p1 + ' opening=' + (oR ? J(oR.params.centre) + ' face=' + oR.params.face : 'none'));
// GO11 order independence (plan entities and marks)
let seed = 11; const rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
const sig = (parts, marks) => { const pl = plan(parts), r = classify(pl, [FRONTE(pl, marks)]); return J(opens(r).map(o => [o.params.category, o.params.sill, o.params.height, o.params.centre])); };
const parts11 = [BACK, LEFT, RIGHT].concat(FRONT2), marks11 = ['window,900,900,2000,1500', 'door,900,0,2000,2100', 'window,900,1800,2000,2700'];
const b11 = sig(parts11, marks11); let same = 0; for (let i = 0; i < 20; i++) if (sig(parts11.slice().sort(() => rnd() - 0.5), marks11.slice().sort(() => rnd() - 0.5)) === b11) same++;
check('GO11', 'result depends on entity or marking order (R2)', same === 20, 'identical in ' + same + '/20');
// GO12 mesh: derived window sits in the drawn gap: note, no cut, no outside-wall gap, wall volumes unchanged (hand: P1 1.0*0.2*3.1 = 0.62, P2 3.1*0.2*3.1 = 1.922)
const pH = plan(base, CFGH), cH = pH.r.ops.concat(E.gapOpenings(pH.r.ops, CFGH, { hashHex }).ops), eH = E.classifyOpenings(cH, [FRONTE(pH, ['window,900,900,2000,2100'])], CFGH, { level: 0, hashHex });
const m12 = Mesh.meshFromOps(eH.ops, { level: 0, hashHex, snapTol: CFGH.snap_tol });
const vol = h => m12.elements.filter(e => e.handle === h).reduce((n, e) => n + e.volume, 0);
check('GO12', 'drawn-gap opening cut into a wall, or reported as outside the wall', m12.notes.some(n => n.code === 'NOTE:opening_in_drawn_gap') && !m12.gaps.some(x => x.code === 'GAP:opening_outside_wall') && Math.abs(vol('P1') - 0.62) < 1e-5 && Math.abs(vol('P2') - 1.922) < 1e-5,
  'notes=' + m12.notes.map(n => n.code) + ' gaps=' + m12.gaps.map(x => x.code) + ' P1=' + vol('P1') + ' P2=' + vol('P2'));
// GO13 storey level 3.1: mark z 4.0..5.2 -> sill 0.9 relative to the level (not absolute 4.0)
const p13 = plan(base, CFG, 3.1), e13 = FRONTE(p13, ['window,900,4000,2000,5200']), r13 = classify(p13, [e13], CFG, 3.1), o13 = opens(r13)[0];
check('GO13', 'sill taken absolute instead of relative to the storey level', !!o13 && Math.abs(o13.params.sill - 0.9) < 1e-9 && Math.abs(o13.params.height - 1.2) < 1e-9, o13 ? 'sill=' + o13.params.sill + ' (4.0 - 3.1) height=' + o13.params.height : 'none');
// GO14 interior gap (partition with a doorway, no envelope face): gap logged, never classified from an elevation
const pI = plan(base.concat([rectP('I1', 1000, 1900, 2000, 2000), rectP('I2', 2900, 1900, 4000, 2000)])), rI = classify(pI, [FRONTE(pI, ['door,1000,0,1900,2100', 'door,2000,0,2900,2100'])]);
check('GO14', 'an interior gap was classified from an exterior elevation', gaps(rI, 'GAP:no_elevation_match').some(o => o.params.reason && /interior/.test(o.params.reason)) && opens(rI).length === 1 && opens(rI)[0].params.centre[1] === 0.1, 'interior gap logged=' + gaps(rI, 'GAP:no_elevation_match').length + ' openings=' + opens(rI).length + ' (the front one only)');
// GO15 a pending candidate is never meshed
const mP = Mesh.meshFromOps(pH.r.ops.concat(E.gapOpenings(pH.r.ops, CFGH, { hashHex }).ops), { level: 0, hashHex, snapTol: CFGH.snap_tol });
check('GO15', 'an unclassified candidate was meshed or cut a wall', mP.gaps.some(x => x.code === 'GAP:no_height') && Math.abs(mP.elements.filter(e => e.handle === 'P2').reduce((n, e) => n + e.volume, 0) - 1.922) < 1e-5, 'gaps=' + mP.gaps.map(x => x.code).filter((v, i, a) => a.indexOf(v) === i));
// GO16 storey upper limit: a mark whose top (4.5) is above level + storey_height (3.1) belongs to another storey
const r16 = classify(p0, [FRONTE(p0, ['window,900,3500,2000,4500'])]);
check('GO16', 'a mark from the storey above was matched to this storey', opens(r16).length === 0 && gaps(r16, 'GAP:no_elevation_match').length === 1, 'openings=' + opens(r16).length + ' gaps=' + gaps(r16, 'GAP:no_elevation_match').length);
console.log('SUMMARY fail=' + fails); process.exit(fails ? 1 : 0);
