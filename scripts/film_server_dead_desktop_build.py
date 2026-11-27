#!/usr/bin/env python3
# ⚠ DO NOT REMOVE — Scope: SILENT-FILM BUILDER for "The Server is Dead — ERP, desktop setup" (prompts/TEAMWORK_FRAMEWORK.md §14.6).
#   Read the printed §FILM_* lines after every run; exit code is not evidence. Every cue time comes from the recorder's `§FILM_CUE` log
#   (cues.json + rec.log); every number on a card or overlay comes from a witness/recorder log line, never typed by hand.
# usage: film_server_dead_desktop_build.py <take_dir> <work_dir> <witness_log_dir>
#   <take_dir>  = recorder output (cfr_A.mp4, cfr_B.mp4 at 25 fps CFR, cues.json, rec.log)
#   writes <work_dir>/silent.mp4 (cards + side-by-side clips + overlay ass), timeline.json (segment map + film-time of every cue)
import sys, os, re, json, subprocess, html, hashlib
TAKE, WORK, WLOG = sys.argv[1:4]
os.makedirs(WORK, exist_ok=True)
HERE = os.path.dirname(os.path.abspath(__file__))
OFF = 0.33            # video time = take time - OFF (measured: first ERP paint in each pane vs cue 'loaded'; see TEAMWORK_FRAMEWORK §14.6)
PW, PH, GAP, PY = 954, 536, 12, 95   # pane size, gap, top
FPS = 25

# ---- timeline: cards and clips (take-time seconds; ×speed) ----
_cj = json.load(open(os.path.join(TAKE, 'cues.json')))['cues']
def C(n, w='A'):
    return [c['t'] for c in _cj if c['name'] == n and c['who'] == w][0]
# clip bounds are ANCHORED to cues from the take's own §FILM_CUE log (offsets = the cut points chosen on the first take, v1)
TL = [
  ('card', 'title', 5.0),
  ('card', 'problem', 11.0),
  ('card', 'bench', 13.0),
  ('clip', 'on',      C('panel_open') - 3.88, C('mode_click') + 2.49, 1, '1 · User A turns team mode on from the Team pill'),
  ('clip', 'found',   C('chip_unpaired') - 1.63, C('founded') + 4.75, 1, '2 · Start a team  →  an invite link (blurred in this film)'),
  ('clip', 'join',    C('invite_opened', 'B') - 2.89, C('requests_listed') - 2.93, 1, '3 · User B opens the invite in a private window and presses Join'),
  ('clip', 'approve', C('requests_listed') - 2.93, C('b_paired', 'B') + 4.19, 1, '4 · User A approves B\'s code and picks a role · User B visits → paired'),
  ('clip', 'enter',  C('order_new'), C('line_saved'), 4, '5 · User A enters a Sales Order and one line'),
  ('clip', 'visit1', C('line_saved'), C('b_grid_has_order', 'B') + 2.9, 1, '5 · Visit on both  →  the order is on User B'),
  ('clip', 'complete', C('a_form_open') - 1.13, C('visitB2', 'B') + 6.9, 1, '6 · User A presses Complete · User B visits → Completed here too'),
  ('clip', 'tax',    C('b_tax_tab', 'B') - 3.05, C('b_tax_tab', 'B') + 4.15, 1, '6 · …and its consequence came across: an Order Tax row'),
  ('clip', 'clash',  C('clash_start') + 0.26, C('visit_B_x2', 'B') + 5.4, 1, '7 · The clash: both complete the same order before visiting'),
  ('clip', 'clash2', C('conflict_shown') - 1.4, C('conflict_shown') + 9.6, 1, '7 · Both: "changed by another user, please ReQuery" · status stays Drafted'),
  ('card', 'limits', 14.0),
  ('card', 'close', 12.0),
]
if os.path.exists(os.path.join(WORK, 'cards_dur.json')):   # card durations tuned after the narration fit
    cd = json.load(open(os.path.join(WORK, 'cards_dur.json')))
    TL = [(t[0], t[1], cd.get(t[1], t[2])) + tuple(t[3:]) if t[0] == 'card' else t for t in TL]

def sh(cmd, **kw):
    r = subprocess.run(cmd, capture_output=True, text=True, **kw)
    if r.returncode: print(r.stderr[-1500:]); sys.exit('FAILED: ' + ' '.join(cmd[:3]))
    return r

