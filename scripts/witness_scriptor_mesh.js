#!/usr/bin/env node
// Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
// SPDX-License-Identifier: MIT
/**
 * witness_scriptor_mesh.js — Replication engine step 3: FACT dir BOTH, audience space (the mesh). Spec: prompts/TEAMWORK_FRAMEWORK.md §16.18b + §22.5.
 * Code under test: build/scriptor/treatments/fact.js (+ treat.js check point, sim.js). All data SAMPLE: roles DESIGNER (members) and 103 (outsider).
 *   §W-MESH-ADD (M1)  §W-MESH-COLLIDE (M2)  §W-MESH-FOLD (M3)  §W-MESH-SCOPE (M4)  §W-MESH-LATE (M5)  §W-MESH-DECLARE (M7)  §W-MESH-COEXIST (M8)  §W-MESH-STAR (M6)
 *   §W-MESH-MUTANTS: each broken rule must turn >= 1 arm red.   INCONCLUSIVE when nothing was exchanged; VACUOUS when a fold had fewer than 2 members.
 * Run: node scripts/witness_scriptor_mesh.js 2>&1 | tee build/scriptor/mesh.log
 */
'use strict';
var path = require('path'), fs = require('fs'), cp = require('child_process');
var SDIR = path.join(__dirname, '..', 'build', 'scriptor');
var S = require(path.join(SDIR, 'sim.js')), TREAT = require(path.join(SDIR, 'treat.js'));
var STAR = JSON.parse(fs.readFileSync(path.join(SDIR, 'flows.json'), 'utf8'));
var MROW = { name: 'E1 element', treatment: 'FACT', role: 'DESIGNER', dir: 'BOTH', audience: 'space', group: 'element_id', schedule: 'on-change' };
var judged = 0, fails = 0, vacuous = 0;
function say(ok, label, detail) { judged++; if (!ok) fails++; console.log('   ' + (ok ? '🟢' : '🔴') + ' ' + label + (detail ? ' — ' + detail : '')); }
function mk(opts) { var w = new S.World(STAR.concat([MROW]), { 'Replenish Report': function () { return []; }, ApplyPayment: function () { return []; } }, opts || {}); w.addDevice('A', 'DESIGNER'); w.addDevice('B', 'DESIGNER'); w.addDevice('O', 103); return w; }
function author(w, id, key, fields) { w.sell(w.dev[id], w.rowByName('E1 element'), key, fields); }
function fold(w, id) { return TREAT.get('FACT').fold(w, w.dev[id], w.rowByName('E1 element')); }
function keys(w, id) { var m = w.dev[id].mesh && w.dev[id].mesh['E1 element']; return m ? Object.keys(m.keys).sort() : []; }
function cols(w, id) { var m = w.dev[id].mesh && w.dev[id].mesh['E1 element']; return m ? m.collisions.length : 0; }
function nh(w, id, k) { var m = w.dev[id].mesh['E1 element']; return Object.keys(m.keys[k].hashes).length; }

