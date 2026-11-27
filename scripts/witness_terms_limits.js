#!/usr/bin/env node
/* ⚠ DO NOT REMOVE — Scope: W-TERMS-LIMITS, prompts/TEAMWORK_FRAMEWORK.md §51.3 (C4 generated limits). READ THE LOG after every run — the exit code is not evidence.
 * THE ISSUE: stated limits lived as hand prose in scripts/witness_terms.js, a repo away from the witness that tests them, and went stale (#2488).
 * After C4 a witness prints `§LIMIT <text>` / `§LIMIT term=<row> <text>`; the runner copies them into row.limits and refuses a hand-written limit in a note.
 * Runs the REAL runner in --reuse 1 mode over a COPY of a log dir (nothing re-runs; the copy can be doctored).
 *   L1 each row gets exactly the §LIMIT lines its witnesses printed (term= filtered), and at least one row has some (else VACUOUS)
 *   L2 a §LIMIT line deleted from a copied witness log is gone from the record
 *   L3 a term=<other row> limit planted in a copied log is not attached to rows it does not name, and IS attached to the row it names
 *   L4 a runner copy with a hand-written "Limits:" note prints §TERMS_DEFECT hand-limit and the verdict is FAIL
 *   L5 no note in the real runner contains "limit"
 * Verdict: §TL_VERDICT PASS | FAIL | INCONCLUSIVE.   Run: node scripts/witness_terms_limits.js <terms log dir> [--ootb dir] | tee <log> */
'use strict';
var fs = require('fs'), path = require('path'), os = require('os'), cp = require('child_process');
var ARGS = process.argv.slice(2), SRC = ARGS[0], OI = ARGS.indexOf('--ootb'), OOTB = OI >= 0 ? ARGS[OI + 1] : path.join(os.homedir(), 'bim-ootb');
var ROOT = path.resolve(__dirname, '..'), RUNNER = path.join(__dirname, 'witness_terms.js');
var fails = 0, judged = 0, inc = 0;
function ok(a, c, label, d) { judged++; if (!c) fails++; console.log('   ' + (c ? 'PASS' : 'FAIL') + ' §TL-' + a + ' ' + label + (d ? ' - ' + d : '')); return c; }
function vac(a, label) { inc++; console.log('   INCONCLUSIVE §TL-' + a + ' ' + label + ' (nothing was judged)'); }
if (!SRC || !fs.existsSync(SRC)) { console.log('§TL_VERDICT INCONCLUSIVE no terms log dir given (node scripts/witness_terms_limits.js <terms log dir>)'); process.exit(2); }

function copyLogs() { var d = fs.mkdtempSync(path.join(os.tmpdir(), 'tl_')); fs.readdirSync(SRC).filter(function (f) { return /\.log$/.test(f); }).forEach(function (f) { fs.copyFileSync(path.join(SRC, f), path.join(d, f)); }); return d; }
function run(runner, logs, extra) { var j = path.join(logs, '_record.json');
  var r = cp.spawnSync(process.execPath, [runner, '--reuse', '1', '--logs', logs, '--json', j, '--ootb', OOTB].concat(extra || []), { cwd: ROOT, encoding: 'utf8', timeout: 300000 });
  var rec = null; try { rec = JSON.parse(fs.readFileSync(j, 'utf8')); } catch (e) {} return { out: (r.stdout || '') + (r.stderr || ''), rec: rec }; }
// the limits a row SHOULD carry, read straight from its witness logs (the expectation is derived from the logs, not from the runner)
function expected(rec, logs) { var m = {}; (rec.rows || []).forEach(function (row) { var seen = {}, out = [];
  (row.witnesses || []).forEach(function (w) { var t = ''; try { t = fs.readFileSync(path.join(logs, path.basename(w.log || '')), 'utf8'); } catch (e) {}
    t.split('\n').forEach(function (l) { var x = /^\s*§LIMIT (?:term=(\S+) )?(.+?)\s*$/.exec(l); if (!x || (x[1] && x[1] !== row.id) || seen[x[2]]) return; seen[x[2]] = 1; out.push(x[2]); }); });
  m[row.id] = out.sort(); }); return m; }
function got(rec) { var m = {}; (rec.rows || []).forEach(function (r) { m[r.id] = (r.limits || []).map(function (l) { return l.text; }).sort(); }); return m; }
function nLimitLines(logs) { var n = 0; fs.readdirSync(logs).forEach(function (f) { if (/\.log$/.test(f)) n += (fs.readFileSync(path.join(logs, f), 'utf8').match(/^\s*§LIMIT /mg) || []).length; }); return n; }

