#!/usr/bin/env node
// Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
// SPDX-License-Identifier: MIT
/**
 * witness_scriptor_virtual.js — Replication engine step 1: VIRTUAL TABLES. Spec: prompts/TEAMWORK_FRAMEWORK.md §22.1 (closes §20 G2).
 * Real AD: build/erp/ad_full.db (read-only). Code under test: build/scriptor/compile.js + flow.js. Fixture (SAMPLE): build/scriptor/flows_virtual.json.
 * Each arm names the issue it proves or disproves; VACUOUS / INCONCLUSIVE are separate verdicts, never PASS.
 *   §W-VIRT-COMPILE   A1 a bim_element row compiles (today: error no-table)        §W-VIRT-VACUOUS  A2 ghost guard says VACUOUS, only for virtual
 *   §W-VIRT-TYPO      A3 a typo'd carried column is red                             §W-VIRT-GUARDS   A4 V1-V5 each turned red
 *   §W-VIRT-MANDATORY A5 mandatory-uncarried follows 'mand'                          §W-VIRT-ADDITIVE A6 AD flows byte-identical with/without virtual rows
 *   §W-VIRT-ZEROCODE  A7 a second virtual table = one row, code hash unchanged       §W-VIRT-DETERMINISM A8 same rows same hash; changed class changes it
 *   §W-VIRT-MUTANTS   each broken rule must turn >= 1 arm red
 * Run: node scripts/witness_scriptor_virtual.js 2>&1 | tee build/scriptor/virtual.log
 */
'use strict';
var path = require('path'), fs = require('fs'), crypto = require('crypto'), Better = require('better-sqlite3');
var SDIR = path.join(__dirname, '..', 'build', 'scriptor');
var COMPILE = require(path.join(SDIR, 'compile.js'));
var db = new Better(path.join(__dirname, '..', 'build', 'erp', 'ad_full.db'), { readonly: true });
var VROWS = JSON.parse(fs.readFileSync(path.join(SDIR, 'flows_virtual.json'), 'utf8'));
var ADROWS = JSON.parse(fs.readFileSync(path.join(SDIR, 'flows.json'), 'utf8')).filter(function (r) { return r.table; });
var judged = 0, fails = 0, vacuous = [];
function verdict(ok, label, detail) { judged++; if (!ok) fails++; console.log('   ' + (ok ? '🟢' : '🔴') + ' ' + label + (detail ? ' — ' + detail : '')); return ok; }
function clone(o) { return JSON.parse(JSON.stringify(o)); }
function by(plan, name) { return plan.filter(function (f) { return f.name === name; })[0]; }
function decl(rows) { return rows.filter(function (r) { return r.virtualTable; })[0]; }
function codeHash() { return ['compile.js', 'flow.js', 'scope.js'].map(function (f) { return crypto.createHash('sha256').update(fs.readFileSync(path.join(SDIR, f))).digest('hex').slice(0, 12); }).join('.'); }
function pc(f, n) { return (f.payload || []).filter(function (p) { return p.col === n; })[0]; }

