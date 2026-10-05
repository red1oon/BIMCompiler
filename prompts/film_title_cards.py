# ⚠ DO NOT REMOVE — Scope: FILM_NARRATION.md §8 TITLE CARDS (chapter cards in red1's reference style, ref screenshot
# 2026-10-04 04-37-58) + backdrops (latest Alt+S stills, dimmed). Read the log after every run (§CARDS lines).
# usage: film_title_cards.py <recorder log> <backdrops.txt "cN path"> <in.ass> <silent.mp4> <out_dir>
#   → <out_dir>/carded.mp4 (each card window shows its dimmed still instead of the footage)
#   → <out_dir>/carded.ass (in.ass + card text + persistent chapter tag + series tag) — then film_narration_mux.py burns it.
# Card window = §FILM_CHAPTER t .. t+CARD_SEC. Text is fixed per chapter below (no numbers — nothing to source).
import sys, re, os, subprocess
log, bfile, ass_in, video, out = sys.argv[1:6]
CARD_SEC = 2.6
CARDS = {  # n: (kicker, title line 1 (off-white), title line 2 (coral), one plain line)
    1: ('CHAPTER 1', 'OPEN', 'ANY BUILDING', 'Nothing to install. Any browser.'),
    2: ('CHAPTER 2', 'SEE', 'EVERYTHING', 'Every element: its class, storey and material.'),
    3: ('CHAPTER 3', 'INSPECT', 'IN DEPTH', 'Cut it, measure it, light it, find the clashes.'),
    4: ('CHAPTER 4', 'BUILD', 'OVER TIME', 'A schedule that comes from the model itself.'),
    5: ('CHAPTER 5', 'COUNT', 'THE COST', 'Rates and currency follow your language.'),
    6: ('CHAPTER 6', 'SHARE', 'THE VIEW', 'One link — or a film of its own.'),
}
TAG = {1: 'OPEN', 2: 'SEE', 3: 'INSPECT', 4: 'TIME', 5: 'COST', 6: 'SHARE'}
SERIES = 'BIM OOTB  ·  VIEWER'
# NOVEL ART badges (red1 2026-10-04: "u know the hilites.. those that are novel art") — a small coral-boxed badge under the
# chapter tag for the length of the beat; each maps to an item in FILM_NARRATION.md §10 NOVEL ART (source there).
NOVEL = {'s03': ('NOVEL ART', 'IFC → SQLite, streamed in the browser'),          # §10 NOVEL ART 2
         's05b': ('NOVEL ART', 'Answers from the engines — with evidence'),     # find_ask.js; exit path = room graph
         's10': ('BIM KILLER', 'Clash matrix in a browser tab'),               # §CLASH_MATRIX, no install
         's11p': ('NOVEL ART', '4D: nothing before what holds it up'),         # v4: the line moved to the play sub-beat          # NOVEL ART 6 (MIDAIR 5,561 → 0)
         's09s': ('BIM KILLER', 'Night + fly — scrub it, it never drifts'),     # v4: on the timeline-drag sub-beat      # BIMUserGuide.md:119-123 deterministic scrub
         's15_en_US': ('BIM KILLER', 'Language = cost context'),               # Localization.md: a locale is a cost context
         's16': ('BIM KILLER', 'One link to a phone — nothing to install'),    # BIMUserGuide.md:11 + :776 (v4 dropped the clash line)
         's17': ('NOVEL ART', 'A film derived from the room graph')}           # NOVEL ART 9
# red1 2026-10-04: "or killers in BIM world" — two badge kinds: NOVEL ART (new ideas) · BIM KILLER (standout features)                # NOVEL ART 9
# CUTAWAY CLIPS (red1 2026-10-04: "About taking a clip, perhaps u can then take Hospital, a nice part" / "this clip be cheap
# to snatch") — a silent baked film shown over the footage inside a beat; label bottom-left. beat: (file, ss, dur, offset, label)
# v4: s05c is LIVE now (door-to-door room path on HHS) — the Terminal escape-route cutaway is retired
CLIPS = {'s17clip': (os.path.expanduser('~/Downloads/Hospital_flyaround_AFTER_1920x1080_24fps_2026-10-04_part2.mp4'), 0.5, 5.0, 0.0,
                 'Hospital  ·  a film baked in the browser')}
