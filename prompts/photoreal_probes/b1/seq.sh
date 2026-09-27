#!/bin/bash
# SEQUENCE A/B for red1's pale outside still 1790466367731: (1) fresh-page first press at its pose; (2) red1's order on ONE page
# 616826 -> 698534 -> 100646 -> 367731 (each /alts presses Escape first, like red1). look 808f578f (:8630), Hospital &ghost=1.
S=/tmp/claude-1000/-home-red1-bim-compiler/cdf78573-99d9-42cf-92e2-f64ba3732e60/scratchpad
RE='§SOURCED_LIGHT|§METER|§IRC_MAX build|§COVE_LIGHT build|§GI_STILL result|§FAULT|§ALBEDO_SRGB|§STILL_STAGE_MS|§ZONE_IDB_CACHE|§GLARE|PAGEERROR|Shader Error'
op() { curl -s --max-time 60 localhost:8631/close >/dev/null; curl -s --max-time 500 "localhost:8631/open?port=8630&db=Hospital&q=%26ghost%3D1$1&reload=1" | tr -d '\n' | cut -c1-120; echo; }
al() { curl -s -G --max-time 700 "localhost:8631/alts" --data-urlencode "cam=$2" --data-urlencode "tgt=$3" --data-urlencode "gi=1" --data-urlencode "re=$RE" > $S/$1.log
  echo "$1 $(grep -o 'compositeMean=[0-9.]*\|appMean=[0-9.]*\|expStep=[-0-9.]*\|blown=[0-9.]*%\|exposure=[0-9.]*\|stops=[-0-9.]*' $S/$1.log | tr '\n' ' ')"
  curl -s --max-time 120 -X POST localhost:8631/eval --data-binary @$S/lum.js > $S/$1_lum.log; tr -d '\n ' < $S/$1_lum.log | cut -c1-900; echo; }
P616C='[26.431,36.87,42.209]'; P616T='[-4.751,-4.707,11.027]'; P698C='[-5.864,-6.079,16.896]'; P698T='[-5.384,-6.921,12.025]'
P100C='[-4.213,-5.725,2.978]'; P100T='[-6.999,-5.443,1.116]'; P367C='[-13.995,0.718,-3.294]'; P367T='[-14.398,0.675,-3.303]'
op ''; al seq1_fresh_367 $P367C $P367T
op ''; al seq1_fresh_100 $P100C $P100T
op ''; al seq2_a_616 $P616C $P616T; al seq2_b_698 $P698C $P698T; al seq2_c_100 $P100C $P100T; al seq2_d_367 $P367C $P367T
echo "== seq done $(date +%T)"
