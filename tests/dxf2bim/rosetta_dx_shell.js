// ⚠ DO NOT REMOVE — ROSETTA basic shapes (BASIC_SHAPES_SPEC.md): Duplex walls (openings cut), floor slabs, roof and LOD400 door/window fills rebuilt
// ONLY from the 2D set (marked copies), then compared with the source model DX_extracted.db (answer key, read only here, never by a module).
// Round trip (DXFs were exported from that model). Run mark_dx_set.js first. Read the log after every run; exit code is not evidence.
// Usage: node tests/dxf2bim/rosetta_dx_shell.js   (env MUT=<id> runs a stated mutation of the witness side, see §9)
'use strict';
const fs = require('fs'), crypto = require('crypto'), path = require('path'), cp = require('child_process');
const DxfParser = require(path.join(__dirname, '../../deploy/dev/dxf-parser.js'));
const B = require(path.join(__dirname, '../../deploy/dev/dxf2bim.js'));
const MK = require(path.join(__dirname, '../../deploy/dev/dxf2marks.js'));
const E = require(path.join(__dirname, '../../deploy/dev/dxf2elev.js'));
const M = require(path.join(__dirname, '../../deploy/dev/dxf2mesh.js'));
const T = require(path.join(__dirname, '../../deploy/dev/dxf2types.js'));
const S = require(path.join(__dirname, '../../deploy/dev/dxf2shell.js'));
const hashHex = s => crypto.createHash('sha256').update(s).digest('hex');
const ROOT = path.join(__dirname, '../..');
// DXSET=std (lane spec L2.3 convergence): the same pipeline on the L1 standard set marked by `mark_dx_set.js std` (out/marked_std), with the std layer maps.
const DXSET = process.env.DXSET || '', STDSET = DXSET === 'std', SFX = STDSET ? '_std' : '';
const OUT = path.join(__dirname, STDSET ? 'out/marked_std' : 'out/marked'), OUTS = path.join(__dirname, STDSET ? 'out/marked_std_shell' : 'out/marked_shell'), DB = path.join(ROOT, '2D_Layout/input/DX_extracted.db'), LIBDB = path.join(ROOT, 'deploy/component_library.db');
const sqlj = (db, q) => JSON.parse(cp.execFileSync('sqlite3', ['-json', '-readonly', db, q], { encoding: 'utf8', maxBuffer: 1 << 28 }) || '[]');
const sql = q => sqlj(DB, q), lsql = q => sqlj(LIBDB, q);
const txt = f => fs.readFileSync(path.join(OUT, 'DX_' + f + '_marked.dxf'), 'utf8');
const ORIG = f => fs.readFileSync(path.join(ROOT, '2D_Layout/output/DXF/DX_' + f + '_20260428_0636.dxf'), 'utf8');
const MUT = process.env.MUT || '';
// §11: the pipeline configuration lives in ONE shared module (also copied verbatim into the Modeller import), not here.
const C = require(path.join(__dirname, '../../deploy/dev/dxf2shell_config.js'));
const { MAP_PLAN, MAP_ELEV, MAP_LEVL, MAP_ROOF } = STDSET ? require('./set_configs.js').STD : C, CFG = C.CFG;   // std: R12 layer names (set_configs.js STD), same CFG
const deps = { DxfParser, hashHex, library: [] };
const lines = []; let fails = 0;
const say = s => { lines.push(s); console.log(s); };
const check = (id, issue, ok, d) => { if (!ok) fails++; say((ok ? 'PASS ' : 'FAIL ') + id + ' | ' + issue + ' | ' + d); };
const J = JSON.stringify, r6 = B.r6;
const parse = t => new DxfParser().parseSync(t);
say('config (no heights, no slab values): ' + J(CFG) + (MUT ? '  MUTATION=' + MUT : ''));

// ---------------- shell marking step (§5.3): @ROOF from the elevation's own roof level text, written into COPIES ----------------
fs.mkdirSync(OUTS, { recursive: true });
const ELEVS = ['FRONT', 'REAR', 'LEFT', 'RIGHT'];
const shellTxt = {};
ELEVS.forEach(f => {
  const t0 = txt(f), d = parse(t0), roofM = MK.describe(MK.readMarks(d.entities)).desc.roof;
  if (typeof roofM === 'number') { shellTxt[f] = t0; fs.writeFileSync(path.join(OUTS, 'DX_' + f + '_shell.dxf'), t0); say('MARK-ROOF ' + f + ': already marked @ROOF=' + roofM + ' (copy unchanged)'); return; }
  const roofT = d.entities.filter(e => e.type === 'TEXT' && e.layer === 'A-ANNO-LEVL' && /^ROOF LEVEL\s+\+?(-?\d+\.\d+)\s*$/.test((e.text || '').trim()));
  if (roofT.length !== 1) { say('MARK-ROOF ' + f + ': REFUSED, roof level texts found=' + roofT.length); shellTxt[f] = t0; return; }
  const z = Number(/(-?\d+\.\d+)\s*$/.exec(roofT[0].text.trim())[1]), p = roofT[0].startPoint || roofT[0].position;
  shellTxt[f] = MK.writeMarks(t0, [{ text: '@ROOF=' + z, x: p.x, y: p.y }]);
  fs.writeFileSync(path.join(OUTS, 'DX_' + f + '_shell.dxf'), shellTxt[f]);
  say('MARK-ROOF ' + f + ': text ' + roofT[0].handle + ' "' + roofT[0].text.trim() + '" -> @ROOF=' + z + ' (copy out/marked_shell/DX_' + f + '_shell.dxf)');
});

// §11 roof-plan role marking (the marker's step, like @ROOF above): a COPY of the ROOF plan gets @SET (the plans' set), @VIEW=ROOF (lane spec L2.3 D1,
// superseding CF-2's PLAN+@ROOF), @LEVEL = the "Roof" storey level FROM_SOURCE_MODEL (R1: min wall minZ, as mark_dx_set.js does for plans),
// @UNITS from its header ($INSUNITS 4 = mm, DXF code table) and @ROOF = the value every marked elevation agrees on.
// Refuses (no copy, run stops) when the elevations disagree or the header units are not 4. The std set has no roof plan: stage skipped, reported.
if (STDSET) { shellTxt.ROOF = null; say('MARK-ROOFPLAN: the std set has no roof plan sheet (L1 writes none); roof-plan stage not run'); } else {
  const roofT0 = ORIG('ROOF'), rd0 = parse(roofT0), setV = MK.describe(MK.readMarks(parse(txt('FLOOR_GF')).entities)).desc.set;
  const rv = [...new Set(ELEVS.map(f => MK.describe(MK.readMarks(parse(shellTxt[f]).entities)).desc.roof).filter(v => typeof v === 'number'))];
  const iu = rd0.header && rd0.header.$INSUNITS, ro = rd0.entities.find(e => e.layer === 'A-ROOF' && (e.type === 'LWPOLYLINE' || e.type === 'POLYLINE') && e.shape);
  if (rv.length !== 1 || iu !== 4 || !ro || !setV) { say('MARK-ROOFPLAN: REFUSED roof values=' + J(rv) + ' $INSUNITS=' + iu + ' outline=' + !!ro + ' set=' + setV); process.exit(1); }
  const p0 = ro.vertices[0], rl = sql("select min(r.minZ) z from elements_meta m join elements_rtree r on r.id=m.id where m.ifc_class='IfcWall' and m.storey='Roof'")[0].z;
  if (typeof rl !== 'number') { say('MARK-ROOFPLAN: REFUSED, the model has no wall in storey Roof (no @LEVEL)'); process.exit(1); }
  const rl3 = Number(rl.toFixed(3));
  shellTxt.ROOF = MK.writeMarks(roofT0, ['@SET=' + setV, '@VIEW=ROOF', '@UNITS=mm', '@NAME=ROOF PLAN', '@LEVEL=' + rl3, '@ROOF=' + rv[0]].map(t => ({ text: t, x: p0.x, y: p0.y })));
  fs.writeFileSync(path.join(OUTS, 'DX_ROOF_shell.dxf'), shellTxt.ROOF);
  say('MARK-ROOFPLAN: @SET=' + setV + ' @VIEW=ROOF @UNITS=mm ($INSUNITS ' + iu + ') @LEVEL=' + rl3 + ' [FROM_SOURCE_MODEL: min wall z of storey Roof] @ROOF=' + rv[0] + ' at A-ROOF ' + ro.handle + ' vertex 0 (copy out/marked_shell/DX_ROOF_shell.dxf)');
}

