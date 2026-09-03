#!/usr/bin/env node
// Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
// SPDX-License-Identifier: MIT
/**
 * test_kernel_rebase.js — W-REBASE: the §0.20 rebase loop over the REAL kernel + the dumb-facilitator
 *   sequencer. Spec: ERP.md §0.20 + docs/LocalFirstPriorArt.md §6 (SQLSync borrow). Proves the engine
 *   the browser POC (build/erp/sync_poc.html) demonstrates visually.
 *
 *   Proves (each names the issue it settles):
 *     §SEQ-IDEMPOTENT — re-pushing the same op_uuid is a no-op (no double-sequence). Fixes the exact
 *                       gap in Gemini's OpLogIngestServlet (which had no idempotency on op identity).
 *     §REBASE-CONVERGE — two devices rebasing against ONE sequencer materialise the SAME ordered log →
 *                       IDENTICAL chain tip → same projection. Determinism, not luck.
 *     §REBASE-PENDING  — a device's local-only (un-sequenced) ops survive rebase, appended after the
 *                       server head in order (nothing lost).
 *     §INVARIANT       — concurrent double-ALLOCATE of one target: the deterministic reducer keeps the
 *                       FIRST in canonical order and REJECTS the second. The sequencer (dumb) accepts
 *                       both; AUTHORITY OVER EFFECTS lives in the kernel/reducer on replay (doctrine).
 *     §PERF            — indicative throughput (node): commit/seal/verify/replay N ops, report ops/sec.
 *                       Real numbers are measured in the browser POC; node is a sanity floor.
 *
 * Run: node scripts/test_kernel_rebase.js 2>&1 | tee build/erp/test_kernel_rebase.log
 */
'use strict';
if (typeof global.crypto === 'undefined') { global.crypto = require('crypto').webcrypto; }
global.window = { APP: {} };
global.APP = global.window.APP;
global.indexedDB = { open: function () { var r = {}; setTimeout(function () { r.result = { createObjectStore: function () {}, transaction: function () { return { objectStore: function () { return { put: function () {} }; } }; } }; if (r.onsuccess) r.onsuccess(); }, 0); return r; } };

var path = require('path');
var initSqlJs = require('sql.js');
var KERNEL = path.join(__dirname, '..', 'build', 'erp', 'kernel_ops.js')   /* the ERP kernel the FSM/CORE ship with (v13, branch_id) — NOT viewer/kernel_ops.js (§TWIN-CLASSIFIED-WITNESS-FIXES 1) */;
function freshK() { delete require.cache[require.resolve(KERNEL)]; require(KERNEL); return global.window.KernelOps; }
var FSM = require(path.join(__dirname, '..', 'build', 'erp', 'erp_sync_fsm.js'));
var SEQ = require(path.join(__dirname, '..', 'build', 'erp', 'erp_sequencer.js'));

var fails = 0;
function verdict(ok, label, detail) { if (!ok) fails++; console.log('   ' + (ok ? '🟢' : '🔴') + ' ' + label + (detail ? ' — ' + detail : '')); }

// deterministic reducer over a canonical op list — enforces the no-double-allocation invariant the
// dumb sequencer cannot. First ALLOCATE of a target wins; later ones are rejected.
function projectInvariant(canon) {
  var owner = Object.create(null), rejected = [];
  canon.forEach(function (op) {
    if (op.op_type !== 'ALLOCATE') return;
    var p = JSON.parse(op.parameters);
    if (owner[p.target]) { rejected.push(op.op_uuid); return; }
    owner[p.target] = op.op_uuid;
  });
  return { owner: owner, rejected: rejected };
}

