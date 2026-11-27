// B1 reach spec probe: wall-adjacent covered cells bucketed by r = lateral Chebyshev distance to the nearest OPEN cell (dy 0..2,
// the shell test's vertical window), r = 1..8 or 'far'. Per bucket: population, a seeded sample (<= K) with F (renderer G) vs the
// 64-ray truth (fgeo.js estimator/BVH; run fgeo.js first on this page), share with truth > 0.2, share under-reading by > 0.1.
const LZ = window.LightZones, Z = LZ.get(), nx = Z.nx, ny = Z.ny, nz = Z.nz, nxy = nx * ny, N = nx * ny * nz, zone = Z.zone, SOLID = 65535, MASK = 0x3FFF, G = Z.field.G, jg = Z.groundJ || 0, cl = Z.cell, org = Z.org;
const B = window.__b1bvh; if (!B) return { err: 'run fgeo.js first' }; const OPT = Object.assign({ K: 150, RMAX: 8, DY: 2, seed: 5 }, window.__rdopt || {});
const ray = new THREE.Ray(); let seed = OPT.seed; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
function visRay(ox, oy, oz, dx, dy, dz) { let v = 1, t0 = 0, panes = 0; ray.origin.set(ox, oy, oz); ray.direction.set(dx, dy, dz);
  for (let s = 0; s < 6; s++) { const h = B.geo.boundsTree.raycastFirst(ray, THREE.DoubleSide, t0, 250); if (!h) return v; const tq = B.T[h.faceIndex]; if (!tq) return 0; if (panes === 0 || h.distance - t0 > 0.3) { v *= tq / 255; panes++; } t0 = h.distance + 0.01; } return v; }
function muOf(u) { let m = Math.sqrt(u); for (let it = 0; it < 12; it++) { const f = (m * m / 2 + 2 * m * m * m / 3) * 6 / 7 - u, df = (m + 2 * m * m) * 6 / 7; m -= f / (df || 1e-6); if (m < 0) m = 0; if (m > 1) m = 1; } return m; }
const lat = window.__latF || null; const buckets = {}; for (let r = 1; r <= OPT.RMAX; r++) buckets[r] = []; buckets.far = [];
for (let c = 0; c < N; c++) { const v = zone[c]; if (v === SOLID || (v & MASK) === 0) continue; const i = c % nx, j = ((c / nx) | 0) % ny, k = (c / nxy) | 0; if (j < jg || j + 1 >= ny) continue;
  if (!((i > 0 && zone[c - 1] === SOLID) || (i < nx - 1 && zone[c + 1] === SOLID) || (k > 0 && zone[c - nxy] === SOLID) || (k < nz - 1 && zone[c + nxy] === SOLID))) continue;
  let rr = 0; for (let r = 1; r <= OPT.RMAX && !rr; r++) for (let dy = 0; dy <= OPT.DY && !rr; dy++) for (let dx = -r; dx <= r && !rr; dx++) for (let dz = -r; dz <= r; dz++) { if (Math.max(Math.abs(dx), Math.abs(dz)) !== r) continue; const ii = i + dx, jj = j + dy, kk = k + dz; if (ii < 0 || kk < 0 || ii >= nx || kk >= nz || jj >= ny) continue; const t = zone[ii + jj * nx + kk * nxy]; if (t !== SOLID && (t & MASK) === 0) { rr = r; break; } }
  (rr ? buckets[rr] : buckets.far).push(c); }
const S = 8, out = {};
for (const key of Object.keys(buckets)) { const arr = buckets[key], st = arr.length / OPT.K, samp = []; for (let q = 0; q < OPT.K && q * st < arr.length; q++) samp.push(arr[Math.min(arr.length - 1, Math.floor(q * st + rnd() * st))]);
  let ext = 0, under = 0, underExt = 0, sF = 0, sT = 0, pre5 = 0, nFpos = 0, underFpos = 0, underF0 = 0; const ex = []; let popFpos = 0; for (const c of arr) if (G[c] > 0) popFpos++;
  for (const c of samp) { const i = c % nx, j = ((c / nx) | 0) % ny, k = (c / nxy) | 0, x = org.x + (i + .5) * cl, y = org.y + (j + .5) * cl, z = org.z + (k + .5) * cl; let s = 0;
    for (let a = 0; a < S; a++) for (let b = 0; b < S; b++) { const mu = muOf((a + rnd()) / S), ph = 2 * Math.PI * (b + rnd()) / S, r = Math.sqrt(1 - mu * mu); s += visRay(x, y, z, r * Math.cos(ph), mu, r * Math.sin(ph)); }
    const T = s / 64, F = G[c] / 1e4; sF += F; sT += T; if (T > 0.2) ext++; if (F > 0) nFpos++; if (T - F > 0.1) { under++; if (F > 0) underFpos++; else underF0++; if (T > 0.2) underExt++; if (ex.length < 4) ex.push([c, +F.toFixed(3), +T.toFixed(3)]); } }
  const n = samp.length; out[key] = { population: arr.length, popFpos, sampFpos: nFpos, underFpos, underF0, sampled: n, truthGt02: ext, underBy01: under, underExt, estUnderPop: n ? Math.round(arr.length * under / n) : 0, meanF: n ? +(sF / n).toFixed(3) : null, meanTruth: n ? +(sT / n).toFixed(3) : null, ex }; }
return { bld: Z.bld, opt: OPT, shell: Z.field.shell ? { cells: Z.field.shell.cells, recomputed: Z.field.shell.recomputed } : null, byReach: out };
