# ⁇ THE QUESTION THIS FILE OPENS WITH

## **What is wrong with Claude Code in modelling the solution?**

Asked by the user, 2026-08-26, after weeks of no progress. Answer it before you write code.
The evidence from one full session, all self-inflicted, all measured:

| what it did | what it cost |
|---|---|
| **Invented instead of extracted** when it hit a gap in the model | 5 retractions in one session; a structural-class regex that would have made 438 curtain-wall glazing panels load-bearing |
| **Re-derived a relation the codebase already owned** — four separate times | quantifier wrong (∀ for ∃): 1961 instead of 95 · missing upper bound: a 6.4m riser "bore" the whole building · dropped 2 of 3 clauses: every ceiling-hung pipe read as floating |
| **Reasoned about adjacency with tolerance constants** when the real question was containment, with exact geometry available | "63 uncountable elements" was really **10** · 209 floating was really **18** |
| **Wrote passes that could not tell it they had failed** | the layer pass returned null on a shadowed `global`, changed nothing, emitted IDENTICAL numbers, and nothing flagged it |
| **Trusted a green witness over the construct** | the whole template path shipped, was witnessed, and was NEVER CALLED — green and dead at the same time |
| **Read a stale checkout as canon** | concluded `4D_template.json` was lost when it was 14 commits away |
| **Patched symptoms in sequence** instead of asking whether the construct could express the answer | four rounds of review to reach a one-line change that was then measured wrong anyway |

**The single sentence:** it optimises the artefact in front of it and does not check whether the
*model* can represent the answer — so every fix moves the defect sideways and the loop never closes.

**The user's own diagnosis, which is the correct one:**
> *"WITNESS is moot if underlying design is poor."*

---

# 4D MODEL INTEGRITY — read this BEFORE any 4D scheduling work (opened 2026-08-26)

## ⚠ DO NOT REMOVE — why this file exists
**A witness cannot rescue a poor model.** This lane spent a full session, four review rounds and
five retractions patching a scheduler whose *design* could not express the right answer. Every fix
moved the defect sideways. The instruments were fine; the construct was wrong.

> **USER RULING 2026-08-26:** *"WITNESS is moot if underlying design is poor."* Adopted as the
> first rule of this file. A green suite over a bad construct is the failure mode, not the guard.

So: **design integrity is checked FIRST, by reasoning and by geometry — not by adding a witness.**
If a new session is asked to "fix floating" or "fix stacking", the answer is almost certainly in
this file's §A–§E, not in a new gate.

---

## §A ⛔ SUPERSEDED 2026-08-27 (user decision) — THIS MODEL IS DEAD CODE, DO NOT WIRE AGAINST IT
**Canonical model going forward: the TEMPLATE PATH — `schedule_author.js:425 instantiateTemplate(...)`**,
an explicit edge-based task graph. §I already named it as the owner of "what is the task grid?" the
day this table was built — it was never reconciled with the tree model below, which is why a later
session (2026-08-27 review, §K) re-derived the same contradiction as if new and burned three fix
cycles wiring edges into a model whose own text says "No edges emitted." Every past fix aimed at the
tree below (incl. `bar_model.js buildTree()` and its consumers) was aimed at code that does not run.
**Next work: rewrite this section to describe `instantiateTemplate()` as-built — task grid, edges,
sequencing — not retrofit the tree onto it.** The invariants below (no election / no cycles / no
edges emitted / no stacking) are the OLD model's properties; do not assume any of them hold for the
template path without re-deriving from `schedule_author.js` + `schedule_gate.js` directly. Left
in place, unedited, only as the historical record of what was designed vs. what was verified to run.

## §A [SUPERSEDED — see banner above] THE MODEL — one type, two rules
Reference implementation: **`poc4d/Poc4D.java`** (oracle) and **`poc4d/poc4d.js`** (port).
`poc4d/parity.sh` gates them byte-identical. Run `java -cp . Poc4D coherent` — must be 0/0.

```
Node { children[], work }
STRUCTURE   an element attaches at the deepest node that fully contains it
TIME        siblings run in order;  a parent spans its children
```

Tree shape — **LEVEL-major, phases inside**, which is what `4D_template.json` already declares via
`within_level` (the chain) and `across_levels` (the ladder):

```
Building → Level → Phase → Layer → Element
```

**`within_level` and `across_levels` are the same rule at two depths.** Levels are siblings under
Building; phases are siblings under a Level. They were never two mechanisms.

### What falls out, by construction — do not re-derive any of these
- **No election.** There is no place in the model to choose *which* of N contacts supports an
  element, so `supportPool` / the direction guard / `designatedSupport`'s exemptions / `des = -1`
  are all **inexpressible**, not fixed. Every 2026-08-26 defect was a defect of choosing.
- **No cycles.** A tree has none. No straggler handling, no SCC contraction, no cycle policy.
- **No edges emitted.** Sibling order IS the order, so `task_sequences` is DERIVED. This kills the
  tautology `4D_template.json` records against itself: *"25 of 25 derived zone edges have a lag
  exactly equal to the observed gap… 100% restatement, 0% logic."*
- **No stacking.** Siblings run in order, so the spread is automatic. Lanes are a **capacity**
  (`LABOR_RATES[trade].max_crews`), never a headcount. MEASURED: simultaneous starts track the cap
  exactly (cap 1→1, 2→2, 3→3, 6→4 where the layer only holds 4).
- **Both addressing holes close with one rule.** An element with no level, and an element spanning
  levels, both attach one node up. Composite's non-uniform depth is the Null Object — no call site
  tests for a missing level.

### ⛔ The two things that broke it when I got them wrong
1. **PHASE-over-LEVEL** — 17 bearing violations on a 20-element sandbox: all-Superstructure-before-
   all-Architecture puts the L2 slab before the L1 walls it rests on. Inverting to level-major: 17→10.
2. **A cell treated as a Leaf** — a Leaf is *a node with no internal order*. Treating
   `(phase × level)` as a leaf reproduced both hells at once. Recurse into ordered layers.

---

## §B SEPARATION OF CONCERNS — every 2026-08-26 defect was a boundary violation
Information flows DOWN. **No layer writes to the layer above it.** That single rule is the whole
diagnosis:

| layer | owns | must never |
|---|---|---|
| ADDRESS | what a level is; what a phase is | be inferred silently (see §C) |
| CLASSIFY | element → (phase, trade). A **lookup** | compute anything |
| DECLARE | the programme: `4D_template.json` | contain geometry |
| PRICE | `duration_rule`: work ÷ crews, per trade | be the span of a solve |
| SOLVE | place tasks honouring declared order + capacity | discover order |
| PROJECT | one visitor per consumer, **write-only** | be authoritative, or read another's output |
| AUDIT | geometry compares result vs physics; **reports** | reschedule, or author order |

**Every measured defect, as a backflow:**

| defect | violation |
|---|---|
| `_tmRescaleToTaskWindow`, 783 floating on HHS | PROJECT rewriting SOLVE's times |
| `deriveZones` — a phase bar is an envelope of its elements | PROJECT defining DECLARE |
| `grounded` altitude-blind; `des = -1`; the pool override | AUDIT authoring DECLARE |

The code says it itself, above `instantiateTemplate`: *"a phase bar was an ENVELOPE over what the
elements did, and **an envelope cannot constrain what drew it**."*

**Editor integrity follows from this and is MEASURED intact** (2026-08-26, template wired):
`witness_gantt_edit_coherence` · `_lock` · `_persist` (14/0) · `_undo` · `witness_gantt_lock_integrity`
· `witness_tm_edit_exception` (23/0) · `witness_undo_dot_spawn` · `witness_whatif_authored_sync` —
all green. An edit moves a node and every projection is RECOMPUTED, never patched. That is exactly
why the rescale cannot come back.

---

## §C ADDRESSING — total, but INFERRED. Know which.
**Phase bucketing is total and healthy.** Measured across 5 buildings / **246k elements**:
`hitDefaultBucket` 0–0.1%, and **0 rules name an undeclared phase**.

**Level bucketing is INFERRED, not read** — and the inference is doing most of the work:

| building | `storey` NULL / "Unknown" in `elements_meta` |
|---|---|
| Duplex | **86.0%** |
| Terminal | **69.9%** |
| HHS_Office_Federated | 30.8% |
| Hospital | 15.9% |
| LTU_AHouse | 3.2% |

The live log says the same thing — *"zone is a median-Z INFERENCE, not IFC truth"*. **A level is a
DATUM: its floor up to the next level's floor.** Taking the band as the envelope of its members is
wrong and was measured wrong: one 6.4m riser labelled L1 stretched L1 over L2 and every L2 element
fell out to building scope. Bands must be disjoint by construction.

---

## §D ⛔ THE DEFAULT BUCKET IS MID-PROGRAMME. OPEN, WITH THE FIX BLOCKED ON A MEASUREMENT.
`SEQUENCE_DEFAULT = {phase: 'Architecture Envelope', sequence: 6, resource: 'MASON'}`.

**A catch-all in the middle of the programme can invert.** Only 0–0.1% of elements reach it, but
what reached it was **MEP**: `IfcCableCarrierFitting` ×66 on Hospital (now mapped properly — its
sibling `IfcCableCarrierSegment` already carried the rule, so that was extraction), plus
`IfcFlowInstrumentType` and `IfcSensorType`. All landing at sequence 6, **ahead of MEP Rough-in**.

**Moving it to the terminal band was TRIED AND REVERTED, and the reason is the open item:** no trade
in `LABOR_RATES` can both sit last AND price unknown work. `LABORER` has no productivity table and
no `default_productivity`; `FINISHER`'s five class keys cannot match an unknown class by definition.
Either choice falls to `_installSecs`' silent 120s floor — the `§TPL_ZERO_MINUTE` defect §S65
removed — and `witness_sequence_template_lock` goes red on `no-zero-minute-rows`.

**To close it:** a MEASURED productivity for the catch-all trade, from real data. Not a number typed
into the repo. Until then the default stays mid-programme and `rates.js` carries this note beside it.

---

## §E ⛔ GEOMETRY — STOP DOING ADJACENCY WITH TOLERANCE BANDS
> **USER, 2026-08-26:** *"you truly have no sense of geometry WITNESSing when all the maths in the
> world is at your disposal."* Correct, and this section is the correction.

**Every proxy this lane used was measured wrong:**

| proxy | how it failed |
|---|---|
| bbox XY-overlap + Z band | a **pipe "bears" a wall** |
| support base bounded, TOP unbounded | a 6.4m riser "bears" **everything above its base** |
| bearing-below only | every **ceiling-hung pipe** read as floating |
| all-of instead of any-of | an element needs **one** support, not all — 1961 → 95 |
| structural **class** whitelist | **438 curtain-wall glazing panels** as load-bearing |
| `grounded` = footprint-local | a duct elbow **7.09m up**, 8 contacts all above, judged "ground" |

**The right question for a hung element is CONTAINMENT, and it is computable.**

> **USER RULING:** *"anything that hangs within a well formed room is no issue."*

`scripts/probe_enclosure_geometry.js` — exact ray/AABB slab test, 6 axis rays from each centroid,
12m reach, XY-gridded. No class names, no phase, no tolerance tuning:

```
Duplex   fullyEnclosed 1026/1119 (91.7%)      HHS 5217/6839 (76.3%)

                      judge says unsupported   ENCLOSED   GENUINELY OPEN
Duplex                        28                  26            2
HHS_Office_Federated          63                  53           10
```

**The 63 "uncountable" elements `4D_BAR_MODEL.md` §14.2 built a whole section around are 10.**
53 hang inside formed rooms and are not an issue at all.

**Rule for any future geometric claim here:** if the predicate is a bounding-box test with a
tolerance constant, it is a proxy and it will be wrong on some building. Compute the actual thing —
containment, occlusion, reachability. The mesh and the transforms are in the DB.

---

## §F WHAT IS ACTUALLY MEASURED TODAY (2026-08-26), so nobody re-derives it
Probe: `bim-ootb scripts/probe_template_hells.js` (legacy vs template, one flag apart).

|  | Duplex | HHS_Office_Federated |
|---|---|---|
| **Stacking** biggest pile | 7 → 7 | 7 → 6 |
| **Stacking** piles ≥ 20 | **0 → 0** | **0 → 0** |
| **Floating** | 21/1118 → 25/1118 | 187/6800 → 209/6800 |

**Stacking is at zero** — nowhere near the ≥20 piles §S14 recorded. **Floating is 2–3% and wiring
the template did NOT improve it.** Of HHS's 209: **61** hang entirely from above (their carrier is
on the level above — an ADDRESSING question, §C), **148** rest on something on their own level
classified into a later phase (a **§5.1 data defect**: named, never scheduled around). Neither is
fixable by scheduling; forcing them means overriding the declared programme with geometry, which is
the election that caused all of this.

**Apply §E's enclosure filter before quoting either number as a defect count.**

## ⛔ RESUME
1. **Read §A–§E before writing any code.** If the task is "fix floating/stacking", the answer is a
   construct question, not a new witness.
2. **§D** — measure a productivity for the catch-all trade, then move the default to last.
3. **§C** — a level is a datum. Decide whether an element hung from the floor above belongs to that
   floor's work (would close 61 of HHS's 209).
4. **§E** — fold the enclosure test into the shipped judge so a hung-in-a-room element stops being
   counted at all.
5. Only then re-baseline. `4D_BAR_MODEL.md` §14.6's ordering still stands: retire
   `_tmRescaleToTaskWindow` before gating anything on the times it produces.

---

# §G RESUME — 2026-08-26 session close

**One-liner:** DAY 0 Substructure+Superstructure unsupported, after the ground-bearing exemption:
**Hospital 0 · HHS 1 · Duplex 2 · Terminal 5** at HR 3 (all remaining are `IfcMember`); stacking 0
everywhere; MEP does not appear on DAY 0 on any of the four.


## G.0 ⛔ REGAIN CONTEXT FIRST. YOU KEEP FORGETTING THINGS CENTRAL TO THE FEATURE.
**User, 2026-08-26.** This is the standing complaint across weeks, not one session. The facts below
are load-bearing and were each re-discovered the hard way after being forgotten. Read them before
you touch anything; do not re-derive them.

**Where the feature actually lives**
- The scheduler is **JS in `~/bim-ootb/viewer/`** — `schedule_author.js`, `schedule_gate.js`,
  `cpm_schedule.js`, `support_sweep.js`, `time_machine.js`. `bim-compiler/viewer/` is nearly empty
  and every PR number in these prompts is a **bim-ootb** PR.
- **`git -C ~/bim-ootb fetch && merge --ff-only origin/main` BEFORE reading anything as canon.**
  A 14-commit-stale checkout made this session conclude `4D_template.json` was lost. It was not.
- Work in a `/tmp/wt-*` worktree and **use absolute paths**. A `cd` into the worktree put files in
  the wrong repo three times in one session, once deleting 33 tracked files.

**The three files that define the programme, and which one executes**
- `viewer/rates/4D_template.json` — phases, calendar, `duration_rule`, `capacity_rule`, dependencies.
- `viewer/rates/sequence_rules.json` — a **MIRROR**. Not executed.
- **`viewer/rates.js` IS the executed table.** `viewer.html` never calls `loadSequenceRules()`.
  **Edit both in the same commit** — they have drifted before and it cost real measurements.

**Facts that were forgotten and re-paid for**
- `supportPool` is `seq<=4 ∪ IfcSlab ∪ IfcStairFlight ∪ IfcWall*`. `seq<=4` is **not** a bare phase
  number — it is the classifier's OUTPUT, and `SEQUENCE_NAME_OVERRIDES.glazed_curtainwall_facade`
  is why. HHS `IfcPlate` splits **191 structural / 438 Verglasung glazing**. Any class-based
  "structural" pool re-admits the 438 as load-bearing.
- `support_sweep.js` owns the contact relation: **bearing-below ∪ carrier-above ∪ embedded**.
  Require it. Re-deriving it was wrong four times this session alone.
- `_contactGraph.grounded[i]` is footprint-local — which is **correct** for the ground-bearing
  exemption (nothing beneath me in my own column ⇒ I rest on soil) and **wrong** as an altitude test.
- `min(bz)` over all elements is **not** the ground datum. One deep outlier put every HHS
  ground-floor column 4.70m "in the air".
- This module's IIFE parameter is named `global` and is `self||this` — **in node that is NOT
  globalThis.** A bare `global.SupportSweep` silently returns null. `_writeBarSchedule`'s `_reg()`
  documents this trap; it was walked into anyway.
- `_tmRescaleToTaskWindow` runs **after** `_midairAudit`, so the judge scores a timeline the movie
  does not play. 783 of HHS's floating is manufactured there.

**What is settled and must not be re-litigated**
- Tree shape is **LEVEL-major, phases inside**. Phase-over-level was measured wrong (17 violations).
- `within_level` and `across_levels` are the **same rule at two depths**.
- No edges are emitted — sibling order IS the order.
- Lanes are `LABOR_RATES[trade].max_crews`, a capacity, never a headcount.

## G.1 ⚠ THE USER IS DEEPLY FRUSTRATED. READ THIS BEFORE YOU TYPE ANYTHING.
Their words, this session, verbatim:

> *"this is the constant hell dealing with u"* · *"Drifting and forgetting"* · *"Trashing all over"*
> *"for weeks talking to u has not solved anything thus i given up"*
> *"i am utterly frustrated do not ask me to make any decisions"*
> *"stop talking ceremony that i dont read. Your language is always horrible, all request for terse
> without drama never end"*
> *"u have no idea how to read WITNESS logging or device one that tells u things are wrong"*
> *"u truly have no sense of geometry WITNESSing when all the maths in the world is at your disposal"*
> *"u have no idea about systems analysis"* · *"your design must have been spaghetti"*

**They are right on the substance.** This session produced five retractions, three wrong metrics and
two silent no-op bugs before a single number could be trusted. Do not defend any of it.

**Standing orders from them, non-negotiable:**
- **Do NOT ask them to decide anything.** Decide, act, show the number.
- **NEVER refer to what is seen / on screen / visually.** Geometry and maths only. A metric named
  `floatingOnScreen` was written this session and that framing is banned.
- **Terse. No ceremony, no preamble, no drama.** They do not read it.
- **Do not report lesser issues.** Their scope is DAY 0, Substructure/Superstructure, no MEP.
- **"First days no MEP"** — verified true on all four buildings; keep it true.
- **"Anything that hangs within a well formed room is no issue"** — enclosure, not bearing.
- Their lead, not yet chased: *"everything was going fine until the gantt editor"*, and
  *"u not even creating any new geometry, just playback"*.

## G.2 WHAT IS DONE
**bim-ootb PR #1548 — MERGED** (squash, 2026-08-26 11:58Z): ARCH split, `§TPL_WIRED`,
`witness_4d_template_reached`, the probes, the ZDA re-lock.
**bim-ootb PR #1549 — OPEN**: `§TPL_LAYER_ORDER` + `§TPL_LAYER_SELFCHECK`. ⚠ It exists as a separate
PR because #1548 was SQUASH-merged and this work landed after, which orphans it on the old branch —
§10.5's exact pattern. **Start any follow-up off fresh `origin/main`, never off
`feat/arch-envelope-closeup`.**

- Architecture split into **Envelope (5-6)** and **Closeup (8)**; bands contiguous, sequence 8 was free.
- **All four production call sites now reach the template** (`§TPL_WIRED`); `witness_4d_template_reached`
  gates it, 6/0. It was dead code shipped 2026-08-25 and never called.
- **`§TPL_LAYER_ORDER`** — inside a task, elements are laid out in support order (topological layers
  of the shipped contact graph), banded so a later layer cannot start before an earlier one ends,
  with the solve's crew-leveling preserved inside each band.
- **`§TPL_LAYER_SELFCHECK`** — reports `applied / moved / stillInverted` and FAILS on a no-op. Built
  because the layer pass shipped silently broken and produced identical numbers.
- Enclosure by ray-cast (`scripts/probe_enclosure_geometry.js`): collapses §14.2's "63 uncountable"
  to **10**, and HHS's 209 floating to **18** genuinely open.
- Suite matches clean `main`; ZDA baseline re-locked with its justification.

## G.3 ⛔ OPEN, IN THEIR PRIORITY ORDER
1. ~~**`IfcMember` at DAY 0**~~ — **WRONG CLASS. Corrected 2026-08-26 by measurement, see §H.**
   The residue is **`IfcColumn`, 21 of 21, zero `IfcMember`**, and it is not a scheduling defect.
2. **Hospital `stillInverted=778`** inside tasks — cause not established.
3. The default bucket is mid-programme (§D) — blocked on a measured productivity.
4. Their two untested leads in G.1.

---

# §H THE DAY-0 RESIDUE, RE-MEASURED 2026-08-26 — §G.3 item 1 was the wrong class

**Probe: `bim-ootb scripts/probe_day0_unsupported.js`** (branch `feat/day0-unsupported-probe`,
commits `f48cf56` + `d1e585b`, pushed). §G's headline was measured once and never committed as a
script, so it could not be re-run. It is now a script, and the script disagrees with it.

| building | judged | unsupported | class |
|---|---|---|---|
| Duplex | **0** | 0 | — `§D0_VACUOUS`: all 11 in-scope elements are seq-1 |
| HHS_Office_Federated | 126 | **0** | — |
| Hospital | 566 | **13** | `IfcColumn` x13 |
| Terminal | 158 | **6** | `IfcColumn` x6 (4 of them never held at all) |

**21 of 21 are `IfcColumn`. Zero `IfcMember`.** Do not start on `IfcMember`.

