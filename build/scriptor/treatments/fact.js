// Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
// SPDX-License-Identifier: MIT
// treatments/fact.js — FACT: a device declares facts to the hub (UP), the hub addresses facts to one device (DOWN) (prompts/TEAMWORK_FRAMEWORK.md §16.18, §22.3).
'use strict';
// MESH (§16.18b, §22.5): audience 'space' + dir BOTH — every member of the row's role authors AND ingests the others' facts; nobody derives for anybody.
function ingest(w, dev, row, m, f, n) {
  m.seen[n] = 1; var ch = w.h12(f.fields), k = m.keys[f.key];
  if (!k) { m.keys[f.key] = { hashes: {} }; m.keys[f.key].hashes[ch] = f; w.log(dev.id, 'accept', { flow: row.name, key: f.key, from: f.by }); return; }
  if (k.hashes[ch]) { w.log(dev.id, 'duplicate', { flow: row.name, key: f.key }); return; }
  if (!w.opts.noCollisionFlag) { m.collisions.push({ key: f.key, got: ch, have: Object.keys(k.hashes) }); w.log(dev.id, 'COLLISION', { flow: row.name, key: f.key, from: f.by }); }   // flagged, both versions kept
  if (w.opts.keepLatest) k.hashes = {};                                 // MUTANT switch only
  k.hashes[ch] = f;
}
function mesh(w, dev, row, v) {
  var m = (dev.mesh = dev.mesh || {})[row.name] || (dev.mesh[row.name] = { keys: {}, collisions: [], seen: {} }), q = dev.out[row.name] || [];
  while (q.length) { var f = q.shift(), n = 'o/' + dev.id + '/' + row.name + '/' + f.key + '.' + w.h12(f.fields);
    v.put(n, f); w.stats.sent++; w.log(dev.id, 'put', { flow: row.name, key: f.key, name: n }); ingest(w, dev, row, m, f, n); }
  Object.keys(w.dev).sort().forEach(function (id) { if (w.dev[id].role !== row.role) return;
    v.list('o/' + id + '/' + row.name + '/').forEach(function (n) { if (!m.seen[n]) ingest(w, dev, row, m, v.get(n), n); }); });
}
require('../treat.js').register('FACT', {
  needs: ['dir', 'group'],
  scope: function (w, dev) {                                            // I1: own up/down prefixes; a space flow adds that flow's prefix of every member
    var ok = ['o/' + dev.id + '/', 'd/' + dev.id + '/'];
    if (w.opts.noSpaceScope) return ok;
    w.rows.forEach(function (r) { if (r.treatment !== 'FACT' || r.audience !== 'space' || (r.role !== dev.role && !w.opts.audienceIgnored)) return;
      Object.keys(w.dev).forEach(function (id) { if (w.dev[id].role === r.role) ok.push('o/' + id + '/' + r.name + '/'); }); });
    return ok;
  },
  check: function (row) {                                               // the declaration is checked at compile time (§16.18b)
    var e = [];
    if (['UP', 'DOWN', 'BOTH'].indexOf(row.dir) === -1) e.push('FACT dir must be UP, DOWN or BOTH');
    if (row.audience !== undefined && row.audience !== 'hub' && row.audience !== 'space') e.push('FACT audience must be hub or space');
    if (row.audience === 'space' && row.dir !== 'BOTH') e.push('FACT audience space needs dir BOTH');
    if (row.dir === 'BOTH' && row.audience !== 'space') e.push('FACT dir BOTH needs audience space (a star has no both-ways)');
    return e;
  },
  fold: function (w, dev, row) {                                        // the ONE derivation function of a space flow: same facts -> same hash on every member
    var m = dev.mesh && dev.mesh[row.name]; if (!m) return null;
    var ks = Object.keys(m.keys); if (!w.opts.foldInsertionOrder) ks.sort();   // foldInsertionOrder = MUTANT switch only
    return w.h12(ks.map(function (k) { return [k, Object.keys(m.keys[k].hashes).sort()]; }));
  },
  deviceVisit: function (w, dev, row, v) {
    if (dev.role !== row.role) return;
    if (row.audience === 'space') return mesh(w, dev, row, v);
    if (row.dir === 'UP') {                                             // I2: name = flow/key.content-hash -> idempotent, immutable
      var q = dev.out[row.name] || [];
      while (q.length) { var f = q.shift(); var n = 'o/' + dev.id + '/' + row.name + '/' + f.key + (w.opts.noContentAddr ? '' : '.' + w.h12(f.fields));
        v.put(n, f); w.stats.sent++; w.log(dev.id, 'put', { flow: row.name, key: f.key, name: n }); }
    } else {
      v.list('d/' + dev.id + '/' + row.name + '/').forEach(function (n) { if (dev.seen[n]) return; dev.seen[n] = 1;
        var f = v.get(n); dev.inbox.push(f); w.log(dev.id, 'recv', { flow: row.name, key: f.key }); });
    }
  },
  hubVisit: function (w, row) {
    if (row.dir !== 'UP') return;
    w.relay.list('o/').forEach(function (n) {
      if (n.indexOf('/' + row.name + '/') === -1 || w.hub.seen[n]) return; w.hub.seen[n] = 1;
      var f = w.relay.get(n), rk = row.name + '|' + f.key, ch = w.h12(f.fields), have = w.hub.rec[rk];
      if (!have) { w.hub.rec[rk] = { hash: ch, f: f }; w.log('HUB', 'accept', { flow: row.name, key: f.key, from: f.by }); w.afterAccept(row, f); }
      else if (have.hash === ch) { w.hub.dups++; w.log('HUB', 'duplicate', { flow: row.name, key: f.key }); }
      else if (!w.opts.noCollisionFlag) { w.hub.collisions.push({ flow: row.name, key: f.key, from: f.by, have: have.hash, got: ch }); w.log('HUB', 'COLLISION', { flow: row.name, key: f.key, from: f.by }); }   // I3: flagged, never overwritten
    });
  }
});
