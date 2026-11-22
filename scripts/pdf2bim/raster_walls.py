# Implementing PDF2BIM_VECTOR_PROBE.md §43.1 — Witness: W-S7a, W-S7b, W-S7c (scope), W-S7d (falsifier)
# Usage: python3 -P raster_walls.py <workdir holding chains.json + page_clean.png>  > raster_walls.log
# Traces the walls that GREEN dimension chains cross, on a scanned plan. Never fills a gap; gaps are logged
# as opening candidates (faces present + no hatch = window-like; faces absent = door-like).
import sys, os, json
import numpy as np
from PIL import Image

def log(*a): print(*a, flush=True)

work = sys.argv[1]
C = json.load(open(os.path.join(work, 'chains.json')))
g = np.asarray(Image.open(C['clean']).convert('L')).astype(int)
OT = C['otsu']; GREY = 215                 # same thresholds as the probe (Otsu ink; grey-inclusive 215)
ink = g < OT; inkg = g < GREY
greens = [c for c in C['chains'] if c['verdict'] == 'GREEN']
gh = [c for c in greens if c['dir'] == 'H']; gv = [c for c in greens if c['dir'] == 'V']
if not gh or not gv:
    log(f"§RASTER_W-S7 verdict=VACUOUS green_H={len(gh)} green_V={len(gv)} (need one GREEN chain each way)"); sys.exit(0)
KH, KV = C['scale_px_per_m']['H'], C['scale_px_per_m']['V']
ch, cv = gh[0], gv[0]
# plan body = outer ticks of the two GREEN chains (page px)
X0, X1 = ch['ticks_x'][0], ch['ticks_x'][-1]
Y0, Y1 = cv['ticks_y'][0], cv['ticks_y'][-1]
log(f"§RASTER_BODY x={X0}..{X1} y={Y0}..{Y1} size_m={ (X1-X0)/KH:.3f}x{(Y1-Y0)/KV:.3f} chains_overall={ch['overall']}x{cv['overall']}")

def page_segs(c):
    """segments in PAGE order with page px [a, b] along the chain axis"""
    if c['dir'] == 'H':
        return [dict(a=s['L'], b=s['R'], v=s['v'], txt=s['txt']) for s in c['segs']]
    H = g.shape[0]
    return sorted([dict(a=H - 1 - s['R'], b=H - 1 - s['L'], v=s['v'], txt=s['txt']) for s in c['segs']], key=lambda s: s['a'])

def split_walls(segs, tag):
    vals = sorted(s['v'] for s in segs)
    lv = np.log(vals); k = int(np.argmax(np.diff(lv)))        # largest ratio gap separates walls from rooms
    cut = (vals[k] + vals[k + 1]) / 2
    log(f"§RASTER_WALLSPLIT {tag} values={vals} cut={cut:.3f} (largest ratio gap {vals[k]}->{vals[k+1]})")
    return [s for s in segs if s['v'] < cut]

def row_state(band_a, band_b, t, vertical):
    """state of one cross-section of a wall band at position t along its axis"""
    if vertical: line = lambda x: (ink[t, x], inkg[t, x])
    else: line = lambda x: (ink[x, t], inkg[x, t])
    fa = any(line(x)[0] for x in range(band_a - 2, band_a + 3))
    fb = any(line(x)[0] for x in range(band_b - 2, band_b + 3))
    inner = [line(x)[1] for x in range(band_a + 3, band_b - 2)]
    fill = (sum(inner) / len(inner)) if inner else None
    return fa, fb, fill

def inner_profile(a, b, t, vertical):
    return inkg[t, a + 3:b - 2] if vertical else inkg[a + 3:b - 2, t]

