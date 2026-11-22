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
