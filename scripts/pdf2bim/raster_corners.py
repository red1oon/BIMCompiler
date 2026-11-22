# Implementing PDF2BIM_VECTOR_PROBE.md §43.11 — Witness: W-S13b (per-view scale from the building's corner walls)
# Usage: python3 -P raster_corners.py <workdir with views_label.npy + roof.json + chains.json + page_clean.png> > raster_corners.log
import sys, os, json
import numpy as np
from PIL import Image
def log(*a): print(*a, flush=True)
work = sys.argv[1]
C = json.load(open(os.path.join(work, 'chains.json'))); R = json.load(open(os.path.join(work, 'roof.json')))
g = np.asarray(Image.open(C['clean']).convert('L')).astype(int); ink = g < C['otsu']
VL = np.load(os.path.join(work, 'views_label.npy'))
names = list(R['views'].keys())
res = {}
for k, name in enumerate(names, 1):
    if not name.startswith('ANSICHT'): continue
    X0, Y0, X1, Y1 = R['views'][name]
    m = (VL[Y0:Y1 + 1, X0:X1 + 1] == k) & ink[Y0:Y1 + 1, X0:X1 + 1]
    # longest vertical run per column (1 px gaps bridged)
    run = np.zeros(m.shape[1], int); bot = np.zeros(m.shape[1], int)
    for x in range(m.shape[1]):
        c = m[:, x].copy(); c[1:-1] |= (m[:-2, x] & m[2:, x])
        d = np.diff(np.concatenate(([0], c.astype(np.int8), [0]))); st = np.where(d == 1)[0]; en = np.where(d == -1)[0]
        if len(st): i = int(np.argmax(en - st)); run[x] = en[i] - st[i]; bot[x] = en[i]
    top = run.max(); cand = np.where(run >= 0.6 * top)[0]
    # group adjacent columns into lines
    lines = []
    for x in cand:
        if lines and x - lines[-1][-1] <= 2: lines[-1].append(x)
        else: lines.append([x])
    L = [(int(np.mean(l)), int(run[l].max()), int(bot[l].max())) for l in lines]
    log(f"§RASTER_CORNERS {name} max_vertical_run_px={top} long_lines(x,run,bottom)={L}")
    if len(L) >= 2:
        res[name] = dict(left=L[0][0], right=L[-1][0], width_px=L[-1][0] - L[0][0], run=top)
json.dump(res, open(os.path.join(work, 'corners.json'), 'w'), indent=1)
