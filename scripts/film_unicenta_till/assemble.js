// ⚠ DO NOT REMOVE — Scope: assemble the silent film of "uniCenta POS, reborn" from cards + recorded clips (prompts/POS_PLUGIN_LOCAL_FIRST.md §34). Each segment is encoded alone, its frames MEASURED (ffprobe -count_frames), and the cue of every beat is the measured start
// (3.6 s is not a whole number of frames: cues drift otherwise). A beat is held to at least its narration length (beatmin.json); a missing clip is a hole named in the log, never a silent skip. READ THE LOG: out/assemble.log.
// Usage: node assemble.js <outDir(out)> <beatmin.json>   -> out/film_silent.mp4 (or out/film_partial.mp4 when clips are missing), out/timeline.json
'use strict';
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process'), N = require('./narr.js');
const OUT = path.resolve(process.argv[2] || 'out'), MIN = JSON.parse(fs.readFileSync(process.argv[3], 'utf8')), FPS = 24, W = path.join(OUT, 'asm'); fs.mkdirSync(W, { recursive: true });
const frames = f => +execFileSync('ffprobe', ['-v', 'error', '-count_frames', '-select_streams', 'v:0', '-show_entries', 'stream=nb_read_frames', '-of', 'csv=p=0', f]).toString().trim();
const ENC = ['-c:v', 'libx264', '-crf', '17', '-preset', 'medium', '-pix_fmt', 'yuv420p', '-r', String(FPS)], list = [], TL = []; let t = 0, holes = [];
for (const b of N.beats) {
  const seg = path.join(W, b.id + '.mp4'); let want = Math.max(b.hold || 0, MIN[b.id] || 0, 0.3);
  if (b.rec) { const clip = path.join(OUT, 'rec', 'seg_' + b.rec + '.mp4'); if (!fs.existsSync(clip)) { holes.push(b.id + '(' + b.rec + ')'); console.log('§ASM_HOLE ' + b.id + ' no clip ' + clip + (b.blocked ? ' (gate: ' + b.blocked + ')' : '')); continue; }
    const have = +execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', clip]).toString().trim(); const pad = Math.max(0, want - have);
    execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', clip, '-vf', `tpad=stop_mode=clone:stop_duration=${pad.toFixed(3)},fps=${FPS},scale=1920:1080,format=yuv420p`, ...ENC, seg]); }
  else { const png = path.join(OUT, 'cards', b.card + '.png'), ch = /^ch/.test(b.card), fade = ch ? `,fade=t=in:st=0:d=0.4,fade=t=out:st=${(want - 0.4).toFixed(3)}:d=0.4` : '';
    execFileSync('ffmpeg', ['-v', 'error', '-y', '-loop', '1', '-framerate', String(FPS), '-i', png, '-t', want.toFixed(3), '-vf', `scale=1920:1080,format=yuv420p${fade}`, ...ENC, '-tune', 'stillimage', seg]); }
  const n = frames(seg), s = t; t += n / FPS; TL.push({ id: b.id, start: +s.toFixed(3), end: +t.toFixed(3), frames: n, want: +want.toFixed(2) }); list.push(`file '${seg}'`);
  console.log(`§ASM_SEG ${b.id} start=${s.toFixed(3)} frames=${n} dur=${(n / FPS).toFixed(3)} want=${want.toFixed(2)}`);
}
const out = path.join(OUT, holes.length ? 'film_partial.mp4' : 'film_silent.mp4'); fs.writeFileSync(path.join(W, 'list.txt'), list.join('\n') + '\n');
execFileSync('ffmpeg', ['-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', path.join(W, 'list.txt'), '-c', 'copy', out]);
const total = frames(out), sum = TL.reduce((a, x) => a + x.frames, 0);
console.log(`§ASM_DONE ${path.basename(out)} frames=${total} sum_of_segments=${sum} ${total === sum ? 'FRAMES-MATCH' : 'FRAMES-DIFFER'} dur=${(total / FPS).toFixed(2)}s holes=${holes.length ? holes.join(',') : 'none'}`);
if (holes.length) console.log('§ASM_INCOMPLETE the film has holes; NOT a deliverable'); fs.writeFileSync(path.join(OUT, 'timeline.json'), JSON.stringify(TL, null, 1)); process.exit(total === sum ? 0 : 3);
