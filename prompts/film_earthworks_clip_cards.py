# ⚠ DO NOT REMOVE — Scope: FILM_NARRATION.md §EARTHWORKS_CLIP. Text cards for the Earthworks / Cut & Fill clip. Backdrop = the user's
# latest screenshot (darkened). Numbers on c3 are read off that screenshot's own panel (CUT 119,703 m³ · FILL 278,307 m³) — PRIME rule.
# Closing black card = the user's claim line (paraphrased: "computed", because cut/fill is INFERRED, not extracted) + the prior-art
# lines (web search 2026-10-09, prices third-party/undated where noted). Read the log: §EW_CARDS.
# usage: python3 film_earthworks_clip_cards.py <backdrop.png> <outdir>   → cover.png c1.png c2.png c3.png end.png close.png (1920×1080)
import sys, os
from PIL import Image, ImageDraw, ImageFont
bg_path, outdir = sys.argv[1], sys.argv[2]; os.makedirs(outdir, exist_ok=True)
W, H = 1920, 1080
def font(sz, bold=False):
    for p in (['/usr/share/fonts/truetype/noto/NotoSans-Bold.ttf', '/usr/share/fonts/truetype/ubuntu/Ubuntu-B.ttf'] if bold else
              ['/usr/share/fonts/truetype/noto/NotoSans-Regular.ttf', '/usr/share/fonts/truetype/ubuntu/Ubuntu-R.ttf']):
        if os.path.exists(p): return ImageFont.truetype(p, sz)
    return ImageFont.load_default()
def cover_fit(im):
    r = max(W / im.width, H / im.height); im = im.resize((int(im.width * r), int(im.height * r)), Image.LANCZOS)
    x, y = (im.width - W) // 2, (im.height - H) // 2; return im.crop((x, y, x + W, y + H))
def wrap(d, text, f, maxw):
    out, cur = [], ''
    for w in text.split():
        t = (cur + ' ' + w).strip()
        if d.textlength(t, font=f) <= maxw: cur = t
        else: out.append(cur); cur = w
    return out + ([cur] if cur else [])
bg = cover_fit(Image.open(bg_path).convert('RGB'))
def card(name, title, lines, sub=None, big=False):
    im = bg.convert('RGBA'); ov = Image.new('RGBA', (W, H), (8, 10, 14, 185)); im = Image.alpha_composite(im, ov); d = ImageDraw.Draw(im)
    y = 300 if not big else 380
    ft = font(96 if big else 74, True)
    for t in wrap(d, title, ft, W - 360): d.text((180, y), t, font=ft, fill=(79, 195, 247)); y += (112 if big else 88)
    if sub: y += 10; d.text((180, y), sub, font=font(44), fill=(220, 224, 230)); y += 70
    y += 20; fb = font(46)
    for ln in lines:
        col = (255, 140, 26) if ln.startswith('CUT') else (51, 136, 255) if ln.startswith('FILL') else (235, 238, 242)
        for t in wrap(d, ln, fb, W - 360): d.text((180, y), t, font=fb, fill=col); y += 64
        y += 14
    im.convert('RGB').save(os.path.join(outdir, name + '.png')); print('§EW_CARDS wrote', name)
card('cover', 'Earthworks & Roadworks', [], sub='Cut and fill, inferred from the model', big=True)
card('c1', 'Why chainage matters', ['A highway is not a building.', 'You cannot walk it and simply know where you are.', 'Chainage says exactly where the earth is cut, and where it is filled.'])
card('c2', 'How it decides', ['Ground above the road on both sides: CUT, orange.', 'Ground below the road on both sides: FILL, blue.', 'One of each: side-hill, each side its own colour.', 'Blue, never green, so it is not mistaken for trees.'])
card('c3', 'Today on Civil Works', ['CUT 119,703 m³    FILL 278,307 m³', 'Read off the panel in the recording. Rough prisms, inferred, not extracted.', 'Roadworks, cost, duration and plant are listed as pending.'])
card('end', 'Inferred from the IFC alone', ['Every value comes from the model file itself.', 'Engineers can correct it when the design surfaces arrive.'])
# closing black card
im = Image.new('RGB', (W, H), (0, 0, 0)); d = ImageDraw.Draw(im)
y = 150
for t in wrap(d, 'Computed entirely from a standard IFC2X3 file, even a low-grade one. No AI. No API call.', font(54, True), W - 300): d.text((150, y), t, font=font(54, True), fill=(255, 255, 255)); y += 72
y += 40; d.text((150, y), 'PRIOR ART CHECK  (web search 2026-10-09 · list prices vary by region and vendor)', font=font(34, True), fill=(255, 193, 7)); y += 62
FB = font(35)
for ln in ['Autodesk Civil 3D: cut/fill volumes from its own design surfaces · US$2,870 per year (Autodesk FAQ)',
           'Bentley OpenRoads Designer: US$6,057 per year, US$15,142 perpetual (G2 listing, updated March 2026)',
           'Trimble Business Center: cut/fill volume tools · US$2,865 to US$4,405 per licence (reseller listings, billing basis unclear)',
           '12d Model: open price, quote only · Novapoint: no public price found',
           'Here: inferred from the exported IFC alone, in the browser, no install.']:
    for t in wrap(d, ln, FB, W - 300): d.text((150, y), t, font=FB, fill=(210, 210, 210)); y += 48
    y += 14
im.save(os.path.join(outdir, 'close.png')); print('§EW_CARDS wrote close (black)')
