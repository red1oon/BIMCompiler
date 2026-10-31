#!/usr/bin/env node
// Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
// SPDX-License-Identifier: MIT
/**
 * ⚠ DO NOT REMOVE — W-WITNESS-CACHE, prompts/TEAMWORK_FRAMEWORK.md §51.1 (C1). READ THE LOG after every run — the exit code is not evidence.
 * THE ISSUE it proves/disproves: a witness cache must never print a stale PASS. Every input change MISSES (re-runs); an unrelated change HITS (the cache saves).
 *   A miss is always safe; a wrong hit is the defect. "Nothing ran" is MEASURED by a side-effect counter outside the tree, never assumed.
 * Arms: H1 unchanged->hit · U1 unrelated file->hit · W1 a file the run writes, rewritten by another run->hit · M1 require'd file · M2 runtime-built path · M3 file served over the witness's own HTTP server · M4 ABSENT probe now present
 *   · M5 new file in a listed dir · M6 file read only by a CHILD node process · M7 args / env changed · F1 a failing run is not cached · V1 zero traced inputs is not cached
 *   · E1 a node-executed import( is not cached · R1 real: the terms runner twice (--browser 0), 2nd run all CACHED, same per-term verdicts.
 * Mutants (tracer/cache source edited in a temp copy; each must apply exactly once and be killed by a red arm, not a crash).
 * Run: node scripts/witness_witness_cache.js [--real 0] 2>&1 | tee build/scriptor/witness_cache/witness_witness_cache.log
 */
'use strict';
var fs = require('fs'), path = require('path'), os = require('os'), cp = require('child_process');
var ROOT = path.join(__dirname, '..'), argv = process.argv.slice(2), A = {};
for (var i = 0; i < argv.length; i++) if (/^--/.test(argv[i])) A[argv[i].slice(2)] = argv[++i];
var REAL = A.real !== '0';
var judged = 0, fails = 0, inc = 0, ARMS = {};
function ck(arm, ok, label, d) {
  if (ok === null) { inc++; ARMS[arm] = ARMS[arm] || 0; console.log('   ⚪ INCONCLUSIVE ' + arm + ' ' + label + (d ? ' - ' + d : '')); return null; }
  judged++; if (!ok) { fails++; ARMS[arm] = (ARMS[arm] || 0) + 1; } else ARMS[arm] = ARMS[arm] || 0;
  console.log('   ' + (ok ? 'PASS' : 'FAIL') + ' §WC-' + arm + ' ' + label + (d ? ' - ' + d : '')); return ok;
}

// ── the fixture tree: a witness that reads its inputs every way §51.1 names ──
function mkTree() {
  var T = fs.mkdtempSync(path.join(os.tmpdir(), 'wc-tree-'));
  var w = function (rel, s) { var p = path.join(T, rel); fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, s); };
  w('lib_a.js', 'module.exports = "A1";\n');
  w('data/b.txt', 'B1');
  w('dir/one.txt', '1');
  w('served.txt', 'S1');
  w('child_data.txt', 'C1');
  w('unrelated.txt', 'U1');
  w('child.js', "process.stdout.write(require('fs').readFileSync(require('path').join(__dirname, 'child_data.txt'), 'utf8'));\n");
  w('fx.js', [
    "var fs = require('fs'), path = require('path'), cp = require('child_process'), http = require('http'), D = __dirname;",
    "fs.appendFileSync(process.env.FX_COUNTER, 'x');",
    "var a = require('./lib_a.js');",
    "var b = fs.readFileSync(path.join(D, 'da' + 'ta', ['b', 'txt'].join('.')), 'utf8');",
    "var probe = fs.existsSync(path.join(D, 'maybe.txt'));",
    "var n = fs.readdirSync(path.join(D, 'dir')).length;",
    "var child = cp.spawnSync(process.execPath, [path.join(D, 'child.js')], { env: process.env, encoding: 'utf8' }).stdout;",
    "fs.mkdirSync(path.join(D, 'out'), { recursive: true }); fs.writeFileSync(path.join(D, 'out', 'result.txt'), String(Date.now())); fs.readFileSync(path.join(D, 'out', 'result.txt'));",
    "var srv = http.createServer(function (q, r) { fs.readFile(path.join(D, 'served.txt'), function (e, buf) { r.end(buf); }); });",
    "srv.listen(0, '127.0.0.1', function () { http.get('http://127.0.0.1:' + srv.address().port + '/', function (r) { var s = ''; r.on('data', function (c) { s += c; }); r.on('end', function () {",
    "  srv.close(); console.log('§FX a=' + a + ' b=' + b + ' probe=' + probe + ' n=' + n + ' child=' + child + ' served=' + s + ' args=' + process.argv.slice(2).join(','));",
    "  process.exit(Number(process.env.FX_EXIT || 0)); }); }); });"
  ].join('\n') + '\n');
  w('esm_dep.mjs', 'export default 1;\n');
  w('fx_esm.js', "require('fs').appendFileSync(process.env.FX_COUNTER, 'x'); import('./esm_dep.mjs').then(function (m) { console.log('§FXE ' + m.default); });\n");
  return T;
}

