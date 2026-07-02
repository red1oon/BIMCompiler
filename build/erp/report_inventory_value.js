// Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
// SPDX-License-Identifier: MIT
// report_inventory_value.js — foldInventoryValue: the T_InventoryValue (inventory valuation) report fold.
//   Witness: W-INVVALUE. Implementing GapClosureSpec.md §5b — closing the T_InventoryValue gap of
//   ERP_COVERAGE_MATRIX.md (the "cost × qtyOnHand" report scratch table).
//
// PURE VERB. A faithful port of the COST-VALUATION core of org.compiere.process.InventoryValue.doIt()
//   (InventoryValue.java) — the part that fills T_InventoryValue with standard-cost inventory value:
//     sql1  → seed rows from M_Cost (CostingMethod='S', CostElementType='M') per active warehouse
//     sql5/6→ QtyOnHand = SUM(M_StorageOnHand.QtyOnHand) joined by locator→warehouse (ASI=0: over all ASIs)
//     sql7/8→ valuation-date adjustment: subtract M_Transaction movements AFTER DateValue
//     sql9  → DELETE rows with QtyOnHand=0 OR NULL
//     dbeux → CostStandardAmt = QtyOnHand * CostStandard
//
// SCOPE (honest, bounded — see GapClosureSpec §5b): this fold reproduces the inventory-VALUE columns
//   CostStandard, QtyOnHand, CostStandardAmt — the "cost × qtyOnHand" figure named by the lane. The price
//   columns (PricePO / PriceList / PriceStd / PriceLimit + their *Amt) are PARAMETER-driven (sql10 needs a
//   user-chosen M_PriceList_Version_ID; with the default param=0 the PriceList/Std/Limit subqueries match
//   nothing → NULL) and are NOT part of this witness. They are decoration on top of the value core.
//
// NON-INVENT: every number folds from a real M_Cost / M_StorageOnHand / M_Locator / M_Warehouse row. Money is
//   EXACT via BigDecimal (== java.math.BigDecimal, proven) — costs carry up to 6dp, qty×cost is an EXACT
//   product (no rounding, matching the un-rounded SQL UPDATE). No Date.now / no Math.random.
// VALUATION DATE: this fold targets DateValue = "today" (the report default p_DateValue = now). The caller
//   passes only transactions with MovementDate > DateValue as `futureTxn` (empty when DateValue=today over a
//   historical seed) — the adjustment is applied verbatim, never assumed.
'use strict';

