#!/usr/bin/env node
// Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
// SPDX-License-Identifier: MIT
/**
 * shard_split_plan_sql.js — set-based warm/cold split planner (aggregate units + reverse closure) for BIG SQLite files.
 *   Spec: docs/internal/ERP_SHARD_GENERATOR.md §10 + §10.2.   READ THE LOG: §SPLIT_* lines + §SPLIT_VERDICT.
 *   Usage: node scripts/shard_split_plan_sql.js <source.db> <work.db> [--stress-cutoff YYYY-MM-DD] [--dump-cold file]
 * The source is only SELECTed. All working tables live in <work.db>. Same rules as shard_split_plan.js (the JS reference).
 */
'use strict';
var Database = require('better-sqlite3');
var fs = require('fs');
var SRC = process.argv[2], WORK = process.argv[3];
var si = process.argv.indexOf('--stress-cutoff'), CUTOFF = si > 0 ? process.argv[si + 1] : null;
var sti = process.argv.indexOf('--statuses'), STATUSES = (sti > 0 ? process.argv[sti + 1] : 'CL,VO,RE').split(',').filter(Boolean); // terminal DocStatus (§12.1)
var di = process.argv.indexOf('--dump-cold'), DUMP = di > 0 ? process.argv[di + 1] : null;
if (!SRC || !WORK) { console.log('usage: shard_split_plan_sql.js <source.db> <work.db>'); process.exit(2); }
if (fs.existsSync(WORK)) fs.unlinkSync(WORK);
var db = new Database(WORK);
db.pragma('journal_mode = OFF'); db.pragma('synchronous = OFF'); db.pragma('temp_store = FILE');
db.exec("ATTACH DATABASE '" + SRC.replace(/'/g, "''") + "' AS src");
var T0 = Date.now();
function sec() { return Math.round((Date.now() - T0) / 1000) + 's'; }
function q(x) { return '"' + x + '"'; }
function one(sql) { return db.prepare(sql).get(); }

var names = db.prepare("SELECT name FROM src.sqlite_master WHERE type='table'").all().map(function (r) { return r.name; });
var set = {}; names.forEach(function (n) { set[n] = true; });
var C = {}; names.forEach(function (t) { C[t] = db.prepare('SELECT lower(name) n FROM pragma_table_info(?, ?)').all(t, 'src').map(function (r) { return r.n; }); });
function nrows(t) { return one('SELECT count(*) c FROM src.' + q(t)).c; }

var hdr = names.filter(function (t) { return C[t].indexOf('docstatus') >= 0 && C[t].indexOf(t + '_id') >= 0 && nrows(t) > 0; });
var lineOf = {};
hdr.forEach(function (h) { [h + 'line', h.replace(/hdr$/, '') + 'line'].forEach(function (l) {
  if (set[l] && C[l].indexOf(h + '_id') >= 0 && !lineOf[l]) lineOf[l] = h; }); });
var deps = ['fact_acct', 'm_transaction', 'm_costdetail', 'm_matchinv', 'm_matchpo', 'c_allocationline']
  .filter(function (t) { return set[t] && !lineOf[t] && hdr.indexOf(t) < 0; });
var NO = {}; hdr.forEach(function (h, i) { NO[h] = i + 1; });                       // header table numbers
var DNO = {}; deps.forEach(function (d, i) { DNO[d] = 100 + i; });                  // dependent table numbers
var SH = 4294967296;
function ucode(h, expr) { return '(' + (NO[h] * SH) + ' + ' + expr + ')'; }

db.exec('CREATE TABLE cand(u INTEGER PRIMARY KEY); CREATE TABLE cold(u INTEGER PRIMARY KEY);' +
  'CREATE TABLE ue(src INTEGER, dst INTEGER, PRIMARY KEY(src,dst)) WITHOUT ROWID;' +
  'CREATE TABLE de(dep INTEGER, dst INTEGER, PRIMARY KEY(dep,dst)) WITHOUT ROWID; CREATE INDEX de_dst ON de(dst);');

// candidates
hdr.forEach(function (h) {
  var cond = "docstatus IN (" + STATUSES.map(function (x) { return "'" + x.replace(/'/g, '') + "'"; }).join(',') + ")" + (CUTOFF && C[h].indexOf('dateacct') >= 0 ? " OR (dateacct IS NOT NULL AND CAST(dateacct AS TEXT) < '" + CUTOFF + "')" : '');
  db.exec('INSERT OR IGNORE INTO cand SELECT ' + ucode(h, q(h + '_id')) + ' FROM src.' + q(h) + ' WHERE ' + cond);
});
db.exec('INSERT INTO cold SELECT u FROM cand');
var nCand = one('SELECT count(*) c FROM cand').c;
console.log('§SPLIT_UNITS headers=' + hdr.length + ' lineTables=' + Object.keys(lineOf).length + ' dependents=[' + deps.join(',') +
  '] candidates=' + nCand + ' mode=' + (CUTOFF ? 'stress(<' + CUTOFF + ')' : 'policy(' + STATUSES.join(',') + ')') + ' t=' + sec());

// target unit expression for a FK column value: header stem -> header unit ; line stem -> its header's unit
function targets(table, own) {                        // returns [{joinSQL, dstExpr}] per FK col
  var out = [];
  C[table].forEach(function (c) {
    if (c.slice(-3) !== '_id') return;
    var stem = c.slice(0, -3);
    if (stem === table || stem === own) return;       // own pk / own header
    if (NO[stem]) out.push({ j: '', d: ucode(stem, 'x.' + q(c)), w: 'x.' + q(c) + ' IS NOT NULL AND EXISTS (SELECT 1 FROM src.' + q(stem) + ' z WHERE z.' + q(stem + '_id') + ' = x.' + q(c) + ')' });
    else if (lineOf[stem]) { var hh = lineOf[stem];
      out.push({ j: 'JOIN src.' + q(stem) + ' lt ON lt.' + q(stem + '_id') + ' = x.' + q(c) + ' JOIN src.' + q(hh) + ' ht ON ht.' + q(hh + '_id') + ' = lt.' + q(hh + '_id'),
        d: ucode(hh, 'lt.' + q(hh + '_id')), w: '1=1' }); }
  });
  return out;
}
hdr.forEach(function (h) {
  targets(h, null).forEach(function (t) {
    db.exec('INSERT OR IGNORE INTO ue SELECT ' + ucode(h, 'x.' + q(h + '_id')) + ', ' + t.d + ' AS d FROM src.' + q(h) + ' x ' + t.j +
      ' WHERE ' + t.w + ' AND ' + ucode(h, 'x.' + q(h + '_id')) + ' <> ' + t.d);
  });
});
Object.keys(lineOf).forEach(function (l) {
  var h = lineOf[l];
  targets(l, h).forEach(function (t) {
    db.exec('INSERT OR IGNORE INTO ue SELECT ' + ucode(h, 'x.' + q(h + '_id')) + ', ' + t.d + ' AS d FROM src.' + q(l) + ' x ' + t.j +
      ' WHERE ' + t.w + ' AND ' + ucode(h, 'x.' + q(h + '_id')) + ' <> ' + t.d);
  });
});
console.log('§SPLIT_EDGES unit->unit=' + one('SELECT count(*) c FROM ue').c + ' t=' + sec());

// dependents (non-fact first so fact_acct can resolve through them)
function depKey(d, pkExpr) { return '(' + (DNO[d] * SH) + ' + ' + pkExpr + ')'; }
deps.filter(function (d) { return d !== 'fact_acct'; }).forEach(function (d) {
  targets(d, null).forEach(function (t) {
    db.exec('INSERT OR IGNORE INTO de SELECT ' + depKey(d, 'x.' + q(d + '_id')) + ', ' + t.d + ' FROM src.' + q(d) + ' x ' + t.j + ' WHERE ' + t.w);
  });
});
if (deps.indexOf('fact_acct') >= 0) {
  var tname = db.prepare('SELECT ad_table_id id, lower(tablename) n FROM src.ad_table').all();
  tname.forEach(function (r) {
    if (NO[r.n]) {                                   // owner is a header
      db.exec('INSERT OR IGNORE INTO de SELECT ' + depKey('fact_acct', 'f.fact_acct_id') + ', ' + ucode(r.n, 'f.record_id') +
        ' FROM src.fact_acct f WHERE f.ad_table_id = ' + r.id + ' AND EXISTS (SELECT 1 FROM src.' + q(r.n) + ' z WHERE z.' + q(r.n + '_id') + ' = f.record_id)');
    } else if (DNO[r.n]) {                           // owner is itself a dependent (e.g. m_matchinv): follow its refs
      db.exec('INSERT OR IGNORE INTO de SELECT ' + depKey('fact_acct', 'f.fact_acct_id') + ', d.dst FROM src.fact_acct f JOIN de d ON d.dep = ' +
        depKey(r.n, 'f.record_id') + ' WHERE f.ad_table_id = ' + r.id);
    }
  });
}
console.log('§SPLIT_EDGES dependent->unit=' + one('SELECT count(*) c FROM de').c + ' t=' + sec());

// fixed point
var pass = 0, total = 0, changed = 1, pinnedDel = 0;
var qa = db.prepare('DELETE FROM cold WHERE u IN (SELECT dst FROM ue WHERE src NOT IN (SELECT u FROM cold))');
var qb = db.prepare('DELETE FROM cold WHERE u IN (SELECT d2.dst FROM de d1 JOIN de d2 ON d1.dep = d2.dep WHERE d1.dst NOT IN (SELECT u FROM cold))');
while (changed) { pass++; var a = qa.run().changes, b = qb.run().changes; changed = a + b; pinnedDel += a + b;
  console.log('§SPLIT_PASS ' + pass + ' pinnedByUnits=' + a + ' pinnedByDependents=' + b + ' t=' + sec()); }
var nCold = one('SELECT count(*) c FROM cold').c;
var wtc = one('SELECT count(*) c FROM ue WHERE src NOT IN (SELECT u FROM cold) AND dst IN (SELECT u FROM cold)').c +
  one('SELECT count(*) c FROM (SELECT DISTINCT d1.dep FROM de d1 JOIN de d2 ON d1.dep = d2.dep WHERE d1.dst NOT IN (SELECT u FROM cold) AND d2.dst IN (SELECT u FROM cold))').c;

// per-table tiers
var exhaustive = true;
hdr.forEach(function (h) {
  var n = nrows(h), c = one('SELECT count(*) c FROM src.' + q(h) + ' x WHERE ' + ucode(h, 'x.' + q(h + '_id')) + ' IN (SELECT u FROM cold)').c;
  console.log('§SPLIT_TABLE ' + h + ' warm=' + (n - c) + ' cold=' + c + ' total=' + n);
});
Object.keys(lineOf).forEach(function (l) {
  var h = lineOf[l], n = nrows(l), c = one('SELECT count(*) c FROM src.' + q(l) + ' x WHERE ' + ucode(h, 'x.' + q(h + '_id')) + ' IN (SELECT u FROM cold)').c;
  console.log('§SPLIT_TABLE ' + l + ' warm=' + (n - c) + ' cold=' + c + ' total=' + n);
});
db.exec('CREATE TABLE depcold AS SELECT dep FROM de GROUP BY dep HAVING min(dst IN (SELECT u FROM cold)) = 1');
deps.forEach(function (d) {
  var n = nrows(d), c = one('SELECT count(*) c FROM depcold WHERE dep >= ' + (DNO[d] * SH) + ' AND dep < ' + ((DNO[d] + 1) * SH)).c;
  console.log('§SPLIT_TABLE ' + d + ' warm=' + (n - c) + ' cold=' + c + ' total=' + n);
});
// persist the table classification so the shard writer never re-derives it (one owner per question)
db.exec('CREATE TABLE tbls(name TEXT PRIMARY KEY, kind TEXT, tblno INTEGER, hdr TEXT)');
var ins = db.prepare('INSERT INTO tbls VALUES (?,?,?,?)');
hdr.forEach(function (h) { ins.run(h, 'H', NO[h], null); });
Object.keys(lineOf).forEach(function (l) { ins.run(l, 'L', NO[lineOf[l]], lineOf[l]); });
deps.forEach(function (d) { ins.run(d, 'D', DNO[d], null); });
console.log('§SPLIT_PINNED candidates=' + nCand + ' pinnedWarm=' + (nCand - nCold) + ' coldUnits=' + nCold + ' passes=' + pass);
console.log('§SPLIT_WARM_TO_COLD=' + wtc);
if (DUMP) {
  var id2h = {}; Object.keys(NO).forEach(function (h) { id2h[NO[h]] = h; });
  var lines = db.prepare('SELECT u FROM cold').all().map(function (r) { return id2h[Math.floor(r.u / SH)] + ':' + (r.u % SH); });
  fs.writeFileSync(DUMP, lines.sort().join('\n') + '\n');
}
console.log('§SPLIT_VERDICT ' + (!nCand ? 'INCONCLUSIVE (no cold candidates judged)' : !nCold ? 'INCONCLUSIVE (every candidate pinned warm — nothing left cold)' :
  wtc === 0 ? 'PASS warm->cold=0' : 'FAIL warm->cold=' + wtc) + ' totalSec=' + sec());
