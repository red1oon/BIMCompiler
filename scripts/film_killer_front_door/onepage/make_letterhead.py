#!/usr/bin/env python3
# ⚠ DO NOT REMOVE — film "PDF and Excel are killer apps" (Film 1): the LETTERHEAD BANNER of beat 3. A generated picture (nothing from any real brand, no stock art, nothing from any owner's file): a coloured band with a simple drawn mark
# and the demo company's name "GardenWorld" (the demo tenant already printed in the corpus trial balance). Drawn with PIL at 3x of its page size so it is crisp when the page is zoomed. Writes <dir>/banner.png and <dir>/banner.ps
# (the PostScript that draws it across the top of page 1, used by facts.js with ghostscript). Both are generated at build time and NEVER committed. Usage: python3 make_letterhead.py <dir>   (prints one JSON line with the sizes)
import sys, os, json
from PIL import Image, ImageDraw, ImageFont
d = sys.argv[1]; os.makedirs(d, exist_ok=True)
PT_W, PT_H, SC = 609, 72, 3; W, H = PT_W * SC, PT_H * SC          # 609 x 72 pt at 3x = 1827 x 216 px
img = Image.new('RGB', (W, H), (20, 83, 72)); px = img.load()
for x in range(W):                                                # a left-to-right gradient, teal into deep green
    t = x / (W - 1); c = (int(20 + 18 * t), int(83 - 30 * t), int(72 - 12 * t))
    for y in range(H): px[x, y] = c
dr = ImageDraw.Draw(img)
dr.rectangle([0, H - 9, W, H], fill=(231, 190, 74))               # a gold rule along the foot
cx, cy = 150, H // 2 - 2                                          # the mark: a round badge with a simple tree
dr.ellipse([cx - 78, cy - 78, cx + 78, cy + 78], fill=(244, 240, 226))
dr.ellipse([cx - 66, cy - 66, cx + 66, cy + 66], outline=(20, 83, 72), width=5)
dr.polygon([(cx, cy - 50), (cx - 38, cy + 6), (cx + 38, cy + 6)], fill=(31, 111, 78)); dr.polygon([(cx, cy - 22), (cx - 46, cy + 36), (cx + 46, cy + 36)], fill=(24, 94, 66)); dr.rectangle([cx - 7, cy + 36, cx + 7, cy + 58], fill=(121, 85, 48))
fb = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 104); fs = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 36)
dr.text((290, 26), 'GardenWorld', font=fb, fill=(250, 248, 240)); dr.text((296, 146), 'Demo company  ·  made for this film', font=fs, fill=(214, 232, 220))
img.save(os.path.join(d, 'banner.png'))
raw = img.tobytes(); hexs = raw.hex()
ps = '<< /EndPage { exch pop 0 eq { gsave 36 528.5 translate %d %d scale %d %d 8 [%d 0 0 -%d 0 %d] <\n%s\n> false 3 colorimage grestore true } { false } ifelse } >> setpagedevice\n' % (PT_W, PT_H, W, H, W, H, H, '\n'.join(hexs[i:i + 120] for i in range(0, len(hexs), 120)))
open(os.path.join(d, 'banner.ps'), 'w').write(ps)
print(json.dumps({'png': 'banner.png', 'pixels': [W, H], 'pt': [PT_W, PT_H], 'scale': SC}))
