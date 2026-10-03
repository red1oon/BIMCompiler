# Polyglot narration driver (§6 ERP-POLYGLOT). One dialogue TSV, a language per row:
#   id  lang  source  SHORT  DETAIL  [EN_SHORT  EN_DETAIL]   (turns "F: … | M: …")
#   lang = en|fr|es|de|ar|zh|ja|ms|th|ko|pt|id|bn. EN_* (non-English rows) = the English meaning, burned as a smaller
#   second subtitle under the native line, turn for turn, following the variant the fitter picked (red1, 2026-10-04:
#   "English translation for the others as a second subtitle").
# usage: film_narration_poly.py <dialogue.tsv> <recorder erp_film.log | measure> <outdir> [film_sec]
#   measure → cues spaced 100 s apart, prints §POLY_DUR id=… dur=… (feeds the recorder's BEAT_MIN);
#   else    → cue = §ERP_FILM_BEAT t of the row's id, end = next beat's t; writes poly_plan.tsv + poly.ass for film_narration_mux.py.
# Each language is fitted by its own fitter (en: Kokoro v3 local; others: Edge cloud), then plans + subtitles are merged,
# subtitle styles renamed per language so each gets a font with its glyphs. Read every fitter log (§NARR_FIT/§NARR_TONE).
import sys, os, re, subprocess
src, beats, out = sys.argv[1], sys.argv[2], sys.argv[3]; film = sys.argv[4] if len(sys.argv) > 4 else '900'
H = os.path.dirname(os.path.abspath(__file__)); PY = os.path.expanduser('~/.local/share/film_narration/venv/bin/python')
FONT = {'en': 'DejaVu Sans', 'fr': 'DejaVu Sans', 'es': 'DejaVu Sans', 'de': 'DejaVu Sans', 'ms': 'DejaVu Sans',
        'ar': 'Noto Sans Arabic', 'zh': 'Noto Sans CJK SC', 'ja': 'Noto Sans CJK JP', 'th': 'Noto Sans Thai',
        'ko': 'Noto Sans CJK KR', 'pt': 'DejaVu Sans', 'id': 'DejaVu Sans', 'bn': 'Noto Sans Bengali'}
CREDIT = os.environ.get('POLY_CREDIT', 'Voices: AI-generated (Kokoro, local · Microsoft Edge TTS, cloud)  ·  UI labels: iDempiere language packs + labelled machine fill  ·  Script directed by red1')
rows = [l.rstrip('\n').split('\t') for l in open(src) if l.strip()]
if beats == 'measure':
    T = {r[0]: (i * 100.0, i * 100.0 + 95) for i, r in enumerate(rows)}
else:
    b = [(m.group(1), float(m.group(2))) for m in re.finditer(r'§ERP_FILM_BEAT id=(\S+) t=([\d.]+)', open(beats).read())]
    T = {}
    for i, (k, t) in enumerate(b):
        if i + 1 < len(b): T[k] = (t, b[i + 1][1])
os.makedirs(out, exist_ok=True); os.chdir(out)
open('ass_head.txt', 'w').write(open(os.path.join(H, 'film_narration_ass_head.txt')).read())
langs = []
for r in rows:
    if r[1] not in langs: langs.append(r[1])
