#!/usr/bin/env node
// ⚠ DO NOT REMOVE — poc_fold_qweb.js — W-ODOO-QWEB witness
// Implementing ReportingFold.md §5 (Odoo QWeb fold) — Witness: W-ODOO-QWEB
// ISSUE PROVEN: Odoo migrated invoice can be folded to the cent via foldQWeb,
//   using the QWeb arch from odoo_extras.db + line rows from 12-odoo.db.
// Run via: bash build/erp/run_witness.sh scripts/poc_fold_qweb.js
// Read the log before conclusions. Non-invent: every value is a real Odoo or migrated row.
'use strict';
var fs = require('fs'), path = require('path');
var initSqlJs = require('sql.js');

var EXTRAS = path.join(__dirname, '..', 'build', 'erp', 'odoo_extras.db');
var SHARD  = path.join(__dirname, '..', 'build', 'erp', '12-odoo.db');
var QWEB = path.join(__dirname, '..', 'build', 'erp', 'report_qweb.js');   // foldQWeb lives here now — extracted VERBATIM from report_overlay.js (ERP_IDEMPIERE_UX_PARITY.md §TWIN-CLASSIFIED), a copy-only research module

function rowsOf(db, sql, params) {
  var r = db.exec(sql, params || []); if (!r.length) return [];
  var cols = r[0].columns;
  return r[0].values.map(function (v) { var o = {}; cols.forEach(function (c, i) { o[c] = v[i]; }); return o; });
}

