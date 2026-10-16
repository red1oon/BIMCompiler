#!/usr/bin/env bash
# gate_4d.sh — ONE command that says whether the 4D lane is intact.
#
# WHY THIS EXISTS (2026-08-12): five changes shipped in one day (#1313 §ZONE_INDEX,
# #1314 §TIER_SERIAL_BY_ZONE, #1315 §CREW_DEMAND, #1317 §ARCH_AREA_WEIGHT, plus #1316 shadow),
# each with its own witness, each run by hand, each green in isolation — and the user still hit
# "electrical outlets and hanging elements appearing bit early". That is the failure mode a per-
# change witness cannot catch: nothing ran them TOGETHER, and no witness owned the predicate that
# actually broke. Run this before and after any 4D change and diff the two logs.
#
# Usage (from bim-compiler/):
#   scripts/gate_4d.sh                  # against ~/bim-ootb/viewer working tree
#   VIEWER_DIR=/tmp/vw scripts/gate_4d.sh   # against an exported revision (see probe header)
# Read the log. Exit code is a convenience, the numbers are the evidence.
set -uo pipefail

VIEWER_DIR="${VIEWER_DIR:-$HOME/bim-ootb/viewer}"
BLD_DIR="${BLD_DIR:-$HOME/bim-ootb/buildings}"
OUT="${OUT:-/tmp/gate_4d_$(date +%H%M%S).log}"
cd "$(dirname "$0")/.." || exit 1

pass=0; fail=0; miss=0
say() { printf '%s\n' "$*" | tee -a "$OUT"; }

say "§GATE_4D viewer=$VIEWER_DIR buildings=$BLD_DIR  $(date -Is)"
say ""

# ── 1. Witnesses — each returns n/N; we keep only the verdict + any failing gate ───────────────
# witness_midair_zero added 2026-08-12 (§DAY_GAP_TAIL): it owns _midairRepair — the pass that sets
# ~46% of LTU's Superstructure straggler tail — and it had been throwing `ReferenceError: _zoneIndex
# is not defined` since #1313, exiting before it measured a single building. Four PRs of this lane
# shipped while it certified nothing, which is the exact failure this gate exists to catch.
# witness_kernel_ops_sched_version added 2026-08-12 (§ARCH_START_TEMPO/M1): it owns the RUNTIME half
# of the cache-version contract (_kernelOpsSchedStale + the _genVersion stamp) that §CACHE_VERSION_GUARD
# below only checks statically — and it had been throwing `ReferenceError: _zoneIndex is not defined`
# from W-KOS-4 onward since #1313, its first four gates still passing, so nobody saw it die. Same
# dead-witness shape as witness_midair_zero. Revived in bim-ootb #1323; green 12/12.
# witness_curtain_wall_opening added 2026-08-12 (§CURTAIN_WALL_OPENING, bim-ootb fix/hhs-door-host-wall):
# it owns the predicate NO existing witness owned — not "is the wall pool respected" (openingGate was
# always correct: rawEARLY 0.0% on all 7 buildings) but "is every opening that HAS an available host
# actually gated against one, whatever class that host is". §DOOR_WINDOW_HOST_WALL's own witness
# stayed green while 34 of HHS's 133 openings (25.6%) sat outside wallGrid entirely — ungated from
# day 0 — because HHS's façade is a curtain wall and wallGrid is keyed on cls.indexOf('IfcWall')===0.
# Verified to FAIL on the pre-fix tree (G-CWO-RAW HHS=30 early, worst 9.5d IfcDoor@IfcPlate) and pass
# after, so it is a test that names the issue it proves rather than one that is merely green.
# witness_tier_serial_display REMOVED 2026-08-17 (§S20 Part A, 4D_GANTT_TM_REFACTOR.md): its entire
# pass/fail methodology was 100% about `_twoTierRemap` (time_machine.js's dead legacy display-repair
# chain, reachable only via `?cpm4d=0`/`§CPM_DISPLAY_FALLBACK`, never live — §S13.8/§S14.0) — no
# question survives its deletion, unlike witness_midair_zero/witness_hosted_before_host/
# witness_curtain_wall_opening, which were rebuilt against the live CPM path (`_displayTimeline`'s
# CPM branch) in the same PR. File deleted from bim-ootb's viewer/tests/.
for w in witness_zone_index witness_crew_demand witness_midair_zero witness_arch_area_weight witness_hosted_before_host witness_kernel_ops_sched_version witness_curtain_wall_opening; do
  f="$VIEWER_DIR/tests/$w.js"
  if [ ! -f "$f" ]; then say "MISS  $w  (not in this revision)"; miss=$((miss+1)); continue; fi
  out=$(cd "$VIEWER_DIR/tests" && BLD_DIR="$BLD_DIR" timeout 900 node "$w.js" 2>&1)
  verdict=$(printf '%s' "$out" | grep -E "gates passed|SUMMARY" | tail -1)
  bad=$(printf '%s' "$out" | grep -E "^\s*FAIL" | head -4)
  if [ -n "$bad" ]; then
    say "FAIL  $w  ${verdict:-(no verdict line)}"; printf '%s\n' "$bad" | sed 's/^/        /' | tee -a "$OUT" >/dev/null
    printf '%s\n' "$bad" | sed 's/^/        /'
    fail=$((fail+1))
  else
    say "PASS  $w  ${verdict:-ok}"; pass=$((pass+1))
  fi
