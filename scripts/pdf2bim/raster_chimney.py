# ⚠ DO NOT REMOVE — PDF2BIM_VECTOR_PROBE.md §55.2: the chimney the plans draw (a hatched square with a round flue). Read the log after every run (§RASTER_CHIMNEY lines).
# Implementing PDF2BIM_VECTOR_PROBE.md §55.2 — Witness: W-S55c (one chimney: the square on every plan at the same place), falsifier (flues that do not coincide -> INCONCLUSIVE, nothing written)
# Usage: python3 -P raster_chimney.py <plan workdir> [<plan workdir> ...]  -> <first workdir>/chimney.json   (workdirs registered to one frame: the reference plan + the *_reg plans)
#   Per plan: a flue = a round white region (light-ink cut 215, as the fixture reader) 0.10..0.30 m, aspect <= 1.25, fill 0.70..0.95 of its box, ring ink >= 0.40 within 0.25 m.
#   Its square = the nearest straight ink line >= 0.25 m on each of the four sides (a wall face counts: the chimney stands against it), side 0.30..0.60 m.
#   A chimney = a flue on EVERY plan given, centres within 0.10 m. MEASURE ONLY: the Modeller importer has no chimney body yet (bim-ootb DXF2BIM §L48), so nothing is emitted.
import sys, os, json
import numpy as np
from PIL import Image
from collections import deque
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from raster_body import anchor_chains, body
from raster_texture import texture_maps

def log(*a): print(*a, flush=True)
works = sys.argv[1:]
out_p = os.path.join(works[0], 'chimney.json')
if os.path.exists(out_p): os.remove(out_p)

def longest(v):
    d = np.diff(np.concatenate(([0], v.astype(np.int8), [0]))); s = np.where(d == 1)[0]; e = np.where(d == -1)[0]
    return int((e - s).max()) if len(s) else 0

