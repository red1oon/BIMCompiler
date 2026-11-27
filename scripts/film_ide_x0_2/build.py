#!/usr/bin/env python3
# ⚠ DO NOT REMOVE — SCOPE: assembles the film "Editing Real Code 2" (prompts/CODE_ARCHITECTURE_DESIGN.md §F.18; layout =
# prompts/FILM_NARRATION.md PLAYBOOK C). Stills come from shoot.sh (real VS Code, two commits); every number on a card or in the
# voice comes from out/shots.log and is checked here (§FILM_GUARD) before a frame is drawn. Sections 3 and 4 (measure, fit, mux)
# are the first film's, unchanged. Read out/build.log after every run.
# Usage: build.py <out.mp4>      (refuses to overwrite)
import os, re, sys, json, subprocess, shutil, textwrap
H = os.path.dirname(os.path.abspath(__file__)); O = os.path.join(H, 'out'); W = os.path.join(O, 'work'); P = os.path.join(H, '..', '..', 'prompts')
PY = os.path.expanduser('~/.local/share/film_narration/venv/bin/python')
LANG = os.environ.get('FILM_LANG', 'en')
FPS = 24; BG = '#0f172a'; CARD_BG = '#0b0f17'; CORAL = '#FF6B78'; OFF = '#F3EEE8'; SKY = '#7dd3fc'; GREY = '#94a3b8'
FONT, FONTB, MONO = 'DejaVu-Sans', 'DejaVu-Sans-Bold', 'DejaVu-Sans-Mono'
if len(sys.argv) < 2: print('usage: build.py <out.mp4>'); sys.exit(1)
if os.path.exists(sys.argv[1]): print('refusing to overwrite ' + sys.argv[1]); sys.exit(1)
os.makedirs(W, exist_ok=True)
LOG = open(os.path.join(O, 'build.log'), 'w')
def log(s):
    print(s, flush=True); LOG.write(s + '\n'); LOG.flush()
def run(cmd, **kw):
    r = subprocess.run(cmd, capture_output=True, text=True, **kw)
    if r.returncode != 0: log('§FILM_BUILD_FAIL ' + ' '.join(map(str, cmd))[:200] + ' :: ' + r.stderr[-400:]); sys.exit(1)
    return r

# ── 1. facts: only from the shoot's own log ──
shots = {}; x0 = {}; plan = None; mcp = ''
for l in open(os.path.join(O, 'shots.log')):
    m = re.match(r'§FILM_SHOT name=(\S+) ', l)
    if m: shots[m.group(1)] = l.strip()
    m = re.match(r'§FILM_X0 mode=(\S+) ', l)
    if m: x0[m.group(1)] = l.strip()
    if l.startswith('§FILM_PLAN commits'): plan = json.loads(l[l.index('{'):]); commits = re.search(r'old=(\S+) new=(\S+)', l).groups()
    if l.startswith('§FILM_MCP'): mcp = l.strip()
    if l.startswith('§FILM_ERROR'): print(l); sys.exit(1)
def num(pat, s):
    m = re.search(pat, s)
    if not m: log('§FILM_FACT_MISSING ' + pat); sys.exit(1)
    return m.group(1)
