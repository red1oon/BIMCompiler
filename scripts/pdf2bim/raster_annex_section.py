# Implementing PDF2BIM_VECTOR_PROBE.md §43.22 step 2 — Witness: W-S22d (cut span at A-A's k vs a step-1 footprint size), W-S22e (two hatched slabs)
# Usage: python3 -P raster_annex_section.py <p2 workdir (chains.json, views_label.npy, roof.json, section_heights.json)> <view name> <p3 work (annex.json)>
#   > raster_annex_section_BB.log ; writes <p2 work>/annex_heights.json
# The annex's (double garage's) flat-roof section: faces, k checked against the plan footprint, slabs by the one slab rule, heights over its own base slab.
import sys, os, json
import numpy as np
from PIL import Image
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from raster_texture import texture_maps, slab_pairs

def log(*a): print(*a, flush=True)
work, view, p3 = sys.argv[1], sys.argv[2], sys.argv[3]
out_p = os.path.join(work, 'annex_heights.json')
if os.path.exists(out_p): os.remove(out_p)   # a VACUOUS run must not leave an older run's output
C = json.load(open(os.path.join(work, 'chains.json'))); R = json.load(open(os.path.join(work, 'roof.json')))
L = np.load(os.path.join(work, 'views_label.npy')); lab = list(R['views']).index(view) + 1
ys, xs = np.where(L == lab); x0, y0, x1, y1 = xs.min(), ys.min(), xs.max(), ys.max()
g = np.asarray(Image.open(C['clean']).convert('L')).astype(int)[y0:y1 + 1, x0:x1 + 1]; ink = g < C['otsu']; inkg = g < 215
_, D1, D2 = texture_maps(inkg); DG = (D1 | D2).astype(float)
k = json.load(open(os.path.join(work, 'section_heights.json')))['k_px_per_m']   # A-A's k: same sheet (ASSUMED), checked below
A = json.load(open(os.path.join(p3, 'annex.json')))
if not A.get('ring_closed'): sys.exit(log("§ANNEXSEC verdict=VACUOUS (step 1 ring not closed: no footprint to check against)"))
K3, X0 = A['K3'], A['X0']; H_ = sorted([w for w in A['walls'] if w['axis'] == 'H'], key=lambda w: w['face_px'][0]); V_ = [w for w in A['walls'] if w['axis'] == 'V']
sizes = {'E-W': (X0 - V_[0]['outer_face_px']) / K3, 'N-S': (H_[1]['outer_face_px'] - H_[0]['outer_face_px']) / K3}
log(f"§ANNEXSEC region {view} x={x0}..{x1} y={y0}..{y1} k={k} (A-A, same sheet: ASSUMED) | step-1 outer sizes {({d: round(m, 3) for d, m in sizes.items()})}")
def runs(v):
    d = np.diff(np.concatenate(([0], v.astype(np.int8), [0]))); return list(zip(np.where(d == 1)[0], np.where(d == -1)[0] - 1))
Hh = ink.shape[0]
cand = {}
for c in range(ink.shape[1]):   # (1) face candidates: the longest vertical ink run >= 50 % of the region height
    rr = max(runs(inkg[:, c]), key=lambda t: t[1] - t[0], default=None)
    if rr and rr[1] - rr[0] + 1 >= 0.5 * Hh: cand[c] = (int(rr[0]), int(rr[1]))
log(f"§ANNEXSEC_CAND face candidates (col: run rows) {cand}")
pick = None
for lf in sorted(cand):
    for rf in sorted(cand, reverse=True):
        if rf - lf < 0.25 * ink.shape[1]: break
        _, sl = slab_pairs(ink, DG, lf, rf, rf - lf, 0.50)
        if len(sl) != 2: continue
        cover = all(cand[c][0] <= sl[0]['top'] and cand[c][1] >= sl[1]['bot'] for c in (lf, rf))
        if cover: pick = (lf, rf, sl); break
        log(f"§ANNEXSEC_REJECT faces {lf}/{rf}: run {cand[lf]}/{cand[rf]} does not cross both slabs {[(q['top'], q['bot']) for q in sl]}")
    if pick: break