done

# ── 2. The probe — the shape numbers, not a re-derivation ──────────────────────────────────────
say ""
say "── §-numbers (compare against prompts/4D_SCHEDULE_PERFECTION.md; drift here is the finding) ──"
VIEWER_DIR="$VIEWER_DIR" BLD_DIR="$BLD_DIR" timeout 1800 node scripts/probe_arch_start.js 2>&1 \
  | grep -E "§RULES_TABLE_SOURCE|§DAY_GAP |§DAY_GAP_PHASE_OCC|§ZONE_BAR_TAIL|§STAGE_OCC|§TIER_SERIAL_BY_ZONE|§CREW_AUTOSCALE|§ARCH_AREA_WEIGHT classes|§HOSTED_BEFORE_HOST" \
  | tee -a "$OUT"

# §DOOR_WINDOW_HOST_WALL / §CURTAIN_WALL_OPENING shape numbers (2026-08-12). Separate probe because
# it is the only one that reports per STOREY and splits the wallGrid pool from the curtain-wall pool
# — the split that showed openingGate's PREDICATE was fine and its POOL was not. The dispEARLY column
# is the live acceptance number for the still-OPEN §DOOR_WINDOW_HOST_WALL_DISPLAY thread.
VIEWER_DIR="$VIEWER_DIR" BLD_DIR="$BLD_DIR" timeout 1800 node scripts/probe_door_wall.js 2>&1 \
  | grep -E "§DW_COVER" \
  | tee -a "$OUT"

