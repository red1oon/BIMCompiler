#!/bin/bash
S=/tmp/claude-1000/-home-red1-bim-compiler/cdf78573-99d9-42cf-92e2-f64ba3732e60/scratchpad
TAG=after $S/after_all.sh > $S/after_all.out 2>&1
$S/w2ab.sh > $S/w2ab.out 2>&1
$S/abcap.sh > $S/abcap.out 2>&1
$S/red1poses.sh > $S/red1poses.out 2>&1
echo ALLDONE >> $S/abcap.out
