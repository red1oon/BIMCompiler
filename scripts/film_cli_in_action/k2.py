# ⚠ DO NOT REMOVE — film "CLI in Action" (prompts/FILM_COMMAND_LINE_ERP.md, CH 0), check K2 (no voice over the typing). Can say FAIL / INCONCLUSIVE.
# (a) cue: for every typed beat, the voice's first start (fit log `cue=`, and the first Dialogue `<id>#0` of the ASS) is not before the beat's return key ('r' in keys.json).
# (b) audio: on the finished file's inputs, the voice-only track is silent in each typing window (dB vs its level in the voice windows) and the key track's peak in the typing windows is printed against the voice level.
# Usage: python k2.py <out dir> <voice-only mp4> <mixed mp4> <ass> <tag>. READ THE LOG.
import json, re, subprocess, sys, os
import numpy as np
od, voice, mixed, ass = sys.argv[1:5]; SR = 16000
def pcm(f): return np.frombuffer(subprocess.run(['ffmpeg', '-v', 'error', '-i', f, '-ac', '1', '-ar', str(SR), '-f', 's16le', '-'], capture_output=True).stdout, dtype='<i2').astype(np.float64) / 32768
keys = json.load(open(os.path.join(od, 'rec/keys.json'))); rec = open(os.path.join(od, 'record.log')).read(); fit = open(os.path.join(od, 'fit.log')).read()
cue = {m[0]: float(m[1]) for m in re.findall(r'§FILM_CUE beat=(\S+) t=([\d.]+)', rec)}; order = list(cue); film = float(re.search(r'§FILM_DONE dur=([\d.]+)', rec).group(1))
vs = {m[0]: (float(m[1]), float(m[3])) for m in re.findall(r'§NARR_FIT (\S+) cue=([\d.]+) room=([\d.]+) dur=([\d.]+)', fit)}   # id -> (voice start, dur)
asst = {}
for l in open(ass, encoding='utf8'):
    m = re.match(r'Dialogue: \d+,(\d+):(\d+):([\d.]+),\S+,\S+,(\S+)#0,', l)
    if m and m.group(4) not in asst: asst[m.group(4)] = int(m.group(1)) * 3600 + int(m.group(2)) * 60 + float(m.group(3))
v, mx = pcm(voice), pcm(mixed); rms = lambda x: 20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-9); bad = 0; n = 0; rows = []
for i, b in enumerate(order):
    end = cue[order[i + 1]] if i + 1 < len(order) else film; kk = [k for k in keys if cue[b] <= k['t'] < end]
    if not kk or b not in vs: continue
    n += 1; ret = max(k['t'] for k in kk if k['k'] == 'r'); first = min(k['t'] for k in kk); s0, d = vs[b]; a0 = asst.get(b)
    ok = s0 >= ret and (a0 is None or a0 >= ret - 0.05)   # the ASS start carries its own rounding of 0.01 s
    tw = v[int(first * SR):int((ret + 0.1) * SR)]; vw = v[int(s0 * SR):int((s0 + d) * SR)]; kw = mx[int(first * SR):int((ret + 0.1) * SR)]
    vdb, tdb = rms(vw), rms(tw); gap = vdb - tdb; ok = ok and gap >= 30
    bad += 0 if ok else 1; rows.append((b, ret, s0, a0, tdb, vdb, 20 * np.log10(np.abs(kw).max() + 1e-9), rms(kw)))
    print('§K2 %s beat=%s return=%.2f voice_start=%.2f ass_start=%s | voice-only track in typing window %.1f dB vs in voice %.1f dB (gap %.1f) | mixed in typing: peak %.1f dBFS rms %.1f dB' % ('OK  ' if ok else 'FAIL', b, ret, s0, ('%.2f' % a0) if a0 is not None else '-', tdb, vdb, gap, rows[-1][6], rows[-1][7]))
if n: print('§K2_LEVEL keys (mixed, typing windows) mean rms %.1f dB, mean peak %.1f dBFS; voice mean rms %.1f dB -> keys are %.1f dB under the voice rms' % (np.mean([r[7] for r in rows]), np.mean([r[6] for r in rows]), np.mean([r[5] for r in rows]), np.mean([r[5] - r[7] for r in rows])))
audible = n and np.mean([r[6] for r in rows]) > -25; print('§K2_VERDICT ' + ('INCONCLUSIVE no typed beat judged' if not n else ('PASS' if not bad and audible else 'FAIL')) + ' beats=%d bad=%d audible=%s' % (n, bad, audible)); sys.exit(2 if not n else (0 if not bad and audible else 1))
