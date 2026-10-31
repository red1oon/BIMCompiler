// Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
// SPDX-License-Identifier: MIT
/**
 * ⚠ DO NOT REMOVE — the content-keyed witness cache, prompts/TEAMWORK_FRAMEWORK.md §51.1 (C1). Witness: W-WITNESS-CACHE (scripts/witness_witness_cache.js). READ THE LOG.
 * runSync({ file, args, cwd, env, keyEnv, roots, cacheDir?, exclude?, fresh?, timeout? }) -> { exit, out, cached, key, inputs, skip }
 *   env    = environment APPLIED to the run (not part of the key); keyEnv = values that ARE the key (the caller normalises run-specific paths out of them).
 *   roots  = the trees whose files count as inputs (bim-compiler, bim-ootb). node_modules, .git, the cache dir and `exclude` dirs never count.
 * A HIT needs every traced input to re-hash equal; the stored log is replayed behind a `§CACHED` line and nothing runs. Stored only for exit 0 with >=1 input and no
 * node-executed import( (`§CACHE_SKIP reason=…` otherwise). A miss is always safe; a wrong hit is the defect W-WITNESS-CACHE hunts.
 */
'use strict';
var fs = require('fs'), path = require('path'), os = require('os'), cp = require('child_process'), crypto = require('crypto');
var TRACER = path.join(__dirname, 'witness_trace.js');
function sha(b) { return crypto.createHash('sha256').update(b).digest('hex'); }
function under(p, d) { return p === d || p.indexOf(d.endsWith(path.sep) ? d : d + path.sep) === 0; }
function hashOf(k, p) {
  if (k === 'L') { try { return sha(fs.readdirSync(p).sort().join('\n')); } catch (e) { return 'ABSENT'; } }
  try { var st = fs.statSync(p); return st.isDirectory() ? 'DIR' : sha(fs.readFileSync(p)); } catch (e) { return 'ABSENT'; }
}
function relOf(p, roots) { for (var r of roots) if (under(p, r)) return path.basename(r) + '/' + path.relative(r, p); return p; }

function runSync(o) {
  var roots = (o.roots || []).filter(Boolean).map(function (r) { return path.resolve(r); });
  var cacheDir = path.resolve(o.cacheDir || process.env.WITNESS_CACHE_DIR || path.join(os.homedir(), '.cache', 'bim-witness'));
  var excl = [cacheDir].concat((o.exclude || []).map(function (d) { return path.resolve(d); }));
  var file = path.resolve(o.file), rel = relOf(file, roots), args = o.args || [], ke = o.keyEnv || {};
  var key = sha(JSON.stringify([rel, args, Object.keys(ke).sort().map(function (k) { return [k, String(ke[k])]; }), process.version]));
  var entryF = path.join(cacheDir, key + '.json');
  if (!o.fresh && fs.existsSync(entryF)) {
    try {
      var E = JSON.parse(fs.readFileSync(entryF, 'utf8'));
      if (E.inputs.length && E.inputs.every(function (x) { return hashOf(x.k, x.p) === x.h; }))
        return { exit: E.exit, cached: true, key: key, inputs: E.inputs.length, skip: null,
                 out: '§CACHED ' + rel + ' inputs=' + E.inputs.length + ' key=' + key.slice(0, 12) + ' from=' + E.at + '\n' + E.out };
    } catch (e) { /* an unreadable entry is a miss */ }
  }
  var td = fs.mkdtempSync(path.join(os.tmpdir(), 'wtrace-'));
  var env = Object.assign({}, process.env, o.env || {}, {
    WITNESS_TRACE_DIR: td,
    NODE_OPTIONS: ((process.env.NODE_OPTIONS || '') + ' --require ' + JSON.stringify(TRACER)).trim()
  });
  var r = cp.spawnSync(process.execPath, ['-r', TRACER, file].concat(args), { cwd: o.cwd || path.dirname(file), env: env, encoding: 'utf8', timeout: o.timeout || 600000, maxBuffer: 1 << 28 });
  var out = (r.stdout || '') + (r.stderr || '');
  var T = { reads: {}, lists: {}, probes: {}, writes: {}, execd: {} }, nTrace = 0;
  fs.readdirSync(td).forEach(function (f) { try { var t = JSON.parse(fs.readFileSync(path.join(td, f), 'utf8')); nTrace++; Object.keys(T).forEach(function (k) { Object.assign(T[k], t[k] || {}); }); } catch (e) { /* skip */ } });
  fs.rmSync(td, { recursive: true, force: true });
  var keep = function (p) { return roots.some(function (rt) { return under(p, rt); }) && !/[\\/](node_modules|\.git)([\\/]|$)/.test(p) && !excl.some(function (d) { return under(p, d); }); };
  var writes = T.writes, wl = Object.keys(writes), seen = {}, inputs = [];
  var addF = function (p) { if (writes[p]) return; if (!keep(p) || seen['F' + p]) return; seen['F' + p] = 1; inputs.push({ k: 'F', p: p, h: hashOf('F', p) }); };
  Object.keys(T.reads).forEach(addF); Object.keys(T.probes).forEach(addF);
  Object.keys(T.lists).forEach(function (p) { if (!keep(p) || seen['L' + p] || wl.some(function (w) { return under(w, p); })) return; seen['L' + p] = 1; inputs.push({ k: 'L', p: p, h: hashOf('L', p) }); });
  var skip = null;
  var esm = Object.keys(T.execd).filter(function (p) { if (!keep(p)) return false; try { return /\bimport\s*\(/.test(fs.readFileSync(p, 'utf8')); } catch (e) { return false; } });
  if (esm.length) skip = 'esm-import (' + esm.map(function (p) { return relOf(p, roots); }).slice(0, 3).join(', ') + ')';
  else if (!nTrace) skip = 'no-trace';
  else if (!inputs.length) skip = 'no-inputs';
  if (r.status === 0 && !skip) {
    fs.mkdirSync(cacheDir, { recursive: true });
    var tmp = entryF + '.' + process.pid + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify({ file: rel, args: args, keyEnv: ke, node: process.version, at: new Date().toISOString(), exit: r.status, inputs: inputs, out: out }));
    fs.renameSync(tmp, entryF);
  }
  return { exit: r.status, cached: false, key: key, inputs: inputs.length, skip: skip, out: (skip ? '§CACHE_SKIP ' + rel + ' reason=' + skip + '\n' : '') + out };
}
module.exports = { runSync: runSync, run: function (o) { return Promise.resolve(runSync(o)); }, TRACER: TRACER };
