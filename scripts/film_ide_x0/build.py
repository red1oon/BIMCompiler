#!/usr/bin/env python3
# ⚠ DO NOT REMOVE — SCOPE: assembles the film "Editing Real Code" (prompts/CODE_ARCHITECTURE_DESIGN.md §F.9 Part 2; layout =
# prompts/FILM_NARRATION.md PLAYBOOK C). Stills come from shoot.sh (real VS Code); every number on a card comes from out/shots.log.
# Steps: facts → cards → voice measure → silent picture (stills held for their speech) → fit → mux. Read out/build.log after every run.
# Usage: build.py <out.mp4>      (refuses to overwrite)
import os, re, sys, json, subprocess, shutil
H = os.path.dirname(os.path.abspath(__file__)); O = os.path.join(H, 'out'); W = os.path.join(O, 'work'); P = os.path.join(H, '..', '..', 'prompts')
PY = os.path.expanduser('~/.local/share/film_narration/venv/bin/python')
LANG = os.environ.get('FILM_LANG', 'en')        # en (Kokoro, local) | zh (Mandarin: Edge voices, per prompts/FILM_NARRATION.md PLAYBOOK C)
FPS = 24; BG = '#0f172a'; CARD_BG = '#0b0f17'; CORAL = '#FF6B78'; OFF = '#F3EEE8'; SKY = '#7dd3fc'
FONT, FONTB = ('Noto-Sans-CJK-SC', 'Noto-Sans-CJK-SC-Bold') if LANG == 'zh' else ('DejaVu-Sans', 'DejaVu-Sans-Bold')
# Every on-screen text of the cards, per language. The editor's own screens stay as the product shows them.
TXT = {
 'en': dict(open_line='BIM-ERP is Open Source, for anyone to work on 2D thru to 7D on single platform',      # the owner's words, verbatim
   chapter='CHAPTER %d', title=('Editing', 'Real Code'), ch=[('It never', 'guesses'), ('What does this', 'tag mean?'), ('It stays current', 'by itself'), ('Which code', 'made this log?'), ('Run it. Check it.', 'Ship it.')],
   idea_h='One object, two names', idea=[('The code writes it as', 'A.db = …\n(a short name)'), ('and reads it as', 'APP.db\n(a long name)'), ('So a search for', '"APP.db ="\nmisses the real line'),
     ("The project's script writes an index", '%s fields, each with the line that sets it'), ('The editor add-on only reads it', 'no knowledge of its own, so it cannot drift')],
   idea_f='%s of the %s fields are written only under the short name',
   lim_h='What it does not do yet', lim=[('Run & Ship', 'it does not commit, open a pull request, merge or deploy for you; no browser step'), ('Cost if deployed', 'raw bytes only: not minified, no budget, no memory estimate'),
     ('Values beside the code', 'only logs that name their code; few lines light up until more are saved')], lim_f='First versions. Proven in one editor version, on Linux: VS Code %s',
   close1='No AI inside   ·   No dependencies   ·   Network only when you press Fetch back', close2='Install it in two commands. The steps are in the Developer Guide, section 4.1:',
   close3='source:  github.com/red1oon/bim-ootb   ·   devtools/vscode/x0-navigator', close4='Every screen is the real editor, recorded as shipped. Every number comes from its own log.'),
 'zh': dict(open_line='BIM-ERP 是开源的，任何人都能在同一个平台上完成从 2D 到 7D 的工作',
   chapter='第 %d 章', title=('编辑', '真实代码'), ch=[('它从不', '猜测'), ('这个标记', '是什么意思？'), ('它自己', '保持最新'), ('这份日志', '出自哪份代码？'), ('运行。检查。', '发布。')],
   idea_h='一个对象，两个名字', idea=[('代码写入时用', 'A.db = …\n（短名字）'), ('读取时用', 'APP.db\n（长名字）'), ('所以搜索', '“APP.db =”\n找不到真正的那一行'),
     ('项目自己的脚本生成一份索引', '%s 个字段，每个都带有赋值所在的行'), ('编辑器插件只读取它', '它自己不存任何知识，所以不会走样')],
   idea_f='其中 %s 个字段（共 %s 个）只用短名字写入',
   lim_h='它现在还不能做的事', lim=[('运行与发布（Run & Ship）', '不会替你提交、发起合并请求、合并或部署；没有浏览器步骤'), ('部署代价（Cost if deployed）', '只统计原始字节：未压缩，没有预算，没有内存估算'),
     ('代码旁的值', '只认写明了代码版本的日志；日志存得多了，才会亮起更多行')], lim_f='第一版。已在一个编辑器版本、Linux 上验证：VS Code %s',
   close1='内部没有 AI   ·   没有依赖   ·   只在你按下 Fetch back（取回核对）时联网', close2='两条命令即可安装。步骤见开发者指南第 4.1 节：',
   close3='源码： github.com/red1oon/bim-ootb   ·   devtools/vscode/x0-navigator', close4='每个画面都是真实的编辑器，按发布状态录制。每个数字都来自它自己的日志。'),
}[LANG]
os.makedirs(W, exist_ok=True)
LOG = open(os.path.join(O, 'build.log'), 'w')
def log(s):
    print(s, flush=True); LOG.write(s + '\n'); LOG.flush()
