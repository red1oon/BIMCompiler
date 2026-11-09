#!/usr/bin/env node
// Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>. SPDX-License-Identifier: MIT
// Implementing prompts/MIGRATE_INSTALL_TENANT.md §OWN-DB-SPEC — Witness: W-ODOO-OWNDB
// Issue it proves or disproves: "a user can point the Odoo agent at THEIR OWN Odoo with flags (any shell), the password is
//   asked in the terminal (never a flag, never the browser), the one-order check picks a real order of that Odoo, and the
//   demo path is unchanged."  Needs the real Odoo on :8069 (odoodemo, users admin/admin and demo/demo).
// Run: node scripts/poc_odoo_owndb.js [path/to/odoo_agent]
'use strict';
var cp = require('child_process'), fs = require('fs'), path = require('path'), os = require('os'), crypto = require('crypto'), http = require('http');
var ROOT = path.join(__dirname, '..'), AG = process.argv[2] || '/tmp/wt-odoo-export/erp/odoo_agent';
var MOCK = path.join(__dirname, 'odoo_mock/odoo_rpc_mock.js');
var log = [], fails = 0;
function L(s) { console.log(s); log.push(s); }
function ok(c, m) { if (!c) fails++; L('  ' + (c ? '✓' : '✗ FAIL:') + ' ' + m); }
function run(script, args, stdin, env, cwd) {
  var r = cp.spawnSync('node', [path.join(AG, script)].concat(args), { cwd: cwd, input: stdin, encoding: 'utf8', timeout: 180000,
    env: Object.assign({}, process.env, { ODOO_PASSWORD: undefined, NODE_PATH: path.join(process.env.HOME, 'bim-ootb/node_modules') }, env || {}) });   // NODE_PATH = the bundle's one dependency (sql.js), as `npm install` gives a user
  return { code: r.status, out: (r.stdout || '') + (r.stderr || '') };
}
function line(out, re) { return (out.match(re) || [''])[0]; }
function rpc(service, method, args) {
  return new Promise(function (res, rej) {
    var b = JSON.stringify({ jsonrpc: '2.0', method: 'call', params: { service: service, method: method, args: args } });
    var q = http.request({ host: 'localhost', port: 8069, path: '/jsonrpc', method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(b) } },
      function (x) { var d = ''; x.on('data', function (c) { d += c; }); x.on('end', function () { var j = JSON.parse(d); j.error ? rej(new Error(JSON.stringify(j.error.data.message))) : res(j.result); }); });
    q.on('error', rej); q.write(b); q.end();
  });
}
function hashDir(d) { var h = crypto.createHash('sha256'); fs.readdirSync(d).sort().forEach(function (f) { h.update(f); h.update(fs.readFileSync(path.join(d, f))); }); return h.digest('hex').slice(0, 16); }
delete process.env.ODOO_PASSWORD;

