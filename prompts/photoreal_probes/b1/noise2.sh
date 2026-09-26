#!/bin/bash
# before-tree (def9c79b): Hospital aerial cold first press + px<=15, then warm (IDB-hit) re-press — same-conditions W2/W6 baseline
S=/tmp/claude-1000/-home-red1-bim-compiler/cdf78573-99d9-42cf-92e2-f64ba3732e60/scratchpad; P=/home/red1/bim-compiler/prompts/photoreal_probes
RE='§LIGHT_ZONE|§GLARE|§SKY_VIEW_FIELD on|§SKY_SHELL|§STILL_STAGE_MS|§GI_STILL result|§FAULT|§METER camera|§ZONE_IDB_CACHE|PAGEERROR|Shader Error'
alts() { echo "== $1 alts $(date +%T)"; curl -s -G --max-time 700 "localhost:8631/alts" --data-urlencode "cam=$2" --data-urlencode "tgt=$3" --data-urlencode "gi=$4" --data-urlencode "re=$RE" > $S/$1.log; grep -o '"verdict": "[^"]*"\|compositeMean=[0-9.]*\|appMean=[0-9.]*\|stagingTotal=[0-9]*' $S/$1.log | tr '\n' ' '; echo; }
open() { [ "$3" = warm ] || curl -s --max-time 60 localhost:8631/close >/dev/null; echo "== open $1 $2 $(date +%T)"; curl -s --max-time 500 "localhost:8631/open?port=8630&db=$1&q=$2&reload=1" | tr -d '\n' | cut -c1-160; echo; }
dark() { curl -s --max-time 300 -X POST localhost:8631/eval --data-binary @$P/dark_cls.js > $S/$1_darkcls.log; grep -o '"darkPct": [0-9.]*' $S/$1_darkcls.log; }
open Hospital '%26ghost%3D1'; alts noise_hospital_aerial_r2 '[-44.334,20.357,48.696]' '[-2.924,-11.908,7.912]' 1; dark noise_hospital_aerial_r2
curl -s --max-time 60 -X POST localhost:8631/eval --data-binary @$S/bvhtest.js > $S/bvhtest.log; cat $S/bvhtest.log | tr -d '\n'; echo
open Hospital '%26ghost%3D1' warm; alts noise_hospital_warm_aerial '[-44.334,20.357,48.696]' '[-2.924,-11.908,7.912]' 1; dark noise_hospital_warm_aerial
echo "== noise2 done $(date +%T)"