def run(cmd, **kw):
    r = subprocess.run(cmd, capture_output=True, text=True, **kw)
    if r.returncode != 0: log('§FILM_BUILD_FAIL ' + ' '.join(map(str, cmd))[:200] + ' :: ' + r.stderr[-400:]); sys.exit(1)
    return r

# ── 1. facts: only from the shoot's own log ──
shots = {}
for l in open(os.path.join(O, 'shots.log')):
    m = re.match(r'§FILM_SHOT name=(\S+) ', l)
    if m: shots[m.group(1)] = l.strip()
    if l.startswith('§FILM_X0'): x0 = l.strip()
def num(pat, s):
    m = re.search(pat, s)
    if not m: log('§FILM_FACT_MISSING ' + pat); sys.exit(1)
    return m.group(1)
F = {
 'fields': int(num(r'fields=(\d+)', x0)), 'alias_only': int(num(r'alias_only=(\d+)', x0)), 'phantom': int(num(r'phantom=(\d+)', x0)),
 'vscode': num(r'vscode=(\S+)', x0), 'builtin_defs': int(num(r'builtin_defs=(\d+)', shots['b2_f12_nothing'])),
 'search_lines': int(num(r'lines_counted_by_node=(\d+)', shots['b3_search_tests_only'])),
 'search_files': shots['b3_search_tests_only'].count('.js"') , 'search_all_tests': 'all_in_tests=true' in shots['b3_search_tests_only'],
 'def_line': int(num(r'written at \[viewer/city\.js:(\d+)\]', shots['a1_hover'])), 'writes': int(num(r'· (\d+) writes', shots['a1_hover'])),
 'reads': int(num(r'· (\d+) reads', shots['a1_hover'])), 'jump_line': int(num(r'file="viewer/city.js" line=(\d+)', shots['a2_jumped'])),
 'new_line': int(num(r'written at \[viewer/city\.js:(\d+)\]', shots['e3_knows_new_line'])),
 'stale_seen': 'index stale' in shots['e2_right_after_save'], 'catch_up_s': float(num(r'seconds_after_first_ask=([\d.]+)', shots['e3_knows_new_line'])),
 'phantom_seen': 'PHANTOM' in shots['p1_phantom'], 'unknown_silent': not re.search(r'written at|PHANTOM|index stale', shots['u1_unknown']),
 'fake_tag': 'no spec found' in shots['t2_fake_tag'], 'stamp_dirty_file': 'dirty_files=viewer/city.js' in shots['l1_log_stamp'],
 'check_pass': 'SHIP_CHECK verdict=PASS steps=3' in shots['r1_check'], 'status_kb': int(num(r'viewer: start-up · (\d+) KB', shots['r2_cost'])),
 'cost_apps': int(num(r'apps=(\d+)', shots['r2_cost'])), 'lens_shown': int(num(r'lenses=(\d+)', shots['r3_lens'])) == 1 and 'gen_app_surface.log @' in shots['r3_lens'],
 'intro_folders': int(num(r'folders=(\d+)', shots['i1_explorer'])),
}
log('§FILM_FACTS ' + json.dumps(F))
# The voice says these in words; each is checked against the measured fact, so a reshoot that changes a number FAILS here, not on screen.
SAID = {'search_lines': 9, 'search_files': 2, 'def_line': 717, 'jump_line': 717, 'writes': 14, 'reads': 704, 'phantom': 282, 'new_line': 718, 'builtin_defs': 0, 'status_kb': 234}
bad = [k for k, v in SAID.items() if F[k] != v]
flags = [k for k in ('search_all_tests', 'stale_seen', 'phantom_seen', 'unknown_silent', 'fake_tag', 'stamp_dirty_file', 'check_pass', 'lens_shown') if not F[k]]
if not (1300 <= F['alias_only'] < 1400): bad.append('alias_only (voice: "more than thirteen hundred")')
if not (1.0 <= F['catch_up_s'] <= 9.0): bad.append('catch_up_s (voice: "a few seconds")')
log('§FILM_GUARD spoken_numbers=%d mismatches=%s false_flags=%s verdict=%s' % (len(SAID) + 2, bad, flags, 'PASS' if not bad and not flags else 'FAIL'))
if bad or flags: sys.exit(1)

# ── 2. pictures ──
def conv(args, out): run(['convert'] + args + [out]); return out
CROP_Y = {'t1_tag': 60, 'l1_log_stamp': 24, 'b3_search_tests_only': 24, 'u1_unknown': 24, 't2_fake_tag': 24, 'i1_explorer': 24, 'r1_check': 260, 'r2_cost': 260}   # default: the band around the cursor line
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
def box(x, y, w, h, title, body):
    return ['-fill', '#16223b', '-stroke', SKY, '-strokewidth', '3', '-draw', 'roundrectangle %d,%d %d,%d 18,18' % (x, y, x + w, y + h), '-stroke', 'none',
            '-font', FONTB, '-pointsize', '34', '-fill', SKY, '-annotate', '+%d+%d' % (x + 28, y + 60), title,
            '-font', FONT, '-pointsize', '30', '-fill', OFF, '-annotate', '+%d+%d' % (x + 28, y + (98 if LANG == 'zh' else 108)), body]
