#!/usr/bin/env node
// Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
// SPDX-License-Identifier: MIT
/**
 * ⚠ DO NOT REMOVE — reinstate the inputs git does not carry, from OCI, byte-exact. prompts/TEAMWORK_FRAMEWORK.md §50.2. Witness: W-DEV-ENV. READ THE LOG.
 * Reads dev_env/manifest.json (tracked in BIMCompiler). Per entry: skip when the local file already has the manifest's sha256; else download (a gzip transfer,
 * as OCI serves it, is decoded), verify sha256, write atomically. A mismatch is REFUSED and leaves no file. Nothing is ever overwritten with unverified bytes.
 * Run: node scripts/dev_env_fetch.js [--root-bim-ootb <dir>]   (default ../bim-ootb, then ~/bim-ootb)
 */
'use strict';
var fs = require('fs'), path = require('path'), os = require('os'), http = require('http'), https = require('https'), zlib = require('zlib'), crypto = require('crypto');
function sha(b) { return crypto.createHash('sha256').update(b).digest('hex'); }
function get(url) {
  return new Promise(function (res, rej) {
    (url.indexOf('https:') === 0 ? https : http).get(url, function (r) {
      if (r.statusCode >= 300 && r.statusCode < 400 && r.headers.location) return get(r.headers.location).then(res, rej);
      if (r.statusCode !== 200) { r.resume(); return rej(new Error('HTTP ' + r.statusCode)); }
      var parts = []; r.on('data', function (c) { parts.push(c); }); r.on('end', function () { res({ body: Buffer.concat(parts), enc: r.headers['content-encoding'] || '' }); }); r.on('error', rej);
    }).on('error', rej);
  });
}
async function fetchAll(manifest, roots, log) {
  log = log || function () {};
  var results = [], ok = true;
  for (var e of (manifest.entries || [])) {
    var root = roots[e.repo]; if (!root) { results.push({ path: e.path, state: 'no-root', repo: e.repo }); ok = false; continue; }
    var dest = path.join(root, e.path);
    if (fs.existsSync(dest) && sha(fs.readFileSync(dest)) === e.sha256) { results.push({ path: e.path, state: 'present' }); log('§DEV_ENV present ' + e.repo + '/' + e.path); continue; }
    try {
      var g = await get(e.url), body = g.body;
      if (/gzip/.test(g.enc) || (e.encoding === 'gzip' && body[0] === 0x1f && body[1] === 0x8b)) body = zlib.gunzipSync(body);
      var got = sha(body);
      if (got !== e.sha256) {
        results.push({ path: e.path, state: 'REFUSED', want: e.sha256.slice(0, 12), got: got.slice(0, 12) }); ok = false;
        log('§DEV_ENV REFUSED ' + e.repo + '/' + e.path + ' sha ' + got.slice(0, 12) + ' != manifest ' + e.sha256.slice(0, 12) + ' (nothing written)'); continue;
      }
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      var tmp = dest + '.' + process.pid + '.part'; fs.writeFileSync(tmp, body); fs.renameSync(tmp, dest);
      results.push({ path: e.path, state: 'fetched', bytes: body.length }); log('§DEV_ENV fetched ' + e.repo + '/' + e.path + ' bytes=' + body.length + ' sha=' + got.slice(0, 12));
    } catch (er) { results.push({ path: e.path, state: 'ERROR', error: er.message }); ok = false; log('§DEV_ENV ERROR ' + e.repo + '/' + e.path + ' ' + er.message); }
  }
  return { ok: ok, results: results };
}
module.exports = { fetchAll: fetchAll };
if (require.main === module) {
  var argv = process.argv.slice(2), A = {}; for (var i = 0; i < argv.length; i++) if (/^--/.test(argv[i])) A[argv[i].slice(2)] = argv[++i];
  var BC = path.join(__dirname, '..'), OO = A['root-bim-ootb'] ? path.resolve(A['root-bim-ootb']) : [path.join(BC, '..', 'bim-ootb'), path.join(os.homedir(), 'bim-ootb')].filter(function (d) { return fs.existsSync(d); })[0];
  var M = JSON.parse(fs.readFileSync(path.join(BC, 'dev_env', 'manifest.json'), 'utf8'));
  fetchAll(M, { BIMCompiler: BC, 'bim-ootb': OO }, console.log).then(function (r) {
    var n = function (s) { return r.results.filter(function (x) { return x.state === s; }).length; };
    console.log('§DEV_ENV_VERDICT ' + (r.ok ? 'PASS' : 'FAIL') + ' entries=' + r.results.length + ' fetched=' + n('fetched') + ' present=' + n('present') + ' refused=' + n('REFUSED') + ' errors=' + n('ERROR') + n('no-root'));
    process.exit(r.ok ? 0 : 1);
  });
}
