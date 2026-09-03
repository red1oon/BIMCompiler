#!/usr/bin/env node
// Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
// SPDX-License-Identifier: MIT
/**
 * test_kernel_sign.js — A2 / W-SIGN-LIVE: exercises the REAL bim-ootb/viewer/kernel_ops.js +
 *   bim-ootb/viewer/erp_signer.js to confirm the edge signer turns the live W-CHAIN from
 *   tamper-EVIDENT into un-FORGEABLE. Spec: scripts/poc_sign.js (the proven shape) + ERP.md §0.20/§9-B.
 *   Mirrors poc_sign's verdicts, but through the ACTUAL kernel's sealChain/verifyChain + setSigner.
 *
 *   Proves:
 *     §SIGN issuer-signed — a log signed by the edge key verifies under that key (verifyChain OK)
 *     §SIGN wrong-key     — the same sigs FAIL under a different public key, at exactly op 1
 *     §SIGN forge         — present-but-not-forge: a holder edits op3 + re-signs with their OWN key;
 *                           op1/op2 stay genuinely issuer-signed; rejected at exactly op 3 (signature)
 *     §SIGN layering      — re-sealing the SAME rows gives an IDENTICAL op_hash but a DIFFERENT sig
 *                           (the signature is outside the deterministic hash — clean layering)
 *     §SIGN custody       — loadOrMint reuses the persisted edge key across "reloads" (sign@load1
 *                           verifies @load2); installSigner wires it into the kernel end-to-end
 *
 *   NOTE vs poc_sign: the LIVE _canonical includes `timestamp`, so two independently-committed logs
 *   would differ; layering is therefore shown by re-sealing the SAME rows (identical inputs).
 *
 * Run: node scripts/test_kernel_sign.js 2>&1 | tee build/erp/test_kernel_sign.log
 */
'use strict';
if (typeof global.crypto === 'undefined') { global.crypto = require('crypto').webcrypto; }
global.window = { APP: {} };
global.APP = global.window.APP;

// Functional in-memory IndexedDB stub (persists across open() calls) — lets erp_signer's loadOrMint
// custody branch (mint-once / reuse-on-reload) be witnessed without a browser.
global.indexedDB = (function () {
  var dbs = {};
  function open(name) {
    var req = {};
    setTimeout(function () {
      var fresh = !dbs[name];
      if (fresh) dbs[name] = {};
      var db = {
        createObjectStore: function (s) { dbs[name][s] = dbs[name][s] || new Map(); return {}; },
        transaction: function (s) {
          var tx = {};
          tx.objectStore = function () {
            return {
              get: function (k) { var r = {}; setTimeout(function () { r.result = dbs[name][s] ? dbs[name][s].get(k) : undefined; if (r.onsuccess) r.onsuccess(); }, 0); return r; },
              put: function (v, k) { var r = {}; setTimeout(function () { if (!dbs[name][s]) dbs[name][s] = new Map(); dbs[name][s].set(k, v); if (tx.oncomplete) tx.oncomplete(); if (r.onsuccess) r.onsuccess(); }, 0); return r; }
            };
          };
          return tx;
        }
      };
      req.result = db;
      if (fresh && req.onupgradeneeded) req.onupgradeneeded();
      if (req.onsuccess) req.onsuccess();
    }, 0);
    return req;
  }
  return { open: open };
})();

var path = require('path');
var initSqlJs = require('sql.js');
var KERNEL = path.join(process.env.HOME, 'bim-ootb', 'viewer', 'kernel_ops.js');
// kernel_ops keeps ONE _tableCreated flag per module instance (it assumes one DB per page). For a
// multi-DB witness, take a fresh instance per fresh DB so ensureTable runs — same dodge as
// test_kernel_identity.js. (_signer is module-scoped, so each instance gets its own setSigner.)
function freshK() { delete require.cache[require.resolve(KERNEL)]; require(KERNEL); return global.window.KernelOps; }
require(path.join(process.env.HOME, 'bim-ootb', 'erp', 'erp_signer.js'));   // browser-pure → attaches window.ErpSigner
var S = global.window.ErpSigner;

var fails = 0;
function verdict(ok, label, detail) { if (!ok) fails++; console.log('   ' + (ok ? '🟢' : '🔴') + ' ' + label + (detail ? ' — ' + detail : '')); }
function col(db, c) { var r = db.exec('SELECT ' + c + ' FROM kernel_ops ORDER BY id'); return r.length ? r[0].values.map(function (v) { return v[0]; }) : []; }

