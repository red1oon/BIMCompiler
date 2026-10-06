// ERP POC clip recorder (FILM_NARRATION §11.v5 ERP BEAT, POC per user steer 2026-10-06: 1–2 disciplines).
// Find (Discipline) → LIGHTING (+DRAINAGE) → › ERP → open Project window 130 → outline the lines grid → red pill → viewer highlights.
// Writes video(s) + erp_clip.log with § marks (t = ms since page creation = video time). Read the log, not the exit code.
'use strict';
const { chromium } = require(require('os').homedir() + '/bim-ootb/tests/node_modules/playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = process.env.ROOT || '/tmp/wt-erp-clip';
const OUT = process.env.OUT || path.join(__dirname, 'erp_clip_out');
const DB = 'buildings/CivilWorksPath.db', BLD = 'CivilWorksPath';
const DISCS = (process.env.DISCS || 'LIGHTING,DRAINAGE').split(',');
const MIME = { '.html':'text/html', '.js':'text/javascript', '.json':'application/json', '.db':'application/octet-stream',
  '.png':'image/png', '.css':'text/css', '.wasm':'application/wasm', '.svg':'image/svg+xml', '.mp3':'audio/mpeg', '.ogg':'audio/ogg' };
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]); if (p === '/') p = '/viewer/viewer.html';
  fs.readFile(path.join(ROOT, p), (e, buf) => {
    if (e) { res.writeHead(404); res.end('404'); return; }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' }); res.end(buf);
  });
});
fs.mkdirSync(OUT, { recursive: true });
const log = []; let T0 = 0;
const S = m => { const l = '+' + ((Date.now() - T0) / 1000).toFixed(2) + 's ' + m; log.push(l); console.log(l); };
const seen = re => log.some(l => re.test(l));
const save = () => fs.writeFileSync(path.join(OUT, 'erp_clip.log'), log.join('\n'));
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function outline(page, sel, label) {
  return page.evaluate(([sel, label]) => {
    const e = typeof sel === 'string' ? document.querySelector(sel) : null; if (!e) return null;
    const r = e.getBoundingClientRect(); const d = document.createElement('div'); d.id = 'clip-outline';
    d.style.cssText = `position:fixed;left:${r.left - 6}px;top:${r.top - 6}px;width:${r.width + 12}px;height:${r.height + 12}px;` +
      'border:4px solid #e53935;border-radius:10px;box-shadow:0 0 0 9999px rgba(0,0,0,.28);z-index:99999;pointer-events:none';
    if (label) { const t = document.createElement('div'); t.textContent = label;
      t.style.cssText = 'position:absolute;left:0;top:-34px;background:#e53935;color:#fff;font:600 16px system-ui;padding:4px 10px;border-radius:6px'; d.appendChild(t); }
    document.body.appendChild(d); return { x: r.left, y: r.top, w: r.width, h: r.height };
  }, [sel, label]);
}
let ctx, hook;

