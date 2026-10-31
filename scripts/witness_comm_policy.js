#!/usr/bin/env node
// Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
// SPDX-License-Identifier: MIT
/**
 * witness_comm_policy.js — W-POLICY-FOLD. Spec: prompts/TEAMWORK_FRAMEWORK.md §13.12.1 (POLICY op, reference write gate, stagger).
 * Real modules: build/comm/* on real sql.js + WebCrypto, access judged by the real MRole.canUpdate port (build/erp/ad_full.db), as the other comm witnesses.
 *
 * Arms (each names the issue it proves or disproves; every "refused" has a CONTROL where the same thing is allowed):
 *   §POLICY-FOLD    — three devices end with the same policy (hash) at the same fold position. Control: before the POLICY op none has one.
 *   §POLICY-NONADMIN— a non-admin POLICY is REFUSED not-admin on every device and has no effect. Control: the same params from the admin are MERGED.
 *   §POLICY-EPOCH   — a higher epoch wins; a lower and an equal epoch are refused; the effective epoch never goes down; two admins racing one epoch → one winner on every device.
 *   §POLICY-VALUE   — an invalid value is refused bad-policy:<field>; an unknown key is kept (older/newer devices must judge the same op the same way).
 *   §STAGGER        — staggerOffset is deterministic, in [0,V), spread (<= 2x the mean per bucket over 100 kids). Control: a clustered rule fails the same spread test.
 *   §CAP            — bundle_max_ops=3: 8 ops go out 3+3+2 and converge. Control: no policy sends all 8 in one visit.
 *   §GATE           — stale token after rotation, oversize object, the (cap+1)-th put in an hour — each refused, each with a control that the same write succeeds when allowed;
 *                     and end-to-end through store.sync: a refused visit is retried and delivered once the device holds the fresh token.
 *   §SKEW           — an engine from BEFORE this change (git show 34b915fb1) folds a log that contains POLICY without crashing and refuses it;
 *                     an unknown op type does not crash a newer device.
 *
 * Run: node scripts/witness_comm_policy.js 2>&1 | tee build/comm/logs/witness_comm_policy.log
 */
'use strict';
if (typeof globalThis.crypto === 'undefined' || !globalThis.crypto.subtle) globalThis.crypto = require('crypto').webcrypto;
var path = require('path'), fs = require('fs'), os = require('os'), nodeCrypto = require('crypto'), cp = require('child_process');
var initSqlJs = require('sql.js');
var B = path.join(__dirname, '..', 'build', 'comm');
var STORE = require(path.join(B, 'comm_store.js')), PIPE = require(path.join(B, 'comm_pipe.js')), ROS = require(path.join(B, 'comm_roster.js'));
var AD = require(path.join(__dirname, '..', 'build', 'erp', 'ad_access.js')), Better = require('better-sqlite3');
var ADDB = new Better(path.join(__dirname, '..', 'build', 'erp', 'ad_full.db'), { readonly: true }), roles = {};
function access(roleId, client, org, table) {
  var t = ADDB.prepare('SELECT ad_table_id AS id, accesslevel AS lvl FROM ad_table WHERE lower(tablename)=?').get(String(table).toLowerCase());
  if (!t) return { allowed: false, reason: 'no-table' };
  var r = roles[roleId] || (roles[roleId] = AD.buildRole(ADDB, roleId)); return r.canUpdate(client, org, Number(t.id), t.lvl); }

var fails = 0, judged = 0, inconclusive = [];
function verdict(ok, label, detail) { judged++; if (!ok) fails++; console.log('   ' + (ok ? '🟢' : '🔴') + ' ' + label + (detail ? ' — ' + detail : '')); }
var uuid = function () { return nodeCrypto.randomUUID(); };
var quiet = function () {};

