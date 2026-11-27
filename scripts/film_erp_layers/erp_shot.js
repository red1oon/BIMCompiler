// ⚠ DO NOT REMOVE — SCOPE: film 2 "CH 0 · Immersive Software: the ERP field" (prompts/FILM_IMMERSIVE_SOFTWARE.md FILM 2). ONE session of the REAL ERP page (headless Chromium on the CPU, as bim-ootb
// devtools/hover/tests/witness_erp_hover.js E4 does): GardenWorld login, the Sales Order window from the menu, the dev overlay loaded with its bookmarklet's OWN code (unless ES_OVERLAY=0), then
// REAL mouse moves over the window's fields. Targets: Target Document Type (its stack) and Date Ordered (CalloutEngine.dateAcct: UNPORTED in #3055's overlay, found in #3057's). For each, the
// cursor rests there, the page is photographed, and Alt+1 / Alt+2 are pressed (plain 1 / 2 with ES_ALT=0, the #3055 overlay) with window.open recorded. Also the heap after a forced GC. Prints `ES_RESULT {json}`. Every picture is the page's own pixels.
// Usage: node erp_shot.js <bim-ootb tree> <outPrefix>      env: ES_OVERLAY=0|1
'use strict';
const fs = require('fs'), path = require('path'), http = require('http');
const TREE = path.resolve(process.argv[2]), PRE = path.resolve(process.argv[3]), OVERLAY = process.env.ES_OVERLAY !== '0';
const { chromium } = require(path.join(TREE, 'tests', 'node_modules', 'playwright'));
const BOOKMARKLET = "(function(){var s=document.createElement('script');s.src='/devtools/hover/erp_hover.js?'+Date.now();document.head.appendChild(s)})()";
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.db': 'application/octet-stream', '.css': 'text/css', '.wasm': 'application/wasm', '.svg': 'image/svg+xml', '.png': 'image/png' };
(async () => {
  const res = { tree: TREE, overlay: OVERLAY, console: [], errors: [], targets: {} };
  const srv = http.createServer((q, r) => { const fp = path.join(TREE, decodeURIComponent(q.url.split('?')[0])); fs.stat(fp, (e, st) => { if (e || st.isDirectory()) { r.writeHead(404); r.end(); return; } r.writeHead(200, { 'Content-Type': MIME[path.extname(fp)] || 'application/octet-stream' }); fs.createReadStream(fp).pipe(r); }); });
  await new Promise(z => srv.listen(0, z));
  const br = await chromium.launch({ args: ['--no-sandbox', '--disable-gpu', '--enable-precise-memory-info', '--js-flags=--expose-gc'] }), cx = await br.newContext({ viewport: { width: 1920, height: 1080 }, serviceWorkers: 'block' }), pg = await cx.newPage();
  pg.on('console', m => { const t = m.text(); if (/^§ERP_HOVER /.test(t)) res.console.push(t); }); pg.on('pageerror', e => res.errors.push(String(e).slice(0, 160)));
  try {
    await pg.goto('http://localhost:' + srv.address().port + '/erp/idempiere.html?lang=' + (process.env.ES_LANG || 'en_US'), { waitUntil: 'networkidle', timeout: 180000 });
    await pg.waitForFunction(() => document.querySelector('#idmp-login-clients') && document.querySelector('#idmp-login-clients').children.length > 0, null, { timeout: 120000 });
    await pg.click("#idmp-login-clients .idmp-login-user:has(.nm:text-is('GardenWorld'))"); await pg.waitForSelector('#idmp-login-step1:visible');
    await pg.click("#idmp-login-users .idmp-login-user:has(.nm:text-is('GardenAdmin'))"); await pg.waitForSelector('#idmp-login-step2:visible'); await pg.click('#idmp-login-ok');
    await pg.waitForFunction(() => window.APP && window.APP.clientId != null && document.querySelector('#idmp-tree .idmp-row'), null, { timeout: 120000 }); await pg.waitForTimeout(1500);
    if (OVERLAY) { await pg.evaluate(BOOKMARKLET); await pg.waitForFunction(() => window.__ERP_HOVER && window.__ERP_HOVER.ready, null, { timeout: 30000 }); await pg.evaluate(() => window.__ERP_HOVER.ready);
      await pg.evaluate(() => { window.__opened = []; window.open = u => { window.__opened.push(String(u)); return null; }; }); }
    const mid = await pg.evaluate(() => { const r = window.__idmpDb.exec("SELECT ad_menu_id FROM ad_menu WHERE action='W' AND ad_window_id=143 AND isactive='Y'"); return r.length ? r[0].values[0][0] : 0; });
    const chain = await pg.evaluate(id => { const leaf = document.querySelector('#idmp-tree .idmp-row.leaf[data-menu-id="' + id + '"]'); if (!leaf) return null; const out = []; let n = leaf.parentElement;
      while (n && n.id !== 'idmp-tree') { if (n.classList.contains('idmp-node')) out.unshift(n.querySelector(':scope > .idmp-row').getAttribute('data-menu-id')); n = n.parentElement; } return out; }, mid);
    for (const id of chain || []) { const open = await pg.evaluate(i => { const r = document.querySelector('#idmp-tree .idmp-row[data-menu-id="' + i + '"]'); return r && r.parentElement.classList.contains('open'); }, id); if (!open) { await pg.click('#idmp-tree .idmp-row[data-menu-id="' + id + '"]'); await pg.waitForTimeout(250); } }
    await pg.click('#idmp-tree .idmp-row.leaf[data-menu-id="' + mid + '"]'); await pg.waitForTimeout(3000);
    if (!(await pg.$('[data-ad-table] input[data-col], [data-ad-table] select[data-col]'))) { const tr = await pg.$('tr[data-ad-table][data-ad-record]'); if (tr) { await tr.dblclick(); await pg.waitForTimeout(2500); } }
    await pg.mouse.move(5, 1075); await pg.waitForTimeout(600); await pg.screenshot({ path: PRE + '_window.png' });
    res.heap = await pg.evaluate(async () => { for (let i = 0; i < 3; i++) { if (window.gc) window.gc(); await new Promise(r => setTimeout(r, 300)); } return { used: performance.memory.usedJSHeapSize, gc: !!window.gc }; });
    if (!OVERLAY) { console.log('ES_RESULT ' + JSON.stringify(res)); return; }
    const fields = await pg.evaluate(() => Array.from(document.querySelectorAll('[data-ad-table] [data-col], [data-ad-column]')).filter(e => e.offsetWidth > 0 && e.offsetHeight > 0).map(e => {
      const r = e.getBoundingClientRect(), h = e.hasAttribute('data-ad-table') ? e : e.closest('[data-ad-table]'); return { x: Math.round(r.left + Math.min(20, r.width / 2)), y: Math.round(r.top + r.height / 2), c: e.getAttribute('data-ad-column') || e.getAttribute('data-col') }; }));
    res.fieldsOnScreen = fields.length;
    const cur = () => pg.evaluate(() => { const c = window.__ERP_HOVER.state.cur, t = document.getElementById('erp-hover-tip'), r = t.getBoundingClientRect();
      return c && c.found ? { table: c.table, column: c.column, layers: c.layers.map(l => ({ step: l.step, kind: l.kind, name: l.name, owner: l.owner, at: l.at, legacy: l.legacy, note: l.note })), text: t.textContent, keys: window.__ERP_HOVER.state.keys, tip: { x: r.left, y: r.top, w: r.width, h: r.height } } : null; });
    const pick = { doctype: null, dateordered: null };
    for (const f of fields) {
      await pg.mouse.move(5, 1075); await pg.mouse.move(f.x, f.y); await pg.waitForTimeout(120); const s = await cur(); if (!s) continue;
      if (!pick.doctype && /^C_DocTypeTarget_ID$/i.test(s.column)) pick.doctype = f;
      if (!pick.dateordered && /^DateOrdered$/i.test(s.column)) pick.dateordered = f;
    }
    await pg.keyboard.press('Shift');   // the first key event into a fresh headless page was lost (measured: Alt+1 dropped, Alt+2 worked, on the same field); a harmless key first
    for (const k of Object.keys(pick)) { const f = pick[k]; if (!f) continue;
      await pg.mouse.move(5, 1075); await pg.waitForTimeout(300); await pg.mouse.move(f.x, f.y, { steps: 6 }); await pg.waitForTimeout(700);
      const s = await cur(); await pg.screenshot({ path: PRE + '_' + k + '.png' }); const links = {};
      links.state = await pg.evaluate(() => ({ keys: window.__ERP_HOVER.state.keys, col: window.__ERP_HOVER.state.cur && window.__ERP_HOVER.state.cur.column, focus: document.activeElement && (document.activeElement.tagName + ':' + (document.activeElement.getAttribute('data-col') || '')) }));
      for (const key of ['1', '2']) { await pg.evaluate(() => { window.__opened = []; }); await pg.keyboard.press(process.env.ES_ALT === '0' ? key : 'Alt+' + key); await pg.waitForTimeout(150); links[key] = (await pg.evaluate(() => window.__opened.slice()))[0] || null; }
      res.targets[k] = Object.assign({ point: { x: f.x, y: f.y }, png: PRE + '_' + k + '.png', links }, s); }
  } catch (e) { res.errors.push('FATAL ' + String(e && e.message || e).slice(0, 300)); }
  finally { await br.close(); srv.close(); }
  console.log('ES_RESULT ' + JSON.stringify(res));
})();
