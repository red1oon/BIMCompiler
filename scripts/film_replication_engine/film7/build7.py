#!/usr/bin/env python3
# ⚠ DO NOT REMOVE — film7 build (EN). READ the §FILM-MA lines/logs after every stage; exit code is not evidence. Stages: assets | measure | video | fit | mux  (verify = verify7.py).
# usage: build7.py <stage> <builddir>.  All CPU (ImageMagick, ffmpeg, Kokoro local). No GPU, no paid call, no network.
import sys, os, re, json, subprocess, math, shutil
import beats7
STAGE, B = sys.argv[1], sys.argv[2]
IMG, SEG, REC = f'{B}/img', f'{B}/seg', f'{B}/rec'
FONT, FONTB = 'DejaVu-Sans', 'DejaVu-Sans-Bold'
FPS = 25
BG_CARD, BG_COMP, CORAL, SKY, OFF = '#0b0f17', '#0f172a', '#FF6B78', '#7dd3fc', '#F3EEE8'
PROMPTS = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../../prompts'))
VENV = os.path.expanduser('~/.local/share/film_narration/venv/bin/python')
FACTS = json.load(open(f'{B}/facts7.resolved.json')) if os.path.exists(f'{B}/facts7.resolved.json') else {}
ALLOW_DIGITS = ['invoiceOpen(C_Invoice_ID, 0)']

def sh(*a, **k):
    r = subprocess.run(a, capture_output=True, text=True, **k)
    if r.returncode: sys.exit(f'FAIL {a[:3]} {r.stderr[:400]}')
    return r.stdout

