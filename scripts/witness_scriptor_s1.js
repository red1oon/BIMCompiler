#!/usr/bin/env node
// Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
// SPDX-License-Identifier: MIT
/**
 * witness_scriptor_s1.js — Replication Scriptor S1 (flows). Spec: prompts/TEAMWORK_FRAMEWORK.md §16.15 (+ §16.0a doctrine FL-1..FL-5).
 * Real AD: build/erp/ad_full.db (read-only). Code under test: build/scriptor/scope.js (edge rules ER-1..ER-5) + flow.js.
 *
 * Each arm names the issue it proves or disproves; INCONCLUSIVE / VACUOUS / NO-OP are separate verdicts, never PASS.
 *   §W-FLOW-DECLARED   — every declared table/column exists in the AD (a typo is red).
 *   §W-FLOW-CLASSIFY   — known answers: product ref, quantity measure, description text, SalesRep->AD_User (zoom rename), ...
 *   §W-FLOW-REFS       — ER-1 and ER-2 edge sets equal an INDEPENDENT SQL recomputation.
 *   §W-FLOW-MINIMAL    — the flows carry no TEXT and fewer columns than the table; the all-columns control carries more.
 *   §W-FLOW-MANDATORY  — mandatory-uncarried is non-empty for the minimal flow and empty for the control that carries every mandatory column.
 *   §W-FLOW-BASE       — every REF target is inside the base requirement; role gating agrees with canView.
 *   §W-SCRIPTOR-DETERMINISM — same inputs -> same sha256; a changed flow -> a different one.
 *   §W-SCRIPTOR-MUTANTS    — each broken rule must turn at least one arm red; a survivor is printed as a hole.
 *
 * Run: node scripts/witness_scriptor_s1.js 2>&1 | tee build/scriptor/s1.log
 */
'use strict';
var path = require('path'), Better = require('better-sqlite3');
var SCOPE = require(path.join(__dirname, '..', 'build', 'scriptor', 'scope.js'));
var FLOW = require(path.join(__dirname, '..', 'build', 'scriptor', 'flow.js'));
var ACCESS = require(path.join(__dirname, '..', 'build', 'erp', 'ad_access.js'));
var db = new Better(path.join(__dirname, '..', 'build', 'erp', 'ad_full.db'), { readonly: true });

var ROLE = 103;                                                         // GardenWorld User (userlevel "  O") — the POS station's role in the test
var UL = db.prepare('SELECT userlevel AS ul FROM ad_role WHERE ad_role_id=?').get(ROLE).ul;
var judged = 0, fails = 0, inconclusive = [];
function verdict(ok, label, detail) { judged++; if (!ok) fails++; console.log('   ' + (ok ? '🟢' : '🔴') + ' ' + label + (detail ? ' — ' + detail : '')); return ok; }
function lc(x) { return String(x).toLowerCase(); }

// ---- flow declarations (the only hand input; §16.15) ----
var fs = require('fs'), COMPILE = require(path.join(__dirname, '..', 'build', 'scriptor', 'compile.js'));
var SDIR = path.join(__dirname, '..', 'build', 'scriptor');
var ROWS = JSON.parse(fs.readFileSync(path.join(SDIR, 'flows.json'), 'utf8'));       // the flows are DATA (§16.16), not code
var F1 = ROWS[0], F2 = ROWS[1];
var FD = { name: 'FD control-derived', role: 103, strategy: 100, dir: 'DOWN', table: 'M_MovementLine', carries: ['M_Product_ID', 'MovementQty'] };   // MovementQty is read-only in the Inventory Move tab
var F3 = { name: 'F3 control-all-columns', role: 103, strategy: 100, dir: 'UP', table: 'C_OrderLine', carries: '*', schedule: 'end-of-day', from: 'POS station', to: 'HQ' };
function mandatoryControl() {
  var t = db.prepare("SELECT ad_table_id AS id FROM ad_table WHERE lower(tablename)='c_orderline'").get().id;
  var names = db.prepare("SELECT columnname AS n FROM ad_column WHERE ad_table_id=? AND isactive='Y' AND (ismandatory='Y' OR iskey='Y')").all(t).map(function (x) { return x.n; });
  return { name: 'FC control-all-mandatory', role: 103, strategy: 100, dir: 'UP', table: 'C_OrderLine', carries: names, schedule: 'end-of-day', from: 'POS station', to: 'HQ' };
}