(async function () {
  console.log('═══ TEST-KERNEL-REBASE — dumb sequencer + rebase loop + invariant over the REAL kernel ═══\n');
  var SQL = await initSqlJs();

  // ── §SEQ-IDEMPOTENT ──
  console.log('§SEQ-IDEMPOTENT — re-push of a known op_uuid is a no-op');
  var s0 = SEQ.createSequencer();
  s0.push([{ op_uuid: 'u1', op_type: 'CREATE', parameters: '{}' }, { op_uuid: 'u2', op_type: 'CREATE', parameters: '{}' }]);
  var r2 = s0.push([{ op_uuid: 'u1', op_type: 'CREATE', parameters: '{}' }, { op_uuid: 'u3', op_type: 'CREATE', parameters: '{}' }]);
  verdict(s0.head() === 3, 'head=3 after re-pushing u1 (only u3 newly accepted)', 'head=' + s0.head());
  verdict(r2.accepted === 1 && r2.skipped === 1, 'second push accepted=1 skipped=1', 'acc=' + r2.accepted + ' skip=' + r2.skipped);

  // ── §REBASE-CONVERGE + §REBASE-PENDING ──
  console.log('\n§REBASE-CONVERGE — two devices, one sequencer → identical chain tip');
  var seq = SEQ.createSequencer();
  // Device B commits b1 and rebases FIRST → canonical head = [b1]
  var KB = freshK(); var dbB = new SQL.Database();
  KB.commitOp(dbB, 'CREATE', { actor: 'B', target: 'ORD-B' });
  await KB.sealChain(dbB);
  await FSM.rebase(dbB, KB, seq);
  // Device A commits a1,a2 (local pending) and rebases → canonical = [b1,a1,a2]
  var KA = freshK(); var dbA = new SQL.Database();
  KA.commitOp(dbA, 'CREATE',   { actor: 'A', target: 'ORD-A' });
  KA.commitOp(dbA, 'COMPLETE', { actor: 'A', target: 'ORD-A' });
  await KA.sealChain(dbA);
  await FSM.rebase(dbA, KA, seq);
  // Device B rebases again to pull A's ops → both converge
  await FSM.rebase(dbB, KB, seq);

  var vA = await KA.verifyChain(dbA), vB = await KB.verifyChain(dbB);
  verdict(vA.ok && vB.ok, 'both chains verify after rebase', 'A.ok=' + vA.ok + ' B.ok=' + vB.ok);
  verdict(vA.len === 3 && vB.len === 3, 'both logs length 3 (b1,a1,a2)', 'A=' + vA.len + ' B=' + vB.len);
  verdict(vA.tip === vB.tip, 'IDENTICAL chain tip → convergence by construction', 'tip=' + (vA.tip || '').slice(0, 12) + '…');

  // §REBASE-PENDING — A's local ops are present and ordered after B's in the canonical log
  var ordA = KA.replayOps(dbA).map(function (o) { return o.parameters.target; });   // replayOps already JSON-parses params
  verdict(ordA[0] === 'ORD-B' && ordA[1] === 'ORD-A' && ordA[2] === 'ORD-A',
    'canonical order = [ORD-B, ORD-A(create), ORD-A(complete)] — pending appended after server head', '[' + ordA.join(',') + ']');

  // ── §INVARIANT — concurrent double-allocate, reducer rejects the loser ──
  console.log('\n§INVARIANT — concurrent double-ALLOCATE → reducer keeps first, rejects second');
  var seqI = SEQ.createSequencer();
  var KX = freshK(); var dbX = new SQL.Database();
  KX.commitOp(dbX, 'CREATE',   { actor: 'X', target: 'INV-9' });
  KX.commitOp(dbX, 'ALLOCATE', { actor: 'X', target: 'INV-9' });   // first allocator
  await KX.sealChain(dbX); await FSM.rebase(dbX, KX, seqI);
  var KY = freshK(); var dbY = new SQL.Database();
  KY.commitOp(dbY, 'ALLOCATE', { actor: 'Y', target: 'INV-9' });   // concurrent second allocator
  await KY.sealChain(dbY); await FSM.rebase(dbY, KY, seqI);
  var canon = seqI.snapshot();
  var proj = projectInvariant(canon);
  verdict(Object.keys(proj.owner).length === 1, 'exactly ONE owner of INV-9 (no double-allocation)', 'owners=' + Object.keys(proj.owner).length);
  verdict(proj.rejected.length === 1, 'exactly one ALLOCATE rejected (the loser)', 'rejected=' + proj.rejected.length);

  // ── §REBASE-USERTAG (W-REBASE-USERTAG) — prompts/BACKEND_SUBSTRATE_LANE.md §RB.3 ──
  // rebase() rewinds and reapplies the log. kernel_ops.js:_canonicalV2 signs `actor: op.user_tag`, so a
  // v2 content-signed row's SIGNATURE attests its user_tag; the column DEFAULTs to 'local'
  // (kernel_ops.js:42). Before the fix, rebase selected nine columns and user_tag was not one of them —
  // so every non-default actor's row came back 'local' and its own signature stopped verifying. Every
  // witness to date commits as 'local', which is exactly why this never surfaced.
  console.log('\n§REBASE-USERTAG — a non-default actor survives the rewind+reapply, signature intact');
  var KU = freshK(); var dbU = new SQL.Database();
  var kp = await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify']);
  var pubHex = Buffer.from(await crypto.subtle.exportKey('raw', kp.publicKey)).toString('hex');
  KU.setSigner({
    sign: async function (msg) { return Buffer.from(await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, kp.privateKey, new TextEncoder().encode(msg))).toString('hex'); },
    verify: async function (msg, sig) { return crypto.subtle.verify({ name: 'ECDSA', hash: 'SHA-256' }, kp.publicKey, Buffer.from(sig, 'hex'), new TextEncoder().encode(msg)); },
    pubKeyHex: pubHex
  }, pubHex);
  KU.setContentSigning(true);                                  // v2 → the sig attests the CONTENT, incl. actor
  KU.ensureTable(dbU);
  var _qlog = console.log; console.log = function () {};
  await KU.commitGroup(dbU, [{ op_type: 'SET_STATUS', op_uuid: 'bob-1', params: { table: 'C_Order', id: 1, doc_status: 'CO' } }], { gid: 'g-bob', baseTs: 1000 });
  await KU.commitGroup(dbU, [{ op_type: 'SET_STATUS', op_uuid: 'loc-1', params: { table: 'C_Order', id: 2, doc_status: 'CO' } }], { gid: 'g-loc', baseTs: 2000 });
  console.log = _qlog;
  // stamp the non-default actor on ONE row and re-seal, so its signature genuinely attests 'user:bob'
  dbU.run("UPDATE kernel_ops SET user_tag='user:bob', op_hash=NULL, sig=NULL WHERE op_uuid='bob-1'");
  console.log = function () {}; await KU.sealChain(dbU); console.log = _qlog;
  function tagOf(db, uuid) { var q = db.exec("SELECT user_tag FROM kernel_ops WHERE op_uuid='" + uuid + "'"); return q.length ? q[0].values[0][0] : '(absent)'; }
  var preTag = tagOf(dbU, 'bob-1'), preVerify = await KU.verifyChain(dbU);
  var nonDefault = dbU.exec("SELECT COUNT(*) FROM kernel_ops WHERE user_tag IS NOT NULL AND user_tag<>'local'")[0].values[0][0];
  console.log('   §REBASE-USERTAG pre  actor=' + preTag + ' verifyChain=' + preVerify.ok + ' nonDefaultRows=' + nonDefault);
  if (!(preVerify.ok && Number(nonDefault) === 1)) {
    // law 4: judging nothing must never read PASS
    verdict(false, 'INCONCLUSIVE — the pre-rebase fixture is not what this arm judges (need 1 non-default actor on a verifying chain)',
            'verify=' + preVerify.ok + ' nonDefault=' + nonDefault);
  } else {
    var seqU = SEQ.createSequencer();
    console.log = function () {}; await FSM.rebase(dbU, KU, seqU); console.log = _qlog;
    var postTag = tagOf(dbU, 'bob-1'), postLoc = tagOf(dbU, 'loc-1'), postVerify = await KU.verifyChain(dbU);
    console.log('   §REBASE-USERTAG post actor=' + postTag + ' localRow=' + postLoc + ' verifyChain=' + postVerify.ok +
                (postVerify.ok ? '' : ' brokeAt=' + postVerify.brokeAt + ' why=' + postVerify.why));
    verdict(postTag === 'user:bob', 'PRESERVE — a non-default user_tag survives rebase (was silently reset to the DEFAULT)', 'actor=' + postTag);
    verdict(postVerify.ok === true, 'SIG SURVIVES — the v2 content signature still verifies after rebase', 'verifyChain=' + postVerify.ok);
    verdict(postLoc === 'local', "DEFAULT UNCHANGED — a 'local' row still rebases to 'local' (the fix is not a no-op)", 'localRow=' + postLoc);
    verdict(postVerify.len === 2, 'NOT VACUOUS — both rows were actually judged', 'len=' + postVerify.len);
  }

  // ── §PERF — indicative node throughput (real numbers come from the browser POC) ──
  console.log('\n§PERF — indicative node throughput (sql.js / SQLite-WASM)');
  var N = 2000;
  var KP = freshK(); var dbP = new SQL.Database();
  var realLog = console.log; console.log = function () {};          // silence per-op kernel logging for a clean measure
  var t0 = process.hrtime.bigint();
  for (var i = 0; i < N; i++) { KP.commitOp(dbP, (i % 2 ? 'COMPLETE' : 'CREATE'), { actor: 'P', target: 'ORD-' + i, amount: i }); }
  var tCommit = Number(process.hrtime.bigint() - t0) / 1e6;
  var t1 = process.hrtime.bigint(); await KP.sealChain(dbP);   var tSeal   = Number(process.hrtime.bigint() - t1) / 1e6;
  var t2 = process.hrtime.bigint(); var vP = await KP.verifyChain(dbP); var tVerify = Number(process.hrtime.bigint() - t2) / 1e6;
  var t3 = process.hrtime.bigint(); var ops = KP.replayOps(dbP); var tReplay = Number(process.hrtime.bigint() - t3) / 1e6;
  console.log = realLog;
  console.log('   ⏱  N=' + N + '  commit=' + tCommit.toFixed(0) + 'ms (' + Math.round(N / (tCommit / 1000)) + ' ops/s)' +
              '  seal=' + tSeal.toFixed(0) + 'ms  verify=' + tVerify.toFixed(0) + 'ms  replay=' + tReplay.toFixed(0) + 'ms');
  verdict(vP.ok && vP.len === N, 'chain verifies over ' + N + ' ops (integrity holds at volume)', 'len=' + vP.len);
  verdict(ops.length === N, 'replay returns all ' + N + ' ops', 'got=' + ops.length);

  console.log('\n═══ ' + (fails ? '🔴 ' + fails + ' FAILED' : '🟢 ALL PASS') + ' ═══');
  process.exit(fails ? 1 : 0);
})().catch(function (e) { console.error('FATAL', e); process.exit(1); });
