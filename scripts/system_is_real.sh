#!/bin/bash
# ============================================================
# system_is_real.sh — the ONE "is the system real?" entrypoint (Lane A / A2).
#   docs/TestArchitecture.md §Truth Model (2026). Fans out ONE shallow check per truth
#   regime, each emitting a single-line verdict, combines the log, READS it (exit code is
#   not evidence — Log Mandate), and exits non-zero if ANY regime FAILs.
#
#   (a) Compiler   — RosettaStone G1-COUNT/G2-VOLUME on one representative building (SH).
#   (b) Browser    — the local gate (test_all.js) + anti-drift (audit_specs.js).
#   (c) ERP        — one headless witness via run_witness.sh.
#   (d) Red Pill   — the G8-GOVERNANCE round-trip (§REDPILL-RS), checked out from bim-ootb.
#
#   FAIL = a gate went red → fail-fast, exit 1. SKIP = an input is genuinely unavailable
#   (no Java build, no bim-ootb checkout) → logged, never silent, never counted as PASS.
#   "Green" from this runner NEVER implies a regime it skipped was covered.
#
# Usage:
#   ./scripts/system_is_real.sh                 # all regimes (local)
#   CI=1 ./scripts/system_is_real.sh            # headless subset (Java step auto-SKIPs if no build)
#   BIMOOTB=/path/to/bim-ootb ./scripts/system_is_real.sh
# ============================================================
set -uo pipefail
cd "$(dirname "$0")/.."                         # repo root (bim-compiler)
ROOT="$(pwd)"
LOG="${LOG:-$ROOT/build/system_is_real.log}"
mkdir -p "$(dirname "$LOG")"
: > "$LOG"
BIMOOTB="${BIMOOTB:-$HOME/bim-ootb}"
ERP_WITNESS="${ERP_WITNESS:-scripts/poc_fold_complete.js}"

RC=0
verdict() { printf '  %-10s %-5s %s\n' "$1" "$2" "$3"; printf '%s\t%s\t%s\n' "$1" "$2" "$3" >> "$LOG"; }
section() { echo; echo "── $1 ──"; echo "── $1 ──" >> "$LOG"; }

echo "=== system_is_real — $(date -u +%Y-%m-%dT%H:%M:%SZ) ==="
echo "    combined log: $LOG"

# Each step: run, append full output to $LOG, decide PASS/FAIL/SKIP from the LOG (not exit code alone).
# On FAIL we set RC=1 and stop (fail-fast). On SKIP we continue. This is what "exit non-zero if any
# fails" + "never silently skip" mean together.

# ── (a) COMPILER — RosettaStone G1/G2 on SH ─────────────────────────────────────
section "(a) Compiler — RosettaStone G1-COUNT/G2-VOLUME (SH)"
if [ -n "${CI:-}" ] && [ "${RUN_JAVA:-0}" != "1" ]; then
  verdict "compiler" "SKIP" "headless CI — Java build deferred (set RUN_JAVA=1 to force; see §CI)"
elif ! command -v mvn >/dev/null 2>&1; then
  verdict "compiler" "SKIP" "mvn not on PATH — cannot build the compiler module here"
else
  ( bash scripts/run_RosettaStones.sh classify_sh.yaml ) >> "$LOG" 2>&1
  # Read the log: a PASS run shows G1/G2 PASS lines and no gate FAIL.
  if grep -qE "G[12]-(COUNT|VOLUME).*FAIL|BUILD FAILURE" "$LOG"; then
    verdict "compiler" "FAIL" "a RosettaStone gate went red (grep G1/G2 FAIL in $LOG)"; RC=1
  elif grep -qE "G1-COUNT.*PASS|G2-VOLUME.*PASS" "$LOG"; then
    verdict "compiler" "PASS" "G1-COUNT/G2-VOLUME green on SH"
  else
    verdict "compiler" "SKIP" "no G1/G2 verdict emitted (build produced no contract output — see $LOG)"
  fi
fi
[ "$RC" = 1 ] && { echo; echo "=== FAIL (fail-fast at compiler) — read $LOG ==="; exit 1; }

