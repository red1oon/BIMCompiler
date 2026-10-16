#!/usr/bin/env node
// Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
// SPDX-License-Identifier: MIT
//
// # ⚠ DO NOT REMOVE — SPEC (W-BLOAT-MEASURE)
// SCOPE: one pure report — recompute the JS side of the bloat ratio cited in
//        docs/MigrateComparisonPaper.md [^bloat], and print it as one §BLOAT line.
// WHY:   the 2026-06-12 figure (28,184 LOC / 132 files / ≈51×) was measured BY HAND.
//        When it was re-checked on 2026-09-13 the basis could only be reproduced to
//        135 files against 132 — a ~2% gap that could not be closed because no script
//        pinned the method. A claim with a measurement date needs a re-run, not an
//        archaeology exercise. This is that re-run.
// METHOD (the footnote's own words, made executable):
//        "the dedup union of `build/erp` + `origin/main:erp` non-lib non-min JS",
//        tests excluded — the engine shell, not the test suite.
// RULES (each is a case in tests/witness_bloat_measure.js):
//   R1 union is deduped BY BASENAME  — a file present in both trees counts once
//   R2 build/erp wins a basename tie — it is the built artifact of record
//   R3 non-lib, non-min             — /lib/, node_modules, *.min.js never counted
//   R4 tests excluded               — /tests/, *witness*, *probe*, *poc_* are not the shell
//   R5 the Java denominator is a CONSTANT, dated, never recomputed here (different tree)
//   R6 output is one §BLOAT line, machine-greppable, plus a human table on --verbose
// NON-INVENT: every number printed is counted from a file on disk or from git; the
//        Java denominator is quoted from [^split] with its measurement date attached.
// Run:  node scripts/measure_bloat.js [--verbose] [--json]
'use strict';
const fs = require('fs'), path = require('path'), cp = require('child_process');

// R5 — measured 2026-06-08, `find … -exec cat {} + | wc -l` over ~/idempiere-dev-setup/idempiere.
// See docs/MigrateComparisonPaper.md [^split]. Not recomputed here: different tree, different date.
const JAVA = { loc: 1427147, files: 4465, measured: '2026-06-08' };
// The coder-relevant denominator: iDempiere's own M* business logic, excluding generated
// X_*/I_*, ZK UI and tests — the part a human actually reads. [^split] / §9.4 of the paper.
const JAVA_M = { loc: 104940, label: 'M* business logic (code-LOC)' };

const SKIP = [/\/lib\//, /node_modules/, /\.min\.js$/, /\/tests?\//,
              /witness/i, /probe/i, /\/poc_/, /\/fixtures\//, /spike/i];
const skip = p => SKIP.some(re => re.test(p));

function walkFs(root) {
  const out = new Map();
  if (!fs.existsSync(root)) return out;
  (function rec(d) {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) { if (!skip(p + '/')) rec(p); }
      else if (e.name.endsWith('.js') && !skip(p)) out.set(e.name, p);
    }
  })(root);
  return out;
}

function walkGit(repo, ref, prefix) {
  const out = new Map();
  let names;
  try {
    names = cp.execFileSync('git', ['-C', repo, 'ls-tree', '-r', '--name-only', ref, prefix],
                            { encoding: 'utf8' }).split('\n').filter(Boolean);
  } catch (e) {
    console.error(`§BLOAT_ERR cannot read ${ref}:${prefix} in ${repo} — ${e.message}`);
    process.exit(2);
  }
  for (const p of names) if (p.endsWith('.js') && !skip('/' + p)) out.set(path.basename(p), p);
  return out;
}

const OOTB = process.env.BIM_OOTB || path.join(process.env.HOME, 'bim-ootb');
const built = walkFs(path.join(__dirname, '..', 'build', 'erp'));   // R2: wins ties
const main = walkGit(OOTB, 'origin/main', 'erp/');

const union = new Map();                                             // R1: dedup by basename
for (const [n, p] of main) union.set(n, { from: 'ootb', p });
for (const [n, p] of built) union.set(n, { from: 'built', p });      // R2

let loc = 0; const rows = [];
for (const [n, v] of union) {
  const text = v.from === 'built'
    ? fs.readFileSync(v.p, 'utf8')
    : cp.execFileSync('git', ['-C', OOTB, 'show', 'origin/main:' + v.p], { encoding: 'utf8' });
  const n_ = text.split('\n').length - 1;
  loc += n_; rows.push({ name: n, from: v.from, loc: n_ });
}

const ratio = JAVA.loc / loc, ratioM = JAVA_M.loc / loc;
const today = new Date().toISOString().slice(0, 10);

if (process.argv.includes('--verbose')) {
  rows.sort((a, b) => b.loc - a.loc);
  console.log(`\n  built/ ${built.size}   ootb-only ${union.size - built.size}   union ${union.size}\n`);
  console.log('  largest files in the shell:');
  for (const r of rows.slice(0, 12)) console.log(`    ${String(r.loc).padStart(6)}  ${r.name}  (${r.from})`);
  console.log(`\n  vs Java total     ${JAVA.loc.toLocaleString()} LOC / ${JAVA.files} files (${JAVA.measured})  ->  ${ratio.toFixed(1)}x`);
  console.log(`  vs ${JAVA_M.label}  ${JAVA_M.loc.toLocaleString()}  ->  ${ratioM.toFixed(1)}x   <- the coder-relevant ratio\n`);
}
if (process.argv.includes('--json')) {
  console.log(JSON.stringify({ date: today, files: union.size, loc, ratio: +ratio.toFixed(1),
                               ratioVsM: +ratioM.toFixed(1), java: JAVA }, null, 1));
}
// R6 — the one greppable line. Matches the shape used by the rest of the tree.
console.log(`§BLOAT date=${today} files=${union.size} loc=${loc} ratio=${ratio.toFixed(1)}x ratio_vs_M=${ratioM.toFixed(1)}x java=${JAVA.loc}`);
