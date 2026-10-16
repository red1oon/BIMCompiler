// ⚠ DO NOT REMOVE — T8 SANDBOX (SPEC §7.4, N10). Runs dxf2bim on a real, messy DXF. Asserts accounting only (T7 style),
// NOT geometry. Config dimensions are SANDBOX placeholders, not read from the drawing. Read the log after every run.
// Usage: node tests/dxf2bim/t8_sandbox.js <file.dxf>
'use strict';
const fs = require('fs'), crypto = require('crypto'), path = require('path');
const DxfParser = require(path.join(__dirname, '../../deploy/dev/dxf-parser.js'));
const D = require(path.join(__dirname, '../../deploy/dev/dxf2bim.js'));
const hashHex = s => crypto.createHash('sha256').update(s).digest('hex');
const txt = fs.readFileSync(process.argv[2], 'utf8');
const MAP = { version: 1, rules: [          // SANDBOX seed: human choice from layer names seen in the file
  { match: 'suffix', pattern: 'A-WALL', type: 'wall' }, { match: 'suffix', pattern: 'A-OPENING', type: 'opening' },
  { match: 'suffix', pattern: 'S-SLAB', type: 'slab' },
  { match: 'exact', pattern: 'A-DIMS-1', type: 'ignore' }, { match: 'exact', pattern: 'A-NOTE', type: 'ignore' },
  { match: 'exact', pattern: 'A-TEXT', type: 'ignore' }, { match: 'exact', pattern: 'ANNTEXT', type: 'ignore' },
  { match: 'exact', pattern: 'Defpoints', type: 'ignore' }, { match: 'exact', pattern: '0', type: 'ignore' } ] };
const CFG = { version: 1, units: 'in', snap_tol: 0.0127, host_tol: 0.15, wall: { thickness: 0.2, height: 3.0, base: 0.0 }, slab: { thickness: 0.2, level: 0.0 },
  opening: { door: { height: 2.1 }, rect: { sill: 0.9, height: 1.2 } } }; // SANDBOX values (snap_tol = 0.5 in)
const t0 = Date.now();
const r1 = D.run(txt, MAP, CFG, { DxfParser, hashHex, library: [] });
const ms = Date.now() - t0;
const r2 = D.run(txt, MAP, CFG, { DxfParser, hashHex, library: [] });
const c = r1.report.counts;
console.log('SANDBOX config (not from drawing): ' + JSON.stringify(CFG));
console.log('units=' + r1.ops[0].params.units + ' factor_to_m=' + r1.ops[0].params.factor_to_m + ' run_id=' + r1.run_id.slice(0, 12) + ' ms=' + ms);
console.log('units_source=' + r1.report.units_source + ' warnings=' + JSON.stringify(r1.report.warnings) + ' extent_m=' + JSON.stringify(r1.report.extent_m));
console.log('counts ' + JSON.stringify(c));
const byType = {}; r1.ops.forEach(o => { byType[o.op_type] = (byType[o.op_type] || 0) + 1; });
console.log('ops by type ' + JSON.stringify(byType));
const gc = {}; r1.report.gaps.forEach(g => { const k = g.code + ' | ' + g.layer + ' | ' + g.entity; gc[k] = (gc[k] || 0) + 1; });
Object.entries(gc).sort((a, b) => b[1] - a[1]).forEach(([k, v]) => console.log('  ' + v + ' x ' + k));
const handles = new Set(r1.ops.filter(o => /^DXF_(WALL|SLAB|COMPONENT|OPENING)$/.test(o.op_type)).flatMap(o => [o.params.handle].concat((o.params.members || []).map(m => m.handle), (o.params.parts || []).map(m => m.handle)))
  .concat(r1.report.ignored.map(x => x.handle), r1.report.gaps.map(x => x.handle)));
// a polyline entity can yield several elements/gaps sharing one handle, so compare distinct handles to entities
console.log((handles.size === c.entities ? 'PASS' : 'FAIL') + ' T8 accounting | entity vanishes with no trace | entities=' + c.entities + ' distinct handles accounted=' + handles.size);
console.log((JSON.stringify(r1.ops) === JSON.stringify(r2.ops) ? 'PASS' : 'FAIL') + ' T8 determinism on real file | two runs identical');
const w = r1.ops.filter(o => o.op_type === 'DXF_WALL');
if (w.length) { const xs = w.flatMap(o => [o.params.start[0], o.params.end[0]]), ys = w.flatMap(o => [o.params.start[1], o.params.end[1]]);
  console.log('wall bbox (m): x ' + Math.min(...xs) + '..' + Math.max(...xs) + ' y ' + Math.min(...ys) + '..' + Math.max(...ys) + ' (info only, not asserted)'); }