(async function () {
  var log = []; function L(m) { console.log(m); log.push(m); }
  L('\n══ W-ODOO-QWEB — foldQWeb witness ══\n');

  var SQL = await initSqlJs();

  // load odoo_extras.db (qweb_view)
  if (!fs.existsSync(EXTRAS)) { L('§W-ODOO-QWEB FAIL extras db missing: ' + EXTRAS); process.exit(1); }
  var extrasDb = new SQL.Database(fs.readFileSync(EXTRAS));
  var viewRows = rowsOf(extrasDb, 'SELECT key, arch, model FROM qweb_view');
  var viewIndex = {};
  viewRows.forEach(function (v) { viewIndex[v.key] = { arch: v.arch, model: v.model }; });
  L('§QWEB-INDEX loaded keys=' + Object.keys(viewIndex).length);

  // load 12-odoo.db (C_Invoice + c_invoiceline)
  if (!fs.existsSync(SHARD)) { L('§W-ODOO-QWEB FAIL shard missing: ' + SHARD); process.exit(1); }
  var shardDb = new SQL.Database(fs.readFileSync(SHARD));
  var invoices = rowsOf(shardDb, "SELECT * FROM C_Invoice WHERE DocStatus='CO' LIMIT 5");
  L('§INVOICES in shard: ' + invoices.length);
  if (!invoices.length) { L('§W-ODOO-QWEB FAIL no CO invoices in shard'); process.exit(1); }

  // pick first CO invoice
  var inv = invoices[0];
  L('§INVOICE id=' + inv.C_Invoice_ID + ' DocumentNo=' + inv.DocumentNo + ' GrandTotal=' + inv.GrandTotal + ' TotalLines=' + inv.TotalLines);

  var lineRows = rowsOf(shardDb, 'SELECT * FROM c_invoiceline WHERE c_invoice_id=?', [inv.C_Invoice_ID]);
  L('§LINE-ROWS count=' + lineRows.length);
  lineRows.forEach(function (l, i) { L('   line ' + (i+1) + ' LineNetAmt=' + l.LineNetAmt + ' QtyInvoiced=' + l.QtyInvoiced + ' PriceActual=' + l.PriceActual); });

  // map shard (iDempiere) column names → Odoo QWeb arch field names (the Odoo migration mapping)
  // LineNetAmt → price_subtotal (extracted from Odoo price_subtotal in gen_ad_odoo.js, non-invent)
  var mappedLines = lineRows.map(function (l) {
    return { price_subtotal: l.LineNetAmt, quantity: l.QtyInvoiced, price_unit: l.PriceActual };
  });

  // load CORE
  var CORE = require(QWEB);
  var manifest = CORE.foldQWeb('account.report_invoice', viewIndex, mappedLines);
  if (!manifest) { L('§W-ODOO-QWEB FAIL foldQWeb returned null (body not found)'); process.exit(1); }

  L('\n§QWEB-MANIFEST body=' + manifest.format.bodyKey + ' fields=' + manifest.fields.map(function (f) { return f.name; }).join(','));
  L('§QWEB-LINE-COUNT rows=' + manifest.rows.length);
  L('§QWEB-TOTALS ' + JSON.stringify(manifest.breaks.total));

  // money oracle: TotalLines = Odoo amount_untaxed == sum of invoice line price_subtotal (non-invent)
  var storedTotal = inv.TotalLines;
  var foldedTotal = manifest.breaks.total['price_subtotal'] || manifest.breaks.total['linenetamt'];

  // linenetamt in shard maps to price_subtotal in Odoo — check both aliases
  var totalKey = manifest.breaks.total['price_subtotal'] != null ? 'price_subtotal' : 'linenetamt';
  foldedTotal = manifest.breaks.total[totalKey];

  if (foldedTotal == null) {
    L('§W-ODOO-QWEB FAIL no money total in manifest (keys: ' + Object.keys(manifest.breaks.total).join(',') + ')');
    process.exit(1);
  }

  var diff = Math.abs(parseFloat(foldedTotal) - parseFloat(storedTotal));
  L('\n§QWEB-DIFF stored=' + storedTotal + ' folded=' + foldedTotal + ' diff=' + diff.toFixed(2));

  // ── §FALSIFIER: drop lines → total must diverge ──
  L('\n── §FALSIFIER: foldQWeb with 0 lines ──');
  var emptyManifest = CORE.foldQWeb('account.report_invoice', viewIndex, []);
  var emptyTotal = emptyManifest && emptyManifest.breaks.total[totalKey];
  var emptyDiff = parseFloat(storedTotal) - parseFloat(emptyTotal || '0');
  L('§FALSIFIER empty-lines total=' + (emptyTotal || '0') + ' stored=' + storedTotal + ' diverges=' + (Math.abs(emptyDiff) > 0 ? 'YES' : 'NO'));
  var falsifierOk = Math.abs(emptyDiff) > 0;

  // ── sale order too ──
  L('\n── sale order fold (sale.report_saleorder) ──');
  var orders = rowsOf(shardDb, "SELECT * FROM C_Order WHERE IsSOTrx='Y' AND DocStatus='CO' LIMIT 3");
  L('§ORDERS count=' + orders.length);
  orders.forEach(function (o) {
    var oLines = rowsOf(shardDb, 'SELECT * FROM C_OrderLine WHERE C_Order_ID=?', [o.C_Order_ID]);
    // map C_OrderLine fields to Odoo QWeb field names for the fold
    var mappedLines = oLines.map(function (l) { return { price_subtotal: l.LineNetAmt, quantity: l.QtyOrdered, price_unit: l.PriceActual, name: null }; });
    var om = CORE.foldQWeb('sale.report_saleorder', viewIndex, mappedLines);
    var ot = om && om.breaks.total['price_subtotal'];
    var odiff = ot != null ? Math.abs(parseFloat(ot) - parseFloat(o.TotalLines)) : null;
    L('§SO ' + o.DocumentNo + ' TotalLines=' + o.TotalLines + ' folded=' + (ot||'n/a') + ' diff=' + (odiff != null ? odiff.toFixed(2) : 'n/a'));
  });

  // ── verdict ──
  var maxDiff = diff;
  var pass = maxDiff === 0 && falsifierOk;
  L('\n§W-ODOO-QWEB maxDiff=' + maxDiff.toFixed(2) + 'c §FALSIFIER=' + (falsifierOk ? 'LOAD-BEARING' : 'BROKEN'));
  L('§W-ODOO-QWEB ' + (pass ? 'PASS' : 'FAIL'));
  fs.writeFileSync(path.join(__dirname, '..', 'build', 'erp', 'poc_fold_qweb.log'), log.join('\n'));
  process.exit(pass ? 0 : 1);
})().catch(function (e) { console.error('§W-ODOO-QWEB ERROR', e.message, e.stack); process.exit(2); });
