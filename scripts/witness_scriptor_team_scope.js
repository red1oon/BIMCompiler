#!/usr/bin/env node
// Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
// SPDX-License-Identifier: MIT
/**
 * witness_scriptor_team_scope.js — the ONE shared plan reader (bim-ootb common/comm/team_scope.js). Spec: prompts/TEAMWORK_FRAMEWORK.md §25.1.
 * The reader is vm-loaded and asked about the REAL generated plans of both hosts; the expected answers are recomputed INDEPENDENTLY from the rows + the AD (not from the plan file).
 *   §W-SCOPE-ERP (S1,S2) · §W-SCOPE-MODELLER (S3) · §W-SCOPE-EDGE (S4 case, S5 hub-audience ignored, S6 declared-local wins, S7 missing plan, S8 plan swapped at runtime) · §W-SCOPE-MUTANTS
 * Usage: node scripts/witness_scriptor_team_scope.js [bim-ootb dir; default: origin/main read with git show]
 */
'use strict';
var path = require('path'), fs = require('fs'), vm = require('vm'), Better = require('better-sqlite3');
var SDIR = path.join(__dirname, '..', 'build', 'scriptor'), OOTB = require('./lib_ootb.js').ootbDir(process.argv[2], ['common/comm/team_scope.js','erp/team_plan.js','modeller/team_plan.js']);
var db = new Better(path.join(__dirname, '..', 'build', 'erp', 'ad_full.db'), { readonly: true });
var judged = 0, fails = 0;
function say(ok, label, detail) { judged++; if (!ok) fails++; console.log('   ' + (ok ? '🟢' : '🔴') + ' ' + label + (detail ? ' — ' + detail : '')); return ok; }
function rd(f) { return fs.readFileSync(path.join(OOTB, f), 'utf8'); }
var needed = ['common/comm/team_scope.js', 'erp/team_plan.js', 'modeller/team_plan.js'];
if (!needed.every(function (f) { return fs.existsSync(path.join(OOTB, f)); })) { console.log('§SCOPE_VERDICT INCONCLUSIVE — ' + OOTB + ' lacks ' + needed.join(', ')); process.exit(2); }
function planOf(src) { var g = {}; vm.runInNewContext(src, { window: g, globalThis: g }); return g.TEAM_PLAN; }
function reader(readerSrc, plan) { var g = { TEAM_PLAN: plan }; vm.runInNewContext(readerSrc, { window: g, globalThis: g }); return g; }
var READER = rd('common/comm/team_scope.js'), EPLAN = planOf(rd('erp/team_plan.js')), MPLAN = planOf(rd('modeller/team_plan.js'));
var LOCAL = JSON.parse(fs.readFileSync(path.join(SDIR, 'flows_erp.json'), 'utf8')).filter(function (r) { return r.treatment === 'LOCAL'; }).map(function (r) { return r.table.toLowerCase(); });
var MROWS = JSON.parse(fs.readFileSync(path.join(SDIR, 'flows_modeller.json'), 'utf8')), MCOLS = MROWS[0].columns, MFLOW = MROWS[1];
var active = db.prepare("SELECT lower(tablename) AS t FROM ad_table WHERE isactive='Y'").all().map(function (x) { return x.t; });
function clone(o) { return JSON.parse(JSON.stringify(o)); }