function loadLib(dir) { try { delete require.cache[require.resolve(path.join(dir, 'witness_cache.js'))]; return require(path.join(dir, 'witness_cache.js')); } catch (e) { return { _err: e }; } }

// one complete pass of the fixture arms against a cache library in `libDir`; returns the per-arm failure map (for mutants)
async function fixtureArms(libDir, quiet) {
  var saveCk = ck, local = {};
  if (quiet) ck = function (arm, ok) { if (ok === false) local[arm] = (local[arm] || 0) + 1; return ok; };
  try {
    var WC = loadLib(libDir);
    if (WC._err || typeof WC.run !== 'function') { ck('LIB', false, 'scripts/witness_cache.js loads and exports run()', String(WC._err && WC._err.message).slice(0, 160)); return local; }
    var T = mkTree(), CACHE = fs.mkdtempSync(path.join(os.tmpdir(), 'wc-cache-')), CNT = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'wc-cnt-')), 'counter');
    fs.writeFileSync(CNT, '');
    var count = function () { return fs.readFileSync(CNT, 'utf8').length; };
    async function go(file, opts) {
      opts = opts || {}; var before = count();
      var r = await WC.run({ file: path.join(T, file || 'fx.js'), args: opts.args || [], cwd: T, env: Object.assign({ FX_COUNTER: CNT }, opts.env || {}), keyEnv: opts.keyEnv || {},
                             roots: opts.roots || [T], cacheDir: CACHE, timeout: 60000 });
      return { cached: !!r.cached, ran: count() - before, exit: r.exit, out: r.out || '', skip: r.skip || null, inputs: r.inputs };
    }
    var edit = function (rel, s) { fs.writeFileSync(path.join(T, rel), s); };
    var p0 = await go(), h1 = await go();
    ck('H1', p0.ran === 1 && !p0.cached && /§FX a=A1 b=B1 probe=false n=1 child=C1 served=S1/.test(p0.out), 'the first run runs and reads every input', 'ran=' + p0.ran + ' inputs=' + p0.inputs + ' ' + (p0.out.match(/§FX[^\n]*/) || [''])[0]);
    ck('H1', h1.cached && h1.ran === 0 && /§CACHED /.test(h1.out) && /§FX a=A1/.test(h1.out), 'unchanged inputs: the second run is CACHED, nothing ran, the stored log is replayed with a §CACHED line', 'cached=' + h1.cached + ' ran=' + h1.ran);
    edit('unrelated.txt', 'U2'); var u1 = await go();
    ck('U1', u1.cached && u1.ran === 0, 'an unrelated file in the tree changed: still CACHED (the cache saves)', 'cached=' + u1.cached + ' ran=' + u1.ran);
    async function miss(arm, label, mutate, expect) {
      mutate(); var m = await go(), again = await go();
      ck(arm, !m.cached && m.ran === 1 && (!expect || expect.test(m.out)), label + ': MISS, the witness re-ran', 'cached=' + m.cached + ' ran=' + m.ran + ' ' + (m.out.match(/§FX[^\n]*/) || [''])[0]);
      ck(arm, again.cached && again.ran === 0, label + ': the run after it is CACHED again (re-primed)', 'cached=' + again.cached + ' ran=' + again.ran);
    }
    await miss('M1', "a require'd file changed", function () { edit('lib_a.js', 'module.exports = "A2";\n'); }, /a=A2/);
    await miss('M2', 'a file read by a path built at run time changed', function () { edit('data/b.txt', 'B2'); }, /b=B2/);
    await miss('M3', "a file served by the witness's own HTTP server changed (the browser path)", function () { edit('served.txt', 'S2'); }, /served=S2/);
    await miss('M4', 'a file probed ABSENT now exists', function () { edit('maybe.txt', 'here'); }, /probe=true/);
    await miss('M5', 'a new file in a listed directory', function () { edit('dir/two.txt', '2'); }, /n=2/);
    await miss('M6', 'a file read only by a CHILD node process changed', function () { edit('child_data.txt', 'C2'); }, /child=C2/);
    var a1 = await go(null, { args: ['x'] }), e1 = await go(null, { keyEnv: { K: '1' } });
    ck('M7', !a1.cached && a1.ran === 1, 'the args changed: MISS', 'cached=' + a1.cached + ' ran=' + a1.ran);
    ck('M7', !e1.cached && e1.ran === 1, 'an env value the caller sets changed: MISS', 'cached=' + e1.cached + ' ran=' + e1.ran);
    var w1 = await go();   // the args run above rewrote out/result.txt (a file fx.js WRITES then reads back) with a new timestamp
    ck('W1', w1.cached && w1.ran === 0, 'a file the run itself writes is OUTPUT, not input: another run rewriting it does not invalidate the cache', 'cached=' + w1.cached + ' ran=' + w1.ran);
    var f1 = await go(null, { env: { FX_EXIT: '1' }, keyEnv: { F: '1' } }), f2 = await go(null, { env: { FX_EXIT: '1' }, keyEnv: { F: '1' } });
    ck('F1', f1.exit === 1 && f2.exit === 1 && f2.ran === 1 && !f2.cached, 'a failing run is NOT cached: the next run re-runs it', 'exit=' + f1.exit + '/' + f2.exit + ' ran2=' + f2.ran);
    var EMPTY = fs.mkdtempSync(path.join(os.tmpdir(), 'wc-empty-')), v1 = await go(null, { roots: [EMPTY], keyEnv: { V: '1' } }), v2 = await go(null, { roots: [EMPTY], keyEnv: { V: '1' } });
    ck('V1', v1.inputs === 0 && v2.ran === 1 && !v2.cached && /no-inputs/.test(String(v2.skip)), 'zero traced inputs (the tracer saw nothing in the roots): NOT cached, says so', 'inputs=' + v1.inputs + ' ran2=' + v2.ran + ' skip=' + v2.skip);
    var x1 = await go('fx_esm.js'), x2 = await go('fx_esm.js');
    ck('E1', x2.ran === 1 && !x2.cached && /esm-import/.test(String(x2.skip)), 'a node-executed file using import( is NOT cached (its reads bypass the traced fs)', 'ran2=' + x2.ran + ' skip=' + x2.skip);
  } finally { ck = saveCk; }
  return local;
}

