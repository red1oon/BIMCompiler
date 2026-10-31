// Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
// SPDX-License-Identifier: MIT
// flow.js — Replication Scriptor S1: from a DECLARED FLOW, derive the minimal payload, the references the receiver must already hold
// (the base requirement) and the columns the receiver has to reconstruct. Implementing prompts/TEAMWORK_FRAMEWORK.md §16.15 + §16.0a (FL-1..FL-5).
// Edge rules (ER-1..ER-5) live in scope.js (extracted from iDempiere MLookupFactory/MQuery). Read-only over build/erp/ad_full.db.
'use strict';
var crypto = require('crypto');
var SCOPE = require('./scope.js');

var MEASURE = { 11: 1, 12: 1, 22: 1, 29: 1, 37: 1 }, DATE = { 15: 1, 16: 1, 24: 1, 200133: 1 }, FLAG = { 20: 1 }, CODE = { 17: 1 };
var TEXT = { 10: 1, 14: 1, 34: 1, 36: 1, 38: 1, 39: 1, 40: 1, 42: 1 };
var AUDIT = { created: 1, createdby: 1, updated: 1, updatedby: 1, isactive: 1 };       // auto-filled; never "mandatory-uncarried"
var PARTITION = ['AD_Client_ID', 'AD_Org_ID'];                                           // SD-3, always implicit

function lc(x) { return String(x).toLowerCase(); }
function byName_all(cols) { var m = {}; cols.forEach(function (c) { m[lc(c.name)] = 1; }); return m; }   // a virtual table has no field rows: every declared column counts as editable

// tableColumns(db, tableId, opts) -> active columns of one table
function tableColumns(db, tableId, opts) {
  return db.prepare('SELECT columnname AS name, ad_reference_id AS ref, ad_reference_value_id AS rv, iskey AS iskey, ismandatory AS mand, defaultvalue AS def, isparent AS par, isactive AS act ' +
    'FROM ad_column WHERE ad_table_id=? ORDER BY columnname').all(tableId).filter(function (c) { return (opts && opts.ignoreActive) || c.act === 'Y'; });
}

// derivedColumns(db, tableId) -> { derived:{lcname:1}, editable:{lcname:1}, fields:n }
// The window definition says what a human types and what the system computes: a column whose AD_Field rows are ALL read-only is derived (FL-6, §16.16).
function derivedColumns(db, tid) {
  var rows = db.prepare("SELECT lower(c.columnname) AS n, SUM(CASE WHEN f.isreadonly='N' THEN 1 ELSE 0 END) AS ed, COUNT(*) AS tot FROM ad_field f " +
    "JOIN ad_column c ON c.ad_column_id=f.ad_column_id JOIN ad_tab t ON t.ad_tab_id=f.ad_tab_id " +
    "WHERE t.ad_table_id=? AND f.isactive='Y' AND t.isactive='Y' GROUP BY lower(c.columnname)").all(tid);
  var d = {}, e = {};
  rows.forEach(function (r) { if (r.ed > 0) e[r.n] = 1; else if (r.tot > 0) d[r.n] = 1; });
  return { derived: d, editable: e, fields: rows.length };
}
// strategyTypes(db, strategyId) -> { tableId: 'R'|'M'|'L'|'B' }  (table-level type, read from AD_ReplicationTable, never repeated in a flow row)
function strategyTypes(db, sid) {
  var m = {}; db.prepare("SELECT ad_table_id AS t, replicationtype AS r FROM ad_replicationtable WHERE ad_replicationstrategy_id=? AND isactive='Y'").all(sid).forEach(function (x) { m[x.t] = x.r; });
  return m;
}

// classify(col, E, tableId, opts) -> { cls, target?, why? }
function classify(col, E, tableId, opts) {
  if (col.declared) return col.declared.cls === 'REF' ? { cls: 'REF', tname: col.declared.target, kind: 'DECLARED' } : { cls: col.declared.cls };   // virtual table: the class is stated in the row (§22.1)
  if (col.iskey === 'Y') return { cls: 'KEY' };
  var e = null;
  for (var i = 0; i < E.edges.length; i++) if (E.edges[i].from === tableId && E.edges[i].col === col.name) { e = E.edges[i]; break; }
  if (e) return { cls: 'REF', target: e.to, kind: e.kind };
  var u = E.unresolved.filter(function (x) { return x.from === tableId && x.col === col.name; })[0];
  if (u) return { cls: 'REF?', why: u.why };
  var ub = E.unbounded.filter(function (x) { return x.from === tableId && x.col === col.name; })[0];
  if (ub) return { cls: 'REF?', why: 'record-id' };
  if (MEASURE[col.ref]) return { cls: 'MEASURE' };
  if (DATE[col.ref]) return { cls: 'DATE' };
  if (FLAG[col.ref]) return { cls: 'FLAG' };
  if (CODE[col.ref]) return { cls: 'CODE' };
  if (TEXT[col.ref]) return opts && opts.textAsMeasure ? { cls: 'MEASURE' } : { cls: 'TEXT' };   // textAsMeasure = MUTANT switch only
  return { cls: 'OTHER' };
}