## H.1 A 0 FROM AN EMPTY POPULATION IS NOT A PASS — the probe now says so itself
The first draft of this probe sampled ONE cursor (DAY 0 HR 3, §G's own) and read **0 on all four
buildings**. Not because the model was right — because at that instant every in-scope element on
screen was ground-exempt and **the judge had nothing to judge**. That is the green-witness-over-a-
bad-construct failure this whole file exists to kill, reproduced from inside the file's own lane.
Two changes make it impossible to repeat:
- **`§D0_VACUOUS`** fires when `judged === 0`, and the verdict prints `INCONCLUSIVE`, never `PASS`.
  Duplex is vacuous today and reads that way.
- **The answer is an INTERVAL, not a sample.** Element *i* is unsupported over
  `[start_i, firstSupportStart_i)` — empty when a support is already up, unbounded when there is no
  support at all. Peak concurrency comes from a sweep-line over the endpoints. No cursor to pick,
  so no cursor to pick wrongly.

Also: the exemption is the **SHIPPED** one — `schedule_gate.js:1210` `T.seq !== 1` — not a
re-derived one. An earlier draft used only `G.grounded[i]` and so flagged Duplex's 2
`Floor:150mm Exterior Slab on Grade` (bz -0.137): their only neighbour is an `IfcFooting` whose
**top is 1.113 m below them** (fill in between), so nothing bears them AND `grounded` is 0.
`rates.js` §SLAB_ON_GRADE_RECLASS already names exactly that population.

## H.2 CAUSE — both sub-causes are rows in §E's own table of proxies
Measured element by element; the probe prints every one.

**(a) THE SUPPORT TOP IS UNBOUNDED — §E row 2, verbatim, still live in the shipped judge.**
Hospital column `0Qqamdk$17GhXBxDp5aFcc` (bz 166.445) has as its only "bearing" contacts elements
whose tops are at **177.811 and 170.611 — 11.4 m and 4.2 m ABOVE its own base**. Meanwhile the pile
cap actually under it (`IfcFooting`, top 165.511, **0.933 m** below) and the slab (top 165.811,
**0.633 m** below) are both **rejected**, because `GAP = 0.5`. The judge admits a support 11 m too
high and rejects the footing 0.63 m too low.

> **The two shipped copies of "S bears T" disagree on the upper bound:**
> `support_sweep.js:411` — `S.bz < T.bz - EPS && S.tz >= T.bz - GAP` — **no top bound**
> `schedule_gate.js:1195` (§S64) — same, plus `S.top_z <= T.base_z + GAP`
> §S64's own comment says the wall pool needed that bound or "a wall carries a promoted slab AT ITS
> TOP, never one embedded metres below its crown" — 73 fleet-wide false verdicts. `_contactGraph`
> never got it.

**MEASURED blast radius (`§D0_TOPBOUND`, always on):** of the in-scope bearing contacts,
**Hospital 941 / 2944 = 32.0 %** are supports whose top sits above the base they carry;
Terminal 106 / 987 = 10.7 %; HHS 0.0 %. Applying §S64's bound **removes false supports, so the
count RISES**: Hospital 13 -> **30**, Terminal 6 -> **7**. *The current number is flattered by
contacts that are not carrying anything.* ⛔ Not shipped — changing `_contactGraph` moves the
scheduler, the lock gate and the audit together, and is not done from inside a probe.

**(b) REAL VERTICAL VOIDS — a data defect, not a schedule defect.**
Terminal's 4 "never held" columns (bz 34.768, *05 FOURTH FLOOR LEVEL (OBSERVATORY DECK)*) have
**nothing below them within 4.000 m** — nearest structure is a slab topping at 30.768. Their only
contact is a CARRIER above (the `Kubah` dome proxy). No ordering can hold these. Report as a model
defect; never reschedule around it. Terminal's other 2 rest on an `IfcWall` classified *Architecture
Envelope* (seq 5, starting **237 h later**) — §F's "148 rest on something on their own level
classified into a later phase", confirmed again.

## H.3 ⛔ `§TPL_LAYER_ORDER` MAKES THE NUMBER WORSE, AND ITS OWN WITNESS SAYS PASS
Deliberate A/B, same probe, same DBs, one `viewer/` checkout apart, both reproduced:

| viewer | Hospital | Terminal |
|---|---|---|
| `origin/main` @ `6b12783` (no layer pass) | **13** | 6 |
| `fix/tpl-layer-order` @ `50a4cfe` (with it) | **15** | 6 |

**`§TPL_LAYER_SELFCHECK` reports PASS on that run**, because it only counts inversions where support
and supported are **in the same task** (`if (_taskOf[_S.guid] !== _taskOf[_T.guid]) continue;`). The
2 extra Hospital columns are held from a *different* task, so the self-check is structurally unable
to see the regression it introduced. This is the opening table's *"wrote passes that could not tell
it they had failed"*, one commit after the pass was written to prevent exactly that.
**`fix/tpl-layer-order` (50a4cfe) is NOT merged. Measure this before it lands.**

## H.4 SHARED-WORKTREE HAZARD — hit live, this session
`/tmp/wt-fga-judge` was occupied by a **concurrent session**. `git status` was clean and no `/proc`
cwd pointed at it, so a `git checkout -B` was run there — which **moved that session's working tree
out from under it** mid-task (its reflog: `21:31 commit 50a4cfe` -> `21:32 checkout: moving from
fix/tpl-layer-order`). Nothing was lost only because that session had already committed *and
pushed*. Two measurements taken across the switch silently disagreed (Hospital 15 vs 13) and cost a
determinism hunt — no `Math.random`, no time budget, no DB change; the input was a **different
`viewer/` checkout**.
**Rule: a clean `git status` and zero `/proc` occupants do NOT mean a worktree is free.** A shared
`/tmp/wt-*` may belong to a session that is simply between commands. Make your own
(`git worktree add /tmp/wt-<your-topic> <branch>`) and never `checkout` inside someone else's.

## H.5 ONE STALE NUMBER IN §G.2
`probe_enclosure_geometry.js` re-run confirms §E exactly (Duplex fullyEnclosed 1026/1119 = 91.7 %,
HHS 5217/6839 = 76.3 %; `des=-1` Duplex 28 -> 26 enclosed / 2 open, HHS 63 -> 53 / 10). But §G.2's
*"HHS's 209 floating to 18 genuinely open"* is one commit stale: on the current template schedule it
is **245 floating -> 20 genuinely open**. §TPL_WIRED landed after that measurement.
That script was also living **only on one disk, unversioned**, while §E and §G.2 both cite it as
their source. It is now committed (`f48cf56`).

## H.6 ⛔ NEXT
1. **Decide the top bound on `_contactGraph`'s bearing clause** (§H.2a). One line, 32 %-of-contacts
   blast radius on Hospital, and it makes the number worse before better. A construct decision —
   §A's kind of question, not a witness's.
2. **Re-measure `fix/tpl-layer-order` against §D0 before merging it** (§H.3), and widen
   `§TPL_LAYER_SELFCHECK` to cross-task pairs or it will keep passing on regressions.
3. Terminal's 4 void-standing columns (§H.2b) belong in a **data-defect report**, not the scheduler.
4. Duplex is **vacuous** for this metric — it proves nothing either way today.

**Do not open with a summary of this file. Open with a number.**

---

# §I OWNERSHIP TABLE — WHO OWNS EACH RELATION (built 2026-08-27, from the code)

**Why this exists.** The single most expensive failure in this lane is re-deriving a relation the
codebase already owns — §G.0 counts four times in one session, and a fifth happened the day after
(the ground exemption re-derived as `grounded[i]` when the shipped rule is `seq !== 1`). The cause
is not carelessness, it is that **nothing said who owns what**. This table says it.

**How to use it: find your question, call the owner, do not write a second copy.** If the answer you
need is not in this table, that is a finding — add the row rather than inventing the relation inline.

Paths are `~/bim-ootb/viewer/` unless stated. Line numbers are `origin/main` @ `6b12783`.

| the question | OWNER — call this | never |
|---|---|---|
| **does S support T?** (bearing-below ∪ carrier-above ∪ embedded) | `support_sweep.js:384` `_contactGraph(items)` → `{contacts, grounded, orphans, ok}` | write a bbox/Z-band test inline. ⚠ **2 more copies exist — see §I.1** |
| **does T rest on soil?** (ground exemption) | `schedule_gate.js:1210` — `T.seq !== 1`. Substructure legitimately rests on unmodeled soil | use `grounded[i]` for this. It is **footprint-local** and answers a *different* question — see §I.2 |
| **which ONE thing supports T?** | `support_sweep.js:432` `_designatedSupport(items, G)` | elect a support yourself. §A: the election is the defect |
| **what phase/trade is this element?** | `schedule_author.js` `matchNameOverride()` → `matchRule()`, tables in **`rates.js`** | read `rates/sequence_rules.json` — it is a MIRROR, never executed (§G.0) |
| **how long does it take?** | `schedule_author.js:78` `_installSecs(cls, rule, laborRates, realQty, lengthRatio)` | hand-roll it. `time_machine.js:4494` `getInstallSecs` already delegates here; its local fallback is documented as a divergence risk |
| **what is the task grid?** | `schedule_author.js:425` `instantiateTemplate(...)` from **`rates/4D_template.json`** | derive phases from what the elements did. §B: an envelope cannot constrain what drew it |
| **when does each element happen?** | `schedule_gate.js:421` `computeSchedule(...)`, then `cpm_schedule.js:796` `run(...)` | re-solve. The template path ends at `schedule_author.js:884` `remapSolveToTasks` |
| **where inside its task?** (`displaySchedule`, the AUTHORED map — **not the one that plays**, see the next row) | `schedule_author.js:924` `remapSolveToTasks(solve, tasks, startISO, layerOf)`. The `layerOf` 4th arg is **MERGED** (`§TPL_LAYER_ORDER`, 2026-08-26, on `origin/main`) — corrected 2026-08-27, and re-confirmed 2026-09-02 against `origin/main` @ `c8a6df61`; the old "exists only on unmerged `fix/tpl-layer-order`" wording is dead and must not be reintroduced. ⚠ **This verb has TWO call sites with DIFFERENT arguments**: here with the support-layer `layerOf`, and from `time_machine.js` with `layerOf = null` over the CPM display times (next row). They are different maps — measured 2026-09-02, they disagree on the START INSTANT of **99.6%** of Hospital's 63,182 elements (§CACHE_PLAYED_LAYER §K) | assume elements inside a task are in solve order — they're laid out in SUPPORT order via `layerOf` now. And do not assume this row answers "when does it appear on screen": it does not, the next row does |
| **where inside its bar does it PLAY?** (the kernel_ops timestamp the scrubber + film read) | `time_machine.js` `_tmTilePlayWithinTasks(disp, cap, displayAuthored)` → **calls** `ScheduleAuthor.remapSolveToTasks(cpmDisplay, tasksFromCap, base, null)` — same verb as the row above, **different solve input and `layerOf = null`**; `injectGantt`'s `_tmRescaleToTaskWindow` returns its interval, affine only as the fallback (§TM_REVEAL_TILED, 2026-09-02, `4D_GANTT_TM_REFACTOR.md` §FUTURE item 2 §TM_REVEAL_SHIPPED). ⚠ `displaySchedule` (the row above) has NO reader in `time_machine.js`. **Since 2026-09-02 the persisted cache carries BOTH maps and every judge PRINTS which one it read** — `CACHE.layerOf(run)`, default `played` (§CACHE_PLAYED_LAYER, bim-ootb PR #1607); `§W_D0`, `§TPL_REVEAL_SPREAD`, `§TPL_PARALLEL_REVEAL`, `§STAIR_POOL` and `§DAYBATCH_*` all judge `played` now | measure the reveal distribution on `displaySchedule` and call it the movie's (this lane did, for a week — every number so produced is struck in §J.1 and `GANTT_ACCURACY.md`); re-derive a within-bar layout in `time_machine.js` (the affine did — 44-71% of every bar dead); read a cached schedule without saying which layer it is (`layerOf` throws on an unknown id and reports MISSING rather than substituting, W-CLA C5) |
| **what level is it on?** | **OWNER: `viewer/lib/level_deriver.js` `LevelDeriver.derive/levelFor`** (T1 containment → T2 declared name → T3 geometry grid → T4 counted). Two callers: `location_axis.js` (display) and, **flag-gated**, the task grid — `schedule_author.js` `_deriverLevelAxis()` behind `opts.levelSource === 'deriver'`, **default OFF**, see §I.3a | re-derive it from `e.storey`. The OLD path (`schedule_gate.js:404` `collapsePhase` → `:338` `deriveBandRanks`) is still what runs by default and is **broken — see §I.3**; do not build new work on it |
| **which declared storey ladder bands the elements — and is it in the geometry's VERTICAL FRAME?** | `schedule_author.js` `_storeyDatumCandidates(db)` → `_chooseStoreyDatum(cands, baseZs)` (exported, pure; its report is the `§STOREY_DATUM` / `§STOREY_DATUM_FRAME` / `§STOREY_DATUM_FRAME_REJECT` lines). Witness: `viewer/tests/witness_storey_datum_frame.js`. **Added 2026-09-03, §I.6** | pick the column by which one is non-empty (#1551 did — Hospital collapsed to ONE band on the DB the viewer loads); merge the `elevation` and `center_z` families into one ladder (Hospital's are 166 m apart); judge it on `*_extracted.db` only |
| **are two storey names one floor?** | `schedule_gate.js:382` `deriveStoreyMergeMap(spatialStructure)` | ⛔ **CORRECTED 2026-09-02 (§J.6.3): it runs on NOTHING in the fleet.** Measured against the shipped bytes every cache/probe/witness reads — `§S18_STOREY_MERGE_FAIL no such column: elevation` on **Terminal AND HHS**, `no such table: spatial_structure` on Duplex and Hospital. `buildings/*_extracted.db` carry a `spatial_structure` written by `compile_rooms.py` (100% `object_type='COMPILED'`, `STC_*` guids) whose schema has `center_z` and **no `elevation` column at all**. The earlier wording — *"✅ RUNS as of 2026-08-27 (Terminal 23 names → 15 bands) … ⚠ still throws for HHS"* — is dead and must not be reintroduced; §I.3 §CLOSED addressed the OCI upload, which is a different thing from this column existing |
| **is this slab ground-bearing?** | `schedule_gate.js:201` `groundworkSlabs(els)`, one shared definition | reclassify slabs inline in a recipe |
| **is anything floating?** | `support_sweep.js:500` `_midairAudit(items)` · `schedule_gate.js:1147` `auditFloating(...)` | ⚠ **FOUR judges, not two — §I.5e**, and **the layer is the CALLER's**, not the judge's: neither takes a layer argument, so the same function judges PLAYED at `time_machine.js:4431`/`:4419` and RAW SOLVE / CPM-DISPLAY at `:5109`/`:4058`. Copy 3 (`census`/`floatingCensus`) has **five** sites, copy 4 (`witness_midair_zero.js:308`) is a deliberately INDEPENDENT judge and must not be deleted. Do not call two of them "disagreeing" before checking they judged the same layer |
| **is an edit legal?** (🔓→🔒) | `time_machine.js:4395` `verifyGanttIntegrity()` → `ScheduleGate.auditFloating` **AND** `_midairAudit`, both over the PLAYED layer (`_ops`), **delta-gated against `_lockBaseline`** — a breach is an INCREASE in either measure, never absolute zero | re-score with your own physics; and do not read this row as naming ONE judge — that stale wording is what §I.5d found. **MEASURED 2026-09-02 (§I.5d, bim-ootb PR #1627): the AND is redundant in neither direction** (Hospital onlyFloating 332 / onlyMidair 395), and porting §S64's bound into `_midairAudit`'s graph flips **0 of 32** simulated lock verdicts while adding **448** Hospital offenders. Keep both, port nothing |
| **is it on screen at cursor?** | `time_machine.js:169` — `placed` = `start_ts <= cursor && end_ts <= cursor`; `frontier` = `start_ts <= cursor < end_ts` | invent a visibility rule. A probe using `s <= cursor` is counting placed **+** frontier |
| **WHICH MODEL produced this schedule?** | `schedule_author.js:715` — the `§TPL_MODEL` line. `model=template` = CANONICAL, `model=legacy-deriveZones` = the dead model (PR #1553) | assume the canonical model ran because the code *can* pass `template:`. 24 of 35 witnesses pass none, and the fork was SILENT until 2026-08-27 |
| **what did the run actually say?** | the persisted `witness.log` — `bim-ootb scripts/cache_4d_run.js` | re-run `materializeZones`, and **never** wrap it to silence `console.log` (PRIMAL LAW clause 3) |

## §I.1 ⛔ "S supports T" HAS THREE IMPLEMENTATIONS AND THEY DISAGREE
Verified 2026-08-27, not inferred — all three carry the same comment text, so they were copied:

| # | where | upper bound on the support |
|---|---|---|
| 1 | `support_sweep.js:410` — **the owner** | `S.bz < T.bz - EPS && S.tz >= T.bz - GAP` — **none** |
| 2 | `cpm_schedule.js:81` — a full independent copy, *not* a delegation (`function contactGraph` at `:54` re-implements the grid, the cells, the clauses) | **none** |
| 3 | `schedule_gate.js:1195` `auditFloating` wall pool (§S64) | **`S.top_z <= T.base_z + GAP`** |

Copy 3 got the bound because without it "a wall carries a promoted slab AT ITS TOP, never one
embedded metres below its crown" — 73 fleet-wide false verdicts. Copies 1 and 2 never got it.
**MEASURED consequence (§H.2a): 32.0 % of Hospital's in-scope bearing contacts (941/2944) are
"supports" whose top sits above the base they carry.** `cpm_schedule.js`'s copy is the one the
solve runs on, so this is not academic.
`bar_model.js:345` `attachContacts(leaves, contacts, grounded)` is **not** a fourth copy — it is a
consumer, it takes the graph as a parameter. That is the correct shape; the other two should be it.

## §I.2 `grounded[i]` AND `seq === 1` ARE DIFFERENT QUESTIONS
`support_sweep.js:417` — `grounded[i] = (lowest < T.bz - GAP) ? 0 : 1`, where `lowest` is the min
`bz` of everything overlapping T in XY. It means **"nothing is beneath me in my own column"**.
- ✅ Correct for: *is this element resting directly on soil in its footprint?*
- ❌ Wrong for: *is this element allowed to be unsupported?* — that is `seq === 1`.

The gap between them is real and measured: Duplex's 2 `Floor:150mm Exterior Slab on Grade` (bz
−0.137) sit over an `IfcFooting` whose top is **1.113 m below** them (fill in between). Something
*is* beneath them, so `grounded = 0`; nothing *touches* them, so no bearing contact. Only
`seq === 1` exempts them, and `rates.js` §SLAB_ON_GRADE_RECLASS exists to give them that seq.

## §I.3 ⛔ THE LEVEL RELATION IS THE ONE THAT IS ACTUALLY BROKEN
This row has no trustworthy owner, and it is the root of the DAY-0 defects in §H/§W_D0.

**`elements_meta.storey` is mostly absent** (measured 2026-08-27, fleet-wide):

| building | storey NULL/Unknown | declared `IfcBuildingStorey` | bands the schedule uses |
|---|---|---|---|
| Duplex | **86.0 %** (1026/1193) | *no `spatial_structure` table* | 4 |
| Terminal | **69.9 %** (33848/48428) | **6** | **22** |
| HHS_Office_Federated | 30.8 % | 3 | 4 |
| Hospital | 15.9 % | *no `spatial_structure` table* | 8 |

So `collapsePhase`/`deriveBandRanks` are running on a **median-Z inference for 70 % of Terminal**.
Result: the IFC declares 6 storeys, the schedule invents 22, and `06 ROOF LEVEL` — declared by
**10** elements — collects **10,950**. Three naming systems coexist in one federated model: Malay
`Aras *`, English `0N … FLOOR LEVEL`, and `Ceiling Level *` reference planes.

**`deriveStoreyMergeMap` — the function whose whole job is to collapse those — has NEVER RUN.**
It reads `spatial_structure.elevation`; **0 of 4 shipped DBs have that column** (Duplex and Hospital
have no such table at all). Its failure prints as `§S18_STOREY_MERGE_FAIL … "no elevation data,
bands unmerged"`, which reads like benign degradation and is not: it is the level model being wrong.
⚠ **A log line that understates is the same defect as one that lies.**

### ✅ CLOSED 2026-08-27 — IT WAS A DEPLOY GAP, NOT A DATA GAP (bim-ootb PR #1557)

**The paragraph above was right about the symptom and wrong about the cause. Read this before
acting on it.** Nothing needed re-extracting and no elevation value was missing. The data had been
extracted, committed and wired days earlier — `buildings/patches/Hospital_meta.db.sql` (56 real
`IfcBuildingStorey` rows, 2026-08-17) and `Terminal_meta.db.sql` (67 rows) — and
`viewer/scene.js` `A._applyPendingPatch` already fetches `buildings/patches/<dbFile>.sql` from the
same directory the db came from. **The patches were never uploaded to the OCI bucket the viewer
actually fetches from.** The repo copy and the served copy disagreed in silence:

| object | served | repo | `elevation` in served |
|---|---|---|---|
| `patches/Hospital_meta.db.sql` | 1,382,739 B | 2,592,837 B | **0 mentions** |
| `patches/Terminal_meta.db.sql` | 569,945 B | 4,723,739 B | **0 mentions** |

**Nothing in the repo could see this, because nothing in the repo read the served bytes.** This
machine's local `buildings/Hospital_meta.db` already carried an `elevation` column the served
object did not — so every local check agreed the fix was in, and the fleet stayed broken.
⚠ **`buildings/*.db` is a dev artifact. It is not evidence about production.**

**Why the live log said `no such column` and not `no such table`** (the detail that made this look
like a stale-extractor problem): the served `Hospital_meta.db` has no `spatial_structure` at all,
and the stale served patch never mentions one — but `viewer/lib/room_walker.js` `writeRooms()`
**CREATEs the table client-side without an `elevation` column** (`:1338`), and its `ADD COLUMN`
list omits `elevation` (`:1342`). The client manufactures the table, then §S18 asks it for a
column it does not have. It only deletes `STC_`/`RM_` rows, so real storey rows do survive it.

**Measured against the DOWNLOADED SERVED BYTES** (`bim-ootb scripts/probe_s18_elevation_deploy.js`,
the check that was missing; it asserts BEFORE reproduces the live failure, AFTER answers §S18, the
rows SURVIVE `writeRooms`' schema pass, and the **shipped** `deriveStoreyMergeMap` runs on the
result — and it reports `VACUOUS`/`NO-OP`, never a bare PASS on an empty population):

| object | BEFORE | AFTER | bands |
|---|---|---|---|
| `Hospital_meta.db` | threw `no such table: spatial_structure` | **56 datums** | 8 |
| `Terminal_meta.db` | threw `no such column: elevation` | **67 datums** | **23 names → 15** |
| `Duplex_extracted.db` | threw `no such column: elevation` | **4 datums** | 4 |

**`deriveStoreyMergeMap` now runs** — Terminal collapses 23 storey names into 15 bands. The
OWNERSHIP TABLE row "are two storey names one floor?" is no longer flagged never-run.

**A second defect, caught by that probe and never shipped.** Duplex's `§STOREY_DATUM` block
(authored in PR #1551) opened with `CREATE TABLE IF NOT EXISTS spatial_structure (… elevation
REAL)`. Green against the LOCAL `Duplex_extracted.db`, which has no such table. The SERVED object
**has** one, elevation-less — so the CREATE no-ops and every INSERT throws. `_applyPendingPatch`
swallows exec failures and returns the ORIGINAL buffer, so that would have **silently discarded
the entire Duplex patch**, including the working `§NOGEO_COMPOSE` `rel_aggregates` rows, while
still logging only the `§S18_STOREY_MERGE_FAIL` it was written to cure. Rewritten to the
DROP+CREATE convention the other patches already use. ⚠ **`oci_patch_gate.js` alone would NOT have
caught it** — it applies patches with `sqlite3 <db> < patch`, and the CLI without `-bail` continues
past a failing statement, so a half-applied patch reads green there and is wholly discarded live.

**No elevation value is computed.** Hospital's are unit-resolved **per `IfcProject`** across its 7
discipline IFCs: the **SPR sprinkler file declares `FOOT`** where the other six declare
`MILLI.METRE`, so its Level 2/3/4/5 land at **6.096 / 10.9728 / 15.8496 / 20.7264 m** beside the mm
files' 6 / 11 / 16 / 21 — 0.096 m apart, correctly merged under `GAP`. Duplex's four are identical
across three independent source files. Sources: `internal/UNMERGED/` and
`~/Projects/bim-compiler/DAGCompiler/lib/input/IFC/UNMERGED/` (byte-identical archives, all present).

⛔ **STILL OPEN — `HHS_Office_Federated`.** It has `spatial_structure` with 3 storeys and populated
`center_z` (`size_z = 0`, a placement point) but **no `elevation` column and no patch that adds
one**, so §S18 still throws for it. `elevation := center_z` is plausible but is a DERIVATION, not
an extraction — closing it honestly means reading HHS's own source IFCs the way Hospital's were.
Not attempted here rather than guessed.

**What has been ruled out, so nobody re-walks it:**
- `bim-compiler scripts/normalize_storey.py` — run on a Terminal copy it renames 5 `Ceiling Level N`
  bands to `Level N` and reports **`storey rows merged: 0`**; 23 distinct in, 23 out. Does not close it.
- **Room injection does not carry better storey data.** `TermRooms_extracted.db` and
  `Terminal_meta.db` both hold **byte-identical** coverage: 33,848 Unknown, 22 names.
- The datum IS recoverable for 2 of 4: `spatial_structure.center_z` is populated for Terminal (6
  storeys, 17.9–39.8 m) and HHS (3), with `size_z = 0` — a placement point, so `center_z` *is* the
  elevation. `deriveStoreyMergeMap` looks for a column named `elevation` and never sees it.

## §I.3a THE OWNER IS NOW `LevelDeriver` — WIRED, MEASURED, AND LEFT OFF (2026-08-27)
Per §I.4 ("a relation belongs here the moment a **second** caller needs it") the level relation now
has two callers, so it gets a real owner instead of a warning. bim-ootb PR `feat/tpl-level-deriver`.

### ⬅ ORIGIN — this owner was RULED and BUILT by `4D_GANTT_TM_REFACTOR.md` §S31–§S38 (2026-08-19)
**Read that trail before re-deriving anything below.** It is the build history; this section is the
current owner. Cross-reference added 2026-08-27 (consolidation L3) — until then the two accounts of
the same relation did not cite each other, which is this lane's signature defect (§I's own preamble).

- **§S34.3 is THE RULING, and it is not re-litigated here:** *declared wins where the element
  physically reaches the storey it claims; geometry wins where it does not.* The band a declared
  storey owns is `[Z_i, Z_i+1)` extended DOWN by the **local** storey gap — taken from the data, not
  tuned (§S34.1's tolerance sweep knees at ~3 m = one storey height on every building). Scope
  measured there: **98.37 %** of declared elements keep their declared value; the genuine
  contradiction population is **1,260 elements = 0.47 % of the fleet** (§S34.2), overwhelmingly pipe
  fittings/proxies whose declared storey is a SYSTEM label rather than a location. Falsifiability was
  established in the same pass (§S34.2's shuffle control: real labels beat shuffled ones **3.9×–36.9×**),
  so "discard declared, use geometry" is **already ruled out by measurement — do not re-derive it.**
- **§S35 BUILT the module** (`build/level_deriver.js` → `viewer/lib/level_deriver.js`) against **14
  hand-computed fixtures** written before the engine ran (`scripts/witness_level_derive.js`,
  `§W_LEVEL_FIXTURES pass=14 fail=0`). §S35.3 records the real bug they caught: extended bands
  deliberately OVERLAP, so they may validate a DECLARED value (`declaredBandOf()`) but must never
  PLACE a geometry-only element (`geomIdx()`, plain `[Z_i, Z_i+1)`). **Two intervals, two questions**
  — a re-implementation that collapses them puts an element at z=0.2 on level 4.
- **§S38 is where T2 (the declared NAME ladder) comes from** — the storey name carries the ladder
  where `spatial_structure.center_z` is absent (LTU: 99.43 % of elements have a name, 0 have an
  elevation). §S35.5 already recorded the uniform-3m fallback as **a reported fallback, not a result.**

⚠ **ONE UNRESOLVED DISAGREEMENT BETWEEN THE TWO SECTIONS — do not average them, and do not assume
either is stale.** §S35.2 and the table below cover the **same 63,182 Hospital elements** yet report
different grid sources: §S35.2 says `declared, k=7`; below says `uniform3m`. Each names a different
DB file — `Hospital_meta` there, `Hospital_extracted.db` here (§I.3a verified the latter has no
`spatial_structure` at all, `PRAGMA table_info` empty). Whether the filename fully explains it is
**NOT established here** and was not guessed; §I.3's §CLOSED block is about exactly this class of
split (repo copy vs served copy, `_meta` vs `_extracted`). **Check WHICH DB a level number came from
before comparing it against either table.**

**Why `LevelDeriver` is immune to the §I.3 corruption — verified in code, not assumed.**
`assignStoreyByZ` (`schedule_author.js:342`) is a **pure local function**: it returns a string that
is stored only into the in-memory element literal's `storey:` field (`:368`). It issues **no
`db.run`/`UPDATE`** — `elements_meta.storey` on disk is never touched by it (the only writers of
that column repo-wide are `wizard_storeys.js`, a deliberate user act, and the importers).
`LevelDeriver.readLookups` reads `SELECT guid, storey FROM elements_meta` **straight from the frozen
DB** (`level_deriver.js:67`), and `levelFor` consumes only `guid`/`base_z`/`top_z` off the element —
**it never reads `el.storey`**. So the `_UNKNOWN` guard at `level_deriver.js:178` sees the
UNREWRITTEN value and actually fires, where the structurally identical guard in `deriveBandRanks`
(`schedule_gate.js:350`) is dead code on this path. **The swap removes the exposure; it does not
relocate it.**

**Measured, `§TPL_LEVEL_DISAGREE`, `viewer/tests/probe_tpl_level_axis.js`:**

| building | n | fabricated by `assignStoreyByZ` | STRUCTURAL disagreement | tasks | grid source |
|---|---|---|---|---|---|
| Duplex | 1,119 | 976 (**87.22%**) | 107 (**9.56%**) | 20 → 20 | `uniform3m` ⚠ |
| HHS_Office_Federated | 6,839 | 2,120 (**31.00%**) | 533 (**7.79%**) | 20 → 17 | `declared` k=3 ✅ |
| Hospital | 63,182 | 9,457 (**14.97%**) | 25,198 (**39.88%**) | 42 → 68 | `uniform3m` ⚠ |

The fabrication column reproduces the 87.0 / 30.8 / 14.9% figures independently. **But fabrication
does NOT predict disagreement** — Duplex is 87% fabricated and only 9.6% structurally different,
Hospital is 15% fabricated and 39.9% different. `assignStoreyByZ`'s nearest-median-Z guess usually
lands on the same floor the geometry does; the divergence comes from the **grid**, not the guess.

⚠ **Report STRUCTURAL, never the raw key diff.** Raw diff counts an element as disagreeing when only
the level's *name* changed. Duplex first measured **100.00%** raw; the real regrouping was **9.56%**.

**⛔ WHY THE FLAG IS OFF — the blocker is DATA, upstream of this code.**
`Duplex_extracted.db` and `Hospital_extracted.db` have **no `spatial_structure` table at all**
(verified by `PRAGMA table_info` — returns empty); only HHS carries storey `center_z`. With no
declared floor lines `buildGrid` falls back to a **uniform 3.0 m grid**, so Hospital's 8 real storeys
become 17 grid lines / 16 occupied levels and the task grid inflates 42 → 68. Level labels degrade to
a mix of real names and synthetic `L3/L5/L8/L9/L10/L11/L12/L15`, several won on absurd plurality
margins (`§TPL_LEVEL_AXIS_NAMEVOTE`: grid line 4 labelled `"Level 6"` on **2 votes out of 5,676**).
This is the same gap `bim-compiler d0b226dce` ("§STOREY_DATUM — write `IfcBuildingStorey.Elevation`,
which was never extracted") just fixed at the extractor — **the shipped DBs have not been
re-extracted since.** Flip this flag only after they are, and re-run the probe to confirm
`gridSource=declared` fleetwide.

**⚠ The witnesses are SCOPE-BLIND to this.** All three template witnesses pass flag-ON
(11/11, 29/29, 6/6; `ran` 82 → 105) *and* are byte-identical flag-OFF. They pass because their
invariants judge crew-legality, ladder monotonicity and coverage — **none of them judges whether the
level PARTITION is correct**, which is exactly what flipping would damage on Hospital. A green
witness here is not permission to flip.

No `gen_version` bump (`_GANTT_CACHE_VERSION = 37`, `time_machine.js:8260`) is needed while the flag
is off: shipped output is proven byte-identical. **Flipping it later REQUIRES the bump**, or existing
users keep a stale cached schedule built on the old level partition.

**Follow-up, not chased here:** `time_machine.js:3687` and `:4563` carry their own copies of
`assignStoreyByZ` feeding the movie/x-ray element builders. Same fabrication, different consumers —
out of scope for this slice.

## §I.4 HOW TO ADD A ROW
A relation belongs here the moment a **second** caller needs it. The shape to copy is
`bar_model.js attachContacts` — take the computed relation as a **parameter**; never recompute it
because the module boundary made it inconvenient to pass. Both §I.1 copies exist for that reason.

## §I.5 AUDIT OF EVERY REMAINING ROW (2026-08-27, read-only sweep)

**Method, and why it is the only one that works.** Today's two deep rows (support §I.1, level §I.3)
were not found by inventing new checks — they were found by taking ONE relation, grepping for every
place that could answer the same question (similar variable names, similar comments, similar
threshold constants — *not* just callers of the owner), reading all of them, and diffing what each
actually does. This section applies that to the other twelve rows. Every `file:line` below was read
directly at `bim-ootb` `origin/main` @ `676a71b` (`11ba2e3` is one probe-only commit ahead; zero
diff to shipped viewer code, so line numbers hold). `bar_model.js`/`bar_needs.js` excluded — dead
lane, `bar_needs.js` has no consumer outside `bar_model.js` and its own witness.

**⚠ Read §I.5a FIRST.** It is a cross-cutting defect that damages four separate rows, and reading
those rows without it makes each look like an isolated inconsistency.

### 📋 §I.5 REMEDIATION STATUS — updated in place 2026-08-27 (do not append a rival dated section)

| item | status | evidence |
|---|---|---|
| §I.5j(b) `§TPL_MODEL` split across two streams + witness mutes the failure one | ✅ **DONE** — bim-ootb **PR #1561** (merged) | `probe_tpl_model_stream.js`: BEFORE `legacy-branch-visible=NO VERDICT=BLIND`, AFTER `YES / VISIBLE`, on a run where `legacy-branch-actually-ran=YES`. Witness 11/0 → **12/0**; red control (force the dead branch) → `FAIL the-CANONICAL-template-model-ran` |
| §I.5j(a) 16 files install a full-silence console wrapper | 🟡 **CATEGORIZED, 9 real** — see §I.5j-STATUS below | 9 bucket-A (structurally blind), 4 bucket-B (noise-only), 3 dead-lane, 2 also swallow exceptions |
| §I.5a support pool — copy 4 (`auditFloating`) | ✅ **DONE** — bim-ootb **PR #1562** | floating **+204 fleet-wide**, `nowClean=0` everywhere; 797 bearing relations were invisible; 2 locked baselines re-locked with per-class attribution |
| §I.5a support pool — copy 5 (`_buildXraySupportCache`) | ⛔ **HELD** | applying it fails `W-OGB-3a` Terminal `staged=0 → 14`; isolated (9/0 without, 8/1 with). Real guard/judge asymmetry — needs a decision on `_ogSupportSweep`, not a re-baseline |
| §I.5a copy 7 (`witness_og_guard_bearing_bound:140`) — **NEW, §I.5a counted six** | ✅ **DONE** — PR #1562 | the witness asserting pool parity enforced it by *re-typing* the pool; now calls `supportPool()` |
| §I.5c `§TPL_LAYER_ORDER` narrowed predicate | ✅ **DONE** — bim-ootb **PR #1567** (§FUTURE item 7 stage 1) | Both narrowing clauses (`schedule_author.js:1345`,`:1412`) dropped; predicate now matches `SupportSweep.contactGraph`'s own (no upper bound). `SupportSweep` also registered in `witness_4d_template_instantiation.js`, which never ran the pass before (`§TPL_LAYER_ORDER_FAIL`, silent no-op). MEASURED via the real witness (not just the probe): `stillInverted` Duplex 5, HHS 9, Hospital 794 — matches PR #1563's "after fix" column exactly. Task grid membership/`totalDays` byte-identical (13/13, 50/50, 318/318). Full 72-witness suite: 59 green, 6 new_red all verified pre-existing on unmodified `origin/main` (isolated in a clean baseline worktree) — zero caused by this change. |
| §I.5d edit-legality ANDs two disagreeing judges | ✅ **MEASURED + RECOMMENDED, nothing applied** — bim-ootb **PR #1627** (probe only) | See §I.5d's ✅ block. `probe_edit_legality_judges.js`, 4 buildings / 119,568 elements / `layer=played`: offender sets largely DISJOINT (Hospital onlyFloating 332, onlyMidair 395); 32 simulated drags → `floatingOnly=0`, `midairOnly=0/0/2/3`; **`lockVerdictFlipsIfCopy1GetsTheBound=0/32`**; porting the bound would ADD 448 Hospital offenders. **KEEP the AND, port NOTHING, fix the ROW.** |
| §I.5e four floating judges | ✅ **DONE (documentation)** — see §I.5e's ✅ block | Copy 3 has **FIVE** sites, not three (`probe_captured_floating.js:48`, `probe_schedule_engine.js:45` were missing). **The LAYER is the caller's**: the same judge scores PLAYED at `time_machine.js:4431`/`:4419` and RAW-SOLVE / CPM-DISPLAY at `:5109`/`:4058`. Copies 3 and 4 deliberately NOT consolidated, reasons recorded. |
| §I.5f three rival storey-suffix rules | ✅ **DONE** — bim-ootb **PR #1629** | `collapsePhase` is now a strict SUPERSET of `import_worker.js` `normalizeStorey`: `T.O.S.` added, the one divergent token. Population EMPTY on all **seven** shipped buildings (0 rows, `elements_meta` AND `spatial_structure`) → zero fleet change, proved twice: `§WITNESS_STOREY_SUFFIX_PARITY pass=7 fail=0 ran=629` (623 real names) GREEN vs `pass=5 fail=2` RED on main, and a full `materializeZones` A/B with byte-identical task-grid hashes + totalDays on Duplex 12d / HHS 54d / Terminal 103d / Hospital 317d. ⛔ Terminal's `Ceiling Level NN` PREFIX form (673 live elements) deliberately NOT touched — renaming live bands is a modelling decision. |
| §I.5g third task-grid producer untagged | ✅ **DONE** — bim-ootb **PR #1628** | `materializeDefault` now emits `§TPL_MODEL model=default-materialize`. `§WITNESS_TPL_MODEL_THREE_PRODUCERS pass=7 fail=0 ran=4` GREEN vs `pass=3 fail=4` RED on main. LOG-ONLY proved not asserted: all four producer gridHashes byte-identical to main. ⚠ Its own W-TPL3P-2 was SCOPE-BLIND when first written (`Set(...).size === 3` passed on main, because `''` is a third distinct string) — fixed to set equality before landing. |
| §I.5i `SEQUENCE_DEFAULT`×7 · §I.5b EPS/GAP | 🟡 **PART DONE** — bim-ootb **PR #1630** | 2 consolidated (`time_machine.js` §4D_WALLS_BEFORE_ROOF reads `ScheduleGate.EPS/GAP`; `matchRule` consults `global.SEQUENCE_DEFAULT` before its literal). **3 blocked by a MEASURED mechanism**, now machine-checked: `witness_og_guard_bearing_bound.js` evals `_ogSupportSweep` with a STUB `ScheduleGate: { CELL: 4 }` — reading the module there would silently NaN the whole sweep; `_buildXraySupportCache` and `_promoteRoofLoadPath` are text-sliced into bare sandboxes. **The 7 stale literals are NOT corrected** — that is a duration change, not a de-drift. `§WITNESS_RETYPED_CONSTANTS pass=8 fail=0 ran=8` GREEN vs `pass=5 fail=3` RED on main, and it is a DRIFT DETECTOR (fails when a registered copy stops matching, or a NEW unregistered re-type appears). |
| §I.5h smaller/low-severity | ⏸ **NOT STARTED** | not in queue item B-2's brief |

**Two measurement traps cost real time here and are now guarded in the probes — read before writing
another one.** (1) **Field-name shape.** `auditFloating` reads `base_z`/`top_z` and `sched[g].start/.end`;
the persisted cache is `bz`/`tz` + `{s,e}`; `displaySchedule` is `{start,end}`. Feed the wrong shape and
every comparison is `undefined < undefined` = false, so the run returns **0 and reads as a clean PASS**.
This happened TWICE in one session — once in §I.5a's probe (both sides returned floating=0 on all 7
buildings) and once in §I.5c's (`startChanged=0`, 1 distinct start instant per task). Both probes now
carry a guard that refuses to report rather than report nothing. This is §I.5d's "different data shapes
for the same elements" biting the measurement instead of production. (2) **`SupportSweep` must be
registered on the right global or `§TPL_LAYER_ORDER` DOES NOT RUN AT ALL** — it logs
`§TPL_LAYER_ORDER_FAIL` and returns null. The node witness harness does not register it, so **every
template witness has been scoring runs in which that pass never executed.** Surfaced only when #1561
stopped muting the log.

### CLEAN — single-sourced, no rival implementation found

| the question | verdict |
|---|---|
| **are two storey names one floor?** | `schedule_gate.js:382` `deriveStoreyMergeMap` is the **only** implementation of elevation-based storey merging. Called from exactly one place (`schedule_author.js:720`). ⚠ but see §I.5f — the NAME normalisation it depends on has three rival rules. |
| **where inside its task?** (the remap itself) | `schedule_author.js:924` `remapSolveToTasks` is single-sourced and takes `layerOf` as a **parameter** — §I.4's correct shape. ⚠ the `layerOf` it is *fed* is defective — §I.5c. |
| **which ONE thing supports T?** | Two copies (`support_sweep.js:432`, `cpm_schedule.js:126`) but they are **byte-identical** modulo the module-resolution line — verified by mechanical diff of both bodies with comments/whitespace stripped. A real parity witness diffs them per element (`scripts/probe_cpm_schedule.js:145`, `§CPM_PARITY_SUPPORT elementMismatch`). The same holds for the `contactGraph` pair (`:384` vs `:54`, diff clean, `§CPM_PARITY` at `:131`). **The §I row should name the second copy** — it currently reads as single-owner — but the code is not drifting. |
| **is it on screen at cursor?** | The ~15 inline `start_ts`/`end_ts` comparisons across `time_machine.js` all agree: *placed* = `end_ts <= cursor` (`:1232`, `:8022`, `:8122`, `:8173`, `:8228`), *frontier* = `start_ts <= cursor < end_ts` (`:2111`, `:2578`, `:8052`). No `<`/`<=` divergence found. The sites that `break` early (`:1227`, `:2576`, `:3282`) depend on `_ops` being start-sorted, which is an enforced invariant (`:29`, re-sorted at `:6176`, `:9179`, `:9421`). ⚠ **the row's cited owner `time_machine.js:169` is a doctrine COMMENT, not code** — the implementation is the `renderAtTime` loop at `:1225`. Stale citation, correct doctrine. |
| **how long does it take?** | `schedule_author.js:78` `_installSecs` is the single formula owner. `time_machine.js:4494` `getInstallSecs` genuinely delegates (`:4500`). Its local fallback diverges exactly as the row already warns (drops `realQty`/`lengthRatio`, `:4503`) — **the row is accurate**. One small addition, §I.5g. The `28800`-vs-`SHIFT_HOURS=24` question is NOT a duplicate-owner defect: `rates.js:19-20` names them as two concepts (rate-table crew-day vs calendar clock) and `11ba2e3` §TPL_CALIB_SAMELEVER already measured them as **one lever** (`tasksDiffering=0/42`). Do not re-open it. |

---

### §I.5a ⛔ THE SUPPORT POOL HAS FIVE INLINE DEFINITIONS AND ONE OF THEM DROPS STAIR FLIGHTS

**This is §I.1's disease one level down, and it is LIVE.** `schedule_gate.js:1312` `supportPool(e)`
is exported, and its own header (`:1304-1308`) says it is *"the SUPPORT POOL, expressed once and
exported … so `designatedSupport()` in cpm_schedule.js and `_designatedSupport()` in time_machine.js
can ask the same question instead of treating every touching box as structure."* It is not expressed
once. Five inline copies decide the same membership question, and they do not agree:

| # | where | the test | stair flight? |
|---|---|---|---|
| 1 | `schedule_gate.js:1312` `supportPool()` — **the exported one** | `seq<=4 ∪ (IfcSlab && seq>4) ∪ IfcStairFlight` | ✅ in |
| 2 | `schedule_gate.js:570` `place()` support grid | `el.seq<=4 \|\| isPromotedSlab(el) \|\| isStairFlight(el)` | ✅ in |
| 3 | `schedule_gate.js:787` `structIdxGrid` | `P.seq<=4 \|\| isPromotedSlab(P) \|\| isStairFlight(P)` | ✅ in |
| 4 | `schedule_gate.js:1125` `auditFloating` `structGrid` | `e.seq<=4 \|\| (e.cls==='IfcSlab' && e.seq>4)` | ⛔ **OUT** |
| 5 | `time_machine.js:3739` `_buildXraySupportCache` | `e.seq<=4 \|\| (e.cls==='IfcSlab' && e.seq>4)` | ⛔ **OUT** |
| 6 | `schedule_gate.js:203` `groundworkSlabs.isStructBearing` | `seq<=4 ∪ **IfcWall\*** ∪ (IfcSlab && seq>4) ∪ IfcStairFlight` | ✅ in, **plus walls** |

`IfcStairFlight` carries `sequence: 6` (`rates.js:259`), so `seq<=4` is false for it, and copies 4/5
route it to neither grid — their `else if` branch only catches `IfcWall*`. **A stair flight is
invisible AS SUPPORT to the floating audit and to the x-ray staging cache**, while the scheduler
that produced the times treats it as structure.

**This is the exact bug `§STAIR_FLIGHT_GRID_VISIBILITY` fixed in the scheduler on 2026-08-14** —
`schedule_gate.js:550-555` names it verbatim: *"a flight is real structure but routes through
placeNonst (seq=6), so it was never inserted into structIdxGrid/grid — invisible AS SUPPORT to
anything resting on it (a mid-landing, a floor above)."* The audit twin never got that fix.

**The `§S64` repair was PARTIAL and its own comment says the opposite.** `schedule_gate.js:1164-1171`
records that #1345 added `isStairFlight()` to the scheduler's pools *"without touching the audit twin
here"* and cost 17 fleet-wide false verdicts — but the fix landed only on the **target** side
(`tPool`, `:1172`, "a stair flight does not hang from what it sits below"). The **support-membership**
side, `:1125`, was left alone. Worse, `:1154-1155` asserts *"structGrid (p===0) is unbounded here as
before: that pool's bearing test is edgeBearing's exact twin and already agrees with the gate."*
**It does not agree with the gate** — `:787` includes stair flights and `:1125` does not, 338 lines
apart in one file.

**Direction of the error (opposite to §S64's):** a target resting on a stair flight finds no bearing
candidate, `se` stays 0, and `:1204`'s `if (se > 0 && …)` can never fire — so this is a **false
NEGATIVE**, floating under-reported, not over-reported. Copy 6 additionally admits `IfcWall*` as a
bearer with no top bound while `auditFloating` admits walls only to promoted slabs and only under
`S.top_z <= T.base_z + GAP` (`:1156`) — the §I.1 copy-3 bound. Whether `groundworkSlabs` genuinely
needs walls in its disqualifying pool is a **construct question, not settled here**; its header
(`:190-191`) claims the list is *"the module's own bearing definition"*, which it is not.

⛔ **Not fixed here (audit-only).** Fixing 4/5 changes floating counts fleet-wide and moves the lock
gate — same blast-radius class as §H.6 item 1.

### ✅ COPY 4 FIXED 2026-08-27 (bim-ootb PR #1562) · ⛔ COPY 5 HELD · ⚠ THERE IS A COPY 7

**Copy 4 (`auditFloating`) now calls the exported `supportPool()`** instead of re-typing the test —
so it cannot drift from the scheduler again by construction (§I.4). MEASURED over the persisted
cache, 7 buildings, `viewer/tests/probe_stair_flight_support_pool.js`:

| building | floating | delta | newlyVisible | nowClean | blind-spot (bearing relations) |
|---|---|---|---|---|---|
| Duplex | 5 → 15 | +10 | 10 | 0 | 14 |
| HHS | 231 → 246 | +15 | 15 | 0 | 56 |
| Hospital | 172 → 172 | +0 | 0 | 0 | 5 (**1** stair flight) |
| Terminal | 350 → 408 | +58 | 58 | 0 | 174 |
| Clinic | 31 → 33 | +2 | 2 | 0 | 19 |
| LTU_AHouse | 2486 → 2549 | +63 | 63 | 0 | 397 |
| JKR | 882 → 938 | +56 | 56 | 0 | 132 |

**+204 fleet-wide, `nowClean=0` on every building** — strictly additive, the only direction a
false-negative repair may move. The blind-spot column is asked of the OWNER (`contactGraph`):
**797 bearing relations fleet-wide are carried by a stair flight** and this audit could not see one.

`witness_big_element_support_coverage` fired as designed (it locks `unchecked` and says "a move
EITHER way is a real behavior change"): **HHS 17→14, LTU_AHouse 626→624**, and that is a COVERAGE
GAIN — `unchecked` counts elements with ZERO candidates, which can only fall when a pool widens.
Attributable by class: HHS = `IfcStairFlight` 4→2 (**a flight resting on a flight had no candidate
at all** — the self-referential case the old pool excluded) + `IfcSlab` 5→4; LTU =
`IfcWallStandardCase` 355→353; the other five buildings byte-identical. Re-locked per §S64's
precedent.

⛔ **COPY 5 (`time_machine.js:3739` `_buildXraySupportCache`) IS HELD, and the reason is a real
finding, not caution.** Applying the identical fix there makes `witness_og_guard_bearing_bound`
`W-OGB-3a` fail with **Terminal `staged=0 → 14`** (isolated by reverting only that file: 9/0 without
it, 8/1 with it). Those 14 are real Terminal elements starting before a stair-flight carrier. They
appear because the x-ray **JUDGE** would then see flights as carriers while the **GUARD**
(`_ogSupportSweep`) repairs against **WALL carriers only** — so guard and judge genuinely would not
be "one physics" for this class, which is the very thing W-OGB-3a exists to forbid. **The open
question is whether `_ogSupportSweep` must repair stair-flight carriers too. That is a construct
decision; do not close it by re-baselining the 14.**

⚠ **THE POOL HAS A SEVENTH COPY the table above does not list:**
`viewer/tests/witness_og_guard_bearing_bound.js:140` — inside the witness whose entire subject is
pool parity. It asserted "guard and judge are one physics" by RE-TYPING the guard's pool, which two
copies of the same mistake also satisfy. Now calls `supportPool()` (PR #1562).

### §I.5b ⛔ EPS AND GAP ARE RE-TYPED AS LITERALS IN THE FILES THE EXPORT COMMENT NAMES

🟡 **PART DONE 2026-09-02 — bim-ootb PR #1630 (§RETYPED_CONSTANTS).** One site consolidated (`time_machine.js` §4D_WALLS_BEFORE_ROOF now reads `ScheduleGate.EPS/GAP` in the same `||` shape it already used for CELL); three BLOCKED by a measured mechanism (witnesses that text-slice one function into a bare sandbox — `witness_og_guard_bearing_bound.js` supplies a STUB `ScheduleGate: { CELL: 4 }`). TWO SITES THIS SECTION NEVER LISTED were found by the scan: `time_machine.js:9676`/`:9722` (`tmFirstAboveGroundMs`/`tmGroundSchedule`) — a Z-bottom epsilon over `element_transforms`, registered as DIFFERENT CONCERN beside this section's own `level_deriver.js` open question. The copies that remain are now covered by a DRIFT DETECTOR (`witness_retyped_constants.js`) instead of prose.

`schedule_gate.js:1298-1300` exports EPS/GAP with an explicit reason: *"EPS/GAP exported alongside
CELL so a consumer of the same geometry (time_machine.js §MIDAIR_REPAIR) can test contact with THIS
module's measured constants instead of re-typing them — **a second copy is a second thing to
drift**."* Three **production** sites re-type them anyway:

| where | code | note |
|---|---|---|
| `time_machine.js:3722` | `var CELL = 4, EPS = 0.05, GAP = 0.5;` | all three re-typed |
| `time_machine.js:4967` | `var _rgCELL = (ScheduleGate.CELL \|\| 4), _rgEPS = 0.05, _rgGAP = 0.5;` | CELL read from the module, **EPS/GAP typed by hand in the same statement** |
| `support_sweep.js:61` | `var _ogEPS = 0.05, _ogGAP = 0.5;` | in the same 620-line module whose `_contactGraph` (`:387`) reads `SG.EPS`/`SG.GAP` with the comment *"the shipped constants, never re-typed here"* |
| `time_machine.js:3500` | `var LP_GAP = 0.5;  // m — same "tops out at this level" tolerance schedule_gate.js uses (GAP)` | the comment states the duplication outright |

**All four currently equal the canonical `schedule_gate.js:38-39` values, so nothing is disagreeing
today — this is a latent drift hazard, reported as such, not inflated into a live defect.** It is
named because §I.1's three copies became three *different* predicates the same way, and because a
one-line change to `GAP` (which §H.6 item 1 is actively considering) would silently move three of
these and not the other four. Test/probe copies exist too (`witness_gantt_og_grid_perf.js:74`,
`witness_og_guard_bearing_bound.js:126`, `witness_door_window_host_wall.js:69`,
`scripts/gen_meta_transform_patch.js:42`, `scripts/audit_split_pairs.js:28`) — the last two label
themselves "mirrored", which is the honest form.

**OPEN QUESTION, not asserted:** `viewer/lib/level_deriver.js:49` `var EPS = 0.05; // metres of
slack on the extent/band intersection` carries the same *value* for what reads as a genuinely
different *concern* (band intersection, not bearing contact). I did not establish whether these are
one constant or two that coincide. Do not "unify" it without deciding that first.

### §I.5c ⛔ `§TPL_LAYER_ORDER` NARROWS THE BEARING RELATION, AND ITS OWN SELF-CHECK SHARES THE NARROWING

**This supplies the mechanism §H.3 recorded but did not explain.** §H.3 found that the layer pass
makes Hospital worse (13 → 15) while `§TPL_LAYER_SELFCHECK` says PASS, and correctly identified ONE
scope-blindness: the same-task filter (`_taskOf[_S.guid] !== _taskOf[_T.guid]`). **There is a second,
and it is upstream of the first.**

`schedule_author.js:1307` announces the pass as *"topological layers of the SHIPPED contact graph's
bearing relation"*, and `:921` claims `layerOf` is *"computed once from the SHIPPED contact graph
(never re-derived)"*. It calls the real `SupportSweep.contactGraph` (`:1326`) — and then **re-filters
its output with a bearing predicate the shipped graph does not use**:

```
schedule_author.js:1334   if (S2.bz < T2.bz - EPSl && S2.tz >= T2.bz - GAPl && S2.tz <= T2.bz + GAPl) b2.push(...)
support_sweep.js:410      if ((S.bz < T.bz - EPS && S.tz >= T.bz - GAP) || …          ← no upper bound
support_sweep.js:453      if (S.bz < T.bz - EPS && S.tz >= T.bz - GAP) { cls = 0; … } ← no upper bound
```

The extra `S2.tz <= T2.bz + GAPl` clause is §I.1 **copy 3's** upper bound — which §I.1 records as
existing *only* on `auditFloating`'s wall pool — applied here to **every contact**. So the graph is
the shipped one; the relation read off it is not.

**Blast radius is already measured, in this very file.** §H.2a: *"of the in-scope bearing contacts,
Hospital 941 / 2944 = **32.0 %** are supports whose top sits above the base they carry."* Those are
precisely the edges `:1334` discards. The Kahn layering at `:1341-1352` therefore runs on a graph
missing roughly a third of Hospital's bearing edges, and elements whose only support is one of them
land in layer 0 — laid out first inside their task, which is the inversion the pass exists to remove.

**And the self-check cannot see it, because it re-types the SAME narrowed predicate:**

```
schedule_author.js:1395   if (!(_S.bz < _T.bz - SG.EPS && _S.tz >= _T.bz - SG.GAP && _S.tz <= _T.bz + SG.GAP)) continue;
```

`§TPL_LAYER_SELFCHECK stillInverted` counts inversions **only among pairs both the pass and the
judge already agree to look at**. A pair the owner's graph calls bearing and this narrowing drops is
outside the judge's population entirely — it cannot be counted, so `stillInverted` cannot rise
because of it. That is PRIMAL LAW clause 4's **scope-blind** verdict, and combined with §H.3's
same-task filter the pass has two independent reasons to report PASS on a run it degraded.

⛔ The predicate at `:1334`/`:1395` is written out twice, ~60 lines apart, so a fix must touch both.

### ⛔ MEASURED 2026-08-27 (bim-ootb PR #1563, probe only) — CONFIRMED, AND **HELD**. DO NOT APPLY WITHOUT A RULING.

`viewer/tests/probe_tpl_layer_bearing_scope.js` runs three variants: `narrow` (shipped),
`widejudge` (**shipped pass, OWNER's judge** — changes no behaviour, only widens what the judge is
allowed to look at), `wide` (the candidate fix, owner's predicate on both sides).

| building | shipped judge | OWNER's judge, same run | OWNER's judge, after fix | self-check blind to | fix cures |
|---|---|---|---|---|---|
| Duplex | 4 | **32** | 5 | 87.5 % | 84.4 % |
| HHS | **0 — reports `PASS`** | **138** | 9 | **100.0 %** | 93.5 % |
| Hospital | 778 | **6618** | 794 | 88.2 % | 88.0 % |

**§I.5c is confirmed and quantified: the self-check is blind to 88–100 % of the real inversions.**
HHS is the sharpest scope-blind instance in this lane — `stillInverted=0 PASS` on a run the owner's
own predicate scores at **138 violations**. The fix is also demonstrably CORRECT: it cures 84–93 %.

**AND IT IS HELD, because the blast radius is SWEEPING — this is the stop condition, met:**

| building | in-task rank changed | tasks touched | max element shift | task membership | totalDays |
|---|---|---|---|---|---|
| Duplex | 966/1119 (**86.33 %**) | 14/20 (70.0 %) | 2.11 d | **0** | 13 → 13 |
| HHS | 6499/6839 (**95.03 %**) | 18/20 (90.0 %) | 6.36 d | **0** | 50 → 50 |
| Hospital | 61796/63182 (**97.81 %**) | 36/42 (85.7 %) | **63.50 d** | **0** | 318 → 318 |

Not a targeted subset — 86–98 % of elements across 70–90 % of tasks, one Hospital element moving
**63.5 days**. **What does NOT move, and should weigh in the ruling:** task MEMBERSHIP is unchanged
(0 on all three) and `totalDays` is identical, so the task grid and the schedule envelope hold — the
entire change is element placement INSIDE tasks. That makes it a model decision (how should a task's
interior be ordered?), not a defect fix, and it is the same "bigger than it looks" shape as the
duration-calibration finding of the same day.

⚠ **`§TPL_LAYER_ORDER` DOES NOT RUN AT ALL UNLESS `SupportSweep` IS REGISTERED ON THE RIGHT GLOBAL.**
It logs `§TPL_LAYER_ORDER_FAIL` and returns null. **The node witness harness does not register it**,
so every template witness has been scoring runs in which this pass never executed. Invisible until
PR #1561 stopped muting the log. Any future measurement of this pass MUST register SupportSweep
first or it is measuring the pass not happening.

### §I.5d ⛔ THE EDIT-LEGALITY ROW IS WRONG: IT RUNS **BOTH** DISAGREEING JUDGES AND ANDs THEM

The §I row reads `verifyGanttIntegrity() → _midairAudit`. Read the function
(`time_machine.js:4258-4331`): it calls **both**.

- `:4282` `var n = ScheduleGate.auditFloating(audited, sched, null, guids);` ← §I.1 **copy 3** (wall pool bounded by `S.top_z <= T.base_z + GAP`, stair flights absent from `structGrid` per §I.5a)
- `:4294` `var ma = _midairAudit(mrItems);` ← §I.1 **copy 1** (no top bound, full contact graph, all classes)
- `:4327` `return { ok: n <= base.floating && ma.midair <= base.midair, … }`

**So the lock gate is the one place in the codebase where §I.1's two disagreeing implementations are
run over the same population in the same call and their verdicts conjoined.** That is not
necessarily wrong — the `:4283-4288` comment argues for it deliberately (*"auditFloating's support
pools … cannot see an element whose real neighbours are outside them"*) — but the ownership row
naming only one of them is a stale row, and anyone reading it will re-derive the wrong physics for
an edit check. The two also receive **different data shapes** for the same elements (`audited`
carries `base_z`/`top_z`; `mrItems` is remapped to `bz`/`tz` at `:4291`).

**Correct row:** `verifyGanttIntegrity()` → `ScheduleGate.auditFloating` **AND** `_midairAudit`,
delta-gated against `_lockBaseline` (`:4326`), never absolute zero.

### ✅ §I.5d MEASURED AND ANSWERED 2026-09-02 (queue item B-2, Stage 4) — **RECOMMENDATION, NOT A SILENT PICK**

**Evidence: `viewer/tests/probe_edit_legality_judges.js` (bim-ootb PR #1627, measure-only — it
changes nothing and picks nothing).** Four buildings, 119,568 elements, persisted cache,
`layer=played` (verifyGanttIntegrity audits `_ops`, so `display` would be the wrong map — A-9).
No bake, no browser. Both judges shaken against a time-MIRRORED programme before any number was
reported.

**C — COVERAGE. Neither judge is a superset of the other, so the AND is redundant in NEITHER
direction.**

| building | auditFloating | midair | both | onlyFloating | onlyMidair |
|---|---|---|---|---|---|
| Duplex | 354 | 257 | 212 | 142 | 45 |
| HHS_Office_Federated | 186 | 152 | 30 | 156 | 122 |
| Hospital | 432 | 495 | 100 | 332 | 395 |
| Terminal | 228 | 493 | 19 | 209 | 474 |

**D — 32 SIMULATED DRAGS** (the 8 largest draggable tasks per building, each pulled 30 days
earlier — the gesture the editor performs). `floatingOnly = 0` on every building; `midairOnly` =
0 / 0 / 2 / 3. **The gate's refusals are carried by `_midairAudit`**; `auditFloating` never refused
an edit on its own in this sample (it co-signed 20 of the 25 refusals).

**THE DECISIVE NUMBER — `lockVerdictFlipsIfCopy1GetsTheBound = 0/8` on all four buildings (0/32).**
Giving copy 1 the §S64 bound copy 3 has would not change a single lock verdict.

**P — AND IT WOULD NOT BE A FIX EITHER.** Applying the bound to `contactGraph` + `designatedSupport`
moves the absolute baseline mostly UP: **Hospital 495 → 917** (+448 added, −26 removed), Terminal
493 → 572, Duplex 257 → 261, HHS 152 → 147; elections change on 2,564/63,182 Hospital elements.
Mechanism: excluding a high-topped bearer from the graph makes the element's election fall to a
different, later-starting support, or demotes a bearing election to carrier-above/embedded.
**82 % of Hospital's bound-violating elections are `IfcColumn` (2,346 of 3,253), not walls (579)** —
a column whose top rises past the base of the beam it carries is ordinary framing, not the phantom
§S64 was written about. §S64's bound is sound only in copy 3's context: a WALL pool offered
specifically to a promoted slab.

**⛔ THE RECOMMENDATION (the user's call, nothing applied):**
1. **KEEP the AND.** Both judges carry unique coverage; dropping either is a measured loss (Terminal
   would lose 474 offenders, Hospital 395, by dropping `_midairAudit`; 209/332 the other way).
2. **DO NOT port §S64's upper bound into `contactGraph`/`designatedSupport`.** 0/32 verdict flips
   (so there is no legality bug to fix) and +448/−26 on Hospital's baseline (so it would be a
   regression, not a fix). §I.1's "copies 1 and 2 never got it" is TRUE and is **not** a defect at
   this gate.
3. **THE DEFECT §I.5d NAMED IS THE ROW, AND IT IS FIXED HERE** — see the §I table's edit-legality
   row, now naming both judges and the delta gate.
4. **No observability gap found**, checked rather than assumed: `§GANTT_LOCK_BREACH`
   (`time_machine.js:7836`) already prints `floating=N(+dF) midair=M(+dM)` separately, and
   `§GANTT_LOCK_VERIFY` prints both against their baselines. Nothing to add.

**LIMIT, stated: the edit simulation is a uniform −30 day shift of whole tasks, 8 per building = 32
edits.** It is not exhaustive over gesture shapes (resize, single-bar, forward moves). It is enough
to answer "does the missing bound decide legality" — 0/32 — and not enough to claim `auditFloating`'s
delta is redundant, which is why recommendation 1 keeps it.

### §I.5e ⛔ "IS ANYTHING FLOATING?" HAS FOUR JUDGES, AND THE ONE THAT GATES CI HAS DRIFTED

The §I row names two (`_midairAudit`, `auditFloating`) and flags one disagreement (the top bound).
There are four, and the drift is in the one the row does not mention.

| # | where | shape | agrees? |
|---|---|---|---|
| 1 | `support_sweep.js:500` `_midairAudit` | directional: `des[i] >= 0 && items[des[i]].s > items[i].s + 1` | — the reference |
| 2 | `schedule_gate.js:1147` `auditFloating` | pool-scoped, `se > 0 && start < se - 1` | differs by design (§I.1) |
| 3 | `viewer/tests/witness_zone_display_authoring.js:121` + `witness_crosstask_judge_parity.js:74` + `scripts/probe_cpm_schedule.js:56` + **`scripts/probe_captured_floating.js:48`** + **`scripts/probe_schedule_engine.js:45`** `census`/`floatingCensus` | call the **real** `contactGraph`/`designatedSupport`, reproduce #1's 3-line loop verbatim | ✅ agrees |
| 4 | `viewer/tests/witness_midair_zero.js:308` `census` | **fully independent**, symmetric ("earliest contact of ANY kind"), own grid, own `isGround` | ⛔ **DIVERGED** |

### ✅ §I.5e COMPLETED 2026-09-02 (queue item B-2, Stage 5) — WITH THE LAYER EACH ONE JUDGES

**Two corrections to the table above, both measured against `origin/main` @ `bc470d71`:**
- **Copy 3 has FIVE sites, not three.** `probe_captured_floating.js:48` and
  `probe_schedule_engine.js:45` carry the same `floatingCensus` and were not listed.
- `auditFloating` is at `:1147`, not `:1122` (offset only; PR #1562 grew the function's header).

**⚠ THE LAYER IS THE CALLER'S, NOT THE JUDGE'S — and that is why two of these can disagree without
either being wrong.** A-9 (`§CACHE_PLAYED_LAYER`, PR #1607) established that a judge which cannot
name its own input cannot report being pointed at the wrong one. Neither shipped judge takes a layer
argument: each judges whatever `{s,e}` / `sched[guid]` it is handed. Measured, per call site:

| judge | shipped call site | LAYER it judges there |
|---|---|---|
| 1 `_midairAudit` | `time_machine.js:4431` — `verifyGanttIntegrity`, `mrItems` built from `_ops` | **PLAYED** (kernel_ops — what the film and scrubber reveal) |
| 1 `_midairAudit` | `time_machine.js:4058` `§CPM_DISPLAY_REUSE` · `:4079` — inside `_displayTimeline` | **CPM DISPLAY, mid-authoring** (before `injectGantt` ever runs) |
| 2 `auditFloating` | `time_machine.js:4419` — `verifyGanttIntegrity`, `sched` built from `_ops` | **PLAYED** |
| 2 `auditFloating` | `time_machine.js:5109` `§SUPPORT_CHECK` — `_sched` | **RAW SOLVE** (`ScheduleGate.computeSchedule`; `:4971` says outright *"`_sched` itself stays RAW"*) |
| 3 `census`/`floatingCensus` ×5 | witnesses/probes only | **CPM solve / authored windows / captured-rescaled**, per probe — never the played layer |
| 4 `witness_midair_zero.js` `census` | that witness's own fixture | **its own synthetic population** |

**So the ONLY place two of them judge the SAME layer over the SAME population is
`verifyGanttIntegrity` — which is exactly §I.5d, and §I.5d is now measured and answered above (0/32
verdict flips).** Every other apparent disagreement in this table is at least partly a LAYER
difference, and must be re-derived per call site before it is called a physics disagreement.

**⛔ NOT CONSOLIDATED, deliberately, and this is the "only what is unambiguous" line:**
- **Copy 4 stays.** Both code notes (`witness_midair_zero.js:301-307`, `support_sweep.js:489-499`)
  say it is a deliberately independent judge. Deleting it is explicitly forbidden by §I.5e's own
  text. The open question — whether the two describe one physics — is unchanged and still open.
- **Copy 3's five sites stay.** They already call the REAL `contactGraph`/`designatedSupport`; only
  the 3-line verdict loop is re-typed. Replacing that loop with a call to `SupportSweep.midairAudit`
  would remove the last independent thing about a set of JUDGES, and
  `witness_zone_display_authoring.js` deliberately uses the **sliced** `time_machine.js` copies, not
  the module. Named here so the next sweep does not re-discover them as drift.

Copy 4 is the judge `witness_midair_zero` locks the lane's headline metric with. Its own code says so
(`:301-307`): *"it mirrors `_contactGraph`'s symmetric carrier clause, while `SupportSweep.midairAudit`
went DIRECTIONAL in #1435. Measured 2026-08-22: breaking the shipped judge by 86,400,000x leaves this
witness at pass=49 fail=0 — the lock does not track the engine. Green here is not evidence that
midairAudit works."* The matching note sits at `support_sweep.js:489-499`.

**This is already tracked in `4D_GANTT_TM_REFACTOR.md` §S58.5 — the finding here is that §I's own
row does not carry it**, so a reader who obeys §I's instruction ("find your question, call the
owner") is told the floating relation has two owners that disagree on one clause, when it actually
has four and the CI lock is on the stale one. **Do not delete copy 4** — both code notes say it is a
deliberately independent judge; the open question is whether the two describe one physics.

### §I.5f ⛔ THREE RIVAL RULES FOR "STRIP THE SUB-STOREY SUFFIX", AND THE MERGE MAP KEYS OFF A DIFFERENT ONE THAN THE ELEMENTS DO

✅ **CLOSED 2026-09-02 — bim-ootb PR #1629 (§STOREY_SUFFIX_PARITY).** `collapsePhase` is now a strict SUPERSET of `normalizeStorey` (`T.O.S.` added), so rule 2 running first can never change the band key. `T.O.S.` population re-measured EMPTY on all seven shipped buildings → zero fleet change, proved by 623 real names + a full `materializeZones` A/B (byte-identical grids). ⛔ The `Ceiling Level NN` PREFIX finding below is STILL OPEN and was deliberately not touched. Details in the §I.5 REMEDIATION STATUS table.

`collapsePhase` (`schedule_gate.js:404`) is the §I-implied owner of storey-name normalisation. Two
others exist:

| # | where | rule | strips |
|---|---|---|---|
| 1 | `schedule_gate.js:406` `collapsePhase` | `/\s+(Ceiling\|TOS\|Top of Steel\|Soffit\|Slab)\b.*$/i` — strips the token **and everything after it** | Ceiling, TOS, Top of Steel, Soffit, **Slab** |
| 2 | `import_worker.js:276` `normalizeStorey` (§STOREY_NORMALIZE) — runs at IMPORT and **writes `elements_meta.storey`** | case-insensitive `endsWith` over a literal list | Ceiling, TOS, **T.O.S.**, Top of Steel, Soffit — *no Slab* |
| 3 | `panels.js:2042` `collapseLevel` | `/^(Level\s*\S+?)(?:\s+(?:Ceiling\|TOS\|Top of Steel))?$/i` — **anchored on a `Level` prefix**, returns the name unchanged otherwise | Ceiling, TOS, Top of Steel — *no Soffit, no Slab, no T.O.S.* |

**Why it matters structurally, not just cosmetically.** `deriveStoreyMergeMap` builds its keys from
`collapsePhase(spatial_structure.name)` (`:386`) — the **raw extracted** IFC storey name. The lookup
that consumes those keys, `deriveBandRanks`, applies `collapsePhase(e.storey)` (`:341-342`) to a name
that **rule 2 already rewrote at import**. Verified: `normalizeStorey` is applied only to `storeyMap`
→ `elements_meta.storey` (`import_worker.js:289`); `spatial_structure` is written separately
(`lib/room_walker.js:1363`) and is not normalised there. **For any name where rules 1 and 2 disagree,
the merge map's key never matches the element's band key and the merge silently no-ops for that
storey** — with no log, because §S18 only reports `names=` and `merged=` counts.

**The single divergent token is `T.O.S.`** — rule 2 strips it, rule 1's `\bTOS\b` does not match it.
**MEASURED, and it is LATENT not live:** querying the two shipped DBs that carry `spatial_structure`,
`Hospital_meta.db` has `Level 2 TOS … Level 7A TOS` / `Level N Ceiling` (both rules agree) and
`Terminal_meta.db` has `Ceiling Level Kedai, Ceiling Level 01…04`. **No `T.O.S.` form exists in the
current fleet.** Reported as a real code divergence with an empty population today — the honest
statement, not a manufactured defect.

**Separately, and this one IS live:** Terminal's `Ceiling Level NN` is the **prefix** form, and
*none* of the three rules strips it (rule 1 needs `\s+` before the token; rule 2 needs it at the end;
rule 3 needs a `Level` prefix). Those 5 names survive as distinct bands through name-collapse and are
only rescued by `deriveStoreyMergeMap`'s **elevation** merge — which is why §I.3's §CLOSED block
reports 23 names → 15 bands only *after* the patches landed. On a building with names but no
elevations, the prefix form is unmergeable by any rule in the codebase.

Rule 3 is arguably a **different concern** — it collapses `tasks.name` while walking a WBS tree, not
`elements_meta.storey` — and `phaseOf` (`panels.js:2046`) gates it on `/^Level\b/i` anyway, so it
never sees Terminal's Malay `Aras *` names at all. **Stated as an open question rather than asserted
as one relation.**

### §I.5g THE TASK GRID AND THE MODEL TAG BOTH HAVE A THIRD PRODUCER THE ROW DOES NOT NAME

✅ **CLOSED 2026-09-02 — bim-ootb PR #1628.** `materializeDefault` emits `§TPL_MODEL model=default-materialize`; the third state is now attributable, log-only (all four producer grid hashes byte-identical to main). ⚠ The `getInstallSecs` silent-floor note at the end of this section is NOT closed — it was out of Stage 5's brief. Details in the §I.5 REMEDIATION STATUS table.

Both rows present a two-way fork. There are three generators, all writing the same `SCH_AUTHORED`
schedule id:

| generator | task grid from | `§TPL_MODEL` line? |
|---|---|---|
| `schedule_author.js:435` `instantiateTemplate` (via `materializeZones` + `opts.template`) | `rates/4D_template.json` | ✅ `model=template` (`:741`) |
| `SG.deriveZones` (via `materializeZones`, no template) | grouped out of what the solve did | ✅ `model=legacy-deriveZones` (`:746`) |
| `schedule_author.js:1417` `materializeDefault` | phases from `SEQUENCE_RULES`, widths from labor workload | ⛔ **none — no attribution line at all** |

`materializeDefault` is **live UI**, two call sites in `schedule_author_ui.js` `generateDraft()`:
`:276` (the "Start blank" checkbox) and `:293` (the fallback when `materializeZones` returns
`!ok`). Neither emits `§TPL_MODEL`; `:293` logs only `§AUTHOR_UI_DRAFT mode=dated-fallback`. So the
row's `never` ("assume the canonical model ran because the code *can* pass `template:`") has a third
state it cannot express: a schedule that came from neither model.

**The concrete mechanism by which the canonical path is missed** is at `schedule_author_ui.js:288`:
`var _tpl = (typeof window !== 'undefined' && window._4dTemplate) || null;` — `window._4dTemplate` is
set by `time_machine.js`'s `_load4DTemplate()`. Open the authoring UI without the Time Machine
having loaded the template and `_tpl` is `null`, so `materializeZones` takes the **dead**
`legacy-deriveZones` branch. The comment at `:286-287` states this plainly.

✅ **Credit where due:** `witness_gantt_edit_coherence.js:210-218` reads the shipped `§TPL_MODEL`
line rather than re-deriving it and reports `INCONCLUSIVE — no §TPL_MODEL line was emitted` when it
is absent. That is PRIMAL LAW clause 4 done right, and it is why the third producer is detectable at
all.

**Also small, on the duration row:** `getInstallSecs`'s fallback (`time_machine.js:4503-4513`) drops
the `§TPL_ZERO_MINUTE` floor report as well as the weighting. `_installSecs` calls `_reportFloor` on
both floor paths (`:80`, `:90`); the fallback just `return 120`. §S65's own comment says the defect
*"survived weeks of downstream fixes because this function reached the floor SILENTLY — no §-log, at
any of its sites, ever."* The fallback re-creates that silence on the path where ScheduleAuthor
failed to load. The `:4510-4511` comment remembers to keep `default_productivity` in step and does
not mention the log.

### §I.5h SMALLER, VERIFIED, LOW-SEVERITY

- **Ground exemption — the "owner" is an observability branch, not a gate.** `schedule_gate.js:1210`
  `T.seq !== 1` guards only the `§SUPPORT_UNCHECKED` **warn-only** log (`:1205-1217`, *"Does NOT
  touch v / the floating flag"*). The floating verdict at `:1204` is `se > 0 && start < se - 1` —
  an element with **no** support (`se === 0`) is never counted floating regardless of `seq`. So the
  exemption never actually exempts anything from the verdict; it filters a log line. The row is
  literally correct and reads as more load-bearing than it is. One inline re-type of the same
  predicate exists at `time_machine.js:4979` (`_e.cls !== 'IfcSlab' && _e.seq !== 1 && …`) and one
  of the `buildingModelsSubstructure` test at `:4949` vs the owner's `:1138` — both agree today.
- **Two name-regex answers to "is this slab ground-bearing?"** live alongside the geometric owner:
  `rates.js:334` `slab_on_grade_substructure` (`pattern: 'slab[ _-]?on[ _-]?grade'` → `sequence: 1`)
  and `rates.js:312` `foundation_pile_misclassified_slab` (`'str-fo|\bpile\b'` → `sequence: 1`).
  These are **deliberate and documented** (§SLAB_ON_GRADE_RECLASS, `rates.js:319-332`) and answer a
  different question (they set `seq`, which feeds the exemption; `groundworkSlabs` sets `phase`).
  Not a defect — but the §I row says "one shared definition", and a reader chasing a groundwork
  misclassification needs to know the name-override table can reach the same element first.
- **Stale line citations in §I's own table** (all functions found, offsets only): `§TPL_MODEL` is at
  `schedule_author.js:741`/`:746`, not `:715`. `instantiateTemplate` is at `:435`, not `:425`.
  `remapSolveToTasks` is at `:924`, not `:884`. `supportPool` is at `schedule_gate.js:1312`, and the
  §S64 comment at `:1166` cites it as `:1246`. `time_machine.js:169` is a comment, not the owner.
- **Latent witness-harness landmine.** `tests/_schedule_gate_main.js` is a frozen `origin/main` fork
  of the whole gate module; at `:202` it does `global.ScheduleGate = API` with a **5-key** API
  (`computeSchedule, collapsePhase, elementsInPhase, auditFloating, CELL`) — **no `EPS`, no `GAP`,
  no `supportPool`**. `witness_4d_band_monotonic.js:21-22` requires the real module first and this
  one second, so `globalThis.ScheduleGate` ends up pointing at the fork. That witness never touches
  `SupportSweep`, so nothing breaks **today** — but `_contactGraph` (`support_sweep.js:386-387`)
  guards only on `SG.CELL`, then reads `SG.EPS`/`SG.GAP` as `undefined`, making every comparison
  `NaN` and returning a **silently empty contact graph**. Any future `require` of SupportSweep or
  CpmSchedule in that process would read green on zero contacts.

### §I.5i ⛔ `SEQUENCE_DEFAULT` IS RE-TYPED SEVEN TIMES AND EVERY COPY IS THE PRE-§S65 VALUE

🟡 **PART DONE 2026-09-02 — bim-ootb PR #1630.** The one real trap this section names — `schedule_author.js:19` `matchRule` falling to the literal WITHOUT ever consulting `global.SEQUENCE_DEFAULT` — is closed; every existing call site was verified to pass a third argument, so it is inert today. **The seven stale literals are NOT corrected**: correcting a value that a path actually reaches is a duration change, not a de-drift. ⛔ **MECHANISM MEASURED, and it sharpens this section's own 'in node … `defaultRule` MUST be passed'**: `schedule_author.js` closes as `})(typeof self !== 'undefined' ? self : this)`, and in a node CommonJS module `this` is the ORIGINAL `module.exports` object which the file then REPLACES — so the IIFE's `global` is an **orphaned object no caller can ever reach**, and EVERY `global.SEQUENCE_DEFAULT` fallback in that file is unreachable in node, not merely usually-unset.

The declared home is `rates.js:276`:

```
var SEQUENCE_DEFAULT = {phase:'Architecture Envelope',sequence:6,resource:'MASON'};
   // §S65: was resource:null -> every unmatched class floored at 120s
```

**Its own trailing comment is the reason this matters.** §S65 changed `resource: null` to `'MASON'`
*because* null routed every unmatched class into `_installSecs`' `no-resource` branch
(`schedule_author.js:80`) and floored it at 120 s — the zero-width-bar / "zero minute stacking"
defect. Seven fallback literals still carry the **pre-§S65** object:

| where | literal |
|---|---|
| `schedule_author.js:19` (`matchRule`'s own `dflt` default) | `{ phase: 'Architecture', sequence: 6, resource: null }` |
| `schedule_author.js:306`, `:1422`, `:1695` | same |
| `schedule_diff.js:203` | same |
| `time_machine.js:3662`, `:4458` | same |

Two things are wrong with each copy, not one: `resource: null` is the value §S65 removed, and
`phase: 'Architecture'` is a name `rates.js:415` explicitly marks *"legacy key — ops/DBs written
before the 2026-08-26 split still carry it"*, superseded by `Architecture Envelope` /
`Architecture Closeup`.

**Severity, stated honestly: LATENT, and that is the whole difference from §I.5b.** §I.5b's EPS/GAP
copies still *equal* their source; **these have already diverged from theirs** and are held back only
by `||` ordering. Six of the seven read `opts.defaultRule || global.SEQUENCE_DEFAULT || <literal>`,
and every production caller supplies one of the first two (verified: `schedule_author.js:358`,
`:1480`, `:1719`, `time_machine.js:3553` all pass `dflt`; in a browser `rates.js`'s top-level `var`
*is* `window.SEQUENCE_DEFAULT`). The seventh, **`schedule_author.js:19`, is the exception worth
watching**: `matchRule(cls, rules, dflt)` falls to the literal without ever consulting
`global.SEQUENCE_DEFAULT`, so any future caller that omits the third argument silently re-acquires
the exact pre-§S65 120-second floor. In node, where `rates.js` is loaded through
`new Function(ratesSrc + …)` and its `var`s never reach `global`, `defaultRule` **must** be passed —
most probes do, and one that forgets gets the stale object with no log.

### §I.5j ⛔ "WHAT DID THE RUN ACTUALLY SAY?" — PRIMAL LAW CLAUSE 3 IS VIOLATED IN 16 FILES, AND CLAUSE 5's CACHE HAS 2 READERS

This row's `never` is *"re-run `materializeZones`, and **never** wrap it to silence `console.log`
(PRIMAL LAW clause 3)."* Both halves are being done, at scale.

**(a) 16 files install a full-silence `console.log = () => {}` wrapper**, most of them directly
around a pipeline call. Verified by reading two of them:

```
scripts/probe_template_hells.js:131   const _l = console.log, _w = console.warn;
                             :132     console.log = () => {}; console.warn = () => {};
                             :135     res = ScheduleAuthor.materializeZones(db, R.SEQUENCE_RULES,
                             :136       mode === 'template' ? Object.assign({}, base, { template: T }) : base);
```

That probe exists to compare the **template** model against the **legacy** model — and it silences
the `§TPL_MODEL` line that names which one ran. `scripts/probe_enclosure_geometry.js:102-110` does
the same and additionally swallows the exception (`} catch (e) {}`).

Full list (`console.log = () => {}` / `console.log = console.warn = console.error = …`):
`viewer/tests/` — `witness_bar_schedule.js`, `probe_4d_motion.js`, `witness_door_window_host_wall.js`,
`witness_s50_cell_engine.js`, `witness_4d_capacity_honoured.js`,
`witness_tm_schedule_output_of_truth_all_buildings.js` (its helper is literally named
`generateQuietly`), `witness_kernel_ops_sched_version.js`, `witness_midair_zero.js`,
`witness_s55_identity_vs_cell.js`, `witness_hosted_before_host.js`, `witness_bar_composite.js`,
`probe_4d_movie_vs_bars.js`, `witness_bar_needs.js`; `scripts/` — `probe_day0_unsupported.js`
(a named `quiet()` helper), `probe_template_hells.js`, `probe_enclosure_geometry.js`.
The honest form exists too and should be the pattern: `witness_big_element_support_coverage.js:194`
and `witness_tm_geo_order_cycles.js:129` **tee** (`return origLog.apply(console, arguments)`).

**(b) THE FORK'S TWO BRANCHES ARE ON DIFFERENT STREAMS, AND THE TEMPLATE WITNESS MUTES THE FAILURE
ONE.** This is the sharpest instance and it ties §I.5g shut:

```
schedule_author.js:741   console.log ('§TPL_MODEL model=template …')            ← canonical branch
schedule_author.js:746   console.warn('§TPL_MODEL model=legacy-deriveZones …')  ← the DEAD-model branch
```

```
witness_4d_template_instantiation.js:62   console.log = (...a) => { … if (s.indexOf('§TPL_') === 0 || s.indexOf('§AUTHOR_TPL') === 0) logs.push(s); };
                                    :63   console.warn = () => {};
```

The filter keeps the canonical branch and the **total `console.warn` mute deletes the legacy one**.
That witness always passes `template: T` (`:67`) so the branch should not fire today — but the same
mute also deletes, on every run: `§CLASS_UNMATCHED` (`schedule_author.js:29`), `§TPL_ZERO_MINUTE`
(`:75` — **which matches the `§TPL_` filter and is discarded anyway purely because it is a warn**),
and `§TM_DURATION_SYNC_FALLBACK` (`time_machine.js:4480`). The `console.log` filter separately drops
`§S18_STOREY_MERGE_FAIL` (`:725`), `§ZONE_DISPLAY_AUTHORING_FAIL` (`:706`), `§AUTHOR_ZONES_FAIL` and
`§SUPPORT_UNCHECKED`. **A `§`-tag is not enough: which STREAM a line uses now decides whether a
witness can see it.** Either put both `§TPL_MODEL` branches on one stream or make every wrapper tee.

### ✅ (b) FIXED 2026-08-27 (bim-ootb PR #1561) · 🟡 (a) CATEGORIZED — 9 OF 16 ARE REAL

**(b) is closed.** Both `§TPL_MODEL` branches now log on `console.log`, and
`witness_4d_template_instantiation` TEES both streams instead of muting `warn`. Measured cost of
forwarding: **25 lines per building, every one `§`-tagged, zero non-`§` noise** — there was nothing
the mute was protecting. A new invariant `the-CANONICAL-template-model-ran` reads the shipped line
and scores **absence as FAIL**, not pass. Witness 11/0 → **12/0**; red control (drop `template:` to
force the dead branch) → `FAIL … §4DTI_MODEL_FAIL judged the DEAD model`, exit 1.

**(a) categorized, all 16 read.** They are NOT one defect — split them before fixing:

| bucket | n | meaning | files |
|---|---|---|---|
| **A — structurally blind** | **9** | mutes a stream that carries a `§` line the file's own verdict depends on | `probe_enclosure_geometry`, `probe_template_hells`, `probe_4d_movie_vs_bars`, `probe_4d_motion`, `witness_hosted_before_host`, `witness_midair_zero`, `witness_4d_capacity_honoured`, `witness_door_window_host_wall`, `probe_day0_unsupported` |
| **B — noise-only** | 4 | verdict computed entirely from return values; no `§` read | `witness_s50_cell_engine`, `witness_kernel_ops_sched_version`, `witness_s55_identity_vs_cell`, `witness_tm_schedule_output_of_truth_all_buildings` |
| **C — also swallows exceptions** | 2 | empty `catch` on top of the mute | `probe_enclosure_geometry` (around the pipeline call — **worst of the set**), `probe_template_hells` (around a `db.exec`) |
| **D — dead lane, out of scope** | 3 | `bar_model.js`/`bar_needs.js` only | `witness_bar_schedule`, `witness_bar_composite`, `witness_bar_needs` |

Worked examples of bucket A: `witness_hosted_before_host` mutes the `computeSchedule` that emits
`§HOSTED_BEFORE_HOST` — *the exact metric it is named for and gates on* — then hand-re-derives it.
`witness_door_window_host_wall` mutes `§CURTAIN_WALL_OPENING`, whose own header calls it *"the no-op
proof"* for the gate that witness asserts is wired. `probe_enclosure_geometry` mutes AND swallows,
so a thrown pipeline leaves `floatIdx=[]` and it prints `GENUINELY OPEN=0` — a green zero
indistinguishable from "nothing was judged".

⚠ **ONE CONSTRAINT ANY FIX MUST RESPECT — a raw tee will turn some witnesses RED for a bad reason.**
`tests/run_witness_suite.js:141` auto-discovers every `viewer/tests/witness_*.js` and `:164` runs it
through `spawnSync` **with no `maxBuffer`** (Node default **1 MB**). Any `witness_*` whose mute spans
`_buildScheduleElements` emits one `§CLASS_UNMATCHED` per element (Hospital ≈ 64 k) and a raw
passthrough re-creates the SIGTERM-read-as-RED failure that
`witness_tm_schedule_output_of_truth_all_buildings.js:25-30` documents. Those need a **filtered or
counting** tee. `scripts/probe_*` and `viewer/tests/probe_*` are unaffected (not matched by `^witness_`).
Fix effort: **11 mechanical, 3 need judgment** (`witness_4d_capacity_honoured`,
`witness_tm_schedule_output_of_truth_all_buildings`, `probe_enclosure_geometry` — the last also needs
a vacuity guard), 3 dead-lane skipped.

**(c) Clause 5's persisted cache is bypassed almost universally.** `scripts/cache_4d_run.js` has
exactly **two** consumers — `viewer/tests/witness_day0_integrity.js:37` and
`scripts/probe_tpl_reveal_spread.js:11`, both of which do it correctly (the former even prints
`§W_D0 CACHE_MISS … INCONCLUSIVE` rather than a bare pass). Roughly **60** other scripts/witnesses
call `materializeZones` / `_buildScheduleElements` / `computeSchedule` / `CpmSchedule.run` directly.
Most predate the cache and re-running is not itself wrong — **but §I's row states the cache as the
owner, and 2-of-62 is not an owner.** Either the row is aspirational and should say so, or the
migration is an open work item; today the row reads as settled and is not.

**(d) Four other persisted "what the run said" artifacts exist**, surfaced by sweep and **not
individually re-read by me — treat as leads, verify before citing**:
`viewer/analysis_sidecar.js:149` `get4D` (OPFS, keyed on **building name only** — `boq_charts.html:1305`
already documents that it "cannot tell authored from generated"), `schedule_author.js:2643`/`:2680`
(IndexedDB `bim_ootb_cache`), `time_machine.js:3985-4021` (`_displayTimeline._last`, a 99.9%-coverage
in-memory fingerprint), and `schedules.gen_version` / `_GANTT_CACHE_VERSION` (`:5325`). Four
staleness keys, four different derivations.

### §I.5k SURFACED BY SWEEP, **NOT** INDIVIDUALLY VERIFIED — LEADS ONLY

Recorded so they are not rediscovered, explicitly **not** asserted as findings. Each needs the
file:line read before it is cited or acted on.

- **Phase/trade classification is the most duplicated relation in the codebase.** Besides
  §I.5i, the sweep reports ~13 further production classifiers answering "what phase/trade is this":
  `rates.js:373` `getPhase`, `rates.js:393` `WORK_PACKAGES`, `export_5d.js:371` (its own
  class→phase map, still using the legacy `'Architecture'`), `config.js:74` `PHASE_MAP`,
  `panels.js:2047` `phaseOf`, `schedule_read_4d.js:52` `discOfResource`, `proj_fold.js:150`,
  `boq_charts.html:477`/`:908`, `ghostglass.js:19` `PHASE_HEX` (missing the Envelope/Closeup split),
  plus **four hardcoded phase-order arrays that are not in the same order**
  (`time_machine.js:5414`, `:8017`, `gantt_model.js:62`). Also four substitution paths into the
  table (`rates.js` literal, `rates/sequence_rules.json`, 18 rate-pack `sequence` blocks merged at
  `rates.js:491`, locale `labor_rates` merged at `locale_loader.js:207`).
- **Duration:** ~13 further production formulas, including **four different crew-day divisors inside
  `schedule_author.js` itself** (`:472`, `:844`, `:1534`, `:1728`).
- **Task grid:** further builders at `gantt_model.js:96`, `boq_charts.html:435`/`:882`,
  `panels.js:2029`/`:2089`, `proj_fold.js:148`, `foreign_schedule.js:389`.
- **Floating / visibility:** the sweep counts 23 floating re-implementations and 20 visibility ones.
  I verified the four floating judges in §I.5e and found the `viewer/` visibility sites consistent;
  the sweep's `<`-vs-`<=` split is concentrated in `scripts/` and `tests/` (`witness_day0_integrity.js:108`,
  `probe_floating_guid_audit.js:146`, `probe_enclosure_rule.js:216` use **start-only** for "placed",
  where the owner requires `end_ts <= cursor`) plus `time_machine.js:7753`/`:7873`, which use `<=`
  on the END for Gantt-bar "active", where the element frontier uses `<`. **Whether bar-active and
  element-frontier are the same relation is an open question** — a bar legitimately includes its
  own finish instant. Do not "fix" that without deciding it.

### ⛔ ROWS NOT REACHED

**"when does each element happen?"** (`schedule_gate.js:421` `computeSchedule` → `cpm_schedule.js:796`
`run`) was not audited to depth. `computeSchedule` alone is ~700 lines of two-pass gating and
`cpm_schedule.js` `run/buildGraph/solve` is a second full solver; establishing whether they encode
one precedence model or two needs its own session, not the tail of this one. **Do not read its
absence here as "clean."** The two things already known and NOT re-derived: `cpm_schedule.js` carries
its own `contactGraph`/`designatedSupport` (verified byte-identical above), and `_displayTimeline`
(`time_machine.js`, §CPM_DISPLAY) is a third timeline producer feeding the movie.

**"what did the run actually say?"** WAS reached — see §I.5j. It is the worst row in the table.

## §I.6 ✅ THE DECLARED DATUM LADDER MUST BE IN THE GEOMETRY'S VERTICAL FRAME (2026-09-03, bim-ootb PR #1641)

**1 band.** That is how many storeys Hospital had on the DB the viewer actually loads, from the moment
PR #1551 (§STOREY_DATUM) merged (2026-09-02 18:14 +0800) until this fix: all 63,182 elements in
"Level 7", 7 tasks, 509 days. The film is 207.867 s / 3,118 frames either way, so calendar-per-second
went **+60 %** — the user's report was *"the bake is too fast paced."* The user's own local
`~/Downloads/Hospital_silent.db`: same, 1 band, 7 tasks, 515 days, relabelled 53,844/63,415.

### The cause — a choice by EMPTINESS, on data that ships in two frames
`schedule_author.js` `_buildScheduleElements` read the declared storeys as
`elevation IS NOT NULL` rows, falling back to `center_z IS NOT NULL` **only if the first query
returned nothing**. `Hospital_meta.db` (and the served bytes + `buildings/patches/Hospital_meta.db.sql`,
which DROP+CREATEs the same 63 rows) carries **63** `IfcBuildingStorey` rows in **two vertical frames**:

| family | rows | column | range | frame |
|---|---|---|---|---|
| federated source storeys (`Level 1 … Level 7`, `… TOS`, `… Ceiling`) | 56 | `elevation` | **0.0 … 34.0 m** | LOCAL per-file |
| COMPILED `STC_Level_*` (room walker) | 7 | `center_z` (elevation NULL) | **168.7 … 201.4 m** | WORLD (the geometry's) |

Every element base-Z is **156.6 … 202.8 m** (p05 168.5, median 181.3, p95 191.4). The 56 local rows
won by emptiness, every element sat above the top datum 34.0, and `_bandOf` put all of them in the
last band. Terminal (elevation −17.03 … 29.08 vs base-Z median 19.7), Clinic (no `elevation` column;
center_z 0.80 … 6.61 vs median 2.99), Duplex-patched (elevation −1.25 … 6.0 vs median 2.70) and
HHS (center_z 1.69 … 8.75 vs median 6.02) are all one frame. **Hospital is the only building where
the two families disagree**, so a correct fix is a NO-OP everywhere else — and that was proven per
building, not assumed (table below).

**Why #1551's own verification missed it — the `project_split_db_live_vs_probe_landmine` again.**
It asserted *"Hospital: no declared storeys ⇒ byte-identical, relabelled 0/63182."* True of
`Hospital_extracted.db`, which has no `spatial_structure` table at all. The viewer runs the
meta+geo split pair via `streaming.js §DB_SPLIT_DETECT`, and `Hospital_meta.db` has the table. The
witness below therefore judges the meta, patched-meta, silent AND extracted DBs, and carries an
`extracted-is-vacuous` invariant that asserts the extracted row is `INFERRED reason=NO_DECLARED_STOREYS`
— i.e. the row #1551 judged could never have seen the defect.

### The rule now — `_chooseStoreyDatum` (owner), exported, pure
Both families are read as separate CANDIDATE sets (`_storeyDatumCandidates(db)` — a missing column or
table is an EMPTY candidate, never a throw). Each candidate's ladder (sorted, same-datum duplicates
dropped, exactly #1551's dedupe) is tested against the element base-Z distribution (noGeo excluded,
the recipe's own filter): **the ladder span `[d_0, d_last]` must contain the element base-Z MEDIAN.**
The first in-frame candidate wins, `elevation` before `center_z`, so the IFC's own declaration keeps
priority and every building where both are in frame is **byte-identical to #1551**. If no candidate is
in frame the declared path is REFUSED and the old label inference runs — DEGRADE, DON'T DISABLE —
with `reason=NO_CANDIDATE_IN_FRAME` on the §-line.

Why the median and not min/max interval overlap (which is what a first draft would write): it is the
one location statistic that needs no tolerance constant **and that a stray element cannot fake** — an
interval-overlap test is defeated by ONE outlier at 20 m in a 63,000-element building. Why not "the
ladder with the most bands": that would flip Terminal from elevation (44 rungs) to center_z (6) and
change a building #1551 got right. `rungsUsed` (populated ladder rungs, distinct datums) and
`bandsUsed` (distinct NAMES) are deliberately different numbers and the code says so: Terminal's 44
rungs carry 22 names because one name sits on two rungs 1e-6 apart.

### The §-lines (primary evidence, PRIMAL LAW clause 3) — Hospital_meta.db, after
```
§STOREY_DATUM mode=DECLARED source=center_z declaredStoreys=7 labelsInDB=8 bandsUsed=7 relabelled=14153/63182 ladder=7[168.735..201.429] elementBaseZ=63182[156.606..202.826 median=181.309] rejected=elevation:24[0.000..34.000] vs#1551=CHANGED(elevation→center_z) — a level is [datum_i, datum_i+1) and the element sits in the band containing its BASE
§STOREY_DATUM_FRAME candidates: elevation:24[0.000..34.000]=OUT_OF_FRAME(rungsUsed=1 below=0 above=63182) center_z:7[168.735..201.429]=IN_FRAME(rungsUsed=7 below=4449 above=2) — test: the ladder span must contain the element base-Z median (…); first IN_FRAME wins, elevation before center_z
§STOREY_DATUM_FRAME_REJECT source=elevation ladder=24[0.000..34.000] vs elementBaseZ median=181.309 [156.606..202.826] below=0 above=63182 rungsUsed=1 — not this geometry's vertical frame; banding on center_z instead
```
`vs#1551=same` on every other building is the per-building NO-OP proof; a DECLARED ladder that puts
everything in one band prints `verdict=NO-OP` (clause 4). `_GANTT_CACHE_VERSION` 38→39 so a persisted
v38 grid (authored on the collapsed ladder) regenerates; `sw.js` v1133.

### Measured — `scripts/probe_tm_reveal_shipped.js`, FRAMES=3118 FPS=15, same engine before/after
| DB the viewer loads | bands | tasks | totalDays | days/frame | Substructure on screen |
|---|---|---|---|---|---|
| Hospital (`Hospital_meta.db`) | **1 → 7** | **7 → 36** | **509 → 334** | **0.163 → 0.107** | 67 f = 4.5 s → **103 f = 6.9 s** |
| Hospital, user's `Hospital_silent.db` | **1 → 8** | **7 → 41** | **515 → 329** | **0.165 → 0.106** | 67 f = 4.5 s → **104 f = 6.9 s** |
| Terminal (`Terminal_meta.db`) | 22 → 22 | 70 → 70 | 101 → 101 | 0.032 → 0.032 | 62 f = 4.1 s, same |
| Clinic (`Clinic_meta.db`) | 3 → 3 | 18 → 18 | 136 → 136 | 0.044 → 0.044 | 69 f = 4.6 s, same |
| pre-#1551 reference (coordinator, same probe) | 8 | 42 | 318 | 0.102 | 108 f = 7.2 s |

Terminal and Clinic are byte-for-byte the same lines before and after. The witness adds LTU_AHouse
(INFERRED, no storey rows, `vs#1551=same`), Duplex + Duplex-patched (INFERRED / DECLARED elevation
4 rungs, `same`), HHS + HHS-patched (DECLARED center_z 3 / 4 rungs, `same`) — 14 rows, 10/10 PASS,
red control detected: `node viewer/tests/witness_storey_datum_frame.js`.

Days/frame lands within **5 %** of the pre-#1551 pace (0.107 vs 0.102); the remaining +16 d
(334 vs 318) is on a grid that now carries #1551's `§TPL_LADDER_BRIDGE gatedByBridge=16/36`
(the pre-#1551 engine had no bridge). That attribution is by the log line, not decomposed further here.

### ⛔ The residual between the user's DB and the OCI one — MEASURED and NAMED, not closed
User: *"The local saved DB is supposedly similar to the OCI one. Thus its 4D schedule should be the
same."* After the fix both choose `DECLARED / center_z`, the elevation set is rejected on both, and
`silent-matches-meta` (same mode, same source, meta's level names ⊆ silent's) PASSES. They are still
**7 vs 8 bands, 36 vs 41 tasks, 334 vs 329 days**, for three named reasons:

| # | residual | meta (OCI + patch) | silent (user) | cause |
|---|---|---|---|---|
| 1 | `STC_Level_*` rows | **7**, datum = mean wall **CENTRE**-z (Level 1 = 168.735) | **8** incl. **Level 7A**, datum = mean wall **BASE**-z (Level 1 = 166.088) | meta's rows are the **pre-#1552** walker, baked into `buildings/patches/Hospital_meta.db.sql` lines 9510-9516; silent's are the post-#1552 walker (§K.4/§L item 1, "shipped DBs/baked patches still hold the old datum" — still true). The probe's own `§STOREY_DATUM_FLOOR` lines on meta compute the floor datums at runtime (Level 1 meanBaseZ=166.063 … Level 7A 196.470) but nothing writes them back |
| 2 | schedulable elements | 63,182 | 63,415 (+233) | 233 `IfcCurtainWall`/`IfcStair`/`IfcRoof` (178/31/24) have NO `element_transforms` row in meta (→ `§4D_NOGEO`, dropped) and DO in silent (base-Z 164.7 … 202.8) — silent was saved after `composeGhostsFromAggregates` ran client-side |
| 3 | `elements_meta.storey` labels | 9 (`Level 1…7`, `7A`, `Unknown`) | 21 (adds `… Ceiling`, `… TOS`) | irrelevant in DECLARED mode (labels are advisory) — it is why the two would have DIVERGED under INFERRED, and why the datum path is the right one |

Silent also carries 735 extra `IfcOpeningElement` rows (excluded by the recipe) and a `schedules` row
at `gen_version=37` (discarded on load, `_GANTT_CACHE_VERSION` now 39).

**Closing residual 1 = regenerating the 7 STC INSERT lines of `buildings/patches/Hospital_meta.db.sql`
from the current walker (8 rows, floor datum) and shipping through `scripts/oci_patch_gate.js --upload`.**
That is a production-bucket write (§L item 1's carried-forward item) and was NOT done in this lane —
⛔ user decision. Once done, meta and silent ladders agree to ~2–4 cm (the 233-element wall-set
difference moves Level 1 by 0.025 m) and the task grids should match to the element-count residual.

### ⚠ Lead, not verified — #1551's "Terminal 22 → 6"
Today's shipped line on `Terminal_meta.db` reads `declaredStoreys=44 … bandsUsed=22` before AND after
this fix. #1551's PR text claims Terminal went 22 → 6. `Terminal_extracted.db` has 6 `center_z` rows
and no `elevation` column; `Terminal_meta.db` has 67 `elevation` rows → 44 rungs. The "6" looks like
the same extracted-vs-meta landmine measured on the other building. Not chased here.

### Ownership — added to §I
| the question | OWNER — call this | never |
|---|---|---|
| **which declared storey ladder bands the elements — and is it in the geometry's vertical frame?** | `schedule_author.js` `_storeyDatumCandidates(db)` → `_chooseStoreyDatum(cands, baseZs)` (exported; the §STOREY_DATUM / §STOREY_DATUM_FRAME / §STOREY_DATUM_FRAME_REJECT lines are its report). Witness: `viewer/tests/witness_storey_datum_frame.js` | pick a column by which one is non-empty (#1551); merge the two families into one ladder (they can be 166 m apart); judge it on `*_extracted.db` only |

---

# §J SESSION 2026-08-27 — WHAT IS ZERO, WHAT WAS RETRACTED, AND THE ONE GAP THAT KEEPS PRODUCING FICTION

## §J.0 ⛔ REVIEW THIS SPEC BEFORE EACH THINKING PASS — NOT ONCE AT SESSION START
**USER RULING 2026-08-27: *"Update the specs first, review each time u set out to think."***

Reading this file once and then working from memory is what produced §J.2's three retractions —
all three are errors this file ALREADY listed, and it had been read that same morning. The rule is
therefore not "read the spec at startup". It is: **before each new measurement or claim, re-open
§E and §I and check the thing you are about to compute against them.** A proxy you are about to
invent is almost certainly already in §E's table of proxies that were measured wrong.

Corollary, the user's own words: ***"If the needle has not moved, then stop and review the model
again and again. Dont put square pegs in round holes."*** A metric invented on the spot to fill a
hole where a RULE should be is the square peg. Write the rule first.

## §J.1 ✅ WHAT IS AT ZERO, AND HOW IT IS CHECKED
Witness: **`bim-ootb viewer/tests/witness_day0_integrity.js`** (§W_D0), run off the persisted cache.
~~Fleet verdict went **4 PASS / 9 FAIL / 3 INCONCLUSIVE → 14 PASS / 0 FAIL / 2 INCONCLUSIVE.**~~

⛔ **C2 / C3 / C4 IN THE TABLE BELOW ARE VOID — STRUCK 2026-09-02 (queue item A-0). They judged
`displaySchedule`, a map `viewer/time_machine.js` has ZERO readers of (`4D_GANTT_TM_REFACTOR.md`
§FUTURE item 2 §TM_REVEAL_SHIPPED), on a cached run that additionally never ran the CPM display
pass at all (no `opts.displayRemap` — §CACHE_PLAYED_LAYER §G.1). C1 is band GEOMETRY and is
layer-independent: it STANDS.** Re-baselined on the layer the film actually plays (bim-ootb PR
#1607; `§W_D0` now prints `layer=` on every line, and `LAYER=display` re-points it deliberately):

**`§W_D0_VERDICT layer=played claims=16 PASS=5 FAIL=8 INCONCLUSIVE=3 RED`** — 4 buildings ×
4 claims. (16, not the 13 of the §"State, honestly" note below: that table was read off a cache
covering only three buildings, so the fourth contributed a single INCONCLUSIVE instead of four
claims. Cache coverage, not a code regression — which also answers B-1's premise.)

| claim | Duplex | HHS | Hospital | Terminal |
|---|---|---|---|---|
| C1 BAND MODEL (layer-independent) | INCONCLUSIVE (no `spatial_structure`) | FAIL 3 declared / 4 bands | INCONCLUSIVE (no `spatial_structure`) | FAIL 6 declared / 22 bands, 5 datum collisions |
| C2 DAY-0 PURITY | FAIL judged=14 bad=3 | PASS judged=75 | **PASS judged=51 impure=0** | FAIL judged=245 bad=9 (IfcBeam) |
| C3 DAY-0 SUPPORT | FAIL judged=2 bad=1 | FAIL judged=4 bad=3 (IfcSlab) | INCONCLUSIVE judged=0 | PASS judged=9 |
| C4 NO EARLY MEP (3 d) | FAIL judged=160 bad=83 | PASS judged=237 | PASS judged=152 | FAIL judged=525 bad=4 |

**Why the strike matters even where the verdict LETTER is unchanged:** running the same witness with
`LAYER=display` gives the same 5/8/3 pattern but different populations and counts — HHS C3
`judged=4 bad=3` (played) vs `judged=11 bad=5` (display); Duplex C4 `bad=83` vs `88`; Terminal C2
`bad=9` vs `10`; HHS C2 `judged=75` vs `86`. A coincidence of verdicts is not evidence the old
measurement was right. Hospital C2's played `judged=51` is `555/11` — exactly the value
§TM_REVEAL_SHIPPED predicted for the tiled layer, which is the cross-check that this is the right map.

~~ORIGINAL TABLE, kept for the trail only — do not quote C2/C3/C4 from it:~~

| claim | what it asserts | ~~result~~ |
|---|---|---|
| C1 BAND MODEL | bands used == storeys the IFC declares | PASS Duplex 4/4 · HHS 3/3 · Terminal 6/6 · Hospital INCONCLUSIVE |
| ~~C2 SUB FIRST~~ | nothing starts before the Substructure it sits on finishes | ~~PASS ×4~~ |
| ~~C3 DAY0 SUPPORT~~ | nothing on screen is unheld — **split ORDER vs MODEL** | ~~**ORDER = 0 on all four**~~ |
| ~~C4 NO EARLY MEP~~ | no MEP phase on DAY 0 | ~~PASS ×4~~ |

Plus, measured directly off the shipped contact graph: **of 718 `IfcColumn` that rest on a real
`IfcSlab`/`IfcFooting`, ZERO start before that support finishes** (Duplex 0/0, HHS 0/221,
Hospital 0/378, Terminal 0/119).

**The two INCONCLUSIVE are honest unknowns, not hidden failures**, and the verdict refuses to print
GREEN because of them: Hospital has no `spatial_structure` table (nothing to check bands against),
and all 87 of its DAY-0 elements are seq-1 ground-bearing footings (nothing for C3 to judge).

**Fixes that got there** (all on `feat/day0-unsupported-probe`, pushed):
- **`§STOREY_DATUM`** — a level is a DECLARED datum, band *i* = `[datum_i, datum_i+1)`, element
  assigned by its own BASE. Replaced nearest-median-Z-of-elements over a pool of raw labels
  (unbounded, and the inference §PATHS NOT TO TAKE #7 forbids). Terminal **22 bands → 6**.
  No declared storeys ⇒ unchanged, and the §-line says so.
- **`tools/extract.py`** now writes `IfcBuildingStorey.Elevation` — it never did. ⚠ **That was not
  what kept `deriveStoreyMergeMap` from running on the shipped fleet**, and the extractor fix does
  not by itself reach any shipped building: the patches carrying that datum existed already and had
  never been UPLOADED to OCI. Fixed + verified against the served bytes 2026-08-27 — see §I.3
  §CLOSED. The extractor fix still matters for the NEXT extraction; it is not the live path.
- **`§TPL_LADDER_BRIDGE`** — the across_levels ladder now bridges past dropped phases, as
  `_empty_phase_rule` already required for the within_level chain. Duplex's
  `Superstructure @ Level 1` had been starting at h0.0 **in parallel with** `Substructure @ T/FDN`.
- Three name overrides, each MEASURED fleet-wide before the pattern was written:
  `foundation_wall_substructure` (Duplex 7, Hospital 28), `finish_floor_finishes` (Duplex 14),
  `stair_member_architecture` (Duplex 4 of 4; **0 of 9,019** `IfcMember` elsewhere).
- **`scripts/cache_4d_run.js`** — run the pipeline ONCE per building, persist `witness.log` +
  `run.json`, key on the DB *and* the content of every input module. 119,568 elements read back in
  **0.43 s**. Every probe reads the cache.

## §J.2 ⛔ THREE RETRACTIONS IN ONE SESSION — ALL THREE ALREADY IN §E
Recorded because the pattern matters more than any one of them.

| I claimed | reality | §E row it violated |
|---|---|---|
| "column before slab by 506.3h", ~80 fleet type-order inversions | **fiction** — the type buckets were filled by the bbox rule, so Hospital's 33,324 `IfcPlate` metal deck and its `IfcCovering` ceilings landed in "slab". I was timing ceilings. Hospital L1 really has 3 `IfcSlab` @293.3h vs 254 `IfcColumn` @300.3h — correctly ordered | *a proxy will be wrong on some building* |
| 92,397 bearing violations | counted every bearing PAIR as a constraint; any-of gives 6,734 | **row 4** — "an element needs ONE support, not all — 1961 → 95" |
| ground exemption = `grounded[i]` | shipped rule is `seq !== 1` (`schedule_gate.js:1210`) | §I.2 — they answer different questions |

**The common cause is not carelessness.** Each time, a number was needed and no RULE existed that
said what the number should be, so a metric was invented on the spot. An invented metric is a proxy,
and §E's whole point is that proxies here are wrong.

## §J.3 ⛔ THERE ARE TWO MODELS AND ONLY ONE RUNS
Verified 2026-08-27, not inferred:
- **`bar_model.js` + `bar_needs.js` are DEAD CODE.** No HTML loads them, `sw.js` does not precache
  them, and nothing outside their own three witnesses calls `BarModel.*`. PR **#1542 is MERGED**.
- They already contain the answers this lane keeps re-deriving: the trade ladder, `phaseOrder`
  ("EXTRACTED, never authored" — a phase's rank is the min sequence its own classes carry),
  `§BAR_LEVEL_FROM_GEOMETRY` ("the IFC storey STRING is not the location … geometry wins"), and
  `§BAR_LEVEL_BANDS`, the granularity **dial** — "a knob, not a defect".
- **`schedule_author.js` is what actually runs**, and it is what §J.1 fixed.

This is §G.2's failure repeating: *"the whole template path shipped, was witnessed, and was NEVER
CALLED — green and dead at the same time."* It happened again, with the Bar model.
⛔ **Establish which model is the target BEFORE touching either.** §J.1's `§STOREY_DATUM` and the
Bar model's `correctLevelsByGeometry` are two independent answers to the same question, in two
modules, one of which cannot run.

## §J.4 ⛔ THE GAP THAT PRODUCES THE FICTION — THE ONE THING NOT IN THIS REPO
**There is no stated rule for what a correct construction sequence must satisfy beyond DAY 0.**

DAY 0 has four written claims, so DAY 0 could be driven to zero. Past DAY 0 there is nothing, so
every measurement becomes a fresh modelling problem and §J.2 is the result.

Concretely unknown, and therefore unjudgeable today: **6,734 bearing-order violations over 106,027
judged pairs** (`scripts/knob_sweep.js`, any-of, off the shipped contact graph). That number is
REPORTED, not called a defect and not called a residue — nothing says which it is.

What the rule has to fix, in the terms it must be written in:
1. **At what granularity does precedence bind** — element, trade, task, or level?
2. **What may legitimately run concurrently** — when is an overlap a real crew working two fronts,
   and when is it a defect?
3. **Which relation carries it** — the bearing graph, the declared phase order, or the trade ladder?
   (`§KNOB_SWEEP` shows the *type* order is an EXPRESSION of the support relation, not a separate
   fact — a column stands on the slab because the slab bears it.)

Until 1–3 are written here, every number past DAY 0 is a metric someone invented, and §J.2 says what
those are worth. **Write the rule, then measure.** Not the other way round.

## §J.5 THE SWEEP HARNESS EXISTS AND IS CHEAP
`scripts/knob_sweep.js` — turn a variant into a dial, run the whole fleet at every setting, and look
for a PLATEAU where the buildings agree, instead of hand-picking a constant (every hand-typed
threshold in this lane has been measured wrong). Runs off the cache in seconds.
Dials **not** swept, named rather than faked because each needs a pipeline re-run per setting:
`§STOREY_DATUM` mode, the §S64 support top bound (§H.2a — 32.0 % of Hospital's bearing contacts),
and `bar_model.js` `§BAR_LEVEL_BANDS` granularity.

---

# §K THOROUGH REVIEW — SPEC vs MODEL vs PLAN (2026-08-27, user-requested)

## §K.1 THE MODEL IN THIS FILE IS NOT THE MODEL THAT RUNS
§A states the model: `Node { children[], work }`, a tree **Building → Level → Phase → Layer →
Element**, and — explicitly — ***"No edges emitted — sibling order IS the order."***

| | implements §A? | runs? |
|---|---|---|
| **`bar_model.js` `buildTree()`** — `GroupBar('Project')` → level → task → `ElementBar` leaves | **YES. This IS §A's tree.** | **NO — dead code (§J.3)** |
| **`schedule_author.js` `instantiateTemplate()`** — per-(phase × level) tasks + `edges.push()` ×2 | **NO. It is a task GRAPH with explicit edges**, the thing §A says the model does not have | **YES — this is production** |

**That single row explains the whole lane.** Every §H/§J fix, including `§TPL_LADDER_BRIDGE`, was a
repair to *edge* wiring in a model whose own spec says there are no edges. The spec and the running
code have been describing two different machines, and the reason §J.2's metrics kept being invented
is that they were being invented against a model that is not the one executing.

⛔ **Before any further scheduling work: decide which of the two is the target.** They are not
complementary — §J.1's `§STOREY_DATUM` and `bar_model.js`'s `correctLevelsByGeometry` are two
independent answers to one question, in two modules, one of which cannot run.

## §K.2 THE PLAN ALREADY EXISTS AND I DID NOT FOLLOW IT
**`prompts/4D_BAR_MODEL.md` §10.3** is the written plan, in order, and it opens with
***"Do not wire anything live until 1–3 are done."***

1. **Kill the scratchpad probes** — fold them into `witness_bar_schedule.js`. Called *"the single
   highest-value task in the lane."*
2. **Audit every witness in the lane against §10.1 rule 1** (any predicate that duplicates a shipped
   one instead of calling it). *"That is the error that produced the only retraction so far, and it
   produced it twice in one day."*
3. Verify `witness_bar_needs.js`'s anti-re-derivation gate directly.
4. Terminal midair **336 vs a shipping 226** — the only axis where the model still loses.
5. The storey-injection gap (below).

**Measured against that plan, this session did none of 1–3** and instead re-derived item 5's
diagnosis by a different route. §J.2's three retractions are precisely what item 2 exists to prevent.

## §K.3 ⛔ ITEM 5 ALREADY NAMED THE FIX — AND SAID MY EXTRACTOR CHANGE WAS NOT NEEDED
§10.3 item 5, **corrected 2026-08-26, the day before this session**:

> *"The mechanism is NOT missing and needs NO source IFC and NO extractor change.
> `viewer/lib/room_walker.js` `writeRooms()` already injects storey rows from the DB alone …
> It has already run on Terminal: **all six of Terminal's storey rows are its output — Terminal has
> ZERO real extracted storeys.** §S18 `deriveStoreyMergeMap` DOES run; it merges 0 because the
> injector emits a storey row **only where it compiled a room** (`room_walker.js:1352`) …
> **The gap is that one line**, in the room lane's file, not in extraction and not in the scheduler."*

**VERIFIED DIRECTLY this review** (the doc is right): every Terminal `IfcBuildingStorey` row is
`guid='STC_…'`, `object_type='COMPILED'` — the injector's own stamp. This is the "room injection"
the user named; it is `writeRooms()`, which is why grepping for "room injection" found nothing.

So `tools/extract.py`'s `elevation` write (§J.1) is **not wrong, but it is not the gap** — the spec
said so a day earlier and I did not read it. It helps only future extractions.

## §K.4 NEW, MEASURED IN THIS REVIEW — THE INJECTED DATUM IS MID-WALL, NOT A FLOOR
`room_walker.js:1191` — `stZ[st] = mean(w[2])`, and `w[2]` is a wall's **centre**-z. A storey datum
must be its FLOOR. Measured against Terminal's own slabs:

| storey | injected datum | median slab top | error |
|---|---|---|---|
| Aras Tanah | 17.927 | 14.768 | **+3.159 m** |
| Aras 01 | 24.717 | 22.768 | +1.949 |
| Aras 02 | 28.577 | 26.768 | +1.809 |
| Aras 03 | 32.537 | 30.768 | +1.769 |
| Aras 04 | 37.142 | 34.768 | +2.374 |
| Aras Bumbung | 39.779 | 39.141 | +0.638 |

⛔ **Consequence for what §J.1 shipped:** `§STOREY_DATUM` bands by `base_z ∈ [datum_i, datum_i+1)`.
An element standing on the Aras 03 floor has `base_z ≈ 30.77` against an Aras 03 datum of 32.537, so
it lands in the **Aras 02** band. **Every element on every floor is assigned one level DOWN,
systematically.** The §W_D0 claims still pass because the bands stay disjoint and monotone — the
offset is uniform — which is exactly why a passing witness did not catch it. *A green suite over a
shifted datum is §J.0's square peg wearing a rosette.*

**The data for the correct value is already in hand:** the walker's wall row is
`[cx, cy, cz, bx, by, bz]`, so a wall's base is `w[2] - w[5]/2`. The floor is the base, not the centre.

## §K.5 ⛔ PLAN — IN THIS ORDER, AND IT IS NOT MINE
Follow `4D_BAR_MODEL.md` §10.3. Nothing below reorders it; the only additions are §K.1 and §K.4.

0. **Decide the target model (§K.1)** — Bar model or template path. Everything else forks on it.
   This is the one item that is a *decision*, not work.
1. §10.3 #1 — fold the scratchpad probes into `witness_bar_schedule.js`. `scripts/knob_sweep.js`
   and `scripts/probe_day0_unsupported.js` from this session are in the repo and gated by nothing;
   they are the same debt.
2. §10.3 #2 — audit every witness in the lane for a re-derived predicate (§I.1 lists three live
   copies of "S bears T"; two of them disagree with the third).
3. ✅ **§K.4 DONE (witness) 2026-08-27 — bim-ootb PR #1552.** Datum is now the FLOOR
   (`room_walker.js:1191` → `mean(w[2] - w[5]/2)`) and a storey row is emitted for every storey
   walked (`:1353` guard removed). Fleet 22/22 storeys match mean wall base-z, 0/22 centre-z;
   Terminal max datum error 3.072 m → 0.511 m; rows recovered Terminal 6→7, Hospital 7→8.
   **Full evidence + the two carried-forward ⛔ items (shipped DBs/baked patches still hold the old
   datum; `compile_rooms.py` py/js lockstep still unfixed) are in §L item 1 — read it there.**
   Then §10.3 #5.
   Predicted payoff for the second alone (SIMULATED in §S72.1, **not measured**): Terminal midair
   **336 → 48**, span 126 → 105 d.
4. §10.3 #4 — Terminal midair 336 vs shipping 226, the only axis where the Bar model still loses.
5. Only then re-baseline, and only then judge the 6,734 (§J.4) — which still has no rule to be
   judged against.

---

# §L ⛔ START HERE — SESSION HANDOFF 2026-08-27 (FINAL, end-of-session — supersedes all earlier §L
edits made during the day, which are now history, not the plan)

**Everything below "The decision that gated everything" down to "State, honestly" describes
mid-session state and is superseded by this block. Read this first.**

## ✅ Live in production right now — verified merged, not just opened
All seven confirmed `MERGED` on `bim-ootb` (checked via `gh pr view` against the actual repo, not
recalled from chat): **#1552** storey datum is the floor · **#1554** W-PERS split-mode blind spot
closed · **#1555** the IndexedDB data-loss bug (LRU evictor deleting user edits) · **#1556**
LevelDeriver wired, flag OFF · **#1557** elevation deploy-gap closed for Hospital/Terminal/Duplex ·
**#1558** cache now persists the task grid · **#1560** the calibration-fix-equals-rejected-revert
proof. `bim-ootb`'s `deploy-pages.yml` auto-publishes on merge to `main` — no separate manual step
like this repo's docs, so all seven are live on the public site, not just merged to git.

**⚠ Loose end, not yet closed**: `bim-ootb` PR **#1551** is still open and stale — it carries an
OLDER, pre-correction version of `buildings/patches/Duplex_extracted.db.sql` that #1557 already
superseded with the correct DROP+CREATE form. Nobody has closed it. Do that before it confuses a
future session into thinking it's still live work.

## ⛔ Explicitly NOT done, don't assume otherwise
- **The Schedule Editor (`viewer/schedule_editor_ui.js`) has had ZERO commits and zero verification
  all day.** Still the oldest unanswered item in this whole file.
- **Live editor test (2026-08-27, HHS_Office_Federated) confirmed the INLINE TM Gantt editor works**
  (drag/clamp/cascade/persist all verified in real `§`-logs) — do not confuse this with the standalone
  Editor above, which remains untouched. One gap found and queued (not fixed): `blockedBy=TASK_X(FS)`
  is computed and logged on every clamp but never shown on screen — `4D_GANTT_TM_REFACTOR.md` §FUTURE
  item 6.
- **§I.5's design-review audit: Stage 1 and Stage 2 DONE and merged** (bim-ootb PR #1561 — the PRIMAL
  LAW witness-blindness; PR #1562 — the stair-flight support-pool gap, +204 floating fleet-wide).
  **Stage 3 hit its own stop condition** (reorders 86–98% of elements, most tasks) **and the user has
  since approved proceeding** — task windows/total days are unchanged on all three measured buildings,
  which is why. **Stages 3 (apply), 4, and 5 are NOT yet done** — they, plus the dead-air/
  reveal-distribution fix (also user-approved) and item 6 above, are all bundled into ONE task:
  ➡ **`4D_GANTT_TM_REFACTOR.md` §FUTURE item 7 — read that file, not this note, for the actual plan.**
  It requires posing a plan before any code, on purpose — don't skip that step because this note
  makes the scope sound settled.

**Read §G.0 (regain context) → §I (ownership table, now includes §I.5's audit) → §K (the mid-session
review) → `4D_GANTT_TM_REFACTOR.md` §FUTURE item 7 (the actual next task, plan-first).**

## ✅ The decision that gated everything is MADE
**USER RULING 2026-08-27: the canonical model is the TEMPLATE PATH — `schedule_author.js`
`instantiateTemplate()`.** See the banner at §A.
- `bar_model.js` / `bar_needs.js` are **not the target**. Their measured findings still read well;
  their code is not where work goes.
- **§K.1 is superseded.** It said the fixes went into the wrong model; with the ruling they went
  into the right one, and it was the SPEC (§A) that was stale. §A now carries that correction.
- **`4D_BAR_MODEL.md` §10.3 items 1-4 are no longer the plan** - they are Bar-model work. Item 5
  stands (it is about `room_walker.js`, which feeds the template path too).
- The "no edges emitted" line in §A describes the dead model. The canonical model emits edges and
  that is correct by ruling. Do not re-litigate it.

## ⛔ Therefore the plan is now, in order
1. ✅ **DONE (witness) 2026-08-27 — §K.4 datum fixed.** bim-ootb **PR #1552**, branch
   `fix/room-walker-storey-datum`, one file (`viewer/lib/room_walker.js`) + `scripts/probe_storey_datum.js`.
   - `:1191` now writes `mean(w[2] - w[5]/2)` — the FLOOR. `§STOREY_DATUM_FLOOR` logs centre and
     base side by side so the pair is never hand-re-derived again.
   - `:1353` guard removed; `§STOREY_ROW_EMIT walked/withRooms/withoutRooms` reports what the old
     guard would have dropped, and prints VACUOUS when nothing passed the >=3-wall gate.
   - **MEASURED** (`scripts/probe_storey_datum.js`, datum vs that storey's own median slab top).
     Terminal: Aras Tanah +3.072→+0.511 · Aras 01 +1.947→+0.146 · Aras 02 +1.779→+0.102 ·
     Aras 03 +1.770→**+0.001** · Aras 04 +2.374→+0.200 · Bumbung +0.638→−0.000. Fleet **22/22**
     storeys now equal mean wall BASE-z, **0/22** equal mean centre-z (was 22/22 centre).
   - Rows recovered: Terminal 6→7 (`GROUND FLOOR LEVEL`), Hospital 7→8 (`Level 7A`, a mezzanine at
     196.470 that had NO band between Level 6 @192.159 and Level 7 @199.814).
   - Guard removal verified safe: it keyed on ROOMS, not on DB presence, so it never prevented
     duplicates (Terminal already ships 6 same-name real rows per storey); those real rows carry
     `center_z` NULL on every shipped DB so the consumer's `center_z IS NOT NULL` filter never sees
     them. `stZ` only holds storeys past the >=3-wall gate, so no unwalked storey can be emitted.
   - Regression: `witness_s50_cell_engine` bad=0 · `witness_s55_identity_vs_cell` 6/0 ·
     `witness_stair_flight_assembly_merge` 4/0 · `witness_midair_zero` **10 pass/3 fail BOTH before
     and after** (run on unmodified main to confirm) with judged numbers byte-identical — those 3
     locks are item 2's re-baseline, not a regression.
   - ⛔ **Still carrying the OLD datum:** the shipped `buildings/*_meta.db` and the baked
     `buildings/patches/Terminal_meta.db.sql` (6 rows: 10.066/13.838/17.819/22.629/25.126/3.049, no
     `GROUND FLOOR LEVEL`). This PR fixes the GENERATOR only — regenerating those is a DB-content
     change and needs the patch + self-heal-loader flow.
   - ⛔ **py/js lockstep diverged:** `scripts/compile_rooms.py:1232` (bug 1) + `:1267` (bug 2) and
     the stale `build/room_walker.js:1169`/`:1253` still carry BOTH bugs. They stay in lockstep with
     *each other*, so `build/witness_room_walker_parity.js` (which compares those two, not the
     bim-ootb file) is unaffected today — but they should be mirrored, with a `ROOM_WALKER_V` bump.
2. **Re-baseline `§W_D0` after 1** - the current 14 PASS sits on a datum that is uniformly ~2m high.
3. **Write the sequence rule (§J.4)** - granularity of precedence, what may legitimately overlap,
   which relation carries it. Until it exists the 6,734 cannot be judged, and inventing a metric to
   judge it is what produced §J.2's three retractions.
4. Only then re-open anything else.

## ✅ THE TM WIRING IS SOUND — TRACED 2026-08-27, bim-ootb PR #1553
**The question "does the canonical model reach the Gantt editor?" is ANSWERED: yes. Do not
re-trace it.** `instantiateTemplate` (`schedule_author.js:425`) → `_writeTemplateSchedule` (`:965`)
persists `tasks`/`task_elements`/`task_sequences` (`:1040-1055`) → `time_machine.js
buildTaskIndex()` (`:5290`) reads those same rows back (`:5341`, `:5347`) → `gantt_model.js
buildTasks()` (`:96`) draws each bar at its **task** window (`:167-176`, `spanFrom='task'`).
The hand-off is a DB round-trip, not an object hand-off — TM never sees `instantiateTemplate`'s
return value, and it does not need to.

**§G.2's "shipped, witnessed and NEVER CALLED" is CLOSED** — `§TPL_REACHED` is green on `main`
(all four production call sites pass `template:`, replay confirms `instantiateTemplateRan=true`).
`§TPL_WIRED` (PR #1548) fixed it. Do not re-open that contradiction; it is historical.

**What was actually wrong: three holes that let the canonical model be swapped for the dead one
SILENTLY.** All three fixed in PR #1553.
1. **`schedule_author.js:715` — the fork was silent.** Falsy `opts.template` fell through to
   `SG.deriveZones` with no log line, so no downstream number was attributable to a construct.
   Both branches now emit **`§TPL_MODEL model=template|legacy-deriveZones`**. *Grep this tag
   before trusting any 4D number — it is now the cheapest way to know which model you are reading.*
2. **`rates/4D_template.json` was NOT in `sw.js PRECACHE_ASSETS`** — one failed fetch of the template
   silently drops the canonical model for a whole session. Precached; `CACHE_VERSION` → v1090.
   ➡ **FULL ACCOUNT MOVED 2026-08-27 (consolidation L2) to `prompts/4D_GANTT_TM_REFACTOR.md` §5c.**
   It is a precache/**delivery** fact; that file's 🗺 DEBUG MAP owns delivery and witness wiring.
3. **`witness_gantt_edit_coherence.js:189` passed no `template:`** — the flagship editor witness, the
   one CLAUDE.md names first, measured all 10 claims on the DEAD model. Now builds its fixture from
   the template; new claim **G-COH-10** asserts the canonical model is what was judged.
   ➡ **FULL ACCOUNT MOVED 2026-08-27 (consolidation L2) to `prompts/4D_GANTT_TM_REFACTOR.md` §5c** —
   **witness-wiring**, same reason. ⚠ **This pointer is load-bearing:**
   `viewer/tests/witness_gantt_edit_coherence.js:190` cites **this file's §L** in a live code comment,
   so the trace stays here deliberately; it is not orphaned prose.

**MEASURED (Duplex) — the two models genuinely differ under an edit:**

| | model | grid | move cascaded | result |
|---|---|---|---|---|
| before | `§AUTHOR_ZONES` | zones=21 edges=30 | **8** | 10 pass / 0 fail |
| after | `§AUTHOR_TPL` v=1.2.0 | tasks=20 edges=29 (withinLevel=16 acrossLevels=13) | **16** | 11 pass / 0 fail |

The canonical model's DECLARED edges propagate an edit to twice as many downstream tasks.
**RED CONTROL:** template moved aside → `model=legacy-deriveZones`, G-COH-10 FAILS (10/1, exit 1)
while the other ten still pass. That asymmetry is precisely why this was invisible for a session.

### ⛔ OPEN, found by this trace — do NOT re-discover
- **24 of 35 witnesses/probes that call `materializeZones` still pass no `template:`**, so they
  judge the dead model. Only `witness_gantt_edit_coherence` (this PR), the four template-specific
  tests, and 4 scripts are canonical. This is §K.2 item 2's audit with a concrete population — run
  the census with: `grep -rl materializeZones viewer/tests/*.js ./witness_*.js scripts/*.js` and
  check each for `template:`. Some may legitimately pin legacy behaviour; that is a judgement per
  file, which is why this PR did not convert them wholesale.
- **`witness_zone_cpm_duplex.js:40` hardcodes an absolute path to a DEAD scratchpad dir** from an
  old session, so it fails on unmodified `main`. Pre-existing, same bug class as the
  `38-offline-pwa.spec.js` `VIEWER_URL` item in CLAUDE.md.
- **`schedule_author_ui.js:288` reads `window._4dTemplate`**, published ONLY by `time_machine.js
  :4128` inside `_load4DTemplate()`. The author drawer is TM-owned (`time_machine.js:2912`) so the
  normal flow is safe, but the drawer opening while the template fetch is still in flight is an
  unguarded race that would silently author the dead model. Not fixed — needs a decision on whether
  the author UI should await the load or refuse.
- **`_writeTemplateSchedule`'s `displaySchedule` return (`:1144`, the `remapSolveToTasks` output)
  has NO production consumer.** The live movie re-derives its own element times via
  `_tmRescaleToTaskWindow` (`time_machine.js:4913`). Two implementations of one idea; only the DB
  task windows are shared. §B calls that rescale "PROJECT rewriting SOLVE's times" — it is still
  live on the element path, and §S8b measured it as manufacturing 100% of played floating.

## State, honestly
- ⛔ **STALE 2026-08-27 (§FUTURE item 7 stage 2, bim-ootb PR #1568) — this "DAY 0 is at zero" line no
  longer holds against current `origin/main`.** Re-run with a fresh cache: `§W_D0` now scores
  ~~`claims=13 PASS=4 FAIL=5 INCONCLUSIVE=4 RED`~~ — reproduces identically on unmodified `origin/main`
  (isolated in a clean baseline worktree), so nothing PR #1567/#1568 did caused it; something between
  whatever commit this 14/0/2 line was measured against and `a2e582b` regressed it. The "14 PASS"
  below is what this line ORIGINALLY reported and is being kept for the trail, not re-derived —
  whoever owns this lane next needs to re-baseline `§W_D0` for real (bisect the regression, don't
  assume the old table). ~~DAY 0 is at zero.~~ `§W_D0` **14 PASS / 0 FAIL / 2 INCONCLUSIVE** (`bim-ootb
  viewer/tests/witness_day0_integrity.js`). It refuses to print GREEN because two claims judged an
  empty population — both Hospital, both honest unknowns, not hidden failures.
  **⛔ RE-BASELINED 2026-09-02 (queue item A-0/A-9) — read §J.1's table, not this line.** `claims=13`
  was read off a cache covering only THREE buildings; with all four current it is
  **`claims=16 PASS=5 FAIL=8 INCONCLUSIVE=3`**, on the PLAYED layer. So the "13" figure is not a
  regression signature at all, and **B-1 must not be dispatched to bisect it** — there is nothing
  there to bisect. The genuinely open question is unchanged: C2/C3/C4's FAILs are real on the layer
  that plays, and nobody has yet attributed them to a commit.
- ✅ **0 of 718 `IfcColumn`** start before the slab/footing that bears them.
- ✅ **§K.4 FIXED 2026-08-27 (bim-ootb PR #1552)** — was: injected storey datum = mean wall
  CENTRE-z, 0.64–3.16 m above the floor, so `§STOREY_DATUM` assigned every element one level DOWN,
  uniformly (the witness passed anyway *because* the offset was uniform). Now mean wall BASE-z;
  fleet 22/22 storeys match base-z, Terminal max error 3.072 → 0.511 m. **The CODE is fixed but the
  SHIPPED DBs and baked patches still carry the old datum** — see §L item 1's two ⛔ sub-items
  before trusting any level-based number read off a shipped DB.
- ❓ **6,734 bearing-order violations / 106,027 pairs** — REPORTED, not judged. No rule exists
  saying what a correct sequence must satisfy beyond DAY 0 (§J.4). **Do not invent one to make the
  number mean something** — that is what produced §J.2's three retractions.

## Where the work is
`bim-ootb` branch **`feat/day0-unsupported-probe`** (pushed): `witness_day0_integrity.js`,
`cache_4d_run.js`, `knob_sweep.js`, `probe_day0_unsupported.js`, `probe_enclosure_geometry.js`,
`§STOREY_DATUM`, `§TPL_LADDER_BRIDGE`, 3 name overrides, `buildings/patches/Duplex_extracted.db.sql`.
`bim-compiler` **`fable/meshdb-livewire`**: this file, `CLAUDE.md` PRIMAL LAW + §I, `tools/extract.py`.

## Two habits this session paid for — keep them
1. **`node scripts/cache_4d_run.js`** runs the pipeline ONCE per building and persists
   `witness.log` + `run.json`. 119,568 elements read back in **0.43 s**. Never re-run
   `materializeZones` to answer a question a persisted run already answers, and **never wrap it to
   silence `console.log`** — the shipped `§`-log is the evidence (PRIMAL LAW clause 3).
2. **Re-read §E and §I before each new measurement**, not once at startup (§J.0). Three retractions
   in one session were all errors already listed in this file, which had been read that morning.

---

# §J.6 §W_D0_ATTRIBUTION — EVERY ONE OF THE EIGHT PLAYED-LAYER FAILS, ATTRIBUTED (2026-09-02, queue B-1)

**Scope.** B-1 was dispatched as "bisect a regression"; A-9 retired that premise (`claims=13` was a
three-building cache, not a regression signature). What was left open is what this section closes:
**`§W_D0_VERDICT layer=played claims=16 PASS=5 FAIL=8 INCONCLUSIVE=3 RED` — eight genuine FAILs,
none of them attributed.** Every FAIL below is classified as exactly one of *real DAY-0 defect* /
*modelling fact* / *witness defect*, with the measurement that says so. Nothing here weakens a claim.

**Evidence base.** The persisted cache, rebuilt on `origin/main` @ `99e260e8` for all four buildings
(codeKey `66dcc6a36d7a`, 119,568 elements: Duplex 1,119 · HHS 6,839 · Hospital 63,182 · Terminal
48,428), `§CACHE_LAYERS … played=<n> display=<n> display_authored=true` on all four. No bake, no
browser. The 16-claim table reproduced byte-for-byte off that cache before anything was changed.

## §J.6.1 THE TABLE

| # | claim · building | bad | ATTRIBUTION — the measurement | class |
|---|---|---|---|---|
| 1 | **C1 HHS** | excess=1 | The extra band is `Roof Level`, **n=45** (22 `IfcFlowSegment`, 10 `IfcFlowFitting`, 7 `IfcSlab`, 5 `IfcBuildingElementProxy`, 1 `IfcEnergyConversionDevice`, bz 0.90–14.32 m). HHS's `spatial_structure` holds **3 rows, 3 of 3 `object_type='COMPILED'`, guids `STC_Level_{1,2,3}`** — `compile_rooms.py` output, **not** an IFC declaration; the compiler synthesised no storey for those 45 elements. C1's premise ("storeys the IFC ITSELF DECLARES") is not what this DB holds. | **witness defect** (provenance) over a real extraction gap |
| 2 | **C1 Terminal** | excess=16, datumCollisions=5 | Elements carry **22 distinct collapsed storey strings across three parallel naming systems** — Malay `Aras Tanah/01/02/03/04/Bumbung` (4,178+2,307+2,769+4,880+748+43), English `GROUND FLOOR LEVEL`…`07 BEAM LEVEL (OBSERVATORY)` (1,288+388+481+498+10,235+10,950+2,542), and `Ceiling Level Kedai/01/02/03/04` reference planes (214+166+212+167+6,197). `spatial_structure` holds **6 rows, 6 of 6 `COMPILED`, all Malay**. The §I owner of "are two storey names one floor?" — `deriveStoreyMergeMap` — **cannot run at all**: it reads `r.elevation` and the shipped table has no such column (`§S18_STOREY_MERGE_FAIL no such column: elevation`, in today's run log, **on both** Terminal and HHS). | **modelling fact**, plus its owner structurally unable to run — see §J.6.3 |
| 3 | **C2 Duplex** | bad=3 | `IfcWallStandardCase` *"Basic Wall:Foundation - Concrete (435mm):140987"* (seq 5, Architecture Envelope, bz −1.250) · `IfcMember` *"Stair:Residential - 200mm Max Riser 250mm Tread:198878:1"* (seq 3, Superstructure) · `IfcSlab` *"Floor:Finish Floor - Ceramic Tile:171444"* (**13 mm** thick, tz−bz = 0.013). These are **exactly** the three populations bim-ootb PR **#1551**'s unmerged name overrides target: `foundation_wall_substructure` (Duplex 7 / Hospital 28), `stair_member_architecture` (Duplex 4 of 4; 0 of 9,019 `IfcMember` elsewhere), `finish_floor_finishes` (Duplex 14). Re-measured on today's cache, unchanged: `IfcWall* /foundation/` = Duplex 7/56, Hospital 28/1310, HHS 0/148, Terminal 0/333; `IfcMember ^Stair` = Duplex 4/4, HHS 0/1450, Hospital 0/7127, Terminal 0/442; `IfcSlab /finish floor/` = Duplex 14/21, 0 elsewhere. | **real DAY-0 defect — the fix already exists, on an OPEN, UNMERGED PR (#1551)** |
| 4 | **C2 Terminal** | bad=9 | 9 × `IfcBeam` *"M_Concrete-Foundation Beam"*, **`phase='Substructure'`**, in `TASK_Substructure_00_Aras_Asas` (the first task), `seq=3` / `STEEL_ERECTOR`. Day-0 phase purity is **245 of 245 Substructure** — the same log line that prints `phases{Substructure:245}` returns FAIL, because the **verdict reads `seq`, the detail reads `phase`**, and §GROUNDWORK_SLAB (`schedule_gate.js:201`, the shipped owner of "is this slab/beam groundwork") promotes `phase` and *deliberately leaves `seq`*. Census of that promotion, fleet-wide: **236 elements** (Terminal 233 = 213 `IfcSlab`/CONCRETE_GANG + **20 `IfcBeam`/STEEL_ERECTOR**, Hospital 2, Duplex 1). | **witness defect** (wrong relation) — see §J.6.2 W1, and the real secondary it exposes in §J.6.4 |
| 5 | **C3 Duplex** | bad=1 | The **same** `IfcMember` stair stringer as #3 (bz −0.085 → tz 3.015, a full storey). Its 11 contacts contain exactly **3 bearing candidates and all 3 are `IfcFlowSegment`** — *"Pipe Types:Waste:594985"* (bz −0.63), *"Pipe Types:Cold Water:583140"* and *":583067"* (bz −0.47), seq 7, starting +70.1/+82.5/+84.1 h. That is §S26.2's named *"an `IfcFlowSegment` under a wall bore that wall"* case verbatim. `_designatedSupport`'s pool election exists to reject it and does (it elects an `IfcSlab`, seq 4); C3 never asked it. | **witness defect** (elects its own support, §I "never") over the real #1551 defect |
| 6 | **C3 HHS** | bad=3 | HHS **models zero substructure**: its seq histogram is `{2:257, 3:1450, 4:274, 5:825, 6:464, 7:2666, 8:133, 9:727, 10:43}` — **no seq-1 key at all**, so the shipped ground exemption `T.seq !== 1` can never fire. The 65 m × 53 m ground slab *"Floor:STB 30.0:573302"* (bz −0.206) has **3 bearing contacts out of 6,193**: two `IfcStairFlight` (seq 6, +264.0/+264.7 h) and one pipe (seq 7, +816.2 h); the other **6,190 are carriers above**. `grounded` is 0 for it because **one single** `IfcFlowSegment` (*"Pipe Types:Standard:606532"*, bz −4.700, the model's absolute minimum) lies in its footprint below `bz − GAP` — §I.2's footprint-local relation, one pipe voiding a 3,400 m² slab. The other 2 are 30 mm `IfcSlab` stair treads (*"Stair:Massiv - Stufen Naturstein"*, bz 2.155) resting on that same seq-6 flight. | **modelling fact** (nothing in the model can bear the lowest slab) + the known §F *"rests on something classified into a later phase"*, **cross-task**, therefore outside `§TPL_LAYER_ORDER`'s within-task scope (§H.3) |
| 7 | **C4 Duplex** | bad=83 | 83 `IfcFlowSegment`(43)/`IfcFlowFitting`(40) MEP Rough-in, **all 83 at storey `T/FDN`**, **39 of them below grade** (bz down to −0.762) against a Substructure slab top of **+0.013** — under-slab plumbing, first start **day 2.00** in `TASK_MEP_Rough_in_T_FDN`. Duplex's whole programme is **13.00 days**, so C4's fixed 3-day window is **23.1 %** of it, against **6.0 %** for HHS (50 d), **3.1 %** for Terminal (98 d) and **0.9 %** for Hospital (318 d). Programme-relative first-MEP: Duplex 15.4 % in, HHS 28.0 %, Hospital 10.7 %. No ordering defect was found: the plumbing follows the foundations on its own level. | **witness scope** — an absolute window compared against programmes spanning **13 → 318 days**. No schedule defect. |
| 8 | **C4 Terminal** | bad=4 | The 4 offending `IfcFlowTerminal` (3 sinks + 1 cistern) **are the entire `00 Aras Asas` band** — that band has n=4 and nothing else. Three of them sit at bz ≈ 0.235/0.235/−0.000 m while the model's **p01 base_z is 14.43 m and p50 is 34.36 m**: a 4-element phantom storey ~15 m below the real ground floor. `4D_template.json` gives **Substructure `scope: building`**, so it instantiates on the LOWEST level — `TASK_Substructure_00_Aras_Asas`, **469 guids, days 0–2** — and that level's own `TASK_MEP_Final_00_Aras_Asas` (**4 guids**) follows at **days 2–3**, inside C4's 3-day window. The 4th element carries the same storey string at bz 28.431 m, so the band is a *labelling* fact, not only a placement one. | **modelling fact** with a real scheduling consequence |

**Roll-up: 3 witness defects · 3 modelling facts · 1 real defect (fix unmerged) · 1 witness-scope.**
Hospital contributes **zero** FAILs on the played layer (C2 51/51 pure, C4 152 judged / 0 MEP).

## §J.6.2 THE THREE WITNESS DEFECTS, EACH AGAINST AN §I ROW

- **W1 — C2 judges `seq`, prints `phase`.** §I: *"what phase/trade is this element?"* → `matchNameOverride()` → `matchRule()`, and §GROUNDWORK_SLAB mutates the result. `seq === 1` is §I.2's **ground-exemption** rank, a different question — the exact mirror image of the `grounded[i]` vs `seq !== 1` confusion §I.2 was written to stop. **FIXED by reporting BOTH relations and failing on either**, so Duplex's §GROUNDWORK_SLAB-promoted 13 mm ceramic tile (real, #1551's target) is still counted while Terminal's 9 foundation beams are *named* as promotions instead of appearing as anonymous intruders. **No verdict letter changes.**
- **W2 — C3 elects its own support.** §I: *"which ONE thing supports T?"* OWNER `support_sweep.js:432 _designatedSupport`; **never: "elect a support yourself."** C3 re-walked `G.contacts` inline and accepted **any** bearing/embedded contact, pipes included. **FIXED by calling the owner.** Measured A/B before writing: counts identical on all four (Duplex 1, HHS 3, Hospital 0, Terminal 0) — but the log now names the elected support (`IfcMember←IfcSlab|seq4`, `IfcSlab←IfcStairFlight|seq6 ×3`) and its start, so a hanging is self-attributing. The inline count is **kept and printed beside it** so a future divergence between the two is visible, never silent.
- **W3 — C1's "declared" side is not declared.** Measured: **6 of 6** Terminal and **3 of 3** HHS `IfcBuildingStorey` rows carry `object_type='COMPILED'` and `STC_*` guids. **C1's verdict logic is deliberately UNTOUCHED** (it was verified valid and layer-independent, and this section does not re-litigate it); the fix is **additive detail only** — the cache now persists `object_type` and C1 prints `declaredBy=COMPILED:6/6`, so the claim can state the limit of its own input without changing what it judges.

## §J.6.3 ⛔ CORRECTION TO §I — `deriveStoreyMergeMap` DOES NOT RUN, ON EITHER BUILDING THAT HAS THE TABLE
§I's row said *"✅ **RUNS as of 2026-08-27** (Terminal 23 names → 15 bands) … ⚠ still throws for
`HHS_Office_Federated`"*. **Measured 2026-09-02 against the shipped bytes it actually reads:**
`§S18_STOREY_MERGE_FAIL no such column: elevation` on **Terminal AND HHS**, and
`no such table: spatial_structure` on Duplex and Hospital — i.e. **it runs on nothing in the fleet.**
The cause is not the OCI upload §I.3 §CLOSED discussed: `buildings/{Terminal,HHS_…}_extracted.db`
carry a `spatial_structure` written by `compile_rooms.py` whose schema has **`center_z` and no
`elevation` column at all**. Every cache/probe/witness reads those raw files, so the level model
they judge is the unmerged one. The §I row is corrected in place.

## §J.6.4 TWO REAL ITEMS THIS ATTRIBUTION SURFACED — MEASURED, DELIBERATELY NOT SHIPPED HERE
1. **§GROUNDWORK_SLAB prices 21 promoted elements as steel erection.** Its own comment says
   *"seq/resource unchanged (CONCRETE_GANG already)"* — true for `IfcSlab` (seq 4, CONCRETE_GANG),
   **false for `IfcBeam`** (seq 3, STEEL_ERECTOR). Census: **Terminal 20 + Hospital 1 = 21**
   `IfcBeam` are Substructure groundwork priced and crewed as steel. Fixing it changes duration and
   crew allocation, therefore dates — a **U-8-class ruling**, not an agent's call. Not touched.
2. ~~**An `IfcSlab`-typed stair tread has no name override.**~~ ✅ **SHIPPED 2026-09-02 as
   `§STAIR_SLAB_WIDEN`, bim-ootb PR #1625 (queue A-15).** The scope this section recorded was
   re-measured against the `origin/main` @ `85fd0732` cache and is CONFIRMED unchanged: `IfcSlab`
   whose name matches this rule's own `^\s*stair\b` = **HHS 4/83, Duplex 0/21, Hospital 0/35,
   Terminal 0/705**. Measured result, played layer: **C3 HHS `FAIL judged=4 bad=3` →
   `FAIL judged=2 bad=1`** — the 3→1 this file predicted in §J.6.5, exactly. The **`§W_D0` headline
   does not move** (`claims=16 PASS=8 FAIL=5 INCONCLUSIVE=3 RED`, unchanged) because 1 hanging slab
   remains, and it is now NAMED: `IfcSlab "Floor:STB 30.0:573302"`, a real floor slab whose
   designated support is an `IfcStairFlight` scheduled later — the §F cross-phase class, not a stair
   component, correctly untouched by this rule. The 4 treads move Superstructure/seq4/day 0.08–0.09
   → Architecture Envelope/seq6/day 15.13–22.07. Duplex/Hospital/Terminal run logs byte-identical
   before and after (0 differing lines) — zero collateral, as "0 elsewhere" predicts.
   **⛔ THIS SECTION'S OWN `supportPool` PREMISE WAS FALSE, and it is the reason the change was
   deferred — do not reintroduce it.** `supportPool` (`schedule_gate.js:1348`, not :1323) is
   `e.seq <= 4 || (e.cls === 'IfcSlab' && e.seq > 4) || e.cls === 'IfcStairFlight'`: the **second
   clause keeps an `IfcSlab` in the pool at ANY sequence**, so all four treads are in the pool
   before AND after (verified on both caches, 4 in / 4 in). The removal consequence is real for
   `IfcMember` only, where seq 3 → 6 crosses the `<= 4` clause.
   Two effects the proposal did not predict, both measured and both in the PR: (a)
   `§TPL_ZERO_MINUTE` fired — CARPENTER carried no `IfcSlab` productivity, fixed by copying
   CONCRETE_GANG's canonical **35**, the same rule the FINISHER entry was built by (`n=0/68` after);
   (b) `§TPL_LAYER_SELFCHECK stillInverted 107 → 109` on HHS, consistent with the tread↔flight pairs
   entering a within-task check that previously could not see them (measured: they were in
   `TASK_Superstructure_Level_1/2` vs `TASK_Architecture_Envelope_Level_1/2` before, one task after)
   — stated as an inference, not a proof.

## §J.6.6 ⛔ CORRECTION 2026-09-02 — ROW 8 AND ITS `§W_D0A` CLAIM A4 ARE NOW UNJUDGED, NOT FAILING
**Row 8 (`C4 Terminal`, bad=4) is STALE.** Re-measured on the `origin/main` @ `85fd0732` cache
(4 buildings, 119,568 elements): `§W_D0 C4_NO_EARLY_MEP Terminal **PASS** judged=499 bad=0
window=3d programmeDays=103.00 firstMEP=**+15.00d**`. PR #1551 (`§STOREY_DATUM`, squash `59736505`)
moved Terminal's opening off day 0, so the 4-element phantom band no longer produces early MEP.

**The attribution witness could not say that, and said something false instead** — `witness_day0_attribution.js`
claim A4 printed a bare **FAIL over an EMPTY population** (`judged=1 bad=1 · early MEP spans 0 bands []`):
`pop++` ran unconditionally and `names.length !== 1` was satisfied by `names.length === 0`. Fixed in
bim-ootb **PR #1624** (queue A-14) — that is the vacuous case the witness contract requires to print
**INCONCLUSIVE**, a third state, never a bare verdict:

```
§W_D0A A4_TERMINAL_PHANTOM_LVL  Terminal  INCONCLUSIVE  judged=0 bad=0
  VACUOUS — Terminal has 11850 scheduled ^MEP elements but NONE starts inside the 3-day window
  (earliest MEP start = t0+15.00d, window = t0+3.00d)
§W_D0A_VERDICT  claims=6 PASS=3 FAIL=3 INCONCLUSIVE=0  ->  PASS=3 FAIL=2 INCONCLUSIVE=1   (still RED)
```

**A4 was NOT made to pass**, and the emptiness is reported WITH its evidence so it cannot become a
silent skip: the MEP population is counted *without* the window (11,850) and the earliest real start
is printed, because a filter that stopped matching would also produce an empty set — and that is a
DEFECT, not a vacuum, and takes a different branch that FAILs. A vacuity control (`W_D0A_RED=1`)
widens the window to the MEASURED earliest start and A4 goes back to judging (`FAIL judged=3 bad=1`),
proving the INCONCLUSIVE is caused by emptiness and nothing else.

**What a future session must decide, and must NOT decide by widening the window:** row 8's
attribution is now neither confirmed nor refuted. Either re-derive it against a population that
exists, or retire the row. The phantom band itself is unchanged in the model.

⚠ **Cache-key note, cheap to pay once and expensive to rediscover:** `~/.cache/bim4d` is keyed on the
full CONTENT of 11 viewer inputs. The pre-existing 4-building cache was keyed to `59736505`, and the
only difference from `origin/main` across those 11 files was a **comment-only** edit to
`viewer/time_machine.js` (#1619). A comment rewrite invalidates a four-building cache.

## §J.6.5 WHAT WOULD MOVE THE VERDICT, IN ORDER
1. **Land #1551** → C2 Duplex 3→1 and C3 Duplex 1→0 (2 of the 8). Its payload is confirmed
   unshipped (A-2, 2026-09-02) and this section re-confirms the exact populations it targets.
2. ~~**Widen `stair_member_architecture` to `IfcSlab`**~~ ✅ **DONE 2026-09-02, PR #1625** — the
   predicted **C3 HHS 3→1** is the measured result. The `§W_D0` headline is unchanged because the
   remaining 1 is a real floor slab, not a stair component (§J.6.4 item 2).
3. The remaining five are a **modelling fact ×3**, a **witness-scope constant**, and the
   §GROUNDWORK_SLAB relation now reported rather than conflated. **None of them is fixed by a
   scheduler change**, and inventing one to move the number is §J.2's failure mode.

---

# §M REVIEW 2026-09-04 — FOUR QUESTIONS ON THE POST-#1641 BANDING (REPORT ONLY — nothing fixed, no PR)

User brief: *"Make report, not fix yet."* Hard constraint: no visual tools, witness-log maths only.
Every number below is **MEASURED-BY-ME** (command given) or **CITED** (file:line). `origin/main` @
`4fe49fac` (bim-ootb, ff-only-merged before anything ran). Scratch logs:
`/tmp/claude-1000/-home-red1-bim-compiler/505327fd-24a8-4342-8b49-f55dd2b505b8/scratchpad/{q1,q3,q4,analyze_cache.log,midair_*.log}`.

## §M.0 THE INSTRUMENTS FIRST — three things about the cache you must know before quoting it

1. **Which cache dir is current.** `codeKey()` over the 11 INPUTS at `4fe49fac` = **`0d51dcdc5f12`**
   (MEASURED-BY-ME: the `codeKey()` body of `scripts/cache_4d_run.js` run inline). The `4bdc7970b881_*`
   dirs built 3 min later (Sep 4 00:00) are ANOTHER checkout's code — their Hospital log has no
   `§STOREY_DATUM_FRAME` line at all. Read `0d51dcdc5f12_*`, nothing else.
2. **⛔ The cache is keyed on `<bld>_extracted.db`** (CITED `scripts/cache_4d_run.js:95` `dirFor`, `:113`).
   For Hospital that is the DB with **no `spatial_structure`** — so the persisted Hospital run is
   `§STOREY_DATUM mode=INFERRED … bandsUsed=20`, `§4D_BAND_MONOTONIC ranks=8`, 42 tasks, 317 d. **It is
   NOT the post-#1641 7-band / 36-task / 334 d grid the viewer loads** (§I.6). This is the
   `project_split_db_live_vs_probe_landmine` inside clause 5's own instrument. To answer on the
   CURRENT banding I persisted a `Hospital_meta.db` run with the same script, no code change:
   `BLD_DIR=<scratch dir holding Hospital_extracted.db -> ~/bim-ootb/buildings/Hospital_meta.db symlink>
   CACHE_4D_DIR=~/.cache/bim4d_meta node scripts/cache_4d_run.js Hospital` →
   **`~/.cache/bim4d_meta/Hospital/0d51dcdc5f12_c13c87addcea/{witness.log,run.json}`** — read it, do not
   re-run. Its log is line-for-line the §I.6 lines (`mode=DECLARED source=center_z … bandsUsed=7`,
   `§AUTHOR_TPL tasks=36 totalDays=334`, `§CPM_DISPLAY midair=583`). Below, "Hospital META" = that
   run; "Hospital extracted" = the `~/.cache/bim4d` one.
3. **Probe landmine.** `buildings/Duplex_meta.db` is a **0-byte file** (Aug 25) and
   `scripts/probe_tm_reveal_shipped.js:66` prefers `_meta.db` whenever it exists → sql.js throws on
   Duplex and the run exits 2 (MEASURED: `q4/probe_tm_reveal_others_meta.log` tail). Workaround
   `DB_KIND=extracted`. Nothing fixed.

## §M.1 Q1 — IS THE GENERATE/EDIT PATH INTACT? — **INTACT: yes. PROVEN END-TO-END ON THE CANONICAL MODEL: no.**

All five named instruments run green (MEASURED-BY-ME: `node viewer/tests/<w>.js > q1/<w>.log`), plus
the DEBUG-MAP step owners and the split-DB round-trip probe. What each actually judged:

| witness | verdict | EDITS A BAR? | population / model it judged | NO-OP · VACUOUS · WRONG |
|---|---|---|---|---|
| `witness_gantt_edit_coherence` | 11/0 | **YES** — shipped `commitGanttDrag` move +20 d and resizeR −1 d (`§W-COH_AUDIT`) | Duplex, `§TPL_MODEL model=template` (G-COH-10). BUT: `laborRates: {}` (CITED `:207`) → every element at the 120 s floor; run without SupportSweep — its own log says `§TPL_LAYER_ORDER_FAIL SupportSweep not loaded`, `§TPL_LAYER_SELFCHECK applied=0` — a configuration the browser never runs; DEBUG-MAP steps 4/5/6 stubbed to no-ops (CITED `:294-295`); kernel_ops seeded by the witness with an even spread, not the played layer | WRONG: only collapse/inversion (`collapsed60s`, `inverted`). **Never asserts the bar or its elements moved by +20 d** → cannot tell NO-OP from a correct move. VACUOUS guard G-COH-9 exists (outliers exercised = 0 on the move, 9 on the resize) |
| `witness_gantt_lock_integrity` | 20/0 | an OP, not a bar: `op.timestamp = 0` written directly, then `verifyGanttIntegrity` re-scores | Duplex via **legacy `ScheduleGate.computeSchedule(geoEls,0,1)` with `installSecs = 120`** (CITED `:194-195`), no `materializeZones`, no template. Its baseline is `§GANTT_LOCK_BASELINE floating=62 midair=167`; the canonical run on the same DB has `§CPM_DISPLAY midair=0` (cache). Off-model population | WRONG: yes (`midair 167→168 +1`, offender named). NO-OP: delta-gated. VACUOUS: no guard that the baseline is the viewer's; G-LI-4 (`§LI_COST … floating=0`) is a cost probe on bim-compiler's June-5 Hospital DB at 120 s durations |
| `witness_tm_edit_exception` | 23/0 | **NO** — by design the engine verb throws | wiring: 7 pipelines carry the catch; recovery re-derivers run | judges recovery only; says nothing about a successful edit |
| `witness_undo_dot_spawn` | 8/0 (puppeteer) | **NO — not a Gantt witness.** History-bar dots on `GRID_MOVE` kernel ops | `histbar_viewer_harness.html`; no task row, no bar | n/a to this chain |
| `witness_whatif_authored_sync` | 9/9 | **NO — not a Gantt witness.** ERP `C_ProjectPhase` fold | synthetic sql.js seed | n/a to this chain |
| `witness_gantt_edit_undo` (DEBUG-MAP owner) | 9/0 | **YES, with the delta read back**: `§GANTT_DRAG_COMMIT … deltaDays=20 start=2026-01-21`, `§GANTT_RETIME tasks=6 rows=187`, `§GANTT_EDIT_UNDO tasksRestored=21 opsRestored=187` | Duplex — **`§TPL_MODEL model=legacy-deriveZones`** (the model §A ruled DEAD on 2026-08-27) | the only gesture witness that asserts stored rows changed and were restored — on the dead model |
| `witness_gantt_cpm_annotate` (DEBUG-MAP owner) | 27/0 | no (annotate after retime) | 8 fleet buildings, **all `legacy-deriveZones`** | off-model |
| `witness_gantt_gesture_wiring` / `retime_resync_wiring` / `edit_persist` | 16/0 · 6/0 · 18/0/0 | no (source gates) | brace-matched source | routing only, by their own headers |
| `scripts/probe_splitmode_persist_direct.js Hospital` | 8/0 | writes a task date via `persistDb`, reloads in a real second browser | `_dbPersistUrl=/buildings/Hospital_meta.db`, `§SCHED_PERSIST size=55892KB`, reload `§CACHE_HIT Hospital_meta.db size=54.6MB`, **D6 `expected=2026-12-25 got=2026-12-25`** | the round trip that was RED on 2026-08-27 day-2 (§5b) is GREEN today on the split DB |

**Deciding line:** every link of the chain is proven somewhere, **no link is proven on the canonical
model end-to-end**: the one witness that reads the stored delta back (`edit_undo`) judges the dead
model; the one canonical-model gesture witness (`edit_coherence`) stubs resync/annotate/persist, runs
without SupportSweep and with empty rates, and never asserts the delta. **§CRISIS-class per PRIMAL LAW
clause 2:** three of the five instruments CLAUDE.md names as "that chain" are green without ever
editing a bar (two are not Gantt witnesses at all). Fix shape (not done): give `edit_undo` and
`cpm_annotate` the same `template:` + G-COH-10 guard `edit_coherence` got on 2026-08-27, and give
`edit_coherence` the SupportSweep global + real `LABOR_RATES` and one assertion that
`schedule_start` moved by exactly `deltaDays`. Correct the CLAUDE.md chain list to name
`edit_undo`/`edit_persist`/`cpm_annotate` instead of `undo_dot_spawn`/`whatif_authored_sync`.

## §M.2 Q2 — IS THE DISPLAY DISTORTION GONE? — **The AXIS stretch is gone (0.0 d on all 5). The distortion moved INSIDE the bars: ×9.8 on Hospital.**

`§GANTT_AXIS` is a browser-only line (CITED `time_machine.js:160`, owner `GanttModel.computeDays`
`gantt_model.js:218`) — it is not in any cache log. I called the OWNER over the persisted PLAYED layer
with the persisted task windows (MEASURED-BY-ME: `node scratchpad/analyze_cache.js`, `§RPT_GANTT_AXIS`):

| building / DB | axisDays / trueDays / qualifiedAway | task grid | physics DAG makespan (`§CELL_RUN`/`§CPM_RUN`) | `§CREW_DAY spanD` | `§ZONE_WINDOW_DAGWINS_CLIP clamped` | Σ bar-days vs Σ members' CPM raw span (`§TM_REVEAL_SHIPPED_TASK`, probe) · tasks with raw > 2× bar · worst |
|---|---|---|---|---|---|---|
| **Hospital META** | **334.0 / 334.0 / 0.0** | 334 d | **447.0 d** | 360.3 | 5018 (7.9 %) | **532 vs 5200.7 d (×9.8)** · 24/36 · `TASK_Finishes_Level_4` bar **2 d**, members' CPM span **209.6 d (×105)** |
| Hospital extracted | 317.0 / 317.0 / 0.0 | 317 | 434.6 | 353.7 | 3855 (6.1 %) | (cache only) |
| Terminal (META probe / extracted cache) | 103.0 / 103.0 / 0.0 (without task windows the Tukey axis would be 62.6, qualifiedAway 40.4 d) | 103 | 100.9 | 116.7 | 624 (1.3 %) · META 1074 | 188 vs 1731.9 (×9.2) · 48/70 · Arch_Env_05 1 d vs 80.6 d |
| Clinic | 113.0 / 113.0 / 0.0 | 113 | 121.9 | 139.5 | 467 (2.9 %) | 187 vs 790.3 (×4.2) · 12/18 · Finishes_2F 1 d vs 47.9 d |
| HHS | 54.0 / 54.0 / 0.0 | 54 | 35.4 | 53.7 | 289 (4.2 %) | 81 vs 308.4 (×3.8) · 14/16 · Arch_Env_L3 1 d vs 20.2 d |
| Duplex | 12.0 / 12.0 / 0.0 | 12 | 7.6 | 10.8 | 34 (3.0 %) | 24 vs 56.1 (×2.3) · 8/19 · 1 d vs 5.7 d |

Why the axis number is now exact: `§TM_PLAYED_LAYER clamped=N/N uncovered=0` on every building — the
tiling (#1605) puts 100 % of elements inside their task window and `§GANTT_AXIS_COVERS_TASKS` widens
the axis to every window, so `axisEnd == projectEnd` by construction. The 294 vs 49.9 figure this
review was asked about cannot recur on this layer. **What the user sees is now exactly the authored
grid — and the authored grid is 75 % of the physics DAG's own length on Hospital (334 vs 447 d), with
individual bars up to 105× shorter than the physics span of the elements they claim.** Whether that is
"misrepresentation" is a §I question §I does not answer: three different numbers each print as the
programme length (`§CELL_RUN makespanDays`, `§CREW_DAY spanD`, `§AUTHOR_TPL totalDays`) and no row says
which one IS the programme — row added in §M.6.

## §M.3 Q3 — MIDAIR GOVERNANCE — **539 on Hospital META (played), of which ~22 (4 %) are ceiling-hung terminals; 302 (56 %) are the judge electing a non-structural neighbour; 237 are structural and indefensible.**

Owner called, not re-derived: `SupportSweep.midairAudit` + its own `designatedSupport` election over the
persisted PLAYED items (CITED `support_sweep.js:500`, `:432`; `schedule_gate.js:1375 supportPool`).
MEASURED-BY-ME: `analyze_cache.js` `§RPT_MIDAIR*`, `midair_worst.js`, `midair_detail.js`. Read §S14 first:
this judge's single election is itself suspect (it elects a slab 3 m overhead) — the numbers are the
owner's, with that caveat, and the pool split below is exactly that caveat measured.

**Hospital META, played layer: midair = 539** (`§CPM_DISPLAY`/`§TM_PLAYED_LAYER` print 583 — see §M.5 item 2).

| cut | numbers |
|---|---|
| by discipline (phase) | STR 240 · MEP 188 · ARCH 111 |
| by IFC class | IfcBeam **123** · IfcColumn **80** · IfcPipeFitting 73 · IfcMember 61 · IfcPipeSegment 48 · IfcBuildingElementProxy 34 · IfcDuctFitting 31 · IfcDuctSegment 30 · IfcFooting 21 · IfcWallStandardCase 15 · IfcPlate 9 · IfcFireSuppressionTerminal 6 · IfcWall 4 · IfcSlab 2 · IfcRailing 2 |
| relation of the ELECTED support | bearing-below 329 · embedded 144 · carrier-above 66 |
| elected support IN `supportPool` (structural) | **237** |
| elected support NOT in pool | **302** — IfcCovering 60, IfcPipeSegment 58, IfcPlate 55, IfcDuctSegment 46, IfcPipeFitting 29, IfcMember 15, IfcLightFixture 13, DuctFitting 9, Wall 5, Valve 4, … |
| days before its support | ≤1 d 130 · 1–7 d 184 · 7–30 d 119 · 30–90 d 53 · **>90 d 53** (median 4.9, p90 89.7, max 201.4) |
| cross-task vs same-task | 123 / 416 |
| by task (top) | MEP_Rough_in_L5 116 · Superstructure_L1 90 · Arch_Envelope_L5 68 · Superstructure_L4 39 · Substructure_L1 36 |

**Against the user's rule** (*only ARCH genuinely hung from a ceiling may be midair*):
- **Legitimately ceiling-hung: ~22 (4.1 %)** — IfcBuildingElementProxy HEPA supply diffusers 8, exhaust
  grilles 4, return diffusers 2, balancing dampers 2, + IfcFireSuppressionTerminal 6. (The other proxies
  are solar panels 7, roof drains 3, sinks 3, shower heads 2, hot-water coils 3 — not ceiling-hung.)
- **The 11 worst offenders (159–201 d early) are all those diffusers/dampers** waiting on a 5 cm
  `IfcCovering` ceiling tile 1–4 cm below them (Finishes, day ~230) or on the `IfcLightFixture` beside
  them (MEP Final). The diffuser is banded into "Architecture Envelope" (day ~30). That is §E row 1
  ("a pipe bears a wall") — the election, not the schedule, is the defect; §E's ruling *"anything that
  hangs within a well formed room is no issue"* already covers them.
- **Indefensible structural, the real population: 237.** Named: **IfcColumn on IfcSlab 68** — a column
  appears 0.5–14.2 d (median 4.3 d) **before the slab it stands on**; **IfcBeam 123** (embedded
  beam←beam 47, bearing beam←beam 45, carrier-above beam←slab 29 = §S2's overhead-slab election);
  IfcFooting←IfcFooting embedded 11; IfcWallStandardCase 15; **IfcSlab 2** — two roof slabs 144 d
  before the blockwork walls under them; IfcMember←IfcPlate 54 (mullions before their glazing).
- Same-task offenders (416) are the CELL solve's own representability gap — `§CELL_GATE … REFUSED=1296`
  on META (349 on extracted), "arrows-as-exception surface, NOT enforced — §S26.11 leg 4".

Other buildings (played layer, owner): Terminal 493 (IfcPlate←IfcPlate embedded 215 — the metal-deck
fragments), Clinic 644 (IfcBeam 388, 159 of them carrier-above←slab), Duplex **257**, HHS **152** —
the last two against `§CPM_DISPLAY midair=0`, see §M.5 item 2.

## §M.4 Q4 — BUILDUP: IS ANYTHING STILL ONE-SHOT? — **Yes, floor slabs. And #1605's "Levels 2-6 are single-element plates" is false on the current banding for L2 (22 slabs) and L6 (2).**

Hospital META, played layer, per Superstructure task (MEASURED-BY-ME: `analyze_cache.js` `§RPT_SLABS`;
cross-checked by the shipped probe `FRAMES=3118 FPS=15 node scripts/probe_tm_reveal_shipped.js Hospital`
`§TM_REVEAL_GROUP … CANDIDATE-tiled`, identical n / deciles):

| task | IfcSlab n | bbox XY m² (max / Σ) | (a) distinct start instants | (b) share in ONE decile · in ONE 1 %-bin | group start span | played duration each | `installSecs` |
|---|---|---|---|---|---|---|---|
| Substructure_L1 | 1 | 332 | 1 | 100 % · 100 % | 0 | 287 s | 823 |
| Superstructure_L1 | 5 | 8 963 / 18 386 | 5 | 60 % · 60 % | 8.28 d | 291 s | 823 |
| **Superstructure_L2** | **22** | 9 192 / 17 625 | 22 | **90.9 % · 90.9 %** (20 of 22 inside 0.09 d = 2.2 h of a 9-d bar, last decile) | 8.83 d | 280 s | 823 |
| Superstructure_L3 | 1 | 8 270 | 1 | 100 % · 100 % | 0 | 289 s | 823 |
| Superstructure_L4 | 1 | 8 343 | 1 | 100 % · 100 % | 0 | 280 s | 823 |
| Superstructure_L5 | 1 | 7 585 | 1 | 100 % · 100 % | 0 | 280 s | 823 |
| Superstructure_L6 | 2 | 2 092 / 2 669 | 2 | 50 % · 50 % | 2.05 d | 392 s | 823 |
| Superstructure_L7 | 2 | 42 / 66 | 2 | 50 % · 50 % | 0.50 d | 43 200 s | 823 |

(a) Every slab gets its own tile, so "distinct instants" is nominally n — but a 9 000 m² plate plays
for **280 s of a 4–9 day bar (0.03–0.08 % of the window)** and reveals at ONE instant. (b) L2: 90.9 %
of the set inside one decile AND one 1 %-bin = one shot; L3/L4/L5 100 % trivially. (c) The
single-element claim holds for **L3, L4, L5 only**; on the extracted/INFERRED banding the 22-slab set
sits in L3 instead — the banding moved the set, the shape did not change. Terminal is the same shape
(`Superstructure_Aras_Tanah` 100 slabs, 100 % in the last decile; `Aras_02` 59 slabs, 100 %); HHS
`Superstructure_Level_3` 7 slabs 100 %; Clinic `Second_Floor` 6 slabs 100 % (probe lines, all logs in q4/).

(d) **A non-inventing route exists for the QUANTITY, not for the geometry.** `_installSecs` (CITED
`schedule_author.js:100`) already takes `realQty` (`:115`) but it is only ever supplied for classes
`_classFragmentation` flags as fragmented (avg bbox area < 1 m², `:173`, `:556`) — IfcSlab at 7 585–
9 192 m² per plate never qualifies, so every slab is priced at the flat 28800/35 = 823 s
(`rates.js:143` CONCRETE_GANG `IfcSlab:35`). The bbox area (the exact `_AREA_EXPR` the recipe already
runs) is real, extracted data; feeding it as `realQty` is not invention. What it would need is a
RULING on the shipped 35 m²/day constant (a 9 192 m² plate at that rate = 87.5 crew-days) — the open
§FUTURE item 2 calibration question, ⛔ user decision. It would lengthen the plate's played DURATION
(and its frontier glow, CITED `time_machine.js:166-170`: `frontier = start_ts <= cursor < end_ts`) but a
single mesh still REVEALS at one `start_ts`; a progressive fill of one mesh is a presentation-layer
treatment of a real duration (Prime Rule scope = data, not presentation), not sub-element geometry.
The 22-slab case on L2 needs neither: it is 22 real elements packed into the last 1 % of their bar by
CPM order + 823 s tiles — a real duration per slab would spread them by itself. #1605's "= invention"
ruling therefore holds only for L3/L4/L5's single plates, and only for the REVEAL instant, not the duration.

## §M.5 RANKED FINDINGS (nothing fixed — what a fix would take)

1. **🔴 §CRISIS — the Gantt edit chain's only delta-reading witnesses judge the DEAD model.**
   `witness_gantt_edit_undo` and `witness_gantt_cpm_annotate` print `§TPL_MODEL model=legacy-deriveZones`
   on every run (edit_undo: Duplex; cpm_annotate: all 8 fleet buildings) — the exact defect
   G-COH-10 closed for `edit_coherence` on 2026-08-27 was never applied to its two siblings.
   `edit_coherence` itself runs a configuration the browser never runs (`SupportSweep not loaded`,
   `laborRates: {}`) and asserts no delta. Fix: pass `template:` + the G-COH-10 guard into both; add the
   SupportSweep global, real rates and a `schedule_start` delta assertion to `edit_coherence`; replace
   `undo_dot_spawn`/`whatif_authored_sync` in CLAUDE.md's chain list. ~1 PR, witness-only.
2. **🔴 `§TM_PLAYED_LAYER … midair=N` reports the WRONG LAYER's number** — clause-4 defect in the
   instrument this lane reads first. CITED `scripts/lib/tm_played_layer.js:171` `midair: dt && dt.midair`
   — the CPM-DISPLAY judge's count, printed on the line that says *"these are the instants kernel_ops
   carries"*. Owner re-judged on those instants: Hospital META **539** (line says 583), extracted 495
   (431), Terminal 493 (418), Clinic 644 (600), **Duplex 257 (line says 0)**, **HHS 152 (line says 0)**.
   The probe's own `§TM_REVEAL_JUDGE … CANDIDATE-tiled` prints the same corrected numbers. So the tiled
   remap still MANUFACTURES midair across task boundaries (Duplex 0→257, HHS 0→152, Terminal META
   911→3133) — §S8b's finding about the affine, re-measured on its replacement; vs the affine it is
   mixed (Hospital 613→539 better, HHS 87→152 and Terminal 3061→3133 worse). Fix: one line — judge
   `midair` on `r.map`, print both; then a ruling on whether cross-task tiling may reorder a support
   pair at all (§I "where inside its bar does it PLAY?" row).
3. **🟠 The cache does not represent the DB the viewer loads for Hospital** (§M.0 item 2) — every
   Hospital cache number since #1641 is on the 20-label INFERRED grid. Fix: `cache_4d_run.js` resolves
   `_meta.db` first (the `resolveDbFile` rule the probe already has, minus the 0-byte trap) and prints
   `dbFile=` on `§CACHE_BUILT`; until then read `~/.cache/bim4d_meta/`.
4. **🟠 Midair governance: 237 structural offenders are real** (68 columns before their slab, 123
   beams, 2 roof slabs 144 d early), and **302 verdicts are the election's §E proxy failure** (a
   ceiling tile / pipe / plate elected as support). Fix is the lane's D1 (§S14/§S9): judge on the
   contact SET with §E containment, not on one elected box — no scheduling change moves the 237 until
   `§CELL_GATE REFUSED=1296` E1 edges are representable (§S26.11 leg 4).
5. **🟡 Display: the panel shows 334 d for a 447 d DAG and bars up to 105× shorter than their members'
   physics span** (§M.2). Not a bug in the axis; a missing RULING on which layer is the programme —
   §M.6 row. Fix after ruling: either the windows carry the DAG span (drop `§TPL_CAPACITY_LEVEL`
   pushes? no — that is declared logic) or the panel prints the DAG makespan beside the grid.
6. **🟡 One-shot slabs** (§M.4): 22-slab L2 set in one 1 %-bin; single plates at 280 s. Fix needs the
   35 m²/day ruling (⛔ user) before `realQty` can be wired for IfcSlab; the L2 packing then resolves
   without invention.
7. **🟢 Probe trap:** 0-byte `buildings/Duplex_meta.db` crashes `probe_tm_reveal_shipped.js` (§M.0 item 3).
   Fix: `resolveDbFile` skips a 0-byte meta; or delete the empty file.

BLOCKED (user decisions, not measurements): (a) the productivity constant for IfcSlab (item 6);
(b) whether cross-task re-timing of a support pair is ever permitted by the played layer (item 2);
(c) which of the three programme lengths the panel is contractually showing (item 5).

## §M.6 OWNERSHIP — rows §I lacked, surfaced by this review

| the question | OWNER — call this | never |
|---|---|---|
| **how long is the programme?** | ⛔ **NO OWNER.** Three lines each print a length from one run — `§CELL_RUN makespanDays` (the DAG solve, Hospital META 447.0), `§CREW_DAY spanD` (360.3), `§AUTHOR_TPL totalDays` (the authored grid the panel and film show, 334) — and nothing says which is the contract. Add the row when ruled | quote one of the three as "the schedule length" without naming the line |
| **does the persisted run represent the DB the viewer loads?** | `run.json.dbFile` (`cache_4d_run.js` writes it) — READ IT. Today it is `_extracted.db` by construction (`:95`,`:113`); the viewer loads `_meta.db` for Hospital/Clinic (§I.6, `streaming.js §DB_SPLIT_DETECT`) | assume `~/.cache/bim4d/Hospital` is the viewer's Hospital; it is not since #1641 |
| **midair ON THE PLAYED INSTANTS?** | `SupportSweep.midairAudit(items with s/e = play map)` — as `probe_tm_reveal_shipped.js` `judge()` does (`§TM_REVEAL_JUDGE … map=CANDIDATE-tiled`) | read `§TM_PLAYED_LAYER midair=` for it — that field is `dt.midair`, the CPM-display count (`tm_played_layer.js:171`) |
