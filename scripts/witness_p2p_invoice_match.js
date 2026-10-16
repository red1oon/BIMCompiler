#!/usr/bin/env node
// Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
// SPDX-License-Identifier: MIT
// ⚠ DO NOT REMOVE — prompts/ERP_P2P_INVOICE_MATCH.md. DISCOVERY/PROOF WITNESS for the fixes landed there
// (§Fix 1/2/3/5): Material Receipt (Stage 7) unblocked via manual header+line entry against a real PO,
// M_MatchPO emitted on Receipt Complete; Vendor Invoice (Stage 8) unblocked the same way, M_MatchInv
// emitted on Invoice Complete; the shared M_InOutLine_ID linkage between the two IS the three-way match.
// A break is a real finding, not a script bug — read the log, don't assume PASS from exit code.
//
// REAL USER PATH ONLY: every mutation is driven by page.click()/page.fill()/page.selectOption() on the
// real toolbar/inline-form/DocAction-bar, mirroring scripts/witness_e2e_business_cycle.js's own Stage 6/7/8
// helpers verbatim (deepUrl/fillField/clickToolbarBtn/rowIdByText/clickRowOpen/waitForCrudPersist). The
// ONLY page.evaluate() calls are READ-ONLY observation via the app's OWN published accessors
// (window.__idmpDb.exec, window.__crud.kernelDb()/core.*, window.KernelOps.replayOps) — never a fake commit.
//
// Run: WITNESS_ROOT=/tmp/wt-p2p-invoice-match bash build/erp/run_witness.sh scripts/witness_p2p_invoice_match.js
'use strict';
var path = require('path'), http = require('http'), fs = require('fs');
var ROOT = process.env.WITNESS_ROOT || '/tmp/wt-p2p-invoice-match';
var MIME = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.css': 'text/css',
  '.db': 'application/octet-stream', '.wasm': 'application/wasm' };
function reqPw() { try { return require('playwright'); } catch (e) { return require('/home/red1/bim-ootb/tests/node_modules/playwright'); } }

function log(m) { console.log('   ' + m); }
var stageResults = [];
function cycleLine(n, name, driven, result, detail) {
  var l = '§P2P stage=' + n + ' name=' + name + ' driven=' + driven + ' result=' + result + ' detail=' + detail;
  console.log(l);
  stageResults.push({ n: n, name: name, driven: driven, result: result, detail: detail });
  return l;
}
function verdict(ok, label, detail) { console.log('   ' + (ok ? '🟢' : '🔴') + ' ' + label + (detail ? ' — ' + detail : '')); }