// Visible pointer for the clip (headless video draws no OS cursor): a DOM arrow that glides to a target and shows a click ring.
async function cursorTo(page, sel, ms) {
  return page.evaluate(([sel, ms]) => {
    let c = document.getElementById('clip-cursor');
    if (!c) { c = document.createElement('div'); c.id = 'clip-cursor';
      c.innerHTML = '<svg width="28" height="28" viewBox="0 0 24 24"><path d="M3 2l7 19 2.5-7.5L20 11z" fill="#fff" stroke="#000" stroke-width="1.5"/></svg>';
      c.style.cssText = 'position:fixed;left:640px;top:400px;z-index:2147483647;pointer-events:none;transition:left ' + ms + 'ms ease,top ' + ms + 'ms ease';
      document.body.appendChild(c); }
    c.style.transition = 'left ' + ms + 'ms ease,top ' + ms + 'ms ease';
    const e = typeof sel === 'string' ? document.querySelector(sel) : null; if (!e) return null;
    const r = e.getBoundingClientRect(); c.style.left = (r.left + Math.min(40, r.width / 2)) + 'px'; c.style.top = (r.top + r.height / 2) + 'px';
    return { x: r.left, y: r.top, w: r.width, h: r.height };
  }, [sel, ms || 700]);
}
async function cursorRing(page) {
  await page.evaluate(() => { const c = document.getElementById('clip-cursor'); if (!c) return; const g = document.createElement('div');
    g.style.cssText = 'position:fixed;left:' + (parseFloat(c.style.left) - 14) + 'px;top:' + (parseFloat(c.style.top) - 14) + 'px;width:28px;height:28px;border:3px solid #ffeb3b;border-radius:50%;z-index:2147483646;pointer-events:none;transition:transform .5s,opacity .5s';
    document.body.appendChild(g); requestAnimationFrame(() => { g.style.transform = 'scale(2.2)'; g.style.opacity = '0'; }); setTimeout(() => g.remove(), 700); });
}
async function closeTM(page, S) {
  const r = await page.evaluate(() => { const p = document.getElementById('time-machine-panel');
    const on = !!(p && p.style.display !== 'none' && p.getBoundingClientRect().width > 0);
    if (on && typeof window.toggleTimeMachine === 'function') window.toggleTimeMachine(); return on; });
  S('§CLIP_TM_CLOSE wasOpen=' + r);
}
async function erpPart(page, href2) {
  S('§CLIP_MARK erp_open');
  await page.goto(href2, { waitUntil: 'domcontentloaded', timeout: 120000 }); hook(page, 'erp');
  for (let i = 0; i < 36; i++) {
    const st = await page.evaluate(() => ({ t: document.querySelectorAll('table').length, txt: (document.body.innerText || '').replace(/\s+/g, ' ').slice(0, 300) }));
    if (i % 6 === 0 || st.t) S('§CLIP_ERP_WAIT i=' + i + ' tables=' + st.t + ' text="' + st.txt + '"');
    if (st.t) break;
    const si = await page.evaluate(() => {
      const vis = e => e && e.getBoundingClientRect().width > 0;
      const u = Array.from(document.querySelectorAll('.idmp-login-user')).filter(vis).find(r => /GardenAdmin/.test(r.textContent));
      const okb = document.getElementById('idmp-login-ok');
      const s2 = document.getElementById('idmp-login-step2');
      if (s2 && s2.style.display !== 'none' && vis(okb)) { okb.click(); return 'login-ok'; }
      if (u) { u.click(); return 'user GardenAdmin'; }
      const gw = Array.from(document.querySelectorAll('.idmp-login-user')).filter(vis).find(r => /GardenWorld/i.test(r.textContent));
      if (gw) { gw.click(); return 'tenant GardenWorld'; }
      return null; });
    if (si) S('§CLIP_SIGNIN ' + si);
    await sleep(si ? 2500 : 5000);
  }
  await sleep(3000);
  // Describe the ERP DOM once (tabs + grids) so the outline target is read, not guessed.
  const dom = await page.evaluate(() => {
    const vis = e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
    const tabs = Array.from(document.querySelectorAll('[role=tab], .idmp-tab, .tab, [class*="tab"]')).filter(vis)
      .map(e => (e.className + '|' + (e.textContent || '').trim().slice(0, 30))).slice(0, 25);
    const grids = Array.from(document.querySelectorAll('table')).filter(vis).map((t, i) => ({ i, id: t.id, cls: t.className, rows: t.rows.length,
      head: (t.rows[0] && t.rows[0].textContent || '').trim().slice(0, 120) }));
    return { title: document.title, tabs, grids };
  });
  S('§CLIP_ERP_DOM ' + JSON.stringify(dom));
  const tabTo = async (name) => { const r = await page.evaluate((name) => { const t = Array.from(document.querySelectorAll('.idmp-adtab')).find(e => (e.textContent || '').trim() === name);
    if (!t) return null; t.click(); return name; }, name); S('§CLIP_TAB ' + name + ' -> ' + r); await sleep(2500); return r; };
  await tabTo('Phase'); await tabTo('Task'); const lineTab = await tabTo('Task Line');
  S('§CLIP_LINES_TAB ' + lineTab);
  await sleep(3000);
  const grid = await page.evaluate(() => {
    const t = Array.from(document.querySelectorAll('table')).filter(t => t.getBoundingClientRect().height > 0)
      .sort((a, b) => b.rows.length - a.rows.length)[0];
    if (!t) return null; if (!t.id) t.id = 'clip-grid';
    return { id: t.id, rows: Array.from(t.rows).slice(0, 8).map(r => r.textContent.replace(/\s+/g, ' ').trim().slice(0, 160)) };
  });
  S('§CLIP_GRID ' + JSON.stringify(grid));
  S('§CLIP_MARK lines_outline');
  if (grid) await outline(page, '#' + grid.id, 'Project lines — one per discipline');
  await sleep(5000);
  await page.evaluate(() => { const o = document.getElementById('clip-outline'); if (o) o.remove(); });
  // Red pill from the header record (carries the pushed GUID set).
  const hdr = await tabTo('Project');
  S('§CLIP_HEADER_TAB ' + hdr); await sleep(2000);
  // RED PILL = the rail icon #pill-zoomacross (erp/pills_idmp.json id 'zoomacross'), pressed by pointerup exactly as
  // erp/tests/poc_zoom_across.js does — NOT the toolbar magnifier and NOT a direct IdmpPillActions call (user 2026-10-07).
  // the rail starts folded behind ⋯ (#idmp-pill-trigger, §PILL-CUE collapsed=true) — open it the way a user does
  await cursorTo(page, '#idmp-pill-trigger', 800); await sleep(900); await cursorRing(page);
  await page.evaluate(() => { const d = document.getElementById('idmp-pill'), t = document.getElementById('idmp-pill-trigger');   // as erp/tests/poc_dashboard.js clickPill
    if (d && t && getComputedStyle(d).display === 'none') t.dispatchEvent(new PointerEvent('pointerup', { bubbles: true })); }); await sleep(1500);
  await cursorTo(page, '#pill-zoomacross', 700); await sleep(900); await cursorRing(page);
  const pillSel = await page.evaluate(() => { const b = document.getElementById('pill-zoomacross');
    return b && b.getBoundingClientRect().width > 0 ? (b.getAttribute('title') || 'pill-zoomacross') : null; });
  S('§CLIP_PILL ' + pillSel);
  if (pillSel) await outline(page, '#pill-zoomacross', 'Red pill');
  await sleep(1500);
  S('§CLIP_MARK redpill');
  const popupP = ctx.waitForEvent('page', { timeout: 30000 }).catch(() => null);
  await page.evaluate(() => { const o = document.getElementById('clip-outline'); if (o) o.remove();
    const b = document.getElementById('pill-zoomacross'); if (b) b.dispatchEvent(new PointerEvent('pointerup', { bubbles: true })); });
  const pop = await popupP;
  S('§CLIP_POPUP ' + (pop ? pop.url().slice(0, 200) : 'none'));
  log.filter(l => /§ZOOM-ACROSS/.test(l)).forEach(l => S('§CLIP_ZOOMLOG ' + l.trim()));
  if (pop) {
    hook(pop, 'back');
    let ok = false;
    for (let i = 0; i < 400 && !ok; i++) { await sleep(1000); ok = seen(/\[back\].*§MERGE_CONTRACT .*verdict=COMPLETE/); }
    S('§CLIP_BACK_LOAD ' + (ok ? 'COMPLETE' : 'NOT COMPLETE'));
    await closeTM(pop, S); await sleep(1500);
    // closing the Time Machine restores visibility and drops the red pill's x-ray highlight — re-apply the SAME scope the pill handed
    // over (main.js §ZOOM-SCOPE: find=@token → localStorage zoomfind_<token>), so the Find panel shows "Zoom Across · N items" lit.
    const re = await pop.evaluate(() => { const m = /[?&]find=@([^&]+)/.exec(location.search); const sc = m && localStorage.getItem('zoomfind_' + m[1]);
      if (sc && window.APP.applyFindScope) { window.APP.applyFindScope(sc); return sc.split(',').length; } return 0; });
    S('§CLIP_BACK_RESCOPE guids=' + re); await sleep(4000);
    for (let i = 0; i < 60 && !seen(/\[back\].*§ZOOM-SCOPE|\[back\].*§FIND|\[back\].*§NF_/); i++) await sleep(1000);
    await sleep(6000);
    S('§CLIP_MARK highlighted');
    log.filter(l => /\[back\].*(§ZOOM|§FIND_SCOPE|§NF_SCOPE|highlight)/i.test(l)).slice(0, 12).forEach(l => S('§CLIP_BACKLOG ' + l.trim()));
    await sleep(4000);
    S('§CLIP_BACK_VIDEO ' + (await pop.video().path()));
  }
}
(async () => {
  await new Promise(r => server.listen(8433, '127.0.0.1', r));
  const port = server.address().port;
  // REAL GPU (the bakes' selector): on swiftshader the busy page stopped producing frames for minutes, so the pointer clicks never
  // reached the video (v9 run 2026-10-07). The sections clip on the real GPU recorded smoothly.
  ctx = await chromium.launchPersistentContext(path.join(__dirname, 'erp_clip_profile'), { args: ['--use-angle=gl-egl', '--ignore-gpu-blocklist'],
    env: Object.assign({}, process.env, { __EGL_VENDOR_LIBRARY_FILENAMES: '/usr/share/glvnd/egl_vendor.d/10_nvidia.json' }),
    viewport: { width: 1280, height: 720 }, recordVideo: { dir: OUT, size: { width: 1280, height: 720 } } });
  const browser = { close: () => Promise.resolve() };
  hook = (pg, tag) => { pg.on('console', m => { const t = m.text(); if (/§/.test(t)) log.push('  [' + tag + '] ' + t.slice(0, 400)); });
    pg.on('pageerror', e => log.push('  [' + tag + ' pageerror] ' + e)); };
  const page = await ctx.newPage(); T0 = Date.now(); hook(page, 'viewer');
  S('§CLIP_START db=' + DB + ' discs=' + DISCS.join('+'));
  if (process.env.ERP_ONLY) { S('§CLIP_ERP_ONLY record=' + process.env.ERP_ONLY); await erpPart(page, `http://127.0.0.1:${port}/erp/idempiere.html?client=garden&window=130&record=${process.env.ERP_ONLY}`); S('§CLIP_MAIN_VIDEO ' + (await page.video().path())); save(); await ctx.close(); server.close(); return; }
  await page.goto(`http://127.0.0.1:${port}/viewer/viewer.html?db=${DB}&bld=${BLD}`, { waitUntil: 'domcontentloaded', timeout: 120000 });
  let done = false;
  for (let i = 0; i < 400 && !done; i++) { await sleep(1000); done = seen(/§MERGE_CONTRACT .*verdict=COMPLETE/); }
  S('§CLIP_LOAD ' + (done ? 'COMPLETE' : 'NOT COMPLETE')); if (!done) { save(); await ctx.close(); await browser.close(); server.close(); process.exit(2); }
  await sleep(3000);
  await closeTM(page, S); await sleep(1500);
  await page.evaluate(() => window.APP.openFindPanel());
  for (let i = 0; i < 120 && !(await page.evaluate(() => !!document.getElementById('find-axis-toggle') && !!document.getElementById('find-erp-btn'))); i++) await sleep(1000);
  await sleep(1200);
  for (let k = 0; k < 6; k++) {
    if (await page.evaluate(() => { const b = document.getElementById('find-axis-toggle'); return b && b.getAttribute('data-axis'); }) === 'disc') break;
    await page.evaluate(() => document.getElementById('find-axis-toggle').dispatchEvent(new PointerEvent('pointerup', { bubbles: true })));
    await sleep(800);
  }
  S('§CLIP_MARK find_open');
  const tap = (v, ctrl) => page.evaluate(([v, ctrl]) => { const r = document.querySelector('[data-find-parent="' + v + '"]'); if (!r) return false;
    r.children[1].dispatchEvent(new PointerEvent('pointerup', { bubbles: true, ctrlKey: ctrl })); return true; }, [v, ctrl]);
  for (let i = 0; i < DISCS.length; i++) {
    await cursorTo(page, '[data-find-parent="' + DISCS[i] + '"]', 900); await sleep(1100); await cursorRing(page);
    S('§CLIP_TAP ' + DISCS[i] + ' ok=' + await tap(DISCS[i], i > 0)); await sleep(1500); }
  await sleep(1500);
  S('§CLIP_SELECTED "' + await page.evaluate(() => (document.getElementById('find-selected-text') || {}).textContent) + '" cost="' +
    await page.evaluate(() => (document.getElementById('find-selected-cost') || {}).textContent) + '"');
  for (let i = 0; i < 60 && !seen(/§FIND_COST scope="DISC_SELECT/); i++) await sleep(1000);
  await sleep(1500);
  S('§CLIP_SEL_READY ' + (log.filter(l => /§FIND_COST scope="DISC_SELECT/.test(l)).slice(-1)[0] || 'none').trim());
  await cursorTo(page, '#find-erp-btn', 800); await sleep(1000); await cursorRing(page);
  S('§CLIP_MARK push');
  await page.evaluate(() => document.getElementById('find-erp-btn').click());
  for (let i = 0; i < 300 && !seen(/§PROJ_PUSH_LINK|§PROJ_PUSH_DEFER|§PROJ_PUSH_DBERR|§PROJ_PUSH_ERR/); i++) await sleep(1000);
  log.filter(l => /§PROJ_PUSH|§ZOOM_LINKBACK/.test(l)).forEach(l => S('§CLIP_PUSHLOG ' + l.trim()));
  const href = await page.evaluate(() => { const a = document.getElementById('find-erp-open'); return a && getComputedStyle(a).display !== 'none' ? a.href : null; });
  S('§CLIP_OPEN_HREF ' + href);
  if (href) { await outline(page, '#find-erp-open', 'Pushed to ERP'); await sleep(1200);
    await cursorTo(page, '#find-erp-open', 700); await sleep(900); await cursorRing(page); await sleep(500); }
  if (!href) { save(); await ctx.close(); await browser.close(); server.close(); process.exit(1); }
  await erpPart(page, href);
  S('§CLIP_MAIN_VIDEO ' + (await page.video().path()));
  save(); await ctx.close(); server.close(); save();
})().catch(e => { S('§CLIP_FATAL ' + (e && e.stack || e)); save(); process.exit(1); });
