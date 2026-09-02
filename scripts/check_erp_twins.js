// ⚠ DO NOT REMOVE — Scope guard
// Scope: W-ERP-TWIN — does every bim-compiler `build/erp/*.js` module that a witness JUDGES still match the
//   file that actually SHIPS at bim-ootb `erp/*.js`?
//   THE ISSUE this proves/disproves: a witness can be green while judging code no user runs. Proven real
//   2026-09-02 — `scripts/poc_morder_save.js` required `build/erp/ad_modelval.js`, a drifted copy missing the
//   two hooks the shipped file had just gained, and reported 4 FAILs that were artefacts of the copy, not the
//   product (ERP_IDEMPIERE_UX_PARITY.md §IMPL-RESULT-F7). PR #1611 had already established the opposite
//   discipline for ad_docfsm.js (twins md5-identical, asserted in the PR). This generalises that one check.
//   Declared relationships live in scripts/erp_twins.json — 'identical' pairs FAIL on drift, 'unreviewed'
//   pairs are reported loudly but do not fail until a human classifies them, and an UNDECLARED judged twin
//   always fails (so a new pair cannot enter the tree unnoticed).
// §-log first — READ build/erp/check_erp_twins.log before any conclusion (exit code is NOT evidence).
// Run:  bash build/erp/run_witness.sh scripts/check_erp_twins.js     (cwd = bim-compiler)
//       OOTB=<path> overrides the bim-ootb checkout location.
'use strict';
var fs = require('fs'), path = require('path'), cp = require('child_process'), crypto = require('crypto');

var HERE = path.join(__dirname, '..');
var OOTB = process.env.OOTB || path.join(process.env.HOME || '/home/red1', 'bim-ootb');
var MAN = JSON.parse(fs.readFileSync(path.join(HERE, 'scripts/erp_twins.json'), 'utf8'));
var md5 = function (b) { return crypto.createHash('md5').update(b).digest('hex'); };

// STALENESS GUARD — comparing against a stale checkout is exactly how a false SAME/DRIFT is produced (hit
// live 2026-09-02: a 7-commit-behind tree reported ad_docfsm.js as drifted when origin/main matched exactly).
var behind = 'unknown';
try {
  cp.execSync('git -C ' + OOTB + ' fetch -q origin', { timeout: 120000, stdio: 'ignore' });
  behind = cp.execSync('git -C ' + OOTB + ' rev-list --count HEAD..origin/main', { encoding: 'utf8' }).trim();
} catch (e) { behind = 'fetch-failed(' + (e && e.message ? e.message.slice(0, 40) : '?') + ')'; }
console.log('§TWIN_BASE ootb=' + OOTB + ' behind_origin_main=' + behind +
  (behind !== '0' ? '  ⚠ comparing against origin/main blobs, NOT the working tree' : ''));

// The shipped bytes always come from origin/main, never the working tree — see the guard above.
function shipped(base) {
  try { return cp.execSync('git -C ' + OOTB + ' show origin/main:erp/' + base + '.js', { maxBuffer: 64 * 1024 * 1024 }); }
  catch (e) { return null; }
}

// Which modules does a witness actually judge? Derived from the tree, never hand-listed — a new witness
// requiring a new module must show up here on its own.
var judged = {};
['scripts'].forEach(function (d) {
  fs.readdirSync(path.join(HERE, d)).filter(function (f) { return /^(poc_|witness_).*\.js$/.test(f); }).forEach(function (f) {
    var src = fs.readFileSync(path.join(HERE, d, f), 'utf8'), m, re = /build\/erp\/([a-z_0-9]+)/g;
    while ((m = re.exec(src))) {
      var b = m[1];
      if (b === 'run_witness') continue;
      if (!fs.existsSync(path.join(HERE, 'build/erp', b + '.js'))) continue;   // a .db/.sh/log, not a module
      (judged[b] = judged[b] || {})[f] = 1;
    }
  });
});

var rows = [], fail = 0, unreviewed = 0, identical = 0;
Object.keys(judged).sort().forEach(function (b) {
  var n = Object.keys(judged[b]).length;
  var ship = shipped(b);
  if (ship === null) { rows.push(['NO-SHIP', b, n, 'no erp/' + b + '.js on origin/main — copy-only module, not a twin']); return; }
  var a = md5(fs.readFileSync(path.join(HERE, 'build/erp', b + '.js'))), s = md5(ship);
  var decl = MAN.twins[b];
  var same = a === s;
  if (!decl) { fail++; rows.push(['UNDECLARED', b, n, 'judged twin absent from erp_twins.json — classify it (copy=' + a.slice(0, 8) + ' shipped=' + s.slice(0, 8) + ')']); return; }
  if (decl.rel === 'identical') {
    if (same) { identical++; rows.push(['SAME', b, n, decl.why]); }
    else { fail++; rows.push(['BROKEN', b, n, 'declared identical but DRIFTED — copy=' + a.slice(0, 8) + ' shipped=' + s.slice(0, 8) + ' · ' + decl.why]); }
  } else if (decl.rel === 'divergent') {
    rows.push(['DIVERGENT', b, n, decl.why]);
  } else {
    unreviewed++;
    rows.push([same ? 'UNREVIEWED-NOW-SAME' : 'UNREVIEWED-DRIFT', b, n,
      (same ? 'drifted when declared, matches today — promote to identical? · ' : 'copy=' + a.slice(0, 8) + ' shipped=' + s.slice(0, 8) + ' · ') + decl.why]);
  }
});

console.log('\n§TWIN_TABLE  verdict · module · witnesses judging the copy · note');
rows.forEach(function (r) { console.log('  ' + r[0] + '  ' + r[1] + '  n=' + r[2] + '  ' + r[3]); });

var judgedByUnreviewed = rows.filter(function (r) { return /^UNREVIEWED/.test(r[0]); })
  .reduce(function (t, r) { return t + r[2]; }, 0);
console.log('\n§TWIN_SUMMARY pairs=' + rows.length + ' identical=' + identical + ' unreviewed=' + unreviewed +
  ' undeclared_or_broken=' + fail + ' witnesses_judging_an_unreviewed_copy=' + judgedByUnreviewed);

if (rows.length === 0) {
  console.log('🔴 W-ERP-TWIN INCONCLUSIVE — no judged twin found at all; the scan matched nothing (vacuous, not a pass)');
  process.exit(2);
}
if (fail) {
  console.log('🔴 W-ERP-TWIN FAIL (' + fail + ') — a pair declared identical has drifted, or a judged twin is undeclared');
  process.exit(1);
}
console.log('🟢 W-ERP-TWIN PASS — every pair declared identical still matches what ships; ' + unreviewed +
  ' pair(s) remain UNREVIEWED and are reported above, not silently passed');
