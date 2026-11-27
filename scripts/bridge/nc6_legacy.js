// §NC-6/7/8 legacy probes (prompts/ERP_DEPTH_FILM.md §NC-6): the setup-master model rules (MConversionRate, MWarehouse, MProductCategory, MBPGroup, MCharge,
// MPaymentTerm, MPriceListVersion, MUOMConversion, MYear) on the LOCAL pilot via the WS. Throwaway rows named NC6-*; removed at the end. Writes out/nc6_legacy.json.
'use strict';
const ad = require('./ad_client'), { execFileSync } = require('child_process'), fs = require('fs'), path = require('path');
const cfg = ad.cfgFromEnv(), log = s => console.log(s), tag = Date.now().toString(36).slice(-4);
const pg = sql => execFileSync('docker', ['exec', '-i', 'postgres', 'psql', '-U', 'postgres', '-d', 'idempiere_pilot', '-tAF', '|', '-v', 'ON_ERROR_STOP=1', '-c', 'set search_path=adempiere;' + sql], { encoding: 'utf8' }).trim().split('\n').filter(l => l && l !== 'SET' && !/^(NOTICE|DELETE|INSERT)/.test(l)).map(l => l.split('|'));
const f = o => ({ field: Object.entries(o).map(([k, v]) => ({ '@column': k, val: String(v) })) });
const create = (t, o) => ad.call(cfg, 'create_data', { ModelCRUD: { serviceType: 'Bridge_createData_' + t, TableName: t, RecordID: 0, Action: 'Create', DataRow: f(o) } }).then(j => +j.StandardResponse['@RecordID']);
const update = (t, id, o) => ad.call(cfg, 'update_data', { ModelCRUD: { serviceType: 'Bridge_updateData_' + t, TableName: t, RecordID: id, Action: 'Update', DataRow: f(o) } });
const out = { tag, cases: {} }; out.defaultRows = +pg('select count(*) from c_acctschema_default where ad_client_id=11')[0][0];
const tryc = async (id, fn) => { try { const r = await fn(); out.cases[id] = { ok: true, ...r }; log(`§NC6L ${id} ok ${JSON.stringify(r)}`); } catch (e) { const m = String(e.message).replace(/\s+/g, ' ').replace(/^.*Cannot save record in [A-Za-z_]+: /, '').replace(/^§AD_ERROR [a-z_]+: /, ''); out.cases[id] = { ok: false, err: m.slice(0, 220) }; log(`§NC6L ${id} REFUSED ${m.slice(0, 220)}`); } };
(async () => {
  const mine = { cr: [], wh: [], pc: [], bg: [], ch: [], pt: [], uc: [], yr: [], pv: [] };
  // ---- MConversionRate ----
  const CR = { AD_Org_ID: 0, C_Currency_ID: 100, C_Currency_ID_To: 116, C_ConversionType_ID: 114 };
  await tryc('CR1', async () => { const id = await create('C_Conversion_Rate', { ...CR, MultiplyRate: 1.5, DivideRate: 0.666666666667, ValidFrom: '2040-01-01 00:00:00', ValidTo: '2040-12-31 00:00:00' }); mine.cr.push(id);
    const a = pg(`select multiplyrate,dividerate from c_conversion_rate where c_conversion_rate_id=${id}`)[0];
    const rec = pg(`select c_conversion_rate_id,multiplyrate,dividerate,ad_org_id from c_conversion_rate where c_currency_id=116 and c_currency_id_to=100 and validfrom='2040-01-01' and ad_client_id=11`);
    rec.forEach(r => mine.cr.push(+r[0])); return { multiply: a[0], divide: a[1], reciprocal: rec.map(r => ({ mult: r[1], div: r[2], org: r[3] })) }; });
  await tryc('CR2', () => create('C_Conversion_Rate', { ...CR, C_Currency_ID_To: 100, MultiplyRate: 1, ValidFrom: '2041-01-01 00:00:00', ValidTo: '2041-12-31 00:00:00' }));
  await tryc('CR3', () => create('C_Conversion_Rate', { ...CR, MultiplyRate: 0, ValidFrom: '2041-01-01 00:00:00', ValidTo: '2041-12-31 00:00:00' }));
  await tryc('CR4', () => create('C_Conversion_Rate', { ...CR, MultiplyRate: 1.1, ValidFrom: '2041-06-30 00:00:00', ValidTo: '2041-01-01 00:00:00' }));
  await tryc('CR5', () => create('C_Conversion_Rate', { ...CR, MultiplyRate: 1.6, DivideRate: 0.625, ValidFrom: '2040-06-01 00:00:00', ValidTo: '2040-08-31 00:00:00' }));
  // ---- MWarehouse (org 0 typed; session org is 11) ----
  await tryc('WH1', async () => { const id = await create('M_Warehouse', { AD_Org_ID: 0, Value: 'NC6' + tag, Name: 'NC6-WH-' + tag, C_Location_ID: pg("select c_location_id from c_location where ad_client_id=11 order by 1 limit 1")[0][0] }); mine.wh.push(id);
    return { org: pg(`select ad_org_id from m_warehouse where m_warehouse_id=${id}`)[0][0], acctRows: +pg(`select count(*) from m_warehouse_acct where m_warehouse_id=${id}`)[0][0] }; });
  // ---- MProductCategory ----
  await tryc('PC1', async () => { const id = await create('M_Product_Category', { AD_Org_ID: 0, Value: 'NC6' + tag, Name: 'NC6-PC-' + tag, IsDefault: 'N', PlannedMargin: 0, MMPolicy: 'F', A_Asset_Group_ID: '' }); mine.pc.push(id);
    return { acctRows: +pg(`select count(*) from m_product_category_acct where m_product_category_id=${id}`)[0][0] }; });
  if (mine.pc[0]) await tryc('PC2', async () => { await update('M_Product_Category', mine.pc[0], { M_Product_Category_Parent_ID: mine.pc[0] }); return {}; });
  // ---- MBPGroup / MCharge ----
  await tryc('BG1', async () => { const id = await create('C_BP_Group', { AD_Org_ID: 0, Value: 'NC6' + tag, Name: 'NC6-BG-' + tag, PriorityBase: 'S', IsConfidentialInfo: 'N', IsDefault: 'N' }); mine.bg.push(id); return { acctRows: +pg(`select count(*) from c_bp_group_acct where c_bp_group_id=${id}`)[0][0] }; });
  await tryc('CH1', async () => { const id = await create('C_Charge', { AD_Org_ID: 0, Name: 'NC6-CH-' + tag, ChargeAmt: 5, C_TaxCategory_ID: pg("select c_taxcategory_id from c_taxcategory where ad_client_id=11 order by 1 limit 1")[0][0], IsSameCurrency: 'N', IsSameTax: 'N', IsTaxIncluded: 'N' }); mine.ch.push(id); return { acctRows: +pg(`select count(*) from c_charge_acct where c_charge_id=${id}`)[0][0] }; });
  // ---- MPaymentTerm ----
  const PT = { AD_Org_ID: 0, IsDueFixed: 'N', NetDays: 30, GraceDays: 0, DiscountDays: 0, Discount: 0, DiscountDays2: 0, Discount2: 0, AfterDelivery: 'N', IsNextBusinessDay: 'N', FixMonthDay: 0, FixMonthOffset: 0, FixMonthCutoff: 0, IsDefault: 'N' };
  await tryc('PT1', async () => { const id = await create('C_PaymentTerm', { ...PT, Value: 'NC6A' + tag, Name: 'NC6-PT-A-' + tag }); mine.pt.push(id); return { isvalid: pg(`select isvalid from c_paymentterm where c_paymentterm_id=${id}`)[0][0] }; });
  await tryc('PT2', () => create('C_PaymentTerm', { ...PT, Value: 'NC6B' + tag, Name: 'NC6-PT-B-' + tag, IsDueFixed: 'Y', FixMonthDay: 0, FixMonthCutoff: 5 }));
  await tryc('PT3', () => create('C_PaymentTerm', { ...PT, Value: 'NC6C' + tag, Name: 'NC6-PT-C-' + tag, IsDueFixed: 'Y', FixMonthDay: 15, FixMonthCutoff: 40 }));
  await tryc('PT4', () => create('C_PaymentTerm', { ...PT, Value: 'NC6D' + tag, Name: 'NC6-PT-D-' + tag, NetDays: -1 }));
  // ---- MUOMConversion ----
  await tryc('UC1', () => create('C_UOM_Conversion', { AD_Org_ID: 0, C_UOM_ID: 100, C_UOM_To_ID: 100, MultiplyRate: 2 }));
  await tryc('UC2', async () => { const id = await create('C_UOM_Conversion', { AD_Org_ID: 0, C_UOM_ID: 100, C_UOM_To_ID: 101, MultiplyRate: 3 }); mine.uc.push(id); const r = pg(`select multiplyrate,dividerate from c_uom_conversion where c_uom_conversion_id=${id}`)[0]; return { multiply: r[0], divide: r[1] }; });
  await tryc('UC3', () => create('C_UOM_Conversion', { AD_Org_ID: 0, C_UOM_ID: 100, C_UOM_To_ID: 102, MultiplyRate: 0, DivideRate: 0 }));
  // ---- MPriceListVersion.setName (:177-187): Name omitted -> ValidFrom formatted ----
  await tryc('PV1', async () => { const id = await create('M_PriceList_Version', { AD_Org_ID: 0, M_PriceList_ID: 101, M_DiscountSchema_ID: pg("select m_discountschema_id from m_discountschema where ad_client_id=11 order by 1 limit 1")[0][0], ValidFrom: '2042-03-05 00:00:00' }); mine.pv.push(id);
    return { name: pg(`select name from m_pricelist_version where m_pricelist_version_id=${id}`)[0][0] }; });
  // ---- MYear ----
  await tryc('YR1', async () => { const cal = pg("select c_calendar_id from c_calendar where ad_client_id=11 order by 1 limit 1")[0][0]; return { id: await create('C_Year', { AD_Org_ID: 0, C_Calendar_ID: cal, FiscalYear: 'abc' }) }; });
  // ---- cleanup (children first) ----
  const del = (t, ids, col) => ids.length && pg(`delete from ${t} where ${col} in (${ids.join(',')})`);
  del('m_warehouse_acct', mine.wh, 'm_warehouse_id'); del('m_warehouse', mine.wh, 'm_warehouse_id'); del('m_product_category_acct', mine.pc, 'm_product_category_id'); del('m_product_category_trl', mine.pc, 'm_product_category_id'); del('m_product_category', mine.pc, 'm_product_category_id');
  del('c_bp_group_acct', mine.bg, 'c_bp_group_id'); del('c_bp_group', mine.bg, 'c_bp_group_id'); del('c_charge_acct', mine.ch, 'c_charge_id'); del('c_charge_trl', mine.ch, 'c_charge_id'); del('c_charge', mine.ch, 'c_charge_id');
  del('c_paymentterm_trl', mine.pt, 'c_paymentterm_id'); del('c_paymentterm', mine.pt, 'c_paymentterm_id'); del('c_uom_conversion', mine.uc, 'c_uom_conversion_id'); del('c_conversion_rate', mine.cr, 'c_conversion_rate_id'); del('m_pricelist_version', mine.pv, 'm_pricelist_version_id');
  log('§NC6L cleanup done ' + JSON.stringify(Object.fromEntries(Object.entries(mine).map(([k, v]) => [k, v.length]))));
  fs.mkdirSync(path.join(__dirname, 'out'), { recursive: true }); fs.writeFileSync(path.join(__dirname, 'out', 'nc6_legacy.json'), JSON.stringify(out, null, 1)); log('§NC6L DONE');
})().catch(e => { console.log('§NC6L CRASH ' + (e.stack || e)); process.exit(2); });
