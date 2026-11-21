#!/usr/bin/env python3
# ⚠ DO NOT REMOVE — scope: bim-compiler prompts/4D_MODEL_INTEGRITY.md §Q.55 (proof film). Read render.log after every run.
# WHAT: draws a 4D build-up from FACTS ONLY. Input = export_run.js files (per element: schedule start / end in days, phase, true box, the
#       shipped judge's verdict). A frame at day d shows every element whose start <= d, as its true box, in a fixed axonometric view:
#         being installed (start <= d < end)  -> bright
#         built                                -> its phase colour
#         judged UNSUPPORTED at its start      -> red, stays red (midair: its support is not finished; orphan: no path to the ground)
#       The counters on screen are counted from the same rows in the same loop. Nothing is positioned, timed or coloured by hand.
# HOW:  elements only ever appear, so each box is rasterised ONCE into a z-buffer when its start passes (and once more, same pixels, when it
#       ends, to drop the "being installed" colour). Frame = a copy of the buffer. No GPU.
# usage: render.py <before.json> <after.json> <out dir> <title> [--frames N] [--w 960 --h 760]
import sys, json, os, math, argparse
import numpy as np
from PIL import Image, ImageDraw, ImageFont
ap = argparse.ArgumentParser(); ap.add_argument('before'); ap.add_argument('after'); ap.add_argument('out'); ap.add_argument('title')
ap.add_argument('--frames', type=int, default=720); ap.add_argument('--w', type=int, default=960); ap.add_argument('--h', type=int, default=760)
ap.add_argument('--az', type=float, default=35.0); ap.add_argument('--tilt', type=float, default=28.0); ap.add_argument('--hold', type=int, default=48)
ap.add_argument('--labA', default='BEFORE'); ap.add_argument('--labB', default='AFTER')
a = ap.parse_args(); os.makedirs(a.out, exist_ok=True)
PHASE = {'Substructure': (120, 110, 100), 'Superstructure': (170, 174, 180), 'Architecture Envelope': (196, 164, 120), 'MEP Rough-in': (88, 150, 200),
         'Architecture Closeup': (150, 190, 150), 'MEP Final': (120, 200, 210), 'Finishes': (214, 200, 160), 'Architecture': (196, 164, 120)}
RED, ORANGE, LIVE, BG = (232, 48, 48), (255, 140, 0), (255, 214, 64), (18, 20, 24)
F = lambda s: ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans%s.ttf' % ('-Bold' if s < 0 else ''), abs(s))
log = open(os.path.join(a.out, 'render.log'), 'w')
def say(m): print(m); log.write(m + '\n'); log.flush()

A, B = json.load(open(a.before)), json.load(open(a.after))
allrows = A['rows'] + B['rows']
P = np.array([[r[5], r[6], r[7], r[8], r[9], r[10]] for r in allrows], float)
az, tl = math.radians(a.az), math.radians(a.tilt); ca, sa, ct, st = math.cos(az), math.sin(az), math.cos(tl), math.sin(tl)
def proj(x, y, z):          # axonometric: u right, v up on screen, w = depth (bigger = nearer the eye)
    u = x * ca - y * sa; f = x * sa + y * ca
    return u, z * ct + f * st, -f * ct + z * st
# one scale for BOTH panels, from the union of both runs' true boxes (same building: the same picture frame)
cs = np.array([proj(x, y, z) for x in (P[:, 0].min(), P[:, 1].max()) for y in (P[:, 2].min(), P[:, 3].max()) for z in (np.percentile(P[:, 4], 0.5), P[:, 5].max())])
u0, u1, v0, v1 = cs[:, 0].min(), cs[:, 0].max(), cs[:, 1].min(), cs[:, 1].max()
W, H, TOP, BOT = a.w, a.h, 96, 70
S = min((W - 40) / (u1 - u0), (H - TOP - BOT) / (v1 - v0))
ox, oy = (W - (u1 - u0) * S) / 2 - u0 * S, TOP + (H - TOP - BOT + (v1 - v0) * S) / 2 + v0 * S
DAYS = max(A['days'], B['days'])