function arms(quiet) {
  var red = [];
  function A(name, ok, label, detail) { if (!ok) red.push(name); if (!quiet) say(ok, label, detail); }
  // M1 — different keys: each device ends with both
  var w = mk(); author(w, 'A', 'K1', { pos_x: 1 }); author(w, 'B', 'K2', { pos_x: 2 }); w.cycle();
  var puts = w.trace.filter(function (e) { return e.kind === 'put'; }).length;
  if (!quiet) console.log('§W-MESH-ADD');
  A('W-MESH-ADD', JSON.stringify(keys(w, 'A')) === '["K1","K2"]' && JSON.stringify(keys(w, 'B')) === '["K1","K2"]', 'A and B edited different elements: each device holds both', 'A=' + keys(w, 'A') + ' B=' + keys(w, 'B') + ' puts=' + puts);
  if (!quiet && puts === 0) { console.log('   🟡 INCONCLUSIVE — nothing was exchanged'); }
  // M2 — same key, different content: collision on both, nothing overwritten, no resolver in the engine
  var c = mk(); author(c, 'A', 'K3', { pos_x: 5 }); author(c, 'B', 'K3', { pos_x: 6 }); c.cycle();
  if (!quiet) console.log('§W-MESH-COLLIDE');
  A('W-MESH-COLLIDE', cols(c, 'A') >= 1 && cols(c, 'B') >= 1, 'same element key, different content: a collision is flagged on BOTH devices', 'A=' + cols(c, 'A') + ' B=' + cols(c, 'B'));
  A('W-MESH-COLLIDE', keys(c, 'A').length === 1 && nh(c, 'A', 'K3') === 2 && nh(c, 'B', 'K3') === 2, 'neither version was overwritten (both contents kept on both devices)', 'versions A=' + (keys(c, 'A').length ? nh(c, 'A', 'K3') : 0) + ' B=' + (keys(c, 'B').length ? nh(c, 'B', 'K3') : 0));
  var src = ['treat.js', 'sim.js'].concat(fs.readdirSync(path.join(SDIR, 'treatments')).map(function (f) { return 'treatments/' + f; })).map(function (f) { return fs.readFileSync(path.join(SDIR, f), 'utf8').replace(/\/\/.*$/gm, ''); }).join('\n');
  var rs = src.match(/resolve|lastWriter|last-writer/gi) || [];
  A('W-MESH-COLLIDE', rs.length === 0, 'the engine has no resolve function (grep resolve|lastWriter in engine code)', rs.length + ' hits');
  // M3 — fold hash equal everywhere, order-independent, sensitive to a withheld fact
  if (!quiet) console.log('§W-MESH-FOLD');
  var fa = fold(w, 'A'), fb = fold(w, 'B'), fc = fold(c, 'A'), fcb = fold(c, 'B');
  var partial = mk(); author(partial, 'A', 'K1', { pos_x: 1 }); author(partial, 'B', 'K2', { pos_x: 2 }); partial.visit('A'); partial.visit('B');   // B authored K2 after its own fact; A has only K1 so far
  A('W-MESH-FOLD', !!fa && fa === fb, 'the fold hash of the accepted facts is equal on A and B (B ingested in the opposite order)', fa + ' = ' + fb + '; insertion order A=' + Object.keys(w.dev.A.mesh['E1 element'].keys) + ' B=' + Object.keys(w.dev.B.mesh['E1 element'].keys));
  A('W-MESH-FOLD', !!fc && fc === fcb && fc !== fa, 'under a collision the fold is still equal on both devices (the contest is part of the fold) and differs from the no-conflict fold', fc + ' = ' + fcb + ' != ' + fa);
  A('W-MESH-FOLD', fold(partial, 'A') !== fa, 'control: a fold with a fact not yet received differs (the test can fail)', fold(partial, 'A') + ' != ' + fa);
  if (!quiet && keys(w, 'A').length < 2) { vacuous++; console.log('   🟡 VACUOUS — fewer than 2 members contributed to the fold'); }
  // M4 — a device outside the space reads none of the flow; control inside reads
  if (!quiet) console.log('§W-MESH-SCOPE');
  var thrown = null, got = null; try { got = w.view(w.dev.O).list('o/A/E1 element/'); } catch (e) { thrown = e.message; }
  var inside = null; try { inside = w.view(w.dev.B).list('o/A/E1 element/'); } catch (e) { inside = 'THROW ' + e.message; }
  A('W-MESH-SCOPE', !!thrown && /out-of-scope/.test(thrown) && got === null, 'a device outside the space cannot list the flow (scope throws)', thrown || 'it read ' + JSON.stringify(got));
  A('W-MESH-SCOPE', Array.isArray(inside) && inside.length >= 1, 'control: a member lists the same prefix and gets the facts (the test can fail)', Array.isArray(inside) ? inside.length + ' names' : inside);
  var other = null; try { w.view(w.dev.B).list('o/A/F1 pos-sales-up/'); other = 'read'; } catch (e) { other = 'throws'; }
  A('W-MESH-SCOPE', other === 'throws', 'a member cannot read ANOTHER flow of the same author (only this flow)', 'o/A/F1 pos-sales-up/ -> ' + other);
  // M5 — a late joiner catches up from the shelf alone
  if (!quiet) console.log('§W-MESH-LATE');
  w.addDevice('C', 'DESIGNER'); w.visit('C'); author(w, 'C', 'K4', { pos_x: 9 }); w.visit('C'); w.visit('A'); w.visit('B');
  A('W-MESH-LATE', fold(w, 'C') === fold(w, 'A') && fold(w, 'A') === fold(w, 'B') && keys(w, 'C').length === 3, 'a late member C catches up from the shelf alone; after one more visit A, B and C hold the same fold', keys(w, 'C') + ' ' + fold(w, 'C'));
  // M8 — star and mesh in one world
  if (!quiet) console.log('§W-MESH-COEXIST');
  var m = mk(); author(m, 'A', 'K1', { pos_x: 1 }); m.sell(m.dev.O, m.rowByName('F1 pos-sales-up'), 'O/1', { M_Product_ID: 'P-COLA', QtyEntered: 2 }); m.cycle();
  A('W-MESH-COEXIST', !!m.hub.rec['F1 pos-sales-up|O/1'] && keys(m, 'B').length === 1 && !m.hub.rec['E1 element|K1'], 'a star flow (sale up to the hub) and a mesh flow (element to the team) run in one world; the hub holds the sale and holds nothing of the mesh', 'hub keys=' + Object.keys(m.hub.rec).join(',') + ' B=' + keys(m, 'B'));
  return red;
}

