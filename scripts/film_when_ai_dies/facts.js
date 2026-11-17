// ⚠ DO NOT REMOVE — SCOPE: film "When AI Dies" (prompts/FILM_WHEN_AI_DIES.md). The facts of the film, none typed by hand: the verdict lines of X0 Navigator's own witnesses run on the clean bim-ootb origin/main tree
//   (out/witness_*.log; a log that already holds its verdict line is reused, not re-run: one heavy job at a time), offline.js (the honest no-network proof), erp_shot.js (the real ERP page hover) and the PR states read from GitHub.
//   facts.json is what narr.js speaks and cards.js shows; guard.js re-checks it against the raw logs. READ out/facts.log: exit code is not evidence.
// Usage: node facts.js <bim-ootb tree> <bim-compiler tree>
'use strict';
const fs = require('fs'), path = require('path'), { spawnSync } = require('child_process');
const TREE = path.resolve(process.argv[2]), COMP = path.resolve(process.argv[3] || path.join(__dirname, '..', '..')), OUT = path.join(__dirname, 'out'); fs.mkdirSync(OUT, { recursive: true });
const L = m => console.log('§FACTS ' + m), fail = m => { L('FAIL ' + m); process.exit(1); };
const T = 'devtools/vscode/x0-navigator/tests/';
const W = [   // name, command (relative to the tree), the verdict line, and whether the film's PASS depends on it
  ['refs', [T + 'witness_x0_refs.js'], /^§X0_REFS .*verdict=(\w+)/m, true], ['core_pure', [T + 'witness_x0_core_pure.js'], /^§X0_CORE_PURE_W .*verdict=(\w+)/m, true],
  ['isolation', [T + 'witness_x0_isolation.js'], /^§X0_ISOLATION .*verdict=(\w+)/m, true], ['lens', [T + 'witness_x0_lens.js'], /^§LENS shown=.*verdict=(\w+)/m, true],
  ['context', [T + 'witness_x0_context.js'], /^§X0_CONTEXT header=.*verdict=(\w+)/m, true], ['taghover', [T + 'witness_x0_taghover.js', '--compiler-root', COMP], /^§DEVTK_SPEC .*verdict=(\w+)/m, true],
  ['bump_button', [T + 'witness_x0_bump_button.js'], /^§X0_BUMP_BUTTON .*verdict=(\w+)/m, true], ['bump_parity', ['tests/witness_bump_parity.js'], /^§BUMP_PARITY_W_VERDICT (\w+)/m, true],
  ['erp_hover', ['devtools/hover/tests/witness_erp_hover.js'], /^§ERP_HOVER_W VERDICT (\w+)/m, true],
  ['realvsc', [T + 'realvsc/run.js', '--go', '--compiler-root', COMP], /^§X0_REALVSC .*verdict=(\w+)/m, true],
  ['mcp', ['devtools/mcp/x0-facts/tests/witness_x0_mcp.js'], /^§X0_MCP .*verdict=(\w+)/m, false]];   // the facts server is not shown by the film (its witness is red on main: reported, not cited)
const F = { made: new Date().toISOString(), commit: spawnSync('git', ['-C', TREE, 'rev-parse', '--short', 'HEAD'], { encoding: 'utf8' }).stdout.trim(), tree: TREE, witness: {} };
const dirty = spawnSync('git', ['-C', TREE, 'status', '--porcelain', '-uno'], { encoding: 'utf8' }).stdout.trim(); if (dirty) fail('the bim-ootb tree is not clean: ' + dirty.split('\n')[0]);
const origin = spawnSync('git', ['-C', TREE, 'rev-parse', '--short', 'origin/main'], { encoding: 'utf8' }).stdout.trim(); F.originMain = origin; L('tree commit=' + F.commit + ' origin/main=' + origin);
let ok = true;
for (const [name, args, re, needed] of W) {
  const log = path.join(OUT, 'witness_' + (name === 'realvsc' ? 'x0_realvsc' : name === 'erp_hover' ? 'erp_hover' : name === 'bump_parity' ? 'bump_parity' : name === 'mcp' ? 'x0_mcp' : 'x0_' + name) + '.log'); let txt = fs.existsSync(log) ? fs.readFileSync(log, 'utf8') : '';
  if (!re.test(txt)) { const r = spawnSync('nice', ['-n', '19', process.execPath, ...args], { cwd: TREE, encoding: 'utf8', maxBuffer: 1 << 28, timeout: 1800000, input: '' }); txt = (r.stdout || '') + (r.stderr || ''); fs.writeFileSync(log, txt); L('witness ' + name + ' ran'); } else L('witness ' + name + ' reused ' + path.relative(__dirname, log));
  const m = re.exec(txt); if (!m) fail('witness ' + name + ' printed no verdict line'); const line = (txt.split('\n').find(l => re.test(l)) || '').trim();
  F.witness[name] = { verdict: m[1], line, log: path.relative(__dirname, log), needed }; L('  ' + name + ' ' + m[1] + ' | ' + line.slice(0, 200)); if (needed && m[1] !== 'PASS') ok = false;
}
// the offline proof
const o = spawnSync(process.execPath, [path.join(__dirname, 'offline.js'), TREE], { encoding: 'utf8' }); fs.writeFileSync(path.join(OUT, 'offline.log'), o.stdout + o.stderr);
const off = JSON.parse(fs.readFileSync(path.join(OUT, 'offline.json'), 'utf8')); F.offline = off; F.offline.line = (o.stdout.split('\n').find(l => /^§X0_OFFLINE files=/.test(l)) || '').trim(); L(F.offline.line); if (off.verdict !== 'PASS') ok = false;
// the ERP page (erp_shot.js ran before: its json is the evidence)
const E = JSON.parse(fs.readFileSync(path.join(OUT, 'erp.json'), 'utf8')); if (E.errors.length || !E.openedLink) fail('erp_shot.js did not finish: ' + E.errors[0]); F.erp = { table: E.table, column: E.column, layers: E.layers.length, lined: E.layers.filter(l => l.at).length, key: E.keyPressed, opened: E.openedLink.replace(TREE, '<bim-ootb>'), pickedAt: E.pickedAt, hoverLine: E.hoverLine, pageErrors: E.pageErrors.length };
L('erp ' + JSON.stringify(F.erp));
// credentials: the PRs this film shows, read from GitHub
const pr = n => { const r = spawnSync('gh', ['pr', 'view', String(n), '-R', 'red1oon/bim-ootb', '--json', 'state,title', '-q', '.state + " " + .title'], { encoding: 'utf8' }); return (r.stdout || '').trim(); };
const PRS = { 2985: 'Find All References', 3055: 'ERP field hover', 2970: 'tag hover: last value', 3209: 'core-purity warning', 3162: 'the Bump button', 2966: 'Context for this file' };
F.prs = {}; for (const n of Object.keys(PRS)) { F.prs[n] = { what: PRS[n], state: pr(n) }; if (!/^MERGED/.test(F.prs[n].state)) ok = false; }
L('prs ' + JSON.stringify(F.prs)); F.licence = fs.readFileSync(path.join(TREE, 'LICENSE'), 'utf8').split('\n')[0].trim(); if (F.licence !== 'MIT License') ok = false;
fs.writeFileSync(path.join(OUT, 'facts.json'), JSON.stringify(F, null, 1)); L('VERDICT ' + (ok ? 'PASS' : 'FAIL')); process.exit(ok ? 0 : 1);
