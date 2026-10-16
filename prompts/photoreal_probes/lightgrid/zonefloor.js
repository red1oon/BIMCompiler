// zonefloor.js <bin> <yMinGeom> — W-ZONE_FLOOR: count INDOOR (zone>0, non-solid) cells whose centre lies below the lowest boundary
// geometry (true box min y, from §ZONE_BOX_TRUE). A real indoor space cannot sit under every piece of the building. PASS = 0.
const { load, cls, MASK } = require(__dirname + '/zonelib.js');
const X = load(process.argv[2]).R, yMin = +process.argv[3], cs = X.cell; let bad = 0, ind = 0; const z = {};
for (let k = 0; k < X.nz; k++) for (let j = 0; j < X.ny; j++) for (let i = 0; i < X.nx; i++) { const c = i + j * X.nx + k * X.nx * X.ny; if (cls(X.zone[c]) !== 'I') continue; ind++;
  if (X.org[1] + (j + .5) * cs < yMin) { bad++; const id = X.zone[c] & MASK; z[id] = (z[id] || 0) + 1; } }
console.log('§ZONE_FLOOR bld=' + X.bld + ' grid=' + X.nx + 'x' + X.ny + 'x' + X.nz + ' indoorCells=' + ind + ' belowLowestGeometry=' + bad + ' (' + (bad * cs ** 3).toFixed(0) + ' m3) yMin=' + yMin +
  ' zones=' + JSON.stringify(Object.entries(z).sort((a, b) => b[1] - a[1]).slice(0, 3)) + ' => ' + (ind === 0 ? 'INCONCLUSIVE no indoor cells' : bad === 0 ? 'PASS' : 'FAIL'));
