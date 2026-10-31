#!/usr/bin/env node
// Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
// SPDX-License-Identifier: MIT
// ⚠ DO NOT REMOVE — Scope: W-UPS-E2, prompts/TEAMWORK_FRAMEWORK.md §38.5 (FL-8 E2). READ THE LOG after every run — the exit code is not evidence.
/*
 * Issue it proves or disproves: the SQLite twin offers a record's DocActions straight from getValidActions; legacy iDempiere then filters them
 * through the role's Document Action Access (WDocActionPanel.java:185-205 -> MRole.checkActionAccess MRole.java:2685-2778). So (E2a) a legacy role
 * whose access lacks Complete still sees Complete here, and (E2b) a station device under the in-log executor map (FL-8 E3) is offered a Complete
 * that every device will refuse (not-executor).
 * Real code: build/erp/ad_access.js (the MRole port; canonical copy, byte-identical to bim-ootb erp/ad_access.js) + bim-ootb erp/ad_docfsm.js
 * over a scratch copy of the SHIPPED erp/ad_seed.db + its self-heal patch (scripts/bridge/ad_shipped_fixture.js). No browser.
 * Usage: node scripts/witness_ups_docaction_access.js [bim-ootb dir; default ~/bim-ootb, checked equal to origin/main for the files it reads]
 *        WITNESS_ACCESS=<path to an ad_access.js>   (mutant runs)
 * Log: build/scriptor/witness_ups_docaction_access.log
 */
'use strict';
var fs = require('fs'), path = require('path'), os = require('os'), cp = require('child_process');
var ROOT = path.join(__dirname, '..'), LOG = path.join(ROOT, 'build', 'scriptor', 'witness_ups_docaction_access.log');
var OOTB = process.argv[2] || path.join(os.homedir(), 'bim-ootb');
var ACCESS = process.env.WITNESS_ACCESS || path.join(ROOT, 'build', 'erp', 'ad_access.js');
var IS_MUTANT = !!process.env.WITNESS_ACCESS;
var lines = []; function log(s) { lines.push(s); console.log(s); }
var judged = 0, fails = 0, inconclusive = 0, red = [];
function arm(id, ok, what, detail) { judged++; if (!ok) { fails++; red.push(id); } log('   ' + (ok ? '🟢' : '🔴') + ' ' + id + ' ' + what + (detail ? ' — ' + detail : '')); }

var READS = ['erp/ad_seed.db', 'erp/patches/ad_seed.db.sql', 'erp/ad_docfsm.js', 'erp/ad_callout.js', 'erp/callouts/sqlfn.js'];
if (!process.argv[2]) {
  var d = cp.spawnSync('git', ['-C', OOTB, 'diff', '--quiet', 'origin/main', '--'].concat(READS));
  log('§E2_READER ' + OOTB + ' vs origin/main for ' + READS.length + ' files: ' + (d.status === 0 ? 'identical' : 'DIFFERS (fetch + ff-merge ~/bim-ootb first)'));
  if (d.status !== 0) { log('§E2_VERDICT INCONCLUSIVE reader differs from origin/main'); fs.writeFileSync(LOG, lines.join('\n') + '\n'); process.exit(2); }
}
var AA = require(ACCESS), FSM = require(path.join(OOTB, 'erp/ad_docfsm.js'));
var FX = require('./bridge/ad_shipped_fixture.js').loadShipped(OOTB, log), db = FX.db;
var hasFn = typeof AA.RoleContext.prototype.checkActionAccess === 'function';
log('§E2_START access=' + path.relative(ROOT, ACCESS) + ' checkActionAccess=' + (hasFn ? 'present' : 'ABSENT'));
// the function under test; ABSENT = what the host does today (offers getValidActions as is)
function check(rc, client, dt, opts) { return hasFn ? rc.checkActionAccess(client, dt, opts) : opts.slice(); }
function eq(a, b) { return a.join(',') === b.join(','); }

