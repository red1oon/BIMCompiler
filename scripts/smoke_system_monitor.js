#!/usr/bin/env node
// §MON-SMOKE — wiring/deploy check (Playwright secondary per docs/TestArchitecture.md): the host HTML loads
// its scripts, folds REAL signals, and paints all 4 widgets. NOT a value test (poc_system_monitor.js is that).
'use strict';
var path = require('path'), http = require('http'), fs = require('fs');
var pw = require(path.join(process.env.HOME, 'bim-ootb', 'tests', 'node_modules', 'playwright-core'));
var ROOT = path.join(__dirname, '..', 'deploy', 'dev');
var MIME = { '.html': 'text/html', '.js': 'text/javascript', '.wasm': 'application/wasm', '.json': 'application/json' };

var server = http.createServer(function (req, res) {
  var p = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
  fs.readFile(p, function (e, buf) {
    if (e) { res.writeHead(404); res.end('nf'); return; }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' });
    res.end(buf);
  });
});

(async function () {
  await new Promise(function (r) { server.listen(0, r); });
  var port = server.address().port;
  var logs = [], FAILS = [];
  function check(n, c, d) { console.log((c ? '   ✓ ' : '   ✗ ') + n + (d ? ' — ' + d : '')); if (!c) FAILS.push(n); }
  var browser = await pw.chromium.launch({ args: ['--no-sandbox'] });
  var page = await browser.newPage();
  page.on('console', function (m) { logs.push(m.text()); });
  page.on('pageerror', function (e) { logs.push('PAGEERROR ' + e.message); });
  await page.goto('http://localhost:' + port + '/system_monitor.html', { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);

  var sysmonLoaded = logs.some(function (l) { return /§FIELDHEALTH_LOADED/.test(l); });
  var beaconLoaded = logs.some(function (l) { return /§SPIKE-BEACON installed=Y/.test(l); });
  var foldLines = logs.filter(function (l) { return /§MON-(FIELD_ERRORS|DURABILITY_LADDER|DB_SIZE_GAUGE|ENVIRONMENT)/.test(l); });
  var widgetCount = await page.evaluate(function () { return document.querySelectorAll('#panel > div > div').length; });
  var panelText = await page.evaluate(function () { return document.getElementById('panel').textContent; });

  check('host loaded field_health.js (§FIELDHEALTH_LOADED)', sysmonLoaded);
  check('beacon installed in the host (§SPIKE-BEACON)', beaconLoaded);
  check('all 4 widgets folded (§MON-* lines)', new Set(foldLines.map(function (l) { return l.split(' ')[0]; })).size === 4, 'distinct=' + new Set(foldLines.map(function (l) { return l.split(' ')[0]; })).size);
  check('panel painted widget rows', widgetCount >= 4, 'rows=' + widgetCount);
  check('Durability + Op-log DB + Environment visible', /Durability/.test(panelText) && /Op-log DB/.test(panelText) && /Environment/.test(panelText));

  // flip to classic → all N/A (serverless)
  await page.click('#tCla'); await page.waitForTimeout(150);
  var classicText = await page.evaluate(function () { return document.getElementById('panel').textContent; });
  check('Classic view shows server vitals as N/A (serverless)', /N\/A — no server/.test(classicText));

  await browser.close(); server.close();
  console.log('§MON-SMOKE OVERALL=' + (FAILS.length === 0 ? 'PASS' : 'FAIL (' + FAILS.join('; ') + ')'));
  process.exit(FAILS.length === 0 ? 0 : 1);
})().catch(function (e) { console.error('FATAL ' + e.stack); server.close(); process.exit(2); });
