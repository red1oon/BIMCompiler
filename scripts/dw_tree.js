// # ⚠ DO NOT REMOVE — which walker a witness runs. Issue: scripts/witness_* tested build/disc_walker.js, an older copy, so they stayed green while the shipped walker changed:
// a witness that never runs the shipped code is scope-blind (bim-compiler prompts/MODELLER_MASTER.md §WITNESS-REPOINT). This resolves the walker and its rules from one tree,
// says which commit, and refuses to judge stale code. Read the log after every run; exit code is not evidence.
// Env: DW_TREE=<tree> (default ~/bim-ootb), DW_ALLOW_STALE=1 to judge a tree behind origin/main on purpose.
'use strict';
const fs = require('fs'), path = require('path'), cp = require('child_process');
const tree = process.env.DW_TREE || path.join(process.env.HOME, 'bim-ootb');
const walker = path.join(tree, 'modeller', 'disc_walker.js');
const git = a => { try { return cp.execSync('git -C "' + tree + '" ' + a, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim(); } catch (e) { return null; } };
if (!fs.existsSync(walker)) { console.log('§DW_TREE INCONCLUSIVE no shipped walker at ' + walker + ', nothing judged'); process.exit(0); }
const commit = git('rev-parse --short HEAD'), behind = git('rev-list --count HEAD..origin/main');
console.log('§DW_TREE tree=' + tree + ' commit=' + commit + ' behindOriginMain=' + behind);
if (+behind > 0 && !process.env.DW_ALLOW_STALE) { console.log('§DW_TREE INCONCLUSIVE the tree is ' + behind + ' commits behind origin/main, nothing judged (git -C ' + tree + ' merge --ff-only origin/main)'); process.exit(0); }
module.exports = { tree, walker, rules: name => path.join(tree, 'modeller', name) };
