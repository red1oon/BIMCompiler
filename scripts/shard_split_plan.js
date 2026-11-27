#!/usr/bin/env node
// Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
// SPDX-License-Identifier: MIT
/**
 * shard_split_plan.js — warm/cold split on RELATED rows (aggregate units + reverse closure).
 *   Spec: docs/internal/ERP_SHARD_GENERATOR.md §10.   READ THE LOG: §SPLIT_* lines + §SPLIT_VERDICT.
 *   Usage: node scripts/shard_split_plan.js <sqlite.db> [--stress-cutoff YYYY-MM-DD]
 * Read-only. Real rows only. Policy candidates = DocStatus IN (CL,VO). --stress-cutoff additionally makes every doc
 * with dateacct < cutoff a candidate (a PARAMETER to exercise the graph on real rows — not invented data).
 */
'use strict';
var Database = require('better-sqlite3');
var db = new Database(process.argv[2], { readonly: true });
var si = process.argv.indexOf('--stress-cutoff'), CUTOFF = si > 0 ? process.argv[si + 1] : null;
var sti = process.argv.indexOf('--statuses'), STATUSES = (sti > 0 ? process.argv[sti + 1] : 'CL,VO,RE').split(','); // terminal DocStatus (ERP_SHARD_GENERATOR §12.1)
var pi = process.argv.indexOf('--period-status'), PSTAT = (pi > 0 ? process.argv[pi + 1] : 'P').split(',').filter(function (x) { return x && x !== 'none'; }); // §13
var di = process.argv.indexOf('--dump-cold'), DUMP = di > 0 ? process.argv[di + 1] : null;   // write sorted cold unit list (for SQL-planner equivalence)

function has(t) { return !!db.prepare("SELECT 1 FROM sqlite_master WHERE type='table' AND name=?").get(t); }
function cols(t) { return db.prepare('SELECT name FROM pragma_table_info(?)').all(t).map(function (r) { return r.name.toLowerCase(); }); }
function all(t) { return db.prepare('SELECT * FROM "' + t + '"').all(); }
var tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all().map(function (r) { return r.name; });
var C = {}; tables.forEach(function (t) { C[t] = cols(t); });

// 1) header tables (have docstatus + own pk) that hold rows
var hdr = tables.filter(function (t) { return C[t].indexOf('docstatus') >= 0 && C[t].indexOf(t + '_id') >= 0; })
  .filter(function (t) { return db.prepare('SELECT count(*) c FROM "' + t + '"').get().c > 0; });
// 2) their line tables: <h>line, or <h minus 'hdr'>line; owner column = <h>_id
var lineOf = {};
hdr.forEach(function (h) {
  [h + 'line', h.replace(/hdr$/, '') + 'line'].forEach(function (l) {
    if (has(l) && C[l].indexOf(h + '_id') >= 0 && !lineOf[l]) lineOf[l] = h;
  });
});
// 3) dependents: tables holding refs into header/line rows, not themselves header/line
var depNames = ['fact_acct', 'm_transaction', 'm_costdetail', 'm_matchinv', 'm_matchpo', 'c_allocationline'];
var deps = depNames.filter(function (t) { return has(t) && !lineOf[t] && hdr.indexOf(t) < 0; });

var unitOf = {};            // 'table:id' (header or line) -> unit key 'hdr:id'
var tier = {};              // unit -> 'cold'|'warm'
var cand = {}, candReason = {};
var orphans = { lines: 0, deps: 0 };
var tot = {};               // table -> {warm, cold}

