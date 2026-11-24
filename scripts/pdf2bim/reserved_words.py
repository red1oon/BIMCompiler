#!/usr/bin/env python3 -I
# ⚠ DO NOT REMOVE — PDF2BIM_VECTOR_PROBE.md §58: reserved words printed on a plan. Read the log after every run (§WORD lines).
# Implementing PDF2BIM_VECTOR_PROBE.md §58 — Witness: W-S58a (a reserved word on the page with a slab over it = FINDING), falsifier (no hit = NONE, empty OCR = INCONCLUSIVE)
# Usage: reserved_words.py <page image> <dpi> [--chains <chains.json> --db <viewer.db> --storey "Level 2"] [--dict types/reserved_words.json]
import sys, os, json, re, subprocess, tempfile, sqlite3
from PIL import Image
def log(*a): print(*a, flush=True)
A = sys.argv[1:]
def opt(k, d=None): return A[A.index(k) + 1] if k in A else d
page, dpi = A[0], float(A[1]); chains = opt('--chains'); db = opt('--db'); storey = opt('--storey')
D = json.load(open(opt('--dict', os.path.join(os.path.dirname(os.path.abspath(__file__)), 'types', 'reserved_words.json'))))['entries']
img = Image.open(page).convert('L'); name = os.path.basename(page)
ZOOM = 2 if dpi >= 250 else 4
big = img.resize((img.width * ZOOM, img.height * ZOOM), Image.LANCZOS); fd, tmp = tempfile.mkstemp(suffix='.png'); os.close(fd); big.save(tmp)
r = subprocess.run(['tesseract', tmp, '-', '--psm', '11', 'tsv'], capture_output=True, text=True); os.remove(tmp)
words = []
for ln in r.stdout.splitlines()[1:]:
    f = ln.split('\t')
    if len(f) == 12 and f[11].strip() and float(f[10]) > 30: words.append((f[11].strip(), *(int(f[i]) / ZOOM for i in (6, 7, 8, 9)), float(f[10])))
log(f"§WORD_OCR {name} dpi={dpi:g} words read={len(words)}")
if not words: sys.exit(log(f"§WORD {name} verdict=INCONCLUSIVE the OCR returned no words"))
look = {w.upper(): k for k, e in D.items() for w in e['words']}
hits = [(look[re.sub(r'[^A-Za-zÄÖÜäöü]', '', w[0]).upper()], w) for w in words if re.sub(r'[^A-Za-zÄÖÜäöü]', '', w[0]).upper() in look]
if not hits: sys.exit(log(f"§WORD {name} NONE of the {len(D)} reserved words ({', '.join(D)}) on this page"))
frame = None
if chains:
    C = json.load(open(chains)); cdpi = C['dpi']; sc = C['scale_px_per_m']
    def top(d):
        one = [c for c in C['chains'] if c['dir'] == d and len(c['segs']) == 1 and c['segs'][0].get('v')]
        return max(one, key=lambda c: c['segs'][0]['v']) if one else None
    h, v = top('H'), top('V')
    if h and v: frame = dict(x0=h['segs'][0]['L'], y0=v['segs'][0]['L'], sx=sc['H'], sy=sc['V'], cdpi=cdpi, W=h['segs'][0]['v'], Dp=v['segs'][0]['v'])
    log(f"§WORD_FRAME {name} " + (f"origin px=({frame['x0']},{frame['y0']}) @ {cdpi} dpi, house {frame['W']} x {frame['Dp']} m, {frame['sx']:.2f} / {frame['sy']:.2f} px/m" if frame else 'no overall chain pair: positions stay in px'))
for key, (t, x, y, w, h_, conf) in hits:
    cx, cy = x + w / 2, y + h_ / 2; msg = f"§WORD {key} page={name} px=({cx:.0f},{cy:.0f}) @ {dpi:g} dpi conf={conf:.0f}"
    if frame:
        k = frame['cdpi'] / dpi; xm = (cx * k - frame['x0']) / frame['sx']; ym = (cy * k - frame['y0']) / frame['sy']; msg += f" plan=({xm:.2f} m, {ym:.2f} m from the outer NW corner) inside_house={0 <= xm <= frame['W'] and 0 <= ym <= frame['Dp']}"
        log(msg)
        if db and storey:
            c = sqlite3.connect(db); X, Y = xm, -ym
            q = "select m.element_name, b.minZ, b.maxZ from elements_meta m join element_world_bbox b on b.guid=m.guid where m.storey=? and m.ifc_class=? and b.minX<=? and ?<=b.maxX and b.minY<=? and ?<=b.maxY"
            slabs = c.execute(q, (storey, 'IfcSlab', X, X, Y, Y)).fetchall(); ops = [o for o in c.execute(q + " and b.maxX-b.minX>0.5 and b.maxY-b.minY>0.5", (storey, 'IfcOpeningElement', X, X, Y, Y)).fetchall()]
            ok = bool(slabs) and not ops
            log(f"§WORD_MODEL {key} {storey} model point=({X:.2f}, {Y:.2f}) slabs over it={[s[0] for s in slabs]} slab openings over it={[o[0] for o in ops]} -> " + ('FINDING a slab runs over the reserved word (the void is not modelled)' if ok else 'OK no slab over the word' if not slabs or ops else '?'))
    else: log(msg)
log(f"§WORD {name} verdict=FOUND {[k for k, _ in hits]}")
