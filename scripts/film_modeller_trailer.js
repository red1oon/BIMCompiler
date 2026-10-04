// ⚠ DO NOT REMOVE — Scope guard  (MODELLER TRAILER recorder; helpers copied from film_viewer_trailer.js)
// Scope: §MODELLER-TRAILER (prompts/FILM_NARRATION.md §9 STORYBOARD v1 + RECORDER SPEC). ONE continuous take of the DAGeVu
//   Modeller (modeller/modeller.html) on the Duplex resident, driven like a user; the UI language switches through the REAL
//   flag button (#header-flag-btn, S226 §R3) — the switch itself is cut, only the g_pick demo shows the picker.
//   Canvas aiming = the Modeller e2e harness's OWN window.__e2e (modeller/tests/e2e_harness.js), injected verbatim at run time.
// THE ISSUE this proves/disproves: can the Modeller's authoring loop (open → assemble/draw → move → walk → scrub → save/share) be
//   filmed end to end with no human, every claim backed by the take's own § lines (§FILM_FACT). A step it cannot do is printed.
// §-log first — READ <out>/modeller_film.log and <out>/modeller_film.page.log before any conclusion.
// Run:  flock /tmp/claude-1000/gpu.lock node scripts/film_modeller_trailer.js <outDir>   → <outDir>/modeller_film.mp4
//       VIEWER_REPO=/tmp/wt-x films a worktree · BEAT_MIN='{"m01":7.5,…}' holds each beat to its fitted speech length.
'use strict';
const { chromium } = require(require('os').homedir() + '/bim-ootb/tests/node_modules/playwright');
const http = require('http'), fs = require('fs'), path = require('path'), os = require('os'), { execFileSync, spawn } = require('child_process');

const REPO = process.env.VIEWER_REPO || path.join(os.homedir(), 'bim-ootb');
const OUT = path.resolve(process.argv[2] || '.'); const FR = path.join(OUT, 'frames'); fs.mkdirSync(FR, { recursive: true });
const LOG = [], PAGELOG = [];
const say = (s) => { LOG.push(s); console.log(s); };
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.db': 'application/octet-stream', '.png': 'image/png', '.css': 'text/css',
  '.wasm': 'application/wasm', '.zip': 'application/zip', '.svg': 'image/svg+xml', '.mjs': 'text/javascript', '.jpg': 'image/jpeg', '.ifc': 'application/octet-stream',
  '.glb': 'model/gltf-binary', '.webp': 'image/webp', '.xml': 'application/xml', '.mp3': 'audio/mpeg', '.wav': 'audio/wav', '.ogg': 'audio/ogg' };
