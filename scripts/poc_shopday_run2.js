#!/usr/bin/env node
// Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
// SPDX-License-Identifier: MIT
// ⚠ DO NOT REMOVE — Scope: W-SHOPDAY-RUN2, the unit-level proof of the engine rules ported for the shop-day gaps (prompts/SQLiteIDEMPIERE.md §SHOPDAY-RUN-2). Read the log after every run
// (build/erp/logs_shopday_run2/poc_*.log); exit code alone is not evidence. Each section names the ISSUE it proves/disproves; a section that judged nothing prints INCONCLUSIVE.
// Implementing prompts/SQLiteIDEMPIERE.md §SHOPDAY-RUN-2 R2.1/R2.2/R2.4 — Witness: W-SHOPDAY-RUN2. Expected values are hand-evaluated from the cited legacy arithmetic, not from this code.
// Run: node scripts/poc_shopday_run2.js [--engine-dir <bim-ootb/erp>]  (the second form judges the shipped twin; exit 1 on any FAIL, 2 on INCONCLUSIVE)
'use strict';
var path = require('path');
var ARGV = process.argv.slice(2), ED = ARGV.indexOf('--engine-dir') >= 0 ? ARGV[ARGV.indexOf('--engine-dir') + 1] : null;
var Database = require(path.join(__dirname, '..', 'node_modules', 'better-sqlite3'));
var DP = require(ED ? path.join(ED, 'doc_poster.js') : './doc_poster.js'), E = require(ED ? path.join(ED, 'erp_engine.js') : './erp_engine.js');
var fails = 0, incs = 0, log = console.log;
function check(sec, name, got, want) { var ok = JSON.stringify(got) === JSON.stringify(want); if (!ok) fails++; log('§SR2 ' + sec + ' ' + name + ' ' + (ok ? 'PASS' : 'FAIL') + ' got=' + JSON.stringify(got) + ' want=' + JSON.stringify(want)); return ok; }
function verdict(sec, judged) { if (!judged) { incs++; log('§SR2 ' + sec + ' INCONCLUSIVE judged=0'); } else log('§SR2 ' + sec + ' judged=' + judged); }

// ---- R2.2: Doc_InOut.createFacts:719-783 per-unit receipt cost of an order line ----
(function () {
  if (typeof DP.poLineCost !== 'function') { check('R2.2', 'poLineCost exported', typeof DP.poLineCost, 'function'); return verdict('R2.2', 0); }
  var db = new Database(':memory:');
  db.exec("CREATE TABLE c_tax(c_tax_id INTEGER, rate NUMERIC, issummary TEXT, taxpostingindicator TEXT, parent_tax_id INTEGER, isactive TEXT);" +
    "CREATE TABLE c_order(c_order_id INTEGER, m_pricelist_id INTEGER, c_currency_id INTEGER, istaxincluded TEXT);" +
    "CREATE TABLE m_pricelist(m_pricelist_id INTEGER, istaxincluded TEXT);CREATE TABLE c_currency(c_currency_id INTEGER, stdprecision INTEGER);" +
    "INSERT INTO c_currency VALUES(100,2);INSERT INTO m_pricelist VALUES(1,'N'),(2,'Y');INSERT INTO c_order VALUES(1,1,100,'N'),(2,2,100,'Y');" +
    "INSERT INTO c_tax VALUES(10,10,'N','N',NULL,'Y'),(11,10,'N','1',NULL,'Y'),(20,10,'Y','N',NULL,'Y'),(21,5,'N','N',20,'Y'),(22,5,'N','1',20,'Y');");
  var n = 0, c = function (name, ol, want) { var ab = []; var got = DP.poLineCost(db, ol, ab); n++; check('R2.2', name, got == null ? { absent: ab } : Number(got), want); };
  c('excluded 10%, not distributed: tax is NOT in the cost (price 30 -> 30)', { c_order_id: 1, c_currency_id: 100, priceactual: 30, pricecost: 0, c_tax_id: 10 }, 30);
  c('excluded 10%, distributed (TaxPostingIndicator 1): +tax at scale 12 (30 -> 33)', { c_order_id: 1, c_currency_id: 100, priceactual: 30, pricecost: 0, c_tax_id: 11 }, 33);
  c('included 10%, not distributed: tax taken OUT (33 - (33-33/1.1) = 30)', { c_order_id: 2, c_currency_id: 100, priceactual: 33, pricecost: 0, c_tax_id: 10 }, 30);
  c('included 10%, distributed: unchanged (33)', { c_order_id: 2, c_currency_id: 100, priceactual: 33, pricecost: 0, c_tax_id: 11 }, 33);
  c('included summary (children 5% plain + 5% distributed): 33 - 1.49 = 31.51', { c_order_id: 2, c_currency_id: 100, priceactual: 33, pricecost: 0, c_tax_id: 20 }, 31.51);
  c('excluded summary: only the distributed child is added (30 + 1.5 = 31.5)', { c_order_id: 1, c_currency_id: 100, priceactual: 30, pricecost: 0, c_tax_id: 20 }, 31.5);
  c('PriceCost wins and is never tax-corrected', { c_order_id: 2, c_currency_id: 100, priceactual: 33, pricecost: 28, c_tax_id: 10 }, 28);
  c('no tax on the line: PriceActual as is', { c_order_id: 1, c_currency_id: 100, priceactual: 12.34, pricecost: null, c_tax_id: null }, 12.34);
  verdict('R2.2', n);
})();