var CLIENT = 11, ROLES = [102, 103, 200001];
var STATUSES = ['NA', 'DR', 'IP', 'IN', 'AP', 'CO', 'WP', 'WC', 'CL', 'VO', 'RE'];
var TABLES = [259].concat(Object.keys(FSM.DOC_FAMILY).map(Number));
var doctypes = db.prepare('SELECT c_doctype_id AS id, name, docbasetype AS dbt FROM c_doctype WHERE ad_client_id=? ORDER BY c_doctype_id').all(CLIENT);
var accessRows = db.prepare('SELECT COUNT(*) AS n FROM ad_document_action_access').get().n;
log('§E2_DENOMINATOR tables=' + TABLES.length + ' (C_Order + DOC_FAMILY) doctypes(client ' + CLIENT + ')=' + doctypes.length + ' roles=' + ROLES.join('/') + ' statuses=' + STATUSES.length + ' access_rows=' + accessRows);
function legalOf(t, s, proc, so, dt) {
  var rec = { docStatus: s, processing: proc, isSOTrx: so, doctypeId: dt, periodOpen: true, isBackDateTrxAllowed: true };
  try { return t === 259 ? FSM.legalActionsOrder(db, rec) : FSM.legalActionsFor(db, t, rec); } catch (e) { return null; }
}
var rc = {}; ROLES.forEach(function (r) { rc[r] = AA.buildRole(db, r); });

// ── A1 zero impact: the seed grants every value to every role, so checked == legal everywhere ──
log('\n── A1 zero impact on the shipped seed (every role has all 14 values per doctype) ──');
var n1 = 0, diff1 = [];
TABLES.forEach(function (t) { STATUSES.forEach(function (s) { ['N', 'Y'].forEach(function (proc) { ['Y', 'N'].forEach(function (so) {
  doctypes.forEach(function (dt) { var L = legalOf(t, s, proc, so, dt.id); if (!L || !L.length) return;
    ROLES.forEach(function (r) { n1++; var got = check(rc[r], CLIENT, dt.id, L); if (!eq(got, L) && diff1.length < 5) diff1.push(t + '/' + s + '/' + dt.id + '/' + r + ' ' + L + '→' + got); }); }); }); }); }); });
arm('A1', n1 > 0 && diff1.length === 0, 'checked list == getValidActions list for every (table, status, processing, IsSOTrx, doctype, role)', 'judged=' + n1 + ' differ=' + diff1.length + (diff1.length ? ' e.g. ' + diff1.join(' | ') : ''));
if (n1 === 0) { inconclusive++; log('   §D0_VACUOUS A1 judged nothing'); }

// a scratch edit, undone after each arm (the copy is the fixture's own scratch file; the shipped seed is never written)
function scratch(fn) { db.exec('SAVEPOINT e2'); try { return fn(); } finally { db.exec('ROLLBACK TO e2'); db.exec('RELEASE e2'); } }
var SO = db.prepare("SELECT c_doctype_id AS id FROM c_doctype WHERE ad_client_id=? AND docbasetype='SOO' AND docsubtypeso='SO'").get(CLIENT);
var CO_RL = db.prepare("SELECT ad_ref_list_id AS id FROM ad_ref_list WHERE ad_reference_id=135 AND value='CO'").get();
var DR = ['CO', 'PR', 'VO'];
log('\n── A2 removal (Standard Order doctype ' + (SO && SO.id) + ', CO = ad_ref_list ' + (CO_RL && CO_RL.id) + ') ──');
if (!SO || !CO_RL) { inconclusive++; log('   INCONCLUSIVE A2: no Standard Order doctype or no CO ref-list row in the seed'); }
else {
  scratch(function () {
    db.prepare("UPDATE ad_document_action_access SET isactive='N' WHERE ad_role_id=103 AND c_doctype_id=? AND ad_ref_list_id=?").run(SO.id, CO_RL.id);
    var g103 = check(AA.buildRole(db, 103), CLIENT, SO.id, DR), g102 = check(AA.buildRole(db, 102), CLIENT, SO.id, DR);
    arm('A2a', eq(g103, ['PR', 'VO']), "IsActive='N' on (role 103, Standard Order, CO) → 103 is not offered CO", 'got [' + g103 + ']');
    arm('A2b', eq(g102, DR), 'role 102 unchanged', 'got [' + g102 + ']');
  });
  scratch(function () {
    db.prepare('DELETE FROM ad_document_action_access WHERE ad_role_id=103 AND c_doctype_id=? AND ad_ref_list_id=?').run(SO.id, CO_RL.id);
    var g = check(AA.buildRole(db, 103), CLIENT, SO.id, DR);
    arm('A2c', eq(g, ['PR', 'VO']), 'no row for (103, Standard Order, CO) → CO is not offered (legacy starts from an empty list)', 'got [' + g + ']');
  });
  scratch(function () {
    var other = db.prepare("SELECT c_doctype_id AS id FROM c_doctype WHERE ad_client_id=? AND docbasetype='SOO' AND c_doctype_id<>?").get(CLIENT, SO.id);
    db.prepare("UPDATE ad_document_action_access SET isactive='N' WHERE ad_role_id=103 AND c_doctype_id=? AND ad_ref_list_id=?").run(SO.id, CO_RL.id);
    var g = other ? check(AA.buildRole(db, 103), CLIENT, other.id, DR) : null;
    arm('A2d', !!g && eq(g, DR), 'the removal is per doctype: another SOO doctype (' + (other && other.id) + ') still offers CO to 103', 'got [' + g + ']');
  });
}

