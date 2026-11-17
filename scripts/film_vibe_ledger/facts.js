// ⚠ DO NOT REMOVE — SCOPE: film "Vibe coding, honestly" (prompts/FILM_VIBE_CODING_LEDGER.md). The facts of the film, none typed by hand: every line the strip types is RUN here on its pinned tree and its real
//   output is saved (out/cmd_<id>.txt) as the strip's answer; every other value is read from a named file or GitHub, with the regex that found it. facts.json is what narr.js speaks and cards.js shows;
//   guard.js re-checks it. READ out/facts.log: exit code is not evidence.
// Usage: OOTB=<bim-ootb tree> COMP=<bim-compiler tree> IDEM=<iDempiere source> PARITY_LOG=<run_all log> node facts.js
'use strict';
const fs = require('fs'), path = require('path'), { spawnSync } = require('child_process');
const OUT = path.join(__dirname, 'out'); fs.mkdirSync(path.join(OUT, 'prior'), { recursive: true });
const need = k => { const v = process.env[k]; if (!v || !fs.existsSync(v)) { console.log('§FACTS FAIL env ' + k + ' missing or not on disk: ' + v); process.exit(1); } return path.resolve(v); };
const TREES = { T: need('OOTB'), C: need('COMP'), I: need('IDEM') }, PLOG = need('PARITY_LOG');
const L = m => console.log('§FACTS ' + m), fail = m => { L('FAIL ' + m); process.exit(1); };
const sh = (cwd, cmd, env) => { const r = spawnSync('nice', ['-n', '19', 'bash', '-c', cmd], { cwd, encoding: 'utf8', maxBuffer: 1 << 28, timeout: 900000, input: '', env: Object.assign({}, process.env, env || {}) });
  return { out: (r.stdout || '').replace(/\s+$/, ''), err: (r.stderr || '').trim(), code: r.status }; };
const F = { made: new Date().toISOString(), trees: {}, cmds: {}, v: {} };
for (const k of Object.keys(TREES)) { const c = sh(TREES[k], 'git rev-parse --short HEAD').out; F.trees[k] = { path: TREES[k], commit: c, dirty: sh(TREES[k], "git status --porcelain -uno -- . ':!scripts/film_vibe_ledger'").out.split('\n').filter(Boolean).length }; }
L('trees ' + JSON.stringify(F.trees)); if (F.trees.T.dirty || F.trees.C.dirty) fail('a pinned tree is not clean');
const put = (k, val, src) => { if (val === undefined || val === null || val === '' || (typeof val === 'number' && isNaN(val))) fail('no value for ' + k + ' (' + src + ')'); F.v[k] = { val: String(val), src }; L('v ' + k + '=' + val + ' | ' + src); };
const grab = (re, txt, what) => { const m = re.exec(txt); if (!m) fail('not found in ' + what + ': ' + re); return m; };
// 1. the typed lines: [id, tree, typed text, env]; the typed text IS the command run (env vars are shown as typed)
const CMDS = [
  ['after', 'T', 'git rev-list --count HEAD'],
  ['u1', 'T', "node -p \"require('./package.json').dependencies\""],
  ['u2', 'T', "node erp/tests/witness_roster_verify.js | tail -1"],
  ['v1', 'T', 'git log --since=2026-06-01 --until=2026-07-01 --oneline -- erp | wc -l'],
  ['v2', 'T', "git ls-files | grep -cE 'witness[^/]*\\.js$'"],
  ['s1', 'C', "bash scripts/code_arch/size_stack.sh $OOTB | grep -E 'set=(app_js|app_html|witness_js|vendored_js) '", { OOTB: TREES.T }],
  ['l1', 'I', "find . -name '*.java' -not -path '*/target/*' -print0 | xargs -0 cat | wc -l"],
  ['l2', 'T', "gh api repos/odoo/odoo/languages --jq 'to_entries | sort_by(-.value)[:2][] | \"\\(.key) \\(.value)\"'"],
  ['c2', 'T', "cat .github/workflows/*.yml | grep -oE 'witness_[a-z0-9_]+\\.js' | sort -u | wc -l"],
  ['c3', 'T', "git show 3a1c5ae9^:README.md | grep -oE 'About [0-9,]+ JS and HTML files of app code'"]
];
// c3 needs the commit BEFORE the README fix (#3229): found by message, then the typed line names it
{ const h = sh(TREES.T, "git log --format=%h -1 --grep='correct app-code count, modeller tree paths'").out; if (!h) fail('the #3229 commit is not in the pinned tree'); CMDS[CMDS.length - 1][2] = CMDS[CMDS.length - 1][2].replace('3a1c5ae9', h); }
for (const [id, tk, cmd, env] of CMDS) {
  const r = sh(TREES[tk], cmd, env); if (r.code !== 0 || !r.out) fail('command ' + id + ' failed (code ' + r.code + '): ' + cmd + ' :: ' + r.err.slice(0, 300));
  F.cmds[id] = { tree: tk, cmd, out: r.out.split('\n') }; fs.writeFileSync(path.join(OUT, 'cmd_' + id + '.txt'), '$ ' + cmd + '\n' + r.out + '\n'); L('cmd ' + id + ' [' + tk + '] ' + cmd + ' -> ' + r.out.split('\n').length + ' lines: ' + r.out.split('\n').slice(-1)[0].slice(0, 120));
}
const o = id => F.cmds[id].out.join('\n');
put('commits', +o('after'), 'cmd after');
{ const pj = JSON.parse(fs.readFileSync(path.join(TREES.T, 'package.json'), 'utf8')); put('deps', Object.keys(pj.dependencies).length, 'package.json dependencies'); put('deps.desc', pj.description, 'package.json description'); }
if (!/ALL PASS/.test(o('u2'))) fail('W-ROSTER-VERIFY did not print ALL PASS');
{ const full = sh(TREES.T, 'node erp/tests/witness_roster_verify.js'); fs.writeFileSync(path.join(OUT, 'witness_roster_verify.log'), full.out);
  F.rvRejects = full.out.split('\n').filter(l => /REJECT/.test(l) && /🟢/.test(l)).map(l => l.replace(/^\s*🟢\s*/, '').trim()); put('rv.rejected', F.rvRejects.length, 'witness_roster_verify.log green lines that say REJECT'); put('rv.checks', (full.out.match(/🟢/g) || []).length - 1, 'witness_roster_verify.log green lines, less the ALL PASS line'); put('rv.red', (full.out.match(/🔴/g) || []).length, 'witness_roster_verify.log red lines'); }
