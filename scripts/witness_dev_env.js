#!/usr/bin/env node
// Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
// SPDX-License-Identifier: MIT
/**
 * ⚠ DO NOT REMOVE — W-DEV-ENV, prompts/TEAMWORK_FRAMEWORK.md §50.2. READ THE LOG after every run — the exit code is not evidence.
 * THE ISSUE it proves/disproves: a passing witness can rest on a file that exists only on this machine (not in git, gitignored, or a git-lfs stub), so a stranger cannot
 *   repeat it. The detector must flag exactly those inputs; the manifest + OCI fetch must reinstate them byte-exact, and refuse anything else.
 * Arms: U1 tracked not flagged / untracked flagged · U2 gitignored flagged · U3 tracked LFS pointer flagged · P1 same sha portable · P2 stale sha not · P3 no entry not
 *   · F1 fetch places the file with the right sha · F2 tampered bytes refused, no file left · F3 gzip transfer handled · F4 an already-matching file is not downloaded
 *   · R1 real: the terms runner names its untracked inputs (listed, not assumed) · R2 real: portable count from the runner · R3 (--stranger 1) fresh clones from GitHub.
 * Run: node scripts/witness_dev_env.js [--real 0] [--stranger 1] 2>&1 | tee build/scriptor/dev_env/witness_dev_env.log
 */
'use strict';
var fs = require('fs'), path = require('path'), os = require('os'), cp = require('child_process'), http = require('http'), zlib = require('zlib'), crypto = require('crypto');
var ROOT = path.join(__dirname, '..'), argv = process.argv.slice(2), A = {};
for (var i = 0; i < argv.length; i++) if (/^--/.test(argv[i])) A[argv[i].slice(2)] = argv[++i];
var judged = 0, fails = 0, inc = 0;
function ck(arm, ok, label, d) {
  if (ok === null) { inc++; console.log('   ⚪ INCONCLUSIVE ' + arm + ' ' + label + (d ? ' - ' + d : '')); return null; }
  judged++; if (!ok) fails++; console.log('   ' + (ok ? 'PASS' : 'FAIL') + ' §DE-' + arm + ' ' + label + (d ? ' - ' + d : '')); return ok;
}
var sha = function (b) { return crypto.createHash('sha256').update(b).digest('hex'); };
function load(dir, f) { try { delete require.cache[require.resolve(path.join(dir, f))]; return require(path.join(dir, f)); } catch (e) { return { _err: e }; } }

function mkRepo() {
  var R = fs.mkdtempSync(path.join(os.tmpdir(), 'de-repo-')), g = function (a) { return cp.spawnSync('git', a, { cwd: R, encoding: 'utf8' }); };
  g(['init', '-q']); g(['config', 'user.email', 'w@x']); g(['config', 'user.name', 'w']);
  fs.writeFileSync(path.join(R, '.gitignore'), 'ignored.db\n');
  fs.writeFileSync(path.join(R, 'tracked.txt'), 'T');
  fs.writeFileSync(path.join(R, 'lfsstub.db'), 'version https://git-lfs.github.com/spec/v1\noid sha256:' + '0'.repeat(64) + '\nsize 123\n');
  fs.writeFileSync(path.join(R, 'fx.js'), "var fs=require('fs'),p=require('path');['tracked.txt','untracked.db','ignored.db','lfsstub.db'].forEach(function(f){fs.readFileSync(p.join(__dirname,f));});console.log('§FX ok');\n");
  g(['add', '.gitignore', 'tracked.txt', 'lfsstub.db', 'fx.js']); g(['commit', '-q', '-m', 'fx']);
  fs.writeFileSync(path.join(R, 'untracked.db'), 'U-bytes');
  fs.writeFileSync(path.join(R, 'ignored.db'), 'I-bytes');
  return R;
}

