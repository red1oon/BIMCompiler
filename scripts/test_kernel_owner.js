#!/usr/bin/env node
// Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
// SPDX-License-Identifier: MIT
/**
 * test_kernel_owner.js — A3 / W-OWNER + CAS-LIVE: exercises the REAL bim-ootb/viewer/kernel_ops.js
 *   (op-log, with A1 op_uuid) + bim-ootb/viewer/erp_replay.js (guarded replay) to confirm the
 *   browser ERP replay path rejects the loser deterministically, with NO server. Spec:
 *   scripts/poc_distributed.js (G-SINGLE-WRITER owner-gate + set-if-unset CAS) + ERP.md §9-C/D/E, §4.
 *   Mirrors poc_distributed's verdicts against the ACTUAL kernel + ERP replay module.
 *
 *   Proves:
 *     §OWNER merge   — two devices' kernel logs UNION with no op_uuid clash (A1); the SAME merged log
 *                      replays to the SAME projection on both devices (holder-irrelevant)
 *     §OWNER gate    — two peers ALLOCATE the same invoice → the non-owner is rejected on replay; one
 *                      allocation survives, no value lost (G-SINGLE-WRITER reads the recorded owner)
 *     §CAS           — two peers CLAIM the same entitlement → first in total order wins (set-if-unset)
 *
 *   op_uuid / timestamp are recorded INPUTS (§7): each op_uuid is minted by the REAL kernel; the
 *   timestamps are assigned as deterministic fixtures (exactly as poc_distributed hard-codes them) so
 *   the merge order — hence every verdict — is byte-identical run to run. The owner-gate READS the
 *   recorded owner/actor; it never recomputes identity (§0.21, A1).
 *
 * Run: node scripts/test_kernel_owner.js 2>&1 | tee build/erp/test_kernel_owner.log
 */
'use strict';
if (typeof global.crypto === 'undefined') { global.crypto = require('crypto').webcrypto; }
global.window = { APP: {} };
global.APP = global.window.APP;
global.indexedDB = { open: function () { var r = {}; setTimeout(function () { r.result = { createObjectStore: function () {}, transaction: function () { return { objectStore: function () { return { put: function () {} }; } }; } }; if (r.onsuccess) r.onsuccess(); }, 0); return r; } };

var path = require('path');
var nodeCrypto = require('crypto');
var initSqlJs = require('sql.js');
var KERNEL = path.join(process.env.HOME, 'bim-ootb', 'viewer', 'kernel_ops.js');
// fresh kernel instance per device — kernel_ops keeps one _tableCreated flag per module (one DB per
// page). Same dodge as test_kernel_identity.js / test_kernel_sign.js.
function freshK() { delete require.cache[require.resolve(KERNEL)]; require(KERNEL); return global.window.KernelOps; }
require(path.join(process.env.HOME, 'bim-ootb', 'erp', 'erp_replay.js'));   // browser-pure → attaches window.ErpReplay
var R = global.window.ErpReplay;

var fails = 0;
function verdict(ok, label, detail) { if (!ok) fails++; console.log('   ' + (ok ? '🟢' : '🔴') + ' ' + label + (detail ? ' — ' + detail : '')); }
function sha(s) { return nodeCrypto.createHash('sha256').update(s).digest('hex'); }
function cell(db, sql, args) { var r = db.exec(sql, args); return r.length && r[0].values.length ? r[0].values[0][0] : null; }

var INV = '0190aa01-inv-7c00-0000-invoice00001';   // invoice, owned by device A
var TOK = '0190aa02-tok-7c00-0000-entitlement01';  // a single-claim entitlement (owner: merchant)

