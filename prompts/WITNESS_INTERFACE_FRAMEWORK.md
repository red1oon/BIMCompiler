# ⚠ DO NOT REMOVE — Witness Interface Framework (SPEC ONLY, nothing built yet)
# SCOPE: design for a REUSABLE witness-authoring library — not an audit of existing witnesses
#   (that's `WITNESS_CONTRACT_AUDIT.md`, a different, backward-looking deliverable; this one is
#   forward-looking: how a NEW witness gets written from here on, so authoring one doesn't mean
#   hand-rolling assertion bookkeeping every time). Triggered by the user's own sharper question
#   (2026-08-25): "does any WITNESS confirm the actual JSON/DB output of truth the 4D schedule
#   runs on — not just some derived number?" Answer, checked against every file the audit read:
#   NO, not comprehensively. That gap is what this framework closes.
# STATUS (2026-08-25, updated): built, shipped, and — per the crisis block immediately below —
#   NOT YET TRUSTWORTHY AT REAL SCALE. Read §CRISIS before anything else in this file, including
#   the RESUME/doctrine sections further down. Those are real but this supersedes them in priority.

---

## 🔴 CRISIS — 2026-08-25, read this section FIRST, new session starts here
User's own words: "This is a shocking crisis." Treat it as one. Everything below §1-9 in this file
is real but SUPERSEDED in priority by this section — do not trust any "done"/"CLOSED"/"proven" claim
anywhere in this file, including PRs #1511-#1524, until the lessons here are actually applied, not
just read.

### LAW (user's own words, verbatim — governs every session on this lane from now on)
**"WITNESS precedes human visual as law!"** A human noticing a defect live, before a witness caught
it, is not an acceptable QA step. It is a WITNESS FAILURE, logged as one. Nothing ships because "it
looked right" — it ships because a witness, at real scale, already proved it. Stakes, user's own
words: **"if WITNESS cannot be fixed, the project is doomed."**

### TIMELINE — what shipped, what it actually was (condensed; the full blow-by-blow is in git history
### and earlier revisions of this doc, not repeated here)
1. **PR #1520** (hard per-element clamp) — fixed the date epoch, but collapsed 6880 elements onto a
   handful of boundary instants. Its own witness stayed green — it checked "inside the window," never
   "spread out inside it."
2. **PR #1521** — `CACHE_VERSION` bump for #1520 (missed in the same PR, caught by a live re-test).
3. **PR #1523** (proportional rescale, replacing #1520's clamp) — math verified on 5 synthetic
   elements + Duplex's 1122 real elements. Never run on the real building, real scale, or the CELL
   code path the bug actually used.
4. **PR #1524** — `CACHE_VERSION` bump for #1523 — the SAME miss as #1521, repeated one PR later,
   despite the first miss being freshly documented as a standing rule minutes earlier.