// ---------------- the pipeline (a function, run twice for determinism) ----------------
function pipeline(popt) {
  popt = popt || {};
  const R = { gaps: [], notes: [], storeys: {} };
  const planDesc = {}; ['FLOOR_GF', 'FLOOR_FF'].forEach(f => { planDesc[f] = MK.describe(MK.readMarks(parse(txt(f)).entities)).desc; });
  const elevs = ELEVS.map(f => { const d = parse(shellTxt[f]), de = MK.describe(MK.readMarks(d.entities)), al = MK.align(planDesc.FLOOR_GF, de.desc, C.MARK_ALIGN_TOL);
    return { name: f, face: de.desc.face, roof: de.desc.roof, errors: de.errors.filter(e => e.code !== 'MARK:missing'), map: al.map, lines: S.levelLinesZ(d.entities, MAP_LEVL, al.map),
      clusters: E.elevClusters(d.entities, MAP_ELEV, al.map, CFG.snap_tol, 'glazing'), walls: E.elevWallRects(d.entities, MAP_ELEV, al.map), doors: E.elevClusters(d.entities, MAP_ELEV, al.map, CFG.snap_tol, 'elevdoor') }; });
  R.elevs = elevs;
  const allRects = [].concat(...elevs.map(e => e.walls));
  const ST = [{ name: 'Level 1', f: 'FLOOR_GF' }, { name: 'Level 2', f: 'FLOOR_FF' }];
  ST.forEach((st, i) => {
    st.level = planDesc[st.f].level;
    st.levelDrawn = allRects.filter(r => Math.abs(r.z0 - st.level) <= CFG.elev_tol).map(r => r.handle);
    const nxt = ST[i + 1] ? planDesc[ST[i + 1].f].level : Math.max(...allRects.filter(r => Math.abs(r.z0 - st.level) <= CFG.elev_tol).map(r => r.z1));
    st.top = nxt;                                                   // storey z range for window matching: next drawn level, or top of this storey's elevation rects
    const run = B.run(txt(st.f), MAP_PLAN, CFG, deps); st.before = run.ops; st.planGaps = run.report.gaps; st.run_id = run.run_id;
    let ops = E.applyElevations(run.ops, elevs.map(e => ({ face: e.face, clusters: e.clusters })), Object.assign({}, CFG, { wall: Object.assign({ height: r6(nxt - st.level) }, CFG.wall) }), { level: st.level, hashHex }).ops;
    ops = E.applyWallHeights(ops, elevs.map(e => ({ face: e.face, walls: e.walls })), CFG, { level: st.level }).ops;
    ops = E.applyDoorHeights(ops, elevs.map(e => ({ face: e.face, doors: e.doors })), CFG, { level: st.level }).ops;
    st.after = ops;
  });
  R.ST = ST;
  // slabs and roof z (S-Z, R-Z) from elevation-derived heights only
  const L1 = ST[0], L2 = ST[1];
  R.slabZ = { 'Level 1': S.slabZ({ level: L1.level, ops: L1.after }, null, CFG), 'Level 2': S.slabZ({ level: L2.level, ops: L2.after }, { level: L1.level, ops: L1.after }, CFG) };
  if (MUT === 'M-S1') R.slabZ['Level 2'] = S.slabZ({ level: L2.level, ops: L2.after }, { level: L1.level, ops: L1.after }, Object.assign({}, CFG, { elev_tol: -1e9 }));   // filter "ends below T" defeated
  R.roofZ = S.roofZ({ level: L2.level, ops: L2.after }, MUT === 'M-R1' ? elevs.map(e => Object.assign({}, e, { roof: undefined })) : elevs, CFG);
  // W-H3 convention for walls no elevation shows: underside of the slab above (L1: Level-2 slab underside; L2: roof bottom)
  const U = { 'Level 1': R.slabZ['Level 2'].bottom, 'Level 2': R.roofZ.bottom };
  // variant A (main, the claim): a wall no elevation shows stays GAP:no_elevation_height (not meshed). Variant B adds the W-H3 convention (labelled slab_above).
  ST.forEach(st => { st.slabAboveN = 0; if (!popt.convention) return; const a = S.applySlabAbove(st.after, st.before, typeof U[st.name] === 'number' ? U[st.name] : undefined, st.level); st.after = a.ops; st.slabAboveN = a.n; });
  // outlines (S-O / R-O)
  ST.forEach(st => { st.ring = S.innerRing(st.after, CFG); });
  if (MUT === 'M-S2') ST.forEach(st => { const E0 = st.ring.envelope; st.ring = { outline: [[E0[0], E0[1]], [E0[2], E0[1]], [E0[2], E0[3]], [E0[0], E0[3]]], gaps: [], envelope: E0 }; });
  if (shellTxt.ROOF) {
    const roofD = parse(shellTxt.ROOF), roofDesc = MK.describe(MK.readMarks(roofD.entities)).desc;
    R.roofPlan = S.roofPlan(roofD.entities, MAP_ROOF, MK.UNITS[roofDesc.units], L2.ring.envelope, L2.ring.outline, CFG);   // §11: factor from the roof plan's @UNITS marking
  } else R.roofPlan = { ok: false, holes: [], gaps: [] };                                    // std set: no roof plan sheet (qualify reports QF:set_no_roof)
  R.run_id = C.runId(B.canon, hashHex, ST.map(st => st.run_id), ['FLOOR_GF', 'FLOOR_FF'].map(f => hashHex(txt(f))).concat(ELEVS.map(f => hashHex(shellTxt[f])), shellTxt.ROOF ? [hashHex(shellTxt.ROOF)] : []));
  // type binding (rosetta_dx_types chain): prefer DUPLEX_NOMINAL (SANDBOX sets by id prefix), 819x759 windows labelled from the SOURCE model (round trip, as its E7)
  const setOf = C.setOf;
  const fams = lsql('select family_id id, opening_type ot, ifc_class, default_width_mm w, default_height_mm h, description d from ad_opening_family where is_active=1');
  const wallT = lsql('select wall_type_id id, total_mm t from ad_wall_type where is_active=1');
  const LIB = { wall: wallT.filter(w => w.id !== 'NONE').map(w => ({ id: w.id, thickness: w.t / 1000 })),
    window: fams.filter(f => f.ot === 'WINDOW').map(f => ({ id: f.id, set: setOf(f.id), width: f.w / 1000, height: f.h / 1000 })), door: fams.filter(f => f.ot === 'DOOR').map(f => ({ id: f.id, set: setOf(f.id), width: f.w / 1000, height: f.h / 1000 })) };
  const LABELMAP = { M_Fixed: 'DUPLEX_SMALL_FIXED', M_Casement: 'DUPLEX_CASEMENT' };
  ST.forEach(st => {
    const sn = sql("select substr(m.element_name,1,instr(m.element_name,':')-1) k, r.minX a, r.minY b, r.maxX c, r.maxY d, r.minZ z0, r.maxZ z1 from elements_meta m join elements_rtree r on r.id=m.id where m.ifc_class='IfcWindow' and m.storey='" + st.name + "' and m.element_type='819mm x 759mm'");
    const lr = T.applyLabels(st.after, { units: 'm', labels: sn.map(x => ({ class: 'window', x: (x.a + x.c) / 2, y: (x.b + x.d) / 2, z: (x.z0 + x.z1) / 2, text: LABELMAP[x.k] })) }, { m: 1 }, { snap_tol: CFG.snap_tol, level: st.level });
    st.labelGaps = lr.gaps.length;
    st.after = T.bindTypes(lr.ops, LIB, { bind: { size_tol: C.TYPES.size_tol, prefer: C.TYPES.prefer } }, {}).ops;
  });
  // openings bridged in drawn gaps (§6)
  ST.forEach(st => {
    const b = S.bridgeOpenings(st.after, CFG, { level: st.level, hashHex });
    st.bridge = b; st.infill = MUT === 'M-O1' ? [] : b.infill;
    if (MUT === 'M-O2') st.infill = b.voids.map((v, i) => { const o = b.infill[0]; return Object.assign({}, o, { output_guid: 'mut' + i, params: Object.assign({}, o.params, { rect: v.axis === 'x' ? [v.s[0], v.cross[0], v.s[1], v.cross[1]] : [v.cross[0], v.s[0], v.cross[1], v.s[1]],
      start: v.axis === 'x' ? [v.s[0], (v.cross[0] + v.cross[1]) / 2] : [(v.cross[0] + v.cross[1]) / 2, v.s[0]], end: v.axis === 'x' ? [v.s[1], (v.cross[0] + v.cross[1]) / 2] : [(v.cross[0] + v.cross[1]) / 2, v.s[1]], length: v.s[1] - v.s[0], thickness: v.cross[1] - v.cross[0], base: 0, height: st.top - st.level }) }); });
    st.voidOf = {}; b.voids.forEach(v => v.keyOf.forEach(k => { st.voidOf[k] = v; }));
  });
  // library rows for fills (read-only): all door/window type geometries of every building in the library (the ambiguity rule needs all candidates)
  const grows = lsql("select m.element_ref, m.ifc_class, m.geometry_hash, hex(g.vertices) v, hex(g.faces) f from ad_geometry_map m join component_geometries g on g.geometry_hash=m.geometry_hash where m.ifc_class in ('IfcDoor','IfcWindow')");
  const seenG = {}, geoms = [];
  grows.forEach(r => { const k = r.element_ref + '|' + r.geometry_hash; if (seenG[k]) return; seenG[k] = 1;
    const vb = Buffer.from(r.v, 'hex'), fb = Buffer.from(r.f, 'hex'), V = [], F = [];
    for (let i = 0; i + 11 < vb.length; i += 12) V.push([vb.readFloatLE(i), vb.readFloatLE(i + 4), vb.readFloatLE(i + 8)]);
    for (let i = 0; i + 11 < fb.length; i += 12) F.push([fb.readInt32LE(i), fb.readInt32LE(i + 4), fb.readInt32LE(i + 8)]);
    const mn = [0, 1, 2].map(a => Math.min(...V.map(v => v[a]))), mx = [0, 1, 2].map(a => Math.max(...V.map(v => v[a])));
    geoms.push({ element_ref: r.element_ref, ifc_class: r.ifc_class, geometry_hash: r.geometry_hash, vertices: V, faces: F, bbox: { min: mn, max: mx } }); });
  const libRows = { families: fams.map(f => ({ family_id: f.id, ifc_class: f.ifc_class, description: f.d })), geoms };
  R.libCount = { families: fams.length, geoms: geoms.length };
  ST.forEach(st => {
    let ops = st.after;
    if (MUT === 'M-F3') ops = ops.map(o => o.op_type === 'DXF_OPENING' && o.params.kind === 'window' ? Object.assign({}, o, { params: Object.assign({}, o.params, { sill: 0 }) }) : o);
    try { st.fills = S.placeFills(ops, libRows, { level: st.level, hashHex, size_tol: C.FILL.size_tol, voidOf: st.voidOf }); st.hard = null; }
    catch (e) { st.fills = { elements: [], gaps: e.gaps || [] }; st.hard = e.message; }
  });
  // ---------------- mesh ----------------
  const els = [];
  ST.forEach(st => {
    const wallOps = st.after.filter(o => o.op_type === 'DXF_WALL').concat(st.infill);
    const m = M.meshFromOps(wallOps, { level: st.level, hashHex, snapTol: CFG.snap_tol });
    st.meshGaps = m.gaps;
    m.elements.forEach(e => els.push(Object.assign(e, { storey: st.name })));
    const sz = R.slabZ[st.name];
    if (st.ring.outline && typeof sz.thickness === 'number') {
      const pm = S.prismRect(st.ring.outline, [], sz.bottom, sz.top);
      if (pm) els.push({ guid: hashHex('slab|' + st.name + '|' + J(st.ring.outline)).slice(0, 32), class: 'IfcSlab', handle: (st.ring.members || []).join(','), layer: 'A-WALL-*', piece: 0, vertices: pm.vertices, faces: pm.faces, storey: st.name });
    }
    st.fills.elements.forEach(e => els.push(Object.assign(e, { storey: st.name })));
  });
  if (L2.ring.outline && R.roofPlan.ok && typeof R.roofZ.thickness === 'number') {
    const pm = S.prismRect(L2.ring.outline, R.roofPlan.holes.map(h => h.ring), R.roofZ.bottom, R.roofZ.top);
    if (pm) els.push({ guid: hashHex('roof|' + J(L2.ring.outline)).slice(0, 32), class: 'IfcRoof', handle: R.roofPlan.roof_handle, layer: 'A-ROOF', piece: 0, vertices: pm.vertices, faces: pm.faces, storey: 'Roof' });
  }
  els.forEach(e => { if (e.volume === undefined) { e.volume = r6(M.volume(e)); e.watertight = M.watertight(e); } });
  R.els = els; R.obj = M.toObj(els);
  return R;
}

