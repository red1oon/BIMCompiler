// ⚠ DO NOT REMOVE — SCOPE: film "Help that answers, in the Viewer" (bim-compiler prompts/VOCAB_MESSAGE_CATALOG.md §17.1; house style prompts/FILM_NARRATION.md). The pictures and the facts,
//   none typed by hand: the REAL Viewer page (a bim-ootb main tree, served from its root as live) on the Duplex model, headless Chromium on the CPU (swiftshader, as the witnesses), 1600x900 (the witnesses' viewport) at
//   device scale 1.2 (1920x1080 pixels). The steps are the witnesses' own: Find IfcWall + click until #info-class reads IfcWall (W-CLASS-HELP C5), F1 (W-HELP-DOCK), the search box filled (W-HOWTO H4c),
//   the header dragged (W-HELP-DOCK D3). Every rectangle the cards crop is read from the page. The CLI line is run for real through red1. READ out/shots.log.
// Usage: node shots.js <bim-ootb main tree> [<dir holding Duplex_extracted.db>, default ~/bim-ootb/viewer/buildings]
'use strict';
const fs = require('fs'), path = require('path'), os = require('os'), http = require('http'), { spawnSync } = require('child_process');
const TREE = path.resolve(process.argv[2]), BLD = path.resolve(process.argv[3] || path.join(os.homedir(), 'bim-ootb', 'viewer', 'buildings'));
const OUT = path.join(__dirname, process.env.OUTD || 'out'), PAGES = path.join(OUT, 'pages'); fs.mkdirSync(PAGES, { recursive: true });
const puppeteer = require(process.env.PUPPETEER_PATH || path.join(os.homedir(), 'bim-compiler', 'node_modules', 'puppeteer'));
const LOG = []; const L = (m) => { LOG.push(m); console.log(m); };
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.db': 'application/octet-stream', '.css': 'text/css', '.wasm': 'application/wasm', '.sql': 'text/plain', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.xml': 'application/xml' };
const DBN = 'FilmHelpViewer_extracted.db', VDB = path.join(TREE, 'viewer', 'buildings', DBN);
const serve = () => new Promise((r) => { const s = http.createServer((req, res) => { const p = decodeURIComponent(req.url.split('?')[0]); fs.readFile(path.join(TREE, p), (e, b) => { if (e) { res.writeHead(404); res.end(); return; } res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' }); res.end(b); }); }); s.listen(0, '127.0.0.1', () => r(s)); });
const F = { made: new Date().toISOString(), tree: spawnSync('git', ['-C', TREE, 'rev-parse', '--short', 'HEAD'], { encoding: 'utf8' }).stdout.trim(), shots: {}, lines: {}, errors: [] };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const RE = /§CLASS_HELP|§TRL_LABELS|§HELP_DOCK|§KBD_HELP|§HOWTO_PALETTE|§HOWTO_LOAD|§DRAG_|§KBD_PALETTE_RUN|§LOAD_FAIL/;
async function session(br, port, lang) {
  const page = await br.newPage(); await page.setViewport({ width: 1600, height: 900, deviceScaleFactor: 1.2 });
  const con = []; page.on('console', (m) => { const t = m.text(); if (RE.test(t)) con.push(t); }); page.on('pageerror', (e) => F.errors.push(lang + ': ' + String(e).slice(0, 200)));
  await page.goto('http://127.0.0.1:' + port + '/viewer/viewer.html?db=buildings/' + DBN + '&lang=' + lang, { waitUntil: 'load', timeout: 120000 });
  await page.waitForFunction('window.APP && window.APP.db && window._TRL_READY && window._mainPillActions && window.showCommandPalette', { timeout: 240000 });
  await page.waitForFunction(() => { const w = String(window._trl('ui_status_done', null, 'DONE')).split(/[ —]/)[0]; return !!w && (document.body.innerText || '').indexOf(w) >= 0; }, { timeout: 240000 });
  return { page, con };
}
const last = (con, re) => { const ls = con.filter((l) => re.test(l)); return ls.length ? ls[ls.length - 1] : null; };
// the rectangles the cards crop, in the PNG's own pixels (x1.2), read from the page
async function shot(page, name, ids) {
  await sleep(500); await page.screenshot({ path: path.join(PAGES, name + '.png') });
  const r = await page.evaluate((ids) => { const o = {}; ids.forEach((id) => { const e = document.querySelector(id); if (!e || !e.getClientRects().length) { o[id] = null; return; } const b = e.getBoundingClientRect();
    o[id] = b.width && b.height ? { x: Math.round(b.x * 1.2), y: Math.round(b.y * 1.2), w: Math.round(b.width * 1.2), h: Math.round(b.height * 1.2) } : null; }); return o; }, ids);
  F.shots[name] = { file: 'pages/' + name + '.png', rects: r }; L('§FILM_SHOT name=' + name + ' rects=' + JSON.stringify(r));
}
// W-CLASS-HELP C5: Find 'IfcWall', click results the way a user does until the info panel's class row reads IfcWall; open the IFC definition
async function pickWall(page) {
  await page.evaluate(() => window.APP.openFindPanel('IfcWall')); await sleep(3000);
  const picked = await page.evaluate(async () => { const items = [...document.querySelectorAll('.find-result-item')];
    for (let i = 0; i < Math.min(items.length, 60); i++) { items[i].click(); await new Promise((r) => setTimeout(r, 400)); const c = (document.getElementById('info-class').textContent || '').split(' ')[0]; if (c === 'IfcWall') return { i, of: items.length }; }
    return { i: -1, of: items.length }; });
  await sleep(1500);
  // the Find panel stays open (closing it clears the highlight, nf_panel_search.js closeFindPanel). At 1600x900 it ends above the info panel: measured, the guard checks it
  // (at 1280x720 it covered the info panel's top, and a mouse drag in its 64 px strip did not move it — noted in §17.1 RESULT, not this lane's to fix)
  const fq = await page.evaluate(() => { const f = document.getElementById('find-panel').getBoundingClientRect(), n = document.getElementById('info-panel').getBoundingClientRect();
    return { find: [f.left, f.top, f.right, f.bottom].map(Math.round), info: [n.left, n.top, n.right, n.bottom].map(Math.round), clear: !(f.left < n.right && n.left < f.right && f.top < n.bottom && n.top < f.bottom) && f.left >= 336 }; });
  const t = await page.evaluate(() => { const b = document.getElementById('info-class-help'); if (!b) return null; const d = b.querySelector('details'); if (d) d.open = true;
    const part = (k) => { const e = b.querySelector('[data-cls-part="' + k + '"]'); return e ? e.innerText.replace(/\s+/g, ' ').trim() : null; };
    return { text: b.innerText.replace(/\s+/g, ' ').trim(), ours: part('ours'), ifc: part('ifc') || part('def'), fallback: part('fallback'), credit: part('credit'), parts: [...b.querySelectorAll('[data-cls-part]')].map((e) => e.getAttribute('data-cls-part')) }; });
  return { picked, block: t, findMoved: fq };
}
const blur = (page) => page.evaluate(() => { if (document.activeElement && document.activeElement.blur) document.activeElement.blur(); });
const PAL = ['#cmd-palette', '#cmd-head', '#cmd-search', '#cmd-list', '#info-panel', '#info-class-help'];
(async () => {
  fs.copyFileSync(fs.realpathSync(path.join(BLD, 'Duplex_extracted.db')), VDB);
  const srv = await serve(), port = srv.address().port;
  const br = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  try {
    // ---- the English session: the wall, the panel, the search word, the Find entry, the dock
    const S = await session(br, port, 'en_MY'), { page, con } = S;
    await page.evaluate(() => localStorage.removeItem('bim_help_dock_pos'));
    F.en = await pickWall(page); F.lines.classEn = last(con, /^§CLASS_HELP guid=/); await shot(page, 'klass_en', PAL);
    await blur(page); await page.keyboard.press('F1'); await sleep(600);
    await page.waitForFunction(() => document.querySelectorAll('#cmd-palette .cmd-howto-guide').length > 0, { timeout: 30000 }).catch(() => {});
    F.lines.dockOpen = last(con, /^§HELP_DOCK open/); F.lines.howtoLoad = last(con, /^§HOWTO_LOAD/); await shot(page, 'pal_open', PAL);
    // W-HOWTO H4c: a word that is in some pill's bullets but in no pill name — the film uses 'native'; the facts record that it is in no name and which bullet holds it
    const WORD = 'native';
    F.word = await page.evaluate((w) => { const names = window._mainPillActions.map((a) => String(a.name || '').toLowerCase()).join(' ');
      const holders = window._mainPillActions.filter((a) => (a.children || []).some((c) => String(c.name || '').toLowerCase().indexOf(w) >= 0)).map((a) => ({ id: a.id, name: a.name, bullet: (a.children.find((c) => String(c.name || '').toLowerCase().indexOf(w) >= 0) || {}).name }));
      return { w, inName: names.indexOf(w) >= 0, holders }; }, WORD);
    await page.focus('#cmd-search'); await page.keyboard.type(WORD, { delay: 40 }); await sleep(500);
    F.found = await page.evaluate(() => { const rows = [...document.querySelectorAll('#cmd-palette .cmd-row')]; return rows.map((r) => { const nx = r.nextElementSibling; return { name: r.textContent.replace(/\s+/g, ' ').trim(), open: !!nx && !nx.classList.contains('cmd-row') && nx.style.display === 'block', body: nx && !nx.classList.contains('cmd-row') ? nx.innerText.replace(/\s+/g, ' ').trim() : '' }; }); });
    F.lines.palNative = last(con, /^§HOWTO_PALETTE .*filter="native"/); await shot(page, 'pal_native', PAL);
    // the Find entry: clear the search, open it by its left zone (W-HELP-DOCK D6a's way): its Guide link and its 'Same at the CLI' lines
    await page.evaluate(() => { const i = document.getElementById('cmd-search'); i.value = ''; i.dispatchEvent(new Event('input')); }); await sleep(400);
    const fr = await page.evaluate(() => { const row = [...document.querySelectorAll('#cmd-palette .cmd-row')].find((r) => /^Find/.test(r.textContent.trim())); if (!row) return null; row.scrollIntoView({ block: 'start' }); const b = row.getBoundingClientRect(); return { x: b.left + 10, y: b.top + b.height / 2 }; });
    if (fr) { await page.mouse.click(fr.x, fr.y); await sleep(500); }
    F.find = await page.evaluate(() => { const row = [...document.querySelectorAll('#cmd-palette .cmd-row')].find((r) => /^Find/.test(r.textContent.trim())); const nx = row && row.nextElementSibling; if (!nx) return null;
      nx.id = 'film-find-body'; row.id = 'film-find-row'; const a = nx.querySelector('.cmd-howto-guide a');
      return { name: row.textContent.replace(/\s+/g, ' ').trim(), open: nx.style.display === 'block', guide: a ? a.getAttribute('href') : null, cliLabel: (nx.querySelector('.cmd-howto-cli') || {}).textContent || null, cli: [...nx.querySelectorAll('.cmd-howto-cli-line')].map((l) => l.textContent.trim()) }; });
    await shot(page, 'pal_find', PAL.concat(['#film-find-row', '#film-find-body']));
    // the dock: drag the header right, close with ×, F1 again
    const hd = await page.evaluate(() => { const b = document.getElementById('cmd-head').getBoundingClientRect(); return { x: b.left + 40, y: b.top + b.height / 2 }; });
    const before = await page.evaluate(() => { const b = document.getElementById('cmd-palette').getBoundingClientRect(); return { l: b.left, t: b.top }; });
    await page.mouse.move(hd.x, hd.y); await page.mouse.down(); for (let i = 1; i <= 40; i++) await page.mouse.move(hd.x + 560 * i / 40, hd.y + 20 * i / 40); await page.mouse.up(); await sleep(500);
    const moved = await page.evaluate(() => { const b = document.getElementById('cmd-palette').getBoundingClientRect(); return { l: b.left, t: b.top }; });
    F.lines.dragSave = last(con, /^§DRAG_SAVE key=bim_help_dock_pos/); await shot(page, 'dock_moved', PAL);
    await page.click('#cmd-close'); await sleep(500); F.lines.close = last(con, /^§KBD_HELP close/); await shot(page, 'dock_closed', ['#info-panel']);
    await blur(page); await page.keyboard.press('F1'); await sleep(800);
    const re = await page.evaluate(() => { const b = document.getElementById('cmd-palette').getBoundingClientRect(); return { l: b.left, t: b.top }; });
    F.lines.reopen = last(con, /^§HELP_DOCK open/); F.lines.restore = last(con, /^§DRAG_RESTORE key=bim_help_dock_pos/); await shot(page, 'dock_reopen', PAL);
    const keptOpen = await page.evaluate(() => { const row = [...document.querySelectorAll('#cmd-palette .cmd-row')].find((r) => /^Find/.test(r.textContent.trim())); const nx = row && row.nextElementSibling; return !!nx && !nx.classList.contains('cmd-row') && nx.style.display === 'block'; });
    F.dock = { before, moved, reopened: re, keptOpen };
    await page.evaluate(() => localStorage.removeItem('bim_help_dock_pos')); await page.close();
    // ---- the language beat: the same pick in de_DE and zh_CN (W-CLASS-HELP C5)
    for (const lang of ['de_DE', 'zh_CN']) { const s = await session(br, port, lang); F[lang] = await pickWall(s.page); F.lines['class_' + lang] = last(s.con, /^§CLASS_HELP guid=/); F.lines['trl_' + lang] = last(s.con, /^§TRL_LABELS/); await shot(s.page, 'klass_' + lang, PAL); await s.page.close(); }
  } finally { await br.close(); srv.close(); try { fs.unlinkSync(VDB); } catch (e) {} }
  // ---- the CLI beat: the line the panel offers, run for real at the red1 prompt (it opens its own headless Viewer on the CPU)
  const line = 'viewer.counts building=Duplex', r = spawnSync(process.execPath, [path.join(TREE, 'common', 'door', 'red1.js'), line], { cwd: TREE, encoding: 'utf8', timeout: 300000 });
  const env = (r.stdout || '').split('\n').filter((l) => l.trim().startsWith('{')).map((l) => { try { return JSON.parse(l); } catch (e) { return {}; } }).find((e) => e.verb === 'viewer.counts') || {};
  F.cli = { line, exit: r.status, status: env.status || null, summary: env.answer && env.answer.summary || null, total: env.answer && env.answer.value && env.answer.value.total, viewerLine: env.answer && env.answer.viewerLine || null, door: (String(r.stderr || '').split('\n').filter((l) => /^§DOOR /.test(l)).pop() || '').trim(), ms: env.ms };
  L('§FILM_CLI ' + JSON.stringify(F.cli));
  // ---- the files the close card measures, and the bSDD copies the language beat is checked against
  F.files = {}; ['viewer/help/howto.json', 'viewer/info_class_help.js', 'common/help/help_panel.js', 'common/drag.js'].forEach((f) => { const p = path.join(TREE, f); F.files[f] = fs.existsSync(p) ? fs.statSync(p).size : null; });
  F.howtoCliFind = (JSON.parse(fs.readFileSync(path.join(TREE, 'viewer', 'help', 'howto.json'), 'utf8')).pills.find || {}).cli || [];
  fs.writeFileSync(path.join(OUT, 'facts.json'), JSON.stringify(F, null, 1));
  L('§FILM_FACTS en=' + JSON.stringify(F.en && F.en.picked) + ' de=' + JSON.stringify(F.de_DE && F.de_DE.picked) + ' zh=' + JSON.stringify(F.zh_CN && F.zh_CN.picked) + ' word=' + JSON.stringify(F.word) + ' find=' + JSON.stringify(F.find) + ' dock=' + JSON.stringify(F.dock) + ' errors=' + F.errors.length);
  fs.writeFileSync(path.join(OUT, 'shots.log'), LOG.join('\n') + '\n');
})().catch((e) => { L('§FILM_ERROR ' + (e && e.stack || e)); try { fs.unlinkSync(VDB); } catch (x) {} fs.writeFileSync(path.join(OUT, 'shots.log'), LOG.join('\n') + '\n'); process.exit(1); });