// every arm as one function so a mutant can re-run it; returns the names of the red arms
function arms(opts, quiet) {
  var red = [], say = quiet ? function () {} : console.log;
  function A(name, ok, label, detail) { if (!ok) red.push(name); judged += quiet ? 0 : 1; if (!ok && !quiet) fails++; if (!quiet) say('   ' + (ok ? '🟢' : '🔴') + ' ' + label + (detail ? ' — ' + detail : '')); return ok; }
  var r = COMPILE.compile(db, VROWS, opts), V1 = by(r.plan, 'V1 element-create'), V2 = by(r.plan, 'V2 element-propose');
  say('§W-VIRT-COMPILE');
  var okC = V1 && !V1.error && V1.tableType === 'virtual' && V1.tableColumns === 8 && V1.payloadColumns === 6;
  A('W-VIRT-COMPILE', okC, 'bim_element row compiles as a virtual table', V1 ? 'error=' + V1.error + ' tableType=' + V1.tableType + ' cols=' + V1.tableColumns + ' payload=' + V1.payloadColumns + ' (5 carried + key)' : 'row missing');
  A('W-VIRT-COMPILE', !!V1 && !!pc(V1, 'pos_x') && pc(V1, 'pos_x').cls === 'MEASURE' && pc(V1, 'geom_op').cls === 'CODE' && pc(V1, 'parent_id').cls === 'REF', 'declared classes reach the payload', V1 && !V1.error ? 'pos_x=' + pc(V1, 'pos_x').cls + ' geom_op=' + pc(V1, 'geom_op').cls + ' parent_id=' + pc(V1, 'parent_id').cls : '');
  A('W-VIRT-COMPILE', !!V2 && !V2.error && V2.proposed === true && !pc(V2, 'geom') && !pc(V2, 'element_id') && !!pc(V2, 'pos_y'), 'no carries -> a PROPOSAL without the OTHER column and without the key', V2 && !V2.error ? 'proposed=' + V2.proposed + ' payload=' + V2.payload.map(function (p) { return p.col; }).join(',') : '');
  A('W-VIRT-COMPILE', !!V2 && !V2.error && JSON.stringify(V2.baseRequirement) === '["AD_User"]' && JSON.stringify(Object.keys(V2.baseTypes)) === '["AD_User"]', 'self-reference is not a base requirement; the AD reference is, with its strategy type', V2 ? 'baseRequirement=' + JSON.stringify(V2.baseRequirement) + ' baseTypes=' + JSON.stringify(V2.baseTypes) : '');
  say('§W-VIRT-VACUOUS');
  var ad = COMPILE.compile(db, ADROWS, opts), adF = ad.plan[0];
  A('W-VIRT-VACUOUS', !!V1 && V1.ghostGuard === 'VACUOUS' && adF && adF.ghostGuard === undefined, 'ghost guard is labelled VACUOUS for the virtual flow and absent on the AD flow', V1 ? 'virtual=' + V1.ghostGuard + ' ad=' + (adF && adF.ghostGuard) : '');
  if (V1 && V1.ghostGuard === 'VACUOUS' && !quiet) { vacuous.push('FL-6 ghost guard (a virtual table has no AD fields to judge derivedCarried against)'); say('   🟡 VACUOUS — FL-6 ghost guard judged nothing for ' + V1.table + ' (no AD fields); derivedCarried=' + V1.derivedCarried.length + ' means nothing here'); }
  say('§W-VIRT-TYPO');
  var rt = clone(VROWS); rt[1].carries = rt[1].carries.concat(['pos_xx']);
  var T = by(COMPILE.compile(db, rt, opts).plan, 'V1 element-create');
  A('W-VIRT-TYPO', !!T && JSON.stringify(T.declaredMissing) === '["pos_xx"]', 'a typo\'d carried column is declaredMissing', T ? 'declaredMissing=' + JSON.stringify(T.declaredMissing) : '');
  say('§W-VIRT-GUARDS');
  var BAD = [['V1 unknown class', function (d) { d.columns[3].cls = 'MONEY'; }, /V1/], ['V2 ref target unknown', function (d) { d.columns[6].target = 'No_Such_Table'; }, /V2/],
    ['V3 duplicate column', function (d) { d.columns.push({ name: 'POS_X', cls: 'MEASURE' }); }, /V3/], ['V4 no columns', function (d) { d.columns = []; }, /V4/],
    ['V4 two keys', function (d) { d.columns[1].cls = 'KEY'; }, /V4/], ['V5 shadows an AD table', function (d) { d.virtualTable = 'C_OrderLine'; d.columns[6].target = 'C_OrderLine'; }, /V5/]];
  BAD.forEach(function (b) {
    var rb = clone(VROWS); b[1](decl(rb)); if (b[0].indexOf('V5') === 0) rb[1].table = rb[2].table = 'C_OrderLine';
    var cr = COMPILE.compile(db, rb, opts), flow = by(cr.plan, 'V1 element-create');
    var errs = (cr.virtualErrors || []).concat(flow && flow.error ? [flow.error] : []);
    A('W-VIRT-GUARDS', errs.some(function (e) { return b[2].test(e); }), b[0] + ' is red', errs.length ? errs.join(' | ') : 'no error reported');
  });
  var v6 = clone(VROWS); decl(v6).columns[1].values = ['GEOM_A', 'GEOM_A'];
  var v6b = clone(VROWS); decl(v6b).columns[3].values = ['X'];
  var e6 = (COMPILE.compile(db, v6, opts).virtualErrors || []).concat(COMPILE.compile(db, v6b, opts).virtualErrors || []);
  A('W-VIRT-GUARDS', e6.filter(function (e) { return /V6/.test(e); }).length === 2, 'V6 a duplicate list value, and values on a non-CODE column, are each red', e6.join(' | ') || 'no error reported');
  var v7 = clone(VROWS); decl(v7).columns[1].values = ['GEOM_A', 'GEOM_B'];
  var v7b = clone(v7); decl(v7b).columns[1].values.push('GEOM_C');
  var g7 = COMPILE.compile(db, v7, opts), g7b = COMPILE.compile(db, v7b, opts), g7f = by(g7.plan, 'V1 element-create'), pv = g7f && g7f.payload ? g7f.payload.filter(function (p) { return p.col === 'geom_op'; })[0] : null;
  A('W-VIRT-GUARDS', !!pv && JSON.stringify(pv.values) === '["GEOM_A","GEOM_B"]' && g7.hash !== g7b.hash, 'list values reach the payload and adding one value changes the plan hash', pv ? JSON.stringify(pv.values) + ' ' + g7.hash.slice(0, 12) + ' != ' + g7b.hash.slice(0, 12) : 'no payload');
  say('§W-VIRT-MANDATORY');
  A('W-VIRT-MANDATORY', !!V2 && !!V2.mandatoryUncarried && V2.mandatoryUncarried.length === 0 && !!(V2.payload || []).filter(function (p) { return p.col === 'geom_op'; }).length, 'geom_op (mand) carried -> mandatory-uncarried empty', V2 ? JSON.stringify(V2.mandatoryUncarried) : '');
  var rm = clone(VROWS); rm[1].carries = ['pos_x', 'pos_y'];
  var M = by(COMPILE.compile(db, rm, opts).plan, 'V1 element-create');
  A('W-VIRT-MANDATORY', !!M && JSON.stringify(M.mandatoryUncarried) === '["geom_op"]', 'geom_op (mand) not carried -> listed, and the key is not', M ? JSON.stringify(M.mandatoryUncarried) : '');
  say('§W-VIRT-ADDITIVE');
  var alone = COMPILE.compile(db, ADROWS, opts).plan, mixed = COMPILE.compile(db, ADROWS.concat(VROWS), opts).plan;
  var same = alone.length > 0 && alone.every(function (f) { return JSON.stringify(f) === JSON.stringify(by(mixed, f.name)); });
  A('W-VIRT-ADDITIVE', same, 'AD flows are byte-identical with and without the virtual rows in the same call', 'compared ' + alone.length + ' flows' + (alone.length ? '' : ' — NO-OP guard: nothing compared'));
  say('§W-VIRT-DETERMINISM');
  var r2 = COMPILE.compile(db, clone(VROWS), opts), rc = clone(VROWS); decl(rc).columns[3].cls = 'DATE';
  var h3 = COMPILE.compile(db, rc, opts).hash;
  A('W-VIRT-DETERMINISM', r.hash === r2.hash && r.hash !== h3, 'same rows -> same sha256; one column class changed -> a different one', r.hash.slice(0, 12) + ' = ' + r2.hash.slice(0, 12) + ' != ' + h3.slice(0, 12));
  return red;
}

