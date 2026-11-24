# ⚠ DO NOT REMOVE — PDF2BIM_VECTOR_PROBE.md §44: ONE COMMAND, scanned PDF -> STD sheets. Read the log after every run (out/logs/, and this script's § lines).
# Implementing PDF2BIM_VECTOR_PROBE.md §44 — Witness: W-S44a (sheets = the hand-run chain's), W-S44b (every carried value logged with its source), W-S44c (no storey word -> nothing written)
# Usage: python3 -P scan2dxf.py <scan.pdf> <out_dir>   -> <out_dir>/std/*.dxf, <out_dir>/work/*, <out_dir>/logs/NN_*.log
# Runs the existing raster_*.py scripts UNCHANGED; the only inputs are the PDF and the type files in types/. No value is typed between steps.
import sys, os, json, subprocess, re, glob, shutil
HERE = os.path.dirname(os.path.abspath(__file__)); TYPES = os.path.join(HERE, 'types')
sys.path.insert(0, HERE)
from raster_body import anchor_chains

def log(*a): print(*a, flush=True)
pdf, out = os.path.abspath(sys.argv[1]), os.path.abspath(sys.argv[2])
for d in ('pages', 'work', 'logs', 'std'): os.makedirs(os.path.join(out, d), exist_ok=True)
N = [0]
def run(name, script, *args, ok=(0,)):
    N[0] += 1; lp = os.path.join(out, 'logs', f'{N[0]:02d}_{name}.log')
    r = subprocess.run([sys.executable, '-P', os.path.join(HERE, script)] + [str(a) for a in args], stdout=open(lp, 'w'), stderr=subprocess.STDOUT)
    log(f"§SCAN_STEP {N[0]:02d} {name} exit={r.returncode} log={os.path.relpath(lp, out)}")
    if r.returncode not in ok: stop(f"step {name} exit {r.returncode}: read {os.path.relpath(lp, out)}")
    return lp
def carry(name, value, src): log(f"§SCAN_CARRY {name}={value} from={src}"); return value
def stop(why):
    shutil.rmtree(os.path.join(out, 'std'), ignore_errors=True)   # nothing written on a stop
    log(f"§SCAN verdict=INCONCLUSIVE {why} (no sheets written)"); sys.exit(2)
W = lambda n: os.path.join(out, 'work', n)

# 1. render (200 dpi: the lane's measured scan resolution, §43.6)
subprocess.run(['pdftoppm', '-r', '200', '-png', pdf, os.path.join(out, 'pages', 'p')], check=True)
pages = sorted(glob.glob(os.path.join(out, 'pages', 'p-*.png')), key=lambda p: int(re.findall(r'-(\d+)\.png$', p)[0]))
log(f"§SCAN_PAGES {len(pages)} rendered at 200 dpi")

# 2. classify: kind + rotation per page, the storey word of each plan (§LAYOUT_STOREY)
lp = run('layout', 'raster_layout.py', 'match', os.path.join(TYPES, 'german_werkplan_layout.json'), *pages)
cls, storey = {}, {}
for ln in open(lp):
    m = re.match(r'§LAYOUT_CLASS page=(\S+) rot=(\d+) -> (\S+) best_score', ln)
    if m: cls[m.group(1)] = (int(m.group(2)), m.group(3))
    m = re.match(r'§LAYOUT_STOREY page=(\S+) rot=\d+ words=(.*)$', ln)
    if m: storey[m.group(1)] = sorted({re.match(r'([A-ZÄÖÜ]+):', w).group(1) for w in m.group(2).split(',') if w.strip() and float(w.split(':')[1]) >= 60})
ORDER = {'KELLERGESCHOSS': 0, 'UNTERGESCHOSS': 0, 'ERDGESCHOSS': 1, 'OBERGESCHOSS': 2, 'DACHGESCHOSS': 3, 'SPEICHER': 3}   # German storey sequence
plans = [p for p in cls if cls[p][1] == 'plan']; views = [p for p in cls if cls[p][1] == 'views']
log(f"§SCAN_CLASS " + ' '.join(f"{p}:{k}@{r}" for p, (r, k) in sorted(cls.items())) + f" | storey words {storey}")
if len(plans) != 2: stop(f"{len(plans)} plan pages (the emitter takes exactly two storeys)")
if len(views) != 1: stop(f"{len(views)} views pages (need one)")
for p in plans:
    if len(storey.get(p, [])) != 1 or storey[p][0] not in ORDER: stop(f"plan {p}: storey word {storey.get(p)} (need exactly one readable)")
