#!/usr/bin/env node
// Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
// SPDX-License-Identifier: MIT
/**
 * witness_comm_space_scope.js — W-SPACE-SCOPE. Spec: prompts/TEAMWORK_FRAMEWORK.md §13.6 (+ §11.2 layout).
 * Real modules: build/comm/* on real sql.js + WebCrypto; writes judged by the real MRole.canUpdate port, as the other comm witnesses.
 *
 * ISSUE UNDER TEST: pipe object names were NOT scoped by space (o/<kid>/…, h/<kid>, r/<kid>), so ONE device in TWO spaces on ONE pipe
 * (a) overwrote its own head h/<kid> across spaces (receipts / frontier wrong), and (b) fetched the other space's bundles and logged a
 * misleading "§COMM_SEAL … TAMPERED … refused (GCM)" though nothing was tampered with.
 *
 * Arms, run over memPipe AND folderPipe (X founds space 1 AND space 2 on the same pipe; M1 is a member of space 1, M2 of space 2):
 *   §SCOPE-NAMES     — every object lives under s/<space>/{o,h}/…, both spaces present (POSITIVE CONTROL: a pipe with one space proves nothing).
 *   §SCOPE-CONVERGE  — each space converges on its OWN ops only: same op set on its devices, every stored op has env.space == that space,
 *                      the two spaces' business op sets are disjoint and non-empty.
 *   §SCOPE-HEADS     — X's head in space 1 is unaffected by X's visits in space 2: read BOTH heads back from the pipe, then author+visit only in
 *                      space 2 and read again: head1 identical, head2 advanced. (VACUOUS guard: the two heads must differ in seq beforehand.)
 *   §SCOPE-TAMPER    — zero "TAMPERED" lines over the whole run (POSITIVE CONTROL: the log did carry §COMM_SYNC/§COMM_SEAL-class lines).
 *   §SCOPE-LEGACY    — an old unscoped object (o/<kid>/…, h/<kid>) planted on the pipe is ignored: not listed, not fetched, no state change.
 *   §SCOPE-GHGUARD   — ghPipe (stubbed network) refuses a put outside the device's own kid/space-scoped prefix, accepts its own scoped names.
 *
 * Run: node scripts/witness_comm_space_scope.js 2>&1 | tee build/comm/logs/witness_comm_space_scope.log
 */
'use strict';
if (typeof globalThis.crypto === 'undefined' || !globalThis.crypto.subtle) globalThis.crypto = require('crypto').webcrypto;
var path = require('path'), fs = require('fs'), os = require('os'), nodeCrypto = require('crypto');
var initSqlJs = require('sql.js');
var B = path.join(__dirname, '..', 'build', 'comm');
var STORE = require(path.join(B, 'comm_store.js')), PIPE = require(path.join(B, 'comm_pipe.js'));
var AD = require(path.join(__dirname, '..', 'build', 'erp', 'ad_access.js')), Better = require('better-sqlite3');
var ADDB = new Better(path.join(__dirname, '..', 'build', 'erp', 'ad_full.db'), { readonly: true }), roles = {};
function access(roleId, client, org, table) {
  var t = ADDB.prepare('SELECT ad_table_id AS id, accesslevel AS lvl FROM ad_table WHERE lower(tablename)=?').get(String(table).toLowerCase());
  if (!t) return { allowed: false, reason: 'no-table' };
  var r = roles[roleId] || (roles[roleId] = AD.buildRole(ADDB, roleId)); return r.canUpdate(client, org, Number(t.id), t.lvl); }

var fails = 0, judged = 0, inconclusive = [];
function verdict(ok, label, detail) { judged++; if (!ok) fails++; console.log('   ' + (ok ? '🟢' : '🔴') + ' ' + label + (detail ? ' — ' + detail : '')); }
var logs = []; function slog(m) { logs.push(m); if (/§COMM_SEAL|TAMPER/.test(m)) console.log('     ' + m); }

