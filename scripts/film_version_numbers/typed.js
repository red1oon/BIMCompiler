// ⚠ DO NOT REMOVE — film 6 "CH 0 · Browser version numbers, done for you" (prompts/FILM_IMMERSIVE_SOFTWARE.md FILM 6): the ONE place the typed lines live. facts.js runs each of them for real, shoot.js types the same bytes into VS Code's own terminal panel,
// guard.js compares the three. A line never differs between the log, the picture and the check. READ out/guard.log.
'use strict';
const fs = require('fs'), path = require('path');
const SHA = { before: 'e4fa52fe', diff: 'fce8fdc4', after: 'fc2f8216' };
let H = null; try { H = JSON.parse(fs.readFileSync(path.join(__dirname, 'out', 'harm_choice.json'), 'utf8')); } catch (e) { /* probe_harm.js has not run: the lines that name the example stay null */ }
const base = H ? path.basename(H.file) : null;
exports.SHA = SHA; exports.H = H; exports.base = base;
exports.TREES = { before: '/tmp/wt-film6-before', diff: '/tmp/wt-film6-diff', after: '/tmp/wt-film6-after', old: '/tmp/wt-film6-old' };   // old = bim-ootb fc2f8216^ (the tree before B4-HASH)
exports.T = {
  // CH 1 (the DIFF tree: HEAD = fce8fdc4^, the commit's own changes staged, so Source Control shows exactly #3302)
  b1n_0: 'git diff --cached --stat | tail -1',
  b1n_1: 'git grep -n -o -E \'locale_loader.js(\\?v=|": \\{"v":)[0-9]+\' -- index.html "viewer/*.html" modeller',
  b1n_2: 'git diff --cached -U0 -- "*/sw.js" | grep "^+const"',
  // CH 1b (the BEFORE tree, e4fa52fe)
  b1b_0: 'git grep -n -o -E "import_db_builder.js\\?v=[0-9]+" e4fa52fe -- index.html viewer/viewer.html',
  // CH 3 (the AFTER tree, after the press): which files the press wrote
  b3_0: 'git diff --stat',
  // CH 4 (the AFTER tree): the code, then the hand-typed code the check refuses
  b4_0: H ? 'sha256sum ' + H.file + ' | cut -c1-8' : null,
  // PROMO scene 4 (the AFTER tree): the new checks on the OLD tree (each must fail there), then on the new tree
  s4_0: 'MANIFEST_W_OLD=/tmp/wt-film6-old node scripts/tests/witness_manifest_roundtrip.js | grep -E "MANIFEST_CLAIM id=C(2[6-9]|3[01]) " | cut -c1-30',
  s4_1: 'node scripts/tests/witness_manifest_roundtrip.js | tail -1 | grep -o "claims=[0-9/]* red=[0-9/]*"',
  b4_1: (code, bad) => 'sed -i \'s/' + base + '?v=' + code + '/' + base + '?v=' + bad + '/\' viewer/viewer.html && node scripts/gen_manifest.js --check 2>&1 | grep -E "MANIFEST_(FAIL|CHECK)"'
};
exports.BAD_CODE = '12345678';   // a code typed by hand: eight digits, not the file's
