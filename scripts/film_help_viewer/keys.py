# ⚠ DO NOT REMOVE — film "CLI in Action" (prompts/FILM_COMMAND_LINE_ERP.md, CH 0): the keyboard track. One synthesised key sound at each cue of out/rec/keys.json ('k' a typed character, 'r' the
# return key), real recorded presses chosen by a fixed seed (the same track on every build). Check K: the sounds placed equal the cues,
# the track is as long as the film. Usage: python keys.py <keys.json> <film seconds> <out.wav>. READ THE LOG.
import json, sys, wave, os
import numpy as np
cues = json.load(open(sys.argv[1])); dur = float(sys.argv[2]); out = sys.argv[3]; SR = 48000
import glob, subprocess
# REAL key sounds (the owner, 2026-11-14: "use real keyboard sounds"): eklee's recordings, single presses cut by qubodup, OpenGameArt 'Single Key Press Sounds', CC BY 3.0 (the film credits them).
# Not in the repo: the folder holds the FLACs and their license.txt (set KEY_SAMPLES to move it). Six presses for the typed characters, the seventh (a longer press) for the return key. No synthesis: a missing folder fails.
SAMP = os.path.expanduser(os.environ.get('KEY_SAMPLES', '~/.local/share/film_narration/keys_eklee'))
def load(f, cut):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', f, '-ac', '1', '-ar', '48000', '-t', str(cut), '-f', 'f32le', '-'], capture_output=True).stdout
    a = np.frombuffer(raw, dtype='<f4').astype(np.float64); n = int(0.01 * 48000); a[-n:] *= np.linspace(1, 0, n); return a
files = sorted(glob.glob(SAMP + '/eklee-KeyPressMac0*.flac'))
if len(files) != 7: print('§KEYS_FAIL the folder %s holds %d key samples, not 7 (real recordings are required; nothing is synthesised)' % (SAMP, len(files))); sys.exit(1)
TYPED = [load(f, 0.28) for f in files[:6]]; RET = load(files[6], 0.40)
rng = np.random.default_rng(20261114); track = np.zeros(int(dur * SR) + SR // 2, dtype=np.float64)
def key(kind):
    if kind == 'r': return RET
    return TYPED[int(rng.integers(0, 6))] * rng.uniform(0.7, 1.0)
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
