#!/usr/bin/env node
// Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
// SPDX-License-Identifier: MIT
/**
 * witness_comm_cl2_order.js — W-ORDER-PERMUTE. Spec: prompts/TEAMWORK_FRAMEWORK.md §12.2 (CL2), decision D1.
 *
 * Ops are REAL signed v3 envelopes (build/comm/comm_envelope.js), hashed by their canonical form; deps are
 * gossip-shaped (an author lists the heads of the others it has seen). The order comes from build/comm/comm_order.js.
 *
 * Arms (each names the issue it proves or disproves):
 *   §ORDER-PERMUTE   — no sequencer: 100 random arrival orders give ONE order (else devices would diverge).
 *   §ORDER-CAUSAL    — nothing is placed before what it points to (else an edit could fold before its record exists).
 *   §ORDER-NO-TS     — linearize never reads ts (else a device's clock could move its op earlier — §3 C1).
 *   §ORDER-BACKDATE  — an op stamped ts=0 that depends on Y still lands after Y.
 *   §ORDER-PARK      — a withheld op parks exactly its causal descendants; re-adding it restores the baseline.
 *   §ORDER-EQUIVOCATE— two ops at one (author, seq) are reported and neither is placed.
 *   §ORDER-PERF      — 10k-op timing, logged.
 *
 * Run: node scripts/witness_comm_cl2_order.js 2>&1 | tee build/comm/logs/witness_comm_cl2_order.log
 */
'use strict';
if (typeof globalThis.crypto === 'undefined' || !globalThis.crypto.subtle) globalThis.crypto = require('crypto').webcrypto;
var path = require('path'), nodeCrypto = require('crypto');
var ENV = require(path.join(__dirname, '..', 'build', 'comm', 'comm_envelope.js'));
var ORD = require(path.join(__dirname, '..', 'build', 'comm', 'comm_order.js'));

var fails = 0, judged = 0, inconclusive = [];
function verdict(ok, label, detail) { judged++; if (!ok) fails++; console.log('   ' + (ok ? '🟢' : '🔴') + ' ' + label + (detail ? ' — ' + detail : '')); }
var SPACE = nodeCrypto.createHash('sha256').update('witness-space').digest('hex');

