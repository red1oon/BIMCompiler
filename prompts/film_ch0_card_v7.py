# ⚠ DO NOT REMOVE — Scope: FILM_NARRATION.md §11.v7 Chapter 0 — backdrop Film2OpeningScreenshot.png, title layer (fades) + speech layer
# (the user's verbatim WIP sentence, carried on screen after the title fades). Text only — no numbers. Read the log: §CH0_V7.
# usage: python3 film_ch0_card_v7.py <backdrop.png> <outdir>   → ch0_title.png, ch0_speech.png (1920×1080)
import sys, os
from PIL import Image, ImageDraw, ImageFont, ImageEnhance
bg_path, outdir = sys.argv[1], sys.argv[2]
TITLE = 'IFC Extracted — 4D, 5D to 8D ERP'          # proposed title (CIVIL_HIGHWAY_JELAPANG resume item 5); user may rename
SPEECH = ('This is a work in progress, extracting 3D 4D 5D 7D 8D ERP all from your IFC model with no AI API call. '
          'It is all landed code in our Github repository.')   # user wording 2026-10-06, verbatim
W, H = 1920, 1080
def font(sz, bold=False):
    for p in (['/usr/share/fonts/truetype/noto/NotoSans-Bold.ttf', '/usr/share/fonts/truetype/ubuntu/Ubuntu-B.ttf'] if bold else
              ['/usr/share/fonts/truetype/noto/NotoSans-Regular.ttf', '/usr/share/fonts/truetype/ubuntu/Ubuntu-R.ttf']):
        if os.path.exists(p): return ImageFont.truetype(p, sz)
    return ImageFont.load_default()
bg = Image.open(bg_path).convert('RGB').resize((W, H), Image.LANCZOS)
def band(img, y0, y1, a):
    ov = Image.new('RGBA', (W, H), (0, 0, 0, 0)); ImageDraw.Draw(ov).rectangle([0, y0, W, y1], fill=(10, 12, 16, a))
    return Image.alpha_composite(img.convert('RGBA'), ov)
def wrap(d, text, f, maxw):
    lines, cur = [], ''
    for w in text.split():
        t = (cur + ' ' + w).strip()
        if d.textlength(t, font=f) <= maxw: cur = t
        else: lines.append(cur); cur = w
    return lines + [cur]
t = band(bg, 380, 640, 170); d = ImageDraw.Draw(t)
d.text((120, 420), 'Chapter 0', font=font(36), fill=(195, 194, 183))
d.text((120, 480), TITLE, font=font(84, True), fill=(255, 255, 255))
t.convert('RGB').save(os.path.join(outdir, 'ch0_title.png'))
s = band(bg, 700, 1010, 185); d = ImageDraw.Draw(s); f = font(44)
ls = wrap(d, SPEECH, f, W - 240)
for i, l in enumerate(ls): d.text((120, 740 + i * 64), l, font=f, fill=(255, 255, 255))
s.convert('RGB').save(os.path.join(outdir, 'ch0_speech.png'))
print(f'§CH0_V7 backdrop={os.path.basename(bg_path)} title="{TITLE}" speechLines={len(ls)} out={outdir}')
# Closing WIP card (FILM_NARRATION §11.v7 — after "Now you know what you got", before Chapter End): black, user wording verbatim.
CLOSE = ('Civil Works Road Construction is our latest challenge, to prove the concept that BIM compiler can be applied. '
         'Give us another week to complete.')
CLOSE2 = ('What is important is the computed data - giving the compliance report, truthful geo - drainage clashes, '
          'and a full Viewer experience even on mobile.')   # user 2026-10-06, 2nd statement, verbatim
c = Image.new('RGB', (W, H), (0, 0, 0)); d = ImageDraw.Draw(c); f = font(52); f2 = font(44)
ls = wrap(d, CLOSE, f, W - 360); ls2 = wrap(d, CLOSE2, f2, W - 360)
y0 = (H - len(ls) * 76 - 70 - len(ls2) * 64) // 2
for i, l in enumerate(ls): d.text(((W - d.textlength(l, font=f)) // 2, y0 + i * 76), l, font=f, fill=(255, 255, 255))
y1 = y0 + len(ls) * 76 + 70
for i, l in enumerate(ls2): d.text(((W - d.textlength(l, font=f2)) // 2, y1 + i * 64), l, font=f2, fill=(195, 194, 183))
ls = ls + ls2
c.save(os.path.join(outdir, 'close_wip.png'))
print(f'§CLOSE_WIP_CARD lines={len(ls)} out={outdir}/close_wip.png')
