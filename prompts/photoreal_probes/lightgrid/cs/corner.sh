#!/bin/bash
S=/tmp/claude-1000/-home-red1-bim-compiler/6c1a56ce-3efb-4bf6-9566-7b9616e78a94/scratchpad/sfa; cd $S
while pgrep -f "node (diag|walle)\.js 8663 /home/red1/Downloads/bounce_still_1790673812371" >/dev/null || pgrep -f "b56o03o3l" >/dev/null; do sleep 10; done
for q in "" "&skyexactall=0"; do s=$([ -z "$q" ] && echo on || echo off); WAIT=900 LEAK=1 LEAKPX=cs/px_corner.json Q="$q" OUTD=cs SUF=_c$s flock /tmp/claude-1000/gpu.lock timeout 1500 node diag.js 8663 /home/red1/Downloads/bounce_still_1790673908384.png > /dev/null 2>&1; echo "corner $s oom=$(grep -c 'Uncaptured WebGPU' cs/1790673908384_c$s.log)"; done; echo ALLDONE
