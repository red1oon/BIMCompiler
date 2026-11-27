#!/bin/bash
S=/tmp/claude-1000/-home-red1-bim-compiler/6c1a56ce-3efb-4bf6-9566-7b9616e78a94/scratchpad/sfa; cd $S
while pgrep -f "ship2.sh|bakeall.sh" >/dev/null; do sleep 20; done
ENV0='(function(){var n=0;APP.scene.traverse(function(o){var ms=o.material?(Array.isArray(o.material)?o.material:[o.material]):[];ms.forEach(function(m){if(m&&m.envMapIntensity!=null&&!(m.transparent&&m.opacity<0.95)){m.envMapIntensity=0;n++;}});});APP._diagEnv0=n;return "envMapIntensity=0 on "+n+" opaque materials";})()'
run(){ WAIT=1200 LEAK=1 LEAKPX=cs/px_hhsfloor.json Q="$2" PRE="$3" OUTD=cs SUF=_h$1 flock /tmp/claude-1000/gpu.lock timeout 2400 node diag.js 8663 /home/red1/Downloads/bounce_still_1790708698742.png > /dev/null 2>&1; echo "$1 oom=$(grep -c 'Uncaptured WebGPU' cs/1790708698742_h$1.log) $(grep -oE '§DIAG_PRE [^§]{0,80}' cs/1790708698742_h$1.log)"; }
run def "" ""; run giredist0 "&giredist=0" ""; run env0 "" "$ENV0"
python3 cs/band.py cs/1790708698742_hdef.log cs/1790708698742_hgiredist0.log cs/1790708698742_henv0.log; echo ALLDONE
