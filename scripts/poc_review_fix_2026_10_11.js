#!/usr/bin/env node
// Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
// SPDX-License-Identifier: MIT
// ⚠ DO NOT REMOVE — Scope: W-REVIEW-FIX, the eight reviewed defects of the SQLite-parity engine/POS port. Read the log after every run
// (build/erp/logs_review_fix/*.log); exit code alone is not evidence. Spec: prompts/SQLiteIDEMPIERE.md §REVIEW-FIX-2026-10-11.
// Implementing prompts/SQLiteIDEMPIERE.md §REVIEW-FIX-2026-10-11 — Witness: W-REVIEW-FIX.
//
// Each defect section names the ISSUE it proves/disproves, prints `§REVIEW-FIX D<n> ...` lines and a `judged=N` count. A section that judged
// nothing prints INCONCLUSIVE (never PASS). Exit: 0 all PASS · 1 any FAIL · 2 any INCONCLUSIVE (and no FAIL).
// Run against the compiler side:  node scripts/poc_review_fix_2026_10_11.js
// Run against the bim-ootb port:   REVIEW_FIX_ENGINE_DIR=/tmp/wt-ootb-erp-port/erp node scripts/poc_review_fix_2026_10_11.js
'use strict';
var path = require('path'), fs = require('fs'), os = require('os'), Module = require('module');
var ROOT = path.join(__dirname, '..');
var ENG_DIR = process.env.REVIEW_FIX_ENGINE_DIR || null;
function mod(name, where) { return ENG_DIR ? path.join(ENG_DIR, name + '.js') : path.join(ROOT, where, name + '.js'); }
if (ENG_DIR) {   // the bim-ootb layout has no ../../scripts/erp_engine: remap that one require to the port's own engine
  var _load = Module._load;
  Module._load = function (req, parent, isMain) { if (req === '../../scripts/erp_engine') req = path.join(ENG_DIR, 'erp_engine.js'); return _load.call(this, req, parent, isMain); };
}
var Database = require(path.join(ROOT, 'node_modules', 'better-sqlite3'));
var E = require(mod('erp_engine', 'scripts'));
var POS = require(mod('pos_core', 'build/erp'));
var DP = require(mod('doc_poster', 'scripts'));
var R = require(mod('post_resolver', 'scripts'));
var LENS = require(mod('pos_lens', 'build/erp'));
var SCRATCH = process.env.REVIEW_FIX_SCRATCH || fs.mkdtempSync(path.join(os.tmpdir(), 'rfix-'));

var results = {};   // D<n> -> {judged, fails}
var cur = null;
function section(n, issue) { cur = results['D' + n] = { judged: 0, fails: 0, issue: issue }; console.log('\n— D' + n + ' ' + issue); }
function assert(ok, label, detail) { cur.judged++; if (!ok) cur.fails++; console.log('   ' + (ok ? '🟢' : '🔴') + ' ' + label + (detail !== undefined ? ' — ' + detail : '')); }
function lc(r) { if (!r) return r; var o = {}; for (var k in r) o[k.toLowerCase()] = r[k]; return o; }
// b3 shim = what the browser host hands the lens (_b3(window.__idmpDb)): prepare().get/all with LOWER-CASED column keys
function lcDb(db) { return { raw: db, prepare: function (sql) { var st = db.prepare(sql); return { get: function () { return lc(st.get.apply(st, arguments)); }, all: function () { return st.all.apply(st, arguments).map(lc); }, run: function () { return st.run.apply(st, arguments); } }; }, exec: function (s) { return db.exec(s); } }; }
function cp(src, name) { var f = path.join(SCRATCH, name); fs.copyFileSync(src, f); return lcDb(new Database(f)); }
var J = JSON.stringify;
var FAKEPOS = { c_pos_id: 1, m_warehouse_id: 103, c_doctype_id: 135, m_pricelist_id: 101, ad_client_id: 11, ad_org_id: 11 };   // pure-engine fixture (no lens): the station row the ctx needs
console.log('═══ W-REVIEW-FIX — eight reviewed defects (engine=' + (ENG_DIR || 'bim-compiler scripts/+build/erp') + ') ═══');

