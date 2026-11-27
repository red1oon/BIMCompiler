#!/bin/bash
# outside-pale: fresh first press &skyshell=0 vs default at red1's 367731 + 100646 poses, + clipped-pixel classes
S=/tmp/claude-1000/-home-red1-bim-compiler/cdf78573-99d9-42cf-92e2-f64ba3732e60/scratchpad
RE='§SOURCED_LIGHT|§METER|§IRC_MAX build|§GI_STILL result|§FAULT|§STILL_STAGE_MS|§GLARE|§SKY_SHELL|PAGEERROR|Shader Error'
op() { curl -s --max-time 60 localhost:8631/close >/dev/null; curl -s --max-time 500 "localhost:8631/open?port=8630&db=Hospital&q=%26ghost%3D1$1&reload=1" | tr -d '\n' | cut -c1-120; echo; }
al() { curl -s -G --max-time 700 "localhost:8631/alts" --data-urlencode "cam=$2" --data-urlencode "tgt=$3" --data-urlencode "gi=1" --data-urlencode "re=$RE" > $S/$1.log
  echo "$1 $(grep -o 'compositeMean=[0-9.]*\|expStep=[-0-9.]*\|blown=[0-9.]*%\|stops=[-0-9.]*' $S/$1.log | tr '\n' ' ')"
  curl -s --max-time 120 -X POST localhost:8631/eval --data-binary @$S/lum.js > $S/$1_lum.log; tr -d '\n ' < $S/$1_lum.log | cut -c1-420; echo
  curl -s --max-time 300 -X POST localhost:8631/eval --data-binary @$S/clip_cls.js > $S/$1_clipcls.log; node -e "const r=JSON.parse(require('fs').readFileSync('$S/$1_clipcls.log')).result; console.log('clip', r.darkPx, r.darkPct, r.sampled); console.log(r.rows.slice(0,8).join('\n'))"; }
P100C='[-4.213,-5.725,2.978]'; P100T='[-6.999,-5.443,1.116]'; P367C='[-13.995,0.718,-3.294]'; P367T='[-14.398,0.675,-3.303]'
op '%26skyshell%3D0'; al sky0_367 $P367C $P367T
op ''; al sky1_367 $P367C $P367T
op '%26skyshell%3D0'; al sky0_100 $P100C $P100T
op ''; al sky1_100 $P100C $P100T
echo "== skyab done $(date +%T)"