5. **Live re-test after #1523/#1524**, on `HHS_Office_Federated`: dates are real (`8/25/2026 →
   10/6/2026`), `GANTT_OPS_FIRST20` is varied (not collapsed), `floating` improved (14→7 vs. the
   original baseline). By every metric checked so far, this run is healthy. **The user still reports
   the same "tiny bars, stacked" hell, visually, on this exact run.** Not resolved — see §UNRESOLVED.

### LESSONS — organized, in priority order, so the next witness gets built once, not three times
1. **A witness proves ONLY the exact claim it makes — nothing broader.** Three genuinely different
   claims got conflated as "the fix is witnessed" this session, and each one had to be built
   separately after the previous one turned out insufficient:
   - BOUNDS (`witness_tm_element_window_bind.js` v1): is the value inside the real window. Passed
     through the collapse.
   - DISTRIBUTION (`witness_tm_element_window_bind.js` v2): do multiple elements stay distinct/
     ordered. Passed, on synthetic data — never checked against what §UNRESOLVED describes.
   - VISUAL/RENDERED SHAPE (the actual 17 task-level Gantt bars' widths and positions on screen): has
     **never been checked by any witness, at any point today.** This is very likely where "tiny bars"
     actually lives — `kernel_ops` (6880 element ops, what every witness today touched) and `tasks`
     (17 rows, what the Gantt DRAWER actually renders bars from — `buildGanttTasks()`/
     `drawGanttMini()`) are different layers. A correct element-level fix says nothing about whether
     the 17 task bars have sane widths relative to the 42-day axis.
   **Rule going forward: name which of these three (or a fourth, if one exists) a witness is proving,
   explicitly, in the witness's own header — and don't claim the bug is fixed until all layers that
   could visibly manifest it are named and checked, not just the one that was easiest to reach
   headlessly.**
2. **Coverage must be a hard, structural requirement — not left to author judgment.** Every numeric
   proof this session ran on Duplex (6-1200 elements, GRAPH path) or synthetic 5-element cases, never
   on `HHS_Office_Federated` (~6880 elements) or the CELL path (`solveCells()` in `cpm_schedule.js`)
   — the actual building and the actual path the live bug happened on. `witness_kit` currently has no
   mechanism to force this. Proposed, not built: a required piece (`.coverage(fixtures)` or a
   framework-enforced minimum) that REFUSES to register a witness touching `kernel_ops`/`injectGantt`
   unless `HHS_Office_Federated` is literally in its population.
3. **The CELL/GRAPH path itself is unexplained and needs its own answer before anything is trusted.**
   The SAME building has been observed taking `path=CELL` (`repr=97.06%`) and `path=GRAPH`
   (`repr=85.47%`) across different loads. Nobody has explained why the representability percentage
   moved, or which path a "real" load actually takes. Every fix today was only proven on GRAPH.
4. **Deploy/precache discipline is a SEPARATE failure domain from data correctness, and "remember the
   rule" already failed twice in 90 minutes.** `CACHE_VERSION` was missed for #1520, documented as a
   standing lesson, then missed again for #1523. Build the mechanical check (does a PR touch a
   `PRECACHE_ASSETS` file without touching `CACHE_VERSION`) instead of trusting the written rule a
   third time.
5. **Self-verification has a structural blind spot: the same reasoning pass that writes a fix writes
   the test that's supposed to catch problems with it.** `.coverage()` (lesson 2) doesn't fully close
   this — it still relies on someone's judgment to declare what's adequate. The two concrete
   mitigations available: (a) hardcode known-critical fixtures/paths into the framework itself, not
   into any one witness's judgment call, so no author can under-declare by habit; (b) treat a live
   re-test as ALWAYS still required before "done," never optional once a witness is green — not
   because witnesses don't matter, but because today's witnesses have already been shown to have
   blind spots a live check caught twice.
6. **"Not yet contradicted" is not "proven."** Every witness that passed today passed on its own
   narrow definition of success. Don't extend a green witness's claim past exactly what it checked —
   this is the single sentence that would have prevented both regressions from being called "fixed"
   prematurely.

### ⛔ UNRESOLVED, as of this doc revision — start here, don't re-derive
The live re-test in TIMELINE item 5 shows healthy numbers at the `kernel_ops`/element layer AND a
user-reported "same hell" at the visual layer, on the SAME run. These are not yet reconciled. Next
session, in order:
1. **Check the layer nothing has checked**: the 17 real `tasks` rows' actual `schedule_start`/
   `schedule_finish` durations and positions — are any of them near-zero width, or bunched at the
   same start, relative to the 42-day axis `§GANTT_AXIS` reports? This is a `tasks`-table query, not
   a `kernel_ops` one — fast, and untried.
2. **If task-level bars are genuinely fine**, the defect is somewhere in `buildGanttTasks()`/
   `drawGanttMini()`'s own rendering math (canvas pixel positions from real dates) — not in anything
   this session touched. Trace that function fresh, don't assume it inherits correctness from
   `tasks`/`kernel_ops` being correct.
3. **Confirm what's actually live** before any of the above: `curl` the deployed `viewer/sw.js` for
   `CACHE_VERSION` (expect `v1086`) and `viewer/time_machine.js` for `_tmRescaleToTaskWindow` (expect
   2 occurrences) — cheap, and rules out a THIRD deploy-cache miss before chasing a code explanation.

## 0. The question that motivated this, stated precisely
Everything `WITNESS_CONTRACT_AUDIT.md` read today checks a *derived* property — a span, an inversion
count, a completion instant. **Nothing checks the actual persisted output-of-truth artifact — the
`tasks` table rows, the thing a user edits and the thing that survives reload — as one declared
contract.** The closest today (`witness_gantt_edit_persist.js`, `witness_bake_plays_schedule.js`) each
check one adjacent property, not the artifact's own shape and invariants. That's a coverage gap, not a
rigor gap — a different axis from everything the audit measured.

## 1. Why "simulate a Java interface" is the wrong translation
Java's real advantage isn't the `interface` keyword — it's that the **compiler refuses to let a
producer emit a malformed shape at all.** JS has no equivalent at the language level. Trying to fake an
`interface` with duck-typing or JSDoc buys nothing a runtime doesn't already give you for free. The
honest translation: **push the contract into a shared runtime library that refuses to call anything
green without the required pieces** — the same guarantee, enforced by one function every witness is
forced to go through, instead of by the compiler.

## 2. Three pieces

### 2.1 Schema layer — validates the REAL artifact's shape
Use **Ajv** (already vendored in `bim-ootb/node_modules/ajv` as an eslint transitive dependency — add it
as an explicit `devDependency`, zero new install needed). Not hand-rolled: a hand-rolled shape check is
exactly the kind of thing that silently rots, which is half of what today's audit found.

A schema is data, not code — versionable, diffable, and it's the thing that actually answers "does the
JSON settings match" for any given artifact, because it's checked against the REAL persisted row, not a
function's return value.

### 2.2 Invariants — reusable domain predicates, written once
The #1 rot source `WITNESS_CONTRACT_AUDIT.md` found repeatedly: a witness hand-mirrors a predicate from
the real gate (`geo_support_leak.js`'s 3rd-generation drift, `hosted_before_host.js`'s missing
`CW_HOST_CLS` pool, `even_turn.js`/`noise_law.js`'s duplicated `PACE_SWING` constant — 10+ instances
today alone). A shared `invariants/` library, imported by name, means the predicate exists in exactly
ONE place — drift becomes impossible by construction instead of caught by luck.

### 2.3 The builder — the actual "interface," enforced at the only call site that matters
```js
function Witness(name) {
  const spec = { name, _population: null, _schema: null, _invariants: [], _redControl: null };
  const api = {
    population(fn)      { spec._population = fn; return api; },
    schema(s)            { spec._schema = s; return api; },
    invariant(label, fn) { spec._invariants.push({ label, fn }); return api; },
    redControl(fn)       { spec._redControl = fn; return api; },
    run() {
      if (!spec._population) throw new Error(`Witness(${name}): .population() is required`);
      if (!spec._schema)     throw new Error(`Witness(${name}): .schema() is required`);
      if (!spec._redControl) throw new Error(
        `Witness(${name}): .redControl() is required — a witness that cannot fail is not a witness`);
      // 1. run population() -> rows. THROW (not silent-pass) if rows.length === 0 — closes
      //    §W-EMPTY-POP, the single most common defect found today (12+ instances), at the source.
      // 2. validate every row against schema via ajv -- structural drift now fails LOUDLY, not
      //    silently, the moment a producer's shape changes (closes §W-STALE-SLICE's failure mode
      //    for the OUTPUT side, not just the source-text-slicing side).
      // 3. run every invariant against the population, tally pass/fail.
      // 4. run redControl() and assert it DOES fail against schema+invariants -- if it doesn't,
      //    the witness itself is the defect (closes §W-REDCONTROL at the source, not by author
      //    discipline).
      // 5. print one line: §WITNESS_<NAME> pass=X fail=Y ran=<rows.length> -- ran>0 is baked in,
      //    can't be omitted the way 12+ files omitted it today.
    }
  };
  return api;
}
```
Omit `.redControl()` and the witness refuses to even register — not a lint warning, not a convention in
a comment, a thrown error at author time. That is the actual JS analog of a Java interface refusing to
compile an incomplete implementer: enforcement moved from "did the author remember" to "does the shared
code path allow it to run at all."

## 3. Worked sketch — the exact case that motivated this: TM's real schedule output-of-truth

Real shape, not invented — `viewer/schedule_author.js:247`'s actual `CREATE TABLE tasks` columns:
`task_id, schedule_id, wbs_parent, name, predefined_type, is_summary, schedule_start, schedule_finish,
schedule_duration, early_start, early_finish, late_start, late_finish, free_float, total_float,
is_critical, resource, status`.

```js
// witness_kit/schemas/schedule_4d.js — the contract, as data
const Schedule4DTaskRow = {
  type: 'object',
  required: ['task_id', 'schedule_id', 'schedule_start', 'schedule_finish', 'is_critical'],
  properties: {
    task_id:          { type: 'string', minLength: 1 },
    schedule_id:      { type: 'string', minLength: 1 },
    schedule_start:   { type: 'string', format: 'date' },
    schedule_finish:  { type: 'string', format: 'date' },
    is_critical:      { type: 'integer', enum: [0, 1] },
    total_float:      { type: ['string', 'null'] }
  },
  additionalProperties: true   // a floor, not a ceiling — legacy/extra columns don't fail the row
};

