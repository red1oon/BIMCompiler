// ⚠ DO NOT REMOVE — ROSETTA types (SPEC §40): type binding on the Duplex outline, scored against the source model's own element types.
// Direction A only (model → 2D set → outline → type). Library = component_library.db rows, unfiltered. Run mark_dx_set.js first. Read the log after every run.
// Round trip (DXFs were exported from the source model): ground truth is known, not an independent real-world test.
'use strict';
const fs = require('fs'), crypto = require('crypto'), path = require('path'), cp = require('child_process');
const DxfParser = require(path.join(__dirname, '../../deploy/dev/dxf-parser.js'));
const B = require(path.join(__dirname, '../../deploy/dev/dxf2bim.js'));
const MK = require(path.join(__dirname, '../../deploy/dev/dxf2marks.js'));
const E = require(path.join(__dirname, '../../deploy/dev/dxf2elev.js'));
const M = require(path.join(__dirname, '../../deploy/dev/dxf2mesh.js'));
const hashHex = s => crypto.createHash('sha256').update(s).digest('hex');
const OUT = path.join(__dirname, 'out/marked'), DB = path.join(__dirname, '../../2D_Layout/input/DX_extracted.db');
const sql = q => JSON.parse(cp.execFileSync('sqlite3', ['-json', '-readonly', DB, q], { encoding: 'utf8' }) || '[]');
const txt = f => fs.readFileSync(path.join(OUT, 'DX_' + f + '_marked.dxf'), 'utf8');
const MAP_PLAN = { version: 1, rules: [
  { match: 'exact', pattern: 'A-WALL-FULL', type: 'wall' }, { match: 'exact', pattern: 'A-WALL-PRTN', type: 'wall' }, { match: 'exact', pattern: 'A-WALL-PATT', type: 'ignore' },
  { match: 'exact', pattern: 'A-DOOR', type: 'opening' }, { match: 'exact', pattern: 'A-GLAZ', type: 'glazing' },
  { match: 'exact', pattern: 'A-GRID', type: 'ignore' }, { match: 'exact', pattern: 'A-ANNO-TEXT', type: 'ignore' }, { match: 'exact', pattern: 'A-ANNO-DIMS', type: 'ignore' },
  { match: 'exact', pattern: 'A-FURN', type: 'ignore' }, { match: 'exact', pattern: 'A-TTLB', type: 'ignore' }, { match: 'exact', pattern: '0', type: 'ignore' } ] };
const MAP_ELEV = { version: 1, rules: [{ match: 'exact', pattern: 'A-GLAZ', type: 'glazing' }, { match: 'exact', pattern: 'A-ELEV-WALL', type: 'elevwall' }, { match: 'exact', pattern: 'A-DOOR', type: 'elevdoor' }] };
// elev_tol 0.003 m: sandbox value for interval equality (drawing coordinates are rounded to mm); stated in the log
const CFG = { version: 1, units: 'mm', snap_tol: 0.001, elev_tol: 0.003, host_tol: 0.3, align_tol: 0.05, wall_mode: 'footprint',
  wall: { height_from_elevation: true, min_thickness: 0.05 }, opening: { door: { from_elevation: true, min_width: 0.5 }, window: { from_elevation: true } } };
console.log('config (no wall/door heights; elev_tol sandbox): ' + JSON.stringify(CFG));
CFG.opening.gap_min = 0.3; CFG.opening.gap_max = 5;   // SANDBOX (SPEC §46 W-S1: needed for stub orientation; largest Duplex wall opening is 4.835 m)
const deps = { DxfParser, hashHex, library: [] };
let fails = 0; const check = (id, issue, ok, d) => { if (!ok) fails++; console.log((ok ? 'PASS ' : 'FAIL ') + id + ' | ' + issue + ' | ' + d); };
const near = (a, b) => Math.abs(a - b) <= 0.01;
const parse = f => new DxfParser().parseSync(txt(f));
const planDesc = {}; ['FLOOR_GF', 'FLOOR_FF'].forEach(f => { planDesc[f] = MK.describe(MK.readMarks(parse(f).entities)).desc; });
const elevs = ['FRONT', 'REAR', 'LEFT', 'RIGHT'].map(f => { const d = parse(f), de = MK.describe(MK.readMarks(d.entities)), al = MK.align(planDesc.FLOOR_GF, de.desc, 0.001);
  return { name: f, face: de.desc.face, clusters: E.elevClusters(d.entities, MAP_ELEV, al.map, CFG.snap_tol, 'glazing'), walls: E.elevWallRects(d.entities, MAP_ELEV, al.map), doors: E.elevClusters(d.entities, MAP_ELEV, al.map, CFG.snap_tol, 'elevdoor') }; });
