// ⚠ DO NOT REMOVE — M3 witness: PARALLEL-RUN reconcile + §GAP report. Legacy (local pilot iDempiere, via WebServices) vs SQLite side
// (existing kernel POS verbs: build/erp/pos_core.js on ad_seed_fullwidth.db). Spec: prompts/SQLiteIDEMPIERE.md §21 (twin), §23 (oracle corpus).
// READ THE LOG after every run. Two different questions are answered separately:
//   HARNESS  (this witness' pass/fail): the machinery can detect/classify differences — negative control must be caught, a registered
//            quirk must be classed LEGACY-QUIRK with evidence, no scenario may die with ERROR.
//   FINDINGS (the product): §GAP lines — each is a real difference between SQLite and legacy, classified. They are reported, not asserted away.
'use strict';
const fs = require('fs'), os = require('os'), path = require('path');
const { execFileSync } = require('child_process');
const Database = require('better-sqlite3');
const { cfgFromEnv, query } = require('./ad_client');
const store = require('./store');
const { drain } = require('./pusher');
const R = require('./reconcile');
const E = require('../erp_engine');
const POS = require('../../build/erp/pos_core.js');
const DP = require('../doc_poster');                // SQLite posting fold (derivePostings) — the engine under test for Fact_Acct
// scratch copy of the acct-linked GardenWorld db: the SQLite side's OWN computed invoice rows are materialised here so the SAME
// derivePostings the product uses can fold them (test adapter; never touches the shared db)
const gbFile = path.join(os.tmpdir(), 'm3-gb-' + process.pid + '.db'); fs.copyFileSync(path.join(__dirname, '..', '..', 'build', 'erp', 'glassbowl_data.db'), gbFile);
const gb = new Database(gbFile); const SCHEMA = gb.prepare('SELECT c_acctschema_id s FROM c_acctschema ORDER BY c_acctschema_id LIMIT 1').get().s;
const fmtPostings = lines => lines.map(l => ({ a: l.account_id, dr: cents(l.amtacctdr), cr: cents(l.amtacctcr) })).filter(x => x.dr || x.cr)
  .sort((x, y) => x.a - y.a).map(x => `${x.a}:DR${x.dr}/CR${x.cr}`).join('|') || 'none';

const log = l => console.log(l);
const cents = v => Math.round(Number(v) * 100);
const lc = r => { if (!r) return r; const o = {}; for (const k in r) o[k.toLowerCase()] = r[k]; return o; };

// ================= SQLite side (existing kernel verbs; adapter = test data) =================
const seed = new Database(path.join(__dirname, '..', '..', 'build', 'erp', 'ad_seed_fullwidth.db'), { readonly: true });
const pos = lc(seed.prepare('SELECT * FROM c_pos WHERE c_pos_id=100').get());
const plv = lc(seed.prepare('SELECT m_pricelist_version_id v FROM m_pricelist_version WHERE m_pricelist_id=?').get(pos.m_pricelist_id));
const priceStmt = seed.prepare('SELECT pricestd FROM m_productprice WHERE m_pricelist_version_id=? AND m_product_id=?');
// §41 F8: every active version's active price for (price list, product) — the rows erp_engine.priceAt walks by date
const priceRowsStmt = seed.prepare("SELECT v.validfrom, pp.pricestd, pp.pricelist, pp.pricelimit FROM m_productprice pp JOIN m_pricelist_version v ON v.m_pricelist_version_id=pp.m_pricelist_version_id WHERE v.m_pricelist_id=? AND pp.m_product_id=? AND v.isactive='Y' AND pp.isactive='Y'");
// the legacy server's calendar day (it runs on this host's local time zone); NOT toISOString() — that is the UTC day, which before 08:00 local
// is "yesterday" for legacy and silently sent every dated document down legacy's back-date costing path (found by PI1, 2026-10-10, P17)
const TODAY = (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; })();
const PL_CURRENCY = (lc(seed.prepare('SELECT c_currency_id FROM m_pricelist WHERE m_pricelist_id=?').get(pos.m_pricelist_id)) || {}).c_currency_id;
// §46: currency precision table from the SQLite seed (the production posting db is the bundle that carries it; the scratch posting db lacks the table)
const GB_PATCH = fs.readFileSync(path.join(__dirname, '..', '..', 'build', 'erp', 'patches', 'glassbowl_data.db.sql'), 'utf8');
require('./dict_diff').applyPatch(gb, GB_PATCH); require('./dict_diff').applyPatch(gb, GB_PATCH);   // patch + GUARDED loader in miniature (ALTERs skipped when present): applied twice
// §42 F7: the period data the SQLite side owns (seed): client primary schema + its calendar's periods with their control rows
const periodData = (() => {
  const ci = lc(seed.prepare('SELECT c_acctschema1_id s, c_calendar_id c FROM ad_clientinfo WHERE ad_client_id=11').get());
  const schema = lc(seed.prepare('SELECT autoperiodcontrol, period_openhistory, period_openfuture FROM c_acctschema WHERE c_acctschema_id=?').get(ci.s));
  const periods = seed.prepare('SELECT p.c_period_id, p.startdate, p.enddate, p.isactive, p.periodtype FROM c_period p JOIN c_year y ON y.c_year_id=p.c_year_id WHERE y.c_calendar_id=?').all(ci.c).map(lc);
  const ctl = seed.prepare('SELECT docbasetype, periodstatus FROM c_periodcontrol WHERE c_period_id=?');
  periods.forEach(p => { p.control = Object.fromEntries(ctl.all(p.c_period_id).map(lc).map(r => [r.docbasetype, r.periodstatus])); });
  return { schema, periods };
})();
const periodCheck = (date, dbt) => E.periodOpen(periodData, date, dbt, TODAY);
// §45 F11: tax inputs the SQLite side owns (seed): client taxes, product tax category, org/warehouse/BP locations, BP exemption, price list tax-included,
// the order's DeliveryViaRule = BP's rule else the C_Order.DeliveryViaRule dictionary default (MOrder.setBPartner :737-739 / AD_Column default)
const taxRows = seed.prepare('SELECT * FROM c_tax WHERE ad_client_id=11').all().map(lc);
const taxById = id => taxRows.find(t => Number(t.c_tax_id) === Number(id));
const taxChildren = id => taxRows.filter(t => Number(t.parent_tax_id) === Number(id) && t.isactive === 'Y');
const locOf = id => lc(seed.prepare('SELECT c_country_id, c_region_id, postal FROM c_location WHERE c_location_id=?').get(id));
const DVR_DEFAULT = (seed.prepare("SELECT c.defaultvalue d FROM ad_column c JOIN ad_table t ON t.ad_table_id=c.ad_table_id WHERE t.tablename='C_Order' AND c.columnname='DeliveryViaRule'").get() || {}).d;
const TAX_INCLUDED = (lc(seed.prepare('SELECT istaxincluded FROM m_pricelist WHERE m_pricelist_id=?').get(pos.m_pricelist_id)) || {}).istaxincluded === 'Y';
function taxOfFor(f) {
  const bp = f.bp || BP, org = f.org || 11, wh = f.wh || 103;
  const b = lc(seed.prepare('SELECT istaxexempt, deliveryviarule FROM c_bpartner WHERE c_bpartner_id=?').get(bp)) || {};
  const dvr = f.invoice ? null : (f.deliveryVia || b.deliveryviarule || DVR_DEFAULT);   // §58: a direct invoice carries no DeliveryViaRule (MInvoiceLine.setTax :504-520)
  const orgLoc = locOf((lc(seed.prepare('SELECT c_location_id FROM ad_orginfo WHERE ad_org_id=?').get(org)) || {}).c_location_id);
  const whLoc = locOf((lc(seed.prepare('SELECT c_location_id FROM m_warehouse WHERE m_warehouse_id=?').get(wh)) || {}).c_location_id);
  const bpLoc = locOf((lc(seed.prepare('SELECT c_location_id FROM c_bpartner_location WHERE c_bpartner_location_id=?').get(LOC[bp])) || {}).c_location_id);
  return pid => E.taxLookup({ taxes: taxRows, taxCategoryId: (lc(seed.prepare('SELECT c_taxcategory_id FROM m_product WHERE m_product_id=?').get(pid)) || {}).c_taxcategory_id,
    isSOTrx: true, billDate: f.date || TODAY, billFrom: orgLoc, billTo: bpLoc, warehouse: whLoc, deliveryViaRule: dvr, bpTaxExempt: b.istaxexempt });
}
// §43 F10: product-category accounting per ACTIVE schema, read from the (state-synced) scratch posting db
const acctSetupOf = pid => {
  const has = c => gb.prepare('SELECT 1 FROM pragma_table_info(?) WHERE name=?').get('c_acctschema', c);
  const act = gb.prepare('SELECT c_acctschema_id id FROM c_acctschema' + (has('isactive') ? " WHERE isactive='Y'" : '')).all().map(r => r.id);
  const p = gb.prepare('SELECT m_product_category_id c FROM m_product WHERE m_product_id=?').get(pid);
  if (!p) return [];
  return E.acctSetupGap(p.c, act, gb.prepare('SELECT m_product_category_id, c_acctschema_id FROM m_product_category_acct WHERE m_product_category_id=?').all(p.c));
};
const priceOfAt = (pid, date) => { const r = E.priceAt(priceRowsStmt.all(pos.m_pricelist_id, pid).map(lc), date || TODAY); return r ? { pricestd: r.pricestd } : null; };
const dtOf = id => lc(seed.prepare('SELECT * FROM c_doctype WHERE c_doctype_id=?').get(id));
let seq = 9100;
// §36 F5: the credit inputs the SQLite side owns — bill-BP row (seed) + sysconfig (dictionary db ad_full.db)
const sysStmt = new Database(path.join(__dirname, '..', '..', 'build', 'erp', 'ad_full.db'), { readonly: true }).prepare('SELECT value FROM ad_sysconfig WHERE name=? ORDER BY ad_client_id DESC LIMIT 1');
const creditOf = bpId => ({ bp: lc(seed.prepare('SELECT socreditstatus, so_creditlimit, totalopenbalance FROM c_bpartner WHERE c_bpartner_id=?').get(bpId)),
  sys: Object.fromEntries(['CHECK_CREDIT_ON_CASH_POS_ORDER', 'CHECK_CREDIT_ON_PREPAY_ORDER'].map(k => [k, (sysStmt.get(k) || {}).value])) });
// customer: 112 'Standard' (SO_CreditLimit=0 ⇒ no credit check, MBPartner.java:833-836) for the routine corpus; 118 Joe Block only for the deliberate credit-hold rows (spec §32)
const BP = 112, LOC = { 112: 108, 118: 113 };
function localRun(mut = 0) {
  return async f => {
    const dt = dtOf(f.doctype);
    const ctx = { pos: { ...pos, m_warehouse_id: f.wh || 103, c_doctype_id: f.doctype }, priceOf: priceOfAt, priceDate: f.date || TODAY, bomOf: () => [],
      taxOf: taxOfFor(f), taxById, taxChildren, taxIncluded: TAX_INCLUDED,
      wrPolicy: dt.docsubtypeso === 'WR' ? { isautogenerateinout: 'Y', isautogenerateinvoice: 'Y' } : { isautogenerateinout: 'N', isautogenerateinvoice: 'N' },
      docsubtypeso: dt.docsubtypeso, docbasetype: dt.docbasetype, creditOf, periodCheck, acctSetupOf };
    const cart = f.lines.map(l => POS.ringLine(ctx, l.product, l.qty));       // P15: no price is ever passed in; keyed price f.keyedPrice is ignored by design
    if (cart.some(l => !l.ok)) return { outcome: 'REJECTED' };
    const o = ++seq * 10, opts = { orderId: o, inoutId: o + 1, invoiceId: o + 2, c_bpartner_id: f.bp || BP, warehouseId: f.wh || 103, dateAcct: f.date || TODAY };
    const g = dt.docsubtypeso === 'WR' ? POS.buildSaleGroup(ctx, cart, opts)
      : POS.buildDeliverLaterGroup(ctx, cart, { ...opts, doctype: dt, invoiceRule: 'I' });
    if (!g.ok) return { outcome: 'REJECTED', reason: g.reason };
    return foldLocal(g, f, opts, mut);
  };
}
// fold a SQLite group (ops + soLines) into the comparable result; materialises its invoice/shipment into the scratch posting db (shared by the POS and AD adapters)
function foldLocal(g, f, opts, mut) {
  const cqBefore = {}; for (const l of f.lines) cqBefore[l.product] = localCostQty(l.product);
  {
    const st = g.ops.filter(x => x.op_type === 'SET_STATUS' && x.table === 'C_Order').pop();
    const shipDone = g.ops.filter(x => x.op_type === 'SET_STATUS' && x.table === 'M_InOut' && x.doc_status === 'CO').length;
    let postings = 'none', postingsEuro = 'none';
    const invOp = g.ops.find(x => x.op_type === 'CREATE_DOCUMENT' && x.table === 'C_Invoice');
    if (invOp) {                                                                   // materialise SQLite's own invoice, fold with the product's derivePostings
      const iid = opts.invoiceId, total = ((g.grandTotal != null ? g.grandTotal : g.soLines.reduce((a, l) => a + cents(l.linenetamt), 0)) + mut) / 100;   // mut = negative-control cents, applied to the REAL invoice rows
      // §46: the invoice carries the price-list currency (MOrder.currencyFromPriceList :1292-1300 → invoice), its DateAcct and org — needed to convert into a second schema
      gb.prepare('INSERT INTO c_invoice(c_invoice_id,c_bpartner_id,grandtotal,issotrx,c_currency_id,dateacct,ad_client_id,ad_org_id) VALUES(?,?,?,?,?,?,?,?)').run(iid, f.bp || BP, total, 'Y', PL_CURRENCY, (f.date || TODAY) + ' 00:00:00', 11, f.org || 11);
      for (const t of g.ops.filter(x => x.op_type === 'CREATE_LINE' && x.table === 'C_InvoiceTax')) gb.prepare('INSERT INTO c_invoicetax(c_invoice_id,c_tax_id,taxamt) VALUES(?,?,?)').run(iid, t.c_tax_id, t.taxamt);
      for (const l of g.soLines) gb.prepare('INSERT INTO c_invoiceline(c_invoiceline_id,c_invoice_id,m_product_id,linenetamt) VALUES(?,?,?,?)').run(iid * 100 + l.c_orderline_id % 100, iid, l.m_product_id, mut ? (cents(l.linenetamt) + mut) / 100 : l.linenetamt);
      const d = DP.derivePostings(gb, { table: 'C_Invoice', id: iid }, SCHEMA);
      postings = (d.absent && d.absent.length) ? 'ABSENT:' + d.absent.join(',') : fmtPostings(d.lines);
      const d2 = DP.derivePostings(gb, { table: 'C_Invoice', id: iid }, SCHEMA2);
      postingsEuro = (d2.absent && d2.absent.length) ? 'ABSENT:' + d2.absent.join(',') : fmtPostings(d2.lines);
    }
    let postingsShipment = 'none', refusedWhy, postingsShipmentEuro = 'none';
    if (shipDone) {                                                                // materialise SQLite's own completed shipment, fold with the product's derivePostings
      const sid = opts.inoutId;
      gb.prepare('INSERT INTO m_inout(m_inout_id,issotrx,movementtype,docstatus) VALUES(?,?,?,?)').run(sid, 'Y', 'C-', 'CO');
      for (const l of g.soLines) gb.prepare('INSERT INTO m_inoutline(m_inoutline_id,m_inout_id,m_product_id,movementqty) VALUES(?,?,?,?)').run(sid * 100 + l.c_orderline_id % 100, sid, l.m_product_id, l.qtyordered);
      const dsh = DP.derivePostings(gb, { table: 'M_InOut', id: sid }, SCHEMA);
      // legacy has ONE state for any posting error (Posted=E, no books) ⇒ a refused SQLite fold is reported the same way; the reason is kept for the log (§38)
      const dsh2 = DP.derivePostings(gb, { table: 'M_InOut', id: sid }, SCHEMA2);
      postingsShipmentEuro = (dsh.absent && dsh.absent.length) ? 'REFUSED:Posted=E' : ((dsh2.absent && dsh2.absent.length) ? 'ABSENT:' + dsh2.absent.join(',') : (dsh2.lines.length ? fmtPostings(dsh2.lines) : 'none'));
      if (dsh.absent && dsh.absent.length) { postingsShipment = 'REFUSED:Posted=E'; refusedWhy = dsh.absent.join(','); }
      else { postingsShipment = dsh.lines && dsh.lines.length ? fmtPostings(dsh.lines) : 'none'; applyCostQty(sid); }
    }
    const stock = {}; if (shipDone) g.soLines.forEach(l => { stock[l.m_product_id] = (stock[l.m_product_id] || 0) - l.qtyordered; });
    Object.keys(stock).forEach(k => { if (!stock[k]) delete stock[k]; });   // a zero move is no move (same representation as the legacy delta)
    return {
      outcome: 'COMPLETED', docstatus: st && st.doc_status,
      lines: g.soLines.map(l => `${l.m_product_id}:${l.qtyordered}:${cents(l.priceactual)}`).sort().join('|'),
      total_cents: g.soLines.reduce((a, l) => a + cents(l.linenetamt), 0) + mut,
      shipments: g.ops.filter(x => x.op_type === 'CREATE_DOCUMENT' && x.table === 'M_InOut').length, shipments_completed: shipDone,
      invoices: g.ops.filter(x => x.op_type === 'CREATE_DOCUMENT' && x.table === 'C_Invoice').length,
      stock_delta: JSON.stringify(stock), postings, postings_shipment: postingsShipment, _refused: refusedWhy,
      cost_qty_delta: deltaStr(Object.keys(cqBefore), cqBefore, p => localCostQty(Number(p))),
      postings_euro: postingsEuro, postings_shipment_euro: postingsShipmentEuro,
      line_tax: g.soLines.map(l => `${l.m_product_id}:${l.c_tax_id}`).sort().join('|'),
      order_tax: g.ops.filter(x => x.op_type === 'CREATE_LINE' && x.table === 'C_OrderTax').map(t => `${t.c_tax_id}:${cents(t.taxbaseamt)}:${cents(t.taxamt)}`).sort().join('|') || 'none',
      grand_total_cents: (g.grandTotal != null ? g.grandTotal : g.soLines.reduce((a, l) => a + cents(l.linenetamt), 0)) + mut,
      invoice_tax: g.ops.filter(x => x.op_type === 'CREATE_LINE' && x.table === 'C_InvoiceTax').map(t => `${t.c_tax_id}:${cents(t.taxbaseamt)}:${cents(t.taxamt)}`).sort().join('|') || 'none',
    };
  }
}
// ===== AD-WINDOW path (spec §39): the line goes through the AD model layer the SQLite Sales Order window runs (~/bim-ootb/erp/model_order.js MOrderLine.beforeSave,
// READ-ONLY require), then the kernel completes the draft order (pos_core.buildRecallCompleteGroup) and the books are folded as above.
const OOTB = process.env.BRIDGE_OOTB || path.join(os.homedir(), 'bim-ootb');
let ADML = null, adDb = null, adWhy = null;
try {
  ADML = require(path.join(OOTB, 'erp/model_layer.js')); require(path.join(OOTB, 'erp/model_order.js'));
  const f0 = path.join(os.tmpdir(), 'm3-ad-' + process.pid + '.db'); fs.copyFileSync(path.join(__dirname, '..', '..', 'build', 'erp', 'ad_seed_demo.db'), f0); adDb = new Database(f0);
} catch (e) { adWhy = e.message; }
const adQ = (sql, p) => { try { return adDb.prepare(sql).all(...(p || [])); } catch (e) { return []; } };
function localRunAD() {
  return async f => {
    if (!ADML) return Object.fromEntries(spec.keys.map(k => [k, 'INCONCLUSIVE:AD model layer not loadable (' + adWhy + ')']));
    const dt = dtOf(f.doctype), o = ++seq * 10, bp = f.bp || BP;
    const tpl = adDb.prepare("SELECT * FROM c_order WHERE issotrx='Y' ORDER BY c_order_id LIMIT 1").get();
    Object.assign(tpl, { c_order_id: o, docstatus: 'DR', processed: 'N', c_currency_id: 100, c_bpartner_id: bp, c_bpartner_location_id: LOC[bp], bill_bpartner_id: bp, bill_location_id: LOC[bp], m_warehouse_id: 103, c_doctype_id: 0, c_doctypetarget_id: f.doctype, ad_org_id: 11 });
    adDb.prepare('INSERT INTO c_order(' + Object.keys(tpl).join(',') + ') VALUES(' + Object.keys(tpl).map(() => '?').join(',') + ')').run(...Object.values(tpl));
    const held = [];
    for (const [i, l] of f.lines.entries()) {
      const price = f.keyedPrice != null ? f.keyedPrice : 0;
      const rec = { c_order_id: o, m_product_id: l.product, qtyentered: l.qty, qtyordered: l.qty, priceentered: price, priceactual: price, pricelist: 0, ad_client_id: 11, ad_org_id: 11 };
      const r = ADML.run(adQ, { client: 11, org: 11 }, { table: 'C_OrderLine', timing: 'BEFORE_SAVE', record: rec, old: null, isNew: true });
      if (!r.ok) return { outcome: 'REJECTED', reason: r.error || r.msg };
      const d = Object.assign({}, rec, r.derived || {});
      held.push({ c_orderline_id: o * 100 + i, m_product_id: l.product, qtyordered: l.qty, priceactual: String(d.priceactual), linenetamt: String(d.linenetamt) });
    }
    const ctx = { pos: { ...pos, m_warehouse_id: 103, c_doctype_id: f.doctype }, priceOf: pid => lc(priceStmt.get(plv.v, pid)) || null, bomOf: () => [],
      wrPolicy: dt.docsubtypeso === 'WR' ? { isautogenerateinout: 'Y', isautogenerateinvoice: 'Y' } : { isautogenerateinout: 'N', isautogenerateinvoice: 'N' }, docsubtypeso: dt.docsubtypeso, creditOf, acctSetupOf,
      taxOf: taxOfFor(f), taxById, taxChildren, taxIncluded: TAX_INCLUDED };
    const opts = { orderId: o, inoutId: o + 1, invoiceId: o + 2, c_bpartner_id: bp, warehouseId: 103 };
    const g = POS.buildRecallCompleteGroup(ctx, { c_order_id: o, docstatus: 'DR', c_bpartner_id: bp, m_warehouse_id: 103 }, held, opts);
    if (!g.ok) return { outcome: 'REJECTED', reason: g.reason };
    return foldLocal(g, f, opts, 0);
  };
}
// §38: the costed-qty deltas a committing host applies after a successful shipment post (legacy: same transaction) — keeps the scratch state moving like legacy's
function applyCostQty(ioId) {
  for (const u of DP.costQtyUpdates(gb, ioId)) {
    const r = gb.prepare('UPDATE m_cost SET currentqty=COALESCE(currentqty,0)+?, currentcostprice=COALESCE(?, currentcostprice) WHERE m_product_id=? AND c_acctschema_id=? AND m_costtype_id=? AND m_costelement_id=?').run(u.delta, u.currentcostprice == null ? null : u.currentcostprice, u.m_product_id, u.c_acctschema_id, u.m_costtype_id, u.m_costelement_id);   // §67.1: the price moves on additions
    if (!r.changes) gb.prepare('INSERT INTO m_cost(m_product_id,c_acctschema_id,m_costtype_id,m_costelement_id,currentcostprice,cumulatedamt,cumulatedqty,currentqty) VALUES(?,?,?,?,0,0,0,?)').run(u.m_product_id, u.c_acctschema_id, u.m_costtype_id, u.m_costelement_id, u.delta);
  }
}

