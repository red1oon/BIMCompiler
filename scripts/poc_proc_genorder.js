// Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
// SPDX-License-Identifier: MIT
// ⚠ DO NOT REMOVE — Scope guard. Honour until W-PROC-GENPO is ✅ DONE in AD_PROCESS_FOLD_LANE.md §P1.
// SCOPE: W-PROC-GENPO — AD_Process 164 (org.compiere.process.ProjectGenOrder, "Generate Order") dispatched
//   through build/erp/ad_process.js folds a C_Project → a SALES order op-group via the EXISTING
//   erp_engine.buildDoc archetype (KIND 2, newVerbs=0). Proves: (a) the dispatch resolves the real classname
//   to the registered KIND-2 handler; (b) the getProject GATE honestly REJECTS a thin project (no fabricated
//   order — HONESTY INVARIANT); (c) a gate-passing project folds to the correct C_Order header + lines, qty/
//   price/amount diffed to the cent against an INDEPENDENT SQL re-derivation over the real C_ProjectLine rows;
//   (d) a §FALSIFIER (bent PlannedQty) breaks the diff (the metric is load-bearing).
// NON-INVENT: the project line, product, qty and price are REAL ad_full.db rows. The thin seed's project 101
//   is missing Warehouse + PriceList-Version (so iDempiere's own getProject would throw) — the GATE branch
//   witnesses that honest rejection. The positive-fold branch BINDS the project to OTHER REAL seed rows
//   (warehouse 103, sales price-list-version 104→pricelist 101, BP-location 112, on-credit SO doctype 133 —
//   every id QUERIED from the seed, none invented) to exercise the fold path the thin data can't reach.
// ORACLE (non-tautological): an independent SQL re-derivation of Qty = PlannedQty − InvoicedQty and
//   Price = PlannedPrice over c_projectline — a distinct path from the JS fold; diffed with bigdecimal.js.
// §-log first — READ build/erp/poc_proc_genorder.log before concluding (exit code ≠ evidence).
// Run:  node scripts/poc_proc_genorder.js 2>&1 | tee build/erp/poc_proc_genorder.log
'use strict';
var path = require('path');
var Database = require('better-sqlite3');
var ERP = process.env.GENPO_ERP_DIR || path.join(__dirname, '..', 'build', 'erp');   // GENPO_ERP_DIR = bim-ootb erp/ (the live kernel)
var P  = require(path.join(ERP, 'ad_process.js'));
var E  = require(path.join(ERP, 'erp_engine.js'));      // the buildDoc archetype (KIND-2 target)
var BD = require(path.join(ERP, 'bigdecimal.js'));      // money/qty math (memory: never raw JS Number)
var DB_PATH = process.env.GENPO_DB || path.join(__dirname, '..', 'build', 'erp', 'ad_full.db');

var fails = 0;
function verdict(ok, label, detail) { if (!ok) fails++; console.log((ok ? '🟢' : '🔴') + ' ' + label + (detail ? '  — ' + detail : '')); }

console.log('═══ W-PROC-GENPO — ProjectGenOrder (AD_Process 164) folds a project → Sales Order op-group ═══\n');

var db = new Database(DB_PATH, { readonly: true });
P.installDefaultHandlers(require(path.join(ERP, 'report_overlay.js')));   // the existing report handlers
P.registerProjectGenOrder(E);                                            // + the KIND-2 ProjectGenOrder handler
var GENPO = 'org.compiere.process.ProjectGenOrder';

// ════════════════════════════════════════════════════════════════════════════════════════════════════════
// 1 · §GENPO-DISPATCH — 164 resolves the real classname → the registered KIND-2 handler (load-bearing).
// ════════════════════════════════════════════════════════════════════════════════════════════════════════
console.log('— §GENPO-DISPATCH (real AD_Process 164 row → classname → registered handler) —');
var proc164 = P.readProcess(db, 164);
console.log('§GENPO-DISPATCH proc=164 value=' + proc164.value + ' name="' + proc164.name + '" classname=' + proc164.classname +
            ' isReport=' + proc164.isReport + ' paras=' + proc164.paras.length + ' hasHandler=' + P.hasHandler(GENPO));
verdict(proc164.classname === GENPO && proc164.isReport === false && proc164.paras.length === 0 && P.hasHandler(GENPO),
        'AD_Process 164 = ProjectGenOrder (isReport=N, 0 params) resolves to a registered handler', 'name="' + proc164.name + '"');

