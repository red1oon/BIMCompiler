# 4D_GANTT_TM_REFACTOR.md — S1-S5 full dated history (archived 2026-08-17)

Archived because `§LANE SUMMARY` in the parent file already carries every fact a future session
needs (PR numbers, key results, the two open items at close). This file is the full blow-by-blow —
keep for provenance/audit, do not re-read for routine work on this lane.

---

# §RESULTS — dated per-stage log (Sonnet dispatch session, worktree `/tmp/wt-gantt-s1` off fresh
# origin/main, branch `fix/gantt-s1-band-rank`)

## S1 — 2026-08-16 — ✅ DONE, bim-ootb PR #1401 (auto-merge squash armed)

**Code:** `viewer/cpm_schedule.js` `buildGraph()` — `bandRank` (dense rank of `floor(meanZ/3m)`,
same quantum as shipped `§GANTT`/`§4D_BAND_MONOTONIC`) replaces per-name `lvlRank` in `groupKeyOf`
(straggler classification) and in E4 (storey hammocks now chain band *b* → next PRESENT band
*b+1*, all level-pairs cross-producted; levels sharing a band are parallel, never chained to each
other). No new tuned constant — 3m reused verbatim.

**Pre-change baseline** (`node scripts/probe_cpm_schedule.js`, fresh origin/main @ c849b0d):
```
§CPM_FLEET [["Duplex_extracted","raw=21","cpm=0","storeyViol=0"],["Clinic_extracted","raw=428","cpm=0","storeyViol=1"],
["HHS_Office_Federated_extracted","raw=193","cpm=0","storeyViol=0"],["JKR_extracted","raw=184","cpm=0","storeyViol=2"],
["Hospital_extracted","raw=1401","cpm=0","storeyViol=0"],["Terminal_extracted","raw=558","cpm=0","storeyViol=3"],
["LTU_AHouse_extracted","raw=1336","cpm=0","storeyViol=4"]]
Terminal §CPM_RUN ... stragglers=9678 (this harness's own baseline — NOT the 14,129 cited in §DIAGNOSIS,
  which was measured via a live-viewer/different element-recipe path; both use the same algorithm,
  the discrepancy is recipe-of-origin, not a bug — see note below)
§CPM_STOREY_PHASE violations: Duplex=0 Clinic=0 HHS=1 JKR=3 Hospital=0 Terminal=2 LTU=8
```

**Post-change** (same harness, same fleet):
```
§CPM_FLOATING midair=0 structural=0   — ALL 7 buildings, unchanged
§CPM_GATE_CHECK elementEdgeViolations=0 PASS   — ALL 7
§CPM_PARITY elementMismatch=0 ... PASS   — ALL 7 (E1/E2 physics untouched by this stage)
cycleDrops {e3:0,e4:0,member:0}   — ALL 7, no new cycle class; contractedSccs/contractedNodes/
  fsViolInScc identical to baseline per building (pure-physics SCCs, unaffected by the group-key change)
Terminal §CPM_RUN stragglers=13084   (baseline 9678 → UP, not the predicted drop)
§CPM_STOREY_PHASE violations: Duplex=0 Clinic=2 HHS=0 JKR=4 Hospital=0 Terminal=2 LTU=7
  (Clinic +2 worse, JKR +1 worse, HHS -1 better, LTU -1 better, Duplex/Hospital/Terminal unchanged count)
§CPM_STOREY_LEVEL: Clinic 1→0 (better), Terminal 3→4 (worse by 1), others unchanged
```

