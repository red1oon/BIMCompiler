#!/usr/bin/env node
// §PHOTO_SHADOW_BIAS_SCALE — paired A/B — prompts/PHOTOREAL_STILL_RENDER.md §MAIN_BUILDING_SHADOW
//
// ISSUE IT PROVES OR DISPROVES: "the ONLY thing stopping the main building + its rooftop fixtures
// from casting a shadow in the PHOTO_SHADOW path is that shadow.bias=-0.0005 is applied on a
// 19,748 m shadow-camera depth range (= 9.87 m of world-space peter-panning) instead of
// toggleShadow's 609 m range (= 0.30 m)."
//
// METHOD: identical scene, identical camera pose, identical sun. Render, read the framebuffer.
// Then change EXACTLY ONE variable — shadow.bias, rescaled to hold the same world-space 0.30 m the
// working path produces — force the shadow pass to re-render, render again, read again. Compare the
// two buffers pixel by pixel. If the building's shadow is being erased by the bias, a contiguous
// block of ground pixels DARKENS and nothing else changes. Pixel counts are computed here, never
// eyeballed; no screenshot is part of the evidence.
const puppeteer = require('/home/red1/bim-compiler/node_modules/puppeteer');
const PORT = process.env.PORT || 8511;
const BLD = 'HHS_Office_Federated';

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--use-gl=angle', '--use-angle=swiftshader', '--no-sandbox',
           '--enable-unsafe-swiftshader', '--disable-dev-shm-usage'],
    protocolTimeout: 900000,
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 640, height: 420 });
  page.on('console', m => { const t = m.text(); if (/§(PHOTO_SHADOW|SUN_ARC_STEP)/.test(t)) console.log('  PAGE ' + t); });
  page.on('pageerror', e => console.log('  PAGEERR ' + e.message));

  const url = `http://localhost:${PORT}/viewer/viewer.html?db=buildings/${BLD}_extracted.db&bld=${BLD}&cb=${Date.now()}`;
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 180000 });
  const streamed = await page.waitForFunction(() => {
    const A = window.APP || window.A;
    if (!A || !A.scene) return false;
    let n = 0; A.scene.traverse(o => { if (o.isMesh || o.isInstancedMesh || o.isBatchedMesh) n++; });
    return n > 50 ? n : false;
  }, { timeout: 180000, polling: 3000 }).then(h => h.jsonValue()).catch(() => 0);
  console.log('STREAMED meshes=' + streamed);
  if (!streamed) { console.log('ABORT'); await browser.close(); process.exit(1); }
  await new Promise(r => setTimeout(r, 6000));

  await page.evaluate(() => { const A = window.APP || window.A; A.startStillRefine(); });
  await new Promise(r => setTimeout(r, 25000));

  const result = await page.evaluate(() => {
    const A = window.APP || window.A, T = window.THREE;
    const sh = A.sun.shadow, cam = sh.camera;
    const gl = A.renderer.getContext();
    const W = A.renderer.domElement.width, H = A.renderer.domElement.height;

    function grab() {
      A.renderer.setRenderTarget(null);
      A.scene.updateMatrixWorld(true);
      A.sun.updateMatrixWorld(true);
      A.renderer.render(A.scene, A.camera);
      const px = new Uint8Array(W * H * 4);
      gl.readPixels(0, 0, W, H, gl.RGBA, gl.UNSIGNED_BYTE, px);
      return px;
    }
    const lum = (p, i) => 0.2126 * p[i] + 0.7152 * p[i + 1] + 0.0722 * p[i + 2];

    // building footprint from the streamed geometry
    let lo = null, hi = null;
    A.scene.traverse(o => {
      if (!(o.isBatchedMesh || o.isInstancedMesh) || !o.visible) return;
      const bs = o.boundingSphere || (o.geometry && o.geometry.boundingSphere); if (!bs) return;
      const c = bs.center.clone().applyMatrix4(o.matrixWorld), r = bs.radius;
      const mn = [c.x - r, c.y - r, c.z - r], mx = [c.x + r, c.y + r, c.z + r];
      if (!lo) { lo = mn; hi = mx; } else for (let i = 0; i < 3; i++) { lo[i] = Math.min(lo[i], mn[i]); hi[i] = Math.max(hi[i], mx[i]); }
    });
    const ctr = new T.Vector3((lo[0] + hi[0]) / 2, (lo[1] + hi[1]) / 2, (lo[2] + hi[2]) / 2);
    const span = Math.max(hi[0] - lo[0], hi[2] - lo[2]);

    const out = { W, H, span: +span.toFixed(1), runs: [] };

    function runAtElevation(tNorm) {
      if (A._sunArcStep) A._sunArcStep(tNorm);
      A.scene.updateMatrixWorld(true); A.sun.updateMatrixWorld(true);
      // deterministic pose: stand on the sun's own azimuth, BEHIND the building, so the building's
      // cast shadow points away from the camera and lands in open ground in frame. Elevation 28 deg,
      // distance 2.2x span — computed from real scene state, not a hand-picked magic pose.
      const sunDir = A.sun.position.clone().normalize();
      const horiz = new T.Vector3(sunDir.x, 0, sunDir.z).normalize();
      const dist = span * 2.2;
      A.camera.position.set(
        ctr.x + horiz.x * dist * Math.cos(28 * Math.PI / 180),
        ctr.y + dist * Math.sin(28 * Math.PI / 180),
        ctr.z + horiz.z * dist * Math.cos(28 * Math.PI / 180));
      A.camera.lookAt(ctr);
      if (A.controls) { A.controls.target.copy(ctr); A.controls.update(); }
      A.camera.updateMatrixWorld(true);

      const range = cam.far - cam.near;
      const biasBefore = sh.bias, worldBefore = Math.abs(biasBefore) * range;
      // the working path's own world-space bias, measured live this session: 0.0005 * 609.44 m
      const TARGET_WORLD_BIAS_M = 0.3047;
      const biasAfter = -(TARGET_WORLD_BIAS_M / range);

      A.renderer.shadowMap.needsUpdate = true; const before = grab();
      sh.bias = biasAfter;
      A.renderer.shadowMap.needsUpdate = true; const after = grab();
      sh.bias = biasBefore;   // restore — measurement must not leave the app changed

      let darkened = 0, brightened = 0, unchanged = 0, sumDelta = 0, maxDrop = 0;
      for (let i = 0; i < before.length; i += 4) {
        const d = lum(after, i) - lum(before, i);
        if (d < -6) { darkened++; sumDelta += d; if (-d > maxDrop) maxDrop = -d; }
        else if (d > 6) brightened++;
        else unchanged++;
      }
      const total = before.length / 4;
      return {
        elevationDeg: +(Math.asin(Math.max(-1, Math.min(1, A.sun.position.y / 5000))) * 180 / Math.PI).toFixed(1),
        shadowCamRangeM: +range.toFixed(1),
        worldBiasBeforeM: +worldBefore.toFixed(3), biasBefore,
        worldBiasAfterM: TARGET_WORLD_BIAS_M, biasAfter: +biasAfter.toExponential(3),
        pixels: total,
        pixelsDarkened: darkened, pctDarkened: +(100 * darkened / total).toFixed(2),
        pixelsBrightened: brightened,
        meanDropOnDarkened: darkened ? +(sumDelta / darkened).toFixed(1) : 0,
        maxDrop: +maxDrop.toFixed(1),
      };
    }

    window.__runAtElevation = runAtElevation;
    return out;
  });
  const runs = [];
  for (const t of [0.0, 1.0]) {
    runs.push(await page.evaluate((tn) => window.__runAtElevation(tn), t));
    console.log('  ...elevation run done tNorm=' + t);
  }
  result.runs = runs;
  console.log(JSON.stringify(result, null, 2));
  console.log('\n=== A/B: only shadow.bias changed (9.87 m -> 0.30 m world) ===');
  result.runs.forEach(r => console.log('elev=' + r.elevationDeg + 'deg  darkened=' + r.pixelsDarkened +
    ' px (' + r.pctDarkened + '% of frame)  meanDrop=' + r.meanDropOnDarkened + '  maxDrop=' + r.maxDrop +
    '  brightened=' + r.pixelsBrightened));
  await browser.close();
})().catch(e => { console.error('WITNESS_FATAL ' + e.stack); process.exit(1); });
