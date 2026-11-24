# Implementing PDF2BIM_VECTOR_PROBE.md §43.19 + §52.4 — Witness: W-S20 (a notched corner closed by glazing + a post), W-S52h (a glazed corner: the ring continues as glazing, no hatch)
# Usage: python3 -P raster_notch.py <plan workdir (chains.json, walls.json)> [<type template>]  > raster_notch.log ; writes <work>/notch.json
# A corner where BOTH exterior sides stop > 1 m short is a notch (e.g. a covered terrace). Inside it: long straight lines = glazing,
# a hatched square at their crossing = the post (texture rule: raster_texture.py). Measured, then sized to the type's wall series.
import sys, os, json
import numpy as np
from PIL import Image
from collections import deque
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from raster_body import anchor_chains, body
from raster_texture import texture_maps, hatch_period, hatch_score

def log(*a): print(*a, flush=True)

work = sys.argv[1]
TPL = sys.argv[2] if len(sys.argv) > 2 else os.path.join(os.path.dirname(os.path.abspath(__file__)), 'types', 'german_werkplan_efh.json')
WS = json.load(open(TPL))['wall_series']
out_p = os.path.join(work, 'notch.json')
if os.path.exists(out_p): os.remove(out_p)
C = json.load(open(os.path.join(work, 'chains.json'))); W = json.load(open(os.path.join(work, 'walls.json')))['walls']
_, gh, gv = anchor_chains(C); X0, X1, Y0, Y1 = body(gh[0], gv[0])
K = C['scale_px_per_m']['H']; BW, BD = gh[0]['overall'] * 1000, gv[0]['overall'] * 1000
g = np.asarray(Image.open(C['clean']).convert('L')).astype(int); ink = g < C['otsu']; inkg = g < 215
ext = max(w['thk_chain_m'] for w in W) * 1000; E = [w for w in W if w['thk_chain_m'] * 1000 == ext]
PX = lambda mm: X0 + mm / 1000 * K; PY = lambda mm: Y0 + mm / 1000 * K; MM = lambda p, o: (p - o) / K * 1000
_, D1, D2 = texture_maps(inkg); DIAG = D1 | D2

def side_end(side):
    """how far the exterior runs of one side reach toward each corner (mm along the side)"""
    if side in 'NS':
        ws = [w for w in E if w['axis'] == 'H' and ((w['y0'] < BD / 2) == (side == 'N'))]; return min(w['x0'] for w in ws), max(w['x1'] for w in ws)
    ws = [w for w in E if w['axis'] == 'V' and ((w['x0'] < BW / 2) == (side == 'W'))]; return min(w['y0'] for w in ws), max(w['y1'] for w in ws)

def band(axis, at_lo, at_hi, span_lo, span_hi):
    """rows (axis H) / cols (axis V) in [at_lo, at_hi] mm whose ink covers >= 70 % of [span_lo, span_hi] mm; the cluster nearest at_hi"""
    if axis == 'H':
        rows = range(int(PY(at_lo)), int(PY(at_hi)) + 1); a, b = int(PX(span_lo)), int(PX(span_hi)); cov = {r: ink[r, a:b].mean() for r in rows}
    else:
        rows = range(int(PX(at_lo)), int(PX(at_hi)) + 1); a, b = int(PY(span_lo)), int(PY(span_hi)); cov = {r: ink[a:b, r].mean() for r in rows}
    hit = [r for r in rows if cov[r] >= 0.45]
    if not hit: return None
    cl = [[hit[0]]]
    for r in hit[1:]:
        (cl[-1].append(r) if r - cl[-1][-1] <= 3 else cl.append([r]))
    cl = [c for c in cl if max(cov[r] for r in c) >= 0.70]          # a band holds at least one near-continuous line
    if not cl: return None
    ref = PY(at_hi) if axis == 'H' else PX(at_hi)
    c = min(cl, key=lambda c: abs((c[0] + c[-1]) / 2 - ref))
    return dict(p0=c[0], p1=c[-1], lines=len(c), cover=round(float(np.mean([cov[r] for r in c])), 2))

SERIES = lambda v: WS['module_mm'] * round((v - WS['joint_mm']) / WS['module_mm']) + WS['joint_mm']