const R = pipeline({ convention: false }), RB = pipeline({ convention: true });
say('variant A (main): walls only with drawn (elevation) heights; variant B: + W-H3 slab_above convention for walls no elevation shows (separate OBJ, INFO only)');
const ST = R.ST;
say('elevations: ' + R.elevs.map(e => e.name + ' face=' + e.face + ' @ROOF=' + e.roof + ' levellines=' + e.lines.length + ' errors=' + e.errors.length).join(' | '));
// ---------------- LV: storey levels (markings FROM_SOURCE_MODEL) corroborated by drawn elevation rects ----------------
ST.forEach(st => check('LV ' + st.name, 'the storey level used is not a drawn elevation boundary (level taken from the source model only)', st.levelDrawn.length > 0, 'level=' + st.level + ' elevation wall rects starting there=' + st.levelDrawn.length));

// ---------------- answer key ----------------
const srcRect = (cls, storeyCond) => sql("select m.id, m.element_name n, m.element_type t, m.guid, r.minX a, r.minY b, r.maxX c, r.maxY d, r.minZ z0, r.maxZ z1 from elements_meta m join elements_rtree r on r.id=m.id where m.ifc_class" + cls + (storeyCond ? " and " + storeyCond : ''))
  .map(x => Object.assign(x, { rect: [x.a, x.b, x.c, x.d] }));
function srcMesh(id) {
  const r = sql("select hex(g.vertices) v, hex(g.faces) f, t.center_x cx, t.center_y cy, t.center_z cz from elements_meta m join element_instances i on i.guid=m.guid join base_geometries g on g.geometry_hash=i.geometry_hash left join element_transforms t on t.guid=m.guid where m.id=" + id)[0];
  const vb = Buffer.from(r.v, 'hex'), fb = Buffer.from(r.f, 'hex'), V = [], F = [];
  for (let i = 0; i + 11 < vb.length; i += 12) V.push([vb.readFloatLE(i) + r.cx, vb.readFloatLE(i + 4) + r.cy, vb.readFloatLE(i + 8) + r.cz]);
  for (let i = 0; i + 11 < fb.length; i += 12) F.push([fb.readInt32LE(i), fb.readInt32LE(i + 4), fb.readInt32LE(i + 8)]);
  return { V, F };
}
const inTri = (p, a, b, c) => { const s = (p1, p2, p3) => (p1[0] - p3[0]) * (p2[1] - p3[1]) - (p2[0] - p3[0]) * (p1[1] - p3[1]); const d1 = s(p, a, b), d2 = s(p, b, c), d3 = s(p, c, a); return !(((d1 < -1e-12) || (d2 < -1e-12) || (d3 < -1e-12)) && ((d1 > 1e-12) || (d2 > 1e-12) || (d3 > 1e-12))); };
const inShadow = (p, mesh) => mesh.F.some(f => { const a = mesh.V[f[0]], b = mesh.V[f[1]], c = mesh.V[f[2]]; const ar = (b[0] - a[0]) * (c[1] - a[1]) - (c[0] - a[0]) * (b[1] - a[1]); return Math.abs(ar) > 1e-12 && inTri(p, a, b, c); });
const inPoly = (pt, p) => { let c = false; for (let i = 0, j = p.length - 1; i < p.length; j = i++) if ((p[i][1] > pt[1]) !== (p[j][1] > pt[1]) && pt[0] < (p[j][0] - p[i][0]) * (pt[1] - p[i][1]) / (p[j][1] - p[i][1]) + p[i][0]) c = !c; return c; };
const inRect = (p, r, t) => p[0] >= r[0] - (t || 0) && p[0] <= r[2] + (t || 0) && p[1] >= r[1] - (t || 0) && p[1] <= r[3] + (t || 0);
const inside = (r, Rr) => r[0] >= Rr[0] - 0.001 && r[1] >= Rr[1] - 0.001 && r[2] <= Rr[2] + 0.001 && r[3] <= Rr[3] + 0.001;
const unionLen = iv => { const a = iv.map(x => [Math.min(x[0], x[1]), Math.max(x[0], x[1])]).sort((p, q) => p[0] - q[0]); let n = 0, c = null; a.forEach(x => { if (!c || x[0] > c[1]) { if (c) n += c[1] - c[0]; c = x.slice(); } else c[1] = Math.max(c[1], x[1]); }); if (c) n += c[1] - c[0]; return n; };

