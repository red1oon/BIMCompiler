# ⚠ DO NOT REMOVE — PDF2BIM_VECTOR_PROBE.md §51: walls from the sheets' correlation. Read the log after every run (§RASTER_STACK lines).
# Implementing PDF2BIM_VECTOR_PROBE.md §51 — Witness: W-S51a (READ walls), W-S51b (calibration on walls traced on both), W-S51c (shifted candidates -> 0 READ)
# Usage: python3 -P raster_stack.py <upper plan work> <lower registered plan work> [<shift mm, the falsifier: candidates moved across by this much>]
#   The UPPER plan's READ walls say WHERE to look; the LOWER scan's own ink decides: J = min(face cover, ink share) inside the wall's band >= the sheet's own null max + 0.10.
#   Writes <lower>/walls_stacked.json (the upper rectangles that READ, src STACKED). Nothing is added when the null is VACUOUS.
import sys, os, json
import numpy as np
from PIL import Image
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from raster_body import anchor_chains, body

def log(*a): print(*a, flush=True)
up, lo = sys.argv[1], sys.argv[2]; SHIFT = float(sys.argv[3]) if len(sys.argv) > 3 else 0.0
LMIN, MARGIN, CLEAR, SHIFTS, TOL = 600, 0.10, 150, (-1000, -750, -500, 500, 750, 1000), 2   # stated (§51): pieces under 0.6 m poison the null; the door rule's margin
CL = json.load(open(os.path.join(lo, 'chains.json'))); _, gh, gv = anchor_chains(CL); X0, X1, Y0, Y1 = body(gh[0], gv[0]); KH, KV = CL['scale_px_per_m']['H'], CL['scale_px_per_m']['V']
ink = np.asarray(Image.open(CL['clean']).convert('L')).astype(int) < 215; HP, WP = ink.shape
UP = [w for w in json.load(open(os.path.join(up, 'walls_all.json')))['walls'] if w.get('src', 'READ') == 'READ']
LW = json.load(open(os.path.join(lo, 'walls_all.json')))['walls']
BW, BD = (X1 - X0) / KH * 1000, (Y1 - Y0) / KV * 1000   # the lower plan's body in mm (the house)
def pxr(w): return X0 + w['x0'] / 1000 * KH, X0 + w['x1'] / 1000 * KH, Y0 + w['y0'] / 1000 * KV, Y0 + w['y1'] / 1000 * KV
def share(w):
    x0, x1, y0, y1 = pxr(w); x0, x1, y0, y1 = int(x0) + 1, int(x1) - 1, int(y0) + 1, int(y1) - 1
    return float(ink[max(0, y0):y1, max(0, x0):x1].mean()) if x1 > x0 and y1 > y0 else 0.0
def faces(w):
    x0, x1, y0, y1 = pxr(w); a, b = (int(round(y0)), int(round(y1))) if w['axis'] == 'H' else (int(round(x0)), int(round(x1)))
    if w['axis'] == 'H': f = [ink[max(0, a - TOL):a + TOL + 1, c].any() and ink[max(0, b - TOL):b + TOL + 1, c].any() for c in range(int(x0) + 2, int(x1) - 2) if 0 <= c < WP]
    else: f = [ink[r, max(0, a - TOL):a + TOL + 1].any() and ink[r, max(0, b - TOL):b + TOL + 1].any() for r in range(int(y0) + 2, int(y1) - 2) if 0 <= r < HP]
    return float(np.mean(f)) if f else 0.0
J = lambda w: min(faces(w), share(w)); Ln = lambda w: max(w['x1'] - w['x0'], w['y1'] - w['y0'])
def ov(a, b, m=0): return min(a['x1'], b['x1']) - max(a['x0'], b['x0']) > -m and min(a['y1'], b['y1']) - max(a['y0'], b['y0']) > -m
def moved(w, d):
    q = dict(w)
    if w['axis'] == 'H': q['y0'] += d; q['y1'] += d
    else: q['x0'] += d; q['x1'] += d
    return q
cand = [w for w in UP if Ln(w) >= LMIN and not any(ov(w, e, -50) for e in LW)]
both = [w for w in UP if Ln(w) >= LMIN and any(ov(w, e, -50) for e in LW)]
null = []
for w in cand + both:
    for d in SHIFTS:
        q = moved(w, d)
        if q['x0'] < 400 or q['y0'] < 400 or q['x1'] > BW - 400 or q['y1'] > BD - 400 or any(ov(q, e, CLEAR) for e in LW + UP): continue
        null.append(J(q))
THR = round(max(null) + MARGIN, 2) if null else None; ok_null = THR is not None and THR <= 0.60
log(f"§RASTER_STACK null probes={len(null)} (bands >= {LMIN} mm shifted {SHIFTS} mm into the house, {CLEAR} mm clear of every wall) max={max(null) if null else 0:.2f} "
    f"p95={np.percentile(null, 95) if null else 0:.2f} threshold={THR} (max + {MARGIN}) verdict={'PASS' if ok_null else 'VACUOUS'}")
cal = [J(w) for w in both]
log(f"§RASTER_W-S51b calibration: upper walls traced on the lower plan too (>= {LMIN} mm) clearing the threshold {sum(1 for v in cal if THR is not None and v >= THR)} of {len(cal)} (J {sorted(round(v, 2) for v in cal)})")
if SHIFT: cand = [moved(w, SHIFT) for w in cand]; log(f"§RASTER_STACK FALSIFIER: every candidate moved across by {SHIFT:+.0f} mm")
out = []
for w in sorted(cand, key=lambda w: -J(w)):
    j, f, s = J(w), faces(w), share(w); rd = ok_null and j >= THR
    log(f"§RASTER_STACK cand {w['axis']} x {w['x0']:.0f}..{w['x1']:.0f} y {w['y0']:.0f}..{w['y1']:.0f} thk {w['thk_chain_m']} len {Ln(w):.0f} faces={f:.2f} ink={s:.2f} J={j:.2f} -> {'READ (STACKED)' if rd else 'out'}")
    if rd: out.append(dict(w, src='STACKED', stack_J=round(j, 3), stack_from=os.path.basename(os.path.normpath(up))))
log(f"§RASTER_W-S51a READ={len(out)} of {len(cand)} candidates" + (' (FALSIFIER run: must be 0)' if SHIFT else '') + ' | ' + '; '.join(f"{w['axis']} x{w['x0']:.0f}..{w['x1']:.0f} y{w['y0']:.0f}..{w['y1']:.0f} J={w['stack_J']}" for w in out))
dst = os.path.join(lo, 'walls_stacked.json')
if SHIFT: log('§RASTER_STACK falsifier run: nothing written')
else: json.dump(dict(spec='PDF2BIM_VECTOR_PROBE.md §51', threshold=THR, null_max=max(null) if null else None, walls=out), open(dst, 'w'), indent=1)
