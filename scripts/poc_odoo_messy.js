#!/usr/bin/env node
// Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>. SPDX-License-Identifier: MIT
// ⚠ DO NOT REMOVE — W-ODOO-MESSY, export half (prompts/MIGRATE_INSTALL_TENANT.md §HARDEN-SPEC). READ THE LOG (build/erp/logs_migrate_2026-11-09/poc_odoo_messy.log): every
//   claim is a ✓/✗ line; the exit code is not the evidence. Exit 0 PASS · 1 FAIL · 3 INCONCLUSIVE (no Odoo db odoo_messy and no recording).
// THE ISSUE it proves/disproves: the export the user runs must survive a REAL Odoo's data. Measured before the fix (origin/main 16b3c205): a customer with a country and no street,
//   two customers on one street → FAIL (the address was found by its street text); a contact of an archived company → crash. Here, against the scratch db odoo_messy
//   (scripts/odoo_mock/make_odoo_messy.sh: odoodemo + 8 states Odoo itself accepts): the OLD exporter fails (the issue is real), the NEW one passes and writes the SAME workbook the
//   bim-ootb load half (erp/tests/witness_odoo_messy.js) loads into the ERP. Also: --company, a missing Odoo field (version), https (Odoo.sh / Online) through a TLS proxy.
// Run: node scripts/poc_odoo_messy.js <bim-ootb erp/odoo_agent dir> [<old exporter dir>]   (live Odoo with odoo_messy records a fresh fixture; else replays it)
'use strict';
var fs = require('fs'), path = require('path'), cp = require('child_process'), crypto = require('crypto'), os = require('os'), https = require('https'), http = require('http');
var ROOT = path.join(__dirname, '..'), AG = process.argv[2] || '/tmp/wt-odoo-harden/erp/odoo_agent', OLD = process.argv[3] || '';
// ── SUPERSEDED 2026-11-10 (bim-ootb #2809, prompts/MIGRATE_INSTALL_TENANT.md §ODOO-ENGINE-SPEC O3c): the Odoo agent no longer writes the workbook this witness judges — it only
//   reads and writes odoo_export.json; the mapping is DATA in the browser (migrate/templates/odoo-17.json). The messy cases (shared street, no street, archived company,
//   repeated and over-long codes, several companies) are generated and judged against the frozen hand mapping by W-MIGRATE-ENGINE ODOO-DIFF (69/69 branches); the scratch
//   database odoo_messy itself was dropped 2026-11-09 (ODOO-REF-MESSY is INCONCLUSIVE for that reason). Against a reads-only agent this witness says INCONCLUSIVE (exit 3).
(function () { try { var _ag = path.join(AG, 'export.js'); if (!/odoo_migration\.xlsx/.test(fs.readFileSync(_ag, 'utf8'))) {
  console.log('§ODOO-MESSY-EXPORT verdict=INCONCLUSIVE — SUPERSEDED: ' + _ag + ' writes odoo_export.json only; see W-MIGRATE-ENGINE ODOO-DIFF (bim-ootb erp/tests/witness_migrate_engine.js)'); process.exit(3); } } catch (e) {} })();
