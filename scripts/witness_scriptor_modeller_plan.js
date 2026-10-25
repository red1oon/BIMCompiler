#!/usr/bin/env node
// Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
// SPDX-License-Identifier: MIT
/**
 * witness_scriptor_modeller_plan.js — step 5a compiler side. Spec: prompts/TEAMWORK_FRAMEWORK.md §24.
 *   §W-PLAN-DRIFT   the plan shipped to the Modeller (modeller/team_plan.js in the bim-ootb worktree) is byte-identical to what emit_plan.js produces from flows_modeller.json now.
 *   §W-PLAN-SENSE   the emitter can fail: a changed row changes the bytes and the hash; a broken row (unknown class) refuses to emit; emission is deterministic.
 *   §W-PLAN-ADAPTER the committed adapter contains NO op-type literal list any more (grep), and still names each op type nowhere but the plan.
 * Usage: node scripts/witness_scriptor_modeller_plan.js [bim-ootb dir, default /tmp/wt-team-plan]
 */
'use strict';
var path = require('path'), fs = require('fs'), Better = require('better-sqlite3');
var SDIR = path.join(__dirname, '..', 'build', 'scriptor'), OOTB = process.argv[2] || '/tmp/wt-team-plan';
var EMIT = require(path.join(SDIR, 'emit_plan.js'));
var db = new Better(path.join(__dirname, '..', 'build', 'erp', 'ad_full.db'), { readonly: true });
var judged = 0, fails = 0;
function say(ok, label, detail) { judged++; if (!ok) fails++; console.log('   ' + (ok ? '🟢' : '🔴') + ' ' + label + (detail ? ' — ' + detail : '')); }
var ROWS = JSON.parse(fs.readFileSync(path.join(SDIR, 'flows_modeller.json'), 'utf8'));
function clone(o) { return JSON.parse(JSON.stringify(o)); }
var shipped = path.join(OOTB, 'modeller', 'team_plan.js'), adapter = path.join(OOTB, 'modeller', 'team_sync.js');
if (!fs.existsSync(shipped) || !fs.existsSync(adapter)) { console.log('§MODPLAN_VERDICT INCONCLUSIVE — ' + OOTB + '/modeller/{team_plan,team_sync}.js not found'); process.exit(2); }
console.log('§W-PLAN-DRIFT');
var fresh = EMIT.emit(db, ROWS, 'flows_modeller.json'), have = fs.readFileSync(shipped, 'utf8');
say(fresh === have, 'the shipped modeller/team_plan.js equals a fresh emission from flows_modeller.json, byte for byte', have.length + ' bytes; hash ' + (/Plan sha256 ([0-9a-f]{12})/.exec(have) || [])[1]);
console.log('§W-PLAN-SENSE');
var r2 = clone(ROWS); r2[0].columns[1].values.push('GEOM_FOO');
var changed = EMIT.emit(db, r2, 'flows_modeller.json');
say(changed !== fresh && /Plan sha256 ([0-9a-f]{64})/.exec(changed)[1] !== /Plan sha256 ([0-9a-f]{64})/.exec(fresh)[1], 'a changed row (one more list value) changes the bytes and the hash', 'GEOM_FOO in output: ' + (changed.indexOf('GEOM_FOO') >= 0));
say(EMIT.emit(db, clone(ROWS), 'flows_modeller.json') === fresh, 'emission is deterministic (same rows, same bytes)');
var r3 = clone(ROWS); r3[0].columns[1].cls = 'NOPE'; var thrown = null; try { EMIT.emit(db, r3, 'x'); } catch (e) { thrown = e.message; }
say(!!thrown && /V1/.test(thrown), 'a broken declaration refuses to emit a plan (the emitter can fail)', thrown);
console.log('§W-PLAN-ADAPTER');
var src = fs.readFileSync(adapter, 'utf8').replace(/\/\/.*$/gm, '');
var lits = (src.match(/GEOM_[A-Z_]+/g) || []).filter(function (x, i, a) { return a.indexOf(x) === i; });
say(!/GEOM_INSERT|GEOM_EXTRUDE|GEOM_SWEEP|GEOM_LOFT|GEOM_REVOLVE/.test(src), 'the adapter no longer lists the create op types (the list lives in the rows)', 'GEOM_* names left in the adapter code: ' + lits.join(','));
console.log('§MODPLAN_VERDICT ' + (fails ? 'FAIL' : 'PASS') + ' judged=' + judged + ' fails=' + fails);
process.exit(fails ? 1 : 0);
