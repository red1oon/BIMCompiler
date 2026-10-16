#!/usr/bin/env node
// Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
// SPDX-License-Identifier: MIT
// ⚠ DO NOT REMOVE — prompts/AGENT_QUEUE.md §CALLOUT-CAMPAIGN (owns §ERP-SESSION-CLOSE-2 §C2.3 item 1,
// the E-1 campaign §IC.3 planned). THE CLAIM UNDER TEST (§CC.2), judged on the REAL forms:
//
//   A. On the Material Receipt LINE form, picking the PO line fires CalloutInOut.orderLine and FILLS
//      M_Product_ID / C_UOM_ID / MovementQty / QtyEntered — the fields witness_p2p_invoice_match still
//      types by hand — where MovementQty = QtyOrdered - QtyDelivered - SUM(running on THIS receipt)
//      (IDEMPIERE-1140). Then picking a product fires CalloutInOut.product and FILLS M_Locator_ID.
//   B. On the Payment form, picking an invoice fires CalloutPayment.invoice and FILLS C_BPartner_ID /
//      C_Currency_ID / PayAmt / DiscountAmt, with PayAmt = invoiceOpen - invoiceDiscount; typing a
//      PayAmt fires CalloutPayment.amounts and FILLS WriteOffAmt = Open - Pay - Discount - OverUnder.
//   C. Changing a document date fires CalloutEngine.dateAcct and FILLS DateAcct.
//   D. Dispatch on the nine O2C/P2P document tables moves 28 -> 51 of 78 bindings (36% -> 65%),
//      measured from ad_column.callout against the LIVE in-page registry.
//
// Every expected value is computed HERE by sqlite3 against ad_seed.db — the same rows the app reads —
// never a constant typed into the script. Two invoices are used on purpose: one with NO allocations
// (open == GrandTotal) and one FULLY allocated (open == 0). If the port ignored the allocation term
// both would read GrandTotal, so the pair is what makes the claim non-vacuous.
// A break is a real finding: read the log, do not infer PASS from the exit code.
// Run: WITNESS_ROOT=/home/red1/bim-ootb node scripts/witness_callout_campaign.js
'use strict';
var path = require('path'), http = require('http'), fs = require('fs'), cp = require('child_process');
var ROOT = process.env.WITNESS_ROOT || '/home/red1/bim-ootb';
var MIME = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.css': 'text/css',
  '.db': 'application/octet-stream', '.wasm': 'application/wasm' };
function reqPw() { try { return require('playwright'); } catch (e) { return require('/home/red1/bim-ootb/tests/node_modules/playwright'); } }
function log(m) { console.log('   ' + m); }

var claims = [];
function claim(ok, label, detail) { claims.push({ ok: !!ok, label: label }); console.log('   ' + (ok ? '🟢' : '🔴') + ' ' + label + (detail ? ' — ' + detail : '')); }

// ── the ORACLE: ad_seed.db answers, via sqlite3, never typed here ──────────────────────────────────
function q(sql) {
  var db = path.join(ROOT, 'erp', 'ad_seed.db');
  var out = cp.execFileSync('sqlite3', [db, sql], { encoding: 'utf8' }).trim();
  return out === '' ? null : out;
}
function num(x) { return x == null ? null : Number(x); }