(function (global) {
  var BD = (typeof require === 'function') ? require('./bigdecimal.js') : global.BigDecimal;
  function bd(v) { return (v == null || v === '') ? BD.ZERO : BD.of(String(v)); }

  // foldInventoryValue(src, opts) — src = raw table row-dumps (the engine does ALL joins itself, in JS, so it
  // is a path independent of the oracle SQL). Returns one row per surviving (warehouse, product, ASI), sorted
  // by (warehouse, product). Each row: { M_Warehouse_ID, M_Product_ID, M_AttributeSetInstance_ID,
  //   CostStandard, QtyOnHand, CostStandardAmt } — the BD values rendered as canonical strings.
  // src = { warehouses:[{m_warehouse_id, ad_client_id, ad_org_id, isactive}],
  //         clientInfo:[{ad_client_id, c_acctschema1_id}], acctSchemas:[{c_acctschema_id, m_costtype_id}],
  //         costs:[{c_acctschema_id, m_costtype_id, ad_org_id, m_costelement_id, m_product_id,
  //                 m_attributesetinstance_id, currentcostprice}],
  //         costElements:[{m_costelement_id, costingmethod, costelementtype}],
  //         storage:[{m_locator_id, m_product_id, m_attributesetinstance_id, qtyonhand}],
  //         locators:[{m_locator_id, m_warehouse_id}],
  //         futureTxn:[{m_product_id, m_attributesetinstance_id, m_warehouse_id, movementqty}] }  // > DateValue
  // opts.bendCostProduct: {product, delta} — FALSIFIER hook: add delta to one product's CostStandard.
  function foldInventoryValue(src, opts) {
    opts = opts || {};
    var ciByClient = {}; src.clientInfo.forEach(function (r) { ciByClient[r.ad_client_id] = r; });
    var acsById = {}; src.acctSchemas.forEach(function (r) { acsById[r.c_acctschema_id] = r; });
    var ceById = {}; src.costElements.forEach(function (r) { ceById[r.m_costelement_id] = r; });
    var locWh = {}; src.locators.forEach(function (l) { locWh[l.m_locator_id] = l.m_warehouse_id; });

    // QtyOnHand per (product|warehouse) — ASI=0 path: SUM over all ASIs (sql6). Storage→Locator→Warehouse.
    var qtyPW = {};
    src.storage.forEach(function (s) {
      var wh = locWh[s.m_locator_id]; if (wh == null) return;
      var k = s.m_product_id + '|' + wh;
      qtyPW[k] = (qtyPW[k] || BD.ZERO).add(bd(s.qtyonhand));
    });
    // future-transaction adjustment per (product|warehouse) (sql8: QtyOnHand -= SUM movementqty after DateValue)
    var adjPW = {};
    (src.futureTxn || []).forEach(function (t) {
      var k = t.m_product_id + '|' + t.m_warehouse_id;
      adjPW[k] = (adjPW[k] || BD.ZERO).add(bd(t.movementqty));
    });

    var rows = [];
    src.warehouses.forEach(function (w) {
      if (w.isactive !== 'Y') return;
      var ci = ciByClient[w.ad_client_id]; if (!ci) return;
      var acs = acsById[ci.c_acctschema1_id]; if (!acs) return;
      // M_Cost selection (sql1): same acctschema + costtype, org IN (0, wh.org), std-material cost element.
      src.costs.forEach(function (c) {
        if (String(c.c_acctschema_id) !== String(acs.c_acctschema_id)) return;
        if (String(c.m_costtype_id) !== String(acs.m_costtype_id)) return;
        if (String(c.ad_org_id) !== '0' && String(c.ad_org_id) !== String(w.ad_org_id)) return;
        var ce = ceById[c.m_costelement_id];
        if (!ce || ce.costingmethod !== 'S' || ce.costelementtype !== 'M') return;
        // ASI=0 in this seed; the no-ASI QtyOnHand path applies.
        var k = c.m_product_id + '|' + w.m_warehouse_id;
        var qty = qtyPW[k];
        if (qty == null) return;                              // no storage at all → no row materialized
        if (adjPW[k]) qty = qty.subtract(adjPW[k]);           // valuation-date adjustment (sql8)
        if (qty.eq(BD.ZERO)) return;                          // sql9: DELETE QtyOnHand=0 OR NULL
        var cost = bd(c.currentcostprice);
        if (opts.bendCostProduct && String(opts.bendCostProduct.product) === String(c.m_product_id)) {
          cost = cost.add(bd(opts.bendCostProduct.delta));    // FALSIFIER: perturb one product's cost
        }
        rows.push({
          M_Warehouse_ID: w.m_warehouse_id, M_Product_ID: c.m_product_id,
          M_AttributeSetInstance_ID: c.m_attributesetinstance_id,
          CostStandard: cost, QtyOnHand: qty, CostStandardAmt: qty.multiply(cost)   // dbeux, EXACT product
        });
      });
    });
    return rows.sort(function (a, b) {
      return (a.M_Warehouse_ID - b.M_Warehouse_ID) || (a.M_Product_ID - b.M_Product_ID)
        || (a.M_AttributeSetInstance_ID - b.M_AttributeSetInstance_ID);
    });
  }

  var API = { foldInventoryValue: foldInventoryValue };
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
  else global.ReportInventoryValue = API;
})(typeof globalThis !== 'undefined' ? globalThis : this);
