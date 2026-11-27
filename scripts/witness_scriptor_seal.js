#!/usr/bin/env node
// Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
// SPDX-License-Identifier: MIT
/**
 * witness_scriptor_seal.js — read isolation by AUDIENCE SEALING, in the engine simulator. Spec: prompts/TEAMWORK_FRAMEWORK.md §29. SAMPLE data. Simulator only: the real comm layer is NOT touched.
 *   §W-SEAL-BYTES (L1) · §W-SEAL-OUTSIDER (L2, L4) · §W-SEAL-TAMPER (L3) · §W-SEAL-E2E (L5) · §W-SEAL-MESH (L6) · §W-SEAL-NAMES (L7) · §W-SEAL-STAR (L8) · §W-SEAL-MUTANTS
 * The attacker model: a MODIFIED CLIENT or the shelf operator that ignores scope and reads every name/value on the relay directly. `W-SCRIPTOR-LEAK-BYTES` is reported JUDGED-in-simulator, never a bare PASS.
 */
'use strict';
var path = require('path'), fs = require('fs'), cp = require('child_process');
var SDIR = path.join(__dirname, '..', 'build', 'scriptor'), S = require(path.join(SDIR, 'sim.js')), TREAT = require(path.join(SDIR, 'treat.js'));
var judged = 0, fails = 0;
function say(ok, label, detail) { judged++; if (!ok) fails++; console.log('   ' + (ok ? '🟢' : '🔴') + ' ' + label + (detail ? ' — ' + detail : '')); return ok; }
var FACT = TREAT.get('FACT');
var SEALED = { name: 'S1 sealed-sales', treatment: 'FACT', role: 103, dir: 'UP', group: 'k', seal: 'AUD-SALES' }, PLAIN = { name: 'S2 plain-sales', treatment: 'FACT', role: 103, dir: 'UP', group: 'k' };
var MESH = { name: 'E1 sealed-team', treatment: 'FACT', role: 'DESIGNER', dir: 'BOTH', audience: 'space', group: 'k', seal: 'AUD-TEAM' };
function world(opts, extraRows) {
  var o = Object.assign({ hubAudiences: ['AUD-SALES'] }, opts || {}), w = new S.World([SEALED, PLAIN].concat(extraRows || []), {}, o);
  w.addDevice('A', 103, { audiences: ['AUD-SALES'] }); w.addDevice('B', 103, { audiences: ['AUD-SALES'] });
  w.addDevice('C', 103, { audiences: ['AUD-OTHER'] }); w.addDevice('O', 103, { audiences: o.giveOutsiderKey ? ['AUD-SALES'] : [] });   // O: right role, no key
  return w;
}
function sell3(w) { [['K1', 'P-COLA', 2], ['K2', 'P-GOLD', 7], ['K3', 'P-TEA', 1]].forEach(function (x) {
  w.sell(w.dev.A, w.rowByName('S1 sealed-sales'), 'A/2026-10-25/' + x[0], { M_Product_ID: x[1], QtyEntered: x[2] });
  w.sell(w.dev.A, w.rowByName('S2 plain-sales'), 'A/2026-10-25/' + x[0], { M_Product_ID: x[1], QtyEntered: x[2] }); }); }
function shelf(w, flow) { return w.relay.names().filter(function (n) { return n.indexOf('/' + flow + '/') >= 0; }).map(function (n) { return { n: n, v: w.relay.get(n) }; }); }
function opens(w, who, rows, row) { return rows.filter(function (r) { return FACT.openFact(w, who, row, r.v).fact; }).length; }

