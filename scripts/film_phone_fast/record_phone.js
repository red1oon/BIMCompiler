// ⚠ DO NOT REMOVE — Scope: FILM-M1 "the phone, fast" — record ONE part (phone A / phone B / desktop HQ) from the REAL viewer.
// Spec: bim-compiler prompts/MOBILE_PERF.md §FILM-M1 RECORDING SPEC (R1–R3). READ <outDir>/record.log after every run.
// Issue this proves: every beat the film shows really happened in the shipped viewer — each beat prints
//   §M1_BEAT id=… ok=true|false evidence="<the viewer's own § line>"; a beat without its evidence line is ok=false and the
//   compositor drops it (never faked). Recording starts after the viewer is ready, so no loading frame is ever captured.
// Run:  node record_phone.js <outDir> A            (Duplex, phone 456×933: panels, Walk + auto X-Ray, snag, share link, scrub)
//       node record_phone.js <outDir> B            (Hospital, phone 456×933: pick an element, snag)
//       node record_phone.js <outDir> HQ <url-file> (desktop 1920×1080 opens phone A's shared link)
//       node record_phone.js <outDir> C            (Duplex, phone 456×933: CLASH in detail — run, pick one, its detail, snag + share link from it;
//                                                   2026-11-27 recut beat. Spec: MOBILE_PERF.md §FILM-M1 owner note "clash … on detail")
//       node record_phone.js <outDir> S            (Duplex, TWO screens at once: phone A 456×933 + HQ desktop 1920×1080, both PAIRED to one encrypted team
//                                                   folder served by this process at /pipe — phone sends its report, HQ gets it, replays the walk and scrubs it;
//                                                   2026-11-27 recut beat "history syncing". Spec: MOBILE_PERF.md §FILM-M1 owner note + §P5 F3 STEPS 3-4.
//                                                   Frames: <outDir>/phone/f + <outDir>/hq/f, a manifest.json each (every frame carries t = ms on ONE shared clock).)
// CPU only, headless. Serves ~/bim-ootb (origin/main) on a local port exactly like witness_field_ops.js.
'use strict';
const os = require('os'), fs = require('fs'), path = require('path'), http = require('http');
const { chromium } = require(os.homedir() + '/bim-ootb/tests/node_modules/playwright');
const ROOT = process.env.BIM_OOTB || path.join(os.homedir(), 'bim-ootb');
if (typeof globalThis.crypto === 'undefined' || !globalThis.crypto.subtle) globalThis.crypto = require('crypto').webcrypto;
const [OUT_, ROLE, URLFILE] = process.argv.slice(2); const OUT = path.resolve(OUT_ || 'out');
if (ROLE !== 'S') fs.mkdirSync(path.join(OUT, 'f'), { recursive: true });
// role S: the team folder = a dumb folder relay at /pipe/list + /pipe/f/<name> next to the app (as viewer/tests/witness_hq_view.js serves it); the app opens with &pipe=<base>/pipe
const FOLDER = fs.mkdtempSync(path.join(os.tmpdir(), 'm1-sync-folder-'));
function walkDir(d, rel, out) { if (!fs.existsSync(d)) return out; fs.readdirSync(d).forEach(n => { const p = path.join(d, n), r = rel ? rel + '/' + n : n;
  if (fs.statSync(p).isDirectory()) walkDir(p, r, out); else out.push(r); }); return out; }
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.sql': 'text/plain', '.db': 'application/octet-stream',
  '.png': 'image/png', '.css': 'text/css', '.wasm': 'application/wasm', '.svg': 'image/svg+xml', '.webmanifest': 'application/json' };
