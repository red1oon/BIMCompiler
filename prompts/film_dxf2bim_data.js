// ⚠ DO NOT REMOVE — Scope: FILM_PLAN §9 (DXF2BIM film). Packs film_data.json for film_dxf2bim.html from files produced elsewhere:
// sheets (film_dxf2bim_sheets.js) + captured runs/assemblies (film_dxf2bim_capture.js). It copies, it computes nothing new, except a wall
// rectangle from start/end/thickness when the op has no rect (the same formula as dxf2elev.js wallRect). Read the log: §DATA lines.
// usage: node film_dxf2bim_data.js <out.json> <sheets.json> run:<key>=<run.json> ... asm:<key>=<assemble.json|obj> ...
'use strict';
const fs = require('fs');
const [out, sheetsFile, ...rest] = process.argv.slice(2);
const D = { sheets: JSON.parse(fs.readFileSync(sheetsFile, 'utf8')), runs: {}, assemblies: {} };
const wallRect = P => P.rect || [Math.min(P.start[0], P.end[0]) - P.thickness / 2, Math.min(P.start[1], P.end[1]) - P.thickness / 2, Math.max(P.start[0], P.end[0]) + P.thickness / 2, Math.max(P.start[1], P.end[1]) + P.thickness / 2];
function readObj(file) {                       // OBJ from dxf2mesh.toObj: "o <Class>_<guid>" groups, v / f lines (1-based)
  const els = []; let cur = null, base = 0, V = [];
  for (const l of fs.readFileSync(file, 'utf8').split('\n')) {
    if (l.startsWith('o ')) { const nm = l.slice(2).trim(), m = nm.match(/^(Ifc[A-Za-z]+)_?(.*)$/); cur = { guid: m ? m[2] : nm, class: m ? m[1] : nm, vertices: [], faces: [], _b: V.length }; els.push(cur); }
    else if (l.startsWith('v ')) V.push(l.slice(2).trim().split(/\s+/).map(Number));
    else if (l.startsWith('f ') && cur) cur.faces.push(l.slice(2).trim().split(/\s+/).map(s => parseInt(s, 10) - 1));
  }
  for (const e of els) { const used = [...new Set(e.faces.flat())].sort((a, b) => a - b), map = new Map(used.map((g, i) => [g, i])); e.vertices = used.map(g => V[g]); e.faces = e.faces.map(f => f.map(g => map.get(g))); delete e._b; }
  return { run_id: 'obj:' + file.split('/').pop(), elements: els };
}
for (const a of rest) {
  const m = a.match(/^(run|asm):([^=]+)=(.+)$/); if (!m) throw new Error('bad arg ' + a);
  if (m[1] === 'run') {
    const r = JSON.parse(fs.readFileSync(m[3], 'utf8')), run = r.ops.find(o => o.op_type === 'DXF_RUN');
    r.ops.forEach(o => { if (o.op_type === 'DXF_WALL') o.params.rect = wallRect(o.params); });
    D.runs[m[2]] = { run_id: r.run_id, factor: run.params.factor_to_m, ops: r.ops.filter(o => o.op_type !== 'DXF_GAP'), gaps: r.report.gaps.length };
    console.log(`§DATA run ${m[2]} run_id=${r.run_id} factor=${run.params.factor_to_m} walls=${r.ops.filter(o => o.op_type === 'DXF_WALL').length} gaps=${r.report.gaps.length}`);
  } else {
    const A = m[3].endsWith('.obj') ? readObj(m[3]) : JSON.parse(fs.readFileSync(m[3], 'utf8'));
    D.assemblies[m[2]] = { run_id: A.run_id, elements: A.elements.map(e => ({ guid: e.guid, class: e.class, storey: e.storey, vertices: e.vertices, faces: e.faces })) };
    const c = {}; A.elements.forEach(e => { c[e.class] = (c[e.class] || 0) + 1; });
    console.log(`§DATA asm ${m[2]} run_id=${A.run_id} elements=${A.elements.length} ${JSON.stringify(c)}`);
  }
}
fs.writeFileSync(out, JSON.stringify(D));
console.log('§DATA wrote ' + out + ' bytes=' + fs.statSync(out).size);
