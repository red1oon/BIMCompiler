#!/usr/bin/env node
// Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
// SPDX-License-Identifier: MIT
/**
 * migrate_fidelity_check.js — does the SQLite file hold EXACTLY what PG holds, every value of every table?
 *   Spec: docs/internal/ERP_SHARD_GENERATOR.md §14.   READ THE LOG: §FIDELITY lines + §FIDELITY_VERDICT.
 *   Usage: node scripts/migrate_fidelity_check.js <sqlite.db> <pg-database> [--part i/N] [--tables a,b]
 * Per table: (row count, exact sum of 60-bit md5 prefixes of the canonical row). Order-independent. Read-only on both sides.
 */
'use strict';
var Database = require('better-sqlite3'), crypto = require('crypto'), cp = require('child_process');
var SQ = process.argv[2], PGDB = process.argv[3];
if (!SQ || !PGDB) { console.log('usage: migrate_fidelity_check.js <sqlite.db> <pg-database> [--part i/N] [--tables a,b]'); process.exit(2); }
var CONTAINER = process.env.ERP_PG_CONTAINER || 'postgres', PGUSER = process.env.ERP_PG_USER || 'adempiere', SCHEMA = process.env.ERP_PG_SCHEMA || 'adempiere';
var pi = process.argv.indexOf('--part'), PART = pi > 0 ? process.argv[pi + 1].split('/').map(Number) : [0, 1];
var ti = process.argv.indexOf('--tables'), ONLY = ti > 0 ? process.argv[ti + 1].split(',') : null;
var T0 = Date.now(); function sec() { return Math.round((Date.now() - T0) / 1000) + 's'; }
function q(x) { return '"' + x + '"'; }
function pg(sql) {
  return cp.execFileSync('docker', ['exec', CONTAINER, 'psql', '-U', PGUSER, '-d', PGDB, '-v', 'ON_ERROR_STOP=1', '-At', '-F', '\t', '-c', sql],
    { encoding: 'utf8', maxBuffer: 256 << 20 }).trim();
}
var db = new Database(SQ, { readonly: true }); db.defaultSafeIntegers(true);

var hasSidecar = !!db.prepare("SELECT 1 FROM sqlite_master WHERE type='table' AND name='_numeric_exact'").get();
var cols = {}; // table -> [{name,type}]
pg("SELECT table_name, column_name, data_type FROM information_schema.columns WHERE table_schema='" + SCHEMA + "' AND table_name IN (SELECT table_name FROM information_schema.tables WHERE table_schema='" + SCHEMA + "' AND table_type='BASE TABLE') ORDER BY table_name, ordinal_position")
  .split('\n').filter(Boolean).forEach(function (l) { var p = l.split('\t'); (cols[p[0]] = cols[p[0]] || []).push({ name: p[1], type: p[2] }); });
var tables = Object.keys(cols).sort();
if (ONLY) tables = tables.filter(function (t) { return ONLY.indexOf(t) >= 0; });

function kind(t) {
  if (t === 'smallint' || t === 'integer' || t === 'bigint') return 'int';
  if (t === 'numeric' || t === 'decimal') return 'num';
  if (t === 'real' || t === 'double precision') return 'flt';
  if (t === 'bytea') return 'blob';
  if (t === 'character') return 'chr';
  return 'txt';
}
function pgCanon(c) {
  var k = kind(c.type), col = q(c.name);
  if (k === 'num') return "coalesce(trim_scale(" + col + ")::text, E'\\\\N')";
  if (k === 'blob') return "coalesce(encode(" + col + ", 'hex'), E'\\\\N')";
  if (k === 'chr') return "coalesce(rtrim(" + col + "::text), E'\\\\N')";
  return "coalesce(" + col + "::text, E'\\\\N')";
}
function trimZeros(s) { return /\./.test(s) ? s.replace(/0+$/, '').replace(/\.$/, '') : s; }
function numStr(n) {                               // shortest round-trip decimal, exponent expanded
  var s = String(n);
  if (/e/i.test(s)) s = trimZeros(n.toFixed(20));
  return s === '-0' ? '0' : s;
}
function sqCanon(v, k) {
  if (v === null) return '\\N';
  if (k === 'blob') return Buffer.isBuffer(v) ? v.toString('hex') : String(v);
  if (typeof v === 'bigint') return v.toString();
  if (typeof v === 'number') return numStr(v);
  if (k === 'num') return trimZeros(v);
  if (k === 'chr') return v.replace(/ +$/, '');
  return v;
}

