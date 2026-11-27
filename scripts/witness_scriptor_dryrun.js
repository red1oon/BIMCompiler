#!/usr/bin/env node
// Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
// SPDX-License-Identifier: MIT
/**
 * witness_scriptor_dryrun.js — Replication engine step 4: COMPILE-ONLY DRY RUN. Spec: prompts/TEAMWORK_FRAMEWORK.md §22.7.
 * Hand-written rows (build/scriptor/flows_modeller.json, flows_erp.json) are compiled and DIFFED against what the pinned adapters hard-code.
 * The adapters are read with `git show 4e95b393:<path>` in ~/bim-ootb (READ-ONLY; no checkout, no edit). The diff is the finding.
 *   §W-DRY-MODELLER (D1-D6)   §W-DRY-ERP (D7-D8)   §W-DRY-MUTANTS (D9)
 * Run: node scripts/witness_scriptor_dryrun.js 2>&1 | tee build/scriptor/dryrun.log
 */
'use strict';
var path = require('path'), fs = require('fs'), os = require('os'), cp = require('child_process'), Better = require('better-sqlite3');
var SDIR = path.join(__dirname, '..', 'build', 'scriptor'), PIN = '4e95b393', OOTB = path.join(os.homedir(), 'bim-ootb');
var COMPILE = require(path.join(SDIR, 'compile.js'));
var db = new Better(path.join(__dirname, '..', 'build', 'erp', 'ad_full.db'), { readonly: true });
var judged = 0, fails = 0, inconclusive = [];
function say(ok, label, detail) { judged++; if (!ok) fails++; console.log('   ' + (ok ? '🟢' : '🔴') + ' ' + label + (detail ? ' — ' + detail : '')); return ok; }
function clone(o) { return JSON.parse(JSON.stringify(o)); }
function show(p) { var r = cp.spawnSync('git', ['-C', OOTB, 'show', PIN + ':' + p], { encoding: 'utf8', maxBuffer: 1 << 26 }); if (r.status !== 0) throw new Error('git show ' + p + ': ' + r.stderr); return r.stdout; }
function set(a) { return Array.from(new Set(a)).sort(); }
function diff(a, b) { return { onlyRows: a.filter(function (x) { return b.indexOf(x) < 0; }), onlyAdapter: b.filter(function (x) { return a.indexOf(x) < 0; }) }; }
function fmt(d) { return 'rows-only=' + JSON.stringify(d.onlyRows) + ' adapter-only=' + JSON.stringify(d.onlyAdapter); }

