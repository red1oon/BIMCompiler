#!/usr/bin/env node
// Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
// SPDX-License-Identifier: MIT
/**
 * build_bloat_pg.js — scratch "bloated client" PG database for the large-migration test.
 *   Spec: docs/internal/ERP_SHARD_GENERATOR.md §9 (Bloat test bed).
 *
 * NON-INVENT: every row is a real GardenWorld row replicated K times. ONLY the table's own surrogate PK
 * (+ *_uu uuid) is re-keyed, so PKs stay unique. FKs are NOT re-keyed and FK constraints are dropped in the
 * SCRATCH db — this bed tests migrate size/memory/row+sum fidelity, NOT referential closure.
 * NEVER touches the working `idempiere` DB: clones it (CREATE DATABASE … TEMPLATE) to ERP_BLOAT_DB.
 *
 * Env: BLOAT_GB=10  ERP_BLOAT_DB=bloat10  (PG container/user as in migrate_pg_to_sqlite.js)
 * READ THE LOG: §BLOAT lines; final §BLOAT_VERDICT.
 */
'use strict';
var execFileSync = require('child_process').execFileSync;
var CONTAINER = process.env.ERP_PG_CONTAINER || 'postgres', PGUSER = process.env.ERP_PG_USER || 'adempiere';
var SRC = process.env.ERP_PG_DB || 'idempiere', DST = process.env.ERP_BLOAT_DB || 'bloat10';
var SCHEMA = process.env.ERP_PG_SCHEMA || 'adempiere';
var GB = +process.env.BLOAT_GB || 10, CHUNK = 2000; // copies per INSERT statement
// table -> share of the byte budget (heap dominated by postings/logs/lines, as in a mature client)
var PLAN = { fact_acct: .30, m_costdetail: .12, c_orderline: .14, c_order: .06, m_transaction: .06,
  c_invoiceline: .08, c_invoice: .04, m_inoutline: .06, m_inout: .02, ad_changelog: .08, ad_session: .04 };
var PKCOL = { ad_changelog: 'ad_changelog_id' }; // composite PK: re-key one component only

function psql(db, sql, opt) {
  return execFileSync('docker', ['exec', CONTAINER, 'psql', '-U', PGUSER, '-d', db, '-v', 'ON_ERROR_STOP=1',
    '-At', '-c', sql], { encoding: 'utf8', maxBuffer: 64 << 20 }).trim();
}
function log(s) { console.log(s); }

log('§BLOAT start src=' + SRC + ' dst=' + DST + ' targetGB=' + GB);
if (DST === SRC) { log('§BLOAT REFUSE dst==src'); process.exit(2); }
psql('postgres', 'DROP DATABASE IF EXISTS ' + DST);
psql('postgres', 'CREATE DATABASE ' + DST + ' TEMPLATE ' + SRC);
var ok = 0, bad = 0, totalBytes = 0;
// drop only the FKs touching a replicated table (either direction), in ONE call
var inList = Object.keys(PLAN).map(function (t) { return "'" + SCHEMA + "." + t + "'::regclass"; }).join(',');
psql(DST, "DO $$ DECLARE r record; BEGIN FOR r IN SELECT conrelid::regclass AS t, conname FROM pg_constraint " +
  "WHERE contype='f' AND (conrelid IN (" + inList + ") OR confrelid IN (" + inList + ")) LOOP " +
  "EXECUTE 'ALTER TABLE ' || r.t || ' DROP CONSTRAINT ' || quote_ident(r.conname); END LOOP; END $$");
