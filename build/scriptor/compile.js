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
  return errs;
}
module.exports = { compile: compile, docactionCheck: docactionCheck };
if (require.main === module) {                                          // node build/scriptor/compile.js rows.json
  var Better = require('better-sqlite3'), path = require('path'), fs = require('fs');
  var db = new Better(path.join(__dirname, '..', 'erp', 'ad_full.db'), { readonly: true });
  var r = compile(db, JSON.parse(fs.readFileSync(process.argv[2] || path.join(__dirname, 'flows.json'), 'utf8')));
  require('./report.js').report(r).forEach(function (l) { console.log(l); });
}
