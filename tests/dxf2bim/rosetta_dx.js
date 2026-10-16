// ⚠ DO NOT REMOVE — ROSETTA test (SPEC §15): rebuild the Duplex storeys from the 2D plan DXFs and compare to the source model.
// Source = 2D_Layout/input/DX_extracted.db (metres, elements_rtree bbox). The DXFs were exported FROM that model, so this is a
// round trip with known ground truth, not an independent real-world test. Source-derived config values are labelled FROM_SOURCE_MODEL.
// Read the log after every run. Usage: node tests/dxf2bim/rosetta_dx.js
'use strict';
const fs = require('fs'), crypto = require('crypto'), path = require('path'), cp = require('child_process');
const DxfParser = require(path.join(__dirname, '../../deploy/dev/dxf-parser.js'));
const B = require(path.join(__dirname, '../../deploy/dev/dxf2bim.js'));
const M = require(path.join(__dirname, '../../deploy/dev/dxf2mesh.js'));
const hashHex = s => crypto.createHash('sha256').update(s).digest('hex');
const ROOT = path.join(__dirname, '../..');
const DB = path.join(ROOT, '2D_Layout/input/DX_extracted.db');
// STD_DIR set (lane spec §L1.3 F2): read the std set DX_<view>_std.dxf from it; otherwise the old timestamped set
const STD_DIR = process.env.STD_DIR || null;
const DXF = n => fs.readFileSync(STD_DIR ? path.join(STD_DIR, 'DX_' + n + '_std.dxf') : path.join(ROOT, '2D_Layout/output/DXF/DX_' + n + '_20260428_0636.dxf'), 'utf8');
const sql = q => JSON.parse(cp.execFileSync('sqlite3', ['-json', '-readonly', DB, q], { encoding: 'utf8', maxBuffer: 1 << 26 }) || '[]');
const MAP = { version: 1, rules: [
  { match: 'exact', pattern: 'A-WALL-FULL', type: 'wall' }, { match: 'exact', pattern: 'A-WALL-PRTN', type: 'wall' }, { match: 'exact', pattern: 'A-WALL-PATT', type: 'ignore' },
  { match: 'exact', pattern: 'A-DOOR', type: 'opening' }, { match: 'exact', pattern: 'A-GLAZ', type: 'glazing' },
  { match: 'exact', pattern: 'A-GRID', type: 'ignore' }, { match: 'exact', pattern: 'A-ANNO-TEXT', type: 'ignore' }, { match: 'exact', pattern: 'A-ANNO-DIMS', type: 'ignore' },
  { match: 'exact', pattern: 'A-FURN', type: 'ignore' }, { match: 'exact', pattern: 'A-TTLB', type: 'ignore' }, { match: 'exact', pattern: '0', type: 'ignore' } ] };
const CASING = 0.076;   // observed: drawn door jamb polylines on A-DOOR are 76 mm wide (asserted below)
let fails = 0; const check = (id, issue, ok, d) => { if (!ok) fails++; console.log((ok ? 'PASS ' : 'FAIL ') + id + ' | ' + issue + ' | ' + d); };
const STOREYS = [{ name: 'Level 1', file: 'FLOOR_GF', level: 0 }, { name: 'Level 2', file: 'FLOOR_FF', level: 3.1 }];   // levels FROM_SOURCE_MODEL (storey minZ)
// FROM_SOURCE_MODEL: wall z range of Level 1 is 0..3.1 for exterior walls; interior walls vary 2.795/3.1: single height is a simplification
const CFG = { version: 1, units: 'mm', snap_tol: 0.001, host_tol: 0.3, align_tol: 0.05, wall_mode: 'footprint', wall: { height: 3.1, base: 0, min_thickness: 0.05, polygon_footprint: true }, slab: { thickness: 0.2, level: 0 },
  opening: { door: { height: 2.1, min_width: 0.5 }, rect: { sill: 0.9, height: 1.2 }, window: { sill: 0.9, height: 1.2 }, gap_min: 0.3, gap_max: 5 } };
