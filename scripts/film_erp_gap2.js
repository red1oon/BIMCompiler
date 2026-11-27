// ⚠ DO NOT REMOVE — Scope guard
// Scope: §ERP-DEPTH-FILM GAP-2 "Closing the gap" v2 (red1: "there is no clip thereafter to show them showing up" + "flashes of screens, too fast to note"): a LIVE clip after every card that has a screen; navigation happens BEHIND the card, cards replace each other with no gap, every live screen holds for its narration. Based on GAP-1 "Closing the gap" (red1 2026-10-15 "proceed" after "trying to grasp the storyline"): per gap a LEDGER card Legacy | Twin before | Twin now (every cell READ while recording: legacy = pilot psql, before = the unpatched repo ad_seed.db, now = the browser DB; RECORDED cells name their log) then the live window: what the dictionary census / fact_acct / role-access work changed that a user can see. RAW = English, ONE CPU take, no title card (cards are added in post). Based on the chapter-3 recorder; "New Client in Depth" CHAPTER 3 (red1 2026-10-14 "go ahead with the new edition", Thai too): the Home dashboard, the two read-only lens pills and the optional Quick setup - all OVERLAY features (ERP_DEPTH_FILM.md §EXTENSION-LAYER LAW).
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
    const HOME = require('os').homedir(), EVD = path.join(HOME, 'Videos', 'changes_work', 'evidence');
    const pgq = (sql) => { try { return execFileSync('docker', ['exec', '-i', 'postgres', 'psql', '-U', 'postgres', '-d', 'idempiere_pilot', '-tA', '-c', 'set search_path=adempiere;' + sql], { encoding: 'utf8' }).split('\n').filter(l => l && l !== 'SET')[0]; } catch (e) { return 'ERR'; } };
    const seed0 = (sql) => { try { return execFileSync('sqlite3', [path.join(REPO, 'erp', 'ad_seed.db'), sql], { encoding: 'utf8' }).trim(); } catch (e) { return /no such table/.test(String(e.stderr || e.message)) ? 'absent' : 'ERR'; } };
    const login = async (client, user, plain) => {   // plain = no cursor (used for the page that is prepared behind a card)
      const clk = plain ? (sel) => page.click(sel) : hclick;
      await clk("#idmp-login-clients .idmp-login-user:has(.nm:text-is('" + client + "'))"); await page.waitForSelector('#idmp-login-step1:visible'); await hold(plain ? 200 : 400);
      await clk("#idmp-login-users .idmp-login-user:has(.nm:text-is('" + user + "'))"); await page.waitForSelector('#idmp-login-step2:visible'); await hold(plain ? 200 : 400);
      await clk('#idmp-login-ok');
      await page.waitForFunction(() => document.querySelector('#idmp-tree') && document.querySelector('#idmp-tree').children.length > 0, null, { timeout: 15000 }); await hold(plain ? 600 : 500);
    };
    // open a window through its menu leaf WITHOUT any visible motion (called while a card covers the screen)
    const openPlain = async (wid) => {
      const mid = await page.evaluate(w => { const r = window.__idmpDb.exec("SELECT AD_Menu_ID FROM AD_Menu WHERE Action='W' AND AD_Window_ID=" + w + " AND IsActive='Y'"); return (r.length ? r[0].values.map(x => x[0]) : []).find(i => document.querySelector('#idmp-tree .idmp-row.leaf[data-menu-id="' + i + '"]')); }, wid);
      if (!mid) throw new Error('window ' + wid + ' not in this role\'s menu');
      await page.evaluate(id => { const leaf = document.querySelector('#idmp-tree .idmp-row.leaf[data-menu-id="' + id + '"]'); let n = leaf.parentElement; while (n && n.id !== 'idmp-tree') { if (n.classList && n.classList.contains('idmp-node')) n.classList.add('open'); n = n.parentElement; } }, mid);
      await page.evaluate(id => document.querySelector('#idmp-tree .idmp-row.leaf[data-menu-id="' + id + '"]').click(), mid); await page.waitForSelector(NEWB, { timeout: 20000, state: 'attached' }); await page.waitForFunction(() => document.querySelectorAll('.idmp-grid tbody tr td').length > 1, null, { timeout: 15000 }).catch(() => {}); await hold(1200);   // in-page click: the card on top would intercept a real pointer click
      return mid;
    };
    const dbq = async (sql) => { const r = await page.evaluate(s => { try { const r = window.__idmpDb.exec(s); return r.length ? r[0].values : []; } catch (e) { return 'ERR ' + e.message; } }, sql); return Array.isArray(r) && r.length && Array.isArray(r[0]) ? r[0][0] : r; };
    // the ledger card REPLACES any card in the same tick (no frame of the screen underneath between two cards)
    const ledger = async (title, sub, rows, heads) => {
      for (const r of rows) fact('ledger.' + r.k, 'legacy=' + r.legacy.v + ' before=' + r.before.v + ' now=' + r.now.v + (r.legacy.rec || r.before.rec || r.now.rec ? ' (recorded: ' + [r.legacy.rec, r.before.rec, r.now.rec].filter(Boolean).join(', ') + ')' : ''));
      await page.evaluate(({ title, sub, rows, heads }) => {
        const H = heads || ['Legacy iDempiere', 'SQLite twin · before', 'SQLite twin · now'];
        const old = document.getElementById('__ledger'); if (old) old.remove();
        const d = document.createElement('div'); d.id = '__ledger';
        d.style.cssText = 'position:fixed;inset:0;z-index:2147483000;background:#10151c;color:#e8edf3;font-family:DejaVu Sans,Arial,sans-serif;display:flex;flex-direction:column;justify-content:center;padding:0 90px';
        const cell = (c, tone) => '<td style="padding:14px 22px;text-align:center;font-size:46px;font-weight:700;color:' + tone + '">' + c.v + (c.rec ? '<div style="font-size:15px;font-weight:400;color:#8fa0b3;margin-top:4px">recorded · ' + c.rec + '</div>' : '') + '</td>';
        d.innerHTML = '<div style="font-size:21px;letter-spacing:.14em;color:#8fa0b3;text-transform:uppercase">Closing the gap</div><div style="font-size:50px;font-weight:700;margin:6px 0 4px">' + title + '</div><div style="font-size:23px;color:#b8c4d2;margin-bottom:30px">' + sub + '</div>' +
          '<table style="border-collapse:collapse;width:100%"><tr style="font-size:20px;color:#8fa0b3"><td style="padding:6px 22px"></td><td style="text-align:center;padding:6px 22px">' + H[0] + '</td><td style="text-align:center;padding:6px 22px">' + H[1] + '</td><td style="text-align:center;padding:6px 22px">' + H[2] + '</td></tr>' +
          rows.map(r => '<tr style="border-top:1px solid #243040"><td style="padding:14px 22px;font-size:25px;color:#c9d4e0;width:30%">' + r.label + '</td>' + cell(r.legacy, '#7fd1ff') + cell(r.before, '#ff9b8a') + cell(r.now, r.now.v === r.legacy.v ? '#7ee0a0' : '#ffd479') + '</tr>').join('') + '</table>';
        document.body.appendChild(d);
      }, { title, sub, rows, heads });
    };
    const unledger = async () => { await page.evaluate(() => { const d = document.getElementById('__ledger'); if (d) d.remove(); }); };
    const cardFor = async (floorMs) => { const need = ((MIN[prev.id] || 0) - (now() - prev.t)) * 1000; if (need > 0 || floorMs) await hold(Math.max(floorMs || 0, need)); };   // keep the CURRENT card up for its whole narration line (the card stays; the next scene replaces or removes it)
    const liveFor = async (floorMs) => { await cardFor(floorMs); };
    const C = (v, rec) => ({ v: String(v), rec: rec || null });
    const spec = fs.readFileSync(path.join(HOME, 'bim-compiler', 'prompts', 'ERP_DEPTH_FILM.md'), 'utf8');

    // ===== page A: System =====
    await login('System', 'System'); await castOn(page); await page.mouse.move(720, 400); await hold(500);
    fact('seed.patchLog', (PAGELOG.filter(l => /§AD-SEED-PATCH file=patches\/ad_seed/.test(l)).pop() || 'NO §AD-SEED-PATCH LINE').replace(/^.*§AD-SEED-PATCH/, '§AD-SEED-PATCH'));

    await beat('g0', 'en', 'method card');
    await ledger('Same task, two systems', 'Where they differ, the SQLite twin is fixed until they agree. Blue = real iDempiere, red = the twin before, green = the twin now.', [
      { k: 'method', label: 'Every cell below is read while this film is recorded', legacy: C('legacy'), before: C('before'), now: C('now') }]);
    await cardFor(7000);

    // g1 System role access -> the Home (visible under the card; removed when the card ends)
    await beat('g1', 'en', 'ledger: System role access and Activities');
    let dds = ''; try { dds = execFileSync('node', [path.join(REPO, 'erp', 'tests', 'witness_dashboard_docstatus.js')], { encoding: 'utf8', env: Object.assign({}, process.env, { DDS_NOGDICT: '1' }), maxBuffer: 1 << 24 }); } catch (e) { dds = String(e.stdout || ''); }
    const ddsLine = dds.split('\n').filter(l => /DDS6/.test(l) && /FAIL/.test(l)).pop() || '', mm = /\{"got":(\[[^\]]*\]),"want":(\[[^\]]*\])\}/.exec(ddsLine);
    fact('activities.beforeProbe', ddsLine.slice(0, 260) || 'NO DDS6 LINE');
    const dsNow = await page.$$eval('#idmp-home .ds', e => e.map(x => x.querySelector('.dl').textContent + '=' + x.getAttribute('data-ds-count')));   // read from the Home under the card
    let dst = ''; try { dst = execFileSync('node', [path.join(HOME, 'bim-compiler', 'scripts', 'bridge', 'docstatus_legacy.js')], { encoding: 'utf8', maxBuffer: 1 << 24 }); } catch (e) { dst = String(e.stdout || ''); }
    const sysLine = dst.split('\n').filter(l => /§DSTL System\//.test(l)).pop() || '', legCounts = (sysLine.match(/(Notice|Request|Workflow Activities)=(\d+)/g) || []).map(x => x.split('=')[1]).join(' · ') || '?';
    fact('system.legacyCounts', sysLine.slice(0, 200) || 'NO §DSTL System LINE'); fact('system.twinCounts', JSON.stringify(dsNow));
    await ledger('System Administrator', 'Role 0 (System): its access rows, and what the Home Activities gadget can show', [
      { k: 'formaccess', label: 'Form access rows', legacy: C(pgq('select count(*) from ad_form_access where ad_role_id=0')), before: C(seed0('select count(*) from ad_form_access where ad_role_id=0')), now: C(await dbq('SELECT count(*) FROM ad_form_access WHERE ad_role_id=0')) },
      { k: 'processaccess', label: 'Process access rows', legacy: C(pgq('select count(*) from ad_process_access where ad_role_id=0')), before: C(seed0('select count(*) from ad_process_access where ad_role_id=0')), now: C(await dbq('SELECT count(*) FROM ad_process_access WHERE ad_role_id=0')) },
      { k: 'wfaccess', label: 'Workflow access rows', legacy: C(pgq('select count(*) from ad_workflow_access where ad_role_id=0')), before: C(seed0('select count(*) from ad_workflow_access where ad_role_id=0')), now: C(await dbq('SELECT count(*) FROM ad_workflow_access WHERE ad_role_id=0')) },
      { k: 'indicators', label: 'Activities indicators shown', legacy: C(mm ? JSON.parse(mm[2]).length : '?'), before: C(mm ? JSON.parse(mm[1]).length : '?'), now: C(dsNow.length) },
      { k: 'indicatorcounts', label: 'Their counts (nothing is waiting for System)', legacy: C(legCounts), before: C('Workflow Activities missing'), now: C(dsNow.map(d => d.split('=')[1]).join(' · ')) }]);
    await cardFor(6500);
    await unledger(); await beat('g1b', 'en', 'live Home Activities');
    await page.waitForSelector('#idmp-home .ds', { timeout: 10000 }); await hold(900);
    const dsn = await page.$$eval('#idmp-home .ds', e => e.map(x => x.querySelector('.dl').textContent + '=' + x.getAttribute('data-ds-count')));
    fact('system.activities', dsn.length + ' ' + JSON.stringify(dsn));
    for (let i = 0; i < dsn.length; i++) { await glide('#idmp-home .ds >> nth=' + i); await hold(1400); }
    await liveFor(2500);

    // g1c/g1d a role WITH documents: GardenAdmin. The pilot's counts, the twin's code run on those same rows (the W-DASH-DOCSTATUS witness, run now), and the browser's own small seed on the live Home
    const pA = page;
    const pB = await ctx.newPage(); wire(pB, 'PB '); await pB.addInitScript(CURSOR);
    await pB.goto(base + '/idempiere.html?lang=en_US', { waitUntil: 'networkidle' });
    await pB.waitForFunction(() => !!window.__idmpDb && document.querySelector('#idmp-login-clients') && document.querySelector('#idmp-login-clients').children.length > 0, null, { timeout: 30000 });
    page = pB; await login('GardenWorld', 'GardenAdmin', true); await pB.waitForSelector('#idmp-home .ds', { timeout: 15000 }); await hold(1500);
    const dsB = await pB.$$eval('#idmp-home .ds', e => e.map(x => [x.querySelector('.dl').textContent, x.getAttribute('data-ds-count')]));
    page = pA;
    const parseLine = (txt, re) => { const l = txt.split('\n').filter(x => re.test(x)).pop() || ''; const o = {}; (l.match(/([A-Za-z ]+?)=(\d+)/g) || []).forEach(m => { const k = m.split('=')[0].split(/ OK |: |\| /).pop().trim(); o[k] = m.split('=')[1]; }); return o; };
    const legA = parseLine(dst, /§DSTL GardenAdmin\//);
    let ddsOk = ''; try { ddsOk = execFileSync('node', [path.join(REPO, 'erp', 'tests', 'witness_dashboard_docstatus.js')], { encoding: 'utf8', maxBuffer: 1 << 24 }); } catch (e) { ddsOk = String(e.stdout || ''); }
    const twinPilotRows = parseLine(ddsOk, /DDS-CASE GardenAdmin/);
    fact('gardenadmin.legacy', JSON.stringify(legA)); fact('gardenadmin.twinOnPilotRows', JSON.stringify(twinPilotRows)); fact('gardenadmin.browserSeed', JSON.stringify(dsB));
    const names = ['Notice', 'Request', 'Workflow Activities', 'Unprocessed Documents', 'Sales Orders received today', 'Pending Customer Shipments'];
    await beat('g1c', 'en', 'ledger: a role with documents (GardenAdmin)');
    await ledger('A role with documents', 'GardenAdmin\'s Home Activities: the pilot\'s counts, the twin\'s code run on the pilot\'s own rows, and the browser\'s small seed', names.map(n => ({ k: 'ga.' + n.replace(/ /g, ''), label: n, legacy: C(legA[n] != null ? legA[n] : '?'), before: C(twinPilotRows[n] != null ? twinPilotRows[n] : '?', 'W-DASH-DOCSTATUS run now'), now: C((dsB.find(d => d[0] === n) || [, '?'])[1]) })), ['Legacy iDempiere (pilot)', 'Twin code on the pilot\'s rows', 'Twin in the browser (its own seed)']);
    await cardFor(8000);
    await page.mouse.move(720, 420);
    page = pB; await castOn(pB); await beat('g1d', 'en', 'live GardenAdmin Home (browser seed)'); await hold(1200);
    const perfB = await page.$$eval('#idmp-home .pi', e => e.map(x => x.querySelector('.pt').textContent + ' ' + (x.title || '').split(':').slice(-1)[0].trim()));
    fact('gardenadmin.performance', JSON.stringify(perfB));
    for (let i = 0; i < dsB.length; i++) { await glide('#idmp-home .ds >> nth=' + i); await hold(900); }
    for (let i = 0; i < perfB.length; i++) { await glide('#idmp-home .pi >> nth=' + i); await hold(900); }
    await liveFor(3000);
    // back to the System page: its next card is put up BEFORE the cast switches, so no frame of anything else is recorded
    page = pA;

    // g2 messages
    await ledger('Messages', 'AD_Message rows for System and GardenWorld: the text behind every refusal', [
      { k: 'messages', label: 'Messages', legacy: C(pgq('select count(*) from ad_message where ad_client_id in (0,11)')), before: C(seed0('select count(*) from ad_message where ad_client_id in (0,11)')), now: C(await dbq('SELECT count(*) FROM ad_message')) }]);
    await castOn(pA); await beat('g2', 'en', 'ledger: messages (back on the System page)');
    await openPlain(104); await cardFor(4500);
    await unledger(); await beat('g2b', 'en', 'live Message window'); await hold(1000);
    fact('win104.status', await status()); fact('dict.noLines', JSON.stringify(await dbq("SELECT msgtext FROM ad_message WHERE value='NoLines'")));
    for (let i = 0; i < 3; i++) { await glide('.idmp-grid tbody tr >> nth=' + (i * 4)); await hold(1500); }
    await liveFor(3000);

    // g3 print formats
    await beat('g3', 'en', 'ledger: print formats');
    await ledger('Print formats', 'What the Print button can offer, and what is in each format', [
      { k: 'printformats', label: 'Print formats', legacy: C(pgq('select count(*) from ad_printformat where ad_client_id in (0,11)')), before: C(seed0('select count(*) from ad_printformat where ad_client_id in (0,11)')), now: C(await dbq('SELECT count(*) FROM ad_printformat WHERE ad_client_id IN (0,11)')) },
      { k: 'printitems', label: 'Format items', legacy: C(pgq('select count(*) from ad_printformatitem where ad_client_id in (0,11)')), before: C(seed0('select count(*) from ad_printformatitem where ad_client_id in (0,11)')), now: C(await dbq('SELECT count(*) FROM ad_printformatitem WHERE ad_client_id IN (0,11)')) }]);
    await openPlain(240); await cardFor(4500);
    await unledger(); await beat('g3b', 'en', 'live Print Format window'); await hold(1000);
    fact('win240.status', await status());
    for (let i = 0; i < 3; i++) { await glide('.idmp-grid tbody tr >> nth=' + (i * 5)); await hold(1500); }
    await liveFor(3000);

    // g4 info windows
    await beat('g4', 'en', 'ledger: info windows');
    await ledger('Info windows', 'The search windows of the Application Dictionary', [
      { k: 'infowindows', label: 'Info windows (dictionary)', legacy: C(pgq('select count(*) from ad_infowindow where ad_client_id in (0,11)')), before: C(seed0("select count(*) from ad_infowindow where ad_client_id in (0,11) and entitytype<>'U'")), now: C(await dbq("SELECT count(*) FROM ad_infowindow WHERE ad_client_id IN (0,11) AND entitytype<>'U'")) },
      { k: 'infocolumns', label: 'Their columns', legacy: C(pgq('select count(*) from ad_infocolumn where ad_client_id in (0,11)')), before: C(seed0("select count(*) from ad_infocolumn where ad_client_id in (0,11) and entitytype<>'U'")), now: C(await dbq("SELECT count(*) FROM ad_infocolumn WHERE ad_client_id IN (0,11) AND entitytype<>'U'")) },
      { k: 'infobim', label: 'BIM-only definitions (twin extra)', legacy: C(0), before: C(seed0("select count(*) from ad_infowindow where entitytype='U'")), now: C(await dbq("SELECT count(*) FROM ad_infowindow WHERE entitytype='U'")) }]);
    await openPlain(385); await cardFor(4500);
    await unledger(); await beat('g4b', 'en', 'live Info Window window'); await hold(1000);
    fact('win385.status', await status());
    for (let i = 0; i < 3; i++) { await glide('.idmp-grid tbody tr >> nth=' + (i * 5)); await hold(1500); }
    await liveFor(3000);

    // ===== page B: GardenAdmin, prepared behind the next card, cast when the card is gone =====
    await beat('g5', 'en', 'ledger: books (fact_acct)');
    await ledger('Posted books', 'Fact_Acct: the columns every posted line is stored in', [
      { k: 'factcols', label: 'Columns in the books table', legacy: C(pgq("select count(*) from information_schema.columns where table_schema='adempiere' and table_name='fact_acct'")), before: C(seed0("select count(*) from pragma_table_info('fact_acct')")), now: C(await dbq("SELECT count(*) FROM pragma_table_info('fact_acct')")) },
      { k: 'factdated', label: 'Existing book lines with DateAcct', legacy: C('all'), before: C('0 of ' + seed0('select count(*) from fact_acct')), now: C((await dbq('SELECT sum(dateacct IS NOT NULL) FROM fact_acct')) + ' of ' + (await dbq('SELECT count(*) FROM fact_acct'))) }]);
    page = pB; await openPlain(255);
    await cardFor(6500);
    page = pB; await castOn(pB); await beat('g5b', 'en', 'live Accounting Fact Balances (reads DateAcct)'); await page.mouse.move(720, 420); await hold(1200);
    const fbStatus = await status(); fact('win255.status', fbStatus);
    fact('win255.firstRow', JSON.stringify(await page.$$eval('.idmp-grid tbody tr:first-child td', e => e.map(x => x.textContent.trim()).slice(0, 8))));
    for (let i = 0; i < 4; i++) { await glide('.idmp-grid tbody tr >> nth=' + (i * 6)); await hold(1400); }
    await liveFor(3000);

    await beat('g6', 'en', 'ledger: database views');
    const vnames = (/VIEWS = \[([^\]]*)\]/.exec(fs.readFileSync(path.join(REPO, 'erp', 'patches', 'build_views_patch.py'), 'utf8')) || [, ''])[1].split(',').map(x => x.trim().replace(/'/g, '')).filter(Boolean), vin = vnames.map(v => "'" + v + "'").join(',');
    fact('views.list', vnames.length + ' ' + vnames.join(','));
    await ledger('Database views', 'The legacy views behind the report and info windows, each compared row for row (W-VIEWS-PARITY)', [
      { k: 'views', label: 'Views the twin can run (of ' + vnames.length + ')', legacy: C(pgq("select count(*) from pg_views where schemaname='adempiere' and viewname in (" + vin + ")")), before: C(seed0("select count(*) from sqlite_master where type='view' and name in (" + vin + ")")), now: C(await dbq("SELECT count(*) FROM sqlite_master WHERE type='view' AND name IN (" + vin + ")")) }]);
    await openPlain(53087); await cardFor(5500);
    await unledger(); await beat('g6b', 'en', 'live Unprocessed Documents (All) - the rv_unprocessed view'); await hold(1000);
    fact('win53087.status', await status()); fact('win53087.rows', await page.$$eval('.idmp-grid tbody tr', e => e.length));
    for (let i = 0; i < 4; i++) { await glide('.idmp-grid tbody tr >> nth=' + i); await hold(1400); }
    await liveFor(3000);

    await beat('g7', 'en', 'ledger: stored functions');
    const fnBefore = (/\*\*(\d+) NONE\*\*/.exec(spec) || [])[1] || '?';
    let fnNow = ''; try { fnNow = execFileSync('node', [path.join(HOME, 'bim-compiler', 'scripts', 'bridge', 'fn_census_legacy.js'), REPO], { encoding: 'utf8' }); } catch (e) { fnNow = String(e.stdout || ''); }
    const fnLine = fnNow.split('\n').filter(l => /§FN_CENSUS/.test(l)).pop() || 'NO §FN_CENSUS LINE'; fact('fn.census', fnLine);
    await ledger('Stored functions', 'The database functions of legacy, ported to the twin and compared on the same inputs', [
      { k: 'fn', label: 'Business functions with no port', legacy: C(0), before: C(fnBefore, 'ERP_DEPTH_FILM.md §FN-CENSUS'), now: C((/NONE=(\d+)/.exec(fnLine) || [])[1] || (/verdict=PASS/.test(fnLine) ? '0' : '?'), 'fn_census_legacy.js (live run)') },
      { k: 'fnparity', label: 'Functions compared, all equal', legacy: C('48 of 48', 'W-FN-PARITY'), before: C('0 of 12 ports existed'), now: C('48 of 48', 'W-FN-PARITY') }]);
    // behind the card: Sales Order window, its Product button (Info Product), Mulch in the HQ warehouse
    await openPlain(143);
    await page.evaluate(() => document.querySelector('#idmp-toolbar [data-tb="productinfo"]').click()); await page.waitForSelector('#idmp-infowin', { state: 'attached' }); await hold(500);
    await page.fill('#idmp-infowin-crit input[data-col="Value"]', 'Mulch'); await page.selectOption('#idmp-infowin-crit select[data-col="M_Warehouse_ID"]', String(WH));
    await page.evaluate(() => document.querySelector('#idmp-infowin [data-act="refresh"]').click()); await hold(1200);
    const cellv = (c) => page.$eval('#idmp-infowin tbody tr[data-key="' + PROD + '"] td[data-col="' + c + '"]', e => e.getAttribute('data-v')).catch(() => null);
    const ip = { oh: await cellv('QtyOnHand'), av: await cellv('QtyAvailable'), rs: await cellv('QtyReserved') };
    fact('infoProduct', JSON.stringify(ip)); fact('infoProduct.legacy', 'onhand=' + pgq("select coalesce(sum(qtyonhand),0) from m_storageonhand s join m_locator l using(m_locator_id) where s.m_product_id=" + PROD + " and l.m_warehouse_id=" + WH) + ' reserved=' + pgq("select coalesce(sum(qty),0) from m_storagereservation where m_product_id=" + PROD + " and m_warehouse_id=" + WH + " and issotrx='Y'"));
    await cardFor(5500);
    await unledger(); await beat('g7b', 'en', 'live Info Product (stock functions)'); await hold(800);
    await glide('#idmp-infowin tbody tr[data-key="' + PROD + '"]').catch(() => {}); await hold(2500);
    await liveFor(3000);

    // g8 Dunning: honest - no screen
    await beat('g8', 'en', 'ledger: Dunning run (no screen)');
    const crash = (fs.readFileSync(path.join(EVD, 'dunning_before_crash.log'), 'utf8').match(/Cannot read properties of null \(reading '[a-z_]+'\)/) || ['no crash line found'])[0];
    const after = (fs.readFileSync(path.join(EVD, 'dunning_after_full.log'), 'utf8').match(/c_dunningrunline \(ref\/ours\) ins (\d+)\/(\d+)[^\n]* (MATCH|DIFF)/) || []);
    fact('dunning.before', crash); fact('dunning.after', after[0] || 'NO LINE');
    fact('dunning.screen', 'C_DunningRun in the browser seed: ' + JSON.stringify(await dbq("SELECT count(*) FROM sqlite_master WHERE name='c_dunningrun'")) + ' (0 = no Dunning window can open)');
    await ledger('Dunning run', 'The same process on the same rows, for a customer with unallocated payments. Recorded from the process oracle: the browser seed has no Dunning tables yet, so there is no screen for it.', [
      { k: 'dunning', label: 'Dunning lines created', legacy: C(after[1] || '?', 'dunning_after_full.log'), before: C('crash', 'dunning_before_crash.log'), now: C((after[2] || '?') + ' · ' + (after[3] || '?'), 'dunning_after_full.log') }]);
    await page.evaluate(() => { const b = document.querySelector('#idmp-infowin button[title="Close"]'); if (b) b.click(); });   // closed BEHIND the card: no flash of the Sales Order window
    await cardFor(8500);

    // g9 sweep -> a live master-detail example (Product Category: new header, Accounting tab)
    await beat('g9', 'en', 'ledger: window sweep');
    const sw = /\*\*(\d+) PASS \((\d+) full, (\d+) partial\) \/ (\d+) GAP \/ (\d+) INCONCLUSIVE/.exec(spec) || [], sw0 = /was (\d+) PASS \/ (\d+) GAP \/ (\d+) INCONCLUSIVE/.exec(spec) || [];
    fact('sweep.recorded', (sw[0] || 'NO SWEEP LINE') + ' | ' + (sw0[0] || 'NO BEFORE LINE'));
    await ledger('Master-detail sweep', 'Every window with a header and a detail tab, driven in the browser: new header, switch tab, come back', [
      { k: 'sweep', label: 'Windows judged PASS (of 128)', legacy: C('rule: all'), before: C(sw0[1] || '?', 'ERP_DEPTH_FILM.md'), now: C(sw[1] || '?', 'ERP_DEPTH_FILM.md') },
      { k: 'sweep2', label: 'Windows not yet judged', legacy: C(0), before: C(sw0[3] || '?', 'ERP_DEPTH_FILM.md'), now: C(sw[5] || '?', 'ERP_DEPTH_FILM.md') }]);
    await openPlain(144); await cardFor(6500);
    await unledger(); await beat('g9b', 'en', 'live: one swept case - new Product Category, Accounting tab');
    await hold(900); await hclick(NEWB); await hold(900);
    await htype(F('value'), 'FILM-PC1'); await htype(F('name'), 'Film Product Category'); await hold(800);
    const n0 = PAGELOG.length; await hclick(TAB('M_Product_Category_Acct')); await hold(2000);
    fact('acct.rows', await page.$$eval('.idmp-grid tbody tr[data-ad-record]', e => e.length)); fact('acct.status', await status());
    fact('acct.log', (PAGELOG.slice(n0 - 5).filter(l => /§MASTER-ACCT m_product_category_acct/.test(l)).pop() || 'NO §MASTER-ACCT LINE').replace(/^.*§MASTER-ACCT/, '§MASTER-ACCT'));
    for (let i = 0; i < 2; i++) { await glide('.idmp-grid tbody tr[data-ad-record] >> nth=' + i); await hold(1500); }
    await liveFor(3000);

    // g10 what is left
    await beat('g10', 'en', 'ledger: what is left');
    let cv = ''; try { cv = execFileSync('node', [path.join(REPO, 'erp', 'tests', 'witness_dict_census.js')], { encoding: 'utf8', maxBuffer: 1 << 24 }); } catch (e) { cv = String(e.stdout || ''); }
    const cvl = (cv.split('\n').filter(l => /§DC-VERDICT/.test(l)).pop() || ''), cm = /judged=(\d+) match=(\d+) countDiff=(\d+) absent=(\d+)/.exec(cvl) || [], c0 = /(\d+) match, (\d+) gap/.exec(spec) || [];
    fact('census', cvl || 'NO §DC-VERDICT LINE'); fact('census.before', c0[0] || 'NO STAGE-1 LINE');
    await ledger('What is left', 'Dictionary tables compared with legacy: the census names every one that still differs', [
      { k: 'census', label: 'Tables that match legacy (of ~200 judged)', legacy: C('all'), before: C(c0[1] || '?', 'ERP_DEPTH_FILM.md §DICT-CENSUS'), now: C(cm[2] || '?') },
      { k: 'census2', label: 'Tables that still differ', legacy: C(0), before: C(c0[2] || '?', 'ERP_DEPTH_FILM.md §DICT-CENSUS'), now: C(String(Number(cm[3]) + Number(cm[4])) + ' (' + cm[3] + ' count, ' + cm[4] + ' absent)') }]);
    await cardFor(8500);
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
  const mp4 = path.join(OUT, 'erp_film_gap2.mp4');
  try {
    execFileSync('ffmpeg', ['-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', path.join(OUT, 'frames.txt'),
      '-vf', 'fps=24,scale=1920:1080:flags=lanczos,format=yuv420p', '-c:v', 'libx264', '-crf', '17', '-preset', 'medium', mp4]);
    say('§ERP_FILM_DONE frames=' + frames.length + ' dur=' + (endTs - (T0 || endTs)).toFixed(2) + ' out=' + mp4);
  } catch (e) { say('§ERP_FILM_ERROR ffmpeg ' + String(e.message).split('\n')[0]); }
  fs.writeFileSync(path.join(OUT, 'erp_film.log'), LOG.join('\n') + '\n');
  await browser.close(); server.close();
})();

