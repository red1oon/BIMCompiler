#!/usr/bin/env node
// Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
// SPDX-License-Identifier: MIT
/**
 * witness_comm_cl4_admit.js — W-ADMIT-FOLD. Spec: prompts/TEAMWORK_FRAMEWORK.md §12.7 (CL4).
 * Real modules: build/comm/* + build/erp/ad_access.js RoleContext.canUpdate (MRole.canUpdate port) on the REAL AD rows
 * of build/erp/ad_full.db (roles 0 / 102 / 103 / 50004, AD_Role_OrgAccess, AD_Table_Access, c_order AccessLevel).
 *
 * Arms (each names the issue it proves or disproves):
 *   §ADMIT-GENESIS    — a genesis that doesn't hash to the pinned space is not trusted (else anyone could found "our" space).
 *   §ADMIT-ENROLL     — admin enrols; a person enrols their own phone (D4); a stranger / another person's device can't.
 *   §ADMIT-ACCESS     — the AD layer decides writes at fold time, on every device (today: write-time only, fails open).
 *   §ADMIT-REVOKE     — the revoke cut-off holds whatever order ops arrive in.
 *   §ADMIT-ROLE       — a role change applies from the cut-off the admin named, not retroactively, not never.
 *   §ADMIT-FAILCLOSED — unknown table refused; unenrolled device parked; an op that read a refused version refused.
 *   §ADMIT-FAKE-EQUIV — a forged op at a real device's slot can't knock out the real op (denial-of-service guard).
 *   §ADMIT-PERMUTE    — 20 arrival orders → identical verdicts on an observer that authored nothing.
 *
 * Run: node scripts/witness_comm_cl4_admit.js 2>&1 | tee build/comm/logs/witness_comm_cl4_admit.log
 */
'use strict';
if (typeof globalThis.crypto === 'undefined' || !globalThis.crypto.subtle) globalThis.crypto = require('crypto').webcrypto;
var path = require('path'), nodeCrypto = require('crypto');
var initSqlJs = require('sql.js'), Better = require('better-sqlite3');
var B = path.join(__dirname, '..', 'build', 'comm');
var ENV = require(path.join(B, 'comm_envelope.js')), STORE = require(path.join(B, 'comm_store.js')), PIPE = require(path.join(B, 'comm_pipe.js'));
var AD = require(path.join(__dirname, '..', 'build', 'erp', 'ad_access.js'));

