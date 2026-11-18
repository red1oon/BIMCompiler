#!/usr/bin/env python3
# ⚠ DO NOT REMOVE — film 4 v4 (prompts/FILM_IMMERSIVE_SOFTWARE.md FILM 4, SCRIPT v4 item 6): derives, from REAL captured pixels, where the pointer must go and what the amber pulse must outline.
#   h_pre.png   the editor with the caret far from the token, no selection, no hover
#   h_sel.png   the same view with ONLY the token selected (profile settings switch off line highlight, occurrence/selection highlight, blinking: nothing else changes)
#   h_hover.png the same view, caret inside the token, the add-on's hover open
# target = the bounding box of the largest connected component of the pixels that differ between h_pre and h_sel (the selection highlight of the token; the caret's own 2 px column is a smaller component).
# popup  = the bounding box of the largest component of the pixels that differ between h_sel and h_hover (the hover widget); row1 = its first text band (rows with bright pixels).
# Writes out/pointer.json and prints §POINTER lines. Deterministic: guard.js re-runs it and compares. READ the log: a target that is empty, huge, or not on the token's line FAILS.
import json, sys, os
from PIL import Image
import numpy as np
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'out')
def load(n): return np.asarray(Image.open(os.path.join(OUT, 'stills', n + '.png')).convert('RGB')).astype(np.int16)
def components(mask):
    h, w = mask.shape; seen = np.zeros_like(mask, dtype=bool); comps = []
    ys, xs = np.nonzero(mask)
    for y0, x0 in zip(ys, xs):
        if seen[y0, x0]: continue
        st = [(y0, x0)]; seen[y0, x0] = True; mnx = mxx = x0; mny = mxy = y0; n = 0
        while st:
            y, x = st.pop(); n += 1
            if x < mnx: mnx = x
            if x > mxx: mxx = x
            if y < mny: mny = y
            if y > mxy: mxy = y
            for dy in (-2, -1, 0, 1, 2):
                for dx in (-2, -1, 0, 1, 2):
                    yy, xx = y + dy, x + dx
                    if 0 <= yy < h and 0 <= xx < w and mask[yy, xx] and not seen[yy, xx]: seen[yy, xx] = True; st.append((yy, xx))
        comps.append({'x': int(mnx), 'y': int(mny), 'w': int(mxx - mnx + 1), 'h': int(mxy - mny + 1), 'n': n})
    return sorted(comps, key=lambda c: -(c['w'] * c['h']))
def diff(a, b): return (np.abs(a - b).sum(axis=2) > 24)
pre, sel, hov = load('h_pre'), load('h_sel'), load('h_hover')
H, W = pre.shape[:2]; res = {'still_w': int(W), 'still_h': int(H)}
cs = components(diff(pre, sel)); res['target'] = cs[0] if cs else None; res['target_components'] = [{k: c[k] for k in ('x', 'y', 'w', 'h', 'n')} for c in cs[:3]]
dm = diff(sel, hov)
if res['target']: t0 = res['target']; dm[t0['y'] - 1:t0['y'] + t0['h'] + 1, t0['x'] - 1:t0['x'] + t0['w'] + 1] = False   # the token's own pixels change too (selection off, caret in): not part of the popup
ch = components(dm); res['popup'] = ch[0] if ch else None
if res['popup']:
    p = res['popup']; reg = hov[p['y']:p['y'] + p['h'], p['x']:p['x'] + p['w']]; bright = (reg.max(axis=2) > 150).sum(axis=1) > 3; rows = []; y = 0
    while y < len(bright):
        if bright[y]:
            y1 = y
            while y1 < len(bright) and bright[y1]: y1 += 1
            rows.append((y, y1)); y = y1
        else: y += 1
    res['popup_rows'] = [{'y': p['y'] + a, 'h': b - a} for a, b in rows if b - a >= 8][:4]   # text bands only: the popup's 1-5 px border is a bright band too
json.dump(res, open(os.path.join(OUT, 'pointer.json'), 'w'), indent=1)
t = res['target']
print('§POINTER still=%dx%d target=%s popup=%s rows=%s' % (W, H, json.dumps({k: t[k] for k in 'xywh'}) if t else None, json.dumps({k: res['popup'][k] for k in 'xywh'}) if res['popup'] else None, json.dumps(res.get('popup_rows'))))
ok = bool(t) and 20 <= t['w'] <= 400 and 10 <= t['h'] <= 40 and bool(res['popup']) and bool(res.get('popup_rows'))
print('§POINTER_VERDICT %s' % ('PASS' if ok else 'FAIL')); sys.exit(0 if ok else 1)
