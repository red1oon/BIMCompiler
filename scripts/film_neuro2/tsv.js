// ⚠ DO NOT REMOVE — Scope: narration TSV + plan.json for "CLI for OOTB Kernel Trilogy, Part II" (§16), the film6 fit format (id, start, end, source, short, detail
// "F: … | M: …"). Text = narr.js (storyboard verbatim, facts substituted). Silent beats are not voiced. READ THE LOG.
// Usage: node tsv.js measure <workDir> | node tsv.js build <workDir> <film.log> | node tsv.js holds <beatmin.json>
'use strict';
const fs = require('fs'), path = require('path'), N = require('./narr.js');
const [mode, a1, a2] = process.argv.slice(2);
if (mode === 'holds') { const m = JSON.parse(fs.readFileSync(a1, 'utf8')); N.beats.filter(b => b.hold).forEach(b => { m[b.id] = b.hold; }); fs.writeFileSync(a1, JSON.stringify(m, null, 1));
  const miss = N.beats.filter(b => m[b.id] === undefined).map(b => b.id); console.log('§HOLDS ' + N.beats.filter(b => b.hold).map(b => b.id + '=' + b.hold).join(' ') + ' missing=' + (miss.join(',') || 0)); process.exit(miss.length ? 1 : 0); }
const work = path.resolve(a1); fs.mkdirSync(work, { recursive: true });
const cues = {}; let endT = null;
if (mode === 'build') { fs.readFileSync(a2, 'utf8').split('\n').forEach(l => { const m = /§FILM_CUE beat=(\S+) t=([\d.]+)/.exec(l); if (m) cues[m[1]] = +m[2]; const d = /§FILM_DONE .* dur=([\d.]+)s/.exec(l); if (d) endT = +d[1]; });
  if (endT == null || N.beats.some(b => cues[b.id] === undefined)) throw new Error('film.log lacks a cue or §FILM_DONE'); }
const ix = N.beats.map(b => b.id), rows = N.beats.filter(b => b.text).map(b => { let s = 0, e = 999; if (mode === 'build') { s = cues[b.id]; const nx = ix[ix.indexOf(b.id) + 1]; e = nx ? cues[nx] : endT; }
  const det = b.text.replace(/\s+/g, ' ').trim().split(' | ').map(pieces).reduce((a, x) => a.concat(x), []).join(' | ');
  return [b.id, s.toFixed(2), e.toFixed(2), 'script_en.md ' + b.id + (b.facts.length ? ' facts ' + b.facts.join(',') : ' (no figures)'), det, det].join('\t'); });
// Captions at most two lines (rc1 defect: 3-4 line captions rose over each card's source line). A turn "F: …" is cut at sentence ends into
// pieces of at most CAP_MAX characters (default 100), each voiced by the same speaker; a sentence longer than that stays whole and is logged.
function pieces(turn) { const sp = turn.slice(0, 2), t = turn.slice(2).trim(), MAX = +(process.env.CAP_MAX || 100), out = [];
  (t.match(/[^.?!]+[.?!]+(?=\s|$)|[^.?!]+$/g) || [t]).map(x => x.trim()).filter(Boolean).forEach(sen => { const last = out.length ? out[out.length - 1] : null;
    if (last !== null && (last + ' ' + sen).length <= MAX) out[out.length - 1] = last + ' ' + sen; else out.push(sen); });
  out.filter(x => x.length > MAX).forEach(x => console.log('§CAP_LONG ' + x.length + ' chars: ' + x));
  return out.map(x => sp + ' ' + x); }
fs.writeFileSync(path.join(work, 'narration_en.tsv'), rows.join('\n') + '\n');
fs.writeFileSync(path.join(work, 'plan.json'), JSON.stringify({ beats: N.beats.map(b => ({ id: b.id, card: b.card })) }, null, 1));
console.log('§TSV mode=' + mode + ' narrated=' + rows.length + ' beats=' + N.beats.length + (mode === 'build' ? ' film_s=' + endT : ''));
