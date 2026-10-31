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
 *   §STORE-FORGE       — an unenrolled key is parked, a tampered body refused at fold (the pipe checks nothing).
 *   Trust = the CL4 roster (genesis pinned by the space id, ENROLL ops); writes judged by the real MRole.canUpdate port.
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
var AD = require(path.join(__dirname, '..', 'build', 'erp', 'ad_access.js')), Better = require('better-sqlite3');
var ADDB = new Better(path.join(__dirname, '..', 'build', 'erp', 'ad_full.db'), { readonly: true }), roles = {};
function access(roleId, client, org, table) {     // the real AD layer (MRole.canUpdate port), fail-closed
  var t = ADDB.prepare('SELECT ad_table_id AS id, accesslevel AS lvl FROM ad_table WHERE lower(tablename)=?').get(String(table).toLowerCase());
  if (!t) return { allowed: false, reason: 'no-table' };
  var r = roles[roleId] || (roles[roleId] = AD.buildRole(ADDB, roleId)); return r.canUpdate(client, org, Number(t.id), t.lvl); }

var fails = 0, judged = 0, inconclusive = [];
function verdict(ok, label, detail) { judged++; if (!ok) fails++; console.log('   ' + (ok ? '🟢' : '🔴') + ' ' + label + (detail ? ' — ' + detail : '')); }
var syncLog = []; function slog(m) { syncLog.push(m); if (/§COMM_SYNC/.test(m)) console.log('     ' + m); }

async function orderHash(s) { return nodeCrypto.createHash('sha256').update((await s.order()).order.join(',')).digest('hex').slice(0, 16); }
function opSet(s) { return s.query('SELECT op_hash FROM cl_op ORDER BY op_hash').map(function (r) { return r.op_hash; }).join(','); }
async function edit(s, uu, n) { return s.author({ target: { table: 'c_order', uu: uu }, intent: 'K1', ts: 1700000000000 + n,
  body: { op_type: n === 0 ? 'CRUD_CREATE' : 'CRUD_UPDATE', params: n === 0 ? { fields: { documentno: s.kid.slice(0, 4) + '-1', grandtotal: 100, ad_client_id: 11, ad_org_id: 11 } } : { changes: { grandtotal: { old: 100 + n - 1, new: 100 + n } } } } }); }

