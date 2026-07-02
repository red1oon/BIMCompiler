#!/usr/bin/env node
// Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
// SPDX-License-Identifier: MIT
// ⚠ DO NOT REMOVE — Scope guard (prompts/RESUME_POS_KITCHEN_EINVOICE_OPS_PANELS.md §T1-SPEC).
//   Read the log after every run.
// poc_pos_replenish_staged.js — W-REPLEN-STAGE: the "traditional Generate Replenishment" shape
// (propose → stage → review/edit → route → ONE signed commit), Thread-1 steps 2/4/5.
//
// ISSUES IT PROVES (named):
//   1. BATCH ROUNDING — a policy row with QtyBatchSize rounds the proposal UP to the next batch
//      multiple (need 11, batch 5 → propose 15, the real ReplenishReport rounding); a NULL/0 batch
//      row proposes the EXACT pre-§T1 qty (no regression, W-POS-REPLENISH stays green untouched).
//   2. ROUTING — M_WarehouseSource_ID set → inter-warehouse Move (M_Movement/M_MovementLine via the
//      SAME buildDoc archetype, real locator route on every line); absent → external PO. A mixed
//      batch splits correctly (routeReplenishment).
//   3. ONE GROUP — a confirmed mixed batch (PO with vendor header + Move) commits as ONE
//      kernel_ops.commitGroup: every op shares one gid, sealed, chainOk=Y.
//   4. IDEMPOTENT — folding the committed group back as pending-inbound (the lens's
//      §POS-REPLENISH-PENDING fold: gid-linked open-PO qtyordered + move qty by m_locatorto_id)
//      makes a re-generate propose ZERO for the committed products — no double order.
//   5. §FALSIFIER — an empty staging pick emits NO ops; a vendor-less PO builds the EXACT legacy
//      header (no invented c_bpartner_id); the REAL seed's 19 policy rows (batch+source ALL NULL,
//      re-verified) route 100% PO with pass-through nulls — nothing invented for them.
//
// NON-INVENT: warehouses 103→104, locators 101/102, vendor 114 (Elm Tree 124), min/max levels — all
//   EXTRACTED from ad_seed_fullwidth.db; fixture policy rows only ADD the batch/source values the
//   seed leaves NULL (the columns are real m_replenish columns, PRAGMA-verified); centi-unit
//   integers; no Date.now/Math.random.
// Implementing RESUME_POS_KITCHEN_EINVOICE_OPS_PANELS.md §T1-SPEC — Witness: W-REPLEN-STAGE
// Run: bash build/erp/run_witness.sh scripts/poc_pos_replenish_staged.js   — then READ the log.
'use strict';
var path = require('path');
var Database = require('better-sqlite3');
var initSqlJs = require('sql.js');
var POS = require(path.join(__dirname, '..', 'build', 'erp', 'pos_core.js'));

global.window = global.window || {};
global.crypto = global.crypto || require('crypto').webcrypto;
require(path.join(__dirname, '..', 'build', 'erp', 'kernel_ops.js'));
var KO = global.window.KernelOps;

var db = new Database(path.join(__dirname, '..', 'build', 'erp', 'ad_seed_fullwidth.db'), { readonly: true });
var fails = 0;
function verdict(ok, label, detail) { if (!ok) fails++; console.log('   ' + (ok ? '🟢' : '🔴') + ' ' + label + (detail ? ' — ' + detail : '')); }
function lc(r) { if (!r) return r; var o = {}; for (var k in r) o[k.toLowerCase()] = r[k]; return o; }
function ci(n) { return Math.round(Number(n || 0) * 100); }