if ORDER[storey[plans[0]][0]] == ORDER[storey[plans[1]][0]]: stop(f"both plans read the same storey level {storey}")
plans.sort(key=lambda p: ORDER[storey[p][0]])   # lower storey first
for p in plans: carry(f'storey[{p}]', storey[p][0], f'{os.path.relpath(lp, out)}:§LAYOUT_STOREY')

# 3. plans: probe each (upright first), the reference = the plan whose chains anchor both ways
img = {}
for p in plans:
    rot = cls[p][0]; src = os.path.join(out, 'pages', p)
    if rot:
        up = os.path.join(out, 'pages', p.replace('.png', '_up.png'))
        run(f'upright_{p[:-4]}', 'raster_layout.py', 'upright', os.path.join(TYPES, 'german_werkplan_layout.json'), src, up); src = up
    img[p] = src
    run(f'probe_{p[:-4]}', 'raster_probe.py', src, W(p[:-4]))
ref = [p for p in plans if all(anchor_chains(json.load(open(os.path.join(W(p[:-4]), 'chains.json'))))[1:])]
if len(ref) != 1: stop(f"{len(ref)} plans anchor both ways (need exactly one reference)")
ref = ref[0]; other = [p for p in plans if p != ref][0]; R, O = W(ref[:-4]), W(other[:-4])
log(f"§SCAN_REF reference plan {ref} ({storey[ref][0]}), registered plan {other} ({storey[other][0]})")
run(f'walls_{ref[:-4]}', 'raster_walls.py', R); run(f'wallscan_{ref[:-4]}', 'raster_wallscan.py', R)
run(f'register_{other[:-4]}', 'raster_register.py', O, R); run(f'regwall_{other[:-4]}', 'raster_regwall.py', O, R)
OR = O.rstrip('/') + '_reg'
if not os.path.exists(os.path.join(OR, 'chains.json')): stop(f"registration of {other} wrote no {os.path.basename(OR)}/chains.json")
run(f'walls_{other[:-4]}_reg', 'raster_walls.py', OR); run(f'wallscan_{other[:-4]}_reg', 'raster_wallscan.py', OR)
for wd, tag in ((R, ref[:-4]), (OR, other[:-4] + '_reg')):
    run(f'openings_{tag}', 'raster_openings.py', wd); run(f'doors_{tag}', 'raster_doors.py', wd)

# 4. views page: probe, then the views + roof at the reference plan's scale
v = views[0]; V = W(v[:-4]); run(f'probe_{v[:-4]}', 'raster_probe.py', os.path.join(out, 'pages', v), V)
CR = json.load(open(os.path.join(R, 'chains.json')))
k = carry('plan_scale_px_per_m', CR['scale_px_per_m']['H'], f"work/{ref[:-4]}/chains.json:scale_px_per_m.H")
run('roof', 'raster_roof.py', V, k)

# 5. the main section: carried depth / pitch / outer wall / reference probe log / plan count; first SCHNITT view that PASSes
_, gh, gv = anchor_chains(CR)
depth = carry('depth_m', gv[0]['overall'], f"work/{ref[:-4]}/chains.json:GREEN V chain overall")
RF = json.load(open(os.path.join(V, 'roof.json')))
if not RF.get('pitch_text'): stop("roof.json holds no READ pitch")
pitch = carry('pitch_deg', RF['pitch_text'][0], f"work/{v[:-4]}/roof.json:pitch_text[0]")
extw = carry('ext_wall_m', max(w['thk_chain_m'] for w in json.load(open(os.path.join(R, 'walls.json')))['walls'] if w['thk_chain_m']), f"work/{ref[:-4]}/walls.json:max thk_chain_m")
plog = carry('plan_probe_log', [l for l in sorted(os.listdir(os.path.join(out, 'logs'))) if l.endswith(f'probe_{ref[:-4]}.log')][0], 'logs/')
nst = carry('storeys', len(plans), '§SCAN_CLASS plan pages')
sects = [n for n in RF['views'] if n.startswith('SCHNITT')]; main = None
for s in sects:
    run(f'section_{s.split()[-1]}', 'raster_section.py', V, s, depth, pitch, extw, os.path.join(out, 'logs', plog), nst)
    if os.path.exists(os.path.join(V, 'section_heights.json')): main = s; break
if not main: stop(f"no SCHNITT view of {sects} gave section_heights.json")
log(f"§SCAN_SECTION main={main}")

