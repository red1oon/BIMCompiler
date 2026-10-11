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
const args = process.argv.slice(2), SKIP = (args.includes('--skip') ? args[args.indexOf('--skip') + 1] : '').split(',').filter(Boolean), ONLY = (args.includes('--only') ? args[args.indexOf('--only') + 1] : '').split(',').filter(Boolean);

// natural-key read types for resolving a reference on the legacy side (WS reads only)
const RT = { c_bp_group: 'QueryCBPGroup', c_taxcategory: 'QueryCTaxCategory', m_product_category: 'QueryMProductCategory', c_bank: 'QueryCBank', c_bpartner: 'QueryCBPartner', c_location: 'QueryCLocation',
  m_product: 'QueryMProduct', m_pricelist: 'QueryMPriceList', m_pricelist_version: 'QueryMPriceListVersion', c_tax: 'QueryCTax', m_discountschema: 'QueryMDiscountSchema', c_acctschema: 'QueryCAcctSchema', c_bankaccount: 'QueryCBankAccount', m_costelement: 'QueryMCostElement' };
const q = v => `'${String(v).replace(/'/g, "''")}'`;

async function restartPilot(probe) {
  const cp = require('child_process'); cp.spawnSync(process.env.HOME + '/idempiere-pilot/stop.sh', { stdio: 'ignore' }); cp.spawnSync('sleep', ['6']); cp.spawnSync(process.env.HOME + '/idempiere-pilot/start.sh', { stdio: 'ignore' });
  for (let i = 0; i < 60; i++) { const c = cp.spawnSync('curl', ['-s', '-o', '/dev/null', '-w', '%{http_code}', 'http://localhost:8088/webui/']).stdout.toString(); if (c === '200') break; cp.spawnSync('sleep', ['5']); }
  cp.spawnSync('sleep', ['10']);
  for (let i = 0; i < 40; i++) { try { await probe(); return; } catch (e) { cp.spawnSync('sleep', ['5']); } }   // WS bundle can lag the web UI: wait until a stock read answers
  throw new Error('pilot WS did not come back after restart');
}
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
  // id alignment (ids only, content comes from the template): legacy allocates each table's ids from that table's own sequence, so the new client's rows sit at a
  // constant per-table offset from the template client's. The twin mirrors it => master ids (products, taxes, accounts, ...) are EQUAL on both sides for every later step.
  const pkt = Object.entries(tpl.tables).map(([t, d]) => [t, d.cols.map(c => c.toLowerCase()).indexOf(t + '_id')]).filter(([, i]) => i >= 0);
  const lmin = Object.fromEntries(T.pg(pkt.map(([t]) => `select '${t}', min(${t}_id) from ${t} where ad_client_id=${ids.clientId}`).join(' union all ')).map(l => l.split('|')));
  const shifts = Object.fromEntries(pkt.map(([t, i]) => [t, +lmin[t] - Math.min(...tpl.tables[t].rows.map(r => +r[i]))]));
  const inst = T.instantiate(tpl, from, to, shifts);
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
    const sid = tw.insert(spec.t.toLowerCase(), sf, { pk: lid });   // twin mirrors the legacy id (ids EQUAL across sides)
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
  const run = async (id, fn) => { if (SKIP.includes(id)) return; if (ONLY.length && !ONLY.includes(id) && !(id === 'SD-07' && ONLY.some(o => /^SD-(08|09|10)$/.test(o))) && !(id === 'SD-12' && ONLY.some(o => /^SD-1[45]$/.test(o)))) return; try { await fn(); } catch (e) { log(`§SHOPDAY_STEP ${id} BLOCKED ${e.message.slice(0, 300)}`); out.steps.push({ id, verdict: 'BLOCKED' }); } };

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
      const lex = await ad.query(cfg, 'QueryCBPartnerLocation', `C_BPartner_ID=${bp.lid} AND Name=${q(addr)}`), lloc = lex.length ? +lex[0].C_BPartner_Location_ID : await lcreate('C_BPartner_Location', { C_BPartner_ID: bp.lid, C_Location_ID: lc.lid, Name: addr }), sloc = tw.insert('c_bpartner_location', { c_bpartner_id: bp.sid, c_location_id: lc.sid, name: addr }, { pk: lloc });
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
    // AutoPeriodControl='N' as well: with it on, MPeriod.isOpen (MPeriod.java:735-770) IGNORES C_PeriodControl and opens only [today-OpenHistory, today+OpenFuture] (2 days here), so a back-dated
    // sale into last month is refused and a period "close" has no effect (measured, run11: SD-21 'Period Closed' although the past period was opened by SD-01). A shop that opens and closes
    // periods runs the explicit period control; the MClient-cached schema is refreshed by the SD-04c restart.
    await lupdate('C_AcctSchema', asId, { CostingMethod: 'A', AutoPeriodControl: 'N' }); tw.db.prepare("UPDATE c_acctschema SET costingmethod='A', autoperiodcontrol='N' WHERE c_acctschema_id=?").run(sAs);
    await compareStep('SD-04a', ['m_costelement', 'c_acctschema'], 'Q5: costing method Average set through the WS (update_data C_AcctSchema)');
  });
  await run('SD-04', async () => {
    const P = (v, n, type, stocked) => ({ t: 'M_Product', key: ['Value', v], fields: { Value: v, Name: n, M_Product_Category_ID: { ref: ['m_product_category', 'Value', 'Standard'] }, C_UOM_ID: 100, C_TaxCategory_ID: { ref: ['c_taxcategory', 'Name', 'SD Taxed'] }, ProductType: type, IsStocked: stocked, IsSold: 'Y', IsPurchased: 'Y' } });
    await both(P('SD-GOOD1', 'SD Good One', 'I', 'Y')); await both(P('SD-GOOD2', 'SD Good Two', 'I', 'Y')); await both(P('SD-GOOD3', 'SD Good Three (no cost)', 'I', 'Y')); await both(P('SD-SERV1', 'SD Service One', 'S', 'N'));
    await compareStep('SD-04', ['m_product', 'm_product_acct', 'm_cost', 'ad_treenodepr']);
  });
  // SD-04b: Average PO has no cost record until the first costed event, and legacy REFUSES to post a receipt of a product without one ("Doc_InOut.createFacts: Resubmit - No
  // Costs", measured: the first P2P run, Posted=E). A shop sets the starting cost in the Product Costs window = a normal-user master write (M_Cost) -- done here through the WS.
  await run('SD-04b', async () => {
    const asId = await lrefId('c_acctschema', 'AD_Client_ID', ids.clientId), ceId = await lrefId('m_costelement', 'Name', 'Average PO');
    const sAs = tw.db.prepare('SELECT * FROM c_acctschema WHERE ad_client_id=?').get(tw.client), sCe = sref('m_costelement', 'name', 'Average PO');
    for (const [v, price] of [['SD-GOOD1', 60], ['SD-GOOD2', 30]]) {
      const lp = await lrefId('m_product', 'Value', v), sp = sref('m_product', 'value', v);
      const ex = await ad.query(cfg, 'QueryMCost', `M_Product_ID=${lp} AND M_CostElement_ID=${ceId}`);
      if (!ex.length) await lcreate('M_Cost', { M_Product_ID: lp, M_CostElement_ID: ceId, C_AcctSchema_ID: asId, M_CostType_ID: sAs.m_costtype_id, M_AttributeSetInstance_ID: 0, AD_Org_ID: 0, CurrentCostPrice: price, FutureCostPrice: price });
      tw.insert('m_cost', { m_product_id: sp, m_costelement_id: sCe, c_acctschema_id: sAs.c_acctschema_id, m_costtype_id: sAs.m_costtype_id, ad_org_id: 0, currentcostprice: price, futurecostprice: price });
    }
    await compareStep('SD-04b', ['m_cost'], 'starting average cost set in Product Costs (M_Cost) through the WS');
  });
  // SD-04c (§SHOPDAY-RUN-2 R2.1): MAcctSchema.getClientAcctSchema serves the posting schema from s_schema, a CCache keyed on AD_ClientInfo (MAcctSchema.java:189), which a
  // C_AcctSchema.CostingMethod update does NOT reset => the server keeps costing with the old method ('S', cost 0 => "No Costs", Posted=E) until it restarts. Measured: same PI
  // posts DR/CR 1800.00 after a restart. An operator restarts after a costing-method change; so does the harness (admin lane, no data change).
  await run('SD-04c', async () => { await restartPilot(() => ad.query(cfg, 'QueryCPeriod', 'C_Period_ID>0')); log('§SHOPDAY_ADMIN_LANE pilot restarted after the costing-method change (schema cache s_schema, MAcctSchema.java:189) -- no data written'); out.steps.push({ id: 'SD-04c', verdict: 'MATCH' }); });
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
    const sv = tw.insert('m_pricelist_version', { ...Object.fromEntries(Object.entries(vfields).map(([k, x]) => [k.toLowerCase(), x])), m_pricelist_id: sPPL, m_discountschema_id: sds }, { pk: lv });
    for (const [v, , , cost] of prices.slice(0, 2)) {
      const lp = await lrefId('m_product', 'Value', v), sp = sref('m_product', 'value', v);
      const ex = await ad.query(cfg, 'QueryMProductPrice', `M_PriceList_Version_ID=${lv} AND M_Product_ID=${lp}`);
      if (!ex.length) await lcreate('M_ProductPrice', { M_PriceList_Version_ID: lv, M_Product_ID: lp, PriceList: cost, PriceStd: cost, PriceLimit: cost });
      tw.insert('m_productprice', { m_pricelist_version_id: sv, m_product_id: sp, pricelist: cost, pricestd: cost, pricelimit: cost });
    }
    // an OLDER sales version (valid from 1 January): MSetup's own version starts on the client's creation day, so a sale dated in the open PAST period (SD-21) would die with
    // "Product is not on Price List" (measured, run10). The shop keeps last year's list version for exactly that.
    { const vO = { Name: 'Standard ' + TODAY.slice(0, 4) + '-01', ValidFrom: TODAY.slice(0, 4) + '-01-01 00:00:00' };
      let lo = await ad.query(cfg, 'QueryMPriceListVersion', `M_PriceList_ID=${salesPL} AND Name=${q(vO.Name)}`); lo = lo.length ? +lo[0].M_PriceList_Version_ID : await lcreate('M_PriceList_Version', { ...vO, M_PriceList_ID: salesPL, M_DiscountSchema_ID: lds });
      const so = tw.insert('m_pricelist_version', { name: vO.Name, validfrom: vO.ValidFrom, m_pricelist_id: sSalesPL, m_discountschema_id: sds }, { pk: lo });
      for (const [v, pl_, ps, lim] of prices) { const lp = await lrefId('m_product', 'Value', v), sp = sref('m_product', 'value', v);
        if (!(await ad.query(cfg, 'QueryMProductPrice', `M_PriceList_Version_ID=${lo} AND M_Product_ID=${lp}`)).length) await lcreate('M_ProductPrice', { M_PriceList_Version_ID: lo, M_Product_ID: lp, PriceList: pl_, PriceStd: ps, PriceLimit: lim });
        tw.insert('m_productprice', { m_pricelist_version_id: so, m_product_id: sp, pricelist: pl_, pricestd: ps, pricelimit: lim }); } }
    await compareStep('SD-05', ['m_pricelist', 'm_pricelist_version', 'm_productprice']);
    // ids EQUAL across sides (so later document keys need no id translation): products, taxes, accounts, partners, price list versions
    const chk = [['m_product', 'value', 'SD-GOOD1'], ['m_product', 'value', 'SD-SERV1'], ['c_tax', 'name', 'SD 10%'], ['c_bpartner', 'value', 'SD-CUST1'], ['c_bankaccount', 'accountno', 'SD-001'], ['c_elementvalue', 'value', 'C_RECEIVABLE'], ['c_acctschema', 'name', `${F.client.name} UN/38 US Dollar`]];
    const bad = []; for (const [t, c, v] of chk) { const l = +T.pg(`select ${t}_id from ${t} where ad_client_id=${ids.clientId} and ${c}='${v}'`)[0], x = tw.db.prepare(`SELECT ${t}_id id FROM ${t} WHERE ${c}=? AND ad_client_id=?`).get(v, tw.client); if (!x || x.id !== l) bad.push(`${t}.${v}: legacy=${l} sqlite=${x && x.id}`); }
    log(`§SHOPDAY_IDS_ALIGNED ${bad.length ? 'FAIL ' + bad.join(' ; ') : 'OK ' + chk.length + ' keys equal'}`);
  });
  // SD-05b: a customer's sales price list is read from the partner (MOrder takes it from the BP / its group; legacy NPEs "pl is null" on the first order otherwise -- measured).
  // MSetup leaves the BP group without price lists, so the shop assigns them on its partners (normal-user master update).
  await run('SD-05b', async () => {
    const sPL = await lrefId('m_pricelist', 'Name', 'Standard'), pPL = await lrefId('m_pricelist', 'Name', 'SD Purchase'), sS = sref('m_pricelist', 'name', 'Standard'), sP = sref('m_pricelist', 'name', 'SD Purchase');
    for (const [v, f_, sf_] of [['SD-CUST1', { M_PriceList_ID: sPL }, { m_pricelist_id: sS }], ['SD-CUST2', { M_PriceList_ID: sPL }, { m_pricelist_id: sS }], ['SD-VEND1', { PO_PriceList_ID: pPL }, { po_pricelist_id: sP }]]) {
      await lupdate('C_BPartner', await lrefId('c_bpartner', 'Value', v), f_);
      tw.db.prepare(`UPDATE c_bpartner SET ${Object.keys(sf_)[0]}=? WHERE value=? AND ad_client_id=?`).run(Object.values(sf_)[0], v, tw.client);
    }
    await compareStep('SD-05b', ['c_bpartner'], 'partners get their price lists');
  });
  // ================= document steps: the existing chained cycles (cycle_o2c / cycle_p2p) and the model scenarios re-hosted on the shop twin (shop_env.js) =================
  const R = require('./reconcile');
  let X = null;
  const docEnv = () => {
    if (X) return X;
    const C = require('./client_ctx').ctx, g1 = (t, c, v) => +T.pg(`select ${t}_id from ${t} where ad_client_id=${ids.clientId} and ${c}='${String(v).replace(/'/g, "''")}'`)[0];
    const dt = n => g1('c_doctype', 'name', n), bpl = bpId => +T.pg(`select c_bpartner_location_id from c_bpartner_location where c_bpartner_id=${bpId} order by 1 limit 1`)[0];
    Object.assign(C, { clientName: F.client.name, client: ids.clientId, org: ids.orgId, org2: ids.orgId, role: ids.adminRoleId, user: userId, wh: ids.whId, wh2: ids.whId, locator: g1('m_locator', 'value', 'Standard'),
      customer: g1('c_bpartner', 'value', 'SD-CUST1'), customer2: g1('c_bpartner', 'value', 'SD-CUST2'), vendor: g1('c_bpartner', 'value', 'SD-VEND1'), customerStd: g1('c_bpartner', 'value', 'Standard'),
      prod: { oak: g1('m_product', 'value', 'SD-GOOD1'), mulch: g1('m_product', 'value', 'SD-GOOD1'), rake: g1('m_product', 'value', 'SD-GOOD2'), weeder: g1('m_product', 'value', 'SD-GOOD2'), azalea: g1('m_product', 'value', 'SD-GOOD2'), fertilizer: g1('m_product', 'value', 'SD-GOOD2'), patioSet: g1('m_product', 'value', 'SD-GOOD2'), standard: g1('m_product', 'value', 'Standard'), nocost: g1('m_product', 'value', 'SD-GOOD3') },
      dt: { std: dt('Standard Order'), pos: dt('POS Order'), po: dt('Purchase Order'), mmReceipt: dt('MM Receipt'), mmShipment: dt('MM Shipment'), arInvoice: dt('AR Invoice'), arReceipt: dt('AR Receipt'), apPayment: dt('AP Payment'), requisition: dt('Purchase Requisition'), movement: dt('Material Movement'), physInv: dt('Physical Inventory'), glJournal: dt('GL Journal'), apInvoice: dt('AP Invoice') },
      pl: { sales: g1('m_pricelist', 'name', 'Standard'), purchase: g1('m_pricelist', 'name', 'SD Purchase') }, costElement: { avgPO: g1('m_costelement', 'name', 'Average PO') },
      schema: { primary: tw.db.prepare('SELECT c_acctschema_id id FROM c_acctschema WHERE ad_client_id=?').get(tw.client).id, second: tw.db.prepare('SELECT c_acctschema_id id FROM c_acctschema WHERE ad_client_id=?').get(tw.client).id },
      cur: F.client.currencyId, curSecond: F.client.currencyId, bank: g1('c_bankaccount', 'accountno', 'SD-001'), cashbook: g1('c_cashbook', 'name', 'Standard') });
    C.customerLoc = bpl(C.customer); C.customer2Loc = bpl(C.customer2); C.vendorLoc = bpl(C.vendor);
    X = require('./shop_env').buildX({ tw, cfg, ids, C, log, TODAY }); X.C = C;
    return X;
  };
  const rrun = async (id, scenarios, spec) => { const rows = await R.run(scenarios, spec, [], { log }); const bad = rows.filter(r => r.verdict !== 'MATCH'); const v = rows.length === 0 ? 'INCONCLUSIVE' : bad.length ? (bad.some(r => r.verdict === 'ERROR') ? 'BLOCKED' : 'DIFF') : 'MATCH';
    log(`§SHOPDAY_STEP ${id} ${v} scenarios=${rows.length} match=${rows.length - bad.length} gaps=${bad.map(r => r.id + ':' + r.verdict).join(',') || '-'}`); out.steps.push({ id, verdict: v }); return rows; };
  // ---- steps 11..24 (shopday_more.js): same facts to both sides, judged by reconcile keys ----
  const MORE = require('./shopday_more')({ docEnv, rrun, R, log, out, TODAY, tw, cfg, ids, ad, T, F, compareStep, lrefId, lfind, lcreate, lupdate, sref, run });
  await run('SD-13a', MORE.sd13a);
  MORE.installRecorder();
  // --- SD-06 opening stock: physical inventory (count > book 0) at the default locator, same descriptor/verbs as the PI1 model scenario (m3 §59), re-hosted on the twin ---
  const runPI = async (stepId, scenId, mkLines, iidP) => {
    const x = docEnv(), C = x.C, { E, DP, lc: lc_, cents } = x;
    const PI_DESC = { pi: { composite: 'SyncOrder',
      header: { serviceType: 'BridgeCreateInventory', table: 'M_Inventory', fields: { AD_Org_ID: { const: C.org }, C_DocType_ID: { const: C.dt.physInv }, M_Warehouse_ID: { const: C.wh }, MovementDate: { path: 'date' }, Description: { path: 'note' } } },
      lines: { serviceType: 'BridgeCreateInventoryLine', table: 'M_InventoryLine', parent: 'M_Inventory_ID', from: 'lines', lineNo: { col: 'Line', step: 10 },
        fields: { AD_Org_ID: { const: C.org }, AD_Client_ID: { const: C.client }, M_Locator_ID: { path: 'loc' }, M_Product_ID: { path: 'product' }, QtyBook: { path: 'book' }, QtyCount: { path: 'count' }, InventoryType: { const: 'D' } } },
      docAction: { serviceType: 'BridgeCompleteInventory', table: 'M_Inventory', action: 'CO' } } };
    let link = null; const deltaStr = (ps, before, now) => JSON.stringify(Object.fromEntries(ps.map(p => [p, now(p) - before[p]]).filter(x => x[1])));
    const legacy = async f => {
      if (!link) { let bytes = null; link = await x.createLink({ cfg, persistence: { load: () => bytes, save: b => { bytes = Uint8Array.from(b); } }, descriptors: PI_DESC }); }
      const before = {}; for (const l of f.lines) before[l.product + '@' + l.loc] = await x.locStock(l.product, l.loc);
      const cq0 = {}; for (const l of f.lines) cq0[l.product] = await x.legacyCostQty(l.product);
      const uid = link.submit('pi', { date: TODAY + ' 00:00:00', note: 'SD ' + f.id, lines: f.lines }); await link.drain(); const st = link.store.get(uid);
      if (st.state !== 'CONFIRMED') return { outcome: 'REJECTED', reason: (st.error || '').slice(0, 160) };
      const id = link.store.idmap(uid).find(y => y.tbl === 'M_Inventory').server_id; global.__sdPI = id;
      const h = (await ad.query(cfg, 'QueryMInventory', `M_Inventory_ID=${id}`))[0], ls = await ad.query(cfg, 'QueryMInventoryLine', `M_Inventory_ID=${id}`);
      for (let i = 0; i < 8 && !['Y', 'E'].includes(h.Posted); i++) { await new Promise(r => setTimeout(r, 1500)); h.Posted = (await ad.query(cfg, 'QueryMInventory', `M_Inventory_ID=${id}`))[0].Posted; }
      const stock = {}; for (const k of Object.keys(before)) { const [p, loc] = k.split('@'); const d = (await x.locStock(+p, +loc)) - before[k]; if (d) stock[k] = d; }
      const cq = {}; for (const p of Object.keys(cq0)) cq[p] = await x.legacyCostQty(+p);
      return { outcome: 'COMPLETED', docstatus: h.DocStatus, lines: ls.map(l => `${l.M_Product_ID}:${Number(l.QtyBook)}:${Number(l.QtyCount)}`).sort().join('|'), stock_delta: JSON.stringify(stock),
        postings: h.Posted === 'E' ? 'REFUSED:Posted=E' : await x.legacyFactsOf(321, id, x.SCHEMA), postings_euro: h.Posted === 'E' ? 'REFUSED:Posted=E' : await x.legacyFactsOf(321, id, x.SCHEMA2), cost_qty_delta: deltaStr(Object.keys(cq0), cq0, p => cq[p]) };
    };
    const local = async f => {
      const iid = iidP, lines = f.lines.map((l, i) => ({ m_inventoryline_id: iid * 100 + i, m_locator_id: l.loc, m_product_id: l.product, qtybook: l.book, qtycount: l.count }));
      const cq0 = {}; for (const l of f.lines) cq0[l.product] = x.localCostQty(l.product);
      const r = E.completeInventory({ m_inventory_id: iid, docsubtypeinv: 'PI' }, lines); if (!r.ok) return { outcome: 'REJECTED', reason: r.reason };
      const status = (r.ops.filter(o => o.op_type === 'SET_STATUS').pop() || {}).doc_status, stock = {};
      r.ops.filter(o => o.op_type === 'MOVE_STOCK').forEach(o => { const k = o.m_product_id + '@' + o.m_locator_id; stock[k] = (stock[k] || 0) + Number(o.qty); }); Object.keys(stock).forEach(k => { if (!stock[k]) delete stock[k]; });
      tw.db.prepare('INSERT INTO m_inventory(m_inventory_id,m_warehouse_id,docstatus,c_doctype_id,movementdate,ad_client_id,ad_org_id,dateacct) VALUES(?,?,?,?,?,?,?,?)').run(iid, C.wh, status, C.dt.physInv, TODAY + ' 00:00:00', tw.client, C.org, TODAY + ' 00:00:00');
      for (const l of lines) tw.db.prepare('INSERT INTO m_inventoryline(m_inventoryline_id,m_inventory_id,m_locator_id,m_product_id,qtybook,qtycount,isactive) VALUES(?,?,?,?,?,?,?)').run(l.m_inventoryline_id, iid, l.m_locator_id, l.m_product_id, l.qtybook, l.qtycount, 'Y');
      const fold = sc => { const d = DP.derivePostings(tw.db, { table: 'M_Inventory', id: iid }, sc); return d.absent && d.absent.length ? (d.absent.every(a => /^\{Product\.NoCosts\}/.test(a)) ? 'REFUSED:Posted=E' : 'ABSENT:' + d.absent.join(',')) : (d.lines.length ? x.fmtPostings(d.lines) : 'none'); };   // {Product.NoCosts} = Doc_Inventory.createFacts:332 "No Costs for" => Posted=E
      const res = { outcome: 'COMPLETED', docstatus: status, lines: lines.map(l => `${l.m_product_id}:${l.qtybook}:${l.qtycount}`).sort().join('|'), stock_delta: JSON.stringify(stock), postings: fold(x.SCHEMA), postings_euro: fold(x.SCHEMA2) };
      if (typeof DP.costQtyUpdatesFor === 'function') for (const u of DP.costQtyUpdatesFor(tw.db, 'M_Inventory', iid)) DP.applyCostUpdate(tw.db, u, TODAY);
      res.cost_qty_delta = deltaStr(Object.keys(cq0), cq0, p => x.localCostQty(+p)); return res;
    };
    await rrun(stepId, [{ id: scenId, facts: { id: stepId, lines: await mkLines(C, x) }, legacy, local }],
      { keys: ['outcome', 'docstatus', 'lines', 'stock_delta', 'postings', 'postings_euro', 'cost_qty_delta'], notCompared: {} });
  };
  await run('SD-06', () => runPI('SD-06', 'SD06-opening-stock', C => [{ product: C.prod.mulch, loc: C.locator, book: 0, count: 20 }, { product: C.prod.rake, loc: C.locator, book: 0, count: 20 }], 3000010));
  // SD-06z (§SHOPDAY-RUN-2 R2.1): opening stock of a stocked product that has NO cost => legacy Doc_Inventory.createFacts:300-335 "No Costs", Posted=E, no cost detail (cost qty unchanged)
  await run('SD-06z', () => runPI('SD-06z', 'SD06z-opening-stock-no-cost', C => [{ product: C.prod.nocost, loc: C.locator, book: 0, count: 5 }], 3000020));
  // --- P2P: SD-07 PO, SD-08 receipt, SD-09 vendor invoice, SD-10 AP payment ---
  await run('SD-07', async () => {
    const x = docEnv(); x.product = x.C.prod.rake; x.qty = 10; x.price = 30; x.idBase = 91000;
    const P2P = require('./cycle_p2p')(x); out.P2P = P2P;
    const names = { PO: 'SD-07', RCPT: 'SD-08', INV: 'SD-09', PAY: 'SD-10' };
    for (const [i, st] of P2P.STEPS.entries()) await rrun(names[st], [P2P.scenario(st, i)], { keys: P2P.KEYS[st], notCompared: {} });
  });
  await run('SD-11', MORE.sd11);
  // --- SD-12z (§SHOPDAY-RUN-2 R2.4, G-SD6): the first order of the fresh client WITHOUT an explicit price list. MSetup's only sales list ('Standard') has IsSOPriceList='N', so
  // MOrder.beforeSave:1282-1291 finds no SO price list, DB.getSQLValueEx returns -1, setM_PriceList_ID(-1) NPEs (MOrder.java:910-911) => the save is refused. SQLite must refuse too. ---
  await run('SD-12z', async () => {
    const x = docEnv(); x.idBase = 94000; x.soPriceList = undefined;
    const O2C = require('./cycle_o2c')(x);
    const rows = await R.run([{ ...O2C.scenario('SO', 0), id: 'O2C-NOPL-SO' }], { keys: ['outcome'], notCompared: {} }, [], { log });
    const r = rows[0] || {}, lg = r.legacy || {}, sq = r.sqlite || r.local || {};
    log(`§SHOPDAY_OUTCOME SD-12z legacy=${JSON.stringify(lg).slice(0, 260)} sqlite=${JSON.stringify(sq).slice(0, 260)}`);
    const vacuous = lg.outcome !== 'REJECTED' && sq.outcome !== 'REJECTED';   // both completing would prove nothing about the refusal
    const reasonOk = sq.outcome !== 'REJECTED' || /price ?list/i.test(sq.reason || '');   // clearer message allowed; a refusal for an unrelated reason is not this rule
    const v = r.verdict === 'MATCH' && lg.outcome === 'REJECTED' && reasonOk ? 'MATCH' : vacuous ? 'INCONCLUSIVE' : 'DIFF';
    log(`§SHOPDAY_STEP SD-12z ${v} legacy=${lg.outcome} sqlite=${sq.outcome} reason_is_pricelist=${reasonOk}`); out.steps.push({ id: 'SD-12z', verdict: v });
  });
  // --- O2C: SD-12 credit sale on account (order -> shipment -> invoice), SD-14 receipt, SD-15 reversals (invoice, shipment) ---
  await run('SD-12', async () => {
    const x = docEnv(); x.idBase = 95000; x.soPriceList = process.env.SHOPDAY_NO_SO_PL ? undefined : x.C.pl.sales;   // legacy NPEs on a new client's first order without an explicit price list (G-SD6; ws_shopday_orderpl.sql allows the column)
    const O2C = require('./cycle_o2c')(x);
    const grp = { SO: 'SD-12', SHIP: 'SD-12', INV: 'SD-12', PAY: 'SD-14', 'RC-INV': 'SD-15', 'RC-SHIP': 'SD-15' }, acc = {};
    for (const [i, st] of O2C.STEPS.entries()) { const rows = await R.run([O2C.scenario(st, i)], { keys: O2C.KEYS[st], notCompared: {} }, [], { log }); for (const r of rows) if (process.env.SHOPDAY_VERBOSE) log(`§SHOPDAY_OUTCOME ${r.id} legacy=${JSON.stringify(r.legacy).slice(0, 300)} sqlite=${JSON.stringify(r.sqlite || r.local).slice(0, 300)}`); for (const r of rows) if (r.verdict !== 'MATCH' && r.legacy && r.legacy.outcome !== 'COMPLETED') log(`§SHOPDAY_LEGACY_RESULT ${r.id} ${JSON.stringify(r.legacy).slice(0, 400)}`); (acc[grp[st]] = acc[grp[st]] || []).push(...rows); }
    out.o2cRows = Object.values(acc).flat();
    for (const [id, rows] of Object.entries(acc)) { const bad = rows.filter(r => r.verdict !== 'MATCH'); const v = bad.length ? (bad.some(r => r.verdict === 'ERROR') ? 'BLOCKED' : 'DIFF') : 'MATCH';
      log(`§SHOPDAY_STEP ${id} ${v} scenarios=${rows.length} match=${rows.length - bad.length} gaps=${bad.map(r => r.id + ':' + r.verdict).join(',') || '-'}`); out.steps.push({ id, verdict: v }); }
  });
  await run('SD-13', MORE.sd13);
  // SD-18 end-of-day count: a loss on one product and a gain on another against the BOOK quantity both sides read (legacy QueryStorage), Physical Inventory = Doc_Inventory I+/I-
  await run('SD-17', MORE.sd17);
  await run('SD-18', () => runPI('SD-18', 'SD18-count-loss-gain', async (C, x) => { const b1 = await x.locStock(C.prod.mulch, C.locator), b2 = await x.locStock(C.prod.rake, C.locator);
    log(`§SHOPDAY_LEGACY SD-18 book qty: product ${C.prod.mulch}=${b1} product ${C.prod.rake}=${b2}`); return [{ product: C.prod.mulch, loc: C.locator, book: b1, count: b1 - 2 }, { product: C.prod.rake, loc: C.locator, book: b2, count: b2 + 3 }]; }, 3000030));
  await run('SD-19', MORE.sd19);
  await run('SD-20', MORE.sd20);
  await run('SD-21', MORE.sd21);
  await run('SD-22', MORE.sd22);
  await run('SD-23', MORE.sd23);
  await run('SD-24', MORE.sd24);
  // --- NEGATIVE CONTROL (the m3 pattern): a SECOND order chain whose SQLite invoice price is +1 cent must differ from the control chain (SD-12) at the invoice step in price-bearing keys
  // (lines, totals, tax, books, open item) (extra keys the control chain lacks). Control = the SD-12 chain. ---
  await run('SD-NEGPOS', MORE.sd11neg);
  await run('SD-NEG', async () => {
    if (!out.o2cRows) throw new Error('no control chain (SD-12 did not run)');
    const x = { ...docEnv(), idBase: 98000, mut: 1, log: () => {} }; const N = require('./cycle_o2c')(x), ctl = id => (out.o2cRows.find(r => r.id === id) || { gaps: [] }).gaps.map(g => g.key);
    const res = {};
    for (const [i, st] of ['SO', 'SHIP', 'INV'].entries()) { const rows = await R.run([{ ...N.scenario(st, i), id: 'NEG-sd-' + st }], { keys: N.KEYS[st], notCompared: {} }, [], { log: () => {} }); res[st] = rows[0] ? rows[0].gaps.map(g => g.key) : null; }
    const extra = st => (res[st] || []).filter(k => !ctl('O2C' + ({ SO: 1, SHIP: 2, INV: 3 })[st] + '-' + st).includes(k));
    const priced = extra('INV').filter(k => /inv_lines|grand_total|invoice_tax|books/.test(k)), before = [...extra('SO'), ...extra('SHIP')];
    out.neg = priced.length > 0;   // extras BEFORE the invoice are state drift of a second chain on the same stock (listed, not required to be empty)
    log(`§SHOPDAY_NEG ${out.neg ? 'PASS' : 'FAIL'} SQLite invoice +1 cent: extra gap keys at INV=[${extra('INV').join(',')}] (price-bearing: [${priced.join(',')}]); extra before INV=[${before.join(',')}]`);
  });
  const NOT_RUN_WHY = { 'SD-16': 'M_RMA is not covered (COVERAGE_NOT_COVERED): no WS type, descriptor or SQLite verb for a customer return / RMA document -- blocked, not trivial' };
  const PLAN = ['SD-00', 'SD-01', 'SD-02', 'SD-03', 'SD-04', 'SD-05', 'SD-06', 'SD-07', 'SD-08', 'SD-09', 'SD-10', 'SD-11', 'SD-12', 'SD-13', 'SD-14', 'SD-15', 'SD-16', 'SD-17', 'SD-18', 'SD-19', 'SD-20', 'SD-21', 'SD-22', 'SD-23', 'SD-24'];
  const worst = ids2 => { const vs = out.steps.filter(s => ids2.includes(s.id)).map(s => s.verdict); return !vs.length ? 'NOT_RUN' : vs.includes('BLOCKED') ? 'BLOCKED' : vs.includes('DIFF') ? 'DIFF' : vs.includes('INCONCLUSIVE') ? 'INCONCLUSIVE' : 'MATCH'; };
  const fold = { 'SD-04': ['SD-04a', 'SD-04', 'SD-04b', 'SD-04c'], 'SD-06': ['SD-06', 'SD-06z'], 'SD-12': ['SD-12', 'SD-12z'], 'SD-13': ['SD-13a', 'SD-13'], 'SD-22': ['SD-22a', 'SD-22'] }, per = Object.fromEntries(PLAN.map(id => [id, worst(fold[id] || [id])]));
  const cnt = v => PLAN.filter(id => per[id] === v).length;
  log(`§SHOPDAY_COVERAGE steps_match=${cnt('MATCH')} of ${PLAN.length} diff=${cnt('DIFF')} blocked=${cnt('BLOCKED')} inconclusive=${cnt('INCONCLUSIVE')} not_run=${cnt('NOT_RUN')} :: ${PLAN.map(id => id + '=' + per[id]).join(' ')}`);
  for (const id of PLAN) if (per[id] === 'NOT_RUN' && NOT_RUN_WHY[id]) log(`§SHOPDAY_NOT_RUN ${id} ${NOT_RUN_WHY[id]}`);
  const judged = PLAN.length - cnt('NOT_RUN');
  log(`§SHOPDAY_VERDICT ${(out.neg === false || out.posNeg === false || out.tbNeg === false) ? 'HARNESS-FAIL' : judged === 0 ? 'INCONCLUSIVE' : (cnt('DIFF') || cnt('BLOCKED') || cnt('INCONCLUSIVE')) ? 'DIFF' : (cnt('NOT_RUN') ? 'PARTIAL' : 'PASS')} judged=${judged} of ${PLAN.length} negative_control=${out.neg === true ? 'PASS' : out.neg === false ? 'FAIL' : 'NOT_RUN'} neg_pos=${out.posNeg === true ? 'PASS' : out.posNeg === false ? 'FAIL' : 'NOT_RUN'} neg_tb=${out.tbNeg === true ? 'PASS' : out.tbNeg === false ? 'FAIL' : 'NOT_RUN'}`);
  log(`§SHOPDAY_SUMMARY ` + out.steps.map(s => `${s.id}=${s.verdict}`).join(' ') + (tw.unsupported.size ? `\n§SHOPDAY_UNSUPPORTED_DEFAULTS ${[...tw.unsupported].join(' ; ')}` : ''));
  return 0;
}
main().then(c => process.exit(c || 0)).catch(e => { log('§SHOPDAY_VERDICT INCONCLUSIVE FAULT ' + e.stack.slice(0, 400)); process.exit(2); });
