#!/bin/bash
# W2 A/B on the after tree: &skyshell=0 (= the before field) vs default at red1's aerial pose, 2 cold first presses each, px<=15 composite + app-only
S=/tmp/claude-1000/-home-red1-bim-compiler/cdf78573-99d9-42cf-92e2-f64ba3732e60/scratchpad; P=/home/red1/bim-compiler/prompts/photoreal_probes
RE='§LIGHT_ZONE|§GLARE|§SKY_VIEW_FIELD on|§SKY_SHELL|§STILL_STAGE_MS|§GI_STILL result|§FAULT|§METER camera|§ZONE_IDB_CACHE|PAGEERROR|Shader Error'
for R in 1 2; do for SH in 0 1; do Q='%26ghost%3D1'; [ $SH = 0 ] && Q="$Q%26skyshell%3D0"; T=w2ab_sh${SH}_r${R}
  curl -s --max-time 60 localhost:8631/close >/dev/null; curl -s --max-time 500 "localhost:8631/open?port=8630&db=Hospital&q=$Q&reload=1" | tr -d '\n' | cut -c1-150; echo
  curl -s -G --max-time 700 "localhost:8631/alts" --data-urlencode "cam=[-44.334,20.357,48.696]" --data-urlencode "tgt=[-2.924,-11.908,7.912]" --data-urlencode "gi=1" --data-urlencode "re=$RE" > $S/$T.log
  echo "$T $(grep -o 'compositeMean=[0-9.]*\|stagingTotal=[0-9]*\|§SKY_SHELL_RAYS bld=[A-Za-z]* cache=[a-z]* [a-z]*' $S/$T.log | tr '\n' ' ')"
  curl -s --max-time 300 -X POST localhost:8631/eval --data-binary @$P/dark_cls.js > $S/${T}_darkcls.log; curl -s --max-time 120 -X POST localhost:8631/eval --data-binary @$S/darkapp.js > $S/${T}_darkapp.log; tr -d '\n ' < $S/${T}_darkapp.log; echo
  if [ $R = 1 ]; then curl -s --max-time 600 -X POST localhost:8631/eval --data-binary @$P/skycheck.js > $S/${T}_skycheck.log; node -e "const r=JSON.parse(require('fs').readFileSync('$S/${T}_skycheck.log')).result; const f=r.filter(x=>x.col==='707f8e'); console.log('skycheck 707f8e rows', f.length, 'F', f.map(x=>typeof x.F==='object'?x.F.F.toFixed(2):x.F).join(' '), 'geom', f.map(x=>x.geomSky).join(' '))"; fi
done; done
echo "== w2ab done $(date +%T)"
