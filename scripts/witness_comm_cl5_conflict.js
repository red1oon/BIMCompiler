#!/usr/bin/env node
// Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
// SPDX-License-Identifier: MIT
/**
 * witness_comm_cl5_conflict.js — W-CONFLICT. Spec: prompts/TEAMWORK_FRAMEWORK.md §12.9 (CL5), §11.15 (user-approved Git way).
 * Real: build/comm/*, roster trust, MRole.canUpdate port on build/erp/ad_full.db, AD_Message text from ad_full.db, and the
 * REAL fold — build/erp/kernel_ops.js + bim-ootb origin/main erp/crud_core.js listTip — over store.foldable().
 *
 * Arms (each names the issue it proves or disproves):
 *   §CONF-DISJOINT     — different columns from one base both apply (disproves "every concurrent edit conflicts").
 *   §CONF-SAME-FIELD   — same column from one base: row keeps the before value, 1 conflict, both told (no silent LWW).
 *   §CONF-SEQUENTIAL   — an edit made after SEEING the other is not a conflict (causality ≠ clash).
 *   §CONF-RESOLVE      — a write that saw both candidates clears it; notices go.
 *   §CONF-RACE         — two concurrent, different resolutions conflict again (each round needs a human, stays visible).
 *   §CONF-STALE-ONLINE — record moved on ANOTHER column since load → stale, CurrentRecordModified (twin: record-wide rule).
 *   §CONF-PERMUTE      — conflicts + folded rows identical over 20 arrival orders on an observer.
 * Run: node scripts/witness_comm_cl5_conflict.js 2>&1 | tee build/comm/logs/witness_comm_cl5_conflict.log
 */
'use strict';
if (typeof globalThis.crypto === 'undefined' || !globalThis.crypto.subtle) globalThis.crypto = require('crypto').webcrypto;
global.window = { APP: {} }; global.APP = global.window.APP;
global.indexedDB = { open: function () { var r = {}; setTimeout(function () { r.result = { createObjectStore: function () {}, transaction: function () { return { objectStore: function () { return { put: function () {} }; } }; } }; if (r.onsuccess) r.onsuccess(); }, 0); return r; } };
var path = require('path'), fs = require('fs'), os = require('os'), cp = require('child_process'), nodeCrypto = require('crypto');
var initSqlJs = require('sql.js'), Better = require('better-sqlite3');
var ROOT = path.join(__dirname, '..'), B = path.join(ROOT, 'build', 'comm');
var ENV = require(path.join(B, 'comm_envelope.js')), STORE = require(path.join(B, 'comm_store.js')), PIPE = require(path.join(B, 'comm_pipe.js'));
var AD = require(path.join(ROOT, 'build', 'erp', 'ad_access.js'));
var KERNEL = path.join(ROOT, 'build', 'erp', 'kernel_ops.js');

