// Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
// SPDX-License-Identifier: MIT
// erp_scope.js — which active AD tables can any role's window reach? (prompts/TEAMWORK_FRAMEWORK.md §30-§31). Roots = tabs of windows a role can open (active window, tab, table); closure = scope.js edges, gate off.
'use strict';
var SCOPE = require('./scope.js');
function reach(db, follow) {                                             // -> { names:{lcname:1}, roots:n, active:n }
  var E = SCOPE.buildEdges(db, {}), union = {};
  db.prepare("SELECT ad_role_id AS id FROM ad_role WHERE isactive='Y'").all().forEach(function (r) { SCOPE.rootsFor(db, r.id).roots.forEach(function (t) { union[t] = 1; }); });
  var roots = Object.keys(union).map(Number), c = SCOPE.closure(E, roots, '  O', { follow: follow || 'ALL', audit: false, gate: false }), names = {};
  c.set.forEach(function (id) { names[String(E.tableById[id].name).toLowerCase()] = 1; });
  return { names: names, roots: roots.length, active: Object.keys(E.tableById).filter(function (k) { return E.tableById[k].act === 'Y'; }).length };
}
// excludedViews(db, observedShared) -> [table names]: IsView=Y, not reached by any window/reference (closure ALL), not a table the real cycles shared
function excludedViews(db, observedShared) {
  var R = reach(db, 'ALL'), obs = {}; (observedShared || []).forEach(function (t) { obs[String(t).toLowerCase()] = 1; });
  return db.prepare("SELECT tablename AS t FROM ad_table WHERE isactive='Y' AND isview='Y' ORDER BY lower(tablename)").all().map(function (x) { return x.t; }).filter(function (t) { return !R.names[t.toLowerCase()] && !obs[t.toLowerCase()]; });
}
module.exports = { reach: reach, excludedViews: excludedViews };
