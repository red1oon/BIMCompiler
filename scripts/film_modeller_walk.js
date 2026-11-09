// ⚠ DO NOT REMOVE — Scope guard  (MODELLER WALK film recorder: before → click → build-up → after, per discipline)
// Spec: prompts/MODELLER_MASTER.md §FILM-WALK-BEFORE-AFTER. Owner 2026-11-09: "It should show before and after a walker lays
//   devices ... When it says x-ray, there is no lip synch to the canvas. When a walker is clicked, the visual effect is not shown".
// THE ISSUE this proves/disproves: the take shows each walk's BEFORE, the real click, the build-up drawing the devices in (uncut,
//   real time), and the AFTER; every state-naming beat is stamped AFTER its § line lands (§FILM_SYNC dt in [0,0.5)).
//   The trailer recorder cut from the click to §DISC-WALK-COMMIT, which removed the build-up.
// Generic: no building name in this file. The input is a resident key or a local DB path given on the command line.
// §-log first — READ <out>/walk_film.log and <out>/walk_film.page.log before any conclusion. Exit code is not evidence.
// Run:  node scripts/film_modeller_walk.js <res:Duplex | /path/to.db> <ELEC,ACMV,...> <outDir>
//       VIEWER_REPO=/tmp/wt-x films a worktree · FILM_GPU=real uses the GPU flags (take only on the owner's go, nvidia-smi first).
'use strict';
const { chromium } = require(require('os').homedir() + '/bim-ootb/tests/node_modules/playwright');
const http = require('http'), fs = require('fs'), path = require('path'), os = require('os'), { execFileSync } = require('child_process');

const REPO = process.env.VIEWER_REPO || path.join(os.homedir(), 'bim-ootb');
const SRC = process.argv[2] || 'res:Duplex', DISCS = String(process.argv[3] || 'ELEC').split(',').filter(Boolean);
const OUT = path.resolve(process.argv[4] || '.'); const FR = path.join(OUT, 'frames'); fs.mkdirSync(FR, { recursive: true });
const LOG = [], PAGELOG = [], PAGET = [];
const say = (s) => { LOG.push(s); console.log(s); };
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.db': 'application/octet-stream', '.png': 'image/png',
  '.css': 'text/css', '.wasm': 'application/wasm', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.hdr': 'application/octet-stream', '.woff2': 'font/woff2', '.sql': 'text/plain' };
