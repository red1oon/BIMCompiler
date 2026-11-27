#!/usr/bin/env node
/* ⚠ DO NOT REMOVE — Scope: W-STRANGER in a clean container, prompts/TEAMWORK_FRAMEWORK.md §50.3. READ THE LOG after every run — the exit code is not evidence.
 * THE ISSUE: G2 (§49.1) ran the fresh clone on this machine (same OS, Node, user, /home/red1 present), so a hidden dependence on this machine would still pass.
 * Judges the run made by scripts/stranger_container.sh:
 *   S1 the container's runner printed §TERMS_VERDICT PASS enforced=13 open=0 and §TERMS_PORTABLE 13/13
 *   S2 per-term status AND per engine/ootb witness verdict == the host record (browser layer excluded: the container ran --browser 0)
 *   S3 no /home/red1 path anywhere in the container's logs
 *   S4 it ran where claimed: os-release and node -v differ from the host's; /home/red1 absent inside
 *   CONTROL: the same S2 comparison against the host record with one row's status changed must FAIL (else S2 cannot fail -> INCONCLUSIVE)
 * Verdict: §SC_VERDICT PASS | FAIL | INCONCLUSIVE.   Run: node scripts/stranger_compare.js <logdir> <host terms.json> */
'use strict';
var fs = require('fs'), path = require('path');
var D = process.argv[2], HOSTJ = process.argv[3];
if (!D || !HOSTJ) { console.log('§SC_VERDICT INCONCLUSIVE usage: stranger_compare.js <logdir> <host terms.json>'); process.exit(2); }
var fails = 0, judged = 0, inc = 0;
function ok(a, c, label, d) { judged++; if (!c) fails++; console.log('   ' + (c ? 'PASS' : 'FAIL') + ' §SC-' + a + ' ' + label + (d ? ' - ' + d : '')); return c; }
function vac(a, label) { inc++; console.log('   INCONCLUSIVE §SC-' + a + ' ' + label); }
function rd(f) { try { return fs.readFileSync(path.join(D, f), 'utf8'); } catch (e) { return null; } }
function walk(d, out) { (fs.existsSync(d) ? fs.readdirSync(d) : []).forEach(function (n) { var p = path.join(d, n); if (fs.statSync(p).isDirectory()) walk(p, out); else if (/\.(log|txt|json)$/.test(n)) out.push(p); }); return out; }

var clog = rd('container.log'), host = rd('host.txt'), runner = rd('terms_runner.log'), cj = null, hj = null;
try { cj = JSON.parse(rd('terms.json')); } catch (e) {}
try { hj = JSON.parse(fs.readFileSync(HOSTJ, 'utf8')); } catch (e) {}
console.log('§SC_HEADER logdir=' + D + ' host_record=' + HOSTJ);
(clog || '').split('\n').filter(function (l) { return /^§SC_/.test(l); }).forEach(function (l) { console.log('   ' + l); });

// S1
if (!runner) vac('S1', 'no terms_runner.log (the runner did not run)');
else { var v = (runner.match(/§TERMS_VERDICT .*/) || [''])[0], p = (runner.match(/§TERMS_PORTABLE .*/) || [''])[0];
  ok('S1', /PASS enforced=13 open=0/.test(v), 'container runner verdict', v || 'no verdict line');
  ok('S1', /rows=13 portable=13 /.test(p), 'container portability', p || 'no portable line'); }

// S2
function shape(j) { var m = {}; (j.rows || []).forEach(function (r) { m[r.id] = { status: r.status, w: (r.witnesses || []).filter(function (w) { return w.layer !== 'browser'; }).map(function (w) { return w.file + '=' + w.verdict; }).sort() }; }); return m; }
function cmp(a, b) { var ids = Object.keys(b).sort(), diff = []; ids.forEach(function (id) { if (!a[id]) diff.push(id + ':missing'); else if (JSON.stringify(a[id]) !== JSON.stringify(b[id])) diff.push(id + ':' + JSON.stringify(a[id]) + '≠' + JSON.stringify(b[id])); });
  Object.keys(a).forEach(function (id) { if (!b[id]) diff.push(id + ':extra'); }); return { n: ids.length, diff: diff }; }
if (!cj || !hj) vac('S2', 'a record is missing (container=' + !!cj + ' host=' + !!hj + ')');
else { var A = shape(cj), B = shape(hj), r = cmp(A, B);
  var mut = JSON.parse(JSON.stringify(hj)); mut.rows[0].status = mut.rows[0].status === 'ENFORCED' ? 'OPEN' : 'ENFORCED'; var rc = cmp(A, shape(mut));
  if (!rc.diff.length) vac('S2', 'CONTROL: a changed host row was not detected - the comparison cannot fail');
  else { console.log('   PASS §SC-S2-CONTROL a host record with row ' + mut.rows[0].id + ' changed is detected (' + rc.diff.length + ' diff)');
    ok('S2', r.n > 0 && !r.diff.length, 'per-term status + engine/ootb witness verdicts == host record', r.n + ' rows' + (r.diff.length ? ' diff=' + r.diff.join(' | ') : '')); } }

// S3
var files = walk(D, []).filter(function (f) { return ['host.txt', 'compare.log'].indexOf(path.basename(f)) < 0 && !/^RED/.test(path.basename(f)) && f.indexOf(path.sep + 'red_empty' + path.sep) < 0; }), hits = [];
files.forEach(function (f) { var t = fs.readFileSync(f, 'utf8').split('\n').filter(function (l) { return !/^§SC_ENV /.test(l); }).join('\n'); if (t.indexOf('/home/red1') >= 0) hits.push(path.relative(D, f)); });      // the script's own '/home/red1 absent' probe line is not a path read
if (!files.length) vac('S3', 'no container log files to search'); else ok('S3', !hits.length, 'no /home/red1 path in ' + files.length + ' container log files', hits.length ? 'found in ' + hits.slice(0, 5).join(', ') : '');

// S4
var env = ((clog || '').match(/§SC_ENV os=(.*) node=(\S+)/) || []), hos = ((host || '').match(/os=(.*) node=(\S+)/) || []);
if (!env.length || !hos.length) vac('S4', 'environment lines missing');
else { ok('S4', env[1] !== hos[1], 'different OS', 'container="' + env[1] + '" host="' + hos[1] + '"');
  ok('S4', env[2] !== hos[2], 'different Node', 'container=' + env[2] + ' host=' + hos[2]);
  ok('S4', /\/home\/red1 absent/.test(clog), '/home/red1 absent inside the container', ''); }

var verdict = fails ? 'FAIL' : (inc || !judged) ? 'INCONCLUSIVE' : 'PASS';
console.log('§SC_VERDICT ' + verdict + ' judged=' + judged + ' fails=' + fails + ' inconclusive=' + inc + ' (a container on this machine: same kernel, CPU and network - NOT another machine)');
process.exit(verdict === 'PASS' ? 0 : 1);
