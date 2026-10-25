#!/usr/bin/env node
// Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
// SPDX-License-Identifier: MIT
/**
 * witness_scriptor_treat.js — the abstract engine behind the flow rows. Spec: prompts/TEAMWORK_FRAMEWORK.md §16.18, §16.20 (+ §16.0a FL-1..FL-7, §16.17).
 * Code under test: build/scriptor/treat.js (treatments) + sim.js (engine, dumb relay). Rows: build/scriptor/flows.json (DATA).
 * Business logic lives ONLY in the PROCESS stubs below — stand-ins for the kernel's Generate Replenishment etc. The engine names no table.
 * SAMPLE DATA throughout (quantities, prices, amounts are made up for the run, not extracted from anything).
 *
 *   §W-TREAT-REGISTRY  §W-TREAT-STOCKLOOP  §W-TREAT-BLIND  §W-TREAT-TICKET  §W-TREAT-PULLGUARD  §W-TREAT-CODE  §W-TREAT-MICROFINANCE
 *   §W-TREAT-LOCAL (a user action touches no pipe)  §W-TREAT-ACTIVITY (the panel's data source)
 *   §W-TREAT-DEVICEFAIL  §W-TREAT-HUBFAIL  §W-TREAT-PIPEFAIL (fold-back, §16.20)
 *   §W-TREAT-ZEROCODE  §W-TREAT-MUTANTS (each broken invariant must turn >=1 arm red)
 * Run: node scripts/witness_scriptor_treat.js 2>&1 | tee build/scriptor/treat.log     (also writes build/scriptor/trace_*.json for the film)
 */
'use strict';
var path = require('path'), fs = require('fs'), crypto = require('crypto');
var SDIR = path.join(__dirname, '..', 'build', 'scriptor');
var S = require(path.join(SDIR, 'sim.js')), TREAT = require(path.join(SDIR, 'treat.js'));
var ROWS = JSON.parse(fs.readFileSync(path.join(SDIR, 'flows.json'), 'utf8'));
var day = function (w) { return new Date(w.now).toISOString().slice(0, 10); };
var MIN = 4, MAX = 10;                                                  // sample re-order levels
var I = TREAT.T.INSTRUMENT;

// ---- host PROCESS stubs (stand-ins for the kernel's standard processes; the engine only wires them) ----
// I7 replay-safe rules: the emitted key is a pure function of the triggering fact. opts.unsafeKeys is the MUTANT (a time-stamped key).
var PROCS = {
  GenerateReplenishment: function (hub, fact, w) {
    var st = hub.state.stock || (hub.state.stock = {}), stn = fact.by, p = fact.fields.M_Product_ID;
    st[stn] = st[stn] || {}; if (st[stn][p] === undefined) st[stn][p] = 10;      // the initial stock movement at setup (sample)
    st[stn][p] -= fact.fields.QtyEntered;
    if (st[stn][p] >= MIN) return [];
    var q = MAX - st[stn][p]; st[stn][p] += q;
    return [{ station: stn, key: 'MV/' + (w.opts.unsafeKeys ? w.now + '/' : '') + fact.key, fields: { M_Product_ID: p, M_Locator_ID: 'WH-HQ', M_LocatorTo_ID: 'LOC-' + stn, QtyEntered: q, C_UOM_ID: 100 } }];
  },
  ApplyPayment: function (hub, fact, w) {
    var o = hub.state.owing || (hub.state.owing = {}), b = fact.by; if (o[b] === undefined) o[b] = 5000;   // sample opening balance
    o[b] -= fact.fields.PayAmt;
    return [{ station: b, key: 'CF/' + fact.key, fields: { owing: o[b] } }];
  }
};

