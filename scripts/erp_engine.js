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

// completePayment — C_Payment CO with the invoice allocation. Implementing prompts/SQLiteIDEMPIERE.md §57 (F16) — Witness: M3 PAY1.
// MPayment.completeIt → allocateIt (MPayment.java:2298-2304) → allocateInvoice (:2369-2420); MInvoice.testAllocation (:1433-1455); MPayment.testAllocation (:966-982).
//   pay = { c_payment_id, c_bpartner_id, c_invoice_id, payamt, isreceipt, discountamt, writeoffamt, overunderamt, c_currency_id, dateacct }
//   invoice = { c_invoice_id, grandtotal, issotrx ('Y' default), iscreditmemo, allocatedamt (already allocated, default 0), dateacct }   opts = { newId() }
function completePayment(pay, invoice, opts) {
  var c = function (v) { return Math.round(Number(v || 0) * 100); };
  var ops = [{ op_type: 'SET_STATUS', table: 'C_Payment', id: pay.c_payment_id, doc_status: 'CO' }];
  if (!pay.c_invoice_id) return { ok: true, ops: ops };                        // payment-selection / order / multi-allocation paths not ported (stated)
  if (!invoice) return { ok: false, reason: 'invoice not found' };
  var amt = c(pay.payamt), over = c(pay.overunderamt);
  if (over < 0 && amt > 0) amt += over;                                         // :2373-2375 overpayment (negative)
  var sign = String(pay.isreceipt) === 'N' ? -1 : 1;                            // :2386-2391 AP negated
  var hid = opts.newId();
  var da = [pay.dateacct, invoice.dateacct].filter(Boolean).sort().pop() || null;   // :2380-2382 header DateAcct = later of payment/invoice
  ops.push({ op_type: 'CREATE_DOCUMENT', table: 'C_AllocationHdr', c_allocationhdr_id: hid, c_currency_id: pay.c_currency_id, dateacct: da });
  ops.push({ op_type: 'CREATE_LINE', table: 'C_AllocationLine', c_allocationline_id: hid * 10 + 1, c_allocationhdr_id: hid, c_payment_id: pay.c_payment_id, c_invoice_id: invoice.c_invoice_id,
    c_bpartner_id: pay.c_bpartner_id, amount: sign * amt / 100, discountamt: sign * c(pay.discountamt) / 100, writeoffamt: sign * c(pay.writeoffamt) / 100, overunderamt: sign * over / 100 });
  ops.push({ op_type: 'SET_STATUS', table: 'C_AllocationHdr', id: hid, doc_status: 'CO' });
  var invAlloc = c(invoice.allocatedamt) + sign * (amt + c(pay.discountamt) + c(pay.writeoffamt)) * (String(invoice.issotrx) === 'N' ? -1 : 1);
  var total = c(invoice.grandtotal) * (String(invoice.issotrx) === 'N' ? -1 : 1) * (String(invoice.iscreditmemo) === 'Y' ? -1 : 1);
  if (Math.abs(invAlloc) === Math.abs(total)) ops.push({ op_type: 'UPDATE_FIELD', table: 'C_Invoice', id: invoice.c_invoice_id, field: 'ispaid', value: 'Y' });
  if (amt === c(pay.payamt)) ops.push({ op_type: 'UPDATE_FIELD', table: 'C_Payment', id: pay.c_payment_id, field: 'isallocated', value: 'Y' });
  return { ok: true, ops: ops };
}

