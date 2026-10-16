// ⚠ DO NOT REMOVE — Scope guard
// Scope: §ERP-DEPTH-FILM cycle 2 "New Client in Depth" chapter (English only, red1 2026-10-13): Calendar & periods -> Open/Close -> Financial Report the legacy way.
//   ONE take, CPU only. Every number spoken is a §ERP_FILM_FACT read from the live in-browser DB / dialog. Selectors proven by erp/tests/poc_nc1_calendar_ui_live.js,
//   poc_nc2_period_control_ui_live.js and poc_nc2b_finreport_ui_live.js (W-NC1-UI 13/13, W-NC2-UI 9/9, W-NC2B-UI 6/6); legacy numbers: prompts/ERP_DEPTH_FILM.md §NC-1/§NC-2.
// §-log first — READ <out>/erp_film.log (beats + facts) and <out>/erp_film.page.log before any conclusion. Exit code is not evidence.
// Run:  [ERP_REPO=<worktree>] [BEAT_MIN='{"n1":9.1,…}'] node scripts/film_erp_newclient.js <outDir>   → <outDir>/erp_film_nc.mp4 (24 fps, 1920×1080)
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
    // ── English: log in OFF CAMERA. Thai (ONLY_LANG=th_TH, rule 2026-10-13): the login card + login + the first panel are ON camera in Thai, then the UI goes to English ──
    const doLogin = async () => {
      await hclick("#idmp-login-clients .idmp-login-user:has(.nm:text-is('GardenWorld'))"); await page.waitForSelector('#idmp-login-step1:visible'); await hold(300);
      await hclick("#idmp-login-users .idmp-login-user:has(.nm:text-is('GardenAdmin'))"); await page.waitForSelector('#idmp-login-step2:visible'); await hold(300);
      await hclick('#idmp-login-ok');
      await page.waitForFunction(() => document.querySelector('#idmp-tree') && document.querySelector('#idmp-tree').children.length > 0, null, { timeout: 10000 }); await hold(300);
    };
    if (ONLY) { await castOn(page); await page.mouse.move(720, 400); await beat('n0', ONLY, 'login card in ' + ONLY); await hold(2500); }
    else { await doLogin(); await castOn(page); await page.mouse.move(720, 400); await hold(600); }
    const TABT = (table) => '#idmp-tabstrip .idmp-adtab[title$="· ' + table + '"]';
    const ensureForm = async () => { if (!(await page.locator('#idmp-inline-mount [data-col]').count())) { await hclick('#idmp-toolbar [data-tb="toggle"]'); await hold(700); } };
    const ensureGrid = async () => { if (!(await page.locator('.idmp-grid tbody tr').count())) { await hclick('#idmp-toolbar [data-tb="toggle"]'); await hold(700); } };
    const dlgMsg = () => page.evaluate(() => [...document.querySelectorAll('#idmp-procdlg .msg')].map(x => x.textContent).join(' || '));
    const states = async (p) => { const o = {}; (await tip("SELECT periodstatus AS s, COUNT(*) AS n FROM c_periodcontrol WHERE c_period_id=" + p + " GROUP BY 1")).forEach(r => { o[r.s] = r.n; }); return o; };
    const clickOK = async () => { await page.waitForSelector('[data-procdlg-ok]', { timeout: 20000 }); await hold(2200); await hclick('[data-procdlg-ok]'); await hold(500); };

    // n1 the window and its five tabs
    if (ONLY) {
      await beat('n0b', ONLY, 'login + open the first panel, UI still ' + ONLY); await doLogin(); await openWinById(117); await hold(900);
      await beat('n0c', ONLY, 'first panel on screen -> UI back to English'); await setLang('en_US', 'session'); await hold(800);
      await beat('n1', 'en', 'Calendar Year and Period window');
    } else {
      await beat('n1', 'en', 'Calendar Year and Period window'); await openWinById(117); await hold(900);
    }
    const tabNames = await page.$$eval('#idmp-tabstrip .idmp-adtab', e => e.map(x => x.textContent.trim()));
    fact('tabs', tabNames.length + ' ' + JSON.stringify(tabNames));
    for (let i = 0; i < tabNames.length; i++) { await glide('#idmp-tabstrip .idmp-adtab >> nth=' + i); await hold(650); }

    // n2 a new year, Create Periods
    await beat('n2', 'en', 'New fiscal year');
    await hclick(TABT('C_Year')); await hold(900);
    await hclick(NEWB); await page.waitForSelector('#idmp-inline-mount .cfrow', { timeout: 10000 }); await hold(500);
    await htype(F('fiscalyear'), '2031'); await hclick(SAVEB); await page.waitForTimeout(1600);
    const yr = (await tip("SELECT c_year_id AS id FROM c_year WHERE fiscalyear='2031'"))[0]; if (!yr) throw new Error('year 2031 not created');
    fact('year', 'fiscal year 2031 saved, id ' + yr.id);
    await ensureForm(); await hold(500);
    await beat('n2b', 'en', 'Create Periods dialog');
    await hclick('[data-proc-btn]'); await page.waitForSelector('[data-proc-param="StartDate"]', { timeout: 8000 }); await hold(900);
    await glide('[data-proc-param="StartDate"]'); await page.fill('[data-proc-param="StartDate"]', '2031-07-01'); await hold(700);
    await htype('[data-proc-param="DateFormat"]', 'MMM yyyy'); await hold(700);
    fact('createPeriods.params', 'StartDate=2031-07-01 DateFormat=MMM yyyy');
    await hclick('[data-proc-run]'); await clickOK();
    const per = await tip("SELECT periodno AS no, name, substr(startdate,1,10) AS s, substr(enddate,1,10) AS e FROM c_period WHERE c_year_id=" + yr.id + " ORDER BY periodno");
    const ctl = (await tip("SELECT COUNT(*) AS n, SUM(periodstatus='N') AS never FROM c_periodcontrol WHERE c_period_id IN (SELECT c_period_id FROM c_period WHERE c_year_id=" + yr.id + ")"))[0];
    fact('periods', per.length + ' first=' + per[0].name + ' ' + per[0].s + '..' + per[0].e + ' last=' + per[per.length - 1].name + ' ' + per[per.length - 1].s + '..' + per[per.length - 1].e);
    fact('periodControl', ctl.n + ' control rows, ' + ctl.never + ' never opened');

    // n3 the periods and their control rows
    await beat('n3a', 'en', 'Twelve periods');
    await hclick(TABT('C_Period')); await hold(1200);
    await ensureGrid(); await hold(500);
    await glide('.idmp-grid tbody tr >> nth=0'); await hold(1200); await glide('.idmp-grid tbody tr >> nth=-1').catch(() => {}); await hold(1500);
    await beat('n3b', 'en', 'Period Control rows');
    await hclick(TABT('C_PeriodControl')); await hold(1400); await ensureGrid();
    fact('controlRows', (await page.$$eval('.idmp-grid tbody tr', e => e.length)) + ' rows for the first period');
    await glide('.idmp-grid tbody tr >> nth=0'); await hold(2200);

    // n4 open the period
    await hclick(TABT('C_Period')); await hold(1000); await ensureForm(); await hold(500);
    const p1 = per.length ? (await tip("SELECT c_period_id AS id FROM c_period WHERE c_year_id=" + yr.id + " AND periodno=1"))[0].id : null;
    async function openCloseAll(act, tag, bid, note) {
      if (bid) await beat(bid, 'en', note);
      await hclick('[data-proc-btn]'); await page.waitForSelector('[data-proc-param="PeriodAction"]', { timeout: 8000 }); await hold(800);
      if (tag === 'open') fact('periodActionList', JSON.stringify(await page.$$eval('[data-proc-param="PeriodAction"] option', o => o.map(x => x.textContent.trim()).filter(Boolean))));
      await hselect('[data-proc-param="PeriodAction"]', act); await hold(700);
      await hclick('[data-proc-run]'); await page.waitForSelector('[data-procdlg-ok]', { timeout: 15000 }); await hold(300);
      const m = await dlgMsg(); fact('openCloseAll.' + tag, m + ' states=' + JSON.stringify(await states(p1)) + ' (n/a before commit refresh)');
      await clickOK(); fact('states.' + tag, JSON.stringify(await states(p1)));
    }
    await openCloseAll('O', 'open', 'n4', 'Open/Close All = Open');
    await beat('n4b', 'en', 'rows now open');
    await hclick(TABT('C_PeriodControl')); await hold(1500); await ensureGrid(); await glide('.idmp-grid tbody tr >> nth=0'); await hold(2000);

    // n5 close, permanently close, try to reopen
    await hclick(TABT('C_Period')); await hold(1000); await ensureForm(); await hold(400);
    await openCloseAll('C', 'close', 'n5a', 'Close');
    await openCloseAll('P', 'permanent', 'n5b', 'Permanently close');
    await openCloseAll('O', 'reopen', 'n5c', 'Reopen refused');

    // n6 Financial Report the legacy way
    await beat('n6a', 'en', 'Financial Report window');
    await openWinById(216); await hold(1000);
    await ensureForm(); await hold(400);
    for (let k = 0; k < 4 && !/Balance Sheet/.test(await page.inputValue(F('name')).catch(() => '')); k++) { await hclick('#idmp-toolbar button[title^="Next record"]'); await hold(700); }
    fact('reportRecord', await page.inputValue(F('name')).catch(() => '?'));
    async function runReport(label, periodLabel, bid, note) {
      if (bid) await beat(bid, 'en', note);
      await hclick('[data-proc-btn="Processing"]'); await page.waitForSelector('[data-proc-run]', { timeout: 8000 }); await hold(1000);
      if (periodLabel) { const v = await page.$$eval('[data-proc-param="C_Period_ID"] option', (o, lab) => { const x = o.find(y => y.textContent.trim() === lab); return x ? x.value : null; }, periodLabel); if (v == null) throw new Error('no period option ' + periodLabel); await hselect('[data-proc-param="C_Period_ID"]', v); await hold(700); }
      await hclick('[data-proc-run]'); await page.waitForSelector('#idmp-procdlg table[data-statement]', { timeout: 20000 }); await hold(1200);
      const st = await page.evaluate(() => { const t = document.querySelector('#idmp-procdlg table[data-statement]'); return { msg: [...document.querySelectorAll('#idmp-procdlg .msg')].map(x => x.textContent).join(' || '), rows: [...t.querySelectorAll('tr')].slice(1).map(r => [...r.querySelectorAll('td')].map(td => td.textContent.trim())) }; });
      fact('finreport.' + label, st.msg); const cash = st.rows.find(r => r[0] === '11'); fact('finreport.' + label + '.cashLine', JSON.stringify(cash || null));
      await glide('#idmp-procdlg table[data-statement] tr >> nth=2').catch(() => {}); await hold(2600); await clickOK();
    }
    await runReport('default', null, 'n6b', 'default period');
    await runReport('jan03', 'Jan-03', 'n6c', 'Jan-03');

    await beat('n7', 'en', 'closing'); await hold(3500);
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
  const mp4 = path.join(OUT, 'erp_film_nc.mp4');
  try {
    execFileSync('ffmpeg', ['-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', path.join(OUT, 'frames.txt'),
      '-vf', 'fps=24,scale=1920:1080:flags=lanczos,format=yuv420p', '-c:v', 'libx264', '-crf', '17', '-preset', 'medium', mp4]);
    say('§ERP_FILM_DONE frames=' + frames.length + ' dur=' + (endTs - (T0 || endTs)).toFixed(2) + ' out=' + mp4);
  } catch (e) { say('§ERP_FILM_ERROR ffmpeg ' + String(e.message).split('\n')[0]); }
  fs.writeFileSync(path.join(OUT, 'erp_film.log'), LOG.join('\n') + '\n');
  await browser.close(); server.close();
})();
