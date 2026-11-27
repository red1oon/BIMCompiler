#!/bin/bash
# # ⚠ DO NOT REMOVE — demo d2: Viewer CLI `clashes` ARC vs MEP (W-FILM-NEURO2-CLI, §22.8). Read the evidence/ files after every run.
set -e; . "$(dirname "$0")/lib.sh"; demo_begin d2_clashes
dl_viewer_tree; dl_as Duplex_extracted.db buildings/Duplex_extracted.db "$OCI"
run_saved node viewer/tools/viewer_verbs.js clashes --building Duplex --a ARC --b MEP
