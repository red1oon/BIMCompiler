// ⚠ DO NOT REMOVE — Scope guard
// Scope: film "Purchasing and Stock Replenishment" (owner 2026-10-23: "short film just on the new material" since the 2026-10-17 films; conversational, newbies; chapter cards).
//   Chapters: A buying (plugin install from Plugins & Releases, a purchase order, the long way = Create Lines From, the shortcut = Receive / Create Bill from the gear)
//             B stock between shops (in-transit Inventory Move, Move Confirmation with a lost and a scrapped quantity, the two inventory documents, stock before/after)
//             C topping up (Replenish Report creating purchase orders)  D the parity card (numbers READ from persisted witness logs).
//   Sources of the claims (prompts/ERP_FRIENDLY_OPS_LENS.md §42-§70): W-CREATEFROM-INFOWIN, W-FRIENDLY-PURCHASE, W-MOVEMENT-CONFIRM, W-MOVEMENTCONFIRM-UI, W-INVENTORY, W-REPLENISH, W-PROCPARA-DYNAMIC.
// ONE take, CPU only. Cards cover set-up; every on-camera step is a visible click. Every number spoken is a §ERP_FILM_FACT read from the live in-browser DB / DOM, or a §PURCH_FACT read from a persisted witness log.
// §-log first - READ <out>/erp_film.log (beats + facts) and <out>/erp_film.page.log before any conclusion. Exit code is not evidence.
// Run:  [DRY=1] ERP_REPO=<worktree with bim-ootb #2300> [PARITY_FACTS=<facts.json>] [BEAT_MIN='{"a0":9.1,...}'] node scripts/film_erp_purchasing.js <outDir>   → <outDir>/erp_film_purch.mp4 (24 fps, 1920x1080)
// The in-transit document type is a TWIN-ONLY fixture (a copy of Material Movement with IsInTransit=Y): the legacy pilot has none and legacy is never touched (§62). The film says so.
'use strict';
const { chromium } = require(require('os').homedir() + '/bim-ootb/tests/node_modules/playwright');
const http = require('http'), fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
const HOME = require('os').homedir(), DRY = !!process.env.DRY;
const FL = process.env.FILM_LANG || 'en';   // FILM_LANG=zh: Mandarin UI (zh_CN pack, labelled machine fill for the rest) + Mandarin cards; the narration carries the language
// Thai (standing rule, ERP_DEPTH_FILM.md): Thai narration + Thai subtitles; the UI is Thai through login and the FIRST panel, then English (legacy users know the English wording).
const TH_MAP = {
  'Purchasing and Stock Replenishment': 'การจัดซื้อและการเติมสต็อก', 'Buying, step by step': 'ซื้อของ ทีละขั้นตอน', 'The shortcut': 'ทางลัด', 'Moving stock between shops': 'ย้ายสต็อกระหว่างสาขา', 'Topping up': 'เติมสต็อก',
  '["Order it","Receive it","Pay for it"]': ['สั่งซื้อ', 'รับของ', 'จ่ายเงิน'], '["The same steps, from one menu","Optional - installed a minute ago"]': ['ขั้นตอนเดิม แต่จากเมนูเดียว', 'เป็นส่วนเสริม เพิ่งติดตั้งเมื่อครู่'],
  '["An Inventory Move takes goods from one warehouse to another","On the road they are \\"in transit\\" until the shop confirms"]': ['การย้ายสินค้า คือการนำของจากคลังหนึ่งไปอีกคลังหนึ่ง', 'ระหว่างทางเรียกว่า “อยู่ระหว่างขนส่ง” จนกว่าสาขาจะยืนยัน'],
  '["Every product has a lowest and a highest stock level","The Replenish Report compares them with what is on the shelf"]': ['สินค้าทุกชนิดมีระดับสต็อกต่ำสุดและสูงสุด', 'รายงานเติมสต็อกเทียบระดับเหล่านี้กับของที่อยู่บนชั้น'],
  'Counted in this film': 'นับกันในหนังเรื่องนี้', 'A step is a click, a pick from a list or a typed field. Both ways end with the goods received.': 'หนึ่งขั้นตอน คือหนึ่งคลิก หนึ่งการเลือกจากรายการ หรือหนึ่งช่องที่พิมพ์ ทั้งสองวิธีจบที่ได้รับของเหมือนกัน',
  '["The standard way","The shortcut"]': ['วิธีมาตรฐาน', 'ทางลัด'], 'Steps to receive the goods': 'ขั้นตอนในการรับของ', 'from opening the window to lines on the receipt': 'ตั้งแต่เปิดหน้าต่างจนมีรายการในใบรับของ', 'gear, Receive, OK on the result': 'เฟือง, Receive, กดตกลง',
  'What runs underneath': 'สิ่งที่ทำงานอยู่ข้างใต้', 'the same process, one button': 'กระบวนการเดียวกัน แต่ปุ่มเดียว',
  'Where the ten went': 'ต้นไม้สิบต้นหายไปไหน', 'Elm Tree, ten sent from HQ Warehouse to Store Central. Eight arrived and one of those was scrapped. Two never arrived. Read from the stock tables.': 'Elm Tree ส่งจาก HQ Warehouse ไป Store Central สิบต้น ถึงแปดต้น และหนึ่งในนั้นถูกทิ้ง อีกสองต้นไม่ถึง ตัวเลขอ่านจากตารางสต็อก',
  '["Before","After"]': ['ก่อน', 'หลัง'], 'HQ Warehouse (sent from)': 'HQ Warehouse (ต้นทาง)', 'Store Central (sent to)': 'Store Central (ปลายทาง)', 'Loss recorded at HQ Warehouse': 'ความสูญหายที่บันทึกที่ HQ Warehouse', 'Scrapped at Store Central': 'ทิ้งที่ Store Central', 'Counted': 'ตรวจนับ',
  'every unit accounted for, books balance': 'ทุกต้นมีที่มา และบัญชีสมดุล',
  'The rules it checks': 'กฎที่รายงานตรวจ', 'Head office warehouse. Each product has a lowest and a highest level, read from the stock tables.': 'HQ Warehouse สินค้าแต่ละชนิดมีระดับต่ำสุดและสูงสุด อ่านจากตารางสต็อก',
  '["On the shelf","Lowest","Highest","Below the lowest?"]': ['บนชั้น', 'ต่ำสุด', 'สูงสุด', 'ต่ำกว่าระดับต่ำสุด?'], 'yes': 'ใช่', 'no': 'ไม่',
  'What was checked, and against what': 'ตรวจอะไรไปบ้าง และเทียบกับอะไร', 'Each line is a witness run against the real iDempiere, or a judged accounting rule. Numbers are read from the saved logs.': 'แต่ละบรรทัดคือการทดสอบเทียบกับ iDempiere ตัวจริง หรือกฎบัญชีที่ตัดสินแล้ว ตัวเลขอ่านจากไฟล์บันทึกที่เก็บไว้',
  '["Result"]': ['ผลลัพธ์'], 'Receipt lines from an order (Create Lines From)': 'รายการรับของจากใบสั่งซื้อ (Create Lines From)', 'Purchase-order matches posted like iDempiere': 'การจับคู่ใบสั่งซื้อ ลงบัญชีเหมือน iDempiere', 'Inventory moves posted like iDempiere': 'การย้ายสินค้า ลงบัญชีเหมือน iDempiere',
  'Move confirmation, in transit and back': 'ยืนยันการย้าย ทั้งระหว่างขนส่งและขากลับ', 'Physical inventory documents': 'เอกสารตรวจนับสต็อก', 'Replenish Report, row for row': 'รายงานเติมสต็อก ทีละแถว' };