console.log('§VIRT_START fixture=flows_virtual.json (SAMPLE) AD=build/erp/ad_full.db');
var before = codeHash();
arms({});
console.log('§W-VIRT-ZEROCODE');
var extra = clone(VROWS).concat([{ virtualTable: 'x_widget', columns: [{ name: 'widget_id', cls: 'KEY' }, { name: 'qty', cls: 'MEASURE' }, { name: 'owner_id', cls: 'REF', target: 'AD_User' }] },
  { name: 'V9 widget', treatment: 'FACT', role: 103, strategy: 100, dir: 'BOTH', table: 'x_widget', carries: ['qty', 'owner_id'], group: 'widget_id', schedule: 'on-change' }]);
var Z = by(COMPILE.compile(db, extra, {}).plan, 'V9 widget');
verdict(!!Z && !Z.error && Z.tableType === 'virtual' && Z.payloadColumns === 3, 'a second virtual table added as ROWS ONLY compiles', Z ? 'error=' + Z.error + ' payload=' + Z.payloadColumns + ' baseRequirement=' + JSON.stringify(Z.baseRequirement) : 'row missing');
var src = ['compile.js', 'flow.js', 'scope.js'].map(function (f) { return fs.readFileSync(path.join(SDIR, f), 'utf8'); }).join('\n');
verdict(codeHash() === before, 'compiler code hash identical before and after the rows were added', before);
verdict(!/bim_element|x_widget|geom_op|pos_x/i.test(src), 'no compiler file names the virtual tables or their columns', '0 hits in 3 code files');
var plain = COMPILE.compile(db, VROWS, {}).hash, withX = COMPILE.compile(db, extra, {}).hash;
verdict(plain !== withX, 'adding the rows changes the plan (not a NO-OP)', plain.slice(0, 12) + ' -> ' + withX.slice(0, 12));

console.log('§W-VIRT-MUTANTS (each broken rule must turn at least one arm red)');
[['virtual declarations ignored', { noVirtual: true }], ['declaration validation off', { noVirtualValidate: true }], ['VACUOUS label dropped', { noVacuousLabel: true }]].forEach(function (m) {
  var red = arms(m[1], true);
  verdict(red.length > 0, m[0] + ' -> red arms: ' + (red.length ? Array.from(new Set(red)).join(', ') : 'NONE (survivor = hole)'));
});
if (vacuous.length) vacuous.forEach(function (v) { console.log('§VIRT_VACUOUS ' + v); });
var verd = fails ? 'FAIL' : judged === 0 ? 'INCONCLUSIVE' : 'PASS';
console.log('§VIRT_VERDICT ' + verd + ' judged=' + judged + ' fails=' + fails + ' vacuous=' + vacuous.length + (vacuous.length ? ' [' + vacuous.join('; ') + ']' : ''));
process.exit(fails ? 1 : 0);
