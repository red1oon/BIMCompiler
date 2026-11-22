# Implementing PDF2BIM_VECTOR_PROBE.md §43 step 0 — Witness: W-S2, W-S3, W-S4, W-S5 (probe, not product)
# Usage: python3 -P raster_probe.py <page.png rendered at 200 dpi> <workdir>  > raster_probe.log
# Reads a SCANNED plan page: removes blue markup ink, deskews, finds long H/V dimension lines with
# ticks, OCRs the numbers above each (LOCAL Tesseract CLI only), checks every chain's checksum.
import sys, os, subprocess
from collections import deque
import numpy as np
from PIL import Image

def log(*a): print(*a, flush=True)

page, work = sys.argv[1], sys.argv[2]
os.makedirs(work, exist_ok=True)
DPI = 200
rgb = np.asarray(Image.open(page).convert('RGB')).astype(np.int16)
H, W, _ = rgb.shape
R, G, B = rgb[..., 0], rgb[..., 1], rgb[..., 2]

# --- W-S3 blue markup separation ---
xb = B - np.maximum(R, G)
hist = np.bincount(np.clip(xb, 0, 255).ravel(), minlength=256)
BLUE_T = 40  # stated: printed black/grey ink has excess-blue ~0; histogram tail logged so the choice is visible
blue = xb > BLUE_T
log(f"§RASTER_BLUE page={W}x{H} thr={BLUE_T} blue_px={int(blue.sum())} "
    f"tail>20={int(hist[21:].sum())} tail>40={int(hist[41:].sum())} tail>80={int(hist[81:].sum())}")
gray = rgb.mean(axis=2)
gray[blue] = 255

# --- W-S2 deskew: angle maximising the row-projection variance of the ink (projection profile) ---
def otsu(g):
    gh = np.bincount(g.astype(np.uint8).ravel(), minlength=256).astype(float)
    p = gh / gh.sum(); om = np.cumsum(p); mu = np.cumsum(p * np.arange(256)); mt = mu[-1]
    return int(np.argmax((mt * om - mu) ** 2 / (om * (1 - om) + 1e-12)))
