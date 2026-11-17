// ⚠ DO NOT REMOVE — SCOPE: film "Help that answers" (bim-compiler prompts/VOCAB_MESSAGE_CATALOG.md §11; style prompts/FILM_NARRATION.md HOUSE STYLE). The pictures and the facts, none typed by hand:
//   the REAL ERP page (bim-ootb main tree, served from its root as live), headless Chromium on the CPU (--disable-gpu), viewport 1280x720 at device scale 1.5 (1920x1080 pixels, every glyph 1.5x for the film).
//   Every number the film speaks comes from the page's own § log lines, the witness logs run on the same tree, the help pack files, GitHub (the PR states) and the saved prior-art copies. READ out/shots.log.
// Usage: node shots.js <bim-ootb main tree>
'use strict';
const fs = require('fs'), path = require('path'), os = require('os'), http = require('http'), { spawnSync } = require('child_process');
const TREE = path.resolve(process.argv[2]), OUT = path.join(__dirname, process.env.OUTD || 'out'), PAGES = path.join(OUT, 'pages');
const LB_LANG = process.env.LB_LANG || 'de_DE', LB_COL = process.env.LB_COL || 'DocumentNo';
// §12/§13 cut (the Mandarin v2): UI_LANG = the screen language from login (no switch beat); Q1/Q2 = the two typed questions; CLI_ASK=1 = the same question asked at the red1 prompt (its real answer)
const UI = process.env.UI_LANG || '', Q1 = process.env.Q1 || 'How do I close a Sales Order?', Q2 = process.env.Q2 || 'How can I void a payment?';   // the language beat: which language, which Sales Order field (the English cut: Deutsch, Document No)
fs.mkdirSync(PAGES, { recursive: true });
const { chromium } = require(process.env.PW || path.join(os.homedir(), 'bim-ootb', 'tests', 'node_modules', 'playwright'));
const LOG = []; const L = (m) => { LOG.push(m); console.log(m); };
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.db': 'application/octet-stream', '.css': 'text/css', '.wasm': 'application/wasm', '.sql': 'text/plain', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml' };
const serve = () => new Promise((r) => { const s = http.createServer((req, res) => { const p = decodeURIComponent(req.url.split('?')[0]); fs.readFile(path.join(TREE, p), (e, b) => { if (e) { res.writeHead(404); res.end(); return; } res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' }); res.end(b); }); }); s.listen(0, () => r(s)); });
const F = { made: new Date().toISOString(), tree: spawnSync('git', ['-C', TREE, 'rev-parse', '--short', 'HEAD'], { encoding: 'utf8' }).stdout.trim(), shots: {}, lines: {} };
async function session(port, opts) {
  const br = await chromium.launch({ headless: true, args: ['--disable-gpu', '--js-flags=--expose-gc', '--enable-precise-memory-info'] });
  const ctx = await br.newContext({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1.5 }), page = await ctx.newPage();
  if (opts && opts.blockHelp) await page.route('**/i18n/help/**', (r) => r.abort());
  const con = [], errs = []; page.on('console', (m) => con.push(m.text())); page.on('pageerror', (e) => errs.push(e.message));
  await page.goto('http://localhost:' + port + '/erp/idempiere.html?seed=ad_seed.db&login=GardenAdmin' + (UI ? '&lang=' + UI : ''), { waitUntil: 'networkidle', timeout: 90000 });
  await page.waitForFunction(() => window.__idmpHowto && window.__idmpFieldHelp && window.__idmpFieldHelp.menu().windows.length > 0, null, { timeout: 60000 });
  for (let i = 0; i < 60 && !con.some((l) => (UI ? l.startsWith('§HELP_SEARCH index lang=' + UI) : /^§HELP_SEARCH index/.test(l))); i++) await page.waitForTimeout(250);
  return { br, page, con, errs };
}
const last = (con, re) => { const ls = con.filter((l) => re.test(l)); return ls.length ? ls[ls.length - 1] : null; };
async function shot(page, name, con) {
  await page.waitForTimeout(400); await page.screenshot({ path: path.join(PAGES, name + '.png') });
  // where the help panel's parts are, in the PNG's own pixels (x1.5): the cards crop the panel from these, never by hand
  const r = await page.evaluate(() => { const g = (id) => { const e = document.getElementById(id); if (!e || !e.offsetParent) return null; const b = e.getBoundingClientRect(); return b.height ? { x: Math.round(b.x * 1.5), y: Math.round(b.y * 1.5), w: Math.round(b.width * 1.5), h: Math.round(b.height * 1.5) } : null; };
    return { panel: g('idmp-help'), tooltip: g('idmp-help-tooltip'), tipTitle: g('idmp-help-title'), howtoTitle: g('idmp-howto-title'), card: g('idmp-howto-card'), ctx: g('idmp-howto-ctx') }; });
  F.shots[name] = { file: 'pages/' + name + '.png', rects: r }; L('§FILM_SHOT name=' + name + ' rects=' + JSON.stringify(r)); }
// focus a field of the window in view by its column (read-only form value or inline editor), the way a click does
async function focusField(page, col) {
  return page.evaluate((col) => {
    const host = Array.from(document.querySelectorAll('#idmp-content [data-ad-column]')).find((e) => e.getAttribute('data-ad-column').toLowerCase() === col.toLowerCase()); if (!host) return null;
    const ed = host.querySelector('input, select, textarea, .val') || host; ed.focus(); const r = ed.getBoundingClientRect();
    return { tag: ed.tagName, panel: document.getElementById('idmp-help-tooltip').innerText, x: r.x, y: r.y };
  }, col);
}
(async () => {
  const srv = await serve(), port = srv.address().port;
  // ---- the main session: idle -> ask (close a Sales Order) -> the link -> the field -> ask (void a payment) -> Deutsch
  const S = await session(port), { page, con } = S;
  F.lines.index = last(con, /^§HELP_SEARCH index/); F.lines.panelBound = last(con, /^§FIELD_HELP panel bound/);
  F.idle = await page.evaluate(() => ({ panel: document.getElementById('idmp-help-tooltip').innerText, toolTitle: document.getElementById('idmp-help-title').textContent, howtoTitle: document.getElementById('idmp-howto-title').textContent }));
  await shot(page, 'idle', con);
  const ask = async (q, name) => {
    await page.click('#idmp-howto-q'); await page.fill('#idmp-howto-q', ''); await page.type('#idmp-howto-q', q, { delay: 15 }); await page.keyboard.press('Enter');
    await page.waitForTimeout(500); const line = last(con, /^§HELP_SEARCH ask=/), card = await page.evaluate(() => document.getElementById('idmp-howto-card').innerText);
    await shot(page, name, con); return { q, line, card };
  };
  F.ui = UI || null; F.ask1 = await ask(Q1, 'ask_close');
  const n0 = con.length; await page.click('#idmp-howto-card .hs-card > .hs-row a[data-help-win]');
  for (let i = 0; i < 40 && !con.slice(n0).some((l) => /^§HELP_CTX window=143/.test(l)); i++) await page.waitForTimeout(250);
  await page.waitForTimeout(1500);
  F.link = { link: con.slice(n0).find((l) => /^§HELP_LINK/.test(l)) || null, opened: con.slice(n0).find((l) => /^§IDEMPIERE window=/.test(l)) || null, ctx: con.slice(n0).find((l) => /^§HELP_CTX window=143/.test(l)) || null,
    howto: await page.evaluate(() => document.getElementById('idmp-howto-ctx').innerText) };
  await shot(page, 'link_open', con);
  F.field = await focusField(page, UI ? LB_COL : 'DocumentNo'); F.lines.fieldFocus = last(con, /^§FIELD_HELP focus=/); await shot(page, UI ? 'field_ui' : 'field_en', con);
  await page.click('#idmp-help-title');   // fold the Tool Tip box (Panel.setCollapsible) so the answer card sits at the top of the panel
  F.ask2 = await ask(Q2, 'ask_2');
  await page.click('#idmp-help-title');   // unfold it again for the German beat
  if (!UI) {
  const n1 = con.length; await page.selectOption('#idmp-lang', LB_LANG);
  for (let i = 0; i < 60 && !con.slice(n1).some((l) => l.startsWith('§I18N lang=' + LB_LANG)); i++) await page.waitForTimeout(250);
  await page.waitForTimeout(1500);
  F.lb = { lang: LB_LANG, col: LB_COL, pack: con.slice(n1).find((l) => l.startsWith('§HELP_PACK loaded lang=' + LB_LANG)) || null, i18n: con.slice(n1).find((l) => l.startsWith('§I18N lang=' + LB_LANG)) || null };
  // the fallback first: Document No in that language (no pack text for it in zh_CN -> the English shows, as legacy); then the beat's field, the shot
  F.lb.docNo = await focusField(page, 'DocumentNo');
  F.lb.field = await focusField(page, LB_COL); F.lines.fieldFocusLb = last(con, /^§FIELD_HELP focus=/); await shot(page, 'field_lb', con);
  } else F.lb = { lang: UI, col: LB_COL };
  F.errors = S.errs; await S.br.close();
  // ---- the cost: the same German session with and without the help pack, heap after a forced GC
  const heap = async (blockHelp) => { const s = await session(port, { blockHelp }); await s.page.selectOption('#idmp-lang', UI || LB_LANG); await s.page.waitForTimeout(2500);
    const h = await s.page.evaluate(() => { if (typeof gc === 'function') { gc(); gc(); } return { gc: typeof gc === 'function', used: performance.memory.usedJSHeapSize, pack: !!(window.ErpI18n && ErpI18n.help) }; }); await s.br.close(); return h; };
  F.memory = { withPack: await heap(false), without: await heap(true) }; F.memory.deltaBytes = F.memory.withPack.used - F.memory.without.used;
  L('§FILM_MEMORY with=' + F.memory.withPack.used + ' (pack=' + F.memory.withPack.pack + ') without=' + F.memory.without.used + ' (pack=' + F.memory.without.pack + ') delta=' + F.memory.deltaBytes + ' gc=' + F.memory.withPack.gc);
  srv.close();
  // ---- the pack files and the old tooltip line (the commit before #3126)
  F.packs = {}; ['de_DE', 'fr_FR', 'zh_CN', 'ja_JP', 'en_US'].forEach((l) => { const f = path.join(TREE, 'erp', 'i18n', 'help', l, 'help.json'), j = JSON.parse(fs.readFileSync(f, 'utf8')); F.packs[l] = { bytes: fs.statSync(f).size, fields: Object.keys(j.fields || {}).length, howto: (j.howto || []).length }; });
  const docEn = spawnSync('sqlite3', ['-readonly', path.join(TREE, 'erp', 'ad_seed.db'), "SELECT f.description FROM ad_field f JOIN ad_column c ON c.ad_column_id=f.ad_column_id JOIN ad_tab t ON t.ad_tab_id=f.ad_tab_id WHERE t.ad_window_id=143 AND t.tablevel=0 AND c.columnname='DocumentNo' ORDER BY t.seqno LIMIT 1"], { encoding: 'utf8' }).stdout.trim();
  F.docNoEnglish = docEn;
  // the beat's field: its English Description/Help (the dictionary) and the pack's own texts for its id (what the panel must show)
  const q1 = (sql) => spawnSync('sqlite3', ['-readonly', '-json', path.join(TREE, 'erp', 'ad_seed.db'), sql], { encoding: 'utf8' }).stdout;
  const lr = JSON.parse(q1("SELECT f.ad_field_id fid, f.description fd, f.help fh FROM ad_field f JOIN ad_column c ON c.ad_column_id=f.ad_column_id JOIN ad_tab t ON t.ad_tab_id=f.ad_tab_id WHERE t.ad_window_id=143 AND t.tablevel=0 AND c.columnname='" + LB_COL + "' ORDER BY t.seqno LIMIT 1") || '[]')[0];
  const pk = JSON.parse(fs.readFileSync(path.join(TREE, 'erp', 'i18n', 'help', LB_LANG, 'help.json'), 'utf8')), px = pk.fields[String(lr.fid)] || [-1, -1];
  F.lb.fieldId = lr.fid; F.lb.english = [lr.fd || '', lr.fh || '']; F.lb.packText = px.map((i) => (i >= 0 ? pk.texts[i] : null));
  const dx = pk.fields[String(JSON.parse(q1("SELECT f.ad_field_id fid FROM ad_field f JOIN ad_column c ON c.ad_column_id=f.ad_column_id JOIN ad_tab t ON t.ad_tab_id=f.ad_tab_id WHERE t.ad_window_id=143 AND t.tablevel=0 AND c.columnname='DocumentNo' ORDER BY t.seqno LIMIT 1"))[0].fid)];
  F.lb.docNoHasPack = !!(dx && dx[0] >= 0);
  // §13: the same question at the red1 prompt, in the terminal's language (LANG), through the real door: its answer, and the card red1 prints (the answer's summary)
  if (process.env.CLI_ASK === '1') {
    const line = 'cd Order; ask ' + (/\s/.test(Q1) ? '"' + Q1 + '"' : Q1), r = spawnSync(process.execPath, [path.join(TREE, 'common', 'door', 'red1.js'), line], { cwd: TREE, encoding: 'utf8', env: Object.assign({}, process.env, { LANG: (UI || 'en_US') + '.UTF-8' }), timeout: 120000 });
    const envs = (r.stdout || '').split('\n').filter((l) => l.trim().startsWith('{')).map((l) => { try { return JSON.parse(l); } catch (e) { return {}; } }), env = envs.find((e) => e.verb === 'erp.ask') || {}, a = env.answer || {};   // red1 prints one envelope per word: the erp.ask one
    const V = JSON.parse(fs.readFileSync(path.join(TREE, 'common', 'door', 'verbs.json'), 'utf8')).verbs.find((v) => v.verb === 'erp.ask') || {};
    F.cliAsk = { line, arrow: (String(r.stderr || '').split('\n').filter((l) => l.startsWith('→ erp.ask')).pop() || '').trim(), status: env.status, harm: V.harm || null, lang: a.lang, langBy: a.langBy, howtoLang: a.howtoLang,
      window: a.window || null, action: a.action ? a.action.code : null, summary: a.summary || '' };
    L('§FILM_CLI ' + JSON.stringify({ line, status: env.status, lang: a.lang, by: a.langBy, window: a.window && a.window.id, action: F.cliAsk.action, exit: r.status }));
  }
  const pre = spawnSync('git', ['-C', TREE, 'log', '--format=%h', '-1', '6b2d5f06^'], { encoding: 'utf8' }).stdout.trim();
  const oldSrc = spawnSync('git', ['-C', TREE, 'show', pre + ':erp/idempiere.html'], { encoding: 'utf8', maxBuffer: 1 << 28 }).stdout.split('\n');
  const oi = oldSrc.findIndex((l) => /v\.title = f\.columnName \+ ' · ' \+ f\.referenceType;/.test(l));
  F.oldTooltip = { commit: pre, line: oi + 1, text: oi >= 0 ? oldSrc[oi].trim() : null };
  L('§FILM_OLD tooltip commit=' + pre + ' line=' + (oi + 1) + ' text=' + JSON.stringify(F.oldTooltip.text));
  fs.writeFileSync(path.join(OUT, 'facts.json'), JSON.stringify(F, null, 1));
  L('§FILM_FACTS ask1=' + JSON.stringify(F.ask1.line) + ' | ask2=' + JSON.stringify(F.ask2.line) + ' | link=' + F.link.link + ' ' + F.link.opened + ' | lb=' + F.lb.pack + ' | field_lb=' + JSON.stringify(F.lb.field && F.lb.field.panel.slice(0, 120)) + ' | errors=' + F.errors.length);
  fs.writeFileSync(path.join(OUT, 'shots.log'), LOG.join('\n') + '\n');
})().catch((e) => { L('§FILM_ERROR ' + (e && e.stack || e)); fs.writeFileSync(path.join(OUT, 'shots.log'), LOG.join('\n') + '\n'); process.exit(1); });
