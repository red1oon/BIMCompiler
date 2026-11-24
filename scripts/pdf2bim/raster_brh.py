# ⚠ DO NOT REMOVE — PDF2BIM_VECTOR_PROBE.md §54.2: the sill heights a German Werkplan prints (BRH = Brüstungshöhe). Read the log after every run (§RASTER_BRH lines).
# Implementing PDF2BIM_VECTOR_PROBE.md §54.2 — Witness: W-S54b (every BRH label read on the plan, with its value; READ only when all agree)
# Usage: python3 -P raster_brh.py <plan workdir (chains.json)>  -> <work>/brh.json
#   Local OCR (tesseract, as §43) on the plan's RAW page (the clean page's thresholding breaks the small digits, measured) upscaled 2x (the scan is 200 dpi; measured: at 1x no label reads, at 2x the OG labels read).
#   A label = the word BRH (or the OCR's BPH / 8RH confusions) and the nearest number within 3 word heights to its right or below. sill_mm is READ only when
#   >= 3 labels agree to 10 mm and they are >= 2/3 of the reads (an OCR outlier is logged); otherwise nothing is written as READ (the registry DEFAULT stays) and the disagreement is logged.
import sys, os, json, re, subprocess, tempfile
from PIL import Image

def log(*a): print(*a, flush=True)
work = sys.argv[1]
C = json.load(open(os.path.join(work, 'chains.json')))
out_p = os.path.join(work, 'brh.json')
im = Image.open(C['page']).convert('L'); im = im.resize((im.width * 2, im.height * 2), Image.LANCZOS)
tmp = tempfile.NamedTemporaryFile(suffix='.png', delete=False).name; im.save(tmp)
words = []
for psm in ('11', '12'):
    r = subprocess.run(['tesseract', tmp, '-', '--psm', psm, 'tsv'], capture_output=True, text=True)
    for ln in r.stdout.splitlines()[1:]:
        f = ln.split('\t')
        if len(f) < 12 or not f[11].strip(): continue
        try: words.append(dict(x=int(f[6]), y=int(f[7]), w=int(f[8]), h=int(f[9]), conf=float(f[10]), t=f[11].strip()))
        except ValueError: pass
os.unlink(tmp)
labs = [w for w in words if re.fullmatch(r'(BRH|BPH|8RH|BRN)', w['t']) and w['conf'] >= 30]
nums = [w for w in words if re.fullmatch(r'[0-2][.,]\d\d', w['t']) and w['conf'] >= 30]
seen = {}; vals = []
for L in labs:
    key = (round(L['x'] / 20), round(L['y'] / 20))
    if key in seen: continue
    seen[key] = 1; H = max(L['h'], L['w'] if L['w'] < L['h'] else L['h'])
    cand = [n for n in nums if (0 <= n['x'] - (L['x'] + L['w']) <= 3 * H and abs(n['y'] - L['y']) <= H) or (0 <= n['y'] - (L['y'] + L['h']) <= 3 * H and abs(n['x'] - L['x']) <= 2 * H)]
    if not cand: log(f"§RASTER_BRH label at px ({L['x']},{L['y']}) '{L['t']}' conf {L['conf']:.0f}: no number beside it (unread)"); continue
    n = min(cand, key=lambda n: abs(n['x'] - L['x']) + abs(n['y'] - L['y'])); v = round(float(n['t'].replace(',', '.')) * 1000)
    vals.append(v); log(f"§RASTER_BRH label at px ({L['x']},{L['y']}) '{L['t']}' -> '{n['t']}' = {v} mm (conf {L['conf']:.0f}/{n['conf']:.0f})")
# the agreeing majority: >= 3 labels within 10 mm of each other AND >= 2/3 of all reads (an OCR outlier, e.g. '1,02' read as '1.92', is logged, not used)
grp = max(([v for v in vals if abs(v - c) <= 10] for c in vals), key=len) if vals else []
ok = len(grp) >= 3 and 3 * len(grp) >= 2 * len(vals)
sill = round(sum(grp) / len(grp)) if ok else None
log(f"§RASTER_W-S54b labels={len(seen)} read={len(vals)} values_mm={sorted(vals)} agreeing={len(grp)} outliers={[v for v in vals if v not in grp]} -> sill_mm={sill} "
    f"verdict={'READ' if ok else ('DISAGREE (nothing READ)' if vals else 'VACUOUS (no label read)')}")
json.dump(dict(spec='PDF2BIM_VECTOR_PROBE.md §54.2', labels=len(seen), values_mm=vals, sill_mm=sill), open(out_p, 'w'), indent=1)