// ---- independent SQL recomputation of the edge sets (different code path from scope.js) ----
var WITH_VALUE_IDS = '18,200233,30,200235,200162,200163';
var RENAMED = Object.keys(SCOPE.zoomColumn ? { SalesRep_ID: 1, C_DocTypeTarget_ID: 1, Bill_BPartner_ID: 1, Bill_Location_ID: 1, BillTo_ID: 1, Account_ID: 1, C_LocFrom_ID: 1, C_LocTo_ID: 1, BP_Location_ID: 1, C_UOM_To_ID: 1, M_AttributeSetInstanceTo_ID: 1, M_LocatorTo_ID: 1, AD_OrgBP_ID: 1, AD_OrgTrx_ID: 1, AD_OrgTo_ID: 1 } : {});
function sqlEr1() {
  return db.prepare("SELECT c.ad_table_id||'|'||c.columnname||'|'||rt.ad_table_id AS k FROM ad_column c JOIN ad_table t ON t.ad_table_id=c.ad_table_id " +
    'JOIN ad_ref_table rt ON rt.ad_reference_id=c.ad_reference_value_id ' +
    "WHERE c.isactive='Y' AND t.isactive='Y' AND c.ad_reference_id IN (" + WITH_VALUE_IDS + ') AND c.ad_reference_value_id IS NOT NULL AND c.ad_reference_value_id<>0').all().map(function (x) { return x.k; }).sort();
}
function sqlEr2() {
  var ph = RENAMED.map(function () { return '?'; }).join(',');
  return db.prepare("SELECT c.ad_table_id||'|'||c.columnname||'|'||t2.ad_table_id AS k FROM ad_column c JOIN ad_table t ON t.ad_table_id=c.ad_table_id " +
    'JOIN ad_table t2 ON lower(t2.tablename)=lower(substr(c.columnname,1,length(c.columnname)-3)) ' +
    "WHERE c.isactive='Y' AND t.isactive='Y' AND t2.isactive='Y' " +
    'AND (c.ad_reference_id IN (19,200234) OR (c.ad_reference_id IN (' + WITH_VALUE_IDS + ') AND (c.ad_reference_value_id IS NULL OR c.ad_reference_value_id=0))) ' +
    "AND (c.columnname LIKE '%\\_ID' ESCAPE '\\' OR c.columnname LIKE '%\\_UU' ESCAPE '\\') AND c.columnname NOT IN (" + ph + ')').all(RENAMED).map(function (x) { return x.k; }).sort();
}
function sqlEr4() {
  return db.prepare("SELECT c.ad_table_id||'|'||c.columnname||'|'||t2.ad_table_id AS k FROM ad_column c JOIN ad_table t ON t.ad_table_id=c.ad_table_id " +
    "JOIN ad_table t2 ON lower(t2.tablename)=CASE c.ad_reference_id WHEN 21 THEN 'c_location' WHEN 25 THEN 'c_validcombination' WHEN 31 THEN 'm_locator' WHEN 35 THEN 'm_attributesetinstance' END " +
    "WHERE c.isactive='Y' AND t.isactive='Y' AND t2.isactive='Y' AND c.ad_reference_id IN (21,25,31,35)").all().map(function (x) { return x.k; }).sort();
}
function jsEdges(E, kind) {
  return E.edges.filter(function (e) { return e.kind === kind && (kind !== 'ER2' || RENAMED.indexOf(e.col) === -1); })
    .map(function (e) { return e.from + '|' + e.col + '|' + e.to; }).sort();
}
function diffSets(a, b) {
  var A = {}, B = {}; a.forEach(function (x) { A[x] = 1; }); b.forEach(function (x) { B[x] = 1; });
  return { onlyJs: a.filter(function (x) { return !B[x]; }), onlySql: b.filter(function (x) { return !A[x]; }) };
}

var KATS = [['C_OrderLine', 'M_Product_ID', 'REF', 'M_Product'], ['C_OrderLine', 'QtyEntered', 'MEASURE'], ['C_OrderLine', 'Description', 'TEXT'],
  ['C_Order', 'SalesRep_ID', 'REF', 'AD_User'], ['C_Order', 'C_DocTypeTarget_ID', 'REF', 'C_DocType'], ['C_Invoice', 'C_BPartner_ID', 'REF', 'C_BPartner'], ['M_MovementLine', 'M_Locator_ID', 'REF', 'M_Locator']];

