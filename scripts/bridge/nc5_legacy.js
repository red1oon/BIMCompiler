// §NC-5a legacy measurement (prompts/ERP_DEPTH_FILM.md §NC-5): currencyRate() on the LOCAL pilot over a grid of (date, org, conversion type) against six THROWAWAY
// USD->CAD C_Conversion_Rate rows (client-0 base, client override, org-specific, other type, inactive, expired window). Rows are inserted, read and DELETED in one run.
// Writes out/nc5_legacy.json (rows + the pilot's answers). READ the §NC5L lines.
'use strict';
const { execFileSync } = require('child_process'), fs = require('fs'), path = require('path');
const log = s => console.log(s);
const pg = sql => execFileSync('docker', ['exec', '-i', 'postgres', 'psql', '-U', 'postgres', '-d', 'idempiere_pilot', '-tAF', '|', '-v', 'ON_ERROR_STOP=1', '-c', 'set search_path=adempiere;' + sql], { encoding: 'utf8' }).trim().split('\n').filter(l => l && l !== 'SET').map(l => l.split('|'));
const ROWS = [
  { k: 'r1', client: 0, org: 0, type: 114, rate: 1.30, from: '2000-01-01', to: '2056-01-01', active: 'Y' },
  { k: 'r2', client: 11, org: 0, type: 114, rate: 1.31, from: '2005-01-01', to: '2056-01-01', active: 'Y' },
  { k: 'r3', client: 11, org: 12, type: 114, rate: 1.32, from: '2010-01-01', to: '2056-01-01', active: 'Y' },
  { k: 'r4', client: 11, org: 0, type: 115, rate: 1.40, from: '2000-01-01', to: '2056-01-01', active: 'Y' },
  { k: 'r5', client: 11, org: 0, type: 114, rate: 1.99, from: '2020-01-01', to: '2056-01-01', active: 'N' },
  { k: 'r6', client: 11, org: 0, type: 114, rate: 1.33, from: '2015-01-01', to: '2016-12-31', active: 'Y' },
];
const DATES = ['1999-06-01', '2001-01-01', '2006-01-01', '2011-01-01', '2015-06-01', '2018-01-01', '2021-01-01', '2060-01-01'], ORGS = [0, 11, 12], TYPES = [114, 115, null];
(async () => {
  pg("delete from c_conversion_rate where c_currency_id=100 and c_currency_id_to=116 and ad_client_id in (0,11) and createdby=100 and multiplyrate in (1.30,1.31,1.32,1.40,1.99,1.33)");
  const ids = [];
  try {
    for (const r of ROWS) {
      const id = +pg("select nextidfunc((select ad_sequence_id from ad_sequence where name='C_Conversion_Rate')::int,'N'::varchar)")[0][0]; ids.push(id);
      pg(`insert into c_conversion_rate (c_conversion_rate_id,ad_client_id,ad_org_id,isactive,created,createdby,updated,updatedby,c_currency_id,c_currency_id_to,c_conversiontype_id,validfrom,validto,multiplyrate,dividerate,c_conversion_rate_uu) values (${id},${r.client},${r.org},'${r.active}',now(),100,now(),100,100,116,${r.type},'${r.from}','${r.to}',${r.rate},${(1 / r.rate).toFixed(12)},gen_random_uuid())`);
    }
    const grid = [];
    for (const d of DATES) for (const o of ORGS) for (const t of TYPES) {
      const rr = pg(`select currencyrate(100,116,'${d}'::timestamptz,${t == null ? 'null' : t},11,${o})`)[0], v = rr ? rr[0] : '';
      grid.push({ date: d, org: o, type: t, rate: v === '' ? null : +v });
    }
    fs.mkdirSync(path.join(__dirname, 'out'), { recursive: true });
    fs.writeFileSync(path.join(__dirname, 'out', 'nc5_legacy.json'), JSON.stringify({ rows: ROWS, grid, client: 11 }, null, 1));
    log(`§NC5L grid=${grid.length} answered=${grid.filter(g => g.rate != null).length} sample=${JSON.stringify(grid.slice(0, 6))}`);
  } finally { pg(`delete from c_conversion_rate where c_conversion_rate_id in (${ids.join(',') || 0})`); log('§NC5L throwaway rows deleted: ' + ids.length); }
  log('§NC5L DONE');
})().catch(e => { console.log('§NC5L CRASH ' + (e.stack || e)); process.exit(2); });
