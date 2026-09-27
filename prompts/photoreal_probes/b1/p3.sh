#!/bin/bash
# red1's aerial still 1790465616826 (v1457) + inside ref 1790465698534: first press on look 808f578f (:8630) default arm, dark_cls
S=/tmp/claude-1000/-home-red1-bim-compiler/cdf78573-99d9-42cf-92e2-f64ba3732e60/scratchpad; P=/home/red1/bim-compiler/prompts/photoreal_probes
RE='§LIGHT_ZONE|§GLARE|§SKY_SHELL|§STILL_STAGE_MS|§GI_STILL result|§FAULT|§METER camera|PAGEERROR|Shader Error'
curl -s --max-time 60 localhost:8631/close >/dev/null; curl -s --max-time 500 "localhost:8631/open?port=8630&db=Hospital&q=%26ghost%3D1&reload=1" | tr -d '\n' | cut -c1-120; echo
curl -s -G --max-time 700 "localhost:8631/alts" --data-urlencode "cam=[26.431,36.87,42.209]" --data-urlencode "tgt=[-4.751,-4.707,11.027]" --data-urlencode "gi=1" --data-urlencode "re=$RE" > $S/p3_v1457.log
echo "p3_v1457 $(grep -o 'compositeMean=[0-9.]*\|§FAULT [A-Z]*\|dark=[0-9.]*%' $S/p3_v1457.log | tr '\n' ' ')"
curl -s --max-time 300 -X POST localhost:8631/eval --data-binary @$P/dark_cls.js > $S/p3_v1457_darkcls.log; curl -s --max-time 120 -X POST localhost:8631/eval --data-binary @$S/darkapp.js | tr -d '\n '; echo
node -e "const r=JSON.parse(require('fs').readFileSync('$S/p3_v1457_darkcls.log')).result; console.log(r.darkPx, r.darkPct, r.sampled); console.log(r.rows.join('\n'))"
echo "== p3 done $(date +%T)"
