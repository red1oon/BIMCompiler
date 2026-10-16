#!/usr/bin/env node
// Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
// SPDX-License-Identifier: MIT
// ⚠ DO NOT REMOVE — prompts/AGENT_QUEUE.md §DICT-LAZY (owns §ERP-SESSION-CLOSE §CLOSE.4 item 2).
// THE CLAIM UNDER TEST — the user's own rule, 2026-09-04: "nothing non-core is fetched unless asked for":
//
//   A. the DEFAULT boot never fetches odoo_descriptor.js at all, and the chrome still boots on AD;
//   B. ?erp=odoo fetches it exactly once, registers the second dictionary, and makes it active.
//
// This is a NETWORK claim, so it is judged on the network — every request the page issues is counted by
// URL. A §-log line alone could not prove A: "not registered" and "not fetched" are different facts, and
// the whole point of the item is the FETCH, not the registration ("kernel purity, not perf").
// 0 pageerrors is asserted on both runs, because the lazy path evaluates the module itself.
//
// A break is a real finding, not a script bug — read the log, don't assume PASS from exit code.
// Run: WITNESS_ROOT=/home/red1/bim-ootb node scripts/witness_dict_lazy.js
'use strict';
var path = require('path'), http = require('http'), fs = require('fs');
var ROOT = process.env.WITNESS_ROOT || '/home/red1/bim-ootb';
var MIME = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.css': 'text/css',
  '.db': 'application/octet-stream', '.wasm': 'application/wasm' };
function reqPw() { try { return require('playwright'); } catch (e) { return require('/home/red1/bim-ootb/tests/node_modules/playwright'); } }
function log(m) { console.log('   ' + m); }

var claims = [];
function claim(ok, label, detail) {
  claims.push({ ok: ok, label: label });
  console.log('   ' + (ok ? '🟢' : '🔴') + ' ' + label + (detail ? ' — ' + detail : ''));
}

