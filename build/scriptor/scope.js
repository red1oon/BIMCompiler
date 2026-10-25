// Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
// SPDX-License-Identifier: MIT
// scope.js — Replication Scriptor S1: derive, from the Application Dictionary alone, the table scope of one role.
// Implementing prompts/TEAMWORK_FRAMEWORK.md §16.15 (edge rules ER-1..ER-5, roots, closure variants) — Witness: W-SCRIPTOR-*
// Edge rules are EXTRACTED from iDempiere: MLookupFactory.getLookupInfo (MLookupFactory.java:192-214),
// MQuery.getZoomColumnName / getZoomTableName (MQuery.java). Role gating = build/erp/ad_access.js canView (MRole.canView:2422-2465).
// Read-only: takes an open better-sqlite3 handle on build/erp/ad_full.db. No network, no engine change.
'use strict';
var crypto = require('crypto');
var path = require('path');
var ACCESS = require(path.join(__dirname, '..', 'erp', 'ad_access.js'));

// DisplayType ids (SystemIDs.java REFERENCE_DATATYPE_*)
var TABLE = 18, TABLE_UU = 200233, SEARCH = 30, SEARCH_UU = 200235, CH_TABLE = 200162, CH_SEARCH = 200163;
var TABLEDIR = 19, TABLEDIR_UU = 200234, LIST = 17;
// ER-4: typed lookups. Table per the lookup class, READ from iDempiere source (not guessed):
//   Locator 31 -> M_Locator (MLocatorLookup.java:384), Location 21 -> C_Location (MLocationLookup.java:142-147),
//   Account 25 -> C_ValidCombination (MAccountLookup.java:58), PAttribute 35 -> M_AttributeSetInstance (MPAttributeLookup.java:130).
// Image 32, Assignment 33, Payment 200012: lookup classes NOT read -> stay UNRESOLVED(typed-lookup), never guessed.
var TYPED_TABLE = { 21: 'C_Location', 25: 'C_ValidCombination', 31: 'M_Locator', 35: 'M_AttributeSetInstance' };
var TYPED = { 32: 1, 33: 1, 200012: 1 };
var RECORD = { 200202: 1, 200240: 1 };                                 // Record_ID / Record_UU (polymorphic)
var WITH_VALUE = {}; [TABLE, TABLE_UU, SEARCH, SEARCH_UU, CH_TABLE, CH_SEARCH].forEach(function (i) { WITH_VALUE[i] = 1; });
var DIRECT = {}; [TABLEDIR, TABLEDIR_UU].forEach(function (i) { DIRECT[i] = 1; });

// MQuery.getZoomColumnName — the fixed renames, verbatim
var ZOOM = {
  SalesRep_ID: 'AD_User_ID', C_DocTypeTarget_ID: 'C_DocType_ID', Bill_BPartner_ID: 'C_BPartner_ID',
  Bill_Location_ID: 'C_BPartner_Location_ID', BillTo_ID: 'C_BPartner_Location_ID', Account_ID: 'C_ElementValue_ID',
  C_LocFrom_ID: 'C_Location_ID', C_LocTo_ID: 'C_Location_ID', BP_Location_ID: 'C_Location_ID', C_UOM_To_ID: 'C_UOM_ID',
  M_AttributeSetInstanceTo_ID: 'M_AttributeSetInstance_ID', M_LocatorTo_ID: 'M_Locator_ID',
  AD_OrgBP_ID: 'AD_Org_ID', AD_OrgTrx_ID: 'AD_Org_ID', AD_OrgTo_ID: 'AD_Org_ID'
};
function zoomColumn(c) { return Object.prototype.hasOwnProperty.call(ZOOM, c) ? ZOOM[c] : c; }
function zoomTable(c) {                                                 // MQuery.getZoomTableName
  var t = zoomColumn(c), i = t.lastIndexOf('_ID');
  if (i !== -1) return t.substring(0, i);
  i = t.lastIndexOf('_UU');
  if (i !== -1) return t.substring(0, i);
  return t;
}
var PARTITION_AUDIT = { ad_client_id: 1, ad_org_id: 1, createdby: 1, updatedby: 1 };   // SD-3: not closure

