// ⚠ DO NOT REMOVE — film "PDF and Excel are killer apps" PART 1, rc2 (prompts/FILM_KILLER_FRONT_DOOR.md, owner 2026-11-27: "yes, on Film 1 too"): the final "Prior art / credentials" card. EXTRACT ONLY: each line of the card is shown only if its source text is
// FOUND in a tracked file of this repo (and, for the paper, on its public page) at build time; nothing about the PDF / spreadsheet front door's own prior art (no search exists, so no novelty claim). Writes out/credits.json (lines + the exact source text found); a line whose
// source is not found is DROPPED and logged, never shown. INCONCLUSIVE (exit 2) if no line survives. Usage: node credits.js. READ out/credits.log.
'use strict';
const fs = require('fs'), path = require('path'), cp = require('child_process'), REPO = path.join(__dirname, '..', '..'), OD = process.env.OUTD || 'out';
const rd = (f) => fs.existsSync(path.join(REPO, f)) ? fs.readFileSync(path.join(REPO, f), 'utf8') : '', out = { lines: [], dropped: [] }, L = (m) => console.log('§CREDITS ' + m);
const add = (id, shown, file, re, url) => { const m = re.exec(rd(file)); if (!m) { out.dropped.push({ id, file, why: 'source text not found' }); L('DROP ' + id + ' source text not found in ' + file); return; }
  const o = { id, shown, source: file, found: m[0].replace(/\*\*/g, '').slice(0, 160) }; if (url) { const g = cp.spawnSync('curl', ['-s', '-L', '-w', '\n%{http_code}', url], { encoding: 'utf8', maxBuffer: 1 << 26 }), code = +g.stdout.trim().split('\n').pop(); o.url = url; o.http = code; o.pageHasText = re.test(g.stdout.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' '));
    if (code !== 200 || !o.pageHasText) { out.dropped.push({ id, file, why: 'public page ' + url + ' http=' + code + ' text=' + o.pageHasText }); L('DROP ' + id + ' public page ' + url + ' http=' + code + ' text_found=' + o.pageHasText); return; } }
  out.lines.push(o); L('LINE ' + id + ' shown="' + shown + '" source=' + file + ' found="' + o.found + '"' + (url ? ' public ' + url + ' http=' + o.http : '')); };
add('no_ai', 'No AI inside.', 'docs/USER_GUIDE.md', /There is no AI and no LLM in this app\./);
add('mit', 'Open source, MIT licence.', 'LICENSE', /^MIT License/m);
add('paper', 'Earlier work, dated: the Spatial Compilation paper, priority date ', 'docs/SpatialCompilationPaper.md', /Priority date: (\d{4}-\d{2}-\d{2})/, 'https://red1oon.github.io/BIMCompiler/SpatialCompilationPaper/');
const p = out.lines.find(x => x.id === 'paper'); if (p) { p.date = /(\d{4}-\d{2}-\d{2})/.exec(p.found)[1]; p.shown += p.date; p.link = 'red1oon.github.io/BIMCompiler/SpatialCompilationPaper/'; }
fs.mkdirSync(path.join(__dirname, OD), { recursive: true }); fs.writeFileSync(path.join(__dirname, OD, 'credits.json'), JSON.stringify(out, null, 1));
L('CREDITS_VERDICT ' + (out.lines.length ? 'PASS' : 'INCONCLUSIVE') + ' lines_shown=' + out.lines.length + ' dropped=' + out.dropped.length + (out.lines.length < 2 ? ' (fewer than two lines survived)' : '')); process.exit(out.lines.length ? 0 : 2);
