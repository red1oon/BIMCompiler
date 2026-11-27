#!/bin/bash
S=/tmp/claude-1000/-home-red1-bim-compiler/cdf78573-99d9-42cf-92e2-f64ba3732e60/scratchpad
RE='§LIGHT_ZONE|§GLARE|§SKY_VIEW_FIELD on|§SKY_SHELL|§GROUND_VIEW_FIELD on|§STILL_STAGE_MS|§GI_STILL result|§FAULT|§METER camera|§ZONE_IDB_CACHE|PAGEERROR|Shader Error|Context Lost|§LOAD_FAIL'
curl -s --max-time 60 localhost:8631/close >/dev/null
curl -s --max-time 500 "localhost:8631/open?port=8630&db=Hospital&q=%26ghost%3D1&reload=1" | tr -d '\n' | cut -c1-200; echo
curl -s -G --max-time 700 "localhost:8631/alts" --data-urlencode "cam=[-44.334,20.357,48.696]" --data-urlencode "tgt=[-2.924,-11.908,7.912]" --data-urlencode "gi=1" --data-urlencode "re=$RE" > $S/smoke1_hospital_aerial.log
curl -s --max-time 120 -X POST localhost:8631/eval --data-binary @$S/darkapp.js > $S/smoke1_darkapp.log
curl -s --max-time 60 "localhost:8631/lines?re=PAGEERROR|Shader Error|Context Lost|§LOAD_FAIL|§SKY_SHELL&last=20" > $S/smoke1_errs.log
echo done
