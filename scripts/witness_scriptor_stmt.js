#!/usr/bin/env node
// Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
// SPDX-License-Identifier: MIT
/**
 * ⚠ DO NOT REMOVE — Scope: W-STMT, prompts/TEAMWORK_FRAMEWORK.md §38.10 (G-8: sign a statement offline, publish it from the app).
 * READ THE LOG after every run — the exit code is not evidence.
 * THE ISSUE it proves/disproves: the executor map (G-4) and a trusted-key rotation (§35) take effect only as an owner-signed statement inside a POLICY op,
 * and nothing outside the witnesses could build, check or publish one. Real modules: the CLI build/scriptor/sign_plan.js run as a CHILD PROCESS (what an
 * owner runs), the real engine build/comm/* (CommStore.publishStatement).
 *   §S1 KEYGEN  §S2 STMT+CHECK  §S3 PUBLISH executors  §S4 PUBLISH plan-trust  §S5 SECOND DEVICE  §MUTANTS
 * Run: node scripts/witness_scriptor_stmt.js > build/scriptor/stmt.log 2>&1
 *      WITNESS_SIGN=<sign_plan.js copy> WITNESS_COMM=<comm dir copy>   (mutant runs)
 */
'use strict';
if (typeof globalThis.crypto === 'undefined' || !globalThis.crypto.subtle) globalThis.crypto = require('crypto').webcrypto;
var path = require('path'), fs = require('fs'), os = require('os'), cp = require('child_process'), nodeCrypto = require('crypto'), initSqlJs = require('sql.js');
var ROOT = path.join(__dirname, '..');
var SIGNJS = process.env.WITNESS_SIGN || path.join(ROOT, 'build', 'scriptor', 'sign_plan.js');
var COMM = process.env.WITNESS_COMM || path.join(ROOT, 'build', 'comm');
var IS_MUTANT = !!(process.env.WITNESS_SIGN || process.env.WITNESS_COMM);
var red = [], judged = 0;
function A(n, ok, l, d) { judged++; if (!ok) red.push(n); if (!IS_MUTANT) console.log('   ' + (ok ? '🟢' : '🔴') + ' ' + n + ' ' + l + (d ? ' — ' + d : '')); return ok; }
var H = IS_MUTANT ? function () {} : console.log;
var uuid = function () { return nodeCrypto.randomUUID(); }, HQ = 102, STATION = 103;
function cli(args) { var r = cp.spawnSync(process.execPath, [SIGNJS].concat(args), { encoding: 'utf8' }); return { code: r.status, out: (r.stdout || '') + (r.stderr || '') }; }
function wj(f, o) { fs.writeFileSync(f, JSON.stringify(o)); return f; }
function rj(f) { return JSON.parse(fs.readFileSync(f, 'utf8')); }
var pubOf = function (j) { return { kty: j.kty, crv: j.crv, x: j.x, y: j.y }; };

