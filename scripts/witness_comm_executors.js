#!/usr/bin/env node
// Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
// SPDX-License-Identifier: MIT
/**
 * ⚠ DO NOT REMOVE — Scope: W-UPS-E3, prompts/TEAMWORK_FRAMEWORK.md §38.3 (FL-8 E3: one DocAction executor per document, enforced by every device's fold).
 * READ THE LOG after every run — the exit code is not evidence.
 * THE ISSUE it proves/disproves: today any enrolled device can Complete a document and its whole consequence group is placed on every device —
 * a second DocAction executor = ghost rows + a second source of truth. Real modules: build/comm/* (CommStore, CommRoster); statements signed by the
 * REAL compiler signer (build/scriptor/sign_plan.js).
 *   §X1 MAP  §X2 HQ  §X3 STATION  §X4 NO-ENTRY  §X5 AUTHOR RETIRED (study §12.2 2.5)  §X6 REFUSE  §X7 ORDER  §MUTANTS
 *   2.5: the executor is a ROLE only (as legacy Document Action Access); the per-record 'author' value is retired - such a statement is refused bad-policy:executors.
 * Run: node scripts/witness_comm_executors.js > build/comm/logs/witness_comm_executors.log 2>&1
 */
'use strict';
if (typeof globalThis.crypto === 'undefined' || !globalThis.crypto.subtle) globalThis.crypto = require('crypto').webcrypto;
var path = require('path'), fs = require('fs'), os = require('os'), nodeCrypto = require('crypto'), initSqlJs = require('sql.js');
var SIGN = require(path.join(__dirname, '..', 'build', 'scriptor', 'sign_plan.js'));
var REAL = path.join(__dirname, '..', 'build', 'comm');
var judged = 0, fails = 0;
function say(ok, l, d) { judged++; if (!ok) fails++; console.log('   ' + (ok ? '🟢' : '🔴') + ' ' + l + (d ? ' — ' + d : '')); }
function loadComm(dir) { ['CommEnvelope', 'CommOrder', 'CommRoster', 'CommAdmit', 'CommStore', 'CommPipe'].forEach(function (n) { delete globalThis[n]; });
  return { ENV: require(path.join(dir, 'comm_envelope.js')), STORE: require(path.join(dir, 'comm_store.js')), PIPE: require(path.join(dir, 'comm_pipe.js')) }; }
var uuid = function () { return nodeCrypto.randomUUID(); }, HQ = 102, STATION = 103;

