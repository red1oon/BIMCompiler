// Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
// SPDX-License-Identifier: MIT
/**
 * ⚠ DO NOT REMOVE — the input tracer of the witness cache, prompts/TEAMWORK_FRAMEWORK.md §51.1 (C1). Witness: W-WITNESS-CACHE (scripts/witness_witness_cache.js).
 * Preloaded (`node -r` + NODE_OPTIONS=--require, so every node child is traced too) by scripts/witness_cache.js. Records, per process, what the code READ (files, through
 * require, a fixture read, or the witness's own HTTP server feeding headless Chromium), what it LISTED (directories), what it PROBED (exists/stat/access) and what it
 * WROTE (a file the run wrote is output, not input). Written as JSON to $WITNESS_TRACE_DIR at process exit. Inert when that variable is unset.
 * Not seen (stated in §51.1): reads outside Node fs (a git or sqlite subprocess, the network, the clock), and Node's ESM loader (the cache refuses import( instead).
 */
'use strict';
(function () {
  var OUT = process.env.WITNESS_TRACE_DIR;
  if (!OUT || global.__witnessTrace) return;
  global.__witnessTrace = true;
  var fs = require('fs'), path = require('path'), Module = require('module');
  var origWrite = fs.writeFileSync, origMkdir = fs.mkdirSync;
  var T = { reads: {}, lists: {}, probes: {}, writes: {}, execd: {} };
  function abs(p) {
    try { if (typeof p === 'number' || p == null) return null; if (Buffer.isBuffer(p)) p = p.toString(); if (typeof URL !== 'undefined' && p instanceof URL) p = require('url').fileURLToPath(p); return typeof p === 'string' ? path.resolve(p) : null; } catch (e) { return null; }
  }
  function isWrite(f) {
    if (typeof f === 'string') return /[wa+]/.test(f);
    if (typeof f === 'number') { var C = fs.constants; return (f & (C.O_WRONLY | C.O_RDWR | C.O_CREAT | C.O_APPEND | C.O_TRUNC)) !== 0; }
    return false;
  }
  function wrap(o, n, rec) { var orig = o && o[n]; if (typeof orig !== 'function') return; o[n] = function () { try { rec(arguments); } catch (e) { /* never break the witness */ } return orig.apply(this, arguments); }; }
  // kind 1 = (path, options|encoding) — a flag only inside an options object; kind 2 = (path, flags)
  function readOf(kind) { return function (a) { var p = abs(a[0]); if (!p) return; var f = kind === 2 ? a[1] : (a[1] && typeof a[1] === 'object' ? a[1].flag : 'r'); (isWrite(f) ? T.writes : T.reads)[p] = 1; }; }
  function writeOf(a) { var p = abs(a[0]); if (p) T.writes[p] = 1; }
  function write2Of(a) { var p = abs(a[1]); if (p) T.writes[p] = 1; }
  function listOf(a) { var p = abs(a[0]); if (p) T.lists[p] = 1; }
  function probeOf(a) { var p = abs(a[0]); if (p) T.probes[p] = 1; }
  wrap(fs, 'readFileSync', readOf(1));
  wrap(fs, 'readFile', readOf(1));
  wrap(fs, 'createReadStream', readOf(1));
  wrap(fs, 'openSync', readOf(2));
  wrap(fs, 'open', readOf(2));
  wrap(fs, 'readdirSync', listOf);
  wrap(fs, 'readdir', listOf);
  wrap(fs, 'opendirSync', listOf);
  ['existsSync', 'statSync', 'lstatSync', 'accessSync'].forEach(function (n) { wrap(fs, n, probeOf); });
  ['exists', 'stat', 'lstat', 'access'].forEach(function (n) { wrap(fs, n, probeOf); });
  ['writeFileSync', 'writeFile', 'appendFileSync', 'appendFile', 'createWriteStream', 'mkdirSync', 'mkdir', 'rmSync', 'unlinkSync', 'rmdirSync', 'truncateSync'].forEach(function (n) { wrap(fs, n, writeOf); });
  wrap(fs, 'copyFileSync', function (a) { readOf(1)([a[0]]); write2Of(a); });
  wrap(fs, 'renameSync', function (a) { writeOf(a); write2Of(a); });
  var fsp = fs.promises;
  if (fsp) {
    wrap(fsp, 'readFile', readOf(1)); wrap(fsp, 'open', readOf(2)); wrap(fsp, 'readdir', listOf); wrap(fsp, 'opendir', listOf);
    ['stat', 'lstat', 'access'].forEach(function (n) { wrap(fsp, n, probeOf); });
    ['writeFile', 'appendFile', 'mkdir', 'rm', 'unlink', 'rmdir', 'truncate'].forEach(function (n) { wrap(fsp, n, writeOf); });
    wrap(fsp, 'copyFile', function (a) { readOf(1)([a[0]]); write2Of(a); }); wrap(fsp, 'rename', function (a) { writeOf(a); write2Of(a); });
  }
  // node-EXECUTED files (the cache refuses a run whose executed code uses import(: Node's ESM loader reads outside this fs)
  ['.js', '.cjs'].forEach(function (ext) { var o = Module._extensions[ext]; if (o) Module._extensions[ext] = function (m, filename) { T.execd[filename] = 1; return o.apply(this, arguments); }; });
  process.on('exit', function () {
    try { origMkdir(OUT, { recursive: true }); origWrite(path.join(OUT, process.pid + '-' + Math.random().toString(36).slice(2) + '.json'), JSON.stringify(T)); } catch (e) { /* the cache then sees no trace and refuses to store */ }
  });
})();
