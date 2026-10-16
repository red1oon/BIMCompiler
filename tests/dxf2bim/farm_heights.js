// ⚠ DO NOT REMOVE — SANDBOX: Farmhouse 1st-floor wall heights from the MARKED south elevation (SPEC §60). Read the log after every run (exit code is not evidence).
// Work: Jay Osborne "American Farmhouse", CC BY-SA. File not in repo, never commit it. Usage: node tests/dxf2bim/farm_heights.js <farm_marked.dxf>
// Controls (must FAIL): FARM_HEIGHTS_CONTROL=drop_l2 (removes @Z 3.048 -> band reaches the eave) ; FARM_HEIGHTS_CONTROL=face_maxY (band given to the north face). OBJ is written only without a control.
'use strict';
const fs = require('fs'), crypto = require('crypto'), path = require('path');
const DD = path.join(__dirname, '../../deploy/dev/');
const DxfParser = require(DD + 'dxf-parser.js'), B = require(DD + 'dxf2bim.js'), MK = require(DD + 'dxf2marks.js'), E = require(DD + 'dxf2elev.js'), M = require(DD + 'dxf2mesh.js');
const hashHex = s => crypto.createHash('sha256').update(s).digest('hex');
const CONTROL = process.env.FARM_HEIGHTS_CONTROL || '', IN = 0.0254;
const txt = fs.readFileSync(process.argv[2], 'utf8');
let fails = 0; const check = (id, issue, ok, d) => { if (!ok) fails++; console.log((ok ? 'PASS ' : 'FAIL ') + id + ' | ' + issue + ' | ' + d); };
// plan run exactly as farm_walls.js: pair walls, elevation mode, NO height/base in config, no fallback
const MAP = { version: 1, rules: [{ match: 'exact', pattern: '1', type: 'wallline' }].concat(['0', '2', '3', '5', 'A-TEXTx', 'A-DIMSx', 'A-LINK', 'A-SYMB', 'L-PLNT', 'A-ELEC', 'A-TEXT', '0-NPLT', 'A-DIMS'].map(l => ({ match: 'exact', pattern: l, type: 'ignore' }))) };
const CFG = { version: 1, units: 'in', snap_tol: 0.0005, wall_mode: 'pair', wall: { height_from_elevation: true, pair_thicknesses: [3.5 * IN], pair_tol: 0.0005, pair_min_overlap: 12 * IN, pair_join_gap: 3.5 * IN } };
const SANDBOX = { level_text_dy_in: 12, face_side_in: 6, chain_tol_in: 0.05 };
console.log('control=' + (CONTROL || 'none') + ' ; sandbox tolerances ' + JSON.stringify(SANDBOX) + ' ; config ' + JSON.stringify(CFG));