// ───────────────────────────────────────── fixtures: POS station on a scratch copy of the shipped seed ─────────────────────────────────────────
var SEED = path.join(ROOT, 'build', 'erp', 'ad_seed_fullwidth.db');
function stationCtx(b3, price, taxRate) {
  var pos = lc(b3.prepare('SELECT * FROM c_pos WHERE c_pos_id=100').get());
  var plv = lc(b3.prepare('SELECT m_pricelist_version_id v FROM m_pricelist_version WHERE m_pricelist_id=?').get(pos.m_pricelist_id));
  var key = lc(b3.prepare('SELECT m_product_id FROM c_poskey WHERE c_poskeylayout_id=? AND m_product_id IS NOT NULL ORDER BY c_poskey_id LIMIT 1').get(pos.c_poskeylayout_id));
  b3.prepare('UPDATE m_productprice SET pricestd=? WHERE m_pricelist_version_id=? AND m_product_id=?').run(price, plv.v, key.m_product_id);   // scratch-copy fixture: net 95.00 / 85.00
  var glue = LENS._glue.posGlue(b3, pos, plv);
  var lensTaxOf = LENS._glue.lensTaxOf(b3, pos, 112, E);                 // the lens's own tax lookup for walk-in BP 112
  var t = lensTaxOf(key.m_product_id);
  if (t && t.ok) b3.prepare('UPDATE c_tax SET rate=? WHERE c_tax_id=?').run(taxRate, t.c_tax_id);   // scratch-copy fixture: the looked-up tax at 10%
  var dt = lc(b3.prepare('SELECT docsubtypeso s FROM c_doctype WHERE c_doctype_id=?').get(pos.c_doctype_id));
  var ctx = Object.assign({ pos: pos }, glue, { bomOf: function () { return []; }, docsubtypeso: dt && dt.s,
    wrPolicy: (dt && dt.s === 'WR') ? { isautogenerateinout: 'Y', isautogenerateinvoice: 'Y' } : { isautogenerateinout: 'N', isautogenerateinvoice: 'N' } });
  ctx.taxOf = lensTaxOf;
  return { ctx: ctx, pid: key.m_product_id, taxId: t && t.c_tax_id, taxOk: !!(t && t.ok), pos: pos };
}
function setCredit(b3, st, lim, open) { b3.prepare('UPDATE c_bpartner SET socreditstatus=?, so_creditlimit=?, totalopenbalance=? WHERE c_bpartner_id=112').run(st, lim, open); }

// ═════════════════════════════════════════════ D1 ═════════════════════════════════════════════
section(1, 'credit gate must see GrandTotal (tax first), MOrder.prepareIt :1666 -> :1689, CreditManagerOrder :72,85');
(function () {
  var b3 = cp(SEED, 'd1.db');
  var S = stationCtx(b3, 95, 10);
  assert(S.taxOk && S.taxId != null, 'fixture: lens tax lookup resolved a C_Tax for the product', 'c_tax_id=' + S.taxId);
  setCredit(b3, 'O', 100, 0);
  var cart = [POS.ringLine(S.ctx, S.pid, 1)];
  assert(cart[0].ok && cart[0].linenetamt === '95.00', 'fixture: ringLine net = 95.00 from the lens priceOf glue', cart[0].linenetamt);
  var opts = { orderId: 910001, inoutId: 910002, invoiceId: 910003, c_bpartner_id: 112 };
  var g = POS.buildSaleGroup(S.ctx, cart, opts);
  console.log('§REVIEW-FIX D1 lens-path buildSaleGroup limit=100 open=0 net=95 tax=10% -> ok=' + g.ok + ' reason=' + g.reason + (g.ok ? ' grandTotal=' + g.grandTotal : ''));
  assert(g.ok === false && g.reason === 'credit-over-hold', 'lens glue + buildSaleGroup: grand 104.50 > limit 100 is REFUSED credit-over-hold', 'ok=' + g.ok + ' reason=' + g.reason);
  // recall of a held order (same boundary)
  var hold = POS.buildHoldGroup(S.ctx, cart, opts);
  var rg = POS.buildRecallCompleteGroup(S.ctx, { c_order_id: 910001, docstatus: 'DR', c_bpartner_id: 112 }, hold.soLines.map(function (l) { return Object.assign({}, l); }), opts);
  assert(rg.ok === false && rg.reason === 'credit-over-hold', 'recall-complete of the held order: same refusal', 'ok=' + rg.ok + ' reason=' + rg.reason);
  // deliver-later (Standard Order doctype from the seed dictionary)
  var so = lc(b3.prepare("SELECT * FROM c_doctype WHERE docsubtypeso='SO' AND docbasetype='SOO' ORDER BY c_doctype_id LIMIT 1").get());
  if (so) {
    var ctxDL = Object.assign({}, S.ctx, { docsubtypeso: 'SO' });
    var dl = POS.buildDeliverLaterGroup(ctxDL, cart, Object.assign({}, opts, { doctype: so, invoiceRule: 'I' }));
    assert(dl.ok === false && dl.reason === 'credit-over-hold', 'deliver-later (Standard Order) : same refusal', 'ok=' + dl.ok + ' reason=' + dl.reason);
  } else assert(false, 'deliver-later control needs a SO doctype in the seed', 'none found');
  // control: net 85 -> 93.50 <= 100 passes (the gate is not simply "always refuse")
  var b3c = cp(SEED, 'd1c.db'); var Sc = stationCtx(b3c, 85, 10); setCredit(b3c, 'O', 100, 0);
  var gc = POS.buildSaleGroup(Sc.ctx, [POS.ringLine(Sc.ctx, Sc.pid, 1)], opts);
  assert(gc.ok === true && gc.grandTotal === 9350, 'control: net 85 + 10% = 93.50 <= 100 completes', 'ok=' + gc.ok + ' grandTotal(cents)=' + gc.grandTotal);
  // boundary: net 90 -> 99.00 passes, net 91 -> 100.10 refused
  var b3d = cp(SEED, 'd1d.db'); var Sd = stationCtx(b3d, 91, 10); setCredit(b3d, 'O', 100, 0);
  var gd = POS.buildSaleGroup(Sd.ctx, [POS.ringLine(Sd.ctx, Sd.pid, 1)], opts);
  assert(gd.ok === false && gd.reason === 'credit-over-hold', 'boundary: net 91 -> grand 100.10 > 100 refused (net 91 alone would pass)', 'reason=' + gd.reason);
  // pure pos_core (no lens): fake ctx with taxOf
  var fake = { pos: FAKEPOS, priceOf: function () { return { pricestd: '95' }; }, bomOf: function () { return []; }, wrPolicy: { isautogenerateinout: 'Y', isautogenerateinvoice: 'Y' },
    creditOf: function () { return { bp: { socreditstatus: 'O', so_creditlimit: 100, totalopenbalance: 0 }, sys: {} }; },
    taxOf: function () { return { ok: true, c_tax_id: 1 }; }, taxById: function () { return { c_tax_id: 1, rate: 10, istaxexempt: 'N', issummary: 'N' }; }, taxChildren: function () { return []; }, taxIncluded: false, docsubtypeso: 'WR' };
  var gp = POS.buildSaleGroup(fake, [POS.ringLine(fake, 7, 1)], opts);
  assert(gp.ok === false && gp.reason === 'credit-over-hold', 'pos_core alone (fake ctx): refused', 'ok=' + gp.ok + ' reason=' + gp.reason);
})();

