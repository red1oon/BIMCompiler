#!/usr/bin/env node
// Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
// SPDX-License-Identifier: MIT
/**
 * migrate_pg_to_sqlite.js — ERP Step 0: raw PG→SQLite migration.
 *   Spec: docs/ERP.md §0.10 + prompts/ERP_RAW_MIGRATION.md (TASK Step 0).
 *
 * PRIME RULE: EXTRACT, do not invent. Migrate the FULL iDempiere PG dictionary
 * RAW — no column-strip — into a separate SQLite cluster (build/erp/ad_full.db).
 * This is the SAME pipeline as the §1 ad_seed.db export, run COMPLETE.
 *
 * Source : docker `postgres` container, db idempiere, user adempiere, schema adempiere.
 * Extract: `psql -c "COPY (...) TO STDOUT"` — TEXT format escapes embedded
 *   newlines/tabs/backslashes (\n \t \\) and NULL as \N, so each PG row is exactly
 *   ONE output line and rule-script bodies round-trip BYTE-IDENTICAL after unescape.
 * Build  : better-sqlite3, loose affinity, bytea -> BLOB (hex-decoded).
 *
 * Flagged subset (handled explicitly, logged LOUDLY — never silently dropped):
 *   - sequences : DROPPED (§5 forbids MAX+1).
 *   - functions/triggers : SKIPPED (logic lives in Java/rules, not data).
 *   - views (RV_*, _v) : DEFERRED — definitions SNAPSHOT into _pg_views (translate later).
 * Java is NOT migrated — it stays the §18.10 oracle.
 *
 * READ THE LOG AFTER EVERY RUN. Exit code is not evidence.
 * Run:  node scripts/migrate_pg_to_sqlite.js [2>&1 | tee build/erp/migrate.log]
 * Env:  ERP_TABLES="ad_rule,c_doctype"  -> migrate only those (smoke subset)
 *       ERP_OUT=/path/ad_full.db        -> override output db
 */
'use strict';

var fs = require('fs');
var path = require('path');
var execFileSync = require('child_process').execFileSync;
var Database = require('better-sqlite3');

// ── Config ──────────────────────────────────────────────────────────────────
var CONTAINER = process.env.ERP_PG_CONTAINER || 'postgres';
var DB = process.env.ERP_PG_DB || 'idempiere';
var PGUSER = process.env.ERP_PG_USER || 'adempiere';
var SCHEMA = process.env.ERP_PG_SCHEMA || 'adempiere';
var OUT = process.env.ERP_OUT ||
  path.join(__dirname, '..', 'build', 'erp', 'ad_full.db');
var ONLY = (process.env.ERP_TABLES || '').split(',').map(function (s) {
  return s.trim().toLowerCase();
}).filter(Boolean);
var MAXBUF = 512 * 1024 * 1024; // 512MB — largest table is ~11MB, ample headroom.

// ── §0.10a master-data first-mile (prompts/MIGRATE_SHOWME_OVERLAY.md) ─────────
// Modes layered onto the SAME script (do NOT fork — CLAUDE.md / spec §0.10a):
//   --list-clients / ERP_LIST_CLIENTS=1 : enumerate AD_Client as JSON for the overlay,
//                                          auto-seek the real tenant, then exit.
//   --masters     / ERP_MASTERS=1       : migrate master/metadata tables only (exclude
//                                          documents/transactions/postings/logs), stream
//                                          headline masters per-table, instance-namespaced.
var argv = process.argv.slice(2);
var LIST_CLIENTS = !!process.env.ERP_LIST_CLIENTS || argv.indexOf('--list-clients') >= 0;
var MASTERS = !!process.env.ERP_MASTERS || argv.indexOf('--masters') >= 0;
// Optional explicit target tenant; otherwise auto-seeked from AD_Client (§0.10a).
var TARGET_CLIENT = process.env.ERP_CLIENT ? +process.env.ERP_CLIENT : null;
var INSTANCES = path.join(__dirname, '..', 'build', 'erp', 'instances.json');

// Headline master allowlist — streamed visibly one §-line each ("watch them land").
// Canonical AD casing for display; matched case-insensitively against PG table_name.
// Row counts verified live in GardenWorld 2026-06-02 (§0.10a) — NOT hardcoded here.
var HEADLINE = ['C_BPartner', 'C_BP_Group', 'M_Product', 'M_Product_Category', 'C_UOM',
  'C_ElementValue', 'C_Charge', 'C_Tax', 'C_Currency'];