hdr.forEach(function (h) {
  all(h).forEach(function (r) {
    var u = h + ':' + r[h + '_id']; unitOf[u] = u; tier[u] = 'warm';
    var st = r.docstatus, d = r.dateacct || null;
    if (STATUSES.indexOf(st) >= 0) { cand[u] = 1; candReason[u] = 'status=' + st; }
    else if (CUTOFF && d && String(d) < CUTOFF) { cand[u] = 1; candReason[u] = 'stress dateacct<' + CUTOFF; }
  });
});
// §13 period-close candidates (JS mirror of the SQL planner)
var nPeriod = 0;
if (PSTAT.length && has('c_period') && has('c_periodcontrol') && has('c_doctype')) {
  var dtBase = {}; all('c_doctype').forEach(function (r) { dtBase[r.c_doctype_id] = r.docbasetype; });
  var periods = all('c_period'), ctl = {}; all('c_periodcontrol').forEach(function (r) { ctl[r.c_period_id + '|' + r.docbasetype] = r.periodstatus; });
  hdr.forEach(function (h) {
    var dtCol = C[h].indexOf('c_doctypetarget_id') >= 0 ? 'c_doctypetarget_id' : C[h].indexOf('c_doctype_id') >= 0 ? 'c_doctype_id' : null;
    if (!dtCol || C[h].indexOf('dateacct') < 0 || C[h].indexOf('ad_client_id') < 0) return;
    all(h).forEach(function (r) {
      if (r.dateacct == null || r[dtCol] == null) return;
      var u = h + ':' + r[h + '_id'], d = String(r.dateacct).slice(0, 10), base = dtBase[r[dtCol]];
      periods.forEach(function (p) {
        if (p.ad_client_id !== r.ad_client_id || d < String(p.startdate).slice(0, 10) || d > String(p.enddate).slice(0, 10)) return;
        if (PSTAT.indexOf(ctl[p.c_period_id + '|' + base]) >= 0 && !cand[u]) { cand[u] = 1; candReason[u] = 'period-closed'; nPeriod++; }
      });
    });
  });
}
console.log('§SPLIT_PERIOD status=[' + PSTAT.join(',') + '] candidatesAdded=' + nPeriod);
var lineRows = {};
Object.keys(lineOf).forEach(function (l) {
  var h = lineOf[l]; lineRows[l] = all(l);
  lineRows[l].forEach(function (r) {
    var hu = h + ':' + r[h + '_id'];
    if (r[h + '_id'] == null || !unitOf[hu]) { orphans.lines++; return; }
    unitOf[l + ':' + r[l + '_id']] = hu;
  });
});
// polymorphic fact_acct owner: ad_table_id + record_id
var tname = {}; db.prepare('SELECT ad_table_id, lower(tablename) n FROM ad_table').all().forEach(function (r) { tname[r.ad_table_id] = r.n; });

// reference extraction: row -> set of foreign units (excluding own unit)
function refsOf(table, r, own) {
  var out = {};
  C[table].forEach(function (c) {
    if (c.slice(-3) !== '_id' || r[c] == null) return;
    var stem = c.slice(0, -3);
    if (stem === table) return;                                 // own pk
    if (lineOf[stem] || hdr.indexOf(stem) >= 0) {
      var u = unitOf[stem + ':' + r[c]]; if (u && u !== own) out[u] = 1;
    }
  });
  if (table === 'fact_acct' && r.ad_table_id != null && r.record_id != null) {
    var tn = tname[r.ad_table_id], u2 = tn && unitOf[tn + ':' + r.record_id];
    if (u2 && u2 !== own) out[u2] = 1;
  }
  return Object.keys(out);
}
// rows: {own: unit|null (header/line), refs: [units]}
var rows = [];
hdr.forEach(function (h) { all(h).forEach(function (r) { var u = h + ':' + r[h + '_id']; rows.push({ t: h, own: u, refs: refsOf(h, r, u) }); }); });
Object.keys(lineOf).forEach(function (l) {
  lineRows[l].forEach(function (r) { var u = unitOf[l + ':' + r[l + '_id']]; if (u) rows.push({ t: l, own: u, refs: refsOf(l, r, u) }); });
});
var depRefs = {};                                   // 'table:id' of a dependent -> its refs (so postings owned by a dependent follow it)
deps.slice().sort(function (a, b) { return (a === 'fact_acct') - (b === 'fact_acct'); }).forEach(function (t) {
  all(t).forEach(function (r) {
    var refs = refsOf(t, r, null);
    if (t === 'fact_acct' && !refs.length && r.ad_table_id != null) {
      var dn = tname[r.ad_table_id], dr = dn && depRefs[dn + ':' + r.record_id]; if (dr) refs = dr;
    }
    if (r[t + '_id'] != null) depRefs[t + ':' + r[t + '_id']] = refs;
    if (!refs.length) orphans.deps++;
    rows.push({ t: t, own: null, refs: refs });
  });
});

