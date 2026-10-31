// Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
// SPDX-License-Identifier: MIT
// treatments/fact.js — FACT: a device declares facts to the hub (UP), the hub addresses facts to one device (DOWN) (prompts/TEAMWORK_FRAMEWORK.md §16.18, §22.3).
'use strict';
var SEAL = require('../seal.js');
// SEALING (§29): a row with `seal: <audience>` is stored as AES-GCM ciphertext under HMAC-derived names; a device opens only with a key it holds. No `seal` => plaintext, as before.
function shelfPut(w, dev, row, v, f, plainName) {                        // -> the shelf name actually used
  if (!row.seal || w.opts.noSeal) { v.put(plainName, f); return plainName; }
  var k = dev.keys && dev.keys[row.seal]; if (!k) throw new Error('device ' + dev.id + ' holds no key for audience ' + row.seal);
  var n = 'o/' + dev.id + '/' + row.name + '/' + SEAL.name(k, f, w.opts, w.h12); v.put(n, SEAL.seal(k, f, row.seal, w.opts)); return n; }
function openFact(w, who, raw) {                                          // who = a device or 'HUB' -> { fact } | { err: 'nokey' | 'tampered' }; a client tries EVERY key it holds (its keyring)
  if (!raw || !raw.seal) return { fact: raw };
  var ring = (who === 'HUB' ? w.hubKeys : who.keys) || {}, labels = Object.keys(ring), order = ring[raw.seal] ? [raw.seal].concat(labels.filter(function (l) { return l !== raw.seal; })) : labels;
  for (var i = 0; i < order.length; i++) { try { return { fact: SEAL.open(ring[order[i]], raw, w.opts) }; } catch (e) { /* not this key */ } }
  if (w.opts.skipAudCheck) { try { return { fact: SEAL.open(SEAL.key(raw.seal, w.opts), raw, w.opts) }; } catch (e) { /* MUTANT switch only */ } }
  var tam = !!ring[raw.seal]; if (tam) w.stats.tampered = (w.stats.tampered || 0) + 1; else w.stats.unreadable = (w.stats.unreadable || 0) + 1;
  return { err: tam ? 'tampered' : 'nokey' }; }
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
  while (q.length) { var f = q.shift(), n = shelfPut(w, dev, row, v, f, 'o/' + dev.id + '/' + row.name + '/' + f.key + '.' + w.h12(f.fields));
    w.stats.sent++; w.log(dev.id, 'put', { flow: row.name, key: f.key, name: n }); ingest(w, dev, row, m, f, n); }
  Object.keys(w.dev).sort().forEach(function (id) { if (w.dev[id].role !== row.role) return;
    v.list('o/' + id + '/' + row.name + '/').forEach(function (n) { if (m.seen[n]) return; var o = openFact(w, dev, v.get(n)); if (o.fact) ingest(w, dev, row, m, o.fact, n); else { m.seen[n] = 1; w.log(dev.id, o.err, { flow: row.name }); } }); });
}
function fresh(dev) { dev.out = {}; dev.inbox = []; dev.seen = {}; dev.ledger = []; }
require('../treat.js').register('FACT', {
  needs: ['dir', 'group'],
  deviceInit: function (w, dev, o) { fresh(dev); dev.keys = {}; ((o && o.audiences) || []).forEach(function (a) { dev.keys[a] = SEAL.key(a, w.opts); }); },   // audience keys a device holds survive a wipe, like its signing key                          // the device-side state FACT owns: unsent queue, received inbox, seen names, local ledger
  deviceReset: function (w, dev) { fresh(dev); },
  unsent: function (w, dev) { return Object.keys(dev.out).reduce(function (n, k) { return n + dev.out[k].length; }, 0); },
  enqueue: function (w, dev, row, key, fields) {                         // a LOCAL action: queued and ledgered, touches no pipe
    var f = { flow: row.name, key: key, fields: fields, by: dev.id }; (dev.out[row.name] = dev.out[row.name] || []).push(f); dev.ledger.push(f);
    w.log(dev.id, 'local-sale', { flow: row.name, key: key, qty: fields.QtyEntered }); },
  hubInit: function (w) { w.hub.rec = {}; w.hub.seen = {}; w.hub.dups = 0; w.hub.collisions = []; w.hubKeys = {}; (w.opts.hubAudiences || []).forEach(function (a) { w.hubKeys[a] = SEAL.key(a, w.opts); }); },
  hubReset: function (w) { w.hub.rec = {}; w.hub.seen = {}; w.hub.dups = 0; w.hub.collisions = []; },
  hubSummary: function (w) { return { records: Object.keys(w.hub.rec).length }; },
  hubSend: function (w, row, station, f) { var k = row.seal && !w.opts.noSeal && w.hubKeys[row.seal], n = k ? 'd/' + station + '/' + row.name + '/' + SEAL.name(k, f, w.opts, w.h12) : 'd/' + station + '/' + row.name + '/' + f.key + '.' + w.h12(f.fields); w.relay.put(n, k ? SEAL.seal(k, f, row.seal, w.opts) : f); w.log('HUB', 'send', { flow: row.name, to: station, key: f.key }); },
  restore: function (w, dev, v) {                                         // fold back: own facts (fanned out to every treatment), own down-facts into the inbox
    var own = 0, down = 0;
    v.list('o/' + dev.id + '/').forEach(function (n) { var o = openFact(w, dev, v.get(n)); if (!o.fact) return; own++; dev.ledger.push(o.fact); w.each('restoreFact', dev, o.fact); });
    v.list('d/' + dev.id + '/').forEach(function (n) { if (dev.seen[n]) return; dev.seen[n] = 1; var o = openFact(w, dev, v.get(n)); if (!o.fact) return; dev.inbox.push(o.fact); down++; });
    return { own: own, down: down }; },
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
    if (row.seal !== undefined && (typeof row.seal !== 'string' || !row.seal)) e.push('FACT seal must be an audience name');
    if (row.audience === 'space' && row.dir !== 'BOTH') e.push('FACT audience space needs dir BOTH');
    if (row.dir === 'BOTH' && row.audience !== 'space') e.push('FACT dir BOTH needs audience space (a star has no both-ways)');
    return e;
  },
  openFact: function (w, who, row, raw) { return openFact(w, who, raw); },   // read one shelf value as 'who' (a device or 'HUB'): { fact } or { err }
  sealKey: function (w, aud) { return SEAL.key(aud, w.opts); }, sealName: function (k, f) { return SEAL.name(k, f, {}, null); },
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
      while (q.length) { var f = q.shift(); var n = shelfPut(w, dev, row, v, f, 'o/' + dev.id + '/' + row.name + '/' + f.key + (w.opts.noContentAddr ? '' : '.' + w.h12(f.fields)));
        w.stats.sent++; w.log(dev.id, 'put', { flow: row.name, key: f.key, name: n }); }
    } else {
      v.list('d/' + dev.id + '/' + row.name + '/').forEach(function (n) { if (dev.seen[n]) return; dev.seen[n] = 1;
        var o = openFact(w, dev, v.get(n)); if (!o.fact) return w.log(dev.id, o.err, { flow: row.name }); dev.inbox.push(o.fact); w.log(dev.id, 'recv', { flow: row.name, key: o.fact.key }); });
    }
  },
  hubVisit: function (w, row) {
    if (row.dir !== 'UP') return;
    w.relay.list('o/').forEach(function (n) {
      if (n.indexOf('/' + row.name + '/') === -1 || w.hub.seen[n]) return; w.hub.seen[n] = 1;
      var o = openFact(w, 'HUB', w.relay.get(n)); if (!o.fact) return w.log('HUB', o.err, { flow: row.name });   // not readable / tampered: never accepted
      var f = o.fact, rk = row.name + '|' + f.key, ch = w.h12(f.fields), have = w.hub.rec[rk];
      if (!have) { w.hub.rec[rk] = { hash: ch, f: f }; w.log('HUB', 'accept', { flow: row.name, key: f.key, from: f.by }); w.afterAccept(row, f); }
      else if (have.hash === ch) { w.hub.dups++; w.log('HUB', 'duplicate', { flow: row.name, key: f.key }); }
      else if (!w.opts.noCollisionFlag) { w.hub.collisions.push({ flow: row.name, key: f.key, from: f.by, have: have.hash, got: ch }); w.log('HUB', 'COLLISION', { flow: row.name, key: f.key, from: f.by }); }   // I3: flagged, never overwritten
    });
  }
});
