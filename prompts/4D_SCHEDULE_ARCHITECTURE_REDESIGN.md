# ⚠ DO NOT REMOVE — this is a STEP-BACK ARCHITECTURE STUDY, not a tactical bug chase. Read the log
# after every run, spec-first, no invented dependency edges or rates — same Prime Directive as
# `4D_SCHEDULE_PERFECTION.md`. This file's job is different from that one: that file is a
# chronological tactical log ("chase the next symptom to zero"); this file asks WHY the symptoms
# keep recurring across two months of sessions and proposes a STRUCTURAL fix, not another patch.
# Read this file's `§WHY_ELUSIVE` and `§THE_PATTERN` sections before writing a single line of code.

---

> ℹ **"But `TM_4D5D_VARIANCE_LANE.md` says CPM is THE TRAP — do NOT build it." BOTH ARE TRUE. Read
> this before treating either as a contradiction** (cross-note added 2026-08-27; it was reconciled
> only in a memory file until now, so each session rediscovered the apparent clash).
> `TM_4D5D_VARIANCE_LANE.md:210` reads: *"THE TRAP (explicitly DO NOT build): CPM / resource leveling
> / calendars / critical-path. That is out-P6-ing P6 — a loss."* **That is a PRODUCT-SCOPE rule for
> ONE product surface — the QS/commercial ERP cockpit (its §WEDGE-STRATEGY persona) — and it says so
> in its own closing clause: *"Gaps to close are the WEDGE's, NOT the scheduler's."*** It forbids
> growing the ERP variance/EVM cockpit into a rival scheduler; it does **not** forbid CPM in the BIM
> viewer's 4D engine, which is *"the scheduler"* that clause explicitly carves out. This file IS the
> scheduler's architecture record (`cpm_schedule.js` shipped and live). The variance lane keeps the
> minimal F-S what-if (`viewer/whatif.js`, §S6 ✅ 2026-06-22) and does not grow one.
> ➡ **What WOULD violate the trap:** adding resource leveling, calendars or critical-path *to the ERP
> cockpit's forecast/claim loop* (W1–W3). **What does NOT:** anything in this file.

---

# Purpose

**User's own framing, verbatim (2026-08-16), after a session that shipped a real fix (fleet floating
265→133, bim-ootb PR #1395) and rejected another (storey-order per-element clamp, +81% regression):**
*"Can u update the prompt to truly take a step back to study why all this is so elusive, what
structural design pattern to use, to resolve all the 4D schedule hell? Then we give to a Fable
session to solve it once and for all."* Followed immediately by a concrete, damning example: *"at
present even the simple ground slabs are not done before the beams and walls!"*

That example is real and numerically confirmed, not anecdotal — see §EVIDENCE below. This document is
for whichever session (Fable or otherwise) picks up the redesign: it diagnoses the structural root
cause across ~15 sessions of accumulated patches, names the pattern that resolves it, and lays out a
staged plan that respects this project's fidelity bar (7 buildings, locked witness baselines,
EXTRACT/COMPUTE never invent) instead of a big-bang rewrite that breaks things silently.

---

# §WHY_ELUSIVE — the diagnosis

## The symptom pattern, stated precisely

Every session in `4D_SCHEDULE_PERFECTION.md`'s history (read the file's own EXP1-8 / §TIER2_AFTER_TIER1
/ §HOSTED_BEFORE_HOST / §DOOR_WINDOW_HOST_WALL / §CROSSTASK_JUDGE_PARITY / §STOREY_ORDER_REPORT
sections for the raw evidence) follows the SAME shape: a real construction-plausibility violation is
observed (an element appears before its real support, a storey builds out of order, a discipline
overlaps another it shouldn't) → a NEW, narrowly-scoped repair pass is written to push the offending
elements later → it is measured to fix the reported case → it is later found to have moved OTHER
elements into a NEW violation somewhere else, because it operates on the OUTPUT of a previous pass
without a model of what that pass's own consumers need. Repeat, ~monthly, for 6+ named passes now.

**This session alone reproduced the pattern twice, cleanly, as a controlled experiment:**
- The storey-order fix (`§TIER1_PER_ELEMENT_CLAMP`, this session) was PROVABLY safer *by construction*
  than what it replaced (strictly less element movement, a precedented pattern already shipped once
  elsewhere in this exact file). Measured fleet-wide anyway: floating regressed +81% on 3 of 4
  buildings. A locally-provable improvement produced a globally worse outcome, because the change
  touched SHARED intermediate state (`t1EndZ`, the barrier a *different*, downstream pass depends on)
  that its own local proof never accounted for.
- The window-rounding fix (`§CJP_DAY_ROUNDING_TOL`, this session) worked cleanly, zero regressions,
  fleet floating -49.8%. The difference: it touched a value used ONLY inside its own function's own
  decision, never read by anything else downstream. It is safe for the same reason the storey fix
  wasn't — it doesn't leak into shared state.

That contrast is the whole diagnosis in miniature: **fixes that stay local to one pass's own boundary
condition land clean; fixes that touch anything another pass reads or writes keep breaking, no matter
how carefully the individual change is reasoned about.** With 6+ passes now sharing one mutable
`items[i].s / items[i].e` array, almost nothing IS local anymore.

## The pipeline as it exists today (traced this session, verified against real source)

One element's displayed time passes through, in order:
1. `computeSchedule` (schedule_gate.js) — RAW greedy crew-capacity simulation. Bottom-up by base_z for
   structure (PASS A), by trade for everything else (PASS B). Global shared crew pools, not
   storey-scoped.
2. `deriveZones` / `materializeZones` — groups elements into (phase, storey) zones, authors Gantt task
   WINDOWS from the zone span (a SEPARATE representation from the per-element times, historically
   diverging from them — `§ZONE_DISPLAY_AUTHORING`, 2026-08-15, was the biggest attempt yet to
   reconcile this specific divergence).
3. `_tier1Serialize` — enforces Substructure→Superstructure→Architecture order, but only as a UNIFORM
   PER-ZONE SHIFT sized off the group's earliest/latest element, not a per-element precedence edge.
4. `_tierAuditRegate` — a SEPARATE, whole-building DAG re-gate pass, iterated up to 6 rounds with
   step 3, using bearing/hang physics distinct from every other pass's own copy of that same physics.
   Documented as **78–90% of Terminal's entire 4D-generation wall time** (§TIER_REGATE_WORKLIST) —
   because it is a repeated full-array rescan to a fixpoint, not a single pass over a precomputed graph.
5. `§TIER2_AFTER_TIER1` — clamps every Tier-2 (MEP/Finishes) element in a zone to that zone's Tier-1
   completion, computed from whatever step 3+4 left behind.
6. `§HOSTED_BEFORE_HOST` / `§DOOR_WINDOW_HOST_WALL_DISPLAY` — two MORE passes, each patching a specific
   cross-zone relationship (a hosted fixture vs its host wall) that steps 3-5 broke, because those steps
   are zone-scoped and a fixture + its host wall are routinely in different zones.
7. `_midairRepair` — a general "no element before its first contact" fixpoint, window-bound, using
   ANOTHER copy of the support-contact predicate (via `_contactGraph`).
8. `_capWindowRescale` / `applyGapClampRescale` — a per-task LINEAR RESCALE fitting element times into
   the Gantt window authored in step 2 — a reconciliation pass that exists ONLY because steps 1-7 and
   step 2 are not the same schedule.
9. `_ogSupportSweep` — YET ANOTHER support-physics pass, with its OWN, narrower carrier-candidate
   predicate than `_contactGraph`'s (see §EVIDENCE — this exact gap needed three separate patches,
   §OG_HANG_BAND / §OG_HANG_UNBOUND / §XRAY_WALL_SCOPE, each just widening it closer to what the judge
   already accepted).