# ---- read logs ----
meta = json.load(open(os.path.join(TAKE, 'cues.json')))
rec = open(os.path.join(TAKE, 'rec.log')).read().split('\n')
cues = [(c['name'], c['who'], c['t']) for c in meta['cues']]
def wit(name):
    for l in open(os.path.join(WLOG, name)):
        if l.startswith('§W-'): return l.strip()
    sys.exit('no § verdict in ' + name)
W_DESK, W_DOC, W_SO = wit('desktop.log'), wit('docaction.log'), wit('so.log')
verdict = [l for l in rec if l.startswith('§FILM_REC_VERDICT')][0].strip()
chain = [l for l in rec if l.startswith('§FILM_CHAIN')][0].strip()
assert 'fail_or_torn_or_toast_lines=0' in chain and 'PASS' in verdict, 'take is not clean: ' + chain + ' ' + verdict
print('§FILM_BUILD_CHAIN ' + chain)
space = re.search(r'§FILM_SPACE who=A space=(\w+)', open(os.path.join(TAKE, 'pageA.log')).read()).group(1)
spaceB = re.search(r'§FILM_SPACE who=B space=(\w+)', open(os.path.join(TAKE, 'pageB.log')).read()).group(1)
pipe = [l for l in rec if l.startswith('§FILM_PIPE')][0].strip()
assert space == spaceB, 'space differs between panes'
sha = subprocess.run(['git', '-C', '/tmp/wt-film-erp2', 'rev-parse', '--short', 'HEAD'], capture_output=True, text=True).stdout.strip()
print(f'§FILM_BUILD space={space} spaceB={spaceB} {pipe} bim-ootb={sha}')

# ---- film-time map ----
t0 = 0.0; seg = []
for e in TL:
    if e[0] == 'card': d = e[2]; seg.append(dict(kind='card', id=e[1], fs=t0, fe=t0 + d)); t0 += d
    else:
        _, i, a, b, sp, title = e; d = (b - a) / sp
        seg.append(dict(kind='clip', id=i, ts=a, te=b, sp=sp, title=title, fs=t0, fe=t0 + d)); t0 += d
TOTAL = t0
def to_film(t, strict=True):
    for s in seg:
        if s['kind'] == 'clip' and s['ts'] <= t <= s['te']: return s['fs'] + (t - s['ts']) / s['sp']
    return None
cue_film = {}
for n, w, t in cues:
    f = to_film(t)
    if f is not None: cue_film[f'{n}/{w}'] = round(f, 2)
print('§FILM_MAP total=%.2fs segments=%d cues_in_film=%d' % (TOTAL, len(seg), len(cue_film)))
for s in seg: print('   %-8s %-9s film %7.2f-%7.2f%s' % (s['kind'], s['id'], s['fs'], s['fe'], ('  take %.1f-%.1f x%d' % (s['ts'], s['te'], s['sp'])) if s['kind'] == 'clip' else ''))
json.dump(dict(total=TOTAL, segments=seg, cue_film=cue_film), open(os.path.join(WORK, 'timeline.json'), 'w'), indent=1)

