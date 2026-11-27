// §NC-9 legacy probe: MRole.afterSave for a NEW role (MRole.java:480-505 + updateAccessRecords :529-640) on the LOCAL pilot via the WS. A role of each UserLevel is created
// (throwaway NC9-*), the access rows it received are COUNTED per access table plus the windows it can open; role + rows removed after. Writes out/nc9_legacy.json.
'use strict';
const ad = require('./ad_client'), { execFileSync } = require('child_process'), fs = require('fs'), path = require('path');
const cfg = ad.cfgFromEnv(), log = s => console.log(s), tag = Date.now().toString(36).slice(-4);
const pg = sql => execFileSync('docker', ['exec', '-i', 'postgres', 'psql', '-U', 'postgres', '-d', 'idempiere_pilot', '-tAF', '|', '-v', 'ON_ERROR_STOP=1', '-c', 'set search_path=adempiere;' + sql], { encoding: 'utf8' }).trim().split('\n').filter(l => l && l !== 'SET' && !/^(NOTICE|DELETE|INSERT)/.test(l)).map(l => l.split('|'));
const f = o => ({ field: Object.entries(o).map(([k, v]) => ({ '@column': k, val: String(v) })) });
const LEVELS = { CO: ' CO', C: ' C ', O: '  O' };   // AD_Ref_List 226: S '  S'... values are space-padded (S=' S'?) -> read below

const LV = { ' C ': "('7','6','3','2')", ' CO': "('7','6','3','2','1')", '  O': "('3','1','7')" };
const predicate = (lv) => { const al = LV[lv], alw = lv === '  O' ? al + " AND w.Name NOT LIKE '%(all)%'" : al;
  return { window: +pg(`select count(distinct w.ad_window_id) from ad_window w join ad_tab t on w.ad_window_id=t.ad_window_id join ad_table tt on t.ad_table_id=tt.ad_table_id where w.isactive='Y' and t.seqno=(select min(seqno) from ad_tab xt where xt.ad_window_id=w.ad_window_id) and tt.accesslevel in ${alw}`)[0][0],
    process: +pg(`select count(distinct p.ad_process_id) from ad_process p where p.isactive='Y' and accesslevel in ${al}`)[0][0], form: +pg(`select count(*) from ad_form f where f.isactive='Y' and accesslevel in ${al}`)[0][0],
    workflow: +pg(`select count(*) from ad_workflow w where w.isactive='Y' and w.ad_client_id in (0,11) and accesslevel in ${al}`)[0][0],
    docaction: +pg(`select count(*) from c_doctype d join ad_ref_list a on a.ad_reference_id=135 where d.isactive='Y' and d.ad_client_id=11`)[0][0],
    info: +pg(`select count(*) from ad_infowindow i join ad_table tt on i.ad_table_id=tt.ad_table_id where i.isactive='Y' and i.ad_client_id in (0,11) and tt.accesslevel in ${al}`)[0][0] }; };
(async () => {
  const out = { tag, levels: pg("select value,name from ad_ref_list where ad_reference_id=226 order by value").map(r => ({ v: r[0], n: r[1] })), cases: {} };
  log('§NC9L userlevel list ' + JSON.stringify(out.levels));
  for (const lv of out.levels.filter(l => /Client|Organi/.test(l.n) || true)) {
    const name = `NC9-${lv.v.replace(/ /g, '_')}-${tag}`; let id;
    try { const j = await ad.call(cfg, 'create_data', { ModelCRUD: { serviceType: 'Bridge_createData_AD_Role', TableName: 'AD_Role', RecordID: 0, Action: 'Create', DataRow: f({ AD_Org_ID: 0, Name: name, UserLevel: lv.v, IsManual: 'N' }) } }); id = +j.StandardResponse['@RecordID']; }
    catch (e) { out.cases[lv.v] = { ok: false, err: String(e.message).replace(/\s+/g, ' ').slice(0, 200) }; log(`§NC9L level='${lv.v}' REFUSED ${out.cases[lv.v].err}`); continue; }
    const cnt = t => +pg(`select count(*) from ${t} where ad_role_id=${id}`)[0][0];
    const c = { ok: true, window: cnt('ad_window_access'), process: cnt('ad_process_access'), form: cnt('ad_form_access'), workflow: cnt('ad_workflow_access'), docaction: cnt('ad_document_action_access'), info: cnt('ad_infowindow_access'),
      userRoles: pg(`select ad_user_id from ad_user_roles where ad_role_id=${id} order by 1`).map(r => +r[0]), readwrite: pg(`select isreadwrite,count(*) from ad_window_access where ad_role_id=${id} group by 1`).map(r => r.join(':')).join(',') };
    if (LV[lv.v]) { c.predicate = predicate(lv.v); c.predicateEqualsMeasured = ['window', 'process', 'form', 'workflow', 'docaction', 'info'].every(k => c.predicate[k] === c[k]); }
    out.cases[lv.v] = c; log(`§NC9L level='${lv.v}' ` + JSON.stringify(c));
    pg(`delete from ad_window_access where ad_role_id=${id}; delete from ad_process_access where ad_role_id=${id}; delete from ad_form_access where ad_role_id=${id}; delete from ad_workflow_access where ad_role_id=${id}; delete from ad_document_action_access where ad_role_id=${id}; delete from ad_infowindow_access where ad_role_id=${id}; delete from ad_user_roles where ad_role_id=${id}; delete from ad_role_orgaccess where ad_role_id=${id}; delete from ad_role_included where ad_role_id=${id}; delete from ad_role where ad_role_id=${id}`);
  }
  fs.mkdirSync(path.join(__dirname, 'out'), { recursive: true }); fs.writeFileSync(path.join(__dirname, 'out', 'nc9_legacy.json'), JSON.stringify(out, null, 1)); log('§NC9L DONE (throwaway roles removed)');
})().catch(e => { console.log('§NC9L CRASH ' + (e.stack || e)); process.exit(2); });
