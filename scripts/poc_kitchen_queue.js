#!/usr/bin/env node
// Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
// SPDX-License-Identifier: MIT
// ⚠ DO NOT REMOVE — Scope guard (prompts/RESUME_POS_KITCHEN_EINVOICE_OPS_PANELS.md §T2-SPEC).
//   Read the log after every run.
// poc_kitchen_queue.js — W-KDS-QUEUE: the Kitchen Display fold — "ordered, not yet delivered" as a
// FOLD over the op log (zero new business verbs; serve = pos_core's OWN completeShipmentOps).
//
// ISSUES IT PROVES (named):
//   1. ONE deliver-later sale folds to EXACTLY ONE open ticket — its lines are the sale's lines
//      verbatim (product + qty), its partner/order/doctype ride the ops, nothing invented.
//   2. A WR cash-and-carry sale folds to ZERO open tickets — its M_InOut completes IN-group, so the
//      queue is genuinely "QtyDelivered < QtyOrdered", not "all shipments".
//   3. SERVE on the folded ticket = completeShipmentOps → M_InOut→CO in ONE signed group, chain
//      holds; the re-fold's queue is EMPTY (a served ticket leaves the kitchen).
//   4. A confirm-demanding shipment doctype (148 IsPickQAConfirm=Y) REFUSES serve
//      (reason=confirm-gated) — the W-WH-CONFIRM gate is not bypassed by the kitchen.
//   §FALSIFIER 1: double-serve REFUSED (FSM not-open on the re-folded CO ticket).
//   §FALSIFIER 2: an EMPTY op log folds an EMPTY queue (no phantom tickets).
//   §FALSIFIER 3: two open tickets queue OLDEST-FIRST (op-log id order, the kitchen's FIFO).
//
// NON-INVENT: cart = real c_poskey rows of station 100 priced off real m_productprice rows
//   (ad_seed_fullwidth.db); doctype rows EXTRACTED from the same seed; deterministic ids + explicit baseTs.
// Implementing RESUME_POS_KITCHEN_EINVOICE_OPS_PANELS.md §T2-SPEC — Witness: W-KDS-QUEUE
// Run: bash build/erp/run_witness.sh scripts/poc_kitchen_queue.js   — then READ the log.
'use strict';
var path = require('path');
var fs = require('fs');
var Database = require('better-sqlite3');
var initSqlJs = require('sql.js');
var POS = require(path.join(__dirname, '..', 'build', 'erp', 'pos_core.js'));
var KDS = require(path.join(__dirname, '..', 'build', 'erp', 'kitchen_core.js'));

global.window = global.window || {};
global.crypto = global.crypto || require('crypto').webcrypto;
require(path.join(__dirname, '..', 'build', 'erp', 'kernel_ops.js'));
var KO = global.window.KernelOps;

var fails = 0;
function verdict(ok, label, detail) { if (!ok) fails++; console.log('   ' + (ok ? '🟢' : '🔴') + ' ' + label + (detail ? ' — ' + detail : '')); }
function lc(r) { if (!r) return r; var o = {}; for (var k in r) o[k.toLowerCase()] = r[k]; return o; }

var SEED = path.join(__dirname, '..', 'build', 'erp', 'ad_seed_fullwidth.db');
var COPY = '/tmp/poc_kitchen_queue_seed.db';
fs.copyFileSync(SEED, COPY);
var db = new Database(COPY);