var MOCK = path.join(__dirname, 'odoo_mock', 'odoo_rpc_mock.js'), FIX = path.join(ROOT, 'build/erp/odoo_fixture/odoo_messy_2026-11-09.json');
var LOAD_FIX = path.join(AG, '..', 'tests', 'fixtures', 'odoo_export_messy_2026-11-09');
var LOGF = path.join(ROOT, 'build/erp/logs_migrate_2026-11-09/poc_odoo_messy.log'), log = [], fails = 0, judged = 0;
function L(s) { console.log(s); log.push(s); }
function ok(c, m, d) { judged++; if (!c) fails++; L('  ' + (c ? '✓' : '✗ FAIL:') + ' ' + m + (d ? ' — ' + d : '')); }
function finish(code, v) { L('\n' + v); fs.mkdirSync(path.dirname(LOGF), { recursive: true }); fs.writeFileSync(LOGF, log.join('\n') + '\n'); process.exit(code); }
function sleep(s) { cp.spawnSync('sleep', [String(s)]); }
var T = fs.mkdtempSync(path.join(os.tmpdir(), 'om-'));
function run(dir, agentDir, args, env) {
  fs.mkdirSync(dir, { recursive: true });
  var r = cp.spawnSync('node', [path.join(agentDir, 'export.js')].concat(args || []), { cwd: dir, env: Object.assign({}, process.env, { ODOO_PASSWORD: 'admin' }, env || {}), encoding: 'utf8', timeout: 240000 });
  return { code: r.status, out: (r.stdout || '') + (r.stderr || ''), dir: path.join(dir, 'odoo_export') };
}
var BASE = ['--port', '8070', '--db', 'odoo_messy', '--login', 'admin', '--cutover', '2026-11-09'];
function mock(mode, fix) { var p = cp.spawn('node', [MOCK, mode, fix], { stdio: ['ignore', 'pipe', 'pipe'] }); p.buf = ''; p.stdout.on('data', function (c) { p.buf += c; }); sleep(0.8); return p; }
function stop(p) { return new Promise(function (r) { p.on('exit', function () { r(p.buf); }); p.kill('SIGTERM'); }); }
function sha(f) { return crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex').slice(0, 16); }
function rpcUp(db) { var r = cp.spawnSync('curl', ['-s', '--max-time', '5', '-H', 'Content-Type: application/json', '-d', JSON.stringify({ jsonrpc: '2.0', method: 'call', params: { service: 'db', method: 'list', args: [] } }), 'http://localhost:8069/jsonrpc'], { encoding: 'utf8' });
  return (r.stdout || '').indexOf('"' + db + '"') >= 0; }
function line(out, re) { var m = out.match(re); return m ? m[0].slice(0, 260) : '(none)'; }

(async function () {
  L('══ W-ODOO-MESSY export half — ' + AG + ' ══');
  var mode;
  if (!OLD) try { var od = path.join(T, 'old'); fs.mkdirSync(od);   // the exporter before §HARDEN-SPEC (bim-ootb 16b3c205) = the falsifier: the issue was real
    ['export.js', 'cli.js'].forEach(function (f) { fs.writeFileSync(path.join(od, f), cp.execSync('git -C ' + path.join(AG, '..', '..') + ' show 16b3c205:erp/odoo_agent/' + f, { stdio: ['ignore', 'pipe', 'ignore'] })); });
    fs.copyFileSync(path.join(AG, 'xlsx.mini.min.js'), path.join(od, 'xlsx.mini.min.js')); OLD = od; } catch (e) { L('§OLD unavailable (no bim-ootb history here): the falsifier is not judged'); }
  if (process.env.OM_MODE !== 'replay' && rpcUp('odoo_messy')) {
    mode = 'live';
    var rec = mock('record', FIX);
    var A0 = run(path.join(T, 'old0'), OLD, BASE), N0 = run(path.join(T, 'new0'), AG, BASE);
    var C3 = run(path.join(T, 'c3'), AG, BASE.concat(['--company', '3'])), C9 = run(path.join(T, 'c9'), AG, BASE.concat(['--company', '99']));
    L('§RECORD ' + (await stop(rec)).trim().split('\n').pop());
  } else if (fs.existsSync(FIX)) mode = 'replay';
  else { L('§NO-ODOO no Odoo db odoo_messy on :8069 and no recording ' + path.relative(ROOT, FIX)); finish(3, '⚪ W-ODOO-MESSY INCONCLUSIVE — nothing to judge'); }
  L('§OM-MODE ' + mode);
  var rp = mock('replay', FIX);
  var N = run(path.join(T, 'new'), AG, BASE), A = OLD ? run(path.join(T, 'old'), OLD, BASE) : null;
  var C3r = run(path.join(T, 'c3r'), AG, BASE.concat(['--company', '3'])), C9r = run(path.join(T, 'c9r'), AG, BASE.concat(['--company', '99']));
  // H5: https — a TLS proxy (self-signed localhost cert, trusted through NODE_EXTRA_CA_CERTS) in front of the replay
  var key = path.join(T, 'k.pem'), crt = path.join(T, 'c.pem');
  var gen = cp.spawnSync('openssl', ['req', '-x509', '-newkey', 'rsa:2048', '-nodes', '-keyout', key, '-out', crt, '-days', '1', '-subj', '/CN=localhost', '-addext', 'subjectAltName=DNS:localhost'], { encoding: 'utf8' });
  var tls = null, H = null;
  if (gen.status === 0) {
    tls = https.createServer({ key: fs.readFileSync(key), cert: fs.readFileSync(crt) }, function (req, res) {
      var up = http.request({ host: 'localhost', port: 8070, path: req.url, method: req.method, headers: req.headers }, function (r) { res.writeHead(r.statusCode, r.headers); r.pipe(res); });
      req.pipe(up); });
    await new Promise(function (r) { tls.listen(8443, r); });
    H = await new Promise(function (resolve) { var c = cp.spawn('node', [path.join(AG, 'export.js'), '--url', 'https://localhost:8443', '--db', 'odoo_messy', '--login', 'admin', '--cutover', '2026-11-09'],
      { cwd: (fs.mkdirSync(path.join(T, 'tls'), { recursive: true }), path.join(T, 'tls')), env: Object.assign({}, process.env, { ODOO_PASSWORD: 'admin', NODE_EXTRA_CA_CERTS: crt }) }), out = '';
      c.stdout.on('data', function (d) { out += d; }); c.stderr.on('data', function (d) { out += d; }); c.on('exit', function (code) { resolve({ code: code, out: out, dir: path.join(T, 'tls', 'odoo_export') }); }); });
    tls.close();
  }
  var repOut = await stop(rp);
  L('§REPLAY ' + repOut.trim().split('\n').pop());

  // the issue is real: the exporter before the fix fails on this data
  if (A) { L('§OLD exit=' + A.code + ' ' + line(A.out, /(✗ FAIL:[^\n]*|§ODOO-EXPORT ERROR[^\n]*)/));
    ok(A.code !== 0 && !fs.existsSync(path.join(A.dir, 'manifest.json')), 'falsifier: the exporter BEFORE §HARDEN-SPEC fails on this Odoo and publishes nothing (the issue is real)', 'exit ' + A.code); }
  L('§NEW exit=' + N.code + ' ' + line(N.out, /🟢[^\n]*|🔴[^\n]*/));
  ok(N.code === 0 && /every in-workbook lookup finds exactly one row of an earlier sheet — 0 bad/.test(N.out), 'the hardened exporter passes on the same Odoo, every pointer finds exactly one row');
  var nb = N.code === 0 ? sha(path.join(N.dir, 'odoo_migration.xlsx')) : '-', lb = fs.existsSync(path.join(LOAD_FIX, 'odoo_migration.xlsx')) ? sha(path.join(LOAD_FIX, 'odoo_migration.xlsx')) : '-';
  ok(nb !== '-' && nb === lb, 'its workbook is byte-identical to the one the ERP load half judges (bim-ootb erp/tests/fixtures/odoo_export_messy_2026-11-09)', nb + ' vs ' + lb);
  if (N.code === 0) { var man = JSON.parse(fs.readFileSync(path.join(N.dir, 'manifest.json'), 'utf8'));
    var ren = (man.renamed || []).map(function (r) { return r.table + ':' + r.odoo + '→' + r.erp; });
    L('§NEW renamed ' + JSON.stringify(ren));
    ok(ren.indexOf('M_Product:DUP-1→DUP-1-55') >= 0 && ren.indexOf('C_BPartner:C001→C001-52') >= 0 && ren.some(function (r) { return /^M_Locator:.*~\d+$/.test(r); }), 'repeated codes renamed <code>-<odoo id>, over-long keys cut with ~<odoo id>, all listed in manifest.renamed');
    ok(man.company_id === 1 && (man.other_companies || []).length === 2 && man.notes.some(function (t) { return /--company 3/.test(t); }), "no --company = the login's company (1); the other two are named with their command", JSON.stringify(man.other_companies)); }
  // H4
  L('§C3 exit=' + C3r.code + ' ' + line(C3r.out, /§ODOO-EXPORT company=[^\n]*/) + ' | §C99 exit=' + C9r.code + ' ' + line(C9r.out, /§ODOO-EXPORT FAIL company[^\n]*/));
  ok(C3r.code === 0 && /company=3 "Second Co Sdn Bhd" chosen=flag/.test(C3r.out), '--company 3 exports that company only');
  ok(C9r.code === 1 && /no company with id 99 — the companies are: 1 /.test(C9r.out) && !fs.existsSync(C9r.dir), 'an unknown --company is refused, listing the companies; nothing written');
  // H5
  if (H) { L('§TLS exit=' + H.code + ' ' + line(H.out, /§ODOO-EXPORT target[^\n]*/));
    ok(H.code === 0 && /host=https:\/\/localhost:8443/.test(H.out) && sha(path.join(H.dir, 'odoo_migration.xlsx')) === nb, '--url https://… reaches Odoo over TLS and writes the same workbook'); }
  else L('§TLS skipped: openssl unavailable (' + (gen.stderr || '').slice(0, 120) + ')');
  // H6: an Odoo without one of the fields (an edited copy of the recording) stops before reading
  var fx = JSON.parse(fs.readFileSync(FIX, 'utf8')), hit = 0;
  Object.keys(fx.answers).forEach(function (k) { var a = fx.answers[k]; if (/product\.product\.fields_get/.test(a.call) && a.result && a.result.detailed_type) { delete a.result.detailed_type; hit++; } });
  var FX2 = path.join(T, 'noversion.json'); fs.writeFileSync(FX2, JSON.stringify(fx));
  var rp2 = mock('replay', FX2), V = run(path.join(T, 'ver'), AG, BASE); await stop(rp2);
  L('§VERSION edited=' + hit + ' exit=' + V.code + ' ' + line(V.out, /§ODOO-EXPORT FAIL version[^\n]*/));
  ok(hit >= 1 && V.code === 1 && /FAIL version: Odoo 17\.0[^ ]* has no product\.product\.detailed_type/.test(V.out) && !fs.existsSync(V.dir) && !fs.existsSync(V.dir + '.partial'), 'an Odoo lacking a field the export reads stops BEFORE reading, names the field, writes nothing');
  ok(!/MISS/.test(repOut), 'the replay answered every call from the recording (no MISS)');
  if (!judged) finish(3, '⚪ W-ODOO-MESSY INCONCLUSIVE — nothing judged');
  finish(fails ? 1 : 0, (fails ? '🔴 W-ODOO-MESSY FAIL (' + fails + ')' : '🟢 W-ODOO-MESSY PASS') + ' (' + mode + ', ' + judged + ' checks)');
})().catch(function (e) { L('§OM ERROR ' + (e && (e.stack || e.message))); finish(2, '🔴 W-ODOO-MESSY ERROR'); });