// ---------------- WALLS ----------------
say('\n===== WALLS =====');
const CASING = 0.076;
ST.forEach(st => {
  const ws = st.after.filter(o => o.op_type === 'DXF_WALL');
  const bySrc = ws.reduce((a, o) => (a[o.params.height_source || 'none'] = (a[o.params.height_source || 'none'] || 0) + 1, a), {});
  const gc = {}; st.after.filter(o => o.op_type === 'DXF_GAP').forEach(o => { gc[o.params.code] = (gc[o.params.code] || 0) + 1; });
  say(st.name + ' level=' + st.level + ' wall pieces=' + ws.length + ' (polygon ' + ws.filter(o => o.params.polygon).length + ', rescued by F5b ' + ws.filter(o => o.params.min_thickness_after_orientation).map(o => o.params.handle).join('/') + ') height source ' + J(bySrc) + ' slab_above=' + st.slabAboveN + ' | gaps ' + J(gc));
  const cut = st.level + 1.2, srcW = srcRect("='IfcWall'", "m.storey='" + st.name + "'"), srcCut = srcW.filter(x => x.z0 <= cut && cut < x.z1);
  const ours = st.before.filter(o => o.op_type === 'DXF_WALL').map(o => o.params);   // plan checks (R1a/R1b-u) on every plan piece; meshed = pieces with a drawn height
  say('  plan pieces=' + ours.length + ', meshed with a drawn height=' + ws.length + ', GAP:no_elevation_height (not meshed)=' + (gc['GAP:no_elevation_height'] || 0) + ' (walls and doors)');
  const stray = ours.filter(p => !srcCut.some(s => inside(p.rect, s.rect)));
  check('R1a ' + st.name, 'a wall piece lies outside every source wall (invented geometry)', stray.length === 0, 'pieces=' + ours.length + ' stray=' + stray.length + (stray.length ? ' ' + stray.map(p => p.handle).join(',') : ''));
  const srcOp = srcRect(" in ('IfcDoor','IfcWindow')", "m.storey='" + st.name + "'");
  let ok = 0; const bad = [];
  srcCut.forEach(Sw => {
    const w = Sw.rect[2] - Sw.rect[0], h = Sw.rect[3] - Sw.rect[1], hz = w >= h, L = hz ? w : h;
    const cov = unionLen(ours.filter(p => inside(p.rect, Sw.rect)).map(p => hz ? [p.rect[0], p.rect[2]] : [p.rect[1], p.rect[3]]));
    const exp = unionLen(srcOp.filter(q => inRect([(q.a + q.c) / 2, (q.b + q.d) / 2], Sw.rect, 0.001)).map(q => { const c = hz ? (q.a + q.c) / 2 : (q.b + q.d) / 2, hl = Math.max(q.c - q.a, q.d - q.b) / 2 - (q.n && /Door|Flush|Glass/.test(q.n) && q.t && !/Fixed|Casement/.test(q.n) ? CASING : 0); return [c - hl, c + hl]; }));
    if (Math.abs((L - cov) - exp) <= 0.005) ok++; else bad.push(Sw.id + ' uncovered=' + (L - cov).toFixed(3) + ' expected=' + exp.toFixed(3));
  });
  check('R1b-u ' + st.name, 'plan walls + source openings (door casing removed, union of intervals) do not reconstruct a source wall (5 mm)', ok === srcCut.length, ok + '/' + srcCut.length + (bad.length ? ' bad: ' + bad.join('; ') : ''));
  // R6-shell: z of our pieces vs the containing source wall
  const zr = { elevation: [0, 0, []], slab_above: [0, 0, []] };
  ws.forEach(o => { const p = o.params, k = p.height_source; if (!zr[k]) return; const s = srcCut.find(x => inside(p.rect, x.rect)); if (!s) return;
    const z0 = st.level + p.base, z1 = z0 + p.height, eq = Math.abs(z0 - s.z0) <= 0.01 && Math.abs(z1 - s.z1) <= 0.01;
    if (eq) zr[k][0]++; else { zr[k][1]++; zr[k][2].push(p.handle + (p.part ? '.' + p.part : '') + ' ours ' + r6(z0) + '..' + r6(z1) + ' src ' + s.id + ' ' + r6(s.z0) + '..' + r6(s.z1)); } });
  check('R6-shell ' + st.name, 'a wall height read from an elevation differs from the source wall containing the piece (10 mm)', zr.elevation[1] === 0, 'elevation: equal=' + zr.elevation[0] + ' differ=' + zr.elevation[1] + (zr.elevation[2].length ? ' ' + zr.elevation[2].join('; ') : ''));
});

