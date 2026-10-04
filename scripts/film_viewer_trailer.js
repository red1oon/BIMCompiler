// ⚠ DO NOT REMOVE — Scope guard  (VIEWER TRAILER recorder; helpers copied from film_erp_techtrailer.js)
// Scope: §VIEWER-TRAILER (prompts/FILM_NARRATION.md §8 — beats, §8 TITLE CARDS chapters, §8 RECORDER MAP selectors).
//   ONE continuous take of the BIM Viewer, driven like a user, the UI switching language IN PLACE every slice
//   (S226 §R2c `_TRL_LOADER.setLocale`, through the real flag picker) across the 13 film languages; opened by a greeting
//   round on the landing page. Chapters: 1 OPEN · 2 SEE · 3 INSPECT · 4 TIME · 5 COST · 6 SHARE (cards burned in post).
//   The Hospital is served from the LOCAL copy of the same file the live site downloads (the OCI URL is routed to
//   ~/bim-ootb/buildings/<file>) — same bytes, no 265 MB download per take.
//   GPU run (the Viewer is unusable on software GL, `§FPS_MODE mean=21783`): --use-angle=gl, under
//   `flock /tmp/claude-1000/gpu.lock` so it never runs beside another session's bake.
// THE ISSUE this proves/disproves: can the trailer's beats be filmed end to end, no human at the keyboard, in 13
//   languages without a reload — every number the narration says printed as a §FILM_FACT from the live page.
//   A step it cannot do is a real bug: fix by spec + witness + PR, never by a recorder workaround.
// §-log first — READ <out>/viewer_film.log (beats + facts) and <out>/viewer_film.page.log before any conclusion.
// Run:  flock /tmp/claude-1000/gpu.lock node scripts/film_viewer_trailer.js <outDir>    → <outDir>/viewer_film.mp4
//       VIEWER_REPO=/tmp/wt-x  films a worktree · BEAT_MIN='{"s01":9.5,…}' holds each beat to its fitted speech length.
'use strict';
const { chromium } = require(require('os').homedir() + '/bim-ootb/tests/node_modules/playwright');
const http = require('http'), fs = require('fs'), path = require('path'), os = require('os'), { execFileSync, spawn } = require('child_process');

const REPO = process.env.VIEWER_REPO || path.join(os.homedir(), 'bim-ootb');
const BLD = path.join(os.homedir(), 'bim-ootb', 'buildings');            // the untracked local building store
const OUT = path.resolve(process.argv[2] || '.'); const FR = path.join(OUT, 'frames'); fs.mkdirSync(FR, { recursive: true });
const LOG = [], PAGELOG = [];
const say = (s) => { LOG.push(s); console.log(s); };
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.db': 'application/octet-stream',
  '.png': 'image/png', '.css': 'text/css', '.wasm': 'application/wasm', '.zip': 'application/zip', '.svg': 'image/svg+xml', '.mjs': 'text/javascript',
  '.jpg': 'image/jpeg', '.sql': 'text/plain', '.glb': 'model/gltf-binary', '.ktx2': 'image/ktx2', '.hdr': 'application/octet-stream', '.webp': 'image/webp',
  '.xml': 'application/xml', '.mp3': 'audio/mpeg', '.wav': 'audio/wav', '.ogg': 'audio/ogg' };
function serveFile(fp, p, res) {
  fs.stat(fp, (e, st) => {
    if (e || st.isDirectory()) { res.writeHead(404); res.end('404 ' + p); return; }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream', 'Content-Length': st.size }); fs.createReadStream(fp).pipe(res);
  });
}
const server = http.createServer((req, res) => {
  const p = decodeURIComponent(req.url.split('?')[0]); const fp = path.join(REPO, p === '/' ? '/index.html' : p);
  if (p.startsWith('/buildings/') && !fs.existsSync(fp)) return serveFile(path.join(BLD, path.basename(p)), p, res);
  serveFile(fp, p, res);
});

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

// the 13 film languages (FILM_NARRATION.md §8 REVISED 2026-10-04) → Viewer locale codes; English = en_MY (the base, RM)
const FILM_BLD = process.env.FILM_BLD || 'HHS_Office_Federated';   // red1 2026-10-04: "Perhaps use HHS, lighter" (Hospital's tab crashed mid-load)
const LANGS = ['en_MY', 'fr_FR', 'es_ES', 'de_DE', 'ar_SA', 'zh_CN', 'ja_JP', 'ms_MY', 'th_TH', 'ko_KR', 'pt_BR', 'id_ID', 'bn_BD'];

