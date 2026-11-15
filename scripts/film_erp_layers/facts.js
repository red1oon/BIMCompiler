// ⚠ DO NOT REMOVE — SCOPE: film 2 "CH 0 · Immersive Software: the ERP field" (prompts/FILM_IMMERSIVE_SOFTWARE.md FILM 2). The facts, none typed by hand: the index generator's line (NEW tree) ·
// three REAL ERP page sessions (erp_shot.js: NEW with the overlay, NEW without it, OLD = bim-ootb #3055 with it; a session whose log holds ES_RESULT is reused, not run again) · the overlay and index
// sizes · W-ERP-HOVER's logs: the RED run (this witness against #3055's overlay) and the run on main after the fixes · the credentials (licence, PRs merged, the paper's own priority line).
// Usage: node facts.js <NEW tree> <OLD tree> <red witness log> <main witness log> <PR numbers comma-separated>      READ out/facts.log: exit code is not evidence.
'use strict';
const fs = require('fs'), path = require('path'), os = require('os'), { spawnSync } = require('child_process');
const [NEW, OLD, RED, MAIN] = process.argv.slice(2, 6).map(p => path.resolve(p)), PRS = String(process.argv[6] || '').split(',').filter(Boolean);
const OUT = path.join(__dirname, process.env.OUTD || 'out'), L = m => console.log('§FACTS ' + m); fs.mkdirSync(path.join(OUT, 'pages'), { recursive: true });
const env = Object.assign({}, process.env, { NODE_PATH: path.join(os.homedir(), 'bim-compiler', 'node_modules') });
const fail = m => { L('FAIL ' + m); process.exit(1); };
const F = { made: new Date().toISOString(), commits: {} };
for (const [k, t] of [['new', NEW], ['old', OLD]]) F.commits[k] = spawnSync('git', ['-C', t, 'rev-parse', '--short', 'HEAD'], { encoding: 'utf8' }).stdout.trim();
const g = spawnSync(process.execPath, [path.join(NEW, 'devtools/hover/gen_erp_index.js')], { cwd: NEW, env, encoding: 'utf8' }), gl = (/§ERP_HOVER_INDEX .*/.exec(g.stdout) || [])[0]; if (!gl) fail('no index line');
F.index = { line: gl.replace(/ root=\S+/, ''), entries: +/entries=(\d+)/.exec(gl)[1], cmd: 'node devtools/hover/gen_erp_index.js' }; L('index ' + F.index.line);
const session = (name, tree, extra) => { const log = path.join(OUT, 'es2_' + name + '.log'); let txt = fs.existsSync(log) ? fs.readFileSync(log, 'utf8') : '';
  if (!/^ES_RESULT /m.test(txt)) { const r = spawnSync('nice', ['-n', '19', process.execPath, path.join(__dirname, 'erp_shot.js'), tree, path.join(OUT, 'pages', name)], { env: Object.assign({}, env, extra), encoding: 'utf8', maxBuffer: 1 << 28, timeout: 2400000 }); txt = (r.stdout || '') + (r.stderr || ''); fs.writeFileSync(log, txt); L('session ' + name + ' ran'); }
  else L('session ' + name + ' reused');
  const m = /^ES_RESULT (.*)$/m.exec(txt); if (!m) fail('session ' + name + ' gave no ES_RESULT'); return JSON.parse(m[1]); };
