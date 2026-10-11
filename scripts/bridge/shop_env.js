// ⚠ DO NOT REMOVE -- SHOP ENV (prompts/SQLiteIDEMPIERE.md §SHOPDAY-RUN-1 Stage 2): builds the context object X that the existing chained cycles
// (cycle_o2c.js, cycle_p2p.js) were written against (witness_m3_gap.js built it from the GardenWorld seed/glassbowl dbs) from the SHOP TWIN db instead.
// Nothing here is new engine logic: the closures are the same ones m3 defines (priceOfAt, taxOfFor, periodCheck, acctSetupOf, creditOf, ...), reading the
// new client's tables (full legacy width, ids equal to legacy's). Legacy-side helpers (legacyFactsOf, legacyCostQty, locStock) are the m3 ones, WS reads only.
'use strict';
const path = require('path');
const Database = require('better-sqlite3');
const T = require('./client_template');
const { query, call } = require('./ad_client');
const { createLink } = require('./legacy_link');
const E = require('../erp_engine'), POS = require('../../build/erp/pos_core.js'), DP = require('../doc_poster');
const lc = r => { if (!r) return r; const o = {}; for (const k in r) o[k.toLowerCase()] = r[k]; return o; };
const cents = v => Math.round(Number(v) * 100);

// system-owned tables the posting fold reads (client 0 rows): currencies, conversion types ... (EXTRACT from legacy, small)
function loadSystemTables(tw, names) {
  for (const t of names) {
    const rows = JSON.parse(T.pg(`select coalesce(json_agg(t),'[]'::json) from (select * from ${t} where ad_client_id=0) t`).join(''));
    tw.ensure(t); if (!rows.length) continue;
    const cols = Object.keys(rows[0]).map(c => c.toLowerCase());
    const ins = tw.db.prepare(`INSERT INTO ${t}(${cols.join(',')}) VALUES (${cols.map(() => '?').join(',')})`);
    tw.db.exec('BEGIN'); for (const r of rows) ins.run(Object.values(r).map(v => v === null || typeof v === 'number' || typeof v === 'string' ? v : String(v))); tw.db.exec('COMMIT');
  }
}
const DOC_TABLES = ['c_order', 'c_orderline', 'c_ordertax', 'c_invoice', 'c_invoiceline', 'c_invoicetax', 'm_inout', 'm_inoutline', 'c_payment', 'c_allocationhdr', 'c_allocationline', 'm_matchpo', 'm_matchinv',
  'm_inventory', 'm_inventoryline', 'm_storage', 'm_costhistory', 'm_costdetail', 'c_charge_acct', 'c_cash', 'c_cashline', 'm_movement', 'm_movementline', 'fact_acct', 'c_conversion_rate', 'c_project', 'c_project_acct', 'c_projectissue'];

