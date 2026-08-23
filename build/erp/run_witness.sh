#!/bin/bash
# run_witness.sh — run a poc_*.js witness, suppress bulk output, surface only the verdict tail.
# Usage: bash build/erp/run_witness.sh scripts/poc_valrule.js
# Full output → build/erp/<basename>.log; only last 5 lines printed to stdout (keeps context lean).
#
# VERDICT = LOG CONTENT, not exit code alone (Log Mandate — a witness that silently no-ops and
# exits 0 must FAIL here). PASS requires BOTH: node exit 0 AND a printed pass marker in the log.
# Marker conventions (surveyed across scripts/poc_*.js final-verdict lines, 2026-08-23):
#   pass: "🟢 W-XXX PASS" · "✅ ... PASS" · "ALL PASS" · "OVERALL=PASS" · "§XXX PASS"
#   fail: "🔴 ... FAIL" · "❌ ... FAIL"  (a fail marker forces FAIL even on exit 0)
# The "§RUN_WITNESS <base> VERDICT=..." line printed below is the marker upstream gates grep for
# (scripts/system_is_real.sh regime (c) does) — keep its format stable, the two must agree.
set -uo pipefail
SCRIPT="${1:?Usage: run_witness.sh <path/to/poc_script.js>}"
BASE=$(basename "$SCRIPT" .js)
LOG="build/erp/${BASE}.log"
node "$SCRIPT" > "$LOG" 2>&1
EXIT=$?
echo "── $BASE (exit $EXIT) ──"
tail -5 "$LOG"
PASS_RE='🟢.*PASS|✅.*PASS|ALL PASS|OVERALL=PASS|§[A-Z0-9_-]+ PASS'
FAIL_RE='🔴.*FAIL|❌.*FAIL'
if [ "$EXIT" -ne 0 ]; then
  echo "§RUN_WITNESS $BASE VERDICT=FAIL exit=$EXIT (read $LOG)"
  exit "$EXIT"
elif grep -qE "$FAIL_RE" "$LOG"; then
  echo "§RUN_WITNESS $BASE VERDICT=FAIL exit=0 but a fail marker was printed (read $LOG)"
  exit 1
elif grep -qE "$PASS_RE" "$LOG"; then
  echo "§RUN_WITNESS $BASE VERDICT=PASS exit=0 + pass marker found in $LOG"
  exit 0
else
  echo "§RUN_WITNESS $BASE VERDICT=FAIL exit=0 but NO pass marker in $LOG — a silent no-op is not a pass (Log Mandate)"
  exit 1
fi
