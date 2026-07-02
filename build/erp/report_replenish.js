// Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
// SPDX-License-Identifier: MIT
// report_replenish.js — foldReplenish: the T_Replenish (replenishment planning) report fold.
//   Witness: W-REPLENISH. Implementing GapClosureSpec.md §5c — closing the T_Replenish gap of
//   ERP_COVERAGE_MATRIX.md (the "min/max planning" report scratch table).
//
// PURE VERB. A faithful port of the PLANNING core of org.compiere.process.ReplenishReport — prepareTable()
//   + fillTable() (ReplenishReport.java). The document-creation actions (createPO/createRequisition/
//   createMovements/createDO) are the ReplenishmentCreate ACTION, NOT the report — out of scope.
//
// prepareTable() corrections (applied IN-MEMORY here, never mutating source):
//   - M_Replenish: Level_Max = Level_Min where Level_Max < Level_Min
//   - M_Product_PO: Order_Min = 1 where null/<1 ; Order_Pack = 1 where null/<1
//   - IsCurrentVendor: 'Y' where a product has exactly ONE PO row ; 'N' where >1 'Y' vendors (sequential)
// fillTable() per warehouse:
//   - insert(1): M_Replenish ⋈ M_Product_PO (current-vendor, active), type<>'0' → carries C_BPartner/Order_*
//   - insert(BP): products with no current-vendor PO → C_BPartner=0, Order_Min=1, Order_Pack=1
//   - QtyOnHand = ΣM_StorageOnHand(prod,wh) ; QtyReserved = ΣM_StorageReservation(SO) ; QtyOrdered = Σ(PO)
//   - delete inactive products/replenishments
//   - QtyToOrder: type'1' = (OnHand-Reserved+Ordered <= Min) ? Max-OnHand+Reserved-Ordered : 0
//                 type'2' = Max-OnHand+Reserved-Ordered
//   - Min order qty: QtyToOrder = Order_Min where 0 < QtyToOrder < Order_Min
//   - Pack: QtyToOrder = QtyToOrder - MOD(QtyToOrder,Order_Pack) + Order_Pack where MOD<>0 and QtyToOrder>0
//   - delete rows with QtyToOrder < 1
//
// NON-INVENT: every value READ from a real M_Replenish/M_Product_PO/M_StorageOnHand/M_StorageReservation row.
//   EXACT BigDecimal arithmetic (qty/levels carry up to 6dp; MOD via truncating integer-quotient, matching SQL
//   MOD). No Date.now / no Math.random. Source warehouse + custom-class branches are no-ops in this seed
//   (M_WarehouseSource_ID=0, ReplenishmentClass empty — verified in the witness); folded as such, not assumed.
'use strict';