// ---------------- SLABS and ROOF: exact area classification on a compressed grid ----------------
function classify(ourOutline, ourHoles, srcMeshes, wallRects, envelope, explainRects) {
  const xs = new Set(), ys = new Set(); const add = (x, y) => { xs.add(r6(x)); ys.add(r6(y)); };
  ourOutline.forEach(p => add(p[0], p[1])); ourHoles.forEach(h => h.forEach(p => add(p[0], p[1])));
  srcMeshes.forEach(m => m.V.forEach(v => add(v[0], v[1]))); wallRects.concat(explainRects.map(e => e.rect)).forEach(r => { add(r[0], r[1]); add(r[2], r[3]); });
  add(envelope[0], envelope[1]); add(envelope[2], envelope[3]);
  const X = [...xs].sort((a, b) => a - b), Y = [...ys].sort((a, b) => a - b);
  const a = { ours: 0, src: 0, both: 0, extra: {}, miss: {} };
  const bump = (o, k, v) => { o[k] = (o[k] || 0) + v; };
  for (let j = 0; j + 1 < Y.length; j++) for (let i = 0; i + 1 < X.length; i++) {
    const c = [(X[i] + X[i + 1]) / 2, (Y[j] + Y[j + 1]) / 2], A = (X[i + 1] - X[i]) * (Y[j + 1] - Y[j]);
    const o = inPoly(c, ourOutline) && !ourHoles.some(h => inPoly(c, h)), s = srcMeshes.some(m => inShadow(c, m));
    if (o) a.ours += A; if (s) a.src += A; if (o && s) a.both += A;
    if (o && !s) { const w = wallRects.some(r => inRect(c, r)); const ex = !w && explainRects.find(e => inRect(c, e.rect)); bump(a.extra, w ? 'under_source_wall' : ex ? ex.why : 'OTHER', A); }
    if (s && !o) { const out = !inRect(c, envelope); const ex = !out && explainRects.find(e => inRect(c, e.rect)); bump(a.miss, out ? 'outside_building_not_drawn' : ex ? ex.why : 'OTHER', A); }
  }
  const rnd = o => Object.keys(o).sort().reduce((q, k) => (q[k] = +o[k].toFixed(4), q), {});
  return { ours: +a.ours.toFixed(4), src: +a.src.toFixed(4), both: +a.both.toFixed(4), extra: rnd(a.extra), miss: rnd(a.miss) };
}
say('\n===== FLOOR SLABS =====');
const structural = st => srcRect("='IfcSlab'", "m.storey='" + st + "' and m.element_name not like '%Finish Floor%'");
ST.forEach((st, i) => {
  const sz = R.slabZ[st.name], ring = st.ring;
  say(st.name + ' outline=' + J(ring.outline) + ' from=' + J(ring.members) + ' ring gaps=' + J(ring.gaps) + ' | z top=' + sz.top + ' bottom=' + sz.bottom + ' thickness=' + sz.thickness + ' gaps=' + J(sz.gaps) + (sz.underside_from ? ' underside from ' + sz.underside_from.join(',') : ''));
  const src = structural(st.name), E0 = ring.envelope, inE = src.filter(s => s.a >= E0[0] - 0.001 && s.c <= E0[2] + 0.001 && s.b >= E0[1] - 0.001 && s.d <= E0[3] + 0.001);
  say('  source structural slabs: ' + src.map(s => s.id + ' ' + s.n.split(':')[1] + ' [' + s.rect.map(v => +v.toFixed(3)) + '] z ' + r6(s.z0) + '..' + r6(s.z1) + (inE.includes(s) ? '' : ' (outside the building)')).join(' | '));
  if (!ring.outline) { check('SL-a ' + st.name, 'no slab outline from the drawn walls', false, J(ring.gaps)); return; }
  const ux = [Math.min(...inE.map(s => s.a)), Math.min(...inE.map(s => s.b)), Math.max(...inE.map(s => s.c)), Math.max(...inE.map(s => s.d))], o = ring.outline;
  const ox = [o[0][0], o[0][1], o[2][0], o[2][1]];
  check('SL-a ' + st.name, 'slab outline edges differ from the source structural slabs\' extremes (1 mm)', ox.every((v, k) => Math.abs(v - ux[k]) <= 0.001), 'ours=' + J(ox) + ' source=' + J(ux.map(v => +v.toFixed(4))));
  const walls2 = srcRect("='IfcWall'", "m.storey in ('" + st.name + "','" + (ST[i + 1] ? ST[i + 1].name : 'Roof') + "')").map(x => x.rect);
  const voids = inE.map(s => ({ rect: s.rect, why: 'source_slab_void_not_drawn(' + s.id + ')' }));
  const cl = classify(o, [], src.map(s => srcMesh(s.id)), walls2, E0, voids);
  say('  area m2: ours=' + cl.ours + ' source=' + cl.src + ' both=' + cl.both + ' | ours-only ' + J(cl.extra) + ' | source-only ' + J(cl.miss));
  const stairs = srcRect(" in ('IfcStairFlight','IfcRailing')", null).filter(x => x.z1 > (sz.top || st.level) - 0.5 && x.z0 < (sz.top || st.level));
  if (Object.keys(cl.extra).some(k => /void/.test(k))) say('  source voids: stair flights/railings reaching this floor: ' + stairs.map(x => x.id + ' [' + x.rect.map(v => +v.toFixed(3)) + ']').join(' '));
  check('SL-b ' + st.name, 'slab area where the source has no slab, not explained by a source wall above/below or a source void the drawings do not show', !(cl.extra.OTHER > 0.01), 'unexplained=' + (cl.extra.OTHER || 0) + ' m2');
  check('SL-c ' + st.name, 'source slab area inside the building that our slab misses', !(cl.miss.OTHER > 0.01), 'unexplained=' + (cl.miss.OTHER || 0) + ' m2');
  if (typeof sz.thickness === 'number') { const z0 = Math.min(...inE.map(s => s.z0)), z1 = Math.max(...inE.map(s => s.z1));
    check('SL-d ' + st.name, 'slab top/underside differs from the source structural slab (10 mm)', Math.abs(sz.top - z1) <= 0.01 && Math.abs(sz.bottom - z0) <= 0.01, 'ours ' + sz.bottom + '..' + sz.top + ' source ' + r6(z0) + '..' + r6(z1)); }
  else if (i > 0) check('SL-d ' + st.name, 'no slab thickness although the storey below is in the set (expected from §4.2)', false, J(sz.gaps));
  else say('GAP SL-d ' + st.name + ': no thickness from the drawings (' + sz.gaps.map(g => g.code + (g.reason ? ' (' + g.reason + ')' : '')).join(', ') + '); source ' + inE.map(s => r6(s.z0) + '..' + r6(s.z1)).join(',') + ' - slab NOT meshed');
});
say('\n===== ROOF =====');
{ const rz = R.roofZ, rp = R.roofPlan, ring = ST[1].ring, src = srcRect("='IfcSlab'", "m.element_name like '%Roof%'")[0];
  say('roof plan: ok=' + rp.ok + ' outline handle=' + rp.roof_handle + ' holes=' + J(rp.holes.map(h => h.handle + ':' + J(h.rect))) + ' gaps=' + J(rp.gaps) + ' | z bottom=' + rz.bottom + ' top=' + rz.top + ' (' + J(rz.top_from) + ') thickness=' + rz.thickness + ' gaps=' + J(rz.gaps));
  say('source roof: ' + src.id + ' ' + src.n + ' [' + src.rect.map(v => +v.toFixed(3)) + '] z ' + r6(src.z0) + '..' + r6(src.z1));
  if (!ring.outline || !rp.ok) { check('RF-a', 'no roof outline', false, J(ring.gaps) + ' ' + J(rp.gaps)); } else {
  const o = ring.outline, ox = [o[0][0], o[0][1], o[2][0], o[2][1]];
  check('RF-a', 'roof outline edges differ from the source roof slab (1 mm)', rp.ok && ox.every((v, k) => Math.abs(v - src.rect[k]) <= 0.001), 'ours=' + J(ox) + ' source=' + J(src.rect.map(v => +v.toFixed(4))));
  const sky = srcRect("='IfcWindow'", "m.storey='Roof'"), sm = srcMesh(src.id);
  const cl = classify(o, rp.holes.map(h => h.ring), [sm], srcRect("='IfcWall'", "m.storey in ('Level 2','Roof')").map(x => x.rect), ring.envelope, sky.map(s => ({ rect: s.rect, why: 'skylight_unit_outline(' + s.id + ')' })));
  say('  area m2: ours=' + cl.ours + ' source=' + cl.src + ' both=' + cl.both + ' | ours-only ' + J(cl.extra) + ' | source-only ' + J(cl.miss));
  check('RF-b', 'roof area not explained (ours where the source has none, or source roof we miss)', !(cl.extra.OTHER > 0.01) && !(cl.miss.OTHER > 0.01), 'unexplained ours-only=' + (cl.extra.OTHER || 0) + ' source-only=' + (cl.miss.OTHER || 0) + ' m2');
  // source holes = connected empty regions inside the source roof outline: read from its vertex set (rectangles inside the bbox)
  const vx = [...new Set(sm.V.map(v => r6(v[0])))].sort((a, b) => a - b), vy = [...new Set(sm.V.map(v => r6(v[1])))].sort((a, b) => a - b);
  const srcHoles = sky.map(s => { const cx = (s.a + s.c) / 2, cy = (s.b + s.d) / 2; const hx0 = Math.max(...vx.filter(x => x < cx && x > src.a + 0.01)), hx1 = Math.min(...vx.filter(x => x > cx && x < src.c - 0.01)), hy0 = Math.max(...vy.filter(y => y < cy && y > src.b + 0.01)), hy1 = Math.min(...vy.filter(y => y > cy && y < src.d - 0.01)); return [hx0, hy0, hx1, hy1]; });
  let hok = 0; const hrows = [];
  srcHoles.forEach(Hs => { const c = [(Hs[0] + Hs[2]) / 2, (Hs[1] + Hs[3]) / 2], h = rp.holes.find(x => inRect(c, x.rect));
    const okc = h && Math.abs((h.rect[0] + h.rect[2]) / 2 - c[0]) <= 0.01 && Math.abs((h.rect[1] + h.rect[3]) / 2 - c[1]) <= 0.01 && h.rect[0] <= Hs[0] + 1e-6 && h.rect[1] <= Hs[1] + 1e-6 && h.rect[2] >= Hs[2] - 1e-6 && h.rect[3] >= Hs[3] - 1e-6;
    if (okc) hok++; hrows.push('source hole [' + Hs.map(v => +v.toFixed(3)) + '] ours ' + (h ? '[' + h.rect + '] excess per side ' + [Hs[0] - h.rect[0], Hs[1] - h.rect[1], h.rect[2] - Hs[2], h.rect[3] - Hs[3]].map(v => +v.toFixed(3)).join('/') : 'none')); });
  check('RH', 'a roof hole is off-centre (10 mm) or does not contain the source hole', hok === srcHoles.length && rp.holes.length === srcHoles.length, hok + '/' + srcHoles.length + ' | ' + hrows.join(' | '));
  const rmesh = R.els.find(e => e.class === 'IfcRoof');
  check('RF-e', 'the roof mesh volume is not (outline area - holes) x thickness (holes filled or area invented by the mesher)', !!rmesh && typeof rz.thickness === 'number' && Math.abs(rmesh.volume - cl.ours * rz.thickness) <= 1e-4, 'mesh=' + (rmesh && rmesh.volume) + ' expected=' + (typeof rz.thickness === 'number' ? r6(cl.ours * rz.thickness) : 'n/a'));
  }
  check('RF-c', 'roof bottom differs from the source roof (10 mm)', typeof rz.bottom === 'number' && Math.abs(rz.bottom - src.z0) <= 0.01, 'ours=' + rz.bottom + ' source=' + r6(src.z0));
  check('RF-d', 'roof top differs from the source roof (10 mm)', typeof rz.top === 'number' && Math.abs(rz.top - src.z1) <= 0.01, 'ours=' + rz.top + ' (drawn ROOF LEVEL line) source=' + r6(src.z1) + ' diff=' + (typeof rz.top === 'number' ? r6(rz.top - src.z1) : 'n/a'));
}

