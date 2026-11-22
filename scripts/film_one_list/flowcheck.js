// ⚠ DO NOT REMOVE — film 5 (prompts/FILM_IMMERSIVE_SOFTWARE.md FILM 5; copied from film 4's SMOOTH FLOW F4/F5): timing checks on the FINISHED cut, read from the recorded picture (out/record.log §FILM_CUE), the fitted subtitles
// (out/work/fit/en.ass: the voice's real start and end per beat) and out/cards/plan.json. Prints §FLOW lines and §FLOW_VERDICT PASS|FAIL|INCONCLUSIVE. READ out/flow.log.
//  F4  a beat's progress-strip step is lit from the beat's first frame; the voice's first word comes at least 0.8 s after it (no typing) or 0.3 s after the Return key (typing).
//  F5  between two beats' voices there are at least 0.6 s of silence.
'use strict';
const fs = require('fs'), path = require('path'), OUT = process.argv[2] || 'out';
const rec = fs.readFileSync(path.join(OUT, 'record.log'), 'utf8'), plan = JSON.parse(fs.readFileSync(path.join(OUT, 'cards/plan.json'), 'utf8')), ass = fs.readFileSync(path.join(OUT, 'work/fit/en.ass'), 'utf8');
const cue = {}; (rec.match(/§FILM_CUE beat=\S+ t=[\d.]+/g) || []).forEach(l => { const m = /beat=(\S+) t=([\d.]+)/.exec(l); cue[m[1]] = +m[2]; });
const sec = (h, m, s) => +h * 3600 + +m * 60 + +s, voice = {};
ass.split('\n').forEach(l => { const m = /^Dialogue: \d+,(\d+):(\d+):([\d.]+),(\d+):(\d+):([\d.]+),[^,]*,(\S+?)#(\d+),/.exec(l); if (m) { const id = m[7], a = sec(m[1], m[2], m[3]), b = sec(m[4], m[5], m[6]); const v = voice[id] = voice[id] || { start: a, end: b }; v.start = Math.min(v.start, a); v.end = Math.max(v.end, b); } });
const ids = Object.keys(cue).filter(id => voice[id]); let bad = 0; const L = m => console.log('§FLOW ' + m);
if (!ids.length) { console.log('§FLOW_VERDICT INCONCLUSIVE no narrated beat judged'); process.exit(2); }
ids.forEach((id, i) => { const pl = plan[id] || [], lead = pl.reduce((s, e) => s + (e.frames || 0), 0) / 24, need = lead > 0 ? lead + 0.3 : 0.8, got = voice[id].start - cue[id], ok = got >= need - 0.02; if (!ok) bad++;
  L((ok ? 'OK   ' : 'FAIL ') + 'F4 beat=' + id + ' cue=' + cue[id].toFixed(2) + ' first word +' + got.toFixed(2) + ' s (needs ≥ ' + need.toFixed(2) + ': ' + (lead > 0 ? 'typing ' + lead.toFixed(2) + ' + 0.3' : 'strip lead 0.8') + ')');
  if (i > 0) { const p = ids[i - 1], gap = voice[id].start - voice[p].end, ok2 = gap >= 0.6; if (!ok2) bad++; L((ok2 ? 'OK   ' : 'FAIL ') + 'F5 ' + p + ' → ' + id + ' silence ' + gap.toFixed(2) + ' s (needs ≥ 0.6)'); } });
console.log('§FLOW_VERDICT ' + (bad ? 'FAIL ' + bad : 'PASS') + ' beats=' + ids.length); process.exit(bad ? 1 : 0);
