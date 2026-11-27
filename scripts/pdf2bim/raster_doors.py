# Implementing PDF2BIM_VECTOR_PROBE.md §43.21 — Witness: W-S21a (doors per storey), W-S21b (arc falsifier at solid wall),
# W-S21c (windows stay windows); run 2: radial contrast, hinge offsets across the band, threshold from the sheet's null population, W-S21d (VACUOUS)
# Usage: python3 -P raster_doors.py <plan workdir (chains.json, walls.json, walls_all.json, openings.json)> [<type template>]  > raster_doors.log
#   writes <work>/doors.json. A DOOR = a wall gap with a drawn quarter-circle swing arc; width classed to the template's door_series (DIN 18101).
import sys, os, json, math
import numpy as np
from PIL import Image
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from raster_body import anchor_chains, body
from raster_jamb import jamb as _jamb

def log(*a): print(*a, flush=True)

work = sys.argv[1]
TPL = sys.argv[2] if len(sys.argv) > 2 else os.path.join(os.path.dirname(os.path.abspath(__file__)), 'types', 'german_werkplan_efh.json')
DS = json.load(open(TPL))['door_series']; WIDTHS = sorted(DS['single_leaf_width_mm'] + DS['double_leaf_width_mm'])
C = json.load(open(os.path.join(work, 'chains.json')))
out_p = os.path.join(work, 'doors.json')
if os.path.exists(out_p): os.remove(out_p)   # a VACUOUS run must not leave an older run's output
g = np.asarray(Image.open(C['clean']).convert('L')).astype(int); inkg = g < 215; HP, WP = inkg.shape
# §48 pen markup is not drawing: printed ink is neutral (excess blue = B - max(R, G) = 0); pen strokes are bluish. The cut = the valley of the sheet's own
# ink histogram of excess blue over 1..20 (above the noise band's own peak), never a typed number. Applied to the swing-arc EVIDENCE only.
_rgb = np.asarray(Image.open(C['page']).convert('RGB')).astype(np.int16); _xb = _rgb[..., 2] - np.maximum(_rgb[..., 0], _rgb[..., 1])
_hx = np.bincount(np.clip(_xb[_rgb.mean(axis=2) < 200], 0, 255), minlength=256); PEN_T = int(1 + np.argmax(_hx[1:21]))   # the noise band ends at its own peak (neutral ink's JPEG chroma artefact; bin 7 on both DE-1 plan pages), the pen tail starts above it
_pen = Image.fromarray(((_xb > PEN_T) * 255).astype(np.uint8)).rotate(C.get('skew_deg', 0), resample=Image.NEAREST, fillcolor=0)
_pen = np.asarray(_pen) > 127
if _pen.shape == inkg.shape:
    _pd = _pen.copy(); _pd[1:] |= _pen[:-1]; _pd[:-1] |= _pen[1:]; _pd[:, 1:] |= _pen[:, :-1]; _pd[:, :-1] |= _pen[:, 1:]
    inkA = inkg & ~_pd
else: inkA = inkg
print(f"§RASTER_W-S48c pen markup cut excess_blue>{PEN_T} (above the noise peak of the ink histogram 1..20: {_hx[1:21].tolist()}) pen_px={int(_pen.sum())} removed_from_arc_evidence={int((inkg & ~inkA).sum())} of ink {int(inkg.sum())}", flush=True)
F = C.get('dpi', 200) / 200.0
def px(v): return max(1, int(round(v * F)))
_, gh, gv = anchor_chains(C)
if not gh or not gv: sys.exit(log("§RASTER_DOOR verdict=VACUOUS (no anchoring GREEN chain each way)"))
KH, KV = C['scale_px_per_m']['H'], C['scale_px_per_m']['V']
X0, X1, Y0, Y1 = body(gh[0], gv[0])
W1 = json.load(open(os.path.join(work, 'walls.json')))['walls']
WA = json.load(open(os.path.join(work, 'walls_all.json')))['walls']
OP = json.load(open(os.path.join(work, 'openings.json')))['openings'] if os.path.exists(os.path.join(work, 'openings.json')) else []
ext_t = max(w['thk_chain_m'] for w in W1)
COVER = 0.90; BACK, FWD = px(2), px(6); MARGIN = 0.10   # the §43.16 jamb constants; §43.21 run 2: margin over the sheet's null population

