#!/usr/bin/env node
// Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
// SPDX-License-Identifier: MIT
/**
 * test_kernel_relay.js — W-RELAY: the §0.20 sync over the REAL HTTP relay (dumb facilitator), not the
 *   in-memory stub. Two clients sync through erp_relay_server.js via erp_relay_client.js + FSM.rebase.
 *   Spec: ERP.md §0.20 + docs/LocalFirstPriorArt.md §6.
 *
 *   Proves:
 *     §RELAY-HEALTH    — server boots, /health reports head=0.
 *     §RELAY-CONVERGE  — two devices rebasing through the HTTP relay reach IDENTICAL chain tips
 *                        (determinism survives the network hop, not just the in-process stub).
 *     §RELAY-IDEMPOTENT— re-rebasing a device adds nothing; a duplicate /push is accepted=0
 *                        (op_uuid dedup at the server — retry/replay safe).
 *     §RELAY-DURABLE   — restart the relay with the same persist file → canonical order replays from
 *                        disk (head + order preserved). Write-ahead JSONL survives a crash.
 *
 * Run: node scripts/test_kernel_relay.js 2>&1 | tee build/erp/test_kernel_relay.log
 */
'use strict';
if (typeof global.crypto === 'undefined') { global.crypto = require('crypto').webcrypto; }
global.window = { APP: {} }; global.APP = global.window.APP;
global.indexedDB = { open: function () { var r = {}; setTimeout(function () { r.result = { createObjectStore: function () {}, transaction: function () { return { objectStore: function () { return { put: function () {} }; } }; } }; if (r.onsuccess) r.onsuccess(); }, 0); return r; } };

var path = require('path'), fs = require('fs');
var initSqlJs = require('sql.js');
var KERNEL = path.join(__dirname, '..', 'build', 'erp', 'kernel_ops.js')   /* the ERP kernel the FSM/CORE ship with (v13, branch_id) — NOT viewer/kernel_ops.js (§TWIN-CLASSIFIED-WITNESS-FIXES 1) */;
function freshK() { delete require.cache[require.resolve(KERNEL)]; require(KERNEL); return global.window.KernelOps; }
var FSM = require(path.join(__dirname, '..', 'build', 'erp', 'erp_sync_fsm.js'));
var RELAY = require(path.join(__dirname, '..', 'build', 'erp', 'erp_relay_server.js'));
var CLIENT = require(path.join(__dirname, '..', 'build', 'erp', 'erp_relay_client.js'));

var fails = 0;
function verdict(ok, label, detail) { if (!ok) fails++; console.log('   ' + (ok ? '🟢' : '🔴') + ' ' + label + (detail ? ' — ' + detail : '')); }

var PERSIST = '/tmp/relay_test_' + process.pid + '.jsonl';
var PORT = 8140 + (process.pid % 200);

(async function () {
  console.log('═══ TEST-KERNEL-RELAY — sync over the HTTP dumb-facilitator relay ═══\n');
  if (typeof fetch === 'undefined') { console.log('   🔴 no global fetch (need Node 18+)'); process.exit(1); }
  try { fs.unlinkSync(PERSIST); } catch (e) {}
  var SQL = await initSqlJs();

  var srv = RELAY.createRelayServer({ port: PORT, persistPath: PERSIST });
  await srv.listen();
  var client = CLIENT.createRelayClient(srv.url);

  // ── §RELAY-HEALTH ──
  console.log('§RELAY-HEALTH');
  var h = await client.health();
  verdict(h.ok && h.head === 0, 'server healthy, head=0', 'head=' + h.head);

  // ── §RELAY-CONVERGE ──
  console.log('\n§RELAY-CONVERGE — two devices sync through HTTP → identical tip');
  var KB = freshK(); var dbB = new SQL.Database();
  KB.commitOp(dbB, 'CREATE', { actor: 'B', target: 'ORD-B' });
  await KB.sealChain(dbB); await FSM.rebase(dbB, KB, client);
  var KA = freshK(); var dbA = new SQL.Database();
  KA.commitOp(dbA, 'CREATE',   { actor: 'A', target: 'ORD-A' });
  KA.commitOp(dbA, 'COMPLETE', { actor: 'A', target: 'ORD-A' });
  await KA.sealChain(dbA); await FSM.rebase(dbA, KA, client);
  await FSM.rebase(dbB, KB, client);   // B pulls A's ops
  var vA = await KA.verifyChain(dbA), vB = await KB.verifyChain(dbB);
  verdict(vA.ok && vB.ok, 'both chains verify after HTTP rebase', 'A.ok=' + vA.ok + ' B.ok=' + vB.ok);
  verdict(vA.len === 3 && vB.len === 3, 'both logs length 3', 'A=' + vA.len + ' B=' + vB.len);
  verdict(vA.tip === vB.tip, 'IDENTICAL tip across the network', 'tip=' + (vA.tip || '').slice(0, 12) + '…');

  // ── §RELAY-IDEMPOTENT ──
  console.log('\n§RELAY-IDEMPOTENT — re-sync / duplicate push is a no-op');
  await FSM.rebase(dbA, KA, client);
  var headAfter = await client.head();
  verdict(headAfter === 3, 're-rebase added nothing (head still 3)', 'head=' + headAfter);
  var snap = await client.snapshot();
  var dup = await client.push(snap);   // push the whole canonical log back
  verdict(dup.accepted === 0 && dup.skipped === 3, 'duplicate push accepted=0 skipped=3', 'acc=' + dup.accepted + ' skip=' + dup.skipped);

  // ── §RELAY-DURABLE ──
  console.log('\n§RELAY-DURABLE — restart replays canonical order from disk');
  var orderBefore = (await client.snapshot()).map(function (o) { return JSON.parse(o.parameters).target; });
  await srv.close();
  // restart on a FRESH port: a same-port restart can hand a stale keep-alive socket to existing
  // clients (undici pool → "other side closed"). Production note: bounce clients / drain on relay
  // restart, or front the relay with a stable LB. Durability here is about the PERSIST FILE, not the port.
  var srv2 = RELAY.createRelayServer({ port: PORT + 1, persistPath: PERSIST });
  await srv2.listen();
  var client2 = CLIENT.createRelayClient(srv2.url);
  var h2 = await client2.health();
  var orderAfter = (await client2.snapshot()).map(function (o) { return JSON.parse(o.parameters).target; });
  verdict(h2.head === 3, 'restarted relay head=3 (replayed from JSONL)', 'head=' + h2.head);
  verdict(JSON.stringify(orderBefore) === JSON.stringify(orderAfter), 'canonical order identical after restart', '[' + orderAfter.join(',') + ']');
  await srv2.close();
  try { fs.unlinkSync(PERSIST); } catch (e) {}

  console.log('\n═══ ' + (fails ? '🔴 ' + fails + ' FAILED' : '🟢 ALL PASS') + ' ═══');
  process.exit(fails ? 1 : 0);
})().catch(function (e) { console.error('FATAL', e); process.exit(1); });