var judged = 0, fails = 0;
function mk(opts) {
  var w = new S.World(ROWS, PROCS, opts);
  w.addDevice('A', 103, { signer: true }); w.addDevice('B', 103, { signer: true });
  w.addDevice('PH1', 'PHONE'); w.addDevice('PH2', 'PHONE'); w.addDevice('BOR1', 'BORROWER'); w.addDevice('BOR2', 'BORROWER');
  w.publish('S0 roster', I.roster(w)); ['PH1', 'PH2'].forEach(function (i) { w.visit(i); }); return w;   // the phones hold the roster before any scan
}
function init(w, stn, prod, qty) { w.hubSend(w.rowByName('F2 replenishment-down'), stn, { flow: 'F2 replenishment-down', key: 'MV/INIT/' + stn, fields: { M_Product_ID: prod, M_Locator_ID: 'WH-HQ', M_LocatorTo_ID: 'LOC-' + stn, QtyEntered: qty, C_UOM_ID: 100 }, by: 'HUB' }); }
function localStock(dev, prod) {                                         // the branch's own ADVISORY copy: received movements - own sales (FL-2)
  var got = dev.inbox.filter(function (f) { return f.flow === 'F2 replenishment-down' && f.fields.M_Product_ID === prod; }).reduce(function (n, f) { return n + f.fields.QtyEntered; }, 0);
  var sold = dev.ledger.filter(function (f) { return f.flow === 'F1 pos-sales-up' && f.fields.M_Product_ID === prod; }).reduce(function (n, f) { return n + f.fields.QtyEntered; }, 0);
  return got - sold;
}
function line(w, dev, ticket, n, prod, qty) { w.sell(dev, w.rowByName('F1 pos-sales-up'), dev.id + '/' + day(w) + '/' + ticket + '/' + n, { M_Product_ID: prod, QtyEntered: qty, C_UOM_ID: 100 }); w.log(dev.id, 'local-stock', { product: prod, qty: localStock(dev, prod) }); }
function pulls(w, actor, flow) { return w.trace.filter(function (e) { return e.kind === 'pull' && e.actor === actor && e.flow === flow; }).length; }
function snap(w) { return w.canon({ stock: w.hub.state.stock || {}, owing: w.hub.state.owing || {}, acct: w.hub.acct, recs: Object.keys(w.hub.rec).sort() }); }
// one shared scenario for the fold-back arms: POS sales + replenishment, a cashier code, a borrower payment
function scenario(opts) {
  var w = mk(opts), A = w.dev.A, PH = w.dev.PH1, row = w.rowByName('I1 loyalty-code');
  w.publish('S1 price-list-seed', 'PL-v1'); init(w, 'A', 'P-COLA', 10); w.visit('A');
  line(w, A, 1, 1, 'P-COLA', 3); line(w, A, 2, 1, 'P-COLA', 3); line(w, A, 3, 1, 'P-COLA', 2);
  var e = I.issue(w, A, row, { account: 'ACC1', delta: 100, kind: 'earn', claimed: 0 }); w.advance(60000); I.apply(w, PH, row, e);
  var r = I.issue(w, A, row, { account: 'ACC1', delta: -100, kind: 'redeem', claimed: PH.balance }); w.advance(60000); I.apply(w, PH, row, r);
  w.publish('S2 gold-price', 2300); var pay = w.rowByName('P1 borrower-payment-up'); w.visit('BOR1');
  w.sell(w.dev.BOR1, pay, 'BOR1/' + day(w) + '/SLIP-1', { C_BPartner_ID: 'BOR1', PayAmt: 1500 });
  w.cycle(); w.cycle(); w.red1 = r; w.row = row; return w;
}

