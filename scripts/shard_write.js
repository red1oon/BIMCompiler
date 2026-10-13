#!/usr/bin/env node
// Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
// SPDX-License-Identifier: MIT
/**
 * shard_write.js — materialise the warm/cold split plan into two small-schema SQLite files.
 *   Spec: docs/internal/ERP_SHARD_GENERATOR.md §11.   READ THE LOG: §SHARD_* lines + §SHARD_VERDICT.
 *   Usage: node scripts/shard_write.js <source.db> <planner-work.db> <outdir>
 * Source and work DB are only SELECTed. Output: <outdir>/warm.db, cold.db (16 KB pages) + manifest.json.
 */
'use strict';
var Database = require('better-sqlite3'), fs = require('fs'), path = require('path'), crypto = require('crypto');
var SRC = path.resolve(process.argv[2] || ''), WORK = path.resolve(process.argv[3] || ''), OUT = path.resolve(process.argv[4] || '');
if (!fs.existsSync(SRC) || !fs.existsSync(WORK) || !process.argv[4]) { console.log('usage: shard_write.js <source.db> <work.db> <outdir>'); process.exit(2); }
fs.mkdirSync(OUT, { recursive: true });
var WP = path.join(OUT, 'warm.db'), CP = path.join(OUT, 'cold.db');
[WP, CP].forEach(function (f) { fs.rmSync(f, { force: true }); });
var T0 = Date.now(); function sec() { return Math.round((Date.now() - T0) / 1000) + 's'; }
function q(x) { return '"' + x + '"'; }

