// ⚠ DO NOT REMOVE — SCOPE: film 3 "CH 0 · Immersive Software: a body's history" (prompts/FILM_IMMERSIVE_SOFTWARE.md FILM 3). The facts of the film, none typed by hand:
//   the index generator's line · the Node CLI with --trace (bodies, inserts; the joined wall = the ONE insert that is not a body) · two REAL Modeller sessions (modeller_shot.js): with the overlay (the three
//   targets, the keys pressed, the heap) and without it (the heap) · the overlay and index file sizes · the witness logs of this feature on main (W-BIM-LAYERS, W-DXF-HOVER with H2b).
//   A session whose log already holds a MS_RESULT is reused, not run again (one heavy job at a time on a shared machine).
// Usage: node facts.js <bim-ootb tree on main> <W-BIM-LAYERS log> <W-DXF-HOVER log>      READ out/facts.log: exit code is not evidence.
'use strict';
const fs = require('fs'), path = require('path'), os = require('os'), { spawnSync } = require('child_process');
const NEW = path.resolve(process.argv[2]), [WBL, WDH] = process.argv.slice(3, 5).map(p => path.resolve(p));
const OUT = path.join(__dirname, 'out'), L = m => console.log('§FACTS ' + m); fs.mkdirSync(path.join(OUT, 'pages'), { recursive: true });
const MK = process.env.SHED_MARKED || path.join(os.homedir(), 'Videos', 'dxf2bim_film_work', 'why', 'cli', 'marked');
const env = Object.assign({}, process.env, { NODE_PATH: path.join(os.homedir(), 'bim-compiler', 'node_modules') });
const node = (args, cwd, extra) => spawnSync('nice', ['-n', '19', process.execPath].concat(args), { cwd, env: Object.assign({}, env, extra || {}), encoding: 'utf8', maxBuffer: 1 << 28, timeout: 2400000 });
const fail = m => { L('FAIL ' + m); process.exit(1); };
const F = { made: new Date().toISOString(), commit: spawnSync('git', ['-C', NEW, 'rev-parse', '--short', 'HEAD'], { encoding: 'utf8' }).stdout.trim() };
// 1. the index (what the setup beat types)
const g = node([path.join(NEW, 'devtools/hover/gen_trace_index.js')], NEW), gl = (/§DXF_HOVER_INDEX .*/.exec(g.stdout) || [])[0]; if (!gl) fail('no §DXF_HOVER_INDEX line');
F.index = { line: gl.replace(NEW, '<bim-ootb>').replace(/ out=.*$/, ''), keys: +/keys=(\d+)/.exec(gl)[1], defaults: +/defaults=(\d+)/.exec(gl)[1], cmd: 'node devtools/hover/gen_trace_index.js' }; L('index ' + F.index.line);
// 2. the Node CLI with --trace on the same sheets: the joined wall's guid
const files = fs.readdirSync(MK).filter(f => /\.dxf$/i.test(f)).sort().map(f => path.join(MK, f)), cli = path.join(OUT, 'cli');
fs.rmSync(cli, { recursive: true, force: true });
const c = node([path.join(NEW, 'modeller/dxf2bim_cli.js'), '--sheets', ...files, '--out', cli, '--pack', 'pwd2024_bd', '--complete', '--trace'], NEW);
const cl1 = (/§DXF_TRACE elements=(\d+) traced=(\d+) untraced=(\d+) keys=(\d+)/.exec(c.stdout) || []), cl2 = (/§DXF_TRACE inserts=(\d+) inserts_untraced=(\d+)/.exec(c.stdout) || []);
if (!cl1.length || !cl2.length) fail('CLI trace lines missing: ' + String(c.stderr).slice(0, 200));
const bodies = JSON.parse(fs.readFileSync(path.join(cli, 'bodies.json'), 'utf8'));
F.cli = { bodies: +cl1[1], untraced: +cl1[3], inserts: +cl2[1], insertsUntraced: +cl2[2] };
const wallGuid = JSON.parse(fs.readFileSync(path.join(cli, 'ops.json'), 'utf8')).inserts.map(o => o.outputGuid.replace(/^dxf-/, '')).filter(gd => !bodies.some(b => b.guid === gd));
if (wallGuid.length !== 1) fail('expected ONE insert that is not a body (the joined wall), got ' + wallGuid.length); F.wallGuid = wallGuid[0];
L('cli bodies=' + F.cli.bodies + ' inserts=' + F.cli.inserts + ' untraced=' + F.cli.untraced + '/' + F.cli.insertsUntraced + ' wall=' + F.wallGuid);
// 3. the Modeller sessions (a log that already holds MS_RESULT is reused)
const session = (name, extra) => { const log = path.join(OUT, 'ms_' + name + '.log'); let txt = fs.existsSync(log) ? fs.readFileSync(log, 'utf8') : '';
  if (!/^MS_RESULT /m.test(txt)) { const r = node([path.join(__dirname, 'modeller_shot.js'), NEW, path.join(OUT, 'pages', name)], __dirname, extra); txt = (r.stdout || '') + (r.stderr || ''); fs.writeFileSync(log, txt); L('session ' + name + ' ran'); }
  else L('session ' + name + ' reused ' + path.relative(__dirname, log));
  const m = /^MS_RESULT (.*)$/m.exec(txt); if (!m) fail('session ' + name + ' gave no MS_RESULT'); return JSON.parse(m[1]); };
