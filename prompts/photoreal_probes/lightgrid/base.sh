#!/bin/bash
cd /tmp/claude-1000/-home-red1-bim-compiler/6c1a56ce-3efb-4bf6-9566-7b9616e78a94/scratchpad/sfa
export Q; for B in ${BLDS:-Clinic Hospital HHS_Office_Federated Terminal}; do SUF=${SUFX:-_v1502} flock /tmp/claude-1000/gpu.lock timeout 5400 node lightgrid.js 8663 $B > lg_${B}${SUFX:-_v1502}.out 2>&1; done
echo ALLDONE
