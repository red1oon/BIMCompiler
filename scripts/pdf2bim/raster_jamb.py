# Implementing PDF2BIM_VECTOR_PROBE.md §43.16 (jamb stroke rule) — one owner, used by raster_openings.py (§43.16) and raster_doors.py (§43.21)
# A JAMB is a column (H wall) / row (V wall) whose ink covers >= cover of the wall band, searched -back..+fwd px from a run end toward the opening.

def coverage(inkg, axis, pos, b0, b1):
    """share of the band's rows (H wall: page rows b0..b1 at column pos) that hold ink"""
    lo, hi = int(round(b0)), int(round(b1))
    if axis == 'H': return float(inkg[lo:hi + 1, pos].mean())
    return float(inkg[pos, lo:hi + 1].mean())

def jamb(inkg, axis, end_px, sign, b0, b1, back, fwd, cover):
    """the qualifying stroke nearest the run end, searching toward the opening (sign +1: opening at larger px)"""
    e = int(round(end_px)); cols = [e + sign * k for k in range(-back, fwd + 1)]
    q = [c for c in cols if coverage(inkg, axis, c, b0, b1) >= cover]
    if not q: return None
    q.sort(key=lambda c: sign * (c - e)); first = q[0]; run = [first]
    while first + sign * len(run) in q: run.append(first + sign * len(run))   # the stroke = contiguous qualifying columns
    return (min(run) + max(run)) / 2