(async function () {
  ['CommEnvelope', 'CommOrder', 'CommRoster', 'CommAdmit', 'CommStore', 'CommPipe'].forEach(function (n) { delete globalThis[n]; });
  var STORE = require(path.join(COMM, 'comm_store.js')), ROS = require(path.join(COMM, 'comm_roster.js')), PIPE = require(path.join(COMM, 'comm_pipe.js')), SQL = await initSqlJs();
  var T = fs.mkdtempSync(path.join(os.tmpdir(), 'w-stmt-'));                // OUTSIDE the repo: where an owner keeps the private key

  H('§S1 KEYGEN');
  var k1 = cli(['keygen', path.join(T, 'k1')]), k2 = cli(['keygen', path.join(T, 'k2')]);
  var P1 = path.join(T, 'k1', 'plan_signing_private.jwk'), U1 = path.join(T, 'k1', 'plan_signing_public.jwk'), P2 = path.join(T, 'k2', 'plan_signing_private.jwk'), U2 = path.join(T, 'k2', 'plan_signing_public.jwk');
  A('S1', k1.code === 0 && fs.existsSync(P1) && fs.existsSync(U2), 'keygen into a directory outside the repo writes the pair', k1.out.trim().split('\n')[0]);
  var inRepo = path.join(ROOT, 'build', 'scriptor', 'tmp_keys_' + process.pid), kr = cli(['keygen', inRepo]);
  var wrote = fs.existsSync(path.join(inRepo, 'plan_signing_private.jwk'));
  A('S1', kr.code !== 0 && !wrote, 'keygen into a directory INSIDE the repo is refused and writes nothing (the private key never enters the repo)', 'exit=' + kr.code + ' wrote=' + wrote + ' ' + kr.out.trim().split('\n')[0]);
  try { fs.rmSync(inRepo, { recursive: true, force: true }); } catch (e) {}
  var K1 = pubOf(rj(U1)), K2 = pubOf(rj(U2));

  H('§S2 STMT + CHECK');
  var M1 = wj(path.join(T, 'map1.json'), { c_order: HQ }), O1 = path.join(T, 'exe1.json');
  var s1 = cli(['stmt', 'executors', M1, 'none', P1, U1, O1]), st1 = fs.existsSync(O1) ? rj(O1) : null;
  var c1 = cli(['check', O1, U1]);
  A('S2', s1.code === 0 && st1 && st1.kind === 'executors' && st1.prev === await ROS.executorsHash({}) && c1.code === 0 && /§STMT_CHECK ok/.test(c1.out), 'stmt executors {c_order:102} prev none → a statement over the empty map; check ok', (s1.out + ' | ' + c1.out).replace(/\s+/g, ' ').slice(0, 200));
  var ed = st1 ? JSON.parse(JSON.stringify(st1)) : {}; ed.map = { c_order: STATION }; var E1 = wj(path.join(T, 'edited.json'), ed), ce = cli(['check', E1, U1]);
  A('S2', ce.code !== 0 && /REFUSED bad-signature/.test(ce.out), 'the same statement edited after signing → check REFUSED bad-signature', ce.out.trim());
  var cu = cli(['check', O1, U2]);
  A('S2', cu.code !== 0 && /REFUSED untrusted-signer/.test(cu.out), 'checked against a different trusted key → REFUSED untrusted-signer', cu.out.trim());
  var MB = wj(path.join(T, 'bad.json'), { 'C Order': 1 }), OB = path.join(T, 'exe_bad.json'), sb = cli(['stmt', 'executors', MB, 'none', P1, U1, OB]);
  A('S2', sb.code !== 0 && !fs.existsSync(OB), 'a map the engine would refuse ({"C Order":1}) → the tool refuses to write it (self-check)', sb.out.trim().split('\n')[0]);

  H('§S3 PUBLISH executors');
  var access = function () { return { allowed: true }; }, dev = {}, per = {}, S = {}, names = ['F', 'B'];
  for (var n of names) { dev[n] = await STORE.newDevice(); dev[n].person_uu = uuid(); per[n] = dev[n].person_uu; }
  var sp = await STORE.newSpace('x', dev.F, per.F, 'F', HQ, { planTrust: [K1] });
  names.forEach(function (n) { S[n] = STORE.open(new SQL.Database(), { SQL: SQL, space: sp.space, self: dev[n], access: access, log: function () {} }); });
  await S.F.genesis(sp.params); await S.F.addPerson({ person_uu: per.B, name: 'B', ad_role_id: STATION, comm_admin: false }); await S.F.enroll(dev.B.kid, dev.B.pubJwk, per.B, dev.B.dhPubJwk);
  var pipe = PIPE.memPipe('x-' + uuid()), sync = async function () { for (var r = 0; r < 3; r++) for (var q of names) await S[q].sync(pipe); };
  await sync();
  var hasPub = typeof S.F.publishStatement === 'function';
  if (!A('S3', hasPub, 'the store exposes publishStatement', hasPub ? '' : 'ABSENT')) { finish(); return; }
  await S.F.setPolicy({ epoch: 1, visit_ms: 900000 });                     // an existing policy param that must be carried forward
  var r1 = st1 ? await S.F.publishStatement(st1) : { ok: false, reason: 'no statement' }, ex1 = (await S.F.order()).roster.executors, pol1 = await S.F.policy();
  A('S3', r1.ok === true && /^MERGED/.test(r1.verdict) && JSON.stringify(ex1) === JSON.stringify({ c_order: HQ }) && pol1.params.visit_ms === 900000, 'the CLI statement published by the admin → MERGED locally, map in force, the other policy params carried forward', JSON.stringify(r1) + ' map=' + JSON.stringify(ex1) + ' visit_ms=' + (pol1 && pol1.params.visit_ms));
  var M2 = wj(path.join(T, 'map2.json'), { c_order: HQ, m_movement: HQ }), O2 = path.join(T, 'exe2.json'); cli(['stmt', 'executors', M2, M1, P1, U1, O2]);
  var r2 = fs.existsSync(O2) ? await S.F.publishStatement(rj(O2)) : { ok: false, reason: 'no file' }, ex2 = (await S.F.order()).roster.executors;
  A('S3', r2.ok === true && ex2 && ex2.m_movement === HQ && ex2.c_order === HQ, 'a second statement with prev = the first map → MERGED, map extended', JSON.stringify(r2) + ' map=' + JSON.stringify(ex2));
  var O3 = path.join(T, 'exe3.json'); cli(['stmt', 'executors', M1, 'none', P1, U1, O3]);
  var r3 = fs.existsSync(O3) ? await S.F.publishStatement(rj(O3)) : { ok: false, reason: 'no file' }, ex3 = (await S.F.order()).roster.executors;
  A('S3', r3.ok === false && r3.reason === 'executors-stale' && JSON.stringify(ex3) === JSON.stringify(ex2), 'one built with prev none AFTER that → {ok:false, executors-stale} on the publishing device itself; map unchanged', JSON.stringify(r3));
  await sync();
  var O4 = path.join(T, 'exe4.json'); cli(['stmt', 'executors', wj(path.join(T, 'map4.json'), { c_order: STATION }), M2, P1, U1, O4]);
  var r4 = fs.existsSync(O4) ? await S.B.publishStatement(rj(O4)) : { ok: false, reason: 'no file' };
  A('S3', r4.ok === false && r4.reason === 'not-admin', 'a valid owner-signed statement published by a NON-admin device → not-admin', JSON.stringify(r4));
  var n0 = (await S.F.order()).verdict, c0 = Object.keys(n0).length, r5 = await S.F.publishStatement({ kind: 'x' }), c5 = Object.keys((await S.F.order()).verdict).length;
  A('S3', r5.ok === false && r5.reason === 'unknown-kind' && c5 === c0, 'an unknown kind → unknown-kind, nothing authored', JSON.stringify(r5) + ' ops ' + c0 + '→' + c5);
  var r6 = await S.F.publishStatement({ kind: 'executors', map: { c_order: HQ } }), c6 = Object.keys((await S.F.order()).verdict).length;
  A('S3', r6.ok === false && /^bad-statement:/.test(r6.reason) && c6 === c0, 'an unsigned / malformed statement → bad-statement, nothing authored', JSON.stringify(r6));

  H('§S4 PUBLISH plan-trust');
  var KJ = wj(path.join(T, 'keys.json'), [K1, K2]), KP = wj(path.join(T, 'prevkeys.json'), [K1]), O5 = path.join(T, 'pt.json'), s5 = cli(['stmt', 'plan-trust', KJ, KP, P1, U1, O5]);
  var r7 = fs.existsSync(O5) ? await S.F.publishStatement(rj(O5)) : { ok: false, reason: 'no file: ' + s5.out.trim() }, pt = await S.F.planTrust(), ex7 = (await S.F.order()).roster.executors;
  A('S4', r7.ok === true && pt && pt.length === 2 && JSON.stringify(ex7) === JSON.stringify(ex2), 'stmt plan-trust [K1,K2] prev [K1] → MERGED, the trust list in force has 2 keys, the executor map is carried forward', JSON.stringify(r7) + ' keys=' + (pt && pt.length) + ' map=' + JSON.stringify(ex7));

  H('§S5 SECOND DEVICE');
  await sync();
  var RB = (await S.B.order()).roster, ptB = await S.B.planTrust();
  A('S5', JSON.stringify(RB.executors) === JSON.stringify(ex2) && ptB && ptB.length === 2, 'B, after syncing, holds the same map and the same trust list', 'map=' + JSON.stringify(RB.executors) + ' keys=' + (ptB && ptB.length));
  finish();

  function finish() {
    try { fs.rmSync(T, { recursive: true, force: true }); } catch (e) {}
    console.log('§STMT_ARMS red=' + (red.length ? Array.from(new Set(red)).join(',') : 'none') + ' judged=' + judged);
    if (IS_MUTANT) process.exit(red.length ? 1 : 0);
    if (red.length) { console.log('§STMT_VERDICT FAIL judged=' + judged + ' fails=' + red.length + ' mutants=NOT RUN (the base run is red)'); process.exit(1); }
    var signSrc = fs.readFileSync(SIGNJS, 'utf8'), storeSrc = fs.readFileSync(path.join(COMM, 'comm_store.js'), 'utf8');
    var M = [
      ['check skips the signature', 'sign', /\/\*STMT:VERIFY\*\/[^\n]*/, "var vOk = true; /*STMT:VERIFY*/", 'S2'],
      ['the tool writes without its self-check', 'sign', /\/\*STMT:SELFCHECK\*\/[^\n]*/, '/*STMT:SELFCHECK*/', 'S2'],
      ['publishStatement drops the other params', 'store', 'var base = pol ? JSON.parse(JSON.stringify(pol.params)) : {};', 'var base = {};', 'S3'],
      ['publishStatement says ok without the fold verdict', 'store', "return { ok: !!v && v.verdict === 'MERGED',", "return { ok: true,", 'S3']];
    var killed = 0;
    M.forEach(function (m) {
      var src = m[1] === 'sign' ? signSrc : storeSrc, s2 = src.replace(m[2], m[3]);
      if (s2 === src) { console.log('   🔴 mutant ' + m[0] + ': MUTATION DID NOT APPLY'); return; }
      var env = Object.assign({}, process.env);
      if (m[1] === 'sign') { var f = path.join(path.dirname(SIGNJS), '.mut_sign_' + process.pid + '.js'); fs.writeFileSync(f, s2); env.WITNESS_SIGN = f; }
      else { var d = fs.mkdtempSync(path.join(os.tmpdir(), 'mut-comm-')); fs.readdirSync(COMM).filter(function (x) { return /\.js$/.test(x); }).forEach(function (x) { fs.copyFileSync(path.join(COMM, x), path.join(d, x)); }); fs.writeFileSync(path.join(d, 'comm_store.js'), s2); env.WITNESS_COMM = d; }
      var r = cp.spawnSync(process.execPath, [__filename], { env: env, encoding: 'utf8', maxBuffer: 1 << 26 });
      if (m[1] === 'sign') fs.unlinkSync(env.WITNESS_SIGN); else fs.rmSync(env.WITNESS_COMM, { recursive: true, force: true });
      var mm = /§STMT_ARMS red=(\S+)/.exec(r.stdout || ''), reds = mm && mm[1] !== 'none' ? mm[1].split(',') : [], hit = !!mm && reds.indexOf(m[4]) >= 0;
      if (hit) killed++;
      console.log('   ' + (hit ? '🟢' : '🔴') + ' mutant ' + m[0] + ' -> ' + (mm ? 'red=' + (reds.join(',') || 'none') : 'CRASHED (not a kill) ' + String(r.stderr).split('\n')[0]) + ' (expected ' + m[4] + ')');
    });
    console.log('§STMT_VERDICT ' + (killed === M.length ? 'PASS' : 'FAIL') + ' judged=' + judged + ' fails=0 mutants=' + killed + '/' + M.length);
    process.exit(killed === M.length ? 0 : 1);
  }
})().catch(function (e) { console.log('§STMT_CRASH ' + (e && e.stack || e)); process.exit(2); });
