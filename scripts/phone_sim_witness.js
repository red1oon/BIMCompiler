#!/usr/bin/env node
// Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
// SPDX-License-Identifier: MIT
/**
 * phone_sim_witness.js — cold-start + first-window over a throttled link, phone PROXY (not a phone).
 *   Spec: docs/internal/ERP_SHARD_GENERATOR.md §10.4.   READ THE LOG: §PHONE lines + §PHONE_VERDICT.
 *   Usage: node scripts/phone_sim_witness.js <db> <profile: wifi|4g|slow4g|none> [chunk=16384]
 *   Run under a memory cap:  systemd-run --user --scope -p MemoryMax=700M node scripts/phone_sim_witness.js …
 */
'use strict';
var http = require('http'), fs = require('fs'), path = require('path'), cp = require('child_process');
var puppeteer = require('puppeteer');

var DB = path.resolve(process.argv[2] || ''), PROFILE = process.argv[3] || 'none', CHUNK = +process.argv[4] || 16384;
var PROF = { none: [0, 0], wifi: [20, 6e6], '4g': [80, 1.5e6], slow4g: [150, 2e5] }[PROFILE];
if (!fs.existsSync(DB) || !PROF) { console.log('§PHONE_VERDICT INCONCLUSIVE bad args db=' + DB + ' profile=' + PROFILE); process.exit(2); }
var RTT = PROF[0], BW = PROF[1], LIB = path.join(process.env.HOME, 'bim-ootb', 'viewer', 'lib');
var size = fs.statSync(DB).size, tally = { bytes: 0, reqs: 0 };

var server = http.createServer(function (req, res) {
  var u = decodeURIComponent(req.url.split('?')[0]);
  if (u === '/') { res.setHeader('content-type', 'text/html'); return res.end('<!doctype html><meta charset=utf-8><script src="/lib/httpvfs.js"></script><body>x</body>'); }
  var isDb = u === '/db', f = isDb ? DB : u.indexOf('/lib/') === 0 ? path.join(LIB, path.basename(u)) : null;
  if (!f || !fs.existsSync(f)) { res.statusCode = 404; return res.end(); }
  var st = fs.statSync(f), ct = /\.wasm$/.test(f) ? 'application/wasm' : /\.js$/.test(f) ? 'text/javascript' : 'application/octet-stream';
  res.setHeader('accept-ranges', 'bytes'); res.setHeader('content-type', ct); res.setHeader('cache-control', 'no-store');
  var m = /bytes=(\d*)-(\d*)/.exec(req.headers.range || ''), a = 0, b = st.size - 1;
  if (m) { a = m[1] === '' ? Math.max(0, st.size - +m[2]) : +m[1]; b = m[2] === '' || m[1] === '' ? st.size - 1 : Math.min(+m[2], st.size - 1); res.statusCode = 206; res.setHeader('content-range', 'bytes ' + a + '-' + b + '/' + st.size); }
  res.setHeader('content-length', b - a + 1);
  setTimeout(function () {                                   // RTT shaping (applies to HEAD too)
    if (req.method === 'HEAD') return res.end();
    if (isDb) { tally.bytes += b - a + 1; tally.reqs++; }
    var s = fs.createReadStream(f, { start: a, end: b, highWaterMark: 16384 });
    if (!BW || !isDb) return s.pipe(res);                    // only the db is bandwidth-shaped
    s.on('data', function (c) { s.pause(); res.write(c); setTimeout(function () { s.resume(); }, c.length / BW * 1000); });
    s.on('end', function () { res.end(); });
  }, isDb ? RTT : 0);
});

// Non-blocking RSS sampler: ONE `ps` call (async), sum the tree in JS. (A blocking sampler starved the db server.)
var sampling = false;
function sampleRss(pid, cb) {
  if (sampling) return; sampling = true;
  cp.exec('ps -e -o pid=,ppid=,rss=', function (err, out) {
    sampling = false; if (err) return;
    var kids = {}, rss = {};
    out.split('\n').forEach(function (l) { var p = l.trim().split(/\s+/); if (p.length < 3) return; rss[p[0]] = +p[2]; (kids[p[1]] = kids[p[1]] || []).push(p[0]); });
    var tot = 0, stack = [String(pid)];
    while (stack.length) { var x = stack.pop(); tot += rss[x] || 0; (kids[x] || []).forEach(function (k) { stack.push(k); }); }
    cb(tot / 1024);
  });
}

