#!/usr/bin/env python3
# ⚠ DO NOT REMOVE — Scope: per-chapter narration duration of script6.md with the PLAYBOOK voices (Kokoro v1.0, F af_heart x1.03, M am_michael x0.97, base speed 1.15), CPU only, NO mux, NO ~/Videos output.
# Facts are spelled with their CURRENT resolved values (facts6.resolved.json); pending [IF ...] branches are dropped (their ELSE text is used when present) = the BASELINE script. READ THE LOG (logs/beatmin6.log): §BEATMIN lines.
# Run: ~/.local/share/film_narration/venv/bin/python beatmin6.py
import re, json, sys, os, time
import numpy as np
from kokoro_onnx import Kokoro
H = os.path.dirname(os.path.abspath(__file__)); K = os.path.expanduser('~/.local/share/film_narration/kokoro/')
k = Kokoro(K + 'kokoro-v1.0.onnx', K + 'voices-v1.0.bin'); SR = 24000
VOX = {'F': 'af_heart', 'M': 'am_michael'}; SPK = {'F': 1.03, 'M': 0.97}; BASE = 1.15
X = json.load(open(os.path.join(H, 'facts6.resolved.json')))
ONES = 'zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen'.split(); TENS = 'x x twenty thirty forty fifty sixty seventy eighty ninety'.split()
def w(n):
    if n < 20: return ONES[n]
    if n < 100: return TENS[n // 10] + ('-' + ONES[n % 10] if n % 10 else '')
    if n < 1000: return ONES[n // 100] + ' hundred' + (' ' + w(n % 100) if n % 100 else '')
    return w(n // 1000) + ' thousand' + (' ' + w(n % 1000) if n % 1000 else '')
def say_num(v):
    v = str(v)
    if not re.match(r'^-?\d+(\.\d+)?$', v): return v
    neg = v.startswith('-'); v = v.lstrip('-'); a, _, b = v.partition('.'); s = w(int(a)) + (' point ' + ' '.join(ONES[int(c)] for c in b) if b else '')
    return ('minus ' if neg else '') + s
def fact(m):
    f = X[m.group(1)]
    return 'FACT-PENDING' if f['status'] in ('pending', 'MISSING') else say_num(f['value'])
text = open(os.path.join(H, 'script6.md'), encoding='utf8').read()
chap = {}; cur = None; order = []; skipM = False
for line in text.split('\n'):
    h = re.match(r'^## (\S+)\.', line)
    if h: cur = h.group(1); chap[cur] = []; order.append(cur); continue
    if cur is None: continue
    st = line.strip()
    if st.startswith('[ELSE'):                                  # ELSE text of an IF line that was dropped: use it only when it is spoken text on the same logical turn
        m = re.match(r'\[ELSE\]\s*(Today the twin posts.*)', st)
        if m: chap[cur].append(('M', m.group(1)))
        continue
    if re.match(r'^\[IF', st) : continue
    if st.startswith('F: Could the same slip be paid twice?'): continue
    if re.match(r'^M: \[IF', st): continue
    if not re.search(r'(^|\s)(F|M):\s', line): continue
    line = re.sub(r'\[IF[^\]]*\]', '', line)                    # an IF bracket in the middle of a spoken line
    for m in re.finditer(r'(?:^|\s)(F|M):\s+(.*?)(?=\s(?:F|M):\s|$)', line):
        t = re.sub(r'\{claim:[^}]+\}', '', m.group(2)); t = re.sub(r'\{fact:([^}]+)\}', fact, t).strip()
        if t: chap[cur].append((m.group(1), t))
def gap(prev): p = prev.rstrip(); return 0.40 if p.endswith('?') else 0.28 if p.endswith('!') else 0.22
res = {}; tot = 0.0; words = 0
for c in order:
    d = 0.0; prev = None
    for who, t in chap[c]:
        if 'FACT-PENDING' in t: print(f'§BEATMIN WARN chapter {c}: pending fact left in spoken text: {t[:60]}'); t = t.replace('FACT-PENDING', 'pending')
        a, _ = k.create(t, voice=VOX[who], speed=BASE * SPK[who], lang='en-us'); d += len(a) / SR + (gap(prev) if prev else 0); prev = t; words += len(t.split())
    res[c] = round(d, 2); tot += d; print(f'§BEATMIN {c} turns={len(chap[c])} seconds={d:.2f}')
print(f'§BEATMIN_TOTAL speech_seconds={tot:.1f} ({tot/60:.2f} min) words={words}  (baseline: pending branches dropped; plus card holds and the final 6 s hold not included)')
json.dump({'_note': 'seconds of speech per chapter, Kokoro CPU, base speed 1.15; a card beat is held at least this long; baseline script (pending IF branches dropped)', 'seconds': res, 'total': round(tot, 2)}, open(os.path.join(H, 'beatmin6.json'), 'w'), indent=1)
