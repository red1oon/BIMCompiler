// ⚠ DO NOT REMOVE — SCOPE: film "When AI Dies" (prompts/FILM_WHEN_AI_DIES.md, "The honest proof for no AI, no network"). READ-ONLY over the bim-ootb tree; read the log, exit code is not evidence.
// THE ISSUE it proves or disproves: "the code-understanding features of X0 Navigator never reach the network, so they keep working when the assistant and the connection are gone".
// The machine cannot cut one process off the network without root (measured 2026-11-18), so the film does NOT claim "we pulled the plug". This lists the network doors in the SOURCE instead:
//   every file the .vsix packs (the ONE packing rule, lib/build_stamp.js listFiles) + the repo's scripts/lib/core_pure.js (the purity feature's scanner, loaded from the open folder),
//   parsed with espree (a comment or a string that only mentions fetch() is not a door). A door = require/import of http, https, http2, net, tls, dgram, dns; a call of fetch(); new WebSocket / XMLHttpRequest /
//   EventSource; a string literal 'gh' / 'curl' / 'wget' / 'ssh' (a command run) or 'push' inside an array (git push); vscode.env.openExternal. http.createServer is a LOCAL listener, counted apart.
//   FEATURES are traced through the require graph: a feature is clean only if no file it reaches (relative requires, transitively) holds a door.
// RED CONTROL: a copy of a hover file (lib/tag_index.js) with a planted fetch() must be counted; a scanner that finds no door in ship.js (the file that must have them) is blind -> INCONCLUSIVE.
// Usage: node offline.js <bim-ootb tree>      prints §X0_OFFLINE ... verdict=PASS|FAIL|INCONCLUSIVE
'use strict';
const fs = require('fs'), path = require('path');
const TREE = path.resolve(process.argv[2] || '.'), EXT = path.join(TREE, 'devtools/vscode/x0-navigator');
const espree = require(path.join(TREE, 'node_modules', 'espree')), stamp = require(path.join(EXT, 'lib/build_stamp.js'));
const NET_MODS = new Set(['http', 'https', 'http2', 'net', 'tls', 'dgram', 'dns']), CMDS = new Set(['gh', 'curl', 'wget', 'ssh']), XHR = new Set(['XMLHttpRequest', 'WebSocket', 'EventSource']);
const modName = s => String(s).replace(/^node:/, '');
/** the doors of one source text: [{kind, what, line}] ; local listeners are returned with kind 'local' */
function doors(src) {
  if (src.startsWith('#!')) src = '//' + src;
  let ast = null; for (const sourceType of ['script', 'module']) { try { ast = espree.parse(src, { ecmaVersion: 'latest', sourceType, loc: true }); break; } catch (e) { ast = null; } }
  if (!ast) return null;
  const out = [], bound = new Map(), requires = [], fnStack = [], uses = new Map();   // variable -> module ; variable -> member names called
  (function walk(n, parent) {
    if (!n || typeof n.type !== 'string') return;
    const fname = n.type === 'FunctionDeclaration' && n.id ? n.id.name : (n.type === 'FunctionExpression' || n.type === 'ArrowFunctionExpression') && parent && parent.type === 'VariableDeclarator' && parent.id.type === 'Identifier' ? parent.id.name : null;
    if (fname) fnStack.push(fname);
    const fn = () => fnStack.length ? fnStack[fnStack.length - 1] : '(top level)';
    if (n.type === 'CallExpression' && n.callee.type === 'Identifier' && n.callee.name === 'require' && n.arguments[0] && n.arguments[0].type === 'Literal') {
      const m = modName(n.arguments[0].value); requires.push(String(n.arguments[0].value));
      if (NET_MODS.has(m)) { out.push({ kind: 'module', what: "require('" + m + "')", line: n.loc.start.line, fn: fn(), mod: m });
        if (parent && parent.type === 'VariableDeclarator' && parent.id.type === 'Identifier') bound.set(parent.id.name, m); } }
    if (n.type === 'ImportDeclaration' && NET_MODS.has(modName(n.source.value))) out.push({ kind: 'module', what: "import '" + n.source.value + "'", line: n.loc.start.line });
    if (n.type === 'CallExpression' && n.callee.type === 'Identifier' && n.callee.name === 'fetch') out.push({ kind: 'fetch', what: 'fetch()', line: n.loc.start.line, fn: fn() });
    if (n.type === 'NewExpression' && n.callee.type === 'Identifier' && XHR.has(n.callee.name)) out.push({ kind: 'client', what: 'new ' + n.callee.name, line: n.loc.start.line });
    if (n.type === 'CallExpression' && n.callee.type === 'MemberExpression' && !n.callee.computed && n.callee.object.type === 'Identifier' && bound.has(n.callee.object.name)) {
      const p = n.callee.property.name; (uses.get(n.callee.object.name) || uses.set(n.callee.object.name, []).get(n.callee.object.name)).push(p); out.push({ kind: p === 'createServer' ? 'local' : 'outbound', what: bound.get(n.callee.object.name) + '.' + p + '()', line: n.loc.start.line, fn: fn() }); }
    if (n.type === 'MemberExpression' && !n.computed && n.property.name === 'openExternal') out.push({ kind: 'browser', what: 'openExternal', line: n.loc.start.line });
    if (n.type === 'Literal' && typeof n.value === 'string' && CMDS.has(n.value)) out.push({ kind: 'command', what: "'" + n.value + "'", line: n.loc.start.line, fn: fn() });
    if (n.type === 'ArrayExpression' && n.elements.some(e => e && e.type === 'Literal' && e.value === 'push')) out.push({ kind: 'command', what: "git push (array holds 'push')", line: n.loc.start.line });
    for (const k of Object.keys(n)) { if (k === 'loc') continue; const v = n[k]; if (Array.isArray(v)) v.forEach(c => walk(c, n)); else if (v && typeof v.type === 'string') walk(v, n); }
    if (fname) fnStack.pop();
  })(ast, null);
  // a module that is only ever used to createServer is a LOCAL listener, not an outbound door
  out.forEach(d => { if (d.kind === 'module') { const vars = Array.from(bound.entries()).filter(e => e[1] === d.mod).map(e => e[0]); const u = [].concat(...vars.map(v => uses.get(v) || [])); if (u.length && u.every(x => x === 'createServer')) d.kind = 'local'; } });
  out.requires = requires; return out;
}
const urls = src => Array.from(new Set((src.match(/https?:\/\/[A-Za-z0-9.-]+/g) || []).map(u => u.replace(/^https?:\/\//, '')))).sort();
const CORE = path.join(TREE, 'scripts/lib/core_pure.js');
const packed = stamp.listFiles(EXT, '', []).filter(f => f !== stamp.STAMP && /\.js$/.test(f));
const files = packed.map(f => path.join(EXT, f)).concat([CORE]);
const rel = f => f === CORE ? 'core_pure.js(repo scripts/lib)' : path.relative(EXT, f).split(path.sep).join('/');
const D = {}, S = {}; let parsed = 0; const unparsed = [];
files.forEach(f => { const src = fs.readFileSync(f, 'utf8'), d = doors(src); S[rel(f)] = src; if (d) { D[rel(f)] = d; parsed++; } else unparsed.push(rel(f)); });
const net = d => (d || []).filter(x => x.kind !== 'local');   // doors that can leave the machine (a local listener cannot)
// features (README table of the extension): their ENTRY module; the rest is traced through the requires
const UNDERSTAND = { 'references': 'lib/app_refs.js', 'field hover and F12': 'lib/app_surface_index.js', 'tag hover': 'lib/tag_index.js', 'value beside the code': 'lib/lens_index.js', 'purity warning': 'core_pure.js(repo scripts/lib)', 'context for a file': 'lib/file_context.js' };
const SHIP = { 'Fetch back': 'lib/ship.js', 'Deploy main now': 'lib/ship.js', 'memory of the pages': 'lib/heap_impact.js' };
const reach = entry => { const seen = new Set(), todo = [entry];
  while (todo.length) { const e = todo.pop(); if (seen.has(e)) continue; seen.add(e); const d = D[e]; if (!d) continue; (d.requires || []).filter(r => /^\./.test(r)).forEach(r => {
    let t = path.posix.normalize(path.posix.join(path.posix.dirname(e), r)); if (!/\.js$/.test(t)) t += '.js'; if (D[t]) todo.push(t); }); }
  return Array.from(seen); };
const L = m => console.log('§X0_OFFLINE ' + m);
let understandNet = 0; const traced = {};
for (const [feat, entry] of Object.entries(UNDERSTAND)) { const r = reach(entry), doorsHere = [].concat(...r.map(x => net(D[x]).map(y => x + ':' + y.line + ' ' + y.what + (y.fn ? ' in ' + y.fn + '()' : ''))));
  traced[feat] = { files: r, doors: doorsHere }; understandNet += doorsHere.length; L('feature="' + feat + '" entry=' + entry + ' reaches=' + r.length + ' files net_doors=' + doorsHere.length + (doorsHere.length ? ' ' + doorsHere.join(' | ') : '')); }
// the extension's own glue (extension.js) is shared by every feature: it must hold no outbound door either (or the attribution above would be wrong)
const glue = net(D['extension.js']); L('glue file=extension.js net_doors=' + glue.length + (glue.length ? ' ' + glue.map(x => x.line + ' ' + x.what).join(' | ') : ''));
let shipNet = 0; const shipDoors = {};
for (const [feat, entry] of Object.entries(SHIP)) { const r = reach(entry), ds = [].concat(...r.map(x => net(D[x]).map(y => x + ':' + y.line + ' ' + y.what + (y.fn ? ' in ' + y.fn + '()' : '')))); shipNet += ds.length; shipDoors[feat] = ds; L('feature="' + feat + '" (Run & Ship) entry=' + entry + ' net_doors=' + ds.length + ' ' + ds.join(' | ')); }
Object.keys(D).forEach(f => { const loc = (D[f] || []).filter(x => x.kind === 'local'); if (loc.length) L('local_listener file=' + f + ' ' + loc.map(x => x.line + ' ' + x.what).join(' | ') + ' (a server on 127.0.0.1 for the headless page run: it cannot leave the machine)'); });
const urlLits = {}; Object.keys(S).forEach(f => { const u = urls(S[f]); if (u.length) urlLits[f] = u; }); L('url_literals ' + JSON.stringify(urlLits));
// red control: the same scan on a copy with a planted fetch()
const planted = S['lib/tag_index.js'] + "\nfetch('http://example.invalid/leak');\n", red = doors(planted), before = net(D['lib/tag_index.js']).length;
const redSeen = !!red && red.some(x => x.kind === 'fetch') && net(red).length === before + 1;
L('red_control file=lib/tag_index.js planted=fetch() counted=' + (redSeen ? 'Y' : 'N') + ' doors_before=' + before + ' doors_after=' + (red ? net(red).length : 'unparsed'));
const blind = net(D['lib/ship.js']).length === 0;
const verdict = !files.length || unparsed.length ? 'INCONCLUSIVE' : (blind || !redSeen) ? 'INCONCLUSIVE' : (understandNet === 0 && glue.length === 0 ? 'PASS' : 'FAIL');
console.log('§X0_OFFLINE files=' + files.length + ' parsed=' + parsed + (unparsed.length ? ' unparsed=' + unparsed.join(',') : '') + ' understanding_features=' + Object.keys(UNDERSTAND).length + ' understanding_features_net=' + understandNet + ' ship_features=' + Object.keys(SHIP).length + ' ship_features_net=' + shipNet + ' glue_net=' + glue.length +
  ' red_control=' + (redSeen ? 'DETECTED' : 'MISSED') + ' scanner_blind=' + (blind ? 'Y' : 'N') + ' verdict=' + verdict + (blind ? ' reason="no door found in lib/ship.js, the scanner is blind"' : ''));
fs.mkdirSync(path.join(__dirname, 'out'), { recursive: true });
fs.writeFileSync(path.join(__dirname, 'out', 'offline.json'), JSON.stringify({ files: files.length, parsed, understanding: Object.keys(UNDERSTAND), understandNet, shipNet, ship: Object.keys(SHIP), shipDoors, glueNet: glue.length, redSeen, urlLits, traced, verdict }, null, 1));
process.exit(verdict === 'PASS' ? 0 : verdict === 'FAIL' ? 1 : 2);
