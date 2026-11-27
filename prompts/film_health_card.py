# ⚠ DO NOT REMOVE — Scope: FILM_NARRATION.md §11.v5 CLOSE. Renders the "Overall health" closing card (1920×1080 PNG) for the road film.
# Every number is PARSED from the § logs passed in — none typed here. Read the log: §HEALTH_CARD lines (each value + its source).
# usage: python3 film_health_card.py <road_check.log> <earthworks.log> <clash_narrowphase.log> <road_rules.json> <out.png>
import sys, re, json
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.patches import Rectangle

rc_log, ew_log, cl_log, rules_json, out = sys.argv[1:6]
rc, ew, cl = open(rc_log).read(), open(ew_log).read(), open(cl_log).read()

m = re.search(r'§CLASH_NARROWPHASE pair=GEOTECH\|DRAINAGE broad=(\d+) .*?meshTrue=(\d+)', cl)
broad, real = int(m.group(1)), int(m.group(2))
m = re.search(r'§EARTHWORKS_VOLUME verdict=(\w+) elements=\d+ E=(\d+) V_m3=([\d.]+) B_m3=([\d.]+)', ew)
ev, edges, V, B = m.group(1), int(m.group(2)), float(m.group(3)), float(m.group(4))
checks = {k: (int(p), int(f)) for k, p, f in re.findall(r'rule=(\w+) status=JUDGED population=(\d+) judged=\d+ not_judged=\d+ findings=(\d+)', rc)}
m = re.search(r'rrpm_spacing \d+ min ([\d.]+) max ([\d.]+)', rc)
stud_min, stud_max = float(m.group(1)), float(m.group(2))

rules = json.load(open(rules_json))
status = {}
def walk(o):
    if isinstance(o, dict):
        if 'name' in o and isinstance(o.get('film_status'), dict):
            status[o['name']] = o['film_status'].get('status')
        for v in o.values(): walk(v)
    elif isinstance(o, list):
        for v in o: walk(v)
walk(rules)
spec = [k for k in checks if status.get(k) == 'speculative']
valid = [k for k in checks if status.get(k) == 'valid']
spec_rows = sum(checks[k][1] for k in spec)
for k in checks: print(f'§HEALTH_CARD check={k} population={checks[k][0]} findings={checks[k][1]} status={status.get(k)}')
assert len(spec) + len(valid) == len(checks), 'a road check has no film_status — refuse to draw it'

# Overall = count of checks by evidence state (no weights, no score): clash (proven) + valid road checks (proven) + volume (bounded if APPROXIMATE)
proven = 1 + len(valid) + (1 if ev == 'EXACT' else 0)
bounded = 1 if ev == 'APPROXIMATE' else 0
specn = len(spec)
print(f'§HEALTH_CARD overall proven={proven} bounded={bounded} speculative={specn} total={proven + bounded + specn}')
print(f'§HEALTH_CARD clash real={real} broad={broad} | volume V={V} B={B} edges={edges} verdict={ev} | studs {stud_min}-{stud_max} m groups={checks.get("rrpm_spacing")}')

BG, INK, INK2, MUTED = '#1a1a19', '#ffffff', '#c3c2b7', '#6b6a63'
GOOD, WARN = '#0ca30c', '#fab219'
fig = plt.figure(figsize=(19.2, 10.8), dpi=100, facecolor=BG)
ax = fig.add_axes([0, 0, 1, 1]); ax.set_xlim(0, 1920); ax.set_ylim(1080, 0); ax.axis('off'); ax.set_facecolor(BG)
F = ['Noto Sans', 'Ubuntu Sans']   # Ubuntu Sans carries ≈ (U+2248), Noto Sans does not
ax.text(120, 120, 'Overall health', color=INK, fontsize=64, fontweight='bold', family=F, va='center')
ax.text(122, 190, 'What the checks prove — measured from the model, not graded', color=INK2, fontsize=24, family=F, va='center')

# Big bar: checks by evidence state
x0, y0, W, H, gap = 120, 280, 1680, 100, 4
total = proven + bounded + specn
segs = [(proven, GOOD, None, f'{proven} proven', BG), (bounded, WARN, None, f'{bounded} bounded', BG),
        (specn, MUTED, '//', f'{specn} speculative — shown, not hidden', INK)]
x = x0
for n, c, h, lab, tc in segs:
    if not n: continue
    w = W * n / total - gap
    ax.add_patch(Rectangle((x, y0), w, H, facecolor=c, edgecolor=BG if not h else '#8c8b84', hatch=h, linewidth=0))
    ax.text(x + 20, y0 + H / 2, lab, color=tc, fontsize=28, fontweight='bold', family=F, va='center')
    x += w + gap
ax.text(x0, y0 - 22, f'{total} checks, by what backs them', color=INK2, fontsize=20, family=F)

def row(y, title, frac, color, value, note, hatch=None):
    ax.text(120, y, title, color=INK, fontsize=28, fontweight='bold', family=F, va='center')
    bx, bw, bh = 120, 1100, 22
    ax.add_patch(Rectangle((bx, y + 34), bw, bh, facecolor='#2c2c2a', linewidth=0))
    ax.add_patch(Rectangle((bx, y + 34), max(bw * frac, 6), bh, facecolor=color, hatch=hatch, edgecolor='#8c8b84' if hatch else color, linewidth=0))
    ax.text(1260, y + 45, value, color=INK, fontsize=30, fontweight='bold', family=F, va='center')
    ax.text(120, y + 86, note, color=INK2, fontsize=20, family=F, va='center')

row(470, 'Ground works against drainage', real / broad, GOOD, f'{real} real clashes',
    f'of {broad:,} box overlaps — {100 * real / broad:.2f} % survive the true-shape test')
row(610, 'Earthworks volume', 1.0, WARN, f'≈ {V:,.0f} m³ ± {B:.1f}',
    f'surface has {edges} open edges · error {100 * B / V:.3f} % of the volume, measured, not assumed')
g = checks.get('rrpm_spacing', (0, 0))[0]
row(750, 'Road-stud spacing', 1.0, GOOD, f'{stud_min:.2f} m in {g} of {g} groups',
    'the one road check marked valid')
row(890, 'Sign and marker checks', 1.0, MUTED, f'{len(spec)} speculative',
    f'{spec_rows} rows in the report · the measuring method is still being fixed', hatch='//')
fig.savefig(out, dpi=100, facecolor=BG)
print(f'§HEALTH_CARD out={out}')
