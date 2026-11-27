#!/usr/bin/env node
// Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
// SPDX-License-Identifier: MIT
/**
 * ⚠ DO NOT REMOVE — publish ONE input git does not carry to OCI and record it in dev_env/manifest.json. prompts/TEAMWORK_FRAMEWORK.md §50.2. READ THE LOG.
 * deploy/OCI_UPLOAD.md rules applied: one file at a time (rule 3); an existing object with DIFFERENT content is never overwritten (rule 1: look first);
 * --content-type always (rule 7); gzip + --content-encoding gzip (rule 8); fetched back and sha256-compared before the manifest is written.
 * Only public content: the caller states what the file is (--produced-by) and has read it for anything not public (§50.2 (6)).
 * Run: node scripts/dev_env_publish.js <BIMCompiler|bim-ootb> <path-in-repo> --produced-by "<command that made it>" [--root-bim-ootb dir]
 */
'use strict';
var fs = require('fs'), path = require('path'), os = require('os'), cp = require('child_process'), zlib = require('zlib'), crypto = require('crypto'), https = require('https');
var NS = 'ax3cp6tzwuy2', BUCKET = 'bim-ootb', REGION_URL = 'https://objectstorage.ap-kulai-2.oraclecloud.com';
var argv = process.argv.slice(2), A = {}, pos = [];
for (var i = 0; i < argv.length; i++) { if (/^--/.test(argv[i])) A[argv[i].slice(2)] = argv[++i]; else pos.push(argv[i]); }
var repo = pos[0], rel = pos[1];
if (!/^(BIMCompiler|bim-ootb)$/.test(repo || '') || !rel || !A['produced-by']) { console.log('usage: dev_env_publish.js <BIMCompiler|bim-ootb> <path> --produced-by "<command>"'); process.exit(2); }
var BC = path.join(__dirname, '..'), root = repo === 'BIMCompiler' ? BC : path.resolve(A['root-bim-ootb'] || path.join(os.homedir(), 'bim-ootb'));
var file = path.join(root, rel), name = 'dev_env/' + repo + '/' + rel, url = REGION_URL + '/n/' + NS + '/b/' + BUCKET + '/o/' + name.split('/').map(encodeURIComponent).join('/');
function sha(b) { return crypto.createHash('sha256').update(b).digest('hex'); }
function get(u) { return new Promise(function (res) { https.get(u, function (r) { var p = []; r.on('data', function (c) { p.push(c); }); r.on('end', function () { res({ status: r.statusCode, enc: r.headers['content-encoding'] || '', body: Buffer.concat(p) }); }); }).on('error', function (e) { res({ status: 0, error: e.message, body: Buffer.alloc(0) }); }); }); }
function decode(g) { return /gzip/.test(g.enc) || (g.body[0] === 0x1f && g.body[1] === 0x8b) ? zlib.gunzipSync(g.body) : g.body; }
(async function () {
  if (!fs.existsSync(file)) { console.log('§DEV_ENV_PUBLISH REFUSED no such file ' + file); process.exit(1); }
  var raw = fs.readFileSync(file), h = sha(raw);
  console.log('§DEV_ENV_PUBLISH file=' + repo + '/' + rel + ' bytes=' + raw.length + ' sha=' + h.slice(0, 12) + ' -> ' + name);
  var before = await get(url);                                                                     // rule 1: look at the target first
  if (before.status === 200) {
    var bh = sha(decode(before));
    if (bh !== h) { console.log('§DEV_ENV_PUBLISH REFUSED the object exists with DIFFERENT content (sha ' + bh.slice(0, 12) + '): not overwritten'); process.exit(1); }
    console.log('§DEV_ENV_PUBLISH already published with the same sha: no upload');
  } else {
    var gz = path.join(os.tmpdir(), 'devenv-' + process.pid + '.gz'); fs.writeFileSync(gz, zlib.gzipSync(raw, { level: 9 }));
    var up = cp.spawnSync('oci', ['os', 'object', 'put', '--namespace', NS, '--bucket-name', BUCKET, '--name', name, '--file', gz,
      '--content-type', 'application/octet-stream', '--content-encoding', 'gzip', '--no-overwrite'], { encoding: 'utf8' });
    fs.unlinkSync(gz);
    if (up.status !== 0) { console.log('§DEV_ENV_PUBLISH UPLOAD FAILED ' + (up.stderr || '').slice(0, 300)); process.exit(1); }
    var after = await get(url), ah = after.status === 200 ? sha(decode(after)) : null;      // fetch back, compare
    if (ah !== h) { console.log('§DEV_ENV_PUBLISH VERIFY FAILED fetched status=' + after.status + ' sha=' + String(ah).slice(0, 12)); process.exit(1); }
    console.log('§DEV_ENV_PUBLISH uploaded gz=' + after.body.length + ' bytes, fetched back, sha matches');
  }
  var mf = path.join(BC, 'dev_env', 'manifest.json'), M = fs.existsSync(mf) ? JSON.parse(fs.readFileSync(mf, 'utf8')) : { schema: 'dev-env-v1', about: 'Inputs the witnesses read that git does not carry; scripts/dev_env_fetch.js reinstates them byte-exact (prompts/TEAMWORK_FRAMEWORK.md §50.2).', entries: [] };
  M.entries = M.entries.filter(function (e) { return !(e.repo === repo && e.path === rel); });
  M.entries.push({ repo: repo, path: rel, sha256: h, bytes: raw.length, url: url, encoding: 'gzip', produced_by: A['produced-by'], published: new Date().toISOString().slice(0, 10) });
  M.entries.sort(function (a, b) { return (a.repo + a.path).localeCompare(b.repo + b.path); });
  fs.mkdirSync(path.dirname(mf), { recursive: true }); fs.writeFileSync(mf, JSON.stringify(M, null, 1) + '\n');
  console.log('§DEV_ENV_PUBLISH manifest entry written: ' + path.relative(BC, mf) + ' entries=' + M.entries.length);
})();