function mkWaiter(page, tag) {
  var lines = [], cursor = 0;
  page.on('console', function (m) { var t = m.text(); lines.push(t); if (/^§/.test(t)) log('[' + tag + '] ' + t); });
  page.on('dialog', function (d) { log('[' + tag + '] ALERT: ' + d.message()); d.accept(); });
  return {
    lines: lines,
    wait: function (regexes, timeoutMs) {
      var start = Date.now();
      return new Promise(function (resolve, reject) {
        (function poll() {
          for (; cursor < lines.length; cursor++) {
            for (var i = 0; i < regexes.length; i++) if (regexes[i].test(lines[cursor])) return resolve({ line: lines[cursor], which: i });
          }
          if (Date.now() - start > (timeoutMs || 12000)) return reject(new Error('[' + tag + '] timeout waiting for ' + regexes.join(' | ')));
          setTimeout(poll, 100);
        })();
      });
    }
  };
}
function waitForCrudPersist(waiter, table, timeoutMs) {
  var rxPersist = new RegExp('§CRUD-PERSIST key=' + table + ' '), rxReject = new RegExp('§CRUD-GATE key=' + table + '.*REJECT'),
    rxSkip = new RegExp('§(CRUD-HOSTCREATE|INPLACE-NEW) table=' + table + ' skipped');
  return waiter.wait([rxPersist, rxReject, rxSkip], timeoutMs).then(function (r) {
    if (r.which === 0) return { committed: true, line: r.line };
    if (r.which === 1) return { committed: false, reason: 'owner-gate REJECT', line: r.line };
    return { committed: false, reason: 'create not permitted', line: r.line };
  }).catch(function (e) { return { committed: false, reason: 'timeout: ' + e.message }; });
}
function sql(page, q) {
  return page.evaluate(function (query) {
    try {
      var r = window.__idmpDb.exec(query);
      if (!r.length) return [];
      var cols = r[0].columns, out = [];
      r[0].values.forEach(function (row) { var o = {}; cols.forEach(function (c, i) { o[c] = row[i]; }); out.push(o); });
      return out;
    } catch (e) { return { __error: e.message }; }
  }, q);
}
// matchLinesFor — read-only observation via window.__crud.kernelDb() + window.KernelOps.replayOps, the
// app's OWN published sidecar accessors (same family as the O2C witness's tipDocsFor). Filters CREATE_LINE
// ops by table name — M_MatchPO/M_MatchInv are junction records (erp_engine.js completeReceipt/
// completeInvoice), not documents, so tipDocs (CREATE_DOCUMENT-only) doesn't see them.
function matchLinesFor(page, table) {
  return page.evaluate(function (t) {
    var K = window.__crud && window.__crud.kernelDb ? window.__crud.kernelDb() : null;
    if (!K || !window.KernelOps) return { ok: false, rows: [] };
    var ops = window.KernelOps.replayOps(K, 'CREATE_LINE');
    var rows = ops.filter(function (o) { return o.parameters && String(o.parameters.table) === t; }).map(function (o) { return o.parameters; });
    return { ok: true, rows: rows };
  }, table);
}
// foldedRowsFor — read-only observation of a fresh (sidecar-only) row set via the app's OWN published
// listTip accessor (window.__crud.core.listTip / window.__crud.kernelDb), the same convention
// witness_e2e_business_cycle.js's renderOrderPicker fix established. baseRows=[] since these child tables
// carry no seed rows in this tenant — the fold is 100% CRUD_CREATE overlay for a freshly-authored row.
function foldedRowsFor(page, table, pkCol) {
  return page.evaluate(function (args) {
    var c = window.__crud;
    if (!c || !c.kernelDb || !c.core || typeof c.core.listTip !== 'function') return { ok: false, rows: [] };
    var K = c.kernelDb();
    if (!K) return { ok: false, rows: [] };
    var folded = c.core.listTip(K, args.table, args.pkCol, [], null);
    return { ok: true, rows: (folded && folded.rows) || [] };
  }, { table: table, pkCol: pkCol });
}
async function fillField(page, col, value, kind) {
  var sel = '#idmp-inline-mount input[data-col="' + col + '"], #idmp-inline-mount select[data-col="' + col + '"]';
  var el = await page.$(sel);
  if (!el) return 'absent';
  var disabled = await el.evaluate(function (e) { return !!e.disabled; });
  if (disabled) return 'locked';
  var visible = await el.isVisible();
  if (!visible) return 'hidden';
  var tag = await el.evaluate(function (e) { return e.tagName; });
  if (tag === 'SELECT') await page.selectOption(sel, String(value));
  else await page.fill(sel, String(value));
  return true;
}
async function clickToolbarBtn(page, titlePrefix) {
  var btn = await page.$('#idmp-toolbar button[title^="' + titlePrefix + '"]');
  if (!btn) return false;
  await btn.click();
  return true;
}
async function rowIdByText(page, text) {
  var rows = await page.$$('tr[data-ad-record]');
  for (var i = 0; i < rows.length; i++) {
    var t = await rows[i].textContent();
    if (t && t.indexOf(text) >= 0) return { id: await rows[i].getAttribute('data-ad-record'), handle: rows[i] };
  }
  return null;
}
// clickRowOpen — open the RECORD, not a cell editor.
// STALE-WITNESS FIX 2026-09-04 (prompts/ERP_STOCK_EFFECT.md §E4.7): this used to click the POReference
// cell, which was then a plain read-only cell whose click bubbled to the row. Since the in-place grid
// editor landed, EVERY data cell carries its own listener that calls stopPropagation() and opens an
// inline WEditor (idempiere.html:1977 → crud_overlay.js:1127 §INPLACE-CELL-OPEN), so that click now edits
// a cell and the record never opens — the measured Stage-1 failure was `chip=null` right after
// `§INPLACE-CELL-OPEN table=c_order id=-1 col=poreference`.
// The row itself still opens the form (idempiere.html:1982). The cells that reach it are the ones with NO
// per-cell listener: the DocStatus cell (rendered as a chip, no editor) and the leading checkbox cell
// (only its <input> stops propagation, not the <td>). Try those, in that order, then the row.
async function clickRowOpen(row, opts) {
  var statusCell = await row.$('td[data-ad-col="DocStatus"]');
  if (statusCell) { await statusCell.click(opts); return; }
  var cbCell = await row.$('td.idmp-cbcol');
  if (cbCell) { await cbCell.click(Object.assign({ position: { x: 2, y: 2 } }, opts || {})); return; }
  await row.click(opts);
}
function deepUrl(port, params) {
  var q = Object.keys(params).map(function (k) { return k + '=' + encodeURIComponent(params[k]); }).join('&');
  return 'http://localhost:' + port + '/erp/idempiere.html?' + q;
}

