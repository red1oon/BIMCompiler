# Implementing PDF2BIM_VECTOR_PROBE.md §43.1/§43.2 — ONE owner of the wall-texture rule (hatch vs window lines).
# Hatch is DIAGONAL: ink at (r, c) continues at (r+1, c±1) in ONE direction. Window glass/frame lines are
# STRAIGHT: ink at (r, c) continues at (r+1, c). Per row, diagonal = max over the two directions (not their OR:
# an OR scores every 2-px-wide straight stroke as diagonal — measured §43.2, windows were bridged).
import numpy as np

def texture_maps(INKG):
    """per-pixel maps along axis 0: S straight, D1 down-left, D2 down-right (last row zero)"""
    S = np.zeros_like(INKG); D1 = np.zeros_like(INKG); D2 = np.zeros_like(INKG)
    S[:-1] = INKG[:-1] & INKG[1:]
    D1[:-1, 1:] = INKG[:-1, 1:] & INKG[1:, :-1]
    D2[:-1, :-1] = INKG[:-1, :-1] & INKG[1:, 1:]
    return S, D1, D2

def band_scores(S, D1, D2, a, b, rows=None):
    """straight and diagonal counts inside columns [a, b) for each row (or the given rows)"""
    sl = slice(None) if rows is None else rows
    s = S[sl, a:b].sum(axis=1); d = np.maximum(D1[sl, a:b].sum(axis=1), D2[sl, a:b].sum(axis=1))
    return s.astype(float), d.astype(float)

def slab_pairs(ink, DG, ilf, irf, span, frac, thr=0.30):
    """§43.20 step 3 slab rule (one owner, used by raster_section.py and raster_annex_section.py): line groups between the faces
    (rows whose longest ink run in cols ilf..irf >= frac x span, adjacent rows merged), then hatched pairs = consecutive groups
    whose rows between all have diagonal density >= thr. Returns (groups [[r0, r1]], slabs [dict(top, bot, min_hatch)])."""
    import numpy as np
    def _runs(v):
        d = np.diff(np.concatenate(([0], v.astype(np.int8), [0]))); return list(zip(np.where(d == 1)[0], np.where(d == -1)[0] - 1))
    g = []
    for r in range(ink.shape[0]):
        if max([b - a + 1 for a, b in _runs(ink[r, ilf:irf + 1])] or [0]) >= frac * span:
            if g and r - g[-1][1] <= 1: g[-1][1] = r
            else: g.append([r, r])
    slabs = []
    for a, b in zip(g, g[1:]):
        dens = [float(DG[r, ilf:irf + 1].mean()) for r in range(a[1] + 1, b[0])]
        if dens and min(dens) >= thr: slabs.append(dict(top=(a[0] + a[1]) / 2, bot=(b[0] + b[1]) / 2, min_hatch=round(min(dens), 2)))
    return g, slabs

# §52.1 THE SHEET'S HATCH (one owner; used by raster_wallscan.py and raster_notch.py). A cut wall is hatched at ONE period P along it:
# ink-run starts every P px, and the starts move diagonally (±d px) between two lines d px apart (45° hatch).
def run_starts(b):
    d = np.diff(np.concatenate(([0], b.astype(np.int8), [0]))); return np.where(d == 1)[0]

def hatch_period(ink, bands):
    """median spacing of run starts along the centrelines of the given bands [(o, x0, x1, y0, y1) page px]; 0 if none"""
    sp = []
    for o, x0, x1, y0, y1 in bands:
        if o == 'V': c = int(round((x0 + x1) / 2)); prof = ink[int(y0):int(y1) + 1, c]
        else: r = int(round((y0 + y1) / 2)); prof = ink[r, int(x0):int(x1) + 1]
        sp += list(np.diff(run_starts(prof)))
    return (float(np.median(sp)) if sp else 0.0), len(sp)

def hatch_score(ink, o, x0, x1, y0, y1, P, d, tol, face):
    """best line pair (l, l+d) of the band interior (faces of `face` px left out): share of the line covered by starts at P (±tol)
    x share of starts continued diagonally (±d, ±1 px) on line l+d. 0..1; 0 when the interior has fewer than d+1 lines."""
    x0, x1, y0, y1 = int(round(x0)), int(round(x1)), int(round(y0)), int(round(y1))
    A = ink[y0:y1 + 1, x0 + face:x1 - face + 1].T if o == 'V' else ink[y0 + face:y1 - face + 1, x0:x1 + 1]
    best = 0.0
    for l in range(A.shape[0] - d):
        s = run_starts(A[l]); t = run_starts(A[l + d])
        if len(s) < 2 or not len(t): continue
        cov = min(1.0, float((np.abs(np.diff(s) - P) <= tol).sum() * P / A.shape[1]))
        dg = max(np.mean([np.any(np.abs(t - (x + sg * d)) <= 1) for x in s]) for sg in (1, -1))
        best = max(best, cov * dg)
    return best
