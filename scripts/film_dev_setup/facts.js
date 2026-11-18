// ⚠ DO NOT REMOVE — SCOPE: film 4 v4 "CH 0 · From an empty folder to a witnessed dev setup" (prompts/FILM_IMMERSIVE_SOFTWARE.md FILM 4; spec bim-compiler prompts/CODE_ARCHITECTURE_DESIGN.md §F.39). The facts of the film, none typed by hand:
//   · the REAL download: the typed step-0 line (curl | tar from github.com/red1oon/bim-ootb/archive/refs/heads/main.tar.gz) is run byte for byte in an empty folder; the commit is read from the tarball's own header
//   · `node scripts/setup.js --open` is run byte for byte in that download, on a private virtual display (Xvfb :95): the REAL VS Code it launches (throwaway profile under <download>/.setup/) is photographed (stills/s_open.png)
//   · every other typed command is run here byte for byte; its whole output is kept in out/cmd_<id>_<n>.log with the exit code; the hand-edit and PROVES-header demos run on the DOWNLOAD (never the owner's checkout or
//     profile) and are undone by restoring the files (a ZIP has no .git: the restore is a content-hash check of every file, the way W-SETUP judges a tree)
//   · W-FROM-SCRATCH is run once (out/from_scratch.log): the named gaps come from it
//   · the VS Code plan (file:line of every still) is derived here; shoot.sh performs it in the real editor
// Usage: node facts.js <transcript .jsonl of the session that builds the film>      READ out/facts.log and every out/cmd_*.log: exit code is not evidence.
'use strict';
const fs = require('fs'), path = require('path'), os = require('os'), cp = require('child_process'), crypto = require('crypto');
const TRANSCRIPT = path.resolve(process.argv[2]), CACHE = path.join(os.homedir(), '.cache', 'film_dev_setup4'), DL = path.join(CACHE, 'dl'), WORK = path.join(DL, 'bim-ootb-main');
const OUT = path.join(__dirname, 'out'), L = m => console.log('§FACTS ' + m), fail = m => { L('FAIL ' + m); process.exit(1); };
const URL = 'https://github.com/red1oon/bim-ootb/archive/refs/heads/main.tar.gz', OOTB = path.join(os.homedir(), 'bim-ootb'), DISP = ':95';
const sh = (cmd, o) => cp.spawnSync('nice', ['-n', '19', 'ionice', '-c3', 'bash', '-c', cmd], Object.assign({ cwd: WORK, encoding: 'utf8', maxBuffer: 1 << 28, timeout: 1200000, stdio: ['ignore', 'pipe', 'pipe'], env: Object.assign({}, process.env, { T: TRANSCRIPT, CUDA_VISIBLE_DEVICES: '' }) }, o || {}));
const clean = s => (s || '').replace(/\u001b\[[0-9;]*m/g, '');
const F = { made: new Date().toISOString(), work: WORK, transcript: TRANSCRIPT, steps: {} };
const grab = (t, re, i) => { const m = re.exec(t); return m ? m[i || 1] : null; };
fs.mkdirSync(OUT, { recursive: true });
// the typed lines, each run for real; `show` = which output lines the film's terminal strip prints (never reworded; the cards cut a line to the strip's width)
const T = (id, n, typed, show, o) => { const r = sh(typed, o), out = clean((r.stdout || '') + (r.stderr || '')), lines = out.split('\n').filter(l => l.trim() !== '');
  fs.writeFileSync(path.join(OUT, 'cmd_' + id + '_' + n + '.log'), '$ ' + typed + '\n' + out + '\n§CMD_EXIT ' + r.status + '\n'); const shown = (show ? show(lines) : lines).map(l => l.split(WORK).join('<download>'));
  (F.steps[id] = F.steps[id] || []).push({ typed, exit: r.status, lines: lines.length, shown }); L('cmd ' + id + '_' + n + ' exit=' + r.status + ' lines=' + lines.length + ' $ ' + typed.slice(0, 120)); return { r, lines, out }; };
const last = n => ls => ls.slice(-n);
// the tree hash: every file but node_modules and .setup (path:size, content hash under 5 MB), as W-SETUP judges "unchanged"
const treeHash = () => { const h = crypto.createHash('sha1'), files = []; (function w(p) { for (const n of fs.readdirSync(path.join(WORK, p)).sort()) { if (!p && (n === 'node_modules' || n === '.setup')) continue; const r = p ? p + '/' + n : n, st = fs.lstatSync(path.join(WORK, r));
  if (st.isDirectory()) w(r); else { files.push(r); h.update(r + ':' + st.size + ':' + (st.size < 5e6 ? crypto.createHash('sha1').update(fs.readFileSync(path.join(WORK, r))).digest('hex') : '') + ';'); } } })(''); return { hash: h.digest('hex'), n: files.length }; };
// 1. W-FROM-SCRATCH once (its own download = git archive of origin/main; the named gaps come from its log)
{ const r = cp.spawnSync('nice', ['-n', '19', 'ionice', '-c3', process.execPath, 'scripts/tests/witness_from_scratch.js'], { cwd: OOTB, encoding: 'utf8', maxBuffer: 1 << 28, timeout: 1500000, stdio: ['ignore', 'pipe', 'pipe'] });
  fs.writeFileSync(path.join(OUT, 'from_scratch.log'), (r.stdout || '') + (r.stderr || '')); const sc = r.stdout || '';
  F.scratch = { files: +grab(sc, /§FROM_SCRATCH_S2 files=(\d+)/), mb: +grab(sc, /§FROM_SCRATCH_S2 files=\d+ mb=(\d+)/), gaps: +grab(sc, /§FROM_SCRATCH steps_ran=\d+\/\d+ gaps=(\d+)/), steps: grab(sc, /§FROM_SCRATCH steps_ran=(\d+\/\d+)/), verdict: grab(sc, /§FROM_SCRATCH steps_ran=.* verdict=(\w+)/),
    setupLine: grab(sc, /(§FROM_SCRATCH_S5_SETUP .*)/), viewerFail: +grab(sc, /page=viewer\/viewer\.html status=\d+ http_fail=(\d+)/), viewerHosts: grab(sc, /page=viewer\/viewer\.html .*outside_hosts=\[([^\]]*)\]/) };
  L('from_scratch ' + JSON.stringify(F.scratch)); if (F.scratch.verdict !== 'PASS') fail('W-FROM-SCRATCH verdict ' + F.scratch.verdict + ' (see out/from_scratch.log)'); }