// ---------------- OPENINGS: void cut + wall above/below (sampling our solids) ----------------
say('\n===== OPENINGS CUT INTO WALLS =====');
const hostOf = {}; sql("select h.element_guid e, h.host_guid w from rel_fills_host h").forEach(x => { hostOf[x.e] = x.w; });
const allSrcW = {}; srcRect("='IfcWall'", null).forEach(x => { allSrcW[x.guid] = x; });
ST.forEach(st => {
  const solids = st.after.filter(o => o.op_type === 'DXF_WALL').concat(st.infill).map(o => o.params).filter(p => typeof p.height === 'number')
    .map(p => ({ h: p.handle, poly: p.outline, rect: p.rect, z0: st.level + p.base, z1: st.level + p.base + p.height, infill: !!p.infill }));
  const solidAt = (x, y, z) => solids.some(s => z > s.z0 + 1e-9 && z < s.z1 - 1e-9 && (s.poly ? inPoly([x, y], s.poly) : inRect([x, y], s.rect, -1e-9)));
  const arcs = parse(txt(st.f)).entities.filter(e => e.layer === 'A-DOOR' && e.type === 'ARC').map(e => ({ h: e.handle, c: [e.center.x * 0.001, e.center.y * 0.001] }));
  const gapByH = {}; st.after.filter(o => o.op_type === 'DXF_GAP').map(o => o.params).concat(st.planGaps).forEach(g => { if (/height|min_width/.test(g.code)) gapByH[g.handle] = g.code; });
  const srcO = srcRect(" in ('IfcDoor','IfcWindow')", "m.storey='" + st.name + "'").filter(x => hostOf[x.guid] && allSrcW[hostOf[x.guid]]);
  const tally = { ok: 0, explained: 0, FAIL: 0 }, rows = [];
  srcO.forEach(o => {
    const W0 = allSrcW[hostOf[o.guid]], cx = (o.a + o.c) / 2, cy = (o.b + o.d) / 2;
    const voidOk = [(o.z0 + o.z1) / 2, o.z0 + 0.02, o.z1 - 0.02].every(z => !solidAt(cx, cy, z));
    const needA = W0.z1 - o.z1 > 0.04, needB = o.z0 - W0.z0 > 0.04;
    const aboveOk = !needA || solidAt(cx, cy, o.z1 + 0.02), belowOk = !needB || solidAt(cx, cy, o.z0 - 0.02);
    let status = voidOk && aboveOk && belowOk ? 'ok' : 'FAIL', why = '';
    if (status === 'FAIL' && /Door/.test(o.n.split(':')[0]) || (status === 'FAIL' && /Flush|Glass/.test(o.n))) {
      const oc = [(o.a + o.c) / 2, (o.b + o.d) / 2], a = arcs.filter(x => gapByH[x.h] && Math.hypot(x.c[0] - oc[0], x.c[1] - oc[1]) <= 1.2).sort((p, q) => Math.hypot(p.c[0] - oc[0], p.c[1] - oc[1]) - Math.hypot(q.c[0] - oc[0], q.c[1] - oc[1]))[0];
      if (a) { status = 'explained'; why = 'door arc ' + a.h + ' ' + gapByH[a.h]; }
    }
    tally[status]++;
    if (status !== 'ok') rows.push(o.id + ' ' + o.n.split(':')[0] + ' ' + status + ' void=' + voidOk + ' above=' + aboveOk + ' below=' + belowOk + (why ? ' (' + why + ')' : ''));
  });
  say(st.name + ' infill boxes=' + st.infill.length + ' voids=' + st.bridge.voids.length + ' bridge gaps=' + J(st.bridge.gaps.map(g => g.code + ':' + g.handle)) + ' gaps without opening=' + st.bridge.notes.length + (st.bridge.notes.length ? ' ' + J(st.bridge.notes.map(n => n.between.join('|') + '@' + n.s.join('..'))) : ''));
  rows.forEach(r => say('  ' + r));
  const mg = {}; st.meshGaps.forEach(g => { mg[g.code] = (mg[g.code] || 0) + 1; });
  say('  mesh gaps (walls meshed without opening ops): ' + J(mg));
  check('OV ' + st.name, 'a source opening is not cut (wall solid in the void) or the wall above/below it is missing, with no logged gap explaining it', tally.FAIL === 0, 'source openings=' + srcO.length + ' ok=' + tally.ok + ' explained=' + tally.explained + ' FAIL=' + tally.FAIL);
});

// ---------------- FILLS from the LOD400 library ----------------
say('\n===== FILLS (LOD400 library, no fallback) =====');
say('library rows read: families=' + R.libCount.families + ' door/window geometries=' + R.libCount.geoms);
const fillScore = (fills, srcO) => { const used = new Set(), res = { ok: 0, unmatched: [], wrong: [] };
  fills.forEach(f => { const c = f.centre, key = S.pairKey(f.element_ref);
    const s = srcO.find(x => !used.has(x.id) && Math.abs((x.a + x.c) / 2 - c[0]) <= 0.01 && Math.abs((x.b + x.d) / 2 - c[1]) <= 0.01 && Math.abs((x.z0 + x.z1) / 2 - c[2]) <= 0.01);
    if (!s) { res.unmatched.push(f.class + ' ' + f.handle + ' ' + J(c)); return; }
    used.add(s.id);
    const mn = [0, 1, 2].map(a => Math.min(...f.vertices.map(v => v[a]))), mx = [0, 1, 2].map(a => Math.max(...f.vertices.map(v => v[a])));
    const boxOk = Math.abs(mn[0] - s.a) <= 0.01 && Math.abs(mn[1] - s.b) <= 0.01 && Math.abs(mx[0] - s.c) <= 0.01 && Math.abs(mx[1] - s.d) <= 0.01 && Math.abs(mn[2] - s.z0) <= 0.01 && Math.abs(mx[2] - s.z1) <= 0.01;
    if (S.pairKey(s.t) !== key || s.n.split(':')[0] !== f.element_ref.split(':')[0]) res.wrong.push(f.handle + ' ' + f.element_ref + ' vs source ' + s.id + ' ' + s.n);
    else if (!boxOk) res.wrong.push(f.handle + ' placed box [' + mn.concat(mx).map(v => +v.toFixed(3)) + '] vs source ' + s.id + ' [' + [s.a, s.b, s.z0, s.c, s.d, s.z1].map(v => +v.toFixed(3)) + '] (orientation/size)');
    else res.ok++; });
  return res; };
ST.forEach(st => {
  const fl = st.fills, srcO = srcRect(" in ('IfcDoor','IfcWindow')", "m.storey='" + st.name + "'");
  const gc = {}; fl.gaps.forEach(g => { gc[g.code] = (gc[g.code] || 0) + 1; });
  say(st.name + ' fills=' + fl.elements.length + ' ' + J(fl.elements.reduce((a, e) => (a[e.element_ref] = (a[e.element_ref] || 0) + 1, a), {})) + ' gaps ' + J(gc) + (st.hard ? ' HARD FAIL: ' + st.hard : ''));
  fl.gaps.filter(g => g.code === 'GAP:fill_size_mismatch').forEach(g => say('  size ' + g.kind + ' ' + g.handle + ' ' + g.element_ref + ' dw=' + g.delta_w + ' dh=' + g.delta_h));
  const sc = fillScore(fl.elements, srcO);
  check('FL ' + st.name, 'a fill is placed where no source door/window of that product is (10 mm centre and bbox, so orientation and size), or is a different product; or the library had no real geometry (hard fail)', !st.hard && sc.unmatched.length === 0 && sc.wrong.length === 0,
    'fills=' + fl.elements.length + ' matched=' + sc.ok + ' unmatched=' + sc.unmatched.length + ' wrong product=' + sc.wrong.length + ' | source doors/windows=' + srcO.length + ' filled=' + sc.ok + (sc.unmatched.length ? ' | ' + sc.unmatched.join('; ') : '') + (sc.wrong.length ? ' | ' + sc.wrong.join('; ') : ''));
  const unf = srcO.filter(x => !fl.elements.some(f => Math.abs((x.a + x.c) / 2 - f.centre[0]) <= 0.01 && Math.abs((x.b + x.d) / 2 - f.centre[1]) <= 0.01 && Math.abs((x.z0 + x.z1) / 2 - f.centre[2]) <= 0.01));
  if (unf.length) say('  not filled: ' + unf.map(x => x.id + ' ' + x.n.split(':').slice(0, 2).join(':')).join(' | '));
  const moved = fl.elements.map(e => Object.assign({}, e, { centre: [e.centre[0] + 0.05, e.centre[1], e.centre[2]] })), sc2 = fillScore(moved, srcO);
  check('FLC ' + st.name, 'the fill scorer cannot fail (control: fills moved 50 mm must be unmatched)', fl.elements.length === 0 || sc2.unmatched.length === fl.elements.length, 'moved fills unmatched=' + sc2.unmatched.length + '/' + fl.elements.length);
});

