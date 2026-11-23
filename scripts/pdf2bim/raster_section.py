# Implementing PDF2BIM_VECTOR_PROBE.md §43.20 step 0 — heights from a section's GEOMETRY (its level-mark text is unreadable at 200 dpi)
# Implementing PDF2BIM_VECTOR_PROBE.md §43.20 step 2 — scale from the cut faces (slab lines) / READ depth; isotropy from p4's W-S5; faces checked by the roof (Hough vote)
# Usage: python3 -P raster_section.py <p2 workdir (page_clean.png via chains.json, views_label.npy, roof.json)> <view name> <depth_m READ> <pitch_deg READ> <ext_wall_m READ> <p4 raster_probe log> <storeys N from the plans>
# §43.20 step 3: slabs = line pairs with hatch between, named top-down by N; writes section_heights.json on PASS
import sys, os, json, math, re
import numpy as np
from PIL import Image
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from raster_texture import texture_maps

def log(*a): print(*a, flush=True)
work, view, depth, pitch, extw = sys.argv[1], sys.argv[2], float(sys.argv[3]), float(sys.argv[4]), float(sys.argv[5])
P4LOG = sys.argv[6]; NST = int(sys.argv[7])
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
if not best: log(f"§SECT_PAIR verdict=VACUOUS (step 1 rule: no equal-width band pair with span/width = {want_r:.2f} within 1 px of width)")
else: log(f"§SECT_PAIR bands {mb[best[1]]} + {mb[best[2]]} width {best[3]:.1f} px span {best[4]} px (step 1 rule, not used for k)")

# ---- §43.20 step 2 ----
def runs(v):
    d = np.diff(np.concatenate(([0], v.astype(np.int8), [0]))); return list(zip(np.where(d == 1)[0], np.where(d == -1)[0] - 1))
RW = ink.shape[1]
lr = []                                       # rows whose longest ink run >= 40 % of the region width, grouped
for r in range(ink.shape[0]):
    rr = [(int(a), int(b)) for a, b in runs(ink[r]) if b - a + 1 >= 0.4 * RW]
    if rr:
        a, b = max(rr, key=lambda t: t[1] - t[0])
        if lr and r - lr[-1]['r1'] <= 1 and abs(a - lr[-1]['L']) <= 1 and abs(b - lr[-1]['R']) <= 1: lr[-1]['r1'] = r
        else: lr.append(dict(r0=r, r1=r, L=a, R=b))
log(f"§SECT_LONGROWS " + ' '.join(f"rows{q['r0']}-{q['r1']}:{q['L']}..{q['R']}" for q in lr))
pairs = [(p, q) for i, p in enumerate(lr) for q in lr[i + 1:] if q['r0'] - p['r1'] > 20 and abs(p['L'] - q['L']) <= 1 and abs(p['R'] - q['R']) <= 1]
ext = {(round((p['L'] + q['L']) / 2), round((p['R'] + q['R']) / 2)) for p, q in pairs}
if len(ext) != 1:
    sys.exit(log(f"§SECT_KCHECK verdict=VACUOUS (row bands with one shared extent: {len(ext)} distinct extents {sorted(ext)}; need exactly 1)"))
(p, q), = [pq for pq in pairs][:1]
lf = (p['L'] + q['L']) / 2; rf = (p['R'] + q['R']) / 2; span = rf - lf; kh = span / depth
log(f"§SECT_FACES lines rows{p['r0']}-{p['r1']} ({p['L']}..{p['R']}) + rows{q['r0']}-{q['r1']} ({q['L']}..{q['R']}) -> faces region cols {lf:.1f} / {rf:.1f} span {span:.1f} px")
log(f"§SECT_KH k_h = {span:.1f} px / READ depth {depth} m = {kh:.3f} px/m")
iso = None
for ln in open(P4LOG):
    if ln.startswith('§RASTER_W-S5'):
        m = dict(t.split('=', 1) for t in ln.split() if '=' in t); iso = (float(m['H']), float(m['V']), float(m['agree_pct']))
if iso is None: sys.exit(log(f"§SECT_ISO verdict=VACUOUS (no §RASTER_W-S5 line in {P4LOG})"))
iso_ok = iso[2] <= 0.5
log(f"§SECT_ISO p4 GREEN-chain scales H={iso[0]} V={iso[1]} agree_pct={iso[2]} (limit 0.5) verdict={'PASS' if iso_ok else 'FAIL'} (assumed: p2 and p4 are one scan job)")
# roof lines: Hough vote (the strongest line per side) over angle and intercept, ink above the upper slab band, columns from 15 % of the span outside each face
upper = min(p['r0'], q['r0']); x_lo = int(max(0, lf - 0.15 * span)); x_hi = int(min(RW - 1, rf + 0.15 * span)); mid = (lf + rf) / 2
ys_, xs_ = np.where(inkg[:upper, x_lo:x_hi + 1]); xs_ = xs_ + x_lo   # g < 215 (the lane's texture threshold): measured, Otsu drops the faint roof strokes (col 450 has no roof ink at Otsu)
def vote(sel, sgn):
    best = None
    for th in np.arange(15.0, 30.0001, 0.05):
        t = math.tan(math.radians(th)); c = np.round(ys_[sel] + sgn * t * xs_[sel]).astype(int)   # left: y = c - t x ; right: y = c + t x
        h = np.bincount(c - c.min()); i = int(h.argmax())
        if best is None or h[i] > best[0]: best = (int(h[i]), th, i + int(c.min()))
    return best