// ================= Legacy side: push via the Bridge (composite) + read-back over read WS types =================
const cfg = cfgFromEnv(); cfg.login.OrgID = 11; cfg.login.WarehouseID = 103;
// §44: a scenario may sell from another org/warehouse (T1: org 12 Store Central, CT) — the login follows, like a user logged into that org
const cfgFor = f => ({ ...cfg, login: { ...cfg.login, OrgID: f.org || 11, WarehouseID: f.wh || 103 } });
const descFor = f => ({ composite: 'SyncOrder',
  header: { serviceType: (f.date || f.deliveryVia) ? 'BridgeCreateOrder' : 'createOrderRecord', table: 'C_Order', fields: Object.assign(f.deliveryVia ? { DeliveryViaRule: { const: f.deliveryVia } } : {}, { M_Warehouse_ID: { const: f.wh || 103 }, C_BPartner_ID: { const: f.bp || BP }, C_BPartner_Location_ID: { const: LOC[f.bp || BP] }, Bill_BPartner_ID: { const: f.bp || BP }, Bill_Location_ID: { const: LOC[f.bp || BP] }, C_DocTypeTarget_ID: { const: f.doctype } }, f.date ? { DateOrdered: { const: f.date + ' 00:00:00' }, DateAcct: { const: f.date + ' 00:00:00' } } : {}) },
  lines: { serviceType: 'CreateOrderLine', table: 'C_OrderLine', parent: 'C_Order_ID', from: 'lines', lineNo: { col: 'Line', step: 10 },
    fields: Object.assign({ AD_Org_ID: { const: f.org || 11 }, AD_Client_ID: { const: 11 }, M_Product_ID: { path: 'product' }, QtyEntered: { path: 'qty' }, QtyOrdered: { path: 'qty' } },
      f.keyedPrice != null ? { PriceEntered: { path: 'price' }, PriceActual: { path: 'price' } } : {}) },
  docAction: { serviceType: 'CompleteOrder', table: 'C_Order', action: 'CO' } });
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'm3-'));
const stockOf = async (p, wh) => (await query(cfg, 'QueryStorage', `M_Product_ID=${p} AND M_Locator_ID IN (SELECT M_Locator_ID FROM M_Locator WHERE M_Warehouse_ID=${wh || 103})`)).reduce((a, r) => a + Number(r.QtyOnHand), 0);
let uidN = 0;
const SCHEMA2 = 200000;   // §46: legacy's second accounting schema (Euro), active on the pilot
async function legacyFactsOf(table, id, schema) {
  let fa = []; for (let i = 0; i < 6 && !fa.length; i++) { fa = await query(cfg, 'QueryFactAcct', `AD_Table_ID=${table} AND Record_ID=${id} AND C_AcctSchema_ID=${schema}`); if (!fa.length) await new Promise(r => setTimeout(r, 1500)); }
  const by = {}; for (const f of fa) { const a = f.Account_ID; by[a] = by[a] || { account_id: a, amtacctdr: 0, amtacctcr: 0 }; by[a].amtacctdr += Number(f.AmtAcctDr); by[a].amtacctcr += Number(f.AmtAcctCr); }
  if (fa.length) return fmtPostings(Object.values(by));
  // §65 (P17): the posted-without-lines check knew only invoices/shipments; the cycles post orders, matchings, payments and allocations too
  const tq = { 318: ['QueryCInvoice', 'C_Invoice_ID'], 319: ['QueryMInOut', 'M_InOut_ID'], 259: ['QueryCOrder', 'C_Order_ID'], 472: ['QueryMMatchInv', 'M_MatchInv_ID'], 473: ['QueryMMatchPO', 'M_MatchPO_ID'], 335: ['QueryCPayment', 'C_Payment_ID'], 735: ['QueryCAllocationHdr', 'C_AllocationHdr_ID'], 702: ['QueryMRequisition', 'M_Requisition_ID'], 407: ['QueryCCash', 'C_Cash_ID'] }[table] || null;
  const posted = tq ? ((await query(cfg, tq[0], `${tq[1]}=${id}`))[0] || {}).Posted : null;
  return posted === 'Y' || posted === true ? 'none' : 'NO_FACT_ACCT_ROWS';   // §47: posted without lines = no books
}
// §41/F9: costed quantity (Average PO element, primary schema) — derived cost STATE, compared as a delta so back-date re-processing cannot hide behind the start-of-run sync
const AVG_EL = 103;
const legacyCostQty = async p => { const r = await query(cfg, 'QueryMCost', `M_Product_ID=${p} AND C_AcctSchema_ID=${SCHEMA} AND M_CostElement_ID=${AVG_EL} AND AD_Org_ID=0 AND M_AttributeSetInstance_ID=0`); return r.length ? Number(r[0].CurrentQty) : 0; };
const localCostQty = p => { try { const r = gb.prepare('SELECT currentqty q FROM m_cost WHERE m_product_id=? AND c_acctschema_id=? AND m_costelement_id=?').get(p, SCHEMA, AVG_EL); return r ? Number(r.q || 0) : 0; } catch (e) { return 0; } };
const deltaStr = (ps, before, now) => JSON.stringify(Object.fromEntries(ps.map(p => [p, now(p) - before[p]]).filter(x => x[1])));
async function legacyRun(f) {
  const before = {}; for (const l of f.lines) if (!(l.product in before)) before[l.product] = await stockOf(l.product, f.wh);
  const cqBefore = {}; for (const l of f.lines) cqBefore[l.product] = await legacyCostQty(l.product);
  const s = await store.open(); const uid = 'm3-' + (++uidN);
  s.enqueue(uid, 'doc', { lines: f.lines.map(l => ({ product: l.product, qty: l.qty, price: f.keyedPrice })) });
  await drain(cfgFor(f), s, { doc: descFor(f) }, { log: () => {} });
  const st = s.get(uid);
  // a refusal by the WS CONFIGURATION (type/column/role) is a harness fault, never a legacy business verdict (P17, found by S8 2026-10-09)
  if (st.state !== 'CONFIRMED' && /Web service type .* not allowed|No permission|not allowed for (this )?role|Unknown web service type/i.test(st.error || '')) throw new Error('§WS_CONFIG ' + st.error);
  if (st.state !== 'CONFIRMED') return { outcome: 'REJECTED', reason: (st.error || '').slice(0, 90) };
  const id = s.idmap(uid).find(x => x.tbl === 'C_Order').server_id;
  const h = (await query(cfg, 'QueryCOrder', `C_Order_ID=${id}`))[0];
  const ls = await query(cfg, 'QueryCOrderLine', `C_Order_ID=${id}`);
  const io = await query(cfg, 'QueryMInOut', `C_Order_ID=${id}`);
  const inv = await query(cfg, 'QueryCInvoice', `C_Order_ID=${id}`);
  const stock = {}; for (const p of Object.keys(before)) { const d = (await stockOf(p, f.wh)) - before[p]; if (d) stock[p] = d; }
  let postings = 'none';
  if (inv.length) {                                                              // legacy books: Fact_Acct of the invoice, primary schema, folded per account
    let fa = [];
    for (let i = 0; i < 6 && !fa.length; i++) { fa = await query(cfg, 'QueryFactAcct', `AD_Table_ID=318 AND Record_ID=${inv[0].C_Invoice_ID} AND C_AcctSchema_ID=${SCHEMA}`); if (!fa.length) await new Promise(r => setTimeout(r, 1500)); }
    const by = {}; for (const f of fa) { const a = f.Account_ID; by[a] = by[a] || { account_id: a, amtacctdr: 0, amtacctcr: 0 }; by[a].amtacctdr += Number(f.AmtAcctDr); by[a].amtacctcr += Number(f.AmtAcctCr); }
    postings = fa.length ? fmtPostings(Object.values(by)) : ((await query(cfg, 'QueryCInvoice', `C_Invoice_ID=${inv[0].C_Invoice_ID}`))[0].Posted === 'Y' ? 'none' : 'NO_FACT_ACCT_ROWS');   // §47: posted without lines = no books
  }
  let postingsShipment = 'none';
  const doneShip = io.find(x => x.DocStatus === 'CO');
  if (doneShip) {                                                                // spec §31/§38: legacy refusing to post IS a result (cardinal rule) — wait for the poster's verdict (Y|E)
    for (let i = 0; i < 8 && !['Y', 'E'].includes(doneShip.Posted); i++) { await new Promise(r => setTimeout(r, 1500)); doneShip.Posted = (await query(cfg, 'QueryMInOut', `M_InOut_ID=${doneShip.M_InOut_ID}`))[0].Posted; }
    if (doneShip.Posted === 'E') postingsShipment = 'REFUSED:Posted=E';
  }
  if (doneShip && postingsShipment === 'none') {
    let fs2 = [];
    for (let i = 0; i < 6 && !fs2.length && doneShip.Posted !== 'E'; i++) { fs2 = await query(cfg, 'QueryFactAcct', `AD_Table_ID=319 AND Record_ID=${doneShip.M_InOut_ID} AND C_AcctSchema_ID=${SCHEMA}`); if (!fs2.length) await new Promise(r => setTimeout(r, 1500)); }
    const by2 = {}; for (const f of fs2) { const a = f.Account_ID; by2[a] = by2[a] || { account_id: a, amtacctdr: 0, amtacctcr: 0 }; by2[a].amtacctdr += Number(f.AmtAcctDr); by2[a].amtacctcr += Number(f.AmtAcctCr); }
    postingsShipment = fs2.length ? fmtPostings(Object.values(by2)) : (doneShip.Posted === 'Y' ? 'none' : 'NO_FACT_ACCT_ROWS');
  }
  return {
    outcome: 'COMPLETED', docstatus: h.DocStatus,
    lines: ls.map(l => `${l.M_Product_ID}:${l.QtyOrdered}:${cents(l.PriceActual)}`).sort().join('|'),
    total_cents: cents(h.TotalLines), shipments: io.length, shipments_completed: io.filter(x => x.DocStatus === 'CO').length, invoices: inv.length,
    stock_delta: JSON.stringify(stock), postings, postings_shipment: postingsShipment, _order: id,
    // §46 second schema (Euro 200000): the same documents' books, folded per account
    postings_euro: inv.length ? await legacyFactsOf(318, inv[0].C_Invoice_ID, SCHEMA2) : 'none',
    postings_shipment_euro: doneShip ? (doneShip.Posted === 'E' ? 'REFUSED:Posted=E' : await legacyFactsOf(319, doneShip.M_InOut_ID, SCHEMA2)) : 'none',
    // §44 tax keys
    line_tax: ls.map(l => `${l.M_Product_ID}:${l.C_Tax_ID}`).sort().join('|'),
    order_tax: (await query(cfg, 'QueryCOrderTax', `C_Order_ID=${id}`)).map(t => `${t.C_Tax_ID}:${cents(t.TaxBaseAmt)}:${cents(t.TaxAmt)}`).sort().join('|') || 'none',
    grand_total_cents: cents(h.GrandTotal),
    invoice_tax: inv.length ? (await query(cfg, 'QueryCInvoiceTax', `C_Invoice_ID=${inv[0].C_Invoice_ID}`)).map(t => `${t.C_Tax_ID}:${cents(t.TaxBaseAmt)}:${cents(t.TaxAmt)}`).sort().join('|') || 'none' : 'none',
    cost_qty_delta: await (async () => { const n = {}; for (const p of Object.keys(cqBefore)) n[p] = await legacyCostQty(Number(p)); return deltaStr(Object.keys(cqBefore), cqBefore, p => n[p]); })(),
  };
}

