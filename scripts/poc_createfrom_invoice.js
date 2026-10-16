#!/usr/bin/env node
// Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
// SPDX-License-Identifier: MIT
// ⚠ DO NOT REMOVE — Scope guard
// W-CREATEFROM-INVOICE — prompts/ERP_P2P_INVOICE_MATCH.md §Fix 2026-09-04 (§Fix5.4). Prove the
//   CreateFromInvoice port (AD_Process 200143, org.compiere.process.CreateFromInvoice) creates
//   C_InvoiceLine rows carrying M_InOutLine_ID — the ONE thing that was missing for M_MatchInv, since
//   erp_engine.completeInvoice already emits a match per line that has one. Drives the REAL
//   build/erp/ad_process.js + build/erp/erp_engine.js. Fixtures are REAL ROWS read from
//   build/erp/glassbowl_data.db (purchase receipt M_InOut 105, issotrx='N', DocStatus CO, 10 lines all
//   linked to real C_OrderLines) — no authored qtys, no authored prices, nothing invented.
//   READ build/erp/poc_createfrom_invoice.log before any conclusion; exit code is NOT evidence.
// Run: bash build/erp/run_witness.sh scripts/poc_createfrom_invoice.js
'use strict';
var path = require('path');
var Database = require('better-sqlite3');
var AP = require(path.join(__dirname, '..', 'build', 'erp', 'ad_process.js'));
var E  = require(path.join(__dirname, '..', 'build', 'erp', 'erp_engine.js'));
var GB = path.join(__dirname, '..', 'build', 'erp', 'glassbowl_data.db');
var AD = path.join(process.env.HOME, 'bim-ootb', 'erp', 'ad_seed.db');   // the SHIPPED seed the app loads

var fails = 0, checks = 0;
function verdict(ok, label, detail) { checks++; if (!ok) fails++; console.log('   ' + (ok ? '🟢' : '🔴') + ' ' + label + (detail ? ' — ' + detail : '')); }