// ---- every arm as a function of opts, so mutants can re-run them against a broken invariant ----
function arms(opts, log, keep) {
  var red = [], keepT = {};
  function arm(name, ok, detail) { if (log) judged++; if (!ok) { red.push(name); if (log) fails++; } if (log) console.log('   ' + (ok ? '🟢' : '🔴') + ' ' + name + (detail ? ' — ' + detail : '')); }

  // REGISTRY
  var errs = []; ROWS.forEach(function (r) { if (r.treatment) TREAT.validate(r).forEach(function (e) { errs.push(r.name + ': ' + e); }); });
  var bad1 = TREAT.validate({ name: 'x', treatment: 'WIZARD' }), bad2 = TREAT.validate({ name: 'y', treatment: 'RULE', on: 'a' });
  arm('W-TREAT-REGISTRY', errs.length === 0 && bad1.length === 1 && bad2.length === 2, ROWS.length + ' rows, every treatment resolves and its params are present; control unknown treatment -> ' + JSON.stringify(bad1) + ', RULE missing params -> ' + JSON.stringify(bad2));

  // STOCKLOOP (Unicenta POS case) + BLIND
  var w = mk(opts), A = w.dev.A, B = w.dev.B;
  w.publish('S1 price-list-seed', 'PL-v1'); init(w, 'A', 'P-COLA', 10); w.cycle();
  line(w, A, 1, 1, 'P-COLA', 3); line(w, A, 2, 1, 'P-COLA', 3); line(w, A, 3, 1, 'P-COLA', 2);
  w.cycle(); w.cycle();
  var mv = A.inbox.filter(function (f) { return f.flow === 'F2 replenishment-down' && f.key.indexOf('INIT') === -1; });
  var hubStock = w.hub.state.stock && w.hub.state.stock.A && w.hub.state.stock.A['P-COLA'], localS = localStock(A, 'P-COLA');
  var names0 = w.relay.names().length; w.hubVisit(); w.cycle();
  arm('W-TREAT-STOCKLOOP', Object.keys(w.hub.rec).filter(function (k) { return k.indexOf('F1 ') === 0; }).length === 3 && mv.length === 1 && mv[0].fields.QtyEntered === 8 && B.inbox.length === 0 &&
    hubStock === 10 && localS === hubStock && w.relay.names().length === names0,
    '3 sale lines up -> hub derived stock ' + hubStock + ' -> ' + mv.length + ' replenishment (qty ' + (mv[0] && mv[0].fields.QtyEntered) + ') to branch A only (B inbox ' + B.inbox.length + '); branch advisory stock ' + localS + ' = hub ' + hubStock + '; replaying the visits added ' + (w.relay.names().length - names0) + ' objects');
  var threw = false; try { w.view(A).get('d/B/F2 replenishment-down/x'); } catch (e) { threw = /out-of-scope/.test(e.message); }
  arm('W-TREAT-BLIND', w.stats.scopeViolations === (opts.noScope ? 0 : 1) && threw, 'no device made an out-of-scope call during the run; a deliberate read of another branch\'s prefix ' + (threw ? 'THREW' : 'was ALLOWED'));
  keepT.pos = w.trace;

  // TICKET: idempotent + collision flagged, never overwritten
  var t = mk(opts), TA = t.dev.A; line(t, TA, 7, 1, 'P-COLA', 1); t.cycle(); var h1 = t.hub.rec['F1 pos-sales-up|A/' + day(t) + '/7/1'].hash;
  line(t, TA, 7, 1, 'P-COLA', 1); t.cycle();                           // the same ticket again (idempotent)
  var recs1 = Object.keys(t.hub.rec).length;
  line(t, TA, 7, 1, 'P-COLA', 9); t.cycle();                           // a restored branch re-issues the same key with different content
  arm('W-TREAT-TICKET', recs1 === 1 && t.hub.collisions.length === 1 && t.hub.rec['F1 pos-sales-up|A/' + day(t) + '/7/1'].hash === h1,
    'same ticket twice = ' + recs1 + ' record; same key with different content -> ' + t.hub.collisions.length + ' collision flagged, original hash ' + (t.hub.rec['F1 pos-sales-up|A/' + day(t) + '/7/1'].hash === h1 ? 'kept' : 'OVERWRITTEN'));

  // PULLGUARD
  var p = mk(opts), PA = p.dev.A; p.publish('S1 price-list-seed', 'PL-v1'); p.publish('S2 gold-price', 2300);
  p.visit('A'); p.visit('A'); var d1 = pulls(p, 'A', 'S1 price-list-seed');
  p.advance(86400000); p.visit('A'); var d2 = pulls(p, 'A', 'S1 price-list-seed');
  PA.pull['S1 price-list-seed'].val = null; p.visit('A'); var d3 = pulls(p, 'A', 'S1 price-list-seed');
  ['BOR1', 'BOR2', 'PH1', 'B'].forEach(function (i) { p.visit(i); });
  var pubAll = ['BOR1', 'BOR2', 'PH1', 'B', 'A'].every(function (i) { return p.dev[i].pull['S2 gold-price'] && p.dev[i].pull['S2 gold-price'].val === 2300; });
  arm('W-TREAT-PULLGUARD', d1 === 1 && d2 === 2 && d3 === 3 && pubAll && !p.dev.BOR1.pull['S1 price-list-seed'],
    'two visits the same day = ' + d1 + ' fetch; next day = ' + d2 + '; value vanished -> refetch = ' + d3 + '; public gold price reached all 5 devices unaddressed: ' + pubAll + '; the addressed price list reached no borrower');

  // CODE (loyalty / return)
  var c = mk(opts), CA = c.dev.A, CB = c.dev.B, PH = c.dev.PH1, row = c.rowByName('I1 loyalty-code'), bal = [];
  var earn = I.issue(c, CA, row, { account: 'ACC1', delta: 100, kind: 'earn', claimed: 0 }); c.advance(60000); I.apply(c, PH, row, earn); bal.push(PH.balance);
  var red1 = I.issue(c, CA, row, { account: 'ACC1', delta: -100, kind: 'redeem', claimed: PH.balance }); c.advance(60000); I.apply(c, PH, row, red1); bal.push(PH.balance);
  var again = I.apply(c, PH, row, red1); bal.push(PH.balance);
  var fk = crypto.generateKeyPairSync('ed25519'), forged = { code: { id: 'A-99', account: 'ACC1', delta: 500, kind: 'earn', issuer: 'A', t: c.now }, sig: '' };
  forged.sig = crypto.sign(null, Buffer.from(c.canon(forged.code)), fk.privateKey).toString('hex'); var fr = I.apply(c, PH, row, forged);
  var e2 = I.issue(c, CA, row, { account: 'ACC2', delta: 50, kind: 'earn', claimed: 0 }); c.advance(60000); I.apply(c, c.dev.PH2, row, e2);
  var r2 = I.issue(c, CA, row, { account: 'ACC2', delta: -50, kind: 'redeem', claimed: 50 }); c.advance(60000); I.apply(c, c.dev.PH2, row, r2);
  c.cycle(); var f0 = I.reconcile(c);
  PH.balance = 100; PH.applied = {};                                   // the phone is restored to an older state (the tamper case)
  c.advance(60000); var r3 = I.issue(c, CB, row, { account: 'ACC1', delta: -100, kind: 'redeem', claimed: PH.balance }); I.apply(c, PH, row, r3);
  c.cycle(); var f1 = I.reconcile(c);
  arm('W-TREAT-CODE', bal.join(',') === '100,0,0' && again === 'noop' && fr === 'bad-sig' && f0.length === 0 && f1.length === 1 && f1[0].account === 'ACC1' && f1[0].kind === 'overspend',
    'balance after earn/redeem/second scan ' + bal.join(',') + ' (second scan ' + again + '); forged code ' + fr + '; honest accounts flagged ' + f0.length + '; after the phone was rolled back and redeemed again -> ' + JSON.stringify(f1));
  keepT.code = c.trace;

  // MICROFINANCE
  var m = mk(opts), M1 = m.dev.BOR1, M2 = m.dev.BOR2; m.publish('S2 gold-price', 2300);
  M1.gramsHeld = 12; m.visit('BOR1'); m.visit('BOR1'); var fund = M1.pull['S2 gold-price'].val * M1.gramsHeld;
  m.log('BOR1', 'local-fund', { grams: 12, price: M1.pull['S2 gold-price'].val, value: fund });
  var pay = m.rowByName('P1 borrower-payment-up');
  m.sell(M1, pay, 'BOR1/' + day(m) + '/SLIP-1', { C_BPartner_ID: 'BOR1', PayAmt: 1500 }); m.cycle(); m.sell(M1, pay, 'BOR1/' + day(m) + '/SLIP-1', { C_BPartner_ID: 'BOR1', PayAmt: 1500 }); m.cycle(); m.cycle();
  var payRecs = Object.keys(m.hub.rec).filter(function (k) { return k.indexOf('P1 ') === 0; }).length;
  arm('W-TREAT-MICROFINANCE', fund === 27600 && pulls(m, 'BOR1', 'S2 gold-price') === 1 && payRecs === 1 && m.hub.state.owing.BOR1 === 3500 && M1.inbox.length === 1 && M1.inbox[0].fields.owing === 3500 && M2.inbox.length === 0,
    'two app opens = ' + pulls(m, 'BOR1', 'S2 gold-price') + ' price fetch; fund value computed on the phone = ' + fund + '; the same slip twice = ' + payRecs + ' payment; hub derived owing ' + (m.hub.state.owing && m.hub.state.owing.BOR1) + '; confirmation reached BOR1 (' + M1.inbox.length + ') and not BOR2 (' + M2.inbox.length + ')');
  keepT.mf = m.trace;

  // LOCAL: a user action touches no pipe; the control (a visit) does
  var l = scenario(opts), o0 = l.relay.ops; line(l, l.dev.A, 9, 1, 'P-COLA', 1); var oSale = l.relay.ops - o0;
  var cd = I.issue(l, l.dev.A, l.row, { account: 'ACC1', delta: 10, kind: 'earn', claimed: 0 }); o0 = l.relay.ops; I.apply(l, l.dev.PH1, l.row, cd); var oApply = l.relay.ops - o0;
  o0 = l.relay.ops; l.visit('A'); var oVisit = l.relay.ops - o0;
  arm('W-TREAT-LOCAL', oSale === 0 && oApply === 0 && oVisit > 0, 'a sale made ' + oSale + ' pipe calls; scanning a cashier code made ' + oApply + '; control: one visit made ' + oVisit);

  // ACTIVITY: the panel's data source — classify the trace
  var kinds = {}; keepT.pos.forEach(function (e) { kinds[e.kind] = (kinds[e.kind] || 0) + 1; });
  var shapeOk = keepT.pos.concat(keepT.code, keepT.mf).every(function (e) { return e.actor && typeof e.t === 'number' && e.kind; });
  arm('W-TREAT-ACTIVITY', shapeOk && kinds['local-sale'] > 0 && kinds['local-stock'] > 0 && kinds['put'] > 0 && kinds['accept'] > 0 && kinds['visit'] > 0 && kinds['hub-visit'] > 0,
    'every trace event has actor/time/kind; POS run kinds ' + JSON.stringify(kinds));

  // DEVICEFAIL: a branch and a phone are lost and fold back from the shelf
  var d = scenario(opts), DA = d.dev.A, DP = d.dev.PH1, hubTruth = d.hub.state.stock.A['P-COLA'];
  line(d, DA, 4, 1, 'P-COLA', 1);                                       // a sale not yet sent
  var before = localStock(DA, 'P-COLA'), unsent = d.wipe('A'); d.wipe('PH1'); d.restore('A'); d.restore('PH1');
  var after = localStock(DA, 'P-COLA'), noop = I.apply(d, DP, d.row, d.red1), nextCode = I.issue(d, DA, d.row, { account: 'ACC1', delta: 5, kind: 'earn', claimed: 0 }).code.id;
  arm('W-TREAT-DEVICEFAIL', unsent === 1 && before === 9 && after === hubTruth && DA.pull['S1 price-list-seed'] && DA.pull['S1 price-list-seed'].val === 'PL-v1' && DP.balance === 0 && noop === 'noop' && nextCode === 'A-3',
    'branch lost with ' + unsent + ' unsent sale; advisory stock was ' + before + ', after fold-back ' + after + ' = hub ' + hubTruth + ' (the hub\'s truth wins); seed re-pulled; the phone re-learned its applied codes (rescan ' + noop + ', balance ' + DP.balance + '); the cashier\'s next code id is ' + nextCode + ' (no id reuse)');
  keepT.failDevice = d.trace;

  // HUBFAIL: the admin device is lost and rebuilt by re-reading the shelf
  var h = scenario(opts), s0 = snap(h), n0h = h.relay.names().length; h.advance(3600000); h.hubRebuild(); var s1 = snap(h);
  arm('W-TREAT-HUBFAIL', s0 === s1 && h.relay.names().length === n0h && Object.keys(h.hub.rec).length > 0,
    'hub wiped and rebuilt from the shelf: ' + Object.keys(h.hub.rec).length + ' records, derived stock/owing/balances ' + (s0 === s1 ? 'identical' : 'DIFFERENT') + '; shelf objects ' + n0h + ' -> ' + h.relay.names().length + ' (no duplicates)');
  keepT.failHub = h.trace;

  // PIPEFAIL: the shelf is lost; a mirror (the blind mailbox device) saves the rebuild; without one the exposure is shown
  var pm = scenario(Object.assign({ mirror: true }, opts)), sm = snap(pm); pm.kill(0); pm.hubRebuild(); var okM = snap(pm) === sm;
  var pc = scenario(opts), sc = snap(pc); pc.kill(0); pc.hubRebuild(); var lost = Object.keys(pc.hub.rec).length;
  arm('W-TREAT-PIPEFAIL', okM && snap(pc) !== sc && lost === 0, 'primary shelf lost: with a mirror the rebuild is ' + (okM ? 'identical' : 'DIFFERENT') + '; control without a mirror: ' + lost + ' of ' + sc.split('"recs":[')[1].split(']')[0].split(',').length + ' records recoverable (exposure shown)');
  keepT.failPipe = pm.trace;

  if (keep) keep.trace = keepT;
  return red;
}

