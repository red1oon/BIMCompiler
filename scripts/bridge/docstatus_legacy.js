// §DASH-D3 legacy oracle (prompts/ERP_DEPTH_FILM.md §DASHBOARD-PARITY D3 - Activities / docstatus gadget): the PA_DocumentStatus indicator COUNTS the legacy Home shows, by running the SQL the Java builds
// (MDocumentStatus.getDocumentStatusIndicators :141-186 -> canAccess :272-289 + window/form access; evaluate :192-202 + getSQLFilter :234-258 + MRole.addAccessSQL client/org where MRole.java:1110-1260) on the
// LOCAL pilot for 3 user/role cases, plus the pilot rows the twin needs to reproduce them -> out/docstatus_legacy.json. Read-only. READ THE §DSTL LINES.
'use strict';
const { execFileSync } = require('child_process'), fs = require('fs'), path = require('path');
const raw = sql => execFileSync('docker', ['exec', '-i', 'postgres', 'psql', '-U', 'postgres', '-d', 'idempiere_pilot', '-tA', '-F', '\u0001', '-c', 'set client_min_messages=warning; set search_path=adempiere;' + sql], { encoding: 'utf8', maxBuffer: 1 << 28 }).split('\n').filter(l => l !== '' && l !== 'SET');
const CASES = [{ name: 'GardenAdmin/GardenWorld Admin', client: 11, role: 102, user: 101 }, { name: 'GardenUser/GardenWorld User', client: 11, role: 103, user: 102 }, { name: 'System/System Administrator', client: 0, role: 0, user: 100 }];
const now = raw("select to_char(now(),'YYYY-MM-DD HH24:MI:SS')")[0];
const out = { now, cases: [], tables: {} };
for (const c of CASES) {
  const allOrgs = raw(`select isaccessallorgs from ad_role where ad_role_id=${c.role}`)[0] === 'Y';
  const orgs = allOrgs ? null : raw(`select distinct ad_org_id from ad_role_orgaccess where ad_role_id=${c.role} and isactive='Y' order by 1`).map(Number);
  const clientWhere = allOrgs ? (c.client === 0 ? 'AD_Client_ID=0' : `AD_Client_ID IN (0,${c.client})`) : `AD_Client_ID IN (0,${c.client})`;
  const orgWhere = orgs ? ` AND (AD_Org_ID IN (${[0].concat(orgs.filter(o => o !== 0)).join(',')}))` : '';
  const ds = raw(`select pa_documentstatus_id, ad_table_id, coalesce(ad_window_id,0), coalesce(ad_form_id,0), coalesce(c_project_id,0), coalesce(ad_org_id,0), replace(coalesce(whereclause,''), E'\\n', E'\\u0002'), name from pa_documentstatus where isactive='Y' and ad_client_id in (0,${c.client}) order by seqno, pa_documentstatus_id`).map(l => l.split('\u0001'));
  const ind = [];
  for (const [id, tid, win, form, proj, org, wh, name] of ds) {
    const acc = +win > 0 ? raw(`select count(*) from ad_window_access where ad_role_id=${c.role} and ad_window_id=${win} and isactive='Y'`)[0] > 0 : +form > 0 ? raw(`select count(*) from ad_form_access where ad_role_id=${c.role} and ad_form_id=${form} and isactive='Y'`)[0] > 0 : false;
    if (!acc) { ind.push({ id: +id, name, shown: false }); continue; }
    const tn = raw(`select tablename from ad_table where ad_table_id=${tid}`)[0];
    let where = ` ${tn}.AD_Client_ID=${c.client}` + (+proj ? ` AND ${tn}.C_Project_ID=${proj}` : '') + (+org ? ` AND ${tn}.AD_Org_ID=${org}` : '');
    const extra = wh.replace(/\u0002/g, '\n').trim(); if (extra) where += ` AND ( ${extra} ) `;
    where = where.replace(/@#AD_Client_ID@/g, c.client).replace(/@#AD_User_ID@/g, c.user).replace(/@#AD_Role_ID@/g, c.role).replace(/@#AD_Org_ID@/g, 0);
    const sql = `SELECT COUNT(*) FROM ${tn} WHERE ${where} AND ${clientWhere}${orgWhere}`;
    const n = +raw(sql.replace(/\bSYSDATE\b/gi, `to_timestamp('${now}','YYYY-MM-DD HH24:MI:SS')`))[0];
    ind.push({ id: +id, name, shown: true, table: tn, window: +win, form: +form, count: n });
  }
  out.cases.push({ ...c, orgs, indicators: ind }); console.log(`§DSTL ${c.name}: ` + ind.map(i => i.name + '=' + (i.shown ? i.count : 'hidden')).join(' | '));
}
const dump = (t, where) => { const cl = raw(`select column_name from information_schema.columns where table_schema='adempiere' and table_name='${t}' order by ordinal_position`);
  if (!cl.length) { console.log(`§DSTL ${t} ABSENT-ON-LEGACY`); return; }
  const j = raw(`select coalesce(json_agg(r),'[]'::json) from (select ${cl.map(c => c + '::text AS ' + c).join(',')} from ${t} ${where || ''}) r`).join('\n'); out.tables[t] = { cols: cl, rows: JSON.parse(j) }; };
['ad_note', 'r_request', 'r_status', 'ad_wf_activity', 'ad_wf_responsible', 'ad_wf_activityapprover', 'ad_user_roles', 'ad_window_access', 'ad_form_access'].forEach(t => dump(t, t === 'ad_window_access' || t === 'ad_form_access' ? 'where ad_role_id in (0,102,103)' : ''));
const UN = "docstatus not in ('CO','CL','VO','RE')";
['gl_journal', 'c_invoice', 'm_inventory', 'm_movement', 'c_cash', 'c_payment', 'c_allocationhdr', 'c_bankstatement', 'm_requisition'].forEach(t => dump(t, `where ${UN}`));
dump('c_order', `where ${UN} or dateordered > now() - interval '3 days'`); dump('m_inout', `where ${UN} or processed='N'`);
fs.mkdirSync(path.join(__dirname, 'out'), { recursive: true }); fs.writeFileSync(path.join(__dirname, 'out', 'docstatus_legacy.json'), JSON.stringify(out));
console.log('§DSTL now=' + now + ' tables=' + Object.keys(out.tables).map(t => t + ':' + out.tables[t].rows.length).join(','));
