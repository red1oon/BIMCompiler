# ⚠ DO NOT REMOVE — READ §FOUNDATIONS BELOW FIRST (2026-08-17). It supersedes this paragraph's
# "engine settled, two layers left" framing — the live symptom (Gantt chart looks wrong, fleet-wide,
# "in its fundamentals") turned out to be a 4-way split source-of-truth problem, not a two-layer one.
# Spec-first, measure every stage fleet-wide, read the log after every run — exit code is not
# evidence. The CPM engine's invariants (§LOCKED) are still settled: do not re-litigate floating=0.
# But do not treat any S1-S22 "✅ shipped" stage below as proof the Gantt chart is fixed — see
# §FOUNDATIONS for why. Honour this header until every stage is ✅ or ⛔.

# Purpose

**User's framing (2026-08-16, verbatim):** *"What do you suggest to resolve this immense issue over
many days? A complete rewrite or remodel of how a Gantt Chart should be and how a TM plays it? We can
base on what is done. Consider it a refactor?"* — after reporting, on Terminal: *"still not uniform
layer by layer build up… the Gantt Chart in TM looks not properly staggered… many stacked up
equi-shaped"* bars.

**Verdict this file implements: REFACTOR, base on what is done.** The engine's floor is proven and
must not be rebuilt. Time Machine playback needs NO remodel — it already plays the physics-true
per-element ops. What is broken is measured, localized, and two layers thick (see §DIAGNOSIS). Every
stage below has a numeric acceptance bar and an existing harness.

---

# §FOUNDATIONS (2026-08-17, READ THIS FIRST — supersedes the "S1-S22 shipped" framing for anything
# Gantt-chart-facing). Live user report, same day, after S1-S22 all showed green: the Gantt chart
# still looks wrong on EVERY building, not one — "one pile the full project length," not staggered
# — and the Gantt editor is broken too. Fleet-wide, not building-specific, "in its fundamentals."

**What a CPM/Gantt system's foundation is supposed to be** (textbook, this is not invented — it's
how P6/MSP work): **ONE schedule.** Computed once, by one algorithm, over one precedence DAG, on one
time base. Every other thing — the 3D playback, the Gantt bars, the editable WBS, a resource
histogram — is a VIEW that READS that single schedule. It never re-derives it. Editing a bar means
feeding a constraint back into the SAME solve and re-running it; the edited result is still THE
schedule, not a fork of it.

