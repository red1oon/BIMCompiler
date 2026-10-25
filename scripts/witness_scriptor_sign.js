#!/usr/bin/env node
// Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
// SPDX-License-Identifier: MIT
/**
 * witness_scriptor_sign.js — plan signing. Spec: prompts/TEAMWORK_FRAMEWORK.md §28. The REAL generated plans of both hosts are signed by build/scriptor/sign_plan.js (Node WebCrypto) and judged by the
 * REAL bim-ootb common/comm/team_scope.js (vm-loaded, WebCrypto injected). §W-SIGN-VERIFY (S0-S3,S6) · §W-SIGN-TRUST (S4,S5,S9) · §W-SIGN-FORM (S7,S8,S10) · §W-SIGN-MUTANTS
 * Usage: node scripts/witness_scriptor_sign.js [bim-ootb dir; default: origin/main read with git show]
 */
'use strict';
var path = require('path'), fs = require('fs'), vm = require('vm'), crypto = require('crypto');
var SDIR = path.join(__dirname, '..', 'build', 'scriptor'), SIGN = require(path.join(SDIR, 'sign_plan.js')), subtle = crypto.webcrypto.subtle;
var OOTB = require('./lib_ootb.js').ootbDir(process.argv[2], ['common/comm/team_scope.js', 'erp/team_plan.js', 'modeller/team_plan.js']);
var judged = 0, fails = 0;
function say(ok, label, detail) { judged++; if (!ok) fails++; console.log('   ' + (ok ? '🟢' : '🔴') + ' ' + label + (detail ? ' — ' + detail : '')); return ok; }
function rd(f) { return fs.readFileSync(path.join(OOTB, f), 'utf8'); }
function clone(o) { return JSON.parse(JSON.stringify(o)); }
var READER = rd('common/comm/team_scope.js'), MPLAN = SIGN.planOf(rd('modeller/team_plan.js')), EPLAN = SIGN.planOf(rd('erp/team_plan.js'));
function ts(src, plan, trust) { var g = { TEAM_PLAN: plan }; if (trust) g.TEAM_PLAN_TRUST = trust; vm.runInNewContext(src, { window: g, globalThis: g, TextEncoder: TextEncoder }); return g.TeamScope; }
function pub(k) { return { kty: k.publicJwk.kty, crv: k.publicJwk.crv, x: k.publicJwk.x, y: k.publicJwk.y }; }

