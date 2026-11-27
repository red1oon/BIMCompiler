// # ⚠ DO NOT REMOVE — SCOPE: read-only measurement for prompts/CODE_ARCHITECTURE_DESIGN.md §F.6 (decision F-9, §-Lens).
// It writes nothing. Read its log after every run: exit code is not evidence.
// Check 1 coverage : of the §TAGs the code prints, how many appear in saved logs?
// Check 2 freshness: can a saved log be tied to the code version that produced it?
// Printed tags come from a PARSER (espree): string/template text inside the arguments of a log-like call. Comments never count.
// Limits: a tag assembled at runtime ('§' + name) is not seen; "log-like" is the callee NAME (log, warn, _log, …), not its behaviour.
// Usage: node scripts/code_arch/lens_precheck.js [<bim-ootb root>] [<bim-compiler root>]   (defaults: siblings under the home folder)
'use strict';
const fs = require('fs'), path = require('path'), os = require('os'), zlib = require('zlib'), cp = require('child_process');
const OOTB = path.resolve(process.argv[2] || path.join(os.homedir(), 'bim-ootb'));
const COMP = path.resolve(process.argv[3] || path.join(os.homedir(), 'bim-compiler'));
const espree = require(path.join(OOTB, 'node_modules', 'espree'));
const TAG = /§[A-Z][A-Z0-9_]+/g;
const tagsOf = s => (s.match(TAG) || []);
const isTest = rel => /(^|\/)tests?\//.test(rel) || /(^|\/)witness_[^/]*\.js$/.test(rel);
const LOGLIKE = /^(log|info|warn|error|debug|trace|\w*[Ll]og\w*)$/;

