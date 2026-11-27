# ⚠ DO NOT REMOVE — Scope: ERP_DEPTH_FILM.md §11 Post Action: Reporting — opening card (red1 2026-10-13: "just say what it is about — Standard Daily Operational Reporting").
# usage: python3 film_report_title_card.py <out.png>
import sys, os
from PIL import Image, ImageDraw, ImageFont
out = sys.argv[1]; W, H = 1920, 1080
def f(sz, bold=False): return ImageFont.truetype('/usr/share/fonts/truetype/noto/NotoSans-Bold.ttf' if bold else '/usr/share/fonts/truetype/noto/NotoSans-Regular.ttf', sz)
im = Image.new('RGB', (W, H), (0, 0, 0)); d = ImageDraw.Draw(im)
d.text((180, 330), 'POST ACTION · REPORTING', font=f(40, True), fill=(255, 140, 26))
d.text((180, 420), 'Standard Daily', font=f(128, True), fill=(235, 238, 242))
d.text((180, 570), 'Operational Reporting', font=f(128, True), fill=(79, 195, 247))
im.save(out); print('§REPORT_CARD wrote', out)
