# Implementing PDF2BIM_VECTOR_PROBE.md §43.16 — Witness: W-S19a (openings jamb to jamb, DIN 4172 class), W-S19b (jamb falsifier)
# Usage: python3 -P raster_openings.py <plan workdir (chains.json, walls.json)> [<type template, default types/german_werkplan_efh.json>]  > raster_openings.log
#   writes <work>/openings.json; the opening size series comes from the TYPE TEMPLATE (opening_series), not from this code
# An exterior opening = the gap between two collinear exterior runs of walls.json (§43.1). The run end is where the wall HATCH
# stops; the opening edge is the drawn JAMB stroke: a column (H wall) / row (V wall) whose ink covers >= 90 % of the band.
# Width = jamb stroke centre to centre (the face-line convention of W-S7a), then classed against DIN 4172 Öffnungsmaß x*125+10 mm.
import sys, os, json, math
import numpy as np
from PIL import Image
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from raster_body import anchor_chains, body
from raster_jamb import jamb as _jamb

def log(*a): print(*a, flush=True)

work = sys.argv[1]
C = json.load(open(os.path.join(work, 'chains.json')))
out_p = os.path.join(work, 'openings.json')
if os.path.exists(out_p): os.remove(out_p)   # a VACUOUS run must not leave an older run's output
g = np.asarray(Image.open(C['clean']).convert('L')).astype(int)
inkg = g < 215                               # grey-inclusive ink, the probe's threshold
F = C.get('dpi', 200) / 200.0
def px(v): return max(1, int(round(v * F)))
_, gh, gv = anchor_chains(C)
if not gh or not gv: sys.exit(log("§RASTER_OPEN verdict=VACUOUS (no anchoring GREEN chain each way)"))
KH, KV = C['scale_px_per_m']['H'], C['scale_px_per_m']['V']
X0, X1, Y0, Y1 = body(gh[0], gv[0])
W = json.load(open(os.path.join(work, 'walls.json')))['walls']
ext_t = max(w['thk_chain_m'] for w in W)
HALF_X, HALF_Y = (X1 - X0) / KH * 500, (Y1 - Y0) / KV * 500   # body half-size, mm
COVER = 0.90; BACK, FWD = px(2), px(6)       # search -2..+6 px from the run end, toward the opening (spec §43.16)
TPL = sys.argv[2] if len(sys.argv) > 2 else os.path.join(os.path.dirname(os.path.abspath(__file__)), 'types', 'german_werkplan_efh.json')
OS = json.load(open(TPL))['opening_series']; MOD, JNT = OS['module_mm'], OS['joint_mm']
SERIES = lambda w: MOD * round((w - JNT) / MOD) + JNT   # nearest series value x*module + joint (the type's; DIN 4172 for the German Werkplan type)

def band_px(w):   # (along-axis converter, band rows/cols as page px) for a run
    if w['axis'] == 'H':
        return (lambda mm: X0 + mm / 1000 * KH), (Y0 + w['y0'] / 1000 * KV, Y0 + w['y1'] / 1000 * KV), KH
    return (lambda mm: Y0 + mm / 1000 * KV), (X0 + w['x0'] / 1000 * KH, X0 + w['x1'] / 1000 * KH), KV

def jamb(axis, end_px, sign, b0, b1): return _jamb(inkg, axis, end_px, sign, b0, b1, BACK, FWD, COVER)   # raster_jamb.py owns the rule

