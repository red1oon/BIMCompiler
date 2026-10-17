// ⚠ DO NOT REMOVE — Scope guard
// Scope: §ERP-DEPTH-FILM §FILM-WS "Web services, and AI the safe way" (user 2026-10-17: a film on the WebServices plugin + the agentic-AI advisory with its sample prompt) (user 2026-10-17: chapter cards - proven AD datamodel, L&F verbatim = no learning curve, extras in plugins + pill tray):
//   the costing method is a schema setting that changes the books; the sweep of the twin vs the real DocManager (witness_costing_sweep.js); what happens when costing
//   cannot post (Posted=E + AD_Note). Cards then a LIVE clip; navigation happens behind the cards. ONE take, CPU only. Every number spoken is a §ERP_FILM_FACT read while recording
//   (pilot psql, the witnesses run during the take, the in-browser DB / screen). Helpers reused unchanged from scripts/film_erp_gap2.js.
// §-log first — READ <out>/erp_film.log (beats + facts) and <out>/erp_film.page.log before any conclusion. Exit code is not evidence.
// Run:  ERP_REPO=<worktree> [BEAT_MIN='{"h0":9.1,…}'] node scripts/film_erp_costing.js <outDir>   → <outDir>/erp_film_ws.mp4 (24 fps, 1920×1080)
'use strict';
const { chromium } = require(require('os').homedir() + '/bim-ootb/tests/node_modules/playwright');
const http = require('http'), fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');