async function fixtureArms(dir, quiet) {
  var saveCk = ck, red = {};
  if (quiet) ck = function (arm, ok) { if (ok === false) red[arm] = 1; return ok; };
  try {
    var DE = load(dir, 'dev_env.js'), WC = load(dir, 'witness_cache.js');
    if (DE._err || typeof DE.classify !== 'function') { ck('LIB', false, 'scripts/dev_env.js loads and exports classify()', String(DE._err && DE._err.message).slice(0, 140)); return red; }
    if (WC._err) { ck('LIB', false, 'scripts/witness_cache.js loads', String(WC._err.message)); return red; }
    var R = mkRepo(), C = fs.mkdtempSync(path.join(os.tmpdir(), 'de-cache-'));
    var r = WC.runSync({ file: path.join(R, 'fx.js'), cwd: R, roots: [R], cacheDir: C, timeout: 60000 });
    if (!Array.isArray(r.inputList)) { ck('LIB', false, 'witness_cache.runSync returns the traced input list (inputList)', typeof r.inputList); return red; }
    var r2 = WC.runSync({ file: path.join(R, 'fx.js'), cwd: R, roots: [R], cacheDir: C, timeout: 60000 });
    ck('U0', r2.cached && Array.isArray(r2.inputList) && r2.inputList.length === r.inputList.length, 'a CACHED run returns the same input list (the check also works on a hit)', 'cached=' + r2.cached + ' n=' + (r2.inputList || []).length + '/' + r.inputList.length);
    var by = function (cl, name) { return cl.filter(function (x) { return x.path === name; })[0] || null; };
    var cl = DE.classify(r.inputList, [{ name: 'fx', dir: R }], { entries: [] });
    ck('U1', !by(cl, 'tracked.txt') && !by(cl, 'fx.js') && by(cl, 'untracked.db') && by(cl, 'untracked.db').kind === 'untracked', 'a tracked input is not flagged; an untracked one is', JSON.stringify(cl.map(function (x) { return x.path + ':' + x.kind; })));
    ck('U2', !!by(cl, 'ignored.db') && by(cl, 'ignored.db').kind === 'untracked', 'a gitignored input is flagged', JSON.stringify(by(cl, 'ignored.db')));
    ck('U3', !!by(cl, 'lfsstub.db') && by(cl, 'lfsstub.db').kind === 'lfs-pointer', 'a tracked git-lfs pointer stub is flagged (LFS is OFF: a stranger gets the stub)', JSON.stringify(by(cl, 'lfsstub.db')));
    var uSha = sha(fs.readFileSync(path.join(R, 'untracked.db'))), man = { entries: [{ repo: 'fx', path: 'untracked.db', sha256: uSha }, { repo: 'fx', path: 'ignored.db', sha256: '0'.repeat(64) }] };
    var cl2 = DE.classify(r.inputList, [{ name: 'fx', dir: R }], man);
    ck('P1', by(cl2, 'untracked.db') && by(cl2, 'untracked.db').manifest === 'ok' && by(cl2, 'untracked.db').portable === true, 'a manifest entry with the SAME sha makes it portable', JSON.stringify(by(cl2, 'untracked.db')));
    ck('P2', by(cl2, 'ignored.db') && by(cl2, 'ignored.db').manifest === 'stale' && by(cl2, 'ignored.db').portable === false, 'a manifest entry with ANOTHER sha is stale, not portable', JSON.stringify(by(cl2, 'ignored.db')));
    ck('P3', by(cl2, 'lfsstub.db') && by(cl2, 'lfsstub.db').manifest === 'missing' && by(cl2, 'lfsstub.db').portable === false, 'no manifest entry: missing, not portable', JSON.stringify(by(cl2, 'lfsstub.db')));
    // ── fetch, from a local HTTP server standing in for OCI ──
    var FE = load(dir, 'dev_env_fetch.js');
    if (FE._err || typeof FE.fetchAll !== 'function') { ck('F0', false, 'scripts/dev_env_fetch.js loads and exports fetchAll()', String(FE._err && FE._err.message).slice(0, 140)); return red; }
    var good = Buffer.from('the real bytes ' + Date.now()), served = { '/plain': good, '/gz': zlib.gzipSync(good), '/bad': Buffer.from('tampered bytes') }, hits = 0;
    var srv = http.createServer(function (q, s) { hits++; var b = served[q.url]; if (!b) { s.statusCode = 404; return s.end(); } if (q.url === '/gz') s.setHeader('content-encoding', 'gzip'); s.end(b); });
    await new Promise(function (res) { srv.listen(0, '127.0.0.1', res); });
    var U = 'http://127.0.0.1:' + srv.address().port, D = fs.mkdtempSync(path.join(os.tmpdir(), 'de-dest-')), gs = sha(good);
    var M = function (p, url) { return { entries: [{ repo: 'fx', path: p, sha256: gs, bytes: good.length, url: url }] }; };
    var f1 = await FE.fetchAll(M('a/one.db', U + '/plain'), { fx: D });
    ck('F1', f1.ok && fs.existsSync(path.join(D, 'a/one.db')) && sha(fs.readFileSync(path.join(D, 'a/one.db'))) === gs, 'fetch places the file and its sha256 matches the manifest', JSON.stringify(f1.results));
    var f2 = await FE.fetchAll(M('b/two.db', U + '/bad'), { fx: D });
    ck('F2', !f2.ok && !fs.existsSync(path.join(D, 'b/two.db')), 'tampered bytes are REFUSED and leave no file', JSON.stringify(f2.results));
    var f3 = await FE.fetchAll(M('c/three.db', U + '/gz'), { fx: D });
    ck('F3', f3.ok && fs.existsSync(path.join(D, 'c/three.db')) && sha(fs.readFileSync(path.join(D, 'c/three.db'))) === gs, 'a gzip-encoded transfer (as OCI serves) is decoded and verified', JSON.stringify(f3.results));
    var h0 = hits, f4 = await FE.fetchAll(M('a/one.db', U + '/plain'), { fx: D });
    ck('F4', f4.ok && hits === h0, 'an already-matching local file is not downloaded again', 'requests=' + (hits - h0));
    srv.close();
  } finally { ck = saveCk; }
  return red;
}

