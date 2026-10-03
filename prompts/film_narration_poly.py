# Polyglot narration driver (§6 ERP-POLYGLOT). One dialogue TSV, a language per row:
#   id  lang  source  SHORT  DETAIL        (turns "F: … | M: …"; lang = en|fr|es|de|ar|zh|ja|ms|th)
# usage: film_narration_poly.py <dialogue.tsv> <recorder erp_film.log | measure> <outdir> [film_sec]
#   measure → cues spaced 100 s apart, prints §POLY_DUR id=… dur=… (feeds the recorder's BEAT_MIN);
#   else    → cue = §ERP_FILM_BEAT t of the row's id, end = next beat's t; writes poly_plan.tsv + poly.ass for film_narration_mux.py.
# Each language is fitted by its own fitter (en: Kokoro v3 local; others: Edge cloud), then plans + subtitles are merged,
# subtitle styles renamed per language so each gets a font with its glyphs. Read every fitter log (§NARR_FIT/§NARR_TONE).
import sys, os, re, subprocess
src, beats, out = sys.argv[1], sys.argv[2], sys.argv[3]; film = sys.argv[4] if len(sys.argv) > 4 else '900'
H = os.path.dirname(os.path.abspath(__file__)); PY = os.path.expanduser('~/.local/share/film_narration/venv/bin/python')
FONT = {'en': 'DejaVu Sans', 'fr': 'DejaVu Sans', 'es': 'DejaVu Sans', 'de': 'DejaVu Sans', 'ms': 'DejaVu Sans',
        'ar': 'Noto Sans Arabic', 'zh': 'Noto Sans CJK SC', 'ja': 'Noto Sans CJK JP', 'th': 'Noto Sans Thai'}
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
plan, events, durs = [], [], {}
for L in langs:
    with open(f'poly_{L}.tsv', 'w') as f:
        for r in rows:
            if r[1] == L and r[0] in T: f.write('\t'.join([r[0], f'{T[r[0]][0]:.2f}', f'{T[r[0]][1]:.2f}', r[2], r[3], r[4]]) + '\n')
    env = dict(os.environ, FILM_SEC=str(film))
    cmd = [PY, os.path.join(H, 'film_narration_fit_kokoro_v3.py'), f'poly_{L}.tsv', f'p{L}', '1.15'] if L == 'en' else \
          [PY, os.path.join(H, 'film_narration_fit_edge.py'), f'poly_{L}.tsv', f'p{L}', L]
    log = subprocess.run(cmd, capture_output=True, text=True, env=env); open(f'fit_{L}.log', 'w').write(log.stdout + log.stderr)
    for m in re.finditer(r'§NARR_FIT (\S+) cue=\S+ room=\S+ dur=([\d.]+) -> (\S+)', log.stdout):
        durs[m.group(1)] = float(m.group(2)); print(f'§POLY_FIT lang={L} id={m.group(1)} dur={m.group(2)} pick={m.group(3)}')
    print(f'§POLY_TONE lang={L} wrong={log.stdout.count("WRONG")} rc={log.returncode}')
    if os.path.exists(f'p{L}_plan.tsv'): plan += [l for l in open(f'p{L}_plan.tsv') if l.strip()]
    if os.path.exists(f'p{L}.ass'):
        for l in open(f'p{L}.ass'):
            m = re.match(r'Dialogue: 0,([^,]+),([^,]+),(F|M),', l)
            if m: events.append((m.group(1), l.replace(f',{m.group(3)},', f',{m.group(3)}_{L},', 1)))
if beats == 'measure':
    for k in [r[0] for r in rows]: print(f'§POLY_DUR id={k} dur={durs.get(k, 0):.2f}')
    sys.exit(0)
hd = open('ass_head.txt').read(); base_f = re.search(r'^Style: F,.*$', hd, re.M).group(0); base_m = re.search(r'^Style: M,.*$', hd, re.M).group(0)
styles = ''.join(base_f.replace('Style: F,DejaVu Sans', f'Style: F_{L},{FONT[L]}') + '\n' + base_m.replace('Style: M,DejaVu Sans', f'Style: M_{L},{FONT[L]}') + '\n' for L in langs)
hd = hd.replace(base_m + '\n', base_m + '\n' + styles)
ts = lambda x: f'{int(x//3600)}:{int(x%3600//60):02d}:{x%60:05.2f}'
fs = float(film)
credit = f'Dialogue: 0,{ts(fs-8)},{ts(fs-0.1)},Credit,,0,0,0,,Voices: AI-generated (Kokoro, local · Microsoft Edge TTS, cloud)  ·  UI labels: iDempiere language packs + labelled machine fill  ·  Script directed by red1\n'
open('poly.ass', 'w').write(hd + ''.join(e for _, e in sorted(events)) + credit)
open('poly_plan.tsv', 'w').write(''.join(plan))
print(f'§POLY_DONE langs={len(langs)} clips={len(plan)} events={len(events)}')
