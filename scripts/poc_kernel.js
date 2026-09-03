#!/usr/bin/env node
// Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
// SPDX-License-Identifier: MIT
/**
 * poc_kernel.js — TASK 2 acceptance: the OP-LOG KERNEL (prompts/ERP_RUNTIME_ENGINE.md T2,
 *   ERP_KERNEL_BUILD §P3/P3b). Worked fixture T_ORDER_SHIPMENT_ALLOCATION + violation guard
 *   + replay + frozen effects. Runs on sql.js (the BROWSER binding) to prove the kernel is
 *   binding-agnostic; sources order/lines from ad_full.db and policy/wfmc from the compiled
 *   rules + P2 manifest — every input from DATA (§0.14).
 *
 * Dispatch ladder (§18.6): state-machine legal (wfmc) -> guards -> Handlers.run -> Kernel.apply.
 * Handlers are PURE (doc,ctx)->ops[]; the kernel owns the write + commits a RICH op (§0.6).
 *
 * Run: node scripts/poc_kernel.js 2>&1 | tee build/erp/poc_kernel.log
 */
'use strict';
var path = require('path');
var Database = require('better-sqlite3');
var initSqlJs = require('sql.js');
var E = require('./erp_engine');
var R = require('./erp_runtime');
var K = require('./erp_kernel');

var AD = process.env.ERP_AD_FULL || path.join(__dirname, '..', 'build', 'erp', 'ad_full.db');
var RULES = process.env.ERP_RULES_OUT || path.join(__dirname, '..', 'build', 'erp', 'erp_rules.db');
var MANIFEST = require(path.join(process.env.HOME, 'bim-ootb', 'erp', 'manifest.json'));

var fails = 0;
function verdict(ok, label, detail) { if (!ok) fails++; console.log('   ' + (ok ? '🟢' : '🔴') + ' ' + label + (detail ? ' — ' + detail : '')); }

