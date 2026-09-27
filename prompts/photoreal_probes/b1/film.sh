#!/bin/bash
# §FILM_LAW GPU witness: A new (/tmp/wt-film 3688b3c5), B base (/tmp/wt-law 39959e8a), C control (new + --film-exposure 0 --film-fill restore)
S=/tmp/claude-1000/-home-red1-bim-compiler/cdf78573-99d9-42cf-92e2-f64ba3732e60/scratchpad
F='--db HospitalAjaibPath --gpu real --fps 15 --frame-range 0:90 --clash --measure --label'
(cd /tmp/wt-film && node cli_silent_bake.js $F --out $S/film_law_new.mp4 --log $S/film_law_new.log --port 8651 --profile $S/prof_filmA) > $S/film_A.out 2>&1
(cd /tmp/wt-law && node cli_silent_bake.js $F --out $S/film_law_base.mp4 --log $S/film_law_base.log --port 8652 --profile $S/prof_filmB) > $S/film_B.out 2>&1
(cd /tmp/wt-film && node cli_silent_bake.js $F --film-exposure 0 --film-fill restore --out $S/film_law_ctl.mp4 --log $S/film_law_ctl.log --port 8653 --profile $S/prof_filmC) > $S/film_C.out 2>&1
echo "== film done $(date +%T)" >> $S/film_C.out
