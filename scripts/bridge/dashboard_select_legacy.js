// §DASH-D2a legacy oracle (prompts/ERP_DEPTH_FILM.md §DASHBOARD-PARITY D2): which PA_DashboardContent gadgets the legacy Home shows a given user/role, in what columns/lines, by running the SQL of
// MDashboardContentAccess.get (MDashboardContentAccess.java) on the LOCAL pilot, then the DashboardController filters (preference IsShowInDashboard main vs side panel, active, ORDER BY ColumnNo, Line;
// DashboardController.java:236-300). -> out/dashboard_select_legacy.json. Read-only. READ THE §DSL LINES.
'use strict';
const { execFileSync } = require('child_process'), fs = require('fs'), path = require('path');
const pg = sql => execFileSync('docker', ['exec', '-i', 'postgres', 'psql', '-U', 'postgres', '-d', 'idempiere_pilot', '-tA', '-F', '|', '-c', 'set search_path=adempiere;' + sql], { encoding: 'utf8' }).split('\n').filter(l => l && l !== 'SET');
const out = { cases: [] };
const CASES = [{ name: 'GardenAdmin/GardenWorld Admin', client: 11, role: 102, user: 101 }, { name: 'System/System Administrator', client: 0, role: 0, user: 100 }, { name: 'GardenUser/GardenWorld User', client: 11, role: 103, user: 102 }];
for (const c of CASES) {
  const A = `SELECT PA_DashboardContent_ID, ColumnNo FROM PA_DashboardContent WHERE PA_DashboardContent_ID NOT IN (SELECT PA_DashboardContent_ID FROM PA_DashboardContent_Access WHERE IsActive='Y' AND AD_Client_ID IN (0,${c.client})) AND IsShowInLogin='Y' AND IsActive='Y' AND AD_Client_ID IN (0,${c.client}) AND PA_DashboardContent_ID NOT IN (SELECT PA_DashboardContent_ID FROM PA_DashboardContent_Access ct2 WHERE ct2.IsActive='N' AND ct2.AD_Client_ID IN (0,${c.client}) AND COALESCE(ct2.AD_Role_ID,${c.role})=${c.role} AND COALESCE(ct2.AD_User_ID,${c.user})=${c.user})`;
  const B = `SELECT ct.PA_DashboardContent_ID, ct.ColumnNo FROM PA_DashboardContent ct INNER JOIN PA_DashboardContent_Access cta ON ct.PA_DashboardContent_ID=cta.PA_DashboardContent_ID WHERE cta.IsActive='Y' AND ct.IsActive='Y' AND COALESCE(cta.AD_Role_ID,${c.role})=${c.role} AND COALESCE(cta.AD_User_ID,${c.user})=${c.user} AND cta.AD_Client_ID IN (0,${c.client})`;
  const ids = pg(`select id from (${A} UNION ALL ${B}) u(id,col) order by col, id`).map(Number);
  const rows = ids.length ? pg(`select pa_dashboardcontent_id, name, columnno, line, isshowindashboard, isactive, coalesce(zulfilepath,''), coalesce(ad_chart_id::text,''), coalesce(pa_goal_id::text,'') from pa_dashboardcontent where pa_dashboardcontent_id in (${ids.join(',')})`).map(l => { const a = l.split('|'); return { id: +a[0], name: a[1], col: +a[2], line: +a[3], main: a[4] === 'Y', active: a[5] === 'Y', zul: a[6], chart: a[7], goal: a[8] }; }) : [];
  const keep = rows.filter(r => r.active), by = m => keep.filter(r => r.main === m).sort((x, y) => x.col - y.col || x.line - y.line);
  const o = { ...c, selected: ids, main: by(true).map(r => r.id), side: by(false).map(r => r.id), detail: rows };
  out.cases.push(o); console.log(`§DSL ${c.name} selected=${ids.length} main=[${o.main}] side=[${o.side}]`);
}
fs.mkdirSync(path.join(__dirname, 'out'), { recursive: true }); fs.writeFileSync(path.join(__dirname, 'out', 'dashboard_select_legacy.json'), JSON.stringify(out));
