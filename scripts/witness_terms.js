#!/usr/bin/env node
// Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
// SPDX-License-Identifier: MIT
/**
 * ⚠ DO NOT REMOVE — W-TERMS runner. Spec: prompts/TEAMWORK_FRAMEWORK.md §48 (lexicon + enforced/open ledger). READ THE LOG after every run — the exit code is not evidence.
 * One row per TERM. A row is ENFORCED only when (a) every witness script exits 0 AND prints its own PASS verdict, and (b) every broken control it names is FOUND in the
 * witness log as a line proving the defect was refused. A witness that passes with a control line missing is reported UNCONTROLLED (not enforced). Nothing judged = INCONCLUSIVE.
 * A row with no witness is OPEN and carries its roadmap id; it is never run and never green. Offline: node + the repo's own build/ only, no network.
 * Run:   node scripts/witness_terms.js [--json out.json] [--only term-id,...] [--logs dir]
 * Exit:  0 all runnable rows ENFORCED · 1 a witness FAILED or a control is MISSING/PASSED · 2 INCONCLUSIVE (nothing judged). OPEN rows never change the exit code (they are stated, not hidden).
 * JSON schema (shared with the Seatbelt export): { schema:'terms-v1', kind:'harness', at, node, rows:[{id,term,guarantee,status,roadmap,witnesses:[{file,exit,verdict}],controls:[{id,found,evidence}]}] }
 */
'use strict';
var cp = require('child_process'), fs = require('fs'), path = require('path');
var ROOT = path.join(__dirname, '..'), argv = process.argv.slice(2), A = {};
for (var i = 0; i < argv.length; i++) if (/^--/.test(argv[i])) A[argv[i].slice(2)] = argv[++i];
var LOGS = A.logs || path.join(ROOT, 'build', 'scriptor', 'terms_run'), ONLY = A.only ? A.only.split(',') : null;
fs.mkdirSync(LOGS, { recursive: true });