console.log('§TREAT_INPUT rows=' + ROWS.length + ' treatments=' + JSON.stringify(ROWS.reduce(function (m, r) { m[r.treatment] = (m[r.treatment] || 0) + 1; return m; }, {})) + ' (SAMPLE DATA)');
console.log('§TREAT_ARMS baseline'); var KEEP = {}; arms({}, true, KEEP);

// ---- the panel's numbers, read from the traces ----
function activity(tr) {
  var c = { local: 0, pipe: 0, hub: 0, visits: 0, visitsWithTraffic: 0, hubVisits: 0 };
  tr.forEach(function (e) {
    if (['local-sale', 'local-stock', 'local-fund', 'apply-code', 'noop-code', 'skip', 'reject-code', 'issue-code'].indexOf(e.kind) !== -1) c.local++;
    if (['put', 'recv', 'pull', 'send', 'publish'].indexOf(e.kind) !== -1) c.pipe++;
    if (e.actor === 'HUB' && ['accept', 'duplicate', 'COLLISION', 'FLAG', 'send', 'publish'].indexOf(e.kind) !== -1) c.hub++;
    if (e.kind === 'visit') { c.visits++; if (e.moved > 0) c.visitsWithTraffic++; } if (e.kind === 'hub-visit' && !e.why) c.hubVisits++; });
  return c;
}
['pos', 'code', 'mf'].forEach(function (k) { console.log('§TREAT_ACTIVITY ' + k + ' ' + JSON.stringify(activity(KEEP.trace[k])) + ' (sample run; local = on-device actions, pipe = objects crossing the shelf, hub = admin events)'); });

