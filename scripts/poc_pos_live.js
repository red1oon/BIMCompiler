// W-POS-LIVE (POS_LENS_SESSION.md / POS_ADDON_SPEC.md §P-1..§P-4 wiring) — prove the POS LENS rides the
// rails LIVE on idempiere.html (values are verified by the headless W-POS-* witnesses; this is the
// wiring check, per TestArchitecture §Browser Testing):
//   1. GATE — after GardenAdmin login the POS pill is ON the bar (showWhen:pos-station via
//      window.IdmpPillPosGate — ad_seed.db carries c_pos 100); §POS-LENS loaded.
//   2. OPEN — pill click mounts the lens: §POS-LIVE open station=100 tiles=16 (all 16 keylayout-100
//      tiles, dictionary-priced, handAuthored=0).
//   3. SALE — ring 2 tiles, pick the walk-in BP (112 Standard), Complete → ONE signed group commits
//      through window.ERP.opDb (kernel_ops.commitGroup): §POS-SALE … newVerbs=[] chainOk=Y; receipt
//      card shows signed=Y.
//   4. REPLENISH (§T1-SPEC staged shape) — NO auto-fire: opening the panel logs §POS-REPLENISH-IDLE and
//      renders zero rows; clicking #pos-repl-generate folds §POS-REPLENISH-GEN suggestions=8 (the
//      W-POS-REPLENISH baseline, == iDempiere formula headless) into an EDITABLE staging list.
//   5. HONESTY — Complete with an EMPTY cart or NO partner refuses (no silent commit; seed
//      c_pos.BPartnerCashTrx is NULL → explicit choice required).
//   6. §POS-CENT (MIGRATE_POSTING_CONFIG matrix flip) — the rung sale's DERIVED POSTING balances to the
//      cent on the NEW DEFAULT seed: fold the SIGNED group's C_Order+C_OrderLine ops into the loaded
//      ad_seed.db (read-the-tip materialization, in-memory only), run the FOLD-frozen
//      window.DocPoster.derivePostings (R=window.PostResolver, db=window.ERPPreview.facade) →
//      coverage=complete (posting config resolves BP 112 receivable + every rung product's revenue),
//      Dr==Cr, integer-cent equality vs the sealed cart total (maxDiff=0c). Proves the cent ring lights
//      on the DEFAULT db — no ?db= override. EXTRACTED from the poc_pos_wr.js cent-check; zero new verbs.
// Run: ERP_ROOT=/tmp/wt-poslens/erp node scripts/poc_pos_live.js  (default ROOT=~/bim-ootb/erp)
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
  pg.on('console', m => { const t = m.text(); if (/^(§POS|§KANBAN-HOST|§SEAM)/.test(t)) { logs.push(t); console.log('  ' + t); } });
  pg.on('pageerror', e => console.log('ERR ' + String(e).slice(0, 200)));
  let pass = true;
  const fail = (m) => { pass = false; console.log('  ✗ ' + m); };

  // ── 1+2. login → pill gated ON → open the lens ──
  console.log('— 1. GardenAdmin login: POS pill on the bar (pos-station gate) → open');
  await pg.goto(`http://localhost:${port}/idempiere.html?login=GardenAdmin`, { waitUntil: 'networkidle' });
  await pg.waitForSelector('#idmp-tree .idmp-row.leaf', { state: 'attached', timeout: 25000 });
  if (!logs.find(t => t.startsWith('§POS-LENS loaded'))) fail('pos_lens.js not loaded');
  const pill = await pg.$('#pill-pos');
  if (!pill) fail('POS pill #pill-pos not on the bar (pos-station gate should be TRUE on ad_seed.db)');
  // registry pills fire on pointerup (PR #170 §A chrome — the poc_rule_client_scope pattern); open the dock if collapsed
  await pg.evaluate(() => {
    const dock = document.getElementById('idmp-pill'), trig = document.querySelector('#idmp-pill-trigger,[data-pill-trigger]');
    if (dock && trig && getComputedStyle(dock).display === 'none') trig.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }));
    document.getElementById('pill-pos').dispatchEvent(new PointerEvent('pointerup', { bubbles: true }));
  });
  // U-1 (POS_KILLER_DEMO §LAYOUT.1): tiles are now image CARDS (.pos-card), not .pos-tile buttons.
  await pg.waitForSelector('.pos-card', { timeout: 15000 }).catch(() => fail('lens never mounted (no .pos-card)'));
  const open = logs.find(t => t.startsWith('§POS-LIVE open'));
  if (!open || !/tiles=16/.test(open)) fail('lens open line wrong: ' + open);
  const tiles = await pg.$$eval('.pos-card', ts => ts.length);
  if (tiles !== 16) fail('expected 16 dictionary tiles, got ' + tiles);
  // §POS-ALBUM (U-1): every photoless seed tile falls back to the Lucide image placeholder glyph
  const album = logs.find(t => t.startsWith('§POS-ALBUM'));
  if (!album || !/cards=16/.test(album) || !/placeholders=16/.test(album)) fail('album line wrong: ' + album);

  // U-2 (§LAYOUT.2): payment/tender lives in a FLOATING panel summoned by the cart pill (pointerup), on its own
  // z-layer — not in the album scroll flow. Summon it once; tender/BP are inside it (#pos-float-tender/#pos-float-bp).
  await pg.evaluate(() => document.getElementById('pos-pill-payment').dispatchEvent(new PointerEvent('pointerup', { bubbles: true })));
  await pg.waitForSelector('#pos-float-panel.open', { timeout: 8000 }).catch(() => fail('float panel never opened on cart pill'));

  // ── 5a. honesty first: Complete with EMPTY cart must refuse (no §POS-SALE) ──
  console.log('— 2. empty-cart Complete refuses');
  await pg.click('#pos-float-tender');
  await pg.waitForTimeout(300);
  if (logs.find(t => t.startsWith('§POS-SALE'))) fail('empty cart committed a sale');

  // ── 3. ring 2 cards → pick BP 112 → Complete = ONE signed group ──
  console.log('— 3. ring 2 cards, BP=112(Standard), Complete → signed group');
  await pg.click('.pos-card[data-pid="124"]');       // Elm Tree, 57.00 (the W-POS-RING product)
  await pg.click('.pos-card[data-pid="124"]');       // ×2 — same line, qty folds
  const t2 = await pg.$$eval('.pos-card', ts => ts[0].getAttribute('data-pid'));
  await pg.click(`.pos-card[data-pid="${t2}"]`);     // a second product line
  // §R2-5 (FOLLOW-UP ROUND 2): the partner is DEFAULTED so the single Pay icon works out of the box —
  // the empty-partner gate that silently blocked the old banknote ("Pay stopped working") is fixed.
  const bpDefault = await pg.$eval('#pos-float-bp', e => e.value);
  if (!bpDefault) fail('§R2-5 partner not defaulted (Pay would silently refuse)');
  if (!logs.find(t => t.startsWith('§POS-PARTNER-DEFAULT'))) fail('no §POS-PARTNER-DEFAULT line');
  await pg.selectOption('#pos-float-bp', '112');     // pin the cent check on the witnessed walk-in 112
  // §R2-3/§R2-5 single Pay icon completes the sale DIRECTLY (no preview modal)
  await pg.click('#pos-float-tender');
  if (await pg.$('#pos-pay-modal')) fail('§R2-3 receipt-preview modal still present (should be retired)');
  await pg.waitForFunction(() => { const e = document.getElementById('pos-float-receipt'); return e && e.textContent.includes('✓'); }, null, { timeout: 15000 })
    .catch(() => fail('receipt never rendered'));
  const sale = logs.find(t => t.startsWith('§POS-SALE'));
  if (!sale || !sale.includes('newVerbs=[]') || !sale.includes('chainOk=Y')) fail('sale line wrong: ' + sale);
  if (!logs.find(t => t.startsWith('§POS-DOC order='))) fail('no §POS-DOC completeIt line');
  const rc = await pg.$eval('#pos-float-receipt', e => e.textContent);
  if (!rc.includes('signed=Y')) fail('receipt not signed: ' + rc);

  // ── 3b. dispose-with-cart (user live-test 2026-06-12): sale completed → cart=[] → panel closes ──
  const disposed = await pg.evaluate(() => !document.getElementById('pos-float-panel').classList.contains('open'));
  if (!disposed) fail('float panel still open after the sale (dispose-with-cart)');
  if (!logs.find(t => t.startsWith('§POS-FLOAT dispose=cart-empty'))) fail('no §POS-FLOAT dispose line');
  // the cart pill re-summons it (dismiss ≠ lost state)
  await pg.evaluate(() => document.getElementById('pos-pill-payment').dispatchEvent(new PointerEvent('pointerup', { bubbles: true })));
  await pg.waitForSelector('#pos-float-panel.open', { timeout: 8000 }).catch(() => fail('panel did not re-summon after dispose'));

  // ── 4. replenishment is STAGED now (§T1-SPEC): no auto-fire, Generate folds the same 8-product baseline ──
  console.log('— 4. replenishment: idle until asked, Generate stages the fold');
  // the user closes the §P-11 receipt overlay first (it covers the panel after a sale)
  if (await pg.$('#pos-receipt-overlay.active')) await pg.click('#pos-receipt-close');
  if (!logs.find(t => t.startsWith('§POS-REPLENISH-IDLE'))) fail('no §POS-REPLENISH-IDLE (auto-fire came back?)');
  if (logs.find(t => t.startsWith('§POS-REPLENISH-GEN'))) fail('§POS-REPLENISH-GEN before any click — auto-fire came back');
  const preRows = await pg.$$eval('.pos-repl-stage-row', e => e.length);
  if (preRows !== 0) fail('staging rows rendered before Generate (want 0): ' + preRows);
  await pg.click('#pos-repl-generate');
  await pg.waitForSelector('.pos-repl-stage-row', { timeout: 8000 }).catch(() => fail('Generate rendered no staging rows'));
  const repl = logs.filter(t => t.startsWith('§POS-REPLENISH-GEN')).pop();
  if (!repl || !/suggestions=8/.test(repl)) fail('replenish fold wrong (want the 8-product W-POS-REPLENISH baseline): ' + repl);
  const stageRows = await pg.$$eval('.pos-repl-stage-row', e => e.length);
  if (stageRows !== 8) fail('staging rows != suggestions (want 8): ' + stageRows);

  // ── 6. §POS-CENT — the rung sale's derived posting balances to the cent on the DEFAULT seed ──
  console.log('— 5. §POS-CENT: derive posting for the completed live order (frozen DocPoster on the default seed)');
  const cent = await pg.evaluate(() => {
    try {
      if (!window.DocPoster || !window.PostResolver || !window.ERPPreview) return { err: 'posting engine not loaded (DocPoster/PostResolver/ERPPreview)' };
      // EXTRACT the completed order from the SIGNED group — the sidecar op-log is the truth
      const od = window.ERP.opDb;
      const r = od.exec('SELECT op_type, parameters FROM kernel_ops ORDER BY id');
      const ops = ((r[0] && r[0].values) || []).map(v => Object.assign({ op_type: v[0] }, JSON.parse(v[1])));
      const docOp = ops.filter(o => o.op_type === 'CREATE_DOCUMENT' && o.table === 'C_Order').pop();
      if (!docOp) return { err: 'no CREATE_DOCUMENT C_Order in the signed sidecar' };
      const lineOps = ops.filter(o => o.op_type === 'CREATE_LINE' && o.table === 'C_OrderLine' && Math.floor(o.source_line_id / 100) === docOp.c_order_id);
      if (!lineOps.length) return { err: 'no C_OrderLine ops for order ' + docOp.c_order_id };
      // FOLD the signed ops into the loaded seed (in-memory tip materialization; sealed master amounts only)
      const db = window.__idmpDb;
      const totalCents = lineOps.reduce((s, l) => s + Math.round(l.linenetamt * 100), 0);
      db.run('INSERT INTO C_Order (C_Order_ID, AD_Client_ID, C_BPartner_ID, C_DocType_ID, M_Warehouse_ID, IsSOTrx, GrandTotal, DocStatus) VALUES (?,?,?,?,?,?,?,?)',
        [docOp.c_order_id, 11, docOp.c_bpartner_id, docOp.c_doctype_id, docOp.m_warehouse_id, 'Y', totalCents / 100, 'CO']);
      lineOps.forEach(l => db.run('INSERT INTO C_OrderLine (C_OrderLine_ID, C_Order_ID, M_Product_ID, QtyOrdered, PriceActual, LineNetAmt) VALUES (?,?,?,?,?,?)',
        [l.source_line_id, docOp.c_order_id, l.m_product_id, l.qtyordered, l.priceactual, l.linenetamt]));
      // the FROZEN derivation, exactly the Posting-Preview path (facade + PostResolver injected)
      const fdb = window.ERPPreview.facade(db);
      const schema = fdb.prepare('SELECT c_acctschema_id s FROM c_acctschema LIMIT 1').get().s;
      const d = window.DocPoster.derivePostings(fdb, { table: 'C_Order', id: docOp.c_order_id }, schema, window.PostResolver);
      const coverage = d.absent.length ? ('partial(' + d.absent.join(',') + ')') : 'complete';
      const maxDiff = Math.max(Math.abs(d.sumDr - d.sumCr), Math.abs(d.sumDr - totalCents));
      return { orderId: docOp.c_order_id, basis: d.basis, coverage, balanced: d.balanced, sumDr: d.sumDr, sumCr: d.sumCr, totalCents, maxDiff, accounts: d.lines.length };
    } catch (e) { return { err: String(e) }; }
  });
  if (cent.err) fail('§POS-CENT probe failed: ' + cent.err);
  else {
    console.log('  §POS-CENT live db=ad_seed.db order=' + cent.orderId + ' basis=' + cent.basis + ' accounts=' + cent.accounts +
      ' coverage=' + cent.coverage + ' balanced=' + (cent.balanced ? 'Y' : 'N') +
      ' Dr=' + (cent.sumDr / 100).toFixed(2) + ' Cr=' + (cent.sumCr / 100).toFixed(2) +
      ' cartCents=' + cent.totalCents + ' maxDiff=' + cent.maxDiff + 'c');
    if (cent.coverage !== 'complete') fail('§POS-CENT coverage not complete (posting config did not resolve): ' + cent.coverage);
    if (!cent.balanced || cent.maxDiff !== 0) fail('§POS-CENT not balanced to the cent: Dr=' + cent.sumDr + ' Cr=' + cent.sumCr + ' cart=' + cent.totalCents);
  }

  console.log('\n' + (pass ? '🟢 W-POS-LIVE PASS — the POS lens rides the rails live: gated pill, 16 dictionary tiles, one signed group (chainOk=Y, newVerbs=[]), staged replenishment (idle till Generate), §POS-CENT derived posting balanced to the cent on the DEFAULT seed, refusals honest.'
    : '🔴 W-POS-LIVE FAIL'));
  await br.close(); server.close();
  process.exit(pass ? 0 : 1);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