// boot — load the app once and report what it fetched, what it logged and whether it threw.
async function boot(browser, port, query, tag) {
  var page = await browser.newPage();
  var reqs = [], logs = [], errs = [];
  page.on('request', function (r) { reqs.push(r.url()); });
  page.on('console', function (m) { var t = m.text(); logs.push(t); if (/^§DICT-LAZY|^§ODOO-DESCRIPTOR/.test(t)) log('[' + tag + '] ' + t); });
  page.on('pageerror', function (e) { errs.push(String(e).slice(0, 200)); });
  var q = Object.keys(query).map(function (k) { return k + '=' + encodeURIComponent(query[k]); }).join('&');
  await page.goto('http://localhost:' + port + '/erp/idempiere.html?' + q, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  var state = await page.evaluate(function () {
    var D = window.ErpDescriptor;
    return {
      registered: (D && typeof D.list === 'function') ? D.list() : null,
      active: (D && typeof D.activeName === 'function') ? D.activeName() : ((D && D.active && D.active.id) || null),
      hasOdooGlobal: typeof window.OdooStructure !== 'undefined'
    };
  });
  var hits = reqs.filter(function (u) { return /odoo_descriptor\.js/.test(u); });
  await page.close();
  return { reqs: reqs, logs: logs, errs: errs, state: state, descriptorFetches: hits.length,
           dictLine: logs.filter(function (l) { return /^§DICT-LAZY asked=/.test(l); }).pop() || '(none)' };
}

(async function () {
  var server = http.createServer(function (req, res) {
    var p = decodeURIComponent(req.url.split('?')[0]);
    var fp = path.join(ROOT, p);
    if (!fp.startsWith(ROOT) || !fs.existsSync(fp) || fs.statSync(fp).isDirectory()) { res.writeHead(404); res.end('nf'); return; }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(fp)] || 'application/octet-stream' });
    fs.createReadStream(fp).pipe(res);
  });
  await new Promise(function (r) { server.listen(0, r); });
  var port = server.address().port;
  var browser = await reqPw().chromium.launch();
  var harnessThrew = false;

  try {
    console.log('\n═══ A — the DEFAULT boot (no ?erp) must not fetch a second dictionary ═══\n');
    var a = await boot(browser, port, { login: 'GardenAdmin' }, 'default');
    console.log('§DICT-LAZY-WITNESS mode=default fetches=' + a.descriptorFetches +
                ' registered=[' + (a.state.registered || []).join(',') + '] active=' + a.state.active +
                ' odooGlobal=' + a.state.hasOdooGlobal + ' totalRequests=' + a.reqs.length + ' pageerrors=' + a.errs.length);
    log(a.dictLine);
    claim(a.descriptorFetches === 0, 'A1: odoo_descriptor.js is NEVER requested on the default boot', 'fetches=' + a.descriptorFetches);
    claim(!!a.state.registered && a.state.registered.indexOf('odoo') < 0, 'A2: the odoo dictionary is not registered', 'registered=[' + (a.state.registered || []).join(',') + ']');
    claim(a.state.active === 'ad', 'A3: the chrome still boots on the AD dictionary', 'active=' + a.state.active);
    claim(a.errs.length === 0, 'A4: 0 pageerrors on the default boot', a.errs.join(' | '));

    console.log('\n═══ B — ?erp=odoo must fetch it, exactly once, and make it active ═══\n');
    var b = await boot(browser, port, { login: 'GardenAdmin', erp: 'odoo' }, 'odoo');
    console.log('§DICT-LAZY-WITNESS mode=odoo fetches=' + b.descriptorFetches +
                ' registered=[' + (b.state.registered || []).join(',') + '] active=' + b.state.active +
                ' odooGlobal=' + b.state.hasOdooGlobal + ' totalRequests=' + b.reqs.length + ' pageerrors=' + b.errs.length);
    log(b.dictLine);
    claim(b.descriptorFetches === 1, 'B1: ?erp=odoo requests odoo_descriptor.js exactly once', 'fetches=' + b.descriptorFetches);
    claim(!!b.state.registered && b.state.registered.indexOf('odoo') >= 0 && b.state.registered.indexOf('ad') >= 0,
      'B2: BOTH dictionaries are registered after the lazy load', 'registered=[' + (b.state.registered || []).join(',') + ']');
    claim(b.state.active === 'odoo', 'B3: the odoo dictionary is the ACTIVE one', 'active=' + b.state.active);
    claim(b.state.hasOdooGlobal === true, 'B4: the module really evaluated (window.OdooStructure is present)', 'odooGlobal=' + b.state.hasOdooGlobal);
    claim(b.errs.length === 0, 'B5: 0 pageerrors on the lazy path', b.errs.join(' | '));
    claim(!!b.logs.filter(function (l) { return /^§DICT-LAZY loaded=odoo/.test(l); }).length,
      'B6: the lazy load announces itself in the §-log', (b.logs.filter(function (l) { return /^§DICT-LAZY loaded=odoo/.test(l); })[0] || '(no §DICT-LAZY loaded line)'));
  } catch (e) {
    harnessThrew = true;
    console.log('🔴 HARNESS THREW: ' + e.message);
  } finally {
    await browser.close();
    server.close();
  }

  console.log('\n═══ SUMMARY ═══\n');
  var pass = claims.filter(function (c) { return c.ok; }).length, fail = claims.length - pass;
  claims.forEach(function (c) { console.log('  ' + (c.ok ? 'PASS' : 'FAIL') + ' ' + c.label); });
  if (!claims.length) console.log('\n🔴 W-DICT-LAZY INCONCLUSIVE — no claim was judged (a 0 here means nothing)');
  else if (fail === 0) console.log('\n🟢 W-DICT-LAZY PASS — ' + pass + ' PASS / 0 FAIL: a non-core dictionary is fetched only when asked for by name, and still works when it is');
  else console.log('\n🔴 W-DICT-LAZY FAIL — ' + pass + ' PASS / ' + fail + ' FAIL');
  console.log('\nHarness completed to the end: ' + (!harnessThrew) + ' (exit code reflects HARNESS health only — read the claims above)');
  process.exit(harnessThrew ? 1 : 0);
})();
