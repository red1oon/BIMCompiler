#!/bin/bash
# pale/chroma check at red1's inside still 1790465698534 (Hospital &ghost=1), look 808f578f (:8630), cold first press per arm
S=/tmp/claude-1000/-home-red1-bim-compiler/cdf78573-99d9-42cf-92e2-f64ba3732e60/scratchpad
RE='§LIGHT_ZONE|§GLARE|§SKY_SHELL|§STILL_STAGE_MS|§GI_STILL result|§FAULT|§METER camera|§ALBEDO_SRGB|§COVE_LIGHT build|§IRC|PAGEERROR|Shader Error'
C='[-5.864,-6.079,16.896]'; T='[-5.384,-6.921,12.025]'
for ARM in def skyshell0 ir0 cove0 srgbfix1; do Q='%26ghost%3D1'; case $ARM in skyshell0) Q="$Q%26skyshell%3D0";; ir0) Q="$Q%26ir%3D0";; cove0) Q="$Q%26cove%3D0";; srgbfix1) Q="$Q%26srgbfix%3D1";; esac
  curl -s --max-time 60 localhost:8631/close >/dev/null; curl -s --max-time 500 "localhost:8631/open?port=8630&db=Hospital&q=$Q&reload=1" | tr -d '\n' | cut -c1-120; echo
  curl -s --max-time 60 -X POST localhost:8631/eval --data-binary @$S/matsnap.js | tr -d '\n '; echo
  curl -s -G --max-time 700 "localhost:8631/alts" --data-urlencode "cam=$C" --data-urlencode "tgt=$T" --data-urlencode "gi=1" --data-urlencode "re=$RE" > $S/pale_$ARM.log
  echo "pale_$ARM $(grep -o 'compositeMean=[0-9.]*\|appMean=[0-9.]*\|expStep=[0-9.]*\|stops=[0-9.]*\|GLARE bld=[A-Za-z]* [A-Z]*' $S/pale_$ARM.log | tr '\n' ' ')"
  curl -s --max-time 300 -X POST localhost:8631/eval --data-binary @$S/chroma.js > $S/pale_${ARM}_chroma.log
  node -e "const r=JSON.parse(require('fs').readFileSync('$S/pale_${ARM}_chroma.log')); if(!r.result){console.log(JSON.stringify(r).slice(0,600));process.exit()} const x=r.result; console.log(JSON.stringify({staged:x.staged,tm:x.toneMapping,exp:x.exposure,mats:x.materials,comp:x.composite,app:x.app,dq:x.darkestQuartile,s:{n:x.samples.n,mS:x.samples.meanMatS,pred:x.samples.meanPredS_asLinearEncoded,appS:x.samples.meanAppS,compS:x.samples.meanCompS,col:x.samples.coloured_mS_gt_0_15,tex:x.samples.texturedShare}}))"
done
echo "== pale done $(date +%T)"
