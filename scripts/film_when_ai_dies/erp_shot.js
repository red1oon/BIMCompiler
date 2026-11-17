// ⚠ DO NOT REMOVE — SCOPE: film "When AI Dies" beat q2 ("what runs when I change this field?"). ONE session of the REAL ERP page (headless Chromium, software GL, --disable-gpu, serviceWorkers blocked, as bim-ootb
// devtools/hover/tests/witness_erp_hover.js E4 does): GardenWorld login, the Sales Order window opened from the menu, the dev overlay devtools/hover/erp_hover.js loaded with the bookmarklet's OWN code, REAL mouse moves
// over the form fields. The field with the most layers that name a line is hovered, photographed (the page's own pixels), and the key of one callout layer is pressed with window.open recorded (the link the key makes).
// Prints §ERP_SHOT lines and writes out/erp.json + out/pages/erp_hover.png. Nothing is drawn by hand. READ the log.
// Usage: node erp_shot.js <bim-ootb tree>
'use strict';
const fs = require('fs'), path = require('path'), http = require('http');
const ROOT = path.resolve(process.argv[2]), OUT = path.join(__dirname, 'out'); fs.mkdirSync(path.join(OUT, 'pages'), { recursive: true });
const { chromium } = require(process.env.PW || path.join(ROOT, 'tests', 'node_modules', 'playwright'));
const BOOKMARKLET = "(function(){var s=document.createElement('script');s.src='/devtools/hover/erp_hover.js?'+Date.now();document.head.appendChild(s)})()";
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.db': 'application/octet-stream', '.css': 'text/css', '.wasm': 'application/wasm', '.svg': 'image/svg+xml', '.png': 'image/png' };
const L = m => console.log('§ERP_SHOT ' + m);
(async () => {
  const idx = path.join(ROOT, 'devtools/hover/erp_index.json'); if (!fs.existsSync(idx)) require('child_process').spawnSync('node', [path.join(ROOT, 'devtools/hover/gen_erp_index.js'), '--root', ROOT], { encoding: 'utf8' });
  const srv = http.createServer((q, r) => { const fp = path.join(ROOT, decodeURIComponent(q.url.split('?')[0])); fs.stat(fp, (e, st) => { if (e || st.isDirectory()) { r.writeHead(404); r.end(); return; } r.writeHead(200, { 'Content-Type': MIME[path.extname(fp)] || 'application/octet-stream' }); fs.createReadStream(fp).pipe(r); }); });
  await new Promise(z => srv.listen(0, '127.0.0.1', z));
  const br = await chromium.launch({ args: ['--no-sandbox', '--disable-gpu'] }), cx = await br.newContext({ viewport: { width: 1920, height: 1080 }, serviceWorkers: 'block' }), pg = await cx.newPage(), LOG = [];
  pg.on('console', m => LOG.push(m.text())); pg.on('pageerror', e => LOG.push('PAGEERR ' + e));
  const res = { errors: [] };
  try {
    await pg.goto('http://127.0.0.1:' + srv.address().port + '/erp/idempiere.html?lang=en_US', { waitUntil: 'networkidle', timeout: 180000 });
    await pg.waitForFunction(() => document.querySelector('#idmp-login-clients') && document.querySelector('#idmp-login-clients').children.length > 0, null, { timeout: 120000 });
    await pg.click("#idmp-login-clients .idmp-login-user:has(.nm:text-is('GardenWorld'))"); await pg.waitForSelector('#idmp-login-step1:visible');
    await pg.click("#idmp-login-users .idmp-login-user:has(.nm:text-is('GardenAdmin'))"); await pg.waitForSelector('#idmp-login-step2:visible'); await pg.click('#idmp-login-ok');
    await pg.waitForFunction(() => window.APP && window.APP.clientId != null && document.querySelector('#idmp-tree .idmp-row'), null, { timeout: 120000 }); await pg.waitForTimeout(1500);
    await pg.evaluate(BOOKMARKLET); await pg.waitForFunction(() => window.__ERP_HOVER && window.__ERP_HOVER.ready, null, { timeout: 30000 }); await pg.evaluate(() => window.__ERP_HOVER.ready);
    await pg.evaluate(() => { window.__opened = []; window.open = u => { window.__opened.push(String(u)); return null; }; });
    const mid = await pg.evaluate(() => { const r = window.__idmpDb.exec("SELECT ad_menu_id FROM ad_menu WHERE action='W' AND ad_window_id=143 AND isactive='Y'"); return r.length ? r[0].values[0][0] : 0; });
    const chain = await pg.evaluate(id => { const leaf = document.querySelector('#idmp-tree .idmp-row.leaf[data-menu-id="' + id + '"]'); if (!leaf) return null; const out = []; let n = leaf.parentElement;
      while (n && n.id !== 'idmp-tree') { if (n.classList.contains('idmp-node')) out.unshift(n.querySelector(':scope > .idmp-row').getAttribute('data-menu-id')); n = n.parentElement; } return out; }, mid);
    for (const id of chain || []) { const open = await pg.evaluate(i => { const r = document.querySelector('#idmp-tree .idmp-row[data-menu-id="' + i + '"]'); return r && r.parentElement.classList.contains('open'); }, id); if (!open) { await pg.click('#idmp-tree .idmp-row[data-menu-id="' + id + '"]'); await pg.waitForTimeout(250); } }
    await pg.click('#idmp-tree .idmp-row.leaf[data-menu-id="' + mid + '"]'); await pg.waitForTimeout(3000);
    if (!(await pg.$('[data-ad-table] input[data-col], [data-ad-table] select[data-col]'))) { const tr = await pg.$('tr[data-ad-table][data-ad-record]'); if (tr) { await tr.dblclick(); await pg.waitForTimeout(2500); } }
    const targets = await pg.evaluate(() => Array.from(document.querySelectorAll('[data-ad-table] [data-col], [data-ad-column]')).filter(e => e.offsetWidth > 0 && e.offsetHeight > 0).slice(0, 40).map(e => {
      const r = e.getBoundingClientRect(), h = e.hasAttribute('data-ad-table') ? e : e.closest('[data-ad-table]'); return { x: Math.round(r.left + Math.min(20, r.width / 2)), y: Math.round(r.top + r.height / 2), t: h.getAttribute('data-ad-table'), c: e.getAttribute('data-ad-column') || e.getAttribute('data-col') }; }));
    const cur = () => pg.evaluate(() => { const c = window.__ERP_HOVER.state.cur, t = document.getElementById('erp-hover-tip'), r = t ? t.getBoundingClientRect() : null;
      return c && c.found ? { table: c.table, column: c.column, layers: c.layers.map(l => ({ step: l.step, kind: l.kind, name: l.name, at: l.at, legacy: l.legacy || null, note: l.note || null })), text: t ? t.textContent : '', tip: r ? { x: r.left, y: r.top, w: r.width, h: r.height } : null } : null; });
    let best = null; const seen = [];
    for (const g of targets) { await pg.mouse.move(5, 5); await pg.mouse.move(g.x, g.y); await pg.waitForTimeout(150); const c = await cur(); if (!c) continue;
      const lined = c.layers.filter(l => l.at).length, steps = new Set(c.layers.map(l => l.step)).size; seen.push(c.table + '.' + c.column + ' layers=' + c.layers.length + ' lined=' + lined);
      const inView = c.tip && c.tip.y >= 0 && c.tip.y + c.tip.h <= 1080 && c.tip.x + c.tip.w <= 1920 && c.tip.h <= 560;   // the band of the film holds the whole tooltip
      if (inView && c.layers.some(l => l.kind === 'callout' && l.at) && (!best || lined + steps > best.score)) best = { g, c, score: lined + steps }; }
    L('hovered=' + seen.length + ' of ' + targets.length + ' form fields; first: ' + seen.slice(0, 4).join(' | '));
    if (!best) throw new Error('no hovered field has a callout layer that names a line');
    await pg.mouse.move(5, 5); await pg.waitForTimeout(300); await pg.mouse.move(best.g.x, best.g.y, { steps: 8 }); await pg.waitForTimeout(900);
    const c = await cur(); await pg.screenshot({ path: path.join(OUT, 'pages', 'erp_hover.png') });
    const shown = []; String(c.text).split('\n').forEach(ln => { const m = /^\s*\[(\d)\] .*?\s(erp\/[^\s]+:\d+)/.exec(ln); if (m) shown.push({ n: m[1], at: m[2], line: ln.trim() }); });
    const pick = shown.find(s => { const l = c.layers.find(x => x.at === s.at); return l && l.kind === 'callout'; }) || shown[0]; if (!pick) throw new Error('the tooltip shows no numbered layer');
    await pg.evaluate(() => { window.__opened = []; }); await pg.keyboard.press('Alt+' + pick.n); await pg.waitForTimeout(300); const opened = (await pg.evaluate(() => window.__opened.slice()))[0] || '';
    Object.assign(res, { table: c.table, column: c.column, layers: c.layers, text: c.text, tip: c.tip, point: { x: best.g.x, y: best.g.y }, shown, keyPressed: 'Alt+' + pick.n, pickedAt: pick.at, openedLink: opened,
      hoverLine: LOG.find(l => l.indexOf('§ERP_HOVER table=' + c.table) === 0 && l.indexOf(' column=' + c.column + ' ') > 0) || '', installed: LOG.find(l => /§ERP_HOVER installed/.test(l)) || '', pageErrors: LOG.filter(l => /^PAGEERR/.test(l)) });
    L('field=' + c.table + '.' + c.column + ' layers=' + c.layers.length + ' lined=' + c.layers.filter(l => l.at).length + ' steps=' + Array.from(new Set(c.layers.map(l => l.step))).join(',') + ' key=' + res.keyPressed + ' opens=' + opened.replace(ROOT, '<bim-ootb>') + ' tip=' + JSON.stringify(c.tip) + ' page_errors=' + res.pageErrors.length);
    L('tooltip:\n' + c.text);
  } catch (e) { res.errors.push(String(e && e.stack || e).slice(0, 400)); L('FATAL ' + res.errors[0]); }
  finally { await br.close(); srv.close(); }
  fs.writeFileSync(path.join(OUT, 'erp.json'), JSON.stringify(res, null, 1)); L('done errors=' + res.errors.length + ' opened=' + (res.openedLink ? 'Y' : 'N')); process.exit(res.errors.length || !res.openedLink ? 1 : 0);
})();
