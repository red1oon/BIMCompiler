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
            if img[y, max(0, x - 1):x + 2].any(): n += 1; miss = 0   # 3-col window: ticks are short diagonals
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

# --- HYBRID READER (§43 step 0c) ---
# Main numbers: grey band OCR (reader b). Glyph geometry splits each word into main glyphs, dots and a
# raised digit. Template bank: main glyphs of words whose glyph count matches the OCR digits are labelled
# by that read. Raised digit: template match against the bank (threshold measured from the bank itself).
def nbm(bm):
    im = Image.fromarray((bm * 255).astype(np.uint8)).resize((10, 14), Image.BILINEAR)
    v = np.asarray(im).astype(float) / 255.0
    return v - v.mean()
def corr(a, b): return float((a * b).sum() / (np.sqrt((a * a).sum() * (b * b).sum()) + 1e-9))

def dedupe(ls):
    keep = []
    for m in sorted(ls, key=lambda m: -(m[3] - m[2])):
        if any(abs(m[0] - k[0]) <= 3 and m[2] >= k[2] - 6 and m[3] <= k[3] + 6 for k in keep): continue
        keep.append(m)
    return sorted(keep)

lines_all = []
for dname, img, g in (('H', ink, gray), ('V', np.rot90(ink, k=-1), np.rot90(gray, k=-1))):
    ls0 = line_runs(img); ls = dedupe(ls0)
    log(f"§RASTER_LINES dir={dname} n={len(ls)} dropped_dupes={len(ls0)-len(ls)} minlen={MINLEN} gap={GAP}")
    for i, (y0, y1, a, b) in enumerate(ls):
        tk = ticks(g < 215, y0, y1, a, b)   # ticks on the grey-inclusive mask: diagonal strokes fade to grey (pixel dump §43)
        if len(tk) < 2: continue
        bx0 = max(0, a - 20); by0 = max(0, y0 - 30)
        gb = g[by0:y0 - 1, bx0:b + 20]; ib = img[by0:y0 - 1, bx0:b + 20]
        ws = tess(gb, f'{dname}{i}', 11, '0123456789,.')
        cs = [c for c in components(ib) if c[4] >= 2 and not (c[1] >= ib.shape[0] - 2 and c[3] - c[2] <= 2)]
        lines_all.append(dict(dir=dname, y=y0, a=a, b=b, ticks=tk, bx0=bx0, ws=ws, cs=cs, ib=ib, gb=gb))

hs = np.array([c[1] - c[0] + 1 for L in lines_all for c in L['cs']])
hh = np.bincount(hs) if len(hs) else np.zeros(1, int)
HMAIN = int(np.argmax(hh[6:]) + 6) if len(hh) > 6 else 0
log(f"§RASTER_GLYPH_H n={len(hs)} hist(6..20)={hh[6:21].tolist()} main_h={HMAIN}")

