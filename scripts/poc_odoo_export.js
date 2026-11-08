#!/usr/bin/env node
// Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>. SPDX-License-Identifier: MIT
// Implementing prompts/MIGRATE_INSTALL_TENANT.md §B1-SPEC — Witness: W-ODOO-EXPORT
// Issue it proves or disproves: "the user-run export (bim-ootb erp/odoo_agent/export.js) writes every Odoo master row
//   once, in load order, with every reference resolvable in an earlier file; it is repeatable from a recording; and a
//   missing parent row is caught, not silently exported."
// Run (real Odoo up on :8069 for the record step):  node scripts/poc_odoo_export.js [path/to/export.js]
'use strict';
var cp = require('child_process'), fs = require('fs'), path = require('path'), os = require('os'), crypto = require('crypto');
var ROOT = path.join(__dirname, '..');
var EXPORT = process.argv[2] || '/tmp/wt-odoo-export/erp/odoo_agent/export.js';
var FIX = path.join(ROOT, 'build/erp/odoo_fixture/odoodemo_export_2026-11-08.json');
var MOCK = path.join(__dirname, 'odoo_mock/odoo_rpc_mock.js');
var log = [], fails = 0;
function L(s) { console.log(s); log.push(s); }
function ok(c, m) { if (!c) fails++; L('  ' + (c ? '✓' : '✗ FAIL:') + ' ' + m); }
function sleep(s) { cp.spawnSync('sleep', [String(s)]); }
function runExport(port, dir) {
  fs.mkdirSync(dir, { recursive: true });
  var r = cp.spawnSync('node', [EXPORT], { cwd: dir, env: Object.assign({}, process.env, { ODOO_PORT: String(port), CUTOVER: '2026-11-08' }), encoding: 'utf8', timeout: 180000 });
  return { code: r.status, out: (r.stdout || '') + (r.stderr || '') };
}
function hashDir(d) {
  var h = crypto.createHash('sha256');
  fs.readdirSync(d).sort().forEach(function (f) { h.update(f); h.update(fs.readFileSync(path.join(d, f))); });
  return h.digest('hex').slice(0, 16);
}
function mock(mode, fix) { var p = cp.spawn('node', [MOCK, mode, fix], { stdio: ['ignore', 'pipe', 'pipe'] }); p.buf = ''; p.stdout.on('data', function (c) { p.buf += c; }); sleep(0.8); return p; }
function stop(p) { return new Promise(function (r) { p.on('exit', function () { r(p.buf); }); p.kill('SIGTERM'); }); }

(async function () {
  L('══ W-ODOO-EXPORT — user-run Odoo master-data export (' + EXPORT + ') ══');
  var T = fs.mkdtempSync(path.join(os.tmpdir(), 'odoo-export-'));
  var live = runExport(8069, path.join(T, 'live'));
  L('§LIVE exit=' + live.code); live.out.split('\n').filter(function (l) { return /§ODOO-EXPORT (file|source)|✓|✗|🟢|🔴/.test(l); }).forEach(function (l) { L('   ' + l.trim()); });
  ok(live.code === 0, 'export self-check passes against the real Odoo (rows == live counts, refs resolve, keys unique)');
  var m = JSON.parse(fs.readFileSync(path.join(T, 'live/odoo_export/manifest.json'), 'utf8'));
  ok(m.files.length === 11 && fs.existsSync(path.join(T, 'live/odoo_export/provenance.json')) && m.files.every(function (f) { return f.rows > 0; }), 'manifest lists 11 non-empty files + provenance.json (not vacuous): ' + m.files.map(function (f) { return f.file.split('_')[0] + '=' + f.rows; }).join(' '));

  var hdrBad = fs.readdirSync(path.join(T, 'live/odoo_export')).filter(function (f) { return /\.csv$/.test(f) && /(^|,)odoo_/.test(fs.readFileSync(path.join(T, 'live/odoo_export', f), 'utf8').split('\n')[0]); });
  var prov = JSON.parse(fs.readFileSync(path.join(T, 'live/odoo_export/provenance.json'), 'utf8'));
  var provOk = m.files.every(function (f) { return prov[f.file] && prov[f.file].length === f.rows && prov[f.file].every(function (o) { return o.id || o.uom; }); });
  ok(hdrBad.length === 0, 'no CSV header carries a non-iDempiere (odoo_*) column — legacy validateFile needs the exact template header (' + hdrBad.join(',') + ')');
  ok(provOk, 'provenance.json maps every row of every file back to its Odoo record');
  if (fs.existsSync(FIX)) fs.unlinkSync(FIX);
  var rec = mock('record', FIX); runExport(8070, path.join(T, 'rec')); L((await stop(rec)).trim().split('\n').pop());
  var rep = mock('replay', FIX); var r2 = runExport(8070, path.join(T, 'rep')); var repOut = await stop(rep);
  L(repOut.trim().split('\n').pop());
  ok(!/MISS/.test(repOut) && r2.code === 0, 'replay from the recording answers every call');
  var hl = hashDir(path.join(T, 'live/odoo_export')), hr = hashDir(path.join(T, 'rep/odoo_export'));
  ok(hl === hr, 'replay export is byte-identical to the live export (sha ' + hl + ' == ' + hr + ')');
  var r3 = runExport(8069, path.join(T, 'live2'));
  ok(hashDir(path.join(T, 'live2/odoo_export')) === hl, 'two live runs give the same files (deterministic)');

  // FALSIFIER: the recording loses one product category → products that need it must be NAMED, export must fail
  var fx = JSON.parse(fs.readFileSync(FIX, 'utf8')), dropped = null;
  Object.keys(fx.answers).some(function (k) { var a = fx.answers[k];
    if (/product\.category\.search_read/.test(a.call) && Array.isArray(a.result) && a.result.length > 1) {
      var used = a.result.find(function (c) { return /Office Furniture/.test(c.complete_name); }) || a.result[a.result.length - 1];
      dropped = used.complete_name; a.result = a.result.filter(function (c) { return c !== used; }); return true; } });
  var TMP = FIX.replace(/\.json$/, '.tampered.json'); fs.writeFileSync(TMP, JSON.stringify(fx));
  var fm = mock('replay', TMP); var rf = runExport(8070, path.join(T, 'fals')); await stop(fm); fs.unlinkSync(TMP);
  var line = (rf.out.match(/every product category[^\n]*/) || [''])[0];
  L('§FALSIFIER dropped category "' + dropped + '" → exit=' + rf.code + ' | ' + line.trim());
  ok(rf.code !== 0 && /✗|FAIL/.test(rf.out) && !/ 0 missing/.test(line), 'a missing parent category is caught (export fails, missing count > 0)');

  L('§FIXTURE ' + path.relative(ROOT, FIX) + ' answers=' + JSON.parse(fs.readFileSync(FIX, 'utf8')).meta.answers);
  L('\n' + (fails ? '🔴 W-ODOO-EXPORT FAIL (' + fails + ')' : '🟢 W-ODOO-EXPORT PASS'));
  fs.writeFileSync(path.join(ROOT, 'build/erp/logs_migrate_2026-11-08/poc_odoo_export.log'), log.join('\n'));
  process.exit(fails ? 1 : 0);
})();