Object.keys(PLAN).forEach(function (t) {
  var fq = SCHEMA + '.' + t;
  // drop non-PK indexes / unique constraints so replicated keys cannot collide on them
  psql(DST, "SELECT 'DROP INDEX IF EXISTS ' || schemaname || '.\"' || indexname || '\"' FROM pg_indexes " +
    "WHERE schemaname='" + SCHEMA + "' AND tablename='" + t + "' AND indexname NOT IN " +
    "(SELECT conname FROM pg_constraint WHERE conrelid='" + fq + "'::regclass AND contype='p')")
    .split('\n').filter(Boolean).forEach(function (d) {
      try { psql(DST, d); } catch (e) { // backing a UNIQUE constraint → drop the constraint instead
        var nm = /"(.+)"/.exec(d)[1]; psql(DST, 'ALTER TABLE ' + fq + ' DROP CONSTRAINT "' + nm + '"');
      }
    });
  var pk = PKCOL[t] || psql(DST, "SELECT a.attname FROM pg_index i JOIN pg_attribute a ON a.attrelid=i.indrelid AND a.attnum=ANY(i.indkey) " +
    "WHERE i.indrelid='" + fq + "'::regclass AND i.indisprimary").split('\n')[0];
  var n0 = +psql(DST, 'SELECT count(*) FROM ' + fq);
  if (!n0) { log('§BLOAT_VACUOUS table=' + t + ' source has 0 rows — skipped'); bad++; return; }
  var rowB = +psql(DST, 'SELECT avg(pg_column_size(x.*))::int + 28 FROM ' + fq + ' x');
  var mn = +psql(DST, 'SELECT min(' + pk + ') FROM ' + fq), mx = +psql(DST, 'SELECT max(' + pk + ') FROM ' + fq);
  var stride = mx - mn + 1, K = Math.max(1, Math.ceil(PLAN[t] * GB * 1073741824 / (rowB * n0)));
  var maxId = mx + (K + 1) * n0;
  if (maxId > 2147483000) { K = Math.floor((2147483000 - mx) / n0) - 1; log('§BLOAT_CAP table=' + t + ' K capped to ' + K + ' (int4 pk)'); }
  var cols = psql(DST, "SELECT column_name||'|'||data_type FROM information_schema.columns WHERE table_schema='" +
    SCHEMA + "' AND table_name='" + t + "' ORDER BY ordinal_position").split('\n').map(function (r) { return r.split('|'); });
  var sel = cols.map(function (c) {
    if (c[0] === pk) return (mx) + ' + (g.g-1)*' + n0 + ' + s.rn';
    if (/_uu$/.test(c[0])) return c[1] === 'uuid' ? 'gen_random_uuid()' : 'gen_random_uuid()::text';
    return 's.' + c[0];
  }).join(',');
  psql(DST, 'DROP TABLE IF EXISTS _src_' + t);
  psql(DST, 'CREATE TABLE _src_' + t + ' AS SELECT *, row_number() OVER (ORDER BY ' + pk + ') AS rn FROM ' + fq);
  psql(DST, 'ALTER TABLE ' + fq + ' SET UNLOGGED');
  for (var lo = 1; lo <= K; lo += CHUNK) {
    var hi = Math.min(K, lo + CHUNK - 1);
    psql(DST, 'SET session_replication_role=replica; INSERT INTO ' + fq + ' SELECT ' + sel +
      ' FROM _src_' + t + ' s CROSS JOIN generate_series(' + lo + ',' + hi + ') g(g)');
  }
  psql(DST, 'DROP TABLE _src_' + t);
  var n1 = +psql(DST, 'SELECT count(*) FROM ' + fq);
  var heap = +psql(DST, 'SELECT pg_relation_size(\'' + fq + '\')');
  totalBytes += heap;
  var good = n1 === n0 * (K + 1);
  good ? ok++ : bad++;
  log('§BLOAT table=' + t + ' srcRows=' + n0 + ' copies=' + K + ' rows=' + n1 + ' heapMB=' + Math.round(heap / 1048576) +
    ' pk=' + pk + ' idRange=' + mx + '..' + (mx + K * n0) + (good ? '' : ' ROWCOUNT-MISMATCH'));
});
log('§BLOAT_VERDICT ' + (ok === 0 ? 'INCONCLUSIVE (nothing replicated)' : bad ? 'FAIL tables-bad=' + bad : 'PASS') +
  ' tablesOk=' + ok + ' replicatedHeapGB=' + (totalBytes / 1073741824).toFixed(2) +
  ' dbSize=' + psql(DST, "SELECT pg_size_pretty(pg_database_size('" + DST + "'))"));
