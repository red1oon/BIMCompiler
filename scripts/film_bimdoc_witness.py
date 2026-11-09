#!/usr/bin/env python3
# ⚠ DO NOT REMOVE — W-FILM-BIMDOC (v2, committed beside scripts/film_bimdoc.js): numbers, not a viewing. Reads the recorder log + page log + TSV + narrated mp4; prints §FILMW lines and a verdict. Read the log after every run.
# usage: witness_film.py <rundir> <silent.mp4> <narrated.mp4> <tsv> <fit.log> <rows.py>
import sys, re, subprocess, json, os
run, silent, narr, tsv, fitlog, rowsf = sys.argv[1:7]
L = open(f'{run}/erp_film.log').read().split('\n'); P = open(f'{run}/erp_film.page.log').read().split('\n')
V = []
def v(name, ok, why): V.append((name, ok)); print(f'§FILMW {name} {"PASS" if ok else "FAIL"} — {why}')
def ff(*a): return subprocess.run(a, capture_output=True, text=True)
# facts
F = {}
for l in L:
    m = re.match(r'§ERP_FILM_FACT (\S+?)=(.*)$', l)
    if m: F[m.group(1)] = m.group(2)
print(f'§FILMW facts={len(F)} cuts={[l for l in L if l.startswith("§ERP_FILM_CUT")]} errors={[l for l in L if "ERP_FILM_ERROR" in l]}')
# 1 frame count
def frames(f): return int(ff('ffprobe','-v','error','-count_frames','-select_streams','v:0','-show_entries','stream=nb_read_frames','-of','csv=p=0',f).stdout.strip())
dm = re.search(r'§ERP_FILM_DONE frames=(\d+)', '\n'.join(L)); done = int(dm.group(1))
segs = [f'{run}/seg_{s}.mp4' for s in ['before','card','after','main','end']]
parts = sum(frames(s) for s in segs if os.path.exists(s)); fs, fn = frames(silent), frames(narr)
v('frames concat', fs == done == parts, f'silent={fs} recorder-DONE={done} sum-of-parts={parts}')
v('frames narrated=silent', fn == fs, f'narrated={fn} silent={fs}')
# 2 beats in order (film clock)
cue = {m.group(1): float(m.group(2)) for l in L for m in [re.match(r'§ERP_FILM_CUE id=(\S+) t=([\d.]+)', l)] if m}
order = ['before','card','after'] + [f'b{i}' for i in range(1,11)] + ['end']
seq = [cue.get(k) for k in order]; ok = all(x is not None for x in seq) and all(a < b for a, b in zip(seq, seq[1:]))
v('beats in order', ok, ' '.join(f'{k}@{c:.1f}' for k, c in zip(order, seq) if c is not None))
# 6 evidence lines in order in the page log
EV = [r'^§PROJECT-SETTYPE .*phases=[1-9]', r'^§AD-VIRTUAL tab=\d+ table=C_ProjectTask col=BIM_Deliverables rows=\d+ values=\[.*:[1-9]', r'^§ATT hash name=duplex_ground_floor', r'^§BIMDOC-OPEN id=', r'^§CRUD process committed key=bim_document .*to=(IP|CO)', r'^§BIMDOC-SUPERSEDE ', r'^§AD-VIRTUAL tab=\d+ table=C_ProjectTask col=BIM_HoursBooked rows=\d+ values=\[.*:[1-9]', r'^§AD-VIRTUAL tab=\d+ table=C_Project(Task|Phase) col=BIM_Issued rows=\d+ values=\[.*:[1-9]', r'^§ORDER-CREATEINVOICE-LINE ', r'^§BIMDOC-CHAIN .*delta=1 ']   # v2: beats 2/7/8 read the grids' computed columns (§BIMDOC-ADPASS)
last = -1; got = []
for n, r in enumerate(EV, 1):
    i = next((k for k in range(last + 1, len(P)) if re.search(r, P[k])), -1); got.append(i)
    if i >= 0: last = i
v('10 evidence lines in order', all(i >= 0 for i in got), 'line#' + ','.join(map(str, got)))
# 3 spoken numbers vs facts
W = {'zero':0,'one':1,'two':2,'three':3,'four':4,'five':5,'six':6,'seven':7,'eight':8,'nine':9,'ten':10,'eleven':11,'twelve':12,'thirteen':13,'fourteen':14,'fifteen':15,'sixteen':16,'seventeen':17,'eighteen':18,'nineteen':19,'twenty':20,'thirty':30,'forty':40,'fifty':50,'sixty':60,'seventy':70,'eighty':80,'ninety':90}
def nums(t):
    t = re.sub(r'begin(?:s|ning) c, (?:\w+, ){4}\w+', 'FPRINT', t.lower().replace('-', ' '))   # the spelled hex head is judged separately
    out = []; toks = re.findall(r"[a-z']+|[,.;:?!|]", t); i = 0
    while i < len(toks):
        w = toks[i]
        if w in W or w == 'hundred':
            val = 0; j = i; cur = 0
            while j < len(toks) and (toks[j] in W or toks[j] == 'hundred'):
                if toks[j] == 'hundred': cur = max(cur, 1) * 100
                elif toks[j] in W: cur += W[toks[j]]
                j += 1
            out.append(cur); i = j
        else: i += 1
    return out
