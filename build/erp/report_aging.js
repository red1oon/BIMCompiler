// Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
// SPDX-License-Identifier: MIT
// report_aging.js — foldAging: the T_Aging (AR/AP invoice aging) report fold. Witness: W-AGING.
//   Implementing GapClosureSpec.md §5a — closing the T_Aging gap of ERP_COVERAGE_MATRIX.md.
//
// PURE VERB. A faithful port of iDempiere's aging report:
//   - org.compiere.process.Aging.doIt()  (the open-items driver over RV_OpenItem)
//   - org.compiere.model.MAging.add()     (the per-row bucketing, MAging.java:157-235)
//
// NON-INVENT: every number folds from a real rv_openitem row. DaysDue is iDempiere's OWN computed value
// (read verbatim from the view); with StatementDate=today the process adds m_statementOffset=0, so
// DaysDue = rv_openitem.DaysDue. The bucket boundary conditions below are copied LINE-FOR-LINE from
// MAging.add — do not "tidy" them; their exact <=/>= asymmetry is the rule under test.
//
// Money is INTEGER CENTS throughout (BigInt-safe Number; sums of a handful of invoice cents stay far inside
// 2^53). The caller passes amounts already in cents (see poc_fold_aging.js: Math.round(Number(x)*100)) so the
// fold never re-parses a float. No Date.now / no Math.random — DueDate "earliest" is a lexicographic min over
// the uniform 'YYYY-MM-DD …' strings the view returns (deterministic).
'use strict';

(function (global) {

  // The 21 monetary bucket columns, in MAging's declaration order. Every group row carries all of them.
  var BUCKETS = [
    'Due0', 'Due0_7', 'Due0_30', 'Due1_7', 'Due8_30', 'Due31_60', 'Due31_Plus',
    'Due61_90', 'Due61_Plus', 'Due91_Plus', 'DueAmt',
    'PastDue1_7', 'PastDue1_30', 'PastDue8_30', 'PastDue31_60', 'PastDue31_Plus',
    'PastDue61_90', 'PastDue61_Plus', 'PastDue91_Plus', 'PastDueAmt'
  ];

  function newRow(item, isSOTrx) {
    var r = {
      C_BP_Group_ID: item.c_bp_group_id, C_BPartner_ID: item.c_bpartner_id,
      C_Currency_ID: item.c_currency_id, C_Invoice_ID: item.c_invoice_id || 0,
      C_InvoicePaySchedule_ID: item.c_invoicepayschedule_id || 0,
      IsSOTrx: isSOTrx, InvoicedAmt: 0, OpenAmt: 0, DueDate: null,
      _daysDueSum: 0, _noItems: 0, DaysDue: 0
    };
    BUCKETS.forEach(function (b) { r[b] = 0; });
    return r;
  }

  // add — MAging.add(DueDate, daysDue, invoicedAmt, openAmt). amt = openAmt for every bucket.
  // All amounts are integer cents. (BOUNDARIES: verbatim from MAging.java — corrupt any one → §FALSIFIER fires.)
  // overrides: optional {bucket: {lo, hi}} for the falsifier — replaces a bucket's boundary at runtime so the
  // test can prove the diff is load-bearing without editing the canonical rule. Default = the real rule.
  function add(row, dueDate, daysDue, invoicedAmt, openAmt, overrides) {
    invoicedAmt = invoicedAmt || 0;
    openAmt = openAmt || 0;
    row.InvoicedAmt += invoicedAmt;
    row.OpenAmt += openAmt;
    row._noItems++;
    row._daysDueSum += daysDue;
    row.DaysDue = Math.trunc(row._daysDueSum / row._noItems);   // Java int division (truncates toward zero)
    if (row.DueDate === null || String(dueDate) < row.DueDate) row.DueDate = String(dueDate);  // earliest
    var amt = openAmt;
    overrides = overrides || {};
    // a boundary, possibly overridden by the falsifier
    function lo(name, def) { return (overrides[name] && overrides[name].lo != null) ? overrides[name].lo : def; }
    function hi(name, def) { return (overrides[name] && overrides[name].hi != null) ? overrides[name].hi : def; }

    if (daysDue <= 0) {                                  // Not due — negative / zero
      row.DueAmt += amt;
      if (daysDue === 0) row.Due0 += amt;
      if (daysDue >= -7) row.Due0_7 += amt;
      if (daysDue >= -30) row.Due0_30 += amt;
      if (daysDue <= -1 && daysDue >= -7) row.Due1_7 += amt;
      if (daysDue <= -8 && daysDue >= -30) row.Due8_30 += amt;
      if (daysDue <= -31 && daysDue >= -60) row.Due31_60 += amt;
      if (daysDue <= -31) row.Due31_Plus += amt;
      if (daysDue <= -61 && daysDue >= -90) row.Due61_90 += amt;
      if (daysDue <= -61) row.Due61_Plus += amt;
      if (daysDue <= -91) row.Due91_Plus += amt;
    } else {                                             // Due = positive (past due)
      row.PastDueAmt += amt;
      if (daysDue <= 7) row.PastDue1_7 += amt;
      if (daysDue <= 30) row.PastDue1_30 += amt;
      if (daysDue >= 8 && daysDue <= 30) row.PastDue8_30 += amt;
      if (daysDue >= 31 && daysDue <= 60) row.PastDue31_60 += amt;
      if (daysDue >= lo('PastDue31_Plus', 31)) row.PastDue31_Plus += amt;
      if (daysDue >= 61 && daysDue <= 90) row.PastDue61_90 += amt;
      if (daysDue >= lo('PastDue61_Plus', 61)) row.PastDue61_Plus += amt;
      if (daysDue >= lo('PastDue91_Plus', 91)) row.PastDue91_Plus += amt;
    }
  }

  // foldAging — driver. items = open items (each: c_bp_group_id, c_bpartner_id, c_currency_id, c_invoice_id,
  //   c_invoicepayschedule_id, issotrx 'Y'/'N', duedate, daysdue (int), grandtotal_c (cents), openamt_c (cents)).
  // statementOffset: days(today → StatementDate); 0 when StatementDate=today (the report default).
  // For the default report (listInvoices=false) the group key is (IsSOTrx, C_BPartner, C_Currency) — C_Invoice
  // and C_InvoicePaySchedule are forced to 0 (Aging.java:197-198). Returns rows sorted by the iDempiere key.
  function foldAging(items, statementOffset, overrides) {
    statementOffset = statementOffset || 0;
    var groups = {};
    items.forEach(function (it) {
      var so = it.issotrx;
      var key = so + '|' + it.c_bpartner_id + '|' + it.c_currency_id;
      var row = groups[key] || (groups[key] = newRow(it, so));
      var daysDue = (it.daysdue | 0) + statementOffset;
      add(row, it.duedate, daysDue, it.grandtotal_c | 0, it.openamt_c | 0, overrides);
    });
    return Object.keys(groups).map(function (k) {
      var r = groups[k]; delete r._daysDueSum; delete r._noItems; return r;
    }).sort(function (a, b) {
      return (a.IsSOTrx < b.IsSOTrx ? -1 : a.IsSOTrx > b.IsSOTrx ? 1 : 0)
        || (a.C_BPartner_ID - b.C_BPartner_ID)
        || (a.C_Currency_ID - b.C_Currency_ID);
    });
  }

  var API = { foldAging: foldAging, BUCKETS: BUCKETS };
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
  else global.ReportAging = API;
})(typeof globalThis !== 'undefined' ? globalThis : this);
