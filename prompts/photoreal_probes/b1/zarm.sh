#!/bin/bash
# zarm.sh <prefix> <port> <extraQ> <poses>: fresh-profile first press per pose; Z §-lines, lum.js, zpatch.js, then Esc + restore lines
S=/tmp/claude-1000/-home-red1-bim-compiler/cdf78573-99d9-42cf-92e2-f64ba3732e60/scratchpad; PFX=$1; PORT=$2; XQ=$3; PF=$4
RE='§METER|§GLARE|§GI_STILL|§FAULT |§STILL_STAGE_MS|§ALBEDO_SRGB|§AO_INDIRECT|§PHOTO_AO|§GI_RECEIVER_ALBEDO|§GI_PRESS_COST|§GROUND_HALF|§SUN_PENUMBRA|§STILL_BASE|§TAA|§STILL_REFINE|§LIGHT_LAW|PAGEERROR|Shader Error'
while IFS='|' read -r N DB Q C T; do [ -z "$N" ] && continue; L=$S/${PFX}_$N
  curl -s --max-time 60 localhost:8631/close >/dev/null; SW=$(curl -s localhost:$PORT/viewer/sw.js | grep -o "CACHE_VERSION = '[^']*'" | head -1 | tr -d "'")
  curl -s --max-time 500 "localhost:8631/open?port=$PORT&db=$DB&q=$Q$XQ&reload=1" > /dev/null
  curl -s -G --max-time 700 "localhost:8631/alts" --data-urlencode "cam=$C" --data-urlencode "tgt=$T" --data-urlencode "gi=1" --data-urlencode "re=$RE" > $L.log
  curl -s --max-time 120 -X POST localhost:8631/eval --data-binary @$S/lum.js > ${L}_lum.log
  curl -s --max-time 300 -X POST localhost:8631/eval --data-binary @$S/zpatch.js > ${L}_zpatch.log
  curl -s --max-time 30 "localhost:8631/key?k=Escape&wait=3000" > /dev/null; curl -s --max-time 30 "localhost:8631/lines?re=%C2%A7ALBEDO_SRGB&last=6" > ${L}_esc.log
  echo "$PFX $N [$SW] $(grep -o 'compositeMean=[0-9.]*' $L.log | head -1) $(tr -d '\n ' < ${L}_lum.log | grep -o '"programs":[0-9]*')"
done < $PF
echo "== $PFX done $(date +%T)"
