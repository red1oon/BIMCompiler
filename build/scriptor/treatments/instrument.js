// Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
// SPDX-License-Identifier: MIT
// treatments/instrument.js — INSTRUMENT: a macro over two FACT-UP rows + settlement (§16.18, FL-7, §22.3).
'use strict';
var crypto = require('crypto');
require('../treat.js').register('INSTRUMENT', {                                                         // a macro over two FACT-UP rows + settlement
  needs: ['account', 'authorityRole', 'holderRole'],
  expand: function (row) {
    return [{ name: row.name + '.issued', treatment: 'FACT', dir: 'UP', role: row.authorityRole, group: 'code id', instrument: row.name, part: 'issued', account: row.account },
            { name: row.name + '.applied', treatment: 'FACT', dir: 'UP', role: row.holderRole, group: 'code id', instrument: row.name, part: 'applied', account: row.account }];
  },
  onAccept: function (w, row, acc, f) {                                 // the hub derives the ONE balance (I4)
    if (acc.instrument !== row.name) return;
    var a = w.hub.acct[f.fields.account] || (w.hub.acct[f.fields.account] = { issued: 0, applied: 0, hist: [], reported: 0 });
    if (acc.part === 'issued') { a.issued += f.fields.delta; a.hist.push({ t: f.fields.t, delta: f.fields.delta }); }
    else { a.applied += f.fields.delta; a.reported++; }
  },
  issue: function (w, cashier, row, o) {                                // the authority device mints a signed single-use code (FL-7)
    if (o.delta < 0 && o.claimed < -o.delta) return { refused: 'phone shows too little' };   // the cashier trusts what the phone shows
    var code = { id: cashier.id + '-' + (++cashier.seq), account: o.account, delta: o.delta, kind: o.kind, issuer: cashier.id, t: w.now };
    var sig = crypto.sign(null, Buffer.from(w.canon(code)), cashier.priv).toString('hex');
    (cashier.out[row.name + '.issued'] = cashier.out[row.name + '.issued'] || []).push({ flow: row.name + '.issued', key: code.id, fields: code, by: cashier.id });
    w.log(cashier.id, 'issue-code', { id: code.id, delta: code.delta, kind: code.kind });
    return { code: code, sig: sig };
  },
  apply: function (w, phone, row, pkt) {                                // the holder's device applies the code ONCE and reports
    var ro = phone.pull['S0 roster'], r = ro && ro.val && ro.val.cashiers[pkt.code.issuer];   // the roster is a SEED the phone already holds: scanning touches no pipe
    if (!w.opts.noSigCheck) { try { var key = crypto.createPublicKey({ key: Buffer.from(r, 'hex'), format: 'der', type: 'spki' });
        if (!crypto.verify(null, Buffer.from(w.canon(pkt.code)), key, Buffer.from(pkt.sig, 'hex'))) throw new Error('x'); } catch (e) { w.log(phone.id, 'reject-code', { id: pkt.code.id }); return 'bad-sig'; } }
    if (phone.applied[pkt.code.id] && !w.opts.noApplyOnce) { w.log(phone.id, 'noop-code', { id: pkt.code.id }); return 'noop'; }
    phone.applied[pkt.code.id] = 1; phone.balance += pkt.code.delta;
    (phone.out[row.name + '.applied'] = phone.out[row.name + '.applied'] || []).push({ flow: row.name + '.applied', key: pkt.code.id, fields: { id: pkt.code.id, account: pkt.code.account, delta: pkt.code.delta }, by: phone.id });
    w.log(phone.id, 'apply-code', { id: pkt.code.id, balance: phone.balance });
    return 'applied';
  },
  reconcile: function (w) {                                             // settlement: detection, not prevention
    if (w.opts.noReconcile) return [];
    var flags = [];
    Object.keys(w.hub.acct).forEach(function (k) { var a = w.hub.acct[k], run = 0, min = 0;
      a.hist.sort(function (x, y) { return x.t - y.t; }).forEach(function (h) { run += h.delta; if (run < min) min = run; });
      if (min < 0) flags.push({ account: k, kind: 'overspend', balance: run });
      if (a.reported > 0 && a.applied !== a.issued) flags.push({ account: k, kind: 'mismatch', issued: a.issued, applied: a.applied }); });
    flags.forEach(function (f) { w.log('HUB', 'FLAG', f); });
    return flags;
  }
});
