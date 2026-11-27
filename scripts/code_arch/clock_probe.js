// ⚠ DO NOT REMOVE — SCOPE: the clock/random/network probe behind prompts/CODE_ARCHITECTURE_DESIGN.md P3 + §M (issue #602).
// Measures, never fixes. It answers "how many value-making calls sit in these files?", the population PART A must move onto Env.
// AST (espree, from bim-ootb's own node_modules) so comments and strings never count (EDITOR_MAINTAINABILITY_STUDY §9).
// Counts: Date.now(), new Date() with no args, Math.random(), crypto.randomUUID()/getRandomValues(), fetch().
// Skips tests/, witness files, *.min.js, vendored erp/sqljs/ + erp/lib/. A file that fails to parse is listed, never silently dropped.
// It does NOT tell a VALUE read (a date that lands in a row) from a TIMING read (elapsed ms for a § line) - PART A decision 4.
// usage: node scripts/code_arch/clock_probe.js <bim-ootb root> [git pathspec ...]   (default pathspec 'erp/*.js')
// output: §CLOCK_PROBE files= with_calls= calls= parse_fail=   then one line per file (count, path, call@line ...). Read the log.
const fs = require('fs'), path = require('path');
const root = process.argv[2];
const espree = require(path.join(root, 'node_modules/espree'));
const { execSync } = require('child_process');
const spec = process.argv.slice(3).map(p => "'" + p + "'").join(' ') || "'erp/*.js'";
const files = execSync('git ls-files ' + spec, { cwd: root }).toString().trim().split('\n')
  .filter(f => !/(^|\/)(tests?|witness[^/]*|node_modules|vendor)\//.test(f) && !/\.min\.js$/.test(f) && !/^erp\/(sqljs|lib)\//.test(f) && !/(^|\/)witness_[^/]*\.js$/.test(f));
const out = []; let parseFail = [];
for (const f of files) {
  let src = fs.readFileSync(path.join(root, f), 'utf8');
  if (src.startsWith('#!')) src = '//' + src;
  let ast;
  for (const sourceType of ['script', 'module']) {
    try { ast = espree.parse(src, { ecmaVersion: 'latest', sourceType, loc: true }); break; } catch (e) { ast = null; }
  }
  if (!ast) { parseFail.push(f); continue; }
  const hits = [];
  (function walk(n) {
    if (!n || typeof n.type !== 'string') return;
    if (n.type === 'CallExpression') {
      const c = n.callee;
      const m = c.type === 'MemberExpression' && !c.computed ? (c.object.type === 'Identifier' ? c.object.name : (c.object.type === 'MemberExpression' && c.object.property && c.object.property.name) || '') + '.' + c.property.name : '';
      if (m === 'Date.now' || m === 'Math.random' || /crypto\.(randomUUID|getRandomValues)$/.test(m)) hits.push([m, n.loc.start.line]);
      if (c.type === 'Identifier' && c.name === 'fetch') hits.push(['fetch', n.loc.start.line]);
    }
    if (n.type === 'NewExpression' && n.callee.type === 'Identifier' && n.callee.name === 'Date' && n.arguments.length === 0) hits.push(['new Date()', n.loc.start.line]);
    for (const k in n) { if (k === 'loc' || k === 'range') continue; const v = n[k]; if (Array.isArray(v)) v.forEach(walk); else if (v && typeof v === 'object') walk(v); }
  })(ast);
  if (hits.length) out.push({ f, n: hits.length, hits });
}
const total = out.reduce((s, r) => s + r.n, 0);
console.log(`§CLOCK_PROBE files=${files.length} with_calls=${out.length} calls=${total} parse_fail=${parseFail.length}`);
if (parseFail.length) console.log('§CLOCK_PROBE_PARSE_FAIL ' + parseFail.join(' '));
out.sort((a, b) => b.n - a.n).forEach(r => console.log(`${String(r.n).padStart(3)} ${r.f}  ${r.hits.map(h => h[0] + '@' + h[1]).join(', ')}`));