function runAll() {
  const parsed = new DxfParser().parseSync(txt);
  const views = MK.describeAll(MK.readMarks(parsed.entities)), plan = views.find(v => v.desc.view === 'PLAN'), el = views.find(v => v.desc.view === 'ELEV');
  const markErr = views.reduce((n, v) => n + v.errors.length, 0);
  const elDesc = Object.assign({}, el.desc, { zs: CONTROL === 'drop_l2' ? el.desc.zs.filter(z => Math.abs(z.z - 3.048) > 1e-9) : el.desc.zs });
  const al = MK.align(plan.desc, elDesc, 0.002);
  const R = el.region, inR = e => (e.vertices || []).length && e.vertices.every(v => v.x >= R[0] && v.x <= R[2] && v.y >= R[1] && v.y <= R[3]);
  const elEnts = parsed.entities.filter(inR);
  // ---- WH1 storey band ----
  const L = Number(plan.desc.level), tol = CFG.snap_tol, zs = elDesc.zs.slice().sort((a, b) => a.z - b.z);
  const zL = zs.find(z => Math.abs(z.z - L) <= tol), zN = zs.filter(z => z.z > L + tol)[0];
  const centre = elEnts.filter(e => e.type === 'LINE' && e.layer === '3' && /CENTER/i.test(e.lineType || '') && Math.abs(e.vertices[0].y - e.vertices[1].y) < 0.01);
  const lineAt = z => z && centre.map(e => ({ e, dy: Math.abs(e.vertices[0].y - z.y) })).sort((a, b) => a.dy - b.dy)[0];
  const lL = lineAt(zL), lN = lineAt(zN);
  const clean = t => (t || '').replace(/\\"/g, '"').replace(/\\P/g, ' ').replace(/\{\\[^;]*;/g, '').replace(/[{}]/g, '').replace(/\\[A-Za-z]\d*;?/g, '').replace(/\s+/g, ' ').trim();
  const textsNear = l => l ? parsed.entities.filter(e => (e.type === 'TEXT' || e.type === 'MTEXT') && e.position && e.layer !== 'DXF2BIM-MARK' && e.position.x >= R[0] && e.position.x <= R[2] &&
    Math.abs(e.position.y - l.e.vertices[0].y) <= SANDBOX.level_text_dy_in && e.position.x >= Math.min(l.e.vertices[0].x, l.e.vertices[1].x) - 2 && e.position.x <= Math.max(l.e.vertices[0].x, l.e.vertices[1].x)).map(e => e.handle + ' ' + JSON.stringify(clean(e.text))) : [];
  let band = null;
  if (zL && zN && al.map) {
    const ps = Object.values(elDesc.gridsH).map(h => al.map.toPlan(h)).sort((a, b) => a - b);
    band = { p0: +ps[0].toFixed(6), p1: +ps[ps.length - 1].toFixed(6), z0: zL.z, z1: zN.z, handle: 'LEVELS:' + lL.e.handle + '+' + lN.e.handle };
  }
  // ---- plan + WH2 ----
  const run = B.run(txt, MAP, CFG, { DxfParser, hashHex, library: [], region: plan.region, exclude: plan.desc.excludes });
  const pending = run.ops.filter(o => o.op_type === 'DXF_WALL');
  const face = CONTROL === 'face_maxY' ? 'maxY' : el.desc.face;
  const wh = E.applyWallHeights(run.ops, [{ face, walls: band ? [band] : [] }], CFG, { level: L });
  // ---- WH3 storey rule (variant B) ----
  const key = o => o.params.handle + '|' + o.params.part;
  const gapKeys = new Set(wh.ops.filter(o => o.op_type === 'DXF_GAP' && o.params.code === 'GAP:no_elevation_height').map(key));
  const opsA = wh.ops.filter(o => o.op_type === 'DXF_WALL');
  const opsB = opsA.concat(band ? pending.filter(o => gapKeys.has(key(o))).map(o => Object.assign({}, o, { params: Object.assign({}, o.params, { base: +(band.z0 - L).toFixed(6), height: +(band.z1 - band.z0).toFixed(6), pending_elevation: false, height_source: 'storey_level', elev_members: [band.handle] }) })) : []);
  const meshA = M.meshFromOps(opsA, { level: L, hashHex, snapTol: tol }), meshB = M.meshFromOps(opsB, { level: L, hashHex, snapTol: tol });
  return { parsed, plan, el, elDesc, markErr, al, elEnts, L, zs, zL, zN, lL, lN, textsNear, band, run, pending, face, wh, gapKeys, opsA, opsB, meshA, meshB, objA: M.toObj(meshA.elements), objB: M.toObj(meshB.elements) };
}

const x = runAll(), x2 = runAll();
console.log('marker errors=' + x.markErr + ' ; align ok=' + x.al.ok + ' ' + JSON.stringify(x.al.errors.map(e => e.code || e)));
console.log('elevation @Z (m): ' + x.zs.map(z => z.z).join(', ') + ' ; plan @LEVEL=' + x.L);
console.log('WH1 level L=' + (x.zL && x.zL.z) + ' line ' + (x.lL && x.lL.e.handle) + ' texts ' + JSON.stringify(x.textsNear(x.lL)));
console.log('WH1 next   =' + (x.zN && x.zN.z) + ' line ' + (x.lN && x.lN.e.handle) + ' texts ' + JSON.stringify(x.textsNear(x.lN)));
console.log('WH1 band rect ' + JSON.stringify(x.band) + (x.band ? ' = plan x ' + (x.band.p0 / IN).toFixed(2) + '..' + (x.band.p1 / IN).toFixed(2) + ' in, z ' + (x.band.z0 / IN).toFixed(2) + '..' + (x.band.z1 / IN).toFixed(2) + ' in' : ' REFUSED'));
console.log('WH2 applyWallHeights face=' + x.face + ' report ' + JSON.stringify(x.wh.report) + ' ; plan wall pieces=' + x.pending.length);
const rin = r => r.map(v => +(v / IN).toFixed(2));
x.opsB.slice().sort((a, b) => a.params.rect[1] - b.params.rect[1] || a.params.rect[0] - b.params.rect[0]).forEach(o => console.log('  ' + o.params.pair.join('+') + ' [' + rin(o.params.rect).join(', ') + '] base=' + (o.params.base / IN).toFixed(2) + ' h=' + (o.params.height / IN).toFixed(2) + ' in src=' + o.params.height_source + ' members=' + JSON.stringify(o.params.elev_members)));

// FH1: closed outlines on building layers in the elevation (what H2 elevWallRects would read)
const closed = x.elEnts.filter(e => (e.type === 'LWPOLYLINE' || e.type === 'POLYLINE') && /^[1-5]$/.test(e.layer));
const polys = x.elEnts.filter(e => e.type === 'LWPOLYLINE' || e.type === 'POLYLINE').map(e => e.handle + '/' + e.layer);
check('FH1', 'H2 elevWallRects could read drawn wall outlines here (then a band built from markings would bypass drawn geometry)', closed.length === 0, 'polylines on layers 1-5 in elevation=' + closed.length + ' ; all polylines in region: ' + JSON.stringify(polys));
// FH2: Lnext is the 2nd floor (text) and the elevation's own DIMENSION chain runs floor -> Lnext
const F = x.lL ? x.lL.e.vertices[0].y : NaN, top = x.zN ? (x.zN.z - x.L) / IN : NaN;
const dims = x.parsed.entities.filter(e => e.type === 'DIMENSION' && e.linearOrAngularPoint1 && e.linearOrAngularPoint2 && e.middleOfText && e.middleOfText.x >= x.el.region[0] && e.middleOfText.x <= x.el.region[2] && e.middleOfText.y >= x.el.region[1] && e.middleOfText.y <= x.el.region[3])
  .map(e => { const a = e.linearOrAngularPoint1.y - F, b = e.linearOrAngularPoint2.y - F; return { h: e.handle, y0: Math.min(a, b), y1: Math.max(a, b), m: Number(e.actualMeasurement) }; }).filter(q => Math.abs((q.y1 - q.y0) - q.m) < 0.1);
let cur = 0; const chain = []; for (;;) { const nx = dims.filter(q => Math.abs(q.y0 - cur) < 0.5 && q.y1 > cur + 0.5 && q.y1 <= top + SANDBOX.chain_tol_in).sort((a, b) => b.y1 - a.y1)[0]; if (!nx) break; chain.push(nx); cur = nx.y1; }
const chainSum = chain.reduce((s, q) => s + q.m, 0), nTexts = x.textsNear(x.lN).join(' ');
check('FH2', 'storey band taken from the wrong level line (eave/ridge or a mis-paired line)', /2ND FLOOR/.test(nTexts) && /\+10'-0\\?"/.test(nTexts) && chain.length > 0 && Math.abs(chainSum - top) <= SANDBOX.chain_tol_in,
  'Lnext=' + (x.zN && x.zN.z) + ' m (' + (top).toFixed(3) + ' in) texts ' + nTexts + ' ; DIMENSION chain ' + chain.map(q => q.h + '[' + q.y0.toFixed(2) + '->' + q.y1.toFixed(2) + ' = ' + q.m.toFixed(2) + ']').join(' + ') + ' = ' + chainSum.toFixed(3) + ' in');
// FH3: a line of the facade covers the band on each side (wall drawn through the storey)
const faces = Object.entries(x.el.desc.gridsH), z0r = 0, z1r = top;
const cover = faces.map(([n, h]) => [n, x.elEnts.filter(e => e.type === 'LINE' && /^[1-5]$/.test(e.layer) && Math.abs(e.vertices[0].x - e.vertices[1].x) < 0.01 && Math.abs(e.vertices[0].x - h) <= SANDBOX.face_side_in &&
  Math.min(e.vertices[0].y, e.vertices[1].y) - F <= z0r + 0.01 && Math.max(e.vertices[0].y, e.vertices[1].y) - F >= z1r - 0.01).map(e => e.handle + '/L' + e.layer + '@' + e.vertices[0].x.toFixed(2) + '[' + (Math.min(e.vertices[0].y, e.vertices[1].y) - F).toFixed(2) + '..' + (Math.max(e.vertices[0].y, e.vertices[1].y) - F).toFixed(2) + ']')]);
check('FH3', 'band rect placed where the elevation draws no wall through the storey', cover.every(c => c[1].length > 0), JSON.stringify(cover));
// FH4: elevation set == pieces touching the SOUTH face plane (independent computation from the plan marks)
const sy = x.plan.desc.gridsY.SOUTH_FACE * IN, touchS = x.pending.filter(o => Math.abs(o.params.rect[1] - sy) <= CFG.snap_tol).map(o => o.params.pair.join('+')).sort();
const elevSet = x.opsA.filter(o => o.params.height_source === 'elevation').map(o => o.params.pair.join('+')).sort();
check('FH4', 'the elevation path gives a height to a piece the south elevation cannot see, or misses one it sees', JSON.stringify(elevSet) === JSON.stringify(touchS) && touchS.length > 0, 'elevation=' + JSON.stringify(elevSet) + ' touching south face=' + JSON.stringify(touchS));
// FH5: every height 120 in, base 0
const bad5 = x.opsB.filter(o => Math.abs(o.params.height / IN - 120) > 0.01 || Math.abs(o.params.base) > 1e-9);
check('FH5', 'wrong units or arithmetic in the derived heights (expected 120.00 in = +10\'-0" - +0\'-0", base 0)', bad5.length === 0 && x.opsB.length > 0, 'walls with height=' + x.opsB.length + ' off=' + bad5.length + ' heights(in)=' + JSON.stringify([...new Set(x.opsB.map(o => +(o.params.height / IN).toFixed(3)))]));
// FH6: accounting
const nE = x.opsA.length, nG = x.gapKeys.size, nS = x.opsB.length - x.opsA.length;
check('FH6', 'a wall piece vanished or was doubled', x.pending.length === nE + nG && x.opsB.length === x.pending.length && new Set(x.opsB.map(o => o.params.handle + '|' + o.params.part)).size === x.opsB.length,
  'pieces=' + x.pending.length + ' | variant A: elevation=' + nE + ' GAP:no_elevation_height=' + nG + ' | variant B: elevation=' + nE + ' storey_level=' + nS + ' gaps=' + (x.pending.length - x.opsB.length));
// FH7 / FH8: mesh
const tris = m => m.elements.reduce((s, e) => s + e.faces.length, 0);
[['A', x.meshA, x.opsA], ['B', x.meshB, x.opsB]].forEach(([n, m, ops]) => {
  const bad = m.elements.filter(e => !e.watertight || !(e.volume > 0));
  check('FH7-' + n, 'mesh element open, inside-out or missing', m.elements.length === ops.length && bad.length === 0 && m.gaps.length === 0, 'elements=' + m.elements.length + ' walls=' + ops.length + ' bad=' + bad.length + ' mesh gaps=' + JSON.stringify(m.gaps));
  const vM = m.elements.reduce((s, e) => s + e.volume, 0), vO = ops.reduce((s, o) => s + (o.params.rect[2] - o.params.rect[0]) * (o.params.rect[3] - o.params.rect[1]) * o.params.height, 0);
  check('FH8-' + n, 'mesh volume disagrees with the wall ops (rect area x height)', Math.abs(vM - vO) <= 1e-6, 'mesh ' + vM.toFixed(6) + ' m3 vs ops ' + vO.toFixed(6) + ' m3');
});
const hA = hashHex(x.objA), hB = hashHex(x.objB), hA2 = hashHex(x2.objA), hB2 = hashHex(x2.objB);
check('FH9', 'two full runs give different OBJ text', hA === hA2 && hB === hB2, 'A ' + hA.slice(0, 16) + ' / rerun ' + hA2.slice(0, 16) + ' ; B ' + hB.slice(0, 16) + ' / rerun ' + hB2.slice(0, 16));
console.log('MESH variant A (WH2 only): elements=' + x.meshA.elements.length + ' triangles=' + tris(x.meshA) + ' sha256=' + hA + ' rerun=' + hA2);
console.log('MESH variant B (WH2+WH3): elements=' + x.meshB.elements.length + ' triangles=' + tris(x.meshB) + ' sha256=' + hB + ' rerun=' + hB2);
if (!CONTROL) {
  const out = path.join(__dirname, 'out'); fs.mkdirSync(out, { recursive: true });
  fs.writeFileSync(path.join(out, 'farm_walls_3d.obj'), x.objB); fs.writeFileSync(path.join(out, 'farm_walls_3d_seen.obj'), x.objA);
  const back = hashHex(fs.readFileSync(path.join(out, 'farm_walls_3d.obj'), 'utf8')), backA = hashHex(fs.readFileSync(path.join(out, 'farm_walls_3d_seen.obj'), 'utf8'));
  const pv = M.parseObj(fs.readFileSync(path.join(out, 'farm_walls_3d.obj'), 'utf8'));
  console.log('wrote out/farm_walls_3d.obj sha256(read back)=' + back + ' vertices=' + pv.vertices.length + ' faces=' + pv.faces.length + ' ; out/farm_walls_3d_seen.obj sha256(read back)=' + backA);
} else console.log('control run: no OBJ written');
console.log('SUMMARY fail=' + fails);