// buildEdges(db, opts) -> { edges:[{from,col,to,kind,mand,parent,audit}], unresolved:[{from,col,why}], unbounded:[{from,col}], tableById, idByName }
// opts.skipER1 / skipER2 / skipER4 / ignoreActive are MUTANT switches (W-SCRIPTOR-MUTANTS), never used in production.
function buildEdges(db, opts) {
  opts = opts || {};
  var tables = db.prepare('SELECT ad_table_id AS id, tablename AS name, accesslevel AS al, isactive AS act FROM ad_table').all();
  var tableById = {}, idByName = {};
  tables.forEach(function (t) { tableById[t.id] = t; if (opts.ignoreActive || t.act === 'Y') idByName[String(t.name).toLowerCase()] = t.id; });
  var refTable = {};
  db.prepare('SELECT ad_reference_id AS r, ad_table_id AS t FROM ad_ref_table').all().forEach(function (x) { refTable[x.r] = x.t; });
  var cols = db.prepare('SELECT c.ad_table_id AS tid, c.columnname AS col, c.ad_reference_id AS ref, c.ad_reference_value_id AS rv, ' +
    "c.ismandatory AS mand, c.isparent AS par, c.isactive AS cact FROM ad_column c ORDER BY c.ad_table_id, c.columnname").all();
  var edges = [], unresolved = [], unbounded = [];
  cols.forEach(function (c) {
    if (!opts.ignoreActive) { if (c.cact !== 'Y') return; var tt = tableById[c.tid]; if (!tt || tt.act !== 'Y') return; }
    var ref = c.ref, audit = !!PARTITION_AUDIT[String(c.col).toLowerCase()];
    var e = { from: c.tid, col: c.col, to: null, kind: null, mand: c.mand === 'Y', parent: c.par === 'Y', audit: audit };
    if (ref === LIST) return;                                           // ER-3
    if (RECORD[ref]) { unbounded.push({ from: c.tid, col: c.col }); return; }   // ER-5
    if (TYPED_TABLE[ref] && !opts.skipER4) {                           // ER-4 (resolved from source)
      var t4 = idByName[String(TYPED_TABLE[ref]).toLowerCase()];
      if (t4 === undefined) { unresolved.push({ from: c.tid, col: c.col, why: 'name-no-table' }); return; }
      e.to = t4; e.kind = 'ER4'; edges.push(e); return;
    }
    if (TYPED[ref] || TYPED_TABLE[ref]) { unresolved.push({ from: c.tid, col: c.col, why: 'typed-lookup' }); return; }   // ER-4 unresolved
    if (WITH_VALUE[ref] && c.rv && !opts.skipER1) {                     // ER-1
      var t = refTable[c.rv];
      if (t === undefined) { unresolved.push({ from: c.tid, col: c.col, why: 'refvalue-missing' }); return; }
      e.to = t; e.kind = 'ER1'; edges.push(e); return;
    }
    if ((DIRECT[ref] || (WITH_VALUE[ref] && !c.rv)) && !opts.skipER2) { // ER-2
      var name = String(c.col);
      if (!/_ID$|_UU$/.test(name)) { unresolved.push({ from: c.tid, col: c.col, why: 'bad-key' }); return; }
      var tid = idByName[zoomTable(name).toLowerCase()];
      if (tid === undefined) { unresolved.push({ from: c.tid, col: c.col, why: 'name-no-table' }); return; }
      e.to = tid; e.kind = 'ER2'; edges.push(e);
    }
  });
  return { edges: edges, unresolved: unresolved, unbounded: unbounded, tableById: tableById, idByName: idByName };
}

// roots(db, roleId) -> { role, windows, tabs, roots:Set(tableId) }
function rootsFor(db, roleId, opts) {
  opts = opts || {};
  var role = db.prepare('SELECT ad_role_id AS id, name, userlevel AS ul FROM ad_role WHERE ad_role_id=?').get(roleId);
  if (!role) throw new Error('no such role ' + roleId);
  var wins = db.prepare("SELECT ad_window_id AS w FROM ad_window_access WHERE ad_role_id=?" + (opts.ignoreActive ? '' : " AND isactive='Y'")).all(roleId).map(function (x) { return x.w; });
  var tabs = [], roots = {};
  var q = db.prepare('SELECT t.ad_tab_id AS t, t.ad_table_id AS tbl FROM ad_tab t JOIN ad_window w ON w.ad_window_id=t.ad_window_id JOIN ad_table x ON x.ad_table_id=t.ad_table_id WHERE t.ad_window_id=?' + (opts.ignoreActive ? '' : " AND t.isactive='Y' AND w.isactive='Y' AND x.isactive='Y'"));   // an inactive window or table is not a root (found by W-ERPSCOPE-ROOTS)
  wins.forEach(function (w) { q.all(w).forEach(function (r) { tabs.push(r.t); roots[r.tbl] = 1; }); });
  return { role: role, windows: wins.length, tabs: tabs.length, roots: Object.keys(roots).map(Number).sort(function (a, b) { return a - b; }) };
}