// ════════════════════════════════════════════════════════════════════════════════════════════════════════
// 2 · §GENPO-GATE — dispatch on REAL project 101 UNMODIFIED → getProject gate REJECTS (no pricelist/warehouse).
//     iDempiere's getProject (ProjectGenOrder.java:120-132) throws IllegalArgumentException here; we mirror it
//     as an honest 'project-not-ready' rejection — NOT a fabricated order. (HONESTY INVARIANT)
// ════════════════════════════════════════════════════════════════════════════════════════════════════════
console.log('\n— §GENPO-GATE (thin project 101 → honest rejection, no fabricated order) —');
var raw101 = db.prepare('SELECT * FROM c_project WHERE c_project_id=101').get();
console.log('§GENPO-GATE project=101 m_pricelist_version_id=' + (raw101.m_pricelist_version_id || '(null)') +
            ' m_warehouse_id=' + (raw101.m_warehouse_id || '(null)') + ' c_bpartner_id=' + raw101.c_bpartner_id);
var gateCtx = {
  fetchProject: function () { return raw101; },
  fetchProjectLines: function () { return db.prepare('SELECT * FROM c_projectline WHERE c_project_id=101 ORDER BY line,c_projectline_id').all(); }
};
var rGate = P.dispatch(db, { AD_Process_ID: 164, Record_ID: 101, params: {} }, gateCtx);
console.log('§GENPO-GATE dispatched=' + rGate.dispatched + ' ok=' + rGate.ok + ' reason=' + rGate.reason + ' msg="' + rGate.message + '" result.ops=' + (rGate.result && rGate.result.ops ? rGate.result.ops.length : 'none'));
verdict(rGate.dispatched === true && rGate.ok === false && rGate.reason === 'project-not-ready' &&
        /Price List|Warehouse/.test(rGate.message) && !(rGate.result && rGate.result.ops),
        'thin project → handler runs but gate REJECTS (no order ops emitted) — honest, not fabricated', 'reason=' + rGate.reason);

// ════════════════════════════════════════════════════════════════════════════════════════════════════════
// 3 · §GENPO-FOLD — bind project 101 to REAL seed rows so the gate passes → fold → C_Order op-group.
//     Every bound id is QUERIED from ad_full.db (none invented); asserted to exist before use.
// ════════════════════════════════════════════════════════════════════════════════════════════════════════
console.log('\n— §GENPO-FOLD (gate-passing project → buildDoc archetype → C_Order op-group) —');
// real seed rows (queried, asserted) — the header inputs the thin project lacks
var WH   = db.prepare("SELECT m_warehouse_id AS id,name FROM m_warehouse WHERE m_warehouse_id=103 AND ad_client_id=11").get();
var PLV  = db.prepare("SELECT m_pricelist_version_id AS id,m_pricelist_id FROM m_pricelist_version WHERE m_pricelist_version_id=104").get();
var BPL  = db.prepare("SELECT c_bpartner_location_id AS id FROM c_bpartner_location WHERE c_bpartner_location_id=112 AND c_bpartner_id=" + raw101.c_bpartner_id).get();
var DT   = db.prepare("SELECT c_doctype_id AS id,name FROM c_doctype WHERE docsubtypeso='WI' AND docbasetype='SOO' AND ad_client_id=11").get();
verdict(!!(WH && PLV && BPL && DT), 'bound header rows are REAL seed rows (warehouse/pricelist-version/bp-loc/on-credit-doctype all exist)',
        'wh=' + (WH && WH.id) + ' plv=' + (PLV && PLV.id) + '→pl=' + (PLV && PLV.m_pricelist_id) + ' bploc=' + (BPL && BPL.id) + ' doctype=' + (DT && DT.id));

// the gate-passing project = real row 101 + the bound real ids + the version→pricelist resolution (getM_PriceList_ID)
function boundProject(overrides) {
  var p = Object.assign({}, raw101, {
    m_warehouse_id: WH.id, m_pricelist_version_id: PLV.id, m_pricelist_id: PLV.m_pricelist_id,
    c_bpartner_location_id: BPL.id, _c_doctypetarget_id: DT.id
  });
  return Object.assign(p, overrides || {});
}
function foldCtx(lineOverride) {
  return {
    fetchProject: function () { return boundProject(); },
    fetchProjectLines: function () {
      var rows = db.prepare('SELECT * FROM c_projectline WHERE c_project_id=101 ORDER BY line,c_projectline_id').all();
      return lineOverride ? rows.map(function (r) { return Object.assign({}, r, lineOverride); }) : rows;
    }
  };
}
var rFold = P.dispatch(db, { AD_Process_ID: 164, Record_ID: 101, params: {} }, foldCtx());
var ops = rFold.result && rFold.result.ops || [];
var hdr = ops[0] || {};
var lineOps = ops.filter(function (o) { return o.op_type === 'CREATE_LINE'; });
console.log('§GENPO-FOLD dispatched=' + rFold.dispatched + ' ok=' + rFold.ok + ' kind=' + rFold.kind + ' rows=' + rFold.rows +
            ' ops=' + ops.length + ' (1 CREATE_DOCUMENT + ' + lineOps.length + ' CREATE_LINE)');