// witness_kit/invariants/schedule.js — reusable, imported by name, never hand-copied again
const datesOrdered   = row  => new Date(row.schedule_start) <= new Date(row.schedule_finish);
const noPre1970Dates = row  => new Date(row.schedule_start).getFullYear() > 1971;
// ^ this is not hypothetical — it's 4D_GANTT_TM_REFACTOR.md's own real, already-shipped defect
//   (§S67-era "1970-date typed edits"). Encoded here, it can never silently reappear in ANY
//   future witness that imports this invariant — the fix becomes a standing gate, not a memory.
const criticalFloatZero = rows =>
  rows.filter(r => r.is_critical === 1).every(r => Math.abs(Number(r.total_float || 0)) < 1e-6);

// viewer/tests/witness_tm_schedule_output_of_truth.js — the actual new witness. This is the WHOLE file.
const { Witness } = require('../../witness_kit/contract');
const { Schedule4DTaskRow } = require('../../witness_kit/schemas/schedule_4d');
const { datesOrdered, noPre1970Dates, criticalFloatZero } = require('../../witness_kit/invariants/schedule');

Witness('tm_schedule_output_of_truth')
  .population(() => readRealTasksTable('buildings/Duplex_extracted.db'))  // the REAL persisted rows
  .schema(Schedule4DTaskRow)
  .invariant('dates-ordered',        rows => rows.every(datesOrdered))
  .invariant('no-1970-dates',        rows => rows.every(noPre1970Dates))
  .invariant('critical-float-zero',  criticalFloatZero)
  .redControl(rows => { rows[0].schedule_start = '1970-01-05'; return rows; })
  .run();
