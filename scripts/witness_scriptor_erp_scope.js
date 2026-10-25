#!/usr/bin/env node
// Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
// SPDX-License-Identifier: MIT
/**
 * witness_scriptor_erp_scope.js — EVIDENCE for the ERP team-scope decision (G9). Spec: prompts/TEAMWORK_FRAMEWORK.md §30. Read-only over build/erp/ad_full.db + build/scriptor/observed_team_tables.json.
 *   §W-ERPSCOPE-ROOTS (C1) · §W-ERPSCOPE-WINDOWS (C2) · §W-ERPSCOPE-OBSERVED (C3) · §W-ERPSCOPE-CORE (C4) · §W-ERPSCOPE-NARROW (C5) · §W-ERPSCOPE-ROLES (C6) · §W-ERPSCOPE-MUTANTS
 * Prints EVIDENCE, not a decision; an attempted table outside the scope is printed OPEN. Writes candidate_erp_scope_{ALL,PARENT}.json (NOT wired into any host).
 */
'use strict';
var path = require('path'), fs = require('fs'), Better = require('better-sqlite3');
var SDIR = path.join(__dirname, '..', 'build', 'scriptor'), SCOPE = require(path.join(SDIR, 'scope.js'));
var db = new Better(path.join(__dirname, '..', 'build', 'erp', 'ad_full.db'), { readonly: true });
var judged = 0, fails = 0, open = [];
function say(ok, label, detail) { judged++; if (!ok) fails++; console.log('   ' + (ok ? '🟢' : '🔴') + ' ' + label + (detail ? ' — ' + detail : '')); return ok; }
var OBS = JSON.parse(fs.readFileSync(path.join(SDIR, 'observed_team_tables.json'), 'utf8'));
var STATION = ['ad_sequence', 'ad_sequence_no', 'ad_recentitem', 'ad_session', 'ad_changelog'];
var CORE = ['C_Order', 'C_OrderLine', 'C_Invoice', 'C_InvoiceLine', 'C_Payment', 'C_AllocationHdr', 'C_AllocationLine', 'M_InOut', 'M_InOutLine', 'M_Requisition', 'M_Movement', 'M_MovementLine', 'M_Inventory', 'M_InventoryLine', 'M_Storage', 'M_StorageReservation', 'Fact_Acct', 'M_CostDetail', 'C_BPartner', 'M_Product'];

