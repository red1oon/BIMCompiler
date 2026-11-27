#!/usr/bin/env node
// Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
// SPDX-License-Identifier: MIT
/**
 * range_read_witness.js — can a big SQLite on a dumb static host serve keyed ERP queries by HTTP range reads?
 *   Spec: docs/internal/ERP_SHARD_GENERATOR.md §9.2.   READ THE LOG: §RANGE lines + §RANGE_VERDICT.
 *   Usage: node scripts/range_read_witness.js <db> [label]     (db is served from its own directory)
 * Numbers only (bytes, requests, ms, rows). CPU-only headless Chromium, 4x CPU throttle as a mobile proxy.
 */
'use strict';
var http = require('http'), fs = require('fs'), path = require('path');
var puppeteer = require('puppeteer');

var DB = path.resolve(process.argv[2] || ''), LABEL = process.argv[3] || path.basename(DB);
if (!fs.existsSync(DB)) { console.log('§RANGE_VERDICT INCONCLUSIVE no db ' + DB); process.exit(2); }
var LIB = path.join(process.env.HOME, 'bim-ootb', 'viewer', 'lib');
var CHUNK = +process.env.RANGE_CHUNK || 16384;      // requestChunkSize — match the db page_size
var size = fs.statSync(DB).size;
var tally = { bytes: 0, reqs: 0 };

var server = http.createServer(function (req, res) {
  var u = decodeURIComponent(req.url.split('?')[0]);
  if (u === '/') {
    res.setHeader('content-type', 'text/html');
    return res.end('<!doctype html><meta charset=utf-8><script src="/lib/httpvfs.js"></script><body>range</body>');
  }
  var f = u === '/db' ? DB : u.indexOf('/lib/') === 0 ? path.join(LIB, path.basename(u)) : null;
  if (!f || !fs.existsSync(f)) { res.statusCode = 404; return res.end(); }
  var st = fs.statSync(f), ct = /\.wasm$/.test(f) ? 'application/wasm' : /\.js$/.test(f) ? 'text/javascript' : 'application/octet-stream';
  res.setHeader('accept-ranges', 'bytes'); res.setHeader('content-type', ct);
  res.setHeader('access-control-allow-origin', '*'); res.setHeader('cache-control', 'no-store');
  var m = /bytes=(\d*)-(\d*)/.exec(req.headers.range || '');
  var a = 0, b = st.size - 1;
  if (m) { a = m[1] === '' ? Math.max(0, st.size - +m[2]) : +m[1]; b = m[2] === '' || m[1] === '' ? st.size - 1 : Math.min(+m[2], st.size - 1); res.statusCode = 206; res.setHeader('content-range', 'bytes ' + a + '-' + b + '/' + st.size); }
  res.setHeader('content-length', b - a + 1);
  if (req.method === 'HEAD') return res.end();           // HEAD carries no body — never count it
  if (u === '/db') { tally.bytes += b - a + 1; tally.reqs++; }
  fs.createReadStream(f, { start: a, end: b }).pipe(res);
});

function row(o) { return JSON.stringify(o); }

server.listen(0, '127.0.0.1', async function () {
  var port = server.address().port, base = 'http://127.0.0.1:' + port;
  var browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-gpu'] });
  var verdict = 'PASS', nq = 0, empty = 0;
  try {
    var page = await browser.newPage();
    var cdp = await page.target().createCDPSession();
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
    page.on('pageerror', function (e) { console.log('§RANGE pageerror ' + String(e).slice(0, 200)); });
    await page.goto(base + '/', { waitUntil: 'load' });
    var t0 = Date.now();
    var ready = await page.evaluate(async function (base, CHUNK) {
      var w = await window.createDbWorker([{ from: 'inline', config: { serverMode: 'full', requestChunkSize: CHUNK, url: base + '/db' } }],
        base + '/lib/sqlite.worker.js', base + '/lib/httpvfs-sql-wasm.wasm');
      window.__w = w; return true;
    }, base, CHUNK);
    console.log('§RANGE open label=' + LABEL + ' dbMB=' + Math.round(size / 1048576) + ' chunk=' + CHUNK + ' openMs=' + (Date.now() - t0) +
      ' openBytes=' + tally.bytes + ' openReqs=' + tally.reqs + ' ready=' + ready);
    // pick real keys from the db itself (no invented ids): one mid-table row each
    async function q(name, sql, params) {
      tally.bytes = 0; tally.reqs = 0; var s = Date.now();
      var out = await page.evaluate(async function (sql, params) {
        try { var r = await window.__w.db.query(sql, params || []); return { rows: r.length, first: r[0] || null }; }
        catch (e) { return { err: String(e).slice(0, 200) }; }
      }, sql, params);
      var ms = Date.now() - s; nq++;
      if (out.err) { console.log('§RANGE q=' + name + ' ERROR ' + out.err); verdict = 'FAIL'; return null; }
      if (!out.rows) empty++;
      console.log('§RANGE q=' + name + ' ms=' + ms + ' bytes=' + tally.bytes + ' reqs=' + tally.reqs + ' rows=' + out.rows);
      return { out: out, bytes: tally.bytes };
    }
    var k = await q('key_fact_acct_mid', 'SELECT fact_acct_id AS id FROM fact_acct WHERE rowid=6000000');
    var kid = k && k.out.first ? k.out.first.id : null;
    var k2 = await q('key_c_order_mid', 'SELECT c_order_id AS id FROM c_orderline WHERE rowid=3000000');
    var oid = k2 && k2.out.first ? k2.out.first.id : null;
    await q('Q1_dict_count', 'SELECT count(*) AS n FROM ad_window');
    var q2 = kid != null && await q('Q2_fact_acct_pk', 'SELECT * FROM fact_acct WHERE fact_acct_id=?', [kid]);
    if (oid != null) {
      await q('Q3_orderline_by_order', 'SELECT * FROM c_orderline WHERE c_order_id=?', [oid]);
      await q('Q4_order_pk', 'SELECT * FROM c_order WHERE c_order_id=?', [oid]);
    }
    if (q2) console.log('§RANGE_RATIO q=Q2 bytes=' + q2.bytes + ' fileBytes=' + size + ' pct=' + (100 * q2.bytes / size).toFixed(4));
  } catch (e) { console.log('§RANGE fatal ' + String(e).slice(0, 300)); verdict = 'FAIL'; }
  await browser.close(); server.close();
  if (!nq || empty) verdict = verdict === 'FAIL' ? 'FAIL' : 'INCONCLUSIVE (empty/zero queries judged: nq=' + nq + ' empty=' + empty + ')';
  console.log('§RANGE_VERDICT ' + verdict + ' label=' + LABEL);
});