(function () {
  var gb = new Database(GB, { readonly: true });
  var q = function (s, p) { return gb.prepare(s).all(p || []); };

  console.log('═══ W-CREATEFROM-INVOICE — the P2P line-maker (AD_Process 200143) over the REAL handler ═══');

  // ── §0 the AD row this handler claims to implement, read from the seed (never assumed) ──
  var adOk = false, adRow = null, adPara = null;
  try {
    var ad = new Database(AD, { readonly: true });
    adRow  = lc(ad.prepare('SELECT * FROM ad_process WHERE ad_process_id=200143').all()[0] || {});
    adPara = ad.prepare('SELECT * FROM ad_process_para WHERE ad_process_id=200143').all().map(lc);
    ad.close();
    adOk = !!(adRow && adRow.classname === 'org.compiere.process.CreateFromInvoice' && adRow.isreport === 'N' &&
              adPara.length === 1 && adPara[0].columnname === 'C_Invoice_ID' && adPara[0].ismandatory === 'Y');
  } catch (e) { adRow = null; }
  console.log('§CREATEFROM-AD proc=' + (adRow && adRow.ad_process_id ? adRow.ad_process_id + ' value=' + adRow.value + ' classname=' + adRow.classname + ' isreport=' + adRow.isreport : 'NOT FOUND') +
              ' para=' + JSON.stringify((adPara || []).map(function (p2) { return p2.columnname + '(' + p2.ismandatory + ')'; })));
  verdict(adOk, 'the AD row exists and is what the handler registers against (200143 / CreateFromInvoice / mandatory C_Invoice_ID)',
          (adRow && adRow.classname) ? 'classname=' + adRow.classname : 'missing');

  // ── FIXTURES — real rows, read not written ──
  var RECEIPT = 105;                                    // M_InOut 105: issotrx='N', DocStatus CO, C_Order 105
  var receipt = q('SELECT * FROM m_inout WHERE m_inout_id=?', [RECEIPT])[0];
  var sLines  = q('SELECT * FROM m_inoutline WHERE m_inout_id=? ORDER BY line', [RECEIPT]);
  var oLineBy = {};
  q('SELECT * FROM c_orderline').forEach(function (r) { var o = lc(r); oLineBy[String(o.c_orderline_id)] = o; });
  function lc(r) { var o = {}; Object.keys(r).forEach(function (k) { o[k.toLowerCase()] = r[k]; }); return o; }
  receipt = lc(receipt); sLines = sLines.map(lc);
  // The invoice header is the REAL c_invoice 105 row (issotrx='N', same C_BPartner 120 as the receipt) put
  // back into the state a user's freshly created vendor invoice is in: DocStatus DR / Processed N. Nothing
  // else about it is changed, and no field of it is invented.
  var invoice = lc(q('SELECT * FROM c_invoice WHERE c_invoice_id=105')[0]);
  invoice.docstatus = 'DR'; invoice.processed = 'N';
  console.log('§CREATEFROM-FIXTURE receipt=' + RECEIPT + ' issotrx=' + receipt.issotrx + ' docstatus=' + receipt.docstatus +
              ' lines=' + sLines.length + ' allLinked=' + sLines.every(function (l) { return !!l.c_orderline_id; }) +
              ' invoice=' + invoice.c_invoice_id + ' issotrx=' + invoice.issotrx + ' docstatus=' + invoice.docstatus +
              ' bpartnerMatch=' + (String(invoice.c_bpartner_id) === String(receipt.c_bpartner_id)));

  // ── wire the handler exactly as the app would ──
  AP.registerCreateFromInvoice(E);
  verdict(AP.hasHandler('org.compiere.process.CreateFromInvoice'), 'handler registered under the real classname', 'registered=' + AP.hasHandler('org.compiere.process.CreateFromInvoice'));
  var H = AP.REGISTRY['org.compiere.process.CreateFromInvoice'].fn;
  function ctxFor(inv, lines) {
    return { fetchInvoice: function () { return inv; },
             fetchReceiptLines: function () { return lines; },
             fetchOrderLine: function (id) { return oLineBy[String(id)] || null; },
             fetchProduct: function () { return null; } };
  }

  // ── ARM 1 · LINES CREATED ──
  console.log('\n── ARM 1 · LINES CREATED ──');
  var res = H(ctxFor(invoice, sLines), { Record_ID: invoice.c_invoice_id, params: { C_Invoice_ID: invoice.c_invoice_id } });
  var ops = (res.result && res.result.ops) || [];
  verdict(res.ok === true && ops.length === sLines.length, sLines.length + ' selected receipt lines → ' + sLines.length + ' C_InvoiceLine CREATE_LINE ops',
          'ok=' + res.ok + ' rows=' + res.rows + ' ops=' + ops.length + ' msg=' + res.message);
  verdict(ops.every(function (o) { return o.op_type === 'CREATE_LINE' && o.table === 'C_InvoiceLine' && String(o.c_invoice_id) === String(invoice.c_invoice_id); }),
          'every op is a C_InvoiceLine CREATE_LINE bound to the target invoice', 'c_invoice_id=' + invoice.c_invoice_id);
  verdict(ops.length > 0 && ops.every(function (o) { return o.m_inoutline_id != null; }),
          'EVERY created line carries M_InOutLine_ID — the column AD_Field locks and only this process sets',
          'withInOutLine=' + ops.filter(function (o) { return o.m_inoutline_id != null; }).length + '/' + ops.length);

  // ── ARM 2 · SHIPLINE COPY IS EXACT (field-by-field, not spot-checked) ──
  console.log('\n── ARM 2 · setShipLine COPY IS EXACT ──');
  var COPIED = ['m_inoutline_id', 'c_orderline_id', 'line', 'isdescription', 'description', 'm_product_id', 'c_uom_id', 'm_attributesetinstance_id'];
  var mismatch = [];
  ops.forEach(function (o, i) {
    var src = sLines[i];
    COPIED.forEach(function (c) {
      var a = o[c] == null ? null : o[c], b = src[c] == null ? null : src[c];
      if (String(a) !== String(b)) mismatch.push(src.m_inoutline_id + '.' + c + ' op=' + a + ' src=' + b);
    });
    if (String(o.qtyentered) !== String(src.qtyentered) || String(o.qtyinvoiced) !== String(src.qtyentered))
      mismatch.push(src.m_inoutline_id + '.qty op=' + o.qtyentered + '/' + o.qtyinvoiced + ' src=' + src.qtyentered);
  });
  console.log('§CREATEFROM-COPY fields=' + COPIED.join(',') + ' +qtyentered/qtyinvoiced  rows=' + ops.length + ' mismatches=' + mismatch.length +
              (mismatch.length ? ' ' + JSON.stringify(mismatch.slice(0, 6)) : ''));
  verdict(ops.length > 0 && mismatch.length === 0, 'every setShipLine-copied column equals its source receipt-line value, all ' + ops.length + ' rows',
          'mismatches=' + mismatch.length);

  // ── ARM 3 · PRICE FROM THE ORDER LINE ──
  console.log('\n── ARM 3 · PRICE BLOCK FROM THE LINKED C_OrderLine ──');
  var PRICE = ['priceactual', 'pricelimit', 'pricelist', 'c_tax_id', 'linenetamt'];
  var pBad = [], pEnteredBad = [];
  ops.forEach(function (o, i) {
    var ol = oLineBy[String(sLines[i].c_orderline_id)];
    if (!ol) { pBad.push(sLines[i].m_inoutline_id + '.no-orderline'); return; }
    PRICE.forEach(function (c) { if (String(o[c]) !== String(ol[c])) pBad.push(sLines[i].m_inoutline_id + '.' + c + ' op=' + o[c] + ' ol=' + ol[c]); });
    // sameOrderLineUOM ⇒ PriceEntered = oLine.PriceEntered, else oLine.PriceActual
    var same = AP.sameOrderLineUOM(sLines[i], ol);
    var want = same ? ol.priceentered : ol.priceactual;
    if (String(o.priceentered) !== String(want)) pEnteredBad.push(sLines[i].m_inoutline_id + ' same=' + same + ' op=' + o.priceentered + ' want=' + want);
  });
  console.log('§CREATEFROM-PRICE cols=' + PRICE.join(',') + ' rows=' + ops.length + ' mismatches=' + pBad.length +
              ' priceEnteredBranchMismatches=' + pEnteredBad.length + (pBad.length ? ' ' + JSON.stringify(pBad.slice(0, 4)) : ''));
  verdict(ops.length > 0 && pBad.length === 0, 'price/tax/net columns equal the linked C_OrderLine\'s own values', 'mismatches=' + pBad.length);
  verdict(pEnteredBad.length === 0, 'PriceEntered follows the sameOrderLineUOM branch (entered when same UOM, actual when not)', 'mismatches=' + pEnteredBad.length);

  // ── ARM 4 · THE CHAIN CLOSES — this is the arm that was measured at matchInvOps=0 ──
  console.log('\n── ARM 4 · completeInvoice NOW EMITS M_MatchInv (the lane measured 0) ──');
  // c_invoiceline_id is assigned at commit; the app's sidecar convention for a not-yet-committed row is a
  // negative index-derived id (the lane's own log shows `invoice=-8`). Assigned here the same way, so the
  // ids are deterministic and no value is invented.
  var invLines = ops.map(function (o, i) { var l = {}; Object.keys(o).forEach(function (k) { l[k] = o[k]; }); l.c_invoiceline_id = -(i + 1); return l; });
  var cops = E.completeInvoice(invoice, invLines, null);
  var matches = cops.filter(function (o) { return o.op_type === 'CREATE_LINE' && o.table === 'M_MatchInv'; });
  var linkBad = matches.filter(function (m, i) { return String(m.m_inoutline_id) !== String(sLines[i].m_inoutline_id) || String(m.qty) !== String(sLines[i].qtyentered); });
  console.log('§INVOICE-FANOUT invoice=' + invoice.c_invoice_id + ' issotrx=' + invoice.issotrx + ' lines=' + invLines.length +
              ' matchInvOps=' + matches.length + ' linkMismatches=' + linkBad.length);
  verdict(matches.length === sLines.length, 'completeInvoice emits one M_MatchInv per created line (was 0 before this fix)',
          'matchInvOps=' + matches.length + ' expected=' + sLines.length);
  verdict(matches.length > 0 && linkBad.length === 0, 'each M_MatchInv points at the right M_InOutLine_ID at the right qty', 'mismatches=' + linkBad.length);

  // ── ARM 5 · GATES REFUSE (a handler that cannot refuse is not a gate) ──
  console.log('\n── ARM 5 · GATES REFUSE ──');
  var g1 = H(ctxFor(null, sLines), {});
  var coInv = {}; Object.keys(invoice).forEach(function (k) { coInv[k] = invoice[k]; }); coInv.docstatus = 'CO'; coInv.processed = 'Y';
  var g2 = H(ctxFor(coInv, sLines), {});
  var g3 = H(ctxFor(invoice, []), {});
  console.log('§CREATEFROM-GATES noInvoice=' + JSON.stringify(g1.message) + ' completed=' + JSON.stringify(g2.message) + ' emptySelection=' + JSON.stringify(g3.message));
  verdict(g1.ok === false && /NotFound/.test(g1.message) && (g1.result.ops || []).length === 0, 'no invoice → @NotFound@ @C_Invoice_ID@, zero ops (the Java\'s own message)', g1.message);
  verdict(g2.ok === false && (g2.result.ops || []).length === 0, 'completed invoice → refused, zero ops (CreateFrom is reachable only on DR/IP)', g2.message);
  verdict(g3.ok === false && /NotSupported/.test(g3.message) && (g3.result.ops || []).length === 0, 'empty selection → @NotSupported@, zero ops (the Info-Window precondition)', g3.message);

  // ── ARM 6 · DEFERRALS ARE DECLARED, never silently dropped ──
  console.log('\n── ARM 6 · DEFERRALS DECLARED ──');
  var noOl = sLines.slice(0, 1).map(function (l) { var c = {}; Object.keys(l).forEach(function (k) { c[k] = l[k]; }); c.c_orderline_id = null; return c; });
  var rma  = sLines.slice(0, 1).map(function (l) { var c = {}; Object.keys(l).forEach(function (k) { c[k] = l[k]; }); c.c_orderline_id = null; c.m_rmaline_id = 9001; return c; });
  var d1 = H(ctxFor(invoice, noOl), {}), d2 = H(ctxFor(invoice, rma), {});
  console.log('§CREATEFROM-DEFERRED noOrderLine=' + JSON.stringify(d1.result.deferred) + ' rmaLine=' + JSON.stringify(d2.result.deferred));
  verdict(d1.ok && d1.result.deferred.some(function (x) { return /no-order-line/.test(x); }), 'a line with no C_OrderLine declares the price-list deferral', JSON.stringify(d1.result.deferred));
  verdict(d2.ok && d2.result.deferred.some(function (x) { return /rma-line/.test(x); }), 'an RMA-line selection declares the RMA-corpus deferral', JSON.stringify(d2.result.deferred));
  verdict(res.result.deferred.some(function (x) { return /updateFrom/.test(x); }), 'the mainline run still declares updateFrom(order)\'s payment-schedule deferral', JSON.stringify(res.result.deferred));

  gb.close();
  if (!checks) { console.log('\n⚪ W-CREATEFROM-INVOICE INCONCLUSIVE — nothing was judged'); process.exit(3); }
  console.log('\n' + (fails ? '🔴 W-CREATEFROM-INVOICE FAIL — ' + (checks - fails) + ' PASS / ' + fails + ' FAIL'
                            : '🟢 W-CREATEFROM-INVOICE PASS — ' + checks + ' PASS / 0 FAIL — the P2P line-maker sets M_InOutLine_ID and M_MatchInv now fires'));
  process.exit(fails ? 2 : 0);
})();
