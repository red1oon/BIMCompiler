# ⚠ DO NOT REMOVE — Scope: ERP_DEPTH_FILM.md cycle 2 §NEWCLIENT-DEPTH — opening card of the "New Client in Depth" chapter (English). Says what the clip is about.
# usage: python3 film_nc_title_card.py <out.png> [kicker line1 line2 footer]
import sys
from PIL import Image, ImageDraw, ImageFont
out = sys.argv[1]; W, H = 1920, 1080
A = sys.argv[2:] if len(sys.argv) > 2 else [A[0], A[1], A[2], A[3]]
TH = any('\u0e00' <= ch <= '\u0e7f' for a in A for ch in a)   # Thai text -> Noto Sans Thai (the Latin face has no Thai glyphs)
def f(sz, bold=False):
    base = '/usr/share/fonts/truetype/noto/NotoSansThai-' if TH else '/usr/share/fonts/truetype/noto/NotoSans-'
    return ImageFont.truetype(base + ('Bold.ttf' if bold else 'Regular.ttf'), sz)
im = Image.new('RGB', (W, H), (0, 0, 0)); d = ImageDraw.Draw(im)
d.text((180, 300), A[0], font=f(40, True), fill=(255, 140, 26))
d.text((180, 390), A[1], font=f(120, True), fill=(235, 238, 242))
d.text((180, 530), A[2], font=f(120, True), fill=(79, 195, 247))
d.text((180, 720), A[3], font=f(44), fill=(160, 168, 176))
im.save(out); print('§NC_CARD wrote', out)
