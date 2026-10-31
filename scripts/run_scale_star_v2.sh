#!/bin/bash
# W-SCALE-STAR re-measure AS SHIPPED (agent T, TEAMWORK_FRAMEWORK §45.7): one point at a time, same time boxes as the first run (engine 20/30/150 min, hq 60/60/120 min).
T=${1:-/tmp/wt-hq-perf}; L=build/scriptor
run() { m=$1; n=$2; box=$3; node scripts/witness_scale_star.js $T $m --n $n --m $n --k 3 --workers 6 --budget-min $box > $L/witness_scale_star_v2_${m}_${n}.log 2>&1; echo "$m $n exit=$?" >> $L/witness_scale_star_v2_done.txt; }
rm -f $L/witness_scale_star_v2_done.txt
run engine 10 20; run hq 10 60; run engine 100 30; run hq 100 60; run hq 1000 120; run engine 1000 150
echo ALLDONE >> $L/witness_scale_star_v2_done.txt
