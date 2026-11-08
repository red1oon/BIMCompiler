#!/usr/bin/env python3
# ⚠ DO NOT REMOVE — Scope: MEASURE the burned captions. For every caption in <ass>, render its mid-time frame on black 1920x1080 with the same ffmpeg ass filter the mux uses, take the pixel
# bounding box of the text, and require it inside the dark band (y >= 930, y <= 1080) and inside the width. A caption that is not rendered at all prints INCONCLUSIVE (empty box), never OK.
# usage: sub_fit.py <ass> [band_top=930]
import sys, re, subprocess, io, numpy as np
from PIL import Image
ASS = sys.argv[1]; BAND = int(sys.argv[2]) if len(sys.argv) > 2 else 930
def sec(s): h, m, x = s.split(':'); return int(h) * 3600 + int(m) * 60 + float(x)
ev = []
for l in open(ASS):
    if l.startswith('Dialogue:'):
        f = l.rstrip('\n').split(',', 9); ev.append((sec(f[1]), sec(f[2]), f[3], f[9]))
tot = max(e[1] for e in ev) + 1
bad = 0; n = 0; worst_top = 9999; worst_l = 9999; worst_r = 0; maxh = 0
for st, en, style, text in ev:
    t = (st + en) / 2
    r = subprocess.run(['ffmpeg', '-v', 'error', '-f', 'lavfi', '-i', f'color=c=black:s=1920x1080:r=24:d={tot}', '-vf', f'ass={ASS}', '-ss', f'{t:.3f}', '-frames:v', '1', '-f', 'image2pipe', '-vcodec', 'png', '-'], capture_output=True)
    a = np.asarray(Image.open(io.BytesIO(r.stdout)).convert('L')); ys, xs = np.where(a > 60); n += 1
    if len(ys) == 0: print(f'§SUB_FIT t={t:.2f} INCONCLUSIVE nothing rendered "{text[:50]}"'); bad += 1; continue
    top, bot, l, rr = ys.min(), ys.max(), xs.min(), xs.max(); ok = top >= BAND and bot <= 1080 and l >= 20 and rr <= 1900
    worst_top = min(worst_top, top); worst_l = min(worst_l, l); worst_r = max(worst_r, rr); maxh = max(maxh, bot - top + 1)
    print(f'§SUB_FIT t={t:.2f} {style} bbox x={l}-{rr} y={top}-{bot} {"OK" if ok else "WRONG"} "{text[:50]}"')
    if not ok: bad += 1
print(f'§SUB_FIT_DONE captions={n} outside_band_or_width={bad} min_top={worst_top} (band starts {BAND}) min_left={worst_l} max_right={worst_r} tallest={maxh}px {"PASS" if bad == 0 and n else "FAIL"}')
sys.exit(1 if bad else 0)
