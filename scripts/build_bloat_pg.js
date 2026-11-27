#!/usr/bin/env node
// Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
// SPDX-License-Identifier: MIT
/**
 * build_bloat_pg.js — scratch "bloated client" PG database for the large-migration / shard-split tests.
 *   Spec: docs/internal/ERP_SHARD_GENERATOR.md §9 (bed) + §10 (split).
 *
 * NON-INVENT: every row is a real GardenWorld row replicated K times (SAME K for every table). Copy g of a row
 * gets new ids  max_id(table) + (g-1)*n_rows(table) + rank(id)  — dense, unique, int4-safe. EVERY foreign key into
 * another replicated table (by `<stem>_id` convention, plus fact_acct.record_id via ad_table_id) is re-mapped with the
 * SAME copy g, so copy g of an invoice points at copy g of its order → real reference chains at scale.
 * FK constraints are dropped in the SCRATCH db (replication_role=replica); FK-column indexes are re-created.
 * NEVER touches the working `idempiere` DB: clones it (CREATE DATABASE … TEMPLATE) to ERP_BLOAT_DB.
 *
 * Env: BLOAT_GB=10  ERP_BLOAT_DB=bloat10r  (PG container/user as in migrate_pg_to_sqlite.js)
 * READ THE LOG: §BLOAT lines; final §BLOAT_VERDICT.
 */
'use strict';
var execFileSync = require('child_process').execFileSync;
var CONTAINER = process.env.ERP_PG_CONTAINER || 'postgres', PGUSER = process.env.ERP_PG_USER || 'adempiere';
var SRC = process.env.ERP_PG_DB || 'idempiere', DST = process.env.ERP_BLOAT_DB || 'bloat10r';
var SCHEMA = process.env.ERP_PG_SCHEMA || 'adempiere';
var GB = +process.env.BLOAT_GB || 10, CHUNK = +process.env.BLOAT_CHUNK || 1000; // copies per INSERT statement
// Replicated set: the document graph (headers+lines+dependents) + two bulk-log filler tables.
var PLAN = ['c_order', 'c_orderline', 'c_invoice', 'c_invoiceline', 'm_inout', 'm_inoutline', 'm_inoutconfirm',
  'm_matchinv', 'm_matchpo', 'c_payment', 'c_allocationhdr', 'c_allocationline', 'gl_journal', 'gl_journalline',
  'c_bankstatement', 'c_bankstatementline', 'm_movement', 'm_movementline', 'm_transaction', 'm_costdetail',
  'fact_acct', 'ad_changelog', 'ad_session'];
var PKCOL = { ad_changelog: 'ad_changelog_id' }; // composite PK: re-key one component only

function psql(db, sql) {
  return execFileSync('docker', ['exec', CONTAINER, 'psql', '-U', PGUSER, '-d', db, '-v', 'ON_ERROR_STOP=1',
    '-At', '-c', sql], { encoding: 'utf8', maxBuffer: 64 << 20 }).trim();
}
function log(s) { console.log(s); }
var inSet = {}; PLAN.forEach(function (t) { inSet[t] = true; });

log('§BLOAT start src=' + SRC + ' dst=' + DST + ' targetGB=' + GB);
if (DST === SRC) { log('§BLOAT REFUSE dst==src'); process.exit(2); }
psql('postgres', 'DROP DATABASE IF EXISTS ' + DST);
psql('postgres', 'CREATE DATABASE ' + DST + ' TEMPLATE ' + SRC);

// drop FKs touching the set, and all non-PK indexes on set tables (replicated keys must not collide on UNIQUEs)
var inList = PLAN.map(function (t) { return "'" + SCHEMA + "." + t + "'::regclass"; }).join(',');
psql(DST, "DO $$ DECLARE r record; BEGIN FOR r IN SELECT conrelid::regclass AS t, conname FROM pg_constraint " +
  "WHERE contype='f' AND (conrelid IN (" + inList + ") OR confrelid IN (" + inList + ")) LOOP " +
  "EXECUTE 'ALTER TABLE ' || r.t || ' DROP CONSTRAINT ' || quote_ident(r.conname); END LOOP; END $$");

