// B1 probe (Fable, 2026-09-27): sky-view field F per lattice cell vs the GEOMETRIC sky of the same cell, measured on the real
// meshes through ONE merged world-space BVH (three-mesh-bvh, indirect). Pose-free: a seeded sample of wall-adjacent cells.
// Per cell: F_lat = G[c]/10000 (the renderer's cell value); vis_lat[d] = the lattice march along FIELD_DIRS[d] (field() semantics);
// vis_mesh[d] = one exact ray along the same unit direction; F_geoLat = sum w_d vis_mesh[d] (lattice quadrature, exact visibility);
// F_geoMC = 64 stratified rays of the field's own integrand (CIE overcast, cos(zenith) x (1 + 2 sin elev)); F_wall = skycheck.js's
// number (cosine about the outward wall normal, upward rays only, max 0.5). Glass: x T per pane entered, as field() does.
const A = window.APP, LZ = window.LightZones, Z = LZ.get(); if (!Z || !Z.field) return { err: 'no zones/field: press Alt+S first' };
const T0 = performance.now(), nx = Z.nx, ny = Z.ny, nz = Z.nz, nxy = nx * ny, N = nx * ny * nz, zone = Z.zone, SOLID = 65535, MASK = 0x3FFF, G = Z.field.G, cl = Z.cell, org = Z.org, gT = Z.glassT;
const OPT = Object.assign({ kCov: 400, kOpen: 120, mc: 64, seed: 7, far: 250 }, window.__b1opt || {});
// ── 1. merged triangle soup + BVH (cached per building) ──────────────────────────────────────────────────────────────────────
function glassyMat(m) { return !!(m && m.transparent && m.opacity < 0.95 && !m.map && m.type !== 'MeshBasicMaterial'); }
function buildSoup() {
  // Reference geometry = the ARC + STR disciplines (walls, slabs, roofs, coverings, curtain walls, plates, windows, doors, columns,
  // beams, members, stairs, railings, proxies), not furniture, not MEP/PLB/FP/ELEC (indoor services: 9.6M of Hospital's 17M visible
  // tris, irrelevant to an exterior cell's sky), not MeshBasic (skycheck.js's opaque rule), not the sky / ground / portal helpers.
  const t0 = performance.now(), parts = [], skip = { basic: 0, skyPortal: 0, sky: 0, ground: 0, hidden: 0, noGeo: 0, discTris: 0, furnTris: 0 }; let nv = 0, ni = 0;
  const m4 = new THREE.Matrix4(), DISC = { ARC: 1, STR: 1, '': 1, undefined: 1 };
  A.scene.traverse(o => {
    if (!(o.isMesh || o.isInstancedMesh || o.isBatchedMesh)) return; if (!o.geometry) { skip.noGeo++; return; }
    let vis = true; for (let q = o; q; q = q.parent) if (!q.visible) { vis = false; break; } if (!vis) { skip.hidden++; return; }
    if (o === A._sky) { skip.sky++; return; } if (o === A.ground) { skip.ground++; return; } if (o.userData && o.userData.skyPortal) { skip.skyPortal++; return; }
    const g = o.geometry, pos = g.attributes.position; if (!pos) return; const idx = g.index; o.updateMatrixWorld(); const ud = o.userData || {};
    const mats = Array.isArray(o.material) ? o.material : [o.material]; if (mats[0] && mats[0].isMeshBasicMaterial && !o.isBatchedMesh) { skip.basic++; return; }   // skycheck.js's opaque rule
    const full = idx ? idx.count : pos.count;
    if (!DISC[ud.disc]) { skip.discTris += full / 3 * (o.isInstancedMesh ? o.count : 1); return; } if (ud.ifcClass === 'IfcFurniture') { skip.furnTris += full / 3 * (o.isInstancedMesh ? o.count : 1); return; }
    const groups = (g.groups && g.groups.length && mats.length > 1) ? g.groups : null;
    function add(matrix, start, count, vs, vc) { parts.push({ pos, idx, matrix: matrix.clone(), start, count, vs, vc, mats, groups }); nv += vc; ni += count; }
    if (o.isBatchedMesh) { const info = o._instanceInfo || []; for (let i = 0; i < info.length; i++) { if (!info[i] || !info[i].active || !info[i].visible) continue; let rng; try { rng = o.getGeometryRangeAt(o.getGeometryIdAt(i)); } catch (e) { continue; } if (!rng) continue; o.getMatrixAt(i, m4); m4.premultiply(o.matrixWorld); add(m4, idx ? rng.indexStart : rng.vertexStart, idx ? rng.indexCount : rng.vertexCount, rng.vertexStart, rng.vertexCount); } return; }
    if (o.isInstancedMesh) { for (let k = 0; k < o.count; k++) { o.getMatrixAt(k, m4); const e = m4.elements; if (!(e[0] || e[1] || e[2] || e[4] || e[5] || e[6] || e[8] || e[9] || e[10])) continue; m4.premultiply(o.matrixWorld); add(m4, 0, full, 0, pos.count); } return; }
    add(o.matrixWorld, 0, full, 0, pos.count); });
  // vertices copied once per part (transformed), indices remapped. T per triangle: 0 opaque, else 1..255 = round(T x 255)
  const P = new Float32Array(nv * 3), I = new Uint32Array(ni), TT = new Uint8Array(ni / 3); let vp = 0, ip = 0, tp = 0; const v = new THREE.Vector3();
  parts.forEach(pt => { const { pos, idx, matrix, start, count, vs, vc, mats, groups } = pt; let gi = 0; const base = vp;
    for (let q = 0; q < vc; q++) { v.fromBufferAttribute(pos, vs + q).applyMatrix4(matrix); P[vp * 3] = v.x; P[vp * 3 + 1] = v.y; P[vp * 3 + 2] = v.z; vp++; }
    for (let t = start; t + 2 < start + count; t += 3) { let mat = mats[0]; if (groups) { while (gi < groups.length - 1 && t >= groups[gi].start + groups[gi].count) gi++; mat = mats[groups[gi].materialIndex || 0]; }
      TT[tp++] = glassyMat(mat) ? Math.max(1, Math.round((1 - mat.opacity) * 255)) : 0;
      for (let q = 0; q < 3; q++) { const vi = idx ? idx.getX(t + q) : t + q; I[ip++] = base + (vi - vs); } } });
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(P, 3)); geo.setIndex(new THREE.BufferAttribute(I, 1));
  const tb = performance.now(); geo.computeBoundsTree({ indirect: true, maxLeafTris: 8 });
  // self-test of indirect faceIndex: a ray at 20 triangle centroids must report that triangle
  let ok = 0, tried = 0; const ray = new THREE.Ray(), a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3(), n = new THREE.Vector3();
  for (let s = 0; s < 20; s++) { const tri = Math.floor((s + 0.5) / 20 * (ni / 3)); a.fromArray(P, I[tri * 3] * 3); b.fromArray(P, I[tri * 3 + 1] * 3); c.fromArray(P, I[tri * 3 + 2] * 3); n.subVectors(b, a).cross(c.sub(a)); if (n.lengthSq() < 1e-12) continue; n.normalize(); tried++;
    const cen = a.clone().add(b).add(c.add(a)).multiplyScalar(1 / 3); ray.origin.copy(cen).addScaledVector(n, 0.01); ray.direction.copy(n).negate(); const h = geo.boundsTree.raycastFirst(ray, THREE.DoubleSide, 0, 0.05); if (h && h.faceIndex === tri) ok++; }
  return { geo, T: TT, tris: ni / 3, parts: parts.length, skip, buildMs: Math.round(performance.now() - t0), bvhMs: Math.round(performance.now() - tb), selfTest: ok + '/' + tried, mb: +((P.byteLength + I.byteLength) / 1e6).toFixed(0) };
}
if (!window.__b1bvh || window.__b1bvh.bld !== Z.bld) { const s = buildSoup(); s.bld = Z.bld; window.__b1bvh = s; }
const B = window.__b1bvh, geo = B.geo, TT = B.T, ray = new THREE.Ray();
// exact visibility along a ray: product of T over panes entered, 0 at an opaque triangle, 1 if nothing within far
function visRay(ox, oy, oz, dx, dy, dz) { let v = 1, t0 = 0, panes = 0; ray.origin.set(ox, oy, oz); ray.direction.set(dx, dy, dz);
  for (let s = 0; s < 6; s++) { const h = geo.boundsTree.raycastFirst(ray, THREE.DoubleSide, t0, OPT.far); if (!h) return v; const tq = TT[h.faceIndex]; if (!tq) return 0; if (panes === 0 || h.distance - t0 > 0.3) { v *= tq / 255; panes++; } t0 = h.distance + 0.01; }
  return v; }
