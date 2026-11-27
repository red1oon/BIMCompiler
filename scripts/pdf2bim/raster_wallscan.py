# Implementing PDF2BIM_VECTOR_PROBE.md §43.2 + §52.1 — Witness: W-S9a recall, W-S9b thickness, W-S9c connectivity, W-S9d totals, W-S52c hatch
# Usage: python3 -P raster_wallscan.py <workdir with chains.json + page_clean.png + walls.json>  > raster_wallscan.log
# Whole-plan wall search on a scanned plan. Thickness vocabulary and minimum run lengths come from the
# GREEN chains and the §43.1 anchored trace; nothing is a wall unless it passes W-S9b and joins the ring network.
import sys, os, json
import numpy as np
from PIL import Image
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from raster_texture import texture_maps, hatch_period, hatch_score as _hs

def log(*a): print(*a, flush=True)

work = sys.argv[1]
if not os.path.exists(os.path.join(work, 'walls.json')):
    log("§RASTER_W-S9 verdict=VACUOUS (walls.json absent: the previous stage had nothing to anchor on)"); sys.exit(0)
C = json.load(open(os.path.join(work, 'chains.json')))
W1 = json.load(open(os.path.join(work, 'walls.json')))['walls']
g = np.asarray(Image.open(C['clean']).convert('L')).astype(int)
OT = C['otsu']; GREY = 215
KH, KV = C['scale_px_per_m']['H'], C['scale_px_per_m']['V']
gh = max([c for c in C['chains'] if c['verdict'] == 'GREEN' and c['dir'] == 'H'], key=lambda c: len(c['segs']))
gv = max([c for c in C['chains'] if c['verdict'] == 'GREEN' and c['dir'] == 'V'], key=lambda c: len(c['segs']))
X0, X1 = gh['ticks_x'][0], gh['ticks_x'][-1]; Y0, Y1 = gv['ticks_y'][0], gv['ticks_y'][-1]
F = C.get('dpi', 200) / 200.0
def px(v): return max(1, int(round(v * F)))
M = px(6)
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

# §52.1 HATCH RULE (owner 2026-11-24, the "columns" in the OG rooms): every cut wall on the sheet carries the sheet's own hatch,
# thin partitions included (the §43.1 "thin bands cannot show hatch" premise is measured wrong on DE-1). Period P = median spacing of
# ink-run starts along the chain-anchored walls' centrelines; score = best line pair (l, l+D) of the band interior:
# (share of the line covered by starts at P ±2 px) x (share of starts continued diagonally, ±D ±1 px, on line l+D).
# Calibrated on the chain walls (walls.json): threshold = their min - 0.10. Runs on every VERIFIED candidate BEFORE suppression (a false band must not evict a true one, the §43.2 order lesson) and so before connectivity.
def mm2px(w):   # mm (outer top-left) -> body px
    return dict(o=w['axis'], x0=w['x0'] / 1000 * KH + M, x1=w['x1'] / 1000 * KH + M, y0=w['y0'] / 1000 * KV + M, y1=w['y1'] / 1000 * KV + M)
HD = px(2)
def hatch_score(o, x0, x1, y0, y1, P):   # body px; one owner: raster_texture.hatch_score (faces: 2 px left, 1 px right, as measured §52.1)
    x0, x1, y0, y1 = int(round(x0)), int(round(x1)), int(round(y0)), int(round(y1))
    v = o == 'V'
    return _hs(ink, o, x0 + (px(1) if v else 0), x1 - (px(1) if v else 0), y0 + (0 if v else px(1)), y1 - (0 if v else px(1)), P, HD, px(2), px(1))
