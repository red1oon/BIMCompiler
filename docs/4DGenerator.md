# The 4D Generator — Journey, Failure Catalogue, and What It Teaches About AI Coding Agents

> **Companion reads:** [Vibe Programming](VibeProgramming.md) for the general AI-assisted-development thesis this document is a deep case study of · the Time Machine feature guide (`BIMUserGuide.md`) for what this generator produces · `bim-ootb/prompts/4D_MODEL_INTEGRITY.md` and `4D_GANTT_TM_REFACTOR.md` for the raw, dated working notes this document distills.

This is a technical reference for two audiences at once: developers who need to understand how this project's 4D construction-schedule generator actually works and where its known sharp edges are, and AI researchers interested in a concrete, evidenced account of where large-language-model coding agents fail on a genuinely novel domain — and what process change fixed it. Both audiences need the same thing: what actually happened, with citations, not a polished summary.

**4D scheduling is a use case here, not the subject.** The subject is what happens when a vibe-programming session meets a domain it has no prior familiarity with — it drifts, and getting it back on track takes a real sequence of deliberate steps, not one clever fix. 4D/Time-Machine simply produced the deepest, most instrumented example of that pattern on the day this document was written. It is not the only one: the same shape — work done in isolation, never reconciled back, silently drifting until something finally checks and catches it — surfaced again the same day in a completely unrelated domain, publishing this project's own documentation (§7). Read the failure catalogue below as *an* instance of the general problem [Vibe Programming](VibeProgramming.md) names, not *the* problem.

## Executive summary — is this codebase well designed?

Asked plainly, mid-session, after the failure catalogue below was already found. The honest answer, scored against that evidence rather than impression:

- **Conceptual architecture — solid.** Layered separation of concerns (§B in `4D_MODEL_INTEGRITY.md`), level-major Location-Based Scheduling (§2.2), a template/instance split, an extract-don't-invent discipline. The right ideas, and they're written down.
- **Duplication discipline — the real weak point.** The same physical relation independently reimplemented more than once, silently disagreeing, is the pattern behind §3.2 and §3.3 both. A fix to one copy does not reach the others. This is the single highest-leverage thing to fix architecturally, ahead of anything else in this document.
- **Test/CI wiring — mostly decorative today.** Extensive witness coverage exists; §3.7 found none of it wired into the pipeline that would need to run it automatically. A safety net not connected to a trigger is not a safety net.
- **Documentation health — was actively harmful, now improving.** Multi-thousand-line files grown by append-only session logging is what produced §3.1's three-times-restated retraction. One file was already internally flagged (`time_machine.js`, 8,834 lines, its own tracked refactor-seam doc) as a known instance of this — known, not yet acted on.
- **Cross-repo and deploy sync — real, found twice in one day.** §3.6's precondition (§3.4) and §7's orphaned-branch page are the same underlying gap: work landing in one place without a mechanical check that it also reached everywhere it needed to.

**Bottom line:** well-designed in principle, drifted from that design in practice. Everything found today was fixable by consolidation — delete a duplicate, wire a check in, split a file, merge a branch back — not by redesign. "Easy to maintain" as it stands would overstate it; "maintainable if today's discipline holds" is accurate.

---

## 1. Why this domain is hard for an AI coding agent specifically

[Vibe Programming](VibeProgramming.md) already states the general thesis: *"known framework = reliable code, novel spatial reasoning = drift."* Generating a construction schedule from a 3D BIM model is squarely in the drift half. There is no large corpus of "IFC element → construction task sequence" examples in any LLM's training data, for a structural reason: the mapping isn't textual, it's physical. An AI can write a correct SQL query for "elements grouped by storey" fluently, because SQL grouping is a well-worn pattern. It has no comparably well-worn pattern for "can this slab exist yet, given which columns are actually built" — that requires reasoning about gravity, support, and sequencing simultaneously, which is not a pattern that shows up in code search results.

The consequence, measured on this exact codebase before the process changed (2026-08-26, one session): five retractions, a structural-class regex that would have made 438 curtain-wall glazing panels load-bearing, a quantifier bug that produced 1,961 instead of 95, a missing upper bound that let a single riser "bore" the whole building. None of these are exotic bugs. They are what happens when an agent is asked to invent spatial-physical reasoning it has no textual precedent for, and does its best — confidently, plausibly, and wrong.

