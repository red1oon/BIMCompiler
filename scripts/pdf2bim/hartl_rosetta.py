# ⚠ DO NOT REMOVE — PDF2BIM_VECTOR_PROBE.md §57: a published German house plan read against the answers it prints (room areas, overall size). Read the log after every run (§HR lines).
# Implementing PDF2BIM_VECTOR_PROBE.md §57 — Witness: W-S57a (per plan: scale axes agree, labels matched, area error), falsifier (labels of another plan must not fit)
# Usage: python3 -P hartl_rosetta.py <plan.png> [<labels_from.png>]   -> one JSON line '§HR_JSON {...}' + § lines
#   READ (OCR, tesseract as §43/§54.2): the overall size labels 'x,xx m' outside the house (horizontal = width, vertical = depth), the room area labels 'xx,xx m2' inside it.
#   MEASURED (geometry, no OCR): walls = dark ink (grey < WALL_CUT) after removing strokes thinner than 3 px (text, leaders); the house = the largest wall body; scale = its
#   outer bbox / the READ size per axis; rooms = regions of the house interior the walls enclose once door gaps (<= DOOR_M along a wall line) are bridged. A region holding
#   several labels is an open-plan zone: compared with the SUM of its labels (stated). Every value logged; nothing typed from the plan.
import sys, os, re, json, subprocess, tempfile
import numpy as np
from PIL import Image
from collections import deque

WALL_CUT, DOOR_M, ZOOM = 140, 1.0, 4
def log(*a): print(*a, flush=True)
src = sys.argv[1]; lab_src = sys.argv[2] if len(sys.argv) > 2 else src
name = os.path.basename(src)

def ocr(img, psm='11', cut=WALL_CUT):
    """tesseract tsv on an upscaled copy, thresholded at `cut` (None = the grey page): [(text, x0, y0, x1, y1) in the copy's px / ZOOM]"""
    big = img.resize((img.width * ZOOM, img.height * ZOOM), Image.LANCZOS)
    if cut: big = big.point(lambda v: 0 if v < cut else 255)
    fd, p = tempfile.mkstemp(suffix='.png'); os.close(fd); big.save(p)
    r = subprocess.run(['tesseract', p, '-', '--psm', psm, 'tsv'], capture_output=True, text=True); os.remove(p)
    out = []
    for ln in r.stdout.splitlines()[1:]:
        f = ln.split('\t')
        if len(f) == 12 and f[11].strip() and float(f[10]) > 30:
            x, y, w, h = (int(f[i]) / ZOOM for i in (6, 7, 8, 9)); out.append((f[11].strip(), x, y, x + w, y + h))
    return out

def morph(M, k, axis, op):
    """1-D dilation / erosion of a bool mask with a line of k px along axis (0 = vertical, 1 = horizontal), numpy only"""
    R = M.copy(); r = k // 2
    for s in range(-r, k - r):
        if s == 0: continue
        S = np.roll(M, s, axis=axis)
        if s > 0: (S.__setitem__((slice(0, s),) if axis == 0 else (slice(None), slice(0, s)), op == 'erode'))
        else: (S.__setitem__((slice(s, None),) if axis == 0 else (slice(None), slice(s, None)), op == 'erode'))
        R = (R | S) if op == 'dilate' else (R & S)
    return R
def opening3(M): return morph(morph(morph(morph(M, 3, 0, 'erode'), 3, 1, 'erode'), 3, 0, 'dilate'), 3, 1, 'dilate')
def close_line(M, k, axis): return morph(morph(M, k, axis, 'dilate'), k, axis, 'erode')

