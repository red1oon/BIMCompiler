#!/usr/bin/env node
// Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
// SPDX-License-Identifier: MIT
/**
 * witness_scriptor_hosts.js — the signed-plan wiring of BOTH hosts, by WHITEBOX log (no browser). Spec: prompts/TEAMWORK_FRAMEWORK.md §32, §32.1.
 * The REAL team_trust.js, team_scope.js, generated plans and adapters (modeller/team_sync.js, erp/team_sync.js) are loaded in a vm with a minimal global; plans are signed by the REAL compiler
 * signer (build/scriptor/sign_plan.js). Asserted: only what the app itself prints (§TEAM_PLAN, §TEAM_PLAN_SIG) or exports (classes(), scopeOf), and the ORDER of the SIG line against `ready`.
 *   §W-HOSTS-MODELLER (H1-H6) · §W-HOSTS-ERP (H1-H6) · §W-HOSTS-ORDER (H7) · §W-HOSTS-MUTANTS
 * Usage: node scripts/witness_scriptor_hosts.js [bim-ootb dir; default: origin/main read with git show]
 */
'use strict';
var path = require('path'), fs = require('fs'), vm = require('vm'), webcrypto = require('crypto').webcrypto;
var SDIR = path.join(__dirname, '..', 'build', 'scriptor'), SIGN = require(path.join(SDIR, 'sign_plan.js'));
var FILES = ['common/comm/team_trust.js', 'common/comm/team_scope.js', 'modeller/team_plan.js', 'erp/team_plan.js', 'modeller/team_sync.js', 'erp/team_sync.js'];
var OOTB = require('./lib_ootb.js').ootbDir(process.argv[2], FILES);
var judged = 0, fails = 0;
function say(ok, label, detail) { judged++; if (!ok) fails++; console.log('   ' + (ok ? '🟢' : '🔴') + ' ' + label + (detail ? ' — ' + detail : '')); return ok; }
function rd(f) { return fs.readFileSync(path.join(OOTB, f), 'utf8'); }
function clone(o) { return JSON.parse(JSON.stringify(o)); }
var OLD = { GEOM_INSERT: 'create', GEOM_EXTRUDE: 'create', GEOM_EXTRUDE_POLY: 'create', GEOM_SWEEP: 'create', GEOM_LOFT: 'create', GEOM_REVOLVE: 'create', GEOM_MOVE: 'move' };
function wrap(plan) { return '(function (g) { g.TEAM_PLAN = ' + JSON.stringify(plan) + '; })(typeof window !== \'undefined\' ? window : globalThis);\n'; }
function same(a, b) { if (!a || !b) return false; return JSON.stringify(Object.keys(a).sort().map(function (k) { return [k, a[k]]; })) === JSON.stringify(Object.keys(b).sort().map(function (k) { return [k, b[k]]; })); }