console.log('elevation rects: ' + elevs.map(e => e.name + ' walls=' + e.walls.length + ' doors=' + e.doors.length).join(' | '));const T = require(path.join(__dirname, '../../deploy/dev/dxf2types.js'));
const LIBDB = path.join(__dirname, '../../deploy/component_library.db');
const lsql = q => JSON.parse(cp.execFileSync('sqlite3', ['-json', '-readonly', LIBDB, q], { encoding: 'utf8' }) || '[]');
const BIND_CFG = { bind: { size_tol: 0.005, prefer: ['DUPLEX_NOMINAL'] } };   // SANDBOX values (SPEC §42: preferred set agreed by user)
const NOPREF_CFG = { bind: { size_tol: 0.005 } };
const setOf = id => /^DUPLEX_/.test(id) ? 'DUPLEX_NOMINAL' : /^US_/.test(id) ? 'US_BBOX' : undefined;   // SANDBOX set assignment by id prefix (library has no set column)
const pairKey = s => { const m = /(\d{3,4})\D{0,12}?[x×]\s*(\d{3,4})/.exec(s || ''); return m ? +m[1] + 'x' + +m[2] : null; };
const walls = lsql('select wall_type_id id, total_mm t, description d from ad_wall_type where is_active=1');
const fams = lsql('select family_id id, opening_type ot, default_width_mm w, default_height_mm h, description d from ad_opening_family where is_active=1');
const LIB = { wall: walls.filter(w => w.id !== 'NONE').map(w => ({ id: w.id, thickness: w.t / 1000 })),
  window: fams.filter(f => f.ot === 'WINDOW').map(f => ({ id: f.id, set: setOf(f.id), width: f.w / 1000, height: f.h / 1000 })), door: fams.filter(f => f.ot === 'DOOR').map(f => ({ id: f.id, set: setOf(f.id), width: f.w / 1000, height: f.h / 1000 })) };
const famKey = {}; fams.forEach(f => { famKey[f.id] = pairKey(f.d); });
console.log('library rows (unfiltered): wall=' + LIB.wall.length + ' window=' + LIB.window.length + ' door=' + LIB.door.length + ' | bind.size_tol=0.005 m (SANDBOX)');
// R-T2 wall type name → library id, FROM_LIBRARY_DESCRIPTION (ad_wall_type.description names the Duplex IFC type)
const WALLMAP = { 'Exterior - Brick on Block': ['EXTERIOR_BRICK'], 'Interior - Partition (92mm Stud)': 'INTERIOR_PARTITION_92', 'Interior - Furring (38 mm Stud)': 'INTERIOR_FURRING_38', 'Interior - Furring (152 mm Stud)': 'INTERIOR_FURRING_152',
  'Interior - Plumbing (152mm Stud)': 'INTERIOR_PLUMBING_152', 'Party Wall - CMU Residential Unit Dimising Wall': ['PARTY_CMU', 'PARTY_CMU_550'], 'Foundation - Concrete (417mm)': 'FOUNDATION_417', 'Foundation - Concrete (435mm)': 'FOUNDATION_435' };