// ═════════════════════════════════════════════ D2 ═════════════════════════════════════════════
section(2, 'reverseInvoice honours IsCreditMemo (MInvoice.reverse :2799-2802 getGrandTotal(true); MInvoice.java:844-853)');
(function () {
  function run(over) {
    var iv = Object.assign({ c_invoice_id: 500, c_order_id: 400, issotrx: 'Y', iscreditmemo: 'N', grandtotal: 50, dateacct: '2026-10-11', c_currency_id: 100, c_bpartner_id: 112,
      lines: [{ c_invoiceline_id: 5001, m_product_id: 7, qtyinvoiced: 5, linenetamt: 50, c_orderline_id: 4001 }], taxes: [] }, over);
    var ol = [{ c_orderline_id: 4001, qtyinvoiced: iv.iscreditmemo === 'Y' ? -5 : 5 }];   // QtyInvoiced after the ORIGINAL completed (credit memo subtracts, :2121)
    var r = E.reverseInvoice(iv, { allocations: [], payments: [] }, { newId: function (t) { return 501; }, orderLines: ol });
    var al = r.ops.filter(function (o) { return o.op_type === 'CREATE_LINE' && o.table === 'C_AllocationLine'; });
    return { r: r, orig: al.filter(function (o) { return o.c_invoice_id === 500; })[0], rev: al.filter(function (o) { return o.c_invoice_id === 501; })[0],
      oq: r.ops.filter(function (o) { return o.op_type === 'UPDATE_LINE' && o.table === 'C_OrderLine'; }).map(function (o) { return o.qtyinvoiced; }) };
  }
  var cm = run({ iscreditmemo: 'Y' });
  console.log('§REVIEW-FIX D2 AR credit memo grand=50 alloc orig=' + (cm.orig && cm.orig.amount) + ' rev=' + (cm.rev && cm.rev.amount) + ' ol.qtyinvoiced=' + J(cm.oq));
  assert(cm.orig && cm.orig.amount === -50 && cm.rev && cm.rev.amount === 50, 'AR credit memo 50: allocation lines orig -50 / reversal +50', (cm.orig && cm.orig.amount) + '/' + (cm.rev && cm.rev.amount));
  assert(cm.oq.length === 1 && cm.oq[0] === 0, 'AR credit memo: order-line QtyInvoiced goes -5 -> 0 (reversal adds back, not -10)', J(cm.oq));
  var ar = run({});
  assert(ar.orig.amount === 50 && ar.rev.amount === -50 && ar.oq[0] === 0, 'control AR invoice 50: +50/-50, QtyInvoiced 5 -> 0 (unchanged)', ar.orig.amount + '/' + ar.rev.amount + ' q=' + J(ar.oq));
  var ap = run({ issotrx: 'N' });
  assert(ap.orig.amount === -50 && ap.rev.amount === 50, 'control AP invoice 50: -50/+50 (MInvoice.java:2800)', ap.orig.amount + '/' + ap.rev.amount);
  var apcm = run({ issotrx: 'N', iscreditmemo: 'Y' });
  assert(apcm.orig.amount === 50 && apcm.rev.amount === -50, 'AP credit memo 50: credit-memo negation then AP negation = +50/-50', apcm.orig.amount + '/' + apcm.rev.amount);
})();