var nCand = Object.keys(cand).length;
// NAIVE baseline = today's per-table rule: only candidate HEADER rows go cold; lines/dependents are unassigned (warm).
var naive = 0;
rows.forEach(function (r) {
  var isColdHdr = hdr.indexOf(r.t) >= 0 && cand[r.own];
  if (isColdHdr) return;                                     // cold header: its own refs are cold->x, not a dangle
  var tg = r.refs.slice(); if (r.own && lineOf[r.t]) tg.push(r.own);   // a line also points at its own header
  tg.forEach(function (u) { if (cand[u]) naive++; });
});
console.log('§SPLIT_UNITS headers=' + hdr.length + ' lineTables=' + Object.keys(lineOf).length + ' dependents=[' + deps.join(',') +
  '] units=' + Object.keys(tier).length + ' rows=' + rows.length + ' candidates=' + nCand +
  ' mode=' + (CUTOFF ? 'stress(<' + CUTOFF + ')' : 'policy(' + STATUSES.join(',') + ')'));

// R3 fixed point: C = candidates; pin to warm any unit referenced by a warm row
var cold = {}; Object.keys(cand).forEach(function (u) { cold[u] = 1; });
var pinned = {}, passes = 0, changed = true;
function rowWarm(r) {
  if (r.own) return !cold[r.own];
  if (!r.refs.length) return true;                      // orphan dependent -> warm
  return r.refs.some(function (u) { return !cold[u]; }); // R4: cold iff ALL units cold
}
while (changed) {
  changed = false; passes++;
  rows.forEach(function (r) {
    if (!rowWarm(r)) return;
    var all_ = r.own ? r.refs : r.refs;
    all_.forEach(function (u) {
      if (cold[u]) { delete cold[u]; pinned[u] = r.t + (r.own ? ' (' + r.own + ')' : ' (dependent)') + ' references it'; changed = true; }
    });
  });
}
var nCold = Object.keys(cold).length;
if (DUMP) require('fs').writeFileSync(DUMP, Object.keys(cold).sort().join('\n') + '\n');
// independent re-check from scratch
var wtc = 0;
rows.forEach(function (r) { if (rowWarm(r)) r.refs.forEach(function (u) { if (cold[u]) wtc++; }); });
rows.forEach(function (r) { var t = tot[r.t] = tot[r.t] || { warm: 0, cold: 0 }; rowWarm(r) ? t.warm++ : t.cold++; });

Object.keys(tot).sort().forEach(function (t) {
  var n = db.prepare('SELECT count(*) c FROM "' + t + '"').get().c, s = tot[t].warm + tot[t].cold;
  console.log('§SPLIT_TABLE ' + t + ' warm=' + tot[t].warm + ' cold=' + tot[t].cold + ' total=' + n + (s === n ? '' : ' EXHAUSTIVE-FAIL(' + (n - s) + ' unowned)'));
});
var pk = Object.keys(pinned);
console.log('§SPLIT_PINNED candidates=' + nCand + ' pinnedWarm=' + pk.length + ' coldUnits=' + nCold + ' passes=' + passes);
pk.slice(0, 8).forEach(function (u) { console.log('§SPLIT_PINNED_WHY ' + u + ' <- ' + pinned[u]); });
console.log('§SPLIT_ORPHANS lines=' + orphans.lines + ' dependents=' + orphans.deps);
console.log('§SPLIT_WARM_TO_COLD=' + wtc + '  (naive per-table rule would leave ' + naive + ' warm->cold references)');
var exhaustive = Object.keys(tot).every(function (t) {
  return tot[t].warm + tot[t].cold === db.prepare('SELECT count(*) c FROM "' + t + '"').get().c;
});
console.log('§SPLIT_VERDICT ' + (!nCand ? 'INCONCLUSIVE (no cold candidates judged)' :
  !nCold ? 'INCONCLUSIVE (every candidate pinned warm — nothing left cold)' :
    (wtc === 0 && exhaustive && orphans.lines === 0) ? 'PASS warm->cold=0 exhaustive=Y' :
      'FAIL warm->cold=' + wtc + ' exhaustive=' + exhaustive + ' orphanLines=' + orphans.lines));
