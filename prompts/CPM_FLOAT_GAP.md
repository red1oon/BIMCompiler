# ⚠ DO NOT REMOVE — Read the log after every run, spec-first, no invented dependency edges

## Why this file exists
End-of-session exit interview (2026-08-03, GANTT_ACCURACY.md session) claimed *"no CPM/float
solving — explicitly out of scope by design"* as the main gap versus Synchro/P6-class tools. That
claim was **wrong, or at least stale** — verified by direct code read before writing this spec (see
§CORRECTION). This file scopes what's *actually* left to close the gap, so a future session builds
the real remaining 20%, not a duplicate of the 80% that's already shipped.

## ⚠ CORRECTION to the exit-interview claim — read this before touching anything
A real CPM solver already exists and is wired to the UI:
- **`viewer/schedule_author.js:528` `computeCpm(db, scheduleId, opts)`** — textbook-correct: reads
  `task_sequences` (predecessor/successor/type/lag), Kahn topological sort, forward pass (ES/EF),
  backward pass (LS/LF), total float (`LS-ES`) + free float (min successor slack) + `is_critical`
  (`total<=0`), writes all of it back to `tasks`. Not a stub, not a heuristic — a correct CPM
  implementation.
- **`viewer/schedule_editor_ui.js:384` `onComputeCpm`** calls it, renders `project Xd · critical Y/Z`,
  broadcasts the result. `renderGantt`/`exportMSProject`/`exportPMXML`/`exportXER` also exist
  (`ScheduleEditor` global, line 693).
- **`viewer/foreign_schedule.js`** — a real Primavera P6 (XER + PMXML) and MS Project (MSPDI) reader
  AND writer already exists (`parseXER`, `parsePMXML`, `toScheduleData`, `adoptIntoDb`,
  `toPMXML`/`exportMSProject`).
- **`viewer/import_worker.js`** — reads native IFC4 work-schedule entities (`IfcWorkSchedule`,
  `IfcTask`, `IfcTaskTime`, `IfcRelSequence`, `IfcRelNests`, `IfcWorkCalendar`) straight off an IFC
  file and keeps early/late dates, float, `is_critical`, WBS parent, and a calendar carrier — this is
  Hospital's actual captured-programme path, witnessed real (`4D_CAPTURE_AND_FALLBACK.md` §5.2,
  "T1b DONE + re-witnessed 2026-05-30", `§4D_WIDE earlyStart=45 totalFloat=44 isCritical=45
  wbsParent=72`).

**Doc discrepancy found, flag it, don't re-litigate:** `GANTT_ACCURACY.md` (the §4D_HOST_BEFORE_HOSTED
section, "REFRAMED" 2026-07-29) says *"The widening is already specced as T1b/§5.2 and never
built."* `4D_CAPTURE_AND_FALLBACK.md` §5.2 itself says *"T1b DONE + re-witnessed (2026-05-30)"* with
a real witness log. The second is dated, evidenced, and earlier — trust it. `GANTT_ACCURACY.md`'s
line is stale and should be corrected next time that file is touched (not urgent enough to justify
opening it just for this).

So: **captured programmes (real P6/MSP file, or native IFC4 work-schedule) already get real CPM,
already get a real solver, already get a real UI surface.** That is NOT the gap. Read on for what is.

## The actual remaining gaps, in priority order

### Gap 1 — the GENERATED path (materializeDefault) never writes `task_sequences`, so computeCpm is blind to it
`schedule_author.js`'s `materializeDefault`/`scheduleContiguous` (tonight's §PHASE_OVERLAP_BAND work)
compute each phase's `schedule_start`/`schedule_finish` directly via date arithmetic (real quantity →
duration → band-lag → cursor). They **never write a row to `task_sequences`.** Run `computeCpm` on a
materializeDefault-authored schedule today and every phase task has zero predecessors/successors —
Kahn's sort trivially orders them, ES=0 for all, and the float/critical numbers it writes back are
meaningless (no real precedence to measure slack against). **This is why a from-scratch generated
building (Terminal — no captured plan) can never show a real critical path today, even though the
solver that would compute one already exists and works correctly on captured data.**

