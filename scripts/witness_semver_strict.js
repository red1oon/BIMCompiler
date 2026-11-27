#!/usr/bin/env node
// ⚠ DO NOT REMOVE — Scope: W-SEMVER-STRICT, the witness of prompts/TEAMWORK_FRAMEWORK.md §46.6 S4 (review finding F4): ONE strict version + range parser (build/comm/semver_strict.js == bim-ootb common/comm/semver_strict.js). READ THE LOG after every run.
// THE ISSUE it proves/disproves: the old plugin parser (erp/plugin_registry.js parseVer) returned [0,0,0] for garbage, so a range like "[1.2,2)" silently meant "= 0.0.0"; and "same semver numbers for op shapes" would have put "1.2.0"
//   into the signed integer `_sv` (op_versions.js refuses it bogus-version). Decision: op shapes keep the INTEGER (= the shape's semver MAJOR); plugins and releases keep full semver; ONE parser serves both.
// Arms: S1 accepted versions · S2 garbage versions THROW · S3 precedence (incl. pre-release) · S4 ranges (single comparators + OSGi two-sided) · S5 garbage ranges THROW · S6 the op-shape link (major() == the integer, a full semver is refused as `sv`).
// Run: node scripts/witness_semver_strict.js [> build/comm/logs/witness_semver_strict.log]   env SS_NO_MUTANTS=1 skips mutants; SS_ONLY_ARMS=1 prints only §SS_ARMS; SS_DIR=<dir> runs against another copy (mutants).
'use strict';
var path = require('path'), fs = require('fs'), os = require('os'), cp = require('child_process');
var ROOT = path.join(__dirname, '..'), B = process.env.SS_DIR || path.join(ROOT, 'build', 'comm');
var V = require(path.join(B, 'semver_strict.js')), OPV = require(path.join(ROOT, 'build', 'erp', 'op_versions.js'));
var ONLY = !!process.env.SS_ONLY_ARMS, say = function (s) { if (!ONLY) console.log(s); }, ARMS = {}, JUDGED = 0, FAILS = 0;
function check(id, name, cond, detail) { ARMS[id] = ARMS[id] || { bad: 0 }; JUDGED++; if (!cond) { ARMS[id].bad++; FAILS++; } say('   ' + (cond ? '🟢' : '🔴') + ' ' + id + ' ' + name + (detail ? ' — ' + detail : '')); }
function throws(f) { try { f(); return false; } catch (e) { return e instanceof TypeError; } }
say('═══ W-SEMVER-STRICT — one strict version + range parser (spec §46.6 S4) ═══');

say('\n── S1: versions it accepts ──');
var OK = { '1': [1, 0, 0], '1.2': [1, 2, 0], '1.2.3': [1, 2, 3], '0.0.0': [0, 0, 0], '10.20.30': [10, 20, 30], '0.10.0': [0, 10, 0], ' 2.0.1 ': [2, 0, 1] };
Object.keys(OK).forEach(function (k) { var p = null; try { p = V.parse(k); } catch (e) { p = null; } check('S1', JSON.stringify(k) + ' parses to ' + OK[k].join('.'), !!p && [p.major, p.minor, p.micro].join('.') === OK[k].join('.') && p.pre === null); });
var pp = null; try { pp = V.parse('1.2.3-alpha.1+build5'); } catch (e) { pp = null; }
check('S1', '"1.2.3-alpha.1+build5" parses: pre-release [alpha,1], the build part ignored', !!pp && pp.pre && pp.pre.join() === 'alpha,1' && pp.micro === 3);
check('S1', 'the real plugin version "14.0.0-slice1" (erp/plugins) parses', V.valid('14.0.0-slice1'));

say('\n── S2: garbage versions THROW (never [0,0,0]) ──');
var BAD = ['', ' ', 'x', 'garbage', '1.x', '1.2.3.4', 'v1', '01.2', '1..2', '-1', '1.2.3-', '1.2.3-01', '1.2.3-beta..1', '1e3', '1.2.3 4', '[1.2,2)', '>=1.0.0', null, undefined, 5, {}];
var notThrown = BAD.filter(function (b) { return !throws(function () { V.parse(b); }); });
check('S2', BAD.length + ' malformed versions each THROW a TypeError', notThrown.length === 0, notThrown.length ? 'accepted: ' + notThrown.map(function (x) { return JSON.stringify(x); }).join(' ') : 'all refused');
check('S2', 'valid() never throws and says false for them', BAD.every(function (b) { return V.valid(b) === false; }));
check('S2', 'compare() with one garbage side THROWS (no silent 0.0.0 ordering)', throws(function () { V.compare('1.0.0', 'garbage'); }) && throws(function () { V.compare('', '1.0.0'); }));

