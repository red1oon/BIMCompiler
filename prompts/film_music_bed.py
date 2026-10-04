# ⚠ DO NOT REMOVE — Scope: the soft music bed under the Viewer trailer (FILM_NARRATION.md §8 MUSIC BED; red1 2026-10-04:
#   "Proceed with your soft music bed"). Synthesised here from plain maths — no samples, no library, no licence question.
#   A slow 4-chord ambient pad (Cmaj7 → Am7 → Fmaj7 → G6, 8 s each, 2 s cross-fades), detuned sines + a quiet octave-down
#   root; no drums, no melody. film_narration_mux.py ducks it under every spoken line (MUSIC_WAV). READ the §MUSIC lines.
# usage: film_music_bed.py <out.wav> <seconds>
import sys, wave, numpy as np
out, sec = sys.argv[1], float(sys.argv[2]); SR = 48000
N = lambda m: 440.0 * 2 ** ((m - 69) / 12)                          # MIDI note → Hz
CHORDS = [('Cmaj7', [48, 60, 64, 67, 71]), ('Am7', [45, 57, 60, 64, 67]), ('Fmaj7', [41, 57, 60, 64, 69]), ('G6', [43, 55, 59, 62, 64])]
SEG, XF = 8.0, 2.0
n = int(sec * SR); t = np.arange(n) / SR; L = np.zeros(n); R = np.zeros(n)
k = 0; start = 0.0
while start < sec:
    name, notes = CHORDS[k % len(CHORDS)]
    a, b = int(max(0, start - XF / 2) * SR), int(min(sec, start + SEG + XF / 2) * SR)
    if b <= a: break
    tt = t[a:b]; ln = b - a
    env = np.ones(ln); r = int(XF * SR)
    env[:min(r, ln)] = np.sin(np.linspace(0, np.pi / 2, min(r, ln))) ** 2; env[-min(r, ln):] *= np.cos(np.linspace(0, np.pi / 2, min(r, ln))) ** 2
    for i, m in enumerate(notes):
        f = N(m); g = 0.55 if i == 0 else 0.22                         # the octave-down root a little louder, the rest soft
        for det, side in ((-0.18, 'L'), (0.18, 'R')):                   # ±0.18 Hz detune = slow chorus, spread L/R
            ph = 2 * np.pi * (f + det) * tt + i
            w = np.sin(ph) + 0.12 * np.sin(2 * ph)                     # fundamental + a whisper of 2nd harmonic (warm, not buzzy)
            (L if side == 'L' else R)[a:b] += g * env * w
    k += 1; start += SEG
trem = 1 + 0.06 * np.sin(2 * np.pi * 0.11 * t)                        # very slow swell
L *= trem; R *= trem
fade = int(3 * SR); edge = np.ones(n); edge[:fade] = np.linspace(0, 1, fade); edge[-fade:] = np.linspace(1, 0, fade)
L *= edge; R *= edge
peak = max(np.abs(L).max(), np.abs(R).max()); L, R = L / peak * 0.5, R / peak * 0.5   # peak −6 dBFS; the mix sets the real level
pcm = (np.stack([L, R], 1) * 32767).astype(np.int16)
with wave.open(out, 'wb') as w: w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
rms = 20 * np.log10(np.sqrt(np.mean((pcm / 32767.0) ** 2)) + 1e-12)
print(f'§MUSIC out={out} sec={sec:.2f} chords={"→".join(c for c, _ in CHORDS)} seg={SEG}s xfade={XF}s cycles={k} peak=-6.0dBFS rms={rms:.1f}dBFS')
