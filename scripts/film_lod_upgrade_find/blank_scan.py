# ⚠ DO NOT REMOVE — film "LOD 400 upgrade: finding the added work" rc4 S2 (prompts/FILM_LOD_UPGRADE_FIND.md "FILM rc4 SPEC"). READ THE LOG.
# Issue it proves or disproves: "a stretch of the film shows an empty canvas". A still is BLANK when under 2 % of its scene pane differs from the pane's own background.
#   viewer <work dir>      rate every Viewer fly frame (the scene crop the cards use) -> <work>/blank_frames.json {file: share}; cards.js drops the blank ones and counts them (§FILM_BLANK_DROP)
#   stills <out dir>       rate every finished still of the Modeller beats -> §FILM_BLANK_SCAN; exit 1 when any Modeller still is blank
import json, os, sys
from PIL import Image
LIM = 0.02
def share(im):
    im = im.convert('RGB').resize((340, 134)); px = list(im.getdata()); bg = max(set(px[:200]), key=px[:200].count)
    return sum(1 for p in px if abs(p[0] - bg[0]) + abs(p[1] - bg[1]) + abs(p[2] - bg[2]) > 24) / len(px)
mode, d = sys.argv[1], sys.argv[2]
if mode == 'viewer':
    V = json.load(open(os.path.join(d, 'viewer.json'))); out = {}; x0, y0, w = 50, 196, 830; h = 537 / (1360 / w)
    for k, b in V['beats'].items():
        for f in b['fly']['frames']:
            im = Image.open(os.path.join(d, f)); sx = im.size[0] / 1280; out[f] = round(share(im.crop((int(x0 * sx), int(y0 * sx), int((x0 + w) * sx), int((y0 + h) * sx)))), 4)
        n = sum(1 for f in b['fly']['frames'] if out[f] < LIM); print('§FILM_BLANK_RATE beat=%s fly_frames=%d blank=%d (under %d%% of the scene pane off the background)' % (k, len(b['fly']['frames']), n, LIM * 100))
    json.dump(out, open(os.path.join(d, 'blank_frames.json'), 'w'), indent=0)
else:
    plan = json.load(open(os.path.join(d, 'cards', 'plan.json'))); bad = 0
    for beat, st in plan.items():
        if not (beat.startswith('mod_') or beat.startswith('find_')): continue
        b = [i for i, x in enumerate(st) if share(Image.open(os.path.join(d, 'cards', x['file'])).crop((560, 312, 1920, 849))) < LIM]
        if beat.startswith('mod_') and b: bad += 1
        print('§FILM_BLANK_SCAN beat=%s stills=%d blank=%d %s' % (beat, len(st), len(b), b[:10]))
    print('§FILM_BLANK_VERDICT ' + ('FAIL' if bad else 'PASS') + ' modeller_beats_with_blank_stills=%d' % bad); sys.exit(1 if bad else 0)
