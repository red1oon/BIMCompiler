# Implementing PDF2BIM_VECTOR_PROBE.md §43.3 — Witness: W-S10 (room area F + perimeter U per room)
# Usage: python3 -P raster_rooms.py <workdir with chains.json + walls_all.json> <stamps.json>  > raster_rooms.log
# Floods the rooms bounded by the §43.2 wall network (door gaps closed between collinear same-thickness pieces)
# and compares each room with its printed F / U. No tolerance is assumed: deltas are printed, a shared factor
# is REPORTED (never applied), outliers are named as wall-defect candidates.
import sys, os, json
from collections import deque
import numpy as np

def log(*a): print(*a, flush=True)

work, stamps_path = sys.argv[1], sys.argv[2]
C = json.load(open(os.path.join(work, 'chains.json')))
WA = json.load(open(os.path.join(work, 'walls_all.json')))['walls']
ST = json.load(open(stamps_path))
KH, KV = C['scale_px_per_m']['H'], C['scale_px_per_m']['V']
gh = [c for c in C['chains'] if c['verdict'] == 'GREEN' and c['dir'] == 'H'][0]
gv = [c for c in C['chains'] if c['verdict'] == 'GREEN' and c['dir'] == 'V'][0]
X0, X1 = gh['ticks_x'][0], gh['ticks_x'][-1]; Y0, Y1 = gv['ticks_y'][0], gv['ticks_y'][-1]
Wpx, Hpx = X1 - X0 + 1, Y1 - Y0 + 1
log(f"§RASTER_ROOMS_IN walls={len(WA)} stamps={len(ST['rooms'])} source={ST['_source'][:40]}...")

def px(w):  # mm -> body px rectangle (inclusive)
    return (int(round(w['x0'] / 1000 * KH)), int(round(w['x1'] / 1000 * KH)),
            int(round(w['y0'] / 1000 * KV)), int(round(w['y1'] / 1000 * KV)))

wall = np.zeros((Hpx, Wpx), bool)
R = [dict(w=w, r=px(w)) for w in WA]
for q in R:
    x0, x1, y0, y1 = q['r']
    wall[max(0, y0):min(Hpx, y1 + 1), max(0, x0):min(Wpx, x1 + 1)] = True
# the body edge is the outer face of the exterior ring: everything outside is not a room
wall[0, :] = wall[-1, :] = True; wall[:, 0] = wall[:, -1] = True

# close door gaps: two pieces, same axis + thickness, bands aligned (faces within 3 px), gap along the axis
gaps = []
for i in range(len(R)):
    for j in range(len(R)):
        a, b = R[i], R[j]
        if i == j or a['w']['axis'] != b['w']['axis'] or a['w']['thk_chain_m'] != b['w']['thk_chain_m']: continue
        ax0, ax1, ay0, ay1 = a['r']; bx0, bx1, by0, by1 = b['r']
        if a['w']['axis'] == 'H':
            if abs(ay0 - by0) > 3 or abs(ay1 - by1) > 3 or not (ax1 < bx0): continue
            between = [q for q in R if q is not a and q is not b and q['w']['axis'] == 'H' and abs(q['r'][2] - ay0) <= 3
                       and q['r'][0] < bx0 and q['r'][1] > ax1]
            if between: continue
            gaps.append(('H', a['w']['thk_chain_m'], (bx0 - ax1) / KH, (ax1, bx0, min(ay0, by0), max(ay1, by1))))
        else:
            if abs(ax0 - bx0) > 3 or abs(ax1 - bx1) > 3 or not (ay1 < by0): continue
            between = [q for q in R if q is not a and q is not b and q['w']['axis'] == 'V' and abs(q['r'][0] - ax0) <= 3
                       and q['r'][2] < by0 and q['r'][3] > ay1]
            if between: continue
            gaps.append(('V', a['w']['thk_chain_m'], (by0 - ay1) / KV, (min(ax0, bx0), max(ax1, bx1), ay1, by0)))
# keep only the NEAREST neighbour gap per piece end (a gap must not jump over another piece)
gaps.sort(key=lambda g: g[2])
for o, t, wm, (p0, p1, q0, q1) in gaps:
    if o == 'H': wall[max(0, q0):q1 + 1, p0:p1 + 1] = True
    else: wall[q0:q1 + 1, max(0, p0):p1 + 1] = True