(async function () {
  console.log('═══ W-REPLEN-STAGE — staged Generate Replenishment: batch rounding, PO-vs-Move routing, ONE signed group, no double order ═══\n');

  // ── EXTRACTED anchors (real seed rows, cited in the header) ──
  var ELM = 124, TBL = 134, WH = 103, WH_TO = 104;
  var vendorElm = lc(db.prepare("SELECT c_bpartner_id, pricepo FROM m_product_po WHERE m_product_id=? AND iscurrentvendor='Y'").get(ELM));
  var loc103 = lc(db.prepare("SELECT m_locator_id AS i FROM m_locator WHERE m_warehouse_id=? AND isdefault='Y'").get(WH)).i;
  var loc104 = lc(db.prepare("SELECT m_locator_id AS i FROM m_locator WHERE m_warehouse_id=? AND isdefault='Y'").get(WH_TO)).i;
  console.log('§REPLEN-STAGE anchors vendor(' + ELM + ')=' + vendorElm.c_bpartner_id + ' locators ' + WH + '→' + loc103 + ' ' + WH_TO + '→' + loc104 + '\n');

  // ── 1. BATCH ROUNDING — fixture rctx: onhand 9, min 10, max 20 → need 11; batch 5 → 15 ──
  function fix(batch, source) {
    return {
      replenishRows: [{ m_product_id: ELM, m_warehouse_id: WH, level_min: 10, level_max: 20, replenishtype: '1', qtybatchsize: batch, m_warehousesource_id: source }],
      txns: [{ m_product_id: ELM, movementtype: 'V+', movementqty: 9 }],
      reservation: function () { return 0; }
    };
  }
  var rounded = POS.replenishSuggest(fix(5, null));
  verdict(rounded.length === 1 && rounded[0].qtytoorder === 15,
    'BATCH ROUNDING: need 11 (max 20 − avail 9), batch 5 → proposes 15 (ceil to multiple)', 'got=' + (rounded[0] && rounded[0].qtytoorder));
  var unbatched = POS.replenishSuggest(fix(null, null));
  verdict(unbatched.length === 1 && unbatched[0].qtytoorder === 11 && unbatched[0].qtybatchsize === null,
    'NULL batch → EXACT pre-§T1 qty 11, pass-through qtybatchsize=null (no regression)', 'got=' + (unbatched[0] && unbatched[0].qtytoorder));
  console.log('§REPLEN-STAGE rounding batch=5 need=11 proposed=' + (rounded[0] && rounded[0].qtytoorder) + ' unbatched=' + (unbatched[0] && unbatched[0].qtytoorder));

  // ── 2. ROUTING — mixed batch: Elm→PO (no source), Table→Move (source WH 103, stocking WH_TO 104) ──
  var sugPo = Object.assign({}, unbatched[0], { c_bpartner_id: vendorElm.c_bpartner_id });
  var sugMv = { m_product_id: TBL, m_warehouse_id: WH_TO, qtytoorder: 7, qtybatchsize: null, m_warehousesource_id: WH };
  var routed = POS.routeReplenishment([sugPo, sugMv]);
  verdict(routed.po.length === 1 && routed.po[0].m_product_id === ELM &&
          Object.keys(routed.moves).length === 1 && routed.moves[WH] && routed.moves[WH][0].m_product_id === TBL,
    'ROUTING: source-less row → po[], M_WarehouseSource_ID=' + WH + ' row → moves[' + WH + '] (the column\'s own semantics)');
  var mvOps = POS.buildReplenishMove({ m_warehousesource_id: WH, locatorFrom: loc103, locatorTo: loc104 }, routed.moves[WH]);
  var mvDoc = mvOps[0], mvLine = mvOps[1];
  verdict(mvDoc.op_type === 'CREATE_DOCUMENT' && mvDoc.table === 'M_Movement' && mvDoc.source_id === WH &&
          mvLine.op_type === 'CREATE_LINE' && mvLine.table === 'M_MovementLine' && mvLine.movementqty === 7 &&
          mvLine.m_locator_id === loc103 && mvLine.m_locatorto_id === loc104,
    'Move rides buildDoc (newVerbs=[]): M_Movement + M_MovementLine, line route ' + loc103 + '→' + loc104 + ' (real locators)', 'ops=' + mvOps.length);
  console.log('§REPLEN-STAGE routing po=1 moves=1 moveRoute=' + loc103 + '→' + loc104);

  // ── 3. ONE GROUP — PO (vendor header) + Move committed as ONE gid, sealed, chain holds ──
  var poOps = POS.buildReplenishPO(WH, routed.po, vendorElm.c_bpartner_id);
  verdict(poOps[0].table === 'C_Order' && poOps[0].issotrx === 'N' && poOps[0].c_bpartner_id === vendorElm.c_bpartner_id,
    'PO header carries the staged vendor (real C_Order column): c_bpartner_id=' + poOps[0].c_bpartner_id);
  var ops = poOps.concat(mvOps);
  var SQL = await initSqlJs();
  var opDb = new SQL.Database(); KO.ensureTable(opDb);
  var res = await KO.commitGroup(opDb, ops.map(function (o) { return { op_type: o.op_type, params: o }; }), { baseTs: 1751500000000 });
  var chain = await KO.verifyChain(opDb);
  var gids = opDb.exec('SELECT DISTINCT gid FROM kernel_ops')[0].values.map(function (v) { return v[0]; });
  verdict(res.committed && res.sealed && res.ids.length === ops.length && gids.length === 1 && chain.ok,
    'ONE GROUP: ' + ops.length + ' ops (1 PO + 1 Move + lines) sealed under ONE gid, chainOk=Y', 'gid=' + res.gid);
  console.log('§POS-REPLENISH-COMMIT pos=1 moves=1 lines=2 ops=' + ops.length + ' newVerbs=[] gid=' + res.gid + ' chainOk=' + (chain.ok ? 'Y' : 'N'));

  // ── 4. IDEMPOTENT — fold the committed group back as pending inbound → re-generate proposes ZERO ──
  // (the lens's pendingInbound fold, verbatim shape: gid-linked PO lines for the wh + move lines by m_locatorto_id)
  function pendingInbound(wh, whLocs) {
    var out = {}, poGids = {};
    var rows = opDb.exec('SELECT gid, op_type, parameters FROM kernel_ops ORDER BY id')[0].values.map(function (v) {
      var p = JSON.parse(v[2]); p = p && p.params ? p.params : p; return { gid: v[0], p: p };
    });
    rows.forEach(function (x) {
      if (x.p.op_type === 'CREATE_DOCUMENT' && x.p.table === 'C_Order' && x.p.issotrx === 'N' && Number(x.p.m_warehouse_id) === Number(wh)) poGids[x.gid] = 1;
    });
    rows.forEach(function (x) {
      if (x.p.op_type === 'CREATE_LINE' && x.p.table === 'C_OrderLine' && poGids[x.gid]) out[x.p.m_product_id] = (out[x.p.m_product_id] || 0) + ci(x.p.qtyordered);
      if (x.p.op_type === 'CREATE_LINE' && x.p.table === 'M_MovementLine' && whLocs[x.p.m_locatorto_id]) out[x.p.m_product_id] = (out[x.p.m_product_id] || 0) + ci(x.p.movementqty);
    });
    return out;
  }
  var pend103 = pendingInbound(WH, {});          // Elm's PO stocks WH 103
  var locs104 = {}; locs104[loc104] = 1;
  var pend104 = pendingInbound(-1, locs104);     // Table's move lands in WH_TO 104 (by locatorTo)
  var re1 = POS.replenishSuggest({
    replenishRows: fix(null, null).replenishRows, txns: fix(null, null).txns,
    reservation: function (pid, so) { return so === 'N' ? (pend103[pid] || 0) : 0; }
  });
  var fixMv = {
    replenishRows: [{ m_product_id: TBL, m_warehouse_id: WH_TO, level_min: 5, level_max: 7, replenishtype: '2', qtybatchsize: null, m_warehousesource_id: WH }],
    txns: [], reservation: function (pid, so) { return so === 'N' ? (pend104[pid] || 0) : 0; }
  };
  var re2 = POS.replenishSuggest(fixMv);
  verdict(pend103[ELM] === 1100 && re1.length === 0, 'IDEMPOTENT (PO leg): committed 11 folds as on-order → Elm re-proposes NOTHING', 'pending=' + pend103[ELM] + ' re=' + re1.length);
  verdict(pend104[TBL] === 700 && re2.length === 0, 'IDEMPOTENT (Move leg): committed 7 lands at locatorTo ' + loc104 + ' → Table re-proposes NOTHING', 'pending=' + pend104[TBL] + ' re=' + re2.length);
  console.log('§POS-REPLENISH-PENDING po[' + ELM + ']=' + (pend103[ELM] / 100) + ' move[' + TBL + ']=' + (pend104[TBL] / 100) + ' resuggest=0+0 (no double order)');

  // ── 5. §FALSIFIER — empty pick = no ops; vendor-less PO = exact legacy header; real seed = 100% PO nulls ──
  var emptyRoute = POS.routeReplenishment([]);
  verdict(emptyRoute.po.length === 0 && Object.keys(emptyRoute.moves).length === 0, '§FALSIFIER empty staging pick emits NO ops (nothing deselected sneaks in)');
  var legacyPo = POS.buildReplenishPO(WH, routed.po);
  verdict(!('c_bpartner_id' in legacyPo[0]) && legacyPo[0].issotrx === 'N' && legacyPo[0].m_warehouse_id === WH,
    '§FALSIFIER vendor-less PO header is the EXACT legacy shape (no invented c_bpartner_id)');
  var seedNulls = lc(db.prepare('SELECT COUNT(*) n, SUM(qtybatchsize IS NOT NULL) b, SUM(m_warehousesource_id IS NOT NULL) s FROM m_replenish').get());
  var whLocs = new Set(db.prepare('SELECT m_locator_id AS i FROM m_locator WHERE m_warehouse_id=?').all(WH).map(function (r) { return lc(r).i; }));
  var txns = db.prepare('SELECT m_product_id, m_locator_id, movementtype, movementqty FROM m_transaction').all().map(lc).filter(function (t) { return whLocs.has(t.m_locator_id); });
  var seedRows = db.prepare("SELECT m_product_id, m_warehouse_id, level_min, level_max, replenishtype, qtybatchsize, m_warehousesource_id FROM m_replenish WHERE m_warehouse_id=? AND replenishtype<>'0'").all(WH).map(lc);
  var resStmt = db.prepare('SELECT COALESCE(SUM(qty),0) AS q FROM m_storagereservation WHERE m_product_id=? AND m_warehouse_id=? AND issotrx=?');
  var seedSugg = POS.replenishSuggest({ replenishRows: seedRows, txns: txns, reservation: function (pid, so) { return ci(lc(resStmt.get(pid, WH, so)).q); } });
  var seedRouted = POS.routeReplenishment(seedSugg);
  verdict(seedNulls.n === 19 && seedNulls.b === 0 && seedNulls.s === 0 &&
          seedRouted.po.length === seedSugg.length && Object.keys(seedRouted.moves).length === 0 &&
          seedSugg.every(function (s) { return s.qtybatchsize === null && s.m_warehousesource_id === null; }),
    '§FALSIFIER real seed (19 rows, batch+source ALL NULL) routes 100% PO, pass-through nulls — nothing invented', 'suggestions=' + seedSugg.length);
  console.log('§FALSIFIER staged=empty→0ops vendorless=legacy-header seed=' + seedSugg.length + 'suggestions po=' + seedRouted.po.length + ' moves=0');

  console.log('\n' + (fails === 0 ? '🟢 W-REPLEN-STAGE PASS' : '🔴 W-REPLEN-STAGE FAIL (' + fails + ')') +
    ' — batch rounds UP to the policy multiple, the source column routes Move-vs-PO, a confirmed batch is ONE signed gid, the committed batch folds back as on-order (no double commit), and the untouched seed stays 100% PO.');
  db.close();
  process.exit(fails === 0 ? 0 : 1);
})().catch(function (e) { console.error('FATAL', e); process.exit(1); });
