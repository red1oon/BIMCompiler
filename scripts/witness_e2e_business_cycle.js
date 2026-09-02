#!/usr/bin/env node
// Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
// SPDX-License-Identifier: MIT
// ⚠ DO NOT REMOVE — prompts/ERP_BUSINESS_CYCLE_E2E.md. DISCOVERY WITNESS, not a green-run hunt.
//
// THE ONE QUESTION: can a real user drive a full business cycle end-to-end through the live iDempiere
// surface today (Sales Order -> Shipment -> Sales Invoice -> stock effect -> replenishment signal ->
// Purchase Order -> Material Receipt -> vendor invoice + three-way match), and if not, exactly WHERE
// does it break? A break IS the deliverable. This file does NOT bend the test, skip a stage, or
// substitute engine-level calls to manufacture a pass. Where a stage cannot be driven through the UI,
// that is recorded as the finding and the witness CONTINUES to the next stage from whatever state is
// legitimately reachable.
//
// REAL USER PATH ONLY (feedback_test_real_user_path_not_seams.md): every mutation is driven by
// page.click()/page.fill()/page.selectOption() on the real toolbar (#idmp-toolbar New/Save buttons),
// the real inline CRUD-ring `[data-col]` fields (the same DOM crud_overlay.js's saveForm()/commitCrud()
// wires to), the real DocAction bar (`[data-doc-action]`, buildDocActionBar in idempiere.html), and the
// real Process picker reached via the app's own DOCUMENTED `?process=<id>` deep link (idempiere.html
// `_pendingPid`, "mirrors ?window=" per its own comment at line ~632/2328 — the SAME class of shipped
// entry point as `?window=&record=` that the two precedent witnesses already used, not a test backdoor).
// The ONLY page.evaluate() calls are READ-ONLY: `window.__idmpDb.exec(sql)` — the exact accessor
// idempiere.html's own `_sqlRows()` uses internally to populate every grid/picker on screen — and
// `window.__crud.kernelDb()` (the published read-only sidecar accessor, same as the two precedent
// witnesses). No page.evaluate() ever fakes a commit.
//
// NON-INVENT: every ID below (products, business partners, warehouses, orders, doc types) was verified
// directly against the shipped `erp/ad_seed.db` via sqlite3 BEFORE writing this file — see the recon
// commands in the session log. GardenWorld = AD_Client_ID 11. Product 130 "Plum Tree" carries 18 units
// on-hand in HQ Warehouse (103) / Locator 101 at recon time. C_BPartner 112 "Standard" is a real
// customer; C_BPartner 120 "Seed Farm Inc." is a real vendor (isvendor='Y'). All four existing GardenWorld
// Sales Orders (100/101/102/108) are ALREADY fully delivered+invoiced (qtydelivered=qtyordered,
// qtyinvoiced=qtyordered) at recon time — so demonstrating a REAL shipment/invoice effect (not an honest
// "0 rows, nothing to do") requires authoring a fresh order through the UI, which is exactly what Stage 1
// attempts.
//
// KEY RECON FINDINGS THAT SHAPE WHAT THIS WITNESS EXPECTS (from reading crud_ops.json + ad_process.js
// BEFORE running, not guessed): (a) `c_invoice`'s curated `verbs` in erp/crud_ops.json are
// `["update","delete","process"]` — "create" is ABSENTED BY DESIGN, so C_Invoice can NEVER be manually
// authored via the UI, sales OR purchase; the ONLY route to a real invoice is the InvoiceGenerate process.
// (b) `inoutGenGate`/`invoiceGenGate` in erp/ad_process.js BOTH hard-require `IsSOTrx='Y'` and the
// renderOrderPicker() UI additionally hardcodes `AND issotrx='Y'` in its SQL — so Generate
// Shipments/Invoices NEVER offers a Purchase Order, by construction, at both the engine gate AND the UI
// layer. (c) No `M_MatchPO` CREATE_LINE exists anywhere in erp_engine.js (grep-verified) — only
// `M_MatchInv` is ever built, and only inside `completeInvoice()` when invoice.issotrx==='N', which is
// unreachable per (a). (d) Replenishment (`m_replenish` table, real level_min/level_max rows exist) is
// wired ONLY inside the POS lens (pos_lens.js `generateReplenish()`) — no standalone AD_Process handler
// for `org.compiere.process.ReplenishReport*` is registered in ad_process.js's REGISTRY. This witness
// drives each of these live to see whether the reading of the source matches what the real UI actually
// does — a disproof of any one of these predictions is an equally valid, equally reported result.
//
// Run: bash build/erp/run_witness.sh scripts/witness_e2e_business_cycle.js  (from bim-compiler) — then
//   READ build/erp/witness_e2e_business_cycle.log before ANY conclusion (Log Mandate). Exit code is not
//   evidence: breaks are the EXPECTED outcome here, so exit 0 means "the harness ran correctly and
//   produced a real per-stage verdict", NOT "the cycle passed". Exit 1 means the HARNESS ITSELF failed
//   (threw before completing its own bookkeeping) — that distinction is stated explicitly in the final
//   summary line.
'use strict';
var path = require('path'), http = require('http'), fs = require('fs');
var ROOT = process.env.WITNESS_ROOT || '/home/red1/bim-ootb';   // live product UI lives there — bim-compiler only hosts this witness + its log
var MIME = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.css': 'text/css',
  '.db': 'application/octet-stream', '.wasm': 'application/wasm' };
function reqPw() { try { return require('playwright'); } catch (e) { return require('/home/red1/bim-ootb/tests/node_modules/playwright'); } }

