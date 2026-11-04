// Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
// SPDX-License-Identifier: MIT
// compile.js — the ONE generic replication compiler (prompts/TEAMWORK_FRAMEWORK.md §16.16). It knows no table name: a flow is a ROW
// (role, table, direction, carries, group, schedule); everything else is read from the AD (edge rules, window definition, replication strategy).
'use strict';
var SCOPE = require('./scope.js'), FLOW = require('./flow.js'), TREAT = require('./treat.js');
function compile(db, rows, opts) {
  var E = SCOPE.buildEdges(db, opts || {}), V = FLOW.virtualTables(rows, E, opts);
  opts = Object.assign({}, opts, { virtual: V.map });
  var names = {}; rows.forEach(function (x) { if (x.name) names[x.name] = 1; });
  var plan = rows.filter(function (r) { return r.isactive !== false && !r.virtualTable; }).map(function (r) {
    var errs = r.treatment ? TREAT.validate(r).concat(TREAT.refs(r, names)) : [];                    // a treatment states its own needs (§16.18)
    var f = r.table ? FLOW.deriveFlow(db, E, r, opts || {}) : { name: r.name, noTable: true };   // rows with no AD table (RULE, public SEED, INSTRUMENT) carry no payload analysis
    f.treatment = r.treatment; f.treatmentErrors = errs; if (r.docaction !== undefined) f.docaction = r.docaction; return f;
  });
  var planErrors = docactionCheck(rows);
  return { plan: plan, hash: FLOW.hash(plan), E: E, virtualErrors: V.errors, planErrors: planErrors, ok: !planErrors.length };
}
// FL-8 (UPS) E1 — ONE DocAction executor per document, never the station that declares it (§38.1). Plan-wide: the rule sees rows, never a table name.
var DOCACTIONS = { CO: 1, PR: 1, AP: 1, RJ: 1, VO: 1, CL: 1, RC: 1, RA: 1, RE: 1, IT: 1, WC: 1, XL: 1, '--': 1 };   // iDempiere DocAction codes (AD_Ref_List 135)
function docactionCheck(rows) {
  var errs = [], byTable = {};
  rows.filter(function (r) { return r.isactive !== false && r.docaction !== undefined; }).forEach(function (r) {
    var d = r.docaction;
    if (d && d.executor === 'author') { errs.push({ code: 'docaction-author-retired', row: r.name }); return; }       // study §12.2 2.5: the executor is a ROLE (Document Action Access, as legacy); the office/mesh plan names none = legacy
    if (!r.table || !d || typeof d !== 'object' || !Number.isInteger(d.executor) || !Array.isArray(d.actions) || !d.actions.length || d.actions.some(function (a) { return !DOCACTIONS[a]; })) {
      errs.push({ code: 'docaction-bad', row: r.name }); return; }
    var t = String(r.table).toLowerCase(); (byTable[t] = byTable[t] || []).push(r.name);
    if (r.dir === 'UP' && d.executor === r.role) errs.push({ code: 'station-docaction', row: r.name });
  });
  Object.keys(byTable).forEach(function (t) { if (byTable[t].length > 1) errs.push({ code: 'dual-docaction', table: t, rows: byTable[t] }); });
  // §28 (lead decision 2026-11-04): ONE table may have a DOWN flow AND an UP flow only when the plan names the UP role as the DocAction EXECUTOR of that table's document type
  // (the destination branch role completes the Move Confirmation head office created). The UP then carries only that executor's outcome. Any other DOWN+UP pair on one table is two sources of truth.
  var dirs = {};
  rows.filter(function (r) { return r.isactive !== false && r.table && (r.dir === 'UP' || r.dir === 'DOWN') && r.treatment === 'FACT'; }).forEach(function (r) { var t = String(r.table).toLowerCase(); (dirs[t] = dirs[t] || { DOWN: [], UP: [] })[r.dir].push(r); });
  Object.keys(dirs).forEach(function (t) {
    var d = dirs[t]; if (!d.UP.length || !d.DOWN.length) return;
    var execs = rows.filter(function (r) { return r.isactive !== false && r.docaction && Number.isInteger(r.docaction.executor) && String(r.table).toLowerCase() === t; }).map(function (r) { return r.docaction.executor; });
    d.UP.forEach(function (u) { if (execs.indexOf(u.role) < 0) errs.push({ code: 'updown-not-executor', table: t, row: u.name }); });
  });
  return errs;
}
module.exports = { compile: compile, docactionCheck: docactionCheck };
if (require.main === module) {                                          // node build/scriptor/compile.js rows.json
  var Better = require('better-sqlite3'), path = require('path'), fs = require('fs');
  var db = new Better(path.join(__dirname, '..', 'erp', 'ad_full.db'), { readonly: true });
  var r = compile(db, JSON.parse(fs.readFileSync(process.argv[2] || path.join(__dirname, 'flows.json'), 'utf8')));
  require('./report.js').report(r).forEach(function (l) { console.log(l); });
}
