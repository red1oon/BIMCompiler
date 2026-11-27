// Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
// SPDX-License-Identifier: MIT
// patterns.js — loads the Flow Row pattern catalogue (patterns.json, prompts/TEAMWORK_FRAMEWORK.md §26) and resolves it to real rows. Shared by the guide generator and the witness.
'use strict';
var fs = require('fs'), path = require('path');
var CAT = JSON.parse(fs.readFileSync(path.join(__dirname, 'patterns.json'), 'utf8'));
function clone(o) { return JSON.parse(JSON.stringify(o)); }
function fileRows(f) { return JSON.parse(fs.readFileSync(path.join(__dirname, f), 'utf8')); }
function resolve(p) {                                                    // pattern -> its rows, exactly as in the source files
  return p.rows.map(function (r) {
    if (r.inline) return clone(r.inline);
    var rows = fileRows(r.ref), hit = r.virtual ? rows.filter(function (x) { return x.virtualTable === r.virtual; })[0] : rows.filter(function (x) { return x.name === r.name; })[0];
    if (!hit) throw new Error('pattern ' + p.id + ': row not found in ' + r.ref + ': ' + (r.virtual || r.name));
    return clone(hit);
  });
}
function mutate(rows, m) {                                               // a documented mistake applied to a copy of the pattern's rows
  var rs = clone(rows), t = rs.filter(function (x) { return m.virtual ? x.virtualTable === m.virtual : x.name === m.row; })[0];
  if (!t) throw new Error('mistake ' + m.id + ': target row not found');
  if (m.set) Object.keys(m.set).forEach(function (k) { t[k] = m.set[k]; });
  (m.unset || []).forEach(function (k) { delete t[k]; });
  if (m.setColumn) t.columns.filter(function (c) { return c.name === m.setColumn.name; }).forEach(function (c) { Object.keys(m.setColumn).forEach(function (k) { c[k] = m.setColumn[k]; }); });
  if (m.addColumn) t.columns.push(clone(m.addColumn));
  if (m.set && m.set.table && m.virtual === undefined) rs.forEach(function (x) { if (x.table && x !== t) { /* other rows keep their table */ } });
  return rs;
}
module.exports = { CAT: CAT, resolve: resolve, mutate: mutate, clone: clone };
