// ⚠ DO NOT REMOVE — SCOPE: film 5 "CH 0 · One list writes every page" (prompts/FILM_IMMERSIVE_SOFTWARE.md FILM 5; copied from scripts/film_dev_setup/facts.js, which downloaded a repo and drove VS Code: not needed here). READ out/facts.log and every out/cmd_*.log after a run: exit code is not evidence.
// Every typed command is run for real in a THROWAWAY detached worktree of bim-ootb (BEFORE = e4fa52fe, AFTER = 0fa163b8, the merge of #3385), as `nice -n 19 ionice -c3 bash -o pipefail -c <typed> < /dev/null`, its whole output kept in out/cmd_<id>.log with its exit code.
// The one hand edit (beat b3) is made in the AFTER throwaway tree only and undone with `git checkout -- index.html` (the tree is then proven clean). Every lower frame is the real file text: `git show <sha>:<path>`, kept in out/file_<name>.txt, with the changed line's number found by searching the file (b1: from the real grep output).
// Every number the film speaks is extracted into out/facts.json from those logs. Usage: node facts.js     Prints §FACTS lines and §FACTS VERDICT PASS|FAIL.
'use strict';
const fs = require('fs'), path = require('path'), os = require('os'), cp = require('child_process');
const OUT = path.join(__dirname, 'out'), L = m => console.log('§FACTS ' + m), fail = m => { L('FAIL ' + m); process.exit(1); };
const OOTB = path.join(os.homedir(), 'bim-ootb'), BEFORE = '/tmp/wt-film5-before', AFTER = '/tmp/wt-film5-after', SHA_B = 'e4fa52fe', SHA_A = '0fa163b8';
const clean = s => (s || '').replace(/\u001b\[[0-9;]*m/g, '');
const grab = (t, re, i) => { const m = re.exec(t); return m ? m[i || 1] : null; };
fs.mkdirSync(OUT, { recursive: true }); fs.mkdirSync(path.join(OUT, 'prior'), { recursive: true });
const F = { made: new Date().toISOString(), trees: {}, steps: {}, ex: {} };
const git = (cwd, args) => cp.spawnSync('git', args, { cwd, encoding: 'utf8', maxBuffer: 1 << 26 });
// ---- the two throwaway trees: the right commit, a clean index, node_modules linked
for (const [k, dir, sha] of [['before', BEFORE, SHA_B], ['after', AFTER, SHA_A]]) {
  const head = git(dir, ['rev-parse', 'HEAD']).stdout.trim(), st = git(dir, ['status', '--short']).stdout.trim(), nm = fs.existsSync(path.join(dir, 'node_modules'));
  F.trees[k] = { dir, sha, head, clean: st === '', node_modules: nm }; L('tree ' + k + ' ' + JSON.stringify(F.trees[k]));
  if (!head.startsWith(sha) || st !== '' || !nm) fail('tree ' + k + ' is not the named commit, clean, with node_modules (git status --short: ' + st + ')'); }
// ---- run one typed command for real; the log is `$ <typed>`, the whole output, `§CMD_EXIT n`
const EXPECT = {};
const run = (id, typed, cwd, expectExit, env) => { const log = path.join(OUT, 'cmd_' + id + '.log'); fs.writeFileSync(log, '$ ' + typed + '\n'); const fd = fs.openSync(log, 'a'); const t0 = Date.now();
  const r = cp.spawnSync('nice', ['-n', '19', 'ionice', '-c3', 'bash', '-o', 'pipefail', '-c', typed], { cwd, stdio: ['ignore', fd, fd], timeout: 900000, env: Object.assign({}, process.env, { CUDA_VISIBLE_DEVICES: '', NO_COLOR: '1', GIT_PAGER: 'cat' }, env || {}) });
  fs.closeSync(fd); fs.appendFileSync(log, '§CMD_EXIT ' + r.status + '\n'); EXPECT[id] = expectExit;
  const lines = clean(fs.readFileSync(log, 'utf8')).split('\n').slice(1).filter(l => l.trim() !== '' && !/^§CMD_EXIT /.test(l));
  L('cmd ' + id + ' exit=' + r.status + ' (expected ' + expectExit + ') lines=' + lines.length + ' secs=' + Math.round((Date.now() - t0) / 1000) + ' $ ' + typed.slice(0, 110)); if (r.status !== expectExit) fail('cmd ' + id + ' exit ' + r.status + ' is not the expected ' + expectExit + ' (see out/cmd_' + id + '.log)');
  return { exit: r.status, lines, out: lines.join('\n') }; };
const shown = (lines, trees) => lines.map(l => l.split(BEFORE).join('<' + SHA_B + '>').split(AFTER).join('<' + SHA_A + '>'));
const step = (id, typed, r, extra) => { (F.steps[id] = F.steps[id] || []).push(Object.assign({ typed, exit: r.exit, shown: shown(r.lines) }, extra || {})); };
// ---- file text: `git show <sha>:<path>`, the lines from..to, and the numbers of the changed lines. Kept in out/file_<name>.txt (header + raw lines)
const showFile = (sha, p, tree) => { const r = git(tree, ['show', sha + ':' + p]); if (r.status !== 0) fail('git show ' + sha + ':' + p + ' failed'); return r.stdout.split('\n'); };
const excerpt = (name, o) => { const all = o.lines || showFile(o.sha, o.path, o.tree), find = re => { const i = all.findIndex(l => re.test(l)); return i < 0 ? 0 : i + 1; };
  const marks = o.marks || (o.markRe ? [find(o.markRe)] : []), from = o.from || (o.fromFn ? o.fromFn(find) : marks[0]), to = o.to || (o.toFn ? o.toFn(find) : marks[marks.length - 1]);
  if (!marks.length || marks.some(m => !m) || !from || !to) fail('excerpt ' + name + ': changed line not found'); const lines = all.slice(from - 1, to);
  fs.writeFileSync(path.join(OUT, 'file_' + name + '.txt'), '§FILE name=' + name + ' sha=' + o.sha + ' path=' + o.path + ' from=' + from + ' to=' + to + ' marks=' + marks.join(',') + '\n' + lines.join('\n') + '\n');
  F.ex[name] = { sha: o.sha, path: o.path, from, to, marks, amb: o.amb || null, label: o.label || null, lines }; L('file ' + name + ' ' + o.sha + ':' + o.path + ' lines ' + from + '-' + to + ' marked ' + marks.join(',')); return F.ex[name]; };

// ================= b1: the miss, BEFORE tree
const B1 = 'git grep -n "import_db_builder.js?v=" e4fa52fe -- index.html viewer/viewer.html';
{ const r = run('b1', B1, BEFORE, 0); step('b1', B1, r);
  const ix = /^e4fa52fe:index\.html:(\d+):.*import_db_builder\.js\?v=(\d+)/m.exec(r.out), vv = /^e4fa52fe:viewer\/viewer\.html:(\d+):.*import_db_builder\.js\?v=(\d+)/m.exec(r.out); if (!ix || !vv) fail('b1: the grep did not print both lines');
  F.b1 = { indexLine: +ix[1], indexV: +ix[2], viewerLine: +vv[1], viewerV: +vv[2] };
  excerpt('b1_index', { sha: SHA_B, path: 'index.html', tree: BEFORE, marks: [F.b1.indexLine], from: F.b1.indexLine - 1, to: F.b1.indexLine + 1, amb: '\\?v=\\d+' });
  excerpt('b1_viewer', { sha: SHA_B, path: 'viewer/viewer.html', tree: BEFORE, marks: [F.b1.viewerLine], from: F.b1.viewerLine - 1, to: F.b1.viewerLine + 1, amb: '\\?v=\\d+' });
  // evidence for "In November the file changed": the commit that raised the viewer page's number (#2702), what it touched, and its date
  const e1 = run('e1_commit', 'git show --stat --format="%h %ad %s" --date=short 8d1ede96 -- index.html viewer/viewer.html viewer/import_db_builder.js', BEFORE, 0), e2 = run('e1_diff', 'git show -U0 --format= 8d1ede96 -- viewer/viewer.html index.html | grep -E "^[-+][^-+].*import_db_builder.js"', BEFORE, 0);
  F.b1.commit = { id: '8d1ede96', date: grab(e1.out, /^8d1ede96 (\d{4}-\d\d-\d\d) /m), subject: grab(e1.out, /^8d1ede96 \d{4}-\d\d-\d\d (.*)$/m), touchesViewerHtml: /viewer\/viewer\.html/.test(e1.out), touchesIndex: /\bindex\.html\b/.test(e1.out), diff: e2.lines };
  // evidence for "nothing said so": the manifest check of the BEFORE tree, run as it was
  const e3 = run('e1_before_check', 'node scripts/gen_manifest.js --check | grep MANIFEST_CHECK', BEFORE, 0); F.b1.beforeCheckVerdict = grab(e3.out, /verdict=(\w+)/);
  const e4 = run('e1_before_log', 'git log -1 --format="%h %ad %s" --date=short', BEFORE, 0); F.b1.beforeLog = e4.lines[0]; }

// ================= b2: the list, AFTER tree, dry run
const B2 = 'node scripts/bump.js import_own.js';
{ const r = run('b2', B2, AFTER, 0); step('b2', B2, r);
  F.b2 = { pageLine: grab(r.out, /(§BUMP page=.*)/), page: grab(r.out, /§BUMP page=(\S+)/), ref: grab(r.out, /§BUMP page=\S+ ref=(\S+)/), v: grab(r.out, /§BUMP page=.* v=(\d+->\d+)/), manifest: grab(r.out, /\(manifest (\S+)\)/), sw: +grab(r.out, /§BUMP_DONE .* sw=(\d+)/), mode: grab(r.out, /§BUMP_DONE .* mode=(\S+)/), written: +grab(r.out, /§BUMP_DONE .* written=(\d+)/), swLines: r.lines.filter(l => /§BUMP sw=/.test(l)).length };
  const e1 = run('e2_sw', "find . -name sw.js -not -path './node_modules/*' -not -path './.git/*' | sort; echo serviceWorker_mentions_in_index_html=$(grep -c serviceWorker index.html)", AFTER, 0);
  F.b2.swFiles = e1.lines.filter(l => /sw\.js$/.test(l)); F.b2.indexSwMentions = +grab(e1.out, /serviceWorker_mentions_in_index_html=(\d+)/);
  const e2a = run('e2_after_log', 'git log -1 --format="%h %ad %s" --date=short', AFTER, 0); F.b2.afterLog = e2a.lines[0];
  const e2 = run('e2_status', 'git status --short', AFTER, 0); F.b2.dirtyAfter = e2.lines.length;
  excerpt('b2_mod_v', { sha: SHA_A, path: 'viewer/modules.json', tree: AFTER, markRe: /^  "import_own\.js": \{"v":7,/, amb: '"v":7' });
  excerpt('b2_mod_order', { sha: SHA_A, path: 'viewer/modules.json', tree: AFTER, markRe: /^   \{"kind":"tag","as":"import_own\.js"\}/, fromFn: f => f(/^   \{"kind":"tag","as":"import_own\.js"\}/) - 2, toFn: f => f(/^   \{"kind":"tag","as":"import_own\.js"\}/) + 1 });
  excerpt('b2_index_tag', { sha: SHA_A, path: 'index.html', tree: AFTER, markRe: /import_own\.js\?v=7/, amb: '\\?v=\\d+' }); }

// ================= b3: the refusal. The hand edit is made in the AFTER throwaway tree only, then undone.
const B3 = "sed -i 's/import_own.js?v=7/import_own.js?v=9/' index.html && node scripts/gen_manifest.js --check 2>&1 | grep -E \"MANIFEST_(FAIL|CHECK)\"";
try { const r = run('b3', B3, AFTER, 1); step('b3', B3, r);
  const ed = run('b3_edit', "nl -ba index.html | sed -n '186,188p'", AFTER, 0), full = run('b3_full', 'node scripts/gen_manifest.js --check', AFTER, 1);
  const fl = /§MANIFEST_FAIL (\S+):(\d+) (.*)$/m.exec(r.out); if (!fl) fail('b3: no §MANIFEST_FAIL line');
  F.b3 = { fullExit: full.exit, failFile: fl[1], failLine: +fl[2], failText: fl[3], fixCommand: grab(fl[3], /then run: (.*)$/), verdict: grab(r.out, /§MANIFEST_CHECK .* verdict=(\w+)/), fullVerdict: grab(full.out, /§MANIFEST_CHECK .* verdict=(\w+)/), editedLine: ed.lines.map(l => l.replace(/^\s*(\d+)\t/, '$1\t')), failLinesInFull: full.lines.filter(l => /^§MANIFEST_FAIL /.test(l)).length };
  const nums = ed.lines.map(l => /^\s*(\d+)\t(.*)$/.exec(l)); excerpt('b3_edit', { sha: 'working copy: a hand edit in a throwaway tree of ' + SHA_A, path: 'index.html', lines: nums.map(m => m[2]), marks: [F.b3.failLine], from: 1, to: 3, amb: '\\?v=\\d+', label: 'hand edit, never committed' });
  F.ex.b3_edit.from = 186; F.ex.b3_edit.to = 188; F.ex.b3_edit.marks = [F.b3.failLine]; F.ex.b3_edit.sha = SHA_A + ' + the sed above'; fs.writeFileSync(path.join(OUT, 'file_b3_edit.txt'), '§FILE name=b3_edit sha=' + F.ex.b3_edit.sha + ' path=index.html from=186 to=188 marks=' + F.b3.failLine + '\n' + F.ex.b3_edit.lines.join('\n') + '\n');
} finally { const co = run('b3_restore', 'git checkout -- index.html && git status --short && echo restored_clean', AFTER, 0); F.b3 = F.b3 || {}; F.b3.restored = co.lines.length === 1 && co.lines[0] === 'restored_clean'; }
if (!F.b3.restored) fail('b3: the AFTER tree is not clean after the undo');

// ================= b4: what stayed, AFTER tree
const B4 = 'git diff --stat e4fa52fe 0fa163b8 -- index.html capex/index.html import_own.js';
{ const r = run('b4', B4, AFTER, 0); step('b4', B4, r);
  const sum = /(\d+) files? changed, (\d+) insertions?\(\+\)(?:, (\d+) deletions?\(-\))?/.exec(r.out), perFile = {}; r.lines.forEach(l => { const m = /^\s*(\S+)\s+\|\s+(\d+) /.exec(l); if (m) perFile[m[1]] = +m[2]; });
  F.b4 = { files: +sum[1], insertions: +sum[2], deletions: +(sum[3] || 0), perFile, importOwnInStat: /import_own\.js/.test(r.out) };
  const add = run('b4_added', "git diff -U0 e4fa52fe 0fa163b8 -- index.html capex/index.html | grep -E '^[+-][^+-]'", AFTER, 0); F.b4.changedLines = add.lines; F.b4.allCommentMarkers = add.lines.length === F.b4.insertions && add.lines.every(l => /^\+<!-- §MANIFEST:(BEGIN|END) /.test(l));
  const tb = run('b4_tag_before', "git show e4fa52fe:index.html | grep -A1 'data-goatcounter'", AFTER, 0), ta = run('b4_tag_after', "git show 0fa163b8:index.html | grep -A1 'data-goatcounter'", AFTER, 0);
  F.b4.tagBefore = tb.lines; F.b4.tagAfter = ta.lines; F.b4.tagSame = F.b4.tagBefore.length === 2 && F.b4.tagBefore.join('\n') === F.b4.tagAfter.join('\n');
  const all = showFile(SHA_A, 'index.html', AFTER), tagAt = all.findIndex(l => /data-goatcounter/.test(l)) + 1, endAt = all.findIndex((l, i) => i >= tagAt && /§MANIFEST:END viewer tags/.test(l)) + 1, begAt = all.findIndex((l, i) => i < tagAt - 1 && /§MANIFEST:BEGIN viewer tags/.test(l) && i > tagAt - 4) + 1;
  F.b4.tagLine = tagAt; F.b4.beginLine = begAt; F.b4.endLine = endAt; excerpt('b4_tag', { sha: SHA_A, path: 'index.html', tree: AFTER, marks: [tagAt, tagAt + 1], from: tagAt - 3, to: endAt, amb: null }); F.ex.b4_tag.fence = [begAt, endAt]; }

// ================= b5: the proof (the witness runs a minute each time: typed line, the same witness on the OLD code, and the full output of the typed run for counting)
const B5 = 'node scripts/tests/witness_manifest_roundtrip.js | tail -1';
{ const r = run('b5', B5, AFTER, 0); step('b5', B5, r);
  const rt = /(§MANIFEST_ROUNDTRIP .*)$/.exec(r.out); if (!rt) fail('b5: no §MANIFEST_ROUNDTRIP line'); F.b5 = { line: rt[1], claims: grab(rt[1], /claims=(\d+\/\d+)/), red: grab(rt[1], /red=(\d+\/\d+)/), outsideOwned: grab(rt[1], /outside_owned=(\d+\/\d+)/), frozen: +grab(rt[1], /frozen=(\d+)/), verdict: grab(rt[1], /verdict=(\w+)/) };
  const full = run('b5_full', 'node scripts/tests/witness_manifest_roundtrip.js', AFTER, 0); F.b5.redDetectedY = (full.out.match(/§MANIFEST_RED id=R\d+ detected=Y/g) || []).length; F.b5.redDetectedN = (full.out.match(/§MANIFEST_RED id=R\d+ detected=N/g) || []).length;
  const old = run('b5_old', 'MANIFEST_W_OLD=/tmp/wt-film5-before MANIFEST_W_C22_ROOT=/tmp/wt-film5-before node scripts/tests/witness_manifest_roundtrip.js', AFTER, 1, {});
  const pick = re => (old.lines.find(l => re.test(l)) || '').trim(), c22 = pick(/§MANIFEST_RED_RUN id=C22 /), c23 = pick(/§MANIFEST_CLAIM id=C23 /), c24 = pick(/§MANIFEST_CLAIM id=C24 /), c25 = pick(/§MANIFEST_CLAIM id=C25 /), r26 = (full.lines.find(l => /§MANIFEST_RED id=R26 /.test(l)) || '').trim();
  F.b5.old = { c22, c23, c24, c25, r26, c22Fail: /verdict=FAIL/.test(c22), c23Ok: /ok=Y/.test(c23), c24Fail: /ok=N/.test(c24), c25Fail: /ok=N/.test(c25), r26Detected: /detected=Y/.test(r26), oldTotals: grab(old.out, /§MANIFEST_ROUNDTRIP .*claims=(\d+\/\d+)/) };
  F.b5.old.failed = [F.b5.old.c22Fail, F.b5.old.c24Fail, F.b5.old.c25Fail].filter(Boolean).length; F.b5.old.of = 4;
  fs.writeFileSync(path.join(OUT, 'file_b5_old.txt'), '§FILE name=b5_old from=b5_old.log\n' + [c22, c23, c24, c25, r26].map(l => l.split(BEFORE).join('<' + SHA_B + '>')).join('\n') + '\n');
  const st = run('b5_status', 'git status --short', AFTER, 0); F.b5.dirtyAfter = st.lines.length; }

// ================= the last card: counts and the credentials, read now
{ const ns = run('close_numstat', 'git diff --numstat e4fa52fe 0fa163b8 -- scripts/bump.js', AFTER, 0), m = /^(\d+)\t(\d+)\tscripts\/bump\.js/.exec(ns.out);
  const fr = run('close_frozen', "grep -n \"FROZEN = \\[\" scripts/gen_manifest.js", AFTER, 0), fz = /FROZEN = \[([^\]]*)\]/.exec(fr.out);
  const own = grab(F.b5.line, /outside_owned=(\d+\/\d+)/), cap = (full => { const l = clean(fs.readFileSync(path.join(OUT, 'cmd_b5_full.log'), 'utf8')).split('\n').find(x => /§MANIFEST_CLAIM id=C22 /.test(x)) || ''; const mm = /\((capex\/index\.html,import_own\.js,index\.html)\)/.exec(l); return mm ? mm[1].split(',') : []; })();
  F.change = { bumpAdded: +m[1], bumpDeleted: +m[2], frozen: fz ? fz[1].replace(/['" ]/g, '').split(',') : [], outsideOwned: own, outsideFiles: cap, pages: cap.filter(f => /\.html$/.test(f)).length, loaders: cap.filter(f => /\.js$/.test(f)).length };
  const pr = (repo, n) => (cp.spawnSync('gh', ['pr', 'view', String(n), '-R', repo, '--json', 'state,title', '-q', '.state + " " + .title'], { encoding: 'utf8' }).stdout || '').trim();
  F.credentials = { ootb: { n: 3385, state: pr('red1oon/bim-ootb', 3385) }, fixes: 3379, decisions: {} }; for (const n of [1116, 1117, 1118, 1128]) F.credentials.decisions[n] = pr('red1oon/BIMCompiler', n);
  const ps = run('close_pr_body', 'gh pr view 3385 -R red1oon/bim-ootb --json body -q .body | grep -n "^Fixes #3379"', AFTER, 0); F.credentials.fixesLine = ps.lines[0] || '';
  F.guide = { url: 'https://red1oon.github.io/BIMCompiler/DeveloperGuide/#52-adding-a-new-browser-file' }; L('change ' + JSON.stringify(F.change)); L('credentials ' + JSON.stringify(F.credentials)); }
// ---- verdict
const bad = [];
const must = (t, ok) => { if (!ok) bad.push(t); L((ok ? 'OK   ' : 'FAIL ') + t); };
must('b1: index.html asks for ?v=' + F.b1.indexV + ', viewer.html for ?v=' + F.b1.viewerV + ' (different, from the real grep)', F.b1.indexV !== F.b1.viewerV && F.b1.viewerV > F.b1.indexV);
must('b1: the commit that raised the viewer page touched viewer/viewer.html and not index.html, in November (' + F.b1.commit.date + ')', F.b1.commit.touchesViewerHtml && !F.b1.commit.touchesIndex && /^\d{4}-11-/.test(F.b1.commit.date));
must('b1: the manifest check of the BEFORE tree said nothing (verdict ' + F.b1.beforeCheckVerdict + ')', F.b1.beforeCheckVerdict === 'PASS');
must('b2: the dry run names index.html, import_own.js, v ' + F.b2.v + ', manifest ' + F.b2.manifest + ', writes nothing, no sw line, sw=' + F.b2.sw, F.b2.page === 'index.html' && F.b2.v === '7->8' && F.b2.manifest === 'viewer/modules.json' && F.b2.written === 0 && F.b2.sw === 0 && F.b2.swLines === 0 && F.b2.mode === 'dry-run');
must('b2: no sw.js at the root and index.html never mentions serviceWorker (' + F.b2.swFiles.join(' ') + ')', F.b2.swFiles.every(f => /^\.\/(viewer|erp|modeller|oplogpic)\/sw\.js$/.test(f)) && F.b2.indexSwMentions === 0);
must('b3: the check exited 1, names ' + F.b3.failFile + ':' + F.b3.failLine + ' and the fix command, the unfiltered run also exits 1', F.b3.verdict === 'FAIL' && F.b3.fullExit === 1 && F.b3.failFile === 'index.html' && F.b3.failLine === 187 && /^node scripts\/gen_manifest\.js --write viewer$/.test(F.b3.fixCommand || ''));
must('b3: the AFTER tree is clean again after the undo', F.b3.restored);
must('b4: 2 files, 6 insertions, 0 deletions, import_own.js not in the stat, every added line a marker comment, the analytics tag identical before and after', F.b4.files === 2 && F.b4.insertions === 6 && F.b4.deletions === 0 && !F.b4.importOwnInStat && F.b4.allCommentMarkers && F.b4.tagSame);
must('b5: the witness line on the new code: claims ' + F.b5.claims + ' red ' + F.b5.red + ' outside_owned ' + F.b5.outsideOwned + ' frozen ' + F.b5.frozen + ' verdict ' + F.b5.verdict, /^(\d+)\/\1$/.test(F.b5.claims) && /^(\d+)\/\1$/.test(F.b5.red) && F.b5.outsideOwned === '3/3' && F.b5.frozen === 1 && F.b5.verdict === 'PASS');
must('b5: every planted fault caught in the full run (R lines detected=Y ' + F.b5.redDetectedY + ', N ' + F.b5.redDetectedN + ')', F.b5.redDetectedN === 0 && F.b5.redDetectedY === +F.b5.red.split('/')[0]);
must('b5: on the OLD code ' + F.b5.old.failed + ' of ' + F.b5.old.of + ' new checks fail, C23 cannot (ok=Y there) and R26 shows it can fail', F.b5.old.failed === 3 && F.b5.old.c23Ok && F.b5.old.r26Detected && F.b5.old.c22Fail);
must('the trees are clean after every run (b2 ' + F.b2.dirtyAfter + ', b5 ' + F.b5.dirtyAfter + ' changed files)', F.b2.dirtyAfter === 0 && F.b5.dirtyAfter === 0);
must('last card: bump.js +' + F.change.bumpAdded + ' -' + F.change.bumpDeleted + ', ' + F.change.pages + ' pages + ' + F.change.loaders + ' loader outside the three apps, frozen ' + F.change.frozen.join(','), F.change.bumpAdded === 19 && F.change.bumpDeleted === 88 && F.change.pages === 2 && F.change.loaders === 1 && F.change.frozen.join() === 'archive/gallery.html');
must('credentials: bim-ootb #3385 and BIMCompiler #1116 #1117 #1118 #1128 are MERGED, and #3385 says Fixes #3379', /^MERGED/.test(F.credentials.ootb.state) && Object.values(F.credentials.decisions).every(s => /^MERGED/.test(s)) && /Fixes #3379/.test(F.credentials.fixesLine));
must('every typed command exited as expected ' + JSON.stringify(EXPECT), true);
fs.writeFileSync(path.join(OUT, 'facts.json'), JSON.stringify(F, null, 1)); L('VERDICT ' + (bad.length ? 'FAIL ' + bad.length : 'PASS')); process.exit(bad.length ? 1 : 0);
