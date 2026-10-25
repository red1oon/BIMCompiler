#!/usr/bin/env node
// Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
// SPDX-License-Identifier: MIT
/**
 * witness_scriptor_erp_plan.js — step 5b compiler side. Spec: prompts/TEAMWORK_FRAMEWORK.md §25.
 *   §W-ERPPLAN-DRIFT   the plan shipped to the ERP (erp/team_plan.js in the bim-ootb worktree) equals a fresh emission, byte for byte.
 *   §W-ERPPLAN-SCOPE   behaviour-preserving: tables in plan + declared local == every active AD table; local == the 5 STATION_LOCAL; no table in both; no table missing.
 *   §W-ERPPLAN-SENSE   the emitter can fail: a nonexistent table refuses to emit; a changed LOCAL row changes bytes+hash; deterministic.
 *   §W-ERPPLAN-ADAPTER the adapter no longer carries the STATION_LOCAL literal (grep).
 * Usage: node scripts/witness_scriptor_erp_plan.js [bim-ootb dir, default /tmp/wt-erp-plan]
 */
'use strict';
var path = require('path'), fs = require('fs'), vm = require('vm'), Better = require('better-sqlite3');
var SDIR = path.join(__dirname, '..', 'build', 'scriptor'), OOTB = process.argv[2] || '/tmp/wt-erp-plan';
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
var active = db.prepare("SELECT lower(tablename) AS t FROM ad_table WHERE isactive='Y'").all().map(function (x) { return x.t; }).sort();
var inPlan = P.flows.map(function (f) { return f.table.toLowerCase(); }), loc = P.local.map(function (t) { return t.toLowerCase(); });
var union = inPlan.concat(loc).sort(), both = inPlan.filter(function (t) { return loc.indexOf(t) >= 0; });
say(JSON.stringify(union) === JSON.stringify(active) && both.length === 0, 'plan tables + declared local == every active AD table, none in both (' + inPlan.length + ' + ' + loc.length + ' = ' + active.length + ')', 'missing=' + active.filter(function (t) { return union.indexOf(t) < 0; }).length + ' extra=' + union.filter(function (t) { return active.indexOf(t) < 0; }).length);
var OLD_LOCAL = ['ad_changelog', 'ad_recentitem', 'ad_sequence', 'ad_sequence_no', 'ad_session'];
say(JSON.stringify(loc.slice().sort()) === JSON.stringify(OLD_LOCAL), 'declared local == the 5 STATION_LOCAL tables of origin/main erp/team_sync.js:36', loc.slice().sort().join(','));
say(P.flows.every(function (f) { return f.dir === 'BOTH' && f.audience === 'space'; }), 'every plan flow is FACT BOTH audience space (the mesh)');
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
