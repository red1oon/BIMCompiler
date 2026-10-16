// ⚠ DO NOT REMOVE — scope: ERP parallel-run pilot §3; read the log after every run. Logs carry ids/counts, never names.
// pilot_usage.js — usage-weighted coverage: what the DB's data ACTUALLY used vs what our ERP ported (data/ported.json,
// data/ported_{callouts,processes}.txt, data/hook_classes_225.txt — all from ledger §PORT-COVERAGE).
// Usage: PILOT_PG_DB=<db> PILOT_CLIENT_ID=<n> node pilot_usage.js   → §PILOT-USAGE lines + ~/.cache/pilot/usage_<db>.json
'use strict';
const fs = require('fs'), path = require('path'), os = require('os');
const cfg = require('./pilot_cfg');
const D = n => path.join(__dirname, 'data', n);
const ported = JSON.parse(fs.readFileSync(D('ported.json'), 'utf8'));
const pCallouts = new Set(fs.readFileSync(D('ported_callouts.txt'), 'utf8').split('\n').filter(Boolean));
const pProcs = new Set(fs.readFileSync(D('ported_processes.txt'), 'utf8').split('\n').filter(Boolean));
// ledger §PORT-COVERAGE row 4 counted engine-registered handlers only; the page ALSO registers handlers inline
// (crud_overlay.js _ensureHostCallouts). Union both so the ranking is not inflated by that undercount (§PILOT finding F-LEDGER-4).
let inlineAdded = 0;
try { for (const f of fs.readdirSync(path.join(cfg.OOTB, 'erp')).filter(f => /\.js$/.test(f))) {
  const src = fs.readFileSync(path.join(cfg.OOTB, 'erp', f), 'utf8'); let m; const re = /registerHandler\(\s*'((?:org|com)\.[A-Za-z0-9_.$]+)'/g;
  while ((m = re.exec(src))) { const set = /\.(process|report)\./.test(m[1]) || /Process|Generate|Aging|Import/.test(m[1]) ? pProcs : pCallouts; if (!set.has(m[1])) { set.add(m[1]); inlineAdded++; } } } } catch (e) { console.log('§PILOT-USAGE note: could not scan ' + cfg.OOTB + '/erp (' + e.message + ')'); }
const hookCls = fs.readFileSync(D('hook_classes_225.txt'), 'utf8').split('\n').filter(Boolean).map(s => s.replace(/\.java$/, ''));
const C = cfg.CLIENT_ID;
const out = [], items = [];
const U = (area, used, portedStr, extra) => { const l = '§PILOT-USAGE area=' + area + ' used=' + used + ' ported=' + portedStr + (extra ? ' ' + extra : ''); out.push(l); console.log(l); };

// ── per-table row counts (client-scoped) for every table carrying ad_client_id ─────────────────────────────────────
const rows = cfg.psql("select table_name, (xpath('/row/c/text()', query_to_xml(format('select count(*) as c from %I where ad_client_id=%s', table_name, " + C + "), false, true, '')))[1]::text::int " +
  "from information_schema.columns where table_schema='" + cfg.PG_SCHEMA + "' and column_name='ad_client_id' and table_name in (select table_name from information_schema.tables where table_schema='" + cfg.PG_SCHEMA + "' and table_type='BASE TABLE') and table_name not like 'ad\\_%' and table_name not like 'ws\\_%' and table_name not like 'i\\_%' and table_name not like 't\\_%' and table_name not like 'pa\\_%'")
  .map(r => [r[0], Number(r[1])]).filter(r => r[1] > 0).sort((a, b) => b[1] - a[1]);
const rowsByTable = Object.fromEntries(rows);
U('tables_with_data', rows.length, 'n/a', 'client=' + C + ' totalRows=' + rows.reduce((s, r) => s + r[1], 0));

// ── 1. Documents: doc tables × doctype × docstatus ─────────────────────────────────────────────────────────────────
const DOCT = [['c_order', 'c_doctypetarget_id'], ['c_invoice', 'c_doctypetarget_id'], ['m_inout', 'c_doctype_id'], ['c_payment', 'c_doctype_id'], ['c_allocationhdr', 'c_doctype_id'],
  ['gl_journal', 'c_doctype_id'], ['m_movement', 'c_doctype_id'], ['m_inventory', 'c_doctype_id'], ['c_bankstatement', 'c_doctype_id'], ['c_cash', 'c_doctype_id'], ['m_requisition', 'c_doctype_id']];
for (const [t, dcol] of DOCT) {
  if (!rowsByTable[t]) continue;
  const hasDt = Number(cfg.psql(`select count(*) from information_schema.columns where table_schema='${cfg.PG_SCHEMA}' and table_name='${t}' and column_name='${dcol}'`)[0][0]) > 0;
  const g = cfg.psql(hasDt ? `select coalesce(d.docbasetype,'?'),coalesce(d.docsubtypeso,''),h.docstatus,count(*) from ${t} h left join c_doctype d on d.c_doctype_id=h.${dcol} where h.ad_client_id=${C} group by 1,2,3 order by 4 desc`
    : `select '?','',h.docstatus,count(*) from ${t} h where h.ad_client_id=${C} group by 1,2,3 order by 4 desc`);
  const total = g.reduce((s, r) => s + Number(r[3]), 0);
  const gate = ported.statusGatedTables.includes(t) ? 'status-gated' : 'no', fan = ported.docFanoutTables.includes(t) ? 'fanout' : 'no';
  U('doc:' + t, total, gate + '/' + fan, 'byTypeStatus=' + g.map(r => r[0] + (r[1] ? '.' + r[1] : '') + ':' + r[2] + '=' + r[3]).join(','));
  items.push({ area: 'doc-action', item: t, used: total, ported: ported.docFanoutTables.includes(t) ? 'partial' : (ported.statusGatedTables.includes(t) ? 'status-only' : 'ABSENT') });
}
// reversals / voids actually used (DocStatus VO/RE) = reverseCorrect consequences (ledger 2a: 0/25 ported)
let rev = 0;
for (const [t] of DOCT) if (rowsByTable[t]) rev += Number(cfg.psql(`select count(*) from ${t} where ad_client_id=${C} and docstatus in ('VO','RE')`)[0][0]);
U('doc_void_reverse', rev, '0', 'ledger 2a: voidIt/reverseCorrect consequences 0/25 ported');
if (rev) items.push({ area: 'void/reverse consequences', item: 'VO/RE docs', used: rev, ported: 'ABSENT' });

// ── 2. Posting: Fact_Acct by AD_Table_ID ───────────────────────────────────────────────────────────────────────────
const fa = cfg.psql(`select f.ad_table_id,t.tablename,count(*),count(distinct f.record_id) from fact_acct f join ad_table t on t.ad_table_id=f.ad_table_id where f.ad_client_id=${C} group by 1,2 order by 3 desc`);
for (const r of fa) {
  const ui = ported.postUiTables.includes(r[1].toLowerCase()), hl = ported.postHeadlessTables.map(x => x.toLowerCase()).includes(r[1].toLowerCase());
  U('post:' + r[1], r[3], ui ? 'ui-preview-only' : (hl ? 'headless-only' : 'ABSENT'), 'tableId=' + r[0] + ' factLines=' + r[2] + ' docs=' + r[3]);
  items.push({ area: 'posting', item: r[1], used: Number(r[3]), ported: ui ? 'preview-only(page)' : (hl ? 'headless-only' : 'ABSENT') });
}
// ── 3. Processes run (AD_PInstance) ────────────────────────────────────────────────────────────────────────────────
const pi = cfg.psql(`select p.ad_process_id,coalesce(p.classname,''),p.isreport,count(*) from ad_pinstance i join ad_process p on p.ad_process_id=i.ad_process_id where i.ad_client_id=${C} group by 1,2,3 order by 4 desc`);
for (const r of pi) {
  const ok = pProcs.has(r[1]);
  U('process:' + r[0], r[3], ok ? 'Y' : 'N', 'classname=' + (r[1] || '(none)') + ' isreport=' + r[2]);
  items.push({ area: 'process', item: (r[1] || 'AD_Process#' + r[0]), used: Number(r[3]), ported: ok ? 'Y' : 'ABSENT' });
}
if (!pi.length) U('process', 0, 'n/a', 'INCONCLUSIVE no AD_PInstance rows for client ' + C);
// ── 4. Workflows (AD_WF_Process) ───────────────────────────────────────────────────────────────────────────────────
const wf = cfg.psql(`select w.ad_workflow_id,w.name,count(*) from ad_wf_process p join ad_workflow w on w.ad_workflow_id=p.ad_workflow_id where p.ad_client_id=${C} group by 1,2 order by 3 desc`);
for (const r of wf) { U('workflow:' + r[0], r[2], '0', 'ledger 7: AD_Workflow 0/58 wired; DocAction bypasses workflow'); items.push({ area: 'workflow', item: 'AD_Workflow#' + r[0], used: Number(r[2]), ported: 'ABSENT' }); }
// ── 5. Callouts on columns of tables that hold data (weighted by the table's rows) ─────────────────────────────────
const co = cfg.psql(`select t.tablename,c.columnname,c.callout from ad_column c join ad_table t on t.ad_table_id=c.ad_table_id where c.isactive='Y' and c.callout is not null and c.callout<>''`);
const agg = {};
for (const [tn, cn, cs] of co) {
  const n = rowsByTable[tn.toLowerCase()] || 0; if (!n) continue;
  for (const one of cs.split(';').map(s => s.trim()).filter(Boolean)) {
    const k = one.replace(/^[^.]*\./, m => m);   // keep full string
    const a = agg[one] || (agg[one] = { used: 0, cols: [] }); a.used += n; a.cols.push(tn + '.' + cn);
  }
}
const coList = Object.entries(agg).sort((a, b) => b[1].used - a[1].used);
let coPorted = 0;
for (const [cs, a] of coList) { const ok = pCallouts.has(cs); if (ok) coPorted++; items.push({ area: 'callout', item: cs + ' [' + a.cols.slice(0, 3).join(',') + ']', used: a.used, ported: ok ? 'Y' : 'ABSENT' }); }
U('callouts_on_populated_tables', coList.length, coPorted + '/' + coList.length, 'inlineRegisteredAddedToLedgerSet=' + inlineAdded + ' distinct callout strings on columns of tables that hold rows; used=sum(rows of owning table)');
// ── 6. Model hooks by populated table (class name ↔ table by convention, unmapped reported) ────────────────────────
const norm = s => s.toLowerCase().replace(/_/g, '');
const clsByNorm = Object.fromEntries(hookCls.map(c => [norm(c.replace(/^M/, '')), c]));
let hk = 0, hkPorted = 0, unmapped = 0;
for (const [t, n] of rows) {
  const base = norm(t.replace(/^[a-z]+?_/, ''));
  const cls = clsByNorm[base] || clsByNorm[norm(t)];
  if (!cls) continue;
  hk++; const p = ported.hookClassesPorted[cls];
  if (p) hkPorted++;
  items.push({ area: 'model hooks', item: cls + ' (' + t + ')', used: n, ported: p ? ('beforeSave only') : 'ABSENT' });
}
U('model_hook_classes_on_populated_tables', hk, hkPorted + '/' + hk, 'afterSave/delete hooks 0 fired in shipped UI (ledger 1b)');
// ── 7. ColumnSQL virtual columns + @SQL= defaults on populated tables ──────────────────────────────────────────────
const vc = cfg.psql(`select t.tablename,count(*) from ad_column c join ad_table t on t.ad_table_id=c.ad_table_id where c.isactive='Y' and c.columnsql is not null group by 1`).filter(r => rowsByTable[r[0].toLowerCase()]);
const vcN = vc.reduce((s, r) => s + Number(r[1]), 0);
U('columnsql_virtual_columns', vcN, '0', 'on ' + vc.length + ' populated tables; ledger 8f: 0/66 wired');
for (const r of vc) items.push({ area: 'ColumnSQL', item: r[0] + ' ×' + r[1], used: rowsByTable[r[0].toLowerCase()], ported: 'ABSENT' });
// ── 8. Document numbering (sequences actually advanced) ────────────────────────────────────────────────────────────
const sq = cfg.psql(`select count(*),sum(case when startnewyear='Y' then 1 else 0 end) from ad_sequence where ad_client_id=${C} and isactive='Y' and isautosequence='Y' and currentnext>coalesce(startno,1)`)[0];
U('sequences_advanced', sq[0], 'partial', 'startNewYear=' + sq[1] + ' (ledger 8a: StartNewYear/@Year@/row-lock absent)');

// ── ranked backlog: unported/partial items by real usage ───────────────────────────────────────────────────────────
const rank = items.filter(i => i.ported !== 'Y').sort((a, b) => b.used - a.used);
console.log('§PILOT-BACKLOG ranked unported/partial by real use (top 25 of ' + rank.length + ')');
rank.slice(0, 25).forEach((i, k) => { const l = '§PILOT-BACKLOG rank=' + (k + 1) + ' used=' + i.used + ' area=' + i.area + ' item=' + i.item + ' ported=' + i.ported; out.push(l); console.log(l); });
const dir = path.join(os.homedir(), '.cache', 'pilot'); fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(path.join(dir, 'usage_' + cfg.PG_DB + '.json'), JSON.stringify({ db: cfg.PG_DB, client: C, items }, null, 1));
