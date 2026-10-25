#!/usr/bin/env node
// Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
// SPDX-License-Identifier: MIT
/**
 * ⚠ DO NOT REMOVE — Scope: W-PLANTRUST-GENESIS, prompts/TEAMWORK_FRAMEWORK.md §33 (Phase B of §32) + §35 (add / rotate the list by a signed POLICY op). READ THE LOG after every run — the exit code is not evidence.
 * Real modules: build/comm/* (CommStore, CommRoster, CommEnvelope). The plan reader is the REAL bim-ootb common/comm/team_scope.js; plans are signed by the REAL compiler signer.
 *   §T1 ID  §T2 REJECT  §T3 FOLD  §T4 FORGED  §T5 PLAN  §T6 ROTATE  §T7 REFUSE  §T8 CARRY  §T9 ORDER  §MUTANTS (COMM copies with one rule broken; each must turn >= 1 arm red)
 * Run: node scripts/witness_comm_plantrust.js 2>&1 | tee build/comm/logs/witness_comm_plantrust.log
 */
'use strict';
if (typeof globalThis.crypto === 'undefined' || !globalThis.crypto.subtle) globalThis.crypto = require('crypto').webcrypto;
var path = require('path'), fs = require('fs'), os = require('os'), vm = require('vm'), nodeCrypto = require('crypto'), initSqlJs = require('sql.js');
var SIGN = require(path.join(__dirname, '..', 'build', 'scriptor', 'sign_plan.js'));
var judged = 0, fails = 0;
function say(ok, label, detail) { judged++; if (!ok) fails++; console.log('   ' + (ok ? '🟢' : '🔴') + ' ' + label + (detail ? ' — ' + detail : '')); return ok; }
function clone(o) { return JSON.parse(JSON.stringify(o)); }
function loadComm(dir) {                                  // the modules find each other through globalThis first (_dep), so clear them: each copy must load ITS OWN dependencies
  ['CommEnvelope', 'CommOrder', 'CommRoster', 'CommAdmit', 'CommStore', 'CommPipe'].forEach(function (n) { delete globalThis[n]; });
  return { ENV: require(path.join(dir, 'comm_envelope.js')), ROS: require(path.join(dir, 'comm_roster.js')), STORE: require(path.join(dir, 'comm_store.js')), PIPE: require(path.join(dir, 'comm_pipe.js')) };
}
var REAL = path.join(__dirname, '..', 'build', 'comm'), READER = require('./lib_ootb.js').ootbDir(process.env.OOTB_DIR, ['common/comm/team_scope.js']);
var uuid = function () { return nodeCrypto.randomUUID(); };