var fails = 0, judged = 0, inconclusive = [];
function verdict(ok, label, detail) { judged++; if (!ok) fails++; console.log('   ' + (ok ? '🟢' : '🔴') + ' ' + label + (detail ? ' — ' + detail : '')); }
function rng(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; var t = Math.imul(seed ^ seed >>> 15, 1 | seed);
  t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function shuffle(a, r) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(r() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
var uuid = function () { return nodeCrypto.randomUUID(); }, quiet = function () {};

var ADDB = new Better(path.join(ROOT, 'build', 'erp', 'ad_full.db'), { readonly: true }), roles = {};
function access(roleId, client, org, table) {
  var t = ADDB.prepare('SELECT ad_table_id AS id, accesslevel AS lvl FROM ad_table WHERE lower(tablename)=?').get(String(table).toLowerCase());
  if (!t) return { allowed: false, reason: 'no-table' };
  var r = roles[roleId] || (roles[roleId] = AD.buildRole(ADDB, roleId)); return r.canUpdate(client, org, Number(t.id), t.lvl); }
function messageText(v) { var m = ADDB.prepare('SELECT msgtext FROM ad_message WHERE value=?').get(v); return m ? m.msgtext : null; }
function tableId(n) { var t = ADDB.prepare('SELECT ad_table_id AS id FROM ad_table WHERE lower(tablename)=?').get(String(n).toLowerCase()); return t ? Number(t.id) : null; }

(async function () {
  console.log('═══ W-CONFLICT — stale saves, crossed saves, conflicts, notices (TEAMWORK_FRAMEWORK §12.9) ═══\n');
  var SQL = await initSqlJs(), pipe = PIPE.memPipe('mem');
  var src = cp.execSync('git -C ' + JSON.stringify(path.join(os.homedir(), 'bim-ootb')) + ' show origin/main:erp/crud_core.js', { encoding: 'utf8' });
  var tmp = path.join(os.tmpdir(), 'witness_cl5_crud_core.js'); fs.writeFileSync(tmp, src); var CORE = require(tmp);
  var meta = new SQL.Database(); meta.run('CREATE TABLE c_order (c_order_id INTEGER, c_order_uu TEXT, documentno TEXT, description TEXT, grandtotal NUMERIC, ad_client_id INTEGER, ad_org_id INTEGER, created TEXT, updated TEXT, createdby INTEGER, updatedby INTEGER, isactive TEXT, processed TEXT, processing TEXT, posted TEXT)');
  globalThis.__idmpDb = meta;
  function uuidFromHash(h) { return h.slice(0, 8) + '-' + h.slice(8, 12) + '-4' + h.slice(13, 16) + '-8' + h.slice(17, 20) + '-' + h.slice(20, 32); }
  async function fold(store) {                                 // the REAL fold over foldable()
    delete require.cache[require.resolve(KERNEL)]; require(KERNEL); var K = global.window.KernelOps, kdb = new SQL.Database();
    var l = console.log; console.log = quiet;
    try { (await store.foldable()).forEach(function (p) { var e = p.env; K.commitOp(kdb, e.body.op_type, ENV.toKernelParams(e), null, null, e.body.op_type === 'CRUD_CREATE' ? e.target.uu : uuidFromHash(p.hash), e.ts); });
      var rows = CORE.listTip(kdb, 'c_order', 'c_order_id', [], null).rows; } finally { console.log = l; }
    var m = {}; rows.forEach(function (r) { m[r.documentno] = { grandtotal: r.grandtotal, description: r.description }; }); return m;
  }

  var A = await STORE.newDevice(), Bd = await STORE.newDevice(); A.person_uu = uuid(); Bd.person_uu = uuid();
  var sp = await STORE.newSpace('cl5', A, A.person_uu, 'A', 102);
  function mk(d) { return STORE.open(new SQL.Database(), { SQL: SQL, space: sp.space, self: d, access: access, messageText: messageText, tableId: tableId, log: quiet }); }
  var SA = mk(A), SB = mk(Bd);
  await SA.genesis(sp.params); await SA.addPerson({ person_uu: Bd.person_uu, name: 'B', ad_role_id: 102, comm_admin: false }); await SA.enroll(Bd.kid, Bd.pubJwk, Bd.person_uu);
  var O = {}; for (var n of ['O1', 'O2', 'O3', 'O4']) { O[n] = uuid();
    await SA.author({ target: { table: 'c_order', uu: O[n] }, intent: 'K2', body: { op_type: 'CRUD_CREATE', params: { fields: { documentno: n, description: 'x', grandtotal: 100, ad_client_id: 11, ad_org_id: 11 } } } }); }
  async function both() { await SA.sync(pipe); await SB.sync(pipe); await SA.sync(pipe); await SB.sync(pipe); }
  function upd(store, uu, col, from, to) { var ch = {}; ch[col] = { old: from, new: to }; return store.author({ target: { table: 'c_order', uu: uu }, intent: 'K2', body: { op_type: 'CRUD_UPDATE', params: { changes: ch } } }); }
  await both();

  // round 1: disjoint (O1), same field (O2, O4), sequential first half (O3)
  await upd(SA, O.O1, 'description', 'x', 'a'); await upd(SB, O.O1, 'grandtotal', 100, 200);
  await upd(SA, O.O2, 'grandtotal', 100, 111); await upd(SB, O.O2, 'grandtotal', 100, 222);
  await upd(SA, O.O4, 'grandtotal', 100, 111); await upd(SB, O.O4, 'grandtotal', 100, 222);
  await upd(SA, O.O3, 'grandtotal', 100, 111);
  await both();
  await upd(SB, O.O3, 'grandtotal', 111, 333);                 // B has SEEN A's O3 edit
  var loadedO1 = (await SB.versions())[O.O1];                   // B "opens" O1 now (for §CONF-STALE-ONLINE)
  await both();

  var cA = await SA.conflicts(), cB = await SB.conflicts(), fA = await fold(SA), fB = await fold(SB);
  function cf(list, uu) { return list.filter(function (c) { return c.uu === uu; }); }
  console.log('§CONF state after round 1: conflicts=' + cA.length + ' rows A=' + JSON.stringify(fA));
  console.log('\n§CONF-DISJOINT');
  verdict(!cf(cA, O.O1).length && fA.O1.description === 'a' && fA.O1.grandtotal === 200, 'O1: description=a AND grandtotal=200, no conflict', JSON.stringify(fA.O1));
  console.log('\n§CONF-SAME-FIELD');
  var c2 = cf(cA, O.O2)[0] || {};
  console.log('   §CONF O2 conflict col=' + c2.col + ' before=' + c2.before + ' candidates=' + (c2.candidates || []).map(function (k) { return k.value; }).join('/'));
  verdict(c2.col === 'grandtotal' && c2.before === 100 && (c2.candidates || []).length === 2, 'O2: one conflict on grandtotal, before=100, two candidates');
  verdict(fA.O2.grandtotal === 100 && fB.O2.grandtotal === 100, 'O2 folds to the before value on BOTH devices (no silent last-writer-wins)', 'A=' + fA.O2.grandtotal + ' B=' + fB.O2.grandtotal);
  var nA = await SA.notices(A.person_uu), nB = await SB.notices(Bd.person_uu);
  console.log('   §CONF notice A: ' + JSON.stringify(nA.filter(function (x) { return x.record_uu === O.O2; })[0]));
  verdict(nA.some(function (x) { return x.record_uu === O.O2 && x.ad_message === 'CurrentRecordModified' && x.ad_table_id === 259; }) && nB.some(function (x) { return x.record_uu === O.O2; }),
    'both people get a Notice (CurrentRecordModified, AD_Table 259)');
  verdict(JSON.stringify(cA) === JSON.stringify(cB), 'both devices list the identical conflicts');
  console.log('\n§CONF-SEQUENTIAL');
  verdict(!cf(cA, O.O3).length && fA.O3.grandtotal === 333, 'O3: B\'s edit after seeing A\'s → 333, no conflict', JSON.stringify(fA.O3));
  console.log('\n§CONF-STALE-ONLINE');
  await upd(SA, O.O1, 'description', 'a', 'b'); await SA.sync(pipe); await SB.sync(pipe);    // A changes ANOTHER column
  var st = await SB.saveCheck(O.O1, loadedO1), fresh = await SB.saveCheck(O.O1, (await SB.versions())[O.O1]);
  console.log('   §CONF saveCheck stale=' + st.stale + ' msg="' + st.message + '"  fresh=' + fresh.stale);
  verdict(st.stale && st.ad_message === 'CurrentRecordModified' && /changed by another user/.test(st.message || ''), 'B\'s save on O1 is refused: the record moved since B loaded it (another column)');
  verdict(!fresh.stale, 'a save against the current version is not refused');

  // round 2: resolve O2; race O4
  await upd(SA, O.O2, 'grandtotal', 100, 150);
  await upd(SA, O.O4, 'grandtotal', 100, 150); await upd(SB, O.O4, 'grandtotal', 100, 160);
  await both();
  var cA2 = await SA.conflicts(), fA2 = await fold(SA), fB2 = await fold(SB), nA2 = await SA.notices(A.person_uu);
  console.log('\n§CONF-RESOLVE');
  verdict(!cf(cA2, O.O2).length && fA2.O2.grandtotal === 150 && fB2.O2.grandtotal === 150, 'O2: A saw both and wrote 150 → resolved on both devices', JSON.stringify(fA2.O2));
  verdict(!nA2.some(function (x) { return x.record_uu === O.O2; }), 'the O2 notice is gone');
  console.log('\n§CONF-RACE');
  var c4 = cf(cA2, O.O4)[0] || {};
  console.log('   §CONF O4 conflict candidates=' + (c4.candidates || []).map(function (k) { return k.value; }).join('/') + ' before=' + c4.before);
  verdict(c4.candidates && c4.candidates.length === 2 && c4.candidates.map(function (k) { return k.value; }).sort().join('/') === '150/160' && c4.before === 100 && fA2.O4.grandtotal === 100 && fB2.O4.grandtotal === 100,
    'O4: two concurrent resolutions (150 vs 160) → conflicted again; before = the last AGREED value 100 (not the earlier open clash), on both devices');

  // §CONF-PERMUTE — an observer that authored nothing, 20 arrival orders
  console.log('\n§CONF-PERMUTE');
  var all = []; [SA, SB].forEach(function (s) { s.query("SELECT envelope FROM cl_op WHERE state='OWN'").forEach(function (r) { all.push(JSON.parse(r.envelope)); }); });
  var base = null, same = 0, r = rng(9);
  for (var i = 0; i < 21; i++) {
    var ob = await STORE.newDevice(), so = STORE.open(new SQL.Database(), { SQL: SQL, space: sp.space, self: ob, access: access, log: quiet });
    for (var e of (i === 0 ? all : shuffle(all, r))) await so.ingest(e, 't');
    var sig = JSON.stringify({ c: (await so.conflicts()).map(function (x) { return [x.uu, x.col, x.before, x.candidates.map(function (k) { return k.value; })]; }).sort(), f: await fold(so) });
    if (i === 0) base = sig; else if (sig === base) same++;
  }
  console.log('   §CONF observer: ' + base.slice(0, 160) + '…');
  if (!/O4/.test(base)) inconclusive.push('observer fold has no O4 row');
  verdict(same === 20, 'identical conflicts and folded rows over 20 arrival orders', same + '/20');

  console.log('\n──────────────────────────────────────────────');
  if (inconclusive.length || judged === 0) console.log('§W-CONFLICT INCONCLUSIVE judged=' + judged + ' fails=' + fails + ' — ' + inconclusive.join(' | '));
  else console.log('§W-CONFLICT ' + (fails ? 'FAIL' : 'PASS') + ' judged=' + judged + ' fails=' + fails);
  process.exit(fails || inconclusive.length ? 1 : 0);
})().catch(function (e) { console.log('🔴 CRASH ' + (e && e.stack || e)); process.exit(2); });