(async function () {
  var server = http.createServer(function (req, res) {
    var p = decodeURIComponent(req.url.split('?')[0]);
    var fp = path.join(ROOT, p);
    if (!fp.startsWith(ROOT) || !fs.existsSync(fp) || fs.statSync(fp).isDirectory()) { res.writeHead(404); res.end('nf'); return; }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(fp)] || 'application/octet-stream' });
    fs.createReadStream(fp).pipe(res);
  });
  await new Promise(function (r) { server.listen(0, r); });
  var port = server.address().port;
  var browser = await reqPw().chromium.launch();
  var harnessThrew = false;
  var page = await browser.newPage();
  var w = mkWaiter(page, 'P2P');
  var today = new Date().toISOString().slice(0, 10);
  var newPoId = null, newRcptId = null, newInvId = null;

  try {
    // ════════════════════════════════════════════════════════════════════
    // STAGE 1 — Purchase Order (source doc for the whole match chain), window 181. Same recipe as
    // witness_e2e_business_cycle.js's own Stage 6.
    // ════════════════════════════════════════════════════════════════════
    console.log('\n═══ STAGE 1 — Purchase Order (source doc) ═══\n');
    var uniqPoDoc = String(Date.now());
    try {
      await page.goto(deepUrl(port, { login: 'GardenAdmin', window: 181 }), { waitUntil: 'load' });
      await page.waitForSelector('#idmp-toolbar button[title^="New record"]', { timeout: 20000 });
      await clickToolbarBtn(page, 'New record');
      await page.waitForSelector('#idmp-inline-mount [data-col="c_bpartner_id"]', { timeout: 10000 });
      await fillField(page, 'documentno', uniqPoDoc);
      await fillField(page, 'c_bpartner_id', '120');
      await fillField(page, 'dateordered', today);
      await fillField(page, 'grandtotal', '45.00');
      await fillField(page, 'm_pricelist_id', '101');
      await fillField(page, 'bill_bpartner_id', '120');
      await clickToolbarBtn(page, 'Save');
      var p1 = await waitForCrudPersist(w, 'c_order', 15000);
      log('§P2P-SAVE table=c_order(PO) committed=' + p1.committed + (p1.reason ? ' reason=' + p1.reason : ''));
      if (!p1.committed) throw new Error('PO header create did not persist: ' + p1.reason);
      await page.waitForTimeout(600);
      var found1 = await rowIdByText(page, uniqPoDoc);
      if (!found1) throw new Error('no grid row found for documentno ' + uniqPoDoc);
      newPoId = found1.id;
      log('§P2P-STATE new PO c_order_id=' + newPoId);

      await clickRowOpen(found1.handle, { timeout: 8000 });
      await page.waitForTimeout(400);
      await page.click('#idmp-tabstrip >> text=PO Line', { timeout: 8000 });
      await page.waitForSelector('#idmp-toolbar button[title^="New record"]', { timeout: 10000 });
      await clickToolbarBtn(page, 'New record');
      await page.waitForSelector('#idmp-inline-mount [data-col="m_product_id"]', { timeout: 10000 });
      await fillField(page, 'c_order_id', String(newPoId));
      await fillField(page, 'c_bpartner_id', '120');
      await fillField(page, 'dateordered', today);
      await fillField(page, 'line', '10');
      await fillField(page, 'm_warehouse_id', '103');
      await fillField(page, 'm_product_id', '130');
      await fillField(page, 'qtyentered', '5');
      await fillField(page, 'c_uom_id', '100');
      await fillField(page, 'qtyordered', '5');
      await fillField(page, 'priceentered', '9.00');
      await fillField(page, 'priceactual', '9.00');
      await fillField(page, 'c_tax_id', '104');
      await clickToolbarBtn(page, 'Save');
      var p1b = await waitForCrudPersist(w, 'c_orderline', 15000);
      log('§P2P-SAVE table=c_orderline(PO) committed=' + p1b.committed + (p1b.reason ? ' reason=' + p1b.reason : ''));
      if (!p1b.committed) throw new Error('PO line create did not persist: ' + p1b.reason);

      await page.click('#idmp-tabstrip >> text=Purchase Order', { timeout: 8000 }).catch(function () { return page.click('#idmp-tabstrip >> text=Order'); });
      await page.waitForTimeout(500);
      var found1b = await rowIdByText(page, uniqPoDoc);
      if (!found1b) throw new Error('PO row not found on returning to header tab');
      await clickRowOpen(found1b.handle, { timeout: 8000 });
      await page.waitForTimeout(500);
      var coBtn1 = page.locator('.idmp-docfsm button[data-doc-action="CO"]');
      if (await coBtn1.count()) { await coBtn1.first().click(); await w.wait([/§AD-DOCFSM-LIVE.*clicked=CO/], 8000).catch(function () {}); }
      var poChip = await page.locator('.idmp-docfsm .chip').first().textContent().catch(function () { return null; });
      var stage1Ok = !!(poChip && /·\s*CO\b/.test(poChip));
      verdict(stage1Ok, 'Stage1: PO reaches CO', 'chip=' + poChip);
      cycleLine(1, 'PurchaseOrder', 'UI', stage1Ok ? 'PASS' : 'FAIL', 'PO id=' + newPoId + ' chip=' + poChip);
    } catch (e) {
      log('🔴 Stage1 threw: ' + e.message);
      cycleLine(1, 'PurchaseOrder', 'UI', 'FAIL', 'exception: ' + e.message.replace(/\n/g, ' '));
    }

    // ════════════════════════════════════════════════════════════════════
    // STAGE 2 — Material Receipt against the PO (ERP_P2P_INVOICE_MATCH.md §Fix 1: m_warehouse_id/
    // c_bpartner_id/c_order_id header fields; §Fix 2: movementtype/issotrx derived from the window).
    // ════════════════════════════════════════════════════════════════════
    console.log('\n═══ STAGE 2 — Material Receipt (header + line against the PO) ═══\n');
    var uniqRcptDoc = String(Date.now() + 1);
    try {
      await page.goto(deepUrl(port, { login: 'GardenAdmin', window: 184 }), { waitUntil: 'load' });
      await page.waitForSelector('#idmp-toolbar button[title^="New record"]', { timeout: 20000 });
      await clickToolbarBtn(page, 'New record');
      await page.waitForSelector('#idmp-inline-mount [data-col="documentno"]', { timeout: 10000 });
      var rcptFields = await page.$$eval('#idmp-inline-mount [data-col]', function (els) { return Array.from(new Set(els.map(function (e) { return e.getAttribute('data-col'); }))); });
      log('§P2P-FORM m_inout header fields shown: ' + rcptFields.join(','));
      var hasWh = rcptFields.indexOf('m_warehouse_id') >= 0, hasBp = rcptFields.indexOf('c_bpartner_id') >= 0, hasPo = rcptFields.indexOf('c_order_id') >= 0;
      verdict(hasWh && hasBp && hasPo, 'Stage2: Material Receipt New form now exposes warehouse+vendor+PO (§Fix 1)', 'fields=' + rcptFields.join(','));
      await fillField(page, 'documentno', uniqRcptDoc);
      await fillField(page, 'movementdate', today);
      await fillField(page, 'm_warehouse_id', '103');
      await fillField(page, 'c_bpartner_id', '120');
      await fillField(page, 'c_order_id', String(newPoId));
      // STALE-WITNESS FIX 2026-09-04 (§E4.7): bim-ootb #1636's whole-row §PARITY-MANDATORY check now
      // enforces the AD's OWN mandatory set on create, and this save was rejected on exactly two columns:
      //   §CRUD validate key=m_inout verb=create REJECT errors=[c_doctype_id required, c_bpartner_location_id required]
      // Queried the seed: on M_InOut both are IsMandatory='Y', IsDisplayed='Y' (tabs 257/296) and NEITHER
      // carries an AD_Column or AD_Field DefaultValue — a real iDempiere user picks both on the form, and
      // real iDempiere additionally defaults the location via CalloutInOut.bpartner (not yet in our 6-atom
      // callout registry; one of the 139 named-deferred). Values EXTRACTED from the seed, not chosen:
      //   c_doctype_id 122 = "MM Receipt" (DocBaseType MMR, IsSOTrx N) — the same doctype the seed's own
      //     purchase receipt M_InOut 105 carries.
      //   c_bpartner_location_id 114 = bpartner 120's only C_BPartner_Location ("Small Village").
      await fillField(page, 'c_doctype_id', '122');
      await fillField(page, 'c_bpartner_location_id', '114');
      await clickToolbarBtn(page, 'Save');
      var p2 = await waitForCrudPersist(w, 'm_inout', 15000);
      log('§P2P-SAVE table=m_inout committed=' + p2.committed + (p2.reason ? ' reason=' + p2.reason : ''));
      if (!p2.committed) throw new Error('m_inout header create did not persist: ' + p2.reason);
      var mvLine = w.lines.filter(function (l) { return /§AD-MODELVAL-LIVE table=m_inout verb=create/.test(l); }).pop();
      log('§P2P-STATE m_inout modelval-derive-line=' + (mvLine || 'NONE (movementtype/issotrx derivation did not fire)'));
      await page.waitForTimeout(600);
      var found2 = await rowIdByText(page, uniqRcptDoc);
      if (!found2) throw new Error('no grid row found for documentno ' + uniqRcptDoc);
      newRcptId = found2.id;
      log('§P2P-STATE new m_inout_id=' + newRcptId);

      await clickRowOpen(found2.handle, { timeout: 8000 });
      await page.waitForTimeout(400);
      await page.click('#idmp-tabstrip >> text=Receipt Line', { timeout: 8000 }).catch(function () { return page.click('#idmp-tabstrip >> text=Line'); });
      await page.waitForSelector('#idmp-toolbar button[title^="New record"]', { timeout: 10000 });
      await clickToolbarBtn(page, 'New record');
      await page.waitForSelector('#idmp-inline-mount [data-col="m_product_id"]', { timeout: 10000 });
      var lineFields2 = await page.$$eval('#idmp-inline-mount [data-col]', function (els) { return Array.from(new Set(els.map(function (e) { return e.getAttribute('data-col'); }))); });
      log('§P2P-FORM m_inoutline fields shown: ' + lineFields2.join(','));
      // The FINDING this block used to carry — "populateRefs reads the RAW bundle only, so a freshly
      // created parent can never be offered" — is FIXED (prompts/ERP_FK_PICKER_SIDECAR.md §FKFOLD): the
      // picker now queries the tip-folded row set. Measured on this very run:
      //   §VALRULE col=c_orderline_id vr=203 "C_OrderLine of Order" before=117 after=1 offered=1
      //            verdict=applied ctx={"C_Order_ID":-1}          (it was offered=0)
      // So the old sidestep — anchoring on SEED PO line 108 of order 104 — is now not merely unnecessary,
      // it is WRONG: AD_Val_Rule 203 correctly restricts the picker to lines of the order being received
      // against, and line 108 belongs to a different order. Take whatever the picker OFFERS instead of a
      // hardcoded id — that is what a user can actually pick, and it keeps the chain on Stage 1's own PO.
      var offered = await page.$$eval('#idmp-inline-mount select[data-col="c_orderline_id"] option',
        function (os) { return os.map(function (o) { return o.value; }).filter(function (v) { return v !== ''; }); });
      log('§P2P-PICKER c_orderline_id offered=' + JSON.stringify(offered));
      if (!offered.length) throw new Error('c_orderline_id picker offered NOTHING for the fresh PO — the §FKFOLD fold did not reach it');
      var poLineId = offered[0];
      await fillField(page, 'c_orderline_id', String(poLineId));
      await fillField(page, 'm_inout_id', String(newRcptId));
      await fillField(page, 'm_product_id', '130');            // the product Stage 1 put on that PO line
      await fillField(page, 'movementqty', '2');
      await fillField(page, 'line', '10');
      // STALE-WITNESS FIX 2026-09-04 (§E4.7): #1636's whole-row check reports the line's own gap —
      //   §PARITY-MANDATORY key=m_inoutline verb=create required=[line,qtyentered,c_uom_id] missing=[c_uom_id]
      // c_uom_id 100 is the UOM every seeded receipt line carries. qtyentered mirrors movementqty.
      // m_locator_id 103's only locator is 101; a line with no locator is skipped by erp_engine.stockMoves
      // (prompts/ERP_STOCK_EFFECT.md §E4.3), so without it Stage 4 could never observe the stock effect.
      await fillField(page, 'c_uom_id', '100');
      await fillField(page, 'qtyentered', '2');
      await fillField(page, 'm_locator_id', '101');
      await clickToolbarBtn(page, 'Save');
      var p2b = await waitForCrudPersist(w, 'm_inoutline', 15000);
      log('§P2P-SAVE table=m_inoutline committed=' + p2b.committed + (p2b.reason ? ' reason=' + p2b.reason : ''));
      if (!p2b.committed) throw new Error('m_inoutline create did not persist: ' + p2b.reason);

      await page.click('#idmp-tabstrip >> text=Material Receipt', { timeout: 8000 }).catch(function () {});
      await page.waitForTimeout(500);
      var found2b = await rowIdByText(page, uniqRcptDoc);
      if (found2b) { await clickRowOpen(found2b.handle, { timeout: 8000 }); await page.waitForTimeout(500); }
      var coBtn2 = page.locator('.idmp-docfsm button[data-doc-action="CO"]');
      var coVis2 = await coBtn2.count();
      if (coVis2) { await coBtn2.first().click(); await w.wait([/§AD-DOCFSM-LIVE.*clicked=CO/], 8000).catch(function () {}); }
      var rcptChip = await page.locator('.idmp-docfsm .chip').first().textContent().catch(function () { return null; });
      var matchPoLine = await w.wait([/§RECEIPT-FANOUT receipt=/], 6000).catch(function () { return null; });
      log('§P2P-FANOUT-CHECK receipt CO chip=' + rcptChip + ' fanoutLine=' + (matchPoLine ? matchPoLine.line : 'NONE'));
      var stage2Ok = !!(rcptChip && /·\s*CO\b/.test(rcptChip));
      verdict(stage2Ok, 'Stage2: Material Receipt reaches CO through the real UI', 'chip=' + rcptChip);
      cycleLine(2, 'MaterialReceipt', 'UI', stage2Ok ? 'PASS' : 'FAIL',
        'm_inout id=' + newRcptId + ' chip=' + rcptChip + ' fanout=' + (matchPoLine ? matchPoLine.line : 'none') + ' coButtonVisible=' + coVis2);
    } catch (e) {
      log('🔴 Stage2 threw: ' + e.message);
      cycleLine(2, 'MaterialReceipt', 'UI', 'FAIL', 'exception: ' + e.message.replace(/\n/g, ' '));
    }

    // ════════════════════════════════════════════════════════════════════
    // STAGE 3 — Vendor Invoice against the same PO (§Fix 1: "create" verb + c_bpartner_id/c_order_id;
    // §Fix 2: issotrxFromWindow derivation).
    // ════════════════════════════════════════════════════════════════════
    console.log('\n═══ STAGE 3 — Vendor Invoice (header + line against the PO) ═══\n');
    var uniqInvDoc = String(Date.now() + 2);
    try {
      await page.goto(deepUrl(port, { login: 'GardenAdmin', window: 183 }), { waitUntil: 'load' });
      await page.waitForSelector('#idmp-toolbar button[title^="New record"]', { timeout: 20000 });
      await clickToolbarBtn(page, 'New record');
      var newAttempt3 = await w.wait([/§INPLACE-NEW table=c_invoice|§AD-MODELVAL-LIVE table=c_invoice/], 6000).catch(function () { return null; });
      var mount3 = await page.$('#idmp-inline-mount [data-col]');
      log('§P2P-NEW-ATTEMPT c_invoice: ' + (newAttempt3 ? newAttempt3.line : 'none captured') + ' mountPresent=' + !!mount3);
      verdict(!!mount3, 'Stage3: Vendor Invoice "New" now mounts a real form (§Fix 1 "create" verb)', 'mountPresent=' + !!mount3);
      if (!mount3) throw new Error('c_invoice New form did not mount — "create" verb fix did not land');

      await fillField(page, 'documentno', uniqInvDoc);
      await fillField(page, 'dateinvoiced', today);
      await fillField(page, 'c_bpartner_id', '120');
      await fillField(page, 'c_order_id', String(newPoId));
      // STALE-WITNESS FIX 2026-09-04 (§E4.7) — the same #1636 whole-row mandatory check as Stage 2.
      // c_invoice's own required set (measured: §PARITY-MANDATORY key=c_invoice verb=create) includes
      // c_doctypetarget_id, c_bpartner_location_id and m_pricelist_id, none of which carry a default.
      // Values EXTRACTED from the seed's OWN vendor invoice for this very vendor (C_Invoice 105,
      // C_BPartner 120): c_doctypetarget_id=123, c_bpartner_location_id=114, m_pricelist_id=102.
      // fillField returns 'absent' harmlessly if a column is not on the form, so these are additive.
      await fillField(page, 'c_doctypetarget_id', '123');
      await fillField(page, 'c_bpartner_location_id', '114');
      await fillField(page, 'm_pricelist_id', '102');
      await clickToolbarBtn(page, 'Save');
      var p3 = await waitForCrudPersist(w, 'c_invoice', 15000);
      log('§P2P-SAVE table=c_invoice committed=' + p3.committed + (p3.reason ? ' reason=' + p3.reason : ''));
      if (!p3.committed) throw new Error('c_invoice header create did not persist: ' + p3.reason);
      var mvLine3 = w.lines.filter(function (l) { return /§AD-MODELVAL-LIVE table=c_invoice verb=create/.test(l); }).pop();
      log('§P2P-STATE c_invoice modelval-derive-line=' + (mvLine3 || 'NONE'));
      await page.waitForTimeout(600);
      var found3 = await rowIdByText(page, uniqInvDoc);
      if (!found3) throw new Error('no grid row found for documentno ' + uniqInvDoc);
      newInvId = found3.id;
      log('§P2P-STATE new c_invoice_id=' + newInvId);

      // ══ THE INVOICE LINE IS MADE BY THE PROCESS, NOT BY TYPING ═════════════════════════════════════
      // Implementing prompts/ERP_P2P_INVOICE_MATCH.md §Fix 2026-09-04b (§CF.3).
      // This used to open the Invoice Line tab and fill m_inoutline_id by hand. It CANNOT: AD_Field locks
      // C_InvoiceLine.M_InOutLine_ID IsReadOnly='Y' on tab 291, faithfully to real iDempiere where only
      // CreateFromInvoice ever sets it. Measured on the last run: §P2P-FILL m_inoutline_id value=-5
      // result=locked → §INVOICE-FANOUT ... matchInvOps=0. So drive the REAL SCREEN instead: the
      // CreateFrom pane (AD_Process 200143) → tick the received line → Create Lines → Confirm & Post.
      await page.goto(deepUrl(port, { login: 'GardenAdmin', process: 200143 }), { waitUntil: 'load' });
      await page.waitForSelector('[data-createfrom-invoice]', { timeout: 20000 });
      var cfInvOpts = await page.$$eval('[data-createfrom-invoice] option',
        function (os) { return os.map(function (o) { return { v: o.value, t: o.textContent }; }); });
      log('§P2P-CREATEFROM invoices offered=' + JSON.stringify(cfInvOpts));
      var wantInv = cfInvOpts.filter(function (o) { return String(o.v) === String(newInvId); })[0];
      if (!wantInv) throw new Error('the CreateFrom pane did not offer the fresh invoice ' + newInvId + ' — offered ' + JSON.stringify(cfInvOpts));
      await page.selectOption('[data-createfrom-invoice]', String(newInvId));
      await page.waitForTimeout(600);
      var cfLines = await page.$$eval('[data-createfrom-lines] input[data-cf-line]',
        function (cs) { return cs.map(function (c) { return c.getAttribute('data-cf-line'); }); });
      log('§P2P-CREATEFROM receipt lines offered=' + JSON.stringify(cfLines));
      if (!cfLines.length) throw new Error('the CreateFrom pane offered no received lines for this vendor');
      // Candidates default UNCHECKED (every completed received line for this vendor is offered, seed rows
      // included). Tick exactly THIS lane's fresh receipt line — the one whose M_InOutLine_ID must end up
      // shared with the M_MatchPO from Stage 2, which is Stage 4c's invariant.
      var freshLines = await foldedRowsFor(page, 'm_inoutline', 'm_inoutline_id');
      var freshLine = ((freshLines && freshLines.rows) || []).filter(function (r) { return String(r.m_inout_id) === String(newRcptId); })[0];
      if (!freshLine) throw new Error('could not resolve the fresh Receipt line to tick in the CreateFrom pane');
      var tickSel = '[data-createfrom-lines] input[data-cf-line="' + freshLine.m_inoutline_id + '"]';
      if (!(await page.$(tickSel))) throw new Error('the CreateFrom pane did not offer the fresh receipt line ' + freshLine.m_inoutline_id + ' — offered ' + JSON.stringify(cfLines));
      await page.check(tickSel);
      log('§P2P-CREATEFROM ticked m_inoutline_id=' + freshLine.m_inoutline_id + ' of ' + cfLines.length + ' offered');
      await page.click('button[data-proc-run]');
      await w.wait([/§CREATEFROM-INVOICE invoice=/], 10000);
      await page.waitForSelector('button[data-genprocess-confirm]', { timeout: 10000 });
      await page.click('button[data-genprocess-confirm]');
      var posted = await w.wait([/§GENPROCESS-CONFIRM table=C_InvoiceLine committed=[YN]/], 15000);
      log('§P2P-SAVE table=c_invoiceline viaProcess=CreateFromInvoice ' + posted.line.replace(/^.*§/, '§'));
      if (!/committed=Y/.test(posted.line)) throw new Error('CreateFromInvoice lines did not post: ' + posted.line);

      // back to the invoice window to Complete it
      await page.goto(deepUrl(port, { login: 'GardenAdmin', window: 183 }), { waitUntil: 'load' });
      await page.waitForSelector('#idmp-toolbar', { timeout: 20000 });
      await page.waitForTimeout(600);

      await page.click('#idmp-tabstrip >> text=Invoice', { timeout: 8000 }).catch(function () {});
      await page.waitForTimeout(500);
      var found3b = await rowIdByText(page, uniqInvDoc);
      if (found3b) { await clickRowOpen(found3b.handle, { timeout: 8000 }); await page.waitForTimeout(500); }
      var coBtn3 = page.locator('.idmp-docfsm button[data-doc-action="CO"]');
      var coVis3 = await coBtn3.count();
      if (coVis3) { await coBtn3.first().click(); await w.wait([/§AD-DOCFSM-LIVE.*clicked=CO/], 8000).catch(function () {}); }
      var invChip = await page.locator('.idmp-docfsm .chip').first().textContent().catch(function () { return null; });
      var matchInvLine = await w.wait([/§INVOICE-FANOUT invoice=/], 6000).catch(function () { return null; });
      log('§P2P-FANOUT-CHECK invoice CO chip=' + invChip + ' fanoutLine=' + (matchInvLine ? matchInvLine.line : 'NONE'));
      var stage3Ok = !!(invChip && /·\s*CO\b/.test(invChip));
      verdict(stage3Ok, 'Stage3: Vendor Invoice reaches CO through the real UI', 'chip=' + invChip);
      cycleLine(3, 'VendorInvoice', 'UI', stage3Ok ? 'PASS' : 'FAIL',
        'c_invoice id=' + newInvId + ' chip=' + invChip + ' fanout=' + (matchInvLine ? matchInvLine.line : 'none') + ' coButtonVisible=' + coVis3);
    } catch (e) {
      log('🔴 Stage3 threw: ' + e.message);
      cycleLine(3, 'VendorInvoice', 'UI', 'FAIL', 'exception: ' + e.message.replace(/\n/g, ' '));
    }

    // ════════════════════════════════════════════════════════════════════
    // STAGE 4 — Three-way match observation: do M_MatchPO and M_MatchInv both exist, and do they share
    // the same M_InOutLine_ID (the real invariant MMatchPO.java enforces at beforeSave)?
    // ════════════════════════════════════════════════════════════════════
    console.log('\n═══ STAGE 4 — Three-way match linkage ═══\n');
    try {
      var mpo = await matchLinesFor(page, 'M_MatchPO');
      var minv = await matchLinesFor(page, 'M_MatchInv');
      log('§P2P-MATCH M_MatchPO rows=' + JSON.stringify(mpo.rows) );
      log('§P2P-MATCH M_MatchInv rows=' + JSON.stringify(minv.rows));
      var sharedIol = mpo.ok && minv.ok && mpo.rows.some(function (p) { return minv.rows.some(function (i) { return p.m_inoutline_id != null && String(p.m_inoutline_id) === String(i.m_inoutline_id); }); });
      verdict(mpo.ok && mpo.rows.length > 0, 'Stage4a: M_MatchPO emitted on Receipt Complete', 'count=' + (mpo.rows || []).length);
      verdict(minv.ok && minv.rows.length > 0, 'Stage4b: M_MatchInv emitted on Invoice Complete', 'count=' + (minv.rows || []).length);
      verdict(sharedIol, 'Stage4c: M_MatchPO and M_MatchInv share the same M_InOutLine_ID (three-way match invariant)', 'shared=' + sharedIol);
      cycleLine(4, 'ThreeWayMatch', 'observed', (mpo.rows.length && minv.rows.length && sharedIol) ? 'PASS' : 'PARTIAL',
        'm_matchpo=' + JSON.stringify(mpo.rows) + ' m_matchinv=' + JSON.stringify(minv.rows) + ' sharedInOutLineId=' + sharedIol);
    } catch (e) {
      log('🔴 Stage4 threw: ' + e.message);
      cycleLine(4, 'ThreeWayMatch', 'observed', 'FAIL', 'exception: ' + e.message.replace(/\n/g, ' '));
    }

  } catch (e) {
    harnessThrew = true;
    console.log('🔴 HARNESS THREW (outside per-stage try/catch): ' + e.message + '\n' + (e.stack || '').split('\n').slice(1, 8).join('\n'));
  } finally {
    await browser.close(); server.close();
  }

  console.log('\n═══ SUMMARY ═══\n');
  stageResults.forEach(function (s) { console.log('  stage ' + s.n + ' (' + s.name + '): ' + s.result); });
  console.log('\nHarness completed to the end: ' + !harnessThrew + ' (exit code reflects HARNESS health only, not stage verdicts — read the §P2P lines above)');
  process.exit(harnessThrew ? 1 : 0);
})().catch(function (e) { console.log('🔴 THREW (top-level) ' + e.message + '\n' + (e.stack || '').split('\n').slice(1, 8).join('\n')); process.exit(1); });
