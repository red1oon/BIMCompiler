#!/usr/bin/env node
// Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
// SPDX-License-Identifier: MIT
/**
 * ⚠ DO NOT REMOVE — Scope: W-PLANTRUST-GENESIS, prompts/TEAMWORK_FRAMEWORK.md §33 (Phase B of §32). READ THE LOG after every run — the exit code is not evidence.
 * Real modules: build/comm/* (CommStore, CommRoster, CommEnvelope). The plan reader is the REAL bim-ootb common/comm/team_scope.js; plans are signed by the REAL compiler signer.
 *   §T1 ID  §T2 REJECT  §T3 FOLD  §T4 FORGED  §T5 PLAN  §MUTANTS (COMM copies with one rule broken; each must turn >= 1 arm red)
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
  return { ENV: require(path.join(dir, 'comm_envelope.js')), ROS: require(path.join(dir, 'comm_roster.js')), STORE: require(path.join(dir, 'comm_store.js')) };
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
  await copyWith('planTrust not returned by the fold', [['comm_roster.js', "planTrust: planTrustOf(gen.env.body.params.planTrust),", ""]]);
  await copyWith('the key-count limit removed', [['comm_roster.js', "t.length > 3", "t.length > 99"]]);
  console.log('§PLANTRUST_VERDICT ' + (fails || red0.length ? 'FAIL' : 'PASS') + ' judged=' + judged + ' fails=' + fails);
  process.exit(fails ? 1 : 0);
})();
