#!/usr/bin/env node
// Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
// SPDX-License-Identifier: MIT
// ⚠ DO NOT REMOVE — Scope guard (POS_GAP_CLOSE.md §G-1 / POS_ADDON_SPEC.md §P-12 / SPATIAL_PICKING_SPEC.md §S-2).
//   Read the log after every run.
// poc_pos_deliverlater.js — W-POS-DELIVERLATER: the deliver-later sale variant (the seam gap both
// banked specs promise: "ENGINE builds it").
//
// ISSUES IT PROVES (named):
//   1. POLICY FROM THE DICTIONARY — the deliver-later semantics come from the doctype 132 row
//      (DocSubTypeSO='SO', IsAutoGenerateInout='N', IsAutoGenerateInvoice='N', shipment link 132→120),
//      NOT from POS code (the wrPolicy discipline). The FSM says CO is legal from DR for 132.
//   2. THE SEAM SHAPE — ONE signed group: C_Order → CO + the shipment BORN DR (same buildDoc spec the
//      WR path rides — REPLAY-EQUAL to E.createShipment — with NO SET_STATUS M_InOut) + NO invoice
//      (flag 'N'; timing NAMED from the extracted C_Order.InvoiceRule dictionary default, not hardcoded).
//   3. ON-HAND UNMOVED after the sale (qtyOnHand fold over completed-doc events only) — and the open
//      shipment SURFACES in the §S-2 selector query (docstatus IN ('DR','IP'), POS-generated).
//   4. COMPLETION-BY-PICK — scan-commit completes the DR M_InOut and on-hand moves by the PICKED qty
//      (short-pick reduces MovementQty, the extracted SO-side rule); a confirm-demanding shipment
//      doctype (148 IsPickQAConfirm) REFUSES the direct path and routes to inout_confirm (W-WH-CONFIRM gate).
//   §FALSIFIER 1: the WR sale (doctype 135) leaves ZERO open docs — W-POS-WR regression, all three
//      SET_STATUS CO in-group (a deliver-later that leaked into WR would double-move stock on pick).
//   §FALSIFIER 2: double-complete of the DR shipment is REFUSED (FSM not-open).
//   §FALSIFIER 3: totals to the cent — every linenetamt = qty × sealed master price, grandtotal = the
//      BigDecimal fold of the lines; nothing invented.
//
// NON-INVENT: cart = real c_poskey rows of station 100 priced off real m_productprice rows
//   (ad_seed_fullwidth.db); doctype rows + InvoiceRule default EXTRACTED from the same seed;
//   deterministic ids + explicit baseTs.
// Implementing docs/POS_ADDON_SPEC.md §P-12 — Witness: W-POS-DELIVERLATER
// Run: bash build/erp/run_witness.sh scripts/poc_pos_deliverlater.js   — then READ the log.
'use strict';
var path = require('path');
var fs = require('fs');
var Database = require('better-sqlite3');
var initSqlJs = require('sql.js');
var E = require('./erp_engine');
var POS = require(path.join(__dirname, '..', 'build', 'erp', 'pos_core.js'));
var F = require(path.join(__dirname, '..', 'build', 'erp', 'ad_docfsm.js'));
var BigDecimal = require(path.join(__dirname, '..', 'build', 'erp', 'bigdecimal.js'));

global.window = global.window || {};
global.crypto = global.crypto || require('crypto').webcrypto;
require(path.join(__dirname, '..', 'build', 'erp', 'kernel_ops.js'));
var KO = global.window.KernelOps;

var fails = 0;
function verdict(ok, label, detail) { if (!ok) fails++; console.log('   ' + (ok ? '🟢' : '🔴') + ' ' + label + (detail ? ' — ' + detail : '')); }
function lc(r) { if (!r) return r; var o = {}; for (var k in r) o[k.toLowerCase()] = r[k]; return o; }

var SEED = path.join(__dirname, '..', 'build', 'erp', 'ad_seed_fullwidth.db');
var COPY = '/tmp/poc_pos_deliverlater_seed.db';
fs.copyFileSync(SEED, COPY);
var db = new Database(COPY);

