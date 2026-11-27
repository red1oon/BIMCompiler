// ⚠ DO NOT REMOVE — SCOPE: film "Read from legacy's own code" (bim-compiler prompts/VOCAB_MESSAGE_CATALOG.md §19.20; style prompts/FILM_NARRATION.md PLAYBOOK C + HOUSE STYLE; adapted from film_ctxhelp_cms/shots.js §19.18).
//   The pictures and the facts of the TWIN's beats, none typed by hand: the REAL ERP page (a bim-ootb main tree, served from its root), headless Chromium on the CPU (--disable-gpu),
//   viewport 1280x720 at device scale 1.5 (1920x1080 pixels). Every value the film shows or says comes from the page's own § log, its DOM, a command run for real (sed, grep) or a file read
//   here. The panel is narrow, so a long topic is shot in STILLS, scrolled by element (never by pixel), and each still checks that the elements it is meant to show lie inside its crop window.
//   READ out/shots.log. Usage: node shots.js <bim-ootb main tree>
'use strict';
const fs = require('fs'), path = require('path'), os = require('os'), http = require('http'), { spawnSync } = require('child_process');
const TREE = path.resolve(process.argv[2]), OUT = path.join(__dirname, process.env.OUTD || 'out'), PAGES = path.join(OUT, 'pages');
const IDEMP_SRC = path.join(os.homedir(), 'idempiere-dev-setup', 'idempiere', 'org.adempiere.base', 'src'), MODEL_DIR = path.join(IDEMP_SRC, 'org', 'compiere', 'model'), BRIDGE_LOGS = path.join(os.homedir(), '.cache', 'bim_bridge');
const RUN_LOG = process.env.RUN_LOG || 'run_20261123_142109_m3metaall.log', WIN = 620;
fs.mkdirSync(PAGES, { recursive: true });
const { chromium } = require(process.env.PW || path.join(os.homedir(), 'bim-ootb', 'tests', 'node_modules', 'playwright'));
const LOG = []; const L = (m) => { LOG.push(m); console.log(m); };
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.db': 'application/octet-stream', '.css': 'text/css', '.wasm': 'application/wasm', '.sql': 'text/plain', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.xml': 'application/xml', '.woff2': 'font/woff2' };
const serve = () => new Promise((r) => { const s = http.createServer((req, res) => { const p = decodeURIComponent(req.url.split('?')[0]); fs.readFile(path.join(TREE, p), (e, b) => { if (e) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' }); res.end(b); }); }); s.listen(0, () => r(s)); });
const F = { made: new Date().toISOString(), tree: spawnSync('git', ['-C', TREE, 'rev-parse', '--short', 'HEAD'], { encoding: 'utf8' }).stdout.trim(), shots: {}, lines: {}, term: {} };
const last = (con, re, from) => { const ls = con.slice(from || 0).filter((l) => re.test(l)); return ls.length ? ls[ls.length - 1] : null; };
const waitLine = async (page, con, re, from, n) => { for (let i = 0; i < (n || 80); i++) { const l = last(con, re, from); if (l) { await page.waitForTimeout(500); return l; } await page.waitForTimeout(150); } return null; };
const CAP = 1.5;
// a whole-page shot with the rectangles the cards cut from (css px x 1.5)
async function shot(page, name, extra) {
  await page.waitForTimeout(500); await page.screenshot({ path: path.join(PAGES, name + '.png') });
  const r = await page.evaluate(() => { const g = (e) => { if (!e || !e.offsetParent) return null; const b = e.getBoundingClientRect(); return b.height ? { x: Math.round(b.x * 1.5), y: Math.round(b.y * 1.5), w: Math.round(b.width * 1.5), h: Math.round(b.height * 1.5) } : null; }, $ = (id) => g(document.getElementById(id));
    return { panel: $('idmp-help'), ctx: $('idmp-howto-ctx'), content: $('idmp-content') }; });
  F.shots[name] = Object.assign({ file: 'pages/' + name + '.png', rects: r }, extra || {}); L('§FILM_SHOT name=' + name + ' rects=' + JSON.stringify(r) + (extra ? ' ' + JSON.stringify(extra).slice(0, 300) : ''));
}
// the topic's own structure, read from the DOM of the How To panel (the derived section: Before you start / Do it / What Complete does / When it refuses / Needed by)
const panelFacts = (page) => page.evaluate(() => { const root = document.getElementById('idmp-howto-ctx'); if (!root) return null; const T = (e) => (e ? e.textContent.replace(/\s+/g, ' ').trim() : null);
  const bold = (re) => Array.from(root.querySelectorAll('b')).find((b) => re.test(b.textContent.trim())), para = (re) => { const b = bold(re); return b ? b.closest('p') : null; };
  const wc = para(/^What Complete does/), ul = wc ? wc.nextElementSibling : null, lis = ul && ul.tagName === 'UL' ? Array.from(ul.children).map((li) => ({ text: T(li), tick: /✓/.test(li.textContent) })) : [];
  const bf = para(/^Before you start/), rf = para(/^When it refuses/), nb = para(/^Needed by/), links = (p) => (p ? Array.from(p.querySelectorAll('a[data-help-win]')).map((a) => ({ text: T(a), win: a.getAttribute('data-help-win') })) : []);
  const items = (p) => { const t = T(p) || '', i = t.indexOf(':'), body = i >= 0 ? t.slice(i + 1).replace(/\.\s*$/, '') : ''; let d = 0, cur = '', out = []; for (const c of body) { if (c === '(') d++; if (c === ')') d--; if (c === ',' && d === 0) { out.push(cur.trim()); cur = ''; } else cur += c; } if (cur.trim()) out.push(cur.trim()); return out; };
  return { all: root.innerText.trim(), complete: lis, ticks: lis.filter((x) => x.tick).length, before: T(bf), beforeItems: items(bf), beforeLinks: links(bf), refuse: T(rf), refuseTicks: ((T(rf) || '').match(/✓/g) || []).length, needed: T(nb), neededLinks: links(nb), neededItems: items(nb), doit: T(para(/^Do it/)) }; });
// a still of the panel: scroll the panel so an ELEMENT leads (or ends) its visible part, check every must-show element lies inside the crop window, shoot. Never a pixel offset by hand.
async function still(page, name, sp, align, must, extra) {
  await page.evaluate(([sp, align]) => { const root = document.getElementById('idmp-howto-ctx'); let els = Array.from(root.querySelectorAll(sp.sel)); if (sp.text) els = els.filter((x) => x.textContent.trim().indexOf(sp.text) === 0);
    const x = els[sp.nth || 0]; if (!x) throw new Error('no element ' + JSON.stringify(sp)); (sp.block ? (x.closest('p,ul,li') || x) : x).scrollIntoView({ block: align }); }, [sp, align]); await page.waitForTimeout(900);
  const m = await page.evaluate((must) => { const root = document.getElementById('idmp-howto-ctx'), R = (b) => ({ x: Math.round(b.x * 1.5), y: Math.round(b.y * 1.5), w: Math.round(b.width * 1.5), h: Math.round(b.height * 1.5) }), a = document.getElementById('idmp-help').getBoundingClientRect();
    const find = (sp) => { let els = Array.from(root.querySelectorAll(sp.sel)); if (sp.text) els = els.filter((x) => x.textContent.trim().indexOf(sp.text) === 0); const x = els[sp.nth || 0]; return x ? (sp.block ? (x.closest('p,ul,li') || x) : x) : null; };
    return { panel: R(a), must: must.map((q) => { const x = find(q); return { text: q.text || q.sel, rect: x ? R(x.getBoundingClientRect()) : null }; }) }; }, must);
  // the crop window: the top WIN px of the panel; if an element lies below it (the panel cannot scroll further) either grow the window (up to MAXW) or take the bottom WIN px of the panel
  const p = m.panel, y0 = Math.max(0, p.y), MAXW = 680, rs = m.must.map((q) => q.rect), allr = rs.every((r) => r), top = allr ? Math.min(...rs.map((r) => r.y)) : 0, bot = allr ? Math.max(...rs.map((r) => r.y + r.h)) : 0;
  let crop = { x: p.x, y: y0, w: p.w, h: Math.min(WIN, 1080 - y0) }, inside = allr && top >= crop.y - 2 && bot <= crop.y + crop.h + 2, win = 'top';
  if (allr && !inside && top >= y0 - 2 && bot - y0 + 4 <= MAXW) { crop = { x: p.x, y: y0, w: p.w, h: Math.max(WIN, bot - y0 + 4) }; inside = true; win = 'top-grown'; }
  if (allr && !inside) { const by = Math.min(1080, p.y + p.h) - WIN; if (top >= by - 2 && bot <= by + WIN + 2) { crop = { x: p.x, y: by, w: p.w, h: WIN }; inside = true; win = 'bottom'; } }
  // lead with the first must-show element (14 px of air above it) so no text line is cut at the crop's top edge
  if (allr && inside) { const y1 = Math.max(y0, top - 14), h1 = Math.max(WIN, bot - y1 + 4); if (y1 + h1 <= 1080 && h1 <= MAXW && y1 !== crop.y) { crop = { x: p.x, y: y1, w: p.w, h: h1 }; win += '+led'; } }
  await page.screenshot({ path: path.join(PAGES, name + '.png') });
  F.shots[name] = Object.assign({ file: 'pages/' + name + '.png', crop, inside, win, must: m.must }, extra || {});
  L('§FILM_SHOT name=' + name + ' crop=' + JSON.stringify(crop) + ' inside=' + inside + ' window=' + win + ' must=' + m.must.map((q) => q.text + '@' + (q.rect ? q.rect.y + '+' + q.rect.h : 'none')).join(' | ')); }
async function openMenu(page, con, id, re) { const n = con.length; await page.evaluate((m) => document.querySelector('#idmp-tree .idmp-row.leaf[data-menu-id="' + m + '"]').click(), id);
  for (let i = 0; i < 30; i++) { await page.waitForTimeout(200); if (await page.evaluate(() => !!document.querySelector('#idmp-find-ov [data-find-ok]'))) { await page.click('#idmp-find-ov [data-find-ok]'); break; } if (re && last(con, re, n)) break; }
  return n; }
const SO_START = { sel: 'div.hs-row > b', nth: 0 }, HD = (t) => ({ sel: 'b', text: t, block: true }), UL = { sel: 'ul', nth: 0 };
(async () => {
  const srv = await serve(), port = srv.address().port;
  const br = await chromium.launch({ headless: true, args: ['--disable-gpu'] }), ctx = await br.newContext({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: CAP }), page = await ctx.newPage();
  const con = [], errs = []; page.on('console', (m) => con.push(m.text())); page.on('pageerror', (e) => errs.push(e.message));
  await page.goto('http://localhost:' + port + '/erp/idempiere.html?seed=ad_seed.db&login=GardenAdmin', { waitUntil: 'networkidle', timeout: 90000 });
  await page.waitForFunction(() => window.__idmpHowto && window.__idmpFieldHelp && window.__idmpFieldHelp.menu().windows.length > 0, null, { timeout: 60000 });
  F.lines.index = await waitLine(page, con, /^§HELP_SEARCH index lang=en_US/);
  // beat 1: the Context Help window (legacy's own window, the twin's rows); the Find window says Records = N, then the grid
  let n = con.length; await page.evaluate(() => document.querySelector('#idmp-tree .idmp-row.leaf[data-menu-id="200038"]').click());
  let find = ''; for (let i = 0; i < 30 && !find; i++) { await page.waitForTimeout(250); find = await page.evaluate(() => { const o = document.querySelector('#idmp-find-ov'); return o ? o.innerText : ''; }); }
  F.ctxwin = { records: Number((/Records = (\d+)/.exec(find) || [])[1]) }; await page.click('#idmp-find-ov [data-find-ok]'); await page.waitForTimeout(1500);
  if (await page.evaluate(() => !!document.querySelector('#idmp-content #idmp-form, #idmp-content .idmp-form'))) { await page.click('#idmp-toolbar [data-tb="toggle"]'); await page.waitForTimeout(1200); }
  F.ctxwin.rows = await page.$$eval('.idmp-grid tbody tr[data-ad-record]', (e) => e.length); F.ctxwin.window = last(con, /^§IDEMPIERE window=/, n);
  await shot(page, 'ctxwin', F.ctxwin);
  // beat 2, 3, 4, 5: Sales Order, the header tab; the panel's own structure, then four stills (what leads, what must be inside)
  n = await openMenu(page, con, 129, /^§HELP_CTX .* type=T id=186 /); F.so = { line: await waitLine(page, con, /^§HELP_CTX .* type=T id=186 /, n) }; F.so.p = await panelFacts(page);
  L('§FILM_FACTS so complete=' + F.so.p.complete.length + ' ticks=' + F.so.p.ticks + ' before_items=' + F.so.p.beforeItems.length + ' before_links=' + F.so.p.beforeLinks.length + ' refuse_ticks=' + F.so.p.refuseTicks);
  await still(page, 'so_a', SO_START, 'start', [{ sel: 'b', text: 'Before you start.', block: true }, { sel: 'b', text: 'Do it.', block: true }]);
  await still(page, 'so_b', HD('What Complete does.'), 'start', [HD('What Complete does.'), UL]);
  await still(page, 'so_c', HD('When it refuses'), 'start', [HD('When it refuses')]);
  // beat 6: Purchase Order (menu 205 = window 181)
  n = await openMenu(page, con, 205, /^§HELP_CTX .* type=T id=294 /); F.po = { line: await waitLine(page, con, /^§HELP_CTX .* type=T id=294 /, n) }; F.po.p = await panelFacts(page);
  L('§FILM_FACTS po complete=' + F.po.p.complete.length + ' ticks=' + F.po.p.ticks + ' tick_lines=' + JSON.stringify(F.po.p.complete.filter((x) => x.tick).map((x) => x.text.slice(0, 60))) + ' refuse_ticks=' + F.po.p.refuseTicks);
  await still(page, 'po_b', HD('What Complete does.'), 'start', [HD('What Complete does.'), UL]);
  // beat 7: Business Partner (menu 110 = window 123): "Needed by"; a click on Shipment (Customer) in that list; then Shipment's own lines
  n = await openMenu(page, con, 110, /^§HELP_CTX .* type=T id=220 /); F.bp = { line: await waitLine(page, con, /^§HELP_CTX .* type=T id=220 /, n) }; F.bp.p = await panelFacts(page);
  L('§FILM_FACTS bp needed_items=' + F.bp.p.neededItems.length + ' needed_links=' + F.bp.p.neededLinks.length + ' ' + JSON.stringify(F.bp.p.neededLinks.map((l) => l.text + '=' + l.win)));
  await still(page, 'bp_n', HD('Needed by.'), 'start', [HD('Needed by.')]);
  const link = F.bp.p.neededLinks.find((l) => l.text === 'Shipment (Customer)'); F.click = { link: link || null };
  n = con.length;
  if (link) { await page.evaluate((w) => Array.from(document.querySelectorAll('#idmp-howto-ctx a[data-help-win="' + w + '"]')).find((a) => a.textContent.trim() === 'Shipment (Customer)').click(), link.win);
    for (let i = 0; i < 30; i++) { await page.waitForTimeout(200); if (await page.evaluate(() => !!document.querySelector('#idmp-find-ov [data-find-ok]'))) { await page.click('#idmp-find-ov [data-find-ok]'); break; } if (last(con, /^§HELP_CTX .* type=T id=257 /, n)) break; } }
  F.click.line = await waitLine(page, con, /^§HELP_CTX .* type=T id=257 /, n, 60); F.click.tab = await page.evaluate(() => { const t = document.querySelector('#idmp-tabstrip .idmp-adtab.active, #idmp-tabstrip .idmp-adtab.sel'); return t ? t.textContent.trim() : null; });
  L('§FILM_FACTS click link=' + JSON.stringify(F.click.link) + ' -> ' + F.click.line);
  if (!F.click.line) { n = await openMenu(page, con, 180, /^§HELP_CTX .* type=T id=257 /); F.click.line = await waitLine(page, con, /^§HELP_CTX .* type=T id=257 /, n); F.click.viaMenu = true; L('§FILM_FACTS click did not reach window 169; opened from the menu: ' + F.click.line); }
  F.ship = { line: F.click.line }; F.ship.p = await panelFacts(page);
  const more = /and (\d+) more in (\w+\.java)/.exec(F.ship.p.refuse || ''); F.ship.more = more ? { n: Number(more[1]), file: more[2] } : null;
  L('§FILM_FACTS ship complete=' + F.ship.p.complete.length + ' ticks=' + F.ship.p.ticks + ' more=' + JSON.stringify(F.ship.more) + ' refuse_ticks=' + F.ship.p.refuseTicks);
  await still(page, 'ship_b', HD('What Complete does.'), 'start', [HD('What Complete does.'), UL]);
  await still(page, 'ship_c', HD('When it refuses'), 'start', [HD('When it refuses')]);
  F.errors = errs; await br.close(); srv.close();
  // the terminal strips: commands run for real
  const run = (cmd, cwd) => { const r = spawnSync('bash', ['-c', cmd], { cwd, encoding: 'utf8' }); return { cmd, cwd, out: (r.stdout || '').replace(/\n+$/, ''), status: r.status }; };
  F.term.sed = run('sed -n 2178p MOrder.java', MODEL_DIR); L('§FILM_TERM sed status=' + F.term.sed.status + ' out=' + JSON.stringify(F.term.sed.out));
  F.term.tick = run('grep S1-pos-sale ' + RUN_LOG, BRIDGE_LOGS); F.term.ref = run('grep S13b ' + RUN_LOG, BRIDGE_LOGS);
  L('§FILM_TERM tick status=' + F.term.tick.status + ' lines=' + F.term.tick.out.split('\n').length + ' | ref status=' + F.term.ref.status + ' lines=' + F.term.ref.out.split('\n').length);
  const detail = (t) => { const l = t.out.split('\n').find((x) => /^§SCN_DETAIL /.test(x)) || '', i = l.indexOf(' legacy='), j = l.indexOf(' sqlite='); let lg = null, sq = null; try { lg = JSON.parse(l.slice(i + 8, j)); sq = JSON.parse(l.slice(j + 8)); } catch (e) { /* stays null: the guard fails on it */ }
    const verdict = (/^§SCN \S+ (\S+) /.exec(t.out.split('\n').find((x) => /^§SCN /.test(x)) || '') || [])[1] || null; return { line: l, legacy: lg, sqlite: sq, verdict }; };
  F.term.tick.d = detail(F.term.tick); F.term.ref.d = detail(F.term.ref);
  L('§FILM_FACTS tick verdict=' + F.term.tick.d.verdict + ' legacy.shipments_completed=' + (F.term.tick.d.legacy || {}).shipments_completed + ' sqlite.shipments_completed=' + (F.term.tick.d.sqlite || {}).shipments_completed + ' | ref verdict=' + F.term.ref.d.verdict + ' legacy.reason=' + JSON.stringify((F.term.ref.d.legacy || {}).reason));
  fs.writeFileSync(path.join(OUT, 'facts.json'), JSON.stringify(F, null, 1));
  L('§FILM_FACTS ctxwin=' + JSON.stringify(F.ctxwin) + ' | so=' + F.so.line + ' | po=' + F.po.line + ' | bp=' + F.bp.line + ' | ship=' + F.ship.line + ' | errors=' + errs.length);
  fs.writeFileSync(path.join(OUT, 'shots.log'), LOG.join('\n') + '\n');
})().catch((e) => { L('§FILM_ERROR ' + (e && e.stack || e)); fs.writeFileSync(path.join(OUT, 'shots.log'), LOG.join('\n') + '\n'); process.exit(1); });