// ---- THE FILM DAYS: timed scenarios with an explicit visit schedule (no cycle() driver), so the lanes show real cadence ----
var TD = function (d, h, m) { return Date.UTC(2026, 9, 24 + d, h, m); };
function filmPOS(opts) {
  var w = mk(Object.assign({ mirror: true }, opts)), A = w.dev.A, B = w.dev.B, PH = w.dev.PH1, row = w.rowByName('I1 loyalty-code'); w.trace.length = 0; var out = {};
  w.setTime(TD(1, 8, 30)); w.hubSession(function () { w.publish('S1 price-list-seed', 'PL-v1'); init(w, 'A', 'P-COLA', 10); });
  w.setTime(TD(1, 9, 0)); w.visit('A'); w.visit('PH1');
  w.setTime(TD(1, 10, 15)); line(w, A, 1, 1, 'P-COLA', 3);
  w.setTime(TD(1, 11, 0)); var e = I.issue(w, A, row, { account: 'ACC1', delta: 100, kind: 'earn', claimed: 0 }); I.apply(w, PH, row, e);
  w.setTime(TD(1, 13, 40)); line(w, A, 2, 1, 'P-COLA', 3);
  w.setTime(TD(1, 15, 0)); var r = I.issue(w, A, row, { account: 'ACC1', delta: -100, kind: 'redeem', claimed: PH.balance }); I.apply(w, PH, row, r); out.again = I.apply(w, PH, row, r);
  w.setTime(TD(1, 17, 20)); line(w, A, 3, 1, 'P-COLA', 2);
  // beat: the branch's link is down at its 18:00 visit: the visit fails, the sales stay queued, the label stays up
  w.setTime(TD(1, 17, 59)); w.setLink('A', false); w.setTime(TD(1, 18, 0)); w.visit('A');
  w.setTime(TD(1, 18, 30)); w.setLink('A', true); w.visit('A');
  w.setTime(TD(1, 18, 35)); w.hubVisit(); out.f1Day1 = Object.keys(w.hub.rec).filter(function (k) { return k.indexOf('F1 ') === 0; }).length; out.dupsDay1 = w.hub.dups;
  w.setTime(TD(1, 18, 45)); w.visit('PH1'); w.setTime(TD(1, 18, 50)); w.hubVisit(); out.flags1 = I.reconcile(w);
  w.setTime(TD(2, 9, 0)); w.visit('A'); out.stockA = localStock(A, 'P-COLA'); out.stockHub = w.hub.state.stock.A['P-COLA'];
  // beat: the branch is lost with one sale unsent, then folds back from the shelf
  w.setTime(TD(2, 10, 0)); line(w, A, 1, 1, 'P-COLA', 1); w.setTime(TD(2, 10, 5)); w.visit('A'); w.setTime(TD(2, 10, 10)); line(w, A, 2, 1, 'P-COLA', 1);
  out.stockBefore = localStock(A, 'P-COLA'); w.setTime(TD(2, 10, 20)); out.unsent = w.wipe('A'); w.restore('A'); out.stockRestored = localStock(A, 'P-COLA');
  // beat: restored from an old copy, the branch reuses today's ticket number 1 with different content (same date -> same natural key)
  w.setTime(TD(2, 10, 30)); line(w, A, 1, 1, 'P-COLA', 9); A.ledger.pop();
  // beat: a phone restored to an older state redeems again at the other branch
  w.setTime(TD(2, 11, 0)); PH.balance = 100; PH.applied = {}; var r3 = I.issue(w, B, row, { account: 'ACC1', delta: -100, kind: 'redeem', claimed: PH.balance }); I.apply(w, PH, row, r3);
  w.setTime(TD(2, 18, 0)); w.visit('A'); w.visit('B'); w.visit('PH1'); w.setTime(TD(2, 18, 5)); w.hubVisit(); out.flags2 = I.reconcile(w); out.collisions = w.hub.collisions.length;
  out.stockEnd = localStock(A, 'P-COLA'); out.hubEnd = w.hub.state.stock.A['P-COLA'];
  // beat: the admin device is lost and rebuilt from the shelf; then the primary shelf is lost and the mirror carries it
  var s0 = snap(w); w.setTime(TD(2, 19, 0)); w.hubRebuild(); out.hubOk = snap(w) === s0;
  w.setTime(TD(2, 19, 30)); w.kill(0); w.hubRebuild(); out.pipeOk = snap(w) === s0; out.world = w; return out;
}
function filmMF(opts) {
  var w = mk(opts), M1 = w.dev.BOR1, pay = w.rowByName('P1 borrower-payment-up'), out = {}; w.trace.length = 0;
  w.setTime(TD(1, 8, 30)); w.hubSession(function () { w.publish('S2 gold-price', 2300); });
  w.setTime(TD(1, 9, 0)); M1.gramsHeld = 12; w.visit('BOR1'); out.fund1 = M1.pull['S2 gold-price'].val * M1.gramsHeld; w.log('BOR1', 'local-fund', { grams: 12, price: M1.pull['S2 gold-price'].val, value: out.fund1 });
  w.setTime(TD(1, 14, 0)); w.visit('BOR1'); w.log('BOR1', 'local-fund', { grams: 12, price: M1.pull['S2 gold-price'].val, value: M1.pull['S2 gold-price'].val * 12 });
  w.setTime(TD(1, 15, 0)); w.sell(M1, pay, 'BOR1/' + day(w) + '/SLIP-1', { C_BPartner_ID: 'BOR1', PayAmt: 1500 }); w.setTime(TD(1, 15, 1)); w.visit('BOR1');
  w.setTime(TD(1, 15, 3)); w.sell(M1, pay, 'BOR1/' + day(w) + '/SLIP-1', { C_BPartner_ID: 'BOR1', PayAmt: 1500 }); w.visit('BOR1');   // the same slip sent again
  w.setTime(TD(1, 16, 0)); w.hubVisit(); w.setTime(TD(1, 18, 0)); w.visit('BOR1'); w.visit('BOR2');
  out.payRecs = Object.keys(w.hub.rec).filter(function (k) { return k.indexOf('P1 ') === 0; }).length; out.owing = w.hub.state.owing.BOR1; out.inbox1 = M1.inbox.length; out.inbox2 = w.dev.BOR2.inbox.length; out.world = w; return out;
}
// the film-day checks as a function of opts, so the mutants re-run them too
function filmArms(opts, log, keep) {
  var FP = filmPOS(opts), FM = filmMF(opts), tp = FP.world.trace, tm = FM.world.trace, red = [];
  function fd(name, ok, detail) { if (log) { judged++; if (!ok) fails++; console.log('   ' + (ok ? '🟢' : '🔴') + ' ' + name + ' — ' + detail); } if (!ok) red.push(name); }
  var gp = { pull: pulls(FM.world, 'BOR1', 'S2 gold-price'), skip: tm.filter(function (e) { return e.kind === 'skip' && e.actor === 'BOR1' && e.flow === 'S2 gold-price'; }).length };
  fd('FILMDAY-POS-stock', FP.stockA === FP.stockHub && FP.unsent === 1 && FP.stockRestored === FP.stockBefore + 1 && FP.stockEnd === FP.hubEnd, 'the branch\'s advisory stock meets the hub\'s (' + FP.stockA + ' = ' + FP.stockHub + '); lost with ' + FP.unsent + ' unsent sale, it read ' + FP.stockBefore + ' before and ' + FP.stockRestored + ' after fold-back (the unsent sale is gone); after the hub processed the shelf: branch ' + FP.stockEnd + ' = hub ' + FP.hubEnd);
  fd('FILMDAY-POS-code', FP.again === 'noop' && FP.flags1.length === 0 && FP.flags2.length === 1 && FP.flags2[0].kind === 'overspend' && FP.collisions === 1, 'second scan ' + FP.again + '; day-1 settlement flags ' + FP.flags1.length + '; day-2 flags ' + JSON.stringify(FP.flags2) + '; ticket-number reuse -> ' + FP.collisions + ' collision');
  fd('FILMDAY-POS-rebuild', FP.hubOk && FP.pipeOk, 'the admin device rebuilt from the shelf: ' + (FP.hubOk ? 'identical' : 'DIFFERENT') + '; then the primary shelf lost, mirror carried it: ' + (FP.pipeOk ? 'identical' : 'DIFFERENT'));
  fd('FILMDAY-MF', FM.owing === 3500 && FM.payRecs === 1 && FM.inbox1 === 1 && FM.inbox2 === 0 && FM.fund1 === 27600 && gp.pull === 1 && gp.skip >= 1, 'fund value ' + FM.fund1 + ' computed on the phone from one price fetch (' + gp.pull + ' pull, ' + gp.skip + ' later skips of the gold price); the slip sent twice = ' + FM.payRecs + ' payment; owing ' + FM.owing + '; confirmation to BOR1 ' + FM.inbox1 + ', BOR2 ' + FM.inbox2);
  // OFFLINE (§16.20a): connection windows alternate; no pipe event outside a window; the outage queues and then delivers exactly once
  function windows(tr) { var st = {}, n = {}, viol = 0, alt = true, PIPEK = ['put', 'recv', 'pull', 'publish', 'send'];
    tr.forEach(function (e) { var a = e.actor; if (a === 'PIPE') return;
      if (e.kind === 'online') { if (st[a] === 'on') alt = false; st[a] = 'on'; n[a] = (n[a] || 0) + 1; }
      else if (e.kind === 'offline') { if (st[a] !== 'on') alt = false; st[a] = 'off'; }
      else if (PIPEK.indexOf(e.kind) !== -1 && st[a] !== 'on') viol++; });
    return { n: n, viol: viol, alt: alt }; }
  var wp = windows(tp), wm = windows(tm), failed = tp.filter(function (e) { return e.kind === 'visit-failed' && e.actor === 'A'; });
  var putsInOutage = tp.filter(function (e) { return e.kind === 'put' && e.actor === 'A' && e.t >= TD(1, 17, 59) && e.t < TD(1, 18, 30); }).length;
  fd('W-TREAT-OFFLINE', wp.alt && wm.alt && wp.viol === 0 && wm.viol === 0 && failed.length === 1 && failed[0].queued >= 3 && putsInOutage === 0 && FP.f1Day1 === 3 && FP.dupsDay1 === 0,
    'online windows POS ' + JSON.stringify(wp.n) + ', MF ' + JSON.stringify(wm.n) + ' (zero length on the simulated clock); pipe events outside a window: ' + wp.viol + '/' + wm.viol + '; outage: ' + failed.length + ' failed visit with ' + (failed[0] ? failed[0].queued : '?') + ' facts queued, ' + putsInOutage + ' pipe puts during it, then ' + FP.f1Day1 + ' sale lines accepted once (' + FP.dupsDay1 + ' duplicates)');
  if (log) { var a1 = activity(tp.filter(function (e) { return e.t < TD(2, 0, 0); })), am = activity(tm);
    console.log('§TREAT_PANEL pos day 1 (normal working day) local=' + a1.local + ' pipe=' + a1.pipe + ' hubEvents=' + a1.hub + ' hubVisits=' + a1.hubVisits + ' deviceVisits=' + a1.visits + ' (timed day, explicit visit schedule, sample data)');
    console.log('§TREAT_PANEL pos days 1-2 incl. failure beats: ' + JSON.stringify(activity(tp)));
    console.log('§TREAT_PANEL mf day 1 local=' + am.local + ' pipe=' + am.pipe + ' hubEvents=' + am.hub + ' hubVisits=' + am.hubVisits + ' deviceVisits=' + am.visits + ' (sample data)');
    keep.filmPos = tp; keep.filmMf = tm; }
  return red;
}
console.log('§W-TREAT-FILMDAY (timed days; also the film\'s data source)'); filmArms({}, true, KEEP.trace);

