#!/bin/bash
S=/tmp/claude-1000/-home-red1-bim-compiler/cdf78573-99d9-42cf-92e2-f64ba3732e60/scratchpad
# Hospital page is already open (ghost=1): refs only (no re-open) — use measure-like alts calls directly
RE='%C2%A7LIGHT_ZONE%7C%C2%A7GLARE%7C%C2%A7SKY_VIEW_FIELD%20on%7C%C2%A7STILL_STAGE_MS%7C%C2%A7GI_STILL%20result%7C%C2%A7FAULT%7C%C2%A7METER%20camera%7C%C2%A7ZONE_IDB_CACHE%7CPAGEERROR%7CShader%20Error'
for L in 'innerroom|%5B9.947,-7.699,0.098%5D|%5B14.735,-8.114,2.081%5D' 'outsidein|%5B-5.529,-0.544,-42.321%5D|%5B4.014,-6.761,2.325%5D'; do IFS='|' read -r NAME CAM TGT <<< "$L"
  echo "== hospital_before alts $NAME $(date +%T)"; curl -s --max-time 700 "localhost:8631/alts?cam=$CAM&tgt=$TGT&gi=1&re=$RE" > $S/hospital_before_alts_${NAME}.log; grep -o '"verdict": "[^"]*"\|compositeMean=[0-9.]*\|appMean=[0-9.]*\|exposure=[0-9.]*' $S/hospital_before_alts_${NAME}.log | tr '\n' ' '; echo; done
(echo "window.__b1pts = [['red1aerial',-44.334,20.357,48.696],['innerroom',9.947,-7.699,0.098],['outsidein',-5.529,-0.544,-42.321]];"; cat $S/cells.js) | curl -s --max-time 120 -X POST localhost:8631/eval --data-binary @- > $S/hospital_before_cells.log; node -e "const r=JSON.parse(require('fs').readFileSync('$S/hospital_before_cells.log')).result; console.log(JSON.stringify(r.rows))"
echo 'corridor|%5B21.243,-0.606,-1.261%5D|%5B1.197,-4.155,-2.608%5D' | $S/measure.sh clinic_before Clinic 8630 '%26ghost%3D1'
echo 'inside|%5B7.473,-7.532,1.036%5D|%5B6.397,-8.016,3.054%5D' | $S/measure.sh terminal_before Terminal 8630 ''