// 2. step 0: the REAL fetch, in an empty folder
fs.rmSync(CACHE, { recursive: true, force: true }); fs.mkdirSync(DL, { recursive: true });
const STEP0 = 'curl -L ' + URL + ' | tar xz && cd bim-ootb-main';
{ const t0 = Date.now(), r = sh(STEP0 + ' && pwd', { cwd: DL }), out = clean((r.stdout || '') + (r.stderr || '')), meter = out.split(/[\r\n]+/).filter(l => /^\s*\d+\s+\d+/.test(l)).slice(-1)[0] || '';
  const commit = (sh('curl -sL ' + URL + ' | head -c 3000000 | gzip -dc 2>/dev/null | git get-tar-commit-id', { cwd: DL }).stdout || '').trim();
  const files = +(sh('find . -type f | wc -l', { cwd: WORK }).stdout || '0').trim(), mb = Math.round(+(sh('du -sb .', { cwd: WORK }).stdout || '0').split('\t')[0] / 1048576), secs = Math.round((Date.now() - t0) / 1000);
  fs.writeFileSync(path.join(OUT, 'cmd_b1_0.log'), '$ ' + STEP0 + '\n' + out + '\n§FETCH commit=' + commit + ' files=' + files + ' mb=' + mb + ' secs=' + secs + '\n§CMD_EXIT ' + r.status + '\n');
  F.fetch = { typed: STEP0, exit: r.status, commit, files, mb, meter: meter.trim().replace(/\s+/g, ' '), secs, pwd: (out.trim().split('\n').slice(-1)[0] || '') }; L('fetch ' + JSON.stringify(F.fetch));
  if (r.status !== 0 || !/^[0-9a-f]{40}$/.test(commit) || files < 1000) fail('the step-0 fetch did not work (see out/cmd_b1_0.log)'); }