// ── printed tags, by PARSER: string/template text inside the arguments of a log-like call ──
const files = cp.execFileSync('git', ['-C', OOTB, 'ls-files', '*.js'], { encoding: 'utf8', maxBuffer: 1 << 26 }).split('\n')
  .filter(f => f && !/(^|\/)(lib|node_modules|archive)\//.test(f) && !/\.min\.js$/.test(f) && !/^devtools\//.test(f));
const printed = new Map();   // tag -> Set(rel)   (log-call argument)
const anyStr = new Map();    // tag -> Set(rel)   (any string literal / template text)
let parsed = 0, parseFail = 0;
function visit(n, fn, inLog) {
  if (!n || typeof n.type !== 'string') return;
  let now = inLog;
  if (n.type === 'CallExpression') {
    const c = n.callee, name = c.type === 'Identifier' ? c.name : (c.type === 'MemberExpression' && !c.computed && c.property.name) || '';
    if (LOGLIKE.test(name)) now = true;
    visit(n.callee, fn, inLog);
    n.arguments.forEach(a => visit(a, fn, now));
    return;
  }
  fn(n, now);
  for (const k of Object.keys(n)) {
    const v = n[k];
    if (Array.isArray(v)) v.forEach(c => visit(c, fn, now)); else if (v && typeof v === 'object' && k !== 'loc') visit(v, fn, now);
  }
}
const add = (m, t, rel) => (m.get(t) || m.set(t, new Set()).get(t)).add(rel);
for (const rel of files) {
  let src; try { src = fs.readFileSync(path.join(OOTB, rel), 'utf8'); } catch (e) { continue; }
  if (src.indexOf('§') < 0) { parsed++; continue; }
  let ast = null;
  for (const st of ['script', 'module']) { try { ast = espree.parse(src, { ecmaVersion: 'latest', sourceType: st, allowReturnOutsideFunction: true }); break; } catch (e) { ast = null; } }
  if (!ast) { parseFail++; continue; }
  parsed++;
  visit(ast, (n, inLog) => {
    const s = n.type === 'Literal' && typeof n.value === 'string' ? n.value : n.type === 'TemplateElement' ? (n.value.cooked || '') : null;
    if (!s || s.indexOf('§') < 0) return;
    for (const t of tagsOf(s)) { add(anyStr, t, rel); if (inLog) add(printed, t, rel); }
  }, false);
}
const prod = m => new Set([...m].filter(([, fs2]) => [...fs2].some(r => !isTest(r))).map(([t]) => t));
const D = prod(printed), Dany = prod(anyStr);
console.log('§F9_PRINTED js_files=' + files.length + ' parsed=' + parsed + ' parse_fail=' + parseFail
  + ' printed_tags_prod=' + D.size + ' printed_tags_incl_tests=' + printed.size + ' any_string_tags_prod=' + Dany.size);

// ── tags seen in saved logs ──
function readText(f) {
  try {
    const st = fs.statSync(f); if (!st.isFile() || st.size > 200 * 1024 * 1024) return null;
    const b = fs.readFileSync(f); return /\.gz$/.test(f) ? zlib.gunzipSync(b).toString('utf8') : b.toString('utf8');
  } catch (e) { return null; }
}
function walk(dir, keep, out) {
  let ents; try { ents = fs.readdirSync(dir, { withFileTypes: true }); } catch (e) { return out; }
  for (const e of ents) { const p = path.join(dir, e.name); if (e.isDirectory()) walk(p, keep, out); else if (keep(e.name)) out.push(p); }
  return out;
}
const isLog = n => /\.(log|out|txt)(\.gz)?$/.test(n);
const CACHE = path.join(os.homedir(), '.cache', 'bim4d');
const tiers = {
  'T1 bim4d witness.log': walk(CACHE, n => n === 'witness.log', []),
  'T2 bim4d other logs': walk(CACHE, n => isLog(n) && n !== 'witness.log', []),
  'T3 bim-ootb logs folders': ['logs', 'viewer/tests/logs', 'modeller/tests/logs', 'prompts/mfg/logs'].flatMap(d => walk(path.join(OOTB, d), isLog, [])),
  'T4 bim-compiler logs folders': ['logs', 'log', 'build/logs', 'scripts/logs', 'build/comm/logs'].flatMap(d => walk(path.join(COMP, d), isLog, []))
    .concat(fs.readdirSync(path.join(COMP, 'build', 'erp')).filter(d => /^logs/.test(d) || /^erp_sweep/.test(d)).flatMap(d => walk(path.join(COMP, 'build', 'erp', d), isLog, []))),
};
const seen = {}, stamp = {};
const STAMP = /\bcommit=[0-9a-f]{7,40}\b/;   // the one stamp found in use (cli_silent_bake.js §CLI_BAKE_ENV). `sha=` there is a frame hash, not code.
for (const [name, list] of Object.entries(tiers)) {
  const s = new Set(); let stamped = 0, read = 0;
  for (const f of list) { const t = readText(f); if (t === null) continue; read++; for (const x of tagsOf(t)) s.add(x); if (STAMP.test(t)) stamped++; }
  seen[name] = s; stamp[name] = { files: list.length, read, stamped };
}
const inter = (a, b) => [...a].filter(x => b.has(x));
const union = new Set(); const cum = [];
for (const name of Object.keys(tiers)) {
  for (const x of seen[name]) union.add(x);
  console.log('§F9_COVERAGE tier="' + name + '" files=' + stamp[name].files + ' read=' + stamp[name].read + ' log_tags=' + seen[name].size
    + ' printed_covered=' + inter(D, seen[name]).length + '/' + D.size + ' (' + (100 * inter(D, seen[name]).length / D.size).toFixed(1) + '%)'
    + ' cumulative=' + inter(D, union).length + '/' + D.size + ' (' + (100 * inter(D, union).length / D.size).toFixed(1) + '%)');
}
// by app (top folder of a non-test printer)
const byApp = {};
for (const t of D) for (const top of new Set([...printed.get(t)].filter(r => !isTest(r)).map(r => r.split('/')[0]))) {
  const a = byApp[top] || (byApp[top] = { n: 0, cov: 0 }); a.n++; if (union.has(t)) a.cov++;
}
console.log('§F9_COVERAGE_BY_APP ' + Object.entries(byApp).sort((a, b) => b[1].n - a[1].n).slice(0, 10).map(([k, v]) => k + '=' + v.cov + '/' + v.n).join(' '));
const orphan = [...union].filter(t => !printed.has(t) && !anyStr.has(t)).length;
console.log('§F9_LOG_ONLY tags_in_logs=' + union.size + ' not_found_in_any_js_string=' + orphan + ' (printed by other repos, built at runtime, or removed code)');

// ── Check 2: freshness ──
const C = require(path.join(OOTB, 'scripts', 'cache_4d_run.js'));
const cur = C.codeKey();
const runs = tiers['T1 bim4d witness.log'].map(f => path.basename(path.dirname(f)));
const current = runs.filter(r => r.startsWith(cur)).length;
const distinctKeys = new Set(runs.map(r => r.split('_')[0])).size;
const src = fs.readFileSync(path.join(OOTB, 'scripts', 'cache_4d_run.js'), 'utf8');
const KEYED = new Set(['viewer/schedule_gate.js', 'viewer/schedule_author.js', 'viewer/support_sweep.js', 'viewer/cpm_schedule.js', 'viewer/rates.js',
  'viewer/time_machine.js', 'viewer/gantt_model.js', 'viewer/location_axis.js', 'viewer/lib/room_walker.js', 'viewer/lib/level_deriver.js', 'scripts/lib/tm_played_layer.js']);
const keyedListed = [...KEYED].filter(k => src.includes("'" + k.replace(/^viewer\/|^scripts\//, '') + "'")).length;
const t1 = seen['T1 bim4d witness.log'];
let allKeyed = 0, someUnkeyed = 0, noPrinter = 0;
// lib/ files were skipped by the scan above; scan the two keyed lib files' raw text for their tags (text presence only).
const libTags = new Set(['viewer/lib/room_walker.js', 'viewer/lib/level_deriver.js', 'scripts/lib/tm_played_layer.js'].flatMap(f => tagsOf(readText(path.join(OOTB, f)) || '')));
for (const t of t1) {
  const p = printed.get(t) ? [...printed.get(t)].filter(r => !isTest(r)) : [];
  if (!p.length) { if (libTags.has(t)) allKeyed++; else noPrinter++; continue; }
  if (p.every(r => KEYED.has(r))) allKeyed++; else someUnkeyed++;
}
console.log('§F9_FRESH_BIM4D runs=' + runs.length + ' distinct_code_keys=' + distinctKeys + ' current_key=' + cur + ' runs_on_current_code=' + current
  + ' keyed_files=' + KEYED.size + ' keyed_files_confirmed_in_script=' + keyedListed
  + ' log_tags=' + t1.size + ' printer_inside_key=' + allKeyed + ' printer_outside_key=' + someUnkeyed + ' printer_unknown=' + noPrinter);
for (const name of Object.keys(tiers)) console.log('§F9_FRESH_STAMP tier="' + name + '" files=' + stamp[name].read + ' with_commit_stamp=' + stamp[name].stamped);
const tracked = new Set(cp.execFileSync('git', ['-C', OOTB, 'ls-files', 'logs', 'viewer/tests/logs', 'modeller/tests/logs', 'prompts/mfg/logs'], { encoding: 'utf8' }).split('\n').filter(Boolean));
console.log('§F9_FRESH_TRACKED ootb_log_files=' + tiers['T3 bim-ootb logs folders'].length + ' tracked_in_git=' + tiers['T3 bim-ootb logs folders'].filter(f => tracked.has(path.relative(OOTB, f))).length);
