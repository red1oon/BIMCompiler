#!/usr/bin/env node
// Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
// SPDX-License-Identifier: MIT
/**
 * witness_comm_cl3_store.js — W-STORE-NODE. Spec: prompts/TEAMWORK_FRAMEWORK.md §12.4 (CL3).
 * Real modules: build/comm/{comm_envelope,comm_order,comm_store,comm_pipe}.js on real sql.js, real WebCrypto keys.
 *
 * Arms (each names the issue it proves or disproves), run over memPipe AND folderPipe:
 *   §STORE-CONVERGE    — through a pipe that only stores bytes, 3 devices end with the same op set + one order.
 *   §STORE-RECEIPT     — delivery is proven by the RECEIVER's signed head (SENT before B visits, SEEN-by-B after).
 *   §STORE-WITHHOLD    — a pipe hiding one bundle parks its descendants (counted), restoring it converges.
 *   §STORE-EQUIVOCATE  — two different signed ops at one (author, seq) are caught on every peer.
 *   §STORE-FORGE       — unknown key and tampered body are refused on ingest (the pipe checks nothing).
 *   §STORE-INCREMENTAL — a visit with nothing new fetches 0 bundles (low noise).
 *
 * Run: node scripts/witness_comm_cl3_store.js 2>&1 | tee build/comm/logs/witness_comm_cl3_store.log
 */
'use strict';
if (typeof globalThis.crypto === 'undefined' || !globalThis.crypto.subtle) globalThis.crypto = require('crypto').webcrypto;
var path = require('path'), fs = require('fs'), os = require('os'), nodeCrypto = require('crypto');
var initSqlJs = require('sql.js');
var B = path.join(__dirname, '..', 'build', 'comm');
var ENV = require(path.join(B, 'comm_envelope.js')), ORD = require(path.join(B, 'comm_order.js'));
var STORE = require(path.join(B, 'comm_store.js')), PIPE = require(path.join(B, 'comm_pipe.js'));

var fails = 0, judged = 0, inconclusive = [];
function verdict(ok, label, detail) { judged++; if (!ok) fails++; console.log('   ' + (ok ? '🟢' : '🔴') + ' ' + label + (detail ? ' — ' + detail : '')); }
var SPACE = nodeCrypto.createHash('sha256').update('witness-space-cl3').digest('hex');
var syncLog = []; function slog(m) { syncLog.push(m); if (/§COMM_SYNC/.test(m)) console.log('     ' + m); }

function orderHash(s) { return nodeCrypto.createHash('sha256').update(s.order().order.join(',')).digest('hex').slice(0, 16); }
function opSet(s) { return s.query('SELECT op_hash FROM cl_op ORDER BY op_hash').map(function (r) { return r.op_hash; }).join(','); }
async function edit(s, uu, n) { return s.author({ target: { table: 'c_order', uu: uu }, intent: 'K1', ts: 1700000000000 + n,
  body: { op_type: n === 0 ? 'CRUD_CREATE' : 'CRUD_UPDATE', params: n === 0 ? { fields: { documentno: s.kid.slice(0, 4) + '-1', grandtotal: 100 } } : { changes: { grandtotal: { old: 100 + n - 1, new: 100 + n } } } } }); }

