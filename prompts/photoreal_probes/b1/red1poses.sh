#!/bin/bash
# red1's 2026-09-27 stills (v1455, poses from the PNG tEXt): P1 aerial 1790449862668 (exterior B1 pose), P2 1790449885596 (extra REF).
# Arm sh0 = &skyshell=0 (the before field on this tree), sh1 = default. Each press = cold first press on a fresh page (fresh profile).
S=/tmp/claude-1000/-home-red1-bim-compiler/cdf78573-99d9-42cf-92e2-f64ba3732e60/scratchpad; P=/home/red1/bim-compiler/prompts/photoreal_probes
RE='§LIGHT_ZONE|§GLARE|§SKY_VIEW_FIELD on|§SKY_SHELL|§STILL_STAGE_MS|§GI_STILL result|§FAULT|§METER camera|§ZONE_IDB_CACHE|PAGEERROR|Shader Error'
run() { T=$1; Q='%26ghost%3D1'; [ $2 = 0 ] && Q="$Q%26skyshell%3D0"
  curl -s --max-time 60 localhost:8631/close >/dev/null; curl -s --max-time 500 "localhost:8631/open?port=8630&db=Hospital&q=$Q&reload=1" | tr -d '\n' | cut -c1-150; echo
  curl -s -G --max-time 700 "localhost:8631/alts" --data-urlencode "cam=$3" --data-urlencode "tgt=$4" --data-urlencode "gi=1" --data-urlencode "re=$RE" > $S/$T.log
  echo "$T $(grep -o 'compositeMean=[0-9.]*\|appMean=[0-9.]*\|stagingTotal=[0-9]*\|expStep=[0-9.]*\|blown=[0-9.]*%\|§FAULT [A-Z]*\|§SKY_SHELL_RAYS bld=[A-Za-z]* cache=[a-z]* [a-z]*' $S/$T.log | tr '\n' ' ')"
  curl -s --max-time 300 -X POST localhost:8631/eval --data-binary @$P/dark_cls.js > $S/${T}_darkcls.log; curl -s --max-time 120 -X POST localhost:8631/eval --data-binary @$S/darkapp.js > $S/${T}_darkapp.log; tr -d '\n ' < $S/${T}_darkapp.log; echo; }
P1C='[-41.633,17.723,25.635]'; P1T='[-1.62,-5.131,2.23]'; P2C='[-7.307,-6.507,12.017]'; P2T='[-2.403,-7.682,3.378]'
run red1p1_sh0 0 $P1C $P1T; run red1p1_sh1 1 $P1C $P1T
run red1p2_sh0_r1 0 $P2C $P2T; run red1p2_sh0_r2 0 $P2C $P2T; run red1p2_sh1_r1 1 $P2C $P2T; run red1p2_sh1_r2 1 $P2C $P2T
echo "== red1poses done $(date +%T)"