const LANGC = { en: 'en_US', zh: 'zh_CN' }[process.env.FILM_LANG || 'en'];   // the lower frame is captured in the film's language (the ERP page's own ?lang=)
const N = session('new', NEW, { ES_OVERLAY: '1', ES_ALT: '1', ES_LANG: LANGC }), P = session('plain', NEW, { ES_OVERLAY: '0', ES_LANG: LANGC }), O = session('old', OLD, { ES_OVERLAY: '1', ES_ALT: '0', ES_LANG: LANGC });
const dt = N.targets.doctype, dn = N.targets.dateordered, dold = O.targets.dateordered; if (!dt || !dn || !dold) fail('a target was not hovered');
const cb = dt.layers.find(l => l.kind === 'callout'), dA = dn.layers.find(l => /CalloutEngine\.dateAcct/.test(l.name)), dO = dold.layers.find(l => /CalloutEngine\.dateAcct/.test(l.name));
F.doctype = { layers: dt.layers.length, callout: cb, alt1: dt.links['1'], alt1OpensCallout: !!(cb && cb.at && dt.links['1'] && dt.links['1'].endsWith('/' + cb.at)), text: dt.text, tip: dt.tip, point: dt.point, png: 'pages/new_doctype.png' };
F.dateNew = { layer: dA, alt1: dn.links['1'], alt1Opens: !!(dA && dA.at && dn.links['1'] && dn.links['1'].endsWith('/' + dA.at)), text: dn.text, tip: dn.tip, point: dn.point, png: 'pages/new_dateordered.png' };
F.dateOld = { layer: dO, unported: !!(dO && /^UNPORTED/.test(dO.note || '')), text: dold.text, tip: dold.tip, point: dold.point, png: 'pages/old_dateordered.png' };
L('doctype layers=' + F.doctype.layers + ' callout=' + JSON.stringify(cb && [cb.name, cb.at, cb.legacy]) + ' alt1=' + F.doctype.alt1);
L('dateordered old=' + JSON.stringify(dO && [dO.name, dO.note]) + ' new=' + JSON.stringify(dA && [dA.name, dA.owner, dA.at]) + ' alt1=' + F.dateNew.alt1);
F.memory = { withOverlay: N.heap, without: P.heap, deltaBytes: N.heap.used - P.heap.used, overlayBytes: fs.statSync(path.join(NEW, 'devtools/hover/erp_hover.js')).size, indexBytes: fs.statSync(path.join(NEW, 'devtools/hover/erp_index.json')).size };
L('memory with=' + N.heap.used + ' without=' + P.heap.used + ' delta=' + F.memory.deltaBytes + ' overlay=' + F.memory.overlayBytes + ' index=' + F.memory.indexBytes);
const red = fs.readFileSync(RED, 'utf8'), main = fs.readFileSync(MAIN, 'utf8'); fs.copyFileSync(RED, path.join(OUT, 'witness_red_run.log')); fs.copyFileSync(MAIN, path.join(OUT, 'witness_main.log'));
const e2 = /§ERP_HOVER_W E2 fields=(\d+) .*unported=(\d+)/.exec(main) || [];
F.red = { falseUnported: +((/E2b false_unported=(\d+)/.exec(red) || [])[1] || -1), failed: /^FAIL E2b/m.test(red), line: ((/§ERP_HOVER_W E2b false_unported=.*/.exec(red) || [''])[0]).slice(0, 180) };
F.fix = { falseUnported: +((/E2b false_unported=(\d+)/.exec(main) || [])[1] || -1), fields: +(e2[1] || 0), unported: +(e2[2] || 0), verdict: (/§ERP_HOVER_W VERDICT \S+/.exec(main) || [''])[0], e2line: ((/§ERP_HOVER_W E2 fields=.*/.exec(main) || [''])[0]).slice(0, 180), keys: ((/E4 keys tried=\d+ wrong_or_dead=\d+/.exec(main) || [''])[0]) };
L('red ' + JSON.stringify(F.red) + ' fix ' + JSON.stringify(F.fix));
const pr = n => (spawnSync('gh', ['pr', 'view', n, '-R', 'red1oon/bim-ootb', '--json', 'state,title', '-q', '.state + " " + .title'], { encoding: 'utf8' }).stdout || '').trim();
F.credentials = { licence: fs.readFileSync(path.join(NEW, 'LICENSE'), 'utf8').split('\n')[0].trim(), repo: 'github.com/red1oon/bim-ootb', prs: PRS.map(n => ({ n, state: pr(n) })), paperPriority: (/Priority date: (\d{4}-\d\d-\d\d)/.exec(fs.readFileSync(path.join(OUT, 'prior', 'spatial_compilation_paper.html'), 'utf8').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ')) || [])[1] || null };   // the page's own line (fetched into out/prior/)
L('credentials ' + JSON.stringify(F.credentials));
const ok = !N.errors.length && !P.errors.length && !O.errors.length && F.doctype.alt1OpensCallout && F.dateNew.alt1Opens && F.dateOld.unported && F.red.failed && F.fix.falseUnported === 0 && /PASS/.test(F.fix.verdict) && F.credentials.prs.every(p => /^MERGED/.test(p.state));
fs.writeFileSync(path.join(OUT, 'facts.json'), JSON.stringify(F, null, 1)); L('VERDICT ' + (ok ? 'PASS' : 'FAIL')); process.exit(ok ? 0 : 1);