# ── (b) BROWSER — local gate (hard) + anti-drift audit (informational WARN) ──────
# The local gate (test_all.js) is the A2 (b) hard gate — syntax/wiring/URL, deterministic.
# audit_specs.js is the Playwright anti-drift gate (CLAUDE.md: must be 0 after spec changes);
# here it is an INFORMATIONAL line so a PRE-EXISTING violation (e.g. 38-sh-dx skip-guards) is
# surfaced (never silently skipped) without falsely failing the smoke — it is the hard gate in
# the Playwright-change workflow, not the system-is-real smoke.
# Under CI, test_all.js itself downgrades its two structurally-unverifiable-in-CI regimes
# (live-vs-checkout fingerprint/sync §9b/§13, Playwright Browser E2E §15) to the same WARN tier
# — see prompts/CI_GATE_FIRST_REAL_RUN_FINDINGS_2026-07-03.md (decision (a), 2026-07-03).
section "(b) Browser — local gate (test_all.js); anti-drift audit = informational"
( node deploy/dev/test_all.js ) >> "$LOG" 2>&1
B1=$?
if [ $B1 -eq 0 ]; then verdict "browser" "PASS" "local gate green (test_all.js)";
else verdict "browser" "FAIL" "test_all.js exit=$B1 (read $LOG)"; RC=1; fi
( node deploy/dev/tests/audit_specs.js ) >> "$LOG" 2>&1
if [ $? -eq 0 ]; then verdict "audit" "PASS" "anti-drift spec audit clean";
else verdict "audit" "WARN" "audit_specs has violations — pre-existing debt, surfaced not gated (read $LOG)"; fi
[ "$RC" = 1 ] && { echo; echo "=== FAIL (fail-fast at browser) — read $LOG ==="; exit 1; }

# ── (c) ERP — one headless witness ──────────────────────────────────────────────
section "(c) ERP — $ERP_WITNESS"
if [ ! -f "$ERP_WITNESS" ]; then
  verdict "erp" "SKIP" "$ERP_WITNESS not found"
else
  ( bash build/erp/run_witness.sh "$ERP_WITNESS" ) >> "$LOG" 2>&1
  E1=$?
  EBASE=$(basename "$ERP_WITNESS" .js)
  # Read the log, not the exit code alone (same contract as (a)'s G1/G2 grep and (d)'s §W-REDPILL
  # grep): run_witness.sh prints "§RUN_WITNESS <base> VERDICT=PASS" ONLY after finding the witness's
  # own pass marker in build/erp/<base>.log — a witness that silently no-ops and exits 0 has no
  # marker and must FAIL here, never PASS.
  if [ $E1 -eq 0 ] && grep -q "§RUN_WITNESS $EBASE VERDICT=PASS" "$LOG"; then
    verdict "erp" "PASS" "$EBASE — exit 0 AND §RUN_WITNESS pass marker in log"
  else
    verdict "erp" "FAIL" "$EBASE non-green (exit=$E1; §RUN_WITNESS VERDICT=PASS absent — read $LOG)"; RC=1
  fi
fi
[ "$RC" = 1 ] && { echo; echo "=== FAIL (fail-fast at erp) — read $LOG ==="; exit 1; }

# ── (d) RED PILL — G8-GOVERNANCE round-trip (bim-ootb) ──────────────────────────
section "(d) Red Pill — G8-GOVERNANCE round-trip (§REDPILL-RS)"
RP="$BIMOOTB/viewer/tests/poc_redpill_rosetta.js"
if [ ! -f "$RP" ]; then
  verdict "redpill" "SKIP" "bim-ootb Red Pill witness not found at $RP (set BIMOOTB=)"
else
  ( cd "$BIMOOTB" && node viewer/tests/poc_redpill_rosetta.js ) >> "$LOG" 2>&1
  if [ $? -eq 0 ] && grep -q "§W-REDPILL-ROSETTA ALL PASS" "$LOG"; then
    verdict "redpill" "PASS" "identity + governed-delta PASS, gate proven able to FAIL"
  else
    verdict "redpill" "FAIL" "W-REDPILL-ROSETTA non-green (read $LOG)"; RC=1
  fi
fi

echo
if [ "$RC" = 0 ]; then echo "=== system is real — all run regimes PASS (skips logged above) ==="; else echo "=== FAIL — read $LOG ==="; fi
exit $RC
