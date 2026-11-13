// ⚠ DO NOT REMOVE — film "A table of your own, in one line" (prompts/FILM_COMMAND_LINE_ERP.md, FOLLOW-UP FILM; this file is the first film's, unchanged but for this line): the silent picture, from the stills and their frame counts (out/cards/plan.json). A beat lasts its voice length (out/beatmin.json, or its `hold`);
// typing stills have fixed frame counts, the stills that show an answer share the rest of the beat equally. Everything is whole frames at 24 fps, so the cues are exact:
// §FILM_CUE beat=<id> t=<s>. The frame total is then MEASURED on the encoded file (ffprobe) and must equal the sum. READ out/record.log.
'use strict';
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
const N = require('./narr.js'), out = path.resolve(process.argv[2]), cards = path.resolve(process.argv[3]), min = JSON.parse(fs.readFileSync(process.argv[4], 'utf8')), plan = JSON.parse(fs.readFileSync(path.join(cards, 'plan.json'), 'utf8'));
fs.mkdirSync(out, { recursive: true }); const list = []; let total = 0, lastFile = null;
N.beats.forEach(b => {
  const len = b.hold || min[b.id]; if (!len) throw new Error('no length for beat ' + b.id);
  const st = plan[b.id], want = Math.round(len * 24), fixed = st.reduce((s, x) => s + (x.frames || 0), 0), flex = st.filter(x => x.frames == null).length, each = Math.floor((want - fixed) / flex);
  console.log('§FILM_CUE beat=' + b.id + ' t=' + (total / 24).toFixed(3) + ' frames=' + want + ' typing=' + fixed + ' answer_hold_frames=' + each + ' x' + flex + (each < 20 ? ' TIGHT' : ''));
  if (each < 8) throw new Error('beat ' + b.id + ' has no room for its answers (' + each + ' frames each)');
  let used = 0; st.forEach((x, i) => { const lastFlex = x.frames == null && st.slice(i + 1).every(y => y.frames != null); let f = x.frames == null ? each : x.frames; if (lastFlex) f = want - used - st.slice(i + 1).reduce((s, y) => s + y.frames, 0);
    used += f; list.push("file '" + path.join(cards, x.file) + "'\nduration " + (f / 24).toFixed(6)); lastFile = path.join(cards, x.file); });
  total += used;
});
fs.writeFileSync(path.join(out, 'list.txt'), list.join('\n') + "\nfile '" + lastFile + "'\n");
execFileSync('ffmpeg', ['-y', '-v', 'error', '-f', 'concat', '-safe', '0', '-i', path.join(out, 'list.txt'), '-vf', 'fps=24,format=yuv420p', '-frames:v', String(total), '-c:v', 'libx264', '-crf', '17', path.join(out, 'film_silent.mp4')], { maxBuffer: 1 << 26 });
const got = +execFileSync('ffprobe', ['-v', 'error', '-count_frames', '-select_streams', 'v:0', '-show_entries', 'stream=nb_read_frames', '-of', 'csv=p=0', path.join(out, 'film_silent.mp4')], { encoding: 'utf8' }).trim();
console.log('§FILM_DONE dur=' + (got / 24).toFixed(3) + ' frames=' + got + ' planned=' + total + (got === total ? '' : ' MISMATCH'));
if (got !== total) process.exit(1);
