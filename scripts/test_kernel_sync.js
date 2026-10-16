#!/usr/bin/env node
// Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
// SPDX-License-Identifier: MIT
/**
 * test_kernel_sync.js — W-SYNC-FSM: exercises build/erp/erp_sync_fsm.js against the REAL
 *   ~/bim-ootb/viewer/kernel_ops.js to prove the sync FSM is WIRED TO THE KERNEL, not a standalone
 *   toy. Spec: ERP.md §0.20 + docs/LocalFirstPriorArt.md §6 (SQLSync rebase / SyncStateMachine borrow).
 *
 *   Proves (each test names the issue it settles):
 *     §FSM-PURE    — transition() is deterministic and total: every legal edge maps correctly, and an
 *                    ILLEGAL event is a no-op (machine can't be corrupted by out-of-order events).
 *     §FSM-OFFLINE — CONNECTION_LOST from any active state drops to OFFLINE (drop-safe).
 *     §FSM-HAPPY   — matching manifest + a SEALED valid chain → runSync reaches IN_SYNC, and it
 *                    actually CALLED kernel.verifyChain (the chain gate ran, not bypassed).
 *     §FSM-SCHEMA  — manifest MISMATCH → SYNC_ERROR, and kernel.verifyChain was NEVER called
 *                    (Project Cambria maxim: the log is not touched across a schema-version gap).
 *     §FSM-TAMPER  — matching manifest but a TAMPERED op → runSync ends SYNC_ERROR at REPLAYING with
 *                    chain.ok=false brokeAt=N (W-CHAIN gate: sync cannot complete over a corrupt log).
 *
 * Run: node scripts/test_kernel_sync.js 2>&1 | tee build/erp/test_kernel_sync.log
 */
'use strict';
if (typeof global.crypto === 'undefined') { global.crypto = require('crypto').webcrypto; }
global.window = { APP: {} };
global.APP = global.window.APP;
// minimal indexedDB stub — kernel's debounced _persistToIdb touches it; we never assert on it here.
global.indexedDB = { open: function () { var r = {}; setTimeout(function () { r.result = { createObjectStore: function () {}, transaction: function () { return { objectStore: function () { return { put: function () {} }; } }; } }; if (r.onsuccess) r.onsuccess(); }, 0); return r; } };

var path = require('path');
var initSqlJs = require('sql.js');
var KERNEL = path.join(__dirname, '..', 'build', 'erp', 'kernel_ops.js')   /* the ERP kernel the FSM/CORE ship with (v13, branch_id) — NOT viewer/kernel_ops.js (§TWIN-CLASSIFIED-WITNESS-FIXES 1) */;
// fresh kernel instance per DB — kernel_ops keeps one _tableCreated flag per module (one DB per page).
// Same dodge as test_kernel_owner.js / test_kernel_sign.js.
function freshK() { delete require.cache[require.resolve(KERNEL)]; require(KERNEL); return global.window.KernelOps; }
require(KERNEL);                                  // → window.KernelOps (for the pure-FSM sections)
var K = global.window.KernelOps;
var FSM = require(path.join(__dirname, '..', 'build', 'erp', 'erp_sync_fsm.js'));
// wrap a kernel's verifyChain with a call-counter so we can PROVE whether the chain gate ran
function spy(k) { var n = { calls: 0 }; var real = k.verifyChain; k.verifyChain = function (db) { n.calls++; return real(db); }; return n; }
var S = FSM.STATES, E = FSM.EVENTS;

var fails = 0;
function verdict(ok, label, detail) { if (!ok) fails++; console.log('   ' + (ok ? '🟢' : '🔴') + ' ' + label + (detail ? ' — ' + detail : '')); }

async function sha(str) {
  var buf = await global.crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf)).map(function (b) { return b.toString(16).padStart(2, '0'); }).join('');
}