// ═════════════════════════════════════════════ D3 ═════════════════════════════════════════════
section(3, 'voidOrder completes the shipment reversal: storage + QtyReserved/QtyDelivered; line qtyentered 0; C_OrderTax recalculated (MInOut.reverse ~:2851, MOrder.voidIt :2698-2740)');
(function () {
  var P = 7, LOC = 9001;
  var sale = { order: { c_order_id: 1000, description: null },
    lines: [{ c_orderline_id: 10001, m_product_id: P, qtyordered: 3, qtyentered: 3, qtyreserved: 0, qtydelivered: 3, qtyinvoiced: 3, linenetamt: 30, description: null }],
    orderTaxes: [{ c_tax_id: 104, taxbaseamt: 30, taxamt: 3 }],
    shipments: [{ m_inout_id: 2000, docstatus: 'CO', movementtype: 'C-', issotrx: 'Y', lines: [{ m_inoutline_id: 20001, m_product_id: P, movementqty: 3, c_orderline_id: 10001, m_locator_id: LOC }] }],
    invoices: [{ c_invoice_id: 3000, docstatus: 'CO', issotrx: 'Y', grandtotal: 33, taxes: [], lines: [{ c_invoiceline_id: 30001, m_product_id: P, qtyinvoiced: 3, linenetamt: 30, c_orderline_id: 10001 }] }] };
  var stock = 10;   // on-hand before the sale
  function apply(ops) { ops.forEach(function (o) { if (o.op_type === 'MOVE_STOCK' && o.m_product_id === P && o.m_locator_id === LOC) stock += Number(o.qty); }); }
  var shipOps = E.completeInOut({ m_inout_id: 2000, issotrx: 'Y', movementtype: 'C-' }, sale.shipments[0].lines, {});   // the sale's shipment as its completion verb moves stock
  apply(shipOps.ops); var afterSale = stock;
  var n = 100;
  var ops = E.voidOrder(sale, { voidedMsg: 'Voided', newId: function () { return ++n; }, orderLines: sale.lines });
  apply(ops);
  var moves = ops.filter(function (o) { return o.op_type === 'MOVE_STOCK'; });
  console.log('§REVIEW-FIX D3 stock before=10 afterSale=' + afterSale + ' afterVoid=' + stock + ' MOVE_STOCK ops in void=' + moves.length);
  assert(afterSale === 7, 'fixture: the shipped sale took 3 off on-hand (10 -> 7)', 'afterSale=' + afterSale);
  assert(stock === 10, 'void of the shipped+invoiced sale restores on-hand to 10', 'afterVoid=' + stock);
  assert(moves.length === 1, 'exactly ONE storage effect for the one shipment line (no double count)', 'moves=' + moves.length);
  var ol = Object.assign({}, sale.lines[0]);
  ops.forEach(function (o) { if (o.op_type === 'UPDATE_LINE' && o.table === 'C_OrderLine' && o.id === 10001) Object.keys(o).forEach(function (k) { if (['op_type', 'table', 'id'].indexOf(k) < 0) ol[k] = o[k]; }); });
  assert(ol.qtydelivered === 0, 'order line QtyDelivered 3 -> 0 (inoutOrderLineEffects of the reversal)', 'qtydelivered=' + ol.qtydelivered);
  assert(ol.qtyordered === 0 && ol.qtyentered === 0, 'order line QtyOrdered AND QtyEntered zeroed (setQty, MOrder.voidIt :2709)', 'qtyordered=' + ol.qtyordered + ' qtyentered=' + ol.qtyentered);
  var resOps = ops.filter(function (o) { return o.op_type === 'UPDATE_LINE' && o.table === 'C_OrderLine' && o.id === 10001 && o.qtyreserved !== undefined; });
  assert(resOps.length >= 2 && resOps[0].qtyreserved === 3, 'the shipment reversal first RESTORES the reservation (+3), as completing a reversal does (MInOut.completeIt isReversal)', J(resOps.map(function (o) { return o.qtyreserved; })));
  assert(ol.qtyreserved === 0, 'order line QtyReserved then cleared (reserveStock(null) :2735-2740)', 'qtyreserved=' + ol.qtyreserved);
  var ot = ops.filter(function (o) { return o.table === 'C_OrderTax'; });
  assert(ot.length === 1 && ot[0].taxbaseamt === 0 && ot[0].taxamt === 0 && ot[0].c_tax_id === 104, 'C_OrderTax row recalculated from the zeroed lines (tax.calculateTaxFromLines :2724-2728)', J(ot));
  // harness-shape control: no orderLines supplied -> still emits the storage effect, never the order-line guess
  var n2 = 200; var ops2 = E.voidOrder(sale, { voidedMsg: 'Voided', newId: function () { return ++n2; } });
  var eff2 = ops2.filter(function (o) { return o.op_type === 'UPDATE_LINE' && o.table === 'C_OrderLine' && o.qtydelivered !== undefined; });
  assert(ops2.filter(function (o) { return o.op_type === 'MOVE_STOCK'; }).length === 1 && eff2.length === 0, 'without orderLines the delivered/reserved effect is NOT invented (reverseInOut precedent)', 'delivered-ops=' + eff2.length);
})();

