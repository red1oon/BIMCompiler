#!/usr/bin/env node
// Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>. SPDX-License-Identifier: MIT
// Implementing prompts/MIGRATE_INSTALL_TENANT.md §A-MOCK — Witness: W-ODOO-MOCK-FIDELITY
//
// Record / replay Odoo JSON-RPC answers so migrate witnesses judge a FROZEN snapshot of a real Odoo.
//   node scripts/odoo_mock/odoo_rpc_mock.js record [fixture]   # proxy :8070 -> real Odoo :8069, store every answer
//   node scripts/odoo_mock/odoo_rpc_mock.js replay [fixture]   # answer from the fixture only
// Env: MOCK_PORT (8070), ODOO_HOST (localhost), ODOO_UPSTREAM_PORT (8069).
// NON-INVENT: replay never makes up an answer. An unrecorded call gets a JSON-RPC error and a §ODOO-MOCK MISS line.
// The fixture is written on SIGINT/SIGTERM (record mode) and after every new answer.
'use strict';
var http = require('http'), fs = require('fs'), path = require('path'), crypto = require('crypto');

var MODE = process.argv[2];
var FIX = process.argv[3] || path.join(__dirname, '..', '..', 'build', 'erp', 'odoo_fixture', 'odoodemo.json');
var PORT = Number(process.env.MOCK_PORT || 8070);
var UP_HOST = process.env.ODOO_HOST || 'localhost', UP_PORT = Number(process.env.ODOO_UPSTREAM_PORT || 8069);
if (MODE !== 'record' && MODE !== 'replay') { console.error('usage: odoo_rpc_mock.js record|replay [fixture]'); process.exit(2); }

// key = sha256 of params with the password masked (common.login args[2], object.execute_kw args[2]).
function keyOf(params) {
  var p = JSON.parse(JSON.stringify(params || {}));
  if (Array.isArray(p.args) && p.args.length > 2 && (p.service === 'common' || p.service === 'object')) p.args[2] = '***';
  return crypto.createHash('sha256').update(JSON.stringify(p)).digest('hex');
}
function label(params) {
  var a = (params && params.args) || [];
  return params.service + '.' + params.method + (params.service === 'object' ? ' ' + a[3] + '.' + a[4] : '');
}

var fixture = { meta: {}, answers: {} };
if (fs.existsSync(FIX)) fixture = JSON.parse(fs.readFileSync(FIX, 'utf8'));
else if (MODE === 'replay') { console.log('§ODOO-MOCK NO-FIXTURE ' + FIX); process.exit(3); }
var stats = { hit: 0, miss: 0, recorded: 0 };

function save() {
  var body = JSON.stringify(fixture.answers);
  fixture.meta = { source: UP_HOST + ':' + UP_PORT, recorded_at: fixture.meta.recorded_at || new Date().toISOString(),
    answers: Object.keys(fixture.answers).length, sha256_answers: crypto.createHash('sha256').update(body).digest('hex') };
  fs.mkdirSync(path.dirname(FIX), { recursive: true });
  fs.writeFileSync(FIX, JSON.stringify(fixture, null, 0));
}

function reply(res, id, result, error) {
  var out = JSON.stringify(error ? { jsonrpc: '2.0', id: id, error: error } : { jsonrpc: '2.0', id: id, result: result });
  res.writeHead(200, { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(out) }); res.end(out);
}

http.createServer(function (req, res) {
  var buf = ''; req.on('data', function (c) { buf += c; }); req.on('end', function () {
    var j; try { j = JSON.parse(buf); } catch (e) { return reply(res, null, null, { code: -32700, message: 'parse error' }); }
    var k = keyOf(j.params), lab = label(j.params || {});
    if (MODE === 'replay' || fixture.answers[k]) {
      var a = fixture.answers[k];
      if (!a) { stats.miss++; console.log('§ODOO-MOCK MISS ' + lab + ' key=' + k.slice(0, 12));
        return reply(res, j.id, null, { code: 404, message: 'ODOO-MOCK MISS: call not recorded', data: { message: 'ODOO-MOCK MISS ' + lab } }); }
      stats.hit++; return reply(res, j.id, a.result, a.error);
    }
    // record: forward to the real Odoo
    var up = http.request({ host: UP_HOST, port: UP_PORT, path: '/jsonrpc', method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(buf) } }, function (ur) {
      var d = ''; ur.on('data', function (c) { d += c; }); ur.on('end', function () {
        var r; try { r = JSON.parse(d); } catch (e) { return reply(res, j.id, null, { code: -32603, message: 'upstream not JSON' }); }
        fixture.answers[k] = { call: lab, result: r.result, error: r.error };
        stats.recorded++; save(); reply(res, j.id, r.result, r.error);
      });
    });
    up.on('error', function (e) { reply(res, j.id, null, { code: -32603, message: 'upstream down: ' + e.message }); });
    up.write(buf); up.end();
  });
}).listen(PORT, function () { console.log('§ODOO-MOCK ' + MODE + ' port=' + PORT + ' fixture=' + FIX + ' answers=' + Object.keys(fixture.answers).length); });

function bye() { if (MODE === 'record') save();
  console.log('§ODOO-MOCK DONE mode=' + MODE + ' hit=' + stats.hit + ' miss=' + stats.miss + ' recorded=' + stats.recorded + ' answers=' + Object.keys(fixture.answers).length);
  process.exit(0); }
process.on('SIGINT', bye); process.on('SIGTERM', bye);