Object.keys(WALLMAP).forEach(k => { WALLMAP[k] = [].concat(WALLMAP[k]); WALLMAP[k].forEach(id => { if (!LIB.wall.find(w => w.id === id)) throw new Error('WALLMAP id not in library: ' + id); }); });   // PARTY_CMU_550: description says 'Thick party wall variant, 2 in Duplex IFC'
const inside = (r, R) => r[0] >= R[0] - 0.001 && r[1] >= R[1] - 0.001 && r[2] <= R[2] + 0.001 && r[3] <= R[3] + 0.001;
const strip = o => { const p = JSON.parse(JSON.stringify(o.params)); delete p.type; delete p.type_request; return JSON.stringify([o.op_type, p, o.output_guid]); };
const tally = {}, wrongList = [], rows = [];
let outlineOk = true;
function scoreStorey(name, level, ops, bindings, cfgB) {
  const r = T.bindTypes(ops, LIB, cfgB || BIND_CFG, { bindings: bindings || [] });
  if (r.ops.slice(0, ops.length).map(strip).join() !== ops.map(strip).join()) outlineOk = false;
  const sw = sql("select m.element_name n, r.minX a, r.minY b, r.maxX c, r.maxY d from elements_meta m join elements_rtree r on r.id=m.id where m.ifc_class='IfcWall' and m.storey='" + name + "'");
  const sd = sql("select m.element_type t, r.minX a, r.minY b, r.maxX c, r.maxY d from elements_meta m join elements_rtree r on r.id=m.id where m.ifc_class='IfcDoor' and m.storey='" + name + "'");
  const sn = sql("select m.element_type t, r.minX a, r.minY b, r.maxX c, r.maxY d from elements_meta m join elements_rtree r on r.id=m.id where m.ifc_class='IfcWindow' and m.storey='" + name + "'");
  const gapBy = {}; r.gaps.filter(g => /^GAP:(type_|layers_)/.test(g.params.code)).forEach(g => { gapBy[g.params.guid] = g; });
  const out = [];
  r.ops.filter(o => o.params && o.params.type_request).forEach(o => {
    const q = o.params.type_request, cls = q.class; let truth = null, truthSrc = null;
    if (cls === 'wall') { const s = sw.filter(x => inside(o.params.rect, [x.a, x.b, x.c, x.d]))[0]; if (s) { const nm = s.n.split(':')[1]; truth = WALLMAP[nm] || null; truthSrc = nm; } }
    else if (cls === 'door') { const h = o.params.hinge, s = sd.find(x => h[0] >= x.a - 0.02 && h[0] <= x.c + 0.02 && h[1] >= x.b - 0.02 && h[1] <= x.d + 0.02); if (s) { truth = [pairKey(s.t)]; truthSrc = s.t; } }
    else { const c = o.params.centre, s = sn.find(x => c[0] >= x.a - 0.05 && c[0] <= x.c + 0.05 && c[1] >= x.b - 0.05 && c[1] <= x.d + 0.05); if (s) { truth = [pairKey(s.t)]; truthSrc = s.t; } }
    const bound = o.params.type ? o.params.type.type_id : null, g = gapBy[o.output_guid];
    const hitKey = bound ? (cls === 'wall' ? bound : famKey[bound]) : null;
    const status = bound ? (truth === null ? 'bound_no_truth' : (truth.includes(hitKey) ? 'correct' : 'WRONG')) : (g ? (g.params.code === 'GAP:type_unbound' && g.params.candidates.length > 1 && truth && g.params.candidates.every(c => truth.includes(cls === 'wall' ? c : famKey[c])) ? 'ambiguous_same_product' : g.params.code.replace('GAP:', '')) : 'none');
    const row = { storey: name, cls, handle: o.params.handle, measured: q.measured, truth, truthSrc, bound, status, cands: g && g.params.candidates, narrowed: g && g.params.prefer_narrowed };
    out.push(row);
    const k = cls + ' ' + status; tally[k] = (tally[k] || 0) + 1;
  });
  return out;
}
const final = {};
for (const st of [{ name: 'Level 1', f: 'FLOOR_GF' }, { name: 'Level 2', f: 'FLOOR_FF' }]) {
  const level = planDesc[st.f].level;
  let ops = B.run(txt(st.f), MAP_PLAN, CFG, deps).ops;
  ops = E.applyElevations(ops, elevs.map(e => ({ face: e.face, clusters: e.clusters })), Object.assign({}, CFG, { wall: Object.assign({ height: 3.1 }, CFG.wall) }), { level, hashHex }).ops;
  ops = E.applyWallHeights(ops, elevs.map(e => ({ face: e.face, walls: e.walls })), CFG, { level }).ops;
  ops = E.applyDoorHeights(ops, elevs.map(e => ({ face: e.face, doors: e.doors })), CFG, { level }).ops;
  final[st.name] = { ops, level };
  rows.push(...scoreStorey(st.name, level, ops));
}
console.log('\n== E3 coverage (class status: count)'); Object.keys(tally).sort().forEach(k => console.log('  ' + k + ': ' + tally[k]));
const fam = {}; rows.filter(r => r.bound && r.cls !== 'wall').forEach(r => { fam[r.bound] = (fam[r.bound] || 0) + 1; }); console.log('  library rows hit (openings): ' + JSON.stringify(fam));
const wb = {}; rows.filter(r => r.bound && r.cls === 'wall').forEach(r => { wb[r.bound] = (wb[r.bound] || 0) + 1; }); console.log('  library rows hit (walls): ' + JSON.stringify(wb));
const amb = rows.filter(r => r.status === 'type_unbound' && r.cands && r.cands.length); amb.slice(0, 12).forEach(r => console.log('  ambiguous ' + r.storey + ' ' + r.cls + ' ' + r.handle + ' measured=' + JSON.stringify(r.measured) + ' truth=' + r.truth + ' cands=' + r.cands.join('|')));
const none = rows.filter(r => r.status === 'type_unbound' && r.cands && !r.cands.length); none.slice(0, 12).forEach(r => console.log('  no candidate ' + r.storey + ' ' + r.cls + ' ' + r.handle + ' measured=' + JSON.stringify(r.measured) + ' truth=' + r.truth + ' (' + r.truthSrc + ')'));
rows.filter(r => r.status === 'type_request_incomplete').forEach(r => console.log('  incomplete ' + r.storey + ' ' + r.cls + ' ' + r.handle + ' measured=' + JSON.stringify(r.measured)));
const J2 = JSON.stringify;
const bad = r => r.status === 'WRONG' || r.status === 'bound_no_truth';
['door', 'window', 'wall'].forEach(c => { const rc = rows.filter(r => r.cls === c), w = rc.filter(bad);
  check('E1-' + c, 'size matching bound a ' + c + ' to a product that differs from the source model type', w.length === 0, c + 's=' + rc.length + ' correct=' + rc.filter(r => r.status === 'correct').length + ' wrong/no-truth=' + w.length);
  w.forEach(r => console.log('  WRONG ' + JSON.stringify(r))); });