def components(M):
    H, W = M.shape; lab = np.zeros((H, W), np.int32); n = 0; info = []
    for y in range(H):
        for x in np.where(M[y] & (lab[y] == 0))[0]:
            if lab[y, x]: continue
            n += 1; q = deque([(y, x)]); lab[y, x] = n; cnt = 0; edge = False; y0 = y1 = y; x0 = x1 = x
            while q:
                cy, cx = q.popleft(); cnt += 1; y0 = min(y0, cy); y1 = max(y1, cy); x0 = min(x0, cx); x1 = max(x1, cx)
                for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    yy, xx = cy + dy, cx + dx
                    if 0 <= yy < H and 0 <= xx < W:
                        if M[yy, xx] and not lab[yy, xx]: lab[yy, xx] = n; q.append((yy, xx))
                    else: edge = True
            info.append(dict(n=n, px=cnt, edge=edge, box=(x0, y0, x1, y1)))
    return lab, info

img = Image.open(src).convert('L'); g = np.asarray(img).astype(int); H, W = g.shape
walls = opening3(g < WALL_CUT)
lab, info = components(walls)
if not info: sys.exit(log(f'§HR {name} verdict=INCONCLUSIVE no wall ink'))
# the house = every wall piece of at least 3 % of the wall ink (windows split the outer walls into pieces; posts, arrows, symbols are small)
tot = sum(c['px'] for c in info); big_c = [c for c in info if c['px'] >= 0.03 * tot]
X0 = min(c['box'][0] for c in big_c); Y0 = min(c['box'][1] for c in big_c); X1 = max(c['box'][2] for c in big_c); Y1 = max(c['box'][3] for c in big_c)
hw = np.isin(lab, [c['n'] for c in big_c])
log(f"§HR_WALLS {name} wall_components={len(info)} house_pieces={len(big_c)} ({sum(c['px'] for c in big_c)} of {tot} px) outer_bbox_px=({X0},{Y0})-({X1},{Y1}) = {X1 - X0 + 1} x {Y1 - Y0 + 1}")

# READ the overall size: 'x,xx m' tokens outside the house bbox; horizontal pass -> width, the 90°-rotated pass -> depth
NUM = re.compile(r'^(\d{1,2})[,.](\d{2})$')
def overall(tokens, inside):
    out = []
    for i, (t, x0, y0, x1, y1) in enumerate(tokens):
        m = NUM.match(t.rstrip('.,')); nxt = tokens[i + 1][0] if i + 1 < len(tokens) else ''
        if m and re.match(r'^m\b|^m$|^mM', nxt) and not inside(x0, y0, x1, y1): out.append((float(f'{m.group(1)}.{m.group(2)}'), (x0, y0, x1, y1)))
    return out
inside_h = lambda x0, y0, x1, y1: X0 < (x0 + x1) / 2 < X1 and Y0 < (y0 + y1) / 2 < Y1
CUTS = (WALL_CUT, 200, None)   # size text on a JPEG plan is lighter than the wall cut (measured, Avantgarde 95 F): three passes, merged
def ocr3(im): return [t for c in CUTS for t in ocr(im, cut=c) + [('', 0, 0, 0, 0)]]   # an empty separator token: a value never pairs with the next pass's first token
TH = ocr3(img)
# a depth label reads bottom-to-top (left side) or top-to-bottom (right side): both rotations. Rotated 90° CW: page (x, y) -> (H-1-y, x); 90° CCW: page (x, y) -> (y, W-1-x)
TCW = ocr3(img.rotate(-90, expand=True)); TCCW = ocr3(img.rotate(90, expand=True))
in_cw = lambda x0, y0, x1, y1: inside_h((y0 + y1) / 2, H - 1 - (x0 + x1) / 2, (y0 + y1) / 2, H - 1 - (x0 + x1) / 2)
in_ccw = lambda x0, y0, x1, y1: inside_h(W - 1 - (y0 + y1) / 2, (x0 + x1) / 2, W - 1 - (y0 + y1) / 2, (x0 + x1) / 2)
oh = overall(TH, inside_h); ov = overall(TCW, in_cw) + overall(TCCW, in_ccw)
# the OVERALL size is the largest size label on each axis (measured: an L-shaped plan also prints its segment sizes, e.g. 13,30 m with 7,20 / 5,62 / 3,99 m)
oh = sorted(oh, key=lambda o: -o[0]); ov = sorted(ov, key=lambda o: -o[0])
log(f"§HR_SIZE_LABELS {name} horizontal={[o[0] for o in oh]} vertical={[o[0] for o in ov]} -> width=max, depth=max")
if not oh or not ov:
    log(f"§HR {name} verdict=INCONCLUSIVE overall size not READ (width tokens {[o[0] for o in oh]}, depth tokens {[o[0] for o in ov]})")
    print('§HR_JSON ' + json.dumps(dict(plan=name, verdict='INCONCLUSIVE', why='overall size not read'))); sys.exit(0)
