# ⚠ DO NOT REMOVE — Scope: ERP_DEPTH_FILM.md cycle 2 §NEWCLIENT-DEPTH — opening card of the "New Client in Depth" chapter (English). Says what the clip is about.
# usage: python3 film_nc_title_card.py <out.png>
import sys
from PIL import Image, ImageDraw, ImageFont
out = sys.argv[1]; W, H = 1920, 1080
def f(sz, bold=False): return ImageFont.truetype('/usr/share/fonts/truetype/noto/NotoSans-Bold.ttf' if bold else '/usr/share/fonts/truetype/noto/NotoSans-Regular.ttf', sz)
im = Image.new('RGB', (W, H), (0, 0, 0)); d = ImageDraw.Draw(im)
d.text((180, 300), 'NEW CLIENT IN DEPTH', font=f(40, True), fill=(255, 140, 26))
d.text((180, 390), 'Calendar, periods', font=f(120, True), fill=(235, 238, 242))
d.text((180, 530), 'and the Financial Report', font=f(120, True), fill=(79, 195, 247))
d.text((180, 720), 'each step run beside legacy iDempiere first', font=f(44), fill=(160, 168, 176))
im.save(out); print('§NC_CARD wrote', out)
