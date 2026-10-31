#!/usr/bin/env node
// Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
// SPDX-License-Identifier: MIT
/**
 * witness_comm_cl1_uu.js — W-UU-NO-COLLIDE. Spec: prompts/TEAMWORK_FRAMEWORK.md §12.1 (CL1).
 *
 * Runs REAL code only: build/erp/kernel_ops.js (== bim-ootb erp/kernel_ops.js), build/erp/erp_sync_fsm.js rebase,
 * build/erp/erp_sequencer.js, and bim-ootb origin/main erp/crud_core.js listTip (extracted by git show, sha logged).
 *
 * Arms (each names the issue it proves or disproves):
 *   §UU-RED      — today: an edit addresses a created row by its synthetic pk (-opId, a LOCAL row id). After a real
 *                  sync re-numbers rows, station B's edit lands on station A's order. Not reproduced → INCONCLUSIVE.
 *   §UU-GREEN    — same scenario with v3 envelopes addressed by <table>_uu → each order keeps its own edit.
 *   §UU-VALIDATE — V8 refuses a device-local ref; V7 refuses a missing target.uu.
 *   §ENV-HASH    — hash stable under key-order permutation, changes with any field.
 *   §ENV-SIG     — real ECDSA verify passes; tampered body and wrong key fail.
 *   §ENV-WRAP    — real kernel CREATE/UPDATE rows wrap to v3 with the right uu; unresolvable row refused.
 *
 * Run: node scripts/witness_comm_cl1_uu.js 2>&1 | tee build/comm/logs/witness_comm_cl1_uu.log
 */
'use strict';
if (typeof globalThis.crypto === 'undefined' || !globalThis.crypto.subtle) globalThis.crypto = require('crypto').webcrypto;
global.window = { APP: {} };
global.APP = global.window.APP;
global.indexedDB = { open: function () { var r = {}; setTimeout(function () { r.result = { createObjectStore: function () {}, transaction: function () { return { objectStore: function () { return { put: function () {} }; } }; } }; if (r.onsuccess) r.onsuccess(); }, 0); return r; } };

var path = require('path'), fs = require('fs'), os = require('os'), cp = require('child_process'), nodeCrypto = require('crypto');
var initSqlJs = require('sql.js');
var ROOT = path.join(__dirname, '..');
var KERNEL = path.join(ROOT, 'build', 'erp', 'kernel_ops.js');
var FSM = require(path.join(ROOT, 'build', 'erp', 'erp_sync_fsm.js'));
var SEQ = require(path.join(ROOT, 'build', 'erp', 'erp_sequencer.js'));
var ENV = require(path.join(ROOT, 'build', 'comm', 'comm_envelope.js'));
var OOTB = process.env.BIM_OOTB || path.join(os.homedir(), 'bim-ootb');

function freshK() { delete require.cache[require.resolve(KERNEL)]; require(KERNEL); return global.window.KernelOps; }
var fails = 0, judged = 0, inconclusive = [];
function verdict(ok, label, detail) { judged++; if (!ok) fails++; console.log('   ' + (ok ? '🟢' : '🔴') + ' ' + label + (detail ? ' — ' + detail : '')); }
function quiet(fn) { var l = console.log; console.log = function () {}; return Promise.resolve().then(fn).finally(function () { console.log = l; }); }
var uuid = function () { return nodeCrypto.randomUUID(); };
var SPACE = nodeCrypto.createHash('sha256').update('witness-space').digest('hex');