WX, WY = oh[0][0], ov[0][0]; sx, sy = (X1 - X0 + 1) / WX, (Y1 - Y0 + 1) / WY; agree = abs(sx - sy) / max(sx, sy)
log(f"§HR_SCALE {name} READ width={WX} m depth={WY} m -> px_per_m x={sx:.2f} y={sy:.2f} disagreement={agree:.1%} ({'PASS' if agree <= 0.02 else 'FAIL'} <= 2 %)")
if agree > 0.02:
    print('§HR_JSON ' + json.dumps(dict(plan=name, verdict='INCONCLUSIVE', why=f'scale axes disagree {agree:.1%}', sx=sx, sy=sy, width=WX, depth=WY))); sys.exit(0)

# MEASURED rooms. An opening (door, window) is a gap in ONE wall line: in a row, a gap between two wall pixels is bridged when both ends lie in a wall band thinner than
# 0.5 m across the row (a horizontal wall, not the thick side of a perpendicular one) and the gap is <= 4 m; the same down each column. A room's interior row ends on
# perpendicular walls (long runs across the row), so it is never bridged. Footprint = the bridged walls with their holes filled, inside the outer wall faces.
K = (sx + sy) / 2; TMAX, GMAX = 0.5 * K, 4.0 * K
def runlen(M, axis):
    """per pixel: length of the run of M through it along axis"""
    A = M if axis == 0 else M.T; R = np.zeros(A.shape, int)
    for j in range(A.shape[1]):
        col = A[:, j].astype(np.int8); d = np.diff(np.concatenate(([0], col, [0]))); st = np.where(d == 1)[0]; en = np.where(d == -1)[0]
        for a_, b_ in zip(st, en): R[a_:b_, j] = b_ - a_
    return R if axis == 0 else R.T
def bridge(M):
    out = M.copy(); vr = runlen(M, 0); hr = runlen(M, 1); nb = 0
    for y in range(M.shape[0]):   # horizontal openings
        xs = np.where(M[y])[0]
        for a_, b_ in zip(xs[:-1], xs[1:]):
            if 1 < b_ - a_ <= GMAX and vr[y, a_] <= TMAX and vr[y, b_] <= TMAX: out[y, a_:b_] = True; nb += 1
    for x in range(M.shape[1]):   # vertical openings
        ys = np.where(M[:, x])[0]
        for a_, b_ in zip(ys[:-1], ys[1:]):
            if 1 < b_ - a_ <= GMAX and hr[a_, x] <= TMAX and hr[b_, x] <= TMAX: out[a_:b_, x] = True; nb += 1
    return out, nb
bb = np.zeros_like(hw); bb[Y0:Y1 + 1, X0:X1 + 1] = True
wr, nbr = bridge(walls & bb)
out_lab, out_info = components(~wr); fp = bb.copy()
for c in out_info:
    if c['edge'] or any(c['box'][i] in (X0, Y0, X1, Y1)[i:i + 1] for i in ()): fp[out_lab == c['n']] = False
# a region of ~wr that touches the outer bbox edge is outdoors (an L-shaped house's notch); inside regions are rooms
for c in out_info:
    x0_, y0_, x1_, y1_ = c['box']
    if x0_ <= X0 or y0_ <= Y0 or x1_ >= X1 or y1_ >= Y1: fp[out_lab == c['n']] = False