const server = http.createServer((req, res) => {
  const u = new URL(req.url, 'http://x'); let p = decodeURIComponent(u.pathname);
  if (p === '/pipe/list') { const pre = u.searchParams.get('prefix') || '';
    res.writeHead(200, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(walkDir(FOLDER, '', []).filter(n => n.indexOf(pre) === 0))); return; }
  if (p.indexOf('/pipe/f/') === 0) { const fp = path.join(FOLDER, p.slice(8)); if (fp.indexOf(FOLDER) !== 0) { res.writeHead(400); res.end(); return; }
    if (req.method === 'PUT') { const ch = []; req.on('data', c => ch.push(c)); req.on('end', () => {
      if (u.searchParams.get('absent') === '1' && fs.existsSync(fp)) { res.writeHead(412); res.end(); return; }
      fs.mkdirSync(path.dirname(fp), { recursive: true }); fs.writeFileSync(fp, Buffer.concat(ch)); res.writeHead(201); res.end('ok'); }); return; }
    if (!fs.existsSync(fp)) { res.writeHead(404); res.end(); return; }
    res.writeHead(200, { 'Content-Type': 'application/octet-stream' }); fs.createReadStream(fp).pipe(res); return; }
  if (p === '/') p = '/viewer/viewer.html';
  fs.readFile(path.join(ROOT, p), (e, buf) => { if (e) { res.writeHead(404); res.end('404'); return; }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' }); res.end(buf); });
});
const UA = 'Mozilla/5.0 (Linux; Android 11; moto g power (2022)) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Mobile Safari/537.36';
const PHONE = { viewport: { width: 456, height: 933 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true, userAgent: UA,
  permissions: ['geolocation', 'camera'] };
const DESK = { viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 };
// B: the Hospital needs a GPU to draw its X-Ray interior in time (CPU run stalled > 4 min on one frame, 2026-11-27); a GPU run needs the owner's OK
const BLD = { A: 'buildings/Duplex_extracted.db', C: 'buildings/Duplex_extracted.db', B: process.env.M1_B_DB || 'buildings/HHS_Office_Federated_extracted.db' };

const LOG = []; const say = s => { LOG.push(s); console.log(s); };
let frames = [], page, cons = [], nShot = 0, SHOT_DIR = OUT; let T0 = Date.now(), lastT = -1;   // T0 = the one clock (role S resets it after the arrangement)
const pad = n => String(n).padStart(4, '0');
// one captured frame; hold = how many film frames (30 fps) it stays; tap = finger mark the compositor draws (not in the UI)
async function shot(beat, hold, tap) { const f = 'f/' + pad(nShot++) + '.png'; const t = Math.max(lastT + 1, Date.now() - T0); lastT = t;
  await page.screenshot({ path: path.join(SHOT_DIR, f) });
  frames.push({ f, hold: hold || 1, beat, tap: tap || null, t }); }
let beats = [];
async function beat(id, re, fn) {
  const m = cons.length, f0 = frames.length; let err = null;
  try { await fn(); } catch (e) { err = String(e.message || e).slice(0, 160); }
  let ev = cons.slice(m).filter(t => re.test(t));
  for (let w = 0; !err && !ev.length && w < 300; w++) { await page.waitForTimeout(300); ev = cons.slice(m).filter(t => re.test(t)); }   // async evidence (IndexedDB etc.), no frames taken
  const ok = !err && ev.length > 0;
  beats.push({ id, ok, frames: [f0, frames.length] });
  say(`§M1_BEAT id=${id} ok=${ok} frames=${frames.length - f0} evidence="${(ev[0] || '').slice(0, 200)}"${err ? ' error="' + err + '"' : ''}`);
  return ok;
}
const center = sel => page.evaluate(s => { const e = document.querySelector(s); if (!e || !e.offsetWidth) return null;
  const r = e.getBoundingClientRect(); return [Math.round(r.left + r.width / 2), Math.round(r.top + r.height / 2)]; }, sel);
// a real tap: pointer events at the element's centre (what the witnesses use for pills), frames before/after
async function tapSel(beatId, sel, after) {
  const c = await center(sel); if (!c) throw new Error('not on screen: ' + sel);
  await shot(beatId, 6, c);
  // pills/rows act on pointerup (as the witnesses drive them); plain onclick buttons (SET, Snag, shutter) get a click
  await page.evaluate(s => { const e = document.querySelector(s); if (e.getAttribute('onclick')) e.click();
    else e.dispatchEvent(new PointerEvent('pointerup', { bubbles: true })); }, sel);
  await page.waitForTimeout(after || 250);
  return c;
}
async function tapRow(beatId, drawer, prefix) {
  const c = await page.evaluate(([d, p]) => { const pn = document.getElementById(d + '-drawer-panel'); if (!pn) return null;
    const r = [...pn.querySelectorAll('button')].find(b => (b.innerText || '').trim().startsWith(p)); if (!r) return null;
    r.setAttribute('data-m1', '1'); const b = r.getBoundingClientRect(); return [Math.round(b.left + b.width / 2), Math.round(b.top + b.height / 2)]; }, [drawer, prefix]);
  if (!c) throw new Error('row not found: ' + drawer + '/' + prefix);
  await shot(beatId, 6, c);
  await page.evaluate(() => { const r = document.querySelector('[data-m1]'); r.removeAttribute('data-m1'); r.dispatchEvent(new PointerEvent('pointerup', { bubbles: true })); });
  await page.waitForTimeout(300);
}
// a finger swipe down on a sheet's free top area (not on a control) — the P2 sheet manager closes it (§SHEET_CLOSE via=swipe)
async function swipeDown(beatId, id) {
  const sp = await page.evaluate(id => { const el = document.getElementById(id); const r = el.getBoundingClientRect();
    for (const dy of [14, 24, 36, 50]) for (const fx of [0.5, 0.3, 0.7]) { const px = r.left + r.width * fx, py = r.top + dy, t = document.elementFromPoint(px, py);
      if (t && el.contains(t) && !t.closest('button,input,select,a')) return [Math.round(px), Math.round(py)]; } return null; }, id);
  if (!sp) throw new Error('no swipe point on ' + id);
  await page.mouse.move(sp[0], sp[1]); await page.mouse.down(); await shot(beatId, 4, sp);
  for (let k = 1; k <= 4; k++) { await page.mouse.move(sp[0], sp[1] + k * 30, { steps: 2 }); await shot(beatId, 3, [sp[0], sp[1] + k * 30]); }
  await page.mouse.up(); await page.waitForTimeout(350); await shot(beatId, 14);
}

// a real finger tap on the element's centre via the browser's own mouse pipeline (pointerdown → pointerup → click), only if that
// point really hits the element (or a child) — what a thumb does; used where the viewer listens for click (matrix cells) or for
// a long-press (clash row → snag). hold_ms > 0 = long press.
async function touchAt(beatId, sel, holdMs, after) {
  const c = await page.evaluate(s => { const e = document.querySelector(s); if (!e || !e.offsetWidth) return null;
    const r = e.getBoundingClientRect(), x = Math.round(r.left + r.width / 2), y = Math.round(r.top + r.height / 2), t = document.elementFromPoint(x, y);
    return (t && (e === t || e.contains(t) || t.contains(e))) ? [x, y] : { blocked: t ? (t.id || t.tagName) : 'none', x, y }; }, sel);
  if (!c) throw new Error('not on screen: ' + sel);
  if (!Array.isArray(c)) throw new Error('covered by ' + c.blocked + ' at ' + c.x + ',' + c.y + ': ' + sel);
  await shot(beatId, 6, c);
  await page.mouse.move(c[0], c[1]); await page.mouse.down();
  if (holdMs) { await page.waitForTimeout(holdMs); await shot(beatId, 10, c); }
  await page.mouse.up(); await page.waitForTimeout(after || 300);
  return c;
}
async function ready(ctx, url, tag) {
  page = await ctx.newPage(); const mine = cons = []; page.setDefaultTimeout(240000);   // software GL: a Hospital X-Ray frame can take > 30 s
  const pre = tag ? '  [' + tag + ' console] ' : '  [console] ';   // role S: two pages log into one record.log, each line says whose it is
  page.on('console', m => { const t = m.text(); mine.push(t); if (/§(SHEET_(CLOSE|REPLACE|SWALLOW)|WALK_XRAY|ISSUE_|PICK hits|SNAP |CAMERA|RENDERER_CAPS|CLASH_(REVEAL|DETAIL|VIZ|MATRIX_FILTER|SNAG|MATRIX_COUNT)|SHARE_URL|HQ_(SEND|GET|REPLAY|TEAM)|WALK_TRACE)/.test(t)) LOG.push(pre + t.slice(0, 200)); });
  page.on('pageerror', e => say((tag ? '  [' + tag + ' pageerror] ' : '  [pageerror] ') + String(e.message).slice(0, 200)));
  const t0 = Date.now(); await page.goto(url, { waitUntil: 'domcontentloaded' });
  for (let i = 0; i < 240; i++) { await page.waitForTimeout(1000);
    if (await page.evaluate(() => !!(window.APP && APP.guidMap && Object.keys(APP.guidMap).length && APP.streaming === false && window._mainPillActions)).catch(() => false)) {
      await page.waitForTimeout(2500); say(`§M1_READY role=${ROLE}${tag ? ' screen=' + tag : ''} url=${url.replace(/^http:\/\/127\.0\.0\.1:\d+/, '')} wait_s=${((Date.now() - t0) / 1000).toFixed(1)} (not filmed)`); return true; } }
  say('§M1_READY role=' + ROLE + ' FAILED'); return false;
}
// a camera feed for Site Camera: the viewer's own canvas (R2 — a headless browser has no camera)
const CAM_SHIM = () => { const gum = async () => (window.APP && APP.canvas && APP.canvas.captureStream) ? APP.canvas.captureStream(15) : Promise.reject(new Error('no canvas'));
  if (navigator.mediaDevices) navigator.mediaDevices.getUserMedia = gum; };
async function siteGeo(ctx) {   // R2 — GPS = the building's own site reference, or nothing
  const g = await page.evaluate(() => { try { const r = APP.dbQuery("SELECT key, value FROM project_metadata WHERE key IN ('site_latitude','site_longitude')"); const m = {};
    (r || []).forEach(x => { m[x.key || x[0]] = x.value || x[1]; }); return m; } catch (e) { return { err: String(e) }; } });
  if (g.site_latitude && g.site_longitude) { await ctx.setGeolocation({ latitude: +g.site_latitude, longitude: +g.site_longitude, accuracy: 8 });
    say(`§M1_GEO src=site lat=${g.site_latitude} lng=${g.site_longitude}`); } else say('§M1_GEO src=none ' + JSON.stringify(g));
}
// pick: tap points on the model until one selects an element (the info card shows) — logged, not guessed
async function pickSomething(beatId) {
  for (let y = 300; y <= 700; y += 50) for (let x = 120; x <= 340; x += 55) {
    const m = cons.length; await page.mouse.click(x, y); await page.waitForTimeout(500);
    if (cons.slice(m).some(t => /^§PICK hits=[1-9]/.test(t)) && await page.evaluate(() => { const ip = document.getElementById('info-panel'); return !!(ip && ip.style.display !== 'none' && ip.offsetWidth); })) {
      return [x, y]; }
    await page.evaluate(() => { const ip = document.getElementById('info-panel'); if (ip) ip.style.display = 'none'; });
  }
  return null;
}
async function snag(beatId) {
  const pt = await pickSomething(beatId); if (!pt) throw new Error('no pickable point');
  await shot(beatId, 4, pt); await shot(beatId, 30);                         // the info card with the Snag button
  await tapSel(beatId, '#snag-btn-fixed', 1500); await shot(beatId, 30);
  for (let w = 0; w < 30 && !(await page.evaluate(() => !!APP._camGpsPos)); w++) await page.waitForTimeout(300);
  await shot(beatId, 30);
  say('  [gps] ' + await page.evaluate(() => (document.getElementById('site-cam-gps') || {}).textContent + ' pos=' + !!APP._camGpsPos)); // Site Camera open: element, GPS, time
  await tapSel(beatId, '#site-cam-snap-btn', 120); await shot(beatId, 3); await page.waitForTimeout(1400); await shot(beatId, 60);   // the stamped photo (§SNAP)
  await tapSel(beatId, '[onclick="downloadSitePhoto()"]', 1200); await shot(beatId, 20); await page.waitForTimeout(1500);                                     // Save → Issue Log (§ISSUE_SAVED)
}

(async () => {
  await new Promise(r => server.listen(0, r)); const port = server.address().port, base = 'http://127.0.0.1:' + port;
  const browser = await chromium.launch({ args: ['--disable-gpu'] });
  if (ROLE === 'A' || ROLE === 'B') {
    const ctx = await browser.newContext(PHONE); await ctx.addInitScript(CAM_SHIM);
    if (!await ready(ctx, base + '/viewer/viewer.html?db=' + BLD[ROLE])) throw new Error('not ready');
    await siteGeo(ctx);
    await shot('ready', 75);   // 2.5 s: room for the 'ready' narration line
    if (ROLE === 'A') {
      await beat('fab', /^§M1_FAB pills_shown=[1-9]/, async () => { await tapSel('fab', '#mobile-trigger', 400); await shot('fab', 12);
        const n = await page.evaluate(() => [...document.querySelectorAll('[id^="pill-"]')].filter(e => e.offsetWidth && getComputedStyle(e).visibility !== 'hidden').length);
        const l = '§M1_FAB pills_shown=' + n; cons.push(l); say(l); });
      await beat('nav_open', /^§SHEET_OPEN|^§SHEET/, async () => { await tapSel('nav_open', '#pill-navigate', 120); await shot('nav_open', 3); await page.waitForTimeout(200); await shot('nav_open', 30); });
      await beat('nav_swipe', /^§SHEET_CLOSE .*via=swipe/, async () => {
        await swipeDown('nav_swipe', 'navigate-drawer-panel');
      });
      await beat('settings_open', /^§SHEET_OPEN|^§SHEET/, async () => { await tapSel('settings_open', '#pill-settings', 150); await shot('settings_open', 3); await page.waitForTimeout(250); await shot('settings_open', 36); });
      await beat('settings_back', /^§SHEET_CLOSE .*via=back/, async () => { await page.goBack({ timeout: 3000 }).catch(() => {}); await page.waitForTimeout(400); await shot('settings_back', 24); });
      // Walk: Navigate → Walk row → SET (the real prompt) → X-Ray switches itself on
      await beat('walk_start', /^§WALK_XRAY_AUTO on/, async () => {
        await tapSel('walk_start', '#pill-navigate', 400); await tapRow('walk_start', 'navigate', 'Walk'); await shot('walk_start', 12);
        // the Walk prompt opens UNDER the still-open Navigate drawer (defect logged in MOBILE_PERF §FILM-M1) — a user swipes the drawer away first
        await swipeDown('walk_start', 'navigate-drawer-panel');
        await tapSel('walk_start', '#walk-anchor-prompt button', 900); await shot('walk_start', 45);
      });
      // steps: a phone counts them from the accelerometer; the emulator has none, so each step is injected (A.advanceWalkStep) — caption says so
      await beat('walk_steps', /^§WALK_TRACE /, async () => {
        for (let k = 1; k <= 12; k++) { await page.evaluate(k => { if (k === 7) APP.camera.rotateY(40 * Math.PI / 180);
          APP.walkStepCount = (APP.walkStepCount || 0) + 1; APP.advanceWalkStep(); }, k); await page.waitForTimeout(120); await shot('walk_steps', 7); }
        await shot('walk_steps', 20);
      });
      await beat('snag', /§ISSUE_SAVED/, async () => snag('snag'));
      await beat('share', /^§M1_SHARE /, async () => { const u = await page.evaluate(() => APP.buildShareUrl());
        const rel = u.replace(/^http:\/\/127\.0\.0\.1:\d+/, ''); fs.writeFileSync(path.join(OUT, 'share_url.txt'), rel); cons.push('§M1_SHARE url=' + rel); say('§M1_SHARE url=' + rel); });
      await beat('walk_stop', /^§WALK_XRAY_AUTO restored/, async () => { await page.evaluate(() => APP.stopWalkMode()); await page.waitForTimeout(500); await shot('walk_stop', 20); });
      await page.evaluate(() => { try { APP.closeSitePreview && APP.closeSitePreview(); APP.closeSiteCamera && APP.closeSiteCamera(); } catch (e) {} });
      // replay = scrub the op-log back along the walk (F2): jump to each WALK event in order
      await page.evaluate(() => { const c = document.getElementById('info-panel-close'); if (c) c.click(); const ip = document.getElementById('info-panel'); if (ip) ip.style.display = 'none'; });
      await beat('scrub', /^§M1_SCRUB /, async () => {
        const ev = await page.evaluate(() => UniversalHistory.list().map((e, i) => ({ i, label: e.label })).filter(e => /^Walk · /.test(e.label || '')));
        for (const e of ev) { await page.evaluate(i => UniversalHistory.jumpTo(i), e.i); await page.waitForTimeout(300); await shot('scrub', 18); }
        const line = '§M1_SCRUB walk_events=' + ev.length + ' labels=' + ev.map(e => JSON.stringify(e.label)).join(',');
        if (ev.length) { cons.push(line); say(line); }
      });
    } else {
      await beat('b_fab', /^§M1_FAB pills_shown=[1-9]/, async () => { await tapSel('b_fab', '#mobile-trigger', 400);
        const n = await page.evaluate(() => [...document.querySelectorAll('[id^="pill-"]')].filter(e => e.offsetWidth && getComputedStyle(e).visibility !== 'hidden').length);
        const l = '§M1_FAB pills_shown=' + n; cons.push(l); say(l); });
      await beat('b_walk', /^§WALK_XRAY_AUTO on/, async () => {
        await tapSel('b_walk', '#pill-navigate', 400); await tapRow('b_walk', 'navigate', 'Walk'); await shot('b_walk', 8);
        await swipeDown('b_walk', 'navigate-drawer-panel'); await tapSel('b_walk', '#walk-anchor-prompt button', 900); await shot('b_walk', 30);
        for (let k = 1; k <= 4; k++) { await page.evaluate(() => { APP.walkStepCount = (APP.walkStepCount || 0) + 1; APP.advanceWalkStep(); }); await page.waitForTimeout(150); await shot('b_walk', 7); }
      });
      await beat('b_snag', /§ISSUE_SAVED/, async () => snag('b_snag'));
    }
    await ctx.close();
  } else if (ROLE === 'C') {
    // Clash in detail, Duplex, phone profile. Every step is the real UI path a phone user has:
    //   FAB → Inspect pill → Clash Matrix row → matrix cell (a discipline pair) → clash list row (tap = detail, long-press = snag)
    //   → Site Camera preview → Share → share panel → Copy URL → OK.   (APP.buildShareUrl has no phone button — the clash link is
    //   the one the Share panel itself builds, A._buildClashDeepLink; not called from here.)
    const ctx = await browser.newContext(Object.assign({}, PHONE, { permissions: [...PHONE.permissions, 'clipboard-read', 'clipboard-write'] }));
    if (!await ready(ctx, base + '/viewer/viewer.html?db=' + BLD.C)) throw new Error('not ready');
    await siteGeo(ctx);
    await shot('ready', 45);
    let pair = null, pick = null;   // the pair chosen from the matrix's own counts; the clash row tapped
    await beat('clash_run', /^§CLASH_REVEAL storey=\S+ showing=[1-9]/, async () => {
      await tapSel('clash_run', '#mobile-trigger', 400); await shot('clash_run', 12);
      await tapSel('clash_run', '#pill-inspect', 400); await tapRow('clash_run', 'inspect', 'Clash'); await shot('clash_run', 20);
      for (let w = 0; w < 100 && !(await page.evaluate(() => !!APP._clashMatrixDiv)); w++) await page.waitForTimeout(300);
      // the Inspect drawer may still be open over the matrix (FILM-M1 finding 1 class) — a user swipes it away
      if (await page.evaluate(() => { const d = document.getElementById('inspect-drawer-panel'); return !!(d && d.offsetWidth && getComputedStyle(d).display !== 'none'); }))
        await swipeDown('clash_run', 'inspect-drawer-panel');
      // the matrix counts its pairs by itself (background pass); wait until it is done, then choose the pair with the most hits
      for (let w = 0; w < 200 && !cons.some(t => /^§CLASH_TRI_COLLAPSE done/.test(t)); w++) await page.waitForTimeout(300);
      for (let q = 0, n0 = -1; q < 40; q++) { const n = cons.filter(t => /^§CLASH_MATRIX_COUNT /.test(t)).length; if (n === n0) break; n0 = n; await page.waitForTimeout(500); }
      const counts = cons.filter(t => /^§CLASH_MATRIX_COUNT /.test(t)).map(t => { const m = t.match(/^§CLASH_MATRIX_COUNT (\S+)\|(\S+) = (\d+)/); return m && { a: m[1], b: m[2], n: +m[3] }; }).filter(Boolean);
      say('  [matrix] counts=' + JSON.stringify(counts));
      if (!counts.length) throw new Error('matrix gave no counts');
      const best = counts.slice().sort((x, y) => y.n - x.n)[0]; pair = best;
      await shot('clash_run', 30);
      // the open pill rail covers the list's right edge (seen in run C1: row text cut by the pills) — a user taps the FAB again to fold it
      const pillsN = () => page.evaluate(() => [...document.querySelectorAll('[id^="pill-"]')].filter(e => e.offsetWidth && getComputedStyle(e).visibility !== 'hidden').length);
      const p0 = await pillsN(); await tapSel('clash_run', '#mobile-trigger', 500); const p1 = await pillsN(); say(`  [fab] pills_shown before=${p0} after_fold=${p1}`);
      const sel = await page.evaluate(b => { for (const k of [b.a + '|' + b.b, b.b + '|' + b.a]) { const e = document.querySelector('[data-pair="' + k + '"]');
        if (e && e.offsetWidth) { e.setAttribute('data-m1c', '1'); return '[data-m1c]'; } } return null; }, best);
      if (!sel) throw new Error('matrix cell not on screen for ' + best.a + '|' + best.b);
      await touchAt('clash_run', sel, 0, 600);
      await page.evaluate(() => { const e = document.querySelector('[data-m1c]'); if (e) e.removeAttribute('data-m1c'); });
      for (let w = 0; w < 100 && !(await page.evaluate(() => !!(APP._clashListDiv && APP._clashListDiv.querySelector('[data-clash-idx]')))); w++) await page.waitForTimeout(300);
      await page.waitForTimeout(1500); await shot('clash_run', 45);   // the list, with the pair's own count line
      say('  [clash_run] pair=' + best.a + '|' + best.b + ' matrix_count=' + best.n);
    });
    await beat('clash_pick', /^§CLASH_DETAIL guidA=/, async () => {
      // tap the first listed clash row (the viewer's own order); its idx comes from the row's data attribute
      const idx = await page.evaluate(() => { const r = APP._clashListDiv && APP._clashListDiv.querySelector('[data-clash-idx]'); if (!r) return null; r.setAttribute('data-m1r', '1'); return +r.getAttribute('data-clash-idx'); });
      if (idx === null) throw new Error('no clash row in the list');
      pick = { idx };
      await touchAt('clash_pick', '[data-m1r]', 0, 400);
    });
    await beat('clash_detail', /^§M1_CLASH /, async () => {
      // the camera flies 2 s to the overlap; frames across it, then settle
      for (let k = 0; k < 6; k++) { await page.waitForTimeout(450); await shot('clash_detail', 8); }
      await page.waitForTimeout(600);
      const r = await page.evaluate(pk => {
        const c = (APP._currentClashes || [])[pk.idx]; const L = APP._clashListDiv; const row = L && L.querySelector('[data-clash-idx="' + pk.idx + '"]');
        const rect = e => { const b = e.getBoundingClientRect(); return [Math.round(b.left), Math.round(b.top), Math.round(b.width), Math.round(b.height)]; };
        const inVp = b => b[2] > 0 && b[3] > 0 && b[0] >= 0 && b[1] >= 0 && b[0] + b[2] <= innerWidth && b[1] + b[3] <= innerHeight;
        // overlap centre recomputed from the two elements' own stored boxes (same rows _flyToClash reads) → where the camera must be looking
        const pos = APP.dbQuery("SELECT guid, center_x, center_y, center_z, bbox_x, bbox_y, bbox_z FROM element_transforms WHERE guid IN (?, ?)", [c[0], c[1]]);
        const lo = [-1e9, -1e9, -1e9], hi = [1e9, 1e9, 1e9]; pos.forEach(p => { for (let i = 0; i < 3; i++) { lo[i] = Math.max(lo[i], p[1 + i] - p[4 + i] / 2); hi[i] = Math.min(hi[i], p[1 + i] + p[4 + i] / 2); } });
        const oc = APP.ifc2three((lo[0] + hi[0]) / 2, (lo[1] + hi[1]) / 2, (lo[2] + hi[2]) / 2), t = APP.controls.target;
        return { idx: APP._currentClashViewIdx, a: c[0], b: c[1], clsA: c[2], clsB: c[3], list: L ? rect(L) : null, listInVp: L ? inVp(rect(L)) : false,
          rowRect: row ? rect(row) : null, rowInVp: row ? inVp(rect(row)) : false, rowSel: !!(row && /79, ?195, ?247/.test(row.style.background)),
          hl: (APP._clashHighlights || []).length, rows2: pos.length, tgtErr: Math.hypot(t.x - oc.x, t.y - oc.y, t.z - oc.z) };
      }, pick);
      const dl = cons.filter(t => /^§CLASH_DETAIL guidA=/.test(t)).pop() || '';
      const dm = dl.match(/guidA=(\S+) guidB=(\S+)/);
      const checks = { idx: r.idx === pick.idx, guids: !!dm && dm[1] === r.a && dm[2] === r.b, list_in_viewport: r.listInVp, row_in_viewport: r.rowInVp,
        row_selected: r.rowSel, highlights: r.hl >= 2, both_elements_found: r.rows2 === 2, cam_on_overlap: r.tgtErr < 0.05 };
      const bad = Object.keys(checks).filter(k => !checks[k]);
      const line = `§M1_CLASH pair=${r.a}|${r.b} idx=${r.idx} classes=${r.clsA}|${r.clsB} panel_rect=${r.list} row_rect=${r.rowRect} highlights=${r.hl} tgt_err_m=${r.tgtErr.toFixed(4)} checks=${bad.length ? 'FAIL[' + bad.join(',') + ']' : 'all_pass'}`;
      say(line); if (!bad.length) cons.push(line);
      pick.guidA = r.a; pick.guidB = r.b;
      await shot('clash_detail', 60);
    });
    await beat('clash_snag_or_share', /^§M1_SHARE /, async () => {
      // long-press the SAME clash row → the viewer's own clash snag (S246): markup preview with the clash strip
      await touchAt('clash_snag', '[data-m1r]', 600, 900);
      for (let w = 0; w < 60 && !(await page.evaluate(() => !!APP._pendingClashSnag)); w++) await page.waitForTimeout(250);
      for (let k = 0; k < 3; k++) { await page.waitForTimeout(300); await shot('clash_snag', 20); }
      const cs = await page.evaluate(() => APP._pendingClashSnag && { a: APP._pendingClashSnag.element_a_guid, b: APP._pendingClashSnag.element_b_guid, link: APP._pendingClashSnag.deep_link, mm: APP._pendingClashSnag.overlap_mm, sev: APP._pendingClashSnag.severity });
      if (!cs) throw new Error('no clash snag preview');
      // Share (real button) → no OS share sheet in a desktop-class engine → the viewer's own share panel → Copy URL → OK
      await tapSel('clash_share', '#site-cam-preview-controls button[onclick="shareSitePhoto()"]', 900); await shot('clash_share', 40);
      for (let w = 0; w < 40 && !(await page.evaluate(() => !!document.getElementById('share-copy'))); w++) await page.waitForTimeout(250);
      await touchAt('clash_share', '#share-copy', 0, 900); await shot('clash_share', 40);
      await page.evaluate(() => { const b = [...document.querySelectorAll('div > button')].find(x => /^OK$/.test((x.textContent || '').trim()) && x.offsetWidth); if (b) b.setAttribute('data-m1ok', '1'); });
      await touchAt('clash_share', '[data-m1ok]', 0, 900); await shot('clash_share', 45);   // back on the model, the clash saved to the Issue Log
      for (let w = 0; w < 40 && !cons.some(t => /^§CLASH_SNAG_SAVED /.test(t)); w++) await page.waitForTimeout(250);
      const saved = cons.filter(t => /^§CLASH_SNAG_SAVED /.test(t)).pop() || '';
      const db = await page.evaluate(async () => { try { const d = await APP._openIssuesDB(); const rows = await new Promise((res, rej) => { const q = d.transaction('issues').objectStore('issues').getAll(); q.onsuccess = () => res(q.result); q.onerror = rej; }); d.close();
        return rows.filter(r => r.type === 'clash').map(r => ({ a: r.element_guid, b: r.element_b_guid, link: r.deep_link, blob: r.jpeg_blob ? r.jpeg_blob.size : 0 })); } catch (e) { return String(e); } });
      const h = (cs.link.split('#')[1] || '');
      const hp = Object.fromEntries(h.split('&').map(x => x.split('=')));
      const lk = decodeURIComponent(hp.clash || '').split('~');
      const checks = { saved_line_pair: saved.includes('guid_a=' + pick.guidA) && saved.includes('guid_b=' + pick.guidB), snag_is_pick: cs.a === pick.guidA && cs.b === pick.guidB,
        url_carries_pair: lk[0] === pick.guidA && lk[1] === pick.guidB, url_has_cam: /^[-\d.]+,[-\d.]+,[-\d.]+$/.test(hp.cam || ''), idb_row: Array.isArray(db) && db.some(r => r.a === pick.guidA && r.b === pick.guidB && r.blob > 0) };
      const bad = Object.keys(checks).filter(k => !checks[k]);
      const rel = cs.link.replace(/^http:\/\/127\.0\.0\.1:\d+/, ''); fs.writeFileSync(path.join(OUT, 'share_url.txt'), rel);
      const line = `§M1_SHARE url=${rel} carries=#clash=${pick.guidA}~${pick.guidB} overlap_mm=${cs.mm} severity=${cs.sev} idb_clash_rows=${Array.isArray(db) ? db.length : db} checks=${bad.length ? 'FAIL[' + bad.join(',') + ']' : 'all_pass'}`;
      say(line); if (!bad.length) cons.push(line);
    });
    await ctx.close();
  } else if (ROLE === 'HQ') {
    const rel = fs.readFileSync(path.resolve(URLFILE), 'utf8').trim();
    const ctx = await browser.newContext(DESK);
    if (!await ready(ctx, base + rel)) throw new Error('not ready');
    await beat('hq_open', /^§M1_HQ_CAM /, async () => {
      const want = (rel.match(/cam=([-\d.]+),([-\d.]+),([-\d.]+)/) || []).slice(1).map(Number);
      const got = await page.evaluate(() => { const p = APP.camera.position; return [p.x, p.y, p.z]; });
      const d = Math.hypot(got[0] - want[0], got[1] - want[1], got[2] - want[2]);
      const line = `§M1_HQ_CAM link=${want.join(',')} desktop=${got.map(v => v.toFixed(2)).join(',')} dist_m=${d.toFixed(3)} ${d <= 0.2 ? 'SAME_VIEW' : 'DIFFERENT'}`;
      say(line); if (d <= 0.2) cons.push(line);
      await shot('hq_open', 90);
    });
    await ctx.close();
  } else if (ROLE === 'S') {
    // History syncing, two screens, ONE process, ONE relay folder (this server's /pipe). ARRANGEMENT (not filmed, copied from viewer/tests/witness_hq_view.js):
    // each browser's device is made IN its page (private keys never leave it, saved where the Team panel saves it), the founder (node) creates the encrypted team
    // space, enrols both devices and syncs to the folder, and each page's cfg ({space}) is written to IndexedDB — i.e. both browsers are PAIRED. Everything filmed
    // after that is the real UI: phone = FAB → Help → "Issues" → Send to HQ; HQ = key I → Get from team → the walk row → the history bar.
    // Shortcuts, as role A does them: walk STEPS are injected (A.advanceWalkStep, a phone counts them from the accelerometer), the walk is stopped by API,
    // and the HQ scrub is UniversalHistory.jumpTo(i) (role A's scrub precedent) — each is said again where it happens.
    const STORE = require(path.join(ROOT, 'common', 'comm', 'comm_store.js')), PIPE = require(path.join(ROOT, 'common', 'comm', 'comm_pipe.js'));
    const SQL = await require(os.homedir() + '/bim-ootb/tests/node_modules/sql.js')();
    const relay = PIPE.folderPipe(FOLDER, 'folder');
    const codeOf = kid => kid.slice(0, 4).toUpperCase() + '-' + kid.slice(4, 8).toUpperCase();
    const SHARE_STUB = () => { window.__shared = null; navigator.canShare = d => !!(d && d.files && d.files.length);   // the OS share sheet stand-in: it only keeps what it was handed
      navigator.share = async d => { window.__shared = { files: d.files.map(f => f.name) }; }; };
    const makeDevice = pg => pg.evaluate(async () => {
      for (const n of ['comm_envelope', 'comm_order', 'team_keys', 'comm_roster', 'comm_admit', 'comm_pipe', 'comm_store']) {
        if (n === 'comm_store' && window.CommStore) continue;
        await new Promise((res, rej) => { const s = document.createElement('script'); s.src = '../common/comm/' + n + '.js'; s.onload = res; s.onerror = rej; document.head.appendChild(s); }); }
      const dev = await window.CommStore.newDevice(); dev.person_uu = crypto.randomUUID();
      await new Promise((res, rej) => { const r = indexedDB.open('comm_phone', 1); r.onupgradeneeded = () => r.result.createObjectStore('kv');
        r.onsuccess = () => { const t = r.result.transaction('kv', 'readwrite'); t.objectStore('kv').put(dev, 'device'); t.oncomplete = res; t.onerror = rej; }; r.onerror = rej; });
      return { kid: dev.kid, pubJwk: dev.pubJwk, dhPubJwk: dev.dhPubJwk, person_uu: dev.person_uu }; });
    const setCfg = (pg, cfg) => pg.evaluate(cfg => new Promise((res, rej) => { const r = indexedDB.open('comm_phone', 1); r.onupgradeneeded = () => r.result.createObjectStore('kv');
      r.onsuccess = () => { const t = r.result.transaction('kv', 'readwrite'); t.objectStore('kv').put(cfg, 'cfg'); t.oncomplete = res; t.onerror = rej; }; r.onerror = rej; }), cfg);
    const rowsOf = pg => pg.evaluate(async () => { const all = await APP._getAllIssues(), out = [];
      for (const r of all) { let b64 = ''; if (r.jpeg_blob) { const b = new Uint8Array(await r.jpeg_blob.arrayBuffer()); let s = ''; for (let i = 0; i < b.length; i++) s += String.fromCharCode(b[i]); b64 = btoa(s); }
        out.push({ id: r.id, cls: r.element_class, src_kid: r.src_kid || '', src_id: r.src_id, b64 }); } return out; });
    const pipeQ = '&pipe=' + encodeURIComponent(base + '/pipe'), viewerUrl = base + '/viewer/viewer.html?db=' + BLD.A + pipeQ;
    const screens = { phone: { name: 'phone', dir: path.join(OUT, 'phone'), frames: [], beats: [], viewport: [456, 933] },
                      hq: { name: 'hq', dir: path.join(OUT, 'hq'), frames: [], beats: [], viewport: [1920, 1080] } };
    for (const k in screens) fs.mkdirSync(path.join(screens[k].dir, 'f'), { recursive: true });
    let CUR = null;
    const use = X => { CUR = X; page = X.page; cons = X.cons; frames = X.frames; beats = X.beats; SHOT_DIR = X.dir; nShot = X.frames.length; };

    const pctx = await browser.newContext(PHONE); await pctx.addInitScript(CAM_SHIM); await pctx.addInitScript(SHARE_STUB);
    if (!await ready(pctx, viewerUrl, 'phone')) throw new Error('phone not ready'); screens.phone.page = page; screens.phone.cons = cons; screens.phone.ctx = pctx;
    await siteGeo(pctx);
    const hctx = await browser.newContext(DESK);
    if (!await ready(hctx, viewerUrl, 'hq')) throw new Error('hq not ready'); screens.hq.page = page; screens.hq.cons = cons; screens.hq.ctx = hctx;
    const P = screens.phone, H = screens.hq;
    // ── arrangement (not filmed)
    const dP = await makeDevice(P.page), dH = await makeDevice(H.page);
    const fDev = await STORE.newDevice(); fDev.person_uu = require('crypto').randomUUID();
    const sp = await STORE.newSpace('m1-sync', fDev, fDev.person_uu, 'Founder', 102);
    const F = STORE.open(new SQL.Database(), { SQL, space: sp.space, self: fDev, access: () => ({ allowed: true }), tableId: () => null, log: () => {} });
    await F.genesis(sp.params);
    for (const [d, n] of [[dP, 'Site A'], [dH, 'HQ desk']]) { await F.addPerson({ person_uu: d.person_uu, name: n, ad_role_id: 103, comm_admin: false }); await F.enroll(d.kid, d.pubJwk, d.person_uu, d.dhPubJwk); }
    await F.sync(relay);
    for (const X of [P, H]) await setCfg(X.page, { space: sp.space, founder: false });
    const codeP = codeOf(dP.kid);
    say(`§M1_SYNC_ARRANGE space=${sp.space.slice(0, 12)} phone=${codeP} hq=${codeOf(dH.kid)} folder=${FOLDER} (not filmed: devices + team space made as witness_hq_view.js makes them; both browsers paired)`);

    T0 = Date.now(); lastT = -1;   // the one clock starts here
    use(H); await shot('ready', 45); use(P); await shot('ready', 45);
    const pillsN = () => page.evaluate(() => [...document.querySelectorAll('[id^="pill-"]')].filter(e => e.offsetWidth && getComputedStyle(e).visibility !== 'hidden').length);
    const statusText = () => page.evaluate(() => (document.getElementById('status') || {}).textContent || '');
    let nTrace = 0;

    // 1 — phone: a short walk, then one snag with its photo (role A's own steps)
    use(P);
    await beat('s_walk', /^§WALK_TRACE /, async () => {
      await tapSel('s_walk', '#mobile-trigger', 400); await shot('s_walk', 12);
      await tapSel('s_walk', '#pill-navigate', 400); await tapRow('s_walk', 'navigate', 'Walk'); await shot('s_walk', 12);
      await swipeDown('s_walk', 'navigate-drawer-panel');   // the Walk prompt opens under the Navigate drawer (FILM-M1 finding 1): a user swipes it away first
      await tapSel('s_walk', '#walk-anchor-prompt button', 900); await shot('s_walk', 30);
      for (let k = 1; k <= 12; k++) { await page.evaluate(k => { if (k === 4 || k === 9) APP.camera.rotateY(40 * Math.PI / 180);   // STEPS INJECTED (A.advanceWalkStep): the emulator has no accelerometer
        APP.walkStepCount = (APP.walkStepCount || 0) + 1; APP.advanceWalkStep(); }, k); await page.waitForTimeout(120); await shot('s_walk', 7); }
    });
    await beat('s_snag', /§ISSUE_SAVED/, async () => snag('s_snag'));   // the snag is taken while the walk is on (role A's order: the camera is inside the building)
    await page.evaluate(() => APP.stopWalkMode()); await page.waitForTimeout(500);   // STOP BY API, as role A does (§WALK_XRAY_AUTO restored)
    await page.evaluate(() => { try { APP.closeSitePreview && APP.closeSitePreview(); APP.closeSiteCamera && APP.closeSiteCamera(); } catch (e) {}
      const c = document.getElementById('info-panel-close'); if (c) c.click(); const ip = document.getElementById('info-panel'); if (ip) ip.style.display = 'none'; });   // cleanup, as role A (not filmed)
    nTrace = cons.filter(t => /^§WALK_TRACE /.test(t)).length;
    const phoneRows = await rowsOf(P.page);
    say(`§M1_SYNC_PHONE issues=${phoneRows.length} walk_trace_lines=${nTrace} photo_bytes=${phoneRows.map(r => Math.floor(r.b64.length * 3 / 4)).join(',')}`);

    // 2 — phone: the Issue Log as a phone user opens it (no pill carries it: FAB → Help → the "Issues" row), then the real Send to HQ button
    await beat('s_send', /^§HQ_SEND via=team drop=/, async () => {
      if (!(await pillsN())) await tapSel('s_send', '#mobile-trigger', 400);
      await tapSel('s_send', '#pill-help', 600); await shot('s_send', 20);
      for (let w = 0; w < 40 && !(await page.evaluate(() => !!document.querySelector('#cmd-palette .cmd-row'))); w++) await page.waitForTimeout(250);
      if (!(await page.evaluate(() => { const r = [...document.querySelectorAll('#cmd-palette .cmd-row')].find(x => /^Issues\b/.test((x.innerText || '').trim())); if (!r) return false; r.setAttribute('data-m1s', '1'); return true; })))
        throw new Error('no "Issues" row in the Help list');
      // the Help list is longer than the screen: the user scrolls it (mouse wheel over the list) until the row is on screen
      const rowY = () => page.evaluate(() => { const r = document.querySelector('[data-m1s]'), b = r.getBoundingClientRect(); return [Math.round(b.top + b.height / 2), innerHeight]; });
      for (let w = 0; w < 30; w++) { const [y, h] = await rowY(); if (y > 120 && y < h - 120) break; await page.mouse.move(228, 500); await page.mouse.wheel(0, y >= h - 120 ? 260 : -260); await page.waitForTimeout(200); if (w % 3 === 2) await shot('s_send', 4); }
      await touchAt('s_send', '[data-m1s]', 0, 700);
      await page.evaluate(() => { const r = document.querySelector('[data-m1s]'); if (r) r.removeAttribute('data-m1s'); });
      // the Help list stays open over the Issue Log until its ✕ is tapped (help_panel.js run(): "the panel stays open") — a user closes it
      if (await page.evaluate(() => !!document.getElementById('cmd-palette'))) await touchAt('s_send', '#cmd-close', 0, 600);
      for (let w = 0; w < 40 && !(await page.evaluate(() => { const b = document.getElementById('issues-send-hq'); return !!(b && b.offsetWidth); })); w++) await page.waitForTimeout(250);
      await shot('s_send', 30);
      await touchAt('s_send', '#issues-send-hq', 0, 300);
      for (let w = 0; w < 60 && !/team folder/i.test(await statusText()); w++) await page.waitForTimeout(250);
      const st = (await statusText()).trim(), shared = await page.evaluate(() => window.__shared);
      say(`§M1_SYNC_SEND status="${st}" share_sheet=${shared ? 'INVOKED' : 'none'} folder_files=${walkDir(FOLDER, '', []).filter(n => /\/drop-/.test(n)).length}`);
      await shot('s_send', 60);
      if (shared) throw new Error('a share sheet was invoked: ' + JSON.stringify(shared));
      if (!/Sent to your team folder/.test(st)) throw new Error('status line is "' + st + '"');
    });

    // 3 — HQ: key I opens the Issue Log, the real Get from team button merges the phone's report
    use(H);
    await beat('s_get', /^§HQ_GET drops=1 new=1 issues_added=1 .*refused=0$/, async () => {
      await page.keyboard.press('i'); await page.waitForTimeout(600);
      for (let w = 0; w < 40 && !(await page.evaluate(() => { const b = document.getElementById('issues-get-team'); return !!(b && b.offsetWidth); })); w++) await page.waitForTimeout(250);
      await shot('s_get', 30);
      await touchAt('s_get', '#issues-get-team', 0, 600);
      for (let w = 0; w < 60 && !cons.some(t => /^§HQ_GET drops=/.test(t)); w++) await page.waitForTimeout(250);
      await page.waitForTimeout(600);
      const hq = await rowsOf(page), cards = await page.evaluate(() => Array.from(document.querySelectorAll('#issues-list .issue-card:not(.issue-walk-row)')).map(e => e.textContent.trim().replace(/\s+/g, ' ')));
      const mine = hq.filter(r => r.src_kid === dP.kid);
      const cardOk = cards.some(c => c.endsWith('from ' + codeP));
      const eq = mine.length === phoneRows.length && mine.length > 0 && mine.every(r => { const p = phoneRows.find(x => x.id === r.src_id); return p && p.b64 === r.b64 && r.b64.length > 0; });
      const line = `§M1_SYNC issue_from=${cardOk ? codeP : 'MISSING'} photo_equal=${eq} rows=${hq.length}`;
      say(line); if (cardOk && eq) cons.push(line);
      await shot('s_get', 90);
      if (!cardOk || !eq) throw new Error('card_from=' + cardOk + ' photo_equal=' + eq + ' cards=' + JSON.stringify(cards));
    });

    // 4 — HQ: tap the phone's walk row → its points enter the history bar
    await beat('s_replay', /^§HQ_REPLAY kid=\S+ points=\d+/, async () => {
      const sel = '.issue-walk-row[data-kid="' + dP.kid + '"]';
      await touchAt('s_replay', sel, 0, 700);
      for (let w = 0; w < 40 && !cons.some(t => /^§HQ_REPLAY /.test(t)); w++) await page.waitForTimeout(250);
      const rp = cons.filter(t => /^§HQ_REPLAY /.test(t)).pop() || '', pts = +(rp.match(/points=(\d+)/) || [])[1];
      const barJs = code => { const b = document.getElementById('universal-hist-btns'), r = b && b.getBoundingClientRect();
        return { bar_visible: !!(b && b.offsetWidth && getComputedStyle(b).display !== 'none'), marks: document.querySelectorAll('#hist-marks > *').length,
          walk_entries: UniversalHistory.list().filter(e => String(e.label).indexOf(code + ' · ') === 0).length }; };
      const bar0 = await page.evaluate(barJs, codeP);
      // PRODUCT GAP (logged, not patched): replayTeamWalk() does not open the history bar, so the walk sits in a CLOSED bar. A user opens it with the viewer's own
      // shortcut Z (scene.js:2664 UniversalHistory.toggleOpen) — a real key press, filmed.
      await shot('s_replay', 30); await page.keyboard.press('z'); await page.waitForTimeout(700);
      const bar = await page.evaluate(barJs, codeP);
      say(`§M1_SYNC_REPLAY points=${pts} phone_trace_lines=${nTrace} history_walk_entries=${bar.walk_entries} bar_visible_after_replay=${bar0.bar_visible} bar_visible_after_key_Z=${bar.bar_visible} marks=${bar.marks}`);
      await shot('s_replay', 60);
      if (!bar.bar_visible || bar.marks < pts) throw new Error('history bar not visible after Z: ' + JSON.stringify(bar));
      if (pts !== nTrace || bar.walk_entries !== pts) throw new Error('points=' + pts + ' trace=' + nTrace + ' history=' + bar.walk_entries);
    });

    // 5 — HQ: scrub every replayed point (UniversalHistory.jumpTo — role A's scrub precedent), compare HQ's camera with the phone's recorded one
    await beat('s_scrub', /^§M1_SYNC_SCRUB points=\d+ max_err_m=[\d.]+/, async () => {
      const W = await page.evaluate(kid => new Promise(res => { const r = indexedDB.open('comm_phone', 1); r.onsuccess = () => { const q = r.result.transaction('kv').objectStore('kv').get('viewer_walks'); q.onsuccess = () => res((q.result || {})[kid]); }; }), dP.kid);
      const L = await page.evaluate(code => UniversalHistory.list().filter(e => String(e.label).indexOf(code + ' · ') === 0).map(e => ({ i: e.i, label: e.label })), codeP);
      if (!W || !L.length || L.length !== W.walk.length) throw new Error('walk=' + (W && W.walk.length) + ' history=' + L.length);
      const errs = [], errsNow = [], red = []; const SHIFT = 0.05;
      for (let k = 0; k < L.length; k++) {
        const want = W.walk[k].viewState.cam.p;
        await page.evaluate(i => UniversalHistory.jumpTo(i), L[k].i);
        const now = await page.evaluate(() => { const p = APP.camera.position; return [p.x, p.y, p.z]; });
        await page.waitForTimeout(150); await shot('s_scrub', 5);
        await page.waitForTimeout(250); await shot('s_scrub', 5);
        await page.waitForTimeout(400); await shot('s_scrub', 14);
        const got = await page.evaluate(() => { const p = APP.camera.position; return [p.x, p.y, p.z]; });
        errs.push(Math.hypot(got[0] - want[0], got[1] - want[1], got[2] - want[2])); errsNow.push(Math.hypot(now[0] - want[0], now[1] - want[1], now[2] - want[2]));
        red.push(Math.hypot(got[0] - (want[0] + SHIFT), got[1] - want[1], got[2] - want[2]));   // RED control: the same camera against a position 5 cm off
      }
      const mx = Math.max.apply(null, errs), mxNow = Math.max.apply(null, errsNow), mxRed = Math.max.apply(null, red), minRed = Math.min.apply(null, red);
      const redFails = red.filter(e => e > 0.01).length;   // the ≤ 0.01 check must FAIL on every shifted comparison
      say(`§M1_SYNC_SCRUB_DETAIL per_point_err_m=${errs.map(e => e.toFixed(4)).join(',')} immediately_after_jump_max_err_m=${mxNow.toFixed(4)} labels=${L.map(e => JSON.stringify(e.label)).join(',')}`);
      say(`§M1_SYNC_SCRUB_RED shifted_by_m=${SHIFT} check_le_0.01_failed_on=${redFails}/${red.length} min_err_m=${minRed.toFixed(4)} max_err_m=${mxRed.toFixed(4)} ${redFails === red.length ? 'RED_AS_REQUIRED' : 'RED_CONTROL_DID_NOT_FAIL'}`);
      const line = `§M1_SYNC_SCRUB points=${L.length} max_err_m=${mx.toFixed(4)}`;
      say(line + (mx <= 0.01 ? ' ok' : ' FAIL')); if (mx <= 0.01 && redFails === red.length) cons.push(line);
      await shot('s_scrub', 45);
    });
    await pctx.close(); await hctx.close();
    for (const k in screens) { const X = screens[k];
      fs.writeFileSync(path.join(X.dir, 'manifest.json'), JSON.stringify({ role: 'S', screen: X.name, viewport: X.viewport, clock: 'ms since recording start (T0), one clock for both screens', frames: X.frames, beats: X.beats }, null, 1));
      say(`§M1_SCREEN screen=${X.name} frames=${X.frames.length} film_frames=${X.frames.reduce((a, f) => a + f.hold, 0)} t_first=${X.frames[0].t} t_last=${X.frames[X.frames.length - 1].t}`); }
    frames = P.frames.concat(H.frames); beats = P.beats.concat(H.beats);
  }
  await browser.close(); server.close();
  if (ROLE !== 'S') fs.writeFileSync(path.join(OUT, 'manifest.json'), JSON.stringify({ role: ROLE, frames, beats }, null, 1));
  const bad = beats.filter(b => !b.ok).map(b => b.id);
  say(`§M1_RECORD role=${ROLE} frames=${frames.length} film_frames=${frames.reduce((a, f) => a + f.hold, 0)} beats=${beats.length} not_ok=${bad.length}${bad.length ? ' [' + bad.join(',') + ']' : ''}`);
  fs.writeFileSync(path.join(OUT, 'record.log'), LOG.join('\n') + '\n');
})().catch(e => { say('§M1_FATAL ' + e.stack); fs.writeFileSync(path.join(OUT, 'record.log'), LOG.join('\n') + '\n'); process.exit(1); });