// ═════════════════════════════════════════════ D4 ═════════════════════════════════════════════
section(4, 'recalled held order: c_tax_id must be written onto the EXISTING lines; input must not be mutated (MOrderLine.beforeSave setTax :866-867)');
(function () {
  var fake = { pos: FAKEPOS, priceOf: function () { return { pricestd: '10' }; }, bomOf: function () { return []; }, wrPolicy: { isautogenerateinout: 'Y', isautogenerateinvoice: 'Y' },
    taxOf: function () { return { ok: true, c_tax_id: 104 }; }, taxById: function () { return { c_tax_id: 104, rate: 0, istaxexempt: 'N', issummary: 'N' }; }, taxChildren: function () { return []; }, taxIncluded: false, docsubtypeso: 'WR' };
  var held = [{ c_orderline_id: 70001, m_product_id: 7, qtyordered: 2, priceactual: '10.00', linenetamt: '20.00' }, { c_orderline_id: 70002, m_product_id: 8, qtyordered: 1, priceactual: '10.00', linenetamt: '10.00' }];
  var order = { c_order_id: 7000, docstatus: 'DR', c_bpartner_id: 112 };
  var before = J({ o: order, l: held });
  var g = POS.buildRecallCompleteGroup(fake, order, held, { orderId: 7000, inoutId: 7001, invoiceId: 7002, c_bpartner_id: 112 });
  var upd = (g.ops || []).filter(function (o) { return o.op_type === 'UPDATE_FIELD' && o.table === 'C_OrderLine' && o.field === 'c_tax_id'; });
  console.log('§REVIEW-FIX D4 recall ok=' + g.ok + ' c_tax_id updates=' + upd.length + ' inputUnchanged=' + (J({ o: order, l: held }) === before));
  assert(g.ok === true, 'fixture: recall-complete of a synthetic held order succeeds', 'ok=' + g.ok + ' reason=' + g.reason);
  assert(upd.length === 2 && upd.every(function (u) { return u.value === 104; }) && upd.map(function (u) { return u.id; }).sort().join() === '70001,70002', 'one UPDATE_FIELD c_tax_id=104 per existing order line', J(upd));
  assert(J({ o: order, l: held }) === before, 'caller heldLines / heldOrder are NOT mutated (no c_tax_id leaked into the input)', J(held));
  // control: lines already carrying c_tax_id get no redundant update
  var held2 = held.map(function (l) { return Object.assign({}, l, { c_tax_id: 104 }); });
  var g2 = POS.buildRecallCompleteGroup(fake, order, held2, { orderId: 7000, inoutId: 7001, invoiceId: 7002, c_bpartner_id: 112 });
  var upd2 = (g2.ops || []).filter(function (o) { return o.op_type === 'UPDATE_FIELD' && o.table === 'C_OrderLine' && o.field === 'c_tax_id'; });
  assert(g2.ok && upd2.length === 0, 'control: lines that already hold c_tax_id get no redundant UPDATE', 'updates=' + upd2.length);
  // control: a fresh sale still stamps c_tax_id on the CREATE_LINE ops (no UPDATE needed)
  var gs = POS.buildSaleGroup(fake, [POS.ringLine(fake, 7, 2)], { orderId: 7100, inoutId: 7101, invoiceId: 7102, c_bpartner_id: 112 });
  var cl = gs.ops.filter(function (o) { return o.op_type === 'CREATE_LINE' && o.table === 'C_OrderLine'; });
  assert(gs.ok && cl.length === 1 && cl[0].c_tax_id === 104 && !gs.ops.some(function (o) { return o.op_type === 'UPDATE_FIELD' && o.field === 'c_tax_id'; }), 'control: fresh sale stamps c_tax_id on CREATE_LINE only', J(cl.map(function (c) { return c.c_tax_id; })));
})();

