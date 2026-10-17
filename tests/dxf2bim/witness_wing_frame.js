// ⚠ DO NOT REMOVE — W-L116-ROT (lane spec §L1.16). Issue it proves/disproves: "a wing at an angle gets the same standard plan as an axis-aligned one" — the Duplex is
// rotated by ANGLE deg (synthetic, in memory), the wing frame must find that angle and give the SAME per-layer entity counts, texts (grid labels, dimension values)
// and grid lists as the unrotated Duplex. Control: framing at angle 0 on the rotated model must NOT reproduce it (the L1.15 gaps come back). Read the output.
// Usage: node tests/dxf2bim/witness_wing_frame.js <Node model DB> [angle=30] [node_modules dir holding better-sqlite3]
'use strict';
const path = require('path');
const db = process.argv[2], ANG = Number(process.argv[3] || 30), nm = process.argv[4] || path.join(__dirname, '../../node_modules');
const Database = require(path.join(nm, 'better-sqlite3')), S = require('../../deploy/dev/std2d.js');
const con = new Database(db, { readonly: true }), q = sql => con.prepare(sql).all();
let fail = 0; const say = (ok, name, detail) => { if (!ok) fail++; console.log(`${ok ? 'PASS' : 'FAIL'} ${name} | ${detail}`); };
const parse = t => { const L = t.split(/\r?\n/), ents = []; let cur = null, inEnt = false;
  for (let i = 0; i + 1 < L.length; i += 2) { const c = L[i].trim(), v = L[i + 1].trim();
    if (c === '2' && v === 'ENTITIES') inEnt = true; else if (c === '0' && v === 'ENDSEC') inEnt = false;
    if (!inEnt) continue; if (c === '0') { cur = { type: v, layer: '', txt: [] }; ents.push(cur); } else if (cur && c === '8') cur.layer = v; else if (cur && (c === '1')) cur.txt.push(v); }
  return ents; };
const sig = t => { const e = parse(t), n = {}, tx = []; e.forEach(x => { const k = x.layer + '|' + x.type; n[k] = (n[k] || 0) + 1; x.txt.forEach(s => tx.push(s)); }); return { n, tx: tx.sort() }; };
const base = S.writeStdSet(q, 'D'), centre = (() => { const w = S.loadModel(q, { add() {}, gap() {} }).walls; const e = [Math.min(...w.map(a => a.x0)), Math.max(...w.map(a => a.x1)), Math.min(...w.map(a => a.y0)), Math.max(...w.map(a => a.y1))]; return [(e[0] + e[1]) / 2, (e[2] + e[3]) / 2]; })();
const pre = m => S.rotateModel(m, ANG, centre[0], centre[1]);
const W = S.writeWingSet(q, 'D', { name: 'W', premodel: pre });
console.log(W.log.filter(l => l.startsWith('§WING') || l.startsWith('§SUMMARY')).join('\n'));
say(W.wing && Math.abs(W.wing.angle - (ANG % 90)) <= 1, 'detect', `wing angle ${W.wing && W.wing.angle} for synthetic ${ANG}`);
const plans = Object.keys(base.files).filter(f => /_FLOOR_/.test(f));
say(Object.keys(W.files).length === plans.length, 'sheets', `wing plan sheets ${Object.keys(W.files).length} == base plan sheets ${plans.length}`);
plans.forEach(f => { const view = f.replace(/^D_/, '').replace(/_std\.dxf$/, ''), wf = `D_${view}__W_std.dxf`; const a = sig(base.files[f]), b = sig(W.files[wf] || '');
  const keys = new Set(Object.keys(a.n).concat(Object.keys(b.n))), diffs = [...keys].filter(k => a.n[k] !== b.n[k]).map(k => `${k} base=${a.n[k] || 0} wing=${b.n[k] || 0}`);
  const tdiff = JSON.stringify(a.tx) !== JSON.stringify(b.tx);
  say(!diffs.length, `ENT ${view}`, diffs.length ? diffs.slice(0, 6).join('; ') : `per-layer entity counts equal (${Object.values(a.n).reduce((x, y) => x + y, 0)} entities)`);
  say(!tdiff, `TXT ${view}`, tdiff ? `texts differ (base ${a.tx.length}, wing ${b.tx.length})` : `${a.tx.length} texts (grid labels, dimension values) equal`); });
const gl = r => JSON.stringify([r.grid.x.map(g => g[0]), r.grid.y.map(g => g[0])]);
say(gl(base) === gl(W), 'grid', `grid labels equal ${gl(W)}`);
// the FULL standard set (plans, elevations, roof, section) of the wing equals the unrotated Duplex set file for file
const F = S.writeStdSet(q, 'D', { wing: { name: 'W' }, premodel: pre });
say(JSON.stringify(Object.keys(F.files).sort()) === JSON.stringify(Object.keys(base.files).sort()), 'set files', `wing set ${Object.keys(F.files).length} files == base ${Object.keys(base.files).length}`);
Object.keys(base.files).forEach(f => { const a = sig(base.files[f]), b = sig(F.files[f] || '');
  const keys = new Set(Object.keys(a.n).concat(Object.keys(b.n))), diffs = [...keys].filter(k => a.n[k] !== b.n[k]).map(k => `${k} base=${a.n[k] || 0} wing=${b.n[k] || 0}`);
  const tdiff = JSON.stringify(a.tx) !== JSON.stringify(b.tx);
  say(!diffs.length && !tdiff, `SET ${f.replace(/^D_|_std\.dxf$/g, '')}`, diffs.length ? diffs.slice(0, 5).join('; ') : tdiff ? 'texts differ' : `entities + texts equal (${Object.values(a.n).reduce((x, y) => x + y, 0)})`); });
const C = S.writeWingSet(q, 'D', { name: 'C', angle: 0, premodel: pre });
say(!C.wing || C.wing.framed < W.wing.framed || C.gaps.length > W.gaps.length, 'control', `frame at 0 deg on the rotated model: framed ${C.wing ? C.wing.framed : 0} of ${W.wing.framed + (C.wing ? 0 : 0)} walls, gaps ${C.gaps.length} vs ${W.gaps.length}`);
console.log(fail ? `FAIL (${fail})` : 'ALL PASS'); process.exit(fail ? 1 : 0);
