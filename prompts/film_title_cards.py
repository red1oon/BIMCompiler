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
open(os.path.join(out, 'carded.ass'), 'w').write(head + '[Events]' + ev.rstrip('\n') + '\n' + '\n'.join(events) + '\n')
print(f'§CARDS ass events={len(events)} cards={len(order)} out={out}')
