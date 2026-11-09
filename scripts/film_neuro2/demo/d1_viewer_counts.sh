#!/bin/bash
# # ⚠ DO NOT REMOVE — demo d1: Viewer CLI `counts` (W-FILM-NEURO2-CLI, §22.8). Read the evidence/ files after every run.
# Beat: "Ask the Viewer a question from the command line". Downloads: the Viewer's page tree (viewer_files.txt, measured) + the public Duplex DB (public bucket).
set -e; . "$(dirname "$0")/lib.sh"; demo_begin d1_counts
dl_viewer_tree; dl_as Duplex_extracted.db buildings/Duplex_extracted.db "$OCI"
run_saved node viewer/tools/viewer_verbs.js counts --building Duplex