// invoiceopen(), transcribed as ONE SQL statement (C_Invoice_Open.sql + the C_Invoice_v multipliers).
// GrandTotal x Multiplier - SUM((Amount+Discount+WriteOff) x MultiplierAP), rounded to the currency's
// StdPrecision. Same-currency allocations only in this seed, so currencyConvert() is the identity here
// (asserted below: every allocation on the invoices used carries the invoice's own currency).
function oracleInvoiceOpen(invId) {
  return num(q(
    "WITH i AS (SELECT i.*, d.docbasetype, " +
    "  CASE WHEN substr(d.docbasetype,3,1)='C' THEN -1 ELSE 1 END AS mcm, " +
    "  CASE WHEN substr(d.docbasetype,2,1)='P' THEN -1 ELSE 1 END AS map, " +
    "  (SELECT stdprecision FROM c_currency c WHERE c.c_currency_id=i.c_currency_id) AS prec " +
    " FROM c_invoice i JOIN c_doctype d ON d.c_doctype_id=i.c_doctype_id WHERE i.c_invoice_id=" + invId + ") " +
    "SELECT ROUND( (CASE WHEN upper(i.ispayschedulevalid)='Y' " +
    "   THEN (SELECT COALESCE(SUM(dueamt),0) FROM c_invoicepayschedule s WHERE s.c_invoice_id=i.c_invoice_id AND upper(s.isvalid)='Y') " +
    "   ELSE i.grandtotal END) * i.mcm " +
    " - COALESCE((SELECT SUM((al.amount+al.discountamt+al.writeoffamt)*i.map) FROM c_allocationline al " +
    "     JOIN c_allocationhdr a ON a.c_allocationhdr_id=al.c_allocationhdr_id " +
    "     WHERE al.c_invoice_id=i.c_invoice_id AND upper(a.isactive)='Y'),0), i.prec) FROM i;"));
}
// invoicediscount() + paymenttermdiscount(), transcribed. PayDate is the payment's DateTrx (today).
function oracleInvoiceDiscount(invId, payDate) {
  return num(q(
    "WITH i AS (SELECT i.*, ci.isdiscountlineamt, " +
    "  (SELECT stdprecision FROM c_currency c WHERE c.c_currency_id=i.c_currency_id) AS prec, " +
    "  (SELECT discount FROM c_paymentterm t WHERE t.c_paymentterm_id=i.c_paymentterm_id) AS d1, " +
    "  (SELECT discount2 FROM c_paymentterm t WHERE t.c_paymentterm_id=i.c_paymentterm_id) AS d2, " +
    "  (SELECT discountdays FROM c_paymentterm t WHERE t.c_paymentterm_id=i.c_paymentterm_id) AS dd1, " +
    "  (SELECT discountdays2 FROM c_paymentterm t WHERE t.c_paymentterm_id=i.c_paymentterm_id) AS dd2, " +
    "  (SELECT gracedays FROM c_paymentterm t WHERE t.c_paymentterm_id=i.c_paymentterm_id) AS gd " +
    " FROM c_invoice i LEFT JOIN ad_clientinfo ci ON ci.ad_client_id=i.ad_client_id WHERE i.c_invoice_id=" + invId + "), " +
    "amt AS (SELECT CASE WHEN upper(i.isdiscountlineamt)='Y' THEN " +
    "   (SELECT COALESCE(SUM(l.linenetamt),0) FROM c_invoiceline l LEFT JOIN c_charge c ON c.c_charge_id=l.c_charge_id " +
    "    WHERE l.c_invoice_id=i.c_invoice_id AND COALESCE(upper(c.isexcludedfromdiscount),'N')='N') " +
    "   ELSE i.grandtotal END AS a, i.* FROM i) " +
    "SELECT CASE WHEN a=0 THEN 0 WHEN date(dateinvoiced,'+'||COALESCE(dd1,0)||' day','+'||COALESCE(gd,0)||' day')>=date('" + payDate + "') " +
    "   THEN ROUND(a*COALESCE(d1,0)/100.0, prec) " +
    "  WHEN date(dateinvoiced,'+'||COALESCE(dd2,0)||' day','+'||COALESCE(gd,0)||' day')>=date('" + payDate + "') " +
    "   THEN ROUND(a*COALESCE(d2,0)/100.0, prec) ELSE 0 END FROM amt;"));
}