// prepareInvoice — a stand-alone (direct) invoice: line pricing, line tax, invoice tax rows, totals, as ops. Implementing prompts/SQLiteIDEMPIERE.md §58 (F17) — Witness: M3 INV1/INV2.
// MInvoiceLine.beforeSave (MInvoiceLine.java:877-950): price from the invoice's price list at DateInvoiced when PriceActual = PriceList = 0 (:899-903) — NO price-list refusal for invoices (unlike
// MOrderLine :846-849), an unpriced product stays at 0; tax via Tax.get when C_Tax_ID = 0 (:917-918); LineNetAmt = PriceEntered × QtyEntered HALF_UP (:941); totals = StandardTaxProvider.calculateInvoiceTaxTotal
// (StandardTaxProvider.java:166-230 — the order algorithm, `orderTaxes`). ctx = { priceOf(pid, date), taxOf(pid) → {ok,c_tax_id}, taxById, taxChildren, taxIncluded, mutCents (test only) }.
function prepareInvoice(hdr, lines, ctx) {
  var out = [], ops = [{ op_type: 'CREATE_DOCUMENT', table: 'C_Invoice', c_invoice_id: hdr.c_invoice_id, issotrx: hdr.issotrx, c_bpartner_id: hdr.c_bpartner_id, dateinvoiced: hdr.dateinvoiced }];
  for (var i = 0; i < lines.length; i++) {
    var l = lines[i], p = ctx.priceOf(l.m_product_id, hdr.dateinvoiced), price = p && p.pricestd != null ? String(p.pricestd) : '0';
    var t = ctx.taxOf(l.m_product_id); if (!t || !t.ok) return { ok: false, reason: 'TaxNotFound', m_product_id: l.m_product_id };
    var pd = _dec(price), qd = _dec(l.qtyinvoiced), net = Number(_rhu(pd.n * qd.n * 100n, 10n ** BigInt(pd.k + qd.k))) + (i === 0 ? (ctx.mutCents || 0) : 0);
    var line = { c_invoiceline_id: l.c_invoiceline_id, m_product_id: l.m_product_id, qtyinvoiced: l.qtyinvoiced, priceactual: price, linenetamt: (net / 100).toFixed(2), c_tax_id: t.c_tax_id };
    out.push(line); ops.push(Object.assign({ op_type: 'CREATE_LINE', table: 'C_InvoiceLine', c_invoice_id: hdr.c_invoice_id }, line));
  }
  var r = orderTaxes(out, ctx.taxById, !!ctx.taxIncluded, ctx.taxChildren);
  var bad = r.rows.filter(function (x) { return x.error; })[0]; if (bad) return { ok: false, reason: 'tax-error', detail: bad.error };
  r.rows.forEach(function (x) { ops.push({ op_type: 'CREATE_LINE', table: 'C_InvoiceTax', c_invoice_id: hdr.c_invoice_id, c_tax_id: x.c_tax_id, taxbaseamt: x.taxbaseamt / 100, taxamt: x.taxamt / 100 }); });
  ops.push({ op_type: 'UPDATE_FIELD', table: 'C_Invoice', id: hdr.c_invoice_id, field: 'totallines', value: r.totalLines / 100 });
  ops.push({ op_type: 'UPDATE_FIELD', table: 'C_Invoice', id: hdr.c_invoice_id, field: 'grandtotal', value: r.grandTotal / 100 });
  return { ok: true, ops: ops, lines: out, taxes: r.rows, totalLines: r.totalLines, grandTotal: r.grandTotal };
}

