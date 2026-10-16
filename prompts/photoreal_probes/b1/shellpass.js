// B1 prototype of the fix: EXACT visibility for the boundary SHELL cells. For every covered cell beside a wall and near open air,
// each FIELD_DIRS direction the lattice march calls BLOCKED is re-tested with one exact ray against a BVH over the BOUNDARY draws
// (the same triangles the voxeliser rasterised). F' = sum w_d v'_d. Reports cost (cells, rays, ms) and F' vs the geometric truth on
// the fgeo.js sample (window.__b1rows, ARC+STR BVH). Variant 'all': every direction exact (upper bound of what rays can give).
const A = window.APP, LZ = window.LightZones, Z = LZ.get(); if (!Z || !Z.field || !window.__b1rows) return { err: 'run fgeo.js first' };
const T0 = performance.now(), nx = Z.nx, ny = Z.ny, nz = Z.nz, nxy = nx * ny, N = nx * ny * nz, zone = Z.zone, SOLID = 65535, MASK = 0x3FFF, G = Z.field.G, cl = Z.cell, org = Z.org, gT = Z.glassT;
const OPT = Object.assign({ near: 2, far: 400, useArcStr: false }, window.__b1shell || {});
function glassyMat(m) { return !!(m && m.transparent && m.opacity < 0.95 && !m.map && m.type !== 'MeshBasicMaterial'); }
// ── boundary-only soup (light_zones.js boundaryDraws rule) ──
function boundarySoup() {
  const t0 = performance.now(), BOUNDARY = ['IfcWall', 'IfcWallStandardCase', 'IfcSlab', 'IfcRoof', 'IfcCovering', 'IfcDoor', 'IfcWindow', 'IfcCurtainWall', 'IfcPlate'], cls = new Set(BOUNDARY), guids = new Set();
  A.dbQuery("SELECT guid FROM elements_meta WHERE ifc_class IN ('" + BOUNDARY.join("','") + "')").forEach(r => guids.add(r[0]));
  const parts = [], m4 = new THREE.Matrix4(); let nv = 0, ni = 0;
  A.scene.traverse(o => { if (!(o.isMesh || o.isInstancedMesh || o.isBatchedMesh) || !o.geometry) return; if (o === A.ground || o === A._sky || (o.userData && (o.userData.skyPortal || o.userData.excludeFromShadow))) return; o.updateMatrixWorld();
    const g = o.geometry, pos = g.attributes.position, idx = g.index, full = idx ? idx.count : pos.count, mats = Array.isArray(o.material) ? o.material : [o.material], groups = (g.groups && g.groups.length && mats.length > 1) ? g.groups : null;
    function add(matrix, start, count, vs, vc) { parts.push({ pos, idx, matrix: matrix.clone(), start, count, vs, vc, mats, groups }); nv += vc; ni += count; }
    if (o.isBatchedMesh) { const n = (typeof o.instanceCount === 'number') ? o.instanceCount : (o._instanceInfo ? o._instanceInfo.length : 0); for (let i = 0; i < n; i++) { const gd = A.guidMap[o.id + '_' + i]; if (!gd || !guids.has(gd)) continue; let rng; try { rng = o.getGeometryRangeAt(o.getGeometryIdAt(i)); } catch (e) { continue; } if (!rng) continue; o.getMatrixAt(i, m4); m4.premultiply(o.matrixWorld); add(m4, idx ? rng.indexStart : rng.vertexStart, idx ? rng.indexCount : rng.vertexCount, rng.vertexStart, rng.vertexCount); } return; }
    if (!cls.has(o.userData && o.userData.ifcClass)) return;
    if (o.isInstancedMesh) { for (let k = 0; k < o.count; k++) { o.getMatrixAt(k, m4); const e = m4.elements; if (e[0] === 0 && e[5] === 0 && e[10] === 0) continue; m4.premultiply(o.matrixWorld); add(m4, 0, full, 0, pos.count); } return; }
    add(o.matrixWorld, 0, full, 0, pos.count); });
  const P = new Float32Array(nv * 3), I = new Uint32Array(ni), TT = new Uint8Array(ni / 3); let vp = 0, ip = 0, tp = 0; const v = new THREE.Vector3();
  parts.forEach(pt => { const { pos, idx, matrix, start, count, vs, vc, mats, groups } = pt; let gi = 0; const base = vp;
    for (let q = 0; q < vc; q++) { v.fromBufferAttribute(pos, vs + q).applyMatrix4(matrix); P[vp * 3] = v.x; P[vp * 3 + 1] = v.y; P[vp * 3 + 2] = v.z; vp++; }
    for (let t = start; t + 2 < start + count; t += 3) { let mat = mats[0]; if (groups) { while (gi < groups.length - 1 && t >= groups[gi].start + groups[gi].count) gi++; mat = mats[groups[gi].materialIndex || 0]; } TT[tp++] = glassyMat(mat) ? Math.max(1, Math.round((1 - mat.opacity) * 255)) : 0;
      for (let q = 0; q < 3; q++) { const vi = idx ? idx.getX(t + q) : t + q; I[ip++] = base + (vi - vs); } } });
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(P, 3)); geo.setIndex(new THREE.BufferAttribute(I, 1)); const tb = performance.now(); geo.computeBoundsTree({ indirect: true, maxLeafTris: 8 });
  return { geo, T: TT, tris: ni / 3, parts: parts.length, soupMs: Math.round(tb - t0), bvhMs: Math.round(performance.now() - tb), mb: +((P.byteLength + I.byteLength) / 1e6).toFixed(0) };
}
if (!window.__b1bnd || window.__b1bnd.bld !== Z.bld) { const s = boundarySoup(); s.bld = Z.bld; window.__b1bnd = s; }
const BV = OPT.useArcStr ? window.__b1bvh : window.__b1bnd, geo = BV.geo, TT = BV.T, ray = new THREE.Ray();
function visRay(ox, oy, oz, dx, dy, dz) { let v = 1, t0 = 0, panes = 0; ray.origin.set(ox, oy, oz); ray.direction.set(dx, dy, dz);
  for (let s = 0; s < 6; s++) { const h = geo.boundsTree.raycastFirst(ray, THREE.DoubleSide, t0, OPT.far); if (!h) return v; const tq = TT[h.faceIndex]; if (!tq) return 0; if (panes === 0 || h.distance - t0 > 0.3) { v *= tq / 255; panes++; } t0 = h.distance + 0.01; } return v; }
