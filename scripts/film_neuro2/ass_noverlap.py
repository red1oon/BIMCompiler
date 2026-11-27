#!/usr/bin/env python3
# ⚠ DO NOT REMOVE — Scope: "Think Global, Act Local" captions (§16). rc2 defect: a caption piece still on screen when the next starts makes libass STACK
# them, which lifts the text over each card's source line. Each Dialogue's end is clamped to the next Dialogue's start (in start order). The speech is not
# touched. Prints §ASS_NOVERLAP events=N clamped=K max_overlap_s=X. READ THE LOG.
import re, sys
p = sys.argv[1]; L = open(p, encoding='utf-8').read().split('\n')
t = lambda s: (lambda h, m, x: int(h) * 3600 + int(m) * 60 + float(x))(*s.split(':'))
f = lambda v: '%d:%02d:%05.2f' % (int(v // 3600), int(v % 3600 // 60), v % 60)
idx = [i for i, l in enumerate(L) if l.startswith('Dialogue:')]
ev = sorted(idx, key=lambda i: t(L[i].split(',')[1]))
k = 0; mx = 0.0
for a, b in zip(ev, ev[1:]):
    pa = L[a].split(',', 9); s2 = t(L[b].split(',')[1]); e1 = t(pa[2])
    if e1 > s2 - 0.01:
        mx = max(mx, e1 - s2); pa[2] = f(max(t(pa[1]) + 0.1, s2 - 0.02)); L[a] = ','.join(pa); k += 1
open(p, 'w', encoding='utf-8').write('\n'.join(L))
left = sum(1 for a, b in zip(ev, ev[1:]) if t(L[a].split(',')[2]) > t(L[b].split(',')[1]))
print('§ASS_NOVERLAP events=%d clamped=%d max_overlap_s=%.2f overlaps_left=%d %s' % (len(idx), k, mx, left, 'PASS' if left == 0 and idx else 'FAIL'))
sys.exit(0 if left == 0 and idx else 1)
