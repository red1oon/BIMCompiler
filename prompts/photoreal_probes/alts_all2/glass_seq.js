// ⚠ DO NOT REMOVE — DEFECT 6 follow-up probe. Scope: ONE tab on Terminal (:8641, fix/alts-all-2), pose tr4 pressed 3 times (Esc
// between). Per press, at the glass samples (32x18 rays, first hit = glass): app-frame luma (the saved image's fallback layer), a
// linear float render of the staged scene with glass visible / hidden (L_vis / L_hid, prime render first), the §GLASS_ENV cube state.
// Question: why the app frame at glass pixels reads 0 on a fresh page and 130-183 on later presses. Read the output.
'use strict';
const puppeteer = require('/home/red1/bim-compiler/node_modules/puppeteer'), fs = require('fs'), os = require('os'), path = require('path');
const CAM = [-7.989, -16.079, 11.597], TGT = [-9.975, -14.634, 8.118];
(async () => {
  const prof = fs.mkdtempSync(path.join(os.tmpdir(), 'altsall-gseq-')), L = [];
  const b = await puppeteer.launch({ headless: true, userDataDir: prof, protocolTimeout: 900000, env: Object.assign({}, process.env, { __EGL_VENDOR_LIBRARY_FILENAMES: '/usr/share/glvnd/egl_vendor.d/10_nvidia.json' }), args: ['--no-sandbox', '--use-angle=gl-egl', '--ignore-gpu-blocklist', '--window-size=1705,1054'] });
  try {
    const p = await b.newPage(); await p.setViewport({ width: 1685, height: 874 });
    p.on('console', m => L.push(m.text())); p.on('pageerror', e => L.push('PAGEERROR ' + e.message));
    await p.goto('http://127.0.0.1:8641/viewer/viewer.html?db=/buildings/Terminal_extracted.db', { waitUntil: 'domcontentloaded', timeout: 180000 });
    let last = -1, same = 0; for (let i = 0; i < 200 && same < 4; i++) { await new Promise(r => setTimeout(r, 2000)); const n = await p.evaluate(() => window.APP && window.APP.guidMap ? Object.keys(window.APP.guidMap).length : 0); if (n > 0 && n === last) same++; else same = 0; last = n; }
    for (let k = 0; k < 3; k++) {
      await p.evaluate((c, t) => { const A = window.APP; A.camera.position.fromArray(c); A.controls.target.fromArray(t); A.controls.update(); }, CAM, TGT);
      await new Promise(r => setTimeout(r, 800)); const j0 = L.length;
      await p.keyboard.down('Alt'); await p.keyboard.press('s'); await p.keyboard.up('Alt');
      for (let i = 0; i < 1200 && !L.slice(j0).some(t => /§GI_STILL result|§GI_STILL_FAIL/.test(t)); i++) await new Promise(r => setTimeout(r, 250));
      await new Promise(r => setTimeout(r, 1500));
      const R = await p.evaluate(() => {
        const A = window.APP, Rr = A.renderer, THREE = window.THREE, D = window.__giStillDebugCanvas;
        const isG = m => m && ((m.userData && m.userData.gfOf) || (m.transparent && m.opacity < 0.95));
        const meshes = []; A.scene.traverse(o => { if (o.visible && (o.isMesh || o.isBatchedMesh || o.isInstancedMesh) && o !== A._sky) meshes.push(o); });
        const rc = new THREE.Raycaster(), S = [];
        for (let gy = 0; gy < 18; gy++) for (let gx = 0; gx < 32; gx++) { const u = (gx + 0.5) / 32, v = (gy + 0.5) / 18; rc.setFromCamera(new THREE.Vector2(u * 2 - 1, 1 - v * 2), A.camera);
          const h = rc.intersectObjects(meshes, false)[0]; if (!h) continue; const ms = Array.isArray(h.object.material) ? h.object.material : [h.object.material]; const m = ms[(h.face && h.face.materialIndex) || 0] || ms[0];
          if (isG(m)) S.push({ u, v, obj: h.object.name || h.object.type, mat: m.uuid.slice(0, 6), clone: !!(m.userData && m.userData.gfOf), env: m.envMap ? (m.envMap.isRenderTargetTexture ? 'cubeRT' : (m.envMap.name || m.envMap.type || 'tex')) : null, envI: m.envMapIntensity, op: m.opacity, visible: m.visible, blend: m.blending, d: +h.distance.toFixed(1) }); }
        const W = 320, H = 180, rt = new THREE.WebGLRenderTarget(W, H, { type: THREE.FloatType, depthBuffer: true }), prev = Rr.getRenderTarget();
        const rd = () => { Rr.setRenderTarget(rt); Rr.clear(true, true, true); Rr.render(A.scene, A.camera); Rr.clear(true, true, true); Rr.render(A.scene, A.camera); const bb = new Float32Array(W * H * 4); Rr.readRenderTargetPixels(rt, 0, 0, W, H, bb); return bb; };
        const hide = []; A.scene.traverse(o => { if (!o.visible || !o.material) return; const ms = Array.isArray(o.material) ? o.material : [o.material]; if (ms.some(isG)) hide.push(o); });
        let bv, bh; try { bv = rd(); hide.forEach(o => { o.visible = false; }); bh = rd(); } finally { hide.forEach(o => { o.visible = true; }); Rr.setRenderTarget(prev); rt.dispose(); }
        const at = (bf, u, v) => { const x = Math.min(W - 1, Math.floor(u * W)), y = Math.min(H - 1, Math.floor((1 - v) * H)), i = (y * W + x) * 4; return [bf[i], bf[i + 1], bf[i + 2], bf[i + 3]].map(z => +z.toFixed(4)); };
        const cw = D.under.width, ch = D.under.height, ud = D.under.getContext('2d').getImageData(0, 0, cw, ch).data, cd = D.bounce.getContext('2d').getImageData(0, 0, cw, ch).data;
        const px = (dd, u, v) => { const i = (Math.min(ch - 1, Math.floor(v * ch)) * cw + Math.min(cw - 1, Math.floor(u * cw))) * 4; return [dd[i], dd[i + 1], dd[i + 2], dd[i + 3]]; };
        return { exposure: Rr.toneMappingExposure, bg: A.scene.background ? (A.scene.background.isColor ? 'color:' + A.scene.background.getHexString() : A.scene.background.type || 'tex') : null, sky: A._sky ? A._sky.visible : null, hidden: hide.length,
          rows: S.slice(0, 14).map(s => Object.assign(s, { app: px(ud, s.u, s.v), bounce: px(cd, s.u, s.v), vis: at(bv, s.u, s.v), hid: at(bh, s.u, s.v) })) };
      });
      console.log('=== press ' + k + ' exposure=' + R.exposure.toFixed(2) + ' bg=' + R.bg + ' sky=' + R.sky + ' hiddenGlassObjs=' + R.hidden);
      L.slice(j0).filter(l => /§GLASS_ENV|glass skip/.test(l)).forEach(l => console.log('  ' + l.slice(0, 200)));
      R.rows.forEach(r => console.log('  ' + JSON.stringify(r)));
      await p.keyboard.press('Escape'); for (let i = 0; i < 40 && !L.slice(j0).some(t => /§STILL_EXIT/.test(t)); i++) await new Promise(r => setTimeout(r, 250)); await new Promise(r => setTimeout(r, 1500));
    }
  } catch (e) { console.log('FATAL ' + e.message); } finally { await b.close(); fs.rmSync(prof, { recursive: true, force: true }); }
})();
