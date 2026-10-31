#!/usr/bin/env node
// Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
// SPDX-License-Identifier: MIT
/**
 * ⚠ DO NOT REMOVE — Scope: W-SET-TRUST, prompts/TEAMWORK_FRAMEWORK.md §38.11 (G-7). READ THE LOG after every run — the exit code is not evidence.
 * THE ISSUE it proves/disproves: a translation rule (upcaster set) was judged against the trust list in force NOW on each device, and a loaded set is never
 * unloaded — after a key rotation an old device keeps a set a fresh device refuses, so the same op folds in two shapes. Rule: a published set is judged
 * against the trust list in force WHEN THE POLICY THAT FIRST CARRIED IT ARRIVED (fold order, the same on every device).
 * Real code: build/comm/* (engine) + the host glue common/comm/team_versions.js + op_versions.js (bim-ootb; default origin/main via git show, or a dir).
 *   §V1 ROTATION KEEPS AN EARLIER SET  §V2 A SET SIGNED BY A DROPPED KEY AFTER THE ROTATION  §V3 ROTATE+PUBLISH IN ONE POLICY  §V4 DEPLOYMENT SETS  §MUTANTS
 * Usage: node scripts/witness_comm_settrust.js [bim-ootb dir]      WITNESS_COMM=<comm dir copy> (mutant runs)
 */
'use strict';
if (typeof globalThis.crypto === 'undefined' || !globalThis.crypto.subtle) globalThis.crypto = require('crypto').webcrypto;
var path = require('path'), fs = require('fs'), os = require('os'), vm = require('vm'), cp = require('child_process'), nodeCrypto = require('crypto'), initSqlJs = require('sql.js');
var ROOT = path.join(__dirname, '..');
var GLUE = ['common/comm/team_versions.js', 'common/comm/op_versions.js', 'common/comm/team_keys.js'];
var OOTB = require('./lib_ootb.js').ootbDir(process.argv[2], GLUE);
var COMM = process.env.WITNESS_COMM || path.join(ROOT, 'build', 'comm');
var IS_MUTANT = !!process.env.WITNESS_COMM;
var SIGN = require(path.join(ROOT, 'build', 'scriptor', 'sign_plan.js'));
var red = [], judged = 0;
function A(n, ok, l, d) { judged++; if (!ok) red.push(n); if (!IS_MUTANT) console.log('   ' + (ok ? '🟢' : '🔴') + ' ' + n + ' ' + l + (d ? ' — ' + d : '')); return ok; }
var H = IS_MUTANT ? function () {} : console.log, uuid = function () { return nodeCrypto.randomUUID(); };
var pubOf = function (k) { return { kty: k.publicJwk.kty, crv: k.publicJwk.crv, x: k.publicJwk.x, y: k.publicJwk.y }; };

// one device's glue = a fresh vm with the real op_versions.js + team_versions.js, the given trust list (what pinTrust sets) and deployment sets
async function glue(trust, shipped) {
  var g = { console: { log: function (m) { logs.push(String(m)); } }, crypto: globalThis.crypto, TextEncoder: TextEncoder }, logs = [];
  g.window = g; g.globalThis = g; g.ERP = { OpVersions: require(path.join(OOTB, 'common/comm/op_versions.js')) };
  g.TEAM_PLAN_TRUST = trust; g.TEAM_SHAPE_V = { CRUD_CREATE: 2, CRUD_UPDATE: 2, CRUD_DELETE: 2 }; g.TEAM_UPCASTERS = shipped || [];
  // Stage 2 (bim-ootb #2473): the set verifier judges through TeamKeys; with none it refuses every set (refused:bad-signature). Same source as team_versions (bim-ootb OOTB dir), run in the SAME vm.
  g.CommEnvelope = require(path.join(COMM, 'comm_envelope.js'));                                     // team_keys.js reads global.CommEnvelope first (the vm has no require)
  vm.runInContext(fs.readFileSync(path.join(OOTB, 'common/comm/team_keys.js'), 'utf8'), vm.createContext(g));
  vm.runInContext(fs.readFileSync(path.join(OOTB, 'common/comm/team_versions.js'), 'utf8'), g);
  await g.TeamVersions.ready; return { TV: g.TeamVersions, g: g, logs: logs };
}
function setLines(G, op) { return G.logs.filter(function (l) { return /§TEAM_VERSIONS_SET/.test(l); }); }