ops, fals = [], []
for axis in ('H', 'V'):
    for side in (0, 1):
        ws = [w for w in W if w['thk_chain_m'] == ext_t and w['axis'] == axis and
              ((w['y0'] < HALF_Y) if axis == 'H' else (w['x0'] < HALF_X)) == (side == 0)]
        ws.sort(key=lambda w: w['x0'] if axis == 'H' else w['y0'])
        face = ('N' if side == 0 else 'S') if axis == 'H' else ('W' if side == 0 else 'E')
        for a, b in zip(ws, ws[1:]):
            conv, (b0, b1), K = band_px(a)
            ea = conv(a['x1'] if axis == 'H' else a['y1']); eb = conv(b['x0'] if axis == 'H' else b['y0'])
            if (eb - ea) / K * 1000 <= 300: continue          # the emitter's own opening threshold (raster_emit.py)
            ja, jb = jamb(axis, ea, +1, b0, b1), jamb(axis, eb, -1, b0, b1)
            pa = ja if ja is not None else ea; pb = jb if jb is not None else eb
            o0 = (pa - (X0 if axis == 'H' else Y0)) / K * 1000; o1 = (pb - (X0 if axis == 'H' else Y0)) / K * 1000
            meas = o1 - o0; nom = SERIES(meas); d = meas - nom; tol = 1000 / K
            cls = 'STANDARD' if abs(d) <= tol else 'STANDARD-DEFAULT'
            mid = nom + (MOD / 2 if meas > nom else -MOD / 2)                       # the midpoint toward the other neighbour
            if cls != 'STANDARD' and abs(meas - mid) <= tol: cls = 'TIE'; tie = sorted((nom, nom + (MOD if meas > nom else -MOD)))
            else: tie = None
            c = (o0 + o1) / 2
            ops.append(dict(face=face, axis=axis, run_a=W.index(a), run_b=W.index(b), jamb_a=ja is not None, jamb_b=jb is not None,
                            meas_mm=round(meas, 1), run_gap_mm=round((eb - ea) / K * 1000, 1), nominal_mm=nom, cls=cls,
                            tie=tie, centre_mm=round(c, 1), thk_m=a['thk_chain_m']))
            log(f"§RASTER_OPEN face={face} run_gap_mm={(eb-ea)/K*1000:.0f} jambs={'Y' if ja is not None else 'none'}/{'Y' if jb is not None else 'none'} "
                f"jamb_to_jamb_mm={meas:.0f} DIN={nom} d={d:+.0f}mm (1px={tol:.1f}) class={cls}")
        for w in ws:   # W-S19b falsifier: the same stroke test at the run's middle (solid wall, no opening)
            conv, (b0, b1), K = band_px(w)
            m = conv(((w['x0'] + w['x1']) if axis == 'H' else (w['y0'] + w['y1'])) / 2)
            if (w['x1'] - w['x0'] if axis == 'H' else w['y1'] - w['y0']) < 1000: continue
            fals.append(jamb(axis, m, +1, b0, b1) is not None)
n = len(ops)
if not n: sys.exit(log("§RASTER_W-S19a verdict=VACUOUS openings=0"))
conf = sorted(set(o['nominal_mm'] for o in ops if o['cls'] == 'STANDARD'))   # this sheet's confirmed sizes
for o in ops:   # a tie breaks toward the size this sheet confirmed; else nearest, flagged
    if o['cls'] == 'TIE':
        hit = [v for v in o['tie'] if v in conf]
        if len(hit) == 1: o['nominal_mm'] = hit[0]; o['cls'] = 'STANDARD-TIE-SHEET'
        else: o['cls'] = 'STANDARD-TIE-UNRESOLVED'
        log(f"§RASTER_OPEN_TIE face={o['face']} meas={o['meas_mm']} between={o['tie']} sheet_confirmed={conf} -> {o['nominal_mm']} class={o['cls']}")
    o['a_mm'] = round(o['centre_mm'] - o['nominal_mm'] / 2, 1); o['b_mm'] = round(o['centre_mm'] + o['nominal_mm'] / 2, 1)
both = sum(1 for o in ops if o['jamb_a'] and o['jamb_b'])
log(f"§RASTER_W-S19a openings={n} both_jambs={both} STANDARD={sum(o['cls'] == 'STANDARD' for o in ops)} "
    f"STANDARD-DEFAULT={sum(o['cls'] == 'STANDARD-DEFAULT' for o in ops)} TIE-SHEET={sum(o['cls'] == 'STANDARD-TIE-SHEET' for o in ops)} TIE-UNRESOLVED={sum(o['cls'] == 'STANDARD-TIE-UNRESOLVED' for o in ops)} sheet_confirmed={conf} nominals={sorted(set(o['nominal_mm'] for o in ops))}")
fp = sum(fals)
log(f"§RASTER_W-S19b falsifier mid-wall probes={len(fals)} jamb_found={fp} rate={fp / max(1, len(fals)):.0%} "
    f"verdict={'PASS' if len(fals) and fp / len(fals) <= 0.05 else ('INCONCLUSIVE' if not fals else 'FAIL')}")
json.dump(dict(source=OS['_source'] + '; §43.16', openings=ops),
          open(out_p, 'w'), indent=1, ensure_ascii=False)