// E5 reach: E1 passes vacuously for windows (0 bound); this proves whether the size reaches the right product at all
['door', 'window'].forEach(c => { const rc = rows.filter(r => r.cls === c), ok = rc.filter(r => r.status === 'correct' || r.status === 'ambiguous_same_product');
  check('E5-' + c, 'a ' + c + ' measured from the 2D set does not reach the source product in the library (bound or in the candidate list)', ok.length === rc.length, c + 's=' + rc.length + ' correct=' + rc.filter(r => r.status === 'correct').length + ' ambiguous_same_product=' + rc.filter(r => r.status === 'ambiguous_same_product').length + ' other=' + (rc.length - ok.length)); });
// E6: with the preferred set, every window whose size has ONE product in the set binds correctly; the rest are ambiguous INSIDE the set (819x759: M_Fixed and M_Casement
// are two products of the same size; the drawing's glazing cannot tell them apart). Control: without prefer all 22 are ambiguous (the preference does the work).
{ const w1 = rows.filter(r => r.cls === 'window'), bw = w1.filter(r => r.bound), rest = w1.filter(r => !r.bound);
  const L = final; const saved = JSON.stringify(tally); Object.keys(tally).forEach(k => delete tally[k]);
  const np = [...scoreStorey('Level 1', L['Level 1'].level, L['Level 1'].ops, [], NOPREF_CFG), ...scoreStorey('Level 2', L['Level 2'].level, L['Level 2'].ops, [], NOPREF_CFG)].filter(r => r.cls === 'window');
  Object.keys(tally).forEach(k => delete tally[k]); Object.assign(tally, JSON.parse(saved));
  const famHit = {}; bw.forEach(r => { famHit[r.bound] = (famHit[r.bound] || 0) + 1; });
  const srcMix = sql("select substr(element_name,1,instr(element_name,':')-1) k, count(*) n from elements_meta where ifc_class='IfcWindow' and element_type='819mm x 759mm' group by 1");
  check('E6', 'prefer bound a window wrongly, left a one-product size ambiguous, or did no work', bw.length > 0 && bw.every(r => r.status === 'correct') && rest.every(r => r.truth[0] === '819x759' && J2(r.narrowed) === J2(['DUPLEX_CASEMENT', 'DUPLEX_SMALL_FIXED'])) && np.every(r => r.status === 'ambiguous_same_product'),
    'bound=' + bw.length + ' correct=' + bw.filter(r => r.status === 'correct').length + ' rows=' + JSON.stringify(famHit) + ' | still ambiguous inside the set=' + rest.length + ' (all 819x759, narrowed to DUPLEX_CASEMENT|DUPLEX_SMALL_FIXED; source has ' + JSON.stringify(srcMix) + ') | without prefer: ambiguous=' + np.filter(r => r.status === 'ambiguous_same_product').length + '/' + np.length); }