const server = http.createServer((req, res) => { const p = decodeURIComponent(req.url.split('?')[0]); const fp = path.join(REPO, p === '/' ? '/index.html' : p);
  fs.stat(fp, (e, st) => { if (e || st.isDirectory()) { res.writeHead(404); res.end('404 ' + p); return; }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream', 'Content-Length': st.size }); fs.createReadStream(fp).pipe(res); }); });

// the same visible cursor + click ripple as film_modeller_trailer.js (an overlay, stated: headless draws no pointer)
const CURSOR = `(() => { const go = () => { if (document.getElementById('__fc')) return;
  const c = document.createElement('div'); c.id = '__fc';
  c.style.cssText = 'position:fixed;left:0;top:0;width:22px;height:22px;margin:-3px 0 0 -3px;z-index:2147483647;pointer-events:none;' +
    'background:url("data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2222%22 height=%2222%22><path d=%22M3 2 L3 18 L7.5 14 L10.5 20.5 L13 19.4 L10.1 13 L16 13 Z%22 fill=%22white%22 stroke=%22black%22 stroke-width=%221.4%22/></svg>") no-repeat;transition:none';
  document.documentElement.appendChild(c);
  const at = (e) => { c.style.left = e.clientX + 'px'; c.style.top = e.clientY + 'px'; };
  addEventListener('mousemove', at, true);
  addEventListener('mousedown', (e) => { at(e); const r = document.createElement('div');
    r.style.cssText = 'position:fixed;z-index:2147483646;pointer-events:none;border:3px solid #ffb400;border-radius:50%;width:10px;height:10px;' +
      'left:' + (e.clientX - 5) + 'px;top:' + (e.clientY - 5) + 'px;transition:all .45s ease-out;opacity:1';
    document.documentElement.appendChild(r); requestAnimationFrame(() => { r.style.transform = 'scale(4)'; r.style.opacity = '0'; });
    setTimeout(() => r.remove(), 600); }, true); };
  if (document.documentElement) go(); else addEventListener('DOMContentLoaded', go); })();`;

// In-page: how many of disc's walked instances are on the canvas, and how big (law 2026-11-09: a shot claimed to show an
// element logs its projected size). Bounding-sphere radius of the bucket geometry, projected at the instance's distance.
const VIS = (disc) => {
  const g = window.Bonsai.group(); const root = g && g.children.find(o => o.userData && o.userData.dwRoot);
  const ims = root ? root.children.filter(o => o.isInstancedMesh && o.userData.dwDisc === disc && o.visible) : [];
  const cam = window.A.camera; cam.updateMatrixWorld(); const H = window.A.renderer.domElement.clientHeight || innerHeight;
  const m = new THREE.Matrix4(), v = new THREE.Vector3(), px = []; let n = 0, inF = 0;
  ims.forEach(im => { if (!im.geometry.boundingSphere) im.geometry.computeBoundingSphere(); const r = im.geometry.boundingSphere.radius;
    for (let i = 0; i < im.count; i++) { n++; im.getMatrixAt(i, m); v.setFromMatrixPosition(m).applyMatrix4(im.matrixWorld);
      const d = v.distanceTo(cam.position); const p = v.clone().project(cam);
      if (Math.abs(p.x) <= 1 && Math.abs(p.y) <= 1 && p.z < 1) { inF++; px.push(2 * r / (d * Math.tan(cam.fov * Math.PI / 360)) * H / 2); } } });
  px.sort((a, b) => a - b);
  return { n, inFrame: inF, medianPx: px.length ? +px[px.length >> 1].toFixed(1) : 0 };
};
const SCENE_N = (disc) => { const g = window.Bonsai.group(); const root = g && g.children.find(o => o.userData && o.userData.dwRoot);
  if (!root) return 0; let n = 0; root.children.forEach(o => { if (o.userData && (o.userData.dwDisc === disc || o.userData.dwDrawn === disc)) n += o.isInstancedMesh ? o.count : 1; }); return n; };

(async () => {
  await new Promise(r => server.listen(0, r));
  const base = 'http://localhost:' + server.address().port;
  const gpu = process.env.FILM_GPU === 'real';
  const browser = await chromium.launch({ args: ['--no-sandbox'].concat(gpu ? ['--use-angle=gl', '--ignore-gpu-blocklist', '--enable-gpu-rasterization'] : []) });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 810 }, deviceScaleFactor: 4 / 3 });
  await ctx.addInitScript(CURSOR);
  const page = await ctx.newPage();
  page.on('load', () => page.evaluate(CURSOR).catch(() => {}));
  page.on('console', m => { PAGELOG.push(m.text()); PAGET.push(Date.now() / 1000); }); page.on('pageerror', e => { PAGELOG.push('PAGEERR ' + e); PAGET.push(Date.now() / 1000); });
  const last = (n, re) => { for (let i = PAGELOG.length - 1; i >= n; i--) if (re.test(PAGELOG[i])) return { line: PAGELOG[i], t: PAGET[i] }; return null; };
  const waitLog = async (n, re, ms) => { const t0 = Date.now(); while (Date.now() - t0 < (ms || 20000)) { const r = last(n, re); if (r) return r; await page.waitForTimeout(100); } return null; };
  const hold = (ms) => page.waitForTimeout(ms);
  const frames2 = () => page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));

  await page.goto(base + '/modeller/modeller.html', { waitUntil: 'load' });
  await page.evaluate(() => new Promise(r => { try { localStorage.clear(); } catch (e) { /* */ } const q = indexedDB.databases ? indexedDB.databases() : Promise.resolve([]); q.then(list => Promise.all((list || []).map(d => new Promise(ok => { const x = indexedDB.deleteDatabase(d.name); x.onsuccess = x.onerror = x.onblocked = () => ok(); })))).then(r, r); }));
  await page.goto(base + '/modeller/modeller.html', { waitUntil: 'load' });
  await page.waitForFunction(() => window.__sceneReady === true && window.Bonsai && typeof window.discWalk === 'function', null, { timeout: 120000 });
  say('§FILM_GPU ' + await page.evaluate(() => { const g = document.createElement('canvas').getContext('webgl2'); const d = g && g.getExtension('WEBGL_debug_renderer_info'); return d ? g.getParameter(d.UNMASKED_RENDERER_WEBGL) : 'none'; }));

  // ── screencast + cuts (as the trailer) ──
  const frames = []; let T0 = null, cdp = null, cutting = false, cutTotal = 0, cutAt = 0;
  cdp = await ctx.newCDPSession(page);
  cdp.on('Page.screencastFrame', async f => {
    if (!cutting) { const fn = path.join(FR, String(frames.length).padStart(6, '0') + '.jpg'); fs.writeFileSync(fn, Buffer.from(f.data, 'base64')); frames.push({ fn, ts: f.metadata.timestamp - cutTotal }); if (T0 === null) T0 = f.metadata.timestamp; }
    cdp.send('Page.screencastFrameAck', { sessionId: f.sessionId }).catch(() => {}); });
  await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 90, maxWidth: 1920, maxHeight: 1080, everyNthFrame: 1 });
  const now = () => (T0 === null ? 0 : Date.now() / 1000 - T0 - cutTotal);
  const cutStart = (why) => { cutting = true; cutAt = Date.now() / 1000; say('§FILM_CUT start t=' + now().toFixed(2) + ' ' + why); };
  const cutEnd = (why) => { if (!cutting) return; const d = Date.now() / 1000 - cutAt; cutTotal += d; cutting = false; say('§FILM_CUT end removed=' + d.toFixed(2) + 's total=' + cutTotal.toFixed(2) + ' ' + (why || '')); };
  const beat = (id, note) => say('§FILM_BEAT id=' + id + ' t=' + now().toFixed(2) + ' ' + (note || ''));
  const sync = (id, hit, note) => { const dt = Date.now() / 1000 - hit.t; beat(id, note); say('§FILM_SYNC beat=' + id + ' line="' + hit.line.slice(0, 80) + '" dt=' + dt.toFixed(3) + (dt >= 0 && dt < 0.5 ? '' : ' OUT-OF-SYNC')); };
  let clicks = 0;
  async function glide(sel) { const loc = page.locator(sel).first(); await loc.scrollIntoViewIfNeeded().catch(() => {}); const b = await loc.boundingBox(); if (!b) throw new Error('no box for ' + sel);
    await page.mouse.move(b.x + Math.min(b.width / 2, 60), b.y + b.height / 2, { steps: 22 }); await hold(160); }
  async function hclick(sel) { await glide(sel); clicks++; await page.mouse.down(); await hold(60); await page.mouse.up(); }
  const flySettle = async () => { for (let i = 0; i < 1200 && await page.evaluate(() => !!window.__flyLive); i++) await hold(100); await hold(250); };
  const vis = async (tag, disc) => { const v = await page.evaluate(VIS, disc); say('§FILM_VIS beat=' + tag + ' disc=' + disc + ' inFrame=' + v.inFrame + ' of=' + v.n + ' medianPx=' + v.medianPx + (v.inFrame ? '' : ' (NOT presented as showing devices)')); return v; };

  try {
    // ── 1 open: Open icon → resident row or local row; cut over the load + the ARC seed ──
    beat('open', 'Open icon'); await hold(1200); await hclick('#b-open'); await hold(500);
    let n1 = PAGELOG.length;
    if (/^res:/.test(SRC)) { await hclick('#m-open-panel .mo-row[data-key="' + SRC.slice(4) + '"]'); }
    else { await glide('#m-open-panel .mo-row[data-key="__local"]');
      const [ch] = await Promise.all([page.waitForEvent('filechooser'), (async () => { clicks++; await page.mouse.down(); await hold(60); await page.mouse.up(); })()]); await ch.setFiles(SRC); }
    cutStart('building loads + signed seed');
    await page.waitForFunction(() => !!window.__dwBuf && !!window.__arcSeedReady, null, { timeout: 2400000, polling: 1000 }).catch(() => {});
    await page.evaluate(async () => { await window.__arcSeedReady; }).catch(() => {});
    const seed = await waitLog(n1, /§WALK-AFTER-SEED seed settled|seed settled/, 5000);
    await page.evaluate(() => { try { localStorage.setItem('dagevu_modeller_ol_open', '1'); } catch (e) { /* */ } document.body.classList.remove('ol-collapsed'); });
    if (await page.locator('#b-fit').first().isVisible().catch(() => false)) { await page.click('#b-fit'); await hold(1500); await flySettle(); }
    await hold(800); cutEnd('loaded'); say('§FILM_FACT open=' + (seed ? seed.line.slice(0, 120) : 'no seed line') + ' name=' + await page.evaluate(() => window.__dwName || '?'));
    beat('loaded', 'the building, before any walk'); await hold(2500);

    // ── 2 X-ray, stamped after its § line + two frames (the old trailer stamped it before the glide) ──
    n1 = PAGELOG.length; await hclick('#b-xray');
    const xr = await waitLog(n1, /§MODELLER xray on/, 6000); await frames2();
    if (xr) sync('xray', xr, 'X-ray on: walls go glass so walked devices show'); else say('§FILM_SYNC beat=xray MISSING (no §MODELLER xray on)');
    await hold(2500);

    for (const disc of DISCS) {
      const sel = '#bo-tree [data-disc="' + disc + '"]';
      await page.evaluate(() => { const ol = window.Bonsai.outliner; if (ol && ol._paint) ol._paint(); });
      const before = await page.evaluate(d => ((window.__dwWalks || {})[d] || []).length, disc);
      beat(disc + '_before', 'before the ' + disc + ' walk'); say('§FILM_BEFORE disc=' + disc + ' walked=' + before + ' sceneN=' + await page.evaluate(SCENE_N, disc));
      await hold(2600);
      const hasRow = await page.evaluate(s => !!document.querySelector(s), sel);
      if (!hasRow) { say('§FILM_CLICK disc=' + disc + ' NO-ROW (walk row absent in the Outliner; skipped, never faked)'); continue; }
      n1 = PAGELOG.length; const sn0 = await page.evaluate(SCENE_N, disc);
      await page.evaluate(() => { window.__dwLastDoneDisc = null; });
      await hclick(sel); beat(disc + '_click', 'click the ' + disc + ' walk row'); await hold(400);
      // COMPUTE: cut until the scene starts to change (reveal armed, or walked objects appear), never until the commit
      cutStart(disc + ' walk computes');
      let started = null;
      for (let i = 0; i < 36000 && !started; i++) {
        started = await page.evaluate((a) => { const d = a[0]; const m = window.__dwRevealMeta && window.__dwRevealMeta[d]; const r = window.__dwReveal && window.__dwReveal[d];
          const n = (function () { const g = window.Bonsai.group(); const root = g && g.children.find(o => o.userData && o.userData.dwRoot); if (!root) return 0; let k = 0; root.children.forEach(o => { if (o.userData && (o.userData.dwDisc === d || o.userData.dwDrawn === d)) k += o.isInstancedMesh ? o.count : 1; }); return k; })();
          if (m || (r && !r.done && r.i > 0)) return 'reveal'; if (n !== a[1]) return 'scene'; if (window.__dwLastDoneDisc === d) return 'done'; return null; }, [disc, sn0]);
        if (!started) await hold(100);
      }
      cutEnd(disc + ' change starts: ' + started);
      sync(disc + '_reveal', { line: '§FILM change=' + started, t: Date.now() / 1000 }, 'the ' + disc + ' devices come on');
      // REVEAL, uncut, until the walk is done and the build-up finished
      const samples = []; let lastS = 0;
      for (let i = 0; i < 6000; i++) {
        const st = await page.evaluate(d => { const r = window.__dwReveal && window.__dwReveal[d]; return { i: r ? r.i : null, n: r ? r.n : null, revDone: !(window.__dwRevealMeta && window.__dwRevealMeta[d]), walkDone: window.__dwLastDoneDisc === d }; }, disc);
        if (Date.now() - lastS > 1000) { lastS = Date.now(); samples.push(st.i); say('§FILM_REVEAL_FRAME disc=' + disc + ' i=' + st.i + ' n=' + st.n + ' t=' + now().toFixed(2)); }
        if (st.walkDone && st.revDone) break; await hold(100);
      }
      const rising = samples.filter(x => x != null).filter((x, k, a) => k > 0 && x > a[k - 1]).length;
      say('§FILM_REVEAL disc=' + disc + ' samples=' + samples.length + ' rising=' + rising + (rising >= 2 ? '' : ' VACUOUS (the build-up was not seen growing)'));
      const wl = last(n1, new RegExp('§DISC-WALK ' + disc + ' (placed=|REFUSE)'));
      await hold(600); beat(disc + '_after', 'after the ' + disc + ' walk');
      say('§FILM_AFTER disc=' + disc + ' ' + (wl ? wl.line.slice(0, 160) : 'no §DISC-WALK line'));
      await vis(disc + '_after', disc); await hold(2600);
      // GLIMPSE: the largest walked type row → set highlight + frame (W-E2E-TYPESET-ZOOM), then back
      const row = await page.evaluate(d => { const W = (window.__dwWalks || {})[d] || [], by = {}; W.forEach(p => { const c = (p && p.ifc_class) || (p && p.piece_type) || 'Unknown'; by[c] = (by[c] || 0) + 1; });
        const best = Object.keys(by).sort((a, b) => by[b] - by[a])[0]; return best ? { id: 'dwc|' + d + '|' + best, n: by[best] } : null; }, disc);
      if (row && await page.evaluate(id => !!document.querySelector('[data-bnode="' + id + '"]'), row.id)) {
        n1 = PAGELOG.length; await hclick('[data-bnode="' + row.id + '"]');
        // stamped when the highlight is on screen (the § line + two frames), not after the camera fly
        const is = await waitLog(n1, /§INSTSET-SELECT/, 6000); await frames2();
        if (is) sync(disc + '_glimpse', is, 'one type of ' + disc + ' device, highlighted, the camera frames the set'); else say('§FILM_SYNC beat=' + disc + '_glimpse MISSING (no §INSTSET-SELECT)');
        await flySettle(); await vis(disc + '_glimpse', disc); await hold(2200);
        await page.keyboard.press('Escape'); await hold(300);
        // CLOSE-UP: one device, framed at a visible size from the side a ray can see it (W-E2E-SINGLE-FRAME). Prefer a
        // ceiling-hung one (mount BOTTOM, seen from below); skip a leaf whose §FRAME-LEAF says occluded=both.
        const leaves = await page.evaluate(d => { const W = (window.__dwWalks || {})[d] || [], out = [];
          W.forEach((p, i) => { if (p && p.mount === 'BOTTOM') out.push(i); }); W.forEach((p, i) => { if (p && p.mount !== 'BOTTOM') out.push(i); }); return out.slice(0, 6); }, disc);
        let shown = false;
        for (const idx of leaves) {
          const lsel = '[data-bnode="dwp|' + disc + '|' + idx + '"]';
          if (!await page.evaluate(s2 => !!document.querySelector(s2), lsel)) continue;
          n1 = PAGELOG.length; await hclick(lsel);
          const fl = await waitLog(n1, /§FRAME-LEAF/, 6000);
          if (!fl) { say('§FILM_CLOSEUP disc=' + disc + ' idx=' + idx + ' no §FRAME-LEAF (main without §SINGLE-FRAME?)'); break; }
          if (/occluded=both/.test(fl.line)) { say('§FILM_CLOSEUP disc=' + disc + ' idx=' + idx + ' skipped: ' + fl.line.slice(0, 120)); continue; }
          await flySettle(); await frames2();
          sync(disc + '_closeup', { line: '§FILM fly-end after ' + fl.line.slice(0, 60), t: Date.now() / 1000 }, 'one ' + disc + ' device, close');
          const lv = await page.evaluate((a) => { const g = window.Bonsai.group(); const root = g.children.find(o => o.userData && o.userData.dwRoot); const rec = window.__dwWalks[a[0]][a[1]];
            for (const im of root.children) { if (!im.isInstancedMesh || !Array.isArray(im.userData.dwSub)) continue; const i = im.userData.dwSub.indexOf(rec); if (i < 0) continue;
              const cam = window.A.camera; cam.updateMatrixWorld(); if (!im.geometry.boundingBox) im.geometry.computeBoundingBox(); const m = new THREE.Matrix4(); im.getMatrixAt(i, m);
              const bb = im.geometry.boundingBox.clone().applyMatrix4(m.premultiply(im.matrixWorld)); const c = bb.getCenter(new THREE.Vector3()); let y0 = 1, y1 = -1;
              for (const x of [bb.min.x, bb.max.x]) for (const y of [bb.min.y, bb.max.y]) for (const z of [bb.min.z, bb.max.z]) { const v = new THREE.Vector3(x, y, z).project(cam); y0 = Math.min(y0, v.y); y1 = Math.max(y1, v.y); }
              const rc = new THREE.Raycaster(); rc.set(cam.position.clone(), c.clone().sub(cam.position).normalize());
              const h = rc.intersectObjects(window.A.scene.children, true).find(x => x.object.visible !== false && x.object.isMesh && !(x.object.material && x.object.material.visible === false));
              const H = window.A.renderer.domElement.clientHeight || innerHeight;
              return { px: Math.round((y1 - y0) / 2 * H), firstIsIt: !!(h && h.object === im && h.instanceId === i) }; } return null; }, [disc, idx]);
          say('§FILM_VIS beat=' + disc + '_closeup idx=' + idx + ' px=' + (lv && lv.px) + ' firstRayHit=' + (lv && lv.firstIsIt ? 'the device' : 'something else'));
          await hold(2400); await page.keyboard.press('Escape'); await hold(300); shown = true; break;
        }
        if (!shown) say('§FILM_CLOSEUP disc=' + disc + ' none shown (no visible leaf among ' + leaves.length + ')');
        if (await page.locator('#b-fit').first().isVisible().catch(() => false)) { await hclick('#b-fit'); await hold(900); await flySettle(); }
      } else say('§FILM_GLIMPSE disc=' + disc + ' no type row (skipped)');
    }
    beat('end', 'all walks done'); await hold(2500);
    say('§FILM_CURSOR clicks=' + clicks);
  } catch (e) { say('§FILM_ERROR ' + String(e.message).split('\n')[0]); }

  await cdp.send('Page.stopScreencast').catch(() => {}); await hold(300).catch(() => {});
  const endTs = Date.now() / 1000 - cutTotal;
  fs.writeFileSync(path.join(OUT, 'walk_film.page.log'), PAGELOG.join('\n') + '\n');
  say('§FILM_PAGEERR n=' + PAGELOG.filter(l => l.startsWith('PAGEERR')).length);
  const lines = []; frames.forEach((f, i) => { const d = (i + 1 < frames.length ? frames[i + 1].ts : endTs) - f.ts; lines.push(`file '${f.fn}'`, `duration ${Math.max(d, 0.001).toFixed(4)}`); });
  if (frames.length) lines.push(`file '${frames[frames.length - 1].fn}'`);
  fs.writeFileSync(path.join(OUT, 'frames.txt'), lines.join('\n') + '\n');
  const mp4 = path.join(OUT, 'walk_film.mp4');
  try { execFileSync('ffmpeg', ['-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', path.join(OUT, 'frames.txt'), '-vf', 'fps=24,scale=1920:1080:flags=lanczos,format=yuv420p', '-c:v', 'libx264', '-crf', '18', '-preset', 'medium', mp4]);
    say('§FILM_DONE frames=' + frames.length + ' dur=' + (endTs - (T0 || endTs)).toFixed(2) + ' out=' + mp4); } catch (e) { say('§FILM_ERROR ffmpeg ' + String(e.message).split('\n')[0]); }
  await browser.close();
  fs.writeFileSync(path.join(OUT, 'walk_film.log'), LOG.join('\n') + '\n');
  server.close();
})();