The fix that worked, documented in full below, was not a better prompt. It was accepting that the agent cannot originate this reasoning reliably and building a process that doesn't require it to: extract the relation from data instead of deriving it from first principles, and verify every claim numerically instead of trusting the reasoning that produced it.

---

## 2. The domain, correctly framed

### 2.1 The pipeline shape

```
4D_template.json (canonical, building-agnostic programme)
        ↓
instantiateTemplate()  — per-building task grid
        ↓
Time Machine — the editable, persisted schedule a user actually sees and drags
```

The template declares *what* happens (phases, trade sequencing, lag rules) once, for all buildings. Per-building instantiation decides *where* — which elements land in which phase, on which level, in what order within that level. Getting the "where" wrong is where nearly every defect below lives; the template layer itself has been comparatively stable.

### 2.2 Location-Based Scheduling is the correct model, not an invented one

This project's own model spec (`4D_MODEL_INTEGRITY.md` §A) organizes the schedule **level-major, phases inside**: `Building → Level → Phase → Layer → Element`. Before this was understood to be industry-standard, it was discovered the hard way: phase-major ordering (all Superstructure before all Architecture) produced 17 bearing violations on a 20-element sandbox, because it put a Level-2 slab before the Level-1 walls it rests on. Inverting to level-major cut that to 10.

This is not a house style. It is **Location-Based Scheduling (LBS)** — also called Line-of-Balance or flowline scheduling — the established alternative to plain trade-first CPM scheduling, used specifically for repetitive multi-story vertical construction (hospitals, offices, residential towers), because it is the representation that makes physical-support ordering visible instead of accidental. A generator for this domain should default to level-major grouping; that default is not a stylistic choice, it's the reason the model works at all.

### 2.3 Resourcing without an engineer: crew rates as the build-up throttle, and a clean exit to a real schedule

Every 4D-BIM tool in mainstream use — Synchro, Vico — starts from a schedule someone already built: authored by hand or imported from Primavera P6 or MS Project, then linked to the model. That's correct for the tool's job, but it means there is no such thing as opening an arbitrary building and getting a resourced, sequenced schedule with zero project-specific planning. The closest AI-driven comparable, ALICE Technologies, is explicit that it optimizes *from an existing baseline schedule and activity/logic set* — it accelerates re-planning, it doesn't remove the planning step. [Sources: ALICE Technologies, Bentley SYNCHRO](#sources-for-23).

This generator does remove it, for the specific purpose of instant, on-the-fly demonstration — walking into a room with a building's IFC and no scheduler present, and having a legally-sequenced, resourced, dated schedule the moment the model loads. That's only honest as a claim if the mechanism producing "resourced" is named precisely, so here it is:

