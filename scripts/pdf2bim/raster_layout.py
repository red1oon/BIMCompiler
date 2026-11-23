# Implementing PDF2BIM_VECTOR_PROBE.md §43.13 — Witness: W-S16 (sheet arrangement as a type reference)
# Usage:
#   python3 -P raster_layout.py learn <out_template.json> <kind>=<page.png> [<kind>=<page.png> ...]
#   python3 -P raster_layout.py match <template.json> <page.png> [...]          > raster_layout.log
# Anchor words + their page-normalised centres, at the page's best rotation (most anchor hits). Local Tesseract only.
import sys, os, re, json, subprocess, tempfile
import numpy as np
from PIL import Image

def log(*a): print(*a, flush=True)

ANCHORS = [('ANSICHT', r'^ANSICHT$'), ('SCHNITT', r'^SCHNITT$'), ('LEGENDE', r'^LEGENDE$'), ('WERKPLAN', r'^WERKPLAN$'),
           ('VORABZUG', r'^VORABZUG$'), ('STOREY', r'^(ERD|OBER|DACH|KELLER|UNTER)GESCHOSS$|^SPEICHER$')]
POS_TOL = 0.12

def frame(img):
    """the drawing's own frame = bbox of its ink (0.2 / 99.8 percentiles of ink coordinates): a sheet drawn smaller
    or offset inside the scan normalises the same way (§43.13: p3's sheet sits inside wide white margins)"""
    a = np.asarray(img) < 128; ys, xs = np.where(a)
    return (np.percentile(xs, 0.2), np.percentile(ys, 0.2), np.percentile(xs, 99.8), np.percentile(ys, 99.8))

def words(img):
    fx0, fy0, fx1, fy1 = frame(img)
    with tempfile.TemporaryDirectory() as d:
        f = os.path.join(d, 'p.png'); img.save(f)
        r = subprocess.run(['tesseract', f, 'stdout', '--psm', '11', 'tsv'], capture_output=True, text=True)
    out = []
    for ln in r.stdout.splitlines()[1:]:
        c = ln.split('\t')
        if len(c) == 12 and c[11].strip() and float(c[10]) >= 60:
            t = re.sub(r'[^A-ZÄÖÜ]', '', c[11].upper())
            for name, rx in ANCHORS:
                if re.match(rx, t):
                    out.append(dict(a=name, word=t, cx=(int(c[6]) + int(c[8]) / 2 - fx0) / (fx1 - fx0),
                                    cy=(int(c[7]) + int(c[9]) / 2 - fy0) / (fy1 - fy0), conf=float(c[10])))
    return out

def read_page(path):
    im = Image.open(path).convert('L')
    best = None
    for rot in (0, 90, 180, 270):
        w = words(im.rotate(rot, expand=True))
        log(f"§LAYOUT_ROT page={os.path.basename(path)} rot={rot} anchors={len(w)}")
        if best is None or len(w) > len(best[1]): best = (rot, w)
    return best

if sys.argv[1] == 'learn':
    tpl = {'_about': 'Sheet-arrangement fingerprint of a German Werkplan set (PDF2BIM_VECTOR_PROBE.md §43.13). Learned, then EDITABLE: '
                     'anchors per sheet kind with page-normalised centres at the best rotation; match tolerance ' + str(POS_TOL), 'kinds': {}}
    for kv in sys.argv[3:]:
        kind, path = kv.split('=', 1)
        rot, w = read_page(path)
        tpl['kinds'][kind] = dict(learned_from=os.path.basename(path), rotation=rot,
                                  anchors=[dict(a=x['a'], word=x['word'], cx=round(x['cx'], 3), cy=round(x['cy'], 3)) for x in w])
        log(f"§LAYOUT_LEARN kind={kind} page={os.path.basename(path)} rot={rot} anchors=" +
            ' '.join(f"{x['word']}@({x['cx']:.2f},{x['cy']:.2f})" for x in w))
    json.dump(tpl, open(sys.argv[2], 'w'), indent=1, ensure_ascii=False)
else:
    tpl = json.load(open(sys.argv[2]))
    def score(w, k):
        exp = k['anchors']; used = set(); green = 0; rows = []
        for e in exp:
            c = [i for i, x in enumerate(w) if i not in used and x['a'] == e['a'] and abs(x['cx'] - e['cx']) <= POS_TOL and abs(x['cy'] - e['cy']) <= POS_TOL]
            if c: used.add(c[0]); green += 1; rows.append(f"GREEN {e['word']}")
            else: rows.append(f"YELLOW missing {e['word']}@({e['cx']},{e['cy']})")
        return (green / len(exp) if exp else 0), green, len(exp), len(w) - len(used), rows
    for path in sys.argv[3:]:
        im = Image.open(path).convert('L'); best = None
        for rot in (0, 90, 180, 270):
            w = words(im.rotate(rot, expand=True))
            for kind, k in tpl['kinds'].items():
                sc = score(w, k)
                log(f"§LAYOUT_SCORE page={os.path.basename(path)} rot={rot} kind={kind} score={sc[0]:.2f} ({sc[1]}/{sc[2]}) unexpected={sc[3]} | " + '; '.join(sc[4]))
                if best is None or sc[0] > best[0]: best = (sc[0], rot, kind)
        verdict = best[2] if best and best[0] >= 0.5 else 'UNKNOWN'
        log(f"§LAYOUT_CLASS page={os.path.basename(path)} rot={best[1]} -> {verdict} best_score={best[0]:.2f}")
