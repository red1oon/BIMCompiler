// ⚠ DO NOT REMOVE — ROSETTA R5 (SPEC §26): Duplex windows with heights read from the MARKED elevations, compared one by one with the source model.
// Inputs: marked copies from mark_dx_set.js (tests/dxf2bim/out/marked/). Source = 2D_Layout/input/DX_extracted.db. Round trip (the DXFs were exported from it).
// Config values for walls (height 3.1, min_thickness, host_tol) are SANDBOX/FROM_SOURCE_MODEL as in rosetta_dx.js; WINDOW heights come ONLY from the elevations.
// Read the log after every run. Usage: node tests/dxf2bim/rosetta_dx_elev.js  (run mark_dx_set.js first)
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
const MAP = { version: 1, rules: [
  { match: 'exact', pattern: 'A-WALL-FULL', type: 'wall' }, { match: 'exact', pattern: 'A-WALL-PRTN', type: 'wall' }, { match: 'exact', pattern: 'A-WALL-PATT', type: 'ignore' },
  { match: 'exact', pattern: 'A-DOOR', type: 'opening' }, { match: 'exact', pattern: 'A-GLAZ', type: 'glazing' },
  { match: 'exact', pattern: 'A-GRID', type: 'ignore' }, { match: 'exact', pattern: 'A-ANNO-TEXT', type: 'ignore' }, { match: 'exact', pattern: 'A-ANNO-DIMS', type: 'ignore' },
  { match: 'exact', pattern: 'A-FURN', type: 'ignore' }, { match: 'exact', pattern: 'A-TTLB', type: 'ignore' }, { match: 'exact', pattern: '0', type: 'ignore' } ] };
const CFG = { version: 1, units: 'mm', snap_tol: 0.001, host_tol: 0.3, align_tol: 0.05, wall_mode: 'footprint', wall: { height: 3.1, base: 0, min_thickness: 0.05 },
  opening: { door: { height: 2.1, min_width: 0.5 }, window: { from_elevation: true } } };
const deps = { DxfParser, hashHex, library: [] };
let fails = 0; const check = (id, issue, ok, d) => { if (!ok) fails++; console.log((ok ? 'PASS ' : 'FAIL ') + id + ' | ' + issue + ' | ' + d); };
const near = (a, b) => Math.abs(a - b) <= 0.01;

// elevation sets (aligned to the GF plan markings)
const parse = f => new DxfParser().parseSync(txt(f));
const planDesc = {}; ['FLOOR_GF', 'FLOOR_FF'].forEach(f => { planDesc[f] = MK.describe(MK.readMarks(parse(f).entities)).desc; });
const elevs = ['FRONT', 'REAR', 'LEFT', 'RIGHT'].map(f => {
  const d = parse(f), de = MK.describe(MK.readMarks(d.entities)); const al = MK.align(planDesc.FLOOR_GF, de.desc, 0.001);
  if (!al.ok) throw new Error('align ' + f + ' ' + JSON.stringify(al.errors));
  return { name: f, face: de.desc.face, clusters: E.elevClusters(d.entities, MAP, al.map, CFG.snap_tol) };
});
console.log('elevation clusters: ' + elevs.map(e => e.name + '(' + e.face + ')=' + e.clusters.length).join(' '));