// run one host in a vm: scripts in the loader's order, then let the async verification and the (stubbed) boot settle. -> { logs, order, host }
async function boot(host, planSrc, trust, src, slow) {
  var logs = [], order = [], g = {};
  g.window = g; g.globalThis = g; g.TextEncoder = TextEncoder; g.crypto = slow ? { subtle: { importKey: webcrypto.subtle.importKey.bind(webcrypto.subtle), verify: async function () { var a = arguments; await new Promise(function (r) { setTimeout(r, slow); }); return webcrypto.subtle.verify.apply(webcrypto.subtle, a); } } } : webcrypto;
  g.console = { log: function (m) { logs.push(String(m)); order.push('log:' + String(m).slice(0, 30)); }, warn: function () {}, error: function () {} };
  g.location = { search: '?team=1', href: 'http://localhost/x?team=1' }; g.localStorage = { getItem: function () { return null; }, setItem: function () {} };
  g.document = { readyState: 'complete', addEventListener: function () {}, getElementById: function () { return null; }, createElement: function () { return { style: {}, setAttribute: function () {}, appendChild: function () {} }; }, body: null };
  g.setTimeout = function (f) { return setImmediate(f); }; g.clearTimeout = clearTimeout; g.setInterval = function () { return 0; }; g.clearInterval = function () {}; g.indexedDB = {}; g.addEventListener = function () {}; g.removeEventListener = function () {}; g.dispatchEvent = function () {}; g.navigator = { clipboard: {} }; g.URLSearchParams = URLSearchParams; g.URL = URL;
  if (trust) g.TEAM_PLAN_TRUST = trust;
  var ctx = vm.createContext(g);
  vm.runInContext((src && src.trust) || rd('common/comm/team_trust.js'), ctx);
  vm.runInContext((src && src.scope) || rd('common/comm/team_scope.js'), ctx);
  if (planSrc) vm.runInContext(planSrc, ctx);
  vm.runInContext((src && src.adapter && src.adapter[host]) || rd(host + '/team_sync.js'), ctx);
  var api = host === 'modeller' ? g.TeamSyncModeller : g.TeamSync;
  if (api && api.ready) api.ready.then(function () { order.push('ready'); });
  for (var i = 0; i < 40; i++) await new Promise(function (r) { setImmediate(r); });
  await new Promise(function (r) { setTimeout(r, (slow || 0) + 30); });
  return { logs: logs, order: order, g: g, api: api };
}
function sigState(r) { var m = r.logs.map(function (l) { return /§TEAM_PLAN_SIG state=(\w+)/.exec(l); }).filter(Boolean).slice(-1)[0]; return m && m[1]; }   // the LATEST verdict (a pinned genesis list re-verifies)
function planLine(r) { return r.logs.filter(function (l) { return /^§TEAM_PLAN (hash|missing)/.test(l); })[0]; }

async function arms(src, quiet) {
  var red = [], H = quiet ? function () {} : console.log;
  function A(n, ok, l, d) { if (!ok) red.push(n); if (!quiet) say(ok, l, d); return ok; }
  var K1 = await SIGN.keygen(), K2 = await SIGN.keygen(), pub = function (k) { return { kty: k.publicJwk.kty, crv: k.publicJwk.crv, x: k.publicJwk.x, y: k.publicJwk.y }; };
  var hosts = { modeller: SIGN.planOf(rd('modeller/team_plan.js')), erp: SIGN.planOf(rd('erp/team_plan.js')) };
  for (var host of ['modeller', 'erp']) {
    H('§W-HOSTS-' + host.toUpperCase());
    var plan = hosts[host], signed = await SIGN.sign(plan, K1.privateJwk, K1.publicJwk), tam = clone(signed);
    tam.flows.push({ name: 'T9999 x_widget', table: 'X_Widget', dir: 'BOTH', audience: 'space', payload: [] });
    var shared = function (r) { return host === 'modeller' ? r.api.classes() : null; };
    var open = function (r) { return host === 'modeller' ? same(r.api.classes(), OLD) : r.api.scopeOf('c_order') === 'share' && r.api.scopeOf('ad_sequence') === 'station-local'; };
    var closed = function (r) { return host === 'modeller' ? Object.keys(r.api.classes() || {}).length === 0 : r.api.scopeOf('c_order') === 'unplanned' && r.api.scopeOf('ad_sequence') === 'unplanned'; };
    var none = await boot(host, wrap(plan), null, src), ok = await boot(host, wrap(signed), [pub(K1)], src), bad = await boot(host, wrap(tam), [pub(K1)], src);
    var uns = await boot(host, wrap(plan), [pub(K1)], src), oth = await boot(host, wrap(signed), [pub(K2)], src), miss = await boot(host, null, null, src);
    A('H1', sigState(none) === 'unsigned' && open(none) && /^§TEAM_PLAN hash=/.test(planLine(none) || ''), host + ': no trust list (the shipped default) => state=unsigned, the same scope as before, and the app prints its plan line', 'sig=' + sigState(none) + ' | ' + planLine(none));
    A('H2', sigState(ok) === 'ok' && open(ok) && /^§TEAM_PLAN hash=/.test(planLine(ok) || ''), host + ': trust [K1] + plan signed by K1 (by the compiler\'s own signer) => state=ok and the host shares exactly what the unsigned run shared', 'sig=' + sigState(ok) + ' | ' + planLine(ok));
    A('H3', sigState(bad) === 'invalid' && closed(bad) && /missing/.test(planLine(bad) || ''), host + ': a plan altered AFTER signing => state=invalid, NOTHING is shared, and the app says so', 'sig=' + sigState(bad) + ' | ' + planLine(bad));
    A('H4', sigState(uns) === 'invalid' && closed(uns), host + ': the UNSIGNED plan under a trust list => closed (state=invalid)', 'sig=' + sigState(uns));
    A('H5', sigState(oth) === 'untrusted' && closed(oth), host + ': signed by a key that is not in the trust list => state=untrusted, closed', 'sig=' + sigState(oth));
    A('H6', sigState(miss) === 'missing' && closed(miss) && /missing/.test(planLine(miss) || ''), host + ': no plan at all => state=missing, nothing shared, "missing — nothing is shared" printed', 'sig=' + sigState(miss) + ' | ' + planLine(miss));
    var ix = function (r, pre) { for (var i = 0; i < r.order.length; i++) if (r.order[i].indexOf(pre) === 0) return i; return -1; };
    H('§W-HOSTS-ORDER');
    var slowOk = await boot(host, wrap(signed), [pub(K1)], src, 120);
    [['trust+signed', ok], ['no trust', none], ['tampered', bad], ['trust+signed, SLOW verification (120 ms)', slowOk]].forEach(function (x) { var s = ix(x[1], 'log:§TEAM_PLAN_SIG'), rd2 = ix(x[1], 'ready');
      A('H7', s >= 0 && rd2 >= 0 && s < rd2, host + ' (' + x[0] + '): the verification verdict is printed BEFORE `ready` resolves, so no scan or commit is judged against an unverified plan', 'sig@' + s + ' ready@' + rd2); });
  }
  return red;
}

