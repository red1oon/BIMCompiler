# ⚠ DO NOT REMOVE — PDF2BIM_VECTOR_PROBE.md §58.3: the LUFTRAUM cell (a slab void) from the word to the nearest long lines, checked against the section's printed size. Read the log after every run (§VOID lines).
# Implementing PDF2BIM_VECTOR_PROBE.md §58.3 — Witness: W-S58b (cell found, N-S size vs the printed value <= 0.03 m), falsifier (a start 1.2 m south must FAIL the same check), VACUOUS (word not on the plan)
# Usage: python3 -P raster_void.py <upper plan workdir (chains.json, walls.json, walls_all.json)> <section workdir (chains.json = the views page)> [<reserved_words.json>]   -> <plan workdir>/voids.json
#   The plan page is OCRed for the dictionary words whose geometry is `slab_void`; from the word's centre the cell is walked to the first LONG straight ink line each way; the section page's own printed size next to the same word
#   is the check. Nothing is drawn (voids.json stays absent) unless the check PASSES.
import sys, os, json, re, subprocess, tempfile
import numpy as np
from PIL import Image
def log(*a): print(*a, flush=True)
work, vwork = sys.argv[1], sys.argv[2]
DICT = json.load(open(sys.argv[3] if len(sys.argv) > 3 else os.path.join(os.path.dirname(os.path.abspath(__file__)), 'types', 'reserved_words.json')))['entries']
WORDS = {w.upper(): k for k, e in DICT.items() if e.get('geometry') == 'slab_void' for w in e['words']}
MIN_LONG_M, GAP_PX, SNAP_MM, TOL_M = 2.0, 3, 40.0, 0.03   # stated DEFAULTS (§58.3)

def ocr_tsv(img, zoom=2, cut=None):
    big = img.resize((img.width * zoom, img.height * zoom), Image.LANCZOS)
    if cut: big = big.point(lambda v: 0 if v < cut else 255)
    fd, p = tempfile.mkstemp(suffix='.png'); os.close(fd); big.save(p)
    r = subprocess.run(['tesseract', p, '-', '--psm', '11', 'tsv'], capture_output=True, text=True); os.remove(p)
    out = []
    for ln in r.stdout.splitlines()[1:]:
        f = ln.split('\t')
        if len(f) == 12 and f[11].strip() and float(f[10]) > 30: out.append((f[11].strip(), int(f[6]) / zoom, int(f[7]) / zoom, int(f[8]) / zoom, int(f[9]) / zoom))
    return out
def find_words(img):
    hits = {}
    for cut in (None, 190):
        for t, x, y, w, h in ocr_tsv(img, 2, cut):
            k = WORDS.get(re.sub(r'[^A-Za-zÄÖÜ]', '', t).upper())
            if k and not any(abs(a[0] - (x + w / 2)) < 20 and abs(a[1] - (y + h / 2)) < 20 for a in hits.get(k, [])): hits.setdefault(k, []).append((x + w / 2, y + h / 2))
    return hits

C = json.load(open(os.path.join(work, 'chains.json'))); img = Image.open(C['clean']).convert('L'); g = np.asarray(img).astype(int); ink = g < C['otsu']; H, W = ink.shape
KH, KV = C['scale_px_per_m']['H'], C['scale_px_per_m']['V']
gh = max([c for c in C['chains'] if c['verdict'] == 'GREEN' and c['dir'] == 'H'], key=lambda c: len(c['segs'])); gv = max([c for c in C['chains'] if c['verdict'] == 'GREEN' and c['dir'] == 'V'], key=lambda c: len(c['segs']))
# the house's outer NW corner in page px: the first READ segment of the overall chains (as raster_emit's BW / BD)
X0 = min(s['L'] for s in gh['segs']); Y0 = min(s['L'] for s in gv['segs'])
mm = lambda px, py: ((px - X0) / KH * 1000, (py - Y0) / KV * 1000); px_ = lambda x, y: (X0 + x * KH / 1000, Y0 + y * KV / 1000)
log(f"§VOID_FRAME plan page {W}x{H}: outer NW corner px ({X0},{Y0}), {KH:.2f} / {KV:.2f} px/m")
hits = find_words(img)
if not hits: sys.exit(log(f"§VOID verdict=VACUOUS no slab_void word ({', '.join(WORDS)}) on this plan page"))
WL = json.load(open(os.path.join(work, 'walls.json')))['walls'] + json.load(open(os.path.join(work, 'walls_all.json')))['walls']
def faces(axis):   # wall faces (mm) across an axis: V walls -> x faces, H walls -> y faces
    out = set()
    for w in WL:
        if w['axis'] == axis: out.update((round(w['x0'], 1), round(w['x1'], 1)) if axis == 'V' else (round(w['y0'], 1), round(w['y1'], 1)))
    return sorted(out)
