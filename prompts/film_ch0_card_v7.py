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
# Very last card (user 2026-10-07): "How much others will charge for this:" — list prices checked 2026-10-07:
#   solibri.com/pricing (Essential €1,428 · Advanced €2,109 · Premium €2,772, per year / license; Starter €99 not used — entry tier),
#   cdwg.com Navisworks Manage 2027 new annual 1 seat $3,128.15, TUM OIP GPL v3 (cee.ed.tum.de). Unverified figures from the user's pasted
#   summary (R$ 11,217, €6,000+VAT, $185/month, InfraGrid3D free tier, "lane is empty") are NOT on the card.
FEES = [('Model checking (Solibri)', '€1,428 – €2,772 per seat, per year'),
        ('Clash detection (Navisworks Manage)', 'about US$3,100 per seat, per year'),
        ('Open-source IFC viewer (TUM Open Infra Platform)', 'free — views IFC, no rule checks')]
f = Image.new('RGB', (W, H), (0, 0, 0)); d = ImageDraw.Draw(f)
d.text((160, 170), 'How much others will charge for this:', font=font(64, True), fill=(255, 255, 255))
for i, (a, b) in enumerate(FEES):
    y = 330 + i * 150
    d.text((160, y), a, font=font(40), fill=(195, 194, 183))
    d.text((160, y + 54), b, font=font(48, True), fill=(255, 255, 255))
d.text((160, 800), 'BIM OOTB: free, MIT licensed, runs in your browser.', font=font(44, True), fill=(255, 235, 59))
CITES = ['Published list prices, checked 7 October 2026:',
         '[1] Solibri plans & pricing — https://www.solibri.com/pricing (Essential / Advanced / Premium, per year per license)',
         '[2] Navisworks Manage 2027, new annual, 1 seat, US$3,128.15 — cdwg.com/product/autodesk-navisworks-manage-2027-new-subscription-annual-1-seat/9115559',
         '[3] TUM Open Infra Platform, GPL v3 — https://www.cee.ed.tum.de/ccbe/research/research-fields/building-information-modeling-in-infrastructure/tum-open-infra-platform/']
for i, c in enumerate(CITES): d.text((160, 925 + i * 30), c, font=font(20), fill=(150, 150, 150))
f.save(os.path.join(outdir, 'close_fees.png'))
print(f'§CLOSE_FEES_CARD rows={len(FEES)} out={outdir}/close_fees.png')
