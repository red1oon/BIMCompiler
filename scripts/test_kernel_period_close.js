#!/usr/bin/env node
// Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
// SPDX-License-Identifier: MIT
/**
 * test_kernel_period_close.js — W-PCLOSE: the §0.20 CONTRACT-FREEZE witness. Lifts the already-green
 *   abstract proof scripts/poc_showstopper.js §SHOW-CKPT onto the REAL kernel_ops log + the controller
 *   signer (erp_snapshot_sign). Spec: prompts/PERIOD_CLOSE_FOLD_POC.md §Spec.
 *
 *   Proves (each NAMES the issue it settles, against the REAL kernel via freshK()):
 *     §PCLOSE-FOLD     — closePeriod folds the closed period to closing balances (integer cents) and
 *                        emits ONE signed checkpoint op (PERIOD_CLOSE), verifying under the controller key.
 *     §PCLOSE-BF       — the checkpoint IS the next period's OPENING balance: bootstrapFromCheckpoint
 *                        folds P2 FROM the checkpoint balances, never re-reading pre-checkpoint ops.
 *     §PCLOSE-COMPACT  — pre-checkpoint ops are dropped from the live log (count before≫after); the live
 *                        chain verifies back only to the checkpoint (the new genesis anchor).
 *     §PCLOSE-RECONCILE (THE FALSIFIER) — fold[checkpoint + P2] == fold[full genesis P1+P2] to the cent
 *                        (maxDiffCents === 0). Non-zero ⇒ balance-b/f WOUNDED ⇒ correct HolyGrail §compaction.
 *     §PCLOSE-TAMPER   — altering the checkpoint balances breaks the chain at exactly that op; a forger who
 *                        re-seals a forged checkpoint is STILL caught (no controller key → sig over new tip
 *                        fails). Tampering an ARCHIVED op breaks its chain AND diverges the refold from the
 *                        signed balances.
 *     §PCLOSE-DET      — rebuild the whole scenario → byte-identical checkpoint tip + the signature verifies
 *                        (ECDSA k random ⇒ sig bytes vary, but the tip is deterministic). No Date.now/random.
 *     §PCLOSE-REOPEN   — a period reopen is a SUPERSEDE op chained onto the head; the original checkpoint
 *                        stays in the chain (audit), never edited in place.
 *
 * Run: node scripts/test_kernel_period_close.js 2>&1 | tee build/erp/test_kernel_period_close.log
 */
'use strict';
if (typeof global.crypto === 'undefined') { global.crypto = require('crypto').webcrypto; }
global.window = { APP: {} };
global.APP = global.window.APP;
global.indexedDB = { open: function () { var r = {}; setTimeout(function () { r.result = { createObjectStore: function () {}, transaction: function () { return { objectStore: function () { return { put: function () {} }; } }; } }; if (r.onsuccess) r.onsuccess(); }, 0); return r; } };

var path = require('path'), fs = require('fs');
var initSqlJs = require('sql.js');
var KERNEL = path.join(process.env.HOME, 'bim-ootb', 'viewer', 'kernel_ops.js');
function freshK() { delete require.cache[require.resolve(KERNEL)]; require(KERNEL); return global.window.KernelOps; }
var PC   = require(path.join(__dirname, '..', 'build', 'erp', 'erp_period_close.js'));
var SIGN = require(path.join(__dirname, '..', 'build', 'erp', 'erp_snapshot_sign.js'));
var PRIV = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'build', 'erp', '.demo_controller_key.json'), 'utf8'));
var CONTROLLER = { signTip: function (tip) { return SIGN.signTip(PRIV, tip); }, signed_by: 'controller' };

var fails = 0;
function verdict(ok, label, detail) { if (!ok) fails++; console.log('   ' + (ok ? '🟢' : '🔴') + ' ' + label + (detail ? ' — ' + detail : '')); }
function c(cents) { return (cents < 0 ? '-' : '') + Math.abs(cents / 100).toFixed(2); }

// full kernel_ops schema (all columns) so we can host SEVERAL dbs under ONE kernel instance (the module
// flag only auto-creates the table for the first db) — the sync_poc.html dodge.
var SCHEMA = 'CREATE TABLE IF NOT EXISTS kernel_ops (id INTEGER PRIMARY KEY, op_uuid TEXT, timestamp INTEGER NOT NULL,'
  + ' op_type TEXT NOT NULL, parameters TEXT NOT NULL, input_guids TEXT, output_guid TEXT, undone INTEGER DEFAULT 0,'
  + ' prev_hash TEXT, op_hash TEXT, sig TEXT, gid TEXT, branch_id TEXT, user_tag TEXT DEFAULT "local")';   // branch_id: kernel v13 TABLE_SQL (S7 #930) — _snapshotLog reads it (§TWIN-CLASSIFIED-WITNESS-FIXES 2)