# ---- cards (HTML -> PNG) ----
CSS = '''*{box-sizing:border-box;margin:0}body{width:1920px;height:1080px;background:#f6efe5;color:#14213d;font-family:'Noto Sans','DejaVu Sans',sans-serif;overflow:hidden;padding:70px 110px}
h1,h2,.big{font-family:'Liberation Sans Narrow','Nimbus Sans Narrow',sans-serif;font-weight:700;letter-spacing:.5px}
.k{font-size:26px;letter-spacing:6px;color:#b45309;font-weight:700;margin-bottom:12px}
h1{font-size:150px;line-height:1.0}h2{font-size:92px;color:#c2410c;line-height:1.05;margin-top:6px}
.sub{font-size:44px;margin-top:40px;color:#1f2d4d}.note{font-size:30px;margin-top:26px;color:#52607a}
.t{font-family:'Liberation Sans Narrow',sans-serif;font-weight:700;font-size:78px;line-height:1.05;margin-bottom:34px}
.col{display:flex;gap:40px}.card{flex:1;background:#fffdf8;border:2px solid #e3d8c6;border-radius:24px;padding:34px 40px}
.card.dark{background:#14213d;color:#f6efe5;border-color:#14213d}.card h3{font-size:40px;margin-bottom:18px;font-family:'Liberation Sans Narrow',sans-serif}
li{font-size:31px;line-height:1.32;margin:0 0 13px 34px}.green{color:#15803d}.amber{color:#b45309}.dark li{font-size:30px}
.mono{font-family:'DejaVu Sans Mono',monospace;font-size:27px;line-height:1.5;color:#e9eef7}.mono b{color:#ffb454}
.tag{display:inline-block;background:#14213d;color:#fff;padding:6px 18px;border-radius:12px;font-size:26px;margin-right:12px}
'''
def page(body): return '<!doctype html><meta charset=utf-8><style>%s</style><body>%s</body>' % (CSS, body)
def box(txt, c='#14213d', bg='#fffdf8', x=0, y=0, w=260, h=96, fs=30, extra=''):
    return f'<div style="position:absolute;left:{x}px;top:{y}px;width:{w}px;height:{h}px;background:{bg};border:3px solid {c};border-radius:16px;display:flex;align-items:center;flex-direction:column;justify-content:center;text-align:center;font-size:{fs}px;font-weight:600;color:{c};{extra}">{txt}</div>'
def line(x1, y1, x2, y2, c='#14213d', w=5, dash=''):
    return f'<svg style="position:absolute;left:0;top:0" width="1920" height="1080"><line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{c}" stroke-width="{w}" {dash}/></svg>'
def cross(cx, cy, s=70):
    return line(cx - s, cy - s, cx + s, cy + s, '#dc2626', 14) + line(cx - s, cy + s, cx + s, cy - s, '#dc2626', 14)
CARDS = {}
CARDS['title'] = page('''<div style="margin-top:130px"><div class=k>A PROOF OF CONCEPT</div><h1>The Server is Dead</h1><h2>ERP — desktop setup</h2>
<div class=sub>No DB server. No app server. Just a data relay.</div><div class=note>Two browser windows on one desktop. No phone.</div></div>''')
# problem card: diagram, usual vs here
usual = ''.join(box(f'User {i+1}', x=110 + i * 130 - 0, y=330 + i * 0, w=110, h=70, fs=24) for i in range(3))
CARDS['problem'] = page('''<div class=t>The usual ERP needs a server</div><div style="position:relative;height:640px">
<div style="position:absolute;left:0;top:0;font-size:34px;font-weight:700;color:#b45309">USUAL</div>
%s%s%s%s%s%s%s
%s
<div style="position:absolute;left:0;top:455px;width:820px;font-size:34px;line-height:1.3">One database server and one app server.<br><b>When it stops, everyone stops.</b></div>
<div style="position:absolute;left:960px;top:0;font-size:34px;font-weight:700;color:#15803d">THIS FILM</div>
%s%s%s%s%s
<div style="position:absolute;left:960px;top:455px;width:760px;font-size:34px;line-height:1.3">Each user's browser holds the whole database.<br>Changes travel as <b>signed letters</b> through a post box that only stores them.</div></div>''' % (
  box('User 1', x=0, y=80, w=150, h=70, fs=26), box('User 2', x=0, y=190, w=150, h=70, fs=26), box('User 3', x=0, y=300, w=150, h=70, fs=26),
  box('App server', x=330, y=150, w=200, h=100, c='#7f1d1d', bg='#fee2e2'), box('DB server', x=620, y=150, w=200, h=100, c='#7f1d1d', bg='#fee2e2'),
  ''.join(line(150, y, 330, 200, '#7f1d1d', 4) for y in (115, 225, 335)), line(530, 200, 620, 200, '#7f1d1d', 4),
  cross(575, 200, 90),
  box('User A<br><span style="font-size:22px;font-weight:400">own copy of the database</span>', x=960, y=80, w=300, h=120, c='#15803d', bg='#dcfce7', fs=28),
  box('User B<br><span style="font-size:22px;font-weight:400">own copy of the database</span>', x=960, y=300, w=300, h=120, c='#15803d', bg='#dcfce7', fs=28),
  box('post box<br><span style="font-size:22px;font-weight:400">a repo, a folder: stores bytes</span>', x=1430, y=190, w=300, h=130, c='#14213d', bg='#fff7ed', fs=28),
  line(1260, 140, 1430, 230, '#15803d', 5) + line(1260, 360, 1430, 280, '#15803d', 5), ''))
