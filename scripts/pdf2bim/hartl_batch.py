# ⚠ DO NOT REMOVE — PDF2BIM_VECTOR_PROBE.md §57: the Rosetta comparison over the whole harvested set. Read the log after every run (§HB lines).
# Implementing PDF2BIM_VECTOR_PROBE.md §57 — Witness: W-S57b (set: plans judged vs INCONCLUSIVE with reasons, room-area error distribution), falsifier (another plan's labels must not fit)
# Usage: python3 -P hartl_batch.py <harvest dir (index.json, plans/)> <run dir> [<previous run dir for the §57.2 regression>]   -> <run dir>/results.json, per-plan logs
# Implementing §57.2 — Witness: W-S57c (plans moved INCONCLUSIVE -> JUDGED by the outline scale, their error band, the shuffled-value falsifier, regression of the plans already judged)
import sys, os, json, subprocess, statistics
from concurrent.futures import ThreadPoolExecutor
from collections import Counter
HERE = os.path.dirname(os.path.abspath(__file__))
src, out = os.path.abspath(sys.argv[1]), os.path.abspath(sys.argv[2]); os.makedirs(os.path.join(out, 'logs'), exist_ok=True)
def log(*a): print(*a, flush=True)
idx = json.load(open(os.path.join(src, 'index.json')))
plans = [(h, p) for h in idx['houses'] for p in h['plans']]
OUTLINE = '--outline' in sys.argv; sys.argv = [a for a in sys.argv if a != '--outline']
def run(plan, labels=None, shuffle=False):
    a = [sys.executable, '-P', os.path.join(HERE, 'hartl_rosetta.py'), os.path.join(src, 'plans', plan)] + ([os.path.join(src, 'plans', labels)] if labels else []) + (['--shuffle'] if shuffle else []) + (['--outline'] if OUTLINE else [])
    r = subprocess.run(a, capture_output=True, text=True, timeout=600)
    j = [l for l in r.stdout.splitlines() if l.startswith('§HR_JSON ')]
    return r.stdout + r.stderr, (json.loads(j[-1][9:]) if j else dict(plan=plan, verdict='CRASH', why=(r.stderr.strip().splitlines() or ['no output'])[-1][:200]))
res = []
with ThreadPoolExecutor(4) as ex: runs = list(ex.map(lambda hp: run(hp[1]['file']), plans))
for (h, p), (txt, v) in zip(plans, runs):
    open(os.path.join(out, 'logs', p['file'] + '.log'), 'w').write(txt)
    v.update(category=h['category'], house=h['slug'], storey=p['storey']); res.append(v)
    log(f"§HB {p['file']} {h['category']} {p['storey']} verdict={v['verdict']} " + (f"rooms={len(v['rooms'])} labels={v['labels']} matched={v['labels_matched']} median|err|={v['median_abs_err']} worst={v['worst_abs_err']}" if v['verdict'] == 'JUDGED' else f"why={v.get('why')}"))
J = [v for v in res if v['verdict'] == 'JUDGED']
errs = [abs(r['err']) for v in J for r in v['rooms']]
single = [abs(r['err']) for v in J for r in v['rooms'] if len(r['labels']) == 1]
def dist(e): return dict(n=len(e), median=round(statistics.median(e), 4) if e else None, within_3pct=sum(x <= 0.03 for x in e), within_5pct=sum(x <= 0.05 for x in e), within_10pct=sum(x <= 0.10 for x in e))
log(f"§HB_W-S57b plans={len(res)} judged={len(J)} verdicts={dict(Counter(v['verdict'] for v in res))} why={dict(Counter(v.get('why', '')[:40] for v in res if v['verdict'] != 'JUDGED'))}")
log(f"§HB_AREAS all_regions {dist(errs)} | single-label rooms {dist(single)}")
for cat in sorted({v['category'] for v in J}):
    e = [abs(r['err']) for v in J if v['category'] == cat for r in v['rooms'] if len(r['labels']) == 1]; log(f"§HB_AREAS category={cat} single-label rooms {dist(e)}")
for st in sorted({str(v['storey']) for v in J}):
    e = [abs(r['err']) for v in J if str(v['storey']) == st for r in v['rooms'] if len(r['labels']) == 1]; log(f"§HB_AREAS storey={st} single-label rooms {dist(e)}")
# falsifier: each judged plan's regions read against the NEXT judged plan's labels (a different house); the error must be large
fal = []
for a, b in zip(J, J[1:] + J[:1]):
    if a['plan'] == b['plan']: continue
    _, v = run(a['plan'], b['plan'])
    if v['verdict'] == 'JUDGED': fal += [abs(r['err']) for r in v['rooms'] if len(r['labels']) == 1]
log(f"§HB_FALSIFIER regions of one plan vs another plan's labels: {dist(fal)} (the real-label median must be far below this one)")
# W-S57c: what the outline scale added, the shuffled-value falsifier, the regression of the plans the overall-size path already judged
O = [v for v in J if v.get('scale_src') == 'outline']; eo = [abs(r['err']) for v in O for r in v['rooms'] if len(r['labels']) == 1]
log(f"§HB_W-S57c judged_by_overall={len(J) - len(O)} judged_by_outline={len(O)} outline single-label rooms {dist(eo)}")
with ThreadPoolExecutor(4) as ex: sh = [] if not OUTLINE else list(ex.map(lambda v: run(v['plan'], shuffle=True)[1], [v for v in res if v['verdict'] != 'JUDGED' or v.get('scale_src') == 'outline']))
acc = [s['plan'] for s in sh if s.get('accepted')]
log(f"§HB_SHUFFLE shuffled-value consensus on {len(sh)} plans: accepted {len(acc)} {acc} (chance agreement; the real run accepted {len(O)} of the same population)" if OUTLINE else f"§HB_SHUFFLE skipped: the outline route is off (§57.2 RESULT)")
if len(sys.argv) > 3:
    prev = {v['plan']: v for v in json.load(open(os.path.join(os.path.abspath(sys.argv[3]), 'results.json')))['results']}
    bad = []
    for v in res:
        q = prev.get(v['plan'])
        if q and q['verdict'] == 'JUDGED' and (v['verdict'] != 'JUDGED' or v['median_abs_err'] != q['median_abs_err'] or v['rooms'] != q['rooms']): bad.append(v['plan'])
    log(f"§HB_REGRESSION plans judged in the previous run: {sum(1 for q in prev.values() if q['verdict'] == 'JUDGED')}; changed or lost: {len(bad)} {bad} -> {'PASS' if not bad else 'FAIL'}")
json.dump(dict(spec='PDF2BIM_VECTOR_PROBE.md §57', results=res, falsifier=dist(fal)), open(os.path.join(out, 'results.json'), 'w'), indent=1)
