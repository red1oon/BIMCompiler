#!/usr/bin/env python3
# ⚠ DO NOT REMOVE — Scope: turn the fitter's per-turn captions (<tag>.ass) into captions for the dark band under the app area (y 930..1080 of 1920x1080).
# Each turn is split at sentence ends (then commas, then words) until it fits TWO lines of the band; time is shared by character count inside the turn's own start..end.
# Prints §SUB_WRAP per caption (lines, widest line px, limit px). Fit is then MEASURED on rendered frames by sub_fit.py (pixel bounding box), not trusted from this estimate.
# usage: ass_news.py <tag>.ass <out.ass>
import sys, re
from PIL import ImageFont
SRC, OUT = sys.argv[1:3]
SIZE, MARGIN, BAND_TOP = 40, 90, 930
FONT = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', SIZE)
LIMIT = 1920 - 2 * MARGIN
def width(s): return FONT.getlength(s)
def wrap(text):                                  # greedy wrap, like libass WrapStyle 0 without balancing: an upper bound on the lines used
    lines, cur = [], ''
    for w in text.split():
        t = (cur + ' ' + w).strip()
        if width(t) <= LIMIT: cur = t
        else: lines.append(cur); cur = w
    if cur: lines.append(cur)
    return lines
def pieces(text):                                # sentences first
    out = [x for x in re.split(r'(?<=[.?!])\s+', text.strip()) if x]
    res = []
    for s in out:
        if len(wrap(s)) <= 2: res.append(s); continue
        parts = re.split(r'(?<=[,;:])\s+', s); cur = ''
        for p in parts:
            t = (cur + ' ' + p).strip()
            if len(wrap(t)) <= 2: cur = t
            else:
                if cur: res.append(cur)
                cur = p
        if cur:
            if len(wrap(cur)) <= 2: res.append(cur)
            else:                                # last resort: words
                ws, c2 = cur.split(), ''
                for w in ws:
                    t = (c2 + ' ' + w).strip()
                    if len(wrap(t)) <= 2: c2 = t
                    else: res.append(c2); c2 = w
                if c2: res.append(c2)
    # merge neighbours that still fit in two lines together (fewer, calmer caption changes)
    merged = []
    for p in res:
        if merged and len(wrap(merged[-1] + ' ' + p)) <= 2: merged[-1] += ' ' + p
        else: merged.append(p)
    return merged
def ts(x): return '%d:%02d:%05.2f' % (int(x // 3600), int(x % 3600 // 60), x % 60)
def sec(s): h, m, x = s.split(':'); return int(h) * 3600 + int(m) * 60 + float(x)
head = f'''[Script Info]
ScriptType: v4.00+
PlayResX: 1920
PlayResY: 1080
WrapStyle: 0

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: F,DejaVu Sans,{SIZE},&H00B4F0FF,&H00FFFFFF,&H90000000,&H00000000,0,0,0,0,100,100,0,0,1,1.5,0,2,{MARGIN},{MARGIN},34,1
Style: M,DejaVu Sans,{SIZE},&H00FFE6B4,&H00FFFFFF,&H90000000,&H00000000,0,0,0,0,100,100,0,0,1,1.5,0,2,{MARGIN},{MARGIN},34,1
Style: Credit,DejaVu Sans,26,&H00AAAAAA,&H00FFFFFF,&H90000000,&H00000000,0,1,0,0,100,100,0,0,1,1.5,0,2,200,200,6,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
'''
ev, n, worst = [], 0, 0
for l in open(SRC):
    if not l.startswith('Dialogue:'): continue
    f = l.rstrip('\n').split(',', 9); st, en, style, name, text = sec(f[1]), sec(f[2]), f[3], f[4], f[9]
    if style == 'Credit': ev.append(f'Dialogue: 0,{ts(st)},{ts(en)},Credit,,0,0,0,,{text}'); continue
    ps = pieces(text); tot = sum(len(p) for p in ps); t = st
    for p in ps:
        d = (en - st) * len(p) / tot; ln = wrap(p); wmax = max(width(x) for x in ln); worst = max(worst, wmax); n += 1
        print(f'§SUB_WRAP {name} lines={len(ln)} widest={wmax:.0f}px limit={LIMIT}px {"OK" if len(ln) <= 2 and wmax <= LIMIT else "WRONG"} "{p[:70]}"')
        ev.append([t, t + d, style, name, p]); t += d
# no two captions may overlap in time: libass pushes a later caption UP (out of the band) for the rest of its life if it ever collided with an earlier one
ev.sort(key=lambda e: e[0] if not isinstance(e, str) else 0)
cap = [e for e in ev if not isinstance(e, str)]; cred = [e for e in ev if isinstance(e, str)]
for i in range(len(cap) - 1):
    if cap[i][1] > cap[i + 1][0] - 0.02: cap[i][1] = max(cap[i][0] + 0.2, cap[i + 1][0] - 0.02)
ev = [f'Dialogue: 0,{ts(a)},{ts(b)},{st},{nm},0,0,0,,{tx}' for a, b, st, nm, tx in cap] + cred
open(OUT, 'w').write(head + '\n'.join(ev) + '\n')
print(f'§SUB_WRAP_DONE captions={n} widest={worst:.0f}px limit={LIMIT}px')
