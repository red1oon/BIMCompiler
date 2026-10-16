// dump G (F x 10000) at every shell cell (same selection as §SKY_SHELL_RAYS / fgeo.js) — to diff two arms offline
const LZ = window.LightZones, Z = LZ.get(); if (!Z || !Z.field) return { err: 'no field' };
const nx = Z.nx, ny = Z.ny, nz = Z.nz, nxy = nx * ny, N = nx * ny * nz, zone = Z.zone, SOLID = 65535, MASK = 0x3FFF, G = Z.field.G, jg = Z.groundJ || 0, cells = [], g = [];
for (let c = 0; c < N; c++) { const v = zone[c]; if (v === SOLID || (v & MASK) === 0) continue; const i = c % nx, j = ((c / nx) | 0) % ny, k = (c / nxy) | 0; if (j < jg || j + 1 >= ny) continue;
  if (!((i > 0 && zone[c - 1] === SOLID) || (i < nx - 1 && zone[c + 1] === SOLID) || (k > 0 && zone[c - nxy] === SOLID) || (k < nz - 1 && zone[c + nxy] === SOLID))) continue;
  let near = false; for (let dy = 0; dy <= 2 && !near; dy++) for (let dx = -2; dx <= 2 && !near; dx++) for (let dz = -2; dz <= 2 && !near; dz++) { const ii = i + dx, jj = j + dy, kk = k + dz; if (ii < 0 || kk < 0 || ii >= nx || kk >= nz || jj >= ny) continue; const t = zone[ii + jj * nx + kk * nxy]; if (t !== SOLID && (t & MASK) === 0) near = true; }
  if (near) { cells.push(c); g.push(G[c]); } }
return { bld: Z.bld, shell: Z.field.shell, n: cells.length, cells, g };
