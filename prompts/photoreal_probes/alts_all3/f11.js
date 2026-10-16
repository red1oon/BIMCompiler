// F11 probe: first-press black glass (Terminal tr4). One fresh tab, press 1, diagnostics, press 2, diagnostics.
const puppeteer = require('/home/red1/bim-compiler/node_modules/puppeteer'), fs = require('fs'), os = require('os'), path = require('path');
const PORT = +process.argv[2] || 8642, OUT = process.argv[3] || '/tmp/alts_all4/probe/f11.json', EXTRA = process.argv[4] || '';
const CAM = [-7.989, -16.079, 11.597], TGT = [-9.975, -14.634, 8.118];
const DIAG = async (tag) => {
  const A = window.APP, R = A.renderer, THREE = window.THREE, out = { tag };
  const clones = new Set(), lit = []; A.scene.traverse(o => { if (!o.visible || !o.material) return; (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => { if (m && m.userData && m.userData.gfOf) clones.add(m); else if (m && m.isMeshStandardMaterial && lit.length < 5) lit.push(m); }); });
  const refU = lit.map(m => R.properties.get(m).uniforms).find(u => u && u.uSLZone);
  out.refZone = refU ? (refU.uSLZone.value && refU.uSLZone.value.image ? [refU.uSLZone.value.image.width, refU.uSLZone.value.image.height, refU.uSLZone.value.image.depth] : String(refU.uSLZone.value)) : null;
  out.clones = [...clones].map(c => { const pp = R.properties.get(c), U = pp.uniforms, z = U && U.uSLZone && U.uSLZone.value, img = z && z.image;
    return { name: c.name, env: c.envMap ? (c.envMap.isRenderTargetTexture ? 'RT' : c.envMap.constructor.name) : null, envInt: c.envMapIntensity, hasU: !!U, zone: img ? [img.width, img.height, img.depth] : null, sameZoneAsRef: !!(refU && U && U.uSLZone && U.uSLZone.value === refU.uSLZone.value), prog: pp.currentProgram ? pp.currentProgram.name + '#' + pp.currentProgram.id : null, ver: c.version, envMapU: U && U.envMap ? (U.envMap.value ? (U.envMap.value.isTexture ? (U.envMap.value.isRenderTargetTexture ? 'RTtex' : 'tex') : '?') : null) : 'n/a' }; });
  // float probe at glass pixels: find glass pixels by ray grid
  const meshes = []; A.scene.traverse(o => { if (o.visible && (o.isMesh || o.isInstancedMesh || o.isBatchedMesh) && o !== A._sky) meshes.push(o); });
  const rc = new THREE.Raycaster(), samp = [];
  for (let gy = 0; gy < 12; gy++) for (let gx = 0; gx < 20; gx++) { const u = (gx + 0.5) / 20, v = (gy + 0.5) / 12; rc.setFromCamera(new THREE.Vector2(u * 2 - 1, 1 - v * 2), A.camera); const h = rc.intersectObjects(meshes, false)[0]; if (!h) continue; const ms = Array.isArray(h.object.material) ? h.object.material : [h.object.material]; const m = ms[(h.face && h.face.materialIndex) || 0] || ms[0]; if (m && m.userData && m.userData.gfOf) samp.push({ u, v }); }
  out.nGlass = samp.length;
  const W = 320, H = 180, rt = new THREE.WebGLRenderTarget(W, H, { type: THREE.FloatType, depthBuffer: true }), prev = R.getRenderTarget();
  const probe = () => { R.setRenderTarget(rt); R.clear(); R.render(A.scene, A.camera); const b = new Float32Array(W * H * 4); R.readRenderTargetPixels(rt, 0, 0, W, H, b); R.setRenderTarget(prev);
    let nan = 0, sum = 0, n = 0; samp.forEach(s => { const i = ((Math.min(H - 1, Math.floor((1 - s.v) * H))) * W + Math.min(W - 1, Math.floor(s.u * W))) * 4; const l = 0.2126 * b[i] + 0.7152 * b[i + 1] + 0.0722 * b[i + 2]; if (!isFinite(l)) nan++; else { sum += l; n++; } }); return { nan, mean: n ? +(sum / n).toFixed(4) : null }; };
  out.probe1 = probe(); out.probe2 = probe();
  { const gl = []; A.scene.traverse(o => { if (o.visible && o.material && (Array.isArray(o.material) ? o.material : [o.material]).some(m => m && m.userData && m.userData.gfOf)) gl.push(o); });
    gl.forEach(o => { o.visible = false; }); out.probeGlassHidden = probe(); gl.forEach(o => { o.visible = true; }); out.glassObjs = gl.length;
    // second hit behind the glass: class + material type
    out.behind = samp.slice(0, 6).map(s => { rc.setFromCamera(new THREE.Vector2(s.u * 2 - 1, 1 - s.v * 2), A.camera); const hs = rc.intersectObjects(meshes, false); const h = hs.find(q => { const ms = Array.isArray(q.object.material) ? q.object.material : [q.object.material]; const m = ms[(q.face && q.face.materialIndex) || 0] || ms[0]; return !(m && m.userData && m.userData.gfOf) && !(m && m.transparent && m.opacity < 0.95); }); if (!h) return 'sky'; const ms = Array.isArray(h.object.material) ? h.object.material : [h.object.material]; const m = ms[(h.face && h.face.materialIndex) || 0] || ms[0]; return (h.object.userData.ifcClass || '?') + ':' + m.type + ':' + (m.name || '') + ':d' + h.distance.toFixed(1) + ':v' + m.version + ':' + (R.properties.get(m).uniforms && R.properties.get(m).uniforms.uSLZone ? (R.properties.get(m).uniforms.uSLZone.value && R.properties.get(m).uniforms.uSLZone.value.image ? R.properties.get(m).uniforms.uSLZone.value.image.width : 'dummy?') : 'noSL'); });
    // NaN census over the whole probe frame with glass hidden
    R.setRenderTarget(rt); R.clear(); gl.forEach(o => { o.visible = false; }); R.render(A.scene, A.camera); gl.forEach(o => { o.visible = true; }); const bb = new Float32Array(W * H * 4); R.readRenderTargetPixels(rt, 0, 0, W, H, bb); R.setRenderTarget(prev);
    let nn = 0; for (let i = 0; i < bb.length; i += 4) if (!isFinite(bb[i] + bb[i + 1] + bb[i + 2])) nn++; out.nanFrameGlassHidden = nn;
    R.setRenderTarget(rt); R.clear(); R.render(A.scene, A.camera); R.readRenderTargetPixels(rt, 0, 0, W, H, bb); R.setRenderTarget(prev); nn = 0; for (let i = 0; i < bb.length; i += 4) if (!isFinite(bb[i] + bb[i + 1] + bb[i + 2])) nn++; out.nanFrame = nn; }
  { const tex = [...clones][0] && [...clones][0].envMap, crt = tex && tex.renderTarget; out.capRT = !!crt;
    const cnt = () => { if (!crt) return null; let bad = 0; const n = crt.width, buf = new (crt.texture.type === THREE.FloatType ? Float32Array : Uint16Array)(n * n * 4); const t2 = new Float32Array(n * n * 4);
      for (let f = 0; f < 6; f++) { try { R.readRenderTargetPixels(crt, 0, 0, n, n, crt.texture.type === THREE.HalfFloatType ? t2 : buf, f); const a = crt.texture.type === THREE.HalfFloatType ? t2 : buf; for (let i = 0; i < a.length; i += 4) if (!isFinite(a[i] + a[i + 1] + a[i + 2])) bad++; } catch (e) { return 'err ' + e.message; } } return bad; };
    out.capNonFinite = cnt();
    if (window.GlassFresnel && window.GlassFresnel.capture) { window.GlassFresnel.capture(A); out.capNonFiniteRecap = cnt(); out.probeAfterRecapture = probe(); } }
  const cl = [...clones]; const ei = cl.map(c => c.envMapIntensity); cl.forEach(c => { c.envMapIntensity = 0; }); out.probeEnv0 = probe(); cl.forEach((c, i) => { c.envMapIntensity = ei[i]; });
  // app canvas at glass pixels (the frozen still)
  const cv = document.createElement('canvas'); cv.width = R.domElement.width; cv.height = R.domElement.height; cv.getContext('2d').drawImage(R.domElement, 0, 0); const d = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data;
  const D = window.__giStillDebugCanvas; let ud = null, uw = 0, uh = 0; if (D && D.under) { uw = D.under.width; uh = D.under.height; ud = D.under.getContext('2d').getImageData(0, 0, uw, uh).data; }
  out.underGlass = ud ? samp.map(s => { const i = (Math.min(uh - 1, Math.floor(s.v * uh)) * uw + Math.min(uw - 1, Math.floor(s.u * uw))) * 4; return ud[i] + ud[i + 1] + ud[i + 2]; }) : null;
  rt.dispose(); return out;
};
(async () => {
  const prof = fs.mkdtempSync(path.join(os.tmpdir(), 'f11-')), L = [];
  const b = await puppeteer.launch({ headless: true, userDataDir: prof, protocolTimeout: 1800000, env: Object.assign({}, process.env, { __EGL_VENDOR_LIBRARY_FILENAMES: '/usr/share/glvnd/egl_vendor.d/10_nvidia.json' }), args: ['--no-sandbox', '--use-angle=gl-egl', '--ignore-gpu-blocklist', '--window-size=1705,1054'] });
  const res = { lines: L, diags: [] };
  try {
    const p = await b.newPage(); await p.setViewport({ width: 1685, height: 874 }); p.on('console', m => L.push(m.text())); p.on('pageerror', e => L.push('PAGEERROR ' + e.message));
    await p.goto('http://127.0.0.1:' + PORT + '/viewer/viewer.html?db=/buildings/Terminal_extracted.db' + EXTRA, { waitUntil: 'domcontentloaded', timeout: 180000 });
    let last = -1, same = 0; for (let i = 0; i < 300 && same < 4; i++) { await new Promise(r => setTimeout(r, 2000)); const n = await p.evaluate(() => window.APP && window.APP.guidMap ? Object.keys(window.APP.guidMap).length : 0); if (n > 0 && n === last) same++; else same = 0; last = n; }
    for (let k = 0; k < 2; k++) {
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
