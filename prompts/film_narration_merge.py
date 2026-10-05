# ⚠ DO NOT REMOVE — Scope: FILM_NARRATION.md §11 step 3 "mixed-language gap". Merges several fitted runs (one Kokoro English
# body + one Edge run per greeting/farewell language) into ONE <out>_plan.tsv + <out>.ass that film_narration_mux.py takes as
# a single tag. Each source run keeps its own cue (plans are concatenated, sorted by cue); each run's F/M styles are copied
# under a per-run name (F_<tag>, M_<tag>) so its own font (Noto CJK / Thai / Arabic) is kept; one combined credit line.
# Read the log: §NARR_MERGE runs= rows= dialogue= styles=.
# usage (from the fit dir): film_narration_merge.py <out_tag> <base_tag> <tag> [<tag> ...]   (base = the English run)
import sys, re
out, base, others = sys.argv[1], sys.argv[2], sys.argv[3:]
def parts(tag):
    t = open(f'{tag}.ass').read()
    head, ev = t.split('[Events]', 1)
    styles = [l for l in head.split('\n') if l.startswith('Style:')]
    dia = [l for l in ev.split('\n') if l.startswith('Dialogue:') and ',Credit,' not in l]
    return head, styles, dia
bhead, bstyles, bdia = parts(base)
extra_styles, all_dia = [], list(bdia)
for tag in others:
    _, st, dia = parts(tag)
    for s in st:
        m = re.match(r'Style: (F|M),', s)
        if m: extra_styles.append(s.replace(f'Style: {m.group(1)},', f'Style: {m.group(1)}_{tag},', 1))
    for d in dia:
        f = d.split(',', 4)   # Dialogue: layer, start, end, style, rest
        if f[3] in ('F', 'M'): f[3] = f'{f[3]}_{tag}'
        all_dia.append(','.join(f))
def t0(d): h, m, s = d.split(',')[1].split(':'); return int(h) * 3600 + int(m) * 60 + float(s)
all_dia.sort(key=t0)
credit = [l for l in open(f'{base}.ass').read().split('\n') if ',Credit,' in l and l.startswith('Dialogue:')]
if credit:
    credit = [re.sub(r',,Voices:.*$', ',,Voices: AI-generated (Kokoro, local · Microsoft Edge TTS, cloud)  ·  Script directed by red1', credit[0])]
head = bhead.rstrip('\n')
head = head.replace(bstyles[-1], bstyles[-1] + '\n' + '\n'.join(extra_styles)) if extra_styles else head
open(f'{out}.ass', 'w').write(head + '\n\n[Events]\nFormat: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\n' +
                              '\n'.join(all_dia + credit) + '\n')
plan = []
for tag in [base] + others:
    plan += [l.rstrip('\n').split('\t') for l in open(f'{tag}_plan.tsv') if l.strip()]
plan.sort(key=lambda r: float(r[1]))
open(f'{out}_plan.tsv', 'w').write(''.join('\t'.join(r) + '\n' for r in plan))
print(f'§NARR_MERGE runs={1 + len(others)} rows={len(plan)} dialogue={len(all_dia)} styles={len(bstyles) + len(extra_styles)} out={out}')
