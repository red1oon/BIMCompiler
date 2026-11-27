// §DASH-D1 legacy oracle (prompts/ERP_DEPTH_FILM.md §DASHBOARD-PARITY D1): the four PA_Goal actuals on the LOCAL pilot for the GardenWorld Admin role (102), computed by running the SAME SQL the Java builds
// (MMeasureCalc.getSqlPI MMeasureCalc.java:153-189 / MRequestType.getSqlPI :417-457 + MMeasureCalc.addRestrictions :400-613 -> MRole.addAccessSQL client/org where MRole.java:1110-1260) on Postgres, plus the
// pilot rows the twin needs to reproduce them (invoices, doctypes, pay schedules, allocations, currencies, rates, requests) -> out/goal_oracle_legacy.json. Read-only. READ THE §GOL LINES.
'use strict';
const { execFileSync } = require('child_process'), fs = require('fs'), path = require('path');
const pg = sql => execFileSync('docker', ['exec', '-i', 'postgres', 'psql', '-U', 'postgres', '-d', 'idempiere_pilot', '-tA', '-c', 'set client_min_messages=warning; set search_path=adempiere;' + sql], { encoding: 'utf8', maxBuffer: 1 << 28 }).split('\n').filter(l => l && l !== 'SET');
const ROLE = 102, CLIENT = 11;
const role = pg(`select isaccessallorgs from ad_role where ad_role_id=${ROLE}`)[0];
const orgs = role === 'Y' ? null : pg(`select distinct ad_org_id from ad_role_orgaccess where ad_role_id=${ROLE} and isactive='Y' order by 1`).map(Number);
const clientWhere = "IN (0," + CLIENT + ")";                                   // MRole.getClientWhere(false): isAccessAllOrgs -> 'IN (0,client)'; otherwise the client list of the org access (+0) = same here
const orgWhere = orgs ? ` AND C.AD_Org_ID IN (${['0'].concat(orgs.filter(o => o !== 0)).join(',')})` : '';
const today = pg("select to_char(now(),'YYYY-MM-DD')")[0];
const val = sql => { const r = pg(sql)[0]; return r === undefined || r === '' ? 0 : Number(r); };
const goals = pg(`select g.pa_goal_id, g.measurescope, m.pa_measure_id, m.measuretype, m.measuredatatype, m.r_requesttype_id, g.measuretarget from pa_goal g join pa_measure m using(pa_measure_id) where g.ad_client_id=${CLIENT} and g.isactive='Y' order by 1`).map(l => l.split('|'));
const TR = { '1': 'Y', '3': 'Q', '5': 'MM', '7': 'W', '8': 'DD' };
const out = { today, role: ROLE, client: CLIENT, orgs, goals: {}, tables: {} };
for (const [gid, scope, mid, mtype, dtype, rtype, target] of goals) {
  const inTime = dtype === 'T' && scope !== '0', tr = TR[scope] || 'DD';
  let sql;
  if (mtype === 'C') {
    const c = pg(`select selectclause||' '||whereclause, datecolumn from pa_measurecalc where pa_measurecalc_id=(select pa_measurecalc_id from pa_measure where pa_measure_id=${mid})`)[0].split('|');
    // the SELECT/WHERE text can hold newlines: re-read it as one value
    const sc = execFileSync('docker', ['exec', '-i', 'postgres', 'psql', '-U', 'postgres', '-d', 'idempiere_pilot', '-tA', '-c', `set search_path=adempiere; select replace(selectclause||' '||whereclause, E'\\n', ' '), coalesce(datecolumn,'') from pa_measurecalc where pa_measurecalc_id=(select pa_measurecalc_id from pa_measure where pa_measure_id=${mid})`], { encoding: 'utf8' }).split('\n').filter(l => l && l !== 'SET')[0].split('|');
    sql = sc[0] + (sc[1] && inTime ? ` AND TRUNC(${sc[1]},'${tr}')=TRUNC(now(),'${tr}')` : '') + ` AND C_Invoice.AD_Client_ID ${clientWhere}` + orgWhere.replace(/C\./g, 'C_Invoice.');
  } else {
    sql = `SELECT COUNT(*) FROM R_Request WHERE R_RequestType_ID=${rtype} AND Processed<>'Y'` + (inTime ? ` AND TRUNC(Created,'${tr}')=TRUNC(now(),'${tr}')` : '') + ` AND R_Request.AD_Client_ID ${clientWhere}` + orgWhere.replace(/C\./g, 'R_Request.');
  }
  const actual = val(sql);
  const noDate = sql.replace(/ AND TRUNC\([A-Za-z_]+,'[A-Za-z]+'\)=TRUNC\(now\(\),'[A-Za-z]+'\)/, ''), totalActual = val(noDate);   // same SQL without the scope's date restriction (MeasureScope Total)
  out.goals[gid] = { measure: +mid, type: mtype, dataType: dtype, scope, target: +target, actual, totalActual, sql };
  console.log(`§GOL goal=${gid} type=${mtype} scope=${scope} dataType=${dtype} actual=${actual}`);
}
const dump = (t, where, cols) => { const cl = cols || pg(`select column_name from information_schema.columns where table_schema='adempiere' and table_name='${t}' order by ordinal_position`);
  const j = pg(`select coalesce(json_agg(r),'[]'::json) from (select ${cl.map(c => c + '::text AS ' + c).join(',')} from ${t} ${where || ''}) r`).join('\n'); out.tables[t] = { cols: cl, rows: JSON.parse(j) }; };
