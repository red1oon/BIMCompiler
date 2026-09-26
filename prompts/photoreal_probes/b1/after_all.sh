#!/bin/bash
# AFTER witnesses on the B1 tree (:8630). Every ref is a FIRST press on a fresh page (fresh puppeteer profile = no IDB record).
S=/tmp/claude-1000/-home-red1-bim-compiler/cdf78573-99d9-42cf-92e2-f64ba3732e60/scratchpad; P=/home/red1/bim-compiler/prompts/photoreal_probes
RE='§LIGHT_ZONE|§GLARE|§SKY_VIEW_FIELD on|§SKY_SHELL|§STILL_STAGE_MS|§GI_STILL result|§FAULT|§METER camera|§ZONE_IDB_CACHE|PAGEERROR|Shader Error'
cells() { { echo "window.__b1pts = $2;"; cat $S/cells.js; } | curl -s --max-time 120 -X POST localhost:8631/eval --data-binary @- > $S/$1_cells.log; node -e "const r=JSON.parse(require('fs').readFileSync('$S/$1_cells.log')); console.log('$1 cells', r.result ? JSON.stringify(r.result.rows) : JSON.stringify(r))"; }
alts() { echo "== $1 alts $(date +%T)"; curl -s -G --max-time 700 "localhost:8631/alts" --data-urlencode "cam=$2" --data-urlencode "tgt=$3" --data-urlencode "gi=$4" --data-urlencode "re=$RE" > $S/$1.log; grep -o '"verdict": "[^"]*"\|compositeMean=[0-9.]*\|appMean=[0-9.]*\|stagingTotal=[0-9]*\|§SKY_SHELL_RAYS bld=[^"]\{0,330\}' $S/$1.log | tr '\n' ' ' | cut -c1-600; echo; }
open() { echo "== open $1 $2 $(date +%T)"; curl -s --max-time 500 "localhost:8631/open?port=8630&db=$1&q=$2&reload=1" | tr -d '\n' | cut -c1-160; echo; }
fgeo() { echo "== $1 fgeo $(date +%T)"; curl -s --max-time 900 -X POST localhost:8631/eval --data-binary @$S/fgeo.js > $S/$1_fgeo.log; node -e "const r=JSON.parse(require('fs').readFileSync('$S/$1_fgeo.log')).result; if(!r){console.log('fgeo ERROR');process.exit()} console.log('ext', JSON.stringify(r.COVERED_exterior_geoMC_gt_0_2), 'dark', JSON.stringify(r.COVERED_geoMC_le_0_2.dF_minus_geoMC), r.totalMs, 'ms')"; }
dark() { curl -s --max-time 300 -X POST localhost:8631/eval --data-binary @$P/dark_cls.js > $S/$1_darkcls.log; grep -o '"darkPct": [0-9.]*' $S/$1_darkcls.log; }
T=${TAG:-after}
# Hospital: red1's aerial pose first press + px<=15 + skycheck + fgeo + cells
open Hospital '%26ghost%3D1'; alts hospital_${T}_aerial '[-44.334,20.357,48.696]' '[-2.924,-11.908,7.912]' 1; dark hospital_${T}_aerial
curl -s --max-time 600 -X POST localhost:8631/eval --data-binary @$P/skycheck.js > $S/hospital_${T}_skycheck.log; node -e "const r=JSON.parse(require('fs').readFileSync('$S/hospital_${T}_skycheck.log')).result; const f=r.filter(x=>x.col==='707f8e'); console.log('skycheck 707f8e rows', f.length, 'F', f.map(x=>typeof x.F==='object'?x.F.F.toFixed(2):x.F).join(' '), 'geom', f.map(x=>x.geomSky).join(' '))"
fgeo hospital_${T}; cells hospital_${T} "[['red1aerial',-44.334,20.357,48.696],['innerroom',9.947,-7.699,0.098],['outsidein',-5.529,-0.544,-42.321]]"
open Hospital '%26ghost%3D1'; alts hospital_${T}_fresh_innerroom '[9.947,-7.699,0.098]' '[14.735,-8.114,2.081]' 1
open Hospital '%26ghost%3D1'; alts hospital_${T}_fresh_outsidein '[-5.529,-0.544,-42.321]' '[4.014,-6.761,2.325]' 1
# Clinic corridor first press + fgeo + cells
open Clinic '%26ghost%3D1'; alts clinic_${T}_corridor '[21.243,-0.606,-1.261]' '[1.197,-4.155,-2.608]' 1; dark clinic_${T}_corridor; fgeo clinic_${T}; cells clinic_${T} "[['corridor',21.243,-0.606,-1.261]]"
# Terminal inside first press + fgeo + cells
open Terminal ''; alts terminal_${T}_inside '[7.473,-7.532,1.036]' '[6.397,-8.016,3.054]' 1; dark terminal_${T}_inside; fgeo terminal_${T}; cells terminal_${T} "[['inside',7.473,-7.532,1.036]]"
echo "== $T done $(date +%T)"
