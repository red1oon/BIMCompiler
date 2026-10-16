#!/bin/bash
S=/tmp/claude-1000/-home-red1-bim-compiler/cdf78573-99d9-42cf-92e2-f64ba3732e60/scratchpad
$S/arm.sh ltC 8634 '' $S/poses_lamp.txt > $S/ltC.out 2>&1
$S/arm.sh ltB 8633 '' $S/poses_lampB.txt > $S/ltB.out 2>&1
echo ALL >> $S/ltB.out