dump('c_invoice', `where ad_client_id in (0,${CLIENT})`, ['c_invoice_id', 'ad_client_id', 'ad_org_id', 'isactive', 'issotrx', 'docstatus', 'processed', 'c_doctype_id', 'dateinvoiced', 'dateacct', 'c_bpartner_id', 'c_currency_id', 'c_conversiontype_id', 'grandtotal', 'ispaid', 'ispayschedulevalid']); dump('c_doctype', `where ad_client_id in (0,${CLIENT})`, ['c_doctype_id', 'ad_client_id', 'docbasetype', 'docsubtypeso']);
dump('c_invoicepayschedule', `where ad_client_id in (0,${CLIENT})`, ['c_invoicepayschedule_id', 'c_invoice_id', 'dueamt', 'duedate', 'isvalid']); dump('c_allocationhdr', `where ad_client_id in (0,${CLIENT})`, ['c_allocationhdr_id', 'ad_client_id', 'ad_org_id', 'isactive', 'c_currency_id', 'datetrx']); dump('c_allocationline', `where ad_client_id in (0,${CLIENT})`, ['c_allocationline_id', 'c_allocationhdr_id', 'c_invoice_id', 'amount', 'discountamt', 'writeoffamt']);
dump('c_currency', '', ['c_currency_id', 'stdprecision', 'iso_code']); dump('c_conversion_rate', `where ad_client_id in (0,${CLIENT})`, ['c_conversion_rate_id', 'ad_client_id', 'ad_org_id', 'isactive', 'c_currency_id', 'c_currency_id_to', 'c_conversiontype_id', 'validfrom', 'validto', 'multiplyrate']); dump('c_conversiontype', '', ['c_conversiontype_id', 'isdefault']);
dump('c_acctschema', `where ad_client_id in (0,${CLIENT})`, ['c_acctschema_id', 'ad_client_id', 'c_currency_id']); dump('ad_clientinfo', `where ad_client_id in (0,${CLIENT})`, ['ad_client_id', 'c_acctschema1_id']);
dump('r_request', `where ad_client_id in (0,${CLIENT})`, ['r_request_id', 'ad_client_id', 'ad_org_id', 'r_requesttype_id', 'processed', 'created']);

// ---- D2b: what the legacy Performance gadget shows per goal (WPAPanel.loadGoal -> MGoal.getUserGoals; WPerformanceIndicator.init title/tooltip; MGoal.getPercent/getColor; MColorSchema.getColor :231-258; MPrintColor.getColor) ----
const fmtInt = n => { const r = Math.round(Math.abs(n) - ((Math.abs(n) % 1) === 0.5 && Math.floor(Math.abs(n)) % 2 === 0 ? 0.5 : 0)); return (n < 0 ? '-' : '') + String(Math.round(Math.abs(n) * 1e9) / 1e9 === Math.floor(Math.abs(n)) ? Math.abs(n) : r).replace(/\B(?=(\d{3})+(?!\d))/g, ','); };   // DecimalFormat #,##0 (HALF_EVEN)
out.gadget = pg(`select g.pa_goal_id, g.name, coalesce(g.description,''), g.measuretarget, g.pa_colorschema_id from pa_goal g where g.isactive='Y' and g.ad_client_id=${CLIENT} and ((g.ad_user_id is null and g.ad_role_id is null) or g.ad_user_id=101 or exists (select 1 from ad_user_roles ur where ur.ad_user_id=101 and g.ad_role_id=ur.ad_role_id and ur.isactive='Y')) order by g.seqno, g.pa_goal_id`).map(l => {
  const a = l.split('|'), id = a[0], target = +a[3], actual = out.goals[id] ? out.goals[id].actual : null;
  const perf = target ? Math.round(actual / target * 1e6) / 1e6 : 0, percent = Math.trunc(perf * 100);
  const cs = pg(`select mark1percent, mark2percent, mark3percent, mark4percent, ad_printcolor1_id, ad_printcolor2_id, ad_printcolor3_id, coalesce(ad_printcolor4_id,0) from pa_colorschema where pa_colorschema_id=${a[4]}`)[0].split('|').map(Number);
  let pc = (percent <= cs[0] || cs[1] === 0) ? cs[4] : (percent <= cs[1] || cs[2] === 0) ? cs[5] : (percent <= cs[2] || cs[3] === 0) ? cs[6] : cs[7];
  if (!pc) pc = cs[6] || cs[5] || cs[4] || 0;
  const code = pc ? +pg(`select code from ad_printcolor where ad_printcolor_id=${pc}`)[0] : null, rgb = code == null ? 0 : (code & 0xFFFFFF);
  const title = a[1] + ': ' + (target ? percent + '%' : fmtInt(actual));
  const tip = (a[2] ? a[2] + ': ' : '') + fmtInt(actual) + (target ? ' of ' + fmtInt(target) : '');
  return { id: +id, name: a[1], percent, title, tooltip: tip, color: '#' + ('000000' + rgb.toString(16)).slice(-6) };
});
for (const g of out.gadget) console.log(`§GOL gadget ${g.id} "${g.title}" tip="${g.tooltip}" color=${g.color}`);
fs.mkdirSync(path.join(__dirname, 'out'), { recursive: true });
fs.writeFileSync(path.join(__dirname, 'out', 'goal_oracle_legacy.json'), JSON.stringify(out));
console.log(`§GOL today=${today} role=${ROLE} orgs=${orgs ? orgs.join(',') : 'all'} invoices=${out.tables.c_invoice.rows.length} allocLines=${out.tables.c_allocationline.rows.length} requests=${out.tables.r_request.rows.length}`);