function freshDb(SQL) { var db = new SQL.Database(); db.run(SCHEMA); return db; }

// ── deterministic fixtures (mirror poc_showstopper's scenario in the REAL kernel op shape) ──────────
// A document-event = a few ops; the JOURNAL postings carry {account,cents} (the only balance-bearing ops).
function jrnl(K, db, gid, account, cents) { K.commitOp(db, 'JOURNAL', { gid: gid, account: account, cents: cents }); }
// COMPLETE_ORDER: a (cents-less) doc op + Dr AR / Cr Revenue. PAY: a doc op + Dr Cash / Cr AR.
function gComplete(K, db, no, cents) { K.commitOp(db, 'COMPLETE', { gid: 'so-' + no, doc: 'SO-' + no }); jrnl(K, db, 'so-' + no, 'AR', cents); jrnl(K, db, 'so-' + no, 'Revenue', -cents); }
function gPay(K, db, no, cents)      { K.commitOp(db, 'PAY',      { gid: 'pay-' + no, doc: 'PAY-' + no }); jrnl(K, db, 'pay-' + no, 'Cash', cents); jrnl(K, db, 'pay-' + no, 'AR', -cents); }

function seedP1(K, db) { gComplete(K, db, '1', 10000); gPay(K, db, '1', 10000); gComplete(K, db, '2', 25000); gPay(K, db, '2', 25000); gComplete(K, db, '3', 7500); }
function seedP2(K, db) { gPay(K, db, '3', 7500); }
// determinism: stamp every op's timestamp as a pure function of id (a RECORDED input) before any seal.
function stampDeterministic(db) { db.run('UPDATE kernel_ops SET timestamp = id'); }

