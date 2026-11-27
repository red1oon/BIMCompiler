#!/usr/bin/env node
// Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
// SPDX-License-Identifier: MIT
/**
 * static_host_load.js — replay a real browser session's byte-range requests from N concurrent virtual users.
 *   Spec: docs/internal/ERP_SHARD_GENERATOR.md §15.   READ THE LOG: §LOAD lines + §LOAD_VERDICT.
 *   Usage: node scripts/static_host_load.js <db> <label> [shard|monolith] [levels=1,10,50,100,200,400] [sessionsPerUser=3]
 */
'use strict';
var http = require('http'), cp = require('child_process'), path = require('path'), fs = require('fs');
var puppeteer = require('puppeteer');
var DB = path.resolve(process.argv[2] || ''), LABEL = process.argv[3] || 'run', MODE = process.argv[4] || 'monolith';
var LEVELS = (process.argv[5] || '1,10,50,100,200,400').split(',').map(Number), SPU = +process.argv[6] || 3;
if (!fs.existsSync(DB)) { console.log('§LOAD_VERDICT INCONCLUSIVE no db ' + DB); process.exit(2); }
var PORT = 20000 + Math.floor(Math.random() * 20000), TOKEN = 'loadtest';
var env = Object.assign({}, process.env, { DEMO_TRACE: '1', DEMO_TOKEN: TOKEN, DEMO_MODE: MODE === 'shard' ? 'shard' : '' });
var server = cp.spawn('node', [path.join(__dirname, 'range_demo_server.js'), DB, String(PORT)], { env: env });
var out = '';
server.stdout.on('data', function (d) { out += d; });
function ptile(a, p) { if (!a.length) return 0; var s = a.slice().sort(function (x, y) { return x - y; }); return s[Math.min(s.length - 1, Math.floor(p / 100 * s.length))]; }
function cpuRss() { try { var r = cp.execSync('ps -o %cpu=,rss= -p ' + server.pid, { encoding: 'utf8' }).trim().split(/\s+/); return { cpu: +r[0], rss: Math.round(+r[1] / 1024) }; } catch (e) { return { cpu: 0, rss: 0 }; } }
function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

(async function () {
  await sleep(1500);
  // 1) record one real cold session
  var browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-gpu'] });
  var page = await browser.newPage();
  await page.goto('http://127.0.0.1:' + PORT + '/t/' + TOKEN + '/', { waitUntil: 'load' });
  out = ''; await page.click('#go');
  await page.waitForFunction(function () { return /done in|ERROR/.test(document.getElementById('out').textContent); }, { timeout: 180000 });
  await sleep(500); await browser.close();
  var trace = out.split('\n').filter(function (l) { return l.indexOf('§TRACE ') === 0; }).map(function (l) { var m = /(\d+)-(\d+)/.exec(l); return [+m[1], +m[2]]; });
  var traceBytes = trace.reduce(function (a, r) { return a + (r[1] - r[0] + 1); }, 0);
  console.log('§LOAD trace label=' + LABEL + ' mode=' + MODE + ' requests=' + trace.length + ' bytes=' + traceBytes + ' (KB ' + Math.round(traceBytes / 1024) + ')');
  if (!trace.length) { console.log('§LOAD_VERDICT INCONCLUSIVE empty trace'); server.kill(); process.exit(2); }

  // 2) replay
  var verdict = 'PASS', anyDone = 0;
  async function user(lat, sess, st) {
    var agent = new http.Agent({ keepAlive: true, maxSockets: 1 });
    for (var s = 0; s < SPU; s++) {
      var t0 = Date.now(), got = 0;
      for (var i = 0; i < trace.length; i++) {
        var r = trace[i], q0 = Date.now();
        await new Promise(function (res) {
          var req = http.get({ host: '127.0.0.1', port: PORT, path: '/t/' + TOKEN + '/db', agent: agent, headers: { Range: 'bytes=' + r[0] + '-' + r[1] } }, function (resp) {
            var n = 0; resp.on('data', function (c) { n += c.length; });
            resp.on('end', function () { if (resp.statusCode !== 206 || n !== r[1] - r[0] + 1) st.err++; else got += n; lat.push(Date.now() - q0); res(); });
          });
          req.on('error', function () { st.err++; res(); });
        });
      }
      sess.push(Date.now() - t0); st.bytes += got; st.reqs += trace.length;
      if (got !== traceBytes) st.integrity++;
    }
    agent.destroy();
  }
  for (var li = 0; li < LEVELS.length; li++) {
    var N = LEVELS[li], lat = [], sess = [], st = { err: 0, bytes: 0, reqs: 0, integrity: 0 }, peakCpu = 0, peakRss = 0;
    var samp = setInterval(function () { var m = cpuRss(); if (m.cpu > peakCpu) peakCpu = m.cpu; if (m.rss > peakRss) peakRss = m.rss; }, 300);
    var t0 = Date.now(), us = [];
    for (var u = 0; u < N; u++) us.push(user(lat, sess, st));
    await Promise.all(us);
    var sec = (Date.now() - t0) / 1000; clearInterval(samp); anyDone += sess.length;
    console.log('§LOAD users=' + N + ' sessions=' + sess.length + ' reqs=' + st.reqs + ' MB=' + (st.bytes / 1048576).toFixed(1) + ' wallSec=' + sec.toFixed(1) +
      ' req/s=' + Math.round(st.reqs / sec) + ' MB/s=' + (st.bytes / 1048576 / sec).toFixed(1) +
      ' reqMs p50/p95/p99=' + ptile(lat, 50) + '/' + ptile(lat, 95) + '/' + ptile(lat, 99) +
      ' sessionMs p50/p95=' + ptile(sess, 50) + '/' + ptile(sess, 95) + ' errors=' + st.err + ' integrityFail=' + st.integrity +
      ' serverCpu%=' + peakCpu + ' serverRssMB=' + peakRss);
    if (st.err) verdict = 'FAIL'; else if (st.integrity) verdict = 'INCONCLUSIVE replay integrity';
  }
  // 3) cost arithmetic (ASSUMPTION table, no prices)
  var perSessKB = Math.round(traceBytes / 1024);
  [100, 1000, 10000].forEach(function (sessionsPerDay) {
    var m = sessionsPerDay * 30;
    console.log('§LOAD_COST (assumption) sessions/day=' + sessionsPerDay + ' -> per month: requests=' + (m * trace.length) + ' egress GB=' + (m * traceBytes / 1073741824).toFixed(2) + ' (cold first window, ' + perSessKB + ' KB each, no cache)');
  });
  console.log('§LOAD_VERDICT ' + (anyDone ? verdict : 'INCONCLUSIVE no sessions') + ' label=' + LABEL + ' (host = one Node process on loopback; stand-in, not OCI)');
  server.kill();
})().catch(function (e) { console.log('§LOAD fatal ' + String(e).slice(0, 300)); server.kill(); process.exit(1); });
