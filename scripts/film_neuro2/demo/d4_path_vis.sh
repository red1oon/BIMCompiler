#!/bin/bash
# # ⚠ DO NOT REMOVE — demo d4: film_path_vis.js on a PUBLIC fixture (W-FILM-NEURO2-CLI, §22.8). $1 = fwd | rev. Read the evidence/ files after every run.
# Beat: "Check a film's camera path before baking". Downloads: the Viewer page tree (+ film_path_vis.js, in viewer_files.txt) + the public Duplex DB; the two test tables are WRITTEN by fixture_path.sh (sqlite3).
set -e; . "$(dirname "$0")/lib.sh"; . "$HERE/fixture_path.sh"; DIR="${1:-fwd}"; demo_begin "d4_path_$DIR"
dl_viewer_tree; dl_as Duplex_extracted.db buildings/Duplex_extracted.db "$OCI"
mk_fixture "$F/buildings/Duplex_extracted.db" "$DIR"
run_saved node viewer/tools/film_path_vis.js --db buildings/Duplex_extracted.db --json