const N = session('new', { MS_WALL: F.wallGuid });
const missing = ['col', 'wall', 'bar'].filter(k => !N.targets[k] || N.targets[k].missing); if (missing.length) fail('the session did not find: ' + missing + ' (errors ' + N.errors + ')');
const P = session('plain', { MS_OVERLAY: '0' });
const inst = (N.console.find(l => /§DXF_HOVER installed/.test(l)) || '');
F.page = { installedLine: inst, installedKeys: +((/index_keys=(\d+)/.exec(inst) || [])[1] || 0), installedDefaults: +((/defaults=(\d+)/.exec(inst) || [])[1] || 0), inserts: N.inserts, errors: N.errors.concat(P.errors), converted: 'pages/new_converted.png' };
F.targets = {}; ['col', 'wall', 'bar'].forEach(k => { const t = N.targets[k], line = (N.console.filter(l => l.indexOf('§DXF_HOVER fid=' + t.fid + ' ') === 0)[0] || ''); F.targets[k] = Object.assign({}, t, { hoverLine: line }); });
F.memory = { withOverlay: N.heap, without: P.heap, deltaBytes: N.heap.used - P.heap.used,
  overlayBytes: fs.statSync(path.join(NEW, 'devtools/hover/dxf_hover.js')).size, indexBytes: fs.statSync(path.join(NEW, 'devtools/hover/trace_index.json')).size };
L('page installed="' + inst + '" inserts=' + N.inserts + ' errors=' + F.page.errors.length);
['col', 'wall', 'bar'].forEach(k => { const t = F.targets[k]; L(k + ' fid=' + t.fid + ' cls=' + t.cls + ' counts=' + (t.counts || []).join(',') + ' key ' + t.keyPressed + ' opened=' + JSON.stringify(t.opened) + ' tip_in_view=' + t.tipInView + ' | ' + t.hoverLine); });
L('memory with=' + N.heap.used + ' without=' + P.heap.used + ' delta=' + F.memory.deltaBytes + ' trace_entries=' + N.heap.traceEntries + ' gc=' + N.heap.gc + ' overlay_bytes=' + F.memory.overlayBytes + ' index_bytes=' + F.memory.indexBytes);
// 4. the witness logs on main (copied into out/ as the evidence the cards quote)
fs.copyFileSync(WBL, path.join(OUT, 'witness_bim_layers_main.log')); fs.copyFileSync(WDH, path.join(OUT, 'witness_dxf_hover.log'));
const wbl = fs.readFileSync(WBL, 'utf8'), wdh = fs.readFileSync(WDH, 'utf8'), one = (re, t) => (re.exec(t) || [''])[0];
F.witness = { blVerdict: one(/§BIM_LAYERS_W VERDICT .*/, wbl), l3: one(/§BIM_LAYERS_W L3 inserts=.*/, wbl), l3def: one(/§BIM_LAYERS_W L3 default_sides .*/, wbl), l4: one(/§BIM_LAYERS_W L4 .*/, wbl),
  dhVerdict: one(/§DXF_HOVER_W VERDICT .*/, wdh), h2b: one(/§DXF_HOVER_W H2b nextId.*/, wdh) };
F.witness.linked = +((/linked=(\d+)/.exec(F.witness.l3def) || [])[1]); F.witness.notRecorded = +((/not_recorded=(\d+)/.exec(F.witness.l3def) || [])[1]); F.witness.cuts = +((/cuts=(\d+)/.exec(F.witness.l4) || [])[1]);
L('witness ' + JSON.stringify(F.witness));
// 5. the credentials the last card shows: the licence file, the PRs (merged, read from GitHub), the paper's own priority line (the copy fetched into out/prior/)
const pr = n => { const r = spawnSync('gh', ['pr', 'view', String(n), '-R', 'red1oon/bim-ootb', '--json', 'state,title', '-q', '.state + " " + .title'], { encoding: 'utf8' }); return (r.stdout || '').trim(); };
const paper = (() => { try { return fs.readFileSync(path.join(OUT, 'prior', 'spatial_compilation_paper.html'), 'utf8').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' '); } catch (e) { return ''; } })();
F.credentials = { licence: fs.readFileSync(path.join(NEW, 'LICENSE'), 'utf8').split('\n')[0].trim(), repo: 'github.com/red1oon/bim-ootb', pr3043: pr(3043), pr3047: pr(3047), pr3064: pr(3064),
  paperPriority: (/Priority date: (\d{4}-\d\d-\d\d)/.exec(paper) || [])[1] || null };
L('credentials ' + JSON.stringify(F.credentials));
const T = F.targets;
const ok = F.credentials.licence === 'MIT License' && ['pr3043', 'pr3047', 'pr3064'].every(k => /^MERGED/.test(F.credentials[k])) && F.cli.untraced === 0 && F.cli.insertsUntraced === 0 &&
  F.page.installedKeys === F.index.keys && F.page.installedDefaults === F.index.defaults && !F.page.errors.length && T.wall.guid === F.wallGuid && ['col', 'wall', 'bar'].every(k => T[k].tipInView) &&
  /VERDICT PASS/.test(F.witness.blVerdict) && /VERDICT PASS/.test(F.witness.dhVerdict) && /counts_differ=0/.test(F.witness.h2b);
fs.writeFileSync(path.join(OUT, 'facts.json'), JSON.stringify(F, null, 1)); L('VERDICT ' + (ok ? 'PASS' : 'FAIL')); process.exit(ok ? 0 : 1);