# ---- numbers ----
ONES = 'zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen'.split()
TENS = 'x x twenty thirty forty fifty sixty seventy eighty ninety'.split()
def words(n):
    if n < 20: return ONES[n]
    if n < 100: return TENS[n // 10] + ('' if n % 10 == 0 else '-' + ONES[n % 10])
    if n < 1000: return ONES[n // 100] + ' hundred' + ('' if n % 100 == 0 else ' ' + words(n % 100))
    if n < 1000000: return words(n // 1000) + ' thousand' + ('' if n % 1000 == 0 else (' and ' if n % 1000 < 100 else ' ') + words(n % 1000))
    raise ValueError(n)
def spoken(fid):
    f = FACTS[fid]; v = f['value']
    if f['kind'] == 'int': return words(int(v))
    if f['kind'] == 'money':
        neg = v.startswith('-'); v = v.lstrip('-'); d, c = (v.split('.') + ['00'])[:2]; d, c = int(d), int(c.ljust(2, '0')[:2])
        if d == 0 and c == 0: return 'zero'
        s = (words(d) + (' dollar' if d == 1 else ' dollars')) if d else ''
        if c: s += (' and ' if d else '') + words(c) + (' cent' if c == 1 else ' cents')
        return ('minus ' if neg else '') + s
    raise ValueError(fid)
def shown(fid):
    f = FACTS[fid]; return f['value']
def expand(t, fn):
    return re.sub(r'\{(?:fact:)?([a-z0-9_]+)\}', lambda m: fn(m.group(1)), t)

def guard_digits(t, where):
    s = t
    for a in ALLOW_DIGITS: s = s.replace(a, '')
    if re.search(r'\d', re.sub(r'\{[^}]*\}', '', s)): sys.exit(f'§FILM-MA-GUARD typed digit in {where}: {t[:80]}')

def money_show(c):
    return f'{c/100:,.2f}'

# ---- images ----
def convert(*a): sh('convert', *a)
def label(text, out, size, color, bold=True, width=None):
    args = ['-background', 'none', '-fill', color, '-font', FONTB if bold else FONT, '-pointsize', str(size)]
    args += (['-size', f'{width}x', 'caption:' + text] if width else ['label:' + text]); convert(*args, out)
def card_base(path, bg): convert('-size', '1920x1080', f'xc:{bg}', path)
def chapter(name, d):   # plain chapter card (PLAYBOOK C): kicker coral 34, line 1 off-white 120, line 2 coral 120, one plain line 40, DejaVu, no backdrop; empty parts are skipped
    p = f'{IMG}/{name}.png'; card_base(p, BG_CARD)
    if d.get('small'):
        label(d['kicker'], f'{IMG}/_k.png', 34, CORAL); label(d['l1'] + ' ' + d['l2'], f'{IMG}/_a.png', 80, OFF); label(d['line'], f'{IMG}/_c.png', 38, OFF, False, 1500)
        convert(p, f'{IMG}/_k.png', '-gravity', 'North', '-geometry', '+0+200', '-composite', f'{IMG}/_a.png', '-gravity', 'North', '-geometry', '+0+300', '-composite', f'{IMG}/_c.png', '-gravity', 'North', '-geometry', '+0+450', '-composite', p); return p
    parts = [(d.get('kicker'), 34, CORAL, True, 230), (d.get('l1'), 120, OFF, True, 310), (d.get('l2'), 120, CORAL, True, 450), (d.get('line'), 40, OFF, False, 640)]
    for k, (t, sz, col, bold, y) in enumerate(parts):
        if not t: continue
        label(t, f'{IMG}/_p{k}.png', sz, col, bold); convert(p, f'{IMG}/_p{k}.png', '-gravity', 'North', '-geometry', f'+0+{y}', '-composite', p)
    if d.get('tag'):
        label(d['tag'], f'{IMG}/_t.png', 30, SKY); convert(p, f'{IMG}/_t.png', '-gravity', 'North', '-geometry', '+0+780', '-composite', p)
    return p
def alpha_label(p):
    label(beats7.ALPHA, f'{IMG}/_al.png', 32, CORAL); convert(p, f'{IMG}/_al.png', '-gravity', 'NorthEast', '-geometry', '+90+98', '-composite', p)
def comp_shot(name, f, lab, alpha, strip=None):
    hmax = 600 if strip else 680
    p = f'{IMG}/{name}.png'; card_base(p, BG_COMP); label(lab, f'{IMG}/_l.png', 42, SKY)
    convert(p, f'{IMG}/_l.png', '-gravity', 'NorthWest', '-geometry', '+110+100', '-composite', '(', f'{REC}/{f}', *crop_args(f), '-resize', f'1600x{hmax}', ')', '-gravity', 'North', '-geometry', '+0+165', '-composite', p)
    if strip:
        guard_digits(strip, name); h = int(sh('convert', f'{REC}/{f}', *crop_args(f), '-resize', f'1600x{hmax}', '-format', '%h', 'info:')); y = 165 + h + 28
        if y > 800: sys.exit(f'§FILM-MA-GUARD strip overflow {name} y={y}')
        label(expand(strip, shown), f'{IMG}/_st.png', 44, SKY); convert(p, f'{IMG}/_st.png', '-gravity', 'North', '-geometry', f'+0+{y}', '-composite', p)
    if alpha: alpha_label(p)
def comp_two(name, fa, la, fb, lb, alpha, strip=None):
    p = f'{IMG}/{name}.png'; card_base(p, BG_COMP)
    for k, (f, l, x) in enumerate([(fa, la, 50), (fb, lb, 970)]):
        label(l, f'{IMG}/_l{k}.png', 32, SKY); convert(p, f'{IMG}/_l{k}.png', '-gravity', 'NorthWest', '-geometry', f'+{x}+165', '-composite', '(', f'{REC}/{f}', *crop_args(f), '-resize', '900x', ')', '-gravity', 'NorthWest', '-geometry', f'+{x}+240', '-composite', p)
    if strip:
        guard_digits(strip, name); h = max(int(sh('convert', f'{REC}/{f}', *crop_args(f), '-resize', '900x', '-format', '%h', 'info:')) for f in (fa, fb)); y = 240 + h + 28
        if y > 800: sys.exit(f'§FILM-MA-GUARD strip overflow {name} y={y}')
        label(expand(strip, shown), f'{IMG}/_st.png', 44, SKY); convert(p, f'{IMG}/_st.png', '-gravity', 'North', '-geometry', f'+0+{y}', '-composite', p)
    if alpha: alpha_label(p)
def comp_card(name, lines, alpha):
    p = f'{IMG}/{name}.png'; card_base(p, BG_COMP); y = 150; parts = []
    for k, ln in enumerate(lines):
        t = expand(ln, shown); guard_digits(ln, name)
        cap = f'{IMG}/_c{k}.png'; label(t, cap, 54 if k == 0 else 42, SKY if k == 0 else OFF, k == 0, 1640); parts.append(cap)
    args = [p]
    for cap in parts:
        h = int(sh('identify', '-format', '%h', cap)); args += [cap, '-gravity', 'NorthWest', '-geometry', f'+140+{y}', '-composite']; y += h + (45 if cap == parts[0] else 38)
    if y > 860: sys.exit(f'§FILM-MA-GUARD card {name} overflows into the subtitle band: y={y}')
    convert(*args, p)
    if alpha: alpha_label(p)
def comp_books(name, lab):
    books = None
    for l in open(f'{B}/record.log'):
        m = re.match(r'§FILMREC FACT odoo_books=(\{.*?\}) src=', l)
        if m: books = json.loads(m.group(1)); break
    if books is None: sys.exit('§FILM-MA-GUARD odoo_books fact missing')
    tb = [l for l in open(f'{B}/record.log') if l.startswith('§FILMREC FACT odoo_tb_sum=')][0]
    p = f'{IMG}/{name}.png'; card_base(p, BG_COMP); label(lab, f'{IMG}/_l.png', 42, SKY); convert(p, f'{IMG}/_l.png', '-gravity', 'NorthWest', '-geometry', '+110+100', '-composite', p)
    rows = sorted(books.items(), key=lambda kv: (kv[0].endswith('CLEAR'), kv[0])); y = 190
    for acc, c in rows:
        clr = acc.endswith('CLEAR'); col = CORAL if clr else OFF
        label(('holding account ' if clr else 'account ') + acc, f'{IMG}/_r1.png', 36, col, clr); label(money_show(c), f'{IMG}/_r2.png', 36, col, clr)
        convert(p, f'{IMG}/_r1.png', '-gravity', 'NorthWest', '-geometry', f'+330+{y}', '-composite', f'{IMG}/_r2.png', '-gravity', 'NorthEast', '-geometry', f'+420+{y}', '-composite', p); y += 48
    m = re.search(r'odoo_tb_sum="(-?[\d.]+)"', tb); label('all accounts add up to ' + f'{float(m.group(1)):.2f}', f'{IMG}/_s.png', 38, SKY); convert(p, f'{IMG}/_s.png', '-gravity', 'NorthWest', '-geometry', f'+330+{y+12}', '-composite', p)
    if y + 70 > 850: sys.exit(f'§FILM-MA-GUARD books overflow y={y}')

def crop_args(f):   # crop window from the recorder's DOM rects (pane / message / problem row), never hand-picked pixels
    jp = f'{REC}/{f[:-4]}.json'
    if not os.path.exists(jp): return []
    j = json.load(open(jp))
    if 'crop' in j: return ['-crop', j['crop'], '+repage']
    pane, msg, prob = j['pane'], j.get('msg'), j.get('prob'); name = f[:-4]
    x = max(0, pane['x']); w = min(1920 - x, 1130)
    if re.search(r'(done|refused|refusal|recovered|repeat)$', name) and msg:
        y0 = max(0, msg['y'] - 110); y1 = min(1080, msg['y'] + msg['h'] + 12); w = min(1920 - x, pane['w'] + 20)
    elif 'period_gate' in name and prob:
        y0 = max(0, prob['y'] - 170); y1 = min(1080, prob['y'] + prob['h'] + 70); w = min(w, 800)
    else:
        y0 = max(0, pane['y']); y1 = min(1080, pane['y'] + (300 if 'empty' in name else 560))
    return ['-crop', f'{w}x{y1-y0}+{x}+{y0}', '+repage']

def assets():
    os.makedirs(IMG, exist_ok=True); last_limits = None
    for kind, name, d in beats7.ITEMS:
        if kind == 'card':
            if name == 'closing': d = dict(d, line='github.com/red1oon/BIMCompiler')
            chapter(name, d); continue
        im = d['image']; a = d.get('alpha', False)
        if im[0] == 'shot': comp_shot(name, im[1], im[2], a, d.get('strip'))
        elif im[0] == 'two': comp_two(name, im[1], im[2], im[3], im[4], a, d.get('strip'))
        elif im[0] == 'card': comp_card(name, im[1], a)
        elif im[0] == 'books': comp_books(name, im[1])
        elif im[0] == 'hold': shutil.copy(f'{IMG}/limits.png', f'{IMG}/{name}.png')
        for fld in ('short', 'detail'): guard_digits(d[fld], f'{name}.{fld}')
        print(f'§FILM-MA-IMG {name}.png')
    # blank guard: bottom 230 px must equal the background
    bad = 0
    for kind, name, d in beats7.ITEMS:
        if kind == 'beat':
            p = f'{IMG}/{name}.png'; bg = BG_COMP; m = float(sh('convert', p, '-crop', '1920x230+0+850', '-colorspace', 'Gray', '-format', '%[fx:maxima-minima]', 'info:'))
            if m > 0.001: bad += 1; print(f'§FILM-MA-GUARD subtitle band not empty {name} range={m}')
    print(f'§FILM-MA-BAND judged={sum(1 for k,_,_ in beats7.ITEMS if k=="beat")} nonblank={bad}')
    if bad: sys.exit(2)

def tsv(path, windows):
    with open(path, 'w') as f:
        for kind, name, d in beats7.ITEMS:
            if kind != 'beat': continue
            a, b = windows[name]
            f.write(f"{name}\t{a:.3f}\t{b:.3f}\t{d['src']}\t{expand(d['short'], spoken)}\t{expand(d['detail'], spoken)}\n")

def measure():
    W = f'{B}/fit0'; os.makedirs(W, exist_ok=True); shutil.copy(f'{PROMPTS}/film_narration_ass_head.txt', f'{W}/ass_head.txt')
    wins = {}; t = 0.0
    for kind, name, d in beats7.ITEMS:
        if kind == 'beat': wins[name] = (t, t + 90.0); t += 90.0
    tsv(f'{W}/m.tsv', wins)
    env = dict(os.environ, FILM_SEC=str(t + 10))
    out = subprocess.run([VENV, f'{PROMPTS}/film_narration_fit_kokoro_v3.py', 'm.tsv', 'm', '1.15'], cwd=W, env=env, capture_output=True, text=True)
    open(f'{B}/measure.log', 'w').write(out.stdout + out.stderr)
    dur = {}
    for l in out.stdout.split('\n'):
        m = re.match(r'§NARR_FIT (\S+) cue=\S+ room=\S+ dur=([\d.]+) -> (\S+)', l)
        if m: dur[m.group(1)] = float(m.group(2)); assert m.group(3).startswith('DETAIL'), l
    json.dump(dur, open(f'{B}/detail_dur.json', 'w'), indent=1); print('§FILM-MA-MEASURE', json.dumps(dur))

def plan_frames():
    dur = json.load(open(f'{B}/detail_dur.json')); items = []; its = beats7.ITEMS
    for i, (kind, name, d) in enumerate(its):
        if kind == 'card': items.append((name, round(d['dur'] * FPS), 'card'))
        else:
            nxt = its[i + 1][1] if i + 1 < len(its) else ''; extra = 0.15 if nxt in ('limits', 'closing', 'closing_card') else 1.6   # a beat before a designed-silent card keeps almost no tail (silence <= ~7 s)
            items.append((name, math.ceil((dur[name] + 0.3 + extra) * FPS), 'beat'))   # speech + PAD 0.3 + slack
    return items

def video():
    os.makedirs(SEG, exist_ok=True); items = plan_frames(); lst = []; t = 0; wins = {}
    for name, fr, kind in items:
        out = f'{SEG}/{name}.mp4'; dur = fr / FPS; fade = 0.4
        sh('ffmpeg', '-y', '-hide_banner', '-loglevel', 'error', '-loop', '1', '-i', f'{IMG}/{name}.png', '-vf', f'fade=t=in:st=0:d={fade},fade=t=out:st={dur-fade:.3f}:d={fade},format=yuv420p', '-frames:v', str(fr), '-r', str(FPS), '-c:v', 'libx264', '-tune', 'stillimage', '-crf', '18', '-preset', 'veryfast', out)
        lst.append(f"file '{out}'")
        if kind == 'beat': wins[name] = (t / FPS, (t + fr) / FPS)
        t += fr
    open(f'{B}/seg.txt', 'w').write('\n'.join(lst) + '\n')
    sh('ffmpeg', '-y', '-hide_banner', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', f'{B}/seg.txt', '-c', 'copy', f'{B}/silent.mp4')
    json.dump({'windows': wins, 'frames': t, 'fps': FPS}, open(f'{B}/plan_video.json', 'w'), indent=1)
    print(f'§FILM-MA-VIDEO frames_expected={t} seconds={t/FPS:.3f}')

def fit():
    P = json.load(open(f'{B}/plan_video.json')); W = f'{B}/fit1'; os.makedirs(W, exist_ok=True); shutil.copy(f'{PROMPTS}/film_narration_ass_head.txt', f'{W}/ass_head.txt')
    tsv(f'{W}/film.tsv', {k: tuple(v) for k, v in P['windows'].items()})
    env = dict(os.environ, FILM_SEC=str(P['frames'] / P['fps']))
    out = subprocess.run([VENV, f'{PROMPTS}/film_narration_fit_kokoro_v3.py', 'film.tsv', 'film', '1.15'], cwd=W, env=env, capture_output=True, text=True)
    open(f'{B}/fit.log', 'w').write(out.stdout + out.stderr)
    # house credit line names a person; this film carries no personal names: replace it
    ass = open(f'{W}/film.ass').read(); ass = re.sub(r'Voices: AI-generated \(Kokoro, local\)[^\n]*', 'Voices: synthetic (Kokoro, local)', ass); open(f'{W}/film.ass', 'w').write(ass)
    print(out.stdout[-3000:])

def mux():
    P = json.load(open(f'{B}/plan_video.json')); W = f'{B}/fit1'; outp = os.environ.get('FILM_OUT', f'{B}/Migrating_Legacy_Accounting_EN.mp4')
    env = dict(os.environ, FILM_SEC=str(P['frames'] / P['fps']))
    r = subprocess.run(['python3', f'{PROMPTS}/film_narration_mux.py', 'film', f'{B}/silent.mp4', outp], cwd=W, env=env, capture_output=True, text=True)
    open(f'{B}/mux.log', 'w').write(r.stdout + r.stderr); print(r.stdout[-800:], r.stderr[-800:])

if __name__ == '__main__': {'assets': assets, 'measure': measure, 'video': video, 'fit': fit, 'mux': mux}[STAGE]()
