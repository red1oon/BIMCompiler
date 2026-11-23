#!/usr/bin/env python3
# ⚠ DO NOT REMOVE — film 6 "CH 0 · Browser version numbers, done for you" (prompts/FILM_IMMERSIVE_SOFTWARE.md FILM 6; from film 4's pointer.py, SCRIPT v4 item 6): for every `ptr` item of out/scene.json, checks that the rectangle the pointer is sent to (read by shoot.js from the editor's OWN layout, DOM boxes) is where
# the REAL pixels say the target is:
#   selectDiff items (a text token): the pixels that differ between the `pre` still (caret away, nothing selected) and the `post` still (only the token selected) form a component; its box must equal the DOM box (centre within 4 px, width within 8 px, height within 12 px).
#   other items (a button, a list row): the box must lie inside the still and its pixels must not be one flat colour (something is drawn there), and the pre and post stills must differ somewhere (the click did something).
# Prints §POINTER lines and §POINTER_VERDICT PASS|FAIL|INCONCLUSIVE (INCONCLUSIVE when no item was judged). READ out/pointer.log.
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
            mnx = min(mnx, x); mxx = max(mxx, x); mny = min(mny, y); mxy = max(mxy, y)
            for dy in (-2, -1, 0, 1, 2):
                for dx in (-2, -1, 0, 1, 2):
                    yy, xx = y + dy, x + dx
                    if 0 <= yy < h and 0 <= xx < w and mask[yy, xx] and not seen[yy, xx]: seen[yy, xx] = True; st.append((yy, xx))
        comps.append({'x': int(mnx), 'y': int(mny), 'w': int(mxx - mnx + 1), 'h': int(mxy - mny + 1), 'n': n})
    return sorted(comps, key=lambda c: -(c['w'] * c['h']))
SC = json.load(open(os.path.join(OUT, 'scene.json')))
items = [i for b in SC['beats'].values() for i in b['items'] if i['kind'] == 'ptr']
bad = 0; judged = 0
for it in items:
    t = it.get('target'); pre, post = load(it['pre']), load(it.get('sel') or it['post']); H, W = pre.shape[:2]   # a hover item names a `sel` still (only the token selected) for the pixel check; the popup is the `post`
    if not t: print('§POINTER id=%s FAIL no target rectangle' % it['id']); bad += 1; continue
    judged += 1
    if it.get('selectDiff'):
        d = (np.abs(pre - post).sum(axis=2) > 24); cs = components(d)
        # the largest component that overlaps the DOM box's row band
        cand = [c for c in cs if c['y'] < t['y'] + t['h'] and c['y'] + c['h'] > t['y']]
        c = cand[0] if cand else None
        if not c: print('§POINTER id=%s FAIL no differing pixels at the target row (pre vs post)' % it['id']); bad += 1; continue
        dc = abs((c['x'] + c['w'] / 2) - (t['x'] + t['w'] / 2)); dw = abs(c['w'] - t['w']); dh = abs(c['h'] - t['h'])
        ok = dc <= 4 and dw <= 8 and dh <= 12
        print('§POINTER id=%s kind=token dom=%s pixels=%s dcentre=%.1f dw=%d dh=%d %s' % (it['id'], json.dumps({k: t[k] for k in 'xywh'}), json.dumps({k: c[k] for k in 'xywh'}), dc, dw, dh, 'OK' if ok else 'FAIL')); bad += 0 if ok else 1
    else:
        inside = t['x'] >= 0 and t['y'] >= 0 and t['x'] + t['w'] <= W and t['y'] + t['h'] <= H and t['w'] >= 8 and t['h'] >= 8
        reg = pre[t['y']:t['y'] + t['h'], t['x']:t['x'] + t['w']] if inside else None
        flat = reg is None or float(reg.reshape(-1, 3).std(axis=0).max()) < 2.0
        changed = int((np.abs(pre - post).sum(axis=2) > 24).sum())
        ok = inside and not flat and changed > 200
        print('§POINTER id=%s kind=control dom=%s inside=%s flat=%s changed_px=%d %s' % (it['id'], json.dumps({k: t[k] for k in 'xywh'}), inside, flat, changed, 'OK' if ok else 'FAIL')); bad += 0 if ok else 1
if not judged: print('§POINTER_VERDICT INCONCLUSIVE no pointer item judged'); sys.exit(2)
print('§POINTER_VERDICT %s items=%d' % ('FAIL' if bad else 'PASS', judged)); sys.exit(1 if bad else 0)
