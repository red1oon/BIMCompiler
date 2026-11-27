// §NC-4 legacy measurement (prompts/ERP_DEPTH_FILM.md §NC-4): MAcctSchema.beforeSave (MAcctSchema.java:711-742) + checkCosting (:577-600) on the LOCAL pilot via the WS.
// A: new schema typed with Org=11 (must be forced to 0), IsDiscountCorrectsTax=Y (TaxCorrectionType default), CostingMethod A (Cost Type + Material Cost Element side effects).
// B: StartDate after EndDate. C: CostingLevel change on schema 101 (cost details exist). Writes out/nc4_legacy.json. READ the §NC4L lines.
'use strict';
const ad = require('./ad_client'), { execFileSync } = require('child_process'), fs = require('fs'), path = require('path');
const cfg = ad.cfgFromEnv(), log = s => console.log(s), tag = Date.now().toString(36).slice(-4);
const pg = sql => execFileSync('docker', ['exec', 'postgres', 'psql', '-U', 'postgres', '-d', 'idempiere_pilot', '-tAF', '|', '-c', 'set search_path=adempiere;' + sql], { encoding: 'utf8' }).trim().split('\n').filter(l => l && l !== 'SET').map(l => l.split('|'));
const f = o => ({ field: Object.entries(o).map(([k, v]) => ({ '@column': k, val: String(v) })) });
const create = (t, o) => ad.call(cfg, 'create_data', { ModelCRUD: { serviceType: 'Bridge_createData_' + t, TableName: t, RecordID: 0, Action: 'Create', DataRow: f(o) } }).then(j => +j.StandardResponse['@RecordID']);
const update = (t, id, o) => ad.call(cfg, 'update_data', { ModelCRUD: { serviceType: 'Bridge_updateData_' + t, TableName: t, RecordID: id, Action: 'Update', DataRow: f(o) } });
(async () => {
  const out = { tag, cases: {} };
  const ceBefore = +pg("select count(*) from m_costelement where ad_client_id=11")[0][0], ctBefore = +pg("select count(*) from m_costtype where ad_client_id=11")[0][0];
  const base = { AD_Org_ID: 11, GAAP: 'UN', C_Currency_ID: 100, Separator: '-', IsDiscountCorrectsTax: 'Y' };
  const name = `NC4-A-${tag}`;
  const id = await create('C_AcctSchema', { ...base, Name: name, CostingMethod: 'A' });
  const row = pg(`select ad_org_id, taxcorrectiontype, costinglevel, gaap, costingmethod, m_costtype_id, isdiscountcorrectstax from c_acctschema where c_acctschema_id=${id}`)[0];
  const ct = pg(`select name, ad_org_id from m_costtype where m_costtype_id=${row[5]}`)[0];
  const ceAfter = +pg("select count(*) from m_costelement where ad_client_id=11")[0][0], ctAfter = +pg("select count(*) from m_costtype where ad_client_id=11")[0][0];
  const ces = pg("select name, costelementtype, costingmethod, ad_org_id from m_costelement where ad_client_id=11 and costingmethod='A' order by m_costelement_id");
  out.cases.A = { org: row[0], taxcorrectiontype: row[1], costinglevel: row[2], gaap: row[3], costingmethod: row[4], costtypeName: ct[0], costtypeOrg: ct[1], costtypeIsSchemaName: ct[0] === name, newCostTypes: ctAfter - ctBefore, newCostElements: ceAfter - ceBefore, avgElements: ces };
  log(`§NC4L A org=${row[0]} taxcorrectiontype=${row[1]} costinglevel=${row[2]} gaap=${row[3]} costtype="${ct[0]}"(org ${ct[1]}) new_costtypes=${ctAfter - ctBefore} new_costelements=${ceAfter - ceBefore} avg_elements=${JSON.stringify(ces)}`);
  // A2: discount-correct N -> TaxCorrectionType 'N'
  const id2 = await create('C_AcctSchema', { ...base, IsDiscountCorrectsTax: 'N', Name: `NC4-A2-${tag}`, CostingMethod: 'S' });
  out.cases.A2 = { taxcorrectiontype: pg(`select taxcorrectiontype from c_acctschema where c_acctschema_id=${id2}`)[0][0] }; log(`§NC4L A2 taxcorrectiontype=${out.cases.A2.taxcorrectiontype}`);
  // B: dates
  let b; try { await create('C_AcctSchema', { ...base, Name: `NC4-B-${tag}`, CostingMethod: 'S', StartDate: '2030-12-31 00:00:00', EndDate: '2030-01-01 00:00:00' }); b = { ok: true }; } catch (e) { b = { ok: false, err: String(e.message).replace(/\s+/g, ' ').slice(0, 200) }; }
  out.cases.B = b; log(`§NC4L B ok=${b.ok} ${b.err || ''}`);
  // C: costing level change on schema 101
  const lvl0 = pg('select costinglevel from c_acctschema where c_acctschema_id=101')[0][0]; let c;
  try { await update('C_AcctSchema', 101, { CostingLevel: lvl0 === 'O' ? 'C' : 'O' }); c = { ok: true }; } catch (e) { c = { ok: false, err: String(e.message).replace(/\s+/g, ' ').slice(0, 260) }; }
  const lvl1 = pg('select costinglevel from c_acctschema where c_acctschema_id=101')[0][0];
  if (lvl1 !== lvl0) { await update('C_AcctSchema', 101, { CostingLevel: lvl0 }); c.reverted = true; }
  out.cases.C = { ...c, before: lvl0, after: lvl1 }; log(`§NC4L C ok=${c.ok} level ${lvl0}->${lvl1} ${c.err || ''}`);
  fs.mkdirSync(path.join(__dirname, 'out'), { recursive: true }); fs.writeFileSync(path.join(__dirname, 'out', 'nc4_legacy.json'), JSON.stringify(out, null, 1)); log('§NC4L DONE');
})().catch(e => { console.log('§NC4L CRASH ' + (e.stack || e)); process.exit(2); });