class Panel:
    def __init__(s, D, label):
        s.D, s.label = D, label; s.col = np.zeros((H, W, 3), np.uint8); s.col[:] = BG; s.z = np.full((H, W), -1e18)
        rows = D['rows']; s.rows = rows
        s.byS = sorted(range(len(rows)), key=lambda i: rows[i][1]); s.byE = sorted(range(len(rows)), key=lambda i: rows[i][2]); s.iS = s.iE = 0
        s.placed = s.red = s.live = s.orange = 0
    def quad(s, pts, col):
        us = np.array([p[0] for p in pts]) * S + ox; vs = oy - np.array([p[1] for p in pts]) * S; ws = np.array([p[2] for p in pts])
        x0, x1 = int(max(0, math.floor(us.min()))), int(min(W - 1, math.ceil(us.max()))); y0, y1 = int(max(0, math.floor(vs.min()))), int(min(H - 1, math.ceil(vs.max())))
        if x1 < x0 or y1 < y0: return
        if (x1 - x0) <= 1 and (y1 - y0) <= 1:                                   # sub-pixel: one depth test
            w = ws.max()
            if w >= s.z[y0, x0]: s.z[y0, x0] = w; s.col[y0, x0] = col
            return
        X, Y = np.meshgrid(np.arange(x0, x1 + 1) + 0.5, np.arange(y0, y1 + 1) + 0.5)
        inside = None; sgn = 0
        for k in range(4):
            xa, ya, xb, yb = us[k], vs[k], us[(k + 1) % 4], vs[(k + 1) % 4]
            c = (xb - xa) * (Y - ya) - (yb - ya) * (X - xa)
            if sgn == 0: sgn = 1 if ((us[1] - us[0]) * (vs[2] - vs[0]) - (vs[1] - vs[0]) * (us[2] - us[0])) >= 0 else -1
            m = (c * sgn >= -1e-9); inside = m if inside is None else (inside & m)
        if not inside.any():                                                     # thinner than a pixel row: keep it visible as its bbox line
            inside = np.ones_like(X, bool) if min(x1 - x0, y1 - y0) <= 1 else inside
            if not inside.any(): return
        # depth is affine in (u, v) on a planar face: solve from three corners
        M = np.array([[us[0], vs[0], 1], [us[1], vs[1], 1], [us[2], vs[2], 1]]);
        try: k = np.linalg.solve(M, ws[:3]); Wd = k[0] * X + k[1] * Y + k[2]
        except np.linalg.LinAlgError: Wd = np.full(X.shape, ws.max())
        zz = s.z[y0:y1 + 1, x0:x1 + 1]; hit = inside & (Wd >= zz - 1e-6)
        zz[hit] = Wd[hit]; s.col[y0:y1 + 1, x0:x1 + 1][hit] = col
    def box(s, r, col):
        x0, x1, y0, y1, z0, z1 = r[5:11]
        c = lambda x, y, z: proj(x, y, z)
        sh = lambda k: tuple(int(v * k) for v in col)
        s.quad([c(x0, y0, z1), c(x1, y0, z1), c(x1, y1, z1), c(x0, y1, z1)], col)                        # top
        yf = y0 if ca > 0 else y1; xf = x0 if sa > 0 else x1                                              # the two faces turned to the eye
        s.quad([c(x0, yf, z0), c(x1, yf, z0), c(x1, yf, z1), c(x0, yf, z1)], sh(0.78))
        s.quad([c(xf, y0, z0), c(xf, y1, z0), c(xf, y1, z1), c(xf, y0, z1)], sh(0.60))
    def advance(s, d):
        rows = s.rows
        while s.iS < len(rows) and rows[s.byS[s.iS]][1] <= d:
            r = rows[s.byS[s.iS]]; s.iS += 1; s.placed += 1
            if r[11]: s.red += 1; s.box(r, RED)                      # breaks a truth at the moment it appears: red, and it stays red
            elif r[12]: s.orange += 1; s.box(r, ORANGE)              # the judge finds no support path to the ground: orange, stays
            else: s.live += 1; s.box(r, LIVE)
        while s.iE < len(rows) and rows[s.byE[s.iE]][2] <= d:
            r = rows[s.byE[s.iE]]; s.iE += 1
            if not (r[11] or r[12]): s.live -= 1; s.box(r, PHASE.get(r[3], (160, 160, 160)))
    def image(s, d):
        im = Image.fromarray(s.col); g = ImageDraw.Draw(im)
        g.text((20, 14), s.label, font=F(-30), fill=(255, 255, 255))
        g.text((20, 54), 'day %3d of %d   ·   built %s of %s' % (min(d, s.D['days']), round(s.D['days']), format(s.placed, ','), format(len(s.rows), ',')), font=F(20), fill=(200, 205, 212))
        t1 = 'out of order when they appear: '; g.text((20, H - 54), t1, font=F(22), fill=(200, 205, 212)); x = 20 + g.textlength(t1, font=F(22))
        g.text((x, H - 58), format(s.red, ','), font=F(-28), fill=RED if s.red else (120, 220, 140)); x += g.textlength(format(s.red, ',') + '   ', font=F(-28))
        t2 = 'no support path found: '; g.text((x, H - 54), t2, font=F(22), fill=(200, 205, 212)); g.text((x + g.textlength(t2, font=F(22)), H - 58), format(s.orange, ','), font=F(-28), fill=ORANGE if s.orange else (120, 220, 140))
        return im