// ================= S12 VOID of a completed POS sale (spec §33) — own key set =================
const voidSpec = { keys: ['outcome', 'docstatus', 'line_qty', 'line_desc', 'total_cents', 'shipments', 'ship_qtys', 'invoices', 'invoice_totals', 'stock_delta',
  'post_inv_orig', 'post_inv_rev', 'post_ship_orig', 'post_ship_rev', 'invoice_tax_rev', 'order_desc', 'inv_paid', 'inv_allocations'], notCompared: {} };   // §66.3: the reversal's allocation + IsPaid (MInvoice.reverse) were never compared
const call_ = require('./ad_client').call;
const sortStr = a => a.map(String).sort().join(',');
async function legacyFacts(table, id, wantRows) {                               // wait for the async poster: rows (or Posted=E) before folding
  let fa = [];
  for (let i = 0; i < 8; i++) { fa = await query(cfg, 'QueryFactAcct', `AD_Table_ID=${table} AND Record_ID=${id} AND C_AcctSchema_ID=${SCHEMA}`); if (fa.length || !wantRows) break; await new Promise(r => setTimeout(r, 1500)); }
  const by = {}; for (const f of fa) { const a = f.Account_ID; by[a] = by[a] || { account_id: a, amtacctdr: 0, amtacctcr: 0 }; by[a].amtacctdr += Number(f.AmtAcctDr); by[a].amtacctcr += Number(f.AmtAcctCr); }
  if (fa.length) return fmtPostings(Object.values(by));
  const tq = table === 318 ? ['QueryCInvoice', 'C_Invoice_ID'] : table === 319 ? ['QueryMInOut', 'M_InOut_ID'] : null;
  const posted = tq ? ((await query(cfg, tq[0], `${tq[1]}=${id}`))[0] || {}).Posted : null;
  return posted === 'Y' ? 'none' : 'NO_FACT_ACCT_ROWS';   // §47: posted without lines = no books
}
async function legacyVoid(f) {
  const before = {}; for (const l of f.lines) if (!(l.product in before)) before[l.product] = await stockOf(l.product, f.wh);
  const s = await store.open(); const uid = 'm3v-' + (++uidN);
  s.enqueue(uid, 'doc', { lines: f.lines.map(l => ({ product: l.product, qty: l.qty })) });
  await drain(cfgFor(f), s, { doc: descFor(f) }, { log: () => {} });
  const st = s.get(uid); if (st.state !== 'CONFIRMED') return { outcome: 'REJECTED', reason: (st.error || '').slice(0, 90) };
  const id = JSON.parse(st.refs).header;
  // the shipment must be posted before it can be reversed (Doc_InOut.java:293 'Original Shipment/Receipt not posted yet') — wait like a user would
  for (const io of await query(cfg, 'QueryMInOut', `C_Order_ID=${id}`)) await legacyFacts(319, io.M_InOut_ID, true);
  try { await call_(cfg, 'set_docaction', { ModelSetDocAction: { serviceType: 'BridgeDocActionCOrder', tableName: 'C_Order', recordID: id, docAction: f.action } }); }
  catch (e) { return { outcome: 'REJECTED', reason: e.message.slice(0, 120) }; }
  const h = (await query(cfg, 'QueryCOrder', `C_Order_ID=${id}`))[0];
  const ls = await query(cfg, 'QueryCOrderLine', `C_Order_ID=${id}`);
  const io = (await query(cfg, 'QueryMInOut', `C_Order_ID=${id}`)).sort((a, b) => a.M_InOut_ID - b.M_InOut_ID);
  const inv = (await query(cfg, 'QueryCInvoice', `C_Order_ID=${id}`)).sort((a, b) => a.C_Invoice_ID - b.C_Invoice_ID);
  const shipQ = []; for (const x of io) shipQ.push((await query(cfg, 'QueryMInOutLine', `M_InOut_ID=${x.M_InOut_ID}`)).reduce((a, l) => a + Number(l.MovementQty), 0));
  const stock = {}; for (const p of Object.keys(before)) { const d = (await stockOf(p, f.wh)) - before[p]; if (d) stock[p] = d; }
  const orig = (arr, k) => arr.find(x => !x.Reversal_ID || x[k] < x.Reversal_ID), revd = (arr, k) => arr.find(x => x.Reversal_ID && x[k] > x.Reversal_ID);
  const oi = orig(inv, 'C_Invoice_ID'), ri = revd(inv, 'C_Invoice_ID'), os = orig(io, 'M_InOut_ID'), rs = revd(io, 'M_InOut_ID');
  return { outcome: 'COMPLETED', docstatus: h.DocStatus, order_desc: h.Description, line_qty: sortStr(ls.map(l => Number(l.QtyOrdered))), line_desc: ls.map(l => l.Description).join('|'),
    total_cents: cents(h.TotalLines), shipments: sortStr(io.map(x => x.DocStatus)), ship_qtys: sortStr(shipQ), invoices: sortStr(inv.map(x => x.DocStatus)),
    invoice_totals: sortStr(inv.map(x => cents(x.GrandTotal))), stock_delta: JSON.stringify(stock),
    post_inv_orig: oi ? await legacyFacts(318, oi.C_Invoice_ID, true) : 'none', post_inv_rev: ri ? await legacyFacts(318, ri.C_Invoice_ID, true) : 'none',
    invoice_tax_rev: ri ? (await query(cfg, 'QueryCInvoiceTax', `C_Invoice_ID=${ri.C_Invoice_ID}`)).map(t => `${t.C_Tax_ID}:${cents(t.TaxBaseAmt)}:${cents(t.TaxAmt)}`).sort().join('|') || 'none' : 'none',
    post_ship_orig: os ? await legacyFacts(319, os.M_InOut_ID, true) : 'none', post_ship_rev: rs ? await legacyFacts(319, rs.M_InOut_ID, true) : 'none', _order: id,
    inv_paid: `${oi ? (oi.IsPaid === true || oi.IsPaid === 'Y' ? 'Y' : 'N') : '-'}/${ri ? (ri.IsPaid === true || ri.IsPaid === 'Y' ? 'Y' : 'N') : '-'}`,
    inv_allocations: await (async () => { const ids = [oi, ri].filter(Boolean).map(x => x.C_Invoice_ID); if (!ids.length) return 'none'; const r = [];
      for (const al of await query(cfg, 'QueryCAllocationLine', `C_Invoice_ID IN (${ids.join(',')})`)) { const hh = (await query(cfg, 'QueryCAllocationHdr', `C_AllocationHdr_ID=${al.C_AllocationHdr_ID}`))[0];
        r.push(`${hh.DocStatus}:${cents(al.Amount)}:${al.C_Invoice_ID === (oi && oi.C_Invoice_ID) ? 'orig' : 'rev'}:${al.C_Payment_ID ? 'pay' : '-'}`); } return r.sort().join('|') || 'none'; })() };
}
const adFull = new Database(path.join(__dirname, '..', '..', 'build', 'erp', 'ad_full.db'), { readonly: true });
const VOIDED_MSG = adFull.prepare("SELECT msgtext FROM ad_message WHERE value='Voided'").get().msgtext;   // dictionary text, never hard-coded
const FSM = require('../../build/erp/ad_docfsm.js');
function localVoid(mut = 0) {
  return async f => {
    const dt = dtOf(f.doctype);
    const ctx = { pos: { ...pos, m_warehouse_id: f.wh || 103, c_doctype_id: f.doctype }, priceOf: pid => lc(priceStmt.get(plv.v, pid)) || null, bomOf: () => [],
      wrPolicy: { isautogenerateinout: 'Y', isautogenerateinvoice: 'Y' }, taxOf: taxOfFor(f), taxById, taxChildren, taxIncluded: TAX_INCLUDED };
    const cart = f.lines.map(l => POS.ringLine(ctx, l.product, l.qty)); if (cart.some(l => !l.ok)) return { outcome: 'REJECTED' };
    const o = ++seq * 10, opts = { orderId: o, inoutId: o + 1, invoiceId: o + 2, c_bpartner_id: f.bp || BP, warehouseId: f.wh || 103 };
    const g = POS.buildSaleGroup(ctx, cart, opts); if (!g.ok) return { outcome: 'REJECTED', reason: g.reason };
    const d = FSM.dispatchOrder(seed, { docStatus: 'CO', isSOTrx: 'Y', doctypeId: f.doctype, processing: 'N' }, f.action);
    if (!d.ok) return { outcome: 'REJECTED', reason: d.reason };
    const lineOf = l => ({ c_orderline_id: l.c_orderline_id, m_product_id: l.m_product_id, qtyordered: l.qtyordered, linenetamt: l.linenetamt });
    const sl = g.soLines.map(lineOf);
    const sale = { order: { c_order_id: o, description: null }, lines: sl.map(l => ({ ...l, description: null })),
      shipments: [{ m_inout_id: opts.inoutId, docstatus: 'CO', movementtype: 'C-', lines: sl.map((l, i) => ({ m_inoutline_id: opts.inoutId * 100 + i, m_product_id: l.m_product_id, movementqty: l.qtyordered, c_orderline_id: l.c_orderline_id })) }],
      invoices: [{ c_invoice_id: opts.invoiceId, docstatus: 'CO', grandtotal: (g.grandTotal != null ? g.grandTotal : sl.reduce((a, l) => a + cents(l.linenetamt), 0)) / 100,
        taxes: g.ops.filter(x => x.op_type === 'CREATE_LINE' && x.table === 'C_InvoiceTax').map(x => ({ c_tax_id: x.c_tax_id, taxbaseamt: x.taxbaseamt, taxamt: x.taxamt })),
        lines: sl.map((l, i) => ({ c_invoiceline_id: opts.invoiceId * 100 + i, m_product_id: l.m_product_id, qtyinvoiced: l.qtyordered, linenetamt: l.linenetamt, c_orderline_id: l.c_orderline_id })) }] };
    let nid = o + 5; const ops = E.voidOrder(sale, { voidedMsg: VOIDED_MSG, newId: () => ++nid });
    // fold the op stream into final document state (statuses, lines) — the same state a kernel apply would leave
    const status = { ['C_Order:' + o]: 'CO', ['M_InOut:' + opts.inoutId]: 'CO', ['C_Invoice:' + opts.invoiceId]: 'CO' }, docs = { M_InOut: [opts.inoutId], C_Invoice: [opts.invoiceId] };
    const ioLines = { [opts.inoutId]: sale.shipments[0].lines }, ivLines = { [opts.invoiceId]: sale.invoices[0].lines }, ivTot = { [opts.invoiceId]: sale.invoices[0].grandtotal }, revOf = {},
      ivTax = { [opts.invoiceId]: sale.invoices[0].taxes };
    const paid = {}, allocs = {};   // §66.3
    let orderDesc = null; const oLines = {}; sl.forEach(l => { oLines[l.c_orderline_id] = { qty: l.qtyordered, desc: null }; }); let total = sl.reduce((a, l) => a + cents(l.linenetamt), 0);
    for (const op of ops) {
      if (op.table === 'C_AllocationHdr' || op.table === 'C_AllocationLine') {   // §66.3: the reversal's allocation (F28)
        if (op.op_type === 'CREATE_DOCUMENT') allocs[op.c_allocationhdr_id] = { st: 'DR', lines: [] };
        else if (op.op_type === 'CREATE_LINE') allocs[op.c_allocationhdr_id].lines.push(op);
        else if (op.op_type === 'SET_STATUS' && allocs[op.id]) allocs[op.id].st = op.doc_status;
      }
      else if (op.op_type === 'SET_STATUS') status[op.table + ':' + op.id] = op.doc_status;
      else if (op.op_type === 'CREATE_DOCUMENT') { const id = op.m_inout_id || op.c_invoice_id; docs[op.table].push(id); revOf[op.table + ':' + id] = op.reversal_id; if (op.table === 'C_Invoice') ivTot[id] = op.grandtotal; }
      else if (op.op_type === 'CREATE_LINE' && op.table === 'M_InOutLine') (ioLines[op.m_inout_id] = ioLines[op.m_inout_id] || []).push(op);
      else if (op.op_type === 'CREATE_LINE' && op.table === 'C_InvoiceLine') (ivLines[op.c_invoice_id] = ivLines[op.c_invoice_id] || []).push(op);
      else if (op.op_type === 'CREATE_LINE' && op.table === 'C_InvoiceTax') (ivTax[op.c_invoice_id] = ivTax[op.c_invoice_id] || []).push(op);
      else if (op.op_type === 'UPDATE_LINE' && op.table === 'C_OrderLine') oLines[op.id] = { qty: op.qtyordered, desc: op.description };
      else if (op.op_type === 'UPDATE_FIELD' && op.table === 'C_Order' && op.field === 'totallines') total = cents(op.value);
      else if (op.op_type === 'UPDATE_FIELD' && op.table === 'C_Order' && op.field === 'description') orderDesc = op.value;
      else if (op.op_type === 'UPDATE_FIELD' && op.table === 'C_Invoice' && op.field === 'ispaid') paid[op.id] = op.value;
    }
    // materialise every document into the scratch posting db and fold with the PRODUCT's derivePostings (orig + reversal)
    const post = {};
    for (const id of docs.C_Invoice) {
      gb.prepare('INSERT INTO c_invoice(c_invoice_id,c_bpartner_id,grandtotal,issotrx) VALUES(?,?,?,?)').run(id, f.bp || BP, (cents(ivTot[id]) + (revOf['C_Invoice:' + id] ? 0 : mut)) / 100, 'Y');
      ivLines[id].forEach((l, i) => gb.prepare('INSERT INTO c_invoiceline(c_invoiceline_id,c_invoice_id,m_product_id,linenetamt) VALUES(?,?,?,?)').run(id * 100 + i, id, l.m_product_id, l.linenetamt));
      (ivTax[id] || []).forEach(t => gb.prepare('INSERT INTO c_invoicetax(c_invoice_id,c_tax_id,taxamt) VALUES(?,?,?)').run(id, t.c_tax_id, t.taxamt));
      const dd = DP.derivePostings(gb, { table: 'C_Invoice', id }, SCHEMA); post['inv:' + (revOf['C_Invoice:' + id] ? 'rev' : 'orig')] = dd.absent && dd.absent.length ? 'ABSENT:' + dd.absent.join(',') : fmtPostings(dd.lines);
    }
    for (const id of docs.M_InOut) {
      gb.prepare('INSERT INTO m_inout(m_inout_id,issotrx,movementtype,docstatus,reversal_id) VALUES(?,?,?,?,?)').run(id, 'Y', 'C-', status['M_InOut:' + id], revOf['M_InOut:' + id] || null);
      ioLines[id].forEach((l, i) => gb.prepare('INSERT INTO m_inoutline(m_inoutline_id,m_inout_id,m_product_id,movementqty,reversalline_id) VALUES(?,?,?,?,?)').run(l.m_inoutline_id || id * 100 + i, id, l.m_product_id, l.movementqty, l.reversalline_id || null));
      const dd = DP.derivePostings(gb, { table: 'M_InOut', id }, SCHEMA); post['ship:' + (revOf['M_InOut:' + id] ? 'rev' : 'orig')] = dd.absent && dd.absent.length ? 'REFUSED:Posted=E' : (dd.lines.length ? fmtPostings(dd.lines) : 'none');
      if (!(dd.absent && dd.absent.length)) applyCostQty(id);
    }
    const stock = {}; for (const id of docs.M_InOut) ioLines[id].forEach(l => { stock[l.m_product_id] = (stock[l.m_product_id] || 0) - Number(l.movementqty); });
    Object.keys(stock).forEach(k => { if (!stock[k]) delete stock[k]; });
    return { outcome: 'COMPLETED', docstatus: status['C_Order:' + o], order_desc: orderDesc, line_qty: sortStr(Object.values(oLines).map(x => Number(x.qty))), line_desc: Object.values(oLines).map(x => x.desc).join('|'),
      total_cents: total, shipments: sortStr(docs.M_InOut.map(id => status['M_InOut:' + id])), ship_qtys: sortStr(docs.M_InOut.map(id => ioLines[id].reduce((a, l) => a + Number(l.movementqty), 0))),
      invoices: sortStr(docs.C_Invoice.map(id => status['C_Invoice:' + id])), invoice_totals: sortStr(docs.C_Invoice.map(id => cents(ivTot[id]))), stock_delta: JSON.stringify(stock),
      invoice_tax_rev: (ivTax[docs.C_Invoice.find(id => revOf['C_Invoice:' + id])] || []).map(t => `${t.c_tax_id}:${cents(t.taxbaseamt)}:${cents(t.taxamt)}`).sort().join('|') || 'none',
      post_inv_orig: post['inv:orig'] || 'none', post_inv_rev: post['inv:rev'] || 'none', post_ship_orig: post['ship:orig'] || 'none', post_ship_rev: post['ship:rev'] || 'none',
      inv_paid: (() => { const o = docs.C_Invoice.find(id => !revOf['C_Invoice:' + id]), r = docs.C_Invoice.find(id => revOf['C_Invoice:' + id]); return `${o ? paid[o] || 'N' : '-'}/${r ? paid[r] || 'N' : '-'}`; })(),
      inv_allocations: Object.values(allocs).flatMap(a => a.lines.map(l => `${a.st}:${cents(l.amount)}:${revOf['C_Invoice:' + l.c_invoice_id] ? 'rev' : 'orig'}:${l.c_payment_id ? 'pay' : '-'}`)).sort().join('|') || 'none' };
  };
}

