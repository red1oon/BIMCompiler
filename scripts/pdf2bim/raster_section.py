# Implementing PDF2BIM_VECTOR_PROBE.md §43.20 step 0 — heights from a section's GEOMETRY (its level-mark text is unreadable at 200 dpi)
# Usage: python3 -P raster_section.py <p2 workdir (page_clean.png via chains.json, views_label.npy, roof.json)> <view name> <depth_m READ> <pitch_deg READ> <ext_wall_m READ>
import sys, os, json, math
import numpy as np
from PIL import Image
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from raster_texture import texture_maps

def log(*a): print(*a, flush=True)
work, view, depth, pitch, extw = sys.argv[1], sys.argv[2], float(sys.argv[3]), float(sys.argv[4]), float(sys.argv[5])
C = json.load(open(os.path.join(work, 'chains.json'))); R = json.load(open(os.path.join(work, 'roof.json')))
L = np.load(os.path.join(work, 'views_label.npy')); lab = list(R['views']).index(view) + 1   # same order as raster_roof.py wrote the label map
ys, xs = np.where(L == lab); x0, y0, x1, y1 = xs.min(), ys.min(), xs.max(), ys.max()
g = np.asarray(Image.open(C['clean']).convert('L')).astype(int)[y0:y1 + 1, x0:x1 + 1]; ink = g < C['otsu']; inkg = g < 215
_, D1, D2 = texture_maps(inkg); DG = (D1 | D2).astype(float)
log(f"§SECT region {view} x={x0}..{x1} y={y0}..{y1}")
# (1) vertical hatched bands: per column, the longest vertical run of rows whose diagonal density (7-row window) is high
col = np.array([np.convolve(DG[:, c], np.ones(7) / 7, 'same') for c in range(DG.shape[1])]).T   # rows x cols
hot = (col >= 0.15)
def longest(v):
    d = np.diff(np.concatenate(([0], v.astype(np.int8), [0]))); st, en = np.where(d == 1)[0], np.where(d == -1)[0]
    return int((en - st).max()) if len(st) else 0
runlen = np.array([longest(hot[:, c]) for c in range(hot.shape[1])])
tall = runlen >= 0.25 * hot.shape[0]
bands = []; c = 0
while c < len(tall):
    if tall[c]:
        e = c
        while e + 1 < len(tall) and tall[e + 1]: e += 1
        bands.append((c, e)); c = e + 1
    else: c += 1
mb = []                                       # bands closer than 3 px are one wall (hatch strokes split it)
for b in bands:
    if mb and b[0] - mb[-1][1] <= 3: mb[-1] = (mb[-1][0], b[1])
    else: mb.append(b)
log(f"§SECT_BANDS merged hatched vertical bands (region cols) {mb}")
# §43.20 RESUME (a): the cut exterior walls = a PAIR of bands of equal width w whose outer-face span / w = depth / ext wall (READ ratio, scale-free)
want_r = depth / extw; best = None
for i in range(len(mb)):
    for j in range(i + 1, len(mb)):
        wa, wb = mb[i][1] - mb[i][0] + 1, mb[j][1] - mb[j][0] + 1; span = mb[j][1] - mb[i][0] + 1; w = (wa + wb) / 2
        if abs(wa - wb) > 2 or w < 5: continue
        err_px = abs(span - want_r * w)            # how far the span is from what this width predicts, in px
        if err_px <= want_r * 1.0 and (best is None or err_px < best[0]): best = (err_px, i, j, w, span)
if not best: sys.exit(log(f"§SECT verdict=VACUOUS (no equal-width band pair with span/width = {want_r:.2f} within 1 px of width)"))
_, i, j, w, span = best; lf, rf = mb[i][0], mb[j][1]; k = span / depth
log(f"§SECT_PAIR bands {mb[i]} + {mb[j]} width {w:.1f} px span {span} px ratio {span / w:.2f} vs READ {want_r:.2f} -> k = {k:.3f} px/m (wall {w / k:.3f} m)")
# (2) roof rise: highest ink row between the faces (apex) vs the row where the roof line crosses the outer face (eaves)
top = [np.where(ink[:, c])[0].min() if ink[:, c].any() else None for c in range(lf, rf + 1)]
apex = min(t for t in top if t is not None)
def first_ink(c): v = np.where(ink[:, c])[0]; return int(v.min()) if len(v) else None
eav = [first_ink(lf), first_ink(rf)]
rise_px = np.mean(eav) - apex; rise = rise_px / k; want = depth / 2 * math.tan(math.radians(pitch))
log(f"§SECT_RISE apex_row={apex} eaves_rows={eav} rise={rise_px:.1f} px = {rise:.3f} m vs READ pitch {pitch} deg over {depth} m: {want:.3f} m (d={(rise - want) * 1000:+.0f} mm, {(rise - want) * k:+.1f} px) verdict={'PASS' if abs(rise - want) * k <= 2 else 'FAIL'}")
# (3) long horizontal lines between the faces
rows = [r for r in range(ink.shape[0]) if longest(ink[r, lf:rf + 1]) >= 0.5 * (rf - lf)]
grp = []
for r in rows: (grp[-1].append(r) if grp and r - grp[-1][-1] <= 1 else grp.append([r]))
lines = [round(float(np.mean(q)), 1) for q in grp]
log(f"§SECT_LINES long horizontal lines (region row, z above the lowest in m): " + ' '.join(f"{r}:{(lines[-1] - r) / k:.3f}" for r in lines))
