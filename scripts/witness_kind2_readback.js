#!/usr/bin/env node
// Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
// SPDX-License-Identifier: MIT
// ⚠ DO NOT REMOVE — prompts/AGENT_QUEUE.md §KIND2-READBACK. Scope: the engine-WRITE vs app-READ
// vocabulary gap named in §ERP-SESSION-CLOSE §CLOSE.4 item 1. THE CLAIM UNDER TEST (§K2RB.1):
//
//   after a KIND-2 generator (InOutGenerate 118 / InvoiceGenerate 119) Confirm & Post, the generated
//   document AND its lines are readable through crud_core.listTip — the primitive every grid, every
//   picker and every crud_overlay.completeFanout* uses.
//
// #1654 proved that claim FALSE for CreateFromInvoice (11 signed, verified, UNREADABLE rows) and fixed
// it at the commit seam. The three shipped live witnesses (poc_genship_live / poc_geninv_live /
// poc_genpo_live) cannot judge it at all: on the served seed every generate is EMPTY, so no op-group is
// built, Confirm & Post is never clicked, and no read-back is attempted — SCOPE-BLIND, not green
// (PRIMAL LAW §4). This witness reaches a NON-EMPTY generate honestly: C_Order's own
// AD_Column.DefaultValue is DeliveryRule='F' (Force — no on-hand dependency) and InvoiceRule='I'
// (Immediate — the direct order-line fold), and renderOrderPicker folds freshly-created orders through
// listTip/readTip (§Fix 2026-07-21), so a Sales Order authored through the real UI is a candidate for
// BOTH 118 and 119 with one undelivered/uninvoiced line. NOTHING is seeded behind the UI's back.
//
// REAL USER PATH ONLY: every mutation is a page.click()/fill()/selectOption() on the real toolbar /
// inline form / DocAction bar / process pane. Helpers are reused VERBATIM from
// scripts/witness_p2p_invoice_match.js (mkWaiter/waitForCrudPersist/fillField/clickToolbarBtn/
// rowIdByText/clickRowOpen/deepUrl/foldedRowsFor). The only page.evaluate() calls are READ-ONLY
// observation through the app's OWN published accessors (window.__crud.core.listTip,
// window.__crud.kernelDb, window.KernelOps.replayOps) — never a fake commit.
//
// A break is a real finding, not a script bug — read the log, don't assume PASS from exit code.
// Run: WITNESS_ROOT=/home/red1/bim-ootb node scripts/witness_kind2_readback.js
'use strict';
var path = require('path'), http = require('http'), fs = require('fs');
var ROOT = process.env.WITNESS_ROOT || '/home/red1/bim-ootb';
var MIME = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.css': 'text/css',
  '.db': 'application/octet-stream', '.wasm': 'application/wasm' };
function reqPw() { try { return require('playwright'); } catch (e) { return require('/home/red1/bim-ootb/tests/node_modules/playwright'); } }

function log(m) { console.log('   ' + m); }
var stageResults = [];
// §K2RB — the stage line. committedOps/rawDocs/rawLines come from the SIGNED op log; readableDocs/
// readableLines from listTip. Printing both is the whole point: "committed" and "visible" are two
// different claims (§CLOSE.7 rule 1) and this lane already paid once for confusing them.
function k2rb(n, name, f) {
  var l = '§K2RB stage=' + n + ' name=' + name +
    ' committedOps=' + (f.committedOps == null ? '?' : f.committedOps) +
    ' rawDocs=' + (f.rawDocs == null ? '?' : f.rawDocs) + ' rawLines=' + (f.rawLines == null ? '?' : f.rawLines) +
    ' readableDocs=' + (f.readableDocs == null ? '?' : f.readableDocs) + ' readableLines=' + (f.readableLines == null ? '?' : f.readableLines) +
    ' result=' + f.result + ' detail=' + (f.detail || '');
  console.log(l);
  stageResults.push({ n: n, name: name, result: f.result, detail: f.detail || '' });
  return l;
}
function verdict(ok, label, detail) { console.log('   ' + (ok ? '🟢' : '🔴') + ' ' + label + (detail ? ' — ' + detail : '')); }

