// ⚠ DO NOT REMOVE — ROSETTA R6 (SPEC §28): wall and door heights read ONLY from the marked Duplex elevations, compared with the source model.
// Plan runs are in elevation mode (no wall.height / door.height in config, no fallback), so coverage shows what the drawings alone give.
// Round trip (DXFs were exported from the source model). Run mark_dx_set.js first. Read the log after every run.
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
const deps = { DxfParser, hashHex, library: [] };
let fails = 0; const check = (id, issue, ok, d) => { if (!ok) fails++; console.log((ok ? 'PASS ' : 'FAIL ') + id + ' | ' + issue + ' | ' + d); };
const near = (a, b) => Math.abs(a - b) <= 0.01;
const parse = f => new DxfParser().parseSync(txt(f));
const planDesc = {}; ['FLOOR_GF', 'FLOOR_FF'].forEach(f => { planDesc[f] = MK.describe(MK.readMarks(parse(f).entities)).desc; });
const elevs = ['FRONT', 'REAR', 'LEFT', 'RIGHT'].map(f => { const d = parse(f), de = MK.describe(MK.readMarks(d.entities)), al = MK.align(planDesc.FLOOR_GF, de.desc, 0.001);
  return { name: f, face: de.desc.face, clusters: E.elevClusters(d.entities, MAP_ELEV, al.map, CFG.snap_tol, 'glazing'), walls: E.elevWallRects(d.entities, MAP_ELEV, al.map), doors: E.elevClusters(d.entities, MAP_ELEV, al.map, CFG.snap_tol, 'elevdoor') }; });