// assign tables to parts by size (largest first, round robin) so parallel parts finish together
var sizes = tables.map(function (t) { try { return { t: t, n: Number(db.prepare('SELECT count(*) c FROM ' + q(t)).get().c) }; } catch (e) { return { t: t, n: -1 }; } });
sizes.sort(function (a, b) { return b.n - a.n; });
var mine = sizes.filter(function (x, i) { return i % PART[1] === PART[0]; });
console.log('§FIDELITY start part=' + PART[0] + '/' + PART[1] + ' tables=' + mine.length + ' of ' + tables.length + ' sqlite=' + SQ.split('/').pop() + ' pgdb=' + PGDB);

var judgedRows = 0, judgedTables = 0, mism = 0, colBad = 0;
mine.forEach(function (x) {
  var t = x.t, cs = cols[t];
  if (x.n < 0) { console.log('§FIDELITY table=' + t + ' MISSING in sqlite'); mism++; return; }
  var sc = db.prepare("SELECT name FROM pragma_table_info(?)").all(t).map(function (r) { return r.name; });
  if (sc.join(',') !== cs.map(function (c) { return c.name; }).join(',')) { console.log('§FIDELITY_COLS table=' + t + ' columns differ'); colBad++; return; }
  // PG side
  var canon = cs.map(pgCanon), chunks = [];       // PG functions take <= 100 args: chunk, then join with chr(31)
  for (var ci = 0; ci < canon.length; ci += 80) chunks.push('concat_ws(chr(31), ' + canon.slice(ci, ci + 80).join(', ') + ')');
  var hash = "('x' || substr(md5(" + chunks.join(' || chr(31) || ') + "), 1, 15))::bit(60)::bigint";
  var pr = pg('SELECT count(*), coalesce(sum(h::numeric), 0) FROM (SELECT ' + hash + ' AS h FROM ' + SCHEMA + '.' + q(t) + ') x').split('\t');
  // SQLite side (exact-numeric sidecar overrides the stored double where present, §14.2)
  var kinds = cs.map(function (c) { return kind(c.type); }), sum = 0n, n = 0, exact = null;
  if (hasSidecar) {
    var er = db.prepare('SELECT row_id, col, exact FROM _numeric_exact WHERE tbl = ?').all(t);
    if (er.length) { exact = {}; er.forEach(function (e) { exact[String(e.row_id) + '|' + e.col] = e.exact; }); }
  }
  var it = db.prepare((exact ? 'SELECT rowid, * FROM ' : 'SELECT * FROM ') + q(t)).raw(true).iterate();
  for (var row of it) {
    var parts = new Array(kinds.length), off = exact ? 1 : 0;
    for (var i = 0; i < kinds.length; i++) {
      var ex = exact ? exact[String(row[0]) + '|' + cs[i].name] : undefined;
      parts[i] = ex !== undefined ? trimZeros(ex) : sqCanon(row[i + off], kinds[i]);
    }
    sum += BigInt('0x' + crypto.createHash('md5').update(parts.join('\x1f')).digest('hex').slice(0, 15));
    n++;
  }
  var ok = String(n) === pr[0] && sum.toString() === pr[1];
  if (n > 0) { judgedRows += n; judgedTables++; }
  if (!ok) mism++;
  if (!ok || n >= 100000) console.log('§FIDELITY table=' + t + ' rows=' + n + ' pgRows=' + pr[0] + ' pg=' + pr[1] + ' sq=' + sum + ' ' + (ok ? 'OK' : 'MISMATCH') + ' t=' + sec());
});
console.log('§FIDELITY_VERDICT part=' + PART[0] + '/' + PART[1] + ' ' + (!judgedRows ? 'INCONCLUSIVE (no rows judged)' : (mism || colBad) ? 'FAIL mismatches=' + mism + ' colMismatch=' + colBad : 'PASS') +
  ' tables=' + mine.length + ' judgedTables=' + judgedTables + ' judgedRows=' + judgedRows + ' totalSec=' + sec());