var db = new Database(':memory:');
['src:' + SRC, 'work:' + WORK, 'warm:' + WP, 'cold:' + CP].forEach(function (a) {
  var i = a.indexOf(':'); db.exec("ATTACH DATABASE '" + a.slice(i + 1).replace(/'/g, "''") + "' AS " + a.slice(0, i));
});
db.pragma('warm.page_size = 16384'); db.pragma('cold.page_size = 16384');
db.pragma('warm.journal_mode = OFF'); db.pragma('cold.journal_mode = OFF'); db.pragma('warm.synchronous = OFF'); db.pragma('cold.synchronous = OFF');
db.pragma('temp_store = FILE');
var SH = 4294967296;
var tbls = db.prepare('SELECT name, kind, tblno, hdr FROM work.tbls ORDER BY kind, name').all();
console.log('§SHARD start tables=' + tbls.length + ' coldUnits=' + db.prepare('SELECT count(*) c FROM work.cold').get().c + ' t=' + sec());
var manifest = { source: path.basename(SRC), tables: {}, files: {} }, bad = 0, judged = 0;

tbls.forEach(function (t) {
  var ddl = db.prepare("SELECT sql FROM src.sqlite_master WHERE type='table' AND name=?").get(t.name);
  if (!ddl) return;
  var cols = db.prepare('SELECT lower(name) n FROM pragma_table_info(?, ?)').all(t.name, 'src').map(function (r) { return r.n; });
  var pk = t.name + '_id';
  var predCold;
  if (t.kind === 'H') predCold = '(' + (t.tblno * SH) + ' + x.' + q(pk) + ') IN (SELECT u FROM work.cold)';
  else if (t.kind === 'L') predCold = '(' + (t.tblno * SH) + ' + x.' + q(t.hdr + '_id') + ') IN (SELECT u FROM work.cold)';
  else predCold = '(' + (t.tblno * SH) + ' + x.' + q(pk) + ') IN (SELECT dep FROM work.depcold)';
  ['warm', 'cold'].forEach(function (side) {
    var sql = ddl.sql.replace(/^CREATE TABLE\s+("[^"]+"|\S+)/i, 'CREATE TABLE ' + side + '.$1');
    db.exec(sql);
    db.exec('INSERT INTO ' + side + '.' + q(t.name) + ' SELECT x.* FROM src.' + q(t.name) + ' x WHERE ' + (side === 'cold' ? predCold : 'NOT (' + predCold + ')'));
    db.prepare("SELECT sql FROM src.sqlite_master WHERE type='index' AND tbl_name=? AND sql IS NOT NULL").all(t.name).forEach(function (ix) {
      db.exec(ix.sql.replace(/^CREATE\s+(UNIQUE\s+)?INDEX\s+("[^"]+"|\S+)/i, function (m, u, n) { return 'CREATE ' + (u || '') + 'INDEX ' + side + '.' + n; }));
    });
  });
  var n = db.prepare('SELECT count(*) c FROM src.' + q(t.name)).get().c;
  var w = db.prepare('SELECT count(*) c FROM warm.' + q(t.name)).get().c, c = db.prepare('SELECT count(*) c FROM cold.' + q(t.name)).get().c;
  manifest.tables[t.name] = { kind: t.kind, source: n, warm: w, cold: c };
  if (n > 0) judged++;
  var ok = w + c === n; if (!ok) bad++;
  if (n >= 100000 || !ok) console.log('§SHARD_ROWS table=' + t.name + ' warm=' + w + ' cold=' + c + ' source=' + n + (ok ? ' ok' : ' MISMATCH') + ' t=' + sec());
});
console.log('§SHARD_ROWS summary tables=' + tbls.length + ' judged=' + judged + ' mismatches=' + bad + ' t=' + sec());

// unit integrity: every line sits in the SAME file as its header (R1), measured on the OUTPUT files
var orphans = 0;
tbls.filter(function (t) { return t.kind === 'L'; }).forEach(function (t) {
  ['warm', 'cold'].forEach(function (side) {
    var hasPk = db.prepare("SELECT 1 FROM " + side + ".sqlite_master WHERE type='index' AND tbl_name=?").get(t.hdr);
    var o = db.prepare('SELECT count(*) c FROM ' + side + '.' + q(t.name) + ' l WHERE NOT EXISTS (SELECT 1 FROM ' + side + '.' + q(t.hdr) + ' h WHERE h.' + q(t.hdr + '_id') + ' = l.' + q(t.hdr + '_id') + ')').get().c;
    orphans += o; if (o) console.log('§SHARD_UNIT_INTACT FAIL ' + side + '.' + t.name + ' orphan lines=' + o);
  });
});
console.log('§SHARD_UNIT_INTACT lineOrphans=' + orphans);

// reverse closure on the OUTPUT files: a warm row must not reference a row that lives only in cold
var edges = [['c_invoice', 'c_order_id', 'c_order'], ['c_invoiceline', 'c_orderline_id', 'c_orderline'], ['m_inoutline', 'c_orderline_id', 'c_orderline'],
  ['m_inoutconfirm', 'm_inout_id', 'm_inout'], ['c_allocationline', 'c_invoice_id', 'c_invoice'], ['m_transaction', 'm_inoutline_id', 'm_inoutline'],
  ['m_matchinv', 'm_inoutline_id', 'm_inoutline'], ['m_matchpo', 'c_orderline_id', 'c_orderline']];
var wtc = 0, judgedEdges = 0;
edges.forEach(function (e) {
  var has = function (t, s) { return !!db.prepare("SELECT 1 FROM " + s + ".sqlite_master WHERE type='table' AND name=?").get(t); };
  if (!has(e[0], 'warm') || !has(e[2], 'cold')) return;
  var cols = db.prepare('SELECT lower(name) n FROM pragma_table_info(?, ?)').all(e[0], 'warm').map(function (r) { return r.n; });
  if (cols.indexOf(e[1]) < 0) return;
  var pk = e[2] + '_id';
  var n = db.prepare('SELECT count(*) c FROM warm.' + q(e[0]) + ' w WHERE w.' + q(e[1]) + ' IS NOT NULL AND EXISTS (SELECT 1 FROM cold.' + q(e[2]) + ' c WHERE c.' + q(pk) + ' = w.' + q(e[1]) + ')').get().c;
  judgedEdges++; wtc += n; console.log('§SHARD_WARM_TO_COLD ' + e[0] + '.' + e[1] + ' -> ' + e[2] + ' rows=' + n);
});
console.log('§SHARD_WARM_TO_COLD total=' + wtc + ' edgesJudged=' + judgedEdges + ' t=' + sec());

db.exec('DETACH warm; DETACH cold;'); db.close();
[WP, CP].forEach(function (f) {
  var h = crypto.createHash('sha256'), fd = fs.openSync(f, 'r'), buf = Buffer.allocUnsafe(8 << 20), n;
  while ((n = fs.readSync(fd, buf, 0, buf.length, null)) > 0) h.update(buf.subarray(0, n));
  fs.closeSync(fd);
  manifest.files[path.basename(f)] = { bytes: fs.statSync(f).size, sha256: h.digest('hex') };
  console.log('§SHARD_FILE ' + path.basename(f) + ' MB=' + Math.round(fs.statSync(f).size / 1048576) + ' sha256=' + manifest.files[path.basename(f)].sha256.slice(0, 16) + ' t=' + sec());
});
fs.writeFileSync(path.join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 1));
console.log('§SHARD_VERDICT ' + (!judged ? 'INCONCLUSIVE (no rows judged)' : (bad || orphans || wtc) ? 'FAIL mismatches=' + bad + ' lineOrphans=' + orphans + ' warm->cold=' + wtc :
  'PASS rows-exhaustive units-intact warm->cold=0 (edgesJudged=' + judgedEdges + ')') + ' totalSec=' + sec());