const derived = [], allUnmatched = [], levels = [];
for (const st of [{ name: 'Level 1', f: 'FLOOR_GF' }, { name: 'Level 2', f: 'FLOOR_FF' }]) {
  const level = planDesc[st.f].level; levels.push(level);
  const run = B.run(txt(st.f), MAP, CFG, deps);
  const res = E.applyElevations(run.ops, elevs, CFG, { level, hashHex });
  const w = res.ops.filter(o => o.op_type === 'DXF_OPENING' && o.params.kind === 'window');
  const gc = {}; res.ops.filter(o => o.op_type === 'DXF_GAP').forEach(o => { gc[o.params.code] = (gc[o.params.code] || 0) + 1; });
  console.log('\n== ' + st.name + ' level=' + level + ': plan windows(pending)=' + run.ops.filter(o => o.params && o.params.pending_elevation).length + ' -> derived windows=' + w.length +
    ' elevation gaps: no_elevation_match=' + (gc['GAP:no_elevation_match'] || 0) + ' no_elevation_for_face=' + (gc['GAP:no_elevation_for_face'] || 0));
  w.forEach(o => derived.push({ st: st.name, bbox: o.params.bbox, z0: level + o.params.sill, z1: level + o.params.sill + o.params.height, face: o.params.face, op: o }));
  allUnmatched.push({ st: st.name, list: res.unmatched_elev });
  st.res = res; st.run = run; st.level = level;
}
// R5: one-by-one comparison with the source windows of Level 1 and Level 2
const src = sql("select m.id id, m.storey st, r.minX a, r.minY b, r.maxX c, r.maxY d, r.minZ z0, r.maxZ z1 from elements_meta m join elements_rtree r on r.id=m.id where m.ifc_class='IfcWindow' and m.storey in ('Level 1','Level 2') order by m.id");
const eq = (d, s) => d.st === s.st && near(d.bbox[0], s.a) && near(d.bbox[1], s.b) && near(d.bbox[2], s.c) && near(d.bbox[3], s.d) && near(d.z0, s.z0) && near(d.z1, s.z1);
const usedS = new Set(), usedD = new Set(); let match = 0;
src.forEach(s => { const i = derived.findIndex((d, k) => !usedD.has(k) && eq(d, s)); if (i >= 0) { usedD.add(i); usedS.add(s.id); match++; } });
const strayD = derived.filter((_, k) => !usedD.has(k)), missS = src.filter(s => !usedS.has(s.id));
check('R5-precision', 'a derived window equals no source window (plan box + sill/head 10 mm)', strayD.length === 0, 'derived=' + derived.length + ' matched=' + match + ' stray=' + strayD.length);
check('R5-recall', 'a source window of Level 1/2 is not derived', missS.length === 0, 'source windows=' + src.length + ' derived=' + match + ' missing=' + missS.length);
if (missS.length) console.log('  missing source windows: ' + missS.map(s => s.id + '[' + s.st + ' ' + [s.a, s.b, s.c, s.d].map(v => +v.toFixed(3)) + ' z ' + +s.z0.toFixed(3) + '..' + +s.z1.toFixed(3) + ']').join(' '));
if (strayD.length) console.log('  stray derived: ' + strayD.map(d => d.st + ' ' + d.bbox + ' z ' + d.z0 + '..' + d.z1).join(' | '));
const um = allUnmatched.map(u => u.st + ': ' + u.list.length + ' elevation clusters used by no plan window of that storey').join(' | ');
console.log('INFO ' + um + ' (clusters of the other storey, end-on views, roof windows)');
const nowin = new Set(); allUnmatched.forEach(u => u.list.forEach(c => nowin.add(c.face + c.p0 + c.p1 + c.z0 + c.z1)));
const usedElev = new Set(); [0, 1].forEach(i => {}); // cluster usage across both storeys:
const unusedBoth = elevs.flatMap((e, ei) => e.clusters.map((c, ci) => ({ e, c, key: e.face + ':' + ei + ':' + ci }))).filter(x => allUnmatched.every(u => u.list.some(m => m.face === x.e.face && m.p0 === x.c.p0 && m.z0 === x.c.z0 && m.p1 === x.c.p1 && m.z1 === x.c.z1)));
console.log('INFO elevation clusters used by NO storey: ' + unusedBoth.length + ' ' + JSON.stringify(unusedBoth.map(x => x.e.name + ' plan[' + x.c.p0 + ',' + x.c.p1 + '] z[' + x.c.z0 + ',' + x.c.z1 + ']')));

// meshes with elevation-derived window heights
const els = [];
[...[0, 1]].forEach(i => {}); 
const sts = [{ name: 'Level 1', f: 'FLOOR_GF' }, { name: 'Level 2', f: 'FLOOR_FF' }];
let tot = 0, openCut = 0, notes = 0, gaps = 0;
sts.forEach((st, i) => { const run = B.run(txt(st.f), MAP, CFG, deps); const res = E.applyElevations(run.ops, elevs, CFG, { level: levels[i], hashHex });
  const m = M.meshFromOps(res.ops, { level: levels[i], hashHex, snapTol: CFG.snap_tol }); tot += m.elements.length; notes += m.notes.length; gaps += m.gaps.length; els.push(...m.elements); });
const bad = els.filter(e => !e.watertight || !(e.volume > 0));
console.log('mesh with elevation windows: elements=' + tot + ' bad=' + bad.length + ' drawn-gap notes=' + notes + ' mesh gaps=' + gaps);
check('R5-mesh', 'a meshed element is open or inside-out after window heights from elevations', bad.length === 0, 'bad=' + bad.length + '/' + els.length);
console.log('SUMMARY fail=' + fails);