function log(m) { console.log('   ' + m); }
var stageResults = [];
function cycleLine(n, name, driven, result, detail) {
  var l = '§CYCLE stage=' + n + ' name=' + name + ' driven=' + driven + ' result=' + result + ' detail=' + detail;
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
    rxSkip = new RegExp('§(CRUD-HOSTCREATE|INPLACE-NEW) table=' + table + ' skipped'),
    // 2026-09-02 (ERP_IDEMPIERE_UX_PARITY.md §P5): a field-validation REJECT (e.g. `required` on an AD-mandatory column
    // the form now shows) is a real, named outcome — report it as such instead of a silent timeout.
    rxValidate = new RegExp('§CRUD validate key=' + table + ' verb=create REJECT'),
    rxHook = new RegExp('§AD-MODELVAL-LIVE table=' + table + ' verb=create hook=.*REJECT');
  return waiter.wait([rxPersist, rxReject, rxSkip, rxValidate, rxHook], timeoutMs).then(function (r) {
    if (r.which === 0) return { committed: true, line: r.line };
    if (r.which === 1) return { committed: false, reason: 'owner-gate REJECT', line: r.line };
    if (r.which === 3) return { committed: false, reason: 'validation REJECT: ' + r.line.slice(r.line.indexOf('errors=')), line: r.line };
    if (r.which === 4) return { committed: false, reason: 'beforeSave hook REJECT: ' + r.line.slice(r.line.indexOf('hook=')), line: r.line };
    return { committed: false, reason: 'create not permitted', line: r.line };
  }).catch(function (e) { return { committed: false, reason: 'timeout: ' + e.message }; });
}
// sql — READ-ONLY observation via the app's OWN accessor (idempiere.html's _sqlRows uses the identical
// window.__idmpDb.exec() call to populate every grid/picker on screen). Never used to write.
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
// tipDocsFor — read-only observation via the app's OWN PUBLISHED sidecar API (window.__crud.core.tipDocs,
// crud_overlay.js line ~332 — the same read-the-tip helper the host itself uses to fold CREATE_DOCUMENT
// ops off the signed op-log). Necessary because a document produced by a Generate-Shipments/Invoices
// process run also lands ONLY in the kernel_ops sidecar (same mechanism as a manual CRUD create — see
// rowIdByText's header comment), never as a raw INSERT into window.__idmpDb. Filters by source_id (the
// order's key) to find the specific document THIS witness caused.
function tipDocsFor(page, table, sourceId) {
  return page.evaluate(function (args) {
    var K = window.__crud && window.__crud.kernelDb ? window.__crud.kernelDb() : null;
    if (!K) return { ok: false, docs: [] };
    var all = window.__crud.core.tipDocs(K, args.table);
    var match = all.filter(function (d) { return String(d.doc.source_id) === String(args.sourceId); });
    return { ok: true, allCount: all.length, docs: match };
  }, { table: table, sourceId: sourceId });
}
async function fillField(page, col, value, kind) {
  // Each field row can carry BOTH an interactive control AND a read-only display span sharing the same
  // data-col (recon-confirmed: `data-col="x":SELECT | data-col="x":SPAN`) — so match only INPUT/SELECT.
  var sel = '#idmp-inline-mount input[data-col="' + col + '"], #idmp-inline-mount select[data-col="' + col + '"]';
  var el = await page.$(sel);
  if (!el) return 'absent';
  var disabled = await el.evaluate(function (e) { return !!e.disabled; });
  if (disabled) return 'locked';   // e.g. C_Order_ID on a line tab, correctly pre-locked to the parent record
  var visible = await el.isVisible();
  if (!visible) return 'hidden';   // real AD DisplayLogic (§AD-LOGIC-LIVE) hid this field given current values
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
// rowIdByText — real-UI-observable lookup: every grid <tr> carries data-ad-record="<key>" (idempiere.html
// renderGrid, `tr.setAttribute('data-ad-record', recVal(rec, _keyCol(tab)))`). A freshly created record
// lives ONLY in the crud-overlay sidecar (kernel_ops.db) — NOT in the raw window.__idmpDb sql.js instance
// (confirmed live: `§CRUD-PERSIST key=c_order id=null ... source=sidecar`, and the SAME `§LIST-TIP overlay
// table=c_order base=5 folded=6 created=1` line shows the grid is a FOLD of base-db + sidecar-overlay).
// So the new record's real key must be read off the rendered row, never off a raw `window.__idmpDb.exec()`
// SELECT (that would only see the base=5 seed rows). This is READ-ONLY DOM observation, not a write.
async function rowIdByText(page, text) {
  var rows = await page.$$('tr[data-ad-record]');
  for (var i = 0; i < rows.length; i++) {
    var t = await rows[i].textContent();
    if (t && t.indexOf(text) >= 0) return { id: await rows[i].getAttribute('data-ad-record'), handle: rows[i] };
  }
  return null;
}
// clickRowOpen — open a row's FULL record form (idmp-docfsm bar included), not a single-cell inline editor.
//   ROOT CAUSE (found 2026-07-21, this session, W-SO-DOCACTION-CLICK): a bare row.click() lands wherever
//   Playwright's default click point (the element's geometric center) happens to fall — and idempiere.html's
//   grid deliberately makes EVERY individually crud-editable cell (P4 W-INPLACE-GRID-LIVE, "GridView parity")
//   open a single-field inline cell editor on click, stopPropagation()-ing past the row's own click handler
//   (idempiere.html _editGridCell). Whether the click lands on such a cell is pure column-layout luck per
//   window — it happened to land on `documentno` (curated crud-editable) for window 143's Order tab and on
//   `POReference` (NOT in crud_ops.json's c_order field list, so _editGridCell falls through to openForm())
//   for window 181's Purchase Order tab — same table, same code, no Sales-Order-specific defect. Click the
//   POReference cell explicitly (present in both windows, deterministically non-crud-editable) so every
//   caller reliably reaches the full form + DocAction bar, matching what a real user opening the record sees.
//   2026-09-02 (bim-compiler prompts/ERP_IDEMPIERE_UX_PARITY.md §P1, W-PARITY-FIELDSET): POReference stopped being
//   "deterministically non-crud-editable" the moment the curated-5 hand list was retired — the record's editor (and
//   therefore _editGridCell) now carries the FULL AD field set, and POReference is AD-updateable, so that click opened
//   a cell editor instead of the form (found by this witness, stage 1 `§INPLACE-CELL-OPEN … col=poreference`). The
//   host's own gesture for "open the record" is the DocStatus chip cell (renderGrid: the status <td> has NO
//   stopPropagation, so it reaches the row's click → form view) or the ▤ Form toolbar toggle — click the chip.
async function clickRowOpen(row, opts) {
  var stCell = await row.$('td[data-ad-col="DocStatus"]');
  if (stCell) { await stCell.click(opts); return; }
  var poCell = await row.$('td[data-ad-col="POReference"]');
  if (poCell) { await poCell.click(opts); return; }
  await row.click(opts);   // defensive fallback if neither column is rendered on some other table/window
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

  // ONE browser tab for the whole cycle (Ground Rules — avoids the known cross-tab blob-clobber confound).
  var page = await browser.newPage();
  var w = mkWaiter(page, 'CYC');
  var today = new Date().toISOString().slice(0, 10);
  var uniqDoc = String(Date.now());   // must be pure-numeric — crud_ops.json c_order.documentno validation is ^[0-9]+$ (docno_numeric)

  var newSoId = null, newPoId = null, newShipId = null, newInvId = null, newRcptId = null;

  try {
    // ════════════════════════════════════════════════════════════════════
    // STAGE 1 — Sales Order: author a fresh order (real seed data is already fully delivered/invoiced),
    // complete it via the real DocAction bar.
    // ════════════════════════════════════════════════════════════════════
    console.log('\n═══ STAGE 1 — Sales Order ═══\n');
    try {
      await page.goto(deepUrl(port, { login: 'GardenAdmin', window: 143 }), { waitUntil: 'load' });
      await page.waitForSelector('#idmp-toolbar button[title^="New record"]', { timeout: 20000 });
      await clickToolbarBtn(page, 'New record');
      await page.waitForSelector('#idmp-inline-mount [data-col="c_bpartner_id"]', { timeout: 10000 });
      await fillField(page, 'documentno', uniqDoc);
      await fillField(page, 'c_bpartner_id', '112');   // Standard (real customer, verified in ad_seed.db)
      await fillField(page, 'dateordered', today);
      await fillField(page, 'grandtotal', '30.00');
      await fillField(page, 'm_pricelist_id', '101');   // Standard price list
      await fillField(page, 'bill_bpartner_id', '112');
      await clickToolbarBtn(page, 'Save');
      var p1 = await waitForCrudPersist(w, 'c_order', 15000);
      log('§E2E-SAVE table=c_order committed=' + p1.committed + (p1.reason ? ' reason=' + p1.reason : ''));
      if (!p1.committed) throw new Error('c_order header create did not persist: ' + p1.reason);

      // Real-UI-observable ID capture (the new record lives only in the crud-overlay sidecar until a
      // later boot folds it — see rowIdByText's header comment) — read the rendered grid row, not raw SQL.
      await page.waitForTimeout(600);
      var found1 = await rowIdByText(page, uniqDoc);
      if (!found1) throw new Error('no grid row found for documentno ' + uniqDoc + ' after save');
      newSoId = found1.id;
      log('§E2E-STATE new c_order_id(from grid row)=' + newSoId);
      verdict(newSoId != null, 'Stage1: new C_Order row is rendered in the grid with a real key', 'id=' + newSoId);

      // Order Line — select the new order's OWN row (reuse the exact handle rowIdByText found — a fresh
      // text-locator re-match risked landing on an unrelated row; a real user would just click the row
      // they see, this is that same click), then the Order Line detail tab. Verify the master/detail
      // parent filter (§IDEMPIERE-MD) actually locked onto OUR order before trusting anything filled next.
      await clickRowOpen(found1.handle, { timeout: 8000 });
      await page.waitForTimeout(400);
      await page.click('#idmp-tabstrip >> text=Order Line', { timeout: 8000 });
      var mdLine = await w.wait([/§IDEMPIERE-MD tab=Order Line/], 8000).catch(function () { return null; });
      log('§E2E-MD-CHECK ' + (mdLine ? mdLine.line : 'no §IDEMPIERE-MD line captured'));
      if (!mdLine || mdLine.line.indexOf('C_Order_ID=' + newSoId) < 0) throw new Error('Order Line tab locked onto the WRONG parent — expected C_Order_ID=' + newSoId + ', got: ' + (mdLine ? mdLine.line : 'none'));
      await page.waitForSelector('#idmp-toolbar button[title^="New record"]', { timeout: 10000 });
      await clickToolbarBtn(page, 'New record');
      await page.waitForSelector('#idmp-inline-mount [data-col="m_product_id"]', { timeout: 10000 });
      await fillField(page, 'c_order_id', String(newSoId));
      await fillField(page, 'c_bpartner_id', '112');
      await fillField(page, 'c_bpartner_location_id', '108');   // Monroe, real location for BP 112
      await fillField(page, 'dateordered', today);
      await fillField(page, 'line', '10');
      await fillField(page, 'm_warehouse_id', '103');            // HQ Warehouse
      await fillField(page, 'm_product_id', '130');              // Plum Tree, 18 on-hand at recon
      await fillField(page, 'qtyentered', '2');
      await fillField(page, 'c_uom_id', '100');                  // Each
      await fillField(page, 'qtyordered', '2');
      await fillField(page, 'priceentered', '15.00');
      await fillField(page, 'priceactual', '15.00');
      await fillField(page, 'c_tax_id', '104');
      await clickToolbarBtn(page, 'Save');
      var p1b = await waitForCrudPersist(w, 'c_orderline', 15000);
      log('§E2E-SAVE table=c_orderline committed=' + p1b.committed + (p1b.reason ? ' reason=' + p1b.reason : ''));
      if (!p1b.committed) throw new Error('order line create did not persist: ' + p1b.reason);

      // Back to header, select the order, Complete (CO). Re-find the row fresh (a full grid re-render
      // happened) via the same real-UI-observable data-ad-record lookup as Stage1's initial capture.
      await page.click('#idmp-tabstrip >> text=Order', { timeout: 8000 });
      await page.waitForTimeout(500);
      var found1b = await rowIdByText(page, uniqDoc);
      if (!found1b) throw new Error('order row for ' + uniqDoc + ' not found on returning to the Order tab');
      await clickRowOpen(found1b.handle, { timeout: 8000 });
      await page.waitForTimeout(500);
      var coBtn = page.locator('.idmp-docfsm button[data-doc-action="CO"]');
      var coVisible = await coBtn.count();
      log('§E2E-DOCACTION available=[CO visible=' + coVisible + ']');
      if (coVisible) {
        await coBtn.first().click();
        await w.wait([/§AD-DOCFSM-LIVE.*clicked=CO/], 8000).catch(function () {});
      }
      // Real-UI-observable status read: the DocAction bar's own status chip (.idmp-docfsm .chip), the
      // same element the user reads — not a raw SQL query (new/updated rows live in the sidecar overlay).
      await page.waitForTimeout(500);
      var chipText = await page.locator('.idmp-docfsm .chip').first().textContent().catch(function () { return null; });
      log('§E2E-STATE c_order_id=' + newSoId + ' DocAction chip=' + chipText);
      var stage1Ok = !!(chipText && /·\s*CO\b/.test(chipText));
      verdict(stage1Ok, 'Stage1: order reaches CO via the real DocAction bar', 'chip=' + chipText);
      var whLine = w.lines.filter(function (l) { return /§AD-MODELVAL-LIVE table=c_order verb=create/.test(l); }).pop();
      var whMatch = whLine && /m_warehouse_id":(\d+)/.exec(whLine);
      cycleLine(1, 'SalesOrder', 'UI', stage1Ok ? 'PASS' : 'FAIL',
        stage1Ok ? ('order ' + uniqDoc + ' (id=' + newSoId + ') authored+completed via real UI; header New form has NO m_warehouse_id field but a save-hook derives it (' + (whMatch ? whMatch[1] : '?') + ') per §AD-MODELVAL-LIVE')
                  : ('order created (id=' + newSoId + ') but DocAction CO did not land — chip=' + chipText + ' coButtonVisible=' + coVisible));
    } catch (e) {
      log('🔴 Stage1 threw: ' + e.message);
      cycleLine(1, 'SalesOrder', 'UI', 'FAIL', 'exception: ' + e.message.replace(/\n/g, ' '));
    }

    // ════════════════════════════════════════════════════════════════════
    // STAGE 2 — Delivery / Shipment: Generate Shipments (AD_Process 118) via the real ?process= deep link.
    // ════════════════════════════════════════════════════════════════════
    console.log('\n═══ STAGE 2 — Delivery / Shipment ═══\n');
    try {
      await page.goto(deepUrl(port, { login: 'GardenAdmin', process: 118 }), { waitUntil: 'load' });
      await page.waitForSelector('select[data-genship-order]', { timeout: 15000 });
      var opts = await page.$$eval('select[data-genship-order] option', function (os) { return os.map(function (o) { return { v: o.value, t: o.textContent }; }); });
      log('§E2E-PICKER genship options=' + JSON.stringify(opts));
      var target = newSoId ? String(newSoId) : null;
      var hasTarget = target && opts.some(function (o) { return o.v === target; });
      if (!hasTarget) throw new Error('new SO not offered by Generate-Shipments picker (target=' + target + ', options=' + JSON.stringify(opts) + ')');
      await page.selectOption('select[data-genship-order]', target);
      await page.click('button[data-proc-run]');
      var r2 = await w.wait([/§AD-PROC-LIVE proc=118/], 10000).catch(function (e) { return null; });
      log('§E2E-RUN genship result-line=' + (r2 ? r2.line : 'NONE CAPTURED'));
      await page.waitForTimeout(300);
      // §GENPROCESS-CONFIRM (ERP_BUSINESS_CYCLE_E2E.md §Fix 2026-07-22) — the preview alone never commits;
      // click the real "Confirm & Post" button (only rendered when the computed result is non-empty) so
      // this witness proves the FULL user path, not just the preview half.
      var cfBtn2 = await page.$('button[data-genprocess-confirm]');
      if (cfBtn2) {
        await cfBtn2.click();
        var rc2 = await w.wait([/§GENPROCESS-CONFIRM/], 10000).catch(function () { return null; });
        log('§E2E-CONFIRM genship result-line=' + (rc2 ? rc2.line : 'NONE CAPTURED'));
      } else {
        log('§E2E-CONFIRM genship: no Confirm button rendered (empty/absent computed result)');
      }
      await page.waitForTimeout(800);
      var shipTip = await tipDocsFor(page, 'm_inout', newSoId);
      log('§E2E-STATE m_inout tipDocs for order ' + newSoId + ': ' + JSON.stringify(shipTip));
      var stage2Ok = shipTip.ok && shipTip.docs.length > 0;
      if (stage2Ok) newShipId = shipTip.docs[0].opId;
      verdict(stage2Ok, 'Stage2: a real M_InOut CREATE_DOCUMENT op was recorded for the new order', JSON.stringify(shipTip));
      cycleLine(2, 'Shipment', 'UI', stage2Ok ? 'PASS' : 'FAIL',
        stage2Ok ? ('M_InOut created (op=' + newShipId + ', ' + JSON.stringify(shipTip.docs[0].doc) + ') via real Generate-Shipments process picker')
                  : ('Generate-Shipments ran but no m_inout CREATE_DOCUMENT op resulted; picker options=' + JSON.stringify(opts) + ' tipDocs=' + JSON.stringify(shipTip)));
    } catch (e) {
      log('🔴 Stage2 threw: ' + e.message);
      cycleLine(2, 'Shipment', newSoId ? 'UI' : 'BLOCKED', newSoId ? 'FAIL' : 'ABSENT',
        newSoId ? ('exception: ' + e.message.replace(/\n/g, ' ')) : 'no completed order from Stage1 to generate a shipment from');
    }

    // ════════════════════════════════════════════════════════════════════
    // STAGE 3 — Sales Invoice: Generate Invoices (AD_Process 119).
    // ════════════════════════════════════════════════════════════════════
    console.log('\n═══ STAGE 3 — Sales Invoice ═══\n');
    try {
      await page.goto(deepUrl(port, { login: 'GardenAdmin', process: 119 }), { waitUntil: 'load' });
      await page.waitForSelector('select[data-geninv-order]', { timeout: 15000 });
      var opts3 = await page.$$eval('select[data-geninv-order] option', function (os) { return os.map(function (o) { return { v: o.value, t: o.textContent }; }); });
      log('§E2E-PICKER geninv options=' + JSON.stringify(opts3));
      var target3 = newSoId ? String(newSoId) : null;
      var hasTarget3 = target3 && opts3.some(function (o) { return o.v === target3; });
      if (!hasTarget3) throw new Error('new SO not offered by Generate-Invoices picker (target=' + target3 + ', options=' + JSON.stringify(opts3) + ')');
      await page.selectOption('select[data-geninv-order]', target3);
      await page.click('button[data-proc-run]');
      var r3 = await w.wait([/§AD-PROC-LIVE proc=119/], 10000).catch(function () { return null; });
      log('§E2E-RUN geninv result-line=' + (r3 ? r3.line : 'NONE CAPTURED'));
      await page.waitForTimeout(300);
      var cfBtn3 = await page.$('button[data-genprocess-confirm]');
      if (cfBtn3) {
        await cfBtn3.click();
        var rc3 = await w.wait([/§GENPROCESS-CONFIRM/], 10000).catch(function () { return null; });
        log('§E2E-CONFIRM geninv result-line=' + (rc3 ? rc3.line : 'NONE CAPTURED'));
      } else {
        log('§E2E-CONFIRM geninv: no Confirm button rendered (empty/absent computed result)');
      }
      await page.waitForTimeout(800);
      var invTip = await tipDocsFor(page, 'c_invoice', newSoId);
      log('§E2E-STATE c_invoice tipDocs for order ' + newSoId + ': ' + JSON.stringify(invTip));
      var stage3Ok = invTip.ok && invTip.docs.length > 0;
      if (stage3Ok) newInvId = invTip.docs[0].opId;
      verdict(stage3Ok, 'Stage3: a real C_Invoice CREATE_DOCUMENT op was recorded for the new order', JSON.stringify(invTip));
      cycleLine(3, 'SalesInvoice', 'UI', stage3Ok ? 'PASS' : 'FAIL',
        stage3Ok ? ('C_Invoice created (op=' + newInvId + ', ' + JSON.stringify(invTip.docs[0].doc) + ') via real Generate-Invoices process picker')
                  : ('Generate-Invoices ran but no c_invoice CREATE_DOCUMENT op resulted; picker options=' + JSON.stringify(opts3) + ' tipDocs=' + JSON.stringify(invTip)));
    } catch (e) {
      log('🔴 Stage3 threw: ' + e.message);
      cycleLine(3, 'SalesInvoice', newSoId ? 'UI' : 'BLOCKED', newSoId ? 'FAIL' : 'ABSENT',
        newSoId ? ('exception: ' + e.message.replace(/\n/g, ' ')) : 'no completed order from Stage1 to invoice');
    }

    // ════════════════════════════════════════════════════════════════════
    // STAGE 4 — Stock effect: on-hand for product 130 / warehouse 103, before (recon baseline=18) vs now.
    // ════════════════════════════════════════════════════════════════════
    console.log('\n═══ STAGE 4 — Stock effect ═══\n');
    try {
      // m_storageonhand lives in the raw seed db (window.__idmpDb) — this read is valid for it (unlike
      // c_order/m_inout) because nothing about this table is CRUD-overlay-authored in this witness.
      var stkRows = await sql(page, "SELECT s.qtyonhand FROM m_storageonhand s JOIN m_locator l ON l.m_locator_id=s.m_locator_id WHERE s.m_product_id=130 AND l.m_warehouse_id=103");
      var qty = stkRows.length ? stkRows[0].qtyonhand : null;
      log('§E2E-STOCK product=130(Plum Tree) warehouse=103 baseline=18 current=' + qty);
      var stage4Ok = qty != null && Number(qty) < 18;
      verdict(stage4Ok, 'Stage4: on-hand visibly reduced by the shipment', 'baseline=18 current=' + qty);
      cycleLine(4, 'StockEffect', 'UI-observed', stage4Ok ? 'PASS' : (newShipId ? 'FAIL' : 'ABSENT'),
        'm_storageonhand product=130 warehouse=103 baseline=18 current=' + qty +
        (newShipId ? (' (M_InOut op=' + newShipId + ' was created upstream via the crud-overlay sidecar, but m_storageonhand lives only in the raw seed db — no live fold/recompute of on-hand off the op-log was found anywhere in idempiere.html/crud_overlay.js, so a created shipment CANNOT change what this table shows even if the document itself is real)')
                  : ' (no shipment was created upstream — Stage2 did not produce a document to reduce stock)'));
    } catch (e) {
      log('🔴 Stage4 threw: ' + e.message);
      cycleLine(4, 'StockEffect', 'UI-observed', 'FAIL', 'exception: ' + e.message.replace(/\n/g, ' '));
    }

    // ════════════════════════════════════════════════════════════════════
    // STAGE 5 — Replenishment signal: only wired inside the POS lens (pos_lens.js), per source recon.
    // ════════════════════════════════════════════════════════════════════
    console.log('\n═══ STAGE 5 — Replenishment signal ═══\n');
    try {
      await page.goto(deepUrl(port, { login: 'GardenUser', lens: 'pos' }), { waitUntil: 'load' });
      await page.waitForTimeout(2500);
      var posPresent = await page.$('#pos-wrap, .pos-lens, #pos-root, [class*=pos]');
      // The replenishment button lives inside #pos-float-panel, which is display:none until the real
      // cart pill (#pos-pill-payment) is tapped (doc §7: "the cart pill summons a floating panel") —
      // drive that real gesture first, exactly as a user would, before looking for Generate Replenishment.
      var cartPill = await page.$('#pos-pill-payment');
      if (cartPill) { await cartPill.click(); await page.waitForTimeout(500); log('§E2E-POS cart-pill clicked to open float panel'); }
      var replBtn = await page.$('#pos-repl-generate');
      var replVisible = replBtn ? await replBtn.isVisible() : false;
      log('§E2E-POS posSurfacePresent=' + !!posPresent + ' cartPillPresent=' + !!cartPill + ' replenishButtonPresent=' + !!replBtn + ' visible=' + replVisible);
      var stage5Detail, stage5Result;
      if (replBtn && replVisible) {
        await replBtn.click();
        await page.waitForTimeout(1500);
        var replText = await page.evaluate(function () { var h = document.querySelector('*'); return document.body.innerText.slice(0, 4000); }).catch(function () { return ''; });
        var staged = /staged|Replenishment \(/i.test(replText);
        log('§E2E-POS replenishment-staged=' + staged);
        stage5Result = staged ? 'PASS' : 'FAIL';
        stage5Detail = staged ? 'Generate Replenishment produced a staged list (real m_replenish level_min/level_max rows exist in seed)' : 'Generate Replenishment clicked but no staged list detected';
      } else {
        stage5Result = 'ABSENT';
        stage5Detail = 'no standalone AD_Process/menu path for replenishment outside POS (source recon: only pos_lens.js wires it; org.compiere.process.ReplenishReport* is NOT in ad_process.js REGISTRY) — POS surface itself ' + (posPresent ? 'loaded but' : 'did not load;') + ' no Generate-Replenishment affordance found';
      }
      cycleLine(5, 'ReplenishmentSignal', posPresent ? 'UI' : 'BLOCKED', stage5Result, stage5Detail);
    } catch (e) {
      log('🔴 Stage5 threw: ' + e.message);
      cycleLine(5, 'ReplenishmentSignal', 'BLOCKED', 'FAIL', 'exception: ' + e.message.replace(/\n/g, ' '));
    }

    // ════════════════════════════════════════════════════════════════════
    // STAGE 6 — Purchase Order: author + complete, same C_Order table, window 181.
    // ════════════════════════════════════════════════════════════════════
    console.log('\n═══ STAGE 6 — Purchase Order ═══\n');
    var uniqPoDoc = String(Date.now());   // pure-numeric, same validation rule
    try {
      await page.goto(deepUrl(port, { login: 'GardenAdmin', window: 181 }), { waitUntil: 'load' });
      await page.waitForSelector('#idmp-toolbar button[title^="New record"]', { timeout: 20000 });
      await clickToolbarBtn(page, 'New record');
      await page.waitForSelector('#idmp-inline-mount [data-col="c_bpartner_id"]', { timeout: 10000 });
      await fillField(page, 'documentno', uniqPoDoc);
      await fillField(page, 'c_bpartner_id', '120');   // Seed Farm Inc., real vendor (isvendor='Y')
      await fillField(page, 'dateordered', today);
      await fillField(page, 'grandtotal', '45.00');
      await fillField(page, 'm_pricelist_id', '101');
      await fillField(page, 'bill_bpartner_id', '120');
      await clickToolbarBtn(page, 'Save');
      var p6 = await waitForCrudPersist(w, 'c_order', 15000);
      log('§E2E-SAVE table=c_order(PO) committed=' + p6.committed + (p6.reason ? ' reason=' + p6.reason : ''));
      if (!p6.committed) throw new Error('PO header create did not persist: ' + p6.reason);

      await page.waitForTimeout(600);
      var found6 = await rowIdByText(page, uniqPoDoc);
      if (!found6) throw new Error('no grid row found for documentno ' + uniqPoDoc + ' after save');
      newPoId = found6.id;
      var whLine6 = w.lines.filter(function (l) { return /§AD-MODELVAL-LIVE table=c_order verb=create/.test(l); }).pop();
      log('§E2E-STATE new PO c_order_id(from grid row)=' + newPoId + ' modelval-derive-line=' + whLine6);

      await clickRowOpen(found6.handle, { timeout: 8000 });
      await page.waitForTimeout(400);
      await page.click('#idmp-tabstrip >> text=PO Line', { timeout: 8000 });
      var mdLine6 = await w.wait([/§IDEMPIERE-MD tab=PO Line/], 8000).catch(function () { return null; });
      log('§E2E-MD-CHECK ' + (mdLine6 ? mdLine6.line : 'no §IDEMPIERE-MD line captured'));
      if (!mdLine6 || mdLine6.line.indexOf('C_Order_ID=' + newPoId) < 0) throw new Error('PO Line tab locked onto the WRONG parent — expected C_Order_ID=' + newPoId + ', got: ' + (mdLine6 ? mdLine6.line : 'none'));
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
      var p6b = await waitForCrudPersist(w, 'c_orderline', 15000);
      log('§E2E-SAVE table=c_orderline(PO) committed=' + p6b.committed + (p6b.reason ? ' reason=' + p6b.reason : ''));
      if (!p6b.committed) throw new Error('PO line create did not persist: ' + p6b.reason);

      await page.click('#idmp-tabstrip >> text=Purchase Order', { timeout: 8000 }).catch(function () { return page.click('#idmp-tabstrip >> text=Order'); });
      await page.waitForTimeout(500);
      var found6b = await rowIdByText(page, uniqPoDoc);
      if (!found6b) throw new Error('PO row for ' + uniqPoDoc + ' not found on returning to the header tab');
      await clickRowOpen(found6b.handle, { timeout: 8000 });
      await page.waitForTimeout(500);
      var coBtnPo = page.locator('.idmp-docfsm button[data-doc-action="CO"]');
      var coVisiblePo = await coBtnPo.count();
      log('§E2E-DOCACTION PO available=[CO visible=' + coVisiblePo + ']');
      if (coVisiblePo) { await coBtnPo.first().click(); await w.wait([/§AD-DOCFSM-LIVE.*clicked=CO/], 8000).catch(function () {}); }
      var poChip = await page.locator('.idmp-docfsm .chip').first().textContent().catch(function () { return null; });
      log('§E2E-STATE PO c_order_id=' + newPoId + ' DocAction chip=' + poChip);
      var stage6Ok = !!(poChip && /·\s*CO\b/.test(poChip));
      verdict(stage6Ok, 'Stage6: PO reaches CO via the real DocAction bar', 'chip=' + poChip);
      cycleLine(6, 'PurchaseOrder', 'UI', stage6Ok ? 'PASS' : 'FAIL',
        stage6Ok ? ('PO ' + uniqPoDoc + ' (id=' + newPoId + ') authored+completed via real UI — ' + whLine6)
                  : ('PO created (id=' + newPoId + ') but DocAction CO did not land — chip=' + poChip + ' coButtonVisible=' + coVisiblePo));
    } catch (e) {
      log('🔴 Stage6 threw: ' + e.message);
      cycleLine(6, 'PurchaseOrder', 'UI', 'FAIL', 'exception: ' + e.message.replace(/\n/g, ' '));
    }

    // ════════════════════════════════════════════════════════════════════
    // STAGE 7 — Material Receipt (M_InOut, IsSOTrx=N), window 184. No Generate-process exists for this
    // (InOutGenerate is SO-only per the gate) — the ONLY route is manual authoring.
    // ════════════════════════════════════════════════════════════════════
    console.log('\n═══ STAGE 7 — Material Receipt ═══\n');
    var uniqRcptDoc = String(Date.now());   // pure-numeric, same validation rule
    try {
      await page.goto(deepUrl(port, { login: 'GardenAdmin', window: 184 }), { waitUntil: 'load' });
      await page.waitForSelector('#idmp-toolbar button[title^="New record"]', { timeout: 20000 });
      await clickToolbarBtn(page, 'New record');
      await page.waitForSelector('#idmp-inline-mount [data-col="documentno"]', { timeout: 10000 });
      var rcptFields = await page.$$eval('#idmp-inline-mount [data-col]', function (els) {
        return Array.from(new Set(els.map(function (e) { return e.getAttribute('data-col'); })));
      });
      log('§E2E-FORM m_inout header fields shown on New: ' + rcptFields.join(','));
      var hasWarehouse = rcptFields.indexOf('m_warehouse_id') >= 0, hasPartner = rcptFields.indexOf('c_bpartner_id') >= 0;
      verdict(hasWarehouse && hasPartner, 'Stage7: Material Receipt New form exposes warehouse + vendor (both mandatory on a real M_InOut)',
        'fields=' + rcptFields.join(',') + ' (m_warehouse_id present=' + hasWarehouse + ', c_bpartner_id present=' + hasPartner + ')');
      await fillField(page, 'documentno', uniqRcptDoc);
      await fillField(page, 'movementdate', today);
      await clickToolbarBtn(page, 'Save');
      var p7 = await waitForCrudPersist(w, 'm_inout', 15000);
      log('§E2E-SAVE table=m_inout committed=' + p7.committed + (p7.reason ? ' reason=' + p7.reason : ''));
      if (!p7.committed) throw new Error('m_inout header create did not persist: ' + p7.reason);
      await page.waitForTimeout(600);
      var found7 = await rowIdByText(page, uniqRcptDoc);
      if (!found7) throw new Error('no grid row found for documentno ' + uniqRcptDoc + ' after save');
      newRcptId = found7.id;
      log('§E2E-STATE new m_inout_id(from grid row)=' + newRcptId);

      var stage7Result = (!hasWarehouse || !hasPartner) ? 'ABSENT' : 'PASS';
      cycleLine(7, 'MaterialReceipt', 'UI', stage7Result,
        'M_InOut id=' + newRcptId + ' created but header New form omits ' +
        (!hasWarehouse ? 'M_Warehouse_ID ' : '') + (!hasPartner ? 'C_BPartner_ID ' : '') +
        '(fields shown: ' + rcptFields.join(',') + '); no InOutGenerate-equivalent process exists for PO receipts ' +
        '(inoutGenGate hard-requires IsSOTrx=\'Y\', confirmed by source read) so this manual path is the ONLY route to a Material Receipt at all');
    } catch (e) {
      log('🔴 Stage7 threw: ' + e.message);
      cycleLine(7, 'MaterialReceipt', 'UI', 'FAIL', 'exception: ' + e.message.replace(/\n/g, ' '));
    }

    // ════════════════════════════════════════════════════════════════════
    // STAGE 8 — Vendor invoice + three-way match. Predicted BLOCKED by source recon: c_invoice has no
    // "create" verb in crud_ops.json, and InvoiceGenerate is issotrx='Y'-only at both gate+UI layers.
    // ════════════════════════════════════════════════════════════════════
    console.log('\n═══ STAGE 8 — Vendor invoice + three-way match ═══\n');
    try {
      await page.goto(deepUrl(port, { login: 'GardenAdmin', window: 183 }), { waitUntil: 'load' });
      await page.waitForSelector('#idmp-toolbar button[title^="New record"]', { timeout: 20000 });
      await clickToolbarBtn(page, 'New record');
      var newAttempt = await w.wait([/§INPLACE-NEW table=c_invoice/], 6000).catch(function () { return null; });
      log('§E2E-NEW-ATTEMPT c_invoice: ' + (newAttempt ? newAttempt.line : 'no §INPLACE-NEW line captured'));
      var mountPresent = await page.$('#idmp-inline-mount [data-col]');
      verdict(!mountPresent, 'Stage8: manual "New" on Purchase Invoice window is refused (no inline-create form mounts)',
        newAttempt ? newAttempt.line : 'mountPresent=' + !!mountPresent);

      // Confirm the PO from Stage6 is NOT offered by Generate-Invoices (issotrx='Y'-only gate, source-verified).
      var poOfferedInGenInv = 'not-checked (no PO from Stage 6)';
      if (newPoId) {
        await page.goto(deepUrl(port, { login: 'GardenAdmin', process: 119 }), { waitUntil: 'load' });
        await page.waitForSelector('select[data-geninv-order]', { timeout: 15000 });
        var opts8 = await page.$$eval('select[data-geninv-order] option', function (os) { return os.map(function (o) { return o.value; }); });
        poOfferedInGenInv = opts8.indexOf(String(newPoId)) >= 0;
        log('§E2E-PICKER geninv (checking for PO ' + newPoId + '): offered=' + poOfferedInGenInv + ' options=' + JSON.stringify(opts8));
        verdict(poOfferedInGenInv === false, 'Stage8: the completed Purchase Order is NOT offered by Generate-Invoices (SO-only gate, confirmed live)', 'offered=' + poOfferedInGenInv);
      }

      var mpoCount = (await sql(page, 'SELECT COUNT(*) as n FROM m_matchpo'))[0].n;
      var mInvCount = (await sql(page, 'SELECT COUNT(*) as n FROM m_matchinv'))[0].n;
      log('§E2E-STATE m_matchpo count=' + mpoCount + ' m_matchinv count=' + mInvCount + ' (baseline, no vendor-invoice path exists to populate either)');

      var blocked = !mountPresent && poOfferedInGenInv !== true;
      cycleLine(8, 'VendorInvoiceThreeWayMatch', 'BLOCKED', 'ABSENT',
        'C_Invoice has no "create" verb (crud_ops.json, confirmed by §INPLACE-NEW ...skipped(create not permitted) live) so a vendor invoice ' +
        'can never be manually authored; Generate-Invoices (AD_Process 119) is gated IsSOTrx=\'Y\'-only at BOTH the UI picker SQL and the ' +
        'ad_process.js invoiceGenGate() so it never offers a Purchase Order either (confirmed: PO ' + newPoId + ' offered=' + poOfferedInGenInv + '); ' +
        'no M_MatchPO CREATE_LINE exists anywhere in erp_engine.js (source-verified) and the only M_MatchInv CREATE_LINE is inside completeInvoice() ' +
        'which is unreachable without a vendor invoice — the three-way match therefore has NO path to ever populate through this UI today ' +
        '(m_matchpo=' + mpoCount + ' m_matchinv=' + mInvCount + ')');
    } catch (e) {
      log('🔴 Stage8 threw: ' + e.message);
      cycleLine(8, 'VendorInvoiceThreeWayMatch', 'BLOCKED', 'ABSENT', 'exception during observation: ' + e.message.replace(/\n/g, ' '));
    }

  } catch (e) {
    harnessThrew = true;
    console.log('🔴 HARNESS THREW (outside per-stage try/catch): ' + e.message + '\n' + (e.stack || '').split('\n').slice(1, 8).join('\n'));
  } finally {
    await browser.close(); server.close();
  }

  console.log('\n═══ SUMMARY ═══\n');
  stageResults.forEach(function (s) {
    console.log('   Stage ' + s.n + ' (' + s.name + '): driven=' + s.driven + ' result=' + s.result);
  });
  var allEight = stageResults.length === 8;
  console.log('\n' + (harnessThrew
    ? '❌ HARNESS FAILURE — threw before completing all 8 stages\' bookkeeping (see 🔴 HARNESS THREW above). This is a harness defect, not a cycle finding.'
    : ('✅ DISCOVERY WITNESS RAN CORRECTLY — ' + stageResults.length + '/8 stages produced a real per-stage verdict (breaks are the expected/valid outcome; read the §CYCLE lines above, not this exit code, for the actual finding).')) + '\n');
  process.exit(harnessThrew ? 1 : 0);
})().catch(function (e) { console.log('🔴 THREW (top-level) ' + e.message + '\n' + (e.stack || '').split('\n').slice(1, 8).join('\n')); process.exit(1); });