(async function () {
  console.log('═══ W-POS-DELIVERLATER — §P-12/§S-2 seam: sale completes the ORDER, the shipment stays DR until the pick ═══\n');

  // ── station ctx (the W-POS-WR/HOLD fixture rows) ──
  var pos = lc(db.prepare('SELECT * FROM c_pos WHERE c_pos_id=100').get());
  var plv = lc(db.prepare('SELECT m_pricelist_version_id v FROM m_pricelist_version WHERE m_pricelist_id=?').get(pos.m_pricelist_id));
  var priceStmt = db.prepare('SELECT pricestd FROM m_productprice WHERE m_pricelist_version_id=? AND m_product_id=?');
  var stationDt = lc(db.prepare('SELECT docsubtypeso FROM c_doctype WHERE c_doctype_id=?').get(pos.c_doctype_id));
  var ctx = {
    pos: pos,
    priceOf: function (pid) { return lc(priceStmt.get(plv.v, pid)) || null; },
    bomOf: function () { return []; },   // non-BOM cart; backflush owns its witness (W-POS-BACKFLUSH)
    wrPolicy: stationDt.docsubtypeso === 'WR' ? { isautogenerateinout: 'Y', isautogenerateinvoice: 'Y' } : {}
  };

  // ── 1. POLICY FROM THE DICTIONARY: the doctype 132 row, read verbatim ──
  var dt132 = lc(db.prepare('SELECT * FROM c_doctype WHERE c_doctype_id=132').get());
  verdict(dt132.docsubtypeso === 'SO' && dt132.isautogenerateinout === 'N' && dt132.isautogenerateinvoice === 'N',
    'doctype 132 "' + dt132.name + '" = SOO/SO, IsAutoGenerateInout=N, IsAutoGenerateInvoice=N (dictionary verbatim)',
    'docsubtypeso=' + dt132.docsubtypeso + ' inout=' + dt132.isautogenerateinout + ' invoice=' + dt132.isautogenerateinvoice);
  var pol = POS.deliverLaterPolicy(dt132);
  verdict(pol.ok === true && pol.shipDoctypeId === 120,
    'deliverLaterPolicy DERIVED from the row: flags verbatim + shipment doctype = the dictionary link C_DocTypeShipment_ID',
    'shipDoctypeId=' + pol.shipDoctypeId);
  var wrRefuse = POS.deliverLaterPolicy(lc(db.prepare('SELECT * FROM c_doctype WHERE c_doctype_id=135').get()));
  verdict(wrRefuse.ok === false && wrRefuse.reason === 'cash-and-carry',
    'the WR doctype REFUSES the deliver-later path (cash-and-carry → buildSaleGroup) — dispatch is data, not code', wrRefuse.reason);
  // invoice timing: EXTRACTED, not hardcoded — the C_Order.InvoiceRule dictionary default
  var invRule = db.prepare("SELECT c.DefaultValue v FROM AD_Column c JOIN AD_Table t ON t.AD_Table_ID=c.AD_Table_ID WHERE t.TableName='C_Order' AND c.ColumnName='InvoiceRule'").get().v;
  verdict(invRule === 'I', 'C_Order.InvoiceRule dictionary default EXTRACTED = ' + invRule + ' (Immediate) — the named invoice-timing source', 'AD_Column.DefaultValue');
  // FSM: CO is legal from DR for doctype 132 (the gate is ad_docfsm, not POS code)
  var rec = { docStatus: 'DR', isSOTrx: 'Y', doctypeId: 132, processing: 'N' };
  var disp = F.dispatchOrder(db, rec, 'CO', { docSubTypeSO: dt132.docsubtypeso });
  verdict(disp.ok && disp.to === 'CO', 'ad_docfsm.dispatchOrder DR --CO--> CO for doctype 132 (FSM gates Complete)', JSON.stringify(disp));

  // ── 2. THE SEAM SHAPE: ring a real cart → ONE group, order CO, shipment born DR, no invoice ──
  var keys = db.prepare('SELECT c_poskey_id, m_product_id FROM c_poskey WHERE c_poskeylayout_id=? AND m_product_id IS NOT NULL ORDER BY c_poskey_id LIMIT 2').all(pos.c_poskeylayout_id).map(lc);
  var cart = [POS.ringLine(ctx, keys[0].m_product_id, 2), POS.ringLine(ctx, keys[1].m_product_id, 1)];
  var BP = 112; // the GardenWorld walk-in (seed c_pos.c_bpartnercashtrx_id is NULL — explicit, §-named)
  var g = POS.buildDeliverLaterWithShipment(ctx, cart, { orderId: 950001, inoutId: 950002, c_bpartner_id: BP, doctype: dt132, invoiceRule: invRule });
  verdict(g.ok === true && g.newVerbs.length === 0, 'buildDeliverLaterGroup ok, newVerbs=[] (rides buildDoc + completeOrder only)', 'verbs=' + g.verbsUsed.join(','));
  verdict(g.order.c_doctype_id === 132, 'the order is on doctype 132 (NOT the station\'s WR 135) — the sale doctype is the policy key', 'c_doctype_id=' + g.order.c_doctype_id);
  var statuses = g.ops.filter(function (o) { return o.op_type === 'SET_STATUS'; }).map(function (o) { return o.table + '→' + o.doc_status; });
  verdict(statuses.join(',') === 'C_Order→CO', 'EXACTLY ONE status walk in the group: C_Order→CO (the shipment is born DR by absence of SET_STATUS)', statuses.join(','));
  verdict(g.ops.filter(function (o) { return o.table === 'C_Invoice' || o.table === 'C_InvoiceLine'; }).length === 0 && g.invoiceTiming.inGroup === false && g.invoiceTiming.rule === 'I',
    'NO invoice in the group (IsAutoGenerateInvoice=N); timing NAMED from the dictionary: InvoiceRule=' + g.invoiceTiming.rule, g.invoiceTiming.source);
  verdict(g.ops.filter(function (o) { return o.op_type === 'CONSUME'; }).length === 0, 'NO backflush in the sale group (§P-3 CONSUME belongs to the act that moves goods — the pick)', '');
  // replay equality: the shipment subset == the engine's OWN createShipment on the same order+lines
  var shipWant = E.VERBS.createShipment(g.order, g.soLines);
  function stripIds(o) { var c = {}; for (var k in o) if (k !== 'm_inout_id' && k !== 'm_warehouse_id' && k !== 'c_doctype_id') c[k] = o[k]; return c; }
  var shipGot = g.ops.filter(function (o) { return o.table === 'M_InOut' || o.table === 'M_InOutLine'; }).map(stripIds);
  verdict(JSON.stringify(shipGot) === JSON.stringify(shipWant), 'shipment ops == E.createShipment(order, lines) — REPLAY EQUAL (same buildDoc spec as WR, movementtype C-)', 'ops=' + shipGot.length);
  var shipHdr = g.ops.filter(function (o) { return o.table === 'M_InOut' && o.op_type === 'CREATE_DOCUMENT'; })[0];
  verdict(shipHdr.c_doctype_id === 120, 'the shipment doc rides the DICTIONARY link doctype 120 (132→C_DocTypeShipment_ID), not a POS choice', 'c_doctype_id=' + shipHdr.c_doctype_id);

  // the sacred transaction: ONE signed group, chain holds
  var SQL = await initSqlJs();
  var opDb = new SQL.Database(); KO.ensureTable(opDb);
  function commit(ops, ts) { return KO.commitGroup(opDb, ops.map(function (o) { return { op_type: o.op_type, params: o }; }), { baseTs: ts }); }
  var r1 = await commit(g.ops, 1718100000000);
  var chain1 = await KO.verifyChain(opDb);
  verdict(r1.committed && r1.sealed && chain1.ok, 'commitGroup: ' + g.ops.length + ' ops sealed atomically under ONE gid, chainOk=Y', 'gid=' + r1.gid);
  console.log('§POS-DELIVERLATER sale order=950001 doctype=132(SO) ops=' + g.ops.length + ' statuses=[' + statuses.join(',') +
    '] inout=950002 born=DR invoice=none(InvoiceRule=' + g.invoiceTiming.rule + ' named) gid=' + r1.gid + ' chainOk=' + (chain1.ok ? 'Y' : 'N'));

  // ── fold the group into the ledger copy (what the substrate does) ──
  var lineOps = g.ops.filter(function (o) { return o.table === 'C_OrderLine'; });
  var gt = lineOps.reduce(function (s, o) { return s.add(BigDecimal.of(String(o.linenetamt))); }, BigDecimal.ZERO).setScale(2, BigDecimal.RoundingMode.HALF_UP).toString();
  db.prepare('INSERT INTO c_order (c_order_id, issotrx, c_doctype_id, m_warehouse_id, c_bpartner_id, c_pos_id, docstatus, grandtotal, ad_client_id, ad_org_id, isactive) VALUES (?,?,?,?,?,?,?,?,?,?,?)')
    .run(950001, 'Y', 132, pos.m_warehouse_id, BP, pos.c_pos_id, 'CO', gt, pos.ad_client_id, pos.ad_org_id, 'Y');
  lineOps.forEach(function (o) {
    db.prepare('INSERT INTO c_orderline (c_orderline_id, c_order_id, m_product_id, qtyordered, priceactual, linenetamt, ad_client_id, ad_org_id, isactive) VALUES (?,?,?,?,?,?,?,?,?)')
      .run(o.source_line_id, 950001, o.m_product_id, o.qtyordered, o.priceactual, o.linenetamt, pos.ad_client_id, pos.ad_org_id, 'Y');
  });
  db.prepare('INSERT INTO m_inout (m_inout_id, issotrx, c_doctype_id, c_order_id, m_warehouse_id, c_bpartner_id, movementtype, docstatus, ad_client_id, ad_org_id, isactive) VALUES (?,?,?,?,?,?,?,?,?,?,?)')
    .run(950002, 'Y', 120, 950001, pos.m_warehouse_id, BP, 'C-', 'DR', pos.ad_client_id, pos.ad_org_id, 'Y');
  var shipLineOps = g.ops.filter(function (o) { return o.table === 'M_InOutLine'; });
  shipLineOps.forEach(function (o, i) {
    db.prepare('INSERT INTO m_inoutline (m_inoutline_id, m_inout_id, c_orderline_id, m_product_id, movementqty, ad_client_id, ad_org_id, isactive) VALUES (?,?,?,?,?,?,?,?)')
      .run(950021 + i, 950002, o.source_line_id, o.m_product_id, o.movementqty, pos.ad_client_id, pos.ad_org_id, 'Y');
  });

  // ── 3. ON-HAND UNMOVED + the §S-2 selector sees the open shipment ──
  var pids = [keys[0].m_product_id, keys[1].m_product_id];
  function shipEvents() {  // movement events = lines of COMPLETED shipments only (the honest ledger fold)
    return db.prepare("SELECT l.m_product_id, io.movementtype, l.movementqty FROM m_inoutline l JOIN m_inout io ON io.m_inout_id=l.m_inout_id WHERE io.docstatus='CO' AND l.m_product_id IN (?,?)").all(pids[0], pids[1]).map(lc);
  }
  function fold(evs) {
    return E.qtyOnHand(evs, { keyOf: function (t) { return t.m_product_id; }, typeOf: function (t) { return t.movementtype; }, absQtyOf: function (t) { return Math.abs(Number(t.movementqty)); } });
  }
  // the DR shipment contributes NO completed-doc events: the fold over the sale's products is untouched
  var afterSale = fold(shipEvents());
  console.log('§POS-DELIVERLATER onhand after-sale fold(completed-docs)=' + JSON.stringify(afterSale) + ' — the DR shipment moved NOTHING');
  var openBefore = db.prepare("SELECT COUNT(*) n FROM m_inoutline l JOIN m_inout io ON io.m_inout_id=l.m_inout_id WHERE io.docstatus='CO' AND io.m_inout_id=950002").get().n;
  verdict(openBefore === 0, 'on-hand UNMOVED after the sale: the 950002 shipment is DR — zero completed-doc movement events from this sale', 'completedLines=' + openBefore);
  // §S-2 selector: open POS-generated M_InOut docs (docstatus IN ('DR','IP'))
  var sel = db.prepare("SELECT io.m_inout_id, io.docstatus FROM m_inout io JOIN c_order o ON o.c_order_id=io.c_order_id WHERE io.docstatus IN ('DR','IP') AND o.c_pos_id IS NOT NULL").all().map(lc);
  verdict(sel.some(function (r) { return r.m_inout_id === 950002; }),
    'the shipment SURFACES in the §S-2 selector (docstatus IN (\'DR\',\'IP\'), POS-generated via c_order.c_pos_id)', 'rows=' + JSON.stringify(sel));
  console.log('§S-2 selector open-pos-docs=' + JSON.stringify(sel) + ' (the walk\'s honest source — wh route reads THIS)');

  // ── 4. COMPLETION-BY-PICK: confirm gate first, then scan-commit with a short-pick ──
  var inoutRow = lc(db.prepare('SELECT m_inout_id, docstatus FROM m_inout WHERE m_inout_id=950002').get());
  var ioLines = db.prepare('SELECT m_inoutline_id, m_product_id, movementqty FROM m_inoutline WHERE m_inout_id=? ORDER BY m_inoutline_id').all(950002).map(lc);
  var dt148 = lc(db.prepare('SELECT * FROM c_doctype WHERE c_doctype_id=148').get());
  var gated = POS.completeShipmentOps(inoutRow, ioLines, dt148, {});
  verdict(gated.ok === false && gated.reason === 'confirm-gated',
    'a confirm-demanding doctype (148 IsPickQAConfirm=Y) REFUSES the direct path → routes to inout_confirm (the W-WH-CONFIRM gate)', gated.hint);
  var dt120 = lc(db.prepare('SELECT * FROM c_doctype WHERE c_doctype_id=120').get());
  // §S-4 stepper: line 0 short-picked 2→1, line 1 picked in full
  var pick = POS.completeShipmentOps(inoutRow, ioLines, dt120, { pickedQtyOf: function (i) { return i === 0 ? 1 : ioLines[i].movementqty; } });
  verdict(pick.ok === true && pick.newVerbs.length === 0, 'scan-commit group ok on doctype 120 (no confirm demanded)', 'ops=' + pick.ops.length);
  var pickStatuses = pick.ops.filter(function (o) { return o.op_type === 'SET_STATUS'; }).map(function (o) { return o.table + '→' + o.doc_status; });
  var reduced = pick.ops.filter(function (o) { return o.op_type === 'UPDATE_LINE'; });
  verdict(pickStatuses.join(',') === 'M_InOut→CO' && reduced.length === 1 && Number(reduced[0].movementqty) === 1,
    'short-pick REDUCES MovementQty (2→1, the extracted SO-side rule — no difference doc) then M_InOut→CO', JSON.stringify(reduced));
  var r2 = await commit(pick.ops, 1718100600000);
  var chain2 = await KO.verifyChain(opDb);
  verdict(r2.committed && chain2.ok, 'pick group sealed; chain holds across BOTH groups (sale + pick = two signed acts, one ledger)', 'gid=' + r2.gid + ' len=' + chain2.len);
  // fold the pick: line qty reduced, shipment completed
  db.prepare('UPDATE m_inoutline SET movementqty=? WHERE m_inoutline_id=?').run(1, reduced[0].id);
  db.prepare("UPDATE m_inout SET docstatus='CO' WHERE m_inout_id=950002").run();
  var afterPick = fold(shipEvents());
  // C- polarity: the pick DECREASES on-hand — movedBy = the fold's drop across the sale's products
  var movedBy = pids.reduce(function (s, p) { return s + ((afterSale[p] || 0) - (afterPick[p] || 0)); }, 0);
  var pickedSum = pick.movements.reduce(function (s, m) { return s + Number(m.movementqty); }, 0);
  var askedSum = ioLines.reduce(function (s, l) { return s + Number(l.movementqty); }, 0);
  verdict(movedBy === pickedSum && pickedSum === 2 && askedSum === 3,
    'on-hand moves by the PICKED qty (2), not the asked qty (3) — the C- spine folds what actually left the bin',
    'moved=' + movedBy + ' picked=' + pickedSum + ' asked=' + askedSum);
  console.log('§POS-DELIVERLATER pick inout=950002 CO picked=' + pickedSum + '/' + askedSum + ' (short-pick line0 2→1) onhand-delta=-' + movedBy + ' gid=' + r2.gid + ' chainOk=' + (chain2.ok ? 'Y' : 'N'));
  // the selector no longer offers it (picked docs leave the route source)
  var selAfter = db.prepare("SELECT io.m_inout_id FROM m_inout io JOIN c_order o ON o.c_order_id=io.c_order_id WHERE io.docstatus IN ('DR','IP') AND o.c_pos_id IS NOT NULL").all();
  verdict(selAfter.length === 0, 'after the pick the §S-2 selector is EMPTY — a completed shipment never routes twice', 'rows=' + selAfter.length);

  // ── §FALSIFIER 1: the WR sale leaves ZERO open docs (W-POS-WR regression — same engine, untouched) ──
  var wrG = POS.buildSaleGroup({ pos: pos, priceOf: ctx.priceOf, bomOf: ctx.bomOf, wrPolicy: { isautogenerateinout: 'Y', isautogenerateinvoice: 'Y' } },
    [POS.ringLine(ctx, keys[0].m_product_id, 2), POS.ringLine(ctx, keys[1].m_product_id, 1)],
    { orderId: 960001, inoutId: 960002, invoiceId: 960003, c_bpartner_id: BP });
  var wrStatuses = wrG.ops.filter(function (o) { return o.op_type === 'SET_STATUS'; }).map(function (o) { return o.table + '→' + o.doc_status; });
  verdict(wrG.ok && wrStatuses.join(',') === 'C_Order→CO,M_InOut→CO,C_Invoice→CO',
    '§FALSIFIER 1: the WR sale (doctype 135) completes ALL THREE docs in-group — ZERO open docs, nothing for the walk to double-move', wrStatuses.join(','));
  verdict(wrG.order.c_doctype_id === pos.c_doctype_id, '§FALSIFIER 1: WR order doctype = the station\'s (no doctypeId leak from the deliver-later path)', 'c_doctype_id=' + wrG.order.c_doctype_id);
  console.log('§FALSIFIER wr-regression statuses=[' + wrStatuses.join(',') + '] open-docs=0 (W-POS-WR shape unchanged)');

  // ── §FALSIFIER 2: double-complete of the (now CO) shipment is REFUSED ──
  var again = POS.completeShipmentOps(lc(db.prepare('SELECT m_inout_id, docstatus FROM m_inout WHERE m_inout_id=950002').get()), ioLines, dt120, {});
  verdict(again.ok === false && again.reason === 'not-open' && again.docstatus === 'CO',
    '§FALSIFIER 2: double-complete REFUSED (FSM not-open — a CO shipment cannot complete again)', JSON.stringify(again));
  console.log('§FALSIFIER double-complete refused reason=' + again.reason + ' docstatus=' + again.docstatus);

  // ── §FALSIFIER 3: totals to the cent — sealed master prices, BigDecimal fold, nothing invented ──
  var centsOk = g.soLines.every(function (l) {
    var sealed = BigDecimal.of(String(ctx.priceOf(l.m_product_id).pricestd)).setScale(2, BigDecimal.RoundingMode.HALF_UP);
    return BigDecimal.of(String(l.priceactual)).eq(sealed) &&
           BigDecimal.of(String(l.linenetamt)).eq(sealed.multiply(BigDecimal.of(String(l.qtyordered))).setScale(2, BigDecimal.RoundingMode.HALF_UP));
  });
  var gtDb = lc(db.prepare('SELECT grandtotal FROM c_order WHERE c_order_id=950001').get()).grandtotal;
  verdict(centsOk && POS.cartTotal(cart) === String(gtDb),
    '§FALSIFIER 3: every line = qty × SEALED master price to the cent; grandtotal ' + gtDb + ' = the BigDecimal fold of the lines', 'cartTotal=' + POS.cartTotal(cart));
  console.log('§FALSIFIER cents linenet=sealed×qty grandtotal=' + gtDb + ' maxDiff=0c');

  console.log('\n' + (fails === 0 ? '🟢 W-POS-DELIVERLATER PASS' : '🔴 W-POS-DELIVERLATER FAIL (' + fails + ')') +
    ' — the deliver-later sale (doctype 132, policy from the dictionary) completes the ORDER and births a DR shipment the §S-2 selector routes; the pick (confirm-gated when the doctype demands it) is what moves on-hand, by the picked qty; WR regression, double-complete and cent falsifiers hold.');
  db.close();
  process.exit(fails === 0 ? 0 : 1);
})().catch(function (e) { console.error('FATAL', e); process.exit(1); });