function create(s, u, docno, total) { return s.author({ target: { table: 'c_order', uu: u }, intent: 'K2', body: { op_type: 'CRUD_CREATE', params: { fields: { documentno: docno, grandtotal: total, ad_client_id: 11, ad_org_id: 11 } } } }); }
async function mkSpace(SQL, names, adminNames, pipe) {
  var dev = {}, per = {}, S = {};
  for (var n of names) { dev[n] = await STORE.newDevice(); dev[n].person_uu = uuid(); per[n] = dev[n].person_uu; }
  var sp = await STORE.newSpace('policy-' + names.join(''), dev[names[0]], per[names[0]], names[0], 102);
  names.forEach(function (n) { S[n] = STORE.open(new SQL.Database(), { SQL: SQL, space: sp.space, self: dev[n], access: access, log: quiet }); });
  await S[names[0]].genesis(sp.params);
  for (var k of names.slice(1)) { await S[names[0]].addPerson({ person_uu: per[k], name: k, ad_role_id: 102, comm_admin: adminNames.indexOf(k) >= 0 }); await S[names[0]].enroll(dev[k].kid, dev[k].pubJwk, per[k], dev[k].dhPubJwk); }
  for (var r = 0; r < 2; r++) for (var m of names) await S[m].sync(pipe);
  return { dev: dev, per: per, S: S, space: sp.space };
}
async function allSync(S, names, pipe, rounds) { for (var r = 0; r < (rounds || 2); r++) for (var m of names) await S[m].sync(pipe); }
async function verdictOf(s, hash) { var L = await s.order(); return L.verdict[hash] || null; }
function polParams(over) { return Object.assign({ epoch: 1, visit_ms: 900000, stagger: 'kid-hash-mod-V', bundle_max_ops: 50, gate: { max_object_bytes: 262144, max_puts_per_hour: 120 },
  checkpoint: { every_ops: 500, cosigs: 2 }, lease_ttl_ms: 600000, pipes: { primary: 'gh:red1oon/bim-teams-pipe', fallback: ['mem:fallback'] }, manifest: 'm0', number_prefix: 'STN' }, over || {}); }

// ── load the engine as it was BEFORE this change, isolated from the new one (modules pick up globals if present) ──
function loadOldEngine() {
  var OLD = '34b915fb1', dir = fs.mkdtempSync(path.join(os.tmpdir(), 'comm-old-'));
  try { ['comm_envelope', 'comm_order', 'comm_roster', 'comm_admit', 'comm_pipe', 'comm_store'].forEach(function (f) {
      fs.writeFileSync(path.join(dir, f + '.js'), cp.execFileSync('git', ['show', OLD + ':build/comm/' + f + '.js'], { cwd: path.join(__dirname, '..'), stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 1 << 24 })); });
  } catch (e) { fs.rmSync(dir, { recursive: true, force: true }); return null; }
  var names = ['CommEnvelope', 'CommOrder', 'CommRoster', 'CommAdmit', 'CommStore', 'CommPipe'], saved = {};
  names.forEach(function (n) { saved[n] = globalThis[n]; delete globalThis[n]; });
  var eng = { STORE: require(path.join(dir, 'comm_store.js')), PIPE: require(path.join(dir, 'comm_pipe.js')), dir: dir };
  names.forEach(function (n) { globalThis[n] = saved[n]; });
  return eng;
}