_W1px = [mm2px(w) for w in W1]
HP, _nsp = hatch_period(ink, [(p['o'], p['x0'], p['x1'], p['y0'], p['y1']) for p in _W1px])
_cal = [hatch_score(p['o'], p['x0'], p['x1'], p['y0'], p['y1'], HP) for p in _W1px] if HP else []
_cmin = min(_cal) if _cal else 0.0
HATCH_THR = round(_cmin - 0.10, 3)
_vac = len(_cal) < 5 or _cmin < 0.40
log(f"§RASTER_HATCH period_px={HP:.1f} from_chain_walls={len(_W1px)} starts={_nsp} calib_min={_cmin:.2f} calib_median={float(np.median(_cal)) if _cal else 0:.2f} "
    f"threshold={HATCH_THR} verdict={'VACUOUS (rule off, §43.1 rule kept)' if _vac else 'PASS'}")
NOHATCH = []

def scan(INK, INKG, K, tag):
    """walls running along axis 0 (rows) of INK; returns candidates (x_left_face, x_right_face, r0, r1, T_m)"""
    Hh, Ww = INK.shape
    Vs = INK & shift(INK, 1, 0) & shift(INK, -1, 0)              # stroke along the axis
    FF = np.zeros_like(Vs)
    for dx in range(-px(2), px(2) + 1): FF |= shift(Vs, 0, dx)    # face tolerance ±2 px at 200 dpi (as §43.1)
    S, D1, D2 = texture_maps(INKG)                                # ONE owner: raster_texture.py
    cS = np.cumsum(np.pad(S, ((0, 0), (1, 0))).astype(np.int32), axis=1)
    cD1 = np.cumsum(np.pad(D1, ((0, 0), (1, 0))).astype(np.int32), axis=1)
    cD2 = np.cumsum(np.pad(D2, ((0, 0), (1, 0))).astype(np.int32), axis=1)
    cI = np.cumsum(np.pad(INKG, ((0, 0), (1, 0))).astype(np.int32), axis=1)
    cands = []
    Tlo, Thi = int(round(min(vocab) * K)), int(round(max(vocab) * K))
    for T in range(Thi, Tlo - 1, -1):                             # §43.7: every thickness in the READ range proposes
        v = T / K; thin = (T - px(2)) - px(3) < px(5)
        L = 2 * T                                                 # §43.1 rule: runs >= 2 x thickness (connectivity rejects junk)
        xs = np.arange(0, Ww - T)
        both = FF[:, xs] & FF[:, xs + T]
        a_, b_ = xs + px(3), xs + T - px(2)                               # interior columns [a_, b_)
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
                    strength = FF[r0:r1 + 1, xs[xi]].mean() + FF[r0:r1 + 1, xs[xi] + T].mean()
                    cands.append(dict(x=int(xs[xi]), T=T, v=v, r0=int(r0), r1=int(r1), s=float(strength), thin=thin))
        log(f"§RASTER_SCAN_RAW {tag} T={v}m ({T}px thin={thin}) min_run={L}px candidates={len(cands)-n0}")
    # W-S9b FIRST (on every raw candidate): face-centre thickness on the run rows = vocabulary value ± 1 px.
    # (Order matters, measured §43.2: suppression before this let thick false candidates on interior walls
    #  evict the true thin ones, then fail the thickness check themselves.)
    ver = []; rej = 0; nrel = [0]
    for c in cands:
        cols = np.arange(c['x'] - px(4), c['x'] + c['T'] + px(5))
        cols = cols[(cols >= 0) & (cols < Ww)]
        prof = INK[c['r0']:c['r1'] + 1, cols].mean(axis=0)
        mid = c['x'] + c['T'] / 2
        Lc = [i for i, x in enumerate(cols) if x <= mid and x <= c['x'] + px(4) and prof[i] >= 0.6]
        Rc = [i for i, x in enumerate(cols) if x > mid and x >= c['x'] + c['T'] - px(4) and prof[i] >= 0.6]
        if not Lc or not Rc: rej += 1; c['fate'] = 'thk_noface'; continue
        cl = sum(cols[i] * prof[i] for i in Lc) / sum(prof[i] for i in Lc)
        cr = sum(cols[i] * prof[i] for i in Rc) / sum(prof[i] for i in Rc)
        m = (cr - cl) / K
        near = min(vocab, key=lambda u: abs(u - m))               # the MEASUREMENT decides; the template only proposes
        if abs(m - near) * K <= px(1):
            if abs(near - c['v']) * K > 0.5: c['relabel'] = f"{c['v']:.3f}->{near}"; nrel[0] += 1
            c['v'] = near; c['src'] = 'READ'; c['thk_m'] = m; c['fl'] = cl; c['fr'] = cr; ver.append(c)
        elif abs(m - c['v']) * K <= px(1):                          # §43.7: consistent with its own template -> MEASURED
            c['v'] = round(m, 3); c['src'] = 'MEASURED'; c['thk_m'] = m; c['fl'] = cl; c['fr'] = cr; ver.append(c)
        else: rej += 1; c['fate'] = f'thk {m:.3f}'
    log(f"§RASTER_W-S9b {tag} verified={len(ver)} relabelled={nrel[0]} rejected_thickness={rej} of {len(cands)}")
    ver_all = list(ver)
    if not _vac:   # §52.1 the sheet's hatch decides, before suppression
        kept = []
        for c in ver:
            sc = hatch_score('V', c['fl'], c['fr'], c['r0'], c['r1'], HP) if tag == 'vertical' else hatch_score('H', c['r0'], c['r1'], c['fl'], c['fr'], HP)
            c['hatch'] = round(sc, 3)
            if sc >= HATCH_THR: kept.append(c)
            else:
                c['fate'] = 'nohatch'
                NOHATCH.append(dict(o='V' if tag == 'vertical' else 'H', thk=c['v'], src=c['src'], hatch=c['hatch'], len_m=round((c['r1'] - c['r0']) / K, 3),
                                    band_px=[round(c['fl'] + (ox if tag == 'vertical' else oy)), round(c['fr'] + (ox if tag == 'vertical' else oy))],
                                    run_px=[c['r0'] + (oy if tag == 'vertical' else ox), c['r1'] + (oy if tag == 'vertical' else ox)]))
        log(f"§RASTER_W-S52c {tag} verified={len(ver)} hatched={len(kept)} removed_no_hatch={len(ver)-len(kept)} (threshold {HATCH_THR}; every removed band in walls_nohatch.json)")
        ver = kept
    # non-max suppression among VERIFIED candidates: thick first, longest first; a candidate whose band
    # overlaps an accepted band (any thickness) on > 50 % of its rows is dropped
    def nms(vs, mark):
        vs = sorted(vs, key=lambda c: (-c['v'], -(c['r1'] - c['r0']), -c['s']))
        good = []
        for c in vs:
            ok = True
            for a in good:
                if c['x'] <= a['x'] + a['T'] + px(1) and a['x'] <= c['x'] + c['T'] + px(1):
                    ov = min(c['r1'], a['r1']) - max(c['r0'], a['r0']) + 1
                    if ov > 0.5 * (c['r1'] - c['r0'] + 1): ok = False; break
            if ok: good.append(c)
            if mark: c['fate'] = 'ok' if ok else 'nms'
        return good
    DRAWN[tag] = nms(ver_all, False)   # §52.1: the drawn bands before the hatch rule (walls_drawn.json, where §51's stack step looks)
    good = nms(ver, True)
    log(f"§RASTER_SCAN_NMS {tag} kept={len(good)} of {len(ver)}")
    ALL[tag] = cands
    return good