log(f"§RASTER_ROOMS_GAPS closed={len(gaps)} widths_m=" + ','.join(f"{o}{t}:{w:.2f}" for o, t, w, _ in gaps))

# flood free space (4-connectivity)
lab = np.zeros((Hpx, Wpx), np.int32); comps = []
for y in range(Hpx):
    for x in range(Wpx):
        if wall[y, x] or lab[y, x]: continue
        n = len(comps) + 1; q = deque([(y, x)]); lab[y, x] = n; cnt = 0; ex = ey = 0
        while q:
            cy, cx = q.popleft(); cnt += 1
            for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                yy, xx = cy + dy, cx + dx
                if 0 <= yy < Hpx and 0 <= xx < Wpx:
                    if wall[yy, xx]:
                        if dx: ex += 1
                        else: ey += 1
                    elif not lab[yy, xx]:
                        lab[yy, xx] = n; q.append((yy, xx))
        comps.append(dict(n=n, area=cnt / (KH * KV), per=ex / KV + ey / KH))
for c in comps:
    ys, xs = np.where(lab == c['n'])
    c['bbox_mm'] = (round(xs.min() / KH * 1000), round(ys.min() / KV * 1000), round((xs.max() + 1) / KH * 1000), round((ys.max() + 1) / KV * 1000))
    c['fill'] = len(xs) / ((xs.max() - xs.min() + 1) * (ys.max() - ys.min() + 1))   # 1.0 = rectangle
big = [c for c in comps if c['area'] >= 1.0]
log(f"§RASTER_ROOMS_COMPONENTS all={len(comps)} >=1m2={len(big)} areas=" + ','.join(f"{c['area']:.2f}" for c in sorted(big, key=lambda c: -c['area'])))

# W-S10 per stamped room
rows = []
for r in ST['rooms']:
    x, y = r['at'][0] - X0, r['at'][1] - Y0
    n = lab[y, x] if 0 <= y < Hpx and 0 <= x < Wpx else 0
    if not n:
        log(f"§RASTER_W-S10 room={r['name']} verdict=YELLOW reason=stamp_point_on_wall_or_outside"); continue
    c = comps[n - 1]
    sharing = [s['name'] for s in ST['rooms'] if s is not r and 0 <= s['at'][1] - Y0 < Hpx and 0 <= s['at'][0] - X0 < Wpx
               and lab[s['at'][1] - Y0, s['at'][0] - X0] == n]
    fmid = sum(r['F']) / 2; umid = sum(r['U']) / 2
    rows.append(dict(name=r['name'], F=fmid, A=c['area'], U=umid, P=c['per'], share=sharing))
    log(f"§RASTER_W-S10 room={r['name']} printed_F={r['F']} computed={c['area']:.2f} ratio={c['area']/fmid:.4f} "
        f"printed_U={r['U']} computed={c['per']:.2f} ratio={c['per']/umid:.4f} shares_component_with={sharing or '-'} bbox_mm={c['bbox_mm']} rect_fill={c['fill']:.3f}")
solo = [q for q in rows if not q['share']]
if not solo:
    log("§RASTER_W-S10 verdict=VACUOUS no room has its own component"); sys.exit(0)
ra = np.array([q['A'] / q['F'] for q in solo]); ru = np.array([q['P'] / q['U'] for q in solo])
med = float(np.median(ra)); mad = float(np.median(np.abs(ra - med)))
log(f"§RASTER_W-S10_FACTOR area_ratio median={med:.4f} MAD={mad:.4f} min={ra.min():.4f} max={ra.max():.4f} "
    f"| perimeter_ratio median={np.median(ru):.4f} min={ru.min():.4f} max={ru.max():.4f} (REPORTED, not applied)")
for q in solo:
    out = abs(q['A'] / q['F'] - med) > max(3 * mad, 0.01)
    log(f"§RASTER_W-S10_ROOM {q['name']} area_ratio={q['A']/q['F']:.4f} {'OUTLIER -> wall defect candidate' if out else 'within shared spread'}")
merged = [q for q in rows if q['share']]
log(f"§RASTER_W-S10 judged={len(solo)} merged_rooms={len(merged)} (a missing wall or an open plan) "
    f"verdict={'PASS' if all(abs(q['A']/q['F'] - med) <= max(3*mad, 0.01) for q in solo) and not merged else 'PARTIAL'}")
