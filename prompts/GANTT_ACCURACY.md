# ⚠ DO NOT REMOVE — Read the log after every run

## ✅✅✅ SESSION CLOSED 2026-08-03 — Terminal's schedule skew is FIXED, live-verified, all 3 PRs merged
**User's final read, live on the deployed build: "seems not as rushed."** Confirmed working, not a
claim taken on faith — see the three PRs below for what each one fixed and how it was verified.
`bim-ootb` PRs #1154, #1155, #1156 — **all MERGED**, all live on `https://red1oon.github.io/bim-ootb/`
(`sw.js` `CACHE_VERSION` v935+). If a future session opens this file: the "RESUME 2026-08-04 root
cause found" / "GENERIC RULE" sections further down are the DIAGNOSIS that led here — the fix they
were asking for is already shipped, don't re-diagnose or re-build it. What's still open (not started
this session, no PR): `⛔ within-phase day-batching` and the `LIMIT 2` parapet gap noted near the
bottom of this file — check those sections' own headers before picking either up.

**One live gotcha worth remembering for next time:** right after #1154 merged, the user tested and
still saw the old numbers — not because the fix was wrong, but because the browser's service worker
was serving a stale cache (`§BUILD_VERSION v933` in their console vs `v934` already live). A reload
fixed it. If a "still broken" report arrives right after a merge, check `§BUILD_VERSION` in the
user's own console log against the current live `sw.js` CACHE_VERSION before re-diagnosing the fix
itself — it may just be an unreloaded tab.