async function run(SQL, pipeName, makePipe) {
  console.log('\n════ pipe = ' + pipeName + ' ════');
  var pipe = makePipe(), devs = [], S = [];
  for (var i = 0; i < 3; i++) { var d = await STORE.newDevice(); devs.push(d); S.push(STORE.open(new SQL.Database(), { SQL: SQL, space: SPACE, self: d, log: slog })); }
  var uus = S.map(function () { return nodeCrypto.randomUUID(); });

  // ── §STORE-RECEIPT (first half) + work ──
  for (var k = 0; k < 3; k++) { await edit(S[k], uus[k], 0); await edit(S[k], uus[k], 1); }
  await S[0].sync(pipe);
  var d0 = S[0].delivery();
  console.log('   §STORE-RECEIPT A after own visit: ' + d0.map(function (x) { return x.seq + ':' + x.state; }).join(' '));
  verdict(d0.length === 2 && d0.every(function (x) { return x.state === 'SENT'; }), 'A sent, not yet seen by anyone');

  // ── §STORE-CONVERGE ──
  await S[1].sync(pipe); await S[2].sync(pipe);
  for (var r2 = 0; r2 < 3; r2++) await S[r2].sync(pipe);        // second visit round: everyone collects everyone
  var hashes = S.map(orderHash), sets = S.map(opSet), placed = S.map(function (s) { return s.order().order.length; });
  console.log('   §STORE-CONVERGE order=' + hashes.join('/') + ' placed=' + placed.join('/'));
  verdict(placed.every(function (n) { return n === 6; }), 'all 6 ops placed on every device', placed.join('/'));
  verdict(sets[0] === sets[1] && sets[1] === sets[2], 'same op set on every device');
  verdict(hashes[0] === hashes[1] && hashes[1] === hashes[2], 'same order on every device');
  var names = (pipe._names ? pipe._names() : await pipe.list('')), stray = names.filter(function (n) { return !/^(d|o|h)\//.test(n); });
  verdict(!stray.length, 'the pipe holds only d/ o/ h/ objects', 'objects=' + names.length + (stray.length ? ' stray=' + stray.join(',') : ''));

  // ── §STORE-RECEIPT (second half) ──
  var d1 = S[0].delivery();
  console.log('   §STORE-RECEIPT A after peers visited: ' + d1.map(function (x) { return x.seq + ':' + x.state + '[' + x.seenBy.map(function (k) { return k.slice(0, 4); }).join(',') + ']'; }).join(' '));
  verdict(d1.every(function (x) { return x.state === 'SEEN' && x.seenBy.indexOf(S[1].kid) >= 0 && x.seenBy.indexOf(S[2].kid) >= 0; }),
    'A\'s ops SEEN by B and C — proven by their signed heads');

  // ── §STORE-INCREMENTAL ──
  var before = pipe.stats.get, rep = await S[1].sync(pipe);
  verdict(rep.fetched === 0 && rep.ingested === 0, 'a visit with nothing new fetches 0 bundles', 'fetched=' + rep.fetched + ' gets=' + (pipe.stats.get - before));

  // ── §STORE-EQUIVOCATE — C signs a second, different op at its own seq 2 ──
  var c2 = JSON.parse(S[2].query("SELECT envelope FROM cl_op WHERE author_kid=? AND author_seq=2", [S[2].kid])[0].envelope);
  var fork = JSON.parse(JSON.stringify(c2)); fork.body.params.changes = { grandtotal: { old: 100, new: 999 } }; fork = await ENV.sign(fork, devs[2]);
  var fb = new SQL.Database(); fb.run('CREATE TABLE ops (op_hash TEXT PRIMARY KEY, envelope TEXT NOT NULL)');
  fb.run('INSERT INTO ops VALUES (?,?)', [await ENV.hashHex(fork), JSON.stringify(fork)]);
  await pipe.put('o/' + S[2].kid + '/2-2.fork00000000.bimpack', fb.export());
  await S[0].sync(pipe); await S[1].sync(pipe);
  var eq = S.slice(0, 2).map(function (s) { return s.query('SELECT COUNT(*) AS n FROM cl_equivocation')[0].n; });
  var c2v = S[0].query('SELECT verdict FROM cl_verdict WHERE op_hash=?', [await ENV.hashHex(c2)])[0];
  console.log('   §STORE-EQUIVOCATE equivocations A/B=' + eq.join('/') + ' C#2 verdict on A=' + (c2v && c2v.verdict));
  verdict(eq[0] === 1 && eq[1] === 1, 'the fork is recorded on every peer');
  verdict(c2v && c2v.verdict === 'EQUIVOCATED', 'the original op at that slot is no longer placed either');

  // ── §STORE-FORGE ──
  var stranger = await STORE.newDevice(), tamper = JSON.parse(JSON.stringify(c2));
  tamper.body.params.changes = { grandtotal: { old: 1, new: 2 } };          // body changed, signature kept
  var fx = { v: 3, space: SPACE, author: stranger.kid, seq: 1, prev: null, deps: [], target: { table: 'c_order', uu: nodeCrypto.randomUUID() }, body: { op_type: 'CRUD_UPDATE', params: { changes: {} } } };
  fx = await ENV.sign(fx, stranger);
  var stUnknown = await S[0].ingest(fx, 'test'), stTamper = await S[1].ingest(tamper, 'test');
  console.log('   §STORE-FORGE unknown-key=' + stUnknown + ' tampered=' + stTamper);
  verdict(stUnknown === 'REFUSED:unknown-device', 'an op from an unknown key is refused');
  verdict(/^REFUSED:signature|^EQUIVOCATION/.test(stTamper) && stTamper !== 'VERIFIED', 'a tampered body is refused (signature)', stTamper);

  // ── §STORE-WITHHOLD (memPipe only — the seam that lets a pipe hide an object) ──
  if (pipe._withhold) {
    var P2 = PIPE.memPipe('mem-withhold'), W = [];
    for (var w = 0; w < 3; w++) W.push(STORE.open(new SQL.Database(), { SQL: SQL, space: SPACE, self: devs[w], log: slog }));
    var wu = [nodeCrypto.randomUUID(), nodeCrypto.randomUUID(), nodeCrypto.randomUUID()];
    await edit(W[0], wu[0], 0); await W[0].sync(P2);
    var hidden = (await P2.list('o/' + W[0].kid + '/'))[0];
    await W[1].sync(P2); await edit(W[1], wu[1], 0); await W[1].sync(P2);      // B's op depends on A's
    await edit(W[2], wu[2], 0); await W[2].sync(P2);                            // C's own op is independent
    P2._withhold(hidden);
    var W3 = STORE.open(new SQL.Database(), { SQL: SQL, space: SPACE, self: await STORE.newDevice(), log: slog });   // a late joiner
    var r1 = await W3.sync(P2);
    console.log('   §STORE-WITHHOLD late joiner with A\'s bundle hidden: placed=' + r1.placed + ' parked=' + r1.parked);
    verdict(r1.parked === 1 && r1.placed === 1, 'B\'s dependent op parks, C\'s independent op places', 'placed=' + r1.placed + ' parked=' + r1.parked);
    P2._restore(hidden);
    var r2b = await W3.sync(P2);
    console.log('   §STORE-WITHHOLD after restore: placed=' + r2b.placed + ' parked=' + r2b.parked);
    verdict(r2b.placed === 3 && r2b.parked === 0, 'restoring the bundle converges (nothing guessed meanwhile)');
  }
  console.log('   §COMM_PIPE_STATS ' + pipeName + ' put=' + pipe.stats.put + ' get=' + pipe.stats.get + ' list=' + pipe.stats.list + ' bytesPut=' + pipe.stats.bytesPut);
}

(async function () {
  console.log('═══ W-STORE-NODE — CL3 comm.db + post-office visits (TEAMWORK_FRAMEWORK §12.4) ═══');
  var SQL = await initSqlJs();
  await run(SQL, 'memPipe', function () { return PIPE.memPipe('mem'); });
  var dir = fs.mkdtempSync(path.join(os.tmpdir(), 'comm-folder-'));
  await run(SQL, 'folderPipe ' + dir, function () { return PIPE.folderPipe(dir, 'folder'); });
  if (!syncLog.some(function (m) { return /§COMM_TRUST mode=CL3-temporary/.test(m); })) inconclusive.push('trust mode line missing');
  console.log('\n──────────────────────────────────────────────');
  if (inconclusive.length || judged === 0) console.log('§W-STORE-NODE INCONCLUSIVE judged=' + judged + ' fails=' + fails + ' — ' + inconclusive.join(' | '));
  else console.log('§W-STORE-NODE ' + (fails ? 'FAIL' : 'PASS') + ' judged=' + judged + ' fails=' + fails);
  process.exit(fails || inconclusive.length ? 1 : 0);
})().catch(function (e) { console.log('🔴 CRASH ' + (e && e.stack || e)); process.exit(2); });