log(f"§HR_BRIDGE {name} opening rows/columns bridged={nbr} (gap <= 4 m, both ends in a wall band < 0.5 m thick)")
rlab, rinfo = components(fp & ~wr)

# READ the room area labels: 'xx,xx' followed by 'm2' / 'm²' / 'm' inside the house, from the LABEL plan (the plan itself, or another for the falsifier)
L_img = Image.open(lab_src).convert('L') if lab_src != src else img
# room text is anti-aliased grey (measured: 108..232 on Classic 132 S), lighter than the wall cut: three passes (grey page, cut 200, cut 180), merged by position
labels = []
for TL in (ocr(L_img, cut=None), ocr(L_img, cut=200), ocr(L_img, cut=180)):
    for i, (t, x0, y0, x1, y1) in enumerate(TL):
        m = re.match(r'^[^\d]?(\d{1,3})[,.](\d{2})', t); nxt = TL[i + 1][0] if i + 1 < len(TL) else ''
        if not (m and (re.match(r'^m', nxt) or re.search(r'm[2²?]?$', t)) and inside_h(x0, y0, x1, y1)): continue
        a = float(f'{m.group(1)}.{m.group(2)}'); c = ((x0 + x1) / 2, (y0 + y1) / 2)
        if any(abs(L['at'][0] - c[0]) <= 10 and abs(L['at'][1] - c[1]) <= 6 for L in labels):
            for L in labels:
                if abs(L['at'][0] - c[0]) <= 10 and abs(L['at'][1] - c[1]) <= 6: L['reads'].append(a)
            continue
        labels.append(dict(area=a, at=c, reads=[a]))
for L in labels: L['area'] = max(set(L['reads']), key=L['reads'].count)   # the passes' majority read
log(f"§HR_LABELS {name} " + ' '.join(f"{L['area']}@({L['at'][0]:.0f},{L['at'][1]:.0f}){'' if len(set(L['reads'])) == 1 else ' reads=' + str(L['reads'])}" for L in labels))
by = {}
for L in labels:
    cx, cy = int(L['at'][0]), int(L['at'][1]); n = 0
    for r in range(0, 12):   # the label's own pixels are not walls; search a small ring for the region it sits in
        win = rlab[max(0, cy - r):cy + r + 1, max(0, cx - r):cx + r + 1]; v = win[win > 0]
        if len(v): n = int(np.bincount(v).argmax()); break
    if n: by.setdefault(n, []).append(L['area'])
    else: log(f"§HR_LABEL {name} area={L['area']} at={L['at']} -> in no room region (on a wall or outside)")
rooms = []
for n, areas in by.items():
    px = int((rlab == n).sum()); m2 = px / (sx * sy); pr = sum(areas); err = (m2 - pr) / pr
    rooms.append(dict(labels=areas, printed=round(pr, 2), measured=round(m2, 2), err=round(err, 4)))
    log(f"§HR_ROOM {name} labels={areas} printed={pr:.2f} m2 measured={m2:.2f} m2 err={err:+.1%}" + (' (open-plan zone: sum of labels)' if len(areas) > 1 else ''))
errs = [abs(r['err']) for r in rooms]
v = dict(plan=name, labels_from=os.path.basename(lab_src), verdict='JUDGED' if rooms else 'INCONCLUSIVE', width=WX, depth=WY, sx=round(sx, 3), sy=round(sy, 3),
         labels=len(labels), labels_matched=sum(len(r['labels']) for r in rooms), rooms=rooms,
         median_abs_err=round(float(np.median(errs)), 4) if errs else None, worst_abs_err=round(max(errs), 4) if errs else None)
log(f"§HR_W-S57a {name} labels={v['labels']} matched={v['labels_matched']} regions={len(rooms)} median|err|={v['median_abs_err']} worst|err|={v['worst_abs_err']} verdict={v['verdict']}")
print('§HR_JSON ' + json.dumps(v))
