// ⚠ DO NOT REMOVE — Scope guard (prompts/RESUME_POS_KITCHEN_EINVOICE_OPS_PANELS.md §T1-SPEC).
//   Read the log after every run.
// W-REPLEN-LIVE — prove the staged Generate Replenishment rides the rails LIVE on idempiere.html,
// through the REAL USER SERIES OF ACTIONS (feedback: test the real user path, not engine seams;
// values are verified by the headless W-REPLEN-STAGE witness):
//   1. IDLE — GardenAdmin login → POS pill → pay panel: §POS-REPLENISH-IDLE, ZERO staging rows,
//      a #pos-repl-generate button — the auto-fire drawer is gone.
//   2. GENERATE — click Generate: §POS-REPLENISH-GEN suggestions=8 (the W-POS-REPLENISH baseline)
//      renders 8 EDITABLE staging rows, nothing committed (no §POS-REPLENISH-COMMIT).
//   3. REVIEW — the user EDITS one qty and DESELECTS one row (§POS-REPLENISH-EDIT ×2); the commit
//      button count drops accordingly.
//   4. COMMIT — click Confirm: ONE signed group (§POS-REPLENISH-COMMIT … chainOk=Y). MATHS from the
//      SIGNED op log (not eyes): committed C_OrderLine qtys == the staged-after-edit qtys, the
//      deselected product is ABSENT, every PO header carries a vendor (c_bpartner_id).
//   5. IDEMPOTENT — click Generate again: the pending-inbound fold subtracts EXACTLY the committed
//      qtys — fully-committed products vanish, the edited-down row re-proposes only the remainder,
//      the deselected row returns at its original qty. No double order, to the unit.
// Run: ERP_ROOT=/tmp/wt-replenish/erp node scripts/poc_replenish_live.js  (default ROOT=~/bim-ootb/erp)
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
  pg.on('console', m => { const t = m.text(); if (/^§POS/.test(t)) { logs.push(t); console.log('  ' + t); } });
  pg.on('pageerror', e => console.log('ERR ' + String(e).slice(0, 200)));
  let pass = true;
  const fail = (m) => { pass = false; console.log('  ✗ ' + m); };
  const settle = (ms) => pg.waitForFunction(() => false, null, { timeout: ms }).catch(() => {});

  // ── 1. login → POS → pay panel: idle, no auto-fire ──
  console.log('— 1. GardenAdmin login → POS → pay panel: replenishment idle until asked');
  await pg.goto(`http://localhost:${port}/idempiere.html?login=GardenAdmin`, { waitUntil: 'networkidle' });
  await pg.waitForSelector('#idmp-tree .idmp-row.leaf', { state: 'attached', timeout: 25000 });
  await pg.evaluate(() => {
    const dock = document.getElementById('idmp-pill'), trig = document.querySelector('#idmp-pill-trigger,[data-pill-trigger]');
    if (dock && trig && getComputedStyle(dock).display === 'none') trig.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }));
    document.getElementById('pill-pos').dispatchEvent(new PointerEvent('pointerup', { bubbles: true }));
  });
  await pg.waitForSelector('.pos-card', { timeout: 15000 }).catch(() => fail('POS lens never mounted'));
  await pg.evaluate(() => document.getElementById('pos-pill-payment').dispatchEvent(new PointerEvent('pointerup', { bubbles: true })));
  await pg.waitForSelector('#pos-float-panel.open', { timeout: 8000 }).catch(() => fail('pay panel never opened'));
  if (!logs.find(t => t.startsWith('§POS-REPLENISH-IDLE'))) fail('no §POS-REPLENISH-IDLE (auto-fire came back?)');
  if (logs.find(t => t.startsWith('§POS-REPLENISH-GEN'))) fail('generated before any click — auto-fire came back');
  if ((await pg.$$eval('.pos-repl-stage-row', e => e.length)) !== 0) fail('staging rows before Generate');
  if (!(await pg.$('#pos-repl-generate'))) fail('no #pos-repl-generate button');

  // ── 2. GENERATE — the 8-product baseline folds into an editable staging list ──
  console.log('— 2. Generate: the W-POS-REPLENISH 8-product baseline, staged not committed');
  await pg.click('#pos-repl-generate');
  await pg.waitForSelector('.pos-repl-stage-row', { timeout: 8000 }).catch(() => fail('Generate rendered no rows'));
  const gen1 = logs.filter(t => t.startsWith('§POS-REPLENISH-GEN')).pop();
  if (!gen1 || !/suggestions=8/.test(gen1)) fail('generate line wrong (want suggestions=8): ' + gen1);
  if (logs.find(t => t.startsWith('§POS-REPLENISH-COMMIT'))) fail('something committed on Generate');
  const rows1 = await pg.$$eval('.pos-repl-stage-row', els => els.map(r => ({
    pid: Number((r.querySelector('.pos-repl-name').title.match(/product (\d+)/) || [])[1]),
    qty: Number(r.querySelector('.pos-repl-qty').value),
    on: r.querySelector('.pos-repl-include').checked,
    enabled: !r.querySelector('.pos-repl-include').disabled
  })));
  if (rows1.length !== 8) fail('staging rows != 8: ' + rows1.length);

  // ── 3. REVIEW — edit one qty, deselect one row (the review step the old drawer never had) ──
  console.log('— 3. Review: edit row[0] qty → 3, deselect row[1]');
  const editable = rows1.map((r, i) => ({ ...r, i })).filter(r => r.enabled);
  if (editable.length < 2) fail('need ≥2 vendor-backed rows to exercise review, got ' + editable.length);
  const editIdx = editable[0].i, dropIdx = editable[1].i;
  await pg.fill(`.pos-repl-stage-row:nth-child(${editIdx + 1}) .pos-repl-qty`, '3');
  await pg.evaluate((i) => document.querySelectorAll('.pos-repl-stage-row')[i].querySelector('.pos-repl-include').click(), dropIdx);
  if (logs.filter(t => t.startsWith('§POS-REPLENISH-EDIT')).length < 2) fail('review edits not §-logged');
  const staged = rows1.map((r, i) => ({ ...r, qty: i === editIdx ? 3 : r.qty, on: i === dropIdx ? false : r.on }))
    .filter(r => r.enabled && r.on && r.qty > 0);
  const btnTxt = await pg.$eval('#pos-repl-commit', e => e.textContent);
  if (!btnTxt.includes(`Confirm ${staged.length} `) && !btnTxt.includes(`Confirm ${staged.length}`)) fail('commit button count wrong: "' + btnTxt + '" want ' + staged.length);

  // ── 4. COMMIT — one signed group; MATHS: op log == staged-after-edit ──
  console.log('— 4. Confirm: ONE signed group, committed qtys == staged qtys (MATHS from the op log)');
  await pg.click('#pos-repl-commit');
  await pg.waitForFunction(() => !document.querySelector('.pos-repl-stage-row'), null, { timeout: 15000 })
    .catch(() => fail('staging list never cleared after Confirm'));
  const cm = logs.filter(t => t.startsWith('§POS-REPLENISH-COMMIT')).pop();
  if (!cm || !/chainOk=Y/.test(cm) || !new RegExp('lines=' + staged.length + '\\b').test(cm)) fail('commit line wrong (want chainOk=Y lines=' + staged.length + '): ' + cm);
  const folded = await pg.evaluate(() => {
    const r = window.ERP.opDb.exec('SELECT gid, op_type, parameters FROM kernel_ops ORDER BY id');
    const rows = ((r[0] && r[0].values) || []).map(v => { let p = JSON.parse(v[2]); p = p.params || p; return { gid: v[0], p }; });
    const poGids = {}; rows.forEach(x => { if (x.p.op_type === 'CREATE_DOCUMENT' && x.p.table === 'C_Order' && x.p.issotrx === 'N') poGids[x.gid] = x.p; });
    return {
      lines: rows.filter(x => x.p.op_type === 'CREATE_LINE' && x.p.table === 'C_OrderLine' && poGids[x.gid])
                 .map(x => ({ pid: x.p.m_product_id, qty: Number(x.p.qtyordered) })),
      docs: Object.values(poGids).map(d => ({ vendor: d.c_bpartner_id || null })),
      gids: [...new Set(rows.filter(x => poGids[x.gid]).map(x => x.gid))]
    };
  });
  const want = staged.map(r => r.pid + ':' + r.qty).sort().join(',');
  const got = folded.lines.map(l => l.pid + ':' + l.qty).sort().join(',');
  if (want !== got) fail('MATHS broken: committed [' + got + '] != staged [' + want + ']');
  else console.log('  §REPLEN-MATHS committed==staged ' + got);
  if (folded.lines.some(l => l.pid === rows1[dropIdx].pid)) fail('deselected product ' + rows1[dropIdx].pid + ' was committed');
  if (folded.docs.some(d => !d.vendor)) fail('a PO doc has no vendor header');
  if (folded.gids.length !== 1) fail('replenish POs span ' + folded.gids.length + ' gids (want ONE group)');

  // ── 5. IDEMPOTENT — Generate again: the pending-inbound fold subtracts EXACTLY what was committed ──
  // Fully-committed products vanish; the edited-DOWN row (both review targets are maintain-max rows on
  // this seed) re-proposes EXACTLY original−committed — the remainder, never the full qty again; the
  // deselected row returns at its original qty. No double order, to the unit.
  console.log('— 5. Generate again: fold subtracts committed qty exactly (no double order)');
  await pg.click('#pos-repl-generate');
  await settle(800);
  const rows2 = await pg.$$eval('.pos-repl-stage-row', els => els.map(r => ({
    pid: Number((r.querySelector('.pos-repl-name').title.match(/product (\d+)/) || [])[1]),
    qty: Number(r.querySelector('.pos-repl-qty').value)
  })));
  const expected = new Map();
  const editRemainder = rows1[editIdx].qty - 3;
  if (editRemainder > 0) expected.set(rows1[editIdx].pid, editRemainder);
  expected.set(rows1[dropIdx].pid, rows1[dropIdx].qty);
  const want2 = [...expected.entries()].map(([p, q]) => p + ':' + q).sort().join(',');
  const got2 = rows2.map(r => r.pid + ':' + r.qty).sort().join(',');
  if (want2 !== got2) fail('re-generate maths broken: got [' + got2 + '] want remainder+deselected [' + want2 + ']');
  else console.log('  §REPLEN-IDEMPOTENT regenerated exactly remainder+deselected ' + got2 + ' — committed qty never re-ordered');

  console.log('\n' + (pass ? '🟢 W-REPLEN-LIVE PASS — staged Generate Replenishment rides the rails live: idle until asked, 8-product fold staged editable, review edits honoured, ONE signed group (chainOk=Y) matching the staged maths, and a re-generate never re-orders.'
    : '🔴 W-REPLEN-LIVE FAIL'));
  await br.close(); server.close();
  process.exit(pass ? 0 : 1);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