async function arms(C, quiet) {
  var red = [], A = function (n, ok, l, d) { if (!ok) red.push(n); if (!quiet) say(ok, l, d); return ok; }, H = quiet ? function () {} : console.log;
  var SQL = await initSqlJs(), STORE = C.STORE, ENV = C.ENV;
  var K = []; for (var i = 0; i < 3; i++) { var k = await SIGN.keygen(); K.push({ pub: { kty: 'EC', crv: 'P-256', x: k.publicJwk.x, y: k.publicJwk.y }, full: k }); }
  var hashOf = function (m) { return nodeCrypto.createHash('sha256').update(ENV.canonical(m)).digest('hex'); };
  async function stmt(map, prevMap, by) { return SIGN.sign({ kind: 'executors', map: map, prev: hashOf(prevMap) }, by.full.privateJwk, by.full.publicJwk); }
  var access = function () { return { allowed: true }; };
  async function team(trust) {                                           // F = HQ admin (role 102), S and T = stations (role 103, not admin)
    var dev = {}, per = {}, S = {}, names = ['F', 'S', 'T'];
    for (var n of names) { dev[n] = await STORE.newDevice(); dev[n].person_uu = uuid(); per[n] = dev[n].person_uu; }
    var sp = await STORE.newSpace('x', dev.F, per.F, 'F', HQ, trust ? { planTrust: trust } : undefined);
    names.forEach(function (n) { S[n] = STORE.open(new SQL.Database(), { SQL: SQL, space: sp.space, self: dev[n], access: access, log: function () {} }); });
    await S.F.genesis(sp.params);
    for (var m of ['S', 'T']) { await S.F.addPerson({ person_uu: per[m], name: m, ad_role_id: STATION, comm_admin: false }); await S.F.enroll(dev[m].kid, dev[m].pubJwk, per[m], dev[m].dhPubJwk); }
    var pipe = C.PIPE.memPipe('x-' + uuid());
    S.sync = async function () { for (var r = 0; r < 3; r++) for (var q of names) await S[q].sync(pipe); };
    await S.sync(); S.names = names; S.space = sp.space; return S;
  }
  async function vd(s, h) { var L = await s.order(), v = L.verdict[h]; return v ? v.verdict + ':' + v.reason : 'none'; }
  async function all(T, h) { await T.sync(); var o = []; for (var n of T.names) o.push(await vd(T[n], h)); return o; }
  async function order(s, table) { var uu = uuid(); await s.author({ target: { table: table || 'c_order', uu: uu }, intent: 'K2', body: { op_type: 'CRUD_CREATE', params: { fields: { documentno: 'D-' + uu.slice(0, 4), ad_client_id: 11, ad_org_id: 11 } } } }); return uu; }
  async function complete(s, uu, table) {                                  // the DocAction group: the status op + one consequence op, same grp
    var g = uuid(), st = await s.author({ target: { table: table || 'c_order', uu: uu }, intent: 'K2', body: { op_type: 'SET_STATUS', params: { action: 'CO', from: 'DR', to: 'CO', grp: g } } });
    var cs = await s.author({ target: { table: 'm_inout', uu: uuid() }, intent: 'K2', body: { op_type: 'CRUD_CREATE', params: { fields: { documentno: 'SH-' + g.slice(0, 4), ad_client_id: 11, ad_org_id: 11 }, grp: g } } });
    return { st: st.hash, cs: cs.hash };
  }
  async function inFold(s, h) { return (await s.foldable()).some(function (p) { return p.hash === h; }); }
  var pol = function (ep, over) { return Object.assign({ epoch: ep, visit_ms: 900000 }, over || {}); };
  var isM = function (v) { return v.indexOf('MERGED') === 0; };

  H('§X1 MAP');
  var T = await team([K[0].pub, K[1].pub]);
  var m1 = { c_order: HQ }, s1 = await stmt(m1, {}, K[0]), p1 = await T.F.setPolicy(pol(1, { executors: s1 })), v1 = await all(T, p1.hash), R1 = (await T.T.order()).roster;
  A('X1', v1.every(isM) && R1.executors && R1.executors.c_order === HQ && R1.executorsEpoch === 1, 'the owner-signed map {c_order: HQ ' + HQ + '} published by the admin is MERGED on all 3 devices; every device returns it, executorsEpoch=1', v1.join(' ') + ' map=' + JSON.stringify(R1.executors) + ' epoch=' + R1.executorsEpoch);
  H('§X2 HQ');
  var oF = await order(T.F), cF = await complete(T.F, oF), vF = await all(T, cF.st), vFc = await all(T, cF.cs);
  A('X2', vF.every(isM) && vFc.every(isM), 'HQ (the executor) completes its order: the status op and its consequence are MERGED on every device', vF.join(' ') + ' | ' + vFc.join(' '));
  H('§X3 STATION');
  var oS = await order(T.S), cS = await complete(T.S, oS), vS = await all(T, cS.st), vSc = await all(T, cS.cs);
  A('X3', vS.every(function (v) { return v === 'REFUSED:not-executor'; }), 'a STATION completes an order it created: its status op is REFUSED not-executor on EVERY device', vS.join(' '));
  A('X3', vSc.every(function (v) { return v === 'REFUSED:not-executor-group'; }), 'and the consequence in the same DocAction group is REFUSED not-executor-group everywhere (all-or-none)', vSc.join(' '));
  var ghost = 0; for (var n of T.names) { if (await inFold(T[n], cS.st)) ghost++; if (await inFold(T[n], cS.cs)) ghost++; }
  A('X3', ghost === 0, 'no ghost: neither op is in any device\'s foldable()', 'ghost=' + ghost);
  var oSok = await vd(T.F, (await T.S.order()).order.filter(function (h) { return true; })[0]);
  H('§X4 NO-ENTRY');
  var oX = await order(T.S, 'm_movement'), cX = await complete(T.S, oX, 'm_movement'), vX = await all(T, cX.st);
  A('X4', vX.every(isM), 'CONTROL: a table with no entry in the map (m_movement) — the station\'s status op is MERGED as today', vX.join(' '));
  H('§X5 AUTHOR RETIRED');
  var s2a = await stmt({ c_order: 'author' }, m1, K[1]), p2a = await T.F.setPolicy(pol(2, { executors: s2a })), v2a = await all(T, p2a.hash), R2a = (await T.T.order()).roster;
  A('X5', v2a.every(function (v) { return v === 'REFUSED:bad-policy:executors'; }) && R2a.executors && R2a.executors.c_order === HQ && R2a.executorsEpoch === 1, 'map {c_order: "author"} (backup key K1 signs, chained) is REFUSED bad-policy:executors on every device; the map in force stays {c_order: HQ}, epoch 1', v2a.join(' ') + ' map=' + JSON.stringify(R2a.executors) + ' epoch=' + R2a.executorsEpoch);
  var m2 = { c_order: HQ, m_inout: HQ }, s2 = await stmt(m2, m1, K[1]), p2 = await T.F.setPolicy(pol(2, { executors: s2 })), v2 = await all(T, p2.hash), R2 = (await T.T.order()).roster;
  A('X5', v2.every(isM) && R2.executors && R2.executors.m_inout === HQ && R2.executorsEpoch === 2, 'a role-valued second statement {c_order, m_inout: HQ} (backup key K1, chained) is MERGED everywhere and applies, epoch 2 (the chain the X6 cases refuse against)', v2.join(' ') + ' map=' + JSON.stringify(R2.executors) + ' epoch=' + R2.executorsEpoch);
  H('§X6 REFUSE');
  var cur = m2, good = await stmt({ c_order: HQ }, cur, K[0]);
  var edited = JSON.parse(JSON.stringify(good)); edited.map = { c_order: STATION };
  var cases = [['unsigned/edited after signing', T.F, pol(3, { executors: edited }), 'REFUSED:executors-signature'],
    ['signed by a key outside the trust list', T.F, pol(3, { executors: await stmt({ c_order: HQ }, cur, K[2]) }), 'REFUSED:executors-untrusted-signer'],
    ['the FIRST statement replayed after the second', T.F, pol(3, { executors: s1 }), 'REFUSED:executors-stale'],
    ['a valid statement published by a NON-admin station', T.S, pol(3, { executors: good }), 'REFUSED:not-admin'],
    ['a malformed map', T.F, pol(3, { executors: { kind: 'executors', map: { c_order: 'x' }, prev: hashOf(cur), signer: K[0].pub, sig: 'ab' } }), 'REFUSED:bad-policy:executors']];
  for (var c of cases) { var pc = await c[1].setPolicy(c[2]), vc = await all(T, pc.hash), mc = (await T.T.order()).roster.executors;
    A('X6', vc.every(function (v) { return v === c[3]; }) && mc && mc.c_order === HQ && mc.m_inout === HQ, c[0] + ' -> ' + c[3] + ' on every device; the map in force stays {c_order, m_inout: HQ}', vc.join(' ') + ' map=' + JSON.stringify(mc)); }
  var U = await team(null), su = await stmt({ c_order: HQ }, {}, K[0]), pu = await U.F.setPolicy(pol(1, { executors: su })), vu = await all(U, pu.hash);
  A('X6', vu.every(function (v) { return v === 'REFUSED:executors-unpinned'; }) && !(await U.T.order()).roster.executors, 'a space founded with NO trust list cannot name executors -> executors-unpinned', vu.join(' '));
  H('§X7 ORDER');
  var envs = T.F.query('SELECT envelope FROM cl_op').map(function (r) { return JSON.parse(r.envelope); }).reverse();
  var Xd = await STORE.newDevice(); Xd.person_uu = uuid(); var X = STORE.open(new SQL.Database(), { SQL: SQL, space: T.space, self: Xd, access: access, log: function () {} });
  for (var e of envs) await X.ingest(e, 'x');
  var keys = [cF.st, cS.st, cS.cs, cX.st, p2a.hash, p2.hash], same = true, det = [];
  for (var kh of keys) { var a1 = await vd(T.F, kh), a2 = await vd(X, kh); det.push(a2); if (a1 !== a2) same = false; }
  A('X7', envs.length > 15 && same, 'a fourth device ingesting the same ' + envs.length + ' ops in REVERSE order gives the same verdicts', det.join(' '));
  return red;
}
(async function () {
  console.log('═══ W-UPS-E3 — every device refuses a DocAction from anyone but the document\'s one executor (TEAMWORK_FRAMEWORK FL-8, §38.3) ═══');
  var red0 = await arms(loadComm(REAL), false);
  console.log('§MUTANTS (a copy of build/comm with one rule broken; each must turn at least one arm red; a crash is NOT a kill)');
  async function mut(label, edits) {
    var d = fs.mkdtempSync(path.join(os.tmpdir(), 'exe_mut_')); fs.readdirSync(REAL).filter(function (f) { return /\.js$/.test(f); }).forEach(function (f) { fs.copyFileSync(path.join(REAL, f), path.join(d, f)); });
    var applied = edits.every(function (e) { var p = path.join(d, e[0]), s = fs.readFileSync(p, 'utf8'), t = s.replace(e[1], e[2]); if (t === s) return false; fs.writeFileSync(p, t); return true; });
    var red, threw = null; try { red = await arms(loadComm(d), true); } catch (e) { red = []; threw = String(e.message).slice(0, 60); }
    fs.rmSync(d, { recursive: true, force: true });
    if (threw) return say(false, label + ' -> the mutant CRASHED (' + threw + ') — not a kill');
    say(applied && red.length > 0, label + ' -> red arms: ' + (red.length ? Array.from(new Set(red)).join(', ') : 'NONE (survivor = hole)') + (applied ? '' : ' (MUTATION DID NOT APPLY)'));
  }
  await mut('role check off', [['comm_store.js', "if (!okExe) verdict[o.hash] = { verdict: 'REFUSED', reason: 'not-executor' };", "void 0;"]]);
  await mut('group refusal off', [['comm_store.js', "verdict[go.hash] = { verdict: 'REFUSED', reason: 'not-executor-group' };", "void 0;"]]);
  await mut('signer check off', [['comm_roster.js', "if (!trust.some(function (k) { return sameKey(k, p.executors.signer); })) return no('executors-untrusted-signer');", ""]]);
  await mut("'author' accepted again by the map shape", [['comm_roster.js', "!(Number.isInteger(m[t]) && m[t] >= 0)", "!(m[t] === 'author' || (Number.isInteger(m[t]) && m[t] >= 0))"]]);
  await mut('map never applied', [['comm_roster.js', "if (rotE) { exe = rotE;", "if (false) { exe = rotE;"]]);
  console.log('§EXE_VERDICT ' + (fails || red0.length ? 'FAIL' : 'PASS') + ' judged=' + judged + ' fails=' + fails);
  process.exit(fails ? 1 : 0);
})();
