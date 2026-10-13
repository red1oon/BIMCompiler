// §DASH-D0 legacy dump (prompts/ERP_DEPTH_FILM.md §DASHBOARD-PARITY): every row of the dashboard / performance-measurement dictionary tables on the LOCAL pilot, all columns as text (exact values, NULL kept)
// -> out/dashboard_dict_legacy.json {table: {cols:[...], rows:[{col:text|null}]}}. Read-only. READ THE §DDL LINES.
'use strict';
const { execFileSync } = require('child_process'), fs = require('fs'), path = require('path');
const pg = sql => execFileSync('docker', ['exec', '-i', 'postgres', 'psql', '-U', 'postgres', '-d', 'idempiere_pilot', '-tA', '-c', 'set search_path=adempiere;' + sql], { encoding: 'utf8', maxBuffer: 1 << 26 }).split('\n').filter(l => l && l !== 'SET');
const TABLES = ['pa_dashboardcontent', 'pa_dashboardcontent_access', 'pa_dashboardpreference', 'pa_goal', 'pa_goalrestriction', 'pa_measure', 'pa_measurecalc', 'pa_colorschema', 'pa_ratio', 'ad_note', 'ad_recentitem', 'ad_printcolor', 'ad_statusline', 'ad_chart', 'ad_chartdatasource'];
const out = {};
for (const t of TABLES) {
  const cols = pg(`select column_name from information_schema.columns where table_schema='adempiere' and table_name='${t}' order by ordinal_position`);
  if (!cols.length) { console.log(`§DDL ${t} ABSENT-ON-LEGACY`); continue; }
  const sel = cols.map(c => `${c}::text AS ${c}`).join(',');
  const j = pg(`select coalesce(json_agg(r),'[]'::json) from (select ${sel} from ${t}) r`).join('\n');
  out[t] = { cols, rows: JSON.parse(j) };
  console.log(`§DDL ${t} cols=${cols.length} rows=${out[t].rows.length}`);
}
fs.mkdirSync(path.join(__dirname, 'out'), { recursive: true });
fs.writeFileSync(path.join(__dirname, 'out', 'dashboard_dict_legacy.json'), JSON.stringify(out));