// ---------------- DW: ALL source doors and windows vs the plan (position, width, host wall) + door swing ----------------
say('\n===== DOORS AND WINDOWS (all, plan + elevations) =====');
ST.forEach(st => {
  const plan = st.before, byG = {}; plan.filter(o => o.op_type === 'DXF_WALL').forEach(o => { byG[o.output_guid] = o; });
  const doors = plan.filter(o => o.op_type === 'DXF_OPENING' && o.params.kind === 'door');
  const sd = srcRect("='IfcDoor'", "m.storey='" + st.name + "'"), dRows = [], tally = { ok: 0, explained: 0, FAIL: 0 };
  const defect = st.planGaps.filter(g => g.code === 'GAP:door_below_min_width');
  const arcs = parse(txt(st.f)).entities.filter(e => e.layer === 'A-DOOR' && e.type === 'ARC');
  sd.forEach(x => {
    const d = doors.find(o => inRect(o.params.hinge, x.rect, 0.02));
    if (!d) { const a = arcs.find(e => defect.some(g => g.handle === e.handle) && Math.hypot(e.center.x * 0.001 - (x.a + x.c) / 2, e.center.y * 0.001 - (x.b + x.d) / 2) <= 1.2);
      if (a) { tally.explained++; dRows.push(x.id + ' ' + x.t + ' explained: arc ' + a.handle + ' GAP:door_below_min_width r=' + (a.radius * 0.001).toFixed(3) + ' (export defect, SPEC.md §21)'); } else { tally.FAIL++; dRows.push(x.id + ' FAIL no door'); } return; }
    const wOk = Math.abs(d.params.width - Math.max(x.c - x.a, x.d - x.b)) <= 0.002, hw = allSrcW[hostOf[x.guid]];
    const sw = S.doorSwing(d, plan.filter(o => o.op_type === 'DXF_WALL'), CFG.snap_tol), H = sw.gap ? null : { params: { handle: sw.strip.join('+') } };
    const hostOk = !sw.gap && !!hw && sw.strip.every(h => plan.some(o => o.op_type === 'DXF_WALL' && o.params.handle === h && inside(o.params.rect, hw.rect)));
    if (wOk && hostOk) tally.ok++; else tally.FAIL++;
    dRows.push(x.id + ' ' + x.t + ' arc ' + d.params.handle + ' width ' + d.params.width + (wOk ? ' =src' : ' != src ' + Math.max(x.c - x.a, x.d - x.b).toFixed(3)) + ' host ' + (H ? H.params.handle : '-') + (hostOk ? ' in src wall ' + hw.id : ' NOT in src host') + (sw.gap ? ' | ' + sw.gap : ' | swing: opens to ' + sw.opens_to + ', hinge at ' + sw.hinge_jamb + ' jamb'));
  });
  dRows.forEach(r => say('  ' + r));
  check('DW-doors ' + st.name, 'a source door has no plan door of its width hosted in its source wall, with no logged gap explaining it', tally.FAIL === 0, 'source doors=' + sd.length + ' ok=' + tally.ok + ' explained=' + tally.explained + ' FAIL=' + tally.FAIL);
  let wins = st.after.filter(o => o.op_type === 'DXF_OPENING' && o.params.kind === 'window'), sw2 = srcRect("='IfcWindow'", "m.storey='" + st.name + "'");
  let wok = 0, wexp = 0; const wbad = [], w8bad = [], wexpl = [];
  // L2.5 W2 controls: M-W2 removes the first window op (a window vanishes, no gap: the check must FAIL); M-W2g removes it but logs a gap on its glazing (explained)
  const wDrop = (MUT === 'M-W2' || MUT === 'M-W2g') && wins.length ? wins.slice().sort((a, b) => parseInt(a.params.handle, 16) - parseInt(b.params.handle, 16))[0] : null;
  if (wDrop) { wins = wins.filter(o => o.params.handle !== wDrop.params.handle); say('  MUTATION ' + MUT + ': window op ' + wDrop.params.handle + ' removed' + (MUT === 'M-W2g' ? ', GAP:no_elevation_match logged on it' : ', no gap')); }
  // L2.5 W2: a window that does not match may be explained by a DXF_GAP on the A-GLAZ entity at its plan box (stacked windows share one entity)
  const glazGaps = st.after.filter(o => o.op_type === 'DXF_GAP' && /GLAZ/.test(o.params.layer || '') && !(wDrop && o.params.handle === wDrop.params.handle)).concat(MUT === 'M-W2g' && wDrop ? [{ op_type: 'DXF_GAP', params: { code: 'GAP:no_elevation_match', handle: wDrop.params.handle, layer: wDrop.params.layer } }] : []).map(o => {
    const po = st.before.find(q => q.op_type === 'DXF_OPENING' && q.params.handle === o.params.handle && q.params.bbox);   // the plan-stage opening (glazing cluster) of that handle
    return po ? { code: o.params.code, h: o.params.handle, bb: po.params.bbox } : null; }).filter(Boolean);
  sw2.forEach(x => { const w = wins.find(o => Math.abs(o.params.bbox[0] - x.a) <= 0.01 && Math.abs(o.params.bbox[1] - x.b) <= 0.01 && Math.abs(o.params.bbox[2] - x.c) <= 0.01 && Math.abs(o.params.bbox[3] - x.d) <= 0.01 && Math.abs(st.level + o.params.sill - x.z0) <= 0.01 && Math.abs(st.level + o.params.sill + o.params.height - x.z1) <= 0.01);
    // host = the plan pieces of the window's own strip that touch its box ends (the wall that is cut), not dxf2bim's nearest-rect host (W8 picks corner pieces on ties)
    const hw = allSrcW[hostOf[x.guid]], bb = w && w.params.bbox, hz = bb && (bb[2] - bb[0]) >= (bb[3] - bb[1]), ai = hz ? 0 : 1, ci = 1 - ai;
    const Hs = bb ? plan.filter(o => o.op_type === 'DXF_WALL' && Math.abs(o.params.rect[ci] - bb[ci]) <= 0.001 && Math.abs(o.params.rect[ci + 2] - bb[ci + 2]) <= 0.001 && (Math.abs(o.params.rect[ai + 2] - bb[ai]) <= 0.001 || Math.abs(o.params.rect[ai] - bb[ai + 2]) <= 0.001)) : [];
    const W8 = w && byG[w.params.host_wall]; if (W8 && hw && !inside(W8.params.rect, hw.rect)) w8bad.push(x.id + ':' + W8.params.handle);
    if (w && hw && Hs.length && Hs.every(o => inside(o.params.rect, hw.rect))) wok++;
    else if (!w) { const g = glazGaps.filter(q => [x.a, x.b, x.c, x.d].every((v, i) => Math.abs(v - q.bb[i]) <= 0.01)); if (g.length) { wexp++; wexpl.push(x.id + ' explained: ' + [...new Set(g.map(q => q.code + ' ' + q.h))].join(', ')); } else wbad.push(x.id + ' no window and no gap (vanished without a trace)'); }
    else wbad.push(x.id + ' strip pieces ' + Hs.map(o => o.params.handle).join('+') + ' not in src wall ' + (hw && hw.id));
  });
  if (w8bad.length) say('  FINDING dxf2bim W8 host (nearest rect, tie -> lowest handle) is a perpendicular corner piece for: ' + w8bad.join(', ') + ' (not used by the shell; recorded)');
  wexpl.forEach(r => say('  ' + r));
  check('DW-windows ' + st.name, 'a source window has no window of the same plan box and sill/head (10 mm) hosted in its source wall, and no logged gap explains it', wbad.length === 0, 'source windows=' + sw2.length + ' ok=' + wok + ' explained=' + wexp + (wbad.length ? ' bad: ' + wbad.join('; ') : ''));
});
say('door swing truth: NOT CLAIMED. The source gives no rotation or handing (element_transforms holds centre_x/y/z only; door meshes are centred frame+leaf solids with no swing). Swing above is read from the drawn arcs only.');