// ================= MODEL: Inventory Move (spec §56) — legacy through the FROZEN link with the §55 descriptor (test data), own key set =================
const { createLink } = require('./legacy_link');
const MOVE_DESC = { move: { composite: 'SyncOrder',
  header: { serviceType: 'BridgeCreateMovement', table: 'M_Movement', fields: { AD_Org_ID: { const: 11 }, C_DocType_ID: { const: 143 }, MovementDate: { path: 'date' }, Description: { path: 'note' } } },
  lines: { serviceType: 'BridgeCreateMovementLine', table: 'M_MovementLine', parent: 'M_Movement_ID', from: 'lines', lineNo: { col: 'Line', step: 10 },
    fields: { AD_Org_ID: { const: 11 }, AD_Client_ID: { const: 11 }, M_Locator_ID: { path: 'from' }, M_LocatorTo_ID: { path: 'to' }, M_Product_ID: { path: 'product' }, MovementQty: { path: 'qty' } } },
  docAction: { serviceType: 'BridgeCompleteMovement', table: 'M_Movement', action: 'CO' },
  expect: { serviceType: 'QueryMMovement', cols: { DocStatus: { const: 'CO' } } } } };
const moveSpec = { keys: ['outcome', 'docstatus', 'lines', 'stock_delta', 'postings', 'postings_euro', 'cost_qty_delta'], notCompared: {} };
const locStock = async (p, loc) => (await query(cfg, 'QueryStorage', `M_Product_ID=${p} AND M_Locator_ID=${loc}`)).reduce((a, r) => a + Number(r.QtyOnHand), 0);
let moveLink = null;
async function legacyMove(f) {
  if (!moveLink) { let bytes = null; moveLink = await createLink({ cfg, persistence: { load: () => bytes, save: b => { bytes = Uint8Array.from(b); } }, descriptors: MOVE_DESC }); }
  const locs = [...new Set(f.lines.flatMap(l => [l.from, l.to]))], before = {};
  for (const l of f.lines) for (const loc of locs) before[l.product + '@' + loc] = await locStock(l.product, loc);
  const cq0 = {}; for (const l of f.lines) cq0[l.product] = await legacyCostQty(l.product);
  const uid = moveLink.submit('move', { date: (f.date || TODAY) + ' 00:00:00', note: 'M3 ' + f.id, lines: f.lines });
  await moveLink.drain(); const st = moveLink.store.get(uid);
  if (st.state !== 'CONFIRMED' && /not allowed|No permission|Unknown web service/i.test(st.error || '')) throw new Error('§WS_CONFIG ' + st.error);
  if (st.state !== 'CONFIRMED') return { outcome: 'REJECTED', reason: (st.error || '').slice(0, 90) };
  const id = moveLink.store.idmap(uid).find(x => x.tbl === 'M_Movement').server_id;
  const h = (await query(cfg, 'QueryMMovement', `M_Movement_ID=${id}`))[0];
  const ls = await query(cfg, 'QueryMMovementLine', `M_Movement_ID=${id}`);
  const stock = {}; for (const k of Object.keys(before)) { const [p, loc] = k.split('@'); const d = (await locStock(+p, +loc)) - before[k]; if (d) stock[k] = d; }
  for (let i = 0; i < 8 && !['Y', 'E'].includes(h.Posted); i++) { await new Promise(r => setTimeout(r, 1500)); h.Posted = (await query(cfg, 'QueryMMovement', `M_Movement_ID=${id}`))[0].Posted; }
  const cq = {}; for (const p of Object.keys(cq0)) cq[p] = await legacyCostQty(+p);
  return { outcome: 'COMPLETED', docstatus: h.DocStatus, lines: ls.map(l => `${l.M_Product_ID}:${Number(l.MovementQty)}:${l.M_Locator_ID}:${l.M_LocatorTo_ID}`).sort().join('|'),
    stock_delta: JSON.stringify(stock), postings: h.Posted === 'E' ? 'REFUSED:Posted=E' : await legacyFactsOf(323, id, SCHEMA), postings_euro: h.Posted === 'E' ? 'REFUSED:Posted=E' : await legacyFactsOf(323, id, SCHEMA2),
    cost_qty_delta: deltaStr(Object.keys(cq0), cq0, p => cq[p]) };
}
// SQLite side: the kernel's own movement verbs (pos_core.buildReplenishMove builds the documents; completion + books per F15)
const locOrg = loc => (lc(seed.prepare('SELECT ad_org_id FROM m_locator WHERE m_locator_id=?').get(loc)) || {}).ad_org_id;
function localMove(mut = 0) {
  return async f => {
    for (const l of f.lines) if (!lc(seed.prepare('SELECT m_product_id FROM m_product WHERE m_product_id=?').get(l.product))) return { outcome: 'REJECTED', reason: 'unknown product' };
    const mid = ++seq * 10, lines = f.lines.map((l, i) => ({ m_movementline_id: mid * 100 + i, m_product_id: l.product, movementqty: l.qty + mut, m_locator_id: l.from, m_locatorto_id: l.to }));
    const cq0 = {}; for (const l of f.lines) cq0[l.product] = localCostQty(l.product);
    const done = typeof E.completeMovement === 'function'
      ? E.completeMovement({ m_movement_id: mid, docstatus: 'DR' }, lines) : null;                 // F15 verb (absent before the fix ⇒ the gap is measured, not hidden)
    if (!done) return { outcome: 'COMPLETED', docstatus: 'DR', lines: lines.map(l => `${l.m_product_id}:${l.movementqty}:${l.m_locator_id}:${l.m_locatorto_id}`).sort().join('|'), stock_delta: '{}', postings: 'none', postings_euro: 'none', cost_qty_delta: '{}' };
    if (!done.ok) return { outcome: 'REJECTED', reason: done.reason };
    const status = (done.ops.filter(o => o.op_type === 'SET_STATUS' && o.table === 'M_Movement').pop() || {}).doc_status;
    const stock = {}; done.ops.filter(o => o.op_type === 'MOVE_STOCK').forEach(o => { const k = o.m_product_id + '@' + o.m_locator_id; stock[k] = (stock[k] || 0) + Number(o.qty); });
    Object.keys(stock).forEach(k => { if (!stock[k]) delete stock[k]; });
    gb.prepare('INSERT INTO m_movement(m_movement_id,docstatus) VALUES(?,?)').run(mid, status);
    for (const l of lines) gb.prepare('INSERT INTO m_movementline(m_movementline_id,m_movement_id,m_product_id,movementqty,m_locator_id,m_locatorto_id) VALUES(?,?,?,?,?,?)').run(l.m_movementline_id, mid, l.m_product_id, l.movementqty, l.m_locator_id, l.m_locatorto_id);
    const fold = sch => { const d = DP.derivePostings(gb, { table: 'M_Movement', id: mid }, sch); return d.absent && d.absent.length ? 'REFUSED:Posted=E' : (d.lines.length ? fmtPostings(d.lines) : 'none'); };
    return { outcome: 'COMPLETED', docstatus: status, lines: lines.map(l => `${l.m_product_id}:${l.movementqty}:${l.m_locator_id}:${l.m_locatorto_id}`).sort().join('|'),
      stock_delta: JSON.stringify(stock), postings: fold(SCHEMA), postings_euro: fold(SCHEMA2), cost_qty_delta: deltaStr(Object.keys(cq0), cq0, p => localCostQty(+p)) };
  };
}

// ================= MODEL: AR Receipt settling an invoice (spec §57) — legacy through the frozen link (descriptor = test data), own key set =================
const PAY_DESC = { pay: { composite: 'SyncOrder',
  header: { serviceType: 'BridgeCreatePayment', table: 'C_Payment', fields: { AD_Org_ID: { const: 11 }, C_DocType_ID: { const: 119 }, C_BankAccount_ID: { const: 100 }, C_BPartner_ID: { path: 'bp' },
    C_Invoice_ID: { path: 'invoice' }, C_Currency_ID: { const: 100 }, PayAmt: { path: 'amt' }, TenderType: { const: 'X' }, DateTrx: { path: 'date' }, DateAcct: { path: 'date' }, Description: { path: 'note' } } },
  docAction: { serviceType: 'BridgeCompletePayment', table: 'C_Payment', action: 'CO' } } };
const paySpec = { keys: ['outcome', 'docstatus', 'isallocated', 'invoice_paid', 'allocation', 'postings_payment', 'postings_alloc', 'postings_payment_euro', 'postings_alloc_euro'], notCompared: {} };
let payLink = null;
async function legacyPay(f) {
  if (!payLink) { let bytes = null; payLink = await createLink({ cfg, persistence: { load: () => bytes, save: b => { bytes = Uint8Array.from(b); } }, descriptors: PAY_DESC }); }
  let invId = f.invoice, amt;
  if (invId == null) {   // the invoice to settle comes from a real sale (same path as S11)
    const sale = await legacyRun({ doctype: POSDT, lines: f.lines });
    if (sale.outcome !== 'COMPLETED') return { outcome: 'ERROR', error: 'sale failed: ' + sale.reason };
    const inv = (await query(cfg, 'QueryCInvoice', `C_Order_ID=${sale._order}`))[0]; invId = inv.C_Invoice_ID; amt = Number(inv.GrandTotal);
  } else amt = f.amt;
  const uid = payLink.submit('pay', { bp: f.bp || BP, invoice: invId, amt: (amt * 100 + (f.mut || 0)) / 100, date: (f.date || TODAY) + ' 00:00:00', note: 'M3 ' + f.id });
  await payLink.drain(); const st = payLink.store.get(uid);
  if (st.state !== 'CONFIRMED' && /not allowed|No permission|Unknown web service/i.test(st.error || '')) throw new Error('§WS_CONFIG ' + st.error);
  if (st.state !== 'CONFIRMED') return { outcome: 'REJECTED', reason: (st.error || '').slice(0, 120) };
  const pid = payLink.store.idmap(uid).find(x => x.tbl === 'C_Payment').server_id;
  const p = (await query(cfg, 'QueryCPayment', `C_Payment_ID=${pid}`))[0];
  const inv = (await query(cfg, 'QueryCInvoice', `C_Invoice_ID=${invId}`))[0];
  const al = await query(cfg, 'QueryCAllocationLine', `C_Payment_ID=${pid}`);
  const hdrs = []; for (const a of al) hdrs.push((await query(cfg, 'QueryCAllocationHdr', `C_AllocationHdr_ID=${a.C_AllocationHdr_ID}`))[0]);
  const books = async (t, id, sc) => id ? await legacyFactsOf(t, id, sc) : 'none';
  const hid = hdrs[0] && hdrs[0].C_AllocationHdr_ID;
  return { outcome: 'COMPLETED', docstatus: p.DocStatus, isallocated: p.IsAllocated === true || p.IsAllocated === 'Y' ? 'Y' : 'N', invoice_paid: inv.IsPaid === true || inv.IsPaid === 'Y' ? 'Y' : 'N',
    allocation: al.map((a, i) => `${hdrs[i].DocStatus}:${cents(a.Amount)}:${cents(a.WriteOffAmt)}:${cents(a.DiscountAmt)}:${a.C_Invoice_ID === invId ? 'inv' : a.C_Invoice_ID}`).join('|') || 'none',
    postings_payment: await books(335, pid, SCHEMA), postings_alloc: await books(735, hid, SCHEMA), postings_payment_euro: await books(335, pid, SCHEMA2), postings_alloc_euro: await books(735, hid, SCHEMA2) };
}
// SQLite side: the sale through the kernel, then the kernel's payment verb (F16) and the posting fold
function localPay(mut = 0) {
  return async f => {
    let inv = null;
    if (f.invoice == null) {
      const ctx = { pos: { ...pos, m_warehouse_id: 103, c_doctype_id: POSDT }, priceOf: priceOfAt, priceDate: TODAY, bomOf: () => [], wrPolicy: { isautogenerateinout: 'Y', isautogenerateinvoice: 'Y' },
        taxOf: taxOfFor({}), taxById, taxChildren, taxIncluded: TAX_INCLUDED };
      const cart = f.lines.map(l => POS.ringLine(ctx, l.product, l.qty));
      const o = ++seq * 10, g = POS.buildSaleGroup(ctx, cart, { orderId: o, inoutId: o + 1, invoiceId: o + 2, c_bpartner_id: f.bp || BP, warehouseId: 103 });
      if (!g.ok) return { outcome: 'ERROR', error: 'sale ' + g.reason };
      inv = { c_invoice_id: o + 2, c_bpartner_id: f.bp || BP, grandtotal: g.grandTotal / 100, ispaid: 'N', docstatus: 'CO' };
      gb.prepare('INSERT INTO c_invoice(c_invoice_id,c_bpartner_id,grandtotal,issotrx,c_currency_id,dateacct,ad_client_id,ad_org_id) VALUES(?,?,?,?,?,?,?,?)').run(inv.c_invoice_id, inv.c_bpartner_id, inv.grandtotal, 'Y', PL_CURRENCY, TODAY + ' 00:00:00', 11, 11);
    }
    if (!inv) return { outcome: 'REJECTED', reason: 'invoice not found' };
    const pid = ++seq * 10, amt = (cents(inv.grandtotal) + mut) / 100;
    const pay = { c_payment_id: pid, c_bpartner_id: f.bp || BP, c_invoice_id: inv.c_invoice_id, payamt: amt, isreceipt: 'Y', c_currency_id: 100, c_bankaccount_id: 100, tendertype: 'X', dateacct: TODAY };
    if (typeof E.completePayment !== 'function')
      return { outcome: 'COMPLETED', docstatus: 'DR', isallocated: 'N', invoice_paid: 'N', allocation: 'none', postings_payment: 'none', postings_alloc: 'none', postings_payment_euro: 'none', postings_alloc_euro: 'none' };
    const r = E.completePayment(pay, inv, { newId: () => ++seq * 10 });
    if (!r.ok) return { outcome: 'REJECTED', reason: r.reason };
    const status = t => (r.ops.filter(o => o.op_type === 'SET_STATUS' && o.table === t).pop() || {}).doc_status;
    const ah = r.ops.find(o => o.op_type === 'CREATE_DOCUMENT' && o.table === 'C_AllocationHdr'), al = r.ops.filter(o => o.op_type === 'CREATE_LINE' && o.table === 'C_AllocationLine');
    gb.prepare('INSERT INTO c_payment(c_payment_id,c_bpartner_id,c_invoice_id,payamt,isreceipt,c_currency_id,c_bankaccount_id,tendertype,dateacct,docstatus,ad_client_id,ad_org_id) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)')
      .run(pid, pay.c_bpartner_id, pay.c_invoice_id, amt, 'Y', 100, 100, 'X', TODAY + ' 00:00:00', status('C_Payment'), 11, 11);
    if (ah) { gb.prepare('INSERT INTO c_allocationhdr(c_allocationhdr_id,c_currency_id,dateacct,docstatus,ad_client_id,ad_org_id) VALUES(?,?,?,?,?,?)').run(ah.c_allocationhdr_id, ah.c_currency_id, TODAY + ' 00:00:00', status('C_AllocationHdr'), 11, 11);
      for (const l of al) gb.prepare('INSERT INTO c_allocationline(c_allocationline_id,c_allocationhdr_id,c_payment_id,c_invoice_id,c_bpartner_id,amount,writeoffamt,discountamt) VALUES(?,?,?,?,?,?,?,?)')
        .run(l.c_allocationline_id, ah.c_allocationhdr_id, l.c_payment_id, l.c_invoice_id, l.c_bpartner_id, l.amount, l.writeoffamt || 0, l.discountamt || 0); }
    const fold = (t, id, sc) => { if (!id) return 'none'; const d = DP.derivePostings(gb, { table: t, id }, sc); return d.absent && d.absent.length ? 'ABSENT:' + d.absent.join(',') : (d.lines.length ? fmtPostings(d.lines) : 'none'); };
    const flag = (t, f2) => { const u = r.ops.filter(o => o.op_type === 'UPDATE_FIELD' && o.table === t && o.field === f2).pop(); return u ? u.value : 'N'; };
    return { outcome: 'COMPLETED', docstatus: status('C_Payment'), isallocated: flag('C_Payment', 'isallocated'), invoice_paid: flag('C_Invoice', 'ispaid'),
      allocation: al.map(l => `${status('C_AllocationHdr')}:${cents(l.amount)}:${cents(l.writeoffamt || 0)}:${cents(l.discountamt || 0)}:${l.c_invoice_id === inv.c_invoice_id ? 'inv' : l.c_invoice_id}`).join('|') || 'none',
      postings_payment: fold('C_Payment', pid, SCHEMA), postings_alloc: fold('C_AllocationHdr', ah && ah.c_allocationhdr_id, SCHEMA),
      postings_payment_euro: fold('C_Payment', pid, SCHEMA2), postings_alloc_euro: fold('C_AllocationHdr', ah && ah.c_allocationhdr_id, SCHEMA2) };
  };
}

