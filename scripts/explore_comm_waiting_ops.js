#!/usr/bin/env node
// Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
// SPDX-License-Identifier: MIT
/**
 * explore_comm_waiting_ops.js — W-WAITING-OPS (exploration witness). Spec: prompts/TEAMWORK_FRAMEWORK.md §12.6.
 * The user's open question: when one op is missing, must everything after it wait?
 *
 * Same linearize (build/comm/comm_order.js) under three choices of what an op "depends on":
 *   G  gossip   — prev + heads of other authors I had seen   (what CL2/CL3 do today)
 *   DP data+prev— prev + base (the last op on my target I had read)
 *   D  data     — base only
 * Fixture: 10 authors, 400 ops, 60 records with a hot-spot skew (20% of records get ~80% of edits), gossip 35%.
 * Each arm withholds one op M (every 8th op tried) and measures:
 *   §WAIT-PARKED    — how many present ops are held back (the cost the user asked about).
 *   §WAIT-STABLE    — THEOREM: placed ops keep their relative order once M arrives (no re-ordering surprises).
 *   §WAIT-FINAL     — records untouched by M and its dependents get the SAME per-record op sequence before and
 *                     after M arrives (their value is final, not provisional). Records that are touched are counted.
 *   §WAIT-BLOOM     — a per-author Bloom filter of touched records (carried in the signed head) marks every truly
 *                     affected record (no misses allowed) and counts over-marks.
 * Run: node scripts/explore_comm_waiting_ops.js 2>&1 | tee build/comm/logs/explore_comm_waiting_ops.log
 */