def frame(w):   # (along: mm -> page px, band (b0, b1) in page px across the wall, K along)
    if w['axis'] == 'H': return (lambda mm: X0 + mm / 1000 * KH), (Y0 + w['y0'] / 1000 * KV, Y0 + w['y1'] / 1000 * KV), KH
    return (lambda mm: Y0 + mm / 1000 * KV), (X0 + w['x0'] / 1000 * KH, X0 + w['x1'] / 1000 * KH), KV
def jamb(axis, end_px, sign, b0, b1): return _jamb(inkg, axis, end_px, sign, b0, b1, BACK, FWD, COVER)

def ink_at(x, y):
    xi, yi = int(round(x)), int(round(y))
    return 0 <= yi < HP and 0 <= xi < WP and inkA[yi, xi]   # §48 the swing evidence: drawing ink, pen markup left out

def cov_at(axis, h, dirn, face, side, r):
    """share of the quarter circle (10..80 deg from the wall line) with ink within +-1 px radially"""
    n = hit = 0
    for deg in range(10, 81):
        t = math.radians(deg); n += 1; ok = False
        for dr in (-1, 0, 1):
            al, ac = h + dirn * (r + dr) * math.cos(t), face + side * (r + dr) * math.sin(t)   # along, across
            if (ink_at(al, ac) if axis == 'H' else ink_at(ac, al)): ok = True; break
        hit += ok
    return hit / n

def arc(axis, pa, pb, b0, b1, rr=None):
    """§43.21 run 2: best (radial contrast, coverage, hinge, side, r_px, offset_px) over hinge {pa, pb} x side x hinge offset
    across the band (face .. far face; a French door hinges on its frame inside the band) x r 0.80..1.05 width.
    contrast = coverage at r - mean coverage at r +-4..6 px (a drawn arc is a thin circle; plan clutter is not)."""
    w = abs(pb - pa); best = (-1.0, 0.0, None, None, None, None); thk = int(round(abs(b1 - b0)))
    for hinge, h, dirn in (('a', pa, +1), ('b', pb, -1)):
        for side, face in ((-1, b0), (+1, b1)):
            for off in range(0, thk + 1):
                f = face - side * off                       # step from this side's face into the band
                lo_r, hi_r = rr if rr else (int(0.80 * w), int(1.05 * w))   # §48: rr = an absolute radius range in px (a leaf narrower than the opening)
                cov = {r: cov_at(axis, h, dirn, f, side, r) for r in range(lo_r - 6, hi_r + 7)}
                for r in range(lo_r, hi_r + 1):
                    ring = [cov[r + k] for k in (-6, -5, -4, 4, 5, 6)]
                    c = cov[r] - sum(ring) / len(ring)
                    if c > best[0]: best = (c, cov[r], hinge, side, r, off)
    return best

def din(meas, K):
    nom = min(WIDTHS, key=lambda v: abs(v - meas)); return nom, ('STANDARD' if abs(meas - nom) <= 1000 / K else 'STANDARD-DEFAULT')

cands = []
# (a) exterior openings (§43.16 openings.json): jambs = centre -/+ measured width / 2
for i, o in enumerate(OP):
    wa = W1[o['run_a']]; conv, (b0, b1), K = frame(wa)
    pa, pb = conv(o['centre_mm'] - o['meas_mm'] / 2), conv(o['centre_mm'] + o['meas_mm'] / 2)
    con, cov, hg, sd, r, off = arc(o['axis'], pa, pb, b0, b1)
    cands.append(dict(src='exterior', index=i, face=o['face'], axis=o['axis'], meas_mm=o['meas_mm'], nominal_mm=o['nominal_mm'], cls=o['cls'],
               centre_mm=o['centre_mm'], thk_m=o['thk_m'], arc_contrast=round(con, 3), arc_cov=round(cov, 3), hinge=hg, side=sd,
               hinge_offset_mm=round(off / K * 1000), r_mm=round(r / K * 1000) if r else None))