# §9 MODELLER TRAILER (FILM_NARRATION.md §9 STORYBOARD v1): FILM_SET=modeller swaps the chapter text, tags and badges; no cutaways.
if os.environ.get('FILM_SET') == 'modeller':
    CARDS = {
        1: ('CHAPTER 1', 'OPEN', 'A REAL BUILDING', "Don't draw from a blank grid."),
        2: ('CHAPTER 2', 'ASSEMBLE', 'AND DRAW', 'Insert, sketch, cut, route.'),
        3: ('CHAPTER 3', 'MOVE IT', 'EVERYTHING FOLLOWS', 'One drag, one signed edit.'),
        4: ('CHAPTER 4', 'IT FILLS', 'ITSELF IN', 'Missing trades, walked from measured rules.'),
        5: ('CHAPTER 5', 'THE LOG IS', 'THE TIMELINE', 'Drag back to undo. Forward to redo.'),
        6: ('CHAPTER 6', 'SAVE', 'AND SHARE', 'Clash-gated save. BCF out.'),
    }
    TAG = {1: 'OPEN', 2: 'DRAW', 3: 'MOVE', 4: 'WALK', 5: 'TIME', 6: 'SHARE'}
    SERIES = 'BIM OOTB  ·  MODELLER'
    NOVEL = {'m02': ('NOVEL ART', 'The model is a signed op-log, folded'),        # ModellerGuide.md:4-7
             'm09': ('NOVEL ART', 'Walk a missing trade from measured rules'),   # ModellerGuide.md:563-566
             'm12': ('NOVEL ART', 'The slider is the history — exact'),          # ModellerGuide.md:720-726
             'm03': ('BIM KILLER', 'Assemble, not draw — in a browser'),         # ModellerGuide.md:205
             'm14': ('BIM KILLER', 'BCF 2.1 out of a browser tab')}              # ModellerGuide.md:758-765
    CLIPS = {}
# §11 HIGHWAY FILM (FILM_NARRATION.md §11, red1 2026-10-05: "use the beautiful Chapter by chapter theme nice font layout as in the
# last movie"): FILM_SET=highway — same card anatomy; chapters/badges keyed to film_narration_jelapang_highway_dialogue.tsv row ids;
# the chapter log + backdrops come from prompts/film_highway_chapters.py (no recorder for a baked film). No cutaways.
if os.environ.get('FILM_SET') == 'highway':
    CARDS = {
        1: ('CHAPTER 1', 'ONE COMPILER', 'ROADS TOO', 'The same model that runs our buildings.'),
        2: ('CHAPTER 2', 'READ THE', 'DISCIPLINES', 'Road, drainage, lighting, signage — from the files.'),
        3: ('CHAPTER 3', 'DRIVE', 'THE ROAD', 'Junctions and lamps, read from the model itself.'),
        4: ('CHAPTER 4', 'CHECK', 'THE CLASHES', 'Box overlaps narrowed to real contacts.'),
        5: ('CHAPTER 5', 'TIME AND COST', 'ON THE FLY', 'Phases and crews. Rates only when official.'),
        6: ('CHAPTER 6', 'LOCAL FIRST', 'AND WHAT NEXT', 'One browser tab — terrain and alignment next.'),
    }
    TAG = {1: 'ONE COMPILER', 2: 'DISCIPLINES', 3: 'THE ROAD', 4: 'CLASHES', 5: '4D · 5D', 6: 'LOCAL FIRST'}
    SERIES = 'BIM OOTB  ·  CIVIL'
    NOVEL = {'proxies': ('NOVEL ART', 'Disciplines read from the file names'),       # §CIVIL_DISC (import_worker.js)
             'clash': ('BIM KILLER', 'Road clash matrix in a browser tab'),          # §V.3 23,288 box → 1,852 mesh-true
             'onthefly': ('NOVEL ART', 'A film derived from the road itself'),       # §ALTC_HIGHWAY waypoints = Fly route
             'tech': ('NOVEL ART', 'Recomputed normals — a 40 % lighter file')}      # §MESH_SLIM 661,573,632 → 395,710,464 B
    CLIPS = {}