(async function () {
  ['CommEnvelope', 'CommOrder', 'CommRoster', 'CommAdmit', 'CommStore', 'CommPipe'].forEach(function (n) { delete globalThis[n]; });
  var STORE = require(path.join(COMM, 'comm_store.js')), ROS = require(path.join(COMM, 'comm_roster.js')), SQL = await initSqlJs();
  if (!IS_MUTANT) console.log('§SETTRUST_START glue=' + OOTB + ' engine=' + path.relative(ROOT, COMM));
  var K0 = await SIGN.keygen(), K1 = await SIGN.keygen(), K2 = await SIGN.keygen(), K3 = await SIGN.keygen();
  var setOf = function (op, from, to) { return { kind: 'upcasters', op: op, steps: [{ from: 1, map: [{ at: 'fields', rename: [from, to] }] }] }; };
  var S0 = await SIGN.sign(setOf('CRUD_CREATE', 'legacy_a', 'description'), K0.privateJwk, K0.publicJwk);     // published BEFORE the rotation, signed by K0
  var S1 = await SIGN.sign(setOf('CRUD_UPDATE', 'legacy_b', 'description'), K0.privateJwk, K0.publicJwk);     // published AFTER K0 was dropped
  var S2 = await SIGN.sign(setOf('CRUD_DELETE', 'legacy_c', 'description'), K1.privateJwk, K1.publicJwk);     // published IN the POLICY that drops K1

  var F = await STORE.newDevice(); F.person_uu = uuid();
  var sp = await STORE.newSpace('x', F, F.person_uu, 'F', 102, { planTrust: [pubOf(K0), pubOf(K1)] });
  var S = STORE.open(new SQL.Database(), { SQL: SQL, space: sp.space, self: F, access: function () { return { allowed: true }; }, log: function () {} });
  await S.genesis(sp.params);
  async function rotate(keys, prevKeys, by) { return S.publishStatement(await SIGN.sign({ kind: 'plan-trust', keys: keys, prev: await ROS.planTrustHash(prevKeys) }, by.privateJwk, by.publicJwk)); }

  H('§V1 a set published under [K0,K1], then K0 is dropped');
  var Ga = await glue([pubOf(K0), pubOf(K1)]);
  await Ga.TV.publish(S, [S0]); var a1 = await Ga.TV.adopt(S);
  var rot1 = await rotate([pubOf(K1), pubOf(K2)], [pubOf(K0), pubOf(K1)], K1), pt1 = await S.planTrust();
  var Gc = await glue([pubOf(K1), pubOf(K2)]), c1 = await Gc.TV.adopt(S), pol1 = await S.policy();
  A('V1', a1 === 1 && rot1.ok && pt1.length === 2, 'precondition: device A loaded S0 (signed by K0) under [K0,K1]; the rotation to [K1,K2] is MERGED', 'A loaded=' + a1 + ' rotation=' + rot1.verdict);
  A('V1', c1 === 1, 'a FRESH device adopting after the rotation (its trust list is now [K1,K2]) still loads S0 — the set is judged by the list it was published under', 'C loaded=' + c1 + ' ' + setLines(Gc).join(' | '));
  A('V1', !!(pol1 && pol1.setTrust && Object.keys(pol1.setTrust).length === 1), 'the policy in force names the list each set was published under (setTrust)', pol1 && pol1.setTrust ? Object.keys(pol1.setTrust).length + ' set(s)' : 'ABSENT');

  H('§V2 a K0-signed set published AFTER K0 was dropped');
  await Ga.TV.publish(S, [S1]);
  var Gd = await glue([pubOf(K1), pubOf(K2)]), d1 = await Gd.TV.adopt(S), dl = setLines(Gd);
  var a2 = await Ga.TV.adopt(S), al = setLines(Ga);
  A('V2', d1 === 1 && dl.some(function (l) { return /refused:untrusted-signer/.test(l); }), 'a fresh device after that POLICY: S0 loads, S1 is refused untrusted-signer', 'D loaded=' + d1 + ' ' + dl.join(' | '));
  A('V2', a2 === 0 && al.some(function (l) { return /refused:untrusted-signer/.test(l); }), 'the OLD device refuses S1 too (same verdict on both)', 'A newly loaded=' + a2 + ' ' + al.slice(-1)[0]);

  H('§V3 one POLICY rotates [K1,K2] -> [K2,K3] AND carries S2 signed by K1');
  var pol = await S.policy(), base = JSON.parse(JSON.stringify(pol.params));
  base.epoch = pol.epoch + 1; base.planTrust = await SIGN.sign({ kind: 'plan-trust', keys: [pubOf(K2), pubOf(K3)], prev: await ROS.planTrustHash([pubOf(K1), pubOf(K2)]) }, K1.privateJwk, K1.publicJwk);
  base.upcasters = base.upcasters.concat([S2]); var op3 = await S.setPolicy(base), v3 = (await S.order()).verdict[op3.hash];
  var Ge = await glue([pubOf(K2), pubOf(K3)]), e1 = await Ge.TV.adopt(S), el = setLines(Ge);
  A('V3', v3 && v3.verdict === 'MERGED' && el.some(function (l) { return /op=CRUD_CREATE ok/.test(l); }) && el.some(function (l) { return /op=CRUD_DELETE ok/.test(l); }) && el.some(function (l) { return /op=CRUD_UPDATE refused:untrusted-signer/.test(l); }), 'MERGED; a fresh device on [K2,K3] loads S0 and S2 (S2 was published under [K1,K2]) and refuses S1', (v3 && v3.verdict) + ' loaded=' + e1 + ' ' + el.join(' | '));
  // the same ops ingested in REVERSE arrival order by another device -> the same setTrust
  var R = STORE.open(new SQL.Database(), { SQL: SQL, space: sp.space, self: await STORE.newDevice(), access: function () { return { allowed: true }; }, log: function () {} });
  var envs = S.query('SELECT envelope FROM cl_op ORDER BY rowid').map(function (r) { return JSON.parse(r.envelope); }).reverse(), ing = []; for (var e of envs) ing.push(await R.ingest(e, 'w'));
  if (!IS_MUTANT) console.log('   §V3_REVERSE ingested=' + envs.length + ' results=' + JSON.stringify(ing.reduce(function (m, x) { m[String(x).split(' ')[0]] = (m[String(x).split(' ')[0]] || 0) + 1; return m; }, {})) + ' roster.ok=' + (await R.order()).roster.ok);
  var pR = await R.policy(), pS = await S.policy();
  A('V3', !!(pR && pS && pR.setTrust && JSON.stringify(pR.setTrust) === JSON.stringify(pS.setTrust)), 'a device ingesting the same ops in reverse order reaches the same setTrust', pR && pR.setTrust ? Object.keys(pR.setTrust).length + ' sets, equal=' + (JSON.stringify(pR.setTrust) === JSON.stringify(pS.setTrust)) : 'ABSENT');

  H('§V4 deployment-shipped sets (not in the log) — unchanged');
  var Gs = await glue([pubOf(K0)], [S0]), Gt = await glue([pubOf(K2)], [S0]);
  A('V4', setLines(Gs).some(function (l) { return / ok$/.test(l); }) && setLines(Gt).some(function (l) { return /refused:untrusted-signer/.test(l); }), 'a shipped set is judged by the deployment list, as before (K0 list: ok; K2 list: refused)', setLines(Gs).concat(setLines(Gt)).join(' | '));

  console.log('§SETTRUST_ARMS red=' + (red.length ? Array.from(new Set(red)).join(',') : 'none') + ' judged=' + judged);
  if (IS_MUTANT) process.exit(red.length ? 1 : 0);
  if (red.length) { console.log('§SETTRUST_VERDICT FAIL judged=' + judged + ' fails=' + red.length + ' mutants=NOT RUN (the base run is red)'); process.exit(1); }
  var src = fs.readFileSync(path.join(COMM, 'comm_roster.js'), 'utf8'), killed = 0;
  var M = [['setTrust never recorded', /\/\*G7:RECORD\*\/[^\n]*/, '/*G7:RECORD*/', 'V1'],
           ['recorded AFTER the POLICY\'s own rotation', 'var trustAt = trust, trustTAt = trustT;', 'var trustAt = rot || trust, trustTAt = trustT;', 'V3'],
           ['a later POLICY carrying the same set overwrites its list', "if (setTrust[ck7] === undefined) { setTrust[ck7] = trustAt", "if (true) { setTrust[ck7] = trustAt", 'V2']];
  M.forEach(function (m) {
    var s2 = src.replace(m[1], m[2]); if (s2 === src) { console.log('   🔴 mutant ' + m[0] + ': MUTATION DID NOT APPLY'); return; }
    var d = fs.mkdtempSync(path.join(os.tmpdir(), 'mut-g7-')); fs.readdirSync(COMM).filter(function (x) { return /\.js$/.test(x); }).forEach(function (x) { fs.copyFileSync(path.join(COMM, x), path.join(d, x)); });
    fs.writeFileSync(path.join(d, 'comm_roster.js'), s2);
    var r = cp.spawnSync(process.execPath, [__filename, OOTB], { env: Object.assign({}, process.env, { WITNESS_COMM: d }), encoding: 'utf8', maxBuffer: 1 << 26 }); fs.rmSync(d, { recursive: true, force: true });
    var mm = /§SETTRUST_ARMS red=(\S+)/.exec(r.stdout || ''), reds = mm && mm[1] !== 'none' ? mm[1].split(',') : [], hit = !!mm && reds.indexOf(m[3]) >= 0; if (hit) killed++;
    console.log('   ' + (hit ? '🟢' : '🔴') + ' mutant ' + m[0] + ' -> ' + (mm ? 'red=' + (reds.join(',') || 'none') : 'CRASHED (not a kill) ' + String(r.stderr).split('\n')[0]) + ' (expected ' + m[3] + ')');
  });
  console.log('§SETTRUST_VERDICT ' + (killed === M.length ? 'PASS' : 'FAIL') + ' judged=' + judged + ' fails=0 mutants=' + killed + '/' + M.length);
  process.exit(killed === M.length ? 0 : 1);
})().catch(function (e) { console.log('§SETTRUST_CRASH ' + (e && e.stack || e)); process.exit(2); });
