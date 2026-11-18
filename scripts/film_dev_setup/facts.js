// ⚠ DO NOT REMOVE — SCOPE: film 4 "CH 0 · From an empty folder to a witnessed dev setup" (prompts/FILM_IMMERSIVE_SOFTWARE.md FILM 4). The facts of the film, none typed by hand:
//   WORK = a fresh copy of the from-scratch download (BASE, made by `node scripts/tests/witness_from_scratch.js --keep`, log out/from_scratch.log) · pages.js (three apps, Save Building, offline)
//   · every command the film TYPES is run here, byte for byte, in WORK (`bash -c`), and its whole output kept in out/cmd_<id>_<n>.log with the exit code · the hand-edit and PROVES-header reds run on WORK,
//   which is a COPY of the download (never the owner's checkout, never his VS Code profile) and are undone with `git checkout -- .` after each demo · the VS Code plan (file:line of every still) is derived here.
// Usage: node facts.js <BASE = the kept from-scratch folder, e.g. ~/.cache/film_dev_setup/fs1/bim-ootb-main> <transcript .jsonl of the session that builds the film>
// READ out/facts.log and every out/cmd_*.log: exit code is not evidence.
'use strict';
const fs = require('fs'), path = require('path'), os = require('os'), cp = require('child_process');
const BASE = path.resolve(process.argv[2]), TRANSCRIPT = path.resolve(process.argv[3]), CACHE = path.join(os.homedir(), '.cache', 'film_dev_setup'), WORK = path.join(CACHE, 'work'), EXT = path.join(CACHE, 'ext'), USR = path.join(CACHE, 'user');
const OUT = path.join(__dirname, 'out'), L = m => console.log('§FACTS ' + m), fail = m => { L('FAIL ' + m); process.exit(1); };
const sh = (cmd, o) => cp.spawnSync('nice', ['-n', '19', 'ionice', '-c3', 'bash', '-c', cmd], Object.assign({ cwd: WORK, encoding: 'utf8', maxBuffer: 1 << 28, timeout: 900000, stdio: ['ignore', 'pipe', 'pipe'], env: Object.assign({}, process.env, { T: TRANSCRIPT, CUDA_VISIBLE_DEVICES: '' }) }, o || {}));
const F = { made: new Date().toISOString(), base: BASE, work: WORK, transcript: TRANSCRIPT, steps: {} };
// 0. WORK = a fresh copy of the download; the editor's throwaway extension / user folders are made fresh too
for (const d of [WORK, EXT, USR]) fs.rmSync(d, { recursive: true, force: true });
cp.execFileSync('cp', ['-r', '--reflink=auto', BASE, WORK]); L('work=' + WORK + ' (copy of ' + BASE + ')');
const scratch = fs.readFileSync(path.join(OUT, 'from_scratch.log'), 'utf8'), grab = (t, re, i) => { const m = re.exec(t); return m ? m[i || 1] : null; };
// 1. the from-scratch run (done before, log kept) and the pages
F.scratch = { files: +grab(scratch, /§FROM_SCRATCH_S2 files=(\d+)/), mb: +grab(scratch, /§FROM_SCRATCH_S2 files=\d+ mb=(\d+)/), lfs: +grab(scratch, /lfs_pointer_files=(\d+)/), gaps: +grab(scratch, /§FROM_SCRATCH steps_ran=\d+\/\d+ gaps=(\d+)/),
  verdict: grab(scratch, /§FROM_SCRATCH steps_ran=.* verdict=(\w+)/), steps: grab(scratch, /§FROM_SCRATCH steps_ran=(\d+\/\d+)/), vsix: grab(scratch, /vsix=(\S+)/), viewerText: grab(scratch, /page=viewer\/viewer\.html .*first_words="([^"]*)"/),
  viewerFail: +grab(scratch, /page=viewer\/viewer\.html status=\d+ http_fail=(\d+)/), viewerHosts: grab(scratch, /page=viewer\/viewer\.html .*outside_hosts=\[([^\]]*)\]/), erpFail: +grab(scratch, /page=erp\/idempiere\.html status=\d+ http_fail=(\d+)/), erpErr: +grab(scratch, /page=erp\/idempiere\.html .* console_errors=(\d+)/),
  modFail: +grab(scratch, /page=modeller\/modeller\.html status=\d+ http_fail=(\d+)/), modErr: +grab(scratch, /page=modeller\/modeller\.html .* console_errors=(\d+)/) };
