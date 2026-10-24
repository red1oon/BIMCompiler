#!/usr/bin/env node
// Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
// SPDX-License-Identifier: MIT
/**
 * witness_comm_docno_modes.js — W-DOCNO-MODES. Spec: prompts/TEAMWORK_FRAMEWORK.md §13.12.F (modes S / B / K) + §13.12.F.1.
 * One AD_Sequence-like config object per mode, passed to open(); the engine names no table.
 *
 *   §MD-S  station prefix: three devices number documents with NO pipe at all (a pipe object that throws if touched); numbers never clash; a repeated number for a
 *          different document, and a number with another station's code, are REFUSED. CONTROL: first use of each number is MERGED.
 *   §MD-K  block lease: two devices race for a block (barrier) → disjoint blocks; they allocate offline from their block (the pipe is down); after the 5th number the 6th needs a
 *          new block → offline while the pipe is down, the next block when it is back; a number outside the device's own block is REFUSED. INCONCLUSIVE if the block race did not happen.
 *   §MD-B  booking with the pipe DOWN: the Complete reports {offline} — no BOOKING op is authored, no number is consumed, nothing duplicates — and when the pipe is back the first number
 *          is the first free one. CONTROL: the same call with the pipe up books.
 *
 * Run: node scripts/witness_comm_docno_modes.js 2>&1 | tee build/comm/logs/witness_comm_docno_modes.log
 */
'use strict';
if (typeof globalThis.crypto === 'undefined' || !globalThis.crypto.subtle) globalThis.crypto = require('crypto').webcrypto;
var path = require('path'), nodeCrypto = require('crypto');
var initSqlJs = require('sql.js');
var B = path.join(__dirname, '..', 'build', 'comm');
var STORE = require(path.join(B, 'comm_store.js')), PIPE = require(path.join(B, 'comm_pipe.js')), ADM = require(path.join(B, 'comm_admit.js'));
var AD = require(path.join(__dirname, '..', 'build', 'erp', 'ad_access.js')), Better = require('better-sqlite3');
var ADDB = new Better(path.join(__dirname, '..', 'build', 'erp', 'ad_full.db'), { readonly: true }), roles = {}, tcache = {};
function access(roleId, client, org, table) {
  var t = tcache[table]; if (t === undefined) t = tcache[table] = ADDB.prepare('SELECT ad_table_id AS id, accesslevel AS lvl FROM ad_table WHERE lower(tablename)=?').get(String(table).toLowerCase()) || null;
  if (!t) return { allowed: false, reason: 'no-table' };
  var r = roles[roleId] || (roles[roleId] = AD.buildRole(ADDB, roleId)); return r.canUpdate(client, org, Number(t.id), t.lvl); }
var fails = 0, judged = 0, inconclusive = [];
function verdict(ok, label, detail) { judged++; if (!ok) fails++; console.log('   ' + (ok ? '🟢' : '🔴') + ' ' + label + (detail ? ' — ' + detail : '')); }
var uuid = function () { return nodeCrypto.randomUUID(); };
var SEQ_S = uuid(), SEQ_K = uuid(), SEQ_B = uuid();
var CFGS = [{ uu: SEQ_S, tables: ['c_order'], mode: 'S', prefix: 'POS-', pad: 4 },
            { uu: SEQ_K, tables: ['c_invoice'], mode: 'K', prefix: 'K-', pad: 3, start_no: 1, increment_no: 1, block_size: 5 },
            { uu: SEQ_B, tables: ['c_payment'], mode: 'B', prefix: 'PAY-', pad: 4, start_no: 500, increment_no: 1 }];
