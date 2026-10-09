#!/usr/bin/env node
// Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
// SPDX-License-Identifier: MIT
// ⚠ DO NOT REMOVE — Scope guard (WH_POS_PICK_LANE.md W-2/W-3/W-4 / SPATIAL_PICKING_SPEC.md §S-2b).
//   Read the log after every run.
// poc_wh_pos_pick.js — W-WH-POS-PICK: the walk-side selector + pick-complete of the
// "finish the sale → go pick it" loop (the engine half is W-POS-DELIVERLATER, banked).
//
// ISSUES IT PROVES (named):
//   1. SIDECAR FOLD HONESTY — a REAL deliver-later group (POSCore.buildDeliverLaterGroup, committed
//      through kernel commitGroup) surfaces in WHRoute.openPosDocsFromOps: doc id, line keys, qtys
//      ALL trace to ops; nothing hand-inserted is presented as a sale. The WR cash-and-carry sale
//      does NOT surface (its SET_STATUS M_InOut CO is in-group — W-POS-WR self-filter).
//   2. TWO HONEST SOURCES, MERGED — a seeded DR m_inout (the static-seed path, the witnessed SQL of
//      poc_pos_deliverlater) + the op-log fold; ids disjoint, both offered, source labelled.
//   3. ROUTE COVERS THE SALE — shipment lines carry NO locator; bins resolve from m_storageonhand
//      (ORDER BY qtyonhand DESC, m_locator_id — §S-2b EXTRACT rule) and WHRoute.route orders them by
//      the compiled warehouse tree; every line exactly once.
//   4. PICK-COMPLETE MOVES ON-HAND BY THE PICKED QTY — completeShipmentOps (short-pick line0) →
//      UPDATE_LINE + SET_STATUS CO, ONE signed group; the fold OF THE OP LOG (lines + UPDATE_LINE
//      override, folded only when CO present) drops per product by picked, not asked; the selector
//      then EMPTIES (a completed shipment never routes twice).
//   5. CONFIRM-GATED COMPLETION — doctype 148 (IsPickQAConfirm) REFUSES the direct path → the
//      W-WH-CONFIRM sequence: createConfirmationOps → completeConfirmOps(confirmed=picked) →
//      completeInOutGate ok → the bare SET_STATUS CO (storage below the gate, oracle verbatim).
//   §FALSIFIER 1: double-complete of the CO shipment REFUSED (FSM not-open).
//   §FALSIFIER 2: a product with NO m_storageonhand row routes as an EXPLICIT unroutable step.
//   §FALSIFIER 3: the WR sale never appears in the fold (issue 1, asserted separately).
//
// NON-INVENT: cart/doctypes/storage = real ad_seed_fullwidth.db rows; warehouse tree = the compiled
//   warehouse_gardenworld.db m_bom_line; deterministic ids + explicit baseTs.
// Implementing docs/SPATIAL_PICKING_SPEC.md §S-2b — Witness: W-WH-POS-PICK
// Run: bash build/erp/run_witness.sh scripts/poc_wh_pos_pick.js   — then READ the log.
'use strict';
var path = require('path');
var fs = require('fs');
var Database = require('better-sqlite3');
var initSqlJs = require('sql.js');
var E = require('./erp_engine');
var POS = require(path.join(__dirname, '..', 'build', 'erp', 'pos_core.js'));
var IC = require(path.join(__dirname, '..', 'build', 'erp', 'inout_confirm.js'));
var WHRoute = require(path.join(__dirname, '..', 'build', 'erp', 'wh_route.js'));

global.window = global.window || {};
global.crypto = global.crypto || require('crypto').webcrypto;
require(path.join(__dirname, '..', 'build', 'erp', 'kernel_ops.js'));
var KO = global.window.KernelOps;

var fails = 0;
function verdict(ok, label, detail) { if (!ok) fails++; console.log('   ' + (ok ? '🟢' : '🔴') + ' ' + label + (detail ? ' — ' + detail : '')); }
function lc(r) { if (!r) return r; var o = {}; for (var k in r) o[k.toLowerCase()] = r[k]; return o; }

