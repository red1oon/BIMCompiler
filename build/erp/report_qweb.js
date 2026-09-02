// Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
// SPDX-License-Identifier: MIT
// report_qweb.js — foldQWeb: Odoo QWeb report def → print-tree manifest. Implementing ReportingFold.md §5 —
// Witness: W-ODOO-QWEB (scripts/poc_fold_qweb.js).
//
// PROVENANCE (ERP_IDEMPIERE_UX_PARITY.md §TWIN-CLASSIFIED, 2026-09-02): this function lived VERBATIM inside
// build/erp/report_overlay.js (lines 497-577 of the pre-reconcile copy) and was never shipped — bim-ootb erp/ has
// no QWeb consumer. It is a bim-compiler research fold, so it lives here as a COPY-ONLY module (the same class as
// gen_ad_odoo.js / wh_route.js / report_*.js — W-ERP-TWIN reports it NO-SHIP), which lets report_overlay.js be
// byte-identical to the file that ships. NOTHING HERE IS NEW: the body below is the moved code, unchanged; only
// the wrapper (the same BD/money2 leaf lines report_overlay.js carries) was added so it stands alone.
(function (global) {
  'use strict';

  // Same money leaf as report_overlay.js: BigDecimal is loaded before this file in a browser; under node the
  // witness requires it. money2 — exact 2dp HALF_UP, carried as a STRING (never re-enters Number).
  var BD = (typeof BigDecimal !== 'undefined') ? BigDecimal
         : (typeof require === 'function' ? require('./bigdecimal.js') : null);
  function money2(b) { return b == null ? null : b.setScale(2, BD.RoundingMode.HALF_UP).toString(); }

  // foldQWeb — Odoo QWeb report def → print-tree manifest. Implementing ReportingFold.md §5 — Witness: W-ODOO-QWEB
  //
  // Declarative subset only: t-foreach line loop + t-field bindings + BigDecimal totals.
  // Python t-set expressions, t-if conditionals, widget options are traversed for field discovery but not
  // evaluated — the fold computes what the loop WOULD sum from real data, non-invent.
  //
  // PURE: no DB/clock/DOM. foldQWeb(reportKey, viewIndex, lineRows) -> manifest | null
  //   - reportKey:  the ir.actions.report.report_name key (e.g. 'account.report_invoice')
  //   - viewIndex:  {key: {arch, model}} built from qweb_view table
  //   - lineRows:   the document's line records [{field: value, ...}] — host-injected, non-invent
  // Output: { format, fields, rows, breaks:{groups,total}, foldsFrom:'qweb' }
  //   compatible with the renderPrint manifest shape (fields + rows + breaks.total).
  function foldQWeb(reportKey, viewIndex, lineRows) {
    viewIndex = viewIndex || {}; lineRows = lineRows || [];

    // follow t-call chain until we find the template that carries the LINE loop (not the outer docs loop)
    // t-foreach="docs" is always the outermost document-set loop — skip it and keep descending
    function hasLineLoop(arch) {
      var re = /t-foreach="([^"]+)"/g, m;
      while ((m = re.exec(arch)) !== null) { if (m[1] !== 'docs') return true; }
      return false;
    }
    function findBody(key, visited) {
      if (!key || visited[key]) return null;
      visited[key] = 1;
      var v = viewIndex[key]; if (!v) return null;
      if (hasLineLoop(v.arch)) return { key: key, arch: v.arch };
      var re = /t-call="([^"]+)"/g, m;
      while ((m = re.exec(v.arch)) !== null) {
        var found = findBody(m[1], visited);
        if (found) return found;
      }
      return null;
    }
    var body = findBody(reportKey, {});
    if (!body) return null;

    // extract t-foreach alias (e.g. t-foreach="lines" t-as="line" → lineAlias='line')
    var feMatch = body.arch.match(/t-foreach="([^"]+)"\s+t-as="([^"]+)"/);
    var lineAlias = feMatch ? feMatch[2] : 'line';

    // collect all t-field / t-out / t-esc bindings scoped to the line alias
    var lineFieldSet = {};
    var lfRe = new RegExp('t-(?:field|out|esc)="' + lineAlias + '\\.(\\w+)"', 'g');
    var fm; while ((fm = lfRe.exec(body.arch)) !== null) lineFieldSet[fm[1]] = 1;

    // also capture t-set accumulators: t-value="... + line.FIELD" → reveals summed money cols
    var acRe = new RegExp('[+\\s]' + lineAlias + '\\.(\\w+)', 'g');
    while ((fm = acRe.exec(body.arch)) !== null) lineFieldSet[fm[1]] = 1;

    var lineFields = Object.keys(lineFieldSet);
    var MONEY_COLS = { price_subtotal:1, price_total:1, price_unit:1, quantity:1, discount:1,
                       linenetamt:1, priceactual:1, qtyordered:1 };
    var moneyFields = lineFields.filter(function (f) { return MONEY_COLS[f] || MONEY_COLS[f.toLowerCase()]; });

    // fold line rows: accumulate totals via BigDecimal (NON-INVENT — every value is from host lineRows)
    var totals = {};
    moneyFields.forEach(function (f) { totals[f] = BD.ZERO; });
    var outRows = lineRows.map(function (r) {
      var cells = {};
      lineFields.forEach(function (f) { cells[f] = r[f] != null ? r[f] : (r[f.toLowerCase()] != null ? r[f.toLowerCase()] : null); });
      moneyFields.forEach(function (f) {
        var v = cells[f]; if (v == null || v === '') return;
        totals[f] = totals[f].add(BD.of(String(v)));
      });
      return { cells: cells, children: [] };
    });

    var totalCells = {};
    moneyFields.forEach(function (f) { totalCells[f] = money2(totals[f]); });

    return {
      format: { reportKey: reportKey, model: (viewIndex[reportKey] || {}).model || null, bodyKey: body.key },
      fields: lineFields.map(function (f) { return { name: f, column: f, isMoney: !!(MONEY_COLS[f] || MONEY_COLS[f.toLowerCase()]) }; }),
      rows: outRows,
      breaks: { groups: [], total: totalCells },
      foldsFrom: 'qweb'
    };
  }

  var API = { foldQWeb: foldQWeb };
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
  global.ReportQWeb = API;
})(typeof window !== 'undefined' ? window : this);