def jstr(key, s): return json.loads(num(r' ' + key + r'=("(?:[^"\\]|\\.)*")', s))
C = plan['counts']; dead = plan['dead']['field']; unsure = plan['unsure']['field']
F = {
 'old_phantom': int(num(r'phantom=(\d+)', x0['old'])), 'new_phantom': int(num(r'phantom=(\d+)', x0['new'])), 'untied': int(num(r'untied=(\d+)', x0['new'])),
 'revived': C['revived'], 'plan_old_phantom': C['old_phantom'], 'plan_new_phantom': C['new_phantom'], 'plan_untied': C['untied'],
 'vscode': num(r'vscode=(\S+)', x0['new']), 'dead': dead, 'unsure': unsure,
 'said_dead': ('**APP.%s** PHANTOM — read, never written' % dead) in shots['o1_said_dead'],
 'alive': ('written at [%s:%d]' % (plan['deadNow']['file'], plan['deadNow']['line'])) in shots['n1_alive'],
 'jumped': ('file="%s" line=%d ' % (plan['deadNow']['file'], plan['deadNow']['line'])) in shots['n2_jumped'] and ('.%s =' % dead) in shots['n2_jumped'],
 'not_sure': 'PHANTOM? — no writer the index can tie' in shots['q1_not_sure'] and ('%s:%d' % (plan['unsureSite']['file'], plan['unsureSite']['line'])) in shots['q1_not_sure'],
 'the_line': ('.%s =' % unsure) in shots['q2_the_line'],
 'ctx_fields': int(num(r' fields=(\d+)', shots['c1_context'])), 'ctx_tags': int(num(r' tags=(\d+)', shots['c1_context'])),
 'ctx_copied': 'copied=true' in shots['c1_context'] and 'beside=1' in shots['c1_context'],
 'v1': jstr('last', shots['v1_no_log']), 'v2': jstr('last', shots['v2_value']), 'v3': jstr('last', shots['v3_edited']),
 'tools': int(num(r' tools=(\d+)', mcp)), 'a1': jstr('a1', mcp), 'a2': jstr('a2', mcp),
}
F['v_ok'] = F['v1'] == 'last value not shown: no stamped log found' and F['v2'].startswith('last value: `§APP_SURFACE ') and ('phantom=%d untied=%d' % (F['new_phantom'], F['untied'])) in F['v2'] and F['v3'] == 'last value not shown: file changed since the log'
F['mcp_ok'] = (' is written at %s:%d' % (plan['deadNow']['file'], plan['deadNow']['line'])) in F['a1'] and 'PHANTOM?' in F['a2']
F['plan_agrees'] = F['old_phantom'] == C['old_phantom'] and F['new_phantom'] == C['new_phantom'] and F['untied'] == C['untied']
log('§FILM_FACTS commits=%s..%s ' % commits + json.dumps(F))
# The voice says these in words; each is checked against the measured fact, so a reshoot that changes a number FAILS here, not on screen.
SAID = {'old_phantom': 281, 'revived': 130, 'new_phantom': 171, 'untied': 11, 'tools': 7}
bad = [k for k, v in SAID.items() if F[k] != v]
flags = [k for k in ('said_dead', 'alive', 'jumped', 'not_sure', 'the_line', 'ctx_copied', 'v_ok', 'mcp_ok', 'plan_agrees') if not F[k]]
log('§FILM_GUARD spoken_numbers=%d mismatches=%s false_flags=%s verdict=%s' % (len(SAID), bad, flags, 'PASS' if not bad and not flags else 'FAIL'))
if bad or flags: sys.exit(1)

# ── 2. pictures ──
def conv(args, out): run(['convert'] + args + [out]); return out
CROP_Y = {'c1_context': 24, 'v1_no_log': 60, 'v2_value': 60, 'v3_edited': 60}   # default: the band around the cursor line
def still(name):   # the real editor window: a 1440x640 band of it, enlarged to fill the top 850 px; the bottom 230 px stay empty for captions
    src = os.path.join(O, 'stills', name + '.png')
    return conv(['-size', '1920x1080', 'xc:' + BG, '(', src, '-crop', '1440x640+0+%d' % CROP_Y.get(name, 142), '+repage', '-resize', '1912x850', ')',
                 '-gravity', 'northwest', '-geometry', '+4+0', '-composite'], os.path.join(W, 'f_' + name + '.png'))
def chapter(key, kicker, t1, t2, line, size=120):
    a = ['-size', '1920x1080', 'xc:' + CARD_BG, '-gravity', 'center']
    if kicker: a += ['-font', FONTB, '-pointsize', '34', '-fill', CORAL, '-annotate', '+0-190', kicker]
    a += ['-font', FONTB, '-pointsize', str(size), '-fill', OFF, '-annotate', '+0-70' if t2 else '+0-20', t1]
    if t2: a += ['-fill', CORAL, '-annotate', '+0+70', t2]
    if line: a += ['-font', FONT, '-pointsize', '40', '-fill', OFF, '-annotate', '+0+' + ('190' if t2 else '120'), line]
    return conv(a, os.path.join(W, 'c_' + key + '.png'))
def box(x, y, w, h, title, body, mono=False):
    return ['-fill', '#16223b', '-stroke', SKY, '-strokewidth', '3', '-draw', 'roundrectangle %d,%d %d,%d 18,18' % (x, y, x + w, y + h), '-stroke', 'none',
            '-font', FONTB, '-pointsize', '34', '-fill', SKY, '-annotate', '+%d+%d' % (x + 28, y + 60), title,
            '-font', MONO if mono else FONT, '-pointsize', '29' if mono else '30', '-fill', OFF, '-annotate', '+%d+%d' % (x + 28, y + 108), body]
