#!/bin/bash
# attempt-1 A/B: &capcentre=0 (every SOLID cell roofs its column) vs default, zone stats + GLARE + px<=15 at red1's pose; cold each
S=/tmp/claude-1000/-home-red1-bim-compiler/cdf78573-99d9-42cf-92e2-f64ba3732e60/scratchpad; P=/home/red1/bim-compiler/prompts/photoreal_probes
RE='§LIGHT_ZONE|§GLARE|§SKY_VIEW_FIELD on|§SKY_SHELL|§STILL_STAGE_MS|§GI_STILL result|§FAULT|§METER camera|§ZONE_IDB_CACHE|PAGEERROR|Shader Error'
open() { curl -s --max-time 60 localhost:8631/close >/dev/null; echo "== open $1 $2 $(date +%T)"; curl -s --max-time 500 "localhost:8631/open?port=8630&db=$1&q=$2&reload=1" | tr -d '\n' | cut -c1-160; echo; }
alts() { echo "== $1 alts $(date +%T)"; curl -s -G --max-time 700 "localhost:8631/alts" --data-urlencode "cam=$2" --data-urlencode "tgt=$3" --data-urlencode "gi=$4" --data-urlencode "re=$RE" > $S/$1.log; grep -o '"verdict": "[^"]*"\|compositeMean=[0-9.]*\|stagingTotal=[0-9]*\|"zones":[0-9]*\|"indoorCells":[0-9]*\|"largestZoneM3":[0-9]*\|"capCentre":[0-9]\|"capSkipped":[0-9]*\|GLARE bld=[A-Za-z]* [A-Z]*' $S/$1.log | tr '\n' ' '; echo; }
dark() { curl -s --max-time 300 -X POST localhost:8631/eval --data-binary @$P/dark_cls.js > $S/$1_darkcls.log; grep -o '"darkPct": [0-9.]*' $S/$1_darkcls.log; }
cells() { { echo "window.__b1pts = $2;"; cat $S/cells.js; } | curl -s --max-time 120 -X POST localhost:8631/eval --data-binary @- > $S/$1_cells.log; node -e "const r=JSON.parse(require('fs').readFileSync('$S/$1_cells.log')); console.log('$1 cells', r.result ? JSON.stringify(r.result.rows) : JSON.stringify(r))"; }
for CC in 0 1; do Q='%26ghost%3D1'; [ $CC = 0 ] && Q="$Q%26capcentre%3D0"
  open Hospital "$Q"; alts abcap${CC}_hospital_aerial '[-44.334,20.357,48.696]' '[-2.924,-11.908,7.912]' 1; dark abcap${CC}_hospital_aerial
  cells abcap${CC}_hospital "[['red1aerial',-44.334,20.357,48.696],['innerroom',9.947,-7.699,0.098],['outsidein',-5.529,-0.544,-42.321]]"
  Q='%26ghost%3D1'; [ $CC = 0 ] && Q="$Q%26capcentre%3D0"
  open Clinic "$Q"; alts abcap${CC}_clinic_corridor '[21.243,-0.606,-1.261]' '[1.197,-4.155,-2.608]' 0; cells abcap${CC}_clinic "[['corridor',21.243,-0.606,-1.261]]"
  Q=''; [ $CC = 0 ] && Q='%26capcentre%3D0'
  open Terminal "$Q"; alts abcap${CC}_terminal_inside '[7.473,-7.532,1.036]' '[6.397,-8.016,3.054]' 0; cells abcap${CC}_terminal "[['inside',7.473,-7.532,1.036]]"
done
echo "== abcap done $(date +%T)"
