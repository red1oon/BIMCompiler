// ⚠ DO NOT REMOVE — W-EXTRACT-MOVE (lane spec §L5.6 S5): moving the extractor body into scripts/ifc_extract_core.js changed no output.
// Issue it proves/disproves: "the Node extractor's DB differs after the move into the shared core". Runs the pre-move script (git ref, default
// origin/master) and the current CLI on the given IFCs and compares every table row for row (import_date excluded). Control: one row of the new DB doctored must FAIL.
// Env ALLOW_NEW=comma list of tables the move is allowed to ADD (additive only; every pre-existing table must still be identical).
// Usage: node tests/dxf2bim/witness_extract_core.js <ifc>... (env NODE_PATH must reach web-ifc + better-sqlite3; env BASE_REF)
'use strict';
const cp = require('child_process'), fs = require('fs'), os = require('os'), path = require('path');
const Database = require('better-sqlite3');
const ROOT = path.join(__dirname, '../..'), ref = process.env.BASE_REF || 'origin/master';
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'wxc_'));
const base = path.join(ROOT, 'scripts', '_extract_before.js');
fs.writeFileSync(base, cp.execFileSync('git', ['-C', ROOT, 'show', ref + ':scripts/extractIFC2DB.js'], { encoding: 'utf8' }));
let fails = 0;
const dump = db => { const con = new Database(db, { readonly: true }), o = {};
  con.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all().forEach(({ name }) => {
    const rows = con.prepare(`SELECT * FROM "${name}"`).all().map(r => { if (name === 'project_metadata' && (r.key === 'import_date' || r.key === 'source_file')) return null; return JSON.stringify(r, (k, v) => (v && v.type === 'Buffer' ? Buffer.from(v.data).toString('hex') : v)); }).filter(Boolean).sort();
    o[name] = rows; });
  con.close(); return o; };
function cmp(A, B) { const bad = []; new Set(Object.keys(A).concat(Object.keys(B))).forEach(t => { const a = A[t], b = B[t]; if (!a && b && (process.env.ALLOW_NEW || '').split(',').includes(t)) return; else if (!a || !b) bad.push(t + ': table only in ' + (a ? 'before' : 'after')); else if (a.length !== b.length || a.some((r, i) => r !== b[i])) bad.push(`${t}: before=${a.length} after=${b.length} rows, content differs`); }); return bad; }
for (const ifc of process.argv.slice(2)) {
  const nm = path.basename(ifc, '.ifc'), a = path.join(tmp, nm + '_before.db'), b = path.join(tmp, nm + '_after.db');
  cp.execFileSync('node', [base, '--ifc', ifc, '-o', a], { stdio: 'ignore', maxBuffer: 1 << 28 });
  cp.execFileSync('node', [path.join(ROOT, 'scripts/extractIFC2DB.js'), '--ifc', ifc, '-o', b], { stdio: 'ignore', maxBuffer: 1 << 28 });
  const A = dump(a), B = dump(b), bad = cmp(A, B), n = Object.values(A).reduce((s, r) => s + r.length, 0);
  console.log(`${bad.length ? 'FAIL' : 'PASS'} W-EXTRACT-MOVE[${nm}] | extractor DB differs after the move into the shared core | tables=${Object.keys(A).length} rows=${n}${bad.length ? ' ' + bad.join('; ') : ''}`);
  if (bad.length) fails++;
  if (ifc === process.argv[2]) { const C = JSON.parse(JSON.stringify(B)); const t = Object.keys(C).find(k => C[k].length); C[t][0] += ' '; const cb = cmp(A, C);
    console.log(`${cb.length ? 'PASS' : 'FAIL'} W-EXTRACT-MOVE-control | a doctored row is seen | ${cb.length ? 'FAILED as required' : 'BLIND'}`); if (!cb.length) fails++; }
}
fs.unlinkSync(base); process.exit(fails ? 1 : 0);
