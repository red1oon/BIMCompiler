// ⚠ DO NOT REMOVE — scope: W-CP-SUPPORT-ORACLE (prompts/ERP_IDEMPIERE_UX_PARITY.md §CP). Proves the callout SUPPORT ports
// (bim-ootb erp/callouts/{sqlfn,pricing,tax,uom,currency}.js) against REAL iDempiere on the pilot server (DB idempiere_pilot,
// never idempiere; the oracle bundle on 127.0.0.1:8097 — read-only SELECTs + headless GridTab callouts, nothing saved):
//   A. every ported PL/pgSQL function: the SAME SELECT on PostgreSQL (op:sql) and on our sql.js+UDFs over erp/ad_seed.db.
//   B. MProductPricing / Tax / MUOMConversion / MConversionRate: a real callout on the real GridTab exposes their result
//      (C_OrderLine.M_Product_ID → PriceList/PriceLimit/PriceActual/C_UOM_ID/C_Currency_ID/Discount/C_Tax_ID; C_UOM_ID →
//      QtyOrdered/PriceEntered; GL_Journal.C_Currency_ID → CurrencyRate) — compared with our port fed the SAME inputs.
//   C. vacuity: one port perturbed → the comparison MUST diff.
// Every input row is checked to exist in BOTH databases; a key missing on one side is INCONCLUSIVE, never PASS.
// usage: node cp_support_oracle.js [--log logs/cp/support.log]   — read the log after every run, exit code is not evidence.
'use strict';
const fs = require('fs'), path = require('path'), http = require('http'), os = require('os');
const OOTB = process.env.CP_OOTB || '/tmp/wt-callouts';
const args = process.argv.slice(2);
const logFile = args.includes('--log') ? args[args.indexOf('--log') + 1] : null;
const out = [];
function L(s) { out.push(s); console.log(s); }
function oracle(req) {
  return new Promise((res, rej) => {
    const body = Buffer.from(JSON.stringify(req));
    const r = http.request({ host: '127.0.0.1', port: 8097, method: 'POST', path: '/', headers: { 'Content-Length': body.length } }, (resp) => {
      let d = ''; resp.on('data', c => d += c); resp.on('end', () => { try { res(JSON.parse(d)); } catch (e) { rej(new Error('oracle bad json ' + d.slice(0, 300))); } });
    });
    r.on('error', rej); r.setTimeout(600000); r.write(body); r.end();
  });
}
async function pg(sql) { const r = await oracle({ op: 'sql', sql }); if (!r.ok) throw new Error('oracle sql: ' + r.error + ' :: ' + sql); return r.rows; }
function norm(v) {
  if (v === null || v === undefined || v === '') return null;
  const s = String(v);
  if (/^-?\d+(\.\d+)?$/.test(s)) { let n = s; if (n.indexOf('.') >= 0) n = n.replace(/0+$/, '').replace(/\.$/, ''); return n === '-0' ? '0' : n; }
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  return s;
}

