#!/usr/bin/env node
// Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
// SPDX-License-Identifier: MIT
/**
 * range_demo_server.js — static host with HTTP Range for a big SQLite file + a test page that runs the
 * "first window" range-read steps IN THE VIEWER'S OWN BROWSER (e.g. a phone) and POSTs numbers back.
 *   Spec: docs/internal/ERP_SHARD_GENERATOR.md §10.4/§10.6.   The tester only opens the link; results are read from the log.
 *   Usage: node scripts/range_demo_server.js <db> [port=8765]      (binds 0.0.0.0; URL carries a random token)
 * Serves ONLY: the page, the db (read-only, Range), httpvfs lib files. No directory listing, no writes, no other paths.
 */
'use strict';
var http = require('http'), fs = require('fs'), path = require('path'), crypto = require('crypto'), os = require('os');
var DB = path.resolve(process.argv[2] || ''), PORT = +process.argv[3] || 8765;
if (!fs.existsSync(DB)) { console.log('§DEMO fatal no db ' + DB); process.exit(2); }
var LIB = path.join(process.env.HOME, 'bim-ootb', 'viewer', 'lib');
var TOKEN = process.env.DEMO_TOKEN || crypto.randomBytes(6).toString('hex'), PREFIX = '/t/' + TOKEN;
var ALLOW_LIB = { 'httpvfs.js': 'text/javascript', 'sqlite.worker.js': 'text/javascript', 'httpvfs-sql-wasm.wasm': 'application/wasm' };
var size = fs.statSync(DB).size, tally = { bytes: 0, reqs: 0 };

var PAGE = '<!doctype html><html><head><meta charset=utf-8><meta name=viewport content="width=device-width,initial-scale=1"><title>Range-read test</title>' +
  '<style>body{font:15px system-ui;margin:14px;background:#111;color:#eee}button{font-size:18px;padding:12px 18px;margin:8px 0}pre{white-space:pre-wrap;font-size:13px}</style></head><body>' +
  '<h3>Range-read test (11 GB SQLite, static host)</h3><p id=env></p><button id=go>Run test</button><pre id=out>idle</pre>' +
  '<script src="lib/httpvfs.js"></script><script>' +
  'var out=document.getElementById("out"),P=location.pathname.replace(/[^\\/]*$/,"");' +
  'var c=navigator.connection||{};document.getElementById("env").textContent="secureContext="+isSecureContext+" cores="+navigator.hardwareConcurrency+" deviceMemoryGB="+(navigator.deviceMemory||"n/a")+" net="+(c.effectiveType||"n/a")+" rtt="+(c.rtt||"n/a")+"ms down="+(c.downlink||"n/a")+"Mbps";' +
  'async function mark(n){var r=await fetch(P+"mark?name="+n);return r.json();}' +
  'document.getElementById("go").onclick=async function(){var steps=[],t0=performance.now();out.textContent="running…";' +
  'try{await mark("start");var s=performance.now();' +
  'var w=await window.createDbWorker([{from:"inline",config:{serverMode:"full",requestChunkSize:16384,url:P+"db"}}],P+"lib/sqlite.worker.js",P+"lib/httpvfs-sql-wasm.wasm");' +
  'var m=await mark("open");steps.push({name:"open",ms:Math.round(performance.now()-s),reqs:m.reqs,bytes:m.bytes,rows:1});' +
  'async function q(name,sql,p){var s=performance.now();var r=await w.db.query(sql,p||[]);var m=await mark(name);steps.push({name:name,ms:Math.round(performance.now()-s),reqs:m.reqs,bytes:m.bytes,rows:r.length});return r[0];}' +
  (process.env.DEMO_MODE === 'shard' ? 
  'var a=await q("S1_pick_order","SELECT c_order_id AS id FROM c_order WHERE rowid=1000");' +
  'var b=a&&await q("S2_order","SELECT * FROM c_order WHERE c_order_id=?",[a.id]);' +
  'if(a)await q("S3_lines","SELECT * FROM c_orderline WHERE c_order_id=?",[a.id]);' +
  'if(a)await q("S4_postings","SELECT * FROM fact_acct WHERE ad_table_id=319 AND record_id=(SELECT m_inout_id FROM m_inout LIMIT 1 OFFSET 100)");'  : 
  'var a=await q("W1_window","SELECT ad_window_id AS id FROM ad_window WHERE name=\'Sales Order\' AND ad_client_id=0 LIMIT 1");' +
  'var b=a&&await q("W2_tabs","SELECT ad_tab_id AS id FROM ad_tab WHERE ad_window_id=? ORDER BY seqno",[a.id]);' +
  'if(b)await q("W3_fields","SELECT ad_field_id FROM ad_field WHERE ad_tab_id=?",[b.id]);' +
  'var o=await q("W4_order","SELECT c_order_id AS id FROM c_order WHERE rowid=1000000");' +
  'if(o)await q("W5_orderlines","SELECT * FROM c_orderline WHERE c_order_id=?",[o.id]);' ) +
  'var total=Math.round(performance.now()-t0);var rep={ua:navigator.userAgent,secure:isSecureContext,net:c.effectiveType||null,rtt:c.rtt||null,downlink:c.downlink||null,cores:navigator.hardwareConcurrency,mem:navigator.deviceMemory||null,totalMs:total,steps:steps};' +
  'await fetch(P+"report",{method:"POST",body:JSON.stringify(rep)});' +
  'out.textContent="done in "+total+" ms\\n"+steps.map(function(x){return x.name+" "+x.ms+"ms reqs="+x.reqs+" KB="+Math.round(x.bytes/1024)+" rows="+x.rows}).join("\\n");' +
  '}catch(e){out.textContent="ERROR "+e;await fetch(P+"report",{method:"POST",body:JSON.stringify({error:String(e),ua:navigator.userAgent})});}};' +
  '</script></body></html>';