function buildX({ tw, cfg, ids, C, log, TODAY }) {
  const db = tw.db;
  { const orig = db.prepare.bind(db); db.prepare = sql => {   // the cycles materialise rows with harness-only columns (m3's gb tables carry them): add a missing column on demand, never a table
    for (let i = 0; i < 12; i++) { try { return orig(sql); } catch (e) { const m = /table (\w+) has no column named (\w+)/.exec(e.message); if (!m || !/^\s*INSERT/i.test(sql)) throw e; db.exec(`ALTER TABLE ${m[1]} ADD COLUMN ${m[2]}`); } }
    throw new Error('too many missing columns'); }; }
  loadSystemTables(tw, ['c_currency', 'c_conversiontype']);
  for (const t of DOC_TABLES) tw.ensure(t);
  const schemaRow = db.prepare("SELECT * FROM c_acctschema WHERE ad_client_id=? AND isactive='Y' ORDER BY c_acctschema_id").get(tw.client);
  const SCHEMA = schemaRow.c_acctschema_id, SCHEMA2 = SCHEMA;   // MSetup creates ONE schema: the "euro" keys compare the same schema twice (no second schema exists)
  const pos = { c_pos_id: 100, ad_client_id: tw.client, m_pricelist_id: C.pl.sales, m_warehouse_id: C.wh, c_doctype_id: C.dt.pos, c_bpartnercashtrx_id: C.prod ? C.customerStd : null, c_poskeylayout_id: null };   // synthesized terminal: only these fields are read (pos_core)
  const plv = lc(db.prepare('SELECT m_pricelist_version_id v FROM m_pricelist_version WHERE m_pricelist_id=?').get(C.pl.sales));
  const priceRowsStmt = db.prepare("SELECT v.validfrom, pp.pricestd, pp.pricelist, pp.pricelimit FROM m_productprice pp JOIN m_pricelist_version v ON v.m_pricelist_version_id=pp.m_pricelist_version_id WHERE v.m_pricelist_id=? AND pp.m_product_id=? AND v.isactive='Y' AND pp.isactive='Y'");
  const priceOfAt = (pid, date) => { const r = E.priceAt(priceRowsStmt.all(C.pl.sales, pid).map(lc), date || TODAY); return r ? { pricestd: r.pricestd } : null; };
  const PL_CURRENCY = (lc(db.prepare('SELECT c_currency_id FROM m_pricelist WHERE m_pricelist_id=?').get(C.pl.sales)) || {}).c_currency_id;
  const TAX_INCLUDED = (lc(db.prepare('SELECT istaxincluded FROM m_pricelist WHERE m_pricelist_id=?').get(C.pl.sales)) || {}).istaxincluded === 'Y';
  const periodData = (() => {
    const ci = lc(db.prepare('SELECT c_acctschema1_id s, c_calendar_id c FROM ad_clientinfo WHERE ad_client_id=?').get(tw.client));
    const schema = lc(db.prepare('SELECT autoperiodcontrol, period_openhistory, period_openfuture FROM c_acctschema WHERE c_acctschema_id=?').get(ci.s));
    const periods = db.prepare('SELECT p.c_period_id, p.startdate, p.enddate, p.isactive, p.periodtype FROM c_period p JOIN c_year y ON y.c_year_id=p.c_year_id WHERE y.c_calendar_id=?').all(ci.c).map(lc);
    const ctl = db.prepare('SELECT docbasetype, periodstatus FROM c_periodcontrol WHERE c_period_id=?');
    periods.forEach(p => { p.control = Object.fromEntries(ctl.all(p.c_period_id).map(lc).map(r => [r.docbasetype, r.periodstatus])); });
    return { schema, periods };
  })();
  const periodCheck = (date, dbt) => E.periodOpen(periodData, date, dbt, TODAY);   // NB: reads the CURRENT control rows each call below (rebuilt lazily)
  const periodCheckLive = (date, dbt) => { const d = { schema: periodData.schema, periods: periodData.periods.map(p => ({ ...p, control: Object.fromEntries(db.prepare('SELECT docbasetype, periodstatus FROM c_periodcontrol WHERE c_period_id=?').all(p.c_period_id).map(lc).map(r => [r.docbasetype, r.periodstatus])) })) }; return E.periodOpen(d, date, dbt, TODAY); };
  const taxRows = db.prepare('SELECT * FROM c_tax WHERE ad_client_id=?').all(tw.client).map(lc);
  const taxById = id => taxRows.find(t => Number(t.c_tax_id) === Number(id));
  const taxChildren = id => taxRows.filter(t => Number(t.parent_tax_id) === Number(id) && t.isactive === 'Y');
  const locOf = id => lc(db.prepare('SELECT c_country_id, c_region_id, postal FROM c_location WHERE c_location_id=?').get(id));
  const DVR_DEFAULT = (require('./shop_twin').DICT.prepare("SELECT c.defaultvalue d FROM ad_column c JOIN ad_table t ON t.ad_table_id=c.ad_table_id WHERE t.tablename='C_Order' AND c.columnname='DeliveryViaRule'").get() || {}).d;
  const LOC = { [C.customer]: C.customerLoc, [C.customer2]: C.customer2Loc, [C.vendor]: C.vendorLoc };
  function taxOfFor(f) {
    const bp = f.bp || C.customer, org = f.org || C.org, wh = f.wh || C.wh;
    const b = lc(db.prepare('SELECT istaxexempt, deliveryviarule FROM c_bpartner WHERE c_bpartner_id=?').get(bp)) || {};
    const dvr = f.invoice ? null : (f.deliveryVia || b.deliveryviarule || DVR_DEFAULT);
    const orgLoc = locOf((lc(db.prepare('SELECT c_location_id FROM ad_orginfo WHERE ad_org_id=?').get(org)) || {}).c_location_id);
    const whLoc = locOf((lc(db.prepare('SELECT c_location_id FROM m_warehouse WHERE m_warehouse_id=?').get(wh)) || {}).c_location_id);
    const bpLoc = locOf((lc(db.prepare('SELECT c_location_id FROM c_bpartner_location WHERE c_bpartner_location_id=?').get(LOC[bp])) || {}).c_location_id);
    return pid => E.taxLookup({ taxes: taxRows, taxCategoryId: (lc(db.prepare('SELECT c_taxcategory_id FROM m_product WHERE m_product_id=?').get(pid)) || {}).c_taxcategory_id,
      isSOTrx: true, billDate: f.date || TODAY, billFrom: orgLoc, billTo: bpLoc, warehouse: whLoc, deliveryViaRule: dvr, bpTaxExempt: b.istaxexempt });
  }
  const dtOf = id => lc(db.prepare('SELECT * FROM c_doctype WHERE c_doctype_id=?').get(id));
  const sys = new Database(path.join(__dirname, '..', '..', 'build', 'erp', 'ad_full.db'), { readonly: true }).prepare('SELECT value FROM ad_sysconfig WHERE name=? AND ad_client_id=0');
  const creditOf = bpId => ({ bp: lc(db.prepare('SELECT socreditstatus, so_creditlimit, totalopenbalance FROM c_bpartner WHERE c_bpartner_id=?').get(bpId)),
    sys: Object.fromEntries(['CHECK_CREDIT_ON_CASH_POS_ORDER', 'CHECK_CREDIT_ON_PREPAY_ORDER'].map(k => [k, (sys.get(k) || {}).value])) });
  const acctSetupOf = pid => {
    const act = db.prepare("SELECT c_acctschema_id id FROM c_acctschema WHERE isactive='Y' AND ad_client_id=?").all(tw.client).map(r => r.id);
    const p = db.prepare('SELECT m_product_category_id c FROM m_product WHERE m_product_id=?').get(pid); if (!p) return [];
    return E.acctSetupGap(p.c, act, db.prepare('SELECT m_product_category_id, c_acctschema_id FROM m_product_category_acct WHERE m_product_category_id=?').all(p.c));
  };
  const fmtAcct = new Map(db.prepare('SELECT c_validcombination_id id, account_id a FROM c_validcombination').all().map(r => [r.id, r.a]));
  const fmtPostings = lines => lines.map(l => ({ a: l.account_id, dr: cents(l.amtacctdr), cr: cents(l.amtacctcr) })).filter(x => x.dr || x.cr).sort((x, y) => x.a - y.a).map(x => `${x.a}:DR${x.dr}/CR${x.cr}`).join('|') || 'none';
  // ---- legacy side (WS reads) ----
  async function legacyFactsOf(table, id, schema) {
    let fa = []; for (let i = 0; i < 6 && !fa.length; i++) { fa = await query(cfg, 'QueryFactAcct', `AD_Table_ID=${table} AND Record_ID=${id} AND C_AcctSchema_ID=${schema}`); if (!fa.length) await new Promise(r => setTimeout(r, 1500)); }
    const by = {}; for (const f of fa) { const a = f.Account_ID; by[a] = by[a] || { account_id: a, amtacctdr: 0, amtacctcr: 0 }; by[a].amtacctdr += Number(f.AmtAcctDr); by[a].amtacctcr += Number(f.AmtAcctCr); }
    if (fa.length) return fmtPostings(Object.values(by));
    const tq = { 318: ['QueryCInvoice', 'C_Invoice_ID'], 319: ['QueryMInOut', 'M_InOut_ID'], 259: ['QueryCOrder', 'C_Order_ID'], 472: ['QueryMMatchInv', 'M_MatchInv_ID'], 473: ['QueryMMatchPO', 'M_MatchPO_ID'], 335: ['QueryCPayment', 'C_Payment_ID'], 735: ['QueryCAllocationHdr', 'C_AllocationHdr_ID'], 321: ['QueryMInventory', 'M_Inventory_ID'], 323: ['QueryMMovement', 'M_Movement_ID'], 407: ['QueryCCash', 'C_Cash_ID'] }[table];
    const posted = tq ? ((await query(cfg, tq[0], `${tq[1]}=${id}`))[0] || {}).Posted : null;
    return posted === 'Y' || posted === true ? 'none' : 'NO_FACT_ACCT_ROWS';
  }
  const AVG_EL = C.costElement.avgPO;
  const legacyCostQty = async p => { const r = await query(cfg, 'QueryMCost', `M_Product_ID=${p} AND C_AcctSchema_ID=${SCHEMA} AND M_CostElement_ID=${AVG_EL} AND AD_Org_ID=0 AND M_AttributeSetInstance_ID=0`); return r.length ? Number(r[0].CurrentQty) : 0; };
  const localCostQty = p => { const r = db.prepare('SELECT currentqty q FROM m_cost WHERE m_product_id=? AND c_acctschema_id=? AND m_costelement_id=?').get(p, SCHEMA, AVG_EL); return r ? Number(r.q || 0) : 0; };
  const locStock = async (p, loc) => (await query(cfg, 'QueryStorage', `M_Product_ID=${p} AND M_Locator_ID=${loc}`)).reduce((a, r) => a + Number(r.QtyOnHand), 0);
  function applyCostQty(ioId) { const h = db.prepare('SELECT dateacct FROM m_inout WHERE m_inout_id=?').get(ioId), date = (h && h.dateacct) || TODAY; for (const u of DP.costQtyUpdates(db, ioId)) DP.applyCostUpdate(db, u, date); }
  return { cfg, query, call, createLink, gb: db, seed: db, E, POS, DP, SCHEMA, SCHEMA2, TODAY, cents, lc, fmtPostings, legacyFactsOf, legacyCostQty, localCostQty, locStock, applyCostQty,
    pos, priceOfAt, taxOfFor, taxById, taxChildren, taxRows, TAX_INCLUDED, dtOf, creditOf, periodCheck: periodCheckLive, acctSetupOf, PL_CURRENCY, log, AVG_EL };
}
module.exports = { buildX, loadSystemTables };
