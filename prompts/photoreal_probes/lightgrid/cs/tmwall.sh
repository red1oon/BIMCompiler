#!/bin/bash
S=/tmp/claude-1000/-home-red1-bim-compiler/6c1a56ce-3efb-4bf6-9566-7b9616e78a94/scratchpad/sfa; cd $S
while pgrep -f "ship2.sh|bakeall.sh|cs/hhsfloor.sh" >/dev/null; do sleep 20; done
for q in "" "&skyexactall=0"; do s=$([ -z "$q" ] && echo sa || echo nosa); WAIT=1500 LEAK=1 LEAKPX=cs/px_tmwall.json URLDB=../buildings/Terminal_extracted.db Q="$q" OUTD=cs SUF=_w$s flock /tmp/claude-1000/gpu.lock timeout 3000 node diag.js 8663 /home/red1/Downloads/bounce_still_1790709239282.png > /dev/null 2>&1; echo "$s oom=$(grep -c 'Uncaptured WebGPU' cs/1790709239282_w$s.log) $(grep -oE '§SKY_FIELD_EXACT_ALL bld=[A-Za-z]+ cache=[a-z]+ [a-z]+' cs/1790709239282_w$s.log | head -1)"; done; echo ALLDONE
