#!/bin/bash
S=/tmp/claude-1000/-home-red1-bim-compiler/cdf78573-99d9-42cf-92e2-f64ba3732e60/scratchpad
RE='§LIGHT_ZONE|§GLARE|§SKY_VIEW_FIELD on|§SKY_SHELL|§STILL_STAGE_MS|§GI_STILL result|§FAULT|§METER camera|§ZONE_IDB_CACHE|PAGEERROR|Shader Error'
cells() { { echo "window.__b1pts = $2;"; cat $S/cells.js; } | curl -s --max-time 120 -X POST localhost:8631/eval --data-binary @- > $S/$1_cells.log; node -e "const r=JSON.parse(require('fs').readFileSync('$S/$1_cells.log')); console.log('$1 cells', r.result ? JSON.stringify(r.result.rows) : JSON.stringify(r))"; }
alts() { echo "== $1 alts $(date +%T)"; curl -s -G --max-time 700 "localhost:8631/alts" --data-urlencode "cam=$2" --data-urlencode "tgt=$3" --data-urlencode "gi=$4" --data-urlencode "re=$RE" > $S/$1.log; grep -o '"verdict": "[^"]*"\|compositeMean=[0-9.]*\|appMean=[0-9.]*\|stagingTotal=[0-9]*' $S/$1.log | tr '\n' ' '; echo; }
open() { echo "== open $1 $2 $(date +%T)"; curl -s --max-time 500 "localhost:8631/open?port=8630&db=$1&q=$2&reload=1" | tr -d '\n' | cut -c1-160; echo; }
cells terminal_before "[['inside',7.473,-7.532,1.036]]"
open Hospital '%26ghost%3D1'; alts hospital_before_fresh_innerroom '[9.947,-7.699,0.098]' '[14.735,-8.114,2.081]' 1
open Hospital '%26ghost%3D1'; alts hospital_before_fresh_outsidein '[-5.529,-0.544,-42.321]' '[4.014,-6.761,2.325]' 1
open Clinic '%26ghost%3D1'; alts clinic_before_zoneonly '[21.243,-0.606,-1.261]' '[1.197,-4.155,-2.608]' 0; cells clinic_before "[['corridor',21.243,-0.606,-1.261]]"
echo "== before2 done $(date +%T)"