// ---- all arms as one function so the mutants can re-run them against a broken rule ----
// returns { red: [arm names], notes: {...}, flows: {...}, E }
function runArms(opts, log) {
  var red = [], notes = {}, say = log ? console.log : function () {};
  var E = SCOPE.buildEdges(db, opts);
  var fc = mandatoryControl();
  var d = { F1: FLOW.deriveFlow(db, E, F1, opts), F2: FLOW.deriveFlow(db, E, F2, opts), F3: FLOW.deriveFlow(db, E, F3, opts), FC: FLOW.deriveFlow(db, E, fc, opts), FD: FLOW.deriveFlow(db, E, FD, opts), FU: FLOW.deriveFlow(db, E, { name: 'FU control-unlisted', role: 103, strategy: 100, dir: 'UP', table: 'M_StorageOnHand', carries: [] }, opts) };
  function arm(name, ok, detail) { if (!ok) red.push(name); if (log) verdict(ok, name, detail); }

  // DECLARED
  var miss = [].concat(d.F1.error || [], d.F2.error || [], d.F1.declaredMissing || [], d.F2.declaredMissing || []);
  arm('W-FLOW-DECLARED', miss.length === 0, miss.length ? 'missing: ' + miss.join(',') : 'F1 and F2 tables and ' + (d.F1.payload.length + d.F2.payload.length) + ' declared columns exist in the AD');

  // CLASSIFY (known answers)
  var kv = 0, kbad = [];
  KATS.forEach(function (k) {
    var tid = E.idByName[lc(k[0])]; if (tid === undefined) { kv++; return; }
    var col = FLOW.tableColumns(db, tid, opts).filter(function (c) { return lc(c.name) === lc(k[1]); })[0]; if (!col) { kv++; return; }
    var r = FLOW.classify(col, E, tid, opts), tn = r.target !== undefined ? E.tableById[r.target].name : undefined;
    if (r.cls !== k[2] || (k[3] && lc(tn) !== lc(k[3]))) kbad.push(k[0] + '.' + k[1] + ' got ' + r.cls + (tn ? '->' + tn : '') + ' want ' + k[2] + (k[3] ? '->' + k[3] : ''));
  });
  if (kv === KATS.length) { red.push('W-FLOW-CLASSIFY'); if (log) verdict(false, 'W-FLOW-CLASSIFY', 'VACUOUS: no known-answer column found in the AD'); }
  else arm('W-FLOW-CLASSIFY', kbad.length === 0, kbad.length ? kbad.join('; ') : (KATS.length - kv) + '/' + KATS.length + ' known answers match' + (kv ? ' (' + kv + ' absent from the AD)' : ''));

  // REFS (independent SQL)
  var s1 = sqlEr1(), j1 = jsEdges(E, 'ER1'), s2 = sqlEr2(), j2 = jsEdges(E, 'ER2');
  var s4 = sqlEr4(), j4 = jsEdges(E, 'ER4'), x4 = diffSets(j4, s4);
  var x1 = diffSets(j1, s1), x2 = diffSets(j2, s2), refsOk = !x1.onlyJs.length && !x1.onlySql.length && !x2.onlyJs.length && !x2.onlySql.length && !x4.onlyJs.length && !x4.onlySql.length;
  if (s1.length === 0 && s2.length === 0) { red.push('W-FLOW-REFS'); if (log) verdict(false, 'W-FLOW-REFS', 'VACUOUS: no reference columns in the AD'); }
  else arm('W-FLOW-REFS', refsOk, 'ER-1 js=' + j1.length + ' sql=' + s1.length + ' (js-only ' + x1.onlyJs.length + ', sql-only ' + x1.onlySql.length + '); ER-2 js=' + j2.length + ' sql=' + s2.length + ' (js-only ' + x2.onlyJs.length + ', sql-only ' + x2.onlySql.length + '); ER-4 js=' + j4.length + ' sql=' + s4.length + ' (js-only ' + x4.onlyJs.length + ', sql-only ' + x4.onlySql.length + ')');

  // MINIMAL
  var txt = function (f) { return (f.byClass && f.byClass.TEXT) || 0; };
  var min = d.F1.payloadColumns < d.F1.tableColumns && d.F2.payloadColumns < d.F2.tableColumns && txt(d.F1) === 0 && txt(d.F2) === 0 && d.F3.payloadColumns > d.F1.payloadColumns && FLOW.hash(d.F1) !== FLOW.hash(d.F3);
  arm('W-FLOW-MINIMAL', min, 'F1 ' + d.F1.payloadColumns + '/' + d.F1.tableColumns + ' cols, F2 ' + d.F2.payloadColumns + '/' + d.F2.tableColumns + ', TEXT carried ' + txt(d.F1) + '/' + txt(d.F2) + '; control F3 carries ' + d.F3.payloadColumns + ' (TEXT ' + txt(d.F3) + ')');

  // MANDATORY
  arm('W-FLOW-MANDATORY', d.F1.mandatoryUncarried.length > 0 && d.FC.mandatoryUncarried.length === 0, 'F1 leaves ' + d.F1.mandatoryUncarried.length + ' mandatory column(s) for the receiver to reconstruct; control FC leaves ' + d.FC.mandatoryUncarried.length);

  // BASE + GATE
  var ids = {}; [d.F1, d.F2].forEach(function (f) { f._targetIds.forEach(function (t) { ids[t] = 1; }); });
  var targetIds = Object.keys(ids).map(Number).sort(function (a, b) { return a - b; });
  var bc = FLOW.baseClosure(E, targetIds, UL, opts), bn = FLOW.baseClosure(E, targetIds, UL, { noGate: true });
  var inBase = targetIds.every(function (t) { return bn['ALL+nogate'] ? bn['ALL+nogate'].tables.indexOf(t) !== -1 : true; });
  var gateBad = 0;
  SCOPE.VARIANTS.forEach(function (v) { if (!v.gate) return; var r = bc[v.id];
    r.tables.forEach(function (t) { if (!ACCESS.canView(UL, E.tableById[t].al)) gateBad++; });
    r.blockedTables.forEach(function (t) { if (ACCESS.canView(UL, E.tableById[t].al)) gateBad++; }); });
  arm('W-FLOW-BASE', targetIds.length > 0 && inBase && gateBad === 0, 'REF targets ' + targetIds.length + ' all inside the base requirement: ' + inBase + '; role-gating disagrees with canView on ' + gateBad + ' table(s)');
  // NO-DERIVED (FL-6): the AD marks read-only fields as the system's own computation; none may be carried. Control: a row that carries one must be flagged.
  var vac = d.F1.fieldRows === 0 && d.F2.fieldRows === 0;
  if (vac) { red.push('W-FLOW-NO-DERIVED'); if (log) verdict(false, 'W-FLOW-NO-DERIVED', 'VACUOUS: no AD_Field rows for the flow tables'); }
  else arm('W-FLOW-NO-DERIVED', d.F1.derivedCarried.length === 0 && d.F2.derivedCarried.length === 0 && d.FD.derivedCarried.indexOf('MovementQty') !== -1,
    'F1 derived carried ' + d.F1.derivedCarried.length + ', F2 ' + d.F2.derivedCarried.length + '; control FD (declares MovementQty) flagged: ' + JSON.stringify(d.FD.derivedCarried));
  // STRATEGY: table-level type is read from AD_ReplicationTable (strategy 100), not repeated in the row. Control: a table the strategy does not list reads 'unlisted'.
  arm('W-FLOW-STRATEGY', d.F1.tableType !== 'unlisted' && d.F2.tableType !== 'unlisted' && d.FU.tableType === 'unlisted' && Object.keys(d.F2.baseTypes).every(function (k) { return d.F2.baseTypes[k]; }),
    'F1 ' + d.F1.table + '=' + d.F1.tableType + ', F2 ' + d.F2.table + '=' + d.F2.tableType + '; base types F1 ' + JSON.stringify(d.F1.baseTypes) + ' F2 ' + JSON.stringify(d.F2.baseTypes) + '; control ' + d.FU.table + '=' + d.FU.tableType);
  notes.base = bc; notes.baseNoGate = bn; notes.targetIds = targetIds;
  return { red: red, notes: notes, flows: d, E: E, fc: fc };
}

