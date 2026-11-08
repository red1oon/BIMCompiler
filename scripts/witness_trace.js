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
  var T = { reads: {}, lists: {}, probes: {}, writes: {}, execd: {}, spawns: {}, gits: [] };
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
  // native file openers bypass fs: better-sqlite3 opens its database in C++ (2026-11-01: ad_full.db was invisible to the cache and to W-DEV-ENV until this hook)
  function wrapBetter(exp, filename) {
    if (typeof exp !== 'function' || exp.__traced) return exp;
    var W = function (file, opts) {
      try { var p = abs(file); if (p && file !== ':memory:') (fs.existsSync(p) ? T.reads : T.writes)[p] = 1; } catch (e) { /* never break the witness */ }
      return new exp(file, opts);
    };
    Object.setPrototypeOf(W, exp); W.prototype = exp.prototype; W.__traced = true; return W;
  }
  var origLoad = Module._load;
  Module._load = function (request, parent) {
    var exp = origLoad.apply(this, arguments), filename = null;
    try { filename = Module._resolveFilename(request, parent); } catch (e) { return exp; }
    if (/[\\/]better-sqlite3[\\/]lib[\\/]index\.js$/.test(filename)) return wrapBetter(exp, filename);
    return exp;
  };
  // child programs: a node child is traced (NODE_OPTIONS); any OTHER program reads outside this tracer, so it is recorded and the cache refuses the run
  var CP = require('child_process');
  // §51.2: read-only git forms are INPUTS (fingerprinted by the object id git resolves), not untraceable children: `git [-C d] show <rev>:<path>` and
  // `git [-C d] archive <rev> <path…>`, alone or in an `sh -c` pipeline whose only other stage is `tar -x -C <dir>`. Anything else stays refused.
  function gitRead(cwd, argv) {
    var dir = cwd, a = (argv || []).map(String);
    while (a[0] === '-C' && a.length > 1) { dir = path.resolve(dir, a[1]); a = a.slice(2); }
    if (a[0] === 'show' && a.length === 2 && /^[^:\-][^:]*:.+$/.test(a[1])) { var i = a[1].indexOf(':'); T.gits.push({ dir: dir, rev: a[1].slice(0, i), path: a[1].slice(i + 1) }); return true; }
    if (a[0] === 'archive' && a.length >= 3 && !/^-/.test(a[1]) && a.slice(2).every(function (x) { return !/^-/.test(x); })) { a.slice(2).forEach(function (x) { T.gits.push({ dir: dir, rev: a[1], path: x.replace(/\/+$/, '') }); }); return true; }
    return false;
  }
  function words(str) { var out = [], cur = '', q = null, any = false; for (var i = 0; i < str.length; i++) { var ch = str[i];
      if (q) { if (ch === q) q = null; else cur += ch; continue; }
      if (ch === '"' || ch === "'") { q = ch; any = true; continue; }
      if (/\s/.test(ch)) { if (cur || any) out.push(cur); cur = ''; any = false; continue; }
      if (/[;&<>`$()]/.test(ch)) return null;                                        // anything beyond a plain pipeline: not recognised
      if (ch === '|') { if (cur || any) out.push(cur); cur = ''; any = false; out.push('|'); continue; }
      cur += ch; }
    if (q) return null; if (cur || any) out.push(cur); return out; }
  function shellRead(cwd, str) {                                                     // true only when EVERY stage is a recognised git read or `tar -x -C <dir>`
    var w = words(String(str)); if (!w || !w.length) return false;
    var stages = [[]]; w.forEach(function (t) { if (t === '|') stages.push([]); else stages[stages.length - 1].push(t); });
    return stages.every(function (st) {
      if (st[0] === 'git') return gitRead(cwd, st.slice(1));
      return st[0] === 'tar' && (JSON.stringify(st.slice(1, 3)) === '["-x","-C"]' && st.length === 4 || JSON.stringify(st.slice(1, 4)) === '["-xf","-","-C"]' && st.length === 5);
    });
  }
  function cwdOf(o) { return (o && typeof o === 'object' && !Array.isArray(o) && o.cwd) ? path.resolve(String(o.cwd)) : process.cwd(); }
  function spawnOf(isShell) { return function (a) {
    var c = a[0]; if (typeof c !== 'string') return;
    if (isShell) { var cwd0 = cwdOf(a[1]); if (!shellRead(cwd0, c)) T.spawns[c.trim().split(/\s+/)[0] || ''] = 1; return; }
    var argv = Array.isArray(a[1]) ? a[1] : [], cwd = cwdOf(Array.isArray(a[1]) ? a[2] : a[1]), cmd = c, b = path.basename(c);
    if (b === 'git') { if (!gitRead(cwd, argv)) T.spawns[cmd] = 1; return; }
    if ((b === 'sh' || b === 'bash') && argv[0] === '-c' && argv.length === 2) { if (!shellRead(cwd, argv[1])) T.spawns[cmd] = 1; return; }
    T.spawns[cmd] = 1; }; }
  ['spawn', 'spawnSync', 'execFile', 'execFileSync'].forEach(function (n) { wrap(CP, n, spawnOf(false)); });
  ['exec', 'execSync'].forEach(function (n) { wrap(CP, n, spawnOf(true)); });
  // node-EXECUTED files (the cache refuses a run whose executed code uses import(: Node's ESM loader reads outside this fs)
  ['.js', '.cjs'].forEach(function (ext) { var o = Module._extensions[ext]; if (o) Module._extensions[ext] = function (m, filename) { T.execd[filename] = 1; return o.apply(this, arguments); }; });
  process.on('exit', function () {
    try { origMkdir(OUT, { recursive: true }); origWrite(path.join(OUT, process.pid + '-' + Math.random().toString(36).slice(2) + '.json'), JSON.stringify(T)); } catch (e) { /* the cache then sees no trace and refuses to store */ }
  });
})();
