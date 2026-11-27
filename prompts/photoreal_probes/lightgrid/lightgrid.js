// lightgrid.js <port> <png | bld> : §LIGHT_GRID_TRUTH v2 (bim-compiler PHOTOREAL_STILL_RENDER.md §SKY_FIELD_EXACT_ALL — SPEC, witness 1).
// World grid of FLOOR points (1 m, from the zone grid, snapped to the real floor) + WALL points (1.2 m above each floor point, the
// nearest opaque hit along +-x/+-z within 3 m whose face is vertical; normal = that face's, turned toward the floor point).
// TRUTH v2 (computed ONCE, saved to ~/.cache/bim4d/light_grid/<bld>_<guids>.v2.json): one three-mesh-bvh over EVERY visible mesh
// (per instance, hidden batch slots skipped); opaque = any non-glassy material, glass = transparent && opacity < 0.95 && !map, T per
// PANE = 1 - opacity (hits closer than 0.3 m merge into one pane, the field's own rule). NR (256) stratified CIE-overcast x cos rays:
//   floor E  = the field's integrand (upward hemisphere, pdf ~ mu (1 + 2 mu)) at floor + 3 cm
//   wall  Eh = the SAME integrand at wall + 0.5 cell x n (the point fieldRead samples: what the field value F approximates)
//   wall  En = normal-hemisphere CIE x cos(n) irradiance / the unobstructed horizontal one (walle.js's quantity), at wall + 3 cm
// v1 truth (32 rays, glass T per FACE) is reused for the floor points' positions / sun / up and kept as E1 for continuity.
// MODEL (every run): LightZones.build + field, F = skyField(p, n). No Alt+S, no pixels. Prints §LIGHT_GRID (floor) + §LIGHT_GRID_WALL.
// Env: Q (url flags), MAXP (3000), NR (256), SUF, REDO=1 (recompute v2 truth), WALLS=0 (skip walls).
const puppeteer = require('/home/red1/bim-compiler/node_modules/puppeteer'), fs = require('fs'), os = require('os'); const sleep = ms => new Promise(r => setTimeout(r, ms));
const [PORT, ARG] = process.argv.slice(2), CDIR = os.homedir() + '/.cache/bim4d/light_grid/'; fs.mkdirSync(CDIR, { recursive: true });
function pose(f) { const d = fs.readFileSync(f); let i = 8; while (i < d.length) { const n = d.readUInt32BE(i), t = d.toString('latin1', i + 4, i + 8), c = d.slice(i + 8, i + 8 + n); i += 12 + n;
  if (t === 'tEXt') { const z = c.indexOf(0); if (c.toString('latin1', 0, z) === 'bim-still-pose') return JSON.parse(c.slice(z + 1).toString('utf8')); } } }