// ── shell cells ──
const jg = Z.groundJ || 0, shell = [], R = OPT.near;
for (let c = 0; c < N; c++) { const v = zone[c]; if (v === SOLID || (v & MASK) === 0) continue; const i = c % nx, j = ((c / nx) | 0) % ny, k = (c / nxy) | 0; if (j < jg || j + 1 >= ny) continue;
  if (!((i > 0 && zone[c - 1] === SOLID) || (i < nx - 1 && zone[c + 1] === SOLID) || (k > 0 && zone[c - nxy] === SOLID) || (k < nz - 1 && zone[c + nxy] === SOLID))) continue;
  let near = false; for (let dy = 0; dy <= R && !near; dy++) for (let dx = -R; dx <= R && !near; dx++) for (let dz = -R; dz <= R && !near; dz++) { const ii = i + dx, jj = j + dy, kk = k + dz; if (ii < 0 || kk < 0 || ii >= nx || kk >= nz || jj >= ny) continue; const t = zone[ii + jj * nx + kk * nxy]; if (t !== SOLID && (t & MASK) === 0) near = true; }
  if (near) shell.push(c); }
// ── lattice march per direction (field() semantics) ──
const DIRS = LZ.FIELD_DIRS, nd = DIRS.length, DO = DIRS.map(d => ({ off: d.dx + nx + d.dz * nxy, mo: d.mids.map(m => m[0] + m[1] * nx + m[2] * nxy), mx: d.mids.map(m => m[0]), my: d.mids.map(m => m[1]), mz: d.mids.map(m => m[2]) }));
function latDir(c0, di) { const d = DIRS[di], o = DO[di]; let c = c0, v = 1;
  for (let s = 0; s < 4096; s++) { const i = c % nx, j = ((c / nx) | 0) % ny, k = (c / nxy) | 0, ti = i + d.dx, tk = k + d.dz; if (j + 1 >= ny || ti < 0 || tk < 0 || ti >= nx || tk >= nz) return v;
    const tgt = c + o.off, inG = zone[c] === SOLID; let gmin = 256; if (!inG && gT[tgt]) gmin = gT[tgt];
    for (let m = 0; m < o.mo.length; m++) { const ii = i + o.mx[m], jj = j + o.my[m], kk = k + o.mz[m]; if (ii < 0 || kk < 0 || ii >= nx || kk >= nz || jj >= ny) continue; const cm = c + o.mo[m]; if (zone[cm] === SOLID) { const gq = gT[cm]; if (gq) { if (gq < gmin) gmin = gq; } else return 0; } }
    if (!inG && gmin < 256) v *= gmin / 255; const vt = zone[tgt]; if (vt === SOLID && !gT[tgt]) return 0; if (vt !== SOLID && (vt & MASK) === 0) return v; c = tgt; } return v; }