function mk(W, name, o) { var st = STORE.open(new W.SQL.Database(), Object.assign({ SQL: W.SQL, space: W.space, self: W.dev[name], access: access, log: function () {}, sequences: CFGS }, o || {})); W.S[name] = st; return st; }
async function world(SQL, names, label) {
  var W = { SQL: SQL, dev: {}, per: {}, S: {}, pipe: PIPE.memPipe(label) };
  for (var n of names) { W.dev[n] = await STORE.newDevice(); W.dev[n].person_uu = uuid(); W.per[n] = W.dev[n].person_uu; }
  var sp = await STORE.newSpace('md-' + label, W.dev[names[0]], W.per[names[0]], names[0], 102); W.space = sp.space;
  mk(W, names[0]); await W.S[names[0]].genesis(sp.params);
  for (var k of names.slice(1)) { await W.S[names[0]].addPerson({ person_uu: W.per[k], name: k, ad_role_id: 102, comm_admin: false }); await W.S[names[0]].enroll(W.dev[k].kid, W.dev[k].pubJwk, W.per[k], W.dev[k].dhPubJwk); }
  for (var m of names.slice(1)) mk(W, m, m === 'O' ? { noCheckpoint: true } : {});
  return W;
}
async function syncAll(W, names, rounds) { for (var r = 0; r < (rounds || 2); r++) for (var n of names) await W.S[n].sync(W.pipe); }
function doc(S, table, docUU, num, override) { var params = { fields: { documentno: override && override.docno || num.docno, grandtotal: 1, ad_client_id: 11, ad_org_id: 11 }, docno_ref: override && override.ref || num.ref };
  return S.author({ target: { table: table, uu: docUU }, refs: num.refs || [], intent: 'K2', body: { op_type: 'CRUD_CREATE', params: params } }); }
function vOf(L, h) { var v = L.verdict[h]; return v ? v.verdict + ':' + (v.reason || '') : 'none'; }
function barrier(n) { var c = 0, ws = []; return function () { c++; return new Promise(function (res) { ws.push(res); if (c >= n) ws.forEach(function (r) { r(); }); }); }; }
// a pipe that throws on any contact: "the post office is unreachable" (mode S must never touch it)
function downPipe() { var touched = 0, f = async function () { touched++; throw new Error('post office unreachable'); }; return { id: 'down', ifAbsent: true, list: f, get: f, put: f, putIfAbsent: f, touched: function () { return touched; } }; }