// ---- ZEROCODE ----
console.log('§W-TREAT-ZEROCODE');
var code = ['treat.js', 'sim.js'].map(function (f) { return fs.readFileSync(path.join(SDIR, f), 'utf8').toLowerCase(); }).join('\n');
var words = ROWS.map(function (r) { return r.table; }).concat(ROWS.map(function (r) { return r.process; })).concat(['gold', 'loyalty', 'borrower', 'cola', 'replenish']).filter(Boolean);
var hits = words.filter(function (x) { return code.indexOf(String(x).toLowerCase()) !== -1; });
judged++; if (hits.length) fails++; console.log('   ' + (hits.length ? '🔴' : '🟢') + ' the engine and the treatments name none of ' + words.length + ' table/process/business words' + (hits.length ? ': ' + hits.join(',') : ''));
var xrow = { name: 'X9 invoiceline-up', treatment: 'FACT', role: 103, dir: 'UP', table: 'C_InvoiceLine', group: 'Station/Date/Invoice#' };
var zw = new S.World(ROWS.concat([xrow]), PROCS, {}); zw.addDevice('A', 103); zw.sell(zw.dev.A, zw.rowByName('X9 invoiceline-up'), 'A/' + day(zw) + '/INV-1', { M_Product_ID: 'P-COLA', QtyEntered: 1 }); zw.cycle();
var zok = !!zw.hub.rec['X9 invoiceline-up|A/' + day(zw) + '/INV-1'] && TREAT.validate(xrow).length === 0;
judged++; if (!zok) fails++; console.log('   ' + (zok ? '🟢' : '🔴') + ' a new FACT flow for another table, added as one row, was delivered and accepted end-to-end with no code change');

