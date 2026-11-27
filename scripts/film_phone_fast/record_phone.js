// ⚠ DO NOT REMOVE — Scope: FILM-M1 "the phone, fast" — record ONE part (phone A / phone B / desktop HQ) from the REAL viewer.
// Spec: bim-compiler prompts/MOBILE_PERF.md §FILM-M1 RECORDING SPEC (R1–R3). READ <outDir>/record.log after every run.
// Issue this proves: every beat the film shows really happened in the shipped viewer — each beat prints
//   §M1_BEAT id=… ok=true|false evidence="<the viewer's own § line>"; a beat without its evidence line is ok=false and the
//   compositor drops it (never faked). Recording starts after the viewer is ready, so no loading frame is ever captured.
// Run:  node record_phone.js <outDir> A            (Duplex, phone 456×933: panels, Walk + auto X-Ray, snag, share link, scrub)
//       node record_phone.js <outDir> B            (Hospital, phone 456×933: pick an element, snag)
//       node record_phone.js <outDir> HQ <url-file> (desktop 1920×1080 opens phone A's shared link)
// CPU only, headless. Serves ~/bim-ootb (origin/main) on a local port exactly like witness_field_ops.js.
'use strict';
const os = require('os'), fs = require('fs'), path = require('path'), http = require('http');
const { chromium } = require(os.homedir() + '/bim-ootb/tests/node_modules/playwright');
const ROOT = process.env.BIM_OOTB || path.join(os.homedir(), 'bim-ootb');
const [OUT_, ROLE, URLFILE] = process.argv.slice(2); const OUT = path.resolve(OUT_ || 'out');
fs.mkdirSync(path.join(OUT, 'f'), { recursive: true });
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.sql': 'text/plain', '.db': 'application/octet-stream',
  '.png': 'image/png', '.css': 'text/css', '.wasm': 'application/wasm', '.svg': 'image/svg+xml', '.webmanifest': 'application/json' };
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]); if (p === '/') p = '/viewer/viewer.html';
  fs.readFile(path.join(ROOT, p), (e, buf) => { if (e) { res.writeHead(404); res.end('404'); return; }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' }); res.end(buf); });
});
const UA = 'Mozilla/5.0 (Linux; Android 11; moto g power (2022)) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Mobile Safari/537.36';
const PHONE = { viewport: { width: 456, height: 933 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true, userAgent: UA,
  permissions: ['geolocation', 'camera'] };
const DESK = { viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 };
// B: the Hospital needs a GPU to draw its X-Ray interior in time (CPU run stalled > 4 min on one frame, 2026-11-27); a GPU run needs the owner's OK
const BLD = { A: 'buildings/Duplex_extracted.db', B: process.env.M1_B_DB || 'buildings/HHS_Office_Federated_extracted.db' };

const LOG = []; const say = s => { LOG.push(s); console.log(s); };
const frames = []; let page, cons = [], nShot = 0;
const pad = n => String(n).padStart(4, '0');
// one captured frame; hold = how many film frames (30 fps) it stays; tap = finger mark the compositor draws (not in the UI)
async function shot(beat, hold, tap) { const f = 'f/' + pad(nShot++) + '.png'; await page.screenshot({ path: path.join(OUT, f) });
  frames.push({ f, hold: hold || 1, beat, tap: tap || null }); }
const beats = [];
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
async function ready(ctx, url) {
  page = await ctx.newPage(); cons = []; page.setDefaultTimeout(240000);   // software GL: a Hospital X-Ray frame can take > 30 s
  page.on('console', m => { const t = m.text(); cons.push(t); if (/§(SHEET_(CLOSE|REPLACE|SWALLOW)|WALK_XRAY|ISSUE_|PICK hits|SNAP |CAMERA|RENDERER_CAPS)/.test(t)) LOG.push('  [console] ' + t.slice(0, 160)); });
  page.on('pageerror', e => say('  [pageerror] ' + String(e.message).slice(0, 200)));
  const t0 = Date.now(); await page.goto(url, { waitUntil: 'domcontentloaded' });
  for (let i = 0; i < 240; i++) { await page.waitForTimeout(1000);
    if (await page.evaluate(() => !!(window.APP && APP.guidMap && Object.keys(APP.guidMap).length && APP.streaming === false && window._mainPillActions)).catch(() => false)) {
      await page.waitForTimeout(2500); say(`§M1_READY role=${ROLE} url=${url.replace(/^http:\/\/127\.0\.0\.1:\d+/, '')} wait_s=${((Date.now() - t0) / 1000).toFixed(1)} (not filmed)`); return true; } }
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
  }
  await browser.close(); server.close();
  fs.writeFileSync(path.join(OUT, 'manifest.json'), JSON.stringify({ role: ROLE, frames, beats }, null, 1));
  const bad = beats.filter(b => !b.ok).map(b => b.id);
  say(`§M1_RECORD role=${ROLE} frames=${frames.length} film_frames=${frames.reduce((a, f) => a + f.hold, 0)} beats=${beats.length} not_ok=${bad.length}${bad.length ? ' [' + bad.join(',') + ']' : ''}`);
  fs.writeFileSync(path.join(OUT, 'record.log'), LOG.join('\n') + '\n');
})().catch(e => { say('§M1_FATAL ' + e.stack); fs.writeFileSync(path.join(OUT, 'record.log'), LOG.join('\n') + '\n'); process.exit(1); });
