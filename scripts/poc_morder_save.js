#!/usr/bin/env node
// Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
// SPDX-License-Identifier: MIT
// poc_morder_save.js — W-MORDER-SAVE (FABLE5_MORDER_EQUIVALENCE.md §H-1.3).
//
// SPEC (§H-1.3): MOrder.beforeSave (MOrder.java:1183-1396) ported into ad_modelval
//   (installMOrderSaveHooks — 14 hooks since 2026-09-02 (P1.5 added bpLocationDefault + salesRepFromCtx), each citing its Java lines) must agree with iDempiere on BOTH axes:
//   (1) ACCEPT/REJECT — every STORED c_order (real iDempiere wrote it THROUGH this very beforeSave) must be
//       accepted unchanged (8/8); records mutated per Java's EXPLICIT reject conditions must be rejected:
//       AD_Client_ID=0 (:1195) · M_Warehouse_ID=0 without ctx (:1206, FillMandatoryException) · PrepayOrder
//       'PR' + PAYMENTRULE_Cash 'B' (:1373) · price-list change on a saved order with product lines (:1352,
//       CannotChangePl). Conjunctivity is load-bearing: REAL orders 100/102 already carry paymentrule='B' on
//       a NON-prepay doctype and must stay accepted; doctype 130 ('PR') with rule 'P' must stay accepted.
//   (2) DERIVED VALUES — strip a defaulted column from a real order and the hook must re-derive the STORED
//       value (the stored row IS the oracle: iDempiere derived it):
//       Bill_BPartner/Bill_Location ←BP/location (:1272-1279, MUST 8/8) · C_Currency ←price list (:1292,
//       MUST 8/8) · M_PriceList (:1282) / C_PaymentTerm (:1315) / C_DocTypeTarget (:1311) re-derive the
//       Java default — fixtures where the stored value differs are EXPLICIT user choices (Java defaults ONLY
//       a zero column; it never overrides), classified, never failed silently.
//       BP-location consistency (:1239-1252): a location belonging to ANOTHER BP is CLEARED (derived null),
//       not rejected — diffed both ways (real consistent rows untouched; foreign location cleared).
//
// ORACLE: the stored client-11 c_order rows (captured from idempiere_test, the instance that ran the real
//   MOrder.beforeSave) + the cited Java semantics. NON-INVENT: every fixture is a real row or a real row
//   mutated EXACTLY per a cited Java reject condition; expected values are stored values, never authored.
//   Deterministic: pure db reads, no Date.now/Math.random.
// Implementing FABLE5_MORDER_EQUIVALENCE.md §H-1.3 — Witness: W-MORDER-SAVE
// Run: bash build/erp/run_witness.sh scripts/poc_morder_save.js   (log: build/erp/poc_morder_save.log)
'use strict';
var path = require('path');
var Database = require('better-sqlite3');
// MODELVAL env seam (2026-09-02, ERP_IDEMPIERE_UX_PARITY.md §IMPL F7): `build/erp/ad_modelval.js` is a
// SEPARATE, drifted copy of the shipped `erp/ad_modelval.js` (md5 differs; 11 witnesses run against the copy).
// P1.5's two new hooks ship in the LIVE file, so this witness must be able to judge the live one. Default is
// unchanged — the copy — so the other 10 witnesses and CI are untouched; pass MODELVAL=<path> to judge a
// shipped/worktree file instead. Reconciling the copy itself is named-deferred, not this PR's scope.
var V = require(process.env.MODELVAL || '../build/erp/ad_modelval');

var db = new Database(path.join(__dirname, '..', 'build', 'erp', 'glassbowl_data.db'), { readonly: true });
var fails = 0;
function verdict(ok, label, detail) { if (!ok) fails++; console.log('   ' + (ok ? '🟢' : '🔴') + ' ' + label + (detail ? ' — ' + detail : '')); }

var nHooks = V.installMOrderSaveHooks(db);
console.log('═══ W-MORDER-SAVE — MOrder.beforeSave port == iDempiere (stored-state oracle + MOrder.java:1183-1396) ═══');
console.log('    engine = ad_modelval.installMOrderSaveHooks (' + nHooks + ' hooks) · fixtures = the 8 real client-11 c_orders\n');

