// §DICT-CENSUS legacy dump (prompts/ERP_DEPTH_FILM.md §DICT-CENSUS): for every ad_*/pa_*/r_* base table on the LOCAL pilot, columns + row counts per ad_client_id. Read-only.
'use strict';
const { execFileSync } = require('child_process'), fs = require('fs'), path = require('path');
const pg = sql => execFileSync('docker', ['exec', '-i', 'postgres', 'psql', '-U', 'postgres', '-d', 'idempiere_pilot', '-tA', '-c', 'set search_path=adempiere;' + sql], { encoding: 'utf8', maxBuffer: 1 << 26 }).split('\n').filter(l => l && l !== 'SET');
const tabs = pg(`select table_name from information_schema.tables where table_schema='adempiere' and table_type='BASE TABLE' and (table_name like 'ad\\_%' or table_name like 'pa\\_%' or table_name like 'r\\_%') order by 1`);
const out = {};
for (const t of tabs) {
  const cols = pg(`select column_name from information_schema.columns where table_schema='adempiere' and table_name='${t}' order by ordinal_position`);
  const byC = {};
  if (cols.includes('ad_client_id')) pg(`select ad_client_id, count(*) from ${t} group by 1 order by 1`).forEach(l => { const [c, n] = l.split('|'); byC[c] = +n; });
  else byC['none'] = +pg(`select count(*) from ${t}`)[0];
  out[t] = { cols, byClient: byC };
}
fs.mkdirSync(path.join(__dirname, 'out'), { recursive: true });
fs.writeFileSync(path.join(__dirname, 'out', 'dict_census_legacy.json'), JSON.stringify(out));
console.log(`§DC-DUMP tables=${tabs.length} withRows=${Object.values(out).filter(o => Object.values(o.byClient).some(n => n)).length}`);