(async () => {
  await new Promise(r => server.listen(0, r));
  const base = 'http://localhost:' + server.address().port;
  // AUDIO (red1: "can have V sounds on to let it hear the knocks"): the browser plays into a PRIVATE null sink (nothing on the
  // speakers), recorded for the whole take; post aligns it to the picture and removes the same cuts (§FILM_AUDIO lines).
  let sinkMod = null, rec = null, audioT0 = null;
  try { sinkMod = execFileSync('pactl', ['load-module', 'module-null-sink', 'sink_name=film_sink', 'sink_properties=device.description=film_sink']).toString().trim();
    rec = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'pulse', '-i', 'film_sink.monitor', '-ac', '2', '-ar', '48000', path.join(OUT, 'page_audio.wav')]); audioT0 = Date.now() / 1000;
    say('§FILM_AUDIO sink=film_sink module=' + sinkMod + ' recStart=' + audioT0.toFixed(3));
  } catch (e) { say('§FILM_AUDIO unavailable ' + e.message); }
  const browser = await chromium.launch({ args: ['--no-sandbox', '--use-angle=gl', '--ignore-gpu-blocklist', '--enable-gpu-rasterization', '--autoplay-policy=no-user-gesture-required'],
    ignoreDefaultArgs: ['--mute-audio'], env: Object.assign({}, process.env, { PULSE_SINK: 'film_sink' }) });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 810 }, deviceScaleFactor: 4 / 3 });
  await ctx.addInitScript(CURSOR);
  // the live site downloads buildings from OCI — route those exact URLs to the same files on this disk
  await ctx.route(/^https:\/\/objectstorage\.[^/]+\/n\/[^/]+\/b\/bim-ootb\/o\/buildings\//, (route) => {   // anchored: the Viewer's OWN url carries this address in its ?db= query
    const f = path.join(BLD, decodeURIComponent(route.request().url().split('?')[0].split('/').pop()));
    if (!fs.existsSync(f)) return route.fulfill({ status: 404, body: 'not local: ' + f });
    PAGELOG.push('ROUTE ' + path.basename(f)); return route.fulfill({ path: f, contentType: 'application/octet-stream' });
  });
  // HHS_Office_Federated is served from GitHub Pages on the live site (index.html openBuilding gh override) — same local file
  await ctx.route(/^https:\/\/red1oon\.github\.io\/bim-ootb\/buildings\//, (route) => {
    const f = path.join(fs.existsSync(path.join(REPO, 'buildings')) ? path.join(REPO, 'buildings') : BLD, decodeURIComponent(route.request().url().split('?')[0].split('/').pop()));
    const g = fs.existsSync(f) ? f : path.join(BLD, path.basename(f));
    if (!fs.existsSync(g)) return route.fulfill({ status: 404, body: 'not local: ' + g });
    PAGELOG.push('ROUTE gh ' + path.basename(g)); return route.fulfill({ path: g, contentType: 'application/octet-stream' });
  });
  let page = await ctx.newPage();
  // the cursor overlay is injected into EVERY page we drive, and again after each load: tabs opened by the page itself
  // (window.open → Viewer, 4D/5D) came up WITHOUT it in run vtrail7 (every click there logged cursor=null)
  const wire = (p, tag) => { p.on('load', () => p.evaluate(CURSOR).catch(() => {})); p.evaluate(CURSOR).catch(() => {}); p.on('console', m => PAGELOG.push((tag || '') + m.text())); p.on('pageerror', e => PAGELOG.push('PAGEERR ' + (tag || '') + e)); p.on('dialog', async d => { PAGELOG.push('DIALOG ' + d.message()); await d.dismiss(); }); };
  wire(page, '[landing] ');
  const last = (n, re) => PAGELOG.slice(n).filter(l => re.test(l)).pop() || '';
  const waitLog = async (n, re, ms) => { for (let i = 0; i < (ms || 20000) / 100 && !last(n, re); i++) await page.waitForTimeout(100); return last(n, re); };
  const fact = (k, v) => say('§FILM_FACT ' + k + '=' + String(v).replace(/\s+/g, ' ').slice(0, 320));

  // clean start: no saved language, no cached building, the Morpheus gate shown
  await page.goto(base + '/index.html', { waitUntil: 'load' });
  await page.evaluate(() => { try { localStorage.clear(); } catch (e) { /* */ } });
  await page.evaluate(() => new Promise(r => { const q = indexedDB.databases ? indexedDB.databases() : Promise.resolve([]); q.then(list => Promise.all((list || []).map(d => new Promise(ok => { const x = indexedDB.deleteDatabase(d.name); x.onsuccess = x.onerror = x.onblocked = () => ok(); })))).then(r, r); }));
  await page.evaluate((b) => { localStorage.setItem('bim_ootb_config', JSON.stringify({ locale: b })); }, LANGS[0]);
  await page.goto(base + '/index.html', { waitUntil: 'load' });
  await page.waitForFunction(() => window._TRL_READY === true && window._TRL_LOADER && window._TRL_LOADER.setLocale, null, { timeout: 30000 });
  fact('gpu', await page.evaluate(() => { const g = document.createElement('canvas').getContext('webgl2'); const d = g && g.getExtension('WEBGL_debug_renderer_info'); return d ? g.getParameter(d.UNMASKED_RENDERER_WEBGL) : 'none'; }));

  // ── screencast that FOLLOWS a new tab: frames from whichever page is being cast go to one list ──
  const frames = []; let T0 = null; let cdp = null;
  // CUT: frames are not captured while `cutting`, and the cut time is taken out of the clock — the film jumps ahead
  // cleanly (red1: "refresh F5 (jump ahead when done)") and every later beat keeps its sync with the narration.
  let cutting = false, cutTotal = 0, cutAt = 0;
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
  const cutStart = (why) => { if (cutting) return; cutting = true; cutAt = Date.now() / 1000; say('§FILM_CUT start t=' + now().toFixed(2) + ' wall=' + cutAt.toFixed(3) + ' ' + why); };
  const cutEnd = () => { if (!cutting) return; const w = Date.now() / 1000, d = w - cutAt; cutTotal += d; cutting = false; say('§FILM_CUT end wall=' + w.toFixed(3) + ' removed=' + d.toFixed(2) + 's total=' + cutTotal.toFixed(2)); };
  const MIN = JSON.parse(process.env.BEAT_MIN || '{}'); let prev = null;
  const beat = async (id, lang, note) => {
    if (prev && MIN[prev.id]) { const wait = MIN[prev.id] - (now() - prev.t); if (wait > 0) { say('§FILM_HOLD after=' + prev.id + ' extra=' + wait.toFixed(2)); await page.waitForTimeout(wait * 1000); } }
    prev = { id, t: now() }; say('§FILM_BEAT id=' + id + ' t=' + prev.t.toFixed(2) + ' lang=' + lang + ' ' + (note || ''));
  };
  const chapter = async (n, key) => { await beat('c' + n, LANGS[0], 'chapter ' + n + ' ' + key); say('§FILM_CHAPTER n=' + n + ' key=' + key + ' t=' + now().toFixed(2)); await page.waitForTimeout(2600); };
  const hold = (ms) => page.waitForTimeout(ms);
  async function glideXY(x, y) { await page.mouse.move(x, y, { steps: 22 }); await hold(160); }
  async function glide(sel) {
    const loc = page.locator(sel).first(); await loc.scrollIntoViewIfNeeded().catch(() => {});
    const b = await loc.boundingBox(); if (!b) throw new Error('no box for ' + sel);
    await glideXY(b.x + b.width / 2, b.y + b.height / 2);
  }
  let clicks = 0, cursorOk = 0;
  async function hclick(sel) {
    await glide(sel);
    const c = await page.evaluate(() => { const e = document.getElementById('__fc'); return e ? [parseFloat(e.style.left), parseFloat(e.style.top)] : null; });
    const b = await page.locator(sel).first().boundingBox();
    clicks++; if (c && b && Math.abs(c[0] - (b.x + b.width / 2)) < 2 && Math.abs(c[1] - (b.y + b.height / 2)) < 2) cursorOk++; else say('§FILM_CURSOR_MISS sel=' + sel + ' cursor=' + JSON.stringify(c) + ' box=' + (b ? [b.x, b.y, b.width, b.height].map(Math.round).join(',') : 'none'));
    await page.mouse.down(); await hold(60); await page.mouse.up(); await hold(280);
  }
  async function key(k, note) { const n = PAGELOG.length; await page.keyboard.press(k); await hold(350); if (note) fact('key.' + note, last(n, /§SHORTCUT_FIRE|§KBD_ROUTE/) || k); }
  // a landing launcher: on the portal until the first pick, then docked in the ⋯ rail (index.html §PICK → §DOCK)
  async function launcher(id) {
    if (await page.locator('#por-' + id).first().isVisible().catch(() => false)) return hclick('#por-' + id);
    if (!(await page.locator('#pill-' + id).first().isVisible().catch(() => false))) { await hclick('#erp-pill-trigger'); await page.waitForSelector('#pill-' + id, { state: 'visible', timeout: 5000 }); }
    return hclick('#pill-' + id);
  }
  const onLanding = async () => /\/index\.html|\/$/.test(new URL(page.url()).pathname);
  // language switch through the REAL flag picker; in place on landing + viewer (S226 §R2c), a reload on the report pages
  let curLang = LANGS[0];
  async function setLang(code) {
    if (code === curLang) return;
    const n0 = PAGELOG.length;
    if (await onLanding()) await launcher('flag');
    else if (await page.locator('#header-flag-btn').first().isVisible().catch(() => false) && !(await page.locator('#header-flag-btn svg').count())) await hclick('#header-flag-btn');
    else await page.evaluate(() => window._TRL_LOADER.openFlagPicker());
    await page.waitForSelector('#ootb-flag-popup.active', { timeout: 5000 });
    await hclick('#ootb-flag-popup button[title$="(' + code + ')"]');
    const sw = await waitLog(n0, new RegExp('§TRL_SWITCH .* to=' + code + ' |§TRL_LABELS locale=' + code + ' '), 15000);
    fact('lang.' + code, sw || 'NO SWITCH LINE'); curLang = code; await hold(200);
  }
  // REFRESH + CUT: reload the page, wait until the building is back, re-arm the screencast — the reload is cut out of the film
  // (red1: "refresh F5 (jump ahead when done)" / "or simply refresh and wait to continue")
  async function refreshCut(why) {
    cutStart('F5 ' + why); await page.reload({ waitUntil: 'load' });
    await page.waitForFunction(() => window._TRL_READY === true && window.APP && window.APP.streaming === false && !(window.APP._bboxPlaceholders || []).length && window.APP.guidMap && Object.keys(window.APP.guidMap).length > 500, null, { timeout: 180000 });
    await page.waitForFunction(() => Array.isArray(window._mainPillActions) && window._mainPillActions.length > 0, null, { timeout: 60000 }).catch(() => {});
    await castOn(page); await page.waitForTimeout(1500); cutEnd(); curLang = LANGS[0];
  }
  // keep the building SOLID: the pick's xray-dim focus + Find's shell ghost left the v1 take in box/wireframe mode
  async function solid(tag) {
    for (let i = 0; i < 3; i++) {
      const st = await page.evaluate(() => ({ ghost: typeof window.ghostXrayOn === 'function' && window.ghostXrayOn(), xray: !!(window.APP && window.APP.xrayOn) }));
      if (st.ghost) { cutStart('ghost→solid ' + tag); await page.evaluate(() => window.toggleGhostXray && window.toggleGhostXray()); await hold(400); continue; }   // Alt+X merged into Alt+Z (scene.js:3264): the ghost's own toggle; frames CUT (red1: "wireframes kept popping up.. avoid such frames")
      if (st.xray) { cutStart('xray→solid ' + tag); await page.keyboard.press('Alt+z'); await hold(400); continue; }
      if (cutting) { await hold(300); cutEnd(); }
      fact('solid.' + tag, 'ok'); return;
    }
    fact('solid.' + tag, 'STILL NOT SOLID ' + JSON.stringify(await page.evaluate(() => ({ ghost: window.ghostXrayOn && window.ghostXrayOn(), xray: window.APP.xrayOn }))));
  }
  // red1 2026-10-04: "have more English so that it does not need to switch at crucial bottleneck" — ~70 % English;
  // other languages are QUIPS on light beats (and the greeting + thank-you rounds). slice(id, note, lang) defaults to English.
  // red1 2026-10-04: "need not show subsequent changes to languages" / "just speak out those short quips" — after the one picker
  // demo the UI stays English; a quip beat keeps its language for the VOICE + subtitle only. English beats switch back once.
  // red1 2026-10-04: "do the language switch so that the UI reflects it but cut out the switch action" — the picker clicks are
  // inside a CUT; the film jumps straight to the translated UI. Only the one g_pick demo shows the picker on screen.
  async function quietLang(L) { if (L === curLang) return; cutStart('lang switch → ' + L); await setLang(L); await hold(250); cutEnd(); }
  async function slice(id, note, lang) { const L = lang || LANGS[0]; await quietLang(L); await beat(id, L, note); return L; }
  // the hub overlay covers the ⋯ rail (no language picker reachable there) — its beats keep the current language
  async function keep(id, note) { await beat(id, curLang, note + ' (lang kept: hub covers the rail)'); return curLang; }

  // project an element's bbox centre to screen pixels (witness_s7_canvas_pick.js pattern) — for a real canvas click
  async function screenOf(where) {
    return page.evaluate((w) => {
      const A = window.APP; if (!A || !A.dbQuery || !A.camera || !A.ifc2three) return null;
      const rows = A.dbQuery("SELECT t.guid, t.center_x, t.center_y, t.center_z FROM element_transforms t JOIN elements_meta m ON m.guid=t.guid WHERE " + w + " LIMIT 400");
      const r = A.renderer.domElement.getBoundingClientRect(); const out = [];
      (rows || []).forEach(x => { const o = A.ifc2three(x[1], x[2], x[3]); const v = new window.THREE.Vector3(o.x, o.y, o.z).project(A.camera);   // dbQuery returns value arrays; ifc2three a plain {x,y,z}
        if (v.z < 1 && Math.abs(v.x) < 0.8 && Math.abs(v.y) < 0.8) out.push({ guid: x[0], x: r.left + (v.x + 1) / 2 * r.width, y: r.top + (1 - v.y) / 2 * r.height }); });
      return out.slice(0, 40);
    }, where);
  }

  try {
    // ── greeting round on the front door ──
    await page.mouse.move(720, 600);
    // red1 v2: no "take the red pill" line — the greetings start right away while the portal loads; NO UI switching per
    // greeting (voices only, back to back, no silence) — then ONE picker demonstration of the in-place switch.
    await hclick('.hot.red');
    for (const L of LANGS) await beat('g_' + L, L, 'greeting (voice only)');
    await page.waitForFunction(() => document.querySelectorAll('#portal-stage .por-ic').length >= 8, null, { timeout: 15000 });
    await beat('g_pick', 'fr_FR', 'one picker demo: switch in place'); await setLang('fr_FR'); await hold(900);

    // ── 1 OPEN ──
    await chapter(1, 'OPEN');
    let n1;
    await slice('s01', 'front door → Buildings & IFC hub'); n1 = PAGELOG.length; await launcher('gps'); await page.waitForSelector('#hub.active', { timeout: 10000 });
    fact('hub', await waitLog(n1, /§HUB_CARDS rendered/, 8000)); await hold(1200);
    await keep('s02', 'drop zone — your own IFC'); await glide('#m-import-zone'); await hold(2500);
    await keep('s03', FILM_BLD + ' card → the Viewer');
    n1 = PAGELOG.length;
    const [vp] = await Promise.all([ctx.waitForEvent('page', { timeout: 20000 }), hclick('#hub .hub-card[data-bld="' + FILM_BLD + '"]')]);
    fact('open', last(n1, /§BUILDING_OPEN/));
    wire(vp, '[viewer] '); page = vp; await castOn(vp); await page.mouse.move(720, 405);
    await page.waitForFunction(() => window._TRL_READY === true, null, { timeout: 60000 });
    const tLoad0 = Date.now();
    await page.waitForFunction(() => window.APP && window.APP.streaming === false && !(window.APP._bboxPlaceholders || []).length && window.APP.guidMap && Object.keys(window.APP.guidMap).length > 500, null, { timeout: 300000 });
    fact('loadSec', ((Date.now() - tLoad0) / 1000).toFixed(1));
    fact('elements', await page.evaluate(() => Object.keys(window.APP.guidMap).length));
    fact('status', await page.$eval('#status', e => e.textContent).catch(() => ''));
    // drag the building around a little (real mouse drag on the canvas) so it reads as solid 3D
    { const cb = await page.locator('canvas').first().boundingBox(); if (cb) { const cx = cb.x + cb.width / 2, cy = cb.y + cb.height / 2;
      await page.mouse.move(cx, cy); await page.mouse.down(); await page.mouse.move(cx + 260, cy - 40, { steps: 40 }); await page.mouse.move(cx - 120, cy + 20, { steps: 40 }); await page.mouse.up();
      for (let i = 0; i < 8; i++) { await page.mouse.wheel(0, -120); await hold(90); } } }   // and zoom in a bit (red1: "while drag zoom close a bit")
    await hold(800); await solid('afterLoad');

    // ── 2 SEE ──
    await chapter(2, 'SEE');
    await slice('s04', 'pick a wall → Info panel', 'es_ES');
    let picked = '';
    for (const pt of (await screenOf("m.ifc_class IN ('IfcWall','IfcWallStandardCase')")) || []) {
      n1 = PAGELOG.length; await glideXY(pt.x, pt.y); await page.mouse.down(); await hold(60); await page.mouse.up(); await hold(700);
      picked = last(n1, /§PICK [A-Z]/); if (picked && /IfcWall/.test(picked)) break;
    }
    fact('pick', picked || 'NO PICK');
    fact('infoPanel', await page.$eval('#info-panel', e => e.innerText.replace(/\s+/g, ' ').slice(0, 300)).catch(() => ''));
    await hold(2500); await key('Escape'); await solid('afterPick');
    await slice('s05', 'Find IfcWall'); n1 = PAGELOG.length; await key('f', 'find'); await page.waitForSelector('#find-name', { timeout: 15000 });
    await hclick('#find-name'); await page.keyboard.type('IfcWall', { delay: 90 });
    fact('find', await waitLog(n1, /§NAV_FIND_SEARCH query="IfcWall"/, 8000)); fact('findCount', await page.$eval('#find-count', e => e.textContent).catch(() => ''));
    await hold(2000);
    // s05b Ask (bim-ootb #1789, 2026-09-30): canned questions answered by the shipped engines, verdict + evidence per answer
    await slice('s05b', 'Ask: largest rooms + element counts'); n1 = PAGELOG.length;
    if (await page.locator('#find-mode-ask').first().isVisible().catch(() => false)) {
      await hclick('#find-mode-ask'); await waitLog(n1, /§ASK_MODE ask/, 5000); await hold(500);
      for (const tpl of ['largest_room', 'counts']) {   // exit_path dropped on HHS: §ROOM_GRAPH_EXITS exits=0 (no door reaches outside) → no honest answer
        const sel = '.ask-q[data-tpl="' + tpl + '"]'; const n2 = PAGELOG.length;
        if (await page.locator(sel).first().isVisible().catch(() => false)) { await hclick(sel); fact('ask.' + tpl, await waitLog(n2, /§ASK_ANSWER /, 12000) || 'NO ANSWER'); await hold(1500); }
        else fact('ask.' + tpl, 'question not offered: ' + (await page.locator('.ask-q', { hasText: /./ }).allInnerTexts().catch(() => [])).join(' | ').slice(0, 200));
      }
      await hold(1500); await hclick('#find-mode-find');
    } else fact('ask', 'NO #find-mode-ask');
    await key('Escape');
    // room path / escape route — HHS's room graph has no exits (§ROOM_GRAPH_EXITS exits=0), so the route is shown from the
    // Terminal's finished film (post: film_title_cards.py CLIPS 's05c'); Ask's exit answer uses the same record (8311ba5f)
    await beat('s05c', curLang, 'cut to the Terminal escape route (same engine as Ask)'); await hold(4600);
    await slice('s06', 'a floor + X-Ray', 'ar_SA'); n1 = PAGELOG.length;
    // a floor via the Find panel's own category tree (red1: "the Find panel can do that easily when selected a category")
    // the Find drill turns the bbox SHELL on for large buildings by design (navigate_find.js:3522 §BBOX_SHELL_DEFAULT) — the
    // plain storey filter shows the same floor with NO wireframe (red1: avoid wireframe frames)
    const storey = await page.evaluate(() => { const r = window.APP.dbQuery("SELECT storey FROM elements_meta WHERE storey IS NOT NULL AND storey NOT IN ('','Unknown') GROUP BY storey ORDER BY COUNT(*) DESC LIMIT 1"); return r && r[0] ? r[0][0] : null; });
    await page.evaluate((st) => window.APP.filterStorey(st), storey); fact('storey', last(n1, /§STOREY_FILTER/) || storey); await hold(2200);
    await page.evaluate(() => window.APP.filterStorey(null)); await solid('afterFloor');
    n1 = PAGELOG.length; await page.keyboard.press('Alt+z'); await hold(2200); fact('xray', PAGELOG.slice(n1).find(l => /§XRAY_CYCLE/.test(l)) || 'NONE');
    await page.keyboard.press('Alt+z'); await hold(1500); await page.keyboard.press('Alt+z'); await hold(500);

    // ── 3 INSPECT ──
    await chapter(3, 'INSPECT');
    await slice('s07', 'section cut', 'zh_CN'); n1 = PAGELOG.length; await key('x', 'section'); fact('section', await waitLog(n1, /§SECTION ON/, 5000));
    const rng = await page.evaluate(() => { const s = document.getElementById('section-slider'); return s ? [Number(s.min), Number(s.max), Number(s.value)] : null; });
    if (rng) for (let i = 0; i <= 24; i++) { await page.evaluate((v) => { const s = document.getElementById('section-slider'); s.value = v; s.dispatchEvent(new Event('input', { bubbles: true })); }, rng[1] - (rng[1] - rng[0]) * 0.55 * i / 24); await hold(90); }
    await hold(1500); await key('x');
    await slice('s08', 'measure two taps'); n1 = PAGELOG.length; await key('m', 'measure');
    const pts = (await screenOf("m.ifc_class IN ('IfcSlab','IfcWall','IfcWallStandardCase')")) || [];
    for (const pt of pts.slice(0, 2)) { await glideXY(pt.x, pt.y); await page.mouse.down(); await hold(60); await page.mouse.up(); await hold(900); }
    fact('measure', await waitLog(n1, /§MEASURE \d/, 4000) || 'NO DISTANCE'); await hold(1500); await key('m'); await key('Escape');
    // Night + Fly together, live (red1: "u can use the Fly mode with Night on to get it going")
    await slice('s09', 'night + fly', 'ms_MY'); n1 = PAGELOG.length; await key('n', 'night'); fact('night', await waitLog(n1, /§NIGHT_MODE on/, 5000)); await hold(1200);
    n1 = PAGELOG.length; await key('l', 'fly'); fact('tour', await waitLog(n1, /§SCRUB_UI show/, 60000));
    await hold(1500);
    { const sb = await page.locator('#tour-scrub-slider').first().boundingBox();   // red1: "the fly has timeline, should show the scrub then"
      if (sb) { const y = sb.y + sb.height / 2; await glideXY(sb.x + sb.width * 0.15, y); await page.mouse.down(); await page.mouse.move(sb.x + sb.width * 0.7, y, { steps: 45 }); await hold(500); await page.mouse.move(sb.x + sb.width * 0.35, y, { steps: 35 }); await page.mouse.up(); fact('tourScrub', last(0, /§SCRUB_SEEK/) || 'dragged'); } }
    await hold(1000);
    // Alt+G denoise during the night fly (red1: "there is an alt-g toggle to give it denoise mode but when deactivate it
    // leaves a ghost effect. Thus refresh F5 (jump ahead when done)")
    n1 = PAGELOG.length; await page.keyboard.press('Alt+g'); fact('denoise', await waitLog(n1, /§KBD_ROUTE Alt\+G|§GI_POC/, 8000)); await hold(2600);
    await refreshCut('after Alt+G (toggle-off leaves a ghost)'); await solid('afterF5');
    await slice('s10', 'clash: pair → list → one → range'); n1 = PAGELOG.length; await key('c', 'clash'); fact('clash', await waitLog(n1, /§CLASH_MATRIX shown/, 30000));
    // the counts arrive as §CLASH_MATRIX_COUNT lines after the grid shows — wait, then take the busiest pair
    for (let i = 0; i < 80 && PAGELOG.slice(n1).filter(l => /§CLASH_MATRIX_COUNT /.test(l)).length < 3; i++) await page.waitForTimeout(100);
    let pair = null, pn = -1; PAGELOG.slice(n1).forEach(l => { const m = l.match(/§CLASH_MATRIX_COUNT (\S+) = (\d+)/); if (m && +m[2] > pn) { pn = +m[2]; pair = m[1]; } });
    fact('clashCounts', PAGELOG.slice(n1).filter(l => /§CLASH_MATRIX_COUNT /.test(l)).map(l => l.replace(/^.*COUNT /, '').replace(/ size.*/, '')).join(' · '));
    fact('clashPair', pair);
    if (pair) {
      n1 = PAGELOG.length; await hclick('[data-pair="' + pair + '"]'); await page.waitForSelector('[data-clash-idx]', { timeout: 20000 }).catch(() => {});
      fact('clashList', last(n1, /§CLASH_MATRIX_FILTER|§CLASH_QUERY/) + ' rows=' + (await page.locator('[data-clash-idx]').count()));
      await hold(800); n1 = PAGELOG.length; await hclick('[data-clash-idx] >> nth=0'); fact('clashOne', await waitLog(n1, /§CLASH|§LISTNAV_SELECT/, 6000)); await hold(2200);
      const rows = await page.locator('[data-clash-idx]').count(); const lastRow = Math.min(rows, 12) - 1;
      if (lastRow > 0) { n1 = PAGELOG.length; await page.keyboard.down('Shift'); await hclick('[data-clash-idx] >> nth=' + lastRow); await page.keyboard.up('Shift');
        fact('clashRange', await waitLog(n1, /§LISTNAV_SELECT count=/, 6000)); await hold(2800); }
    }
    n1 = PAGELOG.length;
    if (await page.locator('#clash-list-close').first().isVisible().catch(() => false)) await hclick('#clash-list-close');
    await key('c'); fact('clashDismiss', await waitLog(n1, /§CLASH_DISMISS/, 3000) || 'NO §CLASH_DISMISS');
    if (await page.locator('#clash-list-close').first().isVisible().catch(() => false)) { await hclick('#clash-list-close'); await waitLog(n1, /§CLASH_DISMISS/, 3000); }
    await refreshCut('after the clash list (clean scene for the Time Machine)'); await solid('afterClash');

    // ── 4 TIME ──
    await chapter(4, 'TIME');
    await slice('s11', 'Time Machine plays'); n1 = PAGELOG.length; await key('t', 'tm'); fact('tm', await waitLog(n1, /§TIME_MACHINE ON/, 60000));
    await page.waitForSelector('#tm-fwd-btn', { timeout: 20000 });
    // a better view of the build: drag the camera round to a three-quarter perspective (red1: "it is not drag around to view better")
    { const cb = await page.locator('canvas').first().boundingBox(); if (cb) { const cx = cb.x + cb.width * 0.4, cy = cb.y + cb.height * 0.55;
      await page.mouse.move(cx, cy); await page.mouse.down(); await page.mouse.move(cx + 220, cy - 70, { steps: 40 }); await page.mouse.up(); for (let i = 0; i < 4; i++) { await page.mouse.wheel(0, -120); await hold(80); } } }
    // V = construction sounds, the ONE audible sample in the film (red1: "just a sample of V.. other times turn off")
    n1 = PAGELOG.length; await key('v', 'sfxOn'); fact('sfx', last(n1, /§SFX_[A-Z]+/) || 'no §SFX line');
    await hclick('#tm-fwd-btn'); await hold(5500);
    fact('tmDay', await page.$eval('#tm-big-counter', e => e.textContent).catch(() => ''));
    // the sun: Day/night on, then HR mode — the slider becomes the hour of that day (onSlide: anchorDay + (val+1) h) → morning to sunset
    if (await page.locator('#tm-sun').first().isVisible().catch(() => false)) {
      await beat('s11sun', curLang, 'sun on → HR mode → sunset');
      n1 = PAGELOG.length; await hclick('#tm-sun'); await hold(600);
      if (await page.locator('.tm-mode[data-mode="HR"]').first().isVisible().catch(() => false)) await hclick('.tm-mode[data-mode="HR"]');
      // HR mode + play forward: the clock runs through the hours and the sun goes down with it (no manual scrub here)
      await page.evaluate(() => { const s = document.getElementById('tm-slider'); s.value = 9; s.dispatchEvent(new Event('input', { bubbles: true })); });
      if (await page.locator('#tm-fwd-btn').first().isVisible().catch(() => false)) await hclick('#tm-fwd-btn');
      await hold(5200); fact('tmSun', (await page.$eval('#tm-label', e => e.textContent).catch(() => '')) + ' | ' + (last(n1, /§TM_SAVE_LIGHTING|§SUN|sun/i) || ''));
      await hclick('#tm-sun'); if (await page.locator('.tm-mode[data-mode="DAY"]').first().isVisible().catch(() => false)) await hclick('.tm-mode[data-mode="DAY"]');
    }
    await key('v', 'sfxOff');
    // s12 What-if DROPPED on HHS: §WHATIF-UI opens the ERP seed's project 990000 "BIM: Hospital" whatever building is open
    await slice('s13', 'Pull Back'); n1 = PAGELOG.length;
    if (!(await page.locator('#tm-reschedule-asap').first().isVisible().catch(() => false))) await hclick('#tm-gantt');
    await hclick('#tm-reschedule-asap'); fact('pullBack', await waitLog(n1, /§GANTT_RESCHEDULE_ASAP_(COMMIT|REJECT)/, 8000) || (await page.$eval('#tm-gantt-tip', e => e.textContent).catch(() => 'NONE')));
    await hold(1000); await key('t');

    // ── 5 COST ── (the 4 English locales on the report page: currency + rate book change with them)
    await chapter(5, 'COST');
    await slice('s15', '4D/5D dashboard'); n1 = PAGELOG.length;
    const viewerPage = page;
    const [bp] = await Promise.all([ctx.waitForEvent('page', { timeout: 20000 }), page.keyboard.press('4')]);
    wire(bp, '[boq] '); page = bp; await castOn(bp); await page.mouse.move(720, 405);
    fact('boq', await waitLog(n1, /§S254_STRIP_DONE|§RENDER_CHARTS/, 120000)); await hold(2500);
    for (const E of ['en_US', 'en_MY']) {
      await beat('s15_' + E, E, 'currency ' + E); n1 = PAGELOG.length; curLang = 'x'; await setLang(E);
      await page.waitForLoadState('load'); await waitLog(n1, /§S254_STRIP_DONE|§RENDER_CHARTS/, 90000); await hold(1500);
      fact('cur.' + E, last(n1, /TRL_CUR_MATCH|§CHARTS_CUR|CUR=/) || (await page.evaluate(() => { try { return typeof _TRL !== 'undefined' ? _TRL.cur + ' ' + (_TRL.rate_source || '') : 'no _TRL'; } catch (e) { return 'ERR ' + e.message; } })));
    }
    curLang = 'en_MY'; page = viewerPage; await page.bringToFront(); await castOn(page);

    // ── 6 SHARE ──
    await chapter(6, 'SHARE');
    await slice('s16', 'Share the exact view');   // English: carries the clash-share + no-install point (red1 2026-10-04); ko stays in the greeting/thank-you rounds n1 = PAGELOG.length; await key('/', 'share'); fact('share', await waitLog(n1, /§SHARE_PREVIEW shown/, 8000)); await hold(3000);
    // close the preview card without Playwright's 30 s auto-wait (v5: 20 s of dead air here) — only if a button is really there
    { const cb = page.locator('#share-preview-overlay button', { hasText: /Cancel|×|Close/i }).last(); if (await cb.isVisible().catch(() => false)) await cb.click({ timeout: 2000 }).catch(() => {}); else await key('Escape'); }
    await slice('s17', 'Film-Maker derives a film'); n1 = PAGELOG.length; await page.keyboard.press('Alt+c');
    await page.waitForSelector('#cpe-ok', { timeout: 180000 }).catch(() => {});
    fact('filmmaker', last(n1, /§MAXQ_DURATION_DERIVED/) || last(n1, /§MAXQ_START/) || 'NONE'); await hold(1200);
    // tick a few of the film's options and play a short preview (red1: "show the alt-c, checking the boxes explaining with
    // some preview.. just to give idea.. then switch to the finished clip") — real clicks on the real (transparent) inputs
    const ticked = [];
    for (const id of ['cpe-clash', 'cpe-measure', 'cpe-storey-reveal', 'cpe-sun-compass']) {
      if (await page.locator('#' + id).first().isVisible().catch(() => false)) { await hclick('#' + id); ticked.push(id + '=' + (await page.$eval('#' + id, e => e.checked).catch(() => '?'))); await hold(450); }
    }
    fact('cpeTicked', ticked.join(' ') || 'none visible');
    await beat('s17prev', curLang, 'preview the film');
    // the preview strip belongs to the Eye (viewfinder) toggle — it is built only when the eye is on (cinema_path_editor.js:2227)
    if (!(await page.locator('#cpe-scrub-play').first().isVisible().catch(() => false)) && await page.locator('#cpe-vf-toggle').first().isVisible().catch(() => false)) { await hclick('#cpe-vf-toggle'); await hold(700); }
    if (await page.locator('#cpe-scrub-play').first().isVisible().catch(() => false)) { await hclick('#cpe-scrub-play'); await hold(3200); fact('cpePreview', 'played'); }
    else fact('cpePreview', 'no #cpe-scrub-play visible');
    // close the path editor through its own Cancel button (it overlays the page — the thank-you round's flag clicks never
    // landed behind it in run vtrail7), then make sure no orbit/bake is left running
    if (await page.locator('#cpe-cancel').first().isVisible().catch(() => false)) await hclick('#cpe-cancel');
    await page.evaluate(() => { if (window.APP.cancelMaxQualityOrbit) window.APP.cancelMaxQualityOrbit(); }).catch(() => {});
    fact('cpeClosed', !(await page.locator('#cpe-panel').first().isVisible().catch(() => false)));
    await beat('s17clip', curLang, 'cut to the finished Hospital film (post: film_title_cards.py CLIPS)'); await hold(5200);
    await hold(1500);
    for (const L of LANGS.slice(1).concat([LANGS[0]])) { await quietLang(L); await beat('t_' + L, L, 'thank-you round'); await hold(500); }
    await beat('end', curLang, '');
    say('§FILM_CURSOR clicks=' + clicks + ' cursorOnTarget=' + cursorOk + (clicks === cursorOk ? ' OK' : ' WRONG'));
  } catch (e) { say('§FILM_ERROR ' + e.message.split('\n')[0]); }

  if (cdp) await cdp.send('Page.stopScreencast').catch(() => {}); await page.waitForTimeout(300).catch(() => {});
  const endTs = Date.now() / 1000 - cutTotal;
  fs.writeFileSync(path.join(OUT, 'viewer_film.page.log'), PAGELOG.join('\n') + '\n');
  say('§FILM_PAGEERR n=' + PAGELOG.filter(l => l.startsWith('PAGEERR')).length);
  const lines = [];
  frames.forEach((f, i) => { const d = (i + 1 < frames.length ? frames[i + 1].ts : endTs) - f.ts; lines.push(`file '${f.fn}'`, `duration ${Math.max(d, 0.001).toFixed(4)}`); });
  if (frames.length) lines.push(`file '${frames[frames.length - 1].fn}'`);
  fs.writeFileSync(path.join(OUT, 'frames.txt'), lines.join('\n') + '\n');
  const mp4 = path.join(OUT, 'viewer_film.mp4');
  try {
    execFileSync('ffmpeg', ['-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', path.join(OUT, 'frames.txt'),
      '-vf', 'fps=24,scale=1920:1080:flags=lanczos,format=yuv420p', '-c:v', 'libx264', '-crf', '17', '-preset', 'medium', mp4]);
    say('§FILM_DONE frames=' + frames.length + ' dur=' + (endTs - (T0 || endTs)).toFixed(2) + ' out=' + mp4);
  } catch (e) { say('§FILM_ERROR ffmpeg ' + String(e.message).split('\n')[0]); }
  await browser.close();
  if (rec) { rec.kill('SIGINT'); await new Promise(r => setTimeout(r, 800)); say('§FILM_AUDIO stop offset=' + (T0 - audioT0).toFixed(3) + ' cutTotal=' + cutTotal.toFixed(3)); }
  if (sinkMod) { try { execFileSync('pactl', ['unload-module', sinkMod]); } catch (e) { /* */ } }
  fs.writeFileSync(path.join(OUT, 'viewer_film.log'), LOG.join('\n') + '\n');
  server.close();
})();