// virtualTables(rows, E, opts) -> { map:{lcname:{name,key,cols}}, errors:[] }  — a table declared in a row instead of the dictionary (§22.1, guards V1-V5)
var CLASSES = { KEY: 1, REF: 1, MEASURE: 1, DATE: 1, FLAG: 1, CODE: 1, TEXT: 1, OTHER: 1 };
function virtualTables(rows, E, opts) {
  var map = {}, errors = [];
  if (opts && opts.noVirtual) return { map: map, errors: errors };
  var decls = rows.filter(function (r) { return r.virtualTable && r.isactive !== false; });
  decls.forEach(function (d) { map[lc(d.virtualTable)] = { name: d.virtualTable, key: null, cols: [] }; });
  decls.forEach(function (d) {
    var v = map[lc(d.virtualTable)], seen = {}, keys = 0, e = function (code, m) { if (!(opts && opts.noVirtualValidate)) errors.push(code + ' ' + d.virtualTable + ': ' + m); };
    if (!(d.columns && d.columns.length)) e('V4', 'no columns');
    (d.columns || []).forEach(function (c) {
      if (!CLASSES[c.cls]) e('V1', c.name + ' has unknown class ' + c.cls);
      if (c.cls === 'REF' && E.idByName[lc(c.target)] === undefined && !map[lc(c.target)]) e('V2', c.name + ' targets unknown table ' + c.target);
      if (c.values !== undefined && (c.cls !== 'CODE' || !Array.isArray(c.values) || !c.values.length || c.values.some(function (x) { return typeof x !== 'string' || !x; }) || new Set(c.values).size !== c.values.length)) e('V6', c.name + ' values must be a non-empty list of unique strings on a CODE column');
      if (seen[lc(c.name)]) e('V3', 'duplicate column ' + c.name);
      seen[lc(c.name)] = 1;
      if (c.cls === 'KEY') { keys++; v.key = c.name; }
      v.cols.push({ name: c.name, ref: null, rv: null, iskey: c.cls === 'KEY' ? 'Y' : 'N', mand: c.mand ? 'Y' : 'N', def: null, par: 'N', act: 'Y', declared: { cls: c.cls, target: c.target, values: c.values } });
    });
    if (keys > 1) e('V4', keys + ' key columns');
  });
  return { map: map, errors: errors };
}