CARDS['bench'] = page('''<div class=t>What is real, what is a test bench</div><div class=col>
<div class=card><h3 class=green>REAL</h3><ul>
<li>The ERP window: the iDempiere-faithful Sales Order window in the browser</li>
<li>The Team pill, the Team panel, the Visit button, the DocAction bar</li>
<li>Two separate browser windows with separate storage = two users</li>
<li>Every click is a real click on the real page</li></ul></div>
<div class=card><h3 class=amber>TEST BENCH</h3><ul>
<li>The post box is a folder on this computer, standing in for the private GitHub repo</li>
<li>A script does the clicking (Playwright), not a person at the keyboard</li>
<li>Red dot = pointer overlay · invite links are blurred</li>
<li>Waiting time is cut · &times;4 marks a sped-up stretch</li></ul></div></div>''')
CARDS['limits'] = page('''<div class=t>Honest limits: this is a proof of concept</div><div class=col>
<div class=card><h3 class=amber>Not shared yet</h3><ul>
<li>Stock reservation: two users reserving at once can lose an update (the write is refused on the bench)</li>
<li>Document numbers: each device numbers its own orders</li>
<li>Edits to demo-data records: only records created inside the team are shared</li>
<li>A clash is shown on both screens; the chooser to resolve it is not built</li></ul></div>
<div class=card><h3 class=amber>Setup</h3><ul>
<li>The system default setup is a one-cycle trial (one order, one Complete); its key is not installed yet, so this film used a folder</li>
<li>Not run here: the real GitHub path of the in-panel pairing, more than two users</li></ul></div></div>''')
def short(l): return html.escape(re.sub(r'\s+', ' ', l))
CARDS['close'] = page('''<div class=t>Witnessed, not promised</div><div class="card dark"><div class=mono>
%s<br>%s<br>%s<br>%s<br><br><b>one space on both windows:</b> %s &nbsp;·&nbsp; pipe objects: %s<br>
<b>bim-ootb main</b> %s &nbsp;·&nbsp; a proof of concept, not a product</div></div>''' % (
  short(W_DESK), short(W_DOC), short(W_SO), short(verdict + ' (this film\'s own take)'), space, re.search(r'objects=(\d+)', pipe).group(1), sha))
os.makedirs(os.path.join(WORK, 'cards'), exist_ok=True)
for k, v in CARDS.items(): open(os.path.join(WORK, 'cards', k + '.html'), 'w').write(v)
sh(['node', os.path.join(HERE, 'film_html_shot.js'), os.path.join(WORK, 'cards')] + [os.path.join(WORK, 'cards', k + '.html') for k in CARDS])

# ---- encode pieces (cached by parameters) ----
ENC = ['-c:v', 'libx264', '-crf', '16', '-preset', 'fast', '-pix_fmt', 'yuv420p', '-r', str(FPS), '-an']
os.makedirs(os.path.join(WORK, 'seg'), exist_ok=True)
files = []
for s in seg:
    if s['kind'] == 'card':
        out = os.path.join(WORK, 'seg', f"card_{s['id']}_{s['fe']-s['fs']:.2f}.mp4")
        if not os.path.exists(out) or os.path.getmtime(out) < os.path.getmtime(os.path.join(WORK, 'cards', s['id'] + '.png')):
            sh(['ffmpeg', '-v', 'error', '-y', '-loop', '1', '-framerate', str(FPS), '-i', os.path.join(WORK, 'cards', s['id'] + '.png'), '-t', f"{s['fe']-s['fs']:.3f}"] + ENC + [out])
    else:
        out = os.path.join(WORK, 'seg', f"clip_{s['id']}_{s['ts']}_{s['te']}_{s['sp']}.mp4")
        if not os.path.exists(out):
            dur = s['te'] - s['ts']; va = s['ts'] - OFF
            fc = (f"[0:v]scale={PW}:{PH},setsar=1[a];[1:v]scale={PW}:{PH},setsar=1[b];"
                  f"color=c=0x0f1724:s=1920x1080:r={FPS}[bg];[bg][a]overlay=0:{PY}:shortest=1[o1];[o1][b]overlay={PW+GAP}:{PY}:shortest=1[o2];"
                  f"[o2]drawbox=x=0:y={PY-6}:w={PW}:h=6:color=0x4aa3ff:t=fill,drawbox=x={PW+GAP}:y={PY-6}:w={PW}:h=6:color=0xffb454:t=fill"
                  + (f",setpts=PTS/{s['sp']},fps={FPS}" if s['sp'] != 1 else '') + ",format=yuv420p[v]")
            sh(['ffmpeg', '-v', 'error', '-y', '-ss', f'{va:.3f}', '-t', f'{dur:.3f}', '-i', os.path.join(TAKE, 'cfr_A.mp4'),
                '-ss', f'{va:.3f}', '-t', f'{dur:.3f}', '-i', os.path.join(TAKE, 'cfr_B.mp4'), '-filter_complex', fc, '-map', '[v]'] + ENC + [out])
    files.append(out)
