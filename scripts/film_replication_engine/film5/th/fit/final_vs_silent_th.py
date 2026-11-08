#!/usr/bin/env python3
# ⚠ DO NOT REMOVE — Scope: the mux must not have touched the PICTURE: for every beat one frame near the end of the beat is decoded from the FINAL mp4 and from the SILENT mp4; the page area (y < 930, above the caption band) must be identical up to H.264 re-encode noise (mean abs diff per channel).
# Controls: the same frame against a different beat's frame must differ clearly (else the check is blind). usage: final_vs_silent_th.py <final.mp4> <silent.mp4> <plan.json>      Read the log: §FINAL_VS_SILENT.
import sys, json, subprocess, io
import numpy as np
from PIL import Image
FIN, SIL, PLAN = sys.argv[1:4]; plan = json.load(open(PLAN))
def frame(v, t):
    r = subprocess.run(['ffmpeg', '-v', 'error', '-ss', f'{t:.3f}', '-i', v, '-frames:v', '1', '-f', 'image2pipe', '-vcodec', 'png', '-'], capture_output=True)
    return np.asarray(Image.open(io.BytesIO(r.stdout)).convert('RGB')).astype(float)
worst = 0; bad = 0; fr = []
for b in plan['beats']:
    t = b['end'] - 0.6 if (b['end'] - b['start']) > 1.2 else (b['start'] + b['end']) / 2
    a = frame(FIN, t)[:930]; s = frame(SIL, t)[:930]; d = float(np.abs(a - s).mean()); worst = max(worst, d); ok = d < 1.5; bad += 0 if ok else 1; fr.append(s)
    print(f"§FINAL_VS_SILENT beat={b['id']} t={t:.2f} page_mean_abs_diff={d:.3f} {'OK' if ok else 'WRONG'}")
ctl = float(np.abs(frame(FIN, plan['beats'][1]['end'] - 0.6)[:930] - fr[3]).mean())
print(f"§FINAL_VS_SILENT_CONTROL final frame of beat 2 against the silent frame of beat 4: diff {ctl:.2f} {'detected (differs)' if ctl > 3 else 'NOT detected (blind) FAIL'}")
print(f"§FINAL_VS_SILENT_DONE beats={len(plan['beats'])} worst_page_mean_abs_diff={worst:.3f} {'PASS' if bad == 0 and ctl > 3 else 'FAIL'}")
sys.exit(0 if bad == 0 and ctl > 3 else 1)