// ================= MODEL: AR Invoice created directly (spec §58) — legacy through the frozen link (descriptor = test data) =================
const INV_DESC = { inv: { composite: 'SyncOrder',
  header: { serviceType: 'BridgeCreateInvoice', table: 'C_Invoice', fields: { AD_Org_ID: { path: 'org' }, C_DocTypeTarget_ID: { const: 116 }, C_BPartner_ID: { path: 'bp' }, C_BPartner_Location_ID: { path: 'loc' },
    M_PriceList_ID: { const: 101 }, IsSOTrx: { const: 'Y' }, DateInvoiced: { path: 'date' }, DateAcct: { path: 'date' }, Description: { path: 'note' } } },
  lines: { serviceType: 'BridgeCreateInvoiceLine', table: 'C_InvoiceLine', parent: 'C_Invoice_ID', from: 'lines', lineNo: { col: 'Line', step: 10 },
    fields: { AD_Org_ID: { path: 'org' }, AD_Client_ID: { const: 11 }, M_Product_ID: { path: 'product' }, QtyEntered: { path: 'qty' }, QtyInvoiced: { path: 'qty' } } },
  docAction: { serviceType: 'BridgeCompleteInvoice', table: 'C_Invoice', action: 'CO' } } };
const invSpec = { keys: ['outcome', 'docstatus', 'lines', 'total_cents', 'invoice_tax', 'grand_total_cents', 'postings', 'postings_euro', 'ispaid'], notCompared: {} };
const invLinks = {};
async function legacyInvoice(f) {
  const org = f.org || 11;
  if (!invLinks[org]) { let bytes = null; invLinks[org] = await createLink({ cfg: cfgFor(f), persistence: { load: () => bytes, save: b => { bytes = Uint8Array.from(b); } }, descriptors: INV_DESC }); }
  const L = invLinks[org], bp = f.bp || BP;
  const uid = L.submit('inv', { org, bp, loc: LOC[bp], date: (f.date || TODAY) + ' 00:00:00', note: 'M3 ' + f.id, lines: f.lines.map(l => ({ ...l, org })) });
  await L.drain(); const st = L.store.get(uid);
  if (st.state !== 'CONFIRMED' && /not allowed|No permission|Unknown web service/i.test(st.error || '')) throw new Error('§WS_CONFIG ' + st.error);
  if (st.state !== 'CONFIRMED') return { outcome: 'REJECTED', reason: (st.error || '').slice(0, 120) };
  const id = L.store.idmap(uid).find(x => x.tbl === 'C_Invoice').server_id;
  const h = (await query(cfg, 'QueryCInvoice', `C_Invoice_ID=${id}`))[0], ls = await query(cfg, 'QueryCInvoiceLine', `C_Invoice_ID=${id}`);
  return { outcome: 'COMPLETED', docstatus: h.DocStatus, lines: ls.map(l => `${l.M_Product_ID}:${Number(l.QtyInvoiced)}:${cents(l.PriceActual)}:${l.C_Tax_ID}`).sort().join('|'), total_cents: cents(h.TotalLines),
    invoice_tax: (await query(cfg, 'QueryCInvoiceTax', `C_Invoice_ID=${id}`)).map(t => `${t.C_Tax_ID}:${cents(t.TaxBaseAmt)}:${cents(t.TaxAmt)}`).sort().join('|') || 'none', grand_total_cents: cents(h.GrandTotal),
    postings: await legacyFactsOf(318, id, SCHEMA), postings_euro: await legacyFactsOf(318, id, SCHEMA2), ispaid: h.IsPaid === true || h.IsPaid === 'Y' ? 'Y' : 'N' };
}
function localInvoice(mut = 0) {
  return async f => {
    const org = f.org || 11, bp = f.bp || BP, date = f.date || TODAY;
    for (const l of f.lines) if (!lc(seed.prepare('SELECT m_product_id FROM m_product WHERE m_product_id=?').get(l.product))) return { outcome: 'REJECTED', reason: 'unknown product' };
    if (typeof E.prepareInvoice !== 'function') return { outcome: 'COMPLETED', docstatus: 'DR', lines: 'none', total_cents: 0, invoice_tax: 'none', grand_total_cents: 0, postings: 'none', postings_euro: 'none', ispaid: 'N' };
    const iid = ++seq * 10;
    const r = E.prepareInvoice({ c_invoice_id: iid, issotrx: 'Y', c_bpartner_id: bp, dateinvoiced: date }, f.lines.map((l, i) => ({ c_invoiceline_id: iid * 100 + i, m_product_id: l.product, qtyinvoiced: l.qty })),
      { priceOf: priceOfAt, taxOf: taxOfFor({ org, bp, invoice: true, date }), taxById, taxChildren, taxIncluded: TAX_INCLUDED, mutCents: mut });
    if (!r.ok) return { outcome: 'REJECTED', reason: r.reason };
    const ops = r.ops.concat(E.completeInvoice({ c_invoice_id: iid, issotrx: 'Y' }, r.lines, {}));
    const status = (ops.filter(o => o.op_type === 'SET_STATUS' && o.table === 'C_Invoice').pop() || {}).doc_status;
    gb.prepare('INSERT INTO c_invoice(c_invoice_id,c_bpartner_id,grandtotal,issotrx,c_currency_id,dateacct,ad_client_id,ad_org_id) VALUES(?,?,?,?,?,?,?,?)').run(iid, bp, r.grandTotal / 100, 'Y', PL_CURRENCY, date + ' 00:00:00', 11, org);
    r.lines.forEach((l, i) => gb.prepare('INSERT INTO c_invoiceline(c_invoiceline_id,c_invoice_id,m_product_id,linenetamt) VALUES(?,?,?,?)').run(l.c_invoiceline_id, iid, l.m_product_id, l.linenetamt));
    r.taxes.forEach(t => gb.prepare('INSERT INTO c_invoicetax(c_invoice_id,c_tax_id,taxamt) VALUES(?,?,?)').run(iid, t.c_tax_id, t.taxamt / 100));
    const fold = sc2 => { const d = DP.derivePostings(gb, { table: 'C_Invoice', id: iid }, sc2); return d.absent && d.absent.length ? 'ABSENT:' + d.absent.join(',') : fmtPostings(d.lines); };
    return { outcome: 'COMPLETED', docstatus: status, lines: r.lines.map(l => `${l.m_product_id}:${l.qtyinvoiced}:${cents(l.priceactual)}:${l.c_tax_id}`).sort().join('|'), total_cents: r.totalLines,
      invoice_tax: r.taxes.map(t => `${t.c_tax_id}:${t.taxbaseamt}:${t.taxamt}`).sort().join('|') || 'none', grand_total_cents: r.grandTotal, postings: fold(SCHEMA), postings_euro: fold(SCHEMA2), ispaid: 'N' };
  };
}

// ================= MODEL: Physical Inventory (spec §59) — legacy through the frozen link (descriptor = test data) =================
const PI_DESC = { pi: { composite: 'SyncOrder',
  header: { serviceType: 'BridgeCreateInventory', table: 'M_Inventory', fields: { AD_Org_ID: { const: 11 }, C_DocType_ID: { const: 144 }, M_Warehouse_ID: { const: 103 }, MovementDate: { path: 'date' }, Description: { path: 'note' } } },
  lines: { serviceType: 'BridgeCreateInventoryLine', table: 'M_InventoryLine', parent: 'M_Inventory_ID', from: 'lines', lineNo: { col: 'Line', step: 10 },
    fields: { AD_Org_ID: { const: 11 }, AD_Client_ID: { const: 11 }, M_Locator_ID: { path: 'loc' }, M_Product_ID: { path: 'product' }, QtyBook: { path: 'book' }, QtyCount: { path: 'count' }, InventoryType: { const: 'D' } } },
  docAction: { serviceType: 'BridgeCompleteInventory', table: 'M_Inventory', action: 'CO' } } };
const piSpec = { keys: ['outcome', 'docstatus', 'lines', 'stock_delta', 'postings', 'postings_euro', 'cost_qty_delta'], notCompared: {} };
let piLink = null;
async function legacyInventory(f) {
  if (!piLink) { let bytes = null; piLink = await createLink({ cfg, persistence: { load: () => bytes, save: b => { bytes = Uint8Array.from(b); } }, descriptors: PI_DESC }); }
  const before = {}; for (const l of f.lines) before[l.product + '@' + l.loc] = await locStock(l.product, l.loc);
  const cq0 = {}; for (const l of f.lines) cq0[l.product] = await legacyCostQty(l.product);
  const uid = piLink.submit('pi', { date: (f.date || TODAY) + ' 00:00:00', note: 'M3 ' + f.id, lines: f.lines });
  await piLink.drain(); const st = piLink.store.get(uid);
  if (st.state !== 'CONFIRMED' && /not allowed|No permission|Unknown web service/i.test(st.error || '')) throw new Error('§WS_CONFIG ' + st.error);
  if (st.state !== 'CONFIRMED') return { outcome: 'REJECTED', reason: (st.error || '').slice(0, 120) };
  const id = piLink.store.idmap(uid).find(x => x.tbl === 'M_Inventory').server_id;
  const h = (await query(cfg, 'QueryMInventory', `M_Inventory_ID=${id}`))[0], ls = await query(cfg, 'QueryMInventoryLine', `M_Inventory_ID=${id}`);
  for (let i = 0; i < 8 && !['Y', 'E'].includes(h.Posted); i++) { await new Promise(r => setTimeout(r, 1500)); h.Posted = (await query(cfg, 'QueryMInventory', `M_Inventory_ID=${id}`))[0].Posted; }
  const stock = {}; for (const k of Object.keys(before)) { const [p, loc] = k.split('@'); const d = (await locStock(+p, +loc)) - before[k]; if (d) stock[k] = d; }
  const cq = {}; for (const p of Object.keys(cq0)) cq[p] = await legacyCostQty(+p);
  return { outcome: 'COMPLETED', docstatus: h.DocStatus, lines: ls.map(l => `${l.M_Product_ID}:${Number(l.QtyBook)}:${Number(l.QtyCount)}`).sort().join('|'), stock_delta: JSON.stringify(stock),
    postings: h.Posted === 'E' ? 'REFUSED:Posted=E' : await legacyFactsOf(321, id, SCHEMA), postings_euro: h.Posted === 'E' ? 'REFUSED:Posted=E' : await legacyFactsOf(321, id, SCHEMA2), cost_qty_delta: deltaStr(Object.keys(cq0), cq0, p => cq[p]) };
}
gb.exec('CREATE TABLE IF NOT EXISTS m_inventory(m_inventory_id INT, m_warehouse_id INT, docstatus TEXT, c_doctype_id INT, movementdate TEXT)');   // test materialisation (the bundle carries these tables)
gb.exec('CREATE TABLE IF NOT EXISTS m_inventoryline(m_inventoryline_id INT, m_inventory_id INT, m_locator_id INT, m_product_id INT, qtybook REAL, qtycount REAL, c_charge_id INT, isactive TEXT)');
function localInventory(mut = 0) {
  return async f => {
    for (const l of f.lines) if (!lc(seed.prepare('SELECT m_product_id FROM m_product WHERE m_product_id=?').get(l.product))) return { outcome: 'REJECTED', reason: 'unknown product' };
    const iid = ++seq * 10, lines = f.lines.map((l, i) => ({ m_inventoryline_id: iid * 100 + i, m_locator_id: l.loc, m_product_id: l.product, qtybook: l.book, qtycount: l.count + mut }));
    const cq0 = {}; for (const l of f.lines) cq0[l.product] = localCostQty(l.product);
    if (typeof E.completeInventory !== 'function') return { outcome: 'COMPLETED', docstatus: 'DR', lines: lines.map(l => `${l.m_product_id}:${l.qtybook}:${l.qtycount}`).sort().join('|'), stock_delta: '{}', postings: 'none', postings_euro: 'none', cost_qty_delta: '{}' };
    const r = E.completeInventory({ m_inventory_id: iid, docsubtypeinv: 'PI' }, lines); if (!r.ok) return { outcome: 'REJECTED', reason: r.reason };
    const status = (r.ops.filter(o => o.op_type === 'SET_STATUS').pop() || {}).doc_status;
    const stock = {}; r.ops.filter(o => o.op_type === 'MOVE_STOCK').forEach(o => { const k = o.m_product_id + '@' + o.m_locator_id; stock[k] = (stock[k] || 0) + Number(o.qty); });
    Object.keys(stock).forEach(k => { if (!stock[k]) delete stock[k]; });
    gb.prepare('INSERT INTO m_inventory(m_inventory_id,m_warehouse_id,docstatus,c_doctype_id,movementdate) VALUES(?,?,?,?,?)').run(iid, 103, status, 144, (f.date || TODAY) + ' 00:00:00');
    for (const l of lines) gb.prepare('INSERT INTO m_inventoryline(m_inventoryline_id,m_inventory_id,m_locator_id,m_product_id,qtybook,qtycount,c_charge_id,isactive) VALUES(?,?,?,?,?,?,?,?)').run(l.m_inventoryline_id, iid, l.m_locator_id, l.m_product_id, l.qtybook, l.qtycount, null, 'Y');
    const fold = sc2 => { const d = DP.derivePostings(gb, { table: 'M_Inventory', id: iid }, sc2); return d.absent && d.absent.length ? 'ABSENT:' + d.absent.join(',') : (d.lines.length ? fmtPostings(d.lines) : 'none'); };
    const res = { outcome: 'COMPLETED', docstatus: status, lines: lines.map(l => `${l.m_product_id}:${l.qtybook}:${l.qtycount}`).sort().join('|'), stock_delta: JSON.stringify(stock), postings: fold(SCHEMA), postings_euro: fold(SCHEMA2) };
    if (typeof DP.costQtyUpdatesFor === 'function') for (const u of DP.costQtyUpdatesFor(gb, 'M_Inventory', iid)) gb.prepare('UPDATE m_cost SET currentqty=COALESCE(currentqty,0)+?, currentcostprice=COALESCE(?, currentcostprice) WHERE m_product_id=? AND c_acctschema_id=? AND m_costtype_id=? AND m_costelement_id=?').run(u.delta, u.currentcostprice == null ? null : u.currentcostprice, u.m_product_id, u.c_acctschema_id, u.m_costtype_id, u.m_costelement_id);
    res.cost_qty_delta = deltaStr(Object.keys(cq0), cq0, p => localCostQty(+p));
    return res;
  };
}

// ================= MODEL: Purchase Requisition (spec §66) — legacy through the frozen link (descriptor = test data) =================
const REQ_FIELDS = { AD_Org_ID: { const: 11 }, C_DocType_ID: { const: 127 }, M_PriceList_ID: { const: 102 }, M_Warehouse_ID: { const: 103 }, DateDoc: { path: 'date' }, DateRequired: { path: 'date' }, PriorityRule: { const: '5' }, Description: { path: 'note' } };
const REQ_LINES = { serviceType: 'BridgeCreateRequisitionLine', table: 'M_RequisitionLine', parent: 'M_Requisition_ID', from: 'lines', lineNo: { col: 'Line', step: 10 }, fields: { AD_Org_ID: { const: 11 }, M_Product_ID: { path: 'product' }, Qty: { path: 'qty' } } };
const REQ_DESC = {
  req: { composite: 'SyncOrder', header: { serviceType: 'BridgeCreateRequisition', table: 'M_Requisition', fields: { ...REQ_FIELDS, AD_User_ID: { path: 'user' } } }, lines: REQ_LINES, docAction: { serviceType: 'BridgeCompleteRequisition', table: 'M_Requisition', action: 'CO' } },
  reqNoUser: { composite: 'SyncOrder', header: { serviceType: 'BridgeCreateRequisition', table: 'M_Requisition', fields: REQ_FIELDS }, lines: REQ_LINES, docAction: { serviceType: 'BridgeCompleteRequisition', table: 'M_Requisition', action: 'CO' } } };
