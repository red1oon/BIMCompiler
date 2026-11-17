# ⚠ DO NOT REMOVE — film "Help that answers, in the Viewer" v3 (bim-compiler prompts/VOCAB_MESSAGE_CATALOG.md §17.3 F3): measures the lower band (y 290-910 of each 1920x1080 still) of every card that has one, from the
# PNG's own pixels plus the numbers cards.js recorded in cards/band.json, and FAILS a still under a bar. A frame that is "bigger" is a number, not a look. Bars are set from the v2 film's measured values (see BARS).
#   (a) page share   = share of the band's pixels that are not the film background #0f172a (v2 letterboxed the whole page: its share was far below 1)
#   (b) building     = the model's projected box height inside the band / band height (v2: the page opened with the model at ~0.19 of the canvas height)
#   (c) subject width = share of the band's width spanned by the subject (the panels and the model's box, united, inside the region) — the empty side margins are 1 - c (v2: the whole page was a 1102 px thumbnail = 0.57)
#   (d) glyph        = the smallest font size of the visible text in the subject x the zoom, in band pixels (v2: 9 css px x 0.76 x 1.2 = 8.2 in its help-panel crop; the §11 film's own smallest glyph was NOT re-measured)
# Usage: framecheck.py <cards dir> [--falsifier | --v2]   (--falsifier: every band replaced by an empty one; --v2: the v2 layout's measured numbers judged against the same bars — each must FAIL, so the bars separate v2 from v3 and the check can say NO)
import json, os, sys
import numpy as np
from PIL import Image

BG = (0x0F, 0x17, 0x2A)
# bars, set 2026-11-17 from the first measurement: v2 (frames of its mp4 at 18-90 s: a 0.57-0.82; b 0.19 = model box 169 of 900 css px at page open, probe; c 0.57; d 8.2) against the v3 trial (a 1.00; b 0.86-0.99; c 0.62-1.00; d 11.0-13.6)
BARS = {'a': 0.99, 'b': 0.80, 'c': 0.60, 'd': 10.5}
V2 = {'a': 0.57, 'b': 0.19, 'c': 0.57, 'd': 8.2}
MT, MH = 290, 620

def verdict(a, b, c, d):
    return [k for k, ok in (('a', a >= BARS['a']), ('b', b >= BARS['b']), ('c', c >= BARS['c']), ('d', d is None or d >= BARS['d'])) if not ok]

def main():
    d = sys.argv[1]; fals = '--falsifier' in sys.argv
    if '--v2' in sys.argv:
        f = verdict(V2['a'], V2['b'], V2['c'], V2['d']); print('§FRAMECHECK v2 numbers %s against bars %s -> fail %s %s' % (json.dumps(V2), json.dumps(BARS), f, 'VERDICT FAIL (as it must)' if len(f) == 4 else 'VERDICT PASS (the bars do not separate v2 from v3)')); sys.exit(0 if len(f) == 4 else 1)
    bm = json.load(open(os.path.join(d, 'band.json')))
    bad = 0; n = 0
    for f, m in sorted(bm.items()):
        im = np.asarray(Image.open(os.path.join(d, f)).convert('RGB')).astype(int)
        band = im[MT:MT + MH, :, :]
        if fals: band = np.zeros_like(band) + np.array(BG)   # an empty band
        a = 1.0 - (np.abs(band - np.array(BG)).sum(axis=2) < 6).mean()
        b = m['building_h']; c = m['subject_w_in_band']; dd = m['min_font_band_px']
        fail = verdict(a, b, c, dd)
        n += 1; bad += 1 if fail else 0
        print('§FRAME %s %s z=%.3f a_page_share=%.4f b_building_h=%.3f c_subject_w=%.3f d_glyph_px=%s panels=%s %s' % (f, m['shot'], m['z'], a, b, c, dd, m['panels_in_region'], 'OK' if not fail else 'TOO-SMALL ' + ','.join(fail)))
    print('§FRAMECHECK stills=%d bars=%s %s%s' % (n, json.dumps(BARS), 'VERDICT ' + ('PASS' if (n and not bad) else ('INCONCLUSIVE' if not n else 'FAIL %d' % bad)), ' (falsifier: an empty band)' if fals else ''))
    sys.exit(0 if (n and not bad) else 1)

main()
