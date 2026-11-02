#!/usr/bin/env python3
# usage: beatmin.py <measure.log> <out.json> : seconds each beat is held in the recording = its DETAIL speech + 1.0 s (0.3 s fitter pad + 0.7 s air); the last beat gets a 4.5 s tail for the credit line
import sys, re, json
d = {}
for l in open(sys.argv[1]):
    m = re.match(r'§NARR_FIT (\S+) cue=\S+ room=\S+ dur=([\d.]+) -> (\S+)', l)
    if m:
        assert m.group(3) == 'DETAIL', l
        d[m.group(1)] = round(float(m.group(2)) + 1.0, 2)
ids = list(d)
d[ids[-1]] = round(d[ids[-1]] + 3.5, 2)
json.dump(d, open(sys.argv[2], 'w')); print('§BEATMIN', json.dumps(d), 'sum=%.1f' % sum(d.values()))