if (F.scratch.verdict !== 'PASS') fail('from_scratch.log verdict ' + F.scratch.verdict);
L('scratch ' + JSON.stringify(F.scratch));
{ const r = cp.spawnSync('nice', ['-n', '19', process.execPath, path.join(__dirname, 'pages.js'), WORK], { encoding: 'utf8', maxBuffer: 1 << 26, timeout: 900000 }); fs.writeFileSync(path.join(OUT, 'pages.log'), (r.stdout || '') + (r.stderr || '')); process.stdout.write(r.stdout || '');
  if (r.status !== 0) fail('pages.js failed, see out/pages.log'); F.pages = JSON.parse(fs.readFileSync(path.join(OUT, 'pages.json'), 'utf8')); }
// 2. the typed commands. Each is `bash -c` in WORK; output kept whole; `show` = which output lines the film's terminal strip prints (never reworded, only cut to the strip's width by cards.js)
const T = (id, n, typed, show) => { const r = sh(typed), out = ((r.stdout || '') + (r.stderr || '')).replace(/\u001b\[[0-9;]*m/g, ''), lines = out.split('\n').filter(l => l.trim() !== '');
  fs.writeFileSync(path.join(OUT, 'cmd_' + id + '_' + n + '.log'), '$ ' + typed + '\n' + out + '\n§CMD_EXIT ' + r.status + '\n'); const shown = (show ? show(lines) : lines).map(l => l.split(WORK).join('<download>'));
  (F.steps[id] = F.steps[id] || []).push({ typed, exit: r.status, lines: lines.length, shown }); L('cmd ' + id + '_' + n + ' exit=' + r.status + ' lines=' + lines.length + ' $ ' + typed.slice(0, 110)); return { r, lines, out }; };
const restore = why => { const r = sh('git checkout -q -- . && git diff --name-only | wc -l'); L('restore after ' + why + ' tracked_changes=' + (r.stdout || '').trim()); if ((r.stdout || '').trim() !== '0') fail('WORK not restored after ' + why); };
const last = n => ls => ls.slice(-n), grep = re => ls => ls.filter(l => re.test(l));
// b2 the add-on: pack, install into a THROWAWAY extensions folder
T('b2', 1, 'node devtools/vscode/pack.js', last(2));
T('b2', 2, 'code --extensions-dir ../ext --user-data-dir ../user --install-extension devtools/vscode/dist/x0-navigator-0.1.0.vsix', grep(/Installing extensions|successfully installed/));
F.ext = { listed: /x0-navigator/.test(sh('code --extensions-dir ../ext --user-data-dir ../user --list-extensions').stdout || '') }; L('ext listed=' + F.ext.listed); if (!F.ext.listed) fail('the .vsix is not installed in ../ext');
// b3 the same facts in a terminal
T('b3', 1, 'node devtools/x0/x0.js where camera'); T('b3', 2, 'node devtools/x0/x0.js loaded viewer/scene.js'); T('b3', 3, 'node devtools/x0/x0.js tag §MANIFEST_CHECK', ls => ls.slice(1, 7));
// b4 the manifest refuses a hand edit (the download is a ZIP: no .git, no lint package — both found by this film, see the gap lines)
const pre = sh('node scripts/gen_manifest.js --check modeller 2>&1 | head -40'), WP = WORK + 'p'; fs.rmSync(WP, { recursive: true, force: true }); cp.execFileSync('cp', ['-r', '--reflink=auto', WORK, WP]);
const npmP = sh('npm install --no-audit --no-fund 2>&1 | tail -1', { cwd: WP }), pre2 = sh('node scripts/gen_manifest.js --check modeller 2>&1 | head -40', { cwd: WP }); fs.rmSync(WP, { recursive: true, force: true });
F.zipGap = { espree: (/Cannot find module '[^']*(node_modules\/espree)'/.exec(pre.stdout) || [])[1] || '', git: /not a git repository/.test(pre2.stdout) ? 'not a git repository' : '', gitCmd: (/Command failed: (git [^\n]*)/.exec(pre2.stdout) || [])[1] || '' };
fs.writeFileSync(path.join(OUT, 'cmd_b4_gap.log'), '$ node scripts/gen_manifest.js --check modeller   (the ZIP as downloaded)\n' + pre.stdout + '\n$ npm install ... ; node scripts/gen_manifest.js --check modeller   (a throwaway copy: lint package installed, still no git)\n' + (npmP.stdout || '') + '\n' + pre2.stdout + '\n'); L('zip gap ' + JSON.stringify(F.zipGap));
if (!F.zipGap.espree || !F.zipGap.git) fail('the two ZIP gaps were not both reproduced');
T('b4', 1, 'npm install --no-audit --no-fund && git init -q && git add -A', last(2));
const editRe = "arc_editable.js?v=[0-9]*", editTo = 'arc_editable.js?v=99', htmlBefore = fs.readFileSync(path.join(WORK, 'modeller/modeller.html'), 'utf8');
T('b4', 2, "sed -i 's/" + editRe + '/' + editTo + "/' modeller/modeller.html");
const red = T('b4', 3, 'node scripts/gen_manifest.js --check modeller | grep -E "MANIFEST_(FAIL|CHECK)"', ls => ls.map(l => l.replace(/^(§MANIFEST_CHECK) .*(source=\S+ written=\d+ verdict=\w+)$/, '$1 … $2')));
const failLine = (/§MANIFEST_FAIL (\S+):(\d+) /.exec(red.out) || []); F.manifest = { redFile: failLine[1], redLine: +failLine[2], redVerdict: grab(red.out, /§MANIFEST_CHECK .* verdict=(\w+)/), redCommand: /node scripts\/gen_manifest\.js --write modeller/.test(red.out) };
T('b4', 4, 'node scripts/bump.js modeller/arc_editable.js --write', last(4));
const green = T('b4', 5, 'node scripts/gen_manifest.js --check modeller | grep -E "MANIFEST_(FAIL|CHECK)"', ls => ls.map(l => l.replace(/^(§MANIFEST_CHECK) .*(identical=\S+) .* (deps_declared=\S+) (order_check=\S+) .* (verdict=\w+)$/, '$1 … $2 … $3 $4 … $5')));
Object.assign(F.manifest, { greenIdentical: grab(green.out, /§MANIFEST_CHECK apps=\d+ files=(\d+ identical=\d+\/\d+)/, 1), greenDeps: +grab(green.out, /deps_declared=(\d+)/), greenOrder: grab(green.out, /order_check=(\w+)/), greenVerdict: grab(green.out, /verdict=(\w+)/) });
F.manifest.editedLineText = htmlBefore.split('\n')[F.manifest.redLine - 1]; restore('b4'); L('manifest ' + JSON.stringify(F.manifest));
// b5 proof you can read
const PW = 'modeller/tests/witness_clipboard.js', pwText = fs.readFileSync(path.join(WORK, PW), 'utf8').split('\n'), pwLine = pwText.findIndex(l => /^\/\/ PROVES:/.test(l)) + 1; if (!pwLine) fail('no PROVES line in ' + PW);
const PMsh = l => l.replace(/ cached=.*$/, '');   // the strip shows the counts; the cache columns are this machine's
const g1 = T('b5', 1, 'node scripts/gen_proof_map.js modeller | tail -1', ls => ls.map(PMsh));
T('b5', 2, "sed -i '/^\\/\\/ PROVES:/a // PROVES: modeller/missing_file.js' " + PW);
const r2 = T('b5', 3, 'node scripts/gen_proof_map.js modeller | tail -1', ls => ls.map(PMsh));
const pm = o => ({ modules: +grab(o, /modules=(\d+)/), proven: +grab(o, /proven=(\d+)/), namedOnly: +grab(o, /named_only=(\d+)/), unproven: +grab(o, /unproven=(\d+)/), proves: +grab(o, /proves_lines=(\d+)/), bad: +grab(o, /bad_paths=(\d+)/) });
F.proof = { green: pm(g1.out), red: pm(r2.out), file: PW, line: pwLine }; restore('b5'); L('proof ' + JSON.stringify(F.proof));
// b6 what CI runs
const c1 = T('b6', 1, "git ls-files | grep -cE '(^|/)(witness_|poc_)[^/]*\\.js$'"), c2 = T('b6', 2, "node -e \"const t=require('./tests/ci_fast_tier.json');console.log(t.witnesses.length,'in the fast tier,',t.exclude.length,'excluded')\""), c3 = T('b6', 3, "node -e \"const t=require('./tests/ci_fast_tier.json').exclude[1];console.log(t.file+' — '+t.reason.slice(0,100))\"");
const ciLines = fs.readFileSync(path.join(WORK, 'tests/ci_fast_tier.json'), 'utf8').split('\n'), ex1 = JSON.parse(ciLines.join('\n')).exclude[1].file, ciReason = ciLines.findIndex(l => /"reason"/.test(l) && l.indexOf(ex1) >= 0) + 1; if (!ciReason) fail('no exclude row for ' + ex1);
F.ci = { witnessFiles: +c1.lines[0], tier: +grab(c2.out, /^(\d+) in the fast tier/), excluded: +grab(c2.out, /, (\d+) excluded/), reasonLine: ciReason, reasonFile: ex1, reasonText: c3.lines[0] }; L('ci ' + JSON.stringify(F.ci));
// b7 the session's bill (the session that BUILDS this film: its own transcript)
const s = T('b7', 1, 'node devtools/x0/x0.js session --transcript $T', ls => ls.filter(l => !/^§/.test(l)));
const sl = grab(s.out, /(§X0_SESSION .*)/); F.session = { line: sl, minutes: +grab(sl, /minutes=(\d+)/), replies: +grab(sl, /replies=(\d+)/), tokensOut: +grab(sl, /tokens_out=(\d+)/), prs: +grab(sl, /prs=(\d+)/), witnesses: +grab(sl, /witnesses=(\d+)/), load: grab(sl, /load=(\S+)/), notMerged: +grab(sl, /not_merged=(\d+)/) }; L('session ' + JSON.stringify(F.session));
// 3. the x0 numbers the narration may use, read from the logs just written
const rd = (id, n) => fs.readFileSync(path.join(OUT, 'cmd_' + id + '_' + n + '.log'), 'utf8'), w = rd('b3', 1), lo = rd('b3', 2), tg = rd('b3', 3);
F.x0 = { whereFile: grab(w, /written at (\S+):(\d+)/, 1), whereLine: +grab(w, /written at \S+:(\d+)/), writes: +grab(w, /· (\d+) writes/), reads: +grab(w, /· (\d+) reads/), bytes: +grab(lo, /· (\d+) bytes/), how: grab(lo, /viewer → ([^·]+) ·/).trim(), tagSpec: /no spec found/.test(tg), printers: (tg.match(/^- `/gm) || []).length, notSearched: /not searched: bim-compiler/.test(tg) };
L('x0 ' + JSON.stringify(F.x0));
// 4. the VS Code plan (every still: file, line, what the suite does there); the suite logs what the editor itself shows
F.vsc = [ { name: 'b2_hover', file: 'viewer/grid_views.js', line: F.x0.whereLine, find: 'A.camera', action: 'hover' }, { name: 'b3_where', file: 'viewer/grid_views.js', line: F.x0.whereLine, find: 'A.camera', action: 'select' },
  { name: 'b4_edit', file: F.manifest.redFile, line: F.manifest.redLine, action: 'replace', re: editRe, to: editTo }, { name: 'b5_header', file: PW, line: pwLine, action: 'select' }, { name: 'b5_proves', file: PW, line: pwLine + 1, action: 'insert', after: pwLine, text: '// PROVES: modeller/missing_file.js' },
  { name: 'b6_ci', file: 'tests/ci_fast_tier.json', line: ciReason, action: 'select' }, { name: 'b7_session', file: 'devtools/x0/session.js', line: 1, action: 'select' } ];
// 5. credentials for the last card (read now, from GitHub and the repo's own files)
const pr = n => (cp.spawnSync('gh', ['pr', 'view', String(n), '-R', 'red1oon/bim-ootb', '--json', 'state,title', '-q', '.state + " " + .title'], { encoding: 'utf8' }).stdout || '').trim();
F.credentials = { licence: fs.readFileSync(path.join(WORK, 'LICENSE'), 'utf8').split('\n')[0].trim(), repo: 'github.com/red1oon/bim-ootb', commit: (fs.readFileSync(path.join(CACHE, 'base_commit.txt'), 'utf8') || '').trim(), prs: {} };
for (const n of [3245, 3250, 3256, 3259, 3266, 3274, 3280]) F.credentials.prs[n] = pr(n); L('credentials ' + JSON.stringify(F.credentials));
const ok = F.pages.ok && F.manifest.redVerdict === 'FAIL' && F.manifest.greenVerdict === 'PASS' && F.manifest.redCommand && F.proof.green.bad === 0 && F.proof.red.bad === 1 && F.ci.tier > 0 && F.session.minutes > 0 &&
  Object.values(F.credentials.prs).every(x => /^MERGED/.test(x)) && /MIT/.test(F.credentials.licence) && Object.values(F.steps).every(a => a.every(x => x.exit === 0));
fs.writeFileSync(path.join(OUT, 'facts.json'), JSON.stringify(F, null, 1)); L('VERDICT ' + (ok ? 'PASS' : 'FAIL')); process.exit(ok ? 0 : 1);