put('erp.june', +o('v1'), 'cmd v1'); put('witness.files', +o('v2'), 'cmd v2');
{ const s = o('s1'); for (const k of ['app_js', 'app_html', 'witness_js', 'vendored_js']) { const m = grab(new RegExp('set=' + k + ' files=(\\d+) lines=(\\d+)'), s, 'size_stack'); put('size.' + k + '.files', +m[1], 'cmd s1 ' + k); put('size.' + k + '.lines', +m[2], 'cmd s1 ' + k); } }
{ const full = sh(TREES.C, 'bash scripts/code_arch/size_stack.sh ' + TREES.T).out; fs.writeFileSync(path.join(OUT, 'size_stack.log'), full);
  for (const a of ['viewer', 'erp', 'modeller']) put('precache.' + a, +grab(new RegExp('precache sw=' + a + '/sw\\.js entries=(\\d+)'), full, 'size_stack.log')[1], 'size_stack.log precache ' + a);
  const w = grab(/set=whole_tree files=(\d+) lines=(\d+)/, full, 'size_stack.log'); put('size.whole.files', +w[1], 'size_stack.log whole_tree'); put('size.whole.lines', +w[2], 'size_stack.log whole_tree'); }
{ const cp = sh(TREES.T, 'node erp/tests/witness_core_pure.js').out; fs.writeFileSync(path.join(OUT, 'witness_core_pure.log'), cp); const m = grab(/^§CORE_PURE files=(\d+) .*forbidden=(\d+) .*verdict=(\w+)/m, cp, 'core pure');
  put('pure.files', +m[1], 'W-CORE-PURE'); put('pure.forbidden', +m[2], 'W-CORE-PURE'); put('pure.verdict', m[3], 'W-CORE-PURE'); F.purityLine = (cp.split('\n').find(l => /^§CORE_PURE files=/.test(l)) || '').trim(); }
{ const ci = fs.readFileSync(path.join(TREES.T, '.github/workflows/ci.yml'), 'utf8'); put('ci.core_pure', /witness_core_pure\.js/.test(ci) ? 'Y' : 'N', 'ci.yml'); const loop = grab(/for w in ([a-z_ ]+); do\s*\n\s*f=devtools\/vscode\/x0-navigator\/tests\/witness_x0_\$w\.js/, ci, 'ci.yml X0 loop')[1].trim().split(/\s+/);
  const named = sh(TREES.T, "cat .github/workflows/*.yml | grep -oE 'witness_[a-z0-9_]+\\.js' | sort -u").out.split('\n'), loopFiles = loop.map(w => 'witness_x0_' + w + '.js'), all = new Set(named.concat(loopFiles));
  if (named.some(n => loopFiles.includes(n))) L('note: a loop witness is also named');
  put('ci.loop', loop.length, 'ci.yml X0 loop names (written as witness_x0_$w.js, so the c2 regex does not see them)'); put('ci.named', +o('c2'), 'cmd c2'); put('ci.total', all.size, 'derived: the c2 names + the ci.yml loop names, as one set'); }
