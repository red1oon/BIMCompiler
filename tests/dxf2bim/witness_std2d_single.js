// ⚠ DO NOT REMOVE — W-R2PRIME (bim-ootb prompts/DXF2BIM_MODELLER_LANE.md §L21, rule R2'): a single-storey model whose footings share the walled storey is plannable.
// Issue it proves/disproves: "std2d throws / finds no grid storey when the footings are in the only walled storey" (the shed), and "R2' changes a model that has a lower foundation storey" (Duplex).
// Usage: node tests/dxf2bim/witness_std2d_single.js <single-storey Node DB> <multi-storey Node DB with a foundation storey> [node_modules dir]. Read the lines; exit code is not evidence.
'use strict';
const path = require('path'), nm = process.argv[4] || path.join(__dirname, '../../node_modules');
const Database = require(path.join(nm, 'better-sqlite3')), S = require('../../deploy/dev/std2d.js');
let fail = 0; const ok = (n, c, d) => { console.log((c ? 'PASS ' : 'FAIL ') + n + ' | ' + d); if (!c) fail++; };
const run = f => { const c = new Database(f, { readonly: true }); try { return S.writeStdSet(s => c.prepare(s).all(), 'W'); } catch (e) { return { err: e.message }; } };
const a = run(process.argv[2]), b = run(process.argv[3]);
ok('R2P-1 single storey with footings is planned (no throw), a plan sheet is written', !a.err && Object.keys(a.files).some(f => /FLOOR_/.test(f)), a.err || Object.keys(a.files).join(' '));
ok('R2P-2 the rule is logged (§STOREY_SINGLE) and the grid storey is the walled storey', !a.err && a.log.some(l => l.indexOf('§STOREY_SINGLE') === 0) && a.log.some(l => /^§STOREY foundation=None grid_storey='[^']+'/.test(l)), a.err || a.log.filter(l => /STOREY/.test(l)).join(' / '));
ok('R2P-3 a model with a lower foundation storey is untouched (no §STOREY_SINGLE, foundation kept)', !b.err && !b.log.some(l => l.indexOf('§STOREY_SINGLE') === 0) && b.log.some(l => /^§STOREY foundation='[^']+'/.test(l)), b.err || b.log.filter(l => /STOREY/.test(l)).join(' / '));
console.log('SUMMARY fail=' + fail); process.exit(fail ? 1 : 0);
