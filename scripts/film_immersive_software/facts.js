// ⚠ DO NOT REMOVE — SCOPE: film "CH 0 · Immersive Software" (prompts/FILM_IMMERSIVE_SOFTWARE.md). The facts of the film, none typed by hand:
//   the index generator's line (NEW tree) · the Node CLI with --trace (bodies, inserts, per-key counts, the truss report) · three REAL Modeller sessions (modeller_shot.js): NEW with the overlay (the two targets,
//   the heap), NEW without it (the heap), OLD with it (the joined wall without its stamp, at the point found on NEW) · the overlay and index file sizes · the witness logs of this feature (the FIRST, failing run
//   of W-DXF-HOVER, and the runs on main after the merge). A session whose log already holds a MS_RESULT is reused, not run again (one heavy job at a time on a shared machine).
// Usage: node facts.js <NEW bim-ootb tree> <OLD bim-ootb tree> <first-run hover log> <hover log on main> <trace log on main>      READ out/facts.log: exit code is not evidence.
'use strict';
const fs = require('fs'), path = require('path'), os = require('os'), { spawnSync } = require('child_process');
const [NEW, OLD] = process.argv.slice(2, 4).map(p => path.resolve(p)), [FIRST, HMAIN, TMAIN] = process.argv.slice(4, 7).map(p => path.resolve(p));
const OUT = path.join(__dirname, 'out'), L = m => console.log('§FACTS ' + m); fs.mkdirSync(path.join(OUT, 'pages'), { recursive: true });
const MK = process.env.SHED_MARKED || path.join(os.homedir(), 'Videos', 'dxf2bim_film_work', 'why', 'cli', 'marked');
const env = Object.assign({}, process.env, { NODE_PATH: path.join(os.homedir(), 'bim-compiler', 'node_modules') });
const node = (args, cwd, extra) => spawnSync('nice', ['-n', '19', process.execPath].concat(args), { cwd, env: Object.assign({}, env, extra || {}), encoding: 'utf8', maxBuffer: 1 << 28, timeout: 2400000 });
const fail = m => { L('FAIL ' + m); process.exit(1); };
const F = { made: new Date().toISOString(), commits: {} };
for (const [k, t] of [['new', NEW], ['old', OLD]]) F.commits[k] = spawnSync('git', ['-C', t, 'rev-parse', '--short', 'HEAD'], { encoding: 'utf8' }).stdout.trim() + (spawnSync('git', ['-C', t, 'status', '--short', '--', 'modeller'], { encoding: 'utf8' }).stdout.trim() ? '+edit' : '');
// 1. the index (what the setup beat types)
const g = node([path.join(NEW, 'devtools/hover/gen_trace_index.js')], NEW), gl = (/§DXF_HOVER_INDEX .*/.exec(g.stdout) || [])[0]; if (!gl) fail('no §DXF_HOVER_INDEX line');
F.index = { line: gl.replace(NEW, '<bim-ootb>'), keys: +/keys=(\d+)/.exec(gl)[1], cmd: 'node devtools/hover/gen_trace_index.js' }; L('index ' + F.index.line);
// 2. the Node CLI with --trace on the same sheets
const files = fs.readdirSync(MK).filter(f => /\.dxf$/i.test(f)).sort().map(f => path.join(MK, f)), cli = path.join(OUT, 'cli');
fs.rmSync(cli, { recursive: true, force: true });
const c = node([path.join(NEW, 'modeller/dxf2bim_cli.js'), '--sheets', ...files, '--out', cli, '--pack', 'pwd2024_bd', '--complete', '--trace'], NEW);
const cl1 = (/§DXF_TRACE elements=(\d+) traced=(\d+) untraced=(\d+) keys=(\d+)/.exec(c.stdout) || []), cl2 = (/§DXF_TRACE inserts=(\d+) inserts_untraced=(\d+)/.exec(c.stdout) || []);
if (!cl1.length || !cl2.length) fail('CLI trace lines missing: ' + String(c.stderr).slice(0, 200));
const V = JSON.parse(fs.readFileSync(path.join(cli, 'verdict.json'), 'utf8')), sec = Object.values(((V.report || {}).sections || {}).sheets || {})[0] || {};
const bodies = JSON.parse(fs.readFileSync(path.join(cli, 'bodies.json'), 'utf8')), tr = JSON.parse(fs.readFileSync(path.join(cli, 'trace.json'), 'utf8')).trace;
const assumed = bodies.filter(b => b.prov === 'assumed').length;
F.cli = { bodies: +cl1[1], untraced: +cl1[3], keys: +cl1[4], inserts: +cl2[1], insertsUntraced: +cl2[2], assumed, truss: { stations: sec.stations, spacing_m: sec.spacing, bars: sec.bars, plates: sec.plates } };
L('cli bodies=' + F.cli.bodies + ' inserts=' + F.cli.inserts + ' untraced=' + F.cli.untraced + '/' + F.cli.insertsUntraced + ' assumed=' + assumed + ' truss=' + JSON.stringify(F.cli.truss));
const wallGuid = JSON.parse(fs.readFileSync(path.join(cli, 'ops.json'), 'utf8')).inserts.map(o => o.outputGuid.replace(/^dxf-/, '')).filter(gd => !bodies.some(b => b.guid === gd));
if (wallGuid.length !== 1) fail('expected ONE insert that is not a body (the joined wall), got ' + wallGuid.length); F.wallGuid = wallGuid[0]; F.wallKeyCli = tr[F.wallGuid] || null;
// 3. the Modeller sessions (a log that already holds MS_RESULT is reused)
const session = (name, tree, extra) => { const log = path.join(OUT, 'ms_' + name + '.log'); let txt = fs.existsSync(log) ? fs.readFileSync(log, 'utf8') : '';
  if (!/^MS_RESULT /m.test(txt)) { const r = node([path.join(__dirname, 'modeller_shot.js'), tree, path.join(OUT, 'pages', name)], __dirname, extra); txt = (r.stdout || '') + (r.stderr || ''); fs.writeFileSync(log, txt); L('session ' + name + ' ran'); }
  else L('session ' + name + ' reused ' + path.relative(__dirname, log));
  const m = /^MS_RESULT (.*)$/m.exec(txt); if (!m) fail('session ' + name + ' gave no MS_RESULT'); return JSON.parse(m[1]); };