(async function () {
  console.log('═══ TEST-KERNEL-PERIOD-CLOSE (W-PCLOSE) — signed checkpoint = balance b/f over the REAL kernel ═══\n');
  var SQL = await initSqlJs();
  var realLog = console.log;

  // ════ §PCLOSE-FOLD + §PCLOSE-COMPACT — close P1 → one signed checkpoint, pre-ckpt ops dropped ════
  console.log('§PCLOSE-FOLD / §PCLOSE-COMPACT — close period 1');
  var K = freshK();
  var dbLive = freshDb(SQL);
  seedP1(K, dbLive); stampDeterministic(dbLive);
  var P1_OPS = 15;   // fixture truth: 3×gComplete(3 ops) + 2×gPay(3 ops) = 15 ops in period 1
  // T3 (bim-ootb #640, §TWIN-CLASSIFIED-WITNESS-FIXES 2): compaction fires ONLY after a CONFIRMED archive of the
  // pre-close log — the sink below records what it was handed so the verdict can assert archive-FIRST.
  var sinkRows = null;
  var ck = await PC.closePeriod(dbLive, K, CONTROLLER, { period: 1, ts: 1700000000,
    archiveSink: async function (rows) { sinkRows = rows.length; return { ok: true, ref: 'witness-archive-p1' }; } });
  var sigOk = await SIGN.verifyTip(ck.tip, ck.sig);
  var balanced = PC.balSum(ck.closing_balances) === 0;
  var expectClose = { AR: 7500, Revenue: -42500, Cash: 35000 };
  var closeMatches = PC.balEqual(ck.closing_balances, expectClose).equal;
  console.log('   closing=' + JSON.stringify(ck.closing_balances) + ' (AR=' + c(ck.closing_balances.AR) + ' Rev=' + c(ck.closing_balances.Revenue) + ' Cash=' + c(ck.closing_balances.Cash) + ') Σ=' + c(PC.balSum(ck.closing_balances)));
  verdict(sigOk && balanced && closeMatches, 'period-close checkpoint signs the new tip (verifies under controller key); P1 books balance (Σ=0); balances exact', 'sig=' + sigOk + ' Σ=' + c(PC.balSum(ck.closing_balances)));

  var liveAfter = await K.verifyChain(dbLive);
  console.log('   archived(pre)=' + ck.archived + ' liveLen(post)=' + ck.liveLen + ' verifyLiveToCkpt=' + (liveAfter.ok ? 'ok' : 'FAIL'));
  verdict(liveAfter.ok && ck.liveLen === 1 && ck.archived === P1_OPS && ck.archived > ck.liveLen && ck.compacted === true && sinkRows === P1_OPS,
    'compaction (T3 archive-first): the sink received ALL ' + P1_OPS + ' pre-close ops BEFORE the delete, then pre-checkpoint ops dropped (live=' + ck.liveLen + ' ≪ archived=' + ck.archived + '); live chain verifies off the checkpoint', 'live=' + ck.liveLen + ' arch=' + ck.archived + ' sinkRows=' + sinkRows + ' compacted=' + ck.compacted);

  // ════ §PCLOSE-BF — P2 opens FROM the checkpoint balances (balance brought forward) ════
  console.log('\n§PCLOSE-BF — period 2 folds from the checkpoint, never re-reading P1');
  seedP2(K, dbLive); stampDeterministic(dbLive);
  await K.sealChain(dbLive);
  var boot = PC.bootstrapFromCheckpoint(dbLive, K);
  var expectCurrent = { AR: 0, Revenue: -42500, Cash: 42500 };
  var bfOk = boot.fromCheckpoint && PC.balEqual(boot.opening, expectClose).equal && PC.balEqual(boot.current, expectCurrent).equal;
  console.log('   opening=' + JSON.stringify(boot.opening) + ' postCount=' + boot.postCount + ' current=' + JSON.stringify(boot.current) + ' (Cash=' + c(boot.current.Cash) + ' AR=' + c(boot.current.AR) + ')');
  verdict(bfOk, 'balance b/f: P2 opens from the checkpoint (AR 75.00 paid → AR=0, Cash=425.00); only ' + boot.postCount + ' post-ckpt ops folded', 'openOk + currentOk');

  // ════ §PCLOSE-RECONCILE (THE FALSIFIER) — fold[ckpt + P2] == fold[full genesis P1+P2] to the cent ════
  console.log('\n§PCLOSE-RECONCILE (FALSIFIER) — compacted state == full-history state, to the cent');
  var Kf = freshK();
  var dbFull = freshDb(SQL);
  seedP1(Kf, dbFull); seedP2(Kf, dbFull); stampDeterministic(dbFull);
  await Kf.sealChain(dbFull);
  var fullFold = PC.foldBalances(Kf.replayOps(dbFull), null).bal;
  var recon = PC.balEqual(boot.current, fullFold);
  console.log('   compact=' + JSON.stringify(boot.current) + ' full=' + JSON.stringify(fullFold) + ' maxDiff=' + recon.maxDiffCents + 'c');
  verdict(recon.equal && recon.maxDiffCents === 0, 'FALSIFIER: fold(checkpoint + P2) == fold(full genesis log) TO THE CENT (compaction lossless, balance-b/f holds)', 'maxDiff=' + recon.maxDiffCents + 'c');
  if (!recon.equal) console.log('   ⚠ HolyGrail §compaction is WOUNDED — re-fold did NOT reconcile. Correct the doc, do NOT paper over.');

  // ════ §PCLOSE-TAMPER — (a) live checkpoint, (b) re-sealed forger, (c) archived op ════
  console.log('\n§PCLOSE-TAMPER — forging the checkpoint or an archived op is caught');
  // (a) tamper the live checkpoint balances → chain breaks at exactly the checkpoint op.
  var Kt = freshK(); var dbT = freshDb(SQL); seedP1(Kt, dbT); stampDeterministic(dbT);
  var ckT = await PC.closePeriod(dbT, Kt, CONTROLLER, { period: 1, ts: 1700000000 });
  var ckRow = dbT.exec("SELECT id FROM kernel_ops WHERE op_type='PERIOD_CLOSE'")[0].values[0][0];
  dbT.run("UPDATE kernel_ops SET parameters=? WHERE id=?", [JSON.stringify({ period: 1, closing_balances: { AR: 999999, Revenue: -42500, Cash: 35000 }, prev_tip: ckT.prev_tip }), ckRow]);
  var vTamper = await Kt.verifyChain(dbT);
  console.log('   (a) live ckpt balances forged → verify ok=' + vTamper.ok + ' brokeAt=' + vTamper.brokeAt + ' why=' + vTamper.why);
  verdict(!vTamper.ok && vTamper.brokeAt === ckRow, 'tampering the live checkpoint balances breaks the chain at exactly the checkpoint op', 'brokeAt=' + vTamper.brokeAt + ' ckptId=' + ckRow);

  // (b) the sophisticated forger: re-seal the forged checkpoint so the chain is internally consistent
  //     again — but they have NO controller key, so the original signature over the honest tip cannot
  //     match the new (forged) tip, and they cannot mint a valid one. Caught ONLY by the signature.
  await Kt.sealChain(dbT);                                   // forger re-seals to repair the chain
  var forgedTip = (await Kt.verifyChain(dbT)).tip;
  var origSigStillValid = await SIGN.verifyTip(forgedTip, ckT.sig);   // honest sig over honest tip vs forged tip
  console.log('   (b) forger re-seals → chain ok again; honest sig vs forged tip verifies=' + origSigStillValid + ' (forgedTip≠honestTip=' + (forgedTip !== ckT.tip) + ')');
  verdict(!origSigStillValid && forgedTip !== ckT.tip, 'a re-sealed forged checkpoint is STILL caught: the controller signature over the honest tip fails on the forged tip (no key to re-sign)', 'sigValid=' + origSigStillValid);

  // (c) tamper an ARCHIVED op → its chain breaks AND the refold diverges from the signed closing balances.
  var Ka = freshK(); var dbA = freshDb(SQL);               // the cold archive (full P1 log, same fixture)
  seedP1(Ka, dbA); stampDeterministic(dbA); await Ka.sealChain(dbA);
  var victim = dbA.exec("SELECT id FROM kernel_ops WHERE op_type='JOURNAL' AND parameters LIKE '%\"gid\":\"so-2\"%' AND parameters LIKE '%AR%' ORDER BY id LIMIT 1")[0].values[0][0];
  dbA.run("UPDATE kernel_ops SET parameters=? WHERE id=?", [JSON.stringify({ gid: 'so-2', account: 'AR', cents: 999900 }), victim]);
  var vArch = await Ka.verifyChain(dbA);
  var refoldArch = PC.foldBalances(Ka.replayOps(dbA), null).bal;
  var divergesFromSigned = !PC.balEqual(refoldArch, ck.closing_balances).equal;
  console.log('   (c) archived op id=' + victim + ' forged → chain ok=' + vArch.ok + ' brokeAt=' + vArch.brokeAt + ' refold≠signedCkpt=' + divergesFromSigned);
  verdict(!vArch.ok && vArch.brokeAt === victim && divergesFromSigned, 'tampering an archived op breaks its chain at exactly that op AND the refold ≠ the signed checkpoint balances', 'brokeAt=' + vArch.brokeAt);

  // ════ §PCLOSE-DET — rebuild → byte-identical checkpoint tip; signature verifies (k random, tip not) ════
  console.log('\n§PCLOSE-DET — rebuild yields a byte-identical checkpoint tip');
  var Kd1 = freshK(); var d1 = freshDb(SQL); seedP1(Kd1, d1); stampDeterministic(d1);
  var ckD1 = await PC.closePeriod(d1, Kd1, CONTROLLER, { period: 1, ts: 1700000000 });
  var Kd2 = freshK(); var d2 = freshDb(SQL); seedP1(Kd2, d2); stampDeterministic(d2);
  var ckD2 = await PC.closePeriod(d2, Kd2, CONTROLLER, { period: 1, ts: 1700000000 });
  var sig1 = await SIGN.verifyTip(ckD1.tip, ckD1.sig), sig2 = await SIGN.verifyTip(ckD2.tip, ckD2.sig);
  console.log('   tipA=' + ckD1.tip.slice(0, 16) + '… tipB=' + ckD2.tip.slice(0, 16) + '… identical=' + (ckD1.tip === ckD2.tip) + ' sigsVerify=' + (sig1 && sig2) + ' sigBytesDiffer=' + (ckD1.sig !== ckD2.sig));
  verdict(ckD1.tip === ckD2.tip && sig1 && sig2, 'rebuild → byte-identical checkpoint tip + both signatures verify (deterministic tip; ECDSA k random so sig bytes differ — fingerprint, not luck)', 'tipEq=' + (ckD1.tip === ckD2.tip));

  // ════ §PCLOSE-REOPEN — reopen = a SUPERSEDE op; the original checkpoint stays in the chain ════
  console.log('\n§PCLOSE-REOPEN — a reopen supersedes via a new op; the checkpoint is never edited in place');
  var Kr = freshK(); var dr = freshDb(SQL); seedP1(Kr, dr); stampDeterministic(dr);
  await PC.closePeriod(dr, Kr, CONTROLLER, { period: 1, ts: 1700000000 });
  var ro = await PC.reopenPeriod(dr, Kr, CONTROLLER, { ts: 1700000100, reason: 'late adjustment' });
  verdict(ro.verify && ro.ckptCount >= 1, 'period reopen appends a SUPERSEDE op and re-verifies; the original PERIOD_CLOSE remains in the chain (audit, not edited)', 'verify=' + ro.verify + ' ckptCount=' + ro.ckptCount);

  console.log('\n═══ ' + (fails ? '🔴 ' + fails + ' FAILED' : '🟢 ALL PASS — period-close fold = signed checkpoint = balance b/f, PROVEN on the real kernel') + ' ═══');
  process.exit(fails ? 1 : 0);
})().catch(function (e) { console.error('FATAL', e); process.exit(1); });