// ================= main =================
console.log('§S1_INPUT ad_full.db tables=' + db.prepare('SELECT count(*) n FROM ad_table').get().n + ' activeTables=' + db.prepare("SELECT count(*) n FROM ad_table WHERE isactive='Y'").get().n +
  ' columns=' + db.prepare('SELECT count(*) n FROM ad_column').get().n + ' inactiveColumns=' + db.prepare("SELECT count(*) n FROM ad_column WHERE isactive<>'Y'").get().n +
  ' roles=' + db.prepare('SELECT count(*) n FROM ad_role').get().n + ' stationRole=' + ROLE + '(userlevel "' + UL + '")');
console.log('§S1_ARMS baseline');
var base = runArms({}, true);
var E = base.E, F = base.flows;

// ---- the numbers S1 exists to produce ----
Object.keys(F).forEach(function (k) {
  var f = F[k];
  console.log('§S1_FLOW ' + f.name + ' dir=' + f.dir + ' table=' + f.table + ' schedule=' + f.schedule + ' tableCols=' + f.tableColumns + ' payloadCols=' + f.payloadColumns +
    ' (carried ' + f.payload.length + ' + implicit ' + f.implicit.length + ') byClass=' + JSON.stringify(f.byClass) + ' mandatoryUncarried=' + f.mandatoryUncarried.length);
  if (k === 'F1' || k === 'F2') {
    console.log('   payload: ' + f.payload.map(function (p) { return p.col + ':' + p.cls + (p.target ? '->' + p.target : '') + (p.why ? '(' + p.why + ')' : ''); }).join(', '));
    console.log('   implicit: ' + f.implicit.join(', ') + '   baseRequirement: ' + f.baseRequirement.join(', '));
    console.log('   mandatory-uncarried (receiver must reconstruct or default): ' + (f.mandatoryUncarried.join(', ') || '(none)'));
  }
});
var activeTables = db.prepare("SELECT count(*) n FROM ad_table WHERE isactive='Y'").get().n;
console.log('§S1_BASE REF targets of F1+F2 = ' + base.notes.targetIds.map(function (t) { return E.tableById[t].name; }).join(', '));
['PARENT', 'MAND', 'ALL'].forEach(function (f) {
  var row = [];
  [['', 'gated'], ['+audit', 'gated'], ['+nogate', 'nogate'], ['+audit+nogate', 'nogate']].forEach(function (s) {
    var id = f + s[0], r = (s[1] === 'gated' ? base.notes.base : base.notes.baseNoGate)[id] || base.notes.base[id];
    row.push(id + '=' + r.size + (r.blocked ? ' (blocked ' + r.blocked + ')' : ''));
  });
  console.log('§S1_BASE_CLOSURE ' + row.join('  '));
});
var ratioBase = base.notes.base['ALL'].size / activeTables;
console.log('§S1_NARROWING F1 payload/table=' + (F.F1.payloadColumns + '/' + F.F1.tableColumns) + ' (' + (100 * F.F1.payloadColumns / F.F1.tableColumns).toFixed(1) + '%)  F2=' + F.F2.payloadColumns + '/' + F.F2.tableColumns +
  ' (' + (100 * F.F2.payloadColumns / F.F2.tableColumns).toFixed(1) + '%)  base requirement (V-ALL, gated) tables ' + base.notes.base['ALL'].size + '/' + activeTables + ' (' + (100 * ratioBase).toFixed(1) + '%)  V-PARENT ' + base.notes.base['PARENT'].size + '  V-MAND ' + base.notes.base['MAND'].size);