FX, FY = faces('V'), faces('H')

def line_at(axis, fixed, start, step, minlen):
    """first long straight ink line crossing the ray. axis 'V': ray runs along x at row `fixed`, looks for a vertical ink run of >= minlen px containing that row; returns (near-face col, far-face col) of the line group or None."""
    n = ink.shape[1] if axis == 'V' else ink.shape[0]; p = int(start)
    def run_len(c):   # length of the ink run (gaps <= GAP_PX bridged) through the ray position at coordinate c
        col = ink[:, c] if axis == 'V' else ink[c, :]
        i = int(fixed); lo = i; gap = 0
        while lo > 0 and gap <= GAP_PX:
            if col[lo - 1]: gap = 0
            else: gap += 1
            lo -= 1
        hi = i; gap = 0
        while hi < len(col) - 1 and gap <= GAP_PX:
            if col[hi + 1]: gap = 0
            else: gap += 1
            hi += 1
        # trim trailing gap pixels
        while lo < i and not col[lo]: lo += 1
        while hi > i and not col[hi]: hi -= 1
        return (hi - lo + 1) if col[max(lo, 0):hi + 1].any() else 0, lo, hi
    c = p + step
    while 0 < c < n - 1:
        if ink[int(fixed), c] if axis == 'V' else ink[c, int(fixed)]:
            L, lo, hi = run_len(c)
            if L >= minlen:
                g0 = c; g1 = c   # the group: adjacent columns / rows (gap <= 2) that also hold a long run
                for d in (1, -1):
                    k = c + d; miss = 0
                    while 0 < k < n - 1 and miss <= 2:
                        if (ink[int(fixed), k] if axis == 'V' else ink[k, int(fixed)]) and run_len(k)[0] >= minlen: (g0 := min(g0, k)) if d < 0 else (g1 := max(g1, k)); miss = 0
                        else: miss += 1
                        k += d
                return g0, g1
        c += step
    return None
def cell_from(cx, cy):
    """cell around page point (cx, cy): edges in mm (x0, y0, x1, y1) or None + the line groups"""
    Lm = MIN_LONG_M * KH; Lv = MIN_LONG_M * KV
    left = line_at('V', cy, cx, -1, Lv); right = line_at('V', cy, cx, +1, Lv); up = line_at('H', cx, cy, -1, Lm); down = line_at('H', cx, cy, +1, Lm)
    if not all((left, right, up, down)): return None, dict(left=left, right=right, up=up, down=down)
    x0 = mm(left[1], 0)[0]; x1 = mm(right[0], 0)[0]; y0 = mm(0, up[1])[1]; y1 = mm(0, down[0])[1]   # the void-side faces of the line groups
    return (x0, y0, x1, y1), dict(left=left, right=right, up=up, down=down)
def snap(v, faces_):
    n = min(faces_, key=lambda f: abs(f - v)) if faces_ else None
    return (n, True) if n is not None and abs(n - v) <= SNAP_MM else (v, False)