var HEADLINE_LC = {}; HEADLINE.forEach(function (n) { HEADLINE_LC[n.toLowerCase()] = n; });

// Master/metadata scope = ALL base tables MINUS operational data. Excluded by RULE
// (logged for review, never silently dropped — §0.10a / Log Mandate):
//   (1) document tables  — have a `docstatus` column (queried, not guessed);
//   (2) their line children — name ends 'line' AND stem is a (1) table;
//   (3) postings — fact_acct*;
//   (4) inventory/cost transactions + runtime logs/temp — named below.
// Plugin *logic* (Java) is deferred (§0.10 "Java is NOT migrated"); plugin *metadata*
// tables are KEPT (they are AD metadata, transaction-free) per the 2026-06-02 decision.
var DENY_EXACT = ['m_transaction', 'm_storage', 'm_storageonhand', 'm_costdetail',
  'm_cost', 'm_costhistory', 'ad_changelog', 'ad_session', 'ad_accesslog',
  'ad_pinstance', 'ad_pinstance_para', 'ad_pinstance_log', 'ad_wf_process',
  'ad_wf_processdata', 'ad_wf_activity', 'ad_wf_activityresult', 'ad_wf_eventaudit',
  'ad_recentitem', 'ad_issue', 'ad_ldapaccess'];
function isDenied(tn, docSet) {
  if (DENY_EXACT.indexOf(tn) >= 0) return true;          // (4)
  if (tn.indexOf('fact_acct') === 0) return true;        // (3)
  if (tn.indexOf('t_') === 0) return true;               // temp report tables
  if (docSet[tn]) return true;                           // (1) documents
  if (/line$/.test(tn) && docSet[tn.replace(/line$/, '')]) return true; // (2) doc lines
  return false;
}

// ── PG helpers ──────────────────────────────────────────────────────────────
// Metadata query: tuples-only, unaligned, tab field separator.
function pgMeta(sql) {
  var out = execFileSync('docker',
    ['exec', CONTAINER, 'psql', '-U', PGUSER, '-d', DB,
      '-t', '-A', '-F', '\t', '-c', sql],
    { maxBuffer: MAXBUF, encoding: 'utf8' });
  return out.split('\n').filter(function (l) { return l.length > 0; })
    .map(function (l) { return l.split('\t'); });
}
// COPY a table out in TEXT format. Returns the raw payload (one row per line).
function pgCopy(sql) {
  return execFileSync('docker',
    ['exec', CONTAINER, 'psql', '-U', PGUSER, '-d', DB, '-c', sql],
    { maxBuffer: MAXBUF, encoding: 'utf8' });
}

// Streamed COPY: spool psql stdout to a file (fd handed to the child — no JS buffer), return its path.
var SPOOL_DIR = path.join(path.dirname(OUT), '.migrate_spool');
var BATCH = +process.env.ERP_BATCH || 50000;          // rows per SQLite transaction
var VERBOSE_ROWS = +process.env.ERP_VERBOSE_ROWS || 100000; // log §MIGRATE_ROWS ok for tables this big
var rowMismatch = 0;
function pgCopyToFile(sql) {
  fs.mkdirSync(SPOOL_DIR, { recursive: true });
  var f = path.join(SPOOL_DIR, 'copy_' + process.pid + '.txt');
  var fd = fs.openSync(f, 'w');
  try {
    execFileSync('docker', ['exec', CONTAINER, 'psql', '-U', PGUSER, '-d', DB, '-c', sql],
      { stdio: ['ignore', fd, 'inherit'] });
  } finally { fs.closeSync(fd); }
  return f;
}
// Read a file in 8 MB chunks, call fn(line) per line (carry the partial tail; utf8-safe via StringDecoder).
function forEachLine(file, fn) {
  var SD = require('string_decoder').StringDecoder, dec = new SD('utf8');
  var fd = fs.openSync(file, 'r'), buf = Buffer.allocUnsafe(8 * 1048576), tail = '', got;
  try {
    while ((got = fs.readSync(fd, buf, 0, buf.length, null)) > 0) {
      var parts = (tail + dec.write(buf.slice(0, got))).split('\n');
      tail = parts.pop();
      for (var i = 0; i < parts.length; i++) if (parts[i].length) fn(parts[i]);
    }
    tail += dec.end();
    if (tail.length) fn(tail);
  } finally { fs.closeSync(fd); }
}