# 6. the annex on the registered (lower) plan: its ring, then its own section
run(f'annex_{other[:-4]}_reg', 'raster_annex.py', OR)
AJ = os.path.join(OR, 'annex.json'); ah = None
if os.path.exists(AJ) and json.load(open(AJ)).get('ring_closed'):
    for s in [s for s in sects if s != main]:
        run(f'annex_section_{s.split()[-1]}', 'raster_annex_section.py', V, s, OR)
        if os.path.exists(os.path.join(V, 'annex_heights.json')): ah = os.path.join(V, 'annex_heights.json'); break
log(f"§SCAN_ANNEX ring={'closed' if os.path.exists(AJ) and json.load(open(AJ)).get('ring_closed') else 'none'} heights={'yes' if ah else 'no'}")

# 6b. §47 step 1: the corner step on every plan work (a notched corner = glazing + post, §43.19); writes notch.json, which the emit reads
for w_ in (R, OR):
    run(f'notch_{os.path.basename(w_)}', 'raster_notch.py', w_)
    log(f"§SCAN_NOTCH work={os.path.basename(w_)} notch.json={'yes' if os.path.exists(os.path.join(w_, 'notch.json')) else 'no'}")
    run(f'brh_{os.path.basename(w_)}', 'raster_brh.py', w_)   # §54.2 the printed sill heights (brh.json, read by the emit)
    run(f'fixtures_{os.path.basename(w_)}', 'raster_fixtures.py', w_)   # §52.5 the sanitary symbols this plan draws (fixtures.json, read by the emit)
    log(f"§SCAN_FIXTURES work={os.path.basename(w_)} fixtures.json={'yes' if os.path.exists(os.path.join(w_, 'fixtures.json')) else 'no'}")
    run(f'prewall_{os.path.basename(w_)}', 'raster_prewall.py', w_)   # §55.1 the WC pre-walls drawn behind the WCs just read (prewalls.json, read by the emit)

# 6c. §50 the expectation checklist: facts from what was READ (storeys, section levels + build-ups), a drawing's own dictionary bound by the PDF's sha256
import hashlib
low_w, up_w = (OR, R) if ORDER[storey[ref][0]] > ORDER[storey[other][0]] else (R, OR)
SHJ = json.load(open(os.path.join(V, 'section_heights.json'))); bu = {d_['storey']: d_['buildup_mm'] for d_ in SHJ.get('doors', [])}
names = sorted([storey[ref][0], storey[other][0]], key=lambda n_: ORDER[n_])
sha = hashlib.sha256(open(pdf, 'rb').read()).hexdigest()
facts = dict(pdf_sha256=sha, storeys=[dict(name=n_, level_mm=SHJ['levels'][i], buildup_mm=bu.get(i + 1, 0)) for i, n_ in enumerate(names)],
             section_px_mm=round(1000 / SHJ['k_px_per_m'], 1), plan_px_mm=round(1000 / CR['scale_px_per_m']['H'], 1))
json.dump(facts, open(os.path.join(low_w, 'facts.json'), 'w'), indent=1)
dicts = [f_ for f_ in sorted(glob.glob(os.path.join(TYPES, '*_rosetta.json'))) if json.load(open(f_)).get('applies_to_pdf_sha256') == sha]
log(f"§SCAN_EXPECT facts storeys={[(x['name'], x['level_mm'], x['buildup_mm']) for x in facts['storeys']]} dictionary={[os.path.basename(f_) for f_ in dicts] or 'none for this pdf'}")
run('expect', 'type_expect.py', os.path.join(TYPES, 'expect_common.json'), os.path.join(low_w, 'facts.json'), low_w, *(dicts[:1]))
# 6d. §51 walls from the sheets' correlation: the upper plan's walls say where to look on the lower plan, its own ink decides
run('stack', 'raster_stack.py', up_w, low_w)
# 6e. §55.2 the chimney: a hatched square + round flue at the same place on every plan (chimney.json, MEASURE ONLY: no importer chimney body yet, bim-ootb §L48)
run('chimney', 'raster_chimney.py', up_w, low_w)

# 7. emit: upper plan, roof, lower registered plan, main section [, annex heights]
run('emit', 'raster_emit.py', R if ORDER[storey[ref][0]] > ORDER[storey[other][0]] else OR, os.path.join(V, 'roof.json'), os.path.join(out, 'std'),
    OR if ORDER[storey[ref][0]] > ORDER[storey[other][0]] else R, os.path.join(V, 'section_heights.json'), *([ah] if ah else []))
log(f"§SCAN verdict=WRITTEN sheets={sorted(os.listdir(os.path.join(out, 'std')))}")
