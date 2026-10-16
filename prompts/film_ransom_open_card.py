# ⚠ DO NOT REMOVE — Scope: ERP_DEPTH_FILM.md §12 opening card (red1 2026-10-13: "opening card with a typing reveal while narrating; the ransom-note
#   effect — each letter a cutting from a newspaper"). Letters are the REAL cut-out tiles of a sample sheet the user supplied
#   (~/Pictures/CutLetters.jpg: 5 variants per letter a-z / 0-9, Dreamstime stock ID 30800116 — preview use; licence before publishing, or generate own tiles).
#   Pipeline: sheet → 201 connected components → rows of 15 (3 letters × 5 variants) → convex-hull alpha → pasted one by one in step with the narration.
#   Timing is DATA (the narration's measured length), never a guess: the reveal spans [start, start+speech] with pauses weighted at , and .
# usage: python3 film_ransom_open_card.py "<text>" <speech_sec> <out_silent.mp4> <out_ticks.wav> [start=0.6] [tail=2.5] [sheet.jpg]
import sys, os, pickle, random, math, subprocess
import numpy as np
from PIL import Image, ImageFilter, ImageDraw, ImageFont
from collections import deque
text, speech, OUT, TICKS = sys.argv[1], float(sys.argv[2]), sys.argv[3], sys.argv[4]
START = float(sys.argv[5]) if len(sys.argv) > 5 else 0.6; TAIL = float(sys.argv[6]) if len(sys.argv) > 6 else 2.5
SHEET = sys.argv[7] if len(sys.argv) > 7 else os.path.expanduser('~/Pictures/CutLetters.jpg')
W, H, FPS = 1920, 1080, 24
random.seed(20261013)
CACHE = os.path.expanduser('~/.cache/film_ransom'); os.makedirs(CACHE, exist_ok=True)
BAD = {('d', 0), ('d', 3), ('o', 4), ('q', 3), ('6', 3), ('9', 0)}   # tiles whose paper was too pale for the cut (checked on the contact sheet)

def load_tiles():
    pk = os.path.join(CACHE, 'tiles_%d.pkl' % int(os.path.getmtime(SHEET)))
    if os.path.exists(pk): return pickle.load(open(pk, 'rb'))
    im = Image.open(SHEET).convert('RGB'); Wd, Hd = im.size; FOOT = int(Hd * 0.955)
    a = np.asarray(im).astype(np.int16); dist = (255 - a).sum(axis=2)
    def close(m, k1, k2): return np.asarray(Image.fromarray((m * 255).astype('uint8')).filter(ImageFilter.MaxFilter(k1)).filter(ImageFilter.MinFilter(k2))) > 0
    m1 = close(dist[:FOOT] > 70, 5, 5); s = 3; ms = m1[::s, ::s]; h, w = ms.shape; lab = np.zeros((h, w), int); n = 0; comps = []
    for y in range(h):
        for x in range(w):
            if ms[y, x] and not lab[y, x]:
                n += 1; q = deque([(y, x)]); lab[y, x] = n; pts = []
                while q:
                    cy, cx = q.popleft(); pts.append((cy, cx))
                    for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                        ny, nx = cy + dy, cx + dx
                        if 0 <= ny < h and 0 <= nx < w and ms[ny, nx] and not lab[ny, nx]: lab[ny, nx] = n; q.append((ny, nx))
                comps.append(pts)
    tl = []
    for pts in comps:
        if len(pts) < 150: continue
        ys = [p[0] for p in pts]; xs = [p[1] for p in pts]
        y0, y1, x0, x1 = min(ys) * s, max(ys) * s + s, min(xs) * s, max(xs) * s + s
        tl.append(dict(box=(x0, y0, x1, y1), cy=(y0 + y1) / 2, cx=(x0 + x1) / 2))
    tl.sort(key=lambda t: t['cy']); rows = [[tl[0]]]
    for t in tl[1:]:
        if t['cy'] - np.mean([r['cy'] for r in rows[-1]]) > 60: rows.append([t])
        else: rows[-1].append(t)
    for r in rows: r.sort(key=lambda t: t['cx'])
    assert [len(r) for r in rows[:12]] == [15] * 12, 'sheet layout changed: rows=%s' % [len(r) for r in rows]
    mask = close(dist > 45, 5, 5); mask = np.asarray(Image.fromarray((mask * 255).astype('uint8')).filter(ImageFilter.MinFilter(3))) > 0
    def cut(t):
        x0, y0, x1, y1 = t['box']; pad = 3; x0 = max(0, x0 - pad); y0 = max(0, y0 - pad); x1 = min(Wd, x1 + pad); y1 = min(Hd, y1 + pad)
        al = mask[y0:y1, x0:x1]; hh, ww = al.shape; seen = np.zeros_like(al); ys, xs = np.nonzero(al)
        if not len(ys): return None
        cy, cx = int(t['cy'] - y0), int(t['cx'] - x0); k = np.argmin((ys - cy) ** 2 + (xs - cx) ** 2); q = deque([(ys[k], xs[k])]); seen[ys[k], xs[k]] = 1
        while q:
            y, x = q.popleft()
            for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                ny, nx = y + dy, x + dx
                if 0 <= ny < hh and 0 <= nx < ww and al[ny, nx] and not seen[ny, nx]: seen[ny, nx] = 1; q.append((ny, nx))
        ys, xs = np.nonzero(seen); by0, by1, bx0, bx1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
        rgb = np.asarray(im)[y0:y1, x0:x1][by0:by1, bx0:bx1]; pts = sorted(set(zip((xs - bx0).tolist(), (ys - by0).tolist())))
        def cr(o, a_, b): return (a_[0] - o[0]) * (b[1] - o[1]) - (a_[1] - o[1]) * (b[0] - o[0])
        lo = []
        for p in pts:
            while len(lo) >= 2 and cr(lo[-2], lo[-1], p) <= 0: lo.pop()
            lo.append(p)
        up = []
        for p in reversed(pts):
            while len(up) >= 2 and cr(up[-2], up[-1], p) <= 0: up.pop()
            up.append(p)
        A = Image.new('L', (bx1 - bx0, by1 - by0), 0); ImageDraw.Draw(A).polygon(lo[:-1] + up[:-1], fill=255); A = A.filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(0.8))
        return Image.merge('RGBA', (*Image.fromarray(rgb).split(), A))
    out = {}
    for ri, grp in enumerate(['abc', 'def', 'ghi', 'jkl', 'mno', 'pqr', 'stu', 'vwx', 'yz0', '123', '456', '789']):
        for gi, ch in enumerate(grp):
            for k in range(5):
                if (ch, k) in BAD: continue
                tile = cut(rows[ri][gi * 5 + k])
                if tile: out.setdefault(ch, []).append(tile)
    pickle.dump(out, open(pk, 'wb')); return out