# (b) interior gaps: collinear READ runs thinner than the exterior wall, same band within 1 px, nearest neighbour
INT = [w for w in WA if w.get('src', 'READ') == 'READ' and w['thk_chain_m'] < ext_t]
fals = []
for axis in ('H', 'V'):
    ws = [w for w in INT if w['axis'] == axis]
    lo_, hi_ = ('y0', 'y1') if axis == 'H' else ('x0', 'x1'); s_, e_ = ('x0', 'x1') if axis == 'H' else ('y0', 'y1')
    Kx = KV if axis == 'H' else KH; tol = 1000 / Kx
    for a in ws:
        nb = [b for b in ws if b is not a and abs(b[lo_] - a[lo_]) <= tol and abs(b[hi_] - a[hi_]) <= tol and b[s_] - a[e_] > 300]
        if not nb: continue
        b = min(nb, key=lambda b: b[s_] - a[e_])
        conv, (b0, b1), K = frame(a)
        ea, eb = conv(a[e_]), conv(b[s_])
        ja, jb = jamb(axis, ea, +1, b0, b1), jamb(axis, eb, -1, b0, b1)
        pa = ja if ja is not None else ea; pb = jb if jb is not None else eb
        meas = (pb - pa) / K * 1000; nom, cls = din(meas, K)
        con, cov, hg, sd, r, off = arc(axis, pa, pb, b0, b1)
        c_mm = ((pa + pb) / 2 - (X0 if axis == 'H' else Y0)) / K * 1000
        rec = dict(src='interior', axis=axis, thk_m=a['thk_chain_m'], band_mm=[round(a[lo_]), round(a[hi_])], jamb_a=ja is not None, jamb_b=jb is not None,
                   run_gap_mm=round((eb - ea) / K * 1000, 1), meas_mm=round(meas, 1), nominal_mm=nom, cls=cls, centre_mm=round(c_mm, 1),
                   arc_contrast=round(con, 3), arc_cov=round(cov, 3), hinge=hg, side=sd, hinge_offset_mm=round(off / K * 1000), r_mm=round(r / K * 1000) if r else None)
        cands.append(rec)
    # W-S21b falsifier: a solid mid-wall point, gap set to 885 mm
    for w in ws:
        if w[e_] - w[s_] < 1000: continue
        conv, (b0, b1), K = frame(w); m = conv((w[s_] + w[e_]) / 2); half = 0.885 / 2 * K
        fals.append(arc(axis, m - half, m + half, b0, b1)[0])
# §43.21 run 2: the threshold is the sheet's own null population (solid-wall probes) + 0.10
THR = round(max(fals) + MARGIN, 2) if fals else None   # compared at the logged precision (2 decimals), as the spec reads them
sep = THR is not None and THR <= 0.60
# §48 a leaf narrower than its opening (a door + a side light): exterior non-doors only, r from 0.80 x the smallest DIN 18101 single leaf to
# 0.80 x the opening width; its own null population = the same solid-wall probes over the same absolute r range (+ MARGIN, <= 0.60)
LEAFS = sorted(DS['single_leaf_width_mm']); narrow = []
for c in cands:
    if c['src'] != 'exterior' or (sep and round(c['arc_contrast'], 2) >= THR): continue
    o = OP[c['index']]; conv, (b0, b1), K = frame(W1[o['run_a']]); pa, pb = conv(o['centre_mm'] - o['meas_mm'] / 2), conv(o['centre_mm'] + o['meas_mm'] / 2)
    lo, hi = int(0.80 * LEAFS[0] / 1000 * K), int(0.80 * (pb - pa)) - 1
    if hi > lo: narrow.append((c, o, pa, pb, b0, b1, K, lo, hi))
NMIN = 5   # §48: a null population of fewer solid-wall probes judges nothing (VACUOUS), never a door
PROBES = [w for w in INT] + [w for w in W1 if w['thk_chain_m'] == ext_t]
for c, o, pa, pb, b0, b1, K, lo, hi in narrow:   # each candidate against ITS OWN r range: probes on solid runs long enough for that arc
    falsN = []
    for w in PROBES:
        ax = w['axis']; s_, e_ = ('x0', 'x1') if ax == 'H' else ('y0', 'y1'); Kw = KH if ax == 'H' else KV
        if (w[e_] - w[s_]) / 1000 * Kw < 2 * hi + 2 * px(6): continue
        conv, (q0, q1), _ = frame(w); m = conv((w[s_] + w[e_]) / 2); half = (pb - pa) / 2
        falsN.append(arc(ax, m - half, m + half, q0, q1, (lo, hi))[0])
    THRN = round(max(falsN) + MARGIN, 2) if len(falsN) >= NMIN else None; sepN = THRN is not None and THRN <= 0.60
    con, cov, hg, sd, r, off = arc(c['axis'], pa, pb, b0, b1, (lo, hi))
    ok = sepN and round(con, 2) >= THRN
    if ok:
        r_mm = r / K * 1000; leaf = min(LEAFS, key=lambda v: abs(v - r_mm))
        c.update(arc_contrast=round(con, 3), arc_cov=round(cov, 3), hinge=hg, side=sd, hinge_offset_mm=round(off / K * 1000), r_mm=round(r_mm), leaf_mm=leaf, narrow_leaf=True)
    log(f"§RASTER_W-S48a exterior face={c['face']} centre_mm={c['centre_mm']:.0f} width={c['meas_mm']:.0f} narrow-leaf r_px={lo}..{hi} contrast={con:.2f} cov={cov:.2f} hinge={hg} side={sd} r_mm={r / K * 1000:.0f} "
        f"| null probes={len(falsN)} max={max(falsN) if falsN else 0:.2f} threshold={THRN} -> {'DOOR leaf=' + str(c['leaf_mm']) + ' (DIN 18101 nearest r) + side light' if ok else ('unchanged' if sepN else 'unchanged (null VACUOUS: fewer than ' + str(NMIN) + ' probes or threshold > 0.60)')}")
