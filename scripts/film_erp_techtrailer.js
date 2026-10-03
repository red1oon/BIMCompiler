// ⚠ DO NOT REMOVE — Scope guard  (TECH TRAILER recorder; helpers copied from film_erp_polyglot.js)
// Scope: §ERP-TECH-TRAILER (prompts/FILM_NARRATION.md §7) — one take: greeting round → System Monitor (the layers that
//   are gone) → GardenWorld login → the AD (live counts) → Sales Order form + DocAction (DR→CO) → Dashboard Graph +
//   Timeline → World History → Project "BIM: Hospital" → its EVM card → Project Line (IfcWall) → Zoom Across → the
//   Viewer (Hospital, Find IfcWall), English to the end. GPU run (red1 approved 2026-10-03): --use-angle=gl, run under
//   `flock /tmp/claude-1000/gpu.lock`. The Viewer opens in a NEW TAB: the screencast follows it (same frame list).
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



const LANGS = ['en_US', 'fr_FR', 'es_ES', 'de_DE', 'ar', 'zh_CN', 'ja_JP', 'ms_MY', 'th_TH'];
(async () => {
  await new Promise(r => server.listen(0, r));
  const base = 'http://localhost:' + server.address().port + '/erp';
  const browser = await chromium.launch({ args: ['--no-sandbox', '--use-angle=gl', '--ignore-gpu-blocklist'] });
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
  await page.goto(base + '/idempiere.html?lang=en_US', { waitUntil: 'networkidle' });
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
  await castOn(page);
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
  async function setLang(code, where) {
    const sel = where === 'login' ? '#idmp-login-lang' : '#idmp-lang';
    const n0 = PAGELOG.length; await hclick(sel); await page.selectOption(sel, code);
    for (let i = 0; i < 40 && !last(n0, new RegExp('§I18N lang=' + code)); i++) await page.waitForTimeout(50);
    fact('i18n.' + code, last(n0, /§I18N lang=/) || 'NO §I18N LINE'); await hold(250);
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
    await hclick('#idmp-tree .idmp-row.leaf[data-menu-id="' + menuId + '"]');
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
  let li = 0; const nextLang = () => LANGS[(li++) % LANGS.length];

  try {
    await page.mouse.move(720, 600);
    for (const L of LANGS) { await beat('g_' + L, L, 'greeting'); await setLang(L, 'login'); }
    let L, n1;
    // s01 System Monitor, from the login card
    L = nextLang(); await beat('s01', L, 'System Monitor'); await setLang(L, 'login');
    n1 = PAGELOG.length; await hclick('#idmp-sysmon-link'); await page.waitForSelector('#sm-root .sm-tbl', { timeout: 10000 }); await hold(900);
    fact('sysmonRelease', last(n1, /§SYSMON-RELEASE /)); fact('sysmonGather', last(n1, /§SYSTEM-MONITOR gather/));
    fact('sysmonText', await page.$eval('#sm-root .sm-modal', e => e.innerText.replace(/\s+/g, ' ').slice(0, 600)));
    // s02 the layers that are gone
    L = nextLang(); await beat('s02', L, 'No longer needed: background processors, cluster');
    fact('badges', JSON.stringify(await page.$$eval('#sm-root .sm-badge', e => e.map(x => x.textContent.trim()))));
    await glide('#sm-root .sm-badge'); await hold(1500);
    await glide('#sm-root .sm-badge >> nth=1').catch(() => {}); await hold(1500);
    // s03 engine + trace
    L = nextLang(); await beat('s03', L, 'SQLite-wasm in-page; signed op-log is the trace');
    await glide('#sm-root >> text=SQLite-wasm').catch(() => {}); await hold(2000);
    await glide('#sm-root >> text=signed op-log').catch(() => {}); await hold(1500);
    // s04 close, log in to GardenWorld
    L = nextLang(); await beat('s04', L, 'GardenWorld login'); await hclick('#sm-root [data-sm-close]'); await hold(400); await setLang(L, 'login');
    await hclick("#idmp-login-clients .idmp-login-user:has(.nm:text-is('GardenWorld'))"); await page.waitForSelector('#idmp-login-step1:visible'); await hold(400);
    await hclick("#idmp-login-users .idmp-login-user:has(.nm:text-is('GardenAdmin'))"); await page.waitForSelector('#idmp-login-step2:visible'); await hold(500);
    await hclick('#idmp-login-ok');
    await page.waitForFunction(() => document.querySelector('#idmp-tree') && document.querySelector('#idmp-tree').children.length > 0, null, { timeout: 10000 }); await hold(500);
    // s05 the AD: live counts, then the Sales Order window from the menu
    L = nextLang(); await beat('s05', L, 'the Application Dictionary'); await setLang(L, 'session');
    for (const t of ['AD_Window', 'AD_Tab', 'AD_Field', 'AD_Process', 'AD_Menu', 'AD_Column', 'AD_Val_Rule']) fact('count.' + t, await one('SELECT COUNT(*) FROM ' + t));
    fact('callouts', await one("SELECT COUNT(*) FROM AD_Column WHERE COALESCE(Callout,'')<>''"));
    await openWinById(143);
    // s06 the order, rendered from AD_Field
    L = nextLang(); await beat('s06', L, 'Sales Order form from AD_Field'); await setLang(L, 'session');
    await gotoRecord(1500003);
    fact('formFields', await page.$$eval('#idmp-form .cfrow', e => e.length).catch(() => 0));
    fact('adFieldsHeaderTab', await one("SELECT COUNT(*) FROM AD_Field f JOIN AD_Tab t ON t.AD_Tab_ID=f.AD_Tab_ID WHERE t.AD_Window_ID=143 AND t.SeqNo=(SELECT MIN(SeqNo) FROM AD_Tab WHERE AD_Window_ID=143)"));
    // s07 DocAction: the legal next actions (DocumentEngine port)
    L = nextLang(); await beat('s07', L, 'DocAction legal actions'); await setLang(L, 'session');
    fact('docfsm', last(0, /§AD-DOCFSM-LIVE table=259/));
    fact('docActions', JSON.stringify(await page.$$eval('[data-doc-action]', e => e.map(x => x.getAttribute('data-doc-action')))));
    await glide('[data-doc-action] >> nth=0'); await hold(800); await glide('[data-doc-action] >> nth=-1').catch(() => {}); await hold(800);
    // s08 Complete → CO, signed into the op-log
    L = nextLang(); await beat('s08', L, 'Complete'); await setLang(L, 'session');
    n1 = PAGELOG.length; await hclick('[data-doc-action="CO"]'); await page.waitForTimeout(2200);
    fact('complete', last(n1, /§AD-DOCFSM-LIVE .*clicked=CO/) || 'NONE'); fact('commit', last(n1, /§DOC-COMMIT-LIVE|§CRUD process committed key=c_order/) || 'NONE');
    fact('docActionsAfter', JSON.stringify(await page.$$eval('[data-doc-action]', e => e.map(x => x.getAttribute('data-doc-action')))));
    // s09 Dashboard → Graph
    L = nextLang(); await beat('s09', L, 'Dashboard Graph'); await setLang(L, 'session');
    await hclick('#idmp-toolbar [data-tb="toggle"]'); await page.waitForTimeout(600);
    n1 = PAGELOG.length; await pill('dashboard'); await page.waitForTimeout(800);
    fact('dashOpen', last(n1, /§DASHBOARD-OPEN/)); fact('dashOverview', last(n1, /§DASH-OVERVIEW/));
    // s10 Dashboard → Timeline
    L = nextLang(); await beat('s10', L, 'Dashboard Timeline');
    n1 = PAGELOG.length; await hclick('.dash-tabs .dash-tab >> nth=4'); await page.waitForTimeout(1200);
    fact('dashTimeline', last(n1, /§DASH-TIMELINE/));
    // s11 World History across pages
    L = nextLang(); await beat('s11', L, 'World History'); await hclick('.posted-ov-x'); await hold(400); await setLang(L, 'session');
    n1 = PAGELOG.length; await pill('worldhist'); await page.waitForTimeout(1200);
    fact('worldHist', (last(n1, /§IDMP-HISTORY-TOGGLE/) + ' | ' + last(n1, /§WHOLE-OPEN/)).slice(0, 300));
    await hold(1200); await pill('worldhist'); await page.waitForTimeout(500);
    // s12 Project: BIM: Hospital
    L = nextLang(); await beat('s12', L, 'Project BIM: Hospital'); await setLang(L, 'session');
    await openWinById(130); await gotoRecord(990000);
    fact('project', JSON.stringify(await page.evaluate(() => window.__idmpDb.exec('SELECT Name, PlannedAmt, (SELECT COUNT(*) FROM C_ProjectLine WHERE C_Project_ID=990000), (SELECT COUNT(*) FROM C_ProjectPhase WHERE C_Project_ID=990000) FROM C_Project WHERE C_Project_ID=990000')[0].values[0])));
    // s13 its EVM card on the Dashboard Graph
    L = nextLang(); await beat('s13', L, 'Planned vs committed');
    n1 = PAGELOG.length; await pill('dashboard'); await page.waitForTimeout(1200);
    fact('variance', last(n1, /§DASH-VARIANCE/)); await glide('.dash-scurve[data-dim="__variance"]').catch(() => {}); await hold(1200);
    // s14 Project Line: IFC classes as products → the IfcWall line
    L = nextLang(); await beat('s14', L, 'Project Line IfcWall'); await hclick('.posted-ov-x'); await hold(400); await setLang(L, 'session');
    // iDempiere's Project Line tab holds only phase-less lines (AD_Tab whereclause); the Hospital's 28 lines sit under
    //   its 7 phases AND their tasks → Phase (Architecture) → Task (MASON) → Task Line (TabLevel 3) → IfcWall
    await hclick('#idmp-tabstrip .idmp-adtab[title="TabLevel 1 · C_ProjectPhase"]'); await page.waitForTimeout(1200);
    const arch = await one("SELECT C_ProjectPhase_ID FROM C_ProjectPhase WHERE C_Project_ID=990000 AND Name='Architecture'");
    await gotoRecord(arch);
    // the trick: the Hospital's lines carry a task too → Task (MASON) → Task Line (TabLevel 3) → IfcWall
    await hclick('#idmp-tabstrip .idmp-adtab[title="TabLevel 2 · C_ProjectTask"]'); await page.waitForTimeout(1200);
    const mason = await one("SELECT l.C_ProjectTask_ID FROM C_ProjectLine l JOIN M_Product p ON p.M_Product_ID=l.M_Product_ID WHERE l.C_Project_ID=990000 AND p.Value='IfcWall'");
    fact('task', mason + ' ' + await one('SELECT Name FROM C_ProjectTask WHERE C_ProjectTask_ID=' + Number(mason)));
    await gotoRecord(mason);
    await hclick('#idmp-tabstrip .idmp-adtab[title="TabLevel 3 · C_ProjectLine"]'); await page.waitForTimeout(1200);
    fact('taskLines', await page.$eval('#idmp-status', e => e.innerText).catch(() => ''));
    const wall = await one("SELECT l.C_ProjectLine_ID FROM C_ProjectLine l JOIN M_Product p ON p.M_Product_ID=l.M_Product_ID WHERE l.C_Project_ID=990000 AND p.Value='IfcWall'");
    fact('wallLine', JSON.stringify(await page.evaluate(id => window.__idmpDb.exec('SELECT l.PlannedQty, l.PlannedAmt FROM C_ProjectLine l WHERE l.C_ProjectLine_ID=' + id)[0].values[0], wall)));
    await gotoRecord(wall);
    // s15 Zoom Across → the Viewer opens in a new tab; the camera follows it
    L = nextLang(); await beat('s15', L, 'Zoom Across → Viewer'); await setLang(L, 'session');
    n1 = PAGELOG.length;
    const [vp] = await Promise.all([ctx.waitForEvent('page', { timeout: 20000 }), pill('zoomacross')]);
    fact('zoomAcross', last(n1, /§ZOOM-ACROSS launch/) || 'NONE');
    wire(vp, '[viewer] '); page = vp; await castOn(vp); await page.mouse.move(720, 405);
    // s16 + s17 — the Viewer (English: its translation is not complete), stops there
    await beat('s16', 'en_US', 'Viewer loading the Hospital');
    for (let i = 0; i < 90 && !last(0, /§ZOOM-SCOPE/); i++) await page.waitForTimeout(500);
    fact('zoomScope', last(0, /§ZOOM-SCOPE/) || 'NONE');
    await beat('s17', 'en_US', 'same element set + cost');
    for (let i = 0; i < 40 && !last(0, /§ZOOM-COST/); i++) await page.waitForTimeout(500);
    fact('zoomCost', last(0, /§ZOOM-COST/) || 'NONE');
    await hold(4000);
    await beat('end', 'en_US', '');
    say('§ERP_FILM_CURSOR clicks=' + clicks + ' cursorOnTarget=' + cursorOk + (clicks === cursorOk ? ' OK' : ' WRONG'));
  } catch (e) { say('§ERP_FILM_ERROR ' + e.message.split('\n')[0]); }

  if (cdp) await cdp.send('Page.stopScreencast').catch(() => {}); await page.waitForTimeout(300).catch(() => {});
  const endTs = Date.now() / 1000;
  fs.writeFileSync(path.join(OUT, 'erp_film.page.log'), PAGELOG.join('\n') + '\n');
  const lines = [];
  frames.forEach((f, i) => { const d = (i + 1 < frames.length ? frames[i + 1].ts : endTs) - f.ts; lines.push(`file '${f.fn}'`, `duration ${Math.max(d, 0.001).toFixed(4)}`); });
  if (frames.length) lines.push(`file '${frames[frames.length - 1].fn}'`);
  fs.writeFileSync(path.join(OUT, 'frames.txt'), lines.join('\n') + '\n');
  const mp4 = path.join(OUT, 'erp_film_tech.mp4');
  try {
    execFileSync('ffmpeg', ['-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', path.join(OUT, 'frames.txt'),
      '-vf', 'fps=24,scale=1920:1080:flags=lanczos,format=yuv420p', '-c:v', 'libx264', '-crf', '17', '-preset', 'medium', mp4]);
    say('§ERP_FILM_DONE frames=' + frames.length + ' dur=' + (endTs - (T0 || endTs)).toFixed(2) + ' out=' + mp4);
  } catch (e) { say('§ERP_FILM_ERROR ffmpeg ' + String(e.message).split('\n')[0]); }
  fs.writeFileSync(path.join(OUT, 'erp_film.log'), LOG.join('\n') + '\n');
  await browser.close(); server.close();
})();