(async function () {
  console.log('═══ TEST-KERNEL-SIGN — W-SIGN edge signer over the REAL kernel chain (§0.20/§9-B) ═══\n');
  var SQL = await initSqlJs();
  var issuer = await S.mintKeypair();
  var other  = await S.mintKeypair();
  var holder = await S.mintKeypair();

  // ── CASE 1: issuer-signed log verifies under issuer key (real sealChain/verifyChain) ──
  var K = freshK();
  K.setSigner(S.makeSigner(issuer));
  var db = new SQL.Database();
  K.commitOp(db, 'ISSUE', { token: 'GIFT-50', limit: 50 });
  K.commitOp(db, 'SPEND', { amount: 10, balance: 40 });
  K.commitOp(db, 'SPEND', { amount: 15, balance: 25 });
  var seal = await K.sealChain(db);
  var v1 = await K.verifyChain(db);
  console.log('§SIGN issuer-signed sealed=' + seal.sealed + ' verify ok=' + v1.ok + ' len=' + v1.len);
  verdict(v1.ok && v1.len === 3 && seal.sealed === 3, 'issuer-signed log verifies under issuer key', 'ok=' + v1.ok);

  // ── CASE 2: SAME sigs verified under a WRONG public key → fail at op 1 ──
  K.setSigner(S.makeSigner({ privateKey: issuer.privateKey, publicKey: other.publicKey }));
  var v2 = await K.verifyChain(db);
  console.log('§SIGN wrong-key verify ok=' + v2.ok + ' brokeAt=' + v2.brokeAt + ' why=' + v2.why);
  verdict(!v2.ok && v2.why === 'signature' && v2.brokeAt === 1, 'op signed by issuer FAILS under a wrong key (at op 1)', 'brokeAt=' + v2.brokeAt + ' why=' + v2.why);

  // ── CASE 3: present-but-not-forge — edit op3 + re-sign with HOLDER key, verify under ISSUER ──
  K = freshK();
  var fdb = new SQL.Database();
  K.setSigner(S.makeSigner(issuer));
  K.commitOp(fdb, 'ISSUE',  { token: 'GIFT-50' });
  K.commitOp(fdb, 'CREDIT', { balance: 50 });
  K.commitOp(fdb, 'CREDIT', { balance: 50 });    // op3 (last) — the one we forge
  await K.sealChain(fdb);                         // op1..3 genuinely issuer-signed
  fdb.run("UPDATE kernel_ops SET parameters='{\"balance\":5000}', sig=NULL WHERE id=3");  // forge payload, drop sig
  // signer that SIGNS as holder (forging op3's sig) but VERIFIES as issuer (the audience's key):
  K.setSigner({ sign: S.makeSigner(holder).sign, verify: S.makeSigner(issuer).verify });
  await K.sealChain(fdb);   // re-hash whole chain; op1/op2 keep issuer sig; op3 re-signed by holder over a VALID hash
  var v3 = await K.verifyChain(fdb);
  console.log('§SIGN forge(present-but-not-forge) ok=' + v3.ok + ' brokeAt=' + v3.brokeAt + ' why=' + v3.why);
  verdict(!v3.ok && v3.brokeAt === 3 && v3.why === 'signature',
          'holder can PRESENT but not FORGE: edited+re-signed op rejected at exactly op 3', 'brokeAt=' + v3.brokeAt + ' why=' + v3.why);

  // ── CASE 4: layering — re-seal the SAME rows → identical op_hash, different sig ──
  K = freshK();
  K.setSigner(S.makeSigner(issuer));
  var ldb = new SQL.Database();
  K.commitOp(ldb, 'X', { n: 1 });
  K.commitOp(ldb, 'Y', { n: 2 });
  await K.sealChain(ldb);
  var h1 = col(ldb, 'op_hash'), s1 = col(ldb, 'sig');
  ldb.run('UPDATE kernel_ops SET sig=NULL');   // keep rows (same timestamp); drop sigs
  await K.sealChain(ldb);
  var h2 = col(ldb, 'op_hash'), s2 = col(ldb, 'sig');
  var hashesEqual = JSON.stringify(h1) === JSON.stringify(h2);
  var sigsDiffer  = JSON.stringify(s1) !== JSON.stringify(s2);
  console.log('§SIGN layering chain-stable=' + hashesEqual + ' sig-nondeterministic=' + sigsDiffer);
  verdict(hashesEqual && sigsDiffer, 'op_hash is deterministic (excludes sig) while the signature varies — clean layering', 'hashes-equal=' + hashesEqual + ' sigs-differ=' + sigsDiffer);

  // ── CASE 5: custody — loadOrMint reuses the persisted key across "reloads" ──
  var k1 = await S.loadOrMint('test_signer_custody');
  var k2 = await S.loadOrMint('test_signer_custody');   // 2nd load = a "reload": must NOT re-mint
  var sig = await S.makeSigner(k1).sign('deadbeefcafe');
  var ok = await S.makeSigner(k2).verify('deadbeefcafe', sig);
  console.log('§SIGN custody sign@load1 verify@load2 ok=' + ok);
  verdict(ok, 'loadOrMint reuses the persisted edge key across reloads (sign@1 verifies @2)', 'cross-verify=' + ok);

  // ── CASE 6: installSigner end-to-end (the page's actual entry point) ──
  K = freshK();
  await S.installSigner(K, { dbName: 'test_install_e2e' });
  var idb = new SQL.Database();
  K.commitOp(idb, 'ISSUE', { token: 'T' });
  await K.sealChain(idb);
  var vi = await K.verifyChain(idb);
  console.log('§SIGN installSigner-e2e verify ok=' + vi.ok);
  verdict(vi.ok, 'installSigner wires the edge key into the kernel end-to-end (page entry point)', 'ok=' + vi.ok);

  console.log('\n§SIGN ' + (fails ? 'FAIL — ' + fails + ' checks red'
    : 'PASS — the edge signature gates authenticity over the deterministic chain: wrong key fails, holder cannot forge, chain stays stable, custody reused across reloads'));
  process.exit(fails ? 1 : 0);
})();
