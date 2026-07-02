// Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
// SPDX-License-Identifier: MIT
// report_distribution_run.js — foldDistributionRun: the T_DistributionRunDetail (distribution planning) fold.
//   Witness: W-DISTRUN. Implementing GapClosureSpec.md §5e — the T_DistributionRunDetail gap of
//   ERP_COVERAGE_MATRIX.md (the ratio-split + integer-allocation report scratch table).
//
// PURE VERB. A faithful port of the PLANNING core of org.compiere.process.DistributionRun — insertDetails()
//   (the ratio split) + the allocation rounding loop (addAllocations / isAllocationEqTotal / adjustAllocation,
//   with MDistributionRunDetail.round/getActualAllocation/adjustQty + MDistributionRunLine.* semantics). The
//   createOrders()/distributionOrders() document-creation steps are the ACTION, NOT the report — out of scope
//   (cf. ReplenishReport's createPO).
//
// TWO outputs, two equivalence claims (see the witness):
//   (a) rawSplit  = ll.Ratio/l.RatioTotal*rl.TotalQty  — ORACLE-EQUIVALENT: == iDempiere's own insertDetails SQL.
//   (b) details   = rawSplit rounded to UOM precision, then the iterative allocation loop that forces
//                   Σ ActualAllocation == TotalQty under the MinQty floors — RULE-CONSISTENT (the loop is
//                   procedural with no SQL/function oracle; a true oracle needs a live process run). The witness
//                   proves the loop's invariants (sum-exact, MinQty respected) and its determinism, NOT a row diff.
//
// NON-INVENT: every value READ from a real M_DistributionRun(Line)/M_DistributionList(Line)/C_UOM row. EXACT
//   BigDecimal; round = setScale(UOMprec, HALF_UP); distribute diffRatio = round(ratio*diff/ratioTotal) at the
//   dividend's scale (Java BigDecimal.divide(div, HALF_UP)) — matching the Java source.
'use strict';