// E7 (SPEC §44): the marking step labels the 819x759 windows. ROUND TRIP: the label text is taken from the SOURCE model (M_Fixed → DUPLEX_SMALL_FIXED, M_Casement → DUPLEX_CASEMENT);
// on a real drawing it would come from a legend or the user. This proves the mechanism, not discovery.
{ const LABELMAP = { M_Fixed: 'DUPLEX_SMALL_FIXED', M_Casement: 'DUPLEX_CASEMENT' }, saved = JSON.stringify(tally); Object.keys(tally).forEach(k => delete tally[k]);
  const lrows = []; let nLab = 0, nGap = 0;
  for (const name of ['Level 1', 'Level 2']) {
    const sn = sql("select substr(m.element_name,1,instr(m.element_name,':')-1) k, m.element_type t, r.minX a, r.minY b, r.maxX c, r.maxY d, r.minZ z0, r.maxZ z1 from elements_meta m join elements_rtree r on r.id=m.id where m.ifc_class='IfcWindow' and m.storey='" + name + "' and m.element_type='819mm x 759mm'");
    const desc = { units: 'm', labels: sn.map(x => ({ class: 'window', x: (x.a + x.c) / 2, y: (x.b + x.d) / 2, z: (x.z0 + x.z1) / 2, text: LABELMAP[x.k] })) };
    const lr = T.applyLabels(final[name].ops, desc, { m: 1 }, { snap_tol: CFG.snap_tol, level: final[name].level }); nLab += lr.labelled; nGap += lr.gaps.length;
    lrows.push(...scoreStorey(name, final[name].level, lr.ops));
  }
  const lw = lrows.filter(r => r.cls === 'window'), srcN = sql("select count(*) n from elements_meta where ifc_class='IfcWindow' and element_type='819mm x 759mm'")[0].n;
  check('E7', 'labelled windows not all bound correctly, labels lost/ambiguous, or a label did not decide', nLab === srcN && nGap === 0 && lw.length === 22 && lw.every(r => r.status === 'correct'),
    'labels applied=' + nLab + '/' + srcN + ' label gaps=' + nGap + ' | windows=' + lw.length + ' correct=' + lw.filter(r => r.status === 'correct').length + ' bound=' + lw.filter(r => r.bound).length + ' rows=' + JSON.stringify(lw.reduce((a, r) => (a[r.bound] = (a[r.bound] || 0) + 1, a), {})));
  Object.keys(tally).forEach(k => delete tally[k]); Object.assign(tally, JSON.parse(saved)); }