(async function () {
  console.log('═══ TEST-KERNEL-OWNER — owner-gate + CAS over the REAL kernel log + ERP replay (§9-C/D/E) ═══\n');
  var SQL = await initSqlJs();

  // ── Device A: commit its ERP ops through the REAL kernel (each gets a real A1 op_uuid) ──
  var KA = freshK(); var dbA = new SQL.Database();
  KA.commitOp(dbA, 'CREATE',   { actor: 'A', target: INV, doc_type: 'C_Invoice',   owner: 'A',        amount: 100 });
  KA.commitOp(dbA, 'CREATE',   { actor: 'A', target: TOK, doc_type: 'Entitlement', owner: 'merchant', amount: 50 });
  KA.commitOp(dbA, 'ALLOCATE', { actor: 'A', target: INV });                                  // owner A — valid
  KA.commitOp(dbA, 'CLAIM',    { actor: 'A', target: TOK });                                  // A claims first
  KA.commitOp(dbA, 'CREATE',   { actor: 'A', target: '0190aa50-orderA', doc_type: 'C_Order', owner: 'A', amount: 10 });

  // ── Device B (offline, concurrent): tries to allocate A's invoice + claim the same token ──
  var KB = freshK(); var dbB = new SQL.Database();
  KB.commitOp(dbB, 'ALLOCATE', { actor: 'B', target: INV });                                  // non-owner — must be rejected
  KB.commitOp(dbB, 'CLAIM',    { actor: 'B', target: TOK });                                  // later than A — CAS loses
  KB.commitOp(dbB, 'CREATE',   { actor: 'B', target: '0190aa60-orderB', doc_type: 'C_Order', owner: 'B', amount: 20 });

  // read each device's log back via the REAL replayOps (returns A1 op_uuid), capture raw ids for the
  // contrast, then normalize to flat ERP ops.
  var rawA = KA.replayOps(dbA), rawB = KB.replayOps(dbB);
  var logA = rawA.map(R.normalize), logB = rawB.map(R.normalize);

  // assign deterministic fixture timestamps (recorded INPUTS, as poc_distributed hard-codes) so A's
  // ALLOCATE/CLAIM precede B's — making the merge order, and thus the verdicts, reproducible.
  var TSA = ['09:00:01', '09:00:02', '09:00:05', '09:00:06', '09:00:08'];
  var TSB = ['09:00:07', '09:00:09', '09:00:10'];
  logA.forEach(function (o, i) { o.timestamp = '2026-05-31T' + TSA[i] + 'Z'; });
  logB.forEach(function (o, i) { o.timestamp = '2026-05-31T' + TSB[i] + 'Z'; });

  // ── #merge (A1 identity) ──
  var merged = R.mergeLogs(logA, logB);
  var uuids = merged.map(function (o) { return o.op_uuid; });
  var distinct = new Set(uuids).size;
  console.log('§OWNER merge devices=2 ops=' + merged.length + ' order=' + merged.map(function (o) { return o.op_type + '@' + o.timestamp.slice(11, 19); }).join(' '));
  verdict(distinct === merged.length, 'two devices’ kernel logs union with no op_uuid clash (A1 identity)', distinct + '/' + merged.length + ' distinct');

  // contrast: keyed by the local kernel `id`, A(1..5) and B(1..3) collide on union
  var idUnion = new Set(rawA.map(function (o) { return o.id; }).concat(rawB.map(function (o) { return o.id; }))).size;
  verdict(idUnion < merged.length && distinct === merged.length,
          'CONTRAST: local ids collide on merge (' + idUnion + ' distinct of ' + merged.length + '); op_uuid keeps all ' + merged.length, 'idUnion=' + idUnion);

  // replay the SAME merged log on TWO fresh projections → identical projection hash (holder-irrelevant)
  var pA = new SQL.Database(); var resA = R.replayGuarded(pA, merged);
  var pB = new SQL.Database(); R.replayGuarded(pB, merged);
  var hA = sha(JSON.stringify(R.projectionRows(pA))), hB = sha(JSON.stringify(R.projectionRows(pB)));
  console.log('§OWNER replay hashA=' + hA.slice(0, 12) + ' hashB=' + hB.slice(0, 12) + ' applied=' + resA.applied + ' rejected=' + resA.rejected.length);
  verdict(hA === hB, 'both devices replay merged log → SAME projection hash (holder-irrelevant)', 'A==B:' + (hA === hB));

  // ── #owner-gate: B's ALLOCATE of A's invoice rejected on replay; one allocation survives ──
  var invStatus = cell(pA, 'SELECT status FROM documents WHERE uuid=?', [INV]);
  var ownerReject = resA.rejected.filter(function (r) { return r.op.op_type === 'ALLOCATE' && r.op.actor === 'B'; });
  console.log('§OWNER owner-gate INV.status=' + invStatus + ' rejected=' + ownerReject.length + (ownerReject[0] ? ' why="' + ownerReject[0].why + '"' : ''));
  verdict(invStatus === 'allocated' && ownerReject.length === 1,
          'two peers ALLOCATE same invoice → non-owner rejected, one allocation, no value lost',
          'status=' + invStatus + ' rejects=' + ownerReject.length);

  // ── #CAS: only A's claim (earlier ts) wins; B rejected ──
  var claimedBy = cell(pA, 'SELECT claimed_by FROM documents WHERE uuid=?', [TOK]);
  var casReject = resA.rejected.filter(function (r) { return r.op.op_type === 'CLAIM'; });
  console.log('§CAS token.claimed_by=' + claimedBy + ' losers=' + casReject.length + (casReject[0] ? ' why="' + casReject[0].why + '"' : ''));
  verdict(claimedBy === 'A' && casReject.length === 1,
          'two peers CLAIM same token → first-in-order wins (CAS set-if-unset)',
          'claimed_by=' + claimedBy + ' losers=' + casReject.length);

  console.log('\n§OWNER ' + (fails ? 'FAIL — ' + fails + ' checks red'
    : 'PASS — merge is clash-free + holder-irrelevant (A1); owner-gate and CAS reject the loser deterministically, no server, no value lost'));
  process.exit(fails ? 1 : 0);
})();
