// W41 — the Excel Report pill, END TO END on the real ERP page (idempiere.html?login=GardenAdmin), headless Chromium, CPU only. Spec: prompts/NINJAEXCEL_TEMPLATE_ENGINE.md §TB-FILM.
// Issue it proves/disproves: "a user opens the pill on the loaded tenant, loads the report template, sets two dates, presses Run, and gets (a) the painted report in the panel,
// (b) a downloadable .xlsx and (c) a downloadable one-page PDF - with every account row equal to an independent SQL aggregate read from the SAME page db".
// usage: ERP_ROOT=<bim-ootb worktree root> node W41_PillReport.js   env FROM TO (YYYY-MM-DD) NEG=1 (oracle perturbed -> must FAIL)
const { chromium } = require(process.env.HOME + '/bim-ootb/tests/node_modules/playwright');
const http = require('http'), fs = require('fs'), path = require('path'), cp = require('child_process'), os = require('os');
const ROOT = process.env.ERP_ROOT, FROM = (process.env.FROM || '2003-01-01').slice(0, 10), TO = (process.env.TO || '2003-12-31').slice(0, 10);
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.db': 'application/octet-stream', '.wasm': 'application/wasm', '.css': 'text/css', '.xlsx': 'application/octet-stream', '.ttf': 'font/ttf', '.png': 'image/png', '.svg': 'image/svg+xml' };
const srv = http.createServer((q, r) => {
  let p = decodeURIComponent(q.url.split('?')[0]); if (p === '/') p = '/erp/idempiere.html';
  fs.readFile(path.join(ROOT, p), (e, b) => { if (e) { r.writeHead(404); return r.end('404'); } r.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' }); r.end(b); });
});
const parse = (s) => { s = String(s).trim(); if (s === '' || s === '-') return 0; const neg = /^\(.*\)$/.test(s); const v = +s.replace(/[(),]/g, ''); return neg ? -v : v; };
const near = (a, b) => Math.abs(a - b) < 0.005;
(async () => {
  await new Promise(r => srv.listen(0, r)); const port = srv.address().port;
  const br = await chromium.launch({ args: ['--disable-gpu'] }); const ctx = await br.newContext({ acceptDownloads: true }); const pg = await ctx.newPage();
  pg.on('console', m => { const t = m.text(); if (/^§NINJA/.test(t)) console.log('  ' + t); }); pg.on('pageerror', e => console.log('ERR ' + String(e).slice(0, 200)));
  const bad = []; const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'w41-'));
  await pg.goto(`http://localhost:${port}/erp/idempiere.html?login=GardenAdmin`, { waitUntil: 'networkidle' });
  await pg.waitForSelector('#idmp-tree .idmp-row.leaf', { state: 'attached', timeout: 25000 });
  await pg.evaluate(() => {
    const dock = document.getElementById('idmp-pill'), trig = document.querySelector('#idmp-pill-trigger,[data-pill-trigger]');
    if (dock && trig && getComputedStyle(dock).display === 'none') trig.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }));
    document.getElementById('pill-ninja').dispatchEvent(new PointerEvent('pointerup', { bubbles: true }));
  });
  await pg.waitForSelector('#ninja-panel', { timeout: 10000 }); await pg.click('#np-sample-tb'); await pg.waitForSelector('#np-run', { timeout: 10000 });
  await pg.fill('#np-from', FROM); await pg.fill('#np-to', TO); await pg.click('#np-run'); await pg.waitForSelector('#np-rep-sum', { timeout: 60000 });
  const sum = await pg.textContent('#np-rep-sum');
  // independent oracle: SQL on the SAME db the page holds
  const got = await pg.evaluate(({ F, T }) => {
    const db = window.__idmpDb, c = db.exec('SELECT ad_client_id FROM ad_client WHERE ad_client_id>0 ORDER BY ad_client_id LIMIT 1')[0].values[0][0];
    const r = db.exec(`SELECT e.value,e.name,SUM(CASE WHEN SUBSTR(p.startdate,1,10)<'${F}' THEN a.amtacctdr-a.amtacctcr ELSE 0 END),SUM(CASE WHEN SUBSTR(p.startdate,1,10)>='${F}' THEN a.amtacctdr ELSE 0 END),SUM(CASE WHEN SUBSTR(p.startdate,1,10)>='${F}' THEN a.amtacctcr ELSE 0 END) FROM fact_acct a JOIN c_elementvalue e ON e.c_elementvalue_id=a.account_id JOIN c_period p ON p.c_period_id=a.c_period_id WHERE a.ad_client_id=${c} AND a.postingtype='A' AND SUBSTR(p.startdate,1,10)<='${T}' GROUP BY e.value,e.name ORDER BY e.value`);
    return { client: c, rows: r.length ? r[0].values : [] };
  }, { F: FROM, T: TO });
  const O = got.rows.map(r => ({ v: String(r[0]), n: r[1], op: +r[2], dr: +r[3], cr: +r[4] })); if (process.env.NEG === '1' && O.length) O[0].dr += 1;
  const grid = await pg.evaluate(() => [...document.querySelectorAll('#np-preview tr')].map(tr => [...tr.children].map(td => td.textContent)));
  O.forEach((o, i) => { const g = grid[5 + i] || []; if (g[0] !== o.v || g[1] !== o.n || !near(parse(g[2]), o.op) || !near(parse(g[3]), o.dr) || !near(parse(g[4]), o.cr)) bad.push(`panel row ${6 + i} ${o.v}: got ${JSON.stringify(g.slice(0, 5))} want ${o.op} ${o.dr} ${o.cr}`); });
  const tr = 5 + O.length + 1, sdr = O.reduce((a, r) => a + r.dr, 0), scr = O.reduce((a, r) => a + r.cr, 0), T_ = grid[tr] || [];
  if (!near(parse(T_[3]), sdr) || !near(parse(T_[4]), scr)) bad.push(`panel totals ${JSON.stringify(T_.slice(2, 6))} vs ${sdr} ${scr}`);
  const links = await pg.$$('#np-rep a[download]'); const names = await Promise.all(links.map(l => l.getAttribute('download'))); const files = {};
  for (let i = 0; i < links.length; i++) { const [d] = await Promise.all([pg.waitForEvent('download'), links[i].click()]); const f = path.join(tmp, names[i]); await d.saveAs(f); files[names[i].split('.').pop()] = f; }
  await br.close(); srv.close();
  const pdf = files.pdf, xl = files.xlsx;
  const pages = pdf ? (cp.spawnSync('pdfinfo', [pdf], { encoding: 'utf8' }).stdout.match(/Pages:\s+(\d+)/) || [])[1] : null;
  const txt = pdf ? cp.spawnSync('pdftotext', [pdf, '-'], { encoding: 'utf8' }).stdout.replace(/\s+/g, '') : '';
  const must = ['งบทดลอง', 'รหัสบัญชี', 'ยอดยกมา', 'เดบิต', 'เครดิต', 'ยอดคงเหลือ', 'รวม', ...O.map(o => o.v)], miss = must.filter(t => !txt.includes(t));
  const xlOk = !!xl && fs.statSync(xl).size > 5000 && cp.spawnSync('unzip', ['-t', xl]).status === 0;
  console.log(`§PILL_REPORT client=${got.client} period=${FROM}..${TO} accounts=${O.length} totalDebit=${sdr.toFixed(2)} totalCredit=${scr.toFixed(2)} downloads=${Object.keys(files).join('+')} pdfPages=${pages} xlsxValidZip=${xlOk} panelSummary="${(sum || '').replace(/\s+/g, ' ').trim().slice(0, 110)}"`);
  console.log(`§PILL_REPORT_FACT rowsJudged=${O.length} mismatches=${bad.length} pdfMissingStrings=${miss.length}`); bad.slice(0, 5).forEach(b => console.log('   ' + b));
  console.log('§PILL_REPORT_VERDICT ' + (O.length === 0 ? 'INCONCLUSIVE (no accounts judged)' : (bad.length || miss.length || pages !== '1' || !xlOk || !files.pdf || !files.xlsx) ? 'FAIL' : 'PASS'));
})().catch(e => { console.log('§PILL_REPORT ERROR', e.stack); process.exit(1); });