def trace(seg, vertical, lo, hi, tag):
    """Row classes: W = both faces + DIAGONAL texture inside (hatch moves 1 px per row);
    P = both faces + STRAIGHT texture (lines parallel to the wall: window glass/frame); - = faces absent.
    Thin bands (inner < 5 px) cannot show hatch: faces alone = W (stated). Smoothed by majority over one
    wall thickness of rows, then runs < 2 x thickness dropped."""
    a, b = seg['a'], seg['b']; thk_px = b - a
    n = hi - lo + 1
    faces = np.array([row_state(a, b, t, vertical)[:2] for t in range(lo, hi + 1)])
    both = faces[:, 0] & faces[:, 1]
    thin = (b - 2) - (a + 3) < 5
    diag = np.zeros(n); strt = np.zeros(n)
    if not thin:
        P = np.array([inner_profile(a, b, t, vertical) for t in range(lo, hi + 1)], dtype=bool)
        for i in range(n - 1):
            p, q = P[i], P[i + 1]
            if p.sum() == 0 or q.sum() == 0: continue
            strt[i] = (p & q).sum() / max(p.sum(), 1)
            diag[i] = max((p[1:] & q[:-1]).sum(), (p[:-1] & q[1:]).sum()) / max(p.sum(), 1)
        w = max(3, thk_px // 3)
        ker = np.ones(2 * w + 1) / (2 * w + 1)
        diag = np.convolve(diag, ker, 'same'); strt = np.convolve(strt, ker, 'same')
    kinds = []
    for i in range(n):
        if not both[i]: kinds.append('-')
        elif thin or diag[i] > strt[i]: kinds.append('W')
        else: kinds.append('P')
    # majority smoothing over one wall thickness of rows
    h = max(1, thk_px // 2); sm = []
    for i in range(n):
        win = kinds[max(0, i - h):i + h + 1]
        sm.append(max('W-P', key=win.count))
    s = ''.join(sm)
    runs = []; i = 0
    while i < len(s):
        j = i
        while j < len(s) and s[j] == s[i]: j += 1
        runs.append((s[i], lo + i, lo + j - 1)); i = j
    walls = [r for r in runs if r[0] == 'W' and r[2] - r[1] + 1 >= 2 * thk_px]
    wall_rows = sum(r[2] - r[1] + 1 for r in walls)
    log(f"§RASTER_WALLBAND {tag} band={a}..{b} thk_px={thk_px} chain={seg['txt']} ({seg['v']} m) thin={thin} "
        f"rows={n} W={s.count('W')} P={s.count('P')} none={s.count('-')} wall_runs={len(walls)} rows_in_runs={wall_rows}")
    return dict(a=a, b=b, v=seg['v'], thk_px=thk_px, vertical=vertical, runs=runs, walls=walls, kinds=s, lo=lo,
                wall_rows=wall_rows)

def measured_thk(t, k):
    """W-S7a: face-to-face distance measured on the wall rows (outermost face columns), m"""
    a, b = t['a'], t['b']; rows = [r for r in range(len(t['kinds'])) if t['kinds'][r] == 'W']
    if not rows: return None
    cols = range(a - 4, b + 5)
    prof = np.zeros(len(cols))
    for r in rows:
        pos = t['lo'] + r
        prof += np.array([ink[pos, x] if t['vertical'] else ink[x, pos] for x in cols])
    prof /= len(rows)
    strong = [cols[i] for i in range(len(cols)) if prof[i] >= 0.6]
    L = [x for x in strong if x <= a + 4]; R = [x for x in strong if x >= b - 4]
    if not L or not R: return None
    # centre of each face line (weighted by the profile)
    cl = sum(x * prof[x - cols[0]] for x in L) / sum(prof[x - cols[0]] for x in L)
    cr = sum(x * prof[x - cols[0]] for x in R) / sum(prof[x - cols[0]] for x in R)
    return (cr - cl) / k

# H chain -> vertical walls traced along y in [Y0, Y1]; V chain -> horizontal walls traced along x in [X0, X1]
traced = []
for c, vertical, lo, hi, K in ((ch, True, Y0, Y1, KH), (cv, False, X0, X1, KV)):
    segs = page_segs(c)
    for i, s in enumerate(split_walls(segs, f"dir={c['dir']}")):
        t = trace(s, vertical, lo, hi, f"{'V' if vertical else 'H'}wall{i}")
        t['ext'] = s is segs[0] or s is segs[-1]; t['K'] = K
        m = measured_thk(t, K)
        d = (m - s['v']) * 1000 if m else None
        ok = m is not None and abs(m - s['v']) * K <= 1.0   # ±1 px (spec W-S7a)
        t['thk_m'] = m
        log(f"§RASTER_W-S7a {'V' if vertical else 'H'}wall{i} chain={s['v']:.3f} measured={m if m is None else round(m,3)} "
            f"d={d if d is None else round(d)}mm verdict={'PASS' if ok else ('INCONCLUSIVE' if m is None else 'FAIL')}")
        traced.append(t)

# W-S7b ring: exterior walls; wall rows + window-like rows must span the body between the perpendicular exterior walls
ext = [t for t in traced if t['ext']]
for t in ext:
    s = t['kinds']; n = len(s)
    cover = (s.count('W') + s.count('P')) / n
    first = next((i for i, k in enumerate(s) if k == 'W'), None); last = n - 1 - next((i for i, k in enumerate(s[::-1]) if k == 'W'), n)
    thk = t['thk_px']
    reach = first is not None and first <= thk and last >= n - 1 - thk
    t['reach'] = reach
    gaps = [(r[0], r[1], r[2]) for r in t['runs'] if r[0] != 'W' and r[2] - r[1] + 1 > 1]
    log(f"§RASTER_W-S7b {'Vwall' if t['vertical'] else 'Hwall'} band={t['a']}..{t['b']} wall_or_window={cover*100:.1f}% "
        f"first_wall_row={first} last={last} of {n} reaches_both_ends={reach} openings=" +
        ';'.join(f"{k}{(b-a+1)/t['K']:.2f}m@{a}" for k, a, b in gaps if (b - a + 1) / t['K'] >= 0.4))
ring_ok = len(ext) == 4 and all(t['reach'] for t in ext)
log(f"§RASTER_W-S7b ring exterior_bands={len(ext)} verdict={'PASS' if ring_ok else ('INCONCLUSIVE' if len(ext) < 4 else 'FAIL')}")

# W-S7d falsifier: a band of the same width moved into the middle of each room segment must NOT read as wall
fals = []
for c, vertical, lo, hi in ((ch, True, Y0, Y1), (cv, False, X0, X1)):
    for s in page_segs(c):
        if s['v'] < 1.0: continue
        mid = (s['a'] + s['b']) // 2
        f = trace(dict(a=mid - 13, b=mid + 13, v=0, txt='FALSIFIER'), vertical, lo, hi, f"F{'V' if vertical else 'H'}{mid}")
        frac = f['wall_rows'] / len(f['kinds']); fals.append(frac)
        log(f"§RASTER_W-S7d band_mid={mid} wall_rows={frac*100:.1f}% verdict={'PASS' if frac <= 0.05 else 'FAIL'}")
log(f"§RASTER_W-S7d bands={len(fals)} max_wall_rows={max(fals)*100 if fals else 0:.1f}% verdict="
    f"{'INCONCLUSIVE' if not fals else ('PASS' if max(fals) <= 0.05 else 'FAIL')}")

# W-S7c scope: what this trace CANNOT see
log(f"§RASTER_W-S7c scope=walls crossed by GREEN chains only: {len(traced)} bands "
    f"({sum(1 for t in traced if t['vertical'])} vertical, {sum(1 for t in traced if not t['vertical'])} horizontal); "
    f"walls crossed only by YELLOW chains are NOT traced — junction check deferred until they close")

# output, mm, origin = outer top-left corner of the body, y down (as on the sheet)
out = []
for t in traced:
    K = t['K']
    for k, a, b in t['runs']:
        if k != 'W' or b - a + 1 < 2 * t['thk_px']: continue
        if t['vertical']:
            out.append(dict(kind='wall', axis='V', x0=(t['a'] - X0) / KH * 1000, x1=(t['b'] - X0) / KH * 1000,
                            y0=(a - Y0) / KV * 1000, y1=(b - Y0) / KV * 1000, thk_chain_m=t['v'], thk_meas_m=t['thk_m']))
        else:
            out.append(dict(kind='wall', axis='H', y0=(t['a'] - Y0) / KV * 1000, y1=(t['b'] - Y0) / KV * 1000,
                            x0=(a - X0) / KH * 1000, x1=(b - X0) / KH * 1000, thk_chain_m=t['v'], thk_meas_m=t['thk_m']))
json.dump(dict(origin='outer top-left corner, y down, mm', walls=out), open(os.path.join(work, 'walls.json'), 'w'), indent=1)
log(f"§RASTER_WALLS_OUT walls.json runs={len(out)} total_len_m={sum(max(w['x1']-w['x0'], w['y1']-w['y0']) for w in out)/1000:.2f}")
