#!/usr/bin/env node
// Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
// SPDX-License-Identifier: MIT
// poc_callout.js — W-CALLOUT witness. Opens canonical build/erp/ad_full.db and drives REAL AD_Column.Callout
// rows through build/erp/ad_callout.js: the line price/qty/amount callouts fire on a field change and DERIVE
// sibling values (verified == the stored row), an unregistered callout returns an explicit absent-handler,
// and a corrupted input proves the handler actually computes (load-bearing).
// Implementing ERP_COVERAGE_MATRIX.md §AD_Column·Callout (ranked GAP #6) — Witness: W-CALLOUT
// Run: node scripts/poc_callout.js 2>&1 | tee build/erp/poc_callout.log   (read the log; exit code != evidence)
'use strict';
var path = require('path');
var Database = require('better-sqlite3');
var C = require(path.join(__dirname, '..', 'build', 'erp', 'ad_callout.js'));
var DB_PATH = path.join(__dirname, '..', 'build', 'erp', 'ad_full.db');

var fails = 0;
function verdict(ok, label, detail) { if (!ok) fails++; console.log('   ' + (ok ? '🟢' : '🔴') + ' ' + label + (detail ? ' — ' + detail : '')); }

console.log('═══ W-CALLOUT — AD_Column.Callout dispatch spine (real ad_full.db → registry → derived values) ═══\n');
var db = new Database(DB_PATH, { readonly: true });
C.installDefaultHandlers();

// ── ctx: the host glue the .product handler needs — derive price from the order's price list (real join) ──
var ctx = {
  productPrice: function (pid, record) {
    var oid = record.c_order_id != null ? record.c_order_id : record.C_Order_ID;
    var r = db.prepare(
      'SELECT pp.pricestd AS priceStd, pp.pricelist AS priceList FROM c_order o ' +
      'JOIN m_pricelist_version v ON v.m_pricelist_id=o.m_pricelist_id ' +
      'JOIN m_productprice pp ON pp.m_pricelist_version_id=v.m_pricelist_version_id AND pp.m_product_id=? ' +
      'WHERE o.c_order_id=? ORDER BY v.m_pricelist_version_id LIMIT 1').get(pid, oid);
    return r || null;
  }
};

// ── coverage: of the 284 callout cols / 148 classes, how many does the registry dispatch? ───────────────
var cov = C.coverageScan(db);
console.log('§CALLOUT_COVERAGE cols=' + cov.cols + ' distinctMethodAtoms=' + cov.distinctClasses +
  ' registered=' + cov.registered + ' classesDispatched=' + cov.classesDispatched + ' colsDispatched=' + cov.colsDispatched +
  ' (mechanism: 6 real line-callout atoms + CalloutEngine.dateAcct ported; ' + (cov.distinctClasses - cov.classesDispatched) + ' named-deferred)');
console.log('   note: matrix "148 classes" = COUNT(DISTINCT callout) whole-strings; ' + cov.distinctClasses + ' = distinct class.method atoms after splitting `;` combos (both real, different metrics)');
verdict(cov.cols === 284, 'AD callout population matches the matrix (284 cols carry a callout)', 'cols=' + cov.cols);
// PIN MOVED 6 -> 7, 2026-09-04 (prompts/AGENT_QUEUE.md §CALLOUT-CAMPAIGN §CC.4): CalloutEngine.dateAcct
// joins installDefaultHandlers because it is the one new atom that needs NO bundle — it copies the document
// date to DateAcct — and it is bound on FOUR document tables at once. Every other handler in that campaign
// needs a real join and lives in crud_overlay.js's host glue, so this pin stays a tight, deliberate number.
verdict(cov.colsDispatched > 0 && cov.registered === 7, 'registry dispatches a real subset (7 handlers), rest named-deferred', 'registered=' + cov.registered + ' colsDispatched=' + cov.colsDispatched);

