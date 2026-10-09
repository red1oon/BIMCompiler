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
const TODAY = new Date().toISOString().slice(0, 10);
const PL_CURRENCY = (lc(seed.prepare('SELECT c_currency_id FROM m_pricelist WHERE m_pricelist_id=?').get(pos.m_pricelist_id)) || {}).c_currency_id;
// §46: currency precision table from the SQLite seed (the production posting db is the bundle that carries it; the scratch posting db lacks the table)
const GB_PATCH = fs.readFileSync(path.join(__dirname, '..', '..', 'build', 'erp', 'patches', 'glassbowl_data.db.sql'), 'utf8');
gb.exec(GB_PATCH); gb.exec(GB_PATCH);   // patch + loader in miniature: applied twice (idempotent by construction)
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
  const dvr = f.deliveryVia || b.deliveryviarule || DVR_DEFAULT;
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
    const r = gb.prepare('UPDATE m_cost SET currentqty=COALESCE(currentqty,0)+? WHERE m_product_id=? AND c_acctschema_id=? AND m_costtype_id=? AND m_costelement_id=?').run(u.delta, u.m_product_id, u.c_acctschema_id, u.m_costtype_id, u.m_costelement_id);
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
  const tq = table === 318 ? ['QueryCInvoice', 'C_Invoice_ID'] : table === 319 ? ['QueryMInOut', 'M_InOut_ID'] : null;
  const posted = tq ? ((await query(cfg, tq[0], `${tq[1]}=${id}`))[0] || {}).Posted : null;
  return posted === 'Y' ? 'none' : 'NO_FACT_ACCT_ROWS';   // §47: posted without lines = no books
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
  'post_inv_orig', 'post_inv_rev', 'post_ship_orig', 'post_ship_rev'], notCompared: { order_description: 'header description text: legacy order header read type not yet compared for text keys' } };
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
  const before = {}; for (const l of f.lines) if (!(l.product in before)) before[l.product] = await stockOf(l.product);
  const s = await store.open(); const uid = 'm3v-' + (++uidN);
  s.enqueue(uid, 'doc', { lines: f.lines.map(l => ({ product: l.product, qty: l.qty })) });
  await drain(cfg, s, { doc: descFor(f) }, { log: () => {} });
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
  const stock = {}; for (const p of Object.keys(before)) { const d = (await stockOf(p)) - before[p]; if (d) stock[p] = d; }
  const orig = (arr, k) => arr.find(x => !x.Reversal_ID || x[k] < x.Reversal_ID), revd = (arr, k) => arr.find(x => x.Reversal_ID && x[k] > x.Reversal_ID);
  const oi = orig(inv, 'C_Invoice_ID'), ri = revd(inv, 'C_Invoice_ID'), os = orig(io, 'M_InOut_ID'), rs = revd(io, 'M_InOut_ID');
  return { outcome: 'COMPLETED', docstatus: h.DocStatus, line_qty: sortStr(ls.map(l => Number(l.QtyOrdered))), line_desc: ls.map(l => l.Description).join('|'),
    total_cents: cents(h.TotalLines), shipments: sortStr(io.map(x => x.DocStatus)), ship_qtys: sortStr(shipQ), invoices: sortStr(inv.map(x => x.DocStatus)),
    invoice_totals: sortStr(inv.map(x => cents(x.GrandTotal))), stock_delta: JSON.stringify(stock),
    post_inv_orig: oi ? await legacyFacts(318, oi.C_Invoice_ID, true) : 'none', post_inv_rev: ri ? await legacyFacts(318, ri.C_Invoice_ID, true) : 'none',
    post_ship_orig: os ? await legacyFacts(319, os.M_InOut_ID, true) : 'none', post_ship_rev: rs ? await legacyFacts(319, rs.M_InOut_ID, true) : 'none', _order: id };
}
const adFull = new Database(path.join(__dirname, '..', '..', 'build', 'erp', 'ad_full.db'), { readonly: true });
const VOIDED_MSG = adFull.prepare("SELECT msgtext FROM ad_message WHERE value='Voided'").get().msgtext;   // dictionary text, never hard-coded
const FSM = require('../../build/erp/ad_docfsm.js');
function localVoid(mut = 0) {
  return async f => {
    const dt = dtOf(f.doctype);
    const ctx = { pos: { ...pos, m_warehouse_id: 103, c_doctype_id: f.doctype }, priceOf: pid => lc(priceStmt.get(plv.v, pid)) || null, bomOf: () => [],
      wrPolicy: { isautogenerateinout: 'Y', isautogenerateinvoice: 'Y' } };
    const cart = f.lines.map(l => POS.ringLine(ctx, l.product, l.qty)); if (cart.some(l => !l.ok)) return { outcome: 'REJECTED' };
    const o = ++seq * 10, opts = { orderId: o, inoutId: o + 1, invoiceId: o + 2, c_bpartner_id: f.bp || BP, warehouseId: 103 };
    const g = POS.buildSaleGroup(ctx, cart, opts); if (!g.ok) return { outcome: 'REJECTED', reason: g.reason };
    const d = FSM.dispatchOrder(seed, { docStatus: 'CO', isSOTrx: 'Y', doctypeId: f.doctype, processing: 'N' }, f.action);
    if (!d.ok) return { outcome: 'REJECTED', reason: d.reason };
    const lineOf = l => ({ c_orderline_id: l.c_orderline_id, m_product_id: l.m_product_id, qtyordered: l.qtyordered, linenetamt: l.linenetamt });
    const sl = g.soLines.map(lineOf);
    const sale = { order: { c_order_id: o, description: null }, lines: sl.map(l => ({ ...l, description: null })),
      shipments: [{ m_inout_id: opts.inoutId, docstatus: 'CO', movementtype: 'C-', lines: sl.map((l, i) => ({ m_inoutline_id: opts.inoutId * 100 + i, m_product_id: l.m_product_id, movementqty: l.qtyordered, c_orderline_id: l.c_orderline_id })) }],
      invoices: [{ c_invoice_id: opts.invoiceId, docstatus: 'CO', grandtotal: sl.reduce((a, l) => a + cents(l.linenetamt), 0) / 100,
        lines: sl.map((l, i) => ({ c_invoiceline_id: opts.invoiceId * 100 + i, m_product_id: l.m_product_id, qtyinvoiced: l.qtyordered, linenetamt: l.linenetamt, c_orderline_id: l.c_orderline_id })) }] };
    let nid = o + 5; const ops = E.voidOrder(sale, { voidedMsg: VOIDED_MSG, newId: () => ++nid });
    // fold the op stream into final document state (statuses, lines) — the same state a kernel apply would leave
    const status = { ['C_Order:' + o]: 'CO', ['M_InOut:' + opts.inoutId]: 'CO', ['C_Invoice:' + opts.invoiceId]: 'CO' }, docs = { M_InOut: [opts.inoutId], C_Invoice: [opts.invoiceId] };
    const ioLines = { [opts.inoutId]: sale.shipments[0].lines }, ivLines = { [opts.invoiceId]: sale.invoices[0].lines }, ivTot = { [opts.invoiceId]: sale.invoices[0].grandtotal }, revOf = {};
    const oLines = {}; sl.forEach(l => { oLines[l.c_orderline_id] = { qty: l.qtyordered, desc: null }; }); let total = sl.reduce((a, l) => a + cents(l.linenetamt), 0);
    for (const op of ops) {
      if (op.op_type === 'SET_STATUS') status[op.table + ':' + op.id] = op.doc_status;
      else if (op.op_type === 'CREATE_DOCUMENT') { const id = op.m_inout_id || op.c_invoice_id; docs[op.table].push(id); revOf[op.table + ':' + id] = op.reversal_id; if (op.table === 'C_Invoice') ivTot[id] = op.grandtotal; }
      else if (op.op_type === 'CREATE_LINE' && op.table === 'M_InOutLine') (ioLines[op.m_inout_id] = ioLines[op.m_inout_id] || []).push(op);
      else if (op.op_type === 'CREATE_LINE' && op.table === 'C_InvoiceLine') (ivLines[op.c_invoice_id] = ivLines[op.c_invoice_id] || []).push(op);
      else if (op.op_type === 'UPDATE_LINE' && op.table === 'C_OrderLine') oLines[op.id] = { qty: op.qtyordered, desc: op.description };
      else if (op.op_type === 'UPDATE_FIELD' && op.table === 'C_Order' && op.field === 'totallines') total = cents(op.value);
    }
    // materialise every document into the scratch posting db and fold with the PRODUCT's derivePostings (orig + reversal)
    const post = {};
    for (const id of docs.C_Invoice) {
      gb.prepare('INSERT INTO c_invoice(c_invoice_id,c_bpartner_id,grandtotal,issotrx) VALUES(?,?,?,?)').run(id, f.bp || BP, (cents(ivTot[id]) + (revOf['C_Invoice:' + id] ? 0 : mut)) / 100, 'Y');
      ivLines[id].forEach((l, i) => gb.prepare('INSERT INTO c_invoiceline(c_invoiceline_id,c_invoice_id,m_product_id,linenetamt) VALUES(?,?,?,?)').run(id * 100 + i, id, l.m_product_id, l.linenetamt));
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
    return { outcome: 'COMPLETED', docstatus: status['C_Order:' + o], line_qty: sortStr(Object.values(oLines).map(x => Number(x.qty))), line_desc: Object.values(oLines).map(x => x.desc).join('|'),
      total_cents: total, shipments: sortStr(docs.M_InOut.map(id => status['M_InOut:' + id])), ship_qtys: sortStr(docs.M_InOut.map(id => ioLines[id].reduce((a, l) => a + Number(l.movementqty), 0))),
      invoices: sortStr(docs.C_Invoice.map(id => status['C_Invoice:' + id])), invoice_totals: sortStr(docs.C_Invoice.map(id => cents(ivTot[id]))), stock_delta: JSON.stringify(stock),
      post_inv_orig: post['inv:orig'] || 'none', post_inv_rev: post['inv:rev'] || 'none', post_ship_orig: post['ship:orig'] || 'none', post_ship_rev: post['ship:rev'] || 'none' };
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
  sc('S11-pos-sale-costed-product', { doctype: POSDT, lines: [{ product: 136, qty: 1 }] }),
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
  if (process.env.M3_ONLY) { for (const r of rows) log(`§SCN_DETAIL ${r.id} legacy=${JSON.stringify({ ...r.legacy, _order: undefined })} sqlite=${JSON.stringify(r.sqlite)}`); log('§M3_VERDICT ONLY ' + process.env.M3_ONLY); process.exit(0); }
  // S12 void (spec §33): product 136 (costed, reversal is cost-neutral), BP 112
  const vrows = await R.run([{ id: 'S12-void-pos-sale', facts: { doctype: POSDT, action: 'VO', lines: [{ product: 136, qty: 1 }] }, legacy: legacyVoid, local: localVoid(0) }], voidSpec, quirks, { log });
  rows.push(...vrows);
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
  const vneg = await R.run([{ id: 'NEG-void-control', facts: { doctype: POSDT, action: 'VO', lines: [{ product: 136, qty: 1 }] }, legacy: legacyVoid, local: localVoid(1) }], voidSpec, quirks, { log });
  out('§M3_VOID_NEGATIVE_CONTROL', vneg[0].verdict === 'SQLITE-GAP' && vneg[0].gaps.some(g => g.key === 'post_inv_orig'), `+1 cent on the SQLite invoice ⇒ verdict=${vneg[0].verdict} (must be SQLITE-GAP on post_inv_orig)`);
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
    const g2 = new Database(f2); g2.exec(GB_PATCH);
    const res = [101, 200000].map(sc2 => { const d = DP.derivePostings(g2, { table: 'C_Invoice', id: 109 }, sc2);
      const fa = g2.prepare('SELECT account_id, SUM(amtacctdr) amtacctdr, SUM(amtacctcr) amtacctcr FROM fact_acct WHERE ad_table_id=318 AND record_id=109 AND c_acctschema_id=? GROUP BY account_id').all(sc2);
      return { sc2, mine: fmtPostings(d.lines), oracle: fmtPostings(fa), absent: d.absent.length }; });
    out('§M3_F12_ORACLE2', res.every(r => r.mine === r.oracle && !r.absent && r.oracle !== 'none'), res.map(r => `schema ${r.sc2}: fold=${r.mine} captured=${r.oracle}`).join(' ; '));
    g2.close(); fs.unlinkSync(f2); }
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
