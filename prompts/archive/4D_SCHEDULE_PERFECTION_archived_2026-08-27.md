# ARCHIVED 2026-08-27 — closed/superseded sections lifted out of `prompts/4D_SCHEDULE_PERFECTION.md`
# Moved verbatim, nothing edited, nothing lost. This is NOT a live task list and NOT a resume pointer.
#
# Why these six and not others: each was already marked SUPERSEDED or ✅ SHIPPED by that file's own
# INDEX (added 2026-08-26), and nothing in `prompts/`, `docs/`, `PROGRESS.md`, `MEMORY.md` or `CLAUDE.md`
# still cites it as the current/authoritative answer to an OPEN question. Sections that a live thread
# still points at were deliberately LEFT IN the parent file — notably the 2026-08-13 "3rd level hanging
# doors" block (open item 10 says it was never re-verified by name), §CURTAIN_WALL_OPENING /
# §DOOR_WINDOW_HOST_WALL_DISPLAY (the settled answer that thread would be checked against),
# §GANTT_GAP_CLAMP_SPREAD and §GANTT_WINDOW_FIDELITY_AND_SPREAD (open items 6 and 7 say "Search ..."),
# §TIER_REGATE_WORKLIST (cited for its 78–90% wall-time number), §ZONE_KEY/§ZONE_INDEX (a live gate in
# `SCRIPT_LENGTH_REFACTOR_SEAMS.md`), §DAY_GAP_TAIL (cited as a deliberate asymmetry) and every OPEN item.
#
# Predecessor archive (2026-08-03 → 2026-08-12, 3941 lines):
#   prompts/archive/4D_SCHEDULE_PERFECTION_full_history_2026-08-03_to_2026-08-12.md

