#!/bin/bash
S=/tmp/claude-1000/-home-red1-bim-compiler/6c1a56ce-3efb-4bf6-9566-7b9616e78a94/scratchpad/sfa; cd $S
while pgrep -f "cs/corner.sh" >/dev/null; do sleep 10; done
for q in "&meter=0" "&meter=0&sourced=0"; do s=$(echo "$q" | grep -q sourced && echo nolamp || echo lamp); WAIT=900 LEAK=1 LEAKPX=cs/px.json Q="$q" OUTD=cs SUF=_$s flock /tmp/claude-1000/gpu.lock timeout 1500 node diag.js 8663 /home/red1/Downloads/bounce_still_1790673812371.png > /dev/null 2>&1; echo "$s oom=$(grep -c 'Uncaptured WebGPU' cs/1790673812371_$s.log)"; done; echo ALLDONE