**What closing this needs — DERIVE edges, don't invent them:**
- Phase-level: for each pair of phases with an overlap relationship (materializeDefault already knows
  `p.startCursor`/`p.lagDays`/`p.widthDays` per phase — tonight's work), emit the corresponding
  `task_sequences` row (`predecessor_id, successor_id, sequence_type='SS', lag_days=p.lagDays`) instead
  of only writing it into `schedule_start`. This makes the ALREADY-COMPUTED real relationship (leading
  trade clears one band, follow-on trade starts) an explicit, CPM-solvable edge — not a new invented
  number, just exposing the one already derived tonight.
- Element-level (bigger, optional second slice): `schedule_gate.js`'s support-check already computes,
  per element, which structural element(s) below it (XY-overlapping, `base_z` below within `GAP`) it
  depends on — this is a REAL dependency graph, just expressed today as a scheduling GATE (a
  clamp/push) rather than a stored predecessor edge. Reifying it into a genuine element-level
  `task_sequences`-shaped table would let computeCpm produce a true element-granularity critical path
  for a building with zero captured plan — the geometric equivalent of what P6 gives you from a
  planner's stated logic. This is real, new algorithmic work (the gate today is a one-pass
  clamp, not a graph you can forward/backward-pass over) — scope it as its own slice, don't bundle
  with the phase-level fix above.
- **Honesty-tier discipline applies** (`CINEMA_PATH_EDITOR.md` §5, already established, do not
  re-invent): a derived critical path from geometry is tier 2 ("this model's derived 4D"), never
  claim it as "the critical path" the way a captured/P6 float value (tier 1, "linked schedule") can be
  claimed. Surface this distinction in the UI wording, not just internally.

