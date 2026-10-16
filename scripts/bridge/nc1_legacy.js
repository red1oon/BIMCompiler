// §NC-1 legacy measurement (bim-compiler prompts/ERP_DEPTH_FILM.md §NC-1): the SAME cases as erp/tests/witness_nc1_calendar.js, run on the LOCAL
// pilot through the WS as GardenAdmin (throwaway calendars "NC1-*"), rows read back by psql SELECT. Writes out/nc1_legacy.json; READ the §NC1L lines.
'use strict';
const ad = require('./ad_client'), { execFileSync } = require('child_process'), fs = require('fs'), path = require('path');
const cfg = ad.cfgFromEnv(); const tag = Date.now().toString(36).slice(-5);
const pg = sql => execFileSync('docker', ['exec', 'postgres', 'psql', '-U', 'postgres', '-d', 'idempiere_pilot', '-tAF', '|', '-c', 'set search_path=adempiere;' + sql], { encoding: 'utf8' }).trim().split('\n').filter(Boolean).filter(l => l !== 'SET').map(l => l.split('|'));
const f = o => ({ field: Object.entries(o).map(([k, v]) => ({ '@column': k, val: String(v) })) });
const create = async (t, o) => +(await ad.call(cfg, 'create_data', { ModelCRUD: { serviceType: 'Bridge_createData_' + t, TableName: t, RecordID: 0, Action: 'Create', DataRow: f(o) } })).StandardResponse['@RecordID'];
const periods = y => pg(`select periodno,name,to_char(startdate,'YYYY-MM-DD'),to_char(enddate,'YYYY-MM-DD'),periodtype from c_period where c_year_id=${y} order by periodno`).map(r => ({ no: +r[0], name: r[1], s: r[2], e: r[3], t: r[4] }));
const ctl = y => +pg(`select count(*) from c_periodcontrol where c_period_id in (select c_period_id from c_period where c_year_id=${y})`)[0][0];
const out = { client: 11, dbt: +pg("select count(distinct docbasetype) from c_doctype where ad_client_id=11 and isactive='Y'")[0][0], cases: {} };
const log = s => console.log(s);
async function cal(name) { return create('C_Calendar', { AD_Org_ID: 0, Name: `NC1-${name}-${tag}` }); }
async function year(c, fy) { return create('C_Year', { AD_Org_ID: 0, C_Calendar_ID: c, FiscalYear: fy }); }
async function run(y, p) { const r = await ad.runProcess(cfg, 'Bridge_RunProcess_YearCreatePeriods', p || {}, y); return { ok: r.ok, summary: String(r.ok ? r.summary : r.error).slice(0, 200) }; }
(async () => {
  const simple = async (id, fy, p) => { const c = await cal(id), y = await year(c, fy), r = await run(y, p); const per = periods(y); out.cases[id] = { ...r, periods: per, ctl: ctl(y) }; log(`§NC1L ${id} ok=${r.ok} periods=${per.length} ctl=${ctl(y)} first=${JSON.stringify(per[0])} last=${JSON.stringify(per[11])}${r.ok ? '' : ' err=' + r.summary}`); return { c, y }; };
  await simple('NC1.1', 2027); await simple('NC1.1b', 2028);
  await simple('NC1.2', 2027, { StartDate: '2027-07-01 00:00:00', DateFormat: 'MMM yyyy' });
  await simple('NC1.3', 2027, { StartDate: '2027-01-31 00:00:00' });
  const a = await simple('NC1.4a', 2029); const n0 = periods(a.y).length; const r2 = await run(a.y); out.cases['NC1.4-RERUN'] = { ...r2, periods: periods(a.y), ctl: ctl(a.y), n0 };
  log(`§NC1L NC1.4-RERUN ok=${r2.ok} periods ${n0} -> ${periods(a.y).length} ctl=${ctl(a.y)}`);
  const c5 = await cal('overlap'), ya = await year(c5, 2027); await run(ya); const yb = await year(c5, 2028), before = +pg(`select count(*) from c_period where c_year_id in (select c_year_id from c_year where c_calendar_id=${c5})`)[0][0];
  const ro = await run(yb, { StartDate: '2027-06-15 00:00:00' }), after = +pg(`select count(*) from c_period where c_year_id in (select c_year_id from c_year where c_calendar_id=${c5})`)[0][0];
  out.cases['NC1.4-OVERLAP'] = { ...ro, before, after }; log(`§NC1L NC1.4-OVERLAP ok=${ro.ok} before=${before} after=${after} msg=${ro.summary}`);
  let adj = { ok: true, err: '' };
  try { const p12 = pg(`select to_char(startdate,'YYYY-MM-DD'),to_char(enddate,'YYYY-MM-DD') from c_period where c_year_id=${ya} and periodno=12`)[0]; await create('C_Period', { AD_Org_ID: 0, C_Year_ID: ya, PeriodNo: 13, Name: 'Adj-27', PeriodType: 'A', StartDate: p12[0] + ' 00:00:00', EndDate: p12[1] + ' 00:00:00' }); } catch (e) { adj = { ok: false, err: String(e.message).slice(0, 200) }; }
  out.cases['NC1.7-ADJUSTING'] = adj; log(`§NC1L NC1.7-ADJUSTING accepted=${adj.ok} ${adj.err}`);
  fs.mkdirSync(path.join(__dirname, 'out'), { recursive: true }); fs.writeFileSync(path.join(__dirname, 'out', 'nc1_legacy.json'), JSON.stringify(out, null, 1));
  log('§NC1L DONE cases=' + Object.keys(out.cases).length);
})().catch(e => { console.log('§NC1L CRASH ' + (e.stack || e)); process.exit(2); });
