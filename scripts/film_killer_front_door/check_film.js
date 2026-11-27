// ⚠ DO NOT REMOVE — film "PDF and Excel are killer apps" PART 1: the numeric check of the finished file (§FILM). ffprobe duration / resolution / audio stream / total frames, and PER BEAT: its start and end second (from record.log §FILM_CUE) and the frame count
// MEASURED on the finished file in that window (> 0, and equal to the plan). INCONCLUSIVE if nothing was judged. Usage: node check_film.js <film.mp4> <out dir>. READ THE LOG.
'use strict';
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
const [mp4, od] = process.argv.slice(2), rec = fs.readFileSync(path.join(od, 'record.log'), 'utf8'), pr = (a) => execFileSync('ffprobe', a, { encoding: 'utf8', maxBuffer: 1 << 26 }).trim();
const cues = [...rec.matchAll(/§FILM_CUE beat=(\S+) t=([\d.]+) frames=(\d+)/g)].map(m => ({ id: m[1], t: +m[2], planned: +m[3] })), done = +/§FILM_DONE dur=([\d.]+)/.exec(rec)[1];
const v = JSON.parse(pr(['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height,r_frame_rate,nb_read_frames', '-count_frames', '-of', 'json', mp4])).streams[0], a = pr(['-v', 'error', '-select_streams', 'a:0', '-show_entries', 'stream=codec_name,channels,sample_rate,duration', '-of', 'csv=p=0', mp4]), dur = +pr(['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', mp4]);
let bad = 0, n = 0; console.log('§FILM_OUT file=' + mp4 + ' duration_s=' + dur.toFixed(3) + ' resolution=' + v.width + 'x' + v.height + ' fps=' + v.r_frame_rate + ' frames=' + v.nb_read_frames + ' audio=' + (a || 'NONE') + ' silent_picture_s=' + done);
if (!a) { bad++; console.log('§FILM FAIL no audio stream'); } if (v.width !== 1920 || v.height !== 1080) { bad++; console.log('§FILM FAIL resolution'); }
const pts = pr(['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'frame=pts_time', '-of', 'csv=p=0', mp4]).split('\n').map(Number);   // every frame's own time stamp, counted per beat window
cues.forEach((c, i) => { const end = i + 1 < cues.length ? cues[i + 1].t : done, got = pts.filter(t => t >= c.t - 0.0205 && t < end - 0.0205).length; n++;
  const ok = got > 0 && Math.abs(got - c.planned) <= 1; if (!ok) bad++; console.log('§FILM beat=' + c.id + ' start=' + c.t.toFixed(3) + ' end=' + end.toFixed(3) + ' planned_frames=' + c.planned + ' measured_frames=' + got + (ok ? '' : ' FAIL')); });
const total = cues.reduce((s, c) => s + c.planned, 0), okT = +v.nb_read_frames === total; if (!okT) bad++; console.log('§FILM total planned_frames=' + total + ' measured=' + v.nb_read_frames + (okT ? '' : ' FAIL'));
console.log('§FILM_VERDICT ' + (bad ? 'FAIL' : (n ? 'PASS' : 'INCONCLUSIVE')) + ' beats=' + n + ' bad=' + bad); process.exit(bad ? 1 : (n ? 0 : 2));