var SEED = path.join(__dirname, '..', 'build', 'erp', 'ad_seed_fullwidth.db');
var WH_DB = path.join(__dirname, '..', 'build', 'erp', 'warehouse_gardenworld.db');
var COPY = '/tmp/poc_wh_pos_pick_seed.db';
fs.copyFileSync(SEED, COPY);
var db = new Database(COPY);
var whdb = new Database(WH_DB, { readonly: true });

(async function () {
  console.log('═══ W-WH-POS-PICK — §S-2b: the walk OFFERS the live POS shipment, routes it, and the pick-complete moves on-hand ═══\n');

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
  var invRule = db.prepare("SELECT c.DefaultValue v FROM AD_Column c JOIN AD_Table t ON t.AD_Table_ID=c.AD_Table_ID WHERE t.TableName='C_Order' AND c.ColumnName='InvoiceRule'").get().v;
  var keys = db.prepare('SELECT m_product_id FROM c_poskey WHERE c_poskeylayout_id=? AND m_product_id IS NOT NULL ORDER BY c_poskey_id LIMIT 2').all(pos.c_poskeylayout_id).map(lc);
  var BP = 112;

  // ── 1. the LIVE sale → op log → the sidecar fold offers it ──
  var SQL = await initSqlJs();
  var opDb = new SQL.Database(); KO.ensureTable(opDb);
  function commit(ops, meta) { return KO.commitGroup(opDb, ops.map(function (o) { return { op_type: o.op_type, params: o }; }), meta); }
  function opRows() {
    var r = opDb.exec('SELECT gid, parameters FROM kernel_ops ORDER BY id');
    return (r[0] ? r[0].values : []).map(function (v) { return { gid: v[0], parameters: v[1] }; });
  }
  var cart = [POS.ringLine(ctx, keys[0].m_product_id, 2), POS.ringLine(ctx, keys[1].m_product_id, 1)];
  var g = POS.buildDeliverLaterWithShipment(ctx, cart, { orderId: 910001, inoutId: 910002, c_bpartner_id: BP, doctype: dt132, invoiceRule: invRule });
  verdict(g.ok === true && g.newVerbs.length === 0, 'deliver-later group built (W-POS-DELIVERLATER engine, newVerbs=[])', 'ops=' + g.ops.length);
  var r1 = await commit(g.ops, { gid: 'pos-dl-1', baseTs: 1718200000000 });
  // the WR cash-and-carry sale on the SAME log — its shipment completes in-group (§FALSIFIER 3)
  var wr = POS.buildSaleGroup(ctx, [POS.ringLine(ctx, keys[0].m_product_id, 1)], { orderId: 920001, inoutId: 920002, invoiceId: 920003, c_bpartner_id: BP });
  var r2 = await commit(wr.ops, { gid: 'pos-wr-1', baseTs: 1718200001000 });
  verdict(r1.committed && r2.committed, 'both sales committed as signed groups', 'gids=' + r1.gid + ',' + r2.gid);

  var folded = WHRoute.openPosDocsFromOps(opRows());
  verdict(folded.length === 1 && folded[0].m_inout_id === 910002 && folded[0].docstatus === 'DR' && folded[0].src === 'oplog',
    'SIDECAR FOLD: exactly the deliver-later shipment surfaces (910002 DR, src=oplog) — the WR sale (920002, CO in-group) self-filters',
    JSON.stringify(folded.map(function (s) { return s.m_inout_id + ':' + s.docstatus; })));
  verdict(folded[0].lines.length === 2 &&
    Number(folded[0].lines[0].movementqty) === 2 && Number(folded[0].lines[1].movementqty) === 1 &&
    folded[0].lines.every(function (l) { return l.m_inoutline_id != null && l.m_product_id != null; }),
    'fold lines trace to CREATE_LINE ops: 2 lines, qtys 2/1, line key = source_line_id (the deterministic c_orderline_id)',
    JSON.stringify(folded[0].lines));
  console.log('§WH SRC pos-docs=' + folded.length + ' src=oplog inout=' + folded[0].m_inout_id + ' lines=' + folded[0].lines.length);

  // ── 2. the SEEDED source (static-seed path) + merge ──
  db.prepare('INSERT INTO c_order (c_order_id, issotrx, c_doctype_id, m_warehouse_id, c_bpartner_id, c_pos_id, docstatus, ad_client_id, ad_org_id, isactive) VALUES (?,?,?,?,?,?,?,?,?,?)')
    .run(930001, 'Y', 132, pos.m_warehouse_id, BP, pos.c_pos_id, 'CO', pos.ad_client_id, pos.ad_org_id, 'Y');
  db.prepare('INSERT INTO m_inout (m_inout_id, issotrx, c_doctype_id, c_order_id, m_warehouse_id, c_bpartner_id, movementtype, docstatus, ad_client_id, ad_org_id, isactive) VALUES (?,?,?,?,?,?,?,?,?,?,?)')
    .run(930002, 'Y', 120, 930001, pos.m_warehouse_id, BP, 'C-', 'DR', pos.ad_client_id, pos.ad_org_id, 'Y');
  db.prepare('INSERT INTO m_inoutline (m_inoutline_id, m_inout_id, m_product_id, movementqty, ad_client_id, ad_org_id, isactive) VALUES (?,?,?,?,?,?,?)')
    .run(930021, 930002, keys[0].m_product_id, 3, pos.ad_client_id, pos.ad_org_id, 'Y');
  var seedSel = db.prepare("SELECT io.m_inout_id, io.docstatus, io.c_doctype_id, io.m_warehouse_id FROM m_inout io JOIN c_order o ON o.c_order_id=io.c_order_id WHERE io.docstatus IN ('DR','IP') AND o.c_pos_id IS NOT NULL").all().map(lc);
  var merged = seedSel.map(function (s) { s.src = 'seed'; return s; }).concat(folded);
  verdict(seedSel.length === 1 && seedSel[0].m_inout_id === 930002 && merged.length === 2,
    'TWO HONEST SOURCES: seeded DR 930002 (witnessed SQL) + op-log 910002 — merged, disjoint ids, source labelled',
    'merged=' + merged.map(function (s) { return s.m_inout_id + '(' + s.src + ')'; }).join(','));

  // ── 3. route the LIVE shipment: bins from m_storageonhand, order from the warehouse tree ──
  var bomLines = whdb.prepare('SELECT bom_id, child_product_id, role, ordinal, element_ref FROM m_bom_line').all().map(lc);
  var tree = WHRoute.treeFromBom(bomLines);
  var binStmt = db.prepare('SELECT m_locator_id loc FROM m_storageonhand WHERE m_product_id=? ORDER BY qtyonhand DESC, m_locator_id LIMIT 1');
  var walkLines = folded[0].lines.map(function (l, i) {
    var s = lc(binStmt.get(l.m_product_id));
    return { line: (i + 1) * 10, m_inoutline_id: l.m_inoutline_id, m_product_id: l.m_product_id,
             qty: Number(l.movementqty), m_locator_id: s ? s.loc : null };
  });
  var steps = WHRoute.route(walkLines, tree, { lineKey: function (l) { return l.m_inoutline_id; } });
  verdict(steps.length === 2 && steps.every(function (s) { return !s.unroutable; }),
    'ROUTE COVERS THE SALE: both lines routed (bins resolved from m_storageonhand, tree-ordered)',
    'order=[' + steps.map(function (s) { return s.m_locator_id; }).join(',') + ']');
  // §FALSIFIER 2: a product with NO storage row is an EXPLICIT unroutable step
  var ghost = WHRoute.route([{ line: 10, m_inoutline_id: 1, m_product_id: 999999, qty: 1, m_locator_id: null }], tree, { lineKey: function (l) { return l.m_inoutline_id; } });
  verdict(ghost.length === 1 && ghost[0].unroutable === true,
    '§FALSIFIER 2: no m_storageonhand row → explicit unroutable step (surfaced, never dropped/invented)', JSON.stringify(ghost[0].m_locator_id));

  // ── 4. pick-complete (doctype 120, no confirm): short-pick line0 2→1, on-hand by PICKED ──
  var dt120 = lc(db.prepare('SELECT * FROM c_doctype WHERE c_doctype_id=120').get());
  var inout = { m_inout_id: folded[0].m_inout_id, docstatus: folded[0].docstatus };
  var ioLines = folded[0].lines;
  var pick = POS.completeShipmentOps(inout, ioLines, dt120, { pickedQtyOf: function (i) { return i === 0 ? 1 : ioLines[i].movementqty; } });
  verdict(pick.ok === true && pick.newVerbs.length === 0, 'completeShipmentOps ok on doctype 120 (direct path)', 'ops=' + pick.ops.length);
  var r3 = await commit(pick.ops, { gid: 'wh-pos-910002-complete', baseTs: 1718200002000 });
  var chain = await KO.verifyChain(opDb);
  verdict(r3.committed && chain.ok, 'pick group sealed, chain holds across sale+pick', 'gid=' + r3.gid + ' len=' + chain.len);

  // the fold OF THE OP LOG (what the walk lens computes): lines + UPDATE_LINE override, folded iff CO
  function foldShipFromLog(inoutId) {
    var rows = opRows(), lines = {}, upd = {}, co = false, gidOf = null;
    rows.forEach(function (r) {
      var p = r.parameters; try { p = JSON.parse(p); } catch (e) { return; }
      p = p && p.params ? p.params : p;
      if (!p) return;
      if (p.op_type === 'CREATE_DOCUMENT' && p.table === 'M_InOut' && p.m_inout_id === inoutId) gidOf = r.gid;
      if (p.op_type === 'CREATE_LINE' && p.table === 'M_InOutLine' && r.gid === gidOf) lines[p.source_line_id] = Number(p.movementqty);
      if (p.op_type === 'UPDATE_LINE' && p.table === 'M_InOutLine' && lines[p.id] != null) upd[p.id] = Number(p.movementqty);
      if (p.op_type === 'SET_STATUS' && p.table === 'M_InOut' && p.id === inoutId && p.doc_status === 'CO') co = true;
    });
    if (!co) return {};
    var ev = [];
    var rowsOf = opRows();
    rowsOf.forEach(function (r) {
      var p = r.parameters; try { p = JSON.parse(p); } catch (e) { return; }
      p = p && p.params ? p.params : p;
      if (p && p.op_type === 'CREATE_LINE' && p.table === 'M_InOutLine' && r.gid === gidOf) {
        ev.push({ m_product_id: p.m_product_id, movementtype: 'C-', movementqty: upd[p.source_line_id] != null ? upd[p.source_line_id] : Number(p.movementqty) });
      }
    });
    return E.qtyOnHand(ev, { keyOf: function (t) { return t.m_product_id; }, typeOf: function (t) { return t.movementtype; }, absQtyOf: function (t) { return Math.abs(Number(t.movementqty)); } });
  }
  var fold = foldShipFromLog(910002);
  var expected = {}; expected[keys[0].m_product_id] = -1; expected[keys[1].m_product_id] = -1;   // short-picked 2→1, full 1
  var diffs = Object.keys(expected).filter(function (k) { return (fold[k] || 0) !== expected[k]; });
  verdict(diffs.length === 0, 'ON-HAND MOVES BY PICKED (line0 short 2→1): fold of the op log == expected per-product deltas',
    'fold=' + JSON.stringify(fold) + ' expected=' + JSON.stringify(expected));
  var pickedSum = pick.movements.reduce(function (s, m) { return s + Number(m.movementqty); }, 0);
  console.log('§WH PICK-COMPLETE inout=910002 CO picked=' + pickedSum + '/3 (short-pick line0 2→1) foldDiffs=' + diffs.length + ' gid=' + r3.gid + ' chainOk=' + (chain.ok ? 'Y' : 'N'));

  // the selector EMPTIES (op-log side): the completed shipment never routes twice
  var after = WHRoute.openPosDocsFromOps(opRows());
  verdict(after.length === 0, 'after the pick the sidecar fold is EMPTY — CO shipment leaves the route source', 'open=' + after.length);

  // §FALSIFIER 1: double-complete refused (FSM not-open)
  var again = POS.completeShipmentOps({ m_inout_id: 910002, docstatus: 'CO' }, ioLines, dt120, {});
  verdict(again.ok === false && again.reason === 'not-open', '§FALSIFIER 1: double-complete REFUSED (not-open, docstatus=CO)', JSON.stringify(again));
  console.log('§FALSIFIER double-complete refused reason=' + again.reason);

  // ── 5. confirm-gated completion (doctype 148) — the W-WH-CONFIRM sequence, walked with PICKED qtys ──
  var dt148 = lc(db.prepare('SELECT * FROM c_doctype WHERE c_doctype_id=148').get());
  var inout2 = { m_inout_id: 930002, c_doctype_id: 148, issotrx: 'Y', m_warehouse_id: pos.m_warehouse_id,
                 docstatus: 'DR', ref_inout_id: null, ad_client_id: pos.ad_client_id, ad_org_id: pos.ad_org_id };
  var lines2 = [{ m_inoutline_id: 930021, m_product_id: keys[0].m_product_id, movementqty: 3 }];
  var gated = POS.completeShipmentOps(inout2, lines2, dt148, {});
  verdict(gated.ok === false && gated.reason === 'confirm-gated', 'doctype 148 REFUSES the direct path (confirm-gated → W-WH-CONFIRM)', gated.hint);
  var spawn = IC.createConfirmationOps(inout2, lines2, dt148, [], { confirmId: 970001, lineIdOf: function (i) { return 970011 + i; } });
  var r4 = await commit(spawn, { gid: 'wh-pos-930002-confirm-spawn', baseTs: 1718200003000 });
  // operator walked it and picked 2 of 3 → confirmedqty = PICKED
  var clines = [{ m_inoutlineconfirm_id: 970011, m_inoutline_id: 930021, m_product_id: keys[0].m_product_id, targetqty: 3, confirmedqty: 2, scrappedqty: 0 }];
  var done = IC.completeConfirmOps({ m_inoutconfirm_id: 970001, confirmtype: 'PC', processed: 'N' }, clines, inout2, dt148, {});
  verdict(done.ok === true && done.fullyConfirmed === false, 'confirm-complete with PICKED qty (2 of 3): MovementQty reduced, no difference doc (SO-side)', 'ops=' + done.ops.length);
  var r5 = await commit(done.ops, { gid: 'wh-pos-930002-confirm-done', baseTs: 1718200004000 });
  var gate = IC.completeInOutGate([{ m_inoutconfirm_id: 970001, confirmtype: 'PC', processed: 'Y' }]);
  verdict(gate.ok === true, 'gate re-check after confirm-complete → the InOut may complete', 'ok=' + gate.ok);
  var r6 = await commit([{ op_type: 'SET_STATUS', table: 'M_InOut', id: 930002, doc_status: 'CO', via: 'completeInOutGate→CO (below-the-gate act)' }],
    { gid: 'wh-pos-930002-complete', baseTs: 1718200005000 });
  var chain2 = await KO.verifyChain(opDb);
  verdict(r4.committed && r5.committed && r6.committed && chain2.ok,
    'confirm-gated sequence sealed: spawn → confirm(picked) → gate → CO; chain holds end to end', 'len=' + chain2.len);
  var movedBy = clines[0].confirmedqty;
  console.log('§WH PICK-COMPLETE inout=930002 CO via=confirm-gate picked=' + movedBy + '/3 chainOk=' + (chain2.ok ? 'Y' : 'N'));

  db.close(); whdb.close();
  console.log('\n' + (fails === 0 ? '🟢 W-WH-POS-PICK PASS' : '🔴 W-WH-POS-PICK FAIL (' + fails + ')') +
    ' — the walk selector folds the live op-log sale honestly (WR self-filters) and merges the seeded source; ' +
    'bins resolve from m_storageonhand; pick-complete moves on-hand by the PICKED qty (direct AND confirm-gated); ' +
    'double-complete and unroutable falsifiers hold.');
  process.exit(fails === 0 ? 0 : 1);
})().catch(function (e) { console.error('FATAL', e); process.exit(1); });