lst = os.path.join(WORK, 'concat.txt'); open(lst, 'w').write(''.join(f"file '{f}'\n" for f in files))
base = os.path.join(WORK, 'base.mp4')
sh(['ffmpeg', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', lst, '-c', 'copy', base])

# ---- overlay ass (labels, beat titles, ×N badge, proof lines from the logs) ----
def ts(x): return '%d:%02d:%05.2f' % (int(x // 3600), int(x % 3600 // 60), x % 60)
head = '''[Script Info]
ScriptType: v4.00+
PlayResX: 1920
PlayResY: 1080
WrapStyle: 2

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: LabA,DejaVu Sans,34,&H00FFA34A,&H00FFFFFF,&H00000000,&H00000000,1,0,0,0,100,100,0,0,1,0,0,7,0,0,0,1
Style: LabB,DejaVu Sans,34,&H0054B4FF,&H00FFFFFF,&H00000000,&H00000000,1,0,0,0,100,100,0,0,1,0,0,7,0,0,0,1
Style: Beat,DejaVu Sans,35,&H005C8AFF,&H00FFFFFF,&H00000000,&H00000000,1,0,0,0,100,100,0,0,1,0,0,8,0,0,0,1
Style: PA,DejaVu Sans Mono,20,&H00FFD0A0,&H00FFFFFF,&H00000000,&H00000000,0,0,0,0,100,100,0,0,1,0,0,7,0,0,0,1
Style: PB,DejaVu Sans Mono,20,&H00A0D8FF,&H00FFFFFF,&H00000000,&H00000000,0,0,0,0,100,100,0,0,1,0,0,7,0,0,0,1
Style: Badge,DejaVu Sans,46,&H0000E0FF,&H00FFFFFF,&H00000000,&H00000000,1,0,0,0,100,100,0,0,1,0,0,9,0,30,20,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
'''
ev = []
for s in seg:
    if s['kind'] != 'clip': continue
    a, b = s['fs'], s['fe']
    ev.append(f"Dialogue: 0,{ts(a)},{ts(b)},LabA,,0,0,0,,{{\\pos(14,52)}}USER A {{\\fs23\\b0\\c&H00D0D0D0&}}  real ERP window")
    ev.append(f"Dialogue: 0,{ts(a)},{ts(b)},LabB,,0,0,0,,{{\\pos({PW+GAP+14},52)}}USER B {{\\fs23\\b0\\c&H00D0D0D0&}}  private window, its own storage")
    ev.append(f"Dialogue: 0,{ts(a)},{ts(b)},Beat,,0,0,0,,{{\\pos(960,{PY+PH+8})}}{s['title']}")
    if s['sp'] != 1: ev.append(f"Dialogue: 0,{ts(a)},{ts(b)},Badge,,0,0,0,,\\u00d7{s['sp']}  SPED UP")
# proof lines
P = []   # (who, take_t, text)
cur_cue_t = 0.0
FP_OFF = {'after-visit': 3.0, 'after-complete': 2.5, 'before-visit-after-complete': 2.5, 'after-visit-2': 3.0, 'order2-both-completed-not-visited': 2.5, 'order2-after-clash': 9.0}
held = {}
for l in rec:
    m = re.match(r'^§FILM_CUE (\S+) who=(\w) t=([\d.]+)', l)
    if m: cur_cue_t = float(m.group(3)); continue
    m = re.match(r'^\s+\[([AB]) ([\d.]+)s\] (§.*)$', l)
    if m:
        who, t, txt = m.group(1), float(m.group(2)), m.group(3)
        if txt.startswith('§TEAM_PANEL opened') or txt.startswith('§COMM_SYNC') or txt.startswith('§TEAM-REBUILD') or txt.startswith('§TEAM_BOOT'): continue
        if txt.startswith('§TEAM_VISIT'): txt = re.sub(r' \| projection kept=(\d+) projected=(\d+) skipped=\d+ groupHeld=(\d+) rebuild=\w+ (verifyChain=\w+).*', r' | held=\3 \4', txt).replace(' gaps=0', '')
        if txt.startswith('§TEAM_GROUP_HELD'):
            k = (who, int(t * 2)); held[k] = held.get(k, 0) + 1
            if held[k] == 1: P.append([who, t, '§TEAM_GROUP_HELD  (docstatus conflict — whole group left out)', k])
            continue
        if txt.startswith('§CRUD process committed'): txt = re.sub(r' gid=\S+', '', re.sub(r' op_uuid=\S+', '', txt)).replace('viaGroup=Y ', '')
        if txt.startswith('§AD-DOCFSM-LIVE'): txt = re.sub(r'table=\S+ record=\S+ ', '', txt)
        P.append([who, t, txt, None]); continue
    m = re.match(r'^\s+§FILM_PROBE (\w) (\S+) (\{.*\})', l)
    if m:
        who, lab, js = m.group(1), m.group(2), json.loads(m.group(3))
        if lab in FP_OFF and js:
            P.append([who, cur_cue_t + FP_OFF[lab], f"§FILM_PROBE {lab}  status={js['col']} tip={js['tip']} tax={js['tax']} lines processed={js['linesProcessed']}/{js['lines']}", None])
for k, v in held.items():
    for p in P:
        if p[3] == k and v > 1: p[2] = p[2].replace('§TEAM_GROUP_HELD', f'§TEAM_GROUP_HELD x{v}')
nproof = 0
for who in 'AB':
    items = sorted([p for p in P if p[0] == who], key=lambda p: p[1])
    shown = []
    for p in items:
        f = to_film(p[1])
        if f is None: continue
        shown.append((f, p[2]))
    # slots: 3 per side, a line stays up to 9 s or until its slot is reused
    SL = 3
    for i, (f, txt) in enumerate(shown):
        slot = i % SL; end = f + 9.0
        nxt = [g for g, _ in shown[i + 1:] if (shown.index((g, _)) % SL) == slot] if False else []
        for j in range(i + 1, len(shown)):
            if j % SL == slot: end = min(end, shown[j][0]); break
        # clip to the film-time segment
        for s in seg:
            if s['kind'] == 'clip' and s['fs'] <= f <= s['fe']: end = min(end, s['fe']); break
        if end - f < 0.3: continue
        x = 14 if who == 'A' else PW + GAP + 14
        y = PY + PH + 62 + slot * 31
        txt = html.escape(txt, quote=False).replace('\\', '')
        if len(txt) > 78: txt = txt[:77] + '…'
        ev.append(f"Dialogue: 0,{ts(f)},{ts(end)},P{who},,0,0,0,,{{\\pos({x},{y})}}{txt}")
        nproof += 1
open(os.path.join(WORK, 'overlay.ass'), 'w').write(head + '\n'.join(ev) + '\n')
print(f'§FILM_OVERLAY events={len(ev)} proof_lines={nproof}')
out = os.path.join(WORK, 'silent.mp4')
sh(['ffmpeg', '-v', 'error', '-y', '-i', base, '-vf', f"ass={os.path.join(WORK,'overlay.ass')}", '-c:v', 'libx264', '-crf', '17', '-preset', 'medium', '-pix_fmt', 'yuv420p', '-r', str(FPS), '-an', out])
r = sh(['ffprobe', '-v', 'error', '-count_frames', '-select_streams', 'v:0', '-show_entries', 'stream=nb_read_frames,r_frame_rate:format=duration', '-of', 'compact', out])
print('§FILM_SILENT ' + r.stdout.strip() + f' expected_total={TOTAL:.3f}s expected_frames={round(TOTAL*FPS)}')