(async function () {
  console.log('§WC W-WITNESS-CACHE (§51.1) node ' + process.version);
  await fixtureArms(__dirname, false);
  // ── R1: the real runner twice, engine + ootb layers (no Playwright) ──
  if (!REAL) ck('R1', null, 'the terms runner twice', '--real 0');
  else if (!fs.existsSync(path.join(__dirname, 'witness_cache.js'))) ck('R1', false, 'the terms runner twice', 'no scripts/witness_cache.js');
  else {
    var C = fs.mkdtempSync(path.join(os.tmpdir(), 'wc-real-')), env = Object.assign({}, process.env, { WITNESS_CACHE_DIR: path.join(C, 'cache') });
    var run = function (n) { var t0 = Date.now(), r = cp.spawnSync('node', [path.join(__dirname, 'witness_terms.js'), '--browser', '0', '--logs', path.join(C, 'logs' + n)], { cwd: ROOT, env: env, encoding: 'utf8', timeout: 3600000, maxBuffer: 1 << 28 }); return { out: (r.stdout || '') + (r.stderr || ''), s: (Date.now() - t0) / 1000 }; };
    var r1 = run(1), r2 = run(2);
    var rows = function (o) { return (o.match(/^.* \| .* \| .* \| (ENFORCED|OPEN|WITNESS-FAILED|UNCONTROLLED)\b.*$/mg) || []).map(function (l) { return l.split(' | ')[0] + '=' + l.split(' | ')[3].split(' ')[0]; }).sort(); };
    var v1 = (r1.out.match(/§TERMS_VERDICT [^\n]*/) || [''])[0], v2 = (r2.out.match(/§TERMS_VERDICT [^\n]*/) || [''])[0];
    var ran2 = (r2.out.match(/^ {3}ran /mg) || []).length, cached2 = (r2.out.match(/^ {3}cached /mg) || []).length, skip2 = (r2.out.match(/§CACHE_SKIP/g) || []).length;
    console.log('   §WC-R1 run1 ' + r1.s.toFixed(1) + ' s: ' + v1); console.log('   §WC-R1 run2 ' + r2.s.toFixed(1) + ' s: ' + v2 + ' ran=' + ran2 + ' cached=' + cached2 + ' cache_skip=' + skip2);
    ck('R1', rows(r1.out).length >= 10 && JSON.stringify(rows(r1.out)) === JSON.stringify(rows(r2.out)) && v1.replace(/browser=.*/, '') === v2.replace(/browser=.*/, ''), 'the 2nd run gives the SAME per-term statuses and verdict as the 1st', rows(r2.out).length + ' rows; ' + v2);
    ck('R1', cached2 >= 1 && ran2 === skip2, 'the 2nd run re-ran ONLY the witnesses the cache refuses (each named by §CACHE_SKIP); every other one was CACHED', 'ran=' + ran2 + ' cached=' + cached2 + ' skip=' + skip2 + ' time ' + r1.s.toFixed(0) + 's -> ' + r2.s.toFixed(0) + 's');
  }
  // ── mutants: the tracer / cache edited in a temp copy ──
  var M = [
    ['file reads not recorded (only writes)', 'witness_trace.js', '(isWrite(f) ? T.writes : T.reads)[p] = 1;', 'if (isWrite(f)) T.writes[p] = 1;', ['M2', 'M3', 'M6']],
    ['child processes not traced (tracer passed as -r, not NODE_OPTIONS)', 'witness_cache.js', "NODE_OPTIONS: ((process.env.NODE_OPTIONS || '') + ' --require ' + JSON.stringify(TRACER)).trim()", "NODE_OPTIONS: process.env.NODE_OPTIONS || ''", ['M6']],
    ['existence probes not traced', 'witness_trace.js', "['existsSync', 'statSync', 'lstatSync', 'accessSync'].forEach(function (n) { wrap(fs, n, probeOf); });", '', ['M4']],
    ['directory listings not traced', 'witness_trace.js', "wrap(fs, 'readdirSync', listOf);", '', ['M5']],
    ['files the run wrote kept as inputs', 'witness_cache.js', 'if (writes[p]) return;', 'if (false) return;', ['W1']],
    ['a failing run cached', 'witness_cache.js', 'if (r.status === 0 && ', 'if (r.status !== null && ', ['F1']]
  ];
  var killed = 0, mutRan = 0;
  if (fs.existsSync(path.join(__dirname, 'witness_cache.js')) && fs.existsSync(path.join(__dirname, 'witness_trace.js'))) {
    for (var m of M) {
      var D = fs.mkdtempSync(path.join(os.tmpdir(), 'wc-mut-'));
      ['witness_cache.js', 'witness_trace.js'].forEach(function (f) { fs.copyFileSync(path.join(__dirname, f), path.join(D, f)); });
      var src = fs.readFileSync(path.join(D, m[1]), 'utf8'), n = src.split(m[2]).length - 1;
      if (n !== 1) { console.log('   FAIL §WC-MUT "' + m[0] + '" needle_count=' + n + ' (must be 1): NOT applied, not a kill'); fails++; continue; }
      fs.writeFileSync(path.join(D, m[1]), src.replace(m[2], m[3])); mutRan++;
      var red;
      try { red = await fixtureArms(D, true); } catch (e) { console.log('   FAIL §WC-MUT "' + m[0] + '" CRASHED (' + e.message + '): a crash is not a kill'); fails++; continue; }
      var hit = Object.keys(red).filter(function (k) { return red[k] > 0; }), ok = m[4].some(function (k) { return hit.indexOf(k) >= 0; }) && hit.indexOf('LIB') < 0;
      if (ok) killed++; else fails++;
      console.log('   ' + (ok ? 'PASS' : 'FAIL') + ' §WC-MUT "' + m[0] + '" needle_count=1 -> red=' + (hit.join(',') || 'none') + ' (expected ' + m[4].join(',') + ')');
    }
  } else console.log('   FAIL §WC-MUT mutants not run: the cache / tracer source does not exist');
  console.log('§WC-ARMS ' + JSON.stringify(ARMS));
  var verdict = !judged ? 'INCONCLUSIVE' : fails ? 'FAIL' : inc ? 'INCONCLUSIVE' : 'PASS';
  console.log('§WC_VERDICT ' + verdict + ' judged=' + judged + ' fails=' + fails + ' inconclusive=' + inc + ' mutants=' + killed + '/' + M.length);
  process.exit(verdict === 'PASS' ? 0 : 1);
})().catch(function (e) { console.log('§WC_CRASH ' + (e && e.stack || e)); process.exit(2); });