// witness = {f: script, ok: regex of its own PASS verdict line}; control = {id, f: which witness log, re: regex of the line that proves the defect was refused}
var W = {
  plantrust: { f: 'witness_comm_plantrust.js', ok: /§PLANTRUST_VERDICT PASS/ },
  settrust:  { f: 'witness_comm_settrust.js', ok: /§SETTRUST_VERDICT PASS.*mutants=3\/3/ },
  execs:     { f: 'witness_comm_executors.js', ok: /§EXE_VERDICT PASS/ },
  store:     { f: 'witness_comm_cl3_store.js', ok: /§W-STORE-NODE PASS/ },
  conflict:  { f: 'witness_comm_cl5_conflict.js', ok: /§W-CONFLICT PASS/ },
  versions:  { f: 'witness_comm_versions.js', ok: /§CV_VERDICT PASS.*mutants_killed=18\/18/ },
  visit:     { f: 'witness_terms_visit.js', ok: /§VISIT_VERDICT PASS/ },
  policy:    { f: 'witness_comm_policy.js', ok: /§POLICY-NONADMIN verdicts=REFUSED:not-admin/ },
  seal:      { f: 'witness_scriptor_seal.js', ok: /§SEAL_VERDICT PASS/ }
};
var TERMS = [
  { id: 'statement-signed', term: 'LEDGER signed / STATEMENT', guarantee: 'a statement edited after signing, or signed by an outside key, is refused', w: ['plantrust'],
    c: [{ id: 'edited-after-signing refused', w: 'plantrust', re: /keys edited after signing -> REFUSED:plan-trust-signature/ }, { id: 'outside signer refused', w: 'plantrust', re: /REFUSED:plan-trust-untrusted-signer/ }] },
  { id: 'trusted-keys', term: 'trusted keys', guarantee: 'the backup key replaces a lost primary; a non-admin or stale statement cannot change the list', w: ['plantrust', 'policy'],
    c: [{ id: 'backup recovers lost primary', w: 'plantrust', re: /the BACKUP signs \[K1,K3\].*MERGED/ }, { id: 'non-admin refused', w: 'plantrust', re: /NON-admin device B -> REFUSED:not-admin/ }, { id: 'stale replay refused', w: 'plantrust', re: /REFUSED:plan-trust-stale/ }] },
  { id: 'rule-in-force', term: 'STATEMENT (rule in force)', guarantee: 'a claim stays judged by the rule in force when it was made; a later statement never rewrites it', w: ['execs', 'settrust'],
    c: [{ id: 'Complete under old map stays refused after {}', w: 'execs', re: /AFTER \{\} the Complete done under the old map STAYS refused/ }, { id: 'set published under the old list still loads after rotation', w: 'settrust', re: /V3 MERGED; a fresh device on \[K2,K3\] loads S0 and S2/ }] },
  { id: 'complete-all-or-nothing', term: 'BUNDLE (Complete)', guarantee: 'a Complete by the wrong role is refused on every device, the consequences with it', w: ['execs'],
    c: [{ id: 'status op refused not-executor everywhere', w: 'execs', re: /status op is REFUSED not-executor on EVERY device/ }, { id: 'group consequence refused with it', w: 'execs', re: /REFUSED not-executor-group everywhere \(all-or-none\)/ }] },
  { id: 'ledger-convergent', term: 'LEDGER convergent', guarantee: 'devices with the same history agree; a stale copy is not taken in', w: ['store', 'conflict'],
    c: [{ id: 'same order on every device', w: 'store', re: /same order on every device/ }, { id: 'stale save refused (ReQuery)', w: 'conflict', re: /saveCheck stale=true msg="Current record was changed by another user, please ReQuery"\s+fresh=false/ }] },
  { id: 'visit-lossless-offline', term: 'VISIT (offline / interrupted)', guarantee: 'no connection or a lying pipe sends nothing and loses nothing; the later Visit sends everything once', w: ['visit'],
    c: [{ id: 'dead pipe: nothing lost', w: 'visit', re: /a dead pipe: every claim still held locally, none marked sent/ }, { id: 'liar pipe caught by read-back', w: 'visit', re: /the read-back catches the dropped bundle/ }, { id: 'checkers fail on doctored state', w: 'visit', re: /CONTROL V2 liar-checker.*failed as designed/ }] },
  { id: 'visit-once', term: 'VISIT (voluntary, once)', guarantee: 'one Visit sends everything once; a second sends nothing', w: ['visit', 'store'],
    c: [{ id: 'third Visit sends nothing', w: 'visit', re: /a third Visit sends nothing \(once only\)/ }, { id: 'incremental fetch is 0', w: 'store', re: /a visit with nothing new fetches 0 bundles/ }] },
  { id: 'ack-trail', term: 'ACK', guarantee: 'sent → seen → refused is visible on the sender', w: ['store', 'visit'],
    c: [{ id: 'sent then SEEN by peers', w: 'store', re: /SEEN by B and C/ }, { id: 'refused shown on the sender with a reason', w: 'visit', re: /the refused claim is on the sender's own trail with a named reason/ }, { id: 'counter fails with the refused claim removed', w: 'visit', re: /CONTROL V3 refused-counter.*failed as designed/ }] },
  { id: 'version-skew', term: 'BUNDLE (version skew)', guarantee: 'newer waits, older waits for a rule, retired is ignored', w: ['versions'],
    c: [{ id: '18 mutants killed', w: 'versions', re: /§CV_VERDICT PASS.*mutants_killed=18\/18/ }] },
  // OPEN: stated, never run, never green. roadmap = where it closes.
  { id: 'visit-bounded', term: 'VISIT (bounded)', open: true, roadmap: 'TEAMWORK §45.2 F1 per-device mailboxes', guarantee: 'Visit #1 download stays bounded as the team grows',
    note: 'measured §45.5: 384 KB / 4.5 MB / 45.8 MB at N=10/100/1000 (linear); triggered from N=10' },
  { id: 'sealing-real', term: 'RELAY (sealing)', open: true, roadmap: 'TEAMWORK §29 (simulator PASS only, real comm layer untouched)', guarantee: 'the relay does not retain readable history',
    note: 'witness_scriptor_seal judges the simulator only; its own log marks the real layer INCONCLUSIVE' },
  { id: 'doc-numbering', term: 'LEDGER (document numbering)', open: true, roadmap: 'TEAMWORK §48.8: per-station org-level sequence + prefix (legacy mechanism, ported) not configured in the shipped data; W-DOCNO-ORG not written', guarantee: 'two stations never give the same document number; each station runs its own gapless number under its own prefix',
    note: 'mechanism witnessed: bim-ootb W-DOCNO-TILL 6/0 (Org|Till|Sequence, offline devices share no number; control: shipped plain sequence collides 50000/50000). NOT switched on: changing the shipped sequence moves the Team BASE hash (owner decision). Fold-path uniqueness not verified; legacy arm INCONCLUSIVE' },
  { id: 'key-roles-threshold', term: 'trusted keys (roles + threshold)', open: true, roadmap: 'TEAMWORK §46.5 versioning Stage 2', guarantee: 'key roles, a signing threshold, signed bundles' }
];

var logs = {}, results = [], anyFail = false, anyJudged = false;
function runW(k) {
  if (logs[k]) return logs[k];
  var w = W[k], lf = path.join(LOGS, w.f.replace(/\.js$/, '.log')), r = cp.spawnSync('node', [path.join(__dirname, w.f)], { cwd: ROOT, encoding: 'utf8', timeout: 600000, maxBuffer: 1 << 28 });
  var out = (r.stdout || '') + (r.stderr || ''); fs.writeFileSync(lf, out);
  return logs[k] = { exit: r.status, out: out, log: lf, passed: r.status === 0 && w.ok.test(out) };
}
TERMS.forEach(function (t) {
  if (ONLY && ONLY.indexOf(t.id) < 0) return;
  var row = { id: t.id, term: t.term, guarantee: t.guarantee, roadmap: t.roadmap || null, witnesses: [], controls: [], status: null, note: t.note || null };
  if (t.open) { row.status = 'OPEN'; results.push(row); return; }
  t.w.forEach(function (k) { var r = runW(k); anyJudged = true; row.witnesses.push({ file: W[k].f, exit: r.exit, verdict: r.passed ? 'PASS' : 'FAIL', log: path.relative(ROOT, r.log) }); });
  t.c.forEach(function (c) { var r = runW(c.w), m = r.out.match(c.re); row.controls.push({ id: c.id, found: !!m, evidence: m ? m[0].slice(0, 160) : null }); });
  var wOk = row.witnesses.every(function (x) { return x.verdict === 'PASS'; }), cOk = row.controls.every(function (x) { return x.found; });
  row.status = !wOk ? 'WITNESS-FAILED' : (!cOk ? 'UNCONTROLLED' : 'ENFORCED'); if (row.status !== 'ENFORCED') anyFail = true;
  results.push(row);
});

// §TERMS_SELFTEST (--selftest 1): the runner must be able to say NO. A BLANK log must never be judged: no control line may match it and no witness verdict may match it.
if (A.selftest !== undefined) {
  var bad = 0, n2 = 0;
  TERMS.filter(function (t) { return !t.open && (!ONLY || ONLY.indexOf(t.id) >= 0); }).forEach(function (t) {
    var ctl = t.c.every(function (c) { return !c.re.test(''); }), wk = t.w.every(function (k) { return !W[k].ok.test(''); }); n2++;
    if (!ctl || !wk) { bad++; console.log('   🔴 SELFTEST ' + t.id + ': a blank log would be judged ' + (!ctl ? 'controlled' : 'passing')); }
  });
  console.log('§TERMS_SELFTEST ' + (bad || !n2 ? 'FAIL' : 'PASS') + ' rows=' + n2);
  if (bad || !n2) anyFail = true;
}
var order = { 'OPEN': 0, 'WITNESS-FAILED': 1, 'UNCONTROLLED': 2, 'ENFORCED': 3 }; results.sort(function (a, b) { return order[a.status] - order[b.status]; });   // open terms first
console.log('§TERMS table (open first; an open term is never green)');
console.log(['term', 'witness', 'broken control', 'status', 'roadmap'].join(' | '));
results.forEach(function (r) {
  var w = r.status === 'OPEN' ? '-' : r.witnesses.map(function (x) { return x.verdict; }).join('+'), c = r.status === 'OPEN' ? '-' : r.controls.filter(function (x) { return x.found; }).length + '/' + r.controls.length + ' refused';
  console.log([r.term, w, c, r.status, r.roadmap || ''].join(' | '));
  r.controls.forEach(function (x) { if (!x.found) console.log('   🔴 control NOT FOUND: ' + x.id); });
});
var n = { ENFORCED: 0, OPEN: 0, 'WITNESS-FAILED': 0, UNCONTROLLED: 0 }; results.forEach(function (r) { n[r.status]++; });
var verdict = anyFail ? 'FAIL' : (!anyJudged ? 'INCONCLUSIVE' : 'PASS');
console.log('§TERMS_VERDICT ' + verdict + ' enforced=' + n.ENFORCED + ' open=' + n.OPEN + ' witness_failed=' + n['WITNESS-FAILED'] + ' uncontrolled=' + n.UNCONTROLLED);
if (A.json) fs.writeFileSync(A.json, JSON.stringify({ schema: 'terms-v1', kind: 'harness', at: new Date().toISOString(), node: process.version, verdict: verdict, rows: results }, null, 1));
process.exit(anyFail ? 1 : (!anyJudged ? 2 : 0));