# ── 3. §CACHE_VERSION_GUARD — catches the miss that has bitten 3 times in one day (2026-08-12):
# #1319 changed computeSchedule's gating without bumping _GANTT_CACHE_VERSION, and it happened
# again on a second, independent lane the same day. No witness ever asserted the CONSTANT moved —
# only the predicate it protects — so the miss was invisible to every prior gate run and only
# surfaced as a user reporting an already-fixed bug as still live. Runs only when VIEWER_DIR is a
# real git tree with an upstream to diff against; a plain /tmp export (no git history) skips it.
say ""
if git -C "$VIEWER_DIR" rev-parse --git-dir >/dev/null 2>&1; then
  base=$(git -C "$VIEWER_DIR" merge-base HEAD origin/main 2>/dev/null || true)
  if [ -n "$base" ] && [ "$base" != "$(git -C "$VIEWER_DIR" rev-parse HEAD)" ]; then
    tm_diff=$(git -C "$VIEWER_DIR" diff "$base"...HEAD -- time_machine.js schedule_gate.js 2>/dev/null)
    if [ -n "$tm_diff" ]; then
      gating_touched=$(printf '%s\n' "$tm_diff" | grep -cE '^\+.*(function (computeSchedule|_twoTierRemap|_midairRepair|_tier1Serialize|_tierAuditRegate|bandGate|geoGate|hangGate|wallGate|openingGate|hostGate))')
      # §GATE_GUARD_BODY (2026-08-12) — the declaration-line heuristic above fires only when a
      # function's SIGNATURE line is added, so it sees a function being ADDED or RENAMED and is blind
      # to one being REWRITTEN. MEASURED on its first real customer: §ARCH_START_TEMPO/M1 replaced
      # computeSchedule's crew clock (place()'s duration advance + the §DEQ_REPAIR shift) and this
      # guard reported gating_changed=0 — it would have waved a missing bump straight through, which
      # is the exact miss it was written to stop. schedule_gate.js IS the gating engine, every line
      # of it, so any NON-COMMENT added line there is a gating change by definition.
      sg_body=$(git -C "$VIEWER_DIR" diff "$base"...HEAD -- schedule_gate.js 2>/dev/null \
        | grep -E '^\+' | grep -vE '^\+\+\+' | grep -cvE '^\+[[:space:]]*(//|/\*|\*|$)')
      gating_touched=$((gating_touched + sg_body))
      # §GATE_GUARD_BODY extension for time_machine.js (2026-08-14, prompts/4D_SCHEDULE_PERFECTION.md
      # §TIER_REGATE_WORKLIST's named follow-up) — MEASURED on its real first customer: PR #1348
      # rewrote _tierAuditRegate's entire 120-line body (signature untouched) and this guard reported
      # gating_changed=0, same false-negative class §GATE_GUARD_BODY fixed for schedule_gate.js above.
      # time_machine.js is NOT "every line is gating" like schedule_gate.js (it holds camera/UI/other
      # code too), so instead of a file-wide any-added-line check, scripts/tm_gating_body_diff.js
      # locates the gating functions' own bodies by brace-matching and only counts added non-comment
      # lines inside those ranges — catches a body-only rewrite without flagging unrelated edits
      # elsewhere in the file.
      tm_body=$(node "$(dirname "$0")/tm_gating_body_diff.js" "$VIEWER_DIR" "$base" 2>/dev/null || echo 0)
      gating_touched=$((gating_touched + tm_body))
      version_touched=$(printf '%s\n' "$tm_diff" | grep -cE '^\+.*_GANTT_CACHE_VERSION\s*=')
      if [ "$gating_touched" -gt 0 ] && [ "$version_touched" -eq 0 ]; then
        say "FAIL  §CACHE_VERSION_GUARD  gating/remap function(s) changed vs origin/main but _GANTT_CACHE_VERSION was not bumped in the same diff — a building already materialized will keep replaying the OLD schedule forever, even after deploy + hard reload. Bump time_machine.js's _GANTT_CACHE_VERSION (and sw.js CACHE_VERSION) in this PR."
        fail=$((fail+1))
      else
        say "PASS  §CACHE_VERSION_GUARD  gating_changed=$gating_touched version_bumped=$version_touched"
        pass=$((pass+1))
      fi
    else
      say "PASS  §CACHE_VERSION_GUARD  no diff vs origin/main in time_machine.js/schedule_gate.js"
      pass=$((pass+1))
    fi
  else
    say "SKIP  §CACHE_VERSION_GUARD  VIEWER_DIR is origin/main itself, nothing to diff"
  fi
else
  say "SKIP  §CACHE_VERSION_GUARD  VIEWER_DIR is not a git tree (plain export) — cannot diff"
fi

say ""
say "§GATE_4D_RESULT pass=$pass fail=$fail missing=$miss  log=$OUT"
[ "$fail" -eq 0 ]