// 3. step 1: `node scripts/setup.js --open` for real, on a private virtual display. The throwaway profile gets presentation settings first (the editor's own files, nothing of the project).
const PROF = path.join(WORK, '.setup', 'vscode-user'), SETTINGS = { 'telemetry.telemetryLevel': 'off', 'update.mode': 'none', 'extensions.autoUpdate': false, 'security.workspace.trust.enabled': false, 'workbench.startupEditor': 'none', 'git.enabled': false,
  'window.zoomLevel': 0.6, 'editor.minimap.enabled': false, 'workbench.tips.enabled': false, 'window.commandCenter': false, 'workbench.layoutControl.enabled': false, 'chat.disableAIFeatures': true, 'window.titleBarStyle': 'native', 'window.menuBarVisibility': 'hidden',
  'breadcrumbs.enabled': false, 'editor.stickyScroll.enabled': false, 'editor.inlayHints.enabled': 'off', 'editor.codeLens': false, 'editor.hover.delay': 100, 'terminal.integrated.gpuAcceleration': 'off', 'files.autoSave': 'off', 'workbench.editor.showTabs': 'single', 'workbench.statusBar.visible': true,
  'editor.renderLineHighlight': 'none', 'editor.occurrencesHighlight': 'off', 'editor.selectionHighlight': false, 'editor.cursorBlinking': 'solid', 'editor.matchBrackets': 'never' };   // v4: nothing but the selection itself may change between the pointer stills (pointer.py derives the token's rectangle from that diff)
fs.mkdirSync(path.join(PROF, 'User', 'globalStorage'), { recursive: true }); fs.writeFileSync(path.join(PROF, 'User', 'settings.json'), JSON.stringify(SETTINGS, null, 1));
fs.writeFileSync(path.join(PROF, 'User', 'globalStorage', 'storage.json'), JSON.stringify({ windowsState: { lastActiveWindow: { folder: 'file://' + WORK, uiState: { mode: 1, x: 0, y: 0, width: 1920, height: 1080 } }, openedWindows: [] } }));   // the window fills the 1920x1080 display
fs.writeFileSync(path.join(OUT, 'profile_settings.json'), JSON.stringify(SETTINGS, null, 1));
const xvfb = cp.spawn('Xvfb', [DISP, '-screen', '0', '1920x1080x24', '-nolisten', 'tcp'], { stdio: 'ignore' }); cp.spawnSync('sleep', ['2']);
const STEP1 = 'node scripts/setup.js --open', before0 = treeHash(); fs.mkdirSync(path.join(OUT, 'stills'), { recursive: true });
const s1 = T('b1', 1, STEP1, ls => ls, { env: Object.assign({}, process.env, { DISPLAY: DISP, CUDA_VISIBLE_DEVICES: '' }) });
const S = s1.out; F.setup = { exit: s1.r.status, steps: +grab(S, /§SETUP steps=(\d+)/), ok: +grab(S, /§SETUP steps=\d+ ok=(\d+)/), gaps: +grab(S, /§SETUP steps=\d+ ok=\d+ gaps=(\d+)/), verdict: grab(S, /§SETUP steps=.* verdict=(\w+)/), line: grab(S, /(§SETUP steps=.*)/), vscLine: grab(S, /(§SETUP_VSC .*)/),
  tasks: +grab(S, /§SETUP_VSC .* tasks=(\d+)/), snippets: +grab(S, /§SETUP_VSC .* snippets=(\d+)/), launch: grab(S, /§SETUP_VSC .* launch=(\w)/), cf: grab(S, /§SETUP_VSC .* codefacts=(\S+)/), opened: /§SETUP_OPEN launched=Y/.test(S), next: grab(S, /§SETUP_NEXT open=(".*") serve=/) };