// diagnostic maximum: the first-draft question, whole-role closure
var D = SCOPE.derive(db, ROLE);
console.log('§S1_DIAG whole-role closure role=' + D.role.id + ' "' + D.role.name + '" windows=' + D.windows + ' tabs=' + D.tabs + ' roots=' + D.roots.length +
  '  V-PARENT=' + D.variants['PARENT'].size + ' V-MAND=' + D.variants['MAND'].size + ' V-ALL(gated)=' + D.variants['ALL'].size + ' V-ALL(nogate)=' + D.variants['ALL+nogate'].size + ' of ' + activeTables + ' active tables');
console.log('§S1_UNRESOLVED global edges=' + D.globalEdges + ' unresolved=' + D.globalUnresolved + ' unbounded=' + D.globalUnbounded + '  inScope(V-ALL) unresolved=' + JSON.stringify(D.unresolvedInScope) + ' unbounded=' + JSON.stringify(D.unboundedInScope));

// ---- determinism ----
console.log('§W-SCRIPTOR-DETERMINISM');
var h1 = FLOW.hash(FLOW.deriveFlow(db, SCOPE.buildEdges(db, {}), F1, {})), h2 = FLOW.hash(FLOW.deriveFlow(db, SCOPE.buildEdges(db, {}), F1, {}));
var F1b = JSON.parse(JSON.stringify(F1)); F1b.carries = F1b.carries.slice(0, -1);
var h3 = FLOW.hash(FLOW.deriveFlow(db, SCOPE.buildEdges(db, {}), F1b, {}));
verdict(h1 === h2, 'same inputs -> same bytes', h1.slice(0, 16));
verdict(h1 !== h3, 'one carried column removed -> a different hash' + (h1 === h3 ? ' (NO-OP: the change did not register)' : ''), h3.slice(0, 16));