// ── A3 included role (AD_Role_Included: absent from the seed file, created by its self-heal patch; created here only if missing) ──
log('\n── A3 included role (MRole.getIncludedRoles(true) :2825-2850; ad_role_included ' + (db.prepare("SELECT 1 AS x FROM sqlite_master WHERE lower(name)='ad_role_included'").get() ? 'present after the patch, ' + db.prepare('SELECT COUNT(*) AS n FROM ad_role_included').get().n + ' rows' : 'absent') + ') ──');
if (SO && CO_RL) scratch(function () {
  db.exec("CREATE TABLE IF NOT EXISTS ad_role_included (ad_client_id INTEGER, ad_org_id INTEGER, isactive TEXT, ad_role_id INTEGER, included_role_id INTEGER, seqno INTEGER)");
  db.prepare('DELETE FROM ad_document_action_access WHERE ad_role_id=103 AND c_doctype_id=? AND ad_ref_list_id=?').run(SO.id, CO_RL.id);
  db.prepare("INSERT INTO ad_role_included (ad_client_id, ad_org_id, isactive, ad_role_id, included_role_id, seqno) VALUES (11, 0, 'Y', 103, 102, 10)").run();
  var g = check(AA.buildRole(db, 103), CLIENT, SO.id, DR);
  arm('A3a', eq(g, DR), "103 lacks CO but includes 102 (which has it, 'Y') → CO offered", 'got [' + g + ']');
  db.prepare("UPDATE ad_document_action_access SET isactive='N' WHERE ad_role_id=102 AND c_doctype_id=? AND ad_ref_list_id=?").run(SO.id, CO_RL.id);
  db.prepare("INSERT INTO ad_document_action_access (ad_client_id, ad_org_id, isactive, c_doctype_id, ad_role_id, ad_ref_list_id) VALUES (11, 0, 'Y', ?, 103, ?)").run(SO.id, CO_RL.id);
  var g2 = check(AA.buildRole(db, 103), CLIENT, SO.id, DR);
  arm('A3b', eq(g2, DR), "the logged role is judged LAST: included 102 says 'N', 103's own 'Y' re-adds → CO offered", 'got [' + g2 + ']');
  db.prepare("UPDATE ad_document_action_access SET isactive='Y' WHERE ad_role_id=102 AND c_doctype_id=? AND ad_ref_list_id=?").run(SO.id, CO_RL.id);
  db.prepare("UPDATE ad_document_action_access SET isactive='N' WHERE ad_role_id=103 AND c_doctype_id=? AND ad_ref_list_id=?").run(SO.id, CO_RL.id);
  var g3 = check(AA.buildRole(db, 103), CLIENT, SO.id, DR);
  arm('A3c', eq(g3, ['PR', 'VO']), "an 'N' removes what an earlier role added: included 102 says 'Y', 103's own 'N' (judged last) → CO not offered", 'got [' + g3 + ']');
});

// ── A4 master role on System (client 0, IsMasterRole) judged by DocBaseType + DocSubTypeSO ──
log('\n── A4 master role on System (MRole.java:2710-2736) ──');
if (SO && CO_RL) scratch(function () {
  db.prepare("UPDATE ad_role SET ad_client_id=0, ismasterrole='Y' WHERE ad_role_id=200001").run();
  db.prepare("UPDATE ad_document_action_access SET ad_client_id=0 WHERE ad_role_id=200001").run();
  var r = AA.buildRole(db, 200001), g = check(r, CLIENT, SO.id, DR);
  arm('A4a', eq(g, DR), 'master role, rows of the same DocBaseType/DocSubTypeSO, any client → CO offered', 'got [' + g + ']');
  db.prepare("UPDATE ad_document_action_access SET isactive='N' WHERE ad_role_id=200001 AND ad_ref_list_id=? AND c_doctype_id IN (SELECT c_doctype_id FROM c_doctype WHERE docbasetype='SOO' AND docsubtypeso='SO')").run(CO_RL.id);
  var g2 = check(AA.buildRole(db, 200001), CLIENT, SO.id, DR);
  arm('A4b', eq(g2, ['PR', 'VO']), "master role: every SOO/SO doctype's CO row 'N' → CO not offered", 'got [' + g2 + ']');
});