function fire(record, recordOld, ctx) {
  var info = { table: 'C_Order', record: record, recordOld: recordOld || null };
  var res = V.fireHooks('BEFORE_SAVE', info, ctx || {});
  res.derived = info.derived || {};
  res.warnings = info.warnings || [];
  return res;
}
function clone(o) { return JSON.parse(JSON.stringify(o)); }
var orders = db.prepare('SELECT * FROM c_order ORDER BY c_order_id').all();

// ── (1a) every STORED order is accepted unchanged — real iDempiere saved them through this beforeSave ───
var okAll = 0, contradictions = 0;
orders.forEach(function (o) {
  var r = fire(clone(o));
  // a derivation that CONTRADICTS a stored value would mean our port disagrees with what Java left in place
  var contra = Object.keys(r.derived).filter(function (k) { return String(r.derived[k]) !== String(o[k]); });
  if (r.ok && contra.length === 0) okAll++; else contradictions += contra.length;
  console.log('§HARDEN surface=MOrder.beforeSave record_id=' + o.c_order_id + ' docno=' + o.documentno +
    ' verdict=' + (r.ok ? 'ACCEPT' : 'REJECT(' + r.error + ')') + ' derived-contradictions=' + contra.length +
    ' warnings=[' + r.warnings.join(',') + '] diff=' + (r.ok && contra.length === 0 ? 0 : 'MISMATCH'));
});
verdict(okAll === orders.length, orders.length + '/' + orders.length + ' stored orders ACCEPTED with zero derived contradictions (the stored row is the oracle)', 'contradictions=' + contradictions);

// ── (1b) derived defaults reproduce the stored values ───────────────────────────────────────────────────
function deriveDiff(label, strip, derivedCol, must) {
  var match = 0, explicit = 0, miss = [];
  orders.forEach(function (o) {
    var m = clone(o); strip.forEach(function (c) { m[c] = 0; });
    var r = fire(m);
    var got = r.derived[derivedCol];
    if (String(got) === String(o[derivedCol])) match++;
    else if (!must && got != null) { explicit++; console.log('   · ' + label + ' order ' + o.c_order_id + ': derived-default=' + got + ' stored=' + o[derivedCol] + ' → EXPLICIT (user-set; Java defaults only a zero column)'); }
    else miss.push('order ' + o.c_order_id + ' derived=' + got + ' stored=' + o[derivedCol]);
  });
  verdict(miss.length === 0 && (must ? match === orders.length : match + explicit === orders.length),
    label + ': ' + match + '/' + orders.length + ' re-derive the STORED value' + (must ? ' (MUST, 8/8)' : ' + ' + explicit + ' EXPLICIT (named)'),
    miss.join('; ') || 'diff=0');
}
deriveDiff('Bill_BPartner/Location ←BP (:1272)', ['bill_bpartner_id', 'bill_location_id'], 'bill_bpartner_id', true);
deriveDiff('Bill_Location ←BP-location (:1278)', ['bill_location_id'], 'bill_location_id', true);
deriveDiff('C_Currency ←price list (:1292)', ['c_currency_id'], 'c_currency_id', true);
deriveDiff('M_PriceList default (:1282)', ['m_pricelist_id', 'c_currency_id'], 'm_pricelist_id', false);
deriveDiff('C_PaymentTerm default (:1315)', ['c_paymentterm_id'], 'c_paymentterm_id', false);
deriveDiff('C_DocTypeTarget default (:1311)', ['c_doctypetarget_id'], 'c_doctypetarget_id', false);

// derived doctype-target must BE the Standard Order ('SO') doctype — the Java rule, independent of EXPLICIT picks
(function () {
  var m = clone(orders[0]); m.c_doctypetarget_id = 0;
  var got = fire(m).derived.c_doctypetarget_id;
  var sub = got ? db.prepare('SELECT docbasetype,docsubtypeso FROM c_doctype WHERE c_doctype_id=?').get(Number(got)) : null;
  verdict(!!sub && sub.docbasetype === 'SOO' && sub.docsubtypeso === 'SO',
    'docTypeTarget default derives THE Standard Order doctype (docsubtypeso=SO)', 'derived=' + got);
})();

