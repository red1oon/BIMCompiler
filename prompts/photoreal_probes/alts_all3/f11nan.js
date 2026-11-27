// F11 probe: first-press black glass (Terminal tr4). One fresh tab, press 1, diagnostics, press 2, diagnostics.
const puppeteer = require('/home/red1/bim-compiler/node_modules/puppeteer'), fs = require('fs'), os = require('os'), path = require('path');
const PORT = +process.argv[2] || 8642, OUT = process.argv[3] || '/tmp/alts_all4/probe/f11.json', EXTRA = process.argv[4] || '';
const CAM = [-7.989, -16.079, 11.597], TGT = [-9.975, -14.634, 8.118];
const DIAG = async (tag) => {
  const A = window.APP, R = A.renderer, THREE = window.THREE, out = { tag, faces: [] };
  const hidden = []; A.scene.traverse(o => { if (!o.visible || !o.material) return; const ms = Array.isArray(o.material) ? o.material : [o.material]; if (ms.some(m => m && ((m.userData && m.userData.gfOf) || (m.transparent && m.opacity < 0.95 && !m.map && (m.isMeshStandardMaterial || m.isMeshPhysicalMaterial))))) { o.visible = false; hidden.push(o); } });
  const n = 256, rt = new THREE.WebGLRenderTarget(n, n, { type: THREE.HalfFloatType, depthBuffer: true }), cam = new THREE.PerspectiveCamera(90, 1, 0.05, 5000), hb = new Uint16Array(n * n * 4), prev = R.getRenderTarget();
  const meshes = []; A.scene.traverse(o => { if (o.visible && (o.isMesh || o.isInstancedMesh || o.isBatchedMesh)) meshes.push(o); });
  const dirs = [[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]], rc = new THREE.Raycaster();
  for (let f = 0; f < 6; f++) { cam.position.copy(A.camera.position); const d = dirs[f]; cam.up.set(0, Math.abs(d[1]) > 0.5 ? 0 : 1, Math.abs(d[1]) > 0.5 ? 1 : 0); cam.lookAt(cam.position.x + d[0], cam.position.y + d[1], cam.position.z + d[2]); cam.updateMatrixWorld(true);
    R.setRenderTarget(rt); R.clear(); R.render(A.scene, cam); R.render(A.scene, cam); R.readRenderTargetPixels(rt, 0, 0, n, n, hb); R.setRenderTarget(prev);
    const px = []; for (let i = 0; i < n * n; i++) { let bad = false; for (let c = 0; c < 3; c++) if ((hb[i * 4 + c] & 0x7c00) === 0x7c00) bad = true; if (bad) px.push(i); }
    const who = px.slice(0, 6).map(i => { const x = i % n, y = (i / n) | 0; rc.setFromCamera(new THREE.Vector2((x + 0.5) / n * 2 - 1, (y + 0.5) / n * 2 - 1), cam); const h = rc.intersectObjects(meshes, false)[0]; if (!h) return 'miss'; const ms = Array.isArray(h.object.material) ? h.object.material : [h.object.material]; const m = ms[(h.face && h.face.materialIndex) || 0] || ms[0];
      return (h.object.userData.ifcClass || h.object.name || h.object.type) + '|' + m.type + '|' + (m.name || '') + '|d' + h.distance.toFixed(2) + '|rough' + m.roughness + '|metal' + m.metalness + '|env' + m.envMapIntensity + '|col' + (m.color ? m.color.getHexString() : '') + '|tri' + !!(m.userData && m.userData.triRow) + '|n' + (h.face ? h.face.normal.toArray().map(v => v.toFixed(2)).join(',') : '') + '|' + JSON.stringify(Object.keys(m.userData || {})).slice(0, 80); });
    const modes = {}; if (f === 0 && px.length) { [1, 6, 7, 8, 9, 10, 11, 13].forEach(md => { window.SourcedLight.debugZones(md); R.setRenderTarget(rt); R.clear(); R.render(A.scene, cam); R.render(A.scene, cam); R.readRenderTargetPixels(rt, 0, 0, n, n, hb); R.setRenderTarget(prev); window.SourcedLight.debugZones(0);
        modes[md] = px.slice(0, 2).map(i => [0, 1, 2, 3].map(c => { const h = hb[i * 4 + c], e = (h >> 10) & 31, m = h & 1023; return e === 31 ? (m ? 'NaN' : 'Inf') : +((e ? (1 + m / 1024) * Math.pow(2, e - 15) : m / 1024 * Math.pow(2, -14)) * (h & 0x8000 ? -1 : 1)).toFixed(4); }).join(',')); });
      // lights off one at a time (intensity 0 on each light type)
      const lights = []; A.scene.traverse(o => { if (o.isLight) lights.push(o); }); const types = [...new Set(lights.map(l => l.type))];
      { const was = A._lampDataOn; A._lampDataOn = false; R.setRenderTarget(rt); R.clear(); R.render(A.scene, cam); R.render(A.scene, cam); R.readRenderTargetPixels(rt, 0, 0, n, n, hb); R.setRenderTarget(prev);
        let bad = 0; px.forEach(i => { for (let c = 0; c < 3; c++) if ((hb[i * 4 + c] & 0x7c00) === 0x7c00) { bad++; break; } }); modes.lampDataOff = bad; A._lampDataOn = was; }
      const cnt = () => { R.setRenderTarget(rt); R.clear(); R.render(A.scene, cam); R.render(A.scene, cam); R.readRenderTargetPixels(rt, 0, 0, n, n, hb); R.setRenderTarget(prev); let bad = 0; px.forEach(i => { for (let c = 0; c < 3; c++) if ((hb[i * 4 + c] & 0x7c00) === 0x7c00) { bad++; break; } }); return bad; };
      // the hit object/material
      rc.setFromCamera(new THREE.Vector2((px[0] % n + 0.5) / n * 2 - 1, (((px[0] / n) | 0) + 0.5) / n * 2 - 1), cam); const hh = rc.intersectObjects(meshes, false)[0], ho = hh.object, hm0 = Array.isArray(ho.material) ? ho.material[(hh.face && hh.face.materialIndex) || 0] : ho.material;
      modes.hitObj = (hm0 ? hm0.type : 'nomat') + ' ' + ho.type + ' batched=' + !!ho.isBatchedMesh + ' inst=' + !!ho.isInstancedMesh + ' id=' + ho.id + ' batchId=' + hh.batchId + ' instId=' + hh.instanceId + ' guid=' + (A.guidMap[hh.batchId != null ? ho.id + '_' + hh.batchId : hh.instanceId != null ? ho.id + '_' + hh.instanceId : ho.id] || A.guidMap[ho.id]) + ' obc=' + !!hm0.onBeforeCompile + ' key=' + (hm0.customProgramCacheKey ? String(hm0.customProgramCacheKey()).slice(0, 60) : '') + ' uv=' + hh.uv + ' faceN=' + (hh.face && hh.face.normal.toArray().join(','));
      try { const r0 = hm0.roughness; hm0.roughness = 1; modes.rough1 = cnt(); hm0.roughness = r0; } catch (e) { modes.rough1 = 'err ' + e.message; }
      try { window.SourcedLight.aoOn(false); modes.aoOff = cnt(); window.SourcedLight.aoOn(true); } catch (e) { modes.aoOff = 'err ' + e.message; }
      try { const plain = new THREE.MeshStandardMaterial({ color: hm0.color, roughness: hm0.roughness, metalness: hm0.metalness, side: hm0.side }); const saveM = ho.material; ho.material = plain; modes.plainMat = cnt(); ho.material = saveM; } catch (e) { modes.plainMat = 'err ' + e.message + ' ' + (e.stack || '').split('\n')[1]; }
      const sn = ho.geometry && ho.geometry.attributes.normal; modes.normals = sn ? (() => { let bad = 0, zero = 0; for (let i = 0; i < sn.count; i++) { const x = sn.getX(i), y = sn.getY(i), z = sn.getZ(i); if (!isFinite(x + y + z)) bad++; else if (x * x + y * y + z * z < 1e-8) zero++; } return 'count ' + sn.count + ' nonFinite ' + bad + ' zero ' + zero; })() : 'none';
      try { window.SourcedLight.unstage(A, true); modes.sourcedOff = cnt(); } catch (e) { modes.sourcedOff = 'err ' + e.message; }
      types.forEach(t => { const ls = lights.filter(l => l.type === t), iv = ls.map(l => l.intensity); ls.forEach(l => { l.intensity = 0; }); R.setRenderTarget(rt); R.clear(); R.render(A.scene, cam); R.readRenderTargetPixels(rt, 0, 0, n, n, hb); R.setRenderTarget(prev); ls.forEach((l, k) => { l.intensity = iv[k]; });
        let bad = 0; px.forEach(i => { for (let c = 0; c < 3; c++) if ((hb[i * 4 + c] & 0x7c00) === 0x7c00) { bad++; break; } }); modes['off_' + t + '(' + ls.length + ')'] = bad; }); }
    out.faces.push({ f, bad: px.length, who, modes, pxy: px.slice(0, 2).map(i => [i % n, (i / n) | 0]) }); }
  hidden.forEach(o => { o.visible = true; }); rt.dispose(); return out;
};
(async () => {
  const prof = fs.mkdtempSync(path.join(os.tmpdir(), 'f11-')), L = [];
  const b = await puppeteer.launch({ headless: true, userDataDir: prof, protocolTimeout: 1800000, env: Object.assign({}, process.env, { __EGL_VENDOR_LIBRARY_FILENAMES: '/usr/share/glvnd/egl_vendor.d/10_nvidia.json' }), args: ['--no-sandbox', '--use-angle=gl-egl', '--ignore-gpu-blocklist', '--window-size=1705,1054'] });
  const res = { lines: L, diags: [] };
  try {
    const p = await b.newPage(); await p.setViewport({ width: 1685, height: 874 }); p.on('console', m => L.push(m.text())); p.on('pageerror', e => L.push('PAGEERROR ' + e.message));
    await p.goto('http://127.0.0.1:' + PORT + '/viewer/viewer.html?db=/buildings/Terminal_extracted.db' + EXTRA, { waitUntil: 'domcontentloaded', timeout: 180000 });
    let last = -1, same = 0; for (let i = 0; i < 300 && same < 4; i++) { await new Promise(r => setTimeout(r, 2000)); const n = await p.evaluate(() => window.APP && window.APP.guidMap ? Object.keys(window.APP.guidMap).length : 0); if (n > 0 && n === last) same++; else same = 0; last = n; }
    for (let k = 0; k < 1; k++) {
      await p.evaluate((c, t) => { const A = window.APP; A.camera.position.fromArray(c); A.controls.target.fromArray(t); A.controls.update(); }, CAM, TGT); await new Promise(r => setTimeout(r, 800));
      const j0 = L.length; await p.keyboard.down('Alt'); await p.keyboard.press('s'); await p.keyboard.up('Alt');
      for (let i = 0; i < 2800 && !L.slice(j0).some(t => /§GI_STILL result|§GI_STILL_FAIL|§GI_STILL_OFF/.test(t)); i++) await new Promise(r => setTimeout(r, 250));
      await new Promise(r => setTimeout(r, 1500));
      const d = await p.evaluate(DIAG, 'press' + (k + 1)); res.diags.push(d); console.log(JSON.stringify(d).slice(0, 1500));
      await p.keyboard.press('Escape'); await new Promise(r => setTimeout(r, 2500));
    }
  } catch (e) { res.err = e.message; console.log('ERR ' + e.message); }
  finally { await b.close(); fs.rmSync(prof, { recursive: true, force: true }); fs.writeFileSync(OUT, JSON.stringify(res)); }
})();