console.log('§GENPO-FOLD header issotrx=' + hdr.issotrx + ' docsubtypeso=' + hdr.docsubtypeso + ' c_doctypetarget_id=' + hdr.c_doctypetarget_id +
            ' c_bpartner_id=' + hdr.c_bpartner_id + ' m_warehouse_id=' + hdr.m_warehouse_id + ' m_pricelist_id=' + hdr.m_pricelist_id +
            ' c_project_id=' + hdr.c_project_id + ' source_id=' + hdr.source_id);
verdict(rFold.dispatched === true && rFold.ok === true && hdr.op_type === 'CREATE_DOCUMENT' && hdr.table === 'C_Order' &&
        hdr.issotrx === 'Y' && hdr.docsubtypeso === 'WI' && hdr.c_doctypetarget_id === DT.id &&
        hdr.c_bpartner_id === raw101.c_bpartner_id && hdr.m_warehouse_id === WH.id && hdr.m_pricelist_id === PLV.m_pricelist_id &&
        hdr.c_project_id === 101 && hdr.source_id === 101,
        'C_Order header is a SALES order (IsSOTrx=Y, On-Credit doctype) sourced from the project (faithful to MOrder(MProject))',
        'doctype=' + hdr.c_doctypetarget_id);

// ── ORACLE: independent SQL re-derivation of Qty = PlannedQty − InvoicedQty and Price = PlannedPrice ───────
var oracle = db.prepare(
  "SELECT c_projectline_id, line, m_product_id, plannedqty, COALESCE(invoicedqty,0) AS inv, plannedprice, " +
  "       (plannedqty - COALESCE(invoicedqty,0)) AS qtyord, " +
  "       CASE WHEN plannedprice<>0 THEN plannedprice ELSE NULL END AS price " +
  "FROM c_projectline WHERE c_project_id=101 ORDER BY line, c_projectline_id"
).all();
console.log('§GENPO-ORACLE independent SQL re-derivation rows=' + oracle.length + ' (qty=PlannedQty−InvoicedQty, price=PlannedPrice; distinct path from the fold)');
verdict(lineOps.length === oracle.length && oracle.length > 0,
        'order-line count == project-line count (every project line folds to one order line)', 'lines=' + lineOps.length + ' oracle=' + oracle.length);

// ── DIFF every order line vs the oracle, EXACT (bigdecimal.js compareTo) ───────────────────────────────────
var oByPid = {}; oracle.forEach(function (o) { oByPid[o.m_product_id] = o; });
var mism = 0, totalEng = BD.ZERO, totalOra = BD.ZERO, plannedPriceBranch = 0, priceListBranch = 0;
lineOps.forEach(function (op) {
  var o = oByPid[op.m_product_id];
  if (!o) { mism++; console.log('   ⚠ FINDING no oracle line for product ' + op.m_product_id); return; }
  if (op.table !== 'C_OrderLine') { mism++; console.log('   ⚠ FINDING line table ' + op.table); }
  if (BD.of(op.qtyordered).compareTo(BD.of(o.qtyord)) !== 0) { mism++; console.log('   ⚠ FINDING Qty product=' + op.m_product_id + ' eng=' + op.qtyordered + ' oracle=' + o.qtyord); }
  if (op.source_line_id !== o.c_projectline_id) { mism++; console.log('   ⚠ FINDING source_line_id eng=' + op.source_line_id + ' oracle=' + o.c_projectline_id); }
  if (o.price == null) {                                   // PlannedPrice=0 → price-list branch (named-deferred)
    priceListBranch++;
    if (op.priceactual !== null) { mism++; console.log('   ⚠ FINDING expected price-list (null) but eng=' + op.priceactual + ' product=' + op.m_product_id); }
  } else {
    plannedPriceBranch++;
    if (BD.of(op.priceactual).compareTo(BD.of(o.price)) !== 0) { mism++; console.log('   ⚠ FINDING Price product=' + op.m_product_id + ' eng=' + op.priceactual + ' oracle=' + o.price); }
    totalEng = totalEng.add(BD.of(op.priceactual).multiply(BD.of(op.qtyordered)));
    totalOra = totalOra.add(BD.of(o.price).multiply(BD.of(o.qtyord)));
  }
});
console.log('§GENPO-FOLD lines=' + lineOps.length + ' fields{qty,price,source_line} mismatches=' + mism +
            ' plannedPriceBranch=' + plannedPriceBranch + ' priceListBranch=' + priceListBranch +
            ' netAmt(eng)=' + totalEng.toString() + ' netAmt(oracle)=' + totalOra.toString());