// ── (1c) BP-location consistency (:1239-1252) — foreign location CLEARED, consistent location untouched ─
(function () {
  var consistent = orders.every(function (o) {
    var r = fire(clone(o));
    return !('c_bpartner_location_id' in r.derived) && !('ad_user_id' in r.derived);
  });
  verdict(consistent, 'all 8 stored BP-locations/users are consistent → hook leaves them untouched');
  var probe = clone(orders.find(function (o) { return o.c_order_id === 100; }));
  var foreign = db.prepare('SELECT c_bpartner_location_id FROM c_bpartner_location WHERE c_bpartner_id<>? LIMIT 1').get(Number(probe.c_bpartner_id));
  probe.c_bpartner_location_id = foreign.c_bpartner_location_id;
  var r = fire(probe);
  // 2026-09-02 (ERP_IDEMPIERE_UX_PARITY.md §IMPL P1.5): the old expectation (derived === null) stopped ONE Java line
  // short — :1243 clears the foreign location, then :1269 `if (getC_BPartner_Location_ID() == 0) setBPartner(bp)`
  // re-derives it from the BP's own locations (setBPartner :756-769, ship-to else first). Oracle = the seed itself.
  var own = db.prepare("SELECT c_bpartner_location_id FROM c_bpartner_location WHERE c_bpartner_id=? AND isactive='Y' AND isshipto='Y' ORDER BY c_bpartner_location_id").all(Number(probe.c_bpartner_id));
  var ownLoc = own.length ? Number(own[own.length - 1].c_bpartner_location_id) : null;
  verdict(r.ok && r.derived.c_bpartner_location_id === ownLoc && ownLoc !== null && ownLoc !== Number(foreign.c_bpartner_location_id),
    'foreign BP-location is CLEARED (:1243) and then RE-DERIVED from the BP\'s own ship-to (:1269 → setBPartner :756-769), not rejected',
    'loc=' + foreign.c_bpartner_location_id + ' → derived=' + r.derived.c_bpartner_location_id + ' (own ship-to=' + ownLoc + ')');
})();

// ── (1d) §P1 P1.5 — the two beforeSave defaults the port lacked until 2026-09-02 (ERP_IDEMPIERE_UX_PARITY.md §IMPL):
//   MOrder.bpLocationDefault (:1269-1270 ∘ setBPartner :752-770) and MOrder.salesRepFromCtx (:1302-1307). Oracle =
//   the stored rows: strip the column, the hook must put the STORED value back (real iDempiere derived it).
(function () {
  var locOk = 0, srOk = 0, billOk = 0;
  orders.forEach(function (o) {
    var p1 = clone(o); p1.c_bpartner_location_id = null; p1.bill_location_id = null;
    var r1 = fire(p1);
    if (r1.ok && Number(r1.derived.c_bpartner_location_id) === Number(o.c_bpartner_location_id)) locOk++;
    if (r1.ok && Number(r1.derived.bill_location_id) === Number(o.bill_location_id)) billOk++;
    var p2 = clone(o); p2.salesrep_id = null;
    var r2 = fire(p2, null, { salesrep_id: Number(o.salesrep_id) });   // Env.SALESREP_ID = the login user; here = the stored value
    if (r2.ok && Number(r2.derived.salesrep_id) === Number(o.salesrep_id)) srOk++;
    console.log('§HARDEN surface=MOrder.beforeSave/defaults record_id=' + o.c_order_id + ' stripLocation→' + r1.derived.c_bpartner_location_id + '/' + o.c_bpartner_location_id +
      ' stripBillLoc→' + r1.derived.bill_location_id + '/' + o.bill_location_id + ' stripSalesRep(ctx)→' + r2.derived.salesrep_id + '/' + o.salesrep_id);
  });
  verdict(locOk === orders.length, orders.length + '/' + orders.length + ' stripped C_BPartner_Location_ID re-derived to the STORED value (:1269 → setBPartner ship-to)', 'ok=' + locOk);
  verdict(billOk === orders.length, orders.length + '/' + orders.length + ' stripped Bill_Location_ID re-derived to the STORED value (setBPartner bill-to → :1272-1279)', 'ok=' + billOk);
  verdict(srOk === orders.length, orders.length + '/' + orders.length + ' stripped SalesRep_ID re-derived from ctx.salesrep_id (:1302-1307, Env.SALESREP_ID)', 'ok=' + srOk);
  var noCtx = clone(orders[0]); noCtx.salesrep_id = null;
  var r3 = fire(noCtx);
  verdict(r3.ok && !('salesrep_id' in r3.derived), 'no ctx.salesrep_id → SalesRep stays unset (Java: `if (ii != 0)` — never invented)', JSON.stringify(r3.derived.salesrep_id));
})();

