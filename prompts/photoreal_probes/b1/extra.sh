#!/bin/bash
# (1) 707f8e skycheck cells: F before (skyshell=0) vs after + shell membership + 256-ray truth; (2) independent W1 truth (mc 256, seed 11);
# (3) Terminal inside ref: 2 more cold first presses per arm (is +0.6 the fix or noise?)
S=/tmp/claude-1000/-home-red1-bim-compiler/cdf78573-99d9-42cf-92e2-f64ba3732e60/scratchpad
RE='§LIGHT_ZONE|§GLARE|§SKY_VIEW_FIELD on|§SKY_SHELL|§STILL_STAGE_MS|§GI_STILL result|§FAULT|§METER camera|§ZONE_IDB_CACHE|PAGEERROR|Shader Error'
op() { curl -s --max-time 60 localhost:8631/close >/dev/null; curl -s --max-time 500 "localhost:8631/open?port=8630&db=$1&q=$2&reload=1" | tr -d '\n' | cut -c1-150; echo; }
al() { curl -s -G --max-time 700 "localhost:8631/alts" --data-urlencode "cam=$2" --data-urlencode "tgt=$3" --data-urlencode "gi=$4" --data-urlencode "re=$RE" > $S/$1.log; echo "$1 $(grep -o 'compositeMean=[0-9.]*\|appMean=[0-9.]*\|stagingTotal=[0-9]*\|§SKY_SHELL_RAYS bld=[A-Za-z]* cache=[a-z]* [a-z]*' $S/$1.log | tr '\n' ' ')"; }
for SH in 1 0; do Q='%26ghost%3D1'; [ $SH = 0 ] && Q="$Q%26skyshell%3D0"
  op Hospital "$Q"; al x_sh${SH}_hosp '[-44.334,20.357,48.696]' '[-2.924,-11.908,7.912]' 0
  curl -s --max-time 900 -X POST localhost:8631/eval --data-binary @<(echo "window.__b1opt={mc:256,seed:11};"; cat $S/fgeo.js) > $S/x_sh${SH}_hosp_fgeo256.log
  node -e "const r=JSON.parse(require('fs').readFileSync('$S/x_sh${SH}_hosp_fgeo256.log')).result; console.log('fgeo256 sh$SH ext', JSON.stringify(r.COVERED_exterior_geoMC_gt_0_2), 'le', JSON.stringify(r.COVERED_geoMC_le_0_2))"
  curl -s --max-time 300 -X POST localhost:8631/eval --data-binary @<(echo "window.__cells=$(cat $S/cells707.txt);"; cat $S/cellprobe.js) > $S/x_sh${SH}_cells707.log
done
for SH in 1 0; do for R in 1 2; do Q=''; [ $SH = 0 ] && Q='%26skyshell%3D0'; op Terminal "$Q"; al x_term_sh${SH}_r$R '[7.473,-7.532,1.036]' '[6.397,-8.016,3.054]' 1; done; done
echo "== extra done $(date +%T)"
