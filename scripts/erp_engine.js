// Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
// SPDX-License-Identifier: MIT
/**
 * erp_engine.js — the §0.10 abstract engine, EXTRACTED into one module.
 *   Spec: docs/ERP.md §0.9-0.10 (dispatch-by-form), §0.5 (decision tables),
 *   §18 (edges) + this session's POC findings (settlement = partition+polarity+order).
 *
 * Separation contract (this is the fix for the "engine smeared across probes" debt):
 *   - PURE logic only. No DB binding imported. The host injects `query(sql) -> rows[]`
 *     so the SAME core runs under sql.js (browser) AND better-sqlite3 (node tests).
 *   - No Date.now / Math.random / DOM / network — deterministic (replay/dry-run safe).
 *
 * The engine knows TWO things, per the unified model:
 *   GUARDS  — a predicate over an edge (validation / access / state-legality) -> bool.
 *   GENERATE— a predicate that produces edges (the matcher, derivation verbs) -> ops[].
 * Everything dispatches by `form`.
 */
'use strict';
// UMD (docs/ERP_BACKEND_SEPARATION audit (c): the browser copy is a UMD of THIS file, no silent fork) —
// node: module.exports (unchanged) · browser: window.ERPEngine (the POS lens consumes it, POS_ADDON_SPEC §P-2).
(function (root, factory) {
  var api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root) root.ERPEngine = api;
})(typeof window !== 'undefined' ? window : null, function () {

// ── Gap closers (the two breakages the probe found) ──────────────────────────
// @ctx@ substitution: iDempiere injects record/global context into rule SQL.
function resolveCtx(body, ctx) {
  var miss = [];
  var sql = String(body).replace(/@(#?\w+)@/g, function (m, k) {
    if (ctx[k] != null) { var v = ctx[k]; return typeof v === 'number' ? String(v) : "'" + String(v).replace(/'/g, "''") + "'"; }
    miss.push(k); return 'NULL';
  });
  return { sql: sql, miss: miss };
}
// PG -> SQLite dialect (sql.js is SQLite). Extend as new PG-isms surface.
function dialectShim(sql) {
  return String(sql)
    .replace(/\bleast\s*\(/gi, 'min(')
    .replace(/\bgreatest\s*\(/gi, 'max(')
    .replace(/::[a-z_]+/gi, '');
}

// ── GUARD: evaluate a predicate rule (form=sql) over an edge -> bool ──────────
function evalGuard(query, rule, ctx) {
  if (rule.form !== 'sql') return { ok: true, skipped: 'non-sql guard form=' + rule.form };
  var r = resolveCtx(rule.body, ctx);
  if (r.miss.length) return { ok: false, reason: 'unresolved-ctx', miss: r.miss };
  try {
    var rows = query(dialectShim(r.sql));
    return { ok: true, rows: rows };
  } catch (e) { return { ok: false, reason: 'sql-error', error: e.message }; }
}

// ── GENERATE: the GENERIC matcher — the whole Detail⋈Detail class ────────────
// One function for 3-way-match / allocation / costing / bank-rec. Edges are paired
// within a PARTITION (the trading-partner account, optionally narrowed by role/org
// access), on a KEY, with qty agreeing within TOLERANCE, disambiguated by an ORDERING
// POLICY (FIFO/LIFO/…), greedy first-fit. Returns [[idL,idR],…] — the settlement edges.
//
// opts = {
//   idL, idR        : field names for the line identities to pair
//   keyOf(row)      : the match key (default row.m_product_id)
//   qtyL, qtyR      : qty field names on left/right
//   tol             : qty tolerance (default 1e-4)
//   partition(row)  : the settlement partition key (e.g. row.bp)         REQUIRED
//   orgOf(row)      : the row's org (for access scoping)                 optional
//   allowOrgs       : Set of orgs the role may see; null/absent = all    optional
//   order           : 'FIFO'|'LIFO' over `dateOf`, or a comparator(a,b)  optional
//   dateOf(row)     : the date used by FIFO/LIFO                         optional
//   partial         : false (default) = exact-qty greedy, returns [[idL,idR],…];
//                     true = partial-QUANTITY matching, returns [{l,r,qty},…]   optional
// }
//
// PARTIAL-QUANTITY matching (opts.partial=true) — Implementing docs/ERP.md §0.17/§0.19
//   (settlement re-derivation; bill≠receipt) — Witness: §MATCH-PARTIAL / §ODOO-FOLD-F8.
//   The exact-qty fast path pairs L↔R only when |qtyL−qtyR|≤tol, so receipt(12) vs
//   bill(8) yields NO pair (finding f8, poc_odoo_fold_f8.js). Partial mode pairs
//   min(remainingL, remainingR) and CARRIES the remainder, so over/under-billing and
//   disputed/damaged-goods reconcile to the unit — still emitting the SAME MATCH verb
//   (newVerbs=[]; the bound was matcher BEHAVIOUR, not a new verb). A row may pair more
//   than once (until its remainder drains); partition/key/access/FIFO-LIFO all preserved.
function match(leftRows, rightRows, opts) {
  var keyOf = opts.keyOf || function (r) { return r.m_product_id; };
  var orgOf = opts.orgOf || function () { return null; };
  var dateOf = opts.dateOf || function () { return 0; };
  var tol = opts.tol == null ? 1e-4 : opts.tol;
  var allow = opts.allowOrgs || null;
  function visible(r) { return !allow || allow.has(orgOf(r)); }

  // comparator for disambiguation when >1 candidate matches. Type-agnostic compare so
  // ISO date STRINGS (how dates arrive from sql.js) order correctly, not just numbers.
  function asc(a, b) { var x = dateOf(a), y = dateOf(b); return x < y ? -1 : x > y ? 1 : 0; }
  var cmp = (typeof opts.order === 'function') ? opts.order
    : opts.order === 'LIFO' ? function (a, b) { return -asc(a, b); }
      : opts.order === 'FIFO' ? asc
        : null;

  // group visible right rows by partition.
  var byPart = {};
  rightRows.forEach(function (R, i) {
    if (!visible(R)) return;
    R.__k = i; var p = opts.partition(R);
    (byPart[p] = byPart[p] || []).push(R);
  });
  // process left rows in policy order too (stable, deterministic).
  var lefts = leftRows.filter(visible);
  if (cmp) lefts = lefts.slice().sort(cmp);

  // ── PARTIAL-QUANTITY mode: pair min(qty), carry the remainder (§0.17/§0.19, f8) ──
  if (opts.partial) {
    var rem = {}; // remaining unmatched qty per right row, keyed by __k
    rightRows.forEach(function (R) { if (visible(R)) rem[R.__k] = R[opts.qtyR]; });
    var partPairs = [];
    lefts.forEach(function (L) {
      var lq = L[opts.qtyL];
      var cands = (byPart[opts.partition(L)] || []).filter(function (R) {
        return keyOf(L) === keyOf(R) && rem[R.__k] > tol;
      });
      if (cmp && cands.length > 1) cands = cands.slice().sort(cmp);
      cands.forEach(function (R) {
        if (lq <= tol || rem[R.__k] <= tol) return;
        var m = Math.min(lq, rem[R.__k]);
        partPairs.push({ l: L[opts.idL], r: R[opts.idR], qty: m });
        lq -= m; rem[R.__k] -= m;
      });
    });
    return partPairs;
  }

  // ── EXACT-QTY mode (default, unchanged): greedy first-fit, one R per L ──
  var used = {}, pairs = [];
  lefts.forEach(function (L) {
    var cands = (byPart[opts.partition(L)] || []).filter(function (R) {
      return !used[R.__k] && keyOf(L) === keyOf(R) && Math.abs(L[opts.qtyL] - R[opts.qtyR]) <= tol;
    });
    if (!cands.length) return;
    if (cmp && cands.length > 1) cands = cands.slice().sort(cmp);
    var R = cands[0];
    used[R.__k] = 1;
    pairs.push([L[opts.idL], R[opts.idR]]);
  });
  return pairs;
}

// ── GENERATE: derivation verbs (a BOM derivation = order→child document) ─────
// Verbs return ops[]; the kernel applies + commitOps them (handlers never write).
//
// Implementing ERP_MODEL_ARCHETYPE.md §MOrder — Witness: W-FOLD-BUILDDOC.
// buildDoc is the ARCHETYPE create-verb: stage CREATE_DOCUMENT + CREATE_LINE for a
// child doc, TABLE-PARAMETERISED. This is the single recursion createShipment /
// createInvoice / replenishment-PO all instantiate (FOLD-not-FORK: the two verbs below
// are now spec rows, NOT separate code). A `spec` carries the doc/line tables, the
// parent id field, the per-line source id field, and the qty field MAP (target←source).
//   spec = { docTable, lineTable, parentId, lineParentId, qtyTo, qtyFrom, header?(parent) }
function buildDoc(spec, parent, lines) {
  var doc = { op_type: 'CREATE_DOCUMENT', table: spec.docTable, source_id: parent[spec.parentId] };
  var hdr = spec.header ? spec.header(parent) : null;
  if (hdr) for (var k in hdr) doc[k] = hdr[k];
  var ops = [doc];
  lines.forEach(function (l) {
    var line = { op_type: 'CREATE_LINE', table: spec.lineTable, source_line_id: l[spec.lineParentId], m_product_id: l.m_product_id };
    line[spec.qtyTo] = l[spec.qtyFrom];
    ops.push(line);
  });
  return ops;
}
// The shipped trade verbs, now expressed as buildDoc specs (identical ops out).
var DOC_SPECS = {
  createShipment: { docTable: 'M_InOut', lineTable: 'M_InOutLine', parentId: 'c_order_id', lineParentId: 'c_orderline_id', qtyTo: 'movementqty', qtyFrom: 'qtyordered', header: function (o) { return { movementtype: o.issotrx === 'Y' ? 'C-' : 'V+' }; } },
  createInvoice: { docTable: 'C_Invoice', lineTable: 'C_InvoiceLine', parentId: 'c_order_id', lineParentId: 'c_orderline_id', qtyTo: 'qtyinvoiced', qtyFrom: 'qtyordered', header: function (o) { return { issotrx: o.issotrx }; } }
};
function createShipment(order, lines) { return buildDoc(DOC_SPECS.createShipment, order, lines); }
function createInvoice(order, lines) { return buildDoc(DOC_SPECS.createInvoice, order, lines); }
var VERBS = { createShipment: createShipment, createInvoice: createInvoice };

// ── GENERATE: recursive BOM explosion — backflush = deterministic replay of the BOM ─────────────
// Implementing docs/POSLens.md §6 (AutoBOMOrder backflush) — Witness: W-FOLD-BACKFLUSH.
// The SAME recursive verb that compiles a building, run at point of sale: ring a finished good →
// fold down the recipe → consume leaf components. bomOf(productId) -> [{comp_id, qtybom}] is
// HOST-INJECTED (keeps the engine pure, per the separation contract). A product is a BOM iff
// bomOf returns lines; otherwise it is a LEAF and is consumed. Returns leaf consumption
// { comp_id: qty }, summed over every root→leaf path × the root qty. Cycle-guarded.
function explodeBOM(bomOf, productId, qty, _seen) {
  var lines = bomOf(productId);
  if (!lines || !lines.length) return null;                 // leaf — the caller consumes it
  if (_seen && _seen[productId]) throw new Error('BOM cycle at product ' + productId);
  var seen = Object.assign({}, _seen || {}); seen[productId] = 1;
  var out = {};
  lines.forEach(function (l) {
    var childQty = qty * l.qtybom;
    var sub = explodeBOM(bomOf, l.comp_id, childQty, seen);
    if (sub === null) { out[l.comp_id] = (out[l.comp_id] || 0) + childQty; }   // l is a leaf component
    else { Object.keys(sub).forEach(function (p) { out[p] = (out[p] || 0) + sub[p]; }); } // l is a sub-BOM
  });
  return out;
}

// ── GENERATE: the StorageOnHand qty spine — net on-hand = Σ signed movement ──────────────────────
// Implementing ERP_MODEL_ARCHETYPE.md §MStorageOnHand / §MTransaction — Witness: W-FOLD-QTYONHAND.
// iDempiere stores inventory qty NOWHERE as a master field — it is a FOLD of every MTransaction, and
// MStorageOnHand.qtyonhand is maintained in lockstep. The genuine engine logic is the SIGN CONVENTION:
// a MovementType code carries its polarity in its TRAILING CHAR ('+'=in, '-'=out), so receipt V+ adds and
// shipment C- subtracts the SAME positive line qty. movementSign extracts that; qtyOnHand reconstructs the
// signed contribution from (movementtype, |qty|) — NOT by trusting a pre-signed column — and accumulates
// per partition (product,locator,asi). This is the spine the backflush DECREMENT and replenishment trigger
// ride. Pure: the host injects the event rows; no DB, no clock.
function movementSign(movementtype) {
  var c = String(movementtype || '').slice(-1);
  if (c === '+') return 1;
  if (c === '-') return -1;
  throw new Error('unknown MovementType polarity: ' + movementtype);
}
// events: [{...}]; opts.keyOf(e)->partition key, opts.typeOf(e)->movementtype, opts.absQtyOf(e)->|qty|.
// Returns { key: netQty }. signedOf(e) (optional) lets the caller also collect the per-event signed value
// for an independent sign-rule check.
function qtyOnHand(events, opts) {
  var keyOf = opts.keyOf, typeOf = opts.typeOf, absQtyOf = opts.absQtyOf;
  var out = {};
  events.forEach(function (e) {
    var signed = movementSign(typeOf(e)) * Math.abs(absQtyOf(e));
    var k = keyOf(e);
    out[k] = (out[k] || 0) + signed;
  });
  return out;
}

// ── GENERATE: reverseCorrect / reverseAccrual — the DocAction reversal family ─────────────────────
// Implementing ERP_MODEL_ARCHETYPE.md §Reversal (Doc.reverseCorrectIt / reverseAccrualIt) — Witness: W-FOLD-REVERSE.
// iDempiere's reverseCorrect emits a posting that ANNIHILATES the original document's posting: every Dr leg
// becomes a Cr and vice-versa, on the SAME accounts at the SAME amounts (MFactReversal: Fact.reverse swaps the
// FactLine sides). reverseAccrual is the identical negation booked in the NEXT period — the reversal DATE is
// the ONLY delta (the host supplies it; reverseCorrect keeps the original dateacct). PURE: the host passes the
// document's FORWARD posting (re-derived from source via post_resolver) — this verb NEVER reads the books, so
// "reversal annihilates the real fact_acct" is a genuine test of the rule, not a copy of the oracle. `facts`
// are integer-cents lines [{account, dr, cr}]; returns the swapped lines, carrying the reversal date.
function reversePosting(facts, opts) {
  opts = opts || {};
  return facts.map(function (f) {
    var date = opts.mode === 'accrual'
      ? (opts.reversalDate != null ? opts.reversalDate : null)            // next-period date (host-supplied)
      : (f.dateacct != null ? f.dateacct : (opts.dateacct != null ? opts.dateacct : null)); // correct = same date
    return { account: f.account, dr: f.cr || 0, cr: f.dr || 0, dateacct: date };
  });
}

// ── GENERATE: qtyRollup — the completeIt SIDE-EFFECT onto the PARENT order line ───────────────────
// Implementing docs/ERP_SOURCE_AUDIT_DELTAS.md §A-1 — Witness: W-MORDER-QTYROLLUP.
// iDempiere's completeIt does not only create the child document — it writes the fulfilled qty BACK onto
// the source order line: MInOut.completeIt (MInOut.java:1981/1983) does oLine.setQtyDelivered(±movementqty);
// MInvoice.completeIt (MInvoice.java:2121) does ol.setQtyInvoiced(+qtyinvoiced). buildDoc emits the child
// doc+lines but NOT this writeback, so a partial-fulfillment order's running totals are never reconstructed.
// PURE: given the child fan-out lines (each carrying source_line_id + a qty field) and the target spec, fold
// to ONE UPDATE_FIELD op per touched order line carrying the SUMMED signed delta. The host applies it to the
// parent table. Additive — completeOrder is NOT changed; a caller emits the rollup alongside the fan-out.
//   opt = { idField:'source_line_id', qtyField:'movementqty', table:'C_OrderLine', target:'qtydelivered', sign:1 }
function qtyRollup(childLines, opt) {
  var by = {};
  (childLines || []).forEach(function (l) {
    var id = l[opt.idField];
    if (id == null) return;
    by[id] = (by[id] || 0) + (opt.sign || 1) * Number(l[opt.qtyField] || 0);
  });
  return Object.keys(by).map(function (id) {
    return { op_type: 'UPDATE_FIELD', table: opt.table, id: Number(id), field: opt.target, delta: by[id] };
  });
}

// ── The cell handler: decision-table over policy flags -> verb ops ───────────
// completeOrder = state op + (flag-gated) verb fan-out. The flags are DATA
// (erp_rules DOCPOLICY), the verbs are the small registry above.
function completeOrder(order, lines, policy) {
  var ops = [{ op_type: 'SET_STATUS', table: 'C_Order', id: order.c_order_id, doc_status: 'CO' }];
  if (policy.isautogenerateinout === 'Y') ops = ops.concat(VERBS.createShipment(order, lines));
  if (policy.isautogenerateinvoice === 'Y') ops = ops.concat(VERBS.createInvoice(order, lines));
  return ops;
}

// completeInvoice — the standalone (direct) C_Invoice doc-action. Same shape as completeOrder: ONE state op
// + a config-gated fan-out. Implementing ERP_MODEL_ARCHETYPE.md §MInvoice — Witness: W-FOLD-INVOICE.
// The PO-side delta (MInvoice.completeIt:matchInv, line ~2075): for each vendor-invoice line that references a
// material receipt (`!IsSOTrx && M_InOutLine_ID<>0`) create ONE M_MatchInv junction (invoice-line ⋈ receipt-line
// @ qtyinvoiced). M_MatchInv is a single junction record (NOT a header+lines document), so it rides the existing
// CREATE_LINE kernel op — no buildDoc (which would wrongly emit a doc+line pair), no new engine verb. A sales
// invoice, or a direct PO invoice with no receipt link, emits the bare SET_STATUS CO; the GL posting itself is
// the already-proven Doc_Invoice fold (post_resolver), not re-derived by the doc-action.
function completeInvoice(invoice, lines, policy) {
  var ops = [{ op_type: 'SET_STATUS', table: 'C_Invoice', id: invoice.c_invoice_id, doc_status: 'CO' }];
  if (invoice.issotrx === 'N') {
    (lines || []).forEach(function (l) {
      if (l.m_inoutline_id) ops.push({ op_type: 'CREATE_LINE', table: 'M_MatchInv', c_invoiceline_id: l.c_invoiceline_id, m_inoutline_id: l.m_inoutline_id, m_product_id: l.m_product_id, qty: l.qtyinvoiced });
    });
  }
  return ops;
}

// voidOrder — the C_Order VO doc-action of a SALES order, as ops. Implementing prompts/SQLiteIDEMPIERE.md §33 (S12, fix F4) — Witness: M3 S12.
// Port of MOrder.voidIt (MOrder.java:2680-2760) + createReversals (:2766-2840) + the reversal DOCUMENT shape of MInOut/MInvoice.reverseCorrectIt
// (measured on the legacy pilot 2026-10-09: reversal doc = same type, same order link, quantities/amounts NEGATED, both original and reversal 'RE').
//   per shipment / invoice: CL|RE|VO ⇒ skipped (:2780-2783 / :2810-2813); not CO ⇒ SET_STATUS VO (:2785-2789); CO ⇒ reversal doc + both RE (:2790-2794).
//   per order line with qty≠0: qty 0, linenetamt 0, description += msg + " (" + old + ")" (:2701-2713, line :2709; MOrderLine.addDescription ' | ' join :632-639).
//   order: description += msg (:2733), totallines = grandtotal = 0 (:2745-2746), status VO.
// PURE: the host passes the completed sale (docs with their lines), the AD_Message 'Voided' text (dictionary, never hard-coded) and an id allocator.
//   sale = { order:{c_order_id, description}, lines:[{c_orderline_id, qtyordered, description}],
//            shipments:[{m_inout_id, docstatus, movementtype, lines:[{m_inoutline_id, m_product_id, movementqty, c_orderline_id}]}],
//            invoices:[{c_invoice_id, docstatus, grandtotal, lines:[{c_invoiceline_id, m_product_id, qtyinvoiced, linenetamt, c_orderline_id}]}] }
//   opts = { voidedMsg, newId: function(table) -> id }
function voidOrder(sale, opts) {
  var ops = [], skip = { CL: 1, RE: 1, VO: 1 };
  function neg(v) { return v == null ? v : -Number(v); }
  function addDesc(old, txt) { return old == null || old === '' ? txt : old + ' | ' + txt; }
  (sale.shipments || []).forEach(function (s) {
    if (skip[s.docstatus]) return;
    if (s.docstatus !== 'CO') { ops.push({ op_type: 'SET_STATUS', table: 'M_InOut', id: s.m_inout_id, doc_status: 'VO' }); return; }
    var rid = opts.newId('M_InOut');
    ops.push({ op_type: 'CREATE_DOCUMENT', table: 'M_InOut', source_id: sale.order.c_order_id, m_inout_id: rid, movementtype: s.movementtype, reversal_id: s.m_inout_id });
    (s.lines || []).forEach(function (l) {
      ops.push({ op_type: 'CREATE_LINE', table: 'M_InOutLine', m_inout_id: rid, m_product_id: l.m_product_id, movementqty: neg(l.movementqty), c_orderline_id: l.c_orderline_id, reversalline_id: l.m_inoutline_id });
    });
    ops.push({ op_type: 'SET_STATUS', table: 'M_InOut', id: rid, doc_status: 'RE' });
    ops.push({ op_type: 'UPDATE_FIELD', table: 'M_InOut', id: s.m_inout_id, field: 'reversal_id', value: rid });
    ops.push({ op_type: 'SET_STATUS', table: 'M_InOut', id: s.m_inout_id, doc_status: 'RE' });
  });
  (sale.invoices || []).forEach(function (iv) {
    if (skip[iv.docstatus]) return;
    if (iv.docstatus !== 'CO') { ops.push({ op_type: 'SET_STATUS', table: 'C_Invoice', id: iv.c_invoice_id, doc_status: 'VO' }); return; }
    var rid = opts.newId('C_Invoice');
    ops.push({ op_type: 'CREATE_DOCUMENT', table: 'C_Invoice', source_id: sale.order.c_order_id, c_invoice_id: rid, grandtotal: neg(iv.grandtotal), reversal_id: iv.c_invoice_id });
    (iv.lines || []).forEach(function (l) {
      ops.push({ op_type: 'CREATE_LINE', table: 'C_InvoiceLine', c_invoice_id: rid, m_product_id: l.m_product_id, qtyinvoiced: neg(l.qtyinvoiced), linenetamt: neg(l.linenetamt), c_orderline_id: l.c_orderline_id, reversalline_id: l.c_invoiceline_id });
    });
    (iv.taxes || []).forEach(function (t) {   // §48 (F14): the reversal invoice carries the original's tax rows negated (MInvoice.reverseCorrectIt; pilot S12/S12b)
      ops.push({ op_type: 'CREATE_LINE', table: 'C_InvoiceTax', c_invoice_id: rid, c_tax_id: t.c_tax_id, taxbaseamt: neg(t.taxbaseamt), taxamt: neg(t.taxamt) });
    });
    ops.push({ op_type: 'SET_STATUS', table: 'C_Invoice', id: rid, doc_status: 'RE' });
    ops.push({ op_type: 'UPDATE_FIELD', table: 'C_Invoice', id: iv.c_invoice_id, field: 'reversal_id', value: rid });
    ops.push({ op_type: 'SET_STATUS', table: 'C_Invoice', id: iv.c_invoice_id, doc_status: 'RE' });
  });
  (sale.lines || []).forEach(function (l) {
    if (Number(l.qtyordered) === 0) return;
    ops.push({ op_type: 'UPDATE_LINE', table: 'C_OrderLine', id: l.c_orderline_id, qtyordered: 0, linenetamt: 0,
      description: addDesc(l.description, opts.voidedMsg + ' (' + l.qtyordered + ')') });
  });
  ops.push({ op_type: 'UPDATE_FIELD', table: 'C_Order', id: sale.order.c_order_id, field: 'description', value: addDesc(sale.order.description, opts.voidedMsg) });
  ops.push({ op_type: 'UPDATE_FIELD', table: 'C_Order', id: sale.order.c_order_id, field: 'totallines', value: 0 });
  ops.push({ op_type: 'UPDATE_FIELD', table: 'C_Order', id: sale.order.c_order_id, field: 'grandtotal', value: 0 });
  ops.push({ op_type: 'SET_STATUS', table: 'C_Order', id: sale.order.c_order_id, doc_status: 'VO' });
  return ops;
}

// completeMovement — the Inventory Move doc-action CO as ops. Implementing prompts/SQLiteIDEMPIERE.md §56 (F15) — Witness: M3 MV1.
// Port of MMovement.prepareIt/completeIt (MMovement.java:290-320 no lines ⇒ @NoLines@; :455-520 per STOCKED product line: storage FROM locator −qty, TO locator +qty).
//   movement = { m_movement_id }, lines [{ m_product_id, movementqty, m_locator_id, m_locatorto_id }], opts = { isStocked(pid) → bool (default true), periodCheck() → {ok} (optional, :296-302) }
function completeMovement(movement, lines, opts) {
  opts = opts || {};
  if (opts.periodCheck) { var pc = opts.periodCheck(); if (!pc.ok) return { ok: false, reason: 'PeriodClosed' }; }
  if (!lines || !lines.length) return { ok: false, reason: 'NoLines' };
  var ops = [];
  lines.forEach(function (l) {
    if (opts.isStocked && !opts.isStocked(l.m_product_id)) return;
    ops.push({ op_type: 'MOVE_STOCK', table: 'M_Storage', m_product_id: l.m_product_id, m_locator_id: l.m_locator_id, qty: -Number(l.movementqty) });
    ops.push({ op_type: 'MOVE_STOCK', table: 'M_Storage', m_product_id: l.m_product_id, m_locator_id: l.m_locatorto_id, qty: Number(l.movementqty) });
  });
  ops.push({ op_type: 'SET_STATUS', table: 'M_Movement', id: movement.m_movement_id, doc_status: 'CO' });
  return { ok: true, ops: ops };
}

// ── TAX (prompts/SQLiteIDEMPIERE.md §45, F11) — Witness: M3 T1 + the tax keys of every scenario ─────────────────────────────────────
// Integer-exact decimal helpers (BigInt): amounts in minor units (cents at precision 2); rates as decimal strings.
function _dec(str) { var t = String(str == null ? '0' : str).trim(), neg = t[0] === '-'; if (neg) t = t.slice(1); var p = t.split('.'), f = p[1] || ''; return { n: BigInt((neg ? '-' : '') + (p[0] || '0') + f), k: f.length }; }
function _rhu(n, d) { // HALF_UP (away from zero on .5), d > 0
  var neg = n < 0n, a = neg ? -n : n, q = a / d, r = a % d; if (r * 2n >= d) q += 1n; return neg ? -q : q;
}
// calcTax — MTax.calculateTax (MTax.java:340-367). tax {rate, issummary, c_tax_id}; children(taxId) → child taxes (summary). amount in minor units at `scale`.
function calcTax(tax, amountMinor, included, children) {
  var list = String(tax.issummary) === 'Y' ? (children ? children(tax.c_tax_id) : []) : [tax];
  var a = BigInt(amountMinor), total = 0n;
  list.forEach(function (t) {
    var r = _dec(t.rate); if (r.n === 0n) return;                       // isZeroTax ⇒ 0 (per child too: 0 adds nothing)
    var den = 100n * (10n ** BigInt(r.k));                              // rate/100 = r.n / den
    if (!included) total += _rhu(a * r.n, den);                         // amount × rate/100, HALF_UP at scale (:355-358)
    else {                                                              // base = amount / (1+rate/100) at 12 decimals, tax = amount − base, HALF_UP at scale (:360-365)
      var S = 10n ** 10n, base12 = _rhu(a * S * den, den + r.n); total += _rhu(a * S - base12, S);
    }
  });
  return Number(total);
}
// taxLookup — Tax.getProduct + Tax.get (Tax.java:475-600, 679-697, 723-840). Pure: the host passes every row.
//   inp = { taxes:[c_tax rows of the client], postalsOf(taxId)→[{postal,postal_to,isactive}] (optional), groupHas(groupId,countryId)→bool (optional),
//           taxCategoryId, isSOTrx, billDate 'YYYY-MM-DD', billFrom/billTo/warehouse: {c_country_id,c_region_id,postal}, deliveryViaRule, bpTaxExempt }
function taxLookup(inp) {
  var z = function (v) { return v == null || v === '' ? 0 : Number(v); };
  var taxes = inp.taxes || [];
  if (String(inp.bpTaxExempt) === 'Y') {                               // getExemptTax :679-697 — active IsTaxExempt, highest rate first
    var ex = taxes.filter(function (t) { return String(t.istaxexempt) === 'Y' && String(t.isactive) === 'Y'; })
      .sort(function (a, b) { return Number(b.rate) - Number(a.rate); })[0];
    return ex ? { ok: true, c_tax_id: ex.c_tax_id, via: 'exempt' } : { ok: false, reason: 'TaxNoExemptFound' };
  }
  var from = inp.billFrom, to = inp.billTo;
  if (!inp.isSOTrx) { var tmp = from; from = to; to = tmp; }          // :541-549
  else if (inp.deliveryViaRule === 'P') to = inp.warehouse;            // :550-553 Pickup ⇒ warehouse location
  if (!from || !to) return { ok: false, reason: 'TaxCriteriaNotFound' };
  var keys = ['c_countrygroupfrom_id', 'c_country_id', 'c_region_id', 'c_countrygroupto_id', 'to_country_id', 'to_region_id'];
  var sorted = taxes.slice().sort(function (a, b) {                    // MTax.getAll ORDER BY … ValidFrom DESC (MTax.java:78-80), NULLs last (postgres ASC)
    for (var i = 0; i < keys.length; i++) {
      var x = a[keys[i]], y = b[keys[i]], xn = x == null || x === '', yn = y == null || y === '';
      if (xn && yn) continue; if (xn) return 1; if (yn) return -1; if (Number(x) !== Number(y)) return Number(x) - Number(y);
    }
    return String(b.validfrom || '').localeCompare(String(a.validfrom || ''));
  });
  var sopoOk = function (t) { return !((inp.isSOTrx && t.sopotype === 'P') || (!inp.isSOTrx && t.sopotype === 'S')); };
  var bd = String(inp.billDate).slice(0, 10);
  for (var i = 0; i < sorted.length; i++) {
    var t = sorted[i];
    if (z(t.c_taxcategory_id) !== z(inp.taxCategoryId) || String(t.isactive) !== 'Y' || z(t.parent_tax_id) !== 0) continue;
    if (!sopoOk(t)) continue;
    var grpOk = function (g, c) { return z(g) === 0 || (inp.groupHas ? inp.groupHas(z(g), z(c)) : false); };
    if (grpOk(t.c_countrygroupfrom_id, from.c_country_id) && (z(t.c_country_id) === z(from.c_country_id) || z(t.c_country_id) === 0)
      && (z(t.c_region_id) === z(from.c_region_id) || z(t.c_region_id) === 0)
      && grpOk(t.c_countrygroupto_id, to.c_country_id) && (z(t.to_country_id) === z(to.c_country_id) || z(t.to_country_id) === 0)
      && (z(t.to_region_id) === z(to.c_region_id) || z(t.to_region_id) === 0)
      && !(String(t.validfrom || '').slice(0, 10) > bd)) {
      var post = inp.postalsOf ? (inp.postalsOf(t.c_tax_id) || []) : [];
      if (!post.length) return { ok: true, c_tax_id: t.c_tax_id, via: 'match' };
      for (var j = 0; j < post.length; j++) {
        var pp = post[j];
        if (String(pp.isactive) === 'Y' && String(pp.postal || '').indexOf(String(from.postal || '')) === 0
          && (pp.postal_to == null || String(pp.postal_to).indexOf(String(to.postal || '')) === 0)) return { ok: true, c_tax_id: t.c_tax_id, via: 'postal' };
      }
    }
  }
  for (var d = 0; d < sorted.length; d++) {                            // default tax (:820-832) — NOT filtered by category, exactly as the Java
    var u = sorted[d];
    if (String(u.isdefault) !== 'Y' || String(u.isactive) !== 'Y' || z(u.parent_tax_id) !== 0 || !sopoOk(u)) continue;
    return { ok: true, c_tax_id: u.c_tax_id, via: 'default' };
  }
  return { ok: false, reason: 'TaxNotFound' };
}
// orderTaxes — StandardTaxProvider.calculateOrderTaxTotal (StandardTaxProvider.java:38-110) + MOrderTax.calculateTaxFromLines (MOrderTax.java:312-372).
//   lines [{c_tax_id, linenetamt (decimal string)}], taxById(id) → c_tax row, included = price list IsTaxIncluded. Amounts out in minor units (precision 2).
function orderTaxes(lines, taxById, included, children) {
  var c = function (v) { var r = _dec(v); return Number(r.k <= 2 ? r.n * (10n ** BigInt(2 - r.k)) : _rhu(r.n, 10n ** BigInt(r.k - 2))); };
  var totalLines = 0, seen = [], rows = [];
  lines.forEach(function (l) { totalLines += c(l.linenetamt); var id = Number(l.c_tax_id); if (seen.indexOf(id) < 0) seen.push(id); });
  seen.forEach(function (id) {
    var t = taxById(id); if (!t) { rows.push({ c_tax_id: id, error: 'tax not found' }); return; }
    if (Number(t.c_taxprovider_id || 0)) { rows.push({ c_tax_id: id, error: 'external tax provider not ported' }); return; }
    var parent = Number(t.parent_tax_id || 0), base = 0, amt = 0, doc = String(t.isdocumentlevel) === 'Y';
    lines.forEach(function (l) { if (Number(l.c_tax_id) === id || (parent > 0 && Number(l.c_tax_id) === parent)) { base += c(l.linenetamt); if (!doc) amt += calcTax(t, c(l.linenetamt), included, children); } });
    if (doc) amt = calcTax(t, base, included, children);
    rows.push({ c_tax_id: id, taxbaseamt: included ? base - amt : base, taxamt: amt });
  });
  var out = [], grand = totalLines;
  rows.forEach(function (r) {
    if (r.error) { out.push(r); return; }
    var t = taxById(r.c_tax_id);
    if (String(t.issummary) === 'Y') {                                  // :75-99 one row per child, the summary row deleted
      (children ? children(r.c_tax_id) : []).forEach(function (ch) { var a = calcTax(ch, r.taxbaseamt, false, children); out.push({ c_tax_id: ch.c_tax_id, taxbaseamt: r.taxbaseamt, taxamt: a }); if (!included) grand += a; });
    } else { out.push(r); if (!included) grand += r.taxamt; }
  });
  return { rows: out, totalLines: totalLines, grandTotal: grand };
}

// acctSetupGap — which ACTIVE accounting schemas have no product-category accounting row for a category. Implementing prompts/SQLiteIDEMPIERE.md §43 (S5, F10).
// Legacy: MOrder.prepareIt ASI loop (MOrder.java:1633-1637) → MProduct.isASIMandatoryFor over every active client schema (MProduct.java:1028-1037) → getCostingLevel →
// MProductCategoryAcct.get(...) null ⇒ NPE (MProduct.java:1066-1067): the order cannot be prepared. SQLite refuses with a NAMED error instead (same outcome). Pure.
function acctSetupGap(categoryId, activeSchemaIds, categoryAcctRows) {
  var have = {}; (categoryAcctRows || []).forEach(function (r) { if (String(r.m_product_category_id) === String(categoryId)) have[String(r.c_acctschema_id)] = true; });
  return (activeSchemaIds || []).filter(function (sid) { return !have[String(sid)]; });
}

// periodOpen — MPeriod.isOpen(DateAcct, DocBaseType, Org) as a pure function. Implementing prompts/SQLiteIDEMPIERE.md §42 (F7) — Witness: M3 S8c.
// data = { schema: { autoperiodcontrol, period_openhistory, period_openfuture } (client primary schema),
//          periods: [{ c_period_id, startdate, enddate, isactive, periodtype, control: { <DocBaseType>: <PeriodStatus> } }] (the org calendar's periods) }
// MPeriod.get (MPeriod.java:180-195): standard ('S') ACTIVE period with TRUNC(StartDate) <= date <= TRUNC(EndDate); none ⇒ closed (:304-308).
// Auto period control (:735-770): open iff today-history <= date <= today+future. Else C_PeriodControl status 'O' for the DocBaseType (:772-785, MPeriodControl.java:157-164).
// Dates as 'YYYY-MM-DD…' strings; today supplied by the host (legacy: the server clock).
function periodOpen(data, dateAcct, docBaseType, today) {
  var d = String(dateAcct).slice(0, 10);
  if (!docBaseType) return { ok: false, reason: 'no-docbasetype' };
  var p = (data.periods || []).filter(function (x) {
    return String(x.isactive) === 'Y' && String(x.periodtype || 'S') === 'S' && String(x.startdate).slice(0, 10) <= d && d <= String(x.enddate).slice(0, 10);
  })[0];
  if (!p) return { ok: false, reason: 'period-closed', why: 'no period for ' + d };
  var sc = data.schema || {};
  if (String(sc.autoperiodcontrol) === 'Y') {
    var t = Date.UTC(+today.slice(0, 4), +today.slice(5, 7) - 1, +today.slice(8, 10)), day = 86400000;
    var first = new Date(t - Number(sc.period_openhistory || 0) * day).toISOString().slice(0, 10);
    var last = new Date(t + Number(sc.period_openfuture || 0) * day).toISOString().slice(0, 10);
    if (d < first) return { ok: false, reason: 'period-closed', why: 'before first day ' + first };
    if (d > last) return { ok: false, reason: 'period-closed', why: 'after last day ' + last };
    return { ok: true, c_period_id: p.c_period_id };
  }
  var st = p.control && p.control[docBaseType];
  if (st == null) return { ok: false, reason: 'period-closed', why: 'no period control for ' + docBaseType };
  return st === 'O' ? { ok: true, c_period_id: p.c_period_id } : { ok: false, reason: 'period-closed', why: 'status ' + st };
}

// priceAt — the price-list VERSION valid at a date. Implementing prompts/SQLiteIDEMPIERE.md §41 (F8) — Witness: M3 S8b/S8d.
// Port of MProductPricing.calculatePL (MProductPricing.java:236-300): rows = the product's prices in ACTIVE versions of ONE price list (active price rows),
// each { validfrom, pricestd, pricelist, pricelimit }; ordered ValidFrom DESC, the first with ValidFrom <= date (null ValidFrom always qualifies) wins; none ⇒ null.
// date: 'YYYY-MM-DD…' (the order's DateOrdered; the caller passes today when the order has none, :262-263). Pure.
function priceAt(rows, date) {
  var d = String(date).slice(0, 10);
  var sorted = (rows || []).slice().sort(function (a, b) { return String(b.validfrom || '').localeCompare(String(a.validfrom || '')); });
  for (var i = 0; i < sorted.length; i++) {
    var vf = sorted[i].validfrom;
    if (vf == null || String(vf).slice(0, 10) <= d) return sorted[i];
  }
  return null;
}

// creditCheckOrder — the SO credit gate of MOrder.prepareIt. Implementing prompts/SQLiteIDEMPIERE.md §36 (S13, fix F5) — Witness: M3 S13a/b/c.
// Port of CreditManagerOrder.checkCreditStatus (CreditManagerOrder.java:48-98) + MBPartner.getSOCreditStatus(additionalAmt) (MBPartner.java:826-850).
//   order = { issotrx, docsubtypeso, paymentrule, grandtotal (base currency) }, bp = { socreditstatus, so_creditlimit, totalopenbalance },
//   sys = { CHECK_CREDIT_ON_CASH_POS_ORDER, CHECK_CREDIT_ON_PREPAY_ORDER } ('Y'|'N'; absent ⇒ true, MSysConfig.getBooleanValue default).
// Returns { ok:true } or { ok:false, reason:'credit-stop'|'credit-hold'|'credit-over-hold', msg, … } — the LAST matching branch wins, as in the Java (errorMsg overwritten).
function creditCheckOrder(order, bp, sys) {
  sys = sys || {};
  var on = function (k) { return sys[k] == null ? true : String(sys[k]) === 'Y'; };
  if (String(order.issotrx) !== 'Y') return { ok: true };
  if (order.docsubtypeso === 'WR' && order.paymentrule === 'B' && !on('CHECK_CREDIT_ON_CASH_POS_ORDER')) return { ok: true, skipped: 'cash-pos' };
  if (order.docsubtypeso === 'PR' && !on('CHECK_CREDIT_ON_PREPAY_ORDER')) return { ok: true, skipped: 'prepay' };
  var gt = Number(order.grandtotal || 0);
  if (!(gt > 0) || !bp) return { ok: true };
  var st = bp.socreditstatus, lim = Number(bp.so_creditlimit || 0), open = Number(bp.totalopenbalance || 0), err = null;
  if (st === 'S') err = { reason: 'credit-stop', msg: 'BPartnerCreditStop' };
  if (st === 'H') err = { reason: 'credit-hold', msg: 'BPartnerCreditHold' };
  var withAdd = (st === 'X' || st === 'S' || lim === 0) ? st : ((lim - gt) < open ? 'H' : st);
  if (withAdd === 'H') err = { reason: 'credit-over-hold', msg: 'BPartnerOverOCreditHold' };
  return err ? { ok: false, reason: err.reason, msg: err.msg, totalOpenBalance: open, grandTotal: gt, creditLimit: lim } : { ok: true };
}

return {
  resolveCtx: resolveCtx, dialectShim: dialectShim, evalGuard: evalGuard, voidOrder: voidOrder, completeMovement: completeMovement, creditCheckOrder: creditCheckOrder, priceAt: priceAt, periodOpen: periodOpen, acctSetupGap: acctSetupGap, calcTax: calcTax, taxLookup: taxLookup, orderTaxes: orderTaxes,
  match: match, buildDoc: buildDoc, DOC_SPECS: DOC_SPECS, explodeBOM: explodeBOM,
  movementSign: movementSign, qtyOnHand: qtyOnHand, reversePosting: reversePosting,
  qtyRollup: qtyRollup,
  VERBS: VERBS, completeOrder: completeOrder, completeInvoice: completeInvoice
};
});
