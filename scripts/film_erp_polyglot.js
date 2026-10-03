// ⚠ DO NOT REMOVE — Scope guard  (POLYGLOT recorder; helpers copied from film_erp_first_setup.js)
// Scope: §ERP-POLYGLOT (prompts/FILM_NARRATION.md §6) — ONE continuous take of the ERP guide journey, the UI switching
//   language live every ~10 s (en→fr→es→de→ar→zh→ja→ms→th, rotating), opened by a greeting round on the login card.
//   Locale switch: #idmp-login-lang (login card) / #idmp-lang (session), each waits for its §I18N line (ERP_UI_LOCALES.md).
//   Selectors are language-proof: menu rows by data-menu-id, tabs by title tableName, toolbar by (Alt+x) title suffix.
// (original part-1 header follows)
// Scope: §ERP-FILM part 1 (prompts/FILM_NARRATION.md §5) — RECORD the ERP First Setup guide (docs/ERP_FirstSetup.md,
//   steps S01..S07) as a film, at human pace, in a headless browser (CPU only, --disable-gpu). Selectors and SQL
//   oracles are copied from the guide's witness bim-ootb/erp/tests/poc_erp_first_setup_live.js (not edited here).
//   THE ISSUE this proves/disproves: can the guide's steps be filmed end-to-end with no human at the keyboard, with
//   every number the narration will say printed as a §ERP_FILM_FACT read from the live in-browser DB.
// §-log first — READ <out>/erp_film.log (beats + facts) and <out>/erp_film.page.log (page console) before any
//   conclusion. Exit code is not evidence.
// Run:  node scripts/film_erp_first_setup.js <outDir>        → <outDir>/erp_film_part1.mp4 (24 fps, 1920×1080)
//       PART=2 node scripts/film_erp_first_setup.js <outDir> → part 1 replayed OFF camera (fast), then part 2 filmed:
//       FirstCo owner login → customer → vendor → product tax category → payment term → sales order → order line,
//       ending at the first step the build cannot do yet (a GAP is filmed as a gap, with its measured cause).
'use strict';
const { chromium } = require(require('os').homedir() + '/bim-ootb/tests/node_modules/playwright');
const http = require('http'), fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');

const REPO = process.env.ERP_REPO || path.join(require('os').homedir(), 'bim-ootb');   // ERP_REPO = a worktree, to film a fix before it merges
const OUT = path.resolve(process.argv[2] || '.'); const FR = path.join(OUT, 'frames'); fs.mkdirSync(FR, { recursive: true });
const LOG = [], PAGELOG = [];
const say = (s) => { LOG.push(s); console.log(s); };
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.db': 'application/octet-stream',
  '.png': 'image/png', '.css': 'text/css', '.wasm': 'application/wasm', '.zip': 'application/zip', '.svg': 'image/svg+xml' };