(async function () {
  console.log('═══ W-DOCNO-MODES — station prefix, block lease, booking: the legacy AD_Sequence chooser (TEAMWORK_FRAMEWORK §13.12.F) ═══');
  var SQL = await initSqlJs(), names = ['A', 'B', 'C', 'O'], W = await world(SQL, names, 'main'); await syncAll(W, names, 3);

  // ════════ S ════════
  var dead = downPipe(), sDocs = [], nums = [];
  for (var round = 0; round < 3; round++) for (var d of ['A', 'B', 'C']) { var u = uuid(), nn = await W.S[d].numberDocument(dead, SEQ_S, u); nums.push(nn.docno); sDocs.push({ d: d, u: u, nn: nn, op: await doc(W.S[d], 'c_order', u, nn) }); }
  await syncAll(W, names, 3);
  var Ls = await W.S.O.order(), Lv = await W.S.B.order();
  console.log('   §MD-S documentnos ' + nums.join(' ') + ' ; pipe touched ' + dead.touched() + ' times');
  verdict(dead.touched() === 0, 'mode S never touches the post office (a pipe that throws on contact was passed)', 'touched=' + dead.touched());
  verdict(new Set(nums).size === 9 && sDocs.every(function (x) { return vOf(Lv, x.op.hash).indexOf('MERGED') === 0 && vOf(Ls, x.op.hash) === vOf(Lv, x.op.hash); }), 'nine documents from three devices, all offline: nine different DocumentNos (station code + local counter), all MERGED on every device', nums.length);
  var a2 = sDocs.filter(function (x) { return x.d === 'A'; }).map(function (x) { return x.nn.n; });
  verdict(JSON.stringify(a2) === '[1,2,3]', 'each device\'s own counter runs 1,2,3 without gaps', 'A=' + a2.join(','));
  var dup = await doc(W.S.A, 'c_order', uuid(), sDocs[0].nn);                                   // A reuses its number 1 for ANOTHER document
  var foreign = await doc(W.S.A, 'c_order', uuid(), { ref: { seq: SEQ_S, n: 4 }, refs: [], docno: ADM.formatDocNo(CFGS[0], 4, W.dev.B.kid) });   // A writes a number with B's station code
  var fresh = await W.S.A.numberDocument(dead, SEQ_S, uuid()), freshOp = await doc(W.S.A, 'c_order', uuid(), fresh);     // CONTROL: the next number is accepted
  await syncAll(W, names, 3); var L2 = await W.S.O.order(), L2v = await W.S.C.order();
  console.log('   §MD-S reuse of A#1 for another document → ' + vOf(L2, dup.hash) + ' ; number with B\'s station code → ' + vOf(L2, foreign.hash) + ' ; next number (' + fresh.n + ') → ' + vOf(L2, freshOp.hash));
  verdict(vOf(L2, dup.hash) === 'REFUSED:docno-duplicate' && vOf(L2, foreign.hash) === 'REFUSED:docno-mismatch' && vOf(L2, freshOp.hash).indexOf('MERGED') === 0 && fresh.n === 4 && vOf(L2, sDocs[0].op.hash).indexOf('MERGED') === 0, 'a repeated number for another document is REFUSED docno-duplicate, another station\'s code is REFUSED docno-mismatch; CONTROL: the next number (4) is MERGED; the document that had the number first (authored first, not first by hash) keeps it');
  verdict([dup, foreign, freshOp].every(function (o) { return vOf(L2, o.hash) === vOf(L2v, o.hash); }), 'and those verdicts are the same on the control and on C');

  // ════════ K ════════
  var KW = await world(SQL, ['A', 'B', 'O'], 'k'), KP = KW.pipe; await syncAll(KW, ['A', 'B', 'O'], 3);
  var bar = barrier(2), bb = await Promise.all([KW.S.A.bookBlock(KP, SEQ_K, { afterList: bar }), KW.S.B.bookBlock(KP, SEQ_K, { afterList: bar })]);
  console.log('   §MD-K block race: A got block ' + bb[0].block + ' [' + bb[0].from + '..' + bb[0].to + '] in ' + bb[0].tries + ' try ; B got block ' + bb[1].block + ' [' + bb[1].from + '..' + bb[1].to + '] in ' + bb[1].tries + ' try');
  if (Math.max(bb[0].tries, bb[1].tries) < 2) inconclusive.push('MD-K: the block race did not happen');
  verdict(bb[0].block !== bb[1].block && (bb[0].to < bb[1].from || bb[1].to < bb[0].from) && Math.max(bb[0].tries, bb[1].tries) === 2, 'two devices racing for a block get disjoint blocks of 5 (the loser took the next block in the same call)');
  await syncAll(KW, ['A', 'B', 'O'], 2);
  var down = downPipe(), kdocs = [], kn = [];
  for (var i = 0; i < 5; i++) for (var dv of ['A', 'B']) { var ku = uuid(), kk = await KW.S[dv].numberDocument(down, SEQ_K, ku); kn.push(dv + ':' + kk.docno); kdocs.push({ dv: dv, n: kk.n, op: await doc(KW.S[dv], 'c_invoice', ku, kk) }); }
  var mine = { A: kdocs.filter(function (x) { return x.dv === 'A'; }).map(function (x) { return x.n; }), B: kdocs.filter(function (x) { return x.dv === 'B'; }).map(function (x) { return x.n; }) };
  console.log('   §MD-K offline allocation (pipe down): A ' + mine.A.join(',') + ' ; B ' + mine.B.join(','));
  verdict(down.touched() === 0 && mine.A.length === 5 && mine.B.length === 5 && mine.A.concat(mine.B).filter(function (n, ix, a) { return a.indexOf(n) === ix; }).length === 10, 'with the pipe DOWN each device allocates its 5 numbers offline from its block; the ten numbers are all different', 'touched=' + down.touched());
  var sixth = await KW.S.A.numberDocument(down, SEQ_K, uuid());
  console.log('   §MD-K the 6th number with the pipe still down → ' + JSON.stringify({ offline: sixth.offline, error: sixth.error && sixth.error.slice(0, 30) }));
  verdict(sixth.offline === true && KW.S.A.query("SELECT COUNT(*) AS n FROM cl_op WHERE op_type='BOOKING' AND author_kid=?", [KW.dev.A.kid])[0].n === 1, 'the block is exhausted: the 6th number is {offline} while the pipe is down, and no second block was booked');
  var u6 = uuid(), n6 = await KW.S.A.numberDocument(KP, SEQ_K, u6), op6 = await doc(KW.S.A, 'c_invoice', u6, n6);
  console.log('   §MD-K pipe back: A\'s 6th number = ' + n6.n + ' (' + n6.docno + ')');
  verdict(n6.n === (bb[0].block === 0 ? 11 : 6) || n6.n > Math.max(bb[0].to, bb[1].to), 'when the pipe is back A books its NEXT block and the 6th number comes from it', 'n=' + n6.n);
  var outside = await doc(KW.S.A, 'c_invoice', uuid(), { ref: { seq: SEQ_K, n: mine.B[0] }, refs: [], docno: ADM.formatDocNo(CFGS[1], mine.B[0], KW.dev.A.kid) });        // A uses a number from B's block
  await syncAll(KW, ['A', 'B', 'O'], 3); var Lk = await KW.S.O.order(), Lkb = await KW.S.B.order();
  console.log('   §MD-K ten offline documents: ' + kdocs.map(function (x) { return vOf(Lk, x.op.hash).split(':')[0]; }).join(',') + ' ; 6th: ' + vOf(Lk, op6.hash) + ' ; A using B\'s block number: ' + vOf(Lk, outside.hash));
  verdict(kdocs.every(function (x) { return vOf(Lkb, x.op.hash).indexOf('MERGED') === 0 && vOf(Lk, x.op.hash) === vOf(Lkb, x.op.hash); }) && vOf(Lk, op6.hash).indexOf('MERGED') === 0, 'all documents numbered offline from a block are MERGED, identically on the control');
  verdict(vOf(Lk, outside.hash) === 'REFUSED:docno-outside-block' && vOf(Lkb, outside.hash) === vOf(Lk, outside.hash), 'CONTROL for the rule: a number taken from the OTHER device\'s block is REFUSED docno-outside-block');

  // ════════ B with the pipe down ════════
  var BW = await world(SQL, ['A', 'B'], 'b'); await syncAll(BW, ['A', 'B'], 3);
  var ops0 = BW.S.A.query('SELECT COUNT(*) AS n FROM cl_op')[0].n, bd = downPipe();
  var off = await BW.S.A.numberDocument(bd, SEQ_B, uuid()), ops1 = BW.S.A.query('SELECT COUNT(*) AS n FROM cl_op')[0].n;
  console.log('   §MD-B pipe down: ' + JSON.stringify({ offline: off.offline, error: off.error }) + ' ; ops before/after ' + ops0 + '/' + ops1 + ' ; pipe contacts ' + bd.touched());
  verdict(off.offline === true && ops0 === ops1 && bd.touched() >= 1, 'with the pipe down the Complete reports {offline} (numbering offline), authors NO op and consumes no number', 'error=' + off.error);
  var on1 = await BW.S.B.numberDocument(BW.pipe, SEQ_B, uuid()), on2 = await BW.S.A.numberDocument(BW.pipe, SEQ_B, uuid());
  console.log('   §MD-B pipe back: B booked ' + on1.n + ', then A booked ' + on2.n);
  verdict(on1.n === 500 && on2.n === 501 && !on1.offline, 'CONTROL: once the pipe is back the first number is the first free one (500) and the next is 501 — nothing was lost or duplicated while it was down');
  var noIf = { id: 'noif', ifAbsent: false, list: async function () { return []; }, put: async function () { return true; } };
  var r0 = await BW.S.A.numberDocument(noIf, SEQ_B, uuid());
  verdict(r0.offline === true && /putIfAbsent/.test(r0.error), 'a pipe without putIfAbsent (e.g. ghPipe today) is reported as {offline} for mode B — never a guess', r0.error);

  console.log('\n──────────────────────────────────────────────');
  if (inconclusive.length || judged === 0) console.log('§W-DOCNO-MODES INCONCLUSIVE judged=' + judged + ' fails=' + fails + ' — ' + inconclusive.join(' | '));
  else console.log('§W-DOCNO-MODES ' + (fails ? 'FAIL' : 'PASS') + ' judged=' + judged + ' fails=' + fails + ' inconclusive=0');
  process.exit(fails || inconclusive.length ? 1 : 0);
})().catch(function (e) { console.log('🔴 CRASH ' + (e && e.stack || e)); process.exit(2); });