// E8 (SPEC §48): wall labels from the SOURCE model (round trip). Party-wall pieces (two acceptable ids) are not labelled.
{ const saved = JSON.stringify(tally); Object.keys(tally).forEach(k => delete tally[k]);
  const wrows = []; let nLab = 0, nGap = 0, nTry = 0, mism = [];
  for (const name of ['Level 1', 'Level 2']) {
    const sw = sql("select m.element_name n, r.minX a, r.minY b, r.maxX c, r.maxY d from elements_meta m join elements_rtree r on r.id=m.id where m.ifc_class='IfcWall' and m.storey='" + name + "'");
    const labels = [];
    final[name].ops.filter(o => o.op_type === 'DXF_WALL').forEach(o => { const s = sw.filter(x => inside(o.params.rect, [x.a, x.b, x.c, x.d]))[0]; if (!s) return; const ids = WALLMAP[s.n.split(':')[1]]; if (!ids || ids.length !== 1) return;
      const r = o.params.rect; labels.push({ class: 'wall', x: (r[0] + r[2]) / 2, y: (r[1] + r[3]) / 2, text: ids[0] }); });
    nTry += labels.length;
    const lr = T.applyLabels(final[name].ops, { units: 'm', labels }, { m: 1 }, { snap_tol: CFG.snap_tol }); nLab += lr.labelled; nGap += lr.gaps.length;
    const b = T.bindTypes(lr.ops.filter(o => o.op_type !== 'DXF_GAP'), LIB, BIND_CFG, {});
    b.gaps.filter(g => g.params.code === 'GAP:type_size_mismatch').forEach(g => mism.push(name + ' ' + g.params.handle + ' ' + g.params.type_id + ' delta=' + JSON.stringify(g.params.delta)));
    wrows.push(...scoreStorey(name, final[name].level, lr.ops).filter(r => r.cls === 'wall'));
  }
  const wl = wrows;
  check('E8', 'wall labels left a wrong bind, a label gap, or a labelled piece not bound', nLab === nTry && nGap === 0 && wl.every(r => r.status !== 'WRONG' && r.status !== 'bound_no_truth'),
    'labels applied=' + nLab + '/' + nTry + ' label gaps=' + nGap + ' | wall pieces=' + wl.length + ' correct=' + wl.filter(r => r.status === 'correct').length + ' still unbound=' + wl.filter(r => !r.bound).length + ' (' + JSON.stringify(wl.filter(r => !r.bound).reduce((a, r) => (a[r.status] = (a[r.status] || 0) + 1, a), {})) + ') | size mismatches reported=' + mism.length);
  mism.forEach(m => console.log('  mismatch ' + m));
  Object.keys(tally).forEach(k => delete tally[k]); Object.assign(tally, JSON.parse(saved)); }