function mkWaiter(page, tag) {
  var lines = [], cursor = 0;
  // Log Mandate: the shipped \u00a7-log is PRIMARY EVIDENCE \u2014 echo EVERY \u00a7 line, never a filter narrowed
  // to the lines we already expect (that is how a reject reason goes missing).
  page.on('console', function (m) { var t = m.text(); lines.push(t); if (/^\u00a7/.test(t)) log('[' + tag + '] ' + t); });
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
// foldedRowsFor — READ-ONLY observation of a fresh (sidecar-only) row set through the app's OWN
// published listTip accessor. baseRows=[] on purpose: these tables DO carry seed rows, but a
// generated document can only be a listTip overlay row, so [] isolates exactly the population under
// test (a non-zero count here is a row that did NOT exist in the bundle).
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
// rawOpsFor — the SIGNED op log itself, through window.KernelOps.replayOps: what the commit really
// wrote, in whatever vocabulary it wrote it. The counterpart to foldedRowsFor.
function rawOpsFor(page, opType, table) {
  return page.evaluate(function (a) {
    var K = window.__crud && window.__crud.kernelDb ? window.__crud.kernelDb() : null;
    if (!K || !window.KernelOps) return { ok: false, rows: [] };
    var ops = window.KernelOps.replayOps(K, a.opType);
    var rows = ops.filter(function (o) {
      var p = o.parameters; if (!p) return false;
      var t = String(p.table || '').toLowerCase();
      return t === a.table;
    }).map(function (o) { return o.parameters; });
    return { ok: true, rows: rows };
  }, { opType: opType, table: table });
}
async function fillField(page, col, value) {
  var sel = '#idmp-inline-mount input[data-col="' + col + '"], #idmp-inline-mount select[data-col="' + col + '"]';
  var el = await page.$(sel);
  if (!el) return 'absent';
  var disabled = await el.evaluate(function (e) { return !!e.disabled; });
  if (disabled) return 'locked';
  var visible = await el.isVisible();
  if (!visible) return 'hidden';
  var tag = await el.evaluate(function (e) { return e.tagName; });
  if (tag === 'SELECT') await page.selectOption(sel, String(value)).catch(function () { return 'no-option'; });
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
// clickRowOpen — open the RECORD, not a cell editor (the in-place grid editor stops propagation on
// every data cell; only the DocStatus chip cell and the checkbox cell reach the row handler).
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

// runGenerator — stages 2 and 3 are the SAME shape against two different processes, so they share one
// driver. procId/selAttr/docTable/lineTable/docPk/linePk describe the one that differs.
async function runGenerator(page, w, port, cfg, orderId, stageNo) {
  var f = { committedOps: 0, rawDocs: 0, rawLines: 0, readableDocs: 0, readableLines: 0, result: 'FAIL', detail: '' };
  await page.goto(deepUrl(port, { login: 'GardenAdmin', process: cfg.procId }), { waitUntil: 'load' });
  await page.waitForSelector('select[' + cfg.selAttr + ']', { timeout: 25000 });
  var opts = await page.$$eval('select[' + cfg.selAttr + '] option', function (os) { return os.map(function (o) { return o.value; }).filter(function (v) { return v; }); });
  if (opts.indexOf(String(orderId)) < 0) {
    f.result = 'INCONCLUSIVE';
    f.detail = 'the freshly-authored order ' + orderId + ' is not among the ' + opts.length + ' picker candidates [' + opts.join(',') + '] — nothing to generate from, so nothing was judged';
    return f;
  }
  await page.selectOption('select[' + cfg.selAttr + ']', String(orderId));
  await page.click('button[data-proc-run]');
  await page.waitForSelector('.idmp-procresult', { timeout: 15000 });
  var rxProc = new RegExp('^\\u00a7AD-PROC-LIVE proc=' + cfg.procId + ' ');
  var procLine = w.lines.filter(function (l) { return rxProc.test(l); }).pop() || '(no §AD-PROC-LIVE line for proc ' + cfg.procId + ')';
  f.detail = 'proc=' + procLine;
  var confirm = await page.$('button[data-genprocess-confirm]');
  if (!confirm) {
    f.result = 'INCONCLUSIVE';
    f.detail = 'generate produced NO op-group (empty result — no Confirm & Post button rendered); ' + procLine;
    return f;
  }
  await confirm.click();
  var grp = await w.wait([/§GENPROCESS-CONFIRM .*committed=Y/, /§GENPROCESS-CONFIRM .*committed=N/], 20000)
    .catch(function (e) { return { line: 'TIMEOUT ' + e.message, which: 1 }; });
  f.detail = grp.line;
  if (grp.which !== 0) { f.result = 'FAIL'; return f; }
  var m = /ops=(\d+)/.exec(grp.line); f.committedOps = m ? Number(m[1]) : 0;
  await page.waitForTimeout(900);

  // ── the two claims, side by side ──
  var rawD = await rawOpsFor(page, 'CREATE_DOCUMENT', cfg.docTable);
  var rawL = await rawOpsFor(page, 'CREATE_LINE', cfg.lineTable);
  var crudD = await rawOpsFor(page, 'CRUD_CREATE', cfg.docTable);
  var crudL = await rawOpsFor(page, 'CRUD_CREATE', cfg.lineTable);
  f.rawDocs = (rawD.rows || []).length + (crudD.rows || []).length;
  f.rawLines = (rawL.rows || []).length + (crudL.rows || []).length;
  var fdD = await foldedRowsFor(page, cfg.docTable, cfg.docPk);
  var fdL = await foldedRowsFor(page, cfg.lineTable, cfg.linePk);
  f.readableDocs = (fdD.rows || []).length;
  f.readableLines = (fdL.rows || []).length;

  // the LINK is the real question, not just the count: does a readable line point at a readable doc?
  var docPks = (fdD.rows || []).map(function (r) { return r[cfg.docPk]; });
  var linked = (fdL.rows || []).filter(function (r) { return docPks.indexOf(r[cfg.parentFk]) >= 0; }).length;
  // §CLOSE.7 rule 2 — "counts agreeing is not evidence the values arrived": the FK fold once read
  // attempted=118 inserted=118 failed=0 while binding NULL into every column. So print a STORED ROW,
  // not a count. A row whose non-null columns are only the pk + the audit stamps is a hollow row and
  // is reported as such, even though the count would have said 1.
  var sampleDoc = (fdD.rows || [])[0] || null, sampleLine = (fdL.rows || [])[0] || null;
  function payload(row) {                      // columns that carry actual document data (not pk/audit/std defaults)
    if (!row) return [];
    var std = { createdby: 1, updatedby: 1, created: 1, updated: 1, isactive: 1, processed: 1, processing: 1, posted: 1,
                ad_client_id: 1, ad_org_id: 1 };
    return Object.keys(row).filter(function (k) {
      return !std[k] && k !== cfg.docPk && k !== cfg.linePk && row[k] != null && String(row[k]) !== '';
    });
  }
  var docPayload = payload(sampleDoc), linePayload = payload(sampleLine);
  log('§K2RB-ROW ' + cfg.docTable + ' = ' + JSON.stringify(sampleDoc));
  log('§K2RB-ROW ' + cfg.lineTable + ' = ' + JSON.stringify(sampleLine));
  f.detail = 'committed ok · readable ' + cfg.docTable + '=' + f.readableDocs + ' ' + cfg.lineTable + '=' + f.readableLines +
             ' linesLinkedToADoc=' + linked + ' (parentFk=' + cfg.parentFk + ')' +
             ' docPayloadCols=' + docPayload.length + ' linePayloadCols=' + linePayload.length;
  f.result = (f.readableDocs >= 1 && f.readableLines >= 1 && linked >= 1 &&
              docPayload.length >= 1 && linePayload.length >= 1) ? 'PASS' : 'FAIL';
  console.log('   ' + (f.result === 'PASS' ? '🟢' : '🔴') + ' Stage' + stageNo + ': ' + cfg.name +
    ' — ' + f.committedOps + ' ops committed & signed, ' + f.readableDocs + ' document(s) + ' + f.readableLines +
    ' line(s) readable through listTip, ' + linked + ' line(s) linked to a readable document');
  if (f.result !== 'PASS')
    log('   ↳ ' + ((f.readableDocs && f.readableLines)
      ? 'the rows are READABLE but HOLLOW — docPayloadCols=' + docPayload.length + ' linePayloadCols=' + linePayload.length +
        ' (a count of 1 with no data columns is the §CLOSE.7 rule-2 failure, not a pass)'
      : 'the group committed (verifyOk) but the CRUD read path cannot see it: engine vocabulary ' +
        'CREATE_DOCUMENT/CREATE_LINE, listTip folds CRUD_CREATE/UPDATE/DELETE only'));
  return f;
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
  var w = mkWaiter(page, 'K2RB');
  var today = new Date().toISOString().slice(0, 10);
  var newSoId = null;

  try {
    // ════════════════════════════════════════════════════════════════════
    // STAGE 1 — a Sales Order with one undelivered / uninvoiced line, authored through the real UI.
    // Window 143 ("Sales Order", tab 186 "Order" WhereClause C_Order.IsSOTrx='Y' → the create stashes
    // IsSOTrx='Y'; tab 187 "Order Line"). Mandatory/displayed set read from ad_seed.db, not guessed.
    // ════════════════════════════════════════════════════════════════════
    console.log('\n═══ STAGE 1 — Sales Order (the source document for both generators) ═══\n');
    // DocumentNo must be NUMERIC — §CRUD validate rejects on regex:docno_numeric (measured: a 'K2RB…'
    // prefix was REJECTed on the first run of this witness), same convention witness_p2p_invoice_match.js
    // follows with String(Date.now()).
    var uniqDoc = String(Date.now());
    try {
      await page.goto(deepUrl(port, { login: 'GardenAdmin', window: 143 }), { waitUntil: 'load' });
      await page.waitForSelector('#idmp-toolbar button[title^="New record"]', { timeout: 25000 });
      await clickToolbarBtn(page, 'New record');
      await page.waitForSelector('#idmp-inline-mount [data-col="c_bpartner_id"]', { timeout: 10000 });
      var filled = {};
      // Every value EXTRACTED from the served seed's own completed Sales Order 108 and its line 124 —
      // the row renderOrderPicker already offers — so nothing here is chosen or invented:
      //   c_order 108: bpartner 118, bp_location 113 (its ONLY location), warehouse 103, pricelist 103,
      //                doctypetarget 133 ('Standard Order', DocBaseType SOO, IsSOTrx Y), org 11
      //   c_orderline 124: product 128, uom 100, tax 105, warehouse 103
      filled.documentno = await fillField(page, 'documentno', uniqDoc);
      filled.c_bpartner_id = await fillField(page, 'c_bpartner_id', '118');
      filled.c_bpartner_location_id = await fillField(page, 'c_bpartner_location_id', '113');
      filled.dateordered = await fillField(page, 'dateordered', today);
      filled.datepromised = await fillField(page, 'datepromised', today);
      filled.m_warehouse_id = await fillField(page, 'm_warehouse_id', '103');
      filled.m_pricelist_id = await fillField(page, 'm_pricelist_id', '103');
      filled.c_doctypetarget_id = await fillField(page, 'c_doctypetarget_id', '133');
      filled.deliveryrule = await fillField(page, 'deliveryrule', 'F');
      filled.invoicerule = await fillField(page, 'invoicerule', 'I');
      filled.grandtotal = await fillField(page, 'grandtotal', '64.77');
      log('§K2RB-FORM c_order fills: ' + Object.keys(filled).map(function (k) { return k + '=' + filled[k]; }).join(' '));
      await clickToolbarBtn(page, 'Save');
      var p1 = await waitForCrudPersist(w, 'c_order', 15000);
      log('§K2RB-SAVE table=c_order committed=' + p1.committed + (p1.reason ? ' reason=' + p1.reason : ''));
      if (!p1.committed) throw new Error('SO header create did not persist: ' + p1.reason);
      await page.waitForTimeout(700);
      var found1 = await rowIdByText(page, uniqDoc);
      if (!found1) throw new Error('no grid row found for documentno ' + uniqDoc);
      newSoId = found1.id;
      log('§K2RB-STATE new SO c_order_id=' + newSoId);

      await clickRowOpen(found1.handle, { timeout: 8000 });
      await page.waitForTimeout(500);
      await page.click('#idmp-tabstrip >> text=Order Line', { timeout: 8000 });
      await page.waitForSelector('#idmp-toolbar button[title^="New record"]', { timeout: 10000 });
      await clickToolbarBtn(page, 'New record');
      await page.waitForSelector('#idmp-inline-mount [data-col="m_product_id"]', { timeout: 10000 });
      var lf = {};
      lf.c_order_id = await fillField(page, 'c_order_id', String(newSoId));
      lf.c_bpartner_location_id = await fillField(page, 'c_bpartner_location_id', '113');
      lf.dateordered = await fillField(page, 'dateordered', today);
      lf.line = await fillField(page, 'line', '10');
      lf.m_warehouse_id = await fillField(page, 'm_warehouse_id', '103');
      lf.m_product_id = await fillField(page, 'm_product_id', '128');
      lf.qtyentered = await fillField(page, 'qtyentered', '3');
      lf.c_uom_id = await fillField(page, 'c_uom_id', '100');
      lf.qtyordered = await fillField(page, 'qtyordered', '3');
      lf.priceentered = await fillField(page, 'priceentered', '21.59');
      lf.priceactual = await fillField(page, 'priceactual', '21.59');
      lf.c_tax_id = await fillField(page, 'c_tax_id', '105');
      log('§K2RB-FORM c_orderline fills: ' + Object.keys(lf).map(function (k) { return k + '=' + lf[k]; }).join(' '));
      await clickToolbarBtn(page, 'Save');
      var p1b = await waitForCrudPersist(w, 'c_orderline', 15000);
      log('§K2RB-SAVE table=c_orderline committed=' + p1b.committed + (p1b.reason ? ' reason=' + p1b.reason : ''));
      if (!p1b.committed) throw new Error('SO line create did not persist: ' + p1b.reason);

      await page.click('#idmp-tabstrip >> text=Order', { timeout: 8000 });
      await page.waitForTimeout(600);
      var found1b = await rowIdByText(page, uniqDoc);
      if (!found1b) throw new Error('SO row not found on returning to header tab');
      await clickRowOpen(found1b.handle, { timeout: 8000 });
      await page.waitForTimeout(500);
      var coBtn = page.locator('.idmp-docfsm button[data-doc-action="CO"]');
      if (await coBtn.count()) { await coBtn.first().click(); await w.wait([/§AD-DOCFSM-LIVE.*clicked=CO/], 8000).catch(function () {}); }
      await page.waitForTimeout(400);
      var chip = await page.locator('.idmp-docfsm .chip').first().textContent().catch(function () { return null; });
      var ok1 = !!(chip && /·\s*CO\b/.test(chip));
      k2rb(1, 'SalesOrder', { committedOps: 2, rawDocs: 1, rawLines: 1, readableDocs: 1, readableLines: 1,
        result: ok1 ? 'PASS' : 'FAIL', detail: 'SO id=' + newSoId + ' chip=' + chip });
      verdict(ok1, 'Stage1: the authored Sales Order reaches CO', 'chip=' + chip);
      if (!ok1) throw new Error('SO did not reach CO — the generators gate on DocStatus=CO');
    } catch (e) {
      log('🔴 Stage1 threw: ' + e.message);
      k2rb(1, 'SalesOrder', { result: 'FAIL', detail: 'exception: ' + e.message.replace(/\n/g, ' ') });
    }

    // ════════════════════════════════════════════════════════════════════
    // STAGE 2 — InOutGenerate (118) on that order → Confirm & Post → read back through listTip.
    // ════════════════════════════════════════════════════════════════════
    console.log('\n═══ STAGE 2 — Generate Shipments (AD_Process 118) → commit → read back ═══\n');
    if (newSoId == null) {
      k2rb(2, 'GenerateShipment', { result: 'INCONCLUSIVE', detail: 'no Sales Order was authored — nothing was judged' });
    } else {
      try {
        var f2 = await runGenerator(page, w, port, {
          procId: 118, selAttr: 'data-genship-order', name: 'Generate Shipments',
          docTable: 'm_inout', lineTable: 'm_inoutline', docPk: 'm_inout_id', linePk: 'm_inoutline_id', parentFk: 'm_inout_id'
        }, newSoId, 2);
        k2rb(2, 'GenerateShipment', f2);
      } catch (e) {
        log('🔴 Stage2 threw: ' + e.message);
        k2rb(2, 'GenerateShipment', { result: 'FAIL', detail: 'exception: ' + e.message.replace(/\n/g, ' ') });
      }
    }

    // ════════════════════════════════════════════════════════════════════
    // STAGE 3 — InvoiceGenerate (119) on the same order → Confirm & Post → read back through listTip.
    // ════════════════════════════════════════════════════════════════════
    console.log('\n═══ STAGE 3 — Generate Invoices (AD_Process 119) → commit → read back ═══\n');
    if (newSoId == null) {
      k2rb(3, 'GenerateInvoice', { result: 'INCONCLUSIVE', detail: 'no Sales Order was authored — nothing was judged' });
    } else {
      try {
        var f3 = await runGenerator(page, w, port, {
          procId: 119, selAttr: 'data-geninv-order', name: 'Generate Invoices',
          docTable: 'c_invoice', lineTable: 'c_invoiceline', docPk: 'c_invoice_id', linePk: 'c_invoiceline_id', parentFk: 'c_invoice_id'
        }, newSoId, 3);
        k2rb(3, 'GenerateInvoice', f3);
      } catch (e) {
        log('🔴 Stage3 threw: ' + e.message);
        k2rb(3, 'GenerateInvoice', { result: 'FAIL', detail: 'exception: ' + e.message.replace(/\n/g, ' ') });
      }
    }
  } catch (e) {
    harnessThrew = true;
    console.log('🔴 HARNESS THREW: ' + e.message);
  } finally {
    await browser.close();
    server.close();
  }

  console.log('\n═══ SUMMARY ═══\n');
  stageResults.forEach(function (s) { console.log('  stage ' + s.n + ' (' + s.name + '): ' + s.result); });
  var judged = stageResults.filter(function (s) { return s.result === 'PASS' || s.result === 'FAIL'; });
  var allPass = judged.length === stageResults.length && stageResults.length >= 3 && stageResults.every(function (s) { return s.result === 'PASS'; });
  if (!judged.length) console.log('\n🔴 W-KIND2-READBACK INCONCLUSIVE — no stage was actually judged (a 0 here means nothing, not "clean")');
  else if (allPass) console.log('\n🟢 W-KIND2-READBACK PASS — every KIND-2 generator\'s committed document AND lines are readable through crud_core.listTip, and each line links to a readable document');
  else console.log('\n🔴 W-KIND2-READBACK FAIL — a KIND-2 generator committed a signed, verified op-group that the CRUD read path cannot see (see the §K2RB lines: committedOps > 0 with readableDocs/readableLines 0)');
  console.log('\nHarness completed to the end: ' + (!harnessThrew) + ' (exit code reflects HARNESS health only, not stage verdicts — read the §K2RB lines above)');
  process.exit(harnessThrew ? 1 : 0);
})();