console.log('elevation rects: ' + elevs.map(e => e.name + ' walls=' + e.walls.length + ' doors=' + e.doors.length).join(' | '));
const inside = (r, R) => r[0] >= R[0] - 0.001 && r[1] >= R[1] - 0.001 && r[2] <= R[2] + 0.001 && r[3] <= R[3] + 0.001;
const finalOps = {};
for (const st of [{ name: 'Level 1', f: 'FLOOR_GF' }, { name: 'Level 2', f: 'FLOOR_FF' }]) {
  const level = planDesc[st.f].level;
  let ops = B.run(txt(st.f), MAP_PLAN, CFG, deps).ops;
  ops = E.applyElevations(ops, elevs.map(e => ({ face: e.face, clusters: e.clusters })), Object.assign({}, CFG, { wall: Object.assign({ height: 3.1 }, CFG.wall) }), { level, hashHex }).ops;
  const wr = E.applyWallHeights(ops, elevs.map(e => ({ face: e.face, walls: e.walls })), CFG, { level }); ops = wr.ops;
  const dr = E.applyDoorHeights(ops, elevs.map(e => ({ face: e.face, doors: e.doors })), CFG, { level }); ops = dr.ops; finalOps[st.name] = { ops, level };
  const walls = ops.filter(o => o.op_type === 'DXF_WALL'), tot = walls.length + wr.report.conflict + wr.report.none;
  console.log('\\n== ' + st.name + ' level=' + level + ': wall pieces total=' + tot + ' | height from elevation=' + wr.report.elevation + ' conflict=' + wr.report.conflict + ' no height=' + wr.report.none +
    ' | doors: from elevation=' + dr.report.elevation + ' no height=' + dr.report.none);
  // R6 walls: precision against containing source walls
  const src = sql("select m.id id, r.minX a, r.minY b, r.maxX c, r.maxY d, r.minZ z0, r.maxZ z1 from elements_meta m join elements_rtree r on r.id=m.id where m.ifc_class='IfcWall' and m.storey='" + st.name + "'");
  const withH = walls.filter(o => o.params.height_source === 'elevation'); let ok = 0; const bad = [];
  withH.forEach(o => { const z0 = level + o.params.base, z1 = z0 + o.params.height; const cont = src.filter(s => inside(o.params.rect || [], [s.a, s.b, s.c, s.d]));
    if (cont.some(s => near(s.z0, z0) && near(s.z1, z1))) ok++; else bad.push(o.params.handle + ' z[' + +z0.toFixed(3) + ',' + +z1.toFixed(3) + '] containing source z=' + cont.map(s => '[' + +s.z0.toFixed(3) + ',' + +s.z1.toFixed(3) + ']').join(',')); });
  check('R6-walls ' + st.name, 'a wall height from the elevations differs from the source wall that contains the piece (10 mm)', bad.length === 0, 'with elevation height=' + withH.length + ' equal to a containing source wall z=' + ok + ' mismatches=' + bad.length);
  if (bad.length) console.log('  mismatches: ' + bad.join(' | '));
  const gp = {}; ops.filter(o => o.op_type === 'DXF_GAP').forEach(o => { gp[o.params.code] = (gp[o.params.code] || 0) + 1; });
  console.log('  elevation gaps ' + JSON.stringify({ no_elevation_height: gp['GAP:no_elevation_height'] || 0, elevation_height_conflict: gp['GAP:elevation_height_conflict'] || 0 }));
  // doors
  const sd = sql("select r.minX a,r.minY b,r.maxX c,r.maxY d,r.minZ z0,r.maxZ z1 from elements_meta m join elements_rtree r on r.id=m.id where m.ifc_class='IfcDoor' and m.storey='" + st.name + "'");
  const dEl = ops.filter(o => o.op_type === 'DXF_OPENING' && o.params.kind === 'door' && o.params.height_source === 'elevation'); let dOk = 0; const dBad = [];
  dEl.forEach(o => { const h = o.params.hinge, z0 = level, z1 = level + o.params.height; const cand = sd.filter(s => h[0] >= s.a - 0.02 && h[0] <= s.c + 0.02 && h[1] >= s.b - 0.02 && h[1] <= s.d + 0.02);
    if (cand.some(s => near(s.z0, z0) && near(s.z1, z1))) dOk++; else dBad.push(o.params.handle + ' z1=' + z1.toFixed(3) + ' near source ' + cand.map(s => s.z1.toFixed(3))); });
  check('R6-doors ' + st.name, 'a door height from the elevations differs from the source door at that hinge (10 mm)', dBad.length === 0, 'doors with elevation height=' + dEl.length + ' equal to source=' + dOk + ' mismatches=' + dBad.length + ' | source doors=' + sd.length + ' without elevation height=' + (ops.filter(o => o.op_type === 'DXF_GAP' && o.params.code === 'GAP:no_elevation_height' && /DOOR/.test(o.params.layer)).length));
  if (dBad.length) console.log('  door mismatches: ' + dBad.join(' | '));
}
// mesh integrity with heights from elevations
const els = []; for (const [name, v] of Object.entries(finalOps)) { const m = M.meshFromOps(v.ops, { level: v.level, hashHex, snapTol: CFG.snap_tol }); els.push(...m.elements); console.log('mesh ' + name + ': elements=' + m.elements.length + ' notes=' + m.notes.length + ' gaps=' + JSON.stringify(m.gaps.reduce((a, g) => (a[g.code] = (a[g.code] || 0) + 1, a), {}))); }
const badM = els.filter(e => !e.watertight || !(e.volume > 0));
check('R6-mesh', 'a meshed element is open or inside-out', badM.length === 0, 'elements=' + els.length + ' bad=' + badM.length);
console.log('SUMMARY fail=' + fails);
// ---- diagnostic: Level 1 doors, which got an elevation height and which did not ----
{ const v = finalOps['Level 1']; v.ops.filter(o => o.op_type === 'DXF_OPENING' && o.params.kind === 'door').forEach(o => console.log('  L1 door ' + o.params.handle + ' hinge=' + o.params.hinge + ' width=' + o.params.width + ' src=' + o.params.height_source + ' face=' + (o.params.face || '-') + ' height=' + o.params.height));
  v.ops.filter(o => o.op_type === 'DXF_GAP' && /DOOR/.test(o.params.layer || '') && o.params.code === 'GAP:no_elevation_height').forEach(o => console.log('  L1 door gap ' + o.params.handle)); }
