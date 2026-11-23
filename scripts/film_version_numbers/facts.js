// ⚠ DO NOT REMOVE — SCOPE: film 6 "CH 0 · Browser version numbers, done for you" (prompts/FILM_IMMERSIVE_SOFTWARE.md FILM 6; copied from scripts/film_one_list/facts.js, film 5). READ out/facts.log and every out/cmd_*.log after a run: exit code is not evidence.
// Every typed line (typed.js) is run for real in a THROWAWAY detached worktree of bim-ootb: BEFORE = e4fa52fe, DIFF = fce8fdc4 (#3302) with `git reset --soft fce8fdc4^` so its changes are staged (this is what VS Code's Source Control shows), AFTER = fc2f8216 (B4-HASH,
// #3402). The AFTER chain (the example's edit, the press, the code, the hand-typed code the check refuses) is made in the AFTER tree only and undone with `git checkout -- .` (the tree is then proven clean). Whole output of each command: out/cmd_<id>.log with its exit code.
// The example (file, string, new string) is the one probe_harm.js MEASURED to show (out/harm_choice.json). Numbers the film speaks are extracted into out/facts.json from those logs. Usage: node facts.js   Prints §FACTS lines and §FACTS VERDICT PASS|FAIL.
'use strict';
const fs = require('fs'), path = require('path'), cp = require('child_process'), crypto = require('crypto');
const TY = require('./typed.js'), T = TY.T, H = TY.H, OUT = path.join(__dirname, 'out'), L = m => console.log('§FACTS ' + m), fail = m => { L('FAIL ' + m); process.exit(1); };
const clean = s => (s || '').replace(/\u001b\[[0-9;]*m/g, ''), grab = (t, re, i) => { const m = re.exec(t); return m ? m[i || 1] : null; };
const { before: BEFORE, diff: DIFF, after: AFTER } = TY.TREES, { before: SHA_B, diff: SHA_D, after: SHA_A } = TY.SHA;
fs.mkdirSync(OUT, { recursive: true }); fs.mkdirSync(path.join(OUT, 'prior'), { recursive: true });
if (!H) fail('out/harm_choice.json is missing: run probe_harm.js first (the example is chosen only after its visible effect is measured)');
const F = { made: new Date().toISOString(), trees: {}, steps: {}, harm: H }, EXPECT = {};
const git = (cwd, args) => cp.spawnSync('git', args, { cwd, encoding: 'utf8', maxBuffer: 1 << 26 });
// ---- the three throwaway trees
for (const [k, dir, sha] of [['before', BEFORE, SHA_B], ['diff', DIFF, SHA_D + '^'], ['after', AFTER, SHA_A]]) {
  const want = git(dir, ['rev-parse', sha]).stdout.trim(), head = git(dir, ['rev-parse', 'HEAD']).stdout.trim(), st = git(dir, ['status', '--short']).stdout.trim().split('\n').filter(Boolean), nm = fs.existsSync(path.join(dir, 'node_modules'));
  F.trees[k] = { dir, sha, head, changed: st.length, node_modules: nm }; L('tree ' + k + ' ' + JSON.stringify(F.trees[k]));
  if (head !== want || !nm) fail('tree ' + k + ' is not at ' + sha); if (k !== 'diff' && st.length) fail('tree ' + k + ' is not clean'); }
// the DIFF tree: exactly #3302's changes, staged and nothing else
{ const a = git(DIFF, ['diff', '--cached', '--stat']).stdout, b = git(DIFF, ['show', '--stat', '--format=', SHA_D]).stdout, un = git(DIFF, ['diff', '--stat']).stdout.trim(); if (a.trim() !== b.trim() || un !== '') fail('the DIFF tree is not exactly the staged changes of ' + SHA_D); L('diff tree: staged stat == git show --stat ' + SHA_D + ', nothing unstaged'); }
const run = (id, typed, cwd, expectExit, env) => { const log = path.join(OUT, 'cmd_' + id + '.log'); fs.writeFileSync(log, '$ ' + typed + '\n'); const fd = fs.openSync(log, 'a'); const t0 = Date.now();
  const r = cp.spawnSync('nice', ['-n', '19', 'ionice', '-c3', 'bash', '-o', 'pipefail', '-c', typed], { cwd, stdio: ['ignore', fd, fd], timeout: 1200000, env: Object.assign({}, process.env, { CUDA_VISIBLE_DEVICES: '', NO_COLOR: '1', GIT_PAGER: 'cat' }, env || {}) });
  fs.closeSync(fd); fs.appendFileSync(log, '§CMD_EXIT ' + r.status + '\n'); EXPECT[id] = expectExit;
  const lines = clean(fs.readFileSync(log, 'utf8')).split('\n').slice(1).filter(l => l.trim() !== '' && !/^§CMD_EXIT /.test(l));
  L('cmd ' + id + ' exit=' + r.status + ' (expected ' + expectExit + ') lines=' + lines.length + ' secs=' + Math.round((Date.now() - t0) / 1000) + ' $ ' + typed.slice(0, 120)); if (r.status !== expectExit) fail('cmd ' + id + ' exit ' + r.status + ' is not the expected ' + expectExit + ' (see out/cmd_' + id + '.log)');
  return { exit: r.status, lines, out: lines.join('\n') }; };
const step = (id, typed, r, extra) => { (F.steps[id] = F.steps[id] || []).push(Object.assign({ typed, exit: r.exit, shown: r.lines }, extra || {})); };

// ================= CH 1 the pain: #3302 in the DIFF tree
{ const c = run('b1_commit', 'git show --stat --format="%h %ad %s" --date=short ' + SHA_D + ' | head -1', DIFF, 0); F.b1 = { line: c.lines[0], date: grab(c.out, /^\w+ (\d{4}-\d\d-\d\d) /), subject: grab(c.out, /^\w+ \d{4}-\d\d-\d\d (.*)$/) };
  for (let i = 0; i < 3; i++) { const r = run('b1n_' + i, T['b1n_' + i], DIFF, 0); step('b1n', T['b1n_' + i], r); }
  const s = F.steps.b1n; F.b1n = { stat: s[0].shown[0], files: +grab(s[0].shown[0], /(\d+) files? changed/), places: s[1].shown.length, placeFiles: Array.from(new Set(s[1].shown.map(l => l.split(':')[0]))).length, placeList: s[1].shown, cache: s[2].shown.length, cacheLines: s[2].shown };
  F.b1n.fromV = {}; s[1].shown.forEach(l => { const m = /^(.*?):(\d+):locale_loader\.js(?:\?v=|": \{"v":)(\d+)$/.exec(l); if (m) F.b1n.fromV[m[1]] = +m[3]; }); L('b1n ' + JSON.stringify({ files: F.b1n.files, places: F.b1n.places, placeFiles: F.b1n.placeFiles, cache: F.b1n.cache }));
  // evidence that every place and both cache lines are CHANGED lines of #3302 (added lines of the commit), not merely present
  const add = git(DIFF, ['diff', '--cached', '-U0']).stdout.split('\n'); let file = '', ln = 0, hit = 0; const added = new Set();
  add.forEach(l => { let m; if ((m = /^\+\+\+ b\/(.*)$/.exec(l))) file = m[1]; else if ((m = /^@@ -\S+ \+(\d+)/.exec(l))) ln = +m[1] - 1; else if (/^\+/.test(l) && !/^\+\+\+/.test(l)) { ln++; added.add(file + ':' + ln); } });
  F.b1n.placesAreAdded = s[1].shown.every(l => { const m = /^(.*?):(\d+):/.exec(l); return m && added.has(m[1] + ':' + m[2]); }); L('b1n every place is an added line of ' + SHA_D + ': ' + F.b1n.placesAreAdded); }

// ================= CH 1b the miss: BEFORE tree (film 5's lines, re-run)
{ const r = run('b1b_0', T.b1b_0, BEFORE, 0); step('b1b', T.b1b_0, r);
  const ix = /^e4fa52fe:index\.html:(\d+):import_db_builder\.js\?v=(\d+)$/m.exec(r.out), vv = /^e4fa52fe:viewer\/viewer\.html:(\d+):import_db_builder\.js\?v=(\d+)$/m.exec(r.out); if (!ix || !vv) fail('b1b: the grep did not print both lines');
  F.b1b = { indexLine: +ix[1], indexV: +ix[2], viewerLine: +vv[1], viewerV: +vv[2] };
  const e1 = run('b1b_commit', 'git show --stat --format="%h %ad %s" --date=short 8d1ede96 -- index.html viewer/viewer.html viewer/import_db_builder.js', BEFORE, 0), e2 = run('b1b_diff', 'git show -U0 --format= 8d1ede96 -- viewer/viewer.html index.html | grep -E "^[-+][^-+].*import_db_builder.js"', BEFORE, 0);
  F.b1b.commit = { id: '8d1ede96', date: grab(e1.out, /^8d1ede96 (\d{4}-\d\d-\d\d) /), touchesViewerHtml: /viewer\/viewer\.html/.test(e1.out), touchesIndex: /\bindex\.html\b/.test(e1.out), diff: e2.lines };
  const e3 = run('b1b_check', 'node scripts/gen_manifest.js --check | grep MANIFEST_CHECK', BEFORE, 0); F.b1b.beforeCheckVerdict = grab(e3.out, /verdict=(\w+)/); }

// ================= CH 2/3/4: the AFTER tree. The edit the editor makes (the same bytes), the press the Bump button runs, the code, the hand-typed code. Undone at the end.
const X = H.file, base = TY.base;
const swOf = rel => rel.startsWith('viewer/') ? 'viewer/sw.js' : rel.startsWith('erp/') ? 'erp/sw.js' : rel.startsWith('modeller/') ? 'modeller/sw.js' : 'viewer/sw.js';
try {
  const cv = f => grab(fs.readFileSync(path.join(AFTER, f), 'utf8'), /const CACHE_VERSION = 'v(\d+)'/);
  F.press = { file: X, swFile: swOf(X), sw_before: +cv(swOf(X)), sha_before: run('sha_before', 'sha256sum ' + X + ' | cut -c1-8', AFTER, 0).lines[0] };
  const tags0 = run('tags_before', 'git grep -n -o -E "[^A-Za-z0-9_]' + base.replace(/\./g, '\\.') + '\\?v=[0-9a-f]+" -- index.html "viewer/*.html" "erp/*.html" "modeller/*.html" capex/index.html', AFTER, 0); F.press.tagsBefore = tags0.lines;
  // the edit (CH 2): replace the string, save (as the editor does)
  const src = fs.readFileSync(path.join(AFTER, X), 'utf8'); if (src.split(H.litOld).length !== 2) fail('the edit: ' + H.litOld + ' is not exactly once in ' + X); fs.writeFileSync(path.join(AFTER, X), src.replace(H.litOld, H.litNew));
  const ed = run('edit_diff', 'git diff -U0 -- ' + X + ' | grep "^[-+][^-+]" | cut -c1-200', AFTER, 0); F.press.editDiff = ed.lines;
  const stale = run('check_stale', 'node scripts/gen_manifest.js --check 2>&1 | grep -E "MANIFEST_(FAIL|CHECK)" | cut -c1-260', AFTER, 1); F.press.staleCheck = stale.lines;   // the net for a forgotten press: it names the file, the page, the line
  F.press.sha_edited = run('sha_edited', 'sha256sum ' + X + ' | cut -c1-8', AFTER, 0).lines[0];
  // CH 3: what the Bump button runs (extension.js bumpButton: --changed --check, then --changed --write), same arguments
  const chk = run('press_check', 'node scripts/bump.js --changed --check', AFTER, 0), wr = run('press_write', 'node scripts/bump.js --changed --write', AFTER, 0);
  F.press.checkLines = chk.lines.filter(l => /^§BUMP/.test(l)); F.press.writeLines = wr.lines.filter(l => /^§BUMP/.test(l)); F.press.verdict = grab(chk.out, /§BUMP_CHECK verdict=(\w+)/); F.press.done = grab(wr.out, /(§BUMP_DONE .*)$/m);
  F.press.sw_after = +cv(swOf(X)); const stat = run('b3_stat', T.b3_0, AFTER, 0); step('b3', T.b3_0, stat); F.press.stat = stat.lines; F.press.statFiles = stat.lines.filter(l => /\|/.test(l)).map(l => l.trim().split(/\s+\|/)[0]);
  // CH 4: the code is the file's own fingerprint
  const sha = run('b4_0', T.b4_0, AFTER, 0); step('b4', T.b4_0, sha); F.press.sha_after = sha.lines[0];
  const tg = run('tags_after', 'git grep -n -o -E "[^A-Za-z0-9_]' + base.replace(/\./g, '\\.') + '\\?v=[0-9a-f]+" -- index.html "viewer/*.html" "erp/*.html" "modeller/*.html" capex/index.html', AFTER, 0); F.press.tagsAfter = tg.lines;
  const vt = /^viewer\/viewer\.html:(\d+):.*\?v=([0-9a-f]{8})$/m.exec(tg.out); if (!vt) fail('the press left no tag of ' + base + ' in viewer/viewer.html'); F.press.viewerTag = { line: +vt[1], code: vt[2] };
  const bad = TY.BAD_CODE, b41 = T.b4_1(vt[2], bad), rf = run('b4_1', b41, AFTER, 1); step('b4', b41, rf);
  const fl = /§MANIFEST_FAIL (\S+) changed but (\S+):(\d+) still says \?v=(\w+); run: (.*)$/m.exec(rf.out); if (!fl) fail('b4: no §MANIFEST_FAIL line in the expected form'); F.press.refusal = { changed: fl[1], file: fl[2], line: +fl[3], saw: fl[4], fix: fl[5], verdict: grab(rf.out, /§MANIFEST_CHECK .* verdict=(\w+)/), bad };
  const full = run('b4_full', 'node scripts/gen_manifest.js --check', AFTER, 1); F.press.refusalFull = { exit: full.exit, failLines: full.lines.filter(l => /^§MANIFEST_FAIL /.test(l)).length, first: (full.lines.find(l => /^§MANIFEST_FAIL /.test(l)) || '').slice(0, 400) };
  F.press.editedLine = (git(AFTER, ['show', ':viewer/viewer.html']).stdout || '').length ? run('b4_line', 'sed -n "' + F.press.refusal.line + 'p" ' + F.press.refusal.file, AFTER, 0).lines[0] : '';
} finally { const co = run('restore', 'git checkout -- . && git status --short && echo restored_clean', AFTER, 0); F.press = F.press || {}; F.press.restored = co.lines.length === 1 && co.lines[0] === 'restored_clean'; }
if (!F.press.restored) fail('the AFTER tree is not clean after the undo');

// ================= CH 5 why ours
{ const r = run('b5_bundler', 'git ls-files | grep -c -E "(^|/)(webpack|rollup|vite|esbuild|parcel|snowpack|gulpfile)[^/]*\\.(config\\.)?(js|mjs|cjs|ts|json)$" || true', AFTER, 0); F.b5 = { bundlerConfigs: +r.lines[0] };
  const p = run('b5_pkg', 'node -e "const p=require(\'./package.json\');const d=Object.keys(Object.assign({},p.dependencies,p.devDependencies));const b=d.filter(n=>/^(webpack|rollup|vite|esbuild|parcel|snowpack|gulp)/.test(n));console.log(\'deps=\'+d.length+\' bundlers=\'+b.length+\' build_script=\'+((p.scripts||{}).build?\'Y\':\'N\'))"', AFTER, 0);
  F.b5.deps = +grab(p.out, /deps=(\d+)/); F.b5.bundlers = +grab(p.out, /bundlers=(\d+)/); F.b5.buildScript = grab(p.out, /build_script=(\w)/);
  const w = run('b5_wc', 'wc -l scripts/bump.js', AFTER, 0); F.b5.bumpLines = +grab(w.out, /^(\d+)/); L('b5 ' + JSON.stringify(F.b5)); }

// ================= PROMO scene 1: the file as the browser gets it (the deploy's own minify pass, whitespace + syntax only, on a copy), and scene 4: the new checks on the OLD tree
{ const MIN = '/tmp/wt-film6-min', X0 = H.file;
  run('s1_npm', 'mkdir -p ' + MIN + '/site/viewer && cd ' + MIN + ' && { [ -d node_modules/esbuild ] || npm i --no-save --no-audit --no-fund --prefix ' + MIN + ' esbuild@0.23.0 >/dev/null 2>&1; } && ls node_modules/esbuild/package.json && node -e "console.log(\'esbuild \'+require(\'./node_modules/esbuild/package.json\').version)"', AFTER, 0);
  const cpy = run('s1_copy', 'cp ' + X0 + ' ' + MIN + '/site/' + X0 + ' && sha256sum ' + X0 + ' ' + MIN + '/site/' + X0 + ' | cut -c1-12', AFTER, 0);
  const mm = run('s1_minify', 'NODE_PATH=' + MIN + '/node_modules node scripts/minify_pages.js ' + MIN + '/site 2>&1 | grep -E "PAYLOAD-MIN" | cut -c1-200', AFTER, 0);
  const src = fs.readFileSync(path.join(AFTER, X0), 'utf8'), mn = fs.readFileSync(path.join(MIN, 'site', X0), 'utf8'), idRe = /[A-Za-z_$][\w$]*/g, ids = t => new Set(t.match(idRe) || []), a = ids(src), b = ids(mn), onlyMin = Array.from(b).filter(x => !a.has(x));
  F.s1 = { file: X0, srcBytes: Buffer.byteLength(src), minBytes: Buffer.byteLength(mn), sha: crypto.createHash('sha256').update(src).digest('hex').slice(0, 8), shaCopy: cpy.lines[1] ? cpy.lines[1].slice(0, 8) : null, shaMin: crypto.createHash('sha256').update(mn).digest('hex').slice(0, 8), namesInSrc: a.size, namesInMin: b.size, namesOnlyInMin: onlyMin.length, unexplained: onlyMin.filter(x => !/^(x[0-9A-F]{2}|u[0-9A-Fa-f]{4})/.test(x) && !/^e\d$/.test(x) && x !== 'void' && !/^[A-Za-z]+2$/.test(x)), localRenames: onlyMin.filter(x => /^[A-Za-z]{3,}2$/.test(x)), globalsInSrc: (src.match(/window\.[A-Za-z_$][\w$]*/g) || []).filter((v, i, arr) => arr.indexOf(v) === i).length, globalsMissingInMin: (src.match(/window\.[A-Za-z_$][\w$]*/g) || []).filter((v, i, arr) => arr.indexOf(v) === i && mn.indexOf(v) < 0).length, titleKept: mn.indexOf(H.litOld) >= 0 || mn.indexOf(H.old) >= 0, minifyLine: mm.lines[0] || '', firstLineSame: mn.split('\n')[0].slice(0, 40) };
  fs.writeFileSync(path.join(OUT, 'file_min_panels.js'), mn); L('s1 ' + JSON.stringify(F.s1).slice(0, 400));
  const wo = run('s4_old_full', 'MANIFEST_W_OLD=' + TY.TREES.old + ' node scripts/tests/witness_manifest_roundtrip.js', AFTER, 1); const claimIds = ['C26', 'C27', 'C28', 'C29', 'C30', 'C31'];
  F.s4 = { oldFailed: claimIds.filter(id => new RegExp('§MANIFEST_CLAIM id=' + id + ' ok=N').test(wo.out)).length, oldOf: claimIds.length, oldTotals: grab(wo.out, /§MANIFEST_ROUNDTRIP .*claims=(\d+\/\d+)/) };
  const s0 = run('s4_0', T.s4_0, AFTER, 1); step('s4', T.s4_0, s0); const s1r = run('s4_1', T.s4_1, AFTER, 0); step('s4', T.s4_1, s1r);
  F.s4.typedOld = s0.lines; F.s4.line = s1r.lines[0]; F.s4.claims = grab(s1r.out, /claims=(\d+\/\d+)/); F.s4.red = grab(s1r.out, / red=(\d+\/\d+)/); L('s4 ' + JSON.stringify({ oldFailed: F.s4.oldFailed, claims: F.s4.claims, red: F.s4.red })); }

// ================= the last card: counts, the witness, the credentials
{ const hand = []; for (const a of ['viewer', 'erp', 'modeller']) { const r = run('close_hand_' + a, 'git show ' + SHA_A + '^:' + a + '/modules.json | grep -c \'"v":\' || true', AFTER, 0); hand.push(+r.lines[0]); const z = run('close_now_' + a, 'git show ' + SHA_A + ':' + a + '/modules.json | grep -c \'"v":\' || true', AFTER, 0); hand.push(+z.lines[0]); }
  F.change = { handBefore: hand[0] + hand[2] + hand[4], handAfter: hand[1] + hand[3] + hand[5] };
  const mc = run('close_check', 'node scripts/gen_manifest.js --check | grep MANIFEST_CHECK', AFTER, 0); F.change.checkLine = mc.lines[0]; F.change.sites = +grab(mc.out, /sites=(\d+)/); F.change.apps = +grab(mc.out, /apps=(\d+)/); F.change.checkVerdict = grab(mc.out, /verdict=(\w+)/);
  const w = run('close_witness', 'node scripts/tests/witness_manifest_roundtrip.js', AFTER, 0); const rts = w.lines.filter(l => /^§MANIFEST_ROUNDTRIP /.test(l)), rt = rts.length ? [null, rts[rts.length - 1]] : null; if (!rt) fail('close: no §MANIFEST_ROUNDTRIP line'); F.change.witness = { line: rt[1], claims: grab(rt[1], /claims=(\d+\/\d+)/), red: grab(rt[1], /red=(\d+\/\d+)/), outsideOwned: grab(rt[1], /outside_owned=(\d+\/\d+)/), verdict: grab(rt[1], /verdict=(\w+)/) };
  { const c22 = w.lines.find(l => /§MANIFEST_CLAIM id=C22 /.test(l)) || '', mm = /\((capex\/index\.html,import_own\.js,index\.html)\)/.exec(c22), fl = mm ? mm[1].split(',') : []; F.change.outsideFiles = fl; F.change.pages = fl.filter(x => /\.html$/.test(x)).length; F.change.loaders = fl.filter(x => /\.js$/.test(x)).length; }
  const st = run('close_status', 'git status --short', AFTER, 0); F.change.dirtyAfter = st.lines.length;
  const pr = (repo, n) => (cp.spawnSync('gh', ['pr', 'view', String(n), '-R', repo, '--json', 'state,title', '-q', '.state + " " + .title'], { encoding: 'utf8' }).stdout || '').trim();
  F.credentials = { ootb: { 3385: pr('red1oon/bim-ootb', 3385), 3402: pr('red1oon/bim-ootb', 3402) }, decisions: {} }; for (const n of [1116, 1117, 1118, 1128]) F.credentials.decisions[n] = pr('red1oon/BIMCompiler', n);
  F.guide = { url: 'https://red1oon.github.io/BIMCompiler/DeveloperGuide/#51-any-edit-to-a-file-the-browser-loads' }; L('change ' + JSON.stringify(F.change)); L('credentials ' + JSON.stringify(F.credentials)); }

// ---- verdict
const bad = [], must = (t, ok) => { if (!ok) bad.push(t); L((ok ? 'OK   ' : 'FAIL ') + t); };
must('CH1: #3302 changed ' + F.b1n.files + ' files; its number appears in ' + F.b1n.places + ' places (all added lines of the commit), ' + F.b1n.cache + ' cache versions changed in sw.js files', F.b1n.files === 31 && F.b1n.places === 8 && F.b1n.placesAreAdded && F.b1n.cache === 2);
must('CH1b: index.html asks for ?v=' + F.b1b.indexV + ' (line ' + F.b1b.indexLine + '), viewer.html for ?v=' + F.b1b.viewerV + ' (line ' + F.b1b.viewerLine + ')', F.b1b.indexV === 11 && F.b1b.viewerV === 12 && F.b1b.indexLine === 184 && F.b1b.viewerLine === 1027);
must('CH1b: the commit that raised the viewer page touched viewer/viewer.html and not index.html, in November (' + F.b1b.commit.date + '); the BEFORE tree\'s manifest check said ' + F.b1b.beforeCheckVerdict, F.b1b.commit.touchesViewerHtml && !F.b1b.commit.touchesIndex && /^\d{4}-11-/.test(F.b1b.commit.date) && F.b1b.beforeCheckVerdict === 'PASS');
must('CH2: the edited file ' + X + ' differs in ' + F.press.editDiff.length + ' diff lines; the check without a press refuses (exit 1: ' + (F.press.staleCheck[0] || '').slice(0, 90) + ')', F.press.editDiff.length === 2 && F.press.sha_edited !== F.press.sha_before && F.press.staleCheck.some(l => /§MANIFEST_FAIL/.test(l)));
must('CH3: the press check passed (' + F.press.verdict + '), the write ran, ' + F.press.swFile + ' CACHE_VERSION ' + F.press.sw_before + ' -> ' + F.press.sw_after, F.press.verdict === 'PASS' && F.press.sw_after === F.press.sw_before + 1 && /§BUMP_DONE .*mode=write/.test(F.press.done || ''));
must('CH4: the code in viewer/viewer.html:' + F.press.viewerTag.line + ' (' + F.press.viewerTag.code + ') equals sha256sum of ' + X + ' (' + F.press.sha_after + ')', F.press.viewerTag.code === F.press.sha_after && F.press.sha_after !== F.press.sha_before);
must('CH4: the hand-typed code ' + F.press.refusal.bad + ' is refused: exit 1, names ' + F.press.refusal.file + ':' + F.press.refusal.line + ' and a fix command (' + F.press.refusal.fix + ')', F.press.refusal.verdict === 'FAIL' && F.press.refusalFull.exit === 1 && !!F.press.refusal.fix && F.press.refusal.file === 'viewer/viewer.html');
must('the AFTER tree is clean again after the undo', F.press.restored);
must('CH5: no bundler config in the tree (' + F.b5.bundlerConfigs + '), no bundler among ' + F.b5.deps + ' dependencies, build script ' + F.b5.buildScript, F.b5.bundlerConfigs === 0 && F.b5.bundlers === 0 && F.b5.buildScript === 'N');
must('last card: ' + F.change.handBefore + ' hand-kept numbers in the three lists before, ' + F.change.handAfter + ' after; ' + F.change.checkLine, F.change.handBefore > 700 && F.change.handAfter === 0 && F.change.checkVerdict === 'PASS');
must('last card: the witness on the merged tree: claims ' + F.change.witness.claims + ' red ' + F.change.witness.red + ' outside_owned ' + F.change.witness.outsideOwned + ' verdict ' + F.change.witness.verdict, /^(\d+)\/\1$/.test(F.change.witness.claims) && /^(\d+)\/\1$/.test(F.change.witness.red) && F.change.witness.verdict === 'PASS' && F.change.dirtyAfter === 0 && F.change.pages === 2 && F.change.loaders === 1);
must('credentials: bim-ootb #3385 and #3402 and BIMCompiler #1116 #1117 #1118 #1128 are MERGED', Object.values(F.credentials.ootb).every(s => /^MERGED/.test(s)) && Object.values(F.credentials.decisions).every(s => /^MERGED/.test(s)));
must('PROMO s1: the deploy\'s minify pass keeps every global name (' + F.s1.globalsInSrc + ' window.* names, missing ' + F.s1.globalsMissingInMin + '), renames only ' + F.s1.localRenames.length + ' shadowed locals (' + F.s1.localRenames.join(',') + '), unexplained new names ' + F.s1.unexplained.length + ', keeps the heading string; ' + F.s1.srcBytes + ' -> ' + F.s1.minBytes + ' bytes; ' + F.s1.minifyLine.slice(0, 90), F.s1.globalsMissingInMin === 0 && F.s1.unexplained.length === 0 && F.s1.titleKept && F.s1.minBytes < F.s1.srcBytes && /PAYLOAD-MIN/.test(F.s1.minifyLine));
must('PROMO s4: the six new claims C26-C31 all fail on the OLD tree (' + F.s4.oldFailed + ' of ' + F.s4.oldOf + '), the typed run on the new tree reads claims ' + F.s4.claims + ' red ' + F.s4.red, F.s4.oldFailed === 6 && /^(\d+)\/\1$/.test(F.s4.claims) && /^(\d+)\/\1$/.test(F.s4.red) && F.s4.typedOld.length === 6 && F.s4.typedOld.every(l => /ok=N/.test(l)));
L('every typed/evidence command exited as expected ' + JSON.stringify(EXPECT));
fs.writeFileSync(path.join(OUT, 'facts.json'), JSON.stringify(F, null, 1)); L('VERDICT ' + (bad.length ? 'FAIL ' + bad.length : 'PASS')); process.exit(bad.length ? 1 : 0);