def arrow(x, y): return ['-font', FONTB, '-pointsize', '70', '-fill', CORAL, '-annotate', '+%d+%d' % (x, y), '→']
def card_idea():
    I = TXT['idea']
    a = ['-size', '1920x1080', 'xc:' + BG, '-gravity', 'northwest', '-font', FONTB, '-pointsize', '46', '-fill', SKY, '-annotate', '+120+110', TXT['idea_h']]
    a += box(120, 230, 480, 250, I[0][0], I[0][1]) + arrow(625, 320)
    a += box(720, 230, 480, 250, I[1][0], I[1][1]) + arrow(1225, 320)
    a += box(1320, 230, 480, 250, I[2][0], I[2][1])
    a += box(120, 540, 780, 190, I[3][0], I[3][1] % format(F['fields'], ','))
    a += arrow(925, 600) + box(1020, 540, 780, 190, I[4][0], I[4][1])
    a += ['-font', FONT, '-pointsize', '30', '-fill', '#94a3b8', '-annotate', '+120+775', TXT['idea_f'] % (format(F['alias_only'], ','), format(F['fields'], ','))]
    return conv(a, os.path.join(W, 'c_idea.png'))
def card_limits():
    a = ['-size', '1920x1080', 'xc:' + BG, '-gravity', 'northwest', '-font', FONTB, '-pointsize', '46', '-fill', CORAL, '-annotate', '+120+110', TXT['lim_h']]
    y = 220
    for t, b in TXT['lim']: a += box(120, y, 1680, 160, t, b); y += 185
    a += ['-font', FONT, '-pointsize', '30', '-fill', '#94a3b8', '-annotate', '+120+790', TXT['lim_f'] % F['vscode']]
    return conv(a, os.path.join(W, 'c_limits.png'))
def card_close():
    a = ['-size', '1920x1080', 'xc:' + CARD_BG, '-gravity', 'north', '-font', FONTB, '-pointsize', '84', '-fill', OFF, '-annotate', '+0+110', TXT['title'][0], '-fill', CORAL, '-annotate', '+0+215', TXT['title'][1],
         '-pointsize', '36', '-fill', OFF, '-annotate', '+0+365', TXT['close1'],
         '-font', FONT, '-pointsize', '36', '-fill', OFF, '-annotate', '+0+460', TXT['close2'],
         '-font', FONTB, '-pointsize', '40', '-fill', SKY, '-annotate', '+0+525', 'red1oon.github.io/BIMCompiler/DeveloperGuide',
         '-font', FONT, '-pointsize', '32', '-fill', SKY, '-annotate', '+0+610', TXT['close3'],
         '-fill', '#94a3b8', '-pointsize', '28', '-annotate', '+0+700', TXT['close4']]
    return conv(a, os.path.join(W, 'c_close.png'))

CH = lambda n: chapter('ch%d' % n, TXT['chapter'] % n, TXT['ch'][n - 1][0], TXT['ch'][n - 1][1], '')
SEGS = [   # (kind, key, [(picture, (turn, plus seconds))])   a beat's picture changes when that spoken turn starts (measured), never by guess
 ('card', 'open', [(chapter('open', TXT['chapter'] % 0, TXT['title'][0], TXT['title'][1], TXT['open_line']), 1)]),
 ('beat', 'intro', [(still('i1_explorer'), (0, 0))]),
 ('beat', 'before', [(still('b1_line'), (0, 0)), (still('b2_f12_nothing'), (1, 1.0)), (still('b3_search_tests_only'), (2, 0))]),
 ('beat', 'idea', [(card_idea(), (0, 0))]),
 ('beat', 'after', [(still('a1_hover'), (0, 0)), (still('a2_jumped'), (3, 0))]),
 ('card', 'ch_guess', [(CH(1), 1)]),
 ('beat', 'guess', [(still('p1_phantom'), (0, 0)), (still('u1_unknown'), (2, 0))]),
 ('card', 'ch_tag', [(CH(2), 1)]),
 ('beat', 'tag', [(still('t1_tag'), (0, 0)), (still('t2_fake_tag'), (2, 0))]),
 ('card', 'ch_fresh', [(CH(3), 1)]),
 ('beat', 'fresh', [(still('e0_write_before'), (0, 0)), (still('e1_write_moved'), (0, 1.1)), (still('e2_right_after_save'), (1, 0)), (still('e3_knows_new_line'), (3, 1.0))]),
 ('card', 'ch_stamp', [(CH(4), 1)]),
 ('beat', 'stamp', [(still('l1_log_stamp'), (0, 0))]),
 ('card', 'ch_ship', [(CH(5), 1)]),
 ('beat', 'ship', [(still('r1_check'), (0, 0)), (still('r2_cost'), (2, 0)), (still('r3_lens'), (4, 0))]),
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