const g0 = () => { const w = cp.spawnSync('bash', ['-c', "DISPLAY=" + DISP + " xwininfo -root -tree 2>/dev/null | grep -E 'Visual Studio Code' | grep -oE '[0-9]+x[0-9]+\\+[0-9]+\\+[0-9]+' | sort -t x -k1 -n | tail -1"], { encoding: 'utf8' }); return (w.stdout || '').trim(); };
let geo = '', n = 0; while (!geo && n++ < 90) { cp.spawnSync('sleep', ['1']); geo = g0(); } cp.spawnSync('sleep', ['14']); geo = g0() || geo;   // the window, then the explorer and the extension host settle
if (!geo) { xvfb.kill(); fail('the editor `--open` launched never showed a window'); }
cp.spawnSync('bash', ['-c', 'DISPLAY=' + DISP + ' import -window root -crop ' + geo + ' +repage ' + path.join(OUT, 'stills', 's_open.png')]);
const title = (cp.spawnSync('bash', ['-c', "DISPLAY=" + DISP + " xwininfo -root -tree | grep -E 'Visual Studio Code' | head -1"], { encoding: 'utf8' }).stdout || '').trim();
fs.appendFileSync(path.join(OUT, 'cmd_b1_1.log'), '§OPEN_STILL geometry=' + geo + ' window=' + JSON.stringify(title) + ' bytes=' + fs.statSync(path.join(OUT, 'stills', 's_open.png')).size + '\n');
cp.spawnSync('pkill', ['-f', '--', PROF]); cp.spawnSync('sleep', ['4']); cp.spawnSync('pkill', ['-9', '-f', '--', PROF]); xvfb.kill();
F.setup.openGeometry = geo; F.setup.window = title; L('setup ' + JSON.stringify(F.setup));
if (F.setup.verdict !== 'PASS' || !F.setup.opened) fail('setup.js --open did not pass (see out/cmd_b1_1.log)');
// the tools build nothing in the download: record anything that changed so far (the .setup folder and node_modules are setup's own)
const after1 = treeHash(); F.ws_after_setup = { same: after1.hash === before0.hash, files: after1.n }; L('tree after setup unchanged=' + F.ws_after_setup.same + ' files=' + after1.n);
// 4. b3: the same fact in a terminal
const x = T('b5', 1, 'node devtools/code-facts/code-facts.js where camera');
F.cf = { whereFile: grab(x.out, /written at (\S+):\d+/), whereLine: +grab(x.out, /written at \S+:(\d+)/), writes: +grab(x.out, /· (\d+) writes/), reads: +grab(x.out, /· (\d+) reads/) }; L('code-facts ' + JSON.stringify(F.cf));
// 5. b4: the manifest refuses a hand edit; the bump tool does it right (the same edit the editor makes in its still: shoot.sh/shots_suite.js)
fs.mkdirSync(path.join(CACHE, 'orig', 'modeller', 'tests'), { recursive: true }); ['modeller/modeller.html', 'modeller/sw.js', 'modeller/modules.json', 'modeller/tests/witness_clipboard.js'].forEach(f => fs.copyFileSync(path.join(WORK, f), path.join(CACHE, 'orig', f)));
const tree0 = treeHash(), editRe = 'arc_editable.js?v=[0-9]*', editTo = 'arc_editable.js?v=99', htmlBefore = fs.readFileSync(path.join(WORK, 'modeller/modeller.html'), 'utf8');
const GREP = ' | grep -E "MANIFEST_(FAIL|CHECK)"', CHK = 'node scripts/gen_manifest.js --check modeller' + GREP;
T('b6', 0, "sed -i 's/" + editRe + '/' + editTo + "/' modeller/modeller.html");   // the hand edit (the film shows it made in the editor; this is the same change)
const red = T('b6', 1, CHK, ls => ls.map(l => l.replace(/^(§MANIFEST_CHECK) .*(source=\S+ written=\d+ verdict=\w+)$/, '$1 … $2')));
const failLine = (/§MANIFEST_FAIL (\S+):(\d+) /.exec(red.out) || []); F.manifest = { redFile: failLine[1], redLine: +failLine[2], redVerdict: grab(red.out, /§MANIFEST_CHECK .* verdict=(\w+)/), redCommand: /node scripts\/gen_manifest\.js --write modeller/.test(red.out) };
T('b6', 2, 'node scripts/bump.js modeller/arc_editable.js --write', last(3));
const green = T('b6', 3, CHK, ls => ls.map(l => l.replace(/^(§MANIFEST_CHECK) .*(identical=\S+) .* (deps_declared=\S+) (order_check=\S+) .* (verdict=\w+)$/, '$1 … $2 … $3 $4 … $5')));
Object.assign(F.manifest, { greenIdentical: grab(green.out, /§MANIFEST_CHECK apps=\d+ files=(\d+ identical=\d+\/\d+)/, 1), greenDeps: +grab(green.out, /deps_declared=(\d+)/), greenOrder: grab(green.out, /order_check=(\w+)/), greenVerdict: grab(green.out, /verdict=(\w+)/) });
F.manifest.editedLineText = htmlBefore.split('\n')[F.manifest.redLine - 1]; L('manifest ' + JSON.stringify(F.manifest));
// restore: the bump wrote three files (page, sw.js, modules.json); they are put back from the copies taken BEFORE the edit, then the tree must equal tree0 (a ZIP has no .git, so "unchanged" = the content hash)
{ const touched = ['modeller/modeller.html', 'modeller/sw.js', 'modeller/modules.json']; touched.forEach(f => fs.copyFileSync(path.join(CACHE, 'orig', f), path.join(WORK, f)));
  const t1 = treeHash(); F.restore = { b6: t1.hash === tree0.hash, files: touched }; L('restore after b6 equal=' + F.restore.b6); if (!F.restore.b6) fail('WORK not restored after b6'); }
