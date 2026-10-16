# ARCHIVED 2026-08-27 — the resolved §S6-SPEC engine contract from `prompts/TM_4D5D_VARIANCE_LANE.md`
# Moved verbatim, nothing edited, nothing lost. This is NOT a live task list and NOT a resume pointer.
#
# ⚠ READ THIS FIRST IF YOU CAME HERE TO TRIM THAT FILE FURTHER: **`TM_4D5D_VARIANCE_LANE.md` is a
# LIVE act-from-here lane and is the WRONG file to cut aggressively.** A 2026-08-27 citation sweep
# found SIX prompt files carrying `AUTHORITY:` / `ACT FROM` / `Parent lane:` headers that point at
# it (`RESUME_W0_EARN_ACTUAL.md`, `TM_SHOPFLOOR_COSTING_SPEC.md`, `GW_HOSPITAL_SHOWCASE_SPEC.md`,
# `ZOOM_ACROSS_SCOPE_SESSION.md`, `RESUME_360_KANBAN_PIVOT.md`, `PC_EVM_SPEC.md`, `TM_S4_SHOPFLOOR_BUILD.md`,
# `PP_ORDER_ZOOM_TM_SPEC.md`), four memory files, `internal/LinkedIn.md` ("read this context first"),
# and ~10 `bim-ootb` source/test files carrying `(TM_4D5D_VARIANCE_LANE §Sn)` scope tags. Its stage
# S4 and its whole PHASE-2 arc W1/W2/W3 are still OPEN. **Exactly ONE block in it met the archive
# bar**, and that is what is here.
#
# Why this one block: `§S6-SPEC` declares itself `(resolved 2026-06-21)`; it is the pre-build
# function-by-function contract (`ripple` / `readPhases` / `scheduleWhatIf` / `commitSlip` /
# `discardSlip` / `acceptSlip`) for an engine that has been LIVE since 2026-06-22 — S6 is
# `✅ DONE/LIVE`, bim-ootb PR #474 (engine) + #475 (UI), W-WHATIF 13/13, sw v694/v695. The sweep
# found **ZERO citations of `§S6-SPEC` from outside its own file** — no prompt, no doc, no memory
# entry, no line of `bim-ootb` code or test. It sat mid-way down a STAGES list a session is meant to
# read top-to-bottom to find the next OPEN stage.
#
# ⛔ CONSIDERED AND DELIBERATELY LEFT IN THE PARENT FILE — `§W0-SOURCE-DECISION` (RESOLVED
# 2026-06-22). It looks like this block's twin and it is not: shipped
# `bim-ootb/erp/tests/earn_gw_hospital_actual.js:6` pins it by name under its own banner —
# *"⚠ DO NOT REMOVE — SCOPE: W0 / S5 'EARN THE ACTUAL' (lane prompts/TM_4D5D_VARIANCE_LANE.md
# §W0-SOURCE-DECISION)"*. A live test's scope-of-record is a current citation.
#
# ALSO LEFT IN THE PARENT FILE: the `⚠ DO NOT REMOVE` lane header; §THESIS; §DOCTRINE (five standing
# invariants — and `PP_ORDER_ZOOM_TM_SPEC.md:14` is compliance-bound to it, as is
# `bim-ootb/viewer/time_machine.js:5410`); §STATE; the whole **§DATA** block including its
# `⚠⚠ THE HOSPITAL VARIANCE IS ALREADY BAKED — STOP RE-DISCOVERING IT` grain map, which exists
# because two sessions nearly shipped "it's absent"; every STAGE heading with its GOAL/WITNESS lines
# and ✅ record, including **S4 SHOPFLOOR COSTING, still OPEN** (five witnesses unbuilt); all of
# PHASE 2 (§WEDGE-STRATEGY and W1/W2/W3 — all three still open, memory says `NEXT=W1 W-EAC`);
# §POSITIONING; §MARKET-EVIDENCE (still cited as evidence-of-record, and carrying its own open action
# to re-run the abstained "link-rots" claims); §STARTUP READS; §WITNESS INDEX.
#
# 📌 ONE STALE INBOUND POINTER FOUND BY THE SAME SWEEP, recorded rather than fixed (that file is out
# of this pass's scope): `prompts/RESUME_KANBAN_GRAPHICS.md:62` says *"Resume from
# prompts/TM_4D5D_VARIANCE_LANE.md §S6"* — but §S6 has been `✅ DONE/LIVE` since 2026-06-22. A
# session following it resumes into a closed stage. The live next step is **W1 `W-EAC`**.