'use strict';
var path = require('path'), crypto = require('crypto');
var ORD = require(path.join(__dirname, '..', 'build', 'comm', 'comm_order.js'));
var fails = 0, judged = 0;
function verdict(ok, label, detail) { judged++; if (!ok) fails++; console.log('   ' + (ok ? '🟢' : '🔴') + ' ' + label + (detail ? ' — ' + detail : '')); }
function rng(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; var t = Math.imul(seed ^ seed >>> 15, 1 | seed);
  t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function h(s) { return crypto.createHash('sha256').update(s).digest('hex'); }

// ── fixture: who edits what, and what each author had seen ──
function fixture(nA, nOps, nRec, seed) {
  var r = rng(seed), ops = [], heads = {}, seen = {}, seq = {}, know = {};   // know[a][rec] = last op hash on rec that a has seen
  for (var a = 0; a < nA; a++) { var k = 'a' + a; heads[k] = null; seen[k] = {}; seq[k] = 0; know[k] = {}; }
  var all = [];                                                       // ops so far (for gossip: learn what a peer knew)
  function pickRec() { return r() < 0.8 ? Math.floor(r() * nRec * 0.2) : Math.floor(nRec * 0.2 + r() * nRec * 0.8); }
  for (var i = 0; i < nOps; i++) {
    var au = 'a' + Math.floor(r() * nA);
    Object.keys(heads).forEach(function (o) {                         // gossip: sometimes pull a peer's state
      if (o !== au && heads[o] && r() < 0.35) { seen[au][o] = heads[o]; for (var rc in know[o]) know[au][rc] = know[o][rc]; }
    });
    var rec = 'R' + pickRec(), base = know[au][rec] || null;
    var deps = Object.keys(seen[au]).map(function (k) { return seen[au][k]; }).filter(function (x, j, arr) { return arr.indexOf(x) === j; }).sort();
    seen[au] = {};
    var op = { author: au, seq: ++seq[au], prev: heads[au], gdeps: deps, base: base, rec: rec };
    op.hash = h(JSON.stringify([au, op.seq, op.prev, deps, base, rec, i]));
    heads[au] = op.hash; know[au][rec] = op.hash; ops.push(op); all.push(op);
  }
  return ops;
}
var MODELS = {
  G:  function (o) { return { hash: o.hash, author: o.author, seq: o.seq, prev: o.prev, deps: o.gdeps }; },
  DP: function (o) { return { hash: o.hash, author: o.author, seq: o.seq, prev: o.prev, deps: o.base ? [o.base] : [] }; },
  D:  function (o) { return { hash: o.hash, author: o.author, seq: o.seq, prev: null, deps: o.base ? [o.base] : [] }; }
};
function perRecord(order, byHash) { var m = {}; order.forEach(function (x) { var o = byHash[x]; (m[o.rec] = m[o.rec] || []).push(x); }); return m; }

// a tiny Bloom filter (k=4, m bits) — what an author's signed head would carry: the records its chain touched
function bloom(mBits) { var b = new Uint8Array(mBits >> 3); function idx(s, i) { return parseInt(h(i + ':' + s).slice(0, 8), 16) % mBits; }
  return { add: function (s) { for (var i = 0; i < 4; i++) { var x = idx(s, i); b[x >> 3] |= 1 << (x & 7); } },
           has: function (s) { for (var i = 0; i < 4; i++) { var x = idx(s, i); if (!(b[x >> 3] & (1 << (x & 7)))) return false; } return true; }, bytes: b.length }; }

(function () {
  console.log('═══ W-WAITING-OPS — what really has to wait when one op is missing (TEAMWORK_FRAMEWORK §12.6) ═══');
  var ops = fixture(10, 400, 60, 11), byHash = {}; ops.forEach(function (o) { byHash[o.hash] = o; });
  console.log('§WAIT_FIXTURE authors=10 ops=' + ops.length + ' records=60 hot=20%→~80% gossip=35% with_base=' + ops.filter(function (o) { return o.base; }).length);
  var blooms = {}; ops.forEach(function (o) { (blooms[o.author] = blooms[o.author] || bloom(1024)).add(o.rec); });

  Object.keys(MODELS).forEach(function (name) {
    var M = MODELS[name], full = ORD.linearize(ops.map(M)), fullPos = {}; full.order.forEach(function (x, i) { fullPos[x] = i; });
    var fullRec = perRecord(full.order, byHash);
    var parkedSum = 0, parkedMax = 0, tries = 0, unstable = 0, finalRecs = 0, provRecs = 0, finalMismatch = 0, bloomMiss = 0, bloomOver = 0;
    for (var t = 0; t < ops.length; t += 8) {
      var miss = ops[t], prov = ORD.linearize(ops.filter(function (o) { return o.hash !== miss.hash; }).map(M));
      tries++; parkedSum += prov.parked.length; parkedMax = Math.max(parkedMax, prov.parked.length);
      // §WAIT-STABLE: relative order of placed ops unchanged in the full order
      for (var i = 1; i < prov.order.length; i++) if (fullPos[prov.order[i - 1]] > fullPos[prov.order[i]]) { unstable++; break; }
      // records the missing op or anything waiting on it touches = genuinely provisional
      var affected = {}; affected[miss.rec] = 1; prov.parked.forEach(function (x) { affected[byHash[x].rec] = 1; });
      var provRec = perRecord(prov.order, byHash);
      Object.keys(fullRec).forEach(function (rec) {
        if (affected[rec]) { provRecs++; return; }
        finalRecs++;
        if (JSON.stringify(provRec[rec] || []) !== JSON.stringify(fullRec[rec])) finalMismatch++;
      });
      // §WAIT-BLOOM: the missing author's head Bloom must cover every affected record that the parked ops don't already reveal
      var bl = blooms[miss.author]; if (!bl.has(miss.rec)) bloomMiss++;
      Object.keys(fullRec).forEach(function (rec) { if (!affected[rec] && bl.has(rec)) bloomOver++; });
    }
    var present = ops.length - 1;
    console.log('\n§WAIT model=' + name + ' tries=' + tries + ' parked_avg=' + (parkedSum / tries).toFixed(1) + ' (' + (100 * parkedSum / tries / present).toFixed(1) + '% of present)' +
      ' parked_max=' + parkedMax + ' final_records_avg=' + (finalRecs / tries).toFixed(1) + '/60 provisional_records_avg=' + (provRecs / tries).toFixed(1));
    verdict(unstable === 0, model(name) + ': placed ops never re-order when the missing op arrives', 'unstable_tries=' + unstable);
    verdict(finalMismatch === 0, model(name) + ': every record marked final has the same op sequence after arrival', 'mismatches=' + finalMismatch + ' over ' + finalRecs + ' record-checks');
    verdict(bloomMiss === 0, model(name) + ': the author Bloom (1 KB) never misses the missing op\'s record', 'misses=' + bloomMiss + ' over-marked_avg=' + (bloomOver / tries).toFixed(1) + ' records');
  });
  function model(n) { return { G: 'gossip', DP: 'data+prev', D: 'data only' }[n]; }
  console.log('\n──────────────────────────────────────────────');
  console.log('§W-WAITING-OPS ' + (fails ? 'FAIL' : 'PASS') + ' judged=' + judged + ' fails=' + fails);
  process.exit(fails ? 1 : 0);
})();
