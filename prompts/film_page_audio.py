# ⚠ DO NOT REMOVE — Scope: FILM_NARRATION.md §8 — the page's own audio (V construction sounds) recorded from a private
# PulseAudio sink during the take, aligned to the FILM timeline: same start (screencast T0) and the same §FILM_CUT spans
# removed, so a knock lands on the frame that made it. Read the log after every run (§PAGE_AUDIO lines).
# usage: film_page_audio.py <recorder log> <page_audio.wav> <film_sec> <out.wav>
import sys, re, subprocess
log, wav, film, out = sys.argv[1], sys.argv[2], float(sys.argv[3]), sys.argv[4]
t = open(log).read()
rs = re.search(r'§FILM_AUDIO sink=\S+ module=\S+ recStart=([\d.]+)', t); t0 = re.search(r'§FILM_AUDIO T0=([\d.]+)', t)
if not (rs and t0): sys.exit('§PAGE_AUDIO FAIL no recStart/T0 in log')
a0, T0 = float(rs.group(1)), float(t0.group(1))
starts = [float(x) for x in re.findall(r'§FILM_CUT start t=\S+ wall=([\d.]+)', t)]
ends = [float(x) for x in re.findall(r'§FILM_CUT end wall=([\d.]+)', t)]
spans, w = [], T0                      # keep [w, cutStart) for each cut, then [lastEnd, T0+film+cuts)
for s0, e0 in zip(starts, ends): spans.append((w, s0)); w = e0
spans.append((w, w + (film - sum(b - a for a, b in spans))))
parts, labels = [], []
for i, (a, b) in enumerate(spans):
    parts.append(f'[0:a]atrim=start={max(0, a - a0):.3f}:end={max(0, b - a0):.3f},asetpts=PTS-STARTPTS[p{i}]'); labels.append(f'[p{i}]')
fc = ';'.join(parts) + ';' + ''.join(labels) + f'concat=n={len(labels)}:v=0:a=1[out]'
r = subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', wav, '-filter_complex', fc, '-map', '[out]', '-ar', '48000', '-ac', '2', out], capture_output=True, text=True)
kept = sum(b - a for a, b in spans)
print(f'§PAGE_AUDIO rc={r.returncode} offset={T0 - a0:.3f} cuts={len(starts)} spans={len(spans)} kept={kept:.2f}s film={film:.2f}s {r.stderr[-200:].strip()}')
