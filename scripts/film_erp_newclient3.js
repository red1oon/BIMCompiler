// ⚠ DO NOT REMOVE — Scope guard
// Scope: §ERP-DEPTH-FILM cycle 2 "New Client in Depth" CHAPTER 3 (red1 2026-10-14 "go ahead with the new edition", Thai too): the Home dashboard, the two read-only lens pills and the optional Quick setup - all OVERLAY features (ERP_DEPTH_FILM.md §EXTENSION-LAYER LAW).
//   ONLY_LANG=th_TH -> Thai narration; Thai UI through login + the Home, English from the first panel (rule 2026-10-13). Wording is QUALIFIED to what the repo proves: only Performance + Activities are real gadgets, the rest are named placeholders; the lenses are read-only; Quick setup is optional and the core handler runs unchanged.
// (the header below is the chapter-1 recorder, reused)
//   ONE take, CPU only. Every number spoken is a §ERP_FILM_FACT read from the live in-browser DB / dialog. Selectors proven by erp/tests/poc_nc1_calendar_ui_live.js,
//   poc_nc2_period_control_ui_live.js and poc_nc2b_finreport_ui_live.js (W-NC1-UI 13/13, W-NC2-UI 9/9, W-NC2B-UI 6/6); legacy numbers: prompts/ERP_DEPTH_FILM.md §NC-1/§NC-2.
// §-log first — READ <out>/erp_film.log (beats + facts) and <out>/erp_film.page.log before any conclusion. Exit code is not evidence.
// Run:  [ERP_REPO=<worktree>] [ONLY_LANG=th_TH] [BEAT_MIN='{"n1":9.1,…}'] node scripts/film_erp_newclient.js <outDir>   → <outDir>/erp_film_nc.mp4 (24 fps, 1920×1080)
'use strict';
const { chromium } = require(require('os').homedir() + '/bim-ootb/tests/node_modules/playwright');
const http = require('http'), fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');

const REPO = process.env.ERP_REPO || path.join(require('os').homedir(), 'bim-ootb');   // ERP_REPO = a worktree, to film a fix before it merges
const OUT = path.resolve(process.argv[2] || '.'); const FR = path.join(OUT, 'frames'); fs.mkdirSync(FR, { recursive: true });
const ONLY = process.env.ONLY_LANG || '';   // ONLY_LANG=th_TH: Thai narration + Thai UI through login and the first panel; UI → English when the first panel (Sales Order window) is on screen
let curLang = ONLY || 'en_US';
const LOG = [], PAGELOG = [];
const say = (s) => { LOG.push(s); console.log(s); };
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.db': 'application/octet-stream',
  '.png': 'image/png', '.css': 'text/css', '.wasm': 'application/wasm', '.zip': 'application/zip', '.svg': 'image/svg+xml', '.mjs': 'text/javascript', '.jpg': 'image/jpeg', '.sql': 'text/plain', '.glb': 'model/gltf-binary', '.ktx2': 'image/ktx2', '.hdr': 'application/octet-stream', '.webp': 'image/webp' };
const server = http.createServer((req, res) => {   // streams (the Viewer's Hospital db is 265 MB)
  const p = decodeURIComponent(req.url.split('?')[0]); const fp = path.join(REPO, p);
  fs.stat(fp, (e, st) => {
    if (e || st.isDirectory()) { res.writeHead(404); res.end('404 ' + p); return; }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream', 'Content-Length': st.size }); fs.createReadStream(fp).pipe(res);
  });
});

// visible cursor + click ripple (headless has no pointer of its own)
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



