// §NC-8 legacy probe: MOrg.afterSave (MOrg.java new-org block) on the LOCAL pilot via the WS - a new Organization gets an AD_OrgInfo (DUNS '?', TaxID '?'),
// AD_Role_OrgAccess for every non-manual role of the client, and a node in the Organization tree. Throwaway org NC8-*, removed after. Writes out/nc8_legacy.json.
'use strict';
const ad = require('./ad_client'), { execFileSync } = require('child_process'), fs = require('fs'), path = require('path');
const cfg = ad.cfgFromEnv(), log = s => console.log(s), tag = Date.now().toString(36).slice(-4);
const pg = sql => execFileSync('docker', ['exec', '-i', 'postgres', 'psql', '-U', 'postgres', '-d', 'idempiere_pilot', '-tAF', '|', '-v', 'ON_ERROR_STOP=1', '-c', 'set search_path=adempiere;' + sql], { encoding: 'utf8' }).trim().split('\n').filter(l => l && l !== 'SET' && !/^(NOTICE|DELETE|INSERT)/.test(l)).map(l => l.split('|'));
const f = o => ({ field: Object.entries(o).map(([k, v]) => ({ '@column': k, val: String(v) })) });
(async () => {
  const out = { tag };
  const roles = pg("select ad_role_id from ad_role where ad_client_id=11 and ismanual='N' and isactive='Y' order by 1").map(r => +r[0]);
  const name = `NC8-ORG-${tag}`;
  const j = await ad.call(cfg, 'create_data', { ModelCRUD: { serviceType: 'Bridge_createData_AD_Org', TableName: 'AD_Org', RecordID: 0, Action: 'Create', DataRow: f({ AD_Org_ID: 0, Value: 'NC8' + tag, Name: name, IsSummary: 'N' }) } });
  const id = +j.StandardResponse['@RecordID'];
  const info = pg(`select duns,taxid,m_warehouse_id,ad_orgtype_id,c_calendar_id,parent_org_id from ad_orginfo where ad_org_id=${id}`)[0] || null;
  const ra = pg(`select ad_role_id,isreadonly from ad_role_orgaccess where ad_org_id=${id} order by 1`).map(r => ({ role: +r[0], ro: r[1] }));
  const tn = pg(`select ad_tree_id,parent_id,seqno from ad_treenode where node_id=${id} and ad_tree_id=104`)[0] || null;
  out.org = { id, name, nonManualRoles: roles, info: info && { duns: info[0], taxid: info[1], warehouse: info[2], orgtype: info[3], calendar: info[4], parent: info[5] }, roleAccess: ra, treeNode: tn && { tree: +tn[0], parent: +tn[1], seq: +tn[2] } };
  log('§NC8L org=' + id + ' info=' + JSON.stringify(out.org.info) + ' roleAccess=' + JSON.stringify(ra) + ' nonManualRoles=' + JSON.stringify(roles) + ' treeNode=' + JSON.stringify(out.org.treeNode));
  // cleanup
  pg(`delete from ad_treenode where node_id=${id} and ad_tree_id=104; delete from ad_role_orgaccess where ad_org_id=${id}; delete from ad_orginfo where ad_org_id=${id}; delete from ad_org where ad_org_id=${id}`);
  fs.mkdirSync(path.join(__dirname, 'out'), { recursive: true }); fs.writeFileSync(path.join(__dirname, 'out', 'nc8_legacy.json'), JSON.stringify(out, null, 1)); log('§NC8L DONE (throwaway org removed)');
})().catch(e => { console.log('§NC8L CRASH ' + (e.stack || e)); process.exit(2); });