say('\n── S3: precedence ──');
check('S3', '1.2.3 < 1.10.0 (numeric, not text) and 1.0 == 1.0.0 and 2.0.0 > 1.99.99', V.compare('1.2.3', '1.10.0') === -1 && V.compare('1.0', '1.0.0') === 0 && V.compare('2.0.0', '1.99.99') === 1);
var chain = ['1.0.0-alpha', '1.0.0-alpha.1', '1.0.0-alpha.beta', '1.0.0-beta', '1.0.0-beta.2', '1.0.0-beta.11', '1.0.0-rc.1', '1.0.0'], inOrder = true;
for (var i = 0; i + 1 < chain.length; i++) if (V.compare(chain[i], chain[i + 1]) !== -1 || V.compare(chain[i + 1], chain[i]) !== 1) inOrder = false;
check('S3', 'the semver precedence chain alpha < alpha.1 < alpha.beta < beta < beta.2 < beta.11 < rc.1 < release holds', inOrder);
check('S3', 'build metadata does not affect precedence', V.compare('1.0.0+a', '1.0.0+b') === 0);

say('\n── S4: ranges ──');
var R = [  // [version, range, expected]
  ['1.5.0', '[1.2,2)', true], ['1.2.0', '[1.2,2)', true], ['1.1.9', '[1.2,2)', false], ['2.0.0', '[1.2,2)', false], ['1.99.99', '[1.2,2)', true], ['0.0.0', '[1.2,2)', false],
  ['1.2.0', '(1.2,2)', false], ['1.2.1', '(1.2,2)', true], ['2.0.0', '(1.0,2.0]', true], ['1.0.0', '(1.0,2.0]', false], ['2.0.0', '[1.2,2]', true], ['2.0.1', '[1.2,2]', false],
  ['1.0.0', '[1.0.0,1.0.0]', true], ['1.0.1', '[1.0.0,1.0.0]', false], ['1.5.0', ' [ 1.2 , 2 ) ', true], ['2.0.0-rc.1', '[1.2,2)', true], ['1.5.0', '(1,3)', true],
  ['0.10.0', '>=0.9.0', true], ['0.8.9', '>=0.9.0', false], ['1.0.0', '>1.0.0', false], ['1.0.1', '>1.0.0', true], ['1.0.0', '<=1.0.0', true], ['1.0.1', '<=1.0.0', false], ['0.9.9', '<1.0.0', true], ['1.0.0', '<1.0.0', false],
  ['1.2.3', '1.2.3', true], ['1.2.3', '=1.2.3', true], ['1.2.4', '1.2.3', false], ['9.9.9', '*', true], ['9.9.9', '', true], ['1.0.0', '>= 0.5', true]];
var wrong = R.filter(function (r) { var got; try { got = V.satisfies(r[0], r[1]); } catch (e) { got = 'THROW ' + e.message; } return got !== r[2]; });
check('S4', R.length + ' version/range pairs (single comparators + [a,b) (a,b] [a,b] (a,b)) judged as expected', wrong.length === 0, wrong.length ? 'wrong: ' + wrong.map(function (r) { return r[0] + ' in ' + r[1]; }).join('; ') : 'all');
check('S4', 'the OLD failure is gone: 0.0.0 does NOT satisfy "[1.2,2)" (it used to, because the range was read as "= 0.0.0")', V.satisfies('0.0.0', '[1.2,2)') === false);

say('\n── S5: garbage ranges THROW ──');
var BR = ['[1.2,2', '1.2,2)', '[2,1)', '(1,1)', '[1,1)', '(1,1]', '[a,b)', '[1.2;2)', '[1,2,3)', '[1,)', '[,2)', '>=', '>=x', '>> 1', '~1.2', '^1', '1.x', 'x', '<', '=', ')1,2(', null, undefined, 5];
var nt = BR.filter(function (b) { return !throws(function () { V.satisfies('1.0.0', b); }); });
check('S5', BR.length + ' malformed or empty ranges each THROW (an inverted or empty interval too)', nt.length === 0, nt.length ? 'accepted: ' + nt.map(function (x) { return JSON.stringify(x); }).join(' ') : 'all refused');
check('S5', 'a garbage VERSION against a good range also THROWS (not false)', throws(function () { V.satisfies('garbage', '[1.2,2)'); }));
check('S5', 'a point interval [1,1] is accepted (inclusive both ends)', V.satisfies('1.0.0', '[1,1]') === true);