// closure(E, roots, userLevel, v) -> { set:[ids], blocked:[ids] }   v = { follow:'PARENT'|'MAND'|'ALL', audit:bool, gate:bool }
function closure(E, roots, userLevel, v) {
  var out = {}, blocked = {}, queue = [], bySrc = {};
  E.edges.forEach(function (e) { (bySrc[e.from] || (bySrc[e.from] = [])).push(e); });
  function allowed(tid) { if (!v.gate) return true; var t = E.tableById[tid]; return !!t && ACCESS.canView(userLevel, t.al); }
  roots.forEach(function (r) { if (allowed(r)) { if (!out[r]) { out[r] = 1; queue.push(r); } } else blocked[r] = 1; });
  while (queue.length) {
    var cur = queue.shift();
    (bySrc[cur] || []).forEach(function (e) {
      if (v.follow === 'PARENT' && !e.parent) return;
      if (v.follow === 'MAND' && !e.mand) return;
      if (!v.audit && e.audit) return;
      if (out[e.to]) return;
      if (!allowed(e.to)) { blocked[e.to] = 1; return; }
      out[e.to] = 1; queue.push(e.to);
    });
  }
  var num = function (o) { return Object.keys(o).map(Number).sort(function (a, b) { return a - b; }); };
  return { set: num(out), blocked: num(blocked) };
}

var VARIANTS = [];
['PARENT', 'MAND', 'ALL'].forEach(function (f) { [false, true].forEach(function (a) { [true, false].forEach(function (g) {
  VARIANTS.push({ id: f + (a ? '+audit' : '') + (g ? '' : '+nogate'), follow: f, audit: a, gate: g }); }); }); });

// derive(db, roleId, opts) -> canonical object (sorted, no timestamps) for hashing; opts as buildEdges + noGate mutant
function derive(db, roleId, opts) {
  opts = opts || {};
  var E = buildEdges(db, opts), R = rootsFor(db, roleId, opts), res = {};
  VARIANTS.forEach(function (v) {
    var vv = { follow: v.follow, audit: v.audit, gate: opts.noGate ? false : v.gate };
    var c = closure(E, R.roots, R.role.ul, vv);
    res[v.id] = { size: c.set.length, blocked: c.blocked.length, tables: c.set, blockedTables: c.blocked };
  });
  var allSet = {}; res['ALL'].tables.forEach(function (t) { allSet[t] = 1; });
  var cnt = function (arr) { var m = {}; arr.forEach(function (x) { if (allSet[x.from]) m[x.why || 'record-id'] = (m[x.why || 'record-id'] || 0) + 1; }); return m; };
  return {
    role: { id: R.role.id, name: R.role.name, userLevel: R.role.ul },
    windows: R.windows, tabs: R.tabs, roots: R.roots,
    variants: res,
    unresolvedInScope: cnt(E.unresolved), unboundedInScope: cnt(E.unbounded),
    globalEdges: E.edges.length, globalUnresolved: E.unresolved.length, globalUnbounded: E.unbounded.length,
    _E: E
  };
}

function canonical(d) {                                                 // deterministic JSON without the raw edge graph
  var c = JSON.parse(JSON.stringify(d, function (k, v) { return k === '_E' ? undefined : v; }));
  return JSON.stringify(c);
}
function hash(d) { return crypto.createHash('sha256').update(canonical(d)).digest('hex'); }

module.exports = { TYPED_TABLE: TYPED_TABLE, buildEdges: buildEdges, rootsFor: rootsFor, closure: closure, derive: derive, canonical: canonical, hash: hash,
  zoomColumn: zoomColumn, zoomTable: zoomTable, VARIANTS: VARIANTS };
