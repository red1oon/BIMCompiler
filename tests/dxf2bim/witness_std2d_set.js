// ⚠ DO NOT REMOVE — W-S2..S4 (lane spec §L5.6): the JS std set equals the Python oracle's. Issue it proves/disproves: "the port writes a different set than
// std2d.py" (grid, hosts, openings, dims, entities per layer). Control: a doctored JS log line must make the comparison FAIL. Read the diff output.
// Env STD2D_PY = oracle std2d.py (default: this tree's; use the §L1.7 version until BIMCompiler #200 is merged).
// Usage: node tests/dxf2bim/witness_std2d_set.js <Node model DB> <PREFIX> [node_modules dir holding better-sqlite3] [door-ops DB: unused, door_operation is in the model DB]
'use strict';
const path = require('path'), cp = require('child_process'), fs = require('fs'), os = require('os');
const db = process.argv[2], prefix = process.argv[3], nm = process.argv[4] || path.join(__dirname, '../../node_modules');
const Database = require(path.join(nm, 'better-sqlite3')), S = require('../../deploy/dev/std2d.js');
const con = new Database(db, { readonly: true });
const q = sql => con.prepare(sql).all();
const t0 = Date.now(), R = S.writeStdSet(q, prefix);
console.log(`JS wrote ${Object.keys(R.files).length} files in ${Date.now() - t0} ms`);
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 's2py_'));
cp.execFileSync('python3', [process.env.STD2D_PY || path.join(__dirname, '../../2D_Layout/python/std2d.py'), db, '--out', tmp], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
const pyLog = fs.readFileSync(fs.readdirSync(tmp).filter(f => f.startsWith('log_')).map(f => path.join(tmp, f))[0], 'utf8').split('\n').filter(Boolean);
const norm = l => l.replace(/-0\.0+(?![0-9])/g, m => m.slice(1)).replace(/^§ENTRY.*$/, '§ENTRY').replace(/^§DB .*$/, '§DB').replace(/^§DOOR_OPS.*rows=/, '§DOOR_OPS rows=').replace(/^§WRITE .*$/, '§WRITE').replace(/\[-?0\.0+\]/g, '[0]');
// the log lines the oracle writes that the port must reproduce exactly (order inside a family can differ by float ties, so compare as sorted multisets per § tag)
const numEq = (x, y) => {   // equal after tokenising; numbers may differ by one unit of their last printed digit (float ties: mean/ulp order)
  const tx = x.split(/(-?\d+\.\d+)/), ty = y.split(/(-?\d+\.\d+)/);
  if (tx.length !== ty.length) return false;
  return tx.every((t, i) => { if (i % 2 === 0) return t === ty[i]; const d = (t.split('.')[1] || '').length; return Math.abs(Number(t) - Number(ty[i])) <= 1.01 * Math.pow(10, -d); });
};
function cmpLogs(a, b) {
  const fam = ls => { const m = {}; ls.map(norm).forEach(l => { const k = l.split(/[ =]/)[0]; (m[k] = m[k] || []).push(l); }); Object.values(m).forEach(v => v.sort()); return m; };
  const A = fam(a), B = fam(b), bad = [];
  new Set(Object.keys(A).concat(Object.keys(B))).forEach(k => {
    const x = A[k] || [], y = B[k] || [];
    if (x.length !== y.length) bad.push(`${k}: py=${x.length} js=${y.length}`);
    for (let i = 0; i < Math.min(x.length, y.length); i++) if (!numEq(x[i], y[i])) { bad.push(`${k}:\n   py ${x[i]}\n   js ${y[i]}`); break; }
  });
  return bad;
}
let bad = cmpLogs(pyLog, R.log);
console.log(`${bad.length ? 'FAIL' : 'PASS'} W-LOG | JS log == Python log per § family (grid, hosts, openings, doors, dims, levels, gaps) | py=${pyLog.length} lines js=${R.log.length} lines${bad.length ? '\n' + bad.slice(0, 12).join('\n') : ''}`);
// entity counts per file per layer, via ezdxf on both sets (JS files written to disk first)
const jsDir = fs.mkdtempSync(path.join(os.tmpdir(), 's2js_')); Object.entries(R.files).forEach(([n, t]) => fs.writeFileSync(path.join(jsDir, n), t));
const counter = `
import sys, json, glob, os, ezdxf
from collections import Counter
out = {}
for p in sorted(glob.glob(os.path.join(sys.argv[1], '*.dxf'))):
    d = ezdxf.readfile(p); c = Counter()
    dims = []
    grid = []
    for e in d.modelspace():
        c[e.dxftype() + ':' + e.dxf.layer] += 1
        if e.dxf.layer == 'A-GRID':
            if e.dxftype() == 'LINE': grid.append(['L'] + [round(v, 2) for v in (e.dxf.start.x, e.dxf.start.y, e.dxf.end.x, e.dxf.end.y)])
            elif e.dxftype() == 'CIRCLE': grid.append(['C'] + [round(v, 2) for v in (e.dxf.center.x, e.dxf.center.y)])
        if e.dxftype() == 'DIMENSION':
            dims.append([round(v, 2) for v in (e.dxf.defpoint.x, e.dxf.defpoint.y, e.dxf.defpoint2.x, e.dxf.defpoint2.y, e.dxf.defpoint3.x, e.dxf.defpoint3.y, e.dxf.angle)])
    out[os.path.basename(p)] = dict(counts=c, dims=sorted(dims), grid=sorted(grid))
json.dump(out, sys.stdout)`;
const rd = dir => JSON.parse(cp.execFileSync('python3', ['-c', counter, dir], { encoding: 'utf8', maxBuffer: 1 << 28 }));
const P = rd(tmp), J = rd(jsDir); let nb = 0; const lines = [];
new Set(Object.keys(P).concat(Object.keys(J))).forEach(f => {
  if (!P[f] || !J[f]) { nb++; lines.push(`  ${f}: only in ${P[f] ? 'python' : 'js'}`); return; }
  const keys = new Set(Object.keys(P[f].counts).concat(Object.keys(J[f].counts)));
  keys.forEach(k => { if ((P[f].counts[k] || 0) !== (J[f].counts[k] || 0)) { nb++; lines.push(`  ${f} ${k}: py=${P[f].counts[k] || 0} js=${J[f].counts[k] || 0}`); } });
  if (JSON.stringify(P[f].dims) !== JSON.stringify(J[f].dims)) { nb++; lines.push(`  ${f} DIMENSION points differ`); }
  if (JSON.stringify(P[f].grid) !== JSON.stringify(J[f].grid)) { nb++; lines.push(`  ${f} A-GRID line/bubble coordinates differ (§L1.10 stagger)`); }
});
console.log(`${nb ? 'FAIL' : 'PASS'} W-ENT | entity count per layer and DIMENSION points per file equal (ezdxf reads both) | files py=${Object.keys(P).length} js=${Object.keys(J).length}${nb ? '\n' + lines.slice(0, 20).join('\n') : ''}`);
const ctl = cmpLogs(pyLog, R.log.map((l, i) => (i === R.log.findIndex(x => x.startsWith('§GRID ')) ? l.replace('pos=', 'pos=9') : l)));
console.log(`${ctl.length ? 'PASS' : 'FAIL'} W-CONTROL | a doctored grid line is seen | ${ctl.length ? 'FAILED as required' : 'BLIND'}`);
fs.writeFileSync(path.join(jsDir, 'log_js.txt'), R.log.join('\n') + '\n');
console.log(`py=${tmp} js=${jsDir}`);
process.exit(bad.length || nb || !ctl.length ? 1 : 0);
