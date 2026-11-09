#!/bin/bash
# # ⚠ DO NOT REMOVE — demo d3: edit_cli shift whose report carries the NEW shape-checked overlap verdict (W-FILM-NEURO2-CLI, §22.8). Read evidence/ after every run.
# Beat: "A clash is real shapes crossing". Downloads ONE file (edit_cli.js); the page it drives is the live Modeller (edit_cli's own default).
set -e; . "$(dirname "$0")/lib.sh"; demo_begin d3_shift
dl_as modeller/tools/edit_cli.js edit_cli.js "$LIVE"
run_saved node edit_cli.js --building HospitalGarage --shift gy10 --move 1.49
