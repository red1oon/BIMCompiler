# Implementing PDF2BIM_VECTOR_PROBE.md §43.9 — Witness: W-S13b (elevation width -> scale), W-S13c (pitch: two slopes,
# two gables, the printed DACHNEIGUNG text), W-S13d (VACUOUS if no gable view).
# Usage: python3 -P raster_roof.py <workdir with page_clean.png + chains.json> <plan_scale_px_per_m> > raster_roof.log
# Views are isolated by their CAPTIONS (ANSICHT x / SCHNITT x, local Tesseract): every ink fragment belongs to the
# caption nearest below it. Roof = the upper envelope of a view's ink; slopes by Theil-Sen (deterministic, robust).
import sys, os, json, subprocess, re, math
from collections import deque
import numpy as np
from PIL import Image

def log(*a): print(*a, flush=True)

work, KPLAN = sys.argv[1], float(sys.argv[2])
C = json.load(open(os.path.join(work, 'chains.json')))
g = np.asarray(Image.open(C['clean']).convert('L')).astype(int)
ink = g < C['otsu']; H, W = ink.shape
F = C.get('dpi', 200) / 200.0

# frame removal (straight runs >= half the page), as raster_blocks.py
def long_runs(m, L):
    out = np.zeros_like(m)
    for i in range(m.shape[0]):
        d = np.diff(np.concatenate(([0], m[i].astype(np.int8), [0])))
        for a, b in zip(np.where(d == 1)[0], np.where(d == -1)[0]):
            if b - a >= L: out[i, max(0, a - 2):b + 2] = True
    return out
