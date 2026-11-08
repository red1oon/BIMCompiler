#!/usr/bin/env node
// Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>. SPDX-License-Identifier: MIT
// Implementing prompts/MIGRATE_INSTALL_TENANT.md §A-MOCK — Witness: W-ODOO-MOCK-FIDELITY
// Issue it proves or disproves: "a recorded Odoo answers the migrate witnesses exactly as the real Odoo does, so they
//   can judge a frozen snapshot when Odoo is down or has drifted; and with no Odoo at all they say INCONCLUSIVE."
// Needs the real Odoo up on :8069 (record step). Run: node scripts/poc_odoo_mock_fidelity.js
'use strict';
var cp = require('child_process'), fs = require('fs'), path = require('path');
var ROOT = path.join(__dirname, '..');
var FIX = process.env.FIXTURE || path.join(ROOT, 'build/erp/odoo_fixture/odoodemo_' + new Date().toISOString().slice(0, 10) + '.json');
var MOCK = path.join(__dirname, 'odoo_mock/odoo_rpc_mock.js');
var POCS = ['poc_p4_masters', 'poc_odoo_full_pull', 'poc_migrate_postcfg', 'poc_migrate_postcfg_odoo'];
var log = [], fails = 0;
function L(s) { console.log(s); log.push(s); }
function ok(c, m) { if (!c) fails++; L('  ' + (c ? '✓' : '✗ FAIL:') + ' ' + m); }
function sleep(ms) { cp.spawnSync('sleep', [String(ms / 1000)]); }

function run(poc, port) {
  var r = cp.spawnSync('node', [path.join(__dirname, poc + '.js')], { env: Object.assign({}, process.env, { ODOO_PORT: String(port) }), encoding: 'utf8', timeout: 300000 });
  var out = (r.stdout || '') + (r.stderr || '');
  // the judged lines; "(odoodemo down …)" notes and the source label are not verdicts
  var lines = out.split('\n').filter(function (l) { return /^\s*(§|✓|✗|🟢|🔴|⚪)/.test(l); });
  return { code: r.status, lines: lines, out: out };
}
function startMock(mode, fix) {
  var p = cp.spawn('node', [MOCK, mode, fix], { stdio: ['ignore', 'pipe', 'pipe'] });
  p.buf = ''; p.stdout.on('data', function (c) { p.buf += c; });
  sleep(800); return p;
}
function stopMock(p) { return new Promise(function (res) { p.on('exit', function () { res(p.buf); }); p.kill('SIGTERM'); }); }

(async function () {
  L('══ W-ODOO-MOCK-FIDELITY — recorded Odoo == real Odoo for the migrate witnesses ══');
  var live = {}, rep = {};
  POCS.forEach(function (p) { live[p] = run(p, 8069); L('§LIVE ' + p + ' exit=' + live[p].code + ' judged_lines=' + live[p].lines.length); });
  ok(POCS.every(function (p) { return live[p].lines.length > 0; }), 'every poc produced judged lines live (not vacuous)');

  if (fs.existsSync(FIX)) fs.unlinkSync(FIX);
  var rec = startMock('record', FIX);
  POCS.forEach(function (p) { run(p, 8070); });
  L((await stopMock(rec)).trim().split('\n').pop());

  var repM = startMock('replay', FIX);
  POCS.forEach(function (p) { rep[p] = run(p, 8070); });
  var repOut = await stopMock(repM);
  var miss = (repOut.match(/§ODOO-MOCK MISS/g) || []).length;
  L(repOut.trim().split('\n').pop());
  ok(miss === 0, 'replay answered every call from the recording (MISS=' + miss + ')');

  POCS.forEach(function (p) {
    var same = live[p].code === rep[p].code && live[p].lines.join('\n') === rep[p].lines.join('\n');
    if (!same) { var d = live[p].lines.filter(function (l, i) { return l !== rep[p].lines[i]; }).slice(0, 3); L('   diff ' + p + ': ' + JSON.stringify(d)); }
    ok(same, p + ' replay == live (exit ' + live[p].code + '/' + rep[p].code + ', ' + live[p].lines.length + ' lines)');
  });

  // A1: nothing listening → the two live-count witnesses must say INCONCLUSIVE (exit 3), not PASS
  ['poc_p4_masters', 'poc_odoo_full_pull'].forEach(function (p) {
    var r = run(p, 8099), inc = r.lines.some(function (l) { return /INCONCLUSIVE/.test(l); });
    L('§NO-ODOO ' + p + ' exit=' + r.code + ' inconclusive=' + (inc ? 'Y' : 'N'));
    ok((r.code === 3 && inc) || r.code === 1, p + ' with no Odoo → INCONCLUSIVE exit 3 (or a real FAIL), never PASS');
  });

  // FALSIFIER: one recorded number changed → the witness that reads it must change its verdict
  var fx = JSON.parse(fs.readFileSync(FIX, 'utf8')), tampered = null;
  Object.keys(fx.answers).some(function (k) {
    var a = fx.answers[k];
    if (/res\.partner\.search_count/.test(a.call) && typeof a.result === 'number') { tampered = a.call + ' ' + a.result + '→' + (a.result + 1); a.result += 1; return true; }
  });
  var TMP = FIX.replace(/\.json$/, '.tampered.json'); fs.writeFileSync(TMP, JSON.stringify(fx));
  var fm = startMock('replay', TMP), fr = run('poc_p4_masters', 8070); await stopMock(fm); fs.unlinkSync(TMP);
  L('§FALSIFIER tampered=' + tampered + ' p4 exit=' + fr.code + ' (replay exit ' + rep.poc_p4_masters.code + ')');
  ok(tampered && fr.lines.join('\n') !== rep.poc_p4_masters.lines.join('\n'), 'a changed recorded count changes the witness result (the recording is load-bearing)');

  var meta = JSON.parse(fs.readFileSync(FIX, 'utf8')).meta;
  L('§FIXTURE ' + path.relative(ROOT, FIX) + ' answers=' + meta.answers + ' sha256=' + meta.sha256_answers.slice(0, 16));
  L('\n' + (fails ? '🔴 W-ODOO-MOCK-FIDELITY FAIL (' + fails + ')' : '🟢 W-ODOO-MOCK-FIDELITY PASS'));
  fs.writeFileSync(path.join(ROOT, 'build/erp/logs_migrate_2026-11-08/poc_odoo_mock_fidelity.log'), log.join('\n'));
  process.exit(fails ? 1 : 0);
})();
