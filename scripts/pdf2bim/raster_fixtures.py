# ⚠ DO NOT REMOVE — PDF2BIM_VECTOR_PROBE.md §52.5: sanitary fixtures from the plan's own symbols. Read the log after every run (§RASTER_FIXTURE lines).
# Implementing PDF2BIM_VECTOR_PROBE.md §52.5 — Witness: W-S52i (each fixture: kind, measured shape, the wall it backs onto), W-S52j (falsifier: a plan with no symbol -> 0)
# Usage: python3 -P raster_fixtures.py <plan workdir (chains.json, walls_all.json)> [<type template>]  -> <work>/fixtures.json
#   A drawn fixture = a closed shape (white region bounded by ink) whose size, fill share and inner drain mark fit one row of the type's
#   fixture_symbols table (data, measured). It backs onto the nearest wall face within back_wall_max_m (walls_all.json, this plan).
#   Nothing is placed for a shape that fits no row, or with no wall behind it: logged, never guessed.
import sys, os, json
import numpy as np
from PIL import Image
from collections import deque
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from raster_body import anchor_chains, body

def log(*a): print(*a, flush=True)
work = sys.argv[1]
TPL = sys.argv[2] if len(sys.argv) > 2 else os.path.join(os.path.dirname(os.path.abspath(__file__)), 'types', 'german_werkplan_efh.json')
FS = json.load(open(TPL)).get('fixture_symbols')
out_p = os.path.join(work, 'fixtures.json')
if os.path.exists(out_p): os.remove(out_p)
if not FS: log('§RASTER_FIXTURE verdict=VACUOUS (the type has no fixture_symbols table)'); sys.exit(0)
KINDS = {k: v for k, v in FS.items() if isinstance(v, dict)}
C = json.load(open(os.path.join(work, 'chains.json'))); W = json.load(open(os.path.join(work, 'walls_all.json')))['walls']
_, gh, gv = anchor_chains(C); X0, X1, Y0, Y1 = body(gh[0], gv[0]); KH, KV = C['scale_px_per_m']['H'], C['scale_px_per_m']['V']
g = np.asarray(Image.open(C['clean']).convert('L')).astype(int)
INK = g[Y0:Y1 + 1, X0:X1 + 1] < 215          # light ink: the fixture lines are thin (measured: at the Otsu cut the WC bowls leak open)
H_, W_ = INK.shape

def regions(free):
    """4-connected regions of `free` that do not touch the body edge: (y0, y1, x0, x1, pixels)"""
    lab = np.zeros(free.shape, np.int32); n = 0; out = []
    for y in range(H_):
        for x in np.where(free[y] & (lab[y] == 0))[0]:
            if lab[y, x]: continue
            n += 1; q = deque([(y, x)]); lab[y, x] = n; ys = []; xs = []; edge = False
            while q:
                cy, cx = q.popleft(); ys.append(cy); xs.append(cx)
                for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    yy, xx = cy + dy, cx + dx
                    if 0 <= yy < H_ and 0 <= xx < W_:
                        if free[yy, xx] and not lab[yy, xx]: lab[yy, xx] = n; q.append((yy, xx))
                    else: edge = True
            if not edge: out.append((min(ys), max(ys), min(xs), max(xs), n, len(ys)))
    return lab, out