const server = http.createServer((req, res) => { const p = decodeURIComponent(req.url.split('?')[0]); const fp = path.join(REPO, p === '/' ? '/index.html' : p);
  fs.stat(fp, (e, st) => { if (e || st.isDirectory()) { res.writeHead(404); res.end('404 ' + p); return; }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream', 'Content-Length': st.size }); fs.createReadStream(fp).pipe(res); }); });

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

const LANGS = ['en_MY', 'fr_FR', 'es_ES', 'de_DE', 'ar_SA', 'zh_CN', 'ja_JP', 'ms_MY', 'th_TH', 'ko_KR', 'pt_BR', 'id_ID', 'bn_BD'];
// the harness's own aiming object, verbatim (never re-implemented here): the body of `window.__e2e = { … };` in e2e_harness.js
const HARNESS = fs.readFileSync(path.join(REPO, 'modeller', 'tests', 'e2e_harness.js'), 'utf8');
const E2E_SRC = (() => { const a = HARNESS.indexOf('window.__e2e = {'), b = HARNESS.indexOf('}; return true;', a); if (a < 0 || b < 0) throw new Error('e2e_harness.js: __e2e block not found'); return HARNESS.slice(a, b + 2); })();

(async () => {
  await new Promise(r => server.listen(0, r));
  const base = 'http://localhost:' + server.address().port;
  let sinkMod = null, rec = null, audioT0 = null;
  try { sinkMod = execFileSync('pactl', ['load-module', 'module-null-sink', 'sink_name=film_sink', 'sink_properties=device.description=film_sink']).toString().trim();
    rec = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'pulse', '-i', 'film_sink.monitor', '-ac', '2', '-ar', '48000', path.join(OUT, 'page_audio.wav')]); audioT0 = Date.now() / 1000;
    say('§FILM_AUDIO sink=film_sink module=' + sinkMod + ' recStart=' + audioT0.toFixed(3));
  } catch (e) { say('§FILM_AUDIO unavailable ' + e.message); }
  const browser = await chromium.launch({ args: ['--no-sandbox', '--use-angle=gl', '--ignore-gpu-blocklist', '--enable-gpu-rasterization', '--autoplay-policy=no-user-gesture-required'],
    ignoreDefaultArgs: ['--mute-audio'], env: Object.assign({}, process.env, { PULSE_SINK: 'film_sink' }) });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 810 }, deviceScaleFactor: 4 / 3, acceptDownloads: true });
  await ctx.addInitScript(CURSOR);
  let page = await ctx.newPage();
  page.on('load', () => page.evaluate(CURSOR).catch(() => {}));
  page.on('console', m => PAGELOG.push(m.text())); page.on('pageerror', e => PAGELOG.push('PAGEERR ' + e)); page.on('dialog', async d => { PAGELOG.push('DIALOG ' + d.message()); await d.dismiss(); });
  const last = (n, re) => PAGELOG.slice(n).filter(l => re.test(l)).pop() || '';
  const waitLog = async (n, re, ms) => { for (let i = 0; i < (ms || 20000) / 100 && !last(n, re); i++) await page.waitForTimeout(100); return last(n, re); };
  const fact = (k, v) => say('§FILM_FACT ' + k + '=' + String(v).replace(/\s+/g, ' ').slice(0, 320));

  // clean start: no saved state (op-logs live in IndexedDB, the pill rail + outliner state in localStorage)
  await page.goto(base + '/modeller/modeller.html', { waitUntil: 'load' });
  await page.evaluate(() => new Promise(r => { try { localStorage.clear(); } catch (e) { /* */ } const q = indexedDB.databases ? indexedDB.databases() : Promise.resolve([]); q.then(list => Promise.all((list || []).map(d => new Promise(ok => { const x = indexedDB.deleteDatabase(d.name); x.onsuccess = x.onerror = x.onblocked = () => ok(); })))).then(r, r); }));
  await page.evaluate((b) => { localStorage.setItem('bim_ootb_config', JSON.stringify({ locale: b })); }, LANGS[0]);
  await page.goto(base + '/modeller/modeller.html', { waitUntil: 'load' });
  await page.waitForFunction(() => window.__sceneReady === true && window._TRL_LOADER && window._TRL_LOADER.setLocale, null, { timeout: 60000 });
  await page.evaluate(E2E_SRC + '; true');
  fact('gpu', await page.evaluate(() => { const g = document.createElement('canvas').getContext('webgl2'); const d = g && g.getExtension('WEBGL_debug_renderer_info'); return d ? g.getParameter(d.UNMASKED_RENDERER_WEBGL) : 'none'; }));

  // ── screencast + cuts (as film_viewer_trailer.js) ──
  const frames = []; let T0 = null; let cdp = null;
  let cutting = false, cutTotal = 0, cutAt = 0; const cutOwners = new Set();
  async function castOn(p) {
    if (cdp) { await cdp.send('Page.stopScreencast').catch(() => {}); }
    cdp = await ctx.newCDPSession(p); const me = cdp;
    me.on('Page.screencastFrame', async f => {
      if (me !== cdp) return;
      if (cutting) { me.send('Page.screencastFrameAck', { sessionId: f.sessionId }).catch(() => {}); return; }
      const fn = path.join(FR, String(frames.length).padStart(6, '0') + '.jpg');
      fs.writeFileSync(fn, Buffer.from(f.data, 'base64')); frames.push({ fn, ts: f.metadata.timestamp - cutTotal });
      if (T0 === null) { T0 = f.metadata.timestamp; say('§FILM_AUDIO T0=' + T0.toFixed(3)); }
      me.send('Page.screencastFrameAck', { sessionId: f.sessionId }).catch(() => {});
    });
    await me.send('Page.startScreencast', { format: 'jpeg', quality: 90, maxWidth: 1920, maxHeight: 1080, everyNthFrame: 1 });
  }
  await castOn(page);
  const now = () => (T0 === null ? 0 : Date.now() / 1000 - T0 - cutTotal);
  const cutStart = (why, own) => { own = own || 'rec'; const first = !cutOwners.size; cutOwners.add(own); if (!first) { say('§FILM_CUT join owner=' + own + ' ' + why); return; }
    cutting = true; cutAt = Date.now() / 1000; say('§FILM_CUT start t=' + now().toFixed(2) + ' wall=' + cutAt.toFixed(3) + ' owner=' + own + ' ' + why); };
  const cutEnd = (own) => { own = own || 'rec'; if (!cutOwners.delete(own) || cutOwners.size) return; const w = Date.now() / 1000, d = w - cutAt; cutTotal += d; cutting = false; say('§FILM_CUT end wall=' + w.toFixed(3) + ' removed=' + d.toFixed(2) + 's total=' + cutTotal.toFixed(2) + ' owner=' + own); };
  const MIN = JSON.parse(process.env.BEAT_MIN || '{}'); let prev = null;
  const settle = async () => { if (!(prev && MIN[prev.id])) return; const wait = MIN[prev.id] - (now() - prev.t); if (wait <= 0) return;
    say('§FILM_HOLD after=' + prev.id + ' extra=' + wait.toFixed(2)); while (now() - prev.t < MIN[prev.id]) await page.waitForTimeout(100); };
  const beat = async (id, lang, note) => { await settle(); prev = { id, t: now() }; say('§FILM_BEAT id=' + id + ' t=' + prev.t.toFixed(2) + ' lang=' + lang + ' ' + (note || '')); };
  const chapter = async (n, key) => { await beat('c' + n, LANGS[0], 'chapter ' + n + ' ' + key); say('§FILM_CHAPTER n=' + n + ' key=' + key + ' t=' + now().toFixed(2)); await page.waitForTimeout(2600); };
  const hold = (ms) => page.waitForTimeout(ms);
  async function jump(why, fn) { await settle(); const t = Date.now(); cutStart('jump: ' + why); try { return await fn(); } finally { cutEnd(); say('§FILM_JUMP ' + why + ' waited=' + ((Date.now() - t) / 1000).toFixed(2) + 's'); } }
  async function glideXY(x, y, steps) { await page.mouse.move(x, y, { steps: steps || 22 }); await hold(140); }
  async function glide(sel) { const loc = page.locator(sel).first(); await loc.scrollIntoViewIfNeeded().catch(() => {}); const b = await loc.boundingBox(); if (!b) throw new Error('no box for ' + sel); await glideXY(b.x + b.width / 2, b.y + b.height / 2); }
  let clicks = 0;
  async function hclick(sel) { await glide(sel); clicks++; await page.mouse.down(); await hold(60); await page.mouse.up(); await hold(280); }
  async function tapXY(x, y) { await glideXY(x, y, 14); await page.mouse.down(); await hold(50); await page.mouse.up(); await hold(160); }
  const vis = (sel) => page.locator(sel).first().isVisible().catch(() => false);
  const proj = (x, y, z) => page.evaluate((a) => window.__e2e.proj(a[0], a[1], a[2]), [x, y, z]);
  const flySettle = async () => { for (let i = 0; i < 120 && await page.evaluate(() => !!window.__flyLive); i++) await hold(100); await hold(250); };
  const oplog = () => page.evaluate(() => ({ len: window.Bonsai.oplog.length, cur: window.Bonsai.oplog.cursor }));
  const fit = async () => { if (await vis('#b-fit')) { await hclick('#b-fit'); await hold(700); await flySettle(); } };

  // language: the REAL flag button; quietLang cuts the switch (only g_pick shows it)
  let curLang = LANGS[0];
  async function setLang(code) {
    if (code === curLang) return; const n0 = PAGELOG.length;
    if (!(await vis('#header-flag-btn'))) { await page.locator('#m-dots').click().catch(() => {}); await hold(400); }
    await hclick('#header-flag-btn'); await page.waitForSelector('#ootb-flag-popup.active', { timeout: 5000 });
    await hclick('#ootb-flag-popup button[title$="(' + code + ')"]');
    fact('lang.' + code, await waitLog(n0, new RegExp('§TRL_DICT_PAGE locale=' + code + ' '), 15000) || 'NO §TRL_DICT_PAGE'); curLang = code; await hold(200);
  }
  async function quietLang(L) { if (L === curLang) return; await settle(); cutStart('lang switch → ' + L); await setLang(L); await hold(250); cutEnd(); }
  async function slice(id, note, lang) { const L = lang || LANGS[0]; await quietLang(L); await beat(id, L, note); return L; }
  // ground square clear in plan and visible from the current camera (harness clearGround)
  const clearGround = (s) => page.evaluate((v) => window.__e2e.clearGround(v), s);

  try {
    // ── greetings + the one picker demo ──
    await page.mouse.move(720, 500);
    for (const L of LANGS) await beat('g_' + L, L, 'greeting (voice only)');
    if (!(await vis('#header-flag-btn'))) { await page.locator('#m-dots').click().catch(() => {}); await hold(400); }
    await beat('g_pick', 'fr_FR', 'one picker demo: the Modeller switches in place'); await setLang('fr_FR'); await hold(1200);

    // ── 1 OPEN ──
    await chapter(1, 'OPEN');
    await slice('m01', 'Open chooser: residents + FROM IFC'); let n1 = PAGELOG.length;
    await hclick('#b-open'); fact('chooser', await waitLog(n1, /§MODELLER-OPEN chooser open=true/, 6000) || 'NO chooser');
    if (await vis('#m-open-panel .mo-row[data-ifc="Duplex-IFC"]')) { await glide('#m-open-panel .mo-row[data-ifc="Duplex-IFC"]'); await hold(1200); }   // "or bring your own IFC" — hovered, not opened
    await glide('#m-open-panel .mo-row[data-key="Duplex"]'); await hold(500);
    n1 = PAGELOG.length; await page.mouse.down(); await hold(60); await page.mouse.up();
    await jump('Duplex loads (geometry + signed seed)', async () => {
      await waitLog(n1, /§WALK-AFTER-SEED seed settled|§GEO-SERVED-DEGRADED/, 120000); await hold(1500);
      await page.evaluate(E2E_SRC + '; true'); await page.locator('#b-fit').click().catch(() => {}); await hold(900); await flySettle(); });
    fact('open', last(n1, /§ARC-SEED-WIRE/).replace(/^.*§ARC-SEED-WIRE/, '§ARC-SEED-WIRE') || last(n1, /§GEO-SERVED-DEGRADED/) || 'NO §ARC-SEED-WIRE');
    await beat('m02', curLang, 'the outliner + the signed footer'); await glide('#bo-foot'); await hold(1500);
    fact('footer', await page.$eval('#bo-foot', e => e.textContent).catch(() => '')); fact('oplog', JSON.stringify(await oplog()));
    const gnd = await clearGround(3.6); fact('clearGround', JSON.stringify(gnd));

    // ── 2 ASSEMBLE & DRAW ──
    await chapter(2, 'DRAW');
    await slice('m03', 'Insert from the catalog', 'es_ES'); n1 = PAGELOG.length;
    await hclick('#b-insert'); await page.waitForSelector('#ins-panel .ins-c[data-hash]', { state: 'visible', timeout: 8000 }).catch(() => {});
    if (await vis('#ins-panel .ins-c[data-hash]')) {
      await hclick('#ins-panel .ins-c[data-hash] >> nth=0'); await hold(500);
      if (gnd) { const p = await proj(gnd[0] + 1.8, gnd[1] + 1.8, 0); await glideXY(p[0] - 60, p[1] - 30); await glideXY(p[0], p[1]); await page.mouse.down(); await hold(50); await page.mouse.up(); }
      fact('insert', await waitLog(n1, /§OPLOG commit .*op=GEOM_INSERT/, 6000) || 'NO GEOM_INSERT'); await hold(1200);
      if (await vis('#b-insert')) await hclick('#b-insert');
    } else fact('insert', 'catalog items not visible');
    await page.keyboard.press('Escape'); await hold(300);

    await slice('m04', 'Sketch → Extrude', 'zh_CN'); n1 = PAGELOG.length;
    await hclick('#b-sketch'); await hold(400);
    const g2 = gnd ? [gnd[0] + 0.3, gnd[1] + 0.3] : [0, 0];
    cutStart('pan the plan view over the clear ground'); await page.evaluate((a) => window.__e2e.overhead(a[0] + 1.2, a[1] + 1.2, 12), g2); await hold(400); cutEnd();
    for (const [wx, wy] of [[g2[0], g2[1]], [g2[0] + 2.4, g2[1]], [g2[0] + 2.4, g2[1] + 2.4], [g2[0], g2[1] + 2.4]]) { const p = await proj(wx, wy, 0); await tapXY(p[0], p[1]); }
    fact('sketch', last(n1, /§SKETCH solve/) || 'no §SKETCH solve'); await hold(500);
    await page.evaluate(() => { document.getElementById('dim-depth').value = '2.5'; }); await hclick('#b-extrude');
    fact('extrude', await waitLog(n1, /§OPLOG commit .*op=GEOM_EXTRUDE_POLY/, 8000) || 'NO GEOM_EXTRUDE_POLY'); await hold(900);
    cutStart('back to the whole-building view'); await page.evaluate(() => window.__e2e.camRestore()); await page.locator('#b-fit').click().catch(() => {}); await hold(800); await flySettle(); cutEnd();

    await slice('m05', 'Cut an opening in a wall', 'ar_SA');
    // pick a wall the production cut gate accepts (Bonsai.canCut), at a raycast-verified point — the search is CUT, the click shown
    let cutFid = null, cutPt = null;
    cutStart('find a cuttable wall');
    { const cands = await page.evaluate(() => { const ops = window.Bonsai.oplog._geomOps(); const byId = new Map(ops.map(o => [o.id, o]));
        return window.__e2e.candidates().filter(c => c.sz && c.sz[2] >= 1.2 && Math.min(c.sz[0], c.sz[1]) <= 0.6 && Math.max(c.sz[0], c.sz[1]) >= 1.0 && c.vol <= 6)
          .filter(c => { const op = byId.get(c.fid); try { return !!op && window.Bonsai.canCut(op); } catch (e) { return false; } }); });
      for (const c of cands) { const pt = await page.evaluate((f) => window.__e2e.clickPointFor(f), c.fid); if (pt) { cutFid = c.fid; cutPt = pt; break; } } }
    cutEnd();
    if (cutPt) { n1 = PAGELOG.length; await tapXY(cutPt[0], cutPt[1]); await hold(400); await flySettle();
      fact('cutSelect', last(n1, /§MODELLER select featureId=/) || 'no select line'); await hclick('#b-cut');
      fact('cut', await waitLog(n1, /§OPLOG commit .*op=GEOM_CUT/, 8000) || 'NO GEOM_CUT'); await hold(1500); }
    else fact('cut', 'no cuttable wall visible');
    await page.evaluate(() => window.Bonsai.select && window.Bonsai.select(null)); await page.keyboard.press('Escape');

    await slice('m06', 'Route → Sweep Run'); n1 = PAGELOG.length;
    await hclick('#b-route'); await hold(400);
    const g3 = gnd ? [gnd[0] + 0.4, gnd[1] + 0.4] : [0, 0];
    cutStart('pan the plan view'); await page.evaluate((a) => window.__e2e.overhead(a[0] + 1, a[1] + 1, 12), g3); await hold(400); cutEnd();
    for (const [wx, wy] of [[g3[0], g3[1] + 2.8], [g3[0] + 2.6, g3[1] + 2.8], [g3[0] + 2.6, g3[1] + 0.2]]) { const p = await proj(wx, wy, 0); await tapXY(p[0], p[1]); }
    await page.evaluate(() => { document.getElementById('dim-prof').value = '0.4'; }); await hclick('#b-run');
    fact('sweep', await waitLog(n1, /§OPLOG commit .*op=GEOM_SWEEP/, 8000) || 'NO GEOM_SWEEP'); await hold(1000);
    cutStart('back to the whole-building view'); await page.evaluate(() => window.__e2e.camRestore()); await page.locator('#b-fit').click().catch(() => {}); await hold(800); await flySettle(); cutEnd();

    // ── 3 MOVE ──
    await chapter(3, 'MOVE');
    await slice('m07', 'select a wall → Move gizmo drag');
    let movePt = null;
    cutStart('find a movable wall');
    { const cands = await page.evaluate(() => { const ops = window.Bonsai.oplog._geomOps(); const byId = new Map(ops.map(o => [o.id, o]));
        return window.__e2e.candidates().filter(c => c.sz && c.sz[2] >= 1.2 && Math.min(c.sz[0], c.sz[1]) <= 0.6 && Math.max(c.sz[0], c.sz[1]) >= 1.0 && c.vol <= 6)
          .filter(c => { const op = byId.get(c.fid); const pl = op && op.parameters && op.parameters.placement; return !!op && (op.op_type !== 'GEOM_INSERT' || !pl || (Math.abs(pl.rotX || 0) < 1e-6 && Math.abs(pl.rotY || 0) < 1e-6)); }); });
      for (const c of cands) { const pt = await page.evaluate((f) => window.__e2e.clickPointFor(f), c.fid); if (pt) { movePt = pt; break; } } }
    cutEnd();
    if (movePt) { n1 = PAGELOG.length; await tapXY(movePt[0], movePt[1]); await hold(300); await flySettle(); await hclick('#b-move'); await hold(500);
      const giz = await page.evaluate(() => { const gz = window.A.scene.getObjectByName('MoveGizmo'); if (!gz) return null; let h = null; gz.traverse(o => { if (o.userData && o.userData.moveAxis === 'x' && !h) h = o; }); if (!h) return null; const w = new window.THREE.Vector3(); h.getWorldPosition(w); return [w.x, w.y, w.z]; });
      if (giz) { const pts = []; for (let i = 0; i <= 10; i++) pts.push(await proj(giz[0] + 1.0 * i / 10, giz[1], giz[2]));
        await glideXY(pts[0][0], pts[0][1]); await page.mouse.down(); await hold(60); for (let i = 1; i < pts.length; i++) { await page.mouse.move(pts[i][0], pts[i][1], { steps: 4 }); await hold(40); } await page.mouse.up();
        fact('move', await waitLog(n1, /§MOVE commit/, 6000) || 'NO §MOVE commit'); fact('moveCascade', last(n1, /§SDG-CASCADE/) || 'no hosted elements'); await hold(1500); }
      else fact('move', 'no gizmo'); }
    else fact('move', 'no movable wall visible');
    if (await vis('#b-move.on')) await hclick('#b-move'); await page.evaluate(() => window.Bonsai.select && window.Bonsai.select(null)); await page.keyboard.press('Escape');

    await slice('m08', 'move a whole room (outliner ⛶ glyph → drag)', 'ms_MY'); n1 = PAGELOG.length;
    { let armed = null; const glyphs = await page.$$eval('.bn-roommove', es => es.map(e => e.getAttribute('data-room')));
      cutStart('arm a room with members'); for (const g of glyphs) { const sel = '.bn-roommove[data-room="' + g + '"]'; if (!(await vis(sel))) continue; await page.locator(sel).first().click().catch(() => {}); await hold(200);
        const m = await page.evaluate(() => { const s = window.Bonsai.roommove && window.Bonsai.roommove._session; return s ? s.members.length : 0; }); if (m > 0) { armed = g; break; } await page.keyboard.press('Escape'); await hold(150); } cutEnd();
      if (armed) { const vw = 1440, vh = 810; await glideXY(vw * 0.42, vh * 0.55); await page.mouse.down(); await hold(80); await page.mouse.move(vw * 0.5, vh * 0.47, { steps: 14 }); await hold(200); await page.mouse.move(vw * 0.58, vh * 0.42, { steps: 14 }); await hold(200); await page.mouse.up();
        fact('roomMove', await waitLog(n1, /§ROOMMOVE commit/, 6000) || 'NO §ROOMMOVE commit'); await hold(1500); }
      else fact('roomMove', 'no armable room (' + glyphs.length + ' glyphs)'); }
    await page.keyboard.press('Escape');

    // ── 4 WALK ──
    await chapter(4, 'WALK');
    await slice('m09', 'Walk ELEC (outliner row)'); n1 = PAGELOG.length;
    if (await vis('[data-bnode="dw-ELEC"]')) { await hclick('[data-bnode="dw-ELEC"]');
      await jump('the ELEC walk computes', async () => { await waitLog(n1, /§DISC-WALK-COMMIT disc=ELEC|§DISC-WALK ELEC .*refus/i, 120000); await hold(500); });
      fact('walkElec', last(n1, /§DISC-WALK ELEC placed=/) || 'no §DISC-WALK ELEC'); fact('walkCommit', last(n1, /§DISC-WALK-COMMIT disc=ELEC/) || 'NO COMMIT'); }
    else fact('walkElec', 'no dw-ELEC row');
    await beat('m09x', curLang, 'X-ray reveal'); n1 = PAGELOG.length; await hclick('#b-xray'); fact('xray', await waitLog(n1, /§MODELLER xray on/, 4000) || 'no §MODELLER xray on'); await hold(3000);
    await hclick('#b-xray'); await hold(300);
    await slice('m10', 'Route the ELEC trunk from a real entry', 'ja_JP'); n1 = PAGELOG.length;
    if (await vis('[data-bnode="dt-ELEC"]')) { await hclick('[data-bnode="dt-ELEC"]'); await page.waitForSelector('#_seedOk', { timeout: 5000 }).catch(() => {});
      if (await vis('#_seedOk')) { await hclick('#_seedOk'); fact('trunk', await waitLog(n1, /§SEED-TRUNK ELEC/, 30000) || 'NO §SEED-TRUNK'); await waitLog(n1, /§SEED-TRUNK-ANIM/, 15000); await hold(3500); }
      else fact('trunk', 'no #_seedOk modal'); }
    else fact('trunk', 'no dt-ELEC row');
    await slice('m11', 'Walk ALL services'); n1 = PAGELOG.length;
    if (await vis('[data-bnode="dw-all"]')) { await hclick('[data-bnode="dw-all"]');
      await jump('Walk ALL computes', async () => { await waitLog(n1, /§DISCWALK-ALL xray-on/, 120000); });
      await hold(3000); await waitLog(n1, /§DISCWALK-ALL done/, 180000);
      fact('walkAll', last(n1, /§DISCWALK-ALL done/) || 'NO §DISCWALK-ALL done'); }
    else fact('walkAll', 'no dw-all row');

    // ── 5 TIMELINE ──
    await chapter(5, 'TIME');
    await slice('m12', 'drag the history slider back, then forward'); n1 = PAGELOG.length;
    { const st = await page.evaluate(() => { const s = document.getElementById('hist-slider'); if (!s) return null; const r = s.getBoundingClientRect();
        const kx = r.left + r.width * ((s.value - s.min) / ((s.max - s.min) || 1)), ky = r.top + r.height / 2, top = document.elementFromPoint(kx, ky);
        return { min: +s.min, max: +s.max, val: +s.value, dis: s.disabled, r: [r.left, r.top, r.width, r.height], top: top ? (top.id || top.tagName) : null }; });
      fact('slider', JSON.stringify(st));
      if (st && !st.dis && st.max > st.min) {
        const y = st.r[1] + st.r[3] / 2, xAt = (v) => st.r[0] + st.r[2] * ((v - st.min) / (st.max - st.min)), back = Math.round(st.min + (st.max - st.min) * 0.25);
        if (st.top === 'hist-slider') {   // a real drag on the knob
          await glideXY(xAt(st.val), y); await page.mouse.down(); await page.mouse.move(xAt(back), y, { steps: 60 }); await hold(900); await page.mouse.move(xAt(st.max), y, { steps: 60 }); await page.mouse.up();
        } else {   // something sits over the knob (take1: 0 scrub steps from a drag) — step the slider: the same `input` event a drag fires, the cursor follows the knob
          await glideXY(xAt(st.val), y);
          const stepTo = async (from, to) => { for (let i = 1; i <= 40; i++) { const v = Math.round(from + (to - from) * i / 40); await page.evaluate((x) => { const s = document.getElementById('hist-slider'); s.value = x; s.dispatchEvent(new Event('input', { bubbles: true })); }, v); await page.mouse.move(xAt(v), y); await hold(45); } };
          await stepTo(st.val, back); await hold(900); await stepTo(back, st.max);
        }
        await hold(400);
        const sc = PAGELOG.slice(n1).filter(l => /§OPLOG scrub upto=/.test(l));
        fact('scrub', sc.length + ' scrub steps; first ' + (sc[0] || '-') + ' last ' + (sc[sc.length - 1] || '-') + ' via=' + (st.top === 'hist-slider' ? 'drag' : 'input steps (over the knob: ' + st.top + ')')); await hold(1200);
      } else fact('scrub', 'slider disabled/empty'); }

    // ── 6 SAVE & SHARE ──
    await chapter(6, 'SHARE');
    await slice('m13', 'Save (clash gate, then snapshot)'); n1 = PAGELOG.length; await hclick('#b-save');
    fact('save', await waitLog(n1, /§SAVE_SNAPSHOT|§SAVE_BLOCKED/, 30000) || 'NO §SAVE line'); fact('saveGate', last(n1, /§SAVE_GATE/) || '-'); fact('saveStat', await page.$eval('#stat', e => e.textContent).catch(() => '')); await hold(1500);
    await slice('m14', 'Export → BCF'); n1 = PAGELOG.length; await hclick('#b-export');
    if (await vis('#m-export-panel .me-row[data-key="bcf"]')) { const dl = page.waitForEvent('download', { timeout: 15000 }).catch(() => null); await hclick('#m-export-panel .me-row[data-key="bcf"]');
      const d = await dl; fact('bcf', (await waitLog(n1, /§BCF export/, 8000) || 'NO §BCF export') + ' file=' + (d ? d.suggestedFilename() : 'no download')); await hold(1500); }
    else fact('bcf', 'no BCF row');
    await page.keyboard.press('Escape');

    // ── END: picker shown, hover each flag → cut → the Help panel in that language during its thank-you ──
    await quietLang(LANGS[0]);
    const openPicker = async () => { if (await vis('#ootb-flag-popup.active')) return; if (!(await vis('#header-flag-btn'))) { await page.locator('#m-dots').click().catch(() => {}); await hold(300); } await page.locator('#header-flag-btn').click().catch(() => {}); await page.waitForSelector('#ootb-flag-popup.active', { timeout: 5000 }).catch(() => {}); };
    cutStart('closing: open the picker'); await openPicker(); await hold(200); cutEnd();
    const helpOk = [];
    for (const L of LANGS.slice(1).concat([LANGS[0]])) {
      const sel = '#ootb-flag-popup button[title$="(' + L + ')"]';
      if (await vis(sel)) await glide(sel); await hold(450);
      cutStart('closing: switch → ' + L + ' + Help'); const n2 = PAGELOG.length;
      await page.locator(sel).first().click({ timeout: 3000 }).catch(() => {}); await waitLog(n2, new RegExp('§TRL_DICT_PAGE locale=' + L + ' '), 8000); curLang = L;
      if (!(await vis('#m-help-panel'))) await page.locator('#m-help').click().catch(() => {}); await hold(500);
      const title = await page.$eval('#m-help-panel', e => e.innerText.split('\n')[0]).catch(() => '');
      helpOk.push(L + (title && (L === LANGS[0] || title !== 'TOOLBAR · PILL REGISTRY') ? ':ok' : ':WRONG(' + title + ')'));
      await page.mouse.move(1000, 400, { steps: 6 }); await hold(150); cutEnd();
      await beat('t_' + L, L, 'thank-you over the Help panel in ' + L); await hold(900);
      cutStart('closing: back to the picker'); if (await vis('#m-help-panel')) await page.locator('#m-help').click().catch(() => {});
      if (L !== LANGS[0]) await openPicker(); await hold(150); cutEnd();
    }
    fact('closingHelp', helpOk.join(' ') + ' → ' + (helpOk.every(x => /:ok$/.test(x)) ? 'ALL TRANSLATED' : 'WRONG'));
    await beat('end', curLang, '');
    say('§FILM_CURSOR clicks=' + clicks);
  } catch (e) { say('§FILM_ERROR ' + e.message.split('\n')[0]); }

  if (cdp) await cdp.send('Page.stopScreencast').catch(() => {}); await page.waitForTimeout(300).catch(() => {});
  const endTs = Date.now() / 1000 - cutTotal;
  fs.writeFileSync(path.join(OUT, 'modeller_film.page.log'), PAGELOG.join('\n') + '\n');
  say('§FILM_PAGEERR n=' + PAGELOG.filter(l => l.startsWith('PAGEERR')).length + (PAGELOG.filter(l => l.startsWith('PAGEERR')).slice(0, 3).join(' | ') ? ' ' + PAGELOG.filter(l => l.startsWith('PAGEERR')).slice(0, 3).join(' | ') : ''));
  const lines = [];
  frames.forEach((f, i) => { const d = (i + 1 < frames.length ? frames[i + 1].ts : endTs) - f.ts; lines.push(`file '${f.fn}'`, `duration ${Math.max(d, 0.001).toFixed(4)}`); });
  if (frames.length) lines.push(`file '${frames[frames.length - 1].fn}'`);
  fs.writeFileSync(path.join(OUT, 'frames.txt'), lines.join('\n') + '\n');
  const mp4 = path.join(OUT, 'modeller_film.mp4');
  try {
    execFileSync('ffmpeg', ['-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', path.join(OUT, 'frames.txt'), '-vf', 'fps=24,scale=1920:1080:flags=lanczos,format=yuv420p', '-c:v', 'libx264', '-crf', '17', '-preset', 'medium', mp4]);
    say('§FILM_DONE frames=' + frames.length + ' dur=' + (endTs - (T0 || endTs)).toFixed(2) + ' out=' + mp4);
  } catch (e) { say('§FILM_ERROR ffmpeg ' + String(e.message).split('\n')[0]); }
  await browser.close();
  if (rec) { rec.kill('SIGINT'); await new Promise(r => setTimeout(r, 800)); say('§FILM_AUDIO stop offset=' + (T0 - audioT0).toFixed(3) + ' cutTotal=' + cutTotal.toFixed(3)); }
  if (sinkMod) { try { execFileSync('pactl', ['unload-module', sinkMod]); } catch (e) { /* */ } }
  fs.writeFileSync(path.join(OUT, 'modeller_film.log'), LOG.join('\n') + '\n');
  server.close();
})();