function arms(src, quiet) {
  var red = [], say2 = quiet ? function (ok) { return ok; } : say;
  function A(n, ok, l, d) { if (!ok) red.push(n); return say2(ok, l, d); }
  var E = reader(src, EPLAN).TeamScope, M = reader(src, MPLAN).TeamScope;
  if (!quiet) console.log('§W-SCOPE-ERP');
  var wrong = active.filter(function (t) { return E.scopeOf(t) !== (LOCAL.indexOf(t) >= 0 ? 'station-local' : 'share'); });
  A('S1', wrong.length === 0, 'scopeOf over every active AD table equals the independent recomputation (N=' + active.length + ': ' + (active.length - LOCAL.length) + ' share, ' + LOCAL.length + ' station-local)', wrong.length ? 'WRONG: ' + wrong.slice(0, 8).join(',') + ' (' + wrong.length + ')' : '0 differ');
  A('S2', E.scopeOf('x_not_in_the_plan') === 'unplanned' && E.scopeOf('') === 'unplanned' && JSON.stringify(E.locals().sort()) === JSON.stringify(LOCAL.slice().sort()), 'a name outside the plan is unplanned (never shared by default); locals() lists exactly the declared LOCAL rows', JSON.stringify(E.locals()));
  if (!quiet) console.log('§W-SCOPE-MODELLER');
  var vals = MCOLS.filter(function (c) { return c.name === 'geom_op'; })[0].values;
  A('S3', JSON.stringify(M.values('bim_element', 'geom_op')) === JSON.stringify(MPLAN.flows[0].payload.filter(function (p) { return p.col === 'geom_op'; })[0].values) && M.values('bim_element', 'geom_op').slice().sort().join() === vals.slice().sort().join()
    && MFLOW.carries.every(function (c) { return M.carries('bim_element', c); }) && !M.carries('bim_element', 'not_a_column') && M.values('bim_element', 'pos_x') === null, 'values()/carries() equal the rows: 6 geom_op values, every carried column present, an unknown column absent, values of a non-list column null', M.values('bim_element', 'geom_op').length + ' values');
  if (!quiet) console.log('§W-SCOPE-EDGE');
  A('S4', E.scopeOf('C_ORDER') === 'share' && E.scopeOf('c_order') === 'share' && E.scopeOf('AD_Sequence') === 'station-local' && M.carries('BIM_ELEMENT', 'POS_X'), 'lookups are case-insensitive', E.scopeOf('C_ORDER') + '/' + E.scopeOf('AD_Sequence'));
  var hub = clone(EPLAN); hub.flows.forEach(function (f) { f.audience = 'hub'; });
  var H = reader(src, hub).TeamScope;
  A('S5', H.scopeOf('c_order') === 'unplanned' && H.flow('c_order') === null, 'hub-audience flows do not count (only audience space)', H.scopeOf('c_order'));
  var both = clone(EPLAN); both.local.push('C_Order');
  A('S6', reader(src, both).TeamScope.scopeOf('c_order') === 'station-local', 'a table both planned and declared local is LOCAL (the safer side wins)', reader(src, both).TeamScope.scopeOf('c_order'));
  var N = reader(src, undefined).TeamScope;
  A('S7', N.scopeOf('c_order') === 'unplanned' && N.values('bim_element', 'geom_op') === null && !N.carries('bim_element', 'geom_op') && N.summary() === null && N.locals().length === 0, 'no plan => unplanned / null / empty everywhere (fail closed)');
  var g = { TEAM_PLAN: EPLAN }; vm.runInNewContext(src, { window: g, globalThis: g }); var before = g.TeamScope.scopeOf('c_order'); g.TEAM_PLAN = hub; var after = g.TeamScope.scopeOf('c_order');
  A('S8', before === 'share' && after === 'unplanned', 'a plan swapped at runtime is re-indexed (no stale cache)', before + ' -> ' + after);
  return red;
}
console.log('§SCOPE_START reader=' + OOTB + '/common/comm/team_scope.js · plans: erp ' + EPLAN.flows.length + ' tables + ' + EPLAN.local.length + ' local, modeller ' + MPLAN.flows.length + ' flow');
arms(READER, false);
console.log('§W-SCOPE-MUTANTS (the reader is loaded with one rule broken; each must turn at least one arm red)');
[['audience ignored', READER.replace("f.audience === 'space' && ", '')], ['declared-local no longer wins', READER.replace("I.local[lc(table)] ? 'station-local' : I.flows[lc(table)] ? 'share'", "I.flows[lc(table)] ? 'share' : I.local[lc(table)] ? 'station-local'")],
 ['case-sensitive lookups', READER.replace(/function lc\(x\) \{[^}]*\}/, 'function lc(x) { return String(x); }')], ['index never refreshed (stale cache)', READER.replace('if (memo.plan === P) return memo.idx;', 'if (memo.idx) return memo.idx;')],
 ['unplanned treated as share', READER.replace("I.flows[lc(table)] ? 'share' : 'unplanned'", "'share'")], ['no plan answers share', READER.replace("!I ? 'unplanned'", "!I ? 'share'")]].forEach(function (m) {
  var red; try { red = arms(m[1], true); } catch (e) { red = ['THROW ' + e.message.slice(0, 40)]; }
  say(red.length > 0, m[0] + ' -> red arms: ' + (red.length ? Array.from(new Set(red)).join(', ') : 'NONE (survivor = hole)'));
});
console.log('§SCOPE_VERDICT ' + (fails ? 'FAIL' : 'PASS') + ' judged=' + judged + ' fails=' + fails);
process.exit(fails ? 1 : 0);