server.listen(0, '127.0.0.1', async function () {
  var base = 'http://127.0.0.1:' + server.address().port, verdict = 'PASS', peak = 0, baseRssG = 0, browser, sampler;
  var tag = 'PHONE-PROXY profile=' + PROFILE + ' rtt=' + RTT + 'ms bw=' + (BW ? Math.round(BW / 1000) + 'KB/s' : 'off') + ' cpu=4x chunk=' + CHUNK + ' dbMB=' + Math.round(size / 1048576);
  try {
    browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-gpu'] });
    var pid = browser.process().pid;
    sampler = setInterval(function () { sampleRss(pid, function (r) { if (r > peak) peak = r; }); }, 500);
    var page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 Chrome/120 Mobile Safari/537.36');
    await page.setViewport({ width: 412, height: 915, isMobile: true, hasTouch: true, deviceScaleFactor: 2.6 });
    var cdp = await page.target().createCDPSession();
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
    page.on('pageerror', function (e) { console.log('§PHONE pageerror ' + String(e).slice(0, 160)); });
    await page.goto(base + '/', { waitUntil: 'load' });
    await new Promise(function (r) { setTimeout(r, 1500); });
    var baseRss = await new Promise(function (r) { sampleRss(pid, r); }); peak = baseRss; baseRssG = baseRss;   // empty-page baseline of the whole Chromium tree

    var t0 = Date.now(); tally.bytes = 0; tally.reqs = 0;
    await page.evaluate(async function (base, CHUNK) {
      window.__w = await window.createDbWorker([{ from: 'inline', config: { serverMode: 'full', requestChunkSize: CHUNK, url: base + '/db' } }],
        base + '/lib/sqlite.worker.js', base + '/lib/httpvfs-sql-wasm.wasm');
    }, base, CHUNK);
    var open = { ms: Date.now() - t0, reqs: tally.reqs, bytes: tally.bytes };

    async function step(name, sql, params) {
      tally.bytes = 0; tally.reqs = 0; var s = Date.now();
      var out = await page.evaluate(async function (sql, params) {
        try { var r = await window.__w.db.query(sql, params || []); return { rows: r.length, first: r[0] || null }; } catch (e) { return { err: String(e).slice(0, 160) }; }
      }, sql, params);
      var o = { name: name, ms: Date.now() - s, reqs: tally.reqs, bytes: tally.bytes, rows: out.rows, first: out.first, err: out.err };
      return o;
    }
    async function firstWindow() {
      var r = [], w = await step('W1_window', "SELECT ad_window_id AS id FROM ad_window WHERE name='Sales Order' AND ad_client_id=0 LIMIT 1"); r.push(w);
      var wid = w.first && w.first.id;
      var t = wid != null ? await step('W2_tabs', 'SELECT ad_tab_id AS id, name FROM ad_tab WHERE ad_window_id=? ORDER BY seqno', [wid]) : { name: 'W2_tabs', rows: 0, ms: 0, reqs: 0, bytes: 0 }; r.push(t);
      var tid = t.first && t.first.id;
      r.push(tid != null ? await step('W3_fields', 'SELECT ad_field_id FROM ad_field WHERE ad_tab_id=?', [tid]) : { name: 'W3_fields', rows: 0, ms: 0, reqs: 0, bytes: 0 });
      var o = await step('W4_order', 'SELECT c_order_id AS id FROM c_order WHERE rowid=1000000'); r.push(o);
      var oid = o.first && o.first.id;
      r.push(oid != null ? await step('W5_orderlines', 'SELECT * FROM c_orderline WHERE c_order_id=?', [oid]) : { name: 'W5_orderlines', rows: 0, ms: 0, reqs: 0, bytes: 0 });
      return r;
    }
    function emit(kind, steps) {
      var ms = 0, reqs = 0, bytes = 0, empty = 0, err = 0;
      steps.forEach(function (s) {
        ms += s.ms; reqs += s.reqs; bytes += s.bytes; if (!s.rows) empty++; if (s.err) err++;
        console.log('§PHONE ' + kind + ' ' + s.name + ' ms=' + s.ms + ' reqs=' + s.reqs + ' bytes=' + s.bytes + ' rows=' + s.rows + (s.err ? ' ERR ' + s.err : ''));
      });
      if (err) verdict = 'FAIL'; else if (empty && verdict === 'PASS') verdict = 'INCONCLUSIVE (empty step)';
      return { ms: ms, reqs: reqs, bytes: bytes };
    }
    var cold = emit('cold', await firstWindow());
    var repeat = emit('repeat', await firstWindow());
    console.log('§PHONE ' + tag + ' open ms=' + open.ms + ' reqs=' + open.reqs + ' bytes=' + open.bytes);
    console.log('§PHONE ' + tag + ' COLD firstWindowMs=' + (open.ms + cold.ms) + ' (open ' + open.ms + ' + queries ' + cold.ms + ') totalReqs=' + (open.reqs + cold.reqs) +
      ' totalBytes=' + (open.bytes + cold.bytes) + ' | REPEAT queriesMs=' + repeat.ms + ' reqs=' + repeat.reqs + ' bytes=' + repeat.bytes);
  } catch (e) { console.log('§PHONE fatal ' + String(e).slice(0, 300)); verdict = 'FAIL (killed/crashed — possible memory cap)'; }
  clearInterval(sampler);
  console.log('§PHONE ' + tag + ' baseRssMB=' + Math.round(baseRssG) + ' peakRssMB=' + Math.round(peak) + ' dbDeltaMB=' + Math.round(peak - baseRssG));
  try { await browser.close(); } catch (e) { /* already dead */ }
  server.close();
  console.log('§PHONE_VERDICT ' + verdict + ' ' + tag);
});
