#!/usr/bin/env node
/**
 * BIM OOTB — Frictionless BIM. Two DBs. One browser. Zero install.
 * Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
 * SPDX-License-Identifier: MIT
 */
// witness_blank_viewer_card.js — proves prompts/Viewer/BLANK_VIEWER_LANDING_CARD.md landed.
// Whitebox/static (no page.goto — this project reads §-tagged source, not live-browser value checks,
// see docs/TestArchitecture.md §Browser Testing). Usage: node deploy/dev/tests/witness_blank_viewer_card.js
// Output: deploy/dev/tests/witness_blank_viewer_card.log

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const REPO = path.resolve(__dirname, '..', '..', '..');
const DEV = path.join(REPO, 'deploy', 'dev');
const LOG_FILE = path.join(__dirname, 'witness_blank_viewer_card.log');
const log = [];
let pass = 0, fail = 0;
function emit(msg) { log.push(msg); console.log(msg); }
function ok(test, detail) { pass++; emit(`  PASS §${test} — ${detail}`); }
function ng(test, detail) { fail++; emit(`  FAIL §${test} — ${detail}`); }

emit(`§BLANK_VIEWER_CARD_TEST — ${new Date().toISOString()}`);

// 1. Syntax-check every edited/added JS file
const jsFiles = ['config.js', 'streaming.js', 'main.js', 'blank_open.js'];
for (const f of jsFiles) {
  const p = path.join(DEV, f);
  try {
    execFileSync('node', ['--check', p], { stdio: 'pipe' });
    ok('SYNTAX', `${f} parses`);
  } catch (e) {
    ng('SYNTAX', `${f} — ${e.stderr ? e.stderr.toString().split('\n')[0] : e.message}`);
  }
}

// SYSNOVA/index.html inline scripts syntax-check
const sysnovaPath = path.join(REPO, 'SYSNOVA', 'index.html');
const sysnova = fs.readFileSync(sysnovaPath, 'utf8');
const scripts = [...sysnova.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);
try {
  scripts.forEach(s => new Function(s));
  ok('SYNTAX', `SYSNOVA/index.html — ${scripts.length} inline <script> blocks parse`);
} catch (e) {
  ng('SYNTAX', `SYSNOVA/index.html inline script — ${e.message}`);
}

// 2. Landing card wired
if (/function\s+buildBlankCard/.test(sysnova)) ok('LANDING_CARD', 'buildBlankCard() defined');
else ng('LANDING_CARD', 'buildBlankCard() missing');
if (/function\s+openBlankViewer/.test(sysnova)) ok('LANDING_CARD', 'openBlankViewer() defined');
else ng('LANDING_CARD', 'openBlankViewer() missing');
if (/sandbox\/index\.html\?blank=1|viewerUrl \+ '\?blank=1'/.test(sysnova)) ok('LANDING_CARD', 'openBlankViewer targets ?blank=1');
else ng('LANDING_CARD', '?blank=1 URL not found');
if (/buildBlankCard\(_instantGridEarly\)/.test(sysnova) && /_instantGridEarly[\s\S]{0,80}try\s*\{/.test(sysnova))
  ok('LANDING_CARD', 'blank card built before the manifest fetch (survives manifest failure)');
else ng('LANDING_CARD', 'blank card not confirmed independent of manifest fetch');

// 3. config.js BLANK_MODE gates the Duplex fallback
const configJs = fs.readFileSync(path.join(DEV, 'config.js'), 'utf8');
if (/A\.BLANK_MODE\s*=\s*_params\.get\('blank'\)\s*===\s*'1'/.test(configJs)) ok('CONFIG', 'A.BLANK_MODE parsed from ?blank=1');
else ng('CONFIG', 'A.BLANK_MODE parsing not found');
if (/A\.BLANK_MODE\s*\?\s*''\s*:/.test(configJs)) ok('CONFIG', 'A.DB_URL skips Duplex_extracted.db fallback when blank');
else ng('CONFIG', 'DB_URL fallback not gated on BLANK_MODE');

// 4. streaming.js early-return before the HEAD fetch
const streamingJs = fs.readFileSync(path.join(DEV, 'streaming.js'), 'utf8');
const blankGuardIdx = streamingJs.indexOf('A.BLANK_MODE && !A.DB_URL');
const headFetchIdx = streamingJs.indexOf("fetch(A.DB_URL, { method: 'HEAD' })");
if (blankGuardIdx > -1 && headFetchIdx > -1 && blankGuardIdx < headFetchIdx)
  ok('STREAMING', 'blank-mode early return precedes the single-DB HEAD fetch');
else ng('STREAMING', `guard=${blankGuardIdx} headFetch=${headFetchIdx} — ordering not confirmed`);
if (/A\._SQL \|\| await initSqlJs/.test(streamingJs)) ok('STREAMING', 'initSqlJs guarded for re-entry from blank_open.js');
else ng('STREAMING', 'initSqlJs re-entry guard missing');

// 5. blank_open.js present, exports setupBlankOpen/A.openLocalFile, wired into main.js + index.html
const blankOpenPath = path.join(DEV, 'blank_open.js');
if (fs.existsSync(blankOpenPath)) {
  const blankOpenJs = fs.readFileSync(blankOpenPath, 'utf8');
  ok('BLANK_OPEN', 'blank_open.js exists');
  if (/function\s+setupBlankOpen\s*\(A\)/.test(blankOpenJs)) ok('BLANK_OPEN', 'setupBlankOpen(A) defined');
  else ng('BLANK_OPEN', 'setupBlankOpen(A) missing');
  if (/A\.openLocalFile\s*=\s*async function/.test(blankOpenJs)) ok('BLANK_OPEN', 'A.openLocalFile defined');
  else ng('BLANK_OPEN', 'A.openLocalFile missing');
} else {
  ng('BLANK_OPEN', 'blank_open.js not found');
}
const mainJs = fs.readFileSync(path.join(DEV, 'main.js'), 'utf8');
if (/setupBlankOpen\(APP\)/.test(mainJs)) ok('BLANK_OPEN', 'setupBlankOpen(APP) registered in main.js');
else ng('BLANK_OPEN', 'setupBlankOpen(APP) not registered in main.js');
const indexHtml = fs.readFileSync(path.join(DEV, 'index.html'), 'utf8');
if (/<script src="blank_open\.js/.test(indexHtml)) ok('BLANK_OPEN', 'blank_open.js <script> included in index.html');
else ng('BLANK_OPEN', 'blank_open.js not <script>-included in index.html');

// 6. Overlay markup
if (/id="blank-open-overlay"/.test(indexHtml) && /id="blank-open-input"/.test(indexHtml))
  ok('OVERLAY', '#blank-open-overlay + #blank-open-input present in index.html');
else ng('OVERLAY', 'overlay markup missing');

emit(`\n${pass} PASS, ${fail} FAIL`);
fs.writeFileSync(LOG_FILE, log.join('\n') + '\n');
process.exit(fail > 0 ? 1 : 0);
