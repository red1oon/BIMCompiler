// §NC-2b legacy measurement: FinReport (AD_Process 202 "Create Report") for PA_Report 100 (Balance Sheet Current Month), GardenWorld, via the WS, results read from T_Report.
// (a) no C_Period_ID  (b) C_Period_ID = today's period  (c) C_Period_ID = Jan-03 (busiest history period).  If (a) == (b) legacy defaults to TODAY's period (FinReport.setPeriods :296-343).
'use strict';
const ad = require('./ad_client'), { execFileSync } = require('child_process'), fs = require('fs'), path = require('path');
const cfg = ad.cfgFromEnv(), log = s => console.log(s);
const pg = sql => execFileSync('docker', ['exec', 'postgres', 'psql', '-U', 'postgres', '-d', 'idempiere_pilot', '-tAF', '|', '-c', 'set search_path=adempiere;' + sql], { encoding: 'utf8' }).trim().split('\n').filter(Boolean).filter(l => l !== 'SET').map(l => l.split('|'));
const run = async (period) => {
  const before = +pg('select coalesce(max(ad_pinstance_id),0) from ad_pinstance')[0][0];
  const params = period ? { C_Period_ID: period } : {};
  const r = await ad.runProcess(cfg, 'Bridge_RunProcess_FinReport', params, 100);
  const pi = +pg(`select max(ad_pinstance_id) from ad_pinstance where ad_process_id=202 and ad_pinstance_id>${before}`)[0][0] || 0;
  const rows = pi ? pg(`select seqno,name,coalesce(col_0,0),coalesce(col_1,0),coalesce(col_2,0),coalesce(col_3,0),coalesce(col_4,0),coalesce(col_5,0) from t_report where ad_pinstance_id=${pi} and levelno=0 order by seqno`).map(x => ({ seq: +x[0], name: x[1], cells: x.slice(2).map(v => (+v).toFixed(2)) })) : [];
  return { ok: r.ok, summary: String(r.ok ? r.summary : r.error).slice(0, 160), pinstance: pi, rows };
};
(async () => {
  const today = pg("select c_period_id,name from c_period where c_year_id in (select c_year_id from c_year where c_calendar_id=102) and periodtype='S' and current_date between startdate and enddate")[0];
  const jan03 = pg("select c_period_id from c_period where name='Jan-03' and c_year_id in (select c_year_id from c_year where c_calendar_id=102)")[0][0];
  const out = { today: { id: +today[0], name: today[1] }, jan03: +jan03 };
  out.facts = pg("select account_id,amtacctdr,amtacctcr,coalesce(qty,0),c_period_id,c_acctschema_id,postingtype from fact_acct where ad_client_id=11 and c_period_id in (select c_period_id from c_period where startdate<=timestamp '2003-01-01')").map(x => ({ account_id: +x[0], amtacctdr: +x[1], amtacctcr: +x[2], qty: +x[3], c_period_id: +x[4], c_acctschema_id: +x[5], postingtype: x[6] }));
  log('§NC2BL journal rows exported (periods <= Jan-03): ' + out.facts.length);
  out.default = await run(0); out.todayExplicit = await run(today[0]); out.jan03r = await run(jan03);
  const same = JSON.stringify(out.default.rows) === JSON.stringify(out.todayExplicit.rows);
  out.defaultIsToday = same && out.default.rows.length > 0;
  log(`§NC2BL default ok=${out.default.ok} rows=${out.default.rows.length} | todayExplicit(${today[1]}) rows=${out.todayExplicit.rows.length} | default==today ${same} | jan03 ok=${out.jan03r.ok} rows=${out.jan03r.rows.length}`);
  log('§NC2BL jan03 sample ' + JSON.stringify(out.jan03r.rows.slice(0, 4)));
  fs.mkdirSync(path.join(__dirname, 'out'), { recursive: true }); fs.writeFileSync(path.join(__dirname, 'out', 'nc2b_legacy.json'), JSON.stringify(out, null, 1)); log('§NC2BL DONE');
})().catch(e => { console.log('§NC2BL CRASH ' + (e.stack || e)); process.exit(2); });