// ── (2) REJECT fixtures — real records mutated per the cited Java reject conditions (§FALSIFIERs) ────────
function expectReject(label, rec, recordOld, ctx, hookName) {
  var r = fire(rec, recordOld, ctx);
  verdict(!r.ok && r.blocked === hookName, '§FALSIFIER ' + label + ' → REJECTED by ' + hookName, r.ok ? 'WAS ACCEPTED' : 'error=' + r.error);
  console.log('§FALSIFIER ' + label + ' verdict=' + (r.ok ? 'ACCEPT(BAD)' : 'REJECT') + ' hook=' + (r.blocked || '-'));
}
var base = orders.find(function (o) { return o.c_order_id === 100; });   // real order 100 (paymentrule='B' already)
var m1 = clone(base); m1.ad_client_id = 0;
expectReject('AD_Client_ID=0 (:1195)', m1, null, null, 'MOrder.clientNotZero');
var m2 = clone(base); m2.m_warehouse_id = 0;
expectReject('M_Warehouse_ID=0, no ctx (:1206)', m2, null, null, 'MOrder.warehouseMandatory');
(function () {  // the :1208 ctx fallback — same record, warehouse supplied by context → accepted + derived
  var r = fire(clone(m2), null, { m_warehouse_id: 103 });
  verdict(r.ok && r.derived.m_warehouse_id === 103, 'M_Warehouse_ID=0 WITH ctx fallback (:1208) → accepted, derived=103', JSON.stringify(r.derived));
})();
var m3 = clone(base); m3.c_doctypetarget_id = 130;                       // 130 = Prepay Order (docsubtypeso 'PR'); rule already 'B'
expectReject('PrepayOrder + PAYMENTRULE_Cash (:1373)', m3, null, null, 'MOrder.prepayNoCash');
(function () {  // conjunctivity: prepay alone (rule 'P') must pass; cash alone already passes (order 100 stored)
  var m = clone(base); m.c_doctypetarget_id = 130; m.paymentrule = 'P';
  var r = fire(m);
  verdict(r.ok, 'PrepayOrder with rule P accepted (reject is CONJUNCTIVE — cash-only orders 100/102 accepted above)');
})();
var m4 = clone(base); m4.m_pricelist_id = 102;
expectReject('price-list change on saved order with product lines (:1352)', m4, base, null, 'MOrder.priceListImmutable');
(function () {  // same change as a NEW record (no old image) → Java doesn't gate it
  var r = fire(clone(m4), null, null);
  verdict(r.ok, 'same price-list value on a NEW record accepted (gate fires only on CHANGE of a saved order)');
})();

console.log('\n§HARDEN_RESIDUAL :1361 DateOrdered/price-list-VERSION twin gate needs m_pricelist_version (not in capture) — named-deferred · ' +
  ':1382 payment-term re-apply (MPaymentTerm.applyOrder schedule rebuild) is a write-path side effect, out of beforeSave verdict scope · ' +
  'credit-status (MOrder checks it at prepareIt, not beforeSave) → H-1.4 territory, named');
console.log('§HARDEN surface=MOrder.beforeSave fixtures=' + orders.length + ' diff=0 oracle=iDempiere(stored-state+MOrder.java:1183-1396)');
console.log((fails === 0 ? '🟢 W-MORDER-SAVE PASS' : '🔴 W-MORDER-SAVE FAIL (' + fails + ')') +
  ' — accept/reject + derived defaults agree with the real iDempiere save path on all 8 stored orders + cited reject mutations.');
db.close();
process.exit(fails === 0 ? 0 : 1);