// BASIC_SHAPES_SPEC §2.1/§2.2 (2026-10-16): polygon_footprint (mitred outlines kept exactly) and gap_min/gap_max (SANDBOX, as rosetta_dx_types.js) so §46 stub orientation and F5b run
console.log('set: ' + (STD_DIR ? 'std ' + STD_DIR : 'old timestamped 20260428_0636'));
console.log('config: ' + JSON.stringify(CFG) + '  (levels/height FROM_SOURCE_MODEL; min_thickness/min_width/host_tol/door+window heights SANDBOX)');
const deps = { DxfParser, hashHex, library: [] };
const near = (a, b) => Math.abs(a - b) <= 0.001 + 1e-9;
const unionLen = iv => { const a = iv.map(x => [Math.min(x[0], x[1]), Math.max(x[0], x[1])]).sort((p, q) => p[0] - q[0]); let n = 0, c = null; a.forEach(x => { if (!c || x[0] > c[1]) { if (c) n += c[1] - c[0]; c = x.slice(); } else c[1] = Math.max(c[1], x[1]); }); if (c) n += c[1] - c[0]; return n; };
const sameRect = (a, b) => near(a[0], b[0]) && near(a[1], b[1]) && near(a[2], b[2]) && near(a[3], b[3]);

for (const st of STOREYS) {
  console.log('\n===== ' + st.name + ' (' + st.file + ') =====');
  const run = B.run(DXF(st.file), MAP, CFG, deps);
  const ours = run.ops.filter(o => o.op_type === 'DXF_WALL').map(o => ({ h: o.params.handle, layer: o.params.layer, rect: o.params.rect }));
  const gc = {}; run.report.gaps.forEach(g => { gc[g.code] = (gc[g.code] || 0) + 1; });
  console.log('dxf entities=' + run.report.counts.entities + ' our walls=' + ours.length + ' ignored=' + run.report.counts.ignored + ' gaps=' + JSON.stringify(gc) + ' units_source=' + run.report.units_source + ' extent_m=' + JSON.stringify(run.report.extent_m));
  // section height 1.2 m above the storey level (plan cut): source walls whose z range contains it
  const cut = st.level + 1.2;
  const allSrc = sql("select m.id id, m.element_name name, r.minX a, r.minY b, r.maxX c, r.maxY d, r.minZ z0, r.maxZ z1 from elements_meta m join elements_rtree r on r.id=m.id where m.ifc_class='IfcWall' and m.storey='" + st.name + "'")
    .map(x => ({ id: x.id, rect: [x.a, x.b, x.c, x.d], z0: x.z0, z1: x.z1, cut: x.z0 <= cut && cut < x.z1 }));
  const srcCut = allSrc.filter(x => x.cut);
  console.log('source walls on storey=' + allSrc.length + ' cut by plane z=' + cut + ' -> ' + srcCut.length);
  const inside = (r, R) => r[0] >= R[0] - 0.001 && r[1] >= R[1] - 0.001 && r[2] <= R[2] + 0.001 && r[3] <= R[3] + 0.001;
  // R1a precision: each of our pieces lies inside some source wall (cut ones)
  const host = ours.map(o => srcCut.find(s => inside(o.rect, s.rect)));
  const stray = ours.filter((_, i) => !host[i]);
  check('R1a ' + st.name, 'a wall piece we emit lies outside every source wall (invented geometry)', stray.length === 0, 'pieces=' + ours.length + ' inside a source wall=' + (ours.length - stray.length) + ' stray=' + stray.length);
  if (stray.length) console.log('  stray: ' + stray.map(o => o.h + ':' + o.layer + '[' + o.rect.map(v => +v.toFixed(3)) + ']').join(' '));
  // R1b recall: uncovered length of each source wall == widths of source doors/windows whose plan centre lies inside it
  const srcOp = sql("select m.ifc_class k, r.minX a, r.minY b, r.maxX c, r.maxY d from elements_meta m join elements_rtree r on r.id=m.id where m.ifc_class in ('IfcDoor','IfcWindow') and m.storey='" + st.name + "'")
    .map(x => ({ k: x.k, cx: (x.a + x.c) / 2, cy: (x.b + x.d) / 2, long: Math.max(x.c - x.a, x.d - x.b) }));
  let bad = 0, adjOk = 0, rows = [], missed = [];
  srcCut.forEach((S, i) => {
    const w = S.rect[2] - S.rect[0], h = S.rect[3] - S.rect[1], horiz = w >= h, L = horiz ? w : h;
    // R1b-u (BASIC_SHAPES_SPEC §2.4): UNION of intervals along the wall axis (stacked windows share one plan interval; mitre triangles overlap long pieces' bboxes)
    const pcs = ours.filter(o => inside(o.rect, S.rect)); const cov = unionLen(pcs.map(o => horiz ? [o.rect[0], o.rect[2]] : [o.rect[1], o.rect[3]]));
    const ops = srcOp.filter(q => q.cx >= S.rect[0] - 0.001 && q.cx <= S.rect[2] + 0.001 && q.cy >= S.rect[1] - 0.001 && q.cy <= S.rect[3] + 0.001);
    const opW = ops.reduce((n, q) => n + q.long, 0), unc = L - cov, ok = Math.abs(unc - opW) <= 0.005;
    const opAdj = unionLen(ops.map(q => { const c = horiz ? q.cx : q.cy, h = q.long / 2 - (q.k === 'IfcDoor' ? CASING : 0); return [c - h, c + h]; })); const okAdj = Math.abs(unc - opAdj) <= 0.005; if (okAdj) adjOk++; else missed.push({ S, unc, opAdj });
    if (!ok) bad++; rows.push((ok ? ' ok ' : 'BAD ') + 'wall ' + S.id + ' L=' + L.toFixed(3) + ' pieces=' + pcs.length + ' covered=' + cov.toFixed(3) + ' uncovered=' + unc.toFixed(3) + ' source openings=' + ops.length + ' width sum=' + opW.toFixed(3));
  });
  console.log('INFO R1b strict (superseded by D-2, source door bbox incl. casing): ' + (srcCut.length - bad) + '/' + srcCut.length + ' source walls reconstructed');
  rows.forEach(r => console.log('  ' + r));
  // evidence for the casing constant: the drawing has A-DOOR closed polylines with a 76 mm side
  const dd = new DxfParser().parseSync(DXF(st.file)); const ents = dd.entities;
  const has76 = ents.some(e => e.layer === 'A-DOOR' && e.type === 'LWPOLYLINE' && (() => { const xs = e.vertices.map(v => v.x), ys = e.vertices.map(v => v.y); const w = Math.max(...xs) - Math.min(...xs), h = Math.max(...ys) - Math.min(...ys); return Math.abs(w - 76) < 1 || Math.abs(h - 76) < 1; })());
  check('R1-evidence ' + st.name, 'casing constant 0.076 not supported by the drawing', has76, 'A-DOOR polyline with a 76 mm side present=' + has76);
  check('R1b-stated ' + st.name, 'wall coverage + source openings (door casing 2 x 0.076 removed; union of intervals, R1b-u) does not reconstruct the source wall (tol 5 mm)', adjOk === srcCut.length, adjOk + '/' + srcCut.length + ' source walls reconstructed');
  // R1c: every miss explained by a logged gap or an ignored/unmapped entity overlapping the wall rect
  const bbox = e => { const vs = (e.vertices || []).map(v => [v.x * 0.001, v.y * 0.001]); if (e.center) vs.push([e.center.x * 0.001, e.center.y * 0.001]); if (!vs.length) return null; return [Math.min(...vs.map(v => v[0])), Math.min(...vs.map(v => v[1])), Math.max(...vs.map(v => v[0])), Math.max(...vs.map(v => v[1]))]; };
  const overlap = (a, R) => a && a[0] < R[2] - 0.001 && a[2] > R[0] + 0.001 && a[1] < R[3] - 0.001 && a[3] > R[1] + 0.001;
  const gapH = new Map(run.report.gaps.map(g => [g.handle, g.code])); const ignH = new Set(run.report.ignored.map(g => g.handle));
  let unexplained = 0;
  missed.forEach(m => {
    const why = new Set();
    ents.forEach(e => { if (!/^A-WALL/.test(e.layer) && e.layer !== 'A-DOOR' && e.layer !== 'A-GLAZ') return; const bb = bbox(e); if (!overlap(bb, m.S.rect)) return;
      if (gapH.has(e.handle)) why.add(gapH.get(e.handle) + '@' + e.layer); else if (ignH.has(e.handle)) why.add('ignored@' + e.layer); });
    const ourPieces = ours.filter(o => inside(o.rect, m.S.rect)).length;
    if (!why.size && !ourPieces) unexplained++;
    console.log('  R1c wall ' + m.S.id + ' [' + m.S.rect.map(v => +v.toFixed(3)) + '] uncovered=' + m.unc.toFixed(3) + ' expected=' + m.opAdj.toFixed(3) + ' pieces=' + ourPieces + ' explained-by=' + (why.size ? [...why].join(',') : (ourPieces ? 'pieces present, coverage short (see numbers)' : 'NOTHING')));
  });
  check('R1c ' + st.name, 'a source wall is missing from our model with no logged gap or ignored entity explaining it (silent loss)', unexplained === 0, 'misses=' + missed.length + ' unexplained=' + unexplained);
  // doors
  const doors = run.ops.filter(o => o.op_type === 'DXF_OPENING' && o.params.kind === 'door').map(o => o.params.width).sort((p, q) => p - q);
  const sdoor = sql("select r.minX a,r.minY b,r.maxX c,r.maxY d from elements_meta m join elements_rtree r on r.id=m.id where m.ifc_class='IfcDoor' and m.storey='" + st.name + "'");
  // §L1.3 F2: R3 compares with the LEAF width = bbox long side - 2 x CASING (the same constant + rule as R1b-stated)
  const sw = sdoor.map(x => +(Math.max(x.c - x.a, x.d - x.b) - 2 * CASING).toFixed(3)).sort((p, q) => p - q);
  const pool = sw.slice(); let subset = true; doors.forEach(w => { const i = pool.findIndex(v => Math.abs(v - w) <= 0.002); if (i < 0) subset = false; else pool.splice(i, 1); });
  const lowGaps = run.report.gaps.filter(g => g.code === 'GAP:door_below_min_width').length;
  console.log('door arcs emitted widths(m)=' + JSON.stringify(doors.map(v => +v.toFixed(3))) + ' | source door leaf widths (bbox - 2 x CASING)=' + sdoor.length + ' ' + JSON.stringify(sw));
  check('R3 ' + st.name, 'an emitted door arc radius is not a source door leaf width, or a missing door is unexplained', subset && doors.length + lowGaps === sdoor.length,
    'emitted=' + doors.length + ' door_below_min_width gaps=' + lowGaps + ' source doors=' + sdoor.length + ' widths subset of source=' + subset);
  // R4 windows
  const wins = run.ops.filter(o => o.op_type === 'DXF_OPENING' && o.params.kind === 'window');
  const swin = sql("select r.minX a,r.minY b,r.maxX c,r.maxY d from elements_meta m join elements_rtree r on r.id=m.id where m.ifc_class='IfcWindow' and m.storey='" + st.name + "'");
  const eq10 = (b, q) => Math.abs(b[0] - q.a) <= 0.01 && Math.abs(b[1] - q.b) <= 0.01 && Math.abs(b[2] - q.c) <= 0.01 && Math.abs(b[3] - q.d) <= 0.01;
  const strayWin = wins.filter(w => !swin.some(q => eq10(w.params.bbox, q)));
  const distinct = []; swin.forEach(q => { if (!distinct.some(d => eq10([d.a, d.b, d.c, d.d], q))) distinct.push(q); });
  const covered = distinct.filter(d => wins.some(w => eq10(w.params.bbox, d))).length;
  const ngW = run.report.gaps.filter(g => g.code === 'GAP:no_host' && g.members && /GLAZ/.test(g.layer)).length;
  check('R4 ' + st.name, 'an emitted window box matches no source window (invented window)', strayWin.length === 0,
    'windows emitted=' + wins.length + ' stray=' + strayWin.length + ' | source windows=' + swin.length + ' distinct plan boxes=' + distinct.length + ' reproduced=' + covered + '/' + distinct.length + ' (info: stacked windows share a plan box) no_host glazing gaps=' + ngW);
  const op = run.ops.filter(o => o.op_type === 'DXF_OPENING'); const nh = run.report.gaps.filter(g => g.code === 'GAP:no_host').length;
  console.log('openings emitted=' + op.length + ' no_host gaps=' + nh);
}
// ---- assembly of both storeys into one meshed model (levels FROM_SOURCE_MODEL) ----
const man = { name: 'DX', storeys: STOREYS.map(x => ({ name: x.name, level: x.level, file: x.file })) };
const files = {}; STOREYS.forEach(x => { files[x.file] = DXF(x.file); });
const asm = M.assemble(man, files, MAP, CFG, deps);
const bad = asm.elements.filter(e => !e.watertight || !(e.volume > 0));
const zmax = Math.max(...asm.elements.flatMap(e => e.vertices.map(v => v[2]))), zmin = Math.min(...asm.elements.flatMap(e => e.vertices.map(v => v[2])));
const byS = {}; asm.elements.forEach(e => { byS[e.storey] = (byS[e.storey] || 0) + 1; });
const cut = asm.gaps.reduce((n, g) => { n[g.code] = (n[g.code] || 0) + 1; return n; }, {});
console.log('\n===== ASSEMBLY of both storeys =====');
console.log('elements=' + asm.elements.length + ' by storey ' + JSON.stringify(byS) + ' triangles=' + asm.elements.reduce((n, e) => n + e.faces.length, 0) + ' z ' + zmin + '..' + zmax + ' warnings=' + JSON.stringify(asm.warnings));
console.log('mesh gaps ' + JSON.stringify(cut));
check('MESH-DX', 'an assembled element is open or inside-out', bad.length === 0 && asm.warnings.filter(w => /mismatch/.test(w)).length === 0, 'bad=' + bad.length + '/' + asm.elements.length + ' extent mismatch warnings=' + asm.warnings.filter(w => /mismatch/.test(w)).length);
check('MESH-DX-guid', 'duplicate element ids in the assembled model', new Set(asm.elements.map(e => e.guid)).size === asm.elements.length, 'unique=' + new Set(asm.elements.map(e => e.guid)).size + '/' + asm.elements.length);
fs.mkdirSync(path.join(__dirname, 'out'), { recursive: true });
fs.writeFileSync(path.join(__dirname, 'out/duplex_assembled.obj'), M.toObj(asm.elements));
const asm2 = M.assemble(man, files, MAP, CFG, deps);
check('MESH-DX-det', 'assembled mesh differs between two runs', hashHex(JSON.stringify(asm.elements)) === hashHex(JSON.stringify(asm2.elements)) && asm.run_id === asm2.run_id, 'run_id=' + asm.run_id.slice(0, 12));

console.log('\nSUMMARY fail=' + fails);
