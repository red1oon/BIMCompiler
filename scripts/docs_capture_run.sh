#!/bin/bash
# ⚠ DO NOT REMOVE — runs one docs capture script, retrying while the run is DEGRADED(network) (exit 2).
# Usage: OUT=<dir> LOG=<file> scripts/docs_capture_run.sh <capture.js> [tries=3]   (prompts/DOCS_GUIDE_REFRESH.md)
js="$1"; tries="${2:-3}"
for i in $(seq 1 "$tries"); do
  node "$js"; rc=$?
  echo "§DOCS_RUN $js try=$i rc=$rc"
  [ "$rc" -ne 2 ] && exit "$rc"
done
exit 2