(async function () {
  var ad = new Database(AD, { readonly: true });
  var er = new Database(RULES, { readonly: true });
  var all = function (db, sql, p) { return db.prepare(sql).all(p || {}); };
  function ruleQuery(sql) { return er.prepare(sql).all(); }

  var SQL = await initSqlJs();
  var db = new SQL.Database();          // the live 5-table projection (browser binding)
  K.initProjection(db);

  console.log('═══ POC-KERNEL — op-log kernel, fixture T_ORDER_SHIPMENT_ALLOCATION ═══\n');

  // ── inputs from data ────────────────────────────────────────────────────
  var orderCell = R.loadCell(ruleQuery, 'C_Order', 'CO');
  var ORDER_ID = 102;                   // GardenWorld POS Order 80002, doctype 135, 3 lines
  var order = all(ad, 'SELECT * FROM c_order WHERE c_order_id=@id', { id: ORDER_ID })[0];
  var lines = all(ad, 'SELECT c_orderline_id, m_product_id, qtyordered FROM c_orderline WHERE c_order_id=@id', { id: ORDER_ID });
  var policy = orderCell.getPolicy(order.c_doctype_id);   // real Y/Y from DOCPOLICY:135
  var wfmc = MANIFEST.wfmc;

  // ── handlers — PURE (doc, ctx) -> ops[]; never touch the db ───────────────
  K.register('C_Order', 'CO', function (doc) { return E.completeOrder(doc.order, doc.lines, doc.policy); });
  // shipment Complete: policy update_storage:false -> ONLY a status op, no new lines (§18.9
  // no-double-deduct — the shipment LINES already are the inventory fact).
  K.register('M_InOut', 'CO', function (doc) { return [{ op_type: 'SET_STATUS', table: 'M_InOut', id: doc.shipSource, doc_status: 'CO' }]; });
  // payment Allocate: status + an ALLOCATE settlement edge (+ journal) linking order/payment.
  K.register('C_Payment', 'CO', function (doc) {
    return [
      { op_type: 'SET_STATUS', table: 'C_Payment', id: doc.payment_id, doc_status: 'CO' },
      { op_type: 'ALLOCATE', order_id: doc.order_id, payment_id: doc.payment_id, amount: doc.amount }
    ];
  });

  // ── STEP 1: Complete the Order -> SHIPMENT doc + lines; no inventory-mutation op ──
  console.log('── STEP 1. Complete Order ' + order.documentno + ' (docType ' + order.c_doctype_id + ', ino=' + policy.isautogenerateinout + ') ──');
  var d1 = K.dispatch(db, { wfmc: wfmc, guards: [], evalGuard: E.evalGuard, query: function (s, p) { return K.query(db, s, p); }, actor: 'user:demo', baseTs: 1000 },
    { docType: 'C_Order', action: 'CO', status: 'DR', order: order, lines: lines, policy: policy });
  verdict(d1.ok, 'dispatch legal+applied (state DR --CO--> ' + d1.to + ')', d1.ok ? 'ops=' + d1.applied : d1.stage + ':' + d1.reason);
  var shipDocs = K.query(db, "SELECT * FROM documents WHERE doc_type='M_InOut'");
  var shipLines = K.query(db, "SELECT * FROM document_lines WHERE document_id=?", [shipDocs.length ? shipDocs[0].id : '']);
  verdict(shipDocs.length === 1 && shipLines.length === lines.length, 'SHIPMENT doc + line per order line', 'docs=' + shipDocs.length + ' shipLines=' + shipLines.length + ' orderLines=' + lines.length);
  var invMutation = (d1.ops || []).filter(function (o) { return /STORAGE|DEDUCT|INVENTORY/.test(o.op_type); });
  verdict(invMutation.length === 0, 'NO inventory-mutation op (the shipment lines ARE the fact, §18.9)', 'mutationOps=' + invMutation.length);
  console.log('§KERNEL apply ops=' + d1.applied + ' committed=' + d1.committed + ' table=M_InOut shipLines=' + shipLines.length);
  // RICH-op witness (§0.6 keystone): every committed op must carry payload+actor+before/after+lineage.
  var sampleOp = K.query(db, "SELECT op_type, parameters, input_guids, output_guid, user_tag FROM kernel_ops WHERE op_type='CREATE_LINE' LIMIT 1")[0];
  var rich = sampleOp ? JSON.parse(sampleOp.parameters) : {};
  var isRich = rich.payload && rich.actor && rich.lineage && rich.lineage.output_guid && ('before' in rich) && ('after' in rich) && sampleOp.input_guids && sampleOp.output_guid;
  verdict(!!isRich, 'committed op is RICH (payload+actor+before/after+lineage GUIDs)', isRich ? 'actor=' + rich.actor + ' out=' + rich.lineage.output_guid + ' in=' + sampleOp.input_guids : 'thin op — ' + JSON.stringify(rich));
  console.log('§KERNEL rich-op actor=' + rich.actor + ' payload.op=' + (rich.payload && rich.payload.op_type) + ' before=' + JSON.stringify(rich.before) + ' after=' + JSON.stringify(rich.after) + ' lineage.out=' + (rich.lineage && rich.lineage.output_guid));

  // ── STEP 2: StorageOnHand deduction from shipment lines ───────────────────
  console.log('\n── STEP 2. StorageOnHand from shipment lines (no view, computed) ──');
  function onHandByProduct() {
    return K.query(db,
      "SELECT json_extract(dl.metadata,'$.m_product_id') pid, SUM(CAST(json_extract(dl.metadata,'$.movementqty') AS REAL)) qty " +
      "FROM document_lines dl JOIN documents d ON d.id=dl.document_id WHERE d.doc_type='M_InOut' GROUP BY pid ORDER BY pid");
  }
  var soh1 = onHandByProduct();
  var orderQty = {}; lines.forEach(function (l) { orderQty[l.m_product_id] = (orderQty[l.m_product_id] || 0) + l.qtyordered; });
  var sohOk = soh1.every(function (r) { return Number(r.qty) === orderQty[Number(r.pid)]; }) && soh1.length === Object.keys(orderQty).length;
  verdict(sohOk, 'StorageOnHand deduction == order line qtys', 'products=' + soh1.length + ' soh=' + JSON.stringify(soh1.map(function (r) { return r.pid + ':' + r.qty; })));

  // ── STEP 3: Complete the Shipment -> only DocStatus op, NO double-deduction ──
  console.log('\n── STEP 3. Complete Shipment -> status only, no double-count ──');
  var d3 = K.dispatch(db, { wfmc: wfmc, guards: [], query: function (s, p) { return K.query(db, s, p); }, actor: 'user:demo', baseTs: 2000 },
    { docType: 'M_InOut', action: 'CO', status: 'DR', shipSource: order.c_order_id });
  var soh2 = onHandByProduct();
  verdict(d3.ok && d3.applied === 1, 'shipment Complete emits ONLY a status op', d3.ok ? 'ops=' + d3.applied : d3.stage + ':' + d3.reason);
  verdict(JSON.stringify(soh1) === JSON.stringify(soh2), 'StorageOnHand UNCHANGED after shipment Complete (no double-deduct)', 'before=after=' + JSON.stringify(soh2.map(function (r) { return r.qty; })));

  // ── STEP 4: Allocate Payment -> ALLOCATE op + journal entry ───────────────
  console.log('\n── STEP 4. Allocate Payment -> ALLOCATE edge + journal ──');
  var pay = all(ad, 'SELECT c_payment_id, payamt FROM c_payment LIMIT 1')[0];   // real payment row
  var d4 = K.dispatch(db, { wfmc: wfmc, guards: [], query: function (s, p) { return K.query(db, s, p); }, actor: 'user:demo', baseTs: 3000 },
    { docType: 'C_Payment', action: 'CO', status: 'DR', order_id: order.c_order_id, payment_id: pay.c_payment_id, amount: pay.payamt });
  var jrn = K.query(db, "SELECT * FROM journal");
  var alloc = jrn.filter(function (j) { return j.source === 'DOC:C_Order#' + order.c_order_id; });
  verdict(d4.ok && alloc.length === 1, 'ALLOCATE links Order/Payment/amount via journal', d4.ok ? 'journalRows=' + jrn.length + ' source=' + (alloc[0] && alloc[0].source) : d4.stage + ':' + d4.reason);

  // ── VIOLATION GUARD: a handler that writes outside its returned ops is BLOCKED ──
  console.log('\n── VIOLATION. Handler writes to db directly -> BLOCKED ──');
  K.register('C_Order', 'XX_BAD', function (doc, ctx) {
    // a misbehaving handler that mutates the projection directly instead of returning ops.
    db.run("INSERT INTO documents (id, doc_type, doc_status) VALUES ('SNEAKY', 'X', 'DR')");
    return [{ op_type: 'SET_STATUS', table: 'C_Order', id: 999, doc_status: 'CO' }];
  });
  // need a legal transition for action XX_BAD — temporarily add one to a wfmc clone.
  var wfmcBad = { transitions: wfmc.transitions.concat([['DR', 'XX_BAD', 'CO']]) };
  var dV = K.dispatch(db, { wfmc: wfmcBad, guards: [], query: function (s, p) { return K.query(db, s, p); }, actor: 'user:demo', baseTs: 4000 },
    { docType: 'C_Order', action: 'XX_BAD', status: 'DR' });
  var sneaky = K.query(db, "SELECT * FROM documents WHERE id='SNEAKY'");
  verdict(!dV.ok && dV.stage === 'violation' && dV.blocked, 'out-of-log write detected + dispatch rejected', 'stage=' + dV.stage + ' reason=' + dV.reason);
  console.log('§KERNEL violation handler=C_Order:XX_BAD out-of-log-write=' + (dV.blocked ? 'BLOCKED' : 'LEAKED') + ' sneakyRowsLeft=' + sneaky.length);

  // ── REPLAY: rebuild projection from kernel_ops ALONE; hash must match live ──
  console.log('\n── REPLAY. Rebuild projection from kernel_ops alone ──');
  var liveHash = K.projectionHash(db);
  var fresh = new SQL.Database();
  var rep = K.replay(db, fresh);
  verdict(rep.hash === liveHash, 'replay reproduces the live projection (event sourcing)', 'live=' + liveHash + ' replay=' + rep.hash + ' ops=' + rep.ops);
  console.log('§KERNEL replay ops=' + rep.ops + ' projection==committed HASH=' + rep.hash + ' (live=' + liveHash + ')');
  fresh.close();

  // ── FROZEN EFFECTS: flip the rule; new order changes, OLD order's replay unchanged ──
  console.log('\n── FROZEN EFFECTS. Edit policy auto_create_shipment -> N (forward-only) ──');
  var oldShipCount = K.query(db, "SELECT COUNT(*) c FROM document_lines dl JOIN documents d ON d.id=dl.document_id WHERE d.doc_type='M_InOut'")[0].c;
  // a NEW order completed under the FLIPPED policy (auto-ship off).
  var newOrder = all(ad, 'SELECT * FROM c_order WHERE c_order_id=100', {})[0];
  var newLines = all(ad, 'SELECT c_orderline_id, m_product_id, qtyordered FROM c_orderline WHERE c_order_id=100', {});
  var flippedPolicy = Object.assign({}, policy, { isautogenerateinout: 'N' });   // the rule edit
  var d5 = K.dispatch(db, { wfmc: wfmc, guards: [], query: function (s, p) { return K.query(db, s, p); }, actor: 'admin:editrule', baseTs: 5000 },
    { docType: 'C_Order', action: 'CO', status: 'DR', order: newOrder, lines: newLines, policy: flippedPolicy });
  var newShip = (d5.ops || []).filter(function (o) { return o.table === 'M_InOutLine'; }).length;
  verdict(newShip === 0, 'NEW order under flipped rule does NOT ship (forward-only)', 'newShipLines=' + newShip);
  // replay the WHOLE log -> the OLD order's shipment lines are still there (frozen).
  var fresh2 = new SQL.Database();
  K.replay(db, fresh2);
  var replayOldShip = K.query(fresh2, "SELECT COUNT(*) c FROM document_lines dl JOIN documents d ON d.id=dl.document_id WHERE d.doc_type='M_InOut' AND d.source_id=?", [String(order.c_order_id)])[0].c;
  fresh2.close();
  verdict(replayOldShip === oldShipCount && oldShipCount > 0, 'REPLAY of old order STILL produces original shipment (frozen, §18.8)', 'old=' + oldShipCount + ' replay=' + replayOldShip);
  console.log('§KERNEL frozen old-ship=' + oldShipCount + ' new-ship=' + newShip + ' replay-old-ship=' + replayOldShip);

  db.close(); ad.close(); er.close();
  console.log('\n═══ VERDICT ═══');
  console.log('§KERNEL ' + (fails ? 'FAIL — ' + fails + ' checks red' : 'PASS — apply+commit rich ops, violation BLOCKED, replay exact, frozen effects hold'));
  process.exit(fails ? 1 : 0);
})();
