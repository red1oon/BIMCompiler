// ⚠ DO NOT REMOVE — Scope guard
// Scope: W-MULTIHOST-GATE — has the NETWORK CORE (scripts/multihost_core.json) changed since the last recorded
//   W-MULTIHOST-SYNC PASS (scripts/multihost_run.json)? prompts/BACKEND_SUBSTRATE_LANE.md §MH.3.
//   THE ISSUE this proves/disproves: a multi-host sync proof that runs once and is quoted for three months cannot
//   answer "is this real, will it hold" — §MH.0 found the 3-host claim being cited while nothing re-measured it.
//   This gate makes the witness STANDING: it is content-keyed (sha256 of every core file, bim-ootb side from the
//   origin/main blob exactly as check_erp_twins.js does), so a stale pass is impossible; touching any core module
//   turns it red until the witness re-earns a PASS. Modelled on scripts/check_erp_twins.js, which proved the shape.
// §-log first — READ build/erp/check_multihost_gate.log before any conclusion (exit code is NOT evidence).
// Run:  bash build/erp/run_witness.sh scripts/check_multihost_gate.js     (cwd = bim-compiler)
//   exit 0 = every core file matches the recorded PASS · 1 = changed / missing / undeclared / never run
//   · 2 = INCONCLUSIVE (the manifest declares nothing — vacuous). Re-earn: bash build/erp/run_witness.sh scripts/witness_multihost_sync.js
'use strict';
var fs = require('fs'), path = require('path');
var MC = require('./multihost_core.js');
var RECORD = path.join(__dirname, 'multihost_run.json');

var base = MC.ootbBase();
console.log('§MHGATE_BASE ootb=' + base.ootb + ' behind_origin_main=' + base.behind + '  (bim-ootb core hashed from origin/main blobs, never the checkout; bim-compiler core from the working tree)');
var now = MC.hashCore(), keys = Object.keys(now);
if (!keys.length) { console.log('🔴 W-MULTIHOST-GATE INCONCLUSIVE — scripts/multihost_core.json declares nothing; nothing was judged (vacuous, not a pass)'); process.exit(2); }

var rec = null; try { rec = JSON.parse(fs.readFileSync(RECORD, 'utf8')); } catch (e) { rec = null; }
var recCore = (rec && rec.core) || {};
if (rec) console.log('§MHGATE_RECORD utc=' + rec.utc + ' verdict=' + rec.verdict + ' hosts_up=' + rec.hosts_up + ' epoch=' + rec.epoch + ' len=' + rec.len + ' tip=' + (rec.tip || '').slice(0, 12) + ' gh_commit=' + (rec.gh_commit || '-').slice(0, 10) + ' core_recorded=' + Object.keys(recCore).length);
else console.log('§MHGATE_RECORD none — ' + path.relative(MC.HERE, RECORD) + ' does not exist: the witness has never recorded a PASS on this tree');

var rows = [], same = 0, changed = 0, missing = 0, unrecorded = 0, dropped = 0;
var all = {}; keys.forEach(function (k) { all[k] = 1; }); Object.keys(recCore).forEach(function (k) { all[k] = 1; });
Object.keys(all).sort().forEach(function (k) {
  var cur = now[k], old = recCore[k], st;
  if (!(k in now)) { st = 'DROPPED'; dropped++; }                       // recorded then removed from the manifest — the manifest hash itself changed
  else if (cur === null) { st = 'MISSING'; missing++; }                // declared but not in the tree: scope decay, never skip silently
  else if (!(k in recCore)) { st = 'UNRECORDED'; unrecorded++; }       // declared after the last run
  else if (cur === old) { st = 'SAME'; same++; }
  else { st = 'CHANGED'; changed++; }
  rows.push([st, k, (old || '-').slice(0, 10), (cur || '-').slice(0, 10)]);
});
console.log('\n§MHGATE_TABLE  verdict · core file · recorded sha256 · current sha256');
rows.forEach(function (r) { console.log('  ' + r[0].padEnd(10) + ' ' + r[1] + '  ' + r[2] + ' → ' + r[3]); });
console.log('\n§MHGATE_SUMMARY core=' + keys.length + ' same=' + same + ' changed=' + changed + ' missing=' + missing + ' unrecorded=' + unrecorded + ' dropped=' + dropped +
  ' record=' + (rec ? rec.verdict + '/hosts_up=' + rec.hosts_up : 'none'));

var reasons = [];
if (!rec) reasons.push('no recorded run');
else { if (rec.verdict !== 'PASS') reasons.push('recorded verdict is ' + rec.verdict); if (!(rec.hosts_up >= 3)) reasons.push('recorded hosts_up=' + rec.hosts_up + ' <3 (a §CRISIS-class record, refused)'); }
if (changed) reasons.push(changed + ' core file(s) changed since the recorded PASS');
if (missing) reasons.push(missing + ' declared core file(s) missing from the tree');
if (unrecorded) reasons.push(unrecorded + ' core file(s) declared after the recorded PASS');
if (dropped) reasons.push(dropped + ' recorded file(s) no longer declared');
if (reasons.length) {
  console.log('🔴 W-MULTIHOST-GATE FAIL — ' + reasons.join('; ') + '. The network core has moved past its proof: re-earn it with\n   bash build/erp/run_witness.sh scripts/witness_multihost_sync.js');
  process.exit(1);
}
console.log('🟢 W-MULTIHOST-GATE PASS — all ' + same + ' core files match the PASS recorded ' + rec.utc + ' (epoch ' + rec.epoch + ', tip ' + rec.tip.slice(0, 12) + ', hosts_up ' + rec.hosts_up + '); nothing in the network core has changed since it was proven');