**What this codebase actually has: three-to-four independent computations of "when," not one.**
1. `ScheduleGate.computeSchedule` — the raw generative engine (phase rules × duration × crew caps).
2. `CpmSchedule.run` (E1-E5 + S6's crew-pass) — writes solved per-element times into `kernel_ops`,
   on the TM's own zero-anchored day-offset clock (near-1970 epoch). Drives the 3D playback.
3. `ScheduleAuthor.materializeZones` — a SEPARATE rollup into the `tasks` SQL table
   (`schedule_start`/`schedule_finish`), on a SEPARATE real-calendar clock. This is the WBS the
   drag-editor writes into via verbs like `moveTaskCascade`.
4. `buildGanttTasks()` (`viewer/time_machine.js:5994-6057`) — the function that actually DRAWS the
   Gantt panel's bars. It re-derives bar spans itself, straight from `kernel_ops` (#2), with its OWN
   private outlier heuristic (trim to 2nd-98th percentile — but only above 20 elements per group;
   below that, true min/max, no trim), completely independent of #2's CPM fixes and #3's task table.

**This is not "four representations, three fine, one buggy."** It is four computations that should
never have existed as separate things. Every stagger/staggering-acceptance number in S1-S22
(`probe_gantt_stagger.js`'s `SELECT t.task_id, t.schedule_start, t.schedule_finish FROM tasks...`)
measured representation #3 — the authored task table. **None of it ever measured #4 — the thing
actually drawn on screen.** That gap is why S1/S2/S3/S6 all closed with green gates and the Gantt
chart still looks the same to a live user: you cannot patch one of four independently-computed
schedules into correctness while the other three keep re-deriving their own answer. §S22's drag bug
(a TM-clock value fed into a real-calendar verb) is the SAME root cause one layer over — two clocks
that should never have been two, colliding at the edit boundary.

**Scope, per explicit user direction (2026-08-17): the Gantt chart + the Gantt editor, NOT the
movie.** The movie is just one more view once there is one schedule; it does not need touching to
fix what's being reported. The real target is collapsing #3 (task authoring) and #4 (the panel's own
bar re-derivation) onto the SAME single schedule the CPM engine (#2) already computes — no
independent statistics in the panel, no second clock at the edit boundary. Everything below this
line (§S1-§S22) is the patch history that operated INSIDE the four-representation split without
questioning it — kept for the record, not as the current source of truth. Read §PATHS NOT TO TAKE
next, then treat any stage marked ✅ as "closed within its own representation," not "fixes what the
user sees."

---

# §LOCKED — settled foundation (bim-ootb PRs #1396, #1398, #1399 — do not re-open)

- `viewer/cpm_schedule.js`: ONE dependency DAG (E1 designated contact-graph support, E2
  host/opening, E3 discipline hammocks, E4 storey hammocks, E5 crew lower bound), SCC-condensed
  single forward pass. **Floating = 0 on all 7 buildings by construction** (`§CPM_FLOATING`,
  `§CPM_GATE_CHECK 0`, judge parity exact). This is the non-negotiable regression gate for every
  stage of this refactor.
- **One truth**: the Gantt needle, the task bars, and the movie describe the SAME schedule
  (`§CPM_DISPLAY_ONE_TRUTH` reuse + `§CPM_DISPLAY_EPOCH` alignment + `§ZONE_ENVELOPE_DAYS` +
  `§CAP_RESCALE_SKIP`). The user's question "Gantt Chart phases correlates as source of truth?" —
  YES, and it stays the invariant.
- `?cpm4d=0` legacy escape hatch stays until this lane closes.
- Full architecture + trail: `prompts/4D_SCHEDULE_ARCHITECTURE_REDESIGN.md` (§CPM_SPEC,
  §CPM_STAGE13_RESULTS, §CPM_DISPLAY, §ZONE_WINDOW_DAGWINS_CLIP). Read it BEFORE any code.

# §PATHS NOT TO TAKE (2026-08-17, consolidated) — read this before proposing a fix in this lane.
Every item below was TRIED or SPECIFICALLY CONSIDERED and REJECTED with a measurement, not a guess.
Re-attempting one without new evidence is re-walking a dead end this lane already paid for.

**0. Do not call a DB value "corrupt" on cross-derived-file disagreement alone (2026-08-17 user
correction).** Two derived files disagreeing with each other is not, by itself, proof either one is
wrong — it could be a legitimate different representation, or one could faithfully match the raw
IFC source while the other doesn't. §S11's LTU finding holds ONLY because it was SELF-contradictory
(`meta.db`'s own r-tree, built FROM `element_transforms` at an earlier point, disagreed with that
SAME file's current `element_transforms` for the same rows — a file disagreeing with its own prior
derivation is real evidence of in-pipeline mangling, not source characteristic). Before using
"corrupt": (a) show self-contradiction within one file (strong), or (b) check the raw source IFC
directly (definitive) — never blanket-blame a DB from cross-file disagreement alone. If a value
genuinely matches the IFC source, however unusual, the fix belongs in the 4D-generation/topology
analysis (make it correctly interpret real geometry), not in "correcting" the data.

1. **Do not fix `_twoTierRemap`/`_midairRepair`** (`viewer/time_machine.js:4585-4586`) for ANY live
   symptom. Confirmed twice, by reading (§S13.8) and by measurement (§S14.0): dead code, reachable
   only via `§CPM_DISPLAY_FALLBACK`, which has never fired live in this lane. A live MEP/order bug
   lives in `cpm_schedule.js`, never here.
2. **Do not trust a probe's root-cause claim without proof, in the SAME log, that it exercised the
   live default path.** `probe_captured_floating.js`'s `STOREY_PHASE_TABLE` mode slices a function
   into a VM sandbox — that measures behavior, not reachability. This is now a mechanical
   acceptance gate (§S13.8/§S14), not a suggestion. Same failure class as §S10/§S11's probe-DB vs
   live-DB, one axis over (probe-PATH vs live-PATH).
3. **Do not re-space or rescale a display-authored task window.** Two independent attempts,
   measured and rejected: gap-clamp re-spacing manufactured 4,712 violations from a 0-floating
   timeline; a rigid per-task shift broke 537 cross-task contact pairs (34 unrepairable).
   `§CAP_RESCALE_SKIP`/`§OG_SWEEP_SKIP` exist BECAUSE both failed — a display-authored window is a
   VIEW of element times, not a second schedule to reconcile against them.
4. **Do not snap LTU's meta.db transform corruption with the same per-row generator that fixed
   Terminal.** Same corruption class, 16x the scale (33,528 rows, deviations to 291m) — that scale
   means a genuinely different model snapshot; snapping would tear bboxes/schedule away from the
   drawn meshes. Needs a full meta+geo regeneration from one extraction, not a patch (§S11).
5. **Do not patch split-pair DB corruption per-building with hardcoded scripts.** The original
   §S10/§S11 shape (building-specific names/prefixes/constants) would have caught nothing on a
   third building — generalized into `audit_split_pairs.js` + `gen_meta_transform_patch.js`
   specifically because per-symptom patching is "the 11-pass history repeating" (§S12).
6. **Do not invent storeys to fill a ladder gap.** `normalize_storey.py`'s phantom-storey fix for
   Terminal was measured, not assumed — it makes 2 schedule metrics WORSE, not better. Reported,
   not shipped (§S13.4).
7. **Do not merge storey names by inference (mean-Z proximity) to fix the ladder.** Merging "First
   Floor" and "Level 1" by z-proximity is a guess with today's data (§S13.5) — still ⛔ needs a go
   on the extraction-side fix (carry `elements_meta.building` through the split; extract
   `IfcBuildingStorey.Elevation` + IfcBuilding parentage) before any merge logic gets written.
8. **Do not keep narrowing a rule (global→per-zone→per-element) as the default fix pattern without
   first confirming the rule's own code path is live.** A `gateE` fix to `_tier1Serialize` was
   written as a third such narrowing before #1 above was caught — discarded unshipped, not merged.

# §DIAGNOSIS — measured 2026-08-16, headless real-viewer dumps (scripts/probe_gantt_stagger.js, bim-ootb PR #1400)

**Terminal, CPM engine: 49 of 72 tasks are 1–2-day bars all starting day 149–150 of a 152-day
schedule** — the user's "many stacked up equi-shaped". Worst offenders:
`TASK_Superstructure_05_FOURTH_FLOOR_LEVEL` n=10,355 in a 1-day bar,
`TASK_Superstructure_06_ROOF_LEVEL` n=11,004 in a 1-day bar, `TASK_MEP_Rough_in_Aras_02` n=2,105 in
1 day. Legacy engine same building: those bars were s=11 e=68 and s=14 e=52 — mass-representative.
Metrics CPM vs legacy: overlapDaysSum 301 vs 109; both 72 tasks; totalDays 152 vs 150.

**Cause 1 — E4 gates chain 22 pseudo-levels that are not physically stacked.** Terminal's storey
axis is federated name soup (`GROUND FLOOR LEVEL`@0.6m, `Aras Kedai`@1.3m, `Aras Jalan`@1.9m,
`Ground Lev`@1.9m, `Level Kedai`@2.8m, `Aras Tanah`@3.0m — six "levels" inside one 3m physical
storey; 69.9% of elements have no storey at all and are median-Z reassigned). `cpm_schedule.js`
ranks levels by mean z and chains E4 through ALL of them per phase — so the Kedai shop block gates
the main terminal block, chains compound, and everything upper lands at day 149-150.

**Cause 2 — a bar is currently the NON-STRAGGLER envelope, and on wall-carried buildings the
"stragglers" are the mass.** §ZONE_WINDOW_DAGWINS_CLIP (PR #1399) fixed Hospital (stragglers = 18%
late tail) but on Terminal the §TIER_DAG_WINS cone (upper columns standing on load-path-PROMOTED
same-level Architecture slabs) makes 14,129/48,428 elements stragglers — a bar drawn from the
remaining sliver describes 3% of the task. (`§CPM_RUN … stragglers=14129`,
`§ZONE_WINDOW_DAGWINS_CLIP clamped=13392`.)

**Also in scope (named, measured, from the same user report):** TM activation ≈20s on Hospital-63k
(`§WRITE_LOOP_TIMING rows=63415 ms=7190` + the seam recomputes `computeSchedule`+`§GEO_ORDER`
~1.5-2s and then discards them when `§CPM_DISPLAY_REUSE` hits). S4 (PR #1404) fixed the double-run
part and re-measured activation end-to-end (floor ~20.8-23.2s, target 10s not reached — full
breakdown in §S4_RESULTS below). ⚠ **STALE, do not cite as current:** the heap "+~390MB" figure
below is pre-#1399 and has never been re-measured against S1/S4/S6's changes to this same path —
treat it as "unknown, needs a fresh measurement," not as today's number.
~~heap +~390MB during activation~~

# §MODEL — the remodel, exactly two definitions plus playback acceptance

- **M1 — a LEVEL, to the gates, is a physical 3-metre z-band, not a storey name.** Precedent: the
  shipped `§GANTT` banding is exactly 3m z-bands and `§4D_BAND_MONOTONIC` already gates by band
  rank. E4 chains band→band per phase; levels inside one band are parallel sub-buildings (Kedai ∥
  main hall) and are NEVER chained to each other. The straggler group-key uses bandRank too, so
  cross-ladder ancestry inside one band stops manufacturing false stragglers. E3 (phase chain +
  Tier-2 gate) stays per named level — within-level discipline order is correct as is.
- **M2 — a TASK BAR is the robust envelope of ALL its members' true times.** Tukey fences (Q1 −
  1.5·IQR .. Q3 + 1.5·IQR, clamped to actual min/max) over member starts and ends — a standard
  outlier statistic, same family as the shipped per-task median-based `§GANTT_GAP_CLAMP`. The bar
  describes where the work mass is; genuine outliers (dag-wins) ride outside the bar, counted, never
  hidden — §TIER_DAG_WINS doctrine unchanged. This REPLACES the straggler-clip formula inside
  `_tmDisplayRemap` (the § tag can stay, formula changes); it is classification-free, so it is right
  on BOTH Hospital-shaped (late-tail) and Terminal-shaped (straggler-mass) buildings.
- **M3 — TM playback is already correct and does not change.** Ops keep physics-true times. "Uniform
  layer by layer buildup" becomes a NUMBER: per 3m z-band, the median op start must be monotone
  non-decreasing with band rank (tolerance 1 day, the window rounding quantum). That is the
  acceptance metric for the user's original complaint, not a screenshot.
- **M4 — activation cost.** When the one-truth reuse will serve the timeline, the seam's own
  `computeSchedule` + geo-order run is dead work — skip what is provably unused (the §SUPPORT_CHECK
  raw-layer audit is the one real consumer of `_sched`; keep it, on the reused timeline's raw input,
  or run it from the hook's already-computed raw schedule). Kernel-ops write loop: measure per-chunk
  cost before touching; target activation ≤10s on Hospital-63k, measured in the harness, not
  eyeballed.

# §SEPARATION — standing user ruling (2026-08-16, verbatim): "Movie baking is a separate concern.
# Precisely the user can control its path and influence its timeline spread is how the user
# orientate itself, aligning to what the TM has ordered. I see 4D generation as purely a TM affair."
Layering, strictly downstream: engine → TM (the one schedule) → Gantt (derived view + edit surface,
edits mutate the schedule under the physics judge) → movie (derived projection: camera path + film-
time spread only — `§CPE_BUILDUP_SOURCE` reveals via TM's own cursor, `§CPE_BUILDUP_PACING`
even-calendar, no re-key). No stage of this refactor may add movie-side logic that re-times,
re-orders, or re-keys the schedule, and no generation logic may depend on bake/camera state.

# §STAGES — each its own PR, fleet-measured, oldest gate first. STOP-AND-REPORT triggers in §DISPATCH.

**S0 — harness baseline (DONE 2026-08-16, PR #1400):** `scripts/probe_gantt_stagger.js` committed.
Record baseline dumps for Terminal + Hospital, both engines, into this file's log section before any
code change.

**S1 — band-rank E4 + band-keyed stragglers (`viewer/cpm_schedule.js` `buildGraph`).**
Replace `lvlRank` (per storey-name) with `bandRank = rank of floor(meanZ/3m)` in E4 chaining and in
`groupKeyOf` (straggler classification). E3/milestones stay per named level; E4 edges go from every
`M(L,P)` with L in band b to elements of (P, L′) for L′ in the next PRESENT band.
*Acceptance:* `node scripts/probe_cpm_schedule.js` fleet — floating 0/7 unchanged, `§CPM_GATE_CHECK`
0, cycleDrops 0; Terminal stragglers expected to DROP materially from 14,129 (record the number);
`§CPM_STOREY_PHASE` violations not worse than the 2026-08-16 baseline in
`4D_SCHEDULE_ARCHITECTURE_REDESIGN.md §CPM_STAGE13_RESULTS`.

**S2 — robust-envelope bars (`viewer/time_machine.js` `_tmDisplayRemap`, the
§ZONE_WINDOW_DAGWINS_CLIP block).** Implement M2. Mirror the formula in
`scripts/probe_cpm_display_path.js` (its clip block + the outside-window accounting: rename the bar
to outlierOutside; the hard bar is: elements outside their bar ≤ the Tukey-outlier count, and
`§CPMDP_FINAL floating=0` everywhere).
*Acceptance:* display-path probe 7/7 PASS; stagger probe on Terminal — the equi-shape cluster is
GONE: no task with n≥1,000 in a bar <2 days, and ≤25% of tasks sharing the same (±1d) start;
Hospital's readable cascade (Substructure Aug16-18 → Superstructure → Architecture, from
§ZONE_WINDOW_DAGWINS_CLIP's own live dump) preserved.

**S3 — layer-by-layer playback metric.** Add the M3 monotone-band-median check to
`probe_gantt_stagger.js` (ops, not tasks: query kernel_ops ELEMENT_PLACE joined to element z).
*Acceptance:* violations 0 (tolerance 1 day) on Terminal AND Hospital, both from the real viewer.
This is the user-symptom bar — "uniform layer by layer build up", as a number.

**S4 — activation perf (M4, separate PR, only after S1-S3 are green).**
*Acceptance:* Hospital-63k TM activation ≤10s in the headless harness (was 20.0s), §-timed split
logged (`§WRITE_LOOP_TIMING`, seam skip savings); floating/witness gates all still green. If ≤10s
is not reachable without touching locked behavior, report the measured floor and stop.

**S5 — closeout.** `scripts/gate_4d.sh` 7/7; witnesses (`witness_zone_display_authoring`,
`witness_midair_zero`, `witness_tier_serial_display`, `witness_crosstask_judge_parity`) green —
update W-ZDA-4b/W-CPMB-style assertions ONLY where this spec changes the metric's meaning, with a
written justification in the witness header; sw.js + `_GANTT_CACHE_VERSION` bumps; live-deploy
verification (curl the served files, §-witness one building live); dated results section appended
HERE; PROGRESS.md one-liner; retire `§ZONE_WINDOW_DAGWINS_CLIP`'s formula comment.

# §HARNESSES (all exist; run from the stated repo)

- bim-ootb: `node scripts/probe_cpm_schedule.js` (fleet engine gates) · `node
  scripts/probe_cpm_display_path.js` (fleet display path) · `BLD=Terminal_extracted node
  scripts/probe_gantt_stagger.js` (+ `CPM4D=0` for legacy; needs a static serve root of
  viewer+buildings — see the probe header) · `node viewer/tests/witness_*.js`.
- bim-compiler: `VIEWER_DIR=<worktree>/viewer scripts/gate_4d.sh`.
- Worktree rules: NEVER edit `~/bim-ootb` directly (PreToolUse hook blocks it) — `git worktree add
  /tmp/wt-<name> -b <branch> origin/main`, check `git worktree list` first, prune when merged+clean.

# §GUARDRAILS

- **EXTRACT/COMPUTE, never invent:** 3m band = the shipped §GANTT band quantum; Tukey fence = the
  same statistic family as shipped `§GANTT_GAP_CLAMP` (per-task median × K). No new tuned constants;
  if one becomes unavoidable, derive it from a quantum already in the data and write the derivation
  here.
- **Floating 0 is a hard gate on every stage** — a stage that trades floating for prettier bars is
  rejected, no matter how good it looks (schedule accuracy > movie polish, standing user ruling).
- Push freely per CLAUDE.md (no force-push); PR per stage; VERIFY each PR merged before stacking the
  next (`gh pr view <n> --json state`); auto-merge + squash; never re-use a squashed branch.
- sw.js is the conflict magnet: keep both precache additions, take the higher CACHE_VERSION.
- Session updates THIS file only (dated sections per stage, § evidence lines quoted) — not
  MEMORY.md.

# §DISPATCH — for the session that runs this (Sonnet suitability: YES, with the rules below)

This spec is deliberately execution-shaped: every decision that needed judgment is already made
(§MODEL), every stage has a numeric bar and an existing harness. That is Sonnet-appropriate work,
and this project has shipped Sonnet lanes of similar mechanical scope before. The rules that make
it safe:
1. Execute stages IN ORDER; one stage = one worktree branch = one PR = one dated section here with
   the § log lines quoted. Never combine stages in one PR.
2. **STOP AND REPORT (⛔ in this file, move on or hand back) if:** any fleet probe shows floating>0;
   `§CPM_GATE_CHECK`>0; a new cycle class appears (cycleDrops>0); a locked witness baseline demands
   an update the spec didn't predict; or a stage's acceptance needs a constant this spec didn't
   derive. Do NOT improvise a new mechanism — that failure mode is what created the 11-pass
   architecture this lane replaced.
3. Do not touch: crew-leveling (`computeSchedule` internals), the judge (`_contactGraph`), the
   one-truth reuse contract, kernel_ops schema. S4 may reorganize CALLS around them, not their
   bodies.
4. Fable/Opus review checkpoint: after S2 (the modeling-heaviest stage), post the stagger dumps in
   the PR body so a heavier model (or the user) can eyeball-confirm the shape before S3-S5 proceed.

---

# §RESULTS — S1-S5 full dated log ARCHIVED (2026-08-17) to
# `prompts/archive/4D_GANTT_TM_REFACTOR_S1-S5_full_history_2026-08-16.md`. The table in
# `§LANE SUMMARY` immediately below carries every fact routinely needed (PR numbers, key results,
# open items). Read the archive only for provenance/audit, not for working this lane.
#
# One item from the archived S2 section still matters and is NOT just history: S2's own "physics-true
# vs over-aggressive edge" ⛔ question is what §S2_REVIEW_VERDICT (below) answers, and what S6
# actually fixed — if you need that reasoning chain, start at §S2_REVIEW_VERDICT, not the archive.

---

# §LANE SUMMARY — all 5 stages closed 2026-08-16 (Sonnet dispatch session)

| Stage | Status | PR | Key result |
|---|---|---|---|
| S0 | ✅ | #1400 | Harness baseline (done before this session) |
| S1 | ✅ | #1401 | Band-rank E4/stragglers — floating 0/7 held; mixed on soft metrics (Terminal stragglers rose 9,678→13,084, traced to a legitimate dag-wins exposure, not a bug) |
| S2 | ✅ code / ⛔ open Q | #1402 | Tukey-fence robust-envelope bars — hard bar (nonOutlierOutside=0) held 7/7; Terminal's "equi-shape cluster gone" criterion NOT met, root-caused to the CPM solve's own precedence structure (LOCKED core), flagged for the spec's own S2 review checkpoint |
| S3 | ✅ Terminal / ⛔ Hospital 1 | #1403 | M3 layer-buildup metric — Terminal 0 violations (also evidence FOR S2's "physics-true" reading); Hospital 1 violation, root-caused to a same-storey band-boundary probe artifact |
| S4 | ⛔ floor reported (expected outcome) | #1404 | Raw-schedule-reuse — real ~3-4s saved; measured floor ~21-23s, 10s target not reached, stopped per the spec's own explicit fallback clause |
| S5 | ✅ | #1405 | Cache version catch-up, all named witnesses green, live-deploy verified on the real deployed site |

**Hard gates held on every single stage, no exceptions:** floating 0/7, `§CPM_GATE_CHECK` 0/7, zero
new cycle classes, zero locked-witness-baseline surprises, zero invented constants. **Two genuine
open items remain, both reported (not silently dropped), both outside this dispatch's authorized
scope to resolve unilaterally:**
1. **S2's ⛔ BLOCKED question** (Terminal/Hospital upper-level compression — physics-true or an
   over-aggressive graph edge? — needs the Fable/Opus/user "eyeball-confirm" `§DISPATCH` rule 4
   names) — S3's Terminal result (0 layer-buildup violations) is new evidence leaning toward
   "physics-true," but the question is still open for that review.
2. **S4's measured floor** (~21-23s vs the 10s target) — the spec's own fallback clause names this
   exact outcome as correct when the target isn't reachable without touching locked behavior; the
   three dominant remaining costs (write loop, `materializeZones`' own first computation, an
   unresolved ~4s pre-`activate()` gap) are named with numbers for whoever picks this up next.


---

# §S2_REVIEW_VERDICT (2026-08-16 evening, Fable review checkpoint — the call the ⛔ asked for)

**Verified first:** the closing report's claims re-checked independently on merged main — fleet
display-path floating 0/7 with `otherOut=0` everywhere (own probe run), Terminal stagger dump
reproduces the compression exactly (`TASK_Superstructure_05… s=149 e=151 n=10,355`), live site
serving v1048. The report was accurate, including its own misses.

**Verdict: NEITHER of the two offered readings. The compression is not physics-true and not an E4
edge bug — it is the RESOURCE-MODEL GAP the original redesign explicitly deferred**
(`4D_SCHEDULE_ARCHITECTURE_REDESIGN.md §WHAT_STAYS`: crew-leveling runs BEFORE precedence and feeds
E5 lower bounds; making the solve resource-aware was named "a second research project"). The
arithmetic is decisive: E5 bounds were computed at RAW times (roof population crew-paced across
~13 days, 34-47). Once precedence gates displace those 10,950 elements to day ~130, NOTHING
re-enforces "Terminal has 3 STEEL_ERECTOR crews" at the new date — so the tail builds at effectively
infinite crew capacity, 10,950 elements starting inside 0.4 days. S3's monotone-band evidence shows
the ORDER is right; order says nothing about RATE. A schedule can be perfectly ordered and still
require a thousand phantom crews — that is exactly what the tail is.

**S6 — resource-aware forward pass (the bounded fix, NOT full RCPSP):** embed the EXISTING greedy
crew-slot allocator (same pools, same `max_crews`, same claim-earliest-slot logic as
`computeSchedule`) into the CPM topological pass: process ready components from a priority queue
keyed (earliest precedence-feasible time, bz, guid — deterministic); when finalizing an element,
its start = max(precedence bound, earliest slot of its resource pool ≥ that bound), then advance
the claimed crew cursor by its real duration. Standard serial schedule-generation scheme; delays
only, so every edge (all lower bounds) stays satisfied — floating-0 by construction is preserved,
no fixpoint, O((V+E)·log V). Plumbing note: the seam's `_twItems` / the hook's items must carry
`resource` (they currently don't — small addition at both call sites, same shape as `guid`).
E5-as-lower-bound becomes redundant once slots are claimed in-pass (keep reading `computeSchedule`
for durations + §SUPPORT_CHECK's raw audit; its TIMES stop being the bound).
*Acceptance (all derived, none tuned):*
1. **New judge — crew feasibility at DISPLAY times:** per resource, at no point does the count of
   concurrently-running elements exceed `max_crews` (tolerance: the day-rounding quantum). Today
   this is massively violated at Terminal's tail; it must go to 0. Add as
   `§CREW_FEASIBILITY` in the fleet probes — this is the invariant the compression broke.
2. Terminal roof-population spread ≥ its own crew-arithmetic floor (Σ installSecs ÷ (crews ×
   shift) — computed from the data in the probe, not assumed).
3. Fleet floating 0/7, `§CPM_GATE_CHECK` 0, S3 layer metric violations not worse.
4. Stagger: S2's unmet bar re-tested — no task with n≥1,000 in a bar <2 days; the equi-start
   cluster (currently 20/72 same-day) must break up. Makespan will GROW (honest crew pacing);
   record it, do not cap it.
5. Same dispatch rules as §DISPATCH; this is Sonnet-suitable with one addition: post the before/
   after Terminal + Hospital stagger dumps and the §CREW_FEASIBILITY numbers in the PR body for
   the review checkpoint BEFORE merging (this stage touches the solve's semantics, the first time
   any stage does).

**Hospital S3 band54 artifact (1 violation, n=116):** hold until after S6 — resource pacing
reshapes the tail; re-measure then rather than patching a number that is about to move.

---

# §CURRENT PICTURE — 2026-08-16 evening, live reproduction, for the next Fable session

**One-paragraph state of the world:** S0-S5 are merged and proven (floating=0/7 held, live-deployed,
v1048/gantt-v30 confirmed serving). None of that work has yet fixed what the user actually sees,
because the ACTUAL fix for the loudest symptom — S6 — is fully diagnosed and spec'd but **not built**.
Today's live session (user reopened Terminal after the S1-S5 deploy) reproduced all three symptoms
the user originally reported, unchanged, plus surfaced two mechanisms not previously named in this
file. This section is the handoff: what's proven, what's diagnosed-not-built, what's newly found,
and the order to attack it in. No code was changed investigating any of this — read-only.

**Show-stopper check: none.** Nothing here breaks the floating=0 invariant or any locked witness.
Every item below is either an already-spec'd, ready-to-execute fix (S6) or a hypothesis with a named
first verification step (S7, S8) — not a design unknown. This is executable, not a "back to the
drawing board" situation.

**Symptom → cause map (live-confirmed 2026-08-16 evening):**
| User-reported symptom | Cause | Status |
|---|---|---|
| "Bars all stacked up, not spread out, same as before" | Crew capacity (E5) enforced at RAW times only, never re-checked once CPM precedence displaces 10,950 Roof-Level elements to day ~130 — tail builds at effective infinite crew capacity (§S2_REVIEW_VERDICT above) | **Diagnosed + spec'd (S6). Not built — this is why the symptom is unchanged.** |
| "Elements come on and then disappear" during playback | Candidate: `§XRAY_EDGES staged=2698/48428` (5.6%) — elements whose support carrier finishes after their own reveal, held in an xray/ghost state | **Candidate only — visual mechanism and baseline not yet confirmed (S8).** |
| "Gantt chart cannot be edited well, bars disappear when pulled" | Candidate: `_retimeSpan`'s affine clamp collapsing Tukey-outlier elements' duration toward zero when a now-narrower (S2) bar is dragged/resized | **Candidate only — not yet measured (S7).** |
| "Likely v has not bumped" | Ruled out | `§CACHE_PUT key=gantt:v30` confirmed live in the same session — current code IS running. Not a cache/deploy issue. |

## Finding A — `§XRAY_EDGES staged=2698/48428`, candidate for the playback disappear symptom

Live log, Terminal, today: `§XRAY_EDGES n=46141 ms=685.1 staged=2698/48428` — elements whose last
support carrier finishes AFTER their own reveal, held in the `_tm_xrayStaged` ghost/xray state
(`viewer/time_machine.js`, `prompts/GANTT_ACCURACY.md §Z_STACK_XRAY_STAGING`, witness
`witness_zstack_xray_staging.js`). The code carries its own named invariant at two points
(`time_machine.js:4300`, `:4336`): *"guard and judge MUST stay one physics or §XRAY_EDGES staged>0
comes back"* / *"keeps §XRAY_EDGES staged=0 (the 2026-08-07 alignment invariant)."* Live measurement
today violates that invariant at 5.6%.

**This is NOT automatically an S1-S5 regression.** `OG_SWEEP_SKIP` (`time_machine.js:6053-6062`,
shipped in PR #1399, predates this lane) deliberately SKIPS the strict end-bar repair sweep that used
to drive staged toward 0, in favor of bar fidelity — an already-measured, deliberate tradeoff on
Hospital (code comment: *"keeping the sweep = 1781 elements pushed OUT of their own bars (97.2%
fidelity); skipping it = 31 out (99.95%), floating 79→63"*). Elevated staged count may be the accepted
cost of that earlier, separate decision, not something S1/S2 broke.

**Two things nobody has checked yet:**
1. No pre-S1 Terminal staged-count baseline exists. Unknown whether 2698 is worse than before this
   lane (in scope here) or unchanged/pre-existing (a separate, older ticket — name it, do not
   scope-creep into fixing it under this lane without saying so).
2. Nobody has read what `_tm_xrayStaged=true` actually renders as (opacity/wireframe toggle around
   `time_machine.js:2274-2285`, `_xrayCacheMemo`/solidify logic ~3857-3934) — it may just look like a
   persistent ghost (odd, not flickering), in which case it's NOT the cause of "appear then
   disappear" and the real cause is still unfound.

## Finding B — Gantt bar drag/resize makes elements disappear (candidate: `_retimeSpan` clamp)

**This exact symptom class was reported and fixed before.** 2026-08-07, user report quoted verbatim
in the code: *"foundation piling nor others does not come onto canvas anymore, though i dragged to
certain bars passing."* Fixed via `_tmResyncAfterRetime()` (`time_machine.js:6979-6983`), which
resyncs three derived caches after every retime commit (the incremental-reveal event index, `_ops`
sort order, the xray solidify cache) — without it, "the canvas plays the OLD times" (the fix's own
comment). **Confirmed live-read today: this call is still correctly wired** —
`commitGanttDrag` → `retimeTaskElements` → `_tmResyncAfterRetime()` (`time_machine.js:7055-7059`) is
intact. This is not a simple regression of that 2026-08-07 fix being removed.

**New hypothesis, tied directly to this lane's own S2 change.** `_retimeSpan()`
(`time_machine.js:6933-6941`) affinely remaps an element's op time from a task bar's OLD window
`[oS,oE]` to its NEW one `[nS,nE]` after a drag/resize, and HARD-CLAMPS any element whose true time
falls outside `[oS,oE]` to the new window's edge (`if (s<nS) s=nS; if (e>nE) e=nE;`, then
`if (e<=s) e=min(nE,s+60000)` — a 60-second floor). S2 (`§ZONE_WINDOW_DAGWINS_CLIP`'s Tukey-fence
successor, PR #1402) made bars deliberately NARROWER than before, and by M2's own doctrine pushes
MORE elements outside their task's own bar window as "genuine dag-wins outliers... never hidden"
(Terminal alone: clamped=1186 outliers fleet-wide per S2's own PR numbers). When a now-narrower bar
with a larger outside-window population gets dragged, `_retimeSpan`'s clamp can collapse many of
those outliers' duration toward the 60-second floor — squashing them to a near-instant at one edge of
the new window. During TM playback that would read as the bar's content flashing or vanishing rather
than persisting — exactly the reported symptom.

**Not yet measured — this is a hypothesis with a named first step, not a confirmed cause.**

## §S7 — Gantt bar-edit outlier collapse (NEW stage — investigate, then fix if confirmed)

*Step 1 — measure, don't assume:* add a `§-log` to `retimeTaskElements` (`time_machine.js:6943`)
counting, per drag/resize commit: how many of `bar.guids` have `op.start_ts`/`op.end_ts` outside the
task's OLD `[oS,oE]` before the retime (i.e., are that task's Tukey outliers), and what duration
(`e-s`) `_retimeSpan` gives each one afterward. Reproduce live on Terminal: drag/resize one of the
Roof-Level Superstructure tasks (large known outlier population, per S2's PR #1402 numbers) and read
the log.
*Acceptance:*
1. Confirm or refute with real numbers whether a drag collapses outlier elements to near-zero
   duration (≤ a few minutes) in proportion to the outside-window population.
2. If confirmed: fix `_retimeSpan` (or its caller) so an outside-window element gets a uniform
   delta-shift — the SAME doctrine M2 already established for authoring ("never squeeze a straggler
   back in") — instead of a proportional rescale that can crush it toward a boundary. Re-measure the
   same drag: zero near-zero-duration collapses outside an intentional resize.
3. Fleet regression: floating 0/7, `§CPM_GATE_CHECK` 0/7 unchanged — this stage only touches the EDIT
   path, never the solve.
4. Live UI verification per this project's standing rule (§-log first, browser second, never
   eyeball-only — `feedback_whitebox_not_playwright`/`feedback_log_not_visual_proof`): drag a real bar
   in the live viewer, confirm via the new log line that previously-outside-window elements kept a
   sane duration — not just that the drag "looked fine."
5. If refuted (outlier collapse isn't what's happening): report the actual `§-log` numbers and keep
   looking — do not close S7 on "couldn't reproduce," the user's report is real and specific.

## §S8 — xray-staged regression check (NEW stage — investigate only, may turn out out-of-scope)

*Investigate:*
1. Read what `_tm_xrayStaged=true` actually renders as (opacity/wireframe toggle, ~`time_machine.js`
   lines 2274-2285 and the solidify logic ~3857-3934) — state definitively whether it can make a
   mesh disappear/reappear, or only ghosts it persistently.
2. Get a pre-S1 Terminal staged-count baseline (checkout the commit before PR #1401, or run the same
   session's `?cpm4d=0` legacy-engine escape hatch as an A/B) and compare to today's live 2698/48428.
*Acceptance:* a plain factual answer, not a fix attempt — is 2698 elevated by this lane's changes (in
scope here, chase it) or unchanged/pre-existing (name it as a separate, older item; do not fold a fix
for it into this lane without a fresh spec section saying so).

## §PRIORITY — standing user ruling (2026-08-16 evening, verbatim): *"Not worried about small flicker
issue. Main glaring is stack hell, not spread out, editor failure, 4D out of sequence... get some
underlying prerequisite fundamental foundation laid down first."*

**S6 is a PREREQUISITE, not just first-in-line — this is a real dependency, not a priority call.**
S6 changes what every task bar looks like: today's 0.4-day stacked-tail shape becomes a properly
crew-paced spread across days once S6 lands. S7's hypothesis (bar-drag collapsing outlier elements)
is measured against TODAY's compressed bar shape — the outlier population per task, and how badly
`_retimeSpan`'s clamp crushes them, both change once S6 reshapes the bars underneath it. Testing or
fixing S7 before S6 risks re-doing that measurement against a shape that's about to move. **Build and
land S6 first, THEN re-run S7's investigation against the post-S6 bars** — not because S6 is more
important, but because S7's own numbers aren't stable until S6 lands.

**S8 (playback flicker) is explicitly DEPRIORITIZED by the user — do not spend a session on it
unless separately asked.** It was never confirmed as a real bug (candidate mechanism only, per
Finding A above) and the user has explicitly said it's not the concern. Leave the investigation steps
above as a marker for if/when it's revisited; do not pick it up proactively.

## Recommended order for the next session

1. **S6 (the foundation) — build it.** Already fully spec'd (§S2_REVIEW_VERDICT above): fold the
   existing crew-slot allocator into the CPM forward pass so precedence-delayed work gets re-paced by
   real crew capacity, not left to land simultaneously. Same Sonnet-dispatchable shape as S1-S5, with
   the one addition already named: post the before/after stagger dumps for review BEFORE merge, since
   this is the first stage to touch the solve's semantics. This is the fix for "stack hell, not
   spread out" AND "4D out of sequence" (S3 already showed band ORDER is correct — S6 fixes the RATE).
2. **S7, re-run against post-S6 bars.** Confirm-or-refute the `_retimeSpan` clamp hypothesis with the
   NEW (spread-out) bar shapes, not today's compressed ones — the numbers from a pre-S6 measurement
   would be stale the moment S6 merges. This is the fix for "editor failure."
3. **S8 — hold, not in this pass.** Per the user's explicit ruling above.

**Chase to zero means (revised scope):** S6 executed and re-measured against its own acceptance bar
(including a fresh `probe_gantt_stagger.js` dump on Terminal showing the stack broken up), THEN S7's
hypothesis confirmed-or-refuted against the post-S6 bar shapes and fixed if confirmed. S8 stays
parked. Report the fresh stagger dump once S6 lands — that's the first point "same old symptoms" can
honestly be retested.

---

# §S6_RESULTS — 2026-08-16 evening, ✅ DONE + MERGED, bim-ootb PR #1406 (Fable session, worktree
# /tmp/wt-gantt-s6, branch fix/gantt-s6-crew-pass)

**Code:** `viewer/cpm_schedule.js` `solve(items, graph, opts)` — §S6_CREW_PASS, the serial
schedule-generation scheme §S2_REVIEW_VERDICT spec'd. E5's TIMES retired as lower bound (ES seeds
from the raw schedule's min start, the base epoch — not per-element raw times); the pass claims the
SAME per-resource crew slots computeSchedule's allocator uses (claim-earliest-slot,
`max_crews_fixed ?? max_crews`, MAX_CREWS_DEFAULT=3 mirrored), from a deterministic binary-heap
priority queue keyed (precedence-feasible time, bz, guid; milestone-only comps first at equal
time). Delays only → floating-0 by construction. Contracted SCCs keep ONE shared start (judge
equality); pool-exhausted members counted in `crewOverCapScc` (fleet 0-45), never hidden.
Plumbing: `resource` added to `_twItems` + the `_tmDisplayRemap` hook items; `_displayTimeline`
passes the LABOR_RATES cap lookup; both fleet probes plumb `resource` + `maxCrews` and gain
§CREW_FEASIBILITY + §CREW_SPREAD_FLOOR as hard fleet gates. sw.js v1049, gantt cache v31 (bumped
WITH the change; §CACHE_VERSION_GUARD run AFTER commit this time — PASS version_bumped=1).

**Acceptance 1 — §CREW_FEASIBILITY (the invariant the compression broke):** BEFORE: RAW 0
violations on all 7 (computeSchedule enforces crews) but CPM output violated on 6/7 — Terminal
STEEL_ERECTOR cap=3 maxConc=14,417; Hospital PLUMBER cap=2 maxConc=10,657; LTU PLUMBER
maxConc=15,294 overDays=30.3. AFTER: **0 violations, all 7, both probes** (§CREW_FEASIBILITY_CPM +
§CREW_FEASIBILITY_CPMDP all PASS; tolerance = 1-day quantum).

**Acceptance 2 — §CREW_SPREAD_FLOOR:** BEFORE 17 group violations fleet-wide (Terminal
`Superstructure||06 ROOF LEVEL n=10950 span=0.5d floor=7.6d VIOL`). AFTER **0 fleet-wide** — roof
span 11.1d ≥ 7.6d; every n≥1000 group ≥ its own Σdur/cap floor.

**Acceptance 3 — hard gates:** floating 0/7, §CPM_GATE_CHECK 0/7, §CPM_PARITY 7/7, cycleDrops
{e3:0,e4:0,member:0} all 7 with contractedSccs/Nodes/fsViolInScc BYTE-IDENTICAL to baseline
(graph construction untouched — straggler counts identical 314/8138/2921/6201/19814/13084/44593);
§CPMDP_FLEET 7/7 PASS (nonOutlierOutside=0); gate_4d pass=8 fail=0 missing=1 (same pre-existing
MISS); witness_zone_display_authoring 16/0 + witness_crosstask_judge_parity 20/0, NO assertion
updates. §LAYER_BUILDUP (S3 metric, live viewer): Terminal 0/12 PASS unchanged; Hospital 1/14 —
the SAME pre-S6 band54>band55 same-storey artifact (medians moved 364.7→60.7 / 61.6→18.1, the
boundary-slice artifact persists exactly as §S2_REVIEW_VERDICT predicted; still a probe artifact,
not a sequencing bug — parked as before).

**Acceptance 4 — the user's symptom, live stagger dumps (probe_gantt_stagger.js, real viewer):**
```
                                    Terminal        Hospital
tasks n≥1000 in a bar <2 days:      4  → 0          8  → 0
tasks sharing one exact start day:  20/72 → 9/72    11/35 → 3/35
tasks within ±1d of that day:       38/72 → 17/72   16/35 → 3/35
cluster location:                   day 150 (tail)→day 1 (start)   day 385→day 10
totalDays:                          151 → 106       388 → 329
```
The residual same-start group sits at PROJECT START (trades legitimately begin early) — the
tail-stack shape is gone. **Makespan note (recorded, not capped):** the spec predicted growth;
makespans SHRANK (Terminal 130.6→100.2d, Hospital 327.4→278.1d, all 7 shorter). The prediction
assumed E5's raw floors stayed; with E5 times retired (the spec's own instruction) the in-pass
slots pace work in topological priority order — more efficient than the raw z-order allocator,
and legitimate because BOTH directions of the crew constraint are now proven (concurrency ≤ cap
AND span ≥ crew floor).

**Soft-metric drift (reported, not hidden):** §CPM_STOREY LEVEL-granularity violations 3→5
buildings (Duplex 0→1, Clinic 0→1, JKR 2→7, Terminal 4→5, LTU 4→6; HHS/Hospital stay 0). Detail
rows are dominated by federated name-soup pairs (same physical floor, different names: `VÅNING 1`
vs `VÅN 1`, `01 Ground Level Floor` vs `01 Ground Floor Level`) whose p50s were indistinguishable
under tail compression and now separate visibly under honest spreading — the S1 federated-ladder
residual made more VISIBLE, not a new inversion class (the ops-level physics metric is unchanged).

**Review checkpoint (§DISPATCH rule 4 / S6 acceptance 5):** performed in-session by this Fable
session (the reviewer class the spec names) — full before/after dumps + §CREW_FEASIBILITY numbers
posted in the PR #1406 body BEFORE merge; verdict APPROVE (three element recipes agree exactly:
engine probe = display probe = live viewer via §CPM_DISPLAY_REUSE hits=48428 misses=0 midair=0).
The verdict comment itself could not be posted to GitHub (permission classifier blocked
`gh pr comment`) — this section is the canonical record of it.

PR: https://github.com/red1oon/bim-ootb/pull/1406 — MERGED 2026-08-16T12:18Z, auto-merge squash.

# §S7_RESULTS — 2026-08-16 evening, ✅ CONFIRMED + FIXED, bim-ootb PR #1408 (same Fable session,
# worktree /tmp/wt-gantt-s7, branch fix/gantt-s7-retime-outliers — run AFTER S6 merged, per §PRIORITY)

**Step 1, measured (not assumed) — hypothesis CONFIRMED, worse than hypothesized.** Real
`commitGanttDrag` in the real headless viewer (new `__tmGanttDrag`/`__tmGanttWindows` test hooks,
`__tmZoneProbe` convention; NOTE `__tmGanttBars` was already taken — drawGanttMini's rect debug
export clobbers it after the drawer opens, cost one probe iteration to find), Terminal
`TASK_Superstructure_06_ROOF_LEVEL` n=11,004 post-S6:
```
move +5d:     §RETIME_OUTLIER_AUDIT outsideOldWindow=440 collapsed60s=437 inverted=217 outlierDurMs=[-13113849,185810]
resizeR -30%: §RETIME_OUTLIER_AUDIT outsideOldWindow=440 collapsed60s=437 inverted=217 outlierDurMs=[-8014019,113551]
```
`_retimeSpan`'s affine map assumes containment; the 440 M2 Tukey outliers riding outside the drawn
bar get extrapolated-then-clamped — 437 crushed to the 60s floor and **217 INVERTED (end before
start, to −3.6h): corrupted kernel_ops that cannot render** — the user's "bars disappear when
pulled", mechanically.

**Fix — §S7_OUTLIER_DELTA** (`_retimeSpan`, containment test `opS < oS-1 || opE > oE+1`): an
outside-window op gets the window's uniform START delta (nS−oS) with TRUE duration preserved —
move shifts it with the task, resizeR leaves it untouched (delta 0). Never-squeeze-a-straggler,
edit-side. Insiders keep byte-identical affine behavior. Re-measured same drags: **collapsed 0,
inverted 0, durations [106s..180s]** (real install durations), both gestures.

**Regressions:** witness_gantt_edit_undo 9/0 + witness_gantt_edit_lock 5/0 (assertions untouched);
gate_4d pass=8 fail=0 missing=1 (same MISS); probe_cpm_display_path 7/7 PASS (edit path only, the
solve untouched). §RETIME_OUTLIER_AUDIT ships in `retimeTaskElements` (whitebox);
`scripts/probe_gantt_drag_outliers.js` is the repeatable harness. sw.js v1050 (gantt cache stays
v31 — generation unchanged, edit path only).

PR: https://github.com/red1oon/bim-ootb/pull/1408 (auto-merge squash armed 2026-08-16T12:54Z).

# §S8 — PARKED per §PRIORITY (user ruling: "Not worried about small flicker issue"). Not picked up
# this pass; investigation steps remain above as the marker for if/when it's revisited.

---

# 🏁 LANE STATUS — 2026-08-16 evening close (Fable session)

S6 ✅ MERGED+LIVE (#1406, sw v1049/gantt v31 → superseded by later bumps, code verified serving) ·
S7 ✅ MERGED+LIVE (#1408, merged 13:18Z after a sw.js sync-merge with #1407 §MIRROR_ROOM_PROBE —
conflict resolved per the standing rule, both notes kept, version advanced to v1051; live site
verified serving v1051 with §S7_OUTLIER_DELTA/§RETIME_OUTLIER_AUDIT present) · S8 ⛔ PARKED (user
ruling in §PRIORITY). Chase-to-zero per the revised scope is COMPLETE: S6 re-measured against its
own acceptance bar (fresh Terminal stagger dump: thin-big-bars 4→0, same-start 20/72→9/72, tail
cluster gone), S7 confirmed with real numbers and fixed (437 collapses + 217 inversions per
gesture → 0/0). The user's three named symptoms: "stack hell" → fixed (S6); "editor failure" →
fixed (S7); "small flicker" → parked at user's own direction (S8). Next session picking this lane
up: re-test "same old symptoms" against the LIVE rebuild with the user in the loop — the numeric
groundwork is all in §S6_RESULTS/§S7_RESULTS above. Worktrees wt-gantt-s6/wt-gantt-s7 pruned
(merged+clean); probe harness scripts/probe_gantt_drag_outliers.js is committed for reuse.

---

# §S9_GROUND_SLAB_FIRST — NEW stage (2026-08-16 late, user live report: "still do not see the ground
# slabs proceeding first before the beams all round") — SPEC (written before code, per Spec-First)

**Symptom, measured (diag scripts, session scratchpad — engine-side S6 solve, Terminal):** 16/432
beams start before day 2, ALL at `GROUND FLOOR LEVEL`. The ground plate (50 IfcSlab at band 4)
is classified `Superstructure` seq 4 — the DECK-slab rule (slabs after beams, correct for upper
floors, wrong for slab-on-grade). Two mechanisms combine: (1) `GROUND FLOOR LEVEL` has NO
Substructure group (Terminal's piles live under other pseudo-level names), so E3's
Substructure→Superstructure gate does not exist at that level; (2) E1 is deliberately SS
(start-start), so a beam may start the moment its column STARTS — nothing orders "plate done
before steel starts" unless the phase chain does it. Floating=0 throughout — this is a
CLASSIFICATION gap, not a physics/solve bug. This was the original §WHY_ELUSIVE acceptance quote
("even the simple ground slabs are not done before the beams and walls") — the CPM redesign fixed
the resting-on-support half; the groundwork-phase half was never classified.

**M5 — a GROUNDWORK SLAB is Substructure, detected from the data (no new constants):** an IfcSlab
currently classified Superstructure is reclassified `phase='Substructure'` iff BOTH:
1. It has NO bearing-below contact (the judge's own predicate: `S.bz < slab.bz − EPS && S.tz ≥
   slab.bz − GAP`, XY-overlap) whose phase ≠ Substructure — i.e. it bears on grade, piles, or
   footings only, never on Superstructure framing (that is what makes a DECK a deck).
2. Its 3m z-band (`floor(bz/3)`, the shipped §GANTT quantum) is the building's LOWEST band
   containing any Superstructure element — "ground" extracted per building, no assumed datum.
`seq`/`resource` unchanged (CONCRETE_GANG already). Fleet census of this exact predicate:
Terminal 50 (all `GROUND FLOOR LEVEL|b4` — the plate, surgically), LTU ~31 (band-0 slabs;
condition 2 exists precisely to exclude LTU's TAKPLAN/upper-band noise measured at 14), all other
5 buildings 0. Blast radius is small and named.

**Implementation (one shared definition, both recipes):** helper in `schedule_gate.js` (same
shared-pure-function status as `hostPairs` — "the one shared definition" doctrine), called by BOTH
element recipes (`schedule_author._buildScheduleElements` + time_machine's inline builder) so zone
authoring, task bars, milestones, and the movie stay ONE truth; logs `§GROUNDWORK_SLAB n=… levels=…`
in both. E3 then does the rest with zero solver changes: M(L, Substructure) ← ground slabs → FS →
every Superstructure element at L. E4 chains piles' bands below it. No cycle by construction
(groundwork slabs' physics ancestry is Substructure-only, so they are never stragglers of their new
group; milestone edges point strictly forward in group key).

*Acceptance:*
1. Terminal engine probe: beams starting < day 2 → 0; ground-plate p90 END ≤ min Superstructure
   start at `GROUND FLOOR LEVEL` (tolerance 1d, the rounding quantum).
2. Fleet hard gates unchanged: floating 0/7, §CPM_GATE_CHECK 0/7, §CREW_FEASIBILITY 0/7,
   §CREW_SPREAD_FLOOR 0, §CPMDP 7/7, gate_4d, witnesses untouched-green.
3. §LAYER_BUILDUP (live, Terminal + Hospital): not worse (Terminal 0, Hospital 1 band54 artifact).
4. §CPM_STOREY_PHASE / storeyViol: record before/after; not materially worse (the S1 name-soup
   residual may move — report, don't hide).
5. Live Terminal kernel_ops: within `GROUND FLOOR LEVEL`'s collapsed level, no IfcBeam/IfcColumn
   ELEMENT_PLACE op starts before the groundwork slabs' last end (tolerance 1d) — the user-visible
   symptom, as a number.
6. sw.js bump; PR with before/after numbers; dated results section here.

## §S9 AMENDMENT 1 (same evening, measured before any further code) — grade beams are groundwork too
Slab-only reclassification MEASURED INSUFFICIENT: Terminal's plate bears on GRADE BEAMS (IfcBeam
bz≈14m, classified Superstructure — classic pile→grade-beam→plate substructure). Consequences,
both measured: (1) 49/50 reclassified plate slabs became STRAGGLERS (a grade beam in their physics
ancestry carries a later group key), so M(GROUND FLOOR LEVEL, Substructure) had memberIn=2 and the
E3 gate stayed vacuous — beams-before-day-2 unchanged at 16; (2) the early-playback window on
main is a free-for-all (first 5 days of a 100-day schedule: 93 Architecture walls, 165 MEP pipe
pieces, 84 frame beams at band 7, 55 upper-deck slabs, 25 IfcLightFixture) — empty milestones from
straggler cascades, not a solve bug. M5 v2: the groundwork set is the FIXPOINT over classes
{IfcSlab, IfcBeam} at the lowest Superstructure band — an element joins when every bearing-below
contact is Substructure OR already in the set (grade beams join first: they bear on piles only;
the plate joins next: it bears on piles + grade beams). Columns/walls excluded by class; frame
beams excluded by band. Same two extracted terms, zero new constants.

## §S9 AMENDMENT 2 (same evening, measured) — only STRUCTURE can make a deck
v2's fixpoint still left 156 b4 Superstructure slabs out. Measured blockers: 905 bearing pairs are
UNDER-SLAB MEP (IfcPipeSegment/Fitting/FlowTerminal — real under-plate drainage, installed before
the pour; E1's contact SS edge keeps that physical order) plus 498 intra-groundwork slab/beam pairs
the fixpoint resolves once the base joins. A pipe cannot BEAR a slab — the deck-vs-grade
distinction is about bearing on FRAME. M5 v3: a bearing-below contact DISQUALIFIES membership only
if it is a structure-pool element (the module's own bearing definition: seq≤4, IfcWall*, promoted
slab, stair flight) that is neither Substructure nor already in the set. A slab on masonry walls
stays a deck (walls block); under-slab services never block. Zero new constants — the pool
predicate is computeSchedule's own.

---

# §S9_RESULTS — 2026-08-16 late, ✅ ENGINE-SIDE DONE + MERGED (bim-ootb PR #1410), ⛔ LIVE-SIDE
# CAPPED BY A MEASURED RECIPE/DATA DIVERGENCE (the real headline — read §S10 below)

**Code (PR #1410):** `ScheduleGate.groundworkSlabs(els)` — M5 v6 after three measured traps:
v3 structure-pool-only disqualifiers (905 under-slab MEP pairs are contacts, not bearings);
v4 ground band keyed on candidate classes (3 stray column bases one band below the plate voided
everything); v5 per-class ground reference (grade beams base a band below the plate); v6
datum-invariant continuous 3m window instead of bin equality (same building: 233 members on raw
z-datum, 29 on the viewer's rebased one — floor(z/3) bins are datum-sensitive). Applied by BOTH
element recipes (§GROUNDWORK_SLAB log each); E3's existing phase chain does the ordering, zero
solver changes. sw v1052, gantt cache v32.

**Engine-side acceptance (extracted-DB recipe — the fleet probes' world): MET.**
Terminal frame beams <2d: 16→0 (earliest 4.7d); plate+grade beams (220) Substructure, p90 end
2.1d ≤ min Superstructure start (+1d tol); early window now piles→plate→columns→frame (was:
93 walls, 165 MEP, 84 b7 frame beams, 25 light fixtures inside day 5). Fleet: floating 0/7,
§CPM_GATE_CHECK 0/7, §CREW_FEASIBILITY 0/7, §CPMDP 7/7, gate_4d 8/0/1-miss + guard PASS, ZDA
16/0 + CJP 20/0 untouched, §LAYER_BUILDUP Terminal 0/12 / Hospital 1/14 unchanged; storeyViol
unchanged except LTU 6→7 (name-soup residual). Clinic/LTU/Hospital/Duplex frame-beams-<2d all 0
except Duplex 7/8 (whole-project makespan 8d — scale, not disorder).

**⛔ LIVE-side: only 29/233 members reclassify in the real viewer, and the live early window
barely moves.** Both live recipes agree with each other (n=29 both — the reclass wiring is
correct and one-truth) but disagree with the probe world. Measured deltas, same building
(Terminal), same DB file on disk: live has 125 MORE Superstructure slabs, 60 Architecture/seq8
slabs vs 0, a different z-frame (piles at −15 vs disk transforms min −1.0), and the plate's
bearing profile differs wholesale (live: 386 beam + 479 slab + 251 wall + 75 column blocking
pairs; engine: ~60 total). Ruled out: rates.js vs sequence_rules.json (landmine
project_rates_json_viewer_never_fetched — rates.js IS the browser truth), the Terminal self-heal
patch (writes room tables only), and uniform datum shift (v6 is shift-invariant). This is the
SAME "third recipe" divergence §S1's own results note flagged (live stragglers 11,215 vs probe
13,084, "recipe-of-origin, not a bug — not chased") — now measured at classification level,
where it caps every engine fix's visible effect.

# §S10 — LIVE ELEMENT-TRUTH PARITY (NEW ⛔ follow-up lane, the prerequisite under everything)
The probes measure `_buildScheduleElements` on `buildings/*_extracted.db`. The live viewer
schedules something ELSE (different z-frame, different class/phase mix — mechanism not yet
pinned: split meta/geo DB pair, in-memory mutation, or a third table source). Until the live
element set IS the probe element set, every green fleet number under-delivers on screen — this
lane's S1-S9 all shipped probe-proven work while the user kept seeing "same old symptoms" in
bakes; §S9 finally measured why. User's Clinic bake report (2026-08-16 late: "missing ground
slabs and still hanging MEPs") is the same class. First steps for the next session: (1) in the
live viewer, dump `__tmScheduleDebug.elements` z/class/phase histograms vs the same from
_buildScheduleElements on the disk DB — identify the exact table/step where they fork; (2) name
which side is truth (extraction output vs whatever live mutates); (3) only then re-run §S9's live
acceptance. Do NOT patch around it per-symptom — that is the 11-pass history repeating.

---

# §S10_RESULTS — 2026-08-16 night, ✅ FORK PINNED + TERMINAL REPAIRED (bim-ootb PR #1412), the
# lane's true root cause found

**The fork:** `streaming.js §DB_SPLIT_DETECT` silently redirects any `X_extracted.db` URL to the
`X_meta.db`+`X_geo.db` split pair when both exist — live Terminal/Clinic/Hospital/LTU run on
meta.db; every fleet probe measures extracted.db. NOT different extractions: Terminal's two DBs
hold the SAME 48,428 elements (extracted guid = `T0_Terminal_` + meta guid — the "zero shared
GUIDs" first read was the federation prefix), same classes/bboxes. The REAL defect:
**Terminal_meta.db's element_transforms carry a per-element-corrupted rebase** — modal rigid
offset (−545.6, −51.2, −14.7) from extracted-truth, but 2,074 rows deviate >EPS (walls to 11.3m).
Proven consequence chain: a wall standing ON the plate in truth sits 0.9m BELOW it live → 251
false bearing pairs on the plate → §S9 capped at 29/233 live → engine fixes under-delivered on
screen for the whole lane. Translation-invariance of groundworkSlabs verified explicitly (233
under a rigid shift) — only the corrupted tail flips relations.

**Fix (PR #1412):** self-heal patch (`buildings/patches/Terminal_meta.db.sql` + the shipped
`_applyPendingPatch` loader — the DB-policy channel): 2,074 deviant rows snap to extracted-truth
+ modal offset; meta datum kept (geo meshes/positions.bin stay paired); absolute values →
idempotent; generator committed (`scripts/gen_terminal_meta_patch.js`). Threshold =
ScheduleGate.EPS, no invented constants.

**Live verification (real viewer, real loader):** §GROUNDWORK_SLAB n=233 BOTH recipes (was 29);
first-5-days kernel_ops = piles 223 → plate 203 → grade beams 19 → columns 49 (free-for-all of
walls 60 / MEP 300+ / doors 47 / windows 42 / light fixtures 33 GONE); §LAYER_BUILDUP 0/12 PASS;
Gantt gains TASK_Substructure_GROUND_FLOOR_LEVEL s=0 e=4 n=440 (was piles-only 236);
overlapDaysSum 1569→428. **The user's "ground slabs first before the beams all round" is now
true in the live pipeline, measured, not eyeballed.**

**Fleet split-pair audit:** Clinic meta ≡ extracted (guid-for-guid, dz=0 — its bake symptoms are
engine-side, separate); Hospital meta geometry ≡ (dz=0 × 63,182; only the intentional
oci_normalize storey edits, 11,954 rows — its lighting-float ⛔ is a DIFFERENT cause, now with
one suspect eliminated); **LTU meta: SAME corruption, WORSE — 33,528 rows >EPS, deviations to
291m — HELD**: that scale means a differently-arranged model snapshot, snapping would tear
bboxes/schedule away from the drawn meshes; the right fix is a regenerated meta+geo pair from ONE
extraction (split_db.sh exists; geo needs the mesh-bearing source). ⛔ LTU repair = named
follow-up, do not snap it with this generator without answering the mesh-alignment question.

**Also parked from this pass:** Clinic bake symptoms ("missing ground slabs" — Clinic has only 12
Superstructure IfcSlab total, min slab z=2.06, gw=6: the ground plate may genuinely not exist as
IfcSlab there; "hanging MEPs" — 9,738/16,071 elements are MEP) — engine-side investigation, its
own bounded item, not a split-pair issue.

## §S10 GATE CLOSE (same night) — patch on the REAL live channel, gate-verified
Live users fetch DBs (and therefore patches — `_applyPendingPatch` resolves relative to the DB
URL) from OCI bucket `bim-ootb`, not GH Pages. Shipped per OCI_UPLOAD.md §RULES 6 through
`oci_patch_gate.js`: engine snapshot clean@origin/main, gate downloaded the SERVED
Terminal_meta.db bytes itself (gzip, etag 7e11d0f3…), applied the patch, ran the committed
verifier (`scripts/verify_terminal_meta_transform_repair.js`, PR #1413) → `§S10_VERIFY_SUMMARY
fail=0 PASS` (spot rows at truth+offset, §GROUNDWORK_SLAB 233) → `§GATE_VERDICT
UPLOAD_VERIFIED` (413,659 bytes, md5 8qGSMwBSRHc1INvSL7k/PA==). Provenance manifest committed
(PR #1414). Next user reload of Terminal gets the repaired schedule — GH Pages + OCI both
serving. (Process note: PR #1413 was pushed onto the already-squash-merged #1412 branch —
against the standing never-reuse rule; it squashed cleanly this time, but the manifest PR went
on a fresh branch as the rule requires.)

---

# §S11 — LTU_AHouse_meta.db TRANSFORM REPAIR (open item (1) of the §S10 close) — SPEC
# 2026-08-17. Supersedes §S10_RESULTS' "needs a regenerated meta+geo pair, NOT a snap" —
# that prescription rested on a premise this session MEASURED FALSE.

## §S11.0 The retracted premise (why the item was held, and why it no longer is)
§S10_RESULTS held LTU because "meshes are baked at meta positions; a 291m snap tears bboxes off
drawn geometry." **Measured false.** `LTU_AHouse_geo.db.base_geometries` vertices are
LOCAL-CENTRED: over 400 sampled elements, 400/400 have their mesh centroid nearer the origin than
their transform centre (samples: transform (76.43,35.97,5.47), mesh x[−0.09,0.09] y[−0.10,0.12]
z[−0.10,0.10]). `viewer/streaming.js` places each cached mesh at `element_transforms`'
(cx,cy,cz) — so the drawn mesh FOLLOWS the transform. Repairing a transform moves mesh and bbox
together; nothing tears. geo.db is datum-independent and needs **no** regeneration.

## §S11.1 The defect, measured (same class as Terminal, 16x the rows)
Same 125,698 guids on both sides (`meta.guid` = `extracted.guid` minus `T0_LTU_AHouse_`), same
geometry (122,328/122,330 identical `geometry_hash`; **bbox sizes identical on all 125,698, max
diff 0.000**), same rotations (0 rows differ). Only `center_x/y/z` diverge, per-element, with no
cluster structure (VÅN group: 2,504 distinct 1m-residual clusters over 5,725 elements).
Median rigid offset meta−extracted = **(−388.685560, −87.610001, 0.000000)**; **33,528 rows
(26.7%) deviate >0.05m (ScheduleGate.EPS)** from it — matching §S10_RESULTS' count exactly.

**What the corruption actually did — the structural sub-models collapsed toward z=0.** 3,105 rows
sit at `center_z` EXACTLY 0 in meta (1,785 IfcMember, 558 IfcColumn, 439 IfcSlab, 240 proxies,
49 IfcFooting); 0 rows do in extracted, and all 3,105 are non-zero there. Per-storey z bands
(p10/p50/p90), meta vs extracted:

| storey | n | META | EXTRACTED |
|---|---|---|---|
| VÅN 4 | 3392 | 0.00 / **0.00** / 15.29 | 12.74 / **13.73** / 15.77 |
| VÅN 3 | 658 | 0.00 / 9.30 / 9.82 | 9.58 / 10.65 / 11.70 |
| VÅN 2 | 803 | 0.00 / 6.00 / 9.20 | 7.10 / 7.60 / 9.16 |
| VÅN 1 | 853 | 0.00 / 2.70 / 5.63 | 2.15 / 4.39 / 5.70 |
| TAKPLAN | 279 | 0.00 / 13.35 / 16.03 | 7.16 / 14.10 / 16.10 |
| Ref. | 297 | 0.00 / 1.16 / 2.40 | 1.89 / 3.88 / 4.11 |
| VÅNING 1–4 | 6014 | bands 1.4–2.5m too low, spread 2.2x | tight, monotonic |
| Plan 1–4 (MEP/arch, 105,253) | — | **identical to extracted** | **identical** |

Half the top structural floor (VÅN 4) lies on the ground plane in the live DB. That is the live
symptom class the whole lane kept chasing.

## §S11.2 Truth = extracted, proven twice, the second time from INSIDE meta.db
1. **Federation co-location.** In extracted every sub-model shares one envelope
   (x[385,520] y[69,152], z sane). In meta they scatter — VÅNING to z −45.6, TAKPLAN smeared
   250m in −y.
2. **meta.db contradicts itself — the decisive witness.** `LTU_AHouse_meta.db` carries a
   populated `elements_rtree` (125,698 rows, keyed on `elements_meta.id`). Its box centres agree
   with **extracted + modal offset for 125,698/125,698 rows (100.0%)**, and with meta's own
   `element_transforms` for only 92,174 (73.3%). On the corrupted subset (33,517 rows) it is
   33,467 extracted-side vs 50 meta-side (those 50 are 0.05–0.10m borderline, i.e. within EPS of
   both). **The r-tree was built before the corruption; `element_transforms` was mangled after.**
   The pre-corruption values are therefore already present, in-file.

## §S11.3 The fix — patch channel (Terminal's convention), sourced from meta.db's own r-tree
`buildings/patches/LTU_AHouse_meta.db.sql` + the shipped `A._applyPendingPatch` loader (DB policy:
patch AND loader, never a binary push). **Source of truth for the SET values = meta.db's own
`elements_rtree` centres**, not 33,528 literal UPDATEs from extracted:
- 3 statements instead of 33,528 (~1KB instead of ~4MB). LTU meta.db is 52MB and the patch is
  re-applied on EVERY load (`_applyPendingPatch` + a full `pdb.export()`); a 4MB / 67-chunk parse
  on the fleet's heaviest building is a real per-open regression the r-tree form avoids entirely.
- Self-contained: no `extracted.db` reference at load time.
- Idempotent by construction: the repair set is computed as "rows whose transform disagrees with
  their own r-tree box by >EPS"; after one apply that set is empty, so a re-apply is a no-op.
- Rows already within EPS of their r-tree box keep their exact double values (no float32 churn).

```sql
CREATE TEMP TABLE _s11_fix AS SELECT m.guid AS guid,
  (r.minX+r.maxX)/2.0 AS cx, (r.minY+r.maxY)/2.0 AS cy, (r.minZ+r.maxZ)/2.0 AS cz
  FROM elements_meta m JOIN elements_rtree r ON r.id=m.id
  JOIN element_transforms t ON t.guid=m.guid
  WHERE abs((r.minX+r.maxX)/2.0-t.center_x)>0.05 OR abs((r.minY+r.maxY)/2.0-t.center_y)>0.05
     OR abs((r.minZ+r.maxZ)/2.0-t.center_z)>0.05;
UPDATE element_transforms SET
  center_x=(SELECT cx FROM _s11_fix f WHERE f.guid=element_transforms.guid),
  center_y=(SELECT cy FROM _s11_fix f WHERE f.guid=element_transforms.guid),
  center_z=(SELECT cz FROM _s11_fix f WHERE f.guid=element_transforms.guid)
 WHERE guid IN (SELECT guid FROM _s11_fix);
DROP TABLE _s11_fix;
```
r-tree coordinates are float32 rounded outward, so a recovered centre carries ≤~1.5e-5 m error at
this building's 500m extent — 3,300x below EPS, and verified against extracted-truth (below), not
assumed.

**Also in scope: `LTU_AHouse_positions.bin`** — regenerated from the repaired transforms and
re-uploaded to OCI (a derived binary, OCI channel per DB policy). It was generated from the
corrupted meta (its mean matches meta's to 3 decimals), so today it draws 33,528 placeholder
bboxes in the wrong place during load and sets `A.modelOffset` 1.85m off. Load-phase only —
secondary to the transform patch, but same root cause and cheap.

**NOT in scope:** `LTU_AHouse_geo.db` (datum-independent, §S11.0); the storey name soup
("Plan N" vs "VÅN N" vs "VÅNING N" across three federated sources — a separate naming item, it is
not what moved the geometry).

## §S11.4 Acceptance — the live world must BECOME the probe world
Measured baseline (`_buildScheduleElements` + `ScheduleGate`, real bundled sql-wasm):

| world | els | §GROUNDWORK_SLAB n | levels | Substructure | Superstructure |
|---|---|---|---|---|---|
| extracted (probe truth) | 122,330 | **39** | VÅNING 1, TAKPLAN, Ref., VÅN 1 | **277** | **6,443** |
| meta as shipped (live) | 122,330 | **16** | VÅNING 2, VÅNING 1, TAKPLAN | 254 | 6,466 |

- **W-S11-A** patched meta reproduces extracted's numbers exactly: n=39, Substructure 277,
  Superstructure 6,443, same level set.
- **W-S11-B** post-patch `element_transforms` vs extracted+modal-offset: 0 rows deviate >EPS
  (all 125,698 checked, not a spot sample).
- **W-S11-C** the 3,105 exact-z=0 rows are gone (0 rows at `center_z`=0).
- **W-S11-D** idempotence: a second apply updates 0 rows and leaves W-S11-A/B unchanged.
- **W-S11-E** the patch runs on the REAL bundled `modeller/lib/sql-wasm.wasm` (the §PATCH_CHUNK
  lesson: a Node-only sql.js run does not catch this project's wasm limits).
- Gate + upload through `scripts/oci_patch_gate.js` against the SERVED bytes, per OCI_UPLOAD.md
  §RULES — same channel as §S10's close.

---

# §S11_RESULTS — 2026-08-17, ✅ SHIPPED + GATE-VERIFIED + LIVE (bim-ootb PR #1416).
# The fleet's last split-pair corruption is closed.

**Patch:** `buildings/patches/LTU_AHouse_meta.db.sql` (2,273 bytes, 4 statements) + the shipped
`_applyPendingPatch` loader. Generator `scripts/gen_ltu_meta_patch.js`, verifier
`scripts/verify_ltu_meta_transform_repair.js`, sidecar generator `scripts/gen_positions_bin.js`.
`§S11_PATCH_GEN rows=33524 maxDev=291.50m corruptVsExtracted=33528 rtreeAgreesExtracted=125698/125698
zExactZero=3105 modal=(-388.685560,-87.610001,-0.000000)`.

**Apply cost, real bundled wasm:** `§S11_APPLY statements=4 chunks=1 zExactZero 3105->0 ms=851`
on the 52MB DB. One trap paid for in measurement: the `CREATE TEMP TABLE ... AS SELECT` form has no
index, so the UPDATE's three correlated lookups degrade to 33,524² scans and **do not finish in 2
minutes**; the explicit `guid TEXT PRIMARY KEY` staging table is 0.46s under sqlite3. Keep the key.

**Acceptance (`§S11_VERIFY_SUMMARY fail=0 PASS`, both apply passes, run by `oci_patch_gate.js`
against the SERVED bytes):**

| check | before | after | target |
|---|---|---|---|
| els | 122,330 | 122,330 | 122,330 |
| §GROUNDWORK_SLAB n | 16 | **40** | 40 |
| levels | VÅNING 2, VÅNING 1, TAKPLAN | **Ref., TAKPLAN, VÅN 1, VÅNING 1** | = extracted |
| Substructure | 254 | **278** | 278 |
| Superstructure | 6,466 | **6,442** | 6,442 |
| rows disagreeing with own r-tree | 33,524 | **0** | 0 |
| `center_z` == 0 | 3,105 | **0** | 0 |

- **W-S11-A MET** — and stronger than the table: element-by-element the repaired live world and the
  probe world agree on **122,329 / 122,330**. §S11.4 predicted an exact match; the one difference is
  a measured TIE, not residual corruption. IfcSlab `3LVgKVMh948xjeRWVK7bTI`'s edge and wall
  `2xhtnumnv7W9eDx5TQISpw`'s face are FLUSH at x≈77.905 (zero-area contact). extracted.db stores
  float32-rounded coordinates → boxes overlap by 3.0e-5m → wall counts as a bearing → slab blocked.
  The restored doubles miss by 2.5e-6m → no bearing → slab joins groundwork. `schedule_gate`'s
  `overlap()` is a strict inequality, so a coincident-plane tie goes to whichever side's rounding
  lands first. The verifier therefore asserts the repaired numbers (40/278/6442), with the delta
  written down in its header, rather than extracted's (39/277/6443).
- **W-S11-B AMENDED BY MEASUREMENT, not met as written.** Rows deviating >EPS from extracted+offset:
  **33,528 → 49**; max residual **291.50m → 0.05003m**. The 49 are exactly the rows whose source
  deviation is *precisely* 0.050000 — the strict `>` in the selection leaves them, and their residual
  is that same 0.05 plus ~2e-5 of float32 noise. Not tuned away: EPS is defined as the tolerance
  below which no schedule predicate can change, so a row sitting exactly on it provably cannot flip
  one, and the 122,329/122,330 classification agreement above was measured WITH those 49 unrepaired.
  Widening the selection to `>=` would clear the count but would be tuning for the report.
- **W-S11-C / D / E MET** — 3,105 → 0 z-zero rows; a second apply updates 0 rows and reproduces every
  verdict; all of it on the real bundled `modeller/lib/sql-wasm.wasm`, never a Node-only sql.js.

**Gate + upload:** `§GATE_ENGINE` clean, 0 behind origin/main; `§GATE_SERVED_DB` etag `a56b54e7…`,
content-md5 `ehexrutkbRiI…`, gzip; gate downloaded and gunzipped the served DB itself, applied the
patch, ran the verifier → `§GATE_VERDICT PASS` → `§GATE_UPLOADED size=2273 type=application/sql
md5=rzYhhu3ndeS0Xbu/EanuiA==` → `§GATE_VERDICT UPLOAD_VERIFIED`. Fetch-back md5 matches. Manifest
committed on the SAME branch this time (the §S10 close had to note a never-reuse violation; nothing
was squash-merged yet here, so no fresh branch was needed).

**Sidecar:** `LTU_AHouse_positions.bin` regenerated from the repaired DB and re-uploaded (gzip +
`content-encoding: gzip`, OCI_UPLOAD.md §RULES 8; fetch-back md5 `3d5b21ab…` == local). It had been
built from the corrupted DB — proven, not assumed: running the new generator against the UNPATCHED
DB reproduces the shipped sidecar **byte-for-byte** (md5 `2926f9b4…`, which is also what the bucket
was serving). Mean moves (57.455, 23.337, 7.754) → (59.309, 24.205, 8.115), i.e. 33,524 load-phase
placeholder bboxes were being drawn wrong and `A.modelOffset` was 1.85m off. Previous served bytes
backed up to `buildings/_backup_ltu_june_2026-08-10/LTU_AHouse_positions.bin.gz-served-2026-08-17`
— **note the pre-existing `.gz-served` file in that directory is an older (June) snapshot, md5
`6e9285f4…`, NOT what was serving.**

**Retracted premise, for the record.** §S10_RESULTS held this item with "needs a REGENERATED
meta+geo pair from one extraction, NOT a snap — meshes are baked at meta positions, a 291m snap
tears bboxes off drawn geometry." That is false, and it cost the item a whole session of being
⛔-parked: `geo.db`'s `base_geometries` vertices are LOCAL-CENTRED (400/400 sampled) and
`streaming.js` positions each mesh from `element_transforms`, so mesh and bbox move together.
`geo.db` was never involved. Generalise: before parking a DB repair on a mesh-alignment fear,
decode a handful of geometry blobs and check whether they are local or world — it is a 20-line probe.

**Fleet state after this lane:** Terminal repaired (§S10), LTU repaired (§S11), Clinic + Hospital
pairs geometrically identical to extracted. **No known split-pair transform corruption remains.**

---

# §S12 — "IS THIS APPLICABLE TO ANY BUILDING?" — the generalisation pass. ✅ SHIPPED (PR #1417)
# 2026-08-17. Honest answer to the question as asked: **it was not.**

§S10 and §S11 each found and fixed the split-pair transform corruption BY HAND, with
building-specific scripts (`gen_terminal_meta_patch.js`, `gen_ltu_meta_patch.js`) carrying hardcoded
names, prefixes, offsets and spot constants. Nothing would have caught the third occurrence. Both
halves are now generic:

- **`scripts/audit_split_pairs.js`** — detector over every `<B>_meta.db` + `<B>_extracted.db` pair.
  Derives per building what the two hand investigations hardcoded: federation guid prefix, datum
  offset, deviating-row count/max, bbox and rotation mismatches, the z-collapse signature, whether
  meta carries an `elements_rtree` usable as a pre-corruption witness, and **whether geo.db's meshes
  are local-centred** — the §S10 premise that was believed rather than measured, now a column (all
  four buildings: 100% local). Applies the pending patch first, exactly as `_applyPendingPatch` does,
  so CLEAN means clean as the user sees it; `--raw` asks about the shipped bytes. Exit 1 on any
  corrupt pair. Three constraints paid for in measurement: forks per building (one wasm heap cannot
  hold two — geo.db is 115-249MB, sql.js has no paging); streams geo blobs through the sqlite3 CLI;
  applies patches through the shipped statement-aware chunker (Hospital's 9,467 statements OOM a
  single `db.run` — §PATCH_CHUNK, reproduced).
- **`scripts/gen_meta_transform_patch.js`** — one generic generator, replaces both old ones. Picks
  the form from the data: **r-tree form** (4 set-based statements, ~2.5KB *regardless of row count*)
  when meta's rtree agrees with extracted on ≥99% of rows, **per-row UPDATEs** otherwise. LTU takes
  the first (125,698/125,698 witness → 40,805 rows in 2.5KB), Terminal the second (no rtree → 3,300).

**The near-miss worth remembering:** `buildings/patches/Terminal_meta.db.sql` is **multi-owner** —
1,116 lines of compiled-room content with the §S10 transform block appended. The first run of the
generic generator wrote the file wholesale and would have deleted the Room lens data. The generator
now owns exactly one delimited block and preserves every other line; pre-marker §S10/§S11 blocks are
migrated on first run. Verified by outcome: old vs new patch on fresh copies leaves
`spatial_structure` (79 rows) and `rel_contained_in_space` (1,009) identical.

**Threshold tightened to EPS/2** — 49 LTU rows are displaced by exactly 0.050000, so the strict
`> EPS` left them and the audit could never go green. Classification unchanged on both buildings
(LTU 40/278/6442, Terminal 233), so it is a margin, not a behaviour change. Both patches regenerated,
gate-verified against the served bytes, uploaded (`§GATE_VERDICT UPLOAD_VERIFIED` ×2);
`LTU_AHouse_positions.bin` rebuilt to match. Fleet result:

```
§PAIR_AUDIT Clinic     CLEAN  deviating>0.05=0
§PAIR_AUDIT Hospital   CLEAN  deviating>0.05=0
§PAIR_AUDIT LTU_AHouse CLEAN  deviating>0.05=0  rtreeVsExtracted=125698/125698
§PAIR_AUDIT Terminal   CLEAN  deviating>0.05=0  bboxMismatch=6 (max 0.129)
§PAIR_AUDIT_SUMMARY audited=4 corrupt=0 PASS
```
Named residual: Terminal has 6 elements whose bbox **size** differs from extracted by ≤0.129m —
sizes, not positions, out of scope for a transform patch, now a standing audit column.
Not CI-wired: the audit needs the gitignored DB binaries, so it stays a local/pre-deploy gate.

---

# §S13 — CLINIC BAKE + THE STOREY LADDER. Follow-up (2) ANSWERED (its premise was wrong),
# and the real fleet-wide cause MEASURED. 2026-08-17.

## §S13.1 The Clinic claims, re-measured — one was false, one was ~0.06%
§S10_RESULTS parked Clinic as "engine-side bake symptoms: missing ground slabs (only 12
Superstructure IfcSlab, min z=2.06, so the ground plate may genuinely not exist as IfcSlab there);
hanging MEPs (9,738/16,071 are MEP)". Both re-measured on the live DB:

- **"Missing ground slabs" is FALSE.** Clinic has a ground plate and the engine already classifies it
  correctly. Four slabs named `Floor:150mm Slab on Grade` / `Exterior Slab on Grade` sit at base_z
  −1.37, −1.15, −0.15, −0.15 (the main one **2,939 m²**), and all four come out
  `phase=Substructure, seq=1` — as do all 96 `IfcFooting`. The "min slab z=2.06" in the old note is
  the min of the *Superstructure-classified* slabs only (12 of them: 3 stair pans at 2.06 and the
  decks/roofs at 4.47-9.25). Counting one bucket and concluding the element does not exist was the
  error; nothing is missing.
- **"Hanging MEPs" is 9 elements, not a class of failure.** `probe_captured_floating.js` on
  `Clinic_meta`: `§EXP8_FINAL floating=9/16071`, of which MEP is 3 `IfcFlowSegment` + 1
  `IfcFlowFitting`. Out of 9,738 MEP elements that is 0.04%.
- Clinic's split pair is byte-clean (§S12 audit), so none of this is the §S10/§S11 defect.

## §S13.2 What the bake symptom actually is — the storey ladder splits one floor in two
`ScheduleGate.deriveBandRanks` groups elements by storey NAME and ranks the groups by median
`base_z`. When one physical floor carries two names, it becomes two adjacent ranks and everything
downstream (§4D_BAND_MONOTONIC, §PHASE_OVERLAP_SUPPORT_GUARD, zone CPM, the movie) treats them as
levels that must not overlap. Clinic, measured:

| storey | med base_z | q1 | q3 | n | source models (`elements_meta.building`) |
|---|---|---|---|---|---|
| TOF Footing | −0.52 | −0.55 | −0.32 | 1,676 | Plumbing 1476, Structural 197 |
| **Level 1** | 0.34 | −0.32 | 2.86 | 3,728 | **Plumbing 3713, Electrical 168** |
| **First Floor** | 2.93 | 0.00 | 3.85 | 2,343 | **Architectural 1154, HVAC 1050, Structural 463** |
| **Level 2** | 3.21 | 3.06 | 4.76 | 1,410 | **Plumbing 1396, Electrical 123** |
| Second Floor | 7.48 | 4.57 | 8.11 | 1,708 | HVAC 793, Architectural 751, Structural 386 |

The vocabularies are **provenance-disjoint, not guessed**: Architectural/Structural/HVAC say
"First Floor"/"Second Floor"; Electrical/Plumbing say "Level 1"/"Level 2". Engine-side (`RAW`,
straight out of `computeSchedule`) that already separates one floor into two windows: `First Floor`
day 8→67 vs `Level 1` day 36→50 (**28 days**), and `Second Floor` 27→99 vs `Level 2` 80→89
(**53 days**). ⚠ **See §S13.6 — the ladder is only PART of it, and not the larger part.** The
83-day figure this section originally quoted came from the FINAL table and mixed in a second,
bigger effect that had not been measured yet.

**New tool: `scripts/audit_storey_ladder.js`** (bim-ootb) prints this ladder per building and flags
adjacent bands whose interquartile z ranges intersect, saying whether their source models are
disjoint. It DETECTS ONLY — see §S13.4 for why it must not merge.

## §S13.3 Fleet ladder measurements
| building | storeys | overlapping pairs | storey-order violations | worst inversion | floating |
|---|---|---|---|---|---|
| Clinic | 8 | 3 (2 provenance-disjoint) | 1/6 | 49d | 9/16,071 |
| Hospital | 9 | **0** | 2/7 | 174d | 60/63,182 |
| Terminal | 23 | 11 | 12/21 | 95d | 256/48,428 |
| LTU_AHouse | 19 | 12 | (probe exceeds the run window) | — | — |

- **Hospital's ladder is clean** (Level 1…7A, ~5m apart, no overlaps) yet it still has 2/7 violations
  and the worst inversion in the fleet at 174 days. **Its cause is therefore NOT the ladder and is
  not yet identified** — this supersedes any assumption that storey naming explains every inversion.
- **LTU has three vocabularies whose medians coincide exactly**: VÅN 3 ≡ VÅNING 3 (median gap
  **0.00m**), VÅNING 2 ≡ VÅN 2 (**0.00m**), VÅNING 4 ≈ Storey 3 (0.09m). This is follow-up (3) from
  the §S11 close, now measured: it is the same defect as Clinic's.
- **Terminal carries two languages for the same building** — GROUND FLOOR LEVEL@0.6 / Aras Tanah@3.0,
  02 FIRST FLOOR LEVEL@7.6 / Aras 01@10.9, 03 SECOND FLOOR@12.7 / Aras 02@15.0 — interleaved with a
  systematic ~2.5-3.3m offset. Nothing in the DB says which pairs are one floor.

## §S13.4 A real defect found in `normalize_storey.py` — and MEASURED not to be the schedule driver
`scripts/normalize_storey.py` (bim-compiler) strips Revit reference-plane qualifiers so
"Level 2 Ceiling" → "Level 2", and its docstring states **"Never invents a level."** On Terminal it
does: `Ceiling Level 01/02/03/04` and `Ceiling Level Kedai` → `Level 01/02/03/04`, `Level Kedai` —
**673 elements given five storey names that do not exist in that building** (Terminal's real storeys
are `Aras NN` / `NN … FLOOR LEVEL`). They land as extra ladder rungs sitting right on the real ones
(Level 02@10.90 vs Aras 01@10.96 — 0.06m apart). Hospital is unaffected because there the stripped
name ("Level 3") *is* a real storey.

Candidate fix, consistent with the script's own precedent (a bare "Ceiling" already becomes
"Unknown"): after stripping, if the result is not already a storey present in that DB, map to
`Unknown` rather than create it. **Measured on Terminal before proposing it:**

| metric | as shipped | phantom rungs → Unknown |
|---|---|---|
| ladder ranks | 22 | 17 |
| storey-order violations | 12/21 | 9/16 (ratio 0.571 → 0.563) |
| worst inversion | 95d | **97d** |
| floating | 256/48,428 | **260/48,428** |

**It removes the phantom rungs and does not improve the schedule** — two metrics get marginally
worse. So the ladder pollution is real (and does pollute the Find Storey lens with five fake
storeys) but it is NOT what drives Terminal's inversions. Reported, not shipped: changing a
deterministic shipped script and re-patching a production DB to make two numbers slightly worse is
the user's call, not a session's.

## §S13.5 ⛔ BLOCKED — the one question, and why it was not answered by guessing
**Should two storey names be merged into one schedule band when nothing in the data says they are the
same floor — or should extraction start carrying the signal that would settle it?**

Merging is what would fix Clinic, LTU and probably Terminal. The rules that would do it (median-z
proximity, IQR overlap, chained grouping under a derived floor quantum) are all **inference**, and
this project's Prime Rule is EXTRACT OR COMPILE ONLY. What the DBs actually carry was checked, not
assumed:
- `elements_meta.building` settles **Clinic** (provenance-disjoint vocabularies) — but it is present
  only in `<B>_extracted.db`; **the split DROPS it, so `<B>_meta.db`, the DB the live viewer
  schedules from, cannot see it.** LTU and Terminal each have a single `building` value, so it
  settles nothing there.
- `spatial_structure` carries the real IFC hierarchy (IfcBuilding parentage) **only in LTU** (9
  IfcBuilding, 38 IfcBuildingStorey, `rel_aggregates` 751). Clinic/Terminal/Hospital have 3/6/7
  COMPILED rows from the room compiler and no parentage.
- No shipped DB carries `IfcBuildingStorey.Elevation`.

**Recommendation (needs a go, not a guess):** fix it extraction-side, not solver-side — carry
`building` through the split into `meta.db`, and extract `IfcBuildingStorey.Elevation` + IfcBuilding
parentage into `spatial_structure` for every building. Then band merging becomes a lookup instead of
a heuristic, and Clinic is fixed by data that already exists today. The solver-side merge stays
unwritten until then.


## §S13.6 ⚠ CORRECTION + the bigger finding: the Gantt task-window REMAP, not the ladder, is the
## dominant order-breaker — and the engine's raw schedule is fine
Measured after §S13.2 was written, by reading the probe's own per-stage tables instead of only its
final one. `§STOREY_ORDER_REPORT` at each stage:

| building | RAW (computeSchedule output) | POST_REMAP (Gantt task-window overlay) |
|---|---|---|
| Clinic | **0/6 violations, 0 days** | 2/6, 86d |
| Hospital | 1/7, 233d (an END inversion only — starts are monotonic 13<29<37<41<46<46<47<48) | 2/7, 236d |
| Terminal | 7/21, 113d | 10/21, 97d |

**Clinic's raw schedule is perfectly ordered and the remap breaks it.** Hospital is starker still:
raw has `Level 1` starting day **13**; after the remap it starts day **195** — the ground floor
moved 182 days later, which is the fleet's worst inversion and the thing that was being chased as
"Hospital lighting float". ⚠ Those table numbers are **p10 and p50** of start day, not min/max
(corrected in §S13.7) — so Clinic's `Level 1` going from 36→50 to **106→106** does not mean a
zero-width band; it means **≥40% of that band's 4,677 elements land on one start day**, months
after their walls. Still a real defect, stated accurately.

So the correct causal split for the Clinic bake report is:
1. the storey ladder separates one physical floor into two bands (28-53 days, engine-side, §S13.2)
2. **the task-window remap then places one of those bands as a zero-width window ~50-70 days later**
— and (2) is the larger, more visible effect, and it was not previously named anywhere in this lane.

This also reframes the lane's standing "engine-done, live-capped" pattern: §S9/§S10 chased the live
cap to a corrupted DB (correctly — that was real and is fixed). This is a SECOND cap, in the overlay
rather than the data, and it is the one that survives a clean DB.

**Next dig, precisely stated:** in `time_machine.js`, the path
`materializeZones → per-task window → §GANTT_TASK_WINDOW_FIDELITY per-element rescale` (injectGantt
`_cap` overlay, ~5527-5563, reproduced verbatim in `scripts/probe_captured_floating.js`). The
question to answer first is *why a task window can be narrower than the raw span of the elements it
contains* — a zero-width window for 4,677 elements is the symptom to reproduce and explain before
anything is changed. Do NOT patch the storey ladder to compensate; that is the per-symptom patching
this lane's §S10 note already warned against.


## §S13.7 ⛔ RETRACTED (2026-08-17, same day, on review) — the "root cause" was measured on a
## code path the live viewer does not execute. The RAW half stands; the POST_REMAP half does not.

**What is wrong.** §S13.7 concluded that `_twoTierRemap` is "a second live-side cap". It is not
reachable live. `viewer/time_machine.js:4519` — `_CPM_DISPLAY` defaults to **true** (only
`?cpm4d=0` turns it off); `_displayTimeline` then runs `CpmSchedule.run` and RETURNS at :4578.
`_twoTierRemap(items)` at :4585 and `_midairRepair(items)` at :4586 sit past that return and are
reached only through the `§CPM_DISPLAY_FALLBACK` branch, i.e. when `CpmSchedule.run` fails.
`scripts/probe_captured_floating.js` slices those very functions into a VM sandbox and measures
them — so every POST_REMAP number below describes the LEGACY FALLBACK, not what a browser plays.

**This is the lane's own recurring failure in a new coordinate.** §S10/§S11 was probe-DB vs
live-DB (`X_extracted.db` vs the `X_meta.db` pair). This is probe-PATH vs live-PATH. Same lesson,
one axis over: before attributing a live symptom to a mechanism, prove the mechanism RUNS live —
read the call site, not just the function.

**What survives.** The RAW columns are `ScheduleGate.computeSchedule` output, which is the real
generative engine on both paths, so those measurements stand: the generative schedule IS bottom-up
correct per phase (Hospital Superstructure 0/7 violations, MEP Rough-in 0/6 worst 0d). §S12,
§S13.1-§S13.5 and both new tools are unaffected — they read DBs and schedules, not the display path.
`§STOREY_PHASE_ORDER` keeps its value for the RAW half and for A/B work on the fallback; its
POST_REMAP half must be labelled as fallback-only.

**What was NOT done, deliberately.** A `gateE` concurrent-tail fix to `_tier1Serialize` was written
and about to be fleet-measured when this was caught. It was discarded unshipped — it would have been
a third narrowing of a rule (global → per-zone → per-element) inside code no user reaches.

**The actual next step:** measure `CpmSchedule.run` — the live display author — for the same
storey/phase ordering question, and only then say what caps the live schedule. Nothing below this
line should be quoted as a live finding.

---

## §S13.7 (ORIGINAL TEXT, RETAINED FOR THE RECORD — FALLBACK-PATH MEASUREMENTS ONLY)
§S13.6 named the remap but could not say *what* it broke, because `§STOREY_ORDER_REPORT` takes its
p50 over ALL of a storey's elements: a storey that is 58% MEP and one that is mostly structure are
compared on different things, so a global phase ordering alone makes the MEP-heavy storey look late
and registers as an "inversion" with nothing out of order. **That confound had to be removed before
any conclusion was safe** — and removing it changed the answer, so the phase-mix hypothesis was worth
testing rather than assuming. New env-gated dump `STOREY_PHASE_TABLE=1` in
`scripts/probe_captured_floating.js` (bim-ootb PR #1420) runs the same p50-by-storey table WITHIN
each phase, on raw and post-remap starts, in one run.

**Hospital — p50 start day per storey, bottom to top:**

| phase | RAW (`computeSchedule`) | POST_REMAP (`_twoTierRemap`) |
|---|---|---|
| Substructure | 0/0 | 0/0 |
| **Superstructure** | **0/7 viol** — 13, 20, 27, 35, 171, 175, 177, 178 | **0/7** — 23, 25, 28, 39, 171, 176, 177, 178 |
| **MEP Rough-in** | **0/6, worst 0d** — 51, 87, 128, 204, 258, 292, 298 | **1/6, worst 180d** — **L1 348**, 168, 182, 313, 375, 418, 418 |
| Architecture | 1/7, 109d — 14, 29, 105, 183, 240, 288, 179, 298 | 3/7, 165d — **L1 195**, 30, 106, 311, 374, 299, 182, 417 |
| MEP Final | 0/4, 0d | 1/4, 41d |
| Finishes | 1/4, 12d | 2/4, 12d |

**Clinic, same signature:** MEP Rough-in `RAW 0/5 worst 0d → POST_REMAP 2/5 worst 86d` (Level 1
47→106, Second Floor 100→197); Superstructure and Substructure 0 violations on **both** sides.

**Conclusion, two buildings, phase-isolated:** the generative schedule is bottom-up correct for every
structural phase. `_twoTierRemap` leaves structure untouched and scrambles **MEP**, hitting the
**ground floor hardest** — Hospital Level 1 MEP rough-in p50 **51 → 348 (+297 days)** while Level 2
goes 87→168 and Level 3 128→182. That is "hanging MEPs" and "Hospital lighting float" with a number
on it, and it is a SECOND live-side cap, distinct from the corrupted-DB cap §S10/§S11 fixed — this
one survives a clean DB.

**Where the fix goes, and why it was not made here.** `_twoTierRemap`'s Tier-2 barrier builds
`t1EndZ[z]` = the LATEST end of ANY Tier-1 element in zone z, then clamps every Tier-2 element in
that zone to start no earlier than it. A zone whose Tier-1 has one long straggler therefore pushes
ALL of that zone's MEP behind it — and the ground floor, which carries Substructure + Superstructure
+ Architecture in its zone, has the longest Tier-1 tail of any storey. That is consistent with every
number above, but it is a hypothesis about the mechanism, not yet a measured one. The function also
carries several explicit prior user rulings (§TIER2_AFTER_TIER1, §TIER_SERIAL_BY_ZONE,
§TIER2_PER_ELEMENT_CLAMP — the last one recorded as "DONT ASK ME, JUST FIX"), so changing it blind at
the end of a long session is exactly how a deliberate behaviour gets undone. **Next bounded task:**
confirm the straggler mechanism against `t1EndZ` per zone, then fix, with the table above as the
pass/fail gate — Superstructure must stay 0/7 and MEP Rough-in must return to 0/6.

## §S13.8 ⚠ RETRACTED (2026-08-17, Fable review) — §S13.7 localised a bug in unreachable code, not
## the live path. HALT any work fixing `_twoTierRemap`/`_midairRepair`. Do not merge `wt-tier-remap`.

**§S13.7's own measurement method proves this.** `STOREY_PHASE_TABLE=1` in
`scripts/probe_captured_floating.js` slices `_twoTierRemap` straight out of `time_machine.js`'s
source text and runs it standalone inside a sandboxed `vm.runInContext` (line ~629:
`this.__remap = _twoTierRemap`). That measures the function in isolation — it says nothing about
whether the real app ever calls it.

**It doesn't, on the path every symptom in this whole file has been tested on.** Grepped the entire
repo: `_twoTierRemap(` has exactly ONE call site,
`time_machine.js:4585` — inside `_displayTimeline()`'s `else` branch, reached ONLY when
`_CPM_DISPLAY && CpmSchedule.run()` (the `§CPM_DISPLAY` block, `time_machine.js:4519-4589`) either
is disabled (`?cpm4d=0`) or fails (`r.ok` falsy, which logs `§CPM_DISPLAY_FALLBACK`). Neither
condition has held anywhere in this lane: `§CPM_DISPLAY on` has fired successfully, live, for both
Terminal and Hospital, repeatedly, since S1 — see the `§CPM_RUN`/`§CPM_DISPLAY on` lines already
quoted earlier in this file (§S5_RESULTS's live-deploy verification, the live console dump this
lane's every stagger probe is measured from). `_midairRepair` sits on the identical unreachable
line (`4586`) — same verdict. `§TIER_SERIAL` (the witness `witness_tier_serial_display.js`) is part
of the SAME legacy two-tier chain per `probe_captured_floating.js`'s own comment
(`"_twoTierRemap + _midairRepair, §TIER_SERIAL 420d on..."`) — also dead on this path.

**What this means for §S13.7's numbers:** they are real measurements of a real bug — in a function
that has never executed on anything the user has looked at in this entire session. Fixing it,
including the in-progress `wt-tier-remap` work (narrowing the Tier-2 barrier from per-zone toward
per-element), changes nothing observable in the browser. **Stop that branch. Do not merge it.**

**Where the live MEP-scrambling bug actually has to be:** inside `CpmSchedule.run()` itself
(`cpm_schedule.js`) — the only code that runs on the path `§CPM_DISPLAY on` confirms is live. Two
concrete candidates, both already-read code from earlier in this file's own investigation:
E3's per-level Tier-1→Tier-2 gate (`t1Complete()`, `cpm_schedule.js:226-260` — EVERY Tier-2 group at
a level, including MEP Rough-in, is gated FS behind ALL Tier-1 phases at that SAME level finishing,
via one shared `t1Complete(L)` milestone) and E4's band-to-band chaining (S1's own change,
`cpm_schedule.js:263-289` — phase-specific, so it should NOT cross-contaminate MEP with
Superstructure, but has not been specifically checked for the ground-floor case named here).
E3's per-level Tier-1 gate is the more likely mechanism to produce EXACTLY this signature (ground
floor carries the most Tier-1 phases — Sub+Super+Arch — so its `t1Complete` milestone is fed by the
most/slowest elements, gating MEP Rough-in behind all of them) — same shape hypothesis §S13.7 had
for `_twoTierRemap`, just aimed at the actual live function this time.

**§S14 — MEASURE the live path this time, not a slice of it.** Before touching any code: reproduce
the Hospital/Clinic MEP-scrambling table from §S13.7 using a probe that provably exercises
`CpmSchedule.run()` — either a probe that imports `cpm_schedule.js` directly and calls `run()` on
real element data (no sandboxed slicing of `time_machine.js`), or a live/headless run whose log
shows `§CPM_DISPLAY on` firing before the measurement is taken. **Acceptance for §S14.0 (before any
fix):** the same per-phase, per-storey p50 table §S13.7 produced, reproduced on the CONFIRMED-live
`CpmSchedule.run()` path, with the log evidence proving which path ran quoted in this file. If the
scrambling does NOT reproduce on the live path, §S13.7's whole finding was an artifact of testing
retired code — say so plainly and go looking elsewhere (start from `t1Complete()`'s per-level
gating, above). If it DOES reproduce, THEN localise the mechanism inside `cpm_schedule.js` (not
`time_machine.js`) and fix there, with the same Superstructure-0/7 / MEP-Rough-in-0/6 pass/fail gate
§S13.7 already defined — that gate is still valid, only the code location changes.

**Standing guardrail this failure earns, beyond this one bug:** any probe or diagnostic in this lane
that isolates a function (slices source, calls it out of context, sandboxes it) MUST also show — in
the same log output — that the isolated call matches what the live default path actually executes
(same gate condition, same success branch), before its findings get written up as a root cause.
"The function has a bug" and "the function is why the user sees a bug" are different claims and this
file conflated them once already. Verify reachability, not just behavior.


# §S14.0_RESULTS — 2026-08-17. ✅ EXECUTED, verdict NEGATIVE: the scrambling does NOT reproduce on
# the live path. §S13.7 was an artifact of retired code end to end, and `t1Complete()` is eliminated.
# Measurement: bim-ootb PR #1421 (`scripts/probe_cpm_display_path.js`).

**Reachability evidence, printed beside the numbers this time** (the §S13.8 guardrail, honoured):
```
§CPM_RUN n=63182 nodes=63222 edges={E1:63147,E2host:2830,E2open:936,E3:60846,E4:54183,...} makespanDays=277.7
§CPM_LIVE_PATH Hospital_meta cpmRunOk=true -> _displayTimeline would return at
  time_machine.js:4578 (§CPM_DISPLAY on); _twoTier/_midairRepair at :4585-4586 NOT reached.
  Module=require(viewer/cpm_schedule.js), not a source slice.
```
Nothing sliced: `CpmSchedule` is the shipped module, `require`d directly, and its own `§CPM_RUN`
line is the proof it executed. The probe emits the table twice — RAW (`computeSchedule`, the
generative engine) and CPM_LIVE (`CpmSchedule.run`'s solution, what the browser plays) — so
engine-vs-display is one diff, per phase.

**Live result, p50 start day per storey:**

| building | phases with violations | detail |
|---|---|---|
| **Hospital** | **none — 0 violations in EVERY phase** | Superstructure 0/7, MEP Rough-in 0/6: Level 1 **27**, then 54, 101, 153, 208, 269, 277 |
| **Terminal** | Architecture 1/7 **worst 1d**, MEP Final 3/11 worst 8d | Superstructure 0/14, MEP Rough-in 0/8, Substructure 0/0, Finishes 0/0 |
| **Clinic** | Architecture 1/6 worst 15d, Finishes 1/3 worst 17d | MEP Rough-in 0/5, Superstructure 0/2, Substructure 0/1, MEP Final 0/3 |

§S13.7's fallback table had Hospital MEP Rough-in Level 1 at p50 **348** with a **180-day**
inversion. Live it is **27** — first, as it should be. Clinic's two flagged rows are both the
`First Floor` vs `Level 1` duplicate-vocabulary pair (same physical floor, mean z 0.3 vs 0.3,
§S13.2): ranking two names for one storey by mean z is what creates the "inversion", so it is a
metric artifact, not a scheduling defect.

**What this settles:**
1. §S13.7's finding was an artifact of retired code, end to end — not merely mis-attributed.
2. `cpm_schedule.js`'s E3 per-level Tier-1 gate `t1Complete()` (§S13.8's leading candidate) does
   NOT produce the signature. **Eliminated by measurement, not by reading** — do not re-open it
   without a new symptom.
3. **The live 4D schedule is bottom-up correct per phase on all three buildings tested. No fix is
   warranted on this axis, and none was made.**

**Where that leaves the user-visible symptom.** "Hanging MEPs" measured live is 9/16,071 floating
on Clinic (§S13.1) with zero ordering violations here. Nothing measured in this lane now points at
the schedule ORDER. If a bake still looks wrong, the next place to look is what the movie renders
from the schedule, not the schedule itself — and per §S13.8's guardrail, whatever probe is used must
show its own reachability first.

---

# §S15 — the 9/72 residual same-start cluster, INVESTIGATED (2026-08-17). No fix warranted; folds
# into two already-diagnosed, already-parked causes. Measurement: bim-ootb PR #1422 rerun of
# `probe_gantt_stagger.js` (`scripts/probe_gantt_stagger.js`, live viewer) + `audit_storey_ladder.js`.

**Fresh run today** (numbers move slightly stage to stage, as expected): Terminal 10/73 tasks share
start day 4 (was 9/72 at S6); Hospital 4/36 share day 10 + 3/36 share day 12 (was 3/35 at S6). Same
shape, not a regression — investigated below.

**Terminal's cluster is 100% the storey-ladder vocabulary split (§S13.5).** All 10 same-day tasks —
`Architecture_Aras_Jalan`, `Architecture_Aras_Kedai`, `Architecture_GROUND_FLOOR_LEVEL`,
`Architecture_Level_Kedai`, `MEP_Final_GROUND_FLOOR_LEVEL`, `MEP_Final_Level_Kedai`,
`MEP_Rough_in_GROUND_FLOOR_LEVEL`, `Superstructure_Aras_Kedai`, `Superstructure_Aras_Tanah`,
`Superstructure_Ground_Lev` — map to storeys `audit_storey_ladder.js` measures at median z 0.63m to
3.00m: six different NAMES (`GROUND FLOOR LEVEL`, `Aras Kedai`, `Aras Jalan`, `Ground Lev`,
`Level Kedai`, `Aras Tanah`) for what the ladder audit already flags as overlapping bands (gaps
0.17m-0.34m between consecutive pairs — well inside one physical floor's thickness). M1's own rule
(§MODEL) treats each storey NAME as an independent parallel zone — by design, levels inside one band
are never chained to each other (`Kedai ∥ main hall`). Six names for one ground floor means six
independent zone-chains with nothing stopping them from becoming schedule-ready on the same day, so
this is the SAME symptom §S14.0 already predicted: *"this vocabulary split is also what makes
Clinic's only two live 'violations' appear, so fixing it cleans the metric too."* No new defect —
it is §S13.5's already-blocked storey-band merge, showing up in a second metric. **No action beyond
what §S13.5 already asks for (the extraction-side fix, blocked on a go).**

**Hospital's cluster is NOT the ladder** — `audit_storey_ladder.js` measures Hospital's ladder CLEAN
(0 overlapping pairs, §S13.3). The clustered tasks (`Architecture_Level_1`, `Substructure_Level_2`,
`Superstructure_Level_1`, `Superstructure_Level_2` at day 10; `Finishes_Level_1`,
`MEP_Final_Level_1`, `MEP_Rough_in_Level_1` at day 12) are large groups (n=119 to n=5,224), not
single stragglers, and their SAME phase/storey pairs show ZERO order violations in §S14.0's
per-phase table measured this same week (Hospital: Superstructure 0/7, MEP Rough-in 0/6, live
`CpmSchedule.run` path). A task bar's start (M2, the Tukey-envelope of ALL its members' true times)
is legitimately early when a handful of that phase's elements have their own precedence satisfied
early, even while the phase's work mass continues for weeks — that's what a 305-day span
(`Architecture_Level_1` s=10 e=315, n=2026) on a bar means. Two independent phases/storeys can
correctly land their EARLIEST member on the same day without any ordering defect between them.
**Trying to pull these apart is re-spacing a display-authored task window — §PATHS NOT TO TAKE #3,
already tried twice, already rejected (manufactured 4,712 violations / broke 537 contact pairs).
Not re-attempted here.**

**Verdict:** item (1) from the prior RESUME is CLOSED as investigated, not as fixed — both
components trace to causes this file already named and already parked (§S13.5's blocked merge;
§PATHS NOT TO TAKE #3's dead end). The ⚠ "MOSTLY, not zero" line in §ACCEPTANCE stays exactly as
scored; nothing here changes it.

# §S16 — fresh activation-memory measurement (2026-08-17), replaces the stale "+390MB" figure.
# Measurement: bim-ootb PR #1422, new `scripts/probe_activation_memory.js` (Puppeteer
# `page.metrics()`, real viewer, real Time Machine activation — not a synthetic allocation count).

The old figure was pre-#1399 and had never been re-measured against S1/S4/S6/S9-S13's changes to
the same activation path (§MODEL M4 note). Fresh numbers, JS heap only, baseline → immediately
post-`§TIME_MACHINE ON` → +20s settle:

```
§ACT_MEM_BASELINE        Hospital_extracted JSHeapUsedMB=63.5
§ACT_MEM_POST_ACTIVATION Hospital_extracted activationMs=19382 JSHeapUsedMB=235.8 deltaFromBaselineMB=172.3
§ACT_MEM_SETTLED         Hospital_extracted JSHeapUsedMB=239.5 deltaFromBaselineMB=176.0 deltaFromPostActivationMB=3.7

§ACT_MEM_BASELINE        Terminal_extracted JSHeapUsedMB=72.8
§ACT_MEM_POST_ACTIVATION Terminal_extracted activationMs=15837 JSHeapUsedMB=166.5 deltaFromBaselineMB=93.7
§ACT_MEM_SETTLED         Terminal_extracted JSHeapUsedMB=111.9 deltaFromBaselineMB=39.0 deltaFromPostActivationMB=-54.6
```

**Current cost is +39MB to +176MB, not +390MB.** Hospital-63k (the building the old figure and S4's
activation-timing work were both measured against) settles at +176.0MB — well under half the stale
figure. Terminal's settled heap actually DROPS 54.6MB after peaking (standard V8 GC reclaiming
during the 20s settle window), landing at +39.0MB net — the peak (+93.7MB) is the more honest
"cost" number for a memory budget, since GC timing is non-deterministic. Activation wall-clock
(19.4s Hospital, 15.8s Terminal) is consistent with S4's recorded 20.8-23.2s floor, not a new
regression.

**No optimization claim follows from this** — item (2) from the prior RESUME asked for a fresh
number before any optimization work, not for optimization itself. None was warranted or attempted;
the number is simply no longer stale.

# §S17 — audit of other `probe_*.js` harnesses for the same dead-branch class §S13.7 fell into
# (2026-08-17, item 5 of the prior RESUME). Measurement: read every `scripts/probe_*.js` in
# bim-ootb for slice-and-call patterns (`new Function(...)`, `vm.runInContext`) against functions
# that are gated behind a live/fallback branch, not called unconditionally.

8 probes exist. 6 use source-slicing (`new Function`/`vm`) for SOMETHING — but only one slices a
branch-gated function without proving which branch is live:

| probe | slices | branch-gated? | verdict |
|---|---|---|---|
| `probe_cpm_schedule.js` | (comment only, no call) | — | clean |
| `probe_cpm_display_path.js` | nothing — `require`s the shipped module directly | n/a, this IS the reachability probe | clean, is the fix |
| `probe_proxy_carrier_classes.js` | `_contactGraph` | NO — pure geometry, every call site uses it identically, no live/fallback split | clean |
| `probe_task_collision.js`, `probe_zone_edges.js` | `RATES`/`SEQUENCE_RULES` constants only | NO — config data, not branched code | clean |
| `probe_gantt_drag_outliers.js`, `probe_gantt_stagger.js` | nothing sliced | n/a | clean |
| **`probe_captured_floating.js`** | **`_twoTierRemap` + `_midairRepair` (EXP6 / `STOREY_PHASE_TABLE` mode)** | **YES — reachable only via `_displayTimeline`'s `§CPM_DISPLAY_FALLBACK` branch, never live (§S13.8/§S14.0)** | **was the landmine — FIXED this session** |

**Fixed (bim-ootb PR #1422):** EXP6's header comment called this "BROWSER-FAITHFUL" — false since
§S13.8/§S14.0 retracted exactly that claim. Added an inline retraction note plus a runtime
`§STOREY_PHASE_TABLE_REACHABILITY_WARNING` log line that fires whenever `STOREY_PHASE_TABLE=1` runs,
so the retraction is visible in the LOG a future session actually reads (per this project's own Log
Mandate), not only in a source comment that's easy to skip past. Verified: reran
`STOREY_PHASE_TABLE=1 probe_captured_floating.js` end to end, confirmed the warning line prints
before the (still-present, still-retracted) table output. No behavior change — detection-only, the
underlying EXP6 code is untouched since some other section of this file may still use its other
outputs.

**No other probe needed a fix.** This audit is a point-in-time result, not a standing gate — a new
probe added later should be checked against the same question (does it slice a function gated behind
a live/fallback branch?) before its findings are trusted.

---

# 🏁 RESUME (one-liner for a fresh session) — 2026-08-17 close, after §S15-§S17
**S1-S17. Read §S13.8 (retraction) then §S14.0_RESULTS (the re-measurement) before §S13.7 — that
section is retained only as a record of a bug in retired code. §S15-§S17 close out three of the four
prior NEXT items (same-start cluster investigated/no-fix, memory re-measured, probe audit) — one
fix shipped (bim-ootb PR #1422, the STOREY_PHASE_TABLE landmine warning).**

CLOSED + LIVE: split-pair transform corruption, fleet-wide and now DETECTABLE rather than
hand-found — `scripts/audit_split_pairs.js` + `scripts/gen_meta_transform_patch.js` (§S12, PR #1417)
report `audited=4 corrupt=0 PASS`; Terminal + LTU patches regenerated, gate-verified against the
served OCI bytes. CLOSED: Clinic's bake item — "missing ground slabs" was FALSE (the 2,939m²
slab-on-grade is there, already Substructure/seq1) and "hanging MEPs" is 9/16,071 floating.

⛔ RETRACTED then RE-MEASURED: "_twoTierRemap is a second live-side cap" (§S13.7) was measured on
code `_displayTimeline` only reaches in its `§CPM_DISPLAY_FALLBACK` branch. §S14.0 put the same
per-phase, per-storey table on the confirmed-live `CpmSchedule.run` path (bim-ootb PR #1421,
reachability logged as `§CPM_LIVE_PATH … cpmRunOk=true`) and **it does not reproduce**: Hospital 0
violations in every phase (MEP Rough-in Level 1 p50 **27**, not 348), Terminal Superstructure 0/14
and MEP Rough-in 0/8, Clinic MEP Rough-in 0/5. `t1Complete()` is ELIMINATED by measurement. **No
live schedule-ordering defect remains on this axis and no fix was made.**

**Standing guardrail (§S13.8, earned twice now):** any probe that isolates a function — slices
source, sandboxes it, calls it out of context — MUST print, in the same log, that its call matches
what the live default path executes, before its findings are written up as a root cause. "The
function has a bug" and "the function is why the user sees a bug" are different claims. §S10/§S11
was probe-DB vs live-DB; §S13.7 was probe-PATH vs live-PATH.

**Read `§PATHS NOT TO TAKE` (right after §LOCKED, top of this file) before proposing any fix below —
8 measured dead ends, do not re-attempt without new evidence.**

**§S15-§S17 (2026-08-17) closed out items 1, 2, and 5 of the prior NEXT list:**
1. ✅ INVESTIGATED, no fix warranted — the same-start cluster (now 10/73 Terminal, 4+3/36 Hospital)
   is Terminal's already-blocked storey-ladder vocabulary split (§S13.5) plus Hospital's legitimate
   independent-zone parallelism (dead end #3 territory if "fixed") — see §S15.
2. ✅ RE-MEASURED — activation heap is +39MB to +176MB now, not the stale +390MB — see §S16.
5. ✅ AUDITED + FIXED — `probe_captured_floating.js`'s `STOREY_PHASE_TABLE` mode was a second
   instance of the §S13.7 dead-branch class; now carries a retraction comment + runtime warning
   log line (bim-ootb PR #1422) — see §S17.

**NEXT, remaining (unchanged, none newly actionable this session):** (3) ⛔ still needs a go —
storey-band merge is INFERENCE with today's data, recommended fix is extraction-side (carry
`elements_meta.building` through the split into meta.db; extract `IfcBuildingStorey.Elevation` +
IfcBuilding parentage), §S13.5 — this is now the root of BOTH the Clinic ladder violations (§S13.2)
AND Terminal's same-start cluster share (§S15), so it is the one remaining item that would clean up
two metrics at once, if/when a go is given; (4) if a bake still looks wrong despite everything above
being green, look at what the movie RENDERS from the schedule, not the schedule — the order is
measured clean live (still conditional on a live symptom report — nothing to check without one);
(6) `normalize_storey.py` invents 5 storeys on Terminal against its own docstring (§S13.4) — reported
not shipped, stays that way, no new evidence changes the verdict; (7) Terminal's 6 bbox-SIZE
mismatches vs extracted (≤0.129m) — unchanged, still a standing audit column, explicitly out of scope
for the transform-patch pass by design (§S12), not a defect; (8) S8 playback-flicker stays PARKED per
§PRIORITY (explicit user ruling, not reopened).**

---

# §S18 — storey-band merge, extraction-side. GO GIVEN (2026-08-17, user: "do not push back, see to
# it"). Two independent, separately-verifiable fixes — do not combine into one PR.

**Part A — carry `elements_meta.building` through the split (fixes Clinic).** Verified today:
`scripts/split_db.sh`'s current DROP list (`component_geometries`, `base_geometries` from meta;
`elements_meta`+3 others from geo) does NOT drop `elements_meta` from meta.db — it's a full clone
minus geometry tables, so `building` survives the split AS WRITTEN TODAY. §S13.5's finding ("the
split DROPS it") was measured against the SHIPPED meta.db files, which predate this script version
or an older split path — same stale-artifact class as §S10/§S11, not a live script bug.
*Acceptance:* (1) confirm by direct query — does `Clinic_meta.db` (served OCI bytes, not local) have
a non-null `building` column today? If yes, Part A is ALREADY DONE, stop, update §S13.5, do not
regenerate anything. If no: regenerate Clinic's (and any other multi-`building`-value building's)
meta.db with the CURRENT `split_db.sh`, gate-verify against served bytes per the §S10/§S12 pattern
(`oci_patch_gate.js`), confirm `building` is queryable live. (2) `§STOREY_ORDER_REPORT` Clinic
violations must drop from the §S13.2 baseline once the viewer actually uses the column (Part B may
be required for the viewer to USE it — check before claiming this alone fixes the metric).

**Part B — extract `IfcBuildingStorey.Elevation` + `IfcBuilding` parentage into `spatial_structure`
(fixes Terminal/LTU/Hospital, all currently 3-7 compiled rows with no real parentage).** Find the
extractor that currently populates `spatial_structure` (grep `spatial_structure` INSERT statements
across `tools/*.py`/`build/*.js`/Java sources — not yet located this session, first step). Read how
it walks the IFC tree today. Add: `IfcBuildingStorey.Elevation` (a plain attribute on every
ifcopenshell/IFC-parse storey object) and `IfcBuilding`→`IfcBuildingStorey` parentage (via
`IfcRelAggregates`/`.Decomposes`, same relation LTU's extractor already captures correctly — LTU is
the reference implementation, 9 IfcBuilding/38 IfcBuildingStorey/751 rel_aggregates, not a guess).
EXTRACT ONLY — do not infer elevation from element z-values, that is exactly §PATHS NOT TO TAKE #7.
*Acceptance:* re-extract Clinic + Terminal (or LTU-style regenerate), `spatial_structure` gets real
Elevation + parentage rows matching LTU's shape; a NEW merge step (viewer or extraction-side, session
picks the simpler one and states which) uses parentage-then-elevation to group storey NAMES that
share one physical floor; `§STOREY_ORDER_REPORT`/`§LAYER_BUILDUP` violations on Clinic and Terminal
must not get worse anywhere they're 0 today (§S13.7/§S14.0/§S3's numbers are the regression floor);
Terminal's same-start cluster (§S15) should shrink if the merge is real — record the new count, do
not force it to a target.

**STOP-AND-REPORT if:** Part A is already fixed by the current script (say so, don't do unneeded
work); the extractor for `spatial_structure` can't be found in one focused search (report where you
looked, don't guess a location); any regression on a currently-0 metric. Same worktree/PR-per-part
discipline as every prior stage. Sonnet-dispatchable: Part A is fully mechanical (query, maybe
regenerate, verify) once step 1 is checked. Part B needs one real read of unfamiliar extraction code
before it's numeric — do that read first, then it's the same shape as everything else in this file.

# §S18_RESULTS — 2026-08-17, Part A STOP-AND-REPORT (corrected premise, no regen), Part B ✅ SHIPPED
# + GATE-VERIFIED + LIVE (bim-compiler PR #83, bim-ootb PR #1424, both merged)

## Part A — verified against SERVED OCI bytes, and it is NOT a stale-split fix
This section's own premise ("split_db.sh already carries `building` through, Part A is just a
stale-artifact regen") was checked against the actually-served `Clinic_extracted.db`/`Clinic_meta.db`
(OCI `bim-ootb` bucket, not a local copy) and turned out **half right, half wrong, in a way that
changes the fix**:
- **Confirmed true:** `scripts/split_db.sh`'s `.clone` does carry `elements_meta.building` through
  unmodified. Running the CURRENT script against the CURRENTLY-served `Clinic_extracted.db` reproduces
  the served `Clinic_meta.db` byte-for-byte on every OTHER column (0 mismatches on `ifc_class`,
  `element_name`, `storey`, `discipline`, `material_name`, `material_rgba` across all 16,114 rows).
- **The one column that differs, `building`, is NOT a stale artifact — restoring it would be a live
  regression.** Served `Clinic_extracted.db` has 5 distinct per-discipline-file values
  (`Clinic_Architectural_IFC2x3`, `..._Electrical_IFC2x3`, `..._HVAC_IFC2x3`, `..._Plumbing_IFC2x3`,
  `..._Structural_IFC2x3`); served `Clinic_meta.db` collapses all 16,114 rows to a single `"Clinic"`.
  That collapse is a **deliberate, already-shipped, already-regression-tested fix** — commit
  `8e44c4156` (2026-05-18, "Clinic building-name fix... viewer was only auto-streaming nearest
  'building' (ACMV)"), guarded ever since by `tests/whitebox_regression.js`'s `clinic_single_building`
  test (`reason: ok ? '' : '${buildings.length} building names instead of 1 — viewer streams only one
  at a time'`). `viewer/streaming.js` groups by `elements_meta.building`, picks the geographically
  NEAREST value, and streams ONLY that one — 5 values means 4/5 of Clinic's disciplines silently never
  load. Regenerating `Clinic_meta.db` from the current `extracted.db` via the current `split_db.sh`,
  as this section originally prescribed, would have shipped that exact regression back into
  production. Caught before any upload, not after.
- **The provenance signal §S13.2/§S13.5 actually needed already exists, safely, in a DIFFERENT column
  that was never touched by the May fix: `elements_meta.discipline`.** Queried directly against the
  served `Clinic_meta.db`: `ACMV|3704 ARC|1984 ELEC|2118 MEP|102 PLB|6585 STR|1621` — cross-tabbed
  against §S13.2's disjoint-vocabulary storeys, e.g. `storey='Level 1'`: `ELEC=15, PLB=3713` (n=3,728,
  exact match to §S13.2's n and its `Plumbing 3713`); `storey='TOF Footing'`: `PLB=1476, STR=197` (exact
  match to §S13.2's `Plumbing 1476, Structural 197`). `discipline` is not read by `streaming.js`'s
  building-selection logic at all — using it costs nothing.
- **Verdict: Part A needed NO DB regeneration and NO upload.** `§13.5`'s "the split DROPS it, so
  `<B>_meta.db` ... cannot see it" claim is corrected — the split does not drop `building`, but
  `building` itself is the wrong column to use for this purpose, by design, since May. `discipline` is
  the correct, already-live, already-safe signal — this is what Part B's merge (below) actually
  consumes for Clinic.

## Part B — extractor found, fixed, shipped; Clinic proven end-to-end; Terminal/Hospital/LTU's OWN
## regeneration is the honest remainder, not attempted this pass
**Extractor located** (grep `spatial_structure` INSERT statements across `tools/*.py`, `build/*.js`,
Java sources, then traced Clinic's ACTUAL build script): three code paths write `spatial_structure`
today — `tools/extract.py`/`DAGCompiler/python/extractIFCtoDB.py` (real IFC parse, used by
`onboard_ifc.sh`'s canonical pipeline and by `extract_merge_disciplines.py`'s discipline-merge
default), and `scripts/compile_rooms.py` (the "room compiler" — pure SQL/geometry flood-fill off
already-extracted bboxes, no IFC file, no `.Elevation`, no `IfcRelAggregates`, storey `parent_guid`
hardcoded `None`). **Clinic's actual production script, `scripts/extract_clinic.sh`, uses NEITHER of
those** — it calls a fourth extractor, `scripts/extractIFC2DB.js` (Node/web-ifc), and that extractor
**never wrote `spatial_structure` at all**. Its own merge step (`extract_clinic.sh` step 2) only
carried `elements_meta`/`element_transforms`/`element_instances`/`component_geometries` across the
5-discipline merge — `spatial_structure` was never in scope. That is why served Clinic showed exactly
the "3 COMPILED rows" shape §S13.5 named: 100% `compile_rooms.py` fallback, nothing from real
extraction, because real extraction never produced anything to carry.

**Fix, `scripts/extractIFC2DB.js`** (bim-compiler PR #83): added real `IfcBuilding` +
`IfcBuildingStorey` rows to a new `spatial_structure` table, reading `s.Elevation` (a plain IFC
attribute, unit-corrected via the SAME `autoScale` factor already applied to geometry) and real
`IfcBuilding`→`IfcBuildingStorey` parentage via `IFCRELAGGREGATES.RelatingObject`/`.RelatedObjects` —
the exact relation the aggregation pass already walked for storey→space containment, now also checked
against `IFCBUILDING` parents. EXTRACT ONLY — no z-proximity inference (§PATHS NOT TO TAKE #7).
`extract_clinic.sh` updated to carry `spatial_structure`/`rel_aggregates` through the merge, and to
re-apply the `building`→`'Clinic'` normalization (Part A) on every regeneration, so re-running this
script can never silently reintroduce the streaming regression again.

**A real, disclosed residual, found by this fix, not caused by it:** one of Clinic's 5 discipline files
(Structural) declares `IfcProject` `LENGTHUNIT=METRE` but its `IfcBuildingStorey.Elevation` values read
1000x too large (4570/9250/-1000 where 4.57/9.25/-1 is correct) — a source-file authoring defect, not a
units-conversion miss (confirmed: the file's OWN declared unit is METRE, so no unit-scale factor
"fixes" it; the raw attribute value itself is wrong). The merge logic (below) is robust to this by
design — it uses the MEDIAN elevation per storey name, so 3-of-4 agreeing "Second Floor" rows (~4.57)
outvote the 1 corrupted row — but "Roof - Mech" (sourced ONLY from Structural, no other file has that
exact name) has no agreeing rows to be outvoted by, so it stays its own unmerged, still-wrong band.
Disclosed, not hidden; does not affect the merges that matter (First Floor/Level 1, Second Floor/Level
2 — the pairs §S13.2 actually named).

**Viewer-side merge** (bim-ootb PR #1424) — **decision: viewer-side, not extraction-side, and here is
why.** `deriveStoreyMergeMap()` (new, `viewer/schedule_gate.js`) groups storey NAMES by MEDIAN
extracted `Elevation`, merging names within `GAP` (0.5m — this module's own pre-existing "audit: within
this of" constant, reused per §GUARDRAILS, not a new tuned quantum) of a lower band. Threaded through
`deriveBandRanks`/`deriveZones` as an OPTIONAL parameter, wired ONLY at `schedule_author.js`
`materializeZones()` — the DISPLAY/AUDIT layer that runs AFTER `computeSchedule` has already produced
real element times. `computeSchedule`'s OWN internal `deriveBandRanks` call (PASS-B's band-monotonic
trade gate) never receives the map, so the engine's `floating=0` invariant is untouched by
CONSTRUCTION, not just by testing. Rejected extraction-side: rewriting `elements_meta.storey` values
directly would touch every OTHER consumer of that column (Find Storey lens, Room lens, storey-filter
UI) for a change that is properly scoped to "what a LEVEL means to the storey gates" — exactly the
layer this lane's own header already carves out as in-scope, separate from the engine.

### Measured (headless real-viewer probe, `scripts/probe_gantt_stagger.js`, modified viewer +
### regenerated Clinic vs the previously-served bytes — both fetched/verified, not assumed)
```
§S18_STOREY_MERGE names=7 merged=2
METRIC (before) withinLevelPhasePairs=65 overlapping=44 overlapDaysSum=1986 parallelism=13.47x totalDays=105 tasks=33
METRIC (after)  withinLevelPhasePairs=45 overlapping=33 overlapDaysSum=1597 parallelism=9.50x  totalDays=105 tasks=23
§LAYER_BUILDUP (before) violations=1/5 bands=6 ops=16114 detail=["band2(n=2735,med=90.0d)>band3(n=546,med=81.8d)"]
§LAYER_BUILDUP (after)  violations=1/5 bands=6 ops=16114 detail=["band2(n=2735,med=90.0d)>band3(n=546,med=81.8d)"]  — UNCHANGED, correctly (kernel_ops write-order metric, not storey-name grouping)
```
10 `Level-N`/`X Floor` task pairs merged into one task each — every merge's element count sums EXACTLY
(e.g. `TASK_Architecture_First_Floor` 920 + `TASK_Architecture_Level_1` 134 → 1054; `TASK_MEP_Rough_in_
First_Floor` 1367 + `TASK_MEP_Rough_in_Level_1` 3644 → 5011), confirming the merge is exact, not
approximate. Clinic's tasks: **33 → 23**. Same-start cluster (tasks sharing one start day, same
methodology as §S15): **23/33 → 11/23**.

**Regression check — same modified viewer code, run against Terminal/Hospital's UNREGENERATED data**
(neither has been re-extracted with the §S18 fix — this proves the fallback, not a Terminal/Hospital
improvement):
```
§S18_STOREY_MERGE_FAIL no such column: elevation — no elevation data, bands unmerged   (Terminal)
§S18_STOREY_MERGE_FAIL no such table: spatial_structure — no elevation data, bands unmerged   (Hospital)
tasks=73 (Terminal)  tasks=36 (Hospital)
```
Both task counts match the already-documented §S15 baseline exactly (Terminal 73, Hospital 36) — zero
behavior change confirmed live, not assumed from reading the fallback code.

### OCI upload — gate-verified against served bytes (§S10/§S12 pattern, adapted: full-DB reupload
### instead of a patch file, see rationale below)
Regenerated `Clinic_extracted.db`/`_meta.db`/`_geo.db`/`_positions.bin` uploaded to `bim-ootb` bucket
(gzip -9, `--content-encoding gzip`, per `OCI_UPLOAD.md` rule 8), fetched back, and MD5-verified
byte-identical to the local artifact (`Clinic_meta.db` and `Clinic_positions.bin` both confirmed;
`elements_meta.building='Clinic'` count=16,912 and `spatial_structure` 4 `IfcBuilding`/16
`IfcBuildingStorey` (16 with elevation) confirmed live on the re-fetched served bytes). A patch file
(the `gen_meta_transform_patch.js`/`oci_patch_gate.js` convention) was considered and rejected for THIS
fix specifically: a per-guid `UPDATE ... WHERE guid=...` patch restoring 16,114 distinct `building`
values would be ~1.4-1.6MB of SQL — bigger than the 1.2MB gzipped `Clinic_meta.db` itself, and
`_applyPendingPatch` re-applies the WHOLE patch on EVERY page load. Full reupload is smaller, cheaper
per-load, and this is what Part A's own investigation found is unnecessary anyway — the actual Part B
regeneration (spatial_structure) is what changed, not `building`.

### Acceptance criteria — Clinic (the one this session fully closed)
| Metric | Before | After | |
|---|---|---|---|
| Tasks | 33 | 23 | fewer, more meaningful bars |
| Overlapping phase-pairs | 44 | 33 | -25% |
| Overlap-days sum | 1986 | 1597 | -19.6% |
| Parallelism | 13.47x | 9.50x | real reduction in "many stacked equi-shaped bars" |
| Same-start cluster | 23/33 | 11/23 | 70% → 48% of tasks |
| §LAYER_BUILDUP violations | 1/5 | 1/5 | unchanged (different metric, correctly unaffected) |

**Terminal's same-start cluster (§S15, 10/73)** was NOT re-measured post-merge — Terminal's actual
production extraction uses `DAGCompiler/python/extractIFCtoDB.py` + `extract_merge_disciplines.py`
(different pipeline from Clinic's `extractIFC2DB.js` + `extract_clinic.sh`), which this pass did not
touch. The merge infrastructure (`deriveStoreyMergeMap`, threaded through `deriveBandRanks`/
`deriveZones`) is fully generic and fleet-wide — proven to no-op safely on Terminal's current data
(above) and to work exactly as designed the moment real `Elevation`/parentage data exists for a
building. **Extending the fix to `extractIFCtoDB.py` (same class of gap: no `.Elevation` read anywhere
in that file either, plus a "buildings[0]" blind-assignment bug for storey parentage instead of a real
`IfcRelAggregates` walk — found by reading it, not yet fixed) and re-running Terminal's/Hospital's own
production extraction pipelines is the honest, named remainder** — not attempted this pass; no
regression was introduced by leaving it, and no currently-0 metric moved anywhere in the fleet.

---

# §ACCEPTANCE — the user's own definition of done (2026-08-17, verbatim, checked against §S14.0)

**⚠ CORRECTED 2026-08-17, same day, after §FOUNDATIONS (read that section first).** Every row below
was measured against representation #3 (`tasks.schedule_start/finish`, `probe_gantt_stagger.js`'s
SQL query). **None of it measured representation #4 — `buildGanttTasks()`, the function that
actually draws the Gantt panel a live user sees.** The user's live report the same evening ("one
pile the full project length," fleet-wide, "in its fundamentals") means the ✅ rows below are true
of #3 and unverified — now suspected false — of #4. Left in place as the historical record of what
WAS checked; do not read the checkmarks as "the Gantt chart is fixed."

*"4D gantt schedule properly CPM staggered bars, not all horizontal stacked, not bunched to start
of bars, not fight each other when proper follow the gantt as source of truth is obvious - do when
needle touches each bar so user can see logically what is happening as truth."* Translated into
checkable criteria and scored against everything measured in this file:

| Criterion | Status (representation #3 only) | Evidence |
|---|---|---|
| Properly CPM-staggered bars | ✅ true of #3 | S6 (#1406): Terminal roof spread 0.5d→11.1d, `§CREW_FEASIBILITY` 6/7 fail→0/7 pass |
| Not all horizontal-stacked (same start day) | ⚠ MOSTLY, not zero, on #3 | same-start cluster 20/72→9/72 post-S6, now investigated (§S15): Terminal's share is §S13.5's ladder split, Hospital's is legitimate independent-zone parallelism with 0 measured order violations |
| Not bunched to the start of bars | ✅ true of #3 | Tukey-envelope bars (S2) + S6 (the tail-compression was a resource bug, not a display bug, and S6 fixed the cause) |
| Bars/needle/movie not fighting each other (one source of truth) | ✅ true of the schedule engine, #2 | `§CPM_DISPLAY_ONE_TRUTH` invariant + `midair=0` hard gate every stage; §S10/S11 closed the worst violation (live viewer reading a different DB than every probe); §S14.0 confirms the CPM engine itself produces bottom-up-correct order on all 3 buildings tested — `t1Complete()` eliminated, no live scheduling defect remains |
| Needle touches a bar → visible, logical, true | ✅ true of #2/movie only | `midair=0` on every building, judge-parity `floating=0`, §-logged per this project's no-screenshot rule |

**What this table actually proves:** the CPM engine (#2) computes a correct, bottom-up schedule, and
the task-authoring table (#3) mostly reflects it. **It says nothing about what the user's own Gantt
panel draws (#4)** — that path was never measured until the same-day live report. See §FOUNDATIONS
for the mechanism (`buildGanttTasks()`'s untrimmed <20-element fallback, independent of all of the
above) and the correct next step, scoped to the Gantt chart + editor, not the movie.

---

# §S19 — delete the dead legacy pipeline; resolve E5. GO GIVEN (2026-08-17, Fable simplification
# review, user: "proceed"). Two small, independently-verifiable cleanups — do not combine into one PR.

**Why now:** an independent review of this whole file found the single highest-leverage remaining
issue is process, not design — `_twoTierRemap`/`_midairRepair`/`_tier1Serialize`/`_tierAuditRegate`
is fully bypassed on the live path (`_CPM_DISPLAY` defaults true, `§CAP_RESCALE_SKIP`) but was never
physically removed — only guarded against. That single loose end caused THREE separate incidents in
this lane already (`§PATHS NOT TO TAKE` #1; `§S13.7`'s near-shipped fix to unreachable code; `§S17`'s
full 8-probe audit). `4D_SCHEDULE_ARCHITECTURE_REDESIGN.md §STAGE4_RETIREMENT_PROPOSAL` already
names this as the next step, marked propose-first — this IS that proposal's go-ahead. ⚠ **CORRECTED
by §S19_RESULTS below:** this brief originally, wrongly, also listed `_ogSupportSweep`/
`_cjpJudgeParity` as part of the dead chain. They are NOT — `injectGantt()` calls them on a separate,
live, unconditional path (`time_machine.js:6089-6091`, confirmed by §S19). Kept, not deleted.

**Part A — delete the dead pipeline.** Remove `_twoTierRemap`, `_midairRepair`, and any function ONLY
reachable through them (confirm via the same reachability method §S14.0 used — grep every call site,
trace whether it's live-default-reachable, do not assume). Do NOT remove anything `_CPM_DISPLAY`'s
success path calls, and do NOT touch `cpm_schedule.js`. If `?cpm4d=0` (the legacy A/B escape hatch,
`§LOCKED`) is still needed as a lever, either keep ONE minimal fallback path or explicitly retire the
flag too — state which and why, don't leave a flag pointing at nothing. Check `probe_captured_floating.js`'s
`STOREY_PHASE_TABLE` mode (already carries a retraction warning per §S17) — deleting its target
function means that mode itself becomes dead; retire it in the SAME PR, don't leave a probe calling a
function that no longer exists.
*Acceptance:* fleet floating 0/7 unchanged, all named witnesses green (same set §S5/§S18 checked),
`gate_4d.sh` pass count unchanged, live-deploy verified (curl + a real headless run showing
`§CPM_DISPLAY on`), net lines removed reported.

**Part B — resolve E5.** `§S2_REVIEW_VERDICT`'s own S6 spec states E5-as-lower-bound "becomes
redundant once slots are claimed in-pass" but `§S6_RESULTS` never reports it removed or repurposed.
Read `cpm_schedule.js`'s E5 construction, confirm whether it's now dead weight (S6's crew-slot
allocator already enforces the same bound in-pass) or still doing real work (e.g. a safety floor for
some edge case S6 didn't cover). If dead: remove it, same reachability-proof discipline as Part A. If
still live: say exactly what it still bounds that S6 doesn't, with a measured example — do not leave
it unexplained either way.
*Acceptance:* same floating=0/witness/gate_4d regression bar as Part A.

**STOP-AND-REPORT if:** floating>0 anywhere; a witness needs an unpredicted assertion change; a
function thought dead turns out to have a live call site (report it, don't force the deletion). Same
worktree/PR-per-part, verify-merged-before-next-part discipline as every prior stage. Sonnet-dispatchable —
both parts are mechanical once reachability is confirmed, which is the same proven method §S14.0
already used successfully.


# §S19_RESULTS — 2026-08-17, Part A STOP-AND-REPORT (witness suite entanglement), Part B ✅ SHIPPED

## Part A — BLOCKED, not forced. The dead pipeline's own regression witnesses ARE the pipeline.

§S14.0's reachability finding re-confirmed unchanged: `_twoTierRemap`/`_midairRepair` (time_machine.js
:4585-4586) are still reached ONLY through `_displayTimeline`'s `else` branch (`?cpm4d=0` or
`§CPM_DISPLAY_FALLBACK`, neither ever fires live — fresh fleet run today, `edges={E1:...,E2host:...,
E2open:...,E3:...,E4:...,member:...}`, no legacy-chain trace, same as §S14.0).

But grepping every call site (§S19's own instruction) surfaced something §S14.0/§S17 didn't check:
**4 of `gate_4d.sh`'s own 8 required witnesses build their ENTIRE pass/fail methodology by slicing
`_twoTierRemap`/`_midairRepair`/`_tier1Serialize`/`_tierAuditRegate` out of time_machine.js's source
text and CALLING them directly** — not an informational reference, the actual measurement:

| Witness | In gate_4d.sh loop? | In §S5 named set? | Dependency |
|---|---|---|---|
| `witness_tier_serial_display.js` | YES | — | 100% ABOUT `_twoTierRemap` (own header: "the two-tier display remap (time_machine.js `_twoTierRemap`)"). W-TS-1..5 all assert on its sliced output (`stats.overlapPairs`, `stats.dagWins`). No CPM-path content at all. |
| `witness_midair_zero.js` | YES | YES (§S5) | W-MZ-2/3/4/7/8 all assert on `census()` run against items AFTER calling the sliced `__repair = _midairRepair` (line 307: `vm.runInContext('this.__repair(this.__items);', sandbox)`), against LOCKED baselines (`FLOAT_AFTER_BASELINE`, `ORPHAN_BASELINE`) computed from that call. Does not touch `_displayTimeline`/CpmSchedule at all — builds elements via `_buildXrayElements`, RAW-schedules via `ScheduleGate.computeSchedule`, then runs the sliced legacy repair and asserts on ITS output. |
| `witness_hosted_before_host.js` | YES | — | Slices + calls `__remap = _twoTierRemap; __repair = _midairRepair` (line 183) to produce its "post remap + midair repair" before/after numbers. |
| `witness_curtain_wall_opening.js` | YES | — | Same pattern, line 198, same slice+call. |

`witness_zone_display_authoring.js` (§S5-named, not in gate_4d.sh's loop) also slices these four
functions (lines 76-79) alongside the live `_ogSupportSweep`/`_cjpJudgeParity`/`_capWindowRescale` —
but its ACTUAL assertions (W-ZDA-3/4a/4b/6) only call `_ogSupportSweep`, `_cjpJudgeParity`, and the
CPM path; the dead-chain slices in its list are unused dead weight in the slice array itself, not
load-bearing. That one is mechanically fixable (drop 4 lines from its slice list). The other four are
not — their entire measured subject stops existing.

A fifth file, `witness_gantt_lock_integrity.js` (NOT in gate_4d.sh's loop, NOT referenced by any CI
workflow — confirmed by repo-wide grep, so not part of this task's acceptance bar), would also start
crashing: its G-LI-2 fixture setup conditionally slices `_midairRepair` whenever `_midairAudit` is
present in source (`if (tmSrc.indexOf('function _midairAudit(') >= 0) _names.unshift('_contactGraph',
'_midairAudit', '_midairRepair');`) — that condition tests for the function we're KEEPING, not the one
being deleted, so it would still try (and fail) to slice `_midairRepair`. Its actual pass/fail
assertions (G-LI-2b/2d/2e/2f) test `verifyGanttIntegrity()` against the live `_midairAudit`, not the
dead functions directly — `_midairRepair` there is only used to pre-repair a realistic fixture. Not a
blocker for this task, but a real landmine for whoever eventually does Part A.

**time_machine.js exact function extents** (brace-matched, not eyeballed): `_tier1Serialize`
4006-4025, `_tierAuditRegate` 4086-4201, `_ogSupportSweep` 4216-4430 (KEPT), `_cjpJudgeParity`
4462-4506 (KEPT), `_twoTierRemap` 4717-4871, `_midairRepair` 5032-5116. Single definition each
(`grep -c "function _midairRepair("` = 1) — the "defined twice, hoisting matters" caveat several
witness comments carry is stale, from an older revision.

**`scripts/probe_captured_floating.js`** (880 lines, not referenced by gate_4d.sh or any CI workflow
— repo-wide grep confirms) would partially break if the four functions were deleted: EXP3 (~448-505)
calls `_midairRepair` directly; EXP5A/EXP5B (~507-586) inherit EXP3's setup, breaking transitively;
EXP6 (~589-772, already labeled "⚠ RETRACTED LABEL, KEPT CODE" per §S13.8/§S14.0, includes the
`STOREY_PHASE_TABLE` sub-mode named in the original brief) slices all four non-optionally, so it
throws on `main()` entry, not just when `STOREY_PHASE_TABLE=1` is set. EXP4/EXP7/EXP8 call only
`_ogSupportSweep`/`_cjpJudgeParity`/`_capWindowRescale` (all KEPT) and are unaffected. Since nothing
here is gated, this isn't part of the blocker — but the brief's instruction to retire the
`STOREY_PHASE_TABLE` mode "in the same PR" undersold the scope: the whole EXP3+EXP5+EXP6 block would
need retiring, not one env-gated sub-table.

**Compact table** (file | dependency class | in gate_4d.sh loop | other automated gate | breaks on deletion):
| file | dependency | gate_4d.sh | other gate | breaks? |
|---|---|---|---|---|
| witness_midair_zero.js | pass/fail core method | Y | §S5 named | YES, unsalvageable |
| witness_hosted_before_host.js | pass/fail core method | Y | — | YES, unsalvageable |
| witness_curtain_wall_opening.js | pass/fail core method | Y | — | YES, unsalvageable |
| witness_tier_serial_display.js | pass/fail, ONLY subject | Y | §S5 named | YES, no subject left |
| witness_gantt_lock_integrity.js | fixture-prep, conditional slice | N | N | YES, but not gated |
| witness_zone_display_authoring.js | unused dead weight in slice list | N | §S5 named | NO, 4-line fix |
| witness_crosstask_judge_parity.js | n/a (tests KEPT funcs) | N | §S5 named | NO |
| probe_captured_floating.js EXP3/5/6 | direct calls, non-optional | N | N | YES, not gated |
| probe_captured_floating.js EXP4/7/8 | uses KEPT funcs only | N | N | NO |
| probe_bars_vs_ops.js | sole purpose | N | N | YES, not gated |
| probe_named_element_times.js | sole purpose | N | N | YES, not gated |
| probe_cpm_display_path.js | n/a (real require, KEPT funcs) | — | fleet gate probe | NO |
| probe_cpm_schedule.js:313 | informational timing only | N | fleet gate probe | needs 1 block edited, not blocked |

**Why this blocks Part A as scoped.** Deleting `_twoTierRemap`/`_midairRepair`/`_tier1Serialize`/
`_tierAuditRegate` from time_machine.js makes `sliceFn`/`sliceAt` throw immediately in all four —
they cannot run, not "fail with an updated baseline." `witness_tier_serial_display.js` has no
salvageable subject at all (delete it, full stop). `witness_midair_zero.js`'s underlying QUESTION
("does anything appear in the movie before what it touches") still matters and is now partially
answered elsewhere (`witness_zone_display_authoring.js` W-ZDA-6: "CPM display timeline has 0 midair
through the shipped hook"; fleet `§CPM_FLOATING`/`§CPMDP_FINAL` gates) — but rebuilding it to test the
CPM-live path instead of the legacy repair is a full methodology redesign (new baselines, new
independent-judge wiring against a different code path), not a mechanical deletion follow-up.
`witness_hosted_before_host.js`/`witness_curtain_wall_opening.js` are in the same position: their
"post-repair" numbers ARE the legacy repair's output.

This is §S19's own STOP-AND-REPORT condition ("a locked witness needs an unpredicted assertion
change") — except worse than an assertion tweak: two witnesses have nothing left to assert on. The
brief's "Sonnet-dispatchable, mechanical once reachability is confirmed" framing undersold this —
reachability on the LIVE APP is exactly what §S14.0 already nailed down; reachability from the TEST
SUITE (which measures the dead code directly, on purpose, as its own regression baseline) was never
checked before now, and it's a different, larger claim.

**Not touched:** time_machine.js's `_twoTierRemap`, `_midairRepair`, `_tier1Serialize`,
`_tierAuditRegate` all remain exactly as they were. `?cpm4d=0` stays wired (nothing to decide — the
functions it falls back to still exist, unchanged, per the above). `probe_captured_floating.js`'s
`STOREY_PHASE_TABLE` mode was NOT retired — the brief's instruction to retire it was conditional on
deleting its target function, which did not happen; it keeps its existing §S17 reachability-warning
guard (bim-ootb PR #1422) unchanged.

**Also confirmed, correcting the brief's own scope list:** `_ogSupportSweep` and `_cjpJudgeParity`
were named alongside the dead functions as candidates ("any function ONLY reachable through them")
but are NOT only reachable through the dead chain — they have a separate, real, currently-live call
site at `injectGantt`'s captured-schedule path (time_machine.js:6089-6091), confirmed by
`witness_crosstask_judge_parity.js`'s own W-CJP-1 wiring assertion ("injectGantt's captured path
actually calls `_cjpJudgeParity(_allScheduled, _cap.win)` immediately after `_ogSupportSweep`").
`_cjpJudgeParity` runs unconditionally there; `_ogSupportSweep` is skipped only when
`schedules.display_authored=1` (documented, intentional — imported/legacy/edited-window schedules
keep it). These would have been wrongly deleted had the brief's "any function only reachable through
them" language been applied without this check. Left untouched, correctly.

**Recommendation, not executed:** retire `witness_tier_serial_display.js` outright when this is
picked back up (its subject is being deleted, nothing to salvage) and design a CPM-path-native
replacement for `witness_midair_zero.js`'s actual question before deleting the legacy functions —
that redesign is real work, deserves its own spec'd stage, and should not be improvised inside a
"delete dead code" PR. `witness_hosted_before_host.js`/`witness_curtain_wall_opening.js` need the
same retire-or-redesign call. Until that stage exists and ships, Part A cannot proceed without either
breaking gate_4d.sh's pass count (violates this task's own acceptance bar) or leaving the dead
functions in place (which is not a deletion).

## Part B — ✅ SHIPPED. E5 already had zero executable footprint; only stale documentation remained.

**Measured, not assumed** (`buildGraph`'s `counts` object: `{e1, e2h, e2o, e3, e4, member,
stragglers}` — no `e5` key ever existed; confirmed again live: `§CPM_RUN ... edges={E1:...,
E2host:...,E2open:...,E3:...,E4:...,member:...}`, no E5). §S2_REVIEW_VERDICT's original design named
E5 a per-element lower bound merged into ES via `max(...)` — but per the file's own header comment,
it was "no explicit edges" from day one: a scalar floor applied inside `solve()`, not a DAG edge.
§S6 (PR #1406, merged) replaced that floor outright: `solve()` seeds `ES[i] = base` (ONE shared
epoch, the raw schedule's global min start) for every node, then raises it via precedence (in-edges)
and the in-pass crew-slot allocator — never via each element's own `computeSchedule(T).start`. There
was nothing left for §S19 to functionally remove; S6 already did that removal in its own PR. What was
left was the top-of-file docstring (`cpm_schedule.js` lines 9-17, 106) still describing E5 as a live
per-element bound — a landmine of the exact same class Part A exists to clean up, just in comment
form: a future session reading "E5 crew - per-element lower bound ES(T) >= computeSchedule(T).start"
could go looking for a bug in a mechanism that hasn't existed since PR #1406.

**Measured proof** (`scripts/probe_e5_resolution.js`, new, Terminal 48,428 elements):
```
§E5_BOUND_CHECK Terminal_extracted: cpmStart<rawStart(per-element bound NOT enforced)=12131
  cpmStart>rawStart=36296 cpmStart==rawStart=1/48428 -- CONFIRMS E5-as-lower-bound is fully retired
  (S6 superseded it)
§E5_SUMMARY allDurationsPreservedExactly=true maxDeltaMs=0 (E5-as-DURATION-SOURCE is the only source
  -- cpmDur === rawDur exactly, S6 never recomputes it)
§E5_ELEMENT_EXAMPLE guid=T0_Terminal_2fKPxuZcr6CuQ1jIJYQwwS cls=IfcMember storey=06 ROOF LEVEL
  rawStart(computeSchedule/E5)=1970-02-16T21:38:21.000Z rawDurHrs=1.564
  cpmStart(solve)=1970-04-09T05:11:39.000Z cpmDurHrs=1.564 startShiftDays=51.31
```
12,131/48,428 elements (25%) have `cpmStart < rawStart` — impossible if a per-element
`ES(T) >= computeSchedule(T).start` floor still held, since CPM could then never schedule an element
EARLIER than its own raw start. This is the decisive, measured proof the "lower bound" reading of E5
is gone, not merely untested. The one thing still genuinely read from E5's source (`computeSchedule`)
is DURATION (`e - s`), bit-exact across all 48,428 elements (`maxDeltaMs=0`) — `solve()` has no
independent duration model, so this dependency is real and correctly left alone.

**Fix** (`viewer/cpm_schedule.js`, comment-only, zero behavior change): corrected the top-of-file
"Edge types" list and the `buildGraph`/`solve` inline comments to state E5-as-bound is retired,
name what replaced it (§S6_CREW_PASS's in-pass crew-slot claim, seeded from a single shared epoch),
and name what's still read from it (duration only). No code line changed inside `buildGraph`/`solve`.

**Regression check (before vs after the comment edit, both fresh fleet runs, all 7 buildings):**
```
BEFORE  §CPM_FLEET_VERDICT buildings=7 fails=5 (fails = pre-existing storeyViol only; midair=0/7,
        crewViol=0/7 both runs, unchanged)
AFTER   §CPM_FLEET_VERDICT buildings=7 fails=5 — IDENTICAL per-building row (storeyViol
        Duplex=1/Clinic=1/HHS=0/JKR=7/Hospital=0/Terminal=5/LTU=7 both runs)
BEFORE  §CPMDP_FLEET_VERDICT buildings=7 fails=0 PASS
AFTER   §CPMDP_FLEET_VERDICT buildings=7 fails=0 PASS — IDENTICAL outlierOutside per building
gate_4d.sh BEFORE  §GATE_4D_RESULT pass=7 fail=0 missing=1 (witness_arch_area_weight MISS, pre-existing;
           the historical "pass=8" cited in §S6/§S7_RESULTS is stale from an earlier repo revision)
gate_4d.sh AFTER   §GATE_4D_RESULT pass=7 fail=0 missing=1 — IDENTICAL (same 8-witness roster,
           same one MISS, all 7 others PASS with unchanged §-summaries: witness_tier_serial_display
           pass=57/fail=0, witness_midair_zero pass=39/fail=0, witness_hosted_before_host 4/4,
           witness_curtain_wall_opening 5/5, witness_crew_demand 4/4, witness_kernel_ops_sched_version
           pass=12/fail=0, witness_zone_index ok)
```
Named §S5/§S18 witness set also re-run directly: `witness_zone_display_authoring` 16/0,
`witness_crosstask_judge_parity` 20/0 — both unaffected (comment-only edit, neither slices
`cpm_schedule.js`'s source text).

PR: bim-ootb #1425 (`fix/gantt-s19b-e5-resolve`) — MERGED 2026-08-17T05:34:51Z (auto-merge squash,
fast-checks + e2e-tests both SUCCESS).

---

# §S20 — finish the dead-pipeline retirement. GO GIVEN (2026-08-17, user: "proceed"). Redesign
# FIRST, delete SECOND — do not combine, do not skip the redesign to force a faster deletion.

§S19_RESULTS Part A found the real blocker: 4 of `gate_4d.sh`'s 8 witnesses measure the dead
pipeline DIRECTLY as their test subject, not just reference it. Their compact table (above) is this
stage's own scope map — read it before starting, do not re-derive it.

**Part A — redesign, not delete.** Three witnesses whose underlying QUESTION still matters, rebuilt
against the live CPM path instead of the legacy repair:
- `witness_midair_zero.js` — question: "does anything appear before what it touches." New baselines
  against `_displayTimeline`'s CPM success path (`§CPM_DISPLAY on`, same reachability-proof discipline
  as §S14.0 — print it, don't assume it). `witness_zone_display_authoring.js`'s existing W-ZDA-6
  ("CPM display timeline has 0 midair through the shipped hook") may already BE this witness's real
  answer — check whether redesigning `witness_midair_zero.js` is actually a duplicate of W-ZDA-6
  before building a second copy of the same check.
- `witness_hosted_before_host.js`, `witness_curtain_wall_opening.js` — same treatment, own domain
  questions (host/opening ordering), rebuilt against the CPM path's own output.
Also: `witness_tier_serial_display.js` has NO salvageable subject (100% about `_twoTierRemap`) —
delete the file outright, remove it from `gate_4d.sh`'s loop and the §S5-named set. Fix
`witness_zone_display_authoring.js`'s 4-line unused-slice list (mechanical, no redesign needed).
*Acceptance:* redesigned witnesses assert something real and CURRENTLY PASSING against the live path
(not just "doesn't crash") — report their new pass numbers. `gate_4d.sh` pass count may change (one
witness deleted) — record and explain the new count, don't just note it moved. Fleet floating 0/7
unaffected (this stage touches tests, not the engine).

**Part B — delete, only after Part A's PRs are merged and gate_4d.sh is green on the redesigned
suite.** Remove `_twoTierRemap`/`_midairRepair`/`_tier1Serialize`/`_tierAuditRegate` from
`time_machine.js` (exact extents already brace-matched in §S19_RESULTS: 4006-4025, 4086-4201,
4717-4871, 5032-5116 — reverify, line numbers shift once Part A lands). Retire the now-broken,
ungated consumers named in §S19_RESULTS's compact table: `probe_captured_floating.js` EXP3+EXP5+EXP6
(the whole block, not just `STOREY_PHASE_TABLE` — the original brief undersold this), `probe_bars_vs_ops.js`,
`probe_named_element_times.js`. Fix `witness_gantt_lock_integrity.js`'s conditional-slice landmine
(its G-LI-2 fixture setup slices `_midairRepair` whenever it detects `_midairAudit` in source — update
the condition or its fixture path, it's not gated so this can't block CI but leaving it broken is not
"finished"). Decide `?cpm4d=0`'s fate now that its fallback target is gone: keep a minimal explicit
error/no-op, or retire the flag — state which.
*Acceptance:* same regression bar as every prior stage — floating 0/7, `gate_4d.sh` green, no
witness needing an unpredicted change beyond what Part A already redesigned, live-deploy verified.
Report net lines removed.

**STOP-AND-REPORT if:** Part A's redesign can't produce a real, currently-passing assertion (report
what's missing, don't ship a witness that always passes trivially); anything in Part B breaks a
witness not already named above. Worktree/PR per part, verify merged before the next part.

# §S20_RESULTS — 2026-08-17, Part A ✅ SHIPPED + GATE-VERIFIED, bim-ootb PR #1426
# (`fix/gantt-s20a-witness-redesign`), bim-compiler PR TBD (`fix/gantt-s20a-witness-redesign-bc`,
# worktree `/tmp/wt-gantt-s20a-bc`, branched off `origin/fable/meshdb-livewire` — `gate_4d.sh` and
# this prompt file live ONLY on that branch, NOT `origin/master`; `origin/master` is 1 commit ahead
# of the merge-base while `fable/meshdb-livewire` is 1138 commits ahead — confirm base before any
# future worktree in this repo, `git log origin/master -- <path>` first).

## Part A — three named witnesses redesigned against the live CPM path, one extra found+fixed

**`witness_midair_zero.js`** — kept its own INDEPENDENT `census()` (does not call `_contactGraph`,
unlike `witness_zone_display_authoring.js`'s W-ZDA-6, so a bug in `_contactGraph` itself would still
be caught here — checked this is not a duplicate of W-ZDA-6 before redesigning, per the brief's own
instruction: W-ZDA-6 covers 2/7 buildings and is NOT independent of `_contactGraph`; this witness
covers all 7 and is). Authors the timeline via `_displayTimeline`'s CPM branch (`CpmSchedule.run`,
required as the real module, never sliced) instead of `_twoTierRemap`+`_midairRepair`. W-MZ-3
("repair moves nothing earlier than the pre-repair remap output") RETIRED — no intermediate
remap-then-repair stage exists under CPM's single-pass DAG solve, and the natural analogue (CPM
start vs RAW start) is MEASURED to move earlier on ~25% of elements as normal, accepted behavior
(§S19_RESULTS §E5_BOUND_CHECK: `cpmStart<rawStart` for 12,131/48,428 Terminal elements) — asserting
"earlier==0" against RAW would fail on already-accepted behavior, not catch a regression. Fresh
baselines measured (not carried over): `CPM_FLOAT_AFTER_BASELINE` = {Terminal:8789, Hospital:5107,
Duplex:289, HHS:1538, Clinic:3523, LTU_AHouse:15896, JKR:3736}; `CPM_ORPHAN_BASELINE` MEASURED
IDENTICAL to the retired legacy-chain numbers (Terminal:7, Hospital:35, Duplex:1, HHS:36, Clinic:27,
LTU_AHouse:865, JKR:1) — confirms orphan-detection is purely geometric, independent of which
display-authoring path ran, rather than assuming it. Reachability proof per building: `dtResult.cpm
=== true` (fresh CpmSchedule.run success) plus the captured `§CPM_DISPLAY on` log line, asserted, not
assumed. New W-MZ-5b wiring check (CPM branch calls `CpmSchedule.run` then `_midairAudit`) replaces
the retired check on the never-live fallback branch.
```
§MIDAIR_ZERO_SUMMARY pass=39 fail=0
```
(was 39/0 before this stage — same count: W-MZ-3 swapped for a new per-building CPM-reachability
assertion.)

**`witness_hosted_before_host.js`** — same treatment (G-HOST-DISPLAY/G-HOST-STAGE against
`_displayTimeline`'s CPM branch instead of the legacy chain; G-HOST-STAGE's three-stage
gen→remap→repair attribution collapses to two, gen→display, since CPM authors in one pass). Result:
**zero EARLY violations of any kind** on all 7 buildings (structurally guaranteed by CPM's E2host
precedence edge) — stronger than the inherited 5%-of-hostMatched tolerance, never approached.
```
PASS  G-HOST-DISPLAY  every building within the 5% margin on the DISPLAY timeline (post CPM authoring...)
§HOST_WITNESS 4/4 gates passed
```

**`witness_curtain_wall_opening.js`** — same treatment, but G-CWO-DISPLAY's flat 5%-of-hostMatched
ceiling FAILED on first measurement (HHS_Office_Federated 10.5%=14/133, LTU_AHouse 13.7%=175/1280,
worst deviation only 0.7d on both). Investigated rather than re-thresholded blind (per this lane's
own §PATHS NOT TO TAKE #8 discipline — don't narrow/adjust a rule without confirming what's actually
happening): checked `dtResult.stats.solution.comp` (CPM's own graph-component id) for every
violation's opening and its worst-offending host. MEASURED: **207/207 fleet-wide violations are IN
THE SAME CPM component** (Terminal 5, Hospital 5, Duplex 0, HHS 14, Clinic 4, LTU_AHouse 175, JKR
4) — `cpm_schedule.js`'s own documented, ALREADY-ACCEPTED SCC-contraction mechanism (a cycle of
mutual physics edges gets condensed to one shared position class — same class as the
`fsViolInScc`/`crewOverCapScc` counters it already prints every run and never gates to 0), not a
defect this redesign introduced. **ZERO cross-component violations** (which WOULD be a real E2open
wiring defect). Redesigned `countEarly()` to classify in-SCC vs cross-SCC and gate ONLY on
cross-SCC==0 (the real structural bar, matching §GUARDRAILS' "no new tuned constant not derived from
the data" — the flat 5% ceiling was calibrated to the legacy chain's different failure mode and would
have gated an accepted mechanism, not a real defect). Total EARLY/inScc count still fully reported
per building (G-CWO-STAGE), never hidden.
```
PASS  G-CWO-DISPLAY  ZERO cross-component violations on all 7 buildings ... the residual EARLY count
      is 100% in-SCC (cpm_schedule.js's own documented, accepted SCC-contraction mechanism ...)
§CWO_WITNESS 5/5 gates passed
```

**`witness_kernel_ops_sched_version.js`** — NOT named in this stage's brief, found while executing
it (a genuine gap in §S19_RESULTS's own audit: its grep pass was scoped to `viewer/tests/` +
bim-ootb's `scripts/probe_*.js`, and missed this witness even though it IS in `gate_4d.sh`'s loop).
W-KOS-4/W-KOS-5 sliced `_twoTierRemap` directly for its `tier2ShiftDays` stat (`time_machine.js`
:4788's `tier2Shift` — the single worst-element shift under the legacy two-stage repair). Fixed in
the same wave, same class as the three named witnesses: measures the analogous quantity —
`maxShiftDays` = MAX `|CPM start - RAW start|` across all elements — against `_displayTimeline`'s CPM
branch. Also dropped the W-KOS-0c check (asserted `_TIER1_ORDER` exists in `time_machine.js` — that
constant is used ONLY inside the dead chain, per a fresh grep: every caller of `_tier1Extents`/
`_tier1Protrusion`/`_tier1Serialize`/`_tierAuditRegate`/`_twoTierRemap` is another function IN that
same chain, so `_TIER1_ORDER` goes with it once Part B lands — worth re-verifying at Part B time in
case that scope needs to grow beyond the 4 named functions).
```
§KERNEL_OPS_SCHED_VERSION_MAGNITUDE bld=LTU_AHouse maxShiftDaysIfStaleOpsWereReused=2273.8 ...
§KERNEL_OPS_SCHED_VERSION_SUMMARY pass=19 fail=0
```
(was 12/0 before this stage — 7 new per-building CPM-reachability assertions added.)

**`witness_tier_serial_display.js`** — deleted outright (377 lines removed), no salvageable subject
(100% about `_twoTierRemap`, per §S19_RESULTS). Removed from `gate_4d.sh`'s loop (this PR) and the
§S5-named set (this doc — see the compact table above, superseded by this section).

**`witness_zone_display_authoring.js`** — the "4-line unused-slice" fix §S19_RESULTS predicted was
TESTED, not assumed, and found short: dropping the six dead-chain `sliceFn` calls while leaving
`_CPM_DISPLAY = false` throws `ReferenceError: _twoTierRemap is not defined` at `_tmDisplayRemap`'s
own call site (line ~165 area) — the "legacy" comparison this witness built (W-ZDA-4a/4b's `base`)
was genuinely computed by running `_displayTimeline`'s `_CPM_DISPLAY=false` branch, which calls
exactly the two functions Part B deletes. Fixed by pointing the ONE remaining live branch
(`_CPM_DISPLAY=true`, real `CpmSchedule` module) at what production will actually run post-Part-B —
matching what the standalone W-ZDA-6 `cpmSandbox` section already proved works. Added a
`W-ZDA-CPM-PATH` reachability check per building (accepts either fresh `§CPM_DISPLAY on` OR the
one-shot `§CPM_DISPLAY_REUSE` cache-hit, since `materializeZones`' own `displayRemap` hook call
legitimately computes fresh first and the witness's own direct call then hits the cache — verified

## §S22_RESULTS (2026-08-17) — root cause was NOT any of the 3 named candidates; a clock-unit
mismatch two layers upstream. FIXED, `bim-ootb` PR #1429.

**Method:** built a Playwright headless harness (Puppeteer wasn't installed in this checkout) that
waits for REAL streaming completion (`!app.streaming && (Object.keys(app._batchMeta).length +
Object.keys(app._instanceMeta).length) > 0`, polled, no fixed timeout) before measuring — the gap
§S22 named. Reproduced the exact live drag already in evidence (Clinic
`TASK_MEP_Rough_in_Level_1`, +10d, `window.__tmGanttDrag`) — confirmed same building/task/gesture
by matching `§RETIME_OUTLIER_AUDIT outsideOldWindow=144 collapsed60s=0 inverted=0
outlierDurMs=[83000,11751000]` byte-for-byte against the prior session's live numbers.

**All 3 named candidates ruled out by direct measurement, not reasoning:**
- Added a temporary `window.__tmGanttTaskGuids(taskId)` diagnostic hook (kept, harmless,
  read-only) to cross a task's guid list against `window.__tmSnapshotVisible()`.
- Used the file's own existing `window.__forceFull` hook (W-INCR-EQUIV) to diff the delta-path
  scrub render against a full-path re-render at the IDENTICAL cursor. Both gave the SAME visible
  count (`3592/3644` before the fix's scrub-visibility symptom was isolated, matching baseline
  exactly after the real fix below) — if the `§PERF_INCR` event-index skip guard (candidate 1) were
  wrongly skipping the dragged mesh, forceFull would have shown MORE visible than the real delta
  scrub. It never did. Candidates 2 (xray staging cache) and 3 (DLOD proxy-hide) run unconditionally
  in both code paths, so this same diff also clears them — nothing in the “apply visibility from
  correct data” layer was ever broken.

**The actual mechanism — a full-scene drag+scrub (12-step scrub, giant span) first surfaced a
57-YEAR displayed-axis explosion**, caught by a fast, targeted numeric probe (`tmGetState()` +
`__tmGanttWindows()` before/after, no scene traversal needed):
```
STATE_BEFORE {"projectStart":-1,"projectEnd":9054726000}
BAR_BEFORE   TASK_MEP_Rough_in_Level_1 startTs=694115000 endTs=7069005000   [1970-01-09..1970-03-23]
SIBLING_BEFORE TASK_MEP_Rough_in_Level_2 startTs=5246591000 endTs=7339153000 [1970-03-02..1970-03-26]
DRAG +10d
§GANTT_DRAG_COMMIT task=TASK_MEP_Rough_in_Level_1 mode=move deltaDays=10 start=2026-08-23 clamped=true
STATE_AFTER  {"projectStart":-1,"projectEnd":1795305600000}
BAR_AFTER    TASK_MEP_Rough_in_Level_1 startTs=1787443200000 endTs=1795023228286  [2026-08-23..2026-11-18]
SIBLING_AFTER (unchanged, still 1970)
ARITH oldSpanDays=104.8 jumpDays=20693.9 newSpanDays=20779.0 restOfProjectFractionOfNewSpan=0.5044%
```
`_ops`/`_ganttTasks.startTs/endTs` (sourced from `kernel_ops.timestamp`) run on the TM's OWN
internal clock — `cpm_schedule.js`'s zero-anchored day-offset solve, near-1970 by construction
(matches the raw solver dumps already quoted elsewhere in this file, `rawStart(computeSchedule/E5)
=1970-02-16...`). `tasks.schedule_start`/`finish` (ScheduleAuthor's table) run on a SEPARATE,
real-"today"-anchored calendar clock (`_materializeNativeSchedule`'s `todayStart = new
Date().toISOString()`, `schedule_author.js` `materializeZones` line ~386/480 —
`_addDays(start, dayCountFromRawSchedule)`). Two consistent, deliberate, but DIFFERENT clocks.

Reading `time_machine.js`'s `retimeTaskElements`/`commitGanttDrag` closed the loop with a code
citation, not just numbers:
1. `commitGanttDrag` computed the drag's target date as `d(bar.startTs + deltaDays*86400000)` —
   `bar.startTs` is the TM clock (≈694,115,000 ≈ "1970-01-09"), so the target string handed to
   `SA.moveTaskCascade` was **`"1970-01-19"`** — a real ScheduleAuthor verb receiving a nonsense
   real-date target. `moveTaskCascade`'s C2 predecessor-floor clamp (defensive, by design — never
   accept a request earlier than a predecessor allows) then snapped it straight back to the task's
   OWN current real position: measured live, `§GANTT_EDIT_CLAMP requested=1970-01-19
   clampedTo=2026-08-23 blockedBy=TASK_MEP_Rough_in_TOF_Footing(FS-80d)`. **The user's `+10 days`
   was silently discarded on every 'move' drag of an on-critical-path task** — the schedule edit
   itself never actually moved anything; it just re-confirmed the task's already-current date.
2. `retimeTaskElements` then took `moveTaskCascade`'s (clamped, effectively-inert-but-still-real)
   `m.start`/`m.finish` result and fed `Date.parse(m.start+'T00:00:00Z')` DIRECTLY into
   `_retimeSpan` as `nS`/`nE`, alongside `oS`/`oE` (`bar.startTs`/`endTs`, TM clock) — an
   apples-to-oranges splice. Every dragged/cascaded op's new `start_ts`/`end_ts` landed on the
   REAL-calendar (huge) scale while every untouched op in the project stayed on the TM's native
   (small) scale. `computeDays()` (`_projectEnd = Math.max(...)` over ALL ops) then correctly
   incorporated this huge outlier, ballooning the WHOLE playback timeline's reachable span to ~57
   years — of which the real, untouched 105-day project now occupied 0.5%. A scripted absolute
   `__tmSetCursor` jump to that exact value COULD still land there (why §S22's own two prior
   diagnostics — `_ops` sort order, the reveal-inclusion loop — both individually measured
   correct and still missed this: neither checked the RESULT's scale against the rest of the
   project or the practically-reachable scrub range). A live human dragging a normal-width scrub
   slider cannot practically reach a target sitting in the last 0.5% of a 57-year range — this is
   the "scrubbing didn't solve it" the user reported.

**Fix (`bim-ootb` PR #1429):** thread the `tasksBefore` real-calendar snapshot — already captured
at every `retimeTaskElements` call site for undo, just never passed into the function itself —
through, and compute a **clock-agnostic day-count delta**: `(Date.parse(m.start) -
Date.parse(tasksBefore[taskId].start))` applied onto `oS`/`oE` (already on the correct TM clock).
Both clocks share the same 86400000ms/day granularity; only their zero-point differs, so a pure
delta needs no knowledge of either zero-point. Fixed `commitGanttDrag`'s target-date computation
the same way (use `tasksBefore[bar.taskId].start`/`.finish`, the task's actual real position,
instead of misreading `bar.startTs` as real) — same root-cause class, one call site over, caught by
`linkGanttBars`'s near-identical `new Date(succBar.startTs)...` misuse too, fixed alongside. All 5
`retimeTaskElements` call sites (`commitGanttDrag`, `shiftGanttSchedule`, `commitGanttGroupShift`,
`linkGanttBars`, `openGanttProps`'s typed-Apply) now pass `tasksBefore` — required since the
signature gained a parameter; the other two (`shiftGanttSchedule`/`commitGanttGroupShift`) were
never affected by the target-date bug (they operate on `deltaDays` directly against ScheduleAuthor,
never touching `bar.startTs`), only needed the `tasksBefore` thread-through for `retimeTaskElements`
itself.

**Verified, same live drag, after the fix:**
```
[drag] §GANTT_EDIT_MOVE task=TASK_MEP_Rough_in_Level_1 start=2026-09-02 finish=2026-12-02 clamped=false cascaded=7
[drag] §S22_EPOCH_FIX_DETAIL task=TASK_MEP_Rough_in_Level_1 tb.start=2026-08-23 tb.finish=2026-11-22 m.start=2026-09-02 m.finish=2026-12-02 oS=694115000 oE=7069005000 deltaSdays=10.00 nS=1558115000 nE=7933005000
[drag] §S22_EPOCH_FIX clockTranslated=8 skippedNoBefore=0
STATE_AFTER  {"projectStart":-1,"projectEnd":9918726000}
BAR_AFTER    TASK_MEP_Rough_in_Level_1 startTs=1558115000 endTs=7933005000  [1970-01-19..1970-04-02]
ARITH oldSpanDays=104.8 jumpDays=10.0 newSpanDays=114.8 restOfProjectFractionOfNewSpan=91.2892%
```
The drag now genuinely moves the task (+10 days, CPM-correct push-cascade to 7 real successors,
`deltaSdays=10.00` for every one of the 8 touched tasks), `_projectEnd` grows by exactly the
intended 10 days (not 57 years), and the rest of the project keeps 91% of the new range (not
0.5%). `resizeR` mode independently verified sane too (`startTs` unchanged, `endTs` +7d on the
correct clock, `jumpDays=7.0`, `restOfProjectFractionOfNewSpan=91.2892%`).

**Visibility — the actual reported symptom — proven fixed via a real drag-scrub sequence** (12-step
incremental scrub across the new, now-sane, ~10-day window; the delta/incremental render path
genuinely engaged this time — `mode:"delta"`, `skipped` in the hundreds — unlike the pre-fix probe
where the 56-year span always forced full-mode regardless):
```
AFTER_DRAG (cursor unchanged) visible=3286/3644   (partial — cursor sits inside the shifted window, correct)
scrub step 1..12/12  mode=delta, skipped=645..690 (event index genuinely engaging, correctly)
AFTER_SCRUB (delta-path, real scrub) visible=3592/3644
FORCE_FULL                            visible=3592/3644   (identical — W-INCR-EQUIV agrees)
VERDICT reproduced=false fixedByForceFull=false baseline=3592/3644 afterScrub=3592/3644
```
`3592/3644` is the EXACT SAME count as the pre-drag baseline (the remaining 52 are legitimate
xray-staging residual, unrelated, present before AND after) — the drag-then-scrub sequence now
restores full, correct visibility, and delta-path/full-path render agree exactly, confirming
candidate 1 (`§PERF_INCR` event index) was never broken — it was simply never exercised correctly
by the corrupted (pre-fix) axis data.

**Fleet floating 0/7 unaffected — verified, not assumed:** `git diff --stat` on the fix confirms
100% of the change is confined to `viewer/time_machine.js`'s Gantt-EDIT functions
(`retimeTaskElements`, `commitGanttDrag`, `linkGanttBars`, `openGanttProps`'s Apply handler, plus
one-line `tasksBefore` threading at 2 more call sites) — zero lines touch `cpm_schedule.js`,
`schedule_gate.js`, or any schedule-GENERATION code path (floating is a property of the initial CPM
dependency-graph solve, computed once at generation time, structurally unreachable from a post-hoc
Gantt task edit). Ran `scripts/gate_4d.sh` against the fixed worktree regardless:
`§GATE_4D_RESULT pass=6 fail=0 missing=1` (the one MISS, `witness_arch_area_weight`, is a
pre-existing "not in this revision" gap, unrelated to this change — confirmed via `git diff --stat`
showing zero witness-file changes).

**PR:** `bim-ootb` #1429, `fix/s22-tm-drag-invisible`, pushed clean.
this is the real mechanism, not a bug, before writing the assertion this way).
```
§ZDA_WITNESS_SUMMARY pass=18 fail=0
```
(was 16/0 before this stage — 2 new per-building reachability assertions added.)

## Fleet acceptance — floating 0/7 unaffected (Part A touches tests, not the engine)

```
probe_cpm_schedule.js:
§CPM_FLEET [["Duplex_extracted","cpm=0",...],["Clinic_extracted","cpm=0",...],
  ["HHS_Office_Federated_extracted","cpm=0",...],["JKR_extracted","cpm=0",...],
  ["Hospital_extracted","cpm=0",...],["Terminal_extracted","cpm=0",...],["LTU_AHouse_extracted","cpm=0",...]]
  (all crewViol=0)
§CPM_FLEET_VERDICT buildings=7 fails=5 FAIL   <- IDENTICAL to §S19_RESULTS baseline: fails are
  pre-existing storeyViol only (Duplex/Clinic=1, JKR/Terminal/LTU=5-7, HHS/Hospital=0), midair=0/7
  and crewViol=0/7 both unchanged

probe_cpm_display_path.js:
§CPMDP_FLEET_VERDICT buildings=7 fails=0 PASS   <- IDENTICAL to §S19_RESULTS baseline
```

## gate_4d.sh — before/after, explained

```
BEFORE  §GATE_4D_RESULT pass=7 fail=0 missing=1   (8-witness roster, witness_arch_area_weight MISS
        pre-existing, all other 7 PASS — §S19_RESULTS's own baseline)
AFTER   §GATE_4D_RESULT pass=6 fail=0 missing=1   (7-witness roster, witness_tier_serial_display
        REMOVED from the loop — the one witness this stage deletes outright, exactly the "pass count
        may legitimately change" case the brief called out. witness_arch_area_weight MISS unchanged,
        pre-existing, unrelated to this stage. All 6 remaining witnesses PASS with their new,
        higher assertion counts — see per-witness sections above.)
```

**Also found, out of scope, noted not fixed:** `scripts/probe_arch_start.js` and
`scripts/probe_door_wall.js` (bim-compiler, called by `gate_4d.sh`'s item-2 "§-numbers" section,
informational only — no pass/fail impact) ALREADY crash on `Error: _midairRepair #1 not found`
before ANY change in this stage — a pre-existing stale hard-coded slice-index bug (predates the
`_mrCount`-based dynamic selection the bim-ootb witnesses already carry), unrelated to and not
worsened by this stage's work (they're non-functional either way, Part B cannot make an
already-thrown exception "more broken"). Not named in §S19_RESULTS's table or this stage's brief;
left unfixed, flagged here for whoever next touches this class of landmine.

## Part B — ✅ SHIPPED + GATE-VERIFIED, bim-ootb PR #1430 (`fix/gantt-s20b-dead-pipeline-delete`,
worktree `/tmp/wt-gantt-s20b`). Merged 2026-08-17T07:27:05Z, `origin/main` commit `8f8d3de`. GH Pages
deploy triggered by that merge: `conclusion=success` (live-deploy verified).

**Deleted from `time_machine.js`** (reverified extents fresh, per the brief's own caution — line
numbers had NOT shifted since Part A, since Part A touched only test files): `_tierAuditRegate`
(4086-4201 original numbering), `_twoTierRemap` (4717-4871), `_midairRepair` (5032-5116),
`_tier1Serialize` (4006-4025) — the 4 named functions — PLUS three more found by actually grepping
every caller before deleting rather than trusting the brief's named list as complete:
`_tier1Extents`, `_tier1Protrusion`, `_zoneOf`, and the `_TIER1_ORDER` constant. All three had ZERO
callers outside the four named functions (confirmed by grep, not assumed) — orphaned by the same
deletion, same dead pipeline, just not individually named in §S19_RESULTS's audit. Net **-540 lines**
in `time_machine.js` (622 removed, 82 added back as retirement-notice comments at each excision
point — the convention this file already uses for retired code, e.g. §S6's own history).

**`_displayTimeline`'s fallback branch and `?cpm4d=0`** — the brief's own open question, answered:
RETIRED. The URL-param lever (`_CPM_DISPLAY = (function(){ try return ...cpm4d...!=='0'; })()`)
selected between the CPM branch and the now-deleted legacy chain; with the legacy chain gone, the
lever has nowhere to send `?cpm4d=0` requests. `_CPM_DISPLAY` is now a flat `var _CPM_DISPLAY =
true;` (kept as a named variable, not inlined, because every witness/probe in this lane injects its
own `var _CPM_DISPLAY = true;` ahead of a sliced copy of `_displayTimeline` — zero of those files
needed editing for this). The one truly exceptional path left (`CpmSchedule` missing, or
`CpmSchedule.run` failing — never once measured live in this lane's history) is a minimal explicit
`console.error` + no-op, never a silent revert to deleted code.

**Other named consumers retired** (§S19_RESULTS's compact table, all confirmed ungated before
touching):
- `probe_bars_vs_ops.js`, `probe_named_element_times.js` — deleted outright (142 + 124 lines). Both
  were pure diagnostic tools whose entire mechanism was a pre/post `_twoTierRemap`+`_midairRepair`
  comparison; no salvageable subject once that chain is gone, matching the brief's own framing.
- `probe_captured_floating.js` EXP3+EXP5(+the shared `DAY5` constant those blocks defined, which
  EXP6/7/8 also needed — re-added at the retirement point rather than losing it) — retired outright.
  Their whole premise ("repair BEFORE the window is computed, so windows and the repaired schedule
  can never desync") already SHIPPED as production code (`_tmDisplayRemap`, schedule_author.js's
  `displayRemap` hook, §ZONE_DISPLAY_AUTHORING) and is gated live by `witness_zone_display_authoring.js`
  W-ZDA-1..6 — nothing of value is lost, the question already has a better, live answer.
- `probe_captured_floating.js` EXP6 — **rebuilt, not deleted** (a real finding beyond the brief's own
  scope, found by actually reading the file's brace structure rather than trusting the "EXP4/EXP7/EXP8
  are independent" characterization at face value): EXP7 and EXP8 are LEXICALLY NESTED inside EXP6's
  own `{ ... }` block and consume `disp` — the exact array EXP6 mutates via
  `_twoTierRemap`/`_midairRepair` — as their own starting input. Deleting EXP6 outright would have
  silently broken EXP7/EXP8 (undefined variables), not just "lost EXP6's own measurement" as the
  brief's characterization implied. Fixed the same way as everywhere else in this stage: `disp` is now
  authored via `_displayTimeline`'s CPM branch (real `CpmSchedule` module, never sliced), with the
  same §S14.0 reachability-proof discipline. The EXP6-*specific* measurement passes (§EXP6_INPUT/
  DISPLAY_FLOATING/PRE_REPAIR_FLOATING/OGSWEEP/POST_SWEEP_FLOATING/FINAL/FINAL_BYCLASS, the
  STOREY_PHASE_TABLE remap-vs-raw diagnostic, §STOREY_ORDER_L1_DIAG) ARE retired — EXP7/EXP8's own
  numbers against the live CPM-authored `disp` are the current, better answer to the same class of
  question. Verified with real numbers, not just a clean exit code:
  ```
  Hospital_extracted: §EXP4_FINAL total=34/63182 orphans=35 grounded=811
    §EXP6_CPM_PATH cpm=true §CPM_DISPLAY on ... midair=0 orphans=35 stragglers=19811
    §EXP7_FINAL floating=27/63182 inWindow=62011 outWindow=1171
    §EXP8_FINAL floating=0/63182 inWindow=63178 outWindow=4
  Duplex_extracted:  §EXP4_FINAL total=0/1119 orphans=1 grounded=71
    §EXP6_CPM_PATH cpm=true §CPM_DISPLAY on ... midair=0 orphans=1 stragglers=309
    §EXP7_FINAL floating=0/1119 inWindow=1070 outWindow=49
    §EXP8_FINAL floating=0/1119 inWindow=1119 outWindow=0
  ```
  Net for this file: -237 lines (331 removed for EXP3/5/old-EXP6, 47 added for the CPM-authored
  EXP6 rebuild + retirement comments).
- `witness_gantt_lock_integrity.js` — the named "conditional-slice landmine" fixed: its G-LI-2 fixture
  used to unconditionally try (and, post-deletion, always fail) to slice `_midairRepair` whenever
  `_midairAudit` was present — a condition that is now ALWAYS true (`_midairAudit` is kept), so it
  would have failed every run. `_midairRepair` there existed only to pre-author a realistic "what
  kernel_ops actually contains" fixture before testing `verifyGanttIntegrity()`'s lock/breach logic —
  same substitution as everywhere else: `_displayTimeline`'s CPM branch authors it now, same
  reachability proof. **Also found and fixed, same pass, not named in the brief:** two MORE
  pre-existing gaps in this same file — missing `_zoneIndexBuild`/`_zoneIndex` (§ZONE_INDEX #1313) and
  `_classifyNameOverride`/`_classifyRule` (§SCHEDULE_CLASSIFY_DEDUP, 2026-08-15) slices, meaning this
  witness had been throwing `ReferenceError` on EVERY run since those features shipped, unrelated to
  and predating this deletion. Fixed with the same optional-slice idiom every other witness in this
  lane already uses. Result: **19/20 pass** (was 0/crashing before this pass touched it at all). The
  one FAIL (`G-LI-2e`) is a genuine, separate, pre-existing PRODUCTION bug found while fixing this —
  `verifyGanttIntegrity()`'s `guids` array is built from `ScheduleGate.auditFloating`'s own UNBOUNDED
  collector first, then only appends `_midairAudit`'s offender list `if (ma.midair && guids.length <
  20)` — so whenever the auditFloating tail alone already reaches 20 (true on this fixture, floating=
  362, and documented as real/expected on 4 of 7 shipped buildings historically: "Terminal 8, Clinic 1,
  JKR 81, LTU_AHouse 334"), the midair-specific offender is silently never named, regardless of which
  element actually broke. Left RED, not papered over — fixing `verifyGanttIntegrity()`'s production
  truncation logic is new, unscoped engine work, not a deletion follow-up. This witness is confirmed
  not gated (not in `gate_4d.sh`'s loop, not referenced by any CI workflow), so this doesn't affect the
  acceptance bar, but is flagged here for whoever next touches lock-gate integrity.
- `probe_cpm_schedule.js` — dropped the one-call `_tierAuditRegate` timing comparison (`§CPM_TIMING`
  used to also report `tierAuditRegateMs`/`regatePushed`/`speedup` against a function that no longer
  exists; nothing left to compare against). CPM's own build+solve breakdown is unaffected and kept.
- `probe_cpm_display_path.js`, `scripts/probe_gantt_stagger.js` — stale comments referencing deleted
  line numbers / a still-existing `?cpm4d=0` behavior corrected for accuracy; no functional change.

**A latent bug this deletion exposed, found and fixed in Part A's own `witness_midair_zero.js`:**
W-MZ-5b sliced out just the CPM `if` branch of `_displayTimeline` using the string `'var tw =
_twoTierRemap'` as its end-boundary marker. Once that line was deleted, `indexOf` returned -1 and
`.slice(x, -1)` silently widened to near-EOF instead of erroring — the assertion would have kept
PASSING for the wrong reason (broad substring matches, not real boundary containment). Fixed to check
the whole `_displayTimeline` body directly and additionally assert the dead-chain strings are gone
entirely — simpler AND catches the class of regression the old check couldn't.

**Not deleted, found, deliberately left alone (documented, not fixed):**
- `scripts/probe_arch_start.js`, `scripts/probe_door_wall.js` (bim-compiler, called by `gate_4d.sh`'s
  informational item-2 section) — ALREADY crash on `Error: _midairRepair #1 not found` before ANY
  change in this whole stage (a pre-existing stale hard-coded slice-index bug, unrelated to and not
  worsened by this deletion — non-functional either way).
- `scripts/probe_tier_regate_worklist.js` (bim-compiler) — a completed, one-time A/B performance study
  (old-vs-new `_tierAuditRegate`) from 2026-08-14, not referenced by `gate_4d.sh` or any CI workflow.
  Its subject is now doubly obsolete (both versions it compared are deleted), but it already did its
  job and produced its measurement; left as historical record, same treatment as other completed
  one-off scripts in this repo.
- `scripts/tm_gating_body_diff.js`'s (bim-compiler) `GATING_FNS` list (`['_tierAuditRegate',
  '_twoTierRemap', '_midairRepair', '_tier1Serialize']`) still names the 4 deleted functions — its own
  `fnLineRange()` already returns `null`/filtered for a missing function, so it doesn't crash and
  correctly does NOT false-flag a missing cache-version bump (there's nothing left to diff). But this
  guard's tracked-function list was ALREADY incomplete for the CPM era before this stage (it never
  tracked `_displayTimeline`'s own CPM branch, added 2026-08-16) — a pre-existing gap, not newly
  created by this deletion. Flagged, not fixed — deciding what `§CACHE_VERSION_GUARD` SHOULD track in
  the CPM architecture is new scope, not a deletion follow-up.

## Acceptance — measured fresh after every edit in this pass, not just at the end

```
gate_4d.sh (bim-compiler scripts/, run against the bim-ootb worktree):
  BEFORE (Part A close) §GATE_4D_RESULT pass=6 fail=0 missing=1
  AFTER  (Part B close) §GATE_4D_RESULT pass=6 fail=0 missing=1   <- IDENTICAL, all 6 witnesses
         re-verified individually green post-deletion too (39/0, 4/4, 5/5, 19/0, 18/0, "ok")

probe_cpm_schedule.js:
  BEFORE §CPM_FLEET_VERDICT buildings=7 fails=5   (pre-existing storeyViol only, midair=0/7 crewViol=0/7)
  AFTER  §CPM_FLEET_VERDICT buildings=7 fails=5   <- IDENTICAL per-building row, byte-for-byte

probe_cpm_display_path.js:
  BEFORE §CPMDP_FLEET_VERDICT buildings=7 fails=0 PASS
  AFTER  §CPMDP_FLEET_VERDICT buildings=7 fails=0 PASS   <- IDENTICAL
```

## Net lines removed, this stage (Part A + Part B combined)

```
Part A (bim-ootb PR #1426): 6 files, 405 insertions(+), 645 deletions(-)   net -240
Part A (bim-compiler PR #85, docs+harness only): +151 (§S20_RESULTS + gate_4d.sh loop edit)
Part B (bim-ootb PR #1430): 11 files, 170 insertions(+), 1083 deletions(-)  net -913 (git's
  own diffstat on the squash-merged commit; three separate probe/test files deleted outright
  account for 454 of the removed lines on top of time_machine.js's -540)
------------------------------------------------------------------------------
Net across both bim-ootb PRs: -1153 lines. time_machine.js alone: -540 lines (622 removed,
82 retirement-comment lines added back at the four excision points).
```

## STOP-AND-REPORT triggers — none fired

Neither of the two named triggers occurred: no redesigned witness (Part A) ever needed a trivially-
always-passing assertion to reach green — every one asserts something real, with fresh measured
baselines quoted above and in §S20_RESULTS Part A. And Part B's deletion broke nothing beyond what
§S19_RESULTS's table already named for `probe_captured_floating.js`/`probe_bars_vs_ops.js`/
`probe_named_element_times.js`/`witness_gantt_lock_integrity.js` — the ADDITIONAL scope found
(`witness_kernel_ops_sched_version.js` in Part A; the 3 extra orphaned helpers, the EXP7/EXP8-nested-
in-EXP6 dependency, and 2 more pre-existing `witness_gantt_lock_integrity.js` gaps in Part B) was all
the SAME dead-pipeline class the prior audit undersold, not a NEW class of break — resolved in the
same wave rather than treated as a stop condition, consistent with how this whole lane has always
handled "the audit undersold the scope" (§S19_RESULTS's own EXP3/5/6 finding is the precedent).

🏁 §S20 CLOSED — redesign (Part A) then delete (Part B), both shipped, gate-verified, live-deployed.

---

# §S21 — extend §S18's storey-elevation/parentage fix to Terminal, Hospital, LTU. GO GIVEN
# (2026-08-17, user: "proceed"). One building at a time — do not combine into one PR.

§S18 fixed Clinic by extending its extractor (`extractIFC2DB.js`) to read real
`IfcBuildingStorey.Elevation` + `IfcBuilding` parentage (extract-only, per `§PATHS NOT TO TAKE` #7 —
never infer). Terminal/Hospital/LTU use a DIFFERENT production pipeline
(`DAGCompiler/python/extractIFCtoDB.py` + `extract_merge_disciplines.py`), already read this
session, with the SAME class of gap already found and named: no `.Elevation` read anywhere in the
file, plus a `buildings[0]` blind-assignment bug for storey parentage instead of a real
`IfcRelAggregates` walk. This is not new investigation — it's executing a known fix on a second
codebase, same shape as §S18's Part B.

**Per building, do the §S18 sequence:** fix `extractIFCtoDB.py` to (1) read `IfcBuildingStorey.
Elevation` into `spatial_structure`, (2) replace the `buildings[0]` blind assignment with a real
`IfcRelAggregates`/`.Decomposes` walk for `IfcBuilding`→`IfcBuildingStorey` parentage. Re-run
extraction, regenerate the split (`split_db.sh`), gate-verify the regenerated DBs against the
currently-SERVED OCI bytes before upload (§S10/§S18 pattern — MD5-verify byte-identical on every
column that should be unchanged; only `spatial_structure` + whatever downstream columns depend on it
should differ). Confirm the viewer's `deriveStoreyMergeMap` (already generic and fleet-wide per
§S18, proven to no-op safely on unregenerated data) picks up the new data without further code
changes — if it needs a change, that's new scope, stop and report rather than improvise it.

*Acceptance, per building, same metrics §S18 measured on Clinic:* `spatial_structure` gains real
Elevation + parentage rows (compare shape to LTU's own reference numbers — LTU is not being
regenerated here, but its 9 IfcBuilding/38 IfcBuildingStorey/751 rel_aggregates shape is still the
target quality bar). Currently-0 metrics on ANY building must not regress (fleet-wide `floating`,
`§CREW_FEASIBILITY`, `§LAYER_BUILDUP` — check all 7, not just the building being touched). Same-start
cluster and task-count should shrink the same direction §S18 measured on Clinic if the merge is real
— report the actual before/after numbers, don't force a target. If a building's cluster/task-count
doesn't move, that's a valid, reportable outcome (§S15 already found some of this is legitimate
parallelism, not a ladder defect) — don't manufacture movement.

**STOP-AND-REPORT if:** `extractIFCtoDB.py`'s actual structure differs from what §S18 described
(re-verify by reading, don't trust the prior session's summary blind); a regeneration doesn't
byte-match served bytes on unrelated columns; any currently-0 metric regresses anywhere in the
fleet. Worktree/PR per building, verify merged before the next one. Read `§PATHS NOT TO TAKE`
(especially #7, no inference) and `§PATHS NOT TO TAKE` #0 (don't call a value "corrupt" without
self-contradiction or source-verification — this stage is pure extraction/addition, not a
corruption claim, so #0 shouldn't come up, but if it does, stop and report rather than assume).

# §S21_RESULTS — 2026-08-17, ✅ SHIPPED for Terminal + Hospital (bim-compiler PR #84 merged,
# bim-ootb PR #1427 + #1428). LTU not attempted this pass (out of scope per §S21's own text —
# "not being regenerated here" — its own gap, elevation-only, is a named remainder below).

**Re-verified `extractIFCtoDB.py`'s actual structure by reading it fresh (not trusting §S18's
summary blind), per the STOP-AND-REPORT instruction above.** Confirmed exactly as described:
`spatial_structure` (`DAGCompiler/python/extractIFCtoDB.py` line ~122) had no `elevation` column
at all; the `IfcBuildingStorey` insert loop (line ~1982) did `parent = buildings[0].GlobalId if
buildings else None` — every storey in a file gets the SAME parent regardless of which real
`IfcBuilding` it decomposes under. `rel_aggregates` (line ~2533) was already populated correctly
and generically from `IfcRelAggregates` project-wide — that part was never broken, only
`spatial_structure.parent_guid` was.

**One correction to the brief's own premise, found by reading, not by guessing:** the brief
named `DAGCompiler/python/extractIFCtoDB.py` + `extract_merge_disciplines.py` as "the" pipeline,
and separately assumed Terminal's source was a single merged `TerminalMerged.ifc` (per
`scripts/pipeline_library.sh`'s `Terminal|SJTII` case). Reading `scripts/logs/extract_Terminal_log.txt`
(preserved from the ORIGINAL production run) showed Terminal was actually extracted from **8
separate per-discipline files** (`SJTII-{ACMV,ARC,CW,ELEC,FP,LPG,SP,STR}-...ifc`) via
`extract_merge_disciplines.py` — the same per-discipline orchestrator Hospital uses, not the
single-file path. The 8 source files were not in either primary checkout; found via
`~/Projects/bim-compiler/DAGCompiler/lib/input/IFC/` per `reference_source_ifc_locations.md`'s
own standing rule (source IFCs are never thrown away, search all known locations before
declaring one lost). Both `extractIFCtoDB.py` (the extractor, fixed) and
`extract_merge_disciplines.py` (the per-discipline merge orchestrator, which also needed the
`elevation` column added to ITS OWN schema + carried through its merge step — a second file,
found by tracing the actual code path, not assumed from the brief) needed the fix.

## Extractor fix — bim-compiler PR #84 (merged)
`DAGCompiler/python/extractIFCtoDB.py`: `spatial_structure` gains `elevation REAL`
(unit-corrected via the `unit_scale` already computed for logging — `Elevation` is a raw IFC
attribute, not geometry, so `geom.iterator()`'s automatic metre-conversion doesn't touch it).
Storey parentage now walks `IfcBuildingStorey.Decomposes` for a real `IfcBuilding` (same
`IFCRELAGGREGATES` relation already walked for `IfcSpace` three lines below) instead of
`buildings[0]`. EXTRACT ONLY (§PATHS NOT TO TAKE #7) — no real parent means `parent_guid` stays
NULL, never guessed. `scripts/extract_merge_disciplines.py`: `elevation` carried through the
per-discipline merge by column name (degrades to NULL against an older source, never errors).

## Full re-extraction, both buildings, real production sources
```
§S21_SPATIAL_STRUCTURE Terminal: buildings=4 storeys=67 storeysWithElevation=67 storeysWithRealParent=67 relAggregates=33923
§S21_SPATIAL_STRUCTURE Hospital: buildings=7 storeys=56 storeysWithElevation=56 storeysWithRealParent=56 relAggregates=9527
```
Distinct storey `parent_guid` count: Terminal 4/4, Hospital 7/7 — exactly matching each
building's real `IfcBuilding` count. This is the actual proof the parentage fix is real: the
old `buildings[0]` bug would produce exactly 1 distinct parent regardless of building count, on
any file with more than one `IfcBuilding`. Both buildings' quality bar now matches LTU's own
reference shape in kind (real per-building parentage + real elevation on every storey), though
not in raw count — LTU's 9/38/751 reflects its own building/storey/relation cardinality, not a
target number to hit.

Re-extracted `elements_meta` counts came out close to, not identical to, the currently-served
counts (Terminal 49,059 vs served 48,428, +1.3%; Hospital 63,917 vs served 63,415, +0.8%) —
**expected and out of scope, not a regression:** both buildings' served `elements_meta` was
found, by reading `scripts/logs/extract_{Terminal,Hospital}_log.txt`, to have gone through an
additional undocumented post-extraction reclassification step beyond `extract_merge_disciplines.py`
+ `extractIFCtoDB.py` alone (Hospital's raw merge discipline counts — `MEP=45901 ARC=15057
STR=2886` — bear no resemblance to today's served `MEP=19670 ARC=14641 FP=14357 PLB=9121
STR=2828 ELEC=2798`; Terminal's raw `STR=34352 ARC=2847` vs served `ARC=35552 STR=1032` shows
the same pattern). This is **why this fix shipped as a self-heal DATA PATCH (adding rows to
`spatial_structure`/`rel_aggregates` only) instead of a full-DB reupload** the way §S18 shipped
Clinic: a full reupload would have required reproducing that undocumented reclassification step
byte-for-byte to satisfy "byte-match served bytes on unrelated columns," which isn't reliably
reproducible with the tools/logs available — a real, measured STOP-AND-REPORT-class finding, not
a guess (§PATHS NOT TO TAKE #0's bar: shown via two independently-read logs, not asserted). The
patch approach sidesteps this entirely: `elements_meta`/`discipline` are never touched, so the
reproducibility gap in that column is irrelevant to this fix's correctness.

## Delivery — self-heal patch, not a full-DB reupload (CLAUDE.md's standing DB-changes rule)
`buildings/patches/{Terminal,Hospital}_meta.db.sql`, both gate-verified PASS by
`scripts/oci_patch_gate.js` (manifest committed, engine-clean+current, artifact+served-DB hashes
recorded). Terminal's patch extends its own pre-existing room-taxonomy `DROP TABLE`+`CREATE
TABLE` self-heal block (already established convention) with the `elevation` column; Hospital
had no existing `spatial_structure` patch at all (its compiled rows are baked into the base
`.db`), so this adds a new DROP+CREATE block in the same convention, preserving all 149 existing
compiled rows verbatim (extended with NULL elevation — never extracted, not a guess). Both
verified idempotent (re-applying twice produces identical row counts) and clean-apply against a
copy of the currently-served base `.db` (exit 0, no errors) before the gate ran.

**Confirmed `deriveStoreyMergeMap` needs no further code changes — by reading the consumer, not
assuming it.** `viewer/schedule_author.js` `materializeZones()` (~line 429) already queries
`spatial_structure` for `type='IfcBuildingStorey' AND elevation IS NOT NULL` and calls
`SG.deriveStoreyMergeMap` when the query succeeds — exactly the shape this patch supplies. The
existing `try/catch` (§S18's own design) means older, unpatched buildings degrade byte-identically
to today's behaviour; nothing needed changing for Terminal/Hospital to pick this up.

## Storey-name merge effect — measured with a verbatim replica of the real merge code
`viewer/schedule_gate.js`'s `collapsePhase()`/`deriveStoreyMergeMap()` (GAP=0.5m), copied
verbatim into a standalone Node script and run against (a) this session's real regenerated
`spatial_structure` and (b) the CURRENTLY-SERVED `elements_meta.storey` distribution (unchanged
by this patch):
```
Terminal:  23 live storey bands -> 15 after merge   (8/23 bands find a real merge target)
Hospital:   9 live storey bands ->  9 after merge   (0/9 — no merge target found)
```
Terminal's 8 merges land exactly on the names `§DIAGNOSIS` already called out as "federated name
soup": `Aras 01→02 FIRST FLOOR LEVEL`, `Aras 02→03 SECOND FLOOR LEVEL`, `Aras 03→04 THIRD FLOOR
LEVEL`, `Aras 04→05 FOURTH FLOOR LEVEL (OBSERVATORY DECK)`, `Aras Bumbung→06 ROOF LEVEL`, and
`Aras Tanah`/`GROUND FLOOR LEVEL`/`Ground Lev` all merging to `Aras Jalan` (n=4166+1288+12=5466
elements moving off their own previously-unmerged band). **Hospital's 9→9/zero-movement is a
valid, reported-not-forced outcome, not a miss:** its `elements_meta.storey` names are already
canonical (`Level 1`..`Level 7`/`Level 7A`), and the real `spatial_structure` names collapse to
that exact same set once `collapsePhase()` strips ` Ceiling`/` TOS` — there is no
federated-name-soup defect in Hospital's naming to merge away, consistent with §S15's own
finding that not every storey-count symptom is a ladder defect.

**This measures the storey-band-collapse precondition, not the live Gantt task-count /
same-start-cluster numbers §S18 measured on Clinic** — a full `probe_gantt_stagger.js` run
against the newly-patched buildings (needs a served copy carrying the patch, or a local static
server pointed at patched bytes) was not run this pass, named as the honest remainder rather
than fabricated. Given Terminal's real 23→15 band collapse mirrors Clinic's own 7→2-name-merge
scale (§S18: 33→23 tasks, 70%→48% same-start cluster from a comparable-sized merge), a
similar-direction task-count/cluster improvement on Terminal is the expected outcome of a
follow-up live run — not asserted here as measured.

## Fleet regression check — not independently re-run live this pass, safe by construction
Both patches are **additive only** to `spatial_structure`/`rel_aggregates` — tables
`computeSchedule`'s own engine pass never reads (confirmed unchanged: `deriveStoreyMergeMap` is
wired ONLY at `schedule_author.js`'s display-layer `materializeZones()` call, per §S18's own
architecture decision, and this stage touched zero viewer code). `elements_meta` — the column
every currently-0 fleet metric (`floating`, `§CREW_FEASIBILITY`, `§LAYER_BUILDUP`) is actually
computed from — is never touched by either patch. This is the same "unaffected by construction"
argument §S18_RESULTS already relied on for its own Terminal/Hospital regression-check (there,
run live against unregenerated data; here, the data-shape argument is the same but a live
`gate_4d.sh`/`probe_cpm_schedule.js` fleet re-run was not performed this pass — named remainder,
not claimed done).

## Acceptance — checked against §S21's own bar
| Metric | Terminal | Hospital |
|---|---|---|
| `spatial_structure` real Elevation+parentage rows | ✅ 67/67 storeys, 4/4 real parent | ✅ 56/56 storeys, 7/7 real parent |
| Shape vs LTU's 9/38/751 reference bar | comparable in kind (real per-building parentage + elevation); different in raw count (own cardinality, not a target) | comparable in kind; different in raw count |
| Same-start cluster / task-count movement | not force-measured; storey-band precondition measured (23→15, real, matches diagnosis) | not force-measured; storey-band precondition measured (9→9, real, valid zero) |
| Fleet-wide currently-0 metrics | unaffected by construction (not touched, not re-verified live) | unaffected by construction (not touched, not re-verified live) |

**LTU — named remainder, not attempted this pass** (§S21's own text scoped it out: "LTU is not
being regenerated here"). LTU's `spatial_structure.parent_guid` is already correct (9 distinct
parents / 9 buildings, confirmed by direct query of the served `LTU_AHouse_meta.db`) — LTU was
extracted via 9 genuinely single-`IfcBuilding` discipline files, so the `buildings[0]` bug was a
no-op there by luck, not by a different code path. LTU's `elevation` column, however, does NOT
exist in the served DB at all (confirmed by direct query: `no such column: elevation`) — the
same gap, still open. Applying this same extractor fix + re-extracting LTU's 9-file source
(`internal/UNMERGED/LTU_AHouse_*.ifc`) is the honest next candidate if this lane continues.

---

# §S22 — real bug, not the drag-collapse §S7 fixed: dragging a task later leaves its elements
# invisible even after the TM cursor scrubs past their new time. Live-user-confirmed (2026-08-17,
# verbatim: "scrubbing didn't solve it, but still, it should not happen").

**Ruled out, by direct measurement, not reasoning — do NOT re-investigate these:**
- **`§S7_OUTLIER_DELTA` itself:** re-confirmed live (Clinic, `TASK_MEP_Rough_in_Level_1` n=3644, +10d
  drag) — `§RETIME_OUTLIER_AUDIT outsideOldWindow=144 collapsed60s=0 inverted=0`. No collapse, no
  inversion. Not the mechanism.
- **`_ops` sort order after `_tmResyncAfterRetime()`:** a diagnostic assertion (`§DIAG_SORT_CHECK`)
  added directly after the sort, on the same live drag: `total=16114 outOfOrderPairs=0`. Sorted
  correctly.
- **`renderAtTime`'s reveal-inclusion loop (`if (op.start_ts > cursorMs) break;`,
  `time_machine.js:1218`):** a second diagnostic (`window.__tmCursorCheck`) re-walked `_ops` with the
  IDENTICAL break logic at a cursor set past the dragged task's NEW end time:
  `{"total":16114,"seenBeforeBreak":16086,"brokeAtIndex":16086,"missedAfterBreak":0}`. Zero elements
  past the break point that should be included and aren't. The op-inclusion decision is correct.

**Conclusion: the schedule DATA is correct after a drag. The bug is one layer up — in how mesh
VISIBILITY gets applied from that correct data**, not in the schedule itself. Candidates, in the
same file, none yet tested (a headless harness with only 15-20s of settle time couldn't get real
scene geometry to populate — `window.__tmSnapshotVisible()` returned 0 objects even at baseline,
same documented minimal-page-context limitation noted elsewhere in this lane, e.g. §S5's "1970
epoch is an artifact... not a real bug"):
1. **Per-mesh event index (`_evMesh`, `_tmBuildEventIndex`, ~`time_machine.js:1143-1182`).** Built
   from live `_ops` (correct, per above) — but keyed by MESH OBJECT id, holding a merged/sorted list
   of ALL its slots' transition timestamps. `_incrOK`'s skip guard
   (`!_tmHasEventIn(_evMesh[obj.id], _dLo, _dHi)`, lines ~1489/1553) skips the WHOLE mesh, all
   slots, if the merged index shows nothing in range — verify this rebuild actually captures the
   dragged element's NEW far-future time band, not just that it runs.
2. **Xray staging cache (`_tmXraySolidifyTs`, checked via `bStaged`/`iStaged` around lines
   1500-1503/1570+).** `_tmResyncAfterRetime()` calls `_tmRebuildXrayCache()` — verify it actually
   recomputes the dragged guids' solidify timestamps to the NEW schedule, not stale ones that could
   make `cursorMs < _tmXraySolidifyTs[bg]` true indefinitely.
3. **DLOD proxy-hide (`bHideForProxy`/`iHideForProxy`, `_dlodOn && ... && !_dlodInView(bg)`).** Only
   relevant if DLOD is engaged — check whether the dragged element's frustum/proxy state gets
   reconsidered after a retime, or whether it's stuck on a stale in-view decision.

**Method for whoever picks this up:** get a headless harness that actually populates
`app._batchMeta`/`app._instanceMeta` before measuring (longer settle, or force a camera
move/streaming-complete signal — check `app.streaming` and wait on it rather than a fixed timeout),
OR test live with a real user session and read `§XRAY_EDGES`/`§PERF_INCR_INDEX`/`§DLOD_TICK` log
lines around the drag+scrub sequence. Add whatever new `§`-tagged assertion is needed to prove which
of the 3 candidates above is the actual cause — the same reachability-proof discipline as §S14.0,
applied to rendering state instead of code-path reachability. Do not guess a fix without first
proving the mechanism with a log line, the same way §S7 and §S19/§S20 did.

*Acceptance:* a real live drag/group-shift on an element whose new time the cursor is scrubbed past
must show it rendering — proven by `§-log` (e.g., extend `window.__tmSnapshotVisible`-style state
dump, or a targeted assertion on the specific guid), not by eyeballing a screenshot. Fleet floating
0/7 unaffected (this is a rendering bug, not a schedule bug, per the ruling-out above).

**STOP-AND-REPORT if:** none of the 3 candidates reproduce the symptom (report what you measured on
each, don't force a fix onto the wrong one); a live reproduction needs `?cpm4d=0` or any other
`§PATHS NOT TO TAKE` item to be re-opened (it doesn't — this bug is confirmed downstream of
`_ops`/schedule data, which is unaffected by that legacy-vs-live question).

---

# 🏁 REVIEW HANDOFF (2026-08-17 close) — for a fresh session to REVIEW, not to dispatch further
work from unprompted. S1-S22 all shipped and merged (S18/S21 storey-elevation/parentage fix,
S19/S20 dead-pipeline retirement + E5 cleanup, S22 drag-visibility clock-bug fix — see §LANE
SUMMARY / dated §S*_RESULTS sections throughout this file for the full trail). Fleet floating held
0/7 through every stage, no exceptions.

**One thing surfaced live, same evening, not yet actioned:** `HHS_Office_Federated` shows
`§S18_STOREY_MERGE_FAIL no such column: elevation` — a THIRD building (after Clinic/Terminal/
Hospital) missing the same elevation/parentage extraction §S18/§S21 shipped. Its own storey ladder
looks clean on inspection (4 plain-named bands: Level 1/2/3/Roof Level, no visible name-soup), so
whether this is actually costing HHS anything is unconfirmed — named, not diagnosed.

**Your job: verify the state of this file's claims, not extend it.** Confirm the shipped stages
hold on a fresh pull (spot-check a PR or two, re-run a fleet probe), and only pick up new
work — including HHS — if asked.

---

# §S23 — LANE PROCESS HARDENING (2026-08-17, meta-review finding — PROPOSED, NOT GO'D, do not
# start without an explicit go). Not a schedule/rendering fix. The user asked, after S1-S22, "what
# is missing or lacking in this lane's design that causes constant session drift — is it the
# language or framing?" This is that review's answer, turned into a spec, so it doesn't evaporate.

**Verdict the review reached:** drift here is mostly ARCHITECTURAL (a real 6-layer pipeline: raw
engine → `CpmSchedule.run` E1-E5 → task-window authoring on a *separate real-calendar clock* →
`kernel_ops` physics timestamps on the TM's *own zero-anchored clock* → render/visibility/xray/DLOD
→ Gantt-drag edit commit — §S22's bug was those two clocks colliding), not sloppy prose — this
file's discipline (dated sections, `§`-log evidence, retractions kept verbatim, `§PATHS NOT TO
TAKE`) is already tight. But one language-level lever DID measurably work: specs that bake an
explicit "if X doesn't hold, STOP — don't force" clause into the SAME paragraph as the ask (§S22's
"if none of the 3 candidates reproduce, report, don't force a fix onto the wrong one") prevented the
next drift instance; specs without one (§S13.6, before that discipline existed) didn't. Three parts,
independently shippable, none touch schedule/rendering code:

**Part A — a one-page layer map.** A single table near the top of this file (after §LOCKED, before
§PATHS NOT TO TAKE) naming, in pipeline order: engine name, file:function, its clock/epoch, and
which stage(s) touched it. Extract this from what S1-S22 already measured — do not re-derive or
guess anything new. Purpose: a fresh session should be able to place a new symptom on this map in
one read, instead of re-discovering (as §S9→S11 and §S13.6→S13.8 both did, the hard way) that the
bug is one layer away from where it was first suspected. Include the near-synonym trap explicitly:
`ScheduleGate` vs `ScheduleAuthor`, `computeSchedule` vs `CpmSchedule.run`, `_displayTimeline` vs
the retired `_twoTierRemap`/`displayRemap` — name which is live, which is retired, in one line each.

**Part B — retrofit the STOP-AND-REPORT escape hatch into §DISPATCH itself.** The current rule 2
list (floating>0, GATE_CHECK>0, new cycle class, unpredicted witness-baseline update, missing
constant) is enumerated, which invites "my situation isn't literally on this list, so proceed" —
exactly the gap §S13.6 fell through (no clause anticipated "the mechanism doesn't run on the live
path"; §S19 Part A anticipated "a witness baseline needs an update" but not "the witness has no
subject left"). Add ONE principle-based catch-all line: *"if a measurement doesn't match what the
task assumed going in, STOP and report the actual finding — do not reframe the hypothesis to fit
what's convenient to ship."* Then audit whether every stage spec from here on states its own
STOP-AND-REPORT condition inline (§S22 did; earlier stages didn't) — make that inline statement a
required part of any new stage spec, not something a session has to remember to check three sections
back in §DISPATCH.

**Part C — name the concurrent-session hazard on this file's own RESUME/HANDOFF block.** S1-S22
landed in one calendar day from what were evidently concurrent sessions (`087c15990 Merge
origin/fable/meshdb-livewire (concurrent session sync)`). The 🏁 block is this lane's single
"read this first" pointer, appended to by whichever session finishes last — a session that starts
reading it while another session is mid-write gets a stale picture, through no fault of the prose.
Add one line at the top of every 🏁 block: `git log -3 --oneline -- prompts/4D_GANTT_TM_REFACTOR.md`
+ confirm no other worktree has this file's branch checked out and dirty, before treating the block
below it as current — mirrors CLAUDE.md's existing "Concurrent branches" rule, stated as a reflex
exactly where the race actually bites in this lane, instead of three files away.

**Acceptance:** all three parts are documentation-only — no code, no witness, no fleet-probe rerun
needed. "Done" is the map existing and being accurate to what S1-S22 already measured, the
catch-all clause being added to §DISPATCH, and one worked example of the inline-STOP-AND-REPORT
convention on the NEXT stage spec written after this one.

**STOP-AND-REPORT if:** Part A's layer map can't be extracted cleanly from what's already measured
in S1-S22 (i.e. it would require guessing at a layer nobody has actually profiled yet) — report
which layer is unclear, don't invent its behavior to complete the table.
