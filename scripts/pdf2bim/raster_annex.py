# Implementing PDF2BIM_VECTOR_PROBE.md §43.22 step 1 — Witness: W-S22a (thickness classes + ring), W-S22b (opening falsifier), W-S22c (outer size, MEASURED)
# Usage: python3 -P raster_annex.py <p3 registered work dir (chains.json, page_clean.png)> [<type template>]  > raster_annex_p3.log ; writes <work>/annex.json
# The annex (the double garage) WEST of the house body on the EG sheet: walls from the diagonal-hatch rule (raster_texture.py), faces from
# the face strokes, openings = hatch-free runs bounded by jamb strokes (raster_jamb.py). Coordinates out: mm in the body frame (x from X0, y from Y0).
import sys, os, json
import numpy as np
from PIL import Image
from numpy.lib.stride_tricks import sliding_window_view
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from raster_texture import texture_maps
from raster_body import anchor_chains, body
from raster_jamb import jamb

def log(*a): print(*a, flush=True)
work = sys.argv[1]
TPL = json.load(open(sys.argv[2] if len(sys.argv) > 2 else os.path.join(os.path.dirname(os.path.abspath(__file__)), 'types', 'german_werkplan_efh.json')))
WS, OS = TPL['wall_series'], TPL['opening_series']
C = json.load(open(os.path.join(work, 'chains.json'))); out_p = os.path.join(work, 'annex.json')
if os.path.exists(out_p): os.remove(out_p)
_, gh, gv = anchor_chains(C)
if not gh or not gv: sys.exit(log("§ANNEX verdict=VACUOUS (no anchoring chain)"))
X0, X1, Y0, Y1 = body(gh[0], gv[0]); K = C['scale_px_per_m']['H']; PX = 1000 / K
g = np.asarray(Image.open(C['clean']).convert('L')).astype(int); ink = g < 215
xa, xb, ya, yb = int(X0 - 8 * K), int(X0 + 0.05 * K), int(Y0 - 3 * K), int(Y1 + 3 * K)
def runs(v):
    d = np.diff(np.concatenate(([0], v.astype(np.int8), [0]))); return list(zip(np.where(d == 1)[0], np.where(d == -1)[0] - 1))
def hatch_mask(I):   # I: rows along axis 0 = across the wall for an H wall
    _, D1, D2 = texture_maps(I); return D1 | D2
D = hatch_mask(ink)[ya:yb, xa:xb].astype(float)
Dm = sliding_window_view(np.pad(D, 2), (5, 5)).mean(axis=(2, 3)) >= 0.25
def grp(L):
    o = []
    for t in sorted(L): (o[-1].append(t) if o and t[0] - o[-1][-1][0] <= 1 else o.append([t]))
    return [(int(q[0][0]), int(q[-1][0]), int(min(x[1] for x in q)), int(max(x[2] for x in q))) for q in o]
HB = grp([(r + ya, a + xa, b + xa) for r in range(Dm.shape[0]) for a, b in runs(Dm[r]) if b - a + 1 >= 1.0 * K])
VB = grp([(c + xa, a + ya, b + ya) for c in range(Dm.shape[1]) for a, b in runs(Dm[:, c]) if b - a + 1 >= 1.0 * K])
VB = [b for b in VB if b[1] - b[0] + 1 >= 0.1 * K and b[0] < X0 - 0.5 * K]   # wall-width bands west of the house's own wall
log(f"§ANNEX region x={xa}..{xb} y={ya}..{yb} K3={K:.3f} | H bands {HB} | V bands {VB}")
def face(axis, lo, hi, s0, s1):   # the max-ink line within +-4 px of lo and of hi (rows for H, cols for V), over the band's extent
    f = lambda p: float(ink[p, s0:s1].mean()) if axis == 'H' else float(ink[s0:s1, p].mean())
    a = max(range(lo - 4, lo + 5), key=lambda p: (f(p), -abs(p - lo))); b = max(range(hi - 4, hi + 5), key=lambda p: (f(p), -abs(p - hi)))
    return a, b
