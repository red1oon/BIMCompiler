#!/usr/bin/env python3
# ⚠ DO NOT REMOVE — Scope: mux the fitted narration onto the silent film (adapted COPY of bim-compiler prompts/film_narration_mux.py; the shared script is not edited).
# Change vs the original: TWO-PASS loudnorm (pass 1 measures the mixed track, pass 2 applies the measured values, linear) so the integrated loudness lands on -16 LUFS.
# usage (from the fit dir): mux_news.py <tag> <silent.mp4> <out.mp4>     env FILM_SEC = film length.  Refuses to overwrite an existing output.
import sys, os, subprocess, json, re
tag, V, OUT = sys.argv[1:4]
if os.path.exists(OUT): sys.exit(f'§MUX_REFUSE exists {OUT}')
FILM = os.environ['FILM_SEC']
rows = [l.split('\t') for l in open(f'{tag}_plan.tsv').read().split('\n') if l]
cmd = ['ffmpeg', '-hide_banner', '-y']
for _, _, f in rows: cmd += ['-i', f.strip()]
fl = ';'.join(f'[{k}:a]adelay={int(round(float(a) * 1000))}:all=1[a{k}]' for k, (_, a, _) in enumerate(rows))
mix = ''.join(f'[a{k}]' for k in range(len(rows))) + f'amix=inputs={len(rows)}:normalize=0:duration=longest,apad'
r = subprocess.run(cmd + ['-filter_complex', f'{fl};{mix}[m]', '-map', '[m]', '-t', FILM, '-ar', '48000', '-c:a', 'pcm_s16le', f'{tag}_mix.wav'], capture_output=True, text=True)
if r.returncode: sys.exit('§MUX_FAIL mix ' + r.stderr[-800:])
p1 = subprocess.run(['ffmpeg', '-hide_banner', '-i', f'{tag}_mix.wav', '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json', '-f', 'null', '-'], capture_output=True, text=True)
m = json.loads(re.search(r'\{[^{}]*"input_i"[^{}]*\}', p1.stderr, re.S).group(0))
print('§LOUDNORM_PASS1 input_i=%s input_tp=%s input_lra=%s input_thresh=%s target_offset=%s' % (m['input_i'], m['input_tp'], m['input_lra'], m['input_thresh'], m['target_offset']))
ln = f"loudnorm=I=-16:TP=-1.5:LRA=11:measured_I={m['input_i']}:measured_LRA={m['input_lra']}:measured_TP={m['input_tp']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true"
r = subprocess.run(['ffmpeg', '-hide_banner', '-y', '-i', V, '-i', f'{tag}_mix.wav', '-filter_complex', f'[0:v]ass={tag}.ass[vout];[1:a]{ln}[aout]', '-map', '[vout]', '-map', '[aout]',
    '-c:v', 'libx264', '-crf', '17', '-preset', 'medium', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-t', FILM, OUT], capture_output=True, text=True)
open(f'{tag}_mux.log', 'w').write(r.stderr)
print(f'§MUX rc={r.returncode} clips={len(rows)} out={OUT}')