bank = {}; nwords = nmatch = 0; nfb = [0]; nsplit = [0]; nresplit = [0]; dbg = [0]; nsep = [0]; gaps = []
DOT_GREY = 215  # stated: lighter than Otsu; the pixel dumps show the dot as grey 167..215
_ws = sorted(c[3] - c[2] + 1 for L in lines_all for c in L['cs'] if 0.75 * HMAIN <= c[1] - c[0] + 1 <= 1.25 * HMAIN and c[3] - c[2] + 1 > 2)
DIGW = float(np.median([x for x in _ws if x <= 0.75 * HMAIN and x >= 0.3 * HMAIN])) if _ws else 6.0
log(f"§RASTER_DIGW median_digit_w={DIGW:.1f} (from {len(_ws)} tall glyphs, 1-glyphs excluded by w>=0.3h)")
for L in lines_all:
    words = []
    for w in L['ws']:
        x0, x1 = w['x'] - 2, w['x'] + w['w'] + 0.9 * HMAIN
        y0, y1 = w['y'] - 6, w['y'] + w['h'] + 2
        cc = [c for c in L['cs'] if x0 <= (c[2] + c[3]) / 2 <= x1 and c[1] >= y0 and c[0] <= y1]
        tall = [c for c in cc if c[1] - c[0] + 1 >= 0.55 * HMAIN]
        if not tall: continue
        base = max(c[1] for c in tall)
        main = sorted([c for c in tall if c[1] >= base - 0.25 * HMAIN and c[2] <= w['x'] + w['w'] + 2], key=lambda c: c[2])
        if not main: continue
        mr = max(c[3] for c in main)
        raised = sorted([c for c in cc if c[1] < base - 0.25 * HMAIN and 0.35 * HMAIN <= c[1] - c[0] + 1
                         and c[2] >= mr - 2], key=lambda c: c[2])
        smalls = [c for c in cc if c[1] - c[0] + 1 < 0.55 * HMAIN and c not in raised]
        if os.environ.get('DBGWORD') == w['t']:
            log(f"§RASTER_WORD_DIAG dir={L['dir']} pos={L['y']} ocr={w['t']} box=({w['x']:.0f},{w['y']:.0f},{w['w']:.0f},{w['h']:.0f}) base={base} cc=" +
                ';'.join(f"x{c[2]}-{c[3]} y{c[0]}-{c[1]} n{c[4]}" for c in cc))
            sub = L['ib'][max(0, int(w['y']) - 6):int(w['y'] + w['h']) + 2, max(0, int(w['x']) - 2):int(w['x'] + w['w']) + 14]
            for row in sub: log('   ' + ''.join('#' if v else '.' for v in row))
        if dbg[0] < 25 and any(ch in w['t'] for ch in ',.'):
            dbg[0] += 1
            log(f"§RASTER_DOT_DIAG ocr={w['t']} base={base} main=" + ';'.join(f"{c[2]}-{c[3]}" for c in main) +
                " smalls=" + ';'.join(f"x{c[2]}-{c[3]} y{c[0]}-{c[1]} n{c[4]}" for c in smalls))
        # split touching digits: a main component wider than 1.3 x the measured single-digit width
        sp = []
        for c in main:
            wd = c[3] - c[2] + 1
            k = int(round(wd / DIGW)) if wd > 1.3 * DIGW else 1
            if k <= 1: sp.append(c); continue
            col = L['ib'][c[0]:c[1] + 1, c[2]:c[3] + 1].sum(axis=0)
            cuts = []
            for j in range(1, k):
                x = int(round(j * wd / k)); lo, hi = max(1, x - 2), min(wd - 1, x + 3)
                cuts.append(lo + int(np.argmin(col[lo:hi])))
            edges = [0] + cuts + [wd]
            for j in range(k):
                xa, xb_ = c[2] + edges[j], c[2] + edges[j + 1] - 1
                rows = np.where(L['ib'][c[0]:c[1] + 1, xa:xb_ + 1].any(axis=1))[0]   # the piece's OWN height
                if len(rows): sp.append((c[0] + rows[0], c[0] + rows[-1], xa, xb_, 0))
            nsplit[0] += 1
        # re-classify after splitting: a piece that ends above the baseline is a raised digit (e.g. 5 touching a 7)
        for c in [c for c in sp if c[1] < base - 0.25 * HMAIN and c[1] - c[0] + 1 >= 0.35 * HMAIN]:
            if not raised and c[2] >= max(q[3] for q in sp if q is not c) - 3:
                raised = [c]; nresplit[0] += 1
            sp.remove(c)
        main = sp
        d = [ch for ch in w['t'] if ch.isdigit()]
        rocr = None
        if raised and len(d) == len(main) + 1:          # OCR folded the raised digit into the word
            rocr = d[-1]; d = d[:-1]
        if len(d) != len(main):                         # fallback: re-read the main glyphs alone (reader b)
            pad = 10; gx0, gx1 = main[0][2], main[-1][3]; gy0 = min(c[0] for c in main); gy1 = max(c[1] for c in main)
            gb = L['gb']; sub = np.full((gy1 - gy0 + 1 + 2 * pad, gx1 - gx0 + 1 + 2 * pad), 255.0)
            sub[pad:-pad, pad:-pad] = gb[gy0:gy1 + 1, gx0:gx1 + 1]
            d2 = [ch for ch in ''.join(q['t'] for q in tess(sub, f"fb{L['dir']}{L['y']}_{int(w['x'])}", 7, '0123456789,.', 6)) if ch.isdigit()]
            if len(d2) == len(main): d = d2; nfb[0] += 1
        nwords += 1
        cntok = len(d) == len(main)
        if cntok:
            nmatch += 1
            for ch, c in zip(d, main):
                bank.setdefault(ch, []).append(nbm(L['ib'][c[0]:c[1] + 1, c[2]:c[3] + 1]))
            for i in range(len(main) - 1): gaps.append(main[i + 1][2] - main[i][3] - 1)
            txt = None   # built after all gaps are measured (separator threshold = histogram valley)
        else:
            txt = w['t']
        vecs = [nbm(L['ib'][c[0]:c[1] + 1, c[2]:c[3] + 1]) for c in main]
        words.append(dict(vecs=vecs, d=d, main=main, base=base, gb=L['gb'], l=L['bx0'] + w['x'], r=L['bx0'] + max(w['x'] + w['w'], raised[0][3] if raised else 0),
                          txt=txt.strip(',.') if txt else None, cntok=cntok, raised=raised[0] if raised else None, rocr=rocr))
    L['words'] = words