// ---- extraction from the pinned adapters (regex over source; each result must be non-empty or the run is INCONCLUSIVE) ----
var MOD = show('modeller/team_sync.js'), ERP = show('erp/team_sync.js');
var CLASS = {}; /var CLASS = \{([^}]*)\}/.exec(MOD)[1].replace(/(GEOM_[A-Z_]+):\s*'(\w+)'/g, function (m, k, v) { CLASS[k] = v; return m; });
var tr = MOD.slice(MOD.indexOf('function translate('), MOD.indexOf('// ═══ IN'));
var createFields = set((/var f = \{([^}]*)\}/.exec(tr)[1].match(/\b\w+(?=:)/g) || []).concat((tr.match(/\bf\.(\w+) = /g) || []).map(function (s) { return s.replace(/^f\.| = $/g, ''); })));
var AXES = /var AX = \[([^\]]*)\]/.exec(MOD)[1].match(/'(\w)'/g).map(function (s) { return s.replace(/'/g, ''); });
var moveCols = /ch\['pos_' \+ a\]/.test(tr) ? AXES.map(function (a) { return 'pos_' + a; }) : [];
var allOps = set((show('modeller/bonsai_kernel_worker.js') + show('modeller/bonsai_kernel.js')).match(/GEOM_[A-Z_]+/g) || []);
var STATION_LOCAL = set((/var STATION_LOCAL = \{([^}]*)\}/.exec(ERP)[1].match(/\b\w+(?=:)/g) || []));
console.log('§DRY_START pinned bim-ootb ' + PIN + ' (git show, read-only) · extracted: CLASS=' + Object.keys(CLASS).length + ' createFields=' + createFields.length + ' moveCols=' + moveCols.length + ' geomOpNames(N)=' + allOps.length + ' STATION_LOCAL=' + STATION_LOCAL.length);
if (!Object.keys(CLASS).length || !createFields.length || !moveCols.length || !allOps.length || !STATION_LOCAL.length) { console.log('§DRY_VERDICT INCONCLUSIVE — an extraction came back empty (the adapter source changed shape)'); process.exit(2); }

function modeller(rows) {
  var plan = COMPILE.compile(db, rows, {}), f = plan.plan.filter(function (x) { return x.table === 'bim_element'; })[0];
  var g = f && !f.error ? f.payload.filter(function (p) { return p.col === 'geom_op'; })[0] : null;
  var cols = f && !f.error ? f.payload.map(function (p) { return p.col; }).concat(f.implicit || []) : [];
  return { plan: plan, f: f, values: g && g.values ? g.values.slice().sort() : [], cols: set(cols.map(function (c) { return c.toLowerCase(); })), moveCols: set(cols.filter(function (c) { return /^pos_[xyz]$/.test(c); })) };
}
function erp(rows) {
  var plan = COMPILE.compile(db, rows, {}), L = plan.plan.filter(function (x) { return x.treatment === 'LOCAL'; });
  return { plan: plan, local: set(L.map(function (x) { return x.table.toLowerCase(); })), flows: L };
}
function arms(MROWS, EROWS, adapterClass, quiet) {
  var red = [], say2 = quiet ? function (ok, l, d) { return ok; } : say;
  function A(name, ok, l, d) { if (!ok) red.push(name); return say2(ok, l, d); }
  var M = modeller(MROWS), createsA = set(Object.keys(adapterClass).filter(function (k) { return adapterClass[k] === 'create'; }));
  if (!quiet) console.log('§W-DRY-MODELLER');
  A('D1', !!M.f && !M.f.error && M.plan.virtualErrors.length === 0 && (M.f.treatmentErrors || []).length === 0, 'D1 the Modeller rows compile: 1 virtual table + 1 FACT row, 0 errors', M.f ? 'error=' + M.f.error + ' virtualErrors=' + M.plan.virtualErrors.length + ' treatmentErrors=' + JSON.stringify(M.f.treatmentErrors) + ' tableType=' + M.f.tableType : 'no flow');
  A('D2', M.values.length > 0 && JSON.stringify(M.values) === JSON.stringify(createsA), 'D2 the geom_op list values equal the adapter\'s CLASS create keys (the 6 creates are VALUES, not rows)', fmt(diff(M.values, createsA)) + ' (' + M.values.length + ' vs ' + createsA.length + ')');
  var moveA = set(Object.keys(adapterClass).filter(function (k) { return adapterClass[k] === 'move'; }));
  A('D3', JSON.stringify(M.moveCols) === JSON.stringify(moveCols), 'D3 the carried measure columns pos_x|y|z equal the columns the move writes (the 7th op type is a WRITE to these, not a row)', fmt(diff(M.moveCols, moveCols)) + ' · adapter move types=' + JSON.stringify(moveA));
  var identity = MROWS.length ? (MROWS[0].columns.filter(function (c) { return c.cls === 'KEY'; })[0] || {}).name : null;   // the record's identity rides in the envelope target.uu, not in the written fields
  var d4 = diff(M.cols.filter(function (c) { return c !== identity; }), createFields);
  A('D4', d4.onlyRows.length === 0 && d4.onlyAdapter.length === 0, 'D4 the create field set written by translate equals the row\'s payload + implicit columns (identity excluded: it is the envelope target)', fmt(d4));
  var sharedByRows = M.values.concat(M.moveCols.length ? moveA : []).sort();
  A('D5', JSON.stringify(sharedByRows) === JSON.stringify(set(Object.keys(adapterClass))), 'D5 shared-by-rows (list values + the move) equals Object.keys(CLASS)', sharedByRows.length + ' vs ' + Object.keys(adapterClass).length);
  var mentioned = {}; M.values.concat(moveA).forEach(function (v) { mentioned[v] = 1; });
  var localOnly = allOps.filter(function (o) { return !mentioned[o]; });
  A('D6', allOps.length > Object.keys(adapterClass).length && Object.keys(adapterClass).every(function (k) { return allOps.indexOf(k) >= 0; }) && localOnly.length === allOps.length - Object.keys(adapterClass).length, 'D6 shared (' + Object.keys(adapterClass).length + ') is inside N=' + allOps.length + '; local-only = the ' + localOnly.length + ' names no row mentions (undeclared = local)', 'local-only: ' + localOnly.join(','));
  if (!quiet) console.log('§W-DRY-ERP');
  var E = erp(EROWS);
  A('D7', JSON.stringify(E.local) === JSON.stringify(STATION_LOCAL) && E.flows.every(function (f) { return !(f.treatmentErrors || []).length && !f.error; }), 'D7 the 5 declared-Local rows equal the adapter\'s STATION_LOCAL', fmt(diff(E.local, STATION_LOCAL)) + ' · errors=' + E.flows.reduce(function (n, f) { return n + (f.treatmentErrors || []).length + (f.error ? 1 : 0); }, 0));
  return { red: red, M: M, E: E, localOnly: localOnly };
}

var MROWS = JSON.parse(fs.readFileSync(path.join(SDIR, 'flows_modeller.json'), 'utf8')), EROWS = JSON.parse(fs.readFileSync(path.join(SDIR, 'flows_erp.json'), 'utf8'));
var main = arms(MROWS, EROWS, CLASS, false);

// ---- D7b / D8: the ERP table scope at scale ----
var tid = {}; db.prepare("SELECT ad_table_id AS id, lower(tablename) AS n FROM ad_table WHERE isactive='Y'").all().forEach(function (t) { tid[t.n] = t.id; });
var active = Object.keys(tid).length;
var typ = db.prepare("SELECT rt.replicationtype AS r, COUNT(*) AS c FROM ad_replicationtable rt JOIN ad_table t ON t.ad_table_id=rt.ad_table_id WHERE rt.ad_replicationstrategy_id=100 AND rt.isactive='Y' AND t.isactive='Y' GROUP BY rt.replicationtype").all(), T = {};
typ.forEach(function (x) { T[x.r] = x.c; });
var listed = (T.M || 0) + (T.R || 0) + (T.L || 0) + (T.B || 0), unlisted = active - listed;
var typeOf = {}; db.prepare("SELECT lower(t.tablename) AS n, rt.replicationtype AS r FROM ad_replicationtable rt JOIN ad_table t ON t.ad_table_id=rt.ad_table_id WHERE rt.ad_replicationstrategy_id=100 AND rt.isactive='Y' AND t.isactive='Y'").all().forEach(function (x) { typeOf[x.n] = x.r; });
console.log('   ℹ strategy 100 typing re-measured: active tables=' + active + ' M=' + (T.M || 0) + ' R=' + (T.R || 0) + ' L=' + (T.L || 0) + ' B=' + (T.B || 0) + ' unlisted=' + unlisted + ' (§20 estimate: 47 / 188 / 217 / 551 of 1,003)');
var stTypes = STATION_LOCAL.map(function (t) { return typeOf[t] || 'unlisted'; });
say(stTypes.filter(function (x) { return x === 'L'; }).length === 4 && stTypes.filter(function (x) { return x === 'unlisted'; }).length === 1, 'D7b prediction P3: 4 of the 5 STATION_LOCAL tables are typed L by strategy 100, 1 unlisted — ' + STATION_LOCAL.map(function (t) { return t + '=' + (typeOf[t] || 'unlisted'); }).join(' '));
var mergeNames = Object.keys(typeOf).filter(function (n) { return typeOf[n] === 'M'; }).sort();
var mergeRows = mergeNames.map(function (n, i) { var t = db.prepare('SELECT tablename FROM ad_table WHERE ad_table_id=?').get(tid[n]).tablename; return { name: 'G' + (i + 1) + ' ' + n, treatment: 'FACT', role: 103, strategy: 100, dir: 'BOTH', audience: 'space', table: t, group: 'record', schedule: 'on-change' }; });
var t0 = Date.now(), big = COMPILE.compile(db, mergeRows, {}), ms = Date.now() - t0;
var errs = big.plan.filter(function (f) { return f.error || (f.treatmentErrors || []).length; });
say(mergeRows.length > 0 && errs.length === 0, 'D8a one FACT/BOTH/space row per strategy-100 Merge table compiles at scale', mergeRows.length + ' rows, ' + errs.length + ' errors, ' + ms + ' ms, plan ' + big.hash.slice(0, 12));
var sharedToday = active - STATION_LOCAL.filter(function (t) { return tid[t] !== undefined; }).length, inMerge = mergeNames.length;
console.log('   ℹ D8b shared-by-default today = ' + sharedToday + ' of ' + active + ' active tables (all but STATION_LOCAL) · shared by default-deny with the Merge rows = ' + inMerge + ' · tables that would STOP being shared = ' + (sharedToday - inMerge) + ' (' + Math.round(100 * (sharedToday - inMerge) / sharedToday) + '%)');
var CORE = ['C_Order', 'C_OrderLine', 'C_Invoice', 'C_InvoiceLine', 'C_Payment', 'C_AllocationHdr', 'C_AllocationLine', 'M_InOut', 'M_InOutLine', 'M_Requisition', 'M_Movement', 'M_MovementLine', 'M_Inventory', 'M_InventoryLine', 'M_Storage', 'M_StorageReservation', 'Fact_Acct', 'M_CostDetail', 'C_BPartner', 'M_Product'];
var coreIn = CORE.filter(function (n) { return typeOf[n.toLowerCase()] === 'M'; }), coreOut = CORE.filter(function (n) { return typeOf[n.toLowerCase()] !== 'M'; });
console.log('   ℹ D8c core trade-cycle SAMPLE (a named list from CLAUDE.md AD-LAYER LAW 6: orders, purchasing, inventory, invoices, payments, posting, costing — not a decision): in the Merge set ' + coreIn.length + '/' + CORE.length + ' [' + coreIn.join(',') + '] · NOT in it: [' + coreOut.map(function (n) { return n + '=' + (typeOf[n.toLowerCase()] || 'unlisted'); }).join(',') + ']');
if (coreOut.length) inconclusive.push('G9 OPEN: ' + coreOut.length + ' of ' + CORE.length + ' core trade-cycle sample tables are outside strategy-100 Merge — default-deny with that strategy would stop sharing them; needs a team-ERP strategy + the every-window twin check (§20 G9)');

console.log('§W-DRY-MUTANTS (D9: each broken input must turn at least one arm red)');
function mut(label, fn) { var m = clone(MROWS), e = clone(EROWS), cl = clone(CLASS); fn(m, e, cl); var red = arms(m, e, cl, true).red; say(red.length > 0, label + ' -> red arms: ' + (red.length ? set(red).join(', ') : 'NONE (survivor = hole)')); }
mut('a column dropped from the Modeller rows (pos_z)', function (m) { m[0].columns = m[0].columns.filter(function (c) { return c.name !== 'pos_z'; }); m[1].carries = m[1].carries.filter(function (c) { return c !== 'pos_z'; }); });
mut('a create value added to the list', function (m) { m[0].columns[1].values.push('GEOM_ROTATE'); });
mut('a LOCAL row dropped', function (m, e) { e.pop(); });
mut('the adapter gains a shared op type (simulated)', function (m, e, cl) { cl.GEOM_ROTATE = 'create'; });
var verd = fails ? 'FAIL' : 'PASS';
inconclusive.forEach(function (x) { console.log('   🟡 OPEN — ' + x); });
console.log('§DRY_VERDICT ' + verd + ' judged=' + judged + ' fails=' + fails + ' open=' + inconclusive.length + ' (hand-written rows vs pinned adapter ' + PIN + '; no adapter file touched)');
process.exit(fails ? 1 : 0);