# §52.4 GLAZED CORNER (owner 2026-11-24: "the corner ... where the kitchen is"): both exterior sides stop > 1 m short of the corner and the
# exterior strip beyond each end holds solid straight lines but NO hatch (the sheet's own hatch, raster_texture.hatch_score, judged against
# the exterior walls of the same sheet) -> the ring continues as glazing: one curtain-wall run per side, across the strip's line pairs
# (outermost to innermost solid line inside the strip), meeting as an L at the corner (no post: none is drawn there).
_EB = [(w['axis'], PX(w['x0']), PX(w['x1']), PY(w['y0']), PY(w['y1'])) for w in E]
HPn, _ = hatch_period(ink, _EB); _FACE = max(1, round(2 * K / 72.24))   # the face allowance scales with the print (2 px at the OG's 72 px/m)
def _hs(o, x0, x1, y0, y1): return hatch_score(ink, o, x0, x1, y0, y1, HPn, 2, 2, _FACE)
EXT_H = min(_hs(*b) for b in _EB) if HPn else 0.0
def strip_lines(side, lo, hi):
    """the solid lines (longest run >= 70 % of [lo, hi]) inside the exterior strip of a side, as page rows / cols"""
    if side in 'NS':
        y0, y1 = (0, ext) if side == 'N' else (BD - ext, BD); a, b = int(PX(lo)), int(PX(hi))
        return [r for r in range(int(PY(y0)), int(PY(y1)) + 1) if longest_run(ink[r, a:b]) >= 0.7 * (b - a)]
    x0, x1 = (0, ext) if side == 'W' else (BW - ext, BW); a, b = int(PY(lo)), int(PY(hi))
    return [c for c in range(int(PX(x0)), int(PX(x1)) + 1) if longest_run(ink[a:b, c]) >= 0.7 * (b - a)]
def longest_run(v):
    d = np.diff(np.concatenate(([0], v.astype(np.int8), [0]))); st, en = np.where(d == 1)[0], np.where(d == -1)[0]
    return int((en - st).max()) if len(st) else 0
def glazed_corner(corner, hx0, hx1, vy0, vy1):
    hs, vs = corner[0], corner[1]
    hlo, hhi = (hx1, BW) if 'E' in corner else (0, hx0)          # along the N/S side, from the wall end to the corner
    vlo, vhi = (vy1, BD) if 'S' in corner else (0, vy0)          # along the E/W side
    sy0, sy1 = (0, ext) if hs == 'N' else (BD - ext, BD); sx0, sx1 = (BW - ext, BW) if 'E' in corner else (0, ext)
    ha, hb = (hlo, hhi - ext) if 'E' in corner else (hlo + ext, hhi)   # along the N/S strip beyond the wall end, short of the E/W strip
    va, vb = (vlo + ext, vhi) if 'N' in corner else (vlo, vhi - ext)   # along the E/W strip beyond the wall end, short of the N/S strip
    sh_h = _hs('H', PX(ha), PX(hb), PY(sy0), PY(sy1)); sh_v = _hs('V', PX(sx0), PX(sx1), PY(va), PY(vb))
    thr = 0.5 * EXT_H
    lh, lv = strip_lines(hs, ha, hb), strip_lines(vs, va, vb)
    glazed = HPn > 0 and EXT_H >= 0.40 and sh_h < thr and sh_v < thr and len(lh) >= 2 and len(lv) >= 2
    log(f"§RASTER_W-S52h corner={corner} strip_beyond hatch H={sh_h:.2f} V={sh_v:.2f} vs exterior walls min {EXT_H:.2f} (period {HPn:.0f} px; unhatched < {thr:.2f}) "
        f"solid lines H={len(lh)} V={len(lv)} -> {'GLAZED CORNER' if glazed else 'not glazed (stated: wall the tracing missed, or unread)'}")
    if not glazed: return None
    hy0, hy1 = max(sy0, MM(min(lh), Y0)), min(sy1, MM(max(lh) + 1, Y0)); vx0, vx1 = max(sx0, MM(min(lv), X0)), min(sx1, MM(max(lv) + 1, X0))   # inside the strip (a line pixel can round 1 px over its edge)
    if 'E' in corner: H = dict(axis='H', x0=hlo, x1=vx1, y0=hy0, y1=hy1)        # the N/S run reaches the far face of the E/W run: an L, no overlap below
    else: H = dict(axis='H', x0=vx0, x1=hhi, y0=hy0, y1=hy1)
    if 'N' in corner: V = dict(axis='V', x0=vx0, x1=vx1, y0=hy1, y1=vhi)
    else: V = dict(axis='V', x0=vx0, x1=vx1, y0=vlo, y1=hy0)
    for q in (H, V): log(f"§RASTER_NOTCH_CURTAIN corner={corner} glazed axis={q['axis']} mm=({q['x0']:.0f},{q['y0']:.0f})-({q['x1']:.0f},{q['y1']:.0f}) thickness={(q['y1'] - q['y0']) if q['axis'] == 'H' else (q['x1'] - q['x0']):.0f} mm (outermost..innermost solid line in the strip)")
    return dict(corner=corner, notch=False, glazed=True, verdict='FOUND', post=None, curtain=[H, V])
