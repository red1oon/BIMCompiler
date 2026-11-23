# Implementing PDF2BIM_VECTOR_PROBE.md §43.18 — Witness: W-S17v (the EG's vertical position from its exterior wall bands)
# Usage: python3 -P raster_regwall.py <p3 workdir (chains.json, register.json)> <p4 workdir (chains.json)>  > raster_regwall.log
# Writes the V map into <p3 work>/register.json. Texture rule: raster_texture.py (one owner).
import sys, os, json
import numpy as np
from PIL import Image
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from raster_texture import texture_maps, band_scores
from raster_body import anchor_chains, body

def log(*a): print(*a, flush=True)

w3, w4 = sys.argv[1], sys.argv[2]
C3 = json.load(open(os.path.join(w3, 'chains.json'))); C4 = json.load(open(os.path.join(w4, 'chains.json')))
RG = json.load(open(os.path.join(w3, 'register.json')))
H = RG['map']['H']; s = H['s']; tH = float(np.median([m['t'] for m in H['matches']]))
K4 = C4['scale_px_per_m']; K3 = K4['H'] * s
_, gh4, gv4 = anchor_chains(C4); X04, X14, Y04, Y14 = body(gh4[0], gv4[0])
ext_m = gh4[0]['segs'][0]['v']                       # the READ exterior wall (first segment of the anchoring chain)
T = int(round(ext_m * K3))
g = np.asarray(Image.open(C3['clean']).convert('L')).astype(int); inkg = g < 215; Hh, Ww = inkg.shape
xa, xb = int(round(s * X04 + tH)), int(round(s * X14 + tH))
log(f"§RASTER_REGWALL frame s={s:.5f} t_H={tH:.1f} K3={K3:.3f} px/m house_x={xa}..{xb} T={T}px (READ {ext_m} m)")
TST, TD1T, TD2T = texture_maps(inkg.T.copy())   # horizontal bands: rows of the transposed map = page x
TS, TD1, TD2 = texture_maps(inkg)                # vertical bands: rows = page y

def face(rows_or_cols, idx, horizontal):
    lo, hi = idx - 1, idx + 2
    return inkg[lo:hi, rows_or_cols].any(axis=0) if horizontal else inkg[rows_or_cols, lo:hi].any(axis=1)

def hband_score(a):
    """share of columns in the house x-range where [a, a+T] is a hatched wall band"""
    cols = np.arange(xa, xb + 1)
    f = face(cols, a, True) & face(cols, a + T, True)
    st, dg = band_scores(TST, TD1T, TD2T, a + 3, a + T - 2, slice(xa, xb + 1))
    k = 7; ker = np.ones(k) / k; st, dg = np.convolve(st, ker, 'same'), np.convolve(dg, ker, 'same')
    return float((f & (dg > st)).mean())

def vband_score(a, y0, y1):
    rows = np.arange(y0, y1 + 1)
    f = face(rows, a, False) & face(rows, a + T, False)
    st, dg = band_scores(TS, TD1, TD2, a + 3, a + T - 2, slice(y0, y1 + 1))
    k = 7; ker = np.ones(k) / k; st, dg = np.convolve(st, ker, 'same'), np.convolve(dg, ker, 'same')
    return float((f & (dg > st)).mean())

sc = np.array([hband_score(a) if 2 <= a < Hh - T - 3 else 0.0 for a in range(Hh)])
med = float(np.median(sc[sc > 0])); thr = max(3 * med, 0.05)
pk = [a for a in range(1, Hh - 1) if sc[a] >= thr and sc[a] >= sc[a - 1] and sc[a] >= sc[a + 1]]
pk2 = []                                         # one peak per band (suppress within T)
for a in sorted(pk, key=lambda a: -sc[a]):
    if all(abs(a - b) > T for b in pk2): pk2.append(a)