const server = http.createServer((req, res) => {
  const p = decodeURIComponent(req.url.split('?')[0]);
  fs.readFile(path.join(REPO, p), (e, buf) => {
    if (e) { res.writeHead(404); res.end('404 ' + p); return; }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream', 'Content-Length': buf.length }); res.end(buf);
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


const LANGS = ['en_US', 'fr_FR', 'es_ES', 'de_DE', 'ar', 'zh_CN', 'ja_JP', 'ms_MY', 'th_TH'];
(async () => {
  await new Promise(r => server.listen(0, r));
  const base = 'http://localhost:' + server.address().port + '/erp';
  const browser = await chromium.launch({ args: ['--no-sandbox', '--disable-gpu'] });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 810 }, deviceScaleFactor: 4 / 3, acceptDownloads: true });
  await ctx.addInitScript(CURSOR);
  const page = await ctx.newPage();
  page.on('console', m => PAGELOG.push(m.text()));
  page.on('pageerror', e => PAGELOG.push('PAGEERR ' + e));
  page.on('dialog', async d => { PAGELOG.push('DIALOG ' + d.message()); await d.accept(); });
  const last = (n, re) => PAGELOG.slice(n).filter(l => re.test(l)).pop() || '';
  const one = async (sql) => { const r = await page.evaluate(s => { try { const r = window.__idmpDb.exec(s); return r.length ? r[0].values : []; } catch (e) { return 'ERR ' + e.message; } }, sql); return Array.isArray(r) && r.length ? r[0][0] : r; };
  const fact = (k, v) => say('§ERP_FILM_FACT ' + k + '=' + String(v).replace(/\s+/g, ' ').slice(0, 300));

  // cold cache, then load + preload all language files OFF camera; the film opens on the login card
  await page.goto(base + '/idempiere.html', { waitUntil: 'networkidle' });
  await page.evaluate(() => new Promise(r => { const q = indexedDB.deleteDatabase('erp_cache'); q.onsuccess = q.onerror = q.onblocked = () => r(); }));
  await page.evaluate(() => { try { localStorage.removeItem('erp.lang'); } catch (e) {} });
  await page.goto(base + '/idempiere.html?lang=en_US', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => !!window.__idmpDb && !!window.ErpI18n, null, { timeout: 30000 });
  await page.evaluate(() => window.ErpI18n.preload && window.ErpI18n.preload());
  await page.waitForFunction(() => document.querySelector('#idmp-login-clients') && document.querySelector('#idmp-login-clients').children.length > 0, null, { timeout: 20000 });
  await page.waitForTimeout(1500);

  const cdp = await ctx.newCDPSession(page); const frames = []; let T0 = null;
  cdp.on('Page.screencastFrame', async f => {
    const fn = path.join(FR, String(frames.length).padStart(6, '0') + '.jpg');
    fs.writeFileSync(fn, Buffer.from(f.data, 'base64')); frames.push({ fn, ts: f.metadata.timestamp });
    if (T0 === null) T0 = f.metadata.timestamp;
    cdp.send('Page.screencastFrameAck', { sessionId: f.sessionId }).catch(() => {});
  });
  await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 90, maxWidth: 1920, maxHeight: 1080, everyNthFrame: 1 });
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
  async function htype(sel, text) { await hclick(sel); await page.locator(sel).first().fill(''); await page.keyboard.type(text, { delay: 55 }); await hold(200); }
  async function hselect(sel, val) { await hclick(sel); await page.selectOption(sel, String(val)); await hold(450); }
  async function setLang(code, where) {   // the switch, ON SCREEN: cursor to the picker, pick, wait for §I18N
    const sel = where === 'login' ? '#idmp-login-lang' : '#idmp-lang';
    const n0 = PAGELOG.length; await hclick(sel); await page.selectOption(sel, code);
    for (let i = 0; i < 40 && !last(n0, new RegExp('§I18N lang=' + code)); i++) await page.waitForTimeout(50);
    const l = last(n0, /§I18N lang=/); fact('i18n.' + code, l || 'NO §I18N LINE'); await hold(250);
    fact('dir.' + code, await page.evaluate(() => document.documentElement.dir || getComputedStyle(document.body).direction));
  }
  const NEWB = '#idmp-toolbar [data-tb="new"]', SAVEB = '#idmp-toolbar button[title$="(Alt+S)"]';
  const status = () => page.$eval('#idmp-status', e => e.innerText).catch(() => '');
  const opts = (col) => page.$$eval('#idmp-inline-mount select[data-col="' + col + '"] option', o => o.map(x => ({ v: x.value, t: x.text }))).catch(() => []);
  const F = (col, tag) => '#idmp-inline-mount ' + (tag || 'input') + '[data-col="' + col + '"]';
  const TAB = (table) => '#idmp-tabstrip .idmp-adtab[title$="· ' + table + '"]';
  async function newRecord() { await hclick(NEWB); await page.waitForSelector('#idmp-inline-mount .cfrow', { timeout: 10000 }); await hold(500); }
  async function saveRec() { await hclick(SAVEB); await page.waitForTimeout(1300); }   // FS-19 (§FS2q) made the toggle path enable Save
  async function openMenuById(menuId) {   // folders by data-menu-id (language-proof), opened by hand
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
    await hclick('#idmp-tree .idmp-row.leaf[data-menu-id="' + menuId + '"]');
  }
  const menuIdOf = async (name) => page.evaluate(nm => { const ids = window.__idmpDb.exec("SELECT AD_Menu_ID FROM AD_Menu WHERE Name='" + nm + "' AND IsActive='Y'"); const all = ids.length ? ids[0].values.map(r => r[0]) : [];
    return all.find(i => document.querySelector('#idmp-tree .idmp-row.leaf[data-menu-id="' + i + '"]')) || null; }, name);
  async function openWin(name) { const id = await menuIdOf(name); fact('menu.' + name.replace(/\s/g, ''), id); await openMenuById(id); await page.waitForSelector(NEWB, { timeout: 20000 }); await hold(700); }
  // grid → form on the current record: the toolbar toggle (a grid cell click edits that cell; the checkbox selects)
  async function toForm() { if (!(await page.$('#idmp-inline-mount [data-col]'))) { await hclick('#idmp-toolbar [data-tb="toggle"]'); await page.waitForTimeout(800); } }
  let li = 0; const nextLang = () => LANGS[(li++) % LANGS.length];

  try {
    await page.mouse.move(720, 600);
    // ── INTRO: a greeting per language, the login card re-rendering in each ──
    for (const L of LANGS) { await beat('g_' + L, L, 'greeting'); await setLang(L, 'login'); fact('loginTitle.' + L, await page.$eval('#idmp-login', e => e.innerText.split('\n').filter(Boolean).slice(0, 2).join(' | ')).catch(() => '?')); }
    let L;
    // 1 login as System
    L = nextLang(); await beat('s01', L, 'login System'); await setLang(L, 'login');
    await hclick("#idmp-login-clients .idmp-login-user:has(.nm:text-is('System'))"); await page.waitForSelector('#idmp-login-step1:visible'); await hold(400);
    await hclick("#idmp-login-users .idmp-login-user:has(.nm:text-is('System'))"); await page.waitForSelector('#idmp-login-step2:visible'); await hold(500);
    await hclick('#idmp-login-ok');
    await page.waitForFunction(() => document.querySelector('#idmp-tree') && document.querySelector('#idmp-tree').children.length > 0, null, { timeout: 10000 }); await hold(600);
    // 2 menu → Initial Tenant Setup
    L = nextLang(); await beat('s02', L, 'menu: Initial Tenant Setup'); await setLang(L, 'session');
    const itsId = await menuIdOf('Initial Tenant Setup'); fact('menu.ITS', itsId); await openMenuById(itsId);
    await page.waitForSelector('[data-genesis-create]', { timeout: 8000 }); await hold(500);
    // 3 name, admin, currency
    L = nextLang(); await beat('s03', L, 'FirstCo / owner / MYR'); await setLang(L, 'session');
    await htype('[data-genesis-name]', 'FirstCo'); await htype('[data-genesis-admin]', 'owner');
    const MYR = Number(await one("SELECT C_Currency_ID FROM C_Currency WHERE ISO_Code='MYR' AND IsActive='Y'")); await hselect('[data-genesis-currency]', MYR);
    // 4 create → facts
    L = nextLang(); await beat('s04', L, 'Create'); await setLang(L, 'session');
    let n1 = PAGELOG.length; await hclick('[data-genesis-create]'); await page.waitForSelector('[data-genesis-enter]', { timeout: 25000 });
    const CID = Number(await one("SELECT AD_Client_ID FROM AD_Client WHERE Name='FirstCo'"));
    fact('created', last(n1, /§W-GENESIS-SYSADMIN-LIVE created client=/)); fact('accounts', await one('SELECT COUNT(*) FROM C_ElementValue WHERE AD_Client_ID=' + CID));
    fact('periods', await one('SELECT COUNT(*) FROM C_Period WHERE AD_Client_ID=' + CID)); fact('docTypes', await one('SELECT COUNT(*) FROM C_DocType WHERE AD_Client_ID=' + CID));
    await glide('[data-genesis-enter]'); await hold(800);
    // 5 enter FirstCo → owner login
    L = nextLang(); await beat('s05', L, 'Enter FirstCo, owner logs in'); await setLang(L, 'session');
    await hclick('[data-genesis-enter]'); await page.waitForSelector('#idmp-login-step1:visible', { timeout: 8000 }); await hold(300);
    await hclick("#idmp-login-users .idmp-login-user:has(.nm:text-is('owner'))"); await page.waitForSelector('#idmp-login-step2:visible'); await hold(400);
    await hclick('#idmp-login-ok');
    await page.waitForFunction(() => document.querySelector('#idmp-tree') && document.querySelector('#idmp-tree').children.length > 0, null, { timeout: 10000 }); await hold(500);
    fact('langCarried', await page.evaluate(() => window.ErpI18n && window.ErpI18n.lang));
    const HQ = await one('SELECT AD_Org_ID FROM AD_Org WHERE AD_Client_ID=' + CID + ' ORDER BY AD_Org_ID LIMIT 1');
    // 6 Business Partner → New
    L = nextLang(); await beat('s06', L, 'Business Partner: new'); await setLang(L, 'session');
    await openWin('Business Partner'); await newRecord();
    const orgs = await opts('ad_org_id'); const own = orgs.find(o => String(o.v) === String(HQ)); if (own) await hselect(F('ad_org_id', 'select'), own.v);
    const grp = (await opts('c_bp_group_id')).find(o => /\((\d+)\)$/.test(o.t) && Number(/\((\d+)\)$/.exec(o.t)[1]) >= CID * 100000); if (grp) await hselect(F('c_bp_group_id', 'select'), grp.v);
    // 7 customer fields → save
    L = nextLang(); await beat('s07', L, 'customer Acme Retail'); await setLang(L, 'session');
    await htype(F('value'), 'C-001'); await htype(F('name'), 'Acme Retail Sdn Bhd');
    if (!(await page.locator(F('iscustomer')).first().isChecked())) await hclick(F('iscustomer'));
    n1 = PAGELOG.length; await saveRec(); fact('customer', last(n1, /§CRUD validate key=c_bpartner /) + ' persist=' + (last(n1, /§CRUD-PERSIST key=c_bpartner /) ? 'yes' : 'NO'));
    // 8 address via the Location editor
    L = nextLang(); await beat('s08', L, 'address: Location editor'); await setLang(L, 'session');
    await hclick(TAB('C_BPartner_Location')); await page.waitForTimeout(700); await newRecord();
    await hclick('#idmp-inline-mount [data-loc-edit="c_location_id"]'); await hold(400);
    for (const [k, v] of [['address1', 'Jalan Ampang 1'], ['city', 'Kuala Lumpur'], ['postal', '50450']]) await htype('#idmp-inline-mount [data-loc="' + k + '"]', v);
    const MY = Number(await one("SELECT C_Country_ID FROM C_Country WHERE CountryCode='MY'")); await hselect('#idmp-inline-mount [data-loc="c_country_id"]', MY);
    n1 = PAGELOG.length; await hclick('#idmp-inline-mount [data-loc-ok="c_location_id"]'); await page.waitForTimeout(900);
    fact('location', last(n1, /§LOC-EDITOR created/)); n1 = PAGELOG.length; await saveRec();
    fact('bpLocation', last(n1, /§CRUD validate key=c_bpartner_location /) + ' persist=' + (last(n1, /§CRUD-PERSIST key=c_bpartner_location /) ? 'yes' : 'NO'));
    // 9 vendor
    L = nextLang(); await beat('s09', L, 'vendor Kedai Bekalan'); await setLang(L, 'session');
    await hclick(TAB('C_BPartner')); await page.waitForTimeout(700); await newRecord();
    if (own) await hselect(F('ad_org_id', 'select'), own.v); if (grp) await hselect(F('c_bp_group_id', 'select'), grp.v);
    await htype(F('value'), 'V-001'); await htype(F('name'), 'Kedai Bekalan Sdn Bhd');
    if (!(await page.locator(F('isvendor')).first().isChecked())) await hclick(F('isvendor'));
    n1 = PAGELOG.length; await saveRec(); fact('vendor', last(n1, /§CRUD validate key=c_bpartner /) + ' persist=' + (last(n1, /§CRUD-PERSIST key=c_bpartner /) ? 'yes' : 'NO'));
    // 10 price list: tick "Sales Price list" (the iDempiere step, spec §FS2j)
    L = nextLang(); await beat('s10', L, 'price list: Sales Price list'); await setLang(L, 'session');
    const PL = Number(await one("SELECT M_PriceList_ID FROM M_PriceList WHERE IsDefault='Y' AND IsActive='Y' AND AD_Client_ID=" + CID + ' ORDER BY M_PriceList_ID LIMIT 1'));
    await openWin('Price List');
    fact('plGrid', JSON.stringify(await page.$$eval('tr[data-ad-record]', e => e.map(x => x.getAttribute('data-ad-record')))) + ' want=' + PL + ' status=' + await status());
    await toForm();
    fact('plForm', JSON.stringify(await page.$$eval('#idmp-inline-mount [data-col]', e => e.filter(x => x.tagName !== 'SPAN').map(x => x.getAttribute('data-col')))).slice(0, 280));
    const soWas = await page.locator(F('issopricelist')).first().isChecked({ timeout: 4000 }); fact('issopricelistBefore', soWas);
    if (!soWas) await hclick(F('issopricelist'));
    fact('issopricelistAfter', await page.locator(F('issopricelist')).first().isChecked());
    fact('saveBtn', JSON.stringify(await page.$$eval('#idmp-toolbar button', e => e.map(b => [b.title, b.disabled]))).slice(0, 300));
    n1 = PAGELOG.length; await saveRec(); fact('priceList', PL + ' ' + last(n1, /§CRUD validate key=m_pricelist /)); fact('plSaveLog', PAGELOG.slice(n1).join(' ‖ ').slice(0, 400));
    // 11 sales order header
    L = nextLang(); await beat('s11', L, 'sales order: Acme, Standard Order'); await setLang(L, 'session');
    await openWin('Sales Order'); await newRecord();
    const bpo = await opts('c_bpartner_id'); fact('bpOptions', JSON.stringify(bpo).slice(0, 250));
    const acme = bpo.find(o => /Acme Retail/.test(o.t)); if (!acme) throw new Error('Acme not offered'); await hselect(F('c_bpartner_id', 'select'), acme.v);
    const STD = Number(await one("SELECT C_DocType_ID FROM C_DocType WHERE AD_Client_ID=" + CID + " AND Name='Standard Order'"));
    const std = (await opts('c_doctypetarget_id')).find(o => Number(o.v) === STD); fact('stdDocType', STD + ' ' + (std ? std.t : 'NOT OFFERED'));
    if (std) await hselect(F('c_doctypetarget_id', 'select'), std.v);
    n1 = PAGELOG.length; await saveRec();
    fact('order', last(n1, /§CRUD validate key=c_order /) + ' persist=' + (last(n1, /§CRUD-PERSIST key=c_order /) ? 'yes' : 'NO'));
    const ORD = Number((/§CRUD-CREATE-SEL table=c_order id=(-?\d+)/.exec(last(n1, /§CRUD-CREATE-SEL table=c_order /)) || [])[1]); fact('orderId', ORD);
    // 12 order line: product → price derived
    L = nextLang(); await beat('s12', L, 'order line: price derived'); await setLang(L, 'session');
    await hclick(TAB('C_OrderLine')); await page.waitForTimeout(700); await newRecord();
    const prod = await one('SELECT M_Product_ID FROM M_Product WHERE AD_Client_ID=' + CID + ' ORDER BY M_Product_ID LIMIT 1');
    n1 = PAGELOG.length; await hselect(F('m_product_id', 'select'), prod); await page.waitForTimeout(500);
    fact('fs6', (PAGELOG.slice(n1).filter(l => /§FS6-(PRICE|TAX)/.test(l)).join(' | ')).slice(0, 280));
    fact('derived', JSON.stringify(await page.evaluate(() => { const g = c => { const e = document.querySelector('#idmp-inline-mount [data-col="' + c + '"]'); return e ? (e.tagName === 'SELECT' ? (e.options[e.selectedIndex] || {}).text : e.value) : null; }; return { price: g('priceentered'), uom: g('c_uom_id'), tax: g('c_tax_id') }; })));
    await htype(F('qtyentered'), '2'); n1 = PAGELOG.length; await saveRec();
    fact('line', last(n1, /§CRUD validate key=c_orderline/) + ' persist=' + (last(n1, /§CRUD-PERSIST key=c_orderline/) ? 'yes' : 'NO'));
    // 13 complete
    L = nextLang(); await beat('s13', L, 'Complete'); await setLang(L, 'session');
    await hclick(TAB('C_Order')); await page.waitForTimeout(700); fact('orderGrid', JSON.stringify(await page.$$eval('tr[data-ad-record]', e => e.map(x => x.getAttribute('data-ad-record'))))); await toForm();
    n1 = PAGELOG.length; await hclick('[data-doc-action="CO"]'); await page.waitForTimeout(2200);
    fact('complete', last(n1, /§CRUD process committed key=c_order/) || 'NONE'); fact('docStatus', await page.evaluate(id => { const c = window.__crud; try { return c.readTip('c_order', id); } catch (e) { return 'ERR'; } }, ORD));
    // 14 backup — signed, through the Help (show me) panel
    L = nextLang(); await beat('s14', L, 'backup'); await setLang(L, 'session');
    await hclick('#idmp-pill-trigger'); await page.waitForTimeout(500); await hclick('#pill-showme'); fact('backupOpen', 'Pills → #pill-showme');
    await page.waitForTimeout(600); await hclick('.adq-segb[data-tab="diy"]').catch(() => {}); await page.waitForTimeout(500);
    n1 = PAGELOG.length;
    const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 15000 }).catch(() => null), hclick('[data-erp-backup] .persist-btn')]);
    fact('backup', (last(n1, /§INTEG-WIRE-B backup/) || 'NONE') + ' file=' + (dl ? dl.suggestedFilename() : 'none'));
    await hold(1200);
    // 15 closing glance: switch once more, the whole menu in that language
    L = nextLang(); await beat('s15', L, 'closing'); await page.keyboard.press('Escape').catch(() => {}); await hold(400); await setLang(L, 'session'); await hold(1500);
    await beat('end', L, '');
    say('§ERP_FILM_CURSOR clicks=' + clicks + ' cursorOnTarget=' + cursorOk + (clicks === cursorOk ? ' OK' : ' WRONG'));
  } catch (e) { say('§ERP_FILM_ERROR ' + e.message.split('\n')[0]); }

  await cdp.send('Page.stopScreencast').catch(() => {}); await hold(300);
  const endTs = Date.now() / 1000;
  fs.writeFileSync(path.join(OUT, 'erp_film.page.log'), PAGELOG.join('\n') + '\n');
  const lines = [];
  frames.forEach((f, i) => { const d = (i + 1 < frames.length ? frames[i + 1].ts : endTs) - f.ts; lines.push(`file '${f.fn}'`, `duration ${Math.max(d, 0.001).toFixed(4)}`); });
  if (frames.length) lines.push(`file '${frames[frames.length - 1].fn}'`);
  fs.writeFileSync(path.join(OUT, 'frames.txt'), lines.join('\n') + '\n');
  const mp4 = path.join(OUT, 'erp_film_polyglot.mp4');
  try {
    execFileSync('ffmpeg', ['-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', path.join(OUT, 'frames.txt'),
      '-vf', 'fps=24,scale=1920:1080:flags=lanczos,format=yuv420p', '-c:v', 'libx264', '-crf', '17', '-preset', 'medium', mp4]);
    say('§ERP_FILM_DONE frames=' + frames.length + ' dur=' + (endTs - (T0 || endTs)).toFixed(2) + ' out=' + mp4);
  } catch (e) { say('§ERP_FILM_ERROR ffmpeg ' + String(e.message).split('\n')[0]); }
  fs.writeFileSync(path.join(OUT, 'erp_film.log'), LOG.join('\n') + '\n');
  await browser.close(); server.close();
})();