var fails = 0, judged = 0, inconclusive = [];
function verdict(ok, label, detail) { judged++; if (!ok) fails++; console.log('   ' + (ok ? '🟢' : '🔴') + ' ' + label + (detail ? ' — ' + detail : '')); }
function rng(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; var t = Math.imul(seed ^ seed >>> 15, 1 | seed);
  t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function shuffle(a, r) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(r() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
var uuid = function () { return nodeCrypto.randomUUID(); };
var logs = []; function quietLog(m) { logs.push(m); }

// the AD access adapter: the REAL canUpdate on the REAL AD rows (fail-closed on unknown role/table)
var ADDB = new Better(path.join(__dirname, '..', 'build', 'erp', 'ad_full.db'), { readonly: true });
var roleCache = {}, accessCalls = [];
function access(roleId, client, org, table) {
  var t = ADDB.prepare('SELECT ad_table_id AS id, accesslevel AS lvl FROM ad_table WHERE lower(tablename)=?').get(String(table).toLowerCase());
  if (!t) return { allowed: false, reason: 'no-table' };
  var r = roleCache[roleId]; if (r === undefined) { try { r = AD.buildRole(ADDB, roleId); } catch (e) { r = null; } roleCache[roleId] = r; }
  if (!r) return { allowed: false, reason: 'no-role' };
  var v = r.canUpdate(client, org, Number(t.id), t.lvl); accessCalls.push([roleId, client, org, table, v.allowed]); return v;
}

(async function () {
  console.log('═══ W-ADMIT-FOLD — identity as ops + admission at fold, real MRole.canUpdate (TEAMWORK_FRAMEWORK §12.7) ═══\n');
  var SQL = await initSqlJs(), pipe = PIPE.memPipe('mem');
  var P = { F: uuid(), P: uuid(), W: uuid(), Sy: uuid(), Q: uuid() };
  var dev = {}; for (var n of ['F', 'D1', 'D2', 'DW', 'DS', 'DQ', 'X', 'S']) dev[n] = await STORE.newDevice();
  var sp = await STORE.newSpace('witness-cl4', dev.F, P.F, 'Founder', 102);
  console.log('§CL4 space=' + sp.space.slice(0, 12) + ' founder=' + dev.F.kid + ' (role 102)');
  function mk(name, person) { var d = dev[name]; d.person_uu = person; return STORE.open(new SQL.Database(), { SQL: SQL, space: sp.space, self: d, access: access, log: quietLog }); }
  var S = { F: mk('F', P.F) };
  var L = {};                                                    // labelled op hashes we will judge
  async function op(store, label, fn) { var r = await fn(store); L[label] = r.hash; return r; }
  function order(table, uuR, docno, client, org) { return { target: { table: table, uu: uuR }, intent: 'K2', body: { op_type: 'CRUD_CREATE', params: { fields: { documentno: docno, ad_client_id: client, ad_org_id: org, grandtotal: 1 } } } }; }

  // founder: genesis, people, devices
  await op(S.F, 'genesis', function (s) { return s.genesis(sp.params); });
  await op(S.F, 'person P', function (s) { return s.addPerson({ person_uu: P.P, name: 'User P', ad_role_id: 103, comm_admin: false }); });
  await op(S.F, 'person W', function (s) { return s.addPerson({ person_uu: P.W, name: 'WS W', ad_role_id: 50004, comm_admin: false }); });
  await op(S.F, 'person Sy', function (s) { return s.addPerson({ person_uu: P.Sy, name: 'Sys', ad_role_id: 0, comm_admin: false }); });
  await op(S.F, 'person Q', function (s) { return s.addPerson({ person_uu: P.Q, name: 'Q', ad_role_id: 102, comm_admin: false }); });
  await op(S.F, 'enroll D1', function (s) { return s.enroll(dev.D1.kid, dev.D1.pubJwk, P.P); });
  await op(S.F, 'enroll DW', function (s) { return s.enroll(dev.DW.kid, dev.DW.pubJwk, P.W); });
  await op(S.F, 'enroll DS', function (s) { return s.enroll(dev.DS.kid, dev.DS.pubJwk, P.Sy); });
  await op(S.F, 'enroll DQ', function (s) { return s.enroll(dev.DQ.kid, dev.DQ.pubJwk, P.Q); });
  await S.F.sync(pipe);
  for (var k of ['D1', 'DW', 'DS', 'DQ', 'S']) { S[k] = mk(k, { D1: P.P, DW: P.W, DS: P.Sy, DQ: P.Q, S: P.P }[k]); await S[k].sync(pipe); }

  // D1 (person P, role 103): own phone yes, someone else's device no; then business writes
  await op(S.D1, 'D1 enrolls own phone D2', function (s) { return s.enroll(dev.D2.kid, dev.D2.pubJwk, P.P); });
  await op(S.D1, 'D1 enrolls X for person W', function (s) { return s.enroll(dev.X.kid, dev.X.pubJwk, P.W); });
  var u11 = uuid(), u12 = uuid(), u0 = uuid();
  await op(S.D1, '103 org 11', function (s) { return s.author(order('c_order', u11, 'P-11', 11, 11)); });
  await op(S.D1, '103 org 12', function (s) { return s.author(order('c_order', u12, 'P-12', 11, 12)); });
  await op(S.D1, '103 org 0', function (s) { return s.author(order('c_order', u0, 'P-0', 11, 0)); });
  await op(S.D1, 'unknown table', function (s) { return s.author(order('x_unknown_table', uuid(), 'X', 11, 11)); });
  await op(S.DW, '50004 org 11', function (s) { return s.author(order('c_order', uuid(), 'W-11', 11, 11)); });
  await op(S.DS, 'System org 11', function (s) { return s.author(order('c_order', uuid(), 'S-11', 11, 11)); });
  // stranger S (never enrolled) tries to enrol itself into person P
  await op(S.S, 'stranger self-enrol', function (s) { return s.enroll(dev.S.kid, dev.S.pubJwk, P.P); });
  await op(S.S, 'stranger writes', function (s) { return s.author(order('c_order', uuid(), 'S-X', 11, 11)); });
  await S.D1.sync(pipe); await S.DW.sync(pipe); await S.DS.sync(pipe); await S.S.sync(pipe);

  // D2 (P's phone): two writes; founder revokes D2 keeping only seq 1
  S.D2 = mk('D2', P.P); await S.D2.sync(pipe);
  var uRev = uuid();
  await op(S.D2, 'D2 seq1', function (s) { return s.author(order('c_order', uuid(), 'D2-1', 11, 11)); });
  await op(S.D2, 'D2 seq2', function (s) { return s.author(order('c_order', uRev, 'D2-2', 11, 11)); });
  await S.D2.sync(pipe); await S.F.sync(pipe);
  await op(S.F, 'revoke D2 after 1', function (s) { return s.revoke(dev.D2.kid, 1); });
  // Q (role 102): seq1 at org 12 is fine; founder moves Q to 103 from seq 2; Q's seq2 at org 12 is not
  await op(S.DQ, 'Q seq1 org 12 as 102', function (s) { return s.author(order('c_order', uuid(), 'Q-1', 11, 12)); });
  var fq = {}; fq[dev.DQ.kid] = 1;
  await op(S.F, 'Q role 102->103 from seq 2', function (s) { return s.setRole({ person_uu: P.Q, ad_role_id: 103, from_seq: fq }); });
  await op(S.DQ, 'Q seq2 org 12 as 103', function (s) { return s.author(order('c_order', uuid(), 'Q-2', 11, 12)); });

  // crafted: D1 edits the record D2 created at its revoked seq 2 (it read a version that never happened)
  var d1self = S.D1.query('SELECT next_seq, head_hash FROM cl_self')[0], rd = {}; rd[uRev] = L['D2 seq2'];
  var dep = { v: 3, space: sp.space, author: dev.D1.kid, seq: d1self.next_seq, prev: d1self.head_hash, deps: [L['D2 seq2']], reads: rd, manifest: 'm0', policy: 'p0', intent: 'K2',
              target: { table: 'c_order', uu: uRev }, base: L['D2 seq2'], ts: 1, body: { op_type: 'CRUD_UPDATE', params: { changes: { grandtotal: { old: 1, new: 2 } } } } };
  dep = await ENV.sign(dep, dev.D1); L['D1 edits revoked record'] = await ENV.hashHex(dep);
  // crafted: a forgery at D1's seq-1 slot, signed by the stranger
  var real1 = JSON.parse(S.D1.query('SELECT envelope FROM cl_op WHERE author_seq=1')[0].envelope);
  var fake = JSON.parse(JSON.stringify(real1)); fake.body.params.kid = dev.S.kid; fake = await ENV.sign(fake, dev.S);
  var fakeHash = await ENV.hashHex(fake);

  // everything every device wrote + the crafted ones
  var everything = [];
  Object.keys(S).forEach(function (k) { S[k].query("SELECT envelope FROM cl_op WHERE state='OWN'").forEach(function (r) { everything.push(JSON.parse(r.envelope)); }); });
  everything.push(dep); everything.push(fake);
  console.log('§CL4 ops written=' + everything.length + ' (incl. 2 crafted)');

  // ── §ADMIT-PERMUTE — an observer that authored nothing judges every op, 20 arrival orders ──
  async function judge(envs, space) {
    var obs = await STORE.newDevice();
    var st = STORE.open(new SQL.Database(), { SQL: SQL, space: space || sp.space, self: obs, access: access, log: quietLog });
    for (var e of envs) await st.ingest(e, 'test');
    var Lr = await st.order(), out = {};
    Object.keys(Lr.verdict).forEach(function (h) { out[h] = Lr.verdict[h].verdict + ':' + (Lr.verdict[h].reason || ''); });
    return { v: out, L: Lr };
  }
  function canon(v) { return JSON.stringify(Object.keys(v).sort().map(function (k) { return [k, v[k]]; })); }   // key order is not a verdict
  var base = await judge(everything), r = rng(5), same = 0;
  var firstDiff = null, labelOf = function (h) { var n = Object.keys(L).filter(function (k) { return L[k] === h; })[0]; return n || (h === fakeHash ? 'forged' : h.slice(0, 8)); };
  for (var i = 0; i < 20; i++) { var j = await judge(shuffle(everything, r)); if (canon(j.v) === canon(base.v)) same++;
    else if (!firstDiff) { var keys = Object.keys(base.v).concat(Object.keys(j.v)).filter(function (x, q, a) { return a.indexOf(x) === q; });
      firstDiff = keys.filter(function (h) { return base.v[h] !== j.v[h]; }).map(function (h) { return labelOf(h) + ': ' + base.v[h] + ' vs ' + j.v[h]; }); } }
  if (firstDiff) console.log('   §ADMIT-PERMUTE first differing verdicts: ' + firstDiff.slice(0, 6).join(' | '));
  var V = base.v;
  function show(label) { return V[L[label]] || '(none)'; }
  console.log('\n§ADMIT verdicts (observer):');
  Object.keys(L).forEach(function (k) { console.log('   §ADMIT ' + k.padEnd(30) + ' → ' + show(k)); });
  console.log('   §ADMIT forged-at-D1-slot'.padEnd(41) + ' → ' + (V[fakeHash] || '(not judged — contender with invalid signature)'));
  console.log('   §COMM_ROSTER ok=' + base.L.roster.ok + ' walks=' + base.L.roster.walks + ' devices=' + Object.keys(base.L.roster.devices).length + ' revokes=' + JSON.stringify(base.L.roster.revokes).replace(/[0-9a-f]{16}/g, function (x) { return x.slice(0, 4); }));
  function is(label, v, why) { var got = show(label); verdict(got.indexOf(v) === 0 && (!why || got.indexOf(why) >= 0), label + ' → ' + v + (why ? ' (' + why + ')' : ''), got); }

  console.log('\n§ADMIT-ENROLL');
  is('genesis', 'MERGED'); is('enroll D1', 'MERGED'); is('D1 enrolls own phone D2', 'MERGED');
  is('D1 enrolls X for person W', 'REFUSED', 'not-admin-or-same-person'); is('stranger self-enrol', 'REFUSED', 'unknown-signer');
  console.log('\n§ADMIT-ACCESS (real canUpdate on ad_full.db)');
  is('103 org 11', 'MERGED'); is('103 org 12', 'REFUSED', 'access:missing=W'); is('103 org 0', 'REFUSED', 'access:');
  is('50004 org 11', 'MERGED'); is('System org 11', 'MERGED', 'system');
  console.log('\n§ADMIT-REVOKE');
  is('revoke D2 after 1', 'MERGED'); is('D2 seq1', 'MERGED'); is('D2 seq2', 'REFUSED', 'revoked');
  console.log('\n§ADMIT-ROLE');
  is('Q seq1 org 12 as 102', 'MERGED'); is('Q role 102->103 from seq 2', 'MERGED'); is('Q seq2 org 12 as 103', 'REFUSED', 'access:missing=W');
  console.log('\n§ADMIT-FAILCLOSED');
  is('unknown table', 'REFUSED', 'access:no-table'); is('stranger writes', 'PARKED', 'unknown-device'); is('D1 edits revoked record', 'REFUSED', 'dep-refused');
  console.log('\n§ADMIT-FAKE-EQUIV');
  verdict(base.L.equivocations.length === 0, 'a forged op at D1\'s slot is not an equivocation', 'equivocations=' + base.L.equivocations.length);
  verdict(V[L['enroll D1']] && show('D1 enrolls own phone D2').indexOf('MERGED') === 0, 'D1\'s real seq-1 op is still placed');
  console.log('\n§ADMIT-PERMUTE');
  verdict(same === 20, 'identical verdicts across 20 arrival orders', same + '/20');
  console.log('\n§ADMIT-GENESIS');
  var forgedParams = JSON.parse(JSON.stringify(sp.params)); forgedParams.founder.kid = dev.S.kid; forgedParams.founder.jwk = dev.S.pubJwk;
  var fg = { v: 3, space: sp.space, author: dev.S.kid, seq: 1, prev: null, deps: [], reads: {}, manifest: 'm0', policy: 'p0', intent: 'K-ID',
             target: everything[0].target, base: null, ts: 1, body: { op_type: 'GENESIS', params: forgedParams } };
  fg.reads[everything[0].target.uu] = null; fg = await ENV.sign(fg, dev.S);
  var g = await judge([fg].concat(everything.filter(function (e) { return e.body.op_type !== 'GENESIS'; })));
  console.log('   §ADMIT-GENESIS roster ok=' + g.L.roster.ok + ' reason=' + g.L.roster.reason + ' placed=' + g.L.order.length);
  verdict(!g.L.roster.ok && g.L.roster.reason === 'no-trusted-genesis' && g.L.order.length === 0, 'a genesis not hashing to the pinned space is untrusted; nothing is placed');

  var calls = accessCalls.length; if (!calls) inconclusive.push('canUpdate was never consulted');
  console.log('\n   §ADMIT canUpdate calls=' + calls + ' roles=' + Object.keys(roleCache).join(','));
  console.log('\n──────────────────────────────────────────────');
  if (inconclusive.length || judged === 0) console.log('§W-ADMIT-FOLD INCONCLUSIVE judged=' + judged + ' fails=' + fails + ' — ' + inconclusive.join(' | '));
  else console.log('§W-ADMIT-FOLD ' + (fails ? 'FAIL' : 'PASS') + ' judged=' + judged + ' fails=' + fails);
  process.exit(fails || inconclusive.length ? 1 : 0);
})().catch(function (e) { console.log('🔴 CRASH ' + (e && e.stack || e)); process.exit(2); });
