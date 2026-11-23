# Implementing PDF2BIM_VECTOR_PROBE.md §43.1 + §43.16 — ONE owner of the plan body frame (raster_walls.py and raster_openings.py import it).
import numpy as np

def anchors(c):
    """a chain anchors walls only if it begins AND ends with a wall segment (both exterior walls are in it):
    wall = below the chain's largest value-ratio gap; needs >= 3 segments (§43.6, a 2-segment chain at 400 dpi
    made 4.625 m a 'wall')"""
    v = [s['v'] for s in c['segs']]
    if len(v) < 3: return False
    sv = sorted(v); k = int(np.argmax(np.diff(np.log(sv)))); cut = (sv[k] + sv[k + 1]) / 2
    return v[0] < cut and v[-1] < cut

def anchor_chains(C):
    """(H chains, V chains) that anchor walls, most segments first"""
    greens = [c for c in C['chains'] if c['verdict'] == 'GREEN']
    gh = sorted([c for c in greens if c['dir'] == 'H' and anchors(c)], key=lambda c: -len(c['segs']))
    gv = sorted([c for c in greens if c['dir'] == 'V' and anchors(c)], key=lambda c: -len(c['segs']))
    return greens, gh, gv

def body(ch, cv):
    """plan body = outer ticks of the two anchoring GREEN chains (page px): X0, X1, Y0, Y1"""
    return ch['ticks_x'][0], ch['ticks_x'][-1], cv['ticks_y'][0], cv['ticks_y'][-1]