// deterministic PRNG so the run is reproducible (mulberry32)
function rng(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; var t = Math.imul(seed ^ seed >>> 15, 1 | seed);
  t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function shuffle(a, r) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(r() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
function meta(e, h) { return { hash: h, author: e.author, seq: e.seq, prev: e.prev, deps: e.deps }; }
function orderHash(order) { return nodeCrypto.createHash('sha256').update(order.join(',')).digest('hex').slice(0, 16); }

// build a gossip-shaped history: each step one author writes; it has "seen" a random subset of others' heads
async function history(nAuthors, nOps, seed, sign) {
  var r = rng(seed), heads = {}, seqs = {}, seen = {}, out = [], signers = [];
  for (var a = 0; a < nAuthors; a++) {
    var kid = 'kid-' + a; seqs[kid] = 0; heads[kid] = null; seen[kid] = {};
    signers.push(sign ? { kid: kid, privateKey: (await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign', 'verify'])).privateKey } : { kid: kid });
  }
  for (var i = 0; i < nOps; i++) {
    var s = signers[Math.floor(r() * nAuthors)], kid2 = s.kid;
    signers.forEach(function (o) { if (o.kid !== kid2 && heads[o.kid] && r() < 0.35) seen[kid2][o.kid] = heads[o.kid]; });   // gossip
    var deps = Object.keys(seen[kid2]).map(function (k) { return seen[kid2][k]; }).filter(function (h, idx, arr) { return arr.indexOf(h) === idx; }).sort();
    seen[kid2] = {};                                           // listed once: only heads that changed since my last op
    var env = { v: 3, space: SPACE, author: kid2, seq: ++seqs[kid2], prev: heads[kid2], deps: deps, manifest: 'm0', policy: 'p0', intent: 'K1',
                target: { table: 'c_order', uu: nodeCrypto.randomUUID() }, base: null, ts: 1700000000000 + Math.floor(r() * 1e6),
                body: { op_type: 'CRUD_UPDATE', params: { changes: { description: { old: null, new: 'n' + i } } } } };
    var vr = ENV.validate(env); if (!vr.ok) throw new Error('fixture invalid: ' + vr.errors.join('; '));
    if (sign) env = await ENV.sign(env, s);
    var h = await ENV.hashHex(env); heads[kid2] = h; out.push({ env: env, hash: h });
  }
  return out;
}

(async function () {
  console.log('═══ W-ORDER-PERMUTE — CL2 order without a sequencer (TEAMWORK_FRAMEWORK §12.2, D1) ═══\n');
  var H = await history(10, 200, 42, true);
  var ops = H.map(function (x) { return meta(x.env, x.hash); });
  var withDeps = ops.filter(function (o) { return o.deps.length; }).length;
  console.log('§CL2_FIXTURE authors=10 ops=' + ops.length + ' ops_with_deps=' + withDeps + ' signed=yes');
  if (!withDeps) inconclusive.push('fixture has no cross-author deps — PERMUTE would judge nothing causal');

  // ── §ORDER-PERMUTE ──
  console.log('\n§ORDER-PERMUTE — 100 random arrival orders');
  var base = ORD.linearize(ops), r = rng(7), distinct = {}, allPlaced = true;
  for (var k = 0; k < 100; k++) { var L = ORD.linearize(shuffle(ops, r)); distinct[orderHash(L.order)] = 1; if (L.order.length !== ops.length) allPlaced = false; }
  console.log('   §COMM_ORDER permutations=100 distinct_orders=' + Object.keys(distinct).length + ' placed=' + base.order.length + '/' + ops.length);
  verdict(base.order.length === ops.length && base.parked.length === 0, 'every op placed, none parked', 'placed=' + base.order.length + ' parked=' + base.parked.length);
  verdict(Object.keys(distinct).length === 1 && allPlaced, 'one order for every arrival order', 'distinct=' + Object.keys(distinct).length);
  verdict(Object.keys(distinct)[0] === orderHash(base.order), 'and it is the same as the in-order baseline');

  // ── §ORDER-CAUSAL ──
  console.log('\n§ORDER-CAUSAL — placed after prev and every dep');
  var pos = {}; base.order.forEach(function (h, i) { pos[h] = i; });
  var viol = ops.filter(function (o) { return (o.prev && pos[o.prev] > pos[o.hash]) || o.deps.some(function (d) { return pos[d] > pos[o.hash]; }); });
  var edges = ops.reduce(function (n, o) { return n + (o.prev ? 1 : 0) + o.deps.length; }, 0);
  verdict(edges > 0 && viol.length === 0, 'no op before what it points to', 'edges_checked=' + edges + ' violations=' + viol.length);

  // ── §ORDER-NO-TS ──
  console.log('\n§ORDER-NO-TS — the clock is never read');
  var trap = H.map(function (x) { var o = meta(x.env, x.hash); Object.defineProperty(o, 'ts', { get: function () { throw new Error('ts was read'); }, enumerable: true }); return o; });
  var noTs = null, err = null; try { noTs = ORD.linearize(trap); } catch (e) { err = e.message; }
  verdict(!err && orderHash(noTs.order) === orderHash(base.order), 'linearize completes without touching ts, same order', err || '');

  // ── §ORDER-BACKDATE ──
  console.log('\n§ORDER-BACKDATE — ts=0 cannot jump the queue');
  var Y = H[H.length - 1];
  var z = { v: 3, space: SPACE, author: 'kid-late', seq: 1, prev: null, deps: [Y.hash], manifest: 'm0', policy: 'p0', intent: 'K1',
            target: { table: 'c_order', uu: nodeCrypto.randomUUID() }, base: null, ts: 0, body: { op_type: 'CRUD_UPDATE', params: { changes: {} } } };
  var zh = await ENV.hashHex(z), withZ = ORD.linearize(ops.concat([meta(z, zh)]));
  verdict(withZ.order.indexOf(zh) > withZ.order.indexOf(Y.hash), 'backdated op lands after the op it depends on',
    'Y@' + withZ.order.indexOf(Y.hash) + ' Z@' + withZ.order.indexOf(zh));

  // ── §ORDER-PARK ──
  console.log('\n§ORDER-PARK — withhold one op');
  var victim = ops[Math.floor(ops.length / 3)];
  var desc = {}; desc[victim.hash] = 1;                       // its causal descendants, computed independently of linearize
  var changed = true; while (changed) { changed = false; ops.forEach(function (o) { if (!desc[o.hash] && ((o.prev && desc[o.prev]) || o.deps.some(function (d) { return desc[d]; }))) { desc[o.hash] = 1; changed = true; } }); }
  var expectParked = Object.keys(desc).filter(function (h) { return h !== victim.hash; }).sort();
  var P = ORD.linearize(ops.filter(function (o) { return o.hash !== victim.hash; }));
  console.log('   §COMM_ORDER withheld=' + victim.hash.slice(0, 8) + ' parked=' + P.parked.length + ' expected=' + expectParked.length + ' placed=' + P.order.length);
  if (!expectParked.length) inconclusive.push('PARK victim has no descendants');
  verdict(JSON.stringify(P.parked) === JSON.stringify(expectParked), 'exactly the causal descendants are parked');
  verdict(P.order.length + P.parked.length === ops.length - 1, 'everything else is placed');
  verdict(orderHash(ORD.linearize(shuffle(ops, rng(9))).order) === orderHash(base.order), 'after re-adding it, order equals the baseline');

  // ── §ORDER-EQUIVOCATE ──
  console.log('\n§ORDER-EQUIVOCATE — one author, one seq, two ops');
  var orig = H[5].env, fork = JSON.parse(JSON.stringify(orig)); fork.body.params.changes = { description: { old: null, new: 'forked' } };
  var fh = await ENV.hashHex(fork), Q = ORD.linearize(ops.concat([meta(fork, fh)]));
  console.log('   §COMM_ORDER equivocations=' + Q.equivocations.length + (Q.equivocations[0] ? ' author=' + Q.equivocations[0].author + ' seq=' + Q.equivocations[0].seq : ''));
  verdict(Q.equivocations.length === 1 && Q.equivocations[0].author === orig.author && Q.equivocations[0].seq === orig.seq, 'the fork is reported with its author and seq');
  verdict(Q.order.indexOf(H[5].hash) < 0 && Q.order.indexOf(fh) < 0, 'neither forked op is placed');

  // ── §ORDER-PERF ──
  console.log('\n§ORDER-PERF — 10k ops (unsigned fixture, hashing included in build, not in timing)');
  var big = (await history(20, 10000, 3, false)).map(function (x) { return meta(x.env, x.hash); });
  var t0 = process.hrtime.bigint(), B = ORD.linearize(shuffle(big, rng(1))), ms = Number(process.hrtime.bigint() - t0) / 1e6;
  console.log('   §COMM_ORDER ops=' + big.length + ' placed=' + B.order.length + ' ms=' + ms.toFixed(1) + ' heapMB=' + (process.memoryUsage().heapUsed / 1048576).toFixed(0));
  verdict(B.order.length === big.length, '10k ops all placed', 'placed=' + B.order.length);

  console.log('\n──────────────────────────────────────────────');
  if (inconclusive.length || judged === 0) console.log('§W-ORDER-PERMUTE INCONCLUSIVE judged=' + judged + ' fails=' + fails + ' — ' + inconclusive.join(' | '));
  else console.log('§W-ORDER-PERMUTE ' + (fails ? 'FAIL' : 'PASS') + ' judged=' + judged + ' fails=' + fails);
  process.exit(fails || inconclusive.length ? 1 : 0);
})().catch(function (e) { console.log('🔴 CRASH ' + (e && e.stack || e)); process.exit(2); });
