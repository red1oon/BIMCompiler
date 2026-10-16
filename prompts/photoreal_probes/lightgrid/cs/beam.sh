#!/bin/bash
S=/tmp/claude-1000/-home-red1-bim-compiler/6c1a56ce-3efb-4bf6-9566-7b9616e78a94/scratchpad/sfa; cd $S
while pgrep -f "ship2.sh|bakeall.sh|cs/hhsfloor.sh|cs/tmwall.sh" >/dev/null; do sleep 20; done
WAIT=1500 LEAK=1 LEAKSKIPGLASS=1 LEAKPX=cs/px_beam.json OUTD=cs SUF=_beam flock /tmp/claude-1000/gpu.lock timeout 3000 node diag.js 8663 /home/red1/Downloads/bounce_still_1790709411794.png > /dev/null 2>&1
echo "oom=$(grep -c 'Uncaptured WebGPU' cs/1790709411794_beam.log)"; python3 - <<'PY'
import json
f='/tmp/claude-1000/-home-red1-bim-compiler/6c1a56ce-3efb-4bf6-9566-7b9616e78a94/scratchpad/sfa/cs/1790709411794_beam.log'
l=[x for x in open(f,errors='ignore') if x.startswith('§LEAK_GRID')]
for r in (json.loads(l[0].split(' ',1)[1])['rows'] if l else []): print(r['g'][0],r['k'],r['cls'],'zone',r['zone'],'F',r['F'],'Lu',r['Lu'],'Lf',r['Lf'],'glassBefore',r['glassBefore'],r['mat'])
PY
echo ALLDONE