function create(s, docno, total) { return s.author({ target: { table: 'c_order', uu: nodeCrypto.randomUUID() }, intent: 'K2', body: { op_type: 'CRUD_CREATE', params: { fields: { documentno: docno, grandtotal: total, ad_client_id: 11, ad_org_id: 11 } } } }); }
function bizSet(s) { return s.query("SELECT op_hash, envelope FROM cl_op WHERE op_type LIKE 'CRUD_%' ORDER BY op_hash").map(function (r) { return r.op_hash; }); }
function spacesIn(s) { var o = {}; s.query('SELECT envelope FROM cl_op').forEach(function (r) { o[JSON.parse(r.envelope).space] = 1; }); return Object.keys(o); }
async function head(pipe, sp, kid) { var b = await pipe.get('s/' + sp + '/h/' + kid); return b ? JSON.parse(new TextDecoder().decode(b)) : null; }

async function run(SQL, pipeName, makePipe) {
  console.log('\n════ pipe = ' + pipeName + ' ════');
  var pipe = makePipe(), X = await STORE.newDevice(), M1 = await STORE.newDevice(), M2 = await STORE.newDevice();
  [X, M1, M2].forEach(function (d) { d.person_uu = nodeCrypto.randomUUID(); });
  var sp1 = await STORE.newSpace('scope-1', X, X.person_uu, 'X', 102), sp2 = await STORE.newSpace('scope-2', X, X.person_uu, 'X', 102);
  function mk(sp, d) { return STORE.open(new SQL.Database(), { SQL: SQL, space: sp.space, self: d, access: access, log: slog }); }
  var X1 = mk(sp1, X), X2 = mk(sp2, X), S1m = mk(sp1, M1), S2m = mk(sp2, M2);
  await X1.genesis(sp1.params); await X2.genesis(sp2.params);
  await X1.addPerson({ person_uu: M1.person_uu, name: 'M1', ad_role_id: 102, comm_admin: false }); await X1.enroll(M1.kid, M1.pubJwk, M1.person_uu, M1.dhPubJwk);
  await X2.addPerson({ person_uu: M2.person_uu, name: 'M2', ad_role_id: 102, comm_admin: false }); await X2.enroll(M2.kid, M2.pubJwk, M2.person_uu, M2.dhPubJwk);
  console.log('§SCOPE space1=' + sp1.space.slice(0, 12) + ' space2=' + sp2.space.slice(0, 12) + ' X=' + X.kid + ' M1=' + M1.kid + ' M2=' + M2.kid);

  // X works in space 1 more than in space 2, so the two heads of ONE device differ (guards the head arm against vacuity)
  await create(X1, 'S1-X-1', 111.11); await create(X1, 'S1-X-2', 222.22); await create(X1, 'S1-X-3', 333.33);
  await create(X2, 'S2-X-1', 444.44);
  for (var round = 0; round < 3; round++) for (var st of [X1, X2, S1m, S2m]) { await st.sync(pipe); if (st === S1m && round === 0) await create(S1m, 'S1-M1-1', 555.55); if (st === S2m && round === 0) await create(S2m, 'S2-M2-1', 666.66); }

  console.log('\n§SCOPE-NAMES');
  var names = pipe._names ? pipe._names() : await pipe.list(''), p1 = 's/' + sp1.space + '/', p2 = 's/' + sp2.space + '/';
  var stray = names.filter(function (n) { return !(/^s\/[0-9a-f]{64}\/(o|h)\//.test(n)); }), n1 = names.filter(function (n) { return n.indexOf(p1) === 0; }), n2 = names.filter(function (n) { return n.indexOf(p2) === 0; });
  console.log('   §SCOPE objects=' + names.length + ' space1=' + n1.length + ' space2=' + n2.length + ' stray=' + stray.length);
  if (!n1.length || !n2.length) inconclusive.push(pipeName + ': a space has no objects on the pipe'); 
  verdict(!stray.length && n1.length > 0 && n2.length > 0, 'every object is s/<space>/{o,h}/…, both spaces present on the one pipe', 'stray=' + stray.join(','));

  console.log('\n§SCOPE-CONVERGE');
  var b1x = bizSet(X1), b1m = bizSet(S1m), b2x = bizSet(X2), b2m = bizSet(S2m);
  console.log('   §SCOPE business ops: space1 X/M1=' + b1x.length + '/' + b1m.length + '  space2 X/M2=' + b2x.length + '/' + b2m.length);
  if (b1x.length === 0 || b2x.length === 0) inconclusive.push(pipeName + ': a space has no business ops');
  verdict(b1x.length === 4 && b1x.join() === b1m.join(), 'space 1: X and M1 hold the same 4 business ops (3 + M1\'s), nothing else');
  verdict(b2x.length === 2 && b2x.join() === b2m.join(), 'space 2: X and M2 hold the same 2 business ops (1 + M2\'s), nothing else');
  verdict(b1x.filter(function (h) { return b2x.indexOf(h) >= 0; }).length === 0, 'the two spaces\' business op sets are disjoint');
  var sp = [spacesIn(X1), spacesIn(S1m), spacesIn(X2), spacesIn(S2m)];
  verdict(sp[0].join() === sp1.space && sp[1].join() === sp1.space && sp[2].join() === sp2.space && sp[3].join() === sp2.space, 'every op stored in a space\'s database carries that space\'s id (no cross-space op ever ingested)');

  console.log('\n§SCOPE-HEADS');
  var h1a = await head(pipe, sp1.space, X.kid), h2a = await head(pipe, sp2.space, X.kid);
  console.log('   §SCOPE X heads before: space1 seq=' + (h1a && h1a.seq) + ' space=' + (h1a && h1a.space.slice(0, 12)) + ' | space2 seq=' + (h2a && h2a.seq) + ' space=' + (h2a && h2a.space.slice(0, 12)));
  if (!h1a || !h2a || h1a.seq === h2a.seq) inconclusive.push(pipeName + ': X\'s two heads are missing or identical in seq — the head arm would be vacuous');
  verdict(!!h1a && !!h2a && h1a.space === sp1.space && h2a.space === sp2.space && h1a.seq === X1.query('SELECT next_seq-1 AS s FROM cl_self WHERE kid=?', [X.kid])[0].s && h2a.seq === X2.query('SELECT next_seq-1 AS s FROM cl_self WHERE kid=?', [X.kid])[0].s,
    'X has TWO heads on the pipe, each in its own space with that space\'s own seq');
  await create(X2, 'S2-X-2', 777.77); await create(X2, 'S2-X-3', 888.88); await X2.sync(pipe); await S2m.sync(pipe); await X2.sync(pipe);   // X posts, M2 collects + posts its head, X reads M2's head
  var h1b = await head(pipe, sp1.space, X.kid), h2b = await head(pipe, sp2.space, X.kid);
  console.log('   §SCOPE X heads after 2 more space-2 ops: space1 seq=' + h1b.seq + ' | space2 seq=' + h2b.seq);
  verdict(JSON.stringify(h1a) === JSON.stringify(h1b), 'X\'s space-1 head is byte-identical after visits in space 2');
  verdict(h2b.seq === h2a.seq + 2, 'X\'s space-2 head advanced by exactly the 2 new ops', 'seq ' + h2a.seq + ' → ' + h2b.seq);
  var dx = X2.delivery().filter(function (x) { return x.seq > h2a.seq; });
  verdict(dx.length === 2 && dx.every(function (x) { return x.state === 'SEEN' && x.seenBy.indexOf(M2.kid) >= 0; }), 'receipt in space 2 is proven by M2\'s space-2 head (SEEN), not confused with space 1', dx.map(function (x) { return x.seq + ':' + x.state; }).join(' '));

  console.log('\n§SCOPE-LEGACY');
  var before = [S1m.query('SELECT COUNT(*) AS n FROM cl_op')[0].n, S1m.query('SELECT COUNT(*) AS n FROM cl_fetched')[0].n];
  var some = n2.filter(function (n) { return /\/o\//.test(n); })[0], sb = await pipe.get(some), hb = await pipe.get('s/' + sp2.space + '/h/' + X.kid);
  await pipe.put('o/' + M2.kid + '/1-1.legacy0000000.bimpack', sb); await pipe.put('h/' + M2.kid, hb);
  var rl = await S1m.sync(pipe), after = [S1m.query('SELECT COUNT(*) AS n FROM cl_op')[0].n, S1m.query('SELECT COUNT(*) AS n FROM cl_fetched')[0].n];
  console.log('   §SCOPE legacy planted (o/' + M2.kid + '/…, h/' + M2.kid + '); space-1 member ops ' + before[0] + '→' + after[0] + ' fetched-rows ' + before[1] + '→' + after[1] + ' rep.fetched=' + rl.fetched);
  verdict(rl.fetched === 0 && before.join() === after.join(), 'unscoped legacy objects are ignored (nothing listed, fetched or changed) — no migration');

  console.log('\n§SCOPE-TAMPER');
  var tam = logs.filter(function (m) { return /TAMPERED/.test(m); }), seen = logs.filter(function (m) { return /§COMM_SYNC/.test(m); });
  console.log('   §SCOPE log lines=' + logs.length + ' §COMM_SYNC=' + seen.length + ' TAMPERED=' + tam.length);
  if (!seen.length) inconclusive.push(pipeName + ': no §COMM_SYNC line captured — the TAMPERED count means nothing');
  verdict(tam.length === 0, 'zero TAMPERED lines with two spaces on one pipe (the misleading GCM refusal is gone)', tam.slice(0, 2).join(' | '));
}

async function ghGuard() {
  console.log('\n════ ghPipe guard (network stubbed — the guard runs before any request) ════');
  var kid = 'a'.repeat(16), other = 'b'.repeat(16), sp = 'c'.repeat(64), calls = 0;
  var P = PIPE.ghPipe({ owner: 'o', repo: 'r', token: 't', self: kid, fetch: async function () { calls++; throw new Error('NET-STUB'); } });
  async function tryPut(name) { try { await P.putMany([{ name: name, bytes: new Uint8Array([1]) }]); return 'accepted'; } catch (e) { return /not under my prefix/.test(e.message) ? 'refused' : (/NET-STUB/.test(e.message) ? 'accepted' : 'other:' + e.message); } }
  var cases = [['s/' + sp + '/h/' + kid, 'accepted'], ['s/' + sp + '/o/' + kid + '/1-1.x.bimpack', 'accepted'], ['s/' + sp + '/r/' + kid, 'accepted'],
    ['s/' + sp + '/h/' + other, 'refused'], ['s/' + sp + '/o/' + other + '/1-1.x.bimpack', 'refused'], ['s/' + sp + '/r/' + other, 'refused'],
    ['h/' + kid, 'refused'], ['o/' + kid + '/1-1.x.bimpack', 'refused'], ['r/' + kid, 'refused'],
    ['s/' + sp.slice(0, 12) + '/h/' + kid, 'refused'], ['s/' + sp + '/x/' + kid, 'refused'], ['s/' + sp + '/h/', 'refused'], ['s/' + sp + '/genesis', 'refused']];
  var bad = [];
  for (var c of cases) { var got = await tryPut(c[0]); console.log('   §SCOPE-GHGUARD ' + c[0].replace(sp, '<sp>') + ' → ' + got); if (got !== c[1]) bad.push(c[0] + '=' + got); }
  if (!calls) inconclusive.push('ghGuard: the accepted names never reached the (stubbed) network — the guard was not exercised past the check');
  verdict(!bad.length, 'ghPipe accepts only s/<space64>/{o,h,r}/<own kid>…, refuses other kids, unscoped names, short space ids', bad.join(' | '));
}

(async function () {
  console.log('═══ W-SPACE-SCOPE — pipe names scoped by space (TEAMWORK_FRAMEWORK §13.6) ═══');
  var SQL = await initSqlJs();
  await run(SQL, 'memPipe', function () { return PIPE.memPipe('mem'); });
  var dir = fs.mkdtempSync(path.join(os.tmpdir(), 'comm-scope-'));
  try { await run(SQL, 'folderPipe ' + dir, function () { return PIPE.folderPipe(dir, 'folder'); }); }
  finally { fs.rmSync(dir, { recursive: true, force: true }); }
  await ghGuard();
  console.log('\n──────────────────────────────────────────────');
  if (inconclusive.length || judged === 0) console.log('§W-SPACE-SCOPE INCONCLUSIVE judged=' + judged + ' fails=' + fails + ' — ' + inconclusive.join(' | '));
  else console.log('§W-SPACE-SCOPE ' + (fails ? 'FAIL' : 'PASS') + ' judged=' + judged + ' fails=' + fails);
  process.exit(fails || inconclusive.length ? 1 : 0);
})().catch(function (e) { console.log('🔴 CRASH ' + (e && e.stack || e)); process.exit(2); });