// ── 2. candidates: non-solid, at/above ground, a lateral SOLID neighbour, an open cell within 2 cells laterally at dy 0..2 ──
const jg = Z.groundJ || 0, cov = [], opn = [];
for (let c = 0; c < N; c++) { const v = zone[c]; if (v === SOLID) continue; const i = c % nx, j = ((c / nx) | 0) % ny, k = (c / nxy) | 0; if (j < jg || j + 1 >= ny) continue;
  if (!((i > 0 && zone[c - 1] === SOLID) || (i < nx - 1 && zone[c + 1] === SOLID) || (k > 0 && zone[c - nxy] === SOLID) || (k < nz - 1 && zone[c + nxy] === SOLID))) continue;
  const isOpen = (v & MASK) === 0; let near = isOpen;
  for (let dy = 0; dy <= 2 && !near; dy++) for (let dx = -2; dx <= 2 && !near; dx++) for (let dz = -2; dz <= 2 && !near; dz++) { const ii = i + dx, jj = j + dy, kk = k + dz; if (ii < 0 || kk < 0 || ii >= nx || kk >= nz || jj >= ny) continue; const t = zone[ii + jj * nx + kk * nxy]; if (t !== SOLID && (t & MASK) === 0) near = true; }
  if (!near) continue; (isOpen ? opn : cov).push(c); }