const N = session('new', NEW, { MS_WALL: F.wallGuid });
if (!N.targets.bar || !N.targets.wall) fail('the NEW session did not find both targets: ' + Object.keys(N.targets));
const P = session('plain', NEW, { MS_OVERLAY: '0' });
const O = session('old', OLD, { MS_WALL: F.wallGuid, MS_POINT_WALL: N.targets.wall.point.x + ',' + N.targets.wall.point.y });
const inst = (N.console.find(l => /§DXF_HOVER installed/.test(l)) || '');
F.page = { installedLine: inst, installedKeys: +((/index_keys=(\d+)/.exec(inst) || [])[1] || 0), inserts: N.inserts, errors: N.errors.concat(P.errors, O.errors), converted: 'pages/new_converted.png' };
F.targets = { bar: N.targets.bar, wall: N.targets.wall, wallOld: O.targets.wall || null };
F.memory = { withOverlay: N.heap, without: P.heap, deltaBytes: N.heap.used - P.heap.used,
  overlayBytes: fs.statSync(path.join(NEW, 'devtools/hover/dxf_hover.js')).size, indexBytes: fs.statSync(path.join(NEW, 'devtools/hover/trace_index.json')).size };
L('page installed="' + inst + '" inserts=' + N.inserts + ' errors=' + F.page.errors.length);
L('bar ' + JSON.stringify({ key: N.targets.bar.key, at: N.targets.bar.at, prov: N.targets.bar.prov, v: N.targets.bar.vOpened }));
L('wall new ' + JSON.stringify({ key: N.targets.wall.key, at: N.targets.wall.at, v: N.targets.wall.vOpened }) + ' old ' + JSON.stringify(O.targets.wall && { key: O.targets.wall.key, unstamped: O.targets.wall.unstamped, text: O.targets.wall.text }));
L('memory with=' + N.heap.used + ' without=' + P.heap.used + ' delta=' + F.memory.deltaBytes + ' trace_entries=' + N.heap.traceEntries + ' trace_json_bytes=' + N.heap.traceJsonBytes + ' gc=' + N.heap.gc + ' overlay_bytes=' + F.memory.overlayBytes + ' index_bytes=' + F.memory.indexBytes);
// 4. the witness logs of this feature (copied into out/ as the evidence the cards quote)
for (const [src, dst] of [[FIRST, 'witness_hover_first_run.log'], [HMAIN, 'witness_hover_main.log'], [TMAIN, 'witness_trace_main.log']]) fs.copyFileSync(src, path.join(OUT, dst));
const first = fs.readFileSync(FIRST, 'utf8');
F.firstRun = { failedH2: /^FAIL H2 /m.test(first), wrongWall: new RegExp('H2 WRONG \\{"fid":\\d+,"guid":"' + F.wallGuid + '"').test(first), lines: first.split('\n').filter(l => /^FAIL H2|H2 WRONG|H2 hovered/.test(l)).map(l => l.slice(0, 200)) };
F.mainVerdicts = { hover: (/§DXF_HOVER_W VERDICT \S+/.exec(fs.readFileSync(HMAIN, 'utf8')) || [''])[0], trace: (/§DXF_TRACE_W VERDICT .*/.exec(fs.readFileSync(TMAIN, 'utf8')) || [''])[0] };
L('first run failed_h2=' + F.firstRun.failedH2 + ' wrong_wall=' + F.firstRun.wrongWall + ' main: ' + F.mainVerdicts.hover + ' | ' + F.mainVerdicts.trace);
// 5. the credentials the last card shows: the licence file, the two PRs (merged, read from GitHub), the paper's own priority line (the copy fetched into out/prior/)
const pr = n => { const r = spawnSync('gh', ['pr', 'view', String(n), '-R', 'red1oon/bim-ootb', '--json', 'state,title', '-q', '.state + " " + .title'], { encoding: 'utf8' }); return (r.stdout || '').trim(); };
const paper = (() => { try { return fs.readFileSync(path.join(OUT, 'prior', 'spatial_compilation_paper.html'), 'utf8').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' '); } catch (e) { return ''; } })();
F.credentials = { licence: fs.readFileSync(path.join(NEW, 'LICENSE'), 'utf8').split('\n')[0].trim(), repo: 'github.com/red1oon/bim-ootb', pr3043: pr(3043), pr3047: pr(3047),
  paperPriority: (/Priority date: (\d{4}-\d\d-\d\d)/.exec(paper) || [])[1] || null };
L('credentials ' + JSON.stringify(F.credentials));
const ok = F.credentials.licence === 'MIT License' && /^MERGED/.test(F.credentials.pr3043) && /^MERGED/.test(F.credentials.pr3047) && F.cli.untraced === 0 && F.cli.insertsUntraced === 0 && F.page.installedKeys === F.index.keys && !F.page.errors.length && F.targets.bar.key === 'dxf2section:bar' && F.targets.wall.key === 'dxf2bim_import:wall-line' &&
  F.targets.wallOld && F.targets.wallOld.unstamped && F.firstRun.failedH2 && F.firstRun.wrongWall && /PASS/.test(F.mainVerdicts.hover) && /PASS/.test(F.mainVerdicts.trace);
fs.writeFileSync(path.join(OUT, 'facts.json'), JSON.stringify(F, null, 1)); L('VERDICT ' + (ok ? 'PASS' : 'FAIL')); process.exit(ok ? 0 : 1);
