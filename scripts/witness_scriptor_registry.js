#!/usr/bin/env node
// Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
// SPDX-License-Identifier: MIT
/**
 * witness_scriptor_registry.js — Replication engine step 2: TREATMENTS AS REGISTRABLE COMPONENTS. Spec: prompts/TEAMWORK_FRAMEWORK.md §22.3.
 * Code under test: build/scriptor/treat.js (registry core) + sim.js + build/scriptor/treatments/*. All fixtures are SAMPLE/TEST, written to a temp dir.
 *   §W-REG-GUARDS    R1 duplicate name / shapeless component rejected       §W-REG-ZEROCODE  R2 a new treatment = a NEW file + a row; core sha256 unchanged
 *   §W-REG-UNKNOWN   R3 an unregistered name still fails validate           §W-REG-NONAMES   R4 the core names none of the built-in treatments
 *   §W-REG-POINTS    R5 onAccept and publish reach components by lookup     §W-REG-PRESERVED R6 treat witness PASS 30 / 11 mutants, traces equal the pre-refactor baseline
 *   §W-REG-MUTANTS   each broken rule must turn >= 1 arm red
 * Run: node scripts/witness_scriptor_registry.js 2>&1 | tee build/scriptor/registry.log
 */
'use strict';
var path = require('path'), fs = require('fs'), os = require('os'), crypto = require('crypto'), cp = require('child_process');
var SDIR = path.join(__dirname, '..', 'build', 'scriptor');
var TREAT = require(path.join(SDIR, 'treat.js')), S = require(path.join(SDIR, 'sim.js'));
var ROWS = JSON.parse(fs.readFileSync(path.join(SDIR, 'flows.json'), 'utf8'));
var judged = 0, fails = 0;
function sha(f) { return crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex').slice(0, 12); }
function coreHash() { return ['treat.js', 'sim.js'].map(function (f) { return sha(path.join(SDIR, f)); }).join('.'); }
function stripped(f) { return fs.readFileSync(path.join(SDIR, f), 'utf8').replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, ''); }
function throws(fn) { try { fn(); return null; } catch (e) { return String(e.message); } }

// fixtures: two components in a temp dir, NOT in the repo's treatments/ (a test of "add a file, edit nothing")
var TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'treat_reg_'));
var CORE = JSON.stringify(path.join(SDIR, 'treat.js'));
fs.writeFileSync(path.join(TMP, 'ack.js'), "require(" + CORE + ").register('ACK', { needs: ['of'],\n" +
  " deviceVisit: function (w, dev, row, v) { if (dev.role !== row.role) return; dev.inbox.forEach(function (f) { if (dev.seen['ack/' + f.key]) return; dev.seen['ack/' + f.key] = 1; v.put('o/' + dev.id + '/' + row.name + '/' + f.key, { flow: row.name, key: f.key, by: dev.id, fields: { ack: true } }); }); },\n" +
  " hubVisit: function (w, row) { var A = w.hub.acks || (w.hub.acks = {}); w.relay.list('o/').forEach(function (n) { if (n.indexOf('/' + row.name + '/') === -1) return; var f = w.relay.get(n); A[f.key] = (A[f.key] || 0) + (A[f.key + '|' + n] ? 0 : 1); A[f.key + '|' + n] = 1; }); } });\n");
fs.writeFileSync(path.join(TMP, 'probe.js'), "require(" + CORE + ").register('PROBE', { needs: [],\n" +
  " onAccept: function (w, row, accepted, fact) { (w.probe = w.probe || []).push(['accept', row.name, accepted.name, fact.key]); },\n" +
  " publish: function (w, row, value) { (w.probe = w.probe || []).push(['publish', row.name, value]); } });\n");

var BEFORE = coreHash(), LOADED = TREAT.loadDir(TMP);              // the new treatments arrive as files; the core is hashed around the load
function arms(quiet) {
  var red = [], say = quiet ? function () {} : console.log;
  function A(name, ok, label, detail) { if (!ok) red.push(name); if (!quiet) { judged++; if (!ok) fails++; say('   ' + (ok ? '🟢' : '🔴') + ' ' + label + (detail ? ' — ' + detail : '')); } return ok; }
  say('§W-REG-GUARDS');
  var dup = throws(function () { TREAT.register('FACT', { needs: [] }); }), shapeless = throws(function () { TREAT.register('SHAPELESS', { deviceVisit: function () {} }); });
  A('W-REG-GUARDS', !!dup && /duplicate/.test(dup), 'registering an existing name is refused', dup || 'accepted');
  A('W-REG-GUARDS', !!shapeless && /needs/.test(shapeless) && !TREAT.get('SHAPELESS'), 'a component with no needs array is refused and not registered', shapeless || 'accepted');
  say('§W-REG-ZEROCODE');
    var row = { name: 'K1 ack', treatment: 'ACK', of: 'F1 pos-sales-up', role: 103 }, rows = ROWS.concat([row]);
  var w = new S.World(rows, {}, {}); w.addDevice('A', 103);
  var ok = !!TREAT.get('ACK') && TREAT.validate(row).length === 0;
  var f2 = w.rowByName('F2 replenishment-down');
  w.hubSend(f2, 'A', { flow: f2.name, key: 'M-1', fields: { M_Product_ID: 'P-COLA', QtyEntered: 5 }, by: 'HUB' });
  w.visit('A'); w.hubVisit(); w.visit('A'); w.hubVisit();
  var acks = (w.hub.acks || {})['M-1'];
  A('W-REG-ZEROCODE', ok && acks === 1, 'a NEW treatment from a NEW file, named by one row, ran end-to-end (ack reached the hub once across two cycles)', 'loaded=' + LOADED.join(',') + ' validate=' + JSON.stringify(TREAT.validate(row)) + ' acks=' + acks);
  A('W-REG-ZEROCODE', coreHash() === BEFORE, 'core files sha256 identical before and after the new treatment was added', BEFORE);
  say('§W-REG-UNKNOWN');
  var unk = TREAT.validate({ name: 'N', treatment: 'NOPE' });
  A('W-REG-UNKNOWN', unk.length === 1 && /unknown treatment/.test(unk[0]), 'an unregistered treatment name still fails validate', JSON.stringify(unk));
  say('§W-REG-NONAMES');
  var words = ['FACT', 'SEED', 'RULE', 'INSTRUMENT'], src = stripped('treat.js') + stripped('sim.js'), hits = words.filter(function (x) { return new RegExp('\\b' + x + '\\b', 'i').test(src); });
  A('W-REG-NONAMES', hits.length === 0, 'treat.js and sim.js name none of the 4 built-in treatments', hits.length ? 'hits: ' + hits.join(',') : '0 hits');
  say('§W-REG-POINTS');
  var rows2 = ROWS.concat([{ name: 'Q1 probe', treatment: 'PROBE' }]), p = new S.World(rows2, { GenerateReplenishment: function () { return []; } }, {}); p.addDevice('A', 103);
  var f1 = p.rowByName('F1 pos-sales-up'); p.sell(p.dev.A, f1, 'A/1', { M_Product_ID: 'P-COLA', QtyEntered: 1 }); p.cycle(); p.publish('Q1 probe', 7);
  var calls = p.probe || [];
  A('W-REG-POINTS', calls.some(function (c) { return c[0] === 'accept' && c[1] === 'Q1 probe' && c[2] === 'F1 pos-sales-up' && c[3] === 'A/1'; }), 'onAccept reached the component for the accepted fact', JSON.stringify(calls));
  A('W-REG-POINTS', calls.some(function (c) { return c[0] === 'publish' && c[2] === 7; }), 'World.publish found the component by the row\'s treatment name');
  return red;
}