(async function () {
  console.log('═══ TEST-KERNEL-SYNC — sync FSM wired to the REAL kernel (schema gate + chain gate) ═══\n');
  var SQL = await initSqlJs();

  // ── §FSM-PURE: pure transition table ──
  console.log('§FSM-PURE — transition() deterministic & total');
  verdict(FSM.transition(S.OFFLINE, E.CONNECT) === S.HANDSHAKING, 'OFFLINE+CONNECT → HANDSHAKING');
  verdict(FSM.transition(S.VERIFYING_SCHEMA, E.SCHEMA_OK) === S.REPLAYING_LOGS, 'VERIFYING_SCHEMA+SCHEMA_OK → REPLAYING_LOGS');
  verdict(FSM.transition(S.VERIFYING_SCHEMA, E.SCHEMA_MISMATCH) === S.SYNC_ERROR, 'VERIFYING_SCHEMA+SCHEMA_MISMATCH → SYNC_ERROR');
  verdict(FSM.transition(S.REPLAYING_LOGS, E.REPLAY_OK) === S.IN_SYNC, 'REPLAYING_LOGS+REPLAY_OK → IN_SYNC');
  verdict(FSM.transition(S.REPLAYING_LOGS, E.REPLAY_FAIL) === S.SYNC_ERROR, 'REPLAYING_LOGS+REPLAY_FAIL → SYNC_ERROR');
  // illegal event in state must be a no-op (NOT a throw, NOT a jump)
  verdict(FSM.transition(S.IN_SYNC, E.SCHEMA_OK) === S.IN_SYNC, 'illegal IN_SYNC+SCHEMA_OK → no-op (stays IN_SYNC)');
  verdict(FSM.transition(S.OFFLINE, 'GARBAGE') === S.OFFLINE, 'unknown event → no-op (stays OFFLINE)');

  // ── §FSM-OFFLINE: drop-safe from active states ──
  console.log('\n§FSM-OFFLINE — CONNECTION_LOST drops to OFFLINE');
  ['HANDSHAKING', 'VERIFYING_SCHEMA', 'REPLAYING_LOGS', 'IN_SYNC'].forEach(function (st) {
    verdict(FSM.transition(st, E.CONNECTION_LOST) === S.OFFLINE, st + '+CONNECTION_LOST → OFFLINE');
  });

  var MANIFEST = 'AD:C_Order;C_OrderLine;documents;document_lines;journal;v=2';
  var goodHash = await sha(MANIFEST);
  var oldHash  = await sha(MANIFEST.replace('v=2', 'v=1'));

  // ── §FSM-HAPPY: matching manifest + sealed valid chain → IN_SYNC, chain gate ran ──
  console.log('\n§FSM-HAPPY — matching manifest + sealed chain → IN_SYNC');
  var KH = freshK(); var sH = spy(KH); var dbH = new SQL.Database();
  KH.commitOp(dbH, 'CREATE',   { actor: 'A', target: 'INV-1', doc_type: 'C_Invoice', amount: 100 });
  KH.commitOp(dbH, 'ALLOCATE', { actor: 'A', target: 'INV-1' });
  KH.commitOp(dbH, 'COMPLETE', { actor: 'A', target: 'INV-1' });
  await KH.sealChain(dbH);
  sH.calls = 0;
  var rH = await FSM.runSync({ db: dbH, kernel: KH, localManifestHash: goodHash, serverManifestHash: goodHash });
  verdict(rH.state === S.IN_SYNC, 'final state IN_SYNC', rH.state);
  verdict(rH.ok === true, 'ok=true');
  verdict(sH.calls === 1, 'kernel.verifyChain CALLED exactly once (chain gate ran)', 'calls=' + sH.calls);
  verdict(rH.detail.chain && rH.detail.chain.ok && rH.detail.chain.len === 3, 'chain verified len=3', rH.detail.reason);

  // ── §FSM-SCHEMA: mismatch → SYNC_ERROR, verifyChain NEVER called (log untouched) ──
  console.log('\n§FSM-SCHEMA — manifest mismatch blocks BEFORE the log');
  var KS = freshK(); var sS = spy(KS); var dbS = new SQL.Database();
  KS.commitOp(dbS, 'CREATE', { actor: 'A', target: 'INV-2', doc_type: 'C_Invoice', amount: 50 });
  await KS.sealChain(dbS);
  sS.calls = 0;
  var rS = await FSM.runSync({ db: dbS, kernel: KS, localManifestHash: oldHash, serverManifestHash: goodHash });
  verdict(rS.state === S.SYNC_ERROR, 'final state SYNC_ERROR', rS.state);
  verdict(rS.detail.schemaMatch === false, 'schemaMatch=false');
  verdict(sS.calls === 0, 'kernel.verifyChain NEVER called (Cambria gate — data not touched)', 'calls=' + sS.calls);
  verdict(rS.detail.chain === null, 'chain result null (never reached the chain gate)');

  // ── §FSM-TAMPER: matching manifest but tampered op → SYNC_ERROR at the chain gate ──
  console.log('\n§FSM-TAMPER — matching manifest, corrupt log → blocked at chain gate');
  var KT = freshK(); var sT = spy(KT); var dbT = new SQL.Database();
  KT.commitOp(dbT, 'CREATE',   { actor: 'A', target: 'INV-3', doc_type: 'C_Invoice', amount: 200 });
  KT.commitOp(dbT, 'COMPLETE', { actor: 'A', target: 'INV-3' });
  await KT.sealChain(dbT);
  dbT.run('UPDATE kernel_ops SET parameters = ? WHERE id = 2', ['{"actor":"EVE","target":"INV-3","tampered":true}']);
  sT.calls = 0;
  var rT = await FSM.runSync({ db: dbT, kernel: KT, localManifestHash: goodHash, serverManifestHash: goodHash });
  verdict(rT.state === S.SYNC_ERROR, 'final state SYNC_ERROR', rT.state);
  verdict(sT.calls === 1, 'chain gate ran (verifyChain called)', 'calls=' + sT.calls);
  verdict(rT.detail.chain && rT.detail.chain.ok === false, 'chain.ok=false');
  verdict(rT.detail.chain && rT.detail.chain.brokeAt === 2, 'broke at exactly id=2 (the tampered op)', 'brokeAt=' + (rT.detail.chain && rT.detail.chain.brokeAt));

  console.log('\n═══ ' + (fails ? '🔴 ' + fails + ' FAILED' : '🟢 ALL PASS') + ' ═══');
  process.exit(fails ? 1 : 0);
})().catch(function (e) { console.error('FATAL', e); process.exit(1); });