# the printed size on the section page (views page): a d.dd token near the same word
def printed_size(word):
    """the d.dd tokens printed within 1.2 m-equivalent below / beside the word on the section page: OCR of a ZOOMED crop (the whole page at 200 dpi is too coarse for dimension text)"""
    VC = json.load(open(os.path.join(vwork, 'chains.json'))); VI = Image.open(VC['clean']).convert('L'); T = ocr_tsv(VI, 2, None) + ocr_tsv(VI, 2, 190)
    ws = []
    for t_, x, y, w, h in T:
        if WORDS.get(re.sub(r'[^A-Za-zÄÖÜ]', '', t_).upper()) == word and not any(abs(a[0] - (x + w / 2)) < 15 and abs(a[1] - (y + h / 2)) < 15 for a in ws): ws.append((x + w / 2, y + h / 2))
    out = []
    for wx, wy in ws:
        x0, y0, x1, y1 = int(max(0, wx - 160)), int(max(0, wy - 20)), int(min(VI.width, wx + 160)), int(min(VI.height, wy + 170))
        crop = VI.crop((x0, y0, x1, y1))
        for cut in (None, 170, 200):
            for t_, x, y, w, h in ocr_tsv(crop, 5, cut):
                m = re.match(r"^(\d)[.,](\d{2})['\u2019]?$", t_)
                if m: out.append((float(f'{m.group(1)}.{m.group(2)}'), t_, round(x0 + x + w / 2), round(y0 + y + h / 2)))
    seen = set(); uniq = []
    for o in out:
        k = (o[0], o[2] // 12, o[3] // 12)
        if k not in seen: seen.add(k); uniq.append(o)
    return ws, uniq
rings = []
for key, pts in hits.items():
    for (cx, cy) in pts:
        wmm = mm(cx, cy); log(f"§VOID_WORD {key} on the plan at px ({cx:.0f},{cy:.0f}) = ({wmm[0]:.0f}, {wmm[1]:.0f}) mm from the outer NW corner")
        cell, grp = cell_from(cx, cy)
        if not cell: log(f"§VOID_CELL {key} verdict=INCONCLUSIVE a direction found no line >= {MIN_LONG_M} m: {grp}"); continue
        x0, y0, x1, y1 = cell; sx0, a = snap(x0, FX); sx1, b = snap(x1, FX); sy0, c_ = snap(y0, FY); sy1, d = snap(y1, FY)
        log(f"§VOID_CELL {key} measured x {x0:.0f}..{x1:.0f} y {y0:.0f}..{y1:.0f} mm -> snapped to wall faces x {sx0:.0f}{'*' if a else ''}..{sx1:.0f}{'*' if b else ''} y {sy0:.0f}{'*' if c_ else ''}..{sy1:.0f}{'*' if d else ''} ('*' = within {SNAP_MM:g} mm of a wall face)")
        ws, pr = printed_size(key)
        log(f"§VOID_PRINTED {key} section words at {[(round(a_), round(b_)) for a_, b_ in ws]}; size tokens near them {pr}")
        ns = (y1 - y0) / 1000   # the section A-A cuts N-S: its printed size is the cell's N-S size (measured faces, not snapped)
        ok = [p for p in pr if abs(p[0] - ns) <= TOL_M]
        # falsifier: the same walk started 1.2 m south of the word
        fc, _ = cell_from(cx, cy + 1.2 * KV)
        fns = (fc[3] - fc[1]) / 1000 if fc else None
        log(f"§VOID_W-S58b {key} cell N-S {ns:.3f} m, E-W {(x1 - x0) / 1000:.3f} m; printed {[p[0] for p in pr]}: " + (f"PASS (|diff| <= {TOL_M} m, printed {ok[0][0]})" if ok else 'FAIL / not read: NOTHING DRAWN') +
            f" | falsifier (start 1.2 m south): N-S {fns if fns is None else round(fns, 3)} -> {'check FAILS as it must' if (fns is None or not any(abs(p[0] - fns) <= TOL_M for p in pr)) else 'WEAK: the check would pass here too'}")
        guard = None   # §63 the void's edge carries a guard wall (the Bruestung): the NEXT long line beyond the south edge is its far face; 0.10 .. 0.40 m thick or no guard
        nxt = line_at('H', cx, grp['down'][1], +1, MIN_LONG_M * KH)
        if nxt:
            ya = mm(0, grp['down'][0])[1]; yb = mm(0, nxt[0])[1]; thk = yb - ya
            log(f"§VOID_GUARD {key} the south edge y {ya:.0f} and the next long line y {yb:.0f}: {thk:.0f} mm" + (' -> a guard wall' if 100 <= thk <= 400 else ' -> not a wall (outside 100..400 mm): no guard'))
            if 100 <= thk <= 400: guard = dict(x0=round(sx0, 1), x1=round(sx1, 1), y0=round(sy1, 1), y1=round(yb, 1), thk_mm=round(thk, 1))   # from the void's SOUTH edge (sy1) to the guard's far face
        else: log(f"§VOID_GUARD {key} no second long line beyond the south edge: no guard")
        if ok: rings.append(dict(word=key, x0=round(sx0, 1), y0=round(sy0, 1), x1=round(sx1, 1), y1=round(sy1, 1), printed_m=ok[0][0], n_s_m=round(ns, 3), guard=guard))
if rings:
    json.dump(dict(spec='PDF2BIM_VECTOR_PROBE.md §58.3', rings=rings), open(os.path.join(work, 'voids.json'), 'w'), indent=1)
    log(f"§VOID verdict=WRITTEN {len(rings)} ring(s): " + ' '.join(f"{r['word']} ({r['x0']:.0f},{r['y0']:.0f})-({r['x1']:.0f},{r['y1']:.0f}) mm" for r in rings))
else: log('§VOID verdict=NOTHING_DRAWN (no word passed the check)')