// deriveFlow(db, E, flow, opts) -> canonical object (sorted, no timestamps)
function deriveFlow(db, E, flow, opts) {
  opts = opts || {};
  var tid = E.idByName[lc(flow.table)], vt = opts.virtual && opts.virtual[lc(flow.table)];
  var out = { name: flow.name, dir: flow.dir, table: flow.table, schedule: flow.schedule, from: flow.from, to: flow.to };
  if (vt && tid !== undefined) { out.error = 'V5 virtual-shadows-ad'; return out; }
  if (tid === undefined && !vt) { out.error = 'no-table'; return out; }
  var cols = vt ? vt.cols : tableColumns(db, tid, opts), byName = {};
  cols.forEach(function (c) { byName[lc(c.name)] = c; });
  var tname = vt ? vt.name : E.tableById[tid].name;
  var identity = vt ? vt.key : byName[lc(tname + '_UU')] ? tname + '_UU' : null;
  var implicit = [];
  if (identity) implicit.push(identity);
  PARTITION.forEach(function (p) { if (byName[lc(p)]) implicit.push(p); });
  var impl = {}; implicit.forEach(function (n) { impl[lc(n)] = 1; });
  var declaredMissing = [], payload = [], carriedSet = {};
  var dc = vt ? { derived: {}, editable: byName_all(cols), fields: 0 } : derivedColumns(db, tid), proposed = !flow.carries || (flow.carries.length === 0);
  var names = flow.carries === '*' ? cols.map(function (c) { return c.name; }) : proposed
    ? cols.filter(function (c) {                                          // candidates: what a human enters, minus text/other/key (a PROPOSAL, §16.16)
        var k = classify(c, E, tid, opts); return dc.editable[lc(c.name)] && k.cls !== 'TEXT' && k.cls !== 'OTHER' && k.cls !== 'KEY' && !impl[lc(c.name)] && !AUDIT[lc(c.name)]; })
      .map(function (c) { return c.name; })
    : flow.carries;
  names.forEach(function (n) {
    var c = byName[lc(n)];
    if (!c) { declaredMissing.push(n); return; }
    var k = classify(c, E, tid, opts);
    payload.push({ col: c.name, cls: k.cls, values: c.declared && c.declared.values, target: k.tname || (k.target !== undefined ? E.tableById[k.target].name : undefined), kind: k.kind, why: k.why });
    carriedSet[lc(c.name)] = 1;
  });
  payload.sort(function (a, b) { return a.col < b.col ? -1 : a.col > b.col ? 1 : 0; });
  var mandatoryUncarried = cols.filter(function (c) {
    return c.mand === 'Y' && (c.def === null || c.def === '' || c.def === undefined) && !carriedSet[lc(c.name)] && !impl[lc(c.name)] && !AUDIT[lc(c.name)] && c.iskey !== 'Y';
  }).map(function (c) { return c.name; });
  var targets = {};
  payload.forEach(function (p) { if (p.cls === 'REF' && p.target && lc(p.target) !== lc(flow.table)) targets[p.target] = 1; });   // a self-reference is satisfied by the flow itself
  var targetIds = Object.keys(targets).map(function (n) { return E.idByName[lc(n)]; }).filter(function (x) { return x !== undefined; }).sort(function (a, b) { return a - b; });
  var byClass = {};
  payload.forEach(function (p) { byClass[p.cls] = (byClass[p.cls] || 0) + 1; });
  var exempt = function (p) { var c = byName[lc(p.col)]; return c.iskey === 'Y' || c.par === 'Y' || impl[lc(p.col)]; };
  var st = strategyTypes(db, flow.strategy || 100), bt = {};
  targetIds.forEach(function (t) { bt[E.tableById[t].name] = st[t] || 'unlisted'; });
  Object.keys(targets).forEach(function (n) { if (E.idByName[lc(n)] === undefined) bt[n] = 'virtual'; });
  out.role = flow.role; out.strategy = flow.strategy || 100; out.group = flow.group; out.proposed = proposed;
  out.tableType = vt ? 'virtual' : st[tid] || 'unlisted';
  out.baseTypes = bt; out.fieldRows = dc.fields;
  if (vt && !opts.noVacuousLabel) out.ghostGuard = 'VACUOUS';                // FL-6 judges AD fields; a virtual table has none (§22.1)
  out.derivedCarried = opts.noGhostGuard ? [] : payload.filter(function (p) { return dc.derived[lc(p.col)] && !exempt(p); }).map(function (p) { return p.col; });   // FL-6 guard (noGhostGuard = MUTANT switch)
  out.tableColumns = cols.length;
  out.implicit = implicit;
  out.payload = payload;
  out.payloadColumns = payload.length + implicit.length;
  out.byClass = byClass;
  out.declaredMissing = declaredMissing.sort();
  out.mandatoryUncarried = mandatoryUncarried;
  out.baseRequirement = Object.keys(targets).sort();
  out._targetIds = targetIds;
  return out;
}

// baseClosure(E, targetIds, userLevel) -> { variantId: {size, blocked} } for the base requirement of a set of flows
function baseClosure(E, targetIds, userLevel, opts) {
  var res = {};
  SCOPE.VARIANTS.forEach(function (v) {
    var c = SCOPE.closure(E, targetIds, userLevel, { follow: v.follow, audit: v.audit, gate: opts && opts.noGate ? false : v.gate });
    res[v.id] = { size: c.set.length, blocked: c.blocked.length, tables: c.set, blockedTables: c.blocked };
  });
  return res;
}

function canonical(o) { return JSON.stringify(o, function (k, v) { return k.charAt(0) === '_' ? undefined : v; }); }
function hash(o) { return crypto.createHash('sha256').update(canonical(o)).digest('hex'); }

module.exports = { virtualTables: virtualTables, derivedColumns: derivedColumns, strategyTypes: strategyTypes, tableColumns: tableColumns, classify: classify, deriveFlow: deriveFlow, baseClosure: baseClosure, canonical: canonical, hash: hash, PARTITION: PARTITION };