(async () => {
  const initSqlJs = require(os.homedir() + '/bim-ootb/tests/node_modules/sql.js');
  const SQL = await initSqlJs();
  const db = new SQL.Database(fs.readFileSync(path.join(OOTB, 'erp/ad_seed.db')));
  // the page applies erp/patches/ad_seed.db.sql on EVERY load (idempiere.html §AD-SEED-PATCH, same split + per-statement run) —
  // the witness must judge the DB the page actually runs on, not the raw seed.
  { const pf = path.join(OOTB, 'erp/patches/ad_seed.db.sql'); let ok = 0, fail = 0;
    if (fs.existsSync(pf)) fs.readFileSync(pf, 'utf8').split(/;\s*\n/).forEach(st => { st = st.replace(/^\s*--[^\n]*\n?/gm, '').trim(); if (!st) return; try { db.run(st); ok++; } catch (e) { fail++; } });
    L('§AD-SEED-PATCH (witness) statements=' + ok + ' failed=' + fail); }
  const A = require(path.join(OOTB, 'erp/ad_callout.js'));
  const query = (sql, params) => {
    const st = db.prepare(sql), rows = [];
    try { if (params && params.length) st.bind(params.map(v => v === undefined ? null : v)); const cols = st.getColumnNames();
      while (st.step()) { const v = st.get(), o = {}; cols.forEach((c, i) => { o[String(c).toLowerCase()] = v[i]; }); rows.push(o); } } finally { st.free(); }
    return rows;
  };
  const deps = {};
  A.bind(query, { log: (s) => { if (/UNPORTED-DEP/.test(s)) { deps[s] = (deps[s] || 0) + 1; } else L(s); }, now: () => Date.UTC(2026, 9, 4, 12, 0, 0) });
  ['support', 'currency', 'uom', 'pricing', 'tax', 'sqlfn'].forEach(f => require(path.join(OOTB, 'erp/callouts', f + '.js')));
  const fnNames = A.RUNTIME.registerSqlFunctions((n, fn) => db.create_function(n, fn));
  L('§CP-SUP-ENGINE ootb=' + OOTB + ' udfs=' + fnNames.join(','));
  const M = A.RUNTIME.M, BD = A.BigDecimal, TS = A.Timestamp;
  const tot = { fn: 0, fnMatch: 0, fnDiff: 0, fnSkip: 0, co: 0, coMatch: 0, coDiff: 0, coSkip: 0 };

  // ── A. SQL functions ──────────────────────────────────────────────────────────────────────────────────────
  async function cmpSql(label, exprPg, exprOurs) {
    tot.fn++;
    let a, b;
    try { a = (await pg('SELECT ' + exprPg + ' AS v'))[0].v; } catch (e) { tot.fnSkip++; L('§CP-SUP-FN ' + label + ' INCONCLUSIVE pg-error ' + e.message.slice(0, 160)); return; }
    try { b = query('SELECT ' + (exprOurs || exprPg) + ' AS v')[0].v; } catch (e) { b = 'ERR:' + e.message; }
    const ok = norm(a) === norm(b);
    if (ok) tot.fnMatch++; else tot.fnDiff++;
    L('§CP-SUP-FN ' + label + ' ref=' + norm(a) + ' ours=' + norm(b) + ' ' + (ok ? 'MATCH' : 'DIFF'));
  }
  const ts = (d) => "'" + d + "'::timestamp";
  const tq = (d) => "'" + d + " 00:00:00'";
  // A1 bomPrice* — every M_ProductPrice (product, version) in GardenWorld present in both DBs, + a product absent from a version
  const pp = query("SELECT m_product_id AS p, m_pricelist_version_id AS v FROM m_productprice WHERE ad_client_id=11 ORDER BY 2,1 LIMIT 40");
  for (const r of pp.concat([{ p: 123, v: 102 }, { p: 99999, v: 103 }])) {
    for (const f of ['bomPriceStd', 'bomPriceList', 'bomPriceLimit']) await cmpSql(f + '(' + r.p + ',' + r.v + ')', f + '(' + r.p + ',' + r.v + ')');
  }
  // A2 currency functions over the GardenWorld rate pairs × dates
  const pairs = query('SELECT DISTINCT c_currency_id AS f, c_currency_id_to AS t, c_conversiontype_id AS ct FROM c_conversion_rate WHERE ad_client_id IN (0,11)');
  const dates = ['2002-08-10', '2003-02-15', '2006-12-15', '2026-10-04'];
  for (const p of pairs) for (const d of dates) {
    await cmpSql('currencyRate(' + p.f + ',' + p.t + ',' + d + ',' + p.ct + ')', 'currencyRate(' + p.f + ',' + p.t + ',' + ts(d) + ',' + p.ct + ',11,11)', 'currencyRate(' + p.f + ',' + p.t + ',' + tq(d) + ',' + p.ct + ',11,11)');
    await cmpSql('currencyRate(' + p.f + ',' + p.t + ',' + d + ',default)', 'currencyRate(' + p.f + ',' + p.t + ',' + ts(d) + ',0,11,11)', 'currencyRate(' + p.f + ',' + p.t + ',' + tq(d) + ',0,11,11)');
    await cmpSql('currencyConvert(123.45,' + p.f + ',' + p.t + ',' + d + ')', 'currencyConvert(123.45,' + p.f + ',' + p.t + ',' + ts(d) + ',' + p.ct + ',11,11)', 'currencyConvert(123.45,' + p.f + ',' + p.t + ',' + tq(d) + ',' + p.ct + ',11,11)');
    await cmpSql('currencyBase(77.777,' + p.f + ',' + d + ')', 'currencyBase(77.777,' + p.f + ',' + ts(d) + ',11,11)', 'currencyBase(77.777,' + p.f + ',' + tq(d) + ',11,11)');
  }
  for (const c of [100, 102, 301, 999]) for (const cost of ['Y', 'N']) await cmpSql('currencyRound(100.12345,' + c + ',' + cost + ')', "currencyRound(100.12345," + c + ",'" + cost + "')");
  // A3 invoiceOpen / invoiceDiscount — every invoice whose allocation state is identical in both DBs
  const invs = query('SELECT c_invoice_id AS id, grandtotal AS gt FROM c_invoice WHERE ad_client_id=11 ORDER BY 1');
  for (const i of invs) {
    const ra = await pg('SELECT COALESCE(SUM(al.amount+al.discountamt+al.writeoffamt),0) AS s, COUNT(*) AS n FROM c_allocationline al WHERE al.c_invoice_id=' + i.id);
    const oa = query('SELECT COALESCE(SUM(al.amount+al.discountamt+al.writeoffamt),0) AS s, COUNT(*) AS n FROM c_allocationline al WHERE al.c_invoice_id=?', [i.id])[0];
    const rg = await pg('SELECT grandtotal AS g FROM c_invoice WHERE c_invoice_id=' + i.id);
    if (!rg.length || norm(rg[0].g) !== norm(i.gt) || norm(ra[0].s) !== norm(oa.s) || Number(ra[0].n) !== Number(oa.n)) { tot.fn++; tot.fnSkip++; L('§CP-SUP-FN invoiceOpen(' + i.id + ') INCONCLUSIVE data-state differs (pilot alloc ' + ra[0].n + '/' + norm(ra[0].s) + ' vs bundle ' + oa.n + '/' + norm(oa.s) + ')'); continue; }
    await cmpSql('invoiceOpen(' + i.id + ',0)', 'invoiceOpen(' + i.id + ',0)');
    for (const d of ['2003-01-05', '2003-02-28', '2026-10-04']) await cmpSql('invoiceDiscount(' + i.id + ',' + d + ')', 'invoiceDiscount(' + i.id + ',' + ts(d) + ',0)', 'invoiceDiscount(' + i.id + ',' + tq(d) + ',0)');
  }
  // A4 paymentTermDiscount over every payment term × pay dates; nextBusinessDay; trunc; getDate type
  const pts = query('SELECT c_paymentterm_id AS id FROM c_paymentterm WHERE ad_client_id=11');
  for (const p of pts) for (const pd of ['2003-01-05', '2003-01-11', '2003-01-25', '2003-03-30']) {
    await cmpSql('paymentTermDiscount(1000,100,' + p.id + ',2003-01-01,' + pd + ')', 'paymentTermDiscount(1000,100,' + p.id + ',' + ts('2003-01-01') + ',' + ts(pd) + ')', 'paymentTermDiscount(1000,100,' + p.id + ',' + tq('2003-01-01') + ',' + tq(pd) + ')');
    await cmpSql('paymentTermDiscount(999.99,0,' + p.id + ',2003-01-01,' + pd + ')', 'paymentTermDiscount(999.99,0,' + p.id + ',' + ts('2003-01-01') + ',' + ts(pd) + ')', 'paymentTermDiscount(999.99,0,' + p.id + ',' + tq('2003-01-01') + ',' + tq(pd) + ')');
  }
  for (const d of ['2003-01-03', '2003-01-04', '2003-01-05', '2026-10-03', '2026-12-25']) await cmpSql('nextBusinessDay(' + d + ')', 'nextBusinessDay(' + ts(d) + ',11)', 'nextBusinessDay(' + tq(d) + ',11)');
  for (const f of ['', "'Q'", "'Y'", "'MM'", "'DD'"]) await cmpSql('trunc(2026-08-17 13:45:00' + (f ? ',' + f : '') + ')', "trunc('2026-08-17 13:45:00'::timestamp" + (f ? ',' + f : '') + ')', "trunc('2026-08-17 13:45:00'" + (f ? ',' + f : '') + ')');

  // ── B. Java statics through real callouts ───────────────────────────────────────────────────────────────────
  const ctxR = (await oracle({ op: 'ctx', ctx: { date: '2026-10-04' } })).ctx;
  const ctx = new A.Ctx(); Object.keys(ctxR).forEach(k => { if (!/^\d+\|/.test(k)) ctx.setProperty(k, ctxR[k]); });
  function cmpField(label, col, ref, ours) {
    tot.co++;
    const ok = norm(ref) === norm(ours);
    if (ok) tot.coMatch++; else tot.coDiff++;
    L('§CP-SUP-CO ' + label + ' ' + col + ' ref=' + norm(ref) + ' ours=' + norm(ours) + ' ' + (ok ? 'MATCH' : 'DIFF'));
    return ok;
  }
  const HCOLS = 'c_order_id, c_bpartner_id, issotrx, m_pricelist_id, dateordered, datepromised, ad_org_id, m_warehouse_id, bill_location_id, c_bpartner_location_id, deliveryviarule, dropship_location_id';
  // orders: the pilot's DRAFT orders (a completed parent makes the line tab read-only → dataNew refuses). Headers are read from
  // the PILOT DB (the oracle's own row); only master data (products/prices/taxes/UOM) has to exist in both — checked per product.
  // Fixtures (cp_support_fixtures.js): PO on price list 102, SO on 103 (EUR) with DeliveryViaRule=P (pickup), SO for BP 118 (break schema 102).
  const pick = await pg("SELECT " + HCOLS + " FROM c_order WHERE processed='N' AND ad_client_id=11 ORDER BY c_order_id");
  const products = query("SELECT DISTINCT pp.m_product_id AS p FROM m_productprice pp WHERE pp.ad_client_id=11 ORDER BY 1 LIMIT 8").map(r => r.p).concat([124, 145]);
  let casesB = 0;
  for (const o of pick) {
    const win = o.issotrx === 'Y' ? 143 : 181;
    for (const prod of products) {
      const mdSql = 'SELECT pp.m_pricelist_version_id AS v, pp.pricestd AS s, pp.pricelist AS l, pp.pricelimit AS m, p.c_uom_id AS u, p.c_taxcategory_id AS t FROM m_productprice pp JOIN m_product p ON p.m_product_id=pp.m_product_id WHERE pp.m_product_id=' + prod + ' ORDER BY 1';
      const MDK = ['v', 's', 'l', 'm', 'u', 't'];   // explicit key order — org.json objects come back unordered
      const mdR = (await pg(mdSql)).map(r => MDK.map(k => norm(r[k])).join('|')).join(';');
      const mdO = query(mdSql).map(r => MDK.map(k => norm(r[k])).join('|')).join(';');
      if (mdR !== mdO) { L('§CP-SUP-CO product ' + prod + ' INCONCLUSIVE master data differs between DBs'); tot.coSkip++; continue; }
      for (const qty of (o.c_bpartner_id === 118 ? [1, 150] : [1])) {
        const steps = (qty !== 1 ? [{ set: 'QtyEntered', value: String(qty) }] : []).concat([{ set: 'M_Product_ID', value: prod }]);
        const ref = await oracle({ op: 'callout', window: win, tab: 1, parents: [{ tab: 0, id: o.c_order_id }], ctx: { date: '2026-10-04' }, steps });
        if (!ref.ok) { L('§CP-SUP-CO order ' + o.c_order_id + ' product ' + prod + ' ORACLE-ERROR ' + ref.error); tot.coSkip++; continue; }
        casesB++;
        const before = steps.length > 1 ? ref.steps[0].fields : ref.afterNew, after = ref.steps[steps.length - 1].fields;
        const label = 'win=' + win + ' order=' + o.c_order_id + ' bp=' + o.c_bpartner_id + ' pl=' + o.m_pricelist_id + ' product=' + prod + ' qty=' + qty;
        // our MProductPricing with the inputs CalloutOrder.product (:742-787) gives it
        const line = { getM_Product_ID: () => prod, getC_Order_ID: () => o.c_order_id, getC_BPartner_ID: () => before.C_BPartner_ID == null ? null : Number(before.C_BPartner_ID),
          getQtyOrdered: () => A.toBD(before.QtyOrdered), getDateOrdered: () => TS.of(before.DateOrdered) };
        const pricing = M.Core.getProductPricing();
        pricing.setInitialValues(prod, Number(o.c_bpartner_id), A.toBD(before.QtyOrdered), o.issotrx === 'Y', null);
        pricing.setPriceDate(TS.of(before.DateOrdered));
        pricing.setOrderLine(line, null);
        pricing.setM_PriceList_ID(Number(o.m_pricelist_id));
        const plv = A.RUNTIME.DB.getSQLValue(null, 'SELECT plv.M_PriceList_Version_ID FROM M_PriceList_Version plv WHERE plv.M_PriceList_ID=? AND plv.ValidFrom <= ? ORDER BY plv.ValidFrom DESC', Number(o.m_pricelist_id), TS.of(before.DateOrdered));
        pricing.setM_PriceList_Version_ID(plv);
        cmpField(label, 'PriceList', after.PriceList, pricing.getPriceList());
        cmpField(label, 'PriceLimit', after.PriceLimit, pricing.getPriceLimit());
        cmpField(label, 'PriceEntered', after.PriceEntered, pricing.getPriceStd());
        cmpField(label, 'C_Currency_ID', after.C_Currency_ID, pricing.getC_Currency_ID());
        cmpField(label, 'C_UOM_ID', after.C_UOM_ID, pricing.getC_UOM_ID());
        cmpField(label, 'Discount(MProductPricing.getDiscount, before amt)', after.Discount, pricing.getDiscount());
        L('§CP-SUP-CO-INFO ' + label + ' isDiscountSchema=' + pricing.isDiscountSchema() + ' enforce=' + pricing.isEnforcePriceLimit() + ' ctxRef.DiscountSchema=' + (ref.ctxWin.DiscountSchema || '') + ' ctxRef.EnforcePriceLimit=' + (ref.ctxWin.EnforcePriceLimit || ''));
        cmpField(label, 'ctx.DiscountSchema', ref.ctxWin.DiscountSchema, pricing.isDiscountSchema() ? 'Y' : 'N');
        cmpField(label, 'ctx.EnforcePriceLimit', ref.ctxWin.EnforcePriceLimit, pricing.isEnforcePriceLimit() ? 'Y' : 'N');
        // our Tax.get with the inputs CalloutOrder.tax (:925-985) gives it
        const shipLoc = Number(o.c_bpartner_location_id || 0); let tax;
        try {
          tax = M.Core.getTaxLookup().get(ctx, prod, 0, TS.of(o.dateordered), TS.of(o.datepromised), Number(o.ad_org_id), Number(o.m_warehouse_id),
            Number(o.bill_location_id || 0) || shipLoc, shipLoc, Number(o.dropship_location_id || 0), o.issotrx === 'Y', o.deliveryviarule || '', null);
        } catch (e) { tax = 'EXC:' + e.message; }
        cmpField(label, 'C_Tax_ID', after.C_Tax_ID, tax);
        // UOM: product 124 has a product UOM conversion (100→109, ×0.1666…/÷6) — set C_UOM_ID=109 → CalloutOrder.qty (:1192-1222)
        if (prod === 124 && qty === 1) {
          const ref2 = await oracle({ op: 'callout', window: win, tab: 1, parents: [{ tab: 0, id: o.c_order_id }], ctx: { date: '2026-10-04' },
            steps: [{ set: 'M_Product_ID', value: 124 }, { set: 'QtyEntered', value: '7' }, { set: 'C_UOM_ID', value: 109 }] });
          if (ref2.ok) {
            const b2 = ref2.steps[1].fields, a2 = ref2.steps[2].fields;
            const qo = M.MUOMConversion.convertProductFrom(ctx, 124, 109, A.toBD(b2.QtyEntered).setScale(M.MUOM.getPrecision(ctx, 109), A.RoundingMode.HALF_UP));
            cmpField(label + ' uom=109', 'QtyOrdered(convertProductFrom)', a2.QtyOrdered, qo);
            const pe = M.MUOMConversion.convertProductFrom(ctx, 124, 109, A.toBD(b2.PriceActual), 12);
            cmpField(label + ' uom=109', 'PriceEntered(convertProductFrom,12)', a2.PriceEntered, pe);
            L('§CP-SUP-CO-INFO uom ctx.UOMConversion ref=' + (ref2.ctxWin.UOMConversion || '') + ' rateTo=' + M.MUOMConversion.getProductRateTo(ctx, 124, 109) + ' rateFrom=' + M.MUOMConversion.getProductRateFrom(ctx, 124, 109));
          }
        }
      }
    }
  }
  // MConversionRate.getRate via CalloutGLJournal.rate (GL Journal window 200005, header): CurrencyRate = getRate(cur, as.currency, DateAcct, type, client, org)
  for (const cur of [102, 301, 100]) for (const d of ['2002-08-10', '2003-02-15', '2026-10-04']) {
    const ref = await oracle({ op: 'callout', window: 200005, tab: 0, ctx: { date: '2026-10-04' }, steps: [{ set: 'DateAcct', value: d }, { set: 'C_Currency_ID', value: cur }] });
    if (!ref.ok) { L('§CP-SUP-CO GLJournal ORACLE-ERROR ' + ref.error); tot.coSkip++; continue; }
    const f = ref.steps[1].fields;
    if (f.C_ConversionType_ID == null) { L('§CP-SUP-CO GLJournal INCONCLUSIVE no C_ConversionType_ID default'); tot.coSkip++; continue; }
    const asCur = Number((await pg('SELECT c_currency_id AS c FROM c_acctschema WHERE c_acctschema_id=' + (ref.ctxWin.C_AcctSchema_ID || f.C_AcctSchema_ID)))[0].c);
    let r = M.MConversionRate.getRate(cur, asCur, TS.of(f.DateAcct), Number(f.C_ConversionType_ID), Number(f.AD_Client_ID), Number(f.AD_Org_ID));
    if (r == null) r = BD.ZERO;
    cmpField('GLJournal cur=' + cur + ' date=' + d + ' type=' + f.C_ConversionType_ID, 'CurrencyRate(MConversionRate.getRate)', f.CurrencyRate, r);
    const conv = M.MConversionRate.convert(ctx, A.toBD('1234.567'), cur, asCur, TS.of(f.DateAcct), Number(f.C_ConversionType_ID), Number(f.AD_Client_ID), Number(f.AD_Org_ID));
    const pgc = (await pg("SELECT currencyConvert(1234.567," + cur + "," + asCur + ",'" + d + "'::timestamp," + f.C_ConversionType_ID + "," + f.AD_Client_ID + "," + f.AD_Org_ID + ") AS v"))[0].v;
    cmpField('GLJournal cur=' + cur + ' date=' + d, 'MConversionRate.convert vs pg currencyConvert', pgc, conv);
  }

  // ── C. vacuity: perturb MProductPricing.getPriceList (+0.01) and Tax.getExemptTax path → the B comparison must diff ──
  const orig = M.MProductPricing.prototype.getPriceList;
  M.MProductPricing.prototype.getPriceList = function () { const v = orig.call(this); return v.add(A.toBD('0.01')); };
  const o0 = pick[pick.length - 1];
  const refV = await oracle({ op: 'callout', window: o0.issotrx === 'Y' ? 143 : 181, tab: 1, parents: [{ tab: 0, id: o0.c_order_id }], ctx: { date: '2026-10-04' }, steps: [{ set: 'M_Product_ID', value: products[0] }] });
  const pv = M.Core.getProductPricing(); pv.setInitialValues(products[0], Number(o0.c_bpartner_id), A.toBD(refV.afterNew.QtyOrdered), o0.issotrx === 'Y', null);
  pv.setPriceDate(TS.of(refV.afterNew.DateOrdered)); pv.setM_PriceList_ID(Number(o0.m_pricelist_id));
  pv.setM_PriceList_Version_ID(A.RUNTIME.DB.getSQLValue(null, 'SELECT plv.M_PriceList_Version_ID FROM M_PriceList_Version plv WHERE plv.M_PriceList_ID=? AND plv.ValidFrom <= ? ORDER BY plv.ValidFrom DESC', Number(o0.m_pricelist_id), TS.of(refV.afterNew.DateOrdered)));
  const vac = norm(refV.steps[0].fields.PriceList) !== norm(pv.getPriceList());
  M.MProductPricing.prototype.getPriceList = orig;
  const origRate = A.RUNTIME.M.SqlFn.currencyrate;
  db.create_function('currencyrate', function () { const v = origRate.apply(null, arguments); return v == null ? null : A.toBD(v).add(A.toBD('0.000001')).toString(); });
  const pgv = (await pg("SELECT currencyRate(102,100,'2003-02-15'::timestamp,114,11,11) AS v"))[0].v;
  const ourv = query("SELECT currencyRate(102,100,'2003-02-15 00:00:00',114,11,11) AS v")[0].v;
  const vac2 = norm(pgv) !== norm(ourv);
  L('§CP-SUP-VACUITY perturbed MProductPricing.getPriceList(+0.01) diff=' + vac + ' (ref=' + norm(refV.steps[0].fields.PriceList) + ' perturbed=' + norm(pv.getPriceList()) + '); perturbed UDF currencyRate(+1e-6) diff=' + vac2 + ' → ' + (vac && vac2 ? 'NON-VACUOUS' : 'VACUOUS'));

  L('§CP-SUP-SUMMARY fn=' + tot.fn + ' match=' + tot.fnMatch + ' diff=' + tot.fnDiff + ' inconclusive=' + tot.fnSkip +
    ' | callout-exposed=' + tot.co + ' match=' + tot.coMatch + ' diff=' + tot.coDiff + ' inconclusive=' + tot.coSkip + ' calloutCases=' + casesB);
  Object.keys(deps).forEach(k => L(k + ' ×' + deps[k]));
  if (logFile) fs.writeFileSync(logFile, out.join('\n') + '\n');
})().catch(e => { L('§CP-SUP-FATAL ' + (e && e.stack || e)); if (logFile) fs.writeFileSync(logFile, out.join('\n') + '\n'); process.exit(2); });
