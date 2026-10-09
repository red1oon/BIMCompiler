#!/bin/sh
# Run every Bridge witness + the genericity gate against the LOCAL PILOT; persist the full log (CLAUDE.md log mandate) and print only verdict/finding lines.
# Needs: docker postgres (idempiere_pilot) + pilot server :8088 (~/idempiere-pilot/start.sh).
cd "$(dirname "$0")" || exit 1
d="$HOME/.cache/bim_bridge"; mkdir -p "$d"; log="$d/run_$(date +%Y%m%d_%H%M%S).log"
{
  ./check_genericity.sh
  for w in witness_changelog_tail witness_m1_outbox witness_m2_replay witness_m3_gap; do echo "=== $w"; node "$w.js"; done
} > "$log" 2>&1
grep -E "^§GENERICITY|_VERDICT|^§RECON_SUMMARY|^§SCN |^§GAP |^§M3_FINDINGS" "$log"
echo "full log: $log"
grep -q -E "_VERDICT (FAIL|HARNESS-FAIL)|GENERICITY FAIL" "$log" && exit 1
exit 0