verdict(mism === 0, 'every order line == independent SQL re-derivation, EXACT (qty, price, source link)', 'lines=' + lineOps.length + ' mismatches=' + mism);
verdict(totalEng.compareTo(totalOra) === 0 && totalEng.compareTo(BD.ZERO) > 0,
        'net amount (price×qty) matches the oracle to the cent over real numbers', 'eng=' + totalEng.toString() + ' oracle=' + totalOra.toString());
verdict(plannedPriceBranch > 0, 'the diffed line(s) exercise the PlannedPrice branch (price is a real folded value, not vacuous)', 'plannedPriceBranch=' + plannedPriceBranch);

// ════════════════════════════════════════════════════════════════════════════════════════════════════════
// 4 · §GENPO-FALSIFIER — bend PlannedQty on the source line → the folded Qty must DIVERGE from the oracle.
// ════════════════════════════════════════════════════════════════════════════════════════════════════════
console.log('\n— §GENPO-FALSIFIER (bent PlannedQty must break the Qty diff) —');
var probe = oracle[0];
var bentQty = Number(probe.plannedqty) - 3;             // a real-number perturbation of the FIRST line
var rBent = P.dispatch(db, { AD_Process_ID: 164, Record_ID: 101, params: {} }, foldCtx({ plannedqty: bentQty }));
var bentLine = (rBent.result.ops || []).filter(function (o) { return o.op_type === 'CREATE_LINE' && o.m_product_id === probe.m_product_id; })[0];
var diverged = bentLine && BD.of(bentLine.qtyordered).compareTo(BD.of(probe.qtyord)) !== 0;
console.log('§GENPO-FALSIFIER bent product=' + probe.m_product_id + ' PlannedQty ' + probe.plannedqty + '→' + bentQty +
            ' folded Qty=' + (bentLine ? bentLine.qtyordered : '(none)') + ' oracle Qty=' + probe.qtyord);
verdict(diverged, 'perturbing PlannedQty breaks the Qty diff (the fold reads the real qty — the metric is load-bearing)', '');

// ════════════════════════════════════════════════════════════════════════════════════════════════════════
// 5 · §GENPO-SERVICE — §PROJ-CAT (ERP_IDEMPIERE_UX_PARITY.md). ProjectGenOrder.doIt:80-84 refuses a Service
//     Charge project (ProjectCategory 'S') with "Service Charge Projects are on the TODO List"; legacy throws
//     inside the transaction so nothing is kept. Kernel must refuse, same message, 0 orders, 0 lines.
//     RED CONTROL: the identical bound project with category 'N' must build the order (else the refusal
//     could be a gate that refuses everything).
// ════════════════════════════════════════════════════════════════════════════════════════════════════════
console.log('\n— §GENPO-SERVICE (category S refused, category N builds — same project) —');
function projCat(cat) {
  return { fetchProject: function () { return boundProject({ projectcategory: cat }); }, fetchProjectLines: foldCtx().fetchProjectLines };
}
function countOps(r) {
  var o = (r.result && r.result.ops) || [];
  return { orders: o.filter(function (x) { return x.op_type === 'CREATE_DOCUMENT'; }).length,
           lines:  o.filter(function (x) { return x.op_type === 'CREATE_LINE'; }).length };
}
var rS = P.dispatch(db, { AD_Process_ID: 164, Record_ID: 101, params: {} }, projCat('S'));
var cS = countOps(rS);
console.log('§GENPO-SERVICE cat=S dispatched=' + rS.dispatched + ' ok=' + rS.ok + ' reason=' + rS.reason + ' msg="' + rS.message + '" orders=' + cS.orders + ' lines=' + cS.lines);
verdict(rS.dispatched === true && rS.ok === false && rS.message === 'Service Charge Projects are on the TODO List' && cS.orders === 0 && cS.lines === 0,
        'category S → refused with legacy message, 0 orders, 0 lines written', 'ok=' + rS.ok + ' orders=' + cS.orders + ' lines=' + cS.lines);
var rN = P.dispatch(db, { AD_Process_ID: 164, Record_ID: 101, params: {} }, projCat('N'));
var cN = countOps(rN);
console.log('§GENPO-SERVICE cat=N dispatched=' + rN.dispatched + ' ok=' + rN.ok + ' orders=' + cN.orders + ' lines=' + cN.lines + ' (oracle lines=' + oracle.length + ')');
verdict(rN.ok === true && cN.orders === 1 && cN.lines === oracle.length && oracle.length > 0,
        'RED CONTROL: same project, category N → order built (1 order, all lines)', 'orders=' + cN.orders + ' lines=' + cN.lines);

db.close();
console.log('\n' + (fails ? '🔴 ' + fails + ' check(s) FAILED — W-PROC-GENPO NOT proven' : '═══ ALL PASS — ProjectGenOrder folds a project → Sales Order op-group, oracle-equivalent — W-PROC-GENPO ═══'));
process.exit(fails ? 1 : 0);