// 6. b5: proof you can read
const PW = 'modeller/tests/witness_clipboard.js', pwText = fs.readFileSync(path.join(WORK, PW), 'utf8').split('\n'), pwLine = pwText.findIndex(l => /^\/\/ PROVES:/.test(l)) + 1; if (!pwLine) fail('no PROVES line in ' + PW);
const PMsh = l => l.replace(/ cached=.*$/, ''), tree1 = treeHash();
const g1 = T('b7', 1, 'node scripts/gen_proof_map.js modeller | tail -1', ls => ls.map(PMsh));
T('b7', 2, "sed -i '/^\\/\\/ PROVES:/a // PROVES: modeller/missing_file.js' " + PW);
const r2 = T('b7', 3, 'node scripts/gen_proof_map.js modeller | tail -1', ls => ls.map(PMsh));
const pm = o => ({ modules: +grab(o, /modules=(\d+)/), proven: +grab(o, /proven=(\d+)/), namedOnly: +grab(o, /named_only=(\d+)/), unproven: +grab(o, /unproven=(\d+)/), proves: +grab(o, /proves_lines=(\d+)/), bad: +grab(o, /bad_paths=(\d+)/) });
F.proof = { green: pm(g1.out), red: pm(r2.out), file: PW, line: pwLine };
fs.copyFileSync(path.join(CACHE, 'orig', PW), path.join(WORK, PW)); F.restore.b7 = treeHash().hash === tree1.hash;
L('proof ' + JSON.stringify(F.proof) + ' restored=' + F.restore.b7); if (!F.restore.b7) fail('WORK not restored after b7');
// 7. the closing card's CI sentence (a count, not a typed beat): witness files in the download, the fast tier and its excluded rows
{ const c1 = T('close', 1, "find . -path ./node_modules -prune -o -path ./.setup -prune -o -type f -regextype posix-extended -regex '.*/(witness_|poc_)[^/]*\\.js' -print | wc -l"), c2 = T('close', 2, "node -e \"const t=require('./tests/ci_fast_tier.json');console.log(t.witnesses.length,'in the fast tier,',t.exclude.length,'excluded')\"");
  F.ci = { witnessFiles: +c1.lines[0], tier: +grab(c2.out, /^(\d+) in the fast tier/), excluded: +grab(c2.out, /, (\d+) excluded/) }; L('ci ' + JSON.stringify(F.ci)); }
// 8. b7: the session's bill (the session that BUILDS this film: its own transcript)
if (process.env.SESSION === '1') { const s = T('b8', 1, 'node devtools/code-facts/code-facts.js session --transcript $T', ls => ls.filter(l => !/^§/.test(l))), sl = grab(s.out, /(§CODEFACTS_SESSION .*)/);
  F.session = { line: sl, minutes: +grab(sl, /minutes=(\d+)/), replies: +grab(sl, /replies=(\d+)/), tokensOut: +grab(sl, /tokens_out=(\d+)/), prs: +grab(sl, /prs=(\d+)/), witnesses: +grab(sl, /witnesses=(\d+)/), load: grab(sl, /load=(\S+)/), notMerged: +grab(sl, /not_merged=(\d+)/) }; L('session ' + JSON.stringify(F.session)); }