(async () => { const t00 = Date.now(), b = await puppeteer.launch({ headless: true, userDataDir: __dirname + '/prof_' + PORT, protocolTimeout: 7200000, env: Object.assign({}, process.env, { __EGL_VENDOR_LIBRARY_FILENAMES: '/usr/share/glvnd/egl_vendor.d/10_nvidia.json' }), args: ['--no-sandbox', '--use-angle=gl-egl', '--ignore-gpu-blocklist', '--js-flags=--max-old-space-size=8192'] });
  const url = /\.png$/.test(ARG) ? pose(ARG).url : '?db=../buildings/' + ARG + '_extracted.db', p = await b.newPage(); await p.setBypassServiceWorker(true); await p.setViewport({ width: 800, height: 450 }); const L = [];
  p.on('console', m => { const t = m.text(); if (/^§(SKY_|ZONE_IDB|LIGHT_ZONE|GLASS_REFL|LIGHT_FIELD)|Uncaptured WebGPU/.test(t)) L.push(t.slice(0, 3000)); }); p.on('pageerror', e => L.push('PAGEERROR ' + e.message));
  await p.goto('http://127.0.0.1:' + PORT + '/viewer/viewer.html' + url + (process.env.Q || ''), { waitUntil: 'domcontentloaded' });
  { let last = -1, same = 0; for (let i = 0; i < 400 && same < 5; i++) { await sleep(2000); const n = await p.evaluate(() => window.APP && window.APP.guidMap ? Object.keys(window.APP.guidMap).length : 0); if (n > 0 && n === last) same++; else same = 0; last = n; } }
  const tLoad = Date.now() - t00, meta = await p.evaluate(() => ({ bld: window.APP.activeBuilding, guids: Object.keys(window.APP.guidMap).length }));
  const CF1 = CDIR + meta.bld + '_' + meta.guids + '.json', CF = CDIR + meta.bld + '_' + meta.guids + '.v2.json';
  const truth = (!process.env.REDO && fs.existsSync(CF)) ? JSON.parse(fs.readFileSync(CF, 'utf8')) : null, t1 = (!truth && fs.existsSync(CF1)) ? JSON.parse(fs.readFileSync(CF1, 'utf8')) : null;
  const R = await p.evaluate(async (truth, t1, MAXP, NR, WALLS, DIAGC) => { const A = window.APP, T = window.THREE, LZ = window.LightZones; if (LZ.prime) { try { await LZ.prime(A); } catch (e) {} }
    const t0 = performance.now(), Z = LZ.build(A), tB = performance.now(), F = Z && LZ.field(A), tF = performance.now(); if (!F) return { err: 'no field' };
    const out = { buildMs: Math.round(tB - t0), fieldMs: Math.round(tF - tB), cell: Z.cell }; let pts = truth ? truth.pts : null, walls = truth ? truth.walls : null, opens = truth ? truth.opens : null; const havePts = !!pts;
    // DIAGC=1: the stencil centroid fieldRead really samples (weights over non-SOLID, own-zone texels, renormalised) -> Es there
    const cen = (p, n) => { const si = LZ.surfaceInfo(p, n), cl = Z.cell, gx = (p.x + n.x * 0.5 * cl - Z.org.x) / cl - 0.5, gy = (p.y + n.y * 0.5 * cl - Z.org.y) / cl - 0.5, gz = (p.z + n.z * 0.5 * cl - Z.org.z) / cl - 0.5, bx = Math.floor(gx), by = Math.floor(gy), bz = Math.floor(gz); let sw = 0, cx = 0, cy = 0, cz = 0;
      for (let o = 0; o < 8; o++) { const ox = o & 1, oy = (o >> 1) & 1, oz = (o >> 2) & 1, i = bx + ox, j = by + oy, k = bz + oz, c = i + j * Z.nx + k * Z.nx * Z.ny, t = Z.zone[c]; if (t === LZ.SOLID) continue; const tz = t & 0x3fff; if (si.zone !== 0 && tz !== si.zone && tz !== 0) continue;
        const w = (ox ? gx - bx : 1 - gx + bx) * (oy ? gy - by : 1 - gy + by) * (oz ? gz - bz : 1 - gz + bz); sw += w; cx += w * (Z.org.x + (i + 0.5) * cl); cy += w * (Z.org.y + (j + 0.5) * cl); cz += w * (Z.org.z + (k + 0.5) * cl); }
      return sw > 0 ? [cx / sw, cy / sw, cz / sw] : null; };
    const needE25 = DIAGC || !pts || !opens || pts[0].E25 == null || opens[0].E25 == null || pts[0].Es25 == null;
    if (!pts || !opens || needE25) { // ── TRUTH v2: one BVH over every visible mesh
      const tS = performance.now(), OP = [], GP = [], GTv = [], OC = [], clsL = [], clsIx = new Map(); let nO = 0, nG = 0, hiddenSlots = 0, meshes = 0;
      // SOUP-LIKE flag (bit 15 of the class index; Gs for glass): the triangle belongs to what the field's exact rays see — BOUNDARY classes,
      // or OCCLUDERS of disc ARC/STR/none (light_zones.js boundaryDraws/shellSoup rule) — for the diagnostic Es (truth over the soup's set)
      const SB = new Set(['IfcWall', 'IfcWallStandardCase', 'IfcSlab', 'IfcRoof', 'IfcCovering', 'IfcDoor', 'IfcWindow', 'IfcCurtainWall', 'IfcPlate']), SOc = new Set(['IfcMember', 'IfcBeam', 'IfcColumn', 'IfcRailing', 'IfcStair', 'IfcStairFlight', 'IfcBuildingElementProxy', 'IfcFooting', 'IfcRamp', 'IfcRampFlight']), ODISC = { ARC: 1, STR: 1, '': 1, undefined: 1 };
      const gcls = new Map(); try { A.dbQuery('SELECT guid, ifc_class FROM elements_meta').forEach(r => gcls.set(r[0], r[1])); } catch (e) {}
      const soupOf = (o, c) => { if (o === A.ground || (o.userData && (o.userData.skyPortal || o.userData.excludeFromShadow))) return 0; return SB.has(c) || (SOc.has(c) && ODISC[o.userData ? o.userData.disc : undefined]) ? 1 : 0; };
      let Gs = new Uint8Array(1 << 17), curSoup = 0;
      const cix = s => { s = s || '?'; if (!clsIx.has(s)) { clsIx.set(s, clsL.length); clsL.push(s); } return clsIx.get(s); };
      const glassy = m => !!(m && m.transparent && m.opacity < 0.95 && !m.map), mt = new T.Matrix4(), v = new T.Vector3();
      let Obuf = new Float32Array(1 << 24), Ocls = new Uint16Array(1 << 21), Gbuf = new Float32Array(1 << 20), Gt = new Float32Array(1 << 17);
      const pushTri = (glass, tval, cl, a) => { if (glass) { if ((nG + 1) * 9 > Gbuf.length) { const q = new Float32Array(Gbuf.length * 2); q.set(Gbuf); Gbuf = q; const q2 = new Float32Array(Gt.length * 2); q2.set(Gt); Gt = q2; } Gbuf.set(a, nG * 9); if (nG >= Gs.length) { const q3 = new Uint8Array(Gs.length * 2); q3.set(Gs); Gs = q3; } Gs[nG] = curSoup; Gt[nG++] = tval; }
        else { if ((nO + 1) * 9 > Obuf.length) { const q = new Float32Array(Obuf.length * 2); q.set(Obuf); Obuf = q; const q2 = new Uint16Array(Ocls.length * 2); q2.set(Ocls); Ocls = q2; } Obuf.set(a, nO * 9); Ocls[nO++] = cl | (curSoup << 15); } };
      const tri = new Float32Array(9);
      const emit = (o, g, m4, start, count, vs, vc, cl) => { const pos = g.attributes.position, ix = g.index, mats = Array.isArray(o.material) ? o.material : [o.material], groups = (g.groups && g.groups.length && mats.length > 1) ? g.groups : null; let gi = 0;
        for (let t = start; t + 2 < start + count; t += 3) { let mat = mats[0]; if (groups) { while (gi < groups.length - 1 && t >= groups[gi].start + groups[gi].count) gi++; mat = mats[groups[gi].materialIndex || 0]; }
          if (!mat || mat.visible === false || mat.isMeshBasicMaterial) continue; const gl = glassy(mat);
          for (let r = 0; r < 3; r++) { const vi = ix ? ix.getX(t + r) : t + r; v.fromBufferAttribute(pos, vi).applyMatrix4(m4); tri[r * 3] = v.x; tri[r * 3 + 1] = v.y; tri[r * 3 + 2] = v.z; }
          pushTri(gl, gl ? 1 - mat.opacity : 0, cl, tri); } };
      A.scene.traverse(o => { if (!(o.isMesh || o.isInstancedMesh || o.isBatchedMesh) || !o.geometry || o === A._sky) return; let q = o, vis = true; while (q) { if (!q.visible) vis = false; q = q.parent; } if (!vis) return;
        const m0 = Array.isArray(o.material) ? o.material[0] : o.material; if (!m0 || m0.isMeshBasicMaterial) return; o.updateMatrixWorld(); meshes++; const g = o.geometry, idx = g.index, full = idx ? idx.count : g.attributes.position.count;
        if (o.isBatchedMesh) { const n = typeof o.instanceCount === 'number' ? o.instanceCount : (o._instanceInfo ? o._instanceInfo.length : 0);
          for (let i = 0; i < n; i++) { try { if (o.getVisibleAt && !o.getVisibleAt(i)) { hiddenSlots++; continue; } } catch (e) { continue; } let gid, rng; try { gid = o.getGeometryIdAt(i); rng = o.getGeometryRangeAt(gid); } catch (e) { continue; } if (!rng) continue;
            const gd = A.guidMap[o.id + '_' + i], me = gd && A.metaByGuid ? A.metaByGuid[gd] : null; o.getMatrixAt(i, mt); mt.premultiply(o.matrixWorld); curSoup = soupOf(o, gcls.get(gd));
            emit(o, g, mt, idx ? rng.indexStart : rng.vertexStart, idx ? rng.indexCount : rng.vertexCount, 0, 0, cix((me && (me.ifc_class || me.cls)) || (o.userData && o.userData.disc) || 'Batched')); } return; }
        const cl = cix((o.userData && (o.userData.ifcClass || o.userData.disc)) || o.type); curSoup = soupOf(o, o.userData && o.userData.ifcClass);
        if (o.isInstancedMesh) { for (let k = 0; k < o.count; k++) { o.getMatrixAt(k, mt); if (mt.elements[0] === 0 && mt.elements[5] === 0 && mt.elements[10] === 0) continue; mt.premultiply(o.matrixWorld); emit(o, g, mt, 0, full, 0, 0, cl); } }
        else emit(o, g, o.matrixWorld, 0, full, 0, 0, cl); });
      const soupMs = performance.now() - tS, tV = performance.now(), gO = new T.BufferGeometry(); gO.setAttribute('position', new T.BufferAttribute(Obuf.subarray(0, nO * 9), 3)); gO.computeBoundsTree({ maxLeafTris: 8, indirect: true });
      let gG = null; if (nG) { gG = new T.BufferGeometry(); gG.setAttribute('position', new T.BufferAttribute(Gbuf.subarray(0, nG * 9), 3)); gG.computeBoundsTree({ maxLeafTris: 8, indirect: true }); }
      const bO = gO.boundsTree, bG = gG ? gG.boundsTree : null, ray = new T.Ray(), hp = new T.Vector3(), DS = T.DoubleSide; out.soup = { meshes, opaqueTris: nO, glassTris: nG, hiddenSlots, soupMs: Math.round(soupMs), bvhMs: Math.round(performance.now() - tV) };
      const ib = box => ray.intersectsBox(box) ? 1 : 0, it = t3 => ray.intersectTriangle(t3.a, t3.b, t3.c, false, hp) !== null, byD = (a, c) => a.distance - c.distance; let rays = 0;
      const trans = (x, y, z, dx, dy, dz) => { rays++; ray.origin.set(x, y, z); ray.direction.set(dx, dy, dz); if (bO.shapecast({ intersectsBounds: ib, intersectsTriangle: it })) return 0; if (!bG) return 1;
        const hs = bG.raycast(ray, DS); if (!hs.length) return 1; hs.sort(byD); let tv = 1, last = -1; for (const h of hs) { if (last < 0 || h.distance - last > 0.3) tv *= Gt[h.faceIndex]; last = h.distance + 0.01; } return tv; };
      const first = (P0, d, far) => { rays++; ray.origin.copy(P0); ray.direction.copy(d); const h = bO.raycastFirst(ray, DS, 0, far); return h; };
      const firstG = (P0, d, far) => { if (!bG) return null; ray.origin.copy(P0); ray.direction.copy(d); return bG.raycastFirst(ray, DS, 0, far); };
      const nrmOf = h => { const f = h.faceIndex * 9, a = new T.Vector3(Obuf[f], Obuf[f + 1], Obuf[f + 2]), b2 = new T.Vector3(Obuf[f + 3], Obuf[f + 4], Obuf[f + 5]), c = new T.Vector3(Obuf[f + 6], Obuf[f + 7], Obuf[f + 8]); return b2.sub(a).cross(c.sub(a)).normalize(); };
      const muOf = u => { let m = Math.sqrt(u); for (let i = 0; i < 12; i++) { const f = (m * m / 2 + 2 * m * m * m / 3) * 6 / 7 - u, df = (m + 2 * m * m) * 6 / 7; m -= f / (df || 1e-6); m = Math.min(1, Math.max(0, m)); } return m; };
      let seed = 1234567; const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }, S = Math.round(Math.sqrt(NR));
      const Eup = (x, y, z) => { let E = 0; for (let a = 0; a < S; a++) for (let c = 0; c < S; c++) { const mu = muOf((a + rnd()) / S), ph = 2 * Math.PI * (c + rnd()) / S, r = Math.sqrt(1 - mu * mu); E += trans(x, y, z, r * Math.cos(ph), mu, r * Math.sin(ph)); } return E / (S * S); };
      const Enrm = (x, y, z, n) => { const t1v = new T.Vector3(Math.abs(n.y) < 0.9 ? 0 : 1, Math.abs(n.y) < 0.9 ? 1 : 0, 0).cross(n).normalize(), t2v = new T.Vector3().crossVectors(n, t1v); let E = 0;
        for (let a = 0; a < S; a++) for (let c = 0; c < S; c++) { const u = (a + rnd()) / S, ct = Math.sqrt(1 - u), st = Math.sqrt(u), ph = 2 * Math.PI * (c + rnd()) / S;   // cosine-weighted about n
          const dx = n.x * ct + t1v.x * st * Math.cos(ph) + t2v.x * st * Math.sin(ph), dy = n.y * ct + t1v.y * st * Math.cos(ph) + t2v.y * st * Math.sin(ph), dz = n.z * ct + t1v.z * st * Math.cos(ph) + t2v.z * st * Math.sin(ph);
          if (dy <= 0) continue; E += (3 / 7) * (1 + 2 * dy) * trans(x, y, z, dx, dy, dz); } return E / (S * S); };
      const tT = performance.now(), up = new T.Vector3(0, 1, 0), dn = new T.Vector3(0, -1, 0);
      if (havePts) {} else if (t1) pts = t1.pts.map(q => ({ p: q.p, E1: q.E, sun: q.sun, up: q.up, upD: q.upD }));
      else { // new floor points (v1 rule, BVH rays): covered cell on a SOLID cell, every 2nd i/k, shuffled, snapped to a horizontal face within 1.2 m
        const nx = Z.nx, ny = Z.ny, nz = Z.nz, nxy = nx * ny, cand = []; for (let k = 0; k < nz; k += 2) for (let i = 0; i < nx; i += 2) for (let j = 1; j < ny; j++) { const c = i + j * nx + k * nxy, vv = Z.zone[c]; if (vv === LZ.SOLID || vv === 0 || Z.zone[c - nx] !== LZ.SOLID) continue; cand.push(c); }
        let s2 = 99; const r2 = () => { s2 = (s2 * 16807) % 2147483647; return s2 / 2147483647; }; for (let q = cand.length - 1; q > 0; q--) { const j = Math.floor(r2() * (q + 1)); [cand[q], cand[j]] = [cand[j], cand[q]]; }
        const sd = A.sun.position.clone().sub(A.sun.target.position).normalize(); pts = [];
        for (const c of cand) { if (pts.length >= MAXP) break; const i = c % nx, j = ((c / nx) | 0) % ny, k = (c / nxy) | 0, P0 = new T.Vector3(Z.org.x + (i + 0.5) * Z.cell, Z.org.y + (j + 0.5) * Z.cell, Z.org.z + (k + 0.5) * Z.cell);
          const h = first(P0, dn, 1.2); if (!h) continue; if (Math.abs(nrmOf(h).y) < 0.9) continue; const F0 = h.point.clone().add(new T.Vector3(0, 0.03, 0));
          const sb = first(F0, sd, 500), uu = first(F0, up, 15), sunT = sb ? 0 : trans(F0.x, F0.y, F0.z, sd.x, sd.y, sd.z);
          pts.push({ p: h.point.toArray().map(x => +x.toFixed(3)), sun: sb ? clsL[0x7fff & Ocls[sb.faceIndex]] : (sunT > 0 ? 'open' : 'glass0'), up: uu ? clsL[0x7fff & Ocls[uu.faceIndex]] : null, upD: uu ? +uu.distance.toFixed(2) : null }); } }
      if (!havePts) for (const q of pts) q.E = +Eup(q.p[0], q.p[1] + 0.03, q.p[2]).toFixed(4);
      const tW = performance.now(); if (!havePts) walls = [];
      if (WALLS && !havePts) { const D4 = [new T.Vector3(1, 0, 0), new T.Vector3(-1, 0, 0), new T.Vector3(0, 0, 1), new T.Vector3(0, 0, -1)];
        pts.forEach((q, fi) => { const O = new T.Vector3(q.p[0], q.p[1] + 1.2, q.p[2]); let best = null;
          for (const d of D4) { const h = first(O, d, 3); if (!h || (best && h.distance >= best.h.distance)) continue; const hg = firstG(O, d, h.distance); if (hg) continue; best = { h, d }; }
          if (!best) return; const n = nrmOf(best.h); if (Math.abs(n.y) > 0.3) return; if (n.dot(best.d) > 0) n.negate(); n.y = 0; n.normalize(); const w = best.h.point, hc = 0.5 * Z.cell;
          walls.push({ p: w.toArray().map(x => +x.toFixed(3)), n: n.toArray().map(x => +x.toFixed(3)), fi, cls: clsL[0x7fff & Ocls[best.h.faceIndex]], Eh: +Eup(w.x + n.x * hc, w.y, w.z + n.z * hc).toFixed(4), En: +Enrm(w.x + n.x * 0.03, w.y, w.z + n.z * 0.03, n).toFixed(4) }); }); }
      // OPEN floor points (zone 0 = OPEN-TO-SKY on the boundary grid, the field forces F = 1 there): outdoor / courtyard / under-stair /
      // under-canopy-of-occluders floors. Same snap rule; E the floor integrand; upHit = class of the first opaque hit straight up (15 m)
      const tO = performance.now(); if (!opens) { const nx = Z.nx, ny = Z.ny, nz = Z.nz, nxy = nx * ny, cand = []; for (let k = 2; k < nz - 2; k += 2) for (let i = 2; i < nx - 2; i += 2) for (let j = 1; j < ny; j++) { const c = i + j * nx + k * nxy; if (Z.zone[c] !== 0 || Z.zone[c - nx] !== LZ.SOLID) continue; cand.push(c); }
        let s3 = 77; const r3 = () => { s3 = (s3 * 16807) % 2147483647; return s3 / 2147483647; }; for (let q = cand.length - 1; q > 0; q--) { const j = Math.floor(r3() * (q + 1)); [cand[q], cand[j]] = [cand[j], cand[q]]; }
        opens = []; for (const c of cand) { if (opens.length >= (MAXP >> 1)) break; const i = c % nx, j = ((c / nx) | 0) % ny, k = (c / nxy) | 0, P0 = new T.Vector3(Z.org.x + (i + 0.5) * Z.cell, Z.org.y + (j + 0.5) * Z.cell, Z.org.z + (k + 0.5) * Z.cell);
          const h = first(P0, dn, 1.2); if (!h) continue; if (Math.abs(nrmOf(h).y) < 0.9) continue; const F0 = h.point.clone().add(new T.Vector3(0, 0.03, 0)), uu = first(F0, up, 15);
          opens.push({ p: h.point.toArray().map(x => +x.toFixed(3)), E: +Eup(F0.x, F0.y, F0.z).toFixed(4), up: uu ? clsL[0x7fff & Ocls[uu.faceIndex]] : null, upD: uu ? +uu.distance.toFixed(2) : null }); } }
      out.openMs = Math.round(performance.now() - tO);
      { // Es: the SAME truth over the soup-like subset only (diagnostic: F - Es = the field pass's own error; Es - E = the opaque-set gap)
        let n2 = 0, g2 = 0; for (let t = 0; t < nO; t++) if (Ocls[t] & 0x8000) n2++; for (let t = 0; t < nG; t++) if (Gs[t]) g2++;
        const O2 = new Float32Array(n2 * 9), G2 = new Float32Array(g2 * 9), T2 = new Float32Array(g2); n2 = 0; g2 = 0;
        for (let t = 0; t < nO; t++) if (Ocls[t] & 0x8000) { O2.set(Obuf.subarray(t * 9, t * 9 + 9), n2 * 9); n2++; } for (let t = 0; t < nG; t++) if (Gs[t]) { G2.set(Gbuf.subarray(t * 9, t * 9 + 9), g2 * 9); T2[g2] = Gt[t]; g2++; }
        const h2 = new T.BufferGeometry(); h2.setAttribute('position', new T.BufferAttribute(O2, 3)); h2.computeBoundsTree({ maxLeafTris: 8, indirect: true }); let hg2 = null; if (g2) { hg2 = new T.BufferGeometry(); hg2.setAttribute('position', new T.BufferAttribute(G2, 3)); hg2.computeBoundsTree({ maxLeafTris: 8, indirect: true }); }
        const b2O = h2.boundsTree, b2G = hg2 ? hg2.boundsTree : null; out.soup.soupLikeOpaque = n2; out.soup.soupLikeGlass = g2;
        const trans2 = (x, y, z, dx, dy, dz) => { rays++; ray.origin.set(x, y, z); ray.direction.set(dx, dy, dz); if (b2O.shapecast({ intersectsBounds: ib, intersectsTriangle: it })) return 0; if (!b2G) return 1;
          const hs = b2G.raycast(ray, DS); if (!hs.length) return 1; hs.sort(byD); let tv = 1, last = -1; for (const h of hs) { if (last < 0 || h.distance - last > 0.3) tv *= T2[h.faceIndex]; last = h.distance + 0.01; } return tv; };
        const Es = (x, y, z) => { let E = 0; for (let a = 0; a < S; a++) for (let c = 0; c < S; c++) { const mu = muOf((a + rnd()) / S), ph = 2 * Math.PI * (c + rnd()) / S, r = Math.sqrt(1 - mu * mu); E += trans2(x, y, z, r * Math.cos(ph), mu, r * Math.sin(ph)); } return E / (S * S); };
        const hc2 = 0.5 * Z.cell; for (const q of pts) q.Es25 = +Es(q.p[0], q.p[1] + hc2, q.p[2]).toFixed(4); for (const q of opens) q.Es25 = +Es(q.p[0], q.p[1] + hc2, q.p[2]).toFixed(4);
        if (DIAGC) { let nc = 0; for (const q of pts) { const c = cen({ x: q.p[0], y: q.p[1], z: q.p[2] }, { x: 0, y: 1, z: 0 }); if (c) { q.cenDy = +(c[1] - q.p[1]).toFixed(3); q.EsC = +Es(c[0], c[1], c[2]).toFixed(4); nc++; } } out.diagC = nc; for (const q of (walls || [])) { const c = cen({ x: q.p[0], y: q.p[1], z: q.p[2] }, { x: q.n[0], y: q.n[1], z: q.n[2] }); if (c) { q.cenOff = +((c[0] - q.p[0]) * q.n[0] + (c[2] - q.p[2]) * q.n[2]).toFixed(3); q.EsC = +Es(c[0], c[1], c[2]).toFixed(4); } } }
        for (const q of (walls || [])) q.Esh = +Es(q.p[0] + q.n[0] * hc2, q.p[1], q.p[2] + q.n[2] * hc2).toFixed(4); h2.disposeBoundsTree(); if (hg2) hg2.disposeBoundsTree(); }
      // E25: the floor integrand at p + 0.5 cell (0.25 m) up = where fieldRead's trilinear stencil sits (the field's own sampling height)
      for (const q of pts) if (q.E25 == null) q.E25 = +Eup(q.p[0], q.p[1] + 0.5 * Z.cell, q.p[2]).toFixed(4);
      for (const q of opens) if (q.E25 == null) q.E25 = +Eup(q.p[0], q.p[1] + 0.5 * Z.cell, q.p[2]).toFixed(4);
      out.truthMs = Math.round(performance.now() - tT); out.wallMs = Math.round(performance.now() - tW); out.truthRays = rays; out.usPerRay = +(out.truthMs * 1000 / rays).toFixed(2); out.newTruth = { pts, walls, opens, flipNeeded: !havePts };
      // wall-between for every candidate neighbour pair is judged below from this BVH: keep a closure on window for the pair test
      window.__lgBlocked = (a, c) => { const P0 = new T.Vector3(a[0], a[1] + 0.3, a[2]), P1 = new T.Vector3(c[0], c[1] + 0.3, c[2]), d = P1.clone().sub(P0), l = d.length(); d.normalize(); return !!first(P0, d, l); };
      window.__lgDispose = () => { gO.disposeBoundsTree(); if (gG) gG.disposeBoundsTree(); }; }
    const upV = new T.Vector3(0, 1, 0), ircAll = F.ircAll || null, zOf = sf => (sf.zone > 0 && sf.zone !== LZ.SOLID) ? (sf.zone & 0x3fff) : sf.zone;
    out.M = pts.map(q => { const sf = LZ.skyField({ x: q.p[0], y: q.p[1], z: q.p[2] }, upV), z = zOf(sf); return { F: sf.F == null ? null : +sf.F.toFixed(4), z, ir: ircAll && z > 0 && z < ircAll.length ? +ircAll[z].toFixed(4) : null }; });
    out.O = (opens || []).map(q => { const sf = LZ.skyField({ x: q.p[0], y: q.p[1], z: q.p[2] }, upV); return { F: sf.F == null ? null : +sf.F.toFixed(4), z: zOf(sf) }; });
    out.W = (walls || []).map(q => { const sf = LZ.skyField({ x: q.p[0], y: q.p[1], z: q.p[2] }, { x: q.n[0], y: q.n[1], z: q.n[2] }), z = zOf(sf); return { F: sf.F == null ? null : +sf.F.toFixed(4), z }; });
    out.fieldCached = !!F.cached; out.sfa = F.skyExactAll ? F.skyExactAll : null; return out; }, truth, t1, +(process.env.MAXP || 3000), +(process.env.NR || 256), process.env.WALLS !== '0', process.env.DIAGC === '1');
  if (R.err) { console.log('FATAL ' + R.err); process.exit(1); }
  let tr = truth; if (R.newTruth) { tr = { v: 2, bld: meta.bld, guids: meta.guids, nr: +(process.env.NR || 256), made: new Date().toISOString(), soup: R.soup, pts: R.newTruth.pts, walls: R.newTruth.walls, opens: R.newTruth.opens, flip: truth && truth.flip }; fs.writeFileSync(CF, JSON.stringify(tr)); }
  const med = v => { v = v.slice().sort((x, y) => x - y); return v.length ? v[v.length >> 1] : null; };
  const rows = tr.pts.map((q, i) => Object.assign({}, R.M[i], q)).filter(r => r.F != null), wseen = new Set(), wrows = (tr.walls || []).map((q, i) => Object.assign({}, R.W[i], q, { E: q.Eh })).filter(r => { const k = r.p.join(','); if (r.F == null || wseen.has(k)) return false; wseen.add(k); return true; });
  const orows = (tr.opens || []).map((q, i) => Object.assign({}, R.O[i], q)).filter(r => r.F != null);
  const isOver = r => r.F - r.E > 0.02 && r.F > 1.5 * r.E, isUnder = r => r.E - r.F > 0.02 && r.E > 1.5 * r.F;
  // BLOTCH pairs (1 m neighbours, same floor |dy| < 0.3, 0.6 < d < 1.6; walls: also same normal (dot > 0.9) and coplanar within 0.1 m)
  // skyJump = |dF| > 0.02 while |dE| < 0.005; zoneFlip = different zones, same up class — now split by a WALL-BETWEEN ray (truth BVH;
  // only computable in a run that built the truth BVH, else 'noTest'): flipOpen = no opaque hit between the two points (+0.3 m) = the defect class
  const pairsOf = (rs, wall) => { const idx = new Map(), P = []; rs.forEach(r => { const k = Math.floor(r.p[0] / 2) + ',' + Math.floor(r.p[2] / 2); if (!idx.has(k)) idx.set(k, []); idx.get(k).push(r); });
    rs.forEach(r => { const gx = Math.floor(r.p[0] / 2), gz = Math.floor(r.p[2] / 2); for (let a = -1; a <= 1; a++) for (let c = -1; c <= 1; c++) for (const s2 of (idx.get((gx + a) + ',' + (gz + c)) || [])) { if (s2 === r || s2.p[0] < r.p[0] || (s2.p[0] === r.p[0] && s2.p[2] <= r.p[2])) continue;
      const dy = Math.abs(s2.p[1] - r.p[1]), d = Math.hypot(s2.p[0] - r.p[0], s2.p[2] - r.p[2]); if (dy > 0.3 || d < 0.6 || d > 1.6) continue;
      if (wall) { const dot = r.n[0] * s2.n[0] + r.n[2] * s2.n[2], off = Math.abs((s2.p[0] - r.p[0]) * r.n[0] + (s2.p[2] - r.p[2]) * r.n[2]); if (dot < 0.9 || off > 0.1) continue; } P.push([r, s2]); } }); return P; };
  const flipPairs = [], judge = (rs, wall) => { const P = pairsOf(rs, wall), o = { pairs: P.length, skyJump: 0, jumpBoth: 0, zoneFlip: 0, irStep: 0, sample: [] };
    P.forEach(([r, s2]) => { if (Math.abs(s2.F - r.F) > 0.02 && Math.abs(s2.E - r.E) < 0.005) { o.skyJump++; if (o.sample.length < 5) o.sample.push({ a: r.p, b: s2.p, F: [r.F, s2.F], E: [r.E, s2.E] }); }
      if (!wall && r.z > 0 && s2.z > 0 && r.z !== s2.z && r.up === s2.up) { o.zoneFlip++; flipPairs.push([r.p, s2.p, r.ir != null && s2.ir != null && Math.abs(r.ir - s2.ir) > 0.005]); } });
    return o; };
  const stat = (rs, wall) => { const over = rs.filter(isOver), under = rs.filter(isUnder), bl = judge(rs, wall);
    return { points: rs.length, skyOver: over.length, skyUnder: under.length, medAbsDF: +med(rs.map(r => Math.abs(r.F - r.E))).toFixed(4), meanAbsDF: +(rs.reduce((s, r) => s + Math.abs(r.F - r.E), 0) / (rs.length || 1)).toFixed(4), skyJump: bl.skyJump, pairs: bl.pairs, zoneFlip: bl.zoneFlip,
      worstOver: over.sort((a, c) => (c.F - c.E) - (a.F - a.E)).slice(0, 5).map(r => ({ p: r.p, F: r.F, E: r.E, up: r.up || r.cls })), worstUnder: under.sort((a, c) => (c.E - c.F) - (a.E - a.F)).slice(0, 5).map(r => ({ p: r.p, F: r.F, E: r.E, up: r.up || r.cls })), jumpSample: bl.sample }; };
  const SF = stat(rows, false), SW = stat(wrows, true);
  let flip = 'noTest (truth cached: no BVH in this run)'; if (flipPairs.length && R.newTruth && R.newTruth.flipNeeded) { flip = await p.evaluate(fp => { let open = 0, walled = 0, irOpen = 0; fp.forEach(([a, c, ir]) => { if (window.__lgBlocked(a, c)) walled++; else { open++; if (ir) irOpen++; } }); return { open, walled, irStepOpen: irOpen }; }, flipPairs); }
  if (R.newTruth && R.newTruth.flipNeeded) { tr.flip = flip; fs.writeFileSync(CF, JSON.stringify(tr)); } else if (tr.flip) flip = Object.assign({ cachedFromTruthRun: 1 }, tr.flip);
  const SO = stat(orows, false), under = orows.filter(r => r.up), SOu = { n: under.length, skyOver: under.filter(isOver).length, skyUnder: under.filter(isUnder).length, medAbsDF: under.length ? +med(under.map(r => Math.abs(r.F - r.E))).toFixed(4) : null, F1: under.filter(r => r.F >= 0.999).length };
  const E1 = rows.filter(r => r.E1 != null).map(r => Object.assign({}, r, { E: r.E1 })), S1 = E1.length ? { skyOver: E1.filter(isOver).length, skyUnder: E1.filter(isUnder).length, medAbsDF: +med(E1.map(r => Math.abs(r.F - r.E))).toFixed(4) } : null;
  const r25 = rows.filter(r => r.E25 != null).map(r => Object.assign({}, r, { E: r.E25 })), S25 = { skyOver: r25.filter(isOver).length, skyUnder: r25.filter(isUnder).length, medAbsDF: +med(r25.map(r => Math.abs(r.F - r.E))).toFixed(4), meanAbsDF: +(r25.reduce((s, r) => s + Math.abs(r.F - r.E), 0) / (r25.length || 1)).toFixed(4), skyJump: (() => { const n0 = flipPairs.length, j = judge(r25, false).skyJump; flipPairs.length = n0; return j; })() };
  const o25 = orows.filter(r => r.E25 != null).map(r => Object.assign({}, r, { E: r.E25 })), SO25 = { skyOver: o25.filter(isOver).length, skyUnder: o25.filter(isUnder).length, meanAbsDF: +(o25.reduce((s, r) => s + Math.abs(r.F - r.E), 0) / (o25.length || 1)).toFixed(4) };
  const sub = (rs, key) => { const q = rs.filter(r => r[key] != null).map(r => Object.assign({}, r, { E: r[key] })); return { skyOver: q.filter(isOver).length, skyUnder: q.filter(isUnder).length, meanAbsDF: +(q.reduce((s, r) => s + Math.abs(r.F - r.E), 0) / (q.length || 1)).toFixed(4) }; };
  const SES = { floor: sub(rows, 'Es25'), wall: sub(wrows, 'Esh'), open: sub(orows, 'Es25') };
  const wn = wrows.map(r => Object.assign({}, r, { E: r.En })), SWn = { skyOver: wn.filter(isOver).length, skyUnder: wn.filter(isUnder).length, medAbsDF: wn.length ? +med(wn.map(r => Math.abs(r.F - r.E))).toFixed(4) : null };
  const head = 'bld=' + meta.bld + ' truth=' + (R.newTruth ? 'computed v2 ' + R.truthMs + 'ms rays=' + R.truthRays + ' usPerRay=' + R.usPerRay + ' soup=' + JSON.stringify(R.soup) : 'cached ' + CF.split('/').pop()) + ' nr=' + tr.nr + ' fieldCached=' + R.fieldCached + ' buildMs=' + R.buildMs + ' fieldMs=' + R.fieldMs + ' loadMs=' + tLoad + (R.sfa ? ' sfa=' + JSON.stringify(R.sfa) : '');
  const lf = '§LIGHT_GRID ' + head + ' FLOOR ' + JSON.stringify(SF) + ' zoneFlipWallTest=' + JSON.stringify(flip) + ' v1truth(32ray,glassPerFace)=' + JSON.stringify(S1) + ' atFieldHeight(E25: truth at p+0.25m)=' + JSON.stringify(S25);
  const lw = '§LIGHT_GRID_WALL bld=' + meta.bld + (wrows.length ? '' : ' VACUOUS (no wall points)') + ' WALL(Eh=field integrand at p+0.5cell n) ' + JSON.stringify(SW) + ' vsEn(normal-hemisphere irradiance)=' + JSON.stringify(SWn) + ' wallS=' + Math.round((Date.now() - t00) / 1000);
  const lo = '§LIGHT_GRID_OPEN bld=' + meta.bld + (orows.length ? '' : ' VACUOUS (no open floor points)') + ' OPEN-CELL FLOORS (zone 0: the field forces F = 1) ' + JSON.stringify({ points: SO.points, skyOver: SO.skyOver, skyUnder: SO.skyUnder, medAbsDF: SO.medAbsDF, meanAbsDF: SO.meanAbsDF, skyJump: SO.skyJump, pairs: SO.pairs, worstOver: SO.worstOver }) + ' underSomething(upHit<15m)=' + JSON.stringify(SOu) + ' atFieldHeight(E25)=' + JSON.stringify(SO25);
  const les = '§LIGHT_GRID_SOUPTRUTH bld=' + meta.bld + ' (F vs Es = the same truth over the field soup\'s opaque set only: BOUNDARY + ARC/STR OCCLUDERS; F - Es = the pass\'s own error, Es - E = opaque-set gap) ' + JSON.stringify(SES);
  if (R.diagC) { const q = rows.filter(r => r.EsC != null), ovC = q.filter(r => r.F - r.EsC > 0.02 && r.F > 1.5 * r.EsC), ov25 = q.filter(r => r.F - r.Es25 > 0.02 && r.F > 1.5 * r.Es25);
    L.push('§LIGHT_GRID_STENCIL bld=' + meta.bld + ' points=' + q.length + ' cenDy median=' + med(q.map(r => r.cenDy)) + ' p90=' + q.map(r => r.cenDy).sort((a, c) => a - c)[Math.floor(q.length * 0.9)] + ' | vs Es at p+0.25: over ' + ov25.length + ' meanAbs ' + (q.reduce((s, r) => s + Math.abs(r.F - r.Es25), 0) / q.length).toFixed(4) + ' | vs Es at the stencil centroid: over ' + ovC.length + ' meanAbs ' + (q.reduce((s, r) => s + Math.abs(r.F - r.EsC), 0) / q.length).toFixed(4) + ' worst=' + JSON.stringify(ovC.sort((a, c) => (c.F - c.EsC) - (a.F - a.EsC)).slice(0, 6).map(r => ({ p: r.p, F: r.F, EsC: r.EsC, Es25: r.Es25, cenDy: r.cenDy })))); console.log(L[L.length - 1]);
    const qw = wrows.filter(r => r.EsC != null), md2 = v => v.slice().sort((a, c) => a - c)[v.length >> 1];
    L.push('§LIGHT_GRID_STENCIL_WALL bld=' + meta.bld + ' points=' + qw.length + ' centroid offset from the wall median=' + md2(qw.map(r => r.cenOff)) + ' m | vs Es at p+0.25n: over ' + qw.filter(r => r.F - r.Esh > 0.02 && r.F > 1.5 * r.Esh).length + ' meanAbs ' + (qw.reduce((s, r) => s + Math.abs(r.F - r.Esh), 0) / qw.length).toFixed(4) + ' | vs Es at the stencil centroid: over ' + qw.filter(r => r.F - r.EsC > 0.02 && r.F > 1.5 * r.EsC).length + ' under ' + qw.filter(r => r.EsC - r.F > 0.02 && r.EsC > 1.5 * r.F).length + ' meanAbs ' + (qw.reduce((s, r) => s + Math.abs(r.F - r.EsC), 0) / qw.length).toFixed(4)); console.log(L[L.length - 1]); }
  L.push(lf, lw, lo, les); console.log(les); console.log(lo.slice(0, 1500)); fs.mkdirSync(__dirname + '/lg', { recursive: true }); const tag = meta.bld + (process.env.SUF || ''); fs.writeFileSync(__dirname + '/lg/' + tag + '.log', L.join('\n') + '\n');
  fs.writeFileSync(__dirname + '/lg/' + tag + '.rows.json', JSON.stringify({ floor: rows, wall: wrows })); console.log(lf.slice(0, 2500)); console.log(lw.slice(0, 2000)); await b.close(); })().catch(e => { console.log('FATAL ' + e.message); process.exit(1); });
