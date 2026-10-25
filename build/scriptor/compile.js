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
    f.treatment = r.treatment; f.treatmentErrors = errs; return f;
  });
  return { plan: plan, hash: FLOW.hash(plan), E: E, virtualErrors: V.errors };
}
module.exports = { compile: compile };
if (require.main === module) {                                          // node build/scriptor/compile.js rows.json
  var Better = require('better-sqlite3'), path = require('path'), fs = require('fs');
  var db = new Better(path.join(__dirname, '..', 'erp', 'ad_full.db'), { readonly: true });
  var r = compile(db, JSON.parse(fs.readFileSync(process.argv[2] || path.join(__dirname, 'flows.json'), 'utf8')));
  require('./report.js').report(r).forEach(function (l) { console.log(l); });
}