# MAIN-DIGIT k-NN VOTE: every glyph of a count-matched word is a labelled sample; each glyph is relabelled by
# the majority of its K most similar OTHER samples on this sheet (one CAD font). A lone OCR misread is outvoted.
K = 7; KSHARE = 0.6   # stated
samples = [(ch, v, (id(w), i)) for L in lines_all for w in L['words'] if w['cntok'] for i, (ch, v) in enumerate(zip(w['d'], w['vecs']))]
SV = np.array([v.ravel() / (np.linalg.norm(v) + 1e-9) for _, v, _ in samples]) if samples else np.zeros((0, 140))
SL = [ch for ch, _, _ in samples]; SK = [k for _, _, k in samples]
nchg = nkeep = nunsure = 0
for L in lines_all:
    for w in L['words']:
        if not w['cntok']: continue
        nd = []
        for i, (ch, v) in enumerate(zip(w['d'], w['vecs'])):
            x = v.ravel() / (np.linalg.norm(v) + 1e-9); sims = SV @ x
            order = [j for j in np.argsort(-sims) if SK[j] != (id(w), i)][:K]
            votes = {}
            for j in order: votes[SL[j]] = votes.get(SL[j], 0) + 1
            top = max(votes.items(), key=lambda kv: kv[1])
            if top[1] / K >= KSHARE:
                if top[0] != ch: nchg += 1
                else: nkeep += 1
                nd.append(top[0])
            else:
                nd.append(ch); nunsure += 1
        w['d'] = nd
log(f"§RASTER_KNN samples={len(samples)} K={K} share>={KSHARE} kept={nkeep} changed={nchg} no_majority={nunsure}")
gh_ = np.bincount(np.clip(gaps, 0, 15)) if gaps else np.zeros(1, int)
lo_ = int(np.argmax(gh_[:3])); hi_ = 3 + int(np.argmax(gh_[3:9])) if len(gh_) > 3 else 3
SEPGAP = lo_ + 1 + int(np.argmin(gh_[lo_ + 1:hi_])) if hi_ > lo_ + 1 else 3
SEPGAP = SEPGAP + 1  # the valley bin itself is ambiguous; a separator gap must be wider than it
for L in lines_all:
    for w in L['words']:
        if w['txt'] is not None: continue
        t = ''
        for i, ch in enumerate(w['d']):
            t += ch
            if i + 1 < len(w['main']):
                gx0, gx1 = w['main'][i][3] + 1, w['main'][i + 1][2]
                if gx1 - gx0 >= SEPGAP:
                    patch = w['gb'][max(0, w['base'] - 3):w['base'] + 1, gx0:gx1]
                    if patch.size and patch.min() < DOT_GREY: t += ','; nsep[0] += 1
        w['txt'] = t
log(f"§RASTER_SEP_GAP modes=({lo_},{hi_}) valley_threshold>={SEPGAP}")
log(f"§RASTER_SEP separators={nsep[0]} dot_grey<{DOT_GREY} gap_hist={np.bincount(np.clip(gaps,0,15)).tolist() if gaps else []}")
log(f"§RASTER_BANK words={nwords} count_match={nmatch} fallback_used={nfb[0]} split_wide={nsplit[0]} raised_from_split={nresplit[0]} labels=" +
    ' '.join(f"{k}:{len(v)}" for k, v in sorted(bank.items())))

# threshold from the bank: leave-one-out correlation of each item to its own label mean vs the best other label
means = {k: np.mean(v, axis=0) for k, v in bank.items() if len(v) >= 3}
within = []; between = []
for k, v in bank.items():
    if k not in means or len(v) < 3: continue
    for i, x in enumerate(v):
        loo = (means[k] * len(v) - x) / (len(v) - 1)
        within.append(corr(x, loo))
        between.append(max([corr(x, m) for kk, m in means.items() if kk != k] or [0]))