// ---- mutants ----
console.log('§W-SCRIPTOR-MUTANTS (each broken rule must turn at least one arm red)');
var inactive = db.prepare("SELECT count(*) n FROM ad_column WHERE isactive<>'Y'").get().n + db.prepare("SELECT count(*) n FROM ad_table WHERE isactive<>'Y'").get().n;
[['drop ER-1 (Table/Search with reference value)', { skipER1: true }], ['drop ER-2 (TableDir / name rule)', { skipER2: true }],
 ['drop ER-4 (typed lookups: Locator/Location/Account/PAttribute)', { skipER4: true }], ['ignore IsActive', { ignoreActive: true }], ['TEXT treated as MEASURE', { textAsMeasure: true }], ['ghost guard off (derived columns allowed)', { noGhostGuard: true }]].forEach(function (m) {
  var r = runArms(m[1], false);
  if (m[1].ignoreActive && inactive === 0) { inconclusive.push('mutant ignore-IsActive: the AD has no inactive rows to expose it'); console.log('   🟡 INCONCLUSIVE — ' + m[0] + ': the AD has no inactive rows'); return; }
  verdict(r.red.length > 0, m[0] + ' -> red arms: ' + (r.red.join(', ') || 'NONE (SURVIVOR = a hole)'));
});
// role-gating mutant is judged by W-FLOW-BASE's canView comparison on a run with gating switched off but compared as if on
(function () {
  var Eg = SCOPE.buildEdges(db, {}), ids = base.notes.targetIds, ng = FLOW.baseClosure(Eg, ids, UL, { noGate: true }), bad = 0;
  SCOPE.VARIANTS.forEach(function (v) { if (!v.gate) return; ng[v.id].tables.forEach(function (t) { if (!ACCESS.canView(UL, Eg.tableById[t].al)) bad++; }); });
  verdict(bad > 0, 'role gating skipped -> tables the role cannot view appear in the base: ' + bad + (bad === 0 ? ' (SURVIVOR for this role: gating changed nothing here)' : ''));
})();

// ---- carried references that the AD rules could not resolve make the base requirement INCOMPLETE ----
var unres = [];
[F.F1, F.F2].forEach(function (f) { f.payload.forEach(function (p) { if (p.cls === 'REF?') unres.push(f.name + ':' + p.col + '(' + p.why + ')'); }); });
if (unres.length) { inconclusive.push('base requirement incomplete: ' + unres.length + ' carried reference(s) unresolved: ' + unres.join(', ')); console.log('   🟡 INCONCLUSIVE — W-FLOW-BASE: ' + unres.length + ' carried reference(s) unresolved: ' + unres.join(', ')); }
else console.log('   🟢 every reference carried by F1 and F2 resolved to a table (nothing hidden behind W-FLOW-BASE)');