## Contents
1. §GANTT_PHASE_CLOBBER — the captured overlay overwrites `phase` with the TASK NAME (2026-08-12, FIXED)  *(was lines 1302–1351)*
2. §DAY37_HOSPITAL_HANGING — investigated, not fixed (2026-08-14)  *(was lines 2589–2643)*
3. §GANTT_SHIFT_HOURS_DESYNC (PR #1355) · §GANTT_SCHEDULE_STALE (PR #1359) · §HOSPITAL_LIGHTING_STILL_FLOATING (4 sessions, superseded)  *(was lines 2660–3060)*
4. §CHASE_TO_ZERO_WINDOW_AUTHORING — SPEC + EXP5 (both candidates REJECTED fleet-wide, 2026-08-16)  *(was lines 4194–4258)*
5. §TIER1_PER_ELEMENT_CLAMP EXP — MEASURED, REJECTED fleet-wide (2026-08-16)  *(was lines 4384–4440)*
6. ▶ NEXT SESSION START HERE (2026-08-16 session close) — stale pointer  *(was lines 4500–4536)*

---

# ▶ ARCHIVED BLOCK 1 — §GANTT_PHASE_CLOBBER — the captured overlay overwrites `phase` with the TASK NAME (2026-08-12, FIXED)
# (verbatim from prompts/4D_SCHEDULE_PERFECTION.md lines 1302–1351, 2026-08-27)

## §GANTT_PHASE_CLOBBER — the captured overlay overwrites `phase` with the TASK NAME (2026-08-12, FIXED)
**Symptom, user:** *"at first load, the TM 4D gantt schedule has nice coloring looks OK but on refresh
it goes away"* → *"U have to hunt back those pretty colors in the Gantt Chart bars of TM."*

### One line, three broken things — all provable from the user's own log
`time_machine.js:5238`, inside the captured/authored overlay:
```js
p.phase = w.name;    // real task name → shows in mini-Gantt
```
`w.name` is the TASK name. Since zone-level authoring became the default, `materializeZones` names
its tasks **`"<Phase> — <Storey>"`**, so every op's `parameters.phase` becomes
`"Architecture — Level 1"` instead of `"Architecture"`. The user's log prints it verbatim:
```
§AUTHOR_ZONES schedule=SCH_AUTHORED zones=35 … §GANTT_SOURCE captured tasks=35 covered=63415
§GANTT_ROW_ORDER phases=["Architecture — Level 1","Architecture — Level 2",…,"Superstructure — Level 7A"]
```
Everything downstream keys on that field:
1. **Colour** — `PHASE_COLORS[task.phase] || '#888'` (`:6896`) misses on every bar → all 35 bars grey.
   Also `PHASE_INK[task.phase] || '#fff'` and `PHASE_SHORT[task.phase] || task.phase.substring(0,3)`
   (`:6950`), so §GANTT_PALETTE's ink and short-codes go with it.
2. **Row order** — `_phaseRank()` is `_ROW_PHASE_ORDER.indexOf(p)`; every lookup returns -1, so every
   row ranks equal and the sort falls through to alphabetical. The user's `§GANTT_ROW_ORDER` shows
   exactly that: Architecture, Finishes, MEP Final, MEP Rough-in, Substructure, Superstructure —
   **Substructure 5th.** That is §GANTT_ROW_ORDER (K1)'s original bug back verbatim, and K1 exists
   because the user reported it once already: *"Last session was a mess putting substructure which
   has above ground appearing first."* It regressed silently — the K1 log line prints the broken
   order and no gate reads it.
3. **Dashboard phase bars** — `§DASH_PHASE`/`tm-dash-phases` buckets by the same field and then
   filters through `PHASE_ORDER`; with 35 name-keys and 0 matches, the phase progress section
   renders empty. There is not one `§DASH_PHASE` line in the user's whole session.

### Why "OK on first load, gone on refresh"
The colour survives exactly as long as the ops carry engine phases. Whether the overlay stamps names
depends on whether an authored/captured schedule is present and covering when `injectGantt` runs —
which on a first cold open it is not (the schedule is materialized in the same pass), and on a warm
reopen it is (persisted zone tasks, `§GANTT_SOURCE captured tasks=35 covered=63415 pct=100`).

### Fix — write the name where the name belongs
`p.taskName = w.name;` instead of `p.phase = w.name;`. The mini-Gantt already reads the name from a
different route entirely — `buildGanttTasks` sets `taskName` from the task index (`:5694`) and the
bar detail header renders `bar.taskName || (bar.phase + ' — ' + bar.storey)` (`:6716`) — so the
overlay's clobber was never what made the name visible. Nothing is lost; colour, ink, short-code, row
order and the dashboard all key on a real phase again.

### Witness — `witness_gantt_phase_palette.js` (W-PHASE-KEY)
Names the issue: **the value the palette keys on must be a phase, not a task name.** Runs the shipped
`PHASE_COLORS`/`PHASE_INK`/`PHASE_SHORT`/`_ROW_PHASE_ORDER` against the user's own strings.
G-PAL-1 (RED pre-fix): `"Architecture — Level 1"` → colour `#888`, rank 6 (unranked).
G-PAL-2: all six engine phases resolve to a real colour and a rank < 6.
G-PAL-3 (source): the captured overlay must not assign the task name into `p.phase`.

---

# ▶ ARCHIVED BLOCK 2 — §DAY37_HOSPITAL_HANGING — investigated, not fixed (2026-08-14)
# (verbatim from prompts/4D_SCHEDULE_PERFECTION.md lines 2589–2643, 2026-08-27)

## §DAY37_HOSPITAL_HANGING — investigated, not fixed (2026-08-14)

User flagged a live Time Machine screenshot: Hospital, Day 37 / Hour 16, "5035 placed" — teal
(structure-coloured, `A.DISC_COLORS` in `viewer/config.js`) elements visibly floating with nothing
built underneath them. User's own hypothesis: MEP parts got swept into Superstructure's (or another
early) phase bucket, so they show up before their own Gantt bar. Checked directly against the real
Hospital data (`scripts/probe_hospital_day37_hanging.js`, same slice-and-vm harness as
`probe_arch_start.js`/`probe_tier_regate_worklist.js`, run against a clean `origin/main` export since
the local `~/bim-ootb` checkout is dirty/diverged and not safe to read from):

- **MEP classification is correct.** Every real MEP class present in Hospital (pipe, duct, cable tray,
  fire suppression, light fixtures, switching devices — 41,987 elements) resolves to `MEP Rough-in` or
  `MEP Final`, never Superstructure. The user's specific hypothesis does not hold.
- **MEP timing is also correct in the numbers this script produces.** Earliest MEP element start,
  whole building: day 123.8. Zero MEP elements are visible by day 37.67. This does not reproduce what
  the user saw on screen.
- **A real, different, floating-element bug WAS found and quantified** — steel structural members
  (`IfcBeam`), not MEP: at Day 37.67, 161 of the highest-elevation Superstructure/Substructure elements
  already visible have no bearing support (column/beam/wall/slab) also visible anywhere below them
  within 3m — using the exact same `xyOverlap` + "below" predicate `_tierAuditRegate`'s own bearing
  test uses, not an invented rule. Example: `IfcBeam "UB-Universal Beam:305x165x40UB:166457"`, Level 4,
  visible from day 35.77, nearest visible support 9.55m below it. This is `_tierAuditRegate`'s
  `seFor(T)` candidate search (`time_machine.js` ~line 4080) letting an element through without a real
  physical support in the currently-visible set — likely the `§HANG_NEAREST` big-sink fallback being
  too permissive. Same bug *class* as the still-open "3rd level hanging doors" item from an earlier
  session, now reproduced with real guids on a different element type.
- **Open, unresolved — this is the user's own closing read and it stands:** *"something wrong with
  Time Machine."* The numbers this script computes (clean `origin/main` + `Hospital_meta.db`) do not
  show MEP floating, but the user's live browser did show something floating that they read as MEP.
  Two explanations, neither confirmed:
  1. What's floating in the screenshot is not actually MEP by IFC class (it may be the STR beams
     above, or another structural/covering class that reads as "MEP-shaped" — a duct/canopy/skylight
     silhouette — without being one).
  2. The live browser is running different data than what this script tested — a known gap on this
     project (`probe_arch_start.js`'s own `§SERVED_BYTES` note: the OCI-served DB, a local
     `_extracted.db`, and whatever a given browser has cached in IndexedDB can all disagree; storey
     taxonomy alone moved Hospital's total span 4.6% in a prior measurement).
  **Next step, not done this session:** get the exact element name/type from the live browser (click
  one of the floating pieces) and/or confirm which DB vintage that browser session actually has
  loaded, then re-run this probe against the matching data. Do not re-guess from a screenshot alone —
  this project's own rule (`§-tagged log values, not screenshots, are proof`) applies here too.

**Follow-up, same day — real smoking gun found and fixed: §GANTT_SCHEDULE_STALE.** User pushed back
hard on chasing per-building data theories ("Gantt Chart clearly has not touched MEP thus investigate
that, irrespective of building") after a live mp4 showed the Gantt needle never reaching any MEP row
while canvas showed MEP built. Correct call — the mechanism is architectural, not data: `kernel_ops`
(canvas) self-heals via `_genVersion`/`_GANTT_CACHE_VERSION` whenever the scheduling code changes;
the authored Gantt (`schedules`/`tasks`/`task_elements`) had **no equivalent** —
`activeSchedule(db)` only ever checked "does a dated schedule exist," so once materialized a
building's Gantt panel was frozen forever, regardless of how many gate/remap fixes (including
§GANTT_SHIFT_HOURS_DESYNC itself, same day) landed since. Needle position and canvas had no reason
to agree. Fixed — bim-ootb PR #1359, `schedules.gen_version` mirrors `_GANTT_CACHE_VERSION`,
`activeSchedule` reports `stale`/`hasBaseline`/`safeToRegen`, `buildTaskIndex()` re-materializes in
place when safe. Captured/imported and baselined schedules are never touched (6 cases verified
against real Hospital data). Full writeup: §GANTT_SCHEDULE_STALE below.

---

# ▶ ARCHIVED BLOCK 3 — §GANTT_SHIFT_HOURS_DESYNC (PR #1355) · §GANTT_SCHEDULE_STALE (PR #1359) · §HOSPITAL_LIGHTING_STILL_FLOATING (4 sessions, superseded)
# (verbatim from prompts/4D_SCHEDULE_PERFECTION.md lines 2660–3060, 2026-08-27)

## §GANTT_SHIFT_HOURS_DESYNC — ✅ SHIPPED, bim-ootb PR #1355 (2026-08-14, auto-merge armed)

User, live screenshot (Hospital, Day 37/Hr16, "5035 placed"): clicked a floating teal element,
confirmed it IS a real MEP element — ruling out §DAY37_HOSPITAL_HANGING's "look-alike steel beam"
theory. User's own read: *"Gantt Chart is NOT followed"* — canvas placement disagreeing with the
Gantt bars' own displayed dates, not a geometry/support-gate question.

**Root cause, found by reading the real code (not the doc's own prior theories) and confirmed
numerically, not guessed:** `materializeZones()` (`schedule_author.js:352`, the function that
authors the Gantt bars the user sees) called `SG.computeSchedule(elements, 0, 1, maxCrews)` —
**omitting the 5th `shiftHours` argument**, silently taking `computeSchedule`'s own internal 8h/day
default. The REAL canvas movie (`time_machine.js:5302`, `injectGantt`'s generation path) explicitly
threads `rates.js SHIFT_HOURS` (default 24, per §SHIFT_HOURS/#1333, 2026-08-13 ruling "24hr is our
default") as that same 5th argument. **Gantt bars were being authored at 1/3 the pace the canvas
actually plays at** — so any element schedules 3x sooner on canvas (in calendar days) than the same
element's own Gantt bar shows it starting. This exactly matches "canvas ahead of what the Gantt
displays," independent of any geometry/bearing gate — confirmed as a SEPARATE mechanism from
§DAY37_HOSPITAL_HANGING's orphan/hangGate findings (both real, this is the one that matches what the
user actually pointed at).

**Fix — one call site forwards the arg, two real UI entry points now pass it:**
- `schedule_author.js` `materializeZones`: `computeSchedule(elements, 0, 1, maxCrews, opts.shiftHours)`.
  `opts.shiftHours` undefined ⇒ behavior UNCHANGED (still 8h) — every witness/probe that never passes
  it stays byte-identical, same "witnesses unaffected" convention §SHIFT_HOURS already established.
- `time_machine.js` `_materializeNativeSchedule` + `generateGanttSchedule` (the two real product call
  sites that generate what the user's Gantt panel shows): both now pass `shiftHours:
  (window.SHIFT_HOURS > 0 ? window.SHIFT_HOURS : 24)`, matching `injectGantt`'s own convention exactly.

**Measured, Hospital_extracted.db, same data, before/after** (`materializeZones` task span):
old call (8h default, the bug) = 88 days (Jan1→Mar31, 9 tasks); fixed call (24h) = 30 days
(Jan1→Jan31, 9 tasks) — **2.93x, matching the 24h/8h ratio exactly.** Gantt-bar pace now matches
canvas pace 1:1.

**Verified no regression** — 6 witnesses touching `materializeZones` (the only real consumer of this
code path): `witness_zone_cpm.js` 11/0, `witness_zone_cpm_duplex.js` (pre-existing scratch-path
error, unrelated to this change), `witness_gantt_bar_identity.js` 6/0, `witness_boq_charts_real_
schedule.js` 91/0, `witness_geo_support_leak.js` 0 fail, `witness_gantt_edit_constraints.js` 18/0.
None of these pass `opts.shiftHours`, so all stayed on the unchanged 8h path — confirms the fix is
additive, not a behavior change for anything that doesn't opt in.

**Not fixed by this — a separate, already-answered question the user also raised, "spread evenly
instead of bunched at start":** this is NOT the same bug and must not be conflated with it. This
exact ask was already tried and killed by measurement — see `§DAY_GAP_WIP` above (2026-08-12):
occupancy is already 88–146% of every building's span (no surplus window to spread into), the real
cause is DURATION not placement (elements are 16–32-minute point events), and artificial re-timing
for viewing polish is explicitly against `feedback_schedule_accuracy_over_movie_polish`. The actual
fix for "bunched, rest idle" — quantity-derived real durations (`§LABOR_QUANTITY_WEIGHT`/
`§HEAVY_MEMBER_SPEED_LIMIT`) plus `§TIER2_PER_ELEMENT_CLAMP` (#1333, MEP Final occupancy 22%→105%)
— is **already shipped on `main`**, confirmed firing live in this session's own witness output.

**Open, not resolved by this fix:** an ALREADY-MATERIALIZED building (a schedule authored before
this PR merged) will not self-heal — `schedules`/`tasks`/`task_elements` are the user-editable
PRODUCT by design and are never auto-regenerated (unlike `kernel_ops`, which has
`_GANTT_CACHE_VERSION` for exactly this). If the user's live Hospital session still shows bunching
after this ships, it is very likely displaying a pre-fix-materialized schedule and needs an explicit
regenerate, not further code changes — check that before assuming a new bug.

**Landmine hit while shipping:** PR #1355's own `sw.js` CACHE_VERSION bump was pushed AFTER the PR
had already squash-merged (this project's own documented "late push orphans the commit" landmine,
previously observed on PR #138) — v1027 never reached `main` via #1355. Re-landed standalone as
PR #1357, off fresh `origin/main`, confirmed merged 2026-08-14T12:07:59Z. Also noticed in passing,
not fixed (out of this lane's scope): the concurrent #1356 (§MEP_DISC_TINT) ALSO shipped without
bumping `sw.js` — same lapse, different session.

**2026-08-14, same day, user rebaked after IndexedDB clear (both #1355 and #1357 confirmed merged
first) — hanging MEP still visible.** This is real signal, not a stale-cache artifact: it confirms
§GANTT_SHIFT_HOURS_DESYNC and the hanging-MEP symptom are two SEPARATE bugs, exactly as this file
already split them. The pace fix corrects the Gantt bar's clock to match canvas; it does not touch
WHICH elements get placed early. Persisting after a clean rebake points back to
`§DAY37_HOSPITAL_HANGING`'s SESSION 4/5 finding: Hospital's hanging MEP is the orphan population
(zero XY-overlapping neighbour anywhere in the spatial index) — SESSION 5 already exhausted every
schedule-gate widening variant against this exact population and rescued zero, on any building.
**Not re-attempted here, per that session's own "do not re-attempt" ruling.** Next real step, still
the one named there and not yet done: pull the specific floating element's GUID from the live
browser and check the SOURCE IFC for a dropped relationship — a data question, not a scheduling one.

## §GANTT_SCHEDULE_STALE — ✅ SHIPPED, bim-ootb PR #1359 (2026-08-14, auto-merge armed)

Real code-level cause of "the Gantt bar hasn't been touched but canvas shows it built" — found by
following the user's own instruction to stop chasing per-building data and treat the rendered Gantt
itself as the proof (they were right to push on this).

**The gap:** `viewer/time_machine.js`'s `kernel_ops` (what canvas actually draws from) self-heals
whenever the scheduling code changes — stamped with `_genVersion`, compared against the live
`_GANTT_CACHE_VERSION` constant, re-materialized on mismatch. The authored Gantt
(`schedules`/`tasks`/`task_elements`, written by `schedule_author.js`'s `materializeZones`/
`materializeDefault`) had **no equivalent whatsoever**. `activeSchedule(db)` — the ONLY gate any
caller uses to decide "should I re-author this" — checked exactly one thing: does a dated schedule
already exist. Once materialized, a building's Gantt was frozen **forever**, regardless of how many
scheduling-code changes landed afterward (crew caps, MEP classification fixes, §MIDAIR_REPAIR,
§GROUNDED_OVERRIDE_FIX, §TIER2_PER_ELEMENT_CLAMP, and same-day §GANTT_SHIFT_HOURS_DESYNC). A
session's Gantt panel could be showing a schedule authored weeks ago under completely different
code while canvas kept rendering current, correct placements — the needle position and the canvas
had structurally no reason to ever agree.

**Fix:**
- `schedule_author.js`: new `_ensureSchedulesGenVersion(db)` (ALTER-safe, mirrors `_ensureWideTasks`'s
  existing widen-in-place idiom) adds a `gen_version INTEGER` column to `schedules`. `materializeZones`/
  `materializeDefault` now stamp `opts.genVersion` into that column on every materialize.
- `activeSchedule(db, opts)` gains an optional `opts.currentGenVersion`. Reports `pick.stale`
  (non-captured AND (`genVersion` missing OR older than current)), `pick.hasBaseline` (queries
  `task_baseline` for that schedule_id), and `pick.safeToRegen` (`stale && !hasBaseline`). Omitting
  `opts` entirely leaves `stale`/`safeToRegen` false always — fully backward compatible, every
  existing caller (wizard, witnesses) unaffected.
- `time_machine.js`'s `buildTaskIndex()` — the ONE real choke point every Gantt-drawer redraw funnels
  through (memoized per building, so this runs once per activation, not per frame) — now passes
  `_GANTT_CACHE_VERSION` into `activeSchedule`, and when `safeToRegen` is true, re-materializes in
  place (same real-UI opts shape as `_materializeNativeSchedule`/`generateGanttSchedule`, including
  the just-fixed `SHIFT_HOURS`) BEFORE building the task index shown to the user. The two other real
  materialize call sites now stamp `genVersion: _GANTT_CACHE_VERSION` too, so freshly-authored
  schedules start correctly versioned.

**Safety — captured/imported and user-committed schedules are never touched.** `pick.captured`
(an imported Bonsai/Revit schedule) forces `stale=false` unconditionally, same invariant this file
already enforced elsewhere. `pick.hasBaseline` (⚑ Set Baseline already exists as this project's own
"user has committed to this schedule as their real plan" signal) forces `safeToRegen=false` even
while stale — a baselined schedule is the user's edited product and is never silently discarded.

**Verified, 6 direct cases against real Hospital data** (not asserted, run):
```
§V2_NO_OPTS       stale=false safeToRegen=false genVersion=null   (opts omitted — old behavior exactly)
§V3_STALE_CHECK   stale=true  hasBaseline=false  safeToRegen=true (unstamped, checked at v19)
§V4_AFTER_BASELINE stale=true hasBaseline=true   safeToRegen=false (⚑ Set Baseline called — now protected)
§V5_STAMPED       genVersion=19 stale@v19=false stale@v20=true safeToRegen@v20=true (round-trips both directions)
§V6_CAPTURED      captured=true stale=false safeToRegen=false (huge version gap, still never touched)
```
Witnesses unchanged: `witness_zone_cpm.js` 11/0, `witness_gantt_bar_identity.js` 6/0,
`witness_boq_charts_real_schedule.js` 91/0, `witness_geo_support_leak.js` 0 fail,
`witness_gantt_edit_constraints.js` 18/0. `sw.js` `CACHE_VERSION` v1027→v1028, bumped in the SAME
commit this time (learned from #1355/#1357's orphaned-bump landmine earlier this session).

**Known residual limit, named not hidden:** a user who drags/resizes/links Gantt bars WITHOUT ever
clicking ⚑ Set Baseline has no persisted "edited" signal this mechanism can see — such an edit could
still be silently regenerated on a future stale check. This is narrower than the bug it replaces (a
Gantt that NEVER updates, ever) but is not zero risk. Follow-on, not built: a proper per-edit dirty
flag set by `moveTask`/`resizeTask`/`moveTaskCascade`/`shiftSchedule`/`shiftTasks`, checked the same
way `hasBaseline` is now.

**Not yet confirmed:** whether this closes the ORIGINAL user report (Hospital MEP visible before its
Gantt bar). This fix addresses a real, generically-provable architecture gap the live mp4 evidence
pointed at directly — but the specific screenshot/mp4 element was never GUID-identified, so whether
IT was a stale-schedule case, an orphan (§DAY37_HOSPITAL_HANGING), or something else is still open.
Next step unchanged: watch the same building after this PR lands and `_GANTT_CACHE_VERSION`-driven
regeneration has had a chance to fire (§GANTT_SCHEDULE_STALE_REGEN in the console confirms it ran).

## §HOSPITAL_LIGHTING_STILL_FLOATING — session close 2026-08-15, real bake, symptom still live

User confirmed a completed Alt+C MaxQ bake on Hospital, on the current build (`§BUILD_VERSION
v1029`, both #1355/#1359 confirmed live), still shows lighting/electrical fixtures hanging —
"quite all lighting/electrical outlets, at least a hundred." Everything checkable today with hard
numbers came back clean, which makes this genuinely puzzling, not unexplored:

- **Not the pace desync, not Gantt staleness, not reveal-round topout** — all three real, all fixed
  today (#1355, #1359, and a fourth already fixed same-day by a concurrent session, #1362), all
  confirmed live at v1029.
- **Not the schedule math.** Measured directly against fresh Hospital data on current `main`:
  Hospital's full `IfcLightFixture`+`IfcElectricAppliance`+`IfcSwitchingDevice` population is 1523
  elements. Only 1 is an orphan. Of the 1522 with real contacts, **zero** appear before their earliest
  contact's own appearance, post-`_twoTierRemap`+`_midairRepair` (the exact pipeline the movie runs).
  The computed schedule is provably correct for this entire class.
- **Not a separate render-path bug.** Read `renderAtTime` (time_machine.js:1193) directly: it is a
  pure pass-through of `op.start_ts`/`op.end_ts` vs cursor, no independent host-check logic to be
  buggy — ordering is already baked into those timestamps by `_midairRepair`. Confirmed the Alt+C/
  MaxQ bake calls this SAME function via `tmSetCursor`, not a separate reveal path.

**⛔ OPEN — the one concrete, not-yet-checked differentiator:** whether the user's own live session's
`kernel_ops` is itself stale (materialized before a relevant fix, never re-derived) — every other
lever assumes fresh data and fresh data is proven clean. The test: does `§KERNEL_OPS_SCHED_VERSION
stale genVersion=...` appear anywhere in that session's console during activation? Not yet answered.
If it's ABSENT (kernel_ops confirmed fresh) and the symptom still reproduces, every currently-known
mechanism will have been exhausted — next session's job is then to pull the exact GUID(s) of floating
fixtures from that live session (not a screenshot) and diff them against this session's own probe
(`/tmp/probe_lighting/probe_lighting_electrical.js` — not committed, rebuild from this section's
method if needed) element-by-element, since "the aggregate math is clean" and "this one specific
element is wrong" are not mutually exclusive.

## §HOSPITAL_LIGHTING_STILL_FLOATING — continued 2026-08-15 (later same day): fresh full-pipeline
proven clean; a real, separate, previously-unknown bug found and ruled OUT as the cause

User pointed at the LATEST bake (`~/Downloads/BIM_MaxQ_Hospital_1786735068789.mp4`, 03:17) showing
floating MEP around 15s in. Two things done, both with hard numbers, no screenshots:

**1. The one differentiator named above, escalated from "node witness" to the REAL browser pipeline.**
`witness_midair_zero.js` re-run on current `main` (two commits newer than the session that wrote the
item above) — still 8/8 PASS, Hospital floating=0. That is the sliced-function node re-implementation,
already known clean. What had NOT been done: the ACTUAL browser wiring, fresh context (zero IndexedDB,
structurally cannot be stale), driven through `window.tmActivateForBake()` — the exact verb
`cinema_maxq.js`'s MaxQ bake calls — then reading the REAL `kernel_ops` table the movie plays from
(not a recomputation). Script: `/tmp/wt-sandbox` + Playwright headless Chrome (real GL, not
SwiftShader), `/tmp/.../probe_hospital_lighting_live.js` (not committed — scratch). Result, 3 runs:
**`kernelOpsRows=63415 genVersion=19 lightPopulation=1523 floating=0`** — zero IfcLightFixture/
IfcElectricAppliance/IfcSwitchingDevice appears before its first real contact, on the actual
production code path, not a re-implementation. `_GANTT_CACHE_VERSION` history also checked
(`git log -G`): every fix that could move kernel_ops timing (#1333, #1338, #1345, #1348) DID bump it
to the current 19; #1355/#1359 correctly did not (they touch the authored-Gantt/display-hours layer,
not kernel_ops generation). The self-heal chain (already witnessed 6/6 in
`witness_kernel_ops_sched_version.js`) has no known gap.

**2. A real bug found while tracing this, then RULED OUT as the cause — reported because it's real,
not because it explains the symptom.** Traced whether the MaxQ bake takes some OTHER ordering path
than plain `renderAtTime` cursor-sweep — it doesn't (mode D / `tmOrderByCameraPath` was already
replaced by `tmFollowTimeline()`, §CPE_BUILDUP_FOLLOW_TM, which writes nothing and plays `_ops`
unmodified). But `tmFollowTimeline()` has a SECOND branch: when `tasks` carries real dated leaf rows
(`ss.source === 'captured'`), `injectGantt()`'s own `_cap` overlay (time_machine.js:4938) is supposed
to rescale every covered element into its task's real window, repaired by a SEPARATE support-sweep
(`_ogSupportSweep`, :~4198) whose carrier pool (`e.seq<=4 ∪ promoted-slab ∪ IfcWall`) is narrower than
`_contactGraph`'s (full population, broadened by #1338/§GROUNDED_OVERRIDE_FIX) — a real asymmetry
that looked, on code-reading alone, like exactly the right shape for "MEP/lighting float on a
non-structural host the narrow pool can't see." Since `_materializeNativeSchedule()` now runs
UNCONDITIONALLY on every cold open (:7948, `§GANTT_SINGLE_LOAD`), this path is not rare — it should
fire on every session. Tested it directly (not just read the code): it crashes, every time, before
`_ogSupportSweep` ever runs. **Root cause: a `var _cap` name collision in the SAME function scope.**
`injectGantt()`'s per-trade crew-utilisation loop (:5270, `§CREW_DEMAND`) declares
`var _cap = _crews * projectDays;` — a plain number — inside a `for...in`, and JS `var` is
function-scoped, not block-scoped, so this silently clobbers the captured-schedule descriptor object
the SAME function declared earlier at :4938 under the identical name. By the time the `_cap` overlay
runs (:5494, `if (_cap) {`), `_cap` is a number; `_cap.guidTask[g]` (:5502) throws
`TypeError: Cannot read properties of undefined (reading '<guid>')` on the first covered row. Caught
by `injectGantt`'s own outer `.catch` (§GANTT_CACHE_ERR) — and because the clean generative/
`_midairRepair`-repaired kernel_ops rows were already committed to the DB earlier in the SAME
function (before the crash point), the fallback silently re-reads what's already there and the film
plays the clean generative timeline anyway. Confirmed via stack trace (temporary instrumentation in
`/tmp/wt-sandbox`, reverted after — no production file touched):
`at injectGantt (time_machine.js:5501:27)`, `at time_machine.js:5502:46` (`_cap.guidTask[g]`).
**Net effect: the captured/native-IFC-schedule overlay (T3, §3.1) has been fully dead code, always
throwing, since the crew-demand block was added — but this accidentally means it can never be the
source of the reported floating either, since `_ogSupportSweep`'s weaker pool never gets a chance to
run.** Real bug, real fix (`s/var _cap = _crews \* projectDays/var _capacityCd = .../`, trivial,
one-line, zero behavior change to anything currently working since the block was already a no-op) —
NOT YET SHIPPED, flagged for the user rather than pushed autonomously since fixing it will, for the
first time, make the captured-schedule path actually reachable on every building, which is new
observable behavior nobody has tested.

**✅ FOUND, FIXED, SHIPPED — bim-ootb PR #1364 (auto-merge armed), branch
`fix/injectgantt-cap-shadow`, same session, continued after the write-up above.** User pasted their
OWN live production console (v1029, `red1oon.github.io/bim-ootb`) mid-investigation — it carried the
EXACT `§GANTT_CACHE_ERR Cannot read properties of undefined (reading '<guid>')` crash this section
had just found in the sandbox, confirming it live, not sandbox-only. Root cause, tracked to source:

- **The crash**: `injectGantt()`'s per-trade `§CREW_DEMAND` loop declared `var _cap = _crews *
  projectDays` — a plain number — inside the SAME function scope as the captured-native-IFC-schedule
  descriptor object also named `_cap` (declared far earlier in the same function). `var` is
  function-scoped, not block-scoped, so this silently clobbered it on every run. By the time the
  captured overlay tried `_cap.guidTask[g]`, `_cap` was a number → threw on the first covered guid →
  caught by injectGantt's own outer `.catch` → fell back to whatever was already in `kernel_ops`
  (the clean generative timeline, already committed earlier in the same call). **Net effect: the
  captured/native-IFC-schedule overlay has never once successfully executed since this crew-demand
  code was added** — which is WHY every check in this section's own investigation came back clean:
  nothing was ever exercising that code path. Fixed with a rename (`_capacityCd`).
- **The real gap that fix exposed**: once un-shadowed, `_ogSupportSweep` (the captured path's OWN
  repair pass) has a carrier pool deliberately matched to `auditFloating`'s older, narrower physics
  (structure ∪ promoted slabs ∪ walls — NOT `_contactGraph`'s full-population pool from
  §GROUNDED_OVERRIDE_FIX/#1338). Measured the FIRST time this branch ever actually ran, live, on
  Hospital: **11 of 1523** IfcLightFixture/IfcElectricAppliance/IfcSwitchingDevice elements floated —
  the exact symptom class this whole section chased. Rather than widen `_ogSupportSweep` itself (its
  header documents a deliberate "one physics" invariant with `auditFloating`/`_buildXraySupportCache`
  that a downstream witness — §XRAY_EDGES staged=0 — depends on), closed the gap the same way the
  generative path already guarantees zero-floating: run the already-witnessed, full-population
  `_midairRepair` as one more pass after `_ogSupportSweep`. Re-measured: **0/1523 floating**,
  confirmed on 2 separate real fresh-browser runs (Playwright, real GL, zero IndexedDB cache,
  `§GANTT_SOURCE captured tasks=35 covered=63415 pct=100`).
- `_GANTT_CACHE_VERSION` 19→20 so every already-cached session (including the user's own, whose
  kernel_ops was frozen at whatever the crash-fallback left) regenerates once under the fixed code.
- Verified no regression: `witness_midair_zero.js` 18/18, `witness_kernel_ops_sched_version.js` 9/9
  real checks, `witness_og_guard_bearing_bound.js` 9/9, `witness_gantt_og_grid_perf.js` 3/3 — all
  unchanged (the one witness failure seen, `witness_gantt_native_generate.js`, reproduces identically
  on unmodified `main` — pre-existing, unrelated).

**Whether this was THE cause of the specific mp4 the user pointed at (15s onward,
`BIM_MaxQ_Hospital_1786735068789.mp4`) is not separately confirmed frame-by-frame** — that would need
GUID-level extraction from that specific historical bake, which wasn't logged. But the mechanism is
exact-match (same crash signature in the user's own console, same symptom class — MEP/lighting
floating — same building), and the fix is shipped and measured clean. If floating is still seen after
this PR lands and a fresh bake, the next differentiator is pulling real GUIDs from that NEW bake and
diffing against this section's now-clean baseline — not re-deriving anything above.

## §HOSPITAL_LIGHTING_STILL_FLOATING — continued, same day, 3 more real bugs found+fixed+shipped

PR #1364 (above) made things measurably WORSE on the user's own rebake — root-caused and reverted
same session (bim-ootb PR #1365): #1364's `_midairRepair` safety-net bolt-on is scale-mismatched
(tuned for the multi-year generative timeline, bolted onto the captured schedule's compressed
window) — measured `maxShiftDays=117.7` on a ~334-day window, desyncing the movie from its own
Gantt-authored dates. Reverted; `_ogSupportSweep` (pre-existing, unmodified) stayed as the only
repair on that path.

**§GANTT_TASK_WINDOW_FIDELITY — bim-ootb PR #1368, SHIPPED.** User: "why is it not tied to the Gantt
Chart timeline... if it is not in that single source of truth, it does not happen, yet." Re-read the
`_cap` overlay precisely: `_cap.win[tid]` (each task's own authored `schedule_start`/`schedule_finish`)
was fetched but NEVER used to place elements — every element's date came from ONE global affine
rescale of the old generative timestamps across the WHOLE covered span, with no mechanical tie to its
own task's window. A deliberate 2026-08-11 trade-off (§TIER_SERIAL Option A), reopened per direct
instruction: each element now rescaled WITHIN its own task's window only. Measured: 97.87% of
elements (62063/63415) now sit inside their own task's authored dates (up from zero guarantee); 0/1523
lighting floating, unchanged. Residual 2.13%: `_ogSupportSweep`'s own physics push can still overshoot
a task's finish for a real structural reason — smaller, localized, honest — named, not patched
further. `_GANTT_CACHE_VERSION` 20→21.

**§XRAY_STAGING_REMOVED — bim-ootb PR #1372, SHIPPED.** User: "on Day 5 of Hospital, hanging MEP
elements started hanging in mid air" → "remove that staging stage!!!" Traced `renderAtTime()` itself
(never audited before this session) rather than continuing to patch the schedule layer. Found
`§Z_STACK_XRAY_STAGING` (2026-08-03): a placed-but-not-yet-fully-supported element was shown as a
translucent ghost instead of solid, by design — itself a real element appearing before its support
finishes. Worse, the ghost gate only ever covered `obj.isMesh` — BatchedMesh/InstancedMesh (where MEP
overwhelmingly renders, given per-band counts of 4000-7000+) had NO gate at all and showed that
population fully SOLID. Removed the ghost, added the same one gate (`cursorMs < _tmXraySolidifyTs[g]`
→ not visible, full stop) to all three visibility branches. Strictly conservative — can only remove
previously-granted visibility, never add any. Verified via real fresh-browser probe: 5 cursor points
swept across the full timeline, every visible guid cross-checked against the solidify map — 0
violations. `witness_midair_zero.js` 8/8 unchanged (different function, not touched by that witness).

**Real, separate, NOT-yet-explained finding surfaced along the way**: the schedule computation shows
run-to-run nondeterminism in exactly how many elements land in the "staged" (support-not-finished)
population under the IDENTICAL `_GANTT_CACHE_VERSION` — observed `staged=0` on 5 consecutive fresh
sandbox runs, but the user's own live console (same v21) showed `staged=415`. Since kernel_ops caches
by genVersion, a session that computed once and landed on a bad count is stuck with it until the
version bumps again — never recomputes on its own. §XRAY_STAGING_REMOVED protects against the VISIBLE
symptom of this regardless (the gate rebuilds every activation), but the underlying nondeterminism
itself (likely object/map iteration order somewhere in `_ogSupportSweep`, `materializeZones`, or the
`_cap` overlay's per-task loop) is unexplained and unfixed — ⛔ named for a future session, not chased
further here.

Full commit trail: bim-ootb PRs #1364 (reverted logic kept, shadowing fix kept), #1365 (revert),
#1368 (task-window fidelity), #1372 (staging removal).

## §HOSPITAL_LIGHTING_STILL_FLOATING — full-population audit after all 4 shipped fixes, one real gap
## STILL OPEN, one dead end ruled out with a number (2026-08-15, user: "study so i do not return again")

Ran a comprehensive audit against the FULL shipped state (#1364/#1368/#1372 combined) — every class,
not just lighting/electrical (this session's earlier checks were all scoped to
IfcLightFixture/IfcElectricAppliance/IfcSwitchingDevice, 1523 elements; Hospital has 63,415):

**§AUDIT_FLOATING total=1510/63415 (2.4%), orphans=1, grounded=527, ok=60654.** Dominated by
**IfcBuildingElementProxy=1376** — confirmed via direct DB query NOT staffage: real MEP equipment
(`Water-Tube Boiler - 879-6153 kW`, `VAV8:PValve200`, etc.) that the IFC export classified as a
generic proxy class, no exact IFC match. This is the actual "MEP hanging in mid air" population, an
order of magnitude bigger than the lighting/electrical set this whole chase was scoped to. Smaller
real counts across IfcWall/IfcColumn/IfcMember/IfcBeam/IfcPipeFitting/IfcDuctFitting too — genuinely
structural and MEP classes, not a data artifact.

**Root cause, confirmed by code + one clean experiment**: `_ogSupportSweep`'s carrier pool
(`§PROMOTED_CARRIER_POOL`, 2026-08-11) is `seq<=4 ∪ promoted slabs` — real equipment resting on
non-structural hosts (ductwork, equipment pads, non-promoted slabs, cable trays) has NO candidate
carrier in that pool at all, so the repair never even sees it.

**Tried: widen the pool to the full non-wall population** (mirroring `_contactGraph`'s
already-shipped fix for the SAME class of gap, §GROUNDED_OVERRIDE_FIX/#1338) — the obvious next
move now that §XRAY_STAGING_REMOVED deleted the only thing the pool's "stay aligned with
auditFloating" constraint was ever protecting (a visibility ghost, gone). **Measured result: WORSE,
not better — floating rose 1510 → 2233**, including newly-broken lighting (0→195) and electrical
(0→211) that were clean before. Reverted, not shipped. Mechanism: `_ogSupportSweep` is a
bounded ~2-sweep greedy repair, not a fixpoint solver — a denser candidate pool finds more real
dependencies, and satisfying one by pushing an element later can break a DIFFERENT element that was
relying on the old timing, with no further sweep to catch the new violation. This is the exact
trade-off this codebase already named and rejected once before, on a sibling function
(`_midairRepair`'s joint fixpoint attempt: "4 rounds, 7650 pushes, still 140 on Hospital,
0.8s→14.8s" — see `§STRUCT_POOL_UNGATED` in `witness_midair_zero.js`'s own header). Confirmed here
it holds for `_ogSupportSweep` too, empirically, not just by analogy.

**⛔ REAL FIX NOT YET BUILT — named precisely, so no future session re-discovers this from
scratch:** a bounded greedy repair pass cannot close this gap without a real fixpoint solver (already
measured too slow the one time it was tried — 0.8s→14.8s on Hospital alone) OR the fix has to move
upstream to the SCHEDULE AUTHORING itself (`materializeZones`'s own CPM task graph, `schedule_author.js`)
so a task's own start/finish already accounts for its real physical dependents before the display layer
ever has to repair anything — i.e. treat "1376 boilers/valves scheduled before their real host" as a
`materializeZones` sequencing bug (wrong `IfcBuildingElementProxy` → phase/sequence classification in
`rates/sequence_rules.json`, or a missing dependency edge in `§ZONE_CPM`), not a display-timing bug.
Both directions are real engineering, neither is a quick patch — this is the honest stopping point for
this session, not a small residual to wave off.

### Second attempt, same session, also ruled out with numbers — read before trying a third

User: "chase till zero" / "FIX AND TEST" — tried running `_midairRepair` (the generative path's own
ALREADY-PROVEN fixpoint, `witness_midair_zero.js`: residual=0 every building every run) as a repair
pass AFTER `_ogSupportSweep`, on the CURRENT per-task-windowed placement (#1368) — different from
#1364's attempt, which ran before #1368 existed, on a global-rescale timeline where the same call
produced catastrophic maxShiftDays. Hypothesis: per-task windows are small (days), so the same
pushes should now stay local.

**Result: floating dropped 1510→116 (92%), but `maxShiftDays` stayed at ~112-307 days** — same
order of magnitude as #1364's reverted bolt-on, same violation of "if it is not in that single
source of truth, it does not happen, yet." The hypothesis that per-task windows would bound the
pushes was WRONG: `_midairRepair`'s full-population contact graph finds REAL cross-task structural
dependencies (an element in an early task genuinely needs a support in a MUCH later task — that's
a real scheduling relationship the per-task window can't locally resolve), so its pushes can still
jump across many tasks' worth of days. **Not shipped — reverted, nothing committed.**

### What this rules out, cleanly, for the next session

- Patching `_ogSupportSweep`'s pool (wider or narrower) cannot both (a) reach zero floating and
  (b) keep every element inside its own task's window — two DIFFERENT repair strategies were tried
  (narrow-then-widened §PROMOTED_CARRIER_POOL, and swapping in `_midairRepair` entirely) and both
  either made floating worse or broke the Gantt-window constraint. This is not a tuning problem.
- The 1510-floating / 97.87%-task-fidelity state (§GANTT_TASK_WINDOW_FIDELITY + §XRAY_STAGING_REMOVED,
  currently shipped, #1368+#1372) is the best of the three measured trade-off points on this axis and
  should NOT be walked back without a genuinely different mechanism, not a pool/repair-function swap.
- **The real fix is upstream, in `materializeZones`/`schedule_author.js`'s own CPM task graph**: give
  `IfcBuildingElementProxy`-classed real equipment (boilers, VAV valves — confirmed via DB query, not
  staffage) a task whose window ALREADY accounts for its real physical dependencies, so the display
  layer never has to repair anything across task boundaries after the fact. That needs someone to
  read `schedule_author.js`'s zone/task-graph construction with this specific class in mind — not
  attempted this session, named precisely so it doesn't need re-deriving.

---

# ▶ ARCHIVED BLOCK 4 — §CHASE_TO_ZERO_WINDOW_AUTHORING — SPEC + EXP5 (both candidates REJECTED fleet-wide, 2026-08-16)
# (verbatim from prompts/4D_SCHEDULE_PERFECTION.md lines 4194–4258, 2026-08-27)

## §CHASE_TO_ZERO_WINDOW_AUTHORING — SPEC (2026-08-16, user go: "Chase till zero, while Time
## Machine Gantt Chart needle move truthfully all categories in their respective bars")

**Constraint set, restated precisely:** floating -> 0 AND window fidelity never degrades ("all
categories in their respective bars" = an element appears only while the needle is inside its own
task's bar). §CROSSTASK_JUDGE_PARITY closed every repair-side lever; the 656 residual is 100%
WINDOW_BLOCKED — the dependent's own authored window closes before its first contact even starts.
By the user's own single-source-of-truth ruling, the display may NOT push an element outside its
bar — so the only lawful zero is to fix the BARS: authoring must produce windows that already
account for cross-task physical dependencies. This is §CPM_GENERATOR_UPSTREAM_SPEC territory,
entered with measurement, not conviction — EXP3 (repair-raw-then-re-derive) already measured WORSE
once (Hospital 1581→2406) via zone-span distortion of the rescale, so nothing ships without the
full-pipeline numbers on all 7 buildings.

**Candidates to measure probe-side (EXP5 family), full pipeline (rescale -> _ogSupportSweep ->
_cjpJudgeParity -> census), before any shipped-code decision:**
 - EXP5_DIAG: for every WINDOW_BLOCKED element, the minimal end-extension its task needs
   (first-contact display start + own dur - w.e), per task, per building — is the ask days or
   months? How many tasks are touched?
 - EXP5a — minimal window-END extension fixpoint: extend only the affected tasks' authored ends by
   exactly the measured need (day-rounded), re-run the WHOLE pipeline (extension changes that
   task's own rescale — the third-lever lesson), iterate <=5. Bars stretch only where a real
   dependency demands it; elements stay in their own (now-honest) bars.
 - EXP5b — EXP3 revisited WITH the parity pass: repair the RAW schedule first (_midairRepair),
   derive zones/windows FROM repaired times, then the full shipped pipeline including
   _cjpJudgeParity. EXP3's old failure may be absorbed by the parity layer; measured, not assumed.
**Accept criteria:** floating 0 (or the honest irreducible floor: orphans excluded by definition);
window fidelity per building >= current (Terminal 99.10 ... Clinic 99.98); spread KS not
meaningfully worse; totalDays growth bounded and reported; bar extensions reported per task.
Ship shape if EXP5a wins: authoring-side (schedule_author.js materializeZones window construction)
so the tasks table — the single source of truth — carries the dependency-consistent windows, and
the §GANTT_SCHEDULE_STALE self-heal re-materializes non-captured, non-baselined schedules
automatically. Captured/imported or baselined Gantts are NEVER rewritten — for them WINDOW_BLOCKED
stays an honest, reported extraction fact.

### §CHASE_TO_ZERO_WINDOW_AUTHORING — EXP5 MEASURED, BOTH CANDIDATES REJECTED FLEET-WIDE (2026-08-16)

All 7 buildings, full pipeline, logs `z_*.log` in session scratchpad; probe EXP5 committed+pushed on
branch `fix/gantt-window-authoring-zero` (worktree `/tmp/wt-chase-zero`, still standing).

```
           EXP4 base | EXP5a floating/outWin      | EXP5b floating/outWin   (baseline outWin)
Terminal   201       | 46 / 3427  FIDELITY WRECK  | 54 / 492   worse        (436)
Hospital   39        | 24 / 530   FIDELITY WRECK  | 137 / 1875 WRECK        (18)
Duplex     7         | 2 / 45     worse           | 3 / 10     BETTER       (31)
HHS        36        | 1 / 9      slightly worse  | 15 / 6     ~same        (4)
Clinic     72        | 35 / 12    worse           | 94 / 5     floating up  (4)
LTU        230       | 0 / 71     CONVERGED CLEAN | 13 / 121   worse        (71)
JKR        71        | 34 / 832   FIDELITY WRECK  | 84 / 980   WRECK        (22)
```
**Verdict: neither ships as-is.** EXP5a (end-extension fixpoint) reaches literal zero on LTU with
byte-identical fidelity — but the SAME lever destroys Terminal/Hospital/JKR fidelity (rescale
stretches the whole task into the extended window, scattering previously-in-window elements). EXP5b
(windows from repaired raw times) is EXP3's old zone-span distortion again — parity does NOT absorb
it (Hospital 39→137). §EXP5_DIAG kills the one-mechanism hope: blocked gaps are sub-day on Duplex,
~11d p50 on Hospital, 246d p50 on LTU — different tasks need different treatment.

**Named next lever (not built): DECOUPLE extension from stretch.** EXP5a's failure is not the
extension — it is that `durFactor = tSpan/lsSpan` re-spreads ALL elements into the extended window.
The fix shape: extend the AUTHORED end (bar covers the real dependency wait) but rescale against the
PRE-extension span (elements keep today's placement; only the parity pass uses the extra room). One
window in the tasks table, rescale keyed to the zone envelope carried alongside (authoring writes
both, e.g. task duration vs zone_span fields — needs a schema/authoring design pass). LTU's clean
convergence + the small sub-day tail elsewhere say this decoupled variant is the first thing to
measure next session (EXP5e), before any per-building special-casing.

---

# ▶ ARCHIVED BLOCK 5 — §TIER1_PER_ELEMENT_CLAMP EXP — MEASURED, REJECTED fleet-wide (2026-08-16)
# (verbatim from prompts/4D_SCHEDULE_PERFECTION.md lines 4384–4440, 2026-08-27)

## §TIER1_PER_ELEMENT_CLAMP EXP — MEASURED, REJECTED fleet-wide (2026-08-16, same session, user: "proceed to implement fixes")

**Root-cause dig, one level deeper than the named next lever above.** Hospital zone "Level 1" RAW
per-phase extents (`§STOREY_ORDER_ROOT_DIAG_L1_RAW`, pre-remap): Superstructure `n=274 [0..168]d`,
Architecture `n=1781 [0..164]d` — **the two run almost fully CONCURRENT in the generative schedule**,
not staggered. So "Level 1's Superstructure straggles" was the wrong framing: the RAW/generative layer
never promised "structure fully done before architecture starts, same floor" — that's `_tier1Serialize`'s
own job to enforce, and it does so with a **uniform per-phase-group shift**: the entire Architecture
population in a zone gets pushed by ONE delta, sized off the group's EARLIEST element vs the previous
phase's latest — so all 1781 Level-1 Architecture elements got shoved +178d even though most never
actually overlapped Superstructure. That inflated push then cascades through `§TIER2_AFTER_TIER1`'s
`t1EndZ` clamp onto 59% of the zone's Tier-2 population, which is the mechanism already written up above.

**Precedented fix candidate:** `§TIER2_PER_ELEMENT_CLAMP` (2026-08-13) already replaced exactly this
uniform-shift pattern with a per-element clamp one boundary over (Architecture→Tier2). Applying the same
pattern to `_tier1Serialize` itself (Superstructure→Architecture, per (zone,phase) group: only clamp an
element to `prevEnd` if it starts before it, `prevEnd` recomputed from the actually-clamped items rather
than the old shift-inflated estimate) is a small, contained, mechanically-faithful mirror of a change this
codebase already shipped and trusts. Implemented in `/tmp/wt-sandbox` (bim-ootb), syntax-checked, W-TS
witness NOT run (rejected before that step — see below).

**MEASURED on 4 buildings via `probe_captured_floating.js` (§EXP8_FINAL, the shipped pipeline) — fleet
floating went UP, not down:**

| Building | floating BEFORE | floating AFTER | Δ | storey violations BEFORE→AFTER (FINAL_LEVEL) |
|---|---|---|---|---|
| Hospital | 63 | **48** (better) | -15 | 3/7 → 2/7, worst 74d→60d |
| Clinic | 91 | **175** | **+84** | 1/6 → 3/6 (worst 49d→13d) |
| Terminal | 27 | **55** | **+28** | 12/21 → 10/21 |
| LTU_AHouse | 43 | **128** | **+85** | 9/17 → 9/17 (unchanged) |
| **measured-4 total** | 224 | **406** | **+182 (+81%)** | mixed, no clean win |

Only Hospital improved on both axes. Clinic and LTU regressed floating hard for near-zero or zero
storey-order benefit; Terminal regressed floating for a modest storey improvement. Net over the 4
buildings measured: floating nearly DOUBLED. **REJECTED — same verdict class as EXP5a/EXP5b above
("fidelity wrecked on 3 buildings" even where one building looked great).** The floating-count chase is
this campaign's primary metric; a fix that helps storey-order at that cost is a net loss, not a trade
worth taking without a narrower mechanism. Reverted in the worktree, nothing shipped, `_tier1Serialize`
in `viewer/time_machine.js` is untouched at HEAD.

**Why it likely backfires:** the per-element clamp is *individually* smaller than the uniform shift (by
construction, per §TIER2_PER_ELEMENT_CLAMP's own precedent), but it makes `prevEnd` DATA-DEPENDENT on
which specific elements happen to sit near the front of each phase group — on Clinic/Terminal/LTU this
apparently lands MORE elements just past their own Tier-2 window edge (see the outWindow jump — Clinic
4→149, Hospital 31→0 the one exception) than the uniform shift did, i.e. it trades "some elements pushed
too far" for "more elements pushed just far enough to miss their window," which `_cjpJudgeParity` then
counts as floating. Not verified further this session (would need a per-window outWindow decomposition
per building, same rigor as the fleet table above) — named as a footnote for whoever picks this back up,
not a claim.

**Next lever, revised:** a per-element clamp isn't automatically safer just because it moves less — the
WINDOW an element lands in matters as much as how far it moved. Any future attempt at this boundary needs
to measure inWindow/outWindow per building BEFORE trusting the floating number, and probably needs the
window-authoring layer (materializeZones) to account for the same per-element clamp behavior it's now
matching against, not just the display timeline. Storey-order thread parked here — not zero, but the two
cheap candidate fixes (uniform shift as-is, or the naive per-element clamp) are both now measured and
both rejected. A real fix needs a THIRD mechanism, not yet named.

---

# ▶ ARCHIVED BLOCK 6 — ▶ NEXT SESSION START HERE (2026-08-16 session close) — stale pointer
# (verbatim from prompts/4D_SCHEDULE_PERFECTION.md lines 4500–4536, 2026-08-27)

## ▶ NEXT SESSION START HERE (2026-08-16 session close) — supersedes every "next lever" note above

**⚠ A separate, higher-priority thread now supersedes both threads below for whoever picks this up
next: `prompts/4D_SCHEDULE_ARCHITECTURE_REDESIGN.md` (written 2026-08-16, same close, user: "take a
step back... what structural design pattern... solve it once and for all").** Both threads below are
tactical patches on top of an architecture this new file diagnoses as the actual root cause (eleven
independent repair passes, five of them re-deriving "what supports what" separately, none sharing one
dependency graph — exactly why the storey-order fix this session broke floating elsewhere while
provably moving less). If the redesign work starts, these two threads are likely SUPERSEDED, not
merged with — a correct CPM/single-DAG scheduler makes both of them structurally unnecessary rather
than fixed. Read that file first and decide which track this session is actually on before continuing
either thread below.

**Two independent tactical threads, both measured this session, in different states:**

1. **Floating chase (thread 2) — ACTIVE, on a clean population now.** Fleet floating is **133** (was
   265 at session start), shipped and live (bim-ootb PR #1395, `_CJP_DAY_TOL`). Re-run
   `probe_captured_floating.js` per building (`ONLY=<Building>_extracted node scripts/probe_captured_floating.js`,
   read `§EXP8_FINAL` + the new `§CJP_DECOMP_EXP8_TASK` lines) to get the current per-task breakdown —
   it is now overwhelmingly genuine WINDOW_BLOCKED (multi-day gaps, not rounding noise). Hospital's
   `TASK_Superstructure_Level_2/3/7A/6` (51 of Hospital's 51 residual) is the cleanest worked example:
   avgGapDays 2.6–52.4 against 5–16-day windows — the window is objectively too narrow for the real
   dependency chain inside it. Next lever named twice now, not yet built: a per-task minimal END-NUDGE,
   ONE bounded pass (extend a blocked task's own window by exactly its measured gap, re-measure, stop —
   NOT the rejected EXP5a global fixpoint that iterates until convergence and wrecks fidelity elsewhere).
   Measure fleet-wide before trusting it, same rigor as every fix this session.
2. **Storey-order thread — PARKED, needs a genuinely new idea.** Both cheap candidate mechanisms are now
   measured and rejected (uniform shift = the original bug; per-element clamp = tried this session,
   fleet floating +81%). The `§STOREY_ORDER_REPORT`-vs-stage instrumentation in `probe_captured_floating.js`
   (`storeyOrderReport()`, RAW/POST_REMAP/DISPLAY/PRE_PARITY/FINAL) is still live and reusable for
   measuring any future candidate — use it before proposing one. Root convergence point if anyone solves
   this: `_tier1Serialize` in `viewer/time_machine.js` (~line 4006, now with the 2026-08-16 per-element-
   clamp comment trail explaining why the obvious fix failed) is where any real fix has to land.

**Do NOT re-walk this file's "next levers" prose above this block searching for what's still open — this
block is the single current answer.** Everything above it (§CHASE_TO_ZERO_WINDOW_AUTHORING's EXP1-8,
§TIER1_PER_ELEMENT_CLAMP EXP, §CJP_DAY_ROUNDING_TOL) is settled history, not an active task list.

---
