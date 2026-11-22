# Implementing PDF2BIM_VECTOR_PROBE.md §43.2 — Witness: W-S9a recall, W-S9b thickness, W-S9c connectivity, W-S9d totals
# Usage: python3 -P raster_wallscan.py <workdir with chains.json + page_clean.png + walls.json>  > raster_wallscan.log
# Whole-plan wall search on a scanned plan. Thickness vocabulary and minimum run lengths come from the
# GREEN chains and the §43.1 anchored trace; nothing is a wall unless it passes W-S9b and joins the ring network.
import sys, os, json
import numpy as np
from PIL import Image
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from raster_texture import texture_maps

def log(*a): print(*a, flush=True)

work = sys.argv[1]
C = json.load(open(os.path.join(work, 'chains.json')))
W1 = json.load(open(os.path.join(work, 'walls.json')))['walls']
g = np.asarray(Image.open(C['clean']).convert('L')).astype(int)
OT = C['otsu']; GREY = 215
KH, KV = C['scale_px_per_m']['H'], C['scale_px_per_m']['V']
gh = [c for c in C['chains'] if c['verdict'] == 'GREEN' and c['dir'] == 'H'][0]
gv = [c for c in C['chains'] if c['verdict'] == 'GREEN' and c['dir'] == 'V'][0]
X0, X1 = gh['ticks_x'][0], gh['ticks_x'][-1]; Y0, Y1 = gv['ticks_y'][0], gv['ticks_y'][-1]
M = 6
oy, ox = Y0 - M, X0 - M
ink = g[oy:Y1 + M + 1, ox:X1 + M + 1] < OT
inkg = g[oy:Y1 + M + 1, ox:X1 + M + 1] < GREY

# vocabulary (m) = wall values of the GREEN chains; min run length per value = shortest §43.1 run of it
vocab = sorted({w['thk_chain_m'] for w in W1})
minlen_m = {v: min(max(w['x1'] - w['x0'], w['y1'] - w['y0']) for w in W1 if w['thk_chain_m'] == v) / 1000 for v in vocab}
log(f"§RASTER_SCAN_VOCAB thickness_m={vocab} (min run = 2 x thickness, §43.1 rule) shortest_confirmed_run_m=" + ' '.join(f"{v}:{minlen_m[v]:.3f}" for v in vocab) +
    f" body_px={X1-X0}x{Y1-Y0}")

def shift(a, dy, dx):
    out = np.zeros_like(a)
    H, W = a.shape
    ys = slice(max(dy, 0), H + min(dy, 0)); yd = slice(max(-dy, 0), H + min(-dy, 0))
    xs = slice(max(dx, 0), W + min(dx, 0)); xd = slice(max(-dx, 0), W + min(-dx, 0))
    out[ys, xs] = a[yd, xd]
    return out

def runs1d(b):
    d = np.diff(np.concatenate(([0], b.astype(np.int8), [0])))
    return list(zip(np.where(d == 1)[0], np.where(d == -1)[0] - 1))