// ── B (RETIRED 2026-10-28, TEAMWORK_FRAMEWORK §41.2 L4a): the overlay ARGUMENT. Arms B1a / B1b / B2 judged checkActionAccess(..., overlay); after study 2.5 the host calls it over the login role only and the
//    executor map reaches it as 'N' rows (witness_team_executors.js W-UPS-E2-HOST judges that path), so the argument was dead code and is deleted. Its mutant 'overlay-off' (arm B1) is retired with it.
//    B-GONE keeps the deletion honest: the function takes exactly (clientId, docTypeId, options), and a fourth argument changes nothing.
log('\n── B-GONE the overlay argument is deleted ──');
var arity = hasFn ? AA.RoleContext.prototype.checkActionAccess.length : -1;
var gB = hasFn ? rc[103].checkActionAccess(CLIENT, SO.id, DR, DR) : null;   // a stray 4th argument (the old overlay = every value) must NOT empty the list
arm('B-GONE', hasFn && arity === 3 && eq(gB, DR), 'checkActionAccess declares 3 parameters and ignores a 4th (the old overlay = every value would have emptied the list)', 'arity=' + arity + ' with-4th=[' + gB + ']');

var verdict = fails ? 'FAIL' : (inconclusive ? 'INCONCLUSIVE' : 'PASS');
log('\n§E2_ARMS red=' + (red.length ? red.join(',') : 'none') + ' judged=' + judged);

// ── mutants of the port (each must prove it applied; a crash is not a kill) ──
var mut = '';
if (!IS_MUTANT && hasFn && !fails) {
  var src = fs.readFileSync(ACCESS, 'utf8');
  var M = [
    { id: 'skip', arm: 'A2', from: /\/\*E2:FILTER\*\/[^\n]*/, to: 'return opt; /*E2:FILTER*/' },
    { id: 'N-ignored', arm: 'A3', from: "if (act === 'N') delete valid[v];", to: "if (act === 'N') {}" },
    { id: 'no-row-offered', arm: 'A2', from: 'var valid = {};', to: 'var valid = {}; opt.forEach(function (v) { valid[v] = 1; });' },
    { id: 'included-off', arm: 'A3', from: "var inc = hasTable(db, 'ad_role_included'),", to: 'var inc = false,' },
    { id: 'master-as-tenant', arm: 'A4', from: "master: Number(r.c) === 0 && r.m === 'Y'", to: 'master: false' },
    { id: 'overlay-back', arm: 'B-GONE', from: 'RoleContext.prototype.checkActionAccess = function (clientId, docTypeId, options) {', to: 'RoleContext.prototype.checkActionAccess = function (clientId, docTypeId, options, overlay) { if (overlay) return [];' }
  ];
  var killed = 0;
  M.forEach(function (m) {
    var s2 = src.replace(m.from, m.to);
    if (s2 === src) { log('   MUTATION DID NOT APPLY ' + m.id); return; }
    var f = path.join(os.tmpdir(), 'e2_mut_' + m.id + '_' + process.pid + '.js'); fs.writeFileSync(f, s2);
    var r = cp.spawnSync(process.execPath, [__filename, OOTB], { env: Object.assign({}, process.env, { WITNESS_ACCESS: f }), encoding: 'utf8', maxBuffer: 1 << 26 });
    var out = r.stdout || '', m2 = out.match(/§E2_ARMS red=(\S+)/), crashed = !m2;
    var reds = m2 && m2[1] !== 'none' ? m2[1].split(',') : [];
    var hit = !crashed && reds.some(function (x) { return x.indexOf(m.arm) === 0; });
    if (hit) killed++;
    log('   mutant ' + m.id + ': ' + (crashed ? 'CRASHED (not a kill) ' + String(r.stderr).split('\n')[0] : 'red=' + (reds.join(',') || 'none')) + ' → ' + (hit ? 'KILLED by ' + m.arm : 'SURVIVED'));
    fs.unlinkSync(f);
  });
  mut = ' mutants=' + killed + '/' + M.length;
  if (killed < M.length) verdict = 'FAIL';
}
log('§E2_VERDICT ' + verdict + ' judged=' + judged + ' fails=' + fails + mut);
if (!IS_MUTANT) fs.writeFileSync(LOG, lines.join('\n') + '\n');
process.exit(verdict === 'PASS' ? 0 : 1);
