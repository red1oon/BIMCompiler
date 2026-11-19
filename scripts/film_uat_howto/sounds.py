# ⚠ DO NOT REMOVE — film "UAT, hands on" (prompts/FILM_UAT_GUIDE.md §5): the KEY + CLICK track from work/sounds.json (k = a typed character, r = the return key, c = a pointer click).
# REAL recordings only: keys = eklee's presses (OpenGameArt 'Single Key Press Sounds', CC BY 3.0, cut by qubodup; ~/.local/share/film_narration/keys_eklee, credited);
# click = GNOME's click sound (/usr/share/sounds/gnome/default/alerts/click.ogg, gnome-control-center-data). Fixed seed: the same track every build.
# Check: every cue placed, the track as long as the film. usage: python sounds.py <sounds.json> <film seconds> <out.wav>. READ THE LOG.
import json, sys, wave, os, glob, subprocess
import numpy as np
cues = json.load(open(sys.argv[1])); dur = float(sys.argv[2]); out = sys.argv[3]; SR = 48000
def load(f, cut):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', f, '-ac', '1', '-ar', str(SR), '-t', str(cut), '-f', 'f32le', '-'], capture_output=True).stdout
    a = np.frombuffer(raw, dtype='<f4').astype(np.float64); n = int(0.01 * SR); a[-n:] *= np.linspace(1, 0, n); return a / (np.abs(a).max() or 1)
files = sorted(glob.glob(os.path.expanduser('~/.local/share/film_narration/keys_eklee/eklee-KeyPressMac0*.flac'))); CLICK = '/usr/share/sounds/gnome/default/alerts/click.ogg'
if len(files) != 7 or not os.path.exists(CLICK): print('§SOUNDS_FAIL samples missing (keys=%d click=%s): real recordings are required' % (len(files), os.path.exists(CLICK))); sys.exit(1)
TYPED = [load(f, 0.28) for f in files[:6]]; RET = load(files[6], 0.40); CL = load(CLICK, 0.39) * 0.8
rng = np.random.default_rng(20261119); track = np.zeros(int(dur * SR) + SR, dtype=np.float64); placed = {'k': 0, 'r': 0, 'c': 0}
for c in cues:
    i = int(c['t'] * SR)
    if c['k'] == 'c': s = CL; reps = c.get('n', 1)
    elif c['k'] == 'r': s = RET; reps = 1
    else: s = TYPED[int(rng.integers(0, 6))] * rng.uniform(0.6, 0.9); reps = 1
    for r in range(reps):
        j = i + int(r * 0.09 * SR)
        if 0 <= j and j + len(s) <= len(track): track[j:j + len(s)] += s
    if 0 <= i < len(track): placed[c['k']] += 1
track = track[:int(dur * SR)]; track = track / (np.abs(track).max() or 1) * 0.5
w = wave.open(out, 'wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((track * 32767).astype('<i2').tobytes()); w.close()
want = {k: sum(1 for c in cues if c['k'] == k) for k in 'krc'}; ok = placed == want and want['c'] > 0
print('§SOUNDS keys=%d/%d returns=%d/%d clicks=%d/%d track_s=%.3f film_s=%.3f' % (placed['k'], want['k'], placed['r'], want['r'], placed['c'], want['c'], len(track) / SR, dur))
print('§SOUNDS_VERDICT ' + ('PASS' if ok else 'FAIL')); sys.exit(0 if ok else 1)