plan, events, durs, picks = [], [], {}, {}
ROW = {r[0]: r for r in rows}
turns = lambda cell: [x.strip()[2:].strip() for x in cell.split(' | ')]
glossed = 0; glossMiss = []
for L in langs:
    with open(f'poly_{L}.tsv', 'w') as f:
        for r in rows:
            if r[1] == L and r[0] in T: f.write('\t'.join([r[0], f'{T[r[0]][0]:.2f}', f'{T[r[0]][1]:.2f}', r[2], r[3], r[4]]) + '\n')
    env = dict(os.environ, FILM_SEC=str(film))
    cmd = [PY, os.path.join(H, 'film_narration_fit_kokoro_v3.py'), f'poly_{L}.tsv', f'p{L}', '1.15'] if L == 'en' else \
          [PY, os.path.join(H, 'film_narration_fit_edge.py'), f'poly_{L}.tsv', f'p{L}', L]
    log = subprocess.run(cmd, capture_output=True, text=True, env=env); open(f'fit_{L}.log', 'w').write(log.stdout + log.stderr)
    for m in re.finditer(r'§NARR_FIT (\S+) cue=\S+ room=\S+ dur=([\d.]+) -> (\S+)', log.stdout):
        durs[m.group(1)] = float(m.group(2)); picks[m.group(1)] = m.group(3); print(f'§POLY_FIT lang={L} id={m.group(1)} dur={m.group(2)} pick={m.group(3)}')
    print(f'§POLY_TONE lang={L} wrong={log.stdout.count("WRONG")} rc={log.returncode}')
    if os.path.exists(f'p{L}_plan.tsv'): plan += [l for l in open(f'p{L}_plan.tsv') if l.strip()]
    if os.path.exists(f'p{L}.ass'):
        for l in open(f'p{L}.ass'):
            m = re.match(r'Dialogue: 0,([^,]+),([^,]+),(F|M),([^#,]*)#(\d+),0,0,0,,(.*)$', l.rstrip('\n'))
            if not m: continue
            rid, j, r = m.group(4), int(m.group(5)), ROW.get(m.group(4))
            col = 0 if picks.get(rid) == 'SHORT' else 1
            text = m.group(6)
            g = None
            if L != 'en' and r is not None and len(r) > 6:
                gl = turns(r[5 + col]); g = gl[j] if j < len(gl) else None
            if L != 'en' and g is None: glossMiss.append(f'{rid}#{j}')
            mv = '0' if g is None else '104'                        # native line lifted above the English gloss
            events.append((m.group(1), f'Dialogue: 0,{m.group(1)},{m.group(2)},{m.group(3)}_{L},{rid}#{j},0,0,{mv},,{text}\n'))
            if g is not None:
                glossed += 1; events.append((m.group(1), f'Dialogue: 0,{m.group(1)},{m.group(2)},Gloss,{rid}#{j}g,0,0,0,,{g}\n'))
if beats == 'measure':
    for k in [r[0] for r in rows]: print(f'§POLY_DUR id={k} dur={durs.get(k, 0):.2f}')
    sys.exit(0)
hd = open('ass_head.txt').read(); base_f = re.search(r'^Style: F,.*$', hd, re.M).group(0); base_m = re.search(r'^Style: M,.*$', hd, re.M).group(0)
styles = ''.join(base_f.replace('Style: F,DejaVu Sans', f'Style: F_{L},{FONT[L]}') + '\n' + base_m.replace('Style: M,DejaVu Sans', f'Style: M_{L},{FONT[L]}') + '\n' for L in langs)
gloss = 'Style: Gloss,DejaVu Sans,32,&H00E8E8E8,&H00FFFFFF,&H90000000,&H00000000,0,1,0,0,100,100,0,0,1,2.2,0,2,260,260,44,1\n'
hd = hd.replace(base_m + '\n', base_m + '\n' + styles + gloss)
ts = lambda x: f'{int(x//3600)}:{int(x%3600//60):02d}:{x%60:05.2f}'
fs = float(film)
credit = f'Dialogue: 0,{ts(fs-8)},{ts(fs-0.1)},Credit,,0,0,0,,{CREDIT}\n'
open('poly.ass', 'w').write(hd + ''.join(e for _, e in sorted(events)) + credit)
open('poly_plan.tsv', 'w').write(''.join(plan))
print(f'§POLY_GLOSS glossed={glossed} missing={len(glossMiss)} ' + (','.join(glossMiss[:20]) if glossMiss else ''))
print(f'§POLY_DONE langs={len(langs)} clips={len(plan)} events={len(events)}')