OT = otsu(gray)
gimg = Image.fromarray(gray.astype(np.uint8))
small = np.asarray(gimg.resize((W // 2, H // 2))) < OT
best = (0, -1)
for a10 in range(-100, 101, 2):  # -1.00 .. +1.00 deg, 0.02 step
    a = a10 / 100
    r = np.asarray(Image.fromarray((small * 255).astype(np.uint8)).rotate(a, resample=Image.BILINEAR)) > 127
    v = r.sum(axis=1).astype(float).var()
    if v > best[1]: best = (a, v)
SKEW = best[0]
gimg = gimg.rotate(SKEW, resample=Image.BICUBIC, fillcolor=255)
gray = np.asarray(gimg).astype(float)
ink = gray < OT
log(f"§RASTER_SKEW deg={SKEW:+.2f} otsu={OT} ink_pct={100*ink.mean():.2f}")

MINLEN = 300   # px at 200 dpi = 38 mm of paper; stated
GAP = 3        # px bridged inside a line (scan dropouts); stated

def line_runs(img):
    out = []
    for y in range(img.shape[0]):
        xs = np.where(img[y])[0]
        if len(xs) < MINLEN: continue
        br = np.where(np.diff(xs) > GAP + 1)[0]
        starts = np.concatenate(([xs[0]], xs[br + 1])); ends = np.concatenate((xs[br], [xs[-1]]))
        for a, b in zip(starts, ends):
            if b - a >= MINLEN: out.append((y, int(a), int(b)))
    merged = []
    for y, a, b in out:
        for m in merged:
            if y - m[1] <= 1 and min(b, m[3]) - max(a, m[2]) > 0.5 * (b - a):
                m[1] = y; m[2] = min(m[2], a); m[3] = max(m[3], b); break
        else:
            merged.append([y, y, a, b])
    merged.sort(key=lambda m: (m[0], m[2])); col = []
    for m in merged:
        for c in col:
            if abs(m[0] - c[0]) <= 1 and -15 <= m[2] - c[3] <= 15 + 0 and m[2] >= c[2]:
                c[1] = max(c[1], m[1]); c[3] = max(c[3], m[3]); break
        else:
            col.append(list(m))
    return [m for m in col if m[1] - m[0] <= 3]  # thin = dimension line, not a wall face pair

def ticks(img, y0, y1, a, b):
    def run(x, y, step):
        n = 0; miss = 0
        while 0 <= y < img.shape[0] and n < 12:
            if img[y, x]: n += 1; miss = 0
            else:
                miss += 1
                if miss > 1: break
            y += step
        return n
    xs = [x for x in range(a, b + 1) if run(x, y0 - 1, -1) >= 4 and run(x, y1 + 1, 1) >= 4]
    groups = []
    for x in xs:
        if groups and x - groups[-1][-1] <= 3: groups[-1].append(x)
        else: groups.append([x])
    return [int(np.mean(g)) for g in groups]

def components(mask):
    lab = np.zeros(mask.shape, int); n = 0; boxes = []
    for y0, x0 in zip(*np.where(mask)):
        if lab[y0, x0]: continue
        n += 1; q = deque([(y0, x0)]); lab[y0, x0] = n; ys = [y0]; xs = [x0]
        while q:
            y, x = q.popleft()
            for dy in (-1, 0, 1):
                for dx in (-1, 0, 1):
                    yy, xx = y + dy, x + dx
                    if 0 <= yy < mask.shape[0] and 0 <= xx < mask.shape[1] and mask[yy, xx] and not lab[yy, xx]:
                        lab[yy, xx] = n; q.append((yy, xx)); ys.append(yy); xs.append(xx)
        boxes.append((min(ys), max(ys), min(xs), max(xs), len(ys)))
    return boxes

def tess(arr, tag, psm, wl, k=4):
    f = os.path.join(work, tag + '.png')
    im = Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8))
    im.resize((im.width * k, im.height * k), Image.LANCZOS).save(f)
    r = subprocess.run(['tesseract', f, 'stdout', '--psm', str(psm), '-c', f'tessedit_char_whitelist={wl}', 'tsv'],
                       capture_output=True, text=True)
    ws = []
    for ln in r.stdout.splitlines()[1:]:
        c = ln.split('\t')
        if len(c) == 12 and c[11].strip():
            ws.append(dict(t=c[11].strip(), x=int(c[6]) / k, y=int(c[7]) / k, w=int(c[8]) / k,
                           h=int(c[9]) / k, conf=float(c[10])))
    return ws

def value(main, sup):
    # chain notation: "3,38"+"5" -> 3.385 m ; "36"+"5" (no separator) -> 0.365 m (cm)
    m = main.replace('.', ',').strip(',')
    if m.count(',') == 1:
        a, _, b = m.partition(',')
        if a.isdigit() and b.isdigit(): return float(a + '.' + b + (sup or ''))
        return None
    if m.isdigit() and len(m) <= 3:
        return float(m + ('.' + sup if sup else '')) / 100.0
    return None

def read_word(gband, iband, w, tag):
    """Split a word box into main glyphs and a raised digit by geometry, OCR each alone."""
    x0 = max(0, int(w['x']) - 2); x1 = min(gband.shape[1], int(w['x'] + w['w']) + 14)
    y0 = max(0, int(w['y']) - 6); y1 = min(gband.shape[0], int(w['y'] + w['h']) + 2)
    comps = [c for c in components(iband[y0:y1, x0:x1]) if c[4] >= 4]
    if not comps: return None, None
    base = max(c[1] for c in comps); hmax = max(c[1] - c[0] for c in comps) + 1
    raised = [c for c in comps if base - c[1] > 0.3 * hmax and (c[1] - c[0] + 1) > 0.35 * hmax]
    main = [c for c in comps if c not in raised]
    if not main: return None, None
    mx0 = min(c[2] for c in main); mx1 = max(c[3] for c in main)
    my0 = min(c[0] for c in main); my1 = max(c[1] for c in main)
    pad = 10
    sub = np.full((my1 - my0 + 1 + 2 * pad, mx1 - mx0 + 1 + 2 * pad), 255.0)
    sub[pad:-pad, pad:-pad] = gband[y0 + my0:y0 + my1 + 1, x0 + mx0:x0 + mx1 + 1]
    mt = ''.join(q['t'] for q in tess(sub, tag + 'm', 7, '0123456789,.', 6))
    st = None
    if raised:
        r = max(raised, key=lambda c: c[3])
        if r[2] >= mx1 - 2:  # raised digit sits right of the main number
            s2 = np.full((r[1] - r[0] + 1 + 2 * pad, r[3] - r[2] + 1 + 2 * pad), 255.0)
            s2[pad:-pad, pad:-pad] = gband[y0 + r[0]:y0 + r[1] + 1, x0 + r[2]:x0 + r[3] + 1]
            st = ''.join(q['t'] for q in tess(s2, tag + 's', 10, '0123456789', 8)) or '?'
    return mt, st

# --- GLYPH READER (§43 step 0b): one CAD font per sheet -> cluster glyph shapes, label a cluster by
# the MAJORITY of single-glyph OCR votes over its members. Dots and raised digits come from geometry.
NB = (14, 10)  # normalised glyph bitmap (h, w)
def norm(bm):
    im = Image.fromarray((bm * 255).astype(np.uint8)).resize((NB[1], NB[0]), Image.BILINEAR)
    return np.asarray(im).astype(float) / 255.0

def band_glyphs(img, g, y0, a, b, dname, pos):
    bx0 = max(0, a - 20); by0 = max(0, y0 - 30)
    ib = img[by0:y0 - 1, bx0:b + 20]
    out = []
    for (t, bt, l, r, n) in components(ib):
        h = bt - t + 1; w = r - l + 1
        if bt >= ib.shape[0] - 2 and w <= 3: continue          # tick stub touching the line
        out.append(dict(dir=dname, pos=pos, t=by0 + t, b=by0 + bt, l=bx0 + l, r=bx0 + r, h=h, w=w, n=n,
                        bm=ib[t:bt + 1, l:r + 1].copy(), g=g[by0 + t:by0 + bt + 1, bx0 + l:bx0 + r + 1].copy()))
    return out

lines_all = []; glyphs = []
for dname, img, g in (('H', ink, gray), ('V', np.rot90(ink, k=-1), np.rot90(gray, k=-1))):
    ls = line_runs(img)
    log(f"§RASTER_LINES dir={dname} n={len(ls)} minlen={MINLEN} gap={GAP}")
    for (y0, y1, a, b) in ls:
        tk = ticks(img, y0, y1, a, b)
        if len(tk) < 2: continue
        lines_all.append(dict(dir=dname, y=y0, a=a, b=b, ticks=tk))
        glyphs += band_glyphs(img, g, y0, a, b, dname, y0)

# size classes from the measured height histogram (not constants): main digits = the modal tall height
hs = np.array([q['h'] for q in glyphs]) if glyphs else np.array([0])
hh = np.bincount(hs); HMAIN = int(np.argmax(hh[6:]) + 6) if len(hh) > 6 else 0
log(f"§RASTER_GLYPH_H n={len(glyphs)} hist(6..20)={hh[6:21].tolist()} main_h={HMAIN}")
digits = [q for q in glyphs if 0.55 * HMAIN <= q['h'] <= 1.25 * HMAIN and q['w'] <= 1.0 * HMAIN]
dots = [q for q in glyphs if q['h'] <= 0.35 * HMAIN and q['w'] <= 0.35 * HMAIN and q['n'] >= 2]
wide = [q for q in glyphs if 0.55 * HMAIN <= q['h'] <= 1.25 * HMAIN and q['w'] > 1.0 * HMAIN]
log(f"§RASTER_GLYPH_CLASS digits={len(digits)} dots={len(dots)} wide_unsplit={len(wide)} other={len(glyphs)-len(digits)-len(dots)-len(wide)}")

# cluster (greedy, correlation of normalised bitmaps + aspect)
CL_T = 0.80
clusters = []
for q in digits:
    v = norm(q['bm']); q['v'] = v; asp = q['w'] / q['h']
    best = None
    for c in clusters:
        if abs(asp - c['asp']) > 0.25: continue
        a1 = v - v.mean(); a2 = c['v'] - c['v'].mean()
        cor = (a1 * a2).sum() / (np.sqrt((a1 * a1).sum() * (a2 * a2).sum()) + 1e-9)
        if cor >= CL_T and (best is None or cor > best[0]): best = (cor, c)
    if best:
        c = best[1]; c['m'].append(q); k = len(c['m']); c['v'] = c['v'] + (v - c['v']) / k; c['asp'] += (asp - c['asp']) / k
    else:
        clusters.append(dict(v=v, asp=asp, m=[q]))
VOTES = 15
for ci, c in enumerate(clusters):
    votes = {}
    for j, q in enumerate(c['m'][:VOTES]):
        pad = 8; s2 = np.full((q['g'].shape[0] + 2 * pad, q['g'].shape[1] + 2 * pad), 255.0)
        s2[pad:-pad, pad:-pad] = q['g']
        t = ''.join(x['t'] for x in tess(s2, f'c{ci}_{j}', 10, '0123456789', 8))
        if len(t) == 1: votes[t] = votes.get(t, 0) + 1
    tot = sum(votes.values()); top = max(votes.items(), key=lambda kv: kv[1]) if votes else ('?', 0)
    c['label'] = top[0] if tot >= 2 and top[1] / max(tot, 1) >= 0.6 else '?'
    for q in c['m']: q['lab'] = c['label']
    log(f"§RASTER_GLYPH_CLUSTER id={ci} n={len(c['m'])} asp={c['asp']:.2f} votes={dict(sorted(votes.items()))} label={c['label']}")
nl = sum(len(c['m']) for c in clusters if c['label'] != '?')
log(f"§RASTER_GLYPH_LABELLED clusters={len(clusters)} glyphs={len(digits)} labelled={nl} unlabelled={len(digits)-nl}")

def words_in(L, Rr, dname, pos):
    gs = [q for q in digits if q['dir'] == dname and q['pos'] == pos and L - 30 <= (q['l'] + q['r']) / 2 <= Rr + 30]
    if not gs: return []
    base = np.median([q['b'] for q in gs])
    main = [q for q in gs if q['b'] >= base - 0.25 * HMAIN]
    raised = [q for q in gs if q['b'] < base - 0.25 * HMAIN]
    main.sort(key=lambda q: q['l'])
    words = []
    for q in main:
        if words and q['l'] - words[-1][-1]['r'] <= 0.9 * HMAIN: words[-1].append(q)
        else: words.append([q])
    out = []
    for w in words:
        l, r = w[0]['l'], w[-1]['r']
        txt = ''
        for i, q in enumerate(w):
            txt += q['lab']
            if i + 1 < len(w):
                nxt = w[i + 1]
                if any(d['dir'] == dname and d['pos'] == pos and q['r'] - 1 <= d['l'] and d['r'] <= nxt['l'] + 1
                       and d['b'] >= base - 3 for d in dots):
                    txt += ','
        sup = [q for q in raised if r - 2 <= q['l'] <= r + 0.9 * HMAIN]
        st = sup[0]['lab'] if sup else None
        out.append(dict(l=l, r=r, c=(l + r) / 2, txt=txt, sup=st))
    return out

chains = []
for ln in lines_all:
    tk = ln['ticks']; segs = []
    for i in range(len(tk) - 1):
        L, Rr = tk[i], tk[i + 1]
        ws = [w for w in words_in(L, Rr, ln['dir'], ln['y']) if L - 4 <= w['c'] <= Rr + 4]
        if not ws: segs.append(dict(L=L, R=Rr, txt=None, v=None)); continue
        w = max(ws, key=lambda w: w['r'] - w['l'])
        ok = '?' not in w['txt'] and (w['sup'] in (None,) or w['sup'].isdigit())
        v = value(w['txt'], w['sup']) if ok else None
        segs.append(dict(L=L, R=Rr, txt=w['txt'] + ('^' + w['sup'] if w['sup'] else ''), v=v))
    ln['segs'] = segs; chains.append(ln)
    log(f"§RASTER_CHAIN dir={ln['dir']} pos={ln['y']} ext={ln['a']}..{ln['b']} ticks={len(tk)} "
        f"segs=" + ' | '.join(str(s['txt']) for s in segs))

# --- W-S4 checksum: a multi-segment chain vs a single-segment chain of the same tick extent ---
RES = 0.005  # notation resolution = the raised 5 mm digit; |sum - overall| <= 1 unit
green = yellow = 0; pxm = {'H': [], 'V': []}
for c in chains:
    if len(c['segs']) < 2: continue
    if not any(s['txt'] for s in c['segs']):
        notchain = globals().setdefault('notchain', [0]); notchain[0] += 1; continue
    vals = [s['v'] for s in c['segs']]
    span = (c['ticks'][0], c['ticks'][-1])
    over = [o for o in chains if o is not c and o['dir'] == c['dir'] and len(o['segs']) == 1
            and abs(o['ticks'][0] - span[0]) <= 6 and abs(o['ticks'][-1] - span[1]) <= 6 and o['segs'][0]['v']]
    tag = f"dir={c['dir']} pos={c['y']} segs=" + ' | '.join(str(s['txt']) for s in c['segs'])
    if None in vals:
        yellow += 1
        log(f"§RASTER_CHECKSUM {tag} verdict=YELLOW reason=unread_segment read={sum(v is not None for v in vals)}/{len(vals)}")
        continue
    tot = sum(vals)
    if not over:
        yellow += 1
        log(f"§RASTER_CHECKSUM {tag} sum={tot:.3f} verdict=YELLOW reason=no_overall_chain"); continue
    ov = over[0]['segs'][0]['v']; d = tot - ov
    ok = abs(d) <= RES + 1e-9
    green += ok; yellow += (not ok)
    log(f"§RASTER_CHECKSUM {tag} sum={tot:.3f} overall={ov:.3f} d={d*1000:+.0f}mm verdict={'GREEN' if ok else 'YELLOW'}")
    if ok:
        for s in c['segs']: pxm[c['dir']].append((s['R'] - s['L'], s['v']))
        pxm[c['dir']].append((over[0]['ticks'][-1] - over[0]['ticks'][0], ov))
judged = green + yellow
log(f"§RASTER_W-S4 chains={len(chains)} no_number_lines={globals().get('notchain',[0])[0]} judged={judged} green={green} yellow={yellow} "
    f"verdict={'INCONCLUSIVE' if judged == 0 else ('PASS' if yellow == 0 else 'PARTIAL')}")

# --- W-S5 scale from GREEN chains only (least squares px = k * m, segments >= 1 m) ---
ks = {}
for d, pts in pxm.items():
    pts = [(p, v) for p, v in pts if v >= 1.0]
    if pts:
        px = np.array([p for p, _ in pts], float); m = np.array([v for _, v in pts], float)
        ks[d] = float((px * m).sum() / (m * m).sum())
        log(f"§RASTER_SCALE dir={d} n={len(pts)} px_per_m={ks[d]:.3f} max_resid_px={np.abs(px - ks[d]*m).max():.2f}")
if len(ks) == 2:
    agree = abs(ks['H'] - ks['V']) / ks['H'] * 100
    printed = 1000 / 50 / 25.4 * DPI  # 1:50 -> 20 mm of paper per m -> px per m at DPI
    log(f"§RASTER_W-S5 H={ks['H']:.3f} V={ks['V']:.3f} agree_pct={agree:.2f} printed_1to50_px_per_m={printed:.2f} "
        f"paper_scale=1:{1000*DPI/(ks['H']*25.4):.1f} verdict={'PASS' if agree <= 0.5 else 'FAIL'}")
else:
    log(f"§RASTER_W-S5 verdict=INCONCLUSIVE dirs_with_green={list(ks)}")