const reqSpec = { keys: ['outcome', 'docstatus', 'lines', 'total_cents', 'postings', 'postings_euro'], notCompared: {} };
let reqLink = null, LOGIN_USER = null;
async function legacyReq(f) {
  if (!reqLink) { let bytes = null; reqLink = await createLink({ cfg, persistence: { load: () => bytes, save: b => { bytes = Uint8Array.from(b); } }, descriptors: REQ_DESC }); }
  if (LOGIN_USER == null) LOGIN_USER = Number(((await query(cfg, 'QueryADUser', `Name='${cfg.login.user}'`))[0] || {}).AD_User_ID || 0);   // the requester a user's window defaults to: the login user
  const uid = reqLink.submit(f.noUser ? 'reqNoUser' : 'req', { user: LOGIN_USER, date: (f.date || TODAY) + ' 00:00:00', note: 'M3 ' + f.id, lines: f.lines });
  await reqLink.drain(); const st = reqLink.store.get(uid);
  if (st.state !== 'CONFIRMED' && /not allowed|No permission|Unknown web service/i.test(st.error || '')) throw new Error('§WS_CONFIG ' + st.error);
  if (st.state !== 'CONFIRMED') return { outcome: 'REJECTED', reason: (st.error || '').slice(0, 120) };
  const id = reqLink.store.idmap(uid).find(x => x.tbl === 'M_Requisition').server_id;
  const h = (await query(cfg, 'QueryMRequisition', `M_Requisition_ID=${id}`))[0], ls = await query(cfg, 'QueryMRequisitionLine', `M_Requisition_ID=${id}`);
  return { outcome: 'COMPLETED', docstatus: h.DocStatus, lines: ls.map(l => `${l.M_Product_ID}:${Number(l.Qty)}:${cents(l.PriceActual)}:${cents(l.LineNetAmt)}`).sort().join('|'), total_cents: cents(h.TotalLines),
    postings: await legacyFactsOf(702, id, SCHEMA), postings_euro: await legacyFactsOf(702, id, SCHEMA2) };
}
const plRows = (pl, pid) => seed.prepare("SELECT v.validfrom, pp.pricestd, pp.pricelist, pp.pricelimit FROM m_productprice pp JOIN m_pricelist_version v ON v.m_pricelist_version_id=pp.m_pricelist_version_id WHERE v.m_pricelist_id=? AND pp.m_product_id=? AND v.isactive='Y' AND pp.isactive='Y'").all(pl, pid).map(lc);
function localReq(mut = 0) {
  return async f => {
    if (typeof E.prepareRequisition !== 'function') return { outcome: 'COMPLETED', docstatus: 'DR', lines: 'none', total_cents: 0, postings: 'none', postings_euro: 'none' };
    const rid = ++seq * 10; const prec = (lc(seed.prepare('SELECT c.stdprecision p FROM m_pricelist l JOIN c_currency c ON c.c_currency_id=l.c_currency_id WHERE l.m_pricelist_id=102').get()) || {}).p;   // MPriceList.getStandardPrecision = the currency's (MPriceList.java:356-364)
    const r = E.prepareRequisition({ m_requisition_id: rid, ad_user_id: f.noUser ? 0 : 101, m_pricelist_id: 102, m_warehouse_id: 103, daterequired: f.date || TODAY },
      f.lines.map((l, i) => ({ m_requisitionline_id: rid * 100 + i, m_product_id: l.product, qty: l.qty })),
      { priceOf: (pid, d) => { const x = E.priceAt(plRows(102, pid), d); return x ? { pricestd: mut ? (Number(x.pricestd) + mut / 100).toFixed(2) : x.pricestd } : null; }, precision: prec, periodOpen: E.periodOpen(periodData, f.date || TODAY, 'POR', TODAY) });
    if (!r.ok) return { outcome: 'REJECTED', reason: r.reason };
    gb.prepare('INSERT INTO m_requisition(m_requisition_id,docstatus,m_pricelist_id,m_warehouse_id,ad_client_id,ad_org_id) VALUES(?,?,?,?,?,?)').run(rid, 'CO', 102, 103, 11, 11);   // the posting db's own m_requisition shape
    r.lines.forEach(l => gb.prepare('INSERT INTO m_requisitionline(m_requisitionline_id,m_requisition_id,m_product_id,qty,linenetamt) VALUES(?,?,?,?,?)').run(l.m_requisitionline_id, rid, l.m_product_id, l.qty, l.linenetamt / 100));
    const fold = sc2 => { const d = DP.derivePostings(gb, { table: 'M_Requisition', id: rid }, sc2); return d.absent && d.absent.length ? 'ABSENT:' + d.absent.join(',') : (d.lines.length ? fmtPostings(d.lines) : 'none'); };
    return { outcome: 'COMPLETED', docstatus: (r.ops.find(o => o.op_type === 'SET_STATUS') || {}).doc_status, lines: r.lines.map(l => `${l.m_product_id}:${Number(l.qty)}:${cents(l.priceactual)}:${l.linenetamt}`).sort().join('|'), total_cents: r.totalLines,
      postings: fold(SCHEMA), postings_euro: fold(SCHEMA2) };
  };
}

// ================= MODEL: Cash Journal (spec §66) — an AR invoice settled by a cash journal Invoice line; legacy through the frozen link =================
const CASH_DESC = {
  inv: INV_DESC.inv,
  invDraft: Object.fromEntries(Object.entries(INV_DESC.inv).filter(([k]) => k !== 'docAction')),   // the same invoice, NOT completed (CASH-REJ)
  cash: { composite: 'SyncOrder', header: { serviceType: 'BridgeCreateCash', table: 'C_Cash', fields: { AD_Org_ID: { const: 11 }, C_CashBook_ID: { const: 101 }, Name: { path: 'name' }, StatementDate: { path: 'date' }, DateAcct: { path: 'date' }, Description: { path: 'note' } } },
    lines: { serviceType: 'BridgeCreateCashLine', table: 'C_CashLine', parent: 'C_Cash_ID', from: 'lines', lineNo: { col: 'Line', step: 10 }, fields: { AD_Org_ID: { const: 11 }, CashType: { const: 'I' }, C_Invoice_ID: { path: 'inv' }, Amount: { path: 'amt' }, C_Currency_ID: { const: 100 } } },
    docAction: { serviceType: 'BridgeCompleteCash', table: 'C_Cash', action: 'CO' } } };
// §68 (F32) the window shape: the cash journal is SAVED (committed) first, completed by a separate doc-action call — same descriptor without the doc-action
CASH_DESC.cashSaved = Object.fromEntries(Object.entries(CASH_DESC.cash).filter(([k]) => k !== 'docAction'));
const cashSpec = { keys: ['outcome', 'cash_status', 'statement_diff', 'allocation', 'ispaid', 'books_cash', 'books_cash_euro', 'books_alloc', 'books_alloc_euro', 'bp_delta'], notCompared: {} };
let cashLink = null;
const bpOf = async () => { const b = (await query(cfg, 'QueryCBPartner', `C_BPartner_ID=${BP}`))[0]; return { open: cents(b.TotalOpenBalance), credit: cents(b.SO_CreditUsed) }; };
async function legacyCash(f) {
  if (!cashLink) { let bytes = null; cashLink = await createLink({ cfg, persistence: { load: () => bytes, save: b => { bytes = Uint8Array.from(b); } }, descriptors: CASH_DESC }); }
  const bp0 = await bpOf();
  const iu = cashLink.submit(f.draft ? 'invDraft' : 'inv', { org: 11, bp: BP, loc: LOC[BP], date: TODAY + ' 00:00:00', note: 'M3 ' + f.id, lines: f.lines.map(l => ({ ...l, org: 11 })) });
  await cashLink.drain(); const ist = cashLink.store.get(iu); if (ist.state !== 'CONFIRMED') return { outcome: 'ERROR', error: 'invoice: ' + ist.error };
  const invId = cashLink.store.idmap(iu).find(x => x.tbl === 'C_Invoice').server_id, inv = (await query(cfg, 'QueryCInvoice', `C_Invoice_ID=${invId}`))[0];
  const cu = cashLink.submit(f.split ? 'cashSaved' : 'cash', { name: 'M3 ' + f.id + ' ' + Date.now().toString(36), date: TODAY + ' 00:00:00', note: 'M3 ' + f.id, lines: [{ inv: invId, amt: Number(inv.GrandTotal) }] });
  await cashLink.drain(); const cst = cashLink.store.get(cu);
  if (cst.state !== 'CONFIRMED' && /not allowed|No permission|Unknown web service/i.test(cst.error || '')) throw new Error('§WS_CONFIG ' + cst.error);
  if (cst.state !== 'CONFIRMED') return { outcome: 'REJECTED', reason: (cst.error || '').slice(0, 120) };
  const cashId = cashLink.store.idmap(cu).find(x => x.tbl === 'C_Cash').server_id;
  if (f.split) {   // §68: the separate Complete (its own server transaction, the journal already committed)
    try { await call_(cfg, 'set_docaction', { ModelSetDocAction: { serviceType: 'BridgeCompleteCash', tableName: 'C_Cash', recordID: cashId, docAction: 'CO' } }); }
    catch (e) { return { outcome: 'REJECTED', reason: String(e.message).slice(0, 120) }; } }
  let h; for (let i = 0; i < 10; i++) { h = (await query(cfg, 'QueryCCash', `C_Cash_ID=${cashId}`))[0]; if (['Y', 'E'].includes(h.Posted) || h.Posted === true) break; await new Promise(r => setTimeout(r, 1500)); }
  const al = await query(cfg, 'QueryCAllocationLine', `C_Invoice_ID=${invId}`); const hid = al[0] && al[0].C_AllocationHdr_ID;
  const ah = hid ? (await query(cfg, 'QueryCAllocationHdr', `C_AllocationHdr_ID=${hid}`))[0] : null;
  const inv2 = (await query(cfg, 'QueryCInvoice', `C_Invoice_ID=${invId}`))[0], bp1 = await bpOf();
  const books = async (t, id, posted) => posted === 'E' ? 'REFUSED:Posted=E' : [await legacyFactsOf(t, id, SCHEMA), await legacyFactsOf(t, id, SCHEMA2)];
  const [c1, c2] = h.Posted === 'E' ? ['REFUSED:Posted=E', 'REFUSED:Posted=E'] : await books(407, cashId);
  const [a1, a2] = hid ? await books(735, hid) : ['none', 'none'];
  return { outcome: 'COMPLETED', cash_status: h.DocStatus, statement_diff: cents(h.StatementDifference), allocation: al.map(a => `${ah.DocStatus}:${cents(a.Amount)}:${a.C_CashLine_ID ? 'cash' : '-'}`).join('|') || 'none',
    ispaid: inv2.IsPaid === true || inv2.IsPaid === 'Y' ? 'Y' : 'N', books_cash: c1, books_cash_euro: c2, books_alloc: a1, books_alloc_euro: a2, bp_delta: `${bp1.open - bp0.open}/${bp1.credit - bp0.credit}` };
}
function localCash(mut = 0, mode = null) {
  return async f => {
    const was = mode ? (gb.prepare("SELECT value v FROM ad_sysconfig WHERE name='CLIENT_ACCOUNTING'").get() || {}).v : null;
    if (mode) gb.prepare("UPDATE ad_sysconfig SET value=? WHERE name='CLIENT_ACCOUNTING'").run(mode);   // §68 mode control: the SQLite side flipped, legacy unchanged
    try { return await localCash1(mut, f); } finally { if (mode) gb.prepare("UPDATE ad_sysconfig SET value=? WHERE name='CLIENT_ACCOUNTING'").run(was); }
  };
}
async function localCash1(mut, f) {
  {
    if (typeof E.completeCash !== 'function') return { outcome: 'COMPLETED', cash_status: 'DR', statement_diff: 0, allocation: 'none', ispaid: 'N', books_cash: 'none', books_cash_euro: 'none', books_alloc: 'none', books_alloc_euro: 'none', bp_delta: 'none' };
    const iid = ++seq * 10;
    const r = E.prepareInvoice({ c_invoice_id: iid, issotrx: 'Y', c_bpartner_id: BP, dateinvoiced: TODAY }, f.lines.map((l, i) => ({ c_invoiceline_id: iid * 100 + i, m_product_id: l.product, qtyinvoiced: l.qty })),
      { priceOf: priceOfAt, taxOf: taxOfFor({ org: 11, bp: BP, invoice: true, date: TODAY }), taxById, taxChildren, taxIncluded: TAX_INCLUDED });
    if (!r.ok) return { outcome: 'ERROR', error: 'invoice ' + r.reason };
    const ist = f.draft ? 'DR' : 'CO';
    const st = { invoices: [{ c_invoice_id: iid, issotrx: 'Y', docstatus: ist, grandtotal: r.grandTotal, ispaid: 'N' }], payments: [], allocations: [] };
    const b0 = E.bpOpenBalance({ invoices: [], payments: [], allocations: [] });
    gb.prepare('INSERT INTO c_invoice(c_invoice_id,c_bpartner_id,grandtotal,issotrx,c_currency_id,dateacct,ad_client_id,ad_org_id,docstatus) VALUES(?,?,?,?,?,?,?,?,?)').run(iid, BP, r.grandTotal / 100, 'Y', PL_CURRENCY, TODAY + ' 00:00:00', 11, 11, ist);
    const cid = ++seq * 10, amt = (r.grandTotal + mut) / 100;
    const lines = [{ c_cashline_id: cid * 100 + 1, cashtype: 'I', c_invoice_id: iid, amount: amt, c_currency_id: PL_CURRENCY }];
    const c = E.completeCash({ c_cash_id: cid, dateacct: TODAY }, lines, { invoiceOf: id => ({ docstatus: ist, grandtotal: r.grandTotal / 100, allocated: 0, c_bpartner_id: BP }), newId: () => ++seq * 10,
      periodOpen: E.periodOpen(periodData, TODAY, 'CMC', TODAY) });
    if (!c.ok) return { outcome: 'REJECTED', reason: c.reason };
    const ah = c.ops.find(o => o.op_type === 'CREATE_DOCUMENT' && o.table === 'C_AllocationHdr'), al = c.ops.filter(o => o.op_type === 'CREATE_LINE' && o.table === 'C_AllocationLine');
    const paid = (c.ops.find(o => o.op_type === 'UPDATE_FIELD' && o.table === 'C_Invoice' && o.field === 'ispaid') || {}).value || 'N';
    st.invoices[0].ispaid = paid; if (ah) st.allocations.push({ isactive: 'Y', lines: al.map(l => ({ c_invoice_id: l.c_invoice_id, amount: cents(l.amount), discountamt: 0, writeoffamt: 0 })) });
    const b1 = E.bpOpenBalance(st);
    gb.prepare('INSERT INTO c_cash(c_cash_id,c_cashbook_id,docstatus,ad_org_id,ad_client_id,dateacct,statementdifference) VALUES(?,?,?,?,?,?,?)').run(cid, 101, 'CO', 11, 11, TODAY + ' 00:00:00', c.statementDifference);
    lines.forEach(l => gb.prepare('INSERT INTO c_cashline(c_cashline_id,c_cashbook_id,c_cash_id,amount,cashtype,c_invoice_id,c_currency_id) VALUES(?,?,?,?,?,?,?)').run(l.c_cashline_id, 101, cid, l.amount, l.cashtype, l.c_invoice_id, l.c_currency_id));
    if (ah) { gb.prepare('INSERT INTO c_allocationhdr(c_allocationhdr_id,c_currency_id,dateacct,docstatus,ad_client_id,ad_org_id) VALUES(?,?,?,?,?,?)').run(ah.c_allocationhdr_id, ah.c_currency_id, TODAY + ' 00:00:00', 'CO', 11, 11);
      for (const l of al) gb.prepare('INSERT INTO c_allocationline(c_allocationline_id,c_allocationhdr_id,c_payment_id,c_cashline_id,c_invoice_id,c_bpartner_id,amount,writeoffamt,discountamt) VALUES(?,?,?,?,?,?,?,?,?)').run(l.c_allocationline_id, ah.c_allocationhdr_id, null, l.c_cashline_id, l.c_invoice_id, l.c_bpartner_id, l.amount, 0, 0); }
    // §68 (F32): the transaction shape is part of the operation — composite create+complete (CASH1) vs saved first, completed later (CASH1b, f.split)
    const fold = (t, id, sc2) => { if (!id) return 'none'; const d = DP.derivePostings(gb, { table: t, id, cashJournalSameTrx: !f.split }, sc2); return d.absent && d.absent.length ? 'ABSENT:' + d.absent.join(',') : (d.lines.length ? fmtPostings(d.lines) : 'none'); };
    return { outcome: 'COMPLETED', cash_status: 'CO', statement_diff: cents(c.statementDifference), allocation: al.map(l => `CO:${cents(l.amount)}:cash`).join('|') || 'none', ispaid: paid,
      books_cash: fold('C_Cash', cid, SCHEMA), books_cash_euro: fold('C_Cash', cid, SCHEMA2), books_alloc: fold('C_AllocationHdr', ah && ah.c_allocationhdr_id, SCHEMA), books_alloc_euro: fold('C_AllocationHdr', ah && ah.c_allocationhdr_id, SCHEMA2),
      bp_delta: `${b1.open - b0.open}/${b1.credit - b0.credit}` };
  };
}

// ================= corpus (spec §23) =================
const POSDT = 135, STDDT = 132;
const sc = (id, facts) => ({ id, facts, legacy: legacyRun, local: localRun(0) });
const corpus = [
  sc('S1-pos-sale', { doctype: POSDT, lines: [{ product: 123, qty: 1 }] }),
  sc('S2-product-not-on-pricelist', { doctype: POSDT, lines: [{ product: 122, qty: 1 }] }),
  { id: 'S3-client-keyed-price', facts: { doctype: POSDT, lines: [{ product: 123, qty: 1 }], keyedPrice: 10 }, legacy: legacyRun, local: localRunAD() },   // spec §39: the AD-window path is the twin of a keyed order
  { id: 'S2b-keyed-price-product-not-on-pricelist', facts: { doctype: POSDT, lines: [{ product: 122, qty: 1 }], keyedPrice: 10 }, legacy: legacyRun, local: localRunAD() },
  sc('S11-pos-sale-costed-product', { doctype: POSDT, lines: [{ product: 137, qty: 1 }] }),   // §48: was 136 (costed qty exhausted on the pilot)
  sc('S4-unknown-product', { doctype: POSDT, lines: [{ product: 999999, qty: 1 }] }),
  sc('S6-standard-order', { doctype: STDDT, lines: [{ product: 123, qty: 1 }] }),
  sc('S13a-pos-sale-over-credit-limit', { doctype: POSDT, bp: 118, lines: [{ product: 123, qty: 200 }] }),     // spec §32: 12350 > SO_CreditLimit 10000
  sc('S13b-standard-order-over-credit-limit', { doctype: STDDT, bp: 118, lines: [{ product: 123, qty: 200 }] }),
  sc('T1-pos-sale-taxed-org12-ct', { doctype: POSDT, org: 12, wh: 104, deliveryVia: 'D', lines: [{ product: 123, qty: 1 }] }),   // spec §44: org 12 (CT) → BP 112 (CT), Delivery ⇒ CT Sales 6%
  sc('S14a-pos-order-negative-qty', { doctype: POSDT, lines: [{ product: 123, qty: -1 }] }),          // spec §47
  sc('S14b-standard-order-negative-qty', { doctype: STDDT, lines: [{ product: 123, qty: -1 }] }),
  sc('S14c-pos-order-zero-qty', { doctype: POSDT, lines: [{ product: 123, qty: 0 }] }),
  sc('S13c-pos-sale-large-no-credit-limit', { doctype: POSDT, lines: [{ product: 123, qty: 200 }] }),         // control: BP 112 limit 0 ⇒ no check (MBPartner.java:833-836) ⇒ completes
];
const spec = { keys: ['outcome', 'docstatus', 'lines', 'total_cents', 'shipments', 'shipments_completed', 'invoices', 'stock_delta', 'postings', 'postings_shipment', 'cost_qty_delta', 'line_tax', 'order_tax', 'grand_total_cents', 'invoice_tax', 'postings_euro', 'postings_shipment_euro'],
  notCompared: {} };