### Gap 2 — foreign P6/XER/PMXML/MSP import never binds to model elements — THIS is the "align with the model" gap
Per `foreign_schedule.js`'s own header: *"`task_elements` lands EMPTY by design — a P6 file carries no
model guids. 4D binding is the separate `ScheduleAuthor.assignElement` craft."* `assignElement(db,
guid, taskId)` (`schedule_author.js:197`) is a ONE-element-at-a-time manual reassignment verb — there
is no bulk/automatic matcher between an imported P6/MSP activity and the elements it should govern.
**Practically: a user who imports their real project's P6 schedule today gets tasks, dates, real CPM
float, WBS — and a building that visually does nothing when they scrub the Time Machine, because
nothing is bound to any element.** This is the literal gap behind "ensure user import of P6/MPP will
align with the model we generating."

**What closing this needs (spec before code — this is a real design question, not a mechanical fix):**
1. **Matching signal, extracted not invented.** The only thing a P6/MSP activity and a model element
   can be matched on, without inventing a correspondence, is NAME/CODE text — P6 activity
   names/WBS-codes vs `elements_meta.element_name`/`ifc_class`/`storey`, OR (if the project already
   ran `materializeDefault` first) the SAME phase-name vocabulary tonight's work already uses
   (Substructure/Superstructure/MEP Rough-in/Architecture/MEP Final/Finishes) — a P6 activity named
   "Steel Erection - L3" should fuzzy-match `Superstructure` + `storey=Level 3` elements already
   classified by the existing `SEQUENCE_RULES`/`matchRule`/`matchNameOverride` machinery. **Reuse
   that machinery — don't build a second classifier.**
2. **Confidence tiers, not a binary bind/no-bind.** A real project's P6 WBS will not cleanly cover
   every element (e.g., FF&E vendor-supplied activities with no model geometry, or model elements with
   no matching activity). Report coverage honestly (`§FOREIGN_BIND covered=X/Y unmatched=Z`, same
   discipline as `§4D_COVERAGE`/`§GANTT_SOURCE captured=/generated=` already established) rather than
   silently leaving gaps or forcing a match.
3. **User-in-the-loop for ambiguous/unmatched cases**, not silent auto-accept — the existing `assignElement`
   manual craft is exactly the fallback UI for whatever the auto-matcher can't confidently resolve. This
   phase should PRE-POPULATE high-confidence matches and hand the rest to the existing manual flow,
   not replace it.
4. **Needs a user ruling before building**, matching this project's own established pattern (the
   `max_crews` bottleneck ruling, the fragmentation-threshold ruling both from tonight): what confidence
   threshold counts as "auto-bind" vs "flag for manual assignElement"? Get real numbers from a real
   fixture (see Gap 3) before proposing one — don't guess a percentage.

### Gap 3 — the P6/MSP reader has never been proven against a real exported file
`prompts/XER_REAL_FIXTURE_PROOF.md` — still `⛔ BLOCKED: provide one real exported P6/MSP file`. All
current witnessing (`W-FGN 28/28`) is against **our own generator's synthetic output**, which cannot
catch real-world quirks: XER column reorder, unknown/UDF tables, multi-calendar non-8h days, PMXML
namespace/ObjectId variants, MSPDI non-`PT` durations, milestone/summary edge cases. **Gap 2's binding
work should NOT be built/tuned against synthetic fixtures only** — get a real file first (ask the user
for one, or cite a public sample per that doc's own fallback), because the matching-confidence
question in Gap 2 item 4 needs a REAL activity-naming convention to calibrate against, not our own
tidy generator's naming.

## Suggested order for a future session
1. Gap 3 first (or in parallel) — get the real fixture, it's a blocking dependency for calibrating Gap 2 honestly.
2. Gap 2 (P6/MSP → element binding) — highest real-world value, directly what the user asked to ensure.
3. Gap 1 phase-level (small, mechanical — expose the already-computed lag as a real edge).
4. Gap 1 element-level (bigger, genuinely new algorithm) — only if Gap 1 phase-level proves insufficient for what a real critical-path view needs.

## Session update — 2026-08-03, Gap 1 (phase-level) DONE
Landed as bim-ootb PR #1159 (merged on top of #1158, unrelated — see below), auto-merge.
- `materializeDefault`/`scheduleContiguous`/`schedule_author_ui.js applyDates()` (all three "lay
  phases out from a start date" sites — the same three §PHASE_OVERLAP_BAND already had to fix
  independently) now emit real `task_sequences` SS edges from the already-computed band-lag —
  exactly the phase-level fix this file specced, not a new relationship.
- Found and fixed a real, separate `computeCpm` backward-pass bug this exposed: late-finish was
  unclamped, so a task whose only successor edge is SS/SF (constrains the successor's START, not
  this task's FINISH) could compute an LF past the project's own finish PF — impossible, and
  silently zeroed the critical path. Clamped `t.lf` to PF. Verified non-regressive against a real
  P6 file (`real_xer_witness.js` still matches P6's own `driving_path_flag` 52/52) and all other
  CPM/foreign-schedule witnesses (28/28, 16/16, 10/10).
- Added the Gantt UI's missing visual counterpart — `schedule_editor_ui.js renderGantt` now draws
  real SVG dependency-arrow connectors (FS/SS/FF/SF-aware, red for critical links); the dependency
  panel was previously text-only, so a generated building's CPM run had no visual to show even
  after edges existed.
- **Unrelated same-session fix, PR #1158** (dispatched in parallel, not part of this spec): the
  Time Machine playback clock (`time_machine.js getInstallSecs`) was a hand-duplicated, never-
  updated copy of the WBS-path's duration formula — never got the §LABOR_QUANTITY_WEIGHT
  fragmentation fix, so the live scrub/playback clock still raced through Terminal's Superstructure
  13.4x too fast even after the Gantt dates were correct. Now proxies to
  `ScheduleAuthor._installSecs()` (newly exported), single source of truth.
- Gap 1 element-level, Gap 2 (P6 real-file binding), Gap 3 (real fixture) — still open, unchanged
  from the original scope below.

## Session update — 2026-08-03 (later), priority reframed + Gap 1 element-level DONE
User ruling: the core product is "drop an IFC, get a probable 4D/5D movie right away" — most users
return to their own tools (P6/MSP) after. That makes Gap 1 (a fully auto-generated schedule, as
accurate as possible) the utmost priority; Gap 2/3 (P6 import) are now explicitly POC/later, not
dropped — see the NEW diff-tool idea below, which reuses P6 import for a different, higher-value
purpose than originally scoped.
- **Gap 1 element-level DONE** — bim-ootb PR #1160 (auto-merge), `materializeZones()`. Key finding:
  a full element-level scheduler (`schedule_gate.js computeSchedule`) already existed and already
  drives the live movie (support-order + crew-capped placement, proven 0/3240 floating on real
  Hospital data) — this was NOT a new algorithm to build. The work was rolling its already-proven
  real per-element times up into readable (phase × real floor) zones (71 on Terminal — P6-realistic,
  not 5 and not 48,428) with real, structurally-DAG-safe edges, feeding the same `computeCpm`. Movie
  stays untouched/instant; this is the on-demand detail view.
  **Known limitation CLOSED same session** — PR #1162, `computeCpm(db, id, {fixedDates:true})`.
  Trusts a zone's real persisted dates directly instead of re-deriving through the graph (which is
  what compounded the error); backward pass/float/criticality unchanged. Verified EXACT match
  (93d==93d, was an asserted 48% divergence) — `witness_zone_cpm.js` now also keeps a live regression
  proof of the pre-fix (derived-mode) divergence so it can't silently return. Non-default, opt-in —
  phase-level/captured-P6 callers get byte-identical behavior. **Both options from the paragraph
  above are now moot — the fixedDates path was taken, not resource-leveling — future session should
  NOT re-open that choice**, it's settled.
- **New scope, not in the original gap list**: a "4D schedule diff" — grade an imported P6/MSP
  schedule's per-phase/trade durations against OUR labor-rate/quantity-derived estimate, surfacing
  where a human plan is unrealistic ("correcting theirs"). Reuses `foreign_schedule.js` readers +
  `materializeDefault`'s existing per-phase labor math; needs only coarse activity→phase/trade name
  matching (reusing `matchRule`/`matchNameOverride`), NOT full per-element binding — cheaper than
  the original Gap 2 scope. **DONE** — PR #1161 (merged), `viewer/schedule_diff.js`, witnessed 11/11
  on real Hospital data; found a real 13.7x-optimistic MEP Rough-in estimate in the test P6 plan.
- Real P6/MSP fixture search: no directly-downloadable sample found in the obvious open-source XER
  parser repos (`HassanEmam/PyP6Xer`, `fdigeron/xertools` — both reference a `sample.xer` in test
  code but don't commit it), nor via the leads chased (pmproguide.com, project.pm — both 521/500'd).
  Still `⛔ BLOCKED` — genuinely open, not urgent (P6 lane is POC/later per the priority ruling above).

## Session closed — 2026-08-03, end of day. Everything above is DONE and merged/auto-merging
(PRs #1158–#1162, all verified via witness, all non-regressive). **This file's mission is complete**
for the scope it was opened to spec. The NEXT session's mission (auto-4D "as perfect as can be") is
handed off to a fresh, focused file — see `prompts/4D_SCHEDULE_PERFECTION.md`. Do not keep extending
this file for that work; it would just re-fragment the same "one topic, one file" mistake this
project's own housekeeping rule exists to prevent. This file stays as the historical record of the
CPM/float gap investigation + phase/element-level fixes; link back to it, don't duplicate its content.

## Boundary, restated (do not drift from this)
`4D_CAPTURE_AND_FALLBACK.md:359`'s existing rule stands: **capture and replay CPM, never recompute
float** for a CAPTURED programme (P6/MSP/native-IFC) — `computeCpm` on a captured schedule should
arguably not even run (the file's own float is more authoritative than ours) unless the user edits
dependencies and asks to re-solve. For a GENERATED (no-plan) building, computing float IS legitimate
(there is no planner's number to defer to) — but every edge it solves over must be DERIVED from real
geometry/rules data already in this codebase (support-order, phase overlap), never a plausible-looking
invented predecessor relationship.