def arrow(x, y): return ['-font', FONTB, '-pointsize', '70', '-fill', CORAL, '-annotate', '+%d+%d' % (x, y), '→']
def card_why():
    a = ['-size', '1920x1080', 'xc:' + BG, '-gravity', 'northwest', '-font', FONTB, '-pointsize', '46', '-fill', SKY, '-annotate', '+120+110', 'How a lookup came to be wrong']
    a += box(120, 230, 520, 250, 'The index knew this', 'function setupPanel(A) {\n  A.field = …\n}', True) + arrow(660, 320)
    a += box(760, 230, 520, 250, 'Files cut into parts', 'function* part(NF, A, nav) {\n  A.field = …\n}', True) + arrow(1300, 320)
    a += box(1400, 230, 400, 250, 'Same object,', 'a form the index\ndid not read')
    a += box(120, 540, 1680, 190, 'So what those parts write was invisible', 'The field was read in one file, written in another, and reported as "read, never written".')
    a += ['-font', FONT, '-pointsize', '30', '-fill', GREY, '-annotate', '+120+775',
          '%d fields were reported as never written.  %d of them are written.  %d remain today.' % (F['old_phantom'], F['revived'], F['new_phantom'])]
    return conv(a, os.path.join(W, 'c_why.png'))
def wrap(s, n): return '\n'.join(textwrap.wrap(s, n))
def card_facts():
    a = ['-size', '1920x1080', 'xc:' + BG, '-gravity', 'northwest', '-font', FONTB, '-pointsize', '46', '-fill', SKY, '-annotate', '+120+110', 'An assistant may ask the same index']
    a += box(120, 200, 1680, 250, 'asked:  where_is_field_set  "%s"' % F['dead'], wrap(F['a1'].split(' Source:')[0], 90), True)
    a += box(120, 480, 1680, 250, 'asked:  where_is_field_set  "%s"' % F['unsure'], wrap(F['a2'], 90), True)
    a += ['-font', FONT, '-pointsize', '30', '-fill', GREY, '-annotate', '+120+770', 'The real local server, asked over its real protocol.',
          '-annotate', '+120+812', '%d questions it can answer  ·  read-only  ·  no network  ·  it calls no model' % F['tools']]
    return conv(a, os.path.join(W, 'c_facts.png'))
def card_limits():
    a = ['-size', '1920x1080', 'xc:' + BG, '-gravity', 'northwest', '-font', FONTB, '-pointsize', '46', '-fill', CORAL, '-annotate', '+120+110', 'What it does not do yet']
    y = 220
    for t, b in [('%d fields it cannot decide' % F['untied'], 'it names the line to read; tying them properly needs the parser, not a text pattern'),
                 ('Values beside the code', 'only from logs that carry a stamp; few exist yet, so most lines still say why there is none'),
                 ('Context for a file', 'no owner and no "which test proves this" yet: those indexes are not built')]:
        a += box(120, y, 1680, 160, t, b); y += 185
    a += ['-font', FONT, '-pointsize', '30', '-fill', GREY, '-annotate', '+120+790', 'Proven in one editor version, on Linux: VS Code %s' % F['vscode']]
    return conv(a, os.path.join(W, 'c_limits.png'))
def card_close():
    a = ['-size', '1920x1080', 'xc:' + CARD_BG, '-gravity', 'north', '-font', FONTB, '-pointsize', '84', '-fill', OFF, '-annotate', '+0+110', 'Editing Real Code', '-fill', CORAL, '-annotate', '+0+215', 'part 2',
         '-pointsize', '36', '-fill', OFF, '-annotate', '+0+365', 'Right  ·  Not sure, read this line  ·  Nothing sets it',
         '-font', FONT, '-pointsize', '36', '-fill', OFF, '-annotate', '+0+460', 'No AI inside. The steps are in the Developer Guide, section 4.1:',
         '-font', FONTB, '-pointsize', '40', '-fill', SKY, '-annotate', '+0+525', 'red1oon.github.io/BIMCompiler/DeveloperGuide',
         '-font', FONT, '-pointsize', '32', '-fill', SKY, '-annotate', '+0+610', 'source:  github.com/red1oon/bim-ootb   ·   devtools/',
         '-fill', GREY, '-pointsize', '28', '-annotate', '+0+700', 'Every screen is the real editor, recorded as shipped. Every number comes from its own log.']
    return conv(a, os.path.join(W, 'c_close.png'))