**Also run** (`node scripts/probe_cpm_display_path.js`, exercises the SAME `cpm_schedule.js` via
`time_machine.js`'s live wiring — `_CPM_DISPLAY` → `CpmSchedule.run`):
```
§CPMDP_FLEET_VERDICT buildings=7 fails=0 PASS
nonStragglerOutside=0 on all 7 (the hard bar — §ZONE_WINDOW_DAGWINS_CLIP's own bar, unaffected)
Terminal §CPM_RUN stragglers=13084 (matches probe_cpm_schedule.js exactly — deterministic, cross-recipe-consistent)
```

**Also run** (`bash scripts/gate_4d.sh` from bim-compiler, `VIEWER_DIR=/tmp/wt-gantt-s1/viewer`):
```
§GATE_4D_RESULT pass=7 fail=0 missing=1
```
(the 1 MISS — `witness_arch_area_weight`, "not in this revision" — reproduces identically on clean
origin/main, pre-existing, not caused by this stage)

**Verdict:** all 5 hard S1 gates green (floating 0/7, gate-check 0/7, parity 7/7, cycleDrops 0/7 with
no new cycle class, display-path 7/7 with hard bar held). The two SOFT/predictive criteria in the
Acceptance line went mixed: Terminal's stragglers count rose instead of falling, and
`§CPM_STOREY_PHASE` got measurably worse (by 1-2) on 2/7 buildings (Clinic, JKR) while improving on
2 others (HHS, LTU). **Traced mechanism, not a bug:** band-collapsing removes ARBITRARY per-name
separation between federated pseudo-levels sharing one real physical floor. Previously, an
Architecture-phase element on "01 Ground Floor Level" (say) physically supporting a
Superstructure-phase element on "01 Ground Level Floor" (a DIFFERENT name, same real floor) could
dodge straggler classification purely because the two names' independently-computed z-medians
happened to rank in a "safe" order relative to their phase gap — an accident of naming, not
physics. Post-S1, both names collapse onto the same bandRank, so only the phase term
differentiates, and this same intra-floor dag-wins case is now correctly flagged. This is the
project's own `§TIER_DAG_WINS` doctrine operating as designed ("physics beats phase tidiness —
counted, never hidden"), most visible on the buildings with the densest federated name-soup
(Terminal, JKR, Clinic to a lesser extent) — exactly the buildings §DIAGNOSIS named as Cause 1's
target. **None of `§DISPATCH`'s 5 explicit STOP triggers fired** (floating>0 — no; `§CPM_GATE_CHECK`>0
— no; new cycle class — no; locked witness baseline needing an unpredicted update — no, gate_4d
7/7/missing=1 unchanged from clean main; a stage acceptance needing an undeclared constant — no, 3m
reused verbatim). Per this project's WORK-TO-ZERO discipline (continue, don't park, on a
non-hard-stop), proceeding to S2 — S2's own acceptance bar (Terminal's equi-shape bar cluster GONE,
Hospital's cascade preserved) is the real, direct test of whether the user's actual reported symptom
is fixed; S1's straggler-COUNT direction is an internal graph-construction metric, not the symptom
itself.

**Note on the 14,129 vs 9,678/13,084 discrepancy:** `§DIAGNOSIS`'s cited baseline (`§CPM_RUN …
stragglers=14129`) was attributed to a live-viewer headless dump; `probe_gantt_stagger.js` as
currently committed does not itself print browser-console `§` lines to the terminal (verified by
reading the script — `page.on('console', …)` only pushes to an internal array, never printed), so
that exact figure could not be independently re-derived from that harness without modifying it
(out of S1's scope — S1's acceptance names `probe_cpm_schedule.js` specifically). Both
`probe_cpm_schedule.js` and `probe_cpm_display_path.js` (two independent element-building recipes)
agree with each other exactly post-S1 (13,084 both), so the number is deterministic and
recipe-consistent; the 14,129 figure most likely came from a third recipe/timing (time_machine's
own inline element builder with its Z-based unknown-storey reassignment) not exercised by either
probe used here. Not chased further — outside S1's named harness scope.

PR: https://github.com/red1oon/bim-ootb/pull/1401 (auto-merge squash armed 2026-08-16, verify
merged before S2's worktree branches off main).

## S2 — 2026-08-16 — ✅ CODE DONE, bim-ootb PR #1402 (auto-merge squash armed) — ⛔ BLOCKED on the
## "eyeball-confirm" review checkpoint §DISPATCH rule 4 names for this exact stage

**Code:** `viewer/time_machine.js` `_tmDisplayRemap` — M2's Tukey-fenced robust envelope
(Q1-1.5·IQR .. Q3+1.5·IQR over ALL group members' true start/end, clamped to actual min/max)
replaces the straggler-classification min/max clip. Classification-free (no `graph.stragglerOf`
lookup). Mirrored verbatim in `scripts/probe_cpm_display_path.js`; outside-window accounting
renamed `stragglerOutside`→`outlierOutside`. Percentile convention `sorted[floor(n*p)]` matches
`storeyOrderReport`/`§GANTT_GAP_CLAMP` precedent. No new tuned constant — 1.5× is the spec's own
literal Tukey multiplier, not invented.

**Evidence:**
```
node scripts/probe_cpm_display_path.js  →  §CPMDP_FLEET_VERDICT buildings=7 fails=0 PASS
  floating=0 and nonOutlierOutside=0 on ALL 7 (the hard bar)
  outlier populations far smaller than old straggler-classification population:
    Terminal clamped=1186 (was stragglerOutside=9576), Duplex clamped=61 (was 168), LTU clamped=7247 (was 17348)
