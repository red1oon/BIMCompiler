#!/bin/bash
# bake + rename (the viewer patches <bld>_meta.db for Clinic/Hospital/Terminal, HHS _extracted.db) + restorecheck, all through the GPU lock
cd /tmp/claude-1000/-home-red1-bim-compiler/6c1a56ce-3efb-4bf6-9566-7b9616e78a94/scratchpad/sfa; P=/tmp/wt-lfdb/buildings/patches
for B in ${BLDS:-Clinic HHS_Office_Federated Terminal Hospital}; do
  flock /tmp/claude-1000/gpu.lock timeout 5400 node bake.js 8663 $B > bake_$B.out 2>&1
  if [ "$B" != "HHS_Office_Federated" ]; then mv -f $P/${B}_extracted.db.lightfield.bin $P/${B}_meta.db.lightfield.bin; fi
  flock /tmp/claude-1000/gpu.lock timeout 1800 node restorecheck.js 8663 $B > rc_$B.out 2>&1
done; echo ALLDONE