console.log('§MESH_START rows=' + STAR.length + ' star + 1 mesh (SAMPLE)');
arms(false);
console.log('§W-MESH-DECLARE');
var ok = TREAT.validate(MROW), bad1 = TREAT.validate(Object.assign({}, MROW, { dir: 'UP' })), bad2 = TREAT.validate(Object.assign({}, MROW, { audience: 'hub' })), bad3 = TREAT.validate(Object.assign({}, MROW, { audience: 'world' }));
say(ok.length === 0, 'space + BOTH is a valid declaration', JSON.stringify(ok));
say(bad1.length > 0, 'space with dir UP is red', JSON.stringify(bad1));
say(bad2.length > 0, 'hub with dir BOTH is red (a star has no both-ways)', JSON.stringify(bad2));
say(bad3.length > 0, 'an unknown audience is red', JSON.stringify(bad3));
console.log('§W-MESH-STAR (every existing star arm unchanged — child runs, verdict lines read)');
[['witness_scriptor_treat.js', /§TREAT_VERDICT PASS judged=30 fails=0/], ['witness_scriptor_registry.js', /§REG_VERDICT PASS judged=18 fails=0/], ['witness_scriptor_virtual.js', /§VIRT_VERDICT PASS judged=25 fails=0/], ['witness_scriptor_s1.js', /§S1_VERDICT PASS judged=22 fails=0/]].forEach(function (t) {
  var o = cp.spawnSync(process.execPath, [path.join(__dirname, t[0])], { encoding: 'utf8', cwd: path.join(__dirname, '..') }).stdout || '';
  say(t[1].test(o), t[0] + ' ' + (t[1].test(o) ? 'unchanged' : 'CHANGED'), (o.match(/§\w+_VERDICT[^\n]{0,40}/) || ['no verdict'])[0]);
});
console.log('§W-MESH-MUTANTS (each broken rule must turn at least one arm red)');
[['space scope off (a member sees only its own)', { noSpaceScope: true }], ['audience ignored (a non-member may read)', { audienceIgnored: true }], ['a resolving behaviour present (keep only the latest version)', { keepLatest: true }],
 ['fold depends on arrival order', { foldInsertionOrder: true }], ['collision flag off', { noCollisionFlag: true }]].forEach(function (mu) {
  var red; try { var o = S.World; var Orig = mk; mk = function (opts) { return Orig(Object.assign({}, mu[1], opts)); }; try { red = arms(true); } finally { mk = Orig; } } catch (e) { red = ['THROW ' + String(e.message).slice(0, 50)]; }
  say(red.length > 0, mu[0] + ' -> red arms: ' + (red.length ? Array.from(new Set(red)).join(', ') : 'NONE (survivor = hole)'));
});
var exchanged = mk(); author(exchanged, 'A', 'K1', {}); exchanged.cycle();
var verd = fails ? 'FAIL' : judged === 0 || exchanged.trace.filter(function (e) { return e.kind === 'put'; }).length === 0 ? 'INCONCLUSIVE' : 'PASS';
console.log('§MESH_VERDICT ' + verd + ' judged=' + judged + ' fails=' + fails + ' vacuous=' + vacuous + ' (sample data; membership = role equality, the signed roster is §16.13 Q1)');
process.exit(fails ? 1 : 0);