say('\n── S6: ONE parser, TWO version fields: the op shape keeps the INTEGER = the semver MAJOR ──');
check('S6', 'major("2.1.0") === 2, major("3") === 3, major("0.9.0") === 0; garbage throws', V.major('2.1.0') === 2 && V.major('3') === 3 && V.major('0.9.0') === 0 && throws(function () { V.major('x'); }));
var R1 = OPV.create({}); R1.setApp('CRUD_CREATE', 2);
var jFull = R1.judge({ op_type: 'CRUD_CREATE', sv: '1.2.0', params: {} }, null), jInt = R1.judge({ op_type: 'CRUD_CREATE', sv: V.major('2.1.0'), params: {} }, null);
check('S6', 'a FULL semver "1.2.0" in the signed `sv` field is REFUSED bogus-version (so op shapes stay integers); the integer major("2.1.0") = 2 is accepted', !!jFull && jFull.verdict === 'REFUSED' && jFull.reason === 'bogus-version' && jInt === null, JSON.stringify(jFull) + ' / ' + JSON.stringify(jInt));

var red = Object.keys(ARMS).filter(function (k) { return ARMS[k].bad > 0; });
console.log('§SS_ARMS red=' + (red.join(',') || 'none') + ' judged=' + JUDGED);
if (ONLY) process.exit(red.length ? 1 : 0);
var muts = [];
if (!process.env.SS_NO_MUTANTS && !process.env.SS_DIR) {
  var src = fs.readFileSync(path.join(B, 'semver_strict.js'), 'utf8');
  var M = [
    ['garbage parses to 0.0.0 (the old behaviour)', "if (!m) throw new TypeError('invalid version \"' + v + '\" (expected major[.minor[.micro]][-prerelease])');", 'if (!m) return { major: 0, minor: 0, micro: 0, pre: null };', ['S2', 'S5']],
    ['the interval upper bound is ignored', '(r.hiInc ? ch <= 0 : ch < 0)', 'true', ['S4']],
    ['inclusive and exclusive lower bounds swapped', '(r.loInc ? cl >= 0 : cl > 0)', '(r.loInc ? cl > 0 : cl >= 0)', ['S4']],
    ['a pre-release does not sort below its release', 'if (!a && !b) return 0; if (!a) return 1; if (!b) return -1;', 'return 0;', ['S3']],
    ['an empty or inverted interval is accepted', 'if (c > 0 || (c === 0 && !(loInc && hiInc))) throw', 'if (false) throw', ['S5']],
    ['major() reads the minor part', 'function major(v) { return parse(v).major; }', 'function major(v) { return parse(v).minor; }', ['S6']],
    ['leading zeros are accepted', "var NUM = '(?:0|[1-9][0-9]*)'", "var NUM = '[0-9]+'", ['S2']]];
  M.forEach(function (m) {
    if (src.split(m[1]).length !== 2) { muts.push({ name: m[0], error: 'anchor not found exactly once' }); return; }
    var mutated = src.replace(m[1], function () { return m[2]; }); if (mutated === src) { muts.push({ name: m[0], error: 'not applied' }); return; }
    var dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ss-mut-')); fs.writeFileSync(path.join(dir, 'semver_strict.js'), mutated);       // a COPY
    var k = cp.spawnSync(process.execPath, [__filename], { encoding: 'utf8', timeout: 120000, env: Object.assign({}, process.env, { SS_DIR: dir, SS_ONLY_ARMS: '1' }) });
    fs.rmSync(dir, { recursive: true, force: true }); var mm = /§SS_ARMS red=(\S+)/.exec(k.stdout || '');
    muts.push({ name: m[0], expect: m[3], red: mm ? (mm[1] === 'none' ? [] : mm[1].split(',')) : ['CRASH'] });
  });
  console.log('\n§SS_MUTANTS');
  muts.forEach(function (m) { var ok = !m.error && m.red.indexOf('CRASH') === -1 && m.expect.every(function (e) { return m.red.indexOf(e) !== -1; }); if (!ok) FAILS++;
    console.log('   ' + (ok ? '🟢' : '🔴') + ' ' + m.name + ' -> ' + (m.error || ('red arms: ' + (m.red.join(', ') || 'NONE (survivor)') + ' (expected ' + m.expect.join('/') + ')'))); });
}
var killed = muts.filter(function (m) { return !m.error && m.red.length > 0 && m.red.indexOf('CRASH') === -1; }).length;
console.log('§SS_VERDICT ' + (FAILS ? 'FAIL' : 'PASS') + ' judged=' + JUDGED + ' fails=' + FAILS + (muts.length ? ' mutants_killed=' + killed + '/' + muts.length : ' mutants=skipped'));
process.exit(FAILS ? 1 : 0);