**What drives build-up speed.** Every trade has a day-rate and a crew count in a small, declarative table (`rates/sequence_rules.json`'s `LABOR_RATES`), not a simulation: `max_crews` sets capacity (`§CREW_DEMAND` reports `capacity = crews × projectDays`, and flags `util>100%` when a trade's declared work can't fit its declared crews — the log literally tells you which trade needs more crews, e.g. measured on Hospital: `PLUMBER demand=1563.8cd crews=2 capacity=2970cd util=52.7%`). Real per-element geometry then modulates that flat rate rather than treating every element identically — `§HEAVY_MEMBER_SPEED_LIMIT` redistributes each trade's flat total by each element's actual length, so a 7-meter beam and a 1-meter one don't install at the same assumed speed. The result, `§HR_COST`, is a real person-day and dollar figure per trade (`STEEL_ERECTOR personDays=815.0 @195/d = 158925`), derived, not typed in.

**The adjustment path is fast in two different ways, and they are not the same mechanism.** Every dated bar in the live Gantt is directly draggable, lockable, and undoable — an instant, in-session adjustment with the persistence and integrity guarantees covered in §3.5–3.6. The *resourcing assumption itself* (how many crews a trade gets, what a crew costs) is a one-line edit to `rates/sequence_rules.json`'s `max_crews_fixed` followed by a regenerate — seconds, not a re-plan, but a distinct step from dragging a bar. Presenting both accurately matters more than presenting one as more magical than it is.

**The exit ramp is real, not aspirational.** The Time Machine's toolbar carries a `⇄ P6/MSP` control, and `_tmPersistEdit`'s own call sites (verified in §3.5's investigation) include `import_p6` as a first-class edit path alongside drag/link/undo — importing a real Primavera P6 or MS Project schedule is not a separate product mode bolted on, it writes into the same persisted schedule tables the auto-generated one uses. The generated schedule is a placeholder with real physics, not a toy: it is legally sequenced (support-ordered, crew-capacity-checked) from the moment it appears, and it is designed to be *replaced*, not defended, the moment an actual project scheduler's P6 file exists.

<a id="sources-for-23"></a>*Sources checked 2026-08-27: [ALICE Technologies](https://www.alicetechnologies.com/construction-project-scheduling-software) · [Bentley SYNCHRO](https://www.bentley.com/software/synchro/). Web-search-level evidence, not an exhaustive market survey — treat the comparison as directionally accurate, not a verified "no prior art" claim.*

---

## 3. Failure catalogue

Each entry: what looked fine, what was actually wrong, how it was proven, and the fix. All findings below are dated 2026-08-27 unless stated otherwise, verified against merged code, not self-reports.

### 3.1 The spec described dead code as canonical

**Symptom.** Every fix aimed at "the 4D model" for months, including the day before this one, patched `bar_model.js`'s tree model — the model `4D_MODEL_INTEGRITY.md` §A described as canonical, with the invariant "no edges emitted, sibling order IS the order."

**Root cause.** That tree model is not what runs. The live path is `schedule_author.js:425 instantiateTemplate()`, an explicit edge-based task graph — the opposite of "no edges emitted." The project's own ownership table (§I, built the same day) had already correctly named `instantiateTemplate` as the owner of "what is the task grid?" — it simply was never reconciled with §A above it. Two sections of the same file contradicted each other from the day one was written, and a later session re-derived the contradiction as if it were new, burning three fix cycles wiring edges into a model whose own text said it had none.

**Fix.** A decision, not a patch: the user ruled the template path canonical. `4D_MODEL_INTEGRITY.md` §A now carries a superseded banner. A `PreToolUse` hook (`bim-compiler/.claude/hooks/block_bar_model.sh`) mechanically blocks any `Edit`/`Write` to a path ending `bar_model.js`, repo-wide, in any worktree — proven live with a real blocked edit call, not just documented. **Lesson: when two authoritative documents disagree, the fix is reconciliation plus an enforced, un-skippable guard — not another spec section explaining the disagreement.**

### 3.2 Storey/level assignment fabricated data past its own safety guard

**Symptom.** `elements_meta.storey` is NULL for 15–86% of scheduled elements fleet-wide (Terminal 69.9%, Duplex 86.0%). The schedule invents storeys to compensate: Terminal declares 6, the schedule produces 22 bands, one of which — "06 ROOF LEVEL," declared by 10 elements — collects 10,950.

**Root cause, found by tracing the actual call path rather than trusting the existing guard.** `deriveBandRanks` (`schedule_gate.js:350`) deliberately excludes `_UNKNOWN` from the ladder — a correct-looking safety guard, added after a measured Hospital regression. But upstream, `assignStoreyByZ` (`schedule_author.js:342`) silently overwrites every `_UNKNOWN` element with the nearest real storey name by median center-Z *before* that guard ever runs. **The guard was dead code from the moment it was written**, because the thing it was meant to catch never survives long enough to be checked.

**A second, independent implementation of the same relation was already live and correct.** `LevelDeriver` (`viewer/lib/level_deriver.js`) — a tiered relation (containment → declared name/`spatial_structure` → geometry grid → none-counted) — was already running in production, but only for the *display* timeline (via `location_axis.js`), never for the task grid that actually generates the schedule. Two computations of "what level is this on," on the same elements, in the same call, disagreeing.

**Fix, verified not assumed.** Confirmed `LevelDeriver` reads the database directly and never touches the corrupted field, so swapping to it removes the exposure rather than relocating it (`bim-ootb` PR #1556). Shipped behind a flag, default off, proven byte-identical to prior behavior with the flag off across three existing witnesses. **Left off deliberately** — see §3.4. **Lesson: a guard that excludes a bad value only works if nothing upstream launders that value into a good-looking one first. Verify the guard actually sees what it's supposed to catch, don't just read its logic in isolation.**

**A related, measured non-obvious result:** the rate at which storeys are *fabricated* (87%/31%/15% across three buildings) does not predict the rate at which the schedule's actual *structure* changes (9.6%/7.8%/40% for the same three) — a wrong-but-plausible guess and a genuinely different grid produce very different downstream impact from similar-looking input corruption. Don't use one as a proxy for the other.

### 3.3 A "does S support T" relation, independently reimplemented three times

`4D_MODEL_INTEGRITY.md` §I.1: `support_sweep.js:410` (the declared owner), `cpm_schedule.js:81` (a full independent reimplementation, not a delegation), and `schedule_gate.js:1195` (a third copy with a different, stricter upper bound added later to fix a specific false-positive class). Copies 1 and 2 never received that later fix. Measured consequence: 32.0% of Hospital's in-scope bearing contacts are "supports" whose top sits above the base they're claimed to carry — and the solve runs on copy 2, the one that never got fixed. **Lesson: a physical relation computed independently in more than one place will drift the moment either copy is patched alone — this is not a hypothetical risk, it happened, silently, for an unknown period before being found.**

### 3.4 A fix correctly not shipped, because its precondition was checked first

`LevelDeriver`'s higher tiers need `spatial_structure` with real elevation data. Checked before flipping the flag: **Duplex and Hospital have no `spatial_structure` table at all.** Flipping the flag today would have degraded the grid to a uniform 3-meter fallback, inflating Hospital from 8 real storeys to 16 fabricated ones, with grid lines occasionally winning a label on absurd margins (one "Level 6" label won on 2 votes out of 5,676). The flag was left off, and the real blocker — the extractor fix committed that same morning (`d0b226dce`, writing `IfcBuildingStorey.Elevation`) never having reached the already-shipped databases — was named as the actual next step. **Lesson: proving a fix is safe-by-construction (flag off, byte-identical) is necessary but not sufficient; also prove the condition required to turn it on, before anyone is tempted to turn it on.**

### 3.5 A witness that was correct when written, and silently went stale

`witness_gantt_edit_persist` (W-PERS) exists to prove a Gantt edit persists correctly. Its split-mode fixture never set `_dbPersistUrl` — because when the witness was written, the real code didn't read that field either. A later fix (§S78) changed the real persist logic to prefer `_dbPersistUrl` for split-mode buildings; nobody updated the witness fixture to match. The witness kept passing throughout — it was proving a version of reality that no longer existed.

**The proof that this was real, not theoretical:** the actual pre-fix bug was reverted and both witnesses run against it. The *old* witness stayed green — `pass=14 fail=0`, "PASS — every Gantt edit path persists" — on the exact defect it existed to catch. The *extended* witness correctly failed, `pass=17 fail=1`. That side-by-side result is the only real evidence a witness extension closed a gap; a witness that merely "looks right" against the current code proves nothing about whether it would have caught the bug it's named for. **Lesson: to validate a regression guard, don't just make it pass on the fixed code — make it fail on the broken code first, on purpose.**

### 3.6 A cache evictor, not the save path, silently destroyed saved user data

**Symptom.** Editing a schedule on a large building (Hospital, ~56MB) appeared to save successfully (`ok=true`, correct cache key logged, no error) — but on reload, the edit was gone and the app silently re-fetched the pristine network copy.

**Root cause, found only by instrumenting the actual mutation, not the reported call site.** The persist function itself was innocent. A *separate*, oversized write (a ~240MB geometry file) hit Chrome's hard per-value IndexedDB limit (~127MiB) and aborted — a failure that can never succeed at any quota. The abort handler discarded the real error (`tx.error`) and assumed a quota problem, triggering an "evict the 4 oldest entries" fallback. The cache held exactly 2 entries, so it deleted everything — including the slot holding the user's edited schedule. A second, independent bug amplified it: saving an edit never updated that entry's last-used timestamp, so the just-edited slot looked *oldest* and was evicted first. **Editing your schedule moved your unsaved work to the front of the deletion queue.**

**Fix** (`bim-ootb` PR #1555): read the real abort error before deciding to evict; evict only on a genuine quota error; stamp the timestamp on every persist; surface a previously-nonexistent user-visible failure warning. Proven with real read-back across three sequential persists, not a single write. **A residual gap found by an independent audit, not the original fix's self-report:** two narrow code paths still yield a falsy error name and fall through to eviction regardless — the fix closed the reported case, not every case with the same shape. **Lesson: the module that logs success is not necessarily the module that caused the failure. When a symptom and its logged cause don't line up, instrument the actual mutation, and always look one layer past the fix that "worked" for a second path with the same failure shape.**

### 3.7 Green CI proved nothing about any of the above

An audit of the four PRs above found: **zero** of the new witnesses/probes added that day were wired into CI. Every PR showed green because of an unrelated, pre-existing smoke suite; the new checks were, at best, syntax-parsed. The single worst case: the file carrying the storey-datum fix (§3.2's sibling bug, `room_walker.js`) sits in a directory both CI jobs explicitly exclude — it has *no* automated check of any kind, not even a parse. The project's own PR template asks for manual browser testing and screenshots, directly contradicting this project's own no-visual-verification rule. **Lesson: "CI is green" is a claim about which jobs ran, not about what they checked. Verify the specific new assertion is actually invoked by the pipeline before treating a merged PR as regression-proof.**

---

## 4. The AI-research finding: what actually stopped the thrashing

The single sentence version, stated by the domain owner mid-investigation and confirmed by every failure above: *the model optimises the artefact in front of it and does not check whether the construct can represent the answer — so every fix moves the defect sideways and the loop never closes.* A single long-running session, however capable, re-derives and retracts the same finding when nothing external forces it to check first — measured directly: the same fact (§3.1) was independently restated three separate times in one file in one day, and a written instruction to "re-read the spec before each thinking pass" failed within hours of being added, in the same document.

What worked instead, same day, is a specific, reproducible pattern:

1. **Orchestrator-worker, not one long session.** One session holds the plan and never touches raw exploration; each actual code change goes to a fresh, single-purpose agent dispatch with an explicit stop-and-report condition ("if this needs a new architectural decision, stop and tell me — don't invent one").
2. **Numeric proof is the only accepted evidence.** Every dispatch was required to produce a before/after diff of real, persisted state — a byte count, a timestamp, a read-back value — never a description of what should have happened. This is what caught §3.6: the fix that "returned `ok=true`" was not accepted as proof until the actual store contents were read back.
3. **Guardrails are enforced mechanically, never left to memory.** §3.1's hook is the clearest instance: a written rule ("don't edit this file") had already failed once as prose; the fix was a `PreToolUse` hook that makes the mistake structurally impossible, verified by actually triggering it.
4. **Self-reports are audited against merged code, not trusted.** Every "done" claim in this document was independently re-verified by a separate pass reading the actual diff — which is precisely how §3.6's residual gap and §3.7's CI illusion were found. Both were real and both were missed by the fix's own author in the same turn it shipped.
5. **Wrong hypotheses get refuted before they get built, not after.** A proposed reuse of an existing UI module's storey logic (§4's own initial idea) was checked against the actual code before anything was written, and found to be the same bug wearing a different name — refuting it cost one dispatch; building it would have cost a rewrite.

None of this required a different or better model. The roster was unchanged from the prior working session ([Vibe Programming §Capability Snapshot](VibeProgramming.md#capability-snapshot-dated-baseline)). What changed was the shape of the work.

---

## 5. Journey, condensed

| When | What happened |
|---|---|
| 2026-08-26 | A full session, four review rounds, five retractions, patching a scheduler whose *design* could not express the right answer. User ruling: *"WITNESS is moot if underlying design is poor."* |
| 2026-08-27 early | A new session finds §3.1 (spec contradicts itself) but retraces the same finding three times in one file before closing — the "re-read the spec each pass" rule fails within hours of being written. |
| 2026-08-27 | Model decision made (template path canonical); §3.1's hook built and proven live; six bounded dispatches run end-to-end: §3.2's datum fix, §3.5's witness gap closed and proven by reverting the real bug, §3.6's data-loss bug root-caused and fixed, §3.2's `LevelDeriver` swap shipped flag-off with its precondition checked and found missing, §3.7's CI audit, this document. |
| Ongoing | §3.4's flag stays off pending the DB backfill; §3.3's three-copy support relation and the legacy `ZoneIndex`/`GANTT_STOREY_Z` fabrication path (a related but distinct third consumer — see `4D_MODEL_INTEGRITY.md` §I.3a) remain named, not chased. |

---

## 6. Open items — read before extending this generator

- **`LevelDeriver` flag (`opts.levelSource='deriver'`, `schedule_author.js`) stays OFF** until `spatial_structure` with real elevation exists on every shipped building DB. Flipping it before then actively makes level assignment worse, not better — verified, not assumed.
- **Two more independent copies of `assignStoreyByZ`'s fabrication logic exist**, feeding the movie/x-ray builders (`time_machine.js:3687`, `:4563`) via a shared `zone_index.js` — a second, separate mechanism from §3.2's task-grid copy. Not touched by the fixes above.
- **No CI job runs any of this project's 4D witnesses.** Still not implemented: one new CI job executing the node-runnable checks that already exist, and `spatial_structure` added to the DB-integrity required-table list. (**Done, 2026-08-27**: the buried §I.3a/§I.3 warnings in `4D_MODEL_INTEGRITY.md` are now surfaced at the top of its §L session-handoff block, not left mid-file.)
- **The support-relation triplication (§3.3)** has one declared owner and two independent copies still live; only one of the three received the later false-positive fix.
- **Four items queued live, not started**: residual midair elements, build-up elements crowding the start of their bar instead of spreading across it, whether that crowding masks a real resource-timing problem, and a full-cycle review of the standalone Schedule Editor. Recorded in `4D_GANTT_TM_REFACTOR.md` §FUTURE (2026-08-27).

---

## 7. The pattern isn't 4D-specific — the same day, a second domain

Everything in §3 is about spatial/physical reasoning going wrong. The same *shape* of failure — and the same *shape* of recovery — showed up the same day in a domain with nothing to do with geometry: publishing this project's own documentation.

**What happened.** A dispatched agent, mid-way through an unrelated docs task, ran the sanctioned deploy script's dry-run check before publishing — and it aborted. A live, publicly published page (this project's own academic paper) would have been deleted by the deploy, because its markdown source existed only on a branch that had been deployed to the live site once, directly, and never merged back into any branch anyone was actually working from. The branch had drifted 1,337 commits from where active work lived. Nobody had done anything wrong in the moment it happened — the drift accumulated silently across however many sessions touched docs since, each one working from a tree that looked complete because nothing told it otherwise.

**Why this is the same lesson as §4, not a new one.** Isolated work that never gets reconciled back into the shared source of truth is invisible until something checks — the deploy guard here plays exactly the role §4's `PreToolUse` hook and §3.5's revert-and-reverify test play elsewhere: a mechanical check that doesn't rely on anyone remembering. And the recovery followed the same discipline as every §3 fix: the agent did not override the abort, it did not guess a fix, it named the root cause precisely and surfaced three options — including the one that looked fastest (let the guard-blessed shrink through) and was actually the wrong one — to a human, who picked the minimal, purely-additive fix (restore the missing source from the orphaned branch) rather than the destructive one.

**The generalizable point**: neither the domain expert nor the AI needs to have seen a given domain before for this pattern to apply. Construction-schedule support ordering and documentation branch hygiene are unrelated fields. What's shared is the failure mode — undetected drift between an isolated working copy and the shared source of truth — and the fix — a mechanical check that fires whether or not anyone remembers to look, plus a human decision at the one point where a wrong choice would have been externally visible and hard to walk back. 4D happened to be where this project spent the most hours today. It was not the only place the lesson applied.

This document should gain new dated entries the same way [Vibe Programming's capability table](VibeProgramming.md#capability-snapshot-dated-baseline) does — append, never rewrite history.
