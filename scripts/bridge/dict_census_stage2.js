// SPDX-License-Identifier: GPL-2.0-only
// ⚠ DO NOT REMOVE — §DICT-CENSUS stage 2 (prompts/ERP_DEPTH_FILM.md): for every dictionary table whose row COUNT differs between the LOCAL pilot and the seed-as-loaded
//   (ad_seed.db + erp/patches/ad_seed.db.sql applied statement by statement), diff the primary KEYS: which legacy rows are missing in the twin, which twin rows legacy lacks,
//   grouped by entitytype (+ a few names). Read-only. READ THE §DC2 LINES; out/dict_census_stage2.json holds the full key lists.
// usage: ERP=/tmp/wt-erp-depth/erp NODE_PATH=~/bim-ootb/node_modules node scripts/bridge/dict_census_stage2.js
'use strict';
const { execFileSync } = require('child_process'), fs = require('fs'), path = require('path');
const ERP = process.env.ERP || '/tmp/wt-erp-depth/erp';
const pg = sql => execFileSync('docker', ['exec', '-i', 'postgres', 'psql', '-U', 'postgres', '-d', 'idempiere_pilot', '-tA', '-F', '\t', '-c', 'set search_path=adempiere;' + sql], { encoding: 'utf8', maxBuffer: 1 << 28 }).split('\n').filter(l => l && l !== 'SET');
const initSqlJs = require(path.join(ERP, 'sqljs', 'sql-wasm.js'));   // the repo's own build matches its wasm (a node_modules build does not)
(async () => {
  const SQL = await initSqlJs({ wasmBinary: fs.readFileSync(path.join(ERP, 'sqljs', 'sql-wasm.wasm')) });
  const db = new SQL.Database(fs.readFileSync(path.join(ERP, 'ad_seed.db')));
  fs.readFileSync(path.join(ERP, 'patches', 'ad_seed.db.sql'), 'utf8').split(/;\s*\n/).forEach(st => { st = st.replace(/^\s*--[^\n]*\n?/gm, '').trim(); if (st) try { db.run(st); } catch (e) {} });
  const L = JSON.parse(fs.readFileSync(path.join(__dirname, 'out', 'dict_census_legacy.json'), 'utf8')), out = {}, summary = [];
  const RUNTIME = /^(ad_changelog|ad_session|ad_pinstance|ad_pinstance_para|ad_pinstance_log|ad_issue|ad_attachment|ad_migrationscript|ad_package_imp.*|ad_alertprocessorlog|ad_schedulerlog|ad_workflowprocessorlog|ad_sequence_no|ad_note|ad_recentitem)$/;
  for (const t of Object.keys(L).sort()) {
    if (t.startsWith('__') || RUNTIME.test(t) || /_trl$/.test(t)) continue;
    const by = L[t].byClient, leg = (by['0'] || 0) + (by['11'] || 0) + (by['none'] || 0); if (!leg) continue;
    const ti = db.exec("SELECT lower(name), pk FROM pragma_table_info('" + t + "')"); if (!ti.length) continue;   // absent tables: stage 3 (DDL)
    const cols = ti[0].values.map(r => r[0]), hasC = cols.includes('ad_client_id'), where = hasC ? ' WHERE ad_client_id IN (0,11)' : '';
    const n = db.exec('SELECT count(*) FROM ' + t + where)[0].values[0][0]; if (n === leg) continue;
    // key = the legacy primary key (information_schema), falling back to <table>_id
    let pk = pg(`select kcu.column_name from information_schema.table_constraints tc join information_schema.key_column_usage kcu using (constraint_name, table_schema) where tc.table_schema='adempiere' and tc.table_name='${t}' and tc.constraint_type='PRIMARY KEY' order by kcu.ordinal_position`);
    if (!pk.length) pk = cols.includes(t + '_id') ? [t + '_id'] : []; if (!pk.length || pk.some(c => !cols.includes(c))) { summary.push(`§DC2 ${t} legacy=${leg} seed=${n} NOKEY`); continue; }
    const et = cols.includes('entitytype') ? ", coalesce(entitytype,'')" : "", nm = cols.includes('name') ? ", coalesce(name,'')" : cols.includes('value') ? ", coalesce(value,'')" : "";
    const lrows = pg(`select ${pk.map(c => c + '::text').join(", ")}${et}${nm} from ${t}${where}`).map(l => l.split('\t'));
    const k = l => l.slice(0, pk.length).join('|'), lm = new Map(lrows.map(l => [k(l), l]));
    const srows = db.exec(`SELECT ${pk.join(',')}${et ? ", coalesce(entitytype,'')" : ''}${nm ? (cols.includes('name') ? ", coalesce(name,'')" : ", coalesce(value,'')") : ''} FROM ${t}${where}`)[0].values.map(r => r.map(String));
    const sm = new Map(srows.map(r => [k(r), r]));
    const missing = [...lm.keys()].filter(x => !sm.has(x)), extra = [...sm.keys()].filter(x => !lm.has(x));
    const grp = (keys, M) => { const g = {}; keys.forEach(x => { const r = M.get(x), e = et ? r[pk.length] : '-'; g[e] = (g[e] || 0) + 1; }); return g; };
    const ex = (keys, M) => keys.slice(0, 4).map(x => { const r = M.get(x); return r.slice(pk.length).join(':') || x; });
    out[t] = { pk, legacy: leg, seed: n, missing: missing.length, extra: extra.length, missingByEntity: grp(missing, lm), extraByEntity: grp(extra, sm), sampleMissing: ex(missing, lm), sampleExtra: ex(extra, sm), missingKeys: missing, extraKeys: extra };
    summary.push(`§DC2 ${t} legacy=${leg} seed=${n} missing=${missing.length} extra=${extra.length} missingBy=${JSON.stringify(out[t].missingByEntity)} extraBy=${JSON.stringify(out[t].extraByEntity)} eg_missing=${JSON.stringify(out[t].sampleMissing)}`);
  }
  summary.forEach(s => console.log(s));
  fs.writeFileSync(path.join(__dirname, 'out', 'dict_census_stage2.json'), JSON.stringify(out));
  console.log(`§DC2-SUMMARY tablesWithCountDiff=${Object.keys(out).length} missingRows=${Object.values(out).reduce((a, o) => a + o.missing, 0)} extraRows=${Object.values(out).reduce((a, o) => a + o.extra, 0)}`);
})().catch(e => { console.log('§DC2 CRASH ' + (e.stack || e)); process.exit(2); });
