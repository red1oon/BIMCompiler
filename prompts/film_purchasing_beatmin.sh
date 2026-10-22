#!/bin/bash
# usage: film_purchasing_beatmin.sh <tsv>   → prints the BEAT_MIN json (speech + 0.8 s per beat) from film_narration_poly.py measure, for scripts/film_erp_purchasing.js
set -e; TSV=$1; W=~/Videos/purchasing_work; cd $W; rm -rf meas_bm
for i in 1 2 3 4 5; do python3 ~/bim-compiler/prompts/film_narration_poly.py $TSV measure meas_bm 900 > meas_bm.log 2>&1; grep -q "lang=en wrong=0 rc=0" meas_bm.log && break; sleep 3; done
python3 - <<'PY'
import re, json, os
d = {}
for l in open(os.path.expanduser('~/Videos/purchasing_work/meas_bm.log')):
    m = re.search(r'POLY_DUR id=(\S+) .*?dur=([\d.]+)', l)
    if m and m.group(1) not in ('r0', 'p'): d[m.group(1)] = round(float(m.group(2)) + 0.8, 2)
print(json.dumps(d))
PY