// ── the pass: blocked directions re-tested by an exact ray ──
const tP = performance.now(), Fnew = new Map(), FnewAll = new Map(); let rays = 0, raysAll = 0, lifted = 0, latMs = 0, skipped = 0; const PRE = [0, 1, 2, 3, 4].map(q => q === 0 ? DIRS.findIndex(d => !d.dx && !d.dz) : DIRS.findIndex(d => (q === 1 && d.dx === 1 && !d.dz) || (q === 2 && d.dx === -1 && !d.dz) || (q === 3 && !d.dx && d.dz === 1) || (q === 4 && !d.dx && d.dz === -1)));
for (let s = 0; s < shell.length; s++) { const c = shell[s], i = c % nx, j = ((c / nx) | 0) % ny, k = (c / nxy) | 0, x = org.x + (i + 0.5) * cl, y = org.y + (j + 0.5) * cl, z = org.z + (k + 0.5) * cl; let f = 0, fa = 0; const tl = performance.now();
  let skipCell = false;
  if (OPT.pretest) { // 5 probe rays first: zenith + the 4 axis 45-degree directions; all blocked -> the cell keeps its lattice value
    let any = 0; for (const pd of PRE) { const D = DIRS[pd]; if (latDir(c, pd) > 0.001) { any = 1; break; } rays++; if (visRay(x, y, z, D.u[0], D.u[1], D.u[2]) > 0.001) { any = 1; break; } } if (!any) { skipCell = true; skipped++; } }
  if (skipCell) f = G[c] / 10000; else for (let d = 0; d < nd; d++) { const D = DIRS[d]; let v = latDir(c, d); if (v < 0.001) { v = visRay(x, y, z, D.u[0], D.u[1], D.u[2]); rays++; } f += D.w * v; }
  latMs += performance.now() - tl; Fnew.set(c, Math.min(1, f)); if (f - G[c] / 10000 > 0.05) lifted++; }
const passMs = Math.round(performance.now() - tP);
// variant 'all' on the sample only (cost estimate x shell)
const rowsC = window.__b1rows.rowsC, inShell = new Set(shell), samp = rowsC.filter(r => inShell.has(r.c));
const tA = performance.now(); samp.forEach(r => { const i = r.c % nx, j = ((r.c / nx) | 0) % ny, k = (r.c / nxy) | 0, x = org.x + (i + 0.5) * cl, y = org.y + (j + 0.5) * cl, z = org.z + (k + 0.5) * cl; let fa = 0; for (let d = 0; d < nd; d++) { const D = DIRS[d]; fa += D.w * visRay(x, y, z, D.u[0], D.u[1], D.u[2]); raysAll++; } FnewAll.set(r.c, Math.min(1, fa)); }); const allMs = performance.now() - tA;
function agg(rows, getF) { const R = rows, d = R.map(r => getF(r) - r.FgeoMC), bins = { 'lt-0.5': 0, '-0.5..-0.3': 0, '-0.3..-0.1': 0, 'within0.1': 0, '0.1..0.3': 0, 'gt0.3': 0 };
  d.forEach(x => { if (x < -0.5) bins['lt-0.5']++; else if (x < -0.3) bins['-0.5..-0.3']++; else if (x < -0.1) bins['-0.3..-0.1']++; else if (x <= 0.1) bins['within0.1']++; else if (x <= 0.3) bins['0.1..0.3']++; else bins['gt0.3']++; });
  const med = a => { if (!a.length) return null; const s = a.slice().sort((p, q) => p - q); return +s[s.length >> 1].toFixed(3); }, mean = a => a.length ? +(a.reduce((p, q) => p + q, 0) / a.length).toFixed(3) : null;
  return { n: R.length, within01: R.length ? +(bins['within0.1'] / R.length).toFixed(3) : null, bins, d_median: med(d), d_mean: mean(d), meanF: mean(R.map(getF)), meanGeoMC: mean(R.map(r => r.FgeoMC)) }; }
const ext = samp.filter(r => r.FgeoMC > 0.2), dark = samp.filter(r => r.FgeoMC <= 0.2), notShell = rowsC.filter(r => !inShell.has(r.c) && r.FgeoMC > 0.2);
window.__b1shellF = Fnew;
return { bld: Z.bld, bvh: OPT.useArcStr ? 'ARC+STR' : 'boundary', boundaryBvh: { tris: window.__b1bnd.tris, parts: window.__b1bnd.parts, soupMs: window.__b1bnd.soupMs, bvhMs: window.__b1bnd.bvhMs, mb: window.__b1bnd.mb }, near: R,
  cost: { shellCells: shell.length, pretest: !!OPT.pretest, skippedByPretest: skipped, rays, raysPerCell: +(rays / shell.length).toFixed(1), passMs, latticeMarchMs: Math.round(latMs), usPerRay: +((passMs - latMs) * 1000 / rays).toFixed(1), lifted_gt_0_05: lifted, allDirsVariant_usPerRay: +(allMs * 1000 / raysAll).toFixed(1), allDirsVariant_estMs: Math.round(allMs / raysAll * shell.length * nd) },
  sampleInShell: samp.length, sampleExtNotInShell: notShell.length,
  EXT_before: agg(ext, r => r.F), EXT_after_blockedOnly: agg(ext, r => Fnew.get(r.c)), EXT_after_allDirs: agg(ext, r => FnewAll.get(r.c)),
  DARK_before: agg(dark, r => r.F), DARK_after_blockedOnly: agg(dark, r => Fnew.get(r.c)), DARK_after_allDirs: agg(dark, r => FnewAll.get(r.c)),
  rows: ext.slice(0, 14).map(r => ({ c: r.c, xyz: r.xyz, F: r.F, Fnew: +Fnew.get(r.c).toFixed(3), FnewAll: +FnewAll.get(r.c).toFixed(3), geoMC: r.FgeoMC, capH: r.capH })), totalMs: Math.round(performance.now() - T0) };