const quirks = [
  // S3 quirk entries REMOVED 2026-10-09 (§39): S3 is now compared on the AD-window path, where SQLite accepts the keyed price like legacy.
  // S7a quirk REMOVED 2026-10-09 (user: SQLite cannot differ from legacy ops, incl. L&F): legacy refuses the shipment posting below costed qty 0 (MCost.java:1919-1930) ⇒ SQLite must refuse too. Now a SQLITE-GAP, spec §35.
];

(async () => {
  let fails = 0, incon = 0;
  const out = (tag, ok, msg) => { log(`${tag} ${ok === 'INCONCLUSIVE' ? 'INCONCLUSIVE' : ok ? 'PASS' : 'FAIL'} ${msg}`); if (ok === 'INCONCLUSIVE') incon++; else if (!ok) fails++; };
  let o2cNeg = null;   // §64 cycle negative control rows

  // §37/§38 C5 handover in miniature: load the generated dict_diff patches (schema + data, legacy values) into the scratch posting db so both sides start from the SAME state
  { const DD = require('./dict_diff'); const sync = [];
    for (const sp of require('./dict_spec.json').filter(x => x.db === 'glassbowl')) {
      const L = await DD.discover(cfg, sp), r = DD.compare(L, gb, sp), st = DD.applyPatch(gb, DD.toSchemaPatch(r, sp) + DD.toPatch(r, sp)), r2 = DD.compare(L, gb, sp);
      sync.push(`${sp.table}:+${st.altered}col,${st.ran}stmt,left=${r2.changed.length + r2.onlyLegacy.length}`); }
    log(`§M3_STATE_SYNC ${sync.join(' ')}`); }
  // S7 (spec §31): quantity = legacy on-hand now (floored at 0) + 1 ⇒ every run sells beyond on-hand
  // and beyond the legacy Average-PO costed qty (QueryMCost), so the verdict cannot flip between runs (a refused posting leaves costed qty unchanged)
  const oh128 = await stockOf(128);
  const cq128 = (await query(cfg, 'QueryMCost', `M_Product_ID=128 AND C_AcctSchema_ID=${SCHEMA} AND M_CostElement_ID IN (SELECT M_CostElement_ID FROM M_CostElement WHERE CostingMethod='A')`)).reduce((a, r) => Math.max(a, Number(r.CurrentQty)), 0);
  const q7 = Math.max(oh128, cq128, 0) + 1;
  log(`§S7_FACTS product=128 legacy_onhand_before=${oh128} legacy_avg_costed_qty=${cq128} qty=${q7} warehouse=103`);
  corpus.push(sc('S7a-pos-sale-beyond-onhand', { doctype: POSDT, lines: [{ product: 128, qty: q7 }] }),
    sc('S7b-standard-order-beyond-onhand', { doctype: STDDT, lines: [{ product: 128, qty: q7 }] }));
  // S8 (spec §40): period control — dates relative to the legacy server's today where the rule is relative
  const today = new Date(); const iso = d => d.toISOString().slice(0, 10); const plus = n => iso(new Date(today.getTime() + n * 86400000));
  corpus.push(sc('S8a-pos-sale-past-dated-open-period', { doctype: POSDT, date: '2026-09-15', lines: [{ product: 123, qty: 1 }] }),
    sc('S8b-pos-sale-date-without-period', { doctype: POSDT, date: '2000-06-01', lines: [{ product: 123, qty: 1 }] }),
    sc('S8c-pos-sale-beyond-open-future', { doctype: POSDT, date: plus(200), lines: [{ product: 123, qty: 1 }] }),
    sc('S8d-pos-sale-before-open-history', { doctype: POSDT, date: '1999-01-15', lines: [{ product: 123, qty: 1 }] }));
  // M3_ONLY=<prefix>: run only the corpus rows whose id starts with it (used by the one-shot S5 witness, spec §43); the S5 row exists only in that mode
  if (process.env.M3_ONLY === 'S5') corpus.push(sc('S5-pos-sale-stray-acct-schema', { doctype: POSDT, lines: [{ product: 123, qty: 1 }] }));
  if (process.env.M3_ONLY) { const keep = corpus.filter(c => c.id.startsWith(process.env.M3_ONLY)); corpus.length = 0; corpus.push(...keep); }
  const rows = await R.run(corpus, spec, quirks, { log });
  const only = process.env.M3_ONLY, keepOnly = list => only ? list.filter(x => x.id.startsWith(only)) : list;
  const onlyExit = extra => { for (const r of rows.concat(extra || [])) log(`§SCN_DETAIL ${r.id} legacy=${JSON.stringify({ ...r.legacy, _order: undefined })} sqlite=${JSON.stringify(r.sqlite)}`); log('§M3_VERDICT ONLY ' + only); process.exit(0); };
  // S12 void (spec §33): product 136 (costed, reversal is cost-neutral), BP 112
  const vrows = await R.run(keepOnly([{ id: 'S12-void-pos-sale', facts: { doctype: POSDT, action: 'VO', lines: [{ product: 137, qty: 1 }] }, legacy: legacyVoid, local: localVoid(0) },
    { id: 'S12b-void-taxed-pos-sale', facts: { doctype: POSDT, action: 'VO', org: 12, wh: 104, deliveryVia: 'D', lines: [{ product: 137, qty: 1 }] }, legacy: legacyVoid, local: localVoid(0) }]), voidSpec, quirks, { log });
  rows.push(...vrows);
  // MODEL Inventory Move (spec §56)
  const mrows = await R.run(keepOnly([{ id: 'MV1-move-inter-org', facts: { id: 'MV1', lines: [{ product: 137, qty: 1, from: 101, to: 102 }] }, legacy: legacyMove, local: localMove(0) },
    { id: 'MV-REJ-unknown-product', facts: { id: 'MVR', lines: [{ product: 999999, qty: 1, from: 101, to: 102 }] }, legacy: legacyMove, local: localMove(0) }]), moveSpec, quirks, { log });
  rows.push(...mrows);
  // MODEL AR Receipt (spec §57)
  const prows = await R.run(keepOnly([{ id: 'PAY1-receipt-settles-invoice', facts: { id: 'PAY1', lines: [{ product: 137, qty: 1 }] }, legacy: legacyPay, local: localPay(0) },
    { id: 'PAY-REJ-unknown-invoice', facts: { id: 'PAYR', invoice: 999999999, amt: 1 }, legacy: legacyPay, local: localPay(0) }]), paySpec, quirks, { log });
  rows.push(...prows);
  // MODEL AR Invoice direct (spec §58)
  const irows = await R.run(keepOnly([{ id: 'INV1-ar-invoice-taxed-direct', facts: { id: 'INV1', org: 12, wh: 104, lines: [{ product: 137, qty: 2 }] }, legacy: legacyInvoice, local: localInvoice(0) },
    { id: 'INV2-ar-invoice-product-not-on-pricelist', facts: { id: 'INV2', org: 12, wh: 104, lines: [{ product: 122, qty: 1 }] }, legacy: legacyInvoice, local: localInvoice(0) },
    { id: 'INV-REJ-unknown-product', facts: { id: 'INVR', org: 12, wh: 104, lines: [{ product: 999999, qty: 1 }] }, legacy: legacyInvoice, local: localInvoice(0) }]), invSpec, quirks, { log });
  rows.push(...irows);
  // MODEL Physical Inventory (spec §59): QtyBook = legacy on-hand at locator 101 now; the same book/count facts go to both sides
  const book137 = await locStock(137, 101);
  log(`§PI_FACTS product=137 locator=101 qtybook=${book137}`);
  const pirows = await R.run(keepOnly([{ id: 'PI1-physical-inventory-gain', facts: { id: 'PI1', lines: [{ product: 137, loc: 101, book: book137, count: book137 + 2 }] }, legacy: legacyInventory, local: localInventory(0) },
    { id: 'PI2-physical-inventory-loss', facts: { id: 'PI2', lines: [{ product: 137, loc: 101, book: book137 + 2, count: book137 + 1 }] }, legacy: legacyInventory, local: localInventory(0) },
    { id: 'PI-REJ-unknown-product', facts: { id: 'PIR', lines: [{ product: 999999, loc: 101, book: 0, count: 1 }] }, legacy: legacyInventory, local: localInventory(0) }]), piSpec, quirks, { log });
  rows.push(...pirows);
  // FULL CYCLE Order-to-Cash (spec §64): six chained steps, legacy first, compared after EVERY step (each step its own key set)
  if (!only || 'O2C'.startsWith(only.slice(0, 3)) && only.startsWith('O2C')) {
    const O2C = require('./cycle_o2c')({ cfg, query, call: call_, createLink, gb, E, POS, DP, SCHEMA, SCHEMA2, TODAY, cents, lc, fmtPostings, legacyFactsOf, legacyCostQty, localCostQty, locStock, applyCostQty,
      pos, priceOfAt, taxOfFor, taxById, taxChildren, TAX_INCLUDED, dtOf, creditOf, periodCheck, acctSetupOf, PL_CURRENCY, log });
    for (const [i, st] of O2C.STEPS.entries()) rows.push(...await R.run([O2C.scenario(st, i)], { keys: O2C.KEYS[st], notCompared: {} }, quirks, { log }));
    // negative control for the cycle: a second chain whose SQLite invoice price is +1¢ MUST surface at the INV step (lines, total, books, open item) and not before
    const NEG = require('./cycle_o2c')({ cfg, query, call: call_, createLink, gb, E, POS, DP, SCHEMA, SCHEMA2, TODAY, cents, lc, fmtPostings, legacyFactsOf, legacyCostQty, localCostQty, locStock, applyCostQty,
      pos, priceOfAt, taxOfFor, taxById, taxChildren, TAX_INCLUDED, dtOf, creditOf, periodCheck, acctSetupOf, PL_CURRENCY, log: () => {}, mut: 1, idBase: 98000 });
    const nr = []; for (const [i, st] of ['SO', 'SHIP', 'INV'].entries()) nr.push(...await R.run([{ ...NEG.scenario(st, i), id: 'NEG-o2c-' + st }], { keys: NEG.KEYS[st], notCompared: {} }, quirks, { log }));
    o2cNeg = nr;
  }
  // FULL CYCLE Purchase-to-Pay (spec §65)
  let p2pNeg = null;
  if (!only || only.startsWith('P2P')) {
    const ctxP = { cfg, query, createLink, gb, seed, E, DP, SCHEMA, SCHEMA2, TODAY, cents, lc, fmtPostings, legacyFactsOf, locStock, taxRows, taxById, taxChildren, log };
    const P2P = require('./cycle_p2p')(ctxP);
    for (const [i, st] of P2P.STEPS.entries()) rows.push(...await R.run([P2P.scenario(st, i)], { keys: P2P.KEYS[st], notCompared: {} }, quirks, { log }));
    if (!only || only === 'P2P-NEG') { const NEG = require('./cycle_p2p')({ ...ctxP, log: () => {}, mut: 1, idBase: 95000 });
      const nr = []; for (const [i, st] of ['PO', 'RCPT', 'INV'].entries()) nr.push(...await R.run([{ ...NEG.scenario(st, i), id: 'NEG-p2p-' + st }], { keys: NEG.KEYS[st], notCompared: {} }, quirks, { log })); p2pNeg = nr; }
  }
  if (p2pNeg) out('§M3_P2P_NEGATIVE_CONTROL', p2pNeg[0].verdict === 'MATCH' && p2pNeg[1].verdict === 'MATCH' && p2pNeg[2].verdict === 'SQLITE-GAP' && ['inv_lines', 'grand_total', 'books'].every(k => p2pNeg[2].gaps.some(g => g.key === k)),
    `+1¢ on the SQLite AP invoice price ⇒ PO=${p2pNeg[0].verdict} RCPT=${p2pNeg[1].verdict} INV=${p2pNeg[2].verdict} gaps=${p2pNeg[2].gaps.map(g => g.key).join(',')}`);
  if (o2cNeg) out('§M3_O2C_NEGATIVE_CONTROL', o2cNeg[0].verdict === 'MATCH' && o2cNeg[1].verdict === 'MATCH' && o2cNeg[2].verdict === 'SQLITE-GAP' && ['inv_lines', 'grand_total', 'books', 'bp_delta'].every(k => o2cNeg[2].gaps.some(g => g.key === k)),
    `+1¢ on the SQLite invoice price ⇒ SO=${o2cNeg[0].verdict} SHIP=${o2cNeg[1].verdict} INV=${o2cNeg[2].verdict} gaps=${o2cNeg[2].gaps.map(g => g.key).join(',')}`);
  // MODEL Purchase Requisition (spec §66)
  rows.push(...await R.run(keepOnly([{ id: 'REQ1-purchase-requisition', facts: { id: 'REQ1', lines: [{ product: 139, qty: 3 }] }, legacy: legacyReq, local: localReq(0) },
    { id: 'REQ-REJ-no-requester', facts: { id: 'REQR', noUser: true, lines: [{ product: 139, qty: 3 }] }, legacy: legacyReq, local: localReq(0) }]), reqSpec, quirks, { log }));
  if (!only) { const rneg = await R.run([{ id: 'NEG-req-control', facts: { id: 'REQN', lines: [{ product: 139, qty: 3 }] }, legacy: legacyReq, local: localReq(1) }], reqSpec, quirks, { log });
    out('§M3_REQ_NEGATIVE_CONTROL', rneg[0].verdict === 'SQLITE-GAP' && ['lines', 'total_cents'].every(k => rneg[0].gaps.some(g => g.key === k)), `+1¢ on the SQLite requisition price ⇒ verdict=${rneg[0].verdict} gaps=${rneg[0].gaps.map(g => g.key).join(',')}`); }
  // MODEL Cash Journal (spec §66)
  rows.push(...await R.run(keepOnly([{ id: 'CASH1-cash-journal-settles-invoice', facts: { id: 'CASH1', lines: [{ product: 137, qty: 1 }] }, legacy: legacyCash, local: localCash(0) },
    { id: 'CASH1b-cash-journal-saved-then-completed', facts: { id: 'CASH1b', split: true, lines: [{ product: 137, qty: 1 }] }, legacy: legacyCash, local: localCash(0) },
    { id: 'CASH-REJ-invoice-not-completed', facts: { id: 'CASHR', draft: true, lines: [{ product: 137, qty: 1 }] }, legacy: legacyCash, local: localCash(0) }]), cashSpec, quirks, { log }));
  if (!only) { const cneg = await R.run([{ id: 'NEG-cash-control', facts: { id: 'CASHN', lines: [{ product: 137, qty: 1 }] }, legacy: legacyCash, local: localCash(1) }], cashSpec, quirks, { log });
    out('§M3_CASH_NEGATIVE_CONTROL', cneg[0].verdict === 'SQLITE-GAP' && ['statement_diff', 'ispaid'].every(k => cneg[0].gaps.some(g => g.key === k)), `+1¢ on the SQLite cash line ⇒ verdict=${cneg[0].verdict} gaps=${cneg[0].gaps.map(g => g.key).join(',')}`);
    // §68 (F32) mode control: the SQLite side read with CLIENT_ACCOUNTING flipped to Q (legacy stays I) MUST differ on the allocation books — proves the mirrored setting governs the rule
    const mode = (gb.prepare("SELECT value v FROM ad_sysconfig WHERE name='CLIENT_ACCOUNTING'").get() || {}).v;
    const cmode = await R.run([{ id: 'NEG-cash-mode-control', facts: { id: 'CASHM', lines: [{ product: 137, qty: 1 }] }, legacy: legacyCash, local: localCash(0, 'Q') }], cashSpec, quirks, { log });
    out('§M3_CASH_MODE_CONTROL', mode === 'I' && cmode[0].verdict === 'SQLITE-GAP' && ['books_alloc', 'books_alloc_euro'].every(k => cmode[0].gaps.some(g => g.key === k)) && cmode[0].gaps.length === 2,
      `synced CLIENT_ACCOUNTING=${mode}; SQLite read as Q on the CASH1 shape ⇒ verdict=${cmode[0].verdict} gaps=${cmode[0].gaps.map(g => g.key).join(',')} (must be exactly the 2 allocation-book keys)`); }
  if (only) onlyExit();
  const by = Object.fromEntries(rows.map(r => [r.id, r]));
  for (const r of rows) log(`§SCN_DETAIL ${r.id} legacy=${JSON.stringify({ ...r.legacy, _order: undefined })} sqlite=${JSON.stringify(r.sqlite)}`);

  // ---- HARNESS checks
  out('§M3_NO_ERROR', rows.every(r => r.legacy.outcome !== 'ERROR' && r.sqlite.outcome !== 'ERROR'), `errors=${rows.filter(r => r.legacy.outcome === 'ERROR' || r.sqlite.outcome === 'ERROR').map(r => r.id + ':' + (r.legacy.error || r.sqlite.error)).join(',') || 'none'}`);
  const judged = rows.filter(r => r.legacy.outcome === 'COMPLETED').length;
  out('§M3_NOT_VACUOUS', judged > 0 ? true : 'INCONCLUSIVE', `scenarios where legacy completed a document=${judged} of ${rows.length}`);
  // CARDINAL RULE enforcement: a quirk without the user's exemption must NOT be honoured; with it, it is. (control both ways, synthetic diff)
  const d0 = [{ key: 'k', legacy: 1, sqlite: 2 }];
  const noEx = R.classify('x', d0, [{ scenario: 'x', key: 'k', evidence: 'e' }])[0];
  const withEx = R.classify('x', d0, [{ scenario: 'x', key: 'k', evidence: 'e', exemption: 'user 2026-10-09: "<words>"' }])[0];
  out('§M3_QUIRK_NEEDS_EXEMPTION', noEx.verdict === 'SQLITE-GAP' && withEx.verdict === 'LEGACY-QUIRK', `no exemption ⇒ ${noEx.verdict}; with the user's exemption ⇒ ${withEx.verdict}`);
  // negative control: a SQLite side that is off by one cent MUST be reported as a gap
  const neg = await R.run([{ id: 'NEG-control', facts: { doctype: POSDT, lines: [{ product: 123, qty: 1 }] }, legacy: legacyRun, local: localRun(1) }], spec, quirks, { log });
  out('§M3_NEGATIVE_CONTROL', neg[0].verdict === 'SQLITE-GAP' && neg[0].gaps.some(g => g.key === 'total_cents') && neg[0].gaps.some(g => g.key === 'postings'), `+1 cent on the SQLite side ⇒ verdict=${neg[0].verdict} (must be SQLITE-GAP on total_cents AND postings)`);
  // negative control for the void key set: +1 cent on the SQLite original invoice MUST surface as a gap on post_inv_orig
  const vneg = await R.run([{ id: 'NEG-void-control', facts: { doctype: POSDT, action: 'VO', lines: [{ product: 137, qty: 1 }] }, legacy: legacyVoid, local: localVoid(1) }], voidSpec, quirks, { log });
  out('§M3_VOID_NEGATIVE_CONTROL', vneg[0].verdict === 'SQLITE-GAP' && vneg[0].gaps.some(g => g.key === 'post_inv_orig'), `+1 cent on the SQLite invoice ⇒ verdict=${vneg[0].verdict} (must be SQLITE-GAP on post_inv_orig)`);
  // §56 negative control for the movement key set: +1 qty on the SQLite side MUST surface as a gap on lines/stock/books
  const mneg = await R.run([{ id: 'NEG-move-control', facts: { id: 'MVN', lines: [{ product: 137, qty: 1, from: 101, to: 102 }] }, legacy: legacyMove, local: localMove(1) }], moveSpec, quirks, { log });
  out('§M3_MOVE_NEGATIVE_CONTROL', mneg[0].verdict === 'SQLITE-GAP' && ['lines', 'stock_delta', 'postings'].every(k => mneg[0].gaps.some(g => g.key === k)), `+1 qty on the SQLite move ⇒ verdict=${mneg[0].verdict} gaps=${mneg[0].gaps.map(g => g.key).join(',')}`);
  // §57 negative control for the payment key set: +1¢ on the SQLite receipt MUST surface (invoice not fully paid, books differ)
  const pneg = await R.run([{ id: 'NEG-pay-control', facts: { id: 'PAYN', lines: [{ product: 137, qty: 1 }] }, legacy: legacyPay, local: localPay(1) }], paySpec, quirks, { log });
  out('§M3_PAY_NEGATIVE_CONTROL', pneg[0].verdict === 'SQLITE-GAP' && ['invoice_paid', 'postings_payment'].every(k => pneg[0].gaps.some(g => g.key === k)), `+1¢ on the SQLite receipt ⇒ verdict=${pneg[0].verdict} gaps=${pneg[0].gaps.map(g => g.key).join(',')}`);
  // §58 negative control for the direct-invoice key set: +1¢ on the SQLite line MUST surface (totals, tax base, books)
  const ineg = await R.run([{ id: 'NEG-inv-control', facts: { id: 'INVN', org: 12, wh: 104, lines: [{ product: 137, qty: 2 }] }, legacy: legacyInvoice, local: localInvoice(1) }], invSpec, quirks, { log });
  out('§M3_INV_NEGATIVE_CONTROL', ineg[0].verdict === 'SQLITE-GAP' && ['total_cents', 'grand_total_cents', 'postings'].every(k => ineg[0].gaps.some(g => g.key === k)), `+1¢ on the SQLite invoice line ⇒ verdict=${ineg[0].verdict} gaps=${ineg[0].gaps.map(g => g.key).join(',')}`);
  // §59 negative control for the inventory key set: +1 counted on the SQLite side MUST surface (lines, stock, books, costed qty)
  const b0 = await locStock(137, 101);
  const pineg = await R.run([{ id: 'NEG-pi-control', facts: { id: 'PIN', lines: [{ product: 137, loc: 101, book: b0, count: b0 + 1 }] }, legacy: legacyInventory, local: localInventory(1) }], piSpec, quirks, { log });
  out('§M3_PI_NEGATIVE_CONTROL', pineg[0].verdict === 'SQLITE-GAP' && ['lines', 'stock_delta', 'postings'].every(k => pineg[0].gaps.some(g => g.key === k)), `+1 counted on the SQLite side ⇒ verdict=${pineg[0].verdict} gaps=${pineg[0].gaps.map(g => g.key).join(',')}`);
  // §42 F7 rule branches the corpus cannot reach (S8b/S8d stop at the price rule first, like legacy): no period, before history, inside window, standard control
  { const P = (dt, data) => E.periodOpen(data || periodData, dt, 'SOO', TODAY);
    const std = { schema: { autoperiodcontrol: 'N' }, periods: periodData.periods };
    const inPer = periodData.periods.find(x => String(x.startdate).slice(0, 10) <= TODAY && TODAY <= String(x.enddate).slice(0, 10));
    const r = { noPeriod: P('2000-06-01').ok, beforeHistory: P('1999-01-15').ok, today: P(TODAY).ok, future200: P(new Date(Date.now() + 200 * 864e5).toISOString().slice(0, 10)).ok,
      stdControl: inPer ? P(TODAY, std).ok + '/' + (inPer.control.SOO || 'none') : 'n/a' };
    out('§M3_PERIOD_RULE', r.noPeriod === false && r.beforeHistory === false && r.today === true && r.future200 === false && (!inPer || String(r.stdControl) === String((inPer.control.SOO === 'O')) + '/' + inPer.control.SOO),
      `noPeriod=${r.noPeriod} beforeHistory=${r.beforeHistory} today=${r.today} today+200=${r.future200} standardControl(open?/status)=${r.stdControl}`); }
  // §46.1 second oracle for F12: the captured legacy books inside the shared posting db (invoice 109, EUR document, both schemas) — on a patched scratch copy the fold must equal them
  { const f2 = path.join(os.tmpdir(), 'm3-gb109-' + process.pid + '.db'); fs.copyFileSync(path.join(__dirname, '..', '..', 'build', 'erp', 'glassbowl_data.db'), f2);
    const g2 = new Database(f2); require('./dict_diff').applyPatch(g2, GB_PATCH);
    const res = [101, 200000].map(sc2 => { const d = DP.derivePostings(g2, { table: 'C_Invoice', id: 109 }, sc2);
      const fa = g2.prepare('SELECT account_id, SUM(amtacctdr) amtacctdr, SUM(amtacctcr) amtacctcr FROM fact_acct WHERE ad_table_id=318 AND record_id=109 AND c_acctschema_id=? GROUP BY account_id').all(sc2);
      return { sc2, mine: fmtPostings(d.lines), oracle: fmtPostings(fa), absent: d.absent.length }; });
    out('§M3_F12_ORACLE2', res.every(r => r.mine === r.oracle && !r.absent && r.oracle !== 'none'), res.map(r => `schema ${r.sc2}: fold=${r.mine} captured=${r.oracle}`).join(' ; '));
    g2.close(); fs.unlinkSync(f2); }
  // §57.1 second oracle for F16: every payment + allocation whose legacy books are captured in the shared posting db (both schemas) — 0 DIFF allowed; ABSENT only by name
  { const f3 = path.join(os.tmpdir(), 'm3-gbpay-' + process.pid + '.db'); fs.copyFileSync(path.join(__dirname, '..', '..', 'build', 'erp', 'glassbowl_data.db'), f3);
    const g3 = new Database(f3); require('./dict_diff').applyPatch(g3, GB_PATCH); const t = { MATCH: 0, ABSENT: 0, DIFF: 0 }, notes = [];
    for (const [tb, tid] of [['C_Payment', 335], ['C_AllocationHdr', 735]]) for (const sc2 of [SCHEMA, SCHEMA2]) for (const id of g3.prepare('SELECT DISTINCT record_id r FROM fact_acct WHERE ad_table_id=? AND c_acctschema_id=?').all(tid, sc2).map(r => r.r)) {
      const d = DP.derivePostings(g3, { table: tb, id }, sc2), o = fmtPostings(g3.prepare('SELECT account_id, SUM(amtacctdr) amtacctdr, SUM(amtacctcr) amtacctcr FROM fact_acct WHERE ad_table_id=? AND record_id=? AND c_acctschema_id=? GROUP BY account_id').all(tid, id, sc2));
      const v = d.absent && d.absent.length ? 'ABSENT' : fmtPostings(d.lines) === o ? 'MATCH' : 'DIFF'; t[v]++; if (v !== 'MATCH') notes.push(`${tb}#${id}@${sc2}:${v}${d.absent.length ? '(' + d.absent[0].slice(0, 60) + ')' : ''}`); }
    out('§M3_F16_ORACLE2', t.DIFF === 0 && t.MATCH >= 7, `captured legacy books: MATCH=${t.MATCH} ABSENT=${t.ABSENT} DIFF=${t.DIFF} ${notes.join(' ')}`);
    g3.close(); fs.unlinkSync(f3); }
  // §65.4 F27 second oracle: legacy's captured books of EVERY AR and AP invoice in the shared posting db, both schemas (per-fact-line conversion) — 0 DIFF allowed, a type with none captured is printed as such
  { const f4 = path.join(os.tmpdir(), 'm3-gbinv-' + process.pid + '.db'); fs.copyFileSync(path.join(__dirname, '..', '..', 'build', 'erp', 'glassbowl_data.db'), f4);
    const g4 = new Database(f4); require('./dict_diff').applyPatch(g4, GB_PATCH);
    if (!g4.prepare("SELECT 1 FROM pragma_table_info('m_product') WHERE name='producttype'").get()) g4.exec('ALTER TABLE m_product ADD COLUMN producttype');
    for (const r of seed.prepare('SELECT M_Product_ID id, ProductType t FROM m_product WHERE ad_client_id=11').all()) g4.prepare('UPDATE m_product SET producttype=? WHERE m_product_id=?').run(r.t, r.id);   // the SQLite seed's product types (the §59 state sync does the same)
    const t = {}, notes = [];
    for (const dbt of ['ARI', 'API', 'ARC', 'APC']) { t[dbt] = { MATCH: 0, ABSENT: 0, DIFF: 0 };
      for (const sc2 of [SCHEMA, SCHEMA2]) for (const id of g4.prepare("SELECT DISTINCT f.record_id r FROM fact_acct f JOIN c_invoice i ON i.c_invoice_id=f.record_id JOIN c_doctype d ON d.c_doctype_id=i.c_doctype_id WHERE f.ad_table_id=318 AND d.docbasetype=? AND f.c_acctschema_id=?").all(dbt, sc2).map(r => r.r)) {
        const d = DP.derivePostings(g4, { table: 'C_Invoice', id }, sc2), o = fmtPostings(g4.prepare('SELECT account_id, SUM(amtacctdr) amtacctdr, SUM(amtacctcr) amtacctcr FROM fact_acct WHERE ad_table_id=318 AND record_id=? AND c_acctschema_id=? GROUP BY account_id').all(id, sc2));
        const v = d.absent && d.absent.length ? 'ABSENT' : fmtPostings(d.lines) === o ? 'MATCH' : 'DIFF'; t[dbt][v]++; if (v !== 'MATCH') notes.push(`${dbt}#${id}@${sc2}:${v}`); } }
    const dif = Object.values(t).reduce((a, x) => a + x.DIFF, 0), m = t.ARI.MATCH + t.API.MATCH;
    out('§M3_F27_ORACLE2', dif === 0 && t.ARI.MATCH > 0 && t.API.MATCH > 0, `captured invoice books ${Object.entries(t).map(([k, x]) => `${k}:MATCH=${x.MATCH}/ABSENT=${x.ABSENT}/DIFF=${x.DIFF}${x.MATCH + x.ABSENT + x.DIFF ? '' : '(none captured)'}`).join(' ')} ${notes.join(' ')}`);
    g4.close(); fs.unlinkSync(f4); }
  // §68 (F32) posting-mode oracle on the CAPTURED GardenWorld books: cash allocation(s) in the shared posting db were posted by the accounting processor (committed journal).
  // Q (any shape) and I with a committed journal ⇒ fold == captured; I + same-transaction ⇒ the fold MUST differ (suspense / realized loss) — the rule is keyed on the mirrored setting.
  { const f5 = path.join(os.tmpdir(), 'm3-gbmode-' + process.pid + '.db'); fs.copyFileSync(path.join(__dirname, '..', '..', 'build', 'erp', 'glassbowl_data.db'), f5);
    const g5 = new Database(f5); require('./dict_diff').applyPatch(g5, GB_PATCH);
    const sp = require('./dict_spec.json').find(x => x.table === 'ad_sysconfig' && x.db === 'glassbowl'), DD = require('./dict_diff'), L = await DD.discover(cfg, sp), r0 = DD.compare(L, g5, sp);
    DD.applyPatch(g5, DD.toSchemaPatch(r0, sp) + DD.toPatch(r0, sp));
    const ids = g5.prepare('SELECT DISTINCT al.c_allocationhdr_id h FROM c_allocationline al JOIN fact_acct f ON f.ad_table_id=735 AND f.record_id=al.c_allocationhdr_id WHERE CAST(COALESCE(NULLIF(al.c_cashline_id, \'\'), 0) AS INTEGER) > 0').all().map(r => r.h);
    const res = [];
    for (const [mode, same, expect] of [['Q', true, 'MATCH'], ['I', false, 'MATCH'], ['I', true, 'DIFF']]) {
      g5.prepare("UPDATE ad_sysconfig SET value=? WHERE name='CLIENT_ACCOUNTING'").run(mode);
      for (const id of ids) for (const sc2 of [SCHEMA, SCHEMA2]) {
        const d = DP.derivePostings(g5, { table: 'C_AllocationHdr', id, cashJournalSameTrx: same }, sc2), o = fmtPostings(g5.prepare('SELECT account_id, SUM(amtacctdr) amtacctdr, SUM(amtacctcr) amtacctcr FROM fact_acct WHERE ad_table_id=735 AND record_id=? AND c_acctschema_id=? GROUP BY account_id').all(id, sc2));
        const got = d.absent.length ? 'ABSENT' : fmtPostings(d.lines) === o ? 'MATCH' : 'DIFF'; res.push({ mode, same, id, sc2, got, expect, fold: fmtPostings(d.lines), o }); } }
    const ok = ids.length > 0 && res.every(x => x.got === x.expect);
    out('§CASH_MODE_ORACLE', ids.length ? ok : 'INCONCLUSIVE', `captured cash allocations=${ids.join(',') || 'none'}; ` + res.map(x => `${x.mode}/${x.same ? 'sameTrx' : 'committed'} #${x.id}@${x.sc2}:${x.got}(want ${x.expect})${x.got === 'DIFF' ? ' fold=' + x.fold + ' captured=' + x.o : ''}`).join(' ; '));
    g5.close(); fs.unlinkSync(f5); }
  // quirk without evidence is refused
  let refused = false; try { R.classify('x', [{ key: 'k' }], [{ scenario: 'x', key: 'k' }]); } catch (e) { refused = true; }
  out('§M3_QUIRK_NEEDS_EVIDENCE', refused, 'a quirk entry with no evidence is refused');

  const gaps = rows.flatMap(r => r.gaps).filter(g => g.verdict === 'SQLITE-GAP');
  const incKeys = rows.flatMap(r => r.inconclusive.map(i => r.id + '/' + i.key));
  if (incKeys.length) incon++;
  log(`§M3_INCONCLUSIVE_KEYS ${incKeys.join(',') || 'none'}`);
  log(`§M3_FINDINGS sqlite_gaps=${gaps.length} (${[...new Set(rows.filter(r => r.verdict === 'SQLITE-GAP').map(r => r.id))].join(',') || 'none'}) — these are the parallel-run product, not harness failures`);
  log(`§M3_VERDICT HARNESS-${fails ? 'FAIL' : incon ? 'PASS-with-INCONCLUSIVE' : 'PASS'} fails=${fails} inconclusive=${incon} findings=${gaps.length} inconclusive_keys=${incKeys.length}`);
  process.exit(fails ? 1 : 0);
})().catch(e => { log('§M3_VERDICT HARNESS-FAIL exception ' + e.stack); process.exit(2); });