// ═════════════════════════════════════════════ D5 ═════════════════════════════════════════════
section(5, 'shipment reversal = the ORIGINAL posted facts swapped, not a re-derive at current cost (Doc_InOut :288-301, FactLine.updateReverseLine :1357-1359)');
(function () {
  var gb = cp(path.join(ROOT, 'build', 'erp', 'glassbowl_data.db'), 'd5.db').raw;
  try { require(path.join(ROOT, 'scripts', 'bridge', 'dict_diff')).applyPatch(gb, fs.readFileSync(path.join(ROOT, 'build', 'erp', 'patches', 'glassbowl_data.db.sql'), 'utf8')); } catch (e) { console.log('   (patch skipped: ' + e.message + ')'); }
  try { gb.exec('ALTER TABLE m_cost ADD COLUMN currentqty NUMERIC'); } catch (e) { /* present */ }
  var SCH = 101, P = 126, CT = 100;
  var elA = gb.prepare("SELECT m_costelement_id e FROM m_costelement WHERE costingmethod='A' ORDER BY m_costelement_id LIMIT 1").get().e;
  var avgEls = gb.prepare("SELECT m_costelement_id e FROM m_costelement WHERE costelementtype='M' AND costingmethod IN ('A','I')").all().map(function (r) { return r.e; });   // the elements MCostDetail.process walks (A and I)
  var allSch = gb.prepare('SELECT c_acctschema_id s, m_costtype_id ct FROM c_acctschema').all();   // costQtyRefusal walks every active schema
  allSch.forEach(function (sc) { avgEls.forEach(function (e) {
    gb.prepare('DELETE FROM m_cost WHERE m_product_id=? AND c_acctschema_id=? AND m_costelement_id=?').run(P, sc.s, e);
    gb.prepare('INSERT INTO m_cost(m_product_id,c_acctschema_id,m_costtype_id,m_costelement_id,currentcostprice,cumulatedamt,cumulatedqty,currentqty) VALUES(?,?,?,?,2.00,0,0,10)').run(P, sc.s, sc.ct, e);   // scratch fixture: avg cost 2.00, 10 on hand
  }); });
  var cols = function (t) { return gb.prepare('PRAGMA table_info(' + t + ')').all().map(function (c) { return c.name; }); };
  function ins(t, o) { var cs = cols(t).filter(function (c) { return o[c] !== undefined; }); gb.prepare('INSERT INTO ' + t + '(' + cs.join(',') + ') VALUES(' + cs.map(function () { return '?'; }).join(',') + ')').run(cs.map(function (c) { return o[c]; })); }
  var O = 990001, OL = 9900011, RV = 990002, RL = 9900021;
  ins('m_inout', { m_inout_id: O, ad_client_id: 11, ad_org_id: 11, issotrx: 'Y', movementtype: 'C-', docstatus: 'CO', dateacct: '2026-10-11', c_bpartner_id: 112 });
  ins('m_inoutline', { m_inoutline_id: OL, m_inout_id: O, m_product_id: P, movementqty: 10, ad_client_id: 11, ad_org_id: 11 });
  var orig = DP.derivePostings(gb, { table: 'M_InOut', id: O }, SCH, R);
  var origNet = {}; orig.lines.forEach(function (l) { origNet[l.account_id] = (origNet[l.account_id] || 0) + Math.round((l.amtacctdr - l.amtacctcr) * 100); });
  console.log('§REVIEW-FIX D5 original @2.00 qty10 absent=' + J(orig.absent) + ' lines=' + orig.lines.length + ' sumDr=' + orig.sumDr);
  assert(orig.lines.length === 2 && orig.absent.length === 0 && orig.sumDr === 2000, 'fixture: original shipment derives COGS/Asset 20.00 at avg cost 2.00', 'sumDr=' + orig.sumDr + ' absent=' + J(orig.absent));
  if (orig.lines.length !== 2) return;
  // the host posts it: the derived facts become the books (fact_acct), line-tagged
  orig.lines.forEach(function (l, i) { ins('fact_acct', { fact_acct_id: 99000 + i, ad_client_id: 11, ad_org_id: 11, c_acctschema_id: SCH, account_id: l.account_id, ad_table_id: 319, record_id: O, line_id: OL, amtacctdr: l.amtacctdr, amtacctcr: l.amtacctcr, amtsourcedr: l.amtacctdr, amtsourcecr: l.amtacctcr, postingtype: 'A', m_product_id: P }); });
  // the host's same-transaction upkeep after the shipment posted (CurrentQty 10 -> 0), as witness_m3_gap.applyCostQty does
  DP.costQtyUpdates(gb, O).forEach(function (u) { gb.prepare('UPDATE m_cost SET currentqty=COALESCE(currentqty,0)+? WHERE m_product_id=? AND c_acctschema_id=? AND m_costtype_id=? AND m_costelement_id=?').run(u.delta, u.m_product_id, u.c_acctschema_id, u.m_costtype_id, u.m_costelement_id); });
  // later receipt moves the cost to 2.50
  gb.prepare('UPDATE m_cost SET currentcostprice=2.50 WHERE m_product_id=? AND m_costelement_id IN (' + avgEls.join(',') + ')').run(P);
  ins('m_inout', { m_inout_id: RV, ad_client_id: 11, ad_org_id: 11, issotrx: 'Y', movementtype: 'C-', docstatus: 'CO', dateacct: '2026-10-11', c_bpartner_id: 112, reversal_id: O });
  ins('m_inoutline', { m_inoutline_id: RL, m_inout_id: RV, m_product_id: P, movementqty: -10, reversalline_id: OL, ad_client_id: 11, ad_org_id: 11 });
  var rev = DP.derivePostings(gb, { table: 'M_InOut', id: RV }, SCH, R);
  var net = {}; orig.lines.concat(rev.lines).forEach(function (l) { net[l.account_id] = (net[l.account_id] || 0) + Math.round((l.amtacctdr - l.amtacctcr) * 100); });
  var maxAbs = Math.max.apply(null, Object.keys(net).map(function (k) { return Math.abs(net[k]); }).concat([0]));
  console.log('§REVIEW-FIX D5 reversal @cost 2.50 absent=' + J(rev.absent) + ' basis=' + rev.reversalBasis + ' net(orig+rev) per account(cents)=' + J(net));
  assert(rev.absent.length === 0 && rev.lines.length === 2, 'reversal derives (not absent)', 'absent=' + J(rev.absent));
  assert(maxAbs === 0, 'COGS and Asset net to exactly 0 across original + reversal although cost moved 2.00 -> 2.50', 'maxAbsNet=' + maxAbs + 'c');
  assert(rev.reversalBasis === 'posted-original', 'reversal basis is labelled posted-original', String(rev.reversalBasis));
  // cost-qty upkeep: the reversal re-adds at the ORIGINAL line amount (20.00 / qty 10 = 2.00), not at today's 2.50
  var up = DP.costQtyUpdates(gb, RV).filter(function (u) { return u.m_costelement_id === elA && u.c_acctschema_id === SCH; })[0];
  console.log('§REVIEW-FIX D5 costQtyUpdates(reversal) delta=' + (up && up.delta) + ' newprice=' + (up && up.currentcostprice));
  assert(up && up.delta === 10 && up.currentcostprice === 2, 'costQtyUpdates: reversal re-adds at the ORIGINAL line amount (avg price 2.00, not 2.50)', 'delta=' + (up && up.delta) + ' price=' + (up && up.currentcostprice));
  // falsifier: no posted books for the original -> old recompute, but the basis is SAID (never silent)
  gb.prepare('DELETE FROM fact_acct WHERE record_id=?').run(O);
  var rev2 = DP.derivePostings(gb, { table: 'M_InOut', id: RV }, SCH, R);
  assert(rev2.reversalBasis === 'recomputed-current-cost', 'no posted original available -> basis says recomputed-current-cost (never silent)', String(rev2.reversalBasis));
})();