(async () => {
  await new Promise(r => server.listen(0, r));
  const base = 'http://localhost:' + server.address().port + '/erp';
  const browser = await chromium.launch({ args: ['--no-sandbox', '--disable-gpu'] });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 810 }, deviceScaleFactor: 4 / 3 });
  await ctx.addInitScript(CURSOR);
  let page = await ctx.newPage();
  const wire = (p, tag) => { p.on('console', m => PAGELOG.push((tag || '') + m.text())); p.on('pageerror', e => PAGELOG.push('PAGEERR ' + (tag || '') + e)); p.on('dialog', async d => { PAGELOG.push('DIALOG ' + d.message()); await d.accept(); }); };
  wire(page);
  const last = (n, re) => PAGELOG.slice(n).filter(l => re.test(l)).pop() || '';
  const one = async (sql) => { const r = await page.evaluate(s => { try { const r = window.__idmpDb.exec(s); return r.length ? r[0].values : []; } catch (e) { return 'ERR ' + e.message; } }, sql); return Array.isArray(r) && r.length ? r[0][0] : r; };
  const fact = (k, v) => say('§ERP_FILM_FACT ' + k + '=' + String(v).replace(/\s+/g, ' ').slice(0, 320));

  await page.goto(base + '/idempiere.html', { waitUntil: 'networkidle' });
  await page.evaluate(() => new Promise(r => { const q = indexedDB.deleteDatabase('erp_cache'); q.onsuccess = q.onerror = q.onblocked = () => r(); }));
  await page.evaluate(() => { try { localStorage.removeItem('erp.lang'); } catch (e) {} });
  await page.goto(base + '/idempiere.html?lang=' + (ONLY || 'en_US'), { waitUntil: 'networkidle' });
  await page.waitForFunction(() => !!window.__idmpDb && !!window.ErpI18n, null, { timeout: 30000 });
  await page.evaluate(() => window.ErpI18n.preload && window.ErpI18n.preload());
  await page.waitForFunction(() => document.querySelector('#idmp-login-clients') && document.querySelector('#idmp-login-clients').children.length > 0, null, { timeout: 20000 });
  fact('gpu', await page.evaluate(() => { const g = document.createElement('canvas').getContext('webgl2'); const d = g && g.getExtension('WEBGL_debug_renderer_info'); return d ? g.getParameter(d.UNMASKED_RENDERER_WEBGL) : 'none'; }));
  await page.waitForTimeout(1500);

  // ── screencast that can FOLLOW a new tab: frames from whichever page is being cast go to one list ──
  const frames = []; let T0 = null; let cdp = null;
  async function castOn(p) {
    if (cdp) { await cdp.send('Page.stopScreencast').catch(() => {}); }
    cdp = await ctx.newCDPSession(p);
    const me = cdp;
    me.on('Page.screencastFrame', async f => {
      if (me !== cdp) return;
      const fn = path.join(FR, String(frames.length).padStart(6, '0') + '.jpg');
      fs.writeFileSync(fn, Buffer.from(f.data, 'base64')); frames.push({ fn, ts: f.metadata.timestamp });
      if (T0 === null) T0 = f.metadata.timestamp;
      me.send('Page.screencastFrameAck', { sessionId: f.sessionId }).catch(() => {});
    });
    await me.send('Page.startScreencast', { format: 'jpeg', quality: 90, maxWidth: 1920, maxHeight: 1080, everyNthFrame: 1 });
  }
  const now = () => (T0 === null ? 0 : Date.now() / 1000 - T0);
  const MIN = JSON.parse(process.env.BEAT_MIN || '{}'); let prev = null;
  const beat = async (id, lang, note) => {
    if (prev && MIN[prev.id]) { const wait = MIN[prev.id] - (now() - prev.t); if (wait > 0) { say('§ERP_FILM_HOLD after=' + prev.id + ' extra=' + wait.toFixed(2)); await page.waitForTimeout(wait * 1000); } }
    prev = { id, t: now() }; say('§ERP_FILM_BEAT id=' + id + ' t=' + prev.t.toFixed(2) + ' lang=' + lang + ' ' + (note || ''));
  };
  const hold = (ms) => page.waitForTimeout(ms);
  async function glide(sel) {
    const loc = page.locator(sel).first(); await loc.scrollIntoViewIfNeeded().catch(() => {});
    const b = await loc.boundingBox(); if (!b) throw new Error('no box for ' + sel);
    await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 22 }); await hold(160);
  }
  let clicks = 0, cursorOk = 0;
  async function hclick(sel) {
    await glide(sel);
    const c = await page.evaluate(() => { const e = document.getElementById('__fc'); return e ? [parseFloat(e.style.left), parseFloat(e.style.top)] : null; });
    const b = await page.locator(sel).first().boundingBox();
    clicks++; if (c && b && Math.abs(c[0] - (b.x + b.width / 2)) < 2 && Math.abs(c[1] - (b.y + b.height / 2)) < 2) cursorOk++;
    await page.mouse.down(); await hold(60); await page.mouse.up(); await hold(280);
  }
  const NEWB = '#idmp-toolbar [data-tb="new"]';
  const TAB = (table) => '#idmp-tabstrip .idmp-adtab[title$="· ' + table + '"]';
  const NEXT = '#idmp-toolbar button:text-is("▶")';
  async function openMenuById(menuId) {
    const chain = await page.evaluate(id => {
      const leaf = document.querySelector('#idmp-tree .idmp-row.leaf[data-menu-id="' + id + '"]'); if (!leaf) return null;
      const out = []; let n = leaf.parentElement.parentElement;
      while (n && n.id !== 'idmp-tree') { if (n.classList.contains('idmp-node')) out.unshift(n.querySelector(':scope > .idmp-row').getAttribute('data-menu-id')); n = n.parentElement; }
      return out;
    }, menuId);
    if (!chain) throw new Error('menu id not in tree: ' + menuId);
    for (const id of chain) {
      const open = await page.evaluate(i => { const r = document.querySelector('#idmp-tree .idmp-row[data-menu-id="' + i + '"]'); return r && r.parentElement.classList.contains('open'); }, id);
      if (!open) await hclick('#idmp-tree .idmp-row[data-menu-id="' + id + '"]');
    }
    await hold(400);
    const leafSel = '#idmp-tree .idmp-row.leaf[data-menu-id="' + menuId + '"]';
    if (!(await page.locator(leafSel).first().isVisible().catch(() => false))) {   // a collapsed ancestor kept the leaf unrendered: open the whole chain by script (no 30 s wait for a box that will not come)
      fact('menuFallback', String(menuId) + ' leaf not visible → ancestors opened by script');
      await page.evaluate(id => { const leaf = document.querySelector('#idmp-tree .idmp-row.leaf[data-menu-id="' + id + '"]'); let n = leaf.parentElement; while (n && n.id !== 'idmp-tree') { if (n.classList && n.classList.contains('idmp-node')) n.classList.add('open'); n = n.parentElement; } leaf.scrollIntoView({ block: 'center' }); }, menuId);
      await hold(400);
    }
    await hclick(leafSel);
  }
  async function openWinById(winId) {
    const id = await page.evaluate(w => { const ids = window.__idmpDb.exec("SELECT AD_Menu_ID FROM AD_Menu WHERE Action='W' AND AD_Window_ID=" + w + " AND IsActive='Y'"); const all = ids.length ? ids[0].values.map(r => r[0]) : [];
      return all.find(i => document.querySelector('#idmp-tree .idmp-row.leaf[data-menu-id="' + i + '"]')) || null; }, winId);
    fact('menu.win' + winId, id); await openMenuById(id); await page.waitForSelector(NEWB, { timeout: 20000 }); await hold(700);
  }
  // walk to a record with ▶ (the record counter steps on screen), then the toolbar toggle → form
  async function gotoRecord(pk) {
    const ids = await page.$$eval('.idmp-grid tbody tr[data-ad-record]', e => e.map(x => x.getAttribute('data-ad-record')));
    const idx = ids.indexOf(String(pk)); fact('gotoRecord', pk + ' idx=' + idx + ' of ' + ids.length);
    if (idx < 0) throw new Error('record not in grid: ' + pk);
    await hclick('#idmp-toolbar [data-tb="toggle"]'); await page.waitForTimeout(700);
    for (let i = 0; i < idx; i++) { await hclick(NEXT); await page.waitForTimeout(350); }
    fact('recnav', await page.$eval('#idmp-recnav', e => e.textContent).catch(() => ''));
  }
  async function pill(id) {
    if (!(await page.locator('#pill-' + id).first().isVisible().catch(() => false))) { await hclick('#idmp-pill-trigger'); await page.waitForTimeout(450); }
    await hclick('#pill-' + id); await page.waitForTimeout(700);
  }
  async function setLang(code, where) {      // the in-app picker; waits for its §I18N line (ERP_UI_LOCALES.md)
    if (code === curLang) return; curLang = code;
    const sel = where === 'login' ? '#idmp-login-lang' : '#idmp-lang';
    const n0 = PAGELOG.length; await hclick(sel); await page.selectOption(sel, code);
    for (let i = 0; i < 40 && !last(n0, new RegExp('§I18N lang=' + code)); i++) await page.waitForTimeout(50);
    fact('i18n.' + code, last(n0, /§I18N lang=/) || 'NO §I18N LINE'); await hold(250);
  }
  const hselect = async (sel, val) => { await glide(sel); await page.selectOption(sel, val); await hold(500); };
  const htype = async (sel, text) => { await glide(sel); await page.click(sel); await page.fill(sel, ''); await page.type(sel, text, { delay: 90 }); await page.locator(sel).first().blur().catch(() => {}); await hold(350); };
  const opts = (col) => page.$$eval('#idmp-inline-mount select[data-col="' + col + '"] option', o => o.map(x => ({ v: x.value, t: x.text }))).catch(() => []);
  const F = (c, t) => '#idmp-inline-mount ' + (t || 'input') + '[data-col="' + c + '"]';
  const optBy = async (col, re) => { const o = (await opts(col)).find(x => x.v && re.test(x.t)); if (!o) throw new Error('no option ' + col + ' ' + re); return o; };
  const SAVEB = '#idmp-toolbar [title^="Save"]';
  const tip = (sql) => page.evaluate(s => window.__crud.withModelTrx(q => q(s)), sql);
  const PROD = 137, WH = 103;
  const status = () => page.$eval('#idmp-status', e => e.innerText).catch(() => '');
  async function infoProduct(label) {      // Info Product (toolbar Product button) → search Mulch in the HQ warehouse → read the row
    if (!(await page.$('#idmp-infowin'))) { await hclick('#idmp-toolbar [data-tb="productinfo"]'); await page.waitForSelector('#idmp-infowin'); await hold(500); }
    await htype('#idmp-infowin-crit input[data-col="Value"]', 'Mulch');
    await hselect('#idmp-infowin-crit select[data-col="M_Warehouse_ID"]', String(WH));
    await hclick('#idmp-infowin [data-act="refresh"]'); await hold(900);
    const cell = (c) => page.$eval('#idmp-infowin tbody tr[data-key="' + PROD + '"] td[data-col="' + c + '"]', e => e.getAttribute('data-v')).catch(() => null);
    const o = { oh: await cell('QtyOnHand'), av: await cell('QtyAvailable'), rs: await cell('QtyReserved') };
    fact('infoProduct.' + label, JSON.stringify(o)); await hold(1800); return o;
  }
  async function closeInfo() { await hclick('#idmp-infowin button[title="Close"]'); await hold(500); }
  async function toOrderForm(orderId) {       // back to the Sales Order window TAB (windows stay open as header tabs — state and record kept)
    await hclick('.idmp-wintab:has(.lbl:text-is("Sales Order"))'); await hold(900);
    if (/Grid/.test(await page.$eval('#idmp-toolbar [data-tb="toggle"]', e => e.innerText).catch(() => ''))) { await hclick('#idmp-toolbar [data-tb="toggle"]'); await hold(700); }
    await hclick('#idmp-toolbar button[title="Last record"]'); await hold(700);   // the order typed this session is the LAST row of the list
    fact('toOrderForm', 'recnav=' + (await page.$eval('#idmp-recnav', e => e.textContent).catch(() => '')) + ' status=' + (await status()));
  }
  async function postedPanel(tag) {
    n1 = PAGELOG.length; await hclick('.idmp-posted-btn.is-posted'); await hold(1800);
    const pv = await page.evaluate(() => ({ lines: [...document.querySelectorAll('#posted-overlay .posted-line')].map(x => x.innerText.replace(/\s+/g, ' ')),
      bal: (document.querySelector('#posted-overlay .posted-balance') || {}).innerText, cov: (document.querySelector('#posted-overlay .posted-cov-chip') || {}).innerText }));
    fact('posted.' + tag, JSON.stringify(pv)); fact('postedLog.' + tag, last(n1, /§POSTED-FACTS/)); await hold(2600);
    await hclick('.posted-ov-x'); await hold(400);
  }
  const KC = { zoom: '#idmp-toolbar [title^="Zoom Across"]' };
  let n1;

  try {
    await page.mouse.move(720, 600);
    const THAI = !!ONLY;
    const login = async (client, user) => {
      await hclick("#idmp-login-clients .idmp-login-user:has(.nm:text-is('" + client + "'))"); await page.waitForSelector('#idmp-login-step1:visible'); await hold(400);
      await hclick("#idmp-login-users .idmp-login-user:has(.nm:text-is('" + user + "'))"); await page.waitForSelector('#idmp-login-step2:visible'); await hold(400);
      await hclick('#idmp-login-ok');
      await page.waitForFunction(() => document.querySelector('#idmp-tree') && document.querySelector('#idmp-tree').children.length > 0, null, { timeout: 10000 }); await hold(500);
    };
    // Thai: the login card is on camera in Thai (rule 2026-10-13); English: log in off camera
    if (THAI) { await castOn(page); await page.mouse.move(720, 400); await beat('c0', ONLY, 'login card in ' + ONLY); await hold(2500); await login('GardenWorld', 'GardenAdmin'); }
    else { await login('GardenWorld', 'GardenAdmin'); await castOn(page); await page.mouse.move(720, 400); await hold(600); }

    // c1 the Home
    await beat('c1', ONLY || 'en', 'Home dashboard after login');
    await page.waitForSelector('#idmp-home .idmp-gadget', { timeout: 15000 }); await hold(900);
    const gad = await page.$$eval('#idmp-home .idmp-gadget', e => e.map(x => ({ id: x.getAttribute('data-gadget-id'), name: x.getAttribute('data-gadget-name'), kind: x.getAttribute('data-gadget-kind') })));
    fact('home.gadgets', gad.length + ' ' + JSON.stringify(gad.map(g => g.name)));
    fact('home.log', (PAGELOG.filter(l => /§DASH-HOME client=/.test(l)).pop() || 'NO §DASH-HOME LINE').replace(/^.*§DASH-HOME/, '§DASH-HOME'));
    for (let i = 0; i < gad.length; i++) { await glide('#idmp-home .idmp-gadget >> nth=' + i); await hold(420); }
    // c1b Performance
    await beat('c1b', ONLY || 'en', 'Performance gadget');
    const perf = await page.$$eval('#idmp-home .pi', e => e.map(x => ({ title: x.querySelector('.pt').textContent, tip: x.title, color: x.getAttribute('data-color') })));
    fact('home.performance', perf.length + ' ' + JSON.stringify(perf.map(p => p.title)));
    for (let i = 0; i < perf.length; i++) { await glide('#idmp-home .pi >> nth=' + i); await hold(900); }
    // c1c Activities
    await beat('c1c', ONLY || 'en', 'Activities gadget');
    const ds = await page.$$eval('#idmp-home .ds', e => e.map(x => ({ name: x.querySelector('.dl').textContent, n: x.getAttribute('data-ds-count') })));
    fact('home.activities', ds.length + ' ' + JSON.stringify(ds.map(d => d.name + '=' + d.n)));
    for (let i = 0; i < ds.length; i++) { await glide('#idmp-home .ds >> nth=' + i); await hold(700); }
    // c1d the honest placeholders
    await beat('c1d', ONLY || 'en', 'not-ported placeholders named');
    const np = await page.$$eval('#idmp-home .idmp-gadget', e => e.filter(x => /Not ported yet/.test(x.querySelector('.gb').textContent)).map(x => x.getAttribute('data-gadget-name') + ':' + x.getAttribute('data-gadget-kind')));
    fact('home.notPorted', np.length + ' ' + JSON.stringify(np));
    for (const sel of ['#idmp-home .idmp-gadget:has(.gb:text("Not ported yet")) >> nth=0', '#idmp-home .idmp-gadget:has(.gb:text("Not ported yet")) >> nth=' + Math.max(0, np.length - 1)]) { await glide(sel).catch(() => {}); await hold(1100); }

    // c2 Setup check (read-only lens pill); Thai: the UI goes back to English on this first panel
    if (THAI) {
      await beat('c2a', ONLY, 'Setup check pill: the first panel, UI still Thai');
      await pill('setuplens'); await page.waitForSelector('[data-setuplens-row]', { timeout: 8000 }); await hold(900);
      await beat('c2b', ONLY, 'first panel on screen -> UI back to English'); await setLang('en_US', 'session'); await hold(800);
      await beat('c2', 'en', 'Setup check lines');
    } else {
      await beat('c2', 'en', 'Setup check pill');
      await pill('setuplens'); await page.waitForSelector('[data-setuplens-row]', { timeout: 8000 }); await hold(900);
    }
    const sl = await page.$$eval('[data-setuplens-row]', e => e.map(x => x.getAttribute('data-setuplens-row') + '=' + x.getAttribute('data-status')));
    fact('setupcheck', sl.length + ' ' + JSON.stringify(sl));
    fact('setupcheck.log', (PAGELOG.filter(l => /§SETUP-LENS client=/.test(l)).pop() || 'NO §SETUP-LENS LINE').replace(/^.*§SETUP-LENS/, '§SETUP-LENS'));
    for (let i = 0; i < sl.length; i++) { await glide('[data-setuplens-row] >> nth=' + i); await hold(520); }
    await hold(800);

    // c3 Window anatomy on the Sales Order window
    await beat('c3', 'en', 'Window anatomy pill on Sales Order');
    await openWinById(143); await hold(900);
    await pill('windowlens'); await page.waitForSelector('[data-windowlens-row]', { timeout: 8000 }); await hold(900);
    const wl = await page.evaluate(() => ({ head: (document.querySelector('.idmp-ovl-pane .sub') || {}).textContent, rows: [...document.querySelectorAll('[data-windowlens-row]')].map(x => x.getAttribute('data-windowlens-row') + '=' + x.getAttribute('data-status')) }));
    fact('windowlens.head', wl.head); fact('windowlens.rows', JSON.stringify(wl.rows));
    fact('windowlens.log', (PAGELOG.filter(l => /§WINDOW-LENS window=/.test(l)).pop() || 'NO §WINDOW-LENS LINE').replace(/^.*§WINDOW-LENS/, '§WINDOW-LENS'));
    const nWl = wl.rows.length; for (let i = 0; i < nWl; i++) { await glide('[data-windowlens-row] >> nth=' + i); await hold(650); }
    await hold(900);

    // c4 Quick setup, as System Administrator, in a second tab the recorder follows
    await beat('c4', 'en', 'Quick setup: System login, Initial Tenant Setup');
    const p2 = await ctx.newPage(); wire(p2, 'P2 '); await p2.addInitScript(CURSOR);
    await p2.goto(base + '/idempiere.html?lang=en_US', { waitUntil: 'networkidle' });
    await p2.waitForFunction(() => !!window.__idmpDb && document.querySelector('#idmp-login-clients') && document.querySelector('#idmp-login-clients').children.length > 0, null, { timeout: 30000 });
    const pg1 = page; page = p2; await castOn(p2); await p2.mouse.move(720, 400); await hold(700);
    await login('System', 'System');
    await p2.evaluate(() => document.querySelectorAll('#idmp-tree .idmp-row:not(.leaf)').forEach(r => { if (!r.parentElement.classList.contains('open')) r.click(); })); await hold(500);
    await hclick("#idmp-tree .idmp-row.leaf:has(.nm:text-is('Initial Tenant Setup'))"); await p2.waitForSelector('[data-genesis-create]', { timeout: 10000 }); await hold(1200);
    const legacyFields = await p2.evaluate(() => ({ cur: !!document.querySelector('[data-genesis-currency]').offsetParent, adm: !!document.querySelector('[data-genesis-admin]').offsetParent, coa: !!document.querySelector('[data-genesis-coa]').offsetParent, quick: !!document.querySelector('[data-genesis-quick]'), quickOn: !!(document.querySelector('[data-genesis-quick]') || {}).checked }));
    fact('quick.default', JSON.stringify(legacyFields));
    await beat('c4b', 'en', 'tick Quick setup: three fields hidden, derived values named');
    await hclick('[data-genesis-quick]'); await hold(1000);
    const qs = await p2.evaluate(() => ({ sum: (document.querySelector('[data-genesis-quicksum]') || {}).textContent, cur: !!document.querySelector('[data-genesis-currency]').offsetParent, adm: !!document.querySelector('[data-genesis-admin]').offsetParent, coa: !!document.querySelector('[data-genesis-coa]').offsetParent }));
    fact('quick.summary', qs.sum); fact('quick.hidden', JSON.stringify({ currencyShown: qs.cur, adminShown: qs.adm, chartShown: qs.coa }));
    fact('quick.log', (PAGELOG.filter(l => /§QUICKSETUP preview/.test(l)).pop() || 'NO §QUICKSETUP LINE').replace(/^.*§QUICKSETUP/, '§QUICKSETUP'));
    await hold(2200);
    await beat('c4c', 'en', 'type the name and create');
    await htype('[data-genesis-name]', 'FilmShop'); await hold(600);
    await hclick('[data-genesis-create]'); await p2.waitForSelector('[data-genesis-enter]', { timeout: 40000 }); await hold(1500);
    fact('quick.created', (PAGELOG.filter(l => /§W-GENESIS-SYSADMIN-LIVE created client=/.test(l)).pop() || 'NO CREATED LINE').replace(/^.*§W-GENESIS-SYSADMIN-LIVE/, '§W-GENESIS-SYSADMIN-LIVE'));
    fact('quick.useLog', (PAGELOG.filter(l => /§QUICKSETUP use /.test(l)).pop() || 'NO §QUICKSETUP use LINE').replace(/^.*§QUICKSETUP/, '§QUICKSETUP'));
    await hold(2200);

    // c5 closing: the overlay is one script tag
    await beat('c5', 'en', 'closing: overlay is one tag');
    const html = await p2.evaluate(() => fetch('idempiere.html').then(r => r.text()));
    fact('seam', 'script tags naming overlay/boot.js in idempiere.html = ' + (html.match(/overlay\/boot\.js/g) || []).length + '; kill switch ?overlay=0');
    await hold(3500);
    await beat('end', 'en', '');
    say('§ERP_FILM_CURSOR clicks=' + clicks + ' cursorOnTarget=' + cursorOk + (clicks === cursorOk ? ' OK' : ' WRONG'));
  } catch (e) { say('§ERP_FILM_ERROR ' + e.message.split('\n')[0]); }

  if (cdp) await cdp.send('Page.stopScreencast').catch(() => {}); await page.waitForTimeout(300).catch(() => {});
  const endTs = Date.now() / 1000;
  fs.writeFileSync(path.join(OUT, 'erp_film.page.log'), PAGELOG.join('\n') + '\n');
  const lines = [];
  frames.forEach((f, i) => { const d = (i + 1 < frames.length ? frames[i + 1].ts : endTs) - f.ts; lines.push(`file '${f.fn}'`, `duration ${Math.max(d, 0.001).toFixed(4)}`); });
  if (frames.length) lines.push(`file '${frames[frames.length - 1].fn}'`);
  fs.writeFileSync(path.join(OUT, 'frames.txt'), lines.join('\n') + '\n');
  const mp4 = path.join(OUT, 'erp_film_nc3.mp4');
  try {
    execFileSync('ffmpeg', ['-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', path.join(OUT, 'frames.txt'),
      '-vf', 'fps=24,scale=1920:1080:flags=lanczos,format=yuv420p', '-c:v', 'libx264', '-crf', '17', '-preset', 'medium', mp4]);
    say('§ERP_FILM_DONE frames=' + frames.length + ' dur=' + (endTs - (T0 || endTs)).toFixed(2) + ' out=' + mp4);
  } catch (e) { say('§ERP_FILM_ERROR ffmpeg ' + String(e.message).split('\n')[0]); }
  fs.writeFileSync(path.join(OUT, 'erp_film.log'), LOG.join('\n') + '\n');
  await browser.close(); server.close();
})();