let seed = OPT.seed; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
function pick(arr, k) { const out = []; if (!arr.length) return out; const st = arr.length / k; for (let q = 0; q < k && q * st < arr.length; q++) out.push(arr[Math.min(arr.length - 1, Math.floor(q * st + rnd() * st))]); return out; }
const sampC = pick(cov, OPT.kCov), sampO = pick(opn, OPT.kOpen);
// ── 3. lattice march per direction (field() semantics: mids + target; glass = x T once per entry; open target = 1; off grid = 1) ──
const DIRS = LZ.FIELD_DIRS, nd = DIRS.length, DO = DIRS.map(d => ({ off: d.dx + nx + d.dz * nxy, mo: d.mids.map(m => m[0] + m[1] * nx + m[2] * nxy), mx: d.mids.map(m => m[0]), my: d.mids.map(m => m[1]), mz: d.mids.map(m => m[2]) }));
function latDir(c0, di) { const d = DIRS[di], o = DO[di]; let c = c0, v = 1;
  for (let s = 0; s < 4096; s++) { const i = c % nx, j = ((c / nx) | 0) % ny, k = (c / nxy) | 0, ti = i + d.dx, tk = k + d.dz;
    if (j + 1 >= ny || ti < 0 || tk < 0 || ti >= nx || tk >= nz) return v;
    const tgt = c + o.off, inG = zone[c] === SOLID; let gmin = 256;
    if (!inG && gT[tgt]) gmin = gT[tgt];
    for (let m = 0; m < o.mo.length; m++) { const ii = i + o.mx[m], jj = j + o.my[m], kk = k + o.mz[m]; if (ii < 0 || kk < 0 || ii >= nx || kk >= nz || jj >= ny) continue; const cm = c + o.mo[m]; if (zone[cm] === SOLID) { const gq = gT[cm]; if (gq) { if (gq < gmin) gmin = gq; } else return 0; } }
    if (!inG && gmin < 256) v *= gmin / 255;
    const vt = zone[tgt]; if (vt === SOLID && !gT[tgt]) return 0; if (vt !== SOLID && (vt & MASK) === 0) return v; c = tgt; }
  return v; }