if not pick: sys.exit(log("§ANNEXSEC_W-S22e verdict=VACUOUS (no face pair whose runs cross exactly two hatched slabs at the 50 % line rule)"))
lf, rf, sl = pick; span = rf - lf
roof, base = sl
log(f"§ANNEXSEC_W-S22e verdict=PASS faces cols {lf} / {rf} (runs {cand[lf]} / {cand[rf]}) slabs: roof {roof['top']}/{roof['bot']} (hatch>={roof['min_hatch']}) base {base['top']}/{base['bot']} (hatch>={base['min_hatch']})")
d_px = {d: span - m * k for d, m in sizes.items()}; best = min(d_px, key=lambda d: abs(d_px[d])); other = [d for d in d_px if d != best][0]
TOL = 1.0 + k / K3   # spec amendment: B-B's 1 px + step 1's own +-1 px at K3, converted to k
ok = abs(d_px[best]) <= TOL and abs(d_px[other]) > 5
log(f"§ANNEXSEC_W-S22d span {span} px = {span / k:.3f} m at k | vs step-1 {best} {sizes[best]:.3f} m = {sizes[best] * k:.1f} px: d={d_px[best]:+.2f} px (<= {TOL:.2f} = 1 px here + 1 px of step 1) | vs {other} {sizes[other]:.3f} m: d={d_px[other]:+.1f} px (> 5) "
    f"cut direction={best} verdict={'PASS' if ok else 'FAIL'}")
if not ok: sys.exit(0)
grp, _ = slab_pairs(ink, DG, lf, rf, span, 0.25)   # line groups at the A-A threshold, for the parapet top only
top = [q for q in grp if q[1] < roof['top'] and all(cand[c][0] <= q[0] for c in (lf, rf))]
par = (top[0][0] + top[0][1]) / 2 if top else None
mm5 = lambda px: int(round(px / k * 1000 / 5) * 5)
Hj = dict(spec='§43.22 step 2', view=view, k_px_per_m=k, cut=best, datum='garage base slab top', datum_vs_EG='DEFAULT: garage base slab top = EG level 0 (raw slab top); not measurable on this sheet',
          wall_clear=mm5(base['top'] - roof['bot']), roof_slab_thk=mm5(roof['bot'] - roof['top']), roof_slab_top=mm5(base['top'] - roof['top']),
          base_slab_thk=mm5(base['bot'] - base['top']), parapet_top=mm5(base['top'] - par) if par is not None else None,
          rows=dict(faces=[lf, rf], roof=roof, base=base, parapet_top=par))
log(f"§ANNEXSEC_HEIGHTS READ-GEOM over the garage base slab top: wall clear={Hj['wall_clear']} roof slab {Hj['roof_slab_thk']} (top {Hj['roof_slab_top']}) base slab {Hj['base_slab_thk']} parapet top={Hj['parapet_top']} (row {par}) | datum vs EG: {Hj['datum_vs_EG']}")
log(f"§ANNEXSEC_DIAG human-read prints, no verdict: clear 2.43 - (-0.11) = 2.540, roof slab 2.65 - 2.43 = 0.220, base slab -0.11 - (-0.38) = 0.270, parapet 2.83 - 2.65 = 0.180 above the slab top; "
    f"measured {Hj['wall_clear'] / 1000:.3f} / {Hj['roof_slab_thk'] / 1000:.3f} / {Hj['base_slab_thk'] / 1000:.3f} / {(Hj['parapet_top'] - Hj['roof_slab_top']) / 1000 if par is not None else None}; garage slab top -0.11 vs house raw -0.16 = +0.05 (not applied)")
json.dump(Hj, open(out_p, 'w'), indent=1)