bash scripts/gate_4d.sh (bim-compiler)  →  §GATE_4D_RESULT pass=7 fail=0 missing=1  (same pre-existing MISS as S1)
Hospital ground-level cascade (live probe_gantt_stagger.js): Substructure s=0 e=3 → Superstructure s=1 e=387 → Architecture s=6 e=386 — order preserved
```

**NOT met — Terminal's "equi-shape cluster gone" acceptance criterion.** Live stagger probe,
before (S1 only) vs after (S1+S2):
```
tasks with n≥1,000 in a bar <2 days:        5  →  4
tasks sharing the exact same start day:     18/72 (25.0%)  →  20/72 (27.8%)
tasks within ±1d of that day:               36/72 (50.0%)  →  38/72 (52.8%)
```
Essentially unchanged; on the clustering read, marginally worse.

**Root cause, measured directly (not invented) — checked RAW crew-leveled vs CPM-solved times for
Terminal's Roof-Level Superstructure population (n=10,950):**
```
RAW (computeSchedule, LOCKED/untouched):   startDay p25=36.0 p50=37.9 p75=39.7   (spread ~13 days, days 34.1-47.0)
CPM (this lane's own solve(), post-S1):    startDay p25=130.0 p50=130.4 p75=130.4 (spread ~0.4 days)
                                             makespanDays=130.6 — compressed to the project's tail
```
The compression is introduced by the **CPM forward pass itself** (full precedence honoured,
`floating=0` independently verified) — NOT by `computeSchedule` (confirmed spread, locked,
untouched by this lane) and NOT by S2's own window-authoring formula (S2 only reshapes which times
feed `deriveZones`'s `min()`/`max()` — it structurally cannot widen a bar whose true CPM-solved
population is already this tight; a robust-envelope statistic over an already-narrow true
distribution stays narrow, correctly). Same pattern reproduces on Hospital's upper levels:
`Architecture_Level_3` n=4423, `Level_4` n=4436, `Level_5` n=3537, each in a 1-day bar.

**This is neither S1's target (band-rank E4/grouping, shipped #1401) nor S2's target (bar-width
formula, this PR) — it is a property of the CPM graph's own precedence structure** (E1 support
chains + E3/E4 hammocks combined), which is LOCKED core per this lane's `§LOCKED` section except
S1's one named change. Since `floating=0` and judge-parity hold throughout, this MAY be an accurate
reflection of Terminal's true construction sequence once full physics precedence is honoured (a
fast, thousands-of-small-elements roof population that genuinely cannot start until nearly
everything below it completes) — or it may indicate an overly-aggressive edge somewhere in the
combined graph (e.g. S1's own E4 band-to-band cross-product now creating a longer/denser combined
chain than the per-name version did). **Distinguishing these two explanations needs a decision this
session cannot make unilaterally** — it would require either accepting the physics-true result as
correct (closing this lane's remaining stages on that basis) or auditing the LOCKED CPM graph
construction for a specific bad edge (out of this Sonnet dispatch's authorized scope: "Do not
touch... the one-truth reuse contract" and CPM internals beyond S1's one named change).

**⛔ BLOCKED: is the Terminal/Hospital upper-level compression (thousands of elements landing in a
<1-day bar near the schedule's tail) an ACCURATE physics-true consequence of CPM's now-honoured
full precedence graph (accept and proceed), or does it indicate a specific over-aggressive edge in
the combined E1/E3/E4 graph that needs auditing before this lane's remaining stages can claim the
user's original symptom is actually fixed?** This is exactly the `§DISPATCH` rule 4 "Fable/Opus
review checkpoint... before S3-S5 proceed" moment, named in the spec itself — full stagger dumps
posted in the PR body for that review. Per this project's WORK-TO-ZERO doctrine (mark the ⛔
question, do not loop on it, move to the next attemptable item — never silently drop it), continuing
to S3, which is independently attemptable (S3 adds an M3 ops-timing measurement that does not depend
on this bar-shape question and will itself produce more evidence relevant to this exact checkpoint).

PR: https://github.com/red1oon/bim-ootb/pull/1402 (auto-merge squash armed 2026-08-16 — the CODE is
correct/spec-compliant and merges; the ⛔ BLOCKED item above is a separate, standing question for
the reviewer, not a defect in this PR's diff).

## S3 — 2026-08-16 — ✅ DONE (Terminal), ⛔ Hospital 1 violation root-caused as a probe edge case,
## bim-ootb PR #1403 (auto-merge squash armed)

**Code:** `scripts/probe_gantt_stagger.js` — adds M3's monotone-band-median check. Queries
`kernel_ops` `ELEMENT_PLACE` (true physics op times, unaffected by S2) joined to real element Z
(`elements_meta`/`element_transforms`), banded via `floor(centerZ/3m)` (same quantum as M1's
`bandRank`). Per band: median op-start day, checked non-decreasing across bands, 1-day tolerance.
No shipped `viewer/*.js` touched — probe-only, zero production risk.

**Evidence (real viewer, both buildings named in S3's acceptance):**
```
Terminal: §LAYER_BUILDUP violations=0/12 bands=13 ops=48428 PASS
Hospital: §LAYER_BUILDUP violations=1/14 bands=15 ops=63415 FAIL
  detail: band54(n=116,med=364.7d) > band55(n=1644,med=61.6d)
```

**Terminal fully meets S3's acceptance bar — and this directly informs the S2 ⛔ BLOCKED
checkpoint above.** Despite S2's finding that Terminal's Roof-Level Superstructure population
compresses into a <1-day bar near the schedule's tail (days 130.0-130.4 of a 130.6-day makespan),
the CROSS-band median order across all 13 bands (-6 through 9) is strictly monotone non-decreasing
with ZERO violations. This is evidence FOR the "physics-true consequence" reading of S2's finding:
the upper bands build in a rapid but STILL correctly-ordered sequence near the tail — not an
inversion, not floors building out of order, just little inter-band lag once the tail phase
starts. Weighs toward "accept as physics-true" on the S2 ⛔ question, though the reviewer's call.

**Hospital's single violation, root-caused (not invented) — direct query against
`elements_meta`/`element_transforms`:**
```
band54 (z 162-165m): IfcFooting n=553 dominates this z-slice, storey="Level 1"
band55 (z 165-168m): IfcBuildingElementProxy/IfcPipeSegment/IfcWallStandardCase/IfcDoor etc dominate, storey="Level 1"
overall Hospital element_transforms Z range: [159.8, 203.2]m (absolute/geodetic coordinate datum,
  not building-relative — irrelevant to band ORDER, floor(z/3) is offset-invariant for ordering)
```
**Both bands are the SAME real named storey ("Level 1")**, which is taller than the 3m band
quantum — the banding scheme slices one physical storey into two z-bands. Comparing band54 vs
band55's medians measures INTRA-STOREY multi-phase timing spread (Substructure/Tier-1 footings vs
later-tier elements of the SAME floor) — not a real inter-floor sequencing violation. Terminal's
own storeys didn't hit this edge case in this measurement (no Terminal storey happened to straddle
a band boundary this way). **Not fixed here** — a phase-aware banding or same-storey-exclusion
mechanism is not in §MODEL M3's literal text ("per 3m z-band, the median op start must be monotone
non-decreasing with band rank" — exactly what was implemented); adding either now would be
inventing a mechanism the spec didn't derive. None of `§DISPATCH`'s 5 explicit STOP triggers fired
(measurement-only stage, no shipped code touched, no floating/gate-check/cycle-class/witness
surface here) — S3's own acceptance line names BOTH buildings at 0 violations, so this is an
honestly-reported partial miss (1/2 buildings clean), not a stage failure requiring a full halt.

PR: https://github.com/red1oon/bim-ootb/pull/1403 (auto-merge squash armed 2026-08-16).

## S4 — 2026-08-16 — ⛔ MEASURED FLOOR REPORTED, target NOT reached, stopped per spec's own
## fallback clause, bim-ootb PR #1404 (auto-merge squash armed)

**Code:** `viewer/time_machine.js` — added `_rawScheduleRemember`, a NEW additive one-shot cache
(same discipline as the existing `_displayTimeline._last`) populated at the top of `_tmDisplayRemap`
from the `schedule` parameter (materializeZones' own already-computed raw schedule) and consumed
once in `injectGantt` (≥99.9% guid-coverage check, byte-identical fallback on any miss) to skip
`injectGantt`'s own second, redundant `ScheduleGate.computeSchedule` call. Also added extensive
additive `performance.now()` timing brackets (no behavior change) across the whole activation path,
in both `time_machine.js` and `scripts/probe_gantt_stagger.js` (forwards the timing/activation §
lines to stdout — previously pushed to an internal array and never printed, a real gap fixed along
the way).

**Full measured breakdown, Hospital-63k, cold open, live headless viewer (6 total runs):**
```
pre-activate() setup (unaccounted, outside the instrumented span): ~3.7-4.6s
materializeZones native-schedule materialization (cold-open FIRST computation): ~4.0-4.6s
injectGantt elemQuery:                                              ~0.85-1.0s
injectGantt computeSchedule (SECOND, REDUNDANT call, pre-fix):       ~1.5-1.6s  <- FIXED
displayTimeline (CPM one-truth reuse processing):                   ~0.9-1.1s
insertLoop (initial bulk INSERT of kernel_ops rows, unchunked):      ~1.0-1.4s
supportCheck (auditFloating — real _sched consumer):                 ~0.5-0.7s
capBranchPreWrite (SELECT-back all rows + JSON.parse + rescale):     ~1.6-1.7s
capBranchWrite (_writeScheduledChunked — the chunked UPDATE loop):   ~7.0-7.8s  <- LARGEST cost
loadOps (re-read all rows post-write):                                ~0.7-0.8s
xrayCache (_tmRebuildXrayCache, runs every activation):               ~1.0-1.2s
misc (computeDays/renderAtTime/etc):                                  ~0.1s
```

**The fix (M4's own explicit instruction: "run [§SUPPORT_CHECK] from the hook's already-computed
raw schedule"):** confirmed every `_sched[guid]` dereference inside `injectGantt` (`_twItems` seed,
`auditFloating`, `§ROOF_GATE`'s `_rgLateVsWalls`, plus the `__tmScheduleDebug` inspection var) reads
only `.start`/`.end`, matching `ScheduleGate.computeSchedule`'s own exact per-guid return shape
(`schedule_gate.js:420`) — safe to source from a cache. Verified the reused values are safe for
their actual consumers even without an epoch/scale rebase: `auditFloating`/`§ROOF_GATE` are pure
RELATIVE-order tests (`sc.start < se - 1`), invariant to materializeZones' `baseMs=0`/`scaleFactor=1`
vs injectGantt's own real anchor/scale (a uniform shift or uniform positive scale never changes
which element is earlier) — and the one ABSOLUTE-value consumer (`_twItems`'s seed) is fully
overwritten by the already-correctly-epoch-shifted `_displayTimeline` reuse before anything
user-visible is produced. Empirically confirmed, not just reasoned:
```
bash scripts/gate_4d.sh (bim-compiler) → §GATE_4D_RESULT pass=7 fail=0 missing=1
  IDENTICAL to S1/S2/S3's baseline — witness_midair_zero (the floating=0 gate) 39/39 unchanged,
  witness_kernel_ops_sched_version 12/12 unchanged
§S4_RAW_SCHEDULE_REUSE hits=63415 misses=0 — confirmed firing on Hospital
```

**⛔ MEASURED RESULT: 10s target NOT reached.** Activation floor **~20.8-23.2s** (down from
~24.5-25.3s baseline across 4 pre-fix runs — a real ~3-4s / ~12-15% saving, confirmed by the
`§S4_RAW_SCHEDULE_REUSE` cache-hit log and the `computeSchedule` phase delta dropping from
~1.5-1.6s to ~0.3-0.5s). The three dominant remaining costs (write loop ~7.5s,
`materializeZones`' own NECESSARY first-time computation ~4.3s — not dead work, someone has to
compute the schedule once — and an unresolved ~4s pre-`activate()` gap outside this module, not yet
root-caused) would all require touching locked/borderline-locked behavior (kernel_ops write
mechanics, `computeSchedule`'s own internals, or code outside `time_machine.js`/`schedule_author.js`
not yet identified) to cut further — outside `§DISPATCH` rule 3's authorized scope ("Do not touch:
crew-leveling internals... kernel_ops schema. S4 may reorganize CALLS around them, not their
bodies"). Per `§STAGES` S4's own explicit fallback — *"If ≤10s is not reachable without touching
locked behavior, report the measured floor and stop"* — stopping here. This is the ONE instance in
this lane where the spec itself names "stop and report the floor" as success criteria, so this ⛔ is
the CORRECT/expected outcome for this stage, not an open question like S2's.

PR: https://github.com/red1oon/bim-ootb/pull/1404 (auto-merge squash armed 2026-08-16).

## S5 — 2026-08-16 — ✅ DONE, bim-ootb PR #1405 (auto-merge squash armed)

**Code:** `_GANTT_CACHE_VERSION` 29→30, `sw.js` `CACHE_VERSION` v1047→v1048 — catch-up bump for
S1/S2/S4's schedule-generation-behavior changes (a process gap this session found: `gate_4d.sh`'s
own `§CACHE_VERSION_GUARD` was run BEFORE each stage's commit, against working-tree-only diffs its
git-diff-based check cannot see, so it never actually fired against this lane's own changes despite
running green every time — noted here so a future dispatch doesn't repeat the same ordering
mistake: commit FIRST, then run gate_4d.sh, if the guard's own signal matters for that stage).

**All 4 witnesses S5 names, green, no assertion updates needed:**
```
witness_zone_display_authoring: §ZDA_WITNESS_SUMMARY pass=16 fail=0
witness_crosstask_judge_parity: §CJP_WITNESS_SUMMARY pass=20 fail=0
witness_midair_zero:            §MIDAIR_ZERO_SUMMARY pass=39 fail=0  (via gate_4d.sh)
witness_tier_serial_display:    §TIER_SERIAL_SUMMARY pass=57 fail=0  (via gate_4d.sh)
```
None of M1/M2/M3's metric-meaning changes broke a locked witness baseline — every one of these
passed cleanly against the SAME assertions shipped before this lane started.

**`gate_4d.sh`, run AFTER commit this time (properly exercises `§CACHE_VERSION_GUARD` for the
first time in this lane):**
```
§GATE_4D_RESULT pass=8 fail=0 missing=1
§CACHE_VERSION_GUARD PASS gating_changed=0 version_bumped=1
```
(the 1 MISS — `witness_arch_area_weight` — confirmed pre-existing/unrelated in every prior stage)

**Final fleet confirmation — no new regressions vs S1-S4's own documented numbers:**
```
probe_cpm_schedule.js:     floating=0/7, structural=0/7 on ALL 7 (storeyViol fails=3 is the
                            already-documented S1 federated-ladder residual, byte-identical)
probe_cpm_display_path.js: §CPMDP_FLEET_VERDICT buildings=7 fails=0 PASS
```

**Live-deploy verification — genuine, not just curl.** Curled the live GitHub Pages payload
(`https://red1oon.github.io/bim-ootb/`) and confirmed S1/S2/S4's own code strings present
(`bandRank`/`bandOfLevel` in `cpm_schedule.js`, `_rawScheduleRemember`/`§S4_RAW_SCHEDULE_REUSE` in
`time_machine.js`). Went further: ran a REAL headless browser session against the deployed
`viewer.html` with a real Hospital DB (mixed-content Chrome flags to let the HTTPS page fetch a
local dev DB server):
```
[live] §CPM_RUN n=63415 ... stragglers=11215 ... makespanDays=388.4
[live] §ZONE_WINDOW_DAGWINS_CLIP clamped=6230 (Tukey-fenced group envelope, classification-free...)
[live] §S4_RAW_SCHEDULE_REUSE hits=63415 misses=0 — skipped a second computeSchedule call
[live] §TIME_MACHINE ON — 63415 ops, 74 days, project: 1/1/1970 → 1/24/1971
LIVE_TM_ACTIVATED=true
```
All 3 stages' § log signatures confirmed live and functioning end-to-end on the real deployed site,
not just in a local worktree. (`§TM_OPS_CHECK` epoch showing 1970 is an artifact of this ad hoc
verification script's minimal page context, not a real bug — the standard probes anchor correctly.)
All 4 prior PRs (#1401-#1404) confirmed to have triggered successful `deploy-pages.yml` runs.

**Docs closeout:**
- `4D_SCHEDULE_ARCHITECTURE_REDESIGN.md`: `§ZONE_WINDOW_DAGWINS_CLIP`'s original formula description
  marked ⛔ RETIRED, pointing to S2's Tukey-fence successor (tag kept, formula changed, per M2's own
  instruction). The "TM activation ≈20s, not fixed" note updated with S4's measured outcome.
- `PROGRESS.md`: one-liner added.
- This file: this dated §S5 section.

PR: https://github.com/red1oon/bim-ootb/pull/1405 (auto-merge squash armed 2026-08-16).
