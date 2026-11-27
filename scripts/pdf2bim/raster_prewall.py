# ⚠ DO NOT REMOVE — PDF2BIM_VECTOR_PROBE.md §55.1: the WC pre-wall (Vorwandinstallation) the plan draws behind a WC. Read the log after every run (§RASTER_PREWALL lines).
# Implementing PDF2BIM_VECTOR_PROBE.md §55.1 — Witness: W-S55a (a drawn pre-wall found: depth, run), W-S55b (falsifier: a WC with no parallel line -> none, its longest run logged)
# Usage: python3 -P raster_prewall.py <plan workdir (chains.json, fixtures.json)> [<type template>]  -> <work>/prewalls.json
#   For each WC the fixture reader placed (fixtures.json), scan from its back-wall face toward its rim one px at a time. The wall face's own line is left first;
#   then the first ink line PARALLEL to the wall with a run >= prewall.min_run_m, at a distance within prewall.depth_m of the face, is the pre-wall's front face.
#   The pre-wall = the strip from the wall face to that line's centre, along the wall over the line's run. No line -> nothing (logged, never guessed).
import sys, os, json
import numpy as np
from PIL import Image
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from raster_body import anchor_chains, body

def log(*a): print(*a, flush=True)
work = sys.argv[1]
TPL = sys.argv[2] if len(sys.argv) > 2 else os.path.join(os.path.dirname(os.path.abspath(__file__)), 'types', 'german_werkplan_efh.json')
PW = json.load(open(TPL)).get('prewall')
out_p = os.path.join(work, 'prewalls.json')
if os.path.exists(out_p): os.remove(out_p)
FJ = os.path.join(work, 'fixtures.json')
if not PW: sys.exit(log('§RASTER_PREWALL verdict=VACUOUS (the type has no prewall entry)'))
WCS = [f for f in json.load(open(FJ))['fixtures'] if f['kind'] == 'wc'] if os.path.exists(FJ) else []
if not WCS: sys.exit(log(f'§RASTER_PREWALL verdict=VACUOUS (no WC placed on this plan: fixtures.json {"absent" if not os.path.exists(FJ) else "has none"})'))
C = json.load(open(os.path.join(work, 'chains.json')))
_, gh, gv = anchor_chains(C); X0, X1, Y0, Y1 = body(gh[0], gv[0]); KH, KV = C['scale_px_per_m']['H'], C['scale_px_per_m']['V']
INK = np.asarray(Image.open(C['clean']).convert('L')).astype(int) < C['otsu']
RUN, (D0, D1) = PW['min_run_m'], PW['depth_m']

def longest(v):
    """(length px, start, end) of the longest ink run in a 1-D profile"""
    d = np.diff(np.concatenate(([0], v.astype(np.int8), [0]))); s = np.where(d == 1)[0]; e = np.where(d == -1)[0]
    if not len(s): return 0, 0, 0
    k = int(np.argmax(e - s)); return int(e[k] - s[k]), int(s[k]), int(e[k])

out = []
for f in WCS:
    cx, cy = f['centre_mm']; bx, by = f['back_mm']; fd = f['facing_deg']
    wall_v = fd in (0, 180)                       # the back wall is vertical (x = bx) when the WC faces +x / -x
    K_a, K_l = (KH, KV) if wall_v else (KV, KH)   # across the wall / along it
    sgn = 1 if fd in (0, 90) else -1              # sheet frame, y down: facing 0 = +x, 90 = +y
    face_px = (X0 + bx / 1000 * KH) if wall_v else (Y0 + by / 1000 * KV)
    rim_mm = (cx - sgn * f['size_mm'][0] / 2) if wall_v else (cy - sgn * f['size_mm'][1] / 2)
    lc = (Y0 + cy / 1000 * KV) if wall_v else (X0 + cx / 1000 * KH); half = int(0.7 * K_l)   # the profile along the wall: +-0.7 m about the WC
    n_max = int(round(abs(rim_mm - (bx if wall_v else by)) / 1000 * K_a))
    prof = []
    for k in range(n_max + 1):
        p = int(round(face_px + sgn * k))
        v = INK[int(lc) - half:int(lc) + half, p] if wall_v else INK[p, int(lc) - half:int(lc) + half]
        L, a, b = longest(v); prof.append((k, L / K_l, a, b))
    k = 0
    while k < len(prof) and prof[k][1] >= RUN: k += 1          # leave the wall face's own line
    grp = []
    for kk, L, a, b in prof[k:]:
        d_m = kk / K_a
        if L >= RUN and D0 <= d_m <= D1: grp.append((kk, L, a, b))
        elif grp: break
    best_other = max([L for kk, L, a, b in prof[k:] if not (grp and grp[0][0] <= kk <= grp[-1][0])] or [0])
    tag = f"wc centre_mm=({cx:.0f},{cy:.0f}) facing={fd} back_wall {'x' if wall_v else 'y'}={bx if wall_v else by:.0f}"
    if not grp:
        log(f"§RASTER_PREWALL {tag} -> NONE (no line parallel to the wall >= {RUN} m within {D0}..{D1} m; longest parallel run off the face {best_other:.2f} m)")
        continue
    kf = (grp[0][0] + grp[-1][0]) / 2                            # the line's centre px (a drawn line is 2-3 px wide at this print: its centre is the face, unbiased)
    kL = max(grp, key=lambda g: g[1]); a_px, b_px = int(lc) - half + kL[2], int(lc) - half + kL[3]
    depth = kf / K_a * 1000
    lo, hi = sorted((bx if wall_v else by, (bx if wall_v else by) + sgn * depth))
    al0, al1 = ((a_px - Y0) / KV * 1000, (b_px - Y0) / KV * 1000) if wall_v else ((a_px - X0) / KH * 1000, (b_px - X0) / KH * 1000)
    r = dict(axis='V' if wall_v else 'H', x0=lo, x1=hi, y0=al0, y1=al1) if wall_v else dict(axis='H', x0=al0, x1=al1, y0=lo, y1=hi)
    r = {k_: (round(v, 1) if isinstance(v, float) else v) for k_, v in r.items()}
    r.update(depth_mm=round(depth), run_mm=round(kL[1] * 1000), line_px=[grp[0][0], grp[-1][0]], height_m=PW['height_m'], height_source=PW['height_source'], wc_centre_mm=f['centre_mm'])
    out.append(r)
    log(f"§RASTER_PREWALL {tag} -> PREWALL front line px +{grp[0][0]}..+{grp[-1][0]} = +{grp[0][0] / K_a * 1000:.0f}..+{grp[-1][0] / K_a * 1000:.0f} mm from the face, depth (line centre) {depth:.0f} mm, run {kL[1]:.3f} m, rect_mm=({r['x0']},{r['y0']})-({r['x1']},{r['y1']}) "
        f"height {PW['height_m']} m ({PW['height_source']})")
log(f"§RASTER_W-S55a prewalls={len(out)} of wcs={len(WCS)} verdict={'PASS' if out else 'NONE DRAWN (every WC logged above)'}")
json.dump(dict(spec='PDF2BIM_VECTOR_PROBE.md §55.1', origin='outer top-left corner, y down, mm', prewalls=out), open(out_p, 'w'), indent=1)
