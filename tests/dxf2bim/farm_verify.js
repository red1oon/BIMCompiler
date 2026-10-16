// ⚠ DO NOT REMOVE — SANDBOX verification of the Farmhouse markings (SPEC §33). Work: Jay Osborne "American Farmhouse", CC BY-SA. File not in repo.
// Checks the markings against evidence they were NOT built from: openings in the plan's south wall vs openings in the south elevation, sill heights and
// level spacings vs the dimension strings printed on the drawing (values below were read from the rendered sheet), and a flipped axis as negative control.
// Usage: node tests/dxf2bim/farm_verify.js <marked.dxf>. Read the log after every run.
'use strict';
const fs = require('fs'), path = require('path');
const DxfParser = require(path.join(__dirname, '../../deploy/dev/dxf-parser.js'));
const MK = require(path.join(__dirname, '../../deploy/dev/dxf2marks.js'));
const d = new DxfParser().parseSync(fs.readFileSync(process.argv[2], 'utf8'));
let fails = 0; const check = (id, issue, ok, det) => { if (!ok) fails++; console.log((ok ? 'PASS ' : 'FAIL ') + id + ' | ' + issue + ' | ' + det); };
const IN = 0.0254;
const views = MK.describeAll(MK.readMarks(d.entities));
check('MARK-read', 'markings do not read back cleanly (two views expected)', views.length === 2 && views.every(v => !v.errors.length), 'views=' + views.map(v => v.desc.view + ' ' + v.desc.name + ' errors=' + v.errors.length).join(' | '));
const plan = views.find(v => v.desc.view === 'PLAN').desc, elev = views.find(v => v.desc.view === 'ELEV').desc;
const al = MK.align(plan, elev, 0.002);
check('ALIGN', 'south elevation not aligned to the 1st floor plan (faces + level scale, tol 2 mm)', al.ok, al.ok ? 'axis=' + al.map.axis + ' s=' + al.map.s + ' labels=' + al.map.labels + ' face residual=' + al.map.residual + ' m' : JSON.stringify(al.errors));
// negative control: the same markings with HAXIS flipped must NOT align
const flipped = Object.assign({}, elev, { haxis: '-X' }), alF = MK.align(plan, flipped, 0.002);
check('ALIGN-flip', 'a flipped axis still aligns (alignment check is blind)', !alF.ok && alF.errors.some(e => e.code === 'MARK:align_fail'), 'errors=' + alF.errors.map(e => e.code + ' ' + (e.residuals ? JSON.stringify(e.residuals.map(r => +r.toFixed(3))) : '')).join(' | '));
const toPlanIn = h => al.map.toPlan(h) / IN;            // elevation h (in) -> plan x (in)
console.log('offset x_plan = h + ' + +(toPlanIn(0)).toFixed(4) + ' in');

// ---- openings: plan south wall gaps vs elevation openings ----
const PLAN = [1632, 6375, 2448, 6903], ELEV = [0, 5319, 816, 5847];
const inR = (l, r) => l.vertices.every(v => v.x >= r[0] && v.x <= r[2] && v.y >= r[1] && v.y <= r[3]);
const southY = plan.gridsY.SOUTH_FACE, westX = plan.gridsX.WEST_FACE, eastX = plan.gridsX.EAST_FACE;
const seg = d.entities.filter(e => e.type === 'LINE' && inR(e, PLAN) && e.layer === '1' && Math.abs(e.vertices[0].y - southY) < 0.01 && Math.abs(e.vertices[1].y - southY) < 0.01)
  .map(e => [Math.min(e.vertices[0].x, e.vertices[1].x), Math.max(e.vertices[0].x, e.vertices[1].x)]).sort((a, b) => a[0] - b[0]);
