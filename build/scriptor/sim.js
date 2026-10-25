// Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
// SPDX-License-Identifier: MIT
// sim.js — the abstract engine: a dumb relay (put/get/list only), devices that see only their own prefixes (I1), and one hub.
// Implementing prompts/TEAMWORK_FRAMEWORK.md §16.18. Switches in opts (noScope, noContentAddr, noCollisionFlag, noGuard, noApplyOnce,
// noSigCheck, noReconcile) are MUTANT switches for W-TREAT-MUTANTS only.
'use strict';
var crypto = require('crypto'), TREAT = require('./treat.js');
var DAY = 86400000;
function canon(o) { if (o === null || typeof o !== 'object') return JSON.stringify(o); if (Array.isArray(o)) return '[' + o.map(canon).join(',') + ']';
  return '{' + Object.keys(o).sort().map(function (k) { return JSON.stringify(k) + ':' + canon(o[k]); }).join(',') + '}'; }
function h12(o) { return crypto.createHash('sha256').update(typeof o === 'string' ? o : canon(o)).digest('hex').slice(0, 12); }

function Relay(n, noMirrorWrite) {                                       // a dumb shelf: put/get/list only; n>1 = mirrored pipes (the blind mailbox device, §16.20)
  var rs = []; for (var i = 0; i < n; i++) rs.push({ m: {}, alive: true });
  var r = { ops: 0,
    put: function (nm, v) { r.ops++; rs.forEach(function (x, j) { if (x.alive && !(noMirrorWrite && j > 0)) x.m[nm] = v; }); },
    get: function (nm) { r.ops++; for (var j = 0; j < rs.length; j++) if (rs[j].alive && nm in rs[j].m) return rs[j].m[nm]; },
    list: function (p) { r.ops++; var u = {}; rs.forEach(function (x) { if (x.alive) Object.keys(x.m).forEach(function (k) { if (k.indexOf(p) === 0) u[k] = 1; }); }); return Object.keys(u).sort(); },
    names: function () { var u = {}; rs.forEach(function (x) { if (x.alive) Object.keys(x.m).forEach(function (k) { u[k] = 1; }); }); return Object.keys(u).sort(); },
    kill: function (j) { rs[j].m = {}; rs[j].alive = false; } };
  return r;
}

function World(rows, procs, opts) {
  this.opts = opts || {}; this.relay = Relay(this.opts.mirror ? 2 : 1, this.opts.noMirrorWrite); this.procs = procs || {}; this.rows = TREAT.expand(rows);
  this.now = Date.UTC(2026, 9, 25, 9, 0, 0); this.dev = {}; this.trace = [];
  this.hub = { rec: {}, seen: {}, dups: 0, collisions: [], acct: {}, state: {}, ver: 0 };
  this.stats = { fetch: 0, skipped: 0, scopeViolations: 0, sent: 0 };
  this.canon = canon; this.h12 = h12;
}
World.prototype.day = function () { return Math.floor(this.now / DAY); };
World.prototype.log = function (actor, kind, d) { var e = { t: this.now, actor: actor, kind: kind }; for (var k in d) e[k] = d[k]; this.trace.push(e); return e; };
World.prototype.advance = function (ms) { this.now += ms; };
World.prototype.setTime = function (t) { this.now = t; };
World.prototype.addDevice = function (id, role, o) {
  var d = { id: id, role: role, out: {}, inbox: [], seen: {}, pull: {}, applied: {}, balance: 0, seq: 0, ledger: [] };
  if (o && o.signer) { var kp = crypto.generateKeyPairSync('ed25519'); d.priv = kp.privateKey; d.pub = kp.publicKey.export({ type: 'spki', format: 'der' }).toString('hex'); }
  this.dev[id] = d; return d;
};
World.prototype.view = function (dev) {                                  // I1: a device sees only the prefixes the registered treatments grant it
  var self = this, ok = [];
  Object.keys(TREAT.T).sort().forEach(function (n) { if (TREAT.T[n].scope) ok = ok.concat(TREAT.T[n].scope(self, dev)); });
  function chk(n) { if (self.opts.noScope) return; if (!ok.some(function (p) { return n.indexOf(p) === 0; })) { self.stats.scopeViolations++; throw new Error('out-of-scope ' + dev.id + ' ' + n); } }
  return { put: function (n, v) { chk(n); self.relay.put(n, v); }, get: function (n) { chk(n); return self.relay.get(n); }, list: function (p) { chk(p); return self.relay.list(p); } };
};
World.prototype.rosterValue = function () { var c = {}; for (var k in this.dev) if (this.dev[k].pub) c[k] = this.dev[k].pub; return { cashiers: c }; };
World.prototype.rowByName = function (n) { return this.rows.filter(function (r) { return r.name === n; })[0]; };
World.prototype.publish = function (name, value) { var r = this.rowByName(name), t = TREAT.get(r.treatment); if (!t || !t.publish) throw new Error('no publish point on ' + r.treatment); t.publish(this, r, value); };
World.prototype.hubSend = function (row, station, f) { var n = 'd/' + station + '/' + row.name + '/' + f.key + '.' + h12(f.fields); this.relay.put(n, f); this.log('HUB', 'send', { flow: row.name, to: station, key: f.key }); };
World.prototype.afterAccept = function (row, f) {                        // a fact was accepted: every registered treatment that listens gets to see it
  var self = this;
  this.rows.forEach(function (r) { var t = TREAT.get(r.treatment); if (t && t.onAccept) t.onAccept(self, r, row, f); });
};
World.prototype.setLink = function (id, up) { this.dev[id].link = up; this.log(id, up ? 'link-up' : 'link-down', {}); };
World.prototype.visit = function (id) {                                  // a visit = the device's only online window; a down link = a failed visit (no pipe calls)
  var dev = this.dev[id], v = this.view(dev), self = this;
  if (dev.link === false && !this.opts.noLinkCheck) { this.log(id, 'visit-failed', { queued: Object.keys(dev.out).reduce(function (n, k) { return n + dev.out[k].length; }, 0) }); return; }
  this.log(id, 'online', {}); var e = this.log(id, 'visit', {}), n0 = this.trace.length;
  this.rows.forEach(function (r) { var t = TREAT.get(r.treatment); if (t && t.deviceVisit) t.deviceVisit(self, dev, r, v); });
  e.moved = this.trace.slice(n0).filter(function (x) { return x.kind === 'put' || x.kind === 'recv' || x.kind === 'pull'; }).length; this.log(id, 'offline', {}); };
