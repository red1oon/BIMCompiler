# ⚠ DO NOT REMOVE — PDF2BIM_VECTOR_PROBE.md §59.3: the roof eave overhang traced from the section's roof line. Read the log after every run (§EAVE lines).
# Implementing PDF2BIM_VECTOR_PROBE.md §59.3 — Witness: W-S59d (both eaves found and agree; wrong-slope falsifier; VACUOUS when no line)
# Usage: python3 -P raster_eave.py <p2 workdir (chains.json, section_heights.json)> <section log with §SECT_FACES / §SECT_ROOF> [<stated overhang cm>]
#   Faces + slopes + the roof row at the faces are what raster_section.py already measured; this walks the roof's top line outward past each face in the ink.
import sys, os, json, re, math
import numpy as np
from PIL import Image
def log(*a): print(*a, flush=True)
work, slog = sys.argv[1], sys.argv[2]; VIEW = 'SCHNITT A-A'; stated = float(sys.argv[3]) / 100 if len(sys.argv) > 3 else None
C = json.load(open(os.path.join(work, 'chains.json'))); SH = json.load(open(os.path.join(work, 'section_heights.json')))
g = np.asarray(Image.open(C['clean']).convert('L')).astype(int); ink = g < C['otsu']; H, W = ink.shape
RJ = json.load(open(os.path.join(work, 'roof.json'))); X0, Y0 = RJ['views'][VIEW][0], RJ['views'][VIEW][1]   # raster_section works in the VIEW's crop: add its origin for page coordinates
k = SH['k_px_per_m']; row_f = SH['rows']['roof_at_faces'] + Y0
T = open(slog, errors='replace').read()
mf = re.search(r'§SECT_FACES .*faces region cols ([\d.]+) / ([\d.]+)', T); ms = re.search(r'§SECT_ROOF left slope ([\d.]+) deg .* right slope ([\d.]+) deg', T)
if not (mf and ms): sys.exit(log('§EAVE verdict=VACUOUS the section log has no faces / slopes'))
fl, fr = float(mf.group(1)) + X0, float(mf.group(2)) + X0; sl, sr = float(ms.group(1)), float(ms.group(2))   # slopes: logged only (the fitted top line is NOT where the eave ink is, measured: §59.3 RESULT)
log(f"§EAVE_INPUT view {VIEW} origin ({X0},{Y0}); faces page cols {fl} / {fr} (span {(fr - fl) / k:.3f} m at k={k}), roof slopes {sl} / {sr} deg, roof page row at the faces {row_f}")
def walk(face, side, r0, r1, maxgap=6):
    """scan outward from `face` (side -1 = left, +1 = right) through the row window [r0, r1]: a column holds ink if any pixel in the window is ink; the walk ends at a gap of more than `maxgap` columns. Returns (last ink col, columns with ink)."""
    last = face; gap = 0; n = 0; x = int(face)
    while 0 < x < W - 1:
        x += side
        if ink[r0:r1 + 1, x].any(): last = x; gap = 0; n += 1
        else:
            gap += 1
            if gap > maxgap: break
    return last, n
WIN = (int(row_f) - 8, int(row_f) + 60)   # the eave lies between the roof line at the face and ~1.2 m below it (stated window, logged)
res = {}
for name, face, side in (('left', fl, -1), ('right', fr, +1)):
    x_e, n = walk(face, side, *WIN); run = abs(x_e - face) / k
    xw, nw = walk(face, side, WIN[0] + 200, WIN[1] + 200)   # falsifier: a row window 200 px lower (no roof there) must find ~nothing
    res[name] = dict(face=face, end=x_e, run_m=run, steps=n, empty_window_end=xw, empty_window_run_m=abs(xw - face) / k)
    log(f"§EAVE_{name.upper()} face col {face} -> last ink col {x_e} ({n} columns with ink in rows {WIN[0]}..{WIN[1]}) = overhang {run:.3f} m; falsifier window rows {WIN[0] + 200}..{WIN[1] + 200}: {abs(xw - face) / k:.3f} m ({nw} columns)")
if res['left']['steps'] < 5 or res['right']['steps'] < 5:
    log(f"§EAVE_W-S59d verdict=VACUOUS the roof line was not found in the ink (steps {res['left']['steps']} / {res['right']['steps']})"); sys.exit(0)
d = abs(res['left']['run_m'] - res['right']['run_m']) * k
fal = abs(res['left']['run_m'] - res['left']['empty_window_run_m']) * k
log(f"§EAVE_W-S59d left {res['left']['run_m']:.3f} m, right {res['right']['run_m']:.3f} m, disagreement {d:.1f} px ({'PASS' if d <= 2 else 'FINDING'} <= 2 px); empty-window falsifier differs by {fal:.1f} px ({'PASS' if fal >= 3 else 'WEAK'} >= 3 px)")
if stated is not None:
    m = res['left']['run_m']
    log(f"§EAVE_STATED measured left overhang {m:.3f} m vs STATED {stated:.2f} m (owner, the printed ~30 is not read by the program): " + ('MATCH within 1 cm' if abs(m - stated) <= 0.01 else f'MISMATCH by {m - stated:+.3f} m: the datum of the printed value is not the wall-face column {fl}; candidates are listed by the caller, nothing tuned'))
json.dump(res, open(os.path.join(work, 'eave.json'), 'w'), indent=1)
