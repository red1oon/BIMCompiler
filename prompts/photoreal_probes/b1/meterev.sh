#!/bin/bash
S=/tmp/claude-1000/-home-red1-bim-compiler/cdf78573-99d9-42cf-92e2-f64ba3732e60/scratchpad
$S/arm.sh evB 8633 '' > $S/evB.out 2>&1
$S/arm.sh evBavg 8633 '%26metermode%3Davg' $S/poses_avg.txt > $S/evBavg.out 2>&1
$S/arm.sh evA 8630 '' > $S/evA.out 2>&1
echo ALL >> $S/evA.out