```

**What this closes, concretely:**
- Answers the user's original question directly — this witness DOES confirm the real JSON/DB output of
  truth, not a derived number three steps removed from it.
- The whole authored file is ~10 lines. Everything else (population guard, schema check, red-control
  enforcement, pass/fail tally, the `ran>0` discipline) lives in the shared library — a new feature adds
  a schema + a couple of invariants, not a bespoke assertion script.
- `no-1970-dates` demonstrates the actual point of a shared invariant library: a REAL defect this
  project already paid for once becomes a permanent, reusable, un-forgettable gate instead of tribal
  memory in a prompts file.

## 4. What this spec does NOT claim
- Not a replacement for `WITNESS_CONTRACT_AUDIT.md`'s ~270 already-written witnesses — those stay as
  they are unless individually triaged; this is the pattern for what gets written from NOW on.
- Not free of authoring effort — someone still has to pick the right schema, the right invariants, and a
  real red control. The framework removes the BOILERPLATE and the SILENT-OMISSION failure modes, not the
  judgment.
- Ajv + this builder shape is a proposal, not a locked decision — flag now if either should be different
  before any of this is built.

## 5. §5 decided and BUILT — 2026-08-25, bim-ootb PR #1511
1. **Built now.** Framework + the `Schedule4D` case shipped as the first real witness, not parked.
2. **Top-level `bim-ootb/witness_kit/`**, shared by `viewer/tests/` and `modeller/tests/`.
3. **Forward-only.** No existing witness migrated — kept scope to the one new coverage gap this spec
   named; migrating a working witness is a separate, deliberate task, not bundled here.

### What shipped (`bim-ootb` branch `feat/witness-kit`, PR #1511)
- `witness_kit/contract.js` — the real `Witness()` builder (§2.3 was pseudocode; this is the working
  implementation — throws on a missing required piece, validates every row via Ajv, tallies
  pass/fail, and *proves* `.redControl()` actually breaks the population before trusting it, not just
  running it).
- `witness_kit/schemas/schedule_4d.js`, `witness_kit/invariants/schedule.js` — as sketched in §3, with
  one correction below.
- `viewer/tests/witness_tm_schedule_output_of_truth.js` — the first framework-authored witness.
  Auto-discovered and green under `node tests/run_witness_suite.js --filter tm_schedule_output_of_truth`.

### One real finding that changed the sketch: no static fixture has a populated `tasks` table
§3's sketch assumed `readRealTasksTable('buildings/Duplex_extracted.db')` would just read real rows.
It doesn't — checked all 21 `buildings/*.db` + `modeller/*_meta.db` on disk (2026-08-25): every one is
either the legacy-thin schema with 0 rows, or has no `tasks` table at all. The real table only exists
at runtime, built by the generative fallback and persisted to IndexedDB — never written back to any
on-disk fixture. So `population()` instead DRIVES the real production generator —
`schedule_author.js`'s `materializeDefault()` → `scheduleContiguous()` → `computeCpm()`, the same
calls `time_machine.js` makes — against `Duplex_extracted.db`'s real 1193-row `elements_meta` and
`rates.js`'s real `SEQUENCE_RULES`/`LABOR_RATES` (loaded via `vm.createContext`, the same pattern
`witness_gantt_bars_in_rect.js` already uses for a browser-global script with no module boundary).
Result: 7 real generated tasks, real 2026 dates, real CPM floats — nothing fabricated.

That run also surfaced a second correction: a real post-CPM row has `is_critical`/`total_float` as
`null` on the WBS-summary rollup row (`is_summary=1` — `computeCpm` only rates leaf tasks). §3's schema
required `is_critical` as non-null `enum:[0,1]`; the shipped schema widens both fields to allow `null`,
verified against the real generated output, not assumed.

### Self-test (the framework proving itself, not just the one witness)
Confirmed directly: `.run()` throws if `.redControl()`/`.schema()`/`.population()` is omitted; a
no-op `.redControl()` (one that doesn't actually break anything) is caught as `fail>0`, not silently
green; an empty population is caught the same way. The contract enforces itself, not just decorates.

## 6. Follow-on — 2026-08-25, bim-ootb PR #1513: multi-building black-box sweep (incl. HHS Office)
User ask: test the witness on a real HHS Office DB, as a **separate, reusable script**, not a one-off
inline check — checked first whether an equivalent multi-building test already existed.
`witness_support_invariant_all_buildings.js` is the one real precedent in this codebase, but it checks
a different, ephemeral thing (`ScheduleGate.computeSchedule`'s support invariant, never persisted) —
nothing already swept the real *persisted* `tasks` table across more than one building. Built:
- `witness_kit/generators/schedule_4d.js` — the §5 generation call (materialize→contiguous→CPM),
  factored out so the single-building witness and the new multi-building one share one source instead
  of a hand-copy (exactly the drift class §2.2 exists to prevent).
- `viewer/tests/witness_tm_schedule_output_of_truth_all_buildings.js` — same contract, looped over
  **Duplex, Hospital, Clinic, JKR, HHS_Office_Federated**. All 5 green (HHS Office: 6 real generated
  tasks, real 2026 CPM dates). `Terminal`/`LTU_AHouse` named-SKIPPED — both ship split meta/geo DBs
  with no `tasks`/`schedules` tables in either half; real follow-on scope, not attempted here.

**Real bug found in the shared runner while proving this "reusable," not just runnable standalone:**
`run_witness_suite.js`'s `spawnSync` uses Node's default 1MB stdout+stderr `maxBuffer`. Looping 5
buildings' worth of `schedule_author.js`'s own diagnostics (`§CLASS_UNMATCHED` is one `console.warn`
line per unmatched element — Hospital's 64k `elements_meta` rows alone produced 1MB+ on stderr)
overflowed it: the runner SIGTERM'd the child (`status: null`, reported RED) even though the script
exits 0 standalone. A witness that only passes when run directly and fails under the real suite runner
is exactly the kind of gap this whole framework exists to catch — caught here by actually running it
through `run_witness_suite.js --filter`, not trusting the standalone exit code alone. Fixed by muting
`console.log`/`warn`/`error` locally around each building's generation call (not the shared generator,
not the runner itself). Both witness files also adopted the house `BLD_DIR` env convention
(`witness_door_window_host_wall.js` etc.) instead of a hardcoded path.

## 🏁 CLOSED — 2026-08-25
Independently re-verified from another session: PRs merged, `HHS_Office_Federated_extracted.db` intact,
doc trail pushed, re-run numbers match exactly. §1-6 done, no open items on this lane.

Not this lane's problem, named here only so it isn't lost: same verification pass found 3 new_red on
`main` untouched by #1511/#1512/#1513 — `witness_cpe_buildup_activate_silent.js`, `witness_midair_zero.js`,
`witness_s50_cell_engine.js`. Drift from unrelated concurrent work landing on `main`, not this framework
or these witnesses. Belongs to whoever owns those files, not re-opened here.

## 7. REOPENED — 2026-08-25, live bug found: the "1970 dates" this whole framework was named after
A fresh `HHS_Office_Federated` load printed `§TIME_MACHINE ON — 6881 ops, 43 days, project:
1/1/1970 → 2/12/1970`, live, in the same session where `§4D_COVERAGE window=2026-08-25..2026-10-06`
proved `tasks.schedule_start/finish` was already correct. The witness suite this whole file built
(§1-6) checks `tasks` — correctly, per §6 — but never checked `kernel_ops`, the SEPARATE table that
actually drives the Gantt bars and the TM scrubber. Two unconnected systems; proving one correct did
nothing for the other. Full root-cause trail, honestly including two disproven hypotheses (kept, not
scrubbed — they're the actual value of doing this via witness instead of visual inspection):

1. **First hypothesis (wrong):** `CpmSchedule.run` drops the real epoch anchor. Read the whole file
   — zero references to `baseMs`/anchor anywhere, a pure relative CPM solver. Looked like the smoking
   gun. **Disproven by real execution**: drove the actual function against real Duplex elements
   (GRAPH path — `LocationAxis` unavailable headlessly, CELL path never reached) and its real output
   was `2026-01-16`, correctly anchored. The solver doesn't drop the anchor; it was never fed one it
   needed to drop, for this path.
2. **Second hypothesis (wrong):** `_displayTimeline`'s cache-reuse re-anchoring shift (the mechanism
   meant to correct exactly this) is broken. First test showed a stale 1970 cached value surviving
   the second call untouched — alarming. **Re-run 3× for reproducibility**: the shift works
   correctly every time (`2026-01-01T20:16:00.000Z`, real, reproducible). The first result was a bug
   in the test harness, not the product — caught before it became a false claim.
3. **What's still genuinely unconfirmed:** the CELL path (`solveCells()` in `cpm_schedule.js`) — the
   one the live-bugged building (`HHS_Office_Federated`, `path=CELL`) actually used. Could not get it
   running headlessly (`LocationAxis`/`db` resolution gap in the test harness, not debugged further).

**⚠ SUPERSEDED — the paragraph below describes PR #1520's `_tmClampToTaskWindow()` (the hard clamp),
which caused the collapse regression in §CRISIS TIMELINE item 1 and was REPLACED by PR #1523's
`_tmRescaleToTaskWindow()` (proportional rescale). Left here for history, not as current fact — read
§CRISIS for what's actually shipped and what's still unconfirmed.**

~~The fix shipped (bim-ootb PR #1520, `fix/tm-element-window-clamp`) does not depend on resolving
#3.~~ `injectGantt()`'s `_tmClampToTaskWindow()` binds every element's `kernel_ops` write into its
owning task's REAL window (`_cap.win[taskId]`, already proven correct on 5 buildings) at the one
place every path converges — the write itself. No solver, known or undiscovered, GRAPH or CELL, can
push a value outside real calendar time past that point. Verified two ways: `witness_gantt_props_epoch.js`
W-PE-8 (the clamp exists, wired before the INSERT, has a no-invent fallback) and the new
`witness_tm_element_window_bind.js` (real `_cap` from a real generated schedule, 1122 real elements,
a redControl proving the bug reproduces without the clamp — `pass=5 fail=0`).

W-PE-5/6/7 (`updateStatus`/`_finishActivate`/the two jump diagnostics) stay red on purpose — they
still literally format the internal clock as a date — triaged in `run_witness_suite.js`'s
`KNOWN_RED` as mitigated-not-eliminated. Fixing those 4 sites to read from `tasks` directly (the
established §S22/§S72 pattern) closes the PATTERN, not just today's values; named as a real
follow-up, not done here.

## 8. DOCTRINE — Unreconciled Parallel Systems (the general shape, not just this bug)
Named per user request (2026-08-25) so this class of gap gets checked FOR, not just fixed once it's
found. The concrete mechanism above is one instance of a general shape:

**Two independent computations silently claim to represent the same real-world fact, and nothing
proves one derives from — or is reconciled with — the other.** Each computation can be locally
correct (tested, verified, green) while the PAIR is wrong, because nothing ever checks the
relationship between them. This is not a coding mistake in either computation — it's an architecture
gap that no per-function witness can catch, because per-function witnesses check ONE function's
internal consistency, never a cross-system agreement.

**How this one arose (concrete, not abstract):** `tasks` answers "what phase, what date" (WBS-level,
~6-17 rows, template-driven off `SEQUENCE_RULES`). `kernel_ops` answers "what exact moment does THIS
element get placed" (element-level, thousands of rows, contact-graph/CPM-driven). Genuinely different
questions, correctly built by different engines — the gap wasn't building two engines, it was that
nothing enforced they describe ONE calendar. Every incident on this lane (§S22, §S72, this one) was
the SAME gap resurfacing at a new consumer of the ungoverned side.

**The checklist, for future witness/architecture work on this codebase:**
1. When two functions/tables/caches both compute or store what LOOKS like the same real-world fact
   (a date, a quantity, a version, an identity) — ask: is one PROVEN to derive from the other, or do
   they just usually happen to agree?
2. If "usually happen to agree" — that's this doctrine's exact shape. Name it, even if nothing is
   visibly broken yet (§S22/§S72 each individually looked like "one function is wrong," not "there
   are two clocks" — the pattern was only visible in hindsight, across three incidents).
3. The fix that actually closes it is a BINDING at the one place the two systems' outputs converge
   (this bug's clamp, at the `kernel_ops` write) — not a patch at each individual CONSUMER of the
   ungoverned side. A per-consumer patch (§S22, §S72, and almost a third time here) treats the
   symptom and lets the next consumer rediscover the same gap.
4. A witness for this doctrine checks the RELATIONSHIP, not either side alone: not "is `tasks`
   correct" (yes) and not "is `kernel_ops`'s solver internally consistent" (also yes, per #7's two
   disproven hypotheses) — it checks "does what `kernel_ops` actually persists agree with what
   `tasks` already proved real." `witness_tm_element_window_bind.js` is the first witness built to
   this doctrine specifically.

## 9. Codebase sweep — other candidate "two clocks" shapes (2026-08-25, first pass, not exhaustive)
Searched for the same general shape elsewhere, per user request. Reporting honestly by confidence —
some already fixed (real precedent this doctrine isn't hypothetical), some genuinely open, none
independently re-verified with the same rigor as §7's fix — this is a census, not a second fix pass.

- **Already fixed, same shape, worth knowing it happened before:** `_installSecs` duration math used
  to be hand-duplicated between `materializeDefault`/`scheduleContiguous` (schedule_author.js) and
  `injectGantt`'s own `getInstallSecs` (time_machine.js) — §TM_DURATION_SYNC's own comment names the
  exact same failure shape ("a hand-duplicated copy of the per-unit-rate formula") and the fix was
  identical in spirit: single-source call, not two recipes. Precedent that this doctrine is real, not
  invented for this one bug.
- **Named, open, not chased further here:** `witness_crew_demand.js`'s audit finding
  (`WITNESS_CONTRACT_AUDIT.md` Batch A) — crew/cost math reimplemented against a stale 8h `SHIFT_MS`
  instead of the live 24h `SHIFT_HOURS`. Two representations of "how long is a work shift" that drifted
  — same doctrine, different fact. Status per that audit: looked improved on a fresh run (§ result:
  "Verify the WITNESS logging" pass, 2026-08-25) but not confirmed fixed via a source diff.
- **Structural, already named and mitigated elsewhere in this project (not re-litigated here):** the
  split-DB architecture (`_meta.db`+`_geo.db` vs `_extracted.db` — "which file is the real building")
  is this same doctrine at the FIXTURE-RESOLUTION level, not the data-computation level. Already has
  a house rule (`resolveDbFile()`'s "prefer meta, fall back to extracted, LOG the choice" pattern,
  `witness_midair_zero.js`'s own header) and a named landmine memory
  (`project_split_db_live_vs_probe_landmine.md`). Cited here only to show the doctrine recurs at more
  than one layer, not as a new finding.
- **Candidate, unconfirmed, flagged for whoever picks this up next:** `_rawScheduleRemember`
  (§S4_RAW_SCHEDULE_REUSE, `time_machine.js`) is explicitly modeled on the SAME reuse-cache shape as
  `_displayTimeline._last` (§7's second hypothesis) — "mirrors the EXISTING §CPM_DISPLAY_ONE_TRUTH
  display-timeline cache one level earlier." Given §7 found the FIRST cache's shift logic correct
  under test, this SECOND, structurally-identical cache is unconfirmed either way — not tested here,
  named so it isn't lost.

## ⚠ 0. DEPLOY GOTCHA CAUGHT LIVE, 2026-08-25 — SUPERSEDED, kept for history
**PR #1521 (below) merged. So did its sequel, PR #1524 — the identical miss repeated for PR #1523
one PR later, despite this section's own "no exceptions, checked every time" being written minutes
before it happened again. See §CRISIS TIMELINE items 2/4 and LESSON 4 for the current, corrected
state — a written rule alone has now failed twice; don't treat this section's confidence as current.**
Original note, left as-is below for the record:

#1520 merged, fix confirmed on the server (direct fetch), but a LIVE RE-TEST still showed the 1970
bug. Cause: `time_machine.js` is in `viewer/sw.js`'s `PRECACHE_ASSETS`, and #1520 didn't bump
`CACHE_VERSION` — an already-installed service worker keeps serving its OLD cached copy regardless
of what the server has. This is a KNOWN, already-documented house rule
([[feedback_sw_version]]/`PHOTOREAL_STILL_RENDER.md`'s "sw.js CACHE_VERSION bump is MANDATORY
same-PR") that got violated here anyway. Fix: bim-ootb PR #1521 (`v1084 -> v1085`), merged. If you
land here and the bug still reproduces LIVE, check `git log -1 -- viewer/sw.js` / the live
`§BUILD_VERSION` line BEFORE re-opening the root-cause investigation — it may be a THIRD cache miss,
not a new code defect; confirm before assuming otherwise.

## 🗺 RESUME HERE — open items, 2026-08-25 — ⚠ NOT the priority order, §CRISIS/§UNRESOLVED supersede
**Do NOT start here.** This list predates §CRISIS and its own confidence language ("doesn't block the
fix," "the clamp guarantees the VALUE is real") is now stale — read §CRISIS's UNRESOLVED block first
and work that before returning to this list. Kept below because items 3-4 are still real and still
unaddressed, just not the current top priority.

1. ⛔ **CELL-path mechanism still unconfirmed** (§7 item 3, §CRISIS LESSON 3). `HHS_Office_Federated`
   uses `path=CELL` on some loads and `path=GRAPH` on others (`repr=97.06%` vs `85.47%`, unexplained)
   — the headless test harness only ever reached GRAPH. To chase: get `witness_midair_zero.js`'s own
   harness pattern (it DOES reach CELL on real fleet buildings — check its `§CELL_GATE ...
   path=CELL` lines) and re-run §7's two-call sequence through THAT path specifically.
2. ⛔ **W-PE-5/6/7 — 4 display sites still read the raw internal clock directly**
   (`updateStatus()`, `_finishActivate()`, `§TM_PINPOINT_JUMP`, `§TM_ORDER_JUMP` in `time_machine.js`).
   Fix: make each read the real project range from `tasks`/`_cap` directly, matching the
   established §S22/§S72 precedent — NOT a second clamp/rescale, a display-layer fix. Witness already
   exists and is already RED-by-design for exactly this (`witness_gantt_props_epoch.js` W-PE-5/6/7) —
   when this is fixed, those checks should flip to PASS; remove the `KNOWN_RED` entry in
   `run_witness_suite.js` at that point, not before.
3. ⛔ **`witness_crew_demand.js` shift-hours claim — looked improved, never confirmed via diff.**
   Audit (`WITNESS_CONTRACT_AUDIT.md` Batch A) found it reimplementing crew/cost math against a
   stale 8h `SHIFT_MS` instead of live 24h `SHIFT_HOURS`. A later run (2026-08-25, "verify the
   WITNESS logging" pass) showed real-looking per-class numbers and a NEW gate name
   (`G-CREW-FIXED` vs the audited `G-HR-INVARIANT`), suggesting a fix landed — but no source diff was
   read to confirm. To chase: `git log -p -- viewer/tests/witness_crew_demand.js` around the shift
   from the audited shape to the current one, confirm `SHIFT_MS`/`SHIFT_HOURS` are the same constant
   now.
4. ⛔ **`_rawScheduleRemember` — same reuse-cache shape as the one just proven correct, untested.**
   §9's own finding. To chase: repeat §7's exact two-call-same-context technique
   (`sliceFn`-extract, real `_cap`/elements, two `computeSchedule` calls at different anchors) against
   whatever consumes `_rawScheduleRemember`'s cache instead of `_displayTimeline`'s.

Session end for THIS lane = each of 1-4 is ✅ or gets its own `⛔ BLOCKED: <question>` if it hits a
wall — don't loop on one, move to the next, per this project's WORK-TO-ZERO rule.

---

## §W_PROGRESS — SPEC, 2026-09-02. A witness that cannot report its own PROGRESS is not a witness.
**Queue item `AGENT_QUEUE.md` A-16b. This is CLAUDE.md clause 4 extended from _failure_ to
_liveness_, and it is written because the missing half cost two false reports in one day.**

### The defect, stated as the sequence that produced the wrong answer
`witness_cpe_aim_retire.js` (and its four cinema/aim siblings) has exactly one shape:

```
puppeteer.launch → p.goto → waitForFunction × 4 (streaming, element_transforms; Hospital: tens of
minutes) → ONE long `await p.evaluate(...)` → *every* console.log
```

Nothing is printed until the last arrow. A run redirected to a log file therefore holds a **0-byte
log** for its entire duration. On 2026-09-02 a polling loop read that 0-byte log, concluded the
Hospital run had never happened, and reported "never measured" — while the run had in fact
completed. A second attempt truncated the same file. Both conclusions were retracted (`A-16`).

**The 0-byte log is the defect, not the reporting.** A log that is empty at minute 40 is
indistinguishable from a log that is empty because the process died at second 3, and a witness that
cannot tell those apart cannot be read at all.

### The rule
> **Silence must be distinguishable from "still working".** A witness with a long-running phase
> MUST emit, unbuffered, (a) a line naming each stage as it *completes*, and (b) a heartbeat while a
> stage is open. A 0-byte log for a live run is a §CRISIS-class defect in the same family as a
> witness that cannot print FAIL.

Three states, exactly parallel to PASS / FAIL / INCONCLUSIVE:
- **a stage line** — this much definitely finished;
- **a heartbeat under an open stage** — still working, here is where;
- **nothing at all** — the process is gone, and the last stage line names how far it got.

### The mechanism — no new plumbing, the hook already exists
Every one of these witnesses ALREADY installs `p.on('console', …)` and already keeps the page's
`§`-lines (CLAUDE.md rule 3). In-page progress therefore needs no new channel: the page emits a
tagged `console.log`, the existing hook forwards it. What was missing is only that (i) nothing in
the page emitted progress and (ii) the node side buffered.

`witness_kit/progress.js` — one shared module, so this is not re-hand-rolled per witness:
- `Progress(name)` → `pr.stage(label)` closes the previous stage with its duration and opens a new
  one; `pr.attach(page)` forwards in-page `§W_PROGRESS` console lines; `pr.end()` closes the last
  stage and stops the heartbeat.
- **Writes go through `fs.writeSync(1, …)`, never `console.log`.** Node buffers stdout when it is a
  pipe; a SIGKILL then loses exactly the lines that mattered. `writeSync` is the whole point.
- The heartbeat is a `setInterval` (default 15 s, `unref`'d so it can never hold the process open)
  printing the OPEN stage and its elapsed time.
- `W_PROGRESS=0` disables it — needed so the acceptance test below has a red control.

### Acceptance test — `viewer/tests/witness_progress_flush.js`
The claim is about what survives a kill, so the witness kills. It spawns a real fixture
(`viewer/tests/fixtures/progress_fixture.js`: a real puppeteer page, a real long `page.evaluate`
emitting in-page progress), waits, then `SIGKILL`s the whole process group, and reads the log:

- **P1 STAGE SURVIVES A KILL** — log is non-empty and its last stage line names the last COMPLETED
  stage.
- **P2 IN-PAGE PROGRESS CROSSES THE `p.on('console')` HOOK** — at least one forwarded in-page stage
  is present, proving the mechanism the spec names actually carries during a long `evaluate`.
- **P3 HEARTBEAT** — an open stage that outlives the interval emits a heartbeat, so a hung run is
  distinguishable from a dead one.
- **P4 RED CONTROL** — the identical fixture with `W_PROGRESS=0`, killed identically, MUST produce
  the **0-byte log**. If it does not, the witness is not measuring what it claims and says so.
- Any of P1-P3 whose fixture never reached the kill (chrome failed to launch, port busy) prints
  **INCONCLUSIVE**, never PASS — an assertion over a run that did not happen judges nothing.

### Scope
All five cinema/aim witnesses share the shape and all five get instrumented:
`witness_cpe_aim_retire.js`, `witness_cpe_corr_brush.js`, `witness_cpe_aim_pin.js`,
`witness_cpe_stick_hold.js`, `witness_cpe_hose.js`. No product code is touched — this is entirely
harness-side, so it cannot perturb any measured number, and every existing `§`-line keeps its exact
text (progress lines are a NEW tag, not a rewrite of an old one).

## §MODELLER-NET-AUDIT — SPEC, 2026-09-26. Priority 1 from the Modeller assessment (MODELLER_MASTER ⚖ block).
```
SCOPE: every bim-ootb modeller/tests/witness_*.js. Find witnesses that PASS without judging the claim they name.
Read the log after every run. Report per witness; fix or mark, one PR per batch.
```
**Why (measured 2026-09-26, all hidden behind green witnesses):** catalog empty 3 months (W-TERMINAL-WALKALL-PERF T6 saw
pageerror only — 1,194 fold failures unseen); the Outliner roof row never walked (engine-seam witnesses bypassed discWalk);
W-ROUTE-PATTERN-BRIDGE tested an opts-less walk production never runs; W-E2E-CUT C6 compared pixels after a click that hit
another element; W-SAVE-BLOCKED-HEAL-INDUCED's fixture found nothing since §XEDGE-3AXIS; W-E2E-WALK read the op-log before the seed.
**Per witness, classify (write the table into this section):**
1. WRONG-PATH — drives an engine seam / hook where users go through a UI handler (discWalk, Outliner rows, toast buttons).
2. SCOPE-BLIND — asserts pageerror/exit only while the app logs failures as console lines (grep the run log for fail/refuse/
   unknown/REFUSE/§*-FAIL that no check reads).
3. VACUOUS — a check that passes over an empty population (0 rows, 0 placed, no fixture found) without printing INCONCLUSIVE.
4. RACE — snapshots before the ARC seed / history settle (op-log length 0, before.oplogLen=0).
5. PIXEL-AS-PROOF — framebuffer sums used as the verdict (Primal Law: numbers, not pixels).
**Done when:** every witness has a class (or "sound"), each non-sound one is fixed or retired with a reason, and each fix shows
base-vs-fix numbers. Method that worked: probe the app's own state numerically before trusting a red (C6: bbox + selection).

### §MODELLER-NET-AUDIT — RESULT batch 1 (2026-09-26, PAUSED — machine suspend). bim-ootb branch `test/modeller-net-audit`, pushed, **NO PR yet**.
**Scope done:** the 58 `e2e_harness` witnesses, run at 3-parallel on untouched `origin/main` (baseline), then serially, then on 1069c70c (09-25).
**Headline:** 19/58 were RED on main. 8 of them pass serially (load flakes); 11 were red serially too, and 10 of those were already red on 09-25. Nothing runs these in CI, so nobody saw it.
**SCOPE-BLIND (harness `§NET-FAILLOG`, report-only):** the 39 green witnesses hide NO product failure line. Every hit was noise (favicon, `total=0`/`refused=0` summaries) or intended (ITEMDRAG REFUSED, simulated quota). One real data gap: `ELEC/EMERGENCY_LIGHT` has no catalog mesh (row 14). ⚠ The 46 direct-puppeteer witnesses do not use the harness — NOT yet covered.
| witness | class | root cause (measured) | base → fix |
|---|---|---|---|
| W-E2E-SCALE | RACE | a §ZOOM-SEL fly outlived flySettle's 15 s cap at load, overwrote the frame; press landed (1251,866) off a 1200×850 viewport → move, not scale | 4/3 → 7/0 |
| W-E2E-RSARM | RACE | the scale commit re-selects → fly; ring pixels projected mid-fly; ring grabbed at 0° where it crosses the X arrow (rotZ@4.16 vs x@4.18) | 7/1 → 8/0 |
| W-E2E-DM-SNAPGEOM | RACE | the select-fly lands the camera 2 m away → drag target off-canvas, no commit | 2/5 → 7/0 |
| W-E2E-FLOATDIM | RACE | D1 commit re-select fly moved the camera under D4's ring press | 5/1 → 6/0 (3/3 under load) |
| W-E2E-SEL-TINT-REFOLD | RACE | re-click while #stat='cutting…'; bCut's trailing highlight(null) wiped it | 6/3 → 9/0 |
| W-E2E-INSTPICK | WRONG-VIEW + RACE | camera 0.6 m ABOVE a ceiling fixture → slab 175 hit first; P2b camera overwritten by P2's fly | 4/3 → 7/0 |
| W-E2E-LOD-MATCH | WRONG-PROXY | raw vertex count (renderer splits per face: 762→3230) vs geometry; now tris + distinct positions (758=758) | 4/2 → 6/0 |
| W-E2E-VOID-ANCHOR G6 | STALE-BASELINE | 07-30 file predates §XEDGE-3AXIS (varied code AND anchors); now a same-run control: live == stripped, kept differs (+350 abuts) | 18/1 → 19/0 |
| W-E2E-INSTHIDE H1-rig | ⛔ FIXTURE GONE | twin match was centre-vs-base (fixed via `_dw.cz`, 0/480 → matched); still no pose shows 5 unoccluded (best=2) → prints INCONCLUSIVE. Needs a fixture redesign | 2/1 (honest) |
| W-E2E-ROW7-GEO-REINIT R4 | env | `Terminal_arcstr_proof.db` is gitignored, only in the main checkout → correct INCONCLUSIVE in a worktree | — |
| disc_density D3/D4, walkall_terminal_scale T5 | VACUOUS | `[].every()` / `envChecked===0` passed on nothing; guards added. **NOT RUN yet** | — |
**⛔ OPEN before any PR:** a post-fix 3-parallel run (loadavg ~38 vs ~31 at baseline) went red on CUT C4, CUT-LAYERS L6, SKETCH K5b (PIXEL-AS-PROOF framebuffer sums) and GRIDMOVE-ROOF R6 — all green at baseline. Re-run these serially on the branch vs main to separate a harness regression (the flySettle yield) from load. Then run the 51 node witnesses + the 46 direct-puppeteer ones (not yet touched).

### §MODELLER-NET-AUDIT — RESULT batch 2 (2026-09-27, PAUSED — suspend). bim-ootb branch `test/modeller-net-audit`, pushed, **still NO PR**.
**Batch-1 open item CLOSED:** CUT C4 / CUT-LAYERS L6 / SKETCH K5b flipped with no code change (serial, load ~0: C4 red on main and
green on the branch; L6 the reverse) → PIXEL-AS-PROOF, retired as verdicts (numeric C6 / K5 / L6-tris carry the claim).
GRIDMOVE-ROOF is green on both serially (load flake).
**Two PRODUCT bugs found + fixed (both red identically on main):**
- `bonsai_outliner.js`: the ⇄ adjacency lens was keyed on the numeric `_selId` while rows are GUID-keyed → dead for every ARC-seeded pick (W-UX-XEDGE 7/3→10/0).
- `str_walker_outliner.js`: nothing repainted the Outliner after the ARC bridge landed → 0 leaf eye toggles on open (W-E2E-OLEYE 2/3→5/0).
**Node-run set (51):** 27 red at first, mostly ENV: playwright lives in `~/bim-ootb/tests/node_modules` (set NODE_PATH); gitignored
fixtures `Terminal_arcstr_proof.db` / `Terminal_plates_proof.db` / `JKR_ARC.db` must be copied into a worktree; render_fidelity needs
a server on :8399. Real ones fixed: green_report (MEP oracle read the ARC-only DB since c63939a3; 0→11,567 MEP), grid_tilt_guard
(missing cut_move.js copy since #1711), ux_pill A5 and pill_verbs D5 (hardcoded counts), stretch_gate_smoke S4 (stretched outward),
dw_dedup_render D3 (sampled before the routed sweeps committed), olsync (fly race).
**⛔ Questions for red1 (a data/doctrine call, not a witness edit):**
1. SampleHouse has 0 IfcSpace in both DBs, but W-UX-PILL A8 expects 3 rooms. Were rooms lost in the 07-10 ARC-only embed, or never there?
2. Since #1770 (catalog loads), 274/281 SampleCastle ELEC IfcFlowFitting render as `FITTING_BEND_PVC_DWV` (a plumbing drain bend).
   Allowed borrow, or wrong class? (W-DW-HONEST-FALLBACK is red on this.)
**Parked with cause:** W-TERM-WALK (asserts SampleHouse loads terminal_rules, which contradicts the Walker Doctrine; needs repointing
to the Terminal resident and re-validating 7 claims); W-DW-ROT-UNITS R4/R5 (all 5 yaw≈π/2 fixtures are square now → INCONCLUSIVE);
W-E2E-INSTHIDE H1 (fixture gone); W-MODELLER-GIT-HISTORY G6 (labelled KNOWN GAP).
**NEXT (resume here):** the direct-puppeteer batch ran 45/46 on the branch. Untriaged reds: mv_parity, gridstretch_multi,
grid_clear_leak_round2, hba_iot_scanline_fix, walk_gesture, xray_poc, residents_anchor_sweep, xray_regression_sh,
grid_scale_yaw_hardening, xray_sc_duplex; walkall_terminal_scale did not finish. Check each against main first, then root-cause.
Then PR the branch (a bot auto-merges, so only once every listed change is witnessed green).

### §MODELLER-NET-AUDIT — RESULT batch 3 (2026-09-27). Branch `test/modeller-net-audit`, pushed, NO PR yet (full 155 re-run in progress).
**Two more PRODUCT bugs fixed (red on main, each shown falsifiable):**
- **§XRAY-REFOLD** — x-ray was never re-applied after a re-fold: any commit / undo / a walk's late routed commits while x-ray was ON
  returned the building to opaque with the button still lit. SampleCastle: structureLeaked 3144, fixtures glowing 0/274. Now
  re-applied on 'bonsai:refold' + after _redrawAllDiscWalks. New X-REFOLD claim: fix disabled → leaked 3151/174 FAIL; fix → 0 PASS.
- **§RW-TAG-SIGNED** — `oplog.commit` signs only {op_type, parameters}; route-walk ops carried `_rw` at the op's top level, so the tag
  never reached the log and x-ray treated every route-walk fixture as structure (glow 0/21). Moved inside `parameters`.
**Witness fixes:** residents_anchor_sweep (read the retired `mesh.db` → each resident's own `_geo.db` from `GEO_BASE`; 32/0 on all 8
residents), grid_scale_yaw_hardening (cut_move.js copy), hba_iot_scanline_fix (pre-fix ref = `4a2e3f65^`, HEAD had become the fix),
grid_clear_leak_round2 (detached-row retry), xray_poc / xray_sc_duplex (routed-run `dwChain` mesh is not a fixture bucket),
routewalk self-tests (planned − refused, not a literal 23), gridstretch_multi / walk_gesture (load waits).
**Parked with cause:** W-MV-PARITY Leg M — asserts against `Duplex_extracted.db` (253 el) while the resident renders `Duplex_ARC.db` +
`Duplex_geo.db` (196 el); the two Duplex geometry sources disagree on triangle count for 82/203 hashes (121 agree, 12 missing).
**⛔ New question 3 for red1:** should ROUTED RUNS (conduit/pipe tubes, `dwChain`) glow in x-ray like fixtures? Today they stay opaque.
**⛔ Question 4:** which Duplex geometry is canonical — `Duplex_geo.db` (served) or `Duplex_extracted.db` (82 hashes differ)?
