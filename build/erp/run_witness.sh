#!/bin/bash
# run_witness.sh — run a poc_*.js witness, suppress bulk output, surface only the verdict tail.
# Usage: bash build/erp/run_witness.sh scripts/poc_valrule.js
# Full output → build/erp/<basename>.log; only last 5 lines printed to stdout (keeps context lean).
set -uo pipefail
SCRIPT="${1:?Usage: run_witness.sh <path/to/poc_script.js>}"
BASE=$(basename "$SCRIPT" .js)
LOG="build/erp/${BASE}.log"
node "$SCRIPT" > "$LOG" 2>&1
EXIT=$?
echo "── $BASE (exit $EXIT) ──"
tail -5 "$LOG"
exit $EXIT