# §ALTC_V2 (FILM_NARRATION.md §11 v2): FILM_SET=highway2 — the same six cards in the v2 film's TIME order (chapter script
# film_highway_chapters.py maps greet_en/open/fourD/lamps/clash/field); badges keyed to the v2 row ids.
if os.environ.get('FILM_SET') == 'highway2':
    CARDS = {
        1: ('CHAPTER 1', 'ONE COMPILER', 'ROADS TOO', 'The same model that runs our buildings.'),
        2: ('CHAPTER 2', 'READ THE', 'DISCIPLINES', 'Road, drainage, lighting, signage — from the files.'),
        3: ('CHAPTER 3', 'TIME AND COST', 'ON THE FLY', 'Built section by section. Rates only when official.'),
        4: ('CHAPTER 4', 'DRIVE', 'THE ROAD', 'Each trade on its own, read from the model.'),
        5: ('CHAPTER 5', 'CHECK', 'THE CLASHES', 'Box overlaps narrowed to real contacts.'),
        6: ('CHAPTER 6', 'LOCAL FIRST', 'AND WHAT NEXT', 'One browser tab — terrain and alignment next.'),
    }
    TAG = {1: 'ONE COMPILER', 2: 'DISCIPLINES', 3: '4D · 5D', 4: 'THE ROAD', 5: 'CLASHES', 6: 'LOCAL FIRST'}
    SERIES = 'BIM OOTB  ·  CIVIL'
    NOVEL = {'counts': ('NOVEL ART', 'Disciplines read from the file names'),        # §CIVIL_DISC (import_worker.js)
             'check': ('NOVEL ART', 'Road checks shown as formulas — valid or speculative'),   # §ALTC_CHECKS road_rules.json film_status
             'clash': ('BIM KILLER', 'Road clash matrix in a browser tab'),          # §V.3 23,288 box → 1,852 mesh-true
             'onthefly': ('NOVEL ART', 'A film derived from the road itself'),       # §ALTC_V2 route = A.civilDriveRoute
             'tech': ('NOVEL ART', 'Recomputed normals — a 40 % lighter file')}      # §MESH_SLIM 661,573,632 → 395,710,464 B
    CLIPS = {}
# §ALTC_V3 (FILM_NARRATION.md §11.v3): FILM_SET=highway3 — the assembled clip-series film; the narrative extols what compilation gives.
if os.environ.get('FILM_SET') == 'highway3':
    CARDS = {
        1: ('CHAPTER 1', 'ONE COMPILER', 'ROADS TOO', 'A Malaysian highway, through the same compiler as our buildings.'),
        2: ('CHAPTER 2', 'ONE MODEL', 'MANY ANSWERS', 'Schedule, quantities, clashes, checks — from one database.'),
        3: ('CHAPTER 3', 'BUILT', 'ALL THE WAY', 'Piece by piece, in the schedule\'s own order.'),
        4: ('CHAPTER 4', 'TIME AND COST', 'ON THE FLY', 'Quantities now. Prices when official.'),
        5: ('CHAPTER 5', 'LOCAL FIRST', 'NO SERVER', 'One browser tab. Nothing drawn by hand.'),
        6: ('CHAPTER 6', 'REPORTS', 'AND CHECKS', '4D / 5D and road compliance, one click.'),
    }
    TAG = {1: 'ONE COMPILER', 2: 'ONE MODEL', 3: 'BUILT', 4: '4D · 5D', 5: 'LOCAL FIRST', 6: 'REPORTS'}
    SERIES = 'BIM OOTB  ·  CIVIL'
    NOVEL = {'check': ('NOVEL ART', 'Road checks as formulas — valid or speculative'),   # §ALTC_CHECKS road_rules.json film_status
             'clash': ('BIM KILLER', 'Road clash matrix in a browser tab'),            # §CLASH_NARROWPHASE broad 1011 → 138 mesh-true
             'tech': ('NOVEL ART', 'A film derived from the road itself'),             # §ALTC_V2 route = A.civilDriveRoute
             'compliance': ('BIM KILLER', 'Compliance report in place of the MEP bill')}  # §MC_MOCKUP model_check_report.html
    CLIPS = {}