TILES = load_tiles()

def comma_tile():
    f = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf', 150); t = Image.new('RGBA', (70, 150), (0, 0, 0, 0)); d = ImageDraw.Draw(t)
    d.polygon([(2, 8), (66, 2), (68, 146), (4, 148)], fill=(236, 230, 210, 255)); d.text((16, 38), ',', font=f, fill=(25, 25, 25, 255)); return t
SPEC = {',': comma_tile()}
bag = {}
def pick(ch):
    c = ch.lower()
    if ch == ',': return SPEC[',']
    if ch == '.':
        return TILES['.'][0] if '.' in TILES else None
    if c not in TILES: return None
    if not bag.get(c): bag[c] = random.sample(TILES[c], len(TILES[c]))
    return bag[c].pop()

# paper sheet geometry and tile layout --------------------------------------------------------------------------------------------------------
PX0, PY0, PX1, PY1 = 70, 60, W - 70, H - 60
LM, RM, TM = PX0 + 70, PX1 - 70, PY0 + 70
PITCH = 76; GAP = 3; WORDGAP = 24
items = []     # dict(ch, sprite, x, y, w, h, weight)
x, y = LM, int(os.environ.get('RANSOM_Y', TM))     # RANSOM_BASE/RANSOM_Y: CONTINUE an earlier card from its last frame (red1 2026-10-13: "the add is continuing from the last frame")
words = text.split(' ')
def make_sprite(tile):
    th = random.randint(40, 54); sc = th / tile.size[1]; w = max(24, int(tile.size[0] * sc))
    if w > 80: w = 80
    t = tile.resize((w, th), Image.LANCZOS); ang = random.uniform(-6.5, 6.5)
    pad = 14; S = Image.new('RGBA', (w + 2 * pad + 6, th + 2 * pad + 6), (0, 0, 0, 0)); adv = w
    sh = Image.new('RGBA', S.size, (0, 0, 0, 0)); sh.paste((0, 0, 0, 110), (pad + 3, pad + 4), t.split()[3]); sh = sh.filter(ImageFilter.GaussianBlur(3))
    S = Image.alpha_composite(S, sh); S.alpha_composite(t, (pad, pad)); return S.rotate(ang, resample=Image.BICUBIC, expand=False), pad, adv
for wd in words:
    sprites = []
    for ch in wd:
        tl = pick(ch)
        if tl is None: continue
        sprites.append((ch, *make_sprite(tl)))
    ww = sum(s[3] + GAP for s in sprites)
    if x + ww > RM and x > LM: x = LM; y += PITCH
    for ch, sp, pad, adv in sprites:
        jy = random.randint(-7, 7); wgt = 2.2 if ch == ',' else 3.0 if ch == '.' else 1.0
        items.append(dict(ch=ch, sp=sp, x=x - pad, y=y - pad + jy, wgt=wgt)); x += adv + GAP
    items[-1]['wgt'] += 0.7 if items else 0; x += WORDGAP