frame = long_runs(ink, W // 2) | long_runs(ink.T, H // 2).T
ink &= ~frame

# captions + the pitch text (page OCR at 2x, psm 11)
f = os.path.join(work, 'page_x2.png')
Image.fromarray(np.clip(g, 0, 255).astype(np.uint8)).resize((W * 2, H * 2), Image.LANCZOS).save(f)
r = subprocess.run(['tesseract', f, 'stdout', '--psm', '11', 'tsv'], capture_output=True, text=True)
WD = []
for ln in r.stdout.splitlines()[1:]:
    c = ln.split('\t')
    if len(c) == 12 and c[11].strip(): WD.append(dict(t=c[11], x=int(c[6]) / 2, y=int(c[7]) / 2, w=int(c[8]) / 2, h=int(c[9]) / 2, conf=float(c[10])))
caps = []
for a in WD:
    if a['t'].upper() in ('ANSICHT', 'SCHNITT'):
        nxt = sorted([w for w in WD if abs(w['y'] - a['y']) <= 8 and a['x'] < w['x'] <= a['x'] + a['w'] + 60], key=lambda w: w['x'])
        if nxt: caps.append(dict(name=a['t'].upper() + ' ' + nxt[0]['t'].upper(), x=a['x'], y=a['y'], conf=min(a['conf'], nxt[0]['conf'])))
for c in caps: log(f"§RASTER_CAPTION {c['name']} at=({c['x']:.0f},{c['y']:.0f}) conf={c['conf']:.0f}")
pitch_txt = None
for a in WD:
    if 'NEIGUNG' in a['t'].upper():
        nums = [w for w in WD if abs(w['y'] - a['y']) <= 8 and a['x'] < w['x'] <= a['x'] + a['w'] + 60 and w['t'].isdigit()]
        if nums: pitch_txt = (float(nums[0]['t']), nums[0]['conf'], a['x'], a['y'])
log(f"§RASTER_PITCH_TEXT {('DACHNEIGUNG ' + str(pitch_txt[0]) + ' GRAD conf=' + str(round(pitch_txt[1])) + ' at=(' + str(round(pitch_txt[2])) + ',' + str(round(pitch_txt[3])) + ')') if pitch_txt else 'not read'}")

# fragments (8-connected components of the ink at full res, small ones skipped) -> caption nearest below
def comps(mask, minpx):
    lab = np.zeros(mask.shape, np.int32); out = []
    for y0, x0 in zip(*np.where(mask)):
        if lab[y0, x0]: continue
        n = len(out) + 1; q = deque([(y0, x0)]); lab[y0, x0] = n; cnt = 0; ys0 = ys1 = y0; xs0 = xs1 = x0
        while q:
            y, x = q.popleft(); cnt += 1
            ys0, ys1, xs0, xs1 = min(ys0, y), max(ys1, y), min(xs0, x), max(xs1, x)
            for dy in (-1, 0, 1):
                for dx in (-1, 0, 1):
                    yy, xx = y + dy, x + dx
                    if 0 <= yy < H and 0 <= xx < W and mask[yy, xx] and not lab[yy, xx]:
                        lab[yy, xx] = n; q.append((yy, xx))
        out.append(dict(n=n, px=cnt, y0=ys0, y1=ys1, x0=xs0, x1=xs1))
    return lab, [o for o in out if o['px'] >= minpx]
lab, frags = comps(ink, 20)
# §43.10 VIEW SEPARATION: seeds = fragments sitting on a caption; all seeds grow AT ONCE through the (slightly
# dilated) ink; a pixel takes the first label to reach it, so a line joining two views splits at its midpoint
S4 = max(2, int(round(4 * F)))
hs, ws_ = H // S4, W // S4
smi = ink[:hs * S4, :ws_ * S4].reshape(hs, S4, ws_, S4).any(axis=(1, 3))
dil = smi.copy()
for dy in (-1, 0, 1):
    for dx in (-1, 0, 1):
        dil |= np.roll(np.roll(smi, dy, 0), dx, 1)
VLs = np.zeros((hs, ws_), np.int32); q = deque()
for k, c in enumerate(caps, 1):
    seeds = [fr for fr in frags if c['y'] - 60 * F <= fr['y1'] <= c['y'] + 5 and fr['x0'] < c['x'] + 300 * F and fr['x1'] > c['x'] - 20 * F]
    ns = 0
    for fr in seeds:
        ys, xs = np.where(lab[fr['y0']:fr['y1'] + 1, fr['x0']:fr['x1'] + 1] == fr['n'])
        for y, x in zip((ys + fr['y0']) // S4, (xs + fr['x0']) // S4):
            if y < hs and x < ws_ and not VLs[y, x]: VLs[y, x] = k; q.append((y, x)); ns += 1
    c['seed_frags'] = len(seeds); c['seed_cells'] = ns
while q:
    y, x = q.popleft(); k = VLs[y, x]
    for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
        yy, xx = y + dy, x + dx
        if 0 <= yy < hs and 0 <= xx < ws_ and dil[yy, xx] and not VLs[yy, xx]:
            VLs[yy, xx] = k; q.append((yy, xx))
# unreached ink joins the Euclidean-nearest region within 10 cells (grow over ALL cells, 10 steps), else UNASSIGNED
near = VLs.copy(); front = deque((y, x, 0) for y, x in zip(*np.where(VLs > 0)))
while front:
    y, x, d = front.popleft()
    if d >= 10: continue
    for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
        yy, xx = y + dy, x + dx
        if 0 <= yy < hs and 0 <= xx < ws_ and not near[yy, xx]:
            near[yy, xx] = near[y, x]; front.append((yy, xx, d + 1))
VLs = np.where(smi & (VLs == 0), near, VLs)
VL = np.zeros((H, W), np.int32); VL[:hs * S4, :ws_ * S4] = VLs.repeat(S4, 0).repeat(S4, 1)
tot = int(ink.sum()); una = int((ink & (VL == 0)).sum())
log(f"§RASTER_W-S14c assigned_ink={tot-una} unassigned_ink={una} ({100*una/tot:.1f}%) cell={S4}px")
uy, ux = np.where(ink & (VL == 0))
if len(uy): log(f"§RASTER_UNASSIGNED bbox=({ux.min()},{uy.min()})-({ux.max()},{uy.max()}) (legend/title block expected)")
out = {}; bad = 0
for k, c in enumerate(caps, 1):
    ys, xs = np.where(ink & (VL == k))
    if not len(ys): log(f"§RASTER_VIEW {c['name']} VACUOUS (seed_frags={c['seed_frags']})"); continue
    bb = [int(xs.min()), int(ys.min()), int(xs.max()), int(ys.max())]
    others = [o['name'] for o in caps if o is not c and bb[0] <= o['x'] <= bb[2] and bb[1] <= o['y'] <= bb[3] - 10]
    bad += bool(others)
    out[c['name']] = dict(bbox=bb, k=k)
    log(f"§RASTER_VIEW {c['name']} seed_frags={c['seed_frags']} seed_cells={c['seed_cells']} ink={len(ys)} bbox={bb} "
        f"contains_other_captions={others or '-'}")
np.save(os.path.join(work, 'views_label.npy'), VL)
log(f"§RASTER_W-S14a views={len(out)} overlapping={bad} verdict={'PASS' if bad == 0 and len(out) == len(caps) else 'FAIL'}")

def theil_sen(xs, ys):
    xs = np.asarray(xs, float); ys = np.asarray(ys, float); n = len(xs)
    idx = np.arange(0, n, max(1, n // 60))           # subsample pairs deterministically
    sl = [(ys[j] - ys[i]) / (xs[j] - xs[i]) for a, i in enumerate(idx) for j in idx[a + 1:] if xs[j] != xs[i]]
    m = float(np.median(sl)); b = float(np.median(ys - m * xs)); return m, b

res = {}
for name, v in out.items():
    if not name.startswith('ANSICHT'): continue
    X0, Y0, X1, Y1 = v['bbox']
    mine = (VL[Y0:Y1 + 1, X0:X1 + 1] == v['k']) & ink[Y0:Y1 + 1, X0:X1 + 1]
    # ground line: the row (bottom third) with the longest ink run in this view
    rows = [(int(mine[y].sum()), y) for y in range(int(mine.shape[0] * 2 / 3), mine.shape[0])]
    gl = max(rows)[1]
    top = np.array([np.argmax(mine[:, x]) if mine[:, x].any() else -1 for x in range(mine.shape[1])])
    cols = np.where(top >= 0)[0]
    # building columns: envelope at least 1.5 m above the ground line (trees/people are thinner: excluded below by
    # requiring the column's ink to reach the ground line)
    reach = np.array([mine[gl - 3:gl + 4, x].any() for x in range(mine.shape[1])])
    tall = (top >= 0) & ((gl - top) >= 1.5 * KPLAN) & reach
    runs = []; i = 0
    while i < len(tall):
        if tall[i]:
            j = i
            while j + 1 < len(tall) and tall[j + 1]: j += 1
            runs.append((i, j)); i = j + 1
        else: i += 1
    if not runs: log(f"§RASTER_ROOF {name} VACUOUS no building columns"); continue
    a, b = max(runs, key=lambda r: r[1] - r[0])
    wid_m = (b - a + 1) / KPLAN
    # roof slopes: envelope over the building columns, split at the apex
    xs = np.arange(a, b + 1); ys = gl - top[a:b + 1]          # height in px above the ground line
    apex = a + int(np.argmax(ys))
    left = [(x, gl - top[x]) for x in range(a, apex) if gl - top[x] > 0]
    right = [(x, gl - top[x]) for x in range(apex + 1, b + 1) if gl - top[x] > 0]
    ridge_h = (gl - top[apex]) / KPLAN
    if len(left) < 20 or len(right) < 20:
        log(f"§RASTER_ROOF {name} width_m={wid_m:.3f} apex_h_m={ridge_h:.3f} not_a_gable (apex at an edge)"); continue
    ml, _ = theil_sen(*zip(*left)); mr, _ = theil_sen(*zip(*right))
    pl, pr = math.degrees(math.atan(ml)), math.degrees(math.atan(-mr))
    res[name] = dict(width_m=wid_m, ridge_m=ridge_h, pitch_l=pl, pitch_r=pr)
    log(f"§RASTER_ROOF {name} building_px={a}..{b} width_m(plan scale)={wid_m:.3f} ridge_above_ground_m={ridge_h:.3f} "
        f"pitch_left={pl:.1f} pitch_right={pr:.1f} gable={'yes' if min(pl, pr) > 5 else 'no (flat top = eaves view)'}")

gab = {k: v for k, v in res.items() if min(v['pitch_l'], v['pitch_r']) > 5}
if not gab:
    log("§RASTER_W-S13 verdict=VACUOUS no gable view")
else:
    ps = [p for v in gab.values() for p in (v['pitch_l'], v['pitch_r'])]
    spread = max(ps) - min(ps)
    vs_text = (abs(np.median(ps) - pitch_txt[0]) if pitch_txt else None)
    log(f"§RASTER_W-S13c gables={list(gab)} pitches={[round(p,1) for p in ps]} spread={spread:.1f}deg median={np.median(ps):.1f} "
        f"text={pitch_txt[0] if pitch_txt else None} |median-text|={vs_text if vs_text is None else round(vs_text,1)} "
        f"verdict={'PASS' if spread <= 2.0 and (vs_text is None or vs_text <= 1.0) else 'FAIL'} (tolerance: two slopes x two gables ± 1 deg each)")
for k, v in res.items():
    near = min((12.49, 11.99), key=lambda m: abs(m - v['width_m']))
    log(f"§RASTER_W-S13b {k} width_m={v['width_m']:.3f} nearest_plan_side={near} ratio={v['width_m']/near:.4f} "
        f"verdict={'PASS' if abs(v['width_m']/near - 1) <= 0.005 else 'FINDING'}")
json.dump(dict(views=out and {k: v['bbox'] for k, v in out.items()}, roof=res, pitch_text=pitch_txt), open(os.path.join(work, 'roof.json'), 'w'), indent=1, default=float)
