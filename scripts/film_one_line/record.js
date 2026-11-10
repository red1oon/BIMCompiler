// ⚠ DO NOT REMOVE — film "One line" (§24): the silent picture. Each beat's stills are held for the beat's length (speech + lead + tail, out/beatmin.json), the first still of a beat for 1.6 s
// (the line appears, then its answer), with 0.3 s fades. Prints §FILM_CUE beat=<id> t=<s> from the MEASURED segment lengths (ffprobe), never from arithmetic. READ out/record.log.
'use strict';
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
const N = require('./narr.js'), out = path.resolve(process.argv[2]), cards = path.resolve(process.argv[3]), min = JSON.parse(fs.readFileSync(process.argv[4], 'utf8')), plan = JSON.parse(fs.readFileSync(path.join(cards, 'plan.json'), 'utf8'));
fs.mkdirSync(out, { recursive: true }); const segs = []; let t = 0;
const dur = (f) => +execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f], { encoding: 'utf8' }).trim();
N.beats.forEach(b => {
  const len = b.hold || min[b.id]; if (!len) throw new Error('no length for beat ' + b.id);
  const stills = plan[b.id], first = stills.length > 1 ? 1.6 : len, rest = stills.length > 1 ? (len - 1.6) / (stills.length - 1) : 0;
  console.log('§FILM_CUE beat=' + b.id + ' t=' + t.toFixed(3) + ' len=' + len + ' stills=' + stills.length);
  stills.forEach((s, i) => { const d = i === 0 ? first : rest, f = path.join(out, 'seg_' + String(segs.length).padStart(2, '0') + '.mp4');
    execFileSync('ffmpeg', ['-y', '-v', 'error', '-loop', '1', '-t', d.toFixed(3), '-i', path.join(cards, s), '-vf', 'fade=t=in:st=0:d=0.3,format=yuv420p', '-r', '24', '-c:v', 'libx264', '-tune', 'stillimage', '-crf', '17', f]);
    const m = dur(f); segs.push(f); t += m; console.log('§FILM_SEG ' + path.basename(f) + ' still=' + s + ' asked=' + d.toFixed(3) + ' measured=' + m.toFixed(3)); });
});
fs.writeFileSync(path.join(out, 'list.txt'), segs.map(f => "file '" + f + "'").join('\n') + '\n');
execFileSync('ffmpeg', ['-y', '-v', 'error', '-f', 'concat', '-safe', '0', '-i', path.join(out, 'list.txt'), '-c', 'copy', path.join(out, 'film_silent.mp4')]);
console.log('§FILM_DONE dur=' + dur(path.join(out, 'film_silent.mp4')).toFixed(3) + ' segs=' + segs.length + ' sum=' + t.toFixed(3));