ALL = {}; DRAWN = {}
vert = scan(ink, inkg, KH, 'vertical')          # walls along y
hori = scan(ink.T.copy(), inkg.T.copy(), KV, 'horizontal')   # walls along x (transposed)

# rectangles in body px (x, y), inclusive; exterior strip rule; W-S9c connectivity (one function: the walls, and §52.1's drawn bands)
ext_v = max(vocab); ext_px = ext_v * KH
bw0, bh0 = X1 - X0 + 2 * M, Y1 - Y0 + 2 * M
tol = px(3)
def touch(a, b):
    return a['x0'] - tol <= b['x1'] and b['x0'] - tol <= a['x1'] and a['y0'] - tol <= b['y1'] and b['y0'] - tol <= a['y1']
def in_ext_strip(r):
    if r['o'] == 'V': return r['x0'] < M + ext_px + px(2) or r['x1'] > bw0 - M - ext_px - px(2)
    return r['y0'] < M + ext_px + px(2) or r['y1'] > bh0 - M - ext_px - px(2)
def network(vl, hl):
    rects = []
    for c in vl: rects.append(dict(o='V', x0=c['fl'], x1=c['fr'], y0=c['r0'], y1=c['r1'], v=c['v'], m=c['thk_m'], T=c['T'], src=c['src']))
    for c in hl: rects.append(dict(o='H', y0=c['fl'], y1=c['fr'], x0=c['r0'], x1=c['r1'], v=c['v'], m=c['thk_m'], T=c['T'], src=c['src']))
    # exterior strip rule: the outer ring strip (one exterior thickness from the body edge) belongs to the exterior
    # wall; a THINNER band inside it is window glazing/frame (§43.1 classed those rows P), logged as opening evidence
    glaz = [r for r in rects if r['v'] < ext_v and in_ext_strip(r)]
    rects = [r for r in rects if not (r['v'] < ext_v and in_ext_strip(r))]
    # W-S9c connectivity from the exterior ring; walls JOIN when they touch: face tolerance 2 px + 1 (§43.1)
    ext_thk = max(vocab) * KH
    seed = [i for i, r in enumerate(rects) if r['v'] == max(vocab) and (
            (r['o'] == 'V' and (r['x0'] < M + ext_thk / 2 or r['x1'] > bw0 - M - ext_thk / 2)) or
            (r['o'] == 'H' and (r['y0'] < M + ext_thk / 2 or r['y1'] > bh0 - M - ext_thk / 2)))]
    net = set(seed); front = list(seed)
    while front:
        i = front.pop()
        for j, r in enumerate(rects):
            if j not in net and touch(rects[i], r): net.add(j); front.append(j)
    return rects, net, glaz, seed
