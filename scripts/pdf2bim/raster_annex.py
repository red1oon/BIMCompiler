# Implementing PDF2BIM_VECTOR_PROBE.md §43.22 step 1 (run 2: fixes 1-3, W-S22b on the house wall) — Witness: W-S22a (thickness classes + ring), W-S22b (opening falsifier), W-S22c (outer size, MEASURED)
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
def hatch_runs(axis, a, b, s0, s1):
    """bridged hatch flag along the band interior (fix 3): returns (hat_raw, hat_bridged) over s0..s1"""
    I = ink if axis == 'H' else ink.T; S_, D1, D2 = texture_maps(I)
    rows = slice(a + 2, b - 1); n = max(1, b - 1 - (a + 2))
    d = np.maximum(D1[rows, s0:s1].sum(0), D2[rows, s0:s1].sum(0)); s = S_[rows, s0:s1].sum(0)
    raw = (d >= 0.3 * n) & (d > s)
    br = sliding_window_view(np.pad(raw, 4), 9).max(axis=1)
    return raw, br
def openings_on(axis, a, b, s0, s1, name):
    raw, br = hatch_runs(axis, a, b, s0, s1); found = []
    for p, q in runs(~br):
        if (q - p + 1) / K * 1000 < 300 or p == 0 or q == len(br) - 1: continue   # an opening is bounded by wall on both sides
        hs = [i for i in range(len(raw)) if raw[i]]
        e0 = max(i for i in hs if i < p + 4); e1 = min(i for i in hs if i > q - 4)        # the un-bridged hatch end / start
        w_ = (e1 - e0) / K * 1000; on = series(w_, OS); oc = 'STANDARD' if abs(w_ - on) <= PX else 'STANDARD-DEFAULT'
        c_ = (s0 + (e0 + e1) / 2)
        found.append(dict(wall=name, axis=axis, edge_px=[s0 + e0, s0 + e1], centre_px=c_, meas_mm=round(w_, 1), nominal_mm=on, cls=oc))
        log(f"§ANNEX_OPEN {name} hatch ends px {s0 + e0}..{s0 + e1} width={w_:.0f} mm -> {on} ({oc}, d={w_ - on:+.0f})")
    return found
def outer_extent(axis, fpos, mid):
    """fix 2: the continuous ink run (gaps <= 2 px) of a face line through `mid`"""
    v = (ink[fpos - 1:fpos + 2, :].any(axis=0) if axis == 'H' else ink[:, fpos - 1:fpos + 2].any(axis=1)).copy()   # the face STROKE (3 rows/cols), not one pixel row
    if axis == 'H': v[X0 + 1:] = False   # the garage ends at the house's west face: a collinear house face does not extend it
    lo = hi = min(mid, X0) if axis == 'H' else mid
    while lo > 0 and (v[lo - 1] or v[max(0, lo - 2)] or v[max(0, lo - 3)]): lo -= 1
    while hi < len(v) - 1 and (v[hi + 1] or v[min(len(v) - 1, hi + 2)] or v[min(len(v) - 1, hi + 3)]): hi += 1
    return lo, hi
cand = [('H', r0, r1, c0, c1) for r0, r1, c0, c1 in HB] + [('V', c0, c1, r0, r1) for c0, c1, r0, r1 in VB]
for axis, lo_, hi_, s0, s1 in cand:
    name = f"{axis}@{lo_}"; a, b = face(axis, lo_, hi_, s0, s1); t = (b - a) / K * 1000
    if t < 115 - PX: log(f"§ANNEX_DROP {name} face to face {t:.0f} mm < 115 - 1 px: a line, not a wall (fix 1)"); continue
    nom = series(t, WS); cls = 'READ-SERIES' if abs(t - nom) <= PX else 'MEASURED'
    walls.append(dict(name=name, axis=axis, face_px=[a, b], band_span=[s0, s1], thk_meas_mm=round(t, 1), thk_mm=nom if cls == 'READ-SERIES' else round(t), cls=cls))
