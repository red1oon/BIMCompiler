#!/usr/bin/env node
// Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
// SPDX-License-Identifier: MIT
/**
 * witness_scriptor_erp_plan.js — step 5b compiler side. Spec: prompts/TEAMWORK_FRAMEWORK.md §25.
 *   §W-ERPPLAN-DRIFT   the plan shipped to the ERP (erp/team_plan.js in the bim-ootb worktree) equals a fresh emission, byte for byte.
 *   §W-ERPPLAN-SCOPE   behaviour-preserving: tables in plan + declared local == every active AD table; local == the 5 STATION_LOCAL; no table in both; no table missing.
 *   §W-ERPPLAN-SENSE   the emitter can fail: a nonexistent table refuses to emit; a changed LOCAL row changes bytes+hash; deterministic.
 *   §W-ERPPLAN-ADAPTER the adapter no longer carries the STATION_LOCAL literal (grep).
 * Usage: node scripts/witness_scriptor_erp_plan.js [bim-ootb dir; default: origin/main read with git show]
 */
'use strict';
var path = require('path'), fs = require('fs'), vm = require('vm'), Better = require('better-sqlite3');
var SDIR = path.join(__dirname, '..', 'build', 'scriptor'), OOTB = require('./lib_ootb.js').ootbDir(process.argv[2], ['erp/team_plan.js','erp/team_sync.js']);
var EMIT = require(path.join(SDIR, 'emit_erp_plan.js'));
var db = new Better(path.join(__dirname, '..', 'build', 'erp', 'ad_full.db'), { readonly: true });
var judged = 0, fails = 0;
function say(ok, label, detail) { judged++; if (!ok) fails++; console.log('   ' + (ok ? '🟢' : '🔴') + ' ' + label + (detail ? ' — ' + detail : '')); }
function clone(o) { return JSON.parse(JSON.stringify(o)); }
var LOCALROWS = JSON.parse(fs.readFileSync(path.join(SDIR, 'flows_erp.json'), 'utf8'));
var shipped = path.join(OOTB, 'erp', 'team_plan.js'), adapter = path.join(OOTB, 'erp', 'team_sync.js');
if (!fs.existsSync(shipped) || !fs.existsSync(adapter)) { console.log('§ERPPLAN_VERDICT INCONCLUSIVE — ' + OOTB + '/erp/{team_plan,team_sync}.js not found'); process.exit(2); }
console.log('§W-ERPPLAN-DRIFT');
var fresh = EMIT.emit(db, LOCALROWS, 'flows_erp.json'), have = fs.readFileSync(shipped, 'utf8');
say(fresh.text === have, 'the shipped erp/team_plan.js equals a fresh emission byte for byte', have.length + ' bytes; tables=' + fresh.flows + ' local=' + fresh.local + ' hash ' + fresh.hash.slice(0, 12));
console.log('§W-ERPPLAN-SCOPE');
var g = {}; vm.runInNewContext(have, { window: g, globalThis: g }); var P = g.TEAM_PLAN;
var ES = require(path.join(SDIR, 'erp_scope.js')), OBS = JSON.parse(fs.readFileSync(path.join(SDIR, 'observed_team_tables.json'), 'utf8')), lc = function (x) { return String(x).toLowerCase(); };
var active = db.prepare("SELECT lower(tablename) AS t FROM ad_table WHERE isactive='Y'").all().map(function (x) { return x.t; }).sort();
var inPlan = P.flows.map(function (f) { return lc(f.table); }), loc = P.local.map(lc), excluded = ES.excludedViews(db, Object.keys(OBS.out)).map(lc), reach = ES.reach(db, 'ALL').names;
function views(ex, quiet) {                                              // V1-V3 on a candidate exclusion list; returns the red arm names
  var red = [], A = function (n, ok, l, d) { if (!ok) red.push(n); if (!quiet) say(ok, l, d); };
  var notView = ex.filter(function (t) { return db.prepare('SELECT isview AS v FROM ad_table WHERE lower(tablename)=?').get(t).v !== 'Y'; });
  A('V1', ex.length > 0 && notView.length === 0, 'every excluded table is a dictionary VIEW (IsView=Y): ' + (ex.length - notView.length) + ' of ' + ex.length, notView.length ? 'NOT VIEWS: ' + notView.join(',') : '');
  var tabbed = ex.filter(function (t) { return db.prepare("SELECT COUNT(*) AS c FROM ad_tab tb JOIN ad_table x ON x.ad_table_id=tb.ad_table_id WHERE lower(x.tablename)=? AND tb.isactive='Y'").get(t).c > 0 || reach[t]; });
  A('V2', tabbed.length === 0, 'none has an active tab and none is reached by any window or reference (closure ALL)', tabbed.length ? 'REACHED: ' + tabbed.join(',') : '0 reached');
  var tried = Object.keys(OBS.out).concat(Object.keys(OBS.localonly), Object.keys(OBS.stationLocal)), hit = ex.filter(function (t) { return tried.indexOf(t) >= 0; });
  A('V3', hit.length === 0, 'none is a table the real team cycles shared or attempted (' + tried.length + ' tables)', hit.length ? 'OBSERVED: ' + hit.join(',') : '0 observed');
  return red;
}
views(excluded, false);
var all3 = inPlan.concat(loc, excluded), dup = all3.filter(function (t, i) { return all3.indexOf(t) !== i; });
say(JSON.stringify(all3.slice().sort()) === JSON.stringify(active) && dup.length === 0, 'V4 plan tables + declared local + excluded views == every active AD table, pairwise disjoint (' + inPlan.length + ' + ' + loc.length + ' + ' + excluded.length + ' = ' + active.length + ')', 'missing=' + active.filter(function (t) { return all3.indexOf(t) < 0; }).length + ' extra=' + all3.filter(function (t) { return active.indexOf(t) < 0; }).length + ' duplicated=' + dup.length);
var keptViews = db.prepare("SELECT lower(tablename) AS t FROM ad_table WHERE isactive='Y' AND isview='Y'").all().map(function (x) { return x.t; }).filter(function (t) { return excluded.indexOf(t) < 0; });
say(keptViews.length > 0 && keptViews.every(function (t) { return inPlan.indexOf(t) >= 0 || loc.indexOf(t) >= 0; }), 'V5 the views a window or reference DOES reach stay in the plan (' + keptViews.length + ' kept)', keptViews.slice(0, 5).join(','));
say(P.excluded && P.excluded[0] && P.excluded[0].count === excluded.length, 'the plan records what it left out (excluded: view-unreached x' + (P.excluded && P.excluded[0] && P.excluded[0].count) + ')');
// + ad_rule, ad_table_scriptvalidator (TEAM_REPLICATION_PLUGIN_STUDY §13.2): a script-validator row is the device's own trigger (the POS chain runs on the processor ONLY); shared, every till would
//   run the chain on the others' tickets = a second DocAction executor (FL-8)
var OLD_LOCAL = ['ad_changelog', 'ad_recentitem', 'ad_rule', 'ad_sequence', 'ad_sequence_no', 'ad_session', 'ad_table_scriptvalidator'];
say(JSON.stringify(loc.slice().sort()) === JSON.stringify(OLD_LOCAL), 'declared local == the 5 STATION_LOCAL tables of origin/main erp/team_sync.js:36 + the 2 rule tables (study §13.2: a trigger row is device-local)', loc.slice().sort().join(','));
say(P.flows.every(function (f) { return f.dir === 'BOTH' && f.audience === 'space'; }), 'every plan flow is FACT BOTH audience space (the mesh)');
var m1 = views(excluded.concat(['c_order']), true), m2 = views(excluded.concat([keptViews[0]]), true);
say(m1.indexOf('V1') >= 0, 'mutant: a non-view table added to the exclusion -> V1 red', m1.join(',')); say(m2.indexOf('V2') >= 0, 'mutant: a reached view added to the exclusion -> V2 red', m2.join(','));
console.log('§W-ERPPLAN-SENSE');
var bad = clone(LOCALROWS); bad.push({ name: 'L9 ghost', treatment: 'LOCAL', table: 'No_Such_Table' }); var thrown = null; try { EMIT.emit(db, bad, 'x'); } catch (e) { thrown = e.message; }
say(!!thrown && /no-table/.test(thrown), 'a declared table that does not exist refuses to emit a plan (the emitter can fail)', thrown && thrown.slice(0, 100));
var more = clone(LOCALROWS); more.push({ name: 'L6 c_order', treatment: 'LOCAL', table: 'C_Order' });
var ch = EMIT.emit(db, more, 'flows_erp.json');
say(ch.text !== fresh.text && ch.hash !== fresh.hash && ch.flows === fresh.flows - 1 && ch.local === fresh.local + 1, 'one more LOCAL row changes bytes and hash and moves exactly one table from shared to local', 'flows ' + fresh.flows + ' -> ' + ch.flows + ', local ' + fresh.local + ' -> ' + ch.local);
say(EMIT.emit(db, clone(LOCALROWS), 'flows_erp.json').text === fresh.text, 'emission is deterministic (same rows, same bytes)');
console.log('§W-ERPPLAN-ADAPTER');
var src = fs.readFileSync(adapter, 'utf8').replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
say(!/ad_sequence_no\s*:\s*1|ad_recentitem\s*:\s*1/.test(src), 'the adapter carries no STATION_LOCAL literal any more (the 5 names live in the rows)');
console.log('§ERPPLAN_VERDICT ' + (fails ? 'FAIL' : 'PASS') + ' judged=' + judged + ' fails=' + fails);
process.exit(fails ? 1 : 0);
