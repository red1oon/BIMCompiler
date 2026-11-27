#!/usr/bin/env node
// Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
// SPDX-License-Identifier: MIT
/**
 * witness_scriptor_patterns.js — keeps the Flow Row guide from lying. Spec: prompts/TEAMWORK_FRAMEWORK.md §26. Guide: docs/ReplicationFlowRows.md; catalogue: build/scriptor/patterns.json.
 *   §W-PAT-COMPILE G1 every pattern compiles with 0 problems and the expected shape   §W-PAT-PROVES G2 every cited witness arm exists in the cited file
 *   §W-PAT-GUIDE   G3 the guide's row blocks and report blocks equal the catalogue and the engine today   §W-PAT-MISTAKES G4 every documented mistake gives exactly the documented message
 *   §W-PAT-COVER   G5 every registered treatment has a pattern; every row field is explained   §W-PAT-MUTANTS each broken input must turn >= 1 arm red
 * Run: node scripts/witness_scriptor_patterns.js 2>&1 | tee build/scriptor/patterns.log
 */
'use strict';
var path = require('path'), fs = require('fs'), Better = require('better-sqlite3');
var ROOT = path.join(__dirname, '..'), SDIR = path.join(ROOT, 'build', 'scriptor'), DOC = path.join(ROOT, 'docs', 'ReplicationFlowRows.md');
var COMPILE = require(path.join(SDIR, 'compile.js')), REPORT = require(path.join(SDIR, 'report.js')), TREAT = require(path.join(SDIR, 'treat.js')), PAT = require(path.join(SDIR, 'patterns.js'));
var db = new Better(path.join(ROOT, 'build', 'erp', 'ad_full.db'), { readonly: true });
var judged = 0, fails = 0;
function say(ok, label, detail) { judged++; if (!ok) fails++; console.log('   ' + (ok ? '🟢' : '🔴') + ' ' + label + (detail ? ' — ' + detail : '')); return ok; }
function problems(res) { return res.virtualErrors.length + res.plan.reduce(function (n, f) { return n + (f.error ? 1 : 0) + (f.treatmentErrors || []).length + (f.declaredMissing || []).length; }, 0); }
function section(doc, id) { var i = doc.indexOf('### ' + id + ' '); if (i < 0) return ''; var j = doc.indexOf('\n### ', i + 5), k = doc.indexOf('\n## ', i + 5); return doc.slice(i, Math.min(j < 0 ? 1e9 : j, k < 0 ? 1e9 : k)); }
function blocks(txt, lang) { var out = [], re = new RegExp('```' + lang + '\\n([\\s\\S]*?)```', 'g'), m; while ((m = re.exec(txt))) out.push(m[1]); return out; }

