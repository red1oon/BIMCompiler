// Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
// SPDX-License-Identifier: MIT
// report_invoice_gl.js — foldInvoiceGL: the T_InvoiceGL (Invoice Not-realized Gain/Loss) report fold.
//   Witness: W-INVOICEGL. Implementing GapClosureSpec.md §5d — closing the T_InvoiceGL gap of
//   ERP_COVERAGE_MATRIX.md (the currency-revaluation report scratch table; actual data is T_InvoiceGL_v).
//
// PURE VERB. A faithful port of the REPORT core of org.compiere.process.InvoiceNGL.doIt() — the
//   INSERT…SELECT that fills T_InvoiceGL + the three post-UPDATEs (diff, percent, proration). The
//   createGLJournal() document-creation step is the ACTION (writes MJournal/MJournalLine), NOT the
//   report — out of scope (cf. ReplenishReport's createPO).
//
// What the fold computes per open invoice ⋈ its Fact_Acct (AD_Table_ID=318) row, for ONE acct schema:
//   AmtSourceBalance = AmtSourceDr - AmtSourceCr
//   AmtAcctBalance   = AmtAcctDr   - AmtAcctCr
//   AmtRevalDr       = currencyConvert(AmtSourceDr, invCcy, schemaCcy, DateReval, ConvTypeReval)
//   AmtRevalCr       = currencyConvert(AmtSourceCr, invCcy, schemaCcy, DateReval, ConvTypeReval)
//   AmtRevalDrDiff   = AmtRevalDr - AmtAcctDr     (unrealized gain/loss vs the posted accounted amount)
//   AmtRevalCrDiff   = AmtRevalCr - AmtAcctCr
//   OpenAmt          = invoiceOpen(C_Invoice_ID)  (GrandTotal less allocations)
//   Percent          = 100 if GrandTotal=OpenAmt else ROUND(OpenAmt*100/GrandTotal,6)
//   if Percent<>100: AmtRevalDr/Cr and the two Diffs are all prorated by Percent/100
//
// The currency engine is reimplemented here (currencyRate + currencyRound + currencyConvert) so the fold is
//   a path INDEPENDENT of iDempiere's plpgsql currencyConvert() — the witness diffs the two.
//
// NON-INVENT: every value READ from a real Fact_Acct / C_Invoice / C_Conversion_Rate / C_Currency row.
//   EXACT BigDecimal arithmetic; currencyRound = ROUND(amt*rate, StdPrecision) HALF_UP (== Postgres ROUND).
//   No Date.now / no Math.random. EMU/Euro fixed-rate branches are NO-OPS in this seed (no currency has
//   IsEMUMember='Y' — asserted in the witness); the flexible-rate path is the live one. Allocation/credit-memo
//   /payment-schedule corrections of invoiceOpen are ported but evaluate to OpenAmt=GrandTotal here (no
//   allocations, all Multiplier=1.0 — verified, not assumed).
'use strict';