async function run(SQL, pipeName, makePipe) {
  console.log('\n════ pipe = ' + pipeName + ' ════');
  var pipe = makePipe(), devs = [], S = [], persons = [];
  for (var i = 0; i < 3; i++) { var d = await STORE.newDevice(); d.person_uu = nodeCrypto.randomUUID(); devs.push(d); persons.push(d.person_uu); }
  var sp = await STORE.newSpace('cl3-store', devs[0], persons[0], 'A', 102), SPACE = sp.space;
  function mk(d) { return STORE.open(new SQL.Database(), { SQL: SQL, space: SPACE, self: d, access: access, log: slog }); }
  for (var i2 = 0; i2 < 3; i2++) S.push(mk(devs[i2]));
  await S[0].genesis(sp.params);
  for (var i3 = 1; i3 < 3; i3++) { await S[0].addPerson({ person_uu: persons[i3], name: 'P' + i3, ad_role_id: 102, comm_admin: false }); await S[0].enroll(devs[i3].kid, devs[i3].pubJwk, persons[i3], devs[i3].dhPubJwk); }
  await S[0].sync(pipe); await S[1].sync(pipe); await S[2].sync(pipe);
  var idOps = S[0].query("SELECT COUNT(*) AS n FROM cl_op WHERE author_kid=?", [devs[0].kid])[0].n;
  var uus = S.map(function () { return nodeCrypto.randomUUID(); });

  // ── §STORE-RECEIPT (first half) + work ──
  for (var k = 0; k < 3; k++) { await edit(S[k], uus[k], 0); await edit(S[k], uus[k], 1); }
  await S[0].sync(pipe);
  var d0 = S[0].delivery().filter(function (x) { return x.seq > idOps; });   // A's two edits (its setup ops were seen earlier)
  console.log('   §STORE-RECEIPT A after own visit: ' + d0.map(function (x) { return x.seq + ':' + x.state; }).join(' '));
  verdict(d0.length === 2 && d0.every(function (x) { return x.state === 'SENT'; }), 'A sent, not yet seen by anyone');

  // ── §STORE-CONVERGE ──
  await S[1].sync(pipe); await S[2].sync(pipe);
  for (var r2 = 0; r2 < 3; r2++) await S[r2].sync(pipe);        // second visit round: everyone collects everyone
  var hashes = [], placed = [], sets = S.map(opSet);
  for (var s3 of S) { hashes.push(await orderHash(s3)); placed.push((await s3.order()).order.length); }
  var biz = []; for (var s4 of S) biz.push((await s4.placedEnvelopes()).length);
  console.log('   §STORE-CONVERGE order=' + hashes.join('/') + ' placed=' + placed.join('/'));
  verdict(biz.every(function (n) { return n === 6; }), 'all 6 business ops placed on every device', 'business=' + biz.join('/') + ' all=' + placed.join('/'));
  verdict(sets[0] === sets[1] && sets[1] === sets[2], 'same op set on every device');
  verdict(hashes[0] === hashes[1] && hashes[1] === hashes[2], 'same order on every device');
  var names = (pipe._names ? pipe._names() : await pipe.list('')), stray = names.filter(function (n) { return !/^s\/[0-9a-f]{64}\/(o|h)\//.test(n); });
  verdict(!stray.length, 'the pipe holds only s/<space>/o|h/ objects (keys travel inside ENROLL ops)', 'objects=' + names.length + (stray.length ? ' stray=' + stray.join(',') : ''));

  // ── §STORE-RECEIPT (second half) ──
  var d1 = S[0].delivery().filter(function (x) { return x.seq > idOps; });
  console.log('   §STORE-RECEIPT A after peers visited: ' + d1.map(function (x) { return x.seq + ':' + x.state + '[' + x.seenBy.map(function (k) { return k.slice(0, 4); }).join(',') + ']'; }).join(' '));
  verdict(d1.every(function (x) { return x.state === 'SEEN' && x.seenBy.indexOf(S[1].kid) >= 0 && x.seenBy.indexOf(S[2].kid) >= 0; }),
    'A\'s ops SEEN by B and C — proven by their signed heads');

  // ── §STORE-INCREMENTAL ──
  var before = pipe.stats.get, rep = await S[1].sync(pipe);
  verdict(rep.fetched === 0 && rep.received === 0, 'a visit with nothing new fetches 0 bundles', 'fetched=' + rep.fetched + ' gets=' + (pipe.stats.get - before));

  // ── §STORE-EQUIVOCATE — C signs a second, different op at its own seq 2 ──
  var c2 = JSON.parse(S[2].query("SELECT envelope FROM cl_op WHERE author_kid=? AND author_seq=2", [S[2].kid])[0].envelope);   // C's own seq 2
  var fork = JSON.parse(JSON.stringify(c2)); fork.body.params.changes = { grandtotal: { old: 100, new: 999 } }; fork = await ENV.sign(fork, devs[2]);
  var fb = new SQL.Database(); fb.run('CREATE TABLE ops (op_hash TEXT PRIMARY KEY, envelope TEXT NOT NULL)');
  fb.run('INSERT INTO ops VALUES (?,?)', [await ENV.hashHex(fork), JSON.stringify(fork)]);
  await pipe.put('s/' + SPACE + '/o/' + S[2].kid + '/2-2.fork00000000.bimpack', fb.export());
  await S[0].sync(pipe); await S[1].sync(pipe);
  var eq = []; for (var s5 of S.slice(0, 2)) eq.push((await s5.order()).equivocations.length);
  var c2v = S[0].query('SELECT verdict FROM cl_verdict WHERE op_hash=?', [await ENV.hashHex(c2)])[0];
  console.log('   §STORE-EQUIVOCATE equivocations A/B=' + eq.join('/') + ' C#2 verdict on A=' + (c2v && c2v.verdict));
  verdict(eq[0] === 1 && eq[1] === 1, 'the fork is recorded on every peer');
  verdict(c2v && c2v.verdict === 'EQUIVOCATED', 'the original op at that slot is no longer placed either');

  // ── §STORE-FORGE ──
  var stranger = await STORE.newDevice(), tamper = JSON.parse(JSON.stringify(c2));
  tamper.body.params.changes = { grandtotal: { old: 1, new: 2 } };          // body changed, signature kept
  var fxu = nodeCrypto.randomUUID(), fxr = {}; fxr[fxu] = null;
  var fx = { v: 3, space: SPACE, author: stranger.kid, seq: 1, prev: null, deps: [], reads: fxr, target: { table: 'c_order', uu: fxu }, body: { op_type: 'CRUD_UPDATE', params: { changes: {} } } };
  fx = await ENV.sign(fx, stranger);
  var stUnknown = await S[0].ingest(fx, 'test'), stTamper = await S[1].ingest(tamper, 'test');
  var vUnknown = (await S[0].order()).verdict[await ENV.hashHex(fx)], vTamper = (await S[1].order()).verdict[await ENV.hashHex(tamper)];
  console.log('   §STORE-FORGE unknown-key ingest=' + stUnknown + ' verdict=' + JSON.stringify(vUnknown) + '  tampered ingest=' + stTamper + ' verdict=' + JSON.stringify(vTamper));
  verdict(vUnknown && vUnknown.verdict === 'PARKED' && vUnknown.reason === 'unknown-device', 'an op from an unenrolled key is parked, never placed');
  verdict(vTamper && /REFUSED|EQUIVOCATED/.test(vTamper.verdict) && vTamper.verdict !== 'MERGED', 'a tampered body is not placed', JSON.stringify(vTamper));

  // ── §STORE-WITHHOLD (memPipe only — the seam that lets a pipe hide an object) ──
  if (pipe._withhold) {
    var P2 = PIPE.memPipe('mem-withhold'), W = [];
    for (var w = 0; w < 3; w++) W.push(STORE.open(new SQL.Database(), { SQL: SQL, space: SPACE, self: devs[w], access: access, log: slog }));
    await W[0].genesis(sp.params);
    for (var w2 = 1; w2 < 3; w2++) { await W[0].addPerson({ person_uu: persons[w2], name: 'P' + w2, ad_role_id: 102, comm_admin: false }); await W[0].enroll(devs[w2].kid, devs[w2].pubJwk, persons[w2], devs[w2].dhPubJwk); }
    await W[0].sync(P2); await W[1].sync(P2); await W[2].sync(P2);
    // CL8 (§13.2): the pipe is now ciphertext, so the late joiner must be an ENROLLED device with a key grant (an unenrolled reader sees nothing — W-PIPE-OPAQUE proves that)
    var lj = await STORE.newDevice(); lj.person_uu = nodeCrypto.randomUUID();
    await W[0].addPerson({ person_uu: lj.person_uu, name: 'LJ', ad_role_id: 102, comm_admin: false }); await W[0].enroll(lj.kid, lj.pubJwk, lj.person_uu, lj.dhPubJwk); await W[0].sync(P2);
    var setupBundles = await P2.list('s/' + SPACE + '/o/' + W[0].kid + '/');
    var wu = [nodeCrypto.randomUUID(), nodeCrypto.randomUUID(), nodeCrypto.randomUUID()];
    await edit(W[0], wu[0], 0); await W[0].sync(P2);
    var hidden = (await P2.list('s/' + SPACE + '/o/' + W[0].kid + '/')).filter(function (n) { return setupBundles.indexOf(n) < 0; })[0];   // A's edit, not its setup
    await W[1].sync(P2); await edit(W[1], wu[0], 1); await W[1].sync(P2);      // B edits A's record: B's op READS A's op
    await edit(W[2], wu[2], 0); await W[2].sync(P2);                            // C's own op is independent
    P2._withhold(hidden);
    var W3 = STORE.open(new SQL.Database(), { SQL: SQL, space: SPACE, self: lj, access: access, log: slog });   // a late joiner (reads only; enrolled + granted, see above)
    var r1 = await W3.sync(P2);
    console.log('   §STORE-WITHHOLD late joiner with A\'s bundle hidden: placed=' + r1.placed + ' parked=' + r1.parked);
    var b1 = (await W3.placedEnvelopes()).length;
    verdict(r1.parked === 1 && b1 === 1, 'B\'s op on A\'s record parks, C\'s op on its own record places', 'business placed=' + b1 + ' parked=' + r1.parked);
    verdict(r1.gaps === 1, 'the late joiner knows exactly what it is waiting for (1 gap, from A\'s signed head)', 'gaps=' + r1.gaps);
    P2._restore(hidden);
    var r2b = await W3.sync(P2);
    console.log('   §STORE-WITHHOLD after restore: placed=' + r2b.placed + ' parked=' + r2b.parked);
    var b2 = (await W3.placedEnvelopes()).length;
    verdict(b2 === 3 && r2b.parked === 0 && r2b.gaps === 0, 'restoring the bundle converges, no gaps (nothing guessed meanwhile)', 'business placed=' + b2);
  }
  console.log('   §COMM_PIPE_STATS ' + pipeName + ' put=' + pipe.stats.put + ' get=' + pipe.stats.get + ' list=' + pipe.stats.list + ' bytesPut=' + pipe.stats.bytesPut);
}

(async function () {
  console.log('═══ W-STORE-NODE — CL3 comm.db + post-office visits (TEAMWORK_FRAMEWORK §12.4) ═══');
  var SQL = await initSqlJs();
  await run(SQL, 'memPipe', function () { return PIPE.memPipe('mem'); });
  var dir = fs.mkdtempSync(path.join(os.tmpdir(), 'comm-folder-'));
  await run(SQL, 'folderPipe ' + dir, function () { return PIPE.folderPipe(dir, 'folder'); });
  if (!syncLog.some(function (m) { return /§COMM_TRUST mode=roster genesis=[0-9a-f]{12}/.test(m); })) inconclusive.push('roster trust line missing');
  console.log('\n──────────────────────────────────────────────');
  if (inconclusive.length || judged === 0) console.log('§W-STORE-NODE INCONCLUSIVE judged=' + judged + ' fails=' + fails + ' — ' + inconclusive.join(' | '));
  else console.log('§W-STORE-NODE ' + (fails ? 'FAIL' : 'PASS') + ' judged=' + judged + ' fails=' + fails);
  process.exit(fails || inconclusive.length ? 1 : 0);
})().catch(function (e) { console.log('🔴 CRASH ' + (e && e.stack || e)); process.exit(2); });
