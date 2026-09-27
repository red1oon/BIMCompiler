#!/bin/bash
# TASK 2 spec data on look 808f578f (:8630 = B1 reach 2): per building fgeo (BVH) + reachdist (under-reading by reach r);
# Hospital: darkreach at red1's 3 aerial poses (438202002, 449862668, 465616826)
S=/tmp/claude-1000/-home-red1-bim-compiler/cdf78573-99d9-42cf-92e2-f64ba3732e60/scratchpad
RE='§LIGHT_ZONE|§GLARE|§SKY_SHELL|§STILL_STAGE_MS|§GI_STILL result|§FAULT|PAGEERROR|Shader Error'
op() { curl -s --max-time 60 localhost:8631/close >/dev/null; curl -s --max-time 500 "localhost:8631/open?port=${PORT:-8630}&db=$1&q=$2&reload=1" | tr -d '\n' | cut -c1-120; echo; }
al() { curl -s -G --max-time 700 "localhost:8631/alts" --data-urlencode "cam=$2" --data-urlencode "tgt=$3" --data-urlencode "gi=$4" --data-urlencode "re=$RE" > $S/$1.log; echo "$1 $(grep -o 'compositeMean=[0-9.]*\|§SKY_SHELL_RAYS bld=[^"]\{0,200\}' $S/$1.log | tr '\n' ' ')"; }
ev() { curl -s --max-time 900 -X POST localhost:8631/eval --data-binary @$2 > $S/$1.log; }
T=${TAG:-r2}
op Hospital '%26ghost%3D1'; al reach_${T}_hosp_a1 '[-44.334,20.357,48.696]' '[-2.924,-11.908,7.912]' 1
ev reach_${T}_hosp_fgeo $S/fgeo.js; ev reach_${T}_hosp_dist $S/reachdist.js; ev reach_${T}_hosp_dark_a1 $S/darkreach.js
op Hospital '%26ghost%3D1'; al reach_${T}_hosp_a2 '[-41.633,17.723,25.635]' '[-1.62,-5.131,2.23]' 1; ev reach_${T}_hosp_fgeo2 $S/fgeo.js; ev reach_${T}_hosp_dark_a2 $S/darkreach.js
op Hospital '%26ghost%3D1'; al reach_${T}_hosp_a3 '[26.431,36.87,42.209]' '[-4.751,-4.707,11.027]' 1; ev reach_${T}_hosp_fgeo3 $S/fgeo.js; ev reach_${T}_hosp_dark_a3 $S/darkreach.js
op Clinic '%26ghost%3D1'; al reach_${T}_clinic '[21.243,-0.606,-1.261]' '[1.197,-4.155,-2.608]' 0; ev reach_${T}_clinic_fgeo $S/fgeo.js; ev reach_${T}_clinic_dist $S/reachdist.js
op Terminal ''; al reach_${T}_term '[7.473,-7.532,1.036]' '[6.397,-8.016,3.054]' 0; ev reach_${T}_term_fgeo $S/fgeo.js; ev reach_${T}_term_dist $S/reachdist.js
echo "== reach done $(date +%T)"