os.makedirs(out, exist_ok=True)
txt = open(log).read()
chap = {int(m.group(1)): float(m.group(2)) for m in re.finditer(r'§FILM_CHAPTER n=(\d+) key=\S+ t=([\d.]+)', txt)}
end = max(float(m.group(1)) for m in re.finditer(r'§FILM_BEAT id=\S+ t=([\d.]+)', txt))
back = dict(l.split(' ', 1) for l in open(bfile).read().strip().split('\n'))
back = {int(k[1:]): v.strip() for k, v in back.items()}
print(f'§CARDS chapters={len(chap)} end={end:.2f} backdrops={len(back)}')
if len(chap) != 6 or any(n not in back or not os.path.exists(back[n]) for n in chap): sys.exit('§CARDS FAIL missing chapter or backdrop')

# ── 1. video: dimmed still over the footage inside each card window ──
inputs = ['-i', video]
for n in sorted(chap): inputs += ['-loop', '1', '-i', back[n]]
f, prev = [], '0:v'
for i, n in enumerate(sorted(chap)):
    a, b = chap[n], chap[n] + CARD_SEC
    f.append(f'[{i + 1}:v]scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,eq=brightness=-0.32:saturation=0.85,format=yuv420p[s{n}]')
    f.append(f'[{prev}][s{n}]overlay=0:0:enable=\'between(t,{a:.3f},{b:.3f})\':shortest=1[v{n}]')
    prev = f'v{n}'
beats_v = [(m.group(1), float(m.group(2))) for m in re.finditer(r'§FILM_BEAT id=(\S+) t=([\d.]+)', txt)]
clip_win = {}
k = len(chap) + 1
for bid, (cf, ss, dur, off, lab) in CLIPS.items():
    bt = next((t for b2, t in beats_v if b2 == bid), None)
    if bt is None or not os.path.exists(cf): print(f'§CARDS clip SKIP {bid} beat={bt} file={os.path.exists(cf)}'); continue
    a0 = bt + off; clip_win[bid] = (a0, a0 + dur, lab)
    inputs += ['-ss', str(ss), '-t', str(dur), '-i', cf]
    f.append(f'[{k}:v]scale=1920:1080,setpts=PTS-STARTPTS+{a0:.3f}/TB,format=yuv420p[c{k}]')
    f.append(f'[{prev}][c{k}]overlay=0:0:eof_action=pass:enable=\'between(t,{a0:.3f},{a0 + dur:.3f})\'[w{k}]'); prev = f'w{k}'; k += 1
    print(f'§CARDS clip {bid} {os.path.basename(cf)} ss={ss} dur={dur} at={a0:.2f}')
cmd = ['ffmpeg', '-v', 'error', '-y'] + inputs + ['-filter_complex', ';'.join(f), '-map', f'[{prev}]', '-c:v', 'libx264', '-crf', '17',
       '-preset', 'medium', '-pix_fmt', 'yuv420p', os.path.join(out, 'carded.mp4')]
r = subprocess.run(cmd, capture_output=True, text=True)
print(f'§CARDS video rc={r.returncode} {r.stderr[-300:].strip()}')

