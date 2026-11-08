#!/usr/bin/env python3
# ⚠ DO NOT REMOVE — Film 2 copy of ../../th/fit/glyph_check_th.py (original untouched): the PAGE stack also lists Noto Color Emoji, because the log excerpts on the u_probes card contain the red-circle emoji from the real witness log (Chrome falls back to that font). Original scope: Thai glyph coverage by FONT FILE (no eyes): every character that reaches the screen (screen_chars.txt written by the recorder) or the burned captions (<tag>.ass / the band ass) must exist in at least one of the fonts the page / libass can use.
# Prints §GLYPH_COVER per font family stack and §GLYPH_COVER_DONE. A character found in NO font is a tofu box. Control: U+0E3B (unassigned) must be reported missing, or the check is blind.
# usage: glyph_check_th.py <screen_chars.txt> <band.ass> [more text files...]
import sys, re
from fontTools.ttLib import TTFont
F = {'Noto Sans Thai Regular': '/usr/share/fonts/truetype/noto/NotoSansThai-Regular.ttf', 'Noto Sans Thai Bold': '/usr/share/fonts/truetype/noto/NotoSansThai-Bold.ttf', 'Noto Sans Regular': '/usr/share/fonts/truetype/noto/NotoSans-Regular.ttf', 'Noto Sans Bold': '/usr/share/fonts/truetype/noto/NotoSans-Bold.ttf',
     'DejaVu Sans': '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 'DejaVu Sans Mono': '/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf', 'Noto Color Emoji': '/usr/share/fonts/truetype/noto/NotoColorEmoji.ttf'}
cm = {k: set(TTFont(v).getBestCmap().keys()) for k, v in F.items()}
def chars_of(path, ass=False):
    t = open(path, encoding='utf8').read()
    if ass: t = '\n'.join(l.split(',', 9)[9] for l in t.splitlines() if l.startswith('Dialogue:'))
    return {c for c in t if c.strip() and ord(c) > 31}
screen = chars_of(sys.argv[1]); cap = chars_of(sys.argv[2], True)
extra = set()
for p in sys.argv[3:]: extra |= chars_of(p)
stacks = {'page (sans bold/regular: Noto Sans Thai, Noto Sans, DejaVu Sans)': ['Noto Sans Thai Regular', 'Noto Sans Thai Bold', 'Noto Sans Regular', 'Noto Sans Bold', 'DejaVu Sans', 'Noto Color Emoji'],
          'libass captions (Noto Sans Thai + fontconfig fallback)': ['Noto Sans Thai Regular', 'Noto Sans Regular', 'DejaVu Sans']}
bad = 0
def check(name, chars, fonts):
    global bad
    miss = sorted(c for c in chars if not any(ord(c) in cm[f] for f in fonts))
    thai = [c for c in chars if '฀' <= c <= '๿']
    thai_in_thai_font = [c for c in thai if ord(c) in cm['Noto Sans Thai Regular']]
    print(f'§GLYPH_COVER {name}: chars={len(chars)} thai={len(thai)} thai_in_Noto_Sans_Thai={len(thai_in_thai_font)} missing_in_every_font={len(miss)} [{"".join(miss)}] {"OK" if not miss and len(thai) == len(thai_in_thai_font) else "WRONG"}')
    if miss or len(thai) != len(thai_in_thai_font): bad += 1
check('screen', screen, stacks['page (sans bold/regular: Noto Sans Thai, Noto Sans, DejaVu Sans)'])
check('captions', cap, stacks['libass captions (Noto Sans Thai + fontconfig fallback)'])
if extra: check('extra texts', extra, stacks['page (sans bold/regular: Noto Sans Thai, Noto Sans, DejaVu Sans)'])
ctl = [c for c in '฻' if not any(ord(c) in cm[f] for f in F)]
print(f'§GLYPH_COVER_CONTROL U+0E3B reported missing: {"yes" if ctl else "NO (check is blind)"}')
print(f'§GLYPH_COVER_DONE {"PASS" if bad == 0 and ctl else "FAIL"}')
sys.exit(0 if bad == 0 and ctl else 1)