// ── the witness row: order line 124 — PriceActual 21.59 × QtyOrdered 10 = LineNetAmt 215.90 ─────────────
var line = db.prepare('SELECT * FROM c_orderline WHERE c_orderline_id=124').get();
console.log('\n── fire CalloutOrder on a real C_OrderLine (id 124, product 128) — derived must == stored ──');

// (1) QtyEntered change → CalloutOrder.qty + CalloutOrder.amt (the column carries BOTH; merge proven)
var d1 = C.dispatch(db, { table: 'C_OrderLine', column: 'QtyEntered', record: line }, ctx);
console.log('§CALLOUT col=QtyEntered callouts=[' + d1.callouts.join(', ') + '] fired=[' + d1.fired.map(short).join(',') + '] derived=' + JSON.stringify(d1.derived));
verdict(d1.fired.length === 2 && d1.derived.LineNetAmt === 215.9 && d1.derived.QtyOrdered === 10,
  'QtyEntered fires qty+amt → derived {QtyOrdered:10, LineNetAmt:215.90} == stored', JSON.stringify(d1.derived));

// (2) M_Product_ID change → CalloutOrder.product: derive Price* from the price list + LineNetAmt
var d2 = C.dispatch(db, { table: 'C_OrderLine', column: 'M_Product_ID', record: line }, ctx);
console.log('§CALLOUT col=M_Product_ID fired=[' + d2.fired.map(short).join(',') + '] derived=' + JSON.stringify(d2.derived));
verdict(d2.derived.PriceActual === 21.59 && d2.derived.PriceList === 22.73 && d2.derived.LineNetAmt === 215.9,
  'M_Product_ID derives PriceActual 21.59 / PriceList 22.73 / LineNetAmt 215.90 from the price list == stored',
  'stored: priceactual=' + line.priceactual + ' pricelist=' + line.pricelist + ' linenetamt=' + line.linenetamt);

// ── §FALSIFIER 1: an UNREGISTERED callout → explicit absent-handler (not a silent no-op) ────────────────
console.log('\n── §FALSIFIER — unregistered callout is named absent, not silently passed ──');
var dA = C.dispatch(db, { table: 'C_OrderLine', column: 'C_Charge_ID', record: line }, ctx);
console.log('§FALSIFIER col=C_Charge_ID callouts=[' + dA.callouts.join(', ') + '] fired=[' + dA.fired.join(',') + '] absent=[' + dA.absent.map(short).join(',') + ']');
verdict(dA.fired.length === 0 && dA.absent.length >= 1 && /CalloutOrder\.charge/.test(dA.absent.join(',')),
  'unregistered CalloutOrder.charge → fired=0, absent names it (resolution is load-bearing)', 'absent=' + JSON.stringify(dA.absent));

// ── §FALSIFIER 2: corrupt the input → derived diverges from stored (handler really computes) ────────────
var bad = Object.assign({}, line, { qtyordered: 20 });                         // double the qty
var dB = C.dispatch(db, { table: 'C_OrderLine', column: 'QtyEntered', record: bad }, ctx);
console.log('§FALSIFIER corrupted qtyordered=20 → derived LineNetAmt=' + dB.derived.LineNetAmt + ' (stored 215.90)');
verdict(dB.derived.LineNetAmt !== 215.9, 'corrupted qty → derived LineNetAmt ≠ stored (callout computes from inputs, not echo)', 'got=' + dB.derived.LineNetAmt);

function short(n) { return String(n).replace('org.compiere.model.', ''); }

console.log('\n' + (fails === 0 ? '🟢 W-CALLOUT PASS' : '🔴 W-CALLOUT FAIL (' + fails + ')') +
  ' — AD_Column.Callout dispatched on canonical ad_full.db; real line callouts DERIVE verified values, absent explicit. Re-verdict Callout + GAP #6 (⛔→🟡).');
db.close();
process.exit(fails === 0 ? 0 : 1);