// ── COPY TEXT unescape (PostgreSQL copy.c rules) ─────────────────────────────
// A bare field "\N" is NULL. Else decode C-escapes in a single left-to-right
// pass so a literal backslash (emitted as "\\") is never mis-read.
function unescape(s) {
  if (s === '\\N') return null;
  if (s.indexOf('\\') === -1) return s;
  var out = '';
  for (var i = 0; i < s.length; i++) {
    var c = s[i];
    if (c !== '\\') { out += c; continue; }
    var n = s[++i];
    switch (n) {
      case 'n': out += '\n'; break;
      case 't': out += '\t'; break;
      case 'r': out += '\r'; break;
      case 'b': out += '\b'; break;
      case 'f': out += '\f'; break;
      case 'v': out += '\v'; break;
      case '\\': out += '\\'; break;
      default: out += (n === undefined ? '\\' : n); break;
    }
  }
  return out;
}

// PG data_type -> SQLite affinity. Loose by design; only BLOB needs real care.
function affinity(t) {
  if (t === 'bytea') return 'BLOB';
  if (t === 'smallint' || t === 'integer' || t === 'bigint') return 'INTEGER';
  if (t === 'numeric' || t === 'decimal' || t === 'real' ||
    t === 'double precision') return 'NUMERIC';
  return 'TEXT';
}
function q(id) { return '"' + String(id).replace(/"/g, '""') + '"'; }

// ── §0.10a Client discovery + auto-seek ──────────────────────────────────────
// Enumerate AD_Client (id, name, whether it holds master rows). System=0 and the
// GardenWorld seed=11 are well-known; a REAL tenant is any other client id.
function getClients() {
  var rows = pgMeta(
    "SELECT c.ad_client_id, c.name, c.isactive, " +
    "(SELECT count(*) FROM " + q(SCHEMA) + ".c_bpartner b WHERE b.ad_client_id=c.ad_client_id) " +
    "FROM " + q(SCHEMA) + ".ad_client c ORDER BY c.ad_client_id");
  return rows.map(function (r) {
    return { id: +r[0], name: r[1], active: r[2] === 'Y',   // iDempiere IsActive = char(Y/N)
      hasMasters: (+r[3]) > 0, bpartners: +r[3] };
  });
}
// Auto-seek the tenant to label the instance: prefer a client that is NOT System(0)
// and NOT the GardenWorld seed(11); else fall back to 11 (the demo). Returns its id.
function autoSeek(clients) {
  var real = clients.filter(function (c) { return c.id !== 0 && c.id !== 11; });
  if (real.length === 1) return real[0].id;          // exactly one real tenant
  if (real.length > 1) return real[0].id;            // overlay will confirm among many
  var gw = clients.filter(function (c) { return c.id === 11; });
  if (gw.length) return 11;                          // demo box: only System+GardenWorld
  var nonSys = clients.filter(function (c) { return c.id !== 0; });
  return nonSys.length ? nonSys[0].id : 0;
}

// ── §0.10a Instance registry (re-import must not clobber) ────────────────────
// Local counter only — migrated rows keep their source ad_client_id (no FK rewrite).
// First import of client 11 -> instance 11; a later re-import -> next free integer (12…).
function readRegistry() {
  try { return JSON.parse(fs.readFileSync(INSTANCES, 'utf8')); } catch (e) { return []; }
}
function nextInstance(reg, srcKey, targetClient) {
  var used = {}; reg.forEach(function (r) { used[r.instance] = true; });
  var reimport = reg.some(function (r) {
    return r.source === srcKey && r.source_client_id === targetClient;
  });
  var m = targetClient;
  while (used[m]) m++;                               // next free integer >= client id
  return { instance: m, reimport: reimport };
}

// ── Main ────────────────────────────────────────────────────────────────────
function main() {
  var srcKey = 'pg:' + DB + '/' + SCHEMA;

  // ── §0.10a mode: list clients for the overlay, auto-seek, exit ──────────────
  if (LIST_CLIENTS) {
    var clients = getClients();
    var seek = autoSeek(clients);
    // JSON the overlay renders as a picklist (stdout, machine-readable).
    console.log(JSON.stringify({ source: srcKey, clients: clients,
      auto: seek, confirmRequired: true }));
    var real = clients.filter(function (c) { return c.id !== 0; })
      .map(function (c) { return c.id + ':' + c.name; });
    console.log('§MIGRATE-CLIENTS found=[' +
      clients.map(function (c) { return c.id + ':' + c.name; }).join(',') +
      '] real=[' + real.join(',') + '] auto=' + seek + ' confirm-required=Y');
    return;
  }

  // ── §0.10a masters mode: resolve target client + instance + output path ─────
  var docSet = null, instance = null, reimport = false, targetClient = null,
    clientName = '', headlineRows = {}, restTables = 0, restRows = 0, excluded = [];
  if (MASTERS) {
    var cl = getClients();
    targetClient = TARGET_CLIENT != null ? TARGET_CLIENT : autoSeek(cl);
    var tc = cl.filter(function (c) { return c.id === targetClient; })[0];
    clientName = tc ? tc.name : ('client' + targetClient);
    var inst = nextInstance(readRegistry(), srcKey, targetClient);
    instance = inst.instance; reimport = inst.reimport;
    // Namespace output by instance so re-imports coexist (registry confirmed scheme).
    if (!process.env.ERP_OUT) {
      OUT = path.join(__dirname, '..', 'build', 'erp', 'ad_masters_' + instance + '.db');
    }
    console.log('§MIGRATE-AGENT mode=masters source=' + srcKey + ' target-client=' +
      targetClient + ':' + clientName + ' instance=' + instance +
      (reimport ? ' (re-import)' : ' (first)') + ' out=' + OUT);
  }

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  if (fs.existsSync(OUT)) fs.unlinkSync(OUT);
  var sqlite = new Database(OUT);
  if (process.env.ERP_PAGE_SIZE) sqlite.pragma('page_size = ' + (+process.env.ERP_PAGE_SIZE)); // before first table; match httpvfs requestChunkSize
  sqlite.pragma('journal_mode = OFF');
  sqlite.pragma('synchronous = OFF');

  // 1) Base tables (exclude views — handled separately).
  var tables = pgMeta(
    "SELECT table_name FROM information_schema.tables " +
    "WHERE table_schema='" + SCHEMA + "' AND table_type='BASE TABLE' " +
    "ORDER BY table_name").map(function (r) { return r[0]; });
  if (ONLY.length) tables = tables.filter(function (t) { return ONLY.indexOf(t) >= 0; });

  // §0.10a: in masters mode, drop operational data by RULE (logged below).
  if (MASTERS) {
    docSet = {};
    pgMeta("SELECT DISTINCT table_name FROM information_schema.columns " +
      "WHERE table_schema='" + SCHEMA + "' AND column_name='docstatus'")
      .forEach(function (r) { docSet[r[0]] = true; });
    var kept = [];
    tables.forEach(function (t) {
      if (isDenied(t, docSet)) excluded.push(t); else kept.push(t);
    });
    tables = kept;
    console.log('§MIGRATE-AGENT masters-scope kept=' + kept.length +
      ' excluded=' + excluded.length + ' (docstatus=' + Object.keys(docSet).length +
      ' + lines/postings/logs/temp)');
  }

  // 2) All columns for those tables, in ordinal order, with data_type.
  var colRows = pgMeta(
    "SELECT table_name, column_name, data_type, ordinal_position " +
    "FROM information_schema.columns WHERE table_schema='" + SCHEMA + "' " +
    "ORDER BY table_name, ordinal_position");
  var cols = {}; // table -> [{name, type}]
  colRows.forEach(function (r) {
    var tn = r[0];
    if (!cols[tn]) cols[tn] = [];
    cols[tn].push({ name: r[1], type: r[2] });
  });

  var totalRows = 0, doneTables = 0, blobTables = 0;
  console.log('§MIGRATE start tables=' + tables.length + ' out=' + OUT);

  tables.forEach(function (tn) {
    var cs = cols[tn];
    if (!cs || !cs.length) {
      console.log('§MIGRATE skip table=' + tn + ' (no columns)');
      return;
    }
    // CREATE TABLE (loose affinity).
    var ddl = 'CREATE TABLE ' + q(tn) + ' (' +
      cs.map(function (c) { return q(c.name) + ' ' + affinity(c.type); }).join(', ') +
      ')';
    sqlite.exec(ddl);

    var blobIdx = cs.map(function (c, i) { return c.type === 'bytea' ? i : -1; })
      .filter(function (i) { return i >= 0; });
    if (blobIdx.length) blobTables++;

    // COPY data out (explicit column list = guaranteed order match). Spec: ERP_SHARD_GENERATOR.md §9.
    // Streamed: psql stdout is spooled to a file (never held in a JS string), then read in chunks and
    // inserted in batches — heap is bounded by chunk+batch, not by table size.
    var collist = cs.map(function (c) { return q(c.name); }).join(',');
    var spool = pgCopyToFile('COPY (SELECT ' + collist + ' FROM ' + q(SCHEMA) + '.' + q(tn) +
      ') TO STDOUT');

    var ins = sqlite.prepare('INSERT INTO ' + q(tn) + ' VALUES (' +
      cs.map(function () { return '?'; }).join(',') + ')');

    var n = 0, inTx = false;
    function onLine(line) {
      var fields = line.split('\t');
      var vals = new Array(cs.length);
      for (var fi = 0; fi < cs.length; fi++) {
        var v = unescape(fields[fi]);
        if (v !== null && blobIdx.indexOf(fi) >= 0) {
          // bytea TEXT output is "\x<hex>"; decode to a real BLOB.
          v = (v.slice(0, 2) === '\\x')
            ? Buffer.from(v.slice(2), 'hex')
            : Buffer.from(v, 'binary');
        }
        vals[fi] = v;
      }
      if (!inTx) { sqlite.exec('BEGIN'); inTx = true; }
      ins.run(vals);
      n++;
      if (n % BATCH === 0) { sqlite.exec('COMMIT'); inTx = false; }
    }
    forEachLine(spool, onLine);
    if (inTx) sqlite.exec('COMMIT');
    fs.unlinkSync(spool);

    // §MIGRATE_ROWS — silent row loss check: SQLite count vs PG count(*) (independent of the COPY stream).
    var pgN = +pgMeta('SELECT count(*) FROM ' + q(SCHEMA) + '.' + q(tn))[0][0];
    var sqN = sqlite.prepare('SELECT count(*) AS c FROM ' + q(tn)).get().c;
    if (pgN !== sqN || pgN !== n) {
      rowMismatch++;
      console.log('§MIGRATE_ROWS FAIL table=' + tn + ' pg=' + pgN + ' streamed=' + n + ' sqlite=' + sqN);
    } else if (n >= VERBOSE_ROWS) {
      console.log('§MIGRATE_ROWS ok table=' + tn + ' rows=' + n + ' rssMB=' +
        Math.round(process.memoryUsage().rss / 1048576));
    }
    // §MIGRATE_NUMERIC_WIDE — NUMERIC values SQLite kept as TEXT (lossless-reversible rule) i.e. wider than a double.
    cs.forEach(function (c) {
      if (affinity(c.type) !== 'NUMERIC' || !n) return;
      var w = sqlite.prepare('SELECT count(*) AS c FROM ' + q(tn) + ' WHERE typeof(' + q(c.name) + ")='text'").get().c;
      if (w) console.log('§MIGRATE_NUMERIC_WIDE table=' + tn + ' col=' + c.name + ' textRows=' + w);
    });
    totalRows += n;
    doneTables++;

    // §0.10a: stream headline masters one §-line each (overlay reflects this);
    // summarize the rest of the metadata corpus.
    if (MASTERS) {
      if (HEADLINE_LC[tn]) {
        headlineRows[HEADLINE_LC[tn]] = n;
        console.log('§MIGRATE stream table=' + HEADLINE_LC[tn] + ' rows=' + n);
      } else { restTables++; restRows += n; }
    }
  });

  // ERP_INDEX=1 — recreate PG index column-lists (PK + every plain index) AFTER load. Range-read (httpvfs) needs them:
  // without an index a keyed lookup scans the whole table (GBs over HTTP). Off by default (dictionary DBs ship unindexed).
  if (process.env.ERP_INDEX) {
    var t0 = Date.now(), nIdx = 0, loaded = {}; tables.forEach(function (t) { loaded[t] = true; });
    pgMeta("SELECT c.relname, ic.relname, string_agg(a.attname, ',' ORDER BY k.ord) FROM pg_index i " +
      "JOIN pg_class c ON c.oid=i.indrelid JOIN pg_class ic ON ic.oid=i.indexrelid " +
      "JOIN pg_namespace n ON n.oid=c.relnamespace " +
      "CROSS JOIN LATERAL unnest(i.indkey) WITH ORDINALITY k(attnum,ord) " +
      "JOIN pg_attribute a ON a.attrelid=c.oid AND a.attnum=k.attnum " +
      "WHERE n.nspname='" + SCHEMA + "' AND i.indexprs IS NULL AND i.indpred IS NULL AND k.attnum>0 " +
      "GROUP BY c.relname, ic.relname").forEach(function (r) {
      if (!loaded[r[0]]) return;
      sqlite.exec('CREATE INDEX ' + q('ix_' + r[1]) + ' ON ' + q(r[0]) + ' (' +
        r[2].split(',').map(q).join(',') + ')');
      nIdx++;
    });
    console.log('§MIGRATE_INDEX created=' + nIdx + (nIdx ? '' : ' INCONCLUSIVE') + ' sec=' + Math.round((Date.now() - t0) / 1000) +
      ' pageSize=' + sqlite.pragma('page_size', { simple: true }));
  }

  // 3) Flagged subset — explicit, loud.
  var seqCount = +pgMeta("SELECT count(*) FROM information_schema.sequences " +
    "WHERE sequence_schema='" + SCHEMA + "'")[0][0];
  var fnCount = +pgMeta("SELECT count(*) FROM information_schema.routines " +
    "WHERE routine_schema='" + SCHEMA + "'")[0][0];
  var trgCount = +pgMeta("SELECT count(DISTINCT trigger_name) FROM information_schema.triggers " +
    "WHERE trigger_schema='" + SCHEMA + "'")[0][0];

  // Views: SNAPSHOT definitions (deferred translation). Only when migrating full set.
  var viewCount = 0, viewSnap = 0;
  sqlite.exec('CREATE TABLE _pg_views (view_name TEXT, definition TEXT)');
  if (!ONLY.length && !MASTERS) {
    var views = pgMeta("SELECT table_name FROM information_schema.views " +
      "WHERE table_schema='" + SCHEMA + "' ORDER BY table_name")
      .map(function (r) { return r[0]; });
    viewCount = views.length;
    var vins = sqlite.prepare('INSERT INTO _pg_views VALUES (?,?)');
    var vtx = sqlite.transaction(function () {
      views.forEach(function (vn) {
        var def = pgCopy("COPY (SELECT pg_get_viewdef('" + SCHEMA + '.' + vn +
          "'::regclass, true)) TO STDOUT");
        var lines = def.split('\n'); if (lines[lines.length - 1] === '') lines.pop();
        vins.run(vn, lines.map(unescape).join('\n'));
        viewSnap++;
      });
    });
    vtx();
  }

  // 4) Migration provenance + flagged-subset record.
  sqlite.exec('CREATE TABLE _migration_meta (key TEXT, value TEXT)');
  var meta = sqlite.prepare('INSERT INTO _migration_meta VALUES (?,?)');
  [['source', 'pg:' + DB + '/' + SCHEMA], ['tables', String(doneTables)],
  ['rows', String(totalRows)], ['blob_tables', String(blobTables)],
  ['flagged_sequences', String(seqCount) + ' (dropped)'],
  ['flagged_functions', String(fnCount) + ' (skipped)'],
  ['flagged_triggers', String(trgCount) + ' (skipped)'],
  ['flagged_views', String(viewCount) + ' (snapshot=' + viewSnap + ', deferred)']
  ].forEach(function (kv) { meta.run(kv[0], kv[1]); });
  if (MASTERS) {
    [['mode', 'masters'], ['instance', String(instance)],
    ['target_client', targetClient + ':' + clientName],
    ['headline_tables', String(Object.keys(headlineRows).length)],
    ['metadata_tables', String(restTables)], ['excluded_operational', String(excluded.length)]
    ].forEach(function (kv) { meta.run(kv[0], kv[1]); });
  }

  // 5) Rule/policy corpus accounting — read BACK from the migrated SQLite (proves
  //    the §1-stripped layer survived raw). Guarded: only when the full set ran.
  var ruleLine = '';
  if (!ONLY.length && !MASTERS) {
    function cnt(sql) { try { return sqlite.prepare(sql).get().c; } catch (e) { return 'NA'; } }
    var nRule = cnt('SELECT count(*) c FROM ad_rule');
    var nVal = cnt('SELECT count(*) c FROM ad_val_rule');
    var nCallout = cnt("SELECT count(*) c FROM ad_column WHERE callout IS NOT NULL AND callout<>''");
    // docTypeFlags F = how many of the §0.9 policy-flag columns survived on c_doctype.
    // C_DocType policy flags MOrder.completeIt() branches on (DeliveryRule lives on
    // C_Order, not here — §0.9). All four are stripped from ad_seed.db, kept raw here.
    var flagCols = ['isautogenerateinout', 'isautogenerateinvoice', 'docsubtypeso', 'docsubtypeinv'];
    var present = sqlite.prepare("SELECT name FROM pragma_table_info('c_doctype')").all()
      .map(function (r) { return r.name.toLowerCase(); });
    var nFlags = flagCols.filter(function (c) { return present.indexOf(c) >= 0; }).length;
    ruleLine = '§MIGRATE rules AD_Rule=' + nRule + ' AD_Val_Rule=' + nVal +
      ' callouts=' + nCallout + ' docTypeFlags=' + nFlags + '/' + flagCols.length +
      ' docTypes=' + cnt('SELECT count(*) c FROM c_doctype');
  }

  sqlite.close();

  // ── §-log acceptance ────────────────────────────────────────────────────
  console.log('§MIGRATE_VERDICT ' + (doneTables === 0 ? 'INCONCLUSIVE (no tables judged)' :
    rowMismatch === 0 ? 'PASS rows-match-all-tables' : 'FAIL rowMismatch=' + rowMismatch) +
    ' tables=' + doneTables + ' peakRssMB=' + Math.round(process.resourceUsage().maxRSS / 1024));
  try { fs.rmdirSync(SPOOL_DIR); } catch (e) { /* non-empty/absent */ }
  console.log('§MIGRATE tables=' + doneTables + ' rows=' + totalRows +
    ' blobTables=' + blobTables);
  if (ruleLine) console.log(ruleLine);

  // §0.10a masters-mode acceptance: persist the instance, emit the witnesses.
  if (MASTERS) {
    var reg = readRegistry();
    reg.push({ instance: instance, source: srcKey, source_client_id: targetClient,
      client_name: clientName, reimport: reimport, out: path.basename(OUT),
      tables: doneTables, rows: totalRows, when: new Date().toISOString() });
    fs.writeFileSync(INSTANCES, JSON.stringify(reg, null, 2));

    var head = HEADLINE.filter(function (h) { return headlineRows[h] != null; })
      .map(function (h) { return h + '=' + headlineRows[h]; });
    var docCount = docSet ? Object.keys(docSet).length : 0;
    console.log('§MIGRATE-AGENT source=' + srcKey + ' instance=' + instance +
      ' masters=[' + head.join(',') + '] tables=' + doneTables + ' rows=' + totalRows +
      ' metadata=+' + restTables + ' docs-skipped=Y(' + docCount + ') plugins-logic-skipped=Y');
    console.log('§MIGRATE-INSTANCE source-client=' + targetClient + ' reimport=' +
      (reimport ? 'Y' : 'N') + ' instance=' + instance);
    // Operational tables excluded — listed for review (Log Mandate, never silent).
    console.log('§MIGRATE-AGENT excluded-operational n=' + excluded.length + ' [' +
      excluded.slice(0, 40).join(',') + (excluded.length > 40 ? ',…' : '') + ']');
    return;
  }

  console.log('§MIGRATE flagged sequences=' + seqCount + ' (dropped) functions=' +
    fnCount + ' (skipped) triggers=' + trgCount + ' (skipped) views=' + viewCount +
    ' (snapshot=' + viewSnap + ', deferred)');
}

main();