(function (global) {
  var BD = (typeof require === 'function') ? require('./bigdecimal.js') : global.BigDecimal;
  var HALF_UP = BD.RoundingMode.HALF_UP;
  function bd(v) { return (v == null || v === '') ? BD.ZERO : BD.of(String(v)); }
  function dateOnly(s) { return String(s).slice(0, 10); }   // TRUNC(timestamp) → YYYY-MM-DD

  // ── currencyRate — flexible-rate lookup, faithful port of adempiere.currencyRate() flexible path ─────────
  // rates: [{c_currency_id, c_currency_id_to, c_conversiontype_id, multiplyrate, validfrom, validto,
  //          ad_client_id, ad_org_id, isactive}]
  // opts.bendRate: {factor} — FALSIFIER hook: multiply the looked-up rate by factor (engine only).
  function currencyRate(rates, from, to, convDate, convType, client, org, opts) {
    if (String(from) === String(to)) return BD.ONE;
    var d = dateOnly(convDate);
    var cand = rates.filter(function (r) {
      return r.isactive === 'Y' && String(r.c_currency_id) === String(from) &&
        String(r.c_currency_id_to) === String(to) && String(r.c_conversiontype_id) === String(convType) &&
        dateOnly(r.validfrom) <= d && d <= dateOnly(r.validto) &&
        (String(r.ad_client_id) === '0' || String(r.ad_client_id) === String(client)) &&
        (String(r.ad_org_id) === '0' || String(r.ad_org_id) === String(org));
    });
    if (!cand.length) return null;
    // ORDER BY AD_Client_ID DESC, AD_Org_ID DESC, ValidFrom DESC — first row
    cand.sort(function (a, b) {
      return (+b.ad_client_id - +a.ad_client_id) || (+b.ad_org_id - +a.ad_org_id) ||
        (dateOnly(b.validfrom) < dateOnly(a.validfrom) ? -1 : dateOnly(b.validfrom) > dateOnly(a.validfrom) ? 1 : 0);
    });
    var rate = bd(cand[0].multiplyrate);
    if (opts && opts.bendRate) rate = rate.multiply(bd(opts.bendRate.factor));
    return rate;
  }

  // ── currencyConvert — port of adempiere.currencyConvert() / currencyRound() ──────────────────────────────
  // returns null when no rate found (matches plpgsql RETURN NULL).
  function currencyConvert(amount, from, to, convDate, convType, client, org, ctx, opts) {
    var amt = bd(amount);
    if (amt.signum() === 0 || String(from) === String(to)) return amt;   // unchanged, no rounding
    var rate = currencyRate(ctx.rates, from, to, convDate, convType, client, org, opts);
    if (rate == null) return null;
    var prec = ctx.precision[String(to)];
    if (prec == null) return amt.multiply(rate);            // currency not found → no rounding (plpgsql guard)
    return amt.multiply(rate).setScale(+prec, HALF_UP);     // currencyRound: ROUND(amt*rate, StdPrecision)
  }

  // ── foldInvoiceGL ────────────────────────────────────────────────────────────────────────────────────────
  // src = { factAcct:[{fact_acct_id, ad_table_id, record_id, c_acctschema_id, account_id,
  //                    amtsourcedr, amtsourcecr, amtacctdr, amtacctcr}],
  //         invoices:[{c_invoice_id, grandtotal, c_currency_id, issotrx, ispaid, ad_client_id, ad_org_id}],
  //         elementValues:[{c_elementvalue_id, accounttype}],   // for the A/L account filter
  //         acctSchemas:[{c_acctschema_id, c_currency_id}],
  //         rates:[…C_Conversion_Rate…], currencies:[{c_currency_id, stdprecision}],
  //         allocations:[{c_invoice_id, amount, discountamt, writeoffamt, c_currency_id, datetrx,
  //                       ad_client_id, ad_org_id, multiplierap}] }  // optional
  // params = {acctSchemaId, dateReval, convTypeReval, apar:'A'|'R'|'P', isAllCurrencies, currencyId,
  //           bendRate:{factor}}
  function foldInvoiceGL(src, params) {
    params = params || {};
    var AS = String(params.acctSchemaId);
    var apar = params.apar || 'A';
    var allCcy = !!params.isAllCurrencies;
    var ccyFilter = allCcy ? 0 : +(params.currencyId || 0);

    var ctx = {
      rates: src.rates || [],
      precision: {}
    };
    (src.currencies || []).forEach(function (c) { ctx.precision[String(c.c_currency_id)] = c.stdprecision; });

    var invById = {}; src.invoices.forEach(function (i) { invById[String(i.c_invoice_id)] = i; });
    var acctType = {}; (src.elementValues || []).forEach(function (e) { acctType[String(e.c_elementvalue_id)] = e.accounttype; });
    var schemaCcy = null;
    (src.acctSchemas || []).forEach(function (a) { if (String(a.c_acctschema_id) === AS) schemaCcy = String(a.c_currency_id); });

    // allocations per invoice → OpenAmt (invoiceOpen port; default conv type for allocation legs)
    var allocByInv = {};
    (src.allocations || []).forEach(function (al) { (allocByInv[String(al.c_invoice_id)] = allocByInv[String(al.c_invoice_id)] || []).push(al); });

    var out = [];
    src.factAcct.forEach(function (fa) {
      if (String(fa.ad_table_id) !== '318') return;                  // C_Invoice fact rows only
      if (String(fa.c_acctschema_id) !== AS) return;                 // this run's acct schema
      var inv = invById[String(fa.record_id)];
      if (!inv || inv.ispaid !== 'N') return;                        // open invoices only
      var at = acctType[String(fa.account_id)];
      if (at !== 'A' && at !== 'L') return;                          // Asset/Liability accounts only
      var gt = bd(inv.grandtotal);
      var srcDr = bd(fa.amtsourcedr), srcCr = bd(fa.amtsourcecr);
      if (gt.compareTo(srcDr) !== 0 && gt.compareTo(srcCr) !== 0) return;   // GrandTotal matches Dr or Cr
      // APAR filter
      if (apar === 'R' && inv.issotrx !== 'Y') return;
      if (apar === 'P' && inv.issotrx !== 'N') return;
      // currency filters
      if (allCcy && String(inv.c_currency_id) === schemaCcy) return;       // IsAllCurrencies excludes same-ccy
      if (!allCcy && ccyFilter && +inv.c_currency_id !== ccyFilter) return;

      var invCcy = inv.c_currency_id, client = inv.ad_client_id, org = inv.ad_org_id;
      var revalDr = currencyConvert(srcDr, invCcy, schemaCcy, params.dateReval, params.convTypeReval, client, org, ctx, params);
      var revalCr = currencyConvert(srcCr, invCcy, schemaCcy, params.dateReval, params.convTypeReval, client, org, ctx, params);
      var acctDr = bd(fa.amtacctdr), acctCr = bd(fa.amtacctcr);

      // OpenAmt = GrandTotal - Σ allocations (converted to invoice ccy); rounded to invoice-ccy precision
      var invPrec = ctx.precision[String(invCcy)];
      var paid = BD.ZERO;
      (allocByInv[String(inv.c_invoice_id)] || []).forEach(function (al) {
        var leg = bd(al.amount).add(bd(al.discountamt)).add(bd(al.writeoffamt)).multiply(bd(al.multiplierap));
        var conv = currencyConvert(leg, al.c_currency_id, invCcy, al.datetrx, 0 /*default conv type*/, al.ad_client_id, al.ad_org_id, ctx, null);
        if (conv != null) paid = paid.add(conv);
      });
      var openAmt = gt.subtract(paid);
      if (invPrec != null) openAmt = openAmt.setScale(+invPrec, HALF_UP);

      // raw diffs (before proration)
      var drDiff = revalDr.subtract(acctDr);
      var crDiff = revalCr.subtract(acctCr);

      // Percent + proration
      var percent;
      if (gt.compareTo(openAmt) === 0) percent = BD.of('100');
      else if (gt.signum() !== 0) percent = openAmt.multiply(BD.of('100')).divide(gt, 6, HALF_UP);
      else percent = BD.of('100');
      if (percent.compareTo(BD.of('100')) !== 0) {
        var f = percent.divide(BD.of('100'), 6, HALF_UP);   // Percent/100
        revalDr = revalDr.multiply(f);
        revalCr = revalCr.multiply(f);
        drDiff = drDiff.multiply(f);
        crDiff = crDiff.multiply(f);
      }

      out.push({
        C_Invoice_ID: +inv.c_invoice_id, Fact_Acct_ID: +fa.fact_acct_id,
        GrandTotal: gt, OpenAmt: openAmt, Percent: percent,
        AmtSourceBalance: srcDr.subtract(srcCr), AmtAcctBalance: acctDr.subtract(acctCr),
        AmtRevalDr: revalDr, AmtRevalCr: revalCr,
        AmtRevalDrDiff: drDiff, AmtRevalCrDiff: crDiff,
        InvCcy: +invCcy, SchemaCcy: +schemaCcy, IsSOTrx: inv.issotrx
      });
    });
    return out.sort(function (a, b) { return (a.C_Invoice_ID - b.C_Invoice_ID) || (a.Fact_Acct_ID - b.Fact_Acct_ID); });
  }

  var API = { foldInvoiceGL: foldInvoiceGL, currencyConvert: currencyConvert, currencyRate: currencyRate };
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
  else global.ReportInvoiceGL = API;
})(typeof globalThis !== 'undefined' ? globalThis : this);
