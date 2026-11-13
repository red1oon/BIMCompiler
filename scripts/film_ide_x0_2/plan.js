// # ⚠ DO NOT REMOVE — SCOPE: the film "Editing Real Code 2" (prompts/CODE_ARCHITECTURE_DESIGN.md §F.18). Finds the REAL places
// the film visits by comparing the repo's own index at two commits (before and after bim-ootb #2974), and prints one JSON line.
// No place and no number is typed by hand. Usage: node plan.js <bim-ootb at the OLD commit> <bim-ootb at the NEW commit> <out dir>
'use strict';
const fs = require('fs'), path = require('path');
const OLD = path.resolve(process.argv[2]), NEW = path.resolve(process.argv[3]), OUT = path.resolve(process.argv[4]);
const lib = (root, m) => require(path.join(root, 'devtools/vscode/x0-navigator/lib', m));
const So = lib(OLD, 'app_surface_index'), Sn = lib(NEW, 'app_surface_index'), T = lib(NEW, 'tag_index');
const io = So.loadSurface(OLD), inw = Sn.loadSurface(NEW);
const G = 'AP' + 'P', SEC = '§';
const names = m => [...m.fields.values()];
const oldPh = names(io).filter(f => f.phantom).map(f => f.name);
const newPh = new Set(names(inw).filter(f => f.phantom).map(f => f.name));
const revived = oldPh.filter(n => inw.fields.has(n) && !newPh.has(n) && Sn.resolve(inw, n).kind === 'definition');
const untied = names(inw).filter(f => f.untied).map(f => f.name);
// the first production line under viewer/ that READS a field matching `pred` under the long name (so the hover applies)
function findRead(root, pred) {
  const files = [];
  (function walk(d) {
    for (const e of fs.readdirSync(d, { withFileTypes: true }).sort((a, b) => (a.name < b.name ? -1 : 1))) {
      if (e.isDirectory()) { if (!/^(tests?|lib|node_modules)$/.test(e.name)) walk(path.join(d, e.name)); }
      else if (e.name.endsWith('.js')) files.push(path.join(d, e.name));
    }
  })(path.join(root, 'viewer'));
  for (const f of files) {
    const lines = fs.readFileSync(f, 'utf8').split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (/^\s*(\/\/|\*)/.test(lines[i])) continue;
      const re = new RegExp('(?<![\\w$.])((?:window\\.)?' + G + '\\.)([A-Za-z_$][\\w$]*)', 'g'); let m;
      while ((m = re.exec(lines[i]))) if (pred(m[2], path.relative(root, f), i + 1, lines[i])) return { field: m[2], rel: path.relative(root, f), line: i + 1, col: m.index + m[1].length + 1 };
    }
  }
  return null;
}
const sameLine = (rel, line, text) => { try { return fs.readFileSync(path.join(NEW, rel), 'utf8').split('\n')[line - 1] === text; } catch (e) { return false; } };
const rv = new Set(revived);
// said dead at OLD, alive at NEW, the same line in both. A public name first (no leading underscore): it reads better aloud.
const deadPred = pub => (n, rel, line, text) => rv.has(n) && (!pub || !n.startsWith('_')) && sameLine(rel, line, text);
const dead = findRead(OLD, deadPred(true)) || findRead(OLD, deadPred(false));
const un = new Set(untied);
const unsure = findRead(NEW, n => un.has(n));
const deadNow = dead ? Sn.resolve(inw, dead.field) : null;
const LENS_TAG = SEC + 'APP_SURFACE';
const lp = (T.buildPrinterIndex(NEW).tags.get(LENS_TAG) || []).find(x => x.rank === 0 && x.file === 'scripts/gen_app_surface.js');
if (!dead || !unsure || !deadNow || !lp) { console.error('plan: a place was not found dead=' + !!dead + ' unsure=' + !!unsure + ' lens=' + !!lp); process.exit(1); }
const u = inw.fields.get(unsure.field).untied;
fs.mkdirSync(OUT, { recursive: true });
console.log(JSON.stringify({ old: OLD, neu: NEW, dead, deadNow: { file: deadNow.file, line: deadNow.line }, unsure, unsureSite: u,
  contextRel: deadNow.file, lens: { rel: lp.file, line: lp.line, tag: LENS_TAG },
  counts: { old_phantom: oldPh.length, new_phantom: newPh.size, revived: revived.length, untied: untied.length, new_fields: inw.fields.size } }));
