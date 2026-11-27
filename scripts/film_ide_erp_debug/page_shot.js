// ⚠ DO NOT REMOVE — SCOPE: film 3 (prompts/FILM_IDE_ERP_DEBUG.md). Opens the REAL ERP page (erp/idempiere.html of the NEW tree) on a kernel database file, headless on the CPU (--disable-gpu), the Invoice (Customer)
// window, and writes a picture + the grid's own text (head, rows) as one line `PS_RESULT {json}`. The page is OPENED on the data the kernel wrote earlier: it is not linked to the kernel. READ the log.
// Usage: node page_shot.js <bim-ootb tree serving the page> <kernel db> <login user id> <window id> <out png> [grep text]
'use strict';
const fs = require('fs'), path = require('path'), os = require('os'), http = require('http');
const [OOTB, DB, USER, WIN, PNG] = process.argv.slice(2).map((x, i) => i === 0 || i === 1 || i === 4 ? path.resolve(x) : x);
const puppeteer = require(process.env.PUPPETEER_PATH || path.join(os.homedir(), 'bim-compiler', 'node_modules', 'puppeteer'));
const MIME = { '.html': 'text/html', '.js': 'application/javascript', '.mjs': 'application/javascript', '.json': 'application/json', '.css': 'text/css', '.png': 'image/png', '.svg': 'image/svg+xml', '.wasm': 'application/wasm', '.db': 'application/octet-stream' };
const srv = http.createServer((q, r) => { const u = decodeURIComponent(q.url.split('?')[0]), f = u === '/erp/film_kernel.db' ? DB : path.join(OOTB, u);
  fs.readFile(f, (e, b) => { if (e) { r.writeHead(404); r.end(); return; } r.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' }); r.end(b); }); }).listen(0);
(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-gpu', '--lang=en-US'] });
  const pg = await browser.newPage(); await pg.setViewport({ width: 1280, height: 358, deviceScaleFactor: 1.5 }); const errs = []; pg.on('pageerror', e => errs.push(String(e.message).slice(0, 160)));
  await pg.goto('http://localhost:' + srv.address().port + '/erp/idempiere.html?lang=en_US&seed=film_kernel.db&login=' + USER + '&window=' + WIN + (process.env.PS_RECORD ? '&record=' + process.env.PS_RECORD : ''), { waitUntil: 'networkidle0', timeout: 120000 });
  await pg.waitForFunction(() => document.querySelector('#idmp-tree') && document.querySelector('#idmp-tree').children.length > 0, { timeout: 60000 });
  await pg.waitForFunction(() => /Record \d+ of \d+|No records|0 of 0/i.test(document.body.innerText) || document.querySelectorAll('table th').length > 2, { timeout: 60000 }).catch(() => {});
  await new Promise(r => setTimeout(r, 2000));
  if (process.env.PS_RECORD) { const seen = await pg.waitForFunction(() => Array.from(document.querySelectorAll('label')).some(l => /Date Invoiced/.test(l.innerText) && l.querySelector('input') && l.querySelector('input').value), { timeout: 60000 }).then(() => true, () => false); console.log('PS_WAIT form_field_seen=' + seen); await new Promise(r => setTimeout(r, 1200)); }
  for (const c of (process.env.PS_CLICKS || '').split(',').filter(Boolean)) {   // toolbar buttons by the start of their own title (e.g. 'ReQuery', 'Grid Toggle')
    const ok = await pg.evaluate(t => { const b = Array.from(document.querySelectorAll('[title]')).find(e => e.offsetParent && e.getAttribute('title').indexOf(t) === 0); if (b) b.click(); return !!b; }, c);
    console.log('PS_CLICK ' + c + ' found=' + ok); await new Promise(r => setTimeout(r, 2500));
  }
  const dom = await pg.evaluate(() => { const tb = Array.from(document.querySelectorAll('table')).filter(t => t.querySelectorAll('th').length > 2)[0]; if (!tb) return { grid: false, text: document.body.innerText.slice(0, 600) };
    return { grid: true, head: Array.from(tb.querySelectorAll('th')).map(x => x.innerText.trim()).filter(Boolean), rows: Array.from(tb.querySelectorAll('tbody tr')).map(tr => Array.from(tr.querySelectorAll('td')).map(td => td.innerText.trim())).filter(r => r.join('').length > 0), status: (document.body.innerText.match(/Record \d+ of \d+/) || [''])[0] }; });
  const ev = process.env.PS_EVAL ? await pg.evaluate(process.env.PS_EVAL).catch(e => 'EVAL_ERR ' + e.message) : null;
  const fields = await pg.evaluate(() => { const o = {}; document.querySelectorAll('label').forEach(l => { const i = l.querySelector('input,select'); if (i && l.offsetParent) o[l.innerText.split('\n')[0].replace(/\s*\*$/, '').trim()] = i.value; }); return o; });
  await pg.screenshot({ path: PNG }); await browser.close(); srv.close();
  console.log('PS_RESULT ' + JSON.stringify({ png: PNG, pageErrors: errs, fields, status: await Promise.resolve(null), dom, ev }));
})().catch(e => { console.error('PS_FAIL ' + (e && e.stack || e)); process.exit(1); });