function arms(cat, docText, quiet) {
  var red = [], S = quiet ? function (ok) { return ok; } : say;
  function A(n, ok, l, d) { if (!ok) red.push(n); return S(ok, l, d); }
  var used = {}, fields = {};
  if (!quiet) console.log('§W-PAT-COMPILE');
  cat.patterns.forEach(function (p) {
    var rows; try { rows = PAT.resolve(p); } catch (e) { A('G1', false, p.id + ' rows resolve', e.message); return; }
    var names = rows.map(function (r) { return r.name || r.virtualTable; });
    rows.forEach(function (r) { if (r.treatment) used[r.treatment] = 1; Object.keys(r).forEach(function (k) { fields[k] = 1; }); (r.columns || []).forEach(function (c) { Object.keys(c).forEach(function (k) { fields['col.' + k] = 1; }); }); });
    var res = COMPILE.compile(db, rows, {});
    A('G1', problems(res) === 0 && new Set(names).size === names.length, p.id + ' "' + p.name + '": ' + rows.length + ' row(s) compile with 0 problems', problems(res) + ' problem(s) · ' + REPORT.report(res).slice(-1)[0]);
  });
  var P6 = cat.patterns.filter(function (p) { return p.id === 'P6'; })[0], r6 = P6 && COMPILE.compile(db, PAT.resolve(P6), {}).plan[0];
  A('G1', !!r6 && (r6.mandatoryUncarried || []).length === 0 && r6.tableType === 'M', 'P6 (the complete team-record sample) carries every mandatory column', r6 ? 'mandatoryUncarried=' + JSON.stringify(r6.mandatoryUncarried) + ' type=' + r6.tableType : 'P6 missing');
  if (!quiet) console.log('§W-PAT-PROVES');
  cat.patterns.forEach(function (p) { p.proves.forEach(function (x) { var f = path.join(ROOT, x.witness), ok = fs.existsSync(f) && fs.readFileSync(f, 'utf8').indexOf(x.tag) >= 0; A('G2', ok, p.id + ' cites ' + x.tag + ' in ' + x.witness + (ok ? '' : ' — NOT FOUND')); }); });
  if (!quiet) console.log('§W-PAT-GUIDE');
  A('G3', docText.length > 0, 'the guide exists', DOC);
  cat.patterns.forEach(function (p) {
    var sec = section(docText, p.id), rows = PAT.resolve(p), js = blocks(sec, 'json')[0], tx = blocks(sec, 'text')[0];
    var rowsOk = false; try { rowsOk = js && JSON.stringify(JSON.parse(js)) === JSON.stringify(rows); } catch (e) {}
    A('G3', rowsOk, p.id + ': the guide\'s row block equals the catalogue rows (' + rows.length + ' row(s))');
    var now = REPORT.report(COMPILE.compile(db, rows, {})).join('\n');
    A('G3', !!tx && tx.trim() === now.trim(), p.id + ': the guide\'s "what the compiler says" block equals the engine\'s output today', tx ? '' : 'no text block');
    A('G3', docText.indexOf(p.want) >= 0, p.id + ': the "I want…" sentence is in the guide');
  });
  if (!quiet) console.log('§W-PAT-MISTAKES');
  cat.mistakes.forEach(function (m) {
    var p = cat.patterns.filter(function (x) { return x.id === m.pattern; })[0], lines;
    try { lines = REPORT.report(COMPILE.compile(db, PAT.mutate(PAT.resolve(p), m), {})); } catch (e) { lines = ['THROW ' + e.message]; }
    var hit = lines.filter(function (l) { return l.indexOf(m.say) >= 0; })[0];
    A('G4', !!hit, m.id + ' "' + m.title + '": the compiler says "' + m.say + '"', hit ? hit.trim() : 'NOT PRODUCED; got: ' + lines.filter(function (l) { return /^\s*[x!]/.test(l); }).join(' | '));
    var sec = docText.slice(docText.indexOf('#### ' + m.id + ' ')), blk = blocks(sec.slice(0, sec.indexOf('\n#### ', 5) < 0 ? 1e9 : sec.indexOf('\n#### ', 5)), 'text')[0];
    A('G4', !!hit && !!blk && blk.trim() === hit.trim(), m.id + ': the guide shows that exact line');
  });
  if (!quiet) console.log('§W-PAT-COVER');
  var unused = Object.keys(TREAT.T).filter(function (t) { return !used[t]; });
  A('G5', unused.length === 0, 'every registered treatment (' + Object.keys(TREAT.T).sort().join(',') + ') has at least one pattern', unused.length ? 'NO PATTERN: ' + unused.join(',') : '');
  var unexpl = Object.keys(fields).filter(function (k) { return docText.indexOf('`' + k.replace(/^col\./, '') + '`') < 0; });
  A('G5', unexpl.length === 0, 'every field used by a pattern row is explained in the guide (' + Object.keys(fields).length + ' fields)', unexpl.length ? 'UNEXPLAINED: ' + unexpl.join(',') : '');
  return red;
}
var DOCTEXT = fs.existsSync(DOC) ? fs.readFileSync(DOC, 'utf8') : '';
console.log('§PAT_START ' + PAT.CAT.patterns.length + ' patterns, ' + PAT.CAT.mistakes.length + ' documented mistakes; guide ' + (DOCTEXT ? DOCTEXT.length + ' bytes' : 'MISSING'));
arms(PAT.CAT, DOCTEXT, false);
console.log('§W-PAT-MUTANTS (each broken input must turn at least one arm red)');
function mut(label, fn) { var cat = PAT.clone(PAT.CAT), doc = DOCTEXT; var r = fn(cat, doc); doc = r === undefined ? doc : r; var red; try { red = arms(cat, doc, true); } catch (e) { red = ['THROW ' + e.message.slice(0, 40)]; } say(red.length > 0, label + ' -> red arms: ' + (red.length ? Array.from(new Set(red)).join(', ') : 'NONE (survivor = hole)')); }
mut('a pattern row with a typo\'d carried column', function (c) { c.patterns[5].rows[0].inline.carries[1] = 'Nmae'; });
mut('a row edited in the guide', function (c, d) { return d.replace('"group":"record"', '"group":"records"'); });
mut('a documented message changed', function (c) { c.mistakes[0].say = 'unknown columns: Qty_Entered'; });
mut('a cited witness arm renamed', function (c) { c.patterns[0].proves[0].tag = '§W-TREAT-STOCKLOOPX'; });
mut('a treatment left without a pattern (P8 LOCAL dropped)', function (c) { c.patterns = c.patterns.filter(function (p) { return p.id !== 'P8'; }); });
mut('a field explained nowhere', function (c, d) { return d.split('`schedule`').join('`sched`'); });
console.log('§PAT_VERDICT ' + (fails ? 'FAIL' : 'PASS') + ' judged=' + judged + ' fails=' + fails);
process.exit(fails ? 1 : 0);
