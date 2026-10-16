# ⚠ DO NOT REMOVE — Read the log after every run, spec-first, no invented dependency edges or rates

## Why this file exists
This is the direct continuation of `prompts/CPM_FLOAT_GAP.md`, which is now CLOSED (its mission —
scope and land real CPM/dependency edges for a generated 4D schedule — is done, PRs #1158–#1162,
all merged/auto-merging, all witnessed). Read that file first for the full history if you need it —
**do not re-derive or re-litigate anything already settled there**, this file only states what's new.

User ruling that set the current priority (bim-ootb session, 2026-08-03): the core product is
**"drop an IFC, get a probable 4D/5D movie right away"** — most users return to their own tools
(P6/MSP) afterward. So the auto-generated schedule's own accuracy is the utmost priority; P6/MSP
import/export is explicitly POC/later (a 4D-diff/variance tool already shipped on that side, PR
#1161 — see CPM_FLOAT_GAP.md, don't re-open that lane unprompted).

This file scopes what "as perfect as can be" still needs, now that the engine (real element-level
CPM, DAG-safe, movie-coherent) exists.

## What's already shipped — do not re-build any of this
- `viewer/schedule_gate.js computeSchedule()` — the element-level scheduler driving the live movie
  (support-order + crew-capped placement). Pre-existing, proven (0/3240 floating, real Hospital data).
- `viewer/schedule_author.js materializeDefault()` — 5-phase coarse generated schedule, real CPM edges.
- `viewer/schedule_author.js materializeZones()` — 71-zone (Terminal) DETAIL schedule, rolled up from
  `computeSchedule`'s real per-element times, real structurally-DAG-safe edges.
- `computeCpm(db, id, {fixedDates:true})` — zone graph's CPM float/criticality now EXACTLY matches
  the real movie's total (was a 48%-divergent approximation; fixed same session, PR #1162).
- `viewer/schedule_diff.js` — grades an imported P6/MSP schedule against our own labor-rate estimate.
- `witness_zone_cpm.js`, `witness_tm_duration_sync.js`, `erp/tests/schedule_diff_witness.js` — the
  proof trail for all of the above. Run these FIRST if you need to re-verify current state; don't
  assume drift without checking.

## The real remaining gaps, in priority order

### 1 — Working-calendar model (5-day week / holidays) — highest fidelity payoff, affects BOTH paths
Currently EVERYTHING (the movie, `materializeDefault`, `materializeZones`) computes on raw, continuous
24/7 calendar days — `_addDays()` never skips a weekend or holiday. This is not a hypothetical gap —
`erp/tests/real_xer_witness.js` already independently found and named it while comparing our CPM
against a real P6 file's own computed dates: *"our CPM omits the P6 working calendar → 49/52 start
dates land up to 59d earlier (weekend/holiday skips)... all one-directional → working-calendar, not a
logic defect."* That finding was about captured-schedule replay, but the SAME gap degrades the
GENERATED schedule's own realism: a "111-day Superstructure" computed from labor-seconds ÷ crews is a
WORKING-day count dressed up as a calendar-day count today (`28800s = 8h workday` is already the
labor-rate assumption — `_addDays` just never accounts for which calendar days are actually workable).

**What closing this needs (spec before code):**
- A calendar model: which days of the week are worked (default likely Mon–Sat or Mon–Fri — this needs
  a real ruling, don't guess a default silently) + a holiday list (may not exist for a given
  building/locale — degrade honestly, don't invent a holiday calendar).
- `_addDays(start, workingDays)` needs a working-calendar-aware sibling (or itself needs to become
  calendar-aware, audit every caller — `materializeDefault`, `scheduleContiguous`, `materializeZones`,
  `computeCpm`'s date write-back all call it) that maps a working-day COUNT onto the correct spread of
  CALENDAR dates.
- `foreign_schedule.js` already parses P6/MSPDI calendar data (`toScheduleData`'s `calendars[]`) for
  CAPTURED schedules — check whether that's already used anywhere, or just parsed-and-dropped; if the
  latter, that's the fastest path to closing the captured-side half of this gap (real calendar data
  already extracted, just not applied).
- For the GENERATED side, no captured calendar exists — a sensible working-week default is legitimate
  (not "inventing a rate," it's a real, nameable business assumption every construction schedule makes)
  but get it confirmed once, don't silently pick one and move on.

### 2 — Multi-building validation — cheap, de-risks the "state of the art" claim
`materializeZones`/the zone-CPM fix are proven on Terminal (48,428 elements, large/complex, 22 real
floor-ranks) plus regression coverage touching Hospital (63,415 elements, also large). Neither is a
SMALL building. Per `docs/internal/WalkerDoctrine.md`, small/residential buildings (SH/DX/SC class)
walk `duplex_rules.db`, not Terminal-class rules — a building with 1–3 floors and a handful of zones is
a genuinely different regime (does the zone model degrade gracefully to "1 zone per phase" the way the
phase-level code already documented it should? Prove it, don't assume it from the large-building case).

**What this needs:** run `witness_zone_cpm.js`'s pattern (or extend it) against a real small building's
extracted DB (check `~/bim-ootb/buildings/` — `Duplex_extracted.db` is the standing default fallback
DB this project already uses everywhere else, likely the fastest real fixture to reach for). Confirm:
zone count stays sane (not 1, not the full element count), edges are still a DAG, `fixedDates:true`
CPM still exactly matches the real movie total.

### 3 — UI wiring — the engine has no user-facing trigger yet
`materializeZones()` is only reachable today via a witness/console call — there is no button anywhere
that lets a real user generate or view the zone-level detail schedule. Given this session's own
priority ruling (movie first, detail second, "for the minority who want to drill in"), this is
correctly LAST, not first — but it does need to exist for anyone besides a developer to ever see this
work. Likely home: `schedule_editor_ui.js`/`schedule_author_ui.js`, alongside the existing
"Schedule now"/`generateDraft()` flow — an opt-in "detail view" toggle or a second button, calling
`materializeZones` instead of/in addition to `materializeDefault`. Keep it minimal — this project's own
established discipline this session was engine-and-witness first, UI last, don't gold-plate.

## Minor, not scoped, don't chase unless a witness surfaces a real problem
- `deriveZones`' same-floor-cross-phase edges are an adjacent-pair chain over phases sorted by real
  observed start time, not an exhaustive pairwise derivation — a deliberate simplification (see
  `schedule_gate.js deriveZones`'s own header). No evidence yet this loses anything real; only revisit
  if a witness on a new building shows a missing/wrong constraint.

## Suggested order
1. Working-calendar model (#1) — highest real-world fidelity payoff, touches both generated AND
   captured paths, and is the one gap independently corroborated by an existing witness finding.
2. Multi-building validation (#2) — cheap (mostly a witness run, not new code), de-risks claiming this
   works generally rather than just on the two large buildings tested so far.
3. UI wiring (#3) — only once the engine is validated broadly, expose it to a real user.

## Boundary, restated (carried forward from CPM_FLOAT_GAP.md — do not drift from this)
Every number here traces to real extracted data (labor rates, real quantities, real crew counts, real
storey/Z geometry) or a real, nameable business assumption confirmed once (a working-week default) —
never a plausible-looking invented value. `4D_CAPTURE_AND_FALLBACK.md:359`'s rule still stands:
captured (P6/MSP/native-IFC) programmes replay their own float, they don't get ours recomputed over
them uninvited. `computeCpm`'s `fixedDates` opt is now the established pattern for "trust real
persisted dates, use CPM only for float/criticality" — reuse it, don't reinvent a third date-handling
mode without a real reason.

## Session close-out, 2026-08-04 — this file's original 3 gaps are DONE, DON'T RE-DERIVE THEM
This supersedes the "Suggested order" section above — all three items are closed, not open.
- **#1 Working-calendar** — CLOSED, no code. User ruling: 24/7 continuous is the deliberate generator
  default ("spec'ed early on"), not a gap. P6/MSP real-calendar parsing explicitly deferred.
- **#2 Multi-building validation** — DONE. `witness_zone_cpm_duplex.js` (small/DX-class, 9/9) +
  `witness_support_invariant_all_buildings.js` (all 6 large fixtures, 18/18, 0 floating/272k+ elements).
- **#3 UI wiring** — DONE, but NOT a second button as originally scoped: zone-level detail is now the
  DEFAULT "Generate first draft" output (`schedule_author_ui.js`), replacing the coarse 5-phase draft.

**Five real, evidence-backed bugs found and fixed in the same session** (bim-ootb `main`, PRs #1163/
#1165/#1166/#1167 — #1163's branch was orphaned mid-session by an early auto-merge, #1165/#1166/#1167
are the recovery + follow-ons, all verified landed on `main` by content, not just PR status):
1. `IfcOpeningElement` scheduled as physical work (voids, not walls) — excluded, matches time_machine.js.
2. Every beam/column in a class got the SAME flat install time regardless of real size (a 60m beam and
   a 1m beam both "1 hour") — fixed via real-length redistribution, class total preserved.
3. `SEQUENCE_RULES` sequenced MEP rough-in BEFORE the building envelope (walls/doors/windows) — backwards
   from real construction discipline. Fixed across all 18 rate-template sources (`rates.js` + 15 regional
   templates + `sequence_rules.json`).
4/5. **Two of (at least) four independent copies of "what counts as physical support"** had an
   unrestricted "any wall carries anything" predicate (`time_machine.js` `_buildXraySupportCache` +
   `_ogIsCarrier`/`PHASE_OVERLAP_SUPPORT_GUARD`) — a wall is only ever a real carrier for a slab
   promoted to the roof role. MEASURED on Hospital: 5,687→1,217→0 false "hanging without support"
   defects (fix #4), 1,049→0 false pushes with only 2 of the 1,049 ever legitimate (fix #5).

**New witness**: `witness_wall_carrier_scope_all_copies.js` — the single place tracking all 4 known
copies of this predicate (not 2 separate witnesses each covering one copy). Status:
copy 1 (`schedule_gate.js auditFloating`) and copy 3 (`_ogIsCarrier`) proven here, 6/6 buildings;
copy 2 (`_buildXraySupportCache`) has its own dedicated witness (`witness_zstack_xray_staging.js`);
copy 4 (`boq_charts.html generateSchedule()`) asserted RED-by-design as a KNOWN OPEN GAP — it has no
geometric support-check at all, a different and larger problem than 1-3's over-broad predicate.

## Session addendum, 2026-08-04 (same day, later) — a real gap NOT previously documented
User asked "why can't ARCH go first" — after clarification, the real question is NOT about
construction sequence (Substructure-first stays correct, real construction physics, not up for
debate) — it's that **this schedule has no pre-construction design/planning phase at all.** A real
P6 schedule starts with Design Development → Permitting → Procurement, THEN Substructure onward.
This generator starts cold at Substructure with zero modeled lead time for design/permits/procurement
— there is no `SEQUENCE_RULES` phase, no task, nothing representing pre-construction work. Genuinely
new finding, not previously scoped anywhere in this file. STUDY, don't implement yet — no real
duration/lead-time data source has been identified for this (an invented "design takes N weeks"
number would violate the Boundary section above). NOT started.

**Write-loop hang, reported live during "Apply to 4D" on Hospital (63,415 elements)**: the browser
console log cut off immediately after `§PHASE_OVERLAP_SUPPORT_GUARD pushed=...`, right before a loop
that does 63,415 individual synchronous DB writes on the main thread (`time_machine.js` ~line 4058,
written in PR #1154, 2026-08-03 — predates this session, not caused by any fix here). Confirmed
`kernel_ops.output_guid` IS indexed (`idx_kernel_ops_guid`) — ruled out an O(n²) table-scan as the
cause. PR #1168 (merged) adds `§WRITE_LOOP_TIMING` — pure measurement, no logic change — so the next
report gives a real millisecond number. **The actual performance fix (batching/yielding so the tab
doesn't freeze) is NOT done** — deliberately deferred, needs a real timing number first and ideally
browser verification before changing a hot synchronous code path blind.

## OPEN for the next session — do not assume any of this is done
- **Pre-construction design/planning phase is entirely unmodeled** (see addendum above) — real gap,
  needs a real lead-time data source before any implementation, currently just named.
- **Write-loop performance fix NOT DONE, confirmed still hanging** (2026-08-04, live user report
  TWICE on Hospital/63,415 elements): PR #1168's `§WRITE_LOOP_TIMING` instrumentation never even
  printed either time — the freeze happens AT OR BEFORE the write loop starts, right after
  `§PHASE_OVERLAP_SUPPORT_GUARD pushed=.../63415` (`time_machine.js` ~line 4058-4065, PR #1154,
  predates this session). Next session: don't re-diagnose from zero — the timing line never firing
  is itself new information (rules out "just slow writes", points at something before/at loop start
  — check the `_ogStructGrid`/`_ogWallGrid` build + the `_allScheduled.sort` immediately before it
  too, not just the write loop itself). Needs real profiling, ideally live browser (user-approved for
  THIS specific investigation, unlike elsewhere this session).
- **Constraint-aware Gantt drag, SAME session as the hang fix** (user ruling 2026-08-04): dragging
  the Gantt chart directly is the priority UI, not a redesigned Author-4D panel — "it is the same
  underlying model". See the detailed scoping note above (self-contained bars, real DAG via
  `task_sequences`, don't let a drag hide a defect instead of fixing it).

## Session starter for the next session (paste this)
"Read prompts/4D_SCHEDULE_PERFECTION.md in full, then: (1) find and fix the Apply-to-4D hang on
large buildings (Hospital, 63,415 elements) — PR #1168's timing instrumentation never fires, so
start there, not at the write loop; (2) build constraint-aware drag directly on the Gantt chart
(same underlying model as the Author-4D wizard, don't build a second panel) — a dragged bar must
cascade its real successors or get blocked, never silently hide a real defect."
- **Constraint-aware Gantt drag** (user request, 2026-08-04): let a user drag a zone bar directly in
  the editor as a manual escape hatch when they spot a problem, instead of always needing a code fix.
  SCOPING FACT established this session, don't re-derive: a Gantt bar (zone = one phase × one real
  floor) is internally self-contained — its own elements are already correctly ordered by the fixed
  engine (`computeSchedule`, this session's fixes) — but bars are NOT independent of each other; they
  form a real DAG via `task_sequences` edges (`deriveZones`: within-phase adjacent-floor + same-floor
  cross-phase). A PURELY COSMETIC drag (no constraint checking) would let a user hide a real defect
  instead of fixing it — directly against this project's Prime Rule. The correct version (standard in
  P6/MS Project): dragging a bar either cascades its real successors with it, or gets blocked/clamped
  when it would violate a real dependency. `moveTask()` (schedule_author.js) is the existing single-
  task move verb — check whether it already has any cascade/constraint logic before designing new.
  STUDY/SCOPE ONLY — not implemented, not started.
- **`boq_charts.html` (the "4" button / HTML charts tab) is a FOURTH, fully disconnected scheduler.**
  Doesn't read `schedule_gate.js`'s real engine or `schedule_author.js`'s `tasks`/`task_elements` tables
  at all — recomputes its own coarse phase×storey schedule from raw element counts, with its own fixed
  lag constants and a `MAX_TASK_DAYS=20` cap, and TWO of its own stale hardcoded `PHASE_ORDER` arrays
  (`boq_charts.html` lines ~423 and ~560, still MEP-before-Architecture — never touched). User-approved
  direction (not yet implemented): redirect it to consume `schedule_author.js`'s real `tasks` data via
  `AnalysisSidecar.compute4D()`'s existing-but-unused `capturedFn` hook (currently passed `null` at the
  `get4D()` call site, line ~1218) instead of patching its `generateSchedule()` separately.
- **`docs/4D5DAnalysis.md` (bim-compiler) is stale.** Describes the Python `nD_engine.py` engine +
  `ghostglass.js`/`boq_charts.html` — never mentions `schedule_author.js`/`schedule_gate.js`, the engine
  this whole session perfected. Not rewritten.
- **Architectural finding, not yet acted on**: this codebase has a documented convention ("copy the
  support predicate rather than importing it") that is WHY the same bug had to be found and fixed 3
  separate times this session. The real fix is consolidation — one shared support-detection function,
  every caller uses it — not continuing to patch copies as they surface. Scoped but not started.
- Two cosmetic-only stale `PHASE_ORDER` arrays in `time_machine.js` (~line 4099 ERP-twin variance
  lookup, ~line 4670 dashboard phase-progress display order) — confirmed display-only, not wired to
  actual scheduling, left unfixed as genuinely low priority. Fix if ever touching those areas anyway.

---

# §GANTT_EDIT — the editable-drawer overhaul (SPEC, 2026-08-04)

Spec-first, no code written yet. All line refs are against `origin/main` @ `7e1ed17` (PR #1169).
⚠ `~/bim-ootb`'s working tree was 13 commits STALE when this spec was researched (`8592b33`, missing
#1157–#1169 incl. all the zone work). Read `git show origin/main:<file>`, not the checkout.

## Product mission (user ruling, 2026-08-04)
Be the best on-the-fly combined 4D/5D generator — remove MPP/P6 dependence for ~95% of the long tail
of users, using common-sense construction sequencing + real CPM. The Gantt drawer in Time Machine
becomes **the one editable 4D surface**; the two existing 4D editors are deprecated into it.

## K0 — KEYSTONE FINDING: the drawer's bars are not tasks (fix this first, everything depends on it)
The TM drawer does **not** read the schedule model. `drawGanttMini` (`time_machine.js:4393`) builds
`_ganttTasks` by grouping raw `_ops` (kernel_ops rows) into `groups[storey + '|' + phase]`
(`:4400-4413`) — a rollup of **element timestamps**. The resulting bar object is
`{storey, phase, startTs, endTs, count, cap}`. **There is no `task_id` on it.** So today a bar cannot
be moved, because `moveTask(db, taskId, newStart)` has nothing to be handed.

Meanwhile `materializeZones` (`schedule_author.js`) already writes exactly this decomposition into the
real model: one row per zone, `task_id = 'TASK_' + _slug(phase) + '_' + _slug(storey)`, `name =
phase + ' — ' + storey`, plus `task_elements` (tid→guids) and `task_sequences` (the real DAG edges).

**The drawer's `storey|phase` grouping and the zone-task decomposition are the SAME decomposition,
arrived at independently by two code paths.** They were never connected.

→ **The overhaul is therefore mostly a re-sourcing job, not new engine work.** Stop deriving bars from
`_ops`; read them from `tasks` + `task_sequences` for the active schedule. Once a bar carries its real
`task_id`, every edit verb below already exists and is already witnessed.

### Verbs that already exist — do NOT rebuild any of these (`schedule_author.js`, all exported)
| Verb | Does | Gap |
|---|---|---|
| `moveTask(db, taskId, newStart)` | moves a leaf task, preserves duration | **no cascade, no constraint check** — its own header says "CPM invalidation is the caller's concern" |
| `addDependency` | creates a `task_sequences` edge | — |
| `wouldCycle` | cycle guard | already there, drag-to-link gets it free |
| `removeDependency` / `updateDependency` | unlink / retype+lag | — |
| `computeCpm(db, schedId, opts)` | full FS/SS/FF/SF + lag, float, criticality, `fixedDates` opt | — |
| `listDependencies` | edges for a task | — |

The single real engine gap is **cascade/clamp on move** (C1–C3 below). Everything else is UI.

### K0 SHIPPED 2026-08-04 — `witness_gantt_bar_identity.js`, 7 buildings, 42/42, 268,093 elements
Bars are now keyed on the real `task_id`, joined **by GUID through `task_elements`** — not by matching
storey/phase strings, because `deriveZones` keys a zone on `collapsePhase(e.storey)` while the drawer
reads the raw `p.storey` off the op params, so the two names legitimately differ.
- **100% of elements resolve to a real task on every fixture** (Terminal 48,428 · Hospital 63,415 ·
  Duplex 1,143 · Clinic 16,912 · JKR 8,985 · LTU_AHouse 122,330 · HHS 6,880).
- **Do NOT repeat the earlier claim that name-matching is universally unsafe** — measured, on 6 of 7
  fixtures the old `storey|phase` key was exactly 1:1 with real tasks, so a name match would have
  survived there.
- **But HOSPITAL was drawing 60 bars for 35 real tasks** — 19 zone tasks each split across several
  rows, because `collapsePhase()` merges storey aliases the raw `p.storey` key does not. A real,
  measured defect on the exact building the user reported as "a mess"; fixed by the GUID join.
- Also fixed in passing: the rollup was recomputed from scratch on EVERY `drawGanttMini()` call — once
  per playback frame, walking all 63,415 ops on Hospital. Now cached behind `_ganttDirty`, invalidated
  on `_ops` reload and building change; the draw path is pure drawing.
- Bars whose ops carry no task (no authored schedule) keep the old storey|phase identity and stay
  non-editable, reported as a coverage ratio by `§GANTT_BAR_IDENTITY` rather than hidden.

## K1 — ROW ORDERING: we follow no P6 convention at all (user report 2026-08-04, verified)
User: *"are you using any 4D convention used by P6 on gantt phase/task ordering? Last session was a
mess putting substructure which has above ground appearing first."* Answer: **no convention is being
followed.** Three verified facts:
- **Rows sort by start time only** — `_ganttTasks.sort(function(a,b){return a.startTs - b.startTs;})`
  (`time_machine.js`). Not a P6 convention: whichever zone happens to compute earliest floats to the
  top, so a phase's floors appear interleaved and arbitrary.
- **There is no WBS to order by.** `materializeZones` parents EVERY zone flat to `TASK_ROOT`
  (`stmtTk.run([tid, schedId, rootId, …])`). P6 orders rows by WBS path, then early start. We have a
  single-level list, not a path.
- **The correct ordering keys are already computed and then discarded.** `deriveZones` builds each
  zone with `rank` (real bottom-up floor rank — `deriveBandRanks`, median `base_z` per collapsed
  storey) and `seq` (the zone's earliest trade sequence). Neither is persisted: the `tasks` schema
  (`_ensureWideTasks`) has NO ordering column.

**Fix (no invented data):** persist `seq` + `rank`; emit real phase summary rows as WBS parents
(Project → Phase → Zone); order rows by (phase sequence from `SEQUENCE_RULES`, then floor rank).
Phase sequence is already correct as of PR #1165; floor rank is real Z geometry.

⚠ **Separate, NOT yet verified:** whether Substructure is also mis-CLASSIFIED onto above-ground
elements. That is `matchRule` phase assignment, a different defect from row order — check before
assuming one fix addresses both. Note a concurrent session landed #1170 ("substructure-first tiebreak
in the GANTT_OPS_FIRST20 debug display") — that is the DEBUG log line only, not the Gantt row order.

## §ZONE_EDGE_LEAD — the zone graph contradicted its own dates (FOUND + FIXED 2026-08-04)
**Not looked for — surfaced by `witness_gantt_edit_constraints.js` G-CON-1 on its first run.** The
generated zone schedule violated **53 of its own 105 `task_sequences` edges on Terminal**, before any
user edit. Root cause, `schedule_gate.js deriveZones`:
```js
lagMs: Math.max(0, succ.start - pred.end)     // ← the max(0,…) clamped away every real overlap
```
Zones genuinely run in parallel (crews work floor N+1 while floor N finishes), so when
`succ.start < pred.end` the true relationship is a **negative lag** — a lead, P6/MSP's `FS-5d`.
Clamping it to 0 persisted an `FS+0` edge asserting "successor starts at or after predecessor
finishes", which the zone's OWN dates then contradicted.

**Why it stayed invisible:** `computeCpm(fixedDates:true)` trusts the real dates and only derives
float, so it never checked FS feasibility. It becomes load-bearing the moment those edges are used as
drag CONSTRAINTS — a clamp built on `FS+0` refuses legal moves, a cascade pushes bars that never
needed to move. **This is the single most important finding of the session: the "iron clad" core was
not iron clad, and no existing witness could have caught it because none tested the edges AS
constraints.**

Two parts to the fix: allow negative lag in `deriveZones`, AND derive the persisted lag from the same
ROUNDED day numbers `materializeZones` writes the dates from (rounding dates and lags independently
let them disagree by a day). Result: **53 → 0 self-violated edges, and 0 on all 7 fixtures.**
No regression — `witness_zone_cpm` (11), `_duplex` (9), `witness_tm_duration_sync` (8),
`witness_support_invariant_all_buildings` (18) all still green, 46/46.

## E — Interactions to build (MS Project convention; do not invent a new idiom)
- **E1 drag bar body horizontally** → move, duration preserved → `moveTask`.
- **E2 drag a bar's left/right edge** → resize; the opposite end stays pinned; duration changes.
  Needs a new leaf verb `resizeTask(db, taskId, newStart, newFinish)` — `moveTask` deliberately
  preserves duration, so it is the wrong verb to overload.
- **E3 drag from bar A onto bar B** → create an FS edge A→B → `addDependency` (guarded by `wouldCycle`).
- **E4 click an existing dependency arrow** → remove / change type (FS/SS/FF/SF) + lag.
- Hit-testing already exists: `findBarAtClick` (`time_machine.js:4590`). Extend it to return an edge
  zone (within ~4px of a bar end) so E1 and E2 can be told apart from one gesture.
- **E5 sliding day ruler** (user addition 2026-08-04) — a time-axis header along the drawer's top
  border showing real dates/day numbers, sliding/scrolling with the bars. Today the drawer has NO time
  axis at all: the only temporal reference is the orange cursor hairline (`:4550`), so a bar's absolute
  dates are only discoverable by hovering it. A ruler is also the precondition for E1/E2 being usable —
  you cannot drag to a date you cannot see.
- **E6 resizable drawer** (user addition 2026-08-04) — draggable drawer borders to show more rows.
  Height is currently implicit: `cH = numTasks * rowH + 4` inside a fixed-height scroll box
  (`:4479`), so a 22-storey building renders ~130 bars into a viewport showing a handful.
  Reuse the existing `makeDraggable` pattern (`:2953`), don't invent a second drag idiom.
- **E7 double-click → property panel** (user addition 2026-08-04, think-ahead) — double-clicking a bar
  opens a small property panel to TYPE exact start/finish/duration and edit its dependency list.
  Rationale: drag is for speed, keyin is for accuracy — a 1px drag on a 400-day project is ~2 days, so
  drag alone can never be the precise path. Same verbs underneath (`moveTask`/`resizeTask`/
  `addDependency`), same C1–C3 constraint checks — the panel is a second input surface onto the
  identical model, NOT a third editor. This is what makes deprecating the two existing editors honest:
  their real remaining value is precise keyed entry, and E7 absorbs it.

## C — Constraint semantics (THE rule this feature lives or dies on)
Prime Rule consequence: **a drag must never silently hide a real defect.** A purely cosmetic drag lets
a user "fix" a schedule violation by dragging it out of sight instead of fixing the cause. So:
- **C1 cascade** — moving a bar later drags its real `task_sequences` successors with it (FS:
  `succ.start >= pred.finish + lag`). This is MSP auto-schedule behaviour, not an invention.
- **C2 clamp** — moving a bar earlier than a predecessor allows is **refused**, clamped to the earliest
  legal date. The bar visibly snaps back. No silent acceptance.
- **C3 log every one** — `§GANTT_EDIT_MOVE`, `§GANTT_EDIT_CLAMP reason=pred:<id>`,
  `§GANTT_EDIT_LINK`, `§GANTT_EDIT_CYCLE_BLOCKED`. Whitebox-first: these `§` lines are the proof
  surface, not screenshots (FUNDAMENTAL LAW, CLAUDE.md).

## W — Write-path coherence (the seam that will bite)
A zone bar's window was **rolled up from real per-element times**. Move the bar and its member
elements must be redistributed inside the new window, or the drawer says one thing and the movie plays
another — the exact class of divergence PR #1162 just closed on the CPM side.
- **W1** — on an accepted edit, re-time only that task's `task_elements` guids across the new window,
  reusing the existing linear bottom-up-by-`cz` distribution (§PLAYBACK-STAGGER, `time_machine.js:3909`).
- **W2 (also the perf answer)** — an edit must be **incremental**: touch the edited task + its cascaded
  successors only, never re-run the whole 63,415-element pipeline. A drag touches ~10³ elements, not 10⁴.
  This is what makes interactive editing viable on Hospital at all.

## MOB — Mobile / ERP readiness: a Gantt task round-trips to the field and folds back done
**User ruling 2026-08-04. Not started — scoped here, deliberately AFTER the foundation band.**
A Gantt zone bar should be pushable to ERP exactly the way a Find selection already is, worked on a
phone, and folded back as a completed task with evidence attached.

**The anchor already exists — do NOT build a second push path.** `navigate_find.js _pushToErp()`
(~`:1921`) takes the current selection set, prices it (`_selectionPriced`), and calls
`window.ProjFold.foldProjectOrder(db, building, priced.rows, opts)`, which creates the real iDempiere
tree: `C_Project` → `C_ProjectPhase` → **`C_ProjectTask`** (per resource) → `C_ProjectLine` (per IFC
type). It already logs `§PROJ_PUSH … tasks=+N`, already routes through BlueFuture when a speculative
branch is engaged, and already reads back EVM via `ProjControl.projectControl`. The Gantt push is the
SAME verb with a different scope selector — a zone task's `task_elements` guid set instead of a Find
selection set.

**The round trip, in order:**
1. **PUSH** — a Gantt bar (K0 gave it a real `task_id`; `task_elements` gives it a real guid set) is
   pushed via the existing `foldProjectOrder`, yielding a real `C_ProjectTask_ID`. That ID is the
   join key for everything below — persist it against the zone task, do not re-derive it by name.
2. **MOBILE VIEW** — opening that Project Task ID on a phone highlights **the item set** (its
   `task_elements` guids) in the 3D scene and shows the **task checklist** (its `C_ProjectLine` rows —
   per IFC type, with real quantities, already created by the fold).
3. **SHARE BACK** — a photo finish or progress report attaches to the task, shared via the existing
   `viewer/share.js` path, carrying a link back to the item set **keyed by `C_ProjectTask_ID`**, not by
   a re-derived name or a screenshot caption.
4. **FOLD BACK DONE** — the returned evidence marks the `C_ProjectTask` complete in the ERP twin.
   **User point 2026-08-04: Time Machine ALREADY has the shape for budget-vs-actual — this step needs
   no new UI.** `§TM-VARIANCE` (`time_machine.js`) already loads the folded twin (`_loadTwin()`), reads
   the `C_Project` `PlannedAmt` ↔ `CommittedAmt` pair straight off the ledger, renders the per-phase
   variance canvas + list (`tm-var-canvas`, `tm-var-list`, `_VAR_ORDER`), and computes EVM
   (`§EVM_FOLD`: EV/AC/CPI/CV/BAC/EAC/VAC) plus a projected slip (`§SCHED_PROJECT`). Its own doctrine
   is already "variance = the PlannedAmt↔CommittedAmt pair, READ the twin, don't recompute" — exactly
   the contract a folded-back done task satisfies. So the round trip lands in an existing, witnessed
   surface: the field marks a task done → `CommittedAmt` moves → the variance drawer and EVM show real
   ACTUAL progress instead of estimate-only. The work is the write path and the task↔bar join, not a
   new dashboard.

**Boundary (carried, non-negotiable):** the completion signal must come from the returned real record —
never inferred from "the bar's end date has passed". A task whose date elapsed is NOT a task that got
done, and rendering it as done would be exactly the invented value this file's Boundary section forbids.

### MOB — FULL SPEC FOR THE NEXT SESSION (user ruling 2026-08-04: "let MOB be well spec'd")
Read this whole subsection before writing any code. Nothing here is started.

**M0 — PREREQUISITE, do this first.** The drag path is not yet proven end-to-end (see §BROWSER_PROOF
below). MOB rides on the same bar→task identity. Close M0 before building on it.

**M1 — Persist the ERP link (no ruling needed, fully derivable — start here).**
- `foldProjectOrder` already returns `{projectId, orderId, created:{phases,tasks,lines,products}}`
  and creates real `C_ProjectTask` rows. What does NOT exist is a stored link from OUR zone task to
  the ERP one. Add it: a small `task_erp_link(task_id TEXT PRIMARY KEY, c_projecttask_id INTEGER,
  c_project_id INTEGER, pushed_at TEXT)` table alongside `tasks`.
- **Join by stored ID forever after — never re-derive by name.** Zone task names are
  `phase + ' — ' + storey`; ERP `C_ProjectTask.Name` is the RESOURCE. They are different strings by
  construction, and matching them would be the same class of defect K0 fixed.
- Witness `witness_mob_erp_link.js`: after a push, every pushed zone task has exactly one link row,
  the `c_projecttask_id` exists in `C_ProjectTask`, and re-pushing is idempotent (no duplicate rows,
  no second `C_Project`). RED control: assert a name-based match would mis-associate — measure it.

**M2 — Push a bar from the drawer.** Reuse `navigate_find.js _pushToErp()`'s pipeline verbatim; the
only difference is the scope selector — the bar's `task_elements` guid set instead of `_lastSelSet`.
⚠ `_pushToErp` needs PRICED rows (`_selectionPriced`), and it already fails honestly when a selection
has nothing costable. Keep that behaviour; do not paper over it. Entry point: the E7 property panel
(it already lists the task's real identity), NOT a new toolbar button.

**M3 — Mobile view.** Opening a `C_ProjectTask_ID` highlights that task's `task_elements` guids in 3D
and lists its `C_ProjectLine` rows as the checklist (per IFC type, real quantities — the fold already
created them; do not recompute).

**M4 — Share back.** `viewer/share.js`, payload keyed by `c_projecttask_id`.

**M5 — Fold back done.** Write the completion to the twin so `CommittedAmt` moves. **No new UI** —
`§TM-VARIANCE` (`_loadTwin`, `tm-var-canvas`, `tm-var-list`, `_VAR_ORDER`) and `§EVM_FOLD` already
render exactly this. ⚠ While you are there: `_VAR_ORDER` is a KNOWN-STALE phase order (MEP Rough-in
before Architecture) — fix it to derive from `SEQUENCE_RULES` like `_ROW_PHASE_ORDER` now does.

**BOUNDARY (non-negotiable):** completion comes from the returned real record. NEVER infer "done"
from an elapsed end date — an elapsed task is not a completed task, and rendering it as done is
precisely the invented value this file's Boundary section forbids.

**Open questions — ASK, do not guess:** (a) where the photo/report BLOB lives (ERP twin vs OCI vs
IDB); (b) whether mobile is the existing viewer at a small breakpoint or a distinct entry point.
Neither blocks M1/M2 — do those first, then ask.

## §BROWSER_PROOF — what a real browser proved that 184 headless checks could not (2026-08-04)
Driven two ways: a dependency-free CDP client (`scratchpad/cdp.js` + `drag_test.js` — this box has NO
npm registry access, `npm ping` times out, and Node 18 has no global `WebSocket`, so the client
implements the handshake over `net`), then the Claude Chrome extension once the user signed in.

**Three real bugs found, all invisible to every witness** (each witness authors its own fixture in
node and never touches a DOM or the toolbar):
1. Removing the ✎ icon orphaned the ONLY caller of `ScheduleAuthorUI.toggle()` — no user could author
   at all, leaving every bar without a `task_id` and the whole editable drawer inert (`9902f6d`).
2. `buildTaskIndex()` cached the NEGATIVE result, so authoring after opening the drawer never took
   effect (`9799f24`) — and that fix alone was still insufficient, because `buildGanttTasks()` is
   gated on `_ganttDirty` which authoring never set (`6a5073f`). MEASURED: banner `display:block`
   → `display:none` for the same sequence.
3. The drag refusal was a bare `return` — no log, no user feedback, and the test could not tell
   "handler never fired" from "handler correctly refused". Silence is not a refusal (`9799f24`).

**Also proven live, not merely in source:** ruler renders 18px and computes `position:sticky`; canvas
lays out 327×214 with real drawn pixels; legend gone; ✎ gone; and `window.SEQUENCE_RULES` IS loaded
when `_ROW_PHASE_ORDER` is built — so the DERIVED phase order is the branch that actually runs, never
the hardcoded fallback. That last one was a real correctness question no headless witness can answer.

**CORRECTION 2026-08-04 (user reported it; my own data already said it and I misread it):
THE DRAWER RENDERS NEAR-EMPTY IN A LIVE VIEWER.** The CDP probe returned `nonBlankPixels=534`
over a 327x40 sampled strip — ~4% coverage — and I recorded that as "content drawn". It is not.
So the drag test's silence has a far simpler cause than handler wiring: **there was nothing under
the pointer to hit.** This SUPERSEDES the "guessed x-coordinate" explanation below, which was real
but secondary. Bars resolve real task_ids headlessly on 7 fixtures, yet are not drawn at a visible
size in the browser.

`window.__tmGanttBars` (commit `41a4bd9`) now dumps every bar's ACTUAL drawn rect. **NEXT SESSION:
query it FIRST, before touching any drag code.** It separates the three candidates a pixel count
cannot: (a) `bars:0` = `_ganttTasks` empty; (b) widths ~0 = degenerate `_projectStart/_projectEnd`
range; (c) xs outside the canvas box = drawn off-screen. Fix what it names, THEN re-run the drag.

⚠ Environment caveat: the user's desktop Chrome hit a WebGL init error — a KNOWN machine-level GPU
launcher issue on this box (`project_machine_chrome_firefox_gpu_launchers.md`), not caused by this
branch — while headless Chrome falls back to SwiftShader. The two are not comparable on GPU-dependent
behaviour; do not treat a headless pass as proof for the desktop.

**The transport row's two buttons — ↺ Undo edit ✅ SHIPPED, ⚑ Set Baseline DECIDED-BUT-DEFERRED
(2026-08-05).** `Copy Touched` / `Copy New` (`tm-touched`/`tm-new`) just called `copyGuids(false|true)`
to put GUID lists on the clipboard — a developer debug affordance, nothing else referenced them, user
had "lost touch" with them.

- **↺ Undo edit** — bim-ootb PR #1188 (auto-merge armed), replaces the `tm-touched`/Copy-Touched slot.
  Single-level (not a stack), scoped to `commitGanttDrag` (E1/E2 drag/resize) only — not link/unlink,
  not the property panel, matching exactly the named need ("one drag can cascade N successors with no
  way back"). Snapshots both tables an edit touches (`tasks` + the affected `kernel_ops` rows) before
  the engine verb runs, restores both exactly on click; cleared on every fresh `activate()` so a stale
  cross-building snapshot can never apply. `witness_gantt_edit_undo.js` (new, slices the real shipped
  functions by balanced braces, never reimplements the restore logic): Duplex 10-task cascade/898 ops
  9/9, Terminal 20-task cascade/3,519 ops 9/9 — RED control, exact restore, second-click no-op, and
  out-of-cascade rows proven untouched, all verified against real authored schedules.
  **Perf bug caught pre-ship, not shipped broken:** first draft's snapshot capture was
  O(cascadeGuids×totalOps) — measured 92s wall-clock on Terminal. Hashed to O(1) (same shape as the
  existing `retimeTaskElements`'s own lookup) — 92s→39s, remainder is that function's own pre-existing
  write-loop cost, untouched here.
- **⚑ Set Baseline — ✅ SHIPPED 2026-08-05, bim-ootb PR #1190 (auto-merge armed).** Definition
  user-confirmed: P6 baseline = a frozen snapshot of `tasks.schedule_start/finish` taken at a
  deliberate moment, compared against the live (possibly since-edited) schedule — **schedule**
  variance, correctly NOT the same axis as `§TM-VARIANCE`'s existing **cost** variance (`C_Project`
  `PlannedAmt`↔`CommittedAmt`, already exists, stays untouched, sits "higher up" per the user —
  reconcile the two variance views later, not now).
  `ScheduleAuthor.setBaseline(db, scheduleId)` snapshots every task row (incl. summaries, for
  project-level rollup) into a new `task_baseline` table — single baseline, re-running OVERWRITES
  (MVP scope, not P6's multi-baseline numbering). `getBaselineVariance(db, scheduleId)` returns real
  `varianceDays` per task (direct date subtraction, nothing invented) plus `TASK_ROOT`'s own row as
  `projectVarianceDays`; honest `{ok:false,reason:'no_baseline'}` refusal when nothing's been set yet.
  Shipped as a **manual button today** — MOB's auto-trigger-at-ERP-push (M2, still not started) is
  the "kickoff confirmation" analog and the right trigger long-term, but since M2 doesn't exist yet a
  free-floating button is the only way to make this usable now. **Not made obsolete once M2 lands** —
  the same `setBaseline` verb gets called there too, and this button becomes "re-baseline for an
  approved change order," the secondary case already named in the spec. Next session picking up MOB:
  wire `setBaseline` into M2's push path instead of re-deciding the definition.
  `witness_gantt_baseline.js` (new): real authored schedule + real drag on Terminal (20-task cascade)
  11/11, Duplex (10-task cascade) 11/11 — RED control (no-baseline refusal), exact scope match (only
  dragged/cascaded tasks show variance), re-baseline proven as a true overwrite (no row accumulation).
  **Display is a deliberate follow-on, not built here** — this PR ships capture+read only, no new
  variance-visualization UI; per KISS, that's a separate task when actually needed, matching MOB M5's
  own "no new UI, reuse `§TM-VARIANCE`" pattern.
  Also bumped `sw.js` CACHE_VERSION v947→v948 in the SAME PR (touches precached files again) —
  applying the #1189 lesson proactively this time, not as a trailing fix.
  `tm-touched`/`tm-new`'s old handler `copyGuids()` is now UI-unreachable from either transport
  button but was deliberately left in the file, not deleted — still a working, self-contained
  console-callable debug utility, and deleting it was out of scope for a UI slot swap.

### ⚠ CACHE-VERSION DISCIPLINE — landmine hit and fixed live this session (2026-08-05)
Three PRs in a row this session (#1186/#1187/#1188) modified `PRECACHE_ASSETS` files
(`time_machine.js`, `schedule_author.js`, `rates.js`, `rates/sequence_rules.json`) **without**
bumping `sw.js`'s `CACHE_VERSION` — a direct violation of this project's own standing rule
(`feedback_bimootb_sw_cache_bump_on_viewer_change.md`). Caught only because the user pasted a live
browser console log from a post-#1188 Hospital session and it was checked against `sw.js` before
trusting it as evidence — the log itself gave no way to tell which code was actually running. Fixed
same-session via bim-ootb PR #1189 (v946→v947), and #1190 (v947→v948) applied the lesson proactively
in the same PR rather than as a trailing fix. **Standing reminder for every future PR touching any
`PRECACHE_ASSETS` file in this repo: bump `CACHE_VERSION` in the SAME commit, not after.**

**STILL OPEN — the drag link not closed:** no `§GANTT_DRAG_COMMIT` has ever been observed. Events
reach the canvas (a probe listener fires), the handler is wired (`cv._dragWired === true`), and bars
are now editable (banner gone) — but the last attempt aimed a synthetic pointer at row 0,
`x = marginL + 40px`, which is a GUESS at the bar's extent, not measured geometry. A short first bar
simply would not be under that point, producing exactly the observed silence.
**NEXT SESSION, do this first:** expose the drawn bar rects (a `window.__tm*` debug hook, the
convention this file already uses for `__tmScheduleDebug`), aim at a MEASURED midpoint, and only then
assert `§GANTT_DRAG_COMMIT` / `§GANTT_EDIT_CLAMP` / `§GANTT_RETIME` numbers. Until that passes, treat
the drag gesture as UNVERIFIED end-to-end — the engine beneath it is witnessed 184/184, the gesture
reaching it is not.

**PR #1173 opened (bim-ootb) for the 9 commits still stranded past #1171's squash-merge point** —
`main`/the sandbox had none of the browser-proof fixes (`9902f6d`/`9799f24`/`6a5073f`), the
`__tmGanttBars` debug hook (`41a4bd9`), or the BOQ4D work. Not merged yet.

**Headless follow-up 2026-08-04 (Chrome busy in a concurrent session — did this instead, no browser
needed): the "axis vs. per-bar percentile trim" theory is REFUTED by real numbers.** Read
`buildGanttTasks()` and reasoned that since `_projectStart`/`_projectEnd` (the axis, `:110-111`) are
raw min/max while each bar's own span is 2nd–98th percentile trimmed (`§GANTT_MINI_TRIM`, `:4589-4602`),
a crew-starved long tail could stretch the axis and shrink every bar to a sliver. Tested it directly:
`scratchpad/witness_gantt_axis_trim.js` (bim-compiler) authors a REAL schedule via the shipped
`ScheduleAuthor.materializeZones()` (same verb `witness_boq_charts_real_schedule.js` uses) on all 6
building fixtures, then computes each real task-group's trimmed span as a fraction of the real axis:
**widest bar 21–71% of the axis, average bar 4.7–13.3%, across Duplex/Clinic/JKR/HHS/Hospital/Terminal.**
Not degenerate — a bar averaging ~10% of a ~267px-wide canvas is ~27px, plainly visible. The theory
does not hold.

**A different, evidence-consistent account for the "534/13080 ≈ 4%" reading emerged from the same
numbers, not yet proven:** that probe sampled a 327×40px STRIP — only the top 2–3 rows (`rowH=14px`),
not the whole canvas. K1 row order puts Substructure first, and per-row bar width in a Gantt chart is
inherently sparse (~10% avg fill × 12px bar height leaves most of a row's pixels as background by
design). Back-of-envelope using the witness's real avgBarFrac: 2–3 rows × ~320px² of real paint ≈
640–960px² over a 13,080px² strip = **4.9–7.3%** — close enough to the reported 4% that "near-empty" may
be reading a correctly-sparse Gantt chart as broken, the same kind of probe-misread the commit already
owned once (differently: last time 4% was over-read as "content drawn"; this time it may be under-read
as "broken"). **Not proven either way** — exact probe row/threshold unrecoverable (never committed to a
script, was an ad-hoc CDP session). This is exactly why `__tmGanttBars` (exact rects, no pixel-counting
ambiguity) is still the right next step, now for a sharper reason: pixel-fill heuristics can't
distinguish "correctly sparse" from "actually broken" on a chart shaped like this one.

## §MEP_HUNG_FROM_ABOVE — a real, measured support-invariant gap (2026-08-04, user reference: `~/Downloads/Hospital_verynice.mp4`)

User: that video is the visual quality bar to surpass, and it shows "slight elusive creeping elements
appearing without support" — the original trigger for this whole session's scheduler refactoring.
`witness_support_invariant_all_buildings.js` already reports 0/0 floating on all 6 buildings, so the
existing invariant is not lying — it is testing the wrong thing for one class of element.

**Code review finding:** `schedule_gate.js`'s `geoGate`/`auditFloating` only ever check for a support
BELOW an element (`S.base_z < el.base_z - EPS`) — correct for structure resting on structure, but MEP
ductwork/pipe (`IfcDuctSegment`/`IfcPipeSegment`/`IfcFlowSegment`, all `seq:7`) is physically hung FROM
the slab ABOVE it. Nothing in the scheduler or the audit has ever tested that relationship — every prior
fix in this file's history (§4D_ROOF_LOAD_PATH, §4D_WALLS_BEFORE_ROOF, §4D_WALL_BORNE_STRUCTURE and its
5 rejected redesigns) dealt exclusively with support-from-below. This is a genuinely new class of gap,
not a re-litigation of settled work.

**Measured (`scratchpad/witness_mep_hung_from_above.js`, bim-compiler — diagnostic only, no production
code touched): 25 real violations across 6 buildings**, all `IfcPipeSegment`, all small relative to their
building's hung-MEP population (0.1–0.9%):
- Duplex 0/704 · Clinic 0/6925 · HHS 0/2467 · **Hospital 0/30411** · JKR **4/1819** (worst lag 6.2d) ·
  Terminal **21/4462** (worst lag 7.8d)

**Honesty check, not yet resolved:** Hospital — the building in the reference video — scores 0 on this
specific check. This gap is real and worth fixing (JKR/Terminal), but it does NOT by itself explain
what the video shows. Two live possibilities, neither confirmed: (a) the video predates one of the
Aug 1 fixes (§4D_ROOF_LOAD_PATH/§4D_WALLS_BEFORE_ROOF, both shipped ~04:00–16:00 on 2026-08-01; file
mtime is 2026-08-03 04:19, so it postdates those — this is likely NOT it, but not yet cross-checked
against which commit was actually live when the bake ran) or (b) a different, still-unidentified
relationship this session hasn't checked yet (candidates: `IfcRailing`/`IfcStair` between levels,
curtain-wall/cladding on incomplete structure, or the zero-lag "start == support finish exactly"
simultaneity case — an element CAN legitimately start the same instant its support finishes, which a
strict `<` audit correctly allows but a human eye sweeping past in the same frame might read as
simultaneous "popping in").

**Next session:** (1) fix the 25 measured MEP-above violations — likely a `wallGate`-shaped addition,
support = nearest real slab whose `base_z` sits within GAP above the element's `top_z`, same
`overlap()`/EPS/GAP already in use, no new invented constants; (2) do NOT treat that as closing this
item — Hospital's 0 score means the video's actual defect is still unidentified, chase it after (or
alongside) `__tmGanttBars` once Chrome is free.

### §GANTT_AXIS_OUTLIER — CONFIRMED LIVE on Hospital (2026-08-04, Chrome free'd up, `__tmGanttBars` used exactly as directed)

Sandbox pointed at the `feat/gantt-edit-foundation` branch tip (`41a4bd9`, has the hook — `main` does
not, see PR #1173), Hospital fixture symlinked in, `?tm=1` deep link, Gantt drawer opened, real
`window.__tmGanttBars` read back — this is the "aim at measured geometry, not a guess" step the branch's
own last commit named as next. Ground truth, not inferred:

- **Live project span is 1049 days.** My earlier headless witness (`witness_gantt_axis_trim.js`)
  computed only 416 days for Hospital via a direct `computeSchedule()` call — a real, now-explained
  discrepancy: the live path processes the FULL real element set through the shipped
  `§4D_BAND_MONOTONIC` gate, which console-logged **`gatedB=51712`** — 81% of Hospital's 63,416 elements
  were held by the same-trade-one-floor-down band gate, live, in this exact run.
- **Every legitimate bar (Substructure through MEP Final, all 7 levels) finishes by ~31% of the axis**
  (`__tmGanttBars` x/w read back and expressed as % of the 270px bar width — Superstructure levels sit at
  0.8–4%, the latest normal bar, `MEP Final|Level 2`, ends at 29.9%). That 31% is why the drawer LOOKS
  near-empty at the canvas's default width — it is not degenerate math, the real work is genuinely
  compressed into less than a third of what's drawn.
- **THE OTHER 69% OF THE AXIS IS ONE ELEMENT.** `__tmGanttBars` shows exactly one outlier bar —
  `phase=Architecture, storey=_UNKNOWN` — sitting alone at **x=100.0%**, i.e. it alone defines
  `_projectEnd` and stretches the whole axis from a real ~325-day build to 1049 days. This is the
  `_UNKNOWN`-storey bucket this file's own §4D_BAND_MONOTONIC header comment already named as a landmine
  ("~9457 no-storey elements reassigned to nearest storey by median Z... a band rule laid on a wrong
  grouping enforces a wrong order confidently") — one element evidently escaped or survived that
  reassignment with a schedule position nothing else in the building shares.
- **This is the real, now-identified mechanism behind "near-empty drawer" on Hospital specifically** —
  not a rendering bug, not a probe-misread, not the percentile-trim theory (refuted earlier). One
  `_UNKNOWN`-storey Architecture element, alone, 3x past the real project end.
- **Next step, concrete:** find that element's guid (`_UNKNOWN` storey ⇒ likely one of the ~9457 the
  band-gate header already flagged), check what real geometry/data drove its schedule position, and
  decide whether the fix is (a) better storey reassignment for that one element, or (b) an axis-display
  guard that doesn't let a single `_UNKNOWN`-storey straggler define `_projectEnd` for the whole chart
  (two different fixes — (a) fixes the schedule, (b) only fixes the chart; do (a) first, don't paper
  over real bad data with a display clamp).

### User-reported, live, unresolved: "2 trucks and some walls before the piling" at hour 0 (2026-08-04)

User watching Day-0/Hour-0 state reports walls (and site-equipment "trucks") appearing before piling —
a real sequencing complaint, wants "P6, heavier logic." **Checked one candidate mechanism, ruled it
out:** structural bbox degeneracy (the same class of defect `IfcStair` showed in `__tmScheduleDebug` —
`x0=x1=y0=y1=0` — which would make `geoGate`'s spatial grid blind to a support). Measured directly
against Hospital's real DB: **`IfcFooting`/`IfcColumn`/`IfcBeam`/`IfcMember`/`IfcPlate`/`IfcSlab` are
0% degenerate** — every structural class has a real, non-zero bounding box. Piling is not geometrically
invisible to the gate. **Root cause still open** — not yet checked: whether wall bboxes actually
XY-overlap their true supporting footing (grid-cell edge cases), or whether "trucks"/site-equipment is
even a class the scheduler assigns a support requirement to at all (same shape as §MEP_HUNG_FROM_ABOVE —
an unmodeled-support class, not a broken check). **Do not claim P6-grade CPM logic is a quick add** —
this file's own history already tried and rejected 5 designs in that direction
(`§4D_WALL_BORNE_STRUCTURE`, `§ELEMENT_CPM`, `§CPM_DUAL_ELEVATION`, all 2026-08-02, all "NOT FOR MERGE" —
each traded away the band-monotonic fix to get support-invariant to 0, or vice versa). Any new attempt
must be measured against BOTH invariants at once, not just the one it's chasing.

### §GANTT_AXIS_OUTLIER — FIXED, PR bim-ootb#1175 (2026-08-04)

**Worktree collision, resolved:** `/tmp/wt-sandbox` is a SHARED standing worktree (per its own memory
doc) — while building this fix there, HEAD silently moved out from under the edit session (another
process re-checked it out). Investigated before assuming repo damage: `origin/feat/gantt-edit-foundation`
was confirmed fully intact throughout (`41a4bd9`, all 5 browser-proof fixes present) — this was a LOCAL
worktree-reuse collision, not a lost-commit or bad-merge event. Recovered by saving the in-progress diff
as a patch, then rebuilding it fresh in a dedicated private worktree (`/tmp/wt-gantt-axis-fix`, since
pruned) rather than reusing the shared one for active edits — matches the Worktree Hygiene rule this
project already carries ("prefer a private worktree when a task might overlap with concurrent work").

**The fix (user-directed design, not invented ad hoc):**
- User: don't special-case the `'_UNKNOWN'` storey label — refer back to the pattern already proven
  correct in this file for exactly this problem. `buildGanttTasks()` already 2nd–98th percentile-trims
  each BAR's own span (`§GANTT_MINI_TRIM`); this applies the SAME trim, same threshold, to the GLOBAL
  population of `end_ts` that defines the chart's axis — root-cause-agnostic, catches any wild outlier,
  not just the one already found.
- New, SEPARATE vars `_ganttAxisStart`/`_ganttAxisEnd` — `_projectStart`/`_projectEnd` themselves stay
  untouched, since real playback (scrubbing, `renderAtTime`, "every element must eventually build") must
  never disagree with what actually gets built. This is a DISPLAY-scale decision, not a data change —
  the JSON/task data a user could also edit via P6/MPP round-trip remains the single source of truth;
  only how the chart SCALES itself against that same data changes.
- Every pixel↔time conversion the drawer does was audited and patched to use the qualified axis
  consistently: bar draw, ruler ticks/gridlines, click-to-seek, `findBarAtClick` hit-testing, `ganttHit`
  drag-hit-testing, and the `__tmGanttBars` hook itself (so a future live probe reads the same numbers
  the chart actually draws). Verified via grep — zero stray unqualified-axis references left in any
  Gantt-drawer-specific function.

**Verification status, stated honestly:** syntax-checked (`node --check`), and the DEFECT this fixes was
already conclusively proven live pre-edit (this file's own §GANTT_AXIS_OUTLIER CONFIRMED LIVE section
above). NOT re-verified live post-edit — hit the pre-documented WebGL/GPU init failure
(`project_machine_chrome_firefox_gpu_launchers.md`) on this box after ~100min of heavy tab reuse, a known
environment issue, unrelated to this change. **Next session, first thing:** fresh tab, fresh Hospital
load, re-query `__tmGanttBars`, confirm bars now span most of the axis and the ruler reads ~325d not
1049d — the PR (bim-ootb#1175, base `feat/gantt-edit-foundation`) says this explicitly in its own test
plan as an open checkbox, not a silent gap.

**Still separately open, not touched by this fix:** the "walls/trucks before piling at hour 0" report
and the Hospital-video defect (§MEP_HUNG_FROM_ABOVE scored 0 on Hospital) remain unidentified — this fix
closes the axis-scaling defect only, not those two.

## CAL — Working-day toggles (user ruling 2026-08-04: simple toggles in the drawer, later)
Reopens the working-calendar item that was closed as "don't silently guess a default" — **the toggle
dissolves that blocker**: we ship a stated default and the user sets their own. A real, nameable,
user-controlled business assumption, not an invented value.
- `_addDays` (`schedule_author.js:185`) is `days * 86400000` — fully calendar-blind, but a **single
  choke point** with 9 call sites (`:360, 370, 528, 538, 539, 681, 689, 963, 1065, 1066`).
- Durations are ALREADY working-day counts (`28800s = 8h` workday), so enabling a 5/6-day week
  re-derives **no rate** — it only maps the same real day-count onto the correct calendar dates.
- **Two separate deliverables, do not conflate**: (a) shading non-working columns in the drawer is
  cosmetic and cheap; (b) durations actually skipping them moves every date. Shipping (a) without (b)
  makes bars visibly run through shaded weekends — honest, but reads as a bug.
- **Holidays ≠ working week.** A weekday toggle is a safe default; a holiday list is locale data we do
  not have. Degrade to "no holidays" and say so — never invent one.
- Payoff: `erp/tests/real_xer_witness.js` already measured this gap against a real P6 file — 49/52
  start dates up to 59 days early, all one-directional. This is the biggest single gap between our
  dates and a P6 user's dates.

## VIS — Drawer facelift (colour + legend) — AWAITING USER OK, see Open Decisions
Real defects found, not taste:
- `PHASE_COLORS` (`time_machine.js:4102-4109`): `Substructure #7a8a8e` and `Superstructure #5b7fa5`
  are both desaturated blue-greys — the least distinguishable pair sits on the two adjacent structural
  phases.
- The text fallback collides on the SAME pair: label is `phase.substring(0,3)` (`:4543`) → `"Sub"` vs
  `"Sup"`, at 9px, and only drawn when `w > 40`.
- `Architecture #c07a4a` (orange-brown) competes with two reserved STATUS colours: `#ff8c00` = active
  bar outline + cursor hairline (`:4531`, `:4550`), `#ffeb3b` = captured-IFC-4D frame (`:4524`).
- Fills are drawn at `globalAlpha 0.8` (`:4516`), flattening what contrast remains.
- Palette encodes no trade family: the two MEP phases (`#8bc34a` / `#ab47bc`) look unrelated; MEP
  Rough-in and Finishes (`#26a69a`) look related.

Proposed: 3 trade families by hue, dark→light within each family following build order, orange/yellow
reserved for status only — Substructure `#37516b`, Superstructure `#5b9bd5`, MEP Rough-in `#2e7d52`,
MEP Final `#66bb6a`, Architecture `#6a4c93`, Finishes `#b07fd4`; fills at alpha 1.0; and an explicit
short-code map replacing `substring(0,3)` (`SUB / SUPER / MEP-R / MEP-F / ARCH / FIN`).

**Legend removal — confirmed safe.** The hover tooltip (`time_machine.js:2923-2942`) already reports
`storey — phase (N el, Day X–Y, generated | IFC 4D)`. The legend (`:2618` markup, `:4457-4472` fill)
is strictly redundant; deleting it returns a row of vertical space to the bars.

## DEP — Deprecation targets
- `viewer/schedule_author_ui.js` (507 lines, the ✎ side panel, `tm-author` button `:2585`)
- `viewer/schedule_editor_ui.js` (696) + `viewer/schedule_editor.html` (the ↗ Editor new tab, `:2587`)
- `boq_charts.html` — a FOURTH disconnected scheduler with its own stale MEP-before-Architecture
  `PHASE_ORDER` arrays. Redirect to real `tasks` via `AnalysisSidecar.compute4D()`'s existing-but-unused
  `capturedFn` hook (passed `null` at the `get4D()` call site, ~`:1218`) rather than patching it again.

## Witnesses (name the issue each proves — no test that cannot fail)
- `witness_gantt_bar_identity.js` — proves K0: every drawn bar resolves to a real `tasks.task_id`, and
  the set of bars equals the set of zone tasks. Fails today by construction.
- `witness_gantt_edit_constraints.js` — proves C1/C2: a forced illegal move is clamped, never accepted;
  a legal move cascades exactly the real `task_sequences` successors and no others.
- `witness_gantt_edit_coherence.js` — proves W1: after an edit, every `task_elements` guid's op
  timestamp lies inside its task's new window. This is the drawer-vs-movie divergence detector.
- `witness_working_calendar.js` — proves CAL(b): with a 5-day week, zero task start/finish dates land
  on a non-working day, and total working-day count is unchanged from the 24/7 run.
- Existing, re-run as regression: `witness_zone_cpm.js`, `witness_zone_cpm_duplex.js`,
  `witness_support_invariant_all_buildings.js`, `witness_tm_duration_sync.js`.

## Order of work
**User ruling 2026-08-04: "P6/MPP extras later — now is getting the core foundation upgraded to
correct 4D iron clad."** So CAL and the `boq_charts.html` redirect are explicitly OUT of the current
band; they are P6-alignment work, not foundation. The foundation band is K0→E→C→W: a bar that IS a
real task, edits that obey the real DAG, and a movie that always agrees with the chart.

**FOUNDATION BAND — COMPLETE 2026-08-04, branch `feat/gantt-edit-foundation`, all pushed.**
The TM Gantt drawer is now the editable 4D surface. Every item below has a witness that can fail.
1. ✅ **K0 bar identity** — `789ff51`. 7 buildings, 42/42, 268,093 elements, 100% resolve.
2. ✅ **VIS facelift** — `610b361`. 7/7, RED-proved against the old palette.
3. ✅ **E5 ruler + E6 resizable drawer** — `76538e9`. Tick spacing verified over 18 span×width combos.
4. ✅ **§ZONE_EDGE_LEAD + C1/C2 engine** — `3c9349e`. 53→0 self-violated edges; 7 buildings, 14/14.
5. ✅ **K1 P6 row ordering** — `73f2f1b`. 9/9, order DERIVED from `SEQUENCE_RULES`, never hardcoded.
6. ✅ **E1/E2 drag UI + W1 re-time** — `2d9a47d`. `witness_gantt_edit_coherence.js` 7/7.
7. ✅ **E3/E4 link + unlink, E7 property panel** — `ca7c44e`. Constraints witness now 18/18.

**Full suite at close: 93/93** — bar_identity 6 · palette 7 · row_order 9 · coherence 7 ·
constraints 18 · zone_cpm 11 · zone_cpm_duplex 9 · tm_duration_sync 8 · support_invariant_all 18.

**DEP progress (user ruling 2026-08-04):** the ✎ Author-4D side-panel button is REMOVED (`2d9a47d`) —
entry point only, `schedule_author_ui.js` still loads so nothing referencing it breaks. The ↗ Editor
tab STAYS for now, to be consolidated into the drawer in a later pass. `boq_charts.html` redirect
dispatched to an agent on the same branch.

**Honesty note carried forward — a witness claim that was WRONG and got corrected:**
`witness_gantt_edit_coherence.js`'s first RED control asserted that a naive (unclamped) affine remap
escapes the task window. **It does not and cannot for realistic input** — the affine map sends the old
window onto the new exactly, and the 60s minimum-duration bump only fires when a task's new span ÷ its
element count drops below 1ms, which needs more elements than a day has milliseconds. So the window
clamp inside `_retimeSpan` is belt-and-braces, NOT load-bearing, and no future session should claim
otherwise. The control now tests the real defect W1 prevents — task dates moving while elements do not
— and measures it: **skipping the re-time strands 4,993 of 5,160 elements outside their task window.**

**LATER BAND (P6/MPP alignment — do not start unprompted):**
6. **CAL toggles** (a then b) — the working-calendar model.
7. **DEP** — delete the two editors only once the drawer covers their real use; `boq_charts.html`
   `capturedFn` redirect.

## Open decisions (blocking nothing yet, but answer before the matching step)
- ⛔ **VIS palette** — proposed above, awaiting user OK (aesthetic, so not shipped unilaterally).
- ⛔ **"Remove the trivial panel"** — ambiguous, and removal is hard to reverse. The Apply-to-4D hang
  fires inside `time_machine.js`'s captured-overlay path (`:3943-4084`), which runs whenever a captured
  schedule exists — so deleting a *panel* does not by itself remove the hanging code. Meaning either
  (a) drop the ✎ Author 4D side panel, or (b) revert PR #1154's two-phase collect-and-guard block?
- **Hang root cause, corrected**: the prior session concluded "`§WRITE_LOOP_TIMING` never fired, so the
  freeze is before the write loop." **That inference is wrong** — `_wlT0` is captured at `:4075` and
  logged at `:4083`, i.e. only AFTER the loop completes, so a freeze *inside* the loop produces exactly
  the same silence. It rules out nothing. Confirmed regression origin: `git log -S_allScheduled` returns
  exactly one commit, `d35366a` (**PR #1154**) — matching the user's report that the hang is new. Prime
  suspect on measurement grounds is the `_ogStructGrid`/`_ogWallGrid` cell-bucket pass (`:4038-4068`),
  which is superlinear in footprint area, not the 63k prepared-statement writes. NOT yet measured.

---

## §GANTT_EDIT / BOQ4D — `boq_charts.html` redirected onto the real schedule (SPEC, 2026-08-04)

Spec written BEFORE any code (Spec-First, CLAUDE.md). Scope is exactly the DEP bullet above
("`boq_charts.html` is a FOURTH, fully disconnected scheduler"), brought forward on a direct user
ruling; the rest of the LATER BAND (CAL, deleting the two editors) stays untouched.

### B0 — What is actually wrong (verified in the file, not assumed)
`viewer/boq_charts.html` (the "4" button / HTML charts tab) never reads the schedule model. Three
independent hardcoded `PHASE_ORDER` arrays, all identical and all stale:
- `:423` inside `generateSchedule()` — the coarse phase×storey forward pass,
- `:560` inside `audit4DSchedule()` — the 8-check audit's own phase-inversion test,
- `:818` inside `buildScheduleFromOps()` — the kernel_ops rollup (NOT previously named in this file;
  found while specing this item, so the count is THREE stale copies in this file, not two).

All three read `['Substructure','Superstructure','MEP Rough-in','Architecture','MEP Final','Finishes']`
— MEP rough-in BEFORE the building envelope, the exact ordering PR #1165 corrected across 18 rate
sources. The real order, read from `SEQUENCE_RULES`' own sequence numbers (min sequence per phase,
the same derivation `proj_fold.js:140` and `time_machine.js` `_ROW_PHASE_ORDER` already use):
`Substructure(1) → Superstructure(2) → Architecture(5) → MEP Rough-in(7) → MEP Final(9) → Finishes(10)`.
Consequence of `:560` being stale: `§4D_AUDIT_PHASE_ORDER` was grading the schedule against the WRONG
order, so a correct schedule would be reported as inverted (and vice versa) — the audit was actively
misleading, not merely cosmetic.

### B1 — Direction (user-approved, not invented here)
Redirect the page onto `schedule_author.js`'s real `tasks` / `task_elements` / `task_sequences`
records via `AnalysisSidecar.compute4D()`'s existing-but-unused `capturedFn` hook (`analysis_sidecar.js
:132`, passed `null` at the `get4D()` call site `boq_charts.html:1218`). Do NOT patch `generateSchedule()`
into a second engine — it stays exactly as-is, as the no-authored-schedule FALLBACK only.

### B2 — Where the reader lives, and why it is a new file
The reader goes in a new DOM-free, node-requireable module `viewer/schedule_read_4d.js`
(`window.ScheduleRead4D`), NOT inline in the HTML. Two reasons, both load-bearing:
1. A witness cannot `require()` an HTML file. Putting the logic inline would force the witness to
   re-implement it — which is precisely the "copy the predicate instead of importing it" convention
   this file already named as the root cause of the same bug being fixed three times in one session.
2. Schedule detection must call `ScheduleAuthor.activeSchedule(db)` — the ONE existing verb — rather
   than growing a fourth copy of "which schedule is active". `boq_charts.html` therefore also gains a
   `<script src="schedule_author.js">` tag.

### B3 — The reader's contract (`ScheduleRead4D`)
- `phaseOrder(rules)` → phase names ordered by MIN `sequence` over all classes of that phase in
  `SEQUENCE_RULES`. Derived on every call, never cached at load — `initRateTemplate()` mutates
  `SEQUENCE_RULES` in place at runtime (`rates.js:446`), so a load-time snapshot would go stale.
  Returns `[]` when rules are unavailable; every call site falls back to its own behaviour rather than
  substituting an invented order.
- `readTasks(db, opts)` → `null` when there is no active schedule / no dated leaf tasks (the page then
  keeps its existing behaviour untouched), else an array of task rows in the page's existing shape.
  Every field traces to a real record:

| field | source | invented? |
|---|---|---|
| `taskId`, `name` | `tasks.task_id`, `tasks.name` | no |
| `startDate`/`finishDate` | `tasks.schedule_start`/`schedule_finish` | no |
| `startDay`/`finishDay`/`duration` | those dates minus the schedule's own earliest start | no (derived) |
| `guids` | `task_elements.guid` | no |
| `qty` | count of those guids, `uom='EA'` | no |
| `ifcClasses`, `storey` fallback | `elements_meta` joined by guid | no |
| `phase`, `storey` | `tasks.name` split on `' — '` (the separator `materializeZones:376` writes), validated against `phaseOrder()`; element-majority fallback | no |
| `discipline` | `SEQUENCE_RULES[cls].resource` → MEP/STR/ARC, the SAME mapping `buildScheduleFromOps` uses | no |
| `crew` | Σ `LABOR_RATES[res].crew_size` | no |
| `equipment` | `EQUIPMENT_ALLOCATION` → `EQUIPMENT_RATES[..].desc` | no |
| `predecessors` | `task_sequences` (id, type, lag_days) | no |
| `wbs` | `1.<phaseRank+1>.<row>` — the page's existing display convention | display only |
| `crews` | `1` — the real model records no crew split (same as `buildScheduleFromOps:890`) | no |

**There is no duration cap on this path.** `MAX_TASK_DAYS = 20` (`:426`) is an invented constant; it is
NOT carried over and NOT replaced by another invented number. Durations are the real persisted dates.
It survives untouched in `generateSchedule()`, which remains the honest "no schedule authored yet"
fallback — naming it here so it is a known, stated remainder rather than a silent one.

### B4 — Precedence, and why kernel_ops must NOT override the real tasks
Current order is `resolve4D(default4D, ops, buildScheduleFromOps)`: kernel_ops overrides the default.
That override re-groups ops on `storey|||phase` — the exact key K0 measured as wrong (Hospital drew
60 bars for 35 real tasks, because `collapsePhase()` merges storey aliases the raw `p.storey` does not).
So when a real authored schedule exists it WINS outright and the kernel_ops override is skipped, with a
`§` line saying so. With no authored schedule, nothing changes: baked default → kernel_ops override,
exactly as today.

The page's own "source" badges (`:1584`, `:1756`) treat only `kernel_ops` as a real source; `authored`
joins it. `compute4D` gains a 3-line, backwards-compatible tweak so `capturedFn` may return either a
bare array (existing contract, labelled `captured`) or `{source, tasks}` — without it the log would
call an authored zone schedule "captured", which is a different, real thing (native IfcWorkSchedule).

### B5 — Witness: `witness_boq_charts_real_schedule.js` (must be able to FAIL)
Fixtures carry `tasks`/`task_elements`/`task_sequences` tables but ZERO rows, so the witness first
materializes a real schedule with `ScheduleAuthor.materializeZones()` (the same verb the app uses) and
then reads it back through the SHIPPED `ScheduleRead4D` — not a re-implementation.
- **B-4D-1/2 (phase order)** — `phaseOrder()` equals the order independently derived in the witness
  from `SEQUENCE_RULES`' sequence numbers, and Architecture precedes MEP Rough-in.
- **B-4D-3 (source guard)** — `boq_charts.html` contains ZERO occurrences of the stale literal
  `'MEP Rough-in','Architecture'` and does reference `ScheduleRead4D`. Fails if the fix is reverted.
- **B-4D-4..8 (real records)** — every returned row carries a `task_id` present in `tasks`; every guid
  is a real `task_elements` row; guid totals reconcile; dates equal the persisted strings; every
  `predecessors` edge is a real `task_sequences` row.
- **B-4D-9/10 RED CONTROL** — the OLD path, replicated: group the same elements on `storey|||phase`
  under the stale hardcoded array. Assert (a) it yields ZERO real task_ids — the old page could never
  address the model — and (b) its phase ordering differs from the derived one. Both go GREEN only
  because the fix exists; reverting turns them RED.

Verification is `§`-tagged log output from headless node runs over real fixture DBs. No screenshots
(FUNDAMENTAL LAW).

### BOQ4D SHIPPED 2026-08-04 — `witness_boq_charts_real_schedule.js`, 6 buildings, 91/91, 145,763 elements
Branch `feat/gantt-edit-foundation` (bim-ootb). The "4" button's charts/audit/4D-export now read the
real `tasks` / `task_elements` / `task_sequences` rows through `compute4D`'s `capturedFn` hook.
- **New** `viewer/schedule_read_4d.js` (`window.ScheduleRead4D`) — the DOM-free reader; the witness
  `require()`s the SHIPPED module, it does not re-implement it.
- **All THREE** hardcoded `PHASE_ORDER` arrays deleted (`generateSchedule`, `audit4DSchedule`,
  `buildScheduleFromOps`; the third was not previously named in this file). `phaseOrder()` derives from
  `SEQUENCE_RULES`, giving `Substructure → Superstructure → Architecture → MEP Rough-in → MEP Final →
  Finishes` — verified against the sequence numbers by B-4D-1.
- **MEASURED, real fixtures** (`materializeZones` → read back): Duplex 18 tasks/1,143 el ·
  Clinic 32/16,912 · JKR 63/8,985 · HHS 17/6,880 · Hospital 35/63,415 · Terminal 71/48,428. Every row
  carries a real `task_id`, dates are the persisted strings verbatim, guid totals reconcile exactly
  (145,763 = the `task_elements` count), all 349 `predecessors` are real `task_sequences` edges with
  matching lags.
- **The `MAX_TASK_DAYS=20` cap is gone from this path** — not replaced by another number. Measured
  real durations it was distorting: Hospital max **253d** with **18** tasks over the old cap, Clinic
  96d/3, Terminal 58d/8, HHS 27d/1.
- **`storey|||phase` is no longer the identity.** Measured again on the same elements: Hospital's old
  key yields **60 groups for 35 real tasks** (19 tasks split) — the K0 defect, previously reachable
  through this page too. All 6 fixtures: 0 of the old keys is a real `task_id`.
- **RED control verified by actually reverting** (pre-fix `boq_charts.html` + a stale `phaseOrder`):
  **7 checks went RED**, including the data-driven B-4D-10a (`inversions=1 Architecture(d0)<MEP
  Rough-in(d15)` on Clinic). Restored, 91/91 green.
- `analysis_sidecar.js compute4D` now accepts `{source, tasks}` from `capturedFn` so an authored
  schedule is not logged as `captured`; `tests/test_4d_sidecar.js` extended (13/13, bare-array
  contract unchanged). `sw.js` v938→v939 + precache of the new file.
- **kernel_ops override deliberately skipped when a real schedule exists** (B4) — `buildScheduleFromOps`
  re-groups on `storey|||phase` and would re-introduce the 60-vs-35 split.

**Known remainders, not fixed (stated, not silent):**
- `generateSchedule()` (the no-authored-schedule fallback) still carries `MAX_TASK_DAYS=20`,
  `INTER_PHASE_LAG=5`, `INTER_STOREY_LAG=2` — all invented constants. Left alone deliberately: the
  brief forbids swapping an invented constant for another invented constant, and there is no real
  value to take when no schedule exists. It is now ONLY reached when nothing is authored.
- `audit4DSchedule` check 4 fails any task >120 days; Hospital's real longest zone task is 253d, so
  `§4D_AUDIT_DURATION` will report FAIL on real data. That threshold is itself an invented constant —
  NOT adjusted (adjusting it would be inventing a new one). It needs a user ruling on what a real
  duration ceiling is, or the check should be re-expressed against something real.
- Only verified headlessly at the model level. The fixtures have no `kernel_ops`-vs-`tasks` conflict to
  exercise, and the page's own DOM render was not exercised in a browser.

## Session close-out, 2026-08-04 (evening) — §GANTT_AXIS_OUTLIER FIXED (PR bim-ootb#1175, unverified live), §MEP_HUNG_FROM_ABOVE + piling/wall report OPEN, viewer toolbar/panel re-theme DEFERRED (not started — next session, verify #1175 live FIRST before any visual work)

### §GANTT_AXIS_OUTLIER — code-reviewed (no Chrome), 2026-08-04
Per user direction this session: study the code instead of a live Chrome re-verify. PR bim-ootb#1175
is already **merged into `feat/gantt-edit-foundation`** (bim-ootb#1173's branch, still OPEN vs `main`),
not into main directly.

Reviewed the actual merged diff at `origin/feat/gantt-edit-foundation` (`4d333c2`), not a re-derivation:
- `_ganttAxisStart`/`_ganttAxisEnd` correctly separated from `_projectStart`/`_projectEnd`; grep over the
  whole file confirms zero stray unqualified-axis references left in any Gantt-drawer function (bar
  draw, ruler ticks/gridlines, click-to-seek, `findBarAtClick`, `ganttHit`, the `__tmGanttBars` hook) —
  the PR's own audit claim holds.
- Trim will actually work at Hospital's scale: `_ops` = `kernel_ops` rows (one per installed element,
  thousands for Hospital), so the `n>20` 98th-percentile trim has ample population to exclude one
  `_UNKNOWN`-storey outlier. (Edge case: for `n` in ~21–50 the `ceil()` trim math is a no-op — inherited
  unchanged from the existing per-bar `§GANTT_MINI_TRIM`, never hit at real building scale.)
- `node --check` on the branch tip: clean.
- `git merge-tree` vs current `origin/main`: **zero conflicts** — `sw.js` only differs by
  `CACHE_VERSION` number, no precache-list collision. #1173 is 17 ahead / 4 behind main; safe to sync.
- Noted, not a regression: the MaxQ-Time/X-ray derived-order feature (`tmRestoreDerivedOrder` + its
  counterpart) mutates `_projectStart`/`_projectEnd` directly, bypassing `computeDays()`/`_ganttDirty` —
  so Gantt bars AND axis both go stale together if the drawer is open in that mode. Pre-existing
  (bars were already stale there before this fix too, same `_ganttDirty` gap), not introduced by #1175.

**No bugs found in the fix.** This is a code-level pass only — still not exercised in a live browser.
Live re-verify (`__tmGanttBars` on Hospital, confirm bars span most of the axis, ruler reads ~325d not
1049d) remains the honest open item before calling this DONE, per the PR's own test-plan checkbox.

## Session 2026-08-04 (later) — §TM_CLOSE_RESTORE FIXED (bim-ootb PR #1182, merged+live); §PILING_UNSUPPORTED diagnosed, root cause named, OPEN

Two bugs dispatched this session, worked in priority order in a private worktree
(`/tmp/wt-tm-restore-fix`, off fresh `origin/main` @ `dee5076` — #1181 already landed, so
§GANTT_OPS_BOOKKEEPING_LEAK/§GANTT_AXIS_OUTLIER were both already live before this session started).

### Bug 1 — Time Machine panel close doesn't restore the full building — FIXED, PR bim-ootb#1182 (merged, live)
User report, live: "when the TM panel is killed, the scene does not restore to full building."

**Root cause, found by reading `time_machine.js` (whitebox, no guess-and-check):**
`renderAtTime()`'s per-tick `clearHighlight()` deliberately SKIPS `_tm_xrayStaged` meshes — the
§Z_STACK_XRAY_STAGING grey/0.3-opacity ghost material an element gets while waiting on its own support
carrier to finish. That skip is a real, commented perf optimization (avoids an O(staged-population)
clone+dispose sweep every tick) — the header comment says renderAtTime's own showReal branch restores
each one "explicitly, exactly once, on the tick they actually resolve." **But `deactivate()` ->
`restoreVisibility()` calls that SAME `clearHighlight()`** — so any element still staged the instant TM
is closed (cursor not parked at `_projectEnd`, or its support chain unresolved) keeps its cloned ghost
material FOREVER — nothing else ever revisits it once TM is off, until a future TM re-activation
happens to touch that exact guid again. `_highlightMeshes` (the array holding it) is also never reset
on deactivate, so the leak persists across the whole "TM closed" window, not just one frame.

**Fix:** `clearHighlight(force)` gained a param; `restoreVisibility(force)` forwards it;
`deactivate()` now calls `restoreVisibility(true)` — same "nothing may survive TM being switched off"
convention this file already applies to `_gspClear`/`_tmXraySolidifyTs`/`__tmOverlaySync` in the same
function. The per-tick call site (`renderAtTime`) is untouched (`force` omitted → `false`), so the
O(1)-per-tick property the optimization exists for is preserved.

**Witness (`witness_tm_close_restore.js`, must be able to FAIL):** brace-match-extracts the REAL
shipped `applyHighlight`/`restoreMaterial`/`clearAllOutlines`/`removeOutline`/`clearHighlight`/
`restoreVisibility`/`deactivate` verbatim out of `time_machine.js` (a generalization of
`tests/test_tm_broadcast.js`'s marker-slice idiom to non-contiguous functions), stubs every OTHER
function `deactivate()` calls (stopPlayback, clearSparks, restoreSky, `_dlodDisposeBoxes`, etc. — all
unrelated to this defect, same stubbing discipline the existing broadcast test already uses), builds
one ordinary highlighted mesh + one xray-staged ghosted mesh via the real `applyHighlight()`, then
calls the real `deactivate()`. **Measured RED pre-fix: 3/7 fail** (staged mesh kept its cloned ghost
material, opacity stuck at 0.3, `_tm_highlighted`/`_tm_xrayStaged` both still `true`) — confirmed
against the actual pre-fix code, not asserted. **7/7 green post-fix.**

**Regression, all green, zero failures:** `witness_gantt_bar_identity` (6), `witness_tm_duration_sync`
(8), `witness_gantt_ops_blackbox` (7), `witness_zstack_xray_staging` (4), `witness_gantt_edit_constraints`
(18), `witness_gantt_edit_coherence` (7), `witness_gantt_row_order` (9), `witness_gantt_palette` (7),
`witness_zone_cpm` (11), `witness_zone_cpm_duplex` (9), `witness_support_invariant_all_buildings` (18),
`tests/test_tm_broadcast.js` (11).

`sw.js` v944→v945 (viewer/ file changed, same-commit bump). PR bim-ootb#1182: fast-checks + e2e-tests
both green, auto-merged into `main` (`e1315e8`), GH Pages build confirmed `built` (14:34:38Z same day).

### Bug 2 — "2 trucks and some walls before the piling" at hour 0 — DIAGNOSED, root cause named, NOT fixed (per this file's own standing rule: no 12th CPM redesign in one session)
Per the task brief, worked the two named-but-unchecked sub-hypotheses from the prior session's entry
above. **Both produced real, measured answers** — diagnosis only, no production code touched, using a
throwaway node script (not committed) against real fixture DBs via the same
`ScheduleAuthor._buildScheduleElements` + `ScheduleGate.computeSchedule` path
`witness_support_invariant_all_buildings.js` already uses.

**(a) Grid-cell edge case — REFUTED, not the cause.** Replicated `geoGate()`'s exact cell math
independently (same `CELL=4`/`EPS=0.05` constants) and compared brute-force (no bucketing) XY-overlap
support-finding against the real cell-bucketed result, for every ground-level wall on all 6 large
fixtures. **`realSupportButCellGridMissedIt = 0` on every building** — whenever a wall genuinely has a
qualifying structural element beneath it, the cell grid finds it. The grid bucketing is not the bug.

**(b) Staffage="trucks" — REFUTED.** `viewer/effects.js`'s only vehicle asset is `§STAFFAGE_CAR_MESH`
(a VW Beetle, PHOTOREAL_STILL_RENDER.md), placed ONLY on a manual Alt+P keypress, entirely independent
of the Time Machine cursor/schedule — not gated by `_active`/`renderAtTime` at all, and not named
"truck" anywhere in the codebase. It cannot be what the user saw during TM playback.

**The real, measured mechanism — a genuine absence of modeled structural support under specific
elements, not an algorithm bug:**
- Hospital: **27/515 (5.2%) ground-level walls** have `geoGate()` legitimately returning `baseMs` —
  brute-force confirms **zero** structural element (any footing/column/slab, seq≤4) overlaps their XY
  footprint at any elevation below them, anywhere in the whole 63,415-element building. Clinic: 59/633
  (9.3%). LTU_AHouse: **0/1592** — this is building-specific, not universal.
- **Drilled into WHY, for Hospital's 27:** for each, found the true nearest structural element by
  centroid distance — in all 6 sampled, the "nearest" structural candidate sits **6–22m ABOVE** the
  wall's own elevation (a different floor entirely), confirming these walls are genuinely isolated in Z,
  not a near-miss. Widening the check to ANY element class (not just seq≤4 structure) within 5m below:
  **20/27 have LITERALLY NOTHING beneath them at all** (any class) — a real geometric void in the
  extracted data, not a classification gap. The other **9/27 have another WALL directly beneath them**
  (e.g. an upper-level partition stacked on a lower wall) — `geoGate`'s structural candidate pool never
  includes walls as a support for another wall (only `wallGate` does, and only for promoted roof slabs)
  — a second, narrower, precisely-named gap.
- **This directly explains "hour 0" placement, measured:** Hospital's earliest-starting ground wall has
  `start === baseMs` exactly (literally hour 0). An element with zero structural gate is bounded only by
  its trade-gate (`tg`, same-storey lower-seq trades) and crew-slot availability — for the first crew
  claimed on an empty schedule, that's ≈0.
- **Same mechanism reproduces on the "trucks" candidate class.** `IfcBuildingElementProxy` (5,729
  elements in Hospital — the class the pre-existing `§XRAY_WALL_SCOPE` comment in `time_machine.js`
  already named against this EXACT user quote, "2 trucks came on first! Then walls!", when fixing a
  *different*, already-shipped wall-carrier-scope defect): **51/1,450 (3.5%) ground-level proxies have
  zero structural support**, and **3 of those start at exactly hour 0**. `IfcBuildingElementProxy` is
  the most likely real identity of "trucks" (generic/equipment-shaped modeled geometry, not staffage).
- **Same blind-spot shape as the already-documented `§MEP_HUNG_FROM_ABOVE` gap** (this file, above):
  `auditFloating()` reports these exact elements as 0 violations too, but only because its own check is
  VACUOUS when no candidate support exists at all — not lying, just never designed to catch "nothing to
  compare against." The existing 0/0-floating witnesses are correct and remain correct; they were never
  testing this case.
- **Explicitly distinct from `GANTT_ACCURACY.md`'s "1,735/81,722 elevation-vs-storey-label key
  contradiction"** (that file's `▶ RULING 2026-08-04`, problem 1) — that is a MISLABELED-RANK defect
  (storey label ranked above what it physically carries, while elevation itself agrees). This is a
  GENUINE ABSENCE of any XY-overlapping element in the geometry, at any label. Different mechanism, not
  a duplicate — naming the overlap per this session's brief, not merging the two investigations.

**Deliberately NOT fixed this session** — per this file's own accumulated rule (5 prior CPM-redesign
attempts rejected as over-engineered, `§4D_WALL_BORNE_STRUCTURE`/`§ELEMENT_CPM`/`§CPM_DUAL_ELEVATION`,
all "NOT FOR MERGE"). Two narrow, nameable candidate fixes for a future session, NOT scoped/started:
1. **The 9/27 wall-on-wall cases** — a real, narrow, additive gap: let a wall be a valid `geoGate`
   candidate support for another wall directly above it (Hospital/Clinic only; LTU_AHouse needs none).
   Same shape as the existing `wallGate`/`_ogWallGrid` pattern already used for promoted roof slabs —
   NOT a new mechanism, an extension of one that already exists. Needs re-running
   `witness_support_invariant_all_buildings.js`/`witness_wall_carrier_scope_all_copies.js` after, to
   confirm no inversions reappear (both prior sessions' hard-won invariants).
2. **The 20/27 true-void cases** — NOT an algorithm question, a DATA question: ⛔ BLOCKED — needs a
   user/data decision on whether "no footing modeled under this wall segment → unconstrained placement"
   is accepted as correct behavior for genuinely missing source data (real construction schedules DO
   place a wall on a slab-on-grade or grade beam not separately modeled as `IfcFooting`/`IfcPile` — this
   may be correct-for-the-data, not a defect), or whether it needs tracing back to the source IFC to
   confirm piling truly isn't modeled there. Not answerable from the extracted DB alone.

Diagnostic script used: throwaway node script against `~/bim-ootb/buildings/*_extracted.db`, NOT
committed (diagnosis-only, no production code touched, per this session's scope).

## §GEO_SUPPORT_LEAK — geoGate() misses real support that visibly exists, root-caused, NOT fixed (2026-08-04)

**What triggered this:** user-reported live, "2 trucks parked at hour 0" on Hospital, with a real ramp
visible beneath them in the viewer. First-pass diagnosis wrongly attributed this to Alt+P photoreal
staffage (a decorative, TM-independent car mesh) — **corrected by the user**: these are real IFC
elements, `IfcBuildingElementProxy` named "Semi Truck" (guids `2ddIK_HdvCoBT3_G2GF8Mn`/`...8Ms`),
verified directly against `elements_meta`/`element_transforms` in `Hospital_extracted.db`, not staffage
at all. **Lesson, stated plainly: check the IFC/DB directly before attributing a symptom to a feature
that only looked plausible — that first pass drifted.**

**Root cause, traced to real coordinates, not guessed:**
`geoGate()` (`viewer/schedule_gate.js:152-158`) tests `S.base_z < el.base_z - EPS` — a real structural
candidate `S` only counts as support if `S`'s own base sits below the element's own base. For the two
truck elements, a real ramp assembly genuinely exists in their XY footprint (`IfcSlab` "Concrete-200mm
slab on 300mm base", `IfcWallStandardCase` retaining walls, real footings below that — all confirmed via
direct SQL query against `element_transforms`/`elements_meta`, not inferred). But every one of those real
structural elements has `base_z` in the 164.0-164.5m range, while the trucks' own computed `base_z`
(`center_z - bbox_z/2`) is 163.21m — **below every real structural base in the footprint** — so
`geoGate()` finds nothing and the trucks schedule at `baseMs` (hour 0), same as if nothing were modeled
there at all.

**User's correction on how to read this, which reframed the finding:** do not trust the derived
`base_z = center_z - bbox_z/2` proxy over the real, visually-confirmed spatial relationship (a ramp IS
there, visibly, under the truck) — the LEAK is in `geoGate()`'s support-contact heuristic, not
necessarily in the truck's placement data. **This is the correct basis going forward: the engine must
reconcile against real spatial coordinates, not a symmetric-bbox approximation that can disagree with
what's actually modeled.**

**Also corrected: no name/class special-casing.** The engine is supposed to stay abstract to
discipline/phase/resource/`ifc_class` (as `SEQUENCE_RULES` already is) — a hardcoded "if name contains
Semi Truck" fix would violate that, so none was written.

**`witness_geo_support_leak.js`** (`bim-compiler/scratchpad/`, NOT committed to bim-ootb — detection
only, per instruction: "put a witness to fail without fall back," no auto-correction) — general,
zero name/class references beyond the engine's own existing `seq<=4`/`seq>4` structural split (not
invented here, already how `schedule_gate.js` classifies "structure"). For every element the shipped
`computeSchedule()` left ungated (`start===baseMs`), checks by pure XY-coordinate overlap whether any
real `seq<=4` structural element exists in its footprint at any Z. Exits non-zero if the signature is
found anywhere — a passing run means genuinely absent, not silently tolerated.

**Measured across all 6 fixtures — the signature is real but narrow, not systemic:**
```
Duplex   checked=1103  leaked=0
Clinic   checked=15161 leaked=0
JKR      checked=5     leaked=5
HHS      checked=4461  leaked=0
Hospital checked=5     leaked=5
Terminal checked=13367 leaked=0
```
10 leaked elements total out of 34,102 currently-ungated elements checked across every real building
fixture — genuine, reproducible, but rare. Hospital's 5 leaked elements span TWO different `ifc_class`
values (`IfcWallStandardCase` AND `IfcBuildingElementProxy`, not just the trucks) — confirming this is a
general geometric heuristic gap in `geoGate()`, not an item-specific defect, and not fixable by anything
keyed on name or class.

**NOT FIXED — deliberately.** The correct geometric contact-test (e.g. "does a real structure's TOP
surface fall within the element's own vertical span" vs. today's "is a structure's base below mine") is
a real design decision this session did not verify carefully enough to ship without risk of inventing an
unproven heuristic. Left open on purpose, per this project's own no-invent discipline — next session
should design and witness the replacement contact-test explicitly, checked against all 10 leaked
elements (and re-run against all 6 fixtures to confirm zero regression on the 34,092 correctly-gated
ones) before it ships.

### §GEO_SUPPORT_LEAK — FIXED same session, PR bim-ootb#1183 merged + live (2026-08-04)

Same-session follow-up, user directive: "SOLVE THEM TILL ZERO." `geoGate()` now also counts a
structural candidate as support when its entire vertical span is CONTAINED within the element's own
`[base_z,top_z]` (new clause, additive only — a match can only push a gate later, never earlier).
Zero name/class special-casing, pure `base_z`/`top_z` geometry.

**First witness attempt over-detected** — its "any XY-overlapping structure at any Z" criterion
flagged 3 JKR "Slab Edge" elements as leaked when their only overlapping structure (a real `IfcSlab`)
sits ABOVE them, flush, not below/contained (a formwork/edge-trim detail poured at-or-before its
slab, genuinely nothing real below it — same category as a footing on bare ground, not a defect).
Corrected before shipping: the witness now uses the IDENTICAL directional test as the fix itself.

**Measured, both directions:**
- Pre-fix (this same corrected witness against unmodified `main`): **7 real leaks** — 5 Hospital
  (both trucks + 2 more), 2 JKR. Confirms the earlier "10 leaked" number included 3 false positives
  from the looser v1 detector.
- Post-fix: **0/0 leaks across all 6 real building fixtures.**
- Authoritative `ScheduleGate.auditFloating` (the same invariant live `§SUPPORT_CHECK` reports) —
  **0 floating, all 6 buildings, both before and after** — confirms no regression, and separately
  confirms `auditFloating` shares the identical below-only blind spot as pre-fix `geoGate()` (it
  did NOT catch the trucks either) — worth naming for whoever next touches that function, not
  silently relied on as independent proof.
- Full existing engine suite (bar identity, edit coherence/constraints, row order, palette, duration
  sync, gap1, ops blackbox, TM close-restore, BOQ4D) — **167/167 unchanged.**

`witness_geo_support_leak.js` committed to bim-ootb root. `sw.js` v945→v946. Not yet exercised live
in a browser — same open item as every fix this session.

## ▶ PRELIM NOTE 2026-08-04 — §CLASS_UNMATCHED_FALLBACK, a SEPARATE gap from the trucks above, NOT yet handed to a dev session

**Not the same bug as §GEO_SUPPORT_LEAK above — flagging the distinction explicitly, because the
first report of this ("2 IFC trucks leaked thru and claimed wrongly their type") got conflated with
the trucks-at-hour-0 finding above during triage.** The trucks are correctly classified
(`IfcBuildingElementProxy` → Architecture, its own explicit `SEQUENCE_RULES` entry, `resource:null`
by deliberate design) — their bug was a geometric support-detection heuristic (`geoGate()`), now
fixed. This section is about a genuinely different mechanism: `matchRule`'s silent fallback for
classes that match **no** `SEQUENCE_RULES` key at all, in bim-ootb.

**What was built, general-purpose per the original ask** ("a black box output log ... so u can
read it when testing", hardened to "fail no fall back any nuance") — not a synthetic-fixture
regression test like `witness_gantt_ops_blackbox.js`, but a real-data audit:
`viewer/tests/witness_class_fallback_blackbox.js`, bim-ootb PR **#1185** (pushed, branch
`chore/blackbox-harden`, **not merged, not yet run by the session doing 4D polish**). Runs the REAL
`matchRule` (required from `schedule_author.js`, sliced by balanced braces from both independent
`time_machine.js` closures — never reimplemented) against REAL `elements_meta` across Hospital,
Terminal, LTU_AHouse, Duplex (239,469 elements total).

**Result:**
```
FAIL G-A hits=3
  Hospital: IfcDistributionControlElement (861 elements) -> silently Architecture/seq6/no-resource
  Hospital: IfcSwitchingDevice (113 elements)             -> same
  Duplex:   IfcSpace (21 elements)                        -> same, residential too, not Hospital-only
```
G-B/C/D pass — the three `matchRule` copies agree with each other everywhere they DO match, and
every element in all four buildings is accounted for by the audit (no silent exclusion). Correctly
does NOT flag `IfcBuildingElementProxy` (the trucks' own class) — verified via an independent
`hasExplicitRule()` check that a class with a real, deliberate rule (even one with
`resource:null` by design) is never confused with a class matching nothing.

**Not fixed — diagnostic only, same discipline as §GEO_SUPPORT_LEAK above.** Two follow-ups for
whoever picks this up: (1) route unmatched classes to a loud `§CLASS_UNMATCHED` log or the existing
`§Z_STACK_XRAY_STAGING` reveal path instead of the silent default, in all three `matchRule` copies;
(2) re-run PR #1185's witness after — G-A should flip to 0.

**Hand-off note, stated once so it doesn't need re-litigating:** nothing in this repo auto-runs a
witness — the discipline has always been "the session working on X runs X's witness," never a
background process. This witness lives on an unmerged branch a different session wrote; the session
doing 4D/Gantt polish has no way to know it exists unless told directly. Same for any future
diagnostic built this way — a prelim note here is the hand-off mechanism, not a substitute for it.

### §CLASS_UNMATCHED_FALLBACK — ✅ FIXED same-day, bim-ootb PR #1186 (2026-08-04/05, auto-merge armed)

Both follow-ups closed, headless only (live browser explicitly left to the user this session):
- `IfcDistributionControlElement` (861, Hospital) → explicit rule, mirrors its already-classified
  IFC4 siblings `IfcController`/`IfcAlarm` (MEP Final/ELECTRICIAN) — real schema fact, not guessed.
- `IfcSwitchingDevice` (113, Hospital) → explicit rule, mirrors its IFC4 parent `IfcFlowController`
  (MEP Rough-in/ELECTRICIAN).
- `IfcSpace` (21, Duplex) → spatial zone, not physical work — same treatment as `IfcOpeningElement`:
  an explicit rule entry (so `hasExplicitRule` sees it as deliberate, not silent) **plus** exclusion
  from the same 4 schedule-building queries that already excluded `IfcOpeningElement`
  (`schedule_author.js` `_buildScheduleElements`, `time_machine.js` ×3 — the xray build, the live
  `injectGantt` element query, and the coverage-ratio denominator).
- Added a loud `§CLASS_UNMATCHED` `console.warn` at the fallback point in all 3 `matchRule` copies —
  defense in depth for a genuinely-unknown class on a future IFC set, so it logs instead of vanishing.

`witness_class_fallback_blackbox.js`: G-A hits 3→0, G-B/C/D unchanged. Regression, all headless:
bar_identity 6/6, palette 7/7, row_order 9/9, coherence 7/7, constraints 18/18, zone_cpm 11/11,
zone_cpm_duplex 9/9, tm_duration_sync 8/8, support_invariant_all 18/18, gap1 7/7,
boq_charts_real_schedule 91/91 — 190/190 total, zero regressions.

**NOT touched, a separate real gap found while reading the code, not fixed under this ticket's
scope (stay-on-topic discipline):** `materializeDefault` (`schedule_author.js:404`, the "blank mode"
coarse authoring path, still live-called from `schedule_author_ui.js` + `schedule_diff.js`) reads
`elements_meta` with **zero** class exclusion at all (`:450`) — not even `IfcOpeningElement`, despite
the `_buildScheduleElements`/`materializeZones` path (the one this fix touched) already excluding
both `IfcOpeningElement` and now `IfcSpace`. Whoever picks up `materializeDefault` next should add
the identical `AND ifc_class != 'IfcOpeningElement' AND ifc_class != 'IfcSpace'` filter there — named
here so it isn't lost, not fixed here so this PR stays scoped to the one finding it was asked to close.

## §GENERATE_4D_HANG — root-caused and removed, not just hidden (2026-08-05)

User correction, stated directly: *"Hiding the Generate 4D schedule which hangs is not following my
request to get it removed — we be doing it natively in the gantt chart panel."* A prior session had
removed the ✎ toolbar icon that opened `ScheduleAuthorUI`'s side panel, but then had to add a NEW
drawer button (`tm-gantt-authorbtn`, "Generate 4D schedule") because removing the icon left no way to
author a schedule at all — and that new button just called `window.ScheduleAuthorUI.toggle()`,
**reopening the exact same old panel**. Not a removal, a relabeled redirect — the user was right to
reject it. Two real, separate problems were tangled together here and both are now closed.

### Problem 1 — the hang itself, measured not guessed, bim-ootb PR #1193

`4D_SCHEDULE_PERFECTION.md`'s own §Open Decisions (above) had already named the suspect
(`§PHASE_OVERLAP_SUPPORT_GUARD`'s `_ogStructGrid`/`_ogWallGrid` cell-bucket pass) but explicitly
flagged it "NOT yet measured." Measured first, before touching anything — a Node script sliced the
real block out of `time_machine.js` by raw text span (brace-balance checked) and ran it against real
extracted geometry from every real fixture:

```
Hospital (63,415 elements):  1695ms
LTU_AHouse (122,330 elements): 2175ms
Terminal (48,428 elements):  4636ms   <- fewer elements than the other two, slowest by far
```

Element count doesn't predict the cost — Terminal is 22 stacked storeys over a small footprint.
**Root cause: the spatial grid bucketed candidates by XY only, with zero Z-filtering.** Every floor's
structural elements piled into the SAME xy cell (Terminal's worst cell: 379 members), so a query for
one element had to linear-scan almost every OTHER floor's structure before the existing
`S.bz<T.bz-EPS && |S.tz-T.bz|<=GAP` check inside the loop finally rejected them. Hospital's bigger,
less-stacked footprint spreads elements across far more cells (831 vs Terminal's 234), so it never
hit this.

**Fix:** bucket by (x,y,z), not (x,y). Candidates register under their own real vertical extent at
build time; a query only scans cells in the TARGET's own real z-neighborhood `[bz-GAP, bz+GAP]` — the
only range the existing predicate can ever match. The inner predicate is byte-identical; only which
cells get scanned changed. Measured after: Terminal 4636ms → ~2900ms (1.6x). **Stated honestly, not
oversold: this is not a full elimination.** 2.9s is still a real synchronous block on a large
building; a numeric packed cell key (instead of string concatenation) or yielding the whole `_cap`
overlay pass to the browser between phases would very likely close more of the remaining gap, and is
named here as a real follow-up, not claimed as done.

`witness_gantt_og_grid_perf.js` (new): an independently-written O(n²) brute-force reference (same
predicate, same in-place-mutate-as-you-go cascade the real algorithm depends on, zero grid) on Duplex
— 0/1122 mismatches against the real grid-based code, proving the Z-band pruning drops nothing real.
Plus a performance ceiling on Terminal (<3500ms) so a future change can't silently reintroduce the
XY-only blowup. Full regression clean (12 existing witness files, unchanged pass counts).

### Problem 2 — the entry point, now genuinely native, bim-ootb PR #1194

`generateGanttSchedule()` (new, `time_machine.js`) replaces the `ScheduleAuthorUI.toggle()` delegation
entirely. It calls `ScheduleAuthor.materializeZones()` directly — the SAME real engine verb
`schedule_author_ui.js`'s own `generateDraft()` zone-detail path already uses, not a reimplementation,
not a second scheduler — falling back to `materializeDefault()` only if zones are genuinely
unavailable, matching the panel's own fallback exactly.

**One case deliberately still opens the old panel — not a loophole, a correctness requirement:** a
real imported (Bonsai/Revit/IFC-native) schedule already active. `generateDraft()` already guards this
(`if (act.captured) {...}` — never regenerate over a real import) and a native path skipping that
guard would silently create a competing `SCH_AUTHORED` schedule alongside the real one (`_cap` reads
ALL schedule_ids, so two would double-count — the exact bug the panel's own guard comment already
named). The native path replicates the identical guard via `ScheduleAuthor.activeSchedule(db)` before
ever calling `materializeZones`. This is now the ONE legitimate remaining reason the old panel is
reachable at all — not a general re-opening of it, and worth remembering if a future session is
tempted to delete `schedule_author_ui.js` outright: the captured-schedule editing case still needs a
home, and this button is currently it.

`witness_gantt_native_generate.js` (new, sliced from the real function by balanced braces): Scenario A
(no schedule yet) proves native generate creates real tasks and the old panel is NEVER opened.
Scenario B (a real captured schedule, seeded via the SAME real `materializeZones` call under a
different `scheduleId` — not hand-crafted rows) proves no synthetic schedule gets created, the old
panel opens exactly once, and the real imported schedule is provably untouched (exact task-count
match). 5/5 on Duplex and Terminal. Full regression clean.

**Also caught and fixed, both PRs:** `sw.js` `CACHE_VERSION` was NOT bumped for either change at
first pass — despite this exact mistake already happening 3 times earlier in the same session (see
`feedback_bimootb_sw_cache_bump_on_viewer_change.md`, updated with this recurrence). Both PRs now
carry the bump in the same diff (v948→v949 for #1193, v949→v950 for #1194). **A real, separate
landmine hit shipping #1194: `main` had already advanced past #1193 by the time #1194 was pushed
(squash-merge changes the commit hash — CLAUDE.md's own documented landmine), so `gh pr merge --auto`
reported `CONFLICTING`.** Fixed correctly per that doc's own guidance — `git fetch && git merge
origin/main` (not a rebase, not a fresh redo), one trivial conflict in `sw.js`'s version line,
resolved to the higher number, full regression re-run clean post-merge before pushing.

### §GANTT_EDITABLE_E2E — verified by code inspection, not claimed via a live run (2026-08-05)

User's third ask: confirm the drawer is genuinely end-to-end editable, and decide whether an explicit
"edit mode" toggle is needed. Traced, not run live (this session's standing directive: live browser
testing is the user's job, not this session's):

- `generateGanttSchedule()` → `window.tmRefoldSchedule()` → `deactivate()`/`activate()` →
  `_activateAsync()` → `injectGantt()`. `_cap` (`time_machine.js:3523`, the overlay that binds real
  `task_id`s onto elements) is a fresh IIFE re-evaluated on EVERY `injectGantt()` call, reading
  `tasks`/`task_elements` live off the DB — so it correctly picks up a schedule materialized moments
  earlier. This is the EXACT SAME reactivation path `applyTo4D()` already used, and that path was
  already browser-proven earlier this session (§BROWSER_PROOF above, PR #1173, commits
  9799f24/6a5073f/9902f6d fixed "authoring after opening the drawer never took effect"). The native
  generate button reuses already-proven machinery rather than inventing new glue that could carry the
  same class of bug.
- `buildTaskIndex()`/`invalidateGanttModel()` (drawer's own bar→task_id cache, separate from `_cap`)
  is correctly invalidated on every path that can change the schedule — confirmed by inspection, not
  re-derived from scratch (this exact caching bug was ALSO already found and fixed this session,
  same PR #1173).
- **Conclusion: yes, genuinely editable end-to-end, by construction** — K0's bar-identity binding
  (100% resolve, all 7 fixtures, `witness_gantt_bar_identity.js`) + this session's native generate
  entry point + the already-proven reactivation path together give a real, unbroken chain from
  "open Time Machine on a fresh building" to "drag a bar." The one remaining unverified link named
  earlier (§BROWSER_PROOF "STILL OPEN — the drag link not closed") — a synthetic pointer test that
  never confirmed a `§GANTT_DRAG_COMMIT` fired with a MEASURED bar position — is real and still open,
  but is a live-browser-only verification, correctly left to the user per this session's directive,
  not chased further here.
- **"Special edit mode ON" toggle — recommend AGAINST building one.** This file's own §E section
  commits explicitly to "MS Project convention; do not invent a new idiom." Neither MSP nor P6 gate
  editing behind a modal lock — bars are always directly draggable, and the safety net is
  clamp/cascade (C1/C2, already shipped) plus now single-level Undo (§GANTT_EDIT_UNDO, PR #1188,
  shipped this session). Adding a toggle would invent a UI idiom this codebase has already deliberately
  avoided, to solve a risk (accidental drag) the existing mechanisms already cover. Not built.

### Handoff, not chased further this session (concurrent-session finding)

A concurrent CPE/cinema session found a real, separate bug in this file while working on their own
POV-scrub feature, and asked for it to be recorded here since `time_machine.js` is owned by whichever
session is doing 4D work — **not yet independently verified by this session, recorded as reported:**
Time Machine's buildup visibility gate (`time_machine.js:1443`, `_dlodInView`) hides "placed" elements
outside the MAIN camera's frustum only — `_dlodCamPos = app.camera.position`, hardcoded. When a user
scrubs with the CPE POV panel open (that session's own new §CPE_SCRUB_VF_LIVE feature), the main
camera stays parked while `vfCam` (the POV inset camera) moves independently — so the POV can show
construction state gated by the WRONG camera's frustum. Whoever picks this up next: confirm the exact
mechanism first (read the line, don't assume), then decide whether `_dlodCamPos` should switch to the
active POV camera when one is open, or whether the DLOD gate needs to consider both cameras' frustums.

## Session close-out, 2026-08-05

Five bim-ootb PRs this session on top of the four from earlier the same day (#1186–#1190): #1193
(hang root-caused + fixed, measured), #1194 (native generate, old panel de-fanged to one legitimate
fallback case). All auto-merge armed/merged, all witnessed, all regression-clean. `materializeDefault`'s
missing exclusion filter (named above) and the concurrent session's `_dlodInView` finding (above) are
the two open items for the next session — both are named with enough detail to start from directly,
neither needs rediscovery.

## §GANTT_EDIT_LOCK — Generate button's last old-panel path removed, edit lock toggle added (2026-08-05)

User, live-testing #1194's native generate button, caught the remaining hole directly: *"remove 4D
generate button as it calls old panel up. We prefer to edit right in the gantt chart itself."* #1194
had already made the common case native (`materializeZones`/`materializeDefault` called directly), but
kept ONE deliberate fallback — a captured/imported schedule still reopened `ScheduleAuthorUI`. That was
the exact path the user hit. Two decisions taken together, not separately:

1. **Drop the fallback, not just the button.** A captured schedule is now left exactly as imported
   (never regenerated — the non-clobber guard stays) and edited through the SAME drawer surface as any
   other schedule, once its bars carry real `task_id`s via the normal cap/`injectGantt` load path. No
   button, no panel, reachable from `time_machine.js` any more at all.
2. **Auto-materialize, not button-triggered.** `drawGanttMini()` now calls `generateGanttSchedule()`
   itself the first time the drawer has zero editable bars (one attempt per `activate()`, tracked by
   `_ganttAutoGenAttempted` so a genuine materialize failure doesn't retry every redraw) — no click
   required, matching "edit right in the gantt chart itself."

**New question this opened, resolved same session:** with the button gone, what stops an accidental
drag? User: *"perhaps need an edit toggle? Where it is ON, u can edit, and when off, it is committed to
the JSON."* This **reverses** this file's own earlier recommendation (§GANTT_EDITABLE_E2E above,
2026-08-05 same day, pre-dating this section: "recommend AGAINST building [a toggle]... MSP/P6
convention has none") — noted, not silently overwritten: the earlier reasoning no longer applies once
the safety net it was weighing (Undo) has to cover a DEFAULT-ON always-armed drawer instead of an
opt-in one behind a button. User's own follow-ups narrowed the design before any code was written:
- **Scope**: "edit means whatifs dragging, CPM linking, bar length change, and drag to new date/time
  spot" — i.e. gate exactly E1/E2 (move/resize) + E3 (drag-to-link) + E7 (typed props/unlink), nothing
  else.
- **Persistence model**: asked directly (draft-then-commit vs immediate-write-plus-lock) rather than
  assumed — user picked **immediate write, toggle=lock only**. Every accepted edit still writes
  straight to `tasks`/`kernel_ops` the instant it commits, exactly as it did before this toggle existed
  (§GANTT_EDIT_UNDO's single-level undo already covers that immediate write). "Committed to the JSON"
  in the user's phrasing describes that existing immediate-write behavior, not a new draft layer — no
  second persistence path was built.
- **Canvas liveness**: asked whether locking should freeze the timeline view too — user: "if canvas is
  runtime responsive, it gives the user feedback which is desirable." Scrub/seek/render are untouched
  regardless of lock state; only the edit-INITIATING handlers are gated.

**Implementation** (`time_machine.js`, bim-ootb PR #1198 landing branch `feat/gantt-edit-foundation`
onto `main` — this branch had drifted since #1173's squash-merge, see below): `_ganttEditable` (default
`false`, i.e. locked) gates a single point of entry — `wireGanttDrag`'s `pointerdown` handler. Gating
there alone covers move/resize AND drag-to-link, because `endDrag`'s link/commit logic can never run
without a live `_drag` object that pointerdown is what sets. The E7 double-click → `openGanttProps` is
gated separately (doesn't depend on `_drag`). `tm-gantt-noauthor`/`tm-gantt-authorbtn` UI removed
outright, replaced by a `🔒 Locked` / `🔓 Editing` toggle button in the same header slot.

`witness_gantt_edit_lock.js` (new, slices the real `wireGanttDrag` by balanced braces, never
reimplements the gate): locked blocks drag-start and props-open, unlocked allows both, plus a RED
CONTROL proving a bar with no `task_id` is rejected on a DIFFERENT, unrelated guard regardless of lock
state (so the two guards can't be confused with each other) — 5/5. `witness_gantt_native_generate.js`
Scenario B updated for the new no-old-panel behavior (was asserting the OLD spec: "the old panel WAS
opened exactly once" — now asserts it never is) — 5/5. Full regression re-run clean: bar_identity 6/6,
edit_coherence 7/7, edit_constraints 18/18, row_order 9/9, palette 7/7, edit_undo 9/9, baseline 11/11,
og_grid_perf 3/3, class_fallback_blackbox 8/8. One pre-existing `witness_gantt_ops_blackbox.js` fail
(a `BUILDING_OPEN` pseudo-op leaking into `materializeZones`' op stream, `_UNKNOWN` storey) confirmed
present on `origin/main` BEFORE this change too via `git stash` — not a regression, not fixed here,
named as a real small open item for whoever next touches `materializeZones`' op bookkeeping.

**Separate landmine hit picking this branch up, not caused by this session's own edits:** `/tmp/wt-
gantt-edit` (branch `feat/gantt-edit-foundation`) was 7 commits behind its own `origin` and, after
syncing that, turned out to be 18 commits behind `origin/main` too — PRs #1171/#1173 (this branch's own
"the editable 4D surface" work) had squash-merged into `main` back on 2026-08-04, but a LATER PR on
this same branch (#1175, §GANTT_AXIS_OUTLIER — the near-empty-drawer fix) was based ON the pre-squash
branch and never itself reached `main`. So `main` had the editing foundation but NOT the axis-outlier
fix — a real, live gap, not hypothetical. `git merge origin/main` into the branch (per this project's
own documented squash-merge doctrine — merge, don't redo) produced exactly 2 conflicts: `sw.js`
(CACHE_VERSION — took the higher number, v951) and `time_machine.js` (the drawer's authoring-entry
button — took `origin/main`'s already-native #1194 version over this branch's older
`ScheduleAuthorUI.toggle()` call, which is what #1194 itself had already fixed). PR #1198 carries BOTH
the recovered axis-outlier fix and this session's own lock-toggle work onto `main` in one go, since they
were sitting on the same stale branch together.

### Follow-on landmine hit shipping the next two fixes, recovered correctly (2026-08-05, same session)

After #1198 landed, this session kept working on the SAME `feat/gantt-edit-foundation` branch — pushed
`materializeDefault`'s exclusion filter (task #1 above) and §DLOD_VF_CAMGUARD (below) as two more
commits to it, on the assumption the branch's PR would keep tracking new pushes. **It did not**:
`gh pr merge 1198 --auto --squash` had already fired on an earlier green head (fast-checks passed at
19:59:38, e2e at 20:00:46, `mergedAt`=20:00:49) — both follow-up commits landed on the branch AFTER
that timestamp, so they were never part of the squash. Caught BEFORE reporting done, not after: this
session's own `feedback_verify_pr_merge_before_followup_push` memory says verify before assuming a
push into an already-armed PR reached `main` — `git merge-base --is-ancestor <sha> origin/main` on both
orphaned commits confirmed `NO`. Recovered exactly per this file's own documented procedure (CLAUDE.md
Concurrent Branches note): fresh branch off current `origin/main` (`fix/gantt-post-1198-followup`, same
worktree, clean cherry-pick, zero conflicts), full witness re-run against the REAL post-#1198 `main`,
new PR #1199 (auto-merge armed) — not a re-push to the stale branch, not a redo of the work itself.
**Lesson for next session:** once a PR's auto-merge is armed, treat that branch as closing — start the
NEXT fix on a fresh branch off `origin/main` from the start, don't keep stacking commits onto a branch
whose PR may merge out from under you at any moment.

### §GANTT_MATDEFAULT_EXCLUSION — closed (bim-ootb PR #1199)

The `materializeDefault` gap named above (`schedule_author.js:404`, no class exclusion at all) is
fixed: same `ifc_class != 'IfcOpeningElement' AND ifc_class != 'IfcSpace'` filter as the already-fixed
`_buildScheduleElements`/`materializeZones` path. `witness_materialize_default_exclusion.js` (new):
real `Duplex_extracted.db` fixture (50 real `IfcOpeningElement` + 21 real `IfcSpace` rows — RED CONTROL
confirms the fixture actually exercises the fix), zero excluded-class guids assigned a task, assignment
count matches `elements_meta` minus both classes exactly. 4/4.

### §DLOD_VF_CAMGUARD — closed (bim-ootb PR #1199)

The concurrent-session finding handed off above (and independently root-caused the same way in
`CINEMA_PATH_EDITOR.md`'s own SESSION HANDOFF) is fixed. `renderAtTime()`'s buildup-visibility gate
(`_dlodInView`, via `bHideForProxy`/`hideForProxy`/`iHideForProxy`) read `_dlodCamPos`, hardcoded to
`app.camera.position` — the MAIN camera — even while CPE's POV panel scrubs its own `vfCam`
independently once main stays parked. Extracted the camera choice into its own pure function,
`_dlodResolveCamera(app)`, and added one minimal read-only accessor on CPE's own exposed API —
`window.APP.cinemaPathEditor.activePOVCamera()` — returning the live `vfCam` only while the viewfinder
is genuinely on, else `null`. `time_machine.js` never reaches into CPE's internal `_state` directly;
it only reads this one accessor, so CPE's own module boundary stays intact. Falls back to the main
camera in every other case (viewfinder off, CPE not loaded, no `cinemaPathEditor` exposed) — zero
behavioural change off this one new opt-in branch.

`witness_dlod_vf_camguard.js` (new): slices the real `_dlodResolveCamera` by balanced braces, proves
all 3 fallback cases return the main camera, the viewfinder-on case returns the POV camera, plus a RED
CONTROL proving the branch is actually live (not vacuously always the main camera regardless of
input). 5/5. This closes BOTH of the two open items this file named at its previous session close-out
— nothing left unrecovered from that handoff.

## Gantt drawer UX batch (2026-08-05, same session) — user-driven, aesthetics-first discussion before code

User gave a screenshot (props panel overlapping the storey labels/ruler, no room to grow) and asked for
an aesthetics/practicality/competitive-advantage DISCUSSION before any code — three concrete PRs came
out of that discussion, each user-confirmed before implementation, plus one design thread deliberately
left as discussion (§LINK_UX below) and two real gaps found and reported, not invented fixes for.

**§TM_PANEL_RESIZE (bim-ootb PR #1201)** — the drawer had a resize grip for the internal Gantt box's
HEIGHT only; the whole drawer's WIDTH was hardcoded 376px, which is what the screenshot's overlap
actually was. New `tm-panel-resize-grip` on the drawer's right edge — `_panel` is horizontally centered
(`left:50%`/`translateX(-50%)`), so one edge handle grows the box symmetrically (2x drag-distance math,
tested). Also auto-expands to 560px the instant Editing toggles on (only if narrower already), restores
the exact pre-edit width on lock — user's own follow-up ask ("make the borders auto expand when Edit is
ON"). `witness_tm_panel_resize.js` 5/5.

**§TM_RULER_SHIFT (PR #1202)** — user's own definition, given directly: "dragging the day ruler adjusts
the whole project's start/finish... defaulted to today if the JSON is silent... when edited it is
updated along with any other edit." New `ScheduleAuthor.shiftSchedule(db, scheduleId, deltaDays)`:
translates EVERY task (leaf + summary) by a constant number of days — no C1/C2 constraint checking
needed, a uniform shift preserves every relative task position by construction. The previously
non-interactive day ruler is now draggable, gated behind the same Editing lock as everything else (this
is the biggest possible edit, not a reason to exempt it), reuses the EXISTING single-level Undo
unchanged. Also fixed `generateGanttSchedule()`'s hardcoded `'2026-01-01'` default to the real current
date. `witness_shift_schedule.js` 8/8, `witness_gantt_ruler_shift_lock.js` 4/4.

**§GANTT_GROUP_MOVE (PR #1204)** — user's own resolution of an MS-Word-style marquee-select question:
"move is clear... thus the MS Word is for that only" (i.e. NOT for link — see §LINK_UX below). New
`ScheduleAuthor.shiftTasks(db, taskIds, deltaDays)` (shares `_shiftRows` with `shiftSchedule`), scoped
to an explicit task_id list. Dragging from empty canvas space starts a marquee (MS-Word convention),
dragging any SELECTED bar moves the whole group together, dragging an unselected bar clears the group
and falls back to a normal single drag, click-away (near-zero marquee) clears the selection — same
gesture starts a new one and dissolves the old, no separate "ungroup" verb. Selection is EPHEMERAL UI
state, explicitly never persisted (user confirmed this framing directly — "group" is not a saved
concept, only the resulting date change from an actual drag is a real edit). `witness_shift_tasks.js`
7/7, `witness_gantt_bars_in_rect.js` 5/5, `witness_gantt_group_move.js` 9/9.

**§LINK_UX — discussion only, no code changed.** User asked whether long-press should replace the
existing drag-bar-onto-bar link gesture, and whether a separate long-press should unlink. Recommended
against both: the existing gesture already has a 14px-vertical-travel guard against accidental
triggering, and unlink already has a deliberate, low-risk mechanism (the props panel's per-edge unlink
button) that a canvas long-press would only duplicate with MORE misfire risk on touch. Long-press's one
real use is disambiguating "start a marquee that begins ON a bar" from "move that bar" — user has not
yet confirmed building that refinement; the base marquee (start-from-empty-space only) is what shipped.
**User separately flagged the linking-via-props-panel flow itself as "a bit tedious and unfriendly to
long tail DIY lay people"** and wants a way to confirm a link WITHOUT opening the panel — real, unshipped
follow-on, next session should explore an inline confirmation (e.g. a toast/tooltip at the join point)
rather than the panel.

**§HISTORY_DOT_AUDIT — question answered by reading the code, not guessed.** User asked "is each Gantt
edit counted as a [world-]history dot?" `common/history_tap.js`'s `sniff(true)` wraps `console.log`
globally and captures every `§`-tagged line UNLESS its tag is in `DENY_TAG` or its label matches
`NOISE_LABEL` (`universal_history.js` `_drainTap`, the bar's read-only subscription to that stream).
**Answer: yes, automatically** — none of this session's Gantt commit tags (`§GANTT_DRAG_COMMIT`,
`§TM_RULER_SHIFT_COMMIT`, `§GANTT_GROUP_SHIFT_COMMIT`, `§GANTT_EDIT_LINK/UNLINK`, `§GANTT_PROPS_APPLY`,
`§GANTT_EDIT_UNDO`, `§SE_SHIFT`/`§SE_GROUP_SHIFT`, `§GANTT_GROUP_SELECT`) are denied or noise-filtered,
so every one mints a dot with ZERO extra wiring — this is the "coverage falls out the moment a feature
logs §" design `_drainTap`'s own comment describes. Caveat, also real: this only happens while the
History knob/recording is actually active (`HB.isEnabled()`) — not an always-on background capture.

**§SCHEDULE_JSON_PERSIST — real gap found, NOT built, do not assume it exists.** User referenced this as
"granted" (i.e. already agreed) — grepped the codebase to confirm before touching anything and found NO
such mechanism: `schedule_editor_ui.js` exports MSProject/PMXML/XER only, nothing JSON, no
export-on-lock hook anywhere. Whatever "the JSON, source of truth, exportable and reapplying when
imported" was agreed to be is not yet implemented. Next session picking this up needs the schema defined
first (does it reuse the `captured`-schedule import shape already in `schedule_author.js`'s
`activeSchedule()`, or is it new?) before writing any code — do not invent a shape.

## 2026-08-05 — §TM_PANEL_RESIZE_H (bottom-edge drag) + §GANTT_PALETTE staleness finding

User looked at a screenshot after the #1201/#1202/#1204 batch and asked for two things: (1) the drawer's
lower border pullable too, not just the right one, (2) per-discipline bar colouring, dark fills with
reversed-contrast labels.

**(1) Built — PR #1208, `feat/gantt-panel-bottom-resize`, auto-merge armed.** New
`#tm-panel-resize-grip-b` mirrors the existing right-edge width grip (`tm-panel-resize-grip`,
§TM_PANEL_RESIZE #1201): same pointer-capture pattern, `wirePanelResizeHeight()`, clamped 160px–85vh,
logs `§TM_PANEL_RESIZE_H height=...px`. Verified with `witness_tm_panel_resize_h.js` (12/12,
static-source check same convention as `witness_gantt_palette.js`) — confirms the grip exists, is
`ns-resize`, and critically that its grow-direction sign is the OPPOSITE of the internal top-strip
`wireGanttResize()` grip (that one sits above its content, `startY - e.clientY`; this one sits below,
so it must be `e.clientY - startY` or dragging down would shrink instead of grow — checked explicitly,
not assumed).

**(2) NOT built — because it's already done.** `PHASE_COLORS`/`PHASE_INK`/`PHASE_SHORT`
(`viewer/time_machine.js`, §GANTT_PALETTE, PR #1171, merged 2026-08-04) already give each of the six
phases a dark/light family colour with adaptive reversed-contrast ink — exactly this ask. The
screenshot's "MEP"/"Sup" bar labels are the fingerprint of the OLD pre-#1171 `phase.substring(0,3)`
fallback (confirmed: no phase string in `rates.js`/`schedule_author.js` is short enough to produce
"Sup" any other way — `substring(0,3)` of "Superstructure" is exactly "Sup"). Since #1201/#1202/#1204
(merged AFTER #1171, same day) tested fine per this same screenshot round, whatever build was open in
that tab was serving a stale cached `time_machine.js` for that one asset specifically — known landmine
class, see `sw.js`/cache-version feedback. **Action for next session if this comes up again: hard
refresh / confirm SW cache version, don't rebuild the palette — it already exists and is correct.**

Local `~/bim-ootb` checkout note: found main 5 commits stale (missing #1171/#1201/#1202/#1204) AND
carrying ~5000 lines of unrelated staged-but-uncommitted WIP (`schedule_diff.js`, `schedule_read_4d.js`,
a 766-line `time_machine.js` diff, several `witness_gantt_*.js` files, none of it this session's).
Left it completely untouched per the shared-tree caution in `CLAUDE.md` — did all work in a fresh
`git worktree add ... origin/main` instead (`/tmp/wt-gantt-bottom-resize`, safe to prune once #1208
merges and CI settles).

## 2026-08-06 — §GANTT_REFOLD_HANG — diagnosed + LIVE-confirmed, NOT fixed here (handoff, not this session's to implement)

User reported "Time Machine causes hanging... during schedule refreshing." Diagnosed fully in this
bim-compiler session; per `feedback_diagnose_in_session_fix_in_other_session.md` (cross-repo, and this
exact file already has ~5000 uncommitted lines of another session's WIP sitting in the local `~/bim-ootb`
checkout — see the entry directly above), **implementation was deliberately NOT done here.** This section
is the complete handoff a bim-ootb-side session needs to pick it up with zero rediscovery.

**Root cause — two synchronous, unyielding loops inside `injectGantt()` (`viewer/time_machine.js:3561-4278`),**
called by `refoldSchedule()`/`window.tmRefoldSchedule` (schedule refresh after an edit — line ~6670) and
`window.tmGenerateTimeline` (line ~7303):

1. **§OG_GRID_Z_BAND** (line 4218-4249) — already partially fixed 2026-08-05 (bim-ootb PR #1193, Terminal
   4636ms→~2900ms via XY→XYZ grid bucketing), but still fully synchronous. That PR's own commit message
   named the remaining fix and never did it: *"yielding to the browser between phases."*
2. **§WRITE_LOOP_TIMING** (line 4253-4264) — a per-element `_upd.run(...)` prepared-statement write over
   `_allScheduled`, explicitly flagged in its own in-code comment as an unfixed freeze cause on a
   63,415-element building (Hospital): *"a user report of the browser tab freezing traced to console
   output stopping right at this point... No fix here — just precise measurement."*

Both loops are strictly ORDER-DEPENDENT (each element's result can read an earlier element's just-mutated
`.s`/`.e`/`.end_ts` via shared object references in `_ogStructGrid`/`_ogWallGrid`) — cannot be parallelized
or reordered, but CAN be chunked with yields between batches (e.g. `setTimeout`/`requestAnimationFrame`
between N-sized slices) without changing output, since chunking preserves order.

**LIVE CONFIRMATION (2026-08-06, real console paste from the user, Hospital 63,415 elements, NOT
guessed):** the console stream stops dead immediately after
`§PHASE_OVERLAP_SUPPORT_GUARD pushed=1108/63415 elements later than their §PHASE_OVERLAP_BAND window...`
(the last log line of block 1 above, line 4250) — the very next code is block 2's write loop, whose own
completion log (`§WRITE_LOOP_TIMING rows=... ms=...`, line 4264) **never appears.** This pins the live hang
to the WRITE LOOP specifically, not the grid-scan (which completed and logged its result). Matches the
building (Hospital) and symptom named in the write-loop's own prior in-code comment exactly.

**Caller chain that needs to go async-aware once `injectGantt()` is chunked/promise-returning:**
- `_activateAsync()` line ~6450: `if (!injectGantt()) {...}` (inside a `.then()`, already promise-friendly)
- `_activateAsync()` line ~6471: `if (!_ops.length) { injectGantt(); _ops = loadOps(); ... }` (catch-path fallback)
- `window.tmGenerateTimeline = function() { return injectGantt(); };` (line ~7303, external API — check
  what actually calls this before changing its return type)

**Proposed fix (not yet built):** convert `injectGantt()`'s two hot loops to chunked execution yielding to
the browser between batches (size TBD by measurement, start with ~2000-5000 elements/tick); make
`injectGantt()` return a Promise; update the 3 call sites above accordingly; add a witness confirming (a)
byte-identical output to the current synchronous version on a real fixture (reuse
`witness_gantt_og_grid_perf.js`'s brace-balance-sliced-block technique) and (b) that yields actually happen
(count ticks, or measure that no single synchronous span exceeds a threshold, e.g. 200ms) — a wall-clock
ceiling alone (like `witness_gantt_og_grid_perf.js`'s existing 3500ms gate) does NOT prove non-blocking,
only proves fast; a future regression could stay under the ceiling while still blocking the thread for the
full duration in one synchronous span.

## 2026-08-06 — two more notes (triage/diagnosis only, NOT implemented, per user request)

**§TM_PANEL_RESIZE_H targeted the wrong box — ✅ FIXED, bim-ootb PR #1216 (auto-merge armed).**
`wirePanelResizeHeight()` (PR #1208) grew the OUTER `_panel` shell only (`style.maxHeight` +
`overflow-y:auto`). The actual Gantt canvas lives in the INNER `#tm-gantt-box`, which has its own separate
height cap (default 220px, only adjustable via the internal top-strip grip `tm-gantt-grip` → `_ganttBoxH`,
§GANTT_RESIZE E6) — so dragging the bottom edge grew the outer container but the content inside stayed
clipped at its old size. User confirmed this was the inner frame they meant. Fix: the bottom grip now
drives `#tm-gantt-box`/`_ganttBoxH` directly (the SAME variable/target `tm-gantt-grip` already owns) —
a second, more discoverable entry point to the one real resize, not a second mechanism; `_panel` needs no
style of its own since it's a flex column that naturally grows to fit the taller box.
`witness_tm_panel_resize_h.js` 16/16 — new checks (`G-PRH-13`..`16`) specifically assert the grip targets
`#tm-gantt-box`/`_ganttBoxH` and NOT `_panel`, so this exact regression class can't silently return.

**JSON schedule round-trip — two existing specs, stale, unreconciled with shipped reality or each other.**
`GANTT_ACCURACY.md §B` (~2026-05, DIY export/import) and `TM_SCHEDULE_EDITOR.md` (2026-07-07, refines §B into
the standard Settings JSON editor — `tm_schedule` DB row, `ProjectJson.load/save('schedule')`, a real
template/instance/permission model) both design schedule editing as a **JSON form/file**. Neither has ever
been referenced from this file, and everything actually shipped since (drag/resize/lock directly on the
Gantt canvas — `commitGanttDrag`/`moveTaskCascade`/real `task_sequences`) is a different UX paradigm for the
same goal. Building either spec as currently written would duplicate or orphan the live drag-edit UX.
**Still-good part worth keeping:** TM_SCHEDULE_EDITOR.md's mandate to unify the 3 overlapping rate/rule
sources (rates.js hardcoded / `rates/*.json` / bim-compiler's `4D_phases.json`) rather than adding a 4th —
matches this session's independent finding that rates.json is disconnected from Settings and from What-if.
**Before building either spec:** reconcile which mechanism "editable schedule JSON" is actually supposed to
be — (a) persist the current drag-edit model durably (small: wire `persistDb()` into Lock, no new UX), or
(b) build the JSON-form editor these specs describe as a parallel/alternate path. Nothing currently decides
between them. Not implemented here per user instruction (triage only).

## Session close-out, 2026-08-06

Three items this session, all in a bim-compiler-rooted session (implementation dispatched to fresh
`origin/main` worktrees per `feedback_diagnose_in_session_fix_in_other_session.md` where the target was
bim-ootb code):

- ✅ **§TM_PANEL_RESIZE_H DONE, twice** — shipped (bim-ootb PR #1208), then the user caught a real
  regression live (grew the outer `_panel` shell, not the inner `#tm-gantt-box` content), fixed same
  session (PR #1216, auto-merge armed). Witness `witness_tm_panel_resize_h.js` now 16/16 with checks
  that specifically guard the regression class (targets `#tm-gantt-box`/`_ganttBoxH`, not `_panel`).
- ⛔ **§GANTT_REFOLD_HANG — diagnosed + LIVE-confirmed, NOT implemented, needs a bim-ootb session.**
  Root cause: `injectGantt()`'s `§WRITE_LOOP_TIMING` write loop (`time_machine.js:4253-4264`), confirmed
  by a real user console paste (Hospital, 63,415 elements) — the log stream stops dead exactly where
  that block's own completion log should print. Full handoff (caller chain, chunking fix plan, why the
  loop can be chunked but not reordered) is in the dated section above. **Next session: pick this up
  directly, no rediscovery needed** — implement the chunked-yield fix, convert `injectGantt()` to
  return a Promise, update its 3 call sites (`_activateAsync` ×2, `window.tmGenerateTimeline`).
- ⛔ **JSON schedule round-trip — spec reconciliation gap named, NOT resolved.** `GANTT_ACCURACY.md §B`
  and `TM_SCHEDULE_EDITOR.md` both spec a JSON-form editor that was never squared against the drag-edit
  UX actually shipped. **Open question for whoever picks this up:** persist the current drag-edit model
  durably (small — wire `persistDb()` into Lock) vs. build the JSON-form editor as a parallel path (big
  — the full `TM_SCHEDULE_EDITOR.md` plan). Not decided; don't build either without deciding first.

## 2026-08-07 — §GANTT_DOUBLE_LOAD — clicking the Gantt/TM icon runs `injectGantt()` TWICE, diagnosed only, NOT fixed (handoff for a Fable agent)

**✅ FIXED same day — §GANTT_SINGLE_LOAD, PR bim-ootb#1237 (`fix/gantt-double-load`), auto-merge armed.**
User re-reported the double load live (pasted console: full chain twice, `§GANTT_AUTO_GENERATE` →
`§TM_REFOLD clearedPlaceOps=63415` between the passes — exactly the mechanism pinned below). Fix took
check 2's direction: `_materializeNativeSchedule(app)` (extracted materialize core, no UI tip/refold)
runs BEFORE the first `injectGantt()` on a truly-cold open (no schedule row), so the single pass absorbs
the authored schedule — bars editable immediately, project starts today, auto-generate branch never
fires. Check 2b's refold-vs-lighter-refresh question is MOOT on this path (no refresh needed at all);
`refoldSchedule()` untouched for its external-edit caller (check 3 honored). Witness (check 4):
`tests/witness_gantt_single_load.js`, headless §-log, fresh profile, Hospital 63,415 elements, INCLUDING
the Gantt-icon press: `§GANTT_PREMATERIALIZE=1, §SUPPORT_CHECK=1, §GANTT injected=1, §XRAY_EDGES=1,
§GANTT_AUTO_GENERATE=0, §TM_REFOLD=0, editable=35/35, opsWithTask=63415/63415` — PASS. Check 1's answer
confirmed en route: with the fix the first-open cache stores task-carrying ops, so warm opens hit
`§GANTT_CACHE_HIT` and can never re-fire. (The "why did 3 sessions diagnose but not ship" study item
below stands answered by events: sessions 1–3 were document-only per user instruction; the 4th shipped
§DEQ_V1 + this within hours once told to resolve — the blocker was instruction scope, not friction.)

User: clicking the Gantt chart icon "acts as if it is loading twice." Confirmed from the user's own
pasted browser console (Terminal, 48,428 elements) — this is a real double full-recompute on a SINGLE
click, not a perception issue. **Diagnosed in this session by reading `origin/main:viewer/time_machine.js`
(bim-ootb) — do NOT re-derive, the mechanism is fully pinned below. Not implemented per user instruction
("don't fix, just document what to check").**

**The two passes, both visible in the pasted log:**
1. Pass 1 — `§TIME_MACHINE ON — 48428 ops, 111 days, project: 7/24/2025 → 11/13/2025` (placeholder/stale
   start date). Full `§GANTT band 0..9` computation, `§GANTT_CACHE_SAVE ops=48428`, `§XRAY_EDGES`,
   `§4D_BAND_MONOTONIC`, etc. — the whole heavy chain runs once.
2. Immediately after, `§GANTT_BAR_IDENTITY schedule=none bars=71 editable=0` → `§GANTT_AUTO_GENERATE no
   editable bars — materializing a schedule natively` → `§TM_REFOLD wasActive=true clearedPlaceOps=48428`
   → `§TIME_MACHINE OFF` → `§TIME_MACHINE ON — 48428 ops, 112 days, project: 8/6/2026 → 11/25/2026` (today's
   date this time) — the ENTIRE band/xray/monotonic/cache chain runs a SECOND time, discarding pass 1's
   result completely.

**Root cause, by line (`viewer/time_machine.js`, `origin/main`):**
- `activate()` (~6450) → `_activateAsync()` (~6495): no existing `ELEMENT_PLACE` ops → calls `injectGantt()`
  (pass 1, placeholder-dated schedule, no `task_id`s) → `_finishActivate()` → `drawGanttMini()` (~5772).
- `drawGanttMini()` counts editable bars (bars with a real `task_id`); pass 1's ops have none, so it hits
  the 2026-08-05 §GANTT_EDIT_LOCK auto-materialize branch (~5817-5820): `_ganttAutoGenAttempted = true` →
  `generateGanttSchedule()` (~5457).
- `generateGanttSchedule()` calls `SA.materializeZones(...)` with `start=today` (~5483), then at line 5503
  calls `window.tmRefoldSchedule()` to "refresh" — but `refoldSchedule()` (~6764) does a synchronous
  `deactivate()` + `activate()` round-trip, which re-enters `_activateAsync()` and runs `injectGantt()`
  AGAIN — pass 2, full cost, no reuse of pass 1's work.

**Why this matters beyond UX polish:** `injectGantt()` is the SAME function already diagnosed as the
hang cause in `§GANTT_REFOLD_HANG` above (2026-08-06, unfixed, `§WRITE_LOOP_TIMING` blocks the main
thread on large buildings — Hospital, 63,415 elements, tab froze). This double-load means EVERY first-ever
open of a building with no already-authored schedule pays that synchronous cost TWICE on one click, not
once — directly compounding the still-open hang, not a separate lighter bug.

**What to check next (for whoever/whatever picks this up — Fable agent or a session), in order:**
1. Confirm this reproduces on every "cold" open (no `SCH_AUTHORED` schedule with real `task_id`s yet) and
   does NOT reproduce on a building that already has one cached/authored — i.e. is pass 2 truly a
   first-time-only cost, or does it fire on every activate? (`_ganttAutoGenAttempted` is reset to `false`
   inside `activate()` at line ~6453 every time — check whether that makes this refire on EVERY open, not
   just the first, since the flag can't remember "already generated" across a deactivate/reactivate.)
2. Whether `generateGanttSchedule()` needs pass 1's `injectGantt()` result at all before it materializes —
   if `SA.materializeZones()` only needs the DB's element/schedule tables (not the ops pass 1 just wrote),
   the fix is likely: skip the placeholder-dated `injectGantt()` call entirely when no authored schedule
   exists yet, and go straight to native generate — one pass, not two.
2b. Alternatively, whether `refoldSchedule()`'s deactivate+reactivate round-trip is overkill for this one
    caller — it exists to re-run the drawer overlay after an EXTERNAL edit (§TM-REFOLD, W-TM-REFOLD
    comment ~6758), but `generateGanttSchedule()` is calling it on its OWN freshly-generated data, not an
    external edit. Check whether a lighter in-place refresh (`invalidateGanttModel()`/`computeDays()`/
    `drawGanttMini()`/`renderAtTime()` — the `else` branch already sitting right next to this call at
    line ~5504) is sufficient here instead of the full deactivate/activate/injectGantt round-trip.
3. Any fix here must not break `refoldSchedule()`'s OTHER caller (the real external-edit consumer named
   in its own comment, `4D_SCHED_EDIT` in `main.js`) — that path genuinely needs the full re-fold.
4. Once a fix direction is chosen, needs a witness proving `injectGantt()`'s expensive log lines
   (`§GANTT band`, `§WRITE_LOOP_TIMING`, `§XRAY_EDGES`) appear ONCE per cold TM activation, not twice —
   same class of proof `witness_gantt_og_grid_perf.js` already uses for timing, extend rather than
   duplicate.

**Not investigated this session (explicitly out of scope per user instruction):** no fix, no witness, no
browser trial beyond reading the user's own pasted log. This section exists purely so the next session/agent
does not have to re-read `time_machine.js` cold to find the mechanism.

**Operational note (2026-08-07, user correction) — track this HERE, don't fragment to bim-ootb sessions.**
Prior sessions on this file (2026-08-05, 2026-08-06) dispatched bim-ootb fixes to fresh `origin/main`
worktrees per `feedback_diagnose_in_session_fix_in_other_session.md` — but in practice, Claude sessions on
this whole lane have always actually been run FROM `bim-compiler` (this repo), never a standalone session
opened inside `bim-ootb`. Splitting tracking across a second location is exactly how the local `~/bim-ootb`
checkout ended up 5 commits stale AND carrying ~5000 uncommitted lines of an unrelated session's WIP
(found 2026-08-05, §TM_PANEL_RESIZE_H section above) — state got lost, not just delayed. **User directive:
keep this file the single tracking point for this lane's status; do not rely on a separate bim-ootb-side
session/thread to carry context forward.**

**Before the next fix attempt (this or any future session/agent): study WHY three sessions in a row
(2026-08-05, 2026-08-06, 2026-08-07) diagnosed a real bug in this exact area and none of them shipped a
fix** — `§GANTT_REFOLD_HANG` (2026-08-06, root cause pinned, chunking plan written, still unfixed) and
`§GANTT_DOUBLE_LOAD` (this section) are BOTH inside `injectGantt()`/`refoldSchedule()`, and both stalled at
"diagnosed, handed off" rather than landing. That repetition is itself a signal worth reading before
attempting a fourth pass — check what specifically blocked implementation each time (scope/time,
cross-repo handoff friction, the stale-worktree/WIP collision above, or something else) rather than
assuming this pass will simply succeed where three did not.

## 2026-08-07 — §SUPPORT_CHECK blind spots: fans floating over roof/seats (Terminal), hanging beams (Hospital) — user-observed, NOT fixed

User, watching Time Machine playback: "in Terminal, fans appearing in mid air first before seats or roofs
comes about" and separately "in Hospital still has hanging beams." Both are real physics violations in the
4D sequence, both CONTRADICT the `§SUPPORT_CHECK floating=0/2088` (Terminal) log line already shown in this
session's own pasted console — i.e. the audit that's supposed to catch exactly this reports clean while the
user watches it happen. **Diagnosed by reading `schedule_gate.js`/`time_machine.js` on `origin/main` — NOT
fixed, no witness run, per the same "document only" instruction as §GANTT_DOUBLE_LOAD above.**

**Fans (Terminal) — two compounding, code-confirmed blind spots in the audit itself, not just bad luck:**
1. `time_machine.js:4021-4022`, the `_audit` class filter used by `§SUPPORT_CHECK`:
   `e.cls === 'IfcBeam' || e.cls === 'IfcMember' || e.cls === 'IfcSlab' || e.cls.indexOf('Furni') >= 0 ||
   e.cls.indexOf('Wall') >= 0` — **no MEP/flow class matches this at all** (a fan is `IfcFlowTerminal` or
   similar, contains neither "Furni" nor "Wall"). Fans are silently never checked for floating, full stop.
   Notably the SAME function's own header comment (line 4019) records the pre-fix Hospital baseline as
   "133 furniture + **1980 flow** + 1156 walls" floated — "flow" was clearly a tracked category once; the
   live `_audit` predicate today does not include it. Whether that's a regression (dropped when the
   filter was last edited) or the comment always overstated scope needs `git log -p` on that filter, not
   assumed either way.
2. Even for a class that WAS in the filter, `schedule_gate.js`'s support grid can't see a roof anyway:
   `place()` (line ~174-183) only pushes an element into the support pool `grid` when `el.seq <= 4`
   (Pass-A structure); everything else (`else if IfcWall`) goes to a separate `wallGrid`, and anything
   that's neither is added to NO pool. A roof slab promoted to seq>4 by the load-path rule (M1,
   `§GANTT_OVERRIDE ... promoted to roof role`, seen in this session's own Terminal log: "60 slabs
   promoted to roof role") is placed in Pass B and therefore **never becomes a support candidate for
   anything scheduled after it** — `geoGate()`/`auditFloating()`'s `structGrid` (line 310-314) is built
   the same `seq<=4`-only way. So nothing placed later (a ceiling-mounted fan, or anything else) can ever
   be geometrically gated on a promoted roof slab's completion, by construction — the exact "fan before
   roof" symptom, and the same class of blind spot already named and accepted as `⚠ LIMIT 1` for slabs-vs-
   walls in the existing `§4D_ROOF_LOAD_PATH` comment (line ~287-309) — this is that same limitation
   showing up one level further downstream (MEP/furniture vs. a promoted roof slab, not slab vs. wall).

**Beams (Hospital) — reported, NOT re-diagnosed this session.** `IfcBeam` IS in the `_audit` filter and
IS seq<=4 (Pass-A structure, included in `structGrid`), so this is NOT explained by either mechanism above
— don't assume a shared cause without evidence. The in-code comment at `schedule_gate.js:4017-4020` claims
this exact defect ("84 beams... floated") was already fixed 2-pass + ε=0.05 → 0 on Hospital specifically.
A live report of it recurring means one of: (a) genuine regression since that fix, (b) a beam sub-case the
ε/two-pass fix didn't actually cover (e.g. lateral beam-to-beam framing rather than vertical support — 
`geoGate()` only checks "structure rising from BELOW my footprint," not a beam's end-to-end framing
connections to columns/other beams at the SAME base_z), or (c) the visual symptom is real but is a
DIFFERENT thing than "floating" (e.g. a beam rendered before its OWN slot but still gated correctly, i.e.
a rendering/DLOD timing issue rather than a scheduling one). **Needs a fresh live console capture on
Hospital with `§SUPPORT_CHECK` visible, same as the Terminal evidence used above, before guessing further.**

**What to check next (for study, not immediate fix):**
1. Confirm via `git log -p -- viewer/time_machine.js` around line 4021 whether the `_audit` filter's
   "flow" class match was ever present and got dropped, or the "1980 flow" comment predates the current
   filter entirely.
2. Identify the real IFC class name(s) for "fan" in this DB (`SELECT DISTINCT cls FROM elements_meta WHERE
   name LIKE '%fan%'` or similar) — confirm it's excluded by the current `_audit` regex before assuming.
3. Decide whether promoted-seq roof slabs (and any other Pass-B-promoted structure) should be added to
   `structGrid`/`grid` as valid supports for later Pass-B elements — this is a scope decision (mirrors the
   already-accepted LIMIT 1 tradeoff: widening the pool fixed 24/10979 real cases but the earlier `attempt
   1` widening (ANY element as a support for ANY class) produced 3421 false positives on Hospital — so this
   is not a free widen, needs the same measured, narrow-scope approach `§4D_ROOF_LOAD_PATH` already used).
4. Get a fresh Hospital console capture with `§SUPPORT_CHECK` before touching beams at all — do not reuse
   the 2-pass/ε=0.05 fix's old "floating=0" claim as current truth without re-measuring live.

**Verification method for ALL of the above (user directive, 2026-08-07, restated explicitly for whoever
picks this up — Fable agent or otherwise): whitebox `§`-tagged console log ONLY, never Claude-in-Chrome or
any other browser-visual method.** "Fresh live console capture" above means the user (or a script) runs
the app and captures/pastes the raw `§`-tagged log lines — it does NOT mean an agent drives a browser and
looks at rendered pixels or a screenshot to judge correctness. This is already this project's standing rule
(`CLAUDE.md` FUNDAMENTAL LAW, `feedback_whitebox_not_playwright.md`, `feedback_log_not_visual_proof.md`) —
restated here in-file because the fix lane above involves visibly-wrong geometry (fans mid-air, hanging
beams), which is exactly the kind of bug where a screenshot LOOKS like the obvious verification tool and
is not: "AI is blind" to whether a screenshot is actually right (per the user, verbatim this session) —
only a numeric/log assertion (e.g. `§SUPPORT_CHECK floating=N/M` read programmatically, or a witness script
asserting on the same data `auditFloating()` already computes) counts as proof here, for the SAME reason a
screenshot never counted as proof for the camera/orbit work this rule was originally hardened against.

## 2026-08-07 — §SUPPORT_CHECK code-verified + §METADATA_FIRST ruling: the fan-before-roof inversion is a SEQ NUMBER fact, not just an audit blind spot

**Code verification (this session, `git show origin/main` @ c46a602 — GitHub outage, cached ref, no
browser):** every file:line claim in §GANTT_DOUBLE_LOAD and §SUPPORT_CHECK above CHECKS OUT verbatim.
Corrections/additions from the verification pass:
- The beam-fix comment attributed above to `schedule_gate.js:4017-4020` is actually in
  `time_machine.js:4017-4020` (`schedule_gate.js` is only 407 lines).
- §GANTT_DOUBLE_LOAD check 1 leans ANSWERED: pass 2 `cachePut`s ops carrying real `task_id`s, so the
  next open hits `§GANTT_CACHE_HIT` and the auto-gen branch can't fire — first-open-only cost.
- §GANTT_DOUBLE_LOAD check 2b has a documented counter-argument to answer: `time_machine.js:5501`
  explicitly justifies reusing `tmRefoldSchedule()` as "real, already-working machinery, not a second
  lighter-weight refresh path whose correctness would need its own separate proof."
- The `_audit` header comment (`time_machine.js:4017`) PROMISES MEP coverage ("beam/member/slab/
  furniture/MEP/wall") that the predicate at 4021-4022 does not deliver — the comment/code mismatch is
  itself confirmed, answering check 1's "regression or overstated comment" question halfway: the intent
  was clearly MEP-inclusive.

**NEW root cause, sharper than the audit blind spot — the inversion is baked into the sequence numbers:**
`rates/sequence_rules.json` gives fans (`IfcFlowMovingDevice`, MEP Rough-in) **seq=7**; the load-path
rule promotes roof slabs to **seq=8** (`time_machine.js:3930`). PASS B sorts by `(seq, base_z)`, so
seq-7 fans are scheduled BEFORE the seq-8 roof over them **by construction** — the geometric gate never
gets a chance to correct it because promoted roofs enter no support pool (§SUPPORT_CHECK blind spot 2
above). Class-global sequence metadata is Z-blind by design; Z correctness MUST come from the geometric
support gates. Any fix that only widens the audit filter will REPORT the fans floating but not stop them.

**User ruling (verbatim intent, 2026-08-07): code tackles IFC metadata, not building quirks.** Prefer
abstract, metadata-driven code that needs no training on any particular building's data — "we already
have whole IFC classes into the 4D.JSON" (`viewer/rates/sequence_rules.json`: SEQUENCE_RULES maps whole
IFC classes → phase/sequence/resource). Concretely for this lane:
- The `_audit` filter's hardcoded class-name substrings (`'Furni'`, `'Wall'`) are the building-quirk
  style to eliminate — audit scope should derive from the SEQUENCE_RULES metadata (every scheduled
  class), not a hand-picked list.
- `seq<=4` as "structure" is ALREADY metadata-keyed (sequences 1–4 = Substructure+Superstructure in the
  JSON) — that part is fine; the class-name special cases around it (`cls.indexOf('IfcWall')===0`,
  promoted-slab-only wall pool) are the quirk layer.
- **"But that last part impacts a bit the Z stack" (user, same message):** whole-class sequences order
  TRADES, not vertical reality — the Z stack is exactly what class metadata cannot express, so the
  support-pool/geo-gate layer (currently excluding promoted roofs, currently not auditing MEP) is where
  the fan-before-roof class of bug must be fixed, using the same measured narrow-scope method
  §4D_ROOF_LOAD_PATH already used (its attempt-1 "any class supports any class" widening produced 3421
  false positives on Hospital — a metadata-driven widen still needs that same false-positive measurement).

## 2026-08-07 — §DEFAULT_ENGINE_QUALITY — product goal: the default schedule must be P6-quality out of the box, no manual grunt-work correction

User: "we got editor, but we want the default engine to give as much free best schedule freeing the user
from doing grunt work that is common sense." This reframes today's whole session: the goal is NOT "give
the user tools to fix a bad schedule" (the editor already does that — drag/resize/link, §GANTT_EDIT_LOCK)
— it's that the DEFAULT/auto-generated schedule (`materializeZones`/`materializeDefault`/
`generateGanttSchedule()`) should already be free of common-sense physics violations before any human
touches it. The editor stays the mechanism for genuine PLAN changes, not the mechanism that mops up
violations the engine itself introduced.

**Every defect named in this file today is a concrete instance of this goal not yet being met:**
- Fan-before-roof (§SUPPORT_CHECK / §METADATA_FIRST above) — seq7-vs-seq8 with no dependency tying them:
  a "common sense" violation (a fan cannot exist before the structure holding it) shipping in the DEFAULT
  schedule, not something a user broke by editing.
- Hanging beams (Hospital) — same category, root cause not yet confirmed, but same class: physically
  impossible sequencing in the auto-generated output, not an edit artifact.
- §GANTT_DOUBLE_LOAD — a different bar (engine should just work cleanly, not violate physics), but the
  same "default path must not need a human to notice something's off" standard.

**DECIDED 2026-08-07 (user): v1 bar = criteria 1+3 — zero floating (all classes) + zero seq-vs-geometry
contradictions. Criterion 2 (full FS/SS/FF/SF precedence) deferred — consistent with the 2026-08-03 ruling
(auto-generated accuracy first). Sizing note: #2 is not a hand-off to another lane — THIS file is the CPM
lane's mission, and zone-level CPM already exists (`materializeZones` writes `task_sequences` edges,
§ZONE_CPM zones=71 edges=105, plus `computeCpm()`); the eventual work is extending that graph to
element-level placement, augmenting `computeSchedule()` (standing rule: pre-existing, don't rebuild).
Constraint for the 1+3 implementation: pool-widening alone is a no-op for fan-before-roof — Pass B places
in ascending `(seq, base_z)`, so the seq-8 roof's `.end` doesn't exist when the seq-7 fan is gated; needs
dependency-aware placement order OR roof promotion below MEP seq.**

**What "P6-quality out of the box" concretely means — named to scope, NOT decided or sized this session:**
1. Zero floating elements, for real — `§SUPPORT_CHECK floating=0` must be TRUE, not just reported as 0
   while blind to whole classes (MEP/flow). Requires closing BOTH blind spots already named in
   §SUPPORT_CHECK above (audit filter scope + promoted-structure support-pool gap).
2. Correct precedence semantics — real FS/SS/FF/SF + float/critical-path, not a seq-and-base_z sort that
   usually happens to look right. Matches this file's own earlier ruling to follow MSP/P6 convention
   rather than invent a new idiom (§GANTT_EDITABLE_E2E, 2026-08-05).
3. No sequence-vs-geometry contradictions, ever — a class's default `seq` (trade order, from
   `SEQUENCE_RULES`) must never be allowed to place an element before its OWN real physical support
   finishes, regardless of trade convention. Nothing enforces this today except the geo-gate, which — per
   §METADATA_FIRST above — doesn't cover Pass-B-promoted structure or unaudited classes.

**Recommended starting point for whoever picks this up (not started this session):** write the acceptance
test FIRST — a witness (e.g. `witness_default_schedule_quality.js`) asserting 0 floating across ALL
classes and 0 seq-vs-geometry contradictions, run across multiple real buildings (Terminal, Hospital) —
before touching `schedule_gate.js`. That makes "good enough" a number, not an eyeball call, consistent with
this file's own whitebox-only verification rule (§SUPPORT_CHECK above) and the project's Spec-First rule
(`CLAUDE.md`) — spec/witness before implementation, every time.

## 2026-08-07 — §DEQ_V1_IMPL — spec for the v1 bar implementation (criteria 1+3), branch `fix/4d-default-engine-quality`

Advice rejected before this spec: base_z-primary Pass B sort (Sonnet proposal) — §STAGGER_SUPPORT_ORDER's
invariant "carrier base_z always below carried" is FALSE for hang-from-above (fan.base_z < roof.base_z),
so it guarantees the fan places before its carrier. Roof seq demotion in tm.js also rejected — ordering is
fixed inside schedule_gate.js instead, keeping seq=8 as the promotion identity.

All changes in `viewer/schedule_gate.js` (pure module, browser+node identical) + the `_audit` callsite in
`time_machine.js`. Physics model addition: **support is bearing-below OR carrier-above (hanging)** — the
existing gates only know bearing-below.
1. `place()`: promoted slabs (`cls==='IfcSlab' && seq>4`) join the structure support `grid` (they are real
   supports for what hangs beneath them). Safe vs attempt-1's false positives: as supports they sit ABOVE
   most elements, so the bearing-below predicate rarely matches them; only the new hang predicate uses them.
2. Pass B processing order: promoted slabs sort at `wallSeqMax + 0.5` (after their carriers, before MEP
   rough-in under the live sequence_rules.json) — `el.seq` stays 8 for phaseTrade/bandTrade identity.
3. New `hangGate(el)`, Pass B only, scoped to elements with NO bearing-below support (has one → not
   hanging; excludes walls/furniture resting on slabs and all of Pass A): latest end of overlapping
   structure whose underside is within ±GAP of `el.top_z` (what I'm mounted to).
4. Bounded repair loop after Pass B (≤4 iterations, §-logged): re-check geo+hang gates against the FINAL
   grids; shift violators later (duration kept, grids rebuilt). Guarantees zero contradictions regardless
   of rule-set seq quirks (e.g. legacy rule sets where MEP seq < wall seq place carriers after dependents).
   Crew slots are not re-solved for shifted elements — logged count, accepted v1 tradeoff.
5. `auditFloating()`: mirror all of the above — structGrid includes promoted slabs; violation = start
   before latest bearing-below support end OR (if no bearing-below) latest hang-carrier end. tm.js
   `_audit` widened to ALL classes (metadata-first ruling; delivers what its own comment promised).
6. Witness: `tests/witness_default_engine_quality.js` — asserts floating=0 with NO class filter on
   Hospital + Terminal real DBs, prints §DEQ lines; existing `test_schedule_gate.js` must stay PASS.

**✅ IMPLEMENTED same session — PR bim-ootb#1236 (`fix/4d-default-engine-quality`), auto-merge armed.**
Witness evidence (all §-log, no browser): G-DEQ-1a fan-after-roof PASS (fan.start=roof.end, synthetic
exact-defect case) · G-DEQ-1b roof-after-walls PASS (no §4D_WALLS_BEFORE_ROOF regression) · G-DEQ-2
Hospital floating=**0/63415**, Terminal floating=**0/48428**, NO class filter · full suite PASS
(gate 3251→0 / generated / projector / readonly / facade_stagger 662→0 / 4d_sidecar). Two cycle bugs
found+fixed en route, both were "symmetric support relation → repair-loop livelock": (a) geoGate's
§GEO_SUPPORT_LEAK contained-clause made same-z sibling slabs support each other — containment now
strict (S.base > el.base+EPS) and never a promoted slab (a roof nested at a tall wall's top BEARS ON
the wall; counting it was a wallGate cycle, measured on Hospital roof@199.66..199.81 inside
wall@191.81..199.81); (b) hangGate carrier now requires S.top strictly above mine (same-z siblings
otherwise carry each other). §DEQ_REPAIR converges: Hospital 1 sweep/8 shifts, Terminal 0.

## 2026-08-07 — §4D_LAYER_TRUTH + §GANTT_RETIME_RESYNC — the "layer buffer" the user asked for, SHIPPED (PRs #1239 merged, #1240 auto-merge armed)

User, watching Hospital on the fixed engine: "walls coming up before the foundation slabs all around...
the 2 trucks still came out on day 1... take a step back and look at 4D Generate abstract logic
mechanism, perhaps needing a layer buffer to manage the gantt." **The step-back finding, witnessed in
the user's own console:** the 4D generator is THREE layers — L1 element scheduler (`computeSchedule`,
proven floating=0), L2 zone rollup (`materializeZones`/`deriveZones`, 35 task windows), L3 playback
injection (`injectGantt` task-window overlay) — and L3 DISCARDED L1's times (even index-stagger across
each window): `§XRAY_EDGES staged=284/63415` on the task-window pass vs `staged=0` on the generative
pass. Plus `§GANTT band 0 z=[0.0,0.0] 233 elements: Architecture:233` — 233 geometry-less elements
(no transform row, COALESCE→origin) scheduling at day 0 AND dragging their zone windows there (the
day-1 walls and trucks). Fix = the layer buffer (PR #1239, `witness_4d_layer_truth.js` staged 284→0):
- **§4D_NOGEO**: geometry-less elements excluded from the support-gated schedule and zone rollup in
  BOTH extractors (tm.js + schedule_author.js), parked at project end (parked=233 on Hospital).
- **L3 affine map**: each element's generative [start,end] maps affinely into its task window
  (ls-primary order) — the window layer can no longer re-time against the schedule layer; a
  user-dragged window rescales without reordering.
- **§PHASE_OVERLAP_SUPPORT_GUARD**: single bz-pass → fixpoint sweep (≤16), bearing-below OR
  hang-carrier, predicate ALIGNED with `auditFloating`/`_buildXraySupportCache` (carrier top REACHES
  the base, unbounded above — the old ±GAP band left exactly the last 25 staged).

**§GANTT_RETIME_RESYNC (PR #1240)** — user: "foundation piling nor others does not seem to come onto
canvas anymore, though i dragged to certain bars passing," witnessed as `§PERF_TRAVERSE cand=0` on
every scrub after `§GANTT_RETIME`: the retime paths moved op timestamps but never rebuilt the
§PERF_INCR event index (`_evMesh` — so the incremental reveal skipped meshes straight across their
moved transitions = the blackout), never re-sorted `_ops`, never rebuilt the §XRAY solidify cache.
One `_tmResyncAfterRetime()` called by all four retime commit paths (drag, ruler shift, group shift,
undo). Witness `witness_gantt_retime_resync.js` drives the REAL ruler-shift path (−93d): rows=63182
retimed, both caches rebuilt after the shift, `tmPlacedCount` at 30% of the new span = 22766.
Known-and-accepted: a shift leaves ~177 sub-day staged elements (task windows are date-floored, so
seam elements offset <1 day) — the xray staging mechanism ghosts them until their carrier finishes,
and the count is now honestly REPORTED where the stale cache previously hid it.

**Note for testing:** GH Pages still serves the pre-fix build (v956 signatures: `§GANTT_CACHE_HIT`
+ auto-generate refold + staged=284). All of today's fixes are verified on localhost:8484 (worktree
`/tmp/wt-4d-engine`); they reach GH Pages via the normal deploy pipeline after the PRs land.

**For a new dev landing on this file cold:** read `## Why this file exists` + `## What's already shipped`
at the top for original scope, then jump straight to this close-out and the dated 2026-08-06/08-07
sections above it for the live edge — the numbered gap list right after the top summary predates all of the
2026-08-04 through 2026-08-07 sessions below it and is mostly still open, not superseded.

## 2026-08-07 — §GEOMETRIC_SUPPORT_ORDER — next task: make "nothing floats" a structural fact of the placement order, not a per-building patch (user ruling)

**User framing:** every IFC building — any of them — is real XYZ coordinates. There is no such thing as
an element legitimately floating in midair during construction; that is a physical impossibility, not a
building-specific edge case. Yet every fix so far (fan-before-roof, walls-before-foundation, hanging
beams, the two symmetric-support cycle bugs in §DEQ_V1_IMPL) has been a SEPARATE patch discovered on a
SPECIFIC building. That pattern — chase one geometry shape, ship a special-case gate, wait for the next
building to surface a new one — does not converge. The task is to stop patching shapes and fix the
mechanism so it generalizes to any building's IFC by construction.

**Root cause, named plainly:** `computeSchedule()`'s Pass B places elements primarily by `(seq, base_z)`
— `seq` is a CLASS/TRADE guess (`sequence_rules.json`), not a physical fact. Real geometric support
(`geoGate`, `hangGate`) is checked only as a GATE against that seq-driven order, and violations are
caught after the fact by a bounded repair loop (`§DEQ_REPAIR`, ≤4 sweeps) or an audit
(`auditFloating`). Every mishap to date has been a hole in that gate/audit machinery — not proof the
approach is unsound, but proof it is inherently reactive: it can only catch shapes someone already
thought to test.

**The generalization:** derive the placement order FROM real geometry FIRST, and use `seq` only as a
tiebreaker within what geometry already allows — not the other way around.
1. Build a support DAG directly from XYZ data alone, before `seq` is consulted: element E depends on
   every element that bears E from below (bbox overlap + top_z ≈ E.base_z within tolerance) OR carries E
   from above (E hangs, no bearing-below found, nearest overlapping structure's underside ≈ E.top_z).
   This is pure geometry — it needs nothing building-specific and applies to any extracted DB.
2. Topologically place elements by that DAG (a support must be scheduled before what it supports).
   `seq`/trade convention breaks ties ONLY among elements the DAG already says are mutually placeable —
   it never overrides a real geometric dependency. The existing Pass A/B, `hangGate`, repair-loop
   machinery becomes the FALLBACK for whatever the DAG genuinely cannot order (see cycle handling
   below), not the primary mechanism.
3. If the geometry DAG contains a true cycle (two elements spatially "supporting" each other — should
   not happen in real construction geometry, but has appeared twice already as MODELING artifacts:
   same-z sibling slabs in `geoGate`, same-z sibling carriers in `hangGate`, both already fixed by
   strictness rules), name and log it explicitly (`§SUPPORT_CYCLE`) rather than silently resolving it —
   per this project's own no-invent discipline, a cycle is a data/modeling fact to report, not a
   heuristic to paper over.
4. **Prove it generalizes, don't assume it:** the acceptance witness must run zero-floating (ALL
   classes, no audit filter) across Hospital + Terminal (already covered) AND at least one small/
   residential building (`Duplex_extracted.db` — the standing fallback fixture, per the still-open
   Multi-building validation gap above, §2 in the original gap list). A fix proven only on the two
   large buildings already tested is not proof it generalizes — that is exactly the gap this task
   exists to close.

**Order of work (Spec-First, per CLAUDE.md — witness before code):**
1. Write `witness_geometric_support_order.js` FIRST: asserts 0 floating (no class filter) on Hospital,
   Terminal, AND Duplex, using only geometry-derived ordering — must be RED on current `main` for the
   right reason (seq-primary order, not geometry-primary) before any implementation lands.
2. Implement the geometry-first DAG + topological placement in `schedule_gate.js`, `seq` demoted to
   tiebreak only.
3. Re-run the FULL existing suite named in §DEQ_V1_IMPL (gate/generated/projector/readonly/
   facade_stagger/4d_sidecar) — must stay PASS; this is a placement-order change, not a new feature, so
   nothing already proven should regress.
4. Only then revisit the individually-patched cases (fan-over-roof, hang-carrier, symmetric-support
   cycles) — confirm they now fall out of the general mechanism rather than needing their own gate, and
   remove any gate/rule that's now redundant (KISS — don't keep a special case once the general rule
   subsumes it).

**Scope boundary:** this is ordering/placement only — it does not touch precedence semantics
(FS/SS/FF/SF, Criterion 2, still deferred) or the working-calendar gap (#1 in the original list). Those
stay separate, unstarted work.

## 2026-08-07 — §GANTT_LOCK_INTEGRITY — next task: verify physical integrity on lock-back, flag breach, force Undo (user ruling)

**Ask:** the `_ganttEditable` toggle (§GANTT_EDIT_LOCK above) already gates editing behind
🔓 Editing / 🔒 Locked. Today, locking back just flips the flag — whatever the user dragged/resized/
relinked is accepted as-is, immediate-write, no re-check. New requirement: the moment the user toggles
LOCK BACK ON (🔓→🔒), run a verification that the edited schedule still holds physical integrity. If it
doesn't, block the lock, show an **"Integrity Breach"** flag, and require the user to press the existing
single-level Undo (§GANTT_EDIT_UNDO) before locking is allowed to complete.

**What "integrity" means here — reuse, don't invent:** the check IS `ScheduleGate.auditFloating(elements,
sched, null)` — already unfiltered/all-class since §DEQ_V1 (PR #1236), already the exact instrument
`§SUPPORT_CHECK` logs on every TM activation. Nothing new to design for "is anything floating" — call the
same function on the post-edit schedule state at the lock-back moment. If/when §GEOMETRIC_SUPPORT_ORDER
above lands, this hook upgrades automatically (same function name, stronger check) — no separate
integration work later.

**Open questions, named not decided (spec before code, resolve before implementing):**
1. **Undo depth vs breach depth.** §GANTT_EDIT_UNDO is single-level. If the breach traces to an edit
   further back than the last one (several drags ago, each individually "valid" but combining into a
   floating element), one Undo press may not clear it. Does the flag stay up and require repeated Undo
   presses until `auditFloating` is clean again, or does breach-detection need to name WHICH edit broke
   it? Don't assume single-Undo-and-done — verify against a real multi-edit scenario before shipping.
2. **What's gated.** User's ask is specifically "when locking back" — i.e. the check blocks the LOCK
   transition, not every individual edit mid-session (that would defeat the whole point of an editable
   drawer). Confirm this reading before building — don't gate `pointerdown`/`endDrag` themselves.
3. **Cost.** `auditFloating` over ALL elements (e.g. 63,415 on Hospital) on every lock-back — measure
   this before shipping; if it's not instant, needs a spinner/async path rather than blocking the UI
   thread on the toggle click.
4. **Recovery UX.** Does "Integrity Breach" name which element(s) are floating (helps the user judge
   whether Undo is enough or they need several), or just flag pass/fail? Lean toward naming them —
   `auditFloating` can already report a count; extending it to return the offending GUIDs is a small
   addition, not a redesign.

**Order of work:** write `witness_gantt_lock_integrity.js` FIRST — drive a real edit that's known to
break support (e.g. drag a foundation slab's bar later than a wall it carries), attempt lock-back, assert
the breach is flagged and the lock is refused; then Undo, re-attempt lock-back, assert it succeeds. RED
before any implementation, per this file's own Spec-First discipline.

## 2026-08-07 — §GEOMETRIC_SUPPORT_ORDER ✅ SHIPPED (PR bim-ootb#1242, MERGED) + §GANTT_LOCK_INTEGRITY ✅ SHIPPED (PR bim-ootb#1244, auto-merge armed) — both worked witness-first to zero

**§GEOMETRIC_SUPPORT_ORDER — DONE exactly per the spec's own order of work.**
- Witness FIRST: `tests/witness_geometric_support_order.js`, RED on main for the right reason —
  legacy-seq synthetic (fan seq 5 < wall seq 6, carrier sorts after dependent) `§DEQ_REPAIR shifted=1`,
  Hospital `shifted=8`, `§SUPPORT_CYCLE` line absent everywhere. 15/15 GREEN after.
- Implementation (`viewer/schedule_gate.js`): support DAG from XYZ alone — edge S→E for exactly the
  pair predicates the timing gates consult (geoGate below/contained, wallGate, hangGate) — Kahn
  topological placement with the old (pass, seq, rank, base_z) order as the heap TIEBREAK only.
  PASS A/B per-element gate semantics untouched; only iteration order changed. `§DEQ_REPAIR` retained
  as fallback, now `shifted=0` on all fixtures. `§SUPPORT_CYCLE cycles=N` always logged (0 included).
- **Load-bearing discovery en route: `contained(S,E)` definitionally implies `below(E,S)`** — every
  element nested in a taller pool member's z-span was a hidden 2-cycle (406 Kahn leftovers on a 5k
  Hospital subset). Main never saw it: base_z-ascending PASS A silently resolved every such pair in
  favor of below, and the nonst-only repair loop never re-checks structure. Made explicit + uniform:
  between two support-pool members only BELOW orders them; contained edges never target a pool member.
  With that, pool-vs-pool edges are strictly base_z-ordered ⇒ DAG acyclic for real geometry.
- `sortSeq` (§DEQ_V1's promoted-slab wallSeqMax+0.5 ordering hack) REMOVED as subsumed — wall→roof and
  roof→hanger are DAG edges now; witnessed green with the plain-seq tiebreak before removal (KISS,
  spec step 4 honored: general rule replaced the special case, not layered on it).
- Numbers: Hospital 63,415 → `§GEO_ORDER edges=665078 orderMs=785`, computeSchedule total 936ms
  (main 848ms — the DAG costs ~90ms). Duplex small-building coverage NEW (floating=0/1122), closing
  original gap-list §2's small-regime hole. Full §DEQ_V1 suite re-run PASS.
  Perf lesson: per-element `{}` dedup measured 28s at just 15k elements (dict churn) — stamp
  Int32Array + generation counter → ~1s at 63k. Also: any loop calling the placement bodies must not
  use the shared c/cs/k scratch vars (geoGate clobbers them — cost a debugging round).

**§GANTT_LOCK_INTEGRITY — DONE, all 4 spec open questions resolved, witness-first.**
- Witness FIRST: `viewer/tests/witness_gantt_lock_integrity.js`, RED on main (11 fails, feature
  absent) → **19/19** after. (⚠ PR #1244's commit message says "22/22" — wrong, my transcription
  error caught by the watchdog re-running the witness from scratch: the file has exactly 19
  executable assertions on the success path, and my own mid-session run printed `pass=17 fail=2`
  = 19 total. Corrected here and in a PR comment; the merged commit message itself is immutable.)
- `verifyGanttIntegrity()` (time_machine.js): pure read — `_buildXrayElements()` geometry (works on
  the §GANTT_CACHE_HIT path) + CURRENT `_ops` times, audited by `ScheduleGate.auditFloating`, ALL
  classes. Lock handler verifies on 🔓→🔒 ONLY; breach ⇒ lock REFUSED (stays Editing), lockbar shows
  "⚠ Integrity Breach: N floating — press ↺ Undo edit (or fix), then lock again", `§GANTT_LOCK_BREACH`
  logs a guid sample; clean path logs `§GANTT_LOCK_VERIFY ok floating=0/N ms=…`.
- Q1 undo-depth: gate is STATELESS — every lock attempt re-audits; Undo or further corrective edits
  both clear it, no edit-history tracing needed. Q2: Editing→Locked transition only, witness-asserted.
  Q3 cost MEASURED: `§LI_COST auditFloating n=63415 ms=796` (0.8–1.7s range across runs) — a
  "Verifying integrity…" state paints (setTimeout(0)) before the audit. Q4: `auditFloating` gained an
  optional `collectGuids` arg (count return unchanged for all existing callers) — breach NAMES offenders.
- **Second load-bearing discovery, caught by the witness's own clean-state check (G-LI-2b), not by any
  prior suite: wall-bears-roof vs roof-carries-wall was still a mutual timing cycle.** On Duplex with
  the real load-path promotion (`_buildXrayElements`, different promotion pattern than the top-band
  approximation the earlier witnesses used): seq-5 upper walls with no bearing-below "hung" from the
  promoted roof whose base their tops meet, while the roof's wallGate waited on those same walls —
  `§DEQ_REPAIR sweeps=16 shifted=379` livelock, clean state auditing floating=22. New clause, mirrored
  in hangGate + DAG emission + auditFloating: **a WALL that BEARS a promoted slab (top reaches its
  base — wallGate's own relation) never also hangs from it.** A fan in the same geometric relation
  keeps its hang — it is not wall-pool material; pure pair geometry cannot distinguish the two, the
  class-scoped pool (already-measured practice, §4D_ROOF_LOAD_PATH) is what disambiguates. After: 0
  sweeps / 0 shifts / floating=0, and the full suite re-ran PASS.
- Housekeeping in the same PR: `witness_gantt_edit_undo.js` was broken on stock main since #1240
  (`_tmResyncAfterRetime` undefined in its sandbox — verified pre-existing before touching it); stub
  added, 9/9 Duplex + 9/9 Terminal again. `sw.js` v957→v958 (#1242 did v956→v957) — same-commit bumps.

**Reference note:** user-recorded `~/Videos/demo4D.mp4` (225s, Hospital on GH Pages) reviewed once for
defect reference per the one-look rule — it shows the PRE-#1239 deployed build (v956 signatures), so
its day-1 trucks/early-walls symptoms are already fixed on main but not yet deployed; all verification
this session was §-log/numeric, no visual proof used.

**OPEN after this session (unchanged elsewhere):** §GANTT_REFOLD_HANG write-loop chunking (still the
standing hang, untouched here); pre-construction phase unmodeled; boq_charts.html fourth scheduler
redirect; docs/4D5DAnalysis.md stale; support-predicate consolidation across the 4 copies (partially
mooted for schedule_gate.js internals by the DAG work, but the tm.js/boq copies still stand).

## 2026-08-08 — §GANTT_STALE_CACHE ✅ FIXED (PR bim-ootb#1257, auto-merge armed) + NEW live finding §TM_GEO_ORDER_CYCLES (Terminal, NOT fixed — next task)

**User: "why it still twice load timeline?" — answered from their own pasted Terminal log (v969) and
fixed same session.** §GANTT_SINGLE_LOAD (#1237) fixed the COLD path only. The live log was a WARM
open: `§GANTT_CACHE_HIT ops=48428` served cached ops, but bar editability is a DB JOIN
(tasks/task_elements — `buildTaskIndex`), NOT an op field, and the DB is re-fetched schedule-less
every session → `§GANTT_BAR_IDENTITY schedule=none editable=0` → `§GANTT_AUTO_GENERATE` →
`§TM_REFOLD` discarded the whole cached pass and re-ran the full chain. **Recurred every warm open**,
not once. Fix (PR #1257): `_activateAsync`'s cache branch applies #1237's own guard — no
`activeSchedule` in the DB ⇒ cache stale by construction ⇒ `§GANTT_STALE_CACHE`, drop cache, take
the single-pass cold path. Witness: `witness_gantt_single_load.js` scenario B (same-context reload =
real next-session open), RED reproduced the exact live signature (cacheHit=1 autogen=1 refold=1
editable=0), GREEN after (stale=1 cacheHit=0 prematerialize=1 injected=1 autogen=0 refold=0
editable=35); scenario A unchanged. sw.js v969→v970 (⚠ first commit's "v958→v959" claim was wrong —
base was already v969, sed matched nothing, bump landed in the follow-up commit; PR body corrected).
**Residual: one cold-cost pass per session per building remains BY DESIGN until the authored schedule
persists in the DB — the still-open persist-into-Lock / §SCHEDULE_JSON_PERSIST decision is now the
blocking item for true warm-open reuse.**

**§TM_GEO_ORDER_CYCLES — NEW, from the same live log, NOT fixed (next task for this lane):** on the
tm.js `injectGantt()` pass (real load-path promotion, `§GANTT_OVERRIDE 60 slabs`, storey-Z
reassignment 33,848), Terminal live shows `§SUPPORT_CYCLE cycles=24353` + `§DEQ_REPAIR shifted=251`
+ `§SUPPORT_CHECK floating=33/48428` — while the schedule_author pass IN THE SAME LOG (same building,
same session, edges 348,882 vs tm's 348,866) shows cycles=0/shifted=0. Facts to carry, don't
re-derive: (a) the `§SUPPORT_CYCLE` count is the KAHN LEFTOVER count (cycle members + everything
downstream), not the number of cycles — one small cycle low in the structure strands half the
building into seq-order fallback; (b) the delta between passes is the PROMOTION PATTERN (tm's
load-path seed=44 + M4=16 vs author-side), 16 edges difference; (c) Hospital live is clean
(floating=0/63182, witnessed again in the #1257 run), so this is Terminal-geometry-specific —
likely the predicted 3-cycle class (wall hangs from structure S1, wall bears promoted P2, P2
below-supports S1) that #1244's 2-cycle wall-bears-carrier clause does not cover; (d) the user SAW
the 33 floaters live ("some stuff hanging first... we can forgive") — forgiven by the user, NOT by
this lane's own zero bar. **Next task: reproduce headlessly with tm.js's REAL promotion**
(`_buildXrayElements` on Terminal, or slice injectGantt's own element build), witness-first —
witness must assert leftover=0 AND floating=0 on Terminal under load-path promotion, RED first with
the 24,353, then generalize the antisymmetry rule (candidate: no pool member may hang from any
structure it transitively bears — or break the specific 3-cycle by the same class-scoped method).

## 2026-08-08 — §4D_NOGEO root cause traced: the 233 are real IFC aggregate-parent shells with NO own mesh, geometry lives in their children — extractor gap, not a viewer bug, fix = compose from children (never invent)

User pushback on §4D_NOGEO ("I thot there are hard no fallback fails outright") led to tracing why
233 Hospital elements have no `element_transforms` row at all (`viewer/time_machine.js:noGeo`,
bim-ootb PR #1239 origin — confirmed still live on `origin/main` d98faa9, this session's local
`~/bim-ootb` checkout was 97 commits stale and briefly gave a false "not found"). Class breakdown,
queried directly off `Hospital_meta.db`/`Hospital_extracted.db`:

| ifc_class      | discipline | count |
|-----------------|------------|-------|
| IfcCurtainWall  | ARC        | 178   |
| IfcStair        | ARC        | 30    |
| IfcRoof         | ARC        | 24    |
| IfcStair        | STR        | 1     |

**Traced 3 real GUIDs (one per class) straight into `internal/UNMERGED/Hospital_IFC4_ARC.ifc` via
ifcopenshell — root cause confirmed, not hypothesized:**
```
IfcCurtainWall 2HaS6zNOX8xOGjmaNi_r6T  Representation=None  ObjectPlacement=real
  IsDecomposedBy → IfcPlate 2HaS6zNOX8xOGjmaNi_r6S (real geometry, already extracted)
IfcStair 1wrNt7GW19tOpUaBTGwvsc  Representation=None  ObjectPlacement=real
  IsDecomposedBy → IfcStair 1wrNt7GW19tOpUaBLGwvsc + 2×IfcRailing (all 3 real geometry, already extracted)
IfcRoof 2wV7MXoU9CUuWvtM7XEk_5  Representation=None  ObjectPlacement=real
  IsDecomposedBy → IfcSlab 2wV7MXoU9CUuWvtMFXEk_5 (real geometry, already extracted)
```
All three children queried back out of `Hospital_meta.db.element_transforms` with real, non-zero
center/bbox. **These 233 are IFC aggregate-parent containers** (standard IFC authoring for curtain
walls/multi-flight stairs/roofs: the parent is a logical grouping object with a real placement but
no mesh of its own; its actual geometry is authored entirely on its `IfcRelAggregates` children) —
not a missed-mapped-item extractor bug as first guessed, and not placement-less source data either
(`ObjectPlacement` is present and real on all three).

**Checked all 3 current extraction code paths for how the 233 got an `elements_meta` row with no
`element_transforms` row** (`tools/extract.py`, `DAGCompiler/python/extractIFCtoDB.py
extract_reference` §S172 iterator, `scripts/topup_extracted_db.py`): every one of them writes
`elements_meta` and `element_transforms` in the SAME insert / same try-block, and every exception
path skips both together — none of the three, as currently written, can produce a meta-only row.
`bbox_from_placement()` (`extractIFCtoDB.py:464`) is a deliberate banned stub that always raises
("parametric box generation is a no-invent violation") — confirms the pipeline is already hardened
against inventing a synthetic bbox here; it is NOT the source of the gap. Exactly which pass wrote
the meta-only row historically is still open (not blocking the fix direction) — flagging so a future
session doesn't re-assume one of these 3 paths is guilty without re-checking.

**Fix direction, per the earlier (b) call — find real geometry, don't hard-fail:** for any element
with `Representation=None` but real `IsDecomposedBy` children, compose its `element_transforms` row
as the union bbox of its children's ALREADY-EXTRACTED real transforms (center = midpoint of the
union AABB, bbox = union AABB extent). This is EXTRACT/COMPILE, not invent — it's a deterministic
composition over already-extracted real facts (same doctrine as [[BOM PRINCIPLE]]: a parent's
envelope from its real children is a legitimate recursive rollup). Kills the need for
`time_machine.js`'s `§4D_NOGEO` synthetic-project-end park for these 233 outright — they'd get a
real position and re-enter the support-gated schedule/audit like everything else.

**⚠ SUPERSEDED same session — user correction: "my cardinal rule is not to change source DB. Such
extra metadata has to be one time processed and stored IndexDB and when saved locally goes along with
it."** The extractor-pipeline approach above was reverted (`git checkout --
DAGCompiler/python/extractIFCtoDB.py`, clean) — it would have required a full `pipeline_library.sh
Hospital` rerun + OCI-redistributing the 263MB served binary just to fix 233 rows, and it mutates the
shipped DB, which is off-limits. Re-read against CLAUDE.md's own already-documented doctrine (`DB
CHANGES = MIGRATION SCRIPT + SELF-HEAL LOADER`) — this is exactly the case that section describes: an
incremental fix to an already-distributed building DB goes via the patch+self-heal-loader convention,
not a binary rebuild. bim-ootb already has the exact mechanism live: `viewer/scene.js
A._applyPendingPatch()` fetches `buildings/patches/<dbFile>.sql` and runs it against the in-memory
sql.js buffer on every load (idempotent, `INSERT OR IGNORE`/`DELETE`-then-`INSERT`) — the served .db
file on disk/OCI is NEVER touched, only the patched in-memory copy the viewer actually uses. Once
loaded, kernel_ops.js's existing whole-DB `_persistToIdb` already caches that live (patched) buffer
into IndexedDB (`bim_ootb_cache`) on save — so "process once, IndexedDB, rides along on local save"
falls out of infrastructure that already exists; no new IndexedDB code was needed.

**✅ DONE this way instead, witnessed on the REAL served DB (not a synthetic copy):** generated 233
`INSERT OR IGNORE INTO element_transforms (...)` statements — center/bbox = union AABB of each
parent's real `IsDecomposedBy` children, read directly from `viewer/buildings/Hospital_extracted.db`'s
OWN already-extracted `element_transforms` rows (no re-tessellation; the parent→child mapping came
from the real source IFC — `rel_aggregates` isn't in this older-vintage served DB, so IFC was the only
place that relationship still existed; the geometry numbers themselves came from the DB, not the IFC).
Appended to the existing patch files (both copies stay byte-identical, as they were before):
`buildings/patches/Hospital_extracted.db.sql` and `viewer/buildings/patches/Hospital_extracted.db.sql`
(226,962 → 253,924 bytes, +233 lines). **Verified against a scratch copy of the ACTUAL served file**
(`/home/red1/bim-ootb/viewer/buildings/Hospital_extracted.db`, matching the `served_db.object` path
named in the file's own `.manifest.json` provenance record): applied the FULL patch (pre-existing
walkable-raster rows + the new 233) in one `sqlite3 < patch.sql` shot — exit 0, all 7 raster rows
intact, **0 remaining elements anywhere in the DB without a transform** (was 233; confirms 233 was the
whole gap, not a sample). No `time_machine.js`/`schedule_author.js` code change was needed at all —
`noGeo` is already computed from a `LEFT JOIN element_transforms` COALESCE-to-zero, so once the patch
supplies a real row, the existing logic stops classifying these elements as `noGeo` on its own.

Work happened in a fresh worktree off `origin/main` (`/tmp/wt-4d-nogeo-compose`,
`fix/4d-nogeo-compose-indexeddb`) per this repo's worktree-hygiene rule — `~/bim-ootb`'s main checkout
was 97 commits stale with unrelated uncommitted changes sitting in it, unsafe to edit directly.

**⚠ SUPERSEDED again, same day (2026-08-09) — user: "why OCI? DB is to remain intact as much as can,
push code snips to be injected for any IFC."** The value-patch above (233 precomputed center/bbox
floats, Hospital-only) worked but wasn't reusable — Terminal/Duplex would each need the same manual
"trace GUIDs from source IFC" exercise repeated by hand. Checked and confirmed: **every currently
shipped building DB lacks `rel_aggregates`** (all 26 local files, not just Hospital) — it's a
pipeline-vintage gap, not a Hospital quirk; `extractIFCtoDB.py` already writes it for any *current*
extraction (untouched by the earlier revert). Also confirmed per-building ghost counts DON'T carry
over: **Hospital 233, Duplex 3 (2×IfcStair+1×IfcRoof), Terminal 0** (Terminal's separate
§TM_GEO_ORDER_CYCLES problem below is NOT a NOGEO gap — good to have that distinction hard-confirmed).

**✅ DONE this way instead — generic code, not a per-building value patch (commit `5542d0f`,
`fix/4d-nogeo-compose-indexeddb`):**
1. **`A.composeGhostsFromAggregates(db)` in `viewer/scene.js`**, next to `_applyPendingPatch()` —
   the SAME ~25-line union-AABB logic already proven in `import_worker.js`'s `§4D_NOGEO_COMPOSE`,
   ported from import-time to **load-time**, so every already-shipped building gets it too, not just
   fresh drops. Wired into both `streaming.js` load paths (meta.db split-load line ~1988, full
   single-DB load line ~2134) — one function, every building, no per-building code. Operates on the
   in-memory sql.js instance only; never writes back to the fetched buffer or the served file/OCI.
   Fixpoint over passes (multi-level aggregates). Guards ported verbatim from `import_worker.js`:
   only touches guids with no existing transform row (structurally true — the ghost set comes from a
   `LEFT JOIN ... WHERE t.guid IS NULL` — `INSERT OR IGNORE` besides, so real data is never
   overwritable even in principle); a ghost with zero resolvable geometric children stays a ghost and
   is **named** in a `§NOGEO_COMPOSE_UNRESOLVED` log (count + class breakdown) — never a silent fall
   to `time_machine.js`'s `§4D_NOGEO` project-end park.
2. **Per-building patches shrink to relationship-only** — `buildings/patches/*.sql` now ships just
   the real `IfcRelAggregates` parent→child GUID pairs (Hospital: 9,457 rows/233 parents — large
   curtain walls really do have 37–212 member/plate children each, verified against the source IFC,
   not a bug; Duplex: 11 rows/3 parents), no computed geometry at all. `A.composeGhostsFromAggregates`
   does the actual math live from data already in `element_transforms`. Any building extracted via
   the current pipeline from now on needs **zero patch** — `rel_aggregates` is already in its output.

**Verified end-to-end with `sql.js` in Node — the actual runtime engine, not a stand-in** — ran the
committed function against scratch copies of the REAL served DBs with the REAL patch files applied
(same as `_applyPendingPatch` would): Hospital 233→0, Duplex 3→0, Terminal 0→0 (correct no-op — it
was already clean). **Confirmed the served files on disk are byte-identical before/after** (buffer
diff = 0) — the cardinal constraint holds. Separately, a synthetic guard test (a ghost with a
`rel_aggregates` row pointing at a child that has no transform of its own) confirms an unresolvable
ghost stays absent from `element_transforms` **and** shows up in `§NOGEO_COMPOSE_UNRESOLVED` — not
silently dropped.

**Scope, stated explicitly per user instruction — do not over-claim:** this closes the **NOGEO class
only** (missing-transform aggregate-parent elements: 233 on Hospital, 3 on Duplex, 0 on Terminal).
It does **NOT** touch **§TM_GEO_ORDER_CYCLES** (Terminal, `cycles=24353`, `floating=33/48428` — a
genuine support-DAG cycle under `tm.js`'s load-path promotion; separate root cause, still open, next
task per the entry above). Report as "NOGEO class closed," never "floating solved."

**Still open:** (1) commit not yet pushed/PR'd — cross-repo (bim-ootb) commit from a bim-compiler
session, confirming with user first; (2) OCI-upload of the relationship-only patch files — smaller
than before but still a production-facing action per `deploy/OCI_UPLOAD.md`, needs its own explicit
go; (3) not run through a live browser end-to-end (Node/sql.js verification only — see above); (4)
§TM_GEO_ORDER_CYCLES itself, unrelated to this fix, still the next task.

**⚠ Consolidated further, same day — user: "one script, one trigger."** Two implementations
existed (`import_worker.js` at import time, `scene.js` at OCI-load time) — redundant. Checked, not
assumed: `streaming.js` routes an OCI sample, a fresh drop-your-own-IFC import, AND a reopened
`bim_ootb_imports` building through the exact same two `A.db = new SQL.Database(...)` sites
(`import://` URLs resolve via `A.cachedFetch` to the SAME construction — traced the code, not
guessed). So `scene.js`'s load-time function already covered every case; `import_worker.js`'s copy
was pure duplication — **reverted** back to its pre-fix state (commit `c4cdea5`).

`composeGhostsFromAggregates()` now handles both relationship-table shapes it might encounter,
since the two DB-building paths don't share one schema: `rel_aggregates(parent_guid,child_guid)`
(server-side `extractIFCtoDB.py`, AGGREGATES-only) or `bom_tree(parent_guid,child_guid,rel_type)`
(client-side `import_worker.js` §S267, mixed VOIDS/FILLS/AGGREGATES — filtered to
`rel_type='AGGREGATES'` here so a door-fills-opening relation is never mistaken for aggregation).
One compose algorithm, one copy, reading whichever table is present.

**Added provenance, not just a log line:** composed rows now carry `transform_source=
'composed_aggregate'` — `ALTER TABLE element_transforms ADD COLUMN transform_source TEXT` runs
in-memory, guarded (try/catch — no currently-shipped DB or the fresh-import schema in
`import_db_builder.js` has the column yet, checked both). Matches the project's own existing
convention (`extractIFCtoDB.py`'s `'void_anchor'` rows) — six months from now, "is this position
real or composed" is a column query, not a memory of a console log.

**Re-verified with `sql.js` in Node after the redesign:** Hospital 233→0, Duplex 3→0, Terminal 0→0
(same real served-DB copies + real relationship patches as before; `transform_source` breakdown
confirms the split — e.g. Hospital `[null: 63182, 'composed_aggregate': 233]`; served files on disk
still byte-unchanged). New: a synthetic test using `import_db_builder.js`'s EXACT fresh-import
schema (`bom_tree`, no `transform_source` column) confirms a `CW1→PLATE1` `AGGREGATES` pair composes
correctly, and a sibling `OPENING1→DOOR1` `FILLS` pair (present in the same table, different
`rel_type`) correctly does NOT get composed and shows up named in `§NOGEO_COMPOSE_UNRESOLVED` —
confirms the relation-type filter is doing its job, not just present in the SQL text.

**⚠ Two open items closed for real, same day — user: "confirm two things yourself... local test
parity with OCI... a real end-to-end live-browser check, not just Node/sql.js."** Right call — the
live-browser check caught a real bug the Node tests missed.

**1. Local-vs-OCI parity, checked directly (not assumed):** the local `Hospital_extracted.db` this
session had been testing against is NOT byte-identical to the live OCI object (263,307,264 bytes,
etag `b95cabb6-141f-46a0-a1eb-3f18910ae199`, confirmed live via a real HEAD request, matching
exactly). Downloaded the actual live object and diffed content (not just file bytes) against the
local copy: the only differences are (a) two tables the local copy is missing entirely —
`spatial_structure` + `rel_contained_in_space` — accounting for exactly 647,168 of the 647,168-byte
size delta (158 pages × 4096), and (b) a `material_name` "≈ colorname" backfill present on 6,664
`elements_meta` rows live but empty locally. **Neither touches anything this fix depends on** —
`elements_meta.guid/ifc_class/storey/discipline` and all of `element_transforms` diffed byte-for-byte
identical between local and live; `rel_aggregates` confirmed absent on both. Re-ran the fix directly
against the freshly-downloaded live bytes as a second, independent confirmation (not just "should be
equivalent") — same 233→0 result.

**2. Real browser check — found and fixed a genuine bug Node/sql.js testing could not have caught:**
a live headless-Chromium run (Puppeteer, `§`-tagged console capture only — no screenshots, per this
project's hardened no-visual-proof rule) against Hospital served through the real path threw
`§PATCH_APPLY_FAIL ... memory access out of bounds` applying the ~9,465-statement relationship patch.
Root cause: `viewer/lib/sql-wasm.wasm` (the WASM binary the app actually bundles and ships) is a
**completely different build** from the npm `sql.js` package used in every earlier Node
verification this session (different byte size, different md5 — confirmed) — the earlier "verified
with sql.js, the actual runtime engine" claims were wrong on that specific point; npm's sql.js is
NOT the runtime engine, it only looks like it. Reproduced the crash directly against the real
bundled binary in Node (bypassing Puppeteer for fast iteration), isolated it to one giant
`pdb.run()` call over the whole multi-thousand-statement patch, and fixed `_applyPendingPatch()`
itself (not just this one patch) to run in ~500-statement line-batches — every patch line, old and
new, is one complete statement by convention, so batching by line never cuts a statement. Small
pre-existing patches (a handful of lines) are unaffected — still one batch, unchanged behavior.

Re-verified end to end, for real: real bundled WASM in Node against Hospital `_meta.db` (the actual
file Hospital's split-load uses — confirmed the earlier `Hospital_extracted.db` patch was for a code
path Hospital never even exercises at runtime), `_extracted.db`, Duplex `_extracted.db`, and the
literal live-OCI-downloaded bytes — all four apply clean now. Then the full real-browser witness,
rerun after the fix: `§PATCH_APPLY Hospital_meta.db applied (... 9473 statements, 19 chunk(s))`,
`§NOGEO_COMPOSE composed=233`, no `§NOGEO_COMPOSE_UNRESOLVED`, `§DB_META_LOADED`, `§CENTRES_RESULT
rows=1 first=["Hospital",63415,...]` — every line printed for real, in an actual browser, not
simulated. Duplex confirmed separately (`composed=3`, 1 chunk, `§CENTRES_RESULT ...1122` elements).

Noted, unrelated: 5 identical `TypeError: Cannot read properties of undefined (reading
'RoundingMode')` page errors on every load — traced to `roundingMode`-using ERP/finance modules
(`proj_claim.js`/`vo_fold.js`/`proj_fold.js`/`whatif.js`/`proj_control.js`, none touched this
session), pre-existing, environment/Chromium-version related, does not block DB load or the compose
fix. Flagging rather than silently dropping it — not investigated further, out of scope here.

**Commits on `fix/4d-nogeo-compose-indexeddb`:** `1fcefa6` (superseded) → `cb2f136` (superseded) →
`5542d0f` → `c4cdea5` → `8d8fff4` (the chunk fix). Still not pushed — cross-repo confirmation still
wanted before push + OCI upload, per standing practice this session.

**⚠ Watchdog review, same day — 4 points raised, all checked with real re-runs, not assumed:**

1. **Biggest one, correctness: does the composed data actually reach the schedule/support-order
   graph, or just rendering/BOM?** `tests/witness_geometric_support_order.js` (the source of the
   earlier "floating=0/63415" claim) reads `deploy/buildings/*.db` DIRECTLY via `sqlite3` CLI —
   bypasses `_applyPendingPatch`/`composeGhostsFromAggregates` entirely, so that earlier PASS was
   computed with all 233/3 ghosts sitting at `COALESCE(...,0)` — a degenerate zero-bbox point at
   world origin, invisible to `auditFloating` by construction, not proof the composed geometry is
   safe. Built REAL composed copies (real patch + real `composeGhostsFromAggregates`, same function,
   not a reimplementation) of Hospital and Duplex, pointed the witness's own
   `ScheduleGate.computeSchedule`/`auditFloating` at them: **floating=0/63415 (Hospital),
   floating=0/1122 (Duplex), shifted=0, cycles=0 on both** — same zero as before, but now with the
   233+3 elements REALLY in the graph (`§GEO_ORDER` edge count rose, Duplex 5366→5406 — proof they're
   participating, not just present and inert). This was the one open correctness question and it's
   closed with a re-run, not "the mechanism should just work."
2. **`_applyPendingPatch`'s chunking is generic — checked the OTHER patches, not just this fix's.**
   Two pre-existing patches (`Terminal_extracted.db.sql`/`Terminal_meta.db.sql`) have a multi-line
   `CREATE TABLE spatial_structure (...)` spanning 2-3 lines — a naive 500-RAW-LINE batch could in
   principle cut it in half. Checked directly: it sits at lines 8-13, nowhere near a chunk boundary
   today, so nothing was actually broken — but that was file-layout luck, not a property of the
   code. Fixed properly: batching is now statement-aware (accumulate lines until one ends in `;`,
   batch ~500 statements), so a multi-line statement always stays whole regardless of where it
   lands. Verified against the real bundled WASM: the multi-line CREATE TABLE parses whole and runs
   standalone; Hospital/Terminal/Duplex patches all still apply clean.
3. **`composeGhostsFromAggregates()` runs on every load, including Terminal's zero-ghost case — is
   that a real cost?** Measured, not asserted: ~30-60ms for the LEFT JOIN ghost-scan alone
   (Terminal's 48,428-row `elements_meta`), 163ms end-to-end composing Hospital's 233 — both
   negligible against the multi-second DB fetch/parse this runs alongside. Added a `§NOGEO_COMPOSE`
   / `§NOGEO_COMPOSE_SKIP` elapsed-ms log either way, so this stays a checkable number going
   forward, not a re-derived guess.
4. **Shared-tree conflict risk** — checked, not assumed: `origin/main` advanced 5 commits since this
   worktree forked; only one touches `viewer/streaming.js` (an unrelated `TRIPLANAR_MAT` material
   table edit, zero line overlap with this fix's two call sites) and **none** touch `viewer/scene.js`.
   Low conflict risk, confirmed by diffing the actual commit, not by hoping.

Final commit on the branch: `a268f05`. Re-ran the full real-browser witness one more time after all
four fixes — still 4/4 PASS, `§PATCH_APPLY (9466 statements)`, `§NOGEO_COMPOSE composed=233 ms=163`.
Still not pushed.

**🏁 SHIPPED TO PRODUCTION (2026-08-10) — the NOGEO class is closed, for real, verified against the
live site.** User: "proceed to upload path."

**Discovered before touching anything:** production code (`viewer/*.js`) is NOT served by
`deploy/OCI_UPLOAD.md`'s documented `bim-ootb-live` OCI bucket route — that route's local mirror
(`bim-compiler/deploy/dev/`) has drifted significantly stale (missing whole features present in
`bim-ootb/viewer/`, confirmed by diff) and appears abandoned. The REAL, current code deploy is
**GitHub Pages, auto-built from `main` on every push** (`https://red1oon.github.io/bim-ootb/`) — this
matches this session's own `reference_gh_deploy.md` memory, which should have been checked first
rather than rediscovered from scratch. Buildings + patches remain OCI (`bim-ootb` bucket), via the
mandatory `scripts/oci_patch_gate.js` (`deploy/OCI_UPLOAD.md` §RULES rule 6 — never by hand).

This mattered for ORDERING: uploading the patch before the code fix went live would have crashed
any real user opening Hospital — the pre-fix `_applyPendingPatch()` still does one giant
`pdb.run()` and would hit the exact WASM crash found earlier this session. Sequence followed:

1. Pushed `fix/4d-nogeo-compose-indexeddb`, opened PR bim-ootb#1263. CI green (`fast-checks`,
   `e2e-tests`). Squash-merged → `a081480` on `main`.
2. Confirmed GH Pages actually rebuilt (`pages-build-deployment` run succeeded for `a081480`) and
   fetched the LIVE `scene.js` from `red1oon.github.io/bim-ootb/viewer/scene.js` — confirmed
   `composeGhostsFromAggregates`/`composed_aggregate` present in the served bytes. Code confirmed
   live before touching OCI, not assumed.
3. Per this project's squash-merge worktree rule, started a FRESH worktree off `origin/main`
   (old branch worktree can't be reused post-squash) and ran `scripts/oci_patch_gate.js` for all
   three patches — each one downloads the ACTUAL live served bytes itself, applies the patch,
   verifies (`rel_aggregates` row/parent counts match exactly: Hospital 9457/233, Duplex 11/3)
   before allowing upload. All three: `§GATE_VERDICT PASS` → `--upload` → `§GATE_VERDICT
   UPLOAD_VERIFIED`. `Hospital_meta.db` confirmed served gzipped on OCI — gate handled it
   correctly, matches the split-load path this fix targets.
4. **Final end-to-end proof, the real thing, not a stand-in:** ran the real-browser witness against
   the actual production URL — `https://red1oon.github.io/bim-ootb/viewer/viewer.html?db=<live OCI
   Hospital URL>`, real internet fetch, no localhost, no simulation. `§PATCH_APPLY` (19 chunks),
   `§NOGEO_COMPOSE composed=233 ms=171`, no `§NOGEO_COMPOSE_UNRESOLVED`, `§DB_META_LOADED` — **4/4
   PASS on production itself.**

Worktrees pruned (`fix/4d-nogeo-compose-indexeddb` merged+deleted, `wt-oci-patch-upload` removed)
per this repo's worktree-hygiene rule.

**NEW finding, unrelated to NOGEO, flagged not investigated:** user, watching Hospital: multiple
trucks appear "way onset" (very early) and near-concurrently rather than staggered — a 4D
scheduling-realism gap (construction vehicle/delivery placement bunching), separate from both NOGEO
and §TM_GEO_ORDER_CYCLES. Likely lives in the crew-cap / trade-scheduling logic (`schedule_gate.js`),
not the support-order gate. Not root-caused this session — next session should trace it with real
§-log evidence (per this file's own numeric-proof standard) before proposing a fix.

**✅ Second front, same session — user: "users drop their IFCs too, we have to do so likewise."**
The patch above only fixes the pre-shipped Hospital/Terminal/Duplex buildings. A user-dropped IFC
(Viewer's "drop your own IFC" flow, `viewer/import_worker.js`) hits the identical gap — worse, even:
it was already self-documented in-code as **`§GHOST_ADMISSION`** (line ~621, "elements without
geometry are BOM containers (IfcCurtainWall, IfcStair)... don't write them to elements_meta") —
same defect, dropped from meta entirely rather than just missing a transform.

Fixed directly in `import_worker.js`, ahead of the existing ghost-admission split: every import
already collects `bomTree` (§S267, walks `IfcRelAggregates` parent→child into memory — no new IFC
pass needed) and `transforms` (every geometry-bearing element's real center/bbox, from the SAME
pass). Composition is therefore a pure in-memory lookup over data the worker was already computing
— for each still-geometry-less element, union its `AGGREGATES` children's real transforms, and only
if none resolve does it stay a true ghost. New `transforms` entries feed straight into the existing
unit-autoscale/georef-rebase pass right after (untouched — it already iterates the whole `transforms`
array), so composed elements land in the same corrected coordinate frame as everything else with zero
extra plumbing. **No new IndexedDB code, no new store** — `import.js`'s existing `bim_ootb_imports`
save path (and, once opened, `kernel_ops.js`'s existing whole-DB `_persistToIdb`) already captures
whatever this worker returns; composed elements simply ride along in `result.elements`/
`result.transforms` like any other element. Runs inside the existing Worker (`self.onmessage`, off
the main thread already) — negligible added cost (one map-lookup pass over the small ghost subset,
against a pass that's already tessellating tens of thousands of meshes).

Verified the exact added math (not the full browser pipeline — see below) against real, previously
SQL-verified Hospital children data in an isolated Node script: single-child curtain wall composes
to its child's own bbox bit-for-bit (mod float64 rounding), 3-child stair unions correctly (bbox
larger than any single child in each axis, as a union must be). `node --check import_worker.js`
clean. **Not run end-to-end through the real browser worker this session** (Hospital's 77MB ARC file
is too slow for a quick Puppeteer witness like `tests/morpheus_import_live.js`'s small fixture) — the
math is proven, the wiring is proven by inspection (same `transforms.push()` shape as every other
element), but nobody has watched `§4D_NOGEO_COMPOSE` actually print from a live drop yet. Flagging
so a future session doesn't assume that's been done — reuse `tests/morpheus_import_live.js`'s harness
with a curtain-wall/stair-bearing IFC to close that gap.

**User: "perhaps Modeller already has it — unify, or maybe not, users have separate usage."**
Checked: **Modeller doesn't need a separate fix — it already shares this exact file.**
`modeller/str_walker_outliner.js:249` does `new Worker(new URL('../viewer/import_worker.js?v=8', ...))`
— literally the same worker, same code path, same comment at line 206 confirming intent: "Reuses the
Viewer's OWN parse engine." One edit, both apps fixed; no unify-vs-separate call was actually needed
because the two were never forked apart for import/extraction in the first place. Worth remembering
for next time this class of question comes up: **`viewer/import_worker.js` is the one shared
IFC-parse engine for BOTH apps** — a gap found via one app's drop-IFC flow is very likely present (and
fixed) in the other's too, check here first before assuming separate work is needed.

## 2026-08-10 — §NOGEO_COMPOSE — load-time fix DONE+verified, PUSH-TO-ZERO checklist for the root-fix lane

```
# ⚠ DO NOT REMOVE
SCOPE: this section is a WORK-TO-ZERO checklist (CLAUDE.md §WORK-TO-ZERO) for the §NOGEO ghost-position
lane. Work items top-to-bottom. Mark ✅ DONE (witness) or ⛔ BLOCKED: <question> — never leave one
"parked" silently. Read the whole section before touching anything; it supersedes nothing above, it
closes the loop the §GEOMETRIC_SUPPORT_ORDER / §TM_GEO_ORDER_CYCLES sections opened.
```

**Doctrine this lane runs on (read before editing):** `CLAUDE.md` PRIME RULE (extract or compile only,
never invent) · `DB CHANGES = MIGRATION SCRIPT + SELF-HEAL LOADER` section (two categories — a small SQL
patch+loader for schema/relationship facts, vs. a full rebuilt binary via OCI for anything not
reproducible from a short script) · `deploy/OCI_UPLOAD.md §RULES` (content-type headers, mandatory) ·
Sacred Files (binary `.db` commits banned EXCEPT the explicit `.gitignore` carve-outs already in place
for a handful of small Modeller sample DBs — `modeller/Duplex_extracted.db`, `SampleCastle_extracted.db`,
`SampleHouse_extracted.db`, `Terminal_meta.db`, `Terminal_geo.db` — do not add new ones without the same
deliberate exception) · Worktree Hygiene (this lane lived entirely in `/tmp/wt-4d-nogeo-compose`, prune
once merged).

**Floating-items awareness — do not conflate the two open floating issues:**
1. **§NOGEO ghost class (this section)** — elements with NO `element_transforms` row at all (233
   Hospital / 3 Duplex / 41 HHS_Office_Federated, confirmed — see below), silently parked at project-end
   with a synthetic timestamp by `time_machine.js`'s old `§4D_NOGEO` fallback, invisible to
   `ScheduleGate.auditFloating`'s own denominator. Root cause: `IfcCurtainWall`/`IfcStair`/`IfcRoof`
   containers legitimately authored `Representation=None` in the source IFC — real geometry lives on
   `IfcRelAggregates` children. Not an extractor bug, not invented data — confirmed by reading
   `extractIFCtoDB.py:2537` (`ifc_file.by_type("IfcRelAggregates")`, literal `GlobalId` pairs).
2. **§TM_GEO_ORDER_CYCLES (Terminal, separate, still open, untouched by this lane)** — a genuine
   support-DAG cycle under `tm.js`'s load-path promotion pattern, `cycles=24353` Kahn leftovers,
   `floating=33/48428`. Different root cause, different fix. Do not close this section and think that
   one is also solved — it isn't, it needs its own task.

**What's DONE (load-time compose lane, `/tmp/wt-4d-nogeo-compose`, branch `fix/4d-nogeo-compose-indexeddb`,
commits `1fcefa6`..`a268f05`, watchdog-reverified at every step, not taken on faith):**
- ✅ One shared `A.composeGhostsFromAggregates(db)` in `scene.js`, called at DB-open time via BOTH
  `streaming.js` load-path call sites (confirmed the only two `A.db = new SQL.Database(...)` sites in
  the file) — covers OCI sample loads, fresh imports, and IndexedDB-reopened buildings uniformly, one
  algorithm, not per-source special-casing. `import_worker.js`'s separate import-time copy reverted
  (was pure duplication once this existed).
- ✅ Handles both relationship-table shapes: `rel_aggregates` (server extraction) and `bom_tree` filtered
  to `rel_type='AGGREGATES'` (browser import) — isolation-tested against a sibling `VOIDS` (door-fills-
  opening) relation with a REAL transform on the child, confirmed it does not leak into compose.
- ✅ `transform_source='composed_aggregate'` marks every composed row (reuses this project's existing
  `void_anchor` provenance convention, `extractIFCtoDB.py:189`) — a derived value never looks like a
  literal extracted fact.
- ✅ Never mutates the served file — in-memory only, verified structurally (no `db.export()` write-back
  in the compose path) and verified numerically (served file byte-unchanged before/after every test run).
- ✅ `_applyPendingPatch()` batching fix (`§PATCH_CHUNK`) — a real, would-have-shipped-broken bug: a
  single `pdb.run()` over a 9,465-statement patch crashes the project's ACTUAL bundled
  `viewer/lib/sql-wasm.wasm` ("memory access out of bounds") — a DIFFERENT WASM build from npm's
  `sql.js` (confirmed different md5/size), so Node-only testing structurally cannot catch this class of
  bug. Found only because a real headless-browser run was insisted on before push. Fixed with
  statement-aware chunking (not naive line-count), re-verified against the real bundled binary.
- ✅ The correctness question that mattered most — does the composed data actually reach the scheduler —
  re-verified with a real re-run of `ScheduleGate`'s support-order audit against composed copies (not
  the raw ghost-blind DBs the witness reads by default): `floating=0/63415` Hospital,
  `floating=0/1122` Duplex, edge counts genuinely rising (Duplex `5366→5406`), proving the 233/3
  composed elements are participating in the support DAG, not just present and inert.
- ✅ Perf logged, not assumed: `~30-60ms` zero-ghost scan, `~163ms` full Hospital compose.
- ✅ Merge-conflict risk checked directly: `origin/main` 5 commits ahead, only one touches
  `streaming.js` (unrelated), none touch `scene.js`. Low risk, confirmed not hoped.

**Push-to-zero checklist, work top-to-bottom:**

1. **✅ DONE (witness) — HHS_Office_Federated patched + LIVE on OCI** (see the 2026-08-10 second-session
   section at the end of this file; patch landed via bim-ootb#1265, upload `§GATE_VERDICT UPLOAD_VERIFIED`,
   production `§LIVE_WITNESS PASS composed=41`). Original note, kept for the record: found
   late in this lane's own review, not by the implementing session — **41 ghosts**, same class, never
   patched. Generate `buildings/patches/HHS_Office_Federated_extracted.db.sql` the same way as
   Hospital/Duplex (raw `rel_aggregates` rows only, no computed values) before this branch is
   considered complete. Do not push/PR/OCI-upload with only 2 of 3 known-affected buildings covered.
2. **✅ DONE (witness) — JKR has 0 ghosts, no patch needed; but the sweep found a FOURTH affected
   building, Clinic (43 ghosts, live, unpatched) — fixed in bim-ootb#1267.** Original note: check JKR (source `.db` not available in the local sandbox at review time).
   Query it the same way (`SELECT COUNT(*) FROM elements_meta m LEFT JOIN element_transforms t ON
   t.guid=m.guid WHERE t.guid IS NULL`) before calling the landed-DB scope closed.
3. **✅ DONE — pushed/PR'd/merged/uploaded** (HHS + Clinic; see the end-of-file section). Original note:
   push `fix/4d-nogeo-compose-indexeddb`, open the PR, OCI-upload all patch files
   (Hospital, Duplex, HHS_Office_Federated, +JKR if it needs one) per `deploy/OCI_UPLOAD.md §RULES`
   (content-type headers mandatory).
4. **Root-fix, next lane (bigger, do only after 1–3 are live and stable):** bake the compose logic into
   `extractIFCtoDB.py` itself so it runs ONCE at extraction time — every future extraction ships with
   zero ghosts from the start, no runtime patch/compose needed at all for anything freshly extracted.
   This is the fuller expression of "extract, don't invent," not a rule exception — the composed value
   is still 100% derived from real extracted facts, just computed once at write-time instead of every
   read-time.
   - **Precondition, verify before making this unconditional:** `IfcRelAggregates` is ALSO how IFC
     expresses the spatial-structure hierarchy (Building→Storey→elements), not only physical assemblies.
     Confirm `elements_meta` never carries `IfcBuildingStorey`/`IfcBuilding`/`IfcSite` rows before the
     extractor-side ghost-detection query runs unconditionally — composing a "position" for a storey is
     semantically wrong even if harmless, name it if found rather than silently composing it.
   - Source IFCs confirmed present: Duplex `~/bim-ootb/IFC/Duplex_ARC.ifc`; Hospital (federated,
     multi-discipline) `internal/UNMERGED/Hospital_IFC{2x3,4}_{ARC,STR,MECH,ELE,PLB,FIRE,SPR}.ifc` +
     `~/Downloads/Hospital 2.0.ifc`. HHS_Office_Federated's source not yet located — find it first.
   - Re-extract + republish fresh, complete DBs to OCI for whichever of Hospital/Duplex/
     HHS_Office_Federated/JKR need it — this is the FULL BINARY category per `CLAUDE.md`'s DB doctrine
     (not a migration script), same URL, needs a cache-bust (sw.js `CACHE_VERSION` bump) so clients
     don't keep serving stale cached bytes.
   - **Modeller check, only 2 of 4 buildings checked so far:** `modeller/Duplex_extracted.db` (git-
     tracked, confirmed already 0 ghosts — no action needed). Hospital — Modeller has no
     `Hospital_extracted.db` at all (only the unrelated `Hospital_ARC.db`), not affected. **Still
     open: `modeller/HHS_ARC.db` and any JKR Modeller copy — check the same ghost-count query before
     assuming they're clean.**
5. **Once the root-fix lands and republished DBs are live: retire the now-redundant relationship-only
   OCI patches** for whichever buildings got a fresh extraction (KISS — don't keep a special case once
   the general mechanism subsumes it, same principle §GEOMETRIC_SUPPORT_ORDER's own closeout used).

**Session end for this section = every numbered item above is ✅ or ⛔ named. Not "mostly done."**


### 2026-08-10 (later, second session) — push-to-zero items 1–3 ✅ SHIPPED; scope was WIDER than the list

```
# ⚠ DO NOT REMOVE
SCOPE: closes items 1-3 of the checklist above with witnesses, and corrects the checklist's own
premise: the "3 known-affected buildings" scope was incomplete. Read the log lines, not the prose.
Items 4-5 (extractor root-fix lane) remain OPEN, now with real preconditions measured.
```

**⚠ Two sessions worked this same checklist concurrently.** The other one shipped the HHS patch as
bim-ootb#1265; this one had derived it independently. **Both derivations are byte-identical on all
2120 `INSERT` rows** — a real cross-check of "extract, don't invent," not a coincidence to paper
over. The duplicate patch hunk was dropped (merge resolved to main's copy); what survived from this
side is the witness + everything below.

**1. ✅ DONE (witness) — HHS_Office_Federated, 41 ghosts → 0, LIVE on production.**
`41 = 33 IfcCurtainWall + 8 IfcStair`. 2120 real `IfcRelAggregates` pairs, extracted literally from
`internal/UNMERGED/opensourceBIM_HHS_Office_architect.ifc` (2096) + `_construction.ifc` (24); MEP
contributed none. Patch landed via #1265; **OCI upload done by this session** —
`scripts/oci_patch_gate.js … --upload` → `§GATE_VERDICT PASS` → `§GATE_VERDICT UPLOAD_VERIFIED`
(353,072 bytes, `application/sql`), manifest committed. Final proof is production itself, not a
stand-in: real GH-Pages viewer + real live OCI bytes, `§`-log capture only, no screenshots —
`§PATCH_APPLY … (352624 bytes, 2237 statements, 5 chunk(s))`, `§NOGEO_COMPOSE composed=41 ms=66`,
no `§NOGEO_COMPOSE_UNRESOLVED`, `§CENTRES_RESULT rows=1 … 6880` → `§LIVE_WITNESS PASS`.

**⚠ The upload had a landmine the checklist did not know about — the patch file exists TWICE and the
two copies are NOT the same file.** For HHS:
`buildings/patches/HHS_….sql` = raster(4) + rel_aggregates(2120), **no spatial_structure**;
`viewer/buildings/patches/HHS_….sql` = spatial_structure(109) + raster(4) + rel_aggregates(2120);
the object live on OCI before today = **spatial_structure(109) only** (28,838 bytes, 2026-07-12).
The 109 rows are byte-identical between the live object and the `viewer/` copy (diffed, not assumed)
— so uploading the ROOT copy, which is what Hospital/Duplex precedent does, would have **DELETED the
live ROOM_VIEWER_HHS001 room-accuracy fix** from the path real users take (`config.js PROD_BASE`;
the patch URL is derived from the DB URL's own directory, so OCI-served DB ⇒ OCI-served patch).
Uploaded the `viewer/` **superset** instead — additive-only, verified in the gate: `spatial_structure=109
raster=4 rel_aggregates=2120 parents=41`. **Rule for any future patch upload: diff BOTH repo copies
against the live object first; upload the superset, never assume the two copies match.** Peer session
was warned directly before it could upload the subset.

**2. ✅ DONE (witness) — JKR: 0 ghosts, no patch needed. But the checklist's building list was
incomplete: Clinic is a FOURTH affected building, and it had no patch of any kind.**
A local copy of JKR did exist (`~/bim-ootb/buildings/JKR_extracted.db`) — the "not available"
note was stale. Rather than check only JKR, swept the ghost query over **every** shipped DB:
```
Clinic_extracted.db / Clinic_meta.db   43   IfcCurtainWall:31 IfcRoof:7 IfcStair:4 IfcRamp:1   ← NEW, live, unpatched
HHS_Office_Federated_extracted.db      41   IfcCurtainWall:33 IfcStair:8
Hospital_extracted/_meta.db           233   IfcCurtainWall:178 IfcStair:31 IfcRoof:24
Duplex_extracted.db                     3   IfcStair:2 IfcRoof:1
LTU_AHouse_meta.db                    337   IfcWindow:204 IfcDoor:95 IfcStair:15 …            ← NEW, live, DIFFERENT class (below)
JKR / Terminal (all copies) / LTU_AHouse_extracted.db / warehouse_gardenworld      0
```
Clinic fixed the same way (PR bim-ootb#1267): **738 real pairs / 43 parents** from
`internal/UNMERGED/Clinic_Architectural_IFC2x3.ifc` (726) + `Clinic_Structural_IFC2x3.ifc` (12) —
Electrical/HVAC/Plumbing none. Note `~/Downloads/Clinic.ifc` is **NOT** the source (0 GUID matches);
the real source is the 5 `Clinic_*_IFC2x3.ifc` federated files. Confirmed against the **downloaded
live OCI `Clinic_meta.db`** (43 ghosts there too), not just the local copy: `43→0`.

**3. ✅ DONE — pushed, PR'd, merged, OCI-uploaded** (HHS above; Clinic patches ×4 files land with
#1267, its two OCI objects uploaded by the same gate). Nothing in this lane is committed-but-unpushed.

**W-NOGEO-COMPOSE is now a committed, re-runnable witness** (`tests/witness_nogeo_compose.js`,
PR bim-ootb#1266) — the earlier lane proved everything ad-hoc in a worktree that was then pruned, so
none of it could be re-run. It slices the REAL `A._applyPendingPatch` + `A.composeGhostsFromAggregates`
out of `viewer/scene.js` and runs them against the project's OWN bundled `viewer/lib/sql-wasm.wasm`
(md5 `618e54b08615e92780b0a3a418da43d4`) — **not** npm `sql.js`, the different build whose absence of
the crash hid the chunking bug. Asserts `ghosts→0` (or NAMED in `§NOGEO_COMPOSE_UNRESOLVED`) **and**
the served `.db` byte-identical afterwards. Current: **9/9 PASS** across Clinic ×2, HHS, Hospital ×2,
Duplex, JKR, Terminal ×2. Second invocation form `--db <path>` is what `oci_patch_gate.js --verify`
runs against the bytes it downloads from the bucket.

Numbers, not eyeballs, on every composed set: **0 degenerate bboxes, 0 centres outside the real
building extent** (HHS curtain walls 0.2 m thick × 10.51 m tall ≈ 3 storeys; stairs ≈ 2.4×4.2×3.9).
Scheduler participation re-checked on COMPOSED copies (not the ghost-blind `COALESCE(...,0)` read the
support-order witness does by default): HHS `floating=0/6880`, `§GEO_ORDER edges 61860→64267 (+2407)`;
Clinic `floating=0/16912`, `edges 65428→68047 (+2619)`, `promotedRoofSlabs 0→1` — composed elements
genuinely enter the support DAG, not present-and-inert.

**⛔ NEW, NOT the NOGEO class — `LTU_AHouse_meta.db`, 337 ghosts, needs its own task.**
`204 IfcWindow + 95 IfcDoor + 15 IfcStair + 12 IfcRoof + 6 IfcWall + 5 IfcCurtainWall` in the
`_meta` split, while `LTU_AHouse_extracted.db` has **0**. Windows and doors are not aggregate
parents, so `rel_aggregates` composition is the wrong tool. Checked further, and it is NOT a lossy
split of one extract either: **none of the 337 ghost GUIDs exist anywhere in `LTU_AHouse_extracted.db`**
(0/337 in `elements_meta`, 0/337 in `element_transforms`) — the two live OCI objects are different
extraction vintages of the same building. Both are served live, and `streaming.js` §6.9 prefers
`_meta.db` when present, so **live LTU_AHouse users get the 337-ghost file**
(`dlod_nav.js`'s own "real 122,330-element LTU_AHouse" measurements match `_meta`'s 122,667 —
that is the file in play). The one question a session cannot EXTRACT: **is `_meta`/`_geo` or
`_extracted` meant to be canonical for LTU_AHouse, i.e. re-extract the split pair, or retire it?**

**⛔ Item 4's Modeller sub-item is much bigger than "2 of 4 copies to check" — Modeller has NO
compose at all.** `modeller/str_walker_outliner.js` has its own `_applyPendingPatch` port (line
~648) but **no port of `composeGhostsFromAggregates`** — grep confirms the function exists only in
`viewer/scene.js`. So every Modeller-resident DB with ghosts is uncomposed there regardless of what
the Viewer does:
```
Hospital_ARC.db 232 · SampleCastle_ARC.db / _extracted 117 (IfcWallStandardCase:51 IfcCovering:48 — a
THIRD class shape) · Ifc4_Revit_extracted.db 49 · Clinic_ARC.db 34 · HHS_ARC.db 33 · Garage_ARC.db 19 ·
Duplex_ARC.db 3 · SampleHouse_ARC.db 2 · JKR_ARC.db 0 · Terminal_ARC.db 0 · Duplex_extracted.db 0
```
Latent, related: Modeller's `_applyPendingPatch` still does **one giant `pdb.run(sql)`** — the exact
pattern that crashes the bundled WASM ("memory access out of bounds") on a multi-thousand-statement
patch. Same WASM build as the Viewer (identical md5, verified), so the bug is real, just not yet
triggered: today's largest Modeller patch is 219 statements (`Duplex_ARC.db.sql`). It WILL fire the
first time a Modeller patch reaches ~thousands of statements — which is exactly what a Modeller
rel_aggregates patch would be. Port the Viewer's `§PATCH_CHUNK` statement-aware batching before, not
after.

**Item 4 precondition MEASURED (the storey-aggregate worry): safe on every shipped DB.**
`elements_meta` carries **no** `IfcBuildingStorey`/`IfcBuilding`/`IfcSite`/`IfcProject`/`IfcZone`
rows in Hospital, Terminal, JKR, HHS, Clinic or Duplex — so an unconditional extractor-side
ghost-detection query cannot compose a "position" for a storey. It DOES carry `IfcSpace` (Duplex 21,
Clinic 798), none of which are ghosts today; keep spaces named-and-excluded rather than silently
composed. HHS's source IFCs are located (above), so item 4's "HHS source not yet located" is closed.

**Items 4–5 (bake compose into `extractIFCtoDB.py`, then retire the patches) remain OPEN** — bigger
lane, unchanged in shape, now with the preconditions above settled and two extra affected surfaces
(Clinic, and all of Modeller) to include in its scope.

**Clinic upload + production confirmation (same session, closing item 3 for Clinic too):** both new
OCI objects added, nothing overwritten (`§GATE_TARGET {"exists":false} (ADD)`) — each gate run
downloaded the real live bytes (`Clinic_meta.db` gunzipped by the gate; `Clinic_extracted.db` all
128 MB) and ran W-NOGEO-COMPOSE on them → `ghosts 43→0` → `§GATE_VERDICT UPLOAD_VERIFIED`, 91,238
bytes, `application/sql`. Manifests committed (bim-ootb#1268). Production witness, real GH-Pages
viewer + real OCI bytes, `§`-log only: `§PATCH_APPLY Clinic_meta.db applied (91236 bytes, 739
statements, 2 chunk(s))`, `§NOGEO_COMPOSE composed=43 ms=203`, `§DB_META_LOADED size=6.1MB` →
`§LIVE_WITNESS PASS`. Side-fact worth keeping: `streaming.js` §6.9 split detection routes Clinic
through `_meta.db` **even when the URL names `_extracted.db`** — that is why both variants must be
patched, and why a `_meta`-only patch is what actually reaches a live user for split buildings.

**Watchdog follow-up, same day, third session in this lane (cross-checked, not assumed) — the HHS
root-copy landmine above was flagged but not yet CLOSED as of the entry above.** Independently
re-verified everything in this section against live state before acting: PR #1263 merged+live
(fetched `scene.js` from `red1oon.github.io`, `composeGhostsFromAggregates`/`PATCH_CHUNK` present in
served bytes), HHS 41-ghost count reproduced from the byte-identical (md5-confirmed) served DB,
JKR 0-ghost reproduced independently, and the peer's live-uploaded HHS patch object fetched directly
from OCI and diffed byte-for-byte against origin/main's `viewer/` copy — confirmed identical, confirmed
safe, did not re-upload over it. The one gap still open at that point: `buildings/patches/
HHS_Office_Federated_extracted.db.sql` (root copy) **on `origin/main` itself** was still missing the
148-line `spatial_structure` section — the peer's OCI upload fixed the *served* bytes but the *repo's*
root-path copy still didn't match, leaving the landmine live in git history for the next session that
trusts the root path as canonical. Fixed via bim-ootb PR #1269 (`fix/hhs-patch-root-parity`,
non-code, repo-hygiene only): copied the `viewer/` copy over the root copy, verified byte-identical to
both the `viewer/` copy and the live OCI object afterward. Also independently spot-checked two of the
peer's Modeller claims rather than taking them on faith: `modeller/HHS_ARC.db` — 33 ghosts (all
`IfcCurtainWall`, confirmed), zero `composeGhostsFromAggregates` hits anywhere in `modeller/*.js`
(confirmed, Modeller genuinely has no port); `modeller/JKR_ARC.db` — 0 ghosts (confirmed, matches the
peer's list which didn't name it). Did not start items 4–5 (extractor root-fix, Modeller compose port)
— per the checklist's own gating ("only after 1–3 are live and stable") and given three concurrent
sessions were actively still finding new affected surfaces (Clinic, LTU_AHouse, Modeller) during this
same window, the lane was not yet stable enough to start the bigger rewrite.

## ▶ NEXT SESSION — PLANNED, NOT STARTED (2026-08-10): promotion-classifier consolidation + Modeller compose port
**Read this whole section before touching code — it corrects itself once already, on purpose, left
in so the correction isn't lost.** Fully researched and planned this session (two Explore passes + one
Plan pass + direct code verification), written to `/home/red1/.claude/plans/replicated-crunching-flame.md`
during the session, copied here per user instruction ("your plan has to be saved in the prompt... we do
it in a brand new session") since that plans-directory file is session-scoped and won't survive. Nothing
below has been implemented — no worktree opened, no code written, no PR opened. Treat this as a ready
plan, not a done item.

**Origin**: user asked for a "big refactor" pass, refined to: find a selective, high-level, minimal
interface pattern that's amiss, specifically re: Time Machine's/Movie Maker's dependency on the 4D
generator not leaving elements floating or violating construction practice.

**⚠ Self-correction, load-bearing — read before assuming the headline claim:** research first surfaced
`time_machine.js` has two copies of the roof/load-path promotion classifier
(`_buildXrayElements()` lines 3468-3507, `injectGantt()` lines 3882-3974) and an agent claimed they'd
diverged 16 edges on Terminal — i.e. that this duplication was the root cause of `§TM_GEO_ORDER_CYCLES`
above. **Direct verification (diffed both code blocks by hand, ran both in a live sandboxed
Node vm against real `Terminal_extracted.db`) found this claim FALSE**: the two copies already produce
byte-identical `.seq` classification output (only bookkeeping fields differ — `el.phase`,
debug counters — neither feeds the DAG). The earlier "16-edge divergence" was actually a comparison
against `schedule_author.js`, a third file with no promotion logic at all, not evidence of drift
between these two. **So: the consolidation below is real DRY value + protects a genuine correctness
consumer (see Part A), but will NOT move `cycles=`/`floating=` on Terminal.** The actual
`§TM_GEO_ORDER_CYCLES` bug is still exactly where the entry above says it is (schedule_gate.js's DAG,
the named 3-cycle class), untouched by this plan, still open. User confirmed proceeding on this
corrected, more modest scope (consolidation + a new reproduction witness, not chasing the cycle bug
itself) — don't re-inflate the claim back to "fixes the cycles bug" on a resume.

### Part A — `viewer/time_machine.js`: extract `_promoteRoofLoadPath(elements)`
1. New function, placed immediately before `_buildXrayElements()` (current line ~3387). Body = the
   fuller/better-commented `injectGantt()` copy (keeps the `§4D_WALLS_BEFORE_ROOF` doc comments).
   Signature: single `elements` array param (both copies are order-independent two-phase passes).
   Returns `{ total, seedCount, m4Count }` (renamed `loadPathOverrides`/`lpSeed.length`/`m4Promoted`)
   so each caller keeps its own log line's exact wording — grep-safety for `§GANTT_OVERRIDE`.
2. `_buildXrayElements()`: replace lines 3468-3506 with `var _lp = _promoteRoofLoadPath(elements);`
   before its `return elements;`. Fix the now-stale header comment ("copied, not shared").
3. `injectGantt()`: replace lines 3882-3974 with the call + the existing `§GANTT_OVERRIDE`
   console.log rebuilt from the returned fields (reproduce the exact current string).
4. Confirmed via full-file grep: `loadPathWalls`/`lpSlabs`/`lpSeed`/`loadPathOverrides`/`m4Promoted`
   referenced nowhere else — self-contained, no other call sites to update.
5. **Real correctness stake, not just cosmetics**: `verifyGanttIntegrity()` (line ~3612, the schedule
   LOCK gate) calls `_buildXrayElements()` directly — a future silent divergence here would have been
   a correctness bug blocking/passing a lock incorrectly, not just an x-ray rendering glitch. That's
   the actual reason this is worth doing even though it doesn't fix the cycles number.
6. Expected behavior change: **none**. Frame the PR as a pure refactor.

**New witness** (the real deliverable — this reproduction doesn't exist anywhere today):
`tests/witness_tm_geo_order_cycles.js`, cloned from `viewer/tests/witness_gantt_lock_integrity.js`'s
`sliceFn()`+`vm.createContext`+`sql-wasm.js` sandbox pattern. Slice `_promoteRoofLoadPath` +
`_buildXrayElements`, load `Terminal_extracted.db` (`BLD_DIR` env, default `~/bim-ootb/buildings`), run
through `ScheduleGate.computeSchedule()`/`auditFloating()` (canonical, unchanged). **Assert `cycles=`/
`floating=` are IDENTICAL before vs after the refactor** — do NOT assert they drop toward 0; a live
sandboxed run during planning got `cycles=37927, floating=45` on Terminal today (already differs from
this doc's earlier recorded `24353`/`33`, cause unexplained — log as `§TM_GEO_ORDER_CYCLES_REPRO`,
flag the drift, don't silently overwrite the old number). Note the witness's own approximation caveat
(no `resource`/`installSecs` fields — doesn't affect cycle count, which is structural, but name it).
Command: `BLD_DIR=~/bim-ootb/buildings node tests/witness_tm_geo_order_cycles.js`, run on branch base
and after, diff the `§TM_GEO_ORDER_CYCLES_REPRO` line.

### Part B — Modeller ghost-compose port (separate PR, separate app)
Picked up mid-session as the "low hanging fruit, push further without impact" from this doc's own
Modeller sub-item above. Both pieces confirmed portable by direct code reading against fresh
`origin/main` (not assumed):

- **B1.** Port `composeGhostsFromAggregates(db)` verbatim from `viewer/scene.js:1346-1435` into
  `modeller/str_walker_outliner.js` (check for an existing shared-util convention before adding a new
  file). Zero Viewer-global references inside the body (only `db.run/exec/prepare`) — pure function of
  `db`. Schema spot-checked compatible: Modeller's own `cross_edges.js`/`bom_tree.js` already query
  `element_transforms`/`rel_aggregates`/`elements_meta` with identical column names.
- **B2.** Wire the call into `_openBuffer(buf, name)` — `str_walker_outliner.js:133-195`, right after
  `new window.SQL.Database(...)` (line 136), BEFORE `swbInit`/`BOMTreeOutliner.loadFromDb`/
  `CrossEdges.deriveAll` (lines 161-177). Confirmed this is Modeller's ONE true funnel — all three real
  open-a-building paths (resident fetch, local-file, IFC-import) route through it.
- **B3.** Port `§PATCH_CHUNK` statement-aware chunking (accumulate lines to a `;`-terminated statement,
  batch 500/`pdb.run()` call) into `_applyPendingPatch` (`str_walker_outliner.js:648-688`). **Not a
  blind copy** — Modeller's version already has its own try/catch (a "duplicate column name"
  statement-by-statement recovery for `§ANCHOR`/void-anchor hardening) wrapping the same `pdb.run(sql)`
  call. Merge: chunk first; a chunk that throws "duplicate column name" falls back to THAT chunk's own
  statement-by-statement recovery, not the whole patch's.
- **B4.** Land B3 before/with B1-B2 — a fresh Modeller `rel_aggregates` patch for any of the 7 affected
  DBs is exactly the multi-thousand-statement patch that triggers the un-chunked crash.
- **Verification**: extend `tests/witness_nogeo_compose.js` (already proven against the real bundled
  `sql-wasm.wasm`) to Modeller's DB-open path. Assert ghosts→0 on: `Hospital_ARC.db` 232,
  `SampleCastle_ARC.db` 117 (⚠ a THIRD element-class shape — `IfcWallStandardCase`/`IfcCovering`, not
  curtain-wall/stair — confirm composition works on this shape too, don't assume),
  `Ifc4_Revit_extracted.db` 49, `Clinic_ARC.db` 34, `HHS_ARC.db` 33, `Garage_ARC.db` 19,
  `Duplex_ARC.db` 3. Regression: `JKR_ARC.db`/`Terminal_ARC.db`/`Duplex_extracted.db` stay at 0.
- **Explicitly out of scope**: items 4-5's extractor root-fix (`extractIFCtoDB.py`, bigger/riskier,
  shared Python pipeline, doc's own gate reserves it for later) and the LTU_AHouse canonical-DB
  question (genuinely the user's call — see below, don't decide it here).

### Git/deploy mechanics
Two separate `/tmp/wt-*` worktrees off fresh `origin/main` (`~/bim-ootb` is edit-blocked by a
PreToolUse hook — `git worktree list` first, several already exist from concurrent sessions, don't
collide). Branches: `fix/4d-roof-promotion-consolidate` (A), `feat/modeller-nogeo-compose-port` (B).
Two separate PRs (different apps, no shared code, keep independently revertable) — implement → witness
before/after → commit with numeric proof → PR → `gh pr merge <n> --auto --squash` (push permission ON
per CLAUDE.md) → verify merged → prune worktree. Part A's PR description leads with the self-correction
above so a reviewer doesn't expect a cycles improvement. Part B's names the two items still open.

### Still open, unchanged by this plan, needs the user (not this session)
**LTU_AHouse canonical-DB question** (named above): `_meta`/`_geo` (337 ghosts, live-served) vs
`_extracted` (0 ghosts, none of the 337 GUIDs even exist in it — different extraction vintages, not a
lossy split) — re-extract the split pair, or retire one? Nobody can EXTRACT this answer from the data;
it's a real decision. Surface it at the start of whichever session picks this up, don't silently pick one.

### Critical files
Part A: `viewer/time_machine.js` (3380-3387, 3468-3507, 3612-3638, 3882-3974), `viewer/schedule_gate.js`
(read-only reference), `viewer/tests/witness_gantt_lock_integrity.js` (pattern to clone),
`tests/witness_geometric_support_order.js` (existing approximate precedent, not replaced).
Part B: `viewer/scene.js` (1346-1435, read-only source), `modeller/str_walker_outliner.js` (133-195,
648-688), `tests/witness_nogeo_compose.js` (extend).

## ✅ EXECUTED 2026-08-10 (session 2): Part A MERGED + urgent needle-chunk fix + two pattern follow-ons
**Part A — MERGED** (bim-ootb PR #1272, auto-squash): `_promoteRoofLoadPath(elements)` extracted, both
callers swapped, `§GANTT_OVERRIDE` strings byte-identical, `viewer/tests/witness_tm_geo_order_cycles.js`
NEW (note: `viewer/tests/`, not the plan's `tests/`). Witness identical before/after AND independently
re-run on merged main: `§TM_GEO_ORDER_CYCLES_REPRO cycles=37927 floating=45 n=48428/48428
promotedRoofSlabs=57`. Drift vs this doc's older 24353/33 is REAL and now permanently flagged by
`§TMREPRO_DRIFT_FLAG` — cause still unexplained, cycles bug in schedule_gate.js still OPEN.
**Urgent (found in live log, same session) — MERGED** (PR #1271, live-verified on GH Pages sw v974):
navigate_find.js needle path ran Hospital's 9,466-statement patch through ONE un-chunked `A.db.run()` →
"memory access out of bounds" bricked the shared sql.js wasm heap (all later queries + geo.db load +
streaming init died; viewer degraded to bboxes-only; cinema planned on empty data). Fix = §PATCH_CHUNK
chunker extracted to shared `A._runSqlChunked(db,sql)` (scene.js), needle path now uses it. Witness:
`tests/witness_nogeo_compose.js` 9/9 PASS on bundled wasm incl. the exact 1,381,431-byte/19-chunk patch.
Along the way: kernel_ops v8-clobbers-v13 double-include removed from viewer.html (blue_fold/whatif call
v13-only discardBranch/acceptBranchUpTo — were silently broken), §SHORTCUT_AUDIT false-deads (+,-,z,w,r)
fixed (dotted-target resolution + window._zoomStep/_cycleRoom exposure), mobile-web-app-capable meta added.
**Part B — dispatched, in flight at time of writing** (branch feat/modeller-nogeo-compose-port); outcome
to be appended below when its report lands.
**LTU_AHouse canonical-DB question surfaced to user this session — still awaiting the call.**

### ▶ FOLLOW-ON SPECS (2026-08-10, user-approved "spec both, fix if low-hanging") — meta-pattern:
one shared invariant enforced at ONE choke point, not per-call-site discipline (that's what drifted, twice).

**F1 — §CHUNK_ONLY enforcement witness** (`tests/witness_chunk_only.js`, bim-ootb)
Issue it proves/disproves: a NEW call site feeding fetched/patch SQL text into a raw `db.run()`/`.exec()`
reintroduces the wasm-heap crash class that §PATCH_CHUNK fixed twice already (scene.js 2026-08-10 am,
navigate_find.js 2026-08-10 pm — same bug, missed call site).
Spec: static lint-witness, no wasm needed. Scan `viewer/*.js` for `.run(<ident>)`/`.exec(<ident>)` where
<ident> matches /sql/i (sql, sqlText, sqlStr...), EXCLUDING (a) the body of `_runSqlChunked` itself,
(b) lines annotated `// §CHUNK-EXEMPT: <reason>`. Any hit = FAIL with file:line. Log
`§CHUNK_ONLY_WITNESS scanned=N hits=0 PASS`. Extend scope to `modeller/*.js` ONLY after
feat/modeller-nogeo-compose-port lands (its pre-port `pdb.run(sql)` would be a true-positive red until then).
**F2 — §SCRIPT_DUP boot audit** (`viewer/input_registry.js`, bim-ootb)
Issue: the same script loaded twice under different paths lets load order silently pick the winner —
live log showed BOTH `§KERNEL_OPS_LOADED v13` and `v8` banners and nothing flagged it; v8 clobbered v13.
Spec: `InputReg.checkScriptDups()` — scan `document.scripts` basenames (strip query), report any basename
appearing >1: `§SCRIPT_DUP basename=<f> srcs=[...]` (warn), summary `§SCRIPT_DUP_AUDIT total=N dup=0`.
Log-only, zero behavior change. Invoke where checkShortcuts() already self-runs. Same-basename-different-
file false positives: none in current viewer.html (verified flat include list); if one ever appears
legitimately, exempt via a DUP_OK list in the function, with reason.

### ✅ Part B outcome (2026-08-10, appended per section above) + F1/F2 shipped
**Part B — MERGED** (bim-ootb PR #1273): B1-B4 all landed — modeller chunked `_applyPendingPatch`
(merged with its per-chunk §ANCHOR duplicate-column recovery), `composeGhostsFromAggregates` port,
`_openBuffer` wiring, modeller sw v47. PLUS the 7 modeller rel_aggregates patch files themselves
(plan implied, not itemized — patch+loader together per CLAUDE.md). Witness (modeller mode, bundled
wasm; independently re-run by the coordinating session, counts confirmed): Hospital_ARC 232→0,
SampleCastle_ARC 117→0 (52 composed + 65 via pre-existing §ANCHOR void-anchors — own-Body/zero-
rel_aggregates extractor-gap class, NOT NOGEO), Ifc4_Revit 49→0, Clinic_ARC 34→0, HHS_ARC 33→0,
Duplex_ARC 3→0, SampleHouse_ARC 2→0; Terminal_ARC/JKR_ARC/Duplex_extracted regressions 0→0.
`§NOGEO_WITNESS_TOTAL mode=modeller pass=8 fail=0`.
**✅ UNBLOCKED 2026-08-11 — the "source no longer exists" claim above was WRONG, corrected same day.**
User: "All landed buildings IFCs do exist on disk in this machine... buried sometimes but they do
exist and no way we throw sources away." Verified, not just taken on faith: both
`~/Projects/bim-compiler/DAGCompiler/lib/input/IFC/HospitalGarage_IFC4.ifc` (6.45MB) and the sibling
`HospitalGarage_IFC2x3.ifc` (6.41MB) exist, valid IFC, 20 `IFCCURTAINWALL` entries — matches the "19
ghosts, all IfcCurtainWall" description. The earlier session's "GUID-grepped every local .ifc" search
was too narrow (missed `~/Projects/bim-compiler/DAGCompiler/lib/input/IFC/` and
`~/bim-compiler/internal/UNMERGED/` — both real source-IFC archive locations on this machine, see
`reference_source_ifc_locations.md`). Garage_ARC's 19-ghost item is REOPENED, not permanently
blocked — pairs CAN be extracted once someone runs the compose pass against this file. Not
re-composed yet this session (pulled focus, not scoped here) — next session picking this up: run
§NOGEO_COMPOSE against `HospitalGarage_IFC4.ifc`/`_IFC2x3.ifc`, expect Garage_ARC.db 19→0 same as the
other 7 buildings in this same push-to-zero pass.
**F1+F2 — implemented same session** (bim-ootb PR #1274, auto-merge armed): F1 spec REFINED during
implementation — /sql/i ident-name matching drowned in constant-literal false positives; shipped rule =
idents bound from network `.text()` (async/promise/arrow forms) passed to `.run()/.exec()` on a line
AFTER the binding (the order rule kills the real false positive hit on first run: modeller
`_count(db, sql)` :422 vs patch ident :652). Scans viewer+modeller by default (both green post-#1273).
`§CHUNK_ONLY_WITNESS PASS scanned=164 files hits=0 selftest_fail=0` with 5/5 self-tests incl. both
historical bug shapes. F2 = `InputReg.checkScriptDups()`, log-only §SCRIPT_DUP basename audit beside
the shortcut audit — would have flagged the kernel_ops v8/v13 double-load on sight.

## ▶ RESUME AFTER POWER-DOWN (2026-08-10 late): §GANTT_REFOLD_HANG WIP + LTU live-log findings
**State at power-down (worktrees in /tmp are GONE after reboot — everything pushed):**
- **§TM_GEO_ORDER_CYCLES ✅ FIXED+MERGED** (PR #1276): Terminal cycles 37,927→0, DEQ shifts 251→0,
  floating 45→8. Real class (SCC-proven, predicted hang-3-cycle REFUTED): tall walls + crown-contained
  + mid-span wallBearsPromoted. Fix: contained support must top in consumer's LOWER HALF; wallCarries
  only AT wall top (±GAP). Witness asserts cycles=0/floating=8. gantt_lock witness was crashing since
  #1272 (missing _promoteRoofLoadPath slice) — repaired in #1276.
- **§GANTT_REFOLD_HANG — code COMPLETE, NOT witnessed, branch `fix/gantt-refold-hang` pushed, NO PR.**
  _ogSupportGuard() + _writeScheduledChunked() extracted (verbatim inner code), _TM_CHUNK=2500 yields,
  per-chunk txns (never BEGIN across a yield), injectGantt async, 3 call sites awaited, navigate_find
  thenable-aware. witness_gantt_og_grid_perf REWRITTEN (was DEAD on main — text end-mark rotted at
  §4D_LAYER_TRUTH; now slices the named fn; brute force updated to sweep+hang semantics).
  NEW witness_gantt_refold_yield (identity yield-vs-sync + chunked-vs-single-txn rows + <200ms span
  bound). First combined run TIMED OUT at 10min (Hospital+Terminal ×4 loads — likely just slow, split
  the runs). **Next: checkout branch to a fresh /tmp worktree, run all 4 witnesses (refold_yield,
  og_grid_perf, gantt_lock, tm_geo_order_cycles), bump sw (take current), PR, auto-merge.**
- **LTU re-extract ✅ LIVE on OCI** (meta 50MB/0-ghosts + geo 160MB + positions, gzip, fetch-back
  byte-verified; June pair backed up: OCI copy UNCONFIRMED, local copy at
  `~/bim-ootb/buildings/_backup_ltu_june_2026-08-10/`). merge_db no-library blob-destruction fixed in
  bim-compiler (BLOB_COVERAGE gate). Resident RAM 440→210MB.
**From the user's live LTU test log (pasted 2026-08-10, full log in that session):**
1. **⚠ STALE IDB CACHE — the session loaded the OLD June vintage** (dbElements=122,667, §4D_NOGEO
   parked=337, heap 2.6GB) despite the new pair being live — [S203] building cache is cache-first with
   NO revalidation, so returning users NEVER get re-uploaded DBs. **Open item: check/build a
   revalidation path (HEAD etag/Content-Length compare on cache-hit, or a bucket version stamp).**
   This gates the whole mem win reaching users.
2. **NEW cycle class on LTU under tm promotion: §SUPPORT_CYCLE cycles=75,943, §DEQ_REPAIR shifted=8,848,
   floating=2,521/122,330** (schedule_author pass clean, cycles=0 — same signature shape as Terminal's).
   Measured against the OLD vintage; re-measure on the NEW extracted.db
   (203MB, staging was /tmp — REGENERATE via scripts/extract_merge_disciplines.py, ~15min, or pull
   meta+geo from bucket) then SCC-analyze (the tm_cycle_scc.js analysis scratch was in /tmp — rebuild
   from this section: replicate DAG predicates, Tarjan on Kahn leftovers, cross-check leftover count).
3. §WRITE_LOOP_TIMING ms=2044.9 on LTU = the refold-hang freeze class, live — confirms the WIP fix's
   priority. Also §CINEMA_SPACE all-candidates enclosed=0% (room enclosure data absent on old vintage —
   re-check on new), needle §PATCH_NONE 404 handled clean (no wasm crash — #1271 held).
**Still open, unchanged:** floating=8 Terminal tail; witness_geo_support_leak pre-existing FAIL
(10 ungated/7 leaked, identical on baseline); LTU bucket extracted.db still Aug-3 71MB library-pattern
vintage (split pair is newer — unify when extractor root-fix lands); OPFS/sqlite-wasm paging spec
(structural mem lever) still to be scoped after cache-revalidation lands.


## ▶ Big-element-support-coverage sub-lane — CLOSED 2026-08-11, archived
Part 1 SHIPPED: bim-ootb PR #1277 merged (`§SUPPORT_UNCHECKED`, threshold 1.556 m³, warn-only,
831/6,377 (13%) big elements found with zero support check across 5 buildings, split by
`buildingModelsSubstructure`). 26/26 witness PASS, zero regressions. Full diagnosis → spec → real-data
extraction → design decision → shipped-PR chain (STUDY/CORRECTION/SPEC/OPEN-QUESTIONS/Gap-B-DECIDED/
Part-1-SHIPPED) archived verbatim: `prompts/archive/4D_BIG_ELEMENT_SUPPORT_COVERAGE_2026-08-11.md`.

**Still OPEN, lifted forward (not closed by the archive):**
- **Part 2** — the per-bucket phase-window rescale redesign (`_ogSupportGuard`/`§PHASE_OVERLAP_BAND`).
  Three options named in the archive (A: one global rescale · B: derive window/lag from real
  cross-bucket dependencies · C: keep the pipeline, fix the one verified unbounded-upward bearing-test
  bug). Recommendation if picked up cold: **C first, unconditionally** — doesn't foreclose A/B later.
  Lower priority than Part 1 was: confirmed `_cap` (the mechanism Part 2 would touch) is null on every
  currently-shipped building — real code, currently dormant, not user-facing yet on any shipped bldg.
- **Gap A** — `IfcPile` has no `SEQUENCE_RULES` entry in `rates.js` (would default to
  `Architecture/seq=6` if ever modeled). Latent only: no shipped building models `IfcPile` today.
- **Possible follow-on** (named, not started): eyeball a sample of Terminal's 236 unchecked `IfcSlab`
  / Hospital's 139 `IfcDuctSegment` findings to decide whether 1a should ever graduate warn→gate —
  decide on the real counts in the archive, don't re-guess.

## ▶ Big-element follow-up 2026-08-11 (post-archive): the two offender classes ROOT-CAUSED — 831→250
User dispatch: investigate WHY Terminal's 236 unchecked `IfcSlab` and Hospital's 139 `IfcDuctSegment`
found zero support candidates (real DB forensics, not guesswork), THEN decide fix-vs-document per
class. Outcome: **both got real fixes, neither was the anticipated answer** — bim-ootb **PR #1278**
(branch `fix/big-element-support-followup`), forensics scripts + logs in session scratchpad
(`forensics_unchecked.log`, `measure_hang_reach.log`, `big_sink_gaps.log`).

**Terminal 236 IfcSlab = misclassified FOUNDATION PILES (answer (c), neither pool-gap nor plain data
gap).** Every one is family `jkrST_str-fo_pc_rcp:300 x 300mm` — 300×300mm × 30.15m precast RC piles
(`str-fo` = JKR structural-foundation code) authored as `IfcSlab`. All sit at the building's absolute
lowest z (base −16.04..−15.94 vs model min −16.04) with NOTHING modeled beneath (no pool member, no
wall, no any-class bearing) — genuinely ground-bearing Substructure. This is the archive's "latent
Gap A (`IfcPile` has no SEQUENCE_RULES entry)" arriving disguised: Terminal DOES model piles, class
lookup just can't see them. Fix = `foundation_pile_misclassified_slab` SEQUENCE_NAME_OVERRIDES entry
(rates.js + rates/sequence_rules.json, the shipped curtainwall-override mechanism) → Substructure/
seq 1 → 1c-exempt, and **Terminal's `buildingModelsSubstructure` flips false→true** (Q2's "Terminal
models zero Substructure" was an artifact of the misclassification; HHS remains the only true
bms=false). Pattern `str-fo|\bpile\b` measured against EVERY shipped buildings/*.db: exactly those
236 match under the IfcSlab class gate, zero false positives (Hospital's 'M_Pile Cap-6 Pile' are
already IfcFooting). Widening the support pool would have been WRONG here — there is genuinely
nothing below them; the fix is naming what they are.

**Hospital 139 IfcDuctSegment = rod-suspension outside the ±GAP carrier band (answer (a), real
detection incompleteness — but NOT a bug in #1277's code).** The 1a hang path IS exercised; the
predicate requires the carrier's base within ±0.5m of the duct's top (direct mount). Measured: all
139 have real pool structure 0.51–4.61m above (p50 1.22m) — hanger-rod drops. Fix = **§HANG_NEAREST**
fallback in schedule_gate.js: for a BIG (>BIG_ELEMENT_VOL) pure-SINK hanger (seq>4, never a wall,
never a promoted slab) with ZERO in-band carriers, carrier = the NEAREST overlapping pool member
above + its co-planar GAP band (a duct rods to its whole beam grid). Symmetric at all three
consumers (DAG `edgeCarrier` + `hangGate` + `auditFloating`) so order, gate and audit test one
physics. Provably acyclic: sinks are in neither support pool ⇒ no outgoing DAG edges ⇒ added
carrier in-edges cannot close a cycle (cycles=0 stays structural). Parameter-free — no invented
reach constant. **Deliberately scoped to BIG sinks only**: widening ALL sinks would newly gate
48,904 elements across the 5 buildings (measured) — a Part-2-scale schedule reorder, not a seam
close. Small sinks keep warn-only visibility.

**Witness-harness bug found and fixed on the way (REAL finding):** witness_big_element_support_
coverage / witness_tm_geo_order_cycles / witness_gantt_lock_integrity all read
`rulesJson.SEQUENCE_NAME_OVERRIDES` but the JSON's key is `NAME_OVERRIDES` — all three silently ran
with name overrides OFF while the live viewer always runs rates.js's in-file copy ON (so #1277's
baselines were measured in a config no user ever sees — e.g. Hospital's 83 "unchecked IfcPlate"
were curtainwall glazing the live viewer classes seq 7). Fixed to the class_fallback-style key
chain; witnesses are now live-parity.

**Numbers (all logs read):** unchecked Terminal 279→32 (−236 pile-exempt, −11 §HANG_NEAREST:
8 DuctSegment+3 DuctFitting), Hospital 503→177 (−139 DuctSegment, −60 DuctFitting, −83 IfcPlate),
HHS 21→13, Clinic 22→22 (mix changed), Duplex 6→6 — **TOTAL 831/6,377 → 250/6,141**; per-building
floating HELD exactly (8/0/0/0/1). witness_big_element_support_coverage 26/26 (baselines re-locked
with per-cause deltas in the witness comment) · witness_tm_geo_order_cycles 5/5 (cycles=0,
floating=8 EXACT, DEQ shifted=0, §GEO_ORDER hangNearest=217 edges) · witness_gantt_lock_integrity
19/19 (§LI_COST 63,415 floating=0) · zero regressions across test_schedule_gate,
default_engine_quality (0/48428), geometric_support_order (0 shifts), facade/host order, gantt
native/shift/baseline/undo/shop-dates; geo_support_leak pre-existing FAIL byte-identical (10/7).

**Warn→gate NOT flipped, deliberately:** the remaining 250 are pool-class elements (beams/walls/
columns/railings) whose zero-candidate state is now a REAL "nothing detectable supports this"
signal, not a detection artifact — but 32 of them live in buildings whose remaining findings are
roof-edge railings / bms-false ground elements where a gate would false-block. The warn is now
high-signal; gating stays a future decision on these 250, not a default.

## 2026-08-11 — §NOGEO_COMPOSE Garage_ARC 19→0 — 8th and LAST building closed (PR #1280), the lane's ghost table is now ALL ZEROS

The "UNBLOCKED 2026-08-11" item above is DONE, same session-day. Verdict first: **no re-extraction
was needed and none was performed** — this was a pure compose-and-patch pass, identical in shape to
the other 7 buildings.

**Mechanism check (measured before doing anything):** `Garage_ARC.db` (Modeller resident, key
`HospitalGarage`, `str_walker_outliner.js:57` — no Viewer-side serving of this DB exists) has
`elements_meta`=1271 vs `element_transforms`=1252 → 19 ghosts, all IfcCurtainWall, and **NO
`rel_aggregates`/`bom_tree` table at all** — so the "just run compose on shipped data" path was
structurally impossible (composeGhostsFromAggregates had no pairs to read; that's exactly why it
logged §NOGEO_COMPOSE_UNRESOLVED at every open). Also checked the two
`~/bim-compiler/deploy/buildings/HospitalGarage_*_extracted.db` files found during the source
search: same vintage gap, no `rel_aggregates` either — not a shortcut.

**Fix = the PR #1273 pattern, nothing new:** `modeller/patches/Garage_ARC.db.sql` (NEW, 490
`IfcRelAggregates` parent→child GUID pairs recovered VERBATIM from
`~/Projects/bim-compiler/DAGCompiler/lib/input/IFC/HospitalGarage_IFC4.ifc` via ifcopenshell
0.8.4.post1, filtered to the 19 ghost parents) + the self-heal loader #1273 already wired
(`_applyPendingPatch` → `composeGhostsFromAggregates` union-bbox at open). Preconditions measured
before writing the patch: 19/19 ghost parents present as aggregate parents in the IFC; the
IFC2x3 sibling is pair-IDENTICAL (490=490, so the vintage question is moot); every parent's
children (IfcMember/IfcPlate/IfcDoor) already have real `element_transforms` rows in the shipped
DB (404 IfcMember + 85 IfcPlate were extracted fine — only the parent shells ghosted). Ghost GUIDs
grep-verified present in both IFC files before trusting them as the source.

**Witness (log read, saved):** `node tests/witness_nogeo_compose.js --modeller` →
`§NOGEO_WITNESS PASS Garage_ARC.db ghosts 19→0 composed=19 unresolved=0
served_file_untouched=true`, full set `§NOGEO_WITNESS_TOTAL mode=modeller pass=9 fail=0`
(regressions: Hospital 232→0, SampleCastle 117→0, Ifc4_Revit 49→0, Clinic 34→0, HHS 33→0,
Duplex 3→0, SampleHouse 2→0, Terminal 0→0). Numeric sanity, PR-#1273-style: the 19 composed rows
independently recomputed (union-AABB from the DB's own child transforms) — 0 degenerate bboxes,
0 centres outside the building extent. Also: patch applies clean standalone via bare sqlite3
(490 rows, 19 distinct parents), witness header's stale "Garage: source lost" note corrected,
modeller sw v47→v48. No OCI upload needed — Garage_ARC.db and its patch are GH-Pages-served from
the repo's `modeller/` folder (unlike the Clinic/HHS viewer-side OCI DBs).

**Shipped:** bim-ootb PR #1280 (`fix/garage-arc-nogeo-compose` off origin/main 366ed42),
auto-merge armed after fast-checks SUCCESS. §NOGEO_COMPOSE per-building ghost table now reads
zero across all 8 named buildings; nothing remains in this class.


## ▶ SPEC 2026-08-11 (evening): phase-window collapse — the capstone piece, NOT YET DISPATCHED
User's stated end goal, verbatim: "land a 4D construction mechanism that rids the long tail of users
from ever thinking about 4D editing or at least reduced... one achievable hanging fruit, because all
it has to do is not to leave a hanging item that has support not appearing first." This is that piece.

### Where this sits relative to everything else shipped today
PR #1277/#1278/#1280 all worked at the ELEMENT level (does this specific element have a detected
support). This spec works one level up, at the PHASE-DISPLAY level — the reason `_ogSupportGuard`
has to exist at all: elements get correctly ordered by `computeSchedule`'s generative DAG, then
independently rescaled per phase-bucket for Gantt display (`§PHASE_OVERLAP_BAND`), which can undo
that correct order across bucket boundaries. This spec removes the rescale-independence that causes
that, per Part 2 Option A from the earlier archive — chosen deliberately over Option B (derive
windows from real dependencies, keep independent editability) because the user wants users out of
babysitting the schedule, not a better UI for babysitting it.

### Explicit reversal of a prior ruling — recorded, not silently overwritten
`schedule_gate.js`'s `§4D_BAND_MONOTONIC` (2026-08-02, "Design Ruling A") explicitly chose to KEEP
cross-phase trade overlap: *"A global floor gate would serialize the project and destroy the trade
train — the bands carry Superstructure, MEP Rough-in and Architecture simultaneously on purpose."*
User, this session, confirmed reversing this deliberately: *"Yes I remember it, maybe my fault to ask
for staggering of phases... but at least ARCH/STR should be exempt as they are the physical
foundation. Separate unrelated disciplines can run parallel thereafter if construction practice
permits."* Not a full reversal — a refinement: strict serialization ONLY for the structural backbone,
concurrency preserved (as the 2026-08-02 ruling wanted) for everything downstream of it.

### The two-tier design, DECIDED
**Tier 1 — Backbone, strictly serial:** Substructure → Superstructure → Architecture (in that exact
order, each phase's LAST element must complete before the next phase's FIRST element starts — no
overlap, full stop). This is where "never appears before its support" becomes a structural guarantee
instead of a corrected-after-the-fact one: a single global timeline for these three phases, ordered
directly by the generative DAG's own `ls`/`le`, with no independent per-phase-bucket rescale to undo it.

**Tier 2 — Everything else, one concurrent pool:** `FP`, `ELEC`, `ACMV`, `PLB`, the generic
undifferentiated `MEP` discipline bucket, and Finishes — real discipline data (`elements_meta.
discipline`, measured this session: `STR`/`ARC`/`MEP`/`FP`/`ELEC`/`ACMV`/`PLB` across the 5 shipped
buildings) confirms genuine sub-trades exist, but the generic `MEP` bucket doesn't distinguish which
trade an element belongs to. Considered treating the generic bucket conservatively (its own serial
stage); user overruled with direct observational evidence — "MEP maybe inaccurate, it won't be that
amiss by viewers, and as at present we can see they get constructed rather well" — the real support
DAG (proven `floating=0/8`, hardened further by the concurrently-running closure pass) is what
prevents "built before support," not discipline bucketing; the bucket only affects display grouping.
**Decided: no special-case for the generic MEP bucket — it joins Tier 2's single concurrent pool
along with the granular disciplines.** Each element in Tier 2 is still individually gated by the real
support DAG exactly as today — Tier 2 removes the ARTIFICIAL phase-window barrier between
disciplines, not the real per-element dependency check.

### What this does NOT change
The generative DAG (`schedule_gate.js` `computeSchedule`, `auditFloating`, the hang-gate, wall-carries,
etc.) — untouched, already proven, this spec only changes how its output gets mapped into the
displayed/Gantt timeline. Per-element correctness work (the 250→? remaining `§SUPPORT_UNCHECKED`
findings, the guard bug fix, Gap A) is the currently-running closure pass (Task #14) — separate,
complementary, must land first since it touches the exact same files this spec would touch next.

### Blocked on, not yet dispatched
The closure-pass agent (branch `fix/4d-support-order-closure`) is still actively editing
`time_machine.js`/`schedule_gate.js` as of this write. Dispatching this spec's implementation now
would guarantee a file collision. Queued to start the moment that PR lands — check `gh pr list` /
`git log origin/main` on `~/bim-ootb` for its landing before starting a new worktree for this.

### Open implementation questions for whoever picks this up (or the next dispatch)
1. Where exactly does the Tier 1 / Tier 2 boundary enforcement belong — inside `_ogSupportGuard`
   (repurposed rather than deleted), inside the phase-window construction in `time_machine.js`
   (`§PHASE_OVERLAP_SUPPORT_GUARD` region, ~4180-4300), or as a new, smaller function once the
   independent-rescale-per-bucket code is removed? Read the closure pass's landed diff first — it may
   have already touched this region's bug (the unbounded bearing test) in a way that changes the
   right seam to build this on top of.
2. Confirm empirically (don't assume) that Tier 1's three phases, once forced strictly serial, don't
   produce a wildly longer total schedule duration than today's overlapped version, on at least one
   real building (Terminal or Hospital) — report the number, let the user see the real cost/benefit,
   don't silently accept a schedule that's 3x longer without saying so.
3. Movie Maker / Time Machine playback (`viewer/time_machine.js`'s cinema path) consumes this same
   timeline — verify it still compresses/renders sensibly against a two-tier (serial-then-parallel)
   structure rather than the fully-interleaved one it renders today; the user named this as a real
   benefit ("the movie maker will compress well, and each phase can be sighted") — confirm it actually
   delivers that, don't just assume the visual improvement follows automatically from the data change.

### Safeguard, added same session — misclassified furniture must NOT ride into Tier 1
User: "knowing furniture can be part of ARCH, thus the caution there to caveat those to last."
Checked against the real `SEQUENCE_RULES` table (Q2's extraction, this doc): `IfcFurniture`/
`IfcFurnishingElement` already resolve cleanly to `Finishes/seq=11` — genuinely-tagged furniture is
already last, already safe under Tier 2. **The real risk is furniture that ISN'T cleanly tagged** —
source IFCs that export furniture-like content as `IfcBuildingElementProxy` (which resolves to
`Architecture/seq=5`, i.e. Tier 1) because the authoring tool had no proper mapping for it — the exact
same generic-catch-all failure mode already found driving a real share of the big-element findings in
PR #1277/#1278. Undetected, that would pull a chair or desk into the strict serial backbone and gate
real structural completion on furniture — a correctness bug in the OPPOSITE direction from this
session's main thread, but a real one.

**Required before Tier 1 goes live, not optional:** extend the existing `SEQUENCE_NAME_OVERRIDES`
mechanism (already proven twice this session — curtain-wall glazing disambiguation, Terminal's
`foundation_pile_misclassified_slab` fix) with a furniture-pattern override that reclassifies any
element matching common furniture naming (measure real name patterns across the 5 shipped buildings
first — EXTRACT, don't guess a regex — the way the pile fix measured `str-fo|\bpile\b` against real
data before shipping) to `Finishes/seq=11` regardless of its raw IFC class. Scope this check to
`IfcBuildingElementProxy` and other generic/unclassified buckets specifically — don't touch classes
that are already unambiguous (e.g. a real `IfcWall` should never match a furniture pattern by
accident). Add a witness asserting zero furniture-pattern matches remain in Tier 1's phase set after
the override runs, on all 5 buildings.

**Checked same session, not left as a guess:** a first naive pattern (`table|cabinet|...`, unscoped)
produced 327 "hits" — almost entirely false positives (`table` substring-matched "adjus**table**" in
a shower-head name; `cabinet` matched a fire-extinguisher cabinet already correctly in `MEP Final`/
Tier 2, and a wall-opening element for a cabinet insert, not the cabinet itself) — exactly the kind of
noise the "measure, don't guess a regex" instruction above exists to prevent. Re-run scoped correctly
(word-boundary pattern, `IfcBuildingElementProxy` only — the actual Tier-1-risk class): **zero real
hits across all 5 shipped buildings.** No live evidence of furniture misclassification today — the
safeguard is still required (the pile-misclassification precedent proves this bug class is real on
real-world IFCs, just not present in this sample), built proactively, not because it's currently firing.

### Storey-by-storey discipline — already preserved, not something Tier 1 needs to rebuild
User: "at one time we do see storey by storey rule in action too, where a storey gets completed before
the next, again for constant consideration." Confirmed: that's `§4D_BAND_MONOTONIC`
(`schedule_gate.js`, 2026-08-02) — a trade cannot run ahead of ITSELF on the floor below (Level 3's
walls wait for Level 2's walls of the same trade). It lives inside `computeSchedule` itself, which
this spec's own "What this does NOT change" section already leaves untouched — Tier 1 only reorders
how `computeSchedule`'s OUTPUT gets mapped to the displayed timeline, it doesn't rebuild the ordering
logic. So this discipline carries forward automatically, not a new item to implement. Note for
provenance: an EARLIER, stricter version existed first — a hard "band N waits N-1" floor gate — and
was replaced 2026-05-30 specifically because it floated beams over still-building tall columns
(Hospital's columns average 6.87m against 3m bands, so a column spanning multiple bands got released
too early relative to its own real height). `§4D_BAND_MONOTONIC` is the refined per-trade successor
that fixed that measured bug while keeping real floor progression — Tier 1 inherits the fixed
version, not the one with the known defect.

## ▶ 2026-08-11 — CLOSURE PASS: the four remaining support/order items, one PR (bim-ootb `fix/4d-support-order-closure`)
User mission verbatim: "Put to rest this already weeks running issue of getting 4D generated
schedule physically constructed perfectly." Four items dispatched as one coherent pass; all four
resolved — two by code fix, one by latent-gap close, one by root-causing a long-standing FAIL as
witness rot. Honest bottom line first: **the remaining §SUPPORT_UNCHECKED population is now 246,
of which 246 are evidence-classified data/modeling limits (class b) — no further clean code fix
exists in this lane without inventing physics.** Forensics scripts + all run logs preserved in the
session scratchpad `4d_closure_logs/` (forensic_250.log, measure_sog_pattern.log, debug_leak7.log,
og_bound.log, layer_truth_base.log, …) — key numbers all restated inline here and in the PR body.

### Item 1 — the 250 §SUPPORT_UNCHECKED findings root-caused (fresh re-measure: exactly 250)
Method identical to PR #1278: per-finding neighborhood forensics from real DB geometry (nearest
pool member below/above, co-planar count, any-class bearing, ground offset, family names), across
all 5 buildings. Cluster verdicts, all measured not guessed:
- **ONE clean (a)-class fix found and shipped**: `slab_on_grade_substructure` name-override
  (rates.js + rates/sequence_rules.json, the pile-override mechanism). Slab-on-grade is the
  original 1c spec's own named ground-bearing class ("IfcFooting/IfcPile/slab-on-grade rests on
  unmodeled soil") — but only class-level rules ever implemented 1c, so plain-IfcSlab
  slabs-on-grade sat at seq 4 warning forever. Pattern `slab[ _-]?on[ _-]?grade` under the IfcSlab
  class gate measured against EVERY shipped buildings/*.db: exactly Duplex 4 + Clinic 4, zero
  elsewhere, every hit at true grade over its own footings (Duplex: footing tops 1.1m below over
  fill). Duplex unchecked 6→2, TOTAL 250→246, per-building floating HELD (8/0/0/0/1).
- **Class (b) — real detection/modeling limits, documented, warn-only stays (the remaining 246)**:
  1. *Co-planar framing* (Terminal 22 IfcBeam, Hospital ~56 IfcBeam + C-channels/UBs): secondary
     members supported by SAME-elevation primaries (coplanar pool neighbors med 3–6); bearing
     requires a base strictly below — a symmetric co-planar "carries" relation would create DAG
     2-cycles (pool members have outgoing edges), not a §HANG_NEAREST-shape safe extension.
  2. *Wall-through-slab idiom* (Hospital 39+24+7 walls, Clinic partition/furring walls): Revit
     bottom-constraint puts the wall base 0.3–0.4m BELOW its own floor slab's base; the slab
     crosses the wall's base plane from above (wall is the slab's DAG support, not vice versa —
     crediting the slab would contradict the scheduled order and flip these to floating).
     geoGate's below-clause still gates them after the storey below — ordering is sane, only
     CONTACT-bearing is unverifiable.
  3. *XY-isolated railings* (Hospital 30): balcony/roof-edge railings whose bbox overlaps ZERO
     pool members at any z (outside every slab bbox). Nothing to detect against.
  4. *Absent transfer structure* (Terminal 7 observatory IfcColumn, base 4m above nearest slab;
     Hospital 13 'Brick Column w_cap' standing on WALLS — wall-carries-column is barred by the
     MEASURED M3 rule, 3421 false positives when class-blind; HHS top-level ducts/sun-shade
     louvers with no pool above; HHS 66×53m ground plate in a bms=false building).
  Gate-vs-warn verdict unchanged: these 246 are true "nothing detectable supports this" signals
  on which a gate would false-block; the warn is the correct final state.

### Item 2 — Part 2 Option C SHIPPED as §OG_BEARING_BOUND (A/B untouched, still the user's open decision)
The archive's "verified unbounded-upward bearing bug" was real but subtler than written: the
unbounded test was DELIBERATE alignment (§4D_LAYER_TRUTH 2026-08-07 — the old ±GAP band was
narrower than the audits and left exactly 25 audit-visible staged violations; the code comment
says so). A naive bound would re-open that desync. Shipped fix = **two-tier, applied to BOTH
halves of the aligned pair** (guard `_ogSupportGuard` block AND judge `_buildXraySupportCache` in
time_machine.js; schedule_gate.js untouched — generative path/floating baselines can't move):
in-extent carriers (top ≤ T.top+GAP — the wallCarries "carry at top, never metres below the
crown" lesson generalized to the element's own span) define the bearing plane; ENVELOPING
carriers (full-height column a beam frames into) still DETECT as support but only GATE when no
in-extent carrier exists — support is never reduced to zero, no new silent-unchecked population.
**Measured: 1,072 over-corrections removed** (Terminal pushed 32,907→31,842, Hospital
24,576→24,569), detection byte-identical, guard↔judge staged=0 on both fixtures, and a
deliberately-desynced control (unbounded judge over bounded guard) fires 129/121 — the symmetry
assert has teeth. NEW `viewer/tests/witness_og_guard_bearing_bound.js` (9/9).
**Bonus real finding**: `witness_gantt_og_grid_perf.js` had been DEAD on main since 2026-08-07 —
its slice end-mark text rotted when §4D_LAYER_TRUTH reworded the guard's log line, so it THREW at
load; its brute-force reference had also frozen at pre-sweep/pre-hang semantics. Revived: current
sweep+hang+two-tier reference, Duplex 0/1122 mismatches, Terminal 7806ms/2 sweeps (ceiling 15s).
⚠ Merge-conflict note: the unmerged `fix/gantt-refold-hang` branch (worktree /tmp/wt-refold-hang)
extracts this same guard block verbatim and rewrote og_grid_perf its own way — whichever lands
second syncs per the N-terminal rule (BEHIND/DIRTY = sync, not redo).

### Item 3 — Gap A closed: `IfcPile` SEQUENCE_RULES entry
rates.js + sequence_rules.json, mirrors IfcFooting exactly (Substructure/1/CONCRETE_GANG). Latent
by construction: zero count change on all 5 buildings (re-verified in the coverage witness run) —
pure correctness for any future building that labels its piles honestly. Comments naming the
seq-1 population (schedule_gate.js bms block, coverage-witness header) updated to the now-three
class rules + two name-overrides.

### Item 4 — `witness_geo_support_leak` "pre-existing FAIL 10/7" ROOT-CAUSED: witness rot, not an engine bug
Two independent rot axes, both proven by differential runs (logs saved):
1. **It never tested the code under review**: `VIEWER_DIR` defaulted to the absolute shared
   checkout `/home/red1/bim-ootb/viewer` — 118 commits behind origin/main at measurement time.
   Same witness, same fixtures, pointed at current main: 10 ungated/7 leaked → 2/2, zero code
   changes. (JKR's 2 walls + Hospital's 2 truck-proxies + 1 wall were all fixed by #1276-era
   engine work; the FAIL number was frozen history.)
2. **Its `isRealSupport` froze at v2 (2026-08-04)** while shipped geoGate moved twice: §DEQ_V1
   strict base (co-based ≠ support, antisymmetry) and #1276 lower-half containment (an upper-half
   neighbor rests ON you). The final 2 "leaks" are exactly those two exclusions (Hospital
   `0KbYdy…bo9` 11m blockwork wall — only candidates top in its UPPER half; `0WoET…Ltn` proxy —
   only candidate co-based within EPS): genuinely zero detectable support under current physics,
   NOT geoGate misses; bo9 is precisely one of item 1's 177 warned findings.
v3 shipped: predicate aligned to current geoGate, VIEWER default = own checkout (env overrides
kept). Result: **0 leaked, WITNESS PASS** (2 ungated reported, correctly). Same root cause family
as item 2's dead witness — this pass un-rotted two witnesses and re-pointed one at its own tree.

### Regression sweep (every log read, none exit-code-only)
big_element_support_coverage 26/26 at re-locked baselines (Terminal 32 / Hospital 177 / Duplex 2 /
HHS 13 / Clinic 22 = 246, floating 8/0/0/0/1 HELD) · tm_geo_order_cycles 5/5 (cycles=0,
floating=8 EXACT, hangNearest=217 unchanged) · gantt_lock_integrity PASS (§LI_COST 63,415
floating=0) · test_schedule_gate 3252→0 · geometric_support_order 0 shifts · default_engine_quality
0/48428 · chunk_only 164 files 0 hits · **nogeo_compose §NOGEO_WITNESS_TOTAL pass=9 fail=0 in BOTH
viewer and modeller modes** · facade/host GREEN · gantt native/shift/baseline/undo/shop-dates PASS.
`witness_gantt_refold_yield` does NOT exist on main (only on the unmerged refold branch) — N/A here.
LIVE `witness_4d_layer_truth` (Playwright, real Hospital, worktree served on :8484): the invariants
this diff touches are GREEN — §XRAY_EDGES staged=0/63415, §SUPPORT_CHECK floating=0/63415 — but the
witness's OVERALL verdict FAILs on two OTHER rotted expectations, CONFIRMED IDENTICAL ON BASE
origin/main (differential run, :8485): (a) `noGeoParked>0` — obsolete since the §NOGEO_COMPOSE lane
zeroed Hospital's ghosts (parked=0 is now the healthy state); (b) `first20Clean` — a
IfcWallStandardCase in day-1 ops, which is the live face of item 1's documented zero-candidate
wall class. Pre-existing, not touched by this PR; named here as the third rotted witness of this
family — repairing its two expectations is a small follow-on for whoever next touches that file.

## ▶ 2026-08-11 (late): §TIER_SERIAL SHIPPED — phase-window collapse, PR #1282 (bim-ootb `feat/4d-phase-window-collapse`)
The evening spec above implemented and merged as one PR. All three open questions answered with
measured numbers; two mid-flight findings changed the internal design (both measured, neither
changes the decided two-tier structure). Every § number below is from saved logs (worktree
`_logs/` + session scratchpad `tier2_logs/`: furniture_measure, tabletop_measure, stragglers,
promoted_deps, clinic_cycle, w_tier_serial4, w_live_tier, plus one log per regression witness).

### What shipped (viewer/time_machine.js + rates.js + rates/sequence_rules.json + new witness)
- **Tier 1 strictly serial, Tier 2 one concurrent pool** — exactly the decided design.
  `_twoTierRemap` (new, top-level, sliceable) = `_tier1Serialize` (uniform phase-group shifts) +
  `_tierAuditRegate` (push-after-support fixpoint) + §TIER_DAG_WINS marking, applied to
  computeSchedule's output BEFORE the kernel_ops write. `_sched` stays RAW — §SUPPORT_CHECK/
  §ROOF_GATE audit the generative layer unchanged; **schedule_gate.js has a ZERO-LINE diff**
  (the §4D_BAND_MONOTONIC / auditFloating "untouched" requirement verified, not assumed).
- **_cap overlay = Option A**: ONE global monotone affine into the captured project window
  replaced the independent per-task rescale + §STAGGER_HOST (measured inert since §4D_LAYER_TRUTH's
  ls-affine — element times derive from ls alone, its reshuffle changed nothing) + guard-as-repair.
  The §PHASE_OVERLAP_SUPPORT_GUARD block was hoisted VERBATIM (byte-identical interior, original
  indentation — both slicing witnesses' markers intact, re-run green with identical numbers) into
  `_ogSupportSweep`, kept as cap-path verification: live Hospital run = 0 pushes, the affine
  preserves order by construction. `_GANTT_CACHE_VERSION` 8→9 (stale-IDB purge), sw v978.
- **Furniture safeguard**: `furniture_generic_bucket` NAME_OVERRIDE — word-boundary terms, scoped
  to IfcBuildingElementProxy/IfcBuildingElementPart per the spec's measurement (naive unscoped =
  327 FPs, re-confirmed). Zero live hits on all 5 buildings (proactive, as specced). NEW REAL FIND
  while measuring: Terminal `IfcSlab` 'Floor:Table Top:904745' — a 3.96×22.43m ×150mm built-in
  counter in Superstructure. Deliberately NOT reclassified (IfcSlab = unambiguous class per the
  spec's own scoping rule, and it is a seq≤4 support-pool member — reclassifying would perturb the
  locked floating/§SUPPORT_UNCHECKED baselines); the witness NAMES and LOCKS it (Terminal=1,
  others=0) as reported-not-gated. If ever ruled furniture, it is a one-line override with the
  witness already watching.

### Open question 1 — where the enforcement lives (resolved against post-#1281 code)
New smaller functions upstream of the write (option 3 of the spec's list), with the guard
"repurposed rather than deleted" (option 1) as the cap-path verifier. #1281's §OG_BEARING_BOUND
landed untouched — its two witnesses re-ran green byte-identical (9/9, 1,072 removed, desync
controls 129/121; og_grid_perf 3/3, Duplex 0/1122, Terminal 8767ms < 15s ceiling).

### Mid-flight finding A — guard physics is NOT the remap physics (measured, forced a redesign)
First implementation re-gated Tier 2 with the hoisted guard block. The new witness caught it:
guard/judge grids are seq≤4-only — **promoted roof slabs are audit/DAG carriers but invisible to
the guard** — so Tier-1 shifts stranded audit-visible dependents (HHS alone: 1,383 rooftop/hanging
elements floating vs their shifted promoted-slab carriers; Terminal 159, Duplex 81). Fix:
`_tierAuditRegate` mirrors auditFloating's full physics (struct∪promoted pools, walls-for-promoted,
unbounded bearing max, hang + §HANG_NEAREST + both antisymmetry exclusions). schedule_gate.js
stays untouched, so this is a deliberate, WITNESS-PINNED mirror: W-TS-2 runs the REAL auditFloating
over the remap output on all 5 buildings — drift surfaces as displayed>raw floating. Result:
displayed floating == raw floating EXACTLY (8/0/0/0/1) on all 5. Note the pre-existing asymmetry
this exposed (guard/judge blind to promoted-slab carriers) is now documented here — a candidate
follow-on for whoever next touches the guard/judge pair, NOT fixed in this PR.

### Mid-flight finding B — §TIER_DAG_WINS: where strict serialization is topologically impossible
Two measured shapes of Tier-1 elements the support DAG itself places inside a LATER phase:
- Isolated forward deps: Hospital's 'Foundation Slab' IfcFooting + Clinic's 2 slab-on-grade —
  each poured around full-height Superstructure columns whose base sits below theirs.
- **The wall-carried cone**: Terminal has 45 direct "upper column stands on a load-path-PROMOTED
  structural flat slab" edges (promoted_deps.log); the whole dependency cone above them —
  **24,007 of Terminal's 34,768 Superstructure elements** — must follow Architecture-phase
  carriers. HHS: same shape, 420. A frame building barely has any (Hospital 9, Duplex 0).
Support order WINS for these (the mission's own ranking): they ride the regate at DAG-consistent
times, are excluded from the serialization extents, and are counted (`tier1DagWins` in the
§TIER_SERIAL log) + per-building LOCKED in the witness (24007/9/0/420/6). **Honest bottom line:
on Terminal/HHS the backbone is strictly serial for the serializable population, and the
wall-carried cone plays through the Architecture window in real per-storey construction order —
that is the building's extracted topology, not a solver shortfall. Hospital/Duplex/Clinic get the
clean textbook Sub→Super→Arch the user pictured.**
Also measured: the regate must EXEMPT the raw floating tail (the DAG's own deliberate
cycle-breaks) — chasing Clinic's parapet-wall/roof-slab loop pushed 43k times over 400 sweeps
without converging (clinic_cycle.log). Exempting it makes the enforced constraint set exactly the
raw-satisfied one, so the fixpoint provably exists; Clinic converges in 3 sweeps.

### Open question 2 — the real serialization cost (§TIER_COST, display layer only)
Terminal 113.1→191.4d (**1.69x**) · Hospital 314.9→603.9d (**1.92x**) · Duplex 10.5→10.5d
(**1.00x**) · HHS 46.1→69.4d (1.51x) · Clinic 143.7→206.8d (1.44x). The ~2x on Hospital is the
genuine price of a serial backbone (Architecture's 17,236 elements no longer overlap
Superstructure's tail) — visible, not hidden; the generative layer and all its baselines are
unchanged, and on the live _cap path the whole timeline is affine-compressed into the captured
project window, so the user-visible project span is set by the authored window as before.

### Open question 3 — Movie Maker verification (§TIER_MOVIE + live run, numbers not eyeballs)
Backbone slices are exclusive + contiguous on every building (Hospital: Sub 1.7% / Super 49.1% /
Arch 49.2% of the timeline; shares sum ≤100%), Tier 2 fills alongside (100% of Tier-2 elements run
concurrent with a backbone window on the 4 larger buildings). LIVE (puppeteer, real Hospital,
worktree :8450): §TIER_SERIAL overlapPairs=0 dagWins=9 · §SUPPORT_CHECK floating=0/63415 ·
§XRAY_EDGES staged=0/63415 · **§GANTT_OPS_FIRST20 is now ALL IfcFooting** — the movie opens with
foundations (the day-1 wall that rotted witness_4d_layer_truth's first20Clean expectation is gone;
that witness's expectation can likely be un-rotted by whoever next touches it). Live also
confirmed the _cap path IS the live default (viewer auto-authors 35 zone tasks, covered=100%) —
so Option A is exercised in production, not just in harnesses.

### Regression sweep (every log read; differential runs where a FAIL appeared)
NEW witness_tier_serial_display 41/41 · og_guard_bearing_bound 9/9 · gantt_og_grid_perf 3/3 ·
big_element_support_coverage 26/26 (246 + floating 8/0/0/0/1 HELD) · tm_geo_order_cycles 5/5
(cycles=0 floating=8 EXACT) · gantt_lock_integrity 19/19 (§LI_COST 63,415 floating=0) ·
geo_support_leak PASS · test_schedule_gate 3252→0 · nogeo_compose 9/9 · default_engine_quality
0/48428 · geometric_support_order 0 shifts · chunk_only 164 files 0 hits · facade/host/stagger
GREEN · gantt native/shift/baseline/undo/shop-dates/bar-identity/row-order/edit-coherence/
zstack/wall-carrier-scope ALL PASS. **Pre-existing FAILs, proven identical on origin/main by
stash-differential (named, not touched):** (a) gantt_ops_blackbox G-3 — computeDays carries a
DUPLICATED §GANTT_AXIS_OUTLIER block whose second copy reads `_ops` (incl. bookkeeping ops)
instead of `cOps`, so the display axis absorbs BUILDING_OPEN; (b) witness_4d_roof_load_path
G-RLP-2 + its LTU_AHouse §SUPPORT_CHECK floating=2839/122330 — third/fourth members of the
rotted-witness family the closure pass documented.

### Merged + notes
PR #1282, auto-squash. ⚠ The unmerged `fix/gantt-refold-hang` branch extracts the guard block
verbatim and now conflicts with its hoist into `_ogSupportSweep` — whichever lands second syncs
per the N-terminal rule. Follow-ons named (not owed by this lane): guard/judge promoted-slab
blindness (finding A), the two rotted witnesses in (a)/(b), witness_4d_layer_truth's two stale
expectations (first20Clean now likely fixable), and the schedule_author.js §PHASE_OVERLAP_BAND
task-window GENERATION (bar dates in the tasks table still author overlapped windows — display
timing no longer follows them per-bucket by design, but a future pass could serialize the authored
backbone windows too so the Gantt bar dates match the two-tier element reality exactly).

## ▶ 2026-08-11 (night): CHASE-TO-ZERO — all named follow-ons closed, LTU+JKR covered, PR #1283 (bim-ootb `fix/4d-chase-to-zero`)
User mission: "You have to chase any FAILS/gaps till zero. Meanwhile have u tested on JKR or LTU?"
Plus mid-pass priority note: "Even if it improves LTU ARCH parallel phase to consecutive be good
enough as initial start, was too fast coming on." All six dispatched items closed; every log read.

### Item 1 — gantt_ops_blackbox G-3 FIXED (6 pass/1 fail → 7/0)
Exactly as diagnosed: `computeDays` carried a byte-duplicate `§GANTT_AXIS_OUTLIER` block (same
`var` redeclarations, so no syntax error) whose second copy read `_ops` and OVERWROTE the qualified
axis. Duplicate deleted; the cOps block is the single authority. Axis: 2026-08-04 (BUILDING_OPEN
wall-clock) → 2024-08-05 (real construction max end).

### Item 2 — witness_4d_roof_load_path un-rotted (7/9 → 9/9), engine healthy
Forensic probe (probe_rlp2.log): the refold DID rerun (sync injectGantt blocks the event loop ~10s
— why the witness's wait loop "returned" at 1000ms) and `§GANTT_OVERRIDE 11 slabs promoted
(seed=10 + M4=1)` fired WITH storeys blanked — G-RLP-2's claim is true in the engine. The rot: on
the `_cap` path (the live default since auto-authored zone tasks) every covered op's `phase` param
is overwritten with the task NAME (`p.phase = w.name` — "Superstructure — Level 7"), so
`phase==='Architecture'` was a dead detection channel. Fix: engine exposes
`window.__tmLoadPathPromoted` (the `__tmGanttShift` debug convention; `_promoteRoofLoadPath` now
returns its promoted GUIDs); G-RLP-2 nulls it before refold and requires it repopulated with both
slabs; G-RLP-3 asserts the floor-slab control absent from it. G-RLP-6's LTU `=0` also un-rotted →
locked at the live-vintage 334 (item 4).

### Item 3 — witness_4d_layer_truth un-rotted (FAIL → PASS)
Baseline run confirmed the capstone's prediction exactly: staged=0, floating=0, first20Clean
ALREADY true (all IfcFooting — #1282 removed the day-1 wall), refolds=0; the ONLY failing
expectation was `parked>0` — obsolete since §NOGEO_COMPOSE zeroed the ghost population (§4D_NOGEO
never prints with nothing to park). Expectation rewritten to the actual invariant: (no §4D_NOGEO
line OR parked>0) AND no `§GANTT band 0 z=[0.0,0.0]` day-0 population (the witnessed pre-fix
signature). first20Clean kept and re-locked.

### Item 4 — LTU_AHouse: 2839 root-caused as VINTAGE, §TIER_SERIAL confirmed live, 334 = documented tail
- **Vintage differential (probe_ltu.log)**: live-served `_meta`/`_geo` pair (§6.9) → rawFloating
  **334**/122330, unchecked=611; old `_extracted.db` → **2839**/122330, unchecked=70. The doc's
  2839 was measured against the file real users don't get; the Aug-10 re-extraction fixed ~2500
  wrong-order floats (trading them for honestly-unverifiable warns). Browser run confirms 334
  end-to-end (§SUPPORT_CHECK floating=334/122330 live).
- **The 334 (probe_ltu_cycles.log)**: ALL 334 are support-POOL members; 172 have a co-planar
  carrier (the symmetric "would create DAG 2-cycles" class); §SUPPORT_CYCLE cycles=25,393 on the
  live vintage (the 75,943-cycle class, improved by re-extraction, still structural); §DEQ_REPAIR
  repairs seq>4 ONLY by design — pushing a pool member of a mutual pair never converges (the
  measured Clinic 43k-pushes/400-sweeps lesson). Verdict: same class-(b) warn-only family as the
  closure pass's 246, at steel-detail scale. LOCKED (not hidden) in three witnesses.
- **The user's minimum bar — MET**: §TIER_SERIAL applies to LTU unchanged: tier1OverlapPairs=0,
  dagWins=882, iterations=2. Architecture RAW window started **day 0.0** (fully parallel — "too
  fast coming on"); displayed window starts **day 214** after Superstructure's serialized extent
  (§TIER_COST ratio 1.19, 810.9→966.1d). LTU is now a permanent member of tier_serial_display +
  big_element_support_coverage, tested at the LIVE vintage.
- **Canonical-vintage question NOT decided** (explicitly the user's open call): witnesses test what
  live users get; both files left untouched.

### Item 5 — JKR first-ever coverage, all green at measured baselines
floating=**81**/8985 (same steel co-planar family: CHS members 33, columns 24, slabs 18, beams 6),
unchecked=**6**, bms=**false** (zero seq-1 elements — foundation slabs authored plain IfcSlab at
the z≈84m site datum), tier1OverlapPairs=**0**, dagWins=**398**, dispFloating==raw (81),
§TIER_COST ratio 1.59 (36.4→57.8d). geo_support_leak (already had JKR): ungated=0 leaked=0.
Witness extensions: tier_serial_display 41/41 → **57/57**; big_element_support_coverage 26/26 →
**37/37** — 5-building locked baselines byte-held in both (floating 8/0/0/0/1, 246 unchecked
total, dagWins 24007/9/0/420/6). Furniture safeguard measured 0/0 on both new buildings.
Mechanism witnesses (lock_integrity, og_bearing_bound, og_grid_perf, gantt family) are
fixture-scoped — run green as-is; not force-parameterized to JKR.

### Item 6a — §PROMOTED_CARRIER_POOL: guard/judge promoted-slab blindness FIXED (finding A closed)
Guard (`_ogSupportSweep`) + judge (`_buildXraySupportCache`) struct grids were seq≤4-only. Pool
aligned with auditFloating's (seq≤4 ∪ promoted slabs, bearing AND hang — the same move
`_tierAuditRegate` already made); both witness REFERENCE implementations (og_grid_perf brute-force,
og_bearing_bound detection grid) mirrored in lockstep — their own documented lifecycle. Proof the
fix is live and safe: **§XRAY_EDGES n=38039 → 38117 on live Hospital (+78 real promoted-slab
edges), staged=0 HELD** (guard/judge stay one physics — guard pushes start past carrier end, so
judge-after-guard is 0 by construction); og_bearing_bound 9/9 byte-same numbers (removed=1072,
desync 129/121 — its harness has no promoted slabs, correctly unaffected); og_grid_perf 3/3
(Duplex mismatches=0/1122 vs the UPDATED reference = shipped≡reference under the new semantics;
Terminal 7862ms < 15s, pushed=33422 unchanged).

### Item 6b — §PHASE_OVERLAP_BAND authored-window serialization: NAMED REMAINING, deliberately not forced
Serializing the AUTHORED task windows changes user-editable tasks-table bar-date semantics on
every newly generated schedule — a visible design change the doc itself frames as "a future pass
could". ⛔ BLOCKED on one design question for the user: **should authored Gantt bar windows also
serialize to match the two-tier display, changing bar layout for all newly generated schedules?**

### Regression sweep (post-change, every log read; logs in worktree `_logs/`)
tier_serial 57/57 · bigsup 37/37 (LTU 334/611, JKR 80/6 — coverage-witness floating differs ±1
from probe by duration approximation, reported not asserted) · tm_geo_order_cycles 5/5 (cycles=0
floating=8 EXACT) · lock_integrity 19/19 (§LI_COST 63,415 floating=0) · geo_support_leak PASS ·
test_schedule_gate 3252→0 · nogeo_compose 9/9 · default_engine_quality 0/48428+0/63415 ·
geometric_support_order 0 shifts · chunk_only 164/0 · facade+stagger GREEN · gantt
bar-identity/row-order/edit-coherence/native/ruler-shift/baseline/undo/edit-lock/group-move/
bars-in-rect/single-load/retime-resync/shop-dates ALL PASS · zstack PASS · wall-carrier 14/14 ·
LIVE layer_truth PASS · roof_load_path 9/9 · ops_blackbox 7/7.

### Merged + notes
PR #1283, auto-squash. ⚠ The `fix/gantt-refold-hang` conflict caution now covers the guard block's
two new §PROMOTED_CARRIER_POOL lines too — whichever lands second syncs per the N-terminal rule.
Chase-to-zero ledger: items 1,2,3,4,5,6a ✅ DONE (witnessed) · 6b ⛔ BLOCKED on the one design
question above · LTU canonical-vintage question remains the user's (unchanged by this pass).

## ▶ SESSION CLOSEOUT 2026-08-11 — all pushed live, lane paused here for a new session

### Full arc, this session, in order (all merged, all verified against origin/main not assumed)
1. **PR #1277** — `§SUPPORT_UNCHECKED` warn-only observability (bim-ootb).
2. **PR #1278** — root-caused Terminal's 236 (misclassified foundation piles) + Hospital's 139
   (rod-suspended MEP, `§HANG_NEAREST`). 831→250.
3. **PR #1280** — Garage_ARC's 19 ghosts (source IFC was NOT lost, found under
   `~/Projects/bim-compiler/DAGCompiler/lib/input/IFC/` — see `reference_source_ifc_locations.md`).
   `§NOGEO_COMPOSE` closed, 8/8 buildings.
4. **PR #1281** — closure pass: `§OG_BEARING_BOUND` (Part 2 Option C), slab-on-grade reclass
   (250→246), Gap A closed (`IfcPile` sequence rule), `geo_support_leak` un-rotted.
5. **PR #1282** — `§TIER_SERIAL` two-tier phase-window collapse (the original capstone): Tier 1
   (Substructure→Superstructure→Architecture) strictly serial; Tier 2 as one concurrent pool.
6. **PR #1283** — chase-to-zero: 3 more witnesses un-rotted, JKR + LTU_AHouse extended (JKR
   floating=81, LTU 2839 root-caused as a stale-vintage artifact → 334 on the live-served pair),
   `§PROMOTED_CARRIER_POOL` guard/judge alignment fix.
7. **PR #1286** — **the real correction**: PR #1282's Tier 2 ran CONCURRENT with Tier 1. User's
   original words were "separate unrelated disciplines can run parallel **thereafter**" — after
   Tier 1 finishes, not alongside it. Caught live by the user watching HHS's actual movie, not by
   any witness — every prior witness checked internal consistency against what was built, never
   against the user's literal wording. Fixed: Tier 2 now uniformly shifts to start only after
   Tier 1's TRUE completion (stragglers included). Verified exact match on all 7 buildings (MEP
   Rough-in's start == Architecture's end, to the day, e.g. HHS 68.9d==68.9d). Confirmed (not
   assumed) the live `_cap` affine overlay absorbs the larger internal timeline into the same fixed
   authored calendar window — real visible movie duration unchanged.
8. **PR #1287** — **second real correction, same session**: PR #1286 shipped without bumping
   `viewer/sw.js` `CACHE_VERSION`, so returning users kept getting the stale pre-#1286
   `time_machine.js` from the service-worker cache. Caught live again — user reported "floats
   still there" with CAM_LIGHT (a v978/v979 feature, PR #1284/#1285) working, which pinned the
   browser at exactly v979: new-enough for torchlight, one version short of the Tier2 fix. Bumped
   v979→v980, merged. **Every code change to `viewer/*.js` in this lane needs a paired
   `sw.js` `CACHE_VERSION` bump in the SAME PR** — this was already this project's documented
   convention (every prior PR #1277-#1285 did it) and I broke it once under the "fix it now" time
   pressure of #1286. Named here so the pattern doesn't repeat: check `git diff --stat` before
   calling any viewer-side PR done — if it touches a `.js` file and doesn't touch `sw.js`, that's
   worth a deliberate check, not an assumption it's fine.

### Process lesson from PR #1286, recorded here because it changes how the next session should verify
Six PRs into this lane, a real gap between spec and shipped code survived witness review, PR review,
AND my own "capstone shipped" report — because I checked "does this pass the witnesses I wrote"
without ever checking "does this literal number match the user's literal sentence." The user's own
words: "isn't this just brought up and u said u done it?... I AM NOT YOUR TESTER." Read as a standing
instruction for whoever picks this up next: when a shipped result includes a concrete, literally-
quotable number (a day count, a start/end time, a percentage), hold that number up against the
ORIGINAL request's actual wording before reporting success — a passing witness proves internal
consistency with what got built, not agreement with what was asked.

### What's LEFT, for a new session — real punch list, not a vague "more to do"
1. **Item 6b (named in PR #1283, still ⛔ BLOCKED, unchanged by this session's later work):**
   should the AUTHORED Gantt bar windows (`schedule_author.js` `§PHASE_OVERLAP_BAND` task-window
   generation — what a PM sees/drags in the task list, separate from the DISPLAY timeline
   `§TIER_SERIAL`/`§TIER2_AFTER_TIER1` compute) also serialize to match the two-tier reality? This
   changes bar-date semantics for every future generated schedule — a real product decision, not
   something to default silently. Surface it fresh, don't assume the answer.
2. **LTU_AHouse canonical-vintage question, still open, still the user's call (named repeatedly,
   never decided):** `_extracted.db` (old, 71MB) vs `_meta.db`/`_geo.db` (new split, live-served) —
   re-extract to unify, or retire one? This session tested against the live-served pair as a
   pragmatic default for verification, but never decided the underlying architecture question.
3. **`fix/gantt-refold-hang` branch, still unmerged (pushed, not witnessed-green as of last check)**
   — extracts the guard block verbatim; now THREE PRs deep of drift from it (`§OG_BEARING_BOUND`,
   `§PROMOTED_CARRIER_POOL`, and now `§TIER2_AFTER_TIER1`'s new code in the same region of
   `time_machine.js`). Whoever picks this branch up needs a real sync against current `main`, not a
   naive rebase — check `git worktree list` first (may need re-adding, prior worktree was pruned).
4. **Modeller was explicitly out of scope this whole session** (user: "Ignore modeller for now") —
   none of `§TIER_SERIAL`, `§TIER2_AFTER_TIER1`, `§SUPPORT_UNCHECKED`, or `§HANG_NEAREST` exist on
   the Modeller side. If/when Modeller's own 4D view matters, this entire lane needs a port
   decision — start from `modeller/str_walker_outliner.js`, same pattern as the earlier
   `§NOGEO_COMPOSE` Modeller port (PR #1273).
5. **The 246 remaining `§SUPPORT_UNCHECKED` findings (PR #1283's number, not re-measured since):**
   documented as genuine data limits (co-planar framing, Revit wall-through-slab authoring idiom,
   isolated railings) — warn-only, never gated. Re-open only if new evidence suggests otherwise; not
   a live task.
6. **3 pre-existing FAILs proven pre-existing via differential testing, not caused by this lane, but
   still real and unfixed:** `gantt_ops_blackbox` (already fixed in PR #1283, scratch this one —
   verify it's actually off this list next session), `witness_4d_roof_load_path` — check current
   status, may already be closed by PR #1283's un-rotting pass, re-verify before assuming still open.

### Verify-before-trust note for whoever opens this file next
Everything above is written as of this session's own knowledge — per this project's own memory
discipline, a file path, function name, or open-question status named here is a claim about what was
true when this was written, not a guarantee it's still true. Re-check `git log --oneline -15` on
`~/bim-ootb` and re-run the witnesses named above before trusting any status claim, this one included.

## ▶ SESSION 2026-08-11 (second pass, same day) — two follow-on gaps found + closed, both MERGED+LIVE

Started as a "check the 8 PRs above are merged/live" verify pass. They were (bim-ootb GH Pages
auto-deploys on push to main — confirmed via `deploy-pages.yml` run history matching each PR's merge
commit). Then the user reported the SAME symptom live ("still floating, ARCH late, MEP first") — two
real, separate gaps this closeout's own witnesses could not have seen, because both live one layer
below `_disp`/`_twoTierRemap`, which is all `witness_tier_serial_display.js` ever checks.

1. **`§KERNEL_OPS_SCHED_VERSION` (PR #1291, MERGED `fd3e021`).** `_activateAsync` only re-materializes
   `kernel_ops` (the table `renderAtTime`/the MaxQ bake actually reveal-order from) when the table is
   EMPTY. A building opened before this session's §TIER2_AFTER_TIER1 fix has `kernel_ops` from the OLD
   algorithm, cached in its IndexedDB DB blob, replayed forever — `_GANTT_CACHE_VERSION` only gated a
   separate JSON cache, never this table. Fix: stamp `_genVersion` on every materialized op, force
   re-materialize on mismatch (`_kernelOpsSchedStale()`, `viewer/time_machine.js`). Witness:
   `viewer/tests/witness_kernel_ops_sched_version.js`, 12/12 PASS, real per-building magnitude if
   stale: Terminal 184.7d, Hospital 564.8d, Duplex 7.5d, HHS 52.7d, Clinic 196.1d, LTU_AHouse 936.0d,
   JKR 52.3d — every shipped building exposed, not just the one reported.
2. **`§DOOR_WINDOW_HOST_WALL` (PR #1294, MERGED `aa15537`, GH Pages deploy confirmed success — live).**
   Deploy briefly stuck-queued 11+ min with no runner assigned mid-session (GH Actions runner outage,
   unrelated to this fix), then cleared on its own. Same class of gap, different layer: `schedule_gate.js`'s two physics gates
   (bearing-below, hang-from-carrier) are both VERTICAL. A door/window is cut SIDEWAYS into a wall —
   neither gate, nor `auditFloating`, ever modeled that (grep-confirmed zero IfcDoor/IfcWindow
   mentions before this fix). No `IfcRelFillsElement`/`IfcRelVoidsElement` is extracted either (no
   such table in the shipped DB — checked, not assumed); host wall found geometrically, reusing
   `wallGate`'s own `wallGrid`+`overlap()`. Measured before fix, all 7 buildings: 0.5%-21.8% of
   doors/windows started before their host wall finished, up to 120+ days early — this is what "2nd
   level doors appear before the walls holding them" and MEP-reads-as-floating actually was, live on
   HHS. After: 0.0% everywhere. `_GANTT_CACHE_VERSION` 9→10 (this changes the gate — riding on item 1's
   fix to actually reach already-opened buildings). Witness:
   `viewer/tests/witness_door_window_host_wall.js`, 10/10 PASS — W-DWH-1a/1b assert the gate is wired
   at BOTH placement call sites; the author's own first cut wired only one and measurably fixed nothing
   (near-identical violation rate) until this exact assertion caught it. Named here so the next session
   doesn't repeat it: **a new gate in `schedule_gate.js` needs wiring into BOTH the initial `placeNonst`
   `Math.max(...)` AND the `§DEQ_V1` repair-loop `Math.max(...)` — one site alone is silently a no-op.**

**Consolidation check (per housekeeping duty):** the PREVIOUS closeout's punch list (item 6b — authored
Gantt bar windows serialization, and the LTU_AHouse canonical-vintage question) is UNCHANGED by this
pass, not re-litigated, not duplicated here — still ⛔ open, still the user's call, see the punch list
above. No standing backlog file exists elsewhere for this lane to merge into; this file remains the
single canonical spec+log.

**Open thread, not yet investigated:** user separately observed HHS Level 3 doors "come on in a split
moment" watching a rendered mp4. Checked (not assumed): the mp4 predates PR #1294 (baked before the fix
landed), and the schedule-DATA side shows no anomaly specific to Level 3 (door-window width 0.94d vs
Level 1's 1.61d/Level 2's 1.11d — narrower, not wider; element count per storey 1427/1505/1783 — not a
size outlier). Two live hypotheses, neither checked yet: (a) the mp4 was simply showing the
pre-#1294 bug (a door 10+ days early reads as a detached "pop" regardless of window width — most
likely, given the timing matches), or (b) something in `cinema_maxq.js`'s frame-to-schedule-time
pacing is non-uniform near that point in the timeline, separate from the schedule data itself and
NOT addressed by #1294. Re-verify against a FRESH bake (post #1294 deploy) before assuming either.

## ▶ SESSION 2026-08-12 (third pass, same continuing session) — one class of gap generalized, one
follow-on found but NOT fixed, one new report NOT yet investigated. Read this whole section before
touching `schedule_gate.js`/`time_machine.js` again — it names two live regressions this pass caused
and reverted, so the mistakes aren't repeated.

**User directive that shaped this whole pass:** "no band aid fix, just generalised solution. It need
not be that strict. Hunt for chances." — i.e. stop patching one IFC class at a time (doors, then
roofs, then whatever's next); find the actual shape of the gap and close it once.

### What's confirmed LIVE (unchanged from second pass, re-verified this pass)
`§KERNEL_OPS_SCHED_VERSION` (PR #1291) and `§DOOR_WINDOW_HOST_WALL` (PR #1294) — both merged, both
GH Pages-deployed, confirmed via `gh run list --workflow=deploy-pages.yml`. Door/window fix witness
(`witness_door_window_host_wall.js`) still needs its wiring-check strings updated — see below, it
currently FAILs after the rename, that's a stale assertion in the WITNESS, not a code regression;
`witness_tier_serial_display.js` (the real regression detector) is clean at 57/57.

### Found: a real generalization, tested clean, NOT YET SHIPPED (parked)
Root cause of the user's original Terminal report ("the roof comes on first before its support"):
NOT the 2 `IfcRoof` elements (checked directly — they schedule day 123.7, correctly late, unaffected
either way). The real find: `schedule_gate.js`'s two physics gates only ever recognized `IfcWall` (or,
for `wallGate`, promoted `IfcSlab`) as a valid "carrier" — a glass roof/awning resting on an "Awning
Support" (`IfcBuildingElementProxy`, not a wall) was invisible to every existing check, same shape as
the door bug, different class.

**Fix built (in `/tmp/wt-roof-fix`, branch `fix/roof-host-wall`, NOT pushed/merged):** `openingGate`
renamed/generalized to `restsOnGate(el, soFar)` — no class whitelist on either side (any non-pool
element may be a consumer; any wall OR any element with `bboxVol > BIG_ELEMENT_VOL` — reusing
`§HANG_NEAREST`'s own already-tuned threshold, not a new one — may be a carrier). One unified
overlap-style Z-band test (`S.base_z <= el.base_z + EPS && S.top_z >= el.base_z - GAP`) covers BOTH
"resting on top of" (roof on wall) and "embedded within" (door in wall) — proved algebraically, see
the function's own comment for the worked cases. `S.seq < el.seq` guards against same-seq siblings
(e.g. two adjacent walls) gating each other.

**⚠ REGRESSION #1, found and fixed within this pass:** first cut fired `restsOnGate` UNCONDITIONALLY
alongside the other three gates. Broke `witness_tier_serial_display.js`'s LOCKED `tier1DagWins`
baseline on 5/7 buildings (HHS 420→0, JKR 398→3, Terminal 24007→12169) — because it now ALSO fired for
elements the other three gates already correctly handle (nearly everything has SOME wall or big
neighbor nearby), reshaping timing broadly instead of only filling the actual gap. **Fix: scoped
`restsOnGate` to fire ONLY as a fallback** — takes `soFar` (the other three gates' already-computed
max) and returns `baseMs` immediately if `soFar !== baseMs`. Same idiom `§HANG_NEAREST` already uses
("only fires when the band scan found NOTHING"), just applied to the opposite direction. Restored
57/57 exactly. **Lesson for next session: any new gate added to this file MUST be checked against
`witness_tier_serial_display.js`'s LOCKED baselines before considering it safe — a green
`witness_door_window_host_wall.js` alone is not enough, that witness only checks doors/windows, not
the wider system.**

**Measured after the fix (fallback-scoped):** doors/windows still 0.0% violations everywhere (no
regression from the narrowing). But — real, honest finding — **`carrierGrid` (the non-wall carrier
path) currently has ZERO measured effect on any of the 7 shipped buildings' actual schedules**
(`probe_restson_coverage.js`, diffed full-vs-wallGrid-only computeSchedule output, 0 differing
elements on all 7). The mechanism is real, safe, tested — but I have not found a live case it fixes
beyond what the door/window fix already covered. **Do not ship this as "fixes the Terminal roof
report" — it doesn't, yet.** Ship it only once a real violation it uniquely closes is measured, or
treat it as forward cover for whatever the NEXT surprise class turns out to be.

### Found but NOT fixed: the actual Terminal glass-roof bug
`probe_terminal_ungated.js` (sorts every roof-ish element by earliest computed start) found the real
culprit: **5 elements named "Basic Roof:Glass...", classified `IfcSlab`, seq=4 (default, never
promoted to roof-role seq=8)**, scheduled day 6.7 — alongside FOUNDATIONS, with zero gate of any kind.
Root cause is one layer deeper than the gates: `_promoteRoofLoadPath` (time_machine.js) decides
whether a slab gets promoted to roof-role by searching for `IfcWall`-class carriers ONLY
(`loadPathWalls = elements.filter(e => e.cls.indexOf('IfcWall')===0)`); if none are found
(`if (!carriers.length) return;`) promotion never fires and the slab stays at seq=4 — a **structure
pool member (`placeStruct`), which NEVER goes through `wallGate`/`hangGate`/`restsOnGate` at all** —
those only apply to `placeNonst` (seq>4). These 5 glass-roof slabs' real carrier is (measured, same
awning-support family as before) not an `IfcWall`, so promotion never sees them.

**⚠ REGRESSION #2, found and REVERTED within this pass — do not re-attempt this exact widening.**
Tried extending `_promoteRoofLoadPath`'s carrier pool the same way (`IfcWall` OR `bboxVol >
BIG_ELEMENT_VOL`). Broke the SAME witness WORSE: LTU_AHouse `tier1DagWins` 882→1246 (a 41% INCREASE,
wrong direction), Terminal 24007→4 (collapsed). This promotion decision is load-bearing for far more
of the schedule than the gate functions were — widening its carrier pool by raw size, unconditionally,
reclassifies structure well beyond the intended roof case. **Reverted** (time_machine.js
`_promoteRoofLoadPath` is back to `IfcWall`-only, comment left in place explaining why and what NOT to
retry). **The Terminal glass-roof case is still open, unfixed, live.** A real fix needs a narrower
condition — e.g. scoped specifically to slabs whose name/storey suggests roof AND that found zero wall
carriers (not "any slab, any big element, unconditionally") — not attempted this pass, ran out of
runway.

### NEW, NOT YET INVESTIGATED: HHS stairs "hanging in midair"
Reported live, same viewing session as a re-report of the 3rd-level door issue. Two things named
here, neither checked yet — next session should verify both before assuming either:
1. **Is the door report actually current, or stale?** All evidence (10/10 witness, live GH Pages
   deploy confirmed) says #1294 is correctly live and HHS doors are fixed. A live re-report of an
   already-fixed issue, in the SAME breath as a brand-new stairs report, smells like the same
   stale-session pattern from earlier this session (pre-#1291 kernel_ops, pre-#1294 door fix) — but
   this is a hypothesis, not confirmed. Check what the viewing session's actual served `sw.js`
   version and IndexedDB-cached `kernel_ops` genVersion are before concluding either way.
2. **Stairs floating — zero code read, zero measurement done this pass.** User's own framing, worth
   taking seriously: real construction uses temporary bracing/shoring for precast stair
   installation that the model has no concept of — this MAY be a legitimate "known limitation,
   report don't gate" case (same shape as this codebase's existing `otherSlabs`
   measurement-not-gate pattern for frame-first floors), genuinely different from the door case
   (which had no such excuse — measured violations up to 120 days, far past any real frame-first
   tolerance). Start with: what IFC class(es) are HHS's stairs modeled as (`IfcStair`/
   `IfcStairFlight`/generic proxy), what does `hasBearingBelow`/`geoGate` currently compute for
   them, and is there a real modeled carrier (landing slab, stringers) that's simply unpromoted or
   unrecognized the same way the Terminal roof slabs were — before reaching for a "this is just
   scaffolding, excuse it" conclusion. EXTRACT the real cause first; the scaffolding explanation is
   a hypothesis to test, not a default to assume.

### Two open judgment calls named this pass, both the user's to decide, neither decided here
1. **Door/wall gate tolerance:** currently zero-tolerance (door cannot start even 1ms before its wall
   finishes). Real construction sometimes sets door frames as the wall goes up — a small (~1 day?)
   overlap tolerance might be more realistic. Measured violations were overwhelmingly large (weeks
   to 120+ days) so this is a refinement, not a correctness bug — only worth doing if the user wants
   the gate to more precisely mirror real trade sequencing.
2. **Scaffolding/temporary-works modeling gap:** raised for stairs, plausible for some roof/decking
   cases too. This codebase has zero concept of temporary works today. Worth a real product decision
   — document as a permanent, warn-only limitation (matching `§SUPPORT_UNCHECKED`'s own "reported not
   gated" pattern), or is it worth modeling temporary support relationships explicitly? Not decided.

### Verify-before-trust note (same as above, restated because this section is now the newest)
Everything in this section is this pass's own knowledge as of 2026-08-12. Re-run
`witness_tier_serial_display.js`, `witness_door_window_host_wall.js` (after fixing its stale
`openingGate` wiring-check strings — see above), and re-check `git log --oneline -10` on `~/bim-ootb`
before trusting any status claim here, including "still open" ones — this pass ran long and touched a
lot of ground.
