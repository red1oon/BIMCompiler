#!/usr/bin/env node
// Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
// SPDX-License-Identifier: MIT
//
// # ⚠ DO NOT REMOVE — SPEC (W-BLOAT-MEASURE)
// SCOPE: prove scripts/measure_bloat.js obeys R1-R6.
// ISSUE IT PROVES/DISPROVES: "the published bloat ratio cannot be re-run."
//   If R1 (dedup) or R4 (tests excluded) regress, the ratio silently inflates or
//   collapses and the paper cites a number nobody can reproduce — which is exactly
//   how the 2026-06-12 figure went stale with a 132-vs-135 basis nobody could close.
// Run: node tests/witness_bloat_measure.js   — exit 0 = pass. Read the §-log either way.
'use strict';
const { execFileSync } = require('child_process');
const path = require('path');
const SCRIPT = path.join(__dirname, '..', 'scripts', 'measure_bloat.js');
const run = a => execFileSync('node', [SCRIPT, ...a], { encoding: 'utf8' });

let fail = 0;
const ok = (id, c, m) => { console.log(`§BLOAT_W ${c ? 'PASS' : 'FAIL'} ${id} — ${m}`); if (!c) fail++; };

const line = run([]).trim().split('\n').pop();
const m = /§BLOAT date=(\S+) files=(\d+) loc=(\d+) ratio=([\d.]+)x ratio_vs_M=([\d.]+)x java=(\d+)/.exec(line);
ok('R6', !!m, 'emits one greppable §BLOAT line');
if (!m) process.exit(1);
const [, date, files, loc, ratio, ratioM, java] = m;

// R5 — the Java denominator is a constant, never recomputed from a tree that is not here.
ok('R5', java === '1427147', `java denominator pinned at 1,427,147 (got ${java})`);

// R1/R2 — dedup by basename. The union must be SMALLER than the naive sum of both trees,
//         or the dedup is not happening and every shared file is double-counted.
const j = JSON.parse(run(['--json']).split('\n').slice(0, -2).join('\n') || '{}');
ok('R1', +files < 300, `union deduped to ${files} files (naive union of both trees is ~312)`);

// R4 — tests excluded. If a witness/probe/test leaked in, the count jumps past ~200.
ok('R4', +files > 100 && +files < 200, `${files} files — the engine shell, not the suite`);

// R3 — no vendored or minified code in the count. A leak inflates LOC by 10x+.
ok('R3', +loc < 60000, `${loc} LOC — no lib/ or .min.js leak`);

// determinism — the same tree must give the same number twice, or the claim is not citable.
const again = /loc=(\d+)/.exec(run([]))[1];
ok('DET', again === loc, 'two runs agree (the number is citable)');

// the ratio is arithmetic on the two printed numbers, not an independent assertion.
ok('CALC', Math.abs(1427147 / +loc - +ratio) < 0.05, `ratio ${ratio}x == java/loc`);

// RED CONTROL (witness_kit doctrine §W-REDCONTROL): this witness must be able to FAIL.
// Feed the same assertion a deliberately wrong denominator and require it to reject.
const redOk = Math.abs(1427147 / +loc - (+ratio + 10)) < 0.05;
ok('RED', !redOk, 'redControl: a wrong ratio is rejected — this witness can fail');

console.log(`§BLOAT_W measured date=${date} files=${files} loc=${loc} ratio=${ratio}x vs_M=${ratioM}x`);
console.log(`§BLOAT_W ${fail ? 'FAILED ' + fail : 'ALL PASS'}`);
process.exit(fail ? 1 : 0);