// E9 (SPEC §53): tags written into copies of the marked DXFs and read back from the files. ROUND TRIP: types come from the SOURCE model.
{ const saved = JSON.stringify(tally); Object.keys(tally).forEach(k => delete tally[k]);
  const FACEFILE = { minY: 'FRONT', maxY: 'REAR', minX: 'LEFT', maxX: 'RIGHT' }, WINID = {};   // window product id per (source class, size pair): 819x759 split by M_Fixed/M_Casement, other sizes: the single DUPLEX_* window family of that size (FROM_LIBRARY)
  const vocab = {}, wcodes = {}, dupWin = fams.filter(f => f.ot === 'WINDOW' && /^DUPLEX_/.test(f.id));
  const winCode = (k, size) => { const key = k + '|' + size; if (WINID[key]) return WINID[key].code; let id = null;
    if (size === '819x759') id = k === 'M_Casement' ? 'DUPLEX_CASEMENT' : 'DUPLEX_SMALL_FIXED'; else { const c = dupWin.filter(f => famKey[f.id] === size); if (c.length === 1) id = c[0].id; }
    if (!id) return null; const code = 'V' + (Object.keys(WINID).length + 1); WINID[key] = { code, id }; vocab[code] = id; return code; }; Object.keys(WALLMAP).forEach((nm, i) => { if (WALLMAP[nm].length === 1) { wcodes[WALLMAP[nm][0]] = 'W' + (i + 1); vocab['W' + (i + 1)] = WALLMAP[nm][0]; } });
  const planMarks = { FLOOR_GF: [], FLOOR_FF: [] }, elevMarks = { FRONT: [], REAR: [], LEFT: [], RIGHT: [] }, STO = { 'Level 1': 'FLOOR_GF', 'Level 2': 'FLOOR_FF' };
  const emap = {}; elevs.forEach(e => { const dE = parse(e.name), de = MK.describe(MK.readMarks(dE.entities)), al = MK.align(planDesc.FLOOR_GF, de.desc, 0.001); emap[e.name] = { desc: de.desc, map: al.map }; });
  let nWinTags = 0, nWallTags = 0, noFace = 0;
  for (const name of ['Level 1', 'Level 2']) {
    const sn = sql("select substr(m.element_name,1,instr(m.element_name,':')-1) k, m.element_type t, r.minX a, r.minY b, r.maxX c, r.maxY d, r.minZ z0, r.maxZ z1 from elements_meta m join elements_rtree r on r.id=m.id where m.ifc_class='IfcWindow' and m.storey='" + name + "'");
    const wins = final[name].ops.filter(o => o.op_type === 'DXF_OPENING' && o.params.kind === 'window');
    sn.forEach(x => { const code = winCode(x.k, x.t && pairKey(x.t)); if (!code) return;   // sizes without a single DUPLEX_* product (skylights) are not tagged
      const cx = (x.a + x.c) / 2, cy = (x.b + x.d) / 2, op = wins.find(o => o.params.bbox && cx >= o.params.bbox[0] - 0.05 && cx <= o.params.bbox[2] + 0.05 && cy >= o.params.bbox[1] - 0.05 && cy <= o.params.bbox[3] + 0.05 && x.z0 + 0.05 >= final[name].level + o.params.sill && x.z1 - 0.05 <= final[name].level + o.params.sill + o.params.height);
      if (!op || !FACEFILE[op.params.face]) { noFace++; return; }
      const E = emap[FACEFILE[op.params.face]], ai = E.desc.haxis.slice(1) === 'X' ? 0 : 1, p = ai === 0 ? cx : cy, h = (p - E.map.toPlan(0)) / (E.map.toPlan(1) - E.map.toPlan(0)), z = (x.z0 + x.z1) / 2, y = (z - E.map.zOf(0)) / (E.map.zOf(1) - E.map.zOf(0));
      elevMarks[FACEFILE[op.params.face]].push({ text: '@TAG=window,' + code, x: h, y: y }); nWinTags++; });
    const sw = sql("select m.element_name n, r.minX a, r.minY b, r.maxX c, r.maxY d from elements_meta m join elements_rtree r on r.id=m.id where m.ifc_class='IfcWall' and m.storey='" + name + "'");
    final[name].ops.filter(o => o.op_type === 'DXF_WALL').forEach(o => { const s0 = sw.filter(x => inside(o.params.rect, [x.a, x.b, x.c, x.d]))[0]; if (!s0) return; const ids = WALLMAP[s0.n.split(':')[1]]; if (!ids || ids.length !== 1) return;
      const r = o.params.rect; planMarks[STO[name]].push({ text: '@TAG=wall,' + wcodes[ids[0]], x: (r[0] + r[2]) / 2 * 1000, y: (r[1] + r[3]) / 2 * 1000 }); nWallTags++; });
  }
  // write the tags into copies of the marked files and read them back from the text
  const OUT2 = path.join(__dirname, 'out/tagged'); fs.mkdirSync(OUT2, { recursive: true });
  const readBack = (f, marks) => { const t2 = MK.writeMarks(txt(f), marks); fs.writeFileSync(path.join(OUT2, 'DX_' + f + '_tagged.dxf'), t2); const d2 = new DxfParser().parseSync(t2); return MK.describe(MK.readMarks(d2.entities)); };
  const planTagged = {}; Object.keys(planMarks).forEach(f => { planTagged[f] = readBack(f, planMarks[f]); });
  const elevTagged = {}; Object.keys(elevMarks).forEach(f => { elevTagged[f] = readBack(f, elevMarks[f]); });
  // writeMarks places the marker text at (x, y) in drawing units; elevation h,y are drawing units, plan x,y are mm
  const readTags = [].concat(...Object.values(planTagged).map(d => d.desc.tags)).length + [].concat(...Object.values(elevTagged).map(d => d.desc.tags)).length;
  const errs = [].concat(...Object.values(planTagged), ...Object.values(elevTagged)).flatMap(d => d.errors.filter(e => e.code !== 'MARK:missing'));
  const lrows = []; const tagStat = { labelled: 0, unmatched: 0, bad: [] };
  const views = st => [{ desc: planTagged[STO[st]].desc }].concat(Object.keys(elevTagged).map(f => ({ desc: elevTagged[f].desc, map: emap[f].map })));
  const unmatchedBy = {};
  for (const name of ['Level 1', 'Level 2']) {
    const lr = T.applyTags(final[name].ops, views(name), MK.UNITS, { snap_tol: CFG.snap_tol, level: final[name].level, vocab });
    tagStat.labelled += lr.labelled;
    lr.gaps.forEach(g => { if (g.params.code === 'GAP:label_unmatched') { const k = JSON.stringify([g.params.class, g.params.tag, g.params.text]); (unmatchedBy[k] = unmatchedBy[k] || []).push(name); } else tagStat.bad.push(g.params.code); });
    lrows.push(...scoreStorey(name, final[name].level, lr.ops));
  }
  // an elevation tag may be unmatched in one storey but must be matched in the other; plan wall tags belong to one storey only (their own plan view is applied in both loops, so they show as unmatched in the other storey)
  const tw = lrows.filter(r => r.cls === 'window'), tl = lrows.filter(r => r.cls === 'wall');
  check('E9', 'tags written to the drawings and read back did not produce the same typing (labels lost, ambiguous, or types wrong)', errs.length === 0 && readTags === nWinTags + nWallTags && tagStat.labelled === nWinTags + nWallTags && tagStat.bad.length === 0 && noFace === 0 && lrows.every(r => r.status !== 'WRONG' && r.status !== 'bound_no_truth') && tw.length === 22 && tw.every(r => r.status === 'correct') && tl.length === 30 && tl.every(r => r.status === 'correct'),
    'tags written: windows=' + nWinTags + ' walls=' + nWallTags + ' read back=' + readTags + ' marker errors=' + errs.length + ' | labelled=' + tagStat.labelled + ' other label gaps=' + J2(tagStat.bad) + ' windows without face=' + noFace + ' | windows correct=' + tw.filter(r => r.status === 'correct').length + '/' + tw.length + ' walls correct=' + tl.filter(r => r.status === 'correct').length + '/' + tl.length);
  Object.keys(tally).forEach(k => delete tally[k]); Object.assign(tally, JSON.parse(saved)); }