put('idem.lines', +o('l1'), 'cmd l1'); put('idem.files', +sh(TREES.I, "find . -name '*.java' -not -path '*/target/*' | wc -l").out, 'iDempiere find'); put('idem.commit', F.trees.I.commit, 'iDempiere git');
put('erp.files', +sh(TREES.T, "git ls-files 'erp/*.js' | grep -vE '/tests?/|/lib/|witness' | wc -l").out, 'bim-ootb erp js, no tests/lib/witness');
put('erp.lines', +sh(TREES.T, "git ls-files 'erp/*.js' | grep -vE '/tests?/|/lib/|witness' | xargs cat | wc -l").out, 'same');
// GitHub language shares + stars (read now; the l2 typed line shows Odoo's first two rows raw)
const REPOS = { idempiere: 'idempiere/idempiere', odoo: 'odoo/odoo', erpnext: 'frappe/erpnext', frappe: 'frappe/frappe', ours: 'red1oon/bim-ootb' }; F.langs = {};
for (const [k, r] of Object.entries(REPOS)) { const L2 = JSON.parse(sh(TREES.T, 'gh api repos/' + r + '/languages').out || '{}'), tot = Object.values(L2).reduce((a, b) => a + b, 0); if (!tot) fail('no languages for ' + r);
  F.langs[k] = Object.entries(L2).sort((a, b) => b[1] - a[1]).map(([n, b]) => [n, +(b / tot * 100).toFixed(1)]); put('stars.' + k, +sh(TREES.T, 'gh api repos/' + r + " --jq '.stargazers_count'").out, 'GitHub ' + r);
  fs.writeFileSync(path.join(OUT, 'prior', 'gh_lang_' + k + '.json'), JSON.stringify(L2)); }
const share = (k, n) => { const x = F.langs[k].find(y => y[0] === n); return x ? x[1] : 0; };
put('lang.idem.java', share('idempiere', 'Java'), 'GitHub languages'); put('lang.idem.js', share('idempiere', 'JavaScript'), 'GitHub languages');
put('lang.odoo.py', share('odoo', 'Python'), 'GitHub languages'); put('lang.odoo.js', share('odoo', 'JavaScript'), 'GitHub languages');
put('lang.erpnext.py', share('erpnext', 'Python'), 'GitHub languages'); put('lang.erpnext.js', share('erpnext', 'JavaScript'), 'GitHub languages');
put('lang.ours.js', share('ours', 'JavaScript'), 'GitHub languages'); put('lang.ours.py', share('ours', 'Python'), 'GitHub languages');
// the peers' databases, from their own dependency files
{ const rq = sh(TREES.T, "gh api repos/odoo/odoo/contents/requirements.txt --jq .content | base64 -d").out, pp = sh(TREES.T, "gh api repos/frappe/frappe/contents/pyproject.toml --jq .content | base64 -d").out;
  fs.writeFileSync(path.join(OUT, 'prior', 'odoo_requirements.txt'), rq); fs.writeFileSync(path.join(OUT, 'prior', 'frappe_pyproject.toml'), pp);
  put('db.odoo', /^psycopg2/m.test(rq) ? 'psycopg2' : '', 'odoo requirements.txt'); put('db.frappe', /PyMySQL/.test(pp) ? 'PyMySQL' : '', 'frappe pyproject.toml'); }
// the legacy parity run (the log is untracked build output: a copy is kept beside the facts)
{ const pl = fs.readFileSync(PLOG, 'utf8'); fs.copyFileSync(PLOG, path.join(OUT, 'parity_run_all.log')); const scn = pl.split('\n').filter(l => /^§SCN /.test(l) && !/^§SCN NEG/.test(l));
  put('par.match', scn.filter(l => / MATCH/.test(l)).length, 'parity log §SCN lines that are not negative controls, MATCH'); put('par.differ', scn.filter(l => !/ MATCH/.test(l)).length, 'same, not MATCH');
  const cv = grab(/§COVERAGE models_with_scenarios=(\d+) of dictionary_doc_tables=(\d+).*windows_identical=(\d+) of (\d+)/, pl, 'parity log'); put('par.tables', +cv[1], 'parity §COVERAGE'); put('par.tables_of', +cv[2], 'parity §COVERAGE'); put('par.win', +cv[3], 'parity §COVERAGE'); put('par.win_of', +cv[4], 'parity §COVERAGE');
  put('par.date', fs.statSync(PLOG).mtime.toISOString().slice(0, 10), 'parity log file date'); }