const REPO = process.env.ERP_REPO || path.join(require('os').homedir(), 'bim-ootb');   // ERP_REPO = a worktree, to film a fix before it merges
const OUT = path.resolve(process.argv[2] || '.'); const FR = path.join(OUT, 'frames'); fs.mkdirSync(FR, { recursive: true });
const FL = process.env.FILM_LANG || 'en';   // FILM_LANG=zh: Chinese chapter/census cards (UI stays the dictionary's English; narration + subtitles carry the language)
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
  const fact = (k, v) => say('§ERP_FILM_FACT ' + k + '=' + String(v).replace(/\s+/g, ' ').slice(0, 320) + (() => { try { return T0 !== null ? '  @' + now().toFixed(1) : ''; } catch (e) { return ''; } })());

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
    const HOME = require('os').homedir(), EVD = path.join(HOME, 'Videos', 'ws_work', 'evidence');
    const pgq = (sql) => { try { return execFileSync('docker', ['exec', '-i', 'postgres', 'psql', '-U', 'postgres', '-d', 'idempiere_pilot', '-tA', '-c', 'set search_path=adempiere;' + sql], { encoding: 'utf8' }).split('\n').filter(l => l && l !== 'SET')[0]; } catch (e) { return 'ERR'; } };
    const runWA = (file, args) => { try { return execFileSync('node', [path.join(REPO, 'erp', 'tests', file)].concat(args || []), { encoding: 'utf8', maxBuffer: 1 << 26, cwd: path.join(REPO, 'erp') }); } catch (e) { return String(e.stdout || ''); } };
    const dbq = async (sql) => { const r = await page.evaluate(s => { try { const r = window.__idmpDb.exec(s); return r.length ? r[0].values : []; } catch (e) { return 'ERR ' + e.message; } }, sql); return Array.isArray(r) && r.length && Array.isArray(r[0]) ? r[0][0] : r; };
    const login = async (client, user) => {
      await hclick("#idmp-login-clients .idmp-login-user:has(.nm:text-is('" + client + "'))"); await page.waitForSelector('#idmp-login-step1:visible'); await hold(400);
      await hclick("#idmp-login-users .idmp-login-user:has(.nm:text-is('" + user + "'))"); await page.waitForSelector('#idmp-login-step2:visible'); await hold(400);
      await hclick('#idmp-login-ok');
      await page.waitForFunction(() => document.querySelector('#idmp-tree') && document.querySelector('#idmp-tree').children.length > 0, null, { timeout: 15000 }); await hold(500);
    };
    // a window opened through its menu leaf WITHOUT visible motion (a card covers the screen)
    const openPlain = async (wid) => {
      const mid = await page.evaluate(w => { const r = window.__idmpDb.exec("SELECT AD_Menu_ID FROM AD_Menu WHERE Action='W' AND AD_Window_ID=" + w + " AND IsActive='Y'"); return (r.length ? r[0].values.map(x => x[0]) : []).find(i => document.querySelector('#idmp-tree .idmp-row.leaf[data-menu-id="' + i + '"]')) || null; }, wid);
      if (!mid) throw new Error('window ' + wid + ' not in this role\'s menu');
      await page.evaluate(id => { const leaf = document.querySelector('#idmp-tree .idmp-row.leaf[data-menu-id="' + id + '"]'); let n = leaf.parentElement; while (n && n.id !== 'idmp-tree') { if (n.classList && n.classList.contains('idmp-node')) n.classList.add('open'); n = n.parentElement; } }, mid);
      await page.evaluate(id => document.querySelector('#idmp-tree .idmp-row.leaf[data-menu-id="' + id + '"]').click(), mid);
      await page.waitForSelector(NEWB, { timeout: 20000, state: 'attached' }); await hold(900); return mid;
    };
    const findOk = async (plain) => { if (await page.locator('#idmp-find-ov').count()) { if (plain) await page.click('#idmp-find-ov [data-find-ok]'); else { await hold(1200); await hclick('#idmp-find-ov [data-find-ok]'); } await hold(1000); return true; } return false; };
    // a generic card (N columns) that REPLACES any card in the same tick; tones: legacy blue, twin green when equal else amber
    const card = async (title, sub, heads, rows) => {
      for (const r of rows) fact('card.' + title.replace(/\W+/g, '_').slice(0, 24) + '.' + String(r[0]).replace(/\W+/g, '_').slice(0, 30), r.slice(1).map(c => c.v).join(' | '));
      await page.evaluate(({ title, sub, heads, rows }) => {
        const old = document.getElementById('__ledger'); if (old) old.remove();
        const d = document.createElement('div'); d.id = '__ledger';
        d.style.cssText = 'position:fixed;inset:0;z-index:2147483000;background:#10151c;color:#e8edf3;font-family:Noto Sans CJK SC,DejaVu Sans,Arial,sans-serif;display:flex;flex-direction:column;justify-content:center;padding:0 90px';
        const tone = { L: '#7fd1ff', B: '#ff9b8a', G: '#7ee0a0', A: '#ffd479', N: '#c9d4e0' };
        const cell = (c) => '<td style="padding:12px 20px;text-align:center;font-size:40px;font-weight:700;color:' + (tone[c.t] || tone.N) + '">' + c.v + (c.s ? '<div style="font-size:16px;font-weight:400;color:#8fa0b3;margin-top:4px">' + c.s + '</div>' : '') + '</td>';
        d.innerHTML = '<div style="font-size:21px;letter-spacing:.14em;color:#8fa0b3;text-transform:uppercase">'+(window.__K||'Why iDempiere, exactly')+'</div><div style="font-size:48px;font-weight:700;margin:6px 0 4px">' + title + '</div><div style="font-size:22px;color:#b8c4d2;margin-bottom:26px">' + sub + '</div>' +
          '<table style="border-collapse:collapse;width:100%"><tr style="font-size:20px;color:#8fa0b3"><td></td>' + heads.map(h => '<td style="text-align:center;padding:6px 20px">' + h + '</td>').join('') + '</tr>' +
          rows.map(r => '<tr style="border-top:1px solid #243040"><td style="padding:12px 20px;font-size:25px;color:#c9d4e0;width:32%">' + r[0] + '</td>' + r.slice(1).map(cell).join('') + '</tr>').join('') + '</table>';
        document.body.appendChild(d);
      }, { title, sub, heads, rows });
    };
    const uncard = async () => { await page.evaluate(() => { const d = document.getElementById('__ledger'); if (d) d.remove(); }); };
    const cardFor = async (floorMs) => { const need = ((MIN[prev.id] || 0) - (now() - prev.t)) * 1000; if (need > 0 || floorMs) await hold(Math.max(floorMs || 0, need)); };
    const liveFor = cardFor;
    const V = (v, t, s) => ({ v: String(v), t: t || 'N', s: s || null });



    const ZHT = { kicker: '为什么完全照搬 iDempiere', c0: ['久经验证的数据模型', ['一个应用字典：每个窗口、栏位、流程和单据都是其中的一行', '久经验证，所以我们一行一行照着做，而不是另起炉灶']],
      c1: ['一行一行对照', '在真正的 iDempiere 和浏览器孪生中，数出的有效字典行数', ['真正的 iDempiere', '浏览器孪生'], { ad_table: '表', ad_column: '列', ad_field: '栏位', ad_process: '流程', ad_menu: '菜单项', ad_window: '窗口', ad_tab: '标签页' }, '一致'],
      c2: ['一样的外观和操作', ['菜单树、窗口、标签页、表格和表单', '工具栏：同样的图标、同样的顺序、同样的提示文字', '原样照搬，所以没有学习成本']],
      c3: ['扩展功能放在旁边', ['扩展功能放在药丸托盘里', '较大的模块以插件形式加入', 'iDempiere 自己的界面从不被改动']], end: ['学一次就够', ['同一个字典。同一套界面。同样的习惯。', '扩展功能从不碍事']] };
    const K = FL === 'zh' ? ZHT.kicker : 'Why iDempiere, exactly';
    // chapter card: kicker / title / bullet lines (dark house style); REPLACES any card in the same tick
    const chapter = async (kicker, title, lines) => {
      fact('chapter.' + title.replace(/\W+/g, '_').slice(0, 30), lines.join(' | '));
      await page.evaluate(({ kicker, title, lines }) => {
        const old = document.getElementById('__ledger'); if (old) old.remove();
        const d = document.createElement('div'); d.id = '__ledger';
        d.style.cssText = 'position:fixed;inset:0;z-index:2147483000;background:#000;color:#ebeef2;font-family:Noto Sans CJK SC,Noto Sans,DejaVu Sans,Arial,sans-serif;display:flex;flex-direction:column;justify-content:center;padding:0 140px';
        d.innerHTML = '<div style="font-size:30px;font-weight:700;letter-spacing:.12em;color:#ff8c1a;text-transform:uppercase">' + kicker + '</div><div style="font-size:92px;font-weight:700;margin:18px 0 34px;color:#4fc3f7">' + title + '</div>' +
          lines.map(l => '<div style="font-size:38px;color:#c9d4e0;margin:10px 0;padding-left:26px;border-left:6px solid #ff8c1a">' + l + '</div>').join('');
        document.body.appendChild(d);
      }, { kicker, title, lines });
    };


    // ── terminal-style card: a command and the REAL output captured while preparing this take ──
    const term = async (kicker, title, blocks) => {
      blocks.forEach((b, i) => fact('term.' + title.replace(/\W+/g, '_').slice(0, 24) + '.' + i, (b.cmd ? '$ ' + b.cmd + ' | ' : '') + b.out.join(' / ').slice(0, 300)));
      await page.evaluate(({ kicker, title, blocks }) => {
        const old = document.getElementById('__ledger'); if (old) old.remove();
        const d = document.createElement('div'); d.id = '__ledger';
        d.style.cssText = 'position:fixed;inset:0;z-index:2147483000;background:#0b0f14;color:#dbe4ee;font-family:DejaVu Sans,Arial,sans-serif;display:flex;flex-direction:column;justify-content:center;padding:0 90px';
        const e = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
        d.innerHTML = '<div style="font-size:24px;letter-spacing:.14em;color:#ff8c1a;text-transform:uppercase;font-weight:700">' + e(kicker) + '</div><div style="font-size:56px;font-weight:700;margin:6px 0 20px;color:#4fc3f7">' + e(title) + '</div>' +
          blocks.map(b => '<div style="background:#111823;border:1px solid #243040;border-radius:8px;padding:14px 20px;margin:8px 0;font-family:DejaVu Sans Mono,monospace;font-size:23px;line-height:1.5;white-space:pre-wrap;word-break:break-all">' +
            (b.cmd ? '<div style="color:#7ee0a0">$ ' + e(b.cmd) + '</div>' : '') + b.out.map(o => '<div style="color:' + (/refused|invalid|not allowed|404|broken|does not have/i.test(o) ? '#ffb4a8' : '#c9d4e0') + '">' + e(o) + '</div>').join('') + '</div>').join('');
        document.body.appendChild(d);
      }, { kicker, title, blocks });
    };
    const KICK = 'ERP web services'; await page.evaluate(k => { window.__K = k; }, KICK);
    // ── everything below is REAL: it runs the advisory's own commands and requests against a real host before the camera rolls, and the cards show what came back ──
    const fs2 = require('fs'), os2 = require('os'), pth = path;
    const ERPDIR = path.join(REPO, 'erp'), Agent = require(path.join(ERPDIR, 'ws_agent.js')), WSS = require(path.join(ERPDIR, 'ws_server.js')), WK = require(path.join(ERPDIR, 'ws_kernel.js'));
    const DOC = fs2.readFileSync(path.join(os2.homedir(), 'bim-compiler', 'docs', 'ERP_AI_ADVISORY.md'), 'utf8');
    const diffs = {}; ['read', 'write', 'docaction', 'process', 'json'].forEach(k => { const o = runWA('witness_ws_diff_' + k + '.js', []); const mm = /§WS[A-Z]_VERDICT (\w+) judged=(\d+) failed=(\d+)/.exec(o); diffs[k] = mm ? mm[1] + ' ' + (Number(mm[2]) - Number(mm[3])) + '/' + mm[2] : 'NO VERDICT'; }); fact('diffWitnesses', JSON.stringify(diffs));
    const tmpd = fs2.mkdtempSync(path.join(os2.tmpdir(), 'wsfilm-')), cfgF = path.join(tmpd, 'ws_host.json'), jrF = path.join(tmpd, 'ws_journal.jsonl');
    const cmdLine = (DOC.match(/```bash\n([\s\S]*?)```/g) || []).map(b => b.replace(/```bash\n|```/g, '')).find(b => /ws_agent\.js create/.test(b));
    const argv = cmdLine.replace(/\\\n/g, ' ').trim().split('\n').find(l => /ws_agent\.js create/.test(l)).match(/"[^"]*"|'[^']*'|\S+/g).slice(3), ao = Agent.args(argv); ao.dir = path.join(tmpd, 'agents');
    const agent = await Agent.create(ao), CR = agent.creds; fact('agent', JSON.stringify({ user: CR.user, roleId: CR.roleId, orgId: CR.orgId, types: CR.serviceTypes, canWrite: CR.canWrite }));
    let refusedFinal = ''; try { const o2 = Agent.args(argv.concat(['--docaction', 'C_Order:CO'])); o2.dir = ao.dir; o2.name = 'x-final'; await Agent.create(o2); } catch (e) { refusedFinal = e.message; } fact('refusedFinal', refusedFinal);
    fs2.writeFileSync(cfgF, JSON.stringify({ plugin: 'org.idempiere.webservices', state: 'ACTIVE' }));
    const srv = await WSS.start(0, [], { config: cfgF, agentsDir: ao.dir, journal: jrF }), HB = 'http://127.0.0.1:' + srv.address().port, KK = srv.kernel; await new Promise(r => setTimeout(r, 900));
    const vars = { USER: CR.user, PASS: CR.pass, CLIENT: CR.clientId, ROLE: CR.roleId, ORG: CR.orgId, WH: CR.warehouseId }, calls = {};
    const re = /<!-- ws-run ([^>]*?) -->\s*```(xml|json)\n([\s\S]*?)```/g; let mr;
    while ((mr = re.exec(DOC))) {
      const a = {}; (mr[1].match(/(\w[\w-]*)=("[^"]*"|\S+)/g) || []).forEach(kv => { const i = kv.indexOf('='); a[kv.slice(0, i)] = kv.slice(i + 1).replace(/^"|"$/g, ''); });
      const bodyS = mr[3].replace(/\{\{(\w+)\}\}/g, (x, k) => (vars[k] != null ? vars[k] : x)), json = a.format === 'json';
      const r = await fetch(HB + '/ADInterface/services/rest/model_adservice/' + a.method, { method: 'POST', headers: { 'Content-Type': json ? 'application/json' : 'application/xml' }, body: bodyS }), t = await r.text();
      if (a.capture) { const id = (/RecordID="?(\d+)/.exec(t) || [])[1]; if (id) vars[a.capture] = id; } calls[a.id] = { method: a.method, answer: t };
    }
    const order = KK.one('SELECT docstatus, docaction, grandtotal FROM c_order WHERE c_order_id=?', [Number(vars.ORDER_ID)]); fact('orderAfterAI', JSON.stringify(order));
    const ver = WK.verifyJournal(fs2.readFileSync(jrF, 'utf8')); fact('journal', JSON.stringify(ver));
    const jl = fs2.readFileSync(jrF, 'utf8').split('\n').filter(Boolean); const bad = jl.slice(); const e0 = JSON.parse(bad[0]); e0.actor = 'ws:someone-else/client:11/role:1'; bad[0] = JSON.stringify(e0); const ver2 = WK.verifyJournal(bad.join('\n') + '\n'); fact('journalTampered', JSON.stringify(ver2));
    Agent.revoke({ dir: ao.dir, name: CR.user }); await new Promise(r => setTimeout(r, 900));
    const after = await (await fetch(HB + '/ADInterface/services/rest/model_adservice/query_data', { method: 'POST', headers: { 'Content-Type': 'application/xml' }, body: DOC.match(/<!-- ws-run id=read-partner method[\s\S]*?```xml\n([\s\S]*?)```/)[1].replace(/\{\{(\w+)\}\}/g, (x, k) => vars[k]) })).text();
    const afterErr = (/<_0:Error>([^<]*)/.exec(after) || [])[1]; fact('afterRevoke', afterErr);
    fs2.writeFileSync(cfgF, JSON.stringify({ state: 'STOPPED' })); const darkS = (await fetch(HB + '/ADInterface/services/rest/model_adservice/query_data', { method: 'POST', body: '<x/>' })).status; fact('hostWhenStopped', darkS);
    const sysPrompt = (DOC.match(/```text\n([\s\S]*?)```/) || [])[1] || '', pr = sysPrompt.split('\n').filter(l => /^\d\./.test(l.trim())).map(l => l.trim());
    const oneLine = (t, n) => (/<html/.test(t) ? ('HTTP 500  ' + ((/IdempiereServiceFault: ([^<]*)/.exec(t) || [, ''])[1])) : String(t)).replace(/<\?xml[^>]*\?>\s*/, '').replace(/\s+xmlns:_0="[^"]*"/, '').replace(/_0:/g, '').replace(/\s+/g, ' ').slice(0, n || 150);
    const stockRow = await page.evaluate(() => { const q = (s) => window.__idmpDb.exec(s)[0].values[0][0]; return { types: Number(q("SELECT count(*) FROM ws_webservicetype WHERE isactive='Y'")), defaultCred: Number(q("SELECT count(*) FROM ad_user u JOIN ad_user_roles ur ON ur.ad_user_id=u.ad_user_id JOIN ad_role r ON r.ad_role_id=ur.ad_role_id WHERE r.roletype='WS' AND u.isactive='Y' AND u.password=u.name")) }; });
    fact('stock', JSON.stringify(stockRow));

    // ===== GardenAdmin =====
    await login('GardenWorld', 'GardenAdmin'); await castOn(page); await page.mouse.move(720, 400); await hold(600);
    await beat('c0', 'en', 'chapter: same web service as iDempiere');
    await card('Same requests, same answers', 'The same requests sent to real iDempiere and to the twin; the answers compared field by field', ['Identical'], [
      ['Read records', [V(diffs.read, 'G')]], ['Create / update / delete', [V(diffs.write, 'G')]], ['Document actions (Complete, Void)', [V(diffs.docaction, 'G')]], ['Run a process', [V(diffs.process, 'G')]], ['The JSON door', [V(diffs.json, 'G')]]].map(r => [r[0]].concat(r[1])));
    await cardFor();
    await beat('c1', 'en', 'live: Plugin Engine, Web Services installed but stopped'); await uncard();
    await hold(600); await pill('plugin'); await hold(1500);
    const rowSel = '.pe-row:has-text("org.idempiere.webservices")';
    fact('plugin.before', await page.$eval(rowSel + ' .pe-chip', e => e.textContent).catch(() => 'ROW NOT FOUND') + ' / button ' + await page.$eval(rowSel + ' .pe-toggle', e => e.textContent).catch(() => '?'));
    await hold(2600); await hclick(rowSel + ' .pe-toggle'); await hold(1800);
    fact('plugin.after', await page.$eval(rowSel + ' .pe-chip', e => e.textContent).catch(() => 'ROW NOT FOUND'));
    await hold(1200); await page.keyboard.press('Escape'); await page.evaluate(() => { const c = document.querySelector('#pe-card .pe-x, .pe-x'); if (c) c.click(); }); await hold(800);
    fact('pill.webservices', await page.locator('#pill-webservices').count());
    await beat('c1b', 'en', 'live: Web Services pill panel'); await pill('webservices'); await page.waitForSelector('#idmp-ws-panel', { timeout: 8000 }); await hold(3500);
    fact('panel', await page.$eval('#idmp-ws-panel', e => e.innerText.replace(/\s+/g, ' ').slice(0, 330)));
    await hold(2200); await hclick('#idmp-ws-panel [data-ws="export"]'); await hold(1800);
    await beat('c2', 'en', 'chapter: six rules'); await page.evaluate(() => { const p = document.getElementById('idmp-ws-panel'); if (p) p.remove(); });
    await chapter(KICK, 'Six rules for an AI', ['Off until you switch it on', 'Its own identity, one organisation', 'Only the service types you name', 'Drafts, never finishing', 'Everything recorded under its name', 'One switch stops it']);
    await cardFor();
    await beat('c3', 'en', 'terminal: identity');
    await term(KICK, 'Step 2: the AI gets its own identity', [
      { cmd: 'node erp/ws_agent.js create --dir agents --name sales-assistant --write --read C_BPartner:... --read C_Order:... --create C_Order:... --create C_OrderLine:... --docaction C_Order:PR', out: ['§WS-AGENT created agents/agent-000-sales-assistant.sql', 'user: ' + CR.user + '   password: ' + '•'.repeat(12) + '   role ' + CR.roleId + '   org ' + CR.orgId, 'service types: ' + CR.serviceTypes.join(', ')] },
      { cmd: 'node erp/ws_agent.js create ... --docaction C_Order:CO', out: [refusedFinal] }]);
    await cardFor();
    await beat('c4', 'en', 'terminal: host and first read');
    await term(KICK, 'Step 3 and 4: start the host, first read', [
      { cmd: 'node erp/ws_server.js 8089 --config ws_host.json --agents agents --journal ws_journal.jsonl', out: ['§WS listening port=8089 plugin=ACTIVE'] },
      { cmd: 'POST .../model_adservice/query_data   (AI_Query_C_BPartner, value=\'C&W\')', out: [oneLine(calls['read-partner'].answer, 330)] },
      { cmd: 'the same, asking for a column the type does not allow', out: [oneLine(calls['read-not-allowed'].answer, 200)] }]);
    await cardFor();
    await beat('c5', 'en', 'chapter: the sample prompt');
    await chapter(KICK, 'The sample prompt', pr.slice(0, 7).map(s => s.length > 118 ? s.slice(0, 115) + '...' : s));
    await cardFor();
    await beat('c6', 'en', 'terminal: the draft order');
    await term(KICK, 'Draft an order, never complete it', [
      { cmd: 'create_data   AI_Create_C_Order', out: [oneLine(calls['create-order'].answer, 140)] },
      { cmd: 'create_data   AI_Create_C_OrderLine', out: [oneLine(calls['create-line'].answer, 140)] },
      { cmd: 'set_docaction AI_DocAction_C_Order_PR   docAction=PR', out: [oneLine(calls['prepare-order'].answer, 140)] },
      { cmd: 'set_docaction AI_DocAction_C_Order_PR   docAction=CO   (asking it to complete)', out: [oneLine(calls['try-complete'].answer, 140), 'order read back: DocStatus=' + order.docstatus + '  DocAction=' + order.docaction + '  GrandTotal=' + order.grandtotal + '   (not completed)'] },
      { cmd: 'create_data   CreateBPartner   (a type nobody granted)', out: [(/<_0:Error>([^<]*)/.exec(calls['not-granted'].answer) || [])[1]] }]);
    await cardFor();
    await beat('c7', 'en', 'terminal: audit');
    await term(KICK, 'Everything under its name', [
      { cmd: 'node erp/ws_agent.js audit --journal ws_journal.jsonl', out: ['§WS-AUDIT ' + JSON.stringify({ ok: ver.ok, entries: ver.entries, actors: ver.actors })] },
      { cmd: '(one journal line edited by hand)', out: ['§WS-AUDIT ' + JSON.stringify({ ok: ver2.ok, brokenAt: ver2.brokenAt, why: ver2.why }) + '   chain broken at line ' + ver2.brokenAt] }]);
    await cardFor();
    await beat('c8', 'en', 'terminal: stop it');
    await term(KICK, 'One switch stops it', [
      { cmd: 'node erp/ws_agent.js revoke --dir agents --name sales-assistant', out: ['the next call: ' + afterErr] },
      { cmd: 'Stop the Web Services plugin (ws_host.json state = STOPPED)', out: ['the host answers HTTP ' + darkS + ' to every request'] }]);
    await cardFor();
    await beat('c9', 'en', 'live: stop the plugin'); await uncard();
    if (!(await page.locator('.pe-row:has-text("org.idempiere.webservices")').count())) { await pill('plugin'); await hold(1500); }
    await hclick(rowSel + ' .pe-toggle'); await hold(1800);
    fact('plugin.stopped', await page.$eval(rowSel + ' .pe-chip', e => e.textContent).catch(() => '?')); await hold(1800);
    await page.evaluate(() => { const c = document.querySelector('.pe-x'); if (c) c.click(); }); await hold(600);
    fact('pill.afterStop', await page.locator('#pill-webservices').count());
    await beat('end', 'en', 'closing'); await chapter(KICK, 'Off by default. Safe by design.', ['Its own identity. Only what you grant.', 'Drafts, not finishing. A person completes.', 'Everything recorded. One switch stops it.']); await hold(6500); await beat('fin', 'en', '');
    srv.close();

    say('§ERP_FILM_CURSOR clicks=' + clicks + ' cursorOnTarget=' + cursorOk + (clicks === cursorOk ? ' OK' : ' WRONG'));
  } catch (e) { say('§ERP_FILM_ERROR ' + e.message.split('\n').slice(0, 4).join(' | ')); try { say('§ERP_FILM_DEBUG ' + JSON.stringify(await page.evaluate(() => ({ win: (document.querySelector('.idmp-wintab.active .lbl') || {}).textContent, status: (document.getElementById('idmp-status') || {}).innerText, tb: [...document.querySelectorAll('#idmp-toolbar [data-tb]')].map(b => b.getAttribute('data-tb') + (b.disabled ? '(dis)' : '')), tabs: [...document.querySelectorAll('#idmp-tabstrip .idmp-adtab')].map(t => t.title), ov: !!document.getElementById('__ledger'), form: !!document.getElementById('idmp-form'), inline: !!document.getElementById('idmp-inline-mount') })))); } catch (e2) {} }
  if (cdp) await cdp.send('Page.stopScreencast').catch(() => {}); await page.waitForTimeout(300).catch(() => {});
  const endTs = Date.now() / 1000;
  fs.writeFileSync(path.join(OUT, 'erp_film.page.log'), PAGELOG.join('\n') + '\n');
  const lines = [];
  frames.forEach((f, i) => { const d = (i + 1 < frames.length ? frames[i + 1].ts : endTs) - f.ts; lines.push(`file '${f.fn}'`, `duration ${Math.max(d, 0.001).toFixed(4)}`); });
  if (frames.length) lines.push(`file '${frames[frames.length - 1].fn}'`);
  fs.writeFileSync(path.join(OUT, 'frames.txt'), lines.join('\n') + '\n');
  const mp4 = path.join(OUT, 'erp_film_ws.mp4');
  try {
    execFileSync('ffmpeg', ['-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', path.join(OUT, 'frames.txt'),
      '-vf', 'fps=24,scale=1920:1080:flags=lanczos,format=yuv420p', '-c:v', 'libx264', '-crf', '17', '-preset', 'medium', mp4]);
    say('§ERP_FILM_DONE frames=' + frames.length + ' dur=' + (endTs - (T0 || endTs)).toFixed(2) + ' out=' + mp4);
  } catch (e) { say('§ERP_FILM_ERROR ffmpeg ' + String(e.message).split('\n')[0]); }
  fs.writeFileSync(path.join(OUT, 'erp_film.log'), LOG.join('\n') + '\n');
  await browser.close(); server.close();
})();