World.prototype.hubVisit = function (why) { var self = this; this.log('HUB', 'online', {}); var e = this.log('HUB', 'hub-visit', why ? { why: why } : {}), n0 = this.trace.length;
  this.rows.forEach(function (r) { var t = TREAT.get(r.treatment); if (t && t.hubVisit) t.hubVisit(self, r); });
  e.moved = this.trace.slice(n0).filter(function (x) { return x.kind === 'accept' || x.kind === 'send'; }).length; this.log('HUB', 'offline', {}); };
World.prototype.hubSession = function (fn) { this.log('HUB', 'online', {}); fn(); this.log('HUB', 'offline', {}); };   // the admin device touches the shelf only inside a window
World.prototype.sell = function (dev, row, key, fields) {                // a LOCAL action: touches no pipe (W-TREAT-LOCAL)
  var f = { flow: row.name, key: key, fields: fields, by: dev.id }; (dev.out[row.name] = dev.out[row.name] || []).push(f); dev.ledger.push(f);
  this.log(dev.id, 'local-sale', { flow: row.name, key: key, qty: fields.QtyEntered }); };
// ---- failure and fold-back (§16.20) ----
World.prototype.wipe = function (id) {                                   // the device is lost: local state gone; unsent facts are the exposure
  var dev = this.dev[id], unsent = Object.keys(dev.out).reduce(function (n, k) { return n + dev.out[k].length; }, 0);
  dev.out = {}; dev.inbox = []; dev.seen = {}; dev.pull = {}; dev.applied = {}; dev.balance = 0; dev.seq = 0; dev.ledger = [];
  this.log(id, 'fail', { unsent: unsent }); return unsent; };
World.prototype.restore = function (id) {                                // fold back from the shelf: own prefix, own down-facts, seeds
  if (this.opts.noRestore) return; var dev = this.dev[id], v = this.view(dev), own = 0, down = 0;
  v.list('o/' + id + '/').forEach(function (n) { var f = v.get(n); own++; dev.ledger.push(f);
    if (/\.applied$/.test(f.flow)) { dev.applied[f.key] = 1; dev.balance += f.fields.delta; } if (/\.issued$/.test(f.flow)) dev.seq++; });
  v.list('d/' + id + '/').forEach(function (n) { if (dev.seen[n]) return; dev.seen[n] = 1; dev.inbox.push(v.get(n)); down++; });
  this.visit(id); this.log(id, 'restore', { own: own, down: down }); };
World.prototype.hubRebuild = function () {                               // the admin device is lost: derived state is rebuilt by re-reading the shelf
  this.hub.rec = {}; this.hub.seen = {}; this.hub.dups = 0; this.hub.collisions = []; this.hub.acct = {}; this.hub.state = {};
  this.log('HUB', 'fail', {}); if (this.opts.noRestore) return; this.hubVisit('rebuild'); this.log('HUB', 'rebuild', { records: Object.keys(this.hub.rec).length }); };
World.prototype.kill = function (i) { this.relay.kill(i); this.log('PIPE', 'fail', { pipe: i }); };

World.prototype.cycle = function () { var self = this; Object.keys(this.dev).forEach(function (i) { self.visit(i); }); this.hubVisit(); Object.keys(this.dev).forEach(function (i) { self.visit(i); }); };
module.exports = { World: World, canon: canon, h12: h12 };