def to_mm(rects, net):
    return [dict(axis=r['o'], src=r.get('src', 'READ'), thk_chain_m=r['v'], thk_meas_m=round(r['m'], 4),
                 x0=(r['x0'] - M) / KH * 1000, x1=(r['x1'] - M) / KH * 1000, y0=(r['y0'] - M) / KV * 1000, y1=(r['y1'] - M) / KV * 1000) for r in (rects[j] for j in sorted(net))]
rects, net, glaz, seed = network(vert, hori)
_dr, _dn, glaz, _ = network(DRAWN['vertical'], DRAWN['horizontal'])   # glazing evidence = the thinner DRAWN bands in the exterior strip (they carry no hatch, §52.1)
log(f"§RASTER_SCAN_GLAZING thinner_bands_in_exterior_strip={len(glaz)} (removed as walls, kept as opening evidence) at " +
    ';'.join(f"{r['o']}:{(r['x0']+ox):.0f},{(r['y0']+oy):.0f}" for r in glaz))
log(f"§RASTER_W-S9c seeds_exterior={len(seed)} network={len(net)} isolated_YELLOW={len(rects)-len(net)} "
    f"verdict={'INCONCLUSIVE' if len(seed) < 4 else 'PASS'}")
for j, r in enumerate(rects):
    if j not in net:
        log(f"§RASTER_SCAN_YELLOW o={r['o']} thk={r['v']} x={r['x0']+ox:.0f}..{r['x1']+ox:.0f} y={r['y0']+oy:.0f}..{r['y1']+oy:.0f} reason=not_joined_to_ring")

