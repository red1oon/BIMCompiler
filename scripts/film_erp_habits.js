// ⚠ DO NOT REMOVE — Scope guard
// Scope: §ERP-DEPTH-FILM §FILM-NEXT "Same habits, no server" (user 2026-10-16: "we got sufficient new theme and script for this next film?" -> "continue"):
//   the grid shows legacy's columns, a record's paper trail (Record Info change log, Change Audit, Session Audit) DERIVED from the signed op-log,
//   local wall-clock times, Home Recent Items, the System Monitor housekeeping panel. Ledger cards (blue legacy / red twin before / green twin now)
//   then a LIVE clip; navigation happens behind the cards. ONE take, CPU only. Every number spoken is a §ERP_FILM_FACT read while recording
//   (pilot psql, the witnesses run during the take, the in-browser DB / screen). Helpers reused unchanged from scripts/film_erp_gap2.js.
// §-log first — READ <out>/erp_film.log (beats + facts) and <out>/erp_film.page.log before any conclusion. Exit code is not evidence.
// Run:  ERP_REPO=<worktree> [BEAT_MIN='{"h0":9.1,…}'] node scripts/film_erp_habits.js <outDir>   → <outDir>/erp_film_habits.mp4 (24 fps, 1920×1080)
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
  const htype = async (sel, text) => { await glide(sel); await page.click(sel); await page.fill(sel, ''); await page.type(sel, text, { delay: 25 }); await page.locator(sel).first().blur().catch(() => {}); await hold(350); };
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
      await page.evaluate(id => document.querySelector('#idmp-tree .idmp-row.leaf[data-menu-id="' + id + '"]').click(), mid); await page.waitForSelector(NEWB, { timeout: 20000, state: 'attached' }); await page.waitForFunction(() => document.querySelectorAll('.idmp-grid tbody tr td').length > 1 || !!document.getElementById('idmp-find-ov'), null, { timeout: 15000 }).catch(() => {}); await hold(1200);   // in-page click: the card on top would intercept a real pointer click
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
        d.innerHTML = '<div style="font-size:21px;letter-spacing:.14em;color:#8fa0b3;text-transform:uppercase">Same habits, no server</div><div style="font-size:50px;font-weight:700;margin:6px 0 4px">' + title + '</div><div style="font-size:23px;color:#b8c4d2;margin-bottom:30px">' + sub + '</div>' +
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


    const BP = 'Agri-Tech';
    // a high-volume window opens on the Find dialog first (legacy initialQuery): answer it like a user, on camera, with OK
    const findOk = async (tag) => { if (await page.locator('#idmp-find-ov').count()) { fact('findFirst.' + tag, 'Find dialog shown on open'); await hold(1200); await hclick('#idmp-find-ov [data-find-ok]'); await hold(1000); return true; } return false; };
    const gridCols = () => page.evaluate(() => { const t = document.querySelector('#idmp-content .idmp-grid'); return t ? [...t.querySelectorAll('thead th')].length - 1 : 0; });
    const scrollGrid = async (to, ms) => { const steps = 30; for (let i = 1; i <= steps; i++) { await page.evaluate(([to, f]) => { const c = document.getElementById('idmp-content'); c.scrollLeft = (to === 'end' ? c.scrollWidth - c.clientWidth : 0) * f + (to === 'end' ? 0 : c.scrollLeft * (1 - f)); }, [to, i / steps]); await hold(ms / steps); } };
    const runW = (file, env) => { try { return execFileSync('node', [path.join(REPO, 'erp', 'tests', file)], { encoding: 'utf8', maxBuffer: 1 << 26, cwd: path.join(REPO, 'erp'), env: Object.assign({}, process.env, env || {}) }); } catch (e) { return String(e.stdout || ''); } };

    // the witnesses run ONCE, before the screencast starts (their lines are facts of this take; a card no longer waits on them)
    const gw = runW('witness_grid_cols.js'), cw = runW('witness_changelog_rule.js');
    // ===== GardenAdmin =====
    await login('GardenWorld', 'GardenAdmin'); await castOn(page); await page.mouse.move(720, 400); await hold(600);
    await beat('h0', 'en', 'method card');
    await ledger('Same habits, no server', 'An iDempiere user and their admin should find their daily habits unchanged in the browser twin. Blue = real iDempiere, red = the twin before this week, green = the twin now.', [
      { k: 'method', label: 'Every cell below is read while this film is recorded', legacy: C('legacy'), before: C('before'), now: C('now') }]);
    await openPlain(143);   // Sales Order, opened behind the card
    await cardFor(7000);

    // h1 the grid
    await beat('h1', 'en', 'ledger: grid columns');
    const gv = (gw.split('\n').filter(l => /§GRC-VERDICT/.test(l)).pop() || ''), gc = (gw.split('\n').filter(l => /§GRC-CONTROL/.test(l)).pop() || '');
    const gm = /PASS (\d+)\/(\d+) tabs/.exec(gv) || [], gcm = /wrong on (\d+) of (\d+)/.exec(gc) || [];
    fact('grid.verdict', gv || 'NO §GRC-VERDICT'); fact('grid.control', gc || 'NO §GRC-CONTROL');
    const soLegacy = pgq("select count(*) from ad_field f join ad_column c using(ad_column_id) join ad_tab t using(ad_tab_id) where t.ad_window_id=143 and t.seqno=(select min(seqno) from ad_tab x where x.ad_window_id=143 and x.isactive='Y') and f.isactive='Y' and c.isactive='Y' and f.isdisplayedgrid='Y' and not (coalesce(f.ad_reference_id,c.ad_reference_id)=28 and c.istoolbarbutton='Y')");
    const soNow = await gridCols(); fact('grid.salesOrder', 'legacy=' + soLegacy + ' now=' + soNow + ' before=7 (buildGrid .slice(0, 7) on origin/main before #2064)');
    await ledger('The grid', 'Which columns a window\'s grid shows (legacy: every field marked for the grid, in its grid order)', [
      { k: 'socols', label: 'Sales Order grid columns', legacy: C(soLegacy), before: C(7, 'old code: first 7 form fields'), now: C(soNow) },
      { k: 'tabs', label: 'Tabs whose grid equals legacy', legacy: C(gm[2] || '?'), before: C(gcm[2] ? String(Number(gcm[2]) - Number(gcm[1])) : '?', 'witness control, run now'), now: C(gm[1] || '?') }]);
    await cardFor(8000);
    await unledger(); await beat('h1b', 'en', 'live Sales Order grid');
    fact('so.rows', await page.evaluate(() => window.IdmpGridTab.snapshot().rows.length) + ' shown of ' + await dbq('SELECT count(*) FROM c_order WHERE ad_client_id=11 AND issotrx=\'Y\''));
    await hold(1200); await scrollGrid('end', 6000); await hold(1500); await scrollGrid('start', 2500);
    await liveFor(2000);

    // h2 Business Partner: Find first, then two edits
    await beat('h2', 'en', 'live Business Partner: Find first');
    await openMenuById(await page.evaluate(() => { const r = window.__idmpDb.exec("SELECT AD_Menu_ID FROM AD_Menu WHERE Action='W' AND AD_Window_ID=123 AND IsActive='Y'"); return r[0].values.map(x => x[0]).find(i => document.querySelector('#idmp-tree .idmp-row.leaf[data-menu-id="' + i + '"]')); }));
    await page.waitForSelector('#idmp-find-ov', { timeout: 15000 }); fact('bp.findFirst', 'Find dialog open on window open (high volume)'); await hold(1800);
    await hclick('#idmp-find-ov [data-find-ok]'); await hold(1200);
    fact('bp.rows', await page.evaluate(() => window.IdmpGridTab.snapshot().rows.length));
    const bpId = await dbq("SELECT c_bpartner_id FROM c_bpartner WHERE name='" + BP + "' AND ad_client_id=11");
    await liveFor(1000);
    await beat('h2b', 'en', 'live: edit Name twice');
    await gotoRecord(bpId);
    const NAME = '#idmp-inline-mount input[data-col="name"]';
    const n0 = await page.$eval(NAME, e => e.value); fact('bp.name0', n0);
    for (const nv of [BP + ' Garden', BP + ' Gardens']) {
      await htype(NAME, nv); const m0 = PAGELOG.length; await hclick(SAVEB);
      for (let i = 0; i < 40 && !last(m0, /§UDP6-RECENT|§ADMIN3-CHANGEAUDIT/); i++) await hold(150);
      await hold(900); fact('bp.saved', nv + ' ' + last(m0, /§ADMIN3-CHANGEAUDIT/));
    }
    await liveFor(1500);

    // h3 Record Info
    await beat('h3', 'en', 'live Record Info: change log');
    let m1 = PAGELOG.length; await hclick('#idmp-toolbar button[title^="Record info"]'); await page.waitForSelector('#idmp-recinfo-ov'); await hold(600);
    const ri = await page.evaluate(() => { const ov = document.getElementById('idmp-recinfo-ov'); return { pre: ov.querySelector('pre').textContent, rows: [...ov.querySelectorAll('#idmp-recinfo-log tr')].filter(r => r.cells[0].tagName === 'TD').map(r => [...r.cells].map(c => c.textContent)) }; });
    fact('recinfo', JSON.stringify(ri)); fact('recinfo.log', last(m1, /§RECINFO-LIVE/));
    fact('clock.local', await page.evaluate(() => { const d = new Date(), p = n => ('0' + n).slice(-2); return p(d.getHours()) + ':' + p(d.getMinutes()); }));
    for (let i = 0; i < Math.min(ri.rows.length, 2); i++) { await glide('#idmp-recinfo-log tr:has(td) >> nth=' + i); await hold(1600); }
    await liveFor(3000);

    // h4 the paper trail ledger (Change Audit opened behind it)
    await beat('h4', 'en', 'ledger: the paper trail');
    const cv = (cw.split('\n').filter(l => /§CLR-VERDICT/.test(l)).pop() || ''), cc = (cw.split('\n').filter(l => /IsAllowLogging only/.test(l)).pop() || '');
    const cvm = /columns (\d+)\/(\d+)/.exec(cv) || [], ccm = /wrong on (\d+) columns/.exec(cc) || [];
    fact('changelog.rule', cv || 'NO §CLR-VERDICT'); fact('changelog.control', cc || 'NO CONTROL');
    const caNow = await dbq('SELECT count(*) FROM temp.ad_changelog WHERE record_id=' + bpId), caStored = await dbq("SELECT count(*) FROM main.sqlite_master WHERE name='ad_changelog'");
    const caBefore = seed0('select count(*) from ad_changelog');
    fact('changeaudit', 'now=' + caNow + ' storedInMain=' + caStored + ' seedBefore=' + caBefore);
    await ledger('The paper trail', 'Who changed what, when - legacy writes AD_ChangeLog; the twin derives the same rows from its signed log', [
      { k: 'rule', label: 'Columns logged exactly like legacy', legacy: C(cvm[2] || '?'), before: C(cvm[2] && ccm[1] ? String(Number(cvm[2]) - Number(ccm[1])) : '?', 'witness control, run now'), now: C(cvm[1] || '?') },
      { k: 'rows', label: 'Change Audit rows for these two saves', legacy: C(2, 'legacy rule: one per changed column'), before: C(caBefore === 'absent' ? 'no table' : caBefore), now: C(caNow) },
      { k: 'stored', label: 'Extra copies stored', legacy: C('AD_ChangeLog'), before: C('-'), now: C(caStored === 0 || caStored === '0' ? 'none' : caStored) }]);
    await page.evaluate(() => { const b = [...document.querySelectorAll('#idmp-recinfo-ov button')].find(x => x.textContent === 'OK'); if (b) b.click(); });   // closed BEHIND the card (no flash of the form)
    await openPlain(270).catch(e => fact('openPlain270', e.message.split('\n')[0]));
    await cardFor(9000);
    await unledger(); await beat('h4b', 'en', 'live Change Audit window');
    await findOk('changeAudit');
    fact('changeaudit.grid', 'cols=' + await gridCols() + ' rows=' + await page.evaluate(() => window.IdmpGridTab.snapshot().rows.length));
    await hold(1200); await scrollGrid('end', 5000); await hold(2000); await scrollGrid('start', 2000);
    await liveFor(1500);
    await beat('h4c', 'en', 'live Session Audit');
    await openWinById(264); await hold(900); await findOk('sessionAudit');
    const sessNow = await dbq('SELECT ad_session_id FROM temp.ad_changelog WHERE record_id=' + bpId + ' LIMIT 1');
    const sids = await page.evaluate(() => window.IdmpGridTab.snapshot().rows.map(r => String(r.pk))), sidx = sids.indexOf(String(sessNow));
    fact('session.index', sidx + ' of ' + sids.length);
    await hclick('#idmp-toolbar [data-tb="toggle"]'); await hold(500);
    if (sidx > (sids.length - 1) / 2) { await hclick('#idmp-toolbar button[title^="Last record"]'); await hold(400); for (let i = sids.length - 1; i > sidx; i--) { await hclick('#idmp-toolbar button:text-is("◀")'); await hold(300); } }
    else { await hclick('#idmp-toolbar button[title^="First record"]'); await hold(400); for (let i = 0; i < sidx; i++) { await hclick(NEXT); await hold(300); } }
    fact('session.at', await page.evaluate(() => window.IdmpGridTab.snapshot().currentKey));
    fact('session.current', sessNow);
    await hclick(TAB('AD_ChangeLog')).catch(async () => { await page.evaluate(() => window.IdmpHost.openTab(null, 'Change Audit')); }); await hold(1200);
    fact('session.changes', await page.evaluate(() => { const s = window.IdmpGridTab.snapshot(); return s.tab + ' rows=' + s.rows.length + ' link=' + s.linkValue; }));
    await liveFor(3000);

    // h5 times
    await beat('h5', 'en', 'ledger: local time');
    const op = await page.evaluate(id => new Promise(res => window.__crud.withSidecar(s => { const r = s.exec("SELECT timestamp FROM kernel_ops WHERE op_type='CRUD_UPDATE' AND parameters LIKE '%c_bpartner%' ORDER BY id DESC LIMIT 1"); res(r.length ? r[0].values[0][0] : null); })), bpId);
    const utcOld = (() => { const d = new Date(Number(op)), p = n => ('0' + n).slice(-2); return p(d.getUTCHours()) + ':' + p(d.getUTCMinutes()); })();
    const locNow = (ri.rows[0] && ri.rows[0][4] || '').slice(11, 16);
    fact('time', 'op=' + op + ' oldFormatter(UTC)=' + utcOld + ' shown=' + locNow);
    await ledger('Time', 'The same save, as each system shows it', [
      { k: 'time', label: 'Updated, shown to the user', legacy: C('local clock'), before: C(utcOld, 'old formatter on this save: UTC'), now: C(locNow) }]);
    // behind the card: close every open window (the Home comes back when no window is open)
    for (let i = 0; i < 10 && await page.locator('#idmp-wintabs .idmp-wintab .x, .idmp-wintab .x').count(); i++) { await page.evaluate(() => { const x = document.querySelector('.idmp-wintab .x'); if (x) x.click(); }); await hold(300); }
    await page.waitForSelector('#idmp-home', { timeout: 15000 }).catch(() => {});
    await cardFor(7000);

    // h6 Home Recent Items
    await unledger(); await beat('h6', 'en', 'live Home Recent Items');
    await page.waitForSelector('#idmp-home-side .ri-item', { timeout: 15000 });
    const items = await page.$$eval('#idmp-home-side .ri-item', e => e.map(x => x.textContent)); fact('recent', JSON.stringify(items)); await hold(1500);
    await hclick('#idmp-home-side .ri-item >> nth=0'); await hold(1800);
    fact('recent.zoom', last(0, /^§ZOOM /));
    await liveFor(2500);

    // h7 System Monitor housekeeping
    await beat('h7', 'en', 'live System Monitor housekeeping');
    await page.evaluate(() => window.SystemMonitor.open()); await page.waitForSelector('#sm-hk tr[data-hk-table]', { timeout: 15000 }); await hold(600);
    await page.evaluate(() => { const c = document.getElementById('sm-hk'); if (c) c.scrollIntoView({ block: 'center' }); }); await hold(800);
    fact('housekeeping', JSON.stringify(await page.$$eval('#sm-hk tr[data-hk-table]', e => e.map(r => r.getAttribute('data-hk-table') + '=' + r.getAttribute('data-hk-rows') + (r.classList.contains('sm-hk-red') ? ' RED' : '')))));
    fact('housekeeping.log', last(0, /§UDP5-HK scan/));
    await liveFor(6000);
    await page.evaluate(() => window.SystemMonitor.close && window.SystemMonitor.close());
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
  const mp4 = path.join(OUT, 'erp_film_habits.mp4');
  try {
    execFileSync('ffmpeg', ['-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', path.join(OUT, 'frames.txt'),
      '-vf', 'fps=24,scale=1920:1080:flags=lanczos,format=yuv420p', '-c:v', 'libx264', '-crf', '17', '-preset', 'medium', mp4]);
    say('§ERP_FILM_DONE frames=' + frames.length + ' dur=' + (endTs - (T0 || endTs)).toFixed(2) + ' out=' + mp4);
  } catch (e) { say('§ERP_FILM_ERROR ffmpeg ' + String(e.message).split('\n')[0]); }
  fs.writeFileSync(path.join(OUT, 'erp_film.log'), LOG.join('\n') + '\n');
  await browser.close(); server.close();
})();

