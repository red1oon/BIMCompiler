// diag.js <port> <png>... : per still: fresh page at the PNG's tEXt pose, one Alt+S, dump § lines + the extLightsDay culprits
const puppeteer = require('/home/red1/bim-compiler/node_modules/puppeteer'), fs = require('fs'), zlib = require('zlib'); const sleep = ms => new Promise(r => setTimeout(r, ms));
const [PORT, ...PNGS] = process.argv.slice(2), OUT = __dirname + '/' + (process.env.OUTD || 'out') + '/';
function pose(f) { const d = fs.readFileSync(f); let i = 8; while (i < d.length) { const n = d.readUInt32BE(i), t = d.toString('latin1', i + 4, i + 8), c = d.slice(i + 8, i + 8 + n); i += 12 + n;
  if (t === 'tEXt') { const z = c.indexOf(0); if (c.toString('latin1', 0, z) === 'bim-still-pose') return JSON.parse(c.slice(z + 1).toString('utf8')); } } }
(async () => { const b = await puppeteer.launch({ headless: true, protocolTimeout: 900000, env: Object.assign({}, process.env, { __EGL_VENDOR_LIBRARY_FILENAMES: '/usr/share/glvnd/egl_vendor.d/10_nvidia.json' }), args: ['--no-sandbox', '--use-angle=gl-egl', '--ignore-gpu-blocklist', '--window-size=1503,889'] });
  for (const f of PNGS) { const P = pose(f), tag = f.match(/(\d+)\.png$/)[1] + (process.env.SUF || '');
    const p = await b.newPage(); await p.setViewport({ width: P.w, height: P.h }); const L = [];
    p.on('console', m => L.push(m.text().replace(/\n/g, '\\n'))); p.on('pageerror', e => L.push('PAGEERROR ' + e.message));
    await p.goto('http://127.0.0.1:' + PORT + '/viewer/viewer.html' + P.url + (process.env.Q || ''), { waitUntil: 'domcontentloaded' });
    { let last = -1, same = 0; for (let i = 0; i < 400 && same < 6; i++) { await sleep(2000); const n = await p.evaluate(() => window.APP && window.APP.guidMap ? Object.keys(window.APP.guidMap).length : 0); if (n > 0 && n === last) same++; else same = 0; last = n; } L.push('§DIAG loaded guids=' + last); } await sleep(3000);
    await p.evaluate((c, t) => { const A = window.APP; A.camera.position.fromArray(c); A.controls.target.fromArray(t); A.controls.update(); }, P.cam, P.tgt);
    await sleep(500); const j0 = L.length; await p.keyboard.down('Alt'); await p.keyboard.press('s'); await p.keyboard.up('Alt');
    for (let i = 0; i < (+process.env.WAIT || 400) && !L.slice(j0).some(t => /§GI_STILL result|§GI_STILL_FAIL/.test(t)); i++) await sleep(1000); await sleep(1500);
    if (process.env.FIX) await p.evaluate(() => { window.__FIX = 1; });
    if (process.env.GLASS) await p.evaluate(() => { window.__GLASS = 1; });
    if (process.env.PREJS) { const pr = await p.evaluate(src => { try { return String(eval(src)); } catch (e) { return 'ERR ' + e.message; } }, process.env.PREJS); L.push('§DIAG_PREJS ' + pr); }
    if (process.env.SCONCE) await p.evaluate(() => { window.__SCONCE = 1; });
    if (process.env.LEAK) await p.evaluate((w, h, px) => { window.__LEAK = 1; window.__LEAKW = w; window.__LEAKH = h; if (px) window.__LEAKPX = JSON.parse(px); }, process.env.LEAKW || 12, process.env.LEAKH || 9, process.env.LEAKPX ? require('fs').readFileSync(process.env.LEAKPX, 'utf8') : '');
    if (process.env.STAIR) await p.evaluate((w, h) => { window.__STAIR = 1; window.__STAIRW = w; window.__STAIRH = h; }, process.env.STAIRW || 64, process.env.STAIRH || 36);
    if (process.env.HEMI) await p.evaluate(h => { window.__HEMI = JSON.parse(h); }, process.env.HEMI);
    const cul = await p.evaluate(() => { const A = window.APP, T = window.THREE, r = [];
      A.scene.traverse(o => { if (!o.visible) return; let path = [], q = o; while (q && path.length < 5) { path.push((q.name || q.type) + (q.userData && Object.keys(q.userData).length ? '{' + Object.keys(q.userData).slice(0, 4).join(',') + '}' : '')); q = q.parent; }
        const vis = (() => { let q = o; while (q) { if (!q.visible) return false; q = q.parent; } return true; })();
        if (o.isSpotLight && o.intensity > 0 && o !== A._camLight) r.push({ k: 'spot', I: o.intensity, pos: o.position.toArray().map(v => +v.toFixed(2)), vis, path: path.join(' < ') });
        if ((o.isSprite || o.isPoints) && o.material && o.material.blending === T.AdditiveBlending) r.push({ k: o.isSprite ? 'sprite' : 'points', n: o.geometry && o.geometry.attributes.position ? o.geometry.attributes.position.count : 0, vis, path: path.join(' < ') }); });
      let contact = null; const D = window.__giStillDebugCanvas;
      if (D) { const w = D.under.width, h = D.under.height, fc = document.createElement('canvas'); fc.width = w; fc.height = h; const fx = fc.getContext('2d'); fx.drawImage(D.under, 0, 0); fx.drawImage(D.bounce, 0, 0);
        const U = D.under.getContext('2d').getImageData(0, 0, w, h).data, F = fx.getImageData(0, 0, w, h).data, tg = [], rc = new T.Raycaster(), up = new T.Raycaster();
        A.scene.traverse(o => { if ((o.isMesh || o.isInstancedMesh || o.isBatchedMesh) && o.visible && o !== A._sky) { const m = Array.isArray(o.material) ? o.material[0] : o.material; if (m && !m.isMeshBasicMaterial && !(m.transparent && m.opacity < 0.95)) tg.push(o); } });
        const L = (P, i) => 0.2126 * P[i] + 0.7152 * P[i + 1] + 0.0722 * P[i + 2]; const acc = { under: [0, 0, 0], open: [0, 0, 0] }; const t0 = performance.now(); const STEP = +(window.__CSTEP || 24);
        for (let y = STEP / 2; y < h; y += STEP) for (let x = STEP / 2; x < w; x += STEP) { if (performance.now() - t0 > 120000) break;
          rc.setFromCamera(new T.Vector2(x / w * 2 - 1, 1 - y / h * 2), A.camera); const hs = rc.intersectObjects(tg, false); if (!hs.length || !hs[0].face) continue;
          const n = hs[0].face.normal.clone().transformDirection(hs[0].object.matrixWorld); if (n.y < 0.9) continue;
          up.set(hs[0].point.clone().add(new T.Vector3(0, 0.02, 0)), new T.Vector3(0, 1, 0)); up.far = 1.5; const k = up.intersectObjects(tg, false).length ? 'under' : 'open';
          const i = (Math.floor(y) * w + Math.floor(x)) * 4; acc[k][0]++; acc[k][1] += L(U, i); acc[k][2] += L(F, i); }
        const m = k => acc[k][0] ? [+(acc[k][1] / acc[k][0]).toFixed(1), +(acc[k][2] / acc[k][0]).toFixed(1)] : [null, null];
        const mu = m('under'), mo = m('open'); contact = { nUnder: acc.under[0], nOpen: acc.open[0], underApp: mu[0], underFinal: mu[1], openApp: mo[0], openFinal: mo[1],
          ratioApp: mu[0] && mo[0] ? +(mu[0] / mo[0]).toFixed(3) : null, ratioFinal: mu[1] && mo[1] ? +(mu[1] / mo[1]).toFixed(3) : null, ms: Math.round(performance.now() - t0) }; }
      let fix = null;
      if (window.__FIX && D) { const w = D.under.width, h = D.under.height, fc = document.createElement('canvas'); fc.width = w; fc.height = h; const fx = fc.getContext('2d'); fx.drawImage(D.under, 0, 0); fx.drawImage(D.bounce, 0, 0);
        const F = fx.getImageData(0, 0, w, h).data, tg = [], rc = new T.Raycaster(); A.scene.traverse(o => { if ((o.isMesh || o.isInstancedMesh || o.isBatchedMesh) && o.visible && o !== A._sky) tg.push(o); });
        const lp = (A._stillCalibSunLux && A._stillCalibSunI) ? A._stillCalibSunLux / A._stillCalibSunI : null, B = {}; const t0 = performance.now(), STEP = 6;
        for (let y = 3; y < h; y += STEP) for (let x = 3; x < w; x += STEP) { if (performance.now() - t0 > 150000) break;
          rc.setFromCamera(new T.Vector2(x / w * 2 - 1, 1 - y / h * 2), A.camera); const hs = rc.intersectObjects(tg, false); if (!hs.length) continue; const q = hs[0];
          const m = Array.isArray(q.object.material) ? q.object.material[(q.face && q.face.materialIndex) || 0] : q.object.material; if (!m) continue;
          const eI = m.emissive ? Math.max(m.emissive.r, m.emissive.g, m.emissive.b) * (m.emissiveIntensity == null ? 1 : m.emissiveIntensity) : 0;
          const basic = !!m.isMeshBasicMaterial; if (!(eI > 0) && !basic) continue;
          const n = q.face ? q.face.normal.clone().transformDirection(q.object.matrixWorld) : null, face = n ? (n.y < -0.7 ? 'down' : n.y > 0.7 ? 'up' : 'side') : '?';
          const k = (basic ? 'basic' : 'emis') + ':' + face + ':' + (q.object.name || m.name || q.object.type).slice(0, 30), i = (y * w + x) * 4;
          const b = B[k] || (B[k] = { n: 0, blown: 0, sumL: 0, eI: 0, col: basic ? m.color.getHexString() : m.emissive.getHexString() }); b.n++; b.eI = +eI.toFixed(4);
          const r = F[i], g = F[i + 1], bl = F[i + 2]; if (r > 250 && g > 250 && bl > 250) b.blown++; b.sumL += (r + g + bl) / 3; }
        Object.values(B).forEach(b => { b.meanL = +(b.sumL / b.n).toFixed(1); delete b.sumL; b.impliedCdm2 = lp ? Math.round(b.eI * lp) : null; });
        fix = { luxPer: lp, exposure: A.renderer.toneMappingExposure, meterLcd: A._meterLast && A._meterLast.Lcd, buckets: B, ms: Math.round(performance.now() - t0) }; }
      let glass = null; const LZ = window.LightZones, Zg = LZ && LZ.get && LZ.get();
      if (window.__GLASS && LZ && LZ.specVis && Zg) { const rc = new T.Raycaster(), tg = [], cp = A.camera.position; glass = { n: 0, dark: [], ok: { roof: 0, wall: 0 } };
        A.scene.traverse(o => { if ((o.isMesh || o.isInstancedMesh || o.isBatchedMesh) && o.visible && o !== A._sky) tg.push(o); });
        for (let gy = 0; gy < 36; gy++) for (let gx = 0; gx < 64; gx++) { rc.setFromCamera(new T.Vector2((gx + 0.5) / 64 * 2 - 1, 1 - (gy + 0.5) / 36 * 2), A.camera);
          const h = rc.intersectObjects(tg, false)[0]; if (!h) continue; const ob = h.object, m = Array.isArray(ob.material) ? (h.face && ob.material[h.face.materialIndex]) || ob.material[0] : ob.material;
          if (!(m && m.transparent && m.opacity < 0.95 && !m.map && m.type !== 'MeshBasicMaterial')) continue;
          const nn = h.face ? h.face.normal.clone().transformDirection(ob.matrixWorld) : new T.Vector3(0, 1, 0), sv = LZ.specVis(h.point, nn, cp); if (!sv) continue; glass.n++;
          const kind = Math.abs(nn.y) > 0.7 ? 'roof' : 'wall', svS = LZ.specVis(h.point, nn, cp, true);
          const Dg = window.__giStillDebugCanvas; let lum = null; if (Dg) { const w = Dg.under.width, hh2 = Dg.under.height, X = Math.floor((gx + 0.5) / 64 * w), Y = Math.floor((gy + 0.5) / 36 * hh2);
            const fc = document.createElement('canvas'); fc.width = w; fc.height = hh2; const fx2 = fc.getContext('2d'); fx2.drawImage(Dg.under, 0, 0); fx2.drawImage(Dg.bounce, 0, 0); const px = fx2.getImageData(X, Y, 1, 1).data; lum = Math.round((px[0] + px[1] + px[2]) / 3); }
          glass.lum = glass.lum || { dark: [], ok: [] }; glass.lum[sv.spec < 0.3 ? 'dark' : 'ok'].push(lum); glass.smooth = glass.smooth || { dark: 0, n: 0 }; glass.smooth.n++; if (svS && svS.spec < 0.3) glass.smooth.dark++;
          let trace = null; if (sv.spec < 0.3 && glass.dark.length < 8) { const Zc = Zg, st = 0.5 * Zc.cell; let vx = h.point.x - cp.x, vy = h.point.y - cp.y, vz = h.point.z - cp.z; const vl = Math.hypot(vx, vy, vz); vx /= vl; vy /= vl; vz /= vl;
            let nx = nn.x, ny = nn.y, nz = nn.z; if (nx * vx + ny * vy + nz * vz > 0) { nx = -nx; ny = -ny; nz = -nz; } const d = vx * nx + vy * ny + vz * nz, rx = vx - 2 * d * nx, ry = vy - 2 * d * ny, rz = vz - 2 * d * nz;
            let qx = h.point.x + nx * st, qy = h.point.y + ny * st, qz = h.point.z + nz * st; trace = { n: [nx, ny, nz].map(v => +v.toFixed(2)), r: [rx, ry, rz].map(v => +v.toFixed(2)), cell: Zc.cell, cells: [] };
            for (let k = 0; k < 32; k++) { const v = LZ.atRaw({ x: qx, y: qy, z: qz }); const ci = (() => { const i = Math.floor((qx - Zc.org.x) / Zc.cell), j = Math.floor((qy - Zc.org.y) / Zc.cell), k2 = Math.floor((qz - Zc.org.z) / Zc.cell); return (i < 0 || j < 0 || k2 < 0 || i >= Zc.nx || j >= Zc.ny || k2 >= Zc.nz) ? -1 : i + j * Zc.nx + k2 * Zc.nx * Zc.ny; })(); trace.cells.push(v === 65535 ? ((ci >= 0 && Zc.glassT && Zc.glassT[ci]) ? 'G' : 'S') : v === -1 ? 'off' : (v & 0x3fff) + ((v & 0x4000) ? '*' : '')); qx += rx * st; qy += ry * st; qz += rz * st; } trace.cells = trace.cells.join(' ');
            const rr = new T.Raycaster(new T.Vector3(h.point.x + nx * 0.02, h.point.y + ny * 0.02, h.point.z + nz * 0.02), new T.Vector3(rx, ry, rz)); rr.far = 60;
            { const all = []; A.scene.traverse(o => { if ((o.isMesh || o.isInstancedMesh || o.isBatchedMesh) && o !== A._sky) all.push(o); });
              const vis = o => { let q = o; while (q) { if (!q.visible) return false; q = q.parent; } return true; };
              const rr2 = new T.Raycaster(rr.ray.origin.clone(), rr.ray.direction.clone()); rr2.far = 4;
              trace.hidden = rr2.intersectObjects(all, false).slice(0, 4).map(q => { const mq = Array.isArray(q.object.material) ? q.object.material[0] : q.object.material;
                const id = q.object.isInstancedMesh ? q.instanceId : q.object.isBatchedMesh ? q.batchId : null; let g = null; try { g = q.object.userData && (q.object.userData.guid || (q.object.userData.guids && id != null && q.object.userData.guids[id])) || null; } catch (e) {}
                return { d: +q.distance.toFixed(2), vis: vis(q.object), matVis: mq ? mq.visible !== false : null, op: mq ? (mq.transparent ? +mq.opacity.toFixed(2) : 1) : null, cls: (q.object.userData && (q.object.userData.ifcClass || q.object.userData.cls)) || null, name: (q.object.name || q.object.type).slice(0, 40), g, ud: Object.keys(q.object.userData || {}).slice(0, 6).join(',') }; }); }
            { const pts = []; for (let k = 1; k < 10; k++) pts.push(new T.Vector3(rr.ray.origin.x + rx * st * k, rr.ray.origin.y + ry * st * k, rr.ray.origin.z + rz * st * k));
              const hitsI = []; A.scene.traverse(o => { if (!o.isBatchedMesh || !o.geometry) return; const n = typeof o.instanceCount === 'number' ? o.instanceCount : 0; const bb = new T.Box3(), m4 = new T.Matrix4();
                for (let i = 0; i < n; i++) { let gid; try { gid = o.getGeometryIdAt(i); } catch (e) { continue; } const gb = o.getBoundingBoxAt ? o.getBoundingBoxAt(gid, new T.Box3()) : null; if (!gb) continue;
                  o.getMatrixAt(i, m4); m4.premultiply(o.matrixWorld); bb.copy(gb).applyMatrix4(m4); bb.expandByScalar(0.3); if (!pts.some(p => bb.containsPoint(p))) continue;
                  let vis = null; try { vis = o.getVisibleAt(i); } catch (e) {} hitsI.push({ vis, gd: A.guidMap[o.id + '_' + i] || null, disc: o.userData && o.userData.disc, meshVis: o.visible }); } });
              trace.batchNear = hitsI.slice(0, 8); trace.batchNearN = hitsI.length; trace.batchHiddenN = hitsI.filter(h => h.vis === false).length; }
            trace.geo = rr.intersectObjects(tg, false).slice(0, 3).map(q => { const mq = Array.isArray(q.object.material) ? q.object.material[0] : q.object.material; const g = A.guidMap ? Object.keys(A.guidMap).find(k => A.guidMap[k] === q.object) : null;
              return { d: +q.distance.toFixed(2), op: mq ? +(mq.transparent ? mq.opacity : 1).toFixed(2) : null, name: (q.object.name || q.object.type).slice(0, 30), p: q.point.toArray().map(v => +v.toFixed(1)) }; }); }
          if (sv.spec < 0.3) glass.dark.push({ trace, kind, ny: +nn.y.toFixed(2), p: h.point.toArray().map(v => +v.toFixed(2)), sv: JSON.parse(JSON.stringify(sv, (k, v) => typeof v === 'number' ? +v.toFixed(3) : v)), mat: (m.name || '') + '|' + m.opacity, obj: ob.name || ob.type, px: [gx, gy] });
          else glass.ok[kind]++; } }
      let speck = null; const Ds = window.__giStillDebugCanvas;
      if (Ds) { const w = Ds.under.width, h = Ds.under.height, fc = document.createElement('canvas'); fc.width = w; fc.height = h; const fx = fc.getContext('2d'); fx.drawImage(Ds.under, 0, 0); fx.drawImage(Ds.bounce, 0, 0);
        const F = fx.getImageData(0, 0, w, h).data, U = Ds.under.getContext('2d').getImageData(0, 0, w, h).data, Lf = (P, i) => (P[i] + P[i + 1] + P[i + 2]) / 3; let nF = 0, nU = 0; const pts = [];
        for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) { const i = (y * w + x) * 4;
          for (const [P, tag] of [[F, 'F'], [U, 'U']]) { const l = Lf(P, i); if (l > 20) continue; let s = 0; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if (dx || dy) s += Lf(P, ((y + dy) * w + x + dx) * 4); if (s / 8 - l < 45) continue;
            if (tag === 'F') { nF++; if (pts.length < 40 && Math.random() < 0.3) pts.push([x, y]); } else nU++; } }
        const LZs = window.LightZones, tg = [], rc = new T.Raycaster(); A.scene.traverse(o => { if ((o.isMesh || o.isInstancedMesh || o.isBatchedMesh) && o.visible && o !== A._sky) tg.push(o); });
        const cls = {}; pts.forEach(([x, y]) => { rc.setFromCamera(new T.Vector2((x + 0.5) / w * 2 - 1, 1 - (y + 0.5) / h * 2), A.camera); const q = rc.intersectObjects(tg, false)[0]; if (!q) { cls.miss = (cls.miss || 0) + 1; return; }
          const n = q.face ? q.face.normal.clone().transformDirection(q.object.matrixWorld) : null, ax = n ? Math.max(Math.abs(n.x), Math.abs(n.y), Math.abs(n.z)) : 0; if (n && n.dot(A.camera.position.clone().sub(q.point)) < 0) n.negate(); const si = LZs && LZs.surfaceInfo && n ? LZs.surfaceInfo(q.point, n) : null; const zr = si ? (si.zone === 65535 ? 65535 : si.zone) : null;
          const sf = LZs && LZs.skyField && n ? LZs.skyField(q.point, n) : null; (window.__spk = window.__spk || []).push({ zone: si && si.zone, sky: si && si.sky, F: sf && sf.F != null ? +sf.F.toFixed(3) : null, obj: (q.object.userData && q.object.userData.ifcClass) || q.object.type, gd: A.guidMap && q.object.isBatchedMesh ? A.guidMap[q.object.id + '_' + q.batchId] : null, p: q.point.toArray().map(v => +v.toFixed(2)), n: n.toArray().map(v => +v.toFixed(2)) });
          const k = (ax > 0.99 ? 'axis' : 'slope') + ':' + (zr === 65535 ? 'SOLIDoff' : zr === -1 ? 'offgrid' : zr === 0 ? 'open' : 'zone'); cls[k] = (cls[k] || 0) + 1; });
        speck = { final: nF, under: nU, sampled: pts.length, cls, samples: (window.__spk || []).slice(0, 12) }; }
      let leak = null; const Dl = window.__giStillDebugCanvas;
      if (window.__LEAK && Dl) { const w = Dl.under.width, h = Dl.under.height, fc = document.createElement('canvas'); fc.width = w; fc.height = h; const fx = fc.getContext('2d'); fx.drawImage(Dl.under, 0, 0); fx.drawImage(Dl.bounce, 0, 0);
        const F = fx.getImageData(0, 0, w, h).data, U = Dl.under.getContext('2d').getImageData(0, 0, w, h).data, LZl = window.LightZones, tg = [], rc = new T.Raycaster(), rs = new T.Raycaster();
        A.scene.traverse(o => { if ((o.isMesh || o.isInstancedMesh || o.isBatchedMesh) && o.visible && o !== A._sky) tg.push(o); });
        const sd = A.sun.position.clone().sub(A.sun.target.position).normalize(); leak = { sunDir: sd.toArray().map(v => +v.toFixed(3)), cam: LZl.at ? LZl.at(A.camera.position) : null, rows: [] };
        const GW = +(window.__LEAKW || 12), GH = +(window.__LEAKH || 9); const PXL = window.__LEAKPX || null; const NIT = PXL ? PXL.length : GW * GH; for (let it = 0; it < NIT; it++) { const gx = PXL ? it : it % GW, gy = PXL ? 0 : Math.floor(it / GW); const x = PXL ? Math.min(w - 1, Math.round(PXL[it][0] * w / innerWidth)) : Math.floor((gx + 0.5) / GW * w), y = PXL ? Math.min(h - 1, Math.round(PXL[it][1] * h / innerHeight)) : Math.floor((gy + 0.5) / GH * h);
          rc.setFromCamera(new T.Vector2((x + 0.5) / w * 2 - 1, 1 - (y + 0.5) / h * 2), A.camera); const q = rc.intersectObjects(tg, false)[0]; if (!q || !q.face) continue;
          const n = q.face.normal.clone().transformDirection(q.object.matrixWorld); if (n.dot(A.camera.position.clone().sub(q.point)) < 0) n.negate();
          const si = LZl.surfaceInfo(q.point, n), sf = LZl.skyField(q.point, n); rs.set(q.point.clone().addScaledVector(n, 0.02), sd); rs.far = 200; const shAll = rs.intersectObjects(tg, false); const sh = shAll[0]; const shOp = shAll.find(z => { const m = Array.isArray(z.object.material) ? z.object.material[0] : z.object.material; return !(m && m.transparent && m.opacity < 0.95); }); const nGlass = shOp ? shAll.indexOf(shOp) : shAll.length;
          const i = (y * w + x) * 4; leak.rows.push({ g: [gx, gy], k: Math.abs(n.y) > 0.7 ? (n.y > 0 ? 'floor' : 'ceil') : 'wall', zone: si.zone, sky: si.sky, F: sf.F == null ? null : +sf.F.toFixed(3), NdotSun: +n.dot(sd).toFixed(2), sunBlockedAt: sh ? +sh.distance.toFixed(1) : null, sunOpaqueAt: shOp ? +shOp.distance.toFixed(1) : null, glassBefore: nGlass,
            blocker: shOp ? (() => { const o = shOp.object, id = o.isBatchedMesh ? shOp.batchId : o.isInstancedMesh ? shOp.instanceId : null; let vis = null; try { if (o.isBatchedMesh) vis = o.getVisibleAt(id); } catch (e) {}
              const m = Array.isArray(o.material) ? o.material[0] : o.material; return { g: A.guidMap[o.id + '_' + id] || null, cast: o.castShadow, vis, name: (o.name || o.type).slice(0, 20), cls: o.userData && (o.userData.ifcClass || o.userData.disc), opq: m ? (m.transparent ? m.opacity : 1) : null, side: m ? m.side : null, py: +shOp.point.y.toFixed(2), n: shOp.face ? shOp.face.normal.clone().transformDirection(o.matrixWorld).toArray().map(v => +v.toFixed(2)) : null }; })() : null, Lu: Math.round((U[i] + U[i + 1] + U[i + 2]) / 3), Lf: Math.round((F[i] + F[i + 1] + F[i + 2]) / 3), p: q.point.toArray().map(v => +v.toFixed(1)),
            mat: (() => { const m = Array.isArray(q.object.material) ? q.object.material[(q.face && q.face.materialIndex) || 0] : q.object.material; return m ? { t: m.type.replace('Mesh', '').replace('Material', ''), c: m.color ? m.color.getHexString() : null, r: m.roughness != null ? +m.roughness.toFixed(2) : null, me: m.metalness != null ? +m.metalness.toFixed(2) : null, map: !!m.map, env: m.envMapIntensity != null ? +m.envMapIntensity.toFixed(2) : null, vc: !!m.vertexColors, name: (m.name || '').slice(0, 24) } : null; })(),
            cls: A.guidMap && q.object.isBatchedMesh ? A.guidMap[q.object.id + '_' + q.batchId] : (A.guidMap && q.object.isInstancedMesh ? A.guidMap[q.object.id + '_' + q.instanceId] : null) }); } }
      let hemi = null;
      if (window.__HEMI) { const tgH = []; A.scene.traverse(o => { if ((o.isMesh || o.isInstancedMesh || o.isBatchedMesh) && o.visible && o !== A._sky) tgH.push(o); }); const rh = new T.Raycaster(); hemi = [];
        window.__HEMI.forEach(pt => { const P = new T.Vector3(pt[0], pt[1] + 0.05, pt[2]); let sky = 0, glassOnly = 0, n = 0; const hits = {};
          for (let a = 0; a < 16; a++) for (let e = 0; e < 8; e++) { const el = (e + 0.5) / 8 * Math.PI / 2, az = a / 16 * 2 * Math.PI; const d = new T.Vector3(Math.cos(el) * Math.cos(az), Math.sin(el), Math.cos(el) * Math.sin(az)); rh.set(P, d); rh.far = 300;
            const hs = rh.intersectObjects(tgH, false); n++; const op = hs.filter(q => { const m = Array.isArray(q.object.material) ? q.object.material[0] : q.object.material; return !(m && m.transparent && m.opacity < 0.95); });
            if (!hs.length) sky++; else if (!op.length) glassOnly++; else { const g = A.guidMap && op[0].object.isBatchedMesh ? A.guidMap[op[0].object.id + '_' + op[0].batchId] : op[0].object.type; if (op[0].distance < 6) {} }
          }
          hemi.push({ pt, sky: +(sky / n).toFixed(3), throughGlass: +(glassOnly / n).toFixed(3), F: window.LightZones.skyField(P, new T.Vector3(0, 1, 0)).F }); }); }
      let sconce = null; const Dsc = window.__giStillDebugCanvas;
      if (window.__SCONCE && Dsc && A._lampData) { const w = Dsc.under.width, h = Dsc.under.height, fc = document.createElement('canvas'); fc.width = w; fc.height = h; const fx = fc.getContext('2d'); fx.drawImage(Dsc.under, 0, 0); fx.drawImage(Dsc.bounce, 0, 0);
        const F = fx.getImageData(0, 0, w, h).data, tg = []; A.scene.traverse(o => { if ((o.isMesh || o.isInstancedMesh || o.isBatchedMesh) && o.visible && o !== A._sky) tg.push(o); });
        const rc = new T.Raycaster(), cam = A.camera, cp = cam.position, fr = new T.Frustum().setFromProjectionMatrix(new T.Matrix4().multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse));
        const lum = (P) => { const v = P.clone().project(cam); if (v.z > 1 || Math.abs(v.x) > 1 || Math.abs(v.y) > 1) return null; rc.set(cp, P.clone().sub(cp).normalize()); const q = rc.intersectObjects(tg, false)[0]; if (!q || q.distance < P.distanceTo(cp) - 0.05) return null;
          const x = Math.round((v.x + 1) / 2 * w), y = Math.round((1 - v.y) / 2 * h), i = (y * w + x) * 4; return (F[i] + F[i + 1] + F[i + 2]) / 3; };
        sconce = [];
        for (const q of A._lampData.lamps) { const L = new T.Vector3(q.x, q.y, q.z); if (!fr.containsPoint(L) || L.distanceTo(cp) > 18 || !(q.I > 0)) continue;
          let best = null; for (const d of [[1,0,0],[-1,0,0],[0,0,1],[0,0,-1]]) { rc.set(L, new T.Vector3(...d)); rc.far = 0.6; const hh = rc.intersectObjects(tg, false).find(z => z.distance > 0.02 && z.face && Math.abs(z.face.normal.clone().transformDirection(z.object.matrixWorld).y) < 0.3); if (hh && (!best || hh.distance < best.distance)) best = hh; }
          if (!best) continue; const n = best.face.normal.clone().transformDirection(best.object.matrixWorld); if (n.dot(L.clone().sub(best.point)) < 0) n.negate(); if (n.dot(cp.clone().sub(best.point)) <= 0) continue;
          const up = new T.Vector3(0, 1, 0), side = new T.Vector3().crossVectors(n, up).normalize(); const ring = {};
          for (const r of [0.3, 0.6, 1.0, 1.6, 2.5]) { const vals = []; for (const dir of [side, side.clone().negate(), up.clone().negate()]) { const v = lum(best.point.clone().addScaledVector(dir, r).addScaledVector(n, 0.005)); if (v != null) vals.push(v); } ring[r] = vals.length ? +(vals.reduce((a, b) => a + b) / vals.length).toFixed(1) : null; }
          sconce.push({ p: [q.x, q.y, q.z].map(v => +v.toFixed(2)), I: +q.I.toFixed(4), dWall: +best.distance.toFixed(2), ring }); if (sconce.length >= 8) break; } }

      let stair = null; const Dst = window.__giStillDebugCanvas;
      if (window.__STAIR && Dst) { const w = Dst.under.width, h = Dst.under.height, fc = document.createElement('canvas'); fc.width = w; fc.height = h; const fx = fc.getContext('2d'); fx.drawImage(Dst.under, 0, 0); fx.drawImage(Dst.bounce, 0, 0);
        const F = fx.getImageData(0, 0, w, h).data, U = Dst.under.getContext('2d').getImageData(0, 0, w, h).data, LZs = window.LightZones, tg = [], rc = new T.Raycaster(), up = new T.Raycaster(), rs = new T.Raycaster();
        A.scene.traverse(o => { if ((o.isMesh || o.isInstancedMesh || o.isBatchedMesh) && o.visible && o !== A._sky) { const m = Array.isArray(o.material) ? o.material[0] : o.material; if (m && !m.isMeshBasicMaterial && !(m.transparent && m.opacity < 0.95)) tg.push(o); } });
        const cls = q => { const o = q.object, id = o.isBatchedMesh ? q.batchId : o.isInstancedMesh ? q.instanceId : null, g = A.guidMap[o.id + '_' + id] || null, mt = g && A.metaByGuid ? A.metaByGuid[g] : null; return { g, c: (mt && (mt.ifc_class || mt.cls)) || null }; };
        const sd = A.sun.position.clone().sub(A.sun.target.position).normalize(); const rows = []; const GW = +(window.__STAIRW || 64), GH = +(window.__STAIRH || 36); const t0 = performance.now();
        for (let gy = 0; gy < GH; gy++) for (let gx = 0; gx < GW; gx++) { if (performance.now() - t0 > 240000) break; const x = Math.floor((gx + 0.5) / GW * w), y = Math.floor((gy + 0.5) / GH * h);
          rc.setFromCamera(new T.Vector2((x + 0.5) / w * 2 - 1, 1 - (y + 0.5) / h * 2), A.camera); const q = rc.intersectObjects(tg, false)[0]; if (!q || !q.face) continue;
          const n = q.face.normal.clone().transformDirection(q.object.matrixWorld); if (n.dot(A.camera.position.clone().sub(q.point)) < 0) n.negate(); if (n.y < 0.9) continue;
          up.set(q.point.clone().add(new T.Vector3(0, 0.03, 0)), new T.Vector3(0, 1, 0)); up.far = 15; const u0 = up.intersectObjects(tg, false)[0]; const uc = u0 ? cls(u0) : null;
          rs.set(q.point.clone().addScaledVector(n, 0.03), sd); rs.far = 300; const s0 = rs.intersectObjects(tg, false)[0]; const sc = s0 ? cls(s0) : null;
          const sf = LZs.skyField(q.point, n), i = (y * w + x) * 4;
          rows.push({ g: [gx, gy], p: q.point.toArray().map(v => +v.toFixed(2)), up: u0 ? +u0.distance.toFixed(2) : null, upCls: uc && uc.c, upG: uc && uc.g, sun: s0 ? +s0.distance.toFixed(1) : null, sunCls: sc && sc.c, F: sf.F == null ? null : +sf.F.toFixed(4), zone: sf.zone, Lu: Math.round((U[i] + U[i + 1] + U[i + 2]) / 3), Lf: Math.round((F[i] + F[i + 1] + F[i + 2]) / 3) }); }
        stair = { ms: Math.round(performance.now() - t0), rows }; }
      return { cul: r, fault: A._stillFaultLast, contact: contact, fix: fix, glass: glass, speck: speck, leak: leak, hemi: hemi, sconce: sconce, stair: stair }; });
    if (cul.stair) L.push('§STAIR_GRID ' + JSON.stringify(cul.stair));
    if (cul.sconce) L.push('§SCONCE_RING ' + JSON.stringify(cul.sconce));
    if (cul.hemi) L.push('§HEMI ' + JSON.stringify(cul.hemi));
    if (cul.leak) L.push('§LEAK_GRID ' + JSON.stringify(cul.leak));
    if (cul.speck) L.push('§SPECKLE ' + JSON.stringify(cul.speck));
    if (cul.glass) L.push('§GLASS_DARK_CENSUS ' + JSON.stringify(cul.glass));
    if (cul.fix) L.push('§FIXTURE_PIXELS ' + JSON.stringify(cul.fix));
    if (cul.contact) L.push('§CONTACT_BOUNCE ' + JSON.stringify(cul.contact));
    fs.writeFileSync(OUT + tag + '.log', L.join('\n') + '\n'); fs.writeFileSync(OUT + tag + '.cul.json', JSON.stringify(cul, null, 1));
    await p.screenshot({ path: OUT + tag + '_mine.png' }); console.log(tag, L.length, 'lines', 'culprits', cul.cul.length); await p.close(); }
  await b.close(); })().catch(e => { console.log('FATAL ' + e.message); process.exit(1); });
