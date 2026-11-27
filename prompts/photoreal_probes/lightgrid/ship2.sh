#!/bin/bash
S=/tmp/claude-1000/-home-red1-bim-compiler/6c1a56ce-3efb-4bf6-9566-7b9616e78a94/scratchpad/sfa; cd $S
echo "== default-off check Duplex $(date +%T)"; flock /tmp/claude-1000/gpu.lock timeout 1800 node restorecheck.js 8663 Duplex 2>&1 | grep -E "W_LIGHT_FIELD|SKY_FIELD_EXACT_ALL|SKY_VIEW_FIELD on" | cut -c1-260
echo "== bake all $(date +%T)"; BLDS="Clinic HHS_Office_Federated Terminal Hospital" ./bakeall.sh > ship2_bake.out 2>&1
for B in Clinic HHS_Office_Federated Terminal Hospital; do grep -h "§LIGHT_FIELD_BAKE\|FATAL" bake_$B.out | cut -c1-200; grep -h "SKY_FIELD_EXACT_ALL bld" bake_$B.out | cut -c1-160 | head -1; grep -h "§W_LIGHT_FIELD_PATCH\|FATAL" rc_$B.out | cut -c1-160; done
echo "ALLDONE $(date +%T)"
