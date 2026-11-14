# ⚠ DO NOT REMOVE — film "CLI in Action" (prompts/FILM_COMMAND_LINE_ERP.md, CH 0): the keyboard track. One synthesised key sound at each cue of out/rec/keys.json ('k' a typed character, 'r' the
# return key), nothing recorded and nothing downloaded: a short noise click plus a low thock, both decaying, from a fixed seed (the same track on every build). Check K: the sounds placed equal the cues,
# the track is as long as the film. Usage: python keys.py <keys.json> <film seconds> <out.wav>. READ THE LOG.
import json, sys, wave
import numpy as np
cues = json.load(open(sys.argv[1])); dur = float(sys.argv[2]); out = sys.argv[3]; SR = 48000
rng = np.random.default_rng(20261114); track = np.zeros(int(dur * SR) + SR // 2, dtype=np.float64)
def key(kind):
    n = int(SR * (0.085 if kind == 'r' else 0.055)); t = np.arange(n) / SR
    click = rng.standard_normal(n) * np.exp(-t / 0.0035); click = np.diff(click, prepend=0.0)          # the sharp part
    f = (95 if kind == 'r' else rng.uniform(150, 210)); thock = np.sin(2 * np.pi * f * t) * np.exp(-t / (0.022 if kind == 'r' else 0.012))
    g = (1.0 if kind == 'r' else rng.uniform(0.55, 0.9))
    return g * (0.55 * click / (np.abs(click).max() + 1e-9) + 0.75 * thock)
placed = {'k': 0, 'r': 0}
for c in cues:
    s = key(c['k']); i = int(c['t'] * SR)
    if i + len(s) <= len(track): track[i:i + len(s)] += s; placed[c['k']] += 1
track = track[:int(dur * SR)]; peak = float(np.abs(track).max()) or 1.0; track = track / peak * 0.5
w = wave.open(out, 'wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((track * 32767).astype('<i2').tobytes()); w.close()
want_k = sum(1 for c in cues if c['k'] == 'k'); want_r = sum(1 for c in cues if c['k'] == 'r')
ok = placed['k'] == want_k and placed['r'] == want_r and want_k > 0
print('§KEYS typed=%d of %d returns=%d of %d track_s=%.3f film_s=%.3f peak_before_scale=%.3f' % (placed['k'], want_k, placed['r'], want_r, len(track) / SR, dur, peak))
print('§KEYS_VERDICT ' + ('INCONCLUSIVE no cue' if want_k == 0 else ('PASS' if ok else 'FAIL')))
sys.exit(0 if ok else (2 if want_k == 0 else 1))
