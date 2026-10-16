// ⚠ DO NOT REMOVE — Witness tests MK1-MK8 for deploy/dev/dxf2marks.js. Spec: docs/DXF2BIM_SPEC.md §24. Read the log after every run.
'use strict';
const path = require('path');
const DxfParser = require(path.join(__dirname, '../../deploy/dev/dxf-parser.js'));
const MK = require(path.join(__dirname, '../../deploy/dev/dxf2marks.js'));
const g = (c, v) => c + '\n' + v + '\n';
const base = g(0, 'SECTION') + g(2, 'HEADER') + g(9, '$INSUNITS') + g(70, 4) + g(0, 'ENDSEC') + g(0, 'SECTION') + g(2, 'ENTITIES') +
  g(0, 'LINE') + g(5, 'A1') + g(8, 'A-WALL') + g(10, 0) + g(20, 0) + g(30, 0) + g(11, 100) + g(21, 0) + g(31, 0) + g(0, 'ENDSEC') + g(0, 'EOF');
const T = (text, x, y) => ({ text: text, x: x || 0, y: y || 0 });
const read = (marks) => { const txt = MK.writeMarks(base, marks); const d = new DxfParser().parseSync(txt); return MK.describe(MK.readMarks(d.entities)); };
const PLAN = [T('@SET=T'), T('@VIEW=PLAN'), T('@LEVEL=0'), T('@UNITS=mm'), T('@GRIDX=A', 0, 5), T('@GRIDX=B', 8800, 5), T('@GRIDY=1', 5, -17800), T('@GRIDY=2', 5, 0)];
const el = (face, hax, grids, zs) => [T('@SET=T'), T('@VIEW=ELEV'), T('@FACE=' + face), T('@HAXIS=' + hax), T('@UNITS=mm')].concat(grids.map(([l, x]) => T('@GRIDH=' + l, x, 0)), zs.map(([z, y]) => T('@Z=' + z, 0, y)));
const Z2 = [[0, 0], [3.2, 3200]];
let fails = 0; const check = (id, issue, ok, d) => { if (!ok) fails++; console.log((ok ? 'PASS ' : 'FAIL ') + id + ' | ' + issue + ' | ' + d); };
const codes = r => r.errors.map(e => e.code).join();

// MK1 read every key
const rp = read(PLAN), pd = rp.desc;
check('MK1', 'plan markings read wrongly', !rp.errors.length && pd.set === 'T' && pd.view === 'PLAN' && pd.level === 0 && pd.units === 'mm' && pd.gridsX.A === 0 && pd.gridsX.B === 8800 && pd.gridsY['1'] === -17800 && pd.gridsY['2'] === 0,
  JSON.stringify({ gridsX: pd.gridsX, gridsY: pd.gridsY, level: pd.level }));
// MK2 rejects
const bad1 = read(PLAN.concat([T('@FOO=1')])), bad2 = read(PLAN.concat([T('@LEVEL=abc')])), bad3 = read(PLAN.concat([T('@GRIDX=A', 50, 0)])), bad4 = read(PLAN.concat([T('plain text')]));
check('MK2', 'bad marking accepted', codes(bad1).includes('MARK:unknown_key') && codes(bad2).includes('MARK:malformed') && codes(bad3).includes('MARK:conflict') && codes(bad4).includes('MARK:malformed'),
  'unknown=' + codes(bad1) + ' | malformed=' + codes(bad2) + ' | conflict=' + codes(bad3) + ' | plain=' + codes(bad4));
// MK3 missing keys named exactly
const m3 = read([T('@SET=T'), T('@VIEW=PLAN')]); const miss = m3.errors.find(e => e.code === 'MARK:missing');
check('MK3', 'missing markings defaulted or not named', !!miss && JSON.stringify(miss.keys) === JSON.stringify(['LEVEL', 'UNITS', 'GRIDX(>=2)', 'GRIDY(>=2)']), miss ? miss.message : 'no missing error');
// MK4 axis vs face
const a1 = read(el('minY', '+Y', [['A', 0], ['B', 8800]], Z2)), a2 = read(el('minX', '-Y', [['1', 0], ['2', 100]], Z2));
check('MK4', 'HAXIS parallel to the face normal accepted, or mirrored declaration rejected', codes(a1).includes('MARK:axis_face') && !codes(a2).includes('MARK:axis_face'), 'minY+Y: ' + codes(a1) + ' | minX-Y: ' + (codes(a2) || 'ok'));
// MK5 alignment: FRONT, REAR (mirrored), LEFT, RIGHT against the plan; then REAR with grid B moved 100 mm
const ap = (face, hax, grids) => MK.align(pd, read(el(face, hax, grids, Z2)).desc, 0.01);
const F = ap('minY', '+X', [['A', 0], ['B', 8800]]), R = ap('maxY', '-X', [['A', 0], ['B', -8800]]), Lf = ap('minX', '+Y', [['1', -17800], ['2', 0]]), Rt = ap('maxX', '-Y', [['2', 0], ['1', 17800]]);
const Rbad = ap('maxY', '-X', [['A', 0], ['B', -8700]]);
const near = (a, b) => Math.abs(a - b) < 1e-9;
check('MK5', 'elevation not aligned to the plan (mirror/axis wrong) or a moved grid not detected',
  F.ok && near(F.map.toPlan(8800), 8.8) && R.ok && near(R.map.toPlan(-8800), 8.8) && Lf.ok && near(Lf.map.toPlan(-17800), -17.8) && Rt.ok && near(Rt.map.toPlan(17800), -17.8) &&
  !Rbad.ok && Rbad.errors[0].code === 'MARK:align_fail' && near(Math.abs(Rbad.errors[0].residuals[1]), 0.1),
  'FRONT ok=' + F.ok + ' REAR ok=' + R.ok + ' LEFT ok=' + Lf.ok + ' RIGHT ok=' + Rt.ok + ' | REAR with B moved: ' + (Rbad.errors[0] && Rbad.errors[0].code) + ' resid=' + (Rbad.errors[0] && Rbad.errors[0].residuals));
