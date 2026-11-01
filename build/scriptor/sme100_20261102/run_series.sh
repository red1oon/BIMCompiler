#!/bin/bash
# §45.14 series: reference (no network, folder, sequential) then gh-local mixed burst, per N = n+m users
cd /home/red1/bim-compiler; L=build/scriptor/sme100_20261102
for T in 10 20 30 50 100; do H=$((T/2))
  node scripts/witness_scale_star.js /home/red1/bim-ootb engine --n $H --m $H --workers 6 --budget-min 60 > $L/ref_n$T.log 2>&1; echo "ref $T exit=$?" >> $L/series.status
  node scripts/witness_scale_star.js /home/red1/bim-ootb engine --n $H --m $H --workers 6 --net mixed --relay gh-local --schedule burst --gap 0 --budget-min 60 > $L/sme_n$T.log 2>&1; echo "sme $T exit=$?" >> $L/series.status
done
echo SERIES-DONE >> $L/series.status