L_ = vote(xs_ < mid, +1); R_ = vote(xs_ > mid, -1)
tl, tr = math.tan(math.radians(L_[1])), math.tan(math.radians(R_[1]))
ax = (L_[2] - R_[2]) / (tl + tr); ay = L_[2] - tl * ax          # crossing of y = cL - tl x and y = cR + tr x
pitch_ok = abs(L_[1] - pitch) <= 1 and abs(R_[1] - pitch) <= 1; apex_ok = abs(ax - mid) <= 2
log(f"§SECT_ROOF left slope {L_[1]:.2f} deg ({L_[0]} px voted) right slope {R_[1]:.2f} deg ({R_[0]} px) vs READ {pitch} (±1 each): {'PASS' if pitch_ok else 'FAIL'} | apex col {ax:.1f} row {ay:.1f} vs faces' mid {mid:.1f}: d={ax - mid:+.1f} px (±2) {'PASS' if apex_ok else 'FAIL'}")
ok = iso_ok and pitch_ok and apex_ok
log(f"§SECT_KCHECK verdict={'PASS' if ok else 'FAIL'} k={kh:.3f} px/m (faces from two slab lines, isotropy {iso[2]} %, roof pitch + apex centred)")
if not ok: sys.exit(0)
base = q['r1']
ilf, irf = int(round(lf)), int(round(rf))
rows = [r for r in range(ink.shape[0]) if max([b - a + 1 for a, b in runs(ink[r, ilf:irf + 1])] or [0]) >= 0.5 * span]
grp = []
for r in rows: (grp[-1].append(r) if grp and r - grp[-1][-1] <= 1 else grp.append([r]))
log(f"§SECT_LINES long horizontal lines between the faces (region row: z above the base slab bottom row {base}, m): " + ' '.join(f"{float(np.mean(g_)):.1f}:{(base - float(np.mean(g_))) / kh:+.3f}" for g_ in grp))
log(f"§SECT_ROOF_Z apex z={(base - ay) / kh:+.3f} m above the base slab bottom; the left top line meets the left face at z={(base - (L_[2] - tl * lf)) / kh:+.3f}, the right at z={(base - (R_[2] + tr * rf)) / kh:+.3f}")
# ---- §43.20 step 3: slabs by a structural rule ----
g25 = []
for r in range(ink.shape[0]):
    if max([b - a + 1 for a, b in runs(ink[r, ilf:irf + 1])] or [0]) >= 0.25 * span:
        if g25 and r - g25[-1][1] <= 1: g25[-1][1] = r
        else: g25.append([r, r])
slabs = []
for a, b in zip(g25, g25[1:]):
    mid_rows = range(a[1] + 1, b[0])
    dens = [float(DG[r, ilf:irf + 1].mean()) for r in mid_rows]
    if dens and min(dens) >= 0.30: slabs.append(dict(top=(a[0] + a[1]) / 2, bot=(b[0] + b[1]) / 2, min_hatch=round(min(dens), 2)))
log(f"§SECT_SLABS line groups (rows, run >= 25 % span) {[(a + b) / 2 for a, b in g25]} -> hatched pairs " + ' '.join(f"{q['top']}/{q['bot']}(hatch>={q['min_hatch']})" for q in slabs) + f" | storeys N={NST} need {NST + 1}")
if len(slabs) < NST + 1: sys.exit(log(f"§SECT_HEIGHTS verdict=VACUOUS ({len(slabs)} slabs < N+1 = {NST + 1}); heights stay DEFAULT"))
use = slabs[:NST + 1]; sub = slabs[NST + 1:]
ceil_, base_ = use[0], use[-1]; floors = use[1:-1][::-1]           # floors bottom-up: storey 2 .. N
z = lambda row: (base_['top'] - row) / kh                         # m above the base slab top (EG level 0)
mm5 = lambda m: int(round(m * 1000 / 5) * 5)
roof_row = ((L_[2] - tl * lf) + (R_[2] + tr * rf)) / 2
H = dict(datum='base slab top = EG level 0', k_px_per_m=round(kh, 3),
         levels=[0] + [mm5(z(f['top'])) for f in floors], slab_thk=[mm5((f['bot'] - f['top']) / kh) for f in floors],
         ceiling_bottom=mm5(z(ceil_['bot'])), ceiling_top=mm5(z(ceil_['top'])), roof_bottom=mm5(z(roof_row)), apex=mm5(z(ay)),
         rows=dict(base=base_, floors=floors, ceiling=ceil_, roof_at_faces=round(roof_row, 1), apex=round(ay, 1)), sub_base=sub)