function run(opts, quiet) {
  var red = [], S2 = quiet ? function (ok) { return ok; } : say, H = quiet ? function () {} : console.log;
  function A(n, ok, l, d) { if (!ok) red.push(n); return S2(ok, l, d); }
  var E = SCOPE.buildEdges(db, {}), active = Object.keys(E.tableById).filter(function (k) { return E.tableById[k].act === 'Y'; }).map(Number), name = {};
  active.forEach(function (id) { name[id] = String(E.tableById[id].name).toLowerCase(); });
  var roles = db.prepare("SELECT ad_role_id AS id, name FROM ad_role WHERE isactive='Y'").all().filter(function (r) { return !(opts.dropRoots && opts.dropRoots.indexOf(r.id) >= 0); });   // dropRoots = MUTANT: roots computed without these roles
  var rootsByRole = {}, union = {};
  roles.forEach(function (r) { var q = SCOPE.rootsFor(db, r.id); if (q.windows > 0) { rootsByRole[r.id] = q; q.roots.forEach(function (t) { union[t] = 1; }); } });
  var R = Object.keys(union).map(Number);
  H('§W-ERPSCOPE-ROOTS');
  var sql = db.prepare("SELECT DISTINCT tb.ad_table_id AS t FROM ad_window_access wa JOIN ad_window w ON w.ad_window_id=wa.ad_window_id AND w.isactive='Y' JOIN ad_tab tb ON tb.ad_window_id=w.ad_window_id AND tb.isactive='Y' JOIN ad_table t ON t.ad_table_id=tb.ad_table_id AND t.isactive='Y' WHERE wa.isactive='Y'" + '').all().map(function (x) { return x.t; }).sort(function (a, b) { return a - b; });
  var js = R.slice().sort(function (a, b) { return a - b; }), onlyJs = js.filter(function (x) { return sql.indexOf(x) < 0; }), onlySql = sql.filter(function (x) { return js.indexOf(x) < 0; });
  A('C1', R.length > 0 && onlyJs.length === 0 && onlySql.length === 0, 'window-tab tables of all roles: scope.js roots == an independent SQL recomputation (' + R.length + ' tables)', onlyJs.length + onlySql.length ? 'DIFFER js-only=' + onlyJs.map(function (x) { return name[x] || x; }).join(',') + ' sql-only=' + onlySql.map(function (x) { return name[x]; }).join(',') : '0 differ');
  var variants = SCOPE.VARIANTS.filter(function (v) { return v.gate === false && !v.audit; }), SC = {};
  variants.forEach(function (v) { var c = SCOPE.closure(E, R, '  O', { follow: opts.weak ? 'PARENT' : v.follow, audit: v.audit, gate: false }); SC[v.follow] = c.set.reduce(function (m, id) { m[name[id]] = 1; return m; }, {}); });
  var reachOnly = {}, via = {};
  variants.forEach(function (v) { reachOnly[v.follow] = Object.assign({}, SC[v.follow]); via[v.follow] = Object.keys(OBS.out).filter(function (t) { return !SC[v.follow][t]; }); via[v.follow].forEach(function (t) { SC[v.follow][t] = 1; }); });   // + tables the real cycles SHARED that no window reaches (document-action side effects)
  if (opts.removeTable) variants.forEach(function (v) { delete SC[v.follow][opts.removeTable]; });
  var sizes = variants.map(function (v) { return v.follow + '=' + Object.keys(SC[v.follow]).length; }).join(' ');
  H('   ℹ closure sizes (union of ' + Object.keys(rootsByRole).length + ' roles, gate off, audit columns excluded): ' + sizes + ' · active tables ' + active.length);
  H('§W-ERPSCOPE-WINDOWS');
  var wins = db.prepare("SELECT DISTINCT w.ad_window_id AS id, w.name AS n FROM ad_window w JOIN ad_window_access wa ON wa.ad_window_id=w.ad_window_id AND wa.isactive='Y' WHERE w.isactive='Y'" + '').all(), allWins = db.prepare("SELECT COUNT(*) AS c FROM ad_window WHERE isactive='Y'").get().c;
  var bad = {}; variants.forEach(function (v) { bad[v.follow] = wins.filter(function (w) { return db.prepare("SELECT lower(t.tablename) AS t FROM ad_tab tb JOIN ad_table t ON t.ad_table_id=tb.ad_table_id WHERE tb.ad_window_id=? AND tb.isactive='Y' AND t.isactive='Y'").all(w.id).some(function (x) { return !SC[v.follow][x.t]; }); }); });
  variants.forEach(function (v) { A('C2', bad[v.follow].length === 0 && wins.length > 100, v.follow + ': X of N windows with every tab-table inside the scope = ' + (wins.length - bad[v.follow].length) + ' of ' + wins.length + ' windows some role can open (' + allWins + ' active windows in the dictionary)', bad[v.follow].length ? 'OUTSIDE: ' + bad[v.follow].slice(0, 6).map(function (w) { return w.n; }).join(' | ') : '0 windows lose a table'); });
  H('§W-ERPSCOPE-OBSERVED');
  var shared = Object.keys(OBS.out), dt = db.prepare("SELECT COUNT(*) AS n, COUNT(DISTINCT docbasetype) AS f FROM c_doctype WHERE isactive='Y'").get();
  variants.forEach(function (v) { var miss = shared.filter(function (t) { return !reachOnly[v.follow][t]; });
    H('   ℹ ' + v.follow + ': reachability ALONE covers ' + (shared.length - miss.length) + ' of the ' + shared.length + ' tables the real cycles shared (' + shared.join(',') + ')' + (miss.length ? ' · NOT reached by any window: ' + miss.join(',') + ' (written by a document action, not by a user in a window)' : ''));
    A('C3', shared.every(function (t) { return SC[v.follow][t]; }), v.follow + ': candidate scope (reachable + observed shared) contains every table the real cycles shared', 'added via observation: ' + (via[v.follow].join(',') || 'none')); });
  if (!quiet) open.push('document-action side effects: the recorded cycles are the sales-order Complete only; the dictionary has ' + dt.n + ' active document types in ' + dt.f + ' base families, so the side-effect tables of the other families are UNKNOWN until a doc-type sweep runs (X of N, AD-LAYER LAW 2)');
  H('§W-ERPSCOPE-CORE');
  variants.forEach(function (v) { var out = CORE.filter(function (t) { return !SC[v.follow][t.toLowerCase()]; }); H('   ℹ ' + v.follow + ': core trade-cycle sample inside ' + (CORE.length - out.length) + '/' + CORE.length + (out.length ? ' · outside: ' + out.join(',') : '')); });
  H('§W-ERPSCOPE-NARROW');
  var today = active.filter(function (id) { return STATION.indexOf(name[id]) < 0; });
  variants.forEach(function (v) { var dropped = today.filter(function (id) { return !SC[v.follow][name[id]]; }).map(function (id) { return name[id]; }), by = {};
    dropped.forEach(function (t) { var k = (t.match(/^[a-z]+_/) || [t])[0]; by[k] = (by[k] || 0) + 1; });
    by = Object.keys(by).sort(function (a, b) { return by[b] - by[a]; }).slice(0, 10).reduce(function (m, k) { m[k] = by[k]; return m; }, {});
    var views = dropped.filter(function (t) { return db.prepare("SELECT isview AS v FROM ad_table WHERE lower(tablename)=?").get(t).v === 'Y'; }).length;
    A('C5', today.length === 998 && dropped.length < today.length, v.follow + ': shared today ' + today.length + ' -> scope ' + (today.length - dropped.length) + ', would stop being shared: ' + dropped.length + ' (' + Math.round(100 * dropped.length / today.length) + '%)', 'of which database VIEWS (never hold records): ' + views + '; top prefixes: ' + JSON.stringify(by));
    if (!quiet) fs.writeFileSync(path.join(SDIR, 'candidate_erp_scope_' + v.follow + '.json'), JSON.stringify({ note: 'CANDIDATE, not wired (TEAMWORK_FRAMEWORK §30). Tables a role can reach (variant ' + v.follow + '), minus the 5 station-local.', tables: Object.keys(SC[v.follow]).filter(function (t) { return STATION.indexOf(t) < 0; }).sort() }, null, 1) + '\n'); });
  H('§W-ERPSCOPE-ROLES');
  Object.keys(rootsByRole).forEach(function (id) { var q = rootsByRole[id]; H('   ℹ role ' + id + ' ' + (roles.filter(function (r) { return String(r.id) === id; })[0] || {}).name + ': ' + q.windows + ' windows, ' + q.tabs + ' tabs, ' + q.roots.length + ' root tables'); });
  return red;
}
console.log('§ERPSCOPE_START evidence only (G9 is the owner\'s decision) · AD ad_full.db · observed cycles: ' + Object.keys(OBS.out).length + ' shared + ' + Object.keys(OBS.localonly).length + ' attempted-local tables');
run({}, false);
console.log('§W-ERPSCOPE-MUTANTS (each broken input must turn at least one arm red — the arms can fail)');
[['scope roots computed without the two Admin roles (windows they open lose tables)', { dropRoots: [102, 200001] }], ['c_order removed from the scope', { removeTable: 'c_order' }], ['m_storagereservation removed from the scope', { removeTable: 'm_storagereservation' }]].forEach(function (m) {
  var red = run(m[1], true); say(red.length > 0, m[0] + ' -> red arms: ' + (red.length ? Array.from(new Set(red)).join(', ') : 'NONE (survivor = hole)')); });
open.forEach(function (o) { console.log('   🟡 OPEN — ' + o); });
console.log('§ERPSCOPE_VERDICT ' + (fails ? 'FAIL' : 'EVIDENCE') + ' judged=' + judged + ' fails=' + fails + ' open=' + open.length + ' — a candidate scope, NOT a decision; adopting one is a data change gated by the every-window twin witnesses (§20 G9)');
process.exit(fails ? 1 : 0);