CHT = [('Not sure', 'is an answer'), ('One file,', 'one page'), ('Why is there', 'no value?'), ('The assistant gets', 'the same facts')]
CH = lambda n: chapter('ch%d' % n, 'CHAPTER %d' % n, CHT[n - 1][0], CHT[n - 1][1], '')
SEGS = [   # (kind, key, [(picture, (turn, plus seconds))])   a beat's picture changes when that spoken turn starts (measured), never by guess
 ('card', 'open', [(chapter('open', 'EDITING REAL CODE  ·  PART 2', 'It said dead.', 'It was alive.', 'A tool that says when it is not sure'), 1)]),
 ('beat', 'dead', [(still('o1_said_dead'), (0, 0))]),
 ('beat', 'why', [(card_why(), (0, 0))]),
 ('beat', 'alive', [(still('n1_alive'), (0, 0)), (still('n2_jumped'), (1, 2.6))]),
 ('card', 'ch_unsure', [(CH(1), 1)]),
 ('beat', 'unsure', [(still('q1_not_sure'), (0, 0)), (still('q2_the_line'), (3, 0))]),
 ('card', 'ch_context', [(CH(2), 1)]),
 ('beat', 'context', [(still('c1_context'), (0, 0))]),
 ('card', 'ch_value', [(CH(3), 1)]),
 ('beat', 'value', [(still('v1_no_log'), (0, 0)), (still('v2_value'), (3, 0)), (still('v3_edited'), (5, 0))]),
 ('card', 'ch_facts', [(CH(4), 1)]),
 ('beat', 'facts', [(card_facts(), (0, 0))]),
 ('beat', 'limits', [(card_limits(), (0, 0))]),
 ('beat', 'close', [(card_close(), (0, 0))]),
]
CARD_S = {'open': 5.0}; CARD_DEF = 3.6; TAIL = 1.4; CLOSE_TAIL = 3.5

# ── 3. measure each beat's speech (a fit with unlimited room), then set the picture to it ──
rows = [l.rstrip('\n').split('\t') for l in open(os.path.join(H, 'narration_%s.tsv.src' % LANG)) if l.strip()]
shutil.copy(os.path.join(P, 'film_narration_ass_head.txt'), os.path.join(W, 'ass_head.txt'))
def fit(tsv_rows, tag, film_sec):
    open(os.path.join(W, tag + '.tsv'), 'w').write(''.join('\t'.join(r) + '\n' for r in tsv_rows))
    cmd = [PY, os.path.join(P, 'film_narration_fit_kokoro_v3.py'), tag + '.tsv', tag, '1.15'] if LANG == 'en' else [PY, os.path.join(P, 'film_narration_fit_edge.py'), tag + '.tsv', tag, LANG]
    r = subprocess.run(cmd, cwd=W, capture_output=True, text=True,
                       env=dict(os.environ, FILM_SEC=str(film_sec)))
    open(os.path.join(W, tag + '_fit.log'), 'w').write(r.stdout + r.stderr)
    if r.returncode != 0: log('§FILM_BUILD_FAIL fit ' + r.stderr[-500:]); sys.exit(1)
    return r.stdout
