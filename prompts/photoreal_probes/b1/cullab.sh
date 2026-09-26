#!/bin/bash
# cull A/B: &shellcull=0 vs default, Hospital + Terminal (cold, no GI press needed: gi=0), dump shell-cell G each arm
S=/tmp/claude-1000/-home-red1-bim-compiler/cdf78573-99d9-42cf-92e2-f64ba3732e60/scratchpad
RE='§LIGHT_ZONE|§GLARE|§SKY_SHELL|§STILL_STAGE_MS|§ZONE_IDB_CACHE|PAGEERROR|Shader Error'
for B in Hospital Terminal; do for C in 0 1; do Q=''; [ $B = Hospital ] && Q='%26ghost%3D1'; [ $C = 0 ] && Q="$Q%26shellcull%3D0"
  curl -s --max-time 60 localhost:8631/close >/dev/null; curl -s --max-time 500 "localhost:8631/open?port=8630&db=$B&q=$Q&reload=1" | tr -d '\n' | cut -c1-150; echo
  curl -s -G --max-time 700 "localhost:8631/alts" --data-urlencode "cam=[7.473,-7.532,1.036]" --data-urlencode "tgt=[6.397,-8.016,3.054]" --data-urlencode "gi=0" --data-urlencode "re=$RE" > $S/cull${C}_${B}.log
  grep -o '§SKY_SHELL_RAYS bld[^"]\{0,560\}\|stagingTotal=[0-9]*' $S/cull${C}_${B}.log
  curl -s --max-time 120 -X POST localhost:8631/eval --data-binary @$S/shellG.js > $S/cull${C}_${B}_G.json; done; done
echo "== cullab done $(date +%T)"