H_ = sorted([w for w in walls if w['axis'] == 'H'], key=lambda w: w['face_px'][0]); V_ = [w for w in walls if w['axis'] == 'V']
for w in walls:   # fix 2: outer face = farther from the opposite wall (H) / from the house (V)
    if w['axis'] == 'H': of = w['face_px'][0] if w is H_[0] else w['face_px'][1]
    else: of = w['face_px'][0]
    mid = (w['band_span'][0] + w['band_span'][1]) // 2
    e = max((outer_extent(w['axis'], f_, mid) for f_ in w['face_px']), key=lambda r: r[1] - r[0])   # the longer face stroke: an overhead door draws its outer face DASHED (measured, gaps <= 3 px)
    w['outer_face_px'] = of; w['span_px'] = [int(e[0]), int(e[1])]
    log(f"§ANNEX_WALL {w['name']} axis={w['axis']} faces px {w['face_px'][0]}/{w['face_px'][1]} thickness={w['thk_meas_mm']:.0f} mm -> {w['thk_mm']} ({w['cls']}) outer face {of} extent px {e[0]}..{e[1]} ({(e[1] - e[0]) / K:.2f} m)")
    ops.extend(openings_on(w['axis'], w['face_px'][0], w['face_px'][1], w['span_px'][0], w['span_px'][1] + 1, w['name']))
closed = len(H_) == 2 and len(V_) == 1 and all(abs(w['span_px'][1] - X0) <= 3 for w in H_) and \
    all(abs(w['span_px'][0] - V_[0]['outer_face_px']) <= 2 for w in H_) and abs(V_[0]['span_px'][0] - H_[0]['outer_face_px']) <= 2 and abs(V_[0]['span_px'][1] - H_[1]['outer_face_px']) <= 2
log(f"§ANNEX_W-S22a walls={len(walls)} classes={[(w['name'], w['thk_mm'], w['cls']) for w in walls]} H ends {[w['span_px'] for w in H_]} V span {[w['span_px'] for w in V_]} vs X0={X0}, V outer {[w['outer_face_px'] for w in V_]}, H outer {[w['outer_face_px'] for w in H_]} ring={'CLOSED' if closed else 'OPEN'}")
# W-S22b: the same opening rule on the HOUSE's west exterior wall reproduces the §43.16 W openings
OPJ = json.load(open(os.path.join(work, 'openings.json')))['openings']; ref = [o for o in OPJ if o['face'] == 'W']
ha, hb = face('V', X0, int(X0 + 0.365 * K), Y0, Y1)
got = openings_on('V', ha, hb, Y0, Y1 + 1, 'HOUSE_W')
def pair(o):
    c_ = Y0 + o['centre_mm'] / 1000 * K
    m = [x for x in got if abs(x['centre_px'] - c_) <= 1 + 0.5 * abs(x['meas_mm'] - o['meas_mm']) / PX and abs(x['meas_mm'] - o['meas_mm']) <= PX]
    return m
hits = [bool(pair(o)) for o in ref]
log(f"§ANNEX_W-S22b house west wall faces px {ha}/{hb}: rule found {len(got)} {[(round(x['centre_px'] - Y0), x['meas_mm']) for x in got]} vs §43.16 {[(round(o['centre_mm'] / 1000 * K), o['meas_mm']) for o in ref]} "
    f"matched {sum(hits)}/{len(ref)} extra {len(got) - sum(hits)} verdict={'PASS' if all(hits) and len(got) == len(ref) else 'FAIL'}")
if closed:
    W_ = V_[0]; ow = (X0 - W_['outer_face_px']) / K; od = (H_[1]['outer_face_px'] - H_[0]['outer_face_px']) / K
    log(f"§ANNEX_W-S22c outer size MEASURED {ow:.3f} m (E-W, to the house's west face) x {od:.3f} m (N-S), +-{PX / 1000:.3f} | cross-check only: the unchecked p3 read 6,77^5")
mm = lambda px, o: round((px - o) / K * 1000, 1)
json.dump(dict(spec='§43.22 step 1 run 2', K3=K, X0=X0, Y0=Y0, ring_closed=closed,
               walls=[dict(w, faces_mm=[mm(w['face_px'][0], Y0 if w['axis'] == 'H' else X0), mm(w['face_px'][1], Y0 if w['axis'] == 'H' else X0)],
                           span_mm=[mm(w['span_px'][0], X0 if w['axis'] == 'H' else Y0), mm(w['span_px'][1], X0 if w['axis'] == 'H' else Y0)]) for w in walls],
               openings=[dict(o, edge_mm=[mm(o['edge_px'][0], X0 if o['axis'] == 'H' else Y0), mm(o['edge_px'][1], X0 if o['axis'] == 'H' else Y0)]) for o in ops]),
          open(out_p, 'w'), indent=1, default=float)
