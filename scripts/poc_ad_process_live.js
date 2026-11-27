// W-AD-PROC-LIVE (UI_UNPARK_RESUME.md B-5 / MULTI_LANE_LAUNCH Lane A) — prove idempiere.html menu P/R
// leaves dispatch through the PROVEN AD_Process spine (ad_process.js, W-PROC) on the live FULL-WIDTH
// ad_seed.db (ad_process 476 + ad_process_para 1208, IDMP_FULLWIDTH_SEED):
//   1. REGISTERED process menu leaf (409 'Verify Document Types' → proc 233 DocumentTypeVerify, no paras)
//      dispatches directly + renders real rows (rows = count(c_doctype) = 52, a seed fact not a guess).
//   2. Param dialog (leaf 502 'Trial Balance' → proc 310, 15 ad_process_para fields, 2 mandatory): Run with
//      C_AcctSchema_ID EMPTY is REJECTED by the spine's prepare gate (§PROC_PARAM_VALIDATE, NO dispatch);
//      fill 101 (real c_acctschema row) → dispatches via report_overlay.foldTrialBalance — fact_acct IS
//      now carried in ad_seed.db (MIGRATE_POSTING_CONFIG, 300 rows TB 46574.97) so TB folds REAL ROWS (>0).
//      [assertion updated 2026-06-12: the old honest-empty seed-gap (`no such table: fact_acct`) is CLOSED.]
//   3. REGISTERED REPORT proc renders rows: ?process=110 deep link (Order Print → report:c_order →
//      foldReceipt over real c_order/c_orderline) — receipt table rows > 0.
//   4. FALSIFIER: leaf 543 'Order Detail' (proc 333, BLANK classname, not in registry) must show the honest
//      "Not available" card (.idmp-procresult.absent) — never a silent no-op (ProcessUtil:166-170 parity).
//   5. REGRESSION (B-4 untouched): GardenUser scopeMenu still 116/159 visible procs.
// Run: ERP_ROOT=/tmp/wt-procdispatch/erp node scripts/poc_ad_process_live.js  (default ROOT=~/bim-ootb/erp)
const { chromium } = require(process.env.HOME + '/bim-ootb/tests/node_modules/playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = process.env.ERP_ROOT || path.join(process.env.HOME, 'bim-ootb', 'erp');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.db': 'application/octet-stream', '.wasm': 'application/wasm', '.css': 'text/css' };
const server = http.createServer((q, r) => {
  let p = decodeURIComponent(q.url.split('?')[0]); if (p === '/') p = '/idempiere.html';
  fs.readFile(path.join(ROOT, p), (e, b) => {
    if (e) { r.writeHead(404); r.end('404'); return; }
    r.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' }); r.end(b);
  });
});
(async () => {
  await new Promise(r => server.listen(0, r)); const port = server.address().port;
  const br = await chromium.launch(); const pg = await br.newContext().then(c => c.newPage());
  const logs = [];
  pg.on('console', m => { const t = m.text(); if (/^(§AD-PROC-LIVE|§PROC_PARAM_VALIDATE|§IDMP-SESSION scopeMenu)/.test(t)) { logs.push(t); console.log('  ' + t); } });
  pg.on('pageerror', e => console.log('ERR ' + String(e).slice(0, 160)));
  let pass = true;
  const fail = (m) => { pass = false; console.log('  ✗ ' + m); };
  const clickLeaf = (name) => pg.$$eval('#idmp-tree .idmp-row.leaf', (rows, n) => {
    const r = rows.find(x => x.dataset.name === n); if (!r) return false; r.click(); return true;
  }, name);
  const gotoLogin = async (who) => {
    await pg.goto(`http://localhost:${port}/idempiere.html?login=${who}`, { waitUntil: 'networkidle' });
    await pg.waitForSelector('#idmp-tree .idmp-row.leaf', { state: 'attached', timeout: 25000 });
  };

  // ── 1. registered PROCESS leaf, no paras → direct dispatch, real rows ──
  console.log('— 1. Verify Document Types (proc 233, registered, no params)');
  await gotoLogin('GardenAdmin');
  if (!await clickLeaf('verify document types')) fail('menu leaf "Verify Document Types" not found');
  await pg.waitForSelector('.idmp-procresult', { timeout: 8000 }).catch(() => fail('no result card for proc 233'));
  const l233 = logs.find(t => t.startsWith('§AD-PROC-LIVE proc=233'));
  if (!l233 || !/dispatched=Y ok=Y rows=(\d+)/.test(l233)) fail('proc 233 did not dispatch ok: ' + l233);
  else if (Number(l233.match(/rows=(\d+)/)[1]) <= 0) fail('proc 233 rows not > 0');
  if (await pg.$('.idmp-procresult.absent')) fail('registered proc 233 rendered the absent card');

  // ── 2. param dialog: mandatory gate REJECTS, then real dispatch (honest-empty TB) ──
  console.log('— 2. Trial Balance (proc 310): mandatory reject, then dispatch');
  if (!await clickLeaf('trial balance')) fail('menu leaf "Trial Balance" not found');
  await pg.waitForSelector('.idmp-procform [data-proc-param="C_AcctSchema_ID"]', { timeout: 8000 }).catch(() => fail('param dialog never rendered'));
  const ptDefault = await pg.$eval('[data-proc-param="PostingType"]', e => e.value).catch(() => null);
  if (ptDefault !== 'A') fail('PostingType default not prefilled from ad_process_para (got ' + ptDefault + ')');
  await pg.click('button[data-proc-run]');                       // C_AcctSchema_ID empty → prepare gate must reject
  await pg.waitForTimeout(200);
  const rej = logs.find(t => t.startsWith('§PROC_PARAM_VALIDATE proc=310') && t.includes('REJECTED'));
  if (!rej || !rej.includes('C_AcctSchema_ID')) fail('missing-mandatory was NOT rejected: ' + rej);
  if (logs.find(t => t.startsWith('§AD-PROC-LIVE proc=310'))) fail('proc 310 dispatched DESPITE missing mandatory');
  const errTxt = await pg.$eval('.idmp-procform .err', e => e.textContent).catch(() => '');
  if (!errTxt.includes('C_AcctSchema_ID')) fail('reject error not shown on-screen');
  // FS-9 (prompts/ERP_FIRST_SETUP_GUIDE.md §FS2i): the TableDir param is now a <select> (MLookupFactory TableDir);
  // pick by value when it is one, type when it is still a text box — the same real row either way.
  const acTag = await pg.$eval('[data-proc-param="C_AcctSchema_ID"]', e => e.tagName).catch(() => '');
  if (acTag === 'SELECT') await pg.selectOption('[data-proc-param="C_AcctSchema_ID"]', '101');
  else await pg.fill('[data-proc-param="C_AcctSchema_ID"]', '101');   // real c_acctschema row (GardenWorld US/A/USD)
  await pg.click('button[data-proc-run]');
  await pg.waitForSelector('.idmp-procresult', { timeout: 8000 }).catch(() => fail('no result card for proc 310'));
  const l310 = logs.find(t => t.startsWith('§AD-PROC-LIVE proc=310'));
  if (!l310 || !l310.includes('classname=org.compiere.report.TrialBalance') || !l310.includes('dispatched=Y ok=Y')) fail('proc 310 did not dispatch ok: ' + l310);
  // seed-gap CLOSED (MIGRATE_POSTING_CONFIG): fact_acct(300) ships on ad_seed.db → TB must fold REAL rows
  const tbRows = l310 ? Number((l310.match(/rows=(\d+)/) || [0, 0])[1]) : 0;
  if (tbRows <= 0) fail('TrialBalance folded 0 rows — fact_acct posting-config seed missing (gap was CLOSED, must stay closed)');
  const gap = await pg.$eval('.idmp-procresult .gap', e => e.textContent).catch(() => '');
  if (gap.includes('fact_acct')) fail('result card still names the fact_acct seed gap despite rows=' + tbRows);

  // ── 3. registered REPORT proc renders rows (deep link, procSet-gated) ──
  console.log('— 3. Order Print (proc 110, report:c_order) via ?process=110 deep link');
  await pg.goto(`http://localhost:${port}/idempiere.html?login=GardenAdmin&process=110`, { waitUntil: 'networkidle' });
  await pg.waitForSelector('.idmp-procresult', { timeout: 25000 }).catch(() => fail('no result card for proc 110'));
  const l110 = logs.find(t => t.startsWith('§AD-PROC-LIVE proc=110'));
  if (!l110 || !/classname=report:c_order dispatched=Y ok=Y rows=(\d+)/.test(l110)) fail('proc 110 did not dispatch ok: ' + l110);
  else if (Number(l110.match(/rows=(\d+)/)[1]) <= 0) fail('receipt folded 0 rows (c_orderline has 27)');
  const domRows = await pg.$$eval('.idmp-procresult table tr', rs => rs.length).catch(() => 0);
  if (domRows < 2) fail('receipt table not rendered on-screen (tr=' + domRows + ')');

  // ── 4. FALSIFIER: unregistered classname → honest "Not available" card, never silent ──
  console.log('— 4. Order Detail (proc 333, blank classname → absent-handler card)');
  await gotoLogin('GardenAdmin');
  if (!await clickLeaf('order detail')) fail('menu leaf "Order Detail" not found');
  // 333 carries 4 ad_process_para fields, ALL optional → the dialog renders; Run with all empty passes the
  // prepare gate (nothing mandatory) and must land on the spine's absent-handler branch, never silence.
  await pg.waitForSelector('.idmp-procform button[data-proc-run]', { timeout: 8000 }).catch(() => fail('param dialog for 333 never rendered'));
  await pg.click('button[data-proc-run]');
  await pg.waitForSelector('.idmp-procresult.absent', { timeout: 8000 }).catch(() => fail('absent-handler card never rendered — SILENT no-op'));
  const l333 = logs.find(t => t.startsWith('§AD-PROC-LIVE proc=333'));
  if (!l333 || !l333.includes('dispatched=N reason=absent-handler')) fail('proc 333 not reported absent-handler: ' + l333);
  const cardTxt = await pg.$eval('.idmp-procresult.absent .msg', e => e.textContent).catch(() => '');
  if (!cardTxt.includes('not in registry')) fail('honest card lacks the spine\'s absent-handler message');

  // ── 5. REGRESSION: B-4 menu pruning untouched — GardenUser still 116/159 procs ──
  console.log('— 5. GardenUser menu-prune regression (B-4)');
  await gotoLogin('GardenUser');
  const scope = logs.filter(t => t.startsWith('§IDMP-SESSION scopeMenu')).pop();
  if (!scope || !scope.includes('visibleProcs=116/159')) fail('GardenUser prune changed: ' + scope);

  console.log(pass
    ? '🟢 W-AD-PROC-LIVE PASS — menu P/R leaves dispatch via the W-PROC spine: registered procs run (real rows), the prepare gate rejects missing mandatory params, the unregistered classname shows the honest card, B-4 pruning intact'
    : '🔴 W-AD-PROC-LIVE FAIL');
  await br.close(); server.close(); process.exit(pass ? 0 : 2);
})().catch(e => { console.log('🔴 ' + e.message); process.exit(1); });