// ── the AD population, split by callout atom, for claim D ─────────────────────────────────────────
var NINE = "('c_order','c_orderline','c_invoice','c_invoiceline','m_inout','m_inoutline','c_payment','c_allocationhdr','c_allocationline')";
function bindingRows() {
  var out = q("SELECT lower(t.tablename)||'|'||lower(c.columnname)||'|'||c.callout FROM ad_column c " +
              "JOIN ad_table t ON t.ad_table_id=c.ad_table_id WHERE c.callout IS NOT NULL AND c.callout<>'' " +
              "AND lower(t.tablename) IN " + NINE + ";");
  return (out || '').split('\n').filter(Boolean).map(function (l) {
    var p = l.split('|');
    return { table: p[0], col: p[1], names: p[2].split(';').map(function (s) { return s.trim(); }).filter(Boolean) };
  });
}
function coverage(rows, registered) {
  var set = {}; registered.forEach(function (n) { set[n] = 1; });
  var bindings = 0, dispatched = 0, gap = {};
  rows.forEach(function (r) { r.names.forEach(function (n) { bindings++; if (set[n]) dispatched++; else gap[n] = (gap[n] || 0) + 1; }); });
  return { bindings: bindings, dispatched: dispatched, gap: gap };
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
  var harnessThrew = false, browser = null;

  // the fixtures, and WHY each one: RCPT is the only seeded receipt that already carries a line against
  // the order line we pick, so the IDEMPIERE-1140 running-qty term is not zero and cannot be faked.
  var RCPT_DOC = '10000003', RCPT_ID = 106, OL = 105, PROD_LOC = 148;
  var INV_OPEN = 106, INV_ALLOCATED = 101, TYPED_PAY = 1000;
  // PAY_DATE is chosen so BOTH weak claims become strong: it sits INSIDE invoice 106's payment-term
  // discount window (DateInvoiced 2003-01-22 + Discount Days 10 = 2003-02-01, term 106 = "2%10 Net 30"),
  // so invoicediscount() returns a NON-ZERO 2%; and it is not today, so DateAcct following it cannot be
  // confused with the create form's own "today" default. Both read 0/today on plain main.
  var PAY_DATE = '2003-01-25';

  try {
    // ── the oracle, printed BEFORE the run so a failure is readable without re-deriving anything ─────
    var ordered = num(q('SELECT qtyordered FROM c_orderline WHERE c_orderline_id=' + OL + ';'));
    var delivered = num(q('SELECT COALESCE(qtydelivered,0) FROM c_orderline WHERE c_orderline_id=' + OL + ';'));
    var entered = num(q('SELECT qtyentered FROM c_orderline WHERE c_orderline_id=' + OL + ';'));
    var running = num(q('SELECT SUM(movementqty) FROM m_inoutline WHERE m_inout_id=' + RCPT_ID + ' AND c_orderline_id=' + OL + ';'));
    var wantMv = ordered - delivered - (running == null ? 0 : running);
    var wantQe = (ordered !== 0 && entered !== ordered) ? (wantMv * entered / ordered) : wantMv;
    var wantProd = num(q('SELECT m_product_id FROM c_orderline WHERE c_orderline_id=' + OL + ';'));
    var wantUom = num(q('SELECT c_uom_id FROM c_orderline WHERE c_orderline_id=' + OL + ';'));
    var hdrWh = num(q('SELECT m_warehouse_id FROM m_inout WHERE m_inout_id=' + RCPT_ID + ';'));
    var prodLoc = num(q('SELECT m_locator_id FROM m_product WHERE m_product_id=' + PROD_LOC + ';'));
    var prodLocWh = num(q('SELECT m_warehouse_id FROM m_locator WHERE m_locator_id=' + prodLoc + ';'));
    var wantLoc = (prodLocWh === hdrWh) ? prodLoc : null;
    var prodUom = num(q('SELECT c_uom_id FROM m_product WHERE m_product_id=' + PROD_LOC + ';'));
    console.log('§CC-ORACLE-A orderLine=' + OL + ' ordered=' + ordered + ' delivered=' + delivered +
      ' runningOnReceipt' + RCPT_ID + '=' + running + ' -> MovementQty=' + wantMv + ' QtyEntered=' + wantQe +
      ' product=' + wantProd + ' uom=' + wantUom);
    console.log('§CC-ORACLE-A2 product=' + PROD_LOC + ' uom=' + prodUom + ' defaultLocator=' + prodLoc +
      ' locatorWarehouse=' + prodLocWh + ' receiptWarehouse=' + hdrWh + ' -> M_Locator_ID=' + wantLoc);

    var today = PAY_DATE;
    var openA = oracleInvoiceOpen(INV_OPEN), discA = oracleInvoiceDiscount(INV_OPEN, today);
    var openB = oracleInvoiceOpen(INV_ALLOCATED), discB = oracleInvoiceDiscount(INV_ALLOCATED, today);
    var gtA = num(q('SELECT grandtotal FROM c_invoice WHERE c_invoice_id=' + INV_OPEN + ';'));
    var gtB = num(q('SELECT grandtotal FROM c_invoice WHERE c_invoice_id=' + INV_ALLOCATED + ';'));
    var bpA = num(q('SELECT c_bpartner_id FROM c_invoice WHERE c_invoice_id=' + INV_OPEN + ';'));
    var curA = num(q('SELECT c_currency_id FROM c_invoice WHERE c_invoice_id=' + INV_OPEN + ';'));
    var wantPayA = Math.round((openA - discA) * 100) / 100;
    // C_Payment.IsOverUnderPayment carries AD DefaultValue 'Y' (read from ad_column, not assumed), so a NEW
    // payment starts with over/under ON and CalloutPayment.amounts takes its :532-543 branch, not :544-550.
    // OverUnderAmt = Open - Pay - Discount - WriteOff; and because that is > 0 the Java CANCELS the discount
    // first ("no discount because is not paid in full", :537-541) and recomputes — so DiscountAmt must go 0.
    var overDefault = q("SELECT defaultvalue FROM ad_column c JOIN ad_table t ON t.ad_table_id=c.ad_table_id " +
                        "WHERE lower(t.tablename)='c_payment' AND lower(c.columnname)='isoverunderpayment';");
    var wantOver = Math.round((openA - TYPED_PAY - 0 - 0) * 100) / 100;
    // then UNCHECKING it takes the :551-568 branch: WriteOffAmt = Open - Pay - Discount, OverUnderAmt = 0.
    var wantWoff = Math.round((openA - TYPED_PAY - 0) * 100) / 100;
    console.log('§CC-ORACLE-B invoice=' + INV_OPEN + ' grandTotal=' + gtA + ' allocations=none open=' + openA +
      ' discount=' + discA + ' -> PayAmt=' + wantPayA + ' | bpartner=' + bpA + ' currency=' + curA);
    console.log('§CC-ORACLE-B2 invoice=' + INV_ALLOCATED + ' grandTotal=' + gtB + ' FULLY allocated -> open=' + openB +
      ' (the pair proves the allocation term: ' + gtB + ' -> ' + openB + ')');
    console.log('§CC-ORACLE-B3 IsOverUnderPayment AD default=' + overDefault + ' | typed PayAmt=' + TYPED_PAY +
      ' -> OverUnderAmt=' + wantOver + ' and DiscountAmt cancelled to 0 (:537-541); then unchecked -> WriteOffAmt=' + wantWoff);

    browser = await reqPw().chromium.launch();
    var page = await browser.newPage();
    var logs = [], errs = [];
    page.on('console', function (m) { var t = m.text(); logs.push(t); if (/^§CRUD-CALLOUT/.test(t)) log(t); });
    page.on('pageerror', function (e) { errs.push(String(e).slice(0, 200)); });

    function lastCallout(table, col) {
      return logs.filter(function (l) { return l.indexOf('§CRUD-CALLOUT table=' + table + ' col=' + col + ' ') === 0; }).pop() ||
             '(no §CRUD-CALLOUT line for ' + table + '.' + col + ')';
    }
    function val(col) {
      return page.$eval('#idmp-inline-mount [data-col="' + col + '"]', function (e) { return e.value; }).catch(function () { return '(absent)'; });
    }
    // a change event is what the create form listens on, and fill() alone only fires `input` — blur is the
    // real user path (the instrument fault witness_inout_callout_atoms records; not repaid here).
    async function setField(col, value) {
      var sel = '#idmp-inline-mount input[data-col="' + col + '"], #idmp-inline-mount select[data-col="' + col + '"]';
      var el = await page.$(sel);
      if (!el) return 'absent';
      var tag = await el.evaluate(function (e) { return e.tagName; });
      if (tag === 'SELECT') { await page.selectOption(sel, String(value)); return tag; }
      await page.fill(sel, String(value));
      await el.evaluate(function (e) { e.blur(); });
      return tag + '+blur';
    }
    async function clickToolbar(prefix) {
      var b = await page.$('#idmp-toolbar button[title^="' + prefix + '"]');
      if (!b) return false; await b.click(); return true;
    }
    async function rowByText(text) {
      var rows = await page.$$('tr[data-ad-record]');
      for (var i = 0; i < rows.length; i++) { var t = await rows[i].textContent(); if (t && t.indexOf(text) >= 0) return rows[i]; }
      return null;
    }
    async function openRow(row) {
      var st = await row.$('td[data-ad-col="DocStatus"]'); if (st) { await st.click(); return; }
      var cb = await row.$('td.idmp-cbcol'); if (cb) { await cb.click({ position: { x: 2, y: 2 } }); return; }
      await row.click();
    }

    // ══ A — the receipt LINE: the four fields the P2P witness still types ══════════════════════════
    console.log('\n═══ A — CalloutInOut.orderLine / .product on the real Material Receipt Line form ═══\n');
    await page.goto('http://localhost:' + port + '/erp/idempiere.html?login=GardenAdmin&window=184', { waitUntil: 'load' });
    await page.waitForSelector('#idmp-toolbar button[title^="New record"]', { timeout: 25000 });
    var rcptRow = await rowByText(RCPT_DOC);
    if (!rcptRow) throw new Error('no grid row for receipt ' + RCPT_DOC);
    await openRow(rcptRow);
    await page.waitForTimeout(500);
    await page.click('#idmp-tabstrip >> text=Receipt Line', { timeout: 8000 });
    await page.waitForTimeout(400);
    await clickToolbar('New record');
    await page.waitForSelector('#idmp-inline-mount [data-col="c_orderline_id"]', { timeout: 12000 });

    var howA = await setField('c_orderline_id', OL);
    log('§CC-A widget(c_orderline_id)=' + howA);
    await page.waitForTimeout(800);
    var lineA = lastCallout('m_inoutline', 'c_orderline_id');
    var gotProd = await val('m_product_id'), gotUom = await val('c_uom_id'),
        gotMv = await val('movementqty'), gotQe = await val('qtyentered');
    console.log('§CC-A product="' + gotProd + '" uom="' + gotUom + '" movementqty="' + gotMv + '" qtyentered="' + gotQe + '"');
    claim(/fired=\[[^\]]*CalloutInOut\.orderLine/.test(lineA), 'A1: CalloutInOut.orderLine is FIRED, not absent', lineA);
    claim(Number(gotProd) === wantProd, 'A2: M_Product_ID filled from the PO line', 'form="' + gotProd + '" oracle=' + wantProd);
    claim(Number(gotUom) === wantUom, 'A3: C_UOM_ID filled from the PO line', 'form="' + gotUom + '" oracle=' + wantUom);
    claim(gotMv !== '' && Number(gotMv) === wantMv,
      'A4: MovementQty = QtyOrdered - QtyDelivered - running-on-this-receipt (IDEMPIERE-1140)',
      'form="' + gotMv + '" oracle=' + wantMv + ' (' + ordered + ' - ' + delivered + ' - ' + running + ')');
    claim(gotQe !== '' && Number(gotQe) === wantQe, 'A5: QtyEntered follows MovementQty, pro-rated by the line ratio', 'form="' + gotQe + '" oracle=' + wantQe);
    claim(running != null && running !== 0, 'A6: the running-qty term is NON-ZERO on this fixture (the claim is not vacuous)', 'running=' + running);

    var howA2 = await setField('m_product_id', PROD_LOC);
    log('§CC-A2 widget(m_product_id)=' + howA2);
    await page.waitForTimeout(800);
    var lineA2 = lastCallout('m_inoutline', 'm_product_id');
    var gotLoc = await val('m_locator_id'), gotUom2 = await val('c_uom_id');
    console.log('§CC-A2 locator="' + gotLoc + '" uom="' + gotUom2 + '"');
    claim(/fired=\[[^\]]*CalloutInOut\.product/.test(lineA2), 'A7: CalloutInOut.product is FIRED, not absent', lineA2);
    claim(wantLoc != null && Number(gotLoc) === wantLoc,
      'A8: M_Locator_ID filled from the product default, warehouse-matched', 'form="' + gotLoc + '" oracle=' + wantLoc);
    claim(Number(gotUom2) === prodUom, 'A9: C_UOM_ID re-derived from the product', 'form="' + gotUom2 + '" oracle=' + prodUom);

    // ══ B — the Payment screen ════════════════════════════════════════════════════════════════════
    console.log('\n═══ B — CalloutPayment.invoice / .amounts on the real Payment form ═══\n');
    await page.goto('http://localhost:' + port + '/erp/idempiere.html?login=GardenAdmin&window=195', { waitUntil: 'load' });
    await page.waitForSelector('#idmp-toolbar button[title^="New record"]', { timeout: 25000 });
    await clickToolbar('New record');
    await page.waitForSelector('#idmp-inline-mount [data-col="payamt"]', { timeout: 12000 });

    // C — the date first: DateAcct must FOLLOW DateTrx, on the same form
    var howC = await setField('datetrx', PAY_DATE);
    log('§CC-C widget(datetrx)=' + howC);
    await page.waitForTimeout(600);
    var lineC = lastCallout('c_payment', 'datetrx');
    var gotAcct = await val('dateacct');
    var realToday = new Date().toISOString().slice(0, 10);
    console.log('§CC-C datetrx="' + PAY_DATE + '" dateacct="' + gotAcct + '" (today is ' + realToday + ', so this is a real change, not the form default)');
    claim(/fired=\[[^\]]*CalloutEngine\.dateAcct/.test(lineC), 'C1: CalloutEngine.dateAcct is FIRED, not absent', lineC);
    claim(String(gotAcct).slice(0, 10) === PAY_DATE, 'C2: DateAcct FOLLOWS the document date', 'form="' + gotAcct + '" expected=' + PAY_DATE);
    claim(PAY_DATE !== realToday, 'C3: the asserted date is NOT today, so C2 cannot pass on the form default', 'payDate=' + PAY_DATE + ' today=' + realToday);

    var howB = await setField('c_invoice_id', INV_OPEN);
    log('§CC-B widget(c_invoice_id)=' + howB);
    await page.waitForTimeout(800);
    var lineB = lastCallout('c_payment', 'c_invoice_id');
    var gotBp = await val('c_bpartner_id'), gotCur = await val('c_currency_id'),
        gotPay = await val('payamt'), gotDisc = await val('discountamt');
    console.log('§CC-B bpartner="' + gotBp + '" currency="' + gotCur + '" payamt="' + gotPay + '" discountamt="' + gotDisc + '"');
    claim(/fired=\[[^\]]*CalloutPayment\.invoice/.test(lineB), 'B1: CalloutPayment.invoice is FIRED, not absent', lineB);
    claim(Number(gotBp) === bpA, 'B2: C_BPartner_ID filled from the invoice', 'form="' + gotBp + '" oracle=' + bpA);
    claim(Number(gotCur) === curA, 'B3: C_Currency_ID filled from the invoice', 'form="' + gotCur + '" oracle=' + curA);
    claim(gotPay !== '' && Number(gotPay) === wantPayA,
      'B4: PayAmt = invoiceOpen - invoiceDiscount, both ported from the PL/pgSQL', 'form="' + gotPay + '" oracle=' + wantPayA);
    claim(Number(gotDisc || 0) === discA, 'B5: DiscountAmt = invoicediscount() at this DateTrx', 'form="' + gotDisc + '" oracle=' + discA);
    claim(discA !== 0, 'B5b: the oracle discount is NON-ZERO here, so B4/B5 are not vacuous', 'discount=' + discA + ' (2% of the line-net, inside the term window)');

    var overNow = await page.$eval('#idmp-inline-mount [data-col="isoverunderpayment"]', function (e) { return e.checked ? 'Y' : 'N'; }).catch(function () { return '(absent)'; });
    var howB2 = await setField('payamt', TYPED_PAY);
    log('§CC-B2 widget(payamt)=' + howB2 + ' IsOverUnderPayment(form)=' + overNow);
    await page.waitForTimeout(800);
    var lineB2 = lastCallout('c_payment', 'payamt');
    var gotOver = await val('overunderamt'), gotDisc2 = await val('discountamt');
    console.log('§CC-B2 payamt=' + TYPED_PAY + ' overunderamt="' + gotOver + '" discountamt="' + gotDisc2 + '"');
    claim(/fired=\[[^\]]*CalloutPayment\.amounts/.test(lineB2), 'B6: CalloutPayment.amounts is FIRED, not absent', lineB2);
    claim(overNow === 'Y' && String(overDefault).toUpperCase() === 'Y',
      'B6b: the form carries the AD DefaultValue for IsOverUnderPayment, so the branch under test is the real one',
      'form=' + overNow + ' ad_column.defaultvalue=' + overDefault);
    claim(gotOver !== '' && Number(gotOver) === wantOver,
      'B7: OverUnderAmt = Open - PayAmt - Discount - WriteOff (:532-543)', 'form="' + gotOver + '" oracle=' + wantOver);
    claim(Number(gotDisc2 || 0) === 0 && discA !== 0,
      'B7b: the discount is CANCELLED because the invoice is not paid in full (:537-541)', 'discountBefore=' + discA + ' discountAfter="' + gotDisc2 + '"');

    // the OTHER branch of the same tree: unchecking over/under moves the residue to WriteOffAmt (:551-568)
    await page.uncheck('#idmp-inline-mount input[data-col="isoverunderpayment"]').catch(function () {});
    await page.$eval('#idmp-inline-mount input[data-col="isoverunderpayment"]', function (e) { e.dispatchEvent(new Event('change', { bubbles: true })); }).catch(function () {});
    await page.waitForTimeout(800);
    var lineB2b = lastCallout('c_payment', 'isoverunderpayment');
    var gotWoff = await val('writeoffamt'), gotOver2 = await val('overunderamt');
    console.log('§CC-B2b isoverunderpayment=N writeoffamt="' + gotWoff + '" overunderamt="' + gotOver2 + '"');
    claim(gotWoff !== '' && Number(gotWoff) === wantWoff,
      'B7c: unchecking over/under moves the residue to WriteOffAmt (:551-568)', 'form="' + gotWoff + '" oracle=' + wantWoff);
    claim(Number(gotOver2 || 0) === 0, 'B7d: and OverUnderAmt is zeroed by the same branch', 'form="' + gotOver2 + '"');

    // the SECOND invoice — fully allocated. If the port ignored the allocation term this would read
    // GrandTotal, exactly like the first one did. That difference is the whole point of the pair.
    var howB3 = await setField('c_invoice_id', INV_ALLOCATED);
    log('§CC-B3 widget(c_invoice_id)=' + howB3);
    await page.waitForTimeout(800);
    var gotPay2 = await val('payamt');
    console.log('§CC-B3 invoice=' + INV_ALLOCATED + ' grandTotal=' + gtB + ' payamt="' + gotPay2 + '"');
    claim(Number(gotPay2) === Math.round((openB - discB) * 100) / 100,
      'B8: a FULLY ALLOCATED invoice pays its OPEN amount, not its GrandTotal',
      'form="' + gotPay2 + '" open=' + openB + ' grandTotal=' + gtB);
    claim(openB !== gtB, 'B9: the two differ on this fixture, so B8 is not vacuous', 'open=' + openB + ' grandTotal=' + gtB);

    // ══ D — coverage, measured from the LIVE registry against the AD population ════════════════════
    console.log('\n═══ D — dispatch coverage on the nine document tables ═══\n');
    var registered = await page.evaluate(function () {
      return (window.AdCallout && window.AdCallout.registeredNames) ? window.AdCallout.registeredNames() : [];
    });
    var cov = coverage(bindingRows(), registered);
    var pct = Math.round(100 * cov.dispatched / cov.bindings);
    console.log('§CC-COVERAGE registeredHandlers=' + registered.length + ' bindings=' + cov.bindings +
      ' dispatched=' + cov.dispatched + ' (' + pct + '%) gapBindings=' + (cov.bindings - cov.dispatched));
    console.log('§CC-COVERAGE-GAP ' + Object.keys(cov.gap).sort(function (a, b) { return cov.gap[b] - cov.gap[a]; })
      .map(function (n) { return cov.gap[n] + 'x' + n.replace(/^org\.\w+\.model\./, ''); }).join(' · '));
    claim(cov.bindings === 78, 'D1: the AD population on the nine tables is unchanged (78 bindings)', 'bindings=' + cov.bindings);
    claim(cov.dispatched === 51, 'D2: 51 of 78 bindings dispatch (was 28 = 36%; now ' + pct + '%)', 'dispatched=' + cov.dispatched);

    claim(errs.length === 0, 'E1: 0 pageerrors across both forms', errs.join(' | '));
    await page.close();
  } catch (e) {
    harnessThrew = true;
    console.log('🔴 HARNESS THREW: ' + (e && e.message));
  } finally {
    if (browser) await browser.close();
    server.close();
  }

  console.log('\n═══ SUMMARY ═══\n');
  var pass = claims.filter(function (c) { return c.ok; }).length, fail = claims.length - pass;
  claims.forEach(function (c) { console.log('  ' + (c.ok ? 'PASS' : 'FAIL') + ' ' + c.label); });
  if (!claims.length) console.log('\n🔴 W-CALLOUT-CAMPAIGN INCONCLUSIVE — no claim was judged (a 0 here means nothing)');
  else if (harnessThrew) console.log('\n🔴 W-CALLOUT-CAMPAIGN INCONCLUSIVE — the harness threw before every claim was judged (' + pass + ' PASS / ' + fail + ' FAIL of ' + claims.length + ' reached)');
  else if (fail === 0) console.log('\n🟢 W-CALLOUT-CAMPAIGN PASS — ' + pass + ' PASS / 0 FAIL');
  else console.log('\n🔴 W-CALLOUT-CAMPAIGN FAIL — ' + pass + ' PASS / ' + fail + ' FAIL');
  console.log('\nHarness completed to the end: ' + (!harnessThrew) + ' (exit code reflects HARNESS health only — read the claims above)');
  process.exit(harnessThrew ? 1 : 0);
})();