(async function () {
  console.log('═══ W-POLICY-FOLD — one signed policy, one stagger rule, one reference gate (TEAMWORK_FRAMEWORK §13.12.1) ═══');
  var SQL = await initSqlJs();

  // ───────────────────────── §POLICY-FOLD / NONADMIN / EPOCH / VALUE ─────────────────────────
  var pipe = PIPE.memPipe('mem'), names = ['A', 'B', 'C', 'D'];
  var W = await mkSpace(SQL, names, ['D'], pipe), S = W.S;                      // A founder (admin), D second admin, B and C plain
  var pre = []; for (var n of ['A', 'B', 'C']) pre.push(await S[n].policy());
  verdict(pre.every(function (x) { return x === null; }), 'CONTROL: before any POLICY op no device has a policy', 'policies=' + pre.map(function (x) { return x ? x.epoch : 'none'; }).join('/'));

  var p1 = await S.A.setPolicy(polParams({ epoch: 1 }));
  await allSync(S, names, pipe, 3);
  var pol = {}; for (var m of ['A', 'B', 'C', 'D']) pol[m] = await S[m].policy();
  console.log('   §POLICY-FOLD epoch=' + ['A', 'B', 'C', 'D'].map(function (m) { return pol[m] && pol[m].epoch; }).join('/') + ' hash=' + ['A', 'B', 'C', 'D'].map(function (m) { return pol[m] && pol[m].hash.slice(0, 10); }).join('/') +
              ' pos=' + ['A', 'B', 'C', 'D'].map(function (m) { return pol[m] && pol[m].pos; }).join('/'));
  verdict(['A', 'B', 'C', 'D'].every(function (m) { return pol[m] && pol[m].hash === p1.hash; }), 'all four devices hold the admin\'s policy (same op hash)');
  verdict(pol.A.pos != null && ['B', 'C', 'D'].every(function (m) { return pol[m].pos === pol.A.pos; }), 'the policy sits at the same fold position on every device', 'pos=' + pol.A.pos);
  verdict(JSON.stringify(pol.A.params) === JSON.stringify(pol.C.params) && pol.C.params.visit_ms === 900000 && pol.C.params.gate.max_puts_per_hour === 120 && pol.C.params.pipes.fallback[0] === 'mem:fallback',
          'the folded values (V, gate, pipe directory) are those the admin signed', 'visit_ms=' + pol.C.params.visit_ms);

  // NONADMIN
  var bad = await S.B.setPolicy(polParams({ epoch: 9, visit_ms: 1000 }));
  await allSync(S, names, pipe, 3);
  var vb = []; for (var m2 of ['A', 'B', 'C', 'D']) vb.push(await verdictOf(S[m2], bad.hash));
  var polAfter = await S.C.policy();
  console.log('   §POLICY-NONADMIN verdicts=' + vb.map(function (v) { return v.verdict + ':' + v.reason; }).join(' | ') + ' effective epoch(C)=' + polAfter.epoch);
  verdict(vb.every(function (v) { return v.verdict === 'REFUSED' && v.reason === 'not-admin'; }) && polAfter.epoch === 1 && polAfter.params.visit_ms === 900000,
          'a non-admin POLICY is REFUSED not-admin on every device and changes nothing');
  var ok2 = await S.D.setPolicy(polParams({ epoch: 2, visit_ms: 600000 }));     // CONTROL: D is an admin; same shape of op
  await allSync(S, names, pipe, 3);
  var v2 = await verdictOf(S.B, ok2.hash), pol2 = await S.B.policy();
  verdict(v2.verdict === 'MERGED' && pol2.epoch === 2 && pol2.params.visit_ms === 600000, 'CONTROL: the same kind of op from an admin is MERGED and takes effect', 'epoch=' + pol2.epoch + ' visit_ms=' + pol2.params.visit_ms);

  // EPOCH: lower and equal refused, the effective epoch never goes down
  var lo = await S.A.setPolicy(polParams({ epoch: 1, visit_ms: 111111 })), eq = await S.A.setPolicy(polParams({ epoch: 2, visit_ms: 222222 }));
  await allSync(S, names, pipe, 3);
  var vlo = await verdictOf(S.C, lo.hash), veq = await verdictOf(S.C, eq.hash), pol3 = await S.C.policy();
  console.log('   §POLICY-EPOCH lower=' + vlo.verdict + ':' + vlo.reason + ' equal=' + veq.verdict + ':' + veq.reason + ' effective epoch=' + pol3.epoch + ' visit_ms=' + pol3.params.visit_ms);
  verdict(vlo.reason === 'epoch-stale' && veq.reason === 'epoch-exists' && pol3.epoch === 2 && pol3.params.visit_ms === 600000, 'a lower epoch is epoch-stale, an equal one epoch-exists; the effective policy stays at epoch 2');
  // a higher epoch wins
  var hi = await S.A.setPolicy(polParams({ epoch: 5, visit_ms: 300000 }));
  await allSync(S, names, pipe, 3);
  var pols = []; for (var m3 of ['A', 'B', 'C', 'D']) pols.push((await S[m3].policy()));
  verdict(pols.every(function (x) { return x.epoch === 5 && x.hash === hi.hash && x.pos === pols[0].pos; }), 'a higher epoch (5) supersedes on every device, same hash and position', 'epoch=' + pols[0].epoch);
  // a race: two admins author epoch 6 before either has seen the other
  var rA = await S.A.setPolicy(polParams({ epoch: 6, visit_ms: 120000 })), rD = await S.D.setPolicy(polParams({ epoch: 6, visit_ms: 240000 }));
  await allSync(S, names, pipe, 3);
  var rv = []; for (var m4 of ['A', 'B', 'C', 'D']) { var a1 = await verdictOf(S[m4], rA.hash), d1 = await verdictOf(S[m4], rD.hash), pp = await S[m4].policy(); rv.push({ a: a1.verdict, d: d1.verdict, win: pp.hash.slice(0, 8), epoch: pp.epoch }); }
  var winners = rv.map(function (x) { return x.win; }), merged = rv[0].a === 'MERGED' ? 1 : 0; merged += rv[0].d === 'MERGED' ? 1 : 0;
  console.log('   §POLICY-EPOCH race epoch6: ' + rv.map(function (x) { return 'A:' + x.a + ' D:' + x.d; }).join(' | ') + ' winner=' + winners.join('/'));
  if (!(rv[0].a !== rv[0].d)) inconclusive.push('POLICY-EPOCH race: both epoch-6 ops got the same verdict, so no race was resolved');
  verdict(rv.every(function (x) { return x.a === rv[0].a && x.d === rv[0].d && x.win === winners[0] && x.epoch === 6; }) && merged === 1, 'two admins racing epoch 6: exactly one is MERGED, the same one on every device', 'merged=' + merged);

  // VALUE
  var badv = await S.A.setPolicy(polParams({ epoch: 7, visit_ms: 0 })), unk = await S.A.setPolicy(polParams({ epoch: 8, audience_map: { hr: 'k2' }, future_rule: [1, 2, 3] }));
  await allSync(S, names, pipe, 3);
  var vbad = await verdictOf(S.B, badv.hash), vunk = await verdictOf(S.B, unk.hash), polU = await S.B.policy();
  console.log('   §POLICY-VALUE zero visit_ms=' + vbad.verdict + ':' + vbad.reason + ' ; unknown keys=' + vunk.verdict + ' kept=' + JSON.stringify(polU.params.audience_map));
  verdict(vbad.verdict === 'REFUSED' && vbad.reason === 'bad-policy:visit_ms', 'an invalid value is refused bad-policy:visit_ms');
  verdict(vunk.verdict === 'MERGED' && polU.epoch === 8 && polU.params.audience_map.hr === 'k2' && polU.params.future_rule.length === 3, 'CONTROL/skew: unknown keys are kept and do not make the op invalid');

  // ───────────────────────── §STAGGER ─────────────────────────
  var V = 900000, kids = []; for (var i = 0; i < 100; i++) kids.push(nodeCrypto.createHash('sha256').update('kid-' + i).digest('hex').slice(0, 16));
  function spread(offsetFn) { var bk = new Array(10).fill(0), inRange = true; kids.forEach(function (k) { var o = offsetFn(k); if (!(o >= 0 && o < V)) inRange = false; bk[Math.floor(o * 10 / V)]++; });
    var mean = kids.length / 10, mx = Math.max.apply(null, bk); return { buckets: bk, max: mx, mean: mean, inRange: inRange, ok: inRange && mx <= 2 * mean }; }
  var sg = spread(function (k) { return ROS.staggerOffset(k, V); }), sg2 = kids.map(function (k) { return ROS.staggerOffset(k, V); }), sg3 = kids.map(function (k) { return ROS.staggerOffset(k, V); });
  console.log('   §STAGGER V=' + V + ' kids=100 buckets=' + sg.buckets.join(',') + ' max=' + sg.max + ' (mean ' + sg.mean + ', limit ' + 2 * sg.mean + ') min=' + Math.min.apply(null, sg2) + ' max=' + Math.max.apply(null, sg2));
  verdict(sg.inRange, 'every offset is in [0,V)');
  verdict(JSON.stringify(sg2) === JSON.stringify(sg3), 'the offset is deterministic (same kid, same V, same offset)');
  verdict(sg.ok, 'offsets spread: no bucket holds more than 2x the mean', 'max=' + sg.max + ' limit=' + 2 * sg.mean);
  var clus = spread(function () { return 0; });
  verdict(!clus.ok && clus.max === 100, 'CONTROL: a clustered rule (everyone at offset 0) FAILS the same spread test', 'max=' + clus.max);
  var offA = await S.A.visitOffset();
  verdict(offA === ROS.staggerOffset(W.dev.A.kid, polU.params.visit_ms), 'store.visitOffset() applies the folded V to the device\'s own kid', 'offset=' + offA + ' V=' + polU.params.visit_ms);

  // ───────────────────────── §CAP ─────────────────────────
  var cpipe = PIPE.memPipe('cap'), C2 = await mkSpace(SQL, ['A', 'B'], [], cpipe);
  await C2.S.A.setPolicy(polParams({ epoch: 1, bundle_max_ops: 3 })); await allSync(C2.S, ['A', 'B'], cpipe, 2);
  for (var q = 0; q < 8; q++) await create(C2.S.B, uuid(), 'CAP-' + q, 10 + q);
  var sent = []; for (var v = 0; v < 4; v++) { var rep = await C2.S.B.sync(cpipe); sent.push(rep.sent); }
  await allSync(C2.S, ['A', 'B'], cpipe, 2);
  var placedA = (await C2.S.A.placedEnvelopes()).length, placedB = (await C2.S.B.placedEnvelopes()).length;
  console.log('   §CAP bundle_max_ops=3 ops=8 sent per visit=' + sent.join('+') + ' A placed=' + placedA + ' B placed=' + placedB);
  verdict(sent.join() === '3,3,2,0' && placedA === 8 && placedB === 8, 'bundle_max_ops=3: 8 ops leave as 3+3+2, nothing is lost, both devices place all 8');
  var npipe = PIPE.memPipe('nocap'), N2 = await mkSpace(SQL, ['A', 'B'], [], npipe);
  for (var q2 = 0; q2 < 8; q2++) await create(N2.S.B, uuid(), 'NOCAP-' + q2, 10 + q2);
  var repN = await N2.S.B.sync(npipe);
  verdict(repN.sent === 8, 'CONTROL: without a policy the same 8 ops leave in one visit (cap is the policy\'s doing)', 'sent=' + repN.sent);

  // ───────────────────────── §GATE ─────────────────────────
  var SP64 = nodeCrypto.createHash('sha256').update('gate-space').digest('hex'), KID = 'aaaaaaaaaaaaaaaa', KID2 = 'bbbbbbbbbbbbbbbb', nm = function (k, i) { return 's/' + SP64 + '/o/' + k + '/' + i + '.bimpack'; };
  var clock = 1000000, inner = PIPE.memPipe('gate-inner'), gate = PIPE.gatedPipe(inner, PIPE.gateFromPolicy({ gate: { max_object_bytes: 1000, max_puts_per_hour: 5 } }, 'T1'), { now: function () { return clock; } });
  var w1 = gate.writer('T1'), okc = await w1.put(nm(KID, 'c1'), new Uint8Array(10));
  verdict(okc === true && (await inner.get(nm(KID, 'c1'))) !== null, 'CONTROL: a write with the current token under the size and rate caps is stored');
  gate.rotate({ token: 'T2', max_object_bytes: 1000, max_puts_per_hour: 5 });
  var stale = await w1.put(nm(KID, 's1'), new Uint8Array(10)), fresh = await gate.writer('T2').put(nm(KID, 's2'), new Uint8Array(10));
  console.log('   §GATE stale-token: refused=' + (stale === false) + ' stored=' + ((await inner.get(nm(KID, 's1'))) !== null) + ' refusals=' + JSON.stringify(gate.refusals.map(function (r) { return r.reason; })) + ' ; fresh token stored=' + (fresh === true));
  verdict(stale === false && (await inner.get(nm(KID, 's1'))) === null && gate.refusals[0].reason === 'stale-token', 'a write with the old token after rotation is refused (stale-token) and nothing is stored');
  verdict(fresh === true && (await inner.get(nm(KID, 's2'))) !== null, 'CONTROL: the same write with the new token is stored');
  var wT2 = gate.writer('T2'), big = await wT2.put(nm(KID, 'big'), new Uint8Array(1001)), edge = await wT2.put(nm(KID, 'edge'), new Uint8Array(1000));
  console.log('   §GATE oversize: 1001 B refused=' + (big === false) + ' reason=' + gate.refusals[gate.refusals.length - 1].reason + ' ; 1000 B stored=' + (edge === true));
  verdict(big === false && gate.refusals[gate.refusals.length - 1].reason === 'oversize' && (await inner.get(nm(KID, 'big'))) === null, 'an object over max_object_bytes is refused (oversize)');
  verdict(edge === true && (await inner.get(nm(KID, 'edge'))) !== null, 'CONTROL: an object of exactly max_object_bytes is stored');
  // rate: KID already has c1? (token T1 put counted before the rotate: 1) + s2 (1) + edge (1) = 3 accepted this hour
  var results = []; for (var r = 0; r < 4; r++) results.push(await wT2.put(nm(KID, 'r' + r), new Uint8Array(5)));
  var rateRefusal = gate.refusals[gate.refusals.length - 1];
  console.log('   §GATE rate: puts in this hour so far=3, next four → ' + results.join(',') + ' last refusal=' + rateRefusal.reason + ' ; other device=' + (await wT2.put(nm(KID2, 'x'), new Uint8Array(5))));
  verdict(results.join() === 'true,true,false,false' && rateRefusal.reason === 'rate', 'the (cap+1)-th put within an hour is refused (rate): cap 5 → puts 4,5 stored, 6,7 refused');
  verdict((await inner.get(nm(KID2, 'x'))) !== null, 'CONTROL: another device is not affected by the first one\'s count (the cap is per device)');
  clock += 3600001; var after = await wT2.put(nm(KID, 'later'), new Uint8Array(5));
  verdict(after === true, 'CONTROL: an hour later the same device may write again (the window slides, it is not a lifetime cap)');
  var badName = await wT2.put('not/a/valid/name', new Uint8Array(5));
  verdict(badName === false && gate.refusals[gate.refusals.length - 1].reason === 'bad-name', 'a name outside s/<space>/{o,h,r}/<kid> is refused (bad-name)');

  // end-to-end: the gate takes its values from the FOLDED policy; a device on a stale token is not delivered, then is
  var gpipe = PIPE.memPipe('e2e'), G = await mkSpace(SQL, ['A', 'B'], [], gpipe);
  await G.S.A.setPolicy(polParams({ epoch: 1, gate: { max_object_bytes: 65536, max_puts_per_hour: 100 } })); await allSync(G.S, ['A', 'B'], gpipe, 2);
  var polG = await G.S.B.policy(), gg = PIPE.gatedPipe(gpipe, PIPE.gateFromPolicy(polG.params, 'E1'));
  var bOld = gg.writer('E1'); gg.rotate(PIPE.gateFromPolicy(polG.params, 'E2'));                              // the epoch rotated; B has not heard yet
  await create(G.S.B, uuid(), 'E2E-1', 5); await create(G.S.B, uuid(), 'E2E-2', 6);
  var rs = await G.S.B.sync(bOld), dl = G.S.B.delivery().filter(function (d) { return d.seq > 1; }), ob = G.S.B.query('SELECT state FROM cl_outbox');
  console.log('   §GATE e2e stale visit: sent=' + rs.sent + ' readBackFail=' + rs.readBackFail + ' outbox=' + ob.map(function (x) { return x.state; }).join(',') + ' delivery=' + dl.map(function (x) { return x.state; }).join(',') + ' gate refusals=' + gg.refusals.length);
  verdict(rs.sent === 0 && rs.readBackFail === 1 && gg.refusals.length >= 1 && gg.refusals[0].reason === 'stale-token' && dl.every(function (x) { return x.state === 'SAVED'; }), 'a visit on a stale token delivers nothing: ops stay SAVED, the visit reports PUT-UNVERIFIED');
  var bNew = gg.writer('E2'), rs2 = await G.S.B.sync(bNew); await G.S.A.sync(gg.writer('E2'));
  var plA = (await G.S.A.placedEnvelopes()).length;
  console.log('   §GATE e2e fresh visit: sent=' + rs2.sent + ' A placed=' + plA);
  verdict(rs2.sent === 2 && plA === 2, 'CONTROL: with the fresh token the next visit delivers both ops and A places them', 'sent=' + rs2.sent + ' A placed=' + plA);

  // ───────────────────────── §SKEW ─────────────────────────
  var old = loadOldEngine();
  if (!old) { inconclusive.push('SKEW: git show 34b915fb1 unavailable — old-engine arm not run'); console.log('   §SKEW INCONCLUSIVE: could not load the pre-change engine from git'); }
  else {
    try {
      var spipe = PIPE.memPipe('skew'), K = await mkSpace(SQL, ['A', 'B'], [], spipe);
      await K.S.A.setPolicy(polParams({ epoch: 1 })); await create(K.S.B, uuid(), 'SKEW-1', 1);
      var fut = await K.S.B.author({ target: { table: 'comm_future', uu: uuid() }, body: { op_type: 'FUTURE_OP', params: { x: 1 } } });
      await allSync(K.S, ['A', 'B'], spipe, 2);
      var oldDev = await old.STORE.newDevice(); oldDev.person_uu = uuid();
      // the old device is enrolled by A (it has dh keys of its own, as CL8 devices do)
      await K.S.A.addPerson({ person_uu: oldDev.person_uu, name: 'OLD', ad_role_id: 102, comm_admin: false }); await K.S.A.enroll(oldDev.kid, oldDev.pubJwk, oldDev.person_uu, oldDev.dhPubJwk);
      await K.S.A.sync(spipe);
      var O = old.STORE.open(new SQL.Database(), { SQL: SQL, space: K.space, self: oldDev, access: access, log: quiet }), crashed = null, rO = null;
      try { rO = await O.sync(spipe); await O.sync(spipe); } catch (e) { crashed = e; }
      var polOp = O.query("SELECT op_hash FROM cl_op WHERE op_type='POLICY'"), vP = polOp.length ? O.query('SELECT verdict, reason FROM cl_verdict WHERE op_hash=?', [polOp[0].op_hash])[0] : null;
      var bizOld = crashed ? -1 : (await O.placedEnvelopes()).length;
      console.log('   §SKEW old engine: crashed=' + !!crashed + (crashed ? ' ' + crashed.message : '') + ' POLICY op held=' + polOp.length + ' verdict=' + (vP ? vP.verdict + ':' + vP.reason : 'none') + ' business placed=' + bizOld);
      verdict(!crashed && polOp.length === 1 && vP && vP.verdict === 'REFUSED', 'an engine from before POLICY folds a log containing it without crashing, and refuses the unknown op', vP ? vP.reason : '');
      verdict(bizOld === 1, 'CONTROL: the old engine still places the one ordinary business op of that log (nothing else was disturbed)', 'placed=' + bizOld);
      var vF = await verdictOf(K.S.A, fut.hash);
      console.log('   §SKEW new engine, unknown op type FUTURE_OP: ' + vF.verdict + ':' + vF.reason);
      verdict(vF.verdict === 'REFUSED', 'a newer device does not crash on an op type it does not know — it refuses it', vF.reason);
    } finally { fs.rmSync(old.dir, { recursive: true, force: true }); }
  }

  console.log('\n──────────────────────────────────────────────');
  if (inconclusive.length || judged === 0) console.log('§W-POLICY-FOLD INCONCLUSIVE judged=' + judged + ' fails=' + fails + ' — ' + inconclusive.join(' | '));
  else console.log('§W-POLICY-FOLD ' + (fails ? 'FAIL' : 'PASS') + ' judged=' + judged + ' fails=' + fails + ' inconclusive=0');
  process.exit(fails || inconclusive.length ? 1 : 0);
})().catch(function (e) { console.log('🔴 CRASH ' + (e && e.stack || e)); process.exit(2); });