(async function () {
  console.log('═══ W-UU-NO-COLLIDE — CL1 envelope v3 + UU-only references (TEAMWORK_FRAMEWORK §12.1) ═══\n');
  var SQL = await initSqlJs();

  // the REAL fold, from bim-ootb origin/main (local checkout may be stale — §Session Startup 0)
  var src = cp.execSync('git -C ' + JSON.stringify(OOTB) + ' show origin/main:erp/crud_core.js', { encoding: 'utf8' });
  var tmp = path.join(os.tmpdir(), 'witness_cl1_crud_core.js'); fs.writeFileSync(tmp, src);
  var CORE = require(tmp);
  console.log('§CL1_SOURCES crud_core=origin/main sha1=' + nodeCrypto.createHash('sha1').update(src).digest('hex').slice(0, 12) +
    ' kernel_ops sha1=' + nodeCrypto.createHash('sha1').update(fs.readFileSync(KERNEL)).digest('hex').slice(0, 12));

  // listTip reads table columns from globalThis.__idmpDb (crud_core.js:_getTableCols) — give it c_order's real column names
  var meta = new SQL.Database();
  meta.run('CREATE TABLE c_order (c_order_id INTEGER, c_order_uu TEXT, documentno TEXT, grandtotal NUMERIC, created TEXT, updated TEXT, createdby INTEGER, updatedby INTEGER, ad_client_id INTEGER, ad_org_id INTEGER, isactive TEXT, processed TEXT, processing TEXT, posted TEXT)');
  globalThis.__idmpDb = meta;

  function fold(db) { return CORE.listTip(db, 'c_order', 'c_order_id', [], null).rows; }
  function byDoc(rows) { var m = {}; rows.forEach(function (r) { m[r.documentno] = r; }); return m; }

  async function syncPair(KA, dbA, KB, dbB) {
    var seq = SEQ.createSequencer();
    await quiet(async function () {
      await KA.sealChain(dbA); await KB.sealChain(dbB);
      await FSM.rebase(dbA, KA, seq); await FSM.rebase(dbB, KB, seq); await FSM.rebase(dbA, KA, seq);
    });
  }

  // ── §UU-RED — today's shape ──
  console.log('§UU-RED — edit by synthetic pk, then a real sync');
  var KA = freshK(), dbA = new SQL.Database(), KB = freshK(), dbB = new SQL.Database();
  await quiet(function () {
    KA.commitOp(dbA, 'CRUD_CREATE', { table: 'c_order', fields: { documentno: 'A-1', grandtotal: 100 } }, null, null, uuid());
    var pkA = fold(dbA)[0].c_order_id;
    KA.commitOp(dbA, 'CRUD_UPDATE', { table: 'c_order', id: pkA, changes: { grandtotal: { old: 100, new: 111 } } }, null, null, uuid());
    KB.commitOp(dbB, 'CRUD_CREATE', { table: 'c_order', fields: { documentno: 'B-1', grandtotal: 200 } }, null, null, uuid());
    var pkB = fold(dbB)[0].c_order_id;
    KB.commitOp(dbB, 'CRUD_UPDATE', { table: 'c_order', id: pkB, changes: { grandtotal: { old: 200, new: 222 } } }, null, null, uuid());
  });
  var preA = byDoc(fold(dbA)), preB = byDoc(fold(dbB));
  console.log('   §UU-RED before sync  A sees A-1=' + (preA['A-1'] || {}).grandtotal + ' (pk ' + (preA['A-1'] || {}).c_order_id + ')' +
              '   B sees B-1=' + (preB['B-1'] || {}).grandtotal + ' (pk ' + (preB['B-1'] || {}).c_order_id + ')');
  // keep station A's pre-sync rows for §ENV-WRAP (real kernel rows, real local pks)
  var wrapRows = KA.replayOps(dbA), wrapFold = fold(dbA);
  await syncPair(KA, dbA, KB, dbB);
  var redA = byDoc(fold(dbA)), redB = byDoc(fold(dbB));
  var a1 = redA['A-1'] || {}, b1 = redA['B-1'] || {};
  console.log('   §UU-RED after sync   A-1=' + a1.grandtotal + ' (pk ' + a1.c_order_id + ')   B-1=' + b1.grandtotal + ' (pk ' + b1.c_order_id + ')' +
              '   [station B view: A-1=' + (redB['A-1'] || {}).grandtotal + ' B-1=' + (redB['B-1'] || {}).grandtotal + ']');
  if (!a1.documentno || !b1.documentno) { inconclusive.push('UU-RED fold returned no rows'); console.log('   ⚪ INCONCLUSIVE — fold returned no rows'); }
  else if (a1.grandtotal === 222 && b1.grandtotal === 200) {
    console.log('   ⚫ §UU-RED defect REPRODUCED — B\'s edit (222) landed on A\'s order; B\'s own order still 200');
  } else { inconclusive.push('UU-RED defect not reproduced (A-1=' + a1.grandtotal + ' B-1=' + b1.grandtotal + ')');
    console.log('   ⚪ INCONCLUSIVE — the defect did not reproduce, so GREEN below proves nothing about it'); }

  // ── §UU-GREEN — v3 envelopes addressed by <table>_uu ──
  console.log('\n§UU-GREEN — same scenario, v3 envelopes by UU');
  var kpA = await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify']);
  var kpB = await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify']);
  var jwkA = await crypto.subtle.exportKey('jwk', kpA.publicKey), jwkB = await crypto.subtle.exportKey('jwk', kpB.publicKey);
  var sA = { kid: 'kid-A', privateKey: kpA.privateKey }, sB = { kid: 'kid-B', privateKey: kpB.privateKey };
  async function envOf(signer, seq, prev, target, op_type, params) {
    var rv = {}; rv[target.uu] = prev;                        // the record's version this op read (its own previous op here)
    var e = { v: 3, space: SPACE, author: signer.kid, seq: seq, prev: prev, deps: prev ? [prev] : [], reads: rv, manifest: 'm0', policy: 'p0', intent: 'K2',
              target: target, base: prev, ts: 1700000000000 + seq, body: { op_type: op_type, params: params } };
    var vr = ENV.validate(e); if (!vr.ok) throw new Error('fixture invalid: ' + vr.errors.join('; '));
    return ENV.sign(e, signer);
  }
  async function commitEnv(K, db, env) {
    var opUuid = env.body.op_type === 'CRUD_CREATE' ? env.target.uu : uuid();   // a CREATE's op_uuid IS the record UU
    await quiet(function () { K.commitOp(db, env.body.op_type, ENV.toKernelParams(env), null, null, opUuid); });
  }
  var uuA = uuid(), uuB = uuid();
  var gA = freshK(), gdA = new SQL.Database(), gB = freshK(), gdB = new SQL.Database();
  var eA1 = await envOf(sA, 1, null, { table: 'c_order', uu: uuA }, 'CRUD_CREATE', { fields: { documentno: 'A-1', grandtotal: 100 } });
  var eA2 = await envOf(sA, 2, await ENV.hashHex(eA1), { table: 'c_order', uu: uuA }, 'CRUD_UPDATE', { changes: { grandtotal: { old: 100, new: 111 } } });
  var eB1 = await envOf(sB, 1, null, { table: 'c_order', uu: uuB }, 'CRUD_CREATE', { fields: { documentno: 'B-1', grandtotal: 200 } });
  var eB2 = await envOf(sB, 2, await ENV.hashHex(eB1), { table: 'c_order', uu: uuB }, 'CRUD_UPDATE', { changes: { grandtotal: { old: 200, new: 222 } } });
  for (var e of [eA1, eA2]) await commitEnv(gA, gdA, e);
  for (var e2 of [eB1, eB2]) await commitEnv(gB, gdB, e2);
  await syncPair(gA, gdA, gB, gdB);
  var gr = fold(gdA), grB = fold(gdB), g = byDoc(gr);
  console.log('   §UU-GREEN after sync  A-1=' + (g['A-1'] || {}).grandtotal + ' uu=' + String((g['A-1'] || {}).c_order_uu).slice(0, 8) +
              '   B-1=' + (g['B-1'] || {}).grandtotal + ' uu=' + String((g['B-1'] || {}).c_order_uu).slice(0, 8) + '   rows=' + gr.length);
  if (!gr.length) { inconclusive.push('UU-GREEN fold returned no rows'); }
  verdict(gr.length === 2, 'two orders after sync (no merge, no loss)', 'rows=' + gr.length);
  verdict((g['A-1'] || {}).grandtotal === 111, "A-1 carries A's own edit (111)", 'got ' + (g['A-1'] || {}).grandtotal);
  verdict((g['B-1'] || {}).grandtotal === 222, "B-1 carries B's own edit (222)", 'got ' + (g['B-1'] || {}).grandtotal);
  verdict((g['A-1'] || {}).c_order_uu === uuA && (g['B-1'] || {}).c_order_uu === uuB, 'each row keeps the UU its author minted');
  verdict(JSON.stringify(byDoc(grB)['A-1']) === JSON.stringify(g['A-1']) && JSON.stringify(byDoc(grB)['B-1']) === JSON.stringify(g['B-1']),
    'station B folds the identical rows');
  verdict(await ENV.verify(eA2, jwkA) && await ENV.verify(eB2, jwkB), 'every envelope verifies under its author key');

  // ── §UU-VALIDATE ──
  console.log('\n§UU-VALIDATE — V7/V8 refuse what would collide');
  var rd0 = {}; rd0[uuA] = null;
  var base = { v: 3, space: SPACE, author: 'kid-A', seq: 1, prev: null, deps: [], reads: rd0, target: { table: 'c_order', uu: uuA }, body: { op_type: 'CRUD_UPDATE', params: { changes: {} } } };
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  var v0 = ENV.validate(base); verdict(v0.ok, 'a well-formed envelope passes', v0.errors.join('; '));
  var x1 = clone(base); x1.body.params.id = -1; var v1 = ENV.validate(x1);
  verdict(!v1.ok && v1.errors.some(function (s) { return /V8 local-pk-ref params\.id/.test(s); }), 'params.id refused (V8)', v1.errors.join('; '));
  var x2 = clone(base); x2.body.params.fields = { c_order_id: -3 }; var v2 = ENV.validate(x2);
  verdict(!v2.ok && v2.errors.some(function (s) { return /V8 local-pk-ref params\.fields\.c_order_id/.test(s); }), 'negative FK value refused (V8)', v2.errors.join('; '));
  var x3 = clone(base); delete x3.target.uu; var v3 = ENV.validate(x3);
  verdict(!v3.ok && v3.errors.some(function (s) { return /V7 target\.uu/.test(s); }), 'missing target.uu refused (V7)', v3.errors.join('; '));
  var x4 = clone(base); x4.deps = ['b'.repeat(64), 'a'.repeat(64)]; var v4 = ENV.validate(x4);
  verdict(!v4.ok && v4.errors.some(function (s) { return /V6/.test(s); }), 'unsorted deps refused (V6)', v4.errors.join('; '));

  var x5 = clone(base); x5.reads = {}; var v5 = ENV.validate(x5);
  verdict(!v5.ok && v5.errors.some(function (s) { return /V9 reads lacks target/.test(s); }), 'reads without the target refused (V9)', v5.errors.join('; '));
  var x6 = clone(base); x6.reads[uuA] = 'd'.repeat(64); var v6 = ENV.validate(x6);
  verdict(!v6.ok && v6.errors.some(function (s) { return /V9 deps != versions/.test(s); }), 'deps that differ from the read versions refused (V9)', v6.errors.join('; '));

  // ── §ENV-HASH ──
  console.log('\n§ENV-HASH — canonical hash');
  var perm = { reads: rd0, body: { params: { changes: {} }, op_type: 'CRUD_UPDATE' }, target: { uu: uuA, table: 'c_order' }, deps: [], prev: null, seq: 1, author: 'kid-A', space: SPACE, v: 3 };
  verdict(await ENV.hashHex(base) === await ENV.hashHex(perm), 'same content, different key order → same hash');
  var ch = clone(base); ch.body.params.changes = { grandtotal: { old: 1, new: 2 } };
  verdict(await ENV.hashHex(base) !== await ENV.hashHex(ch), 'one field changed → different hash');
  verdict(await ENV.hashHex(eA1) === await ENV.hashHex(Object.assign({}, eA1, { sig: 'ff' })), 'the signature is not part of the hash');

  // ── §ENV-SIG ──
  console.log('\n§ENV-SIG — signatures');
  verdict(await ENV.verify(eA1, jwkA), 'author signature verifies');
  var tam = clone(eA1); tam.body.params.fields.grandtotal = 999;
  verdict(!(await ENV.verify(tam, jwkA)), 'tampered body is refused');
  verdict(!(await ENV.verify(eA1, jwkB)), 'another device key is refused');

  // ── §ENV-WRAP — D2 import of real kernel rows ──
  console.log('\n§ENV-WRAP — wrap real kernel rows (station A, before sync)');
  function uuOf(table, id) { var r = wrapFold.filter(function (x) { return String(x.c_order_id) === String(id); })[0]; return r ? r.c_order_uu : null; }
  var wc = ENV.wrapKernelOp(wrapRows[0], uuOf), wu = ENV.wrapKernelOp(wrapRows[1], uuOf);
  console.log('   §ENV-WRAP create→' + JSON.stringify(wc.target || wc.reason) + '  update→' + JSON.stringify(wu.target || wu.reason));
  verdict(wc.ok && wc.target.uu === String(wrapRows[0].op_uuid).toLowerCase(), 'CREATE wraps with uu = its op_uuid');
  verdict(wu.ok && wu.target.uu === wc.target.uu && !('id' in wu.body.params), 'UPDATE wraps to the same record uu, local id dropped');
  var wr = {}; wr[wu.target.uu] = 'c'.repeat(64);
  var wenv = { v: 3, space: SPACE, author: 'kid-A', seq: 2, prev: 'c'.repeat(64), deps: ['c'.repeat(64)], reads: wr, target: wu.target, body: wu.body };
  verdict(ENV.validate(wenv).ok, 'the wrapped UPDATE is a valid v3 envelope', ENV.validate(wenv).errors.join('; '));
  var bad = ENV.wrapKernelOp({ op_type: 'CRUD_UPDATE', op_uuid: uuid(), parameters: { table: 'c_order', id: -99, changes: {} } }, uuOf);
  verdict(!bad.ok && /uu-unresolved/.test(bad.reason), 'an unresolvable local id is refused, never guessed', bad.reason);

  console.log('\n──────────────────────────────────────────────');
  if (inconclusive.length || judged === 0) console.log('§W-UU-NO-COLLIDE INCONCLUSIVE judged=' + judged + ' fails=' + fails + ' — ' + inconclusive.join(' | '));
  else console.log('§W-UU-NO-COLLIDE ' + (fails ? 'FAIL' : 'PASS') + ' judged=' + judged + ' fails=' + fails + ' red_reproduced=yes');
  process.exit(fails || inconclusive.length ? 1 : 0);
})().catch(function (e) { console.log('🔴 CRASH ' + (e && e.stack || e)); process.exit(2); });
