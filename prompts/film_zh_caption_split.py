# ⚠ DO NOT REMOVE — scope: FILM_NARRATION.md ▶ PLAYBOOK C (red1, 2026-11-02, Mandarin: "break up the captions … so that it does not display too much and obscure graphs").
# Splits every F/M Dialogue line of a fitted .ass at Chinese punctuation (，。？！；：) into pieces of ≤ MAX characters, each timed in proportion to its characters, inside the line's own window.
# usage: python3 film_zh_caption_split.py <in.ass> <out.ass> [MAX=20]   → prints §ZH_CAPTIONS in=… out=… longest_chars=… (read it). Run BEFORE film_narration_mux.py (mux reads <tag>.ass).
import re, sys
src, dst = sys.argv[1], sys.argv[2]; MAX = int(sys.argv[3]) if len(sys.argv) > 3 else 20
def ts2s(t): h, m, s = t.split(':'); return int(h) * 3600 + int(m) * 60 + float(s)
def s2ts(x): return f'{int(x // 3600)}:{int(x % 3600 // 60):02d}:{x % 60:05.2f}'
out, n_in, n_out, longest = [], 0, 0, 0
for l in open(src).read().split('\n'):
    m = re.match(r'^(Dialogue: \d+,)([^,]+),([^,]+),(F|M),([^,]*),(\d+,\d+,\d+,[^,]*,)(.*)$', l)
    if not m: out.append(l); continue
    n_in += 1; pre, a, b, sty, name, mid, txt = m.groups(); a, b = ts2s(a), ts2s(b)
    chunks = []
    for p in [p for p in re.split(r'(?<=[，。？！；：、])', txt) if p]:
        if chunks and len(chunks[-1]) + len(p) <= MAX: chunks[-1] += p
        else: chunks.append(p)
    tot, t = sum(len(c) for c in chunks), a
    for c in chunks:
        d = (b - a) * len(c) / tot; out.append(f'{pre}{s2ts(t)},{s2ts(t + d)},{sty},{name},{mid}{c}'); t += d; n_out += 1; longest = max(longest, len(c))
open(dst, 'w').write('\n'.join(out)); print(f'§ZH_CAPTIONS in={n_in} out={n_out} longest_chars={longest}')
