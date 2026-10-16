// ⚠ DO NOT REMOVE — SANDBOX: mesh + assembly of the real messy DXF. Config values are SANDBOX placeholders (N10); asserts mesh
// integrity only (every element watertight, positive volume, determinism, accounting) — NOT architectural correctness.
// Usage: node tests/dxf2bim/t8_mesh.js <file.dxf>   Writes tests/dxf2bim/out/*.obj. Read the log after every run.
'use strict';
const fs = require('fs'), crypto = require('crypto'), path = require('path');
const DxfParser = require(path.join(__dirname, '../../deploy/dev/dxf-parser.js'));
const B = require(path.join(__dirname, '../../deploy/dev/dxf2bim.js'));
const M = require(path.join(__dirname, '../../deploy/dev/dxf2mesh.js'));
const hashHex = s => crypto.createHash('sha256').update(s).digest('hex');
const txt = fs.readFileSync(process.argv[2], 'utf8');
const MAP = { version: 1, rules: [{ match: 'suffix', pattern: 'A-WALL', type: 'wall' }, { match: 'suffix', pattern: 'A-OPENING', type: 'opening' },
  { match: 'suffix', pattern: 'S-SLAB', type: 'slab' }, { match: 'exact', pattern: 'A-DIMS-1', type: 'ignore' }, { match: 'exact', pattern: 'A-NOTE', type: 'ignore' },
  { match: 'exact', pattern: 'A-TEXT', type: 'ignore' }, { match: 'exact', pattern: 'ANNTEXT', type: 'ignore' }, { match: 'exact', pattern: 'Defpoints', type: 'ignore' }, { match: 'exact', pattern: '0', type: 'ignore' }] };
const CFG = { version: 1, units: 'in', snap_tol: 0.0127, host_tol: 0.15, align_tol: 0.05,             // SANDBOX values
  wall: { thickness: 0.2, height: 3.0, base: 0 }, slab: { thickness: 0.2, level: 0 }, opening: { door: { height: 2.1 }, rect: { sill: 0.9, height: 1.2 } } };
const deps = { DxfParser, hashHex, library: [] };
console.log('SANDBOX config (not from drawing): ' + JSON.stringify(CFG));

const run = B.run(txt, MAP, CFG, deps);
const t0 = Date.now(); const m = M.meshFromOps(run.ops, { level: 0, hashHex, snapTol: CFG.snap_tol }); const ms = Date.now() - t0;
const els = m.elements, vol = els.reduce((s, e) => s + e.volume, 0), tri = els.reduce((n, e) => n + e.faces.length, 0);
const bad = els.filter(e => !e.watertight || !(e.volume > 0));
const gc = {}; m.gaps.forEach(x => { gc[x.code] = (gc[x.code] || 0) + 1; });
console.log('walls ops=' + run.ops.filter(o => o.op_type === 'DXF_WALL').length + ' openings ops=' + run.ops.filter(o => o.op_type === 'DXF_OPENING').length +
  ' -> mesh elements=' + els.length + ' triangles=' + tri + ' total volume=' + vol.toFixed(3) + ' m3 ms=' + ms);
console.log('mesh gaps ' + JSON.stringify(gc));
const nc = {}; m.notes.forEach(x => { nc[x.code] = (nc[x.code] || 0) + 1; }); console.log('mesh notes ' + JSON.stringify(nc));
console.log((bad.length === 0 ? 'PASS' : 'FAIL') + ' T8-MESH integrity | open or inside-out element | non-watertight or non-positive volume elements=' + bad.length + '/' + els.length);
const m2 = M.meshFromOps(B.run(txt, MAP, CFG, deps).ops, { level: 0, hashHex, snapTol: CFG.snap_tol });
console.log((hashHex(JSON.stringify(els)) === hashHex(JSON.stringify(m2.elements)) ? 'PASS' : 'FAIL') + ' T8-MESH determinism | two runs identical');
const walls = run.ops.filter(o => o.op_type === 'DXF_WALL');
const expectedWallVol = walls.reduce((s, o) => s + o.params.length * o.params.thickness * o.params.height, 0);
const cutVol = els.length ? expectedWallVol - vol : 0;
console.log('uncut wall volume=' + expectedWallVol.toFixed(3) + ' mesh volume=' + vol.toFixed(3) + ' removed by openings=' + cutVol.toFixed(3) + ' m3 (info)');
fs.writeFileSync(path.join(__dirname, 'out/jscad_gf.obj'), M.toObj(els));

// assembly of two storeys from the SAME drawing (SANDBOX: a repeated floor, level 3.0). Not a claim about the real building.
const asm = M.assemble({ name: 'sandbox', storeys: [{ name: 'GF', level: 0, file: 'p' }, { name: 'L1', level: 3.0, file: 'p' }] }, { p: txt }, MAP, CFG, deps);
const zs = asm.elements.filter(e => e.storey === 'L1').flatMap(e => e.vertices.map(v => v[2]));
console.log('ASSEMBLY elements=' + asm.elements.length + ' storeys=' + asm.storeys.map(s => s.name + '@' + s.level).join(',') + ' L1 z-range=' + Math.min(...zs) + '..' + Math.max(...zs) +
  ' unique guids=' + new Set(asm.elements.map(e => e.guid)).size + ' warnings=' + JSON.stringify(asm.warnings));
console.log((asm.elements.length === 2 * els.length && new Set(asm.elements.map(e => e.guid)).size === asm.elements.length ? 'PASS' : 'FAIL') + ' T8-ASM | storeys lost or ids collide');
fs.writeFileSync(path.join(__dirname, 'out/jscad_sandbox_2storey.obj'), M.toObj(asm.elements));
const ex = run.report.extent_m;
console.log('plan extent (m) x ' + ex.min[0] + '..' + ex.max[0] + ' y ' + ex.min[1] + '..' + ex.max[1]);