function arms(opts, quiet) {
  var red = [], say2 = quiet ? function (ok) { return ok; } : say, H = quiet ? function () {} : console.log;
  function A(n, ok, l, d) { if (!ok) red.push(n); return say2(ok, l, d); }
  var w = world(opts); sell3(w); w.cycle();
  var sh = shelf(w, 'S1 sealed-sales'), pl = shelf(w, 'S2 plain-sales'), sealedDump = JSON.stringify(sh), plainDump = JSON.stringify(pl);
  H('§W-SEAL-BYTES');
  var leak = ['P-COLA', 'P-GOLD', 'P-TEA', 'A/2026-10-25', 'QtyEntered', 'M_Product_ID'].filter(function (x) { return sealedDump.indexOf(x) >= 0; });
  var ctrl = ['P-COLA', 'P-GOLD', 'A/2026-10-25', 'QtyEntered'].filter(function (x) { return plainDump.indexOf(x) >= 0; });
  A('L1', sh.length === 3 && leak.length === 0, 'the sealed flow\'s shelf bytes contain none of its field values, field names or natural keys (' + sh.length + ' facts)', leak.length ? 'LEAKED: ' + leak.join(',') : '0 leaks');
  A('L1', ctrl.length === 4, 'control: the unsealed flow in the same world shows them all (the test can fail)', ctrl.length + ' of 4 visible');
  H('§W-SEAL-OUTSIDER');
  var row = w.rowByName('S1 sealed-sales');
  A('L2', sh.length > 0 && opens(w, w.dev.O, sh, row) === 0, 'an outsider with FULL shelf access and no key opens 0 of ' + sh.length + ' sealed facts', 'opened ' + opens(w, w.dev.O, sh, row));
  A('L2', opens(w, w.dev.B, sh, row) === sh.length, 'control: an insider opens ' + sh.length + ' of ' + sh.length + ' (the test can fail)', 'opened ' + opens(w, w.dev.B, sh, row));
  A('L4', opens(w, w.dev.C, sh, row) === 0, 'a holder of ANOTHER audience\'s key opens 0 of ' + sh.length, 'opened ' + opens(w, w.dev.C, sh, row));
  H('§W-SEAL-TAMPER');
  var t = world(opts); t.sell(t.dev.A, t.rowByName('S1 sealed-sales'), 'A/2026-10-25/K9', { M_Product_ID: 'P-COLA', QtyEntered: 5 }); t.visit('A');
  var tn = shelf(t, 'S1 sealed-sales')[0], bad = JSON.parse(JSON.stringify(tn.v)); var mid = bad.ct ? Math.floor(bad.ct.length / 2) : 0; if (bad.ct) bad.ct = bad.ct.slice(0, mid) + (bad.ct[mid] === '0' ? '1' : '0') + bad.ct.slice(mid + 1); t.relay.put(tn.n, bad); t.hubVisit();
  A('L3', !t.hub.rec['S1 sealed-sales|A/2026-10-25/K9'] && (t.stats.tampered || 0) === 1, 'one flipped byte on the shelf => the hub does NOT accept it and counts it tampered', 'accepted=' + !!t.hub.rec['S1 sealed-sales|A/2026-10-25/K9'] + ' tampered=' + (t.stats.tampered || 0));
  H('§W-SEAL-E2E');
  var hs = w.hub.rec['S1 sealed-sales|A/2026-10-25/K1'], hp = w.hub.rec['S2 plain-sales|A/2026-10-25/K1'];
  A('L5', !!hs && !!hp && JSON.stringify(hs.f.fields) === JSON.stringify(hp.f.fields) && hs.f.by === 'A', 'the hub accepted the sealed sale with exactly the fields of the plaintext run', hs ? JSON.stringify(hs.f.fields) : 'not accepted');
  var n0 = shelf(w, 'S1 sealed-sales').length, rec0 = hs && hs.hash;
  w.sell(w.dev.A, row, 'A/2026-10-25/K1', { M_Product_ID: 'P-COLA', QtyEntered: 2 }); w.sell(w.dev.A, row, 'A/2026-10-25/K2', { M_Product_ID: 'P-GOLD', QtyEntered: 99 }); w.cycle();
  A('L5', shelf(w, 'S1 sealed-sales').length === n0 + 1 && w.hub.rec['S1 sealed-sales|A/2026-10-25/K1'].hash === rec0, 'an exact resend creates NO new shelf object (same content, same name) and the hub record is unchanged — idempotent on sealed facts', 'shelf ' + n0 + ' -> ' + shelf(w, 'S1 sealed-sales').length + ' (+1 = the changed K2 only)');
  A('L5', w.hub.collisions.some(function (c) { return c.key === 'A/2026-10-25/K2'; }) && w.hub.rec['S1 sealed-sales|A/2026-10-25/K2'].f.fields.QtyEntered === 7, 'a changed resend under the same key is a COLLISION, flagged and never overwritten (the hub keeps QtyEntered 7)', 'collisions=' + w.hub.collisions.length);
  H('§W-SEAL-MESH');
  var m = new S.World([MESH], {}, opts || {}); m.addDevice('M1', 'DESIGNER', { audiences: ['AUD-TEAM'] }); m.addDevice('M2', 'DESIGNER', { audiences: ['AUD-TEAM'] }); m.addDevice('X', 'OTHER', { audiences: [] });
  var mr = m.rowByName('E1 sealed-team'); m.sell(m.dev.M1, mr, 'E/1', { pos_x: 1 }); m.sell(m.dev.M2, mr, 'E/2', { pos_x: 2 }); m.cycle();
  var f1 = FACT.fold(m, m.dev.M1, mr), f2 = FACT.fold(m, m.dev.M2, mr), msh = shelf(m, 'E1 sealed-team');
  A('L6', !!f1 && f1 === f2 && msh.length === 2 && JSON.stringify(msh).indexOf('pos_x') === -1, 'a sealed team flow: both members reach ONE fold hash and the shelf holds no field name', f1 + ' = ' + f2 + '; shelf facts=' + msh.length);
  A('L6', msh.length > 0 && opens(m, m.dev.X, msh, mr) === 0, 'an outsider reading the shelf directly (scope ignored) opens 0 of ' + msh.length, 'opened ' + opens(m, m.dev.X, msh, mr));
  H('§W-SEAL-NAMES');
  var k1 = FACT.sealKey(w, 'AUD-SALES'), k2 = FACT.sealKey(w, 'AUD-OTHER'), fact = { flow: 'x', key: 'A/1', fields: { a: 1 }, by: 'A' };
  A('L7', FACT.sealName(k1, fact) !== FACT.sealName(k2, fact), 'the same content gets a different shelf name under another audience\'s key', FACT.sealName(k1, fact) + ' vs ' + FACT.sealName(k2, fact));
  var guessed = w.h12(w.dev.A.ledger[0].fields), seen = sh.filter(function (r) { return r.n.indexOf(guessed) >= 0; }).length, ctrlSeen = pl.filter(function (r) { return r.n.indexOf(guessed) >= 0; }).length;
  A('L7', seen === 0 && ctrlSeen >= 1, 'an attacker who knows the plaintext but not the key cannot find it in the shelf names (0 sealed matches; control unsealed: ' + ctrlSeen + ' match)', 'sealed=' + seen + ' control=' + ctrlSeen);
  var led = w.dev.A.ledger[0];
  A('L7', sh.some(function (r) { return r.n.slice(-12) === FACT.sealName(k1, { key: led.key, fields: led.fields }); }), 'with the key the name IS recomputable (a key holder can still address a fact)');
  return red;
}
console.log('§SEAL_START simulator only · sealed=AES-256-GCM per audience · names=HMAC(audience key) (SAMPLE)');
arms({}, false);
H8();
function H8() {
  console.log('§W-SEAL-STAR (every existing star/mesh arm unchanged — child runs, verdict lines read)');
  [['witness_scriptor_treat.js', /§TREAT_VERDICT PASS judged=30 fails=0/], ['witness_scriptor_registry.js', /§REG_VERDICT PASS judged=18 fails=0/], ['witness_scriptor_mesh.js', /§MESH_VERDICT PASS judged=25 fails=0/], ['witness_scriptor_virtual.js', /§VIRT_VERDICT PASS judged=25 fails=0/]].forEach(function (t) {
    var o = cp.spawnSync(process.execPath, [path.join(__dirname, t[0])], { encoding: 'utf8', cwd: path.join(__dirname, '..') }).stdout || '';
    say(t[1].test(o), t[0] + ' ' + (t[1].test(o) ? 'unchanged' : 'CHANGED'), (o.match(/§\w+_VERDICT[^\n]{0,40}/g) || ['no verdict']).slice(-1)[0]); });
}
console.log('§W-SEAL-MUTANTS (each broken rule must turn at least one arm red)');
[['sealing off (plaintext)', { noSeal: true }], ['one key shared by every audience', { oneKey: true }], ['unauthenticated cipher (tamper accepted)', { noSealAuth: true }], ['shelf name from the plaintext hash', { plainName: true }],
 ['the outsider is handed the key', { giveOutsiderKey: true }], ['open skips the audience check', { skipAudCheck: true }]].forEach(function (m) {
  var red; try { red = arms(m[1], true); } catch (e) { red = ['THROW ' + String(e.message).slice(0, 50)]; }
  say(red.length > 0, m[0] + ' -> red arms: ' + (red.length ? Array.from(new Set(red)).join(', ') : 'NONE (survivor = hole)')); });
console.log('§SEAL_VERDICT ' + (fails ? 'FAIL' : 'PASS') + ' judged=' + judged + ' fails=' + fails + ' — W-SCRIPTOR-LEAK-BYTES: JUDGED in the simulator; the real comm layer is still INCONCLUSIVE (not touched, HOLD)');
process.exit(fails ? 1 : 0);