# ── 2. text: card styles + events appended to the narration .ass ──
ts = lambda x: f'{int(x // 3600)}:{int(x % 3600 // 60):02d}:{x % 60:05.2f}'
CORAL, WHITE = '&H00786BFF', '&H00E8EEF3'   # ASS BGR: #FF6B78 coral, #F3EEE8 off-white
styles = [
    f'Style: CardKicker,DejaVu Sans,34,{CORAL},&H00FFFFFF,&H00000000,&H00000000,1,0,0,0,100,100,6,0,1,0,0,5,0,0,0,1',
    f'Style: CardTitle1,DejaVu Sans,128,{WHITE},&H00FFFFFF,&H00000000,&H00000000,1,0,0,0,100,100,2,0,1,0,0,5,0,0,0,1',
    f'Style: CardTitle2,DejaVu Sans,128,{CORAL},&H00FFFFFF,&H00000000,&H00000000,1,0,0,0,100,100,2,0,1,0,0,5,0,0,0,1',
    f'Style: CardLine,DejaVu Sans,40,{WHITE},&H00FFFFFF,&H00000000,&H00000000,0,0,0,0,100,100,0,0,1,0,0,5,0,0,0,1',
    f'Style: ChapterTag,DejaVu Sans,26,{CORAL},&H00FFFFFF,&H00000000,&HB0140E12,1,0,0,0,100,100,4,0,3,10,0,7,46,0,40,1',
    f'Style: NovelBadge,DejaVu Sans,28,&H00FFFFFF,&H00FFFFFF,&H00000000,&HC0786BFF,1,0,0,0,100,100,2,0,3,10,0,7,46,0,96,1',
    f'Style: SeriesTag,DejaVu Sans,26,&H00FFFFFF,&H00FFFFFF,&H00000000,&HB0140E12,1,0,0,0,100,100,3,0,3,10,0,9,0,46,40,1',
]
hd = open(ass_in).read()
head, ev = hd.split('[Events]', 1)
head = head.rstrip('\n') + '\n' + '\n'.join(styles) + '\n\n'
fade = r'{\fad(300,300)}'
events = []
order = sorted(chap)
for i, n in enumerate(order):
    a, b = chap[n], chap[n] + CARD_SEC
    k, t1, t2, line = CARDS[n]
    events += [f'Dialogue: 2,{ts(a)},{ts(b)},CardKicker,,0,0,0,,{fade}{{\\pos(960,330)}}{k}',
               f'Dialogue: 2,{ts(a)},{ts(b)},CardTitle1,,0,0,0,,{fade}{{\\pos(960,455)}}{t1}',
               f'Dialogue: 2,{ts(a)},{ts(b)},CardTitle2,,0,0,0,,{fade}{{\\pos(960,590)}}{t2}',
               f'Dialogue: 2,{ts(a)},{ts(b)},CardLine,,0,0,0,,{fade}{{\\pos(960,720)}}{line}']
    tag_end = chap[order[i + 1]] if i + 1 < len(order) else end
    events.append(f'Dialogue: 1,{ts(b)},{ts(tag_end)},ChapterTag,,0,0,0,,{k}  ·  {TAG[n]}')
events.append(f'Dialogue: 1,{ts(chap[order[0]])},{ts(end)},SeriesTag,,0,0,0,,{SERIES}')
beats = [(m.group(1), float(m.group(2))) for m in re.finditer(r'§FILM_BEAT id=(\S+) t=([\d.]+)', txt)]
nb = 0
for i, (bid, t) in enumerate(beats):
    if bid in NOVEL and i + 1 < len(beats):
        events.append(f'Dialogue: 1,{ts(t)},{ts(beats[i + 1][1])},NovelBadge,,0,0,0,,{{\\fad(250,250)}}★ {NOVEL[bid][0]}  ·  {NOVEL[bid][1]}'); nb += 1
print(f'§CARDS badges={nb} of {len(NOVEL)}')
for bid, (a0, a1, lab) in clip_win.items():
    events.append(f'Dialogue: 1,{ts(a0)},{ts(a1)},NovelBadge,,0,0,0,,{{\\fad(250,250)}}{lab}')
open(os.path.join(out, 'carded.ass'), 'w').write(head + '[Events]' + ev.rstrip('\n') + '\n' + '\n'.join(events) + '\n')
print(f'§CARDS ass events={len(events)} cards={len(order)} out={out}')