// MK6 level scale
const zok = MK.align(pd, read(el('minY', '+X', [['A', 0], ['B', 8800]], Z2)).desc, 0.01), zbad = MK.align(pd, read(el('minY', '+X', [['A', 0], ['B', 8800]], [[0, 0], [3.2, 3000]])).desc, 0.01);
check('MK6', 'wrong vertical scale accepted', zok.ok && near(zok.map.zOf(3200), 3.2) && !zbad.ok && zbad.errors.some(e => e.code === 'MARK:level_scale_fail'), 'ok zOf(3200)=' + (zok.map && zok.map.zOf(3200)) + ' | bad: ' + zbad.errors.map(e => e.code));
// MK7 write/read round trip leaves originals untouched
const txt7 = MK.writeMarks(base, PLAN), d7 = new DxfParser().parseSync(txt7);
const orig = d7.entities.filter(e => e.type === 'LINE'), hs = d7.entities.map(e => e.handle);
check('MK7', 'writer corrupts the drawing or reuses a handle', orig.length === 1 && orig[0].handle === 'A1' && orig[0].layer === 'A-WALL' && new Set(hs).size === hs.length && MK.readMarks(d7.entities).length === PLAN.length,
  'entities=' + d7.entities.length + ' LINE kept=' + (orig.length === 1) + ' unique handles=' + (new Set(hs).size === hs.length) + ' marks read=' + MK.readMarks(d7.entities).length);
// MK8 marker order in the file does not change the descriptor
const shuf = PLAN.slice().reverse(); const rs = read(shuf);
check('MK8', 'descriptor depends on marker order in the file', JSON.stringify(rs.desc.gridsX) === JSON.stringify(pd.gridsX) && JSON.stringify(rs.desc.gridsY) === JSON.stringify(pd.gridsY) && rs.desc.level === pd.level && !rs.errors.length, 'reversed order errors=' + rs.errors.length);
// ---- §31 regions ----
const rgn = (x0, y0, x1, y1) => T('@REGION=' + [x0, y0, x1, y1].join(','), x0, y0);
const VA = [rgn(0, 0, 100, 100), T('@SET=T', 5, 5), T('@VIEW=PLAN', 5, 5), T('@LEVEL=0', 5, 5), T('@UNITS=m', 5, 5), T('@GRIDX=A', 0, 50), T('@GRIDX=B', 50, 50), T('@GRIDY=1', 50, 0), T('@GRIDY=2', 50, 40)];
const VB = [rgn(200, 0, 300, 100), T('@SET=T', 205, 5), T('@VIEW=ELEV', 205, 5), T('@FACE=minY', 205, 5), T('@HAXIS=+X', 205, 5), T('@UNITS=m', 205, 5), T('@GRIDH=A', 210, 5), T('@GRIDH=B', 260, 5), T('@Z=0', 205, 10), T('@Z=3', 205, 13)];
const readAll = marks => { const txt = MK.writeMarks(base, marks); const d = new DxfParser().parseSync(txt); return MK.describeAll(MK.readMarks(d.entities)); };
const va = readAll(VA.concat(VB));
check('MK9', 'views of one file mixed up or markers lost', va.length === 2 && va.every(v => !v.errors.length) && va.find(v => v.desc.view === 'PLAN').desc.gridsX.B === 50 && va.find(v => v.desc.view === 'ELEV').desc.face === 'minY' &&
  va.find(v => v.desc.view === 'ELEV').desc.zs.length === 2 && JSON.stringify(va.find(v => v.desc.view === 'PLAN').region) === '[0,0,100,100]',
  'views=' + va.length + ' ' + va.map(v => v.desc.view + ' region=' + JSON.stringify(v.region) + ' errors=' + v.errors.length).join(' | '));