// ═════════════════════════════════════════════ D6 ═════════════════════════════════════════════
section(6, 'completePayment IsPaid: raw signed allocation sum vs -GT for AP (MInvoice.testAllocation :1433-1455, getAllocatedAmt :1393)');
(function () {
  function flow(issotrx, isreceipt, gt, parts) {
    var alloc = 0, paid = [], n = 0;   // alloc = raw signed sum of the invoice's existing allocation lines (the convention callers hand in as allocatedamt)
    parts.forEach(function (amt, i) {
      var r = E.completePayment({ c_payment_id: 900 + i, c_bpartner_id: 112, c_invoice_id: 600, payamt: amt, isreceipt: isreceipt, discountamt: 0, writeoffamt: 0, overunderamt: 0, c_currency_id: 100, dateacct: '2026-10-11' },
        { c_invoice_id: 600, grandtotal: gt, issotrx: issotrx, iscreditmemo: 'N', allocatedamt: alloc / 100, dateacct: '2026-10-11' }, { newId: function () { return ++n; } });
      var line = r.ops.filter(function (o) { return o.table === 'C_AllocationLine'; })[0];
      alloc += Math.round(line.amount * 100);
      paid.push(r.ops.some(function (o) { return o.table === 'C_Invoice' && o.field === 'ispaid' && o.value === 'Y'; }) ? 'Y' : 'N');
    });
    return paid.join('/');
  }
  var ar = flow('Y', 'Y', 100, [60, 40]), ap = flow('N', 'N', 100, [60, 40]);
  console.log('§REVIEW-FIX D6 AR 60+40 IsPaid=' + ar + ' · AP 60+40 IsPaid=' + ap);
  assert(ar === 'N/Y', 'AR partial 60 then 40: IsPaid N then Y', ar);
  assert(ap === 'N/Y', 'AP partial 60 then 40: IsPaid N then Y (allocatedamt = raw signed sum, AP negative)', ap);
  assert(flow('N', 'N', 100, [100]) === 'Y', 'AP single full payment: IsPaid Y', flow('N', 'N', 100, [100]));
  assert(flow('N', 'N', 100, [60, 30]) === 'N/N', 'falsifier: AP 60+30 of 100 stays unpaid', flow('N', 'N', 100, [60, 30]));
  assert(flow('Y', 'Y', 100, [60, 30]) === 'N/N', 'falsifier: AR 60+30 of 100 stays unpaid', flow('Y', 'Y', 100, [60, 30]));
})();

