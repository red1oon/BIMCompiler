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
function same(a, b) { return JSON.stringify(Object.keys(a).sort().map(function (k) { return [k, a[k]]; })) === JSON.stringify(Object.keys(b).sort().map(function (k) { return [k, b[k]]; })); }

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
function sigState(r) { var m = r.logs.map(function (l) { return /§TEAM_PLAN_SIG state=(\w+)/.exec(l); }).filter(Boolean)[0]; return m && m[1]; }
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
    var closed = function (r) { return host === 'modeller' ? Object.keys(r.api.classes()).length === 0 : r.api.scopeOf('c_order') === 'unplanned' && r.api.scopeOf('ad_sequence') === 'unplanned'; };
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
(async function () {
  var READ = { trust: rd('common/comm/team_trust.js'), scope: rd('common/comm/team_scope.js'), adapter: { modeller: rd('modeller/team_sync.js'), erp: rd('erp/team_sync.js') } };
  console.log('§HOSTS_START reader=' + OOTB + ' · real adapters, real plans, compiler signer · no browser');
  await arms(READ, false);
  console.log('§W-HOSTS-MUTANTS (each broken rule must turn at least one arm red)');
  function mut(label, patch) { var s = { trust: READ.trust, scope: READ.scope, adapter: { modeller: READ.adapter.modeller, erp: READ.adapter.erp } }; var ok = patch(s);
    return arms(s, true).then(function (red) { say(ok !== false && red.length > 0, label + ' -> red arms: ' + (red.length ? Array.from(new Set(red)).join(', ') : 'NONE (survivor = hole)') + (ok === false ? ' (MUTATION DID NOT APPLY)' : '')); }); }
  await mut('signature verification skipped (reader says ok)', function (s) { var t = s.scope.replace(/(verify: async function[^\n]*\n)/, "$1      memo.v = { plan: global.TEAM_PLAN, s: 'ok' }; return 'ok';\n"); if (t === s.scope) return false; s.scope = t; });
  await mut('`ready` not gated by the verification (both adapters)', function (s) { var m = s.adapter.modeller.replace("ready = readyBoot.then(function (v) { return planVerified.then(function () { return v; }); })", 'ready = readyBoot'), e = s.adapter.erp.replace("ready = readyBoot.then(function (v) { return planVerified.then(function () { return v; }); })", 'ready = readyBoot'); if (m === s.adapter.modeller || e === s.adapter.erp) return false; s.adapter.modeller = m; s.adapter.erp = e; });
  await mut('the verdict is ignored: the Modeller never recomputes its op list after verify', function (s) { var t = s.adapter.modeller.replace("    CLASS = classFromPlan();\n    var n =", "    var n ="); if (t === s.adapter.modeller) return false; s.adapter.modeller = t; });
  await mut('the shipped trust file overwrites a list the deployment injected', function (s) { s.trust = 'window.TEAM_PLAN_TRUST = [];'; });
  await mut('a literal list reinstated in the Modeller (plan ignored)', function (s) { var t = s.adapter.modeller.replace('function classFromPlan() {', 'function classFromPlan() { return ' + JSON.stringify(OLD) + '; }\n  function classFromPlanOrig() {'); if (t === s.adapter.modeller) return false; s.adapter.modeller = t; });
  console.log('§HOSTS_VERDICT ' + (fails ? 'FAIL' : 'PASS') + ' judged=' + judged + ' fails=' + fails + ' (whitebox: the adapters\' own § lines; the browser WebCrypto verify is not exercised here)');
  process.exit(fails ? 1 : 0);
})();