res = []
for corner in ('NE', 'SE', 'SW', 'NW'):
    h_side = corner[0]
    hx0, hx1 = side_end(h_side); vy0, vy1 = side_end(corner[1])
    short_h = (BW - hx1) if 'E' in corner else hx0; short_v = (BD - vy1) if 'S' in corner else vy0
    def longest(v):
        d = np.diff(np.concatenate(([0], v.astype(np.int8), [0]))); st, en = np.where(d == 1)[0], np.where(d == -1)[0]
        return int((en - st).max()) if len(st) else 0
    def ring_empty(side, lo, hi):   # the exterior band beyond the wall end holds no SOLID line (longest run >= 30 % of the span); dashed = overhead outline
        if hi - lo < 200: return True
        if side in 'NS':
            y0, y1 = (0, ext) if side == 'N' else (BD - ext, BD); a, b = int(PX(lo)), int(PX(hi))
            rr = range(int(PY(y0)) + (3 if side == 'N' else 0), int(PY(y1)) + 1 - (3 if side == 'S' else 0))   # the outer 3 px = an outline from above, not the band
            solid = [r for r in rr if longest(ink[r, a:b]) >= 0.3 * (b - a)]
        else:
            x0, x1 = (0, ext) if side == 'W' else (BW - ext, BW); a, b = int(PY(lo)), int(PY(hi))
            cc = range(int(PX(x0)) + (3 if side == 'W' else 0), int(PX(x1)) + 1 - (3 if side == 'E' else 0))
            solid = [c for c in cc if longest(ink[a:b, c]) >= 0.3 * (b - a)]
        return not solid
    eh = ring_empty(h_side, hx1, BW) if 'E' in corner else ring_empty(h_side, 0, hx0)
    ev = ring_empty(corner[1], vy1, BD) if 'S' in corner else ring_empty(corner[1], 0, vy0)
    notch = short_h > 1000 and short_v > 1000 and eh and ev
    log(f"§RASTER_NOTCH corner={corner} {h_side}-wall stops {short_h:.0f} mm short, {corner[1]}-wall {short_v:.0f} mm short ring_beyond_empty={eh}/{ev} -> notch={notch}")
    if not notch and short_h > 1000 and short_v > 1000 and not eh and not ev:   # §52.4 the ring CONTINUES beyond both wall ends: glazing, or wall the tracing missed
        gz = glazed_corner(corner, hx0, hx1, vy0, vy1)
        if gz: res.append(gz); continue
    if not notch: res.append(dict(corner=corner, notch=False)); continue
    if corner != 'SE': log(f"§RASTER_NOTCH corner={corner} geometry not implemented for this corner (only SE is spec'd by a case)"); continue
    xs, ye = hx1, vy1                                     # S wall end (x), E wall end (y)
    gH = band('H', ye - 1000, ye, xs, BW - ext)           # glazing running E-W toward the E wall
    gV = band('V', xs - 1000, xs, ye, BD - ext)           # glazing running N-S toward the S wall
    log(f"§RASTER_W-S20b corner=SE glazing_H={gH} glazing_V={gV}")
    if not gH or not gV: res.append(dict(corner=corner, notch=True, verdict='INCONCLUSIVE')); continue
    cy, cx = (gH['p0'] + gH['p1']) / 2, (gV['p0'] + gV['p1']) / 2
    def line_start(axis, b, end_mm):   # median start (px) of the band's lines whose run reaches the wall at end_mm
        starts = []; e = int(PX(end_mm) if axis == 'H' else PY(end_mm))
        for r in range(b['p0'], b['p1'] + 1):
            v = ink[r, :e + 3] if axis == 'H' else ink[:e + 3, r]
            k = e + 2
            while k > 0 and not v[k]: k -= 1                    # the run touching the wall end
            if e - k > 4: continue
            while k > 0 and (v[k] or v[k - 1] or (k > 1 and v[k - 2])): k -= 1   # follow it back, bridging 2 px frame breaks
            starts.append(k)
        return float(np.median(starts)) if starts else None, len(starts)
    sx, nx = line_start('H', gH, BW - ext); sy, ny = line_start('V', gV, BD - ext)
    if sx is None or sy is None:
        log(f"§RASTER_W-S20c post INCONCLUSIVE (glazing line starts: H {nx}, V {ny})"); sx = sy = None
    tol = 1000 / K; post = None; pcx, pcy = MM(cx, X0), MM(cy, Y0)
    if sx is not None and sy is not None:
        hx, hy = 2 * MM(sx, cx), 2 * MM(sy, cy); agree = abs(hx - hy) <= tol
        log(f"§RASTER_W-S20c post from the glazing ends: size along x {hx:.0f} mm ({nx} lines), along y {hy:.0f} mm ({ny} lines), agree={agree} (1px={tol:.1f})")
    else: agree = False
    if not agree: log(f"§RASTER_W-S20c post NOT BUILT (stop rule, §43.19 run 5): curtain walls meet at the crossing ({pcx:.0f},{pcy:.0f}) mm")
    if agree:
        meas = (hx + hy) / 2; nom = SERIES(meas); cls = 'STANDARD' if abs(meas - nom) <= tol else 'STANDARD-DEFAULT'
        post = dict(x0=pcx - nom / 2, x1=pcx + nom / 2, y0=pcy - nom / 2, y1=pcy + nom / 2, meas_mm=[round(hx), round(hy)], nominal_mm=[nom, nom], cls=cls)
        log(f"§RASTER_W-S20c post measured {meas:.0f} mm -> wall series {nom} (1px={tol:.1f}) class={cls} centre_mm=({pcx:.0f},{pcy:.0f})")
    hy0, hy1, vx0, vx1 = MM(gH['p0'], Y0), MM(gH['p1'] + 1, Y0), MM(gV['p0'], X0), MM(gV['p1'] + 1, X0)
    curt = [dict(axis='H', x0=post['x1'] if post else vx0, x1=BW - ext, y0=hy0, y1=hy1),     # without a post the two runs overlap at the crossing (an L corner)
            dict(axis='V', x0=vx0, x1=vx1, y0=post['y1'] if post else hy1, y1=BD - ext)]   # no post: V starts where H ends (no overlap)
    for q in curt: log(f"§RASTER_NOTCH_CURTAIN axis={q['axis']} mm=({q['x0']:.0f},{q['y0']:.0f})-({q['x1']:.0f},{q['y1']:.0f}) thickness={(q['y1'] - q['y0']) if q['axis'] == 'H' else (q['x1'] - q['x0']):.0f} mm")
    res.append(dict(corner=corner, notch=True, verdict='FOUND', post=post, curtain=curt))
found = [x for x in res if x.get('verdict') == 'FOUND' and x['notch']]; fals = [x for x in res if not x['notch'] and not x.get('glazed')]
gl = [x for x in res if x.get('glazed')]
log(f"§RASTER_W-S52h glazed_corners={len(gl)} {[x['corner'] for x in gl]} (exterior wall hatch min {EXT_H:.2f}, period {HPn:.0f} px{'; VACUOUS: no hatch measured' if not HPn or EXT_H < 0.40 else ''})")
log(f"§RASTER_W-S20 corners_tested=4 notches_found={len(found)} no_notch_corners={len(fals)} verdict={'PASS' if found else 'VACUOUS'}")
json.dump(dict(spec='§43.19', corners=res), open(out_p, 'w'), indent=1)