log(f"§RASTER_REGWALL_PEAKS median={med:.3f} threshold={thr:.3f} peaks(row:score)=" + ' '.join(f"{a}:{sc[a]:.2f}" for a in sorted(pk2)))
if len(pk2) < 2: sys.exit(log("§RASTER_W-S17v verdict=VACUOUS (fewer than 2 wall bands across the house)"))
top, bot = sorted(sorted(pk2, key=lambda a: -sc[a])[:2])
tV = top - s * Y04
depth_px = (bot + T) - top; depth = depth_px / K3
log(f"§RASTER_W-S17v(a) top_band={top} ({sc[top]:.2f}) bottom_band={bot} ({sc[bot]:.2f}) t_V={tV:.1f}")
log(f"§RASTER_W-S17v(b) depth outer-outer = {depth_px} px = {depth:.3f} m vs OG READ {gv4[0]['overall']} m: d={(depth - gv4[0]['overall']) * 1000:+.0f} mm ({(depth - gv4[0]['overall']) * K3:+.1f} px)")
L = vband_score(xa, top, bot + T); R = vband_score(xb - T, top, bot + T)
mid = [vband_score(int(xa + f * (xb - xa)), top, bot + T) for f in (0.3, 0.5, 0.7)]
log(f"§RASTER_W-S17v(c) vertical exterior bands at the registered x: left {xa}: {L:.2f}, right {xb - T}: {R:.2f}; mid-house falsifier bands {[round(m, 2) for m in mid]}")
fal = [hband_score(int(top + f * (bot - top))) for f in (0.25, 0.5, 0.75)]
log(f"§RASTER_W-S17v(e) falsifier horizontal bands inside the house {[round(x, 2) for x in fal]} vs threshold {thr:.3f}")
log(f"§RASTER_W-S17v(d) |t_V - single chain support 415.0| = {abs(tV - 415.0):.1f} px")
ok = sc[top] >= thr and sc[bot] >= thr and min(L, R) >= thr and max(fal) < thr and abs(depth - gv4[0]['overall']) * K3 <= 3
log(f"§RASTER_W-S17v verdict={'PASS' if ok else 'INCONCLUSIVE'}")
RG['map']['V'] = dict(s=s, t=float(tV), rule='§43.18 exterior wall bands', top_band=int(top), bottom_band=int(bot), depth_m=depth, ok=ok)
RG['map']['H']['t'] = tH; RG['ok'] = bool(ok and H['ok']); RG.pop('partial', None) if ok else None
json.dump(RG, open(os.path.join(w3, 'register.json'), 'w'), indent=1)

# ---- §43.18 step B: p4's GREEN chains mapped onto p3 -> <p3 work>_reg/chains.json (the EG pixels test every band) ----
if ok:
    tVv = float(tV); H3 = g.shape[0]; H4 = np.asarray(Image.open(C4['clean'])).shape[0]
    mx = lambda x: int(round(s * x + tH)); my = lambda y: int(round(s * y + tVv))
    out = []
    for c in [c for c in C4['chains'] if c['verdict'] == 'GREEN']:
        d = dict(c, registered_from='p4', segs=[])
        if c['dir'] == 'H':
            d['ticks_x'] = [mx(x) for x in c['ticks_x']]; d['line_y'] = my(c['line_y'])
            d['segs'] = [dict(sg, L=mx(sg['L']), R=mx(sg['R'])) for sg in c['segs']]
        else:
            d['ticks_y'] = [my(y) for y in c['ticks_y']]; d['line_x'] = mx(c['line_x'])
            d['ticks_rot'] = sorted(H3 - 1 - y for y in d['ticks_y'])
            d['segs'] = [dict(sg, L=H3 - 1 - my(H4 - 1 - sg['L']), R=H3 - 1 - my(H4 - 1 - sg['R'])) for sg in c['segs']]   # page y = H-1-rot, per end
        out.append(d)
    wr = w3.rstrip('/') + '_reg'; os.makedirs(wr, exist_ok=True)
    CR = dict(C3, chains=out, scale_px_per_m={'H': K3, 'V': K3}, registered=dict(s=s, t_H=tH, t_V=tVv, from_sheet=os.path.abspath(w4)))
    for c in out:   # the mapped segments must be positive and tile the mapped ticks (catches a convention slip)
        assert all(sg['R'] > sg['L'] for sg in c['segs']), 'mapped segment with R <= L'
    json.dump(CR, open(os.path.join(wr, 'chains.json'), 'w'), indent=1)
    log(f"§RASTER_REG_CHAINS wrote {wr}/chains.json chains={len(out)} " + ' '.join(f"{c['dir']}:{[sg['txt'] for sg in c['segs']]}" for c in out))
