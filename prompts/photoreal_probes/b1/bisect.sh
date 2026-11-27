#!/bin/bash
# which press carries state into the 367731 pose: page A = 616 (outside) -> 367; page B = 698 (inside) -> 367. look 808f578f.
S=/tmp/claude-1000/-home-red1-bim-compiler/cdf78573-99d9-42cf-92e2-f64ba3732e60/scratchpad
RE='§SOURCED_LIGHT on|§METER camera|§GI_STILL result|§GI_STILL geom|§FAULT |§GROUND_ALBEDO|PAGEERROR|Shader Error'
op() { curl -s --max-time 60 localhost:8631/close >/dev/null; curl -s --max-time 500 "localhost:8631/open?port=8630&db=Hospital&q=%26ghost%3D1&reload=1" | tr -d '\n' | cut -c1-100; echo; }
al() { curl -s -G --max-time 700 "localhost:8631/alts" --data-urlencode "cam=$2" --data-urlencode "tgt=$3" --data-urlencode "gi=1" --data-urlencode "re=$RE" > $S/$1.log
  echo "$1 $(grep -o 'compositeMean=[0-9.]*\|appMean=[0-9.]*\|pushed=[0-9]*\|secs=[0-9.]*\|stops=[-0-9.]*' $S/$1.log | tr '\n' ' ')"
  curl -s --max-time 120 -X POST localhost:8631/eval --data-binary @$S/lum.js > $S/$1_lum.log; tr -d '\n ' < $S/$1_lum.log | cut -c1-260; echo; }
P616C='[26.431,36.87,42.209]'; P616T='[-4.751,-4.707,11.027]'; P698C='[-5.864,-6.079,16.896]'; P698T='[-5.384,-6.921,12.025]'; P367C='[-13.995,0.718,-3.294]'; P367T='[-14.398,0.675,-3.303]'
op; al bis_A1_616 $P616C $P616T; al bis_A2_367 $P367C $P367T
op; al bis_B1_698 $P698C $P698T; al bis_B2_367 $P367C $P367T
echo "== bisect done $(date +%T)"