ns = {}; exec(open(rowsf).read(), ns); ROWS = ns['ROWS']
def fv(k):
    x = F.get(k); 
    try: return float(x)
    except Exception: return x
ok_all = True; rep = []
rows = [l.split('\t') for l in open(tsv).read().split('\n') if l and not l.startswith('#')]
for r in rows:
    rid, detail = r[0], r[5]; src = [s.strip() for s in r[3].split(',') if '.' in s and not s.strip().startswith('(')]
    allowed = [fv(k) for k in src]; spoken = nums(detail)
    bad = [n for n in spoken if float(n) not in [a for a in allowed if isinstance(a, float)]]
    miss = [k for k in src if k not in F]
    unused = [k for k, a in zip(src, allowed) if isinstance(a, float) and a not in map(float, spoken)]
    rep.append(f'{rid}: spoken={spoken} facts={[(k, F.get(k)) for k in src]}')
    if bad or miss: ok_all = False; rep.append(f'   NOT SOURCED: {bad} missing facts {miss}')
    if unused: rep.append(f'   (fact value not spoken: {unused})')
for x in rep: print('§FILMW number ' + x)
# fingerprints: spoken head = the page's own sha
spoken_fp = 'c82540'
v('fingerprint spoken head = sha256 (b3 line, b4 app line)', F.get('b3.sha256','').startswith(spoken_fp) and F.get('b4.sha12.app','').startswith(spoken_fp) and F.get('b3.sha256','').startswith(F.get('b4.sha12.app','x')), f"b3={F.get('b3.sha256','')[:12]} app={F.get('b4.sha12.app')}")
# every fact that carries a § line is in the page log verbatim
miss = [k for k in F if k.endswith('.line') or '.line.' in k]
nolog = [k for k in miss if F[k] and not any(F[k].replace('op_uuid=','').split(' op_uuid')[0][:60] in p for p in P)]
v('fact lines are the page log\'s own', not nolog, f'{len(miss)} line-facts checked; not found: {nolog}')
v('every spoken number has a §ERP_FILM_FACT equal to the page line', ok_all, f'{len(rows)} rows')
# 4 silence
sd = ff('ffmpeg','-hide_banner','-i',narr,'-af','silencedetect=n=-40dB:d=2','-f','null','-')
st = re.findall(r'silence_start: ([\d.]+)', sd.stderr); du = re.findall(r'silence_duration: ([\d.]+)', sd.stderr)
gaps = [float(x) for x in du]; mx = max(gaps) if gaps else 0
v('longest silence <= ~7 s', mx <= 7.2, f'silences>=2s: {len(gaps)}; longest {mx:.2f}s; ' + ', '.join(f'{float(a):.1f}+{float(b):.1f}' for a, b in zip(st, du)))
# 5 loudness
eb = ff('ffmpeg','-hide_banner','-nostats','-i',narr,'-af','ebur128=peak=true','-f','null','-')
I = re.findall(r'I:\s+(-?[\d.]+) LUFS', eb.stderr)
v('loudness ~ -16 LUFS', bool(I) and abs(float(I[-1]) + 16) <= 1.0, f'integrated {I[-1] if I else "?"} LUFS')
# fit log
fl = open(fitlog).read(); fit = re.findall(r'-> (DETAIL(?: x[\d.]+)?|SHORT|SKIP)', fl); tone = re.findall(r'(OK|WRONG|INCONCLUSIVE) "', fl)
v('narration fit all DETAIL, 0 WRONG', all(x.startswith('DETAIL') for x in fit) and 'WRONG' not in tone, f'DETAIL={sum(x.startswith("DETAIL") for x in fit)} SHORT={fit.count("SHORT")} SKIP={fit.count("SKIP")}; tone OK={tone.count("OK")} WRONG={tone.count("WRONG")} INCONCLUSIVE={tone.count("INCONCLUSIVE")}')
cur = [l for l in L if l.startswith('§ERP_FILM_CURSOR')]; v('cursor on target', bool(cur) and 'OK' in cur[0], cur[0] if cur else 'no line')
# v2 (§BIMDOC-ADPASS): Open launched from the GEAR (the standard process list), no lens button anywhere on screen, the computed columns on screen
v('beat 4 launched from the gear', F.get('b4.via') == 'gear' and F.get('b4.process') == '9541001', f"via={F.get('b4.via')} process={F.get('b4.process')} line={F.get('b4.gear.line','')[:90]}")
v('no lens button on screen', F.get('lens.buttons.max') == '0', f"max lens buttons at any beat={F.get('lens.buttons.max')}")
cols = {k: x for k, x in F.items() if '.col.' in k}
v('computed columns on screen', bool(cols) and all(x.startswith('VISIBLE') for x in cols.values()), '; '.join(f'{k}={x[:24]}' for k, x in cols.items()))
v('register grid shows its columns', len(F.get('b2.grid.columns', '').split('|')) >= 7 and all(int(n) >= 3 for n in F.get('b2.grid.filledCells', '0').split('|') if n), f"columns={F.get('b2.grid.columns')} filled={F.get('b2.grid.filledCells')}")
print('§FILMW VERDICT ' + ('PASS' if all(o for _, o in V) else 'FAIL') + f' {sum(o for _, o in V)}/{len(V)}')
