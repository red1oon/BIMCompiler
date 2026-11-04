// ⚠ DO NOT REMOVE — Scope: assemble the silent film of "uniCenta POS, reborn" from cards + recorded clips (prompts/POS_PLUGIN_LOCAL_FIRST.md §34). Each segment is encoded alone, its frames MEASURED (ffprobe -count_frames), and the cue of every beat is the measured start
// (3.6 s is not a whole number of frames: cues drift otherwise). A beat is held to at least its narration length (beatmin.json); a missing clip is a hole named in the log, never a silent skip. READ THE LOG: out/assemble.log.
// Usage: node assemble.js <outDir(out)> <beatmin.json>   -> out/film_silent.mp4 (or out/film_partial.mp4 when clips are missing), out/timeline.json
'use strict';
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process'), N = require('./narr.js');
const OUT = path.resolve(process.argv[2] || 'out'), MIN = JSON.parse(fs.readFileSync(process.argv[3], 'utf8')), FPS = 24, SLACK = +(process.env.SLACK || 2.0), W = path.join(OUT, 'asm'); fs.mkdirSync(W, { recursive: true });
const frames = f => +execFileSync('ffprobe', ['-v', 'error', '-count_frames', '-select_streams', 'v:0', '-show_entries', 'stream=nb_read_frames', '-of', 'csv=p=0', f]).toString().trim();
const ENC = ['-c:v', 'libx264', '-crf', '17', '-preset', 'medium', '-pix_fmt', 'yuv420p', '-r', String(FPS)], list = [], TL = []; let t = 0, holes = [];
for (const b of N.beats) {
  const seg = path.join(W, b.id + '.mp4'); let want = Math.max(b.hold || 0, MIN[b.id] || 0, 0.3);
  if (b.rec) { const clip = path.join(OUT, 'rec', 'seg_' + b.rec + '.mp4'); if (!fs.existsSync(clip)) { holes.push(b.id + '(' + b.rec + ')'); console.log('§ASM_HOLE ' + b.id + ' no clip ' + clip + (b.blocked ? ' (gate: ' + b.blocked + ')' : '')); continue; }
    const have = +execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', clip]).toString().trim(); const nxt = N.beats[N.beats.indexOf(b) + 1], target = want + ((nxt && /^ch/.test(nxt.card)) ? 1.0 : SLACK);
    // a real-pace clip longer than its narration + SLACK is time-lapsed (setpts) so the picture ends with the voice (PLAYBOOK C step 4: speech + 1-3 s); never slowed, padded only up to the narration
    const speed = have > target ? have / target : 1, pad = speed === 1 ? Math.max(0, want - have) : 0; const w0 = want; want = speed > 1 ? target : Math.max(want, have); console.log(`§ASM_SPEED ${b.id} clip=${have.toFixed(2)}s narration_want=${w0.toFixed(2)}s speed=x${speed.toFixed(2)}`);
    execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', clip, '-vf', `setpts=PTS/${speed.toFixed(4)},fps=${FPS},tpad=stop_mode=clone:stop_duration=${pad.toFixed(3)},scale=1920:1080,format=yuv420p`, ...ENC, seg]); }
  else if (b.cards.length > 1) { // stills cross-faded (xfade): the cards share the beat's length by W weights; each clip carries the fade overlap X, the chain is cut to `want` (§34.E EXPAND animation, no zoompan)
    const X = 0.8, K = b.cards.length, WT = (N.WEIGHTS && N.WEIGHTS[b.id]) || b.cards.map(() => 1), SW = WT.reduce((a, v) => a + v, 0), d = WT.map(v => want * v / SW), args = ['-v', 'error', '-y']; let fc = '', len = d[0] + X;
    b.cards.forEach((c, i) => args.push('-loop', '1', '-framerate', String(FPS), '-t', (d[i] + X).toFixed(3), '-i', path.join(OUT, 'cards', c + '.png')));
    b.cards.forEach((c, i) => { fc += `[${i}:v]scale=1920:1080,format=yuv420p,setsar=1[s${i}];`; });
    let prev = 's0'; for (let i = 1; i < K; i++) { const off = len - X; fc += `[${prev}][s${i}]xfade=transition=fade:duration=${X}:offset=${off.toFixed(3)}[x${i}];`; prev = 'x' + i; len += d[i]; }
    execFileSync('ffmpeg', [...args, '-filter_complex', fc.replace(/;$/, ''), '-map', '[' + prev + ']', '-t', want.toFixed(3), ...ENC, seg]); console.log(`§ASM_XFADE ${b.id} cards=${b.cards.join(',')} fade=${X}s parts=${d.map(v => v.toFixed(2)).join('/')}s`); }
  else { const png = path.join(OUT, 'cards', b.cards[0] + '.png'), ch = /^ch/.test(b.card), fade = ch ? `,fade=t=in:st=0:d=0.4,fade=t=out:st=${(want - 0.4).toFixed(3)}:d=0.4` : '';
    execFileSync('ffmpeg', ['-v', 'error', '-y', '-loop', '1', '-framerate', String(FPS), '-i', png, '-t', want.toFixed(3), '-vf', `scale=1920:1080,format=yuv420p${fade}`, ...ENC, '-tune', 'stillimage', seg]); }
  const n = frames(seg), s = t; t += n / FPS; TL.push({ id: b.id, start: +s.toFixed(3), end: +t.toFixed(3), frames: n, want: +want.toFixed(2) }); list.push(`file '${seg}'`);
  console.log(`§ASM_SEG ${b.id} start=${s.toFixed(3)} frames=${n} dur=${(n / FPS).toFixed(3)} want=${want.toFixed(2)}`);
}
const out = path.join(OUT, holes.length ? 'film_partial.mp4' : 'film_silent.mp4'); fs.writeFileSync(path.join(W, 'list.txt'), list.join('\n') + '\n');
execFileSync('ffmpeg', ['-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', path.join(W, 'list.txt'), '-c', 'copy', out]);
const total = frames(out), sum = TL.reduce((a, x) => a + x.frames, 0);
console.log(`§ASM_DONE ${path.basename(out)} frames=${total} sum_of_segments=${sum} ${total === sum ? 'FRAMES-MATCH' : 'FRAMES-DIFFER'} dur=${(total / FPS).toFixed(2)}s holes=${holes.length ? holes.join(',') : 'none'}`);
if (holes.length) console.log('§ASM_INCOMPLETE the film has holes; NOT a deliverable'); fs.writeFileSync(path.join(OUT, 'timeline.json'), JSON.stringify(TL, null, 1)); process.exit(total === sum ? 0 : 3);