const TH_RULES = [[/^(\d+) in an inventory document$/, (m) => m[1] + ' ต้น บันทึกในเอกสารสินค้าคงคลัง'], [/^(\d+) posting rows this session$/, (m) => 'รอบนี้ลงบัญชีทั้งหมด ' + m[1] + ' รายการ'], [/^(\d+) postings, all balanced$/, (m) => 'ลงบัญชี ' + m[1] + ' รายการ สมดุลทั้งหมด']];
const T = (e, z) => { if (FL === 'zh') return z; if (FL !== 'th') return e; const k = typeof e === 'string' ? e : JSON.stringify(e); if (k in TH_MAP) return TH_MAP[k]; for (const [rx, f] of TH_RULES) { const m = typeof e === 'string' && rx.exec(e); if (m) return f(m); } throw new Error('no Thai string for ' + k); };
const LANGQ = FL === 'zh' ? 'zh_CN' : FL === 'th' ? 'th_TH' : 'en_US';
const REPO = process.env.ERP_REPO || path.join(HOME, 'bim-ootb');
const OUT = path.resolve(process.argv[2] || '.'); const FR = path.join(OUT, 'frames'); fs.mkdirSync(FR, { recursive: true });
const FACTS_FILE = process.env.PARITY_FACTS || path.join(HOME, 'Videos', 'purchasing_work', 'facts.json');
const LOG = [], PAGELOG = [];
const say = (s) => { LOG.push(s); console.log(s); };
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.db': 'application/octet-stream', '.png': 'image/png', '.css': 'text/css', '.wasm': 'application/wasm', '.svg': 'image/svg+xml', '.sql': 'text/plain', '.jpg': 'image/jpeg' };
const server = http.createServer((req, res) => { const p = decodeURIComponent(req.url.split('?')[0]); const fp = path.join(REPO, p);
  fs.stat(fp, (e, st) => { if (e || st.isDirectory()) { res.writeHead(404); res.end('404 ' + p); return; } res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream', 'Content-Length': st.size }); fs.createReadStream(fp).pipe(res); }); });
const CURSOR = `(() => { const go = () => { if (document.getElementById('__fc')) return;
  const c = document.createElement('div'); c.id = '__fc';
  c.style.cssText = 'position:fixed;left:0;top:0;width:22px;height:22px;margin:-3px 0 0 -3px;z-index:2147483647;pointer-events:none;background:url("data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2222%22 height=%2222%22><path d=%22M3 2 L3 18 L7.5 14 L10.5 20.5 L13 19.4 L10.1 13 L16 13 Z%22 fill=%22white%22 stroke=%22black%22 stroke-width=%221.4%22/></svg>") no-repeat';
  document.documentElement.appendChild(c);
  const at = (e) => { c.style.left = e.clientX + 'px'; c.style.top = e.clientY + 'px'; };
  addEventListener('mousemove', at, true);
  addEventListener('mousedown', (e) => { at(e); const r = document.createElement('div');
    r.style.cssText = 'position:fixed;z-index:2147483646;pointer-events:none;border:3px solid #ffb400;border-radius:50%;width:10px;height:10px;left:' + (e.clientX - 5) + 'px;top:' + (e.clientY - 5) + 'px;transition:all .45s ease-out;opacity:1';
    document.documentElement.appendChild(r); requestAnimationFrame(() => { r.style.transform = 'scale(4)'; r.style.opacity = '0'; }); setTimeout(() => r.remove(), 600); }, true); };
  if (document.documentElement) go(); else addEventListener('DOMContentLoaded', go); })();`;

(async () => {
  await new Promise(r => server.listen(0, r));
  const base = 'http://localhost:' + server.address().port + '/erp';
  const browser = await chromium.launch({ args: ['--no-sandbox', '--disable-gpu'] });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 810 }, deviceScaleFactor: 4 / 3 });
  await ctx.addInitScript(CURSOR);
  const page = await ctx.newPage();
  page.on('console', m => PAGELOG.push(m.text())); page.on('pageerror', e => PAGELOG.push('PAGEERR ' + e)); page.on('dialog', async d => { PAGELOG.push('DIALOG ' + d.message()); await d.accept(); });
  const lastLog = (n, re) => PAGELOG.slice(n).filter(l => re.test(l)).pop() || '';
  const hold = (ms) => page.waitForTimeout(DRY ? Math.min(ms, 120) : ms);
  const sql = async (s) => { const r = await page.evaluate(q => { try { const x = window.__idmpDb.exec(q); return x.length ? x[0].values : []; } catch (e) { return 'ERR ' + e.message; } }, s); return r; };
  const tip = (q) => page.evaluate(x => window.__crud.withModelTrx(f => f(x)), q);
  let T0 = null;
  const now = () => (T0 === null ? 0 : Date.now() / 1000 - T0);
  const fact = (k, v) => say('§ERP_FILM_FACT ' + k + '=' + String(typeof v === 'string' ? v : JSON.stringify(v)).replace(/\s+/g, ' ').slice(0, 420) + (T0 !== null ? '  @' + now().toFixed(1) : ''));

  // ── setup OFF CAMERA: fresh page; the twin-only in-transit document type (legacy has none and is not touched); the take opens on a card over the login screen ──
  await page.goto(base + '/idempiere.html?lang=' + LANGQ, { waitUntil: 'networkidle' });
  for (const n of ['erp_cache', 'fold_plugins']) await page.evaluate(x => new Promise(r => { const q = indexedDB.deleteDatabase(x); q.onsuccess = q.onerror = q.onblocked = () => r(); }), n);
  await page.goto(base + '/idempiere.html?lang=' + LANGQ, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => !!window.__idmpDb && !!window.PluginRelease && document.querySelector('#idmp-login-clients') && document.querySelector('#idmp-login-clients').children.length > 0, null, { timeout: 30000 });
  await page.evaluate(() => window.ErpI18n && window.ErpI18n.preload && window.ErpI18n.preload()); await hold(1500);
  fact('uiLang', LANGQ);
  await page.evaluate(() => { const db = window.__idmpDb; const cols = db.exec('PRAGMA table_info(c_doctype)')[0].values.map(r => r[1]).filter(c => c !== 'c_doctype_id' && c !== 'c_doctype_uu');
    db.run('INSERT INTO c_doctype (c_doctype_id,' + cols.join(',') + ') SELECT 9100143,' + cols.join(',') + ' FROM c_doctype WHERE c_doctype_id=143');
    db.run("UPDATE c_doctype SET isintransit='Y', name='Inventory Move (in transit)' WHERE c_doctype_id=9100143"); });
  fact('fixture.inTransitDoctype', 'twin-only copy of Material Movement with IsInTransit=Y (id 9100143); the legacy pilot has none');
  fact('repo', REPO);
  await hold(1200);

  // ── screencast ──
  const frames = []; let cdp = null;
  async function cast() {
    if (DRY) return; cdp = await ctx.newCDPSession(page); const me = cdp;
    me.on('Page.screencastFrame', async f => { const fn = path.join(FR, String(frames.length).padStart(6, '0') + '.jpg'); fs.writeFileSync(fn, Buffer.from(f.data, 'base64')); frames.push({ fn, ts: f.metadata.timestamp }); if (T0 === null) T0 = f.metadata.timestamp; me.send('Page.screencastFrameAck', { sessionId: f.sessionId }).catch(() => {}); });
    await me.send('Page.startScreencast', { format: 'jpeg', quality: 90, maxWidth: 1920, maxHeight: 1080, everyNthFrame: 1 });
  }
  // gesture tally per beat (a step = a click, a pick from a list, a typed field)
  const GT = { click: 0, select: 0, type: 0 }; let GPrev = null, GPrevId = null;
  const gestFlush = () => { if (GPrevId) { const d = Object.fromEntries(Object.keys(GT).map(k => [k, GT[k] - GPrev[k]])); say('§ERP_FILM_GESTURES beat=' + GPrevId + ' G=' + (d.click + d.select + d.type) + ' clicks=' + d.click + ' selects=' + d.select + ' typed=' + d.type); } };
  const MIN = JSON.parse(process.env.BEAT_MIN || '{}'); let prev = null;
  const beat = async (id, note) => {
    if (prev && MIN[prev.id] && !DRY) { const wait = MIN[prev.id] - (now() - prev.t); if (wait > 0) { say('§ERP_FILM_HOLD after=' + prev.id + ' extra=' + wait.toFixed(2)); await page.waitForTimeout(wait * 1000); } }
    gestFlush(); GPrev = { ...GT }; GPrevId = id; prev = { id, t: now() }; say('§ERP_FILM_BEAT id=' + id + ' t=' + prev.t.toFixed(2) + ' lang=en ' + (note || ''));
  };
  const cardFor = async () => { if (!prev || DRY) return; const need = ((MIN[prev.id] || 0) - (now() - prev.t)) * 1000; if (need > 0) await page.waitForTimeout(need); };
  async function glide(sel) { const loc = page.locator(sel).first(); await loc.scrollIntoViewIfNeeded().catch(() => {}); const b = await loc.boundingBox(); if (!b) throw new Error('no box for ' + sel); await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: DRY ? 3 : 22 }); await hold(160); }
  let clicks = 0, cursorOk = 0;
  async function hclick(sel) {
    await glide(sel);
    const c = await page.evaluate(() => { const e = document.getElementById('__fc'); return e ? [parseFloat(e.style.left), parseFloat(e.style.top)] : null; });
    const b = await page.locator(sel).first().boundingBox();
    clicks++; GT.click++; if (c && b && Math.abs(c[0] - (b.x + b.width / 2)) < 2 && Math.abs(c[1] - (b.y + b.height / 2)) < 2) cursorOk++;
    await page.mouse.down(); await hold(60); await page.mouse.up(); await hold(DRY ? 150 : 300);
  }
  const hselect = async (sel, val) => { GT.select++; await glide(sel); await page.selectOption(sel, val); await hold(500); };
  const htype = async (sel, text) => { GT.type++; await glide(sel); await page.click(sel); await page.fill(sel, ''); await page.type(sel, text, { delay: DRY ? 5 : 70 }); await page.locator(sel).first().blur().catch(() => {}); await hold(350); };
  const ipc = (sel) => page.locator(sel).first().evaluate(e => e.click());    // in-page click: used only UNDER a card (no cursor, not a counted step)
  const F = (c, t) => '#idmp-inline-mount ' + (t || 'input') + '[data-col="' + c + '"]';
  const NEWB = '#idmp-toolbar [data-tb="new"]', SAVEB = '#idmp-toolbar [data-tb="save"]', TOGGLE = '#idmp-toolbar [data-tb="toggle"]';
  const optBy = async (col, re) => { const o = (await page.$$eval('#idmp-inline-mount select[data-col="' + col + '"] option', os => os.map(x => ({ v: x.value, t: x.text })))).find(x => x.v && re.test(x.t)); if (!o) throw new Error('no option ' + col + ' ' + re); return o; };
  let curLang = LANGQ;
  async function setLang(code) { if (code === curLang) return; curLang = code; const n0 = PAGELOG.length; await hclick('#idmp-lang'); await page.selectOption('#idmp-lang', code); for (let i = 0; i < 60 && !lastLog(n0, new RegExp('§I18N lang=' + code)); i++) await page.waitForTimeout(50); fact('i18n.' + code, lastLog(n0, /§I18N lang=/) || 'NO §I18N LINE'); await hold(300); }
  const status = () => page.$eval('#idmp-status', e => e.innerText).catch(() => '');
  const gearItems = async () => { const on = await page.$eval('#idmp-toolbar [data-tb="process"]', e => !e.disabled).catch(() => false); if (!on) return []; await ipc('#idmp-toolbar [data-tb="process"]'); await page.waitForSelector('#idmp-proc-ov', { timeout: 8000 }).catch(() => {}); const v = await page.$$eval('#idmp-proc-ov [data-tbb]', e => e.map(x => x.getAttribute('data-tbb') + '=' + x.textContent)); await page.keyboard.press('Escape'); await ipc('#idmp-proc-ov').catch(() => {}); await page.evaluate(() => { const o = document.getElementById('idmp-proc-ov'); if (o) o.remove(); }); return v; };

  // ── menus: visible (a counted walk through the tree) and under a card ──
  async function openMenuById(menuId) {
    const chain = await page.evaluate(id => { const leaf = document.querySelector('#idmp-tree .idmp-row.leaf[data-menu-id="' + id + '"]'); if (!leaf) return null; const out = []; let n = leaf.parentElement.parentElement; while (n && n.id !== 'idmp-tree') { if (n.classList.contains('idmp-node')) out.unshift(n.querySelector(':scope > .idmp-row').getAttribute('data-menu-id')); n = n.parentElement; } return out; }, menuId);
    if (!chain) throw new Error('menu id not in tree: ' + menuId);
    for (const id of chain) { const open = await page.evaluate(i => { const r = document.querySelector('#idmp-tree .idmp-row[data-menu-id="' + i + '"]'); return r && r.parentElement.classList.contains('open'); }, id); if (!open) await hclick('#idmp-tree .idmp-row[data-menu-id="' + id + '"]'); }
    await hold(400);
    const leafSel = '#idmp-tree .idmp-row.leaf[data-menu-id="' + menuId + '"]';
    if (!(await page.locator(leafSel).first().isVisible().catch(() => false))) { fact('menuFallback', menuId + ' leaf not visible -> ancestors opened by script'); await page.evaluate(id => { const leaf = document.querySelector('#idmp-tree .idmp-row.leaf[data-menu-id="' + id + '"]'); let n = leaf.parentElement; while (n && n.id !== 'idmp-tree') { if (n.classList && n.classList.contains('idmp-node')) n.classList.add('open'); n = n.parentElement; } leaf.scrollIntoView({ block: 'center' }); }, menuId); await hold(400); }
    await hclick(leafSel);
  }
  const menuOfWin = (w) => page.evaluate(w => { const r = window.__idmpDb.exec("SELECT AD_Menu_ID FROM AD_Menu WHERE Action='W' AND AD_Window_ID=" + w + " AND IsActive='Y'"); return (r.length ? r[0].values.map(x => x[0]) : []).find(i => document.querySelector('#idmp-tree .idmp-row.leaf[data-menu-id="' + i + '"]')) || null; }, w);
  async function openWinById(w) { const id = await menuOfWin(w); fact('menu.win' + w, id); await openMenuById(id); await page.waitForSelector(NEWB, { timeout: 20000 }); await hold(700); }
  async function openPlain(w) { const mid = await menuOfWin(w); if (!mid) throw new Error('window ' + w + ' not in menu');
    await page.evaluate(id => { const leaf = document.querySelector('#idmp-tree .idmp-row.leaf[data-menu-id="' + id + '"]'); let n = leaf.parentElement; while (n && n.id !== 'idmp-tree') { if (n.classList && n.classList.contains('idmp-node')) n.classList.add('open'); n = n.parentElement; } leaf.click(); }, mid);
    await page.waitForSelector(NEWB, { timeout: 20000, state: 'attached' }); await hold(900); }
  const findOk = async (vis) => { if (await page.locator('#idmp-find-ov').count()) { if (vis) { await hold(900); await hclick('#idmp-find-ov [data-find-ok]'); } else await ipc('#idmp-find-ov [data-find-ok]'); await hold(900); return true; } return false; };
  const toForm = async (vis) => { for (let i = 0; i < 3; i++) { if (await page.locator('#idmp-inline-mount .cfrow').first().isVisible().catch(() => false)) return; if (vis) await hclick(TOGGLE); else await ipc(TOGGLE); await hold(800); } };
  const login = async (client, user, vis) => {
    const c = vis ? hclick : ipc;
    await c("#idmp-login-clients .idmp-login-user:has(.nm:text-is('" + client + "'))"); await page.waitForSelector('#idmp-login-step1:visible'); await hold(300);
    await c("#idmp-login-users .idmp-login-user:has(.nm:text-is('" + user + "'))"); await page.waitForSelector('#idmp-login-step2:visible'); await hold(300);
    await c('#idmp-login-ok'); await page.waitForFunction(() => document.querySelector('#idmp-tree') && document.querySelector('#idmp-tree').children.length > 0, null, { timeout: 20000 }); await hold(600);
  };

  // ── cards: chapter (house dark style) + a generic table card; each REPLACES any card in the same tick ──
  const KICK = T('Purchasing and Stock Replenishment', '采购与库存补货');
  const chapter = async (kicker, title, lines) => {
    fact('chapter.' + title.replace(/\W+/g, '_').slice(0, 30), lines.join(' | '));
    await page.evaluate(({ kicker, title, lines }) => {
      const old = document.getElementById('__ledger'); if (old) old.remove();
      const d = document.createElement('div'); d.id = '__ledger';
      d.style.cssText = 'position:fixed;inset:0;z-index:2147483000;background:#000;color:#ebeef2;font-family:Noto Sans CJK SC,Noto Sans Thai,Noto Sans,DejaVu Sans,Arial,sans-serif;display:flex;flex-direction:column;justify-content:center;padding:0 140px 180px';
      d.innerHTML = '<div style="font-size:30px;font-weight:700;letter-spacing:.12em;color:#ff8c1a;text-transform:uppercase">' + kicker + '</div><div style="font-size:92px;font-weight:700;margin:18px 0 34px;color:#4fc3f7">' + title + '</div>' +
        lines.map(l => '<div style="font-size:38px;color:#c9d4e0;margin:10px 0;padding-left:26px;border-left:6px solid #ff8c1a">' + l + '</div>').join('');
      document.body.appendChild(d);
      window.__keepCard = d; clearInterval(window.__keepIv); window.__keepIv = setInterval(() => { if (window.__keepCard && !document.getElementById('__ledger')) document.body.appendChild(window.__keepCard); }, 100);
    }, { kicker, title, lines });
  };
  const card = async (title, sub, heads, rows, compact) => {
    rows.forEach(r => fact('card.' + title.replace(/\W+/g, '_').slice(0, 24) + '.' + String(r[0]).replace(/\W+/g, '_').slice(0, 30), r.slice(1).map(c => c.v).join(' | ')));
    await page.evaluate(({ title, sub, heads, rows, kick, compact }) => {
      const old = document.getElementById('__ledger'); if (old) old.remove();
      const d = document.createElement('div'); d.id = '__ledger';
      d.style.cssText = 'position:fixed;inset:0;z-index:2147483000;background:#10151c;color:#e8edf3;font-family:Noto Sans CJK SC,Noto Sans Thai,Noto Sans,DejaVu Sans,Arial,sans-serif;display:flex;flex-direction:column;justify-content:center;padding:0 90px 190px';
      const tone = { L: '#7fd1ff', B: '#ff9b8a', G: '#7ee0a0', A: '#ffd479', N: '#c9d4e0' };
      const cell = (c) => '<td style="padding:' + (compact ? 4 : 9) + 'px 20px;text-align:center;font-size:' + (c.sm ? (compact ? 24 : 30) : (compact ? 30 : 40)) + 'px;font-weight:700;color:' + (tone[c.t] || tone.N) + '">' + c.v + (c.s ? '<div style="font-size:16px;font-weight:400;color:#8fa0b3;margin-top:4px">' + c.s + '</div>' : '') + '</td>';
      d.innerHTML = '<div style="font-size:21px;letter-spacing:.14em;color:#8fa0b3;text-transform:uppercase">' + kick + '</div><div style="font-size:' + (compact ? 40 : 48) + 'px;font-weight:700;margin:6px 0 4px">' + title + '</div><div style="font-size:' + (compact ? 19 : 22) + 'px;color:#b8c4d2;margin-bottom:' + (compact ? 12 : 26) + 'px">' + sub + '</div>' +
        '<table style="border-collapse:collapse;width:100%"><tr style="font-size:20px;color:#8fa0b3"><td></td>' + heads.map(h => '<td style="text-align:center;padding:6px 20px">' + h + '</td>').join('') + '</tr>' +
        rows.map(r => '<tr style="border-top:1px solid #243040"><td style="padding:' + (compact ? 4 : 9) + 'px 20px;font-size:' + (compact ? 21 : 25) + 'px;color:#c9d4e0;width:34%">' + r[0] + '</td>' + r.slice(1).map(cell).join('') + '</tr>').join('') + '</table>';
      document.body.appendChild(d);
      window.__keepCard = d; clearInterval(window.__keepIv); window.__keepIv = setInterval(() => { if (window.__keepCard && !document.getElementById('__ledger')) document.body.appendChild(window.__keepCard); }, 100);
    }, { title, sub, heads, rows, kick: KICK, compact: !!compact });
  };
  const uncard = async () => { await page.evaluate(() => { window.__keepCard = null; clearInterval(window.__keepIv); const d = document.getElementById('__ledger'); if (d) d.remove(); }); };
  const V = (v, t, s, sm) => ({ v: String(v), t: t || 'N', s: s || null, sm: !!sm });

  // ── documents ──
  async function waitStatus(table, idcol, expect, where) {
    for (let i = 0; i < 80; i++) { const r = await tip('SELECT docstatus AS s FROM ' + table + ' WHERE ' + where + ' ORDER BY ' + idcol + ' LIMIT 1'); if (r[0] && r[0].s === expect) return true; await page.waitForTimeout(250); }
    return false;
  }
  // a Purchase Order (Seed Farm, Mulch x qty) typed through the screen and completed. vis=false: under a card (in-page clicks)
  async function makePO(vis, qty, hooks) {
    const c = vis ? hclick : ipc, sel = async (col, re) => { const o = await optBy(col, re); if (vis) await hselect(F(col, 'select'), o.v); else { await page.selectOption(F(col, 'select'), o.v); await hold(500); } };
    const ty = async (s, t) => { if (vis) await htype(s, t); else { await page.fill(s, t); await page.locator(s).first().blur().catch(() => {}); await hold(350); } };
    if (vis) await openWinById(181); else await openPlain(181);
    if (hooks && hooks.opened) await hooks.opened();
    await c(NEWB); await page.waitForSelector('#idmp-inline-mount .cfrow', { timeout: 10000 }); await hold(800);
    await sel('c_doctypetarget_id', /^Purchase Order/); await sel('c_bpartner_id', /Seed Farm/); await sel('ad_org_id', /^HQ/); await hold(500);
    await c(SAVEB); await hold(1800);
    if (hooks && hooks.lines) await hooks.lines();
    await c('#idmp-tabstrip .idmp-adtab[title="TabLevel 1 · C_OrderLine"]'); await hold(1200); await c(NEWB); await page.waitForSelector(F('m_product_id', 'select'), { timeout: 15000 }); await hold(900);
    await sel('m_product_id', /Mulch/); await ty(F('qtyentered'), String(qty)); await hold(500);
    await c(SAVEB); await hold(1800);
    await c('#idmp-tabstrip .idmp-adtab[title="TabLevel 0 · C_Order"]'); await page.waitForSelector('[data-doc-action="CO"]', { timeout: 20000 }); await hold(900);
    const n = PAGELOG.length; await c('[data-doc-action="CO"]');
    const ok = await waitStatus('c_order', 'c_order_id', 'CO', 'c_order_id<0 AND issotrx=\'N\' AND c_order_id=(SELECT MIN(c_order_id) FROM c_order WHERE c_order_id<0)'); await hold(1200);
    const po = (await tip("SELECT c_order_id AS i, documentno AS d, docstatus AS s, grandtotal AS g FROM c_order WHERE c_order_id<0 ORDER BY c_order_id LIMIT 1"))[0];
    return { ok, po, log: lastLog(n, /§MODEL-DOCACTION table=c_order/) };
  }
  const oneRow = async (q) => (await tip(q))[0];
  const MULCH = 137, WH = 103;
  const onhand = async (loc) => Number((await tip('SELECT COALESCE(SUM(qtyonhand),0) AS q FROM m_storageonhand WHERE m_product_id=' + MULCH + ' AND m_locator_id=' + loc))[0].q);
  const ELM = 124, SRC = 101, TGT = 102;
  const elmOn = async (loc) => Number((await tip('SELECT COALESCE(SUM(qtyonhand),0) AS q FROM m_storageonhand WHERE m_product_id=' + ELM + ' AND m_locator_id=' + loc))[0].q);
  const readFacts = () => { try { return JSON.parse(fs.readFileSync(FACTS_FILE, 'utf8')); } catch (e) { return {}; } };
  const FEXTRA = {};

  try {
    // ═══ A0 chapter card 1 over the login screen ═══
    await chapter(KICK, T('Buying, step by step', '一步一步买进货'), T(['Order it', 'Receive it', 'Pay for it'], ['下订单', '收货', '付款']));
    await cast(); await page.mouse.move(720, 500); await beat('a0', 'chapter 1: buying'); await cardFor();

    // ═══ A1 an optional plugin, installed from Plugins & Releases on the login page ═══
    await uncard(); await beat('a1', 'plugin offer + install from the login page'); await hold(1400);
    const FID = 'org.kernel.friendly-ops';
    await hclick('#idmp-release-link'); await page.waitForSelector('#pr-osgi table.oc-t', { timeout: 10000 }); await hold(1800);
    fact('console.offerRows', await page.locator('[data-oc-offerrow="' + FID + '"]').count());
    await glide('[data-oc-offerrow="' + FID + '"]'); await hold(1800);
    const n1 = PAGELOG.length; await hclick('[data-oc-offer="' + FID + '"]'); await hold(2600);
    fact('plugin.installed', lastLog(n1, /§PLUGIN-START/));
    await hclick('#pr-root [data-pr-close]'); await hold(700);

    // ═══ A2 log in; a purchase order, typed on the screen ═══
    await beat('a2', 'login + purchase order A'); await login('GardenWorld', 'GardenAdmin', true);
    const mulch0 = await onhand(SRC); fact('mulch.onhandBefore', mulch0);
    const A = await makePO(true, 5, { opened: async () => { if (FL === 'th') await setLang('en_US'); }, lines: async () => { await beat('a2b', 'purchase order A: line and Complete'); } });
    fact('poA', JSON.stringify(A.po) + ' ok=' + A.ok); fact('poA.log', A.log);
    fact('poA.gear', JSON.stringify(await gearItems()));

    // ═══ A3 the long way: Material Receipt, Create Lines From (an info window), edit the quantity, run ═══
    await beat('a3', 'material receipt, Create Lines From');
    await openWinById(184); await hclick(NEWB); await page.waitForSelector('#idmp-inline-mount .cfrow'); await hold(800);
    await hselect(F('c_bpartner_id', 'select'), (await optBy('c_bpartner_id', /Seed Farm/)).v); await hselect(F('ad_org_id', 'select'), (await optBy('ad_org_id', /^HQ/)).v);
    await hclick(SAVEB); await hold(1800);
    const rc = await oneRow('SELECT m_inout_id AS id, docstatus AS s FROM m_inout WHERE m_inout_id<0 ORDER BY m_inout_id LIMIT 1'); fact('receipt.header', rc);
    const BTN = '#idmp-content [data-proc-btn="CreateLinesFrom"]'; await page.waitForSelector(BTN, { timeout: 10000 }); await hold(700);
    await hclick(BTN); await page.waitForSelector('#idmp-infowin', { timeout: 10000 }); await hold(1500);
    await hselect('#idmp-infowin select[data-col="C_Order_ID"]', String(A.po.i)); await hclick('#idmp-infowin [data-act="refresh"]'); await hold(1500);
    fact('infowin.rows', await page.locator('#idmp-infowin tbody tr').count());
    await hclick('#idmp-infowin input[data-pick="0"]'); await hold(700);
    await htype('#idmp-infowin tbody tr:first-child [data-edit="Qty"]', '3'); await hold(900);
    const n3 = PAGELOG.length; await hclick('#idmp-infowin [data-infoproc]'); await page.waitForSelector('#idmp-procdlg [data-proc-run]', { timeout: 10000 }); await hold(1200);
    await hclick('#idmp-procdlg [data-proc-run]'); await page.waitForSelector('#idmp-procdlg [data-procdlg-ok]', { timeout: 20000 }); await hold(2000);
    await hclick('#idmp-procdlg [data-procdlg-ok]'); await hold(1500);
    gestFlush(); GPrev = { ...GT }; GPrevId = 'a3post';   // the legacy chain ends here: lines created
    const lines = await tip('SELECT m_inoutline_id AS id, movementqty AS q, c_orderline_id AS ol, m_locator_id AS loc FROM m_inoutline WHERE m_inout_id=' + rc.id);
    fact('receipt.lines', JSON.stringify(lines) + ' header.order=' + (await oneRow('SELECT c_order_id AS o FROM m_inout WHERE m_inout_id=' + rc.id)).o + ' orderOpen=' + (await oneRow('SELECT qtyordered - qtydelivered AS o FROM c_orderline WHERE c_order_id=' + A.po.i)).o);
    await page.waitForSelector('[data-doc-action="CO"]', { timeout: 15000 }); await hold(900);
    await hclick('[data-doc-action="CO"]'); await waitStatus('m_inout', 'm_inout_id', 'CO', 'm_inout_id=' + rc.id); await hold(1500);
    const mulch1 = await onhand(SRC); fact('mulch.onhandAfterReceipt', mulch1 + ' (delta ' + (mulch1 - mulch0) + ')'); fact('receipt.status', await oneRow('SELECT docstatus AS s FROM m_inout WHERE m_inout_id=' + rc.id));

    // ═══ A4 chapter card: the shortcut. Behind it: the same supplier and product, a second order (in-page clicks) ═══
    await beat('a4', 'chapter: the shortcut');
    await chapter(KICK, T('The shortcut', '快捷方式'), T(['The same steps, from one menu', 'Optional - installed a minute ago'], ['同样的步骤，一个菜单搞定', '可选功能，一分钟前才安装']));
    const B = await makePO(false, 5); fact('poB', JSON.stringify(B.po) + ' ok=' + B.ok);
    fact('poB.gear', JSON.stringify(await gearItems()));
    await cardFor();

    // ═══ A5 the shortcut, live: gear -> Receive, gear -> Create Bill ═══
    await uncard(); await beat('a5', 'gear: Receive, Create Bill'); await hold(1200);
    const gearRun = async (comp) => { const nn = PAGELOG.length, g0 = GT.click + GT.select + GT.type; await hclick('#idmp-toolbar [data-tb="process"]'); await page.waitForSelector('#idmp-proc-ov [data-tbb="' + comp + '"]', { timeout: 10000 }); await hold(900); fact('gear.items', JSON.stringify(await page.$$eval('#idmp-proc-ov [data-tbb]', e => e.map(x => x.textContent)))); await hclick('#idmp-proc-ov [data-tbb="' + comp + '"]');
      await page.waitForSelector('#idmp-procdlg [data-procdlg-ok]', { timeout: 30000 }); await hold(2200); fact('run.' + comp, lastLog(nn, /§AD-PROC-LIVE proc=\S+ .*dispatched=/)); await hclick('#idmp-procdlg [data-procdlg-ok]'); await hold(1400); FEXTRA['g_' + comp] = GT.click + GT.select + GT.type - g0; fact('count.' + comp, FEXTRA['g_' + comp]); };
    await gearRun('FO_Order_Receive');
    const rB = await oneRow("SELECT m_inout_id AS id, docstatus AS s, documentno AS d, c_order_id AS o FROM m_inout WHERE c_order_id=" + B.po.i); fact('poB.receipt', rB);
    fact('poB.receiptLines', await tip('SELECT movementqty AS q FROM m_inoutline WHERE m_inout_id=' + rB.id));
    await gearRun('FO_Order_Bill');
    const iB = await oneRow('SELECT i.c_invoice_id AS id, i.docstatus AS s, i.documentno AS d, i.grandtotal AS g, i.c_order_id AS o FROM c_invoice i WHERE i.c_order_id=' + B.po.i); fact('poB.invoice', iB);
    fact('poB.gearAfter', JSON.stringify(await gearItems()));
    fact('stock.mulchAfterB', await onhand(SRC));

    // ═══ A6 card: the steps counted in this very film ═══
    await beat('a6', 'card: counted');
    const gLegacy = (() => { const m = LOG.filter(l => /§ERP_FILM_GESTURES beat=a3 /.test(l)).pop() || ''; const r = /G=(\d+)/.exec(m); return r ? Number(r[1]) : null; })();
    fact('count.legacy', gLegacy); const gS = FEXTRA.g_FO_Order_Receive;
    await card(T('Counted in this film', '用本片的点击数来算'), T('A step is a click, a pick from a list or a typed field. Both ways end with the goods received.', '一步 = 一次点击、一次从列表中选择或一次输入。两种做法最后都收到了货。'), T(['The standard way', 'The shortcut'], ['标准做法', '快捷方式']),
      [[T('Steps to receive the goods', '收货需要的步骤'), V(gLegacy, 'L', T('from opening the window to lines on the receipt', '从打开窗口到收货单上有明细行'), false), V(gS, 'G', T('gear, Receive, OK on the result', '齿轮、Receive、点确定'), false)],
       [T('What runs underneath', '底层运行的是'), V('Create Lines From', 'N', null, true), V(T('the same process, one button', '同一个流程，一个按钮'), 'N', null, true)]]);
    await cardFor();
    await uncard();

    // ═══ B0 chapter card: stock between shops. Behind it the in-transit move is typed (in-page clicks) ═══
    await beat('b0', 'chapter: moving stock');
    await chapter(KICK, T('Moving stock between shops', '在门店之间调拨库存'), T(['An Inventory Move takes goods from one warehouse to another', 'On the road they are "in transit" until the shop confirms'], ['库存调拨：把货从一个仓库运到另一个仓库', '货在路上叫“在途”，直到门店确认收货']));
    const elmSrc0 = await elmOn(SRC), elmTgt0 = await elmOn(TGT); fact('elm.before', { source: elmSrc0, target: elmTgt0 });
    await openPlain(170); await ipc(NEWB); await page.waitForSelector('#idmp-inline-mount .cfrow'); await hold(700);
    const pickQ = async (col, re) => { const o = await optBy(col, re); await page.selectOption(F(col, 'select'), o.v); await hold(500); };
    await pickQ('c_doctype_id', /in transit/i); await pickQ('ad_org_id', /^HQ/); await pickQ('m_warehouse_id', /HQ Warehouse/); await pickQ('m_warehouseto_id', /Store Central/);
    await ipc(SAVEB); await hold(1800);
    await ipc('#idmp-tabstrip .idmp-adtab[title="TabLevel 1 · M_MovementLine"]'); await hold(1000); await ipc(NEWB); await hold(1000);
    await pickQ('m_product_id', /Elm Tree/); await pickQ('m_locator_id', /Default HQ/); await pickQ('m_locatorto_id', /Default Store/);   // chosen from the Locator lookups (bim-ootb #2307), no ids typed await page.fill(F('qtyentered'), '10'); await page.locator(F('qtyentered')).first().blur().catch(() => {}); await hold(600);
    await ipc(SAVEB); await hold(2000);
    await ipc('#idmp-tabstrip .idmp-adtab[title="TabLevel 0 · M_Movement"]'); await page.waitForSelector('[data-doc-action="CO"]', { timeout: 20000 }); await hold(900);
    const mv = await oneRow('SELECT m_movement_id AS i, docstatus AS s FROM m_movement WHERE m_movement_id<0 ORDER BY m_movement_id LIMIT 1'); fact('move.draft', mv);
    await cardFor();

    // ═══ B1 Complete the move: it stops In Progress and a Move Confirm appears ═══
    await uncard(); await beat('b1', 'complete the move: in transit'); await hold(1500);
    const nm = PAGELOG.length; await hclick('[data-doc-action="CO"]'); await waitStatus('m_movement', 'm_movement_id', 'IP', 'm_movement_id=' + mv.i); await hold(2200);
    const cf = await oneRow('SELECT m_movementconfirm_id AS i, docstatus AS s FROM m_movementconfirm WHERE m_movement_id=' + mv.i);
    fact('move.afterComplete', { status: (await oneRow('SELECT docstatus AS s FROM m_movement WHERE m_movement_id=' + mv.i)).s, confirm: cf, message: /msg="([^"]*)"/.exec(lastLog(nm, /§MODEL-DOCACTION table=m_movement/) || '') ? /msg="([^"]*)"/.exec(lastLog(nm, /§MODEL-DOCACTION table=m_movement/))[1] : '' });
    fact('stock.inTransit', { elmSource: await elmOn(SRC), elmTarget: await elmOn(TGT), note: 'nothing moved while the confirm is open' });
    await hold(1800);

    // ═══ B2 the shop confirms: 8 arrived, 1 scrapped; Complete ═══
    await beat('b2', 'move confirmation');
    await openWinById(333); await findOk(true); await toForm(true);
    await hclick('#idmp-tabstrip .idmp-adtab[title="TabLevel 1 · M_MovementLineConfirm"]'); await hold(1200);
    if (await page.locator('.idmp-grid tbody tr').count()) { await hclick(TOGGLE); await hold(800); }
    fact('confirm.line.before', await oneRow('SELECT targetqty AS t, confirmedqty AS c, scrappedqty AS s, differenceqty AS d FROM m_movementlineconfirm WHERE m_movementconfirm_id=' + cf.i));
    await htype(F('confirmedqty'), '8'); await hold(500); await htype(F('scrappedqty'), '1'); await hold(700);
    await hclick(SAVEB); await hold(1800);
    fact('confirm.line.saved', await oneRow('SELECT targetqty AS t, confirmedqty AS c, scrappedqty AS s, differenceqty AS d FROM m_movementlineconfirm WHERE m_movementconfirm_id=' + cf.i));
    await hclick('#idmp-tabstrip .idmp-adtab[title="TabLevel 0 · M_MovementConfirm"]'); await page.waitForSelector('[data-doc-action="CO"]', { timeout: 15000 }); await hold(1000);
    await hclick('[data-doc-action="CO"]'); await waitStatus('m_movementconfirm', 'm_movementconfirm_id', 'CO', 'm_movementconfirm_id=' + cf.i); await hold(2500);
    fact('after.confirm', { confirm: (await oneRow('SELECT docstatus AS s FROM m_movementconfirm WHERE m_movementconfirm_id=' + cf.i)).s, move: (await oneRow('SELECT docstatus AS s FROM m_movement WHERE m_movement_id=' + mv.i)).s });

    // ═══ B3 the two inventory documents the confirm created ═══
    await beat('b3', 'the inventory documents');
    await openWinById(168); await findOk(true); await toForm(true);
    await hclick('#idmp-toolbar button[title="Last record"], #idmp-toolbar button[title="最后记录"]'); await hold(2200);
    const invs = await tip('SELECT i.m_inventory_id AS id, i.documentno AS d, i.docstatus AS s, i.m_warehouse_id AS w, l.m_locator_id AS loc, l.qtybook AS b, l.qtycount AS c FROM m_inventory i JOIN m_inventoryline l ON l.m_inventory_id=i.m_inventory_id WHERE i.m_inventory_id<0 ORDER BY i.m_inventory_id');
    fact('inventory.docs', invs);
    await hclick('#idmp-toolbar button[title="Previous record"], #idmp-toolbar button[title="上一记录"]'); await hold(2200);

    // ═══ B4 card: where the ten went ═══
    await beat('b4', 'card: stock before and after');
    const elmSrc1 = await elmOn(SRC), elmTgt1 = await elmOn(TGT);
    const dSrc = invs.filter(x => Number(x.loc) === SRC).map(x => Number(x.b) - Number(x.c)).reduce((a, b) => a + b, 0), dTgt = invs.filter(x => Number(x.loc) === TGT).map(x => Number(x.b) - Number(x.c)).reduce((a, b) => a + b, 0);
    fact('elm.after', { source: elmSrc1, target: elmTgt1, differenceDoc: dSrc, scrappedDoc: dTgt });
    const badBooks = await tip('SELECT c_acctschema_id AS s, ad_org_id AS o FROM fact_acct WHERE record_id<0 GROUP BY 1,2 HAVING ABS(SUM(amtacctdr)-SUM(amtacctcr))>0.005'), nFacts = Number((await oneRow('SELECT COUNT(*) AS n FROM fact_acct WHERE record_id<0')).n);
    fact('books.balanced', { factRows: nFacts, unbalancedSchemaOrgs: badBooks.length }); const booksOk = nFacts > 0 && badBooks.length === 0;
    const conserved = (elmSrc0 - elmSrc1) === 10 && (elmTgt1 - elmTgt0) === 8 - 1 && dSrc === 2 && dTgt === 1; fact('elm.conserved', conserved);
    await card(T('Where the ten went', '这十棵去哪儿了'), T('Elm Tree, ten sent from HQ Warehouse to Store Central. Eight arrived and one of those was scrapped. Two never arrived. Read from the stock tables.', 'Elm Tree（榆树），从 HQ Warehouse 发往 Store Central 十棵。到了八棵，其中一棵报废。两棵没到。数据读自库存表。'), T(['Before', 'After'], ['之前', '之后']),
      [[T('HQ Warehouse (sent from)', 'HQ Warehouse（发出）'), V(elmSrc0, 'L'), V(elmSrc1, 'G')], [T('Store Central (sent to)', 'Store Central（收到）'), V(elmTgt0, 'L'), V(elmTgt1, 'G')],
       [T('Loss recorded at HQ Warehouse', '总部记录的途中损失'), V('', 'N'), V(T(dSrc + ' in an inventory document', dSrc + ' 棵，记在库存单据里'), 'A', null, true)], [T('Scrapped at Store Central', '门店报废'), V('', 'N'), V(T(dTgt + ' in an inventory document', dTgt + ' 棵，记在库存单据里'), 'A', null, true)],
       [T('Counted', '核对'), V('', 'N'), V(conserved && booksOk ? T('every unit accounted for, books balance', '每一棵都有交代，账目平衡') : 'NOT VERIFIED', conserved && booksOk ? 'G' : 'B', T(nFacts + ' posting rows this session', '本次共 ' + nFacts + ' 条过账记录'), true)]]);
    await cardFor();

    // ═══ C0 chapter card: topping up ═══
    await beat('c0', 'chapter: replenishment');
    await chapter(KICK, T('Topping up', '补货'), T(['Every product has a lowest and a highest stock level', 'The Replenish Report compares them with what is on the shelf'], ['每种商品都有最低和最高库存', '补货报表把它们和货架上的实际库存做比较']));
    await cardFor();

    // ═══ C1 the report creates purchase orders ═══
    await uncard(); await beat('c1', 'replenish report'); await hold(800);
    await openMenuById(53354); await page.waitForSelector('#idmp-content [data-proc-run]', { timeout: 15000 }); await hold(1500);
    const P = (c) => '#idmp-content [data-proc-param="' + c + '"]';
    await hselect(P('M_Warehouse_ID'), '103'); await hold(600);
    await hselect(P('ReplenishmentCreate'), 'POO'); await hold(1200);
    const dto = await page.$$eval(P('C_DocType_ID') + ' option', o => o.filter(x => x.value).map(x => x.value + '=' + x.text)); fact('docTypeOptions', dto);
    await hselect(P('C_DocType_ID'), (dto.find(x => /=Purchase Order$/.test(x)) || dto[0]).split('=')[0]); await hold(900);
    const nr = PAGELOG.length; await beat('c1b', 'run: reorder levels card while the report works');
    const lv = await tip('SELECT p.name AS n, (SELECT COALESCE(SUM(s.qtyonhand),0) FROM m_storageonhand s JOIN m_locator l ON l.m_locator_id=s.m_locator_id WHERE s.m_product_id=r.m_product_id AND l.m_warehouse_id=r.m_warehouse_id) AS oh, r.level_min AS mn, r.level_max AS mx FROM m_replenish r JOIN m_product p ON p.m_product_id=r.m_product_id WHERE r.m_warehouse_id=103 AND r.m_product_id IN (124,137,134) ORDER BY p.name');
    fact('levels', lv);
    await hclick('#idmp-content [data-proc-run]');
    await card(T('The rules it checks', '它检查的规则'), T('Head office warehouse. Each product has a lowest and a highest level, read from the stock tables.', 'HQ Warehouse。每种商品都有最低和最高库存，数据读自库存表。'), T(['On the shelf', 'Lowest', 'Highest', 'Below the lowest?'], ['货架上', '最低', '最高', '低于最低库存？']),
      lv.map(r => [r.n, V(Number(r.oh), 'L'), V(Number(r.mn), 'N'), V(Number(r.mx), 'N'), V(Number(r.oh) < Number(r.mn) ? T('yes', '是') : T('no', '否'), Number(r.oh) < Number(r.mn) ? 'A' : 'G', null, true)]));
    await page.waitForFunction(() => /#\d+ - |Failed|Error|失败|错误/.test((document.querySelector('#idmp-content') || {}).innerText || ''), null, { timeout: 60000, polling: 250 }).catch(async () => { fact('replenish.timeout', await page.evaluate(() => ((document.querySelector('#idmp-content') || {}).innerText || 'no content').replace(/\s+/g, ' ').slice(0, 300) + ' | dlg=' + !!document.querySelector('#idmp-procdlg'))); }); await hold(2500);
    await uncard(); await beat('c1c', 'report result'); await hold(1200);
    fact('replenish.result', await page.evaluate(() => (document.querySelector('#idmp-content') || {}).innerText.replace(/\s+/g, ' ').slice(0, 200)));
    const rep = await tip('SELECT m_product_id AS p, qtyonhand AS oh, level_min AS mn, level_max AS mx, qtytoorder AS q FROM t_replenish ORDER BY m_product_id');
    fact('replenish.rows', rep); const elm = rep.find(r => Number(r.p) === ELM); fact('replenish.elm', elm || 'Elm Tree not proposed');
    const pos = await tip("SELECT o.c_order_id AS i, o.documentno AS d, o.docstatus AS s FROM c_order o WHERE o.c_order_id<0 AND o.documentno >= '600000' ORDER BY o.documentno"); fact('replenish.orders', pos);
    fact('replenish.log', lastLog(nr, /§AD-PROC-LIVE proc=53267 .*dispatched=/));

    // ═══ C2 the drafted orders, in the Purchase Order window ═══
    await beat('c2', 'the drafted purchase orders');
    await page.evaluate(() => { const b = [...document.querySelectorAll('#idmp-content button')].pop(); if (b) b.setAttribute('data-film-close', '1'); }); await hclick('#idmp-content [data-film-close="1"]').catch(() => {}); await hold(600);
    await openWinById(181); await toForm(true);
    await hclick('#idmp-toolbar button[title="Last record"], #idmp-toolbar button[title="最后记录"]'); await hold(2200);
    fact('lastPO', { status: await status(), doc: await oneRow("SELECT documentno AS d, docstatus AS s FROM c_order WHERE c_order_id<0 AND documentno>='600000' ORDER BY documentno DESC LIMIT 1") });
    await hold(2200);

    // ═══ D0 the parity card, numbers read from persisted witness logs ═══
    await beat('d0', 'card: what was checked');
    const PF = readFacts(), ok = (k) => PF[k] && PF[k][0] === PF[k][1];
    const nn = (k) => PF[k] ? (FL === 'zh' ? PF[k][0] + ' / ' + PF[k][1] + ' 一致' : FL === 'th' ? PF[k][0] + ' จาก ' + PF[k][1] : PF[k][0] + ' of ' + PF[k][1]) : 'NOT VERIFIED';
    const row = (lab, k) => [lab, V(nn(k), ok(k) ? 'G' : 'B', null, false)];
    fact('parity.facts', PF);
    await card(T('What was checked, and against what', '检查了什么，对照什么'), T('Each line is a witness run against the real iDempiere, or a judged accounting rule. Numbers are read from the saved logs.', '每一行都是对照真实 iDempiere 跑出来的见证测试，或判定过的会计规则。数字读自保存的日志。'), T(['Result'], ['结果']),
      [row(T('Receipt lines from an order (Create Lines From)', '按订单生成收货明细行（Create Lines From）'), 'createfrom'), [T('Purchase-order matches posted like iDempiere', '采购订单匹配过账与 iDempiere 一致'), V(PF.matchpo ? (FL === 'zh' ? PF.matchpo[0] + ' / ' + PF.matchpo[1] + ' 一致' : FL === 'th' ? PF.matchpo[0] + ' จาก ' + PF.matchpo[1] : PF.matchpo[0] + ' of ' + PF.matchpo[1]) : 'NOT VERIFIED', ok('matchpo') ? 'G' : 'B')],
       [T('Inventory moves posted like iDempiere', '库存调拨过账与 iDempiere 一致'), V(PF.movement_facts ? T(PF.movement_facts + ' postings, all balanced', PF.movement_facts + ' 笔过账，全部平衡') : 'NOT VERIFIED', PF.movement_facts ? 'G' : 'B', null, true)],
       row(T('Move confirmation, in transit and back', '调拨确认（在途及回来）'), 'confirm'), row(T('Physical inventory documents', '实物盘点单据'), 'inventory'), row(T('Replenish Report, row for row', '补货报表，逐行对照'), 'replenish')], true);
    await cardFor();

    // ═══ END ═══
    await uncard(); await beat('end', 'end'); await hold(1500);
    say('§ERP_FILM_CURSOR clicks=' + clicks + ' cursorOnTarget=' + cursorOk + (clicks === cursorOk ? ' OK' : ' WRONG'));
    gestFlush();
  } catch (e) { say('§ERP_FILM_ERROR ' + String(e.message).split('\n').slice(0, 4).join(' | ')); try { say('§ERP_FILM_DEBUG ' + JSON.stringify(await page.evaluate(() => ({ win: (document.querySelector('.idmp-wintab.active .lbl') || {}).textContent, status: (document.getElementById('idmp-status') || {}).innerText, ov: !!document.getElementById('__ledger') })))); } catch (x) {} }
  if (cdp) await cdp.send('Page.stopScreencast').catch(() => {}); await page.waitForTimeout(300).catch(() => {});
  const endTs = Date.now() / 1000;
  fs.writeFileSync(path.join(OUT, 'erp_film.page.log'), PAGELOG.join('\n') + '\n');
  fs.writeFileSync(path.join(OUT, 'erp_film.log'), LOG.join('\n') + '\n');
  if (!DRY && frames.length) {
    const lines = [];
    frames.forEach((f, i) => { const d = (i + 1 < frames.length ? frames[i + 1].ts : endTs) - f.ts; lines.push(`file '${f.fn}'`, `duration ${Math.max(d, 0.001).toFixed(4)}`); });
    lines.push(`file '${frames[frames.length - 1].fn}'`);
    fs.writeFileSync(path.join(OUT, 'frames.txt'), lines.join('\n') + '\n');
    const mp4 = path.join(OUT, 'erp_film_purch.mp4');
    try { execFileSync('ffmpeg', ['-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', path.join(OUT, 'frames.txt'), '-vf', 'fps=24,scale=1920:1080:flags=lanczos,format=yuv420p', '-c:v', 'libx264', '-crf', '17', '-preset', 'medium', mp4]); say('§ERP_FILM_DONE frames=' + frames.length + ' dur=' + (endTs - (T0 || endTs)).toFixed(2) + ' out=' + mp4); } catch (e) { say('§ERP_FILM_ERROR ffmpeg ' + String(e.message).split('\n')[0]); }
    fs.writeFileSync(path.join(OUT, 'erp_film.log'), LOG.join('\n') + '\n');
  } else say('§ERP_FILM_DRY done (no video)');
  await browser.close(); server.close();
})();
