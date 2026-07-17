// Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
// SPDX-License-Identifier: MIT
// ⚠ DO NOT REMOVE — Scope guard
// Scope: W-POST-TAIL §W-POST-TAIL-2 fixture capture (prompts/HARDEN_MATRIX.md). Twin of
// capture_post_b3_fixture.js: straight copy of the COMMITTED scratch DB (idempiere_tail) after
// scripts/logic_oracle/PostingTailTest.java drove the REAL compiled Doc_Cash/Doc_Inventory posters over
// REAL pre-existing documents (no seed authoring at all here — unlike B-3). NON-INVENT: every row below
// is read from the scratch PG; nothing is computed or authored here.
// Called by scripts/generate_post_tail_oracle.sh; standalone: node scripts/capture_post_tail_fixture.js <db> <out.json>
'use strict';
var cp = require('child_process');
var fs = require('fs');
var path = require('path');

var DB = process.argv[2] || 'idempiere_tail';
var OUT = process.argv[3] || path.join(__dirname, '..', 'build', 'erp', 'oracle', 'post_tail_fixture.json');
var US = '\x1f';

function pgRows(sql) {
  var out = cp.execFileSync('docker', ['exec', 'postgres', 'psql', '-U', 'adempiere', '-d', DB,
    '-t', '-A', '-F', US, '-c', sql], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  return out.split('\n').filter(function (s) { return s.length; }).map(function (l) { return l.split(US); });
}

// tail target ad_table_ids: C_Cash=407, M_Inventory=321
var IDS = '407,321';

var CAPTURE = {
  fact_acct: {
    cols: ['fact_acct_id','ad_client_id','ad_org_id','c_acctschema_id','account_id','c_period_id',
           'ad_table_id','record_id','line_id','gl_category_id','c_tax_id','postingtype','c_currency_id',
           'amtsourcedr','amtsourcecr','amtacctdr','amtacctcr','qty','m_product_id','c_bpartner_id','description'],
    sql: "SELECT fact_acct_id, ad_client_id, ad_org_id, c_acctschema_id, account_id, c_period_id," +
         " ad_table_id, record_id, line_id, gl_category_id, c_tax_id, postingtype, c_currency_id," +
         " round(amtsourcedr,2), round(amtsourcecr,2), round(amtacctdr,2), round(amtacctcr,2)," +
         " round(qty,2), m_product_id, c_bpartner_id, replace(coalesce(description,''),chr(10),' ')" +
         " FROM adempiere.fact_acct WHERE ad_table_id IN (" + IDS + ") ORDER BY fact_acct_id"
  },
  c_cashbook: {
    cols: ['c_cashbook_id','c_currency_id','ad_org_id'],
    sql: "SELECT c_cashbook_id, c_currency_id, ad_org_id FROM adempiere.c_cashbook WHERE c_cashbook_id=101"
  },
  c_cash: {
    cols: ['c_cash_id','c_cashbook_id','statementdate','docstatus','posted','isactive','ad_org_id','ad_client_id'],
    sql: "SELECT c_cash_id, c_cashbook_id, statementdate::date, docstatus, posted, isactive, ad_org_id, ad_client_id" +
         " FROM adempiere.c_cash WHERE c_cash_id IN (100,101) ORDER BY c_cash_id"
  },
  c_cashline: {
    cols: ['c_cashline_id','c_cash_id','cashtype','c_currency_id','amount','c_bankaccount_id','c_invoice_id','c_charge_id'],
    sql: "SELECT c_cashline_id, c_cash_id, cashtype, c_currency_id, round(amount,2)," +
         " coalesce(c_bankaccount_id,0), coalesce(c_invoice_id,0), coalesce(c_charge_id,0)" +
         " FROM adempiere.c_cashline WHERE c_cash_id IN (100,101) ORDER BY c_cashline_id"
  },
  c_cashbook_acct: {
    cols: ['c_cashbook_id','c_acctschema_id','cb_asset_acct','cb_cashtransfer_acct','cb_expense_acct','cb_receipt_acct','cb_differences_acct'],
    sql: "SELECT c_cashbook_id, c_acctschema_id, coalesce(cb_asset_acct,0), coalesce(cb_cashtransfer_acct,0)," +
         " coalesce(cb_expense_acct,0), coalesce(cb_receipt_acct,0), coalesce(cb_differences_acct,0)" +
         " FROM adempiere.c_cashbook_acct WHERE c_cashbook_id=101 ORDER BY c_acctschema_id"
  },
  c_bankaccount_acct: {
    cols: ['c_bankaccount_id','c_acctschema_id','b_intransit_acct'],
    sql: "SELECT c_bankaccount_id, c_acctschema_id, coalesce(b_intransit_acct,0)" +
         " FROM adempiere.c_bankaccount_acct WHERE c_bankaccount_id=100 ORDER BY c_acctschema_id"
  },
  c_charge_acct: {
    cols: ['c_charge_id','c_acctschema_id','ch_expense_acct'],
    sql: "SELECT c_charge_id, c_acctschema_id, coalesce(ch_expense_acct,0) FROM adempiere.c_charge_acct" +
         " WHERE ad_client_id=11 ORDER BY c_charge_id, c_acctschema_id"
  },
  m_inventory: {
    cols: ['m_inventory_id','docstatus','posted','movementdate','m_warehouse_id','c_doctype_id','ad_org_id','ad_client_id'],
    sql: "SELECT m_inventory_id, docstatus, posted, movementdate::date, m_warehouse_id, c_doctype_id, ad_org_id, ad_client_id" +
         " FROM adempiere.m_inventory WHERE m_inventory_id IN (100,200000,200001) ORDER BY m_inventory_id"
  },
  m_inventoryline: {
    cols: ['m_inventoryline_id','m_inventory_id','m_product_id','m_locator_id','qtycount','qtybook',
           'qtyinternaluse','m_attributesetinstance_id','c_charge_id','isactive','reversalline_id'],
    sql: "SELECT m_inventoryline_id, m_inventory_id, m_product_id, m_locator_id, round(qtycount,2), round(qtybook,2)," +
         " round(coalesce(qtyinternaluse,0),2), coalesce(m_attributesetinstance_id,0), coalesce(c_charge_id,0)," +
         " isactive, coalesce(reversalline_id,0)" +
         " FROM adempiere.m_inventoryline WHERE m_inventory_id IN (100,200000,200001) ORDER BY m_inventoryline_id"
  },
  c_doctype: {
    cols: ['c_doctype_id','docsubtypeinv'],
    sql: "SELECT c_doctype_id, coalesce(docsubtypeinv,'') FROM adempiere.c_doctype WHERE c_doctype_id=144"
  },
  m_locator: {
    cols: ['m_locator_id','m_warehouse_id'],
    sql: "SELECT m_locator_id, m_warehouse_id FROM adempiere.m_locator WHERE m_locator_id=101"
  },
  m_warehouse_acct: {
    cols: ['m_warehouse_id','c_acctschema_id','w_differences_acct'],
    sql: "SELECT m_warehouse_id, c_acctschema_id, coalesce(w_differences_acct,0) FROM adempiere.m_warehouse_acct" +
         " WHERE m_warehouse_id=103 ORDER BY c_acctschema_id"
  },
  m_product: {
    cols: ['m_product_id','producttype','isstocked','m_product_category_id','name'],
    sql: "SELECT m_product_id, producttype, isstocked, m_product_category_id, name FROM adempiere.m_product" +
         " WHERE m_product_id=147"
  },
  m_product_category_acct: {
    cols: ['m_product_category_id','c_acctschema_id','p_asset_acct','p_expense_acct'],
    sql: "SELECT m_product_category_id, c_acctschema_id, coalesce(p_asset_acct,0), coalesce(p_expense_acct,0)" +
         " FROM adempiere.m_product_category_acct WHERE m_product_category_id=105 ORDER BY c_acctschema_id"
  },
  m_cost: {
    cols: ['m_product_id','c_acctschema_id','m_costtype_id','m_costelement_id','currentcostprice'],
    sql: "SELECT m_product_id, c_acctschema_id, m_costtype_id, m_costelement_id, currentcostprice" +
         " FROM adempiere.m_cost WHERE m_product_id=147 ORDER BY c_acctschema_id, m_costelement_id"
  },
  m_costelement: {
    cols: ['m_costelement_id','costingmethod','costelementtype'],
    sql: "SELECT m_costelement_id, coalesce(costingmethod,''), costelementtype FROM adempiere.m_costelement" +
         " WHERE ad_client_id IN (0,11) ORDER BY m_costelement_id"
  },
  m_costdetail: {
    cols: ['m_costdetail_id','m_product_id','processed','amt','qty','c_orderline_id','c_invoiceline_id'],
    sql: "SELECT m_costdetail_id, m_product_id, processed, round(amt,2), round(qty,2)," +
         " coalesce(c_orderline_id,0), coalesce(c_invoiceline_id,0)" +
         " FROM adempiere.m_costdetail WHERE m_product_id=147 ORDER BY m_costdetail_id"
  },
  c_acctschema: {
    cols: ['c_acctschema_id','c_currency_id','costingmethod','m_costtype_id'],
    sql: "SELECT c_acctschema_id, c_currency_id, costingmethod, m_costtype_id FROM adempiere.c_acctschema" +
         " WHERE ad_client_id=11 ORDER BY c_acctschema_id"
  },
  c_validcombination: {
    cols: ['c_validcombination_id','account_id'],
    sql: "SELECT c_validcombination_id, account_id FROM adempiere.c_validcombination WHERE ad_client_id IN (0,11)" +
         " ORDER BY c_validcombination_id"
  }
};

var fixture = { db: DB, tables: {} };
Object.keys(CAPTURE).forEach(function (t) {
  var spec = CAPTURE[t];
  var rows = pgRows(spec.sql);
  rows.forEach(function (r) {
    if (r.length !== spec.cols.length) {
      throw new Error('capture ' + t + ': row width ' + r.length + ' != cols ' + spec.cols.length);
    }
  });
  fixture.tables[t] = { cols: spec.cols, rows: rows };
  console.log('§GEN-CAPTURE table=' + t + ' rows=' + rows.length);
});

var fa = fixture.tables.fact_acct.rows;
var dr = 0, cr = 0;
fa.forEach(function (r) { dr += Math.round(Number(r[15]) * 100); cr += Math.round(Number(r[16]) * 100); });
console.log('§GEN-CAPTURE fact_acct tail-classes rows=' + fa.length + ' ΣDRc=' + dr + ' ΣCRc=' + cr);
// NOTE: unlike B-3, a 0-row fact_acct here is NOT automatically refused — the honest outcome could be
// "C_Cash posted, M_Inventory refused (No Costs)" i.e. partial. The witness (poc_post_tail.js) enforces
// the real per-class expectation; this capture just copies whatever the engine actually wrote.
if (fa.length === 0) {
  console.log('§GEN-CAPTURE WARNING 0 fact_acct rows for tail classes — check §TAILORACLE log for postErr');
}

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(fixture, null, 1));
console.log('§GEN-CAPTURE fixture=' + OUT + ' bytes=' + fs.statSync(OUT).size);
