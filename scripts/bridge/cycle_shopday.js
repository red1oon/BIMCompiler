// ⚠ DO NOT REMOVE -- SHOP-DAY DRIVER (prompts/SQLiteIDEMPIERE.md §SHOPDAY-RUN-1 Stage 2). READ THE LOG: §SHOPDAY_* lines; exit code is not evidence.
//  §SHOPDAY_STEP SD-nn MATCH|DIFF|BLOCKED|INCONCLUSIVE tables=<n> legacy_rows=<n> sqlite_rows=<n> diff_tables=<n>   one per step, after BOTH sides did the step
//  §SHOPDAY_DIFF  the differing columns of a differing row pair (first rows) -- every one is a SQLite-side gap to fix or a numbered shipped-code gap
//  §SHOPDAY_GAP   G-SDn numbered gaps (shipped-code gaps are NOT fixed here: bim-ootb is not touched)
//  §SHOPDAY_VERDICT PASS only if >0 steps judged, none DIFF/BLOCKED/INCONCLUSIVE and the negative control flipped; INCONCLUSIVE when nothing judged
// Same facts to both sides: legacy through the stock WS as the new client's Admin role (NOT System); SQLite = shop_twin.js (born from the extracted
// MSetup template, client_template.js). Compare = client_template.compareTemplates over the tables the step touches (ids never compared; FKs by label).
// Usage: SHOPDAY_CLIENT=<name> node cycle_shopday.js [--only SD-02,SD-03] [--create]   (--create runs InitialClientSetup for a client that does not exist)
'use strict';
const fs = require('fs'), zlib = require('zlib'), path = require('path');
const ad = require('./ad_client'), F = require('./shopday_facts'), T = require('./client_template'), { ShopTwin } = require('./shop_twin');
const log = console.log;
const TODAY = (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; })();
const DROP = /^(datelastrun|datenextrun|datepasswordchanged|datelastlogin)$/;
const args = process.argv.slice(2), ONLY = (args.includes('--only') ? args[args.indexOf('--only') + 1] : '').split(',').filter(Boolean);

// natural-key read types for resolving a reference on the legacy side (WS reads only)
const RT = { c_bp_group: 'QueryCBPGroup', c_taxcategory: 'QueryCTaxCategory', m_product_category: 'QueryMProductCategory', c_bank: 'QueryCBank', c_bpartner: 'QueryCBPartner', c_location: 'QueryCLocation',
  m_product: 'QueryMProduct', m_pricelist: 'QueryMPriceList', m_pricelist_version: 'QueryMPriceListVersion', c_tax: 'QueryCTax', m_discountschema: 'QueryMDiscountSchema', c_acctschema: 'QueryCAcctSchema', c_bankaccount: 'QueryCBankAccount', m_costelement: 'QueryMCostElement' };
const q = v => `'${String(v).replace(/'/g, "''")}'`;