// ---- GENESIS-pinned trust (TEAMWORK_FRAMEWORK §33.2): the REAL engine (build/comm) makes the space and the store; the ERP host's own pinTrust / spaceOpts are called
async function genesisArms(src, quiet) {
  var red = [], H = quiet ? function () {} : console.log;
  function A(n, ok, l, d) { if (!ok) red.push(n); if (!quiet) say(ok, l, d); return ok; }
  if (typeof globalThis.crypto === 'undefined' || !globalThis.crypto.subtle) globalThis.crypto = webcrypto;
  ['CommEnvelope', 'CommOrder', 'CommRoster', 'CommAdmit', 'CommStore', 'CommPipe'].forEach(function (n) { delete globalThis[n]; });
  var STORE = require(path.join(__dirname, '..', 'build', 'comm', 'comm_store.js')), ROS = require(path.join(__dirname, '..', 'build', 'comm', 'comm_roster.js')), SQL = await require('sql.js')();
  var K1 = await SIGN.keygen(), K2 = await SIGN.keygen(), pub = function (k) { return { kty: k.publicJwk.kty, crv: k.publicJwk.crv, x: k.publicJwk.x, y: k.publicJwk.y }; };
  var F = await STORE.newDevice(), PF = require('crypto').randomUUID();
  async function space(pt) { var sp = await STORE.newSpace('t', F, PF, 'Founder', 102, pt ? { planTrust: pt } : undefined); F.person_uu = PF; var S = STORE.open(new SQL.Database(), { SQL: SQL, space: sp.space, self: F, access: function () { return { allowed: true }; }, log: function () {} }); await S.genesis(sp.params); return { S: S, sp: sp }; }
  var H2 = quiet ? function () {} : console.log;
  for (var host of ['erp', 'modeller']) {
  var plan = SIGN.planOf(rd(host + '/team_plan.js')), unsigned = wrap(plan), byK1 = wrap(await SIGN.sign(plan, K1.privateJwk, K1.publicJwk)), byK2 = wrap(await SIGN.sign(plan, K2.privateJwk, K2.publicJwk));
  var closed = function (r) { return host === 'erp' ? r.api.scopeOf('c_order') === 'unplanned' : Object.keys(r.api.classes() || {}).length === 0; }, open = function (r) { return host === 'erp' ? r.api.scopeOf('c_order') === 'share' : same(r.api.classes(), OLD); };
  H2('§W-HOSTS-GENESIS ' + host.toUpperCase());
  var withK1 = await space([pub(K1)]), none = await space(null), T = host + ': ';
  var r1 = await boot(host, byK1, null, src); await r1.api._pinTrust(withK1.S);
  A('G1', sigState(r1) === 'ok' && open(r1) && r1.logs.some(function (l) { return /state=ok trust=genesis\(1\)/.test(l); }), T + 'deployment list EMPTY + genesis pinned [K1] + plan signed by K1 => the host adopts the genesis list, state=ok trust=genesis(1), scope open', 'sig=' + sigState(r1) + ' ' + r1.logs.filter(function (l) { return /SIG/.test(l); }).join(' | '));
  var r2 = await boot(host, byK1, [pub(K2)], src); await r2.api._pinTrust(withK1.S);
  A('G2', sigState(r2) === 'ok' && open(r2), T + 'deployment [K2] (a different key) + genesis [K1] + plan signed by K1 => ok: the space decides', 'sig=' + sigState(r2));
  var r2b = await boot(host, byK2, [pub(K2)], src); await r2b.api._pinTrust(withK1.S);
  A('G2', sigState(r2b) === 'untrusted' && closed(r2b), T + 'deployment [K2] + genesis [K1] + plan signed by K2 => UNTRUSTED and closed: the genesis list REPLACES the deployment list (not merged)', 'sig=' + sigState(r2b));
  var r3 = await boot(host, unsigned, null, src); await r3.api._pinTrust(withK1.S);
  A('G3', sigState(r3) === 'invalid' && closed(r3), T + 'genesis [K1] + an UNSIGNED plan => invalid, closed (the host was open until the genesis list was applied)', 'sig=' + sigState(r3));
  var r4 = await boot(host, byK2, null, src); await r4.api._pinTrust(withK1.S);
  A('G4', sigState(r4) === 'untrusted' && closed(r4), T + 'genesis [K1] + plan signed by K2 => untrusted, closed', 'sig=' + sigState(r4));
  var r5 = await boot(host, byK1, [pub(K1)], src); await r5.api._pinTrust(none.S);
  A('G5', sigState(r5) === 'ok' && open(r5), T + 'a space that pinned NOTHING + deployment [K1] + plan signed by K1 => ok: the deployment list stays the fallback', 'sig=' + sigState(r5));
  var r6 = await boot(host, byK1, [pub(K1), pub(K2)], src), o6 = r6.api._spaceOpts(host === 'erp' ? { name: 'b', sha256: 'a'.repeat(64) } : undefined), sp6 = await STORE.newSpace('t', F, PF, 'Founder', 102, o6);
  var r6e = await boot(host, byK1, null, src), o6e = r6e.api._spaceOpts(null);
  A('G6', JSON.stringify(sp6.params.planTrust) === JSON.stringify([pub(K1), pub(K2)]) && o6e === undefined && (host !== 'erp' || !!sp6.params.base), T + 'found() hands the deployment list to newSpace (the genesis params carry both keys' + (host === 'erp' ? ' and the base' : '') + '); with no list there is no option at all', JSON.stringify(Object.keys(o6 || {})) + ' / ' + o6e);
  // §35: the list in force changes by a POLICY op carrying a K1-signed rotation to [K2]; the RUNNING host re-reads it on its next pinTrust (after a Visit) — no host code for rotation
  var rot = await space([pub(K1)]), r7 = await boot(host, byK1, null, src); await r7.api._pinTrust(rot.S); var before7 = sigState(r7) === 'ok' && open(r7);
  var stR = await SIGN.sign({ kind: 'plan-trust', keys: [pub(K2)], prev: await ROS.planTrustHash([pub(K1)]) }, K1.privateJwk, K1.publicJwk), pR = await rot.S.setPolicy({ epoch: 1, planTrust: stR }), vR = (await rot.S.order()).verdict[pR.hash];
  await r7.api._pinTrust(rot.S);
  A('G7', before7 && vR && vR.verdict === 'MERGED' && sigState(r7) === 'untrusted' && closed(r7), T + 'open under the genesis [K1]; after a K1-signed POLICY rotates the list to [K2], the SAME running host re-verifies: the K1-signed plan is now untrusted and the scope closes', 'before=' + before7 + ' policy=' + (vR && vR.verdict) + ' sig=' + sigState(r7));
  var r7b = await boot(host, byK2, null, src); await r7b.api._pinTrust(rot.S);
  A('G7', sigState(r7b) === 'ok' && open(r7b), T + 'a plan signed by the key the rotation ADDED (K2) verifies ok under the list in force', 'sig=' + sigState(r7b));  // §38.10 (G-8): both hosts publish an owner-signed statement through the engine; before pairing the call answers, never throws (the paired path: browser W-UPS-E2-HOST)
  var r9 = await boot(host, byK1, null, src), pf = typeof r9.api.publishStatement === 'function', a9 = pf ? await r9.api.publishStatement({ kind: 'executors', map: {} }).catch(function (e) { return { threw: e.message }; }) : null;
  A('G9', pf && a9 && a9.ok === false && a9.reason === 'not-paired', T + 'the host exposes publishStatement; unpaired it answers {ok:false, not-paired}', pf ? JSON.stringify(a9) : 'ABSENT');
  // §38.5 E2b (ERP only — the Modeller has no DocActions): the host's DocAction overlay reads the SAME in-log executor map the fold enforces (E3)
  if (host === 'erp') {
    var ex = await space([pub(K1)]), r8 = await boot(host, byK1, null, src), api8 = r8.api, B = await STORE.newDevice(), PB = require('crypto').randomUUID();
    await ex.S.addPerson({ person_uu: PB, name: 'Station', ad_role_id: 103, comm_admin: false }); await ex.S.enroll(B.kid, B.pubJwk, PB, B.dhPubJwk);
    var ne = typeof api8.notExecutor === 'function' && typeof api8._refreshExecutors === 'function';
    if (!ne) A('G8', false, T + 'the host exposes notExecutor + _refreshExecutors (the DocAction list asks it)', 'ABSENT');
    else {
      await api8._refreshExecutors(ex.S, F.kid);
      A('G8', api8.notExecutor('C_Order', 100) === false, T + 'no executor map in force => nothing removed (team without the rule = as before)', 'notExecutor=' + api8.notExecutor('C_Order', 100));
      var s8 = await SIGN.sign({ kind: 'executors', map: { c_order: 102 }, prev: await ROS.executorsHash({}) }, K1.privateJwk, K1.publicJwk), p8 = await ex.S.setPolicy({ epoch: 1, executors: s8 }), v8 = (await ex.S.order()).verdict[p8.hash];
      await api8._refreshExecutors(ex.S, F.kid); var hq = api8.notExecutor('C_Order', 100), hqOther = api8.notExecutor('M_Movement', 100);
      await api8._refreshExecutors(ex.S, B.kid); var st = api8.notExecutor('C_Order', 100), stNeg = api8.notExecutor('c_order', -3), stOther = api8.notExecutor('M_Movement', 100);
      A('G8', v8 && v8.verdict === 'MERGED' && hq === false && st === true && stNeg === true, T + 'owner-signed {c_order: 102} MERGED; the HQ device (role 102) keeps its DocActions, the station (role 103) is offered none on any order (base or team record)', 'policy=' + (v8 && v8.verdict) + ' hq=' + hq + ' station=' + st + '/' + stNeg);
      A('G8', hqOther === false && stOther === false, T + 'a table with no entry keeps its DocActions on both devices (control)', 'hq=' + hqOther + ' station=' + stOther);
      var s8b = await SIGN.sign({ kind: 'executors', map: { c_order: 'author' }, prev: await ROS.executorsHash({ c_order: 102 }) }, K1.privateJwk, K1.publicJwk), p8b = await ex.S.setPolicy({ epoch: 2, executors: s8b }), v8b = (await ex.S.order()).verdict[p8b.hash];
      await api8._refreshExecutors(ex.S, B.kid); var aBase = api8.notExecutor('C_Order', 100), aLocal = api8.notExecutor('C_Order', -7);
      A('G8', v8b && v8b.verdict === 'MERGED' && aBase === true && aLocal === false, T + "{c_order:'author'}: a base order (no CREATE in the log, refused by E3) offers nothing; an order created on this device and not yet shared keeps its DocActions", 'policy=' + (v8b && v8b.verdict) + ' base=' + aBase + ' local=' + aLocal);
      A('G8', r8.logs.some(function (l) { return /§TEAM_EXECUTORS map=\{"c_order":102\} myRole=103/.test(l); }), T + 'the host prints the map it applies and the role it judged (§TEAM_EXECUTORS)', (r8.logs.filter(function (l) { return /§TEAM_EXECUTORS/.test(l); }).join(' | ') || 'no line'));
    }
  }
  }
  return red;
}
(async function () {
  var READ = { trust: rd('common/comm/team_trust.js'), scope: rd('common/comm/team_scope.js'), adapter: { modeller: rd('modeller/team_sync.js'), erp: rd('erp/team_sync.js') } };
  console.log('§HOSTS_START reader=' + OOTB + ' · real adapters, real plans, compiler signer · no browser');
  await arms(READ, false);
  await genesisArms(READ, false);
  console.log('§W-HOSTS-MUTANTS (each broken rule must turn at least one arm red)');
  function mut(label, patch) { var s = { trust: READ.trust, scope: READ.scope, adapter: { modeller: READ.adapter.modeller, erp: READ.adapter.erp } }; var ok = patch(s);
    return Promise.all([arms(s, true), genesisArms(s, true)]).catch(function (e) { if (process.env.HOSTS_STACK) console.log('§HOSTS_THROW ' + label + ' ' + (e && e.stack)); return [['THROW ' + String(e.message).slice(0, 40)], []]; }).then(function (rr) { var red = rr[0].concat(rr[1]), crashed = red.some(function (x) { return /^THROW /.test(x); }); say(ok !== false && red.length > 0 && !crashed, label + ' -> red arms: ' + (red.length ? Array.from(new Set(red)).join(', ') : 'NONE (survivor = hole)') + (ok === false ? ' (MUTATION DID NOT APPLY)' : '')); }); }
  await mut('signature verification skipped (reader says ok)', function (s) { var t = s.scope.replace(/(verify: async function[^\n]*\n)/, "$1      memo.v = { plan: global.TEAM_PLAN, s: 'ok' }; return 'ok';\n"); if (t === s.scope) return false; s.scope = t; });
  await mut('`ready` not gated by the verification (both adapters)', function (s) { var m = s.adapter.modeller.replace("ready = readyBoot.then(function (v) { return planVerified.then(function () { return v; }); })", 'ready = readyBoot'), e = s.adapter.erp.replace("ready = readyBoot.then(function (v) { return planVerified.then(function () { return v; }); })", 'ready = readyBoot'); if (m === s.adapter.modeller || e === s.adapter.erp) return false; s.adapter.modeller = m; s.adapter.erp = e; });
  await mut('the verdict is ignored: the Modeller never recomputes its op list after verify', function (s) { var t = s.adapter.modeller.replace("    CLASS = classFromPlan();\n    var n =", "    var n ="); if (t === s.adapter.modeller) return false; s.adapter.modeller = t; });
  await mut('the shipped trust file overwrites a list the deployment injected', function (s) { s.trust = 'window.TEAM_PLAN_TRUST = [];'; });
  await mut('a literal list reinstated in the Modeller (plan ignored)', function (s) { var t = s.adapter.modeller.replace('function classFromPlan() {', 'function classFromPlan() { return ' + JSON.stringify(OLD) + '; }\n  function classFromPlanOrig() {'); if (t === s.adapter.modeller) return false; s.adapter.modeller = t; });
  await mut('the genesis list never replaces the deployment list (pinTrust does not adopt it)', function (s) { var t = s.adapter.erp.replace("global.TEAM_PLAN_TRUST = gt; await verifyPlan(", "await verifyPlan("); if (t === s.adapter.erp) return false; s.adapter.erp = t; });
  await mut('the genesis list is MERGED with the deployment list instead of replacing it', function (s) { var t = s.adapter.erp.replace("global.TEAM_PLAN_TRUST = gt;", "global.TEAM_PLAN_TRUST = (global.TEAM_PLAN_TRUST || []).concat(gt);"); if (t === s.adapter.erp) return false; s.adapter.erp = t; });
  await mut('the plan is not re-verified after the genesis list is adopted', function (s) { var t = s.adapter.erp.replace(/global\.TEAM_PLAN_TRUST = gt; await verifyPlan\([^\n]*\);/, "global.TEAM_PLAN_TRUST = gt;"); if (t === s.adapter.erp) return false; s.adapter.erp = t; });
  await mut('found() drops the deployment list (spaceOpts omits planTrust)', function (s) { var t = s.adapter.erp.replace("if (Array.isArray(t) && t.length) o.planTrust = t;", ""); if (t === s.adapter.erp) return false; s.adapter.erp = t; });
  await mut('MODELLER: the genesis list never replaces the deployment list', function (s) { var t = s.adapter.modeller.replace("global.TEAM_PLAN_TRUST = gt; await verifyPlan(", "await verifyPlan("); if (t === s.adapter.modeller) return false; s.adapter.modeller = t; });
  await mut('MODELLER: the genesis list is merged with the deployment list', function (s) { var t = s.adapter.modeller.replace("global.TEAM_PLAN_TRUST = gt;", "global.TEAM_PLAN_TRUST = (global.TEAM_PLAN_TRUST || []).concat(gt);"); if (t === s.adapter.modeller) return false; s.adapter.modeller = t; });
  await mut('MODELLER: not re-verified after adopting the genesis list', function (s) { var t = s.adapter.modeller.replace(/global\.TEAM_PLAN_TRUST = gt; await verifyPlan\([^\n]*\);/, "global.TEAM_PLAN_TRUST = gt;"); if (t === s.adapter.modeller) return false; s.adapter.modeller = t; });
  await mut('MODELLER: found() drops the deployment list', function (s) { var t = s.adapter.modeller.replace("return Array.isArray(t) && t.length ? { planTrust: t } : undefined;", "return undefined;"); if (t === s.adapter.modeller) return false; s.adapter.modeller = t; });
  await mut('E2b: the DocAction overlay never removes anything', function (s) { var t = s.adapter.erp.replace("if (!exe.map) return false;", "return false;"); if (t === s.adapter.erp) return false; s.adapter.erp = t; });
  await mut('E2b: the device role is not compared (every device treated as a non-executor)', function (s) { var t = s.adapter.erp.replace("if (ex !== 'author') return exe.role !== ex;", "if (ex !== 'author') return true;"); if (t === s.adapter.erp) return false; s.adapter.erp = t; });
  await mut("E2b: 'author' treats this device's own unshared create as someone else's", function (s) { var t = s.adapter.erp.replace("return !(Number(pk) < 0);", "return true;"); if (t === s.adapter.erp) return false; s.adapter.erp = t; });
  console.log('§HOSTS_VERDICT ' + (fails ? 'FAIL' : 'PASS') + ' judged=' + judged + ' fails=' + fails + ' (whitebox: the adapters\' own § lines; the browser WebCrypto verify is not exercised here)');
  process.exit(fails ? 1 : 0);
})();