// from the project's own documents (check P re-reads these rows)
const doc = f => fs.readFileSync(path.join(TREES.C, f), 'utf8'), VP = doc('docs/VibeProgramming.md'), CAD = doc('prompts/CODE_ARCHITECTURE_DESIGN.md'), BSB = doc('docs/BrowserScaleBenchmark.md');
// the industry figures: ONLY from the source pages this lane read (saved in out/prior/; GitClear returned HTTP 403 and is not used)
const page = f => { const t = fs.readFileSync(path.join(OUT, 'prior', f), 'utf8').replace(/<[^>]+>/g, ' ').replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/\s+/g, ' '); return t; };
{ const so = page('so2025_ai.html'), m = grab(/More developers actively distrust the accuracy of AI tools \((\d+)%\) than trust it \((\d+)%\)/, so, 'Stack Overflow 2025 page');
  put('so.distrust', m[1], 'survey.stackoverflow.co/2025/ai (saved out/prior/so2025_ai.html)'); put('so.trust', m[2], 'same');
  const f = grab(/positive sentiment for AI tools has decreased in 2025: (\d+)%\+ in 2023 and 2024 to just (\d+)% this year/, so, 'Stack Overflow sentiment'); put('so.fav0', f[1], 'same'); put('so.fav1', f[2], 'same'); }
put('vc.flaw', grab(/AI-generated code introduced risky security flaws in (\d+)% of tests/, page('veracode2025.html'), 'Veracode 2025 page')[1], 'veracode.com 2025 GenAI Code Security Report page (saved out/prior/veracode2025.html)');
put('erp.years', grab(/\| (\d+) years of open-source ERP code in training data \|/, VP, 'framework table')[1], 'VibeProgramming.md framework table');
for (const [k, re] of [['fail1', /\*\*(2026-08-25):\*\* an audit found witness scripts reporting PASS/], ['fail2', /\*\*(2026-08-26):\*\* one 4D session retracted the same finding three times/], ['fail3', /\*\*(2026-10-04):\*\* a sales cycle marked "fully tested"/]]) put('date.' + k, grab(re, VP, k)[1], 'VibeProgramming.md ' + k);
{ const m = grab(/C7 takes ~(\d+) s \(bump re-reads ([\d,]+) loader files per target\), so CI passes `--skip-c7`/, CAD, 'design file C7'); put('c7.s', m[1], 'CODE_ARCHITECTURE_DESIGN.md C7'); put('c7.files', m[2].replace(/,/g, ''), 'same'); }
{ const m = grab(/\| C, D \| not started; wait on B \|/, CAD, 'design file parts table'); put('parts.cd', 'not started', 'CODE_ARCHITECTURE_DESIGN.md §2'); grab(/\| E \| not started \|/, CAD, 'part E'); grab(/B1 \(modeller\): build spec written; ask B1-Q1\.\.Q3, then build/, CAD, 'B1 state'); put('parts.b1', 'spec written, not built', 'CODE_ARCHITECTURE_DESIGN.md §2'); }
put('retract.times', grab(/retracted the same finding (\w+) times/, VP, 'VibeProgramming retraction count')[1], 'VibeProgramming.md fail2');
{ const m = grab(/\*"~([\d,]+) lines across ~([\d,]+) files"\*/, VP, 'the AI review quote'); put('ai.lines', m[1].replace(/,/g, ''), 'VibeProgramming.md, the Gemini review row'); put('ai.files', m[2].replace(/,/g, ''), 'same'); }
put('mem.gb', grab(/heap ≈ (0\.\d+) GB per million vertices/, BSB, 'BrowserScaleBenchmark fit')[1], 'BrowserScaleBenchmark.md fit');
{ const pr = (repo, n) => sh(TREES.T, 'gh pr view ' + n + ' -R ' + repo + " --json state -q .state").out; F.prs = {};
  for (const [repo, n, what] of [['red1oon/BIMCompiler', 905, 'outside assessment, fact-checked'], ['red1oon/BIMCompiler', 925, 'README counts'], ['red1oon/BIMCompiler', 933, 'scale check + peers'], ['red1oon/bim-ootb', 3229, 'README counts'], ['red1oon/bim-ootb', 3234, 'CI witness wording'], ['red1oon/BIMCompiler', 923, 'When AI Dies film']]) {
    F.prs[repo.split('/')[1] + '#' + n] = { what, state: pr(repo, n) }; }
  L('prs ' + JSON.stringify(F.prs)); }
F.firstCommit = sh(TREES.T, "git log --reverse --format=%ad --date=short | head -1").out; L('first commit ' + F.firstCommit);
F.licence = fs.readFileSync(path.join(TREES.T, 'LICENSE'), 'utf8').split('\n')[0].trim();
fs.writeFileSync(path.join(OUT, 'facts.json'), JSON.stringify(F, null, 1)); L('values=' + Object.keys(F.v).length + ' cmds=' + Object.keys(F.cmds).length + ' VERDICT PASS');