(async function () {
  console.log('§DE W-DEV-ENV (§50.2) node ' + process.version);
  await fixtureArms(__dirname, false);
  // ── R1/R2: the real terms runner on this tree ──
  if (A.real === '0') { ck('R1', null, 'the terms runner names its untracked inputs', '--real 0'); }
  else if (!fs.existsSync(path.join(__dirname, 'dev_env.js'))) ck('R1', false, 'the terms runner names its untracked inputs', 'no scripts/dev_env.js');
  else {
    var L = fs.mkdtempSync(path.join(os.tmpdir(), 'de-real-')), r = cp.spawnSync('node', [path.join(__dirname, 'witness_terms.js'), '--browser', '0', '--logs', L], { cwd: ROOT, encoding: 'utf8', timeout: 3600000, maxBuffer: 1 << 28 }), o = (r.stdout || '') + (r.stderr || '');
    var un = o.match(/^§UNTRACKED [^\n]*/mg) || [], pt = (o.match(/§TERMS_PORTABLE [^\n]*/) || [''])[0];
    un.forEach(function (l) { console.log('   ' + l); }); console.log('   ' + pt);
    ck('R1', /§TERMS_PORTABLE rows=\d+ portable=\d+ not_portable=\d+/.test(pt) && un.some(function (l) { return /build\/erp\/ad_full\.db/.test(l); }), 'the runner prints §UNTRACKED lines (incl. build/erp/ad_full.db, the gap found by hand) and a §TERMS_PORTABLE verdict', un.length + ' lines');
    var m = pt.match(/portable=(\d+) not_portable=(\d+)/);
    ck('R2', m ? (A.expectPortable ? +m[1] === +A.expectPortable && +m[2] === 0 : null) : false, 'portable count as expected (--expectPortable N after publishing)', pt);
  }
  if (A.stranger === '1') {
    var S = fs.mkdtempSync(path.join(os.tmpdir(), 'de-stranger-')), sh = function (c, cwd) { var t0 = Date.now(), x = cp.spawnSync('sh', ['-c', c], { cwd: cwd || S, encoding: 'utf8', timeout: 3600000, maxBuffer: 1 << 28, env: Object.assign({}, process.env, { WITNESS_CACHE_DIR: path.join(S, 'cache') }) }); console.log('   §DE-R3 $ ' + c + ' -> exit ' + x.status + ' (' + ((Date.now() - t0) / 1000).toFixed(0) + ' s)'); return x; };
    sh('git clone -q https://github.com/red1oon/BIMCompiler.git && git clone -q https://github.com/red1oon/bim-ootb.git');
    sh('npm install --no-audit --no-fund --loglevel=error', path.join(S, 'BIMCompiler'));
    var fe = sh('node scripts/dev_env_fetch.js --root-bim-ootb ../bim-ootb', path.join(S, 'BIMCompiler'));
    console.log('   ' + ((fe.stdout || '') + (fe.stderr || '')).split('\n').filter(function (l) { return /§DEV_ENV/.test(l); }).join('\n   '));
    var tr = sh('node scripts/witness_terms.js --browser 0 --ootb ../bim-ootb --logs ' + path.join(S, 'logs'), path.join(S, 'BIMCompiler')), to = (tr.stdout || '') + (tr.stderr || '');
    var v = (to.match(/§TERMS_VERDICT [^\n]*/) || [''])[0], p = (to.match(/§TERMS_PORTABLE [^\n]*/) || [''])[0];
    console.log('   §DE-R3 ' + v); console.log('   §DE-R3 ' + p);
    ck('R3', /§TERMS_VERDICT PASS enforced=13 open=0 witness_failed=0/.test(v), 'a STRANGER tree (fresh GitHub clones + documented install + dev_env_fetch) gives the same 13 enforced / 0 open', v + ' | dir ' + S);
  }
  // ── mutants ──
  var MUT = [
    ['gitignored inputs not flagged', 'dev_env.js', "if (!tracked[k.rel]) return out.push(mk('untracked'));", "if (!tracked[k.rel] && !ign[k.rel]) return out.push(mk('untracked'));", ['U2']],
    ['LFS pointer check off', 'dev_env.js', "if (isLfsPointer(k.abs)) return out.push(mk('lfs-pointer'));", '', ['U3']],
    ['stale treated as ok', 'dev_env.js', "var st = !e ? 'missing' : e.sha256 === x.h ? 'ok' : 'stale';", "var st = !e ? 'missing' : 'ok';", ['P2']],
    ['fetch skips the sha check', 'dev_env_fetch.js', 'if (got !== e.sha256) {', 'if (false) {', ['F2']]
  ];
  var killed = 0;
  if (['dev_env.js', 'dev_env_fetch.js'].every(function (f) { return fs.existsSync(path.join(__dirname, f)); })) for (var mu of MUT) {
    var D = fs.mkdtempSync(path.join(os.tmpdir(), 'de-mut-'));
    ['dev_env.js', 'dev_env_fetch.js', 'witness_cache.js', 'witness_trace.js'].forEach(function (f) { fs.copyFileSync(path.join(__dirname, f), path.join(D, f)); });
    var src = fs.readFileSync(path.join(D, mu[1]), 'utf8'), n = src.split(mu[2]).length - 1;
    if (n !== 1) { console.log('   FAIL §DE-MUT "' + mu[0] + '" needle_count=' + n + ' (must be 1): NOT applied, not a kill'); fails++; continue; }
    var rep = mu[3];
    fs.writeFileSync(path.join(D, mu[1]), src.replace(mu[2], rep));
    var red; try { red = await fixtureArms(D, true); } catch (e) { console.log('   FAIL §DE-MUT "' + mu[0] + '" CRASHED (' + e.message + '): not a kill'); fails++; continue; }
    var hit = Object.keys(red), ok = mu[4].some(function (k) { return hit.indexOf(k) >= 0; }) && hit.indexOf('LIB') < 0 && hit.indexOf('F0') < 0;
    if (ok) killed++; else fails++;
    console.log('   ' + (ok ? 'PASS' : 'FAIL') + ' §DE-MUT "' + mu[0] + '" needle_count=1 -> red=' + (hit.join(',') || 'none') + ' (expected ' + mu[4].join(',') + ')');
  } else console.log('   FAIL §DE-MUT mutants not run: dev_env.js / dev_env_fetch.js do not exist');
  var verdict = !judged ? 'INCONCLUSIVE' : fails ? 'FAIL' : inc ? 'INCONCLUSIVE' : 'PASS';
  console.log('§DE_VERDICT ' + verdict + ' judged=' + judged + ' fails=' + fails + ' inconclusive=' + inc + ' mutants=' + killed + '/' + MUT.length);
  process.exit(verdict === 'PASS' ? 0 : 1);
})().catch(function (e) { console.log('§DE_CRASH ' + (e && e.stack || e)); process.exit(2); });
