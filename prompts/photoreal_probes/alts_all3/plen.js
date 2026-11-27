// plenum clip probe: what lights the clipped interior pixels (hit point, nearest lamps, readback terms)
const puppeteer = require('/home/red1/bim-compiler/node_modules/puppeteer'), fs = require('fs'), os = require('os'), path = require('path');
const PORT = +process.argv[2] || 8642, OUT = process.argv[3] || '/tmp/alts_all4/probe/plen.json', EXTRA = process.argv[4] || '&ghost=1';
const CAM = [-20.496, -5.619, -34.439], TGT = [-23.527, -6.051, -22.952];
const DIAG = async () => {
  const med = a => { const so = a.filter(x => x != null && isFinite(x)).sort((x, y) => x - y); return so.length ? so[Math.floor(so.length / 2)] : null; };
  const A = window.APP, R = A.renderer, THREE = window.THREE, SL = window.SourcedLight, D = window.__giStillDebugCanvas, out = {};
  const cw = D.under.width, ch = D.under.height, app = D.under.getContext('2d').getImageData(0, 0, cw, ch).data;
  const clip = []; for (let p = 0; p < cw * ch; p++) { const i = p * 4; if (0.2126 * app[i] + 0.7152 * app[i + 1] + 0.0722 * app[i + 2] >= 250) clip.push(p); }
  out.appClipPct = +(100 * clip.length / (cw * ch)).toFixed(2);
  const W = 416, H = 216, rt = new THREE.WebGLRenderTarget(W, H, { type: THREE.FloatType, depthBuffer: true }), prev = R.getRenderTarget(), bg = A.scene.background;
  const rd = md => { SL.debugZones(md); A.scene.background = null; R.setRenderTarget(rt); R.clear(); R.render(A.scene, A.camera); R.render(A.scene, A.camera); const b = new Float32Array(W * H * 4); R.readRenderTargetPixels(rt, 0, 0, W, H, b); R.setRenderTarget(prev); SL.debugZones(0); A.scene.background = bg; return b; };
  const L0 = rd(0), IR = rd(9), CV = rd(11), AL = rd(13);
  const at = (b, p) => { const x = Math.floor((p % cw) / cw * W), y = H - 1 - Math.floor(Math.floor(p / cw) / ch * H), i = (y * W + x) * 4; return [b[i], b[i + 1], b[i + 2], b[i + 3]]; };
  const lum = c => 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  const step = Math.max(1, Math.floor(clip.length / 300)), S = [];
  const meshes = []; A.scene.traverse(o => { if (o.visible && (o.isMesh || o.isInstancedMesh || o.isBatchedMesh) && o !== A._sky) meshes.push(o); });
  const rc = new THREE.Raycaster(), lamps = (A._lampData && A._lampData.lamps) || [];
  for (let k = 0; k < clip.length; k += step) { const p = clip[k], u = ((p % cw) + 0.5) / cw, v = (Math.floor(p / cw) + 0.5) / ch;
    rc.setFromCamera(new THREE.Vector2(u * 2 - 1, 1 - v * 2), A.camera); const h = rc.intersectObjects(meshes, false)[0];
    const s = { L: lum(at(L0, p)), IR: lum(at(IR, p)), cove: at(CV, p)[0], alb: lum(at(AL, p)) };
    if (h) { s.d = +h.distance.toFixed(2); s.cls = h.object.userData.ifcClass || h.object.name || h.object.type; const n = h.face ? h.face.normal.clone().transformDirection(h.object.matrixWorld) : null;
      let best = null; lamps.forEach(l => { const dx = l.x - h.point.x, dy = l.y - h.point.y, dz = l.z - h.point.z, d2 = dx * dx + dy * dy + dz * dz, d = Math.sqrt(d2); const cs = n ? Math.abs((dx * n.x + dy * n.y + dz * n.z) / d) : 1; const e = l.I * cs / Math.max(d2, 1e-4); if (!best || e > best.e) best = { e: +e.toFixed(2), d: +d.toFixed(3), I: +l.I.toFixed(3), cls: l.guid }; });
      s.lamp = best; s.y = +h.point.y.toFixed(2); }
    S.push(s); }
  // sun: ray from each sampled hit toward the sun — does it escape (an opening / gap) or hit geometry?
  const sun = A.sun; let sd = null; if (sun) { sd = sun.position.clone().sub(sun.target ? sun.target.position : new THREE.Vector3()).normalize(); out.sunDir = sd.toArray().map(v => +v.toFixed(3)); out.sunI = sun.intensity; }
  let esc = 0, blocked = 0, firstBlock = {}; const rs = new THREE.Raycaster();
  if (sd) for (let k = 0; k < clip.length; k += step * 3) { const p = clip[k], u = ((p % cw) + 0.5) / cw, v = (Math.floor(p / cw) + 0.5) / ch; rc.setFromCamera(new THREE.Vector2(u * 2 - 1, 1 - v * 2), A.camera); const h = rc.intersectObjects(meshes, false)[0]; if (!h) continue;
    rs.set(h.point.clone().addScaledVector(sd, 0.02), sd); const hb = rs.intersectObjects(meshes, false).filter(q => { const m = Array.isArray(q.object.material) ? q.object.material[0] : q.object.material; return m && !(m.transparent && m.opacity < 0.95) && m.visible !== false; })[0];
    if (!hb) esc++; else { blocked++; const c = (hb.object.userData.ifcClass || hb.object.type) + (hb.object.castShadow ? '' : '(noCast)') + ':' + hb.distance.toFixed(1); firstBlock[c] = (firstBlock[c] || 0) + 1; } }
  out.sunRay = { escaped: esc, blocked, firstBlock: Object.entries(firstBlock).sort((a, b) => b[1] - a[1]).slice(0, 8) };
  { const dl = []; A.scene.traverse(o => { if (o.isDirectionalLight && o.visible) dl.push(o); }); out.dirLights = dl.map(l => l.name + ':' + l.intensity.toFixed(2) + ':cast' + l.castShadow); dl.forEach(l => { l.visible = false; }); const Ls = rd(0); dl.forEach(l => { l.visible = true; }); const Ls2 = rd(0);
    out.medNoDir = med(clip.filter((_, k) => k % step === 0).map(p => lum(at(Ls, p)))); out.medRestored = med(clip.filter((_, k) => k % step === 0).map(p => lum(at(Ls2, p)))); }
  { const sh = A.sun.shadow, c = sh.camera; c.updateMatrixWorld(true); out.sunShadow = { map: sh.mapSize.toArray(), cam: [c.left, c.right, c.top, c.bottom, c.near, c.far].map(v => +(+v).toFixed(2)), bias: sh.bias, normalBias: sh.normalBias, radius: sh.radius, autoUpdate: sh.autoUpdate, needsUpdate: sh.needsUpdate, pos: A.sun.position.toArray().map(v => +v.toFixed(1)), tgt: A.sun.target.position.toArray().map(v => +v.toFixed(1)) };
    const pv = new THREE.Matrix4().multiplyMatrices(c.projectionMatrix, c.matrixWorldInverse); let inside = 0, outside = 0; const ex = [];
    for (let k = 0; k < clip.length; k += step * 3) { const p = clip[k], u = ((p % cw) + 0.5) / cw, v = (Math.floor(p / cw) + 0.5) / ch; rc.setFromCamera(new THREE.Vector2(u * 2 - 1, 1 - v * 2), A.camera); const h = rc.intersectObjects(meshes, false)[0]; if (!h) continue;
      const q = h.point.clone().applyMatrix4(pv); if (Math.abs(q.x) <= 1 && Math.abs(q.y) <= 1 && q.z >= -1 && q.z <= 1) inside++; else { outside++; if (ex.length < 3) ex.push(q.toArray().map(x => +x.toFixed(2))); } }
    out.sunShadowCover = { inside, outside, ex };
    const casc = []; A.scene.traverse(o => { if (o.isDirectionalLight && /Cascade/.test(o.name)) { const cc = o.shadow.camera; casc.push({ n: o.name, I: o.intensity, vis: o.visible, map: o.shadow.mapSize.x, cam: [cc.left, cc.right, cc.top, cc.bottom].map(v => +(+v).toFixed(1)) }); } }); out.cascades = casc;
    // occluder material of the blocking hits
    const oc = {}; for (let k = 0; k < clip.length; k += step * 6) { const p = clip[k], u = ((p % cw) + 0.5) / cw, v = (Math.floor(p / cw) + 0.5) / ch; rc.setFromCamera(new THREE.Vector2(u * 2 - 1, 1 - v * 2), A.camera); const h = rc.intersectObjects(meshes, false)[0]; if (!h) continue;
      rs.set(h.point.clone().addScaledVector(sd, 0.02), sd); const hb = rs.intersectObjects(meshes, false)[0]; if (!hb) continue; const m = Array.isArray(hb.object.material) ? hb.object.material[(hb.face && hb.face.materialIndex) || 0] : hb.object.material;
      const key = hb.object.type + '#' + hb.object.id + ' cast' + hb.object.castShadow + ' ' + m.type + ' tr' + m.transparent + ' op' + m.opacity + ' side' + m.side + ' cdm' + !!hb.object.customDepthMaterial + ' sh' + (m.shadowSide == null ? '-' : m.shadowSide) + ' vis' + hb.object.visible + ' layer' + hb.object.layers.mask + ' guid ' + (A.guidMap[hb.batchId != null ? hb.object.id + '_' + hb.batchId : hb.object.id] || '?') + ' d' + hb.distance.toFixed(2) + ' nDotSun ' + (hb.face ? hb.face.normal.clone().transformDirection(hb.object.matrixWorld).dot(sd).toFixed(2) : '?');
      oc[key] = (oc[key] || 0) + 1; } out.occluders = Object.entries(oc).slice(0, 8); }
  { const cams = []; A.scene.traverse(o => { if (o.isDirectionalLight && o.castShadow) cams.push(o); }); const pts = [];
    for (let k = 0; k < clip.length; k += step * 3) { const p = clip[k], u = ((p % cw) + 0.5) / cw, v = (Math.floor(p / cw) + 0.5) / ch; rc.setFromCamera(new THREE.Vector2(u * 2 - 1, 1 - v * 2), A.camera); const h = rc.intersectObjects(meshes, false)[0]; if (h) pts.push([h.point.clone(), h.distance]); }
    out.cascCover = cams.map(l => { const c = l.shadow.camera; c.updateMatrixWorld(true); const pv = new THREE.Matrix4().multiplyMatrices(c.projectionMatrix, c.matrixWorldInverse); let n = 0; pts.forEach(([q]) => { const r = q.clone().applyMatrix4(pv); if (Math.abs(r.x) <= 1 && Math.abs(r.y) <= 1 && r.z >= -1 && r.z <= 1) n++; }); return (l.name || 'sun') + ':' + n + '/' + pts.length; });
    // view depth of those points (camera space z)
    out.viewDepthMed = med(pts.map(([q]) => -q.clone().applyMatrix4(A.camera.matrixWorldInverse).z));
    // force a shadow re-render, then re-measure the clipped pixels
    cams.forEach(l => { l.shadow.needsUpdate = true; }); const au = R.shadowMap.autoUpdate; R.shadowMap.needsUpdate = true; const Lf = rd(0); R.shadowMap.autoUpdate = au;
    out.medAfterShadowRerender = med(clip.filter((_, k) => k % step === 0).map(p => lum(at(Lf, p)))); out.shadowMapAuto = au; }
  { const W = 160, H = 90, rt2 = new THREE.WebGLRenderTarget(W, H), dm = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, side: THREE.DoubleSide }), hid = [];
    A.scene.traverse(o => { if (!o.visible || !(o.isMesh || o.isSprite || o.isPoints || o.isLine)) return; const ms = o.material ? (Array.isArray(o.material) ? Array.from(o.material) : [o.material]) : [];
      const skip = o === A._sky || o.isSprite || o.isPoints || o.isLine || (o.userData && o.userData.skyPortal) || ms.every(m => !m || m.visible === false || m.isMeshBasicMaterial || m.isShaderMaterial || m.isRawShaderMaterial || (m.transparent && m.opacity < 0.95)); if (skip) { o.visible = false; hid.push(o); } });
    const buf = new Uint8Array(W * H * 4), ov = A.scene.overrideMaterial, bg0 = A.scene.background, cc = R.getClearColor(new THREE.Color()), ca = R.getClearAlpha();
    A.scene.overrideMaterial = dm; A.scene.background = null; R.setRenderTarget(rt2); R.setClearColor(0xffffff, 1); R.clear(); R.render(A.scene, A.camera); R.readRenderTargetPixels(rt2, 0, 0, W, H, buf); R.setRenderTarget(prev); A.scene.overrideMaterial = ov; A.scene.background = bg0; R.setClearColor(cc, ca); hid.forEach(o => { o.visible = true; });
    const k0 = 255 / 256 / 255, k1 = k0 / 256, k2 = k1 / 256, k3 = 1 / 16777216 / 255, fwd = A.camera.getWorldDirection(new THREE.Vector3()), v3 = new THREE.Vector3(); let cleared = 0, pts = 0; const zs = [], cmp = [];
    for (let py = 0; py < H; py++) for (let px = 0; px < W; px++) { const i = (py * W + px) * 4; if (buf[i] === 255 && buf[i + 1] === 255 && buf[i + 2] === 255 && buf[i + 3] === 255) { cleared++; continue; }
      const d = buf[i] * k0 + buf[i + 1] * k1 + buf[i + 2] * k2 + buf[i + 3] * k3; v3.set((px + 0.5) / W * 2 - 1, (py + 0.5) / H * 2 - 1, d * 2 - 1).unproject(A.camera);
      const z = (v3.x - A.camera.position.x) * fwd.x + (v3.y - A.camera.position.y) * fwd.y + (v3.z - A.camera.position.z) * fwd.z; zs.push(z); pts++;
      if ((px % 20 === 10) && (py % 15 === 7)) { rc.setFromCamera(new THREE.Vector2((px + 0.5) / W * 2 - 1, (py + 0.5) / H * 2 - 1), A.camera); const h = rc.intersectObjects(meshes, false)[0]; cmp.push([+z.toFixed(2), h ? +(-h.point.clone().applyMatrix4(A.camera.matrixWorldInverse).z).toFixed(2) : null]); } }
    out.rb = { cleared, pts, zMed: med(zs), zMin: Math.min(...zs), zMax: Math.max(...zs), camNear: A.camera.near, camFar: A.camera.far, cmp: cmp.slice(0, 30) }; rt2.dispose(); dm.dispose(); }
  { const cp = A.camera.position, near = []; A.scene.traverse(o => { if (!o.visible || !(o.isMesh)) return; const g = o.geometry; if (!g) return; if (!g.boundingBox) g.computeBoundingBox && g.computeBoundingBox();
      if (o.isBatchedMesh || o.isInstancedMesh) return; const bb = g.boundingBox && g.boundingBox.clone().applyMatrix4(o.matrixWorld); if (!bb) return; const d = bb.distanceToPoint(cp); if (d > 1.2) return;
      const ms = Array.isArray(o.material) ? Array.from(o.material) : [o.material]; near.push({ name: o.name, type: o.type, cls: o.userData.ifcClass || null, d: +d.toFixed(2), mat: ms.map(m => m && (m.type + ' op' + m.opacity + ' tr' + m.transparent + ' cw' + m.colorWrite + ' vis' + m.visible)).join('|'), rc: o.raycast === THREE.Mesh.prototype.raycast ? 'std' : 'custom', layer: o.layers.mask, keys: Object.keys(o.userData || {}).slice(0, 6).join('+'), parent: o.parent && (o.parent.name || o.parent.type) }); });
    const nb = []; A.scene.traverse(o => { if (!o.visible || !(o.isBatchedMesh || o.isInstancedMesh)) return; nb.push({ id: o.id, type: o.type, cls: o.userData.ifcClass || null, rc: o.raycast === Object.getPrototypeOf(o).raycast ? 'std' : 'custom', mat: (Array.isArray(o.material) ? o.material[0] : o.material).type }); });
    out.nearMeshes = near.slice(0, 20); out.customRaycast = nb.filter(x => x.rc !== 'std').slice(0, 10); out.nBatched = nb.length; }
  { const cl = clip.filter((_, k) => k % step === 0), m = b => med(cl.map(p => lum(at(b, p))));
    const sm = R.shadowMap; out.shadowMapEnabled = sm.enabled; out.sunCast = A.sun.castShadow;
    out.csmState = window.ShadowCascade && window.ShadowCascade.state ? JSON.stringify(window.ShadowCascade.state()).slice(0, 200) : 'n/a';
    A.sun.castShadow = false; sm.needsUpdate = true; out.medSunNoCast = m(rd(0)); A.sun.castShadow = true; sm.needsUpdate = true; out.medSunCastBack = m(rd(0));
    if (window.ShadowCascade && window.ShadowCascade.off) { window.ShadowCascade.off(); sm.needsUpdate = true; A.sun.shadow.needsUpdate = true; out.medCascadesOff = m(rd(0)); }
    // enlarge the sun's single map box to the whole building footprint (+-80 m) and re-render
    const c = A.sun.shadow.camera, sv = [c.left, c.right, c.top, c.bottom]; c.left = -80; c.right = 80; c.top = 80; c.bottom = -80; c.updateProjectionMatrix(); A.sun.shadow.needsUpdate = true; sm.needsUpdate = true; out.medSunBigBox = m(rd(0)); }
  { const W = 160, H = 90, rt2 = new THREE.WebGLRenderTarget(W, H), dm = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, side: THREE.DoubleSide }), buf = new Uint8Array(W * H * 4);
    const cand = []; A.scene.traverse(o => { if (!o.visible || !(o.isMesh || o.isSprite || o.isPoints || o.isLine)) return; const ms = o.material ? (Array.isArray(o.material) ? Array.from(o.material) : [o.material]) : [];
      const skip = o === A._sky || o.isSprite || o.isPoints || o.isLine || (o.userData && o.userData.skyPortal) || ms.every(m => !m || m.visible === false || m.isMeshBasicMaterial || m.isShaderMaterial || m.isRawShaderMaterial || (m.transparent && m.opacity < 0.95)); if (skip) { o.visible = false; cand.push([o, true]); } });
    const hidAll = cand.map(c => c[0]); const live = []; A.scene.traverse(o => { if (o.visible && (o.isMesh) && hidAll.indexOf(o) < 0) live.push(o); });
    const px0 = 10 + 20 * 0, py0 = 7 + 15 * 0 + 0; // first cmp sample with mismatch: (col 2) -> px 50? use px=50,py=7
    const PX = 50, PY = 7, idx = (PY * W + PX) * 4;
    const rdD = () => { const ov = A.scene.overrideMaterial, bg0 = A.scene.background; A.scene.overrideMaterial = dm; A.scene.background = null; R.setRenderTarget(rt2); R.setClearColor(0xffffff, 1); R.clear(); R.render(A.scene, A.camera); R.readRenderTargetPixels(rt2, 0, 0, W, H, buf); R.setRenderTarget(prev); A.scene.overrideMaterial = ov; A.scene.background = bg0; return [buf[idx], buf[idx + 1], buf[idx + 2], buf[idx + 3]].join(','); };
    const base = rdD(); let set = live.slice(), steps = 0;
    while (set.length > 1 && steps < 20) { steps++; const half = set.slice(0, set.length >> 1); half.forEach(o => { o.visible = false; }); const v = rdD(); half.forEach(o => { o.visible = true; }); set = (v !== base) ? half : set.slice(set.length >> 1); }
    const o = set[0]; const ms = o ? (Array.isArray(o.material) ? Array.from(o.material) : [o.material]) : [];
    out.nearCulprit = o ? { id: o.id, type: o.type, cls: o.userData.ifcClass || null, name: o.name, steps, keys: Object.keys(o.userData || {}).join('+'), mats: ms.map(m => m.type + ' cw' + m.colorWrite + ' dw' + m.depthWrite + ' op' + m.opacity + ' tr' + m.transparent + ' side' + m.side + ' name' + m.name).join('|'), bs: o.geometry && o.geometry.boundingSphere ? [o.geometry.boundingSphere.center.toArray().map(v => +v.toFixed(1)), +o.geometry.boundingSphere.radius.toFixed(1)] : null, frustumCulled: o.frustumCulled, parent: o.parent && (o.parent.name || o.parent.type), live: live.length } : null;
    hidAll.forEach(x => { x.visible = true; }); rt2.dispose(); dm.dispose(); }
  out.n = S.length; out.samples = S.slice(0, 40);
  out.med = { L: med(S.map(s => s.L)), IR: med(S.map(s => s.IR)), cove: med(S.map(s => s.cove)), lampE: med(S.map(s => s.lamp && s.lamp.e)), lampD: med(S.map(s => s.lamp && s.lamp.d)), d: med(S.map(s => s.d)) };
  const cls = {}; S.forEach(s => { cls[s.cls] = (cls[s.cls] || 0) + 1; }); out.cls = cls;
  // unclipped reference: median over all pixels of L
  const all = []; for (let i = 0; i < L0.length; i += 4 * 7) all.push(lum([L0[i], L0[i + 1], L0[i + 2]])); out.frameMedL = med(all); out.nLamps = lamps.length; out.exposure = R.toneMappingExposure;
  rt.dispose(); return out;
};
(async () => {
  const prof = fs.mkdtempSync(path.join(os.tmpdir(), 'plen-')), L = [];
  const b = await puppeteer.launch({ headless: true, userDataDir: prof, protocolTimeout: 1800000, env: Object.assign({}, process.env, { __EGL_VENDOR_LIBRARY_FILENAMES: '/usr/share/glvnd/egl_vendor.d/10_nvidia.json' }), args: ['--no-sandbox', '--use-angle=gl-egl', '--ignore-gpu-blocklist', '--window-size=1705,1054'] });
  const res = { lines: L };
  try { const p = await b.newPage(); await p.setViewport({ width: 1685, height: 874 }); p.on('console', m => L.push(m.text())); p.on('pageerror', e => L.push('PAGEERROR ' + e.message));
    await p.goto('http://127.0.0.1:' + PORT + '/viewer/viewer.html?db=/buildings/Hospital_extracted.db' + EXTRA, { waitUntil: 'domcontentloaded', timeout: 180000 });
    let last = -1, same = 0; for (let i = 0; i < 300 && same < 4; i++) { await new Promise(r => setTimeout(r, 2000)); const n = await p.evaluate(() => window.APP && window.APP.guidMap ? Object.keys(window.APP.guidMap).length : 0); if (n > 0 && n === last) same++; else same = 0; last = n; }
    await p.evaluate((c, t) => { const A = window.APP; A.camera.position.fromArray(c); A.controls.target.fromArray(t); A.controls.update(); }, CAM, TGT); await new Promise(r => setTimeout(r, 800));
    const j0 = L.length; await p.keyboard.down('Alt'); await p.keyboard.press('s'); await p.keyboard.up('Alt');
    for (let i = 0; i < 2800 && !L.slice(j0).some(t => /§GI_STILL result|§GI_STILL_FAIL|§GI_STILL_OFF/.test(t)); i++) await new Promise(r => setTimeout(r, 250));
    await new Promise(r => setTimeout(r, 1500)); res.d = await p.evaluate(DIAG); console.log(JSON.stringify(res.d).slice(0, 6000));
  } catch (e) { res.err = e.message; console.log('ERR ' + e.message); } finally { await b.close(); fs.rmSync(prof, { recursive: true, force: true }); fs.writeFileSync(OUT, JSON.stringify(res)); }
})();