const gapsPlan = []; let cur = westX; seg.forEach(s => { if (s[0] - cur > 1) gapsPlan.push([cur, s[0]]); cur = Math.max(cur, s[1]); }); if (eastX - cur > 1) gapsPlan.push([cur, eastX]);
console.log('plan south-wall openings (x in): ' + JSON.stringify(gapsPlan.map(g => [+g[0].toFixed(2), +g[1].toFixed(2), +(g[1] - g[0]).toFixed(2)])));
check('OPEN-plan', 'expected 3 openings in the plan south wall (window, door, window)', gapsPlan.length === 3, 'found ' + gapsPlan.length);
// elevation: windows = gaps in a siding row at rel y 60 above the 1st floor line, door = casing vertical lines 48 in apart reaching the floor line
const floorY = elev.zs.find(z => z.z === 0).y;
const Le = d.entities.filter(e => e.type === 'LINE' && inR(e, ELEV));
const row = Le.filter(l => Math.abs(l.vertices[0].y - l.vertices[1].y) < 0.01 && Math.abs((l.vertices[0].y - floorY) - 60) < 0.05).map(l => [Math.min(l.vertices[0].x, l.vertices[1].x), Math.max(l.vertices[0].x, l.vertices[1].x)]).sort((a, b) => a[0] - b[0]);
const wFaceE = elev.gridsH.WEST_FACE, eFaceE = elev.gridsH.EAST_FACE;
const gapsE = []; let c2 = wFaceE; row.forEach(s => { if (s[0] > c2 + 1 && s[0] < eFaceE) gapsE.push([c2, s[0]]); c2 = Math.max(c2, s[1]); });
const winE = gapsE.filter(g => Math.abs((g[1] - g[0]) - 42) < 0.5);                  // the two 42 in window gaps (the other gaps are trim/porch)
const vlines = Le.filter(l => Math.abs(l.vertices[0].x - l.vertices[1].x) < 0.01 && Math.min(l.vertices[0].y, l.vertices[1].y) - floorY > -2 && Math.min(l.vertices[0].y, l.vertices[1].y) - floorY < 2 && Math.abs(l.vertices[1].y - l.vertices[0].y) > 80).map(l => l.vertices[0].x);
const doorCas = [...new Set(vlines.map(x => +x.toFixed(2)))].sort((a, b) => a - b);
console.log('elevation siding gaps at rel y 60 (h in): ' + JSON.stringify(gapsE.map(g => [+g[0].toFixed(2), +g[1].toFixed(2), +(g[1] - g[0]).toFixed(2)])));
console.log('elevation vertical lines tall (>80 in) starting at the floor line (door casing/jambs): ' + JSON.stringify(doorCas));
const doorE = doorCas.length >= 2 ? [doorCas[0], doorCas[doorCas.length - 1]] : null;
const openE = winE.concat(doorE ? [doorE] : []).sort((a, b) => a[0] - b[0]);
check('OPEN-elev', 'expected 2 window gaps and 1 door casing in the south elevation', winE.length === 2 && !!doorE && openE.length === 3, 'windows=' + winE.length + ' door=' + JSON.stringify(doorE));
if (openE.length === 3 && gapsPlan.length === 3) {
  const res = openE.map((o, i) => { const pc = (gapsPlan[i][0] + gapsPlan[i][1]) / 2, ec = toPlanIn((o[0] + o[1]) / 2); return { dc: +(ec - pc).toFixed(3), dw: +(((o[1] - o[0]) - (gapsPlan[i][1] - gapsPlan[i][0]))).toFixed(3) }; });
  console.log('per opening (elevation mapped to plan - plan): centre difference in, width difference in = ' + JSON.stringify(res));
  check('OPEN-centres', 'an elevation opening does not sit on its plan opening after mapping (tol 0.1 in)', res.every(r => Math.abs(r.dc) <= 0.1), 'centre differences (in) = ' + res.map(r => r.dc));
  // sensitivity control: with the anchor offset wrong by 5 in the centre check must fail (the check is not vacuous)
  const resBad = openE.map((o, i) => ((toPlanIn((o[0] + o[1]) / 2) + 5) - (gapsPlan[i][0] + gapsPlan[i][1]) / 2));
  check('OPEN-sensitivity', 'centre check passes even with the mapping off by 5 in (check is blind)', resBad.every(r => Math.abs(r) > 0.1), 'centre differences with +5 in error (in) = ' + resBad.map(r => +r.toFixed(3)));
  check('OPEN-trim', 'trim width differs between openings (casing is not a constant 10.5 in wider than the plan gap)', res.every(r => Math.abs(r.dw - 10.5) <= 0.1), 'width differences (in) = ' + res.map(r => r.dw) + ' (10.5 = 5.25 in trim each side)');
}
// ---- levels: z of marked lines vs printed dimension strings ----
// printed on the sheet (read from the rendered image): 2ND FLOOR +10'-0", ROOF EAVE +20'-0", ROOF RIDGE +29'-2", first-floor WINDOW SILL 2'-0" above the 1st floor, second-floor sill 3'-0" above the 2nd floor, eave 7'-0" above that sill
const zOfAbs = y => al.map.zOf(y);
const sillLines = [24, 156].map(rel => Le.filter(l => Math.abs(l.vertices[0].y - l.vertices[1].y) < 0.01 && Math.abs((l.vertices[0].y - floorY) - rel) < 0.05));
const sillOk = [[0.6096, sillLines[0]], [3.9624, sillLines[1]]].map(([z, ls]) => ({ z, n: ls.length, zm: ls.length ? zOfAbs(ls[0].vertices[0].y) : null }));
check('LEVEL-sills', 'no sill line found at the printed heights (2\'-0" above 1st floor, 13\'-0" overall), or its marked z is off (tol 2 mm)', sillOk.every(s => s.n > 0 && Math.abs(s.zm - s.z) <= 0.002), JSON.stringify(sillOk.map(s => ({ expected_m: s.z, lines: s.n, marked_z: s.zm && +s.zm.toFixed(4) }))));
const zs = elev.zs.map(q => q.z);
check('LEVEL-spacing', 'level lines not at 0, 10, 20 and 29\'-2" feet (tol 2 mm)', [0, 120 * IN, 240 * IN, 350 * IN].every((z, i) => Math.abs(zs[i] - z) <= 1e-6) && al.ok, 'marked z (m)=' + zs.map(z => +z.toFixed(4)) + ' spacing in=' + zs.map((z, i) => i ? +((z - zs[i - 1]) / IN).toFixed(3) : 0));
const y = elev.zs.map(q => q.y); console.log('drawing y spacing between level lines (in): ' + y.map((v, i) => i ? +(v - y[i - 1]).toFixed(3) : 0) + '  (ridge line is 0.027 in above exact 110 in: drawing drift)');
console.log('SUMMARY fail=' + fails);