lab, regs = regions(~INK)
cands = []; nun = 0
for y0, y1, x0, x1, n, cnt in regs:
    w_m, h_m = (x1 - x0 + 1) / KH, (y1 - y0 + 1) / KV
    L, S = max(w_m, h_m), min(w_m, h_m)
    if not (0.18 <= L <= 2.0 and S >= 0.12): continue
    m = lab[y0:y1 + 1, x0:x1 + 1] == n; fill = cnt / m.size
    if fill < 0.70: continue
    sub = INK[y0:y1 + 1, x0:x1 + 1]; mk = int((sub & ~m)[2:-2, 2:-2].sum()) if m.shape[0] > 4 and m.shape[1] > 4 else 0   # the drain / tap mark: ink inside the shape's box, 2 px in from its edges (it may touch the rim)
    mk_mm2 = mk * 1e6 / (KH * KV)   # the mark as an area: the print scale differs per sheet (measured: EG 49.8 px/m, OG 72.2 px/m)
    hit = [k for k, r in KINDS.items() if r['fill'][0] <= fill <= r['fill'][1] and r['long_m'][0] <= L <= r['long_m'][1] and r['short_m'][0] <= S <= r['short_m'][1]
           and L / S >= r['aspect_min'] and r['mark_mm2'][0] <= mk_mm2 <= r['mark_mm2'][1]]
    cx_mm, cy_mm = ((x0 + x1 + 1) / 2) / KH * 1000, ((y0 + y1 + 1) / 2) / KV * 1000
    if len(hit) != 1:
        if 0.18 <= S and fill >= 0.70: nun += 1
        continue
    cands.append(dict(kind=hit[0], centre_mm=[round(cx_mm, 1), round(cy_mm, 1)], size_mm=[round(w_m * 1000), round(h_m * 1000)], fill=round(fill, 3), mark_px=mk, mark_mm2=round(mk_mm2),
                      long_axis='x' if w_m >= h_m else 'y'))

# the wall each fixture backs onto: the nearest wall FACE (walls_all, this plan) within back_wall_max_m, across the shape's SHORT axis for a basin / bath
# (they stand with a long side to the wall) and its LONG axis for a WC (the bowl points away from the wall)
BMAX = FS.get('back_wall_max_m', 0.8) * 1000
def faces():
    for w in W:
        if w['axis'] == 'V': yield ('x', w['x0'], (w['y0'], w['y1'])); yield ('x', w['x1'], (w['y0'], w['y1']))
        else: yield ('y', w['y0'], (w['x0'], w['x1'])); yield ('y', w['y1'], (w['x0'], w['x1']))
out = []
for c in cands:
    cx, cy = c['centre_mm']; hw, hh = c['size_mm'][0] / 2, c['size_mm'][1] / 2
    across = ('x' if c['long_axis'] == 'x' else 'y') if c['kind'] == 'wc' else ('y' if c['long_axis'] == 'x' else 'x')   # the axis the wall is found along
    best = None
    for ax, v, (a, b) in faces():
        if ax != across: continue
        if ax == 'x':
            if not (a - 50 <= cy <= b + 50): continue
            d = (cx - hw) - v if v <= cx else v - (cx + hw); side = -1 if v <= cx else 1
        else:
            if not (a - 50 <= cx <= b + 50): continue
            d = (cy - hh) - v if v <= cy else v - (cy + hh); side = -1 if v <= cy else 1
        if -20 <= d <= BMAX and (best is None or d < best[0]): best = (d, ax, v, side)
    if best is None:
        log(f"§RASTER_FIXTURE kind={c['kind']} centre_mm=({cx:.0f},{cy:.0f}) size_mm={c['size_mm']} fill={c['fill']} mark_px={c['mark_px']} -> NOT PLACED (no wall face within {BMAX:.0f} mm across its {across} axis)")
        continue
    d, ax, v, side = best
    # facing = the direction from the wall into the room, sheet frame (x right, y DOWN), degrees: +x 0, +y 90, -x 180, -y 270
    facing = {('x', -1): 0, ('x', 1): 180, ('y', -1): 90, ('y', 1): 270}[(ax, side)]
    back = [v, cy] if ax == 'x' else [cx, v]
    c.update(back_mm=[round(back[0], 1), round(back[1], 1)], facing_deg=facing, gap_to_wall_mm=round(d, 1))
    out.append(c)
    log(f"§RASTER_FIXTURE kind={c['kind']} centre_mm=({cx:.0f},{cy:.0f}) size_mm={c['size_mm']} fill={c['fill']} mark_mm2={c['mark_mm2']} back_wall {ax}={v:.0f} gap={d:.0f} mm facing={facing} back_mm=({back[0]:.0f},{back[1]:.0f})")
from collections import Counter
log(f"§RASTER_W-S52i fixtures={len(out)} {dict(Counter(c['kind'] for c in out))} closed_shapes_considered={len(regs)} unclassified_compact={nun} verdict={'PASS' if out else 'VACUOUS (no symbol fits the table)'}")
json.dump(dict(spec='PDF2BIM_VECTOR_PROBE.md §52.5', origin='outer top-left corner, y down, mm', fixtures=out), open(out_p, 'w'), indent=1)