// CIE overcast cos-weighted hemisphere sampling: pdf(mu) ~ mu (1 + 2 mu), CDF = (mu^2/2 + 2 mu^3/3) / (7/6)
function muOf(u) { let m = Math.sqrt(u); for (let it = 0; it < 12; it++) { const f = (m * m / 2 + 2 * m * m * m / 3) * 6 / 7 - u, df = (m + 2 * m * m) * 6 / 7; m -= f / (df || 1e-6); if (m < 0) m = 0; if (m > 1) m = 1; } return m; }
const S = Math.round(Math.sqrt(OPT.mc)), nMC = S * S;
function evalCell(c, isOpen) { const i = c % nx, j = ((c / nx) | 0) % ny, k = (c / nxy) | 0, x = org.x + (i + 0.5) * cl, y = org.y + (j + 0.5) * cl, z = org.z + (k + 0.5) * cl;
  const lat = new Array(nd), mesh = new Array(nd); let fLat2 = 0, fGeoLat = 0;
  for (let d = 0; d < nd; d++) { const D = DIRS[d]; lat[d] = latDir(c, d); mesh[d] = visRay(x, y, z, D.u[0], D.u[1], D.u[2]); fLat2 += D.w * lat[d]; fGeoLat += D.w * mesh[d]; }
  let mc = 0; for (let a = 0; a < S; a++) for (let b = 0; b < S; b++) { const u = (a + rnd()) / S, ph = 2 * Math.PI * (b + rnd()) / S, mu = muOf(u), r = Math.sqrt(Math.max(0, 1 - mu * mu)); mc += visRay(x, y, z, r * Math.cos(ph), mu, r * Math.sin(ph)); }
  // outward wall normal = away from the lateral SOLID neighbour(s); F_wall as skycheck.js (cosine about n, only d.y > 0 rays count, N = 32)
  let wx = 0, wz = 0; if (i > 0 && zone[c - 1] === SOLID) wx += 1; if (i < nx - 1 && zone[c + 1] === SOLID) wx -= 1; if (k > 0 && zone[c - nxy] === SOLID) wz += 1; if (k < nz - 1 && zone[c + nxy] === SOLID) wz -= 1;
  let fWall = null; if (wx || wz) { const l = Math.hypot(wx, wz), n = [wx / l, 0, wz / l], t1 = [0, 1, 0], t2 = [n[2] * t1[1] - 0, 0 - n[0] * t1[1] * 0, 0]; t2[0] = -n[2]; t2[1] = 0; t2[2] = n[0]; let esc = 0;
    for (let s = 0; s < 32; s++) { const u = rnd(), v2 = rnd(), rr = Math.sqrt(u), ph = 2 * Math.PI * v2, cz = Math.sqrt(1 - u); const dx = t1[0] * rr * Math.cos(ph) + t2[0] * rr * Math.sin(ph) + n[0] * cz, dy = t1[1] * rr * Math.cos(ph) + t2[1] * rr * Math.sin(ph) + n[1] * cz, dz = t1[2] * rr * Math.cos(ph) + t2[2] * rr * Math.sin(ph) + n[2] * cz; if (dy <= 0) continue; esc += visRay(x + n[0] * 0.05, y, z + n[2] * 0.05, dx, dy, dz); } fWall = +(esc / 32).toFixed(3); }
  // cap height: first SOLID above in the column (cells); mesh zenith escape
  let capH = -1; for (let jj = j + 1; jj < ny; jj++) if (zone[i + jj * nx + k * nxy] === SOLID) { capH = jj - j; break; }
  const zc = isOpen ? 0 : (zone[c] & MASK);
  return { c, xyz: [+x.toFixed(1), +y.toFixed(1), +z.toFixed(1)], zone: zc, skyBit: (zone[c] & 0x4000) ? 1 : 0, F: G[c] / 10000, Flat2: +fLat2.toFixed(3), FgeoLat: +fGeoLat.toFixed(3), FgeoMC: +(mc / nMC).toFixed(3), Fwall: fWall, capH, zenMesh: +mesh[0].toFixed(2), lat, mesh }; }