console.log('§REG_START core=treat.js+sim.js fixtures=' + TMP + ' (TEST)');
console.log('   built-ins registered: ' + Object.keys(TREAT.T).sort().join(','));
arms(false);
console.log('§W-REG-PRESERVED');
var BASE = JSON.parse(fs.readFileSync(path.join(SDIR, 'trace_baseline.json'), 'utf8'));
var out = cp.spawnSync(process.execPath, [path.join(__dirname, 'witness_scriptor_treat.js')], { encoding: 'utf8', cwd: path.join(__dirname, '..') }).stdout || '';
var mv = /§TREAT_VERDICT (\w+) judged=(\d+) fails=(\d+)/.exec(out), killed = (out.split('§W-TREAT-MUTANTS')[1] || '').split('\n').filter(function (l) { return /🟢 .*red arms:/.test(l); }).length;
function nsha(f) { return crypto.createHash('sha256').update(fs.readFileSync(path.join(SDIR, f), 'utf8').replace(/302a300506032b6570032100[0-9a-f]{64}/g, 'PUBKEY')).digest('hex'); }
var okT = !!mv && mv[1] === 'PASS' && mv[2] === '30' && mv[3] === '0' && killed === 11;
judged++; if (!okT) fails++; console.log('   ' + (okT ? '🟢' : '🔴') + ' treat witness unchanged: ' + (mv ? mv[1] + ' judged=' + mv[2] + ' fails=' + mv[3] : 'no verdict') + ', mutants killed ' + killed + '/11');
var okP = nsha('trace_film_pos.json') === BASE.pos && nsha('trace_film_mf.json') === BASE.mf;
judged++; if (!okP) fails++; console.log('   ' + (okP ? '🟢' : '🔴') + ' film traces equal the pre-refactor baseline (normalized sha256, 155 + 45 events)', 'pos=' + nsha('trace_film_pos.json').slice(0, 12) + ' mf=' + nsha('trace_film_mf.json').slice(0, 12) + ' baseline pos=' + BASE.pos.slice(0, 12) + ' mf=' + BASE.mf.slice(0, 12));

console.log('§W-REG-MUTANTS (each broken rule must turn at least one arm red)');
function mutant(label, patch) { var undo = patch(), red; try { red = arms(true); } catch (e) { red = ['THROW ' + String(e.message).slice(0, 40)]; } undo(); judged++; if (!red.length) fails++; console.log('   ' + (red.length ? '🟢' : '🔴') + ' ' + label + ' -> red arms: ' + (red.length ? Array.from(new Set(red)).join(', ') : 'NONE (survivor = hole)')); }
mutant('duplicate registration allowed', function () { var o = TREAT.register; TREAT.register = function (n, c) { if (!TREAT.T[n]) TREAT.T[n] = c; return c; }; return function () { TREAT.register = o; delete TREAT.T.SHAPELESS; }; });   // undo also drops what the broken registry let in
mutant('registry lookup bypassed (built-ins hard-wired)', function () { var o = TREAT.get, hw = {}; ['FACT', 'SEED', 'RULE', 'INSTRUMENT'].forEach(function (n) { hw[n] = o(n); }); TREAT.get = function (n) { return hw[n]; }; return function () { TREAT.get = o; }; });
mutant('onAccept not dispatched', function () { var o = S.World.prototype.afterAccept; S.World.prototype.afterAccept = function () {}; return function () { S.World.prototype.afterAccept = o; }; });
fs.rmSync(TMP, { recursive: true, force: true });
console.log('§REG_VERDICT ' + (fails ? 'FAIL' : judged === 0 ? 'INCONCLUSIVE' : 'PASS') + ' judged=' + judged + ' fails=' + fails);
process.exit(fails ? 1 : 0);
