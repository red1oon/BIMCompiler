// # ⚠ DO NOT REMOVE — SCOPE: the film "Editing Real Code" (§F.9 Part 2). Finds the REAL places the film visits, from the repo's own
// index and specs, and prints them as one JSON line. No place is typed by hand. Usage: node plan.js <bim-ootb checkout> <out dir>
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(process.argv[2]), OUT = path.resolve(process.argv[3]);
const S = require(path.join(ROOT, 'devtools/vscode/x0-navigator/lib/app_surface_index'));
const T = require(path.join(ROOT, 'devtools/vscode/x0-navigator/lib/tag_index'));
const index = S.loadSurface(ROOT);
const G = 'AP' + 'P', SEC = '§';
function findRead(pred) {
  const dir = path.join(ROOT, 'viewer');
  for (const f of fs.readdirSync(dir).filter(n => n.endsWith('.js')).sort()) {
    const lines = fs.readFileSync(path.join(dir, f), 'utf8').split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (/^\s*(\/\/|\*)/.test(lines[i])) continue;
      const re = new RegExp('(?<![\\w$.])' + G + '\\.([A-Za-z_$][\\w$]*)', 'g'); let m;
      while ((m = re.exec(lines[i]))) { const fld = index.fields.get(m[1]); if (fld && pred(fld)) return { field: m[1], file: path.join(dir, f), line: i + 1, col: m.index + G.length + 2 }; }
    }
  }
  return null;
}
const def = findRead(f => !f.phantom && f.as === 'A' && S.resolve(index, f.name).kind === 'definition');
const phantom = findRead(f => f.phantom && !f.untied);   // a phantom the index flags "untied write" is not a clean example (bim-ootb #2974)
const want = S.resolve(index, def.field);
// A call of a function declared in the same file: VS Code's own JavaScript support resolves that by itself, so the film can
// wait until it is READY before showing that it finds nothing for the field.
function findProbe(file) {
  const lines = fs.readFileSync(file, 'utf8').split('\n');
  for (let i = 0; i < lines.length; i++) {
    const m = /^\s*function\s+([A-Za-z_$][\w$]{3,})\s*\(/.exec(lines[i]);
    if (!m) continue;
    for (let j = 0; j < lines.length; j++) {
      if (j === i || /^\s*(\/\/|\*)/.test(lines[j])) continue;
      const k = lines[j].search(new RegExp('(?<![\\w$.])' + m[1] + '\\s*\\('));
      if (k >= 0) return { file, line: j + 1, col: k + 1, name: m[1] };
    }
  }
  return null;
}
const probe = findProbe(def.file);
const KNOWN = SEC + 'HOSTED_BEFORE_HOST';
const pr = (T.buildPrinterIndex(ROOT).tags.get(KNOWN) || []).find(x => x.rank === 0);
const tagText = fs.readFileSync(pr.abs, 'utf8').split('\n')[pr.line - 1];
// §F.12 shots: a page script (for the cost note) and the line of the repo's own index generator that prints its summary tag
const sceneFile = path.join(ROOT, 'viewer', 'scene.js');
const LENS_TAG = SEC + 'APP_SURFACE';
const lp = (T.buildPrinterIndex(ROOT).tags.get(LENS_TAG) || []).find(x => x.rank === 0 && x.file === 'scripts/gen_app_surface.js');
const scratch = path.join(OUT, 'scratch.js');
const l1 = 'var value = ' + G + '.notARealField;', l2 = "console.log('" + SEC + "NOT_A_REAL_TAG done');";
fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(scratch, [l1, l2, ''].join('\n'));
// what a text search for "<god object>.<field> =" finds in viewer/: counted here with node, shown by VS Code's own search in the film
const q = G + '.' + def.field + ' =';
let hits = 0; const hitFiles = new Set();
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) { if (e.name !== 'lib' && e.name !== 'node_modules') walk(p); continue; }
    if (!/\.(js|mjs|html)$/.test(e.name)) continue;
    for (const l of fs.readFileSync(p, 'utf8').split('\n')) if (l.includes(q)) { hits++; hitFiles.add(path.relative(ROOT, p)); }
  }
})(path.join(ROOT, 'viewer'));
const hitList = Array.from(hitFiles).sort();
const hitsInTests = hitList.every(f => /(^|\/)tests?\//.test(f));
console.log(JSON.stringify({ root: ROOT, def, phantom, probe, sceneFile, lens: lp ? { file: lp.abs, line: lp.line, tag: LENS_TAG } : null, write: { file: path.join(ROOT, want.file), line: want.line, writes: want.writes, reads: want.reads },
  tag: { name: KNOWN, file: pr.abs, line: pr.line, col: tagText.indexOf(KNOWN) + 3 }, scratch, scratchFieldCol: l1.indexOf('notARealField') + 2,
  scratchTagCol: l2.indexOf(SEC) + 3, searchQuery: q, searchHits: hits, searchFiles: hitList, searchAllInTests: hitsInTests, witness: path.join(ROOT, 'devtools/vscode/x0-navigator/tests/witness_x0_appdef.js'),
  index: { fields: index.fields.size, phantoms: index.phantoms } }));
