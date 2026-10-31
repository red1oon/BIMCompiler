#!/usr/bin/env node
// Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
// SPDX-License-Identifier: MIT
/**
 * ⚠ DO NOT REMOVE — W-TERMS runner. Spec: prompts/TEAMWORK_FRAMEWORK.md §48 (lexicon + enforced/open ledger). READ THE LOG after every run — the exit code is not evidence.
 * One row per TERM. A row is ENFORCED only when (a) every witness script exits 0 AND prints its own PASS verdict, and (b) every broken control it names is FOUND in the
 * witness log as a line proving the defect was refused. A witness that passes with a control line missing is reported UNCONTROLLED (not enforced). Nothing judged = INCONCLUSIVE.
 * A row with no witness is OPEN and carries its roadmap id; it is never run and never green. Offline: node + the repo's own build/ only, no network.
 * Run:   node scripts/witness_terms.js [--json out.json] [--only term-id,...] [--logs dir] [--ootb dir] [--browser 0] [--reuse 1]
 * Two layers (§48.12): ENGINE witnesses (node, this repo) and BROWSER witnesses (bim-ootb erp/tests/witness_team_*, the real erp/idempiere.html in headless Chromium).
 * A browser witness that cannot run (no tree / no Playwright / --browser 0) is SKIPPED with its reason; the row then says 'engine only' and the verdict line prints
 * browser=judged N/skipped M, so a skipped layer is never read as a pass. --reuse 1 judges the logs already in --logs without re-running (for mutation checks).
 * Exit:  0 all runnable rows ENFORCED · 1 a witness FAILED or a control is MISSING/PASSED · 2 INCONCLUSIVE (nothing judged). OPEN rows never change the exit code (they are stated, not hidden).
 * JSON schema (shared with the Seatbelt export): { schema:'terms-v1', kind:'harness', at, node, rows:[{id,term,guarantee,status,roadmap,witnesses:[{file,exit,verdict}],controls:[{id,found,evidence}]}] }
 */