var server = http.createServer(function (req, res) {
  var url = req.url.split('?')[0];
  if (url.indexOf(PREFIX + '/') !== 0 && url !== PREFIX) { res.statusCode = 404; return res.end(); }
  var rest = url.slice(PREFIX.length) || '/';
  var ip = req.socket.remoteAddress;
  res.setHeader('cache-control', 'no-store');
  if (rest === '/' ) { res.setHeader('content-type', 'text/html'); console.log('§DEMO page ip=' + ip + ' ua=' + (req.headers['user-agent'] || '').slice(0, 90)); return res.end(PAGE); }
  if (rest.indexOf('/mark') === 0) {
    var r = { bytes: tally.bytes, reqs: tally.reqs }; tally.bytes = 0; tally.reqs = 0;
    res.setHeader('content-type', 'application/json'); return res.end(JSON.stringify(r));
  }
  if (rest === '/report' && req.method === 'POST') {
    var body = ''; req.on('data', function (d) { body += d; if (body.length > 1e5) req.destroy(); });
    req.on('end', function () {
      try { var j = JSON.parse(body); }
      catch (e) { res.statusCode = 400; return res.end(); }
      if (j.error) console.log('§DEMO_REPORT ERROR ip=' + ip + ' ' + j.error + ' ua=' + (j.ua || '').slice(0, 90));
      else {
        console.log('§DEMO_REPORT ip=' + ip + ' totalMs=' + j.totalMs + ' secure=' + j.secure + ' net=' + j.net + ' rtt=' + j.rtt + ' down=' + j.downlink + ' cores=' + j.cores + ' memGB=' + j.mem + ' ua=' + (j.ua || '').slice(0, 90));
        (j.steps || []).forEach(function (s) { console.log('§DEMO_STEP ' + s.name + ' ms=' + s.ms + ' reqs=' + s.reqs + ' bytes=' + s.bytes + ' rows=' + s.rows); });
      }
      res.end('ok');
    });
    return;
  }
  var f = null, ct = 'application/octet-stream';
  if (rest === '/db') f = DB;
  else if (rest.indexOf('/lib/') === 0 && ALLOW_LIB[rest.slice(5)]) { f = path.join(LIB, rest.slice(5)); ct = ALLOW_LIB[rest.slice(5)]; }
  if (!f || !fs.existsSync(f)) { res.statusCode = 404; return res.end(); }
  var st = fs.statSync(f), m = /bytes=(\d*)-(\d*)/.exec(req.headers.range || ''), a = 0, b = st.size - 1;
  res.setHeader('accept-ranges', 'bytes'); res.setHeader('content-type', ct);
  if (m) { a = m[1] === '' ? Math.max(0, st.size - +m[2]) : +m[1]; b = m[2] === '' || m[1] === '' ? st.size - 1 : Math.min(+m[2], st.size - 1); res.statusCode = 206; res.setHeader('content-range', 'bytes ' + a + '-' + b + '/' + st.size); }
  res.setHeader('content-length', b - a + 1);
  if (req.method === 'HEAD') return res.end();
  if (f === DB) { tally.bytes += b - a + 1; tally.reqs++; }
  fs.createReadStream(f, { start: a, end: b }).pipe(res);
});
server.listen(PORT, '0.0.0.0', function () {
  var ips = [].concat.apply([], Object.values(os.networkInterfaces())).filter(function (i) { return i.family === 'IPv4' && !i.internal; }).map(function (i) { return i.address; });
  console.log('§DEMO listening 0.0.0.0:' + PORT + ' db=' + path.basename(DB) + ' dbMB=' + Math.round(size / 1048576) + ' token=' + TOKEN);
  ips.forEach(function (ip) { console.log('§DEMO url http://' + ip + ':' + PORT + PREFIX + '/'); });
});