async function arms(src, quiet) {
  var red = [], K1 = await SIGN.keygen(), K2 = await SIGN.keygen();
  function A(n, ok, l, d) { if (!ok) red.push(n); if (!quiet) say(ok, l, d); return ok; }
  var H = function (t) { if (!quiet) console.log(t); };
  var signed = await SIGN.sign(MPLAN, K1.privateJwk, K1.publicJwk), T1 = [pub(K1)];
  H('§W-SIGN-VERIFY');
  var t0 = ts(src, signed, T1);
  A('S0', typeof t0.verify === 'function' && typeof t0.state === 'function', 'TeamScope has verify() and state()');
  if (typeof t0.verify !== 'function') return red.concat(['S1-S10 (no verify)']);
  var st1 = await t0.verify(subtle);
  A('S1', st1 === 'ok' && t0.state() === 'ok' && JSON.stringify(t0.values('bim_element', 'geom_op')) === JSON.stringify(MPLAN.flows[0].payload.filter(function (p) { return p.col === 'geom_op'; })[0].values), 'a plan signed by the trusted key verifies ok and the scope answers are the unsigned ones', 'state=' + st1);
  var tam = clone(signed); tam.flows[0].payload.filter(function (p) { return p.col === 'geom_op'; })[0].values.push('GEOM_FOO');
  var t2 = ts(src, tam, T1), st2 = await t2.verify(subtle);
  A('S2', st2 === 'invalid' && t2.values('bim_element', 'geom_op') === null && t2.state() === 'invalid', 'one list value added AFTER signing => invalid, and the scope is closed', 'state=' + st2 + ' values=' + JSON.stringify(t2.values('bim_element', 'geom_op')));
  var t3 = ts(src, signed, [pub(K2)]), st3 = await t3.verify(subtle);
  A('S3', st3 === 'untrusted' && t3.values('bim_element', 'geom_op') === null, 'signed by another key => untrusted, closed', 'state=' + st3);
  var h6 = clone(signed); h6.hash = '0'.repeat(64);
  var t6 = ts(src, h6, T1), st6 = await t6.verify(subtle);
  A('S6', st6 === 'invalid' && t6.values('bim_element', 'geom_op') === null, 'the signed hash field edited => invalid', 'state=' + st6);
  H('§W-SIGN-TRUST');
  var un = ts(src, MPLAN, T1), st4 = await un.verify(subtle);
  A('S4', st4 !== 'ok' && un.values('bim_element', 'geom_op') === null && un.scopeOf('x') === 'unplanned', 'an UNSIGNED plan with a trust list configured => closed', 'state=' + st4);
  var open = ts(src, MPLAN, null), st5 = await open.verify(subtle);
  A('S5', st5 === 'unsigned' && open.state() === 'unsigned' && open.values('bim_element', 'geom_op') !== null, 'no trust list: the unsigned plan still works and says so (state unsigned) — the merged hosts are unaffected', 'state=' + st5);
  var pend = ts(src, signed, T1), before = pend.values('bim_element', 'geom_op'), sb = pend.state();
  A('S9', before === null && sb !== 'ok', 'with a trust list, answers are CLOSED while the check is still pending (no window of unverified use)', 'state=' + sb + ' values=' + JSON.stringify(before));
  await pend.verify(subtle); A('S9', pend.values('bim_element', 'geom_op') !== null, 'and open once the check passes');
  H('§W-SIGN-FORM');
  var reord = JSON.parse(JSON.stringify(signed, null, 1)); var shuffled = {}; Object.keys(reord).reverse().forEach(function (k) { shuffled[k] = reord[k]; });
  var t7 = ts(src, shuffled, T1);
  A('S7', await t7.verify(subtle) === 'ok', 'the same plan with its keys re-ordered still verifies (the signature is over content, not text)');
  A('S8', SIGN.canon({ b: [1, { z: 1, a: 2 }], a: 'x' }) === '{"a":"x","b":[1,{"a":2,"z":1}]}', 'sign_plan.js canonical form is sorted-key JSON (the form TeamScope verifies against)');
  var big = await SIGN.sign(EPLAN, K1.privateJwk, K1.publicJwk), t10 = ts(src, big, T1), tt = Date.now(), st10 = await t10.verify(subtle);
  A('S10', st10 === 'ok' && t10.scopeOf('c_order') === 'share' && t10.scopeOf('ad_sequence') === 'station-local', 'the ERP plan (' + EPLAN.flows.length + ' tables + ' + EPLAN.local.length + ' local) signs and verifies; the scope answers are intact', st10 + ' in ' + (Date.now() - tt) + ' ms');
  return red;
}
// S11 — the browser's OWN WebCrypto (Chromium) verifies a plan signed here: a different implementation from the one that signed it
async function browserArm() {
  var pw; try { pw = require('playwright'); } catch (e) { try { pw = require('/home/red1/bim-ootb/tests/node_modules/playwright'); } catch (e2) { return null; } }
  var http = require('http'), srv = http.createServer(function (q, r) { r.writeHead(200, { 'Content-Type': 'text/html' }); r.end('<!doctype html><title>t</title>'); });
  await new Promise(function (r) { srv.listen(0, '127.0.0.1', r); });
  var br = await pw.chromium.launch({ args: ['--disable-gpu'] }), K1 = await SIGN.keygen(), K2 = await SIGN.keygen(), signed = await SIGN.sign(MPLAN, K1.privateJwk, K1.publicJwk);
  var tam = clone(signed); tam.flows[0].payload.filter(function (p) { return p.col === 'geom_op'; })[0].values.push('GEOM_FOO');
  try {
    var pg = await br.newPage(); await pg.goto('http://127.0.0.1:' + srv.address().port + '/');
    var res = await pg.evaluate(async function (a) {
      function run(plan, trust) { window.TEAM_PLAN = plan; window.TEAM_PLAN_TRUST = trust; (0, eval)(a.src); return window.TeamScope; }
      var out = {}; out.secure = window.isSecureContext;
      var T = run(a.signed, [a.k1]); out.ok = await T.verify(crypto.subtle); out.okValues = (T.values('bim_element', 'geom_op') || []).length;
      T = run(a.tam, [a.k1]); out.tampered = await T.verify(crypto.subtle); out.tamperedValues = T.values('bim_element', 'geom_op');
      T = run(a.signed, [a.k2]); out.untrusted = await T.verify(crypto.subtle);
      return out; }, { src: READER, signed: signed, tam: tam, k1: pub(K1), k2: pub(K2) });
    return res;
  } finally { await br.close(); srv.close(); }
}
(async function () {
  var B = await browserArm();
  if (B === null) console.log('   ⚪ INCONCLUSIVE S11 — Playwright not available'); else say(B.secure && B.ok === 'ok' && B.okValues === 6 && B.tampered === 'invalid' && B.tamperedValues === null && B.untrusted === 'untrusted',
    'S11 Chromium\'s own WebCrypto verifies the plan signed here (ok, 6 values), rejects the tampered one (invalid, closed) and the other signer (untrusted)', JSON.stringify(B));
  console.log('§SIGN_START reader=' + OOTB + '/common/comm/team_scope.js · plans: modeller 1 flow, erp ' + EPLAN.flows.length + ' tables');
  var red0 = await arms(READER, false);
  console.log('§W-SIGN-MUTANTS (the reader is loaded with one rule broken; each must turn at least one arm red)');
  var M = [['verification skipped (always ok)', READER.replace(/(verify: async function[^\n]*\n)/, "$1    memo.v = { plan: global.TEAM_PLAN, s: 'ok' }; return 'ok';\n")],
    ['signer not matched against the trust list', READER.replace("same(P.signer, k)", 'true')], ['unsigned accepted under a trust list', READER.replace("if (!P.sig || !P.signer) return set('invalid');", "if (!P.sig || !P.signer) return set('ok');")],
    ['pending treated as open', READER.replace("memo.v.plan === P && memo.v.s === 'ok'", 'true')], ['canonicalisation order-sensitive', READER.replace("Object.keys(o).sort().map", 'Object.keys(o).map')]];
  for (var m of M) { var red; try { red = await arms(m[1], true); } catch (e) { red = ['THROW ' + e.message.slice(0, 40)]; } say(red.length > 0 && m[1] !== READER, m[0] + ' -> red arms: ' + (red.length ? Array.from(new Set(red)).join(', ') : 'NONE (survivor = hole)') + (m[1] === READER ? ' (MUTATION DID NOT APPLY)' : '')); }
  console.log('§SIGN_VERDICT ' + (fails || red0.length ? 'FAIL' : 'PASS') + ' judged=' + judged + ' fails=' + fails);
  process.exit(fails ? 1 : 0);
})();
