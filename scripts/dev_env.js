// Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
// SPDX-License-Identifier: MIT
/**
 * ⚠ DO NOT REMOVE — the "can a stranger get this input?" detector, prompts/TEAMWORK_FRAMEWORK.md §50.2. Witness: W-DEV-ENV (scripts/witness_dev_env.js).
 * classify(inputList, roots, manifest) -> the traced inputs a fresh clone would NOT have:
 *   untracked   — not in that repo's `git ls-files` (never added, or gitignored: `why` says which)
 *   lfs-pointer — tracked, but the content is a git-lfs pointer stub (LFS is OFF: a clone gets the stub, not the data)
 * Each carries manifest = ok | stale | missing against dev_env/manifest.json (ok = same sha256 as the file the witness read) and portable = (manifest === 'ok').
 * inputList = witness_cache.runSync(...).inputList ([{k:'F'|'L', p:abs, h}]); roots = [{ name, dir }]; listings and absent/dir probes are not files to fetch and are skipped.
 */
'use strict';
var fs = require('fs'), path = require('path'), cp = require('child_process');
var trackedCache = {};
function trackedOf(dir) {
  if (trackedCache[dir]) return trackedCache[dir];
  var r = cp.spawnSync('git', ['-C', dir, 'ls-files', '-z'], { encoding: 'utf8', maxBuffer: 1 << 28 }), t = {};
  (r.stdout || '').split('\0').forEach(function (f) { if (f) t[f] = 1; });
  return trackedCache[dir] = t;
}
function ignoredOf(dir, rels) {
  if (!rels.length) return {};
  var r = cp.spawnSync('git', ['-C', dir, 'check-ignore', '--stdin', '-z'], { input: rels.join('\0') + '\0', encoding: 'utf8' }), o = {};
  (r.stdout || '').split('\0').forEach(function (f) { if (f) o[f] = 1; });
  return o;
}
function isLfsPointer(abs) {
  try { var st = fs.statSync(abs); if (st.size > 1024) return false; return fs.readFileSync(abs, 'utf8').indexOf('version https://git-lfs.github.com/spec/') === 0; } catch (e) { return false; }
}
function loadManifest(bcRoot) { try { return JSON.parse(fs.readFileSync(path.join(bcRoot, 'dev_env', 'manifest.json'), 'utf8')); } catch (e) { return { entries: [] }; } }
function classify(inputList, roots, manifest) {
  var out = [], ents = (manifest && manifest.entries) || [], seen = {};
  var files = (inputList || []).filter(function (x) { return x.k === 'F' && x.h !== 'ABSENT' && x.h !== 'DIR'; });
  roots.forEach(function (rt) {
    var dir = path.resolve(rt.dir), mine = files.filter(function (x) { return x.p.indexOf(dir + path.sep) === 0; });
    var rels = mine.map(function (x) { return path.relative(dir, x.p).split(path.sep).join('/'); });
    var tracked = trackedOf(dir), ign = ignoredOf(dir, rels.filter(function (r) { return !tracked[r]; }));
    mine.forEach(function (x, i) {
      var k = { rel: rels[i], abs: x.p }; if (seen[rt.name + ':' + k.rel]) return; seen[rt.name + ':' + k.rel] = 1;
      var mk = function (kind) {
        var e = ents.filter(function (m) { return m.repo === rt.name && m.path === k.rel; })[0];
        var st = !e ? 'missing' : e.sha256 === x.h ? 'ok' : 'stale';
        var bytes = null; try { bytes = fs.statSync(k.abs).size; } catch (er) { /* gone since the run */ }
        return { repo: rt.name, path: k.rel, abs: k.abs, kind: kind, why: kind === 'untracked' ? (ign[k.rel] ? 'gitignored' : 'not-in-git') : 'lfs-stub', bytes: bytes, sha256: x.h, manifest: st, portable: st === 'ok' };
      };
      if (!tracked[k.rel]) return out.push(mk('untracked'));
      if (isLfsPointer(k.abs)) return out.push(mk('lfs-pointer'));
    });
  });
  return out;
}
module.exports = { classify: classify, loadManifest: loadManifest, isLfsPointer: isLfsPointer, _resetCache: function () { trackedCache = {}; } };