def scan(INK, INKG, K, tag):
    """walls running along axis 0 (rows) of INK; returns candidates (x_left_face, x_right_face, r0, r1, T_m)"""
    Hh, Ww = INK.shape
    Vs = INK & shift(INK, 1, 0) & shift(INK, -1, 0)              # stroke along the axis
    F = np.zeros_like(Vs)
    for dx in range(-2, 3): F |= shift(Vs, 0, dx)                 # face tolerance ±2 px (as §43.1)
    S, D1, D2 = texture_maps(INKG)                                # ONE owner: raster_texture.py
    cS = np.cumsum(np.pad(S, ((0, 0), (1, 0))).astype(np.int32), axis=1)
    cD1 = np.cumsum(np.pad(D1, ((0, 0), (1, 0))).astype(np.int32), axis=1)
    cD2 = np.cumsum(np.pad(D2, ((0, 0), (1, 0))).astype(np.int32), axis=1)
    cI = np.cumsum(np.pad(INKG, ((0, 0), (1, 0))).astype(np.int32), axis=1)
    cands = []
    for v in sorted(vocab, reverse=True):
        T = int(round(v * K)); thin = (T - 2) - 3 < 5
        L = 2 * T                                                 # §43.1 rule: runs >= 2 x thickness (connectivity rejects junk)
        xs = np.arange(0, Ww - T)
        both = F[:, xs] & F[:, xs + T]
        a_, b_ = xs + 3, xs + T - 2                               # interior columns [a_, b_)
        if thin:
            row = both                                            # §43.1 rule: thin bands cannot show hatch -> faces alone
        else:
            w = max(3, T // 3); ker = np.ones(2 * w + 1)
            dsum = np.apply_along_axis(lambda c: np.convolve(c, ker, 'same'), 0, np.maximum(cD1[:, b_] - cD1[:, a_], cD2[:, b_] - cD2[:, a_]).astype(float))
            ssum = np.apply_along_axis(lambda c: np.convolve(c, ker, 'same'), 0, (cS[:, b_] - cS[:, a_]).astype(float))
            row = both & (dsum > ssum)
        h = max(1, T // 2); ker = np.ones(2 * h + 1)
        maj = np.apply_along_axis(lambda c: np.convolve(c, ker, 'same'), 0, row.astype(float)) > (h + 0.5)
        n0 = len(cands)
        for xi in range(len(xs)):
            for r0, r1 in runs1d(maj[:, xi]):
                if r1 - r0 + 1 >= L:
                    strength = F[r0:r1 + 1, xs[xi]].mean() + F[r0:r1 + 1, xs[xi] + T].mean()
                    cands.append(dict(x=int(xs[xi]), T=T, v=v, r0=int(r0), r1=int(r1), s=float(strength), thin=thin))
        log(f"§RASTER_SCAN_RAW {tag} T={v}m ({T}px thin={thin}) min_run={L}px candidates={len(cands)-n0}")
    # W-S9b FIRST (on every raw candidate): face-centre thickness on the run rows = vocabulary value ± 1 px.
    # (Order matters, measured §43.2: suppression before this let thick false candidates on interior walls
    #  evict the true thin ones, then fail the thickness check themselves.)
    ver = []; rej = 0; nrel = [0]
    for c in cands:
        cols = np.arange(c['x'] - 4, c['x'] + c['T'] + 5)
        cols = cols[(cols >= 0) & (cols < Ww)]
        prof = INK[c['r0']:c['r1'] + 1, cols].mean(axis=0)
        mid = c['x'] + c['T'] / 2
        Lc = [i for i, x in enumerate(cols) if x <= mid and x <= c['x'] + 4 and prof[i] >= 0.6]
        Rc = [i for i, x in enumerate(cols) if x > mid and x >= c['x'] + c['T'] - 4 and prof[i] >= 0.6]
        if not Lc or not Rc: rej += 1; c['fate'] = 'thk_noface'; continue
        cl = sum(cols[i] * prof[i] for i in Lc) / sum(prof[i] for i in Lc)
        cr = sum(cols[i] * prof[i] for i in Rc) / sum(prof[i] for i in Rc)
        m = (cr - cl) / K
        near = min(vocab, key=lambda u: abs(u - m))               # the MEASUREMENT decides; the template only proposes
        if abs(m - near) * K <= 1.0:
            if near != c['v']: c['relabel'] = f"{c['v']}->{near}"; nrel[0] += 1
            c['v'] = near; c['thk_m'] = m; c['fl'] = cl; c['fr'] = cr; ver.append(c)
        else: rej += 1; c['fate'] = f'thk {m:.3f}'
    log(f"§RASTER_W-S9b {tag} verified={len(ver)} relabelled={nrel[0]} rejected_thickness={rej} of {len(cands)}")
    # non-max suppression among VERIFIED candidates: thick first, longest first; a candidate whose band
    # overlaps an accepted band (any thickness) on > 50 % of its rows is dropped
    ver.sort(key=lambda c: (-c['v'], -(c['r1'] - c['r0']), -c['s']))
    good = []
    for c in ver:
        ok = True
        for a in good:
            if c['x'] <= a['x'] + a['T'] + 1 and a['x'] <= c['x'] + c['T'] + 1:
                ov = min(c['r1'], a['r1']) - max(c['r0'], a['r0']) + 1
                if ov > 0.5 * (c['r1'] - c['r0'] + 1): ok = False; break
        if ok: good.append(c); c['fate'] = 'ok'
        else: c['fate'] = 'nms'
    log(f"§RASTER_SCAN_NMS {tag} kept={len(good)} of {len(ver)}")
    ALL[tag] = cands
    return good

ALL = {}
vert = scan(ink, inkg, KH, 'vertical')          # walls along y
hori = scan(ink.T.copy(), inkg.T.copy(), KV, 'horizontal')   # walls along x (transposed)

# rectangles in body px (x, y), inclusive
rects = []
for c in vert: rects.append(dict(o='V', x0=c['fl'], x1=c['fr'], y0=c['r0'], y1=c['r1'], v=c['v'], m=c['thk_m'], T=c['T']))
for c in hori: rects.append(dict(o='H', y0=c['fl'], y1=c['fr'], x0=c['r0'], x1=c['r1'], v=c['v'], m=c['thk_m'], T=c['T']))

# exterior strip rule: the outer ring strip (one exterior thickness from the body edge) belongs to the exterior
# wall; a THINNER band inside it is window glazing/frame (§43.1 classed those rows P), logged as opening evidence
ext_v = max(vocab); ext_px = ext_v * KH
bw0, bh0 = X1 - X0 + 2 * M, Y1 - Y0 + 2 * M
def in_ext_strip(r):
    if r['o'] == 'V': return r['x0'] < M + ext_px + 2 or r['x1'] > bw0 - M - ext_px - 2
    return r['y0'] < M + ext_px + 2 or r['y1'] > bh0 - M - ext_px - 2
glaz = [r for r in rects if r['v'] < ext_v and in_ext_strip(r)]
rects = [r for r in rects if not (r['v'] < ext_v and in_ext_strip(r))]
log(f"§RASTER_SCAN_GLAZING thinner_bands_in_exterior_strip={len(glaz)} (removed as walls, kept as opening evidence) at " +
    ';'.join(f"{r['o']}:{(r['x0']+ox):.0f},{(r['y0']+oy):.0f}" for r in glaz))
# W-S9c connectivity from the exterior ring; walls JOIN when they touch: face tolerance 2 px + 1 (§43.1)
tol = 3
def touch(a, b):
    return a['x0'] - tol <= b['x1'] and b['x0'] - tol <= a['x1'] and a['y0'] - tol <= b['y1'] and b['y0'] - tol <= a['y1']
bw, bh = X1 - X0 + 2 * M, Y1 - Y0 + 2 * M
ext_thk = max(vocab) * KH
seed = [i for i, r in enumerate(rects) if r['v'] == max(vocab) and (
        (r['o'] == 'V' and (r['x0'] < M + ext_thk / 2 or r['x1'] > bw - M - ext_thk / 2)) or
        (r['o'] == 'H' and (r['y0'] < M + ext_thk / 2 or r['y1'] > bh - M - ext_thk / 2)))]
net = set(seed); front = list(seed)
while front:
    i = front.pop()
    for j, r in enumerate(rects):
        if j not in net and touch(rects[i], r): net.add(j); front.append(j)
log(f"§RASTER_W-S9c seeds_exterior={len(seed)} network={len(net)} isolated_YELLOW={len(rects)-len(net)} "
    f"verdict={'INCONCLUSIVE' if len(seed) < 4 else 'PASS'}")
for j, r in enumerate(rects):
    if j not in net:
        log(f"§RASTER_SCAN_YELLOW o={r['o']} thk={r['v']} x={r['x0']+ox:.0f}..{r['x1']+ox:.0f} y={r['y0']+oy:.0f}..{r['y1']+oy:.0f} reason=not_joined_to_ring")

# W-S9a recall of the §43.1 runs (mm -> body px)
def mm2px(w):
    return dict(o=w['axis'], x0=w['x0'] / 1000 * KH + M, x1=w['x1'] / 1000 * KH + M, y0=w['y0'] / 1000 * KV + M, y1=w['y1'] / 1000 * KV + M)
found = 0
for w in W1:
    p = mm2px(w)
    same = [rects[j] for j in net]
    if p['o'] == 'V':
        cov = np.zeros(int(p['y1'] - p['y0']) + 1, bool)
        for r in same:
            if r['x0'] - 3 <= p['x1'] and p['x0'] - 3 <= r['x1']:
                a = int(max(r['y0'], p['y0']) - p['y0']); b = int(min(r['y1'], p['y1']) - p['y0'])
                if b >= a: cov[a:b + 1] = True
    else:
        cov = np.zeros(int(p['x1'] - p['x0']) + 1, bool)
        for r in same:
            if r['y0'] - 3 <= p['y1'] and p['y0'] - 3 <= r['y1']:
                a = int(max(r['x0'], p['x0']) - p['x0']); b = int(min(r['x1'], p['x1']) - p['x0'])
                if b >= a: cov[a:b + 1] = True
    ok = cov.mean() >= 0.9; found += ok
    if not ok:
        # which stage lost it: best raw candidate of the same orientation overlapping this run's band
        tagn = 'vertical' if p['o'] == 'V' else 'horizontal'
        band = (p['x0'], p['x1']) if p['o'] == 'V' else (p['y0'], p['y1'])
        span = (p['y0'], p['y1']) if p['o'] == 'V' else (p['x0'], p['x1'])
        cs = [c for c in ALL[tagn] if c['x'] - 3 <= band[1] and band[0] - 3 <= c['x'] + c['T'] and
              min(c['r1'], span[1]) - max(c['r0'], span[0]) > 0]
        fates = {}
        for c in cs: fates[(c['v'], c.get('fate', '?'))] = fates.get((c['v'], c.get('fate', '?')), 0) + 1
        best = max(cs, key=lambda c: min(c['r1'], span[1]) - max(c['r0'], span[0])) if cs else None
        log(f"§RASTER_W-S9a TRACE band_px={band[0]:.0f}..{band[1]:.0f} span_px={span[0]:.0f}..{span[1]:.0f} raw={len(cs)} fates={fates} "
            f"best={None if best is None else (best['x'], best['T'], best['r0'], best['r1'], best.get('fate'))}")
        log(f"§RASTER_W-S9a MISS o={p['o']} thk={w['thk_chain_m']} mm=({w['x0']:.0f},{w['y0']:.0f})-({w['x1']:.0f},{w['y1']:.0f}) covered={cov.mean()*100:.0f}%")
log(f"§RASTER_W-S9a recall={found}/{len(W1)} verdict={'PASS' if found == len(W1) else 'FAIL'}")

# W-S9d totals + output (GREEN only), mm from the outer top-left corner
out = []
for j in sorted(net):
    r = rects[j]
    out.append(dict(axis=r['o'], thk_chain_m=r['v'], thk_meas_m=round(r['m'], 4),
                    x0=(r['x0'] - M) / KH * 1000, x1=(r['x1'] - M) / KH * 1000,
                    y0=(r['y0'] - M) / KV * 1000, y1=(r['y1'] - M) / KV * 1000))
per = {}
for w in out:
    L = (w['y1'] - w['y0']) if w['axis'] == 'V' else (w['x1'] - w['x0'])
    per[w['thk_chain_m']] = per.get(w['thk_chain_m'], 0) + L / 1000
log(f"§RASTER_W-S9d walls={len(out)} total_m={sum(per.values()):.2f} per_thickness=" +
    ' '.join(f"{k}:{v:.2f}m" for k, v in sorted(per.items())))
json.dump(dict(origin='outer top-left corner, y down, mm', walls=out), open(os.path.join(work, 'walls_all.json'), 'w'), indent=1)
