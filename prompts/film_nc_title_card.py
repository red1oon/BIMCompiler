# ⚠ DO NOT REMOVE — Scope: ERP_DEPTH_FILM.md cycle 2 §NEWCLIENT-DEPTH — opening card of the "New Client in Depth" chapter (English). Says what the clip is about.
# usage: python3 film_nc_title_card.py <out.png> [kicker line1 line2 footer]
import sys
from PIL import Image, ImageDraw, ImageFont
out = sys.argv[1]; W, H = 1920, 1080
A = sys.argv[2:] if len(sys.argv) > 2 else [A[0], A[1], A[2], A[3]]
TH = any('\u0e00' <= ch <= '\u0e7f' for a in A for ch in a)   # Thai text -> Noto Sans Thai (the Latin face has no Thai glyphs)
ZH = any('\u4e00' <= ch <= '\u9fff' for a in A for ch in a)   # Chinese text -> Noto Sans CJK (the Latin face has no Han glyphs)
def f(sz, bold=False):
    if ZH: return ImageFont.truetype('/usr/share/fonts/opentype/noto/NotoSansCJK-' + ('Bold' if bold else 'Regular') + '.ttc', sz, index=2)  # index 2 = SC
    base = '/usr/share/fonts/truetype/noto/NotoSansThai-' if TH else '/usr/share/fonts/truetype/noto/NotoSans-'
    return ImageFont.truetype(base + ('Bold.ttf' if bold else 'Regular.ttf'), sz)
im = Image.new('RGB', (W, H), (0, 0, 0)); d = ImageDraw.Draw(im)
def put(xy, s, sz, fill, bold=False):   # Thai: Thai runs in Noto Sans Thai, everything else (Latin, digits, punctuation) in Noto Sans - each face only has its own glyphs
    if not TH: d.text(xy, s, font=f(sz, bold), fill=fill); return
    x, y = xy; ft = ImageFont.truetype('/usr/share/fonts/truetype/noto/NotoSansThai-' + ('Bold.ttf' if bold else 'Regular.ttf'), sz); fl = ImageFont.truetype('/usr/share/fonts/truetype/noto/NotoSans-' + ('Bold.ttf' if bold else 'Regular.ttf'), sz)
    run, cur = '', None
    def flush(x):
        nonlocal run
        if run: fo = ft if cur else fl; d.text((x, y), run, font=fo, fill=fill); x += d.textlength(run, font=fo); run = ''
        return x
    for ch in s:
        t = '\u0e00' <= ch <= '\u0e7f'
        if ch == ' ' and cur is not None: t = cur
        if cur is None: cur = t
        if t != cur: x = flush(x); cur = t
        run += ch
    flush(x)
put((180, 300), A[0], 40, (255, 140, 26), True)
put((180, 390), A[1], 120, (235, 238, 242), True)
put((180, 530), A[2], 120, (79, 195, 247), True)
put((180, 720), A[3], 44, (160, 168, 176))
im.save(out); print('§NC_CARD wrote', out)