log(f"§SECT_HEIGHTS verdict=PASS levels_mm={H['levels']} slab_mm={H['slab_thk']} ceiling={H['ceiling_bottom']}..{H['ceiling_top']} roof_bottom={H['roof_bottom']} apex={H['apex']} (base slab rows {base_['top']}/{base_['bot']}, sub-base layers {[(q['top'], q['bot']) for q in sub]})")
log(f"§SECT_STAIR_DIAG 16 x 0.179 = 2.864 m (EG plan label, human-read) vs OG level {H['levels'][1] / 1000 if len(H['levels']) > 1 else None} m (no verdict)")
# ---- §43.21 step 3: door outlines per storey -> floor build-up + door height above the finished floor ----
TPLD = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'types', 'german_werkplan_efh.json')))['door_series']['height_mm']
DIN_H = [TPLD['opening_page_nennmass'], TPLD['alternative']]
strokes = []
for c in range(ilf + 3, irf - 2):
    for a, b in runs(inkg[:, c]):   # g < 215: the door outlines are faint strokes (first run at Otsu: VACUOUS, as the roof in step 2)
        if 1.8 * kh <= b - a + 1 <= 2.8 * kh: strokes.append((c, int(a), int(b)))
def clusters(vals):
    vs = sorted(vals); out = []
    for v in vs: (out[-1].append(v) if out and v - out[-1][-1] <= 1 else out.append([v]))
    return sorted(out, key=lambda q: (-len(q), q[0]))
storeys_rows = [(base_['top'], floors[0]['bot'] if floors else ceil_['bot'])] + [(f['top'], (floors[i + 1]['bot'] if i + 1 < len(floors) else ceil_['bot'])) for i, f in enumerate(floors)]
DR = []
for si, (slab_top, above) in enumerate(storeys_rows):
    st = [s_ for s_ in strokes if above < s_[2] < slab_top and s_[1] > above]
    bc = clusters([s_[2] for s_ in st])
    if not bc: DR.append(None); log(f"§SECT_DOORS storey={si + 1} verdict=VACUOUS (no stroke)"); continue
    ffl = float(np.mean(bc[0])); on = [s_ for s_ in st if abs(s_[2] - ffl) <= 1]
    tc = clusters([s_[1] for s_ in on])
    if not tc or len(tc[0]) < 3: DR.append(None); log(f"§SECT_DOORS storey={si + 1} verdict=VACUOUS (head cluster {len(tc[0]) if tc else 0} strokes < 3)"); continue
    head = float(np.mean(tc[0])); bu = (slab_top - ffl) / kh; hf = (ffl - head) / kh
    DR.append(dict(storey=si + 1, ffl_row=round(ffl, 1), head_row=round(head, 1), buildup_mm=mm5(bu), above_ffl_mm=round(hf * 1000), n_bottom=len(bc[0]), n_head=len(tc[0]), head_cols=sorted({s_[0] for s_ in on if abs(s_[1] - head) <= 1})))
    log(f"§SECT_DOORS storey={si + 1} strokes={len(st)} FFL row={ffl:.1f} ({len(bc[0])} bottoms) head row={head:.1f} ({len(tc[0])} tops, cols {DR[-1]['head_cols']}) floor build-up={bu:.3f} m door above FFL={hf:.3f} m")
ok_d = all(DR) and len(DR) >= 2 and max(d['above_ffl_mm'] for d in DR) - min(d['above_ffl_mm'] for d in DR) <= 1000 / kh
if all(DR) and len(DR) >= 1 and (ok_d or len(DR) == 1):
    hm = float(np.mean([d['above_ffl_mm'] for d in DR])); din = min(DIN_H, key=lambda v: abs(v - hm)); cls = 'STANDARD' if abs(hm - din) <= 1000 / kh else 'STANDARD-DEFAULT'
    for d in DR: d.update(din_mm=din, cls=cls, model_mm=d['buildup_mm'] + din)
    H['doors'] = DR
    log(f"§SECT_DOORS verdict=PASS storeys agree: above FFL {[d['above_ffl_mm'] for d in DR]} mm (spread <= 1 px = {1000 / kh:.0f} mm) mean {hm:.0f} -> DIN 18101 {din} ({cls}, d={hm - din:+.0f} mm) | model door height over the raw slab per storey {[d['model_mm'] for d in DR]} = build-up {[d['buildup_mm'] for d in DR]} + {din}")
else: log(f"§SECT_DOORS verdict=INCONCLUSIVE (storeys {[d and d['above_ffl_mm'] for d in DR]}): door height stays DEFAULT")
json.dump(H, open(os.path.join(work, 'section_heights.json'), 'w'), indent=1)
# DIAGNOSTIC: the section's height chain (YELLOW) at k_h
for ch in C['chains']:
    if ch['dir'] != 'V' or not (x0 <= ch['line_x'] <= x1): continue
    out = []
    for sg in ch['segs']:
        px_ = sg['R'] - sg['L']; d = re.sub(r'[^0-9]', '', (sg['txt'] or '').split('^')[0])
        out.append(f"{px_}px={px_ / kh:.3f}m[{sg['txt']}]")
    log(f"§SECT_CHAIN_DIAG V x={ch['line_x']} (YELLOW chain, no verdict): " + ' '.join(out))