// ═════════════════════════════════════════════ D7 ═════════════════════════════════════════════
section(7, 'creditCheckOrder: BP already on Hold, lim-gt >= open keeps BPartnerCreditHold (MBPartner.getSOCreditStatus(add) :838-849)');
(function () {
  function chk(st, lim, open, gt) { return E.creditCheckOrder({ issotrx: 'Y', docsubtypeso: 'SO', paymentrule: 'P', grandtotal: gt }, { socreditstatus: st, so_creditlimit: lim, totalopenbalance: open }, {}); }
  var a = chk('H', 1000, 100, 50), b = chk('H', 100, 90, 50), c = chk('O', 100, 90, 50), d = chk('S', 1000, 0, 50), e = chk('H', 0, 500, 50);
  console.log('§REVIEW-FIX D7 H/lim1000/open100/gt50 -> ' + a.reason + ' · H/100/90/50 -> ' + b.reason + ' · O/100/90/50 -> ' + c.reason + ' · S -> ' + d.reason + ' · H/lim0 -> ' + e.reason);
  assert(a.ok === false && a.reason === 'credit-hold' && a.msg === 'BPartnerCreditHold', 'Hold BP, headroom remains (1000-50 >= 100): getSOCreditStatus(add) is not Hold -> message stays credit-hold / BPartnerCreditHold', a.reason + '/' + a.msg);
  assert(b.ok === false && b.reason === 'credit-over-hold' && b.msg === 'BPartnerOverOCreditHold', 'Hold BP, headroom exhausted (100-50 < 90): credit-over-hold', b.reason);
  assert(c.ok === false && c.reason === 'credit-over-hold', 'control: OK BP crossing the limit -> credit-over-hold', c.reason);
  assert(d.ok === false && d.reason === 'credit-stop', 'control: Stop BP stays credit-stop (nothing to do, :844-848)', d.reason);
  assert(e.ok === false && e.reason === 'credit-over-hold', 'control: Hold BP with limit 0: getSOCreditStatus(add) returns its own status H (nothing to do, :844-848) -> equals CreditHold -> OverOCreditHold (CreditManagerOrder :79)', e.reason);
})();

// ═════════════════════════════════════════════ D8 ═════════════════════════════════════════════
section(8, 'ringLine: qty must be a real number; 0 and negatives stay legal (pilot S14, spec §47.1)');
(function () {
  var ctx = { priceOf: function () { return { pricestd: '10' }; } };
  function r(q) { try { return POS.ringLine(ctx, 7, q); } catch (e) { return { ok: 'threw', reason: 'THREW ' + e.message }; } }
  [[' ', "' '"], [true, 'true'], [false, 'false'], [[], '[]'], ['abc', "'abc'"], [NaN, 'NaN'], [null, 'null'], [undefined, 'undefined'], [Infinity, 'Infinity'], ['', "''"], [{}, '{}'], [[5], '[5]']].forEach(function (c) {
    var x = r(c[0]); assert(x.ok === false && x.reason === 'bad-qty', 'reject ' + c[1] + ' -> bad-qty', 'ok=' + x.ok + ' reason=' + x.reason);
  });
  [[0, 0], [-2, -2], ['3', '3'], [2.5, 2.5], ['-1', '-1']].forEach(function (c) {
    var x = r(c[0]); assert(x.ok === true && x.qty === c[1], 'accept ' + J(c[0]) + ' (qty kept as given)', 'ok=' + x.ok + ' linenetamt=' + x.linenetamt);
  });
  console.log('§REVIEW-FIX D8 accepted 0/-2/"3"/2.5/"-1"; rejected blank/boolean/array/object/NaN/Infinity/null/undefined/text');
})();

// ───────────────────────────────────────── verdict ─────────────────────────────────────────
var bad = 0, inc = 0;
Object.keys(results).forEach(function (k) {
  var s = results[k], v = s.judged === 0 ? 'INCONCLUSIVE' : (s.fails ? 'FAIL' : 'PASS');
  if (v === 'FAIL') bad++; if (v === 'INCONCLUSIVE') inc++;
  console.log('§REVIEW-FIX ' + k + ' judged=' + s.judged + ' fails=' + s.fails + ' ' + v + ' — ' + s.issue);
});
console.log((bad ? '🔴 W-REVIEW-FIX FAIL (' + bad + ' defect(s) still present)' : (inc ? '🟡 W-REVIEW-FIX INCONCLUSIVE (' + inc + ')' : '🟢 W-REVIEW-FIX PASS — 8/8 defects proven fixed')) + '  engine=' + (ENG_DIR || 'compiler'));
process.exit(bad ? 1 : (inc ? 2 : 0));
