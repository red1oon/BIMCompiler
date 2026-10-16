// ⚠ DO NOT REMOVE — SANDBOX verification of the markings written by mark_dx_set.js against the SOURCE model (SPEC §24/§25).
// (1) markings read back without errors; (2) each elevation aligns to both plans (grid residual <= 1 mm, level scale);
// (3) FACE is verified: elevation glazing boxes, mapped with the markings to plan coordinates and heights, must equal the source windows that touch the declared face
//     (plan interval 10 mm, sill/head 10 mm), and must NOT equal windows on the opposite face. Read the log after every run.
'use strict';
const fs = require('fs'), path = require('path'), cp = require('child_process');
const DxfParser = require(path.join(__dirname, '../../deploy/dev/dxf-parser.js'));
const MK = require(path.join(__dirname, '../../deploy/dev/dxf2marks.js'));
const ROOT = path.join(__dirname, '../..'), OUT = path.join(__dirname, 'out/marked');
const DB = path.join(ROOT, '2D_Layout/input/DX_extracted.db');
const sql = q => JSON.parse(cp.execFileSync('sqlite3', ['-json', '-readonly', DB, q], { encoding: 'utf8' }) || '[]');
let fails = 0; const check = (id, issue, ok, d) => { if (!ok) fails++; console.log((ok ? 'PASS ' : 'FAIL ') + id + ' | ' + issue + ' | ' + d); };
const load = f => new DxfParser().parseSync(fs.readFileSync(path.join(OUT, 'DX_' + f + '_marked.dxf'), 'utf8'));
const desc = f => { const d = load(f); const r = MK.describe(MK.readMarks(d.entities)); return { d, r }; };
const PL = {}; for (const f of ['FLOOR_GF', 'FLOOR_FF']) { const x = desc(f); PL[f] = x.r.desc; check('MARK-read ' + f, 'markings do not read back cleanly', !x.r.errors.length, 'errors=' + JSON.stringify(x.r.errors.map(e => e.code))); }
const EL = {}, MAPS = {};
for (const f of ['FRONT', 'REAR', 'LEFT', 'RIGHT']) {
  const x = desc(f); EL[f] = x; check('MARK-read ' + f, 'markings do not read back cleanly', !x.r.errors.length, 'face=' + x.r.desc.face + ' haxis=' + x.r.desc.haxis + ' errors=' + JSON.stringify(x.r.errors.map(e => e.code)));
  for (const pf of ['FLOOR_GF', 'FLOOR_FF']) { const a = MK.align(PL[pf], x.r.desc, 0.001); check('ALIGN ' + f + ' to ' + pf, 'elevation not aligned to the plan', a.ok, a.ok ? 'axis=' + a.map.axis + ' s=' + a.map.s + ' labels=' + a.map.labels + ' residual=' + a.map.residual : JSON.stringify(a.errors)); if (pf === 'FLOOR_GF') MAPS[f] = a.map; }
}
// source windows
const win = sql("select m.id id, m.storey st, r.minX a, r.minY b, r.maxX c, r.maxY d, r.minZ z0, r.maxZ z1 from elements_meta m join elements_rtree r on r.id=m.id where m.ifc_class='IfcWindow'");
const FACEPLANE = { minY: v => Math.abs(v.b - (-17.8)) <= 0.01, maxY: v => Math.abs(v.d - 0) <= 0.01, minX: v => Math.abs(v.a - 0) <= 0.01, maxX: v => Math.abs(v.c - 8.8) <= 0.01 };
// elevation glazing clusters (A-GLAZ entities touching within 2 mm), mapped to plan interval + z interval
function clusters(d, map, desc) {
  const T = 2, items = d.entities.filter(e => e.layer === 'A-GLAZ' && (e.vertices || []).length).map(e => { const xs = e.vertices.map(v => v.x), ys = e.vertices.map(v => v.y); return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)]; });
  const par = items.map((_, i) => i), f = i => par[i] === i ? i : (par[i] = f(par[i]));
  for (let i = 0; i < items.length; i++) for (let j = i + 1; j < items.length; j++) { const a = items[i], b = items[j]; if (a[0] <= b[2] + T && b[0] <= a[2] + T && a[1] <= b[3] + T && b[1] <= a[3] + T) par[f(i)] = f(j); }
  const g = {}; items.forEach((b, i) => (g[f(i)] = g[f(i)] || []).push(b));
  return Object.values(g).map(c => { const h0 = Math.min(...c.map(b => b[0])), h1 = Math.max(...c.map(b => b[2])), y0 = Math.min(...c.map(b => b[1])), y1 = Math.max(...c.map(b => b[3]));
    const p = [map.toPlan(h0), map.toPlan(h1)].sort((a, b) => a - b); return { p0: p[0], p1: p[1], z0: map.zOf(y0), z1: map.zOf(y1), n: c.length }; });
}
const near = (a, b) => Math.abs(a - b) <= 0.01;
const matchSet = (cl, wins, axis) => { const used = new Set(); let m = 0; wins.forEach(w => { const w0 = axis === 'X' ? w.a : w.b, w1 = axis === 'X' ? w.c : w.d; const i = cl.findIndex((q, k) => !used.has(k) && near(q.p0, w0) && near(q.p1, w1) && near(q.z0, w.z0) && near(q.z1, w.z1)); if (i >= 0) { used.add(i); m++; } }); return { m, unused: cl.length - used.size }; };
const OPP = { minY: 'maxY', maxY: 'minY', minX: 'maxX', maxX: 'minX' };
for (const f of ['FRONT', 'REAR', 'LEFT', 'RIGHT']) {
  const d = EL[f].r.desc, map = MAPS[f]; if (!map) continue;
  const cl = clusters(EL[f].d, map, d);
  const onFace = win.filter(FACEPLANE[d.face]), onOpp = win.filter(FACEPLANE[OPP[d.face]]);
  const a = matchSet(cl, onFace, map.axis), o = matchSet(cl, onOpp, map.axis);
  check('FACE ' + f + '=' + d.face, 'declared face not supported by the source windows (a face window missing, or the opposite face fits as well)', a.m === onFace.length && o.m < a.m,
    'source windows on ' + d.face + '=' + onFace.length + ' reproduced (plan interval + sill/head within 10 mm)=' + a.m + ' | on opposite ' + OPP[d.face] + '=' + onOpp.length + ' reproduced=' + o.m);
  // every elevation cluster must correspond to SOME source window (any face): clusters not on this face are windows of perpendicular walls seen end-on, or roof windows
  const ax = map.axis === 'X' ? ['a', 'c'] : ['b', 'd'];
  const stray = cl.filter(q => !win.some(w => near(w[ax[0]], q.p0) && near(w[ax[1]], q.p1) && near(w.z0, q.z0) && near(w.z1, q.z1)));
  const endOn = cl.filter(q => !onFace.some(w => near(w[ax[0]], q.p0) && near(w[ax[1]], q.p1) && near(w.z0, q.z0) && near(w.z1, q.z1)));
  check('CLUSTER ' + f, 'an elevation glazing cluster matches no source window at all (invented or mis-mapped)', stray.length === 0,
    'clusters=' + cl.length + ' on-face=' + (cl.length - endOn.length) + ' other source windows seen end-on or on the roof=' + endOn.length + ' strays=' + stray.length + (endOn.length ? ' (end-on widths m: ' + endOn.map(q => +(q.p1 - q.p0).toFixed(3)).join(',') + ')' : ''));
}
console.log('SUMMARY fail=' + fails); process.exit(fails ? 1 : 0);
