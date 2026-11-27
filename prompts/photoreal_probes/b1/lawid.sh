#!/bin/bash
# §LIGHT_LAW_MODULE identity: lamp-truth c539f129 (:8634) vs light-law-module 39959e8a (:8635), full console logs
S=/tmp/claude-1000/-home-red1-bim-compiler/cdf78573-99d9-42cf-92e2-f64ba3732e60/scratchpad
for ARM in 8634 8635; do
  node $S/capture.js $ARM Hospital 63182 '[9.947,-7.699,0.098]' '[14.735,-8.114,2.081]' $S/law_${ARM}_hospital.txt '&ghost=1'
  node $S/capture.js $ARM Clinic 16071 '[21.243,-0.606,-1.261]' '[1.197,-4.155,-2.608]' $S/law_${ARM}_clinic.txt '&ghost=1'
  node $S/capture.js $ARM Terminal 48428 '[7.473,-7.532,1.036]' '[6.397,-8.016,3.054]' $S/law_${ARM}_terminal.txt ''
done
(cd /tmp/wt-law && node viewer/tests/witness_light_law_unit.js) > $S/law_unit.log 2>&1
echo "== lawid done $(date +%T)"