out = fit([[r[0], '%.3f' % (i * 100), '%.3f' % (i * 100 + 99), r[1], r[2], r[3]] for i, r in enumerate(rows)], 'm', len(rows) * 100)
dur = {m.group(1): float(m.group(2)) for m in re.finditer(r'§NARR_FIT (\S+) cue=\S+ room=\S+ dur=([\d.]+) -> DETAIL', out)}
if len(dur) != len(rows): log('§FILM_BUILD_FAIL measure: %d of %d beats voiced' % (len(dur), len(rows))); sys.exit(1)
# when each spoken turn starts inside its beat (seconds from the beat's cue), read from the measure pass's caption file
def secs(x): h, m, s_ = x.split(':'); return int(h) * 3600 + int(m) * 60 + float(s_)
turns = {r[0]: [] for r in rows}; order = [r[0] for r in rows]
for l in open(os.path.join(W, 'm.ass')):
    if not l.startswith('Dialogue:') or ',Credit,' in l: continue
    st = secs(l.split(',')[1]); k = order[int(st // 100)]; turns[k].append(st - (st // 100) * 100)

fr = lambda s: max(1, round(s * FPS))
clips = []; cues = {}; t = 0; plan = []
for kind, key, pics in SEGS:
    total = fr(CARD_S.get(key, CARD_DEF)) if kind == 'card' else fr(dur[key] + 0.5 + (CLOSE_TAIL if key == 'close' else TAIL))
    if kind == 'beat': cues[key] = (t / FPS + 0.5, (t + total) / FPS)
    if kind == 'card':
        clips.append((pics[0][0], total, True, True, True)); plan.append('%s frames=%d' % (key, total))
    else:
        starts = [0] + [fr(0.5 + turns[key][tn] + plus - 0.15) for _, (tn, plus) in pics[1:]] + [total]
        if any(b <= a for a, b in zip(starts, starts[1:])): log('§FILM_BUILD_FAIL picture order in beat ' + key + ' ' + str(starts)); sys.exit(1)
        for j, (pic, _) in enumerate(pics):
            n = starts[j + 1] - starts[j]
            clips.append((pic, n, False, j == 0, j == len(pics) - 1)); plan.append('%s/%s at=%.2fs frames=%d' % (key, os.path.basename(pic)[2:-4], (t + starts[j]) / FPS, n))
    t += total
TOTAL = t
log('§FILM_PLAN segments=%d frames=%d seconds=%.2f :: %s' % (len(clips), TOTAL, TOTAL / FPS, ' · '.join(plan)))
parts = []
for i, (pic, n, is_card, first, last) in enumerate(clips):
    d = n / FPS; vf = 'format=yuv420p'
    if is_card: vf += ',fade=t=in:st=0:d=0.4,fade=t=out:st=%.3f:d=0.4' % (d - 0.4)
    else:
        if first: vf += ',fade=t=in:st=0:d=0.3'
        if last: vf += ',fade=t=out:st=%.3f:d=0.3' % (d - 0.3)
    p = os.path.join(W, 'seg_%02d.mp4' % i)
    run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-loop', '1', '-framerate', str(FPS), '-i', pic, '-frames:v', str(n), '-vf', vf,
         '-c:v', 'libx264', '-tune', 'stillimage', '-crf', '16', '-pix_fmt', 'yuv420p', p]); parts.append(p)
open(os.path.join(W, 'concat.txt'), 'w').write(''.join("file '%s'\n" % p for p in parts))
silent = os.path.join(W, 'silent.mp4')
run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', os.path.join(W, 'concat.txt'), '-c', 'copy', silent])
got = int(run(['ffprobe', '-v', 'error', '-count_frames', '-select_streams', 'v:0', '-show_entries', 'stream=nb_read_frames', '-of', 'csv=p=0', silent]).stdout.strip())
log('§FILM_SILENT frames=%d planned=%d %s' % (got, TOTAL, 'OK' if got == TOTAL else 'MISMATCH'))
if got != TOTAL: sys.exit(1)

# ── 4. fit at the real cues, then mux ──
final = [[r[0], '%.3f' % cues[r[0]][0], '%.3f' % cues[r[0]][1], r[1], r[2], r[3]] for r in rows]
open(os.path.join(H, 'narration_%s.tsv' % LANG), 'w').write(''.join('\t'.join(r) + '\n' for r in final))
out = fit(final, LANG, TOTAL / FPS)
fits = re.findall(r'§NARR_FIT (\S+) .*?-> (\S+)', out); tones = re.findall(r'§NARR_TONE .*? (OK|WRONG|INCONCLUSIVE) ', out)
log('§FILM_FIT beats=%d detail=%d other=%s tone_ok=%d tone_wrong=%d tone_inconclusive=%d' % (len(fits), sum(1 for _, p in fits if p == 'DETAIL'),
    [f for f in fits if f[1] != 'DETAIL'], tones.count('OK'), tones.count('WRONG'), tones.count('INCONCLUSIVE')))
for l in out.split('\n'):
    if 'WRONG' in l: log('  ' + l)
if LANG == 'zh':   # PLAYBOOK C: Mandarin captions are cut into short pieces at Chinese punctuation before the mux
    r = subprocess.run([sys.executable, os.path.join(P, 'film_zh_caption_split.py'), 'zh.ass', 'zh_split.ass', '20'], cwd=W, capture_output=True, text=True)
    log(r.stdout.strip() or r.stderr[-300:]); shutil.copy(os.path.join(W, 'zh_split.ass'), os.path.join(W, 'zh.ass'))
OUT = os.path.abspath(sys.argv[1])
r = subprocess.run([sys.executable, os.path.join(P, 'film_narration_mux.py'), LANG, silent, OUT], cwd=W, capture_output=True, text=True, env=dict(os.environ, FILM_SEC='%.3f' % (TOTAL / FPS)))
log(r.stdout.strip() or r.stderr[-300:])