// E2 control: force one wrong explicit binding; the scorer must call exactly that element wrong
{ const L1 = final['Level 1'], d = L1.ops.find(o => o.op_type === 'DXF_OPENING' && o.params.kind === 'door' && o.params.height_source === 'elevation');
  const saved = JSON.stringify(tally); Object.keys(tally).forEach(k => delete tally[k]);
  const r2 = scoreStorey('Level 1', L1.level, L1.ops, [{ select: { guid: d.output_guid }, type_id: 'FIRE_DOOR_WIDE' }]);
  const base = rows.filter(x => x.storey === 'Level 1' && bad(x)).length, w2 = r2.filter(x => bad(x));
  check('E2', 'the scorer cannot detect a wrong bind', w2.length === base + 1 && w2.some(x => x.handle === d.params.handle && x.cls === 'door'), 'baseline wrong on Level 1=' + base + '; forced FIRE_DOOR_WIDE on door ' + d.params.handle + ' → wrong=' + w2.length);
  Object.keys(tally).forEach(k => delete tally[k]); Object.assign(tally, JSON.parse(saved)); }
check('E4', 'binding changed outline fields of the ops (2D→3D line not clean)', outlineOk, 'outline fields identical for all ops in both storeys');
console.log('SUMMARY fail=' + fails);