async function main() {
  const out = { steps: [], neg: null };
  let ids = F.resolveIds();
  if (!ids) {
    if (!args.includes('--create')) { log(`§SHOPDAY_VERDICT INCONCLUSIVE client ${F.client.name} does not exist on legacy (run with --create)`); return 1; }
    const sys = ad.cfgFromEnv(); sys.login = F.systemLogin;
    const r = await ad.runProcess(sys, 'Bridge_RunProcess_InitialClientSetup', F.setupParams());
    log(`§SHOPDAY_STEP SD-00 legacy run_process ok=${r.ok} ${r.error || ''}`); if (!r.ok) return 1;
    ids = F.resolveIds();
    const sh = require('child_process').spawnSync('docker', ['exec', '-i', 'postgres', 'psql', '-U', 'postgres', '-d', 'idempiere_pilot', '-v', 'ON_ERROR_STOP=1', '-v', `rname='${F.client.name} Admin'`], { input: fs.readFileSync(path.join(__dirname, 'pilot', 'ws_shopday_grant.sql')), encoding: 'utf8' });
    log('§SHOPDAY_ADMIN_LANE grant WS types to the new Admin role: ' + (sh.stdout.match(/\d+\s*\n\(1 row\)/) || ['?'])[0].replace(/\s+/g, ' '));
    log('§SHOPDAY_ADMIN_LANE restart the pilot server now (WS config is cached) and re-run without --create'); return 3;
  }
  const cfg = ad.cfgFromEnv(); cfg.login = { user: F.adminUser, pass: F.adminUser, lang: 'en_US', ClientID: ids.clientId, RoleID: ids.adminRoleId, OrgID: ids.orgId, WarehouseID: ids.whId, stage: 0 };
  const { from, tpl } = JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(__dirname, '..', '..', 'build', 'erp', 'msetup_template_ShopDayTest.json.gz'))));
  const to = F.templateFacts(1, ids.clientId, TODAY);
  const inst = T.instantiate(tpl, from, to);
  const userId = +T.pg(`select ad_user_id from ad_user where name='${F.adminUser}' and ad_client_id=${ids.clientId}`)[0];
  const tw = new ShopTwin(inst, { clientId: ids.clientId, orgId: ids.orgId, userId, today: TODAY, log });
  log(`§SHOPDAY_CTX client=${F.client.name}(${ids.clientId}) adminRole=${ids.adminRoleId} org=${ids.orgId} wh=${ids.whId} user=${userId} today=${TODAY} template=${from.name}(${from.clientId})->${to.name}`);

  // ---- legacy helpers (WS only) ----
  const f = o => ({ field: Object.entries(o).filter(([, v]) => v !== undefined && v !== null).map(([k, v]) => ({ '@column': k, val: String(v) })) });
  const lref = async (t, col, val) => { const r = await ad.query(cfg, RT[t], `${col}=${q(val)}`); if (r.length !== 1) throw new Error(`§SHOPDAY legacy ref ${t}.${col}=${val} -> ${r.length} rows`); return +r[0][t.toUpperCase().replace('C_BP_GROUP', 'C_BP_Group').replace(/^(\w)_(\w)/, (m, a, b) => a.toUpperCase() + '_' + b.toUpperCase()) + '_ID'] || +Object.values(r[0]).find((v, i) => /_ID$/i.test(Object.keys(r[0])[i]) && Object.keys(r[0])[i].toLowerCase() === t + '_id'); };
  const lrefId = async (t, col, val) => { const r = await ad.query(cfg, RT[t], `${col}=${q(val)}`); if (r.length !== 1) throw new Error(`§SHOPDAY legacy ref ${t}.${col}=${val} -> ${r.length} rows`); const k = Object.keys(r[0]).find(x => x.toLowerCase() === t + '_id'); return +r[0][k]; };
  const lcreate = async (t, fields) => { const j = await ad.call(cfg, 'create_data', { ModelCRUD: { serviceType: `Bridge_createData_${t}`, TableName: t, RecordID: 0, Action: 'Create', DataRow: f(fields) } }); return +j.StandardResponse['@RecordID']; };
  const lupdate = async (t, id, fields) => { await ad.call(cfg, 'update_data', { ModelCRUD: { serviceType: `Bridge_updateData_${t}`, TableName: t, RecordID: id, Action: 'Update', DataRow: f(fields) } }); };
  const lfind = async (t, col, val) => { const r = await ad.query(cfg, RT[t], `${col}=${q(val)}`); return r.length ? +r[0][Object.keys(r[0]).find(x => x.toLowerCase() === t + '_id')] : null; };
  const sref = (t, col, val) => { const r = tw.db.prepare(`SELECT ${t}_id id FROM ${t} WHERE ${col}=? AND ad_client_id=?`).get(val, tw.client); if (!r) throw new Error(`§SHOPDAY local ref ${t}.${col}=${val} missing`); return r.id; };
  // one master, same facts to both sides. spec = { t, key:[col,val], fields:{col:val | {ref:[table,col,val]}} }
  const both = async spec => {
    const lf = {}, sf = {};
    for (const [k, v] of Object.entries(spec.fields)) {
      if (v && v.ref) { lf[k] = await lrefId(v.ref[0], v.ref[1], v.ref[2]); sf[k] = sref(v.ref[0], v.ref[1], v.ref[2]); } else { lf[k] = v; sf[k] = v; }
    }
    const lid = (await lfind(spec.t.toLowerCase(), spec.key[0], spec.key[1])) || await lcreate(spec.t, lf);
    const sid = tw.insert(spec.t.toLowerCase(), sf);
    return { lid, sid };
  };

  // ---- compare ----
  const compareStep = async (id, tables, note = '') => {
    const all = [...new Set([...tables, ...T.LABEL_TABLES])], leg = T.extract(ids.clientId, all), loc = tw.dump(all), cmp = T.compareTemplates(loc, leg, DROP, tables);
    let bad = 0, lr = 0, sr = 0;
    for (const r of cmp) {
      lr += r.b || 0; sr += r.a || 0; const nb = (r.onlyLocal || []).length + (r.onlyLegacy || []).length + (r.only ? 1 : 0);
      if (nb) { bad++; log(`§SHOPDAY_DIFF ${id} ${r.table} legacy=${r.b} sqlite=${r.a} onlyLocal=${(r.onlyLocal || []).length} onlyLegacy=${(r.onlyLegacy || []).length}${r.only ? ' only-' + r.only : ''}`);
        const A = (r.onlyLocal || []).map(x => x.split('|')), B = (r.onlyLegacy || []).map(x => x.split('|'));
        for (let i = 0; i < Math.min(2, Math.max(A.length, B.length)); i++) { const a = A[i] || [], b = B[i] || [], da = a.filter(x => !b.includes(x)), db = b.filter(x => !a.includes(x)); log(`  sqlite: ${da.join(' | ').slice(0, 500)}\n  legacy: ${db.join(' | ').slice(0, 500)}`); } }
    }
    const verdict = (lr === 0 && sr === 0) ? 'INCONCLUSIVE' : bad ? 'DIFF' : 'MATCH';
    log(`§SHOPDAY_STEP ${id} ${verdict} tables=${cmp.length} legacy_rows=${lr} sqlite_rows=${sr} diff_tables=${bad}${lr === 0 && sr === 0 ? ' VACUOUS' : ''} ${note}`);
    out.steps.push({ id, verdict }); return verdict;
  };
  const run = async (id, fn) => { if (ONLY.length && !ONLY.includes(id)) return; try { await fn(); } catch (e) { log(`§SHOPDAY_STEP ${id} BLOCKED ${e.message.slice(0, 300)}`); out.steps.push({ id, verdict: 'BLOCKED' }); } };

  // ================= SD-00 the born tenant == legacy's InitialClientSetup result (template instantiated with this run's facts), compared BEFORE any day step =================
  await run('SD-00', async () => { await compareStep('SD-00', Object.keys(inst.tables), 'born tenant vs InitialClientSetup'); });
  // ================= SD-01 open periods: today's period + one past + one future (C_Period_Process 167, PeriodAction=O) =================
  await run('SD-01', async () => {
    const ps = (await ad.query(cfg, 'QueryCPeriod', 'C_Period_ID>0')).sort((a, b) => String(a.StartDate).localeCompare(String(b.StartDate)));
    const i = ps.findIndex(p => String(p.StartDate).slice(0, 10) <= TODAY && TODAY <= String(p.EndDate).slice(0, 10)); if (i < 0) throw new Error('no period contains ' + TODAY);
    const pick = [ps[i - 1], ps[i], ps[i + 1]].filter(Boolean);
    for (const p of pick) { const r = await ad.runProcess(cfg, 'Bridge_RunProcess_PeriodStatus', { PeriodAction: 'O' }, +p.C_Period_ID); log(`§SHOPDAY_LEGACY SD-01 period ${p.PeriodNo} ${r.ok ? r.summary : 'ERR ' + r.error}`); if (!r.ok) throw new Error(r.error); }
    // SQLite: PeriodStatus.doIt :127-170 -- UPDATE C_PeriodControl SET PeriodStatus=?, PeriodAction='N' WHERE C_Period_ID IN (..) AND PeriodStatus<>'P' AND PeriodStatus<>?  (HARNESS-LOCAL verb: shipped ad_process.js has no handler => G-SD1)
    const sp = tw.db.prepare('SELECT c_period_id FROM c_period WHERE ad_client_id=? ORDER BY startdate').all(tw.client).map(r => r.c_period_id), si = tw.db.prepare('SELECT c_period_id FROM c_period WHERE ad_client_id=? AND startdate<=? AND enddate>=?').get(tw.client, TODAY + ' 00:00:00', TODAY + ' 00:00:00');
    const k = sp.indexOf(si.c_period_id), spick = sp.slice(Math.max(0, k - 1), k + 2);
    const n = tw.db.prepare(`UPDATE c_periodcontrol SET periodstatus='O', periodaction='N', updated=? WHERE c_period_id IN (${spick.join(',')}) AND periodstatus<>'P' AND periodstatus<>'O'`).run(tw.stamp).changes;
    log(`§SHOPDAY_LOCAL SD-01 updated #${n} control rows (legacy summary printed above)`);
    await compareStep('SD-01', ['c_periodcontrol'], 'G-SD1: PeriodStatus has no shipped SQLite handler (harness-local verb)');
  });

  // ================= SD-02 masters: customers, vendor (+ locations), bank + bank account =================
  const loc = (a, c, p) => ({ t: 'C_Location', key: ['Address1', a], fields: { Address1: a, City: c, Postal: p, C_Country_ID: F.client.countryId, ...(F.client.regionId ? { C_Region_ID: F.client.regionId } : {}) } });
  await run('SD-02', async () => {
    const G = { ref: ['c_bp_group', 'Value', 'Standard'] };
    const people = [['SD-CUST1', 'SD Customer One', 'Y', 'N', '10 Shop Lane'], ['SD-CUST2', 'SD Customer Two (credit)', 'Y', 'N', '20 Shop Lane'], ['SD-VEND1', 'SD Vendor One', 'N', 'Y', '30 Supply Road']];
    for (const [v, n, c, vd, addr] of people) {
      const lc = await both(loc(addr, F.client.city, F.client.postal));
      const bp = await both({ t: 'C_BPartner', key: ['Value', v], fields: { Value: v, Name: n, IsCustomer: c, IsVendor: vd, C_BP_Group_ID: G, ...(v === 'SD-CUST2' ? { SO_CreditLimit: 500 } : {}) } });
      // location references the ids just created (per side)
      const lex = await ad.query(cfg, 'QueryCBPartnerLocation', `C_BPartner_ID=${bp.lid} AND Name=${q(addr)}`), lloc = lex.length ? +lex[0].C_BPartner_Location_ID : await lcreate('C_BPartner_Location', { C_BPartner_ID: bp.lid, C_Location_ID: lc.lid, Name: addr }), sloc = tw.insert('c_bpartner_location', { c_bpartner_id: bp.sid, c_location_id: lc.sid, name: addr });
    }
    const bank = await both({ t: 'C_Bank', key: ['Name', 'SD Bank'], fields: { Name: 'SD Bank', RoutingNo: 'SD0001', IsOwnBank: 'Y' } });
    await both({ t: 'C_BankAccount', key: ['AccountNo', 'SD-001'], fields: { C_Bank_ID: { ref: ['c_bank', 'Name', 'SD Bank'] }, C_Currency_ID: F.client.currencyId, AccountNo: 'SD-001', Name: 'SD Bank Account', BankAccountType: 'C', IsDefault: 'Y' } });
    await compareStep('SD-02', ['c_location', 'c_bpartner', 'c_bpartner_location', 'c_bp_customer_acct', 'c_bp_vendor_acct', 'ad_treenodebp', 'c_bank', 'c_bankaccount', 'c_bankaccount_acct']);
  });
  await run('SD-03', async () => {
    await both({ t: 'C_TaxCategory', key: ['Name', 'SD Taxed'], fields: { Name: 'SD Taxed', IsDefault: 'N' } });
    await both({ t: 'C_Tax', key: ['Name', 'SD 10%'], fields: { Name: 'SD 10%', Rate: 10, C_TaxCategory_ID: { ref: ['c_taxcategory', 'Name', 'SD Taxed'] }, ValidFrom: '1990-01-01 00:00:00', IsDefault: 'N', SOPOType: 'B', IsDocumentLevel: 'Y', IsSalesTax: 'N' } });
    await compareStep('SD-03', ['c_taxcategory', 'c_tax', 'c_tax_acct']);
  });
  // ---- Q5 (measured: the new schema carries CostingMethod S / level C with one cost element 'Standard Costing'): average-costed like GardenWorld = a cost element
  // 'Average PO' (CostingMethod A, type M) + C_AcctSchema.CostingMethod=A, both through the WS as the new Admin (master changes). No admin-lane SQL needed. ----
  await run('SD-04a', async () => {
    const ce = await both({ t: 'M_CostElement', key: ['Name', 'Average PO'], fields: { Name: 'Average PO', CostingMethod: 'A', CostElementType: 'M', IsCalculated: 'N' } });
    const asId = await lrefId('c_acctschema', 'AD_Client_ID', ids.clientId), sAs = tw.db.prepare('SELECT c_acctschema_id id FROM c_acctschema WHERE ad_client_id=?').get(tw.client).id;
    await lupdate('C_AcctSchema', asId, { CostingMethod: 'A' }); tw.db.prepare("UPDATE c_acctschema SET costingmethod='A' WHERE c_acctschema_id=?").run(sAs);
    await compareStep('SD-04a', ['m_costelement', 'c_acctschema'], 'Q5: costing method Average set through the WS (update_data C_AcctSchema)');
  });
  await run('SD-04', async () => {
    const P = (v, n, type, stocked) => ({ t: 'M_Product', key: ['Value', v], fields: { Value: v, Name: n, M_Product_Category_ID: { ref: ['m_product_category', 'Value', 'Standard'] }, C_UOM_ID: 100, C_TaxCategory_ID: { ref: ['c_taxcategory', 'Name', 'SD Taxed'] }, ProductType: type, IsStocked: stocked, IsSold: 'Y', IsPurchased: 'Y' } });
    await both(P('SD-GOOD1', 'SD Good One', 'I', 'Y')); await both(P('SD-GOOD2', 'SD Good Two', 'I', 'Y')); await both(P('SD-SERV1', 'SD Service One', 'S', 'N'));
    await compareStep('SD-04', ['m_product', 'm_product_acct', 'm_cost', 'ad_treenodepr']);
  });
  await run('SD-05', async () => {
    const pl = n => `Name=${q(n)}`;
    // sales: MSetup's 'Standard' price list + its version (valid from the client's creation day) get prices; purchase: a new list + version + prices
    const salesPL = await lrefId('m_pricelist', 'Name', 'Standard'), salesV = (await ad.query(cfg, 'QueryMPriceListVersion', `M_PriceList_ID=${salesPL}`))[0];
    const sSalesPL = sref('m_pricelist', 'name', 'Standard'), sSalesV = tw.db.prepare('SELECT m_pricelist_version_id id FROM m_pricelist_version WHERE m_pricelist_id=?').get(sSalesPL).id;
    const prices = [['SD-GOOD1', 100, 100, 60], ['SD-GOOD2', 50, 50, 30], ['SD-SERV1', 20, 20, 10]];
    for (const [v, pl_, ps, lim] of prices) {
      const lp = await lrefId('m_product', 'Value', v), sp = sref('m_product', 'value', v);
      const ex = await ad.query(cfg, 'QueryMProductPrice', `M_PriceList_Version_ID=${salesV.M_PriceList_Version_ID} AND M_Product_ID=${lp}`);
      if (!ex.length) await lcreate('M_ProductPrice', { M_PriceList_Version_ID: salesV.M_PriceList_Version_ID, M_Product_ID: lp, PriceList: pl_, PriceStd: ps, PriceLimit: lim });
      tw.insert('m_productprice', { m_pricelist_version_id: sSalesV, m_product_id: sp, pricelist: pl_, pricestd: ps, pricelimit: lim });
    }
    await both({ t: 'M_PriceList', key: ['Name', 'SD Purchase'], fields: { Name: 'SD Purchase', IsSOPriceList: 'N', C_Currency_ID: F.client.currencyId, PricePrecision: 2, IsTaxIncluded: 'N', EnforcePriceLimit: 'N', IsDefault: 'N' } });
    const pPL = await lrefId('m_pricelist', 'Name', 'SD Purchase'), sPPL = sref('m_pricelist', 'name', 'SD Purchase');
    const ds = { ref: ['m_discountschema', 'Name', 'Standard'] };
    const lds = await lrefId('m_discountschema', 'Name', 'Standard'), sds = sref('m_discountschema', 'name', 'Standard');
    const vfields = { Name: 'SD Purchase 1', ValidFrom: TODAY + ' 00:00:00' };
    let lv = await ad.query(cfg, 'QueryMPriceListVersion', `M_PriceList_ID=${pPL}`); lv = lv.length ? +lv[0].M_PriceList_Version_ID : await lcreate('M_PriceList_Version', { ...vfields, M_PriceList_ID: pPL, M_DiscountSchema_ID: lds });
    const sv = tw.insert('m_pricelist_version', { ...Object.fromEntries(Object.entries(vfields).map(([k, x]) => [k.toLowerCase(), x])), m_pricelist_id: sPPL, m_discountschema_id: sds });
    for (const [v, , , cost] of prices.slice(0, 2)) {
      const lp = await lrefId('m_product', 'Value', v), sp = sref('m_product', 'value', v);
      const ex = await ad.query(cfg, 'QueryMProductPrice', `M_PriceList_Version_ID=${lv} AND M_Product_ID=${lp}`);
      if (!ex.length) await lcreate('M_ProductPrice', { M_PriceList_Version_ID: lv, M_Product_ID: lp, PriceList: cost, PriceStd: cost, PriceLimit: cost });
      tw.insert('m_productprice', { m_pricelist_version_id: sv, m_product_id: sp, pricelist: cost, pricestd: cost, pricelimit: cost });
    }
    await compareStep('SD-05', ['m_pricelist', 'm_pricelist_version', 'm_productprice']);
  });
  log(`§SHOPDAY_SUMMARY ` + out.steps.map(s => `${s.id}=${s.verdict}`).join(' ') + (tw.unsupported.size ? `\n§SHOPDAY_UNSUPPORTED_DEFAULTS ${[...tw.unsupported].join(' ; ')}` : ''));
  return 0;
}
main().then(c => process.exit(c || 0)).catch(e => { log('§SHOPDAY_VERDICT INCONCLUSIVE FAULT ' + e.stack.slice(0, 400)); process.exit(2); });