(function (global) {
  var BD = (typeof require === 'function') ? require('./bigdecimal.js') : global.BigDecimal;
  var DOWN = BD.RoundingMode.DOWN;
  function bd(v) { return (v == null || v === '') ? BD.ZERO : BD.of(String(v)); }
  // MOD(a,b) — remainder with the sign of a (Postgres MOD / Java %): a - trunc(a/b)*b.
  function mod(a, b) { return a.subtract(a.divide(b, 0, DOWN).multiply(b)); }

  // foldReplenish(src, warehouseId, opts) — src = raw table row-dumps; the engine does ALL joins/corrections in
  // JS (a path independent of the oracle SQL). Returns rows with QtyToOrder>=1, sorted by product.
  // src = { replenish:[{m_warehouse_id, m_product_id, ad_client_id, ad_org_id, replenishtype, level_min,
  //                     level_max, isactive}],
  //         productPO:[{m_product_id, c_bpartner_id, order_min, order_pack, iscurrentvendor, isactive}],
  //         storage:[{m_locator_id, m_product_id, qtyonhand}], locators:[{m_locator_id, m_warehouse_id}],
  //         reservation:[{m_product_id, m_warehouse_id, qty, issotrx}], products:[{m_product_id, isactive}] }
  // opts.bendLevelMaxProduct: {product, delta} — FALSIFIER hook: add delta to one product's Level_Max.
  function foldReplenish(src, warehouseId, opts) {
    opts = opts || {};
    var WH = String(warehouseId);

    // ── prepareTable: M_Product_PO corrections (in-memory) ──────────────────────────────────────────────
    var poByProduct = {};
    src.productPO.forEach(function (p) { if (p.isactive === 'Y') (poByProduct[p.m_product_id] = poByProduct[p.m_product_id] || []).push(p); });
    Object.keys(poByProduct).forEach(function (pid) {
      var list = poByProduct[pid];
      var nCurr = list.filter(function (p) { return p.iscurrentvendor === 'Y'; }).length;
      list.forEach(function (p) {
        // Order_Min / Order_Pack min-1 correction
        p._om = (p.order_min == null || p.order_min === '' || bd(p.order_min).lt(BD.ONE)) ? BD.ONE : bd(p.order_min);
        p._op = (p.order_pack == null || p.order_pack === '' || bd(p.order_pack).lt(BD.ONE)) ? BD.ONE : bd(p.order_pack);
        // IsCurrentVendor: (a) 'Y' if sole vendor; (b) 'N' if it was 'Y' but >1 'Y' vendors exist
        if (p.iscurrentvendor !== 'Y' && list.length === 1) p._curr = 'Y';
        else if (p.iscurrentvendor === 'Y' && nCurr > 1) p._curr = 'N';
        else p._curr = p.iscurrentvendor;
      });
    });
    function currentVendorPO(pid) {
      return (poByProduct[pid] || []).filter(function (p) { return p._curr === 'Y'; });
    }

    // ── QtyOnHand / QtyReserved / QtyOrdered indexes ────────────────────────────────────────────────────
    var locWh = {}; src.locators.forEach(function (l) { locWh[l.m_locator_id] = String(l.m_warehouse_id); });
    var onHand = {};
    src.storage.forEach(function (s) {
      if (locWh[s.m_locator_id] !== WH) return;
      onHand[s.m_product_id] = (onHand[s.m_product_id] || BD.ZERO).add(bd(s.qtyonhand));
    });
    var reserved = {}, ordered = {};
    (src.reservation || []).forEach(function (r) {
      if (String(r.m_warehouse_id) !== WH) return;
      var t = r.issotrx === 'Y' ? reserved : ordered;
      t[r.m_product_id] = (t[r.m_product_id] || BD.ZERO).add(bd(r.qty));
    });
    var inactiveProduct = {}; src.products.forEach(function (p) { if (p.isactive === 'N') inactiveProduct[p.m_product_id] = true; });
    var inactiveRepl = {};
    src.replenish.forEach(function (r) { if (r.isactive === 'N' && String(r.m_warehouse_id) === WH) inactiveRepl[r.m_product_id] = true; });

    // ── fillTable: build candidate rows ─────────────────────────────────────────────────────────────────
    var rows = [], seen = {};
    src.replenish.forEach(function (r) {
      if (r.isactive !== 'Y' || String(r.replenishtype) === '0' || String(r.m_warehouse_id) !== WH) return;
      var cvs = currentVendorPO(r.m_product_id);
      var levelMax = bd(r.level_max).lt(bd(r.level_min)) ? bd(r.level_min) : bd(r.level_max);  // Level_Max>=Level_Min
      if (opts.bendLevelMaxProduct && String(opts.bendLevelMaxProduct.product) === String(r.m_product_id)) {
        levelMax = levelMax.add(bd(opts.bendLevelMaxProduct.delta));            // FALSIFIER
      }
      if (cvs.length) {
        cvs.forEach(function (po) {
          rows.push(mkRow(r, levelMax, po.c_bpartner_id, po._om, po._op));
          seen[r.m_product_id] = true;
        });
      } else if (!seen[r.m_product_id]) {                                       // BP path (no current vendor)
        rows.push(mkRow(r, levelMax, 0, BD.ONE, BD.ONE));
        seen[r.m_product_id] = true;
      }
    });
    function mkRow(r, levelMax, bp, om, op) {
      return {
        M_Warehouse_ID: +r.m_warehouse_id, M_Product_ID: +r.m_product_id, C_BPartner_ID: +bp,
        ReplenishType: String(r.replenishtype), Level_Min: bd(r.level_min), Level_Max: levelMax,
        Order_Min: om, Order_Pack: op
      };
    }

    // ── fill quantities, delete inactive, compute QtyToOrder, min/pack, delete <1 ───────────────────────
    var out = [];
    rows.forEach(function (row) {
      if (inactiveProduct[row.M_Product_ID] || inactiveRepl[row.M_Product_ID]) return;   // delete inactive
      row.QtyOnHand = onHand[row.M_Product_ID] || BD.ZERO;
      row.QtyReserved = reserved[row.M_Product_ID] || BD.ZERO;
      row.QtyOrdered = ordered[row.M_Product_ID] || BD.ZERO;
      // net = OnHand - Reserved + Ordered ; deficit-to-max = Max - OnHand + Reserved - Ordered
      var net = row.QtyOnHand.subtract(row.QtyReserved).add(row.QtyOrdered);
      var toMax = row.Level_Max.subtract(row.QtyOnHand).add(row.QtyReserved).subtract(row.QtyOrdered);
      var qto;
      if (row.ReplenishType === '1') qto = net.compareTo(row.Level_Min) <= 0 ? toMax : BD.ZERO;
      else if (row.ReplenishType === '2') qto = toMax;
      else qto = BD.ZERO;                                                        // other types: not set → deleted
      // Minimum order quantity
      if (qto.gt(BD.ZERO) && qto.lt(row.Order_Min)) qto = row.Order_Min;
      // Even dividable by Pack
      if (qto.gt(BD.ZERO) && !mod(qto, row.Order_Pack).eq(BD.ZERO)) qto = qto.subtract(mod(qto, row.Order_Pack)).add(row.Order_Pack);
      row.QtyToOrder = qto;
      // delete QtyToOrder < 1 (the real T_Replenish); opts.keepZero retains pre-delete rows so a witness can
      // diff the type-1 branch (whose QtyToOrder is legitimately 0 when stock is sufficient).
      if (opts.keepZero || qto.compareTo(BD.ONE) >= 0) out.push(row);
    });
    return out.sort(function (a, b) { return a.M_Product_ID - b.M_Product_ID; });
  }

  var API = { foldReplenish: foldReplenish };
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
  else global.ReportReplenish = API;
})(typeof globalThis !== 'undefined' ? globalThis : this);