// ---- R2.1: Doc_Inventory.createFacts:300-335 "No Costs" refusal leaves the cost state untouched; R2.1b: PI gain accumulates CumulatedAmt/Qty (MCost.setWeightedAverage) ----
(function () {
  if (typeof DP.inventoryPostRefused !== 'function') { check('R2.1', 'inventoryPostRefused exported', typeof DP.inventoryPostRefused, 'function'); return verdict('R2.1', 0); }
  function mk(cost, bless) {
    var db = new Database(':memory:');
    db.exec("CREATE TABLE c_acctschema(c_acctschema_id INTEGER, m_costtype_id INTEGER, costingmethod TEXT, c_currency_id INTEGER, isactive TEXT);" +
      "CREATE TABLE c_currency(c_currency_id INTEGER, costingprecision INTEGER, stdprecision INTEGER);" +
      "CREATE TABLE m_costelement(m_costelement_id INTEGER, costelementtype TEXT, costingmethod TEXT, isactive TEXT);" +
      "CREATE TABLE m_product(m_product_id INTEGER, isstocked TEXT, producttype TEXT, m_product_category_id INTEGER);" +
      "CREATE TABLE m_cost(m_product_id INTEGER, c_acctschema_id INTEGER, m_costtype_id INTEGER, m_costelement_id INTEGER, currentcostprice NUMERIC, currentqty NUMERIC, cumulatedamt NUMERIC, cumulatedqty NUMERIC);" +
      "CREATE TABLE m_costdetail(m_product_id INTEGER, processed TEXT, amt NUMERIC, qty NUMERIC, c_orderline_id INTEGER, c_invoiceline_id INTEGER);" +
      "CREATE TABLE m_inventoryline(m_inventoryline_id INTEGER, m_inventory_id INTEGER, m_product_id INTEGER, m_locator_id INTEGER, qtybook NUMERIC, qtycount NUMERIC, isactive TEXT);" +
      "INSERT INTO c_acctschema VALUES(1,1,'A',100,'Y');INSERT INTO c_currency VALUES(100,4,2);INSERT INTO m_costelement VALUES(7,'M','A','Y');INSERT INTO m_product VALUES(5,'Y','I',1);" +
      "INSERT INTO m_cost VALUES(5,1,1,7," + cost + ",0,0,0);INSERT INTO m_inventoryline VALUES(1,9,5,1,0,20,'Y');");
    if (bless) db.exec("INSERT INTO m_costdetail VALUES(5,'Y',0,10,77,NULL)");
    return db;
  }
  var n = 0;
  var z = mk(0, false); n++; check('R2.1', 'zero cost, no blessing: PI refused', DP.inventoryPostRefused(z, 9), true);
  n++; check('R2.1', 'refused PI changes NO cost state (costQtyUpdatesFor -> [])', DP.costQtyUpdatesFor(z, 'M_Inventory', 9).length, 0);
  var b = mk(0, true); n++; check('R2.1', 'zero cost WITH a processed zero-amount order/invoice cost detail: not refused (Doc_Inventory.java:319-331)', DP.inventoryPostRefused(b, 9), false);
  var ok = mk(60, false); n++; check('R2.1', 'cost 60: not refused', DP.inventoryPostRefused(ok, 9), false);
  var u = DP.costQtyUpdatesFor(ok, 'M_Inventory', 9); n++; check('R2.1', 'cost 60: one cost update (1 schema x 1 element)', u.length, 1);
  if (u.length) {
    n++; check('R2.1b', 'PI gain 20 @60: CurrentQty 20', u[0].set.currentqty, 20);
    n++; check('R2.1b', 'PI gain 20 @60: CumulatedAmt += 20 x 60 = 1200 (legacy 30@20/600 after 20 x 30)', u[0].set.cumulatedamt, 1200);
    n++; check('R2.1b', 'PI gain 20 @60: CumulatedQty += 20', u[0].set.cumulatedqty, 20);
    n++; check('R2.1b', 'price stays 60 (weighted average of 60 and 60)', u[0].set.currentcostprice, 60);
  }
  verdict('R2.1', n);
})();