10. `_cjpJudgeParity` — closes the remaining gap between the judge (`_contactGraph`) and what step 9
    could reach, window-bound (this session added the 1-day rounding tolerance here).
11. `_contactGraph` / `floatingCensus` — THE JUDGE. Computed independently of every step above. Nothing
    that ran in steps 1-10 is even the same code path as this — it is a completely separate re-derivation
    of "what supports what."

**That is eleven passes, five of them independently re-deriving some version of "what physically
touches/supports what," none of them sharing a single graph.** No wonder a fix to any one of them keeps
resurfacing a symptom in a different one.

## §EVIDENCE — the same defect, three independent times, all found by this project itself

1. **Two schedules, not one.** RAW (`computeSchedule`) vs DISPLAY (`_twoTierRemap`+`_midairRepair`) were
   two genuinely different timelines for most of this project's life; `§ZONE_DISPLAY_AUTHORING`
   (2026-08-15) unified WHICH one authors the Gantt window, but the reconciliation is still a rescale
   pass (step 8 above), not structural unification — there are still two representations (continuous
   element ms times vs day-rounded window boundaries) requiring this session's `§CJP_DAY_ROUNDING_TOL`
   patch to paper over their mismatch.
2. **Five independent copies of "what supports what."** `_contactGraph` (the judge), `hangGate` (the
   generative engine), `_buildXraySupportCache`, `auditFloating()` (schedule_gate.js), and
   `_ogSupportSweep`'s own inline predicate all separately encode "is S a real physical carrier of T,"
   with different tolerances, discovered out of sync with each other over and over: §OG_HANG_BAND
   (2026-08-15) widened `_ogSupportSweep`'s search radius from 0.5m to 9.5m to match the judge; five
   commits later `§OG_HANG_UNBOUND` widened it AGAIN because 9.5m was ALSO wrong, to match `hangGate`'s
   own unbounded definition; `§XRAY_WALL_SCOPE` fixed a THIRD copy the same session. Same relationship,
   patched into agreement piecemeal, four separate times, because it was never one function.
3. **Storey/build order was never an edge.** `§4D_BAND_MONOTONIC` in `computeSchedule` only ever RANKS
   storeys (median base_z), it does not GATE anything on that rank — and `_tier1Serialize`'s uniform
   shift enforces discipline order per zone, never storey order across zones. This session's
   `§STOREY_ORDER_REPORT` probe proved the consequence numerically: RAW is often clean (Clinic 0/6
   violations) but the DISPLAY remap introduces violations on 4/4 buildings measured — because nothing
   in the pipeline ever asserts "Level 2 cannot start before Level 1," it only ever asserts phase order
   WITHIN whatever zone the element already landed in.

**The user's live report — "ground slabs not done before beams and walls" — is the same defect, most
basic case.** Confirmed numerically this session, not eyeballed: Hospital's shipped, post-all-fixes
state (`§EXP8_FINAL_BYCLASS`, `probe_captured_floating.js`) still shows **32 columns, 11 beams, 4 pipe
fittings, and 2 footings among its 51 still-floating elements** — i.e. beams and footings routinely
displayed appearing before whatever they physically rest on, even after eleven repair passes. If the
graph-of-real-relationships existed once and were solved once, a beam appearing before its own footing
would be **structurally impossible**, not something to chase to a smaller residual, forever.

## Why this happened (not a criticism, a diagnosis of the growth pattern)

Every one of the eleven passes above was added to fix ONE observed, real, correctly-diagnosed symptom,
under the project's own good discipline (measured, witnessed, never invented). None of them is wrong on
its own terms. The defect is that no session ever had the budget to ask "should this be a new pass, or
a new edge in one graph" — so the answer was always "a new pass," and the passes accumulated faster
than any one of them could be fully reasoned about against all the others. This is the textbook failure
mode of a compiler with many independent peephole-optimization passes and no shared canonical
Intermediate Representation (IR): each pass is locally correct, the composition is not, and every new
symptom looks like it needs its own new pass — because, in this architecture, it does.

---

# §THE_PATTERN — what actually resolves this

## Name it: this is Critical Path Method (CPM) scheduling, and the codebase doesn't do it

**CPM/PERT (textbook operations research, exactly what commercial 4D tools like Primavera P6 and MS
Project implement) is: build ONE directed acyclic graph where a node is an activity and an edge means
"B cannot start until A reaches some state," then compute every node's earliest-start time in a SINGLE
forward pass over the graph in topological order.** This is not a new idea to invent — it is the
80-year-old, textbook-correct answer to exactly the problem this file has been fighting by hand since
2026-06. Its correctness proof is elementary (induction over topological order: a node's start is
`max(predecessor.finish)` over all real predecessors, so no node can ever be scheduled before a real
predecessor by construction) and its cost is linear in `V + E` — ONE pass, not an iterated fixpoint.

## The concrete redesign

