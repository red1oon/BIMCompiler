#!/bin/bash
# before-tree noise: repeat approved-ref first presses on fresh pages (def9c79b, unmodified)
S=/tmp/claude-1000/-home-red1-bim-compiler/cdf78573-99d9-42cf-92e2-f64ba3732e60/scratchpad
RE='§LIGHT_ZONE|§GLARE|§SKY_VIEW_FIELD on|§SKY_SHELL|§STILL_STAGE_MS|§GI_STILL result|§FAULT|§METER camera|§ZONE_IDB_CACHE|PAGEERROR|Shader Error'
alts() { echo "== $1 alts $(date +%T)"; curl -s -G --max-time 700 "localhost:8631/alts" --data-urlencode "cam=$2" --data-urlencode "tgt=$3" --data-urlencode "gi=$4" --data-urlencode "re=$RE" > $S/$1.log; grep -o '"verdict": "[^"]*"\|compositeMean=[0-9.]*\|appMean=[0-9.]*\|stagingTotal=[0-9]*' $S/$1.log | tr '\n' ' '; echo; }
open() { curl -s --max-time 60 localhost:8631/close >/dev/null; echo "== open $1 $2 $(date +%T)"; curl -s --max-time 500 "localhost:8631/open?port=8630&db=$1&q=$2&reload=1" | tr -d '\n' | cut -c1-160; echo; }
curl -s --max-time 60 localhost:8631/close; echo
open Clinic '%26ghost%3D1'; alts noise_clinic_corridor_r2 '[21.243,-0.606,-1.261]' '[1.197,-4.155,-2.608]' 1
open Hospital '%26ghost%3D1'; alts noise_hospital_innerroom_r2 '[9.947,-7.699,0.098]' '[14.735,-8.114,2.081]' 1
open Hospital '%26ghost%3D1'; alts noise_hospital_outsidein_r2 '[-5.529,-0.544,-42.321]' '[4.014,-6.761,2.325]' 1
open Terminal ''; alts noise_terminal_inside_r2 '[7.473,-7.532,1.036]' '[6.397,-8.016,3.054]' 1
echo "== noise done $(date +%T)"