// MK10 marker in no region, and marker in two overlapping regions
const out1 = readAll(VA.concat(VB, [T('@NAME=lost', 500, 500)])), ovl = readAll([rgn(0, 0, 100, 100), rgn(50, 0, 150, 100), T('@SET=T', 60, 10)]);
check('MK10', 'marker with no or several views accepted', out1.some(v => v.errors.some(e => e.code === 'MARK:view_ambiguous' && /no region/.test(e.message))) && ovl.some(v => v.errors.some(e => e.code === 'MARK:view_ambiguous' && /2 regions/.test(e.message))),
  'outside: ' + JSON.stringify(out1.flatMap(v => v.errors.map(e => e.message))) + ' | overlap: ' + JSON.stringify(ovl.flatMap(v => v.errors.map(e => e.message))));
// MK11 no REGION = one implicit view equal to describe()
const one = readAll(PLAN), plain = read(PLAN);
check('MK11', 'file without regions changed behaviour', one.length === 1 && one[0].region === null && JSON.stringify(one[0].desc) === JSON.stringify(plain.desc) && !one[0].errors.length, 'views=' + one.length + ' same descriptor=' + (JSON.stringify(one[0].desc) === JSON.stringify(plain.desc)));
// MK12 duplicate identical REGION is one view; also a set mismatch across views is an error
const dup = readAll(VA.concat([rgn(100, 100, 0, 0)])), mism = readAll(VA.concat(VB.map(m => m.text === '@SET=T' ? Object.assign({}, m, { text: '@SET=OTHER' }) : m)));
check('MK12', 'duplicate region made two views / mismatching @SET accepted', dup.length === 1 && mism.some(v => v.errors.some(e => e.code === 'MARK:set_mismatch')), 'dup views=' + dup.length + ' | mismatch errors=' + JSON.stringify(mism.flatMap(v => v.errors.map(e => e.code))));
// MK13 @EXCLUDE: repeatable, canonical order, duplicates merged, malformed rejected, per view with regions
const exA = read(PLAN.concat([T('@EXCLUDE=20,20,10,10'), T('@EXCLUDE=1,1,5,5'), T('@EXCLUDE=10,10,20,20')]));
const exB = read(PLAN.concat([T('@EXCLUDE=1,2,3')]));
const exV = readAll(VA.concat(VB, [T('@EXCLUDE=10,10,40,40', 10, 10)]));
check('MK13', 'exclusion rectangles read wrongly or leak into another view', J2(exA.desc.excludes) === '[[1,1,5,5],[10,10,20,20]]' && !exA.errors.length && exB.errors.some(e => e.code === 'MARK:malformed') &&
  J2(exV.find(v => v.desc.view === 'PLAN').desc.excludes) === '[[10,10,40,40]]' && exV.find(v => v.desc.view === 'ELEV').desc.excludes.length === 0,
  'canonical=' + J2(exA.desc.excludes) + ' malformed=' + exB.errors.map(e => e.code) + ' per-view PLAN=' + J2(exV.find(v => v.desc.view === 'PLAN').desc.excludes) + ' ELEV=' + J2(exV.find(v => v.desc.view === 'ELEV').desc.excludes));
function J2(x) { return JSON.stringify(x); }
// MK14 @OPENING: valid, canonical order, duplicates merged, bad kind / arity rejected, per view
const oA = read(PLAN.concat([T('@OPENING=window,50,10,20,40'), T('@OPENING=door,0,0,10,30'), T('@OPENING=window,20,40,50,10')]));
const oB = read(PLAN.concat([T('@OPENING=gate,0,0,1,1')])), oC = read(PLAN.concat([T('@OPENING=door,0,0,1')]));
const oV = readAll(VA.concat(VB, [T('@OPENING=window,210,2,230,12', 215, 5)]));
check('MK14', 'opening rectangles read wrongly, accepted when malformed, or leaked to another view', J2(oA.desc.openings) === '[{"kind":"door","h0":0,"y0":0,"h1":10,"y1":30},{"kind":"window","h0":20,"y0":10,"h1":50,"y1":40}]' && !oA.errors.length &&
  oB.errors.some(e => e.code === 'MARK:malformed') && oC.errors.some(e => e.code === 'MARK:malformed') && oV.find(v => v.desc.view === 'ELEV').desc.openings.length === 1 && oV.find(v => v.desc.view === 'PLAN').desc.openings.length === 0,
  'canonical=' + J2(oA.desc.openings) + ' badkind=' + oB.errors.map(e => e.code) + ' arity=' + oC.errors.map(e => e.code) + ' per-view ELEV=' + oV.find(v => v.desc.view === 'ELEV').desc.openings.length + ' PLAN=' + oV.find(v => v.desc.view === 'PLAN').desc.openings.length);
console.log('SUMMARY fail=' + fails); process.exit(fails ? 1 : 0);