// ── pass 1: metadata per table
var M = {}, bad = 0, ok = 0;
var tid = {}; psql(DST, "SELECT ad_table_id||'|'||lower(tablename) FROM " + SCHEMA + ".ad_table").split('\n')
  .forEach(function (r) { var p = r.split('|'); tid[p[1]] = +p[0]; });
PLAN.forEach(function (t) {
  var fq = SCHEMA + '.' + t;
  psql(DST, "SELECT 'DROP INDEX IF EXISTS ' || schemaname || '.\"' || indexname || '\"' FROM pg_indexes " +
    "WHERE schemaname='" + SCHEMA + "' AND tablename='" + t + "' AND indexname NOT IN " +
    "(SELECT conname FROM pg_constraint WHERE conrelid='" + fq + "'::regclass AND contype='p')")
    .split('\n').filter(Boolean).forEach(function (d) {
      try { psql(DST, d); } catch (e) { var nm = /"(.+)"/.exec(d)[1]; psql(DST, 'ALTER TABLE ' + fq + ' DROP CONSTRAINT "' + nm + '"'); }
    });
  var pk = PKCOL[t] || psql(DST, "SELECT a.attname FROM pg_index i JOIN pg_attribute a ON a.attrelid=i.indrelid AND a.attnum=ANY(i.indkey) " +
    "WHERE i.indrelid='" + fq + "'::regclass AND i.indisprimary").split('\n')[0];
  var n0 = +psql(DST, 'SELECT count(*) FROM ' + fq);
  if (!n0) { log('§BLOAT_VACUOUS table=' + t + ' source has 0 rows — dropped from plan'); bad++; delete inSet[t]; return; }
  M[t] = { pk: pk, n0: n0, mx: +psql(DST, 'SELECT max(' + pk + ') FROM ' + fq),
    rowB: +psql(DST, 'SELECT avg(pg_column_size(x.*))::int + 28 FROM ' + fq + ' x'),
    cols: psql(DST, "SELECT column_name||'|'||data_type FROM information_schema.columns WHERE table_schema='" + SCHEMA +
      "' AND table_name='" + t + "' ORDER BY ordinal_position").split('\n').map(function (r) { return r.split('|'); }) };
});
var live = PLAN.filter(function (t) { return M[t]; });
var perCopy = live.reduce(function (a, t) { return a + M[t].n0 * M[t].rowB; }, 0);
var K = Math.ceil(GB * 1073741824 / perCopy);
live.forEach(function (t) { var cap = Math.floor((2147483000 - M[t].mx) / M[t].n0) - 1; if (K > cap) { K = cap; log('§BLOAT_CAP K capped to ' + K + ' by ' + t); } });
log('§BLOAT plan tables=' + live.length + ' perCopyKB=' + Math.round(perCopy / 1024) + ' K=' + K);

// _src_<t> = source rows + dense rank (the id map), indexed on pk
live.forEach(function (t) {
  psql(DST, 'DROP TABLE IF EXISTS _src_' + t);
  psql(DST, 'CREATE TABLE _src_' + t + ' AS SELECT *, row_number() OVER (ORDER BY ' + M[t].pk + ') AS rn FROM ' + SCHEMA + '.' + t);
  psql(DST, 'CREATE INDEX ON _src_' + t + ' (' + M[t].pk + ')');
  psql(DST, 'ALTER TABLE ' + SCHEMA + '.' + t + ' SET UNLOGGED');
});
function mapExpr(S, joinAlias) { return '(' + M[S].mx + ' + (g.g-1)*' + M[S].n0 + ' + ' + joinAlias + '.rn)'; }