## ✅ §PHASE_OVERLAP_BAND had a THIRD un-fixed call site — bim-ootb PR#1155 (MERGED), caught live minutes after #1154 shipped
User tested the deployed #1154 fix live and reported *"tons of piling and beams in single day"* still.
Console log showed the smoking gun: `§AUTHOR_MATERIALIZE ... totalDays=229` (correct) immediately
followed by `§AUTHOR_UI_DATES start=2026-01-01 span=407d` (wrong — the plain Σ of the 5 phase
durations, 111+221+38+23+14=407, with zero overlap) and finally `§TIME_MACHINE ON — 408 days` — the
WRONG number is what actually reached the user. **`schedule_author_ui.js`'s `applyDates()`
(fires on the wizard's "Apply" step) is a THIRD, independent "lay phases out from a start date"
implementation** — `materializeDefault` and `scheduleContiguous` (both in `schedule_author.js`) got
the band-overlap fix in #1154; this UI-only re-apply path did not, and silently reverted an
overlapping schedule back to strictly-contiguous every time the user hit Apply. Same fix: real band
count per phase (`task_elements`→`elements_meta.storey`), `lag = duration/bands`. Verified headless
against real `Terminal_extracted.db` — reproduced the exact 407d bug, confirmed the fix restores
229d. **Lesson for future sessions: this scheduling logic now has (at least) 3 independent
cursor-advancement call sites — `materializeDefault`, `scheduleContiguous`,
`schedule_author_ui.js#applyDates`. Any future date-layout fix must touch all three or grep for
`cursor +=` across `viewer/schedule_author*.js` first.**

## ✅ §CPE_SETTLE_HOLD still had a residual hardcoded floor — bim-ootb PR#1156 (MERGED, after a sw.js/viewer.html merge conflict against #1154+#1155 — resolved per this file's own CACHE_VERSION-conflict rule, kept the higher version)
Separate, older standing request ("since last session"). PR #1153's fix replaced the ~0.8-1s imposed
settle pause with a smaller `CINEMA_MIN_TURN_SEC=0.05s` technical floor, reasoned as needed to avoid
a zero-length beat. User: *"i never asked for that as it is a user setting in hold field.. so no hard
coded."* Checked `_natTotal`'s other terms (dive ≥2.5s, rise ≥0.5s, orbit fixed 8s) — none can be
zero, so a zero-length spin beat cannot zero the film or divide-by-zero downstream. Floor removed
entirely; the beat is now purely real turn time + the user's typed Hold value.

## ✅ §LABOR_QUANTITY_WEIGHT + §PHASE_OVERLAP_BAND — BUILT, PR bim-ootb#1154 (MERGED, 2026-08-03/04)
**Closes the "RESUME 2026-08-04 root cause found" section below — this is that fix, shipped.** User
ruling on the same session: *"film layer MUST be removed as it is bad separation of concern"* (the
§CPE_EVEN_PHASE_PACING/§CPE_PHASE_STAGGER film hack from PR #1153, reverted) — then *"make the 4D
schedule maker simply follow simple rules!!!!"* / *"if rates gives the intelligence, engineers will
agree"* (led to the RATES.unit-driven fix below) — then *"Do what is conventional to construction
industry. Test on Hospital and Terminal only as serious projects"* (§PHASE_OVERLAP_BAND).

**1. Film-layer stagger removed** (`cinema_maxq.js`/`time_machine.js`, byte-for-byte revert of PR
#1153's `_workCursorAt`/`_phaseWindow`/`_phaseCursorAt`/`tmWorkSchedule` phase-segmentation). Film
is back to plain global element-rank pacing — it plays the schedule, does not re-author pacing the
data doesn't say. `§CPE_SETTLE_HOLD` (same PR, unrelated fix) left untouched.

**2. §LABOR_QUANTITY_WEIGHT** (`schedule_author.js`, `_classFragmentation`): `RATES[cls].unit`
(rates.js's QS/BOQ table, already shipped) names each class's real physical measure. A class is
"fragmented" — real geometry diverges from real installable units — ONLY when its OWN measured
average bbox area (exact `analysis_sidecar.js` dominant-face formula) is below 1 m² ("smaller than
a floor tile", this file's own earlier phrase, now the actual test). Measured on Terminal: `IfcPlate`
avg 0.074 m² → fragmented, area-weighted. Every OTHER `M2` class present — `IfcSlab` 22.7 m²,
`IfcWall` 40.6 m², `IfcCovering` 65.6 m², `IfcRoof` 91.4 m² — has a normal per-element size and stays
count-based; blanket-applying area-weighting to all `M2` classes was tried and REJECTED (measured:
`IfcWall` would jump from ~14 days to ~563 days with zero evidence it needed it). Terminal
Superstructure: **968 → 111 days**. Duplex: byte-identical output, zero regression (confirms this
only fires where real fragmentation exists).

**3. §PHASE_OVERLAP_BAND** (`schedule_author.js` `materializeDefault`/`scheduleContiguous` +
`time_machine.js` `_cap` overlay): conventional construction "Line of Balance" flowline scheduling —
a phase now starts once the leading trade clears ONE real band (`elements_meta.storey`, not an
invented fraction), not the whole building project-wide. Terminal Architecture: day 1189/1264 (94%)
→ day 27/229 (12%). Hospital Architecture: day 902/1064 (85%) → day 152/799 (19%). Terminal total:
**1264 → 229 days**. Hospital total: 1064 → 799 days (no fragmentation found on Hospital — matches
the user's own live read, "Hospital is fine").

**⚠ Real risk found and fixed pre-ship, not theoretical:** overlapping task windows can place an
element before its real structural support if the per-task bz-sort doesn't line up across tasks —
measured BEFORE the guard: 447 cross-task support violations on Terminal, 1,929 on Hospital
(mostly beams/slabs/MEP scheduled ahead of the wall carrying them, e.g. `IfcBeam on
IfcWallStandardCase`). Fixed with a global cross-task correction pass — same "push after, never
before" mechanism `§4D_HOST_BEFORE_HOSTED` already uses, just extended across tasks instead of
within one: process every element in ascending `base_z` (a valid topological order for the support
DAG, already established), push any element whose start precedes its real carrier's end to right
after it. **0 violations after, on both buildings, with no growth in total project span** (the
pushed elements — 2,769/48,428 Terminal, 2,843/63,415 Hospital — had slack within their own already-
allocated window).

**Verification:** headless against real `Terminal_extracted.db`/`Hospital_extracted.db`/
`Duplex_extracted.db` (sql.js, no browser needed for the scheduling math) — no invented numbers,
`RATES`/`LABOR_RATES`/`elements_meta`/`element_transforms` only. `witness_cpe_work_pacing.js` 9/9
green both buildings (film-revert correctness). `witness_stagger_support_order.js` unaffected
(different, untouched code path — the non-`_cap` generative ScheduleGate fallback). Browser smoke
test (Terminal, headless Chrome) — zero console/page errors from the change. `sw.js` `CACHE_VERSION`
v932→v933 + `cinema_maxq.js`/`time_machine.js`/`schedule_author.js` precache versions bumped.

⛔ **Not re-measured yet, named for a future session:** the doc's own item 3 from "Once 1+2 land,
re-measure whether §CPE_EVEN_PHASE_PACING/§CPE_PHASE_STAGGER are still needed" is now moot — they
were REMOVED outright per direct user ruling, not conditionally kept pending a re-measure. If a
future session ever sees "the film reads flat/monotonous again," that is a DIFFERENT complaint from
tonight's (this fix corrected the DATA the film reads) — check the calendar/scrubber first, per the
GENERIC RULE table below, before reintroducing any film-layer pacing hack.

## ✅ USER-CONFIRMED GREEN, 2026-08-02 — the ORDERING defect is CLOSED on a live bake
User, on the Hospital generated 4D: *"the Time Machine 4D schedule generated works well now.. no more
roof coming on before the walls or upper deck forming before lower. I can confirm at Day 282."*
That is §4D_BAND_MONOTONIC (PR #1129, `fc58210`, sw v913, `_GANTT_CACHE_VERSION` 6→7) + §4D_ROOF_LOAD_PATH
(#1120) + the cache bump (#1123) that let #1120 reach a browser at all. The headless witness said
non-structure cross-storey inversions **29,824 → 0** and the user's eyes now agree on a real film.
**Do NOT reopen roof-before-walls or upper-before-lower.** They are settled by measurement AND by live
confirmation. The item below is a DIFFERENT invariant (support), not a regression of this one.

⚠ **One number to reconcile, not a defect claim:** `witness_4d_band_monotonic.js` measured project span
**176d** on Hospital, but the live badge reached **Day 282**. Either the badge counts calendar days
against the witness's working-day span, or the live generate differs from the witness's inputs. Read
`§CPE_DAY_COUNTER` + `§GANTT_CACHE_SAVE` in the next bake log HEAD before treating either as wrong.

## ✅ §Z_STACK_XRAY_STAGING — DONE, shipped PR #1139 (2026-08-03). Search `§Z_STACK_XRAY_STAGING`
below for the full spec/build record. The 2026-08-02 RESUME item that used to sit here is closed —
do not re-read it as an open task. See §CPM_DUAL_ELEVATION and §SUPPORT_ORPHAN (end of file) for the
11-shape-measured-floor follow-on research from 2026-08-03, also closed (parked, no PR, by design).

## ✅ §PHASE_DURATION — BUILT AND MERGED (bim-ootb PR #1150, `5514d94`, sw v930, 2026-08-03)
**Fix:** `schedule_author.js` `materializeDefault()`'s flat `phaseDays:30`-per-phase width replaced
with workload-proportional width: Σ per-trade labor-seconds (already-extracted `LABOR_RATES`
productivity, via a parameterized `_installSecs` — same formula as `time_machine.js`
`getInstallSecs`) ÷ that trade's `max_crews` (also already-extracted, previously unused anywhere),
taking the SLOWEST trade in the phase as its duration (trades within a phase already run in
parallel — this file's own §A.3 principle). Same bug found and fixed in `scheduleContiguous()`
(the blank-model "originate the dates" flow) — the original investigation missed this second call
site; it re-derives workload from `task_elements`/`elements_meta` since `materializeDefault`'s
phase objects aren't persisted. All 3 live callers (`schedule_editor_ui.js` ×2,
`schedule_author_ui.js` ×2) updated to pass `laborRates`.

**Two design points the user ruled on 2026-08-03/04, with real numbers, before building:**
- Pure Σ-seconds/1-crew (the resume note's literal wording) gives Terminal a **10.2-year total**,
  Superstructure alone **2,922 days** — measured, rejected as unrealistic before any code shipped.
- `max_crews` applied, **bottleneck trade (max, not sum)** across a phase's trades → **~3.5 years
  total, Superstructure ~968 days** (still ~75% of the project — correctly dominant, not absurd).

**Witness:** `witness_phase_duration.js` (bim-ootb root), real `Terminal_extracted.db`, 5/5 green.
G4 hand-computes the STEEL_ERECTOR-bottleneck day count independently from the shipped `rates.js`
numbers alone and it matches the code's output exactly (968d). Full existing author/schedule
witness suite (9 files) re-run green, no regressions.
`sw.js` `CACHE_VERSION` v929→v930 + the 3 changed files' precache-busting `?v=` bumped in the same
PR (all 3 are precached — the standing landmine this project has hit before).

⚠ **CORRECTION, same session:** the "6.7x thinner per frame" reasoning above was WRONG for the
Cinema MaxQ film specifically. `§CPE_BUILDUP_WORK_PACED` (`cinema_maxq.js`/`time_machine.js`
`tmWorkSchedule`) makes the film advance by ELEMENTS PLACED, not calendar days — "10% of the film
is 10% of the building" on any model, BY DESIGN, precisely so bursty derived-4D timestamp
clustering can't wreck the film. That means §PHASE_DURATION's calendar-date fix is invisible to
the MaxQ film's own frame-by-frame pacing: Superstructure (72.4% of elements) ate ~72% of the
FILM's runtime before AND after this fix — calendar duration was never what the film reads. What
§PHASE_DURATION DOES fix for real: the interactive Time Machine calendar scrubber, the on-screen
day-counter badge, the Gantt chart, and any 4D/5D variance report — everything that reads dates
directly. See §CPE_EVEN_PHASE_PACING below for the fix that actually touches the MaxQ film.

## ✅ §CPE_EVEN_PHASE_PACING + §CPE_PHASE_STAGGER + §CPE_SETTLE_HOLD — BUILT AND MERGED (bim-ootb PR #1153, sw v932, 2026-08-04)
**The real fix for "2 min movie needs to be even or sensible."** §PHASE_DURATION only changes
calendar dates, which `_workCursorAt` (the MaxQ film's cursor) never reads — it paces by element
RANK. Terminal's Superstructure (72.4% of 48,428 elements) always ate ~72% of the film's runtime,
unaffected by any calendar-duration fix. Confirmed live in this session (`§CPE_EVEN_PHASE_PACING`
witness numbers below) before any code was written.

**§CPE_EVEN_PHASE_PACING:** `tmWorkSchedule()` groups ops by phase (`kernel_ops.parameters.phase`,
already carried, set by `§PLAYBACK-STAGGER`) and `_workCursorAt` gives every phase an EQUAL film
segment, work-paced (element-rank) within it — same discipline that made global work-pacing
correct in the first place, just scoped per-phase instead of globally. Terminal: Superstructure
968d → still 20% of the film's runtime like every other phase, not 72%.

**§CPE_PHASE_STAGGER:** a fully isolated equal segment still reads as monotonous tiling for a
visually homogeneous phase (Terminal's 33,324 near-identical Metal Deck `IfcPlate`) — user's own
diagnosis, unprompted: *"i noticed that superstructure metal deck mostly slow roof tiling.. thus it
is best to stagger such phases together."* Confirmed as a GENERAL rule, not Terminal-specific (any
building where one class dominates — curtain-wall, brick coursing, duct runs — has the same
failure mode). Each phase's window now starts 20% of a segment-width EARLY, borrowed from the
PREVIOUS phase's tail: `cursor(t) = max` over every phase's own individually-monotonic
contribution — max of monotonic functions is itself monotonic, so this needed no boundary
special-casing (the exact class of bug below). `_phaseWindow`/`_phaseCursorAt` are the single
source of truth both `_workCursorAt` and `_ghostGroundArm`'s inverse lookup read, specifically so
they cannot drift into two different clocks again.

**Real regression found and fixed in the same session:** `_ghostGroundArm`'s precomputed
`elementsFirstT` inverted the OLD flat-global-rank cursor mapping (a rank ÷ total). The moment
phase-segmented pacing landed, that inversion silently went stale — same bug class as
`§GHOST_GROUND_LIVE_TRIGGER` (PR #1149, fixed 2026-08-03 for a DIFFERENT pacing-domain change).
Caught by `witness_cpe_ghost_ground.js` G-GG-12a (1/15 red), root-caused, fixed by inverting
through the same shared `_phaseWindow` the forward cursor uses — 15/15 green after.

**§CPE_SETTLE_HOLD (separate, user-reported mid-session):** the Cinema Path Editor's "Settle" band
(where the dive lands) imposed a fixed, unconfigurable ~0.8s pause (`CINEMA_SPIN_MIN_SEC`) even
with nothing authored — user: *"it still paused for a second when nothing is set for it.. remove
imposed pause. Let user set in Hold."* Root cause: band 0's own `hold` field was being swept into
the WALK beat's duration (`out`), a beat the settle point isn't even part of, so a typed Hold value
did nothing visible AT Settle. Fixed: band 0 excluded from the walk-hold collection, floor reduced
to a technical minimum (0.05s, avoids a literal zero-length beat), and the settle band's Hold now
correctly buys the SPIN beat's real dwell. Verified directly: default (nothing authored) spin
duration 0.57s (was pinned at 0.8s); Hold=2s adds exactly 2.000s to the beat.

**Witnesses:** `witness_cpe_work_pacing.js` rewritten for the new invariants — 11/11 green,
Terminal + Duplex (real Terminal counts: Superstructure=35,061 → exactly 20.0% film share at every
sampled fraction, `overlap=0.2` boundary values match the analytic `OVERLAP/(1+OVERLAP)=16.7%`
exactly). `witness_cpe_ghost_ground.js` 15/15 both buildings. `witness_cpe_buildup_topout.js`,
`witness_cpe_stick_hold.js`, `witness_cpe_stick_approach.js`, `witness_cpe_walk_budget.js` all
re-run clean — 2 pre-existing unrelated failures confirmed via `git stash` diff (a Duplex
heading-sweep coverage gap, and a stale `swing===1.6` assertion against the shipped `1.45`
constant), neither caused by this change.

⛔ **Named, not built tonight — user asked, deliberately deferred, don't fold in silently:**
**within-phase day-batching** — user: *"as long the first day is slower... equal large similar sets
be hurried though staggered a day apart etc."* A DIFFERENT mechanism from phase-to-phase overlap
above (this is WITHIN one phase's own homogeneous population) — batch same-day completions into
visible "pulses" instead of one smooth per-element ramp, mimicking real construction rhythm.
⚠ Must be a PRESENTATION technique, not literal re-clustering — `§CPE_BUILDUP_WORK_PACED` already
fixed AWAY bursty/clustered reveal as a defect; re-clustering the schedule itself would walk that
back. Needs its own measurement before building (start with: does the current `_cap` linear i/n
distribution even produce real day-buckets to batch, or does it need synthetic grouping — and if
synthetic, is that "presentation" or "invention"? Answer that FIRST.)
**→ ANSWERED 2026-09-01: see §BUILDUP_DAY_BATCH_FEASIBILITY at the bottom of this file — measured
NO-GO (no real day-buckets exist; a daily pulse raises Hospital's worst frame 94→399 = ~4x worse).**

⛔ **Also named, not built — separate, bigger scope, user-identified 2026-08-04:** Terminal's walls
(Architecture phase) start at calendar day 1,189 of 1,264 (94% into the project) because
`materializeDefault` sequences phases STRICTLY contiguously — phase i+1 never starts until phase i
is 100% done, project-wide. This predates §PHASE_DURATION but was invisible until Superstructure's
duration became realistic (968d). Not a classification bug (`IfcWall→Architecture,seq:6` is
correct, standard sequence) — it's the scheduling MODEL. Real fix needs overlapping-phase
scheduling in `materializeDefault` (the resource-cursor-per-band model `injectGantt`'s OLDER,
separate generative path already has, per this file's own §A "True parallel trades ✓" — but
`materializeDefault` never inherited it). Bigger than tonight's scope; `§CPE_PHASE_STAGGER` above
only fixes the FILM's visual overlap, not the underlying calendar dates.

## ▶ RESUME 2026-08-04 (deeper) — ROOT CAUSE FOUND: over-fragmented data, and the film fix was the WRONG LAYER
**Supersedes the "generic rule" section below on WHERE to fix this — that section's 3-gap table is
still accurate description, but item 3 undersells how big a problem this is, and items 2's own fix
(`§CPE_EVEN_PHASE_PACING`/`§CPE_PHASE_STAGGER`) is now suspect and should probably be REMOVED, not
kept, once the real fix below lands. Two user questions, both answered with real numbers, both
"yes":**

**Q1 — "is it logical to have so much time on similar metal tiles?" NO. Measured on
`Terminal_extracted.db`:**
```
33,324 "Metal Deck" IfcPlate elements
avg bbox 0.496m x 0.150m = 0.074 m² each (tight range 0.021-0.075 m² — uniform, not a few outliers)
total roof deck area = 2,470 m²
```
0.074 m² is smaller than a floor tile — far below a real corrugated-deck sheet (several m², handled
as one unit by a crew). The IFC export fragmented the deck geometrically (one piece per corrugation
rib or tessellated face, almost certainly), not into installable units. `LABOR_RATES.STEEL_ERECTOR
.productivity.IfcPlate=12/day` was calibrated for a real PLATE-sized unit; charging 40 minutes of
crew time to EACH of 33,324 slivers is the direct, honestly-computed-but-wrongly-premised cause of
Superstructure's 968-day duration. **`§PHASE_DURATION`'s formula is not wrong — its INPUT (treating
element COUNT as a proxy for real installable quantity) is wrong for over-fragmented classes.**

**Q2 — "movie hastens/staggers, that is cross lining, not separation of concern." AGREED.**
`§CPE_BUILDUP_FOLLOW_TM`'s own rule, already on record in this file: *"the buildup PLAYS the Time
Machine timeline, it does not author one."* `§CPE_EVEN_PHASE_PACING`/`§CPE_PHASE_STAGGER` (tonight,
PR #1153) make the FILM re-author pacing that the schedule DATA does not say — concretely, the
on-screen day-counter badge (reads real dates off the same staggered cursor) would now race through
968 days in one-fifth of the film and crawl through 14 days in another fifth: the renderer telling a
story the Gantt/scrubber/day-counter simultaneously contradict. That is the layering violation
named. It shipped because the FILM was fixable same-session and the DATA fix (below) is bigger —
expedient, not correct.

**THE RIGHT FIX, in the correct layer (schedule data, not the renderer), two parts:**
1. **Weight labor by real installed QUANTITY, not raw element count**, for any class where geometry
   fragmentation and installable units diverge — reuse the SAME 5D quantity-takeoff machinery
   already extracted in `analysis_sidecar.js` (`compute5D`'s dominant-face-area expression:
   `MAX(bbox_x,bbox_y,bbox_z) * second-longest edge`), not element count, as the productivity
   denominator. Needs its own measurement first: does area-weighting bring Superstructure down to a
   plausible span, and does it hold up on a building where IfcPlate genuinely IS one-plate-per-unit
   (don't silently break the case §PHASE_DURATION already got right there)?
2. **Overlapping-phase scheduling in `materializeDefault`** (already named in the generic-rule
   section below) — walls starting at 94% of the calendar is the SAME strict-contiguity root cause,
   independent of part 1.
3. **Once 1+2 land, re-measure whether `§CPE_EVEN_PHASE_PACING`/`§CPE_PHASE_STAGGER` are still
   needed at all.** If the calendar itself becomes honest (real quantity, real overlap), plain
   element-rank playback (`§CPE_BUILDUP_WORK_PACED`, unmodified) may already look reasonable — in
   which case the film-layer stagger hack should be REMOVED, not kept alongside a now-correct
   schedule (two sources of pacing truth is itself the anti-pattern being corrected here). Do not
   assume removal is safe without measuring; state it as the question a future session must answer.

⚠ **Do not re-attempt an area-weighting fix by guessing a conversion factor.** Extract the real
`analysis_sidecar.js` quantity expression verbatim (same non-invent discipline `§PHASE_DURATION`
already followed for `LABOR_RATES`/`getInstallSecs`) — do not invent a m²/day rate not already in
`LABOR_RATES` or derivable from it.

## ▶ RESUME — GENERIC RULE: "tight, movie-sense pacing" has TWO consumers, only one is fixed
**Session close-out 2026-08-04, live confusion caught in the act — record it so it isn't re-walked.**
User watched Day 422/1264 on the Time Machine scrubber, still inside Superstructure, and read that
as "still not tight" — but the scrubber and the Cinema MaxQ movie are DIFFERENT consumers of the
SAME schedule, and only one of tonight's fixes touches either of them:

| consumer | reads | fixed tonight? |
|---|---|---|
| Time Machine day/hour scrubber, Gantt mini-chart, day-counter badge | REAL CALENDAR DATES (`schedule_start`/`finish`) | ❌ no — `§PHASE_DURATION` makes the dates workload-real, it does not make them EVEN |
| Cinema MaxQ baked film (Alt+C) | ELEMENT RANK via `_workCursorAt` (never reads dates) | ✅ yes — `§CPE_EVEN_PHASE_PACING`/`§CPE_PHASE_STAGGER` |

Dragging the scrubber to Day 422 and finding Superstructure still building is CORRECT behaviour,
not a regression — Superstructure legitimately owns 968 of 1,264 calendar days (76.6%) because that
is its real workload. **To see tonight's actual fix, bake with Alt+C and watch the exported film,
not the scrubber.** The scrubber will only feel "tight" once the CALENDAR itself is tight, which is
the still-open item below.

**The GENERIC rule, stated for any building (not Terminal specifics):** tight/movie-sense pacing
requires closing THREE gaps, in this order of leverage — each is independent, each already has a
witness-proven design or an explicit reason it's deferred:
1. **Calendar durations must be workload-real.** ✅ DONE, generic — `§PHASE_DURATION`
   (labor-seconds ÷ max_crews, bottleneck trade) has no Terminal-specific constant in it; it reads
   whatever `LABOR_RATES`/`SEQUENCE_RULES`/`elements_meta` the building provides.
2. **The FILM must not give screen-time proportional to element count.** ✅ DONE, generic —
   `§CPE_EVEN_PHASE_PACING` (equal segment per phase) + `§CPE_PHASE_STAGGER` (20% lead-in overlap
   for a homogeneous phase) key off `kernel_ops.parameters.phase`, which every building's generated
   OR captured schedule already carries. No population-size assumption, no hardcoded phase name.
3. **The CALENDAR must not be strictly phase-contiguous.** ⛔ NOT DONE, generic problem — ANY
   building where one phase's real workload dominates (not just Terminal's steel deck — brick
   coursing, curtain-wall glazing, duct runs on other buildings) will push every LATER phase's start
   date out to nearly the project's end, because `materializeDefault` places phase i+1 only after
   phase i is 100% complete, everywhere. This is what still makes the SCRUBBER feel wrong. Fix is
   overlapping-phase scheduling (the resource-cursor-per-band shape `injectGantt`'s older generative
   path already has, per this file's §A "True parallel trades ✓" — never ported to
   `materializeDefault`). This is the highest-leverage remaining item: it's the one that makes the
   INTERACTIVE experience (scrubber, day-counter, Gantt bars) match what Alt+C's film already shows.

**Also still open, named 2026-08-04, unchanged:** within-phase day-batching (item 2's addendum —
batch a homogeneous phase's reveal into visible daily "pulses" instead of one smooth ramp; must be
presentation-only, `§CPE_BUILDUP_WORK_PACED` already fixed away literal re-clustering as a defect).

**Do NOT re-diagnose "still not tight" as a cache/deploy problem again** without first checking
which of the two consumers (table above) was actually being watched — that cost real turns tonight.

## ▶ (superseded) RESUME 2026-08-04+ — the phase-duration fix, BUILT above
**User's "Architecture all done on day one" report is diagnosed — search `## 2026-08-03 —
INVESTIGATION ONLY` below for the full evidence trail.** Verdict: user's own hypothesis ("no
staggering within a phase") is WRONG — that logic exists, works, and is witnessed
(`time_machine.js:3860-3951`, §STAGGER_SUPPORT_ORDER, PR #1133). **The real bug is phase-level, in a
different file:** `viewer/schedule_author.js` `materializeDefault()` (lines 164-183, called from
`schedule_editor_ui.js:503`/`:654` with a hardcoded `phaseDays:30`) gives every phase the SAME
fixed-width calendar slot regardless of population. On Terminal, Superstructure is 72.4% of all
48,428 elements (33,324 `IfcPlate` "Metal Deck" alone) AND scheduled first — same slot width as
Finishes' 258 elements — so a huge share of the whole building lands in the first 10% of the
calendar (`workInFirst10%OfCalendar=51.7%`, measured) even though within-phase staggering is
working correctly. "Architecture" was misattributed — it's 3rd of 5 slots and the 2nd-smallest
bucket; Superstructure's mass is what reads as "done."
**Fix target: phase-window duration must be workload-proportional** (element count, or better,
labor-days via the already-extracted `LABOR_RATES`/`getInstallSecs` productivity table) instead of
the flat `phaseDays` constant. Do NOT touch `time_machine.js`'s within-phase distribution — it's
correct and witnessed, not the defect. Spec the exact proportionality rule before building — this
project's standing rule, and this file's own history (§ROOT CAUSE, §ELEMENT_CPM) is full of
sessions that built before specifying and had to redo the measurement.

## ▶ (superseded 2026-08-02) earlier resume — the §ELEMENT_CPM ruling item
**ONE open item, specced and de-risked, needing ONE user ruling before code.**

**USER-CONFIRMED LIVE, 2026-08-02, on a FRESH generate from a CLEARED IndexedDB** (so this is the
current rules, not a stale gantt cache): *"Still noticing from cleared IndexDB initial Time Machine
has beams without support."* This is EXACTLY what `audit_support_roleblind.js` measures — **1,294
`IfcBeam` bearing on walls** are scheduled before those walls, out of 6,778 total / 2,379 structural.
The live symptom and the headless number are the same defect. **No re-diagnosis needed.**

**DO NOT re-attempt the five pass-level repairs** — all built and measured 2026-08-02, all rejected,
table + reasons in `§ROOT CAUSE — CONFLICTING SORT ORDERS` at the END of this file. Read that first.

**THE FIX IS SPECCED:** `§ELEMENT_CPM` (last section of this file). Element-level precedence is
EXTRACTED from geometry, not authored — the user's own framing, and it is correct: *"Isn't CPM for
Phase level? CPM at element level is what supposed to be granted innately."* The header's
"No CPM/dependency solving (planner's)" scopes out PHASE-level authored programmes and still does.
It never scoped out extracted element precedence. **My earlier framing of this as a scope widening
was WRONG and the user corrected it.**

**⛔ THE ONE RULING NEEDED BEFORE BUILDING:** 21,502 element pairs where extracted geometry says
*wall before beam* and the trade convention says *structure before walls*. That is the cycle. My
reading is that Ruling A already settles it — "nothing without support" is the hard role-blind gate,
floating wins over ordering — so **SUPPORT WINS and the trade edge is dropped, with every drop
counted in a `§` line**. Get the user to confirm or override, then build.

**Gates that must ALL pass (the trap of this lane is passing one by breaking another):**
`node audit_support_roleblind.js` → 0 · `node tests/test_schedule_gate.js` → 0 floating ·
`node witness_4d_band_monotonic.js` → T2a 0, T2b ≤ 551, T4 span ≤ 2× · run from a `/tmp/wt-*` worktree.

**State:** `origin/main` = `fc58210`, scheduler byte-for-byte shipped, all witnesses green.
Audits live on branch `fix/helipad-roof-separation` (`a40cf16`) — **audits only, scheduler reverted**.

## Gantt Accuracy & User-Editable Construction Schedule

### Goal
Make the Time Machine's auto-generated construction sequence **truthful** — matching how buildings are actually built — and give users a **modifiable JSON schedule** they can edit to customize the playback.

### Current Problems

1. **Roofs built too early**: `IfcSlab` elements on roof storeys get `sequence:4` (Superstructure) instead of `sequence:8` (Architecture/Roof). The sort is `sequence → storeyRank`, so a roof slab with seq=4 appears before ground-floor walls (seq=6). Fix: check storey name AND ifc_class together — slabs on "Roof" storey should be treated as roof elements.

2. **Storey rank fragile**: `storeyRank()` (time_machine.js) uses string matching on storey names. Names like "Level 1", "01 - Ground", "Roof Terrace" can misparse. Need robust parser or fallback to Z-coordinate.

3. **No true parallel trades**: Current code says "parallel" but actually sequences within same `(sequence, storey)` group. Real construction has overlapping trades — electrician rough-in starts while mason is still on walls. Resource-based parallelism using LABOR_RATES crews is not implemented.

4. **Working hours naive**: Hardcoded 7am–3pm, no weekends, no holidays. Start date = today minus N days (arbitrary).

5. **No user control**: SEQUENCE_RULES and LABOR_RATES are hardcoded in `rates.js`. Users cannot modify the schedule without editing source code.

### What Must Happen

#### A. Fix Sequence Accuracy — **DONE (S253e)**

1. **Storey-aware class mapping** ✓: Roof slab override — `IfcSlab` on "Roof" storey → seq=8 with `§GANTT_OVERRIDE` log.
2. **Robust storeyRank** ✓: Replaced Z-gap banding with storey-name bands ranked by min center_z. Terminal: 2 Z-bands → 23 storey-bands.
3. **True parallel trades** ✓ (was already implemented): `resourceCursor[resource|band]` gives per-resource-per-band cursors. Different trades overlap on same band.
4. **Phase dependencies** ✓ (was already implemented): `bandSeqDone[band|seq]` ensures higher seq waits for lower seq within same band (not globally). Structural Z-dependency propagates band-to-band.

#### B. User-Editable Schedule JSON

1. **Check for existing schedule**: On time machine activation, look for `construction_schedule.json` in the DB or as a URL parameter `?schedule=URL`.

2. **Auto-generate if missing**: If no user schedule exists, generate one from `injectGantt()` logic and store as JSON in the DB (table `tm_schedule` with one TEXT column `json`).

3. **JSON schema** (create `deploy/dev/construction_schedule.schema.json`):
   ```json
   {
     "projectStart": "2025-01-06T07:00:00",
     "workHours": { "start": 7, "end": 15 },
     "workDays": [1,2,3,4,5],
     "phases": [
       {
         "name": "Substructure",
         "sequence": 1,
         "trades": ["CONCRETE_GANG"],
         "ifcClasses": ["IfcFooting", "IfcPile", "IfcReinforcingBar"]
       }
     ],
     "overrides": {
       "guid-xxx": { "sequence": 8, "phase": "Roof", "startAfter": "guid-yyy" }
     },
     "resources": {
       "CONCRETE_GANG": { "crewSize": 1, "dailyCapacity": 50 },
       "STEEL_ERECTOR": { "crewSize": 1, "dailyCapacity": 30 }
     }
   }
   ```

4. **Export button**: Add "Export Schedule" button to time machine panel → downloads `construction_schedule.json`.

5. **Import button**: Add "Import Schedule" button → user uploads modified JSON → re-injects kernel_ops → replays with new schedule.

6. **DIY flow**: User exports → edits in any text editor → re-imports → sees updated construction sequence in time machine. No code editing needed.

#### D. Unify Gantt Chart with kernel_ops (Single Source of Truth)

**Current state (S253d done):** Gantt now reads kernel_ops when hourglass has been activated:
- `main.js`: `4D_SCHEDULE_REQUEST` handler relays kernel_ops + guidRows via BroadcastChannel
- `boq_charts.html`: `buildScheduleFromOps()` builds scheduleData from kernel_ops, `generateSchedule()` as fallback
- GUIDs relayed from viewer directly (no IndexedDB cache dependency)
- Sync badge shows "Hourglass OK" or "Run Hourglass first"
- Tests: `test_s253_gantt_sync.js` (111 assertions), `test_s253_real_db.js` (Terminal 48k elements)

**Known issues from S253d session:**
1. ~~`§KO_BUG phase order: Architecture day=1117 AFTER MEP Final day=2`~~ **FIXED (S253e)**: Replaced Z-gap banding (1.5m threshold → only 2 bands for Terminal) with storey-based banding from `elements_meta.storey` ranked by min center_z. Terminal now has 23 storey-bands. Phase order correct: Superstructure → MEP Rough-in → Architecture → MEP Final → Finishes. Also added roof slab override: `IfcSlab` on "Roof" storeys → seq=8 with `§GANTT_OVERRIDE` log.
2. Gantt chart disappeared after deploy — `_TRL.t_gantt` threw when `_TRL` undefined. Fixed with fallback `(_TRL && _TRL.t_gantt || '4D — Gantt Timeline')`. T12 test catches this.
3. Stale browser cache — sw.js CACHE_VERSION not bumped, index.html sw.js?v=N not bumped. User saw old code for hours. T13 test now verifies local + OCI versions match. **Always bump sw.js + index.html + run T13 before deploy.**

**Previous state (pre-S253d):** Two independent schedule generators existed with different algorithms.

**What must happen:**
1. `kernel_ops` is the single source of truth for construction schedule
2. `boq_charts.html` must **read** `kernel_ops` instead of running its own `generateSchedule()`
3. Gantt dashboard scrub (`4D_SEEK`) should map to `kernel_ops` timestamps, not independent task indices
4. `ghostglass.js` should be retired or adapted — the hourglass `renderAtTime()` already does visibility control. Two competing animation systems (ghostglass material transitions vs time_machine visibility) will fight if both are active.
5. When user opens Gantt chart from a building that already has `kernel_ops` (from hourglass session), the chart should visualize those ops immediately — no re-computation.

**Migration path:**
- Phase 1: `boq_charts.html` reads `kernel_ops` via BroadcastChannel `4D_QTO_REQUEST` relay (already exists for QTO data). Add a `4D_SCHEDULE_REQUEST` message type that returns kernel_ops as JSON.
- Phase 2: Gantt dashboard renders bars from kernel_ops timestamps. Scrub sends cursor timestamp (not task index) to viewer.
- Phase 3: Viewer receives timestamp → calls `renderAtTime(timestamp)` directly. No ghostglass needed.

### Key Files
- `deploy/dev/time_machine.js` — `injectGantt()` (line 853), storey-based banding (line 903), scheduling loop (line 984)
- `deploy/dev/rates.js` — `SEQUENCE_RULES` (line 154), `LABOR_RATES` (in template loader), `SEQUENCE_DEFAULT` (line 212)
- `deploy/dev/boq_charts.html` — existing Gantt chart (independent `generateSchedule()`, not wired to kernel_ops)
- `deploy/dev/ghostglass.js` — glass-to-solid animation, BroadcastChannel driven, to be retired
- `deploy/dev/main.js:183-209` — BroadcastChannel handler for `4D_PLAY`/`4D_SEEK`/`4D_RESET`

### Architecture Context
- `kernel_ops` table stores `(timestamp, op_type='ELEMENT_PLACE', parameters JSON, output_guid)`
- `parameters._end_ts` gives element completion time
- `renderAtTime(cursor)` reads kernel_ops via `_ops[]` array, sorted by `start_ts`
- `SEQUENCE_RULES` maps IFC class → `{phase, sequence, resource}`, longest key match wins
- `LABOR_RATES` (from template JSON) maps resource → `{productivity: {IfcClass: unitsPerDay}}`
- Current parallel: different `(sequence, storey)` groups can overlap. Same group = sequential.
- BroadcastChannel `bim_4d` already relays between viewer and boq_charts — extend, don't replace.

### Acceptance Criteria
- Roofs built AFTER walls on same storey, never before
- Basement/substructure first, ground floor second, upper floors bottom-up, roof last
- MEP rough-in overlaps with architecture on same storey (different trades)
- Same trade on same storey = sequential (one crew)
- `§GANTT_OVERRIDE` log shows any storey-based sequence corrections
- `construction_schedule.json` exportable from time machine panel
- Imported JSON regenerates kernel_ops and replays correctly
- Desktop and mobile playback unaffected
- `?tm=play` shared link still works
- Gantt dashboard scrub syncs with hourglass — same elements light up at same timestamps
- `§4D_SCHEDULE` log confirms Gantt reads from kernel_ops, not generateSchedule()

#### C. Construction Visual Effects

Current: frontier = orange, recent = yellow, placed = solid. Flat and instant.

Target: elements should **glow into existence** with a brief explosive/radiant feel, then cool down:
1. **Arrival**: element appears with bright emissive glow (white-hot flash, ~0.3s)
2. **Active construction**: transitions to orange emissive (frontier state)
3. **Just finished**: amber/reddish linger that slowly fades (~3 ticks)
4. **Placed**: solid original material, no glow

Implementation: use `MeshPhongMaterial.emissive` + `emissiveIntensity` animation. On each `renderAtTime` tick, elements in frontier get high emissive that decays. Recent elements get diminishing amber emissive. This is a visual-only change — no new data, just material animation in the existing render loop.

**Metal sparks**: When steel elements (IfcBeam, IfcColumn, IfcMember, IfcPlate, STEEL_ERECTOR resource) are in frontier state, add a brief particle burst — a handful of Three.js `Points` with orange-white color, short lifetime (~0.5s), gravity falloff. Simulates welding/cutting sparks. Keep particle count tiny (5-10 points per element) to avoid GPU cost.

Keep it lightweight — no post-processing passes, no bloom shader. Emissive transitions on materials + sparse particle points for metal. On mobile (`_isMobileTM`), skip all effects (current show/hide is fine).

### Testing
- Test on Duplex (simple, 2 storeys, clear roof)
- Test on SampleCastle (multiple storeys, complex storey names)
- Test on HospitalAuckland (MEP-heavy, parallel trades)
- Verify: `§TIME_MACHINE_GANTT` shows correct element count
- Verify: roof elements appear AFTER wall elements in `§` log order
- Export JSON, modify a sequence number, re-import, verify playback changes
- Test on mobile: export/import buttons accessible and functional

---

# §4D_HOST_BEFORE_HOSTED — a window reveals BEFORE its supporting wall (user, observed in a baked film, 2026-07-29)
> User, watching the Hospital MaxQ film: *"that window coming on first, before its supporting walls can
> be noted to harden our 4D generater, its matter of data."*

## Why this matters more than it looks
It is a **build-order correctness** defect, not a cosmetic one, and it is the first thing a scheduler
will notice — before the camera work, before the render. A window cannot be installed before the wall
that hosts it. The whole defensible claim of the Cinema work is *"a film cut against a real 4D schedule
by the engineer who built that schedule"* (`CINEMA_DELIGHT_BATCH.md` §SETTLED 2026-07-29c); an ordering
violation visible on screen undercuts exactly that claim, on the one axis it is being sold on.

**The user's own framing is right: it is a DATA/RULES matter, not a renderer bug.** The buildup now
plays the timeline verbatim (§CPE_BUILDUP_FOLLOW_TM, PR #1082) — so whatever order the generator emits
is what the film shows, faithfully. Fixing this in the camera or the reveal would be the wrong layer and
is explicitly forbidden by that same ruling.

## ⚠ MECHANISM — CORRECTED after reading `viewer/schedule_gate.js` (supersedes the guess below)
> User: *"its again a Z stacking matrix required i reckon"*

**Half right, and the wrong half is the useful part: the Z stacking matrix ALREADY EXISTS and works.**
`schedule_gate.js` is built on it — two passes, both gated on vertical support:
- **PASS A (structure, `seq<=4`)** — bottom-up by `base_z`: an element waits for the structure whose XY
  footprint overlaps it and whose base is below. ε=0.05m so a thin slab under a duct still counts.
- **PASS B (non-structure, `seq>4`)** — by TRADE then `base_z`: waits for the structure under its
  footprint AND for the lower trades in its own Level.

**A window beating its wall cannot be caught by that, structurally: a window is not ABOVE its wall, it
is INSIDE it.** Same Level, same footprint line, overlapping Z range — "whose base is below" has nothing
to bite on. So this is the OTHER axis, not a missing Z relation.

Two candidate causes, needing different fixes — **determine which before building**:
1. **Trade `seq` ordering.** If glazing's trade sorts before the wall's in PASS B, the window wins
   regardless of geometry. Fix is a data/table correction. Cheap. **Check this first.**
2. **No HOSTED-BY relation exists.** The gate has *supported-by* but not *hosted-by*. Fix is a third
   constraint beside the two passes: bbox containment (or the real IFC host link), in the same style as
   the support gate. This is the GENERAL answer — it covers doors, louvres, any opening filler, anything
   recessed into a host.

⚠ **Pre-empt the scope objection:** the file's own header states *"No CPM/dependency solving
(planner's)"*. A hosting gate is NOT CPM — no float, no logic network, no critical path — it is one more
geometric gate of exactly the kind already implemented. Say so when proposing it.

## ~~Likely mechanism~~ — SUPERSEDED, kept only to show what was ruled out
~~A window's `center_z` sorts below its host wall's centroid.~~ **Wrong** — the gate sorts on `base_z`,
where a wall (0.0) is already below a window (sill ~0.9), so plain Z ordering would put the wall FIRST.
The Z axis was never the problem. Read the corrected section above instead.
**Verify first, in this order:** (1) query `elements_meta`/`element_transforms` for a real offending
pair on Hospital and compare their `center_z` AND their emitted `start_ts` — name the actual guids;
(2) confirm whether the two are in the same phase or different ones (if different, the phase order is
the cause and Z is innocent); (3) only then decide where the constraint belongs.

## The rule to add, once verified
**HOST BEFORE HOSTED: an element may not reveal before the element that hosts it.** Applied as a
constraint AFTER the existing sort, never as a replacement for it — the Z/phase ordering is doing real
work and must not be discarded to fix a dependency.
- The host relationship **already exists in this codebase** — see `project_openings_inherit_host_rotation`
  (openings inherit their host wall's rotation), so the pairing is derivable, not new data to invent.
- Scope it to what is provable: opening fillers (`IfcWindow`, `IfcDoor`) → host `IfcWall`. ⚠ **Do NOT
  generalise to "MEP after structure" in the same pass** — that is a different rule with different
  evidence, and bundling them makes both unfalsifiable.
- ⚠ **Prime Directive:** the host link must be EXTRACTED (IFC relationship or measured containment),
  never inferred from proximity alone. A window assigned to the nearest wall by distance is invention.

## Witness claims
- **W-HOST-ORDER (the gate).** For every hosted element on Hospital, `start_ts(host) <= start_ts(hosted)`.
  Report the violation COUNT before and after — before must be > 0 or the defect was never reproduced,
  and a witness that cannot show the RED is not a witness.
- **W-HOST-NO-REGRESSION.** The storey-band bottom-up character survives: the Z-vs-reveal-order
  correlation must not degrade, and `§GANTT_MINI` phase spans must not collapse into each other.
- **W-HOST-COVERAGE.** Report how many elements actually HAVE a derivable host. Elements with none keep
  their current order and are counted, not silently passed.

## Where this sits
Not in the Cinema lane — the film only EXPOSED it. It belongs to 4D generation and should be fixed there,
which also means every consumer (Time Machine playback, the Gantt drawer, 4D/5D variance) gets it.

### ▶ THE A/B IS ALREADY SET UP — the user still holds the path (2026-07-29)
> User: *"that means if the windows stayed back it would have been dramatic"* · *"i still have the same
> path script"*

**Correctness and spectacle point the SAME way here, which is worth stating to any sceptic.** Correct
order is wall first, glazing after — so on the same flight the camera approaches an open frame with the
services exposed and the façade closes over them AS IT WATCHES. The reveal happens in front of the lens
instead of having already happened. The defect did not merely mis-state the build order; **it cost the
shot its drama.** Fixing the schedule sharpens the film rather than sanding it down.

**And the experiment is already controlled.** The user retains the authored Hospital path
(§CPE_IDB_PATH_STORE / the `cinema_path` record). So the fix can be demonstrated as a true A/B: same
camera, same building, same duration, ONE variable changed. **Re-bake that exact path after the fix and
compare against `BIM_MaxQ_Hospital_1785273910881.mp4`** (1852×960, 1186 frames, 79.067 s, 5.31 Mbps —
the reference film, user-accepted 2026-07-29).
- ⚠ Per the FUNDAMENTAL LAW the two films are the DEMONSTRATION, not the proof — W-HOST-ORDER's
  violation count going >0 → 0 is the proof. Keep both; they answer different questions.
- ⚠ The comparison is only valid if nothing else moved. Re-bake from the SAVED path, do not re-author,
  and confirm `§CPE_OPEN src=authored` plus an unchanged band/hose count before baking.

### ⚠ REFRAMED — Hospital did not need a heuristic at all (2026-07-29)
> User: *"cant we make it strictly weigh to Z value?"* → *"then recall the 4d schedule prompts/# and
> look at the CPM"*

**1. Strict Z cannot express it.** A wall CONTAINS its window (wall 0.0→3.0, window 0.9→2.1 inside that
span). Containment is not ordinal, so no weighting of one scalar encodes it — and pushing Z harder
breaks the stacking cases the gate currently gets right.

**2. The CPM data already answers it, and we are discarding it.** From `4D_CAPTURE_AND_FALLBACK.md`
§2.1/§5.2, Hospital's captured IFC programme carries **deps + element links 46/46**, Early/Late
Start/Finish 45/46, Free/Total Float 44/46, IsCritical 45/46 — *"the schema then discards the CPM/float/
WBS/calendar that made it expert-grade."* The widening is **already specced as T1b/§5.2 and never built.**

**So this defect is not a gate bug — it is the FALLBACK running on a building that did not need one.**
A planner already stated wall-before-window; we are throwing the statement away and then re-deriving a
worse answer geometrically. Two tracks, non-competing:
1. **Captured programme → build T1b, use the planner's dependencies.** `schedule_gate` should not be
   ordering Hospital at all. This is the higher-value track and it is already written.
2. **No programme → the geometric gate stays**, and there the HOSTED-BY constraint above is the fix,
   because there is nothing else to appeal to.

⚠ **Boundary unchanged:** capture and replay CPM, **never recompute float** (`4D_CAPTURE_AND_FALLBACK.md`
:359). Reading a planner's stated dependencies is not us solving CPM, and must not become that.
⚠ **Honesty tiers move with this:** a film ordered by captured deps is tier 1 (*linked schedule*); the
geometric gate stays tier 2 (*this model's derived 4D*). See `CINEMA_PATH_EDITOR.md` §5.

---

# §4D_ROOF_LOAD_PATH — a slab's role is DERIVED from what carries it, never from a storey name (spec 2026-08-01)

**User, watching a Hospital buildup:** *"how do we solve the 2 top boxes next to helicopter in Hospital
getting their roofs first before the walls?"* — then, before any code: *"but i like to understand from
the 4D principles we following first so we know what rules we are still missing."*

**⚠ THIS SUPERSEDES §Current Problems item 1 at the top of this file.** That entry proposed *"check
storey name AND ifc_class together — slabs on 'Roof' storey should be treated as roof elements."*
**That fix is already implemented (`time_machine.js:3296`, `/roof/i` + `IfcSlab` → seq 8) and it CANNOT
work.** Measured 2026-08-01:
- Hospital's storeys are `Level 1..7`, `Level 7A`, `Unknown` — **`roofOverrides` fires ZERO times**.
  The two offending slabs' storey is literally `Unknown`.
- LTU_AHouse's top storey is `TAKPLAN` (Swedish for roof plan) — also zero.
Any name list is an invented list. Do not extend the regex. Delete the premise.

## The measured defect — `Hospital_extracted.db`, the user's own two boxes
```
band 67 (z 201..204)          base_z    top_z    bbox_z
  IfcSlab              x2     202.80    203.59     0.80
  IfcSlab                     202.83    203.62     0.80
  IfcWallStandardCase  x8     199.61    203.08     3.47   (…199.61-200.06 base, 203.08-203.35 top)
```
Two slabs bearing on eight wall heads, **all inside one 3 m Z-band**, so the bottom-up rule cannot
separate them and the sort falls through to trade order — `IfcSlab` seq 4 beats `IfcWall*` seq 6.
Roofs first, walls after.

## The three missing rules (stated as principles, in the order they must be fixed)

### M1 — a slab's ROLE is a load-path fact, not a label
`IfcSlab` covers both a floor slab (walls stand ON it) and a roof slab (it stands ON walls). One class
carries one `seq`, and it was set to the floor case. **The rule to add:**
> For each `IfcSlab`, take the walls (`IfcWall*`) whose XY footprint overlaps it. If the slab's
> `base_z` is above the **midheight of those walls** (`(wall.base_z + wall.top_z) / 2`), the slab is
> CARRIED BY them → roof role → `seq = 8`, `phase = 'Architecture'`. Otherwise it stays a floor slab.

**No epsilon, no constant, no name list.** The wall states its own midheight. The discriminator is
enormous in both directions: on the measured case, slab `base_z` 202.80 vs wall midheight ~201.4 →
**1.4 m above** = roof. In the floor case the walls stand on the slab, so `wall.base_z ≈ slab.top_z`
and the slab's base sits a full wall-height *below* midheight. Nothing is near the boundary.

### M2 — "support" is a LOAD PATH, not a trade number
`schedule_gate.js:90` admits only `seq <= 4` into the support grid, and walls are seq 6, so **a wall
can never be found carrying anything**. PASS A schedules every slab before PASS B schedules any wall.
For a rooftop plant box the wall IS the structure. **The rule to add:** an element promoted to roof
role by M1 must be scheduled in PASS B (it is no longer `seq <= 4`), and the walls that carry it must
be visible to its gate. Simplest correct form: M1's reseq to 8 moves the slab into PASS B by itself —
**verify that is sufficient before adding anything to the grid**, and only widen the grid if the
witness proves it is not.

### M3 — the auditor shares the scheduler's blind spot
`auditFloating` (`schedule_gate.js:139`) builds its support grid from `seq <= 4` **too**, so it asks
the same question with the same assumption and returned `floating=0` on a building whose roofs
demonstrably float. Its own header calls it an *"independent XY-aware audit"* — it is not independent.
**The rule to add:** the audit must find a support by GEOMETRY (anything below it, overlapping in XY,
whose `top_z` reaches its `base_z`), not by trade number. Until it does, `floating=0` proves nothing
about this class of defect — which is exactly why the user found it and no gate did.

## Witness claims — `witness_4d_roof_load_path.js`
| gate | proves / disproves |
|---|---|
| G-RLP-1 | **RED today, on the user's own case.** Hospital band 67: both slabs are scheduled BEFORE all eight walls that carry them. After the fix, both start after the last of those walls finishes. |
| G-RLP-2 | the role is derived, not named: with every storey string blanked, the same two slabs are still classified as roofs. A name test scores 0 here; this must score 2/2. |
| G-RLP-3 | a FLOOR slab is NOT promoted — walls standing on a slab keep that slab at seq 4 and before them. Measured on a real floor/wall pair from the same DB, so the fix cannot pass by promoting everything. |
| G-RLP-4 | `§GANTT_OVERRIDE` reports how many slabs were promoted by load path, and the old `/roof/i` count is gone — a stale build cannot silently serve the name rule. |
| G-RLP-5 | M3: the rebuilt audit finds the two floating slabs BEFORE the fix (proving it can now falsify) and reports 0 after. An audit that reads 0 both times is not a gate. |
| G-RLP-6 | no regression in total ops or project window on Hospital and LTU_AHouse: same element count placed, monotone cursor, `§SUPPORT_CHECK` still 0 for everything it already covered. |

## ⛔ Explicitly OUT of scope
- The room-title / caption lane (`cpe_room_title.js`, §CPE_ROOM_TITLE_*) — shipped and working, do not touch.
- `MIN_DWELL` — user ruled it KEPT 2026-08-01.
- Re-keying the Time Machine, changing `sequence_rules.json` seq numbers for any class, or touching
  the captured/linked-schedule path (`source=captured`). This is the GENERATED 4D only.
- Extending the `/roof/i` regex with more languages. That is the premise being deleted.

## §4D_ROOF_LOAD_PATH — BUILT AND MERGED (PR #1120, sw v903, 2026-08-01). Two limits ON RECORD.
**RED→GREEN, the user's own two helipad boxes:** slabs started `2022-07-27` (phase Superstructure)
while the walls carrying them finished `2023-04-30` — **277 days before their own walls**. Now they
start `2023-10-19` as Architecture. Witness `witness_4d_roof_load_path.js` 9/9; Hospital 63415/63415
and LTU_AHouse 122330/122330 placed; `§SUPPORT_CHECK floating=0` on both. Re-run independently by the
dispatching session, not accepted on the builder's report.

**M1 needed a SECOND clause the spec stated in prose but the formula above omitted.** `base_z above
the walls' average midheight` alone promoted **23 of 35** Hospital slabs — including a genuine
intermediate floor at `base_z 176.81` with five levels above it — because a slab that CAPS the walls
below it satisfies that test whether or not it ALSO carries walls above. The shipped rule adds the
spec's own floor-case definition as an explicit test: no XY-overlapping wall may have
`base_z >= slab.top_z`. Still epsilon-free, still no name list. Hospital lands on 10 promoted.

### ⚠ LIMIT 1 — M3's blind spot is NARROWED, NOT REMOVED. Do not read `floating=0` as proof.
The rebuilt audit still keys on **trade number** (`T.seq > 4`) with one extra branch, not on geometry
as this spec's M3 asked. `witness_4d_roof_load_path.js` G-RLP-5 feeds `seq=8` in BOTH its RED and
GREEN arms, so what it proves is: *given a slab M1 already promoted, the audit can falsify a bad
schedule where the old one could not.* **It does not prove the audit would catch a roof M1 FAILED to
promote** — such a slab keeps `seq=4`, gets the structure-only pool, and reads `floating=0` exactly as
before. Two wider scopes were tried and rejected with measured false-positive counts (grid = every
element → 3421/10979 on Hospital, mostly beams "floating" over unrelated walls; grid = structure+walls
for every slab → 24, all ordinary floor slabs vs walls on other storeys). A reasoned compromise —
but the geometric audit M3 actually specifies is STILL NOT BUILT.

### ⚠ LIMIT 2 — parapets defeat the rule, silently.
Clause (b) excludes any slab with an XY-overlapping wall standing on it. **A roof with a parapet wall
is ordinary construction** and would be excluded → not promoted → the original defect returns for that
roof, with no log line saying so. On Hospital, (a) alone gave 23 and (b) cut it to 10; the 13 blocked
include genuine intermediate floors (correct) and would include any parapeted roof (incorrect). Not
exercised by Hospital or LTU. **A parapet is a wall whose top is BELOW the tops of the walls it sits
among, and which carries nothing** — that is the discriminator to add when a building exercises it.
Do not fix this speculatively; wait for a model that shows it.

---

# §4D_WALLS_BEFORE_ROOF — #1120 promoted the boxes' roofs and left the roof they stand on (spec 2026-08-01)

> **User, live, on a MaxQ buildup bake of Hospital, 2026-08-01:**
> *"The roof before the walls still happening on the roof top"*

## §4D_ROOF_LOAD_PATH did NOT fail — it fired, and this is what it could not reach
The user's own run logs `§GANTT_OVERRIDE 10 slabs promoted to roof role (seq=8) by load path`. Ten
slabs WERE re-roled. The defect survives that. This section does not re-litigate #1120; it names the
slab #1120 structurally cannot promote and closes it.

**This is `⚠ LIMIT 2` on record from #1120, arriving for real** — and wider than LIMIT 2 predicted.
LIMIT 2 anticipated a *parapet* defeating clause (b). What actually defeats it on Hospital is the two
helipad boxes whose OWN roofs #1120 promoted: their walls stand on the main roof slab, so clause (b)
("no XY-overlapping wall may have `base_z >= slab.top_z`") disqualifies the roof underneath them.
#1120 fixed the boxes and left the roof they sit on. LIMIT 2's proposed discriminator ("a parapet is
a wall whose top is BELOW the tops of the walls it sits among, and which carries nothing") would NOT
have caught this: these walls are 3.05–3.47 m tall and they DO carry something (the box roofs).

## THE MEASUREMENT — Hospital, generated 4D, `origin/main` @ `9945364`
Probe: every `IfcSlab` in `Hospital_extracted.db` (35), each against the walls that physically carry
it (XY-overlap, `wall.base_z < slab.base_z - 0.05`, `wall.top_z >= slab.base_z - 0.5` — the same
carrier test `schedule_gate.js` `auditFloating` already uses), read off the REAL `kernel_ops`
timestamps after `tmActivateForBake()`. Log: `scratchpad/probe_rooftop_main.log`.

```
§PROBE_SUMMARY slabs=35 violating=24 promoted(phase=Architecture)=10
               violating_and_promoted=0   violating_and_NOT_promoted=24
```

**The rooftop row — the user's defect, in numbers:**

| | slab `3Csn1z$1v5Q8DXdumWYJUE` |
|---|---|
| what it is | the topmost main roof slab, 2091.5 m², the building silhouette |
| storey / z-band | `Level 7` / band 66 (the highest band with a slab that is not a box roof) |
| base_z / top_z | 199.66 / 199.81 |
| phase / role | **`Superstructure`, seq 4 — NOT promoted** |
| starts | **2022-07-27** |
| its 14 wall carriers finish | **2023-04-30** |
| error | **277 days before its own walls** |

277 days is the identical figure #1120 reported *fixing*. It was never fixed for this slab — #1120
measured it on the two box roofs (`3eq15PZlbCi8$6xdfFtxpB`, `3Vxmv9vT1DBOVGP9f4HeYO`, base_z 202.80/
202.83) which sit ON this one. Those two now start 2023-10-19. The 2091 m² deck beneath them still
starts 2022-07-27.

## Which of the three candidate causes is real — measured, not chosen
**CAUSE 1 — the load-path role test misses slabs. REAL, and it is the operative cause.**
All 24 violating slabs are non-promoted (`phase=Superstructure`); **0 of the 10 promoted slabs
violate**. Promotion is exactly the thing that fixes the ordering, and the roof-top slab does not get
it. The blocker is clause (b): 3 XY-overlapping walls (`3Vxmv9vT1DBOVGP9X4HeGE` base 199.87,
`3Vxmv9vT1DBOVGP9X4HeDp` and `3eq15PZlbCi8$6xdXFtxz7` base 200.06) stand on it. Clause (a) is
satisfied — the slab is a roof by load path in every respect except that two boxes sit on it.

**CAUSE 2 — the storey BAND. NOT the cause of the defect, but a REAL latent hole in the fix.**
`§GANTT_STOREY_Z reassigned=9457` does not misplace the rooftop walls: the slab's own band is 66,
its carriers sit in bands below it, and the bottom-up `base_z` sort is correct. The band is
irrelevant while the slab is seq 4, because a seq≤4 slab is scheduled in PASS A where walls are not
consulted at all. **But it becomes real the moment the slab is promoted:** a promoted slab's only
dependency on walls is `schedule_gate.js`'s per-*phase* trade gate, keyed on
`collapsePhase(storey)`. This slab's key is `Level 7` while **12 of its 14 carriers are phase-key
`Level 6`** (`{"Level 6":12,"Level 7A":1,"Level 7":1}`). Promotion alone would leave the wait on
those 12 walls to coincidence, not to a rule. Must be closed in the same change.

**CAUSE 3 — the support invariant is wrong. REAL, confirmed, and it is why this survived a merge.**
`§SUPPORT_CHECK floating=0/10979 … (0=solved)` on the very same run in which 24 of 35 slabs start
~290 days before the walls carrying them. `auditFloating` offers its `wallGrid` only to
`T.cls === 'IfcSlab' && T.seq > 4` — i.e. **only to slabs M1 already promoted**. A roof M1 *failed*
to promote keeps seq 4, gets the structure-only pool, and reads clean. This is `⚠ LIMIT 1` verbatim
("It does not prove the audit would catch a roof M1 FAILED to promote") — now demonstrated on a real
slab. A `floating=0` that cannot see the defect being reported is not evidence.

## The rule to add — M4, one clause, measured against the alternatives
**M4 — a wall standing on a roof is not "the next storey" if that wall is itself capped by a slab
already known to be a roof.** A helipad box, a plant enclosure, a coped parapet — their walls top out
in a roof, they do not continue the building. Formally, with the shipped M1(a+b) promotion set as
the seed (computed once, frozen — NOT iterated):

> slab `S` is also a roof if clause (a) holds AND every wall `w` standing on `S`
> (`w.base_z >= S.top_z`, XY-overlap) is *capped by a seed roof slab* `C` — some `C` in the seed set
> with `C` XY-overlapping `w` and `w.base_z <= C.base_z <= w.top_z + GAP`.
> A wall capped by nothing does NOT qualify.

**Depth 1, deliberately, because full recursion was measured and it collapses.** Letting newly
promoted slabs re-enter the seed set cascades straight down the stack: Level 7's box walls excuse the
199.66 deck → the deck excuses `3064w0y0nDv9wdb1cWL_Gu` → Level 6 (191.66) promotes → its walls excuse
Level 5 → Level 4 → the entire building becomes "roof". Depth-1 on the frozen seed set terminates.

**Measured outcome on Hospital (`scratchpad/probe4.py`, same DB, offline replication that reproduces
the shipped count of 10 exactly): 10 → 11.** The single addition is `3Csn1z$1v5Q8DXdumWYJUE`, the
user's slab. Every other candidate is blocked and the reason is logged:

| slab | base_z | walls above | blockers | verdict |
|---|---|---|---|---|
| `3Csn1z$1v5Q8DXdumWYJUE` | 199.66 | 3 | **0 — all capped by the two box roofs** | **PROMOTED** |
| `0e8pm26Tv5vPrj6zU55MQt` Level 6 | 191.66 | 16 | 3 (`3aD_wpAY…` h=0.10 capped by nothing; `1EW479yk…`; `3064w0y0…`) | blocked ✓ |
| `0e8pm26Tv5vPrj6zU55MQv` Level 5 | 186.66 | 54 | 33 | blocked ✓ |
| `0e8pm26Tv5vPrj6zU55MQh` Level 4 | 181.66 | 535 | 514 | blocked ✓ |
| `1OV06Y3c5D8vODNyxVnSVI` (#1120's control) | 176.81 | 56 | 56 | blocked ✓ |
| …9 more intermediate panels at 176.81 | | 1–64 | all ≥1 | blocked ✓ |

**Rejected alternative, measured and discarded:** a footprint-extent ratio (bbox of the walls-above,
clipped to the slab, over the slab's own area). It does not separate — the Level 7 roof scores 0.040
while genuine intermediate panels at 176.81 score 0.024 / 0.024 / 0.029 / 0.044 and Level 6 scores
0.170. Any cut that promotes the roof also promotes at least four ordinary floors. No threshold exists;
this is why M4 is a load-path rule and not an area rule. (`scratchpad/probe3.py`.)

## M5 — the promoted slab must wait for its carriers by GEOMETRY, not by phase key (closes CAUSE 2)
`schedule_gate.js` `computeSchedule` PASS B sorts by `(seq, base_z)`, so walls (seq 6) are always
placed before roof slabs (seq 8) within the same pass. Build a wall support grid incrementally as
PASS B places walls, and gate any `seq > 4` `IfcSlab` on the XY-overlapping walls that carry it
(`w.base_z < S.base_z - EPS && w.top_z >= S.base_z - GAP`) in addition to the existing structure
gate and trade gate. No new pass, no cycle, no new constant — `EPS`/`GAP` are the module's own, and
the pool is **the same pool `auditFloating` already uses for `seq>4` slabs**, so scheduler and
auditor finally test the same thing instead of the auditor being narrowed to match the scheduler's
blind spot.

## M6 — stop the instrument from lying (narrows CAUSE 3 / LIMIT 1)
`§SUPPORT_CHECK floating=0` stays as it is (its scope is defended in #1120), but it must no longer be
the ONLY number. Add a role-blind measurement line so the blind spot is visible in the log rather
than hidden behind a zero:

```
§ROOF_GATE roofSlabs=<n> lateVsWallCarriers=<must be 0> | otherSlabs=<n> lateVsWallCarriers=<n> (frame-first, expected — see LIMIT 1)
```

`lateVsWallCarriers` counts slabs whose `start` precedes the max `end` of their XY-overlapping wall
carriers, computed for EVERY slab regardless of seq. The roof-role half is a **gate** (0 required).
The other half is a **measurement, not a gate** — an ordinary intermediate floor legitimately precedes
the partitions beneath it in a frame-first concrete schedule (this is #1120's rejected "attempt 2",
24 false positives, and it is still the right call). Printing it is what makes LIMIT 1 auditable.

## Witness claims — `witness_4d_walls_before_roof.js`
- **G-WBR-1** RED→GREEN, the user's slab. RED on `origin/main`: `3Csn1z$1v5Q8DXdumWYJUE`
  starts 2022-07-27 (`phase=Superstructure`) while its 14 wall carriers finish 2023-04-30 — 277 days
  early. GREEN: `start >= max(carrier.end)` and `phase=Architecture`.
- **G-WBR-2** no cascade. `§GANTT_OVERRIDE` reports **11** (was 10), and the four named controls —
  Level 6 191.66, Level 5 186.66, Level 4 181.66, and #1120's own floor control
  `1OV06Y3c5D8vODNyxVnSVI` — are all still `phase != Architecture`. The fix cannot pass by promoting
  everything, and specifically cannot pass by re-entering its own output.
- **G-WBR-3** the role is still DERIVED, not named: with every `storey` string blanked, the same slab
  is still promoted. A name test scores 0 here.
- **G-WBR-4** CAUSE 2 is closed by geometry, not luck: 12 of the slab's 14 carriers are phase-key
  `Level 6` while the slab's key is `Level 7`, so the per-phase trade gate provably cannot cover
  them; assert the slab starts at/after the max end **of those 12 specifically**. Also asserted
  directly against `ScheduleGate.computeSchedule` on the real 15-element subset with the trade gate
  neutralised (all carriers given a different storey), where the pre-M5 code returns a start EARLIER
  than the carriers' end and the post-M5 code does not.
- **G-WBR-5** the instrument no longer hides it: `§ROOF_GATE` is present, its roof half is 0, and its
  other half is a non-zero *reported* number. On `origin/main` the line is absent entirely while
  `§SUPPORT_CHECK` reads `floating=0/10979` — i.e. the only instrument said "solved".
- **G-WBR-6** no regression: `placed == total` on Hospital **and** LTU_AHouse, and `§SUPPORT_CHECK`
  is still `floating=0` on both.

## Cache/version obligations
- `_GANTT_CACHE_VERSION` **5 → 6** in `viewer/time_machine.js`. Without it a browser holding a cached
  gantt never re-generates and the fix cannot reach the user — the exact failure PR #1123 had to
  ship as its own follow-up for #1120.
- `viewer/sw.js` `CACHE_VERSION` bump (`viewer/time_machine.js` and `viewer/schedule_gate.js` are
  precached).

## ⛔ Out of scope
- Making `§SUPPORT_CHECK` role-blind (that is #1120's measured-and-rejected "attempt 2"; M6 reports
  the number instead of gating on it).
- The captured/linked-schedule path (`source=captured`). GENERATED 4D only.
- `sequence_rules.json` seq numbers, the room-title lane, `MIN_DWELL`.

## 🔴 §SUPPORT_ALL — the invariant is NOT held: structure bearing on WALLS is scheduled before them
**User's standing requirement, 2026-08-02, after declining to adjudicate film pacing:** *"as long as
the 4D schedule does not put anything without support first."* That is the whole acceptance test for
this lane now. **It currently FAILS on real Hospital: 6,778 violations.**

Instrument: `audit_support_roleblind.js` (branch `fix/helipad-roof-separation`, `86b8535`).

| carried on carrier | n |
|---|---|
| IfcPipeSegment on IfcWallStandardCase | 1768 |
| IfcPipeFitting on IfcWallStandardCase | 1396 |
| **IfcBeam on IfcWallStandardCase** | **1048** |
| IfcMember on IfcWallStandardCase | 590 |
| IfcDuctSegment / IfcDuctFitting on IfcWallStandardCase | 533 / 437 |
| **IfcBeam on IfcWall** | **246** |
| **IfcColumn on IfcWallStandardCase** | **162** |
| IfcSlab on IfcWallStandardCase | 19 |

Worst single: `IfcPipeFitting 0dMvF9TX5F1PPX5xJ4dTQX` starts **100.5 days** before its carrying wall
`0jzYl7FRDEExmTLzqqEZZo` finishes.

**For the structural rows this is not a near-miss — it is guaranteed by the two-pass design, and it is
provable from the code rather than only measured:**
1. `place()` writes the support grid ONLY for `el.seq <= 4` (`schedule_gate.js:162`).
2. `geoGate()` reads that grid — so it can gate you on STRUCTURE and nothing else.
3. Walls are `seq 6` → PASS B. Beams/columns/members/slabs are `seq <= 4` → PASS A.
4. **PASS A runs to completion before PASS B begins.**
→ A beam bearing on a wall CANNOT be gated on that wall. Ever. Same for columns, members, plates.

**§SUPPORT_CHECK cannot see this** — `auditFloating`'s wall pool is handed only to `IfcSlab && seq>4`
(`schedule_gate.js:304`), i.e. exactly the roof case. `floating=0` is true and uninformative for every
other class. This is the SAME defect §4D_ROOF_LOAD_PATH (#1120) and §4D_WALLS_BEFORE_ROOF (#1128)
fixed **for roof slabs only**, by promoting them out of PASS A into PASS B so they wait for walls. The
general case was never done, which is why "roof before walls" kept coming back in a new costume.

**TWO SELF-CORRECTIONS on the way to 6,778 — recorded so the number is checkable, not trusted:**
- Role-blind carriers (every class supports every class) → **40,754**. Top pair
  `IfcPipeFitting on IfcCovering` (5,606): a pipe above a ceiling tile is not held up by that tile.
  That audit over-reports exactly as badly as the shipped one under-reports.
- Carrier pool narrowed to structure+walls but keeping `S.top_z >= T.base_z - GAP` → **29,759**. That
  predicate accepts ANY carrier taller than my base, so a riser threading past a 3 m wall read as
  "carried by" it. The rests-on/runs-past discriminator is that the carrier tops out AT my underside
  (`|S.top_z - T.base_z| <= GAP`): **29,759 → 6,778**.

⚠ **DO NOT "fix" this by re-sorting PASS A.** Already measured and rejected under §4D_BAND_MONOTONIC:
re-sorting PASS A drives inversions to 0 and **floats 2,341 elements**, because `geoGate` reads only
what is already placed. The likely shape is the #1120 move generalised — an element whose real carrier
is a wall belongs after walls — but it needs its own spec, its own measurement, and a floating gate
that stays at 0.

## ✅ §HELIPAD_ROOF_SEPARATION — the reported roof defect was NOT an ordering defect
`audit_helipad_roof_walls.js` (`8bc0532`): **roofsBeforeTheirWalls = 0/11**. The promotion reproduces
the shipped `§GANTT_OVERRIDE` counts exactly (`seed=10 m4=1 total=11`), so the audit measures the real
rule. The two helipad huts (`3eq15PZlbCi8$6xdfFtxpB`, `3Vxmv9vT1DBOVGP9f4HeYO`) are the only elements
in the building with a lag of **exactly 0.0 days** — the gate is binding to the millisecond.

The film is what hides it: 63,415 elements / 1,735 frames = **36.6 elements per frame**. The hut roofs
are rank 63,404–63,405 of 63,415 and land on frame **1735**; their carrier walls land on 1734. The
whole hut is **2 frames = 133 ms** at 15 fps. Correct order, zero visual separation.

**Volume-weighted pacing was specced, simulated and DISPROVEN before any code was written** (user
chose it; the measurement says no):

| policy | biggest single | top 0.1% hold | hut roof frame | rooftop span |
|---|---|---|---|---|
| count (current) | 0.00% | 0.1% | 1735 | 1267f = 84.5s |
| volume (raw) | **8.03%** | **49.9%** | 1726 | 1389f = 92.6s |
| volume^1/2 | 0.44% | 7.6% | 1731 | 1125f = 75.0s |
| volume^1/3 | 0.10% | 2.5% | 1733 | 1099f = 73.3s |
| log1p(volume) | 0.07% | 3.1% | 1732 | 1052f = 70.1s |

Raw volume hands 8% of the film to ONE element and half of it to 63, and still buys the hut only 9
frames. The compressions fix the tail but move the hut 2–4 frames. **No proportional weighting can
work**: the hut is genuinely the last 0.02% of the building, and every one of these is a monotone
cumulative map, so the last 0.02% lands in the last 0.02% of the film by construction. Buying the
topping-out a beat requires a NON-proportional tail — the §CPE_STICK_HOLD precedent (a hold buys its
own time), not a re-weighting. **Parked: the user declined the pacing lane and set the support
invariant above as the priority instead.**

## ⛔ §4D_WALL_BORNE_STRUCTURE — 5 DESIGNS BUILT AND MEASURED 2026-08-02. ALL REJECTED. ROOT CAUSE FOUND.
**Superseded by the section at the end of this file — read `§ROOT CAUSE — CONFLICTING SORT ORDERS` first.**

## (earlier, kept for the measurements) ATTEMPTED 2026-08-02, PARKED. Fixes support, regresses the band.
Branch `fix/helipad-roof-separation` @ `a36b71c` — **NOT FOR MERGE**, `origin/main` untouched at
`fc58210`. Recorded so the next attempt starts from the measurements, not from re-deriving them.

**DESIGN A — "a wall that carries structure IS structure."** 1,229 load-bearing walls move PASS B →
PASS A and into the structure grid, so `geoGate` gates everything resting on them; `wallGate` widened
from `IfcSlab`-only to every `seq>4` class.

| gate | before | after | |
|---|---|---|---|
| support violations (§SUPPORT_ALL) | 6,778 | **377** (structural 2,379 → **0**) | ✅ |
| floating (`tests/test_schedule_gate.js`) | 0 | **0** | ✅ |
| band inversions (T2a) | 0 | **1,026** | ❌ |
| project span | 170d | **213d** (+25%) | ❌ |

**The band failure IS the user's own "upper floors gets walled first" returning through the fix for a
different defect.** That is why this cannot ship, even though it satisfies the invariant they asked
for. Trading one reported defect for another is not progress.

**Two attempts at the band regression, both measured, neither worked:**
1. **Live `bandGate` on the promoted walls only** — 1,026 unchanged, worst 115d → 108d. PASS A is
   ordered by `base_z`, so `bandTrade[r-1]` is still filling when rank *r* is reached. This is the
   same "gate without re-sorting is a lower bound" already recorded for structure.
2. **TWO-PHASE PASS A — this file's own open item 2** ("gating on `bandTrade[r-1]` computed from a
   PRE-PASS rather than read live"): phase 1 places PASS A ungated and yields a COMPLETE ladder,
   phase 2 resets `grid`/`wallGrid`/`out`/`crews`/`bandTrade` and replays the **identical** element
   order against the frozen ladder. Result: **1,026 unchanged, span 177d → 213d.** The frozen gate
   does not bind and **why is the open question** — the order is preserved byte-for-byte and every
   term enters through `Math.max`, so Ruling A's re-sort prohibition is NOT what is blocking it.
   ⚠ **Next session: instrument WHICH elements are inverted before touching the gate again.** Both
   attempts assumed the inverted population was the promoted walls; that was never verified, and the
   count sitting at exactly 1,026 across three different gate configurations is the tell that it is
   probably NOT them.

**DESIGN B — the #1120 shape (move the CARRIED thing, not the carrier) — REJECTED BY MEASUREMENT,
do not retry.** Promoting wall-borne structure past the walls requires its transitive closure or its
dependents float: **7,279 / 12,500 structural elements (58.2%)** — members 4,092, beams 1,628, plates
1,028, columns 497, slabs 34. Converges in 8 rounds, but it empties PASS A rather than fixing it.

**What is now known that was not before:** the support invariant and cross-storey band monotonicity
are in genuine tension in this scheduler, and the tension is located precisely at the walls. Any
future attempt has to hold BOTH counters at once — `audit_support_roleblind.js` and
`witness_4d_band_monotonic.js` are the pair, and passing one while breaking the other is the trap.


## §ROOT CAUSE — CONFLICTING SORT ORDERS. The support invariant needs a scope decision, not a bug fix.
Branch `fix/helipad-roof-separation` @ `a40cf16`. **Scheduler reverted to shipped, byte-for-byte** —
`witness_4d_band_monotonic` **6/6 all green**, `test_schedule_gate` **PASS (0 floating)**. The audits
stay; they are pure additions and are what made any of this measurable.

**THE FINDING, in one sentence:** the support gate needs carriers placed first (sort by `base_z`,
z-major) and the band gate needs lower ranks placed first (sort by `(seq, rank)`, rank-major) — and
because walls BOTH carry structure AND rest on structure, the two requirements demand **conflicting
sort orders of the same elements**. `geoGate` and `bandGate` each read only what is ALREADY PLACED,
so each is a correct constraint under its own sort and a weak lower bound under the other's. **No
gate-only change can resolve this.** Every design below is a different attempt to have both orders.

| # | design | support | floating | band (T2a) | span |
|---|---|---|---|---|---|
| — | **shipped (`fc58210`)** | 6,778 | **0** | **0** | 176d |
| 1 | load-bearing walls → PASS A | **377** (structural **0**) | 0 | 1,026 ❌ | 213d |
| 2 | ALL walls → PASS A | — | 0 | 1,157 ❌ (T2b 551→545 ❌) | 213d |
| 3 | two-phase PASS A, frozen ladder | — | 0 | 1,026 ❌ | 177d |
| 3b | …iterated to a fixed point | — | 0 | 1,157 ❌ **diverged 11/11** | 535d ❌ |
| 4 | whole-schedule relaxation | 6,778 ❌ | 0 | **0** ✅ **diverged 6/6**, moved=62783 | 671d ❌ |
| 5 | **ONE geometry-ordered sweep** | support-correct | 0 | 34,980 ❌ | **147d** ✅ trades 5→**7** ✅ |

**What each failure taught, so none of it is repeated:**
- **(1)** splitting a trade across two passes is fatal on its own — PASS B runs wholly after PASS A, so
  every moved wall inverts against the ones left behind. All 1,026 offenders were the moved walls
  (verified by dumping them, not assumed).
- **(3) is the important one.** Instrumented: the frozen gate **fired 1,157 times and 1,157 inversions
  remained** — it was gating against numbers from a run that no longer existed, because round 1 is
  ungated so its ladder is stale *by construction*. This kills this file's own open item 2
  ("gate on `bandTrade[r-1]` computed from a PRE-PASS rather than read live") **as written**.
- **(3b/4)** relaxation does not converge here. Crews are a shared project-wide pool, so delaying walls
  reshuffles crew slots and the iteration **oscillates**. My "starts only increase, therefore monotone,
  therefore convergent" reasoning was **WRONG** and the run disproved it.
- **(5) is the most promising and the closest to physically correct.** There is no real cycle: a carrier
  is ALWAYS lower than what it carries, so sorting the whole model by `base_z` is already a valid
  topological order of the support relation. It is also SIMPLER than the two passes it replaces, and it
  *improved* the schedule — span 170→**147d**, trades at midpoint 5→**7**. It fails only because a
  z-major sort makes `bandGate` a weak lower bound: **storey z-ranges overlap**, so rank r-1 is not
  finished when rank r is reached.

**⚠ THE DECISION THIS NEEDS FROM THE USER — it is scope, not a bug.** Design 5 works if the band gate
stops depending on placement order, i.e. band ends come from a dependency solve instead of being read
live. That is **CPM**, and this file's own header scopes it out: *"No CPM/dependency solving
(planner's)"*. Adding it is a deliberate widening of what the generated 4D is allowed to be — not
something to slip in under a bug fix. **Do not let a future session "just add a topological solve"
without that ruling.**

**Meanwhile the shipped behaviour is the honest one:** cross-storey ordering is correct (the user's
reported defect), nothing floats, and ~2,000 structural elements bearing on walls are scheduled before
those walls — now MEASURED and named by `audit_support_roleblind.js` rather than hidden behind
`§SUPPORT_CHECK floating=0`, which only ever asked the question about roof slabs.


## §ELEMENT_CPM — the specced fix. Extracted precedence, not an authored programme.
**User's framing, 2026-08-02, and it is the correct one:** *"Isn't CPM for Phase level? CPM at element
level is what supposed to be granted innately as u just did."* Right. Phase-level CPM is a planner
authoring activities and logic links — out of scope, stays out. Element-level precedence is a FACT OF
THE GEOMETRY: S carries T when `S.base_z < T.base_z - EPS`, `|S.top_z - T.base_z| <= GAP`, and they
overlap in XY. The edges already exist; nothing is invented and nothing is solved to obtain them.

**WHY ALL FIVE PASS-LEVEL REPAIRS FAILED, restated in one line:** `base_z` and `(seq, rank)` are both
PROXIES for a topological order. Each encodes one constraint family and loses the other. The fix is to
stop using a proxy and use the graph.

**MEASURED FEASIBILITY on real Hospital (this is small, not a rewrite risk):**

| | |
|---|---|
| nodes | 63,415 |
| support edges | **74,942** (1.2/element avg, **max in-degree 1,101**) |
| graph build | **709 ms** |
| sync nodes for band + trade | **72** — so those families are O(N), not O(N²) |
| trade-vs-support conflicts | **21,502** ← the ruling above |

~63k nodes / ~200k edges. Topological sort + forward pass is milliseconds — CHEAPER than the two-pass
scheduler it replaces, and negligible against the 21.6-minute bake it feeds (`§BAKE_FAST_PATH_COST`).

**THE BUILD, in order:**
1. **Support edges from geometry.** Acyclic BY CONSTRUCTION — `base_z` strictly decreases downward, so
   no cycle is possible. Already implemented and timed inside `audit_support_roleblind.js`; lift it.
2. **Trade + band edges via 72 sync nodes** — one per `(storey, seq)` and per `(rank, seq)`, instead of
   pairwise. **Skip any edge that contradicts a support path** and COUNT the skips in a `§` line
   (expected ≈21,502; a wildly different number means the predicate drifted).
3. **Topological sort + forward pass** with the existing `§CREW-CAP` project-wide crew pool. This is a
   CPM forward pass over an EXTRACTED graph.
4. ⚠ **Max in-degree is 1,101** — one element carried by 1,101 others (the 2,092 m² deck,
   `3Csn1z$1v5Q8DXdumWYJUE`). Give wide fan-in the sync-node treatment too or that single node
   dominates the edge count.

**EXPECT IT TO BEAT SHIPPED, not merely match it.** Design 5 (the one geometry-ordered sweep) already
demonstrated that once ordering is right the schedule IMPROVES: span 170d → **147d**, trades at
midpoint 5 → **7**. It failed only on the band gate, which is exactly what an explicit graph fixes.

**Instruments already built and committed** (branch `fix/helipad-roof-separation`):
`audit_support_roleblind.js` — the invariant, carriers = structure+walls offered to EVERY class, with
the rests-on predicate. `audit_helipad_roof_walls.js` — roof-role slabs vs their carriers (0/11, and
it reproduces the shipped `§GANTT_OVERRIDE` counts exactly, which is what makes it trustworthy).

**⚠ TWO PREDICATE TRAPS — both cost a wrong answer this session, do not fall in again:**
1. **Carrier pool.** Role-blind (every class carries every class) gives 40,754 — it counts
   `IfcPipeFitting on IfcCovering` (5,606) as support. A pipe above a ceiling tile is not held by it.
   Carriers are STRUCTURE + WALLS.
2. **Rests-on vs runs-past.** `S.top_z >= T.base_z - GAP` accepts ANY carrier taller than my base, so a
   riser threading past a 3 m wall reads as carried: **29,759 phantom vs 6,778 real**. The carrier must
   top out AT my underside: `|S.top_z - T.base_z| <= GAP`. **This trap is already recorded in
   `auditFloating`'s own header as evidence that "walls do not carry beams in this DB" — that
   conclusion is WRONG and is corrected in `§SUPPORT_ALL` above.** Walls carry structure in 1,243 places.

## ⛔ §ELEMENT_CPM BUILT AND MEASURED 2026-08-02 — the support invariant is FIXED, and it costs the band. NOT MERGED.
Branch `feat/element-cpm` (bim-ootb, off `origin/main` @ `a245f33`). **The user's ruling was applied:
support wins, every yield counted.** The engine works and the invariant the user named is closed:

| gate | shipped (`fc58210`) | §ELEMENT_CPM |
|---|---|---|
| `audit_support_roleblind.js` (**the user's invariant**) | **6,778 FAIL** | **0 PASS** ✅ |
| `tests/test_schedule_gate.js` floating | 0 | **0** ✅ |
| band inversions, non-structure (T2a) | **29,824** | 34,595–38,816 ❌ |
| span | 176d | 183–238d (T4 still ✅) |
| graph build / solve | — | **1.0s / 0.2s** on 63,415 nodes, 81,722 edges |

**DO NOT MERGE AS-IS.** The user CONFIRMED the shipped band ordering is right on a live Hospital bake
("no more roof coming on before the walls or upper deck forming before lower", Day 282). Shipping this
would regress exactly that, visibly, to fix a defect they can only infer. Support is worth having —
but not by trading away the half that is already confirmed good.

**THREE ENGINE SHAPES WERE BUILT AND MEASURED. Do not re-attempt any of them:**
1. **Sync nodes** — one milestone per (phase, seq), trade/band as soft edges, residual cycle-breaker.
   Broke **155,170 of 160,726** soft edges; span collapsed to 82d, walls at day 25 vs beams at day 42.
   Aggregating a milestone over elements at wildly different z is the error.
2. **Priority only** — topological over support, (seq, rank, base_z) preferred among the ready set.
   The heap only ever holds support-ready nodes, so when no low trade is ready a high one pops anyway:
   45,241 out-of-trade pops, inversions **34,665 — worse than the engine it replaces**.
3. **Group-barrier preconditions** — a node waits until its whole (rank r-1, seq k) group is placed,
   yielding only on deadlock. Deadlocks are pervasive, not incidental: 35,397 band yields. Releasing
   the whole waiting group amplifies (one stuck element waives thousands of neighbours); releasing ONE
   node at a time barely moved it (35,492). Also found and fixed on the way: a SHARED waiver flag let
   a *trade* deadlock silently waive the *band* precondition for 51,767 nodes — two constraints need
   two waivers.

**⭐ THE DECIDING MEASUREMENT, and it is new — `audit_rank_vs_support.js` (committed):**
```
§RANK_VS_SUPPORT edges=81722
§RANK_VS_SUPPORT byStoreyLabel  carrier_ranks_ABOVE_carried=1735 (2.1%)  sameTrade=17
§RANK_VS_SUPPORT byElementZ     carrier_band_ABOVE_carried=0 (0.0%)
   619  Level 3 carries Level 2      422  Level 4 carries Level 3      402  Level 5 carries Level 4
```
**The contradiction is in the KEY, not in the schedule.** "Band-monotonic by STOREY LABEL" and
"nothing before its carrier" are UNSATISFIABLE together — no engine can pass both — because 1,735
support edges have the carrier's storey ranking above the storey it carries. Keyed on element
ELEVATION the same graph has **ZERO** contradictions. Every previous session (including this one's
first three attempts) treated this as a scheduling problem. It is not.

**WHY RE-KEYING THE BAND TO ELEVATION DID NOT IMMEDIATELY WIN** (tried, measured, 4th shape): the
TRADE gate is still keyed on the storey label while the band is keyed on z, so 23,121 elements now sit
in two different groupings and the group barrier deadlocks across the two keys (33,960 yields,
inversions 38,816). **The next attempt must move BOTH gates onto the same elevation key** — or drop
the group barrier and gate on time alone. That is the one open design question; the engine, the
support extraction, and the crew pool are all built and measured and can be reused verbatim.

⚠ The witness measures inversions via `rank[collapse(e.storey)]` — the LABEL. If both gates move to
elevation, the witness must be given an elevation-keyed metric ALONGSIDE the label one, and BOTH
reported. Changing it to elevation only would be lowering the bar, which this lane has a standing
warning about.

## ▶ RESUME 2026-08-02 (late) — ✅ THE NEXT ACTION BELOW IS BUILT — PR #1133 (see §STAGGER_SUPPORT_ORDER at end of file)
**⭐ THE NEXT ACTION, and it is small:** `viewer/time_machine.js` §PLAYBACK-STAGGER (see the comment
above `window.tmOrderBySchedule`, ~L5223) distributes each captured task's guids **bottom-up by
`center_z`** inside that task's window. **`center_z` is a CENTROID, not a bearing surface** — a 6.87m
Hospital column's centroid sits above a slab it carries. Swap that ordering for the **support DAG
topological order** (already built and proven, `feat/z-stacking-oneshot`). Gate it with
`audit_support_roleblind.js` run against the CAPTURED order.

**WHY THIS IS THE RIGHT PLACE AND THE WHOLE SESSION MISSED IT:** the user's Hospital reveal runs
`§CPE_BUILDUP_SOURCE source=captured leafTasks=6` — a 6-leaf-task linked programme covering all
63,415 elements. **`schedule_gate.js` IS NEVER CONSULTED for that film.** Every scheduler experiment
below therefore could not have changed one frame of what the user was watching. Check
`§CPE_BUILDUP_SOURCE` FIRST on any "bad build order" report.

**✅ SOLVED (generated path), branch `feat/z-stacking-oneshot`, NOT merged:**
`audit_support_roleblind` **6,778 → 0**, `test_schedule_gate` **0 floating**. 63,415 nodes / 81,658
support edges, graph 2.0s, walk 0.4s. The maths is settled: a carrier is always lower than what it
carries, so `base_z` is a valid topological potential and a walk in that order cannot place anything
before its support.

**⛔ WHY IT IS NOT MERGED:** band inversions regress and the span blows out (170d → 236d).
| band inversions, non-structure | shipped | this engine |
|---|---|---|
| by storey label | 29,824 | 39,074 |
| by ELEVATION | **8,333** | **28,262** |

**❌ HYPOTHESIS DISPROVEN — do not retry.** I claimed the storey LABEL was the culprit (labels
contradict gravity in 1,735 of 81,722 edges, `audit_rank_vs_support.js`) and that keying both gates on
elevation would fix it. Built it, measured it: **4x WORSE on the elevation key itself**. The engine
genuinely sequences worse across floors; it is not a metric artifact. The both-keys reporting added to
`witness_4d_band_monotonic.js` (`§4D_BAND_BY_Z`) is what caught this — keep it, it is the only thing
that stopped a bad merge.

**Four engine shapes now measured and rejected** (sync nodes · priority-only · group-barrier
preconditions · both-gates-on-elevation) — tables in §ROOT CAUSE and §ELEMENT_CPM. Do not re-attempt.

**Other open items from this session:**
- `feat/preview-support-probe` — role-blind support §-line at buildup-arm time. **Witness 0/1, probe
  never fires** (`_ops` empty at arm time). Unverified, unmerged. Fix the wiring or drop it.
- **Bake has no WebGL-context-loss recovery.** User lost a full mp4: context died, frames stayed in
  IndexedDB `bim_ootb_cinema_maxq`/`frames` (integer keys, webp blobs), and the next bake calls
  `deleteDatabase` (`cinema_maxq.js:1171`). A `maxqRestitch()` entry point would salvage it.
  A `§MAXQ_GL_LOST` salvage path exists (L993) but did not save this one.
- `§GANTT injected=... 1335 days, start=12/6/2022` while the project window is 2026-01-01..2026-06-30
  — a stray 2022-dated op stretches the gantt span. Day counter itself is correct (spanDays=214).
- §CPE_ROOM_TITLE_MULTI — ✅ BUILT 2026-08-02, PR #1135 (sw v917): ±10° horizontal fan on
  centre-ray miss only; Hospital film misses 61→27. Spec + limits now actually written in
  `prompts/CINEMA_PATH_EDITOR.md` (the earlier "specced" claim was a stale pointer — only the
  evidence line existed).

**Shipped and live this session (main, sw v915):** §CPE_DAY_COUNTER_POS (#1130), §CPE_GAZE_ACQUIRE
(#1131, 90° in 0.90s vs 2.00s), G-SH-4 bound read from the shipped curve (#1132).

---

# ✅ §STAGGER_SUPPORT_ORDER — BUILT 2026-08-02, PR #1133 (sw v916, `_GANTT_CACHE_VERSION` 7→8)
**The ▶RESUME (late) item above, executed as specced.** Branch `fix/stagger-support-order`,
witness `witness_stagger_support_order.js`, worktree `/tmp/wt-stagger-topo`.

**What shipped** (`viewer/time_machine.js` §PLAYBACK-STAGGER):
1. **Comparator `(seq, cz)` → `(base_z, seq, cz)`.** No graph build needed in the browser: the
   RESUME's own settled maths ("base_z is a valid topological potential — a carrier ALWAYS has
   `S.base_z < T.base_z - EPS`") means a base_z-major walk IS a support-DAG topological order.
   Witness on real Hospital geometry + real `sequence_rules.json` + real LP promotion:
   **within-task support violations 6,240 → 0** (RED had 988 IfcBeam-on-wall, worst IfcColumn
   134.3d before its wall — the captured-order twin of §SUPPORT_ALL's 6,778).
2. **§4D_HOST_BEFORE_HOSTED post-pass, and it was NOT optional.** The raw swap alone REGRESSES
   §4D_FACADE_ORDER: 101/5,924 host pairs are sub-EPS float-noise ties — wall base 0–0.043m
   ABOVE its hosted glazing's base, so the panel sorts first and the seq tiebreak never fires.
   (EPS-bin quantization was measured and rejected: 54/101 straddle bins.) Fix is the constraint
   shape this file already specced: AFTER the sort, each hosted element (window/door/
   glazing-override plate+member) moves to just after its last z-containing XY-touching wall.
   Cheap by construction — in a bz-sorted bucket the candidate walls lie in `[H.bz, H.bz+EPS]`,
   a bounded forward scan. **hostedBeforeHostWall 101 → 0/6,771**, and support stays 0 because
   hosted classes are never carriers: the two gates hold together, not in trade.
3. **Both cache bumps in the same PR** (the #1123 lesson): `_GANTT_CACHE_VERSION` 8 re-staggers
   cached gantts, sw v916 re-serves the precached `time_machine.js`.

**Gates:** G-SSO-1 RED 6,240 · G-SSO-2 GREEN 0 · G-SSO-3 facade 0 · G-SSO-4 six-task-shape
within-task 0 (cross-task 0 on the fixture; live cross-task is the planner's data, reported not
gated). Generated path untouched and proven so: `test_schedule_gate` PASS 0 floating,
`witness_4d_band_monotonic` 6/6 (T2a 0, T2b 551 unchanged, span 176d).

**What this does NOT close:** the GENERATED-path §SUPPORT_ALL invariant (6,778) still stands
parked behind the ⛔ ruling in the top RESUME — this PR fixed the CAPTURED path the user's film
actually plays. `§STAGGER_HOST movedAfterHost=N` is the new live §-line; expect ~105 on Hospital.
**Verify on the user's next fresh generate:** `§CPE_BUILDUP_SOURCE source=captured` +
`§STAGGER_HOST` present + beams no longer preceding their walls from a cleared-IndexedDB Time
Machine.

---

# ✅ §Z_STACK_XRAY_STAGING — BUILT AND SHIPPED, PR #1139 (2026-08-03) — the support fix that touches NO ordering: unsupported = X-RAY until carriers land
**User, during the v918 bake, three escalating proposals:** *"introduce some sort of peek forward to
pull over elements... Or better, simply store away those until their supporting elements arrive —
study which method is viable"* → *"or make them x-ray to indicate the item is there but to be
assembled. More meaningful."* The third one wins the study, and the study is MEASURED:

| method | support | side effects | verdict |
|---|---|---|---|
| peek-forward (pull carriers earlier) = §ROOT CAUSE design 1 | 6,778→377 | band inversions 0→1,026, span +25% | ❌ measured, rejected |
| store-away at SCHEDULER (defer dates) = design B | — | transitive cascade floats 58.2% of structure | ❌ measured, rejected |
| full graph = §ELEMENT_CPM | 6,778→**0** | band inversions 29,824→34,595+ (user-confirmed-good ordering regresses visibly) | ❌ built, NOT merged |
| store-away at REVEAL (defer display only) — NEW, simulated 2026-08-02 | 7,861→**0**, span unchanged | **moved=16,680 (26.3%) mean 144.65d, max 253.7d** — clumped pops, film no longer matches its own gantt dates | ❌ §REVEAL_DEFER_STUDY, this file |
| **X-RAY STAGING** | invariant reframed: nothing appears SOLID before support | **schedule untouched** — gantt, day counter, band ordering keep the user's live confirmation | ✅ **build this** |

**Why the scheduler cannot simply "resolve it in the first place" (user's question, answered from
the record):** §ROOT CAUSE — support wants carriers placed first (z-major), the band gate wants
lower storeys' trades first (rank-major), and walls BOTH carry structure AND rest on structure, so
the two constraints demand conflicting sort orders of the same elements. Nine engine shapes built
and measured across §ROOT CAUSE + §ELEMENT_CPM; each satisfies one invariant by breaking the other.
The engine question stays parked; X-ray staging makes the FILM honest without reopening it.

## The rule
An element revealed at its scheduled time whose support carriers (the §SUPPORT_ALL predicate:
structure+walls, XY-overlap, rests-on `|S.top_z - T.base_z| <= GAP`) are NOT all placed renders
X-RAY (the existing ghost material treatment — precedent: §GHOST_GROUND, ghostglass, Alt+X bbox
ghost) and turns SOLID the moment its last carrier places. "The item is there but to be assembled."
- Support edges: EXTRACTED once per building — the §ELEMENT_CPM machinery, already measured at
  74,942 edges / 0.7s build on Hospital's 63,415. Acyclic by construction (base_z strictly down).
- Applies to the GENERATED path in Time Machine playback AND the film (same reveal machinery —
  §CPE_BUILDUP_FOLLOW_TM stays true: the film still plays the timeline verbatim; material state is
  presentation, not order). Captured path (source=captured) already support-clean per element
  within tasks (#1133); cross-task ghosting can use the same pass unchanged.
- Expected magnitude, from §REVEAL_DEFER_STUDY: ~16,680 elements (26.3%) will spend time staged —
  that is the DEFECT being made visible, not a cost. Log it: `§XRAY_STAGED n=... solidified=...`.

## Witness claims
- **W-XRAY-1 (the invariant, reframed):** role-blind audit over SOLID-transition times → 0 on
  Hospital generated 4D. RED first: on main, solid==reveal, audit reads ~6,778.
- **W-XRAY-2 (no ordering change):** kernel_ops timestamps byte-identical before/after; gantt bars,
  §CPE_DAY_COUNTER, and witness_4d_band_monotonic outputs unchanged.
- **W-XRAY-3 (no orphan ghosts):** every staged element eventually solidifies ≤ project end;
  count staged-at-film-end must be 0 (its carriers are scheduled too).
- **W-XRAY-4 (perf):** edge build once per generate (~0.7s measured), per-tick check O(newly
  placed), §PERF_TRAVERSE budget unchanged on Hospital.
- ⚠ Mobile/TM-lite (`_isMobileTM`, §S259_TM_LITE >50K): decide explicitly whether staging is
  skipped there like other effects — do not let it silently break the 50K path.

## ⛔ Out of scope
Re-opening the scheduler engine (§ELEMENT_CPM stays parked behind its ruling) · the captured-path
task windows (planner's data) · any change to kernel_ops timestamps — this feature is material
state ONLY.

---

# ⛔ §CPM_DUAL_ELEVATION — MEASURED AND PARKED 2026-08-03. Shape 10 and 11. Branch `feat/element-cpm-elevation-dual-gate`, NOT merged, NO PR.
**The open design question from §ELEMENT_CPM ("move BOTH gates onto the same elevation key — or drop
the group barrier and gate on time alone") is now CLOSED BY MEASUREMENT. Both halves were built.
Support and floating hit zero; band-by-LABEL still regresses; span still blows out. Do not re-attempt.**

**⚠ FIRST, A CORRECTION TO THIS FILE'S OWN NAVIGATION — it cost a session's reading time.** §ELEMENT_CPM
(L888-893) says "the next attempt must move BOTH gates onto the same elevation key", and that reads as
untried. It is NOT — the ▶RESUME block at L920-934 records `feat/z-stacking-oneshot` @ `1265411` as
exactly that (`phOf[i] = 'Z' + rkOf[i]`, the trade gate's group IS the elevation band) and rejects it.
**The genuinely untried half was only ever the SECOND clause: "drop the group barrier and gate on time
alone."** That is what this section builds, plus the walk-order and banding variants around it.

## What was built (all on the reused §ELEMENT_CPM machinery — support extraction and crew pool verbatim)
Four orthogonal knobs on ONE code path (`viewer/schedule_gate.js`, env-selected so the shapes are the
same code, not four hand-edits): `CPM_PRIO` seq-major|**rank-major**, `CPM_BARRIER` both|**none**,
`CPM_BAND` median|**mid**, `CPM_ORPHAN` off|**on**.

**⭐ THE ONE REAL DISCOVERY, and it is worth keeping even though the engine is parked: with both gates
on elevation, a BAND-MAJOR walk `(rank, seq, base_z)` is a VALID TOPOLOGICAL ORDER of the support DAG.**
`audit_rank_vs_support.js` already proved carrier_band_ABOVE_carried=0 — no carrier is ever in a higher
elevation band than what it carries — so "finish band r before starting band r+1" can never contradict
"nothing before its carrier". That makes the band gate EXACT with **no barrier machinery at all**, and
it drives §4D_BAND_BY_Z to **0/50,327**. Every prior shape used a seq-major priority and needed a
barrier to approximate what this ordering gives for free.

**And it settles the barrier question outright: THE GROUP BARRIER IS DEAD WEIGHT.** On the shipped
elevation shape it fires and is then waived for **51,774 of 63,415 nodes (82%)** — it is not a
constraint, it is bookkeeping. Removing it entirely is neutral-to-better on every counter
(seq-major: label 39,074→38,874, byZ 28,262→27,834, span 236d→229d) and deletes the deadlock detector,
the dual waiver flags, the defer heap and the wait lists. If this engine is ever revived, revive it
WITHOUT the barrier — three of the nine prior shapes died on barrier deadlocks that need never exist.

## The measurements — real Hospital, 63,415 nodes / 81,722 support edges
| shape | support | floating | band BY LABEL (T2a) | band BY ELEVATION | span | trades@mid | build/solve |
|---|---|---|---|---|---|---|---|
| **shipped (`fc58210`)** | **6,778 FAIL** | 0 | **29,824** | **8,333** | 170d | 5 | — |
| prior 4th shape: both gates z + barrier (`1265411`, reproduced) | **0** ✅ | **0** ✅ | 39,074 ❌ | 28,262 ❌ | 236d ❌ | 5 | 1.1s / 0.26s |
| **10a** both gates z, **no barrier**, seq-major | **0** ✅ | **0** ✅ | 38,874 ❌ | 27,834 ❌ | 229d ❌ | 5 | 1.1s / 0.17s |
| **10b** both gates z, **no barrier**, **band-major** | **0** ✅ | **0** ✅ | 35,468 ❌ | **0** ⚠(see below) | 259d ❌ | **7** ✅ | 1.1s / 0.13s |
| **10c** = 10b with **midpoint band bounds** | **0** ✅ | **0** ✅ | **33,261** ❌ (best of any support-correct engine) | 10,420 ❌ | 252d ❌ | **7** ✅ | 1.1s / 0.14s |
| **11** = 10c + §SUPPORT_ORPHAN fallback | **0** ✅ | **0** ✅ | 33,264 ❌ | 9,563 ❌ | 260d ❌ | **7** ✅ | 1.7s / 0.13s |
| — 10b + orphan fallback | **0** ✅ | **0** ✅ | 35,526 ❌ | 0 ⚠ | 278d ❌ | 7 | 1.7s / 0.13s |

**⚠ WHY 10b's `byZ=0` IS NOT A WIN, and any future session must not quote it as one.** The witness's
`§4D_BAND_BY_Z` derives its bands from the SAME storey-median bounds the gate uses, so a band-major
walk scores 0 BY CONSTRUCTION — it is marking its own homework, exactly what the L895-898 standing
warning is about. **Shape 10c is the honest reading of the elevation key**: it gates on midpoint bounds
while the witness still measures median bounds, so the two keys are independent — and it scores
**10,420 vs shipped 8,333. The shipped scheduler is BETTER on the elevation key too, when the elevation
key is measured independently.** The 8,333→0 improvement was an artifact both times it appeared.

**Midpoint band bounds are, however, a genuine improvement to the ladder and are worth lifting on their
own.** `_zBounds` = each storey's MEDIAN base_z means every element sitting below its own storey's
median is demoted into the band beneath it: `relabelledByZ` **23,121 → 8,816** when the boundary moves
to halfway between consecutive medians, and label inversions fall 35,468 → 33,261 for free.

## Verdict — NO MERGE, NO PR, by the decision rule stated up front
- support **0** ✅ · floating **0** ✅ — the user's invariant is closed, again, for the third engine family.
- band BY LABEL **33,261 vs 29,824 = +11.5%** ❌ — a visible regression of the ONE ordering the user
  confirmed live on a real bake ("no more roof coming on before the walls", Day 282). This is the same
  wall this lane has now hit eleven times.
- span **252d vs 170d = +48%** ❌ — inherent to a band-major walk (floors serialize), not a tuning miss.
- ✅ Regressions checked and GREEN on untouched `main`: `witness_stagger_support_order` (G-SSO-1..4 all
  PASS, facade 0, movedAfterHost=105) and `witness_zstack_xray_staging` (G-XRAY-1..4 all PASS, RED=5687
  → GREEN=0). Nothing shipped was touched; the work is confined to an unmerged branch.

**THE STANDING CONCLUSION IS NOW STRONGER THAN "not yet solved", and future sessions should treat it as
closed:** eleven engine shapes across four sessions — five pass-level repairs, sync nodes, priority-only,
group-barrier, both-gates-on-elevation, no-barrier band-major, no-barrier band-major+midpoint bounds —
**every single one drives support to 0 and lands band-by-label in the 33k-39k range against shipped's
29,824.** That is not eleven near-misses; it is a measured floor. Enforcing "nothing before its carrier"
COSTS roughly 3,400-9,000 label-band inversions and 50-90 days of span on this building, because walls
genuinely both carry structure and rest on it. **The trade is real, and the user has already chosen:
§Z_STACK_XRAY_STAGING (#1139, shipped) makes the defect HONEST on screen without paying that price.
Do not re-open the engine without a NEW ruling that explicitly accepts the band/span cost.**

## §SUPPORT_ORPHAN — the new requirement, MEASURED FIRST (`audit_orphan_support.js`, committed)
User, 2026-08-03: elements with no valid carrier under strict §SUPPORT_ALL should not schedule
unconstrained; defer them until "some nearby support" exists. **Measured before building, and the
measurement reframes the requirement:**
```
§SUPPORT_ORPHAN nodes=63415 groundZ=158.61m noCarrier=40700
§SUPPORT_ORPHAN grounded(<=1m above groundZ, legitimate DAG seeds)=678  IfcFooting=444 IfcCurtainWall=178
§SUPPORT_ORPHAN TRUE_ORPHAN(airborne, zero carriers)=40022 (63.1%)  IfcPipeSegment=11385 IfcPipeFitting=10897 IfcDuctFitting=4248 ...
§SUPPORT_ORPHAN true-orphan by trade seq: seq5=30808 seq6=7176 seq3=1215 seq4=542
§SUPPORT_ORPHAN relaxed-reach: carrier below for 39729/40022; drop <=1m:4621 <=2m:6530 <=5m:39309 none-below-at-all=293
```
**It is NOT near-zero — it is 63.1% — but it is also NOT a population of anomalies.** The strict
rests-on predicate bounds the gap on BOTH sides (`|S.top_z - T.base_z| <= GAP`), so every suspended
service is an orphan by definition: a pipe at mid-storey has its slab 2.5m BELOW it. seq5 MEP alone is
30,808 of the 40,022. **Deferring them is a schedule-wide redesign affecting two thirds of the model,
not an exception path** — which is the opposite of what the requirement assumed, and is the reason it
must not be switched on casually. The population that actually matches the user's words ("floating with
nothing under it") is the `none-below-at-all` line: **293 elements, 0.46%.**

**⚠ A DATUM TRAP, paid for once here — do not use `Math.min(base_z)` as ground.** One stray element sits
at z=0 while the building's own lowest storey median is 168.8m (site datum), so a min-based ground
reported every element as "168m in the air" and the airborne/grounded split was meaningless. The audit
now uses the 1st percentile of `base_z` (158.61m), which correctly finds the 444 footings on the earth.

**Built anyway and measured (`CPM_ORPHAN=on`, shape 11):** one edge per orphan to its NEAREST
XY-overlapping carrier below, tolerance = **ONE STOREY HEIGHT taken from the ladder this function
already derives** (max gap between consecutive band medians, **6.1m** on Hospital — extracted, not a
constant, so a bungalow gets a bungalow's storey). One edge, never all candidates, because the strict
graph already carries a max in-degree of 1,101. Result: **39,445 orphan edges, 1,255 left
unconstrained, +8d span (252→260d), every other counter unchanged, no cycle (placed=63,415/63,415).**
It works and it is cheap. It is also carried by a parked engine, so it ships nowhere for now.

## Reusable, and where it lives
Branch `feat/element-cpm-elevation-dual-gate` (off `feat/z-stacking-oneshot`), pushed, no PR.
`audit_orphan_support.js` is the durable deliverable — it answers "what has no support at all" for any
building, independently of any scheduler. The four env knobs are left in `computeSchedule` so shape 12,
if it is ever justified, is a flag flip and not a re-derivation.

---

# ▶ RULING 2026-08-04 — the NEW ruling this file's own gate (L1442, "do not re-open without a new
ruling that explicitly accepts the band/span cost") asks for, before any 12th engine shape is built

**Not a new investigation — a synthesis of what the eleven shapes already proved, plus the architecture
context that makes the remaining ask smaller than "solve CPM" sounds.** Rates (crew/handling speed,
regional cost, productivity — the "5D" dimension) already live entirely in `viewer/rates/*.json`
(per-standard: `aramco2024_sa.json`, `cidb2024_my.json`, `rawlinsons2024_au.json`, etc.) and the engine
that consumes them (`schedule_gate.js`/`schedule_author.js`) never branches on WHICH json is loaded —
rates are pure data, the engine is invariant across region/building. That's the right shape, and it
means 100% of remaining risk is concentrated in one place: the ordering engine this file has spent
eleven shapes on. That concentration cuts both ways — a bug here has building-wide blast radius (see
`witness_wall_carrier_scope_all_copies.js`'s finding of 4 independently-drifted copies of "is S a real
support for T" before this file's work even started), which is exactly why it deserves a real ruling
instead of a 12th patch attempt.

**What eleven shapes already established, restated as two SEPARATE problems, not one:**
1. **A data-correctness bug, already isolated** — `audit_rank_vs_support.js` (L1197-1205): 1,735 of
   81,722 support edges have the carrier's STOREY LABEL ranked above what it physically carries, while
   the SAME edges have zero contradictions when ranked by real elevation. "The contradiction is in the
   KEY, not in the schedule." This is a storey-tagging defect, fixable independently of any ordering
   engine, and untouched by all eleven shapes because every shape treated it as part of the ordering
   problem rather than fixing the input data first.
2. **A genuine structural fact, not a bug** — walls (and any element that is simultaneously load-bearing
   AND load-bearing-upon) both carry structure and rest on it (L1330, L1440). Forcing one strict total
   order onto a dual-role element is why support-correct engines cost 3,400-9,000 label-band inversions
   and 50-90 days of span, measured, not tunable away (L1434-1442) — the element genuinely needs to be
   "early" (as a support) and "late" (as a thing built on top of what's below it) at once, and a single
   placement timestamp per element cannot represent both.

**The ruling, in two parts — deliberately smaller than "reopen the engine":**
1. **Fix problem 1 as a standalone data pass, before touching ordering at all.** Re-derive storey
   labels from the SAME elevation ladder `§CPM_DUAL_ELEVATION` already extracts (midpoint band bounds,
   L1419-1422 — already measured as a free, independent win: `relabelledByZ` 23,121→8,816). This is not
   engine work and does not require re-opening `computeSchedule` — it's a correction to
   `elements_meta.storey`-adjacent data, and it removes 1,735 edges' worth of manufactured contradiction
   before any ordering engine ever sees them.
2. **Stop asking one node to hold two roles.** This project already shipped exactly this pattern once —
   `§Z_STACK_XRAY_STAGING` (#1139, L1314-1364) decoupled an element's REVEAL/material state from its
   SCHEDULE order, and it worked precisely because it stopped trying to make one timestamp satisfy two
   different truths. Apply the same decoupling one level deeper, to the SCHEDULING key itself, not just
   presentation: split a dual-role element's single placement event into two logical events —
   "functionally available as a support for what's above" (gates downstream elements) and "its own
   erection/finish complete" (gates the film's reveal of the element itself, and can legitimately be
   LATER than the support-ready moment). Downstream elements key off the first; the element's own visual
   completion keys off the second. No engine shape has tried this — all eleven gave every element exactly
   one date and then fought over which invariant that one date should obey.
3. **Treat band/span as minimized, not eliminated, for whatever residual conflict remains after 1 and 2.**
   The 33k-39k band-inversion floor (L1436-1439) is measured, not a tuning miss — accept that a small,
   named residual may be irreducible even after the dual-role split, and optimize for MINIMUM violations
   subject to support=0, rather than the all-eleven-shapes goal of BOTH at zero. That is the "explicitly
   accepts the band/span cost" clause this file's own gate requires — now given a stated mechanism
   (parts 1-2) instead of an open-ended acceptance of eleven shapes' worth of unexplained cost.

**Why this is a smaller ask than "attempt #12":** parts 1 and 2 are each independently testable and
independently shippable — problem 1 has its own witness shape already available (`audit_rank_vs_support.js`
re-run post-relabel should show near-zero contradictions), and problem 2 only needs a second timestamp
column plus a repoint of existing consumers (support-gate reads the new "support-ready" column; the film
still reads the existing per-element placement column) rather than a new solver. Neither requires
re-deriving the eleven shapes' machinery from scratch. **Out of scope for this ruling:** actually
implementing parts 1-2 — this section is the spec, not the PR; the next session that picks this up should
witness-first each part per this project's standing rule, starting with part 1 (pure data fix, lowest
risk, unblocks measuring how much of problem 2 remains once problem 1 is gone).

---

## 2026-08-03 — INVESTIGATION ONLY: "Architecture phase all done on day one" (Terminal MaxQ bake) — user hypothesis WRONG on locus, RIGHT on effect. Real bug found, different file, different logic.

**Task:** diagnose only (no code/PR changes) — user watched a Terminal MaxQ bake and saw the whole
Architecture phase appear essentially done on the first visible day. User's own hypothesis to verify,
not assume: *"the logic within a single phase is not delved into"* (i.e. per-element dates degenerate
to the phase start). Grounded in the user's own real log:
```
§AUTHOR_MATERIALIZE schedule=SCH_AUTHORED mode=dated phases=5 leafTasks=5 assignments=48428 elements=48428
§CPE_BUILDUP_SOURCE source=captured leafTasks=5 ... window=2025-12-31..2026-08-03
§CPE_WORK_SCHEDULE ops=48432 span=1767225599999..1785734079545 workInFirst10%OfCalendar=51.7%
```

### §AUTHOR — where the 5 phases and 48,428 assignments come from
`viewer/schedule_author.js` `materializeDefault()` (called with `{start:'2026-01-01', phaseDays:30}` from
both call sites — `viewer/schedule_editor_ui.js:503` `doGenerate()` and `:654` the blank-model bootstrap):
buckets every element into ONE of the (≤11) named phases via `matchRule`/`matchNameOverride`
(`viewer/rates/sequence_rules.json` `SEQUENCE_RULES`/`NAME_OVERRIDES`, longest-substring `ifc_class`
match, name-regex override checked first for curtain-wall glazing). It then lays the **phases** out as
contiguous, **EQUAL-width, fixed `phaseDays`-wide** calendar slots ordered by ascending `sequence`
(`schedule_author.js:172-183`):
```js
ordered.forEach(function (p) {
  var s = blank ? null : _addDays(start, cursor * phaseDays);
  var f = blank ? null : _addDays(start, (cursor + 1) * phaseDays);
  cursor++;
  ...
  p.guids.forEach(function (g) { stmtTe.run([tid, g]); assignN++; });   // ALL of a phase's elements → ONE task
```
Every element in a phase maps to that ONE task row (`task_elements`), and that task carries exactly ONE
`[schedule_start, schedule_finish]` window — the same width as every other phase's window, **with zero
awareness of how many elements (or how much labor) are inside it.** This is the entire duration model;
there is no other code path (`doGenerate` and the blank-model bootstrap are the only two callers, both
hardcode `phaseDays:30`) and no proportional/workload-based alternative exists anywhere in the repo.

### §PLAYBACK-STAGGER — within a phase, elements are NOT all given the same date (hypothesis WRONG here)
`viewer/time_machine.js` `injectGantt`'s `_cap` overlay (lines 3860-3951) is the code that actually turns
a task's `[w.s, w.e]` window into individual element reveal timestamps, and it explicitly does NOT
collapse them onto the task's date — it sorts each phase's element bucket by `(base_z, seq, cz)` (a
2026-08-02 fix, `§STAGGER_SUPPORT_ORDER`, PR #1133, replacing an earlier `(seq, cz)`-only sort from PR
#882/#1078) and linearly distributes them across the window:
```js
// time_machine.js:3939-3942
var _n = _bucket.length, _span = Math.max(1, w.e - w.s);
_bucket.forEach(function(item, i) {
  var s_i = w.s + Math.floor((i / _n) * _span);
  var e_i = (i + 1 < _n) ? (w.s + Math.floor(((i + 1) / _n) * _span)) : w.e;
```
This is real, working, per-element distribution-within-phase logic — not a stub, not degenerate to the
phase start. It has its own witness (`witness_stagger_support_order.js`, G-SSO-1..4) whose commit message
records "6,240 → 0 within-task [carrier-before-carried] violations on real Hospital geometry." **The
user's stated hypothesis — that within-phase per-element staggering is missing/degenerate — is factually
wrong for the current `main` (verified `d4da218`, fetched+merged fresh before this investigation).**

### Real Terminal numbers (queried directly off `buildings/Terminal_extracted.db`, not invented)
`SELECT ifc_class, COUNT(*) FROM elements_meta GROUP BY ifc_class` sums to exactly **48,428** — matching
the log's `elements=48428` bit-for-bit, confirming this is the same population. Running the actual
`matchRule`/`SEQUENCE_RULES` bucketing logic (replicated verbatim, not approximated) against those counts
(all 33,324 `IfcPlate` are literally named `"Metal Deck:..."` — checked, none match the glazing name
override):
```
Superstructure   35,061   72.4%   (33,324 IfcPlate "Metal Deck" + 705 IfcSlab + 442 IfcMember + 432 IfcBeam + 158 IfcColumn)
MEP Rough-in      9,477   19.6%
MEP Final         2,373    4.9%
Architecture      1,259    2.6%   (486 IfcBuildingElementProxy + 333 IfcWall + 236 IfcWindow + 135 IfcDoor + ...)
Finishes            258    0.5%
Substructure          0    0%     (no IfcFooting/IfcReinforcingBar in this building at all)
```
Sequence numbers place these in calendar order **Superstructure(seq2) → MEP Rough-in(seq5) →
Architecture(seq6-8) → MEP Final(seq9) → Finishes(seq10-11)** — i.e. 5 leaf tasks (matches the log's
`phases=5`), with **Superstructure scheduled FIRST** (Substructure is empty, so Superstructure inherits
the earliest slot) while **Architecture is 3rd of 5, and is the smallest bucket bar Finishes.**

### The actual mechanism, and why it fully explains `workInFirst10%OfCalendar=51.7%`
This is a **phase-level date-RANGE-sizing bug, not a within-phase element-clustering bug**: because
`materializeDefault` gives every phase the same fixed `phaseDays` width regardless of population,
Superstructure — 72.4% of the ENTIRE building — is compressed into the same-width slot as Finishes'
258 elements, AND that slot is the earliest one on the calendar (lowest present `sequence`). Since
`_cap`'s within-task stagger genuinely spreads Superstructure's 35,061 elements evenly (by real Z/seq
order) across its own window, roughly the first HALF of that single window already contains close to
half of Superstructure alone (~17.5k elements, ~36% of the whole building) — and because MEP Rough-in
(19.6%, the 2nd earliest slot) contributes its own early tail on top, the cumulative population dated
within the first 10% of the OVERALL calendar plausibly reaches the observed 51.7% without needing any
element-level defect. (Exact live `phaseDays`/dates for this specific bake weren't recoverable — the
authored schedule lives only in that session's IndexedDB cache, never persisted to the git-tracked
`Terminal_extracted.db` — but the class-count skew and the phase-ordering are real, DB-verified, and
independent of the exact width used.)

### Why the user specifically named "Architecture," and the correction
Architecture (2.6%, 3rd of 5 slots) is neither the largest bucket nor the earliest slot — the opposite
of what "done on day one" would suggest if the defect were IN Architecture's own logic. The far more
likely reading: **Superstructure's 33,324-element "Metal Deck" roof/deck IS the building's visual mass**
(72% of all elements) and — being both largest AND scheduled first — appears essentially complete within
the first sliver of the film. By the time Architecture's own (small, 1,259-element) window opens partway
through, ~92% of the building (Superstructure + MEP Rough-in) is already visually placed, so the building
*looks* finished long before "Architecture" starts, and Architecture's own small population then finishes
fast in its own equally-narrow slot on top — reinforcing, not causing, the "all at once" impression the
user attributed to Architecture specifically.

### Verdict for a future fix
**Partially correct, wrong locus.** The user's diagnosis of "no staggering" is wrong — that logic exists
and is proven correct (`time_machine.js:3860-3951`, §STAGGER_SUPPORT_ORDER, witnessed). The REAL defect
is in `schedule_author.js`'s `materializeDefault()` (`schedule_author.js:104,164-183`, called from
`schedule_editor_ui.js:503` and `:654` with a hardcoded `phaseDays:30`): **phase calendar-window WIDTH is
a flat constant, not proportional to the phase's element count (or labor-days, via the already-extracted
`LABOR_RATES` productivity table).** A future fix should target phase-level duration allocation —
e.g. width ∝ Σ(`getInstallSecs(cls)` or `LABOR_RATES` productivity) per phase, or at minimum ∝ element
count — NOT the within-phase distribution algorithm in `time_machine.js`, which does not need touching.
No code was changed for this investigation.

## §BUILDUP_DAY_BATCH_FEASIBILITY — 2026-09-01 — MEASURED: no real day-buckets exist; batching would make the worst frame ~4x WORSE. NO-GO.
**Answers the ⛔ within-phase day-batching item's own precondition (this file, §"Named, not built
tonight", the `_cap` linear i/n question). Measurement only — no pacing behaviour changed, no flag
flipped, nothing built.** Data: the persisted `~/.cache/bim4d` runs, rebuilt once for the CURRENT
codeKey `567de7d89253` (the 2026-08-27 cache predates §PHASE_WATERMARK_FLOOR + 3 other schedule-input
commits) — Hospital 63,182 els + Duplex 1,119 els, shipped pipeline, §-logs read
(`witness.log`: `§TPL_MOVIE_BINDS_BARS remapped=63182/63182 degenerateTasksSpreadEvenly=0`).
Probe scripts + logs: session scratchpad `daybatch_measure.py` / `daybatch_burst_probe.py`.

**0. The question's premise is stale.** "The current `_cap` linear i/n distribution" is no longer
the mechanism: the canonical template path's `remapSolveToTasks` (`schedule_author.js:965-1044`,
§TPL_MOVIE_BINDS_BARS + §TPL_LAYER_ORDER + §FUTURE-item-2 tiling) now lays each task's elements out
in support-layer bands, tiled edge-to-edge with each element's width ∝ its own solve duration
(installSecs/crew). That is MORE continuous than i/n — duration-weighted, no day concept anywhere.

**1. Real day-buckets do NOT exist.** Hospital (`§DAYBATCH_*`, cache `567de7d89253_569fac128caf`):
- `§DAYBATCH_TIES distinctEnds=63179/63182 largestExactTie=2` — end_ts are pairwise-distinct
  continuous instants (live A/B on the user's bake said 59,258/5 on 63,415 ops — same verdict).
- `§DAYBATCH_INTRADAY` hour-of-day histogram min=2505/max=2779 vs 2633 expected if uniform (±5.5%),
  ends within 1 min of midnight = 123/63,182 = **0.19%**. No day-boundary concentration at all
  (24/7 calendar: `§CREW_DAY shift=24h/24h`). Duplex: 1.79%, same verdict.
- `§DAYBATCH_GAPS` biggest task (MEP Rough-in L3, 9,507 els): successive-completion gap p50 =
  **631,738 ms ≈ 10.5 min**, p90 ≈ 15 min, max 2.2 h — a smooth drip, never a daily clump.
- `§DAYBATCH_TASK_DAYRATE` per-day counts within each big task are near-FLAT: MEP RI L3 mean
  146.3/day CV=0.23; L4 153.0 CV=0.22; L5 149.5 CV=0.21; Arch Env L4 90.7 CV=0.31. A per-day
  "bucket" is exactly N/window — the binning of a continuous tiling, i.e. **an artifact of the
  spread, not schedule structure**. (Duplex's higher CVs, median 0.93, are 2-day-window edge
  fractions on tiny tasks, not structure either.)

**Where the pop actually comes from (also measured, since it bears on the recommendation):** the
worst frames sit MID-TASK, not at phase handovers. Hospital, 3,118 frames, cache pipeline:
`§DAYBATCH_FRAMES worst=94 at f1250 = 4.6x mean(20.3)`; f1250 = day 127.5, **no task boundary
within ±0.5d** — 82/94 els are ONE task's (TASK_MEP_Rough_in_Level_3, win [110,174]) run of SHORT
elements: `§DAYBATCH_BURST_MIX` their width median **45 s vs the task's 632 s** (installSecs p50
114 vs 1920) — the duration-weighted tiling packs a short-duration run (pipe fittings/short
segments) ~5-14x denser than the task's own mean. One task alone swings **p50=14 → max=82 per
frame** (`§DAYBATCH_BURST_TASKFRAMES`) while its per-DAY rate is flat (CV 0.23). The pop is
WITHIN-TASK DURATION-MIX CLUSTERING, sub-day scale, plus task overlap (f1250 adds 12 els of
Arch Env L4). The A/B's live worst f345 sits at d35.2 — the project's peak 3-task concurrency
plateau (`§DAYBATCH_DENSITY` d35-39 = 338 els/day: MEP RI L1 [34,69] + Arch Env L2 [34,47] +
Superstructure L4 [35,40]; per-day max 399 at day 36) — again overlap+clustering, again NOT a
phase boundary. (Cache vs live A/B worst frames differ — 94@f1250 vs 124@f345 — because
tmOpsSnapshot carries 63,415 ops vs the cache's 63,182 els and live activation adds steps the
cache pipeline doesn't replay; the SHAPE — clustering, not ties, worst 4.6-6.1x mean — agrees.)

**2. Prediction under day-batching (labelled prediction, computed from the measured per-day
distribution — not a claim it works):** batching a day's completions into one visible pulse puts
that day's WHOLE count on one frame. Hospital: 9.81 frames/day, per-day p50=195 p90=298 **max=399**
→ predicted worst frame **399 = 19.7x mean vs today's 4.6x — ~4x WORSE**, and
`§DAYBATCH_PULSE_PREDICTION daysWhoseFullCountExceedsCurrentWorstFrame=299/319` — 94% of all days
would each individually out-pop today's single worst frame. Duplex is worse still (101.5
frames/day: a pulse = 198 els on one frame = 234x mean vs 14.2x today). Spreading each "pulse"
over k frames needs k≥4.25 (~0.43 day) just to break even with today — at which point it is no
longer a pulse, it is roughly the existing spread. **There is no batching parameter that reduces
the worst-frame count; the mechanism can only trade it worse.** (Two buildings, same verdict —
not a single-model artifact.)

**3. So grouping would have to be synthetic — and the repo's own follow-up:** the grouping keys
that genuinely exist in the data are per-element crew duration (installSecs), support layer, task,
class — NOT calendar day; day membership is `floor(end_ts/86400000)` of a continuous tiling, i.e.
a bin edge, not a fact about the schedule. Reading, flagged as a USER question, not decided here:
(a) moving `end_ts` onto day pulses re-authors the timeline every consumer reads (scrubber, Gantt,
day counter, judge) — plainly INVENTION under the PRIME RULE and a direct violation of
§CPE_BUILDUP_FOLLOW_TM ("the buildup PLAYS the Time Machine timeline, it does not author one");
(b) a film-side-only pulse (renderer holds reveals and dumps them in day groups, cursor/day counter
untouched) is mechanically "presentation" (feedback: Prime-Rule scope = data, not presentation),
but since the day membership is measured here to be an artifact, the rhythm shown is one the
schedule does not contain — the SAME "renderer tells a story the day-counter contradicts" layering
violation this file already condemned in §CPE_EVEN_PHASE_PACING/§CPE_PHASE_STAGGER (and slated for
removal, item 3 of "THE RIGHT FIX"). Reading: invention in substance, presentation only in
mechanism — the user's call if they still want the construction-rhythm LOOK despite the numbers.

**VERDICT: NO-GO on within-phase day-batching.** Both halves of the precondition fail: no real
day-buckets to batch (1), and batching what the binning produces raises the worst frame ~4x instead
of lowering it (2). If the "all at once" pop is ever re-attacked, the measured levers are the ones
the data actually names: the short-duration runs inside `remapSolveToTasks`' duration-weighted
tiling (a presentation-neutral cap/spread on same-band SHORT-element density would address f1250's
82-element run directly) and task-overlap density (d35-39 plateau) — both schedule-shape facts,
neither needs a day concept. No code changed for this measurement.

**2026-09-02 CORRECTION to §0 above (and to every "cache pipeline" number in this section): the
premise was stale the OTHER way.** `remapSolveToTasks`' tiling was NOT the played mechanism — the
kernel_ops timestamps the film and the scrubber read were written by `injectGantt`'s per-task
AFFINE (`_tmRescaleToTaskWindow`, `time_machine.js`), and `displaySchedule` (what `cache_4d_run.js`
persists and `§DAYBATCH_*` measured) has no reader in `time_machine.js`. So `§DAYBATCH_FRAMES
worst=94 at f1250 = 4.6x mean` describes a map nobody played; on the played (affine) map the pile-up
is far worse — Hospital `TASK_Finishes_Level_5` has 77% of its 113 elements starting inside ONE
1%-of-bar bin, and 63% of every Hospital bar is dead air (nothing in progress). Full measurement,
fix and witness: `4D_GANTT_TM_REFACTOR.md` §FUTURE item 2 "2026-09-02 — §TM_REVEAL_SHIPPED"
(bim-ootb `§TM_REVEAL_TILED`: injectGantt now CALLS `remapSolveToTasks` in CPM order, dead air 0.0%
on 4 buildings, order preserved). After that lands, the played layer IS a duration-weighted tiling
and this section's residual levers (short-element runs, task overlap) apply to it as written.
`cache_4d_run.js` still persists `displaySchedule`, not the played map — a probe of the movie must
run `scripts/probe_tm_reveal_shipped.js` (sliced live functions, ~10 s on Hospital) or extend the
cache to persist the played map (not done, named here).