// ---- MUTANTS ----
console.log('§W-TREAT-MUTANTS (each broken invariant must turn at least one arm red)');
[['I1 scope check off', { noScope: true }], ['I2 content addressing off', { noContentAddr: true }], ['I3 collision flag off', { noCollisionFlag: true }],
 ['I5 pull guard off', { noGuard: true }], ['FL-7 apply-once off', { noApplyOnce: true }], ['FL-7 signature check off', { noSigCheck: true }], ['FL-7 reconcile off', { noReconcile: true }],
 ['fold-back off (restore / rebuild do nothing)', { noRestore: true }], ['mirror write off', { noMirrorWrite: true }], ['I7 replay-unsafe rule keys (time-stamped)', { unsafeKeys: true }], ['link check off (a visit proceeds through an outage)', { noLinkCheck: true }]].forEach(function (m) {
  var r = arms(m[1], false).concat(filmArms(m[1], false)); judged++; if (!r.length) fails++;
  console.log('   ' + (r.length ? '🟢' : '🔴') + ' ' + m[0] + ' -> red arms: ' + (r.join(', ') || 'NONE (SURVIVOR = a hole)'));
});

// ---- traces for the film: the engine's own record of what happened ----
var T = KEEP.trace; [['film_pos', T.filmPos], ['film_mf', T.filmMf]].forEach(function (x) { fs.writeFileSync(path.join(SDIR, 'trace_' + x[0] + '.json'), JSON.stringify(x[1])); });
console.log('§TREAT_TRACE film_pos=' + T.filmPos.length + ' film_mf=' + T.filmMf.length + ' events written to build/scriptor/trace_film_*.json (the timed days; the film reads these)');
function loc(f) { return fs.readFileSync(path.join(SDIR, f), 'utf8').split('\n').filter(function (l) { var t = l.trim(); return t && t.indexOf('//') !== 0; }).length; }
console.log('§TREAT_SIZE engine lines (non-blank, non-comment): treat.js=' + loc('treat.js') + ' sim.js=' + loc('sim.js'));
console.log('§TREAT_VERDICT ' + (fails === 0 ? 'PASS' : 'FAIL') + ' judged=' + judged + ' fails=' + fails + ' (sample data; transport sealing, persistence and the real kernel processes are out of scope — §16.18, §16.20)');
process.exit(fails === 0 ? 0 : 1);
