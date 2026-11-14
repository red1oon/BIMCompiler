// ⚠ DO NOT REMOVE — film "CLI in Action" (prompts/FILM_COMMAND_LINE_ERP.md, CH 0; this file is the first film's, unchanged but for this line and the key cues): the narration TSV in the film6 fit format (id, start, end, source, short, detail "F: … | M: …"). READ THE LOG.
// node tsv.js measure <workDir>        every beat cue 0..999, to measure the voice
// node tsv.js build <workDir> <film.log>   cues from the recorded picture's §FILM_CUE lines
'use strict';
const fs = require('fs'), path = require('path'), N = require('./narr.js');
const [mode, a1, a2] = process.argv.slice(2), work = path.resolve(a1); fs.mkdirSync(work, { recursive: true });
const cues = {}; let endT = null;
if (mode === 'build') fs.readFileSync(a2, 'utf8').split('\n').forEach(l => { const m = /§FILM_CUE beat=(\S+) t=([\d.]+)/.exec(l); if (m) cues[m[1]] = +m[2]; const d = /§FILM_DONE dur=([\d.]+)/.exec(l); if (d) endT = +d[1]; });
const ix = N.beats.map(b => b.id), rows = N.beats.filter(b => b.text).map(b => { let s = 0, e = 999; if (mode === 'build') { s = cues[b.id] + 0.3; const nx = ix[ix.indexOf(b.id) + 1]; e = nx ? cues[nx] : endT; }
  return [b.id, s.toFixed(2), e.toFixed(2), 'narr.js ' + b.id + ((b.says || []).length ? ' facts ' + b.says.map(x => x[0]).join(',') : ' (no figures)'), b.text, b.text].join('\t'); });
fs.writeFileSync(path.join(work, 'narration_en.tsv'), rows.join('\n') + '\n'); console.log('§TSV mode=' + mode + ' narrated=' + rows.length + ' beats=' + N.beats.length + (mode === 'build' ? ' film_s=' + endT : ''));