(async function () {
  L('══ W-ODOO-OWNDB — point the agent at your own Odoo (' + AG + ') ══');
  var T = fs.mkdtempSync(path.join(os.tmpdir(), 'odoo-owndb-')), d = function (n) { var p = path.join(T, n); fs.mkdirSync(p); return p; };
  // independent oracle for the pick: the most recent sale order (date_order desc, id desc) that has a posted customer invoice
  //   — asked AS THE SAME USER the agent runs as (demo/demo): Odoo shows each user only the records its rules allow
  var uid = await rpc('common', 'login', ['odoodemo', 'demo', 'demo']);
  var ex = function (m, me, a, k) { return rpc('object', 'execute_kw', ['odoodemo', uid, 'demo', m, me, a, k || {}]); };
  var invd = await ex('account.move', 'search_read', [[['move_type', '=', 'out_invoice'], ['state', '=', 'posted'], ['invoice_origin', '!=', false]]], { fields: ['invoice_origin'] });
  var sos = await ex('sale.order', 'search_read', [[['name', 'in', Array.from(new Set(invd.map(function (m) { return m.invoice_origin; })))]]], { fields: ['name', 'date_order', 'id'] });
  sos.sort(function (a, b) { return a.date_order < b.date_order ? 1 : a.date_order > b.date_order ? -1 : b.id - a.id; });
  var EXPECT = sos.length ? sos[0].name : null;
  L('§ORACLE latest invoiced order=' + EXPECT + ' of ' + sos.length + ' invoiced orders');

  var A = run('agent.js', [], '', {}, d('a'));
  L('§A ' + line(A.out, /§ODOO-AGENT target[^\n]*/) + ' | exit=' + A.code);
  ok(A.code === 0 && /demo=Y password=demo-default/.test(A.out) && /SO S00023|S00023/.test(A.out) && !/picked=/.test(A.out), 'demo path unchanged: no flags → odoodemo, no password prompt, order S00023, PASS');

  var B = run('agent.js', ['--login', 'demo'], 'demo\n', {}, d('b'));
  var picked = (B.out.match(/so=(\S+) picked=latest-invoiced/) || [])[1];
  L('§B ' + line(B.out, /§ODOO-AGENT target[^\n]*/) + ' | picked=' + picked + ' | exit=' + B.code);
  ok(B.code === 0 && /login=demo demo=N password=prompt/.test(B.out) && /Odoo password \(or API key[^)]*\) for demo @ odoodemo/.test(B.out), 'own login by FLAG: the agent asked for the password in the terminal and logged in');
  ok(picked && picked === EXPECT, 'no --so on a non-demo target → picks the latest invoiced order of THAT Odoo (' + picked + ' == oracle ' + EXPECT + ')');

  // the pick judged on a REAL choice: as admin (sees every invoiced order), --so latest must pick the newest of them
  var uidA = await rpc('common', 'login', ['odoodemo', 'admin', 'admin']);
  var exA = function (m, me, a, k) { return rpc('object', 'execute_kw', ['odoodemo', uidA, 'admin', m, me, a, k || {}]); };
  var invA = await exA('account.move', 'search_read', [[['move_type', '=', 'out_invoice'], ['state', '=', 'posted'], ['invoice_origin', '!=', false]]], { fields: ['invoice_origin'] });
  var soA = await exA('sale.order', 'search_read', [[['name', 'in', Array.from(new Set(invA.map(function (m) { return m.invoice_origin; })))]]], { fields: ['name', 'date_order', 'id'] });
  soA.sort(function (a, b) { return a.date_order < b.date_order ? 1 : a.date_order > b.date_order ? -1 : b.id - a.id; });
  var B2 = run('agent.js', ['--so', 'latest'], '', {}, d('b2')), picked2 = (B2.out.match(/so=(\S+) picked=latest-invoiced/) || [])[1];
  L('§B2 admin --so latest picked=' + picked2 + ' oracle=' + (soA[0] && soA[0].name) + ' of ' + soA.length + ' | exit=' + B2.code);
  ok(B2.code === 0 && soA.length > 1 && picked2 === soA[0].name, '--so latest picks the newest invoiced order among ' + soA.length + ' (' + picked2 + ')');
  var C = run('agent.js', ['--login', 'demo'], 'not-the-password\n', {}, d('c'));
  L('§C exit=' + C.code + ' ' + line(C.out, /§ODOO-AGENT FAIL[^\n]*/));
  ok(C.code === 1 && /§ODOO-AGENT FAIL auth/.test(C.out), 'a wrong password is refused by Odoo → exit 1, nothing written');

  var D = run('export.js', ['--password', 'x'], '', {}, d('d'));
  ok(D.code !== 0 && /--password is not accepted/.test(D.out), '--password on the command line is refused (it would sit in the shell history)');

  var E = run('agent.js', ['--login', 'demo', '--so', 'S00023'], '', { ODOO_PASSWORD: 'demo' }, d('e'));
  ok(E.code === 0 && /password=env/.test(E.out) && !/Odoo password/.test(E.out), 'ODOO_PASSWORD in the environment → no prompt (unattended runs still work)');

  // flags reach the RPC: --port routes through the recording proxy, and the login it saw is the one given
  var FIX = path.join(T, 'owndb_fix.json'), m = cp.spawn('node', [MOCK, 'record', FIX], { stdio: ['ignore', 'pipe', 'pipe'] }); cp.spawnSync('sleep', ['0.8']);
  var F = run('export.js', ['--port', '8070', '--host', 'localhost', '--cutover', '2026-11-08'], '', {}, d('f'));
  await new Promise(function (r) { m.on('exit', r); m.kill('SIGTERM'); });
  var calls = Object.values(JSON.parse(fs.readFileSync(FIX, 'utf8')).answers).map(function (a) { return a.call; });
  L('§F ' + line(F.out, /§ODOO-EXPORT target[^\n]*/) + ' | proxied calls=' + calls.length + ' exit=' + F.code);
  ok(F.code === 0 && /host=localhost:8070/.test(F.out) && calls.length >= 30 && fs.existsSync(path.join(T, 'f', 'odoo_export', 'manifest.json')), 'flags reach the RPC: --port 8070 sent every call (' + calls.length + ') through the proxy and the export completed');
  // a login WITHOUT accounting rights (demo): Odoo refuses a read → the export says which, in plain words, and leaves NOTHING behind
  var H = run('export.js', ['--login', 'demo'], 'demo\n', {}, d('h'));
  var left = fs.readdirSync(path.join(T, 'h'));
  L('§H exit=' + H.code + ' ' + line(H.out, /§ODOO-EXPORT FAIL access[^.]*/) + ' | left=' + JSON.stringify(left));
  ok(H.code === 1 && /FAIL access: the Odoo user cannot read/.test(H.out) && /Odoo says:/.test(H.out) && left.length === 0, 'a login without the rights → plain refusal naming the Odoo record type, exit 1, no half-written export left');

  var G = run('export.js', ['--cutover', '2026-11-08'], '', {}, d('g'));
  var hg = hashDir(path.join(T, 'g', 'odoo_export'));
  // §HARDEN-SPEC (2026-11-09) changed the export ON PURPOSE (login's company only, C_Location_UU, archived = inactive, cut keys): was fdbde73d75c0d07b (#2715)
  L('§G demo export sha=' + hg + ' (after §HARDEN-SPEC: bf33a79179e2b052)');
  ok(G.code === 0 && hg === 'bf33a79179e2b052', 'demo export files byte-identical to the §HARDEN-SPEC export judged by W-SHEET-CONTRACT');

  L('\n' + (fails ? '🔴 W-ODOO-OWNDB FAIL (' + fails + ')' : '🟢 W-ODOO-OWNDB PASS'));
  fs.writeFileSync(path.join(ROOT, 'build/erp/logs_migrate_2026-11-08/poc_odoo_owndb.log'), log.join('\n'));
  process.exit(fails ? 1 : 0);
})().catch(function (e) { L('§OWNDB ERROR ' + e.message); process.exit(2); });
