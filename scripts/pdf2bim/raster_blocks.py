# Implementing PDF2BIM_VECTOR_PROBE.md §43.9 — view blocks of a scanned sheet + their captions (W-S13 prerequisite)
# Usage: python3 -P raster_blocks.py <workdir with page_clean.png + chains.json>  > raster_blocks.log
# Writes blocks.json: [{id, bbox(page px), ink, caption, name}] — a block with no caption read is UNNAMED.
import sys, os, json, subprocess, re
from collections import deque
import numpy as np
from PIL import Image

def log(*a): print(*a, flush=True)

work = sys.argv[1]
C = json.load(open(os.path.join(work, 'chains.json')))
g = np.asarray(Image.open(C['clean']).convert('L')).astype(int)
ink = g < C['otsu']
F = C.get('dpi', 200) / 200.0
S = max(2, int(round(8 * F)))                                  # downsample factor (8 at 200 dpi)
H, W = ink.shape
# the sheet FRAME (border + title-block rules) connects every view: remove straight runs longer than half the page
def long_runs(m, axis, L):
    out = np.zeros_like(m)
    mm = m if axis == 1 else m.T
    oo = out if axis == 1 else out.T
    for i in range(mm.shape[0]):
        r = mm[i]; d = np.diff(np.concatenate(([0], r.astype(np.int8), [0])))
        for a_, b_ in zip(np.where(d == 1)[0], np.where(d == -1)[0]):
            if b_ - a_ >= L: oo[i, a_:b_] = True
    return out
frame = long_runs(ink, 1, W // 2) | long_runs(ink, 0, H // 2)
for k in range(1, 3):   # the frame's own stroke width: also clear 2 px either side
    frame |= np.roll(frame, k, 0) | np.roll(frame, -k, 0) | np.roll(frame, k, 1) | np.roll(frame, -k, 1)
log(f"§RASTER_FRAME removed_px={int((frame & ink).sum())} (straight runs >= half the page)")
ink = ink & ~frame
sm = ink[:H // S * S, :W // S * S].reshape(H // S, S, W // S, S).any(axis=(1, 3))

def label(mask):
    lab = np.zeros(mask.shape, np.int32); boxes = []
    for y0, x0 in zip(*np.where(mask)):
        if lab[y0, x0]: continue
        n = len(boxes) + 1; q = deque([(y0, x0)]); lab[y0, x0] = n; ys = [y0]; xs = [x0]
        while q:
            y, x = q.popleft()
            for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                yy, xx = y + dy, x + dx
                if 0 <= yy < mask.shape[0] and 0 <= xx < mask.shape[1] and mask[yy, xx] and not lab[yy, xx]:
                    lab[yy, xx] = n; q.append((yy, xx)); ys.append(yy); xs.append(xx)
        boxes.append((min(ys), max(ys), min(xs), max(xs)))
    return lab, boxes

def dilate(m, r):
    out = m.copy()
    for _ in range(r):
        o = out.copy()
        o[1:] |= out[:-1]; o[:-1] |= out[1:]; o[:, 1:] |= out[:, :-1]; o[:, :-1] |= out[:, 1:]
        out = o
    return out

# dilation radius MEASURED: component count vs radius; take the radius that starts the longest plateau
counts = []
for r in range(1, 13):
    _, bx = label(dilate(sm, r))
    big = [b for b in bx if (b[1] - b[0] + 1) * (b[3] - b[2] + 1) >= 100]   # >= 100 small cells (~ 8x8 mm at 200 dpi)
    counts.append((r, len(big)))
log("§RASTER_BLOCKS_R count_by_radius=" + ' '.join(f"r{r}:{n}" for r, n in counts))
best = None; i = 0
while i < len(counts):
    j = i
    while j + 1 < len(counts) and counts[j + 1][1] == counts[i][1]: j += 1
    if counts[i][1] > 1 and (best is None or (j - i) > (best[1] - best[0])): best = (i, j)   # a 1-block plateau is the merge, not a layout
    i = j + 1
R = counts[best[0]][0]
lab, boxes = label(dilate(sm, R))
total = int(ink.sum())
blocks = []
for n, (y0, y1, x0, x1) in enumerate(boxes, 1):
    Y0, Y1, X0, X1 = y0 * S, (y1 + 1) * S, x0 * S, (x1 + 1) * S
    k = int(ink[Y0:Y1, X0:X1][lab[y0:y1 + 1, x0:x1 + 1].repeat(S, 0).repeat(S, 1)[:Y1 - Y0, :X1 - X0] == n].sum())
    blocks.append(dict(id=n, bbox=[int(X0), int(Y0), int(X1), int(Y1)], ink=k))
log(f"§RASTER_BLOCKS radius={R} (longest plateau {counts[best[0]][1]} blocks over r{counts[best[0]][0]}..r{counts[best[1]][0]}) "
    f"components={len(blocks)} page_ink={total}")

# captions: OCR every block's own pixels at 3x (local Tesseract); a block whose text holds ANSICHT/SCHNITT is a caption
def ocr(box):
    X0, Y0, X1, Y1 = box
    im = Image.fromarray(np.clip(g[Y0:Y1, X0:X1], 0, 255).astype(np.uint8))
    f = os.path.join(work, f'blk_{X0}_{Y0}.png'); im.resize((im.width * 3, im.height * 3), Image.LANCZOS).save(f)
    r = subprocess.run(['tesseract', f, 'stdout', '--psm', '6'], capture_output=True, text=True)
    return ' '.join(r.stdout.split())
CAP = re.compile(r'(ANSICHT|SCHNITT)\s*([A-ZÄÖÜ]+(?:\s*-\s*[A-Z])?)', re.I)
for b in blocks:
    X0, Y0, X1, Y1 = b['bbox']
    b['big'] = bool(b['ink'] >= 0.01 * total)
    if not b['big'] and (X1 - X0) * (Y1 - Y0) < 0.02 * H * W:
        t = ocr(b['bbox']); m = CAP.search(t)
        b['text'] = t[:60]
        if m: b['caption'] = (m.group(1).upper() + ' ' + m.group(2).upper().replace(' ', ''))
        b['big'] = bool(b['big'])
for b in blocks:
    if 'caption' in b or not b['big']: continue
    X0, Y0, X1, Y1 = b['bbox']
    # the caption nearest BELOW the block whose x-range overlaps it
    caps = [c for c in blocks if 'caption' in c and c['bbox'][1] >= Y1 - 5 and c['bbox'][0] < X1 and c['bbox'][2] > X0]
    if caps:
        c = min(caps, key=lambda c: c['bbox'][1] - Y1); b['name'] = c['caption']; b['caption_at'] = c['bbox']
    else:
        b['name'] = 'UNNAMED'
for b in blocks:
    if b['big']:
        log(f"§RASTER_BLOCK id={b['id']} bbox={b['bbox']} ink={b['ink']} ({100*b['ink']/total:.1f}%) name={b['name']}")
    elif 'caption' in b:
        log(f"§RASTER_CAPTION id={b['id']} bbox={b['bbox']} text='{b['text']}' -> {b['caption']}")
named = [b for b in blocks if b['big'] and b['name'] != 'UNNAMED']
log(f"§RASTER_BLOCKS_NAMED big={sum(b['big'] for b in blocks)} named={len(named)} names={[b['name'] for b in named]}")
json.dump([{k: v for k, v in b.items()} for b in blocks if b['big']], open(os.path.join(work, 'blocks.json'), 'w'), indent=1)