(async function () {
  console.log('═══ W-KDS-QUEUE — the Kitchen Display fold: open C- shipments = the kitchen; serve = completeShipmentOps ═══\n');

  // ── station ctx (the W-POS-DELIVERLATER fixture, verbatim) ──
  var pos = lc(db.prepare('SELECT * FROM c_pos WHERE c_pos_id=100').get());
  var plv = lc(db.prepare('SELECT m_pricelist_version_id v FROM m_pricelist_version WHERE m_pricelist_id=?').get(pos.m_pricelist_id));
  var priceStmt = db.prepare('SELECT pricestd FROM m_productprice WHERE m_pricelist_version_id=? AND m_product_id=?');
  var ctx = {
    pos: pos,
    priceOf: function (pid) { return lc(priceStmt.get(plv.v, pid)) || null; },
    bomOf: function () { return []; },
    wrPolicy: { isautogenerateinout: 'Y', isautogenerateinvoice: 'Y' }
  };
  var dt132 = lc(db.prepare('SELECT * FROM c_doctype WHERE c_doctype_id=132').get());
  var dt120 = lc(db.prepare('SELECT * FROM c_doctype WHERE c_doctype_id=120').get());
  var dt148 = lc(db.prepare('SELECT * FROM c_doctype WHERE c_doctype_id=148').get());
  var invRule = db.prepare("SELECT c.DefaultValue v FROM AD_Column c JOIN AD_Table t ON t.AD_Table_ID=c.AD_Table_ID WHERE t.TableName='C_Order' AND c.ColumnName='InvoiceRule'").get().v;
  var keys = db.prepare('SELECT m_product_id FROM c_poskey WHERE c_poskeylayout_id=? AND m_product_id IS NOT NULL ORDER BY c_poskey_id LIMIT 2').all(pos.c_poskeylayout_id).map(lc);
  var BP = 112; // the GardenWorld walk-in (the W-POS-DELIVERLATER choice, §-named)

  var SQL = await initSqlJs();
  var opDb = new SQL.Database(); KO.ensureTable(opDb);
  function commit(ops, ts) { return KO.commitGroup(opDb, ops.map(function (o) { return { op_type: o.op_type, params: o }; }), { baseTs: ts }); }
  function opRows() {
    var r = opDb.exec('SELECT id, timestamp, op_type, parameters FROM kernel_ops ORDER BY id');
    return (r[0] ? r[0].values : []).map(function (v) { return { id: v[0], timestamp: v[1], op_type: v[2], parameters: v[3] }; });
  }

  // ── §FALSIFIER 2 first: the EMPTY log folds an EMPTY queue ──
  var q0 = KDS.queue(KDS.foldTickets(opRows()));
  verdict(q0.length === 0, '§FALSIFIER 2: empty op log → EMPTY kitchen queue (no phantom tickets)', 'tickets=' + q0.length);

  // ── 1. deliver-later sale → EXACTLY ONE open ticket, lines verbatim ──
  var cart1 = [POS.ringLine(ctx, keys[0].m_product_id, 2), POS.ringLine(ctx, keys[1].m_product_id, 1)];
  var g1 = POS.buildDeliverLaterGroup(ctx, cart1, { orderId: 970001, inoutId: 970002, c_bpartner_id: BP, doctype: dt132, invoiceRule: invRule });
  if (!g1.ok) { console.log('FATAL sale1 refused: ' + g1.reason); process.exit(1); }
  var r1 = await commit(g1.ops, 1718200000000);
  var q1 = KDS.queue(KDS.foldTickets(opRows()));
  verdict(q1.length === 1 && q1[0].m_inout_id === 970002 && q1[0].c_order_id === 970001,
    'ONE deliver-later sale → EXACTLY ONE open ticket (inout 970002 of order 970001)', 'queue=' + JSON.stringify(q1.map(function (t) { return t.m_inout_id; })));
  var t1 = q1[0];
  var linesMatch = t1.lines.length === g1.soLines.length && t1.lines.every(function (l, i) {
    return l.m_product_id === g1.soLines[i].m_product_id && Number(l.movementqty) === Number(g1.soLines[i].qtyordered);
  });
  verdict(linesMatch, 'the ticket\'s lines == the sale\'s lines VERBATIM (product + qty ride the ops, nothing invented)',
    JSON.stringify(t1.lines));
  verdict(t1.c_bpartner_id === BP && t1.c_doctype_id === 120 && t1.docstatus === 'DR',
    'ticket carries partner/shipment-doctype/status from the OPS (bp=' + t1.c_bpartner_id + ' dt=' + t1.c_doctype_id + ' status=' + t1.docstatus + ')', '');
  console.log('§KDS-FOLD tickets=1 inout=970002 lines=' + t1.lines.length + ' status=DR (sent-to-kitchen = born-DR shipment)');

  // ── 2. WR cash-and-carry sale → ZERO new open tickets ──
  var cart2 = [POS.ringLine(ctx, keys[0].m_product_id, 1)];
  var g2 = POS.buildSaleGroup(ctx, cart2, { orderId: 970101, inoutId: 970102, invoiceId: 970103, c_bpartner_id: BP });
  if (!g2.ok) { console.log('FATAL WR sale refused: ' + g2.reason); process.exit(1); }
  await commit(g2.ops, 1718200060000);
  var q2 = KDS.queue(KDS.foldTickets(opRows()));
  verdict(q2.length === 1 && q2[0].m_inout_id === 970002,
    'a WR cash-and-carry sale adds NOTHING to the queue (its M_InOut completes IN-group) — the queue IS "not yet delivered"',
    'queue=' + JSON.stringify(q2.map(function (t) { return t.m_inout_id; })));
  var all2 = KDS.foldTickets(opRows());
  var wrT = all2.filter(function (t) { return t.m_inout_id === 970102; })[0];
  verdict(!!wrT && wrT.docstatus === 'CO', 'the WR shipment IS folded — as already-served (docstatus CO from the in-group SET_STATUS)', 'docstatus=' + (wrT && wrT.docstatus));

  // ── 4 (before serving t1). confirm-gated doctype REFUSES serve ──
  var gated = KDS.serveOps(POS, t1, dt148);
  verdict(gated.ok === false && gated.reason === 'confirm-gated',
    'a confirm-demanding doctype (148 IsPickQAConfirm=Y) REFUSES serve → routes to inout_confirm (W-WH-CONFIRM gate intact)', gated.hint);
  console.log('§KDS-GATED inout=970002 dt=148 refused=' + gated.reason);

  // ── 3. SERVE the folded ticket → M_InOut→CO, ONE signed group, chain holds, queue empties ──
  var serve = KDS.serveOps(POS, t1, dt120);
  verdict(serve.ok === true && serve.newVerbs.length === 0, 'serveOps ok on doctype 120 — rides completeShipmentOps, newVerbs=[]', 'ops=' + serve.ops.length);
  var sStat = serve.ops.filter(function (o) { return o.op_type === 'SET_STATUS'; }).map(function (o) { return o.table + '→' + o.doc_status; });
  verdict(sStat.join(',') === 'M_InOut→CO' && serve.ops.filter(function (o) { return o.op_type === 'UPDATE_LINE'; }).length === 0,
    'full-qty serve = the bare M_InOut→CO (no short-pick UPDATE_LINE)', sStat.join(','));
  var r3 = await commit(serve.ops, 1718200120000);
  var chain = await KO.verifyChain(opDb);
  verdict(r3.committed && r3.sealed && chain.ok, 'serve group sealed; chain holds across sale+WR+serve', 'gid=' + r3.gid + ' len=' + chain.len);
  var q3 = KDS.queue(KDS.foldTickets(opRows()));
  verdict(q3.length === 0, 'after the serve the re-fold\'s queue is EMPTY — a served ticket leaves the kitchen', 'tickets=' + q3.length);
  console.log('§KDS-SERVE inout=970002 M_InOut→CO gid=' + r3.gid + ' chainOk=' + (chain.ok ? 'Y' : 'N') + ' queue-after=0');

  // ── §FALSIFIER 1: double-serve REFUSED on the re-folded CO ticket ──
  var t1co = KDS.foldTickets(opRows()).filter(function (t) { return t.m_inout_id === 970002; })[0];
  var again = KDS.serveOps(POS, t1co, dt120);
  verdict(again.ok === false && again.reason === 'not-open' && t1co.docstatus === 'CO',
    '§FALSIFIER 1: double-serve REFUSED (FSM not-open — the re-fold carries CO)', JSON.stringify({ reason: again.reason, docstatus: t1co.docstatus }));

  // ── §FALSIFIER 3: two open tickets queue OLDEST-FIRST (op-log order = kitchen FIFO) ──
  var g3 = POS.buildDeliverLaterGroup(ctx, [POS.ringLine(ctx, keys[0].m_product_id, 3)], { orderId: 970201, inoutId: 970202, c_bpartner_id: BP, doctype: dt132, invoiceRule: invRule });
  var g4 = POS.buildDeliverLaterGroup(ctx, [POS.ringLine(ctx, keys[1].m_product_id, 1)], { orderId: 970301, inoutId: 970302, c_bpartner_id: BP, doctype: dt132, invoiceRule: invRule });
  await commit(g3.ops, 1718200180000);
  await commit(g4.ops, 1718200240000);
  var q4 = KDS.queue(KDS.foldTickets(opRows()));
  verdict(q4.length === 2 && q4[0].m_inout_id === 970202 && q4[1].m_inout_id === 970302,
    '§FALSIFIER 3: two open tickets queue OLDEST-FIRST (970202 before 970302 — op-log id order, the kitchen FIFO)',
    'queue=' + JSON.stringify(q4.map(function (t) { return t.m_inout_id; })));
  verdict(q4[0].timestamp === 1718200180000 && q4[1].timestamp === 1718200240000,
    'ticket timestamps ride the LEDGER rows (age display = ledger time, never Date.now)', q4.map(function (t) { return t.timestamp; }).join(','));
  console.log('§KDS-FIFO queue=[970202,970302] oldest-first ts=[1718200180000,1718200240000]');

  console.log('\n' + (fails === 0 ? '🟢 W-KDS-QUEUE PASS' : '🔴 W-KDS-QUEUE FAIL (' + fails + ')') +
    ' — the kitchen queue is a FOLD (open C- shipments, oldest-first); WR sales never enter it; serve = ' +
    'completeShipmentOps (confirm-gate + double-serve FSM intact); zero new business verbs.');
  db.close();
  process.exit(fails === 0 ? 0 : 1);
})().catch(function (e) { console.error('FATAL', e); process.exit(1); });