# W-S9a recall of the §43.1 runs (mm2px is defined above, with the §52.1 hatch rule)
found = 0
for w in W1:
    p = mm2px(w)
    same = [rects[j] for j in net]
    if p['o'] == 'V':
        cov = np.zeros(int(p['y1'] - p['y0']) + 1, bool)
        for r in same:
            if r['x0'] - px(3) <= p['x1'] and p['x0'] - px(3) <= r['x1']:
                a = int(max(r['y0'], p['y0']) - p['y0']); b = int(min(r['y1'], p['y1']) - p['y0'])
                if b >= a: cov[a:b + 1] = True
    else:
        cov = np.zeros(int(p['x1'] - p['x0']) + 1, bool)
        for r in same:
            if r['y0'] - px(3) <= p['y1'] and p['y0'] - px(3) <= r['y1']:
                a = int(max(r['x0'], p['x0']) - p['x0']); b = int(min(r['x1'], p['x1']) - p['x0'])
                if b >= a: cov[a:b + 1] = True
    ok = cov.mean() >= 0.9; found += ok
    if not ok:
        # which stage lost it: best raw candidate of the same orientation overlapping this run's band
        tagn = 'vertical' if p['o'] == 'V' else 'horizontal'
        band = (p['x0'], p['x1']) if p['o'] == 'V' else (p['y0'], p['y1'])
        span = (p['y0'], p['y1']) if p['o'] == 'V' else (p['x0'], p['x1'])
        cs = [c for c in ALL[tagn] if c['x'] - px(3) <= band[1] and band[0] - px(3) <= c['x'] + c['T'] and
              min(c['r1'], span[1]) - max(c['r0'], span[0]) > 0]
        fates = {}
        for c in cs: fates[(c['v'], c.get('fate', '?'))] = fates.get((c['v'], c.get('fate', '?')), 0) + 1
        best = max(cs, key=lambda c: min(c['r1'], span[1]) - max(c['r0'], span[0])) if cs else None
        log(f"§RASTER_W-S9a TRACE band_px={band[0]:.0f}..{band[1]:.0f} span_px={span[0]:.0f}..{span[1]:.0f} raw={len(cs)} fates={fates} "
            f"best={None if best is None else (best['x'], best['T'], best['r0'], best['r1'], best.get('fate'))}")
        log(f"§RASTER_W-S9a MISS o={p['o']} thk={w['thk_chain_m']} mm=({w['x0']:.0f},{w['y0']:.0f})-({w['x1']:.0f},{w['y1']:.0f}) covered={cov.mean()*100:.0f}%")
log(f"§RASTER_W-S9a recall={found}/{len(W1)} verdict={'PASS' if found == len(W1) else 'FAIL'}")

# W-S9d totals + output (GREEN only), mm from the outer top-left corner
out = to_mm(rects, net)
per = {}
for w in out:
    L = (w['y1'] - w['y0']) if w['axis'] == 'V' else (w['x1'] - w['x0'])
    per[w['thk_chain_m']] = per.get(w['thk_chain_m'], 0) + L / 1000
from collections import Counter
log(f"§RASTER_SCAN_SRC " + ' '.join(f"{k}:{v}" for k, v in Counter(w['src'] for w in out).items()) +
    " measured_thk_m=" + ','.join(f"{w['thk_chain_m']}" for w in out if w['src'] == 'MEASURED'))
log(f"§RASTER_W-S9d walls={len(out)} total_m={sum(per.values()):.2f} per_thickness=" +
    ' '.join(f"{k}:{v:.2f}m" for k, v in sorted(per.items())))
json.dump(dict(origin='outer top-left corner, y down, mm', walls=out), open(os.path.join(work, 'walls_all.json'), 'w'), indent=1)
drawn = to_mm(_dr, _dn)
log(f"§RASTER_W-S52d drawn_bands (before the hatch rule, joined to the ring) = {len(drawn)} -> walls_drawn.json (where §51's stack step looks; never emitted as walls)")
json.dump(dict(origin='outer top-left corner, y down, mm', about='§52.1 drawn bands before the hatch rule: a place to look, not walls', walls=drawn), open(os.path.join(work, 'walls_drawn.json'), 'w'), indent=1)
json.dump(dict(about='§52.1 verified wall bands without the sheet hatch (page px), removed before suppression', threshold=HATCH_THR, period_px=HP, bands=NOHATCH), open(os.path.join(work, 'walls_nohatch.json'), 'w'), indent=0)