(function (global) {
  var BD = (typeof require === 'function') ? require('./bigdecimal.js') : global.BigDecimal;
  var HALF_UP = BD.RoundingMode.HALF_UP;
  function bd(v) { return (v == null || v === '') ? BD.ZERO : BD.of(String(v)); }
  function maxBD(a, b) { return a.compareTo(b) >= 0 ? a : b; }

  // foldDistributionRun(src, runId, opts)
  // src = { runLines:[{m_distributionrunline_id, m_distributionrun_id, m_distributionlist_id, m_product_id,
  //                    totalqty, minqty, isactive}],
  //         listLines:[{m_distributionlistline_id, m_distributionlist_id, c_bpartner_id,
  //                     c_bpartner_location_id, ratio, minqty, isactive}],
  //         productUOM:[{m_product_id, uomprecision}] }
  // opts.bendRatioListLine: {listLine, delta} — FALSIFIER hook: add delta to one list line's Ratio.
  function foldDistributionRun(src, runId, opts) {
    opts = opts || {};
    var RUN = String(runId);
    var uomPrec = {}; (src.productUOM || []).forEach(function (p) { uomPrec[String(p.m_product_id)] = +p.uomprecision; });

    // active list lines grouped by list; RatioTotal recomputed = Σ active Ratio (insertDetails UPDATE)
    var llByList = {};
    src.listLines.forEach(function (ll) {
      if (ll.isactive !== 'Y') return;
      var ratio = bd(ll.ratio);
      if (opts.bendRatioListLine && String(opts.bendRatioListLine.listLine) === String(ll.m_distributionlistline_id))
        ratio = ratio.add(bd(opts.bendRatioListLine.delta));
      (llByList[String(ll.m_distributionlist_id)] = llByList[String(ll.m_distributionlist_id)] || []).push({
        id: ll.m_distributionlistline_id, bp: ll.c_bpartner_id, loc: ll.c_bpartner_location_id,
        ratio: ratio, minqty: bd(ll.minqty)
      });
    });
    var ratioTotal = {};
    Object.keys(llByList).forEach(function (lid) {
      ratioTotal[lid] = llByList[lid].reduce(function (s, x) { return s.add(x.ratio); }, BD.ZERO);
    });

    // build per-runLine detail sets (insertDetails ratio split — the RAW Qty)
    var runLines = src.runLines.filter(function (rl) { return rl.isactive === 'Y' && String(rl.m_distributionrun_id) === RUN; });
    var lines = [];
    runLines.forEach(function (rl) {
      var lid = String(rl.m_distributionlist_id);
      var rt = ratioTotal[lid];
      if (!rt || rt.signum() === 0) return;                                    // RatioTotal<>0
      var prec = uomPrec[String(rl.m_product_id)]; if (prec == null) prec = 0;
      var total = bd(rl.totalqty), rlMin = bd(rl.minqty);
      var details = (llByList[lid] || []).map(function (ll) {
        // rawQty = ll.Ratio / l.RatioTotal * rl.TotalQty  (divide then multiply, generous scale to mirror PG numeric)
        var rawQty = ll.ratio.divide(rt, 20, HALF_UP).multiply(total);
        var minQty = maxBD(rlMin, ll.minqty);                                  // CASE WHEN rl.MinQty>ll.MinQty…
        return {
          listLine: ll.id, bp: ll.bp, loc: ll.loc, ratio: ll.ratio,
          rawQty: rawQty,                                                       // (a) ORACLE-backed value
          minQty: minQty.setScale(prec, HALF_UP),
          qty: rawQty.setScale(prec, HALF_UP)                                   // round() to UOM precision
        };
      });
      lines.push({ runLine: rl.m_distributionrunline_id, product: rl.m_product_id, totalQty: total, precision: prec, details: details });
    });

    // ── allocation loop per runLine (addAllocations / isAllocationEqTotal / adjustAllocation) ───────────────
    lines.forEach(function (L) {
      function actualAllocation(d) { return d.qty.compareTo(d.minQty) > 0 ? d.qty : d.minQty; }   // max(qty,min)
      function canAdjust(d) { return d.qty.compareTo(d.minQty) > 0; }
      function sumAlloc() { return L.details.reduce(function (s, d) { return s.add(actualAllocation(d)); }, BD.ZERO); }
      function maxAlloc() { return L.details.reduce(function (m, d) { var a = actualAllocation(d); return a.compareTo(m) > 0 ? a : m; }, BD.ZERO); }
      // sanity: Σ MinQty must not exceed TotalQty (isActualMinGtTotal → process throws)
      var minSum = L.details.reduce(function (s, d) { return s.add(d.minQty); }, BD.ZERO);
      L.minSumGtTotal = minSum.compareTo(L.totalQty) > 0;

      var lastDiff = BD.ZERO, loops = 0;
      while (sumAlloc().compareTo(L.totalQty) !== 0) {
        var diff = L.totalQty.subtract(sumAlloc());
        var adjustBiggest = diff.abs().compareTo(BD.ONE) <= 0 || diff.abs().compareTo(lastDiff.abs()) === 0;
        if (adjustBiggest) {
          var mx = maxAlloc(), done = false;
          for (var i = 0; i < L.details.length; i++) {
            var d = L.details[i];
            if (actualAllocation(d).compareTo(mx) === 0 && canAdjust(d)) { adjustQty(d, diff); done = true; break; }
          }
          if (!done) { L.cannotAdjust = true; break; }
        } else {
          var rt2 = L.details.filter(canAdjust).reduce(function (s, d) { return s.add(d.ratio); }, BD.ZERO);
          if (rt2.signum() === 0) { L.cannotAdjust = true; break; }
          L.details.forEach(function (d) {
            if (!canAdjust(d)) return;
            var diffRatio = d.ratio.multiply(diff).divide(rt2, 0, HALF_UP);    // divide at dividend scale (=0)
            adjustQty(d, diffRatio);
          });
        }
        lastDiff = diff;
        if (++loops > 10) { L.loopDetected = true; break; }
      }
      // adjustQty: qty += diff, bounded by MinQty floor (max = MinQty - qty)
      function adjustQty(d, difference) {
        var diff = difference.setScale(L.precision, HALF_UP);
        var max = d.minQty.subtract(d.qty);
        if (max.compareTo(diff) > 0) d.qty = d.qty.add(max);                   // would drop below MinQty → clamp
        else d.qty = d.qty.add(diff);
      }
      L.details.forEach(function (d) { d.actualAllocation = actualAllocation(d); });
      L.allocTotal = sumAlloc();
    });
    return lines;
  }

  var API = { foldDistributionRun: foldDistributionRun };
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
  else global.ReportDistributionRun = API;
})(typeof globalThis !== 'undefined' ? globalThis : this);