'use strict';
var cp = require('child_process'), fs = require('fs'), path = require('path');
var ROOT = path.join(__dirname, '..'), argv = process.argv.slice(2), A = {};
for (var i = 0; i < argv.length; i++) if (/^--/.test(argv[i])) A[argv[i].slice(2)] = argv[++i];
var LOGS = A.logs || path.join(ROOT, 'build', 'scriptor', 'terms_run'), ONLY = A.only ? A.only.split(',') : null;
var OOTB = A.ootb || path.join(process.env.HOME || '', 'bim-ootb'), REUSE = A.reuse === '1';
var TREE_WHY = !fs.existsSync(path.join(OOTB, 'erp', 'idempiere.html')) ? 'no bim-ootb tree at ' + OOTB : null;
var BROWSER_WHY = A.browser === '0' ? '--browser 0' : TREE_WHY ? TREE_WHY
  : !(fs.existsSync(path.join(OOTB, 'tests', 'node_modules', 'playwright')) || fs.existsSync(path.join(OOTB, 'node_modules', 'playwright'))) ? 'no Playwright in ' + OOTB : null;
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
  seal:      { f: 'witness_scriptor_seal.js', ok: /§SEAL_VERDICT PASS/ },
  // BROWSER layer (§48.12): bim-ootb erp/tests, the real page in headless Chromium; verdicts carry their own mutant counts
  tPublish:  { f: 'witness_team_publish.js', layer: 'browser', ok: /§WP_VERDICT PASS.*mutants_killed=4\/4/ },
  tExecs:    { f: 'witness_team_executors.js', layer: 'browser', ok: /§WX_VERDICT PASS.*mutants_killed=4\/4/ },
  tVersions: { f: 'witness_team_versions.js', layer: 'browser', ok: /§VM_VERDICT PASS.*mutants_killed=8\/8/ },
  tBase:     { f: 'witness_team_base.js', layer: 'browser', ok: /§W-BASE-EDIT PASS/ },
  tSo:       { f: 'witness_team_so.js', layer: 'browser', ok: /§W-TEAM-SO PASS/ },
  // OOTB layer: node witnesses that live in the bim-ootb tree (no Playwright); skipped only when the tree is missing
  tDocno:    { f: 'witness_docno_till.js', layer: 'ootb', ok: /§DT_VERDICT PASS/ },
  tDocnoMut: { f: 'witness_docno_till.js', args: ['--mutants'], log: 'witness_docno_till_mutants.log', layer: 'ootb', ok: /§DT_MUTANTS killed=4\/4/ },
  // dir = a directory under the bim-ootb tree other than erp/tests; env() = environment the witness needs, built when it runs (never from a guess)
  f1Mailbox: { f: 'witness_f1_mailbox.js', dir: 'common/tests', layer: 'ootb', ok: /§F1-VERDICT PASS judged=\d+ fails=0 inconclusive=0 product_fails=0/ },
  tKeys:     { f: 'witness_team_keys.js', layer: 'ootb', ok: /§KW_VERDICT PASS judged=46 mutants=9\/9/, env: kwOldEnv }
};
// W-KEYS arm L1 compares against the engine BEFORE Stage 2 (bim-ootb #2473, commit 38499773); without KW_OLD it prints INCONCLUSIVE, never PASS. The pre-Stage-2 common/comm is read with git archive of that commit's parent.
function kwOldEnv() {
  var d = path.resolve(LOGS, '_kw_old'), r = cp.spawnSync('sh', ['-c', 'rm -rf "$D" && mkdir -p "$D" && git -C "$O" archive 38499773^ common/comm | tar -x -C "$D" --strip-components=2'], { env: Object.assign({}, process.env, { D: d, O: OOTB }), encoding: 'utf8' });
  if (r.status !== 0 || !fs.existsSync(path.join(d, 'comm_store.js'))) { console.log('   (KW_OLD not built: ' + String(r.stderr).slice(0, 120) + ')'); return {}; }
  return { KW_OLD: d };
}
var TERMS = [
  { id: 'statement-signed', term: 'LEDGER signed / STATEMENT', guarantee: 'a statement edited after signing, or signed by an outside key, is refused', w: ['plantrust', 'tPublish'],
    c: [{ id: 'edited-after-signing refused', w: 'plantrust', re: /keys edited after signing -> REFUSED:plan-trust-signature/ }, { id: 'outside signer refused', w: 'plantrust', re: /REFUSED:plan-trust-untrusted-signer/ }, { id: 'page: unsigned set refused', w: 'tPublish', re: /🟢 P3 an UNSIGNED set is refused by the engine itself/ }, { id: 'page: set edited after signing refused (bad-signature)', w: 'tPublish', re: /🟢 P3 a set edited after signing: .*B REFUSES the set \(bad-signature\)/ }, { id: 'page: outside key refused', w: 'tPublish', re: /🟢 P4 a set signed by a key outside the trust list: refused:untrusted-signer/ }] },
  { id: 'trusted-keys', term: 'trusted keys', guarantee: 'the backup key replaces a lost primary; a non-admin or stale statement cannot change the list', w: ['plantrust', 'policy', 'tPublish'],
    c: [{ id: 'backup recovers lost primary', w: 'plantrust', re: /the BACKUP signs \[K1,K3\].*MERGED/ }, { id: 'non-admin refused', w: 'plantrust', re: /NON-admin device B -> REFUSED:not-admin/ }, { id: 'stale replay refused', w: 'plantrust', re: /REFUSED:plan-trust-stale/ }, { id: 'page: non-admin publish refused on both devices', w: 'tPublish', re: /🟢 P5 a non-admin's publishUpcasters has no effect: its POLICY is REFUSED not-admin on both devices/ }] },
  { id: 'rule-in-force', term: 'STATEMENT (rule in force)', guarantee: 'a claim stays judged by the rule in force when it was made; a later statement never rewrites it', w: ['execs', 'settrust', 'tExecs'],
    c: [{ id: 'Complete under old map stays refused after {}', w: 'execs', re: /AFTER \{\} the Complete done under the old map STAYS refused/ }, { id: 'set published under the old list still loads after rotation', w: 'settrust', re: /V3 MERGED; a fresh device on \[K2,K3\] loads S0 and S2/ }, { id: 'page: refused SET_STATUS stays refused after {}', w: 'tExecs', re: /🟢 X9 after the map \{\} the SET_STATUS the station was refused on STAYS refused/ }] },
  { id: 'complete-all-or-nothing', term: 'BUNDLE (Complete)', guarantee: 'a Complete by the wrong role is refused on every device, the consequences with it', w: ['execs', 'tExecs'],
    c: [{ id: 'status op refused not-executor everywhere', w: 'execs', re: /status op is REFUSED not-executor on EVERY device/ }, { id: 'group consequence refused with it', w: 'execs', re: /REFUSED not-executor-group everywhere \(all-or-none\)/ }, { id: 'page: clicked CL refused at fold, order unchanged', w: 'tExecs', re: /🟢 X7 C's DocAction \(CL\) is REFUSED at fold on A .*the order on A is unchanged/ }] },
  { id: 'ledger-convergent', term: 'LEDGER convergent', guarantee: 'devices with the same history agree; a stale copy is not taken in', w: ['store', 'conflict', 'tBase'],
    c: [{ id: 'same order on every device', w: 'store', re: /same order on every device/ }, { id: 'stale save refused (ReQuery)', w: 'conflict', re: /saveCheck stale=true msg="Current record was changed by another user, please ReQuery"\s+fresh=false/ }, { id: 'page: same refusal on A and B', w: 'tBase', re: /🟢 .*REFUSED with an access: reason by the base row's scope — the SAME verdict on A and on B/ }, { id: 'page: base-row-missing refused on both devices', w: 'tBase', re: /🟢 an op on a uu that is in neither the log nor the base is REFUSED base-row-missing — on both devices/ }] },
  { id: 'visit-lossless-offline', term: 'VISIT (offline / interrupted)', guarantee: 'no connection or a lying pipe sends nothing and loses nothing; the later Visit sends everything once', w: ['visit'],
    c: [{ id: 'dead pipe: nothing lost', w: 'visit', re: /a dead pipe: every claim still held locally, none marked sent/ }, { id: 'liar pipe caught by read-back', w: 'visit', re: /the read-back catches the dropped bundle/ }, { id: 'checkers fail on doctored state', w: 'visit', re: /CONTROL V2 liar-checker.*failed as designed/ }] },
  { id: 'visit-once', term: 'VISIT (voluntary, once)', guarantee: 'one Visit sends everything once; a second sends nothing', w: ['visit', 'store'],
    c: [{ id: 'third Visit sends nothing', w: 'visit', re: /a third Visit sends nothing \(once only\)/ }, { id: 'incremental fetch is 0', w: 'store', re: /a visit with nothing new fetches 0 bundles/ }] },
  { id: 'ack-trail', term: 'ACK', guarantee: 'sent → seen → refused is visible on the sender', w: ['store', 'visit', 'tSo'],
    c: [{ id: 'sent then SEEN by peers', w: 'store', re: /SEEN by B and C/ }, { id: 'refused shown on the sender with a reason', w: 'visit', re: /the refused claim is on the sender's own trail with a named reason/ }, { id: 'counter fails with the refused claim removed', w: 'visit', re: /CONTROL V3 refused-counter.*failed as designed/ }, { id: 'page: chip shows seen/refused/waiting/last visit', w: 'tSo', re: /🟢 the ERP chip shows .*seen \d+ · refused \d+ · waiting on \d+ · last visit/ }, { id: 'page: unsent DocAction shows local-only warning', w: 'tSo', re: /🟢 a DocAction is NOT sent and the chip shows a visible local-only warning/ }] },
  { id: 'version-skew', term: 'BUNDLE (version skew)', guarantee: 'newer waits, older waits for a rule, retired is ignored', w: ['versions', 'tVersions'],
    c: [{ id: '18 mutants killed', w: 'versions', re: /§CV_VERDICT PASS.*mutants_killed=18\/18/ }, { id: 'page: newer op parked needs-upgrade', w: 'tVersions', re: /🟢 M2 the sv:2 op is PARKED needs-upgrade/ }, { id: 'page: same op without sv merged (control)', w: 'tVersions', re: /🟢 M2 CONTROL: the same op without sv is MERGED/ }, { id: 'page: tampered set refused', w: 'tVersions', re: /🟢 M4 tampered set -> refused:bad-signature/ }] },
  { id: 'doc-numbering', term: 'LOCAL NUMBERING (LEDGER)', guarantee: 'with Team, two stations (login users with a Search Key) never issue the same document number: OrgValue-UserValue-n each; another station\'s or a typed number is refused at fold', w: ['tDocno', 'tDocnoMut'],
    note: 'TEAMWORK §48.11b-§48.11d. Legacy arm: the pilot\'s own WS-login run == the twin replay (D20, scripts/bridge/out/docno_station_legacy.json). Limits: an author not bound to an AD_User is not judged at fold (counted); two users sharing a Search Key share a series',
    c: [{ id: 'same user on two devices collides (control)', w: 'tDocno', re: /§DT PASS D11 - CONTROL/ }, { id: 'shipped plain sequence collides (control)', w: 'tDocno', re: /§DT PASS D5 - CONTROL/ },
        { id: "another station's / typed number refused at fold on every device", w: 'tDocno', re: /§DT PASS D14 - / }, { id: 'new format refused until its edit is in the log', w: 'tDocno', re: /§DT PASS D15b - / },
        { id: 'user preference cannot change the station', w: 'tDocno', re: /§DT PASS D13 - / }, { id: '4 mutants killed', w: 'tDocnoMut', re: /§DT_MUTANTS killed=4\/4/ },
        { id: 'legacy pilot (real WS logins) numbers the same at every position', w: 'tDocno', re: /§DT PASS D20 - LEGACY/ }, { id: 'demo station never numbers Org--n', w: 'tDocno', re: /§DT PASS D19 - / }] },
  // OPEN: stated, never run, never green. roadmap = where it closes.
  { id: 'visit-bounded', term: 'VISIT (bounded)', guarantee: 'Visit #1 download stays bounded as the team grows: each device lists and downloads only its own mailbox, not every other device\'s bundle', w: ['f1Mailbox'],
    note: 'TEAMWORK §45.2/§45.8 F1 per-device mailboxes (bim-ootb #2477; witness common/tests/witness_f1_mailbox.js, mutants run by the witness itself). Measured edge Visit #1 download 384 / 386 / 388 B at N=10/100/1000 (W-SCALE-STAR: build/scriptor/f1_mailboxes/scale_star_F1_final_engine_{10,100}.log, scale_star_F1_engine_1000.log; was 367 KB / 4.5 MB / 45.8 MB). Stated limits: the identity/roster floor on a first-ever Visit is not bounded (identity ops reach everyone); withholding of one mailbox bundle shows as a parked op, not a gap; an old app in a new star space silently misses mailbox mail; the GitHub listing is still O(N) calls',
    c: [{ id: 'fetched objects flat in N (3 -> 12)', w: 'f1Mailbox', re: /PASS §F1-A objects fetched in a fresh Visit are flat in N \(3 -> 12\) - 5 -> 5/ },
        { id: 'CONTROL pre-F1 engine: the same measure grows with N', w: 'f1Mailbox', re: /PASS §F1-A CONTROL pre-F1: the same measure GROWS with N .* - 8 -> 26 objects/ },
        { id: 'CONTROL pre-F1: station 1 held foreign DOWN ops (now none)', w: 'f1Mailbox', re: /PASS §F1-E CONTROL pre-F1: station 1 DID download another station's DOWN envelope - foreign DOWN ops held=[1-9]\d*/ },
        { id: 'station 1 never GETs another mailbox', w: 'f1Mailbox', re: /PASS §F1-E station 1 never GETs another station's mailbox nor the hub inbox - gets=\d+ foreign=0/ },
        { id: 'CONTROL pre-F1 relay gate refuses the mailbox name', w: 'f1Mailbox', re: /PASS §F1-I CONTROL pre-F1: the same mailbox name is refused by the old gate/ },
        { id: '7 mutants killed', w: 'f1Mailbox', re: /§F1-MUTANTS killed=7\/7 not_applied_or_crashed=0/ }] },
  { id: 'sealing-real', term: 'RELAY (sealing)', open: true, roadmap: 'TEAMWORK §29 (simulator PASS only, real comm layer untouched)', guarantee: 'the relay does not retain readable history',
    note: 'witness_scriptor_seal judges the simulator only; its own log marks the real layer INCONCLUSIVE' },
  { id: 'key-roles-threshold', term: 'trusted keys (roles + threshold)', guarantee: 'a key may only do what its role allows; a rotation or publication needs the declared number of DISTINCT valid keys; a device clock never expires anything',
    note: 'TEAMWORK §46.5 versioning Stage 2 (bim-ootb #2473; witness erp/tests/witness_team_keys.js, 9 mutants run by the witness, L1 legacy-fold arm needs KW_OLD = common/comm before #2473, built by the runner with git archive)', w: ['tKeys'],
    c: [{ id: 'rotate-only key cannot publish', w: 'tKeys', re: /🟢 R2 the rotate-only key CANNOT publish an executors map — REFUSED:executors-role/ },
        { id: 'publish-only key cannot rotate', w: 'tKeys', re: /🟢 R3 a publish-only key CANNOT rotate the list — REFUSED:plan-trust-role/ },
        { id: 'one signature under T=2 refused', w: 'tKeys', re: /🟢 T1 T=2: ONE signature on a rotation is REFUSED — REFUSED:plan-trust-threshold/ },
        { id: 'duplicate signer counted once', w: 'tKeys', re: /🟢 T1 T=2: the SAME key signing twice counts once - REFUSED — REFUSED:plan-trust-threshold/ },
        { id: 'forged cosignature refused', w: 'tKeys', re: /🟢 T4 a forged cosignature .* — REFUSED:plan-trust-threshold/ },
        { id: 'far-future device clock expires nothing', w: 'tKeys', re: /🟢 A1 with the device clock at 2040, entries expiring after the anchor are NOT expired .* — \[false,false,false\]/ },
        { id: 'far-future device clock moves no anchor', w: 'tKeys', re: /🟢 A3 an op authored under a 2040 device clock does not move the anchor/ },
        { id: 'legacy log folds to identical verdicts (L1 judged, not INCONCLUSIVE)', w: 'tKeys', re: /🟢 L1 a log written by the UNMODIFIED engine .* differing=0/ }] }
];

var logs = {}, results = [], anyFail = false, anyJudged = false;
function runW(k) {
  if (logs[k]) return logs[k];
  var w = W[k], br = w.layer === 'browser' || w.layer === 'ootb', lf = path.join(LOGS, w.log || w.f.replace(/\.js$/, '.log')), why = w.layer === 'browser' ? BROWSER_WHY : w.layer === 'ootb' ? TREE_WHY : null;
  if (why) return logs[k] = { skipped: why, out: '', log: lf, passed: false };
  if (REUSE) { var o0 = fs.existsSync(lf) ? fs.readFileSync(lf, 'utf8') : '', e0 = (o0.match(/\nexit=(\d+)\s*$/) || [])[1]; return logs[k] = { exit: e0 === undefined ? null : +e0, out: o0, log: lf, reused: true, passed: e0 === '0' && w.ok.test(o0) }; }
  var r = cp.spawnSync('node', [br ? path.join(OOTB, w.dir || 'erp/tests', w.f) : path.join(__dirname, w.f)].concat(w.args || []), { cwd: br ? OOTB : ROOT, env: Object.assign({}, process.env, w.env ? w.env() : {}), encoding: 'utf8', timeout: 600000, maxBuffer: 1 << 28 });
  var out = (r.stdout || '') + (r.stderr || '') + '\nexit=' + r.status + '\n'; fs.writeFileSync(lf, out);
  console.log('   ran ' + (br ? w.layer + ' ' : '') + w.f + (w.args ? ' ' + w.args.join(' ') : '') + ' exit=' + r.status);
  return logs[k] = { exit: r.status, out: out, log: lf, passed: r.status === 0 && w.ok.test(out) };
}
var nBr = { judged: 0, skipped: 0 }, brSeen = {};
TERMS.forEach(function (t) {
  if (ONLY && ONLY.indexOf(t.id) < 0) return;
  var row = { id: t.id, term: t.term, guarantee: t.guarantee, roadmap: t.roadmap || null, witnesses: [], controls: [], status: null, note: t.note || null };
  if (t.open) { row.status = 'OPEN'; results.push(row); return; }
  t.w.forEach(function (k) {
    var r = runW(k), br = W[k].layer === 'browser';   // the browser counter is Playwright runs only; the ootb layer shows in the row's layers
    if (br && !brSeen[k]) { brSeen[k] = 1; nBr[r.skipped ? 'skipped' : 'judged']++; }
    if (!r.skipped) anyJudged = true;
    row.witnesses.push({ file: W[k].f, layer: W[k].layer || 'engine', exit: r.exit, verdict: r.skipped ? 'SKIPPED' : r.passed ? 'PASS' : 'FAIL', skipped: r.skipped || null, reused: !!r.reused, log: path.relative(ROOT, r.log) });
  });
  t.c.forEach(function (c) { var r = runW(c.w); if (r.skipped) { row.controls.push({ id: c.id, layer: 'browser', found: null, skipped: r.skipped, evidence: null }); return; } var m = r.out.match(c.re); row.controls.push({ id: c.id, layer: W[c.w].layer || 'engine', found: !!m, evidence: m ? m[0].slice(0, 160) : null }); });
  var judgedW = row.witnesses.filter(function (x) { return x.verdict !== 'SKIPPED'; }), judgedC = row.controls.filter(function (x) { return x.found !== null; });
  var wOk = judgedW.length > 0 && judgedW.every(function (x) { return x.verdict === 'PASS'; }), cOk = judgedC.every(function (x) { return x.found; });
  row.status = !wOk ? 'WITNESS-FAILED' : (!cOk ? 'UNCONTROLLED' : 'ENFORCED'); if (row.status !== 'ENFORCED') anyFail = true;
  var hasBr = row.witnesses.some(function (x) { return x.layer === 'browser'; }), brJudged = row.witnesses.some(function (x) { return x.layer === 'browser' && x.verdict !== 'SKIPPED'; });
  var onlyOotb = row.witnesses.every(function (x) { return x.layer === 'ootb'; });
  row.layers = onlyOotb ? 'bim-ootb tree (node, real modules)' : !hasBr ? 'engine only (no browser witness located)' : brJudged ? 'engine + browser' : 'engine only (browser SKIPPED)';
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
  var w = r.status === 'OPEN' ? '-' : r.witnesses.map(function (x) { return x.verdict; }).join('+'), jc = r.controls.filter(function (x) { return x.found !== null; }), c = r.status === 'OPEN' ? '-' : jc.filter(function (x) { return x.found; }).length + '/' + jc.length + ' refused';
  console.log([r.term, w, c, r.status + (r.layers ? ' [' + r.layers + ']' : ''), r.roadmap || ''].join(' | '));
  r.controls.forEach(function (x) { if (x.found === false) console.log('   🔴 control NOT FOUND: ' + x.id); });
});
var n = { ENFORCED: 0, OPEN: 0, 'WITNESS-FAILED': 0, UNCONTROLLED: 0 }; results.forEach(function (r) { n[r.status]++; });
var verdict = anyFail ? 'FAIL' : (!anyJudged ? 'INCONCLUSIVE' : 'PASS');
console.log('§TERMS_BROWSER judged=' + nBr.judged + ' skipped=' + nBr.skipped + (BROWSER_WHY ? ' reason="' + BROWSER_WHY + '"' : '') + (REUSE ? ' reused-logs' : ''));
console.log('§TERMS_VERDICT ' + verdict + ' enforced=' + n.ENFORCED + ' open=' + n.OPEN + ' witness_failed=' + n['WITNESS-FAILED'] + ' uncontrolled=' + n.UNCONTROLLED + ' browser=judged ' + nBr.judged + '/skipped ' + nBr.skipped);
if (A.json) fs.writeFileSync(A.json, JSON.stringify({ schema: 'terms-v1', kind: 'harness', at: new Date().toISOString(), node: process.version, verdict: verdict, browser: { judged: nBr.judged, skipped: nBr.skipped, reason: BROWSER_WHY, reused: REUSE }, rows: results }, null, 1));
process.exit(anyFail ? 1 : (!anyJudged ? 2 : 0));