// 9. what the editor must show (derived from the files, not from setup's own report): .vscode counts and the four launch targets
const jsonc = t => { let o = '', i = 0, str = false; while (i < t.length) { const c = t[i]; if (str) { o += c; if (c === '\\') o += t[++i]; else if (c === '"') str = false; i++; } else if (c === '"') { str = true; o += c; i++; } else if (c === '/' && t[i + 1] === '/') { while (i < t.length && t[i] !== '\n') i++; } else if (c === '/' && t[i + 1] === '*') { i += 2; while (i < t.length && !(t[i] === '*' && t[i + 1] === '/')) i++; i += 2; } else { o += c; i++; } } return JSON.parse(o.replace(/,(\s*[}\]])/g, '$1')); };
const V = f => jsonc(fs.readFileSync(path.join(WORK, '.vscode', f), 'utf8'));
F.vscode = { tasks: V('tasks.json').tasks.map(t => t.label), launch: V('launch.json').configurations.map(c => c.name), snippetPrefixes: Object.values(V('witness.code-snippets')).map(s => s.prefix), recommended: V('extensions.json').recommendations };
L('vscode ' + JSON.stringify(F.vscode));
// 10. the VS Code plan (every still the driver makes: file, line, what it does there)
F.vsc = [ { name: 's_vscodedir', kind: 'dir', file: '.vscode/tasks.json', line: 1 }, { name: 's_ext', kind: 'ext' }, { name: 's_tasks', kind: 'tasks' }, { name: 's_snip', kind: 'snippet', prefix: 'witness' }, { name: 's_launch', kind: 'launch' },
  { name: 'h_pre', kind: 'pre', file: F.cf.whereFile, line: F.cf.whereLine, find: 'A.camera', far: 6 },
  { name: 'h_sel', kind: 'tokensel', file: F.cf.whereFile, line: F.cf.whereLine, find: 'A.camera' },
  { name: 'h_hover', kind: 'hover', file: F.cf.whereFile, line: F.cf.whereLine, find: 'A.camera' },
  { name: 'b6_edit', kind: 'replace', file: F.manifest.redFile, line: F.manifest.redLine, re: editRe, to: editTo },
  { name: 'b7_header', kind: 'select', file: PW, line: pwLine }, { name: 'b7_proves', kind: 'insert', file: PW, line: pwLine + 1, after: pwLine, text: '// PROVES: modeller/missing_file.js' } ];
if (process.env.SESSION === '1') F.vsc.push({ name: 'b8_session', kind: 'select', file: 'devtools/code-facts/session.js', line: 1 });
// 11. credentials for the last card (read now, from GitHub and the repo's own files)
const pr = n => (cp.spawnSync('gh', ['pr', 'view', String(n), '-R', 'red1oon/bim-ootb', '--json', 'state,title', '-q', '.state + " " + .title'], { encoding: 'utf8' }).stdout || '').trim();
F.credentials = { licence: fs.readFileSync(path.join(WORK, 'LICENSE'), 'utf8').split('\n')[0].trim(), repo: 'github.com/red1oon/bim-ootb', commit: F.fetch.commit, prs: {} };
for (const n of [3245, 3250, 3256, 3259, 3266, 3274, 3280, 3298, 3317]) F.credentials.prs[n] = pr(n); L('credentials ' + JSON.stringify(F.credentials));
const ok = F.manifest.redVerdict === 'FAIL' && F.manifest.greenVerdict === 'PASS' && F.manifest.redCommand && F.proof.green.bad === 0 && F.proof.red.bad === 1 && F.ci.tier > 0 && (process.env.SESSION !== '1' || F.session.minutes > 0) && F.vscode.tasks.length === F.setup.tasks &&
  Object.values(F.credentials.prs).every(x => /^MERGED/.test(x)) && /MIT/.test(F.credentials.licence) && Object.values(F.steps).every(a => a.every(x => x.exit === 0));
fs.writeFileSync(path.join(OUT, 'facts.json'), JSON.stringify(F, null, 1)); L('VERDICT ' + (ok ? 'PASS' : 'FAIL')); process.exit(ok ? 0 : 1);
