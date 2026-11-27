// §NC-2 legacy measurement (prompts/ERP_DEPTH_FILM.md §NC-2): period open/close/permanent + single-row PeriodControlStatus on the LOCAL pilot via the WS
// (throwaway calendar), states read back by psql SELECT. Writes out/nc2_legacy.json. READ the §NC2L lines.
'use strict';
const ad = require('./ad_client'), { execFileSync } = require('child_process'), fs = require('fs'), path = require('path');
const cfg = ad.cfgFromEnv(), tag = Date.now().toString(36).slice(-5);
const pg = sql => execFileSync('docker', ['exec', 'postgres', 'psql', '-U', 'postgres', '-d', 'idempiere_pilot', '-tAF', '|', '-c', 'set search_path=adempiere;' + sql], { encoding: 'utf8' }).trim().split('\n').filter(Boolean).filter(l => l !== 'SET').map(l => l.split('|'));
const f = o => ({ field: Object.entries(o).map(([k, v]) => ({ '@column': k, val: String(v) })) });
const create = async (t, o) => +(await ad.call(cfg, 'create_data', { ModelCRUD: { serviceType: 'Bridge_createData_' + t, TableName: t, RecordID: 0, Action: 'Create', DataRow: f(o) } })).StandardResponse['@RecordID'];
const states = p => { const o = {}; pg(`select periodstatus,count(*) from c_periodcontrol where c_period_id=${p} group by 1`).forEach(r => o[r[0]] = +r[1]); return o; };
const acts = p => { const o = {}; pg(`select periodaction,count(*) from c_periodcontrol where c_period_id=${p} group by 1`).forEach(r => o[r[0]] = +r[1]); return o; };
const log = s => console.log(s), out = { cases: {} };
const ps = async (p, a) => { const r = await ad.runProcess(cfg, 'Bridge_RunProcess_PeriodStatus', { PeriodAction: a }, p); return { ok: r.ok, summary: String(r.ok ? r.summary : r.error).slice(0, 160) }; };
(async () => {
  const cal = await create('C_Calendar', { AD_Org_ID: 0, Name: `NC2-${tag}` }), yr = await create('C_Year', { AD_Org_ID: 0, C_Calendar_ID: cal, FiscalYear: 2035 });
  const g = await ad.runProcess(cfg, 'Bridge_RunProcess_YearCreatePeriods', {}, yr); if (!g.ok) throw new Error('create periods ' + g.error);
  const P = pg(`select c_period_id from c_period where c_year_id=${yr} order by periodno`).map(r => +r[0]);
  const rec = async (id, p, r) => { out.cases[id] = { ...r, states: states(p), actions: acts(p) }; log(`§NC2L ${id} ok=${r.ok} summary=${JSON.stringify(r.summary)} states=${JSON.stringify(states(p))} actions=${JSON.stringify(acts(p))}`); };
  const p1 = P[0];
  await rec('NC2.1', p1, await ps(p1, 'O')); await rec('NC2.1-rerun', p1, await ps(p1, 'O'));
  await rec('NC2.2', p1, await ps(p1, 'C'));
  await rec('NC2.3-P', p1, await ps(p1, 'P')); await rec('NC2.3-reopen', p1, await ps(p1, 'O'));
  const p2 = P[1], row = +pg(`select c_periodcontrol_id from c_periodcontrol where c_period_id=${p2} and docbasetype='SOO'`)[0][0];
  await ad.call(cfg, 'update_data', { ModelCRUD: { serviceType: 'Bridge_updateData_C_PeriodControl', TableName: 'C_PeriodControl', RecordID: row, Action: 'Update', DataRow: f({ PeriodAction: 'O' }) } });
  out.cases['NC2.4-preset'] = { actions: acts(p2) }; log(`§NC2L NC2.4-preset actions=${JSON.stringify(acts(p2))}`);
  const r4 = await ad.runProcess(cfg, 'Bridge_RunProcess_PeriodControlStatus', {}, row);
  await rec('NC2.4', p2, { ok: r4.ok, summary: String(r4.ok ? r4.summary : r4.error).slice(0, 160) });
  out.cases['NC2.4'].soo = pg(`select periodstatus from c_periodcontrol where c_periodcontrol_id=${row}`)[0][0];
  const ref = pg("select value,name from ad_ref_list where ad_reference_id=176 order by value").map(r => ({ v: r[0], n: r[1] })); out.ref176 = ref; log('§NC2L ref176 ' + JSON.stringify(ref));
  out.dbt = +pg("select count(distinct docbasetype) from c_doctype where ad_client_id=11 and isactive='Y'")[0][0];
  fs.mkdirSync(path.join(__dirname, 'out'), { recursive: true }); fs.writeFileSync(path.join(__dirname, 'out', 'nc2_legacy.json'), JSON.stringify(out, null, 1)); log('§NC2L DONE');
})().catch(e => { console.log('§NC2L CRASH ' + (e.stack || e)); process.exit(2); });