// ---- R2.4: MOrder.beforeSave:1282-1291 default price list ----
(function () {
  if (typeof E.orderPriceListDefault !== 'function') { check('R2.4', 'orderPriceListDefault exported', typeof E.orderPriceListDefault, 'function'); return verdict('R2.4', 0); }
  var L = [{ m_pricelist_id: 1000000, issopricelist: 'N', isactive: 'Y', isdefault: 'Y', ad_client_id: 5 }, { m_pricelist_id: 1000001, issopricelist: 'N', isactive: 'Y', isdefault: 'N', ad_client_id: 5 },
    { m_pricelist_id: 11, issopricelist: 'Y', isactive: 'Y', isdefault: 'Y', ad_client_id: 6 }];
  var n = 0, r;
  r = E.orderPriceListDefault({ m_pricelist_id: 0, issotrx: 'Y', ad_client_id: 5 }, L); n++; check('R2.4', 'fresh client (only IsSOPriceList=N lists): sales order REFUSED', [r.ok, r.reason], [false, 'no-price-list']);
  r = E.orderPriceListDefault({ m_pricelist_id: 0, issotrx: 'N', ad_client_id: 5 }, L); n++; check('R2.4', 'purchase order takes the IsDefault=Y list first', [r.ok, r.m_pricelist_id], [true, 1000000]);
  r = E.orderPriceListDefault({ m_pricelist_id: 0, issotrx: 'Y', ad_client_id: 5 }, L.concat([{ m_pricelist_id: 1000009, issopricelist: 'Y', isactive: 'N', isdefault: 'Y', ad_client_id: 5 }])); n++; check('R2.4', 'an INACTIVE sales list is ignored', r.ok, false);
  r = E.orderPriceListDefault({ m_pricelist_id: 0, issotrx: 'Y', ad_client_id: 5 }, L.concat([{ m_pricelist_id: 1000010, issopricelist: 'Y', isactive: 'Y', isdefault: 'N', ad_client_id: 5 }, { m_pricelist_id: 1000011, issopricelist: 'Y', isactive: 'Y', isdefault: 'Y', ad_client_id: 5 }])); n++; check('R2.4', 'IsDefault DESC: the default sales list wins', r.m_pricelist_id, 1000011);
  r = E.orderPriceListDefault({ m_pricelist_id: 1000099, issotrx: 'Y', ad_client_id: 5 }, L); n++; check('R2.4', 'an explicit price list is kept', [r.ok, r.m_pricelist_id], [true, 1000099]);
  verdict('R2.4', n);
})();
log('§SR2_VERDICT ' + (fails ? 'FAIL' : incs ? 'INCONCLUSIVE' : 'PASS') + ' fails=' + fails + ' inconclusive=' + incs);
process.exit(fails ? 1 : incs ? 2 : 0);