// completeInventory — M_Inventory CO as ops. Implementing prompts/SQLiteIDEMPIERE.md §59 (F18) — Witness: M3 PI1/PI2.
// MInventory.completeIt (MInventory.java:525-540): per line qtyDiff = QtyCount − QtyBook (Physical Inventory) or −QtyInternalUse (Internal Use); 0 ⇒ no movement (:587);
// storage at the line locator += qtyDiff. No lines ⇒ @NoLines@ (prepareIt). inventory = { m_inventory_id, docsubtypeinv 'PI'|'IU' }.
function completeInventory(inventory, lines, opts) {
  opts = opts || {};
  if (!lines || !lines.length) return { ok: false, reason: 'NoLines' };
  var ops = [];
  lines.forEach(function (l) {
    var diff = inventory.docsubtypeinv === 'IU' ? -Number(l.qtyinternaluse || 0) : Number(l.qtycount || 0) - Number(l.qtybook || 0);
    if (diff === 0 || (opts.isStocked && !opts.isStocked(l.m_product_id))) return;
    ops.push({ op_type: 'MOVE_STOCK', table: 'M_Storage', m_product_id: l.m_product_id, m_locator_id: l.m_locator_id, qty: diff });
  });
  ops.push({ op_type: 'SET_STATUS', table: 'M_Inventory', id: inventory.m_inventory_id, doc_status: 'CO' });
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

// ── ORDER-LINE QUANTITIES (prompts/SQLiteIDEMPIERE.md §64.1, F20) — Witness: M3 cycle O2C1..O2C6 key ol_qty ───────────────────────────
// Each verb returns UPDATE_LINE ops on C_OrderLine with the new qtyreserved / qtydelivered / qtyinvoiced; lines = the order lines {c_orderline_id, m_product_id, qtyordered,
// qtyreserved, qtydelivered, qtyinvoiced}. Quantities are plain numbers (UOM precision is the host's).
// orderReserve — MOrder.reserveStock (MOrder.java:1930-2023): target = QtyOrdered when the document is binding (not a proposal, not being voided) else 0;
// difference = max(target − QtyDelivered, 0) − QtyReserved; nothing when difference = 0, or when QtyOrdered < 0 and nothing is reserved; QtyOrdered < 0 with a
// reservation ⇒ release it all; product lines only (charges have no product). order = { binding (default true) }.
function orderReserve(order, lines) {
  var ops = [], binding = order.binding !== false;
  (lines || []).forEach(function (l) {
    if (!l.m_product_id) return;
    var ordered = Number(l.qtyordered || 0), res = Number(l.qtyreserved || 0), del = Number(l.qtydelivered || 0);
    var target = binding ? ordered : 0, diff = (target > del ? target - del : 0) - res;
    if (diff === 0 || ordered < 0) {
      if (diff === 0 || res === 0) return;
      if (ordered < 0 && res > 0) diff = -res;
    }
    ops.push({ op_type: 'UPDATE_LINE', table: 'C_OrderLine', id: l.c_orderline_id, qtyreserved: res + diff });
  });
  return { ok: true, ops: ops };
}
// inoutOrderLineEffects — MInOut.completeIt per line (MInOut.java:1686-1690 Qty = MovementQty, negated for a '-' movement; :1959-1971 reservation; :1973-1985 delivered):
// QtyOrdered >= 0 ⇒ QtyReserved −= MovementQty, floored at 0, and 0 when QtyDelivered already exceeds QtyOrdered; SO (or no product) ⇒ QtyDelivered −= Qty (SO) / += Qty.
// The same rule completes a reversal (its lines carry the negated MovementQty), which is how a Reverse-Correct restores the reservation. Closed orders are skipped (opts.orderClosed).
function inoutOrderLineEffects(inout, sLines, orderLines, opts) {
  opts = opts || {};
  var ops = [], by = {};
  (orderLines || []).forEach(function (l) { by[l.c_orderline_id] = { c_orderline_id: l.c_orderline_id, qtyordered: Number(l.qtyordered || 0), qtyreserved: Number(l.qtyreserved || 0), qtydelivered: Number(l.qtydelivered || 0) }; });
  (sLines || []).forEach(function (s) {
    var o = by[s.c_orderline_id]; if (!o) return;
    var mq = Number(s.movementqty || 0), qty = String(inout.movementtype).charAt(1) === '-' ? -mq : mq;
    if (s.m_product_id && !opts.orderClosed && o.qtyordered >= 0) {
      o.qtyreserved -= mq;
      if (o.qtyreserved < 0) o.qtyreserved = 0; else if (o.qtydelivered > o.qtyordered) o.qtyreserved = 0;
    }
    if (String(inout.issotrx) === 'Y' || !s.m_product_id) o.qtydelivered = String(inout.issotrx) === 'Y' ? o.qtydelivered - qty : o.qtydelivered + qty;
    ops.push({ op_type: 'UPDATE_LINE', table: 'C_OrderLine', id: o.c_orderline_id, qtyreserved: o.qtyreserved, qtydelivered: o.qtydelivered });
  });
  return { ok: true, ops: ops };
}
// invoiceOrderLineEffects — MInvoice.completeIt (MInvoice.java:2111-2125): an invoice line linked to an order line, on a sales invoice (or without product) ⇒
// QtyInvoiced += QtyInvoiced (credit memo: −). A reversal invoice completes with negated quantities, so the same rule undoes it. Purchase lines go through MatchPO (not here).
function invoiceOrderLineEffects(invoice, iLines, orderLines) {
  var ops = [], by = {};
  (orderLines || []).forEach(function (l) { by[l.c_orderline_id] = { c_orderline_id: l.c_orderline_id, qtyinvoiced: Number(l.qtyinvoiced || 0) }; });
  (iLines || []).forEach(function (il) {
    var o = by[il.c_orderline_id]; if (!o) return;
    if (!(String(invoice.issotrx) === 'Y' || !il.m_product_id)) return;
    var q = Number(il.qtyinvoiced || 0); o.qtyinvoiced += String(invoice.iscreditmemo) === 'Y' ? -q : q;
    ops.push({ op_type: 'UPDATE_LINE', table: 'C_OrderLine', id: o.c_orderline_id, qtyinvoiced: o.qtyinvoiced });
  });
  return { ok: true, ops: ops };
}

// ── FIXED ASSETS (prompts/SQLiteIDEMPIERE.md §63, F19) — Witness: scripts/bridge/witness_fa_gap.js (FA1, FA0, FA-REJ*, NEG) ──────────────────
// Pure ports of the legacy asset lifecycle. Amounts are integers in MINOR units (cents, precision 2 — MDepreciation.m_precision=2, MDepreciation.java:103);
// dates are 'YYYY-MM-DD' strings. The host supplies the rows and persists what comes back (no DB binding here).
function _faMonthEnd(date, addMonths) {   // TimeUtil.getMonthLastDay(TimeUtil.addMonths(date, n)) — the day never matters after the month end
  var d = String(date).slice(0, 10), y = +d.slice(0, 4), m = +d.slice(5, 7) + (addMonths || 0);
  y += Math.floor((m - 1) / 12); m = ((m - 1) % 12 + 12) % 12 + 1;
  return y + '-' + (m < 10 ? '0' : '') + m + '-' + new Date(Date.UTC(y, m, 0)).getUTCDate();
}
function _faMonth(date) { return String(date).slice(0, 7); }
function _faDiv(numMinor, periods) {      // BigDecimal.divide(periods, 2, HALF_UP) on a minor-unit amount
  var n = BigInt(numMinor), d = BigInt(periods); if (d < 0n) { n = -n; d = -d; } return Number(_rhu(n, d));
}
// MDepreciation.invoke (MDepreciation.java:222-279) for the types ported here; anything else is refused by NAME (never guessed).
// SL = apply_SL (:330-341): (cost − salvage − accum) / (life − (period − 1)), 0 when no remaining periods. ARH_ZERO = apply_ARH_ZERO (:316-320) = 0.
var _FA_TYPES = { SL: true, ARH_ZERO: true };
function _faInvoke(type, life, period, costMinor, accumMinor) {
  if (type === 'ARH_ZERO') return 0;
  var rp = life - (period - 1);
  return rp !== 0 ? _faDiv(costMinor - accumMinor, rp) : 0;
}
function _faRequireLast(type) { return type !== 'ARH_ZERO'; }   // MDepreciation.requireLastPeriodAdjustment (:196-199)

// faRegisterAsset — MAsset.afterSave new record (MAsset.java:426-456). group = A_Asset_Group row, groupAccts = ALL its A_Asset_Group_Acct rows
// (MAssetGroupAcct.forA_Asset_Group_ID :78-90, no active filter). Per row with org 0 or the asset org: an A_Asset_Acct copy (MAssetAcct(asset, grpacct)
// MAssetAcct.java:194-211: all group values, A_Period_Start 1, A_Period_End = asset UseLifeMonths) and a workfile whose use life is the GROUP's
// (:446-449 overwrite the asset's own life), A_Life_Period = UseLifeMonths (MDepreciationWorkfile.beforeSave :146-151), cost/accum/period 0.
function faRegisterAsset(asset, group, groupAccts) {
  if (!group) return { ok: false, reason: 'unknown-asset-group' };
  var a = {}; for (var k in asset) a[k] = asset[k];
  a.a_asset_status = 'NW'; a.isdepreciated = group.isdepreciated; a.isowned = group.isowned;   // :430-436
  var accts = [], workfiles = [];
  (groupAccts || []).forEach(function (g) {
    if (!(Number(g.ad_org_id) === 0 || Number(g.ad_org_id) === Number(asset.ad_org_id))) return;
    var acct = {}; for (var c in g) acct[c] = g[c];
    acct.a_asset_id = asset.a_asset_id; acct.ad_org_id = asset.ad_org_id; acct.a_period_start = 1; acct.a_period_end = Number(asset.uselifemonths || 0);
    accts.push(acct);
    workfiles.push({ a_asset_id: asset.a_asset_id, ad_org_id: asset.ad_org_id, c_acctschema_id: g.c_acctschema_id, postingtype: g.postingtype || 'A', isdepreciated: group.isdepreciated,
      a_asset_cost: 0, a_qty_current: 0, a_accumulated_depr: 0, a_accumulated_depr_f: 0, a_salvage_value: 0, a_current_period: 0, dateacct: null, assetdepreciationdate: null,
      uselifemonths: Number(g.uselifemonths || 0), uselifemonths_f: Number(g.uselifemonths_f || 0), a_life_period: Number(g.uselifemonths || 0), a_life_period_f: Number(g.uselifemonths_f || 0),
      a_asset_remaining: 0, a_asset_remaining_f: 0, processed: 'N' });
  });
  return { ok: true, asset: a, accts: accts, workfiles: workfiles };
}

// faBuildDepreciation — MDepreciationWorkfile.buildDepreciation (MDepreciationWorkfile.java:649-785) with NO IDepreciationMethod factory (none ships in
// core: Core.getDepreciationMethod returns null, Core.java:811-838). The host deletes the workfile's UNPROCESSED rows with A_Period >= current first
// (truncDepreciation :791-808). acct = the asset acct of the workfile's schema; typeOf(a_depreciation_id) → DepreciationType.
function faBuildDepreciation(wk, acct, typeOf) {
  if (String(wk.isdepreciated) !== 'Y') return { ok: true, rows: [] };
  var tC = typeOf(acct.a_depreciation_id), tF = typeOf(acct.a_depreciation_f_id);
  if (!_FA_TYPES[tC] || !_FA_TYPES[tF]) return { ok: false, reason: 'depreciation-type-not-ported:' + (!_FA_TYPES[tC] ? tC : tF) };
  var cost = Number(wk.a_asset_cost) - Number(wk.a_salvage_value || 0);   // getActualCost
  var accC = Number(wk.a_accumulated_depr || 0), accF = Number(wk.a_accumulated_depr_f || 0);
  var lifeC = Number(wk.uselifemonths || 0), lifeF = Number(wk.uselifemonths_f || 0), life = lifeC > lifeF ? lifeC : lifeF;
  var cur = Number(wk.a_current_period || 0), start = wk.dateacct, dd = wk.assetdepreciationdate;
  if (dd && String(dd).slice(0, 10) >= String(wk.dateacct).slice(0, 10)) {   // :706-717
    if (_faMonthEnd(start) === String(dd).slice(0, 10)) { start = _faMonthEnd(dd, 1); ++cur; } else start = dd;
  }
  var rows = [];
  for (var p = cur; p <= life; p++) {
    var eC = 0, eF = 0;
    if (lifeC > p || !_faRequireLast(tC)) { eC = _faInvoke(tC, lifeC, p, cost, accC); accC += eC; }
    else if (lifeC === p) { eC = cost - accC; accC = cost; }
    if (lifeF > p || !_faRequireLast(tF)) { eF = _faInvoke(tF, lifeF, p, cost, accF); accF += eF; }
    else if (lifeF === p) { eF = cost - accF; accF = cost; }
    rows.push({ a_asset_id: wk.a_asset_id, ad_org_id: wk.ad_org_id, c_acctschema_id: wk.c_acctschema_id, postingtype: wk.postingtype, a_entry_type: 'DEP',
      a_period: p, dateacct: _faMonthEnd(start, p - cur), expense: eC, expense_f: eF, a_accumulated_depr: accC, a_accumulated_depr_f: accF,
      a_accumulated_depr_delta: eC, a_accumulated_depr_f_delta: eF,   // MDepreciationExp.createDepreciation :167-200
      dr_account_id: acct.a_depreciation_acct, cr_account_id: acct.a_accumdepreciation_acct,
      a_asset_cost: Number(wk.a_asset_cost), uselifemonths: lifeC, uselifemonths_f: lifeF, a_asset_remaining: Number(wk.a_asset_remaining), a_asset_remaining_f: Number(wk.a_asset_remaining_f),
      processed: 'N', a_depreciation_entry_id: null });
  }
  return { ok: true, rows: rows };
}

// faCompleteAddition — MAssetAddition.beforeSave/prepareIt/completeIt (MAssetAddition.java:112-138, 559-640, 659-800) for a non-imported addition.
// ctx = { periodOpen:{ok}, baseAmount (AssetValueAmt = AssetSourceAmt in the client base currency, minor units), priorCreateAdditions (count, :1199-1230),
//         amountFor(schema) → AssetSourceAmt converted to the schema currency at DateAcct (minor units; MConversionRate.convert HALF_UP at std precision),
//         acctOf(schema) → asset acct row, typeOf(id) → DepreciationType, unprocessedBefore(assetId, date, postingType) → bool (MDepreciationExp :312-327) }
function faCompleteAddition(add, asset, workfiles, ctx) {
  if (ctx.periodOpen && !ctx.periodOpen.ok) return { ok: false, reason: 'period-closed' };                         // :570 MPeriod.testPeriodOpen (GL Journal)
  if (Number(ctx.baseAmount) === 0) return { ok: false, reason: 'Invalid AssetValueAmt=0' };                    // :573-577
  var createAsset = add.a_sourcetype === 'IMP' || !(ctx.priorCreateAdditions > 0);                             // setA_CreateAsset
  if (createAsset && Number(ctx.baseAmount) <= 0) return { ok: false, reason: 'New document has nulls' };        // :582-585 hasZeroValues
  if (createAsset && asset.a_asset_status !== 'NW' && add.a_sourcetype !== 'IMP') return { ok: false, reason: 'Only new assets can be activated' };   // :588-592
  var qty = Number(add.a_qty_current || 0); if (createAsset && qty === 0) qty = 1;                               // beforeSave :115-118
  var capex = createAsset ? 'Cap' : (add.a_capvsexp || 'Cap');                                                   // beforeSave :128-131
  var a = {}; for (var k in asset) a[k] = asset[k];
  if (createAsset) a.assetservicedate = String(add.datedoc).slice(0, 10);                                        // :699-702
  a.a_asset_status = 'AC'; a.assetactivationdate = String(add.dateacct).slice(0, 10);                            // changeStatus MAsset.java:541-544
  var outWk = [], schedules = {};
  for (var i = 0; i < workfiles.length; i++) {
    var w = {}; for (var c in workfiles[i]) w[c] = workfiles[i][c];
    w.dateacct = _faMonthEnd(add.dateacct);                                                                     // :728/:766 + workfile beforeSave month end :163-166
    var amt = ctx.amountFor(w.c_acctschema_id); if (amt == null) return { ok: false, reason: 'no-conversion-rate' };
    w.a_asset_cost = (createAsset ? 0 : Number(w.a_asset_cost)) + amt; w.a_qty_current = (createAsset ? 0 : Number(w.a_qty_current)) + qty;   // adjustCost :439-455
    if (capex === 'Cap') {
      if (ctx.unprocessedBefore && ctx.unprocessedBefore(a.a_asset_id, add.dateacct, w.postingtype)) return { ok: false, reason: 'There are unprocessed records to date' };
      if (Number(add.a_salvage_value || 0) > 0) w.a_salvage_value = ctx.salvageFor ? ctx.salvageFor(w.c_acctschema_id) : Number(add.a_salvage_value);
      w.processed = 'Y';
    }
    if (createAsset && Number(w.a_current_period) === 0) w.a_current_period = 1;                                 // :770-777
    w.a_asset_remaining = w.a_asset_cost - Number(w.a_accumulated_depr); w.a_asset_remaining_f = w.a_asset_cost - Number(w.a_accumulated_depr_f);   // workfile beforeSave :168-172
    var b = faBuildDepreciation(w, ctx.acctOf(w.c_acctschema_id), ctx.typeOf);
    if (!b.ok) return b;
    schedules[w.c_acctschema_id] = b.rows; outWk.push(w);
  }
  return { ok: true, asset: a, workfiles: outWk, schedules: schedules, createAsset: createAsset, a_capvsexp: capex };
}

// _faSetCurrentPeriod — MDepreciationWorkfile.setA_Current_Period (:615-641): the latest PROCESSED active row of the workfile (asset, posting type,
// schema) by A_Period DESC, DateAcct DESC ⇒ period = its A_Period + 1, DateAcct = month end of its DateAcct + 1 month; none ⇒ unchanged.
function _faSetCurrentPeriod(w, rows) {
  var last = null;
  rows.forEach(function (r) {
    if (Number(r.a_asset_id) !== Number(w.a_asset_id) || r.postingtype !== w.postingtype || Number(r.c_acctschema_id) !== Number(w.c_acctschema_id) || r.processed !== 'Y' || r.isactive === 'N') return;
    if (!last || r.a_period > last.a_period || (r.a_period === last.a_period && String(r.dateacct) > String(last.dateacct))) last = r;
  });
  if (last) { w.a_current_period = Number(last.a_period) + 1; w.dateacct = _faMonthEnd(last.dateacct, 1); }
}
// faCompleteDepreciationEntry — MDepreciationEntry.afterSave selectLines (MDepreciationEntry.java:174-190): unassigned rows of the entry's MONTH, client,
// org and schema; prepareIt :251-275 period open for its doc type; completeIt :291-340: each unprocessed selected row (ORDER BY asset, posting type, period,
// entry type) must lie in the entry's period, then MDepreciationExp.process (MDepreciationExp.java:205-253): no unprocessed EARLIER-month row of the asset
// (any schema, :312-327), asset Activated, workfile accum += Expense / Expense_F, current period + DateAcct (twice, before and after the row is processed),
// row DateAcct = the workfile's, row refreshed from the workfile (updateFrom :143-152). Any row error ⇒ the whole document fails (AssetArrayException).
// rows = every exp row the host holds for the client; workfiles = those of the involved assets; assetStatus(id) → status.
function faCompleteDepreciationEntry(entry, rows, workfiles, assetStatus, ctx) {
  ctx = ctx || {};
  if (ctx.periodOpen && !ctx.periodOpen.ok) return { ok: false, reason: 'period-closed' };
  var R = rows.map(function (r) { var o = {}; for (var k in r) o[k] = r[k]; return o; });
  var W = workfiles.map(function (w) { var o = {}; for (var k in w) o[k] = w[k]; return o; });
  var sel = R.filter(function (r) { return r.a_depreciation_entry_id == null && _faMonth(r.dateacct) === _faMonth(entry.dateacct) && Number(r.ad_client_id || entry.ad_client_id) === Number(entry.ad_client_id)
    && Number(r.ad_org_id) === Number(entry.ad_org_id) && Number(r.c_acctschema_id) === Number(entry.c_acctschema_id); });
  sel.forEach(function (r) { r.a_depreciation_entry_id = entry.a_depreciation_entry_id; });
  var todo = sel.filter(function (r) { return r.processed !== 'Y'; }).sort(function (x, y) {
    return (x.a_asset_id - y.a_asset_id) || String(x.postingtype).localeCompare(String(y.postingtype)) || (x.a_period - y.a_period) || String(x.a_entry_type).localeCompare(String(y.a_entry_type)); });
  var errors = [];
  todo.forEach(function (r) {
    var d = String(r.dateacct).slice(0, 10);
    if (ctx.periodStart && (d < String(ctx.periodStart).slice(0, 10) || d > String(ctx.periodEnd).slice(0, 10))) { errors.push('The date is not within this Period'); return; }
    var w = W.filter(function (x) { return Number(x.a_asset_id) === Number(r.a_asset_id) && x.postingtype === r.postingtype && Number(x.c_acctschema_id) === Number(r.c_acctschema_id); })[0];
    if (!w) { errors.push('@NotFound@ @A_Depreciation_Workfile_ID@'); return; }
    if (r.a_entry_type === 'DEP') {
      var early = R.some(function (o) { return Number(o.a_asset_id) === Number(r.a_asset_id) && o.postingtype === r.postingtype && o.processed !== 'Y' && _faMonth(o.dateacct) < _faMonth(r.dateacct); });
      if (early) { errors.push('There are unprocessed records to date'); return; }
      if (assetStatus(r.a_asset_id) !== 'AC') { errors.push('AssetNotActive ' + r.a_asset_id); return; }
      w.a_accumulated_depr = Number(w.a_accumulated_depr) + Number(r.expense); w.a_accumulated_depr_f = Number(w.a_accumulated_depr_f) + Number(r.expense_f);
      _faSetCurrentPeriod(w, R);
      w.a_asset_remaining = Number(w.a_asset_cost) - w.a_accumulated_depr; w.a_asset_remaining_f = Number(w.a_asset_cost) - w.a_accumulated_depr_f;   // workfile beforeSave :168-172 (cost, not actual cost)
      r.dateacct = w.dateacct;
    }
    r.processed = 'Y';
    r.a_asset_cost = Number(w.a_asset_cost); r.a_accumulated_depr = w.a_accumulated_depr; r.a_accumulated_depr_f = w.a_accumulated_depr_f;
    r.uselifemonths = Number(w.uselifemonths); r.uselifemonths_f = Number(w.uselifemonths_f); r.a_asset_remaining = w.a_asset_remaining; r.a_asset_remaining_f = w.a_asset_remaining_f;
    _faSetCurrentPeriod(w, R);
  });
  if (errors.length) return { ok: false, reason: errors.join('; ') };
  return { ok: true, docstatus: 'CO', rows: R, workfiles: W, selected: sel.length };
}

return {
  orderReserve: orderReserve, inoutOrderLineEffects: inoutOrderLineEffects, invoiceOrderLineEffects: invoiceOrderLineEffects,
  faRegisterAsset: faRegisterAsset, faCompleteAddition: faCompleteAddition, faBuildDepreciation: faBuildDepreciation, faCompleteDepreciationEntry: faCompleteDepreciationEntry, faMonthEnd: _faMonthEnd,
  resolveCtx: resolveCtx, dialectShim: dialectShim, evalGuard: evalGuard, voidOrder: voidOrder, completeMovement: completeMovement, completePayment: completePayment, prepareInvoice: prepareInvoice, completeInventory: completeInventory, creditCheckOrder: creditCheckOrder, priceAt: priceAt, periodOpen: periodOpen, acctSetupGap: acctSetupGap, calcTax: calcTax, taxLookup: taxLookup, orderTaxes: orderTaxes,
  match: match, buildDoc: buildDoc, DOC_SPECS: DOC_SPECS, explodeBOM: explodeBOM,
  movementSign: movementSign, qtyOnHand: qtyOnHand, reversePosting: reversePosting,
  qtyRollup: qtyRollup,
  VERBS: VERBS, completeOrder: completeOrder, completeInvoice: completeInvoice
};
});