1. **One edge-computation phase, run once, before any scheduling.** Every "is B blocked on A" fact this
   codebase currently re-derives 3-5 times (structural bearing/hang/embedded contact, host/opening
   pairs, discipline order, storey order) becomes an EDGE in one graph, computed from the SAME real
   geometry query every consumer shares — not five independently-tolerance-tuned copies. Concretely:
   - Physical contact/bearing/hang/embedded edges: `_contactGraph`'s own spatial-grid algorithm (already
     O(N), not O(N²) — keep it) becomes THE one definition. `hangGate`, `_buildXraySupportCache`,
     `auditFloating()`, `_ogSupportSweep`'s inline predicate are deleted, not re-synced a fifth time.
   - Host/opening edges: `ScheduleGate.hostPairs`/`openingPairs` already exist as a single shared
     definition (this pattern is ALREADY right for this one relationship — extend it, don't re-invent).
   - Discipline-order edges: instead of `_tier1Serialize`'s uniform per-zone shift, a real edge from
     "every element of phase *k* in zone Z" to "every element of phase *k+1* in zone Z" — or, to avoid
     an edge explosion, a single summary edge per zone from phase *k*'s LATEST element to phase *k+1*'s
     EARLIEST element (this is exactly what CPM calls a "finish-to-start" activity link at the summary/
     hammock level, standard technique, not a new invention).
   - Storey-order edges: THE MISSING PIECE. A summary edge (same hammock pattern) from each storey's
     relevant completion to the storey above's start, per discipline — this is the edge that has NEVER
     EXISTED in this codebase, which is why every attempt to enforce storey order by warping an
     unrelated mechanism (the Tier1 shift) either doesn't reach far enough (uniform shift) or breaks
     something else (per-element clamp, this session's rejected attempt). Once it is a real edge, the
     forward pass enforces it for free, same as every other edge, no special-case mechanism needed.
2. **One scheduling phase: topological sort + forward longest-path.** Replaces `_tier1Serialize` +
   `_tierAuditRegate` + `§TIER2_AFTER_TIER1` + `§HOSTED_BEFORE_HOST` + `§DOOR_WINDOW_HOST_WALL_DISPLAY`
   + `_midairRepair` + `_ogSupportSweep` + `_cjpJudgeParity` — eight passes — with ONE. Every edge from
   phase 1 is honoured simultaneously, by construction, in one linear-time pass. No iteration, no
   "did anything move this sweep," no 16-sweep cap, no window-bound special case (see point 4).
3. **Windows are DERIVED, never separately authored.** A Gantt task's window = `[min(start), max(end)]`
   over the (already-correct) per-element times of that (phase, storey) group, computed AFTER
   scheduling. This deletes `materializeZones`' independent window authoring, `_capWindowRescale` /
   `applyGapClampRescale`, and this session's own `§CJP_DAY_ROUNDING_TOL` patch — there is no window to
   round-trip against, because the window is a VIEW of the one true schedule, not a second schedule.
4. **The judge becomes a pure verifier, not a repair target.** `floatingCensus`/`_contactGraph`
   (renamed/kept as the edge-builder from point 1) still runs — but its job changes from "measure how
   much is still broken after eleven repair attempts" to "assert the graph-building step didn't miss a
   real edge." A nonzero result after the CPM pass is a GRAPH CONSTRUCTION BUG (a real contact the edge
   phase failed to detect — e.g. a spatial-grid cell-size or tolerance issue), not a scheduling failure
   to chase with a twelfth repair pass. This is a genuinely different, much smaller class of bug to
   debug, and it's debuggable by inspecting ONE graph, not by tracing state through eleven mutating
   passes.

## §WHAT_STAYS — do not throw out crew-capacity scheduling

**Combining precedence (CPM) with scarce shared-resource contention (crew capacity) is a genuinely hard
problem** — Resource-Constrained Project Scheduling (RCPSP) is NP-hard in general; there is no simple
"just add crew-capacity as more edges" trick that stays linear-time. `computeSchedule`'s existing greedy
crew-slot allocation (claim earliest-available slot of N, bottom-up by base_z) is a reasonable, already-
working heuristic for that SEPARATE problem — it is not where the eleven-pass mess lives, and this
redesign should not touch it. The right integration: run crew-leveling FIRST (as today) to get each
element's resource-constrained earliest-possible time, feed that into the CPM graph as one more kind of
lower-bound edge (a synthetic "cannot start before `<crew-available-time>`" edge from a virtual source
node), and let the ONE forward pass reconcile resource bounds and precedence edges together in the same
linear pass. Do not attempt to make crew-leveling itself precedence-aware in the same breath — that's a
second research project, not this one.

---

# §EXECUTION_PLAN — staged, measured, never a big-bang replace

This touches the highest-blast-radius code in the project — every one of the 7 shipped buildings'
locked witness baselines (`witness_tier_serial_display.js` W-TS-1b's exact `dagWins` counts,
`witness_midair_zero.js`'s `FLOAT_AFTER_BASELINE`/`ORPHAN_BASELINE`, `witness_crosstask_judge_parity.js`)
depend on the CURRENT pipeline's exact behavior. **A same-session full replacement is not the ask here
and would violate this project's own measure-before-build discipline** (see CLAUDE.md Spec-First,
Anti-Drift, and this very file's own EXP5a/EXP5b/§TIER1_PER_ELEMENT_CLAMP rejected-experiment history —
every one of those was rejected specifically because it was measured broadly BEFORE being trusted).

1. **Build the edge-computation phase and the CPM forward-pass as a NEW, side-by-side module** —
   does not replace anything yet. Feed it the same 7 buildings' extracted DBs.
2. **Verify the new pass's own output against ground truth, not against the old pipeline's baselines**
   (those baselines encode the OLD pipeline's bugs — do not treat them as correct). Ground truth here
   means: zero elements start before any of their real contact-graph predecessors (this is now provable
   by construction, but verify the graph-construction step itself found every real edge — cross-check
   against `_contactGraph`'s existing spatial-grid population counts per building as a sanity bound).
3. **Compare wall-clock cost.** The new pass should be FASTER than today's `_tierAuditRegate` alone
   (documented 78-90% of Terminal's whole 4D-gen time) since it replaces an iterated fixpoint with one
   linear pass — measure this explicitly, it's a real, checkable prediction of this redesign, not a
   hand-wave.
4. **Only after 1-3 are clean on all 7 buildings**, propose (do not silently execute) retiring the
   eleven old passes one at a time, oldest-and-narrowest-scope first, re-running the FULL existing
   witness suite after each retirement to catch any behavior the new pass doesn't yet cover. Update
   locked witness baselines only with an explicit, measured, written justification — same discipline
   `§CJP_DAY_ROUNDING_TOL`'s witness update used this session.
5. **The storey-order and "ground slab before beams" symptoms are the acceptance bar**, not a vague
   "feels better": re-run this session's `§STOREY_ORDER_REPORT` probe (still live in
   `probe_captured_floating.js`) and the `§EXP8_FINAL_BYCLASS` per-class floating breakdown before and
   after — 0 violations, 0 structural elements (footing/column/beam/slab) in the floating byClass
   breakdown, is the actual, numeric, non-negotiable target this redesign exists to hit.

---

# §GUARDRAILS — standing project rules this MUST still follow (condensed; read the source for full text)

- **EXTRACT/COMPUTE, NEVER INVENT (`CLAUDE.md` Prime Rule).** Every edge in the new graph traces to a
  real geometry query or a real, named business rule (discipline order, host/opening pairs) — never an
  invented tolerance. If a genuinely new tolerance is unavoidable (as `§CJP_DAY_ROUNDING_TOL`'s 1-day
  bound was this session), it must be DERIVED from an existing quantum already in the data (as that one
  was, from the window's own day-rounding), named, and measured — not guessed.
- **Spec-First.** Write the spec section for the edge-computation phase and the CPM pass BEFORE code,
  same as every other change in this file's history.
- **Measure before trusting (Anti-Drift, this file's own EXP5a/EXP5b/§TIER1_PER_ELEMENT_CLAMP
  precedent).** A locally-provable improvement is not evidence of a globally-safe one — every stage of
  §EXECUTION_PLAN above ends in a full-fleet measurement, not a single-building spot check.
- **§ Log Mandate.** Every run's `§`-tagged log lines are the evidence, read them, never trust exit code
  or a visual/screenshot (`CLAUDE.md` FUNDAMENTAL LAW — this applies to schedule correctness exactly as
  much as it applies to camera paths).
- **Push freely once measured** (`CLAUDE.md` §PUSH PAUSE — LIFTED), but this specific redesign's blast
  radius means each stage of §EXECUTION_PLAN should land as its own reviewable PR, not one giant commit.

---

# §CPM_SPEC — the side-by-side module (2026-08-16, Fable session, spec-first per §GUARDRAILS)

**Deliverable (stages 1–3 of §EXECUTION_PLAN):** `viewer/cpm_schedule.js` (UMD, node+browser, same
loading shape as `schedule_gate.js`) + `scripts/probe_cpm_schedule.js` (fleet harness, reuses
`probe_captured_floating.js`'s DB/rates/element loading verbatim). Replaces NOTHING yet.

## Nodes
- One node per scheduled element (guid). Duration = crew-leveled duration from `computeSchedule`
  (§WHAT_STAYS — crew-leveling untouched, runs first).
- Synthetic milestone nodes (dur=0), hammock pattern: per (level, phase) completion where needed by
  E3/E4 below. Level = `ScheduleGate.collapsePhase(storey)`; level ORDER = real mean `base_z` of the
  level's own elements (extracted, never invented — same math as `storeyOrderReport`).

## Edges (every edge traces to a real geometry query or an already-shipped named rule)
- **E1 support (physics), start-to-start:** for EVERY element with a non-null `_contactGraph`
  contacts list (grounded or not — §GROUNDED_OVERRIDE_FIX precedent), ONE designated-support edge
  S→T meaning `ES(T) ≥ ES(S)`. The judge (`floatingCensus`) requires `min over ALL contacts ≤ s`;
  the designated support is a member of that contact set, so judge-zero holds by construction.
  Designation is deterministic, preferring the physically-primary relation: bearing-below first
  (highest `tz` = nearest below), else embedded (smallest `|S.bz − T.bz|`), else carrier-above
  (lowest `bz` = nearest above); final tie-break guid. Start-to-start (not finish-to-start) because
  that is the judge's own shipped contract ("may not APPEAR before the first element it touches
  APPEARS" — starts compared, `_midairAudit`).
- **E2 host/opening, finish-to-start:** `ScheduleGate.hostPairs` + `openingPairs` (the one shared
  definition, already right) — `ES(T) ≥ EF(host)`, matching the shipped push-to-host-END semantics
  of §HOSTED_BEFORE_HOST / §DOOR_WINDOW_HOST_WALL_DISPLAY.
- **E3 discipline hammocks, per level:** Tier-1 chain milestones (Substructure→Superstructure→
  Architecture, `_TIER1_ORDER`) — phase k's elements' finishes → M(level,k) → phase k+1's elements'
  starts; plus M_T1complete(level) (all Tier-1 finishes at that level) → every Tier-2 element's
  start at that level. This IS §TIER2_AFTER_TIER1's per-element clamp contract — safe here because
  there is no downstream pass reading `t1EndZ` to disturb (the +81% failure mode was pass-ordering,
  not the clamp itself).
- **E4 storey hammocks, per phase (THE MISSING EDGE):** M(phase P, level k) completion → every
  element of (P, level k+1)'s start, levels in real base_z order. Skipped for elements with no
  storey.
- **E5 crew lower bound, per-element** (§OPEN_QUESTIONS 2 DECIDED: per-element, not per-zone — the
  weakest bound that preserves per-element crew-contention visibility; a per-zone bound would
  re-create exactly the block-shift distortion the §TIER1_PER_ELEMENT_CLAMP experiment measured):
  `ES(T) ≥ computeSchedule(T).start` as a virtual-source bound, no explicit edges.

## Solve
Kahn topological order; `ES(T) = max(E5 bound, max over in-edges)`; `EF = ES + dur`. **Cycle policy
(§TIER_DAG_WINS doctrine — physics beats phase tidiness):** if Kahn stalls, drop hammock (E3/E4)
edges among the stalled set first, log `§CPM_CYCLE_BREAK` counts by edge type; if still stalled
(pure-physics cycle, e.g. Clinic's parapet/roof loop), drop support in-edges of the lowest-`bz`
stalled node iteratively, logged. Deterministic, no fixpoint, no sweep cap.

## Windows
DERIVED ONLY: task window = `[min(ES), max(EF)]` over the (phase, level) group, after solve
(§THE_PATTERN point 3). No authored window, no rescale, nothing to round-trip.

## Acceptance (stage 2, numeric, per §EXECUTION_PLAN 5)
- `floatingCensus` on CPM output, all 7 buildings: **0 structural (footing/column/beam/slab)
  floating; total midair confined to cycle-break population, target 0.** Orphans unchanged
  (extraction fact, not schedulable).
- `storeyOrderReport` at LEVEL granularity: **violations = 0 on all 7.**
- Graph sanity: node/edge counts per building logged vs `_contactGraph` population counts.
- Makespan + per-phase extents logged vs shipped display for drift visibility (not a pass bar).

## Wall-clock (stage 3)
Time CPM build+solve vs the probe's existing repair chain (`applyGapClampRescale` +
`_ogSupportSweep` + `_cjpJudgeParity` + `_midairRepair`) on the same items, same node process, all
7 buildings — prediction: CPM linear-time, faster.

---

# §CPM_STAGE13_RESULTS — stages 1–3 BUILT + MEASURED (2026-08-16, Fable session, bim-ootb PR #1396)

**Deliverables live on branch `feat/cpm-4d-schedule` (PR #1396, auto-merge armed):**
`viewer/cpm_schedule.js` + `scripts/probe_cpm_schedule.js`. Side-by-side only — zero shipped-code
changes. Logs: session scratchpad `cpm/fleet3.log` (full §-trail; re-runnable any time via
`node scripts/probe_cpm_schedule.js`).

## The headline number
**Floating = 0 on ALL 7 buildings** (judge = the same `_contactGraph`/`floatingCensus` math, run as
an independent sliced copy, §CPM_PARITY exact). RAW crew-leveled baseline per building: Duplex 21,
Clinic 428, HHS 193, JKR 184, Hospital 1,401, Terminal 558, LTU 1,336. The shipped 11-pass pipeline's
best-ever residual is 133 fleet-wide; the CPM pass leaves **0, including 0 structural** — the doc's
non-negotiable target, hit on the first fleet measurement. `§CPM_GATE_CHECK` (every non-dropped edge
honoured by the solver, asserted independently) = 0 on all 7. A beam before its footing is now
structurally impossible, as §THE_PATTERN predicted.

## What it took beyond the spec (one addition, precedented)
**§CPM_STRAGGLER_MEMBERSHIP** — the naive spec graph (all elements feed their group milestone) fused
into one giant SCC per building (hanging elements' E1 edges point down-level; the hammock lattice
points up; everything became mutually reachable and the first cycle-break attempt dropped ~90% of
all hammock edges). Fix: one maxAncestor-(level,phase)-key propagation over the physics-only
condensation; an element whose physics ancestry reaches a LATER group than its own is a dag-wins
straggler (the shipped `_exempt`/`_t1Straggler` population, expressed as graph construction) — it
never FEEDS its gate milestone, still RECEIVES every gate. Result: hammock cycles impossible by
construction — measured cycleDrops = 0 on all 7 (only pure-physics SCCs remain, contracted to a
shared start, which the judge's own start-vs-start test accepts with equality; fsViolInScc 0–127,
counted). Stragglers: Duplex 315/1119 → LTU 45,638/122,330 — counted, never hidden.

## Storey order (the user's live symptom)
Strict per-level p50 report (`§CPM_STOREY_LEVEL`, same math as §STOREY_ORDER_REPORT): CPM improves
or matches the RAW baseline on ALL 7 — Duplex 0→0, Clinic 0→1, HHS 0→0, JKR 9→2, Hospital 1→0,
Terminal 7→3, LTU 10→4. The residual 10 inversions across 4 buildings DECOMPOSE (straggler % now in
`§CPM_STOREY_PHASE` detail): (a) **federated storey-ladder pairs** — Terminal's Kedai/Jalan/Tanah
blocks, LTU's VÅNING-vs-VÅN-vs-Plan-vs-Storey Swedish sub-model ladders, JKR's "00 Ground Level"/"00
Ground Floor"/"01 Ground Floor Level" triplets — separate ladders sharing a z-range that
`collapsePhase` z-sorts into one global order; the extracted DBs carry NO federation column
(`elements_meta.building` is single-valued, checked LTU), so per-sub-model chaining cannot be
EXTRACTED — same status as orphans: a data limit, named, not a scheduling bug; (b) **straggler-
dominated medians** — every violating group pair is 50–100% stragglers (physics-forced-late
population, §TIER_DAG_WINS doctrine: counted, never hidden). Zero violations survive that aren't one
of these two classes.

## Wall-clock (stage 3 prediction: confirmed where it matters)
CPM total (contact graph + build + solve): Duplex 23ms, Clinic 166ms, HHS 96ms, JKR 99ms, Hospital
662ms, Terminal 387ms, LTU 1,123ms. Comparator = ONE `_tierAuditRegate` call (the documented 78–90%
of Terminal's whole 4D-gen wall time; `_twoTierRemap` calls it up to 7×): Terminal 387ms vs 1,467ms
(**3.8× faster than a single call of the one pass**, i.e. ~26× vs its 7-call reality, before
counting the other 7 passes CPM replaces). Smaller buildings: same order of magnitude either way
(both <200ms) — the win scales with exactly the buildings that hurt today.

## §CPM_DISPLAY — STAGE 4 STEP 1 SHIPPED (2026-08-16, same day, bim-ootb PR #1398; user go:
## "of course u have to go resolve till zero" + "gantt chart progress needle is the truth")
The CPM engine now AUTHORS the display timeline the user watches. Verified at three layers, all
§-numbers: (a) node display-path probe (`probe_cpm_display_path.js`, the full captured chain
windows→rescale→judge-parity→census): **final floating 0 on all 7 buildings**, window fidelity
97.97–100%; (b) LIVE headless viewer, Terminal, Time Machine on: **§CROSSTASK_JUDGE_PARITY
floating=0/48,428** (was 259 live that morning), §CPM_DISPLAY midair=0, 72/72 tasks affine
reSpaced=0; (c) `gate_4d.sh` 7/7, witness_zone_display_authoring 16/16 (new W-ZDA-6),
witness_midair_zero 39/39. Three structural findings the wiring itself surfaced, each fixed the
architecture-true way, all measured:
1. **The rescale was the manufacturer.** Handing the _cap overlay a 0-floating CPM timeline, the
   gap-clamp re-spacing alone created 4,712 violations on Terminal — §THE_PATTERN point 3
   confirmed live. Fix: §CAP_RESCALE_IDENTITY — an identity task (window duration == its own
   envelope within the 2-day floor/ceil quantum) is affine-rebased shape-exact, never re-spaced;
   a planner-resized bar still rescales (Gantt edits keep reaching the movie).
2. **Windows must be envelopes, not roundings.** §ZONE_ENVELOPE_DAYS: display-authored windows are
   floor(start)/ceil(end) of their own times — the needle BOUNDS appearance, no sub-day protrusion.
3. **A THIRD two-schedules instance found and killed:** the two display-timeline consumers
   (kernel_ops seam vs materializeZones hook) build elements through different recipes
   (time_machine's vs schedule_author's) — measured live: same 48,428 elements, makespans 151.2d vs
   121.2d, 36/72 windows mismatched, floating 9. Fix: §CPM_DISPLAY_ONE_TRUTH — whichever consumer
   computes first is THE schedule; the partner call of the same generation cycle consumes it
   one-shot (a rates/shift edit is never served stale). Unifying the two element recipes outright is
   named below as retirement work, not patched here.
`?cpm4d=0` reverts to the legacy chain (kept intact). `_GANTT_CACHE_VERSION` 27→28, sw.js v1046.
Pre-existing main failures untouched: witness_door_window_host_wall W-DWH-1b,
witness_big_element_support_coverage crash (both fail identically on clean origin/main).

## §ZONE_WINDOW_DAGWINS_CLIP — the readability follow-through (2026-08-16, same day, bim-ootb PR
## #1399; user live report post-#1398: "eating up lots of mem resources, hangs a bit, and the
## schedule looks gibberish")
Reproduced headlessly on Hospital (real viewer, TM on) before touching anything: every task bar ran
2026-08-16→2027-09-07 — the derived min/max windows were smeared by each group's dag-wins
stragglers (11,215/63,415). Three fixes, all measured, live cascade now
Substructure Aug 16-18 → Superstructure Aug 17-23 → Architecture Aug 22-Oct 17…:
1. **§ZONE_WINDOW_DAGWINS_CLIP** — window authoring clamps straggler times into their group's
   non-straggler envelope (`_tier1Extents` precedent: `_t1Straggler` was always excluded from
   extents). Ops keep true physics times; stragglers ride outside their bar (fleet-wide 166–17,774
   per building, logged as stragglerOutside; the bar for non-stragglers is 0 outside, asserted).
   **⛔ RETIRED 2026-08-16 (bim-compiler `prompts/4D_GANTT_TM_REFACTOR.md` §STAGES S2, bim-ootb PR
   #1402) — this min/max-over-non-stragglers FORMULA is superseded, the `§ZONE_WINDOW_DAGWINS_CLIP`
   § TAG stays (kept on the successor code, per that spec's own M2 instruction).** Terminal's
   "stragglers = the mass" failure mode (§DIAGNOSIS in the refactor doc: 14,129/48,428 elements
   classified stragglers, a bar drawn from the remaining 3% sliver) is what forced the replacement:
   a Tukey-fenced robust envelope (Q1−1.5·IQR..Q3+1.5·IQR over ALL group members' true times,
   clamped to actual min/max) computed in `_tmDisplayRemap`, classification-free — no
   straggler/non-straggler split at all. Right on both Hospital-shaped (late-tail) and
   Terminal-shaped (straggler-mass) buildings by construction, where this fixed classification
   undercounted/overcounted depending on shape. See the refactor doc's dated 2026-08-16 §S2 section
   for full before/after numbers.
2. **§CAP_RESCALE_SKIP** — display-authored windows are VIEWS; the load-path rescale is skipped
   outright. Both softer attempts measured and rejected first: gap-clamp re-spacing manufactured
   4,712 violations from a 0-floating timeline; a rigid per-task shift still broke 537 cross-task
   pairs (34 unrepairable: stragglers sit outside their window, §CJP is window-bound). Bar edits
   are unaffected — the Gantt edit machinery mutates element times directly.
3. **§CPM_DISPLAY_EPOCH** — the one-truth reuse rigid-shifts the cached timeline onto the
   requester's epoch (measured live: epochShiftDays=20672.7 — hook computes at epoch 0, seam at
   `_cap.base`; uncovered ops were landing in 1970. Latent in #1398, surfaced by reading, fixed).
Also: `§GANTT injected` now prints the real ops anchor (was the serial-clock cosmetic
`start=2/22/2023, 1271 days` on a 388-day schedule). Verified: fleet probe 7/7 (floating 0,
nonStragglerOutside 0), gate_4d 7/7, W-ZDA 16/16 (W-ZDA-6 rewired to judge the OPS timeline, not
the window view), W-MZ 39/39. `_GANTT_CACHE_VERSION` 29, sw v1047.
**Still open from the report (named, not fixed):** TM activation ≈20s on Hospital-63k — 7.2s is the
pre-existing chunked kernel_ops write (`§WRITE_LOOP_TIMING rows=63415 ms=7190`), plus the double
generative run (the seam recomputes `computeSchedule`+`§GEO_ORDER` then discards them on reuse —
only `_sched` feeds the §SUPPORT_CHECK audit). Heap +~390MB during activation on a 63k model.
A perf pass on activation is the natural next lane item, distinct from correctness.
**UPDATE 2026-08-16 (`4D_GANTT_TM_REFACTOR.md` §STAGES S4, bim-ootb PR #1404):** the double
generative run was fixed (`§S4_RAW_SCHEDULE_REUSE`, ~1.5s saved) — but the FULL activation cost was
finally measured end-to-end (previously only estimated) and the write loop turned out to be one of
several comparably-sized costs, not the whole story: `materializeZones`' own first-time computation
(~4.3s, necessary, not dead work) and an unresolved ~4s gap outside `time_machine.js` entirely were
found too. Measured floor after the one authorized fix: ~20.8-23.2s. **Target 10s NOT reached** —
the remaining dominant costs all require touching locked behavior (kernel_ops write mechanics,
`computeSchedule` internals) or code outside this module not yet root-caused. Full breakdown in the
refactor doc's dated §S4 section. Heap has not been re-measured since #1399.

## ➡ HANDOFF (2026-08-16 evening): the bar-shape/level-semantics refactor is SPUN OUT to
## `prompts/4D_GANTT_TM_REFACTOR.md` — measured diagnosis (Terminal: 49/72 tasks as equi-shaped
## 1-2-day bars at day 149-150; E4 chains 22 non-stacked federated pseudo-levels; bars =
## non-straggler slivers on wall-carried buildings), the M1-M4 model, staged plan with numeric
## acceptance, and Sonnet dispatch rules live THERE. This file stays the engine's architecture
## record; the retirement proposal below remains open behind that lane.

## §STAGE4_RETIREMENT_PROPOSAL — steps 2-5 still propose-first (step 1 SHIPPED above)
Wire order, each its own PR, full witness suite after each: (1) ✅ SHIPPED #1398 (§CPM_DISPLAY
above); (2) retire `_ogSupportSweep` + `_cjpJudgeParity` +
`_midairRepair` (fully subsumed by E1 — judge-zero by construction); (3) retire `_tier1Serialize` +
`_tierAuditRegate` + §TIER2_AFTER_TIER1 + §HOSTED_BEFORE_HOST + §DOOR_WINDOW_HOST_WALL (subsumed by
E2/E3 + gates); (4) derive Gantt windows from CPM times, retiring `_capWindowRescale`/
`applyGapClampRescale`/`§CJP_DAY_ROUNDING_TOL`; (5) `_contactGraph` consumers collapse onto
`CpmSchedule.contactGraph` (parity already asserted). Baseline updates need the written-justification
discipline §CJP_DAY_ROUNDING_TOL used. The step-1 open question (where CPM times enter zone authoring) is RESOLVED by
§CPM_DISPLAY_ONE_TRUTH; new named retirement item: unify the TWO element-building recipes
(time_machine's inline build vs schedule_author._buildScheduleElements) into one shared function —
the one-shot reuse papers over their skew correctly but the second recipe is still dead weight.

---

# §OPEN_QUESTIONS — status after §CPM_STAGE13_RESULTS (2026-08-16): 1 MEASURED (combined graph ≤
# ~360k edges + ~66k membership edges on LTU's 122,330 elements, build 287ms — fine), 2 DECIDED
# (per-element, see §CPM_SPEC E5), 3 PARTLY MOOT (E1 uses the unbounded contact graph directly, so
# §OG_HANG_BAND/§OG_HANG_UNBOUND die with their pass; §HOSTED_BEFORE_HOST's IfcCovering pool rides
# hostPairs unchanged; §XRAY_WALL_SCOPE lives in `_buildXraySupportCache` — audit at stage-4 step 5).

1. **Edge granularity at scale.** LTU_AHouse has 122,330 elements. Per-element discipline/storey summary
   edges (hammock links, point 1 above) keep the graph small; per-element PHYSICAL contact edges already
   exist today via `_contactGraph`'s spatial grid and are the right granularity for THOSE — but the exact
   node/edge count budget for the combined graph across all 7 buildings hasn't been measured. Measure
   before assuming it's fine.
2. **Where crew-leveling's lower-bound edges get injected** (§WHAT_STAYS) — as a per-element synthetic
   edge, or a per-zone one — affects both graph size and whether crew-contention effects stay visible
   per-element or only at the aggregate zone level the Gantt shows. Needs a decision, not a default.
3. **What happens to the eleven old passes' NAMED, hard-won special-case knowledge** (§OG_HANG_BAND's
   9.5m measured carrier-distance band; §HOSTED_BEFORE_HOST's specific IfcCovering support-pool fix;
   §XRAY_WALL_SCOPE's promoted-roof-slab wall restriction). These are real, measured facts about this
   project's actual buildings' geometry, not implementation accidents — the new single edge-builder
   needs to absorb every one of them as a parameter/rule, not silently drop them and regress a fixed bug.
   Audit each named `§`-tag in `time_machine.js`'s support/contact code before deleting the function it
   lives in.

---

# §LANE_FILE_TOPOLOGY — should `4D_MODEL_INTEGRITY.md` and `4D_GANTT_TM_REFACTOR.md` MERGE?
# ANSWER: NO — but three things are in the wrong file, and that is the real defect (2026-08-27)

**Why this lives here.** This file's own `➡ HANDOFF (2026-08-16 evening)` is what CREATED the split
being questioned — it spun the bar-shape/level-semantics work out to `4D_GANTT_TM_REFACTOR.md` and
declared *"This file stays the engine's architecture record."* A question about whether that split
still holds belongs against the record that made it. Nothing was changed in either of those two
files by this pass; both were being actively edited the same day. **This is a recommendation only.**

**The question, from the user (2026-08-27):** prompt-file bloat and fragmentation across too many
separate files is a suspected contributing cause of this lane's recurring thrash (re-deriving
settled findings, missing cross-references). Do those two files — both actively growing, both about
4D scheduling — now overlap enough to become one?

## The finding: they own genuinely different concerns, and both are correct as-is

Read in full, 2026-08-27 (`4D_MODEL_INTEGRITY.md` 1,061 lines; `4D_GANTT_TM_REFACTOR.md` 5,836
lines). They are not two views of one subject:

| | `4D_MODEL_INTEGRITY.md` | `4D_GANTT_TM_REFACTOR.md` |
|---|---|---|
| the question it answers | **can the MODEL express the answer?** | **does the GESTURE reach the stored timeline and back?** |
| its core artefact | **§I OWNERSHIP TABLE** — which function owns each relation | **🗺 DEBUG MAP** — 8 edit entry points × 7 obligatory steps |
| what it fails at | a relation re-derived instead of called (§G.0: four times in one session) | a step skipped in the edit pipeline (five shipped defects, §S67–§S78) |
| its unit of evidence | a geometry/relation measurement (§E, §H, §J) | a §-tag on the edit path, an IDB key, a canvas pixel row |
| what it must never do | author order from geometry (§B: AUDIT never DECLAREs) | recompute schedule timing downstream (§VERIFICATION 4) |

That is the **BOM PRINCIPLE / Three-Concerns split (`CLAUDE.md`) holding, not failing**: one file is
WHAT/HOW (the construct and its rules), the other is the wiring that carries it to a surface. The
proof that both are load-bearing is in `CLAUDE.md`'s own PRIMAL LAW: clause **0** sends you to §I
before computing a relation, clause **2** sends you to the editor witness chain — two different
instructions, to two different files, both correct today.

**And the arithmetic argues against merging on its own.** 5,836 + 1,061 = **6,897 lines / ~469 KB**
in one file. The user's hypothesis is right about the disease; concatenation is not the cure for it.
Nobody re-reads a 469 KB file before acting, which is precisely the behaviour that produces the
thrash. `4D_SCHEDULE_PERFECTION.md` already proved this at 452 KB and needed an INDEX plus an
archive pass to become readable again.

## But three things ARE in the wrong file — this is what to fix instead of merging

Each is a genuine leak across the boundary above, and each has already cost, or is set up to cost,
a re-derivation. **None was actioned by this pass** *(the pass that WROTE this section)*.

> ✅ **ALL THREE ACTIONED 2026-08-27 by a follow-up pass. Do NOT re-do them.**
> | | what was done | commit |
> |---|---|---|
> | **L1** | correction applied INTO §I's *"where inside its task?"* row (`layerOf` is MERGED) | `06b3d0025` |
> | **L2** | split per-fix: `§TPL_MODEL` stayed in §L; precache + witness-wiring moved to a new `4D_GANTT_TM_REFACTOR.md` **§5c**; the persistence bullet became a pointer to §5b | `fd298b50b` |
> | **L3** | §I.3a gained an ORIGIN block citing §S34.3's ruling / §S35's 14 fixtures / §S38's name ladder; §S31 and §S34.3 gained pointers back. **Done as a CROSS-REFERENCE, NOT the archive floated in L3(b)** — see the correction below | `8d385e7ad` |
>
> ⛔ **L3(b)'s archive suggestion was NOT taken, and should not be revived without re-checking.** This
> section proposed the §S31–§S38 band as "an ARCHIVE candidate in its own right". A citation sweep run
> before acting found **`bim-ootb/viewer/lib/level_deriver.js` alone carries 18 references into that
> band** (plus `location_axis.js`, `cpm_schedule.js`, `schedule_author.js`) — it is cited by LIVE CODE,
> not just by prose. Both sections stay. *(§S36 is the one genuinely orphaned member: zero citations
> outside its own file.)*
>
> The fourth recommendation below — **"neither file states its own boundary"** — remains **NOT done.**

**L1 — an OWNERSHIP TABLE row is corrected from a foreign file. Fix this one first; it is the
cheapest and the most dangerous.** `4D_GANTT_TM_REFACTOR.md` §FUTURE item 2 (2026-08-27) says, of
§I's row *"where inside its task?"*: *"it says the `layerOf` 4th arg 'exists only on unmerged
`fix/tpl-layer-order`' at `6b12783`; that branch is merged into current `main`. Fix that row next
time §I is touched."* A session obeying PRIMAL LAW clause 0 reads §I, finds the row, and gets a
**stale** answer — with nothing in §I saying so. The whole value of an ownership table is that it is
the one place you have to read; a correction parked in another file's futures list defeats it.
➡ **Apply the correction INTO §I's row** (and re-check §I's other `origin/main @ 6b12783` line
numbers while there — the whole table is pinned to that commit). §FUTURE keeps a one-line pointer.
✅ **DONE 2026-09-02 (queue item A-4 item 3).** §I's row now states MERGED in its own words,
re-confirmed against `origin/main` @ `c8a6df61`, and says explicitly that the stale wording must
not be reintroduced. It is also now made consistent with the row PR #1605 added beneath it
(**"where inside its bar does it PLAY?"**): the two rows describe the SAME verb called from TWO
sites with different arguments, which is precisely the confusion that let a month of measurement
judge the wrong map — so each row now names the other. `4D_GANTT_TM_REFACTOR.md` §FUTURE item 2's
"fix that row next time §I is touched" instruction is discharged.
⚠ The second half of the ➡ — re-checking §I's other line numbers against `6b12783` — was **NOT**
done in that pass and is still open.

**L2 — `4D_MODEL_INTEGRITY.md` §L is carrying TM edit-path status that §S5b already owns in depth.**
§L's *"✅ THE TM WIRING IS SOUND — TRACED 2026-08-27, PR #1553"* and its persistence bullets
(PR #1552/#1554/#1555) restate, at summary grain, what `4D_GANTT_TM_REFACTOR.md` §5b records
measured (day-1 round-trip table, day-2 W-PERS blind spot with its RED control, day-3 the IDB
evictor root cause). Two grains of one fact in two files is how a session ends up citing the
shallower one. **The split is not clean-cut and should not be done bluntly** — of §L's three PR
#1553 fixes, only one is a model fact:
  - `§TPL_MODEL model=template|legacy-deriveZones` (**which model ran**) — **stays** in
    `4D_MODEL_INTEGRITY.md`; §I already carries it as a row, and it is the model question.
  - `4D_template.json` missing from `sw.js PRECACHE_ASSETS`, and
    `witness_gantt_edit_coherence.js` passing no `template:` — **move to
    `4D_GANTT_TM_REFACTOR.md`**; these are precache/witness-wiring facts, its DEBUG MAP's subject.
  - the persistence bullets — **replace with a pointer** to §5b, which is the fuller record.

**L3 — the level relation is documented twice, and the older trail is a closed measurement band.**
`4D_GANTT_TM_REFACTOR.md` §S31–§S38 (~900 lines, all 2026-08-19) is the storey/elevation/level
measurement trail that produced `level_deriver.js` — §S34 RULED the declared-vs-geometry tie-break,
§S35 BUILT the derivation with 14 hand-computed fixtures. `4D_MODEL_INTEGRITY.md` §I.3/§I.3a is now
the declared OWNER of that relation and re-derives some of the same ground (storey-NULL percentages,
the uniform-3m fallback cost) **without citing §S34's ruling at all**. That is the lane's signature
defect — an owned question answered twice — sitting inside the very pair of files written to stop it.
➡ **Two moves:** (a) §I.3a cites §S34's ruling and §S35's fixtures explicitly, so the tie-break is
not re-derived a third time; (b) the §S31–§S38 band is then an ARCHIVE candidate in its own right
(a closed trail whose conclusion is owned elsewhere) — pointer left in place, per the archive
convention in `prompts/archive/*_archived_2026-08-27.md`.

## The one thing genuinely missing from BOTH files
Neither states its own boundary. A session that does not already know this lane cannot tell which
of the two to open, so it opens the one it saw last — and that, not file size, is the mechanism
behind "missing cross-references."
➡ **One line at the top of each**, naming what it owns and what the other owns. Cheapest available
fix for the user's actual complaint, and it costs nothing that a merge would cost.

## Files checked in the same pass and NOT recommended for merging
- `TM_4D5D_VARIANCE_LANE.md` vs `FUSED_4D5D_WEDGE_LANE.md` — the shared word "wedge" is a false
  positive. Checked: zero overlap in witnesses, PRs or sections. Variance = BIM↔ERP cost twin
  (EVM / PlannedAmt↔CommittedAmt / QS persona); Fused = the schedule-EDITOR arc (§SE-1..§SE-8).
- `4D_SCHEDULE_ARCHITECTURE_REDESIGN.md` (this file) vs either — this file is the CPM engine's
  architecture record; its `§STAGE4_RETIREMENT_PROPOSAL` steps 2–5 are still open against it.
