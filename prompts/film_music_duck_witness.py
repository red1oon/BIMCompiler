# ⚠ DO NOT REMOVE — witness for FILM_NARRATION.md §8 MUSIC BED item 3. ISSUE: "does the music bed get out of the way of the voices?"
#   Reads the ducked bed stem (MUSIC_STEM from film_narration_mux.py) and the plan (id, start, clip): RMS of the bed inside spoken
#   intervals vs in the gaps (≥ 1 s, away from speech by 0.7 s release). PASS needs ≥ 6 dB difference; no gaps or no speech judged
#   → INCONCLUSIVE. Exit code is not evidence — read the §MUSIC_DUCK line.
# usage: film_music_duck_witness.py <final_plan.tsv> <music_stem.wav>
import sys, wave, subprocess, numpy as np
plan, stem = sys.argv[1], sys.argv[2]
w = wave.open(stem); sr = w.getframerate(); ch = w.getnchannels()
x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float64).reshape(-1, ch).mean(1) / 32768
dur = len(x) / sr
spk = []
for l in open(plan).read().split('\n'):
    if not l.strip(): continue
    _, a, f = l.split('\t'); d = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f.strip()], capture_output=True, text=True).stdout or 0)
    spk.append((float(a), float(a) + d))
inside = np.zeros(len(x), bool)
for a, b in spk: inside[int(a * sr):int(b * sr)] = True
near = np.zeros(len(x), bool)
for a, b in spk: near[max(0, int((a - 0.1) * sr)):int((b + 0.7) * sr)] = True
gap = ~near; gap[:int(3 * sr)] = False; gap[-int(3 * sr):] = False          # the 3 s fades are not gaps
db = lambda m: 20 * np.log10(np.sqrt(np.mean(x[m] ** 2)) + 1e-12) if m.sum() else None
di, dg = db(inside), db(gap)
if di is None or dg is None or gap.sum() < sr: print(f'§MUSIC_DUCK INCONCLUSIVE speech={inside.sum()/sr:.1f}s gaps={gap.sum()/sr:.1f}s'); sys.exit(2)
v = 'PASS' if dg - di >= 6 else 'WRONG'
print(f'§MUSIC_DUCK under_speech={di:.1f}dBFS in_gaps={dg:.1f}dBFS duck={dg-di:.1f}dB speech={inside.sum()/sr:.1f}s gaps={gap.sum()/sr:.1f}s film={dur:.1f}s verdict={v}')
sys.exit(0 if v == 'PASS' else 1)
