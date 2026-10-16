#!/usr/bin/env node
// tm_gating_body_diff.js — §GATE_GUARD_BODY extension for time_machine.js (2026-08-14,
// prompts/4D_SCHEDULE_PERFECTION.md §TIER_REGATE_WORKLIST's named follow-up).
//
// schedule_gate.js's existing body-fix (gate_4d.sh, §GATE_GUARD_BODY) treats ANY added
// non-comment line as a gating change, because that whole file IS the gating engine. time_machine.js
// is not — it holds camera/UI/other code alongside the gating functions, so the same file-wide
// treatment would false-positive on every unrelated time_machine.js edit. This scopes the same
// "added non-comment line" check to just the gating functions' own bodies, located by brace-matching
// (the same sliceFn technique probe_tier_regate_worklist.js uses to slice them for A/B) — so a
// body-only rewrite (signature line untouched) is caught without flagging unrelated edits elsewhere
// in the file. Verified against the real #1348 diff (14c042b...d6647f4): the old signature-only
// heuristic reports gating_touched=0 on a 120-line _tierAuditRegate body rewrite; this script reports
// >0 on the same diff.
//
// Usage: node scripts/tm_gating_body_diff.js <VIEWER_DIR> <BASE_REF> [HEAD_REF]
// HEAD_REF defaults to 'HEAD' (production use, gate_4d.sh's normal call). Pass an explicit ref to
// verify against an arbitrary historical range (e.g. this file's own §VERIFY block) without touching
// the worktree's checkout.
// Prints a single integer (count of added non-comment lines inside gating function bodies) to stdout.
'use strict';
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const VIEWER_DIR = process.argv[2];
const BASE = process.argv[3];
const HEAD = process.argv[4] || 'HEAD';
const GATING_FNS = ['_tierAuditRegate', '_twoTierRemap', '_midairRepair', '_tier1Serialize'];

function fnLineRange(src, name) {
  const idx = src.indexOf('function ' + name + '(');
  if (idx < 0) return null;
  let depth = 0, i = idx, seenOpen = false;
  for (; i < src.length; i++) {
    if (src[i] === '{') { depth++; seenOpen = true; }
    else if (src[i] === '}') { depth--; if (seenOpen && depth === 0) break; }
  }
  return [src.slice(0, idx).split('\n').length, src.slice(0, i + 1).split('\n').length];
}

const src = HEAD === 'HEAD'
  ? fs.readFileSync(path.join(VIEWER_DIR, 'time_machine.js'), 'utf8')
  : execFileSync('git', ['-C', VIEWER_DIR, 'show', HEAD + ':./time_machine.js'], { maxBuffer: 1 << 28 }).toString('utf8');
const ranges = GATING_FNS.map((n) => fnLineRange(src, n)).filter(Boolean);

const diff = execFileSync('git', ['-C', VIEWER_DIR, 'diff', BASE + '...' + HEAD, '--', 'time_machine.js'],
  { maxBuffer: 1 << 28 }).toString('utf8');

let newLine = 0, count = 0;
for (const line of diff.split('\n')) {
  const hunk = line.match(/^@@ -\d+(?:,\d+)? \+(\d+)(?:,\d+)? @@/);
  if (hunk) { newLine = parseInt(hunk[1], 10); continue; }
  if (line.startsWith('+++') || line.startsWith('---')) continue;
  if (line.startsWith('+')) {
    const trimmed = line.slice(1).trim();
    const inRange = ranges.some(([s, e]) => newLine >= s && newLine <= e);
    if (inRange && trimmed !== '' && !/^(\/\/|\/\*|\*)/.test(trimmed)) count++;
    newLine++;
  } else if (line.startsWith(' ')) {
    newLine++;
  }
  // '-' lines: old-file-only, don't advance newLine.
}
process.stdout.write(String(count) + '\n');
