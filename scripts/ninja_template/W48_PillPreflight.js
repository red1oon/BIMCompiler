// W48 — the template check + SELECT-only guard are WIRED into the Excel Report pill's host (erp/ninja_report.js), in the real ERP page (headless Chromium, CPU only).
// Issues proved/disproved: (a) a good template still runs and logs §PREFLIGHT_SUMMARY errors=0; (b) a template whose Input tag matches no Process row is REFUSED with 'TEMPLATE CHECK FAILED' (legacy flow: silent blank cell);
// (c) a template whose Process SQL stacks a second statement is REFUSED with §SQL_REFUSED (nothing executes).  usage: ERP_ROOT=<bim-ootb worktree> node W48_PillPreflight.js
const { chromium } = require(process.env.HOME + '/bim-ootb/tests/node_modules/playwright'); const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = process.env.ERP_ROOT; const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.db': 'application/octet-stream', '.wasm': 'application/wasm', '.css': 'text/css', '.xlsx': 'application/octet-stream', '.ttf': 'font/ttf', '.png': 'image/png', '.svg': 'image/svg+xml' };
const srv = http.createServer((q, r) => { let p = decodeURIComponent(q.url.split('?')[0]); if (p === '/') p = '/erp/idempiere.html'; fs.readFile(path.join(ROOT, p), (e, b) => { if (e) { r.writeHead(404); return r.end('404'); } r.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' }); r.end(b); }); });
(async () => {
  await new Promise(r => srv.listen(0, r)); const port = srv.address().port; const br = await chromium.launch({ args: ['--disable-gpu'] }); const pg = await (await br.newContext()).newPage(); const log = [];
  pg.on('console', m => { const t = m.text(); if (/^§(PREFLIGHT|SQL_REFUSED|NINJA_REPORT)/.test(t)) log.push(t); });
  await pg.goto(`http://localhost:${port}/erp/idempiere.html?login=GardenAdmin`, { waitUntil: 'networkidle' }); await pg.waitForSelector('#idmp-tree .idmp-row.leaf', { state: 'attached', timeout: 25000 });
  const res = await pg.evaluate(async () => {
    const out = {}; const buf = new Uint8Array(await (await fetch('ninja_tb_sample.xlsx')).arrayBuffer()); await window.NinjaReport.ensureLibs(''); if (!window.XLSX) await new Promise((res, rej) => { const sc = document.createElement('script'); sc.src = 'xlsx.mini.min.js?v=1'; sc.onload = res; sc.onerror = rej; document.head.appendChild(sc); });
    const mutate = async (fn) => { const wb = new ExcelJS.Workbook(); await wb.xlsx.load(buf); fn(wb); return new Uint8Array(await wb.xlsx.writeBuffer()); };
    const run = async (t) => { try { await window.NinjaReport.run({ db: window.__idmpDb, template: t, from: '2003-01-01', to: '2003-12-31', base: '', XLSX: window.XLSX }); return 'RAN'; } catch (e) { return String(e.message).split('\n')[0].slice(0, 200); } };
    out.good = await run(buf);
    out.badTag = await run(await mutate(wb => { const ws = wb.getWorksheet('Input'); let done = false; ws.eachRow(r => r.eachCell(c => { const v = typeof c.value === 'object' && c.value && c.value.result != null ? c.value.result : c.value; if (!done && typeof v === 'string' && /^@.*@\d+$/.test(v)) { c.value = '@mistyped_tag@999'; done = true; } })); out.tagMutated = done; }));
    out.stacked = await run(await mutate(wb => { const ws = wb.getWorksheet('Process'); let done = false; ws.eachRow((r, i) => { const c = r.getCell(6); if (!done && i > 1 && typeof c.value === 'string' && c.value.trim() !== '') { c.value = c.value + '; DELETE FROM ad_client'; done = true; } }); out.sqlMutated = done; }));
    return out;
  });
  await br.close(); srv.close();
  const has = re => log.some(l => re.test(l)); const checks = { good_runs: res.good === 'RAN', good_logged_clean: has(/§PREFLIGHT_SUMMARY errors=0 warnings=\d+ - run allowed/), tag_mutated: !!res.tagMutated, bad_tag_refused: /TEMPLATE CHECK FAILED/.test(res.badTag) && /UNMATCHED_TAG/.test(res.badTag), bad_tag_logged: has(/§PREFLIGHT ERROR UNMATCHED_TAG/), sql_mutated: !!res.sqlMutated, stacked_refused: /§SQL_REFUSED/.test(res.stacked) };
  console.log('§PILL_PREFLIGHT ' + JSON.stringify(res)); Object.keys(checks).forEach(k => console.log(`§PILL_PREFLIGHT_CASE ${k} ${checks[k] ? 'ok' : 'WRONG'}`));
  const bad = Object.values(checks).filter(v => !v).length; console.log(`§PILL_PREFLIGHT_VERDICT ${(!checks.tag_mutated || !checks.sql_mutated) ? 'INCONCLUSIVE (a mutation touched nothing)' : bad ? 'FAIL' : 'PASS'} cases=${Object.keys(checks).length} wrong=${bad}`);
})().catch(e => { console.log('§PILL_PREFLIGHT ERROR', e.stack); process.exit(1); });