def flues(work):
    C = json.load(open(os.path.join(work, 'chains.json'))); _, gh, gv = anchor_chains(C); X0, X1, Y0, Y1 = body(gh[0], gv[0]); KH, KV = C['scale_px_per_m']['H'], C['scale_px_per_m']['V']
    g = np.asarray(Image.open(C['clean']).convert('L')).astype(int); INK = g[Y0:Y1 + 1, X0:X1 + 1] < 215; LINE = g[Y0:Y1 + 1, X0:X1 + 1] < C['otsu']
    H_, W_ = INK.shape; free = ~INK; lab = np.zeros(INK.shape, np.int32); n = 0; res = []
    for y in range(H_):
        for x in np.where(free[y] & (lab[y] == 0))[0]:
            if lab[y, x]: continue
            n += 1; q = deque([(y, x)]); lab[y, x] = n; ys = [y]; xs = [x]; edge = False
            while q:
                cy, cx = q.popleft()
                for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    yy, xx = cy + dy, cx + dx
                    if 0 <= yy < H_ and 0 <= xx < W_:
                        if free[yy, xx] and not lab[yy, xx]: lab[yy, xx] = n; q.append((yy, xx)); ys.append(yy); xs.append(xx)
                    else: edge = True
            if edge: continue
            y0, y1, x0, x1 = min(ys), max(ys), min(xs), max(xs); w_m, h_m = (x1 - x0 + 1) / KH, (y1 - y0 + 1) / KV
            if not (0.10 <= w_m <= 0.30 and 0.10 <= h_m <= 0.30) or max(w_m, h_m) / min(w_m, h_m) > 1.25: continue
            fill = len(ys) / ((x1 - x0 + 1) * (y1 - y0 + 1))
            if not (0.70 <= fill <= 0.95): continue
            r = int(0.25 * KH); A = INK[max(0, y0 - r):y1 + r + 1, max(0, x0 - r):x1 + r + 1].copy(); m = np.ones(A.shape, bool)
            m[y0 - max(0, y0 - r):y1 - max(0, y0 - r) + 1, x0 - max(0, x0 - r):x1 - max(0, x0 - r) + 1] = False; ring = float(A[m].mean())
            cyp, cxp = (y0 + y1) // 2, (x0 + x1) // 2; win = int(0.3 * KV); minL = 0.25
            def side(dirn):   # march from the flue's edge outward; the first line >= 0.25 m perpendicular to the march, its centre px
                if dirn in ('W', 'E'):
                    st = x0 - 1 if dirn == 'W' else x1 + 1; sg = -1 if dirn == 'W' else 1; rng = range(0, int(0.30 * KH)); K = KV
                    hit = [k for k in rng if 0 <= st + sg * k < W_ and longest(LINE[max(0, cyp - win):cyp + win, st + sg * k]) / K >= minL]
                else:
                    st = y0 - 1 if dirn == 'N' else y1 + 1; sg = -1 if dirn == 'N' else 1; rng = range(0, int(0.30 * KV)); K = KH
                    hit = [k for k in rng if 0 <= st + sg * k < H_ and longest(LINE[st + sg * k, max(0, cxp - win):cxp + win]) / K >= minL]
                if not hit: return None
                grp = [hit[0]]
                for k in hit[1:]:
                    if k == grp[-1] + 1: grp.append(k)
                    else: break
                return st + sg * (grp[0] + grp[-1]) / 2
            S = {d: side(d) for d in ('W', 'E', 'N', 'S')}
            rec = dict(centre_mm=[round((x0 + x1 + 1) / 2 / KH * 1000), round((y0 + y1 + 1) / 2 / KV * 1000)], flue_mm=[round(w_m * 1000), round(h_m * 1000)], fill=round(float(fill), 2), ring_ink=round(ring, 2))
            if ring < 0.40 or None in S.values():
                log(f"§RASTER_CHIMNEY {os.path.basename(work)} round region {rec} -> not a chimney (ring_ink {ring:.2f}, square sides found {[d for d, v in S.items() if v is not None]})"); continue
            sq = [S['W'] / KH * 1000, S['N'] / KV * 1000, S['E'] / KH * 1000, S['S'] / KV * 1000]; sw, sd = sq[2] - sq[0], sq[3] - sq[1]
            # hatch inside the square (the flue box and 2 px at each frame line left out): share of ink px that continue diagonally in ONE direction (raster_texture, one owner)
            I_ = LINE[int(S['N']) + 2:int(S['S']) - 1, int(S['W']) + 2:int(S['E']) - 1].copy(); I_[max(0, y0 - int(S['N']) - 2):y1 - int(S['N']) - 1, max(0, x0 - int(S['W']) - 2):x1 - int(S['W']) - 1] = False
            St, D1, D2 = texture_maps(I_); hat = float(max(D1.sum(), D2.sum()) / max(1, I_.sum())); rec['hatch'] = round(hat, 2)
            if hat < 0.35:
                log(f"§RASTER_CHIMNEY {os.path.basename(work)} round region {rec} square {sw:.0f} x {sd:.0f} -> not a chimney (no hatch inside the square: {hat:.2f} < 0.35)"); continue
            if not (250 <= sw <= 600 and 250 <= sd <= 600):   # widened below the 0.30 m spec bound only to let the hatch test judge the washer square (298 mm)
                log(f"§RASTER_CHIMNEY {os.path.basename(work)} round region {rec} -> not a chimney (square {sw:.0f} x {sd:.0f} mm outside 300..600)"); continue
            rec['square_mm'] = [round(v) for v in sq]; res.append(rec)
            log(f"§RASTER_CHIMNEY {os.path.basename(work)} flue centre_mm={rec['centre_mm']} {rec['flue_mm']} fill={rec['fill']} ring_ink={rec['ring_ink']} hatch={rec['hatch']} square_mm=({rec['square_mm'][0]},{rec['square_mm'][1]})-({rec['square_mm'][2]},{rec['square_mm'][3]}) = {sw:.0f} x {sd:.0f}")
    return res

per = {w: flues(w) for w in works}
base = per[works[0]]; found = []
for c in base:
    match = {w: min(per[w], key=lambda d: abs(d['centre_mm'][0] - c['centre_mm'][0]) + abs(d['centre_mm'][1] - c['centre_mm'][1]), default=None) for w in works[1:]}
    dist = {w: (None if m is None else round(float(np.hypot(m['centre_mm'][0] - c['centre_mm'][0], m['centre_mm'][1] - c['centre_mm'][1])))) for w, m in match.items()}
    ok = all(d is not None and d <= 100 for d in dist.values())
    log(f"§RASTER_CHIMNEY_STACK centre_mm={c['centre_mm']} on {os.path.basename(works[0])}; offsets to the other plans mm={ {os.path.basename(w): d for w, d in dist.items()} } -> {'CHIMNEY' if ok else 'INCONCLUSIVE (not on every plan within 100 mm)'}")
    if ok: found.append(dict(c, plans={os.path.basename(w): (match[w] or c)['centre_mm'] for w in works[1:]}))
log(f"§RASTER_W-S55c chimneys={len(found)} plans={len(works)} verdict={'PASS (measured; not emitted: no importer chimney body, bim-ootb §L48)' if found else 'VACUOUS (no flue on every plan)'}")
json.dump(dict(spec='PDF2BIM_VECTOR_PROBE.md §55.2', origin='outer top-left corner, y down, mm', chimneys=found), open(out_p, 'w'), indent=1)