console.log('§TL_HEADER W-TERMS-LIMITS src=' + SRC + ' ootb=' + OOTB + ' runner=' + RUNNER);
// L1
var d1 = copyLogs(), r1 = run(RUNNER, d1);
if (!r1.rec) vac('L1', 'the runner wrote no record: ' + r1.out.slice(-300));
else { var E = expected(r1.rec, d1), G = got(r1.rec), tot = Object.keys(E).reduce(function (t, k) { return t + E[k].length; }, 0), bad = Object.keys(E).filter(function (k) { return JSON.stringify(E[k]) !== JSON.stringify(G[k]); });
  if (!tot) vac('L1', 'no witness log in ' + SRC + ' prints a §LIMIT line (' + nLimitLines(d1) + ' lines)');
  else ok('L1', !bad.length, 'every row carries exactly the §LIMIT lines its witnesses printed', tot + ' limits over ' + Object.keys(E).filter(function (k) { return E[k].length; }).length + ' rows' + (bad.length ? ' differ: ' + bad.map(function (k) { return k + ' want ' + E[k].length + ' got ' + (G[k] || []).length; }).join('; ') : ''));
  console.log('   ' + (r1.out.match(/§TERMS_LIMITS .*/g) || ['(no §TERMS_LIMITS line)']).join('\n   ')); }
// L2
var d2 = copyLogs(), victim = fs.readdirSync(d2).filter(function (f) { return /\.log$/.test(f) && /^\s*§LIMIT /m.test(fs.readFileSync(path.join(d2, f), 'utf8')); })[0];
if (!victim) vac('L2', 'no copied log has a §LIMIT line to delete');
else { var t2 = fs.readFileSync(path.join(d2, victim), 'utf8'), line = t2.split('\n').filter(function (l) { return /^\s*§LIMIT /.test(l); })[0], txt = /^\s*§LIMIT (?:term=\S+ )?(.+?)\s*$/.exec(line)[1];
  fs.writeFileSync(path.join(d2, victim), t2.split('\n').filter(function (l) { return l !== line; }).join('\n'));
  var r2 = run(RUNNER, d2), still = r2.rec ? (r2.rec.rows || []).filter(function (r) { return (r.limits || []).some(function (l) { return l.text === txt; }); }).map(function (r) { return r.id; }) : null;
  if (!r2.rec) vac('L2', 'no record'); else ok('L2', still.length === 0, 'a §LIMIT deleted from ' + victim + ' is gone from the record', '"' + txt.slice(0, 60) + '…" still on: ' + (still.join(',') || 'none')); }
// L3
var d3 = copyLogs(), host = r1.rec && (r1.rec.rows || []).filter(function (r) { return (r.witnesses || []).length; }), PL = 'PLANTED-L3 limit for one row only';
if (!host || host.length < 2) vac('L3', 'fewer than two rows with witnesses');
else { var target = host[0], wlog = path.basename(target.witnesses[0].log), sharers = host.filter(function (r) { return r.witnesses.some(function (w) { return path.basename(w.log) === wlog; }); }).map(function (r) { return r.id; });
  var other = host.filter(function (r) { return sharers.indexOf(r.id) < 0; })[0];
  fs.appendFileSync(path.join(d3, wlog), '\n§LIMIT term=' + target.id + ' ' + PL + '\n§LIMIT term=' + (other ? other.id : 'no-such-row') + ' ' + PL + ' (other)\n');
  var r3 = run(RUNNER, d3), on = r3.rec ? (r3.rec.rows || []).filter(function (r) { return (r.limits || []).some(function (l) { return l.text.indexOf(PL) === 0; }); }).map(function (r) { return r.id + (r.limits.some(function (l) { return / \(other\)$/.test(l.text); }) ? '(other!)' : ''); }) : null;
  if (!r3.rec) vac('L3', 'no record'); else ok('L3', on.length === 1 && on[0] === target.id, 'a term= limit lands on the row it names only (log ' + wlog + ' is shared by ' + sharers.join(',') + ')', 'attached to: ' + (on.join(',') || 'none')); }
// L4
var rc = fs.readFileSync(RUNNER, 'utf8'), needle = "note: 'TEAMWORK §46.5 versioning Stage 2", n4 = rc.split(needle).length - 1;
if (n4 !== 1) vac('L4', 'needle for the planted hand limit found ' + n4 + ' times (must be 1)');
else { var mr = path.join(path.dirname(RUNNER), '_tl_mutant_runner.js'); fs.writeFileSync(mr, rc.replace(needle, "note: 'Limits: a hand-written limit. TEAMWORK §46.5 versioning Stage 2"));
  try { var r4 = run(mr, copyLogs()); var def = /§TERMS_DEFECT hand-limit row=key-roles-threshold/.test(r4.out), v = (r4.out.match(/§TERMS_VERDICT (\S+)/) || [])[1];
    ok('L4', def && v === 'FAIL', 'a hand-written limit in a note is refused (defect line + verdict FAIL)', 'defect=' + def + ' verdict=' + v); } finally { fs.unlinkSync(mr); } }
// L5
var notes = []; rc.replace(/note: '((?:[^'\\]|\\.)*)'/g, function (m, t) { notes.push(t); return m; });
if (!notes.length) vac('L5', 'no note in the runner'); else { var hl = notes.filter(function (t) { return /limit/i.test(t); }); ok('L5', !hl.length, 'no note in the real runner holds a limit (' + notes.length + ' notes)', hl.map(function (t) { return '"' + t.slice(0, 50) + '…"'; }).join(' ')); }

var verdict = fails ? 'FAIL' : (inc || !judged) ? 'INCONCLUSIVE' : 'PASS';
console.log('§TL_VERDICT ' + verdict + ' judged=' + judged + ' fails=' + fails + ' inconclusive=' + inc);
process.exit(verdict === 'PASS' ? 0 : 1);
