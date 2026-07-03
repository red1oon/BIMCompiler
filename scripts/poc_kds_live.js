// ⚠ DO NOT REMOVE — Scope guard (prompts/RESUME_POS_KITCHEN_EINVOICE_OPS_PANELS.md §T2-SPEC).
//   Read the log after every run.
// W-KDS-LIVE — prove the Kitchen Display rides the rails LIVE on idempiere.html, through the REAL
// USER SERIES OF ACTIONS (docs/TestArchitecture.md §Browser Testing — wiring; values are verified by
// the headless W-KDS-QUEUE witness):
//   1. GATE — after GardenAdmin login the Kitchen pill is ON the bar (showWhen:pos-station, same gate
//      as POS); §KDS-LENS loaded. Opened EMPTY first: §KDS-EMPTY (no phantom tickets).
//   2. ORDER — the user rings a card in the POS and sends it deliver-later (⋯ dock → route glyph):
//      §POS-DELIVERLATER … born=DR — the "sent to kitchen" act, one signed group.
//   3. QUEUE — the Kitchen pill now shows EXACTLY ONE ticket (.kds-ticket), its data-inout == the
//      sale's shipment id, its line qty == the ordered qty (MATHS from the §-lines, not eyes).
//   4. SERVE — clicking Serve commits M_InOut→CO in ONE signed group: §KDS-SERVE … chainOk=Y; the
//      re-render is EMPTY (§KDS-EMPTY) — served tickets leave the kitchen.
// Run: ERP_ROOT=/tmp/wt-pos-kitchen/erp node scripts/poc_kds_live.js  (default ROOT=~/bim-ootb/erp)
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
  pg.on('console', m => { const t = m.text(); if (/^(§KDS|§POS)/.test(t)) { logs.push(t); console.log('  ' + t); } });
  pg.on('pageerror', e => console.log('ERR ' + String(e).slice(0, 200)));
  let pass = true;
  const fail = (m) => { pass = false; console.log('  ✗ ' + m); };
  const clickPill = (id) => pg.evaluate((pid) => {
    const dock = document.getElementById('idmp-pill'), trig = document.querySelector('#idmp-pill-trigger,[data-pill-trigger]');
    if (dock && trig && getComputedStyle(dock).display === 'none') trig.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }));
    document.getElementById(pid).dispatchEvent(new PointerEvent('pointerup', { bubbles: true }));
  }, id);

  // ── 1. login → Kitchen pill gated ON → open EMPTY ──
  console.log('— 1. GardenAdmin login: Kitchen pill on the bar (pos-station gate) → opens EMPTY');
  await pg.goto(`http://localhost:${port}/idempiere.html?login=GardenAdmin`, { waitUntil: 'networkidle' });
  await pg.waitForSelector('#idmp-tree .idmp-row.leaf', { state: 'attached', timeout: 25000 });
  if (!logs.find(t => t.startsWith('§KDS-LENS loaded'))) fail('kitchen_lens.js not loaded');
  if (!(await pg.$('#pill-kitchen'))) fail('Kitchen pill #pill-kitchen not on the bar (pos-station gate should be TRUE on ad_seed.db)');
  await clickPill('pill-kitchen');
  await pg.waitForSelector('#kds-wrap', { timeout: 15000 }).catch(() => fail('kitchen lens never mounted (no #kds-wrap)'));
  if (!logs.find(t => t.startsWith('§KDS-EMPTY'))) fail('fresh kitchen not empty (§KDS-EMPTY missing — phantom tickets?)');
  const open0 = logs.find(t => t.startsWith('§KDS-OPEN'));
  if (!open0 || !/tickets=0/.test(open0)) fail('open line wrong (want tickets=0): ' + open0);

  // ── 2. the user rings a card and sends it DELIVER-LATER (the "sent to kitchen" act) ──
  console.log('— 2. POS: ring a card → ⋯ dock → deliver-later (order CO, shipment born DR)');
  await clickPill('pill-pos');
  await pg.waitForSelector('.pos-card', { timeout: 15000 }).catch(() => fail('POS lens never mounted'));
  await pg.click('.pos-card[data-pid="124"]');                       // Elm Tree — the W-POS-RING product
  await pg.evaluate(() => document.getElementById('pos-dock-trigger').click());  // reveal the ⋯ dock
  await pg.waitForSelector('#pos-dock-items.open', { timeout: 8000 }).catch(() => fail('dock never opened'));
  await pg.click('#pos-float-deliverlater');
  await pg.waitForFunction(() => window.ERP && !!window.ERP.opDb, null, { timeout: 15000 }).catch(() => {});
  let dl;
  await pg.waitForFunction(() => false, null, { timeout: 1500 }).catch(() => {});  // settle the async commit
  dl = logs.find(t => t.startsWith('§POS-DELIVERLATER sale'));
  if (!dl || !/born=DR/.test(dl)) fail('deliver-later sale line wrong: ' + dl);
  const inoutId = dl ? (dl.match(/inout=(\d+)/) || [])[1] : null;
  if (!inoutId) fail('no inout id on the §POS-DELIVERLATER line');

  // ── 3. the Kitchen now queues EXACTLY that ticket, qty by MATHS ──
  console.log('— 3. Kitchen: the deliver-later shipment is THE open ticket');
  await clickPill('pill-kitchen');
  await pg.waitForSelector('.kds-ticket', { timeout: 15000 }).catch(() => fail('no ticket card rendered'));
  const openLine = logs.filter(t => t.startsWith('§KDS-OPEN')).pop();
  if (!openLine || !/tickets=1/.test(openLine)) fail('kitchen open line wrong (want tickets=1): ' + openLine);
  const cardInout = await pg.$eval('.kds-ticket', e => e.getAttribute('data-inout')).catch(() => null);
  if (cardInout !== inoutId) fail('ticket data-inout=' + cardInout + ' != sale inout=' + inoutId);
  // MATHS: the ticket's rendered qty == the ordered qty folded from the SIGNED op log (not eyes)
  const qtys = await pg.evaluate((iid) => {
    const r = window.ERP.opDb.exec('SELECT op_type, parameters FROM kernel_ops ORDER BY id');
    const ops = ((r[0] && r[0].values) || []).map(v => { let p = JSON.parse(v[1]); return p.params || p; });
    const ordered = ops.filter(o => o.op_type === 'CREATE_LINE' && o.table === 'C_OrderLine').map(o => Number(o.qtyordered));
    const shipped = ops.filter(o => o.op_type === 'CREATE_LINE' && o.table === 'M_InOutLine').map(o => Number(o.movementqty));
    const shown = Array.from(document.querySelectorAll('.kds-line-qty')).map(e => Number(e.textContent.replace('×', '').trim()));
    return { ordered, shipped, shown };
  }, inoutId);
  if (JSON.stringify(qtys.ordered) !== JSON.stringify(qtys.shipped) || JSON.stringify(qtys.shipped) !== JSON.stringify(qtys.shown))
    fail('qty maths broken: ordered=' + JSON.stringify(qtys.ordered) + ' shipped=' + JSON.stringify(qtys.shipped) + ' shown=' + JSON.stringify(qtys.shown));
  else console.log('  §KDS-MATHS ordered==shipped==shown ' + JSON.stringify(qtys.shown));

  // ── 4. SERVE — one signed group, queue empties ──
  console.log('— 4. Serve: M_InOut→CO one signed group, chainOk=Y, kitchen empties');
  await pg.click('.kds-serve');
  await pg.waitForFunction(() => !document.querySelector('.kds-ticket'), null, { timeout: 15000 })
    .catch(() => fail('ticket never left the kitchen after Serve'));
  const serveLine = logs.find(t => t.startsWith('§KDS-SERVE inout='));
  if (!serveLine || !serveLine.includes('inout=' + inoutId) || !/chainOk=Y/.test(serveLine)) fail('serve line wrong: ' + serveLine);
  if (logs.filter(t => t.startsWith('§KDS-EMPTY')).length < 2) fail('kitchen not empty after serve (no second §KDS-EMPTY)');
  const count = await pg.$eval('#kds-count', e => e.textContent).catch(() => '?');
  if (!/^0 /.test(count)) fail('count bar wrong after serve: ' + count);

  console.log('\n' + (pass ? '🟢 W-KDS-LIVE PASS — Kitchen Display rides the rails live: gated pill, empty-honest open, deliver-later ticket queues with qty maths intact, Serve = one signed group (chainOk=Y) and the ticket leaves the kitchen.'
    : '🔴 W-KDS-LIVE FAIL'));
  await br.close(); server.close();
  process.exit(pass ? 0 : 1);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
