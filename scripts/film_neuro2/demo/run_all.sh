#!/bin/bash
# # ⚠ DO NOT REMOVE — runs every Part II demo in order, log to evidence/run_all.log (read it). W-FILM-NEURO2-CLI then judges the saved evidence.
cd "$(dirname "$0")"; mkdir -p ../evidence
{ for d in d1_viewer_counts.sh d2_viewer_clashes.sh d3_edit_shift.sh "d4_path_vis.sh fwd" "d4_path_vis.sh rev" d5_mcp_menu.sh d6_inventories.sh; do echo "=== $d $(date +%T)"; ./$d; done; echo "=== done $(date +%T)"; } > ../evidence/run_all.log 2>&1
