// ⚠ DO NOT REMOVE — W-S1 (lane spec §L5.6): the JS plan contours equal the Python oracle's. Issue it proves/disproves: "the port draws a different
// wall plan than std2d.py". Control: the first wall's mesh shifted 5 mm in x must FAIL. Read the log (every storey, class counts, max deviation).
// Usage: node tests/dxf2bim/witness_std2d_s1.js <Node model DB> [node_modules dir holding better-sqlite3]
'use strict';
const path = require('path'), cp = require('child_process'), fs = require('fs'), os = require('os');
const db = process.argv[2], nm = process.argv[3] || path.join(__dirname, '../../node_modules');
const Database = require(path.join(nm, 'better-sqlite3'));
const G = require('../../deploy/dev/std2d_geom.js');
const tmp = path.join(os.tmpdir(), 's1_oracle_' + process.pid + '.json');
console.log(cp.execFileSync('python3', [path.join(__dirname, 'std2d_s1_oracle.py'), db, tmp], { encoding: 'utf8' }).trim());
const O = JSON.parse(fs.readFileSync(tmp, 'utf8')).cut_z; fs.unlinkSync(tmp);
const PLAN = ['IfcWall', 'IfcWallStandardCase', 'IfcDoor', 'IfcWindow', 'IfcColumn', 'IfcStair', 'IfcStairFlight'];
const con = new Database(db, { readonly: true });
const q = con.prepare(`SELECT m.guid, m.ifc_class, g.vertices, g.faces, COALESCE(t.center_x,0) cx, COALESCE(t.center_y,0) cy, COALESCE(t.center_z,0) cz
  FROM elements_meta m JOIN element_world_bbox r ON r.guid=m.guid JOIN element_instances i ON i.guid=m.guid
  JOIN component_geometries g ON g.geometry_hash=i.geometry_hash LEFT JOIN element_transforms t ON t.guid=m.guid
  WHERE r.minZ < ? AND r.maxZ > ?`);
const f32 = b => new Float32Array(b.buffer.slice(b.byteOffset, b.byteOffset + b.length)), i32 = b => new Int32Array(b.buffer.slice(b.byteOffset, b.byteOffset + b.length));
function run(perturb) {
  let fails = 0, maxDev = 0, nEl = 0;
  for (const [czs, exp] of Object.entries(O)) {
    const cz = Number(czs), got = {};
    for (const r of q.all(cz, cz)) {
      if (PLAN.indexOf(r.ifc_class) < 0 || !r.vertices || !r.faces) continue;
      let V = f32(r.vertices), F = i32(r.faces), C = [r.cx, r.cy, r.cz];
      if (perturb && !perturb.done && (r.ifc_class === 'IfcWall' || r.ifc_class === 'IfcWallStandardCase') && G.elementContours(V, F, C, cz).length) {   // first wall that is really cut
        for (let k = 0; k < V.length; k += 3) V[k] += 0.005; perturb.done = true;
      }
      got[r.guid] = G.elementContours(V, F, C, cz);
    }
    const eg = Object.keys(exp).sort(), gg = Object.keys(got).sort();
    if (eg.join() !== gg.join()) { console.log(`  FAIL cut_z=${czs} element sets differ py=${eg.length} js=${gg.length}`); fails++; continue; }
    let dev = 0, bad = 0;
    for (const g of eg) {
      const a = exp[g].contours, b = got[g]; nEl++;
      if (a.length !== b.length) { bad++; console.log(`  FAIL ${g} contours py=${a.length} js=${b.length}`); continue; }
      a.forEach((c, k) => { if (c.outer !== b[k].isOuter || c.pts.length !== b[k].points.length) { bad++; console.log(`  FAIL ${g}[${k}] shape`); return; }
        c.pts.forEach((p, j) => { dev = Math.max(dev, Math.abs(p[0] - b[k].points[j][0]), Math.abs(p[1] - b[k].points[j][1])); }); });
    }
    maxDev = Math.max(maxDev, dev);
    console.log(`  cut_z=${czs} elements=${eg.length} bad=${bad} maxDev=${dev.toExponential(2)} m`);
    if (bad || dev > 1e-9) fails++;
  }
  return { fails, maxDev, nEl };
}
const r = run(null); console.log(`${r.fails ? 'FAIL' : 'PASS'} W-S1 | port draws a different plan than std2d.py | storeys=${Object.keys(O).length} elements=${r.nEl} maxDev=${r.maxDev.toExponential(2)} m`);
const c = run({}); console.log(`${c.fails ? 'PASS' : 'FAIL'} W-S1-control | witness cannot see a 5 mm vertex move | ${c.fails ? 'FAILED as required' : 'BLIND'}`);
process.exit(r.fails || !c.fails ? 1 : 0);