// ── pass 2: replicate with consistent FK re-mapping
live.forEach(function (t) {
  var joins = [], sel = [];
  M[t].cols.forEach(function (c, i) {
    var name = c[0], type = c[1], stem = name.slice(-3) === '_id' ? name.slice(0, -3) : null;
    if (name === M[t].pk) { sel.push(M[t].mx + ' + (g.g-1)*' + M[t].n0 + ' + s.rn'); return; }
    if (/_uu$/.test(name)) { sel.push(type === 'uuid' ? 'gen_random_uuid()' : 'gen_random_uuid()::text'); return; }
    if (stem && stem !== t && M[stem]) {                         // FK into another replicated table
      var a = 'j' + i; joins.push('LEFT JOIN _src_' + stem + ' ' + a + ' ON ' + a + '.' + M[stem].pk + ' = s.' + name);
      sel.push('COALESCE(' + mapExpr(stem, a) + ', s.' + name + ')'); return;
    }
    if (t === 'fact_acct' && name === 'record_id') {              // polymorphic: owner table named by ad_table_id
      var whens = [];
      live.forEach(function (P) {
        if (!tid[P] || P === 'fact_acct') return;
        var a = 'p_' + P; joins.push('LEFT JOIN _src_' + P + ' ' + a + ' ON s.ad_table_id = ' + tid[P] + ' AND ' + a + '.' + M[P].pk + ' = s.record_id');
        whens.push('WHEN ' + a + '.rn IS NOT NULL THEN ' + mapExpr(P, a));
      });
      sel.push('(CASE ' + whens.join(' ') + ' ELSE s.record_id END)'); return;
    }
    sel.push('s.' + name);
  });
  var fq = SCHEMA + '.' + t;
  for (var lo = 1; lo <= K; lo += CHUNK) {
    var hi = Math.min(K, lo + CHUNK - 1);
    psql(DST, 'SET session_replication_role=replica; INSERT INTO ' + fq + ' SELECT ' + sel.join(',') +
      ' FROM _src_' + t + ' s CROSS JOIN generate_series(' + lo + ',' + hi + ') g(g) ' + joins.join(' '));
  }
  var n1 = +psql(DST, 'SELECT count(*) FROM ' + fq), heap = +psql(DST, "SELECT pg_relation_size('" + fq + "')");
  var good = n1 === M[t].n0 * (K + 1); good ? ok++ : bad++;
  log('§BLOAT table=' + t + ' srcRows=' + M[t].n0 + ' copies=' + K + ' rows=' + n1 + ' heapMB=' + Math.round(heap / 1048576) +
    ' fkRemapped=' + joins.length + (good ? '' : ' ROWCOUNT-MISMATCH'));
});

// ── FK-column indexes (kept so the migrator's ERP_INDEX recreates them; range reads need them)
var nIdx = 0;
live.forEach(function (t) {
  M[t].cols.forEach(function (c) {
    var name = c[0], stem = name.slice(-3) === '_id' ? name.slice(0, -3) : null;
    if (name !== M[t].pk && stem && stem !== t && M[stem]) { psql(DST, 'CREATE INDEX ON ' + SCHEMA + '.' + t + ' (' + name + ')'); nIdx++; }
  });
});
psql(DST, 'CREATE INDEX ON ' + SCHEMA + '.fact_acct (ad_table_id, record_id)'); nIdx++;
live.forEach(function (t) { psql(DST, 'DROP TABLE IF EXISTS _src_' + t); });
log('§BLOAT fkIndexes=' + nIdx);

// ── referential check: replicated FKs must resolve (a sample of the graph edges, whole-table anti-joins)
var dangling = 0;
[['c_orderline', 'c_order_id', 'c_order'], ['c_invoice', 'c_order_id', 'c_order'], ['c_invoiceline', 'c_invoice_id', 'c_invoice'],
 ['m_inoutline', 'm_inout_id', 'm_inout'], ['m_inoutline', 'c_orderline_id', 'c_orderline'], ['m_transaction', 'm_inoutline_id', 'm_inoutline']]
  .forEach(function (e) {
    if (!M[e[0]] || !M[e[2]]) return;
    var d = +psql(DST, 'SELECT count(*) FROM ' + SCHEMA + '.' + e[0] + ' x WHERE x.' + e[1] + ' IS NOT NULL AND NOT EXISTS ' +
      '(SELECT 1 FROM ' + SCHEMA + '.' + e[2] + ' y WHERE y.' + e[2] + '_id = x.' + e[1] + ')');
    dangling += d; log('§BLOAT_FKCHECK ' + e[0] + '.' + e[1] + ' -> ' + e[2] + ' dangling=' + d);
  });
log('§BLOAT_VERDICT ' + (ok === 0 ? 'INCONCLUSIVE (nothing replicated)' : (bad || dangling) ? 'FAIL tables-bad=' + bad + ' dangling=' + dangling : 'PASS') +
  ' tablesOk=' + ok + ' K=' + K + ' dbSize=' + psql(DST, "SELECT pg_size_pretty(pg_database_size('" + DST + "'))"));