within = np.array(within); between = np.array(between)
T = float(np.percentile(within, 5)) if len(within) else 1.0
log(f"§RASTER_BANK_THR within_p5={T:.3f} within_med={np.median(within) if len(within) else 0:.3f} "
    f"between_p95={np.percentile(between, 95) if len(between) else 0:.3f} labels_with_mean={sorted(means)}")
MARGIN = 0.05  # stated: best label must beat the runner-up by this much

nr = nr_ok = nr_agree = nr_disagree = 0
for L in lines_all:
    for w in L['words']:
        if w['raised'] is None: w['sup'] = None; continue
        nr += 1; c = w['raised']
        x = nbm(L['ib'][c[0]:c[1] + 1, c[2]:c[3] + 1])
        sc = sorted(((corr(x, m), k) for k, m in means.items()), reverse=True)
        lab = sc[0][1] if sc and (len(sc) < 2 or sc[0][0] - sc[1][0] >= MARGIN) else '?'
        if lab != '?': nr_ok += 1
        if w['rocr'] is not None:
            if w['rocr'] == lab: nr_agree += 1
            elif lab != '?': nr_disagree += 1   # logged, NOT a veto: the OCR fold read is measured biased (§43)
        w['sup'] = lab; w['sup_score'] = sc[0] if sc else None
from collections import Counter
tops = Counter(w['sup_score'][1] for L in lines_all for w in L['words'] if w.get('sup_score'))
sc5 = [round(w['sup_score'][0], 2) for L in lines_all for w in L['words'] if w.get('sup_score')]
rocrs = Counter(w['rocr'] for L in lines_all for w in L['words'] if w.get('rocr'))
log(f"§RASTER_RAISED_DIAG top_label={dict(tops)} top_scores={sorted(sc5)} ocr_folded={dict(rocrs)} hraised=" +
    str(sorted(w['raised'][1]-w['raised'][0]+1 for L in lines_all for w in L['words'] if w.get('raised'))))
log(f"§RASTER_RAISED n={nr} matched={nr_ok} ocr_agree={nr_agree} ocr_disagree={nr_disagree} (template decides; checksum judges)")

chains = []
for L in lines_all:
    tk = L['ticks']; segs = []
    for i in range(len(tk) - 1):
        a, b = tk[i], tk[i + 1]
        ws = [w for w in L['words'] if a - 4 <= (w['l'] + w['r']) / 2 <= b + 4]
        if not ws: segs.append(dict(L=a, R=b, txt=None, v=None)); continue
        w = max(ws, key=lambda w: w['r'] - w['l'])
        ok = w['cntok'] and w['sup'] != '?'
        v = value(w['txt'], w['sup']) if ok else None
        segs.append(dict(L=a, R=b, txt=w['txt'] + ('^' + w['sup'] if w['sup'] else '') + ('' if w['cntok'] else '~'), v=v))
    L['segs'] = segs; chains.append(L)
    log(f"§RASTER_CHAIN dir={L['dir']} pos={L['y']} ext={L['a']}..{L['b']} ticks={len(tk)} "
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
    green += ok; yellow += (not ok); c['verdict'] = 'GREEN' if ok else 'YELLOW'; c['overall'] = ov
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

# --- hand-off to raster_walls.py (§43.1): chains in PAGE coordinates (deskewed page, y down) ---
import json
Hs = gray.shape[0]
def to_page(c):
    if c['dir'] == 'H':
        return dict(line_y=c['y'], ticks_x=c['ticks'])
    # V chains were read on np.rot90(page, k=-1): rotated (row=i, col=j) = page (row=Hs-1-j, col=i)
    return dict(line_x=c['y'], ticks_y=sorted(Hs - 1 - t for t in c['ticks']), ticks_rot=c['ticks'])
Image.fromarray(np.clip(gray, 0, 255).astype(np.uint8)).save(os.path.join(work, 'page_clean.png'))  # deskewed, blue removed
out = dict(page=page, clean=os.path.join(work, 'page_clean.png'), dpi=DPI, skew_deg=SKEW, otsu=OT, scale_px_per_m=ks, chains=[])
for c in chains:
    segs = [dict(L=s['L'], R=s['R'], txt=s['txt'], v=s['v']) for s in c['segs']]
    out['chains'].append(dict(dir=c['dir'], verdict=c.get('verdict', 'YELLOW'), overall=c.get('overall'),
                              segs=segs, **to_page(c)))
json.dump(out, open(os.path.join(work, 'chains.json'), 'w'), indent=1, default=float)
log(f"§RASTER_HANDOFF chains.json chains={len(chains)} green={sum(1 for c in chains if c.get('verdict')=='GREEN')}")
