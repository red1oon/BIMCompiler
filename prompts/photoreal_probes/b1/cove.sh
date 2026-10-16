#!/bin/bash
# §COVE_NO_STRIP witness: arm A = :8630 (look 808f578f), arm B = :8632 (fix/cove-no-strip fdecbd1c). Cold first press per pose.
S=/tmp/claude-1000/-home-red1-bim-compiler/cdf78573-99d9-42cf-92e2-f64ba3732e60/scratchpad; P=/home/red1/bim-compiler/prompts/photoreal_probes
RE='§LIGHT_ZONE|§GLARE|§COVE_LIGHT|§STILL_STAGE_MS|§GI_STILL result|§FAULT|§METER camera|§ZONE_IDB_CACHE|PAGEERROR|Shader Error|newPrograms'
run() { T=$1; PORT=$2; DB=$3; Q=$4
  curl -s --max-time 60 localhost:8631/close >/dev/null; curl -s --max-time 500 "localhost:8631/open?port=$PORT&db=$DB&q=$Q&reload=1" | tr -d '\n' | cut -c1-120; echo
  curl -s -G --max-time 700 "localhost:8631/alts" --data-urlencode "cam=$5" --data-urlencode "tgt=$6" --data-urlencode "gi=1" --data-urlencode "re=$RE" > $S/$T.log
  echo "$T $(grep -o 'compositeMean=[0-9.]*\|appMean=[0-9.]*\|newPrograms=[0-9]*\|GLARE bld=[A-Za-z]* [A-Z]*\|§COVE_LIGHT strip mesh bars=[0-9]*\|qualified=[0-9]*\|emitters=[0-9]*\|NOFLAT [A-Z]*' $S/$T.log | tr '\n' ' ')"
  curl -s --max-time 60 -X POST localhost:8631/eval --data-binary @$S/coveprobe.js | tr -d '\n '; echo
  curl -s --max-time 120 -X POST localhost:8631/eval --data-binary @$S/darkapp.js | tr -d '\n '; echo; }
for ARM in A B; do PORT=8630; [ $ARM = B ] && PORT=8632
  run cove${ARM}_hosp_plenum $PORT Hospital '%26ghost%3D1' '[-20.496,-5.619,-34.439]' '[-23.527,-6.051,-22.952]'
  run cove${ARM}_hosp_innerroom $PORT Hospital '%26ghost%3D1' '[9.947,-7.699,0.098]' '[14.735,-8.114,2.081]'
  run cove${ARM}_hosp_p2 $PORT Hospital '%26ghost%3D1' '[-7.307,-6.507,12.017]' '[-2.403,-7.682,3.378]'
  run cove${ARM}_clinic_corridor $PORT Clinic '%26ghost%3D1' '[21.243,-0.606,-1.261]' '[1.197,-4.155,-2.608]'
  run cove${ARM}_terminal_inside $PORT Terminal '' '[7.473,-7.532,1.036]' '[6.397,-8.016,3.054]'
done
echo "== cove done $(date +%T)"