pa, pb = Panel(A, a.labA), Panel(B, a.labB)
say('§FILM_RENDER title="%s" frames=%d panel=%dx%d view az=%.0f tilt=%.0f scale=%.2f px/m days=%.0f | A n=%d outOfOrder=%d noPath=%d | B n=%d outOfOrder=%d noPath=%d' % (
    a.title, a.frames, W, H, a.az, a.tilt, S, DAYS, A['n'], A['broken'], A['nopath'], B['n'], B['broken'], B['nopath']))
for f in range(a.frames + a.hold):
    d = DAYS * min(f, a.frames - 1) / (a.frames - 1) if f < a.frames else DAYS + 1
    pa.advance(d); pb.advance(d)
    fr = Image.new('RGB', (W * 2, H), BG); fr.paste(pa.image(d), (0, 0)); fr.paste(pb.image(d), (W, 0))
    ImageDraw.Draw(fr).line([(W, 0), (W, H)], fill=(60, 64, 72), width=2)
    fr.save(os.path.join(a.out, 'f%05d.png' % f), compress_level=1)
    if f % 120 == 0 or f == a.frames - 1: say('§FILM_FRAME f=%d day=%.1f BEFORE placed=%d red=%d live=%d | AFTER placed=%d red=%d live=%d' % (f, d, pa.placed, pa.red, pa.live, pb.placed, pb.red, pb.live))
# self-check (PRIMAL LAW 4) and THE MACHINE'S EYES: the counters must equal the rows' own totals, every element must have been painted, and the last
# frame is read back pixel by pixel — exact red / orange pixels are counted per panel. A panel with no broken element must show no red pixel.
def eyes(p):
    c = p.col.reshape(-1, 3); k = lambda col: int(((c[:, 0] == col[0]) & (c[:, 1] == col[1]) & (c[:, 2] == col[2])).sum())
    shade = lambda col, f: tuple(int(v * f) for v in col)
    return sum(k(shade(RED, f)) for f in (1, 0.78, 0.60)), sum(k(shade(ORANGE, f)) for f in (1, 0.78, 0.60))
ok = pa.placed == A['n'] and pb.placed == B['n']
for nm, p, D in (('A', pa, A), ('B', pb, B)):
    rows_red = sum(1 for r in D['rows'] if r[11]); rp, op = eyes(p)
    good = p.red == rows_red and (rows_red > 0 or rp == 0); ok = ok and good
    say('§FILM_EYES panel=%s label="%s" elementsOutOfOrder=%d (rows say %d) redPixelsInLastFrame=%d orangePixels=%d -> %s' % (nm, p.label, p.red, rows_red, rp, op, 'PASS' if good else 'FAIL'))
say('§FILM_SELFCHECK allPainted=%s -> %s' % (pa.placed == A['n'] and pb.placed == B['n'], 'PASS' if ok else 'FAIL'))
