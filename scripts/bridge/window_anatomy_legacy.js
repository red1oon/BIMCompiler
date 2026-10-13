// §WL legacy dump (prompts/ERP_DEPTH_FILM.md §WINDOW-LENS): per active AD window on the LOCAL pilot — active tabs, active fields, displayed fields, plus the tab list (id, name, level) — read straight from
// the pilot's own AD tables (the dictionary the legacy UI renders from). -> out/window_anatomy_legacy.json. Read-only. READ THE §WLL LINES.
'use strict';
const { execFileSync } = require('child_process'), fs = require('fs'), path = require('path');
const pg = sql => execFileSync('docker', ['exec', '-i', 'postgres', 'psql', '-U', 'postgres', '-d', 'idempiere_pilot', '-tAF', '|', '-v', 'ON_ERROR_STOP=1', '-c', 'set search_path=adempiere;' + sql], { encoding: 'utf8' }).split('\n').filter(l => l && l !== 'SET').map(l => l.split('|'));
const wins = pg(`select w.ad_window_id, w.name, (select count(*) from ad_tab t where t.ad_window_id=w.ad_window_id and t.isactive='Y'),
  (select count(*) from ad_field f join ad_tab t using(ad_tab_id) where t.ad_window_id=w.ad_window_id and t.isactive='Y' and f.isactive='Y'),
  (select count(*) from ad_field f join ad_tab t using(ad_tab_id) where t.ad_window_id=w.ad_window_id and t.isactive='Y' and f.isactive='Y' and f.isdisplayed='Y')
  from ad_window w where w.isactive='Y' order by 1`);
const tabs = pg(`select t.ad_window_id, t.ad_tab_id, t.name, t.tablevel, t.ad_client_id, t.created::date from ad_tab t join ad_window w using(ad_window_id) where t.isactive='Y' and w.isactive='Y' order by 1, t.seqno`);
const out = { windows: {} };
wins.forEach(r => { out.windows[r[0]] = { name: r[1], tabs: +r[2], fields: +r[3], displayed: +r[4], tabList: [] }; });
tabs.forEach(r => out.windows[r[0]].tabList.push({ id: +r[1], name: r[2], level: +r[3], client: +r[4], created: r[5] }));
fs.mkdirSync(path.join(__dirname, 'out'), { recursive: true });
fs.writeFileSync(path.join(__dirname, 'out', 'window_anatomy_legacy.json'), JSON.stringify(out));
console.log(`§WLL windows=${wins.length} tabs=${tabs.length} fields=${wins.reduce((a, r) => a + +r[3], 0)}`);
