# ⚠ DO NOT REMOVE — Scope: FILM_NARRATION.md §11 HIGHWAY FILM. A baked Alt+C film has no recorder log, so this writes the two
# inputs prompts/film_title_cards.py (FILM_SET=highway) needs, FROM THE NARRATION SCRIPT'S CUES (re-time the TSV to the bake's
# §CINEMA_BEATS first): <out>/chapters.log (§FILM_CHAPTER n= key= t= + one §FILM_BEAT per row) and <out>/backdrops.txt (cN path).
# Backdrops = the given Alt+S stills of THIS road, cycled across the chapters in order (red1 2026-10-05: "u may use 2 stills
# back i saved as backdrop for the chapter paging"); with none given, a frame grabbed from the film itself at the chapter time
# (the road behind its own card — never another building). Read the log (§HW_CHAPTERS lines).
# usage: film_highway_chapters.py <script.tsv> <film.mp4> <out_dir> [still.png ...]
import sys, os, subprocess
tsv, film, out = sys.argv[1:4]
stills = [p for p in sys.argv[4:] if os.path.exists(p)]
CHAP = {'greet_en': (1, 'open'), 'proxies': (2, 'disciplines'), 'junction': (3, 'road'), 'clash': (4, 'clash'),
        'fourD': (5, 'time'), 'tech': (6, 'local')}
os.makedirs(out, exist_ok=True)
rows = [l.rstrip('\n').split('\t') for l in open(tsv) if l.strip()]
# §ALTC_V2 film (112 s, script film_narration_jelapang_highway_v2_dialogue.tsv — no 'proxies' row): chapters re-placed in TIME
# order and clear of the three road data cards (29.5 / 37.5 / 48.5 s); film_title_cards.py FILM_SET=highway2 carries the
# matching card text order (c3 = time & cost, c4 = the road).
if any(r[0] == 'compile' for r in rows):   # §ALTC_V3 assembled film (film_narration_highway_v3_dialogue.tsv) — FILM_SET=highway3
    CHAP = {'greet_en': (1, 'open'), 'compile': (2, 'model'), 'fourD': (3, 'built'), 'quantities': (4, 'time'),
            'tech': (5, 'local'), 'fourd5d': (6, 'reports')}
elif not any(r[0] == 'proxies' for r in rows):
    CHAP = {'greet_en': (1, 'open'), 'open': (2, 'disciplines'), 'fourD': (3, 'time'), 'lamps': (4, 'road'),
            'clash': (5, 'clash'), 'field': (6, 'local')}
log, back = [], []
for r in rows:
    rid, cue = r[0], float(r[1])
    if rid in CHAP:
        n, key = CHAP[rid]
        log.append(f'§FILM_CHAPTER n={n} key={key} t={cue:.2f}')
        if stills:
            png = stills[(n - 1) % len(stills)]
        else:
            png = os.path.join(out, f'c{n}.png')
            rc = subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', f'{cue + 0.5:.2f}', '-i', film, '-frames:v', '1', png]).returncode
            if rc or not os.path.exists(png):
                print(f'§HW_CHAPTERS FAIL frame c{n} t={cue}')
                sys.exit(1)
        back.append(f'c{n} {png}')
    log.append(f'§FILM_BEAT id={rid} t={cue:.2f}')
log.append(f'§FILM_BEAT id=end t={float(rows[-1][2]):.2f}')
open(os.path.join(out, 'chapters.log'), 'w').write('\n'.join(log) + '\n')
open(os.path.join(out, 'backdrops.txt'), 'w').write('\n'.join(back) + '\n')
names = ', '.join(os.path.basename(b.split(' ', 1)[1]) for b in back)
src = (str(len(stills)) + ' stills') if stills else 'film-frames'
print(f'§HW_CHAPTERS chapters={len(back)} beats={len(rows)} backdrops={src} [{names}] out={out}')