doors, rest = [], []
for c in cands:
    c['kind'] = 'DOOR' if (sep and round(c['arc_contrast'], 2) >= THR) or c.get('narrow_leaf') else ('WINDOW' if c['src'] == 'exterior' else 'OPENING')
    (doors if c['kind'] == 'DOOR' else rest).append(c)
    if c['src'] == 'exterior':
        log(f"§RASTER_DOOR exterior face={c['face']} centre_mm={c['centre_mm']:.0f} width={c['meas_mm']:.0f} ({c['nominal_mm']} {c['cls']}) "
            f"contrast={c['arc_contrast']:.2f} cov={c['arc_cov']:.2f} hinge={c['hinge']} side={c['side']} offset_mm={c['hinge_offset_mm']} r_mm={c['r_mm']} -> {c['kind']}")
    else:
        log(f"§RASTER_DOOR interior axis={c['axis']} thk={c['thk_m']} band_mm={c['band_mm']} centre_mm={c['centre_mm']:.0f} run_gap={c['run_gap_mm']:.0f} "
            f"jambs={'Y' if c['jamb_a'] else 'none'}/{'Y' if c['jamb_b'] else 'none'} jamb_to_jamb={c['meas_mm']:.0f} DIN18101={c['nominal_mm']} d={c['meas_mm'] - c['nominal_mm']:+.0f}mm "
            f"class={c['cls']} contrast={c['arc_contrast']:.2f} cov={c['arc_cov']:.2f} hinge={c['hinge']} side={c['side']} offset_mm={c['hinge_offset_mm']} r_mm={c['r_mm']} -> {c['kind']}")
n = len(cands)
if not n: sys.exit(log("§RASTER_W-S21d verdict=VACUOUS candidates=0"))
di = [d for d in doors if d['src'] == 'interior']; de = [d for d in doors if d['src'] == 'exterior']
log(f"§RASTER_W-S21a candidates={n} DOOR={len(doors)} (interior {len(di)}, exterior {len(de)}) not_door={len(rest)} "
    f"interior_both_jambs={sum(d['jamb_a'] and d['jamb_b'] for d in di)}/{len(di)} STANDARD={sum(d['cls'] == 'STANDARD' for d in di)} "
    f"STANDARD-DEFAULT={sum(d['cls'] == 'STANDARD-DEFAULT' for d in di)} nominals={sorted(d['nominal_mm'] for d in doors)}")
weakest = min([d['arc_contrast'] for d in doors] or [None], key=lambda v: v if v is not None else 9)
log(f"§RASTER_W-S21b null population solid mid-wall probes={len(fals)} max_contrast={max(fals) if fals else 0:.2f} threshold={THR if THR is None else round(THR, 2)} (max + {MARGIN}, must be <= 0.60) "
    f"weakest_door={weakest} margin_over_null={(weakest - max(fals)) if (weakest is not None and fals) else None} "
    f"verdict={'PASS' if sep else 'INCONCLUSIVE (no separation: no doors from this sheet)'}")
wins = [r for r in rest if r['src'] == 'exterior']
log(f"§RASTER_W-S21c exterior openings kept as windows={len(wins)} max_contrast={max([r['arc_contrast'] for r in wins] or [0]):.2f} (< {THR if THR is None else round(THR, 2)}) "
    f"| reclassified to DOOR={len(de)} " + ' '.join(f"{d['face']}@{d['centre_mm']:.0f}:{d['arc_contrast']:.2f}" for d in de))
json.dump(dict(source=DS['_source'] + '; §43.21 run 2', threshold=THR, null_max=max(fals) if fals else None, doors=doors, not_doors=rest), open(out_p, 'w'), indent=1, ensure_ascii=False)