async function arms(C, quiet) {
  var red = [], A = function (n, ok, l, d) { if (!ok) red.push(n); if (!quiet) say(ok, l, d); return ok; }, H = quiet ? function () {} : console.log;
  var SQL = await initSqlJs(), STORE = C.STORE, ROS = C.ROS, ENV = C.ENV;
  var K = []; for (var i = 0; i < 4; i++) { var k = await SIGN.keygen(); K.push({ pub: { kty: k.publicJwk.kty, crv: k.publicJwk.crv, x: k.publicJwk.x, y: k.publicJwk.y }, full: k }); }
  var F = await STORE.newDevice(), J = await STORE.newDevice(), PF = uuid(), PJ = uuid();
  function open(space, dev, person) { dev.person_uu = person; return STORE.open(new SQL.Database(), { SQL: SQL, space: space, self: dev, access: function () { return { allowed: true }; }, log: function () {} }); }
  async function mk(opts) { var sp = await STORE.newSpace('t', F, PF, 'Founder', 102, opts), S = open(sp.space, F, PF); await S.genesis(sp.params); return { sp: sp, S: S }; }
  H('§T1 ID');
  var t1 = await mk({ planTrust: [K[0].pub, K[1].pub] }), t0 = await mk(undefined);
  A('T1', JSON.stringify(t1.sp.params.planTrust) === JSON.stringify([K[0].pub, K[1].pub]) && t0.sp.params.planTrust === undefined, 'params.planTrust is the normalised list (kty/crv/x/y only); a space without the option has none', JSON.stringify(Object.keys((t1.sp.params.planTrust || [{}])[0])));
  var pa = clone(t1.sp.params), pb = clone(t1.sp.params); pb.planTrust = [K[0].pub, K[2].pub]; var pc = clone(t1.sp.params); delete pc.planTrust;
  var ia = await ROS.spaceOf(pa), ib = await ROS.spaceOf(pb), ic = await ROS.spaceOf(pc), ia2 = await ROS.spaceOf(clone(pa));
  A('T1', ia === t1.sp.space && ia === ia2 && ia !== ib && ia !== ic && STORE.newSpace && (await ROS.spaceOf(t1.sp.params)) === t1.sp.space, 'the space id PINS the list: same params => same id; another key or none => a different id', ia.slice(0, 10) + ' / ' + ib.slice(0, 10) + ' / ' + ic.slice(0, 10));
  H('§T2 REJECT');
  var bad = [['empty list', []], ['4 keys', [K[0].pub, K[1].pub, K[2].pub, K[3].pub]], ['not an array', K[0].pub], ['a duplicate', [K[0].pub, K[0].pub]],
    ['missing x', [{ kty: 'EC', crv: 'P-256', y: K[0].pub.y }]], ['P-384', [Object.assign({}, K[0].pub, { crv: 'P-384' })]], ['RSA', [{ kty: 'RSA', n: 'x', e: 'AQAB' }]],
    ['PRIVATE material (d)', [Object.assign({}, K[0].pub, { d: K[0].full.privateJwk.d })]], ['an extra kid field', [Object.assign({}, K[0].pub, { kid: 'k1' })]]];
  for (var b of bad) { var msg = null; try { await STORE.newSpace('t', F, PF, 'Founder', 102, { planTrust: b[1] }); } catch (e) { msg = e.message; } A('T2', !!msg && /invalid planTrust/.test(msg), 'newSpace refuses ' + b[0], msg || 'ACCEPTED'); }
  H('§T3 FOLD');
  var jS = open(t1.sp.space, J, PJ), before = await jS.planTrust();
  var S1 = await t1.S.planTrust(), S0 = await t0.S.planTrust();
  A('T3', before === null, 'null before the genesis has been seen (a joiner with only the invite)', String(before));
  A('T3', JSON.stringify(S1) === JSON.stringify([K[0].pub, K[1].pub]) && S0 === null, 'the founder\'s store returns the pinned list; a space without one returns null', JSON.stringify(S1 && S1.length));
  var envs = t1.S.query("SELECT envelope FROM cl_op WHERE state='OWN'").map(function (r) { return JSON.parse(r.envelope); }); for (var ge of envs) await jS.ingest(ge, 'x');   // the joiner only receives the founder's genesis op
  A('T3', JSON.stringify(await jS.planTrust()) === JSON.stringify([K[0].pub, K[1].pub]), 'a joiner that has the invite + the genesis returns the same list');
  H('§T4 FORGED');
  var fp = clone(t1.sp.params); fp.planTrust = [Object.assign({}, K[0].pub, { d: 'leaked' })]; var fsp = await ROS.spaceOf(fp), fS = open(fsp, F, PF); try { await fS.genesis(fp); } catch (e) { /* the store may refuse outright */ }
  var fo = null; try { fo = await fS.order(); } catch (e) { fo = null; }
  A('T4', !fo || !fo.roster.ok, 'a self-consistent genesis with an INVALID planTrust is refused (roster not ok), never accepted with the list dropped', fo ? 'roster.ok=' + fo.roster.ok + ' reason=' + fo.roster.reason : 'store refused');
  A('T4', (await fS.planTrust()) === null, 'and the forged space exposes no trust list');
  H('§T5 PLAN');
  var g = {}; vm.runInNewContext(fs.readFileSync(path.join(READER, 'common/comm/team_scope.js'), 'utf8'), { window: g, globalThis: g, TextEncoder: TextEncoder });
  function reader(plan, trust) { var gg = { TEAM_PLAN: plan, TEAM_PLAN_TRUST: trust }; vm.runInNewContext(fs.readFileSync(path.join(READER, 'common/comm/team_scope.js'), 'utf8'), { window: gg, globalThis: gg, TextEncoder: TextEncoder }); return gg.TeamScope; }
  var plan = { v: 1, hash: 'h'.repeat(64), flows: [{ name: 'M1', table: 'bim_element', dir: 'BOTH', audience: 'space', payload: [{ col: 'geom_op', cls: 'CODE', values: ['GEOM_A'] }] }] };
  var pinned = await t1.S.planTrust(), s1 = await SIGN.sign(plan, K[0].full.privateJwk, K[0].full.publicJwk), s3 = await SIGN.sign(plan, K[2].full.privateJwk, K[2].full.publicJwk), sub = nodeCrypto.webcrypto.subtle;
  A('T5', (await reader(s1, pinned).verify(sub)) === 'ok' && (await reader(await SIGN.sign(plan, K[1].full.privateJwk, K[1].full.publicJwk), pinned).verify(sub)) === 'ok', 'a plan signed by either pinned key (primary or backup) verifies ok under the list read from the genesis');
  A('T5', (await reader(s3, pinned).verify(sub)) === 'untrusted', 'a plan signed by a key that is NOT pinned in the genesis is untrusted', 'untrusted');

  // ───────── §35: add / rotate the list by a POLICY op carrying an owner-signed statement ─────────
  var PIPE = C.PIPE, pubs = function (ks) { return ks.map(function (k) { return k.pub; }); }, eq = function (a, b) { return JSON.stringify(a) === JSON.stringify(b); };
  var hashOf = function (list) { return nodeCrypto.createHash('sha256').update(ENV.canonical(list)).digest('hex'); };   // computed HERE, not by the engine: the witness's own reading of §35 rule "prev"
  async function stmt(keys, prevList, by) { return SIGN.sign({ kind: 'plan-trust', keys: pubs(keys), prev: hashOf(pubs(prevList)) }, by.full.privateJwk, by.full.publicJwk); }
  var pol = function (ep, over) { return Object.assign({ epoch: ep, visit_ms: 900000 }, over || {}); };
  async function vd(s, h) { var L = await s.order(), v = L.verdict[h]; return v ? v.verdict + ':' + v.reason : 'none'; }
  async function team(opts) {                                 // founder F (admin) + B (enrolled, NOT admin), one in-memory pipe
    var sp = await STORE.newSpace('r', F, PF, 'Founder', 102, opts), T = { F: open(sp.space, F, PF), sp: sp }; await T.F.genesis(sp.params);
    var B = await STORE.newDevice(), PB = uuid(); await T.F.addPerson({ person_uu: PB, name: 'B', ad_role_id: 102, comm_admin: false }); await T.F.enroll(B.kid, B.pubJwk, PB, B.dhPubJwk);
    T.B = open(sp.space, B, PB); var pipe = PIPE.memPipe('r-' + uuid());
    T.sync = async function () { for (var r = 0; r < 3; r++) { await T.F.sync(pipe); await T.B.sync(pipe); } };
    await T.sync(); return T;
  }
  async function both(T, h) { await T.sync(); return [await vd(T.F, h), await vd(T.B, h)]; }
  H('§T6 ROTATE');
  var R = await team({ planTrust: pubs([K[0], K[1]]) });
  var st1 = await stmt([K[0], K[1], K[2]], [K[0], K[1]], K[0]), p1 = await R.F.setPolicy(pol(1, { planTrust: st1 })), v1 = await both(R, p1.hash);
  var lF = await R.F.planTrust(), lB = await R.B.planTrust(), ep1 = (await R.F.order()).roster.planTrustEpoch;
  A('T6', v1.every(function (x) { return x.indexOf('MERGED') === 0; }) && eq(lF, pubs([K[0], K[1], K[2]])) && eq(lB, lF) && ep1 === 1, 'the PRIMARY signs [K0,K1,K2]: POLICY MERGED on both devices, the founder AND the joiner return the 3-key list, planTrustEpoch=1', v1.join(' ') + ' list=' + (lF && lF.length) + '/' + (lB && lB.length) + ' epoch=' + ep1);
  var st2 = await stmt([K[1], K[3]], [K[0], K[1], K[2]], K[1]), p2 = await R.F.setPolicy(pol(2, { planTrust: st2 })), v2 = await both(R, p2.hash), l2 = await R.B.planTrust();
  A('T6', v2.every(function (x) { return x.indexOf('MERGED') === 0; }) && eq(l2, pubs([K[1], K[3]])), 'the BACKUP signs [K1,K3] (primary dropped, lost-key recovery): MERGED, list in force = [K1,K3]', v2.join(' ') + ' list=' + (l2 && l2.length));
  var pK0 = await reader(s1, l2).verify(sub), pK3 = await reader(await SIGN.sign(plan, K[3].full.privateJwk, K[3].full.publicJwk), l2).verify(sub);
  A('T6', pK0 === 'untrusted' && pK3 === 'ok', 'with the REAL reader under the rotated list: a plan signed by the dropped K0 is untrusted, one signed by the added K3 is ok', 'K0=' + pK0 + ' K3=' + pK3);
  H('§T7 REFUSE');
  var cur = [K[1], K[3]], good = await stmt([K[1], K[3], K[2]], cur, K[1]);
  var edited = clone(await stmt([K[1], K[3], K[0]], cur, K[1])); edited.keys = pubs([K[1], K[3], K[2]]);
  var priv = clone(good); priv.keys = [Object.assign({}, K[1].pub, { d: K[1].full.privateJwk.d }), K[3].pub];
  var cases = [['a signer outside the list in force (K2)', R.F, pol(3, { planTrust: await stmt([K[1], K[3], K[2]], cur, K[2]) }), 'REFUSED:plan-trust-untrusted-signer'],
    ['the keys edited after signing', R.F, pol(3, { planTrust: edited }), 'REFUSED:plan-trust-signature'],
    ['the FIRST statement replayed after the second', R.F, pol(3, { planTrust: st1 }), 'REFUSED:plan-trust-stale'],
    ['keys carrying private d', R.F, pol(3, { planTrust: priv }), 'REFUSED:bad-policy:planTrust'],
    ['a valid owner-signed statement published by the NON-admin device B', R.B, pol(3, { planTrust: good }), 'REFUSED:not-admin'],
    ['a valid statement inside an epoch-stale POLICY', R.F, pol(1, { planTrust: good }), 'REFUSED:epoch-stale']];
  for (var c7 of cases) { var pc7 = await c7[1].setPolicy(c7[2]), v7 = await both(R, pc7.hash), l7 = await R.B.planTrust(), l7f = await R.F.planTrust();
    A('T7', v7.every(function (x) { return x === c7[3]; }) && eq(l7, pubs(cur)) && eq(l7f, pubs(cur)), c7[0] + ' -> ' + c7[3] + ' on both devices; the list stays [K1,K3]', v7.join(' ') + ' list=' + (l7 && l7.length)); }
  var U = await team(undefined), pu = await U.F.setPolicy(pol(1, { planTrust: await stmt([K[0]], [K[0]], K[0]) })), vu = await both(U, pu.hash);
  A('T7', vu.every(function (x) { return x === 'REFUSED:plan-trust-unpinned'; }) && (await U.B.planTrust()) === null, 'a space founded with NO list cannot gain one by POLICY (an admin device would pin its own key) -> plan-trust-unpinned', vu.join(' '));
  H('§T8 CARRY');
  var p3 = await R.F.setPolicy(pol(3, { planTrust: good })), v3 = await both(R, p3.hash), l3 = await R.B.planTrust();
  A('T8', v3.every(function (x) { return x.indexOf('MERGED') === 0; }) && eq(l3, pubs([K[1], K[3], K[2]])), 'CONTROL after the refusals: the same valid statement in a fresh epoch is MERGED -> [K1,K3,K2]', v3.join(' '));
  var p4 = await R.F.setPolicy(pol(4, { planTrust: good })), v4 = await both(R, p4.hash), l4 = await R.B.planTrust(), ep4 = (await R.B.order()).roster.planTrustEpoch;
  A('T8', v4.every(function (x) { return x.indexOf('MERGED') === 0; }) && eq(l4, l3) && ep4 === 3, 'a POLICY repeating the applied statement (params copied forward) is MERGED; list unchanged, planTrustEpoch stays 3', v4.join(' ') + ' epoch=' + ep4);
  var p5 = await R.F.setPolicy(pol(5)), v5 = await both(R, p5.hash), l5 = await R.B.planTrust();
  A('T8', v5.every(function (x) { return x.indexOf('MERGED') === 0; }) && eq(l5, l3), 'a POLICY that OMITS planTrust is MERGED and the list is kept (omitting is not dropping)', v5.join(' ') + ' list=' + (l5 && l5.length));
  H('§T9 ORDER');
  var allEnv = R.F.query('SELECT envelope FROM cl_op').map(function (r) { return JSON.parse(r.envelope); }).reverse();
  var Cd = await STORE.newDevice(), CS = open(R.sp.space, Cd, uuid()); for (var ce of allEnv) await CS.ingest(ce, 'x');
  var lC = await CS.planTrust();
  A('T9', allEnv.length > 10 && eq(lC, l5), 'a third device ingesting the same ' + allEnv.length + ' ops in REVERSE arrival order returns the same list', 'C=' + (lC && lC.length) + ' F=' + (l5 && l5.length));
  return red;
}
(async function () {
  console.log('═══ W-PLANTRUST-GENESIS — the plan trust list pinned in the space genesis (TEAMWORK_FRAMEWORK §33) ═══\n');
  var red0 = await arms(loadComm(REAL), false);
  console.log('§MUTANTS (a copy of build/comm with one rule broken; each must turn at least one arm red)');
  function copyWith(label, edits) {
    var d = fs.mkdtempSync(path.join(os.tmpdir(), 'comm_mut_')); fs.readdirSync(REAL).filter(function (f) { return /\.js$/.test(f); }).forEach(function (f) { fs.copyFileSync(path.join(REAL, f), path.join(d, f)); });
    var applied = edits.every(function (e) { var p = path.join(d, e[0]), s = fs.readFileSync(p, 'utf8'), t = s.replace(e[1], e[2]); if (t === s) return false; fs.writeFileSync(p, t); return true; });
    return arms(loadComm(d), true).catch(function (e) { return ['THROW ' + String(e.message).slice(0, 40)]; }).then(function (red) { fs.rmSync(d, { recursive: true, force: true }); say(applied && red.length > 0, label + ' -> red arms: ' + (red.length ? Array.from(new Set(red)).join(', ') : 'NONE (survivor = hole)') + (applied ? '' : ' (MUTATION DID NOT APPLY)')); }); }
  await copyWith('planTrust left out of the space id', [['comm_store.js', "return { params: params, space: await ROS.spaceOf(params) };", "var _p = JSON.parse(JSON.stringify(params)); delete _p.planTrust; return { params: params, space: await ROS.spaceOf(_p) };"]]);
  await copyWith('private material accepted', [['comm_roster.js', /if \(Object\.keys\(k\)\.some\([^\n]*\n/, '\n']]);
  await copyWith('an invalid list is silently dropped at fold (genesis still trusted)', [['comm_roster.js', "&& (p.planTrust === undefined || !planTrustProblem(p.planTrust))", ""]]);
  await copyWith('planTrust not returned by the fold', [['comm_roster.js', "planTrust: w.trust, planTrustEpoch: w.trustEpoch,", ""]]);
  // §35 rotation rules, each broken on its own
  await copyWith('§35 signer membership not checked', [['comm_roster.js', "if (!trust.some(function (k) { return sameKey(k, p.planTrust.signer); })) return no('plan-trust-untrusted-signer');", ""]]);
  await copyWith('§35 statement signature not checked', [['comm_roster.js', "if (!ptSig[h]) return no('plan-trust-signature');", ""]]);
  await copyWith('§35 prev not checked (replay)', [['comm_roster.js', "if (p.planTrust.prev !== ptHash[ENV.canonical(trust)]) return no('plan-trust-stale');", ""]]);
  await copyWith('§35 unpinned space may gain a list', [['comm_roster.js', "if (!trust) return no('plan-trust-unpinned');", "if (!trust) trust = [];"]]);
  await copyWith('§35 statement shape not validated', [['comm_roster.js', "if (p.planTrust !== undefined && planTrustStmtProblem(p.planTrust)) return 'planTrust';", ""]]);
  await copyWith('§35 rotation never applied (genesis list returned)', [['comm_roster.js', "if (rot) { trust = rot;", "if (false) { trust = rot;"]]);
  await copyWith('§35 omitting planTrust drops the list', [['comm_roster.js', "          var rot = null;\n", "          var rot = null; if (p.planTrust === undefined) trust = null;\n"]]);
  await copyWith('§35 rotation applied before the POLICY\'s other checks', [['comm_roster.js', "var pb = policyProblem(p); if (pb) return no('bad-policy:' + pb);", "if (p.planTrust !== undefined && ptSig[h] && !planTrustStmtProblem(p.planTrust)) trust = planTrustOf(p.planTrust.keys); var pb = policyProblem(p); if (pb) return no('bad-policy:' + pb);"]]);
  await copyWith('the key-count limit removed', [['comm_roster.js', "t.length > 3", "t.length > 99"]]);
  console.log('§PLANTRUST_VERDICT ' + (fails || red0.length ? 'FAIL' : 'PASS') + ' judged=' + judged + ' fails=' + fails);
  process.exit(fails ? 1 : 0);
})();