def series(mm, S): return S['module_mm'] * round((mm - S['joint_mm']) / S['module_mm']) + S['joint_mm']
walls, ops = [], []
def do(axis, lo, hi, s0, s1, name):
    a, b = face(axis, lo, hi, s0, s1); t = (b - a) / K * 1000; nom = series(t, WS); cls = 'READ-SERIES' if abs(t - nom) <= PX else 'MEASURED'
    I = ink if axis == 'H' else ink.T; M = hatch_mask(I); S_ = texture_maps(I)[0]
    rows = slice(a + 2, b - 1); n = b - 1 - (a + 2)
    d = M[rows, s0:s1].sum(0); s = S_[rows, s0:s1].sum(0); hat = (d >= 0.3 * n)
    found = []
    for p, q in runs(~hat):
        if (q - p + 1) / K * 1000 < 300: continue
        ja = jamb(ink, axis, s0 + p, -1, a, b, 2, 6, 0.90); jb = jamb(ink, axis, s0 + q, +1, a, b, 2, 6, 0.90)
        w_ = (jb - ja) / K * 1000 if ja is not None and jb is not None else None
        if w_ is None: log(f"§ANNEX_GAP {name} hatch-free {s0 + p}..{s0 + q} ({(q - p + 1) / K:.2f} m) jambs={'Y' if ja is not None else 'none'}/{'Y' if jb is not None else 'none'} -> hatch spacing, not an opening"); continue
        on = series(w_, OS); oc = 'STANDARD' if abs(w_ - on) <= PX else 'STANDARD-DEFAULT'
        found.append(dict(wall=name, axis=axis, jamb_px=[float(ja), float(jb)], meas_mm=round(w_, 1), nominal_mm=on, cls=oc))
        log(f"§ANNEX_OPEN {name} jambs px {ja}..{jb} jamb_to_jamb={w_:.0f} mm -> {on} ({oc}, d={w_ - on:+.0f})")
    # W-S22b falsifier: 10 points along the longest hatched stretch
    hr = max(runs(hat), key=lambda r: r[1] - r[0]) if runs(hat) else None; fp = 0; nf = 0
    if hr and hr[1] - hr[0] > 30:
        for i in range(10):
            m = s0 + hr[0] + 5 + (hr[1] - hr[0] - 10) * i // 9; nf += 1
            fp += (jamb(ink, axis, m, -1, a, b, 0, 0, 0.90) is not None)
    walls.append(dict(name=name, axis=axis, face_px=[a, b], span_px=[s0, s1], thk_meas_mm=round(t, 1), thk_mm=nom if cls == 'READ-SERIES' else round(t), cls=cls, falsifier=[fp, nf]))
    ops.extend(found)
    log(f"§ANNEX_WALL {name} axis={axis} faces px {a}/{b} thickness={t:.0f} mm -> {nom} ({cls}, d={t - nom:+.0f}, 1 px={PX:.0f}) span px {s0}..{s1} ({(s1 - s0) / K:.2f} m) openings={len(found)} falsifier jamb_found={fp}/{nf}")
for r0, r1, c0, c1 in HB:
    if r1 - r0 + 1 < 0.1 * K: continue
    do('H', r0, r1, c0, c1, f"H@{r0}")
for c0, c1, r0, r1 in VB: do('V', c0, c1, r0, r1, f"V@{c0}")
H_ = [w for w in walls if w['axis'] == 'H']; V_ = [w for w in walls if w['axis'] == 'V']
closed = len(H_) == 2 and len(V_) == 1 and all(abs(w['span_px'][1] - X0) <= 2 for w in H_) and \
    abs(V_[0]['span_px'][0] - H_[0]['face_px'][0]) <= 2 + 4 and abs(V_[0]['span_px'][1] - H_[1]['face_px'][1]) <= 2 + 4
log(f"§ANNEX_W-S22a walls={len(walls)} classes={[(w['name'], w['thk_mm'], w['cls']) for w in walls]} ring={'CLOSED on the house west face X0=' + str(X0) if closed else 'OPEN'}")
fpt = sum(w['falsifier'][0] for w in walls); nft = sum(w['falsifier'][1] for w in walls)
log(f"§ANNEX_W-S22b falsifier jamb_found={fpt}/{nft} verdict={'PASS' if nft and fpt / nft <= 0.05 else ('INCONCLUSIVE' if not nft else 'FAIL')}")
if closed:
    W_ = V_[0]; outer_w = (X0 - W_['face_px'][0]) / K; outer_d = (H_[1]['face_px'][1] - H_[0]['face_px'][0]) / K
    log(f"§ANNEX_W-S22c outer size MEASURED {outer_w:.3f} m (E-W, west face to the house face) x {outer_d:.3f} m (N-S), +-{PX / 1000:.3f} | cross-check only: the unchecked p3 read 6,77^5")
mm = lambda px, o: round((px - o) / K * 1000, 1)
json.dump(dict(spec='§43.22 step 1', K3=K, X0=X0, Y0=Y0, ring_closed=closed,
               walls=[dict(w, faces_mm=[mm(w['face_px'][0], Y0 if w['axis'] == 'H' else X0), mm(w['face_px'][1], Y0 if w['axis'] == 'H' else X0)],
                           span_mm=[mm(w['span_px'][0], X0 if w['axis'] == 'H' else Y0), mm(w['span_px'][1], X0 if w['axis'] == 'H' else Y0)]) for w in walls],
               openings=[dict(o, jamb_mm=[mm(o['jamb_px'][0], X0 if o['axis'] == 'H' else Y0), mm(o['jamb_px'][1], X0 if o['axis'] == 'H' else Y0)]) for o in ops]),
          open(out_p, 'w'), indent=1)