const tE = performance.now(), rowsC = sampC.map(c => evalCell(c, false)), rowsO = sampO.map(c => evalCell(c, true)), evalMs = Math.round(performance.now() - tE);
// ── 4. aggregates ──
function agg(rows, pred) { const R = rows.filter(pred), d = R.map(r => r.F - r.FgeoMC), dv = R.map(r => r.F - r.FgeoLat), dq = R.map(r => r.FgeoLat - r.FgeoMC), bins = { 'lt-0.5': 0, '-0.5..-0.3': 0, '-0.3..-0.1': 0, 'within0.1': 0, '0.1..0.3': 0, 'gt0.3': 0 };
  d.forEach(x => { if (x < -0.5) bins['lt-0.5']++; else if (x < -0.3) bins['-0.5..-0.3']++; else if (x < -0.1) bins['-0.3..-0.1']++; else if (x <= 0.1) bins['within0.1']++; else if (x <= 0.3) bins['0.1..0.3']++; else bins['gt0.3']++; });
  const med = a => { if (!a.length) return null; const s = a.slice().sort((p, q) => p - q); return +s[s.length >> 1].toFixed(3); }, mean = a => a.length ? +(a.reduce((p, q) => p + q, 0) / a.length).toFixed(3) : null;
  return { n: R.length, within01: R.length ? +(bins['within0.1'] / R.length).toFixed(3) : null, bins, dF_minus_geoMC: { median: med(d), mean: mean(d) }, dVisibility_F_minus_geoLat: { median: med(dv), mean: mean(dv) }, dQuadrature_geoLat_minus_geoMC: { median: med(dq), mean: mean(dq) }, meanF: mean(R.map(r => r.F)), meanGeoMC: mean(R.map(r => r.FgeoMC)), meanGeoLat: mean(R.map(r => r.FgeoLat)), meanFwall: mean(R.filter(r => r.Fwall != null).map(r => r.Fwall)) }; }
// per-direction confusion on covered exterior cells: lattice says blocked (< 0.05) while the mesh says open (>= 0.5), and the reverse
const ext = rowsC.filter(r => r.FgeoMC > 0.2), perDir = DIRS.map((D, d) => { let lostW = 0, lost = 0, gained = 0; ext.forEach(r => { if (r.lat[d] < 0.05 && r.mesh[d] >= 0.5) { lost++; lostW += D.w * (r.mesh[d] - r.lat[d]); } if (r.lat[d] >= 0.5 && r.mesh[d] < 0.05) gained++; }); return { d: D.dx + ',' + D.dz, elev: +D.elev.toFixed(1), w: +D.w.toFixed(4), lost, gained, lostF: ext.length ? +(lostW / ext.length).toFixed(4) : 0 }; });
const zen = perDir.find(p => p.d === '0,0'), strip = perDir.filter(p => p.d.split(',')[0] === '0'), lostTot = perDir.reduce((a, p) => a + p.lostF, 0);
const capHist = {}; ext.forEach(r => { const b = r.capH < 0 ? 'none' : r.capH <= 2 ? '1-2' : r.capH <= 6 ? '3-6' : r.capH <= 20 ? '7-20' : '>20'; capHist[b] = (capHist[b] || 0) + 1; });
const out = { bld: Z.bld, cacheKey: LZ.cacheKey(), stats: { zones: Z.zones, indoorCells: Z.stats.indoorCells, largestZoneM3: Z.stats.largestZoneM3, capCells: Z.stats.capCells, capSkipped: Z.stats.capSkipped, solid: Z.stats.solid },
  bvh: { tris: B.tris, parts: B.parts, skip: B.skip, buildMs: B.buildMs, bvhMs: B.bvhMs, selfTest: B.selfTest, mb: B.mb }, candidates: { covered: cov.length, open: opn.length }, sampled: { covered: rowsC.length, open: rowsO.length, mc: nMC, evalMs, usPerRay: +(evalMs * 1000 / ((rowsC.length + rowsO.length) * (nd + nMC + 32))).toFixed(1) },
  COVERED_exterior_geoMC_gt_0_2: agg(rowsC, r => r.FgeoMC > 0.2), COVERED_geoMC_le_0_2: agg(rowsC, r => r.FgeoMC <= 0.2), OPEN_control_all: agg(rowsO, r => true), OPEN_control_geoMC_lt_0_8: agg(rowsO, r => r.FgeoMC < 0.8),
  perDirLoss: { zenith: zen, dx0strip_lostF: +strip.reduce((a, p) => a + p.lostF, 0).toFixed(4), total_lostF: +lostTot.toFixed(4), top: perDir.slice().sort((a, b) => b.lostF - a.lostF).slice(0, 8) }, capHeightHist_ext: capHist,
  sampleRows: ext.slice(0, 12).map(r => ({ c: r.c, xyz: r.xyz, zone: r.zone, F: r.F, FgeoMC: r.FgeoMC, FgeoLat: r.FgeoLat, Fwall: r.Fwall, capH: r.capH, zenMesh: r.zenMesh })), totalMs: Math.round(performance.now() - T0) };
window.__b1rows = { rowsC, rowsO };
return out;
