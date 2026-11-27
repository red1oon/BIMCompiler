// dark px (<=15) at the staged pose -> hit surface -> eye-side cell (p + n*0.3): label, reach r (lateral Chebyshev distance to an OPEN
// cell, dy 0..2, 'far' > 8), F, 64-ray truth (fgeo.js BVH/estimator, run fgeo.js first), sun state. Groups: colour/normal/sun/r/underread.
const A = window.APP, D = window.__giStillDebugCanvas, w = D.under.width, h = D.under.height, LZ = window.LightZones, Z = LZ.get(), B = window.__b1bvh;
if (!B) return { err: 'run fgeo.js first' };
const nx = Z.nx, ny = Z.ny, nz = Z.nz, nxy = nx * ny, zone = Z.zone, SOLID = 65535, MASK = 0x3FFF, G = Z.field.G, cl = Z.cell, org = Z.org;
const fin = D.bounce.getContext('2d').getImageData(0, 0, w, h).data, app = D.under.getContext('2d').getImageData(0, 0, w, h).data;
const pts = []; let n = 0; for (let i = 0, p = 0; i < fin.length; i += 4, p++) { const L = fin[i + 3] > 0 ? (fin[i] + fin[i + 1] + fin[i + 2]) / 3 : (app[i] + app[i + 1] + app[i + 2]) / 3; if (L <= 15) { n++; pts.push(p); } }
const step = Math.max(1, Math.floor(pts.length / 250)), tg = []; A.scene.traverse(o => { if ((o.isMesh || o.isInstancedMesh || o.isBatchedMesh) && o.visible && o !== A._sky) tg.push(o); });
const rc = new THREE.Raycaster(), sd = A.sun.position.clone().normalize(), ray = new THREE.Ray(); let seed = 9; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const opaque = q => { const m = Array.isArray(q.object.material) ? q.object.material[0] : q.object.material; return m && !m.isMeshBasicMaterial && !(m.transparent && m.opacity < 0.95); };
function visRay(ox, oy, oz, dx, dy, dz) { let v = 1, t0 = 0, panes = 0; ray.origin.set(ox, oy, oz); ray.direction.set(dx, dy, dz); for (let s = 0; s < 6; s++) { const hh = B.geo.boundsTree.raycastFirst(ray, THREE.DoubleSide, t0, 250); if (!hh) return v; const tq = B.T[hh.faceIndex]; if (!tq) return 0; if (panes === 0 || hh.distance - t0 > 0.3) { v *= tq / 255; panes++; } t0 = hh.distance + 0.01; } return v; }
function muOf(u) { let m = Math.sqrt(u); for (let it = 0; it < 12; it++) { const f = (m * m / 2 + 2 * m * m * m / 3) * 6 / 7 - u, df = (m + 2 * m * m) * 6 / 7; m -= f / (df || 1e-6); if (m < 0) m = 0; if (m > 1) m = 1; } return m; }
const grp = {}, rows = [];
for (let q = 0; q < pts.length; q += step) { const p = pts[q], x = p % w, y = (p / w) | 0; rc.setFromCamera(new THREE.Vector2((x + .5) / w * 2 - 1, 1 - (y + .5) / h * 2), A.camera); rc.far = Infinity;
  const hh = rc.intersectObjects(tg, false).find(t => { const m = Array.isArray(t.object.material) ? t.object.material[0] : t.object.material; return m && !m.isMeshBasicMaterial; }); if (!hh) continue;
  const ob = hh.object, mm = Array.isArray(ob.material) ? ob.material[0] : ob.material; let nn = hh.face ? hh.face.normal.clone().transformDirection(ob.matrixWorld) : new THREE.Vector3(0, 1, 0); if (nn.dot(rc.ray.direction) > 0) nn.negate();
  const sf = LZ.skyField(hh.point, nn), cc = sf && sf.si ? sf.si.cell : -1, i = cc % nx, j = ((cc / nx) | 0) % ny, k = (cc / nxy) | 0;   // the renderer's own read (CPU mirror of the shader)
  let lab = 'off', r = '-', F = null, T = null, under = false;
  if (cc >= 0) { const c = cc, v = zone[c]; if (v === SOLID) lab = 'solid'; else if ((v & MASK) === 0) lab = 'open'; else { lab = 'covered'; F = sf.F != null ? sf.F : G[c] / 1e4;
      let rr = 0; for (let rq = 1; rq <= 8 && !rr; rq++) for (let dy = 0; dy <= 2 && !rr; dy++) for (let dx = -rq; dx <= rq && !rr; dx++) for (let dz = -rq; dz <= rq; dz++) { if (Math.max(Math.abs(dx), Math.abs(dz)) !== rq) continue; const ii = i + dx, jj = j + dy, kk = k + dz; if (ii < 0 || kk < 0 || ii >= nx || kk >= nz || jj >= ny) continue; const t = zone[ii + jj * nx + kk * nxy]; if (t !== SOLID && (t & MASK) === 0) { rr = rq; break; } }
      r = rr ? String(rr) : 'far'; const x0 = org.x + (i + .5) * cl, y0 = org.y + (j + .5) * cl, z0 = org.z + (k + .5) * cl; let s = 0; for (let a = 0; a < 8; a++) for (let b = 0; b < 8; b++) { const mu = muOf((a + rnd()) / 8), ph = 2 * Math.PI * (b + rnd()) / 8, rr2 = Math.sqrt(1 - mu * mu); s += visRay(x0, y0, z0, rr2 * Math.cos(ph), mu, rr2 * Math.sin(ph)); } T = s / 64; under = T - F > 0.1; } }
  let sh = 'away'; if (nn.dot(sd) > 0) { rc.set(hh.point.clone().addScaledVector(nn, .05), sd); rc.far = 600; sh = rc.intersectObjects(tg, false).some(opaque) ? 'sunBlocked' : 'SUNLIT'; }
  const key = (mm.color ? mm.color.getHexString() : '') + ' n=' + (nn.y > .7 ? 'up' : nn.y < -.7 ? 'down' : 'side') + ' ' + sh + ' ' + lab + (lab === 'covered' ? ' r=' + r + (under ? ' UNDER' : ' ok') : '');
  const g = grp[key] || (grp[key] = { n: 0, sF: 0, sT: 0 }); g.n++; if (F != null) { g.sF += F; g.sT += T; } }
const out = Object.entries(grp).sort((a, b) => b[1].n - a[1].n).map(([k, g]) => g.n + ' ' + k + (g.sT ? ' F=' + (g.sF / g.n).toFixed(2) + ' truth=' + (g.sT / g.n).toFixed(2) : ''));
let tot = 0, underTot = 0, underR3 = 0, underFar = 0, underLE2 = 0; Object.entries(grp).forEach(([k, g]) => { tot += g.n; if (/UNDER/.test(k)) { underTot += g.n; if (/r=[12] /.test(k)) underLE2 += g.n; else if (/r=3 /.test(k)) underR3 += g.n; else underFar += g.n; } });
return { darkPx: n, darkPct: +(100 * n / (w * h)).toFixed(2), sampled: tot, underTot, underByReach: { le2: underLE2, r3: underR3, gt3: underFar }, rows: out };
