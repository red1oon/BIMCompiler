#!/usr/bin/env python3
# ⚠ DO NOT REMOVE — Scope: numbers for the finished film, read from the FILE (not from the plan): onset of the first speech after every cue vs the recorder's §FILM_CUE time.
# usage: film_check.py <final.mp4> <news_en_v3.tsv>        prints §CUE_ONSET per beat and §CUE_ONSET_DONE max_abs
import sys, subprocess, numpy as np
V, TSV = sys.argv[1:3]
r = subprocess.run(['ffmpeg', '-v', 'error', '-i', V, '-vn', '-ac', '1', '-ar', '16000', '-f', 's16le', '-'], capture_output=True)
a = np.frombuffer(r.stdout, np.int16).astype(np.float32) / 32768; SR = 16000
win = int(0.02 * SR); n = len(a) // win; rms = np.sqrt((a[:n * win].reshape(n, win) ** 2).mean(axis=1))
thr = 0.004                                                          # about -48 dBFS; the voices after loudnorm are around -20 dBFS RMS in speech
rows = [l.rstrip('\n').split('\t') for l in open(TSV)]
worst = 0; bad = 0
for i, row in enumerate(rows):
    bid, cue = row[0], float(row[1]); nxt = float(rows[i + 1][1]) if i + 1 < len(rows) else cue + 8
    lo = int(max(0, cue - 0.2) / 0.02); hi = int(min(nxt, cue + 3) / 0.02)
    idx = np.where(rms[lo:hi] > thr)[0]
    if len(idx) == 0: print(f'§CUE_ONSET {bid} cue={cue:.2f} INCONCLUSIVE no speech found in {cue-0.2:.1f}..{min(nxt, cue+3):.1f}'); bad += 1; continue
    on = (lo + idx[0]) * 0.02; d = on - cue; worst = max(worst, abs(d))
    print(f'§CUE_ONSET {bid} cue={cue:.2f} speech_onset={on:.2f} diff={d:+.2f}s {"OK" if abs(d) <= 1.0 else "WRONG"}')
    if abs(d) > 1.0: bad += 1
print(f'§CUE_ONSET_DONE beats={len(rows)} max_abs={worst:.2f}s limit=1.00s {"PASS" if bad == 0 else "FAIL"}')