lines = int((y - TM) / PITCH) + 1; print('§RANSOM tiles=%d lines=%d bottom=%d (paper bottom %d)' % (len(items), lines, y + 90, PY1))
print('y=%d' % y)
assert y + 90 < PY1, 'text does not fit the paper'

# timing: reveal spans [START, START+speech]; each tile's time ∝ cumulative weight --------------------------------------------------------------
tot_w = sum(i['wgt'] for i in items); acc = 0
for it in items: it['t'] = START + (acc / tot_w) * speech * 0.97; acc += it['wgt']
TOT = START + speech + TAIL; NF = int(math.ceil(TOT * FPS))

# background: dark desk + paper sheet -------------------------------------------------------------------------------------------------------------
rng = np.random.default_rng(7)
desk = (rng.normal(0, 3, (H, W, 1)) + np.array([30, 30, 34])).clip(0, 255).astype('uint8'); bg = Image.fromarray(desk)
yy, xx = np.mgrid[0:H, 0:W]; vig = (1 - 0.35 * (((xx - W / 2) / (W / 2)) ** 2 + ((yy - H / 2) / (H / 2)) ** 2)).clip(0.5, 1)[..., None]
bg = Image.fromarray((np.asarray(bg) * vig).astype('uint8'))
paper = Image.new('RGBA', (PX1 - PX0, PY1 - PY0), (238, 233, 222, 255)); pn = (rng.normal(0, 3.5, (paper.size[1], paper.size[0], 1)) + 0).astype(np.float32)
pa = np.asarray(paper).astype(np.float32); pa[..., :3] = (pa[..., :3] + pn).clip(0, 255); paper = Image.fromarray(pa.astype('uint8'), 'RGBA')
shadow = Image.new('RGBA', bg.size, (0, 0, 0, 0)); shadow.paste((0, 0, 0, 150), (PX0 + 8, PY0 + 12, PX1 + 8, PY1 + 12)); shadow = shadow.filter(ImageFilter.GaussianBlur(14))
base = Image.alpha_composite(bg.convert('RGBA'), shadow); base.alpha_composite(paper, (PX0, PY0)); base = base.convert('RGB')
if os.environ.get('RANSOM_BASE'): base = Image.open(os.environ['RANSOM_BASE']).convert('RGB')

# frames ------------------------------------------------------------------------------------------------------------------------------------------
ff = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', '%dx%d' % (W, H), '-r', str(FPS), '-i', '-',
                       '-c:v', 'libx264', '-crf', '17', '-preset', 'medium', '-pix_fmt', 'yuv420p', OUT], stdin=subprocess.PIPE)
canvas = base.copy(); ANIM = 5; placed = 0; order = sorted(range(len(items)), key=lambda i: items[i]['t'])
for f in range(NF):
    t = f / FPS; frame = canvas.copy(); live = []
    while placed < len(order) and items[order[placed]]['t'] + ANIM / FPS <= t:        # finished its pop → bake into the canvas
        it = items[order[placed]]; canvas.paste(it['sp'], (int(it['x']), int(it['y'])), it['sp']); placed += 1
    frame = canvas.copy()
    for i in order[placed:]:
        it = items[i]
        if it['t'] > t: break
        k = (t - it['t']) * FPS / ANIM; e = 1 - (1 - min(1, k)) ** 3; sc = 1.4 - 0.4 * e
        sp = it['sp']; nw, nh = int(sp.size[0] * sc), int(sp.size[1] * sc); s2 = sp.resize((nw, nh), Image.BILINEAR)
        if e < 1: s2.putalpha(s2.split()[3].point(lambda v: int(v * (0.35 + 0.65 * e))))
        frame.paste(s2, (int(it['x'] - (nw - sp.size[0]) / 2), int(it['y'] - (nh - sp.size[1]) / 2)), s2)
    ff.stdin.write(frame.tobytes())
ff.stdin.close(); ff.wait()
# paper-slap ticks (one per tile), mono 48 kHz ------------------------------------------------------------------------------------------------------
SR = 48000; aud = np.zeros(int(TOT * SR) + SR, dtype=np.float32); r2 = np.random.default_rng(3)
for it in items:
    n = int(0.045 * SR); noise = r2.normal(0, 1, n).astype(np.float32); env = np.exp(-np.arange(n) / (0.009 * SR)); sig = np.convolve(noise * env, np.ones(6) / 6, mode='same')
    sig *= 0.5 * r2.uniform(0.6, 1.0); i0 = int(it['t'] * SR); aud[i0:i0 + n] += sig[:len(aud) - i0]
import wave
w = wave.open(TICKS, 'wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((aud.clip(-1, 1) * 32767).astype('<i2').tobytes()); w.close()
print('§RANSOM done frames=%d dur=%.2f first=%.2f last=%.2f speech=%.2f' % (NF, TOT, items[0]['t'], items[-1]['t'], speech))
