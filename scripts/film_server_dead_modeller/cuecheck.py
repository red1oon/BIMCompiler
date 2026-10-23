# cuecheck.py <tag> <refs.json> : speech onset of every row (first |sample| > 0.02 in its wav, + its mux delay) vs the recorded reading it is pinned to.
import sys, json, numpy as np, soundfile as sf
tag, refs = sys.argv[1:3]; R = {r['id']: r for r in json.load(open(refs))}; mx = 0; n = 0; bad = []
for l in open(f'{tag}_plan.tsv'):
    i, cue, wav = l.rstrip('\n').split('\t'); a, sr = sf.read(wav); a = a if a.ndim == 1 else a[:, 0]
    on = float(np.argmax(np.abs(a) > 0.02)) / sr; t = float(cue) + on; d = t - R[i]['ref_t']; n += 1; mx = max(mx, abs(d))
    print('%-8s ref %-44s ref_t %7.2f  speech onset %7.2f  delta %+5.2f' % (i, R[i]['ref'], R[i]['ref_t'], t, d))
    if abs(d) > 1.0: bad.append(i)
print('§CUECHECK rows=%d max|delta|=%.2f s  >1.0 s: %s' % (n, mx, bad or 'none'))