// ---------------- variant B (W-H3 convention) summary, INFO only ----------------
say('\n===== VARIANT B (W-H3 slab_above convention), INFO =====');
RB.ST.forEach(st => {
  const srcW = srcRect("='IfcWall'", "m.storey='" + st.name + "'"), eq = [0, 0, []];
  st.after.filter(o => o.op_type === 'DXF_WALL' && o.params.height_source === 'slab_above').forEach(o => { const p = o.params, s2 = srcW.find(x => inside(p.rect, x.rect)); if (!s2) return; const z0 = st.level + p.base, z1 = z0 + p.height;
    if (Math.abs(z0 - s2.z0) <= 0.01 && Math.abs(z1 - s2.z1) <= 0.01) eq[0]++; else { eq[1]++; eq[2].push(p.handle + ' ours ' + r6(z0) + '..' + r6(z1) + ' src ' + s2.id + ' ' + r6(s2.z0) + '..' + r6(s2.z1)); } });
  say('INFO slab_above ' + st.name + ': pieces=' + st.slabAboveN + ' equal to source=' + eq[0] + ' differ=' + eq[1] + (eq[2].length ? ' -> ' + eq[2].join('; ') : ''));
});
fs.writeFileSync(path.join(__dirname, 'out/duplex_basic_shapes_convention' + SFX + '.obj'), RB.obj);
say('variant B OBJ tests/dxf2bim/out/duplex_basic_shapes_convention.obj elements=' + RB.els.length + ' ' + J(RB.els.reduce((a, e) => (a[e.class] = (a[e.class] || 0) + 1, a), {})) + ' sha256=' + hashHex(RB.obj));

// ---------------- MESH, OBJ, determinism ----------------
say('\n===== MESH =====');
const els = R.els, byC = els.reduce((a, e) => (a[e.class] = (a[e.class] || 0) + 1, a), {}), tris = els.reduce((n, e) => n + e.faces.length, 0);
const shell = els.filter(e => /IfcWall|IfcSlab|IfcRoof/.test(e.class)), badS = shell.filter(e => !e.watertight || !(e.volume > 0));
const fillsClosed = els.filter(e => /IfcDoor|IfcWindow/.test(e.class) && e.watertight).length;
fs.mkdirSync(path.join(__dirname, 'out'), { recursive: true });
fs.writeFileSync(path.join(__dirname, 'out/duplex_basic_shapes' + SFX + '.obj'), R.obj);
const h1 = hashHex(R.obj);
say('elements=' + els.length + ' by class ' + J(byC) + ' triangles=' + tris + ' (of IfcWall: infill boxes around voids=' + R.ST.reduce((n, st) => n + st.infill.length, 0) + ')' + ' | z ' + Math.min(...els.flatMap(e => e.vertices.map(v => v[2]))) + '..' + Math.max(...els.flatMap(e => e.vertices.map(v => v[2]))));
say('volumes m3: walls=' + r6(els.filter(e => e.class === 'IfcWall').reduce((n, e) => n + e.volume, 0)) + ' slabs=' + r6(els.filter(e => e.class === 'IfcSlab').reduce((n, e) => n + e.volume, 0)) + ' roof=' + r6(els.filter(e => e.class === 'IfcRoof').reduce((n, e) => n + e.volume, 0)) + ' | library fills closed=' + fillsClosed + '/' + els.filter(e => /IfcDoor|IfcWindow/.test(e.class)).length + ' (library meshes, reported not asserted)');
say('OBJ tests/dxf2bim/out/duplex_basic_shapes.obj sha256=' + h1);
check('MESH-shell', 'a wall/slab/roof element is open or inside-out', badS.length === 0, 'bad=' + badS.length + '/' + shell.length + (badS.length ? ' ' + badS.map(e => e.class + ':' + e.handle).join(',') : ''));
check('MESH-guid', 'duplicate element ids', new Set(els.map(e => e.guid)).size === els.length, 'unique=' + new Set(els.map(e => e.guid)).size + '/' + els.length);
const R2 = pipeline({ convention: false }), h2 = hashHex(R2.obj);
check('MESH-det', 'the OBJ differs between two full runs', h1 === h2, 'run1=' + h1.slice(0, 16) + ' run2=' + h2.slice(0, 16));
// ---------------- L2 qualify input (DXF2BIM_MODELLER_LANE §L2.1): every gap of the main variant A, git-ignored, read by rosetta_qualify.js ----------------
if (!MUT) {
  const qg = [], resolved = {}, pick = g => { const o = Object.assign({}, g); delete o.run_id; return o; };
  R.ST.forEach(st => {
    const sheet = 'DX_' + st.f, sz = R.slabZ[st.name];
    st.after.filter(o => o.op_type === 'DXF_GAP').forEach(o => qg.push(Object.assign({ sheet }, pick(o.params))));
    (st.ring.gaps || []).concat(sz.gaps || []).forEach(g => qg.push(Object.assign({ sheet, shape: 'slabs' }, pick(g))));
    st.bridge.gaps.concat(st.fills.gaps).forEach(g => qg.push(Object.assign({ sheet, shape: 'openings' }, pick(g))));
    st.meshGaps.forEach(g => qg.push(Object.assign({ sheet }, pick(g))));
    // L2.3 D3: handles the final shell/cut stage resolved (openings of bridged voids + their parts, placed fills)
    const opH = {}; st.after.filter(o => o.op_type === 'DXF_OPENING').forEach(o => { opH[o.params.handle] = (o.params.parts || []).map(q => q.handle); });
    const rs = new Set(); st.bridge.voids.forEach(v => v.openings.forEach(h => { rs.add(h); (opH[h] || []).forEach(x => rs.add(x)); }));
    st.fills.elements.forEach(e => { if (typeof e.handle === 'string') rs.add(e.handle); });
    resolved[sheet] = [...rs].sort((a, b) => parseInt(a, 16) - parseInt(b, 16));
  });
  R.roofPlan.gaps.concat(R.roofZ.gaps || []).forEach(g => qg.push(Object.assign({ sheet: 'DX_ROOF', shape: 'roof' }, pick(g))));
  const inputs = {}; ['FLOOR_GF', 'FLOOR_FF'].forEach(f => { inputs['DX_' + f] = hashHex(txt(f)); }); ELEVS.forEach(f => { inputs['DX_' + f] = hashHex(shellTxt[f]); }); if (shellTxt.ROOF) inputs.DX_ROOF = hashHex(shellTxt.ROOF);
  fs.writeFileSync(path.join(OUTS, 'dx_shell_gaps.json'), J({ variant: 'A', set: DXSET || 'dx', inputs, gaps: qg, resolved }, null, 1) + '\n');
  say('L2 qualify input: ' + qg.length + ' gap records (variant A), resolved handles ' + J(Object.keys(resolved).map(k => k + ':' + resolved[k].length)) + ' -> ' + path.relative(__dirname, OUTS) + '/dx_shell_gaps.json');
}
// §11 element summary for the Modeller import witness (bim-ootb modeller/tests/witness_dxf_convert.js C1): same element ids as the OBJ. Not for the std set.
if (!STDSET) {
  const infillOf = {}; R.ST.forEach(st => st.infill.forEach(o => { infillOf[hashHex(o.output_guid + '|0').slice(0, 32)] = { infill_of: o.params.infill_of, openings: o.params.openings }; }));
  const bb = e => { const mn = [0, 1, 2].map(a => Math.min(...e.vertices.map(v => v[a]))), mx = [0, 1, 2].map(a => Math.max(...e.vertices.map(v => v[a]))); return mn.concat(mx).map(r6); };
  const rows = R.els.map(e => { const b = bb(e); return Object.assign({ guid: e.guid, class: e.class, storey: e.storey, handle: e.handle, layer: e.layer, bbox: b, centre: [0, 1, 2].map(a => r6((b[a] + b[a + 3]) / 2)), volume: e.volume },
    infillOf[e.guid] ? { infill: true, infill_of: infillOf[e.guid].infill_of, openings: infillOf[e.guid].openings } : {}, e.element_ref ? { element_ref: e.element_ref, geometry_hash: e.geometry_hash, family_id: e.family_id } : {}); });
  const nInf = rows.filter(x => x.infill).length;
  fs.writeFileSync(path.join(__dirname, 'out/duplex_basic_shapes_elements.json'), J({ run_id: R.run_id, storeys: R.ST.map(st => ({ name: st.name, level: st.level, run_id: st.run_id })), elements: rows }));
  check('RUN-id', 'the set run_id differs between two full runs (not an identity of the inputs)', R.run_id === R2.run_id && typeof R.run_id === 'string', 'run_id=' + R.run_id);
  check('ELEM-dump', 'the element summary misses an infill box or an element', nInf === R.ST.reduce((n, st) => n + st.infill.length, 0) && rows.length === R.els.length, 'elements=' + rows.length + ' infill=' + nInf + ' -> out/duplex_basic_shapes_elements.json');
}
say('\nSUMMARY fail=' + fails);
fs.writeFileSync(path.join(__dirname, 'rosetta_dx_shell' + SFX + '.log'), lines.join('\n') + '\n');
