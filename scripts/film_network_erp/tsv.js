// ⚠ DO NOT REMOVE — Scope: narration TSV + plan.json for "Network ERP without an Apps and Database server!" (TEAMWORK §45.15), the film6 fit format
// (id, start, end, source, short, detail "M: …"). Text = narr.js (storyboard verbatim, facts substituted). Silent beats (title, end) are not voiced.
// Usage: node tsv.js measure <workDir>                 cue 0 / end 999 (to measure each line's spoken length)
//        node tsv.js build <workDir> <film.log>        cues from the recorded §FILM_CUE lines
//        node tsv.js holds <beatmin.json>              adds the fixed holds of the silent beats to beatmin.json
'use strict';
const fs = require('fs'), path = require('path'), N = require('./narr.js');
const [mode, a1, a2] = process.argv.slice(2);
if (mode === 'holds') { const m = JSON.parse(fs.readFileSync(a1, 'utf8')); N.beats.filter(b => b.hold).forEach(b => { m[b.id] = b.hold; }); fs.writeFileSync(a1, JSON.stringify(m, null, 1)); console.log('§HOLDS ' + N.beats.filter(b => b.hold).map(b => b.id + '=' + b.hold).join(' ') + ' missing=' + N.beats.filter(b => m[b.id] === undefined).map(b => b.id).join(',')); process.exit(N.beats.some(b => m[b.id] === undefined) ? 1 : 0); }
const work = path.resolve(a1); fs.mkdirSync(work, { recursive: true });
const cues = {}; let endT = null;
if (mode === 'build') { fs.readFileSync(a2, 'utf8').split('\n').forEach(l => { const m = /§FILM_CUE beat=(\S+) t=([\d.]+)/.exec(l); if (m) cues[m[1]] = +m[2]; const d = /§FILM_DONE .* dur=([\d.]+)s/.exec(l); if (d) endT = +d[1]; });
  if (endT == null || N.beats.some(b => cues[b.id] === undefined)) throw new Error('film.log lacks a cue or §FILM_DONE'); }
const ix = N.beats.map(b => b.id), rows = N.beats.filter(b => b.text).map(b => { let s = 0, e = 999; if (mode === 'build') { s = cues[b.id]; const nx = ix[ix.indexOf(b.id) + 1]; e = nx ? cues[nx] : endT; }
  const t = b.text.replace(/\s+/g, ' ').trim(); return [b.id, s.toFixed(2), e.toFixed(2), 'script_en.md ' + b.id + (b.facts.length ? ' facts ' + b.facts.join(',') : ' (no figures)'), 'M: ' + t, 'M: ' + t].join('\t'); });
fs.writeFileSync(path.join(work, 'narration_en.tsv'), rows.join('\n') + '\n');
fs.writeFileSync(path.join(work, 'plan.json'), JSON.stringify({ beats: N.beats.map(b => ({ id: b.id, card: b.card })) }, null, 1));
console.log('§TSV mode=' + mode + ' narrated=' + rows.length + ' beats=' + N.beats.length + (mode === 'build' ? ' film_s=' + endT : ''));