// ---- W-FLOW-ZERO-CODE (§16.16): add flows BY ROWS ONLY for tables the compiler was never written for ----
console.log('§W-FLOW-ZERO-CODE');
var CODE = ['scope.js', 'flow.js', 'compile.js'].map(function (f) { return path.join(SDIR, f); });
var codeHash = function () { return CODE.map(function (f) { return require('crypto').createHash('sha256').update(fs.readFileSync(f)).digest('hex').slice(0, 12); }).join('.'); };
var h0 = codeHash(), EXTRA = JSON.parse(fs.readFileSync(path.join(SDIR, 'flows_extra.json'), 'utf8'));
var codeText = CODE.map(function (f) { return fs.readFileSync(f, 'utf8').toLowerCase(); }).join('\n');
var named = EXTRA.map(function (r) { return r.table; }).concat(ROWS.map(function (r) { return r.table; })).filter(Boolean).filter(function (t) { return codeText.indexOf(t.toLowerCase()) !== -1; });
verdict(named.length === 0, '(1) no table used by any flow row is named in the compiler code', named.length ? 'named in code: ' + named.join(',') : EXTRA.length + ' extra + ' + ROWS.length + ' declared tables, 0 hits in ' + CODE.length + ' code files');
var A = COMPILE.compile(db, ROWS), AB = COMPILE.compile(db, ROWS.concat(EXTRA));
var okRows = AB.plan.slice(ROWS.length).filter(function (f) { return !f.error && f.declaredMissing.length === 0 && Array.isArray(f.derivedCarried) && f.tableType && f.payloadColumns > 0; });
verdict(okRows.length === EXTRA.length, '(2) every new row compiles with G1-G6 evaluated, no error', okRows.length + '/' + EXTRA.length + ' flows: ' + AB.plan.slice(ROWS.length).map(function (f) { return f.table + '[' + f.tableType + '] ' + f.payloadColumns + '/' + f.tableColumns + 'cols'; }).join('; '));
verdict(codeHash() === h0, '(3) compiler code hash identical before and after the rows were added', h0);
var bad = COMPILE.compile(db, [{ name: 'typo', role: 103, strategy: 100, dir: 'UP', table: 'C_Payment', carries: ['Amount_Typo_X'] }]).plan[0];
verdict(bad.declaredMissing.length === 1, '(4) a deliberately wrong row turns red (the test can fail)', 'declaredMissing=' + JSON.stringify(bad.declaredMissing));
verdict(A.hash !== AB.hash, '(5) adding the rows changes the plan (not a NO-OP)', A.hash.slice(0, 12) + ' -> ' + AB.hash.slice(0, 12));
var loc = function (f) { return fs.readFileSync(f, 'utf8').split('\n').filter(function (l) { var t = l.trim(); return t && t.indexOf('//') !== 0; }).length; };
var locs = CODE.map(function (f) { return path.basename(f) + '=' + loc(f); }), locSum = CODE.reduce(function (n, f) { return n + loc(f); }, 0);
console.log('§S1_ZERO_CODE_NUMBERS generic code (non-blank, non-comment lines): ' + locs.join(' ') + ' total=' + locSum + '  rows: declared=' + ROWS.length + ' extra=' + EXTRA.length + ' (one JSON line each; the minimal declared flows carry ' + F1.carries.length + ' and ' + F2.carries.length + ' column names)');
var P = COMPILE.compile(db, [{ name: 'cand', role: 103, strategy: 100, dir: 'UP', table: 'C_OrderLine', schedule: 'end-of-day' }]).plan[0];
console.log('§S1_CANDIDATES the AD alone proposes ' + P.payload.length + ' carried columns for C_OrderLine (human-declared F1 carries ' + F1.carries.length + '); extra rows propose ' + AB.plan.slice(ROWS.length).map(function (f) { return f.table + '=' + f.payload.length + '/' + f.tableColumns; }).join(', ') + ' — proposals are starting points, not plans');
inconclusive.push('zero-code flows X1-X5 carry PROPOSED columns (AD-chosen, over-wide): a human must trim them before they are plans');
console.log('   🟡 INCONCLUSIVE — the X flows are proposals: ' + AB.plan.slice(ROWS.length).reduce(function (n, f) { return n + f.payload.length; }, 0) + ' columns proposed across ' + EXTRA.length + ' flows; the compiler checks them, the business trims them');

// ---- what S1 cannot judge ----
console.log('§S1_ROWLEVEL INCONCLUSIVE — value-level and row-level closure need business data; the AD holds none');
inconclusive.push('row/value-level closure (no business data in the AD)');
var ok = fails === 0;
console.log('§S1_VERDICT ' + (ok ? 'PASS' : 'FAIL') + ' judged=' + judged + ' fails=' + fails + ' inconclusive=' + inconclusive.length + (inconclusive.length ? ' [' + inconclusive.join('; ') + ']' : ''));
process.exit(ok ? 0 : 1);