## Contents
1. §S6-SPEC — resolved 2026-06-21: the EXTRACT-only F-S what-if engine contract  *(was lines 194–225)*

---

# ▶ ARCHIVED BLOCK — §S6-SPEC (resolved 2026-06-21; S6 shipped LIVE as bim-ootb PR #474 + #475)
# (verbatim from prompts/TM_4D5D_VARIANCE_LANE.md lines 194–225, 2026-08-27)

### §S6-SPEC (resolved 2026-06-21 — EXTRACT-only; the F-S chain is REAL in the seed)
GROUNDING (verified `erp/ad_seed.db` C_Project 990000 'BIM: Hospital'): the 7 C_ProjectPhase rows are ALREADY a
contiguous finish-to-start chain ordered by SeqNo — each phase StartDate == prior phase EndDate (lag=0):
Substructure 06-13→07-06 · Superstructure →2027-05-15 · MEP Rough-in →2028-11-09 · Architecture →2029-03-27 ·
MEP Final →2029-04-30 · Finishes →2029-05-14 · Unsequenced →2029-05-28. The forward-pass proj_fold ran (cursor+=days)
IS the F-S dependency. So the "minimal F-S model" = **SeqNo order is the chain; lag_i = start_i − end_{i-1}** (read
from the baseline, preserved on ripple). NO new dependency table, NO P6 network. Scope = single project's phases.
ENGINE `viewer/whatif.js` (sibling of blue_fold.js, schedule-scoped, node-testable via sql.js — KernelOps op-log
calls are guarded/optional exactly like blue_fold's `var ko=KO()`):
- `ripple(phases, slips)` — PURE F-S forward pass. slips: `{seqno:{startDelta,durDelta}}` (days). phase k:
  newStart=start+startDelta, newDur=max(0,dur+durDelta); for i>k in SeqNo order: start_i=end_{i-1}+lag_i (lag preserved),
  end_i=start_i+dur_i. Returns rippled phase array + projectFinish.
- `readPhases(db, projectId, branchId)` — SeqNo-ordered; branchId=null → official (branch_id IS NULL); branchId set
  → overlay (blue row per seqno if present else official). Mirrors proj_control.contractSum branch param.
- `scheduleWhatIf(db, projectId, slips)` → `{official, blue, forward}`; forward = finishSlipDays + PV-at-asOf on both
  schedules (PV via the SAME linear-fraction × PlannedAmt, BigDecimal — money via site/bigdecimal.js). BAC unchanged
  (same scope) — only dates+PV move = "finish+totals move".
- `commitSlip(db, branchId, projectId, slips)` — ensure branch_id col on C_ProjectPhase; INSERT rippled blue phase
  rows tagged branch_id (downstream re-fold), official rows untouched & invisible-filtered; if KernelOps present also
  `commitGroup` a SCHEDULE_SLIP op on the branch (dot rail / op-log). `discardSlip` = DELETE blue phase rows
  (+KernelOps.discardBranch) → official reverts (never moved). `acceptSlip` = copy blue StartDate/EndDate onto official
  rows, DELETE blue rows (+KernelOps.acceptBranchUpTo) → re-baseline.
WITNESS `erp/tests/whatif_witness.js` (W-WHATIF, whitebox §-log, real 990000 phases): (1) commitSlip on Substructure
+30d → readPhases(blue) every downstream phase shifted +30d & projectFinish +30d, readPhases(official) UNCHANGED;
(2) forward.finishSlipDays==30, blue PV ≠ official PV at a mid as-of; (3) acceptSlip → official now carries rippled
dates; (4) fresh DB → commitSlip then discardSlip → official == original, zero blue rows. proj_control.js UNTOUCHED.
UI ✅ SHIPPED (PR #475, sw v695) — `viewer/whatif_panel.js`: floating "What-if schedule" panel opened by the "What-if"
btn in the Find selection row. Grey official F-S bars + per-phase −/+ slip steppers + blue downstream ripple bars +
header (finish slip / PV move / BAC unchanged) + Accept(commitSlip→acceptSlip→OPFS persist) / Discard. Loads the same
folded project the › ERP push uses (OPFS push-store first, else bundled erp/ad_seed.db 990000). ALL math via
window.WhatIf. Playwright-verified (slip Super +21d→6 downstream re-fold, 2029-05-28→06-18, PV 64.7M→61.1M, accept
re-baselines, 0 errors); wow-shot `docs/figs/whatif_ripple.png`. proj_control.js UNTOUCHED. §-log gated, not visual.
