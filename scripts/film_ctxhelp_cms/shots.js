// ⚠ DO NOT REMOVE — SCOPE: film "The container legacy gave us, filled" (bim-compiler prompts/VOCAB_MESSAGE_CATALOG.md §19.18; style prompts/FILM_NARRATION.md PLAYBOOK C + HOUSE STYLE).
//   The pictures and the facts of the TWIN's beats, none typed by hand: the REAL ERP page (a bim-ootb main tree, served from its root), headless Chromium on the CPU (--disable-gpu),
//   viewport 1280x720 at device scale 1.5 (1920x1080 pixels). Every value the film shows or says comes from the page's own § log, its DOM, or the real red1 door. READ out/shots.log.
// Usage: node shots.js <bim-ootb main tree>
'use strict';
const fs = require('fs'), path = require('path'), os = require('os'), http = require('http'), { spawnSync } = require('child_process');
const TREE = path.resolve(process.argv[2]), OUT = path.join(__dirname, process.env.OUTD || 'out'), PAGES = path.join(OUT, 'pages');
const Q1 = process.env.Q1 || 'How do I close a Sales Order?', LANGS = (process.env.LANGS || 'zh_CN,de_DE,es_ES').split(',');
const TENANT = { title: 'Our own Sales Order rule', body: 'Ask the credit desk before you complete an order over the customer\'s credit limit.' };   // a tenant's own words, shown as typed by them (the film says it is an example)
fs.mkdirSync(PAGES, { recursive: true });
const { chromium } = require(process.env.PW || path.join(os.homedir(), 'bim-ootb', 'tests', 'node_modules', 'playwright'));
const LOG = []; const L = (m) => { LOG.push(m); console.log(m); };
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.db': 'application/octet-stream', '.css': 'text/css', '.wasm': 'application/wasm', '.sql': 'text/plain', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.xml': 'application/xml', '.woff2': 'font/woff2' };
const serve = () => new Promise((r) => { const s = http.createServer((req, res) => { const p = decodeURIComponent(req.url.split('?')[0]); fs.readFile(path.join(TREE, p), (e, b) => { if (e) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' }); res.end(b); }); }); s.listen(0, () => r(s)); });
const F = { made: new Date().toISOString(), tree: spawnSync('git', ['-C', TREE, 'rev-parse', '--short', 'HEAD'], { encoding: 'utf8' }).stdout.trim(), shots: {}, lines: {} };
const last = (con, re, from) => { const ls = con.slice(from || 0).filter((l) => re.test(l)); return ls.length ? ls[ls.length - 1] : null; };
const waitLine = async (page, con, re, from, n) => { for (let i = 0; i < (n || 80); i++) { const l = last(con, re, from); if (l) { await page.waitForTimeout(500); return l; } await page.waitForTimeout(150); } return null; };
async function shot(page, name, extra) {
  await page.waitForTimeout(500); await page.screenshot({ path: path.join(PAGES, name + '.png') });
  const r = await page.evaluate(() => { const g = (e) => { if (!e || !e.offsetParent) return null; const b = e.getBoundingClientRect(); return b.height ? { x: Math.round(b.x * 1.5), y: Math.round(b.y * 1.5), w: Math.round(b.width * 1.5), h: Math.round(b.height * 1.5) } : null; }, $ = (id) => g(document.getElementById(id));
    const link = Array.from(document.querySelectorAll('#idmp-howto-ctx a[target="_blank"]')).filter((a) => / …$/.test(a.textContent)).pop();
    return { panel: $('idmp-help'), howtoTitle: $('idmp-howto-title'), ctx: $('idmp-howto-ctx'), card: $('idmp-howto-card'), content: $('idmp-content'), sep: g(document.querySelector('#idmp-howto-ctx hr.hs-sep')), more: g(link) }; });
  F.shots[name] = Object.assign({ file: 'pages/' + name + '.png', rects: r }, extra || {}); L('§FILM_SHOT name=' + name + ' rects=' + JSON.stringify(r) + (extra ? ' ' + JSON.stringify(extra).slice(0, 300) : ''));
}
const panelText = (page) => page.evaluate(() => ({ title: (document.getElementById('idmp-howto-title') || {}).textContent || '', ctx: ((document.getElementById('idmp-howto-ctx') || {}).innerText || '').trim() }));
async function openMenu(page, con, id, re) { const n = con.length; await page.evaluate((m) => document.querySelector('#idmp-tree .idmp-row.leaf[data-menu-id="' + m + '"]').click(), id);
  for (let i = 0; i < 30; i++) { await page.waitForTimeout(200); if (await page.evaluate(() => !!document.querySelector('#idmp-find-ov [data-find-ok]'))) { await page.click('#idmp-find-ov [data-find-ok]'); break; } if (re && last(con, re, n)) break; }
  return n; }
(async () => {
  const srv = await serve(), port = srv.address().port;
  const br = await chromium.launch({ headless: true, args: ['--disable-gpu'] }), ctx = await br.newContext({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1.5 }), page = await ctx.newPage();
  const con = [], errs = []; page.on('console', (m) => con.push(m.text())); page.on('pageerror', (e) => errs.push(e.message));
  await page.goto('http://localhost:' + port + '/erp/idempiere.html?seed=ad_seed.db&login=GardenAdmin', { waitUntil: 'networkidle', timeout: 90000 });
  await page.waitForFunction(() => window.__idmpHowto && window.__idmpFieldHelp && window.__idmpFieldHelp.menu().windows.length > 0, null, { timeout: 60000 });
  F.lines.index = await waitLine(page, con, /^§HELP_SEARCH index lang=en_US/); F.lines.home = last(con, /^§HELP_CTX .* type=H /); F.home = await panelText(page);
  await shot(page, 'home', { line: F.lines.home, panel: F.home });
  // beat 1: the Context Help window (legacy's own window, the twin's rows); the Find window says Records = N, then the grid
  let n = con.length; await page.evaluate(() => document.querySelector('#idmp-tree .idmp-row.leaf[data-menu-id="200038"]').click());
  let find = ''; for (let i = 0; i < 30 && !find; i++) { await page.waitForTimeout(250); find = await page.evaluate(() => { const o = document.querySelector('#idmp-find-ov'); return o ? o.innerText : ''; }); }
  F.ctxwin = { records: Number((/Records = (\d+)/.exec(find) || [])[1]) }; await page.click('#idmp-find-ov [data-find-ok]'); await page.waitForTimeout(1500);
  if (await page.evaluate(() => !!document.querySelector('#idmp-content #idmp-form, #idmp-content .idmp-form'))) { await page.click('#idmp-toolbar [data-tb="toggle"]'); await page.waitForTimeout(1200); }
  F.ctxwin.rows = await page.$$eval('.idmp-grid tbody tr[data-ad-record]', (e) => e.length); F.ctxwin.window = last(con, /^§IDEMPIERE window=/, n);
  await shot(page, 'ctxwin', F.ctxwin);
  // beat 2: Sales Order, the header tab, then Order Line, then a tab with no topic
  n = await openMenu(page, con, 129, /^§HELP_CTX .* type=T id=186 /); F.so = { line: await waitLine(page, con, /^§HELP_CTX .* type=T id=186 /, n), panel: await panelText(page) };
  await shot(page, 'so_header', F.so);
  n = con.length; await page.evaluate(() => Array.from(document.querySelectorAll('#idmp-tabstrip .idmp-adtab')).find((t) => t.textContent.trim() === 'Order Line').click());
  F.line = { line: await waitLine(page, con, /^§HELP_CTX .* type=T id=187 /, n), panel: await panelText(page) }; await shot(page, 'so_line', F.line);
  n = con.length; await page.evaluate(() => Array.from(document.querySelectorAll('#idmp-tabstrip .idmp-adtab')).find((t) => t.textContent.trim() === 'Order Tax').click());
  F.tax = { line: await waitLine(page, con, /^§HELP_CTX .* type=T /, n), panel: await panelText(page) }; await shot(page, 'so_tax', F.tax);
  // beat 3: back on the header; the topic's last line is the link to the guide section where the text stops (F7); the guide itself, its own page
  n = con.length; await page.evaluate(() => document.querySelectorAll('#idmp-tabstrip .idmp-adtab')[0].click()); await waitLine(page, con, /^§HELP_CTX .* type=T id=186 /, n);
  F.more = await page.evaluate(() => { const a = Array.from(document.querySelectorAll('#idmp-howto-ctx a[target="_blank"]')).filter((x) => / …$/.test(x.textContent)).pop(); if (!a) return null; a.scrollIntoView({ block: 'center' }); return { text: a.textContent, href: a.getAttribute('href') }; });
  await shot(page, 'so_more', { more: F.more });
  if (F.more) { const g = await ctx.newPage(); try { await g.goto(F.more.href, { waitUntil: 'networkidle', timeout: 60000 }); await g.waitForTimeout(800);
    F.guide = await g.evaluate((h) => { const id = decodeURIComponent(h.split('#')[1] || ''), e = document.getElementById(id); return { title: document.title, heading: e ? e.textContent.replace(/¶/g, '').trim() : null, url: location.href }; }, F.more.href);
    await g.screenshot({ path: path.join(PAGES, 'guide.png') }); F.shots.guide = { file: 'pages/guide.png', rects: {} }; L('§FILM_SHOT name=guide ' + JSON.stringify(F.guide)); } catch (e) { L('§FILM_GUIDE_FAIL ' + e.message); } await g.close(); }
  // beat 4: the question box
  n = con.length; await page.click('#idmp-howto-q'); await page.fill('#idmp-howto-q', ''); await page.type('#idmp-howto-q', Q1, { delay: 15 }); await page.keyboard.press('Enter');
  F.ask = { q: Q1, line: await waitLine(page, con, /^§HELP_SEARCH ask=/, n), card: await page.evaluate(() => document.getElementById('idmp-howto-card').innerText) }; await shot(page, 'ask', F.ask);
  // beat 5: the languages, Sales Order header in view
  F.langs = {};
  for (const lg of LANGS) {
    n = con.length; await page.selectOption('#idmp-lang', lg); await waitLine(page, con, new RegExp('^§HELP_SEARCH index lang=' + lg), n, 200);
    const cl = await waitLine(page, con, new RegExp('^§HELP_CTX .* type=T id=186 '), n, 100); F.langs[lg] = { line: cl, panel: await panelText(page) }; await page.evaluate(() => { const c = document.getElementById('idmp-howto-ctx'); if (c) c.scrollIntoView({ block: 'start' }); });
    await shot(page, 'lang_' + lg, F.langs[lg]);
  }
  n = con.length; await page.selectOption('#idmp-lang', 'en_US'); await waitLine(page, con, /^§HELP_SEARCH index lang=en_US/, n, 200);
  // beat 6: a tenant's own words (W-CTXHELP-OVERLAY K9's path): Context Help -> help 1000000 -> Message -> New -> MsgText -> Save; then Sales Order shows it, no reload
  const TEXT = '<p><strong>' + TENANT.title + '</strong></p><p>' + TENANT.body + '</p>';
  await openMenu(page, con, 200038, null); await page.waitForTimeout(1500);   // the window is already open from beat 1: no Find window then
  if (await page.evaluate(() => !!document.querySelector('#idmp-content #idmp-form, #idmp-content .idmp-form'))) { await page.click('#idmp-toolbar [data-tb="toggle"]'); await page.waitForTimeout(900); }
  await page.evaluate(() => { const tr = [...document.querySelectorAll('.idmp-grid tbody tr[data-ad-record]')].find((x) => x.getAttribute('data-ad-record') === '1000000'); if (tr) tr.click(); });
  await page.waitForTimeout(800); await page.click('#idmp-tabstrip >> text=Message'); await page.waitForTimeout(1500);
  await page.click('#idmp-toolbar [data-tb="new"]'); await page.waitForSelector('#idmp-inline-mount [data-col="msgtext"]', { timeout: 10000 }); await page.waitForTimeout(700);
  const ta = page.locator('#idmp-inline-mount [data-col="msgtext"]').first(); await ta.fill(TEXT); await ta.blur().catch(() => {}); await shot(page, 'tenant_typed');
  n = con.length; await page.click('#idmp-toolbar [data-tb="save"]'); await page.waitForTimeout(2500);
  F.tenant = { title: TENANT.title, body: TENANT.body, save: last(con, /^§CRUD validate key=ad_ctxhelpmsg /, n), persist: last(con, /^§CRUD-PERSIST key=ad_ctxhelpmsg /, n),
    rows: await page.evaluate(() => window.__tipRead.rows('SELECT ad_client_id AS c, length(msgtext) AS n FROM ad_ctxhelpmsg WHERE ad_ctxhelp_id=1000000 ORDER BY ad_client_id')) };
  n = await openMenu(page, con, 129, /^§HELP_CTX .* type=T id=186 /); F.tenant.line = await waitLine(page, con, /^§HELP_CTX .* type=T id=186 /, n); F.tenant.panel = await panelText(page);
  await page.evaluate(() => { const c = document.getElementById('idmp-howto-ctx'); if (c) c.scrollIntoView({ block: 'start' }); }); await shot(page, 'tenant_shown', { line: F.tenant.line });
  F.errors = errs; await br.close(); srv.close();
  // beat 4b: the same question at the red1 prompt, through the real door
  const line = 'cd Order; ask "' + Q1 + '"', r = spawnSync(process.execPath, [path.join(TREE, 'common', 'door', 'red1.js'), line], { cwd: TREE, encoding: 'utf8', env: Object.assign({}, process.env, { LANG: 'en_US.UTF-8' }), timeout: 120000 });
  const envs = (r.stdout || '').split('\n').filter((l) => l.trim().startsWith('{')).map((l) => { try { return JSON.parse(l); } catch (e) { return {}; } }), env = envs.find((e) => e.verb === 'erp.ask') || {}, a = env.answer || {};
  F.cli = { line, arrow: (String(r.stderr || '').split('\n').filter((l) => l.startsWith('→ erp.ask')).pop() || '').trim(), status: env.status, window: a.window || null, action: a.action ? a.action.code : null, summary: a.summary || '', exit: r.status };
  L('§FILM_CLI ' + JSON.stringify({ line, status: env.status, window: a.window && a.window.id, action: F.cli.action, exit: r.status }));
  fs.writeFileSync(path.join(OUT, 'facts.json'), JSON.stringify(F, null, 1));
  L('§FILM_FACTS ctxwin=' + JSON.stringify(F.ctxwin) + ' | so=' + F.so.line + ' | line=' + F.line.line + ' | tax=' + F.tax.line + ' | more=' + JSON.stringify(F.more) + ' | guide=' + JSON.stringify(F.guide || null) + ' | ask=' + F.ask.line +
    ' | langs=' + LANGS.map((l) => (F.langs[l] || {}).line).join(' / ') + ' | tenant=' + F.tenant.line + ' rows=' + JSON.stringify(F.tenant.rows) + ' | errors=' + errs.length);
  fs.writeFileSync(path.join(OUT, 'shots.log'), LOG.join('\n') + '\n');
})().catch((e) => { L('§FILM_ERROR ' + (e && e.stack || e)); fs.writeFileSync(path.join(OUT, 'shots.log'), LOG.join('\n') + '\n'); process.exit(1); });
