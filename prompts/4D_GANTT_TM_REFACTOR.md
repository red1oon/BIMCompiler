# ⚠ WATCHDOG — READ THIS FIRST, BEFORE ANY OTHER SECTION IN THIS FILE (2026-08-18, appended after a
# multi-day thrash loop — see §RESULTS and its addendum further down for the receipts).

**Posture for whoever opens this file next: distrust-by-default, not continue-by-default.** The days
before this note produced a real, measurable pattern: local fixes verified against proxy metrics
(synthetic sandbox pass, graph-structure correctness, "floating=0") got reported and merged as if they
answered the real acceptance question, when they hadn't — and at least once, a claimed regression
turned out to be a stale-DB measurement artifact, not a code bug, caught only because someone
distrusted the number enough to check the raw file mtimes behind it. That's GIGO in its precise sense
here: not "bad data" alone, but confident conclusions computed on top of ground truth (real buildings,
real dates, real element-to-element order) that was never itself independently confirmed before being
trusted — proxy validation standing in for ground-truth validation, several layers deep before anyone
checked the bottom layer.

**Standing mandate, until explicitly closed:** do not resume feature work, and do not trust any prior
session's "N bugs fixed" / "floating=0" / "verified" claim in this file at face value — re-derive it.
Start from the smallest provable unit and rebuild confidence bottom-up: can this engine get ONE real
building's FIRST substructure phase, on storey 1, to measurably, provably finish (in real days) before
the first element of the very next phase starts — checked directly against real building data, not a
synthetic case, not a graph-structure argument about what a gate should enforce. Until that one
concrete, real-building acceptance test passes and reproduces, treat every downstream claim in this
file (fleet floating counts, "5 bugs fixed," phase gating "working") as unproven, however many PRs
merged on top of it.

**Do not repeat the failure mode named in §RESULTS / its addendum below**: a fix that is locally
correct (passes its own synthetic case, its own unit-level graph check) but was never checked against
the one thing a person on site would actually ask. Every next step from here starts by re-confirming
ground truth, not by building the next layer on an unconfirmed one.

---

# ⚠ DO NOT REMOVE — Build one class: `compute(elements, opts) → ScheduleModel` (per-element times,
# one clock, no rollup baked in), wrapping `ScheduleGate.computeSchedule → CpmSchedule.run` — the
# actual duplicated pair — as the single place "when does each thing get built" is computed.
# `elements` = already-classified (the output of `ScheduleAuthor._buildScheduleElements`, itself
# already the one correct source for classification — do not re-home or duplicate it). Flag, don't
# silently work around, anything else in the current code that computes or persists schedule timing
# independently of this.
#
# ⚠ "Wrapping" means structural consolidation ONLY — it does NOT mean the wrapped code's behavior is
# trusted. `CpmSchedule.run`'s own internal rules (the E1-E4 dependency logic) must independently
# satisfy §VERIFICATION below before this is done. Already found once: the phase-completion gate's
# straggler exemption let a phase count as "done" while most of it wasn't — a faithful wrap of that
# bug is still that bug. Assume nothing inside the wrapped pair is correct until proven — treating
# any part of it as settled and beyond question, without a test proving it, is exactly the habit
# that let this go unnoticed as long as it did.

# §VERIFICATION — the standing discipline, not a one-time pass. No single piece below is sufficient
# alone; each covers what the others can't.
1. **Hand-verified synthetic cases are the primary proof.** A small, fully synthetic scenario with
   its expected per-element result computed BY HAND, before running the engine — not a real
   building. Real data never gives a known-correct answer to diff against, only numbers that seem
   more or less plausible. Live under one location, `scripts/witness_*.js` (this project's existing
   naming convention — reuse it, don't invent a new one). Starting set, already known to matter, not
   optional to defer: stragglers present in a phase, a deadlock-stress case (an element that can't
   cleanly resolve), a level missing a phase, an orphan element, parallel independent zones on one
   band. Add to that set — don't just patch and move on — whenever a real building surfaces a shape
   none of the existing cases cover.
2. **Every synthetic case is a standing gate, not a one-off.** Find this project's existing
   fleet-gate script (the one already run before any change here is called complete — grep for it,
   don't assume a name) and wire every case into it. Do not create a second, parallel gate.
3. **The fleet trace stays running, as secondary confirmation.** It catches whatever the synthetic
   cases didn't think to cover. Real buildings keep surfacing shapes nobody designed for.
4. **Single source of truth is what actually closes off the class of bug, not just one instance of
   it.** As long as the bars and the axis read the engine's real output directly — nothing computed
   independently downstream — the display cannot drift wrong again even when the engine is right.
   Any future change that adds a second computation of schedule timing anywhere is the same defect
   recurring, regardless of what it's called.

---

# §OBJECTIVE — what this lane exists to fix (user, 2026-08-19)

Two symptoms. Everything else in this file is scaffolding around them.

**1. Hanging ARCH/MEP** — elements appearing before what holds them up is built.
Terminal 4,756 · Hospital 7,753 · LTU 12,712 · JKR 3,183 · HHS 1,531 · Clinic 1,102 · Duplex 247
— ⚠ **these are PRE-#1438 figures** (measured before the witness stopped reading deprecated
`_extracted.db` files, §S39.2). On the corrected ruler, `main` at `b81f646` reads Terminal 4,256 ·
Hospital 8,210 · LTU 12,686 · JKR 3,385 · HHS 1,491 · Clinic 1,205 · Duplex 237, fleet 31,470; and
the orphaned §S26.2 fix (`3bf771e`, PR #1440) takes that to 14,166, −55%. **State the commit next
to any number in this lane.** (Strict midair — start before support *starts* — is already
0; it is the start-before-support-*finishes* overlap that reads as floating on screen.)

**▸ CURRENT AS OF 2026-08-21 (`6dab2d1`) — read this before acting on the numbers above.** The
figures in symptom 1 are correctly commit-tagged history (pre-#1438 / `b81f646`) and are NOT current;
they stop at fleet 14,166. Since then §S50 shipped the cell-grain schedule (#1442): **fleet 14,166 →
8,991, −36.5%** (Terminal −74.2%, Hospital −76.4%, Clinic −63.1%), and strict midair on the
cell-path buildings is 684/218/422, user-accepted and locked in `viewer/tests/baselines/midair.json`.
Symptom 2 is closed on the same three buildings: **0 wide bars** (Terminal 0/197, Hospital 0/451,
Clinic 0/255) — but only while NO schedule is authored; see §S55.3, where authored identity replaces
the cell grain and 12-17% of bars go wide again. The four low-representability buildings
(Duplex/HHS/LTU/JKR) still run the unchanged graph engine.

⚠ The `time_machine.js:6074` pointer below is stale twice over: item d (#1444) changed that grouping
to the cell stamp, and §S53/F3 (#1446) moved the whole model to **`viewer/gantt_model.js`**
(`groupKeyOf`/`buildTasks`). The DESCRIPTION of the defect still stands; only the address changed.

**2. Stacked Gantt bars** — "one pile, full project length".

**Both are the same defect: scheduling is per ELEMENT, display and measurement are per GROUP.**
`time_machine.js:6074` groups bars by `storey|phase`, but each bar's span is min-start to max-end
over elements scheduled individually.

⛔ **CORRECTED 2026-08-19 by §S43 — this section used to say "one stray element stretches the whole
bar." That is measured to be FALSE.** The median bar owes **0.4–3.3%** of its width to its single
worst element, and deleting that element clears 0–3 wide bars out of 15–35 (zero on Hospital). Bars
are wide because their members are genuinely DISPERSED across the programme — the Tukey-trimmed
span, which already discards both outlier tails, still covers 17–30% of the project at the median.
So the shipped trim is not a weak version of the fix; outlier removal is the wrong lever entirely,
and "fix the grain — schedule the group" means constraining members to a contiguous window, i.e. a
SCHEDULING change, not a display one. §S37 B1 stands as the target; its stated mechanism does not.

**Four measured causes, all unshipped:**
- support predicate counts a pipe as holding up a wall — 760 of 761 Duplex physics-vs-phase
  contradictions (§S26.2)
- `hang` rule is 93-99.8% redundant and the sole cycle source; deleting it → acyclic 7/7 (§S26.3)
- the blob destroys the dependency chain — uncapped crews, live engine finishes Terminal in 0.6d,
  i.e. nearly everything at once (§S31.1)
- a Gantt bar is a hull (§S26.13, above)

**Progress is measured by those seven float numbers moving, and by bars ceasing to span the
project. Not by new sections in this file.**

---

# §STATUS — read this first (2026-08-19, end of a full consolidation)

> **Resuming in a new session? Read `# 🔄 §RESUME` at the END of this file first — it names the
> standing rulings and the required order of work. Both agents it lists have since REPORTED (§S33);
> §S34 then decided the tie-break §S33.1 left open and §S35 built the derivation. Read `# §OBJECTIVE` above FIRST — it
> states the two symptoms this lane exists to fix, and neither has moved. The next step is to ship
> one of the four measured causes, not to measure again.**

**Nothing has shipped. `viewer/` is unchanged.**
> **⚠ SUPERSEDED 2026-08-21 — see §S50 (end of file): the cell-grain schedule SHIPPED (PR #1442).**
> The user retired the support graph as the live precedence carrier; `cpm_schedule.js` now gates
> per building (Terminal/Hospital/Clinic → cell path, float −63..−76%; Duplex/HHS/JKR/LTU → the
> graph engine unchanged). The graph-era analysis below §S26–§S49 remains the evidence record.

**⚖ STANDING RULING — §S32 (user, 2026-08-19), read before acting on ANY section below:** the
extractor is CORRECT and must not be changed; `buildings/*.db` EXTRACTION tables are FROZEN (§S32.6: the
SCHEDULE tables — `schedules`/`tasks`/`task_sequences`/`task_elements`/`calendars` — ARE writable); every derived fact is computed at RUNTIME, ONCE, on load — the room-injection pattern.
§S32.2 lists what this CANCELS in §S27, §S28 and §S31, including the Hospital rebuild those sections
called for.

| § | what it is | standing |
|---|---|---|
| §S25_REVIEW | outside review + what measurement did to it | **HOLDS**, but its "ship-ready" §S25_REVIEW.6 claim is DEAD — killed by §S33.2 (mis-attributed comparison) |
| §S26 | evidence base — the blob is predicate-made, `hang` redundant, LBMS/trains, the IFC container already exists and is empty | **HOLDS** — independently re-derived by two adversarial passes |
| ~~§S27 / §S28~~ | both NOT VETTED designs | **ARCHIVED 2026-08-19** — `prompts/archive/…_S27-S28_rejected_2026-08-19.md`. Not build targets. |
| §S29 | generality audit — the design is fitted to 7 multi-storey new-build buildings | **HOLDS** |
| §S30 | the literal sort key, measured | **HOLDS** — instrument-guarded; qualified by §S31.1 |
| §S31 | the extraction chain — what is lost and where | **HOLDS** |
| §S32 | USER RULING — extractor correct · DBs frozen · derive at runtime | **STANDING** — unconditional |
| §S33 | both in-flight agents reported: coverage gate PASSED, §S25_REVIEW.6 claim DIED | **HOLDS** |
| §S34 | declared-vs-geometry tie-break — measured, then RULED (2026-08-19) | **HOLDS** — instrument-guarded, shuffle control 3.9–36.9× |
| §S35 | the runtime level derivation, BUILT — `build/level_deriver.js` + `scripts/witness_level_derive.js` | **BUILT, NOT WIRED** — 100% coverage 7/7, T4=0, 14/14 hand-computed fixtures |
| archive | §S23 · §S24 · §S24_TRIAGE · §S25 · §S25_PROTO | superseded, moved out |

**Two designs written, two rejected, and the measurements that followed refuted premises BOTH of
them rested on** (§S30 killed elevation-first ordering; §S31.1 then qualified §S30 itself; §S31.3
reframed §S26.6 C2). The evidence sections are strong and keep invalidating the design sections.
**That is the pattern this file now records: measure first, then design — not the reverse.**

## ⛔ NOTHING IS SHIP-READY (corrected 2026-08-19)

**§S25_REVIEW.6 was the candidate and it did NOT survive being built.** Its numbers were a
MIS-ATTRIBUTED COMPARISON (prototype-with-v2 vs live engine — see the ⛔ block above it).
Built for real, the tie-break alone gives 6/7 or 5/7, not 7/7, with HHS_Office regressing on
both paths and JKR on one. Not shipped, no PR. The claim as originally written was:
float better on **7/7** (Terminal 4,756→1,555 · Hospital 7,753→1,293 · Clinic 1,102→327 ·
JKR 3,183→1,072 · HHS 1,531→243 · Duplex 247→152 · LTU 12,712→9,461), phase gap better-or-equal on
7/7, backward supports −29% to −51%. It is a tie-break inside one function — no architecture change.

**Shipping it requires, in ONE PR:** both twins changed together (`cpm_schedule.js:120` AND
`time_machine.js:4575` — `witness_midair_zero.js:127` and `probe_captured_floating.js` slice
`_designatedSupport` out of `time_machine.js` BY SOURCE TEXT, so a one-file edit goes green on code
that never ran); a witness for the election itself; and W-MZ-8's float baselines re-measured and
re-locked on all 7 in the same PR.

## What is NOT ready

- **The sort is not validated for shipping.** Under real crew caps it fails 2/7 (Duplex +10,
  HHS_Office +572). 7/7 happens only with capacity lifted to infinity (§S31.1), which is not a
  product, and 21-65% of elements still have a support that sorts after them (§S30.3).
- **`scripts/probe_s30_sortkey.js` is a standalone reimplementation** — no `wallGate`, `hangGate`,
  `openingGate`, host pairs, or phase/level gates. Its numbers do not transfer to the engine.
- **No spec has passed vetting.** Any build against §S27 or §S28 as written is building on a
  rejected design.

## Standing instrument rule (three violations, one class)

`§S25_REVIEW.1` (`engineGap` arithmetically incapable of failing) and TWO false zeros produced on
2026-08-19 — remapped `bz`/`tz` where the judge reads `base_z`/`top_z` (247 vs 0 on the same
schedule), and omitted `s`/`e` so every duration was 0. Both reported 100% correct on 7/7.
**Every number from this lane prints `durOk` and `judgeCanFail`. A green number is worthless until
the instrument has been shown to go red.**

---

---

# §S23-§S25 — ARCHIVED (2026-08-19)

The superseded design trail (§S23 lane hardening · §S24 phase-gate shell · §S24_TRIAGE ·
§S25 layer contract · §S25_PROTO) is moved to
**`prompts/archive/4D_GANTT_TM_REFACTOR_S23-S25_superseded_2026-08-19.md`**, verbatim, ~850 lines.
**None of it is a build target.** §S24_TRIAGE.4's baseline table is reproduced in §S26 where it is
still cited. §S25_REVIEW stays below — it reviewed that trail and produced the one ship-ready
change in this file.

# §S25_REVIEW — outside review of §S25/§S25_PROTO, and what measurement did to it (2026-08-19).
# A Fable-model review was run adversarially against the spec, the prototype and the live engine. Its
# findings are recorded here with the outcome of CHECKING each one — accepted, refuted by experiment,
# or verified wrong. Two of its findings changed the headline of §S25_PROTO; one of its proposed fixes
# was tested and failed; one of its code claims is incorrect. Nothing was taken on the report's word.

## §S25_REVIEW.1 — ACCEPTED, and it is the most important correction in this lane: `engineGap = 0/7`
## is a TAUTOLOGY, not evidence. §S25_PROTO's headline was wrong.

Re-derived by reading the prototype's own code, not the report's summary: `engineGap(effective)`
spans each group by `effGroupOf` — the very membership the pass schedules with. Every element starts
at `max(predFinish, gateTime[effGroup])`; `gateTime[B] ≥ complete(A)`; and `complete(A)` is defined
as `max end over A's effective members` — exactly the quantity `engineGap` compares against. So
`min-start(B) ≥ max-end(A)` is **enforced arithmetic**. It cannot come out non-zero unless the
implementation is broken. It is a useful self-assert, nothing more, and **§S25_PROTO.2 presented it
as the proof that "the gate it enforces is enforced exactly"** — which is the precise failure this
file's own WATCHDOG block names: a proxy standing in for ground-truth validation. Demoted to an
assert; the prototype now prints that caveat inline on every `§S25P_VERDICT` line.

**A second-order consequence the review is also right about:** a re-homed element inherits its new
group's whole gate stack, which physics never demanded (physics demanded only "after my support
finishes"). That inflates the `asLabelled` magnitudes §S25_PROTO then blamed on classification. How
much of the −216d/−768d is gate inheritance rather than physics is NOT yet separated — open.

## §S25_REVIEW.2 — ACCEPTED: the like-for-like comparison existed in the log and was left out of the
## table. Here it is, and it does not flatter the design.

`§S25P_COMPARE` now prints it every run. Same name-based test, same run, all three engines
(negative pairs / worst gap · auditFloating · makespan days):

| building | RAW (local shell) | CPM (live today) | S25 v0 | S25 **+ corrected election (v2)** |
|---|---|---|---|---|
| Terminal | 11/17 −21.5d · **4** · 132.6 | 17/17 −76.0d · 4,756 · 85.1 | 16/17 −96.5d · 3,523 · 103.7 | **11/17** −97.5d · **1,555** · 103.7 |
| Hospital | 5/10 −41.5d · **0** · 333.4 | 10/10 −246.6d · 7,753 · 263.5 | 8/10 −216.8d · 4,095 · 298.1 | **4/10** −71.3d · **1,293** · 300.5 |
| Clinic | 7/10 −14.7d · **0** · 153.4 | 10/10 −85.0d · 1,102 · 96.1 | 10/10 −80.3d · 3,086 · 100.9 | 9/10 −84.2d · **327** · 105.5 |
| LTU_AHouse | 18/20 −112.8d · **25** · 886.1 | 19/20 −747.2d · 12,712 · 748.5 | 17/20 −794.2d · 19,327 · 797.8 | **16/20** −812.5d · **9,461** · 815.3 |
| Duplex | 4/4 −0.4d · **0** · 9.9 | 3/4 −6.3d · 247 · 8.3 | 4/4 −6.0d · 280 · 8.1 | **3/4** −2.5d · **152** · 8.4 |
| HHS | 4/4 −22.0d · **4** · 47.5 | 4/4 −27.4d · 1,531 · 28.8 | 4/4 −22.0d · 1,436 · 45.3 | 4/4 −21.1d · **243** · 45.8 |
| JKR | 14/17 −11.7d · **0** · 38.6 | 16/17 −16.3d · 3,183 · 16.5 | 16/17 −18.5d · 3,078 · 22.8 | **14/17** −24.0d · **1,072** · 28.7 |

Honest reading: **S25 v0 was roughly a wash against CPM and lost to RAW.** The FS makespan growth the
spec predicted is real and was unreported (Terminal 85→104d, Hospital 264→298d). **RAW still wins the
float invariant on 7/7** — its §DEQ_REPAIR loop enforces exactly that predicate — and no variant of
this design has beaten it there.

## §S25_REVIEW.3 — ACCEPTED: four real prototype defects, all fixed

`DUR` ignored `scaleFactor` though §S25.8 specifies it (no effect at scale 1, wrong in production);
a no-storey element with a grouped ancestor was silently lifted into a group it never belonged to,
feeding that group's completion while never counted as re-homed (§S25.7 says it gets no group gate —
now enforced); the contracted-component allocator reused an occupied crew slot with no counter where
`cpm_schedule.js` counts the same event as `drops.crewOverCapScc` (now counted — and it is **0 in the
default configuration**, but **35,705 on Terminal under the bearing-set variant**, which is how that
variant's collapse was caught); and `contradictionDropped: 0` was a dead counter reporting a rule C3
had already deleted — "measured 0 fleet-wide" was vacuous and is removed.

Also accepted, not yet fixed: **Tier-2 phases are ranked alphabetically** (`Finishes` < `MEP Final` <
`MEP Rough-in`), so a Rough-in→Final support classifies as "backward" by name accident. Some fraction
of the deferral population is that artifact. Needs a real Tier-2 order or an explicit "unordered
within Tier-2" rule.

## §S25_REVIEW.4 — ACCEPTED: `midair` and `crew` are structural zeros, not results

`midair 0→0` on 7/7 discriminates nothing: CPM satisfies it by construction (SS edge, never dropped)
and S25 satisfies it by construction (FS edge, always kept or contracted). `crewViol` only flags a
resource after >24h cumulative over-capacity. Of §S25_PROTO.2's four "clean" numbers only
**`leftover = 0`** is genuinely informative — and it stays genuinely informative.

## §S25_REVIEW.5 — REFUTED BY EXPERIMENT, and the refutation is worth more than the proposal:
## §S25.0's central premise is half wrong, and the cycles are intrinsic

The review proposed that C4's all-supports explosion was caused by the *embedded* clause (symmetric —
two coincident boxes each embed the other) and that constraining against exactly the judge's set
(every bearing-below support + the scoped hang set) would be cycle-free and viable. **Tested
(`SUPPORTS=bearing`): it explodes harder.** Largest physics component Terminal **35,217**, Hospital
**38,550**, LTU **62,703**; re-homed 80.7–97.9%; float far worse (Terminal 3,523 → **30,990**);
`crewOverCapScc` 35,705 on Terminal. Not viable.

Isolating why produced the real finding. **`SUPPORTS=bearingonly` (bearing-below edges only, no hang,
no host/opening) gives largest physics component = 1 on every building — zero cycles, zero
contraction, 7/7.** So:

> **Bearing-below alone is a strict order and cannot cycle. Every cycle in this system is created by
> the DOWN-POINTING families — hang, host, opening — whose direction contradicts elevation.**

That corrects §S25.0's premise ("physical support is a strict order by elevation, so it cannot
contain a cycle" — true only of bearing) and it partly vindicates the original CPM design's decision
to contract: any *edge-based* engine holding hang/host constraints must either contract them (which
collapses the schedule — 80-98% re-homed) or drop them (which leaves the float residual). RAW escapes
the dilemma by not using edges for this at all: `geoGate` reads only supports **already placed**, then
`§DEQ_REPAIR` sweeps to a fixpoint. That is the review's untested option (b) — *a placed-support gate
as a NUMBER, not an edge*, which is literally §S25.4's own "gates are numbers, never edges" doctrine
applied to L2. **It remains the one credible route to float→0 and it has still not been tried.**
`bearingonly` itself is dominated (float worse than the corrected election on 6/7) and is kept only
as the instrument that isolated the mechanism.

## ⛔ §S25_REVIEW.6 — CORRECTED 2026-08-19: the numbers below are a MIS-ATTRIBUTED COMPARISON

**The "better on 7/7 versus the live engine" claim is WRONG, and it was the single thing this file
called ship-ready. Verified in `scripts/proto_s25_forward_pass.js`:**

```
608:  const cpmRun = CpmSchedule.run(items, { maxCrews });   <- CPM baseline, computed FIRST
610:  let desOverride = null;                                 <- the v2 election is built AFTER
644:  const s25 = s25Compute(items, maxCrews, desOverride);   <- fed ONLY to the S25 prototype
```

`DESIG=v2` **never reaches `CpmSchedule.run`**. So the table below compares the §S25 PROTOTYPE pass
— its own level ladder, L3/L4 gates, crew allocator and duration model — carrying the v2 election,
against the untouched live engine. **It attributes the prototype's whole architecture to a tie-break
inside one function.**

**What the election tie-break ALONE actually does** (agent build 2026-08-19, branch
`fix/designated-support-election` in `/tmp/wt-desig-election`, both twins patched, port proven
faithful by 0 mismatches across 267,954 elements on all 7 buildings, two independent verifiers):

| building | proto path before→after | witness path before→after |
|---|---|---|
| Terminal | 4,756 → 2,451 | 10,011 → 6,174 |
| Hospital | 7,753 → 6,251 | 8,103 → 6,716 |
| Clinic | 1,102 → 653 | 1,205 → 812 |
| LTU_AHouse | 12,712 → 8,234 | 12,686 → 9,021 |
| Duplex | 247 → 111 | 237 → 65 |
| **HHS_Office** | **1,531 → 1,589 WORSE** | **1,491 → 2,505 WORSE (+68%)** |
| **JKR** | 3,183 → 2,999 | **3,385 → 3,581 WORSE** |

**6/7 (proto path) or 5/7 (witness path) — NOT 7/7.** Magnitudes fall far short of the 1,555 / 1,293
/ 327 promised below. The `-29% to -51%` backward-supports claim DOES hold — it is a pure property
of the election and is independent of the engine it runs in.

**Not shipped. No PR.** The agent hit §S25_REVIEW.9's STOP-AND-REPORT and stopped instead of tuning
the tie-break to chase the target numbers. The faithful port sits uncommitted for inspection.

**⚠ SEPARATE, PRE-EXISTING, AND UNRELATED TO THIS CHANGE: all 7 W-MZ-8 baselines are ALREADY RED on
`main` today** (`witness_midair_zero.js`, run before any edit): Terminal locked 8,789 / got 10,011 ·
Hospital 5,107 / 8,103 · Clinic 3,523 / 1,205 · LTU 15,896 / 12,686 · Duplex 289 / 237 · HHS 1,538 /
1,491 · JKR 3,736 / 3,385. `pass=32 fail=7`. **A locked baseline that no longer matches main is not
a lock.** Something moved all 7 and was never re-locked. Diagnose that BEFORE re-locking anything.

**⚠ AND: there are now THREE float numbers per building depending on the path** — the W-MZ-8 lock,
`proto_s25_forward_pass.js`, and `witness_midair_zero.js`'s own `_buildXrayElements`/
`_displayTimeline` chain (Duplex: 289 / 247 / 237). §S28.R already flagged this. **Every float number
in this lane must name its instrument or it is meaningless.**

The original section follows verbatim as the record of what was claimed.

## §S25_REVIEW.6 — THE WIN: correcting the support ELECTION improves every metric on every building,
## with no change to the engine at all

§S25_PROTO.4 item 1 said fixing `designatedSupport` was the highest-leverage item. Measured, it is.
The corrected election (`DESIG=v2`) keeps the classification exactly as shipped and changes only the
tie-break **between physically equivalent candidates**: at the same class, a structure-pool member
outranks a non-structural one (a pipe 1cm under a wall must not outrank the slab 10cm under it), then
a candidate that does not contradict the phase order outranks one that does.

- **Backward supports −51% to −29%**: Terminal 4,263→3,032 deferrals, Hospital 7,822→6,490, Clinic
  3,539→2,372, JKR 609→299, Duplex 112→66, HHS 1,166→761, LTU 13,460→12,290.
- **Float, versus the live engine: better on 7/7** — Terminal 4,756→**1,555**, Hospital
  7,753→**1,293**, Clinic 1,102→**327**, HHS 1,531→**243**, JKR 3,183→**1,072**, Duplex 247→**152**,
  LTU 12,712→**9,461**.
- **Phase gap, versus the live engine: better or equal on 7/7**, and better than RAW on 3
  (Hospital 4/10 vs 5/10, LTU 16/20 vs 18/20, Duplex 3/4 vs 4/4), equal on 3, worse on 1 (Clinic).

This is the first configuration in this lane that beats the shipped engine on both invariants at
once. It is also the cheapest: a tie-break inside one function.

## §S25_REVIEW.7 — one review claim VERIFIED WRONG, recorded so it is not inherited

The review states `contactGraph`'s carrier clause is a "±GAP = 0.5m band" and concludes rod-hung MEP
0.51-9.5m below its carrier gets no designated support at all. **Incorrect.** `cpm_schedule.js`'s
carrier clause is `S.bz >= T.tz - GAP && S.tz > T.tz + EPS` — a LOWER bound only, uncapped above (the
deliberate §DAY_GAP_TAIL asymmetry, already recorded in this project's memory). The ±GAP band the
review is thinking of is in `auditFloating`'s hang clause (`schedule_gate.js` ~1090), a different
function; the far-carrier case there is covered by §HANG_NEAREST for big elements. The review's
broader point — that S25 constrains against ONE support while `geoGate`/`wallGate`/`hangGate` take the
max over ALL — stands, and is §S25_REVIEW.5's subject.

## §S25_REVIEW.8 — ACCEPTED and still open (not fixed today, named so they are not lost)

- **Within-level trade order is deleted with no replacement.** `phaseTrade` (`schedule_gate.js`
  885-887) and per-trade `bandGate` die under §S25.9, and L3 orders Tier-2 only *after* Tier-1 — so
  MEP Final may run before MEP Rough-in, furniture before ductwork, on every level. §S25.4 must gain
  an intra-Tier-2 order (and see §S25_REVIEW.3's alphabetical artifact — same root).
- **§S25_PROTO.2's "no Tarjan… the machinery is unnecessary" is false as written.** Tarjan, SCC
  contraction, a condensation and a topological longest-path pass are all present — only the
  *merged-graph* scope is gone. The claim must be narrowed to that.
- **§S25.10's acceptance baselines are stale** (W-MZ-8's 8,789/5,107/15,896 came from the
  `_extracted.db` files T8 already flagged; the served-DB measurement is 4,756/7,753/12,712).
- **§S25P_BULK failed on 2/7** (Clinic 1/7 −10.61d, LTU 3/17 −672d) and §S25_PROTO reported no
  failure. Still needs guid-level attribution before the ladder-vs-name explanation is accepted.
- **Hospital's ladder places "Level 5" in four rows and merges `Level 5=Level 3=Level 6`** on a DB
  whose #1427/#1428 elevation patch is still unverified — the −216d Hospital figure may be
  substantially ladder/DB artifact.
- **Gantt-drag is still not a design** ("re-run with the element pinned" is undefined against gates,
  and bars are keyed on names the ladder splits/merges), and the `stragglerOf`/cache return contract
  in `_displayTimeline` still needs porting. Leftover elements currently return `{s:0,e:0}` — day-0
  placement, the exact §4D_NOGEO poison — which must become an explicit consumer contract.
- **Stability is unmeasured:** one added element can move a level's median, re-rank bands and cascade
  re-homing through thousands of elements, against caches keyed by `_GANTT_CACHE_VERSION`.

## §S25_REVIEW.9 — the next move, unchanged in shape but now decided by data

1. **Ship the corrected election first** (§S25_REVIEW.6). It is a tie-break in `designatedSupport`,
   it improves the LIVE engine's own float on 7/7 without any of §S25 being built, and it shrinks the
   population every later stage has to reason about. It needs its own witness (the election is a
   behavioural change to a function three consumers share) — that is the next commit, not a rewrite.
2. **Then test the placed-support NUMERIC gate** (§S25_REVIEW.5's option (b)) — the only untried
   route to float→0, and doctrinally the one §S25.4 already prescribes.
3. **Only then** consider wiring §S25 (§S25.11 S25-4), and not before §S25_REVIEW.1's gate-inheritance
   question is separated from the classification claim.

**STOP-AND-REPORT, inline:** if the corrected election is implemented in `designatedSupport` and the
live engine's float does NOT move as §S25_REVIEW.6 measured, the prototype's election differs from
the shipped one in some way not yet identified — report that difference, do not tune the tie-break
until the numbers agree.

---
# §S26 — THE SCHEDULE IS TRAINS, NOT A GRAPH (2026-08-19, measured)

**Standing:** proposed. Supersedes NOTHING yet — §S25 and §S25_REVIEW stay as written, and the
`designatedSupport` election win in §S25_REVIEW.6 is orthogonal to this and should ship on its own
merits. What §S26 challenges is not any fix in this file; it is the assumption every design in this
file has shared since §S23 — that element-to-element physical precedence is the right abstraction
for a construction schedule.

**Provenance, stated because it matters for how much weight this carries:** §S26 came out of a
2026-08-19 working conversation with the user, not from a spec review. Two of its load-bearing
claims are the USER's, not this session's, and both were then measured and held (§S26.3, §S26.6).
Every number below is from `scripts/probe_s26_rank_monotone.js`, written this session, run on the
same 7-building fleet as `proto_s25_forward_pass.js`, reading the same `contactGraph`/`hostPairs`/
`openingPairs` predicates so the numbers are directly comparable. **Nothing in `viewer/` was
changed.** Probe logs: `§S26G_*`.

## §S26.0 — the architecture changed on a known date, and the date is checkable

`viewer/cpm_schedule.js` is 3 days old (`a5de597`, 2026-08-16). The graph it consumes is not.
Ordering became a physics graph on **2026-08-07, PR #1242 `0fe8eb2`** — "placement order derived
from geometry DAG, seq demoted to tiebreak".

Before that commit, `schedule_gate.js` ordered by two plain sorts and used physics only as a clock:

```js
// 0fe8eb2^ viewer/schedule_gate.js:248-249, 268
var struct = elements.filter(e => e.seq <= 4).sort((a,b) => (a.base_z-b.base_z) || (a.seq-b.seq));
...
var start = Math.max(geoGate(el), slot.time);
```

A sort cannot cycle. A `max()` over already-placed elements cannot cycle. Three days after #1242,
PR #1276 landed `§TM_GEO_ORDER_CYCLES — Terminal support-DAG cycles 37,927→0`. Every design in this
file from §S23 onward is downstream of that one commit.

**This is not an argument that #1242 was wrong.** It closed a real defect (`nothing floats` as a
structural property rather than a per-building patch chase, and the commit message says so). It is
an argument that the cost has never been priced, and §S26.1-§S26.4 price it.

## §S26.1 — VERIFIED: the 93% blob is manufactured, and by which edges exactly

`probe_s26_rank_monotone.js` builds the required-precedence set from the same predicates the engine
uses, then measures its largest strongly-connected component. Two configurations, same fleet, same
run:

| building | n | live predicate | corrected predicate | ratio |
|---|---|---|---|---|
| Hospital_meta | 63,182 | **49,436** | 1,951 | 25× |
| LTU_AHouse_meta | 122,330 | **74,617** | 1,460 | 51× |
| Terminal_meta | 48,428 | **28,802** | 1,358 | 21× |
| Clinic_meta | 16,071 | **8,340** | 768 | 11× |
| JKR_extracted | — | **5,362** | 1,034 | 5× |
| HHS_Office_Federated | 6,839 | **4,628** | 1,742 | 2.7× |
| Duplex_extracted | 1,119 | **672** | 5 | 134× |

`corrected` = `STRUCT=1 EMBED=0`: a support must be a load-bearing class (the existing `seq<=4` +
promoted-slab pool), and the `embedded` family is dropped. The live largest-component share
reproduces §S24_TRIAGE's independently-measured fleet numbers (Hospital 98%, Terminal 93%, LTU 90%)
and §S25_REVIEW's `largest physics component 672` on Duplex — three separate probes agreeing.

**The blob is not a property of the building. It is a property of the predicate.**

## §S26.2 — VERIFIED: the predicate counts plumbing as structure

The live support test is geometric only — any lower box in contact is a support. Measured on Duplex:

- support = anything below → **4,706** bearing relations
- support = load-bearing classes → **702** (6.7× inflation)

Actual offending pairs, from `§S26G_EG`:

```
IfcFlowSegment @ -0.7m / MEP Rough-in   "supports"  IfcWallStandardCase @ 0.1m / Architecture
IfcFlowFitting @  2.6m / MEP Rough-in   "supports"  IfcWall             @ 3.1m / Architecture
```

Consequence — direct physics-vs-phase contradictions on Duplex, `§S26G_CAUSE`:

- support = anything below → **761**
- support = load-bearing classes → **1**

760 of 761 apparent conflicts between physics and phase order are the engine insisting a pipe must
be installed before the wall above it. **There is no physics-vs-convention war in this data.** There
is a predicate that calls plumbing structure, and a solver dutifully resolving the contradiction by
dragging MEP forward — which is the phase scramble this whole lane has been chasing.

## §S26.3 — VERIFIED: the `hang` family is redundant, and it is the sole remaining cycle source

**This claim is the USER's** ("this rule is redundant — when a ceiling is complete it no longer
arises"), recorded here because it was given more than once before it was measured.

Isolation, `STRUCT=1 EMBED=0`, `§S26G_ACYCLIC`:

| configuration | Clinic | Duplex | HHS |
|---|---|---|---|
| drop `hang`, keep bearing+host+opening | **acyclic, largest = 1** | **acyclic, largest = 1** | **acyclic, largest = 1** |
| keep `hang`, drop host+opening | 768 | 5 | 1,742 |

Every remaining cycle lives in `hang`. Host and opening are harmless.

And `hang` contributes no ordering that phase order does not already give — `§S26G_HANGREDUNDANT`,
share of hang edges where the carrier is already an earlier phase than the hanger:

| Hospital | LTU | Duplex | JKR | HHS | Clinic | Terminal |
|---|---|---|---|---|---|---|
| **99.8%** | 98.3% | 98.5% | 97.5% | 97.4% | 97.2% | 93.5% |

The residue is not hanging at all. Top same-phase pairs, `§S26G_HANGSAME`, all inside Superstructure:
`IfcSlab carries IfcBeam` ×153 (Clinic) ×91 (Hospital) · `IfcBeam carries IfcColumn` ×148 (LTU) ·
`IfcPlate carries IfcPlate` ×605 (Terminal). Phase-inverted residue, `§S26G_HANGINV`:
`IfcSlab/Superstructure carries IfcFooting/Substructure`.

A slab does not carry a beam; a beam does not carry a column; a slab does not carry a footing. **Not
one element in the residue is a light, a duct, or a fixture** — nothing in it is actually hanging.
The rule fires 8,026–49,199 times per building, is 93–99.8% redundant, and its non-redundant part is
the same relation with the direction reversed.

**Not chased today, and deliberately:** whether the reversal is a bbox-direction defect in the
predicate or genuinely mis-elevated geometry in the source models. The user ruled it not worth the
contention given the family is being deleted either way. Recorded so it is not rediscovered.

## §S26.4 — the design, stated in the user's terms rather than the graph's

Real programmes are not a dependency web. They are a small number of **trains**, each running level
by level, offset from each other:

```
Level 8   structure
Level 6              walls
Level 4                        MEP first fix
Level 2                                       finishes
```

Precedence lives at **(level, trade)**, never element-to-element. Physics is not the order; it is a
check run on the answer.

Two consequences that came out of the conversation and are design inputs, not observations:

**(a) The structural train's shape is a template, not a constant.** USER: *"beams and columns may all
come up all stories before even floor slabs come in."* That is steel-frame erection — frame runs
several floors ahead, deck and slabs follow. In-situ concrete does the opposite: a storey completes
before the one above starts. Both are common. **Default = in-situ concrete, floor by floor** (the
simpler shape and the common case for the DIY/small-firm long tail this product targets); steel-frame
is template two. A template is a JSON document — trains, order, offsets — editable by a planner
without a rebuild, which is the stated product requirement: *"as long as the resulting JSON is easily
editable by real experts… it can be crude, but they easily fill in the gap or readjust or simply
import their model."*

**(b) The mid-air judge is template-dependent, and today it is not.** Under a steel template a
level-5 column legitimately starts before the level-4 slab exists — it is bolted to the column
below, not resting on the slab. Today's judge would call that a defect and "fix" it. **A hard-coded
assumption about how buildings go up, applied to buildings that do not go up that way, is a latent
defect independent of everything else in this file.**

**Cast-in MEP is not MEP.** Conduit, sleeves and box-outs precede the pour but belong to the concrete
activity ("Slab L4 — rebar, conduit & box-outs, pour"), one bar owned by the structures contractor.
Wall first-fix sits inside or immediately after the wall activity. Neither is a separate trade item,
and neither ever gates the storey above. This is general construction practice, NOT extracted from
project data — flagged as such so it is checked against a real planner before it is built on.

## §S26.5 — HONEST RESULT: the strong form of §S26 is FALSE

The claim worth testing was: *a single integer rank R(e), computed from data alone, satisfies
R(S) < R(E) for every required relation* — which would make ordering a sort, with no graph at all.

**It does not hold.** `§S26G_VERDICT zeroViolation=0/7` in every configuration tried:

| configuration | violations | largest SCC (worst building) |
|---|---|---|
| live predicate | 27–39% | 74,617 |
| `STRUCT=1 EMBED=0` | 3–36% | 1,951 |
| `+ HANG=one` (single elected carrier) | 2.8–12.1% | 504 |
| `+ HANG=0` (family deleted) | 1.65–7.36% | **1 — acyclic on all 7** |

Two things follow, and they must not be merged:

1. **Deleting `hang` reaches acyclic on the FULL fleet** — `§S26G_ACYCLIC … kahnLeftover=0
   largestSCC=1` on all seven, Hospital 63,182 and LTU_AHouse 122,330 included. This is the §S26.8
   stage-1 stop condition and it is **MET**, not projected. The 49,436-element Hospital component
   and the 74,617-element LTU component do not shrink — they cease to exist.
2. **Even acyclic, 1.65–7.36% of relations still point backwards in rank.** Per building
   (`§S26G_VIOL`, `STRUCT=1 EMBED=0 HANG=0`):

   | building | total | bearing | host | opening |
   |---|---|---|---|---|
   | JKR_extracted | 341/20,686 (1.65%) | 86/19,921 | 59/506 | 196/259 |
   | Terminal_meta | 1,050/50,114 (2.10%) | 178/47,213 | 556/2,099 | 316/802 |
   | HHS_Office_Federated | 305/10,252 (2.98%) | 3/9,241 | 222/725 | 80/286 |
   | LTU_AHouse_meta | 124,124/3,933,718 (3.16%) | 120,876/3,925,180 | 1,865/5,466 | 1,383/3,072 |
   | Hospital_meta | 1,529/37,261 (4.10%) | 155/33,495 | 1,123/2,830 | 251/936 |
   | Duplex_extracted | 51/850 (6.00%) | 30/702 | 9/104 | 12/44 |
   | Clinic_meta | 834/11,325 (7.36%) | 261/8,189 | 484/2,737 | 89/399 |

   A sort alone therefore still leaves real backward relations, concentrated in `host` (Clinic 18%,
   HHS 31%, Hospital 40%) and `opening` (JKR 76%). They are *countable and nameable* rather than
   *silent*, which is the whole point of §S26.6, but they are not zero and §S26 must not claim they
   are. **LTU is the outlier and it is a density artefact, not a rate one** — its 120,876 bearing
   violations are 3.1% of 3.9M edges, see §S26.7's 32-supports-per-element flag.

## §S26.6 — WHY THE OLD DEFAULT FAILED, and whether it bites again

**This is the USER's question and it is the most important one in the section**, because §S26.4's
train model IS roughly what the pre-#1242 engine did. If it was abandoned once it can be abandoned
again.

The reason is written in the code at the exact place it was abandoned — `0fe8eb2^
schedule_gate.js:252-262`:

> *"band-gate WITH re-sorting by rank: inversions → 0, but **2,341 elements FLOAT again** (beams
> 15/1970, members 2304/7127, slabs 22/35). geoGate reads `grid`, which holds only what is already
> placed, so re-ordering PASS A places elements before their own supports."*

**The mechanism, exactly:** the *gate* scanned a partial grid containing only already-placed
elements. Reorder, and the support is simply not there to be seen. The gate returns `baseMs`, the
element starts at time zero, and **nothing reports it**. Not an exception, not a cycle, not a
warning — a silent zero.

Three named causes, each with a guard, because the shape of the fix decides whether it recurs:

**C1 — the gate was blind by construction; the judge never was.** `auditFloating(elements, sched, …)`
at `schedule_gate.js:1055-1059` builds its grids from **all** `elements`, not the partial placement
grid. The judge was always global and correct. Only the gate was partial. → **Guard: the gate must
use the judge's scan.** With rank computed up front rather than discovered incrementally, elements
process in rank order and supports are already placed by construction — for the 93–97% that are
rank-monotone. For the 3.0–7.4% that are not (§S26.5), the backward relation is **reported and
counted**, never silently skipped. That single change is the difference between the old default and
a safe return to it.

**C2 — the rank came from storey labels, and labels are junk.** Measured, `§S26G_LADDER`-equivalent
from the S25 probe: Clinic's `"Roof - Main"` occupies **three distinct elevations** (ranks 2, 3 and
4); LTU merges `VÅN 3=VÅN 4=VÅNING 4=Ref.` at −0.6m, and puts 44,383 of 122,330 elements (36%) in a
single group named `Plan 1`. → **Guard: rank comes from elevation bands only** (`§S1_BAND_RANK`'s 3m
bands, already shipped and already used by two other consumers). A storey label is a display name.

**C3 — the reaction changed the architecture instead of the verifier.** #1242 made floats
*structurally impossible* by making physics the order. That traded a silent failure for a structural
one: floats → 0, cycles → 37,927. → **Guard: a check that cannot fail is not a check.** §S25_REVIEW
caught this session's own instance of the same error — `engineGap = 0/7` published as proof when
`min-start(B) ≥ gateTime(B) ≥ complete(A) = max-end(A)` is enforced arithmetic. Same class, three
weeks apart, and it is the most likely thing in this file to recur.

## §S26.7 — what §S26 does NOT solve

Stated in full, because §S25.12's version of this list was incomplete and that was a review finding:

- **Crew levelling, durations, makespan realism, and whether a planner would call the output
  sensible.** Untouched. §S26 addresses ordering and mid-air only.
- **The 3.0–7.4% residual backward relations** (§S26.5), concentrated in `host`. Made visible, not
  eliminated.
- **The `host`/`opening` families' high violation rates** — host: Clinic 18%, HHS 31%, Hospital 40%;
  opening: JKR 76% (196/259) — undiagnosed. These are the largest remaining unknown in §S26 and the
  most likely place its residual 1.65–7.36% is hiding something structural rather than incidental.
- **LTU generates 3,925,180 bearing relations for 122,330 elements — 32 per element**, versus ~1 per
  element on Terminal (47,213/48,428). A 30× density outlier, cause unknown, flagged and not chased.
  Any implementation must expect it as a perf ceiling.
- **Template shapes beyond in-situ concrete and steel frame** — precast, tilt-up, timber — unexamined.
- **The construction-practice claims in §S26.4 are general knowledge, not project data**, and have
  not been checked with a real planner.
- **Nothing here is implemented.** `viewer/` is unchanged; `probe_s26_rank_monotone.js` is a probe.

## §S26.8 — build order, each stage with a stop condition that does not depend on a later stage

1. **Delete `hang`.** Stop condition: `§S26G_ACYCLIC` reports `largestSCC=1` on all **7** buildings.
   **✅ MET 2026-08-19** — `kahnLeftover=0 largestSCC=1` fleet-wide (§S26.5). Independently
   checkable — a property of the edge set, needing no scheduler to exist.
2. **Restrict `support` to load-bearing classes; drop `embedded`.** Stop condition: physics-vs-phase
   contradictions ≤ 1 per building (`§S26G_CAUSE` `phase=`). Also pure edge-set, no scheduler.
3. **Rank from elevation bands + phase.** Stop condition: backward-relation count reported per
   building and matching §S26.5's table to within noise. Pure data, no scheduler.
4. **Sort + `max()` clock, gate using the judge's global scan (C1).** Stop condition: `auditFloating`
   float count vs the live engine, on the same fleet — must not regress. First stage requiring a
   scheduler, and its check is the shipped judge, not a new one.
5. **Template file + offsets.** Stop condition: changing an offset in JSON changes the schedule and
   nothing else; the default reproduces stage 4's numbers exactly.
6. **Template-dependent mid-air judge (§S26.4b).** Stop condition: a steel template does not report
   a level-5 column as mid-air, and the concrete template still does when it genuinely is.

Stages 1–3 are edge-set properties measurable with the probe that already exists. **No stage depends
on a later stage to validate itself** — the specific defect §S25.11 was reviewed for.

## §S26.9 — STOP-AND-REPORT

- **Stage 1 is MET fleet-wide (§S26.5) — but on the PROBE's edge set, not the engine's.** If the
  engine reaches a different result after `hang` is removed for real, the engine's predicate differs
  from `probe_s26_rank_monotone.js`'s in some way not yet identified. Report that difference and
  STOP — do not delete a second family to chase it.
- **If the residual backward-relation count in stage 3 exceeds §S26.5's measured 3.0–7.4% band on any
  building**, the rank construction differs from this probe's. Report the difference; do not tune.
- **If any stage reports a `0` that cannot fail** (C3), treat it as unmeasured and say so in the same
  breath as reporting it. §S25_REVIEW's `engineGap` demotion is the precedent.
- **Before stage 5 is designed**, the §S26.4 construction-practice claims need one pass by someone
  with real planning experience. They are general knowledge, they are load-bearing for the template
  shape, and this session cannot verify them from project data.

## §S26.10 — the field already names all of this, and we never looked (2026-08-19)

USER, on being shown that the three arrow rules converge on location-based planning: *"It is
perplexing why we been doing without even a peek at what is out there."* Researched; the answer is
that every part of §S26.4 is established practice with a literature and commercial implementations.

- **LBMS (Location-Based Management System)** and **Takt planning** ARE the train model. LBMS is
  described as "the combination of location-based methods and a slightly modified Critical Path
  Method" — a location breakdown structure carrying location-based logic on top of CPM. Takt fixes
  the duration per location; LBMS keeps a crew moving with buffers.
  ([LBMS workflow/resource study](https://www.tandfonline.com/doi/full/10.1080/01446193.2017.1410561) ·
  [Takt vs LBMS comparison](https://iglcstorage.blob.core.windows.net/papers/attachment-bab39cab-949b-40a3-b03c-a1fd05b200f5.pdf))
- **Rule-based spatial reasoning from topology exists** — but never as bare geometric contact. It is
  always topology PLUS "structural construction, material layers and work access, some common
  construction practices and hierarchical relationships between the building entities."
  ([Automated Generation of 4D BIM through Spatial Reasoning](https://ascelibrary.org/doi/10.1061/9780784412329.062))
- **The reported limitation of the geometry-only approach is our exact bug:** approaches that stay
  "predominantly quantity- and geometry-driven… consequently require substantial expert intervention
  to define the breakdown and/or precedence relations at an actionable level."
  ([BIM–NLP framework survey](https://www.mdpi.com/2411-9660/10/2/43))
- **Commercial tools multiply recipes, not links.** ALICE "ingests the scope of the project, rules
  about how that scope gets built, and multiplies the rules across the scope."
  ([ALICE Model](https://www.alicetechnologies.com/alice-model) · [BEXEL Manager scheduling](https://bexelmanager.com/bexel-manager/scheduling/))
- **On cycles the field does the OPPOSITE of this engine:** "a graph-based cycle check is applied so
  any candidate link that would create a cycle in the precedence network is REJECTED. Self-loop
  relations are removed, and reverse duplicate links are avoided." Rejected at creation — the cycle
  never exists. `cpm_schedule.js` builds every link, then runs Tarjan and contracts what it finds,
  by which point the good links are inside the knot with the bad ones.

**Fourth practical rule, and the cheapest of the four: refuse a link that would close a cycle,
instead of creating it and breaking it later.**

## §S26.11 — the design restated top-down (supersedes §S26.4's phrasing, not its content)

§S26.4 arrived at the right shape from the wrong end — filtering a web down with boundary clauses.
Stated the way the field states it, there is no web:

1. **The unit of scheduling is a cell: one LOCATION × one TRADE.** Every element belongs to exactly
   one. "Level 3 × Superstructure" is a cell.
2. **Order is two ordered lists, not a graph.** Trades in fixed order within a location; locations
   bottom to top. Nothing to solve, nothing to untangle.
3. **Flow is the tuned parameter** — how far the structure train runs ahead of the walls train.
   LBMS vs Takt is exactly the choice of how that offset behaves.
4. **Arrows are the EXCEPTION**, added by a person where the grid genuinely gets it wrong (transfer
   beam, long-span truss, temporary works). A handful per building, not 2.46 million derived.
5. **A link that would close a cycle is refused, never created** (§S26.10).

§S26.4's three rules then stop being rules and become CONSEQUENCES: *same band* is free because a
cell IS a location; *forward in trade* is free because trades are an ordered list inside a cell;
*one arrow per element* is moot because elements carry no arrows. **The boundaries were being
invented to tame a structure that should not exist.**

Cost, stated plainly: the grid needs locations that are real. That becomes the ONE hard input —
see §S26.12.1, which is also where the answer already sits.

## §S26.12 — VERIFIED: four things the field solved that this repo re-derived or dropped

**1. The declared locations are already in the shipped DB, and the scheduler ignores them.**
`Hospital_meta.db` carries `spatial_structure` (212 rows — `IfcBuildingStorey` with its own z:
`Level 1` @ 168.73, `Level 2` @ 174.06), `rel_contained_in_space` (**8,474** element→room rows,
space guids like `RM_Level_2_25`), and `rel_aggregates` (9,528 declared parent→child). The scheduler
instead parses storey NAME strings through `collapsePhase()` and buckets `base_z` into 3m slabs.
**Rooms are what LBMS calls a location.** The junk-label problem (§S26.6 C2) is not a parsing
problem — the declared answer is in the file and unread.

**2. The host relation is declared in IFC, parsed on import, and dropped before the scheduler.**
`import_worker.js:315` reads `IfcRelVoidsElement` (wall→opening); `:328` reads `IfcRelFillsElement`
(opening→door). The shipped DBs carry neither — `schedule_gate.js:92` records this honestly ("no
IfcRelVoidsElement/host column exists in the shipped extracted DBs… so the host is inferred
geometrically"). Measured cost of that inference (§S26.5): host guesses point BACKWARDS 18% on
Clinic, 31% on HHS, 40% on Hospital; opening guesses 76% on JKR (196/259). **Not a predicate to
tune — a column that stops at the extractor.**

**3. Classification is hand-rolled** — `viewer/rates/sequence_rules.json` maps IFC class → trade by
hand, where Uniclass 2015 / OmniClass Table 22 / MasterFormat publish work sections with IFC
mappings. NOTE THE CONTRAST, because it is the diagnostic: `viewer/rates/` holds **17 national cost
libraries** (BCIS UK, RSMeans US, CIDB MY, Rawlinsons AU, SINAPI BR, GB50500 CN, KICT KR, …). The
cost domain was researched properly. The sequencing domain was not. Same repo, same author. Cost
*felt* like a domain with authorities; sequencing felt like a maths problem. It is not.

**4. IFC's native schedule schema — and this one is NOT a gap. See §S26.13.**

## §S26.13 — THE CONTAINER ALREADY EXISTS, WAS BUILT BY THE USER, AND IS EMPTY

USER: *"we just infuse them with such schedule format data rather than create another 'container'
framework."* Correct — and the container is already shipped, already declared source of truth, and
carrying zero rows.

**Is IFC's schedule schema usually empty in the wild? Measured on the actual source models:**

| model | IfcTask | IfcWorkSchedule | IfcRelSequence |
|---|---|---|---|
| Clinic · TerminalMerged · LTU_AHouse_AIR · Duplex_ARC · jkrST25 | 0 | 0 | 0 |
| **Hospital 2.0.ifc** | **121** | **1** | **43** |

Five of six carry nothing — so yes, usually empty. But the sixth carries a real planner's programme:
`IFCWORKPLAN 'Construction Programme'` · `IFCWORKSCHEDULE 'Baseline Schedule' .PLANNED.` ·
tasks `Structures` / `Piles` / `Zone A` / `Zone B` / `Zone C` · `IFCTASKTIME 'P15D'`
2026-05-16→2026-05-30 · 43 × `IFCRELSEQUENCE … .FINISH_START.` chaining Zone A→B→C.
**121 tasks for a 63,182-element building — the train model, authored by hand, at exactly the grain
the field uses, sitting inside this project's own test model.**

**Has this project ever used it? Yes — the user built it, in the Find Panel period.**
- `2253664` **2026-05-30, PR #59**, Redhuan D. Oon — "capture native IFC 4D in Drop-IFC importer
  (T1+T1b, widened schema)": walks `IfcWorkSchedule`/`IfcTask`(+`IfcTaskTime`)/`IfcRelSequence`,
  dual-direction task↔element links (`IfcRelAssignsToProcess` + `IfcRelAssignsToProduct` — "the
  Bonsai/Hospital fix that yields the 2900 links"), WBS via `IfcRelNests`, `IfcWorkCalendar`,
  "ISO-8601 durations/floats kept VERBATIM (PRIME RULE — no re-derivation)". Ported from
  bim-compiler T1+T1b, so the design predates the viewer.
- `b195103` **2026-06-23, PR #502** — "respect IFC schedules crafted in Bonsai/Revit (adopt, don't
  clobber)", logged as "User point (2026-06-23)".
- `schedule_author.js:6` states it outright: **"SOURCE OF TRUTH = the IFC-native tables
  `schedules`/`tasks`/`task_elements` ONLY"**.
- Dating the era: Find panel `§S275` landed `4352b04`/`58318b9` **2026-05-24**; find multi-select
  `#53` **2026-05-29**; the IFC 4D capture `#59` the NEXT DAY, **2026-05-30**. Same week, same burst.

**And every shipped building DB has the tables empty:**

```
Hospital_meta    schedules=0  tasks=0  task_sequences=0  task_elements=0
Clinic_meta      schedules=0  tasks=0  task_sequences=0  task_elements=0
Duplex_extracted schedules=0  tasks=0  task_sequences=0  task_elements=0
JKR_extracted    schedules=0  tasks=0  task_sequences=0  task_elements=0
Terminal_meta    (the tables do not exist at all)
```

Hospital's source IFC has the programme; `Hospital_meta.db` has zero rows. **The extraction pipeline
discards the planner's schedule.**

**The consequence, and it closes §S26's loop:** `task_sequences` is the `IfcRelSequence` mirror — the
declared home for dependencies. It holds ZERO rows while the engine derives 2.46 million arrows in
memory on every load. That is why the blob went unseen for weeks (the links were never written
anywhere anyone could look), and why the user's product requirement — *"the resulting JSON is easily
editable by real experts… they easily fill in the gap or readjust or simply import their model"* —
cannot be met today: **there is nothing to edit.**

**No new framework is needed.** Fill the tables already declared as source of truth, and the arrows
become rows a planner can see, sort, delete, or replace.

## §S26.14 — MEASURED: the §S26.3 change applied to the LIVE engine (branch, no PR)

Branch `fix/s26-drop-carrier-ordering` (bim-ootb), off `6a395ca`. One-line change in BOTH twins —
`cpm_schedule.js:138` and `time_machine.js:4593` — `designatedSupport` never elects a carrier-above.
`schedule_gate.js hangGate()` (the start-time CLOCK) deliberately untouched, so a genuine rod-hung
element still waits for its carrier. Both twins together because `witness_midair_zero.js:127` and
`probe_captured_floating.js` slice `_designatedSupport` out of `time_machine.js` BY SOURCE TEXT — a
`cpm_schedule`-only edit leaves those witnesses green on code that never ran.

| building | physics SCCs contracted | CPM float | CPM midair |
|---|---|---|---|
| Terminal_meta | 1,291 → **370** | 4,756 → 4,216 | 0 → 0 |
| Hospital_meta | 1,063 → **682** | 7,753 → 8,475 ⚠ | 0 → 0 |
| Clinic_meta | 748 → **662** | 1,102 → 991 | 0 → 0 |
| LTU_AHouse_meta | 5,983 → **4,917** | 12,712 → 11,663 | 0 → 0 |
| Duplex_extracted | 37 → **32** | 247 → 178 | 0 → 0 |
| HHS_Office_Federated | 289 → **130** | 1,531 → 1,279 | 0 → 0 |
| JKR_extracted | 141 → **93** | 3,183 → 3,410 ⚠ | 0 → 0 |

Phase `negGap`: better on 2, worse on 1, unchanged on 4 — **not fixed by this change.**

**HONEST NEGATIVE, and §S26.9's STOP-AND-REPORT was honoured rather than chased:** this does NOT
reproduce the probe's acyclic 7/7. The probe needed THREE changes (drop hang, restrict support to
load-bearing classes, drop `embedded`); this branch makes ONE. Reported, stopped, no second family
deleted to close the gap.

## §S26.15 — STOP-AND-REPORT, added

- **Before any grid/location work, confirm `rel_contained_in_space` coverage per building.** Hospital
  has 8,474 rows for 63,182 elements — **13%**. If room containment covers only a small minority
  fleet-wide, locations must fall back to storeys and §S26.11's cell grid is coarser than LBMS
  assumes. Measure before designing on it.
- **Do NOT "fix" the empty `tasks`/`task_sequences` tables by generating rows from the current
  engine.** That would persist the 2.46-million-arrow web into the IFC-native container and make the
  blob permanent instead of ephemeral. The tables are for a summary programme at Hospital's grain
  (121 tasks), not for element-level physics.
- **Terminal_meta.db lacks the 4D tables entirely** while the other six have them empty — two
  different extraction vintages in one shipped fleet. Establish which is current before either is
  treated as the schema.

## §S26.16 — Room Path reuse: the right machine, the wrong output grain (cursory check, 2026-08-19)

USER: *"The Room Path effort also can be refactored for reuse here."* Checked. The instinct is
right and the reuse is real, but not as a drop-in — the numbers say why.

**What it already is.** `bim-compiler/scripts/compile_rooms.py` and its verbatim JS port
`build/room_walker.js` (also shipped at `bim-ootb/viewer/lib/room_walker.js`) rasterize each
storey's wall/door/column/window footprint at `RES=0.20m`, flood-fill the exterior from the border,
and treat every pocket the exterior cannot reach as a room. **Its output is exactly the two tables
§S26.11 needs**: `spatial_structure` IfcSpace rows and `rel_contained_in_space`. It is also the
answer to a question §S26.12.1 left open — Hospital's 8,474 containment rows are COMPILED by this,
not read from the IFC.

It is hardened, not a sketch: `§RASTER-EPS` (1e-6 cell-fraction snap — translation invariance,
measured 8/14 translations previously flipped Terminal's compile), `§STAIR-EXCLUDE` (a stairwell is
circulation, not a room), `§SUSPECT-LARGE` (a fixed area drop threshold was silently eating HHS
Level 3's real 456 m² corridor and causing 73/70 room-graph dead-ends — now flags instead of drops).
That is the same measure-then-fix discipline this file runs on.

**Why it cannot be the location layer as-is — measured coverage:**

| building | elements | storey rows | IfcSpace | contained | coverage |
|---|---|---|---|---|---|
| Hospital_meta | 63,415 | 63 | 142 | 8,474 | **13%** |
| Clinic_meta | 16,114 | 3 | 118 | 2,133 | **13%** |
| Terminal_meta | 48,428 | 73 | 73 | 1,009 | **2%** |
| JKR_extracted | 9,410 | 4 | 79 | 107 | **1%** |
| HHS_Office_Federated | 6,880 | 3 | 14 | 88 | **1%** |
| LTU_AHouse_meta | 125,698 | 38 | 0 | 0 | **0%** |
| Duplex_extracted | 1,193 | — | — | — | tables absent |

**The cause is structural, not a bug: a room is a void bounded by fabric, so the fabric is never in
it.** `rel_contained_in_space` assigns "elements whose XY centre falls in a room" — a wall's centre
is inside the wall, a slab spans every room at once, a column sits in a wall line. Structure is what
makes rooms, so structure has no room. Rooms cover a building's CONTENTS; a schedule must place its
FABRIC. 87-100% of elements are unplaced.

**Second caveat, and it is the §S26.6 C2 problem appearing in the declared data too:** Hospital's
`spatial_structure` reports **63 storeys**, Terminal **73**, LTU **38**. Those are federated
pseudo-storeys. Declared containment is not automatically clean containment — it needs the same
band-merge treatment storey names do.

**The reuse that IS sound — one rasterizer, two consumers.** The valuable asset is not the room
list; it is the per-storey occupancy raster that produces it (already persisted for two buildings as
`storey_walkable_raster`). Partition that same raster into contiguous **ZONES** and every element on
the storey — fabric included — falls in one.

Zones, not rooms, are the LBMS location for structure, and this project already has the proof in its
own test data: Hospital 2.0.ifc's hand-authored programme (§S26.13) uses tasks named **`Zone A` /
`Zone B` / `Zone C`**, chained `.FINISH_START.`. A human planner, on this exact building, chose
storey-zones as the location grain. Rooms stay the right grain for the trades that work inside them
(architecture, MEP, finishes) — a second, finer level of the same breakdown structure, which is what
a location breakdown structure is for.

**STOP-AND-REPORT:** do NOT fold room compilation into the scheduler before zone coverage is
measured the same way this table measures room coverage. The failure mode is identical — a location
layer that covers a minority of elements silently sends the majority to a default bucket, which is
how the storey-name path failed in the first place.

---

---

# §S27-§S28 — ARCHIVED (2026-08-19), and §RESULTS superseded

Two rejected designs and one superseded session-close note, moved to
**`prompts/archive/4D_GANTT_TM_REFACTOR_S27-S28_rejected_2026-08-19.md`**, verbatim.
**Neither design is a build target and neither should be revived as written.**

- **§S27 "the grid"** — NOT VETTED, 4 blocking (§S27.R). Its zone compiler wrote to the DB, which
  §S32.1 rule 2 later forbade outright.
- **§S28 "two lanes"** — NOT VETTED, 4 blocking (§S28.R). Its central premise, that the two lanes
  are independent, was shown false in both directions.
- **§RESULTS (2026-08-18)** — self-described as *"pending a full spec overhaul, not a continuation
  point."* That overhaul happened; `# §STATUS` replaces it.

The facts that survived them are live: §S32 (ruling) · §S37 (ledger) · §S41 (working rules) · and
the measured sections §S26 · §S29 · §S30 · §S31 · §S33-§S36 · §S38 · §S39.

# §S29 — GENERALITY AUDIT: the grid is fitted to 7 multi-storey buildings (2026-08-19)

**Standing: PROPOSED.** Written on the user's directive — *"look out for omissions, gaps in the
model, comparing with what was done onset that was OK, and what is done by others… It has to be
fundamentally handle general cases not particular."* Applies to §S28 and, where noted, to the live
engine as well. Held out of the file until §S28.R lands (concurrent-edit discipline).

## §S29.0 — the test set is not a test set

All 7 fleet buildings are **multi-storey buildings with named storeys, one building each,
new-build, vertical**:

| building | n | storeys | buildings |
|---|---|---|---|
| Terminal_meta | 48,428 | 23 | 1 (`TerminalMerged`) |
| Hospital_meta | 63,415 | 9 | 1 |
| Clinic_meta | 16,114 | 8 | 1 |
| LTU_AHouse_meta | 125,698 | 19 | **no `building` column at all** |
| JKR_extracted | 9,410 | 21 | 1 |
| HHS_Office_Federated | 6,880 | 5 | 1 (despite the name) |
| Duplex_extracted | 1,193 | 5 | 1 |

Every design decision in §S25/§S26/§S27/§S28 was validated against this one shape. **A spec that
passes 7/7 here has been shown to work on one building type.**

## §S29.1 — THE CORE FINDING: the grid needs 4 inputs where the onset needed 2

**Onset (pre-`0fe8eb2`, `schedule_gate.js:248-268`):**
```
struct.sort((base_z, seq)) · nonst.sort((seq, rank, base_z))
start = max(geoGate(el), crewSlot)
```
Required inputs: **`base_z` and `seq`. Two numbers per element.** No storeys, no bands, no zones,
no rooms, no phases, no template. It produces *some* defensible order on any model with geometry
and a class — a warehouse, a bridge, a fit-out, a model with no storey data at all.

**§S28's grid:** `bandRank` (needs meaningful z-stratification) × `zone` (needs a plan raster with
separable components) × `seq` (needs `sequence_rules.json` to cover the model's classes) ×
`template` (needs trades matching the model's actual content). **Four inputs, each of which can be
absent, degenerate, or meaningless.**

**This is a generality REGRESSION versus the thing being replaced, and the spec does not say so.**

**And the failure modes differ in visibility, which is worse than the input count:**
- Onset failed **loudly** — elements float, and `auditFloating` counts them.
- The grid fails **silently** — a degenerate grid produces ONE BIG BAR, and one bar looks like a
  schedule. Nothing in §S28 detects it.

**STOP-AND-REPORT: §S28 needs a DEGENERACY DETECTOR before it needs anything else** —
`cells / elements` ratio, and a hard report when any level yields 1 zone AND 1 trade, or when
`distinct(cells) < 4`. A schedule with fewer cells than trades is not a schedule.

## §S29.2 — `band = floor(z/3)` assumes VERTICAL is the location axis. That is the deepest
particular assumption in the whole design.

A road, bridge, tunnel, jetty, or rail alignment stratifies along a **horizontal chainage**, not
elevation. Their locations are `CH 0+000 → 0+250 → 0+500`. There are no storeys, and z is roughly
constant.

**This is not hypothetical for this project:** `prompts/INFRA_ROAD_RAIL_GAP_CLOSURE.md` exists in
this repo (2026-08-19 working set), and IFC 4.3 ships `IfcFacility`/`IfcBridge`/`IfcRoad`/
`IfcRailway` precisely for it. **A z-band grid cannot schedule a road at all** — every element
lands in one band, the grid collapses to trades, and §S29.1's silent failure fires.

**The general form:** the location axis is **the direction the work progresses along**, which is
vertical for buildings and longitudinal for infrastructure. `floor(z/3)` is one instance of
`floor(projection onto the progression axis / quantum)`.

## §S29.3 — what others do about generality: the LBS is DATA with VARIABLE DEPTH, not a derivation

LBMS's answer (§S26.10) is a **Location Breakdown Structure** that the planner defines, typically
`Site → Building → Section → Floor → Zone → Room`, with each project choosing its own depth. That
single mechanism covers a hospital, a campus and a bridge because the *structure* is an input.

**§S28 hard-codes depth at 2 or 3** (`level × trade`, or `level × zone × trade`). Every generality
question then becomes a special case instead of a parameter:

| project | LBS the field would use | what §S28 gives |
|---|---|---|
| single-storey warehouse | `Building → Zone` | 1 band → trades only |
| hospital | `Building → Floor → Zone` | fits |
| 3-building campus | `Site → Building → Floor → Zone` | **§S29.4 — broken** |
| road | `Route → Chainage` | **§S29.2 — impossible** |
| fit-out | `Floor → Room` | rooms unused (§S27.3) |

**RECOMMENDATION: make the LBS a variable-depth list of AXES, each with its own key function**, and
let the shipped default be `[building, band(z,3m), zone]`. Then infrastructure is a different axis
list, not a different engine — the same move §S28.5's template made for trade order.

## §S29.4 — VERIFIED GAP: multi-building federation merges across buildings

`elements_meta` carries a `building` column — **and LTU_AHouse_meta has no such column at all**,
so the schema is not uniform across the shipped fleet. All 7 fleet buildings report exactly ONE
building, so **this path has never been exercised.**

On a federated campus model, Building A's Level 3 and Building B's Level 3 sit at the same
elevation → the same band → **the same cell → scheduled as one activity**. Two separate structures,
one bar, no way to sequence one before the other.

Federation is not an edge case — it is what BIM coordination *is*, and `HHS_Office_Federated` is
literally named for it. **`building` must be the outermost LBS axis, above band** (§S29.3), and
§S28 does not mention it.

## §S29.5 — `SEQUENCE_DEFAULT` makes an unknown model collapse to one trade, silently

`viewer/rates/sequence_rules.json`: `SEQUENCE_DEFAULT = {phase: "Architecture", sequence: 6}`.

Any class the rules do not cover becomes seq 6. A model dominated by unmatched classes — a process
plant (`IfcTank`, `IfcChimney`, `IfcDistributionChamberElement`), an infrastructure model, a
proprietary export — yields **one seq for the whole building → one cell per zone → one bar.**
Again silent, again §S29.1.

**STOP-AND-REPORT: report `unmatchedClassRate` per building at Lane B's B3 step.** It is currently
measured nowhere, and it is the single number that tells you whether trade order means anything on
a given model.

## §S29.6 — omissions shared by BOTH the onset and the grid (neither is a regression; both are gaps)

- **Demolition / refurbishment.** All 7 buildings are new-build. Refurb inverts the order —
  top-down strip-out before anything ascends. An ascending-only grid cannot express it, and neither
  could the onset sort.
- **Calendar.** `IfcWorkCalendar` is captured by PR #59 (`2253664`) and consumed by nothing.
  Durations are raw days: no weekends, no public holidays, no monsoon shutdown. Real programmes are
  quoted in working days.
- **Procurement / lead time.** Many real programmes are lead-time-driven (structural steel ordered
  12 weeks ahead), not physics- or crew-driven. Neither design has any representation for a
  constraint that is not a physical or resource one.
- **Site and external works.** Roads, drainage, landscaping, temporary works — no storey, often no
  z-stratification. Same shape as §S29.2.
- **Serpentine crew flow.** §S28.8 names it as unmodelled. The GENERAL principle is "the crew's next
  location is the nearest unfinished one", not "reverse alternate levels" — worth stating that way
  so it is not implemented as a Hospital-specific hack.

## §S29.7 — what to change in §S28, ranked

1. **Add the degeneracy detector (§S29.1).** Cheapest, catches the whole silent-failure class, and
   is needed regardless of every other item here.
2. **Make the LBS a variable-depth axis list (§S29.3), with `building` outermost (§S29.4).**
   Default `[building, band(z,3m), zone]` reproduces §S28 exactly on all 7 fleet buildings, so it
   costs nothing today and is the only item that makes infrastructure reachable later.
3. **Report `unmatchedClassRate` (§S29.5).**
4. **State the progression axis explicitly (§S29.2)** even if v1 only implements vertical — so the
   assumption is visible rather than buried in `floor(z/3)`.
5. **Name demolition, calendar, procurement, external works as OUT (§S29.6)** rather than
   unmentioned. §S28.8 currently implies the gap list is complete and it is not.

## §S29.8 — the honest summary

§S28 is a good design **for multi-storey new-build buildings with usable storey data and covered
IFC classes** — which is the fleet, and plausibly most of the addressable market. It is not
fundamental in the sense the user asked for: three of its four inputs (band, zone, template) are
undefined or degenerate outside that shape, and it fails silently rather than loudly when they are.

**Items 1-3 of §S29.7 close the silent-failure class and cost almost nothing on the current fleet.
Item 2 is the one that decides whether this design generalises or gets rewritten when the first
road model arrives.**

---
# §S30 — THE MEASUREMENT BOTH VETTING PASSES DEMANDED (2026-08-19)

`scripts/probe_s30_sortkey.js`. STUDY ONLY, `viewer/` unchanged. §S27.R and §S28.R independently
found the same hole: **Lane A's literal sort key had never been run.** `probe_s26_rank_monotone.js`
measures `(bandRank, phaseRank, depth, bz, guid)` WITH host/carrier band inheritance — it contains
the phase order §S28.1 outlawed plus two components Lane A drops. Every Lane A number was inherited
from an instrument that does not measure Lane A. This runs the literal key.

**Method:** order by the key; clock = `start(e) = max(end of every already-placed real support,
crew slot)` — the pre-`0fe8eb2` architecture with §S26.6's C1 guard (GLOBAL scan, a support that
sorts later is COUNTED not silently skipped); score with the SHIPPED judge called the working way,
`ScheduleGate.auditFloating(keep, schedMap)` on ORIGINAL elements. Baseline = live CPM, same run.

**Instrument guards, because this session produced two false zeros before getting it right:**
`durOk=true` and `judgeCanFail=true` printed on every line. The first false zero passed remapped
objects with `bz`/`tz` where the judge reads `base_z`/`top_z` — every predicate saw `undefined`,
`auditFloating(keep,m)=247` vs `auditFloating(items,m)=0` on the SAME schedule. The second omitted
`s`/`e`, so every duration was 0 and nothing could start before a zero-length thing finished. Both
returned a clean 100% correct on 7/7. **A green number here is worthless until the instrument has
been shown to go red.**

## §S30.1 — RESULT: `KEY=(bandRank, seq, base_z, guid)` — the literal §S28.7 key

| building | n | float CPM → SORT | | makespan | backward-support elements |
|---|---|---|---|---|---|
| LTU_AHouse | 122,330 | 12,712 → **2,752** | −78% | 749d → 844d | 59.5% |
| Terminal | 48,428 | 4,756 → **1,722** | −64% | 85d → 100d | 21.0% |
| Hospital | 63,182 | 7,753 → **3,136** | −60% | 264d → 352d | 61.9% |
| Clinic | 16,071 | 1,102 → **552** | −50% | 96d → 108d | 52.8% |
| JKR | 8,985 | 3,183 → **1,925** | −40% | 17d → 29d | 65.5% |
| Duplex | 1,119 | 247 → 257 | +10 ⚠ | 8d → 8d | 58.4% |
| HHS_Office | 6,839 | 1,531 → **2,103** | +572 ⚠ | 29d → 37d | 48.5% |

**`floatNoWorseThanCPM = 5/7.`** Not the clean pass Lane A assumed, not the failure either.

## §S30.2 — `KEY=(bandRank, base_z, seq)` is WORSE, and that overturns the stated intuition

| building | float CPM → SORT | |
|---|---|---|
| Terminal | 4,756 → 3,141 | PASS |
| JKR | 3,183 → 2,218 | PASS |
| Hospital | 7,753 → 8,147 | +394 |
| Duplex | 247 → 368 | +121 |
| HHS_Office | 1,531 → 2,337 | +806 |
| Clinic | 1,102 → 3,863 | **+2,761** |
| LTU_AHouse | 12,712 → 23,085 | **+10,373** |

**`floatNoWorseThanCPM = 2/7.`** Ordering by elevation *before* trade — the physics-respecting key,
the one this file's own reasoning kept reaching for — is **substantially worse** than trade-first.
Clinic nearly quadruples. That is a measured refutation of an assumption stated repeatedly in
§S26–§S29, including by this author, and it was never tested until now.

## §S30.3 — the finding that matters more than either verdict

**Backward supports are not a residual. They are the norm: 21.0–65.5% of elements have at least
one support that sorts after them.** Raw counts run 2,015 (Duplex) to 1,146,641 (LTU).

§S26.6's C1 guard says such a support is "reported and counted, never silently skipped" — and it
is. But §S28.7 presented C1 as the thing that makes a sort safe. **It does not make it safe; it
makes the damage visible.** A support that sorts later has no finish time to `max()` against, so
the dependent starts early regardless. §S28.R said exactly this ("the C1 guard fixes support
*visibility*, not the *clock*") and it is now measured: correct, and larger than anyone assumed.

**⚠ Confound, named rather than resolved: the float gains may be partly bought with delay.**
Makespan inflates on every building — Hospital +34%, JKR +77%, LTU +13%. Crew queueing pushes
starts later, which incidentally covers gates the sort failed to enforce. The correlation is NOT
clean (Duplex makespan flat yet float worse; HHS makespan +29% and float worse), so delay is not
the whole story — but no run here separates "ordered correctly" from "delayed enough to look
ordered." **Until that separation is measured, §S30.1's 5/7 must not be quoted as ordering quality.**

## §S30.4 — what this settles, and what it does not

**Settles:**
- The literal Lane A key beats live CPM on float on 5/7 buildings, by 40–78% where it wins. The
  sort-based direction is NOT dead — the outcome §S28.R correctly refused to assume either way.
- Trade-first beats elevation-first, decisively (5/7 vs 2/7). The opposite was assumed throughout.
- A pure sort does not eliminate backward supports. At 21–65% it is the dominant behaviour, not an
  edge case, so any design claiming a sort makes physics safe is wrong as stated.

**Does not settle:**
- Whether the float win is ordering or queueing (§S30.3 confound). **This is the next measurement
  and it is cheap:** re-run with crew caps lifted, so delay cannot mask a missing gate.
- Why HHS_Office and Duplex regress while the other five improve. Both are small; not diagnosed.
- Anything about phase-gap, zones, templates, or the IFC-native tables. Untouched here.

## §S30.5 — STOP-AND-REPORT

- **Do NOT start Lane A on this result.** 5/7 with an unseparated confound and 21–65% backward
  supports is a reason to run one more probe, not to change `viewer/`.
- **§S28.7's C1 claim must be restated** before any build: C1 makes backward supports *visible*, it
  does not make a sort *safe*. The current wording implies float parity follows from C1. It does not.
- **Any future number from this lane prints `durOk` and `judgeCanFail`.** Two false zeros in one
  session, plus §S25_REVIEW's `engineGap` tautology three weeks earlier, is three instances of the
  same class. It is the most reliable failure mode in this file.
---
# §S31 — THE EXTRACTION CHAIN: what is actually lost, and where (2026-08-19)

> ➡ **§S31–§S38 IS THE BUILD TRAIL FOR THE LEVEL RELATION. IT IS NO LONGER THE CURRENT OWNER.**
> **Current owner: `prompts/4D_MODEL_INTEGRITY.md` §I.3a** (`viewer/lib/level_deriver.js`
> `LevelDeriver.derive/levelFor`), with §I's OWNERSHIP TABLE row *"what level is it on?"* above it.
> **Read §I.3a for the live status** — what is wired, what is flag-gated, what the shipped DBs
> actually carry today. **Read this band (§S31–§S38) for WHY it is shaped that way** — §S34.3's
> ruling, §S35's 14 fixtures and the two-intervals bug, §S38's name ladder. Both are load-bearing;
> neither replaces the other. **Nothing here is deleted or archived** — a closed measurement trail is
> the record that stops a fourth re-derivation.
> ⚠ §I.3a carries **one unresolved disagreement with §S35.2** (same 63,182 Hospital elements,
> `declared, k=7` here vs `uniform3m` there, on differently-named DB files). It is flagged in §I.3a,
> not resolved in either file. *(Cross-reference added 2026-08-27, consolidation L3.)*

**Recorded late, and that is the finding to note first.** Everything below was measured across
2026-08-19 and existed only in conversation for several hours while `§S29` sat unwritten in a
scratchpad. The user's correction — *"this is repetition! already done a few posts ago. Why don't
u record what was done?"* — is upheld: re-running a measurement because the first result was never
written down is the same waste this file's `⚠ WATCHDOG` header exists to prevent. **A measurement
that is not in this file did not happen.**

## §S31.1 — §S30.6 RESULT: the crew confound, separated (the run §S30.4 called for)

`NOCREW=1` lifts capacity on BOTH engines, so queueing delay cannot mask a gate the sort failed to
enforce. Whatever float survives is ORDERING, not waiting.

| building | float CPM | float SORT | sort better by |
|---|---|---|---|
| Terminal | 38,722 | **3,052** | 12.7× |
| LTU_AHouse | 56,128 | **15,630** | 3.6× |
| Hospital | 18,594 | **5,908** | 3.1× |
| Clinic | 7,398 | **3,242** | 2.3× |
| JKR | 4,530 | **2,262** | 2.0× |
| Duplex | 632 | **324** | 2.0× |
| HHS_Office | 3,999 | **3,048** | 1.3× |

**`floatNoWorseThanCPM = 7/7`** (was 5/7 with caps on — Duplex and HHS_Office both flip to PASS).

**The confound resolved AGAINST the live engine, not against the sort.** Comparing each engine to
its own capped run: CPM 4,756 → 38,722 on Terminal (**8× worse** once queueing stops covering for
it); the sort 1,722 → 3,052 (under 2×). **The live engine's float number is substantially an
artifact of crew delay masking bad ordering.**

Mechanism, visible in makespan: with caps lifted CPM finishes Terminal in **0.6 days** — nearly
everything starting at once. That is the blob. The graph collapses to one component, contraction
gives the whole component a shared start, and every dependency inside it evaporates. The sort takes
4.6 days because it actually waits for supports. **The 49,436-element blob was not merely
scrambling phase order; it was destroying the dependency chain outright.**

`KEY=zfirst` under NOCREW **also reaches 7/7** (run completed 2026-08-19): Terminal 3,144 ·
Hospital 8,124 · Clinic 3,863 · LTU 24,166 · Duplex 368 · HHS_Office 2,337 · JKR 2,228 — every one
better than CPM. So the seqfirst-vs-zfirst gap of §S30.2 is entirely a CAPPED-crew phenomenon:

| condition | seqfirst | zfirst |
|---|---|---|
| crew caps ON (shipping condition) | **5/7** | **2/7** |
| crew caps LIFTED | **7/7** | **7/7** |

**§S30.2's "trade-first decisively beats elevation-first" is hereby QUALIFIED and must not be
quoted bare.** Both keys beat the live engine on ordering alone. Trade-first only pulls ahead once
finite crews are in play — i.e. the advantage is in how the two keys INTERACT WITH CREW QUEUEING,
not in ordering quality. seqfirst groups same-trade work together, so a capped crew pool drains in
one place instead of thrashing between trades; zfirst interleaves trades within a band and makes
every crew queue longer. That is a resource-levelling property, and it is a better reason to prefer
trade-first than the one §S30.2 gave — but it also means neither key is the "physically correct"
order the earlier sections kept reaching for.

One outlier to keep visible: zfirst's LTU makespan is **125.3d** vs seqfirst's 113.3d and CPM's
1.2d, on the same uncapped run. A 100× spread between engines on one building is not explained here.

## §S31.2 — VERIFIED: the extractor is NOT broken; the shipped DBs are stale

User challenge: *"since when is our IFC to DB extraction broken? I need to be convinced as it was
working very well."* Upheld — the "broken extractor" framing (raised by an outside review) is wrong.

`DAGCompiler/python/extractIFCtoDB.py` already declares the relation schema said to be missing:

```sql
CREATE TABLE rel_fills_host (...)    -- IfcRelVoidsElement ∘ IfcRelFillsElement, "recovered
                                     -- verbatim… NON-INVENT, we copy authored relations"
CREATE TABLE port_elements (...)     -- IfcRelConnectsPorts
CREATE TABLE port_connections (...)
CREATE TABLE rel_adjacency / rel_anchored / datum_plane / rel_aggregates / rel_contained_in_space
```

The browser importer reads VOIDS/FILLS into `bom_tree` (`import_worker.js:315,328`) and has since
the 2026-05-23 initial migration. **Both extractors preserve these relations.**

The shipped `buildings/*.db` predate that work and were never rebuilt. `JKR_extracted.db`:
`project_name=jkr_aligned`, `import_date=2026-07-11`, browser-built (`component_geometries`, not
`base_geometries`), **no `bom_tree` table, no `elevation` column**. So every "relation table is
empty" observation is a STALE ARTIFACT, not a lossy pipeline.

**Two corrections to the outside review, both measured:**
- *"`IfcRelSequence` present in source, 0 rows in DB"* — **fabricated.** All 7 JKR discipline files
  grep to `IFCRELSEQUENCE:0`. Nothing was dropped; JKR has no programme. Only `Hospital 2.0.ifc`
  carries one (43 links).
- *"`IfcRelContainedInSpatialStructure` 5+22 in source but 107 in DB — synthesized?"* — 50 across
  all 7 files, and the extractor composes containment from several sources. Not an inflation.

**Merge unblocked, 2026-08-19 (`86b059df2`):** the `extractIFCtoDB.py` conflict with `origin/master`
that blocked the docs deploy was **97% line-ending noise** — master flipped the file to CRLF, this
branch is LF, so all 3,113 lines read as changed. Normalising both sides to LF and re-running the
3-way merge against the merge-base gives **zero conflicting hunks**; the two changes are additive.
Resolution keeps both: master's §S21 (`spatial_structure.elevation` + real `IfcBuilding` parentage
via `.Decomposes`) and this branch's §KUL001 (`elements_meta.building` + `project_metadata`).
3,113/3,118 → 3,151 lines, LF throughout, `py_compile` passes.

## §S31.3 — ⛔ RETRACTED (2026-08-19, same day, by measurement) — the storey-Name claim was WRONG

**This section originally asserted that `extractIFCtoDB.py:499` `return container.Name` was a
one-line defect producing Clinic's three-elevation `"Roof - Main"`, Terminal's 73 storeys, and the
whole label-parsing problem. That is wrong on two counts and is retracted in full.** It is left here
rather than deleted because it was committed to this file and acted on in conversation.

**Wrong file.** Every shipped DB is BROWSER-built — they carry `component_geometries` (the browser
importer's table), not `base_geometries` (the Python CLI's). `extractIFCtoDB.py` produced none of
them. The equivalent browser path is `import_worker.js:284-300`, which is also name-keyed
(`storeyMap[expressID] = normalizeStorey(s.Name)`).

**Wrong phenomenon.** `Clinic.ifc` declares **exactly one** `Roof - Main` storey:
`TOF Footing · Second Floor · Roof - Mech · Roof - Main · Level 2 · Level 1 · First Floor · Unknown`.
No suffixed siblings, nothing ambiguous, nothing collapsed. The "same name at three elevations"
observation came from the §S25 PROTOTYPE's own level ladder (`Level 2=Roof - Main`,
`Roof - Main=Second Floor`, `Roof - Main`), which merges bodies by median datum — **an artifact of
the probe's clustering, not of extraction.** §S26.6 C2 inherited the same mistake and is qualified
by this retraction.

**Also mislabelled:** `import_worker.js:273-282` `§STOREY_NORMALIZE` folds `"Level 2 Ceiling"` ->
`"Level 2"` DELIBERATELY, because Revit exports reference planes as `IfcBuildingStorey`. That is
intentional and correct, and the retracted claim would have flagged it as the bug.

**What IS true, measured on `Clinic_meta.db`** — per-storey element z spread:

| storey | n | z span |
|---|---|---|
| **Unknown** | **5,160** | **13.9m** |
| Second Floor | 1,708 | 10.1m |
| Level 2 | 1,410 | 9.9m |
| First Floor | 2,343 | 9.0m |
| TOF Footing | 1,676 | 4.2m |
| Roof - Main | 45 | 7.9m |

**The real finding is the top row: 5,160 of 16,114 elements (32%) resolve to storey `Unknown`** —
a containment gap, far larger than any naming issue. The wide spans on the others are mostly tall
elements legitimately reaching the level above and are NOT a defect.

**Name-keyed storey mapping remains a LATENT weakness in both importers. It is not the cause of
anything observed on this fleet.** Do not act on it.

## §S31.4 — MEASURED: how much of the elevation is already recoverable TODAY

User challenge: *"isn't the room injection already given us such meta-data?"* — **largely yes.**
`spatial_structure` already carries a real per-storey `center_z`, written by the compile/injection
path (`object_type='COMPILED'`). Hospital's storey ladder is clean: 168.7 / 174.1 / 178.8 / 183.9 /
188.8 — a 5m rhythm, extracted not guessed.

Federation duplicates AGREE: Hospital has 63 storey rows over 20 distinct names, `"Level 5"`
appearing **8 times** (8 discipline files), and **all 8 report the same z**. Storey guids are
synthetic and name-derived (`STC_Level_1`, `STC_First_Floor`), so the join key available today is
the name.

**Joinability of `elements_meta.storey` → a `spatial_structure` storey with a real `center_z`:**

| building | elements | joinable | | ambiguous names |
|---|---|---|---|---|
| Hospital_meta | 63,415 | 53,740 | **84.7%** | 0 |
| HHS_Office_Federated | 6,880 | 4,715 | **68.5%** | 0 |
| Clinic_meta | 16,114 | 5,755 | **35.7%** | 0 |
| Terminal_meta | 48,428 | 11,233 | **23.2%** | 0 |
| JKR_extracted | 9,410 | 2,017 | **21.4%** | 0 |
| LTU_AHouse_meta | 125,698 | — | **no `center_z` column** | — |
| Duplex_extracted | 1,193 | — | **no `spatial_structure` table** | — |

**`ambiguousNames = 0` on every building that has the data** — no storey name maps to two different
elevations. So where the join resolves, it is SAFE, and no extractor change is needed to use it.

**But coverage is 21–85% and two buildings cannot join at all** — the same stale-artifact pattern as
§S31.2 (LTU and Duplex predate the schema). So room injection gives us most of what is needed on
the newest DBs and nothing on the oldest.

## §S31.5 — the ordered conclusion

1. **Elevation does not need to be inferred.** It is declared, and on Hospital it is already
   joinable for 84.7% of elements with zero ambiguity. `floor(z/3)` banding is a workaround for a
   join nobody wired.
2. **The remaining gap is coverage, not capability** — old DBs lack the columns. Rebuilding with the
   now-merged extractor (§S31.2) is the fix, and it is a re-run, not new code.
3. **The extractor change worth making is small:** return the storey GUID alongside the Name, so the
   join is on identity rather than a display string. Master's §S21 already landed the other half
   (`spatial_structure.elevation`).
4. **None of this is scheduled work yet.** No spec has passed vetting (§S27.R, §S28.R both NOT
   VETTED), and §S31 records measurements, not a design.

## §S31.6 — STOP-AND-REPORT

- **Record before re-measuring.** This section exists because several hours of findings lived only
  in chat and one audit (§S29) sat unwritten in a scratchpad while adjacent measurements were
  re-run. Write the number into this file in the same turn it is produced.
- **Do NOT quote §S30.2's "trade-first beats elevation-first" unqualified.** §S31.1 shows it is a
  capped-crew result; both keys beat CPM without caps.
- **Do NOT rebuild the fleet DBs and re-measure §S26–§S30 in one step.** Rebuild ONE building
  (Hospital — highest join coverage, newest schema), confirm `rel_fills_host` / `elevation` / storey
  guids populate, and re-measure that building alone before touching the rest.

---

# §S32 — USER RULING: the extractor is correct, the DBs are frozen, metadata is derived at RUNTIME (2026-08-19)

**USER DIRECTIVE, verbatim:** *"i maintained that the script is correct, and no further tamper on
the DBs. All subsequent metadata must be derived runtime 1 time ie rooms injection."*

**This is a standing architectural constraint, not a preference.** It settles several threads this
file left open and it CANCELS work that earlier sections proposed. Read it before acting on any
earlier recommendation.

## §S32.1 — the three rules

1. **`extractIFCtoDB.py` (and the browser importer) are CORRECT. Do not change them.** The extractor
   already preserves what matters — §S31.2 verified `rel_fills_host`, `port_elements`,
   `port_connections`, `rel_adjacency`, `rel_anchored`, `rel_aggregates`,
   `rel_contained_in_space`. §S31.3's proposed "return the storey GUID" change is **retracted along
   with the claim that motivated it.**
2. **The shipped `buildings/*.db` are FROZEN. Do not rebuild, migrate, or re-import them** to make a
   measurement come out differently. Their contents are the input, whatever state they are in.
3. **Every derived fact is computed at RUNTIME, ONCE, on load** — the room-injection pattern that
   already exists (`scripts/compile_rooms.py` / `build/room_walker.js` /
   `viewer/lib/room_walker.js`): read the frozen DB, compute, hold in memory for the session.

## §S32.2 — what this CANCELS

| earlier item | status under §S32 |
|---|---|
| §S31.5 item 3 — "return the storey GUID alongside the Name" | ⛔ **CANCELLED** — extractor is correct, and §S31.3 is retracted anyway |
| §S31.5 item 2 — "rebuild with the merged extractor" | ⛔ **CANCELLED** — DBs are frozen |
| §S31.6 — "rebuild ONE building (Hospital) and re-measure" | ⛔ **CANCELLED** — same reason |
| §S27.2 / §S28.6 B2 — zone compiler as a build stage writing to the DB | ⛔ **CANCELLED as written** — becomes a runtime derivation, writes nothing |
| §S28.6 B5 — write `schedules`/`tasks`/`task_sequences` into the DB | ⚠ **BLOCKED pending a ruling** — this is a DB write. §S32 forbids tampering; whether the IFC-native tables are "tamper" or "the intended output surface" is a USER decision, not one to assume |
| §S26.12 / §S31.2's "stale artifacts" framing | ⚠ **REFRAMED** — the DBs are not "stale pending rebuild", they are the FROZEN INPUT. Anything missing from them is derived at runtime or not used |

## §S32.3 — what this makes CLEANER

The ruling removes the hardest unsolved problem in §S27/§S28 rather than solving it.

- **No migration, no schema change, no re-extraction, no version skew.** The 5 empty / 2 absent task
  tables, LTU's missing `center_z`, Duplex's missing `spatial_structure` — none of these need fixing
  upstream. The runtime layer computes what it needs from geometry that IS present.
- **One derivation pass, one place.** Storey elevation, band rank, zones, and the 32% `Unknown`
  containment gap (§S31.3) all become outputs of the same runtime pass, not four separate lookups
  with four different coverage rates (§S31.4's 21-85% joinability stops mattering — the pass derives
  it uniformly for 100%).
- **§S29's generality problem shrinks.** A runtime derivation can degrade per building without a
  schema migration: no `spatial_structure`? derive from element z. No rooms? one zone per band.
  The variable-depth LBS §S29.3 asked for becomes a runtime choice, not a stored structure.
- **It matches what already works.** Room injection is the proven precedent and it is already
  hardened (`§RASTER-EPS` translation invariance, `§STAIR-EXCLUDE`, `§SUSPECT-LARGE`).

## §S32.4 — the derivation contract (what a runtime pass must satisfy)

Any runtime derivation added under this ruling MUST:

- **Read only.** No `INSERT`/`UPDATE`/`CREATE` against `buildings/*.db`. Results live in memory for
  the session.
- **Run once per load**, not per query — the room-injection cadence.
- **Be total.** Every scheduled element gets a value, including the 32% with storey `Unknown` and
  the elements in buildings with no `spatial_structure` at all. A derivation that covers a subset
  and silently defaults the rest is the §S29.1 silent-failure class and is not acceptable.
- **Report its own coverage and its fallbacks**, per building, with `§`-tagged log lines — how many
  elements got a declared value, how many a derived one, how many a default.
- **Print `durOk` / `judgeCanFail`-style instrument guards** on any number it produces (§STATUS).

## §S32.6 — CLARIFICATION (user, 2026-08-19): "frozen" is about WHICH TABLES, not which file

Rule 2 was being read too widely and blocked the product goal for a day. Two readings were tried;
**the second is the ruling.**

**First attempt (mine, superseded):** "frozen = the shipped file; edits go to a browser-local copy."
**The user corrected it, and the correction is sharper:** the separation is not WHERE the file
lives — it is **WHICH DATA MODEL** is being written. The building DB already carries two distinct
models, and the schedule one exists precisely to be written:

| model | tables | standing |
|---|---|---|
| **EXTRACTION — source** | `elements_meta` · `element_transforms` · `element_instances` · `component_geometries`/`base_geometries` · `spatial_structure` · `rel_*` · `qto_cache` · `storey_walkable_raster` | **FROZEN.** Rule 2 in full. No rebuilds to make a measurement come out differently, no extractor edits. |
| **SCHEDULE — output** | `schedules` · `tasks` · `task_sequences` · `task_elements` · `calendars` | **WRITABLE. This is what they are for.** Added by the user in PR #59 (`2253664`) and declared source of truth at `schedule_author.js:6`. Currently **0 rows on every shipped building.** |

> **THE RULING: a saved schedule belongs IN the building DB, in the schedule tables. That is not
> tampering — it is a separate data model, and writing it is the intended use.** The extraction
> tables are untouched by it.

Verified on `Hospital_meta.db`: the two groups are cleanly disjoint — extraction tables carry
63,415 / 63,182 / 9,528 / 8,474 / 212 rows; all five schedule tables carry **0**.

**Why this matters and is not a technicality:** with those tables empty, a planner opening the 4D
view has nothing to edit — dependencies exist only in memory, are rebuilt from scratch on every page
load, and vanish when the tab closes. **Filling them IS the feature** the user has stated
repeatedly: *"as long as the resulting JSON is easily editable by real experts… they easily fill in
the gap or readjust or simply import their model."* It also means a building can be shared WITH its
programme, which a browser-local-only store could never do.

**§S28.6 B5 is UNBLOCKED. §S37 C1 is CLOSED.** §S32.5's first STOP-AND-REPORT is narrowed
accordingly: a write to an EXTRACTION table still stops and reports; a write to a SCHEDULE table
does not. **Rule 1 (no extractor edits) is unchanged and still unconditional.**

## §S32.5 — STOP-AND-REPORT

- **Any task that would write to `buildings/*.db` STOPS and reports** rather than writing, including
  §S28.6 B5's task-table write. That is a user decision under §S32.1 rule 2.
- **Any task that would edit `extractIFCtoDB.py` or `import_worker.js`'s extraction logic STOPS.**
  Rule 1 is unconditional.
- **A runtime derivation whose coverage is below 100% STOPS and reports the gap**, rather than
  defaulting the remainder (§S32.4).

---

# 🔄 §RESUME — HANDOFF TO A FRESH OPUS SESSION (written 2026-08-19, end of session)

**Read this block, then `# §STATUS` at the top of this file, then `# §S32`. Those three are enough
to resume. Everything else in this file is evidence you can consult on demand — do NOT read it
end-to-end.**

## R.0 — the one-paragraph state

Two designs were written and BOTH were rejected by adversarial vetting (§S27.R, §S28.R). The
measurements that followed then refuted premises both designs rested on, and one of this session's
own findings (§S31.3) was retracted the same day. **Nothing has shipped; `viewer/` is unchanged.**
What IS solid is the evidence base (§S25_REVIEW, §S26, §S29, §S30, §S31) and one measured,
ship-ready fix. The user's standing ruling §S32 (extractor correct · DBs frozen · derive at runtime)
landed last and cancels parts of the rejected designs.

## R.1 — TWO AGENTS WERE IN FLIGHT when this session ended. Collect them FIRST.

Neither had reported. Do not re-dispatch either without checking whether it landed.

**Agent A — REPORTED, STOPPED, DID NOT SHIP (2026-08-19).** See the ⛔ block above §S25_REVIEW.6:
its numbers were a mis-attributed comparison; built for real the tie-break gives 6/7 or 5/7, not 7/7.
Branch **`fix/designated-support-election` — now COMMITTED AND PUSHED (`7a06a12`)** as negative
evidence, not a shipping candidate; port proven faithful (0 mismatches / 267,954 elements, two
verifiers), so a porting bug is ruled out as the explanation. Do not merge it against
§S25_REVIEW.6's targets — those do not exist on the live engine. **Also surfaced: all 7 W-MZ-8 baselines are ALREADY RED
on main** — diagnose that before re-locking anything. Original brief said: the only change measured on
the REAL engine (float better on 7/7: Terminal 4,756→1,555 · Hospital 7,753→1,293 · Clinic
1,102→327 · JKR 3,183→1,072 · HHS 1,531→243 · Duplex 247→152 · LTU 12,712→9,461; phase gap
better-or-equal 7/7). Briefed on: BOTH twins (`cpm_schedule.js:120` AND `time_machine.js:4575` —
`witness_midair_zero.js:127` and `probe_captured_floating.js` slice the time_machine copy BY SOURCE
TEXT, so a one-file edit goes green on code that never ran); W-MZ-8 `CPM_FLOAT_AFTER_BASELINE`
(~`witness_midair_zero.js:177`) must be re-measured and re-locked in the SAME PR; STOP-AND-REPORT if
its numbers disagree materially with the above rather than tuning the tie-break.
**On receipt:** verify the twin change actually happened and that the witness EXERCISED the new
election (not merely went green). Then it is mergeable.

**Agent B — measures whether a TOTAL runtime level derivation is possible from the frozen DBs.**
Read-only probe, `scripts/probe_s32_level_coverage.js`, four-tier fallback ladder (T1
`rel_contained_in_space`→space→storey→`center_z` · T2 `elements_meta.storey` name→`spatial_structure`
`center_z` · T3 derived from element z · T4 nothing worked), per building, plus a
declared-vs-geometry consistency check nobody has run.
**On receipt: this number is the GATE for everything else.** If T4 is non-zero on any building, a
grid/cell design cannot be built as §S27/§S28 specified, and that must be said plainly rather than
defaulted around (§S32.4, §S29.1).

## R.2 — the standing rulings you must not violate

- **§S32 (user, unconditional):** the extractor is CORRECT — do not edit `extractIFCtoDB.py` or
  `import_worker.js` extraction logic. `buildings/*.db` are FROZEN — no writes, no rebuild, no
  re-import. All derived metadata is computed at RUNTIME, ONCE, on load (the room-injection
  pattern). §S32.2 lists what this CANCELS; §S32.5 lists the STOP-AND-REPORT triggers.
- **§S28.6 B5 (writing `schedules`/`tasks`/`task_sequences` into the DB) is BLOCKED pending a USER
  decision** — it is a DB write, and whether the IFC-native tables count as "tamper" or as the
  intended output surface is the user's call. Do not assume either way.
- **Instrument rule.** Three false zeros in this lane: `engineGap` arithmetically incapable of
  failing (§S25_REVIEW.1), a judge fed `bz`/`tz` where it reads `base_z`/`top_z` (returned 0 on a
  schedule with 247 real violations), and durations all 0 so nothing could float. All three reported
  clean passes. **Every number prints `durOk`/`judgeCanFail`-style guards. A green number is
  worthless until the instrument has been shown to go red.**
- **Vetting is a gate, not a courtesy.** §S27 and §S28 were both stopped by it, correctly. Do not
  dispatch a build agent against a spec whose `§…R` verdict block is empty or NOT VETTED.

## R.3 — what is SOLID (cite these; they survived adversarial re-derivation)

- The 93% blob is manufactured by the support PREDICATE, not by buildings — restricting support to
  load-bearing classes and dropping `embedded` takes Hospital's largest component 49,436→1,951,
  LTU 74,617→1,460, Duplex 672→5 (§S26.1).
- The `hang` family is 93.5-99.8% redundant with phase order and is the SOLE remaining cycle source;
  deleting it gives `largestSCC=1` on all 7 (§S26.3, §S26.5).
- A Gantt bar is a HULL over independently-scheduled elements (`time_machine.js:6074`, grouped by
  `storey|phase`, min-start to max-end). One cause under three symptoms: midair, "one pile full
  project length" stacking, and the phase-gap metric itself (§S26.13 / the code's own comment).
- The IFC-native container already exists, was built by the user (PR #59 `2253664` 2026-05-30,
  PR #502 `b195103`), is declared source of truth at `schedule_author.js:6`, and holds **0 rows on
  every shipped building** (§S26.13).
- The extractor is NOT broken — it already declares `rel_fills_host`, `port_elements`,
  `port_connections`, `rel_adjacency`, `rel_anchored` (§S31.2). Under §S32 the DBs are simply the
  frozen input.
- Sort-key measurement (§S30, §S31.1): under REAL crew caps seqfirst 5/7, zfirst 2/7; with caps
  lifted BOTH reach 7/7. So trade-first's advantage is a resource-levelling property, **not** an
  ordering-quality one, and §S30.2 must not be quoted bare. Backward supports are 21-65% of elements
  — the norm, not a residual, so a sort alone does NOT make physics safe.
- Correctness metric nobody had measured: **mean 83.0%, range 64.6-93.1%** of elements not starting
  before a real support finishes, live CPM path (§S31, Q6).

## R.4 — what is NOT solid (do not build on these)

- §S27 and §S28 as designs — both NOT VETTED, and §S32 has since cancelled parts of both.
- `scripts/probe_s30_sortkey.js` is a standalone reimplementation with NO `wallGate`, `hangGate`,
  `openingGate`, host pairs, or phase/level gates. Its numbers do not transfer to the engine. **A
  probe carrying the real gates is a prerequisite for any sort-based refactor.**
- §S31.3's storey-`Name` claim — RETRACTED in place, wrong file and wrong phenomenon. §S26.6 C2
  inherited the same mistake and is qualified by that retraction. The real Clinic finding is that
  **32% of its elements resolve to storey `Unknown`.**
- JKR as a representative building — it has ~1% room-injection coverage and is the least
  representative of the 7. Do not headline its numbers.

## R.4b — ⚠ READ §S37 BEFORE PICKING WORK

`# §S37` is the CARRIED-FORWARD LEDGER: everything measured in this lane and never converted into
an action. It exists because LTU's storey ladders were missed by two consecutive sessions, and
because two clean results (the `hang` deletion, and 7 red W-MZ-8 baselines) sat idle for a full day.
**Do not start new measurement before checking whether the answer is already in §S37.**

## R.5 — the sequence, in order, and why the order matters

1. **Collect Agent A.** Verify twins + witness actually exercised. Merge.
2. **Collect Agent B.** Its coverage number is the gate.
3. **Build a probe that carries the REAL gates** (R.4) so a sort result transfers to the engine.
4. **THEN write ONE spec**, grounded in 2 and 3, under §S32. Vet it before any refactor code.

**This order is the session's main lesson.** Every design written BEFORE its measurement was
refuted by it — §S30 killed elevation-first ordering, §S31.1 then qualified §S30, §S31.3 was
retracted outright. Three in one session. **Measure, then design.** If the next spec also fails
vetting, stop redesigning and keep making measured single-function fixes like the election one —
the only thing that produced a 7/7 result all day.

## R.6 — housekeeping already done, so you do not redo it

Live file consolidated 2,955→2,166 lines with zero content lost (185 headings before; 120 live + 71
archived; verified programmatically). §S23/§S24/§S24_TRIAGE/§S25/§S25_PROTO archived verbatim to
`prompts/archive/4D_GANTT_TM_REFACTOR_S23-S25_superseded_2026-08-19.md`. §S29 restored ahead of §S30.
`extractIFCtoDB.py` merge with `origin/master` RESOLVED and pushed (`86b059df2`) — it was 97%
CRLF noise; both §S21 and §KUL001 kept. Docs published: `ViewerComponentModel.html` live at
`https://red1oon.github.io/BIMCompiler/ViewerComponentModel.html`, linked from the Viewer guide.
Two orphaned live pages recovered into git in the process (`grislab_proof_run.html`,
`ERP_PROJECT_REVIEW.md`) — both were live on gh-pages and in NO branch.

---

# §S33 — BOTH AGENTS REPORTED (2026-08-19). One gate PASSED, one claim DIED.

## §S33.1 — Agent B: ✅ the §S32 derivation contract is ACHIEVABLE. T4 = 0 on all 7.

`scripts/probe_s32_level_coverage.js` (`32ceb7b66`), read-only, four-tier fallback ladder.
**Independently re-run and verified by this session**, including `md5sum -c` proving
`Hospital_meta.db` is byte-identical after the run.

| building | n | T1 space→storey | T2 name→storey | T3 own z | T4 |
|---|---|---|---|---|---|
| Hospital_meta | 63,182 | 8,474 (13.4%) | 45,033 (71.3%) | 9,675 (15.3%) | **0** |
| HHS_Office_Federated | 6,839 | 88 (1.3%) | 4,586 (67.1%) | 2,165 (31.7%) | **0** |
| Clinic_meta | 16,071 | 2,133 (13.3%) | 3,594 (22.4%) | 10,344 (64.4%) | **0** |
| JKR_extracted | 8,985 | 107 (1.2%) | 1,910 (21.3%) | 6,968 (77.6%) | **0** |
| Terminal_meta | 48,428 | 1,009 (2.1%) | 10,224 (21.1%) | 37,195 (76.8%) | **0** |
| LTU_AHouse_meta | 122,330 | 0 | 0 | 122,330 (100%) | **0** |
| Duplex_extracted | 1,119 | 0 | 0 | 1,119 (100%) | **0** |

**0 of 266,954 elements fall through** (the 276,954 first written here was a transcription slip; the table above sums to 266,954 — re-derived in §S34, every per-building `n` matches). Structural, not luck: `_buildScheduleElements` already drops
zero-transform elements upstream, so everything reaching the scheduler has a finite z and **T3 is a
floor that cannot fail.** `ambiguousStoreyNames=0` on all 7, confirming §S31.4.

**The instrument was proven capable of failing** — a 6-case `§S32_SELFTEST` runs before any real
building, including a deliberately-broken case D that MUST land on T4; all 6 pass. T1 counts
cross-check exactly against §S26.16's independently-measured `rel_contained_in_space` figures on all
7. **This is the first number in this lane that arrived with its own falsifiability proof.**

**NEW, unresolved, and it is a design decision not a measurement:** where a DECLARED level exists it
sometimes contradicts the element's own z by >3m — Terminal T2 **2,161/10,224 (21.1%)**, Hospital T1
557/8,474 (6.6%), others under 2.5%. Some is legitimate (tall elements span bands). **The ladder as
written would silently trust the declared value.** A real derivation needs a stated tie-break for
declared-vs-geometry disagreement. Agent B correctly stopped at the number.

## §S33.2 — Agent A: ⛔ the one "ship-ready" change did NOT survive being built

**STOPPED at §S25_REVIEW.9's STOP-AND-REPORT rather than shipping. That was the correct call and the
gate worked.** Full correction is in the ⛔ block immediately above `§S25_REVIEW.6`; summary:

- **The port is not the problem.** Proven faithful: 0 mismatches across 267,954 elements on all 7
  buildings, verified two independent ways.
- **The claim was a mis-attributed comparison.** `DESIG=v2` never reaches `CpmSchedule.run`
  (`proto_s25_forward_pass.js:608` runs CPM *before* the override exists at `:610`, and it is fed
  only to the prototype at `:644`). The "7/7 versus the live engine" table credited the §S25
  prototype's entire architecture to a tie-break in one function.
- **Built for real: 6/7 (proto path) or 5/7 (witness path).** HHS_Office regresses on BOTH
  (1,531→1,589 and 1,491→2,505, +68%); JKR regresses on the witness path.
- **The `-29% to -51%` backward-supports claim DOES hold** — a pure property of the election,
  independent of the engine around it.

**Two further findings, both pre-existing and unrelated to the change:**
1. **All 7 W-MZ-8 baselines are ALREADY RED on `main`.** `pass=32 fail=7`. A lock that no longer
   matches main is not a lock — something moved all 7 and was never re-locked. **Diagnose before
   re-locking anything.**
2. **Three different float numbers per building depending on path** (Duplex: 289 lock / 247 proto /
   237 witness). §S28.R flagged this; it is now confirmed on all 7. **Every float number in this
   lane must name its instrument.**

## §S33.3 — the tally, stated plainly

**Four claims died by measurement today, and the fourth was the one this file called ready to ship:**
§S30 killed elevation-first ordering · §S31.1 qualified §S30 · §S31.3 was retracted outright ·
§S33.2 killed §S25_REVIEW.6.

**Every one was a claim written before, or inferred beyond, its measurement.** The two things that
survived — §S26's evidence base and §S33.1's coverage result — were measured first and carried their
own falsifiability proof. **That is the whole lesson of this session and it now has four data points.**

## §S33.4 — STOP-AND-REPORT for whoever resumes

- **Do not re-lock W-MZ-8 to today's numbers.** All 7 are red on main for an unknown reason. Find the
  cause first; re-locking would bless whatever broke them.
- **Do not ship the election port to chase §S25_REVIEW.6's targets.** Those targets do not exist on
  the live engine. If the port is shipped it must be on its OWN merits (6/7 or 5/7, HHS regressing),
  as a user decision, with baselines handled per the item above.
- **Do not build the level derivation until the declared-vs-geometry tie-break is DECIDED** (§S33.1).
  Coverage being total does not make the values correct.

---

# §S34 — THE DECLARED-vs-GEOMETRY TIE-BREAK, MEASURED THEN DECIDED (2026-08-19)

**§S33.1 stopped at a number and refused to guess the ruling. This section measures the question
first, then rules.** Instrument: `scripts/probe_s34_declared_vs_geometry.js` (read-only, sql.js
buffer, `db.run()` never called; `md5sum` of all 7 DBs identical before/after — printed below).
`§S34_SELFTEST 13/13`, all four buckets exercised including a fixture that MUST come out FAR and an
interval fixture that MUST come out `false`. `§S34_TIERCHECK` re-derives this probe's own T1/T2
counts against §S33.1's committed table and MATCHES on all 7 buildings, so the ladder has not drifted.

## §S34.0 — the statistic that raised the question could not answer it

§S33.1 reported `|declaredZ − ownCenterZ| > 3m` — Terminal T2 21.1%, Hospital T1 6.6%. That single
distance conflates four situations that need four different rulings, and it silently assumed
`center_z` is the datum a declared storey elevation is keyed to. Measured (`§S34_DATUM`), **no single
datum wins the fleet**: `base_z` is the best predictor on Terminal (77.56% vs 77.25%) and HHS
(99.40% vs 97.11%), `center_z` on Hospital (93.44%), Clinic (94.13%) and JKR (62.32%). A point-datum
test is therefore the wrong instrument on its own terms — which is why the test below compares the
element's whole vertical EXTENT against the storey's INTERVAL.

## §S34.1 — MEASURED: storey elevations are floor lines, and most "disagreement" is the datum

`§S34_GRID` — the declared elevation grid actually available per building:

| building | declared storey elevations (m) | k | min gap |
|---|---|---|---|
| Terminal_meta | 3.05 · 10.07 · 13.84 · 17.82 · 22.63 · 25.13 | 6 | 2.50 |
| Hospital_meta | 168.74 · 174.06 · 178.85 · 183.93 · 188.82 · 193.90 · 201.43 | 7 | 4.78 |
| Clinic_meta | 0.80 · 2.00 · 6.61 | 3 | 1.20 |
| HHS_Office_Federated | 1.69 · 5.36 · 8.75 | 3 | 3.38 |
| JKR_extracted | 82.89 · 82.90 · 85.94 · 89.18 | 4 | **0.01** ⚠ |
| LTU_AHouse_meta, Duplex_extracted | (none — no storey row carries `center_z`) | 0 | n/a |

Only **6 of Terminal's 73** storey rows and **7 of Hospital's 63** carry a `center_z` at all; the
rest are NULL. The grid is small, and it is a set of FLOOR LINES, not band centres.

Consequence, measured (`§S34_SIGNED`): of the declared elements whose extent does not overlap
`[Z_i, Z_i+1)`, **87–100% sit BELOW their own declared floor line**, not above — Terminal 91.2%,
Hospital 93.2%, Clinic 95.5%, HHS 100.0%, JKR 86.7%. That is the hosted-at-level convention (a
slab's top IS the level; a beam hangs under it), not a contradiction.

`§S34_TOLSWEEP` sweeps a downward tolerance and finds a knee at ~3m on every building, after which
it stops paying: Terminal 574→157→105 at 2/3/5m, Hospital 3,764→890→831, HHS 6→6→6, Clinic 50→7→6.
**~3m is one storey height**, so the tolerance is taken from the data, not tuned: the LOCAL storey
gap `Z_i − Z_i−1` (median gap for the lowest storey). Nothing to configure, and it adapts to a
building whose storeys are 2.5m apart or 7.5m apart (§S29 generality).

## §S34.2 — MEASURED: the genuine contradiction population is 1.63% of declared elements

`§S34_GAPTOL` — declared elements whose own extent does not reach their declared storey band even
after the local-gap allowance. **This, and only this, is what a tie-break decides:**

| building | declared | genuine contradictions | % of declared | % of all scheduled |
|---|---|---|---|---|
| Terminal_meta | 11,233 | 140 | 1.25% | 0.289% |
| Hospital_meta | 53,507 | 825 | 1.54% | 1.306% |
| Clinic_meta | 5,727 | 48 | 0.84% | 0.299% |
| HHS_Office_Federated | 4,674 | 6 | 0.13% | 0.088% |
| JKR_extracted | 2,017 | 241 | 11.95% ⚠ | 2.682% |
| LTU_AHouse_meta, Duplex_extracted | 0 | — | MOOT (100% T3, no declared value exists) |
| **fleet** | **77,158** | **1,260** | **1.63%** | **0.47%** |

**What they are** (`§S34_GAPTOL_CLASS`) — overwhelmingly distribution elements and proxies:
Terminal `IfcPipeFitting` 34.3% + `IfcPipeSegment` 29.3% + `IfcBuildingElementProxy` 25.7%;
Hospital `IfcPipeFitting` 52.7% + `IfcDistributionControlElement` 25.6%; HHS 100% `IfcFlowSegment`.
Clinic is the one structural block: 38 `IfcFooting` (79.2%) declared on a storey their geometry is
nowhere near. These are elements whose declared storey is a SYSTEM/design label, not a location.

**Falsifiability, not assumed** (`§S34_CONTROL`): the declared labels are shuffled within each
building and the whole measurement re-run. Real labels beat random ones by **3.9× (Hospital) to
36.9× (Clinic)** on the interval metric and 15.9×–311.8× on the bucket metric. Declared data carries
real information; it is not noise to be discarded. **JKR is the exception and it is reported as
one**: ratio 1.6×, printed as `intervalMetricDiscriminates=NO — ⚠ void`, caused by its two storeys
0.01m apart (82.89 / 82.90). On a grid that degenerate the geometric test cannot separate the
levels at all and the declared NAME is the only thing that can — evidence FOR keeping declared, from
the one building where the instrument admits it failed.

## §S34.3 — ⚖ THE RULING

> ➡ **This ruling is CITED AS ORIGIN by `prompts/4D_MODEL_INTEGRITY.md` §I.3a**, which now owns the
> level relation. It STANDS — §I.3a does not overturn it, it implements it. Do not re-derive the
> tie-break; if you think it needs changing, change it in both places. *(2026-08-27, L3.)*

**Declared wins where the element physically reaches the storey it claims; geometry wins where it
does not. The band a declared storey owns is `[Z_i, Z_i+1)` extended DOWN by the local storey gap.**

1. An element with a declared level (T1 or T2) whose extent `[base_z, top_z]` intersects that
   extended band keeps the DECLARED value — 98.37% of declared elements fleetwide.
2. An element whose extent misses it entirely is OVERRIDDEN to the band its own geometry occupies —
   1,260 elements, 0.47% of the fleet, and the override is COUNTED and `§`-logged per building, per
   class, never silent (§S32.4).
3. An element with no declared level (T3 — 100% of LTU and Duplex, 64–78% of Clinic/JKR/Terminal)
   is placed by geometry alone. No tie-break exists there; nothing to decide.

**Why declared is the default and not geometry:** the shuffle control proves declared labels carry
real information (3.9–36.9×), and JKR proves geometry alone cannot separate two levels 0.01m apart
while the name can. **Why geometry wins the miss case:** a schedule is about when a crew can install
a thing, and a crew cannot install a fitting at z=180 while working a level at z=168 — for the 1.63%
where the label is a system label rather than a location, physical elevation is the operative fact.

## §S34.4 — what this does NOT settle (named, not smoothed over)

- **LTU is federated and a single global grid is wrong for it by construction** (§S29.4). Its storey
  NAMES exist but come from several source models with different floor heights — measured:
  `Plan 1` avg z 4.86 · `Storey 1` 4.45 · `VÅNING 1` 2.95, three different "level 1"s. It has no
  declared `center_z` grid at all, so §S34.3 rule 3 applies and the tie-break never fires; the
  federation problem is untouched by this ruling and stays open.
- **JKR's grid is degenerate** (0.01m between two storeys) and its 11.95% override rate is an
  artifact of that, not a data-quality finding about JKR. Do not headline it (§RESUME R.4).
- **This ruling is about the VALUE of a level, not about how levels order work.** Sort-key and band
  ordering remain where §S30/§S31.1 left them.
- **Correction to §S33.1's prose:** the fleet total is **266,954** scheduled elements, not 276,954 —
  §S33.1's own per-building table sums to 266,954, re-derived here with every per-building `n`
  matching that table exactly (`§S34_TIERCHECK`). The T4=0 result is unaffected.

---

# §S35 — THE RUNTIME LEVEL DERIVATION, BUILT (2026-08-19). 100% coverage on 7/7, nothing wired.

**Deliverables**, both new, both in `bim-compiler` (the `build/room_walker.js` → `viewer/lib/` source
pattern §S32.1 rule 3 names as the precedent):

- `build/level_deriver.js` — the runtime pass. Dual-mode (node + browser sql.js), read-only,
  `window.LevelDeriver` / `module.exports`.
- `scripts/witness_level_derive.js` — 14 hand-computed fixtures (§VERIFICATION rule 1) + the fleet run.

**⚠ NOT WIRED INTO THE SCHEDULER, deliberately.** Consuming this in `CpmSchedule`/`time_machine`
changes ordering behavior and needs its own vetted spec (§RESUME R.5 step 4). This file derives and
reports; nothing in `viewer/` changed.

## §S35.1 — the §S32.4 contract, clause by clause, with the evidence

| §S32.4 clause | how it is met | evidence |
|---|---|---|
| read only | only `db.exec()` with SELECT/PRAGMA — `db.run` occurs once in the file, in a comment | `md5sum -c` on all 7 DBs: **7/7 OK** after every run this session |
| once per load | `derive(db, elements)` is a single pass; caller holds the result | one call per building in the witness |
| **be total** | geometry tier is the floor and cannot fail — `_buildScheduleElements` drops zero-transform rows upstream (`viewer/schedule_author.js:346` `.filter(!e.noGeo)`, read this session) | `T4=0` on 7/7, **coverage 266,954/266,954 = 100.000%** |
| report coverage + fallbacks | `§LEVEL_DERIVE_GRID` / `_TIER` / `_OVERRIDE` / `_AMBIGUOUS`, per building | full log below |
| instrument guards | `§LEVEL_DERIVE_GUARD` prints per building whether the declared and override branches were REACHABLE at all, so "0 overrides" is distinguishable from "the branch never ran" | LTU + Duplex print `overrideBranchReachable=NO — tie-break MOOT`, the other 5 print `YES` |

## §S35.2 — fleet result (`§W_LEVEL_FLEET_VERDICT`, `node scripts/witness_level_derive.js`, exit 0)

| building | n | declared kept | geometry | overrides | grid source | T4 |
|---|---|---|---|---|---|---|
| Terminal_meta | 48,428 | 11,093 (22.9%) | 37,335 | 140 (1.25% of declared) | declared, k=6 | 0 |
| Hospital_meta | 63,182 | 52,684 (83.4%) | 10,498 | 823 (1.54%) | declared, k=7 | 0 |
| Clinic_meta | 16,071 | 5,679 (35.3%) | 10,392 | 48 (0.84%) | declared, k=3 | 0 |
| LTU_AHouse_meta | 122,330 | 0 | 122,330 | 0 (MOOT) | **uniform 3m, k=23** | 0 |
| Duplex_extracted | 1,119 | 0 | 1,119 | 0 (MOOT) | **uniform 3m, k=5** | 0 |
| HHS_Office_Federated | 6,839 | 4,668 (68.3%) | 2,171 | 6 (0.13%) | declared, k=3 | 0 |
| JKR_extracted | 8,985 | 1,778 (19.8%) | 7,207 | 239 (11.85% ⚠) | declared, k=4 | 0 |
| **fleet** | **266,954** | **75,902** | **191,052** | **1,256 (1.63% of declared)** | | **0** |

`ambiguousStoreyNames=0` on all 7 — re-checked per building by the module itself, not inherited
from §S31.4.

**Reconciliation with §S34's probe, not glossed:** the probe counted 1,260 genuine contradictions,
the module overrides 1,256. Element-level diff on the two buildings that differ (`moduleOnly=0`,
`probeOnly=3` Hospital / `2` JKR) shows the module's override set is a strict SUBSET: the delta is
elements sitting within the ±0.05m slack of the tolerance boundary — e.g. an `IfcPipeFitting` whose
top is 5.372m below a declared level with a 5.33m local gap, and a JKR `IfcSlab` at 82.879 against a
band starting at 82.90. **No element is overridden by the module that the probe would have kept.**

## §S35.3 — the witness found a real bug before anything was wired

Fixtures A4 / A5 / A14 failed on the first run. Cause: the downward tolerance is what validates a
DECLARED value, but the first draft also used those extended bands to PLACE geometry-only elements —
and extended bands deliberately OVERLAP (band(4)'s extension reaches into band(0)), so a scan put an
element at z=0.2 on level 4. **Two different questions needed two different intervals:**
`declaredBandOf()` = `[Z_i − localGap, Z_i+1)` for "does this element reach the storey it claims?",
`geomIdx()` = plain `[Z_i, Z_i+1)` for "which storey is it on?". Both are now named, commented with
the failure that produced them, and A14 stands as the guard (3.9m→level 0, 4.1m→level 4 — the
classifier provably responds to input rather than returning a constant).

**This is the §RESUME R.5 lesson working in the other direction:** the fixtures were hand-computed
before the engine ran, so a wrong implementation could not report itself green.

## §S35.4 — the 14 fixtures and what each one proves

`A1` declared+geometry agree · `A2` a slab whose top IS the floor line is not a contradiction
(§S34.1's datum) · `A3` one storey below still counts as declared (the local-gap allowance) ·
`A4` a far miss overrides to geometry and is FLAGGED · `A5` geometry without a declared value is NOT
an override (override count ≠ geometry count) · `A6` T1 beats T2 · `A7` a full-height riser keeps
its declared base level · `A8` a storey name with no elevation is not a declared value · `A9` both
`Unknown` spellings are non-declarations · `A10` T4 stays uncovered, never defaulted · `A11` a
declared value survives unusable geometry · `A12` total off the bottom of the grid · `A13` total off
the top · `A14` the classifier responds to input. **14/14 pass, `§W_LEVEL_FIXTURES pass=14 fail=0`.**

## §S35.5 — STOP-AND-REPORT (what this run is NOT allowed to imply)

- **LTU and Duplex get a uniform-3m grid, and that is a REPORTED FALLBACK, not a result.** No storey
  row in either DB carries an elevation, so there is nothing declared to extract. LTU's is worse than
  Duplex's: it is federated across source models with different floor heights (§S34.4), so a single
  global grid is wrong for it by construction and `k=23` bands from −48m upward is the honest
  printout of that, not a level structure anyone should build a Gantt on. **A derived grid
  (slab-top clustering — Duplex's slabs cluster cleanly at 0.0 / 3.0 / 6.5) is NOT attempted here:
  untested on one building, wrong by construction on the other.** Named as open work, not defaulted.
- **JKR's 11.85% override rate is a grid degeneracy** (two storeys 0.01m apart), not a data-quality
  verdict on JKR. §RESUME R.4 already says not to headline JKR numbers.
- **100% coverage is not 100% correctness.** It says every element got a level from a stated source
  with a stated fallback. Whether those levels order work correctly is §S30/§S31.1 territory and is
  untouched by this section.
- **Nothing shipped.** `viewer/` unchanged, no PR, no DB written.

---

# §S36 — THREE CHECKS ON §S34/§S35 BEFORE ANY SPEC (2026-08-19). Answers only, nothing adopted.

Instrument: `scripts/probe_s36_tiebreak_sensitivity.js`, read-only, `§S36_SELFTEST 6/6` (each pure
function shown able to return the NEGATIVE answer: clustering can return an empty grid, the
partition metric reports 0 on identical grids and non-zero on an offset one, the snap check detects
a foreign line and does not false-positive on an exact one). `md5sum -c` on all 7 frozen DBs: **7/7
OK** before and after every run in this section. No adoption, no switch, no wiring.

## §S36.1 — Q1: the uniform-3m fallback is EXPENSIVE, and clustering does not rescue it

**Answer: not "few". 8.73–29.78% of LTU depending on the clustering bandwidth, 7.06% of Duplex.**

`§S36_Q1_COST` — elements landing in a different level under uniform-3m vs a slab-top-derived grid.
The metric compares GROUPINGS, not level values (each uniform group is mapped to the derived group
most of its members land in; members not following their own group's plurality are counted).
Controls printed alongside: grid-vs-itself = **0**, half-band shift = 21.56% (LTU) / 25.92%
(Duplex) — `metricResponds=YES`.

| clustering params | LTU derived k | elements in a different level | | Duplex derived k | different |
|---|---|---|---|---|---|
| bw=1.00m | 2 | 10,683 (**8.73%**) | | 2 | 79 (**7.06%**) |
| bw=0.50m | 4 | 18,003 (**14.72%**) | | 2 | 79 (7.06%) |
| bw=0.25m, min=10 | 12 | 29,270 (23.93%) | | — | — |
| bw=0.25m, min=3 | 17 | 36,432 (**29.78%**) | | 2 | 79 (7.06%) |

**The second finding matters as much as the first: clustering is not a determinate alternative on
LTU.** Its derived grid swings k=2 → 4 → 17 across bandwidths 1.0 → 0.5 → 0.25m, and the cost
number swings with it. The bandwidth is a free parameter — an invented value — which is exactly
what this project's Prime Rule forbids adopting without a derivation. On Duplex clustering IS stable
(k=2 at every bandwidth) but WRONG in a knowable way: it finds 0.01m and 3.11m and drops the roof at
~6.5m, which has only 1 slab and cannot clear any sane minimum.

**LTU is federated: `IfcBuildingRows=9`.** Nine buildings in one DB, sharing one global z grid. That
is the mechanism behind level_deriver.js's own "wrong by construction" comment, now measured rather
than asserted.

⛔ **This goes on the open list, not in a footnote.** 122,330 elements — **45.8% of the fleet** — are
levelled by a fallback that disagrees with the nearest plausible alternative on 8.7–29.8% of them,
and the alternative is itself parameter-dependent. Neither grid is trustworthy on LTU; the honest
statement is that **LTU has no validated level structure at all**, and any §S30-style ordering claim
computed on LTU inherits that. Do not adopt clustering on this result — it is a cost measurement,
not a switch.

## §S36.2 — Q2: `nearestIdx` never snaps a declared storey onto a foreign line — but JKR's twin is real and it costs 204 overrides

**Answer: `snappedToAForeignLine = 0` on all 5 buildings with a declared grid** (Terminal, Hospital,
Clinic, HHS, JKR — 46 declared storey values in total). The grid is built from those same
elevations, so the snap is exact by construction; measured, not assumed.

`§S36_Q2` — the near-twin population, per building: Terminal minimum line separation 2.497m,
Hospital 4.784m, Clinic 1.196m, HHS 3.382m, **JKR 0.010m** (82.888 / 82.899). JKR is the only case,
and 493 declared elements sit on one of those two twinned lines (284 + 209).

**What the twin actually breaks is not identity — it is the BAND ARITHMETIC**, and both twins break,
from opposite directions (`§JKR_BYLINE`):

| JKR line | local gap (= down tolerance) | declared kept | overridden | override rate |
|---|---|---|---|---|
| 82.888 | 3.040m — but its band CEILING is the twin at 82.899, i.e. 0.011m tall | 209 | 79 | 27.4% |
| 82.899 | **0.010m** — essentially no downward allowance at all | 284 | 128 | **31.1%** |
| 85.938 | 3.040m | 1,251 | 32 | 2.5% |
| 89.182 | 3.244m | 34 | 0 | 0.0% |

**Counterfactual, measured, adopted by nothing** (`§JKR_MERGED_COUNTERFACTUAL`): collapsing grid
lines closer than 0.5m gives declaredKept 1,778 → **1,982** and overrides 239 → **35**. So **204 of
JKR's 239 overrides (85%) are an artifact of two storey lines 1cm apart**, not a property of JKR's
data quality. That also retires the "JKR 11.85%" figure as a headline number (§S35.5 already said
not to headline it; this says why, quantitatively).

**Would carrying storey identity (guid/name) instead of snapped z close it? No.** There is no
snapping bug to close — mis-snap is 0 everywhere. The tie-break still needs a z BAND to ask "does
this element reach the storey it claims", and that band is computed from neighbouring elevations
whether the key is a guid or a number. What closes it is a grid-construction rule (collapse lines
closer than a threshold), measured above. **And identity has a real cost:** 77.1% of Terminal,
80.2% of JKR, 64.7% of Clinic and 100% of LTU/Duplex resolve by geometry and have no storey identity
to carry, so the level key would split into two incompatible spaces — storey ids for declared
elements, band indices for the rest — with every consumer needing a z per key anyway. Zero measured
benefit on 6 of 7 buildings.

## §S36.3 — Q3: 1.0× is the KNEE, not an interior point of a slope — and the outer half is not doing the job §S34 said it was

`§S36_Q3_SWEEP` — override rate vs downward tolerance, as a fraction of the local storey gap:

| building | 0× | 0.25× | 0.5× | 0.75× | **1.0×** | 1.5× | 2.0× |
|---|---|---|---|---|---|---|---|
| Terminal | 23.51% | 16.18% | 8.31% | 3.04% | **1.25%** | 0.93% | 0.93% |
| Hospital | 25.65% | 15.66% | 3.19% | 2.55% | **1.54%** | 1.51% | 1.46% |
| Clinic | 29.44% | 18.07% | 1.22% | 0.93% | **0.84%** | 0.82% | 0.10% |
| HHS_Office | 14.87% | 11.90% | 0.39% | 0.13% | **0.13%** | 0.13% | 0.00% |
| JKR | 38.23% | 34.01% | 19.78% | 12.15% | **11.85%** | 11.85% | 10.56% |

**Shape (`§S36_Q3_SHAPE`): steep below 1.0×, flat immediately above it.** Tightening 1.0× → 0.5×
costs +7.07pp (Terminal), +1.65pp (Hospital), +7.93pp (JKR), +0.38pp (Clinic), +0.26pp (HHS).
Loosening 1.0× → 2.0× buys only −0.32pp / −0.08pp on the two largest — a 20-22× asymmetry. So 1.0×
is the SMALLEST tolerance that reaches the flat part, which is a defensible corner rather than an
arbitrary pick. **Two of five buildings (Clinic, HHS) are already flat at 0.5×; three are not.**

**But the rationale under-describes what the outer half rescues** (`§S36_Q3_OUTERHALF`). The
elements rescued only between 0.5× and 1.0× sit **0.52–0.83 of a full storey** below their declared
floor line (p50), which is not "a slab's top IS the floor line" (that is 0.2–0.3m). What they are:

- **Hospital: 553 `IfcFooting`** of 882 (62.7%) — foundations sitting ~0.81 of a storey below the
  level they carry. Physically defensible: a footing belongs to the structure above it.
- **Terminal: 259 `IfcPipeSegment` + 220 `IfcPipeFitting` + 172 `IfcFurniture`** of 794. The pipes
  are the known MEP pattern; **`IfcFurniture` 0.72 of a storey below its declared floor is not
  explained by any datum convention** and is a named open question, not a settled case.
- **JKR: 101 `IfcSlab` + 20 `IfcBeam`** of 160 — slabs ~0.56 of a gap below their declared line.
  Note JKR's grid is the degenerate one (§S36.2), so read this one last.

**Verdict on the ruling:** §S34.3 lands on the curve's knee and the measurement supports the choice
of 1.0× over 0.5× or 2.0×. What it does NOT support is the stated JUSTIFICATION covering the whole
tolerance — the inner half is the hosted-at-level datum, the outer half is mostly foundations and
MEP, plus a Terminal furniture population nobody has explained. **The honest form of the rule is
"declared wins unless the element is more than one storey away from the level it claims", with the
datum argument covering only part of why that threshold works.** No change made; this is the
qualification that belongs on the rule before it reaches a spec.

## §S36.4 — the three answers in one line each

1. **LTU fallback cost is LARGE** (8.7–29.8%, parameter-dependent) and clustering is not a
   determinate alternative → open list, `⛔ LTU has no validated level structure`.
2. **No mis-snap anywhere (0/46 declared storey values)**; JKR's 1cm twin is real, costs 204 of its
   239 overrides, and storey IDENTITY would not fix it — grid-line collapsing would.
3. **1.0× is the knee** (steep below, flat above, 20–22× asymmetry) — but its outer half rescues
   footings, MEP and unexplained Terminal furniture, not the datum case §S34 cited. Rule stands,
   justification narrowed.

---

# §S37 — CARRIED-FORWARD LEDGER: measured, not actioned (2026-08-19)

**Why this section exists.** User challenge: *"Why isn't this spec'd when we did go thru it? What
else is forgotten?"* — after LTU's storey ladders (`Plan 1..4`, `VÅN 1..5`, `VÅNING 1..4`,
`Storey 1..3`) were found in `elements_meta.storey` AFTER two sessions had concluded LTU has no
level structure.

**The root cause of that miss, stated plainly so it is not repeated:** §S31.4 measured the LOOKUP
("how often does a storey name join to a stored `spatial_structure.center_z`" — 21-85%) and read
the shortfall as missing data. It never asked the next question: **the name IS the grouping, so
derive the elevation from the members carrying it.** §S32 says derive at runtime; the spec still
went hunting for a stored value. **A partial JOIN is not the same as absent DATA.**

**The pattern this ledger fixes:** this lane reliably produces good numbers and then writes them
down instead of converting them into work. Every item below is MEASURED and IDLE. A finding with no
owner and no next action is a finding that will be re-discovered.

## §S37.1 — measured, cheap, and nobody opened it

| # | item | evidence | why it is still open |
|---|---|---|---|
| **A1** | **`hang` deletion → acyclic 7/7.** Branch `fix/s26-drop-carrier-ordering` is PUSHED. | §S26.3, §S26.5, §S26.14 — `largestSCC=1` on all 7; physics SCCs contracted down 8-71%; midair 0→0 | **No PR was ever opened.** Cleanest result in the lane. Float regressed on 2/7 (Hospital, JKR), so it needs a decision, not a merge — but it needs SOMEONE to make it. |
| **A2** | **All 7 W-MZ-8 baselines are RED on `main`.** `pass=32 fail=7` | §S33.2, agent-measured before any edit | **Undiagnosed.** Every float judgement in this lane is scored against locks that no longer match main. This is the gate everything else is measured by, and it is currently broken. **Diagnose before re-locking anything.** |
| **A3** | **Support restricted to load-bearing classes + drop `embedded`** | §S26.1 — Hospital largest component 49,436→1,951, LTU 74,617→1,460, Duplex 672→5 | Measured in a probe, never taken to the engine. |

## §S37.2 — measured, needs a design, never designed against

| # | item | evidence | the unanswered question |
|---|---|---|---|
| **B1** | **A Gantt bar is a HULL** over independently-scheduled elements | §S26.13, `time_machine.js:6074`; the code's own comment names it "one pile, full project length" | ONE cause under THREE symptoms — midair, stacking, and the phase-gap metric itself. Nothing has ever been built against it. **This is the largest unexploited finding in the file.** |
| **B2** | **Trade pipelining** — Hospital starts the next trade in Zone A once the previous clears Zone B, not Zone C | §S28.R, verified in the IFC's own `IfcRelSequence` links | No serial-trade model can express it. §S27/§S28 both assumed serial. Unresolved. |
| **B3** | **32% of Clinic resolves to storey `Unknown`** (5,160/16,114) | §S31.3 | The real Clinic finding, replacing the retracted storey-Name claim. Never chased. |
| **B4** | **Furniture 0.72 of a storey below its declared floor** — Terminal 172 elements | §S36 | No datum convention explains it. Named open by §S36, no owner. |
| **B5** | **LTU per-family level ladders** | this section's header; `elements_meta.storey` | Prompt issued 2026-08-19. If per-family grids work, `FALLBACK_BAND_M` and the clustering bandwidth both disappear — no invented constants left. |

## §S37.3 — blocked on a USER decision, not on work

| # | item | the decision only the user can make |
|---|---|---|
| **C1** | ✅ **DECIDED 2026-08-19 — see §S32.6. Writing the task tables to the USER'S LOCAL COPY is the intended output, not tampering.** The shipped file stays frozen. This item is CLOSED and no longer blocks. |
| **C2** | **Whether `fix/s26-drop-carrier-ordering` ships** | Acyclic 7/7 and midair 0→0, but float regresses on Hospital (+722) and JKR (+227). A trade, not a free win. |
| **C3** | **Lever 2 of the LFS fix** | Settings → Archives → uncheck "Include Git LFS objects in archives". Web-UI only, confirmed not API-exposed. |

## §S37.4 — prerequisites that gate later work

| # | item | gates |
|---|---|---|
| **D1** | **A probe carrying the REAL gates** (`wallGate`, `hangGate`, `openingGate`, host pairs, phase/level gates) | ANY sort-based refactor. `probe_s30_sortkey.js` is a standalone reimplementation; its numbers do not transfer to the engine (§RESUME R.4). |
| **D2** | **§S29.6's untouched classes** — demolition/refurbishment, calendars (`IfcWorkCalendar` captured by PR #59, consumed by nothing), procurement lead times, site/external works | Any claim that the design is general. Named, never examined. |

## §S37.5 — the standing rule this ledger adds

**A measurement is not finished when it is written down. It is finished when it is either (a) an
open PR, (b) a decision put in front of the user, or (c) an entry in this ledger with the reason it
is neither.** Any session that produces a number and ends without doing one of those three has
dropped it — which is how §S37.1's A1 and A2 sat idle, and how LTU's storey ladders were missed by
two consecutive sessions.

---

# §S38 — B5 ANSWERED: the storey NAME carries the ladder. The invented constants go; a new gate opens. (2026-08-19)

Instrument: `scripts/probe_s37_name_derived_ladders.js` (`§S37_SELFTEST 7/7` — the family parser
splits `VÅN`/`VÅNING`, reads a leading digit as an ordinal not a family, reports "no ordinal"; the
ladder check is shown flagging an inverted ladder AND not false-positiving on a clean one; the
partition metric shown at 0 and non-zero). Read-only; `md5sum -c` on all 7 frozen DBs **OK before
and after**. Numbering: `§S37` was taken by the ledger committed in parallel (`c0449334f`) — this is
the answer to its item **B5**, not a competing section.

## §S38.0 — the miss, in one line

`buildGrid()` asked `spatial_structure.center_z` and, finding none, invented a uniform 3m grid for
122,330 LTU elements. It never asked the 121,635 of them (**99.43%**) that carry a storey NAME.

## §S38.1 — Q1/Q2: the ladders exist, and 3 of 4 LTU families are monotonic

Per-name elevation derived as the **median `base_z` of the name's own members** — the statistic §S38.4
then tests rather than assumes.

| building | family | k | elements | derived ladder (m) | monotonic |
|---|---|---|---|---|---|
| LTU | `PLAN` | 4 | **105,253** | 5.25 · 8.58 · 11.72 · 12.79 | **YES** |
| LTU | `VÅNING` | 4 | 6,014 | 1.30 · 4.90 · 7.95 · 11.37 | **YES** |
| LTU | `STOREY` | 3 | 4,067 | 4.56 · 8.21 · 11.46 | **YES** |
| LTU | `VÅN` | 5 | 5,725 | 2.63 · 4.90 · 7.95 · **−0.19** · 16.07 | ⛔ **NO** — `VÅN 3`(7.95) → `VÅN 4`(−0.19) |
| LTU | `REF.` / `TAKPLAN` | 1 each | 297 / 279 | no ordinal — cannot be laddered | n/a |
| Duplex | `LEVEL` | 2 | 123 | 0.00 · 3.22 | YES |
| HHS | `LEVEL` | 3 | 4,674 | 2.87 · 6.25 · 9.85 | YES |

**The offender explains itself.** Member spread (IQR of `base_z`) separates "this name is a floor"
from "this name is not": `Plan 1` 0.55m · `Plan 4` 0.82m · `VÅN 5` 0.01m · `VÅNING 1` 1.14m — versus
**`VÅN 4` 13.87m · `VÅN 2` 10.27m · `TAKPLAN` 9.58m · `VÅN 3` 8.48m**. The four widest are exactly
the family that broke monotonicity plus the un-ordinaled roof plan. `VÅN 4`'s 3,392 elements run from
p25 −0.42m to p75 13.44m — that name is not a storey, it is a bucket. **5,132 LTU elements (4.2%)
sit under a name that is not a single floor.**

Note `VÅN 2` = `VÅNING 2` = 4.90 and `VÅN 3` = `VÅNING 3` = 7.95 exactly — two spellings of one
source model's storeys, which is why family splitting matters and a global grid cannot work.

## §S38.2 — Q3: per-family grids on LTU, measured

`§S37_Q3_COST` / `§S37_Q3_OVERRIDE`, controls printed alongside (self-vs-self **0**, half-band shift
21.58% → `metricResponds=YES`):

| | uniform 3m (shipped) | per-family name-derived |
|---|---|---|
| levels | 11 non-empty bands | 18 groups |
| elements landing in a different level | — | **20,305 (16.69%)** |
| declared coverage | **0** | **121,635 (99.43%)** |
| override rate under the §S34.3 tie-break | n/a (no declared values exist) | **4,008 / 121,635 = 3.30%** |
| still uncovered | 122,330 (100%, all geometry on an invented grid) | **695 (0.57%)**, no name at all |

3.30% sits between Terminal (1.25%) and JKR (11.85%) — LTU stops being the building with no level
structure and becomes an ordinary one. Duplex: 143 named elements only (12.78%), 0 overrides.

## §S38.3 — the constants: BOTH disappear, on this fleet, and one new question replaces them

**`FALLBACK_BAND_M` (3.0m): removable.** A name-derived grid exists on **every** fleet building —
the weakest is Duplex, where 143 named elements (12.78%) still yield four real lines
`[−1.55 (T/FDN) · 0.00 (Level 1) · 3.22 (Level 2) · 6.00 (Roof)]`, on which the remaining 87.22%
place geometrically. `§S37B_GLOBALGRID` prints `fallbackNeeded=NO` for both fallback buildings.
Cost of the swap: LTU 43.24% of elements land differently vs the uniform grid, Duplex 16.18%.

**The clustering bandwidth (`CLUSTER_BW`): removable — it is not needed at all.** §S36.1 only
reached for slab-top clustering because the names had been overlooked. No clustering, no bandwidth,
no `CLUSTER_MIN`.

⚠ **But a NEW question replaces them, and it is not yet answered: the per-name quality gate.**
`VÅN 4` proves a name can be a bucket rather than a floor, and using such a name as a grid LINE
injects a garbage elevation (−0.19m). A candidate gate with no invented constant — *a name's IQR
must not exceed its own family's median inter-level gap, falling back to the building's median gap
for a family of one* — was tested (`§S38_SELFTEST 4/4`, shown returning both answers) and **it is
not good enough**:

| building | names | flagged | flagged elements | verdict |
|---|---|---|---|---|
| LTU | 18 | 5 | 5,429 (4.46%) | ✅ flags exactly `VÅN 2/3/4`, `TAKPLAN`, `Ref.` |
| Hospital · Duplex · HHS | 8 · 4 · 4 | **0** | 0 | ✅ no false positives |
| **Terminal** | 22 | 7 | **6,765 (46.40%)** | ⛔ over-flags |
| **Clinic** | 7 | 3 | **7,779 (71.30%)** | ⛔ over-flags |
| **JKR** | 20 | 10 | **4,390 (54.23%)** | ⛔ over-flags |

Cause, named: those three buildings have mostly single-name families, so the denominator falls back
to the BUILDING's median gap — which on densely-named models is 0.30m (JKR) or 0.98m (Terminal), so
almost every real storey trips it. The gate works where families are ladders and fails where names
are unique-per-storey. **Reported as unsolved rather than tuned into looking solved.**

Mitigation that already exists, measured: with the bad names left IN, LTU's per-family override rate
is still only 3.30% — the §S34.3 tie-break absorbs most of a bad declared level by overriding it.
The gate matters for GRID-LINE construction, not for element assignment.

## §S38.4 — Q4: name-derived vs declared `center_z`, where both exist (23 names, 5 buildings)

| statistic | fleet MAE vs declared | preserves declared order |
|---|---|---|
| median `base_z` | **1.01m** | 4/5 buildings |
| median `center_z` | **0.91m** | **5/5** |
| p10 `base_z` | 1.98m | 5/5 |

The two medians are within 0.10m of each other; `p10` is twice as bad. `median center_z` is also
what the shipped engine already uses (`viewer/schedule_author.js:305-307`), so it is the precedent,
not a new choice. **The one order failure is `median base_z` on JKR — and it is the 1cm twin again**
(`01 Aras Satu` declared 82.89 vs `00 Aras Tanah` declared 82.90; derived puts them 0.97m apart in
the opposite order). §S36.2 already showed that 1cm ordering is a coin flip, so this is weak
evidence against `base_z`, not strong evidence for `center_z`.

**Disagreements are a finding, per the brief.** Hospital tracks within Δ+0.11 to +0.96m on levels
1-5, then drifts to −1.93m on `Level 7` (191 elements — sparse levels derive badly). JKR's derived
elevations sit **0.9–1.9m BELOW** every declared value, consistently. Neither is a defect in the
derivation; both say a derived elevation is a floor-line ESTIMATE with roughly ±1m of scatter, which
is well inside the local storey gap the §S34.3 band uses.

## §S38.5 — this is not only an LTU fix: declared coverage rises fleet-wide

`§S37_NAMES` — elements carrying a storey NAME versus elements the shipped ladder can call declared:

| building | named | currently declared (§S35.2) | distinct names / names with a stored `center_z` |
|---|---|---|---|
| **JKR** | **90.09%** | 19.79% | 20 / 4 |
| LTU | **99.43%** | 0% | 18 / 0 |
| Hospital | 85.03% | 83.38% | 8 / 7 |
| HHS | 69.00% | 68.26% | 4 / 3 |
| **Clinic** | **67.89%** | 35.34% | 7 / 3 |
| Terminal | 30.11% | 22.91% | 22 / 6 |
| Duplex | 12.78% | 0% | 4 / 0 |

**§S31.4's 21-85% "joinability" was measuring the JOIN, not the DATA** — exactly the root cause
§S37 names. Clinic's B3 item (32% `Unknown`) is unchanged by this: those elements genuinely carry no
name and stay on the geometry tier.

## §S38.6 — converted to action, per §S37.5

- **B5 → ANSWERED.** Both invented constants (`FALLBACK_BAND_M`, clustering bandwidth) are removable
  on this fleet; the replacement is name-derived per-family grids. **Nothing adopted here** — the
  brief said measure, not switch, and `level_deriver.js` is unchanged.
- **The change this authorises, when a spec is written:** in `build/level_deriver.js`, `buildGrid()`
  gains a name-derivation tier between T2 and the fallback (per-family grids from member medians),
  and the `uniform3m` branch plus `FALLBACK_BAND_M` are deleted. `levelFor()` gains a T2b tier for
  elements whose name resolves only through the derived ladder. **Not written — that is a spec, and
  specs in this lane get vetted before they get built (§RESUME R.2).**
- **NEW LEDGER ITEM (B6): the per-name quality gate is unsolved.** A derived gate works on 4/7 and
  over-flags on 3/7 (Terminal 46%, Clinic 71%, JKR 54%). Needed for grid-line construction; NOT
  needed for element assignment (the tie-break absorbs bad names — LTU 3.30%). Owner: whoever writes
  the B5 spec. Do not adopt the IQR-vs-family-gap rule as it stands.
- **B4 (Terminal furniture) is unchanged and still unexplained.** Nothing here touches it.

---

# §S41 — LANE WORKING RULES (2026-08-19, from user corrections in-session)

**Where these live and why.** `CLAUDE.md` is explicit: *"A session working a `prompts/#.md` file
updates ONLY that file, never `MEMORY.md`"* — because task sessions writing their own memory entries
is the documented root cause of `MEMORY.md` bloat and drift. These rules were briefly written to
memory during this session; that was a rule violation, reverted, and they belong here. **Recorded so
the next session in THIS lane inherits them without touching memory.**

## §S41.1 — PM hat: decide from your own evidence; do not relay an outside reviewer's framing

USER: *"I told u your role and let you decide, not blindly follow. Harden your PM hat."*

Said after I brought back an outside AI reviewer's conclusion ("stop cleaning, ship the sort") and
proposed it as the next step — **re-ordering a plan the user had already approved** (consolidate the
specs first). I had also adopted that reviewer's metric ("390 accumulated §-fixes") as my own before
checking it; **240 of the 390 were `console.log` tags this project's own Log Mandate requires.**

**An outside sounding board is useful for QUESTIONS and unreliable for FACTS.** In the 2026-08-19
exchange not one of its factual claims survived checking:
- *"250-300 of 390 §-fixes would disappear if the importer is fixed"* — measured 37/390, off ~7×.
- *"`IfcRelSequence` present in source, 0 rows in DB"* — **fabricated**; all 7 JKR discipline files
  grep to `IFCRELSEQUENCE:0`. Nothing was dropped.
- *"107 containment rows — synthesized?"* — 50 across files, normal composition.
- *"The extractor is broken"* — it is not; the DBs are stale (§S31.2).
- *"We have a validated sort, ship it"* — false; 2/7 fail under real crew caps.

Several of its QUESTIONS were excellent and produced real findings (the 83.0%/64.6% correctness
metric, the merge resolution, the spatial-hierarchy probe). **The value is inverted from how it
presents.**

**Apply:** take the questions, discard the answers, verify before acting. Never let an outside voice
re-order a sequence the user already agreed to — if it argues for a different order, say so and let
the user decide, do not arrive with the new plan as if it were mine. Before relaying any outside
claim, check it; if it fails, say so in the same message rather than repeating it as a premise. When
my own evidence contradicts the outside view, **lead with my evidence.**

## §S41.2 — a measurement is not finished until it is actioned

USER: *"this is repetition! Already done a few posts ago. Why don't u record what was done?"* and
later *"Why isn't this spec'd when we did go thru it? What else is forgotten?"*

Findings were reported in conversation and not written to this file, so adjacent measurements got
re-run. Findings that WERE written still went nowhere: the `hang`-deletion result (acyclic 7/7,
branch pushed) sat with **no PR ever opened**, and **7 red witness baselines sat undiagnosed for a
full day**. The §S29 generality audit sat unwritten in a scratchpad for hours while the same ground
was re-measured.

**The specific trap behind the worst miss: a measurement of a LOOKUP was read as a fact about the
DATA.** §S31.4's *"storey name joins to a stored elevation only 21-85% of the time"* was recorded as
*"elevation data is missing"* — when the name WAS the grouping and the elevation could be derived
from its own members. **A partial JOIN is not absent DATA.** Two consecutive sessions missed LTU's
floor structure because of it (§S37 header).

**Apply:** write the number into this file in the SAME turn it is produced — not at session end, not
in a scratchpad. **A measurement is finished only when it is (a) an open PR, (b) a decision put in
front of the user, or (c) a §S37 ledger entry stating why it is neither.** Check §S37 before
starting new measurement. When a measurement comes back partial, ask whether it is the right proxy
before concluding the data is absent.

## §S41.3 — this section is lane-scoped, deliberately

These are working rules for the 4D lane, not global doctrine. **Do not promote them to `MEMORY.md`.**
If they prove to generalise across lanes, that is a separate, deliberate synthesis pass by a session
whose job is memory — not a byproduct of finishing a task here.

---

# §S39 — A2 DIAGNOSED: what moved the 7 W-MZ-8 baselines, and a second defect in the same ruler (2026-08-19)

**A2 asked: all 7 W-MZ-8 baselines are RED on main, `pass=32 fail=7`, undiagnosed. Find what moved
them.** Answer: **PR #1434 moved all 7, then PR #1435 moved all 7 again. Neither re-locked.** Found
by commit-by-commit bisect, not by reading commit messages — and the first message read was wrong.

## §S39.1 — the bisect (instrument: `viewer/tests/witness_midair_zero.js`, unchanged, DBs unchanged)

Run on the two fastest buildings at each commit between the lock and main; the DB files are byte-
identical across every run (`BLD_DIR` defaults to the same `~/bim-ootb/buildings` in every commit),
so this isolates CODE from DATA:

| commit | PR | W-MZ-8 |
|---|---|---|
| `8f8d3de` | #1430 — §S20 Part B, where the baselines were locked | ✅ **GREEN** (Duplex 289=289, HHS 1538=1538) |
| `07d6744` | #1431 ScheduleEngine single-source class | ✅ GREEN |
| `dd3a746` | #1432 buildGanttTasks Tukey fence | ✅ GREEN |
| `035561e` | #1433 computeDays axis-end Tukey fence | ✅ GREEN |
| `5ea6fcf` | **#1434 — E3 gate no longer exempts stragglers from their own phase's completion** | ⛔ **RED, all 7** |
| `6a395ca` | #1435 designatedSupport + directional floating judge | ⛔ RED, all 7, different numbers |
| `13700fd` | main today | ⛔ RED, all 7 (`pass=32 fail=7`, and W-MZ-8 is the ONLY failing invariant) |

| building | locked (§S20) | after #1434 | after #1435 = main | net vs lock |
|---|---|---|---|---|
| Terminal | 8,789 | 10,086 | 10,011 | **+1,222 worse** |
| Hospital | 5,107 | 8,466 | 8,103 | **+2,996 worse** |
| Duplex | 289 | 239 | 237 | −52 better |
| HHS_Office_Federated | 1,538 | 1,606 | 1,491 | −47 better |
| Clinic | 3,523 | 958 | 1,205 | −2,318 better |
| LTU_AHouse | 15,896 | 15,296 | 12,686 | −3,210 better |
| JKR | 3,736 | 3,656 | 3,385 | −351 better |

**5 of 7 improved; Terminal and Hospital got worse.** Both movers are merged, intentional,
independently-verified correctness fixes (#1434 is one of §RESULTS' five bugs — the straggler
exemption that let a phase count as done while 54-100% of it wasn't). So the schedule legitimately
moved and **the lock, not the engine, is what is stale.**

**⛔ Correction to #1435's own commit message.** It says W-MZ-8 "now fails against its old locked
baseline numbers" *because of that fix*, and defers the re-lock. Measured: all 7 were **already red
at `6a395ca^`**. #1435 inherited a broken lock and attributed it to itself. §S33.2's framing
("something moved all 7 and was never re-locked") was right that the cause was unknown; the cause is
#1434, one PR earlier.

## §S39.2 — the SECOND defect, found while fixing the first: the ruler reads DEPRECATED DBs

`witness_midair_zero.js:169` — `const DB_FILE = { LTU_AHouse: 'LTU_AHouse_meta.db' };` and
`:242` falls back to `<bld>_extracted.db` for everything else. **Terminal, Hospital and Clinic all
HAVE a `_meta.db`, and the witness reads their deprecated `_extracted.db` instead:**

| building | `_extracted.db` | `_meta.db` | witness reads |
|---|---|---|---|
| Terminal | Jun 5 | **Aug 17** (patched, PR #1427) | ⛔ extracted |
| Hospital | Aug 3 | **Aug 17** (patched, PR #1428) | ⛔ extracted |
| Clinic | Aug 3 | Jun 6 | ⛔ extracted |
| LTU_AHouse | Aug 3 | Aug 10 | ✅ meta |
| Duplex · HHS · JKR | — | none | ✅ n/a |

**Measured cost, same engine (main), only the DB file changed:**

| building | on `_extracted.db` | on `_meta.db` | delta |
|---|---|---|---|
| **Terminal** | 10,011 | **4,256** | **−57.5%** |
| Hospital | 8,103 | 8,210 | +107 |
| Clinic | 1,205 | 1,205 | identical |
| Duplex · HHS · LTU · JKR | 237 · 1,491 · 12,686 · 3,385 | unchanged | — |

**Terminal's W-MZ-8 number is 2.4× larger on the deprecated file.** Every Terminal float figure in
this lane measured through this witness carries that error. This is the same landmine §RESULTS'
addendum hit on 2026-08-18 (stale `Terminal_extracted.db`/`Hospital_extracted.db` vs the same-day
patched `_meta.db` pair) — it was diagnosed then, a branch `fix/witness-dbfile-resolution` was
created for it, and **that branch has zero commits on it.** Another named-never-worked item.

## §S39.3 — why the re-lock is HELD, not pushed

A re-lock to main's current numbers would bless **10,011 for Terminal — a number measured on a
deprecated DB.** Correct order, stated so it is not re-derived:

1. **Fix `DB_FILE` resolution first** — prefer `<bld>_meta.db` whenever it exists, `_extracted.db`
   only when it does not. One line; the branch for it already exists and is empty.
2. **Then re-lock all 7 in the SAME PR**, to the meta-measured numbers: Terminal **4,256** ·
   Hospital **8,210** · Duplex **237** · HHS **1,491** · Clinic **1,205** · LTU **12,686** ·
   JKR **3,385**. Verified locally: `pass=39 fail=0` with the extracted-DB numbers, and the
   meta-DB numbers above are measured, not projected.
3. **Only then judge A1.** The `hang` deletion's "+722 Hospital / +227 JKR" regression was scored
   against the stale §S20 lock AND (for Terminal/Hospital) against a deprecated DB. Both halves of
   the ruler were wrong; A1's trade must be re-measured before it is decided.

**Nothing pushed to `bim-ootb`.** Worktree `/tmp/wt-wmz-pre` holds branch
`fix/wmz8-relock-after-1434-1435` with no commits (the re-lock edit was verified green, then
reverted pending the DB-resolution decision above).

---

# §S42 — THE HISTORICAL ANCHOR: is the graph era ahead of the engine it replaced? (2026-08-19)

**Question (user):** the engine before `0fe8eb2` (#1242, 2026-08-07) ordered by sort with physics as
a clock — no graph, no blob, no cycles. Every fix since removes bad edges from the graph that commit
introduced. **Are we ahead of that baseline, or still climbing back to it?**

**Answer: neither, and the framing does not survive the measurement. The two eras fail in DIFFERENT
ways.** Pre-#1242 is better on overlap and makespan; it is catastrophically worse on the symptom
§OBJECTIVE leads with. Reverting the graph would trade a defect the fleet no longer has for one it
does.

## §S42.1 — method: only the SCHEDULER changes

Instrument: `witness_midair_zero.js` with the pre-#1242 `schedule_gate.js` loaded as a SECOND module
(`git show 0fe8eb2^:viewer/schedule_gate.js`), preserved as
`scripts/anchor/anchor_pre1242_witness.js` in this repo. Held constant: the DB files (today's
`_meta.db`, post-#1438 resolver), the element build (`_buildXrayElements`), the rates, the crew
caps, and **both judges** — today's `ScheduleGate.auditFloating` and this witness's own `census()`.
Today's global `ScheduleGate` is saved and restored around the old module's `require`, since it
assigns the global on load. The old signature is unchanged (`computeSchedule(elements, baseMs,
scaleFactor, maxCrews)`), so nothing is adapted or approximated.

**Today's witness cannot simply run at `0fe8eb2^`** — it hard-requires `viewer/cpm_schedule.js`
(#1398, seven weeks later) and slices `_displayTimeline` by source text. Swapping the scheduler
under a constant judge is the only comparison that is actually like-for-like, and it is the one
reported here.

## §S42.2 — the three engines, side by side

**⚠ WHICH COMMIT EACH COLUMN IS (corrected 2026-08-19 after §S40).** The right-hand column is
`3bf771e` — the §S26.2 support-pool fix — which was **squash-orphaned and is NOT on `main`**
(re-landed as PR #1440). Live `main` at `b81f646` still scores the pre-#1439 numbers: Terminal
4,256 · Hospital 8,210 · Duplex 237 · HHS 1,491 · Clinic 1,205 · LTU 12,686 · JKR 3,385.
**§S42's conclusions are unaffected** — they rest on the pre-#1242 vs PRE-CPM comparison, and the
`3bf771e` column only sharpens how much of the float the CPM layer owns. Every number in this lane
now names its commit; there were three live scoreboards in this file at once (§OBJECTIVE's
pre-#1438 figures, main's post-#1438 figures, and this branch's).

| building | pre-#1242 `0fe8eb2^` float / days | PRE-CPM, `b81f646` main float / days | POST-CPM, **`3bf771e` orphan branch** float / days |
|---|---|---|---|
| Terminal | **42** / 123.6 | **5** / 373.2 | 2,151 / 164.7 |
| Hospital | **3** / 331.8 | **0** / 1026.2 | 3,960 / 543.5 |
| Duplex | **0** / 9.7 | **0** / 31.3 | 44 / 15.4 |
| HHS_Office | **141** / 46.8 | **9** / 129.2 | 889 / 98.6 |
| Clinic | **4** / 149.7 | **1** / 464.1 | 877 / 183.5 |
| LTU_AHouse | **611** / 861.2 | **360** / 2500.2 | 5,023 / 1429.0 |
| JKR | **169** / 40.5 | **81** / 118.2 | 1,222 / 45.6 |

Read the middle column first. **Today's scheduler beats the pre-#1242 scheduler on float, on all 7**
(5 vs 42 · 0 vs 3 · 0 vs 0 · 9 vs 141 · 1 vs 4 · 360 vs 611 · 81 vs 169). **#1242's geometry DAG is
not the debt** — on this judge it is an improvement over what it replaced. It buys that with
DURATION: today's raw schedule is 2.5–3.0× longer than pre-#1242's.

**The float is manufactured by the CPM display layer, not by the graph.** Every building's number
explodes between the middle and right columns — 5 → 2,151, 0 → 3,960, 360 → 5,023 — while the
makespan is COMPRESSED by roughly half (373→165, 1026→544, 2500→1429). CPM buys ~2.2× compression
and pays for it in overlap violations. That is the actual mechanism behind §OBJECTIVE's seven
numbers, and it sits in `_displayTimeline`'s CPM branch (#1398), not in #1242.

## §S42.3 — the column that reverses the verdict

`census()`, this witness's own W-MZ-2 judge — **elements appearing before the first thing they
touch**, the visible "hanging in mid-air" symptom:

| building | pre-#1242 `0fe8eb2^` | POST-CPM, `3bf771e` orphan branch |
|---|---|---|
| Terminal | **900** | **0** |
| Hospital | **709** | **0** |
| Duplex | **17** | **0** |
| HHS_Office | **146** | **0** |
| Clinic | **345** | **0** |
| LTU_AHouse | **4,316** | **0** |
| JKR | **108** | **0** |

**The pre-graph engine put 17 to 4,316 elements on screen before the thing they physically touch
existed (fleet 6,541).** Today's is zero on all 7 and has been since the graph era matured.

**The middle column, added 2026-08-19 from §S44's run:** today's PRE-CPM schedule is **9,928** —
Terminal 1,278 · Hospital 1,890 · Clinic 604 · HHS 309 · JKR 242 · Duplex 54 · LTU 5,551. So the
raw scheduler is worse on strict midair than the pre-#1242 engine it replaced, and **the CPM
display pass is the only thing in any measured configuration that reaches zero.** That sharpens
§S42.4: the graph era's win is not the scheduler, it is the CPM pass — which is also what
manufactures the float and the bar dispersion. §OBJECTIVE states this
as already-solved ground ("strict midair … is already 0"); the anchor shows what solved it.

## §S42.4 — the honest conclusion

- **"The last five weeks were debt repayment" is not supported.** #1242's own scheduler is better
  than its predecessor on the overlap judge, and the graph era eliminated a defect class
  (strict midair) that the pre-graph engine had in the thousands.
- **"Reverting the graph is the shortest route" is refuted by the same run.** It would trade
  44–5,023 overlap violations for 17–4,316 mid-air appearances, plus lose every gate built since.
- **What the anchor DOES change: the target moves.** The float §OBJECTIVE tracks is created almost
  entirely by the CPM display layer compressing the schedule ~2.2×, not by the support graph. The
  next place to look is `_displayTimeline`'s CPM branch, not #1242.
- **Trade-off, stated:** pre-#1242 was 2.5–3.0× faster in makespan than today's raw scheduler. That
  is a real advantage and it is not free — the ~3× spread is how today's raw schedule keeps float
  near zero. Whether the product wants short-and-overlapping or long-and-clean is a user decision
  this section does not make.

**Caveat on the judge:** `auditFloating` counts "starts before a support FINISHES" and `census()`
counts "appears before a support APPEARS". Neither measures whether the trade order is sensible.
Pre-#1242 ordered by `seq`, so phase order alone satisfied most of the finish-before-start test —
which is exactly why it scores well there and fails the physical one.

---

# §S40 — WATCHDOG: PR #1439 IS NOT ON `main`. The lane is scoring itself against a commit that
# never landed. (2026-08-19, verified — id §S40 taken because it was free, §S41/§S42 untouched)

**One line: `3bf771e` (#1439) is not an ancestor of `origin/main`.** It lives only on
`origin/fix/wmz8-relock-after-1434-1435`. GitHub shows the PR `MERGED`, because it *was* merged —
**into a branch that had already been squashed into main 18 minutes earlier.**

```
$ git merge-base --is-ancestor 3bf771e origin/main   →  NO
$ git branch -r --contains 3bf771e                   →  origin/fix/wmz8-relock-after-1434-1435   (only)
$ gh pr view 1439 --json baseRefName                 →  base=fix/wmz8-relock-after-1434-1435
   #1438 merged 12:33Z  (squash of that branch → main = b81f646)
   #1439 merged 12:51Z  (into the branch, post-squash)  ← orphaned here
```

This is the exact failure `CLAUDE.md` names: *"a squash-merge + a late push orphans the new commit
(observed PR #138, 2026-06-05). After a branch is squash-merged, start the follow-up off fresh
`origin/main` — never re-use it."* The branch was re-used.

## §S40.1 — the cost, measured on both commits with the SAME locked witness

`viewer/tests/witness_midair_zero.js`, unmodified, `BLD_DIR=~/bim-ootb/buildings`, run twice in two
detached worktrees. **Both runs `pass=39 fail=0`** — each commit is internally green against its own
lock, which is why nothing has flagged this.

| building | `origin/main` (b81f646, LIVE) | `3bf771e` (#1439, orphaned) | what live is missing |
|---|---|---|---|
| Terminal | **4,256** | 2,151 | −2,105 |
| Hospital | **8,210** | 3,960 | −4,250 |
| LTU_AHouse | **12,686** | 5,023 | −7,663 |
| JKR | **3,385** | 1,222 | −2,163 |
| HHS_Office_Federated | **1,491** | 889 | −602 |
| Clinic | **1,205** | 877 | −328 |
| Duplex | **237** | 44 | −193 |
| **fleet** | **31,470** | **14,166** | **−17,304 (−55%)** |

Instrument named per §STATUS: W-MZ-8 `auditFloating` post-`_displayTimeline`; the can-fail guard
W-MZ-7 (`judge catches a re-introduced hanging`) PASSED on 7/7 in **both** runs, so neither column is
a false zero. DB resolution logged per building (`§W_MZ_DBFILE`): meta for Terminal/Hospital/Clinic/
LTU, extracted for Duplex/HHS/JKR — the post-#1438 rule, identical in both runs.

**Three different scoreboards are now live in this one file:** §OBJECTIVE line 77 (`Terminal 4,756`
— pre-#1438), main's lock (`4,256`), and §S42's right-hand column (`2,151` — the orphan). Only the
middle one describes what a user loads today.

## §S40.2 — recovery is a 130-line cherry-pick, verified clean

`3bf771e`'s parent `7e1d0dc` is content-identical to main's `b81f646` (the squash), so the commit
lifts straight across; only a *merge* of the branch conflicts (stale merge base in
`witness_midair_zero.js`).

```
$ git diff 3bf771e^ 3bf771e | wc -l                        →  130
$ git apply --check   (against a worktree at origin/main)  →  clean, 4 files
   viewer/schedule_gate.js · viewer/cpm_schedule.js · viewer/time_machine.js
   viewer/tests/witness_midair_zero.js  (the 7 W-MZ-8 locks: 4256… → 2151…)
```

Not done by this watchdog session — it is a push to `main` and belongs to the builder. **Until it
lands, `origin/fix/wmz8-relock-after-1434-1435` is the only copy of a −55% fleet result.** Deleting
it as "merged" destroys the work.

## §S40.3 — §S42 JUDGED: method sound, numbers reproduced, one label wrong

Checked rather than taken on report (§S41.1). Independent re-run in a separate worktree at
`origin/main`, with a coverage instrument §S42's probe did not print:

- ✅ **The anchor module is authentic.** The probe loads a copy from another session's scratchpad;
  `diff` against `git show 0fe8eb2^:viewer/schedule_gate.js` → **byte-identical**.
- ✅ **The judge really is held constant.** `SG_PRE1242` is used for `computeSchedule` only; both
  columns are scored by today's `ScheduleGate.auditFloating` and this witness's own `census()`.
- ✅ **Every pre-#1242 number reproduces exactly**: float 42 · 3 · 0 · 141 · 4 · 611 · 169, midair
  900 · 709 · 17 · 146 · 345 · 4,316 · 108 (`§S42_ANCHOR`, my run, `scripts/anchor` probe + coverage).
- ✅ **NEW — the population bias I went looking for is not there.** The probe writes `mOld` under
  `if (r)` and filters `oldSched[e.guid]`, so a scheduler that skipped elements would score low for
  free. Measured: `pre1242Scheduled == todayScheduled == pop` on **7/7**
  (48,428 · 63,182 · 1,119 · 6,839 · 16,071 · 122,330 · 8,985). Full-population, fair comparison.
- ⛔ **The column header "today POST-CPM (#1439)" is not today.** It is §S40's orphan. §S42's own
  conclusions survive — they rest on the pre-#1242 vs today-PRE-CPM pair, which is unaffected — but
  the right column overstates the live engine by 2.0–2.5× per building.

## §S40.4 — the finding §S42 and this run agree on, from opposite directions

`witness_midair_zero.js` has been printing this all along and no section records it: **the base
scheduler leaves almost no float; `_displayTimeline`'s CPM branch manufactures nearly all of it.**

| building | midair before → after | float `auditFloating` before → after (main) |
|---|---|---|
| Terminal | 1,278 → **0** | 5 → **4,256** |
| Hospital | 1,890 → **0** | 0 → **8,210** |
| Duplex | 54 → **0** | 0 → **237** |
| HHS_Office_Federated | 309 → **0** | 9 → **1,491** |
| Clinic | 604 → **0** | 1 → **1,205** |
| LTU_AHouse | 5,551 → **0** | 360 → **12,686** |
| JKR | 242 → **0** | 81 → **3,385** |
| **fleet** | **9,928 → 0** | **456 → 31,470 (69×)** |

Same judge on both sides (`_floatAt()` re-reads the same `items` array `__dt` mutates in place), so
only the times differ. **§OBJECTIVE symptom 1 is not produced by the scheduler, by `hang`, or by the
support predicate — it is produced by the display re-authoring pass, and it is the price paid for
taking strict midair to 0 and halving the makespan.** That is a trade the product has never been
asked about. It also puts §S37 B1 (the hull) and this in the same place: `_displayTimeline` + the
`time_machine.js:6074` grouping are one target, not two.

## §S40.5 — actioned per §S37.5

| # | item | state |
|---|---|---|
| **E1** | **Land #1439 on `main`** — cherry-pick `3bf771e`, re-run W-MZ, PR. −55% fleet float. | ⛔ **DECISION FOR THE USER/BUILDER.** Verified clean; not this session's to push. |
| **E2** | **Do not delete `origin/fix/wmz8-relock-after-1434-1435`** until E1 lands. | ⚠ standing warning |
| **E3** | **§OBJECTIVE's numbers are stale** (line 77 = pre-#1438). Re-state them from main's lock once E1 settles, and say which commit they describe. | open |
| **E4** | **`scripts/anchor/anchor_pre1242_witness.js` `require`s another session's `/tmp` scratchpad** — a `/tmp` clear makes §S42 unreproducible. Vendor the module or read it via `git show`. | open, one line |
| **E5** | The float is made by the CPM layer (§S40.4) — fold into B1's target rather than opening a new lane. | open |


---

# §S43 — B1 MEASURED: the bars are wide, but NOT because of one stray element (2026-08-19)

**Measured before designing, at `_displayTimeline`'s own output and `time_machine.js:6074`'s own
grouping — not in a separate lane.** Instrument: `scripts/hull/hull_probe.js` (a copy of
`witness_midair_zero.js` with a hull measurement added; copy into `bim-ootb/viewer/tests/` to run),
on `3bf771e` — the §S26.2 branch, i.e. post-#1439 float. Read-only. The task tables hold 0 rows on
every fleet building (§S26.13), so `storey|phase` IS the live grouping, as the code's own fallback.

## §S43.1 — the symptom is real and it is widespread

`§S43_HULL` — a "bar" is one `storey|phase` group; RAW = the hull its members actually describe
(`min start … max end`), TRIMMED = what ships after `§GANTT_MINI_TRIM`'s Tukey fence:

| building | bars | project days | RAW >50% | RAW >80% | TRIMMED >50% | TRIMMED >80% | median RAW | median TRIMMED |
|---|---|---|---|---|---|---|---|---|
| LTU_AHouse | 58 | 1,429 | **35** | **25** | 21 | 16 | **74.4%** | 29.8% |
| Duplex | 16 | 15.4 | 8 | 2 | 3 | 2 | **68.7%** | 18.1% |
| HHS_Office | 17 | 98.6 | 9 | 1 | 4 | 0 | **60.0%** | 29.7% |
| Hospital | 35 | 543.5 | 15 | 10 | 11 | 6 | 25.8% | 17.3% |
| Terminal | 72 | 164.7 | 25 | 6 | 12 | 5 | 30.1% | 17.1% |
| JKR | 64 | 45.6 | 14 | 4 | 8 | 1 | 26.6% | 16.5% |
| Clinic | 32 | 183.5 | 9 | **9** | 7 | 3 | 22.9% | 18.4% |

**On LTU 60% of bars span more than half the project and 43% span more than 80% of it**, even
before the trim. Clinic is the sharp case: every one of its 9 wide bars is >80% — there is no
middle. The trim is doing real work (median bar 74.4% → 29.8% on LTU, 68.7% → 18.1% on Duplex) but
it does not fix the shape: 21 of LTU's 58 bars still cross half the project AFTER trimming.

## §S43.2 — ⛔ the stated cause does not survive measurement

§OBJECTIVE and §S37 B1 both say: *"one stray element stretches the whole bar."* Measured, per bar:
the share of the raw hull that disappears if you delete the ONE element that shortens it most
(the earliest starter or the latest finisher, whichever helps more):

| building | median share of hull owed to ONE element | bars where one element owns >50% | RAW>50% bars, before → after dropping that element |
|---|---|---|---|
| JKR | **3.3%** | 8/64 | 14 → 11 |
| Terminal | **1.9%** | 9/72 | 25 → 22 |
| Clinic | 0.8% | 4/32 | 9 → 7 |
| Duplex | 0.7% | 1/16 | 8 → 7 |
| LTU_AHouse | 0.5% | 5/58 | 35 → 31 |
| Hospital | 0.4% | 2/35 | **15 → 15** |
| HHS_Office | 0.4% | 3/17 | 9 → 6 |

**The median bar owes 0.4–3.3% of its width to its worst single element.** Deleting that element
outright removes at most 4 wide bars on any building and removes NONE on Hospital. **A bar is not
wide because one member is late. It is wide because its members are genuinely spread across the
project** — the trimmed span, which throws out the whole outlier tail on both sides, still covers
17–30% of the project at the median and >50% on 3–21 bars per building.

This is the §S30/§S31.3 pattern again: a mechanism written down before it was measured, refuted by
its own measurement. The symptom is real; the named cause is not it.

## §S43.3 — what that means for B1's scope

- **An outlier fix cannot deliver this.** Neither a better trim nor removing stragglers moves the
  numbers above — the shipped Tukey trim is already the strong version of that idea and it leaves
  LTU with 21 bars over half the project.
- **"Schedule the group" is therefore not a display change, it is a SCHEDULING change.** Making a
  `storey|phase` bar narrow means constraining its members to a contiguous window — which changes
  when elements are built, not how they are drawn. That is a much larger claim than "fix the grain"
  suggests, and it needs its own vetted spec.
- **The dispersion has a known source.** §S42 measured that `_displayTimeline`'s CPM pass compresses
  the makespan ~2.2× and manufactures essentially all of the lane's float (fleet 456 → 31,470 on
  `b81f646`). A pass that interleaves work to compress duration is precisely what spreads one
  group's members across the whole programme. **Symptom 1 and symptom 2 share one owner —
  `_displayTimeline` — which is what §OBJECTIVE claims, but through dispersion, not through hulls.**
- **What has NOT been measured yet, and is the next honest step:** how much of a bar's dispersion is
  crew-capacity levelling (a real constraint, correct to keep) versus CPM interleaving (a choice).
  That number decides whether narrowing bars costs schedule duration or is free.

**Nothing designed, nothing built, no grid.** `viewer/` unchanged by this section.

---

# §S44 — THE SPLIT: dispersion is CPM interleaving, NOT crew levelling (2026-08-19)

**The one question §S43 named and §S42 pointed at, answered in one run.** Instrument:
`scripts/hull/split_probe.js` (copy into `bim-ootb/viewer/tests/` to run), on `9db62a6` — main with
#1440 landed. Read-only. Same elements, same `_meta.db` files, same rates, same judges
(`ScheduleGate.auditFloating` + `time_machine.js:6074`'s own `storey|phase` grouping — the task
tables hold 0 rows fleet-wide, §S26.13, so that fallback IS the live grouping).

Three configurations. **A vs C isolates crew levelling. B vs A isolates the CPM pass.**

| | scheduler | crew caps | levelling | CPM interleaving |
|---|---|---|---|---|
| **C** | `computeSchedule` | **off** (uncapped) | no | no |
| **A** | `computeSchedule` | **shipped** | yes | no |
| **B** | `+ _displayTimeline` CPM | **shipped** | yes | **yes** — what ships |

## §S44.1 — median bar span: levelling does nothing, CPM does everything

| building | C caps off | A caps on | **levelling Δ** | B + CPM | **CPM Δ** |
|---|---|---|---|---|---|
| Terminal | 13.6% | 12.6% | **−1.0pp** | 30.1% | **+17.5pp (2.4×)** |
| Hospital | 22.6% | 22.7% | **+0.1pp** | 25.8% | +3.1pp |
| Duplex | 13.4% | 13.4% | **0.0pp** | 68.7% | **+55.3pp (5.1×)** |
| HHS_Office | 30.7% | 33.3% | +2.6pp | 60.0% | **+26.7pp (1.8×)** |
| Clinic | 13.6% | 12.0% | **−1.6pp** | 22.9% | +10.9pp (1.9×) |
| LTU_AHouse | 14.0% | 13.9% | **−0.1pp** | 74.4% | **+60.5pp (5.4×)** |
| JKR | 20.5% | 20.4% | **−0.1pp** | 26.6% | +6.2pp |

**Levelling moves bar width by −1.6 to +2.6pp and the sign goes both ways — it is noise.** CPM
multiplies it 1.1× to 5.4×. Same story on wide bars (>50% of the project), fleet totals:
**C 52 → A 53 → B 115.** Levelling adds ONE wide bar across the whole fleet; CPM adds sixty-two.

Float behaves identically: fleet **456 → 456 → 14,166**. Crew levelling creates no float at all.

## §S44.2 — but "free" is the wrong word, and this is the fork

Levelling is not what widens bars — **it is what costs duration**, and CPM is what buys it back:

| building | C days | A days | levelling cost | B days | CPM saving |
|---|---|---|---|---|---|
| Terminal | 287.2 | 373.2 | +30% | 164.7 | **−56%** |
| Hospital | 740.0 | 1,026.2 | +39% | 543.5 | −47% |
| Duplex | 22.0 | 31.3 | +42% | 15.4 | −51% |
| HHS_Office | 101.2 | 129.2 | +28% | 98.6 | −24% |
| Clinic | 324.2 | 464.1 | +43% | 183.5 | −60% |
| LTU_AHouse | 1,718.2 | 2,500.2 | +45% | 1,429.0 | −43% |
| JKR | 93.1 | 118.2 | +27% | 45.6 | −61% |
| **fleet** | 3,285.9 | 4,642.7 | +41% | **2,432.3** | **−48%** |

**So narrowing bars is free of the levelling constraint, but not free of duration.** The CPM pass
buys a 24–61% shorter programme and pays for it with wider bars AND essentially all the lane's
float. Turning it off would give narrow bars and near-zero float at **~2.3× the duration** — which
is precisely the §S42 trade, now reaching the same fork from the other symptom. **Two findings, one
question.**

## §S44.3 — ⚖ THE QUESTION FOR THE USER (this is the fork, stated once)

Today's shipped schedule (B) versus the same engine without the CPM display pass (A):

| | duration | wide bars (>50%) | float | strict midair |
|---|---|---|---|---|
| **B — ships today** | **2,432 days** | **115** | **14,166** | **0 on all 7** |
| **A — no CPM pass** | 4,643 days (+91%) | 53 | **456** | **9,928** ⚠ |

⛔ **CORRECTED 2026-08-19 — the A row first published here read "0 on 5/7 · Terminal 900 · LTU
4,316". That was wrong: those are §S42's PRE-#1242 anchor figures, a different engine, pasted into
a row describing today's pre-CPM schedule.** Re-read from this probe's own `§MIDAIR_BEFORE` output
(the same run that produced every other number in §S44), config A's strict midair is **non-zero on
all seven**: Terminal 1,278 · Hospital 1,890 · Clinic 604 · HHS 309 · JKR 242 · Duplex 54 ·
LTU 5,551 = **9,928 fleet**. Independently reproduced at both `b81f646` and `3bf771e`, so #1439
does not move it.

**This makes the case against A stronger, not weaker.** Turning the CPM pass off does not merely
cost 91% duration — it puts 9,928 elements on screen before the thing they touch exists. And note
the ordering it exposes: today's raw scheduler is WORSE on midair than the pre-#1242 engine
(9,928 vs §S42's 6,541). **Only the CPM pass reaches zero, on any engine measured.** So the choice
is three-way, not two-way, and that is the honest statement of it.

**What is NOT measured, and is the actual fix candidate:** whether CPM can keep most of its
compression while being constrained to keep a `storey|phase` group's members contiguous. Nobody has
tried it. If a contiguity constraint costs 5% duration it ships; if it costs 90% it is the same
product choice as above. **That is one measurement, and it is the next one — not a design.**

## §S44.4 — what this closes

- §S43's "named-not-taken" split: **answered — interleaving, not levelling.**
- §S42's open trade and §S43's open trade are **the same fork**, and it is now stated with numbers
  on both axes rather than as two separate lanes.
- **Nothing built, nothing shipped.** `viewer/` unchanged by this section.

---

# §S45 — THE CELL: what contiguity costs, and why the answer is a RANGE (2026-08-19)

**§S44.3 named this as the next measurement: can CPM keep its compression while a `storey|phase`
group's members are constrained to a contiguous window — the location×trade cell, which is also the
grain a P6 export needs?** Built as the cell, as asked; no scheduling code changed, nothing shipped.

Instrument: `scripts/hull/cell_probe.js` (copy into `bim-ootb/viewer/tests/` to run), on `9db62a6`.
The cell is modelled as a task-level CPM: **cell duration** = crew-limited work content
(`max over resources of Σ member durations / cap`, using the engine's OWN per-element durations from
config A so units match the makespan comparison); **cell edges** = E1 physics lifted to cells;
**makespan** = longest path. Cells sharing a resource may overlap, so this is optimistic on crews —
stated, not hidden.

## §S45.1 — the blocking finding: `storey|phase` is not an orderable grain

| building | cells | E1 edges CROSSING cells | cells inside a cycle | biggest cell-SCC |
|---|---|---|---|---|
| Duplex | 16 | **98.0%** | 8/16 | 8 |
| Hospital | 35 | **96.4%** | 26/35 | 26 |
| Clinic | 32 | 92.6% | 24/32 | 21 |
| JKR | 64 | 91.4% | 29/64 | 23 |
| LTU_AHouse | 58 | 86.5% | **54/58** | **54** |
| HHS_Office | 17 | 72.7% | 15/17 | 15 |
| Terminal | 72 | 33.8% | 33/72 | 28 |

**34–98% of physical support relations cross a cell boundary**, and once lifted, the cell graph is
not a DAG on any building: 8 to 54 cells per building fall into mutual-dependency cycles, and on
LTU a single SCC swallows **54 of 58 cells**. A cell that must start before another cell that must
start before it cannot both be contiguous and ordered. **This is a grain problem, not a scheduling
one** — and it is the reason the answer below is a range rather than a number.

## §S45.2 — the cost of contiguity, bounded from both sides

The two honest treatments of a cell-level cycle, run as a range:

- **Ceiling** — a cyclic group cannot be ordered, so contiguity forces it to run as ONE serial
  block: duration = SUM of its members'.
- **Floor** — pretend a cycle's members run fully in parallel: duration = MAX of its members'.
  Physically unjustified, but no contiguous schedule can beat it.

| building | B ships today | contiguous CEILING | vs B | contiguous FLOOR | vs B |
|---|---|---|---|---|---|
| Terminal | 164.7 d | 263.6 | +60.0% | 152.2 | **−7.6%** |
| Hospital | 543.5 | 878.3 | +61.6% | 294.6 | **−45.8%** |
| Duplex | 15.4 | 24.5 | +58.9% | 17.6 | +14.3% |
| HHS_Office | 98.6 | 196.0 | +98.9% | 42.1 | **−57.3%** |
| Clinic | 183.5 | 488.3 | +166.1% | 137.2 | **−25.2%** |
| LTU_AHouse | 1,429.0 | 2,901.2 | +103.0% | 873.1 | **−38.9%** |
| JKR | 45.6 | 121.1 | +165.8% | 36.0 | **−21.1%** |
| **fleet** | **2,432 d** | **4,873** | **+100%** | **1,553** | **−36%** |

**The band spans both sides of the decision** — contiguity is either a doubling of the programme or
a third off it, and **the entire width of that band is the cell-cycle problem in §S45.1.** Every bar
is contiguous by construction in both bounds (`wide50 = 0`), so symptom 2 is solved at either end;
what is unresolved is the price.

## §S45.3 — what this settles, and the one thing it does not

- **Contiguity does NOT obviously "hold most of CPM's compression"** — it might beat it by 36% or
  cost 100%, and nothing in this measurement narrows that further.
- **So it does not ship on this evidence.** §S44.3's condition ("if contiguity holds most of the
  compression, it ships") is not met; the condition for a product question is not cleanly met
  either, because the ceiling is not a real bound — it assumes serialization the engine would never
  actually need.
- **The next measurement is now forced, and it is the one the cell was meant to avoid:** does a
  FINER location grain make the cell graph acyclic? The cycles come from 34–98% of supports
  crossing cells, which is a statement about `storey|phase` being too coarse, not about physics
  being cyclic (element-level physics is acyclic — §S26.3, `largestSCC=1` on all 7 with `hang`
  dropped). **A location breakdown is the thing this probe was scoped to defer, and the data says
  it cannot be deferred.** That is a finding about sequencing, not a design.
- **Caveats, both directions:** the model is optimistic on crews (cells sharing a resource may
  overlap; a resource-feasible schedule is ≥ these numbers) and pessimistic inside SCCs (the ceiling
  serializes what a smarter within-SCC schedule could overlap). Neither is tuned; both are printed.

**Nothing built, nothing shipped, `viewer/` unchanged.** A1, A3 and the 13 ledger items stay parked.

---

# §S46 — ROOM×TRADE: the location hypothesis tested with the field's own definition, and NOT confirmed (2026-08-20)

**§S45 said the location breakdown cannot be dodged. This tests it without inventing one** — the
location comes from `rel_contained_in_space` (the IFC's own element→space containment, §S26.12) and,
where no room is declared, from `build/level_deriver.js` (§S35 — built, gate-passed, 100% coverage,
T4=0, 14/14 hand-computed fixtures). No new grid derived. Instrument:
`scripts/hull/room_cell_probe.js`, same cycle machinery as §S45, on `9db62a6`.

## §S46.1 — how much declared location actually exists

| building | elements | with a declared room | distinct rooms | derived levels |
|---|---|---|---|---|
| Hospital | 63,182 | 8,474 (**13.41%**) | 127 | 7 |
| Clinic | 16,071 | 2,133 (**13.27%**) | 98 | 3 |
| Terminal | 48,428 | 1,009 (2.08%) | 23 | 6 |
| HHS_Office | 6,839 | 88 (1.29%) | 13 | 3 |
| JKR | 8,985 | 107 (1.19%) | 20 | 4 |
| LTU_AHouse | 122,330 | **0** | 0 | 11 (uniform 3m) |
| Duplex | 1,119 | **0** | 0 | 4 (uniform 3m) |

## §S46.2 — the result, and the control that stopped it being a false positive

`ACYCLIC` = no cell sits in a mutual-dependency cycle. **The control re-keys the SAME restricted
population by the COARSE `storey|phase` grain** — because restricting to 1–13% of elements drops
most edges, which mechanically reduces cycles. If the coarse grain is acyclic on that population
too, the acyclicity is subsetting, not the grain.

| building | room\|phase (declared pop) | CONTROL: storey\|phase, same pop | reading |
|---|---|---|---|
| Terminal | ✅ 0/84 cells in cycles | ✅ **0/20** | ⛔ **subsetting** — coarse grain is acyclic too |
| HHS_Office | ✅ 0/30 | ✅ **0/9** | ⛔ **subsetting** |
| JKR | ✅ 0/44 | ✅ **0/4** | ⛔ **subsetting** |
| Clinic | ❌ 2/273 (biggest 2) | ✅ **0/11** | ⛔ room grain is **WORSE** than coarse |
| Hospital | ❌ 10/505 (biggest **3**) | ❌ 10/26 (biggest **8**) | ⚠ the only real signal: cycles remain, but the blob shrinks 8 → 3 |

**Without the control, three buildings would have been reported as "rooms make it acyclic". They
don't — the coarse grain is equally acyclic on those same 88–1,009 element subsets.**

And on the whole population, the hybrid grain (room where declared, derived level otherwise) does
not go acyclic anywhere, and on two buildings it is worse than `storey|phase`:

| building | storey\|phase biggest SCC | room-or-level\|phase biggest SCC |
|---|---|---|
| Clinic | 21 | **90** ⛔ |
| Hospital | 26 | **46** ⛔ |
| Terminal | 28 | 17 ✅ |
| LTU_AHouse | 54 | 33 ✅ |
| Duplex | 8 | 10 ⛔ |
| JKR | 23 | 29 ⛔ |

## §S46.3 — the verdict

- **The location hypothesis is NOT confirmed, tested on the field's own definition of a location.**
  Declared rooms do not make the cell graph acyclic. Where the room grain looks acyclic, the control
  shows the subset is doing the work; where the population is large enough to be a real test
  (Hospital, 8,474 elements / 505 room-cells), cycles survive.
- **There is ONE genuine signal and it is worth keeping:** on Hospital the room grain shrinks the
  largest mutual-dependency blob from 8 cells to 3. A finer location does help — it just does not
  reach acyclic, which is what contiguity needs.
- **The data cannot answer this at fleet scale, and that is §S26.12's point sharpened:** 5 of 7
  buildings have ≤2.1% declared containment and two have none at all. The declared locations exist
  and the scheduler ignores them, but there are nowhere near enough of them to schedule on.
- **§S45's −36%/+100% band therefore does NOT collapse.** Symptom 2 still has no priced fix.
- **Named, not taken:** `room_walker.js` COMPILES rooms from wall/door enclosure deterministically
  (the room-injection pattern §S32 already blesses) and is the only path to room coverage on LTU and
  Duplex. Whether compiled rooms behave like declared ones under this same cycle test is one more
  run of this same probe — it is not a new design, and it is the last cheap thing to try before the
  band becomes a product question.

**Nothing built, nothing shipped, `viewer/` unchanged.** A1, A3 and the 13 ledger items stay parked.

---

# §S47 — REFUSE-AT-CREATION, TESTED. The band collapses to a number, and the cost is the LOCATION RULE (2026-08-20)

**Leg 1 of the model strategy (§S26.10/§S26.11): refuse a link that would close a cycle instead of
creating it and breaking it later.** Cheapest test of the whole thesis, no new data. Instrument:
`scripts/hull/grid_probe.js` on `9db62a6`. Location = derived level (§S35 `level_deriver.js`,
already gate-passed), ordered bottom-up. Trade = the engine's own `SEQUENCE_RULES` sequence number.
A cell is (level, trade); grid edges are `(L,T)→(L,T+1)` and `(L,T)→(L+1,T)`.

## §S47.1 — the mechanism works, and §S45's band becomes a single number

**The grid is acyclic BY CONSTRUCTION** — a product order has no cycles, so there is nothing to
contract, no ceiling/floor treatment, and no band. §S45's −36%/+100% collapses to one figure:

| building | B ships today | grid (contiguous, acyclic) | cost |
|---|---|---|---|
| Terminal | 164.7 d | 264.9 | +60.8% |
| Hospital | 543.5 | 832.5 | +53.2% |
| Duplex | 15.4 | 25.9 | +68.2% |
| HHS_Office | 98.6 | 141.1 | +43.2% |
| Clinic | 183.5 | 324.9 | +77.1% |
| LTU_AHouse | 1,429.0 | 2,326.5 | +62.8% |
| JKR | 45.6 | 65.4 | +43.5% |
| **fleet** | **2,432 d** | **3,981** | **+63.7%** |

`wide50 = 0` by construction on every building — **symptom 2 is solved at a stated price of +64%
programme**, no longer an unpriced band.

## §S47.2 — what refusal actually costs: the physics the grid cannot express

Every E1 support edge is classified against the grid's product order. `REFUSED` = the edge
contradicts it, i.e. exactly what refuse-at-creation would decline to create:

| building | inside one cell | represented by grid | **REFUSED** | elements affected |
|---|---|---|---|---|
| Hospital | 3.2% | 18.1% | **78.69%** | 49,206 (77.9%) |
| HHS_Office | 10.2% | 29.0% | **60.79%** | 4,119 (60.2%) |
| JKR | 10.2% | 45.0% | 44.73% | 3,778 (42.1%) |
| Duplex | 0.8% | 60.5% | 38.68% | 422 (37.7%) |
| LTU_AHouse | 13.7% | 54.4% | 31.85% | 35,935 (29.4%) |
| Clinic | 6.1% | 63.8% | 30.08% | 4,046 (25.2%) |
| Terminal | 69.1% | 22.4% | 8.46% | 4,063 (8.4%) |

**Refusing 79% of Hospital's support relations is not a handful of planner exceptions.** On its face
this kills the grid.

## §S47.3 — but the cost is almost entirely ONE thing: where a suspended element is filed

The refused edges are dominated by MEP whose designated support sits on the level ABOVE it — a pipe
under level N+1's slab is filed on level N by geometry, so its support edge points DOWN the grid and
is refused. **Filing such an element on the level it hangs FROM is extraction, not invention: it
uses `designatedSupport()`'s own answer.** Re-classified with that one change:

| building | REFUSED before | **REFUSED after** | elements affected | promoted |
|---|---|---|---|---|
| **Hospital** | 78.69% | **1.90%** | 49,206 → **1,187** | 77.3% |
| **Terminal** | 8.46% | **1.66%** | 4,063 → **797** | 7.3% |
| **Clinic** | 30.08% | **6.15%** | 4,046 → **828** | 23.3% |
| LTU_AHouse | 31.85% | 21.93% | 35,935 → 24,744 | 17.1% |
| HHS_Office | 60.79% | 28.87% | 4,119 → **1,956** | 33.8% |
| JKR | 44.73% | 22.85% | 3,778 → **1,930** | 34.0% |
| Duplex | 38.68% | 33.73% | 422 → **368** | 33.1% |

**On Hospital the grid goes from representing 18% of physics to representing 95.1% of it, by
changing where suspended elements are filed — nothing else.** Terminal 98.3%, Clinic 88.5%.

**The three that stay high are the three the level axis is weakest on** — Duplex and LTU have no
declared rooms and a `uniform3m` level grid (§S46.1), and JKR's declared grid is the degenerate
0.01m-twin one (§S36.2). The residue tracks data quality on the LOCATION axis, exactly as §S46
predicted, not on the trade axis.

## §S47.4 — what this settles for the four-leg strategy

- **Leg 2 (refuse at creation) is VALIDATED as a mechanism** — acyclic by construction, band gone,
  `wide50=0`, price stated (+64%). It costs nothing to implement and it removes the whole SCC
  apparatus at cell level.
- **Leg 1 (split, don't assign) is now the measured priority, and §S47.3 is its miniature.** A
  suspended element is the simplest spanning case — it belongs to the level it hangs from, not the
  level its centroid falls in — and fixing just that recovers 77 percentage points on Hospital. A
  real span-and-apportion rule (riser, two-storey column, curtain wall) is the same argument applied
  to elements that occupy MORE than one cell. **This is where the effort belongs**, as called.
- **Leg 3 (surface the residue) has a size for the first time:** 797–1,956 elements per building on
  the four with a usable location axis. **That is elements, not cells — the reviewable count is
  cell-PAIRS and it is not yet measured.** One more pass of this same probe gives it; until then
  "≤10 per building" is neither met nor refuted.
- **A caveat, stated plainly:** the +63.7% makespan is measured on the BASE location assignment. The
  hang-aware variant changes cell membership, so its makespan is NOT yet measured and could move in
  either direction.

**Nothing built, nothing shipped, `viewer/` unchanged.** A1, A3 and the 13 ledger items stay parked.
The host-relation column (`IfcRelVoidsElement`/`IfcRelFillsElement` parsed on import, absent from
the shipped DBs) remains flagged as **§S32 rule 1 territory — a user call before anyone touches
`extractIFCtoDB.py`.**

---

# §S48 — THE FOUR-AXIS TABLE. The hang-aware grid does NOT buy both symptoms. (2026-08-20)

**The last run. §S47 priced the grid on two axes; this schedules the HANG-AWARE variant for real and
judges it on all four with the same instruments as every other configuration in this lane** —
`ScheduleGate.auditFloating` for float, this witness's own `census()` for strict midair, cell spans
for bars. Elements are packed inside their cell against GLOBAL per-resource crew pools (a trade's
crew cannot be in two cells at once), cells in product order. Instrument:
`scripts/hull/grid_probe.js` on `9db62a6`. Control = **B, what ships today**.

## §S48.1 — the table

| building | | days | wide50 | float | strict midair |
|---|---|---|---|---|---|
| Terminal | grid | 315.0 (+91.3%) | **0** | **549** | 687 |
| | B ships | 164.7 | 25 | 2,151 | **0** |
| Hospital | grid | 870.9 (+60.2%) | **0** | **771** | 179 |
| | B ships | 543.5 | 15 | 3,960 | **0** |
| Clinic | grid | 345.2 (+88.2%) | **0** | **232** | 373 |
| | B ships | 183.5 | 9 | 877 | **0** |
| Duplex | grid | 25.1 (+62.7%) | **0** | 205 | 30 |
| | B ships | 15.4 | 8 | **44** | **0** |
| HHS_Office | grid | 169.8 (+72.2%) | **0** | 2,376 | 535 |
| | B ships | 98.6 | 9 | **889** | **0** |
| JKR | grid | 103.1 (+126.4%) | **0** | 2,331 | 153 |
| | B ships | 45.6 | 14 | **1,222** | **0** |
| LTU_AHouse | grid | 2,549.9 (+78.4%) | **0** | 9,022 | 6,745 |
| | B ships | 1,429.0 | 35 | **5,023** | **0** |
| **FLEET** | **grid** | **4,379 (+80.0%)** | **0** | **15,486** | **8,702** |
| | **B ships** | **2,432** | **115** | **14,166** | **0** |

## §S48.2 — the verdict: it is not shippable, and it is not a close product call either

**The grid wins exactly one axis.** Bars go to zero wide, by construction. On the other three it
loses: **+80% programme, float 9% WORSE fleet-wide, and strict midair goes 0 → 8,702** — the one
invariant this lane has held all day, on every building, since the graph era matured.

**Float-by-construction did not happen, and the reason is structural:** refusing an edge does not
make the precedence go away, it drops it. An element whose support was refused can start before that
support finishes (float) or before it even appears (midair). **Refusal without RE-INJECTION loses
physics** — §S26.11's leg 4 (arrows as declared exceptions) is not optional decoration on the grid;
it is what makes refusal sound, and this run is what proves it.

## §S48.3 — the one real signal, and it is consistent with §S46/§S47

Float splits cleanly by location-data quality:

| | representable after hang-awareness (§S47.3) | float vs B |
|---|---|---|
| Hospital | 95.1% | 3,960 → **771** (−80%) |
| Terminal | 98.3% | 2,151 → **549** (−74%) |
| Clinic | 88.5% | 877 → **232** (−74%) |
| HHS_Office | 71.1% | 889 → 2,376 (+167%) |
| JKR | 77.2% | 1,222 → 2,331 (+91%) |
| LTU_AHouse | 78.1% | 5,023 → 9,022 (+80%) |
| Duplex | 66.3% | 44 → 205 (+366%) |

**Above ~88% representability the grid cuts float by three-quarters while zeroing wide bars. Below
it, the grid makes float worse.** Three findings now agree — §S46 (residue tracks location data),
§S47 (refusals track the location axis), §S48 (so does float). The grain is not the problem; the
LOCATION DATA is.

## §S48.4 — leg 3 sizing, folded in free

Distinct CELL PAIRS spanned by refused edges — the reviewable unit, not elements:

| Terminal | Hospital | Clinic | Duplex | HHS | JKR | LTU |
|---|---|---|---|---|---|---|
| 53 / 2,862 | 76 / 3,422 | 30 / 870 | 17 / 812 | 33 / 600 | 49 / 1,260 | **468 / 5,402** |

**17–76 declared arrows per building on six of seven** — an afternoon's review for a planner, and
well inside "a handful per building, not 2.46 million derived". LTU's 468 is the outlier and it is
the building with no rooms and a `uniform3m` level axis. **So leg 4 is affordable exactly where leg
1's location data is good — the same split as everything else in this section.**

## §S48.5 — ⚖ TO THE USER, and the lane stops measuring here

- **Do NOT ship the grid as measured.** It costs +80% programme and breaks midair-0. That is not a
  product choice, it is a regression.
- **The decision that IS live:** leg 1 (split spanning elements) + leg 4 (re-inject the 17–76 refused
  cell-pairs as declared arrows) is the only configuration that could deliver both symptoms, and it
  is a real design, not a probe. §S48.3 says it would work on the three buildings with good location
  data and fail on the four without.
- **So the prior question is data, not design:** LTU and Duplex have no declared rooms at all, JKR's
  level grid is the 0.01m twin. Compiled rooms (`room_walker.js`, §S32-blessed) is the named path.
- **Nothing has shipped since #1440.** Five measurement sections today; this one closes the budget.
  No sixth probe, no third grain, no leg-1 build until the above is a user decision.

`viewer/` unchanged. A1, A3 and the 13 ledger items stay parked. Host column still §S32 rule 1.

---

# §S49 — LEG 4 (re-injection): pass mark NOT met, and the mark itself was unachievable (2026-08-20)

**Step 1 of the three-step order, run with the pass mark declared BEFORE the run: strict midair back
to 0 on 7/7, float no worse than B.** Instrument: `scripts/hull/leg4_probe.js` on `9db62a6`, same
judges as every other configuration (`auditFloating`, this witness's `census()`). Control = B.

Sound re-injection is the INVERSE of §S47: **physics is mandatory and never refused; the grid is the
tidiness layer and yields where the two disagree.** Elements are scheduled in an order respecting
every physics edge, with the grid's (location, trade) rank as the priority breaking every tie.

## §S49.1 — variant A: honour every physics edge

| building | days vs B | wide50 (B) | float (B) | midair (B) | cycle breaks |
|---|---|---|---|---|---|
| Terminal | 242.2 (+47.1%) | **7** (25) | **1,004** (2,151) | 388 (0) | 633 |
| Hospital | 812.9 (+49.6%) | **13** (15) | **1,347** (3,960) | 19 (0) | 37 |
| Clinic | 275.6 (+50.2%) | **3** (9) | **506** (877) | 38 (0) | 91 |
| HHS_Office | 127.9 (+29.7%) | **4** (9) | **409** (889) | 25 (0) | 63 |
| Duplex | 22.6 (+46.5%) | **4** (8) | **33** (44) | 1 (0) | 7 |
| JKR | 60.7 (+33.2%) | **3** (14) | 1,445 (1,222) | 5 (0) | 41 |
| LTU_AHouse | 2,263.9 (+58.4%) | **31** (35) | 7,181 (5,023) | 1,495 (0) | 3,346 |

**Float PASSES on 5/7** (Terminal −53%, Hospital −66%, Clinic −42%, HHS −54%, Duplex −25%) and bars
improve on **7/7**. **Midair FAILS on 7/7** — and it tracks the cycle breaks almost exactly
(midair ≈ 0.4–0.6 × breaks). Every break is a real precedence that then cannot be honoured.

## §S49.2 — variant B: delete the `hang` family first (ledger A1), so nothing needs breaking

§S26.3 measured that dropping `hang` makes the support graph acyclic. Confirmed here: **`cycleBreaks
= 0` on all 7.** But midair got WORSE, not better:

| | Terminal | Hospital | Clinic | HHS | Duplex | JKR | LTU |
|---|---|---|---|---|---|---|---|
| variant A midair | 388 | 19 | 38 | 25 | 1 | 5 | 1,495 |
| **variant B midair** | **1,649** | 97 | 319 | 206 | 34 | 37 | **4,644** |
| hang edges skipped | 11,585 | 46,779 | 8,121 | 3,410 | 743 | 2,854 | 53,167 |

Deleting `hang` removes the cycles by removing 743–53,167 REAL appearance constraints. A suspended
element then no longer waits for what it hangs from, so it appears before it. **A1 makes the graph
acyclic and the schedule less correct on this axis.**

## §S49.3 — why the pass mark was unachievable, stated structurally

**B's midair-0 is not evidence that every element waits for its support.** It is an artifact of SCC
CONTRACTION: `cpm_schedule.solve()` gives every member of a pure-physics cycle a SHARED START, which
satisfies "appears no earlier than its support" by simultaneity — and pays for it with 14,166 float
(starting before that support FINISHES).

So, while the support graph is cyclic:

- **strict edge satisfaction** (leg 4) can reach low float but CANNOT reach midair-0 — a cycle has
  no strict ordering, so something must break;
- **contraction** (today's B) reaches midair-0 but cannot reach low float — simultaneity is exactly
  what "starts before its support finishes" measures;
- **deleting the cycles' source** (A1) removes the cycles by removing the constraints, which makes
  midair worse, not better.

**"Midair 0 AND float no worse" is not a bar leg 4 failed to clear. It is two invariants that are
mutually exclusive under a cyclic support graph, and this run is what establishes that.**

## §S49.4 — ⚖ consequence for the three-step order

- **Step 1 does NOT pass. Step 2 (ship the gated grid) therefore does NOT proceed** — that was the
  stated rule, and it holds. Step 3 (compiled rooms) is downstream of step 2 and also does not.
- **A1 must NOT be unparked as a correctness fix.** It is measured here to make midair worse on 7/7.
  Its acyclicity claim (§S26.3) is confirmed and its float/midair consequence is now also measured;
  the ledger entry should carry both.
- **What IS live, and it is a genuine product question, not a defect:** leg 4 variant A delivers, on
  the five buildings with a usable location axis, **float down 25–66% and narrower bars on 7/7, at
  +30–50% programme, in exchange for 1–388 elements that appear before something they touch.**
  Whether 19 midair elements on Hospital is worth 2,613 fewer float violations is a call only the
  user can make. It is not a call this lane can measure its way out of.
- **The prior question is upstream of all of it:** the cycles come from `designatedSupport()`'s
  carrier-above branch, and the host relation that would disambiguate real suspension
  (`IfcRelVoidsElement`/`IfcRelFillsElement`) is parsed on import and absent from the shipped DBs —
  18–40% backward host guesses. **That is still §S32 rule 1 and still a user call**, and §S49 is the
  measurement that makes it the highest-value one in the lane.

**Nothing built, nothing shipped, `viewer/` unchanged.** A1, A3 and the 13 ledger items stay parked.

---

# §S50 — SHIP: THE CELL-GRAIN SCHEDULE (user decision 2026-08-21 — the graph is RETIRED) (2026-08-21)

**USER DECISION (2026-08-21), superseding the graph-side program:** the per-element support graph
is RETIRED. Precedence is carried by **(location, trade) ordering**, not by derived support edges.
Everything graph-side — ledger A1 (`hang` deletion), refuse-at-creation as a graph operation, SCC
contraction, the §S45/§S46 grain probes — is **SUPERSEDED, not parked**. The shippable
decomposition, in the user's own terms:

- **a. ARCH right** — trades ordered within a cell; a cell = one LOCATION × one TRADE. Plus the one
  real exception, measured in §S47.3: an element suspended from above is filed by what it hangs
  from, so MEP in location N waits on STRUCT in location N+1.
- **b. Rooms injection** — the location axis: declared rooms where present, compiled rooms
  (`viewer/lib/room_walker.js`, the §S32-blessed pattern) where absent, `level_deriver.js` (§S35)
  for the vertical.
- **c. Unstacked bars** — falls out of a+b; `wide50` is the existing measure, not a separate task.
- **d. Rendering follows the schedule** — NOT in this section's scope. `_displayTimeline` re-authors
  at render time; that inversion is the named follow-on.

This section is the SPEC (written before code, §S50.1) and then the RESULTS (§S50.2+). Branch:
`feat/cell-grain-location-schedule` off bim-ootb `origin/main` = `9db62a6`.

## §S50.1 — SPEC (b then a), written before any code

### S50.1.a — modules and ownership

| file | status | responsibility |
|---|---|---|
| `viewer/lib/level_deriver.js` | NEW (port of bim-compiler `build/level_deriver.js`, §S35 — algorithm unchanged, provenance header added) | vertical axis: ordered level for every element, T1-T4 ladder, §S34.3 tie-break, §LEVEL_DERIVE_* self-report |
| `viewer/location_axis.js` | NEW | the ONE runtime location pass (§S32.4 contract): per element → `{lvlIdx, loc, locSource}` where `locSource ∈ declared\|compiled\|level`; memoized per db object (once per load); read-only — NO writes to any table; §LOC_AXIS coverage lines per building |
| `viewer/cpm_schedule.js` | CHANGED | `run()` now schedules cells in product order (S50.1.c). `contactGraph`/`designatedSupport` KEPT (the hang-filing extraction + judge parity). `buildGraph`/`solve` remain exported for probes but are RETIRED from the live path — `run()` no longer calls them |
| `viewer/viewer.html` | CHANGED | script tags: `lib/room_walker.js?v=3`, `lib/level_deriver.js?v=1`, `location_axis.js?v=1` before consumers |
| `viewer/sw.js` | CHANGED | CACHE_VERSION bump + precache the two new files (room_walker already network-first-listed) |
| `viewer/time_machine.js` | CHANGED (one constant) | `_GANTT_CACHE_VERSION` bump — the schedule shape changes, cached materializations must regenerate. `_displayTimeline` body and every display/render function UNTOUCHED |
| `viewer/tests/witness_midair_zero.js` | CHANGED | re-lock (S50.1.e); LevelDeriver now required from `../lib/level_deriver.js` (in-repo), not from bim-compiler |

### S50.1.b — the location axis (b)

For every scheduled element (the same `_twItems` population the engine receives — no
subsetting, §S46's trap is named and avoided; every per-building number below states its N):

1. **Vertical**: `LevelDeriver.derive(db, elements)` — §S35 as built and gate-passed (100%
   coverage 7/7, T4=0, 14/14 fixtures). `lvlIdx` = the element's index on the building's level
   grid; elements with non-finite geometry (T4) get `lvlIdx = -1`, counted, reported.
   **The level-grid source is NOT extended in this PR** — `declared` where `spatial_structure`
   carries elevations, `uniform3m` fallback otherwise (LTU/Duplex). Deriving a grid from
   compiled-room wall anchors is a named possible follow-on, not built (§S34.4/§S29.4 cautions).
2. **Horizontal (the room)**, first match wins, source recorded per element:
   - `declared` — `rel_contained_in_space` rows whose space_guid is NOT a compiled `RM_`/`STC_`
     row: the IFC's own containment (name-keyed column read — the LTU column-order landmine).
   - `compiled` — where the DB already carries injected `RM_` rows (a prior in-session
     `RoomWalker.walk(write:true)`), those are read back as-is; otherwise
     `RoomWalker.compileRooms(db)` runs IN MEMORY and elements are assigned by the SAME
     containment join `writeRooms` uses (XY centre in any of the room's rects, canonical-floor /
     z-anchor storey join, SUSPECT rooms excluded) — join helpers exported from room_walker.js,
     not re-derived. Nothing is written to any table by this pass.
   - `level` — no room contains the element (slabs, roofs, façades, verticals): the location is
     the level itself (`L<lvlIdx>`).
3. **Coverage report** (§S32.4): `§LOC_AXIS <bld> n=… declared=… compiled=… level=… lvlT4=…`
   plus `§LOC_AXIS_GUARD` naming which branches were reachable on this building (a building with
   zero declared rooms must SAY the declared branch was unreachable, so 0 is not a silent default).

### S50.1.c — the cell schedule (a)

- **Cell** = `(lvlIdx, loc, trade)`; `trade` = the engine's own `seq` (SEQUENCE_RULES sequence
  number; `seq==null → 99`, the §S47 probe's rule).
- **Hang filing (the ONE exception)**: `designatedSupport(items, contactGraph(items))` — the
  judge's own election, unchanged — is read ONCE as EXTRACTION. If `lvl(support) > lvl(element)`,
  the element is re-filed at the support's `(lvlIdx, loc)` at its own trade (single pass, §S47b's
  measured mechanism; promoted count printed).
- **Order — two ordered lists, level-scoped (the §S48 instrument's own skeleton,
  `grid_probe.js` lines 788-817, room-refined):**
  `ES(cell(L, loc, T)) = max( finish of every cell (L, *, T'<T), finish of every cell (L'<L, *, T), epoch )`
  where epoch = min raw start (extracted, not invented). **Trade order is enforced at LEVEL
  scope, not room scope — stated as spec, not drift:** a room's own supports (its floor slab, its
  enclosing walls) are filed at the level location, so room-scoped trade order would leave the
  slab→fit-out relation unrepresented — exactly §S47.2's refused class. Rooms subdivide a level's
  cells (finer bars, contiguous packing per room); they add no cross-room edges within a level —
  rooms at one level are parallel locations, crew pools are what serialize them.
- **Packing**: cells processed in `(lvlIdx, trade, loc)` order (predecessors are always already
  final); members sorted `(bz, guid)`; each claims the earliest slot of its GLOBAL per-resource
  crew pool (same caps + default-3 as computeSchedule §CREW-CAP); `start = max(cellES, slot)`.
  Deterministic throughout — no randomness, no Date.now in the schedule.
- **Result shape unchanged** for `_displayTimeline`/`ScheduleEngine`: `{ok, solution:{times,
  makespanDays}, graph:{out:[], nElements, nNodes, msMeta:[], stragglerOf:zeros,
  counts:{…0, stragglers:0}, designated}}` — dependencies are simply EMPTY now (arrows are the
  declared-exception surface, none derived; ScheduleEngine emits `dependencies: []`).
- **Self-report + can-fail guard**: `§CELL_RUN` prints cells, locations, trades, promoted count,
  and the count of E1 support edges the final filing still cannot represent
  (`refusedEdges`, §S47's measure, computed against the final cell keys) — with the population
  stated. This number CAN go red (it is nonzero today on every building) — it is the engine-side
  guard that the § line is measuring something real.

### S50.1.d — what this deliberately does NOT do

- No `_displayTimeline`/render changes (d is the follow-on; the display grouping stays
  `storey|phase` until d lands, so on-screen bars are the coarser hull of the cell schedule).
- No extractor edits, no DB rebuilds, no writes to any table from the runtime pass (§S32; even
  the schedule tables stay untouched here — filling them is schedule_author's seam, not this
  engine's).
- No new level-grid source (see S50.1.b.1).
- No deletion of `buildGraph`/`solve` yet — exported, probe-reachable, retired from `run()`.
  Deleting them orphans several probes/witnesses in one PR; that cleanup is named as follow-on.

### S50.1.e — witness contract (same PR, never after)

- `W-MZ-2` (midair == 0) was the GRAPH era's invariant — §S49.3 proves it and low float are
  mutually exclusive under a cyclic support graph, and the user chose the grid. It becomes a
  LOCKED PER-BUILDING BASELINE (`CPM_MIDAIR_BASELINE`), measured fresh, first run with
  placeholder −1s and real numbers read off the FAIL lines (the §S20 lock discipline — never
  invented). `W-MZ-7` (drag one element 5d before its first contact → the judge MUST see it)
  stays as the can-fail proof of the same instrument.
- `W-MZ-8` float baselines re-measured and re-locked the same way, same PR.
- `W-MZ-4` orphans: purely geometric, expected UNCHANGED (that expectation is itself checkable).
- NEW `§S50_FOURAXIS` line per building: `days` (schedule span) · `wide50` (cell-grain bars AND
  the storey|phase display hull, both named) · `float` (`ScheduleGate.auditFloating`) · `midair`
  (this witness's own independent `census()`), each with the instrument named in the line.
- Coverage lines (S50.1.b.3) asserted present per building.

### S50.1.f — acceptance (what §S50.2 must show, control = B-ships-today at `9db62a6`)

All FOUR axes per building and fleet, new engine vs B control, instruments named; per-building
coverage (declared/compiled/level); can-fail evidence (W-MZ-7 red-capable + refusedEdges nonzero
somewhere + the lock discipline's first-run FAIL lines). Verified control baseline on `main`
(witness run, log `control_main_9db62a6.log`): `pass=39 fail=0`, W-MZ-8 float Terminal 2,151 ·
Hospital 3,960 · LTU 5,023 · JKR 1,222 · HHS 889 · Clinic 877 · Duplex 44 (fleet 14,166).

### S50.1.g — two additions folded in BEFORE any code (coordinator, 2026-08-21) + the gate

**1. §S46 subset control is mandatory.** Any figure computed on a restricted population (e.g.
room-contained elements only) is reported WITH the same population re-keyed by coarse
`storey|phase`. The gate quantity below avoids the trap by construction: it is computed on the
WHOLE scheduled population, N stated per building.

**2. Compiled-room coverage on LTU/Duplex is measured EARLY — before the cell scheduler is built
on top of it — with the pass mark declared BEFORE the run:**

> **PASS MARK (declared 2026-08-21, before the early probe runs): a building takes the cell path
> only if its hang-aware representability — (E1 designated-support edges inside one cell +
> representable by the product order) / (all E1 edges), §S47b's own formula, computed at the FINAL
> location filing on the WHOLE population — is ≥ 0.88.** §S48.3 measured the split: ≥88.5%
> representability → float −74–80% vs B; ≤78.1% → float +80–366% vs B. Below the mark the building
> KEEPS TODAY'S ENGINE (per-building fallback, computed at runtime from the data by this same
> formula — a rule, not a dictionary, §S39 discipline). **No tuning to reach the number:** if
> compiled rooms do not clear the mark on LTU/Duplex, that is the reported result and those
> buildings fall back; the level-grid-from-wall-anchors idea stays un-built (S50.1.b.1).

**Consequent engine change (supersedes the S50.1.c result-shape sentence only in that `run()` now
has two paths):** `run()` computes the location axis + hang filing + representability, prints
`§CELL_GATE <bld> repr=… mark=0.88 path=cell|graph`, and EITHER schedules cells (≥ mark) OR calls
the retained `buildGraph`+`solve` unchanged (< mark). The witness locks per-building baselines on
whichever path the gate selects — the gate decision line is part of the witness evidence, and the
fallback is exercised by whichever fleet buildings fail the mark (can-fail: both branches must be
seen live in the fleet run, or the gate itself is untested).

**Location filing detail (belongs to S50.1.b, stated here once):** an element contained in a room
takes the ROOM's level (`lvlIdx` of the room's floor anchor on the level grid) — the room is the
location and the location owns the vertical position; an element with no room keeps its own
derived level. Declared-room elements already get this via §S35 T1 (space→parent storey), so this
changes nothing for them; it makes compiled-room filing consistent with it.

**Control run for §S50.2 (done before code, log `control_main_9db62a6.log`, witness
`witness_midair_zero.js` at `9db62a6`): pass=39 fail=0; W-MZ-8 float Terminal 2,151 · Hospital
3,960 · Duplex 44 · HHS 889 · Clinic 877 · LTU 5,023 · JKR 1,222 (fleet 14,166). B's days/wide50
control values come from the early probe's own B rows (same instrument family as §S48.1).**

## §S50.2 — RESULTS. Shipped: PR #1442 (`feat/cell-grain-location-schedule`, base `9db62a6`) (2026-08-21)

**Everything below is measured, logged, and named by instrument. Logs (session scratchpad):
`control_main_9db62a6.log` (control witness on main) · `probe_s50_early.log` (early gate probe) ·
`witness_s50_run1.log` (placeholder run — the FAIL lines the locks were read from) ·
`witness_s50_run2.log` (green re-run, `pass=39 fail=0`).**

### S50.2.a — the fleet-wide data finding first: "declared rooms" never existed

`rel_contained_in_space` carries **ZERO IFC-declared rows on all 7 buildings** — every row is an
`RM_` room persisted by an EARLIER RoomWalker run (`rooms_meta` version stamp absent = pre-stamp
compile). §S46.1's "declared 13.41%/13.27%" was compiled containment all along. Consequence built
into `location_axis.js`: rooms are compiled FRESH in memory with the current walker (v3) — one
algorithm, one version, uniform fleet, nothing written; persisted rows are reported, not used.

### S50.2.b — the early probe (coordinator directive: measure BEFORE building; mark declared first)

Gate = hang-aware representability, §S47b formula, whole population (instrument:
`scripts/hull/probe_s50_early.js` on `9db62a6`; §S46 subset control printed per building):

| building | population | compiled-room coverage | lvl grid | repr | path (mark 0.88) |
|---|---|---|---|---|---|
| Terminal | 48,428 | 2,175 (4.49%) in 41 rooms | declared | **98.32%** | CELL |
| Hospital | 63,182 | 6,943 (10.99%) in 152 rooms | declared | **97.06%** | CELL |
| Clinic | 16,071 | 1,429 (8.89%) in 181 rooms | declared | **91.24%** | CELL |
| LTU_AHouse | 122,330 | 6,863 (5.61%) in 99 rooms | **uniform3m** | 78.06% | GRAPH |
| JKR | 8,985 | 143 (1.59%) in 21 rooms | declared (0.01m twins) | 77.15% | GRAPH |
| HHS_Office | 6,839 | 1,464 (21.41%) in 64 rooms | declared | 71.13% | GRAPH |
| Duplex | 1,119 | 14 (1.25%) in 4 rooms | **uniform3m** | 66.27% | GRAPH |

**The coordinator's question answered: compiled rooms do NOT rescue LTU/Duplex.** Coverage is
1.25–5.61% there and the broken axis is the VERTICAL (`uniform3m`), which rooms cannot fix — so
those buildings (plus JKR/HHS) fall back to today's engine rather than shipping the §S48.3
regression. No tuning was done to reach the mark. §S46 controls printed (e.g. Clinic roomed-subset
repr 37.84% vs whole 91.24% — the subset is WORSE, so nothing was claimed from a subset).

### S50.2.c — the four-axis table (instrument: `viewer/tests/witness_midair_zero.js` §S50_FOURAXIS;
control = B ships today at `9db62a6`, float/midair from `control_main_9db62a6.log`, B days/wide50
from §S48.1's grid_probe B rows — cross-validated: the four GRAPH-path buildings measure IDENTICAL
days/wide50/float/midair to that control in the same §S50_FOURAXIS lines)

| building | path | days | wide50 | float (`auditFloating`) | strict midair (`census()`) |
|---|---|---|---|---|---|
| Terminal | CELL | 164.7 → 239.4 (+45.3%) | cell bars **0**/197 · display hull 25→22 | 2,151 → **554 (−74.2%)** | 0 → 684 (LOCKED) |
| Hospital | CELL | 543.5 → 604.7 (+11.3%) | cell bars **0**/451 · display hull 15→16 | 3,960 → **935 (−76.4%)** | 0 → 218 (LOCKED) |
| Clinic | CELL | 183.5 → 237.0 (+29.2%) | cell bars **0**/255 · display hull 9→9 | 877 → **324 (−63.1%)** | 0 → 422 (LOCKED) |
| Duplex | GRAPH | 15.4 (=) | 8/16 (=) | 44 (=) | 0 (=) |
| HHS_Office | GRAPH | 98.6 (=) | 9/17 (=) | 889 (=) | 0 (=) |
| JKR | GRAPH | 45.6 (=) | 14/64 (=) | 1,222 (=) | 0 (=) |
| LTU_AHouse | GRAPH | 1,429.0 (=) | 35/58 (=) | 5,023 (=) | 0 (=) |
| **FLEET** | | **2,432 → 2,670 (+9.8%)** | | **14,166 → 8,991 (−36.5%)** | **0 → 1,324** |

- **Float** (§OBJECTIVE symptom 1's driver): −74/−76/−63% on the three gated buildings — inside
  §S48.3's predicted −74..−80% band. Fleet −36.5%.
- **Bars** (symptom 2): 0 wide CELLS on all three (measured, not assumed — `wide50cell` is computed
  from real spans and CAN be nonzero). The on-screen hull barely moves (25→22 / 15→16 / 9→9)
  because display grouping is still `storey|phase` — that re-pointing is item d, the named
  follow-on, NOT done here.
- **Days**: +45.3/+11.3/+29.2% — far below §S48's level-grain +91/+60/+88% on the same three.
  Mechanism: rooms subdivide a level's cells, and same-(level,trade) room cells are PARALLEL
  (crew pools serialize them), so packing overlaps where the level-grain probe serialized.
- **Midair**: the leg-4 exception surface, 684/218/422 (same order as §S48.1's 687/179/373),
  now LOCKED per building so it can never drift silently. §S49.3 stands: midair-0 and low float
  are mutually exclusive under a cyclic support graph — B's 0 was SCC-contraction simultaneity,
  and the user chose the grid.

### S50.2.d — can-fail evidence (the §STATUS instrument rule)

1. **The lock discipline itself went red first**: run 1 shipped placeholder −1 baselines and
   produced exactly 6 FAILs with the real numbers on the FAIL lines (`witness_s50_run1.log`),
   then run 2 locked them green (`pass=39 fail=0`). Never invented.
2. **W-MZ-7 unchanged and green 7/7** — drag one element 5d before its first contact, the census
   judge reports it.
3. **Both gate branches fired in one fleet run** (3 CELL / 4 GRAPH) — the gate is exercised,
   neither outcome is a structural constant. The cell engine ALSO went red during development:
   a cascading-promotion variant read 87.04% on Clinic where the instrument reads 91.24% —
   caught by `witness_s50_cell_engine.js` (shipped), fixed to the §S47b single-pass semantics.
4. **GRAPH-path identity proven, not assumed**: `witness_s50_cell_engine.js` asserts a gated-GRAPH
   building's times are IDENTICAL to a legacy no-db call, plus determinism (0 diffs on re-run).
5. `refusedE1` prints nonzero on every building (807–24,751) — the § lines measure something real.

### S50.2.e — what did NOT ship, and why (named, not smoothed over)

- **LTU/Duplex/JKR/HHS stay on the graph engine.** Their float/midair/bars are exactly yesterday's.
  The named lever (NOT built, §S32-adjacent user call): a level grid derived from compiled-room
  wall z-anchors for buildings with no declared elevations — §S34.4/§S29.4 caution that LTU's
  federated floor heights make a per-label grid wrong by construction, so this is a decision,
  not a default.
- **Leg-4 arrows are surfaced, not enforced** — `refusedE1` + the locked midair baselines ARE the
  reviewable exception surface (§S48.4 sized it at 17–76 cell pairs on six buildings). Enforcing
  them (variant-A style re-injection) was measured in §S49 to break midair further; wiring them
  as PLANNER-DECLARED arrows in the schedule tables is the intended product path, not something
  this engine invents.
- **Item d (display follows the schedule)** — untouched, as scoped. `_displayTimeline` still
  re-authors at render time; the display hull still groups `storey|phase`. This is the next task.
- **`buildGraph`/`solve` not deleted** — they ARE the fallback engine now, plus probe surface.
- **Two pre-existing red witnesses left red** (verified byte-identical on clean `9db62a6`,
  logs `main_witness_*.log`): `G-LI-2e` (its own message documents the known guids-collector bug)
  and `witness_zone_display_authoring` (`_tukeyBound` absent from its slice list — it crashes on
  main too). Not this PR's regressions; not silently absorbed either.
- **Persisted `RM_` rows left in place** — read-only ruling; they are reported (`persistedRM=`)
  and ignored. Whether to purge them from the shipped files is a user call (§S32 rule 2).

**Deliverable state: PR #1442 open against `origin/main`, auto-merge enabled, witness green at
`pass=39 fail=0` on the branch. `viewer/` display path untouched. No DB file modified, no binary
committed, nothing written to any table.**

---

# §S51 — SHIPPED: THE ACCEPTANCE SPLIT + ITEM d (the Gantt reads the cell schedule) (2026-08-21)

**User direction (relayed 2026-08-21): pragmatic, outliers acceptable, ship. The locked midair
residue (Terminal 684 · Hospital 218 · Clinic 422) is ACCEPTED as the leg-4 exception surface —
not re-litigated here, no leg-4 enforcement built, no harder gating. Symptom 1 is measured by
float from here. 5% infringement tolerance: already cleared by the §S50 locks themselves —
Terminal 684/48,428 = 1.41% · Hospital 218/63,182 = 0.35% · Clinic 422/16,071 = 2.63% (arithmetic
on locked values, no run spent re-proving it).**

Shipped: **PR #1444** (`feat/s51-display-reads-cells` off `eb832c1` = merged §S50); merge SHA and the ancestor-of-main check recorded at the end of this section. Control for every number
below = `eb832c1`. Log: `witness_s51_fleet.log` (§-lines), `pass=49 fail=0` (§S50's 39 + 10 new
asserts, all green; float/midair/days locks UNTOUCHED and green — the schedule itself did not move
in this PR, only what the drawer reads).

## §S51.1 — the acceptance split: "within walls or last" as a general rule

Rule (general — element class plays no part in the rule, no per-building constants, no tuned
thresholds; §S29's invented-constants lesson applied):
- **embedded** = some contact SPANS the element's height — the census judge's OWN `embedded`
  clause (bbox-based, so "within walls" is approximate enclosure — the judge's clause, not a new
  predicate), recorded per element;
- **late** = the element's phase sorts STRICTLY AFTER first-fix MEP (`MEP Rough-in`) in the
  SEQUENCE_RULES-derived phase order (min sequence per phase — the same global-table derivation
  time_machine's §GANTT_ROW_ORDER uses). Global rules table, not per-building;
- **NEITHER** = early + free-standing — the only number that matters.

Instrument: `witness_midair_zero.js` §S51_RESIDUE (census `emb` flag + rules-derived order).
Can-fail guard: **W-S51d asserts profiled == the locked §S50 baseline per building** (a profile
over any other population is the §S46 subset trap); §S51_RESIDUE_GUARD prints branch
reachability — `late` fired on exactly one element fleet-wide (Hospital), proving the branch CAN
fire and is not a structural zero.

| building | residue (locked) | embedded | late | **NEITHER** | neither as % of population | neither in first 10% of days |
|---|---|---|---|---|---|---|
| Terminal | 684 | 210 | 0 | **474** | **0.979%** | 43 |
| Hospital | 218 | 153 | 1 | **64** | **0.101%** | 1 |
| Clinic | 422 | 320 | 0 | **102** | **0.635%** | 16 |

**Composition of NEITHER (the honest read): it is dominated by STRUCTURE, not MEP.** Terminal:
Superstructure 391 of 474 (IfcPlate 326 — the metal-deck plate population, IfcColumn 39,
IfcMember 18) vs MEP Rough-in 75. Clinic: Superstructure 57 (IfcBeam 39, IfcColumn 16) vs MEP
Rough-in 37. Hospital: MEP Rough-in 30 (ducts 15, pipes 12), Architecture 26 (proxies 18),
Superstructure 8. **Early free-standing MEP specifically — the user's named unacceptable case —
is 75 / 30 / 37 elements = 0.15% / 0.05% / 0.23% of population**, far inside the 5% tolerance;
Hospital's first-10%-of-days window carries exactly 1 free-standing element of any kind.
Fleet-specific observation (NOT a rule input): Terminal's plate population dominating its bucket
is particular to that model's metal-deck extraction; the rule would read the same without knowing
that.

**Verdict per the user's framing: the early window is essentially clean of MEP dangling
(Hospital 1 element total in the first 10%), the residue is majority within-walls on
Hospital/Clinic, and the remainder is structure-phase plates/beams — shipped, not stopped.**

## §S51.2 — item d, narrowly: the drawer groups bars BY the schedule's own cells

Mechanism (3 links, each source-text-asserted by W-S51a/b/c so unwired code cannot go green):
1. `_displayTimeline` CPM-success branch remembers guid→cell (`_lastCell`) when the §S50 gate ran
   the CELL path — and sets it NULL on a GRAPH-path authoring (no cross-building leakage). Kept
   across the same generation cycle's REUSE replay (the partner-consumer path).
2. `injectGantt` stamps `_cell` into each op's parameters JSON (coverage-checked ≥99.9% like the
   display-timeline cache; §S51_CELL_STAMP log line). kernel_ops is the app's own write surface —
   no frozen table touched.
3. `buildGanttTasks` groups by real task id → **cell stamp** → storey|phase fallback. Graph-path
   buildings and pre-§S51 ops carry no stamp and group exactly as before.
   `_GANTT_CACHE_VERSION` 36→37 regenerates pre-stamp ops; sw.js v1061.

**On-screen wide50, before → after** (instrument: witness §S51_SCREEN — buildGanttTasks' own
grouping + `_tukeyBound` trim mirrored on the same items; can-fail: the graph-path rows must and
do read IDENTICAL):

| building | path | wide50 on screen BEFORE (storey\|phase, trimmed) | AFTER (cell bars) |
|---|---|---|---|
| Terminal | CELL | 9/72 bars | **0/197** |
| Hospital | CELL | 6/35 bars | **0/451** |
| Clinic | CELL | 4/32 bars | **0/255** |
| Duplex · HHS · JKR · LTU | GRAPH | 3/16 · 4/17 · 8/64 · 21/58 | IDENTICAL (no stamp exists) |

Four axes vs `eb832c1`: days/float/midair BYTE-IDENTICAL (same schedule, same locks green —
Terminal 554/684, Hospital 935/218, Clinic 324/422, graph buildings 44/889/1222/5023 & 0);
wide50 is the axis this PR moves, and only on screen. Coverage lines (§LOC_AXIS) unchanged from
§S50.2.b, printed again in the same run.

Siblings re-run on the branch: hosted_before_host, kernel_ops_sched_version, curtain_wall_opening,
s50_cell_engine GREEN; gantt_lock_integrity and zone_display_authoring remain at their exact
pre-existing main-state failures (§S50.2.e — verified identical on `eb832c1`, not this PR's).

## §S51.3 — deliberately NOT done

- No leg-4 enforcement, no harder gate, no midair re-litigation (user acceptance stands).
- The full item-d inversion (schedule authored once → display consumes, killing `_displayTimeline`
  re-authoring entirely) is still open — this PR makes the DRAWER read the cell schedule; the
  authoring seam itself is unchanged.
- Bar labels use the cell's location token (room guid / `L<n>`) — friendlier naming is cosmetic
  and left out.
- Cell bars are non-editable (taskId=null), same as storey|phase fallback bars today — wiring the
  edit verbs to cells is follow-on.

**MERGED AND VERIFIED: PR #1444 squash = `81cdf27`, confirmed `git merge-base --is-ancestor` of
`origin/main` (2026-08-21). Zero unpushed commits on the branch. `pass=49 fail=0` on the branch
head; the two pre-existing reds (G-LI-2e, zone_display_authoring) re-measured on THIS branch and
byte-identical to their `eb832c1` PASS/FAIL sets (only ms timings differ) — including
zone_display_authoring, re-run deliberately because §S51 edits `_displayTimeline`, which it
slices.**

---

# §S52 — WATCHDOG AUDIT: witness/code length and per-building hardcoding (2026-08-21)

**User ask:** *"i am also concerned about witness and code length and custom building hardcoded. See
if they are all in order. Recommend any refactor."* Audited on `origin/main` @ `eb832c1`
(pre-#1444). Answer: **the 4D path is clean of per-building hardcoding; length is one file.**

## §S52.1 — hardcoded buildings: 3 real hits in all of `viewer/`, none in the scheduler

Every building name in `cpm_schedule.js` (6), `schedule_gate.js` (13), `schedule_author.js` (3) and
`lib/level_deriver.js` (3) is a **comment citing measured evidence**, not a code branch. That is the
provenance discipline working, not a fit. Executable-code hits, whole viewer, excluding vendored
libs (`web-ifc`, `exceljs`, `sql-wasm`) whose matches are IFC class names (`IFCFLOWTERMINAL` etc.):

| file:line | what | verdict |
|---|---|---|
| `time_machine.js:5802` (`_loadTwin`) | `var building = (app && app.activeBuilding) \|\| 'Hospital'` | ⚠ **silent default to Hospital** for any model with no active building — loads the wrong ERP twin rather than none |
| `time_machine.js:5831` (`_loadShopfloor`) | same idiom | ⚠ same |
| `mep_qto_populate.js:19` | hardcoded `'HHS_Office_Federated_extracted.db'` | one-off tool; should take an argument |

Not 4D-critical, and §S29's generality problem is NOT in the scheduler — it is these two ERP-twin
loaders. Fix is to fall back to `null` and skip the load, never to guess a building.

## §S52.2 — length: `time_machine.js` is 60% of the 4D surface

`time_machine.js` **9,259** · `schedule_author.js` 1,703 · `lib/room_walker.js` 1,478 ·
`schedule_gate.js` 1,236 · `cpm_schedule.js` 867 · `foreign_schedule.js` 547 ·
`lib/level_deriver.js` 278 · `location_axis.js` 162 — **15,530 total**. Witnesses are proportionate:
`witness_midair_zero.js` 451, `witness_s50_cell_engine.js` 139.

Everything except `time_machine.js` is in order. **Named, not taken:** extract the Gantt model
(`buildGanttTasks()`, `computeDays()`, the `:6074` grouping) into `gantt_model.js`. It also removes
the reason `witness_midair_zero.js` slices six functions out of `time_machine.js` **by source text**
— a fragility that has already silently widened a slice once (`:141`).

## §S52.3 — DONE: the witness baselines are now DATA (bim-ootb PR #1445)

The one refactor taken. `CPM_FLOAT_AFTER_BASELINE` / `CPM_MIDAIR_BASELINE` / `CPM_ORPHAN_BASELINE`
moved out of the witness into `viewer/tests/baselines/midair.json`; the WHY stays in the witness
comments that cite the measuring section. A re-lock is now a data edit with a readable diff, and an
eighth building never edits test code.

**Why it was worth doing:** that coupling already cost this lane twice — §S39's 7 baselines red and
undiagnosed for a day, and #1435 attributing the failure to itself when all 7 were already red at
#1434.

Behaviour-preserving: `pass=49 fail=0`, every number identical to `81cdf27`. The loader refuses two
silent-failure modes, **both proven red, not assumed** (§STATUS instrument rule):

| perturbation | result |
|---|---|
| `float_after_cpm.Duplex` 44 → 43 | `FAIL W-MZ-8 Duplex … locked at 43 (got 44)`, `pass=12 fail=1` |
| `midair.JKR` deleted | `Error: … group "midair" has 6 buildings, expected 7` |

The second matters most: a missing group would assert against `undefined`, and `x === undefined`
never equals a count — the lock would **pass by absence**, the §S25_REVIEW.1 failure class.

## §S52.4 — actioned per §S37.5

| # | item | state |
|---|---|---|
| **F1** | witness baselines → JSON | ✅ **PR #1445**, auto-merge |
| **F2** | `time_machine.js:5802/:5831` default to `'Hospital'` — fall back to `null`, skip the load | ✅ **PR #1447** (§S54.2) |
| **F3** | extract `gantt_model.js` from `time_machine.js` | ✅ **PR #1446** (§S53), merged `a0885e2` |
| **F4** | `mep_qto_populate.js:19` hardcoded DB filename → argument | ✅ **no change needed** — the premise was wrong, the tool already takes `[db_path ...]` (§S54.1) |


---

# §S53 — F3: extract `gantt_model.js` from `time_machine.js` (2026-08-21)

**Scope:** §S52.4 item **F3**, taken now that item d (#1444) has landed. Behaviour-preserving
extraction only — no rule changes, no new numbers. Base: `origin/main` @ `a4932ee`.

## §S53.1 — one correction to §S52.2 before any code

§S52.2 claimed extracting the Gantt model *"also removes the reason `witness_midair_zero.js` slices
six functions out of `time_machine.js` by source text."* **That is wrong and is corrected here**
(verified by reading `witness_midair_zero.js:110-130` against `time_machine.js`, not from memory).
The six sliced functions are `_promoteRoofLoadPath`, `_buildXrayElements`, `_contactGraph`,
`_designatedSupport`, `_midairAudit`, `_displayTimeline` — the **schedule** path, none of which F3
touches. Extracting the Gantt model does not free any of them; that would be a separate extraction.

What F3 **does** remove, verified in the same read, is a different and closer coupling — three
places where the witness re-implements or slices the drawer's own rules:

| witness_midair_zero.js | what it does today | after F3 |
|---|---|---|
| `:139` | slices `_tukeyBound` **by source text** out of `time_machine.js` | `require('../gantt_model.js').tukeyBound` |
| `:453-478` (`§S51_SCREEN`) | **re-implements** `buildGanttTasks()`'s grouping + trim ("this witness mirroring buildGanttTasks grouping+_tukeyBound", its own words) | calls the real grouping |
| `:487-492` (`§S51_RESIDUE`) | **re-derives** the SEQUENCE_RULES phase order — "same derivation as time_machine's §GANTT_ROW_ORDER" | `GanttModel.phaseOrder(SR)` |

A mirrored judge is the §S25_REVIEW.1 failure class one step removed: the drawer's rule can change
and the witness that reports on the drawer keeps measuring the old rule, green throughout.

## §S53.2 — SPEC (written before the code)

New file `viewer/gantt_model.js`, dual-mode (`window.GanttModel` + `module.exports`), following
`cpm_schedule.js` / `lib/level_deriver.js`'s exact convention. **Pure functions only** — it holds no
state, reads no TM module var, touches no DOM. Everything moved verbatim; comments move with their
code (the WHY stays attached to the rule it explains).

| export | moved from | contract |
|---|---|---|
| `tukeyBound(arr, lowSide)` | `time_machine.js:4413` | unchanged formula, the one envelope both the axis and every bar span use |
| `phaseOrder(seqRules)` | the `_ROW_PHASE_ORDER` IIFE inside `buildGanttTasks()` | derived from SEQUENCE_RULES' own sequence numbers; the 6-name fallback only when SR has not loaded |
| `FALLBACK_PHASE_ORDER` | same | exported so a caller can assert *which* branch it got |
| `groupKeyOf(taskId, cellId, storey, phase)` | `buildGanttTasks()` `:6121` | the §S51 precedence: real task id → cell stamp → `storey\|phase` |
| `buildTasks(ops, idx, seqRules)` | `buildGanttTasks()` body | `{ tasks, identified, unidentified }` — grouping, Tukey trim, §GANTT_ROW_ORDER sort |
| `computeDays(placeOps)` | `computeDays()` `:125` | `{ days, projectStart, projectEnd, axisStart, axisEnd, n }` |

`time_machine.js` keeps both function names as **thin wrappers**: the dirty-flag gate, the
assignment into `_ganttTasks`/`_days`/`_projectStart`/`_projectEnd`/`_ganttAxisStart`/`_ganttAxisEnd`,
the `window.__tmGanttAxis` hook and the three `§GANTT_*` console lines stay in `time_machine.js`,
because they are **state and reporting**, not model. The model computes; TM owns the state.

**Degrade:** the module is essential to the drawer, so a load failure must be LOUD, never silent —
the wrappers log `§LOAD_FAIL gantt_model.js` and leave the state untouched rather than throwing
mid-frame. Same posture as the `location_axis.js`/`cpm_schedule.js` script tags.

**Wiring:** `viewer.html` script tag BEFORE `time_machine.js`; `sw.js` precache entry + mandatory
`CACHE_VERSION` bump in the same PR (`feedback_sw_version` — missed once on #1409, cost a round-trip).

## §S53.3 — the witness (issue each check names)

New `viewer/tests/witness_gantt_model.js` — `require()`s the real module, no slicing. Each check
names the issue it proves, per the project's test rule:

| id | proves / disproves |
|---|---|
| W-GM-1 | grouping precedence: a task id beats a cell stamp beats `storey\|phase` — the §S51 rule, so a regression that drops the cell stamp is caught here, not on screen |
| W-GM-2 | one outlier member cannot define a bar's span (the §GANTT_MINI_TRIM cliff bug), and an `n=1` group is still non-negative-width |
| W-GM-3 | row order is DERIVED from SEQUENCE_RULES, not the stale `_VAR_ORDER` copy — feed SR with MEP before Architecture and the derived order must follow SR, not the fallback |
| W-GM-4 | an unknown phase sorts AFTER the known ones (never silently bucketed at position 0) |
| W-GM-5 | `computeDays` axis is QUALIFIED: one wild `end_ts` must not rescale `axisEnd`, while `projectEnd` (the real playback bound) still reaches it |

**Behaviour-preserving proof:** `witness_midair_zero.js` before/after on the same tree — every
number identical, `pass=49 fail=0`. Baseline captured at `a4932ee` before any edit.

## §S53.4 — RESULTS (2026-08-21)

**Shipped as bim-ootb PR #1446** (`refactor/gantt-model`, base `a4932ee`). Behaviour-preserving.

| | before | after |
|---|---|---|
| `time_machine.js` | 9,293 | **9,186** (−107) |
| `gantt_model.js` | — | 206 (the rules + their comments, nothing new) |
| `witness_gantt_model.js` | — | 169 (**21 checks**, `pass=21 fail=0`) |
| source-text slices of `time_machine.js` in `witness_midair_zero.js` | 12 | **11** (`_tukeyBound` gone) |
| re-implementations of a drawer rule inside a witness | 3 | **0** |

**Proof it changed nothing.** `witness_midair_zero.js` before (`a4932ee`, pristine) vs after, same
tree, same DBs: `pass=49 fail=0` both, and a normalized diff of the two full logs (175 lines each)
is EMPTY except wall-clock `ms={...}`/`compileMs=` timings and the two lines whose *label text* this
work deliberately changed. Every count, every span, every baseline: identical.

**W-GM-* is not passing by absence** — three perturbations of the extracted module, each proven red,
then reverted:

| perturbation | result |
|---|---|
| cell branch removed from `groupKeyOf` | `FAIL W-GM-1b`, `FAIL W-GM-1d`, `pass=19 fail=2` |
| `tukeyBound` → plain min/max | `FAIL W-GM-2a` (bar span 19.0d → **901.0d**), `FAIL W-GM-2d`, `FAIL W-GM-5c` (axis 48d → 1001d), `pass=18 fail=3` |
| `phaseOrder` forced to the fallback list | `FAIL W-GM-3a`, `FAIL W-GM-3c`, `pass=19 fail=2` |

The middle row is the §GANTT_MINI_TRIM cliff bug reproducing on demand: 12 members inside 12 days
plus one at day 900, and the retired rule draws the bar across the whole project.

CI-equivalent gates run locally, all green: `node --check` over all of `viewer`+`modeller`,
`npx eslint viewer modeller`, `audit_sw_precache.js` (121/121, `gantt_model.js` registered),
`audit_script_tags.js` (146/146). `sw.js` `CACHE_VERSION` v1061 → **v1062** in the same commit
(`feedback_sw_version`). Also re-run green, unchanged: `witness_s50_cell_engine`,
`witness_gantt_edit_undo` (9), `witness_gantt_native_generate` (5), `witness_gantt_group_move` (9),
`witness_gantt_baseline` (11). `witness_gantt_lock_integrity` fails 1 of 20 (`G-LI-2e`) — its own
assert message calls it a KNOWN PRE-EXISTING BUG, unrelated and untouched here.

## §S53.5 — ⛔ FOUND WHILE DOING F3: `witness_zone_display_authoring.js` has been DEAD since 2026-08-17

Not caused by this work — **verified at pristine `a4932ee`, the identical crash.** Auditing every
consumer of the moved `_tukeyBound` turned it up:

```
ReferenceError: _tukeyBound is not defined
    at _tmDisplayRemap (evalmachine.<anonymous>:672:26)
```

Stage 2 hoisted `_tukeyBound` to `time_machine.js` module scope and `_tmDisplayRemap` started
calling it; this witness slices `_tmDisplayRemap` but was never given `_tukeyBound`. It has died
before its FIRST assertion on every run since. **Fixed here** the way F3 makes natural — bound from
the real module (`var _tukeyBound = GanttModel.tukeyBound;`, both sandboxes) instead of sliced, so
the failure mode cannot return.

**With it alive again: `pass=16 fail=2`, and the 2 are a real open question, not a wiring fault.**

```
§ZDA_WITNESS Duplex_extracted              floating 22  -> 37    outWindow 13  -> 0
FAIL W-ZDA-4a  floating not worse under display-authored windows (22 -> 37)
§ZDA_WITNESS HHS_Office_Federated_extracted floating 894 -> 1839 outWindow 707 -> 11
FAIL W-ZDA-4a  floating not worse under display-authored windows (894 -> 1839)
```

What the run itself says about it, stated as evidence and NOT as a diagnosis — this was not chased,
it is outside F3:
- `base` runs `_ogSupportSweep`, `next` deliberately SKIPS it (the shipped §ZONE_DISPLAY_AUTHORING
  change, asserted PASS two lines earlier: *"overlay skips `_ogSupportSweep` exactly on
  `display_authored=1`"*). The sweep is the floating-reducing pass, so the delta is the sweep's
  contribution — the open question is whether display-authored windows were supposed to make it
  redundant. On this judge they do not.
- Window fidelity moves the OTHER way and hard: `outWindow` 13→0 and 707→11 (W-ZDA-4b PASS).
- W-ZDA-6 on the same buildings, same run: **midair=0** on the CPM display timeline — the ops
  timeline the movie actually plays. W-ZDA-4a judges `capWindowRescale`-clamped WINDOW items, which
  this witness's own neighbouring comment calls *"the WINDOW view … not the schedule."*

**Next session:** decide whether W-ZDA-4a's premise still holds post-§CPM_DISPLAY (it predates it),
or whether skipping the sweep has a real cost. Do not absorb the two reds silently.

---

# §S54 — F2 + F4: the last two §S52.4 items (2026-08-21)

## §S54.1 — F4 is ALREADY DONE. Closed with evidence, not with a change.

§S52.1 recorded `mep_qto_populate.js:19` as *"hardcoded `HHS_Office_Federated_extracted.db`; one-off
tool; should take an argument."* Re-read at `a0885e2` before touching anything — **the premise is
wrong, the tool already takes arguments**:

```js
:9    * Usage: node mep_qto_populate.js [db_path ...] [--template=cidb2024_my]
:18   const DEFAULT_DBS = [ 'HHS_Office_Federated_extracted.db', 'Hospital_extracted.db',
:19-24    'Terminal_extracted.db', 'Ifc4_Revit_extracted.db', 'SampleHouse_extracted.db',
          'Duplex_extracted.db' ];
:31-34  for (const a of args) { if (a.startsWith('--template=')) …; else dbPaths.push(a); }
:83-85  const targets = dbPaths.length > 0 ? dbPaths : DEFAULT_DBS.map(f => path.join(BUILDINGS_DIR, f));
```

`:19` is the FIRST ENTRY of a six-building default fleet, reached only when the caller passes no
path — not a hardcoded target. The audit read one line and inferred the rest. **F4 = ✅ no change
needed**, and the §S52.1 row is corrected here rather than left to be re-discovered.

## §S54.2 — F2 SPEC: never guess a building for the ERP twin

`time_machine.js` `_loadTwin()` and `_loadShopfloor()` both open with:

```js
var building = (app && app.activeBuilding) || 'Hospital';
```

With no active building the loaders do not skip — they **silently load Hospital's ERP twin** and
attach its cost/phase figures to whatever model is on screen. This is the one real per-building
hardcoding left in the 4D path (§S52.1 audited the rest clean: every other building name in the
scheduler is a comment citing measured evidence).

**Rule, and it is the project's own:** never invent a value. No active building is a REAL state — an
arbitrary IFC opened straight into the viewer — and the correct answer there is "this model has no
folded ERP project", which is exactly what both functions already return for a building with no
`C_Project` row (`§TM_TWIN_MISS`).

**Change (both functions, symmetric):**
- `var building = app && app.activeBuilding;`
- if falsy: log `§TM_TWIN_NOBLD` / `§PERF_NEG_CACHE shopfloor no-building`, return
  `Promise.resolve(null)` **before** the 25.8MB `ad_seed.db` fetch. Not a `_twinMiss` entry — the miss
  cache is keyed by building name and this state has none; it is a skip, not a cached miss.
- Nothing else moves. The cache checks, the in-flight guards and the negative caches below are
  untouched, and a building that IS active behaves exactly as before.

**Witness `witness_tm_erp_twin_guard.js`** — slices both functions out of `time_machine.js` into a vm
sandbox whose `APP.cachedFetch` counts calls:

| id | proves / disproves |
|---|---|
| W-TET-1 | with no active building, `_loadTwin` resolves null **and never fetches** `ad_seed.db` — the guess is gone, and gone before the 25.8MB read |
| W-TET-2 | same for `_loadShopfloor` |
| W-TET-3 | with an active building, both still fetch and still resolve — the guard did not disable the feature |
| W-TET-4 | `'Hospital'` appears nowhere in either function's source — a fallback cannot creep back as a different expression |

## §S54.3 — RESULTS (2026-08-21)

**F2 shipped as bim-ootb PR #1447** (`fix/tm-erp-twin-no-building`, base `a0885e2`). Both loaders
now skip on a falsy `activeBuilding`, before the fetch. `witness_tm_erp_twin_guard.js`: **`pass=6
fail=0`**.

**Not passing by absence** — restoring the exact pre-fix line, `(app && app.activeBuilding) ||
'Hospital'`, in both functions:

| | fixed | pre-fix line restored |
|---|---|---|
| W-TET-1 `_loadTwin` | PASS, `fetches=0` | **FAIL**, `fetches=1` |
| W-TET-2 `_loadShopfloor` | PASS, `fetches=0` | **FAIL**, `fetches=2` |
| W-TET-3a/b control (building present) | PASS | PASS (correctly — the loaders still work) |
| W-TET-4a/b source | PASS | **FAIL** both |
| summary | `pass=6 fail=0` | **`pass=2 fail=4`** |

The fetch counter is what makes W-TET-1/2 real: with the fallback restored the promise still
resolves null (the witness's `cachedFetch` rejects), so a value-only assertion would have passed
while the 25.8MB read had already happened against the wrong building.

`sw.js` `CACHE_VERSION` v1062 → **v1063**. `audit_sw_precache` 121/121, `audit_script_tags` 146/146,
`node --check` over `viewer`+`modeller` green.

**§S52.4 is now zero:** F1 ✅ #1445 · F2 ✅ #1447 · F3 ✅ #1446 · F4 ✅ no change needed (§S54.1).

---

# §S55 — does authored task identity keep the §S51 cell win? (spec 2026-08-21, base `6dab2d1`)

**The question, and it has never been measured.** §S51's "0 wide cells" was measured with **no
authored schedule** — every shipped DB ships `tasks=0 / task_elements=0` (verified 2026-08-21:
Hospital/Clinic/Duplex/HHS all 0/0; `Terminal_meta.db` has **no such table**). Identity is created
**in-session** by the authoring path (`schedule_author.js:463+`). So the demo has an order
dependency, and on the far side of it the grouping rule changes:

```
gantt_model.js groupKeyOf:  tid ? 'T:'+tid  :  cellId ? 'C:'+cellId  :  storey|phase
```

`tid` **outranks** `_cell`. Every op the authoring run covers stops being grouped by its cell and is
grouped by its task instead. This is the intersection of "accurate schedule" and "editable bars",
and nobody has run it.

## §S55.1 — DECLARED BEFORE THE RUN (this is the point of writing it first)

| outcome | meaning |
|---|---|
| **PASS** | with a real authored `idx`, wide-bar count stays **0** and bar count stays at the CELL grain (Hospital ≈451, Terminal ≈197) |
| **FINDING, not a failure** | bar count collapses toward the TASK grain (Hospital ≈35, Terminal ≈72 — the §S51_SCREEN *BEFORE* line, since `schedule_author`'s zones are phase×storey) and/or wide bars > 0 |

A FINDING is the **expected shape** if identity outranks the cell stamp, which the code says it
does. §S51's result was measured at `idx=null`; a difference is not a regression and is **NOT to be
fixed in this PR**. The number is the deliverable.

## §S55.2 — method (three constraints, each for a named reason)

1. **`idx` from a REAL authoring run, never a synthetic map.** `schedule_author.js:463+` writes the
   rows; the demo path IS the authoring path, so the witness measures what it actually produces.
2. **Report BOTH grains — wide-bar count AND bar count.** If identity collapses 451 cell bars into
   35 task bars, the drawer has left what §S51 locked, and that shows in the COUNT before it shows
   in the widths.
3. **Report the split**: of the bars produced with a real `idx`, how many are `T:`-keyed vs
   `C:`-keyed vs `storey|phase` — i.e. how much of the model the authoring run actually covers.

Fleet: **Hospital primary**, Terminal + Clinic secondary (the three cell-path buildings). Node-side
only, no browser, no screenshots. Deliverable `viewer/tests/witness_s55_identity_vs_cell.js`.

## §S55.3 — RESULTS (2026-08-21) — **FINDING**, on all three cell-path buildings

Shipped as bim-ootb **PR #1448** (`feat/s55-identity-vs-cell`, base `6dab2d1`). Measurement only —
no engine file touched. `witness_s55_identity_vs_cell.js`, `pass=18 fail=0`, 13.8s for the fleet.

| building | ops | `idx=null` (today's live state) | real authored `idx` | split |
|---|---|---|---|---|
| **Hospital** | 63,182 | **451 bars, 0 wide** | **36 bars, 6 wide** | T:=36 C:=0 s\|p=0 |
| **Terminal** | 48,428 | **197 bars, 0 wide** | **49 bars, 6 wide** | T:=49 C:=0 s\|p=0 |
| **Clinic** | 16,071 | **255 bars, 0 wide** | **32 bars, 4 wide** | T:=32 C:=0 s\|p=0 |

**Coverage is TOTAL** — `identified` = every op, `unidentified` = 0 on all three. Authoring does not
partially override the cell grain; it **replaces it entirely**. That is the §S55.1 FINDING branch,
the expected shape if `tid` outranks `_cell`, and it is **reported, not fixed here**.

**What it means for the two goals, stated once.** "Bars not stacked" and "bars editable" are
currently the SAME switch, in opposite positions:

- **unauthored** (today's cold open): 451/197/255 bars at the cell grain, **0 wide**, and **nothing
  is editable** — no `tasks` row exists, so no bar carries a `taskId`.
- **authored** (what a planner must do to drag anything): 36/49/32 bars at the zone grain,
  **6/6/4 wide** — 17% / 12% / 13% of bars again spanning >50% of the project.

The destacking §S51 bought is not lost to a bug; it is handed back by the grouping precedence the
moment identity exists. **Do not "fix" this by demoting `tid`** — task identity is what makes a bar
addressable by `moveTask`/`resizeTask`, and §S51's own §S51.3 already recorded cell-level edit verbs
as not-wired. The real options are a user call, unmeasured, and NOT to be picked by a session:
(a) author AT the cell grain so identity and cell agree (the zone decomposition becomes 451 tasks,
not 36), or (b) keep zone tasks but sub-group bars by cell within a task. Both are design, not
repair.

**Anchor that makes the number trustworthy:** W-S55-1 reproduces §S51's own lock (0 wide of
451/197/255) on the same instrument BEFORE measuring anything new, and W-S55-4 refuses to be green
by absence (at `identified=0` the question would be untested). Full guard list in the PR body.

---

# §S58 — observability hardening: the log lines that would have caught things (spec 2026-08-21)

Scouted, then each claim verified first-hand on `origin/main` @ `cab9ad5`. **Additive logging only —
no behaviour change, no rule change.** §S56/§S57 stay reserved for the bake guard and the Alt+C
witness. Both headline gaps sit exactly on the two acceptance goals.

## §S58.1 — the two that matter

**(a) The Gantt's three proof lines fire ONCE PER BUILDING, ever — so every EDIT is unlogged.**
`time_machine.js:5668` declares `_ganttTasksComputed = false; // log once flag`; it gates
`§GANTT_MINI` / `§GANTT_ROW_ORDER` / `§GANTT_BAR_IDENTITY` at `:6104-6119` and is reset only at
`:8273` (building close). But `drawGanttMini()` `:7224` calls `buildGanttTasks()` on every redraw,
and the model recomputes whenever `_ganttDirty` is set — i.e. after every drag, retime, group-move,
link and undo. So bar count, phase row order and the editable/non-editable identity mix are
reported for the FIRST build and never again. **This is the "Gantt editable, timeline updated" goal
with no proof line on the edit path.** A drag that duplicates bars, reorders phases or flips the
identity mix is invisible in the log for the rest of the session.

Fix: report on every real REBUILD, not once. Cost is bounded and not per-frame — `buildGanttTasks()`
early-returns on `!_ganttDirty`, so this fires only when the model actually recomputed. Add a
rebuild ordinal so a reader can see how many rebuilds a gesture caused.

**(b) `§HOSTED_BEFORE_HOST` has NO log line at all** — `grep -c "console.log('§HOSTED_BEFORE_HOST"`
in `schedule_gate.js` = **0**. It is the fix for the user-reported "electrical outlets and hanging
elements appearing a bit early" bug, and it is unobservable. `§GEO_ORDER` reports `hostEdges=`
(matches found) with **no denominator** and no count of hosted elements that fell through unguarded.
Its own sibling already does this correctly — `§CURTAIN_WALL_OPENING` reports `cwGated=` /
`stillUngated=`. **This is the "ARCH completed sub→level upwards before anything else" goal with a
blind spot.** Fix: report `hostedTotal` / `hostMatched` / `fellThrough`, same shape as the sibling.

## §S58.2 — four silent failures that log nothing (additive `console.warn` only)

Each is a `catch` that returns a degraded result indistinguishable from a legitimate one. **Not
changing the fail-open behaviour — that is a separate decision with its own witness.** Making it
VISIBLE first is the cheap half and the honest order.

| file:line | what goes silently wrong |
|---|---|
| `schedule_author.js:117` / `:169` | `_classFragmentation` / `_linearWeighting` return empty on ANY throw — durations silently revert to flat/count-based, the §LABOR_QUANTITY_WEIGHT and §HEAVY_MEMBER_SPEED_LIMIT fixes just don't fire |
| `schedule_author.js:1005-1014` | `wouldCycle()` — if the `task_sequences` read throws, `adj={}` and it returns **false for every check**: the sole guard against a cyclic (invalid) schedule goes blind, fails OPEN |
| `schedule_author.js:1257-1264` | `moveTaskCascade` — same pattern; a move computes with no predecessor clamp / successor cascade, logged identically to "this task has no dependencies" |
| `location_axis.js:52` | persisted-containment COUNT swallowed — `§LOC_AXIS` then reports a false "zero persisted" instead of "couldn't check" |

Plus `time_machine.js` `computeDays()`: the Tukey-qualified display axis vs the true playback end is
written to `window.__tmGanttAxis` and **never logged**, though §GANTT_AXIS_OUTLIER's own header names
that quantity as the cause of a prior bug class ("a bar's DATA could be correct while its DRAWN pixel
position was still wrong"). One line.

## §S58.3 — witness

`witness_s58_observability.js`. Each check names its issue:

| id | proves / disproves |
|---|---|
| W-S58-1 | a SECOND rebuild emits the three §GANTT lines again — the once-per-building gate is gone, so an edit is auditable |
| W-S58-2 | the rebuild ordinal increments, so N rebuilds per gesture is readable from the log |
| W-S58-3 | `§HOSTED_BEFORE_HOST` fires on a real building with `hostedTotal>0` and `hostMatched+fellThrough == hostedTotal` — an accounting identity, not a bare count |
| W-S58-4 | the four silent catches each emit a `§`-tagged warn when forced to throw — proven by INDUCING the throw, not by reading source |
| W-S58-5 | `§GANTT_AXIS` reports both the qualified axis and the true bounds |

## §S58.4 — RESULTS (2026-08-21)

Shipped as bim-ootb **PR #1449** (`feat/s58-observability`, base `cab9ad5`). Additive logging only.
`sw.js` v1063 → **v1064**. Gates: `node --check` viewer+modeller, `audit_sw_precache` 121/121,
`audit_script_tags` 146/146, eslint clean on every touched file, `witness_s55` re-run `pass=18
fail=0` with the new lines present.

**The new §HOSTED_BEFORE_HOST line found something on its FIRST run** — a number that did not exist
before because nothing reported it:

| building | hostedTotal | matched | fellThrough |
|---|---|---|---|
| Hospital | 2,877 | 2,830 | 47 (1.6%) |
| **Terminal** | 2,367 | 2,099 | **268 (11.3%)** |
| Clinic | 2,742 | 2,737 | 5 (0.2%) |

All fall-throughs are `noNearest` — the host cell WAS found, no nearest host matched. Those elements
are gated at `baseMs` only, i.e. **not held behind their host**: the "outlets appearing early"
symptom class, unmeasurable until this line existed. **Reported, not chased** — Terminal's 268 is
the item to look at when this is next picked up.

**Owed:** the §S58.3 witness (W-S58-1..5) is NOT in #1449 — pushed without it so the lines are
live-testable now. It must INDUCE each catch to prove the warn fires, not read source.

## §S58.5 — ⛔ WITNESS-SUITE ROT: a scouted audit of all 45 4D witnesses/probes

Ran as part of the same sweep. **Findings are the scout's; the two I re-ran myself are marked.**
Ranked, and every one of these is a REPAIR item, not a new feature:

1. **`witness_midair_zero.js` — the scout's `pass=32 fail=7` is WRONG, resolved 2026-08-21.** Run
   a THIRD time, on `cab9ad5` + §S58: **`pass=49 fail=0`, zero FAIL lines** — matching my two
   earlier runs (`a4932ee` and post-#1446). The scout ran it against the STALE working checkout
   (`13700fd`). Its "least trustworthy in the suite / 7 admitted failures" framing does not hold on
   `main`. *(Standing lesson, third time this week: a scout reading `~/bim-ootb`'s working tree is
   reading a stale branch — dispatch prompts must say `git show origin/main:<path>`.)*

   **But its SECOND claim survives and is worth measuring.** `census()`
   (`witness_midair_zero.js:297`) counts a contact as `bearing || carrier || embedded`, where
   `carrier` is explicitly an element ABOVE (`S.bz >= T.tz - GAP && S.tz > T.tz + EPS`) — the
   witness's own comment says it "mirrors `_contactGraph`'s carrier clause EXACTLY... that asymmetry
   was measured and deliberately LEFT ALONE." Meanwhile the SHIPPED judge went directional in
   `6a395ca`/#1435 (*"designatedSupport() never hangs a grounded element on carrier-above +
   directional floating judge"*). So the independent judge and the shipped judge now encode
   DIFFERENT rules. The `isGround` gate above `midair++` mitigates the obvious case (an element whose
   only contacts are above is counted grounded, not midair), which is presumably why it is still
   green — but "green" and "measuring the same thing the engine measures" are not the same claim.
   ⛔ **Open: measure whether the two judges still agree per element, or only in aggregate.** Not
   chased here."
2. **Three witnesses CRASH on the same stale-slice bug class as the `_tukeyBound` one §S53.5 found**
   — `witness_tm_geo_order_cycles.js` and `witness_big_element_support_coverage.js` (both
   `ReferenceError: _zoneIndex is not defined`), and `witness_zone_display_authoring.js` (still
   crashing on the pre-#1446 checkout). `tm_geo_order_cycles` carries the load-bearing Terminal
   regression bar (cycles===0, floating===8) and has been down silently for 9+ days. **This is the
   third instance of the same failure mode — the argument for extracting `support_sweep.js` is now
   empirical, not aesthetic.**
3. **`witness_door_window_host_wall.js` — RED (exit 1)**, and it exits on first failure, so the real
   "door starts before host wall finishes" check never runs. Brittle exact-string match broke when a
   legitimate `hostGate(el)` was added to the chain.
4. **`witness_crew_demand.js` — GREEN but computing wrong numbers**: reimplements crew/cost math
   against a stale 8h `SHIFT_MS` instead of the live 24h `SHIFT_HOURS`, so reported utilisation is
   ~3x too low. Green-and-wrong is worse than red.
5. **`probe_gantt_stagger.js` prints a real `FAIL` then calls `process.exit(0)` unconditionally** —
   same pattern in `probe_gantt_panel_stagger.js` and `probe_gantt_drag_outliers.js`. Exit-code
   automation can never see these fail.
6. **5 puppeteer probes cannot run at all** in this checkout (module missing) — every finding about
   them is static-only.
7. Lower: `probe_captured_floating.js` (17 source-text slices, the highest in the suite, and ZERO
   assertions — cannot fail short of an exception), `witness_class_fallback_blackbox.js` (no
   fixture-presence guard), `witness_shift_schedule.js`/`witness_shift_tasks.js` (silent-skip then
   exit 0), `witness_tm_refold.js` (hand-retyped "sliced" SQL, no drift detection).

**The pattern across 1, 2, 4, 5 and 7 is one thing:** a witness that cannot fail, or fails silently,
is worse than no witness — it is a green light nobody earned. That is the repair queue.

---

## §S65 — RECAP: the Gantt-editor edit path and what actually witnesses it (2026-08-22)

Commissioned by the user while §S64 shipped: *"GanttChart editor … allowing the Gantt Chart in Time
Machine to be edited by pulling the bars, and doing CPM. Thus they have to regenerate the JSON that
drives the build up on canvas. U may launch an agent to recap its Witness logging."* A recap agent did
the sweep; **every load-bearing claim below was re-verified directly against `origin/main` before it
was written here** — the agent's own run was against a 30-commit-stale checkout and it said so.

### The real path (verified, `file:line` on `origin/main`)
`wireGanttDrag()` (`time_machine.js:6413`) captures the gesture and gates pointerdown on
`_ganttEditable` → `commitGanttDrag()` (`:6015`) refuses while a bake is recording
(`_tmBusyRecording`, `:6007`) → the engine verb `ScheduleAuthor.moveTaskCascade` (`schedule_author.js:1260`)
or `resizeTask` (`:1346`) → `retimeTaskElements()` (`time_machine.js:5890`) rewrites each element's
`kernel_ops` row (`UPDATE kernel_ops SET timestamp=?, parameters=?` — this IS "regenerate the JSON";
`parameters` is a per-element JSON blob mutated in place) → `_tmResyncAfterRetime()` (`:5990`)
re-sorts `_ops` and invalidates the reveal index + X-ray cache → `invalidateGanttModel(); computeDays();
drawGanttMini(); renderAtTime(_cursor)` re-paints the buildup.

### ⚠ CORRECTION TO THE MENTAL MODEL — the drag does **not** run CPM
`computeCpm` (`schedule_author.js:1428`, the real forward+backward pass that writes float and
`is_critical`) has exactly **two callers**, verified by grep over all of `viewer/` excluding tests:
`schedule_editor_ui.js:441` (the standalone Schedule Editor tab's own "Compute CPM" button) and
`schedule_sync.js:26` (`case 'cpm'`, a cross-tab replay). **Neither is reachable from the in-canvas
Time Machine drag.** What the drag runs is a *push-only forward cascade plus a predecessor-floor
clamp* — a topological BFS over `task_sequences`, not a float/critical-path solve. That is a
deliberate, documented choice (`schedule_author.js:1385` explains why `computeCpm`'s graph derivation
is not used for the display/edit layer), not an oversight. **If the intent is "drag → CPM re-solve →
new critical path on screen", that step is NOT BUILT.** Nothing is missing a witness here; the
feature itself does not do it. This is the one thing to settle before any more work on this lane.

### § coverage — the edit path is well instrumented
Refusals: `§TM_BAKE_LOCK` (`:6019`, `:6360`), `§GANTT_DRAG_REJECT` (`:6434`, `:6449`, `:6025`,
`:6030`, `:6063` the §S22_EPOCH_FIX clock guard, `:6079`), `§GANTT_PROPS_REJECT`.
Engine: `§GANTT_EDIT_CLAMP` (`schedule_author.js:1302`), `§GANTT_EDIT_MOVE` (`:1334`),
`§GANTT_EDIT_RESIZE` (`:1356`), `§GANTT_EDIT_CASCADE_ABORT` (`:1311`), `§CASCADE_BLIND` (`:1289`).
Retime: `§S22_EPOCH_FIX_DETAIL` (`:5938`), `§GANTT_RETIME tasks/rows/ms` (`:5971`),
`§RETIME_OUTLIER_AUDIT` (`:5973`), `§S22_EPOCH_FIX` (`:5977`). Commit: `§GANTT_DRAG_COMMIT` (`:6112`).
Siblings: `§TM_RULER_SHIFT_*`, `§GANTT_GROUP_SHIFT_*`, `§GANTT_EDIT_UNDO*`.
Lock gate: `§GANTT_LOCK_BASELINE` (`:4243`), `§GANTT_LOCK_BREACH` (`:6752`), `§GANTT_LOCK_VERIFY` (`:6764`).

### ⛔ The gaps, verified not guessed
1. **`§TM_BAKE_LOCK` guards 2 of 5 edit entry points.** `_tmBusyRecording` is called at `:6017`
   (`commitGanttDrag`) and `:6358` (`generateGanttSchedule`) — **verified by grep, exactly two call
   sites.** `shiftGanttSchedule` (`:6152`), `commitGanttGroupShift` (`:6203`) and `undoLastGanttEdit`
   (`:6255`) have none: a ruler shift, a group move or an undo can still mutate the timeline
   mid-recording. `witness_tm_bake_lock.js` only covers the two that are guarded, so the hole is
   unwitnessed as well as unguarded. **This is the cheapest real fix on this lane.**
2. **No persistence on the edit path.** `persistDb` (`schedule_author.js:1657`) has two callers,
   verified by grep: `schedule_editor_ui.js:493` and `schedule_author_ui.js:27`. None of the four TM
   commit functions call it — an in-canvas drag lives only in the in-memory sql.js `app.db`.
3. **`§RETIME_OUTLIER_AUDIT`'s `collapsed60s`/`inverted` counters are logged on every commit and
   asserted by nothing.** `witness_gantt_edit_coherence.js` G-COH-2..4 test the pure `_retimeSpan` on
   synthetic input, not the live counters a real drag accumulates.
4. The four commit-summary lines' FIELD values (`cascaded=N`, `clamped=`) are asserted nowhere; only
   the browser `drag_test.js` checks that `§GANTT_DRAG_COMMIT` fires at all.

### 🔴 G-COH-6 is a FALSE NEGATIVE — a stale fixed-window assertion
`witness_gantt_edit_coherence.js:117` does `txt.slice(rt, rt + 2200)` from `function
retimeTaskElements(` and asserts the slice contains `_retimeSpan(`. **Measured on current main: the
call sits at offset 5073.** The function grew (the §S22_EPOCH_FIX audit code) and the window did not.
`retimeTaskElements` still calls `_retimeSpan` — the assertion is wrong, the code is fine. Fix is to
brace-match the function body instead of slicing a magic 2200. Same class as every other
"a text slice cannot state its own dependencies" finding on this project.

---

## §S67 — "editing screws up redisplay": FOUND, FIXED, GATED (2026-08-22, bim-ootb PR #1474 merged)

User report, verbatim: *"it is challenging and problematic the last time I edited it screws up
redisplay."* Not vague, not intermittent, not a mystery — it was **wiring**, and it took one grep to
find once §S65 had mapped the path.

`retimeTaskElements()` rewrites every affected element's `kernel_ops` row. The 3D canvas does not
re-read that by itself: `_tmResyncAfterRetime()` (`time_machine.js:5990`) is what re-sorts `_ops`,
clears the incremental-reveal index (`_evMesh`/`_evSig`/`_incrPrimed`) and rebuilds the X-ray cache.
Its call sites have carried the comment *"without this the canvas plays the OLD times"* from day one.

**Measured on `origin/main` @ `3b5a3e9`: five functions re-time, only three resynced.**

| gesture | re-times | resyncs | redisplay |
|---|---|---|---|
| `commitGanttDrag` (bar drag) | ✅ | ✅ | correct |
| `shiftGanttSchedule` (ruler) | ✅ | ✅ | correct |
| `commitGanttGroupShift` (marquee) | ✅ | ✅ | correct |
| `undoLastGanttEdit` | — | ✅ | correct |
| **`linkGanttBars`** — E4 dependency link, `:6614` | ✅ | ❌ | **STALE** |
| **`openGanttProps`** — E7 typed apply, `:6691` | ✅ | ❌ | **STALE** |

Both broken paths repaint the GANTT and never rebuild the reveal state: the bars move, the model
does not. The four correct paths are exactly why it read as intermittent rather than always-on.

**Fixed** with one `_tmResyncAfterRetime()` call in each, identical to the four existing sites.
**Gated** by `viewer/tests/witness_gantt_retime_resync_wiring.js` — `W-RESYNC-1` brace-matches every
function containing a `retimeTaskElements()` call and asserts it resyncs; `W-RESYNC-2a/b/c` assert
the resync still does its three jobs (a resync that stopped clearing the reveal index would pass
W-RESYNC-1 and still ship the bug). Proven red three ways, including against unmodified `origin/main`
where it names exactly the two offenders. Placed in `viewer/tests/` so the suite runner sees it (§S66).
`sw.js` v1069 → v1070.

**The lesson worth keeping:** §S65 was commissioned as documentation and paid for itself the same
hour. The bug had been reachable by `grep -c retimeTaskElements` vs `grep -c _tmResyncAfterRetime`
for as long as it existed. **Map the path before hunting the bug.**

---

## §S68 — SPEC: drag → CPM **annotate** (not re-solve). User's decision, 2026-08-23

**The item-1 product question is SETTLED: annotate.** The drag keeps its push-only cascade +
predecessor clamp as the date engine. CPM runs *after* it, in `fixedDates` mode, purely to derive
float and criticality from the dates the cascade just produced. Nothing re-derives a date.

### Why not a true re-solve — and an honest correction to the number that motivated it
`computeCpm`'s forward pass, with `fixedDates` OFF, derives each task's ES from the graph (`max` over
predecessors' EF+lag). `schedule_author.js:1385` records the measured cost of that on a multi-parent
zone graph — **Terminal's 71-zone graph deriving PF=138d against the real movie's 93d, +48%**
(CPM_FLOAT_GAP.md, 2026-08-03) — and that historical number is what the decision was argued from.

**Re-measured on current `main`, with the real `LABOR_RATES`/`RATES`, it does not reproduce.** Both
modes return an IDENTICAL project duration on all 8 fleet buildings today (Clinic 466d, Duplex 29d,
HHS 133d, Hospital 1208d, JKR 115d, LTU 2460d, TermRooms 389d, Terminal 389d); criticality differs by
at most 7pp. So on a *freshly generated, unedited* schedule the derived forward pass currently agrees
with the real dates. Stating this plainly rather than repeating the +48%, which is no longer what the
code does on these fixtures.

**The flag is still load-bearing, and the measurement that shows it is the EDIT case — the only case
that matters here.** Push one task 30 days off its graph-derived position (exactly what a user drag
does) and the modes split immediately: `fixedES=54` vs `derivedES=24`, `fixedPF=59d` vs `derivedPF=29d`
(W-CPM-3, real Duplex fixture). Without `fixedDates`, CPM would compute float against dates the user's
drag deliberately overrode — and since it also WRITES `early_start`, it would publish an `early_start`
that contradicts the `schedule_start` on the same row. `fixedDates:true` skips exactly that forward
derivation and nothing else.

### What annotate writes — and what it must never write
`computeCpm`'s only write is one `UPDATE tasks SET early_start, early_finish, late_start,
late_finish, free_float, total_float, is_critical` (`schedule_author.js:1466`). It does **not**
touch `schedule_start` / `schedule_finish` / `schedule_duration`. That is the whole safety property
of this feature and W-CPM-2 asserts it byte-for-byte, not by reading the code.

Under `fixedDates:true`: ES/EF come straight from the persisted, movie-coherent dates; the Kahn topo
sort still runs (it is the cycle/orphan integrity check); the backward pass (LS/LF → total float →
`is_critical = total_float <= 0`) runs unchanged over the real edges. So criticality stays meaningful
while the dates stay the cascade's.

### Wiring — one call per re-time path, the §S67 shape
New `_tmAnnotateCpm(schedId)` in `time_machine.js`, called immediately after
`_tmResyncAfterRetime()` in **all six** functions that call `retimeTaskElements()`
(`commitGanttDrag`, `shiftGanttSchedule`, `commitGanttGroupShift`, `undoLastGanttEdit`,
`linkGanttBars`, `openGanttProps`), plus once on first Gantt build so the path is visible before any
edit. It caches `taskId -> {critical, totalFloat}` in `_ganttCritical` and logs
`§GANTT_CPM_ANNOTATE`. Undo is included on purpose: undoing an edit must un-colour the bars it
coloured.

### Display
`drawGanttMini` paints a **2px red (#e53935) rail along the bottom edge** of every critical bar —
deliberately not a stroke frame, because all three frame colours are taken (yellow = captured,
orange = cursor-active, cyan = marquee-selected) and a fourth frame would be unreadable at 9px. The
solid-edge-marker idiom is already in this file (the variance panel's cost cap,
`ctx.fillRect(px + pw - 3, y, 3, barH)`). `openGanttProps` gains a read-only total-float line.

### Known limits, named not discovered later
1. **Cycle bail.** `computeCpm` returns `{error:'cycle'}` and logs `§SE_CPM_BAIL` on a non-DAG. Per
   `4D_SCHEDULE_PERFECTION.md` §MILESTONE, **cycles are 0 on 5 of 7 buildings** — the other two get
   no critical path at all. That is correct behaviour (never fake a critical path), logged loudly.
2. **Leaf-only.** The query excludes `is_summary=1`, so summary bars are never marked critical.
3. **Thin `tasks` table.** A schedule whose `tasks` predates the widened DDL has no `is_critical`
   column and the `UPDATE` throws. Annotate guards on a probe query and logs
   `§GANTT_CPM_ANNOTATE_SKIP reason=thin_tasks_table` rather than throwing inside a drag commit.
4. **Not persisted.** Annotate writes to the in-memory `app.db` like every other edit-path write —
   RESUME item 3 (no `persistDb` on the edit path) applies to it identically and is unchanged by it.

### Witnesses — `viewer/tests/witness_gantt_cpm_annotate.js`
- **W-CPM-1** (source gate, brace-matched like §S67 — never a fixed slice): every function that
  calls `retimeTaskElements(` also calls `_tmAnnotateCpm(`. Proves the wiring cannot rot the way
  §S67's resync did.
- **W-CPM-2** (behavioural, real sql.js): a 4-task FS chain + one parallel slack task, dates already
  set. Run `computeCpm(..., {fixedDates:true})`; assert **every `schedule_start`/`schedule_finish`/
  `schedule_duration` is byte-identical before and after**, and that `is_critical=1` lands on the
  chain and `0` on the slack task with `total_float > 0`. This is the "annotate never moves a date"
  proof — the one property the whole decision rests on.
- **W-CPM-3** (the counter-proof): the SAME fixture with `fixedDates` OFF must derive a DIFFERENT
  early_start for the slack task than the fixed run — proving the flag is actually load-bearing and
  W-CPM-2 is not passing because the two modes are identical on this fixture.
- **W-CPM-4** (display gate): `drawGanttMini`'s body reads `_ganttCritical` — a computed criticality
  nothing paints is not the feature.

---


### ✅ BUILT — §S68 shipped (2026-08-23). Evidence, in the order it was produced.

**Code** (`bim-ootb`, branch `fix/gantt-cpm-annotate`): `viewer/time_machine.js` `_tmAnnotateCpm()`
+ 8 call sites (the 5 re-time paths, `undoLastGanttEdit`, `linkGanttBars`'s edge case, the unlink
handler, and a once-per-building prime in `buildGanttTasks`), the float rail in `drawGanttMini`, the
float line in `openGanttProps`. `viewer/sw.js` v1070 → **v1071** (mandatory same-PR, or the fix never
reaches an existing user). `viewer/tests/witness_gantt_cpm_annotate.js` is new.

**W-CPM 20/20 green** (`node viewer/tests/witness_gantt_cpm_annotate.js`), and **proven RED against
unmodified `origin/main`** — exit 1, naming exactly the 5 unwired functions plus both display gates,
while W-CPM-2 stays green there (correct: the engine property predates the wiring).

**The safety property, measured not assumed:** `§GANTT_CPM_ANNOTATE_DATES tasks=20 changed=0` — every
`schedule_start`/`schedule_finish`/`schedule_duration` byte-identical across a real
`computeCpm(fixedDates:true)` on a real materialized Duplex schedule. `is_critical` persisted 15/15.

**Live, in the real page** (headless probe, real drag through `window.__tmGanttDrag`, Duplex):
- first build: `§GANTT_CPM_ANNOTATE tasks=19 critical=11 (58%) projectDuration=13d float=0..3 datesWritten=0 (fixedDates)`
- after `move +7d`: `§GANTT_EDIT_MOVE ... cascaded=5` → `§GANTT_CPM_ANNOTATE tasks=19 critical=3 (16%) projectDuration=20d float=0..10`

The drag pushed the end date 13d → 20d and the critical set re-derived 58% → 16% off the new dates.
That is the feature working end to end, in §-log values, with no screenshot involved.

**Fleet criticality, real rate tables (W-CPM-5):** Terminal 27%, TermRooms 27%, Hospital 33%, LTU 55%,
JKR 64%, Clinic 78%, Duplex 79%, HHS 82%. CPM ran on **8 of 8** — no cycle bail. (Limit 1 in the spec
above was over-cautious: the §MILESTONE cycle count is about the generation graph, not `computeCpm`'s
topo check on the materialized leaf tasks.)

**Display decision, made from that measurement.** A red-only rail marks 4 bars in 5 at the top of that
range, so the rail paints **both** colours: red `#e53935` = zero float, green `#26a69a` = has slack.
Bottom edge, 2px, not a fourth stroke frame — yellow (captured), orange (cursor-active) and cyan
(marquee-selected) already take all three, and a fourth is unreadable at a 9px row.

**Regression sweep, 14 related witnesses:** 13 PASS, 1 RED. The red is `witness_gantt_lock_integrity`
— **verified RED on unmodified `origin/main` too**, so it is not this change. Its cause is the same
class as G-COH-6: it slices functions by name out of `time_machine.js` and a *comment* containing
`` `function _midairAudit(` `` gets picked up as the declaration, producing `SyntaxError: Unexpected
template string`. Named here, not fixed here.

`witness_gantt_edit_undo` DID go red on this branch and was fixed properly: it evaluates the sliced
`commitGanttDrag` in a `vm` sandbox, so it needed a `_tmAnnotateCpm` stub next to the
`_tmResyncAfterRetime` stub §GANTT_RETIME_RESYNC added for the same reason. Green again.

**What this does NOT do**, so nobody re-discovers it as a bug: annotate writes to the in-memory
`app.db` like every other edit-path write, so RESUME item 3 (no `persistDb` on the edit path) applies
to the CPM columns identically. And the drag still does not re-solve dates — that was the decision.

---

## §S69 — SPEC: §TM_BAKE_LOCK guards 2 edit paths in 8. RESUME item 2.

### The count in RESUME is wrong, and wrong in the unsafe direction
RESUME item 2 says "guards 2 of 5 edit entry points." **Measured on `origin/main` @ `89ad90f`:
`_tmBusyRecording` has exactly two call sites (`time_machine.js:6082` `commitGanttDrag`, `:6427`
`generateGanttSchedule`) and there are EIGHT timeline-mutating entry points, not five** — so the real
figure is 2 of 8, with SIX unguarded. §S67 found `linkGanttBars` and `openGanttProps` after item 2
was written and nobody went back to re-count; the eighth was not on anyone's list at all (below).

| entry point | mutates | §TM_BAKE_LOCK on main |
|---|---|---|
| `commitGanttDrag` | dates + `kernel_ops` | ✅ |
| `generateGanttSchedule` | the whole schedule | ✅ |
| `shiftGanttSchedule` | every task's dates + ops | ❌ |
| `commitGanttGroupShift` | selected tasks' dates + ops | ❌ |
| `undoLastGanttEdit` | restores dates + ops | ❌ |
| `linkGanttBars` | adds an edge, re-applies successor | ❌ |
| `openGanttProps` (apply + unlink) | dates + ops / removes an edge | ❌ |
| `buildTaskIndex` → §GANTT_SCHEDULE_STALE regen | **re-materializes the whole schedule in place** | ❌ |

**The eighth was found by the gate, not by reading.** `buildTaskIndex`'s stale-genVersion self-heal
calls `materializeZones` and rewrites the entire schedule — mid-bake that swaps the timeline out from
under the recorder. It is on no list in this file because nobody thought of it as an "edit path"; it
is one, and W-TBL-5's derivation named it on the first run. Its guard goes on the REGEN BLOCK, not on
`buildTaskIndex` itself: refusing the whole function would leave the Gantt with no task index and
break the display the film is recording. Skipping only the regen keeps the film on the schedule it
started with, and `genVersion` stays stale so the self-heal simply runs on the next rebuild after the
bake.

`setGanttBaseline` is deliberately NOT on this list: it writes only the `task_baseline` snapshot
table, touches no `tasks` date and no `kernel_ops` row, so it cannot desync a recording. Left
unguarded on purpose, stated here so the next reader does not "fix" it.

### The fix
Extract the refusal — currently five duplicated lines at each of the two guarded sites — into
`_tmEditLocked(verbName)`: it calls the existing `_tmBusyRecording(A())`, logs the SAME
`§TM_BAKE_LOCK refused=<verb> reason=<flag>` line, and returns true. Every mutating entry point
becomes `if (_tmEditLocked('<name>')) return;` on its first line. For `openGanttProps` the guard goes
on the two WRITE handlers (typed apply, unlink), not on opening the panel — reading a task's dates
mid-bake is harmless and blocking it would be a worse product than the bug.

No new flag: `_tmBusyRecording` keeps reading the same `_maxqActive` / `_cinemaOrbitActive` /
`_stillRefineActive` triple `dlod_nav.js` already names (W-TBL-0b exists precisely to stop a second
source of truth appearing, and it stays green).

### Witnesses — extending `viewer/tests/witness_tm_bake_lock.js`
- **W-TBL-5 (the gate that makes the count self-maintaining).** Do not hardcode a list of seven. A
  function is timeline-mutating if its brace-matched body calls `retimeTaskElements(` or one of the
  mutating engine verbs (`moveTaskCascade` / `shiftSchedule` / `shiftTasks` / `materializeZones` /
  `addDependency` / `removeDependency`). Assert every such named function calls `_tmEditLocked(`.
  A new edit path added next month is caught by construction; that is the whole point, since this
  item exists because two paths were added and the guard was not.
- **W-TBL-5b** `undoLastGanttEdit` by name — it mutates by restoring rows directly and calls none of
  those verbs, so the derived rule cannot see it. Same shape as W-CPM-1b.
- **W-TBL-6 (behaviour, not source).** Extend the existing `run(flags)` sandbox to drive
  `shiftGanttSchedule` and `commitGanttGroupShift` as well: with a recording flag set, neither
  reaches its engine verb and both log a loud refusal; with nothing recording, both run past the
  guard. The RELATIVE pairing the existing W-TBL-4 established — a guard that refuses everything
  must fail — extends to the new paths.
- The existing W-TBL-1..4 must stay green with the refusal moved into the helper: the log line is
  byte-identical by construction, and the sandbox now slices `_tmEditLocked` alongside
  `_tmBusyRecording`.

---


### ✅ BUILT — §S69 shipped (2026-08-23). Evidence.

**Measured on unmodified `origin/main` before touching anything** (same derivation the new gate uses,
looking for main's per-site `_tmBusyRecording` pattern):
```
mutating entry points (incl. undo) = 8
  GUARDED   (2): commitGanttDrag, generateGanttSchedule
  UNGUARDED (6): buildTaskIndex, shiftGanttSchedule, commitGanttGroupShift,
                 linkGanttBars, openGanttProps, undoLastGanttEdit
```

**Code:** `_tmEditLocked(verb)` — one helper, one log format — replaces the two duplicated per-site
refusals and is now called from all eight (`openGanttProps` on its two WRITE handlers, not on opening
the panel; `buildTaskIndex` on the regen block only). `sw.js` v1071 → **v1072**.

**W-TBL 17/17 green**, up from 10. The new checks:
- **W-TBL-5** derives the mutating-entry-point set from the code (calls `retimeTaskElements` or a
  mutating engine verb) and requires every one to be guarded — `§TM_BAKE_LOCK_WIRING
  mutatingEntryPoints=7 [...] unguarded=0`. This is what makes the count self-maintaining; it is the
  check that found `buildTaskIndex` in the first place.
- **W-TBL-5b/5c/5d** cover the three cases the derivation cannot: `undoLastGanttEdit` (mutates by
  restoring rows directly, calls no engine verb), and the two deliberate exemptions —
  `setGanttBaseline` (writes only `task_baseline`) and `_materializeNativeSchedule` (bails when a
  schedule already exists, so it can only ever write a building's FIRST one). Both exemptions assert
  the PROPERTY that earns them, not the name.
- **W-TBL-6a/6b** extend the existing relative pairing: with a flag set the two shift verbs reach no
  engine verb (`move=0 materialize=0 shiftSchedule=0 shiftTasks=0`, 4 loud refusals); idle, both run
  past the guard into `SA.shiftSchedule` / `SA.shiftTasks`. A guard that refused everything fails.

**Red-proved** against unmodified `origin/main`: exit 1 with `W-TBL-0c _tmEditLocked ... is not
defined`. That explicit early check exists so the red reads as the finding it is instead of an opaque
`ReferenceError` from a slice.

**Live, real page** (same headless probe as §S68, Duplex): unchanged behaviour, no spurious refusal —
`§GANTT_MINI tasks=19 rebuild=1` → `§GANTT_CPM_ANNOTATE critical=11 (58%) PF=13d`, drag `move+7d`
commits and re-annotates to `critical=3 (16%) PF=20d`. The guard is on hot paths (`buildTaskIndex`
runs on every rebuild), so "does the viewer still work idle" is a real question and this answers it.

**Regression sweep, 13 related witnesses: all PASS.** Two went red on this branch and were fixed
properly, not stubbed around: `witness_gantt_edit_undo` and `witness_gantt_native_generate` slice
verbs into a `vm` sandbox and now slice `_tmEditLocked` alongside `_tmBusyRecording` — the real
helper, not a stub, so the sandbox stays honest about what the guard does.

---

## §S70 — SPEC: the TM edit path never persists. It is a GAP, not a design choice. RESUME item 3.

### The question item 3 asks, answered from the code
*"Decide whether that is intended (edits are scratch until the Editor tab saves) or a gap."*
**It is a gap, and this project already ruled on the identical question once.** `schedule_editor_ui.js`
:487 introduces its own persist with the comment: *"§SE-6: debounced write-back to the SAME IndexedDB
cache slot the building was loaded from — **the gap that made every schedule edit vanish on tab
close**."* The in-canvas Gantt has that same gap, unfixed, on the same DB, through the same
`ScheduleAuthor.persistDb`.

Three things verified before deciding, not assumed:
1. **`retimeTaskElements` writes raw SQL** (`db.prepare("UPDATE kernel_ops SET timestamp = ?...")`,
   `db.run('BEGIN')`/`COMMIT`) — it does NOT route through `KernelOps`' commit API, so kernel_ops.js's
   own `_persistToIdb` debounce never fires for a Gantt edit. Nothing else persists it either.
2. **The slot IS read back.** `schedule_author_ui.js:23` — the IDB slot keyed by `APP.DB_URL` is *"the
   same slot cachedFetch reads"*. So persisting genuinely makes an edit survive a reload; it is not a
   write into a hole.
3. **The cost is small and already accepted here.** `persistDb` exports the whole DB. MEASURED with
   real sql.js on the real fleet: Duplex 9MB/3ms, Terminal 27MB/10ms, LTU 68MB/26ms, HHS 72MB/28ms,
   Clinic 124MB/47ms, JKR 194MB/70ms, **Hospital 252MB/86ms**. One dropped frame at the worst,
   1200ms-debounced, on a path the Editor tab already runs against these same buildings.

### The fix
`_tmPersistEdit(what)` — resolves `APP.db` + `APP.DB_URL`, refuses loudly if either is missing or
`APP._cacheDisabled` is set (incognito / low quota, the same guard `kernel_ops.js` uses), and calls
`ScheduleAuthor.persistDb`, which owns the 1200ms debounce. Called from the seven real EDIT commit
points: drag, ruler shift, group shift, undo, link, typed apply, unlink.

**Deliberately NOT called from `buildTaskIndex`'s stale-schedule regen** (§S69's eighth path). That
runs on a plain page load; persisting there would turn every ordinary visit to a 252MB building into a
252MB IDB write. A regen is reproducible from the code that regenerated it — an edit is not. Stated so
the asymmetry is a decision on record.

### Witnesses — `viewer/tests/witness_gantt_edit_persist.js`
- **W-PERS-1** source gate, brace-matched: every function that calls `retimeTaskElements(` also calls
  `_tmPersistEdit(`; plus `undoLastGanttEdit` by name (it mutates by restoring rows directly).
- **W-PERS-2** the exemption is real: `buildTaskIndex` does NOT call `_tmPersistEdit` — asserted, so
  nobody "completes" the wiring later and puts a 252MB write on the cold path.
- **W-PERS-3** behaviour in a `vm` sandbox: `_tmPersistEdit` calls `persistDb` with **`APP.db` and
  `APP.DB_URL`** (not some other db — that exact mistake cost a P0 in `kernel_ops.js`,
  §KRN_PERSIST_GUARD), and refuses when `DB_URL` is missing or `_cacheDisabled` is set.
- **W-PERS-4** end-to-end, live headless: drag a task, wait for `§SCHED_PERSIST`, **reload the page**,
  and assert the dragged task's `schedule_start` in the freshly-loaded DB is the NEW date. This is the
  only check that proves the round trip; the gates above only prove the wiring.

---


### ✅ BUILT — §S70 shipped (2026-08-23), and the live round trip found a SECOND, bigger bug

**The wiring went in as specified** (`_tmPersistEdit` on all seven edit commit points, exempt on the
cold regen path; W-PERS 15/15 green; red-proved on `origin/main`). Then W-PERS-4 — the live
drag→reload check — **failed**, and the failure is the finding:

```
[drag]   §SCHED_PERSIST url=/buildings/Duplex_extracted.db size=15264KB
[drag]   §GANTT_EDIT_PERSIST what=drag ok=true
         afterDrag   = 2026-08-30
[reload] §CACHE_HIT Duplex_extracted.db size=14.3MB          ← a DIFFERENT blob
         afterReload = 2026-08-23                            ← the edit is gone
```

The write succeeded and the read hit the cache, and they were **two different slots**.
`scene.js`'s `cachedFetch` looks blobs up under `DbResolve.cacheKey(url)` (W-DB-CACHE-KEY:
`/buildings/X.db` and `buildings/X.db?v=2` both fold to `buildings/X.db`), and reads the RAW url only
as a **legacy fallback when the canonical key misses**. Every persist path wrote the raw url.

**So on any profile that had ever loaded the building normally, every persisted edit was written
somewhere nothing reads — and that was already true before this lane touched anything.** It silently
broke `schedule_editor_ui.js`'s §SE-6 ("the gap that made every schedule edit vanish on tab close" —
closed in name only) and `kernel_ops.js`'s "survive refresh" (§KRN_PERSIST_FIX, which had already been
debugged once for a *different* cause and still didn't work). Three write paths, one shared defect.

**Fixed in the writer, not per-caller:** `persistDb` derives the slot with `_cacheKeyFor()` (exported,
so read and write cannot drift), `kernel_ops.js` derives the same, and `schedule_editor_ui.js`'s
`_idbGetDb` now READS by that derivation too. Round trip after the fix:

```
[drag]   §SCHED_PERSIST url=/buildings/Duplex_extracted.db key=buildings/Duplex_extracted.db size=15264KB
         afterDrag   = 2026-08-30
[reload] §CACHE_HIT Duplex_extracted.db size=14.9MB   ← the edited blob
         §GANTT_CACHE_HIT ops=1119                    ← no §GANTT_PREMATERIALIZE: a schedule now exists
         afterReload = 2026-08-30                     ✅ PASS W-PERS-4
```

**Gated so it cannot come back:** W-PERS-5a/b/c assert all three paths use the canonical derivation;
**W-PERS-5d** runs `persistDb`'s derivation against `DbResolve.cacheKey` on six real url shapes
(prod, query-busted, absolute OCI, `/deploy/` dev tree, `import://`) and requires agreement;
**W-PERS-5e** is the red control — the canonical key must actually DIFFER from the raw url for a
normal viewer url, or 5d would pass trivially. Red-proved twice: once with main's `time_machine.js`
(W-PERS-0 fails), once with the branch's `time_machine.js` over main's other three files, where
exactly 5a/5b/5c fail and nothing else does.

**Cost, measured before wiring anything** (whole-db `export()`, real sql.js, real fleet): Duplex
9MB/3ms, Terminal 27MB/10ms, LTU 68MB/26ms, HHS 72MB/28ms, Clinic 124MB/47ms, JKR 194MB/70ms,
**Hospital 252MB/86ms**. One dropped frame at the worst, behind persistDb's 1200ms debounce.

**Regression sweep: 15/15 PASS.** `witness_gantt_edit_undo` needed a `_tmPersistEdit` stub — stubbed
rather than sliced, deliberately, because the persist cannot change a row this witness asserts on
(unlike `_tmEditLocked`, which can prevent the edit and so is sliced). `sw.js` v1072 → **v1073**.

**Note for whoever picks up the DLOD/streaming lane:** `DbResolve.cacheKey`'s K3 rule keys on
`/deploy/` with a LEADING slash, so a relative `deploy/dev/buildings/X.db` folds onto the production
`buildings/X.db` key instead of keeping its own. Both reader and writer agree, so nothing is
inconsistent today — but a dev-tree and prod-tree build of the same filename would share one cache
slot. Not touched here; named so it is not re-discovered as a mystery.

---

## §S71 — G-COH-6 was a false negative; the audit counters now have an assertion. RESUME items 4 + 5.

### Item 4 — the false negative, measured
`witness_gantt_edit_coherence.js:117` asserted over `txt.slice(rt, rt + 2200)` from
`function retimeTaskElements(`. **Measured on current `main`: the brace-matched body is 6345 chars
and the `_retimeSpan(` call sits at offset 5073** — outside the window. Run the old expression
against today's source and it returns `false`. The assertion was wrong; the code was always right.

Two things kept it invisible, and both are fixed here:
1. **A text slice cannot state its own dependencies.** Now brace-matched, like §S67's and §S69's gates.
2. **The file lived in the repo ROOT, so the suite runner never ran it** (§S66: a witness outside
   `viewer/tests/` does not exist as far as the runner is concerned). `git mv`'d into `viewer/tests/`,
   `SRC` re-pathed. A check nobody runs cannot report a false negative to anybody.

### Item 5 — the counters had no assertion, and the reason is subtle
`§RETIME_OUTLIER_AUDIT outsideOldWindow / collapsed60s / inverted` is logged on every real commit.
G-COH-2..4 test the pure `_retimeSpan` on synthetic spans, which is a **different claim** from "a real
drag, on a real schedule, through the real commit path, produced zero collapses and zero inversions."

The counters only ever count ops that ride OUTSIDE their bar's drawn window — which exist because
`§GANTT_MINI_TRIM`'s Tukey trim makes a bar narrower than the ops it summarises. So an assertion built
on hand-made bars whose windows equal their ops' span would count nothing and prove nothing.
**G-COH-9 is the red control for precisely that failure mode.**

New section drives the SHIPPED `commitGanttDrag` (sliced, not reimplemented) over a real fixture, with
bars from the REAL `GanttModel.buildTasks` so the trim is real, and reads the log line the code
itself emits:
- **G-COH-7** the audit line is emitted on every commit (a commit that stops logging it silently
  removes the only signal these counters carry).
- **G-COH-8** `collapsed60s === 0` and `inverted === 0` across a move AND a shrink. The shrink is the
  dangerous gesture: it compresses the window an outlier is remapped into.
- **G-COH-9** RED CONTROL: at least one gesture must have `outsideOldWindow > 0`.

### Measured
Node, real Duplex fixture, real model bars:
```
§W-COH_FIXTURE building=Duplex bars=19 ops=1119 opsOutsideTheirTrimmedBar=53
§W-COH_AUDIT move 20d    → outsideOldWindow=0  collapsed60s=0 inverted=0
§W-COH_AUDIT resizeR -1d → outsideOldWindow=53 collapsed60s=0 inverted=0 outlierDurMs=[1630189,1630189]
```
Live, headless, real Terminal (`scripts/probe_gantt_drag_outliers.js`, the §S7 probe that exists for
exactly this population — the biggest Superstructure task, 10950 elements):
```
MOVE+5d       §GANTT_RETIME tasks=7 rows=11674 ms=311.1
              §RETIME_OUTLIER_AUDIT outsideOldWindow=11 collapsed60s=0 inverted=0 outlierDurMs=[960000,4760000]
RESIZE-30pct  §GANTT_RETIME tasks=1 rows=10950 ms=285.5
              §RETIME_OUTLIER_AUDIT outsideOldWindow=6  collapsed60s=0 inverted=0 outlierDurMs=[1478000,4760000]
```
**The counters are clean — in node on the fixture and live on the fleet's worst outlier population.**
The §S7 edit-path defect these counters were added to catch is not occurring; that is now asserted
rather than eyeballed in a log nobody reads.

No `sw.js` bump: this PR changes only witnesses, no served runtime file.

---

## §S72 — TIME MACHINE END-TO-END AUDIT (2026-08-23). Measured, not surveyed.

Commissioned by the user: *"audit the TM end to end and give me the gap list."* Method: run every
witness that touches `time_machine.js`; count instrumentation vs gates; then drive the real viewer
headless through every reachable TM control and read what it emits. **One P1 was found and fixed in
the same session (bim-ootb #1482, below).**

### Scale
`time_machine.js` = **8834 lines, 154 named functions, 344 `§` tags**. Zero TODO/FIXME/HACK markers.

### 1. Gate coverage — 37 witnesses touch TM, 36 PASS, 1 RED
`witness_gantt_lock_integrity` is RED **on `origin/main`**, and the cause is a stale slice, not a
regression: it calls `sliceFn(tmSrc, '_midairAudit')`, but §S58 MOVED that function to
`support_sweep.js`. The only occurrence left in `time_machine.js:4154` is inside a comment —
``gates on `function _midairAudit(` being present in this file`` — so the slice returns comment text
and `vm` throws `SyntaxError: Unexpected template string`. Same family as G-COH-6: **a slice that
cannot state its own dependencies.** Fix is to slice from `support_sweep.js`. Not done here.

### 2. Instrumentation is far ahead of the gates
| measure | covered | total | not referenced by any test/probe |
|---|---|---|---|
| `§` tags in `time_machine.js` | 128 | 344 | **216** |
| named functions | 53 | 154 | **101** |

Of the 216 uncovered tags, **25 encode a refusal, guard or failure** — behaviour, not diagnostics:
`§GANTT_EDIT_CYCLE_BLOCKED`, `§GANTT_PROPS_REJECT`, `§GANTT_LINK_REJECT`, `§GANTT_EDIT_UNDO_REJECT`,
`§GANTT_SET_BASELINE_REJECT`, `§SE_CPM_BAIL`, `§GANTT_SCHEDULE_STALE_REGEN*`, `§TM_TWIN_MISS`,
`§GANTT_AUTHOR_ENTRY_FAIL`, `§LOAD_FAIL`, `§MAXQ_TIME_ABORT`, `§GANTT_SHIFT_HOURS_DESYNC`, … These are
the lines that say the software refused something; nothing checks that it still refuses.
(Reference-by-tag is a proxy — a few are covered by structural assertions instead, e.g.
`§GANTT_CPM_ANNOTATE_SKIP` is gated through `_ganttCritical = {}` in W-CPM-1g.)

### 3. Live end-to-end: 32 steps on Duplex, real viewer, **0 page errors**
Working, with `§` evidence: activate · Gantt drawer + `§GANTT_CPM_ANNOTATE` · transport play/step/
jump-end · `__tmSetCursor` · **drag move** · **drag resize** · **undo** · **ruler shift** ·
**set baseline** · **edit-lock both ways** (`§GANTT_LOCK_BASELINE` / `§GANTT_LOCK_VERIFY`) ·
**§TM_BAKE_LOCK refusal on BOTH drag and ruler shift** (§S69 confirmed live, not just in source) ·
dashboard · what-if · X-ray · sun · LOD · `tmJumpToPhase` · `tmRefoldSchedule` · close ·
**persistence round trip SURVIVED** (2026-09-07 held across a real reload, §S70 confirmed live).

Then, driven correctly (see the probe-error note below): **E7 typed properties open + apply**,
**E4 unlink**, **E3 link** — all three fire their verbs and persist.

Silent but correct: the variance drawer emits nothing on Duplex because Duplex is not a folded ERP
project — `§TM_TWIN_MISS` fires at activation and the ⚖ button is deliberately hidden (`§TM_VAR_GATE
twin=no ⚖=hidden`). Not a defect.

**Two "findings" were discarded as PROBE ARTEFACTS before reporting**, and are recorded so nobody
re-raises them: (a) `TypeError: ...reading 'RoundingMode'` ×5 per load in `proj_fold/vo_fold/
proj_control/whatif/proj_claim` — caused by serving `viewer/` without its sibling `erp/`, so
`../erp/bigdecimal.js` 404'd; with a correct serve root the page throws **zero** errors. (b)
`§TM_TWIN_ERR/§TM_SHOPFLOOR_ERR Failed to fetch ../erp/ad_seed.db: 404` — same cause; the file exists
(27MB). **Lesson: a headless probe must serve the whole repo root, not just `viewer/` + `buildings/`.**

### 4. 🔴 THE P1 THIS AUDIT FOUND — E7 wrote 1970 dates (FIXED, #1482)
`openGanttProps` populated its Start/Finish inputs from `d(bar.startTs)`/`d(bar.endTs)` — the TM's own
near-1970 playback clock — and passed whatever was typed straight to `moveTaskCascade`. §S22 fixed
exactly this for `commitGanttDrag`; E7 was never brought along. Measured live, before:
```
§GANTT_PROPS_OPEN task=TASK_Substructure_T_FDN     → Start input showed 1970-01-01
§GANTT_EDIT_MOVE  start=1970-01-05 clamped=false cascaded=0
§GANTT_EDIT_PERSIST what=propsApply ok=true          ← §S70 then cached the corruption
```
After: panel shows `2026-08-23`, apply writes `2026-08-27`, **`cascaded` 0 → 18** (the 1970 target was
collapsing the cascade too). The apply's move-vs-resize comparison had the same defect — `s !==
d(bar.startTs) && f === d(bar.endTs)` was always true on the start half, so a pure FINISH edit was
routed as a move. Gated by `witness_gantt_props_epoch.js` (10/10, red-proved on main at 7 fails).

**Why it survived this long:** E7 is the one edit path with no node witness and no headless hook. It
was also the path §S67 caught missing its resync and §S69 caught missing its bake-lock. Three
independent defects on the same path is a pattern, not luck — see gap 2 below.

### THE GAP LIST (ranked, all measured)
1. **E3/E4/E7 have no permanent witness.** The three paths reachable only through canvas gestures
   (link-drag, unlink button, dblclick panel) are gated only at source level. They have now produced
   three defects. A headless gesture harness — the `probe_props.js` written for this audit — should
   become a witness in `viewer/tests/`.
2. **`witness_gantt_lock_integrity` RED on main** — stale slice of a function §S58 moved out. Cheap.
3. **216 of 344 `§` tags, and 101 of 154 functions, are referenced by no test.** 25 of the uncovered
   tags are refusals. The instrumentation is excellent and the gates trail it badly.
4. **Persistence proven on Duplex (9MB) only.** Hospital is 252MB; `export()` measured at 86ms but
   the IDB write + reload round trip has never been run on a big building.
5. **`window.__tmGanttDrag` returns `true` even when `§TM_BAKE_LOCK` refuses** — a test hook that
   reports success for a refused edit can mask exactly the regression the lock exists to catch.
6. **Group shift (marquee) was never exercised live** — no hook, no DOM id, needs a drag-rectangle.
   It is the only edit verb this audit could not drive at all.
7. **`DbResolve.cacheKey` K3 keys on a LEADING `/deploy/`** so a relative `deploy/dev/buildings/X.db`
   folds onto the production cache key (§S70). Harmless today, a trap later.
8. **`time_machine.js` is 8834 lines.** §S53 extracted `gantt_model.js` (206 lines) and stopped.

### Perf, measured
Terminal drag `move+5d`: `§GANTT_RETIME tasks=7 rows=11674 ms=311`. Resize: `rows=10950 ms=285`.
Whole-db `export()` for persistence: Duplex 3ms · Terminal 10ms · Clinic 47ms · JKR 70ms ·
**Hospital (252MB) 86ms**. Nothing here is a bottleneck at fleet scale.

---

## §S73 — the four canvas gestures are gated; the lock breach now names what broke (2026-08-23)

User: *"AFAIR, editing Gantt Chart allows mouse selects multi bars to move them enbloc. If this is not
conflicting, proceed."* Correct on both counts — the feature exists and it does not conflict. Closes
§S72 gap 1 (no witness on the gesture paths), gap 2 (`witness_gantt_lock_integrity` RED) and gap 5
(the drag hook reported success for refused edits). bim-ootb **#1484**, `CACHE_VERSION` **v1075**.

### Marquee → en-bloc move, measured live
```
§GANTT_GROUP_SELECT count=5
§GANTT_GROUP_SHIFT_COMMIT tasks=5 deltaDays=2
§GANTT_EDIT_PERSIST what=groupShift url=/buildings/Duplex_extracted.db ok=true
```

### The precedence, stated because it looks like a conflict and is not
A `pointerdown` on a bar that belongs to a multi-selection starts a **group drag**, and that branch is
checked BEFORE the single-bar/link branch (`time_machine.js` ~:6581). While a selection is live the
bar→bar **link** gesture is therefore shadowed by design — which is exactly what a user wants ("I
selected five bars, dragging one moves five"), and it is why the first run of the new probe failed
G7: it tried to link while five bars were still selected. A near-zero marquee on empty canvas clears
the selection (`§GANTT_GROUP_SELECT count=0`) and the single-bar gestures come back. **W-GEST-2
asserts the ordering by source index** so a refactor cannot invert it silently.

### Gates added — the cheap half and the honest half
- `viewer/tests/witness_gantt_gesture_wiring.js` — 15 checks, milliseconds, always runs: each gesture
  is bound and reaches its verb; the precedence ordering; the link gesture's ≥14px vertical-travel
  rule; the locked-gantt refusal; and **every gesture verb carries all four calls this lane added by
  hand** (bake lock, resync, CPM re-annotate, persist).
- `scripts/probe_gantt_gestures.js` — 13 checks, real browser, real pointer events: marquee →
  en-bloc → dblclick → Apply → unlink → clear → link, each read back from its own `§` line.
  **13/13, zero page errors.** Header records the §S72 lesson: `SERVE_ROOT` must be the repo root.

### 🔴 `witness_gantt_lock_integrity` — RED on main, and it was three bugs deep
1. **The slicer.** `sliceFn` used a plain `indexOf`, so `` `function _midairAudit(` `` matched a
   COMMENT at `:4154` — one describing this very check — and the slice returned prose. `vm` threw
   `SyntaxError: Unexpected template string`. Line-anchored now; the sandbox is handed the real
   `SupportSweep` module the surviving one-line wrappers delegate to.
2. **The append.** With the witness finally running, the bug §S20 Part B had named and deliberately
   left red appeared: `verifyGanttIntegrity` built its sample from `auditFloating`'s collector and
   appended midair offenders only `if (guids.length < 20)`.
3. **The cap underneath it.** `SupportSweep._midairAudit` capped its OWN list at 20 **in scan order**.
   With 173 midair elements the dragged element was never in it at all — measured `brokeGuid
   inAll=false, allGuids=84`. So even fixing (2) could not have worked.

Fixed at the layer that owns the data: the audit reports every offender (`allGuids=237`), and
`verifyGanttIntegrity` ranks offenders **absent from the lock baseline** ahead of known ones before
capping at 20 — so what the planner just broke leads the list instead of being buried under a tail
they never touched. `captureLockBaseline` now remembers the offender SET, not just the counts.
**G-LI-2e passes on its original assertion, 20/20, weakened nowhere.**

**The operator-facing point:** before this, a refused lock said *"your edit broke physics"* and then
listed twenty elements the planner had not touched. That is worse than no list.

### The drag test hook was lying
`window.__tmGanttDrag` returned `true` for a REFUSED edit — including a `§TM_BAKE_LOCK` refusal — so a
probe watching it would report a mid-bake edit as successful, exactly the regression the lock exists
to catch. `commitGanttDrag` now returns `true` only on commit; the hook reports that, and
`'notFound'` stays distinguishable from a refusal.

### §S72 gap list after this session
✅ 1 gesture witnesses · ✅ 2 lock_integrity red · ✅ 5 dishonest hook · ✅ 6 marquee unexercised.
Still open: **3** (216/344 `§` tags, 101/154 functions ungated — the big one), **4** (persistence
proven on Duplex only, Hospital 252MB round trip unrun), **7** (`cacheKey` K3 leading slash),
**8** (`time_machine.js` at 8834 lines).

---

## §S74 — "I am not aware of any visual cue showing CPM." They were right. (2026-08-23)

The user could not see the critical-path cue. It was not discoverability: **the rail was being painted
over.** bim-ootb **#1486**, `CACHE_VERSION` **v1076**.

### How the cue is supposed to work (the answer to the question as asked)
1. **The rail.** Every Gantt bar carries a 2px rail on its bottom edge: **red `#e53935` = zero float
   (on the critical path)**, **green `#26a69a` = has slack**. Both colours on purpose — fleet
   criticality runs 27–82% of tasks, so at the top of that range a red-only rail marks four bars in
   five and the SCARCE thing (what can move) is what needs to stand out.
2. **The typed panel.** Double-click any bar → `CRITICAL PATH · zero float` or `Total float Nd`, with
   `(CPM, dates unchanged)` next to it.
3. **The log line**, on open and after every edit:
   `§GANTT_CPM_ANNOTATE schedule=SCH_AUTHORED tasks=19 critical=11 (58%) projectDuration=13d float=0..3 datesWritten=0 (fixedDates)`
4. **When it recomputes:** once per building when the drawer opens, then after every drag, resize,
   ruler shift, group move, undo, link, unlink and typed apply.

### What was actually wrong, measured in pixels
§S68 drew the rail immediately after the bar fill — **before** the three stroke frames. The yellow
captured-schedule frame is a 1px `strokeRect` around the whole bar, so it painted over the rail's
bottom row. Read back off the LIVE site's canvas, 19 bars on Duplex:
```
railVisibleAt row h-2 = 15    railVisibleAt row h-1 = 0    yellowFrame at h-1 = 17/19
```
A 2px cue rendering as 1px, and that 1px often an anti-aliased blend of rail colour and phase fill
(`#ea5a36` where `#e53935` was intended). CPM was running correctly the entire time.

After moving the rail to draw last: `h-2 = 18, h-1 = 18, yellowFrame at h-1 = 0`, colour exact.
**W-CPM-6 gates the ORDER by source index** so it cannot silently go quiet again.

### The lesson this pays for
Every §S68 gate asked *"is the value computed, and does the code that paints it exist?"* — all green,
all true, and the user still saw nothing. **A drawing order bug is invisible to a source gate.** The
check that found it reads the canvas back as numbers (`getImageData` at computed bar coordinates and
compares hex) — still no screenshot, still programmatically assertable, but measuring the OUTPUT
rather than the intent. Any future "the cue doesn't show" question should start there.

### Deploy note found on the way
`erp/version.json` (the System Monitor Release row) stamps `build` from **`erp/sw.js`**'s
`CACHE_VERSION` — currently `v766` — while the viewer ships `viewer/sw.js` at `v1076`. Two separate
service workers, one provenance field. Reading that row as "which viewer build am I on" gives the
wrong answer. Not touched here; named so it is not re-discovered as a mystery.

### Offered, NOT built — the user's call
A legend in the Gantt drawer's lock bar (`▬ critical 11 · ▬ float 8`, live counts from the same
annotate pass) would make the colours self-explaining instead of requiring this document. That is new
UI rather than a repair, so it waits for a go.

---


## §S75 — §GANTT_CPM_LEGEND: the key for the float rail (2026-08-23, bim-ootb #1491)

§S74 offered a legend and left it for the user's call. They said go. `CACHE_VERSION` **v1077**.

**What shipped:** the Gantt drawer's lock bar carries `▬ 11 critical · ▬ 8 with float`, swatches drawn
as thin bars — the same SHAPE as the rail — so the mapping reads without a caption. Tooltip carries
the sentence: red = zero total float (cannot slip without moving the project end), green = has slack,
plus project duration and float range, plus the standing fact that CPM reads the dates the drag
produced and never changes one.

**A legend has exactly two failure modes, and neither is closed by being careful:**
1. **Drift** — the key explains a colour the bars stopped using. Killed by making the palette two
   named constants (`CPM_COLOR_CRITICAL`/`CPM_COLOR_FLOAT`) that the canvas rail AND the swatches both
   read. **W-CPM-7c asserts the legend contains no hex literal of its own.**
2. **Disagreement** — the counts come from a second computation and diverge from the bars. Killed by
   feeding the legend from the SAME annotate pass that paints them (W-CPM-7d), never a recount.

Every `§GANTT_CPM_ANNOTATE_SKIP` path empties the strip (W-CPM-7f: 4 clears for 4 skip paths), and so
does building deactivate. **A legend still showing the last building's counts after a cycle bail
reports a critical path that was never computed — strictly worse than no legend.**

**Verified live against all three surfaces at once, headless, numbers only:**
```
§GANTT_CPM_ANNOTATE tasks=19 critical=11 (58%) projectDuration=13d float=0..3
LEGEND text "11 critical·8 with float"  swatches rgb(229,57,53) / rgb(38,166,154)
LEGEND-vs-LOG  critical 11/11  float 8/8  → MATCH
rail pixels: both rows on 18 of 19 bars, yellow frame over none
```
The key, the log and the painted pixels agree on the same numbers and the same two colours. W-CPM
21 → 27 checks.

---

# 🗺 DEBUG MAP — read this FIRST when anything in the Time Machine edit path misbehaves

Written 2026-08-24 after §S67–§S78 (eleven sections, nine merged PRs, five real defects). Every one of
those defects was a *missing or misordered step in a pipeline nobody had written down in one place*.
This is that place. **If a Gantt edit does the wrong thing, walk this list in order before forming a
theory.**

## 1. The edit pipeline — one gesture, seven obligatory steps
Any of the 8 edit entry points (drag, resize, ruler shift, group shift, undo, link, unlink, typed
apply) must do ALL of this, in this order. Each step below was a separate shipped bug at some point:

| # | step | function | if missing you see | §  |
|---|---|---|---|---|
| 1 | refuse if the film is recording | `_tmEditLocked(verb)` | a bake desyncs mid-record | §S69 |
| 2 | run the engine verb | `SA.moveTaskCascade` / `shiftSchedule` / `shiftTasks` / `addDependency` … | — | — |
| 3 | re-time the elements | `retimeTaskElements` | bars move, model does not | §S67 |
| 4 | resync the canvas | `_tmResyncAfterRetime()` | **the canvas plays the OLD times** | §S67 |
| 5 | re-derive float/critical | `_tmAnnotateCpm(schedId)` | stale critical path painted | §S68 |
| 6 | persist | `_tmPersistEdit(what)` | the edit dies on reload | §S70 |
| 7 | repaint | `invalidateGanttModel(); computeDays(); drawGanttMini(); renderAtTime(_cursor)` | — | — |

`witness_gantt_gesture_wiring.js` (W-GEST-3) asserts steps 1/4/5/6 exist in all four gesture verbs;
`witness_gantt_retime_resync_wiring.js`, `witness_gantt_cpm_annotate.js` (W-CPM-1) and
`witness_gantt_edit_persist.js` (W-PERS-1) each own one step across every path. **A new edit path that
skips one of these will be caught by those gates — that is why they are derived, not hand-listed.**

## 2. The four recurring bug classes on this lane
Four traps produced every defect §S67–§S78. When debugging, ask which one you are in:

**(a) Two clocks.** `bar.startTs`/`bar.endTs` are the TM's OWN playback clock — a kernel_ops-derived
day-offset solve, **near 1970 by construction**. `tasks.schedule_start` is a real calendar date. Mixing
them writes 1970 dates into the schedule. Bit `commitGanttDrag` (§S22) and again the typed panel
(§S72, which wrote `1970-01-05` and cached it). **Rule: anything user-facing reads `tasks`, never the
bar.** Gate: `witness_gantt_props_epoch.js`.

**(b) Two keys.** The IDB slot a write lands in must equal the slot the loader reads.
- `cachedFetch` reads `DbResolve.cacheKey(url)`, not the raw url (raw = legacy fallback only) — §S70.
- **Split-mode buildings (`_meta.db` + `_geo.db`: Hospital, Clinic) load `A.db` from `metaUrl`, NOT
  from `_extracted.db`.** Persisting under `A.DB_URL` there writes a slot nothing reads — §S76/§S78.
- **The one source of truth is `A._dbPersistUrl`**, set by `streaming.js` at the exact point `A.db` is
  assigned, in BOTH branches (`:2316` split, `:2485` whole). Every persist path reads
  `app._dbPersistUrl || app.DB_URL`. Never re-derive split state anywhere else.
Gates: `witness_gantt_edit_persist.js` (W-PERS-5), `witness_db_cache_key.js`.

**(c) Draw order.** The Gantt canvas paints fill → yellow captured frame → orange cursor frame → cyan
selection frame → **CPM float rail** → label. The rail is LAST because anything drawn after it covers
it: §S74 shipped a 2px rail that rendered as 1px because the yellow 1px `strokeRect` owned its bottom
row. **A source gate cannot see this** — the fix's gate (W-CPM-6) asserts source ORDER, and the proof
reads canvas pixels back with `getImageData`. If a cue "isn't showing", check order before logic.

**(d) Text slices in witnesses.** A witness that finds code with `indexOf('function NAME(')` will
happily match a COMMENT mentioning that function, or slice a fixed byte window that the function has
since outgrown. Both happened: G-COH-6 (2200-char window vs a call at offset 5073, §S71) and
`witness_gantt_lock_integrity` (matched a comment, §S73). **Always brace-match, always line-anchor.**

## 3. Where the truth is — the § tags to grep, by surface
```
edit committed      §GANTT_EDIT_MOVE / _RESIZE / §GANTT_DRAG_COMMIT / §GANTT_PROPS_APPLY
                    §TM_RULER_SHIFT_COMMIT / §GANTT_GROUP_SHIFT_COMMIT / §GANTT_EDIT_UNDO
                    §GANTT_EDIT_LINK / §GANTT_EDIT_UNLINK
refused             §TM_BAKE_LOCK (mid-record) · §GANTT_*_REJECT · §GANTT_EDIT_CYCLE_BLOCKED
elements re-timed   §GANTT_RETIME · §RETIME_OUTLIER_AUDIT (collapsed60s/inverted must be 0)
clock translation   §S22_EPOCH_FIX / §S22_EPOCH_FIX_DETAIL
critical path       §GANTT_CPM_ANNOTATE (tasks/critical/%/projectDuration/float, datesWritten=0)
persistence         §GANTT_EDIT_PERSIST (what=, url=) then §SCHED_PERSIST (key=, size=)
reload actually hit  §CACHE_HIT <file> — CHECK THE FILENAME, split mode must show *_meta.db
lock gate           §GANTT_LOCK_BASELINE / §GANTT_LOCK_VERIFY / §GANTT_LOCK_BREACH
selection           §GANTT_GROUP_SELECT count=N   (count=0 = cleared)
WHICH MODEL ran     §TPL_MODEL model=template|legacy-deriveZones  — grep FIRST, see §5c
```

## 4. Running the probes — two traps that cost hours
- **`SERVE_ROOT` must be the REPO ROOT, not `viewer/`.** The page loads `../erp/bigdecimal.js` and
  `../erp/ad_seed.db`. Serving `viewer/` alone 404s them and manufactures five `RoundingMode`
  TypeErrors plus `§TM_TWIN_ERR`/`§TM_SHOPFLOOR_ERR` that look exactly like product defects. §S72 lost
  a cycle to this before discarding them as artefacts.
- **Chrome version.** puppeteer@22's default Chrome 127 could not create a WebGL2 context under
  `--use-angle=swiftshader` here: `§INIT_VIEWER_ERROR` cascaded into aborting sql.js, so `A.db` never
  populated and `toggleTimeMachine` took **180s** to appear — for any building, on unmodified main.
  Chrome 152 (`~/.cache/puppeteer/chrome/linux-152.0.7977.42/`) gives `A.db` ready in 1.7–4.4s. §S78.

Available probes: `scripts/probe_gantt_gestures.js` (all four canvas gestures, gates),
`scripts/probe_gantt_drag_outliers.js` (§RETIME_OUTLIER_AUDIT on Terminal), 
`scripts/probe_splitmode_persist_direct.js <Building>` (drag→persist→**real second browser**→read back;
data-level, never touches the canvas), `scripts/probe_gantt_hospital_persist.js` (the canvas version).

## 5. Product decisions already settled — do not re-litigate without the user
- **The drag does NOT run CPM, deliberately.** It runs a push-only cascade + predecessor clamp; CPM
  runs after it in `fixedDates` mode to derive float/criticality FROM those dates and never writes
  one. A true re-solve is a feature, not a bug fix (§S68). Measured: both modes agree on an unedited
  schedule across all 8 buildings; they diverge only after an edit, which is exactly why the flag
  matters. **The open product question is pull-back** (moving a task earlier does not pull successors
  earlier, so a schedule never compresses) — advised as an explicit action, not an implicit drag effect.
- **Marquee selection shadows the link gesture** (a pointerdown on a selected bar starts a group drag,
  checked first). Clicking empty canvas clears the selection. Intended; W-GEST-2 pins the ordering.
- **`setGanttBaseline` and `_materializeNativeSchedule` are exempt from the bake lock**, each for a
  stated reason (writes no timeline row / can only write a building's FIRST schedule). W-TBL-5c/5d
  assert the property that earns each exemption, not the name.
- **`buildTaskIndex`'s stale-regen does NOT persist** — it runs on a plain page load and would put a
  252MB IDB write on every ordinary visit (§S70).

## 5b. PERSISTENCE — day-1 ✅ RE-PROVEN NUMERICALLY, day-2 ✅ W-PERS BLIND SPOT CLOSED (PR #1554), day-3 ✅ THE DATA-LOSS DEFECT ROOT-CAUSED + FIXED (2026-08-27)
> ⚠ **THIS SECTION IS CITED BY LIVE CODE UNDER TWO DIFFERENT NAMES — grep BOTH `§5b` AND `§S5b`.**
> Verified 2026-08-27: `viewer/time_machine.js:6335`, `viewer/scene.js:1335`,
> `viewer/schedule_author.js:2695` and `scripts/probe_tm_persist_dataloss.js:2` say **`§5b`**;
> `viewer/tests/witness_gantt_edit_persist.js:28`/`:179` say **`§S5b`**. A grep for one misses four or
> two files. **Do not renumber this section** — six live bim-ootb files hard-cite it by name.
> 📌 **This section is the OWNER of TM edit-path persistence status.** `4D_MODEL_INTEGRITY.md` §L
> carries a one-line pointer here rather than a second, shallower account (consolidation L2,
> 2026-08-27). Day-3's fix is the PR §L records as **#1555** — this section had only the branch name
> `fix/tm-persist-idb-dataloss`; the number is carried across from §L, which lists the day's
> persistence PRs as #1552 (datum) / #1554 (witness blind spot) / #1555 (data loss).
> ⚠ **Read the day-2 addendum at the end of this section before citing the table below.** The
> Duplex row still reproduces; **the Hospital row does NOT** — `probe_splitmode_persist_direct.js
> Hospital` is RED at D6 as of 2026-08-27 (day-2 re-run). The §S78 key fix it was written to prove
> is still holding (D5 green); what fails is the round trip itself, for a newly-found and separate
> reason (a ~56MB `persistDb` reports `ok=true` and empties the store).
**The day-1 question "does a bar edit persist and round-trip?" is ANSWERED: YES, both modes.**
`scripts/probe_splitmode_persist_direct.js` (needs `PUPPETEER=/home/red1/bim-compiler/node_modules/puppeteer`
and `SERVE_ROOT=/home/red1/bim-ootb` — the DBs are gitignored, so a worktree cannot serve them):

| building | mode | `_dbPersistUrl` | write key == reload read key | `TASK_ROOT.schedule_start` before → after reload | verdict |
|---|---|---|---|---|---|
| Duplex | whole-db | `/buildings/Duplex_extracted.db` | `buildings/Duplex_extracted.db` ✅ | `2026-08-26` → **`2026-12-25`** (+121 d) | 8/0, 0 page errors |
| Hospital | **split** | `/buildings/Hospital_meta.db` | `buildings/Hospital_meta.db` ✅ | `2026-08-26` → **`2026-12-25`** (+121 d) | 8/0, 0 page errors |

`§SCHED_PERSIST` wrote 10,196 KB / 56,432 KB respectively; the reload's `§CACHE_HIT` names
`Duplex_extracted.db` / **`Hospital_meta.db`** — so §S76/§S78's split-mode key fix is holding.
**There is NO JSON file in this path.** `persistDb` (`schedule_author.js:2430`) does
`db.export().buffer` → IndexedDB store `'dbs'` under `_cacheKeyFor(url)`. `4D_template.json` is a
read-only INPUT (the declared programme) — an edit writing back into it would itself be a defect.

### ✅ FIXED 2026-08-27 (day-2, PR #1554) — W-PERS's split-mode blind spot is CLOSED
Audited against PRIMAL LAW clause 4 on day-1, **patched on day-2**. What the gap was:
- **SCOPE-BLIND, by its own header:** *"no fixtures, no DB, no browser"* and *"The round trip itself
  … is proven live by the headless probe recorded in §S70, **not here**."* It brace-matches
  `time_machine.js` source to assert the CALL to `_tmPersistEdit` exists. A call that fires and
  writes a slot nothing reads still passes. **Unchanged by design** — see "shape chosen" below.
- **VACUOUS for split mode — the case that actually broke.** W-PERS-3c drove a hand-built
  `{db, DB_URL:'buildings/Hospital_extracted.db'}` with **no `_dbPersistUrl`**, then asserted the url
  handed to `persistDb` is `DB_URL`. The file contained ZERO references to `_dbPersistUrl`, while
  shipped `_tmPersistEdit:6332` reads `app._dbPersistUrl || app.DB_URL`.
  **ROOT CAUSE (established, not guessed):** W-PERS was born in PR #1479 (§S70), when
  `_tmPersistEdit` really *did* pass `APP.DB_URL` and nothing else — 3c was CORRECT then. PR #1494
  (§S78) changed the line and **never touched the witness** (`git log --follow` on the witness lists
  only `4ee5a7d` #1479 and `a515081` #1509 — not `408d9d1` #1494). Not a schema reason, not
  deliberate: a feature PR that left its own gate behind.

**RED-PROVED, the load-bearing evidence.** Simulated the pre-§S78 line verbatim from `408d9d1^`
(`SA.persistDb(app.db, app.DB_URL, {})`) and ran BOTH witnesses against that same broken file:

| witness | verdict on the pre-§S78 bug | exit |
|---|---|---|
| OLD (`origin/main`) | `pass=14 fail=0` → **"PASS — every Gantt edit path persists"** | 0 |
| NEW (this PR) | `pass=17 fail=1` → **FAIL W-PERS-3f**, `got buildings/Hospital_extracted.db` | 1 |

Restored the fix → `pass=18 fail=0 inconclusive=0`. So the old witness was *fully green on the bug
it exists to catch*; the new one is not.

**What was added** (`viewer/tests/witness_gantt_edit_persist.js`):
- **W-PERS-3f** split mode: `persistDb` receives `APP._dbPersistUrl`, **not** `APP.DB_URL`.
- **W-PERS-3g** split mode: still `APP.db` itself under that url (3b's §KRN_PERSIST_GUARD P0, split side).
- **W-PERS-3h** legacy: a build with no `_dbPersistUrl` still falls back to `DB_URL` — the `||` is a
  live branch, not dead code, and must not lose its persist entirely.
- **W-PERS-5f RED CONTROL:** the two urls canonicalise to DIFFERENT cache keys
  (`buildings/Hospital_meta.db` vs `buildings/Hospital_extracted.db`), so 3f is a real slot
  difference rather than theatre.
- **W-PERS-3c** now sets `_dbPersistUrl = DB_URL`, the shape `streaming.js:2485` really writes.
- **The fixture is EXTRACTED, not invented (PRIME RULE).** The two `metaUrl` derivation statements
  are lifted verbatim out of `streaming.js` (`:2199`/`:2202`) and executed, yielding
  `buildings/Hospital_meta.db` — which matches the live app (`§S78_STATE
  persistUrl=/buildings/Hospital_meta.db splitHasMeta=true`). Hard-coding the string would pin the
  witness to a url shape the loader is free to stop producing.
- **NO third verdict → FIXED.** `inconc()` joins `assert()`; if the extraction ever fails,
  W-PERS-3f/3g/5f print `INCONCLUSIVE`, the summary prints
  `INCONCLUSIVE — … this is not a PASS`, and it exits **2** (distinct from both 0 and 1).
  Red-proved by renaming the derivation in `streaming.js`: `derivStmts=0` →
  `pass=15 fail=0 inconclusive=2`, exit 2.

**Shape chosen, and why (step 4 of the brief).** The witness does **not** invoke the probe. Different
runtimes — W-PERS is a pure-node source/sandbox gate that runs in ~0.2s with no browser, the probe
needs puppeteer, a static server and a 300s Hospital load. Wiring one into the other would make the
fast gate un-runnable and would put a browser in a file whose header promises none. **Division of
ownership, one verification each:** the probe owns the round trip (D6: write → IDB → reload → read
back), W-PERS owns the **routing decision** the probe can only observe on the one building it was
pointed at — *which url `_tmPersistEdit` chooses*. Both are now named in the witness header so the
next session does not re-derive the split.

### 🔴 NEW FINDING (day-2, NOT acted on — out of the assigned scope) — Hospital D6 no longer reproduces
Re-running the probe today to confirm the precondition: **Duplex still passes 8/0. Hospital does
NOT** — D0–D5 pass (the §S78 key fix is holding: `writeKey == readKeySplit ==
buildings/Hospital_meta.db`), but **D6 dies** with `no such column: schedule_start`, because the
reload re-fetched the pristine 24.4MB network `_meta.db` (`§CACHE_MISS_READ url=Hospital_meta.db`),
whose `tasks` table still has the `start_date/finish_date` shape.
**Measured mechanism** (scratchpad diagnostics, viewer's own `APP.openCacheDB()`):

| step | `dbs` store contents |
|---|---|
| on load | `buildings/Hospital_meta.db=24.4MB`, `buildings/Hospital_positions.bin=1.4MB` |
| after `persistDb` → **`ok=true`**, `§SCHED_PERSIST … size=55888KB`, **zero** `§SCHED_PERSIST_ERR` | **`[]` — EMPTY** |
| after browser restart | **`[]` — EMPTY** |

So a ~56MB persist **reports success and silently empties the entire object store**, destroying the
24.4MB entry that was already there. Quota is not the stated cause (`§QUOTA available=10253MB
used=13MB`); the profile is best-effort (`§PERSIST granted=false — cache is best-effort, browser may
evict`), which is `scene.js:509`'s already-documented failure mode. Duplex (10MB) is unaffected —
this is **size-related, not split-mode-related**, and it is NOT a §S78 regression.
### ✅ DONE 2026-08-27 — ROOT-CAUSED AND FIXED (bim-ootb PR: `fix/tm-persist-idb-dataloss`)

**It WAS eviction — but not the browser's. It was our own LRU evictor, firing on an abort it had
never read the reason for.** The day-2 note above was right that best-effort browser eviction is not
the cause, and wrong to conclude eviction as a class was ruled out. The `persistent-storage` result
was a true negative pointing at the wrong suspect.

**The measured chain** (`scripts/probe_tm_persist_dataloss.js`, an IDB mutation spy installed via
`evaluateOnNewDocument` before any app script runs — it records every `put`/`delete`/`clear`/
transaction-abort with its call site):

1. `scene.js` `cachedFetch` tries to cache **`Hospital_geo.db` = 239,702,016 bytes**. The write
   aborts. The real error — which the shipped code **never read** — is:
   `UnknownError: The serialized keys and/or value are too large (size=239702104 bytes, max=133169152 bytes)`
   i.e. **Chrome's hard ~127 MiB cap on a single IndexedDB value**. Not quota: `§QUOTA` reported
   10,264 MB available / 24 MB used at that exact moment.
2. `tx.onabort` was `function() { resolve(false); }` — **`tx.error` discarded**. So every caller
   downstream assumed "quota".
3. The retry ladder (`scene.js:1334`) therefore ran `A._evictOldest(cacheDb, 4)` — *drop the 4
   oldest entries* — for a write that **no amount of eviction could ever satisfy**. The store held
   only 2 entries, so "drop the 4 oldest" dropped **everything**, including
   `buildings/Hospital_meta.db` — the slot the Time Machine had just persisted the user's edit into.
4. Retry → aborts again (still oversized) → loop until nothing is left to delete.
5. `§CACHE_EVICT_WRITE_FAIL … quota too small even after LRU eviction` — an assertion with no
   evidence behind it, and the reason this went unexplained for two sessions.
6. Next reload: `§CACHE_MISS` → pristine `_meta.db` refetched → **the edit is gone, silently**.

`persistDb` was never at fault: it wrote correctly, under the right key, and `ok=true` was honest at
the moment it resolved. **The bytes were deleted out from under it afterwards, by a different
module, on a later load.** That is why every attempt to find the bug inside the persist path failed.

**Amplifier found in the same pass:** `persistDb` wrote the `dbs` store **only**, never
`timestamps`. So an edited slot kept whatever LRU timestamp `cachedFetch` left at first download —
making the one entry holding unsaved user work the **oldest** entry, i.e. the **first** thing the
evictor takes. Editing your schedule moved your data to the front of the deletion queue. (Measured:
after three persists the Hospital meta slot had no timestamp of its own at all.)

**The fix (3 files, surgical — no architecture change):**
- `viewer/scene.js` — `_attemptWrite` now resolves `{ok, name, err}` and `tx.onabort` **reads
  `tx.error`**. The evict-and-retry ladder runs **only for a genuine `QuotaExceededError`**
  (`§CACHE_EVICT_ONLY_ON_QUOTA`); any other abort logs `§CACHE_WRITE_UNFIXABLE … cache left INTACT`
  and deletes nothing.
- `viewer/schedule_author.js` — `persistDb` stamps `timestamps` in the **same transaction** as the
  blob (`§SCHED_PERSIST_LRU_TOUCH`), and gained a `tx.onabort` handler
  (`§SCHED_PERSIST_ERR abort …`). It had **none**: an aborted persist settled *no* promise, so
  `_tmPersistEdit`'s `.then()` never ran and a failed save logged nothing at all.
- `viewer/time_machine.js` — `_tmPersistEdit` on `ok=false` now warns `§GANTT_EDIT_PERSIST_FAIL` and
  shows the user `⚠ Could not save this edit — it will be lost on reload`. Previously silent.

**Before → after, same probe, same profile, real Hospital data:**

| | before | after |
|---|---|---|
| `DELETE` ops on the `dbs` store | **6** | **0** |
| `dbs` after persist | `[]` — **EMPTY** | `Hospital_meta.db` **54.00MB** + 2 others |
| edited slot has own LRU timestamp | ✗ (`timestamps=[ad_seed.db]`) | ✓ |
| read-back of persisted blob | n/a — nothing there | `match:true` (new date in the bytes) |
| edit after 1 reload | evicted | present |
| **edit after 2 reloads** | **`(no tasks table)`** | **`2026-12-13`** |
| probe verdict | 9 pass / **5 fail** | **14 pass / 0 fail** |

Repeated writes covered: 3 sequential persists to the same key, all three verified by read-back —
this is not a first-write-only fix.

**Regression, both buildings, `scripts/probe_splitmode_persist_direct.js`:** Duplex **8/0**
(whole-db), Hospital **8/0** (split) — Hospital's reload now logs
`§CACHE_HIT Hospital_meta.db size=55.1MB`, the edited blob. The day-2 "currently RED at D6" note is
**superseded: it is GREEN.**

⚠ **Known and deliberately NOT fixed** (out of this task's scope, named so it isn't re-discovered):
`Hospital_geo.db` (228.6MB) and any other single value over ~127 MiB **can never be cached in
Chrome**. It now fails loudly and harmlessly instead of destructively. Whether geo data should be
chunked to become cacheable is a separate perf question.
⚠ Also latent, untouched: under a *genuine* `QuotaExceededError` the evictor can still delete a slot
holding local edits. A hard "never evict a locally-edited key" guard needs a persistent marker (new
store + version bump) and was judged out of scope; the LRU-touch above makes the edited slot the
*newest* rather than the oldest, which mitigates it.

## 5c. THE CANONICAL MODEL CAN BE SWAPPED FOR THE DEAD ONE BY DELIVERY OR BY WITNESS WIRING (bim-ootb PR #1553)
> **MOVED HERE 2026-08-27 (consolidation L2) from `prompts/4D_MODEL_INTEGRITY.md` §L**, which keeps a
> pointer at the original location. Rationale: these two are **precache/delivery** and
> **witness-wiring** facts — this DEBUG MAP's subject — not model facts. The **third** hole from the
> same PR, `§TPL_MODEL model=template|legacy-deriveZones` (*which* model ran), correctly **STAYS** in
> §L; §I's OWNERSHIP TABLE carries it as a row. §L also keeps the MEASURED before/after table and its
> RED CONTROL — **deliberately not duplicated here**, read it there.

**Both holes let the canonical template model be replaced by the dead `deriveZones` model SILENTLY.**

1. **`rates/4D_template.json` was NOT in `sw.js PRECACHE_ASSETS`** while `rates/sequence_rules.json`
   — which §I calls "a MIRROR, never executed" — was. Offline/cold-SW, `_load4DTemplate()`'s fetch
   fails, `_4dTemplate` stays null, dead path runs; `_4dTemplateTried` is one-shot so **one failed
   fetch drops the canonical model for the whole session.** Precached; `CACHE_VERSION` → v1090.
2. **`witness_gantt_edit_coherence.js:189` passed no `template:`** — the flagship editor witness,
   the one CLAUDE.md names first, measured all 10 claims on the DEAD model. Now builds its fixture
   from the template; new claim **G-COH-10** asserts from the shipped `§TPL_MODEL` line that the
   canonical model is what was judged.
   ⚠ **That witness's own code comment (`viewer/tests/witness_gantt_edit_coherence.js:190`) cites
   `4D_MODEL_INTEGRITY.md` §L**, verified 2026-08-27. That pointer is NOT stale — §L keeps the trace
   and owns `§TPL_MODEL` — but the fuller account of G-COH-10 is here. **G-COH-10 was cited nowhere
   outside §L before this move**, while G-COH-2..4/6/9 of the same witness are all documented in this
   file and `WITNESS_CONTRACT_AUDIT.md`. That scatter is the leak L2 was raised to close.

**Why this belongs on the DEBUG MAP:** both are the §2(b) "two keys" failure shape one level up — the
code is right and the **delivery** or the **judge** is pointed at the wrong construct, so every
downstream number is measured against a model nobody chose. `§TPL_MODEL` is now in §3's grep list.

## 6. Known-not-done (so it isn't re-discovered as a surprise)
- **Coverage (§S72 gap 3, narrowed by §S77, still the big one):** most `§` tags and named functions in
  `time_machine.js` are referenced by no test. The refusal cluster is live-fired now; the rest is not.
- **`time_machine.js` is ~8.8k lines** (§S72 gap 8). §S53 extracted `gantt_model.js` and stopped.
- **The standalone Editor tab has no split-mode handling at all** — it always loads the extracted.db
  url and never branches to `_meta.db`. Whether it even opens a split-mode building's task data
  correctly is untested (named by §S78, deliberately out of that PR's scope).
- **`erp/version.json`'s `build` field stamps `erp/sw.js`'s CACHE_VERSION, not the viewer's.** The
  System Monitor Release row therefore does NOT tell you which viewer build you are on (§S74).

---

# ▶ RESUME HERE (2026-08-24 — LANE CLOSED. Read the 🗺 DEBUG MAP above before debugging anything here.)

**Nothing in flight. Zero unpushed. Worktrees pruned. Every witness green on `origin/main`.**

**Eleven sections, twelve merged bim-ootb PRs, five real defects found and fixed** across 2026-08-23/24.
`CACHE_VERSION` **v1077** (viewer), deployed — GH Pages auto-deploys every push to `main`.

| § | what | PR |
|---|---|---|
| S68 | drag → CPM **annotate** (float + critical path), never a re-solve | #1475 |
| S69 | §TM_BAKE_LOCK: one shared refusal, **8 of 8** edit paths (was 2) | #1477 |
| S70 | Gantt edits persist — **and the raw-url-vs-cacheKey defect under it** | #1479 |
| S71 | G-COH-6 false negative; §RETIME_OUTLIER_AUDIT counters asserted | #1480 |
| S72 | **end-to-end audit** — the gap list this lane then worked to near-zero | — |
| S72 | 🔴 P1: the typed panel wrote **1970 dates** and cached them | #1482 |
| S73 | four canvas gestures gated; **the lock breach that never named what broke** | #1484 |
| S74 | 🔴 the CPM rail was **painted over** by the captured-frame | #1486 |
| S75 | the float-rail **legend** (key, log and pixels agree) | #1491 |
| S76 | cacheKey K3 no-leading-slash closed; **split-mode persistence P0 found** | #1492 |
| S77 | gap 3 partial — the ScheduleAuthor-missing refusal cluster live-fired | #1493 |
| S78 | 🔴 **split-mode P0 closed** — Hospital/Clinic edits survive reload | #1494 |

**§S72's gap list, final:** 1 ✅ · 2 ✅ · 3 narrowed (§S77) · 4 ✅ (§S76 found the P0, §S78 closed it) ·
5 ✅ · 6 ✅ · 7 ✅ · 8 open (structural: `time_machine.js` ~8.8k lines).

**§S76/§S77/§S78 were written by a CONCURRENT session** that picked this lane's own gap list up and
worked it. Its claims were re-verified against `origin/main` here on 2026-08-24: `A._dbPersistUrl` is
set in both `streaming.js` branches (`:2316`, `:2485`), all three persist call sites read
`app._dbPersistUrl || app.DB_URL`, K3 matches `(^|/)(deploy|modeller)/`, and the full witness sweep is
green. **It did not weaken any gate this lane wrote.**

**The finding that outlives this lane — persistence was broken twice, for two different reasons:**
§S70 found every writer (`persistDb`, `kernel_ops.js`, the Editor) storing under the RAW url while
`cachedFetch` reads `DbResolve.cacheKey(url)`. §S76 then found that even with the right derivation,
**split-mode buildings load `A.db` from `_meta.db`**, so a write keyed to `_extracted.db` lands in a
slot the reload never reads — Hospital and Clinic lost every edit, silently. Both fixed; the single
source of truth is now `A._dbPersistUrl`. **If anything else in this codebase persists a db, check its
key against what the loader reads — twice now that has been the bug.**

**2026-08-23 latest: the CPM cue is visible and self-explaining.** §S74 found the rail was being
painted over by the yellow captured-frame (measured in canvas pixels on the live site, not eyeballed)
and §S75 added the legend the user then asked for — key, log line and painted pixels now agree on the
same numbers (#1486, #1491, `CACHE_VERSION` v1077).

**2026-08-23 late: §S72 END-TO-END AUDIT ran and found a P1** — the typed properties panel (E7) was
writing 1970 dates into `tasks.schedule_start` and §S70 was caching them. Fixed + gated (#1482,
`CACHE_VERSION` **v1074**). The full gap list, all measured, is in §S72 above; the top of it is that
E3/E4/E7 (link, unlink, typed panel) have no permanent witness and have now produced three defects
between them.

**Suggested next, none of it blocking:** (a) the drag→CPM feature is annotate-only by decision — if
the product ever wants a true re-solve, §S68 says what that costs; (b) `witness_gantt_lock_integrity`
is RED on main (a name-slice picking up a comment containing `` `function _midairAudit(` ``, same
class as G-COH-6) — cheap, named in §S68, not chased; (c) `DbResolve.cacheKey`'s K3 rule keys on a
LEADING `/deploy/`, so a relative dev path folds onto the production key (§S70, harmless today).

---

### Historical (2026-08-22 session end)
Three bim-ootb PRs merged that session: **#1470** (§S63 witness reds), **#1472** (§S64 audit/gate
asymmetry), **#1474** (§S67 redisplay). `CACHE_VERSION` was **v1070**.

`4D_SCHEDULE_PERFECTION.md` now carries a 🏁 §MILESTONE marking **generation + buildup SOLVED** at the
user's call, with the numbers behind it (floating 0.136%, midair 0.50%, cycles 0 on 5 of 7, suite
green=40/44). **That milestone explicitly does NOT cover editing. Editing is this file's lane now.**

## Take these in order
1. **✅ SETTLED + BUILT 2026-08-23 — ANNOTATE.** User's call: the drag keeps its push-only cascade as
   the date engine, and CPM runs after it in `fixedDates` mode to derive float/criticality FROM those
   dates. Shipped on `fix/gantt-cpm-annotate` with W-CPM 20/20 green, proven red on main, and a live
   drag measured at 58% → 16% critical / PF 13d → 20d. Full evidence in **§S68** above. A true
   drag→re-solve is NOT built and deliberately is not: annotate never writes a schedule date.
2. **✅ DONE 2026-08-23 — it was 2 of 8, not 2 of 5.** All eight timeline-mutating entry points now
   call one shared `_tmEditLocked()`, including a path nobody had listed (`buildTaskIndex`'s
   stale-schedule regen, which re-materializes the whole schedule mid-bake). W-TBL 17/17, red-proved
   on main, live-checked. Evidence in **§S69** above.
3. **✅ DONE 2026-08-23 — a gap, not intent, and it hid a bigger one.** All seven edit paths now
   persist. The live round trip then proved persistence had been broken for EVERY writer
   (`persistDb`, `kernel_ops`, the Editor) since W-DB-CACHE-KEY: they wrote the raw url, `cachedFetch`
   reads `DbResolve.cacheKey(url)` and only falls back to the raw url on a miss. Fixed in the writer,
   gated on six url shapes. Evidence in **§S70** above.
4. **✅ DONE 2026-08-23** — brace-matched (body is 6345 chars, the call sits at 5073, the old 2200
   window returned false on today's source) and `git mv`'d into `viewer/tests/` so the runner sees it.
5. **✅ DONE 2026-08-23** — G-COH-7/8/9 drive the shipped commit path over a real fixture with real
   trimmed bars and assert the live counters: `collapsed60s=0 inverted=0` with `outsideOldWindow=53`
   proving they were exercised. Confirmed live on Terminal too (11 and 6 outliers, both clean).
   Evidence in **§S71** above.

## Standing lessons this session paid for
- **Map the path before hunting the bug** (§S67 above).
- **A recap agent's claims are hypotheses until you grep them yourself.** The §S65 agent was accurate
  but ran against a 30-commit-stale checkout and said so; every load-bearing claim was re-verified on
  `origin/main` before it was written down. Two would have been wrong without that.
- **Fix the audit before the engine.** §S64's fleet floating fell 462 → 362 by changing two lines
  that no gate reads. The candidate that touched the engine (C2) made it 3× worse and was rejected on
  measurement, not taste.
- **A witness outside `viewer/tests/` does not exist** as far as the suite runner is concerned (§S66).

---

# §S76 — Gap 4 + Gap 7 from §S72's gap list, closed with one real P0 found doing it (2026-08-23)

Dispatched to extend §S70's persistence proof to Hospital (252MB, the only case §S72 flagged as never
actually run) and to check whether §S72's "harmless today, a trap later" characterization of the K3
cache-key rule was actually true. **Gap 7 was real today, not later, and cheap. Gap 4 uncovered a
genuine P0: split-mode buildings — Hospital and Clinic, confirmed in the current deploy fleet — lose
every persisted Gantt edit on reload, silently, and §S70's live proof never exercised this path
because Duplex is never split-mode.**

## Gap 7 — CLOSED. `DbResolve.cacheKey`'s K3 rule missed the no-leading-slash form.

§S70 said K3 "keys on a LEADING `/deploy/`... harmless today, a trap later." Traced the actual call
chain instead of taking that at face value: `viewer/config.js:28` sets `A.DB_URL =
_params.get('db') || ...` — the `?db=` query param reaches `cacheKey()` completely unvalidated, no
leading-slash normalization anywhere. Proved by direct call, no browser needed:

```
cacheKey('deploy/dev/buildings/Terminal_extracted.db', PROD) → 'buildings/Terminal_extracted.db'
cacheKey(PROD+'buildings/Terminal_extracted.db', PROD)       → 'buildings/Terminal_extracted.db'
COLLISION: true
```

**Reachability, precisely stated:** no KNOWN shipped tool triggers this — `viewer/dlod_bench.html`
(the one real dev-bench tool) always uses a leading slash (`/bim-compiler/deploy/dev/buildings/...`),
confirmed by reading it. But the `?db=` param is a first-class, unguarded app feature, not a hack, and
nothing stops a future tool or a hand-typed test URL from omitting the slash. Fixed the regex to match
`deploy/`/`modeller/` as a path segment with or without a leading `/`:
```js
if (/(^|\/)(deploy|modeller)\//.test(url)) return url;           // K3
```
3 new witness cases (`K3-*-noslash`) plus a direct collision-guard assertion in
`viewer/tests/witness_db_cache_key.js`. **Proven red before the fix** (17/20, reverted the regex by
hand and re-ran) **and green after** (20/20). Sibling `witness_db_404_oci_retry.js` unaffected (12/12
— same file, different function). `viewer/db_resolve.js` + `viewer/tests/witness_db_cache_key.js`,
commit `052ee5a` on `housekeeping/tm-hospital-persist-cachekey`.

## Gap 4 — NOT closed. A P0 found, named precisely, not patched — this is a design decision.

### What was run
Adapted `probe_gantt_gestures.js`'s harness (real puppeteer, `SERVE_ROOT` = repo root per §S72's
serve-root lesson) into `scripts/probe_gantt_hospital_persist.js`: load Hospital (real 252MB
`_extracted.db` + `_geo.db` + `_meta.db`, copied from the live fleet), drag a task bar, wait for
`§SCHED_PERSIST`, then **launch a genuinely separate browser instance pinned to the same
`--user-data-dir`** (a fresh `puppeteer.launch()` with no shared profile would trivially fail or
pass for the wrong reason — this was caught and fixed before the first real run), and read the
dragged task's date back from the freshly-loaded `APP.db`.

### What happened
```
H2 baseline   TASK_Substructure_Level_1  schedule_start = 2026-08-23
H3/H4 drag    §GANTT_EDIT_PERSIST what=drag url=/buildings/Hospital_extracted.db ok=true
              §SCHED_PERSIST key=buildings/Hospital_extracted.db size=60244KB
              in-memory schedule_start → 2026-11-04   (H4 PASS)
[reload, same IDB profile]
H5            §CACHE_HIT lines seen: Hospital_positions.bin, Hospital_meta.db
              — NO §CACHE_HIT for Hospital_extracted.db, ever.
H6            reloaded tasks table columns: [task_id, schedule_id, name, start_date, finish_date,
              duration_days, status]  ← NOT the schema the drag was written against
              (schedule_start doesn't exist in it)              → FAIL, the edit is gone
```

### The mechanism, traced to source, not guessed
`viewer/streaming.js` has two `A.db` assignment sites: `:2304` (split mode) and `:2475` (whole-db
mode). Split-mode detection (`:2190-2216`, §SPLIT_PAIR_REQUIRED) requires BOTH `_meta.db` and
`_geo.db` to exist before committing. **When split mode is active, `A.db` is built from `metaBuf` —
`_meta.db`'s bytes — never from `_extracted.db` at all** (`:2304`,
`A.db = new SQL.Database(new Uint8Array(metaBuf))`). `_meta.db` has its own, independently-generated
`tasks` table (`start_date`/`finish_date` shape) — an artifact of a different extraction pass, not a
view onto `_extracted.db`.

So on Hospital: the Gantt edit happens in memory against `_meta.db`'s loaded schema, persists correctly
under the CORRECT canonical key for `A.DB_URL` (`buildings/Hospital_extracted.db` — §S70's fix works
exactly as designed), and is unreachable forever after, because **the reload path's split-mode
detection re-derives `metaUrl` (`buildings/Hospital_meta.db`) and checks the cache under THAT key** —
a slot the persist never wrote to. Two correctly-functioning pieces (§S70's key derivation, split-mode
detection) compose into data loss because neither knows about the other. `time_machine.js` and
`schedule_author.js` have **zero references to split mode** — grepped, confirmed — so TimeMachine has
no way to even know it is editing a split-mode building.

**This is not the bug §S70 fixed reappearing — it is a sibling in the same bug FAMILY** (persist and
read disagreeing on the slot), found because §S70's own live proof only ever ran on Duplex, and Duplex
is never split-mode (`viewer/streaming.js` :2192-2199's own comment: "Duplex: small building, never
needed a split at all").

### Blast radius, measured against what's actually shipped
`deploy/buildings/` (the production source): `_meta.db` exists for Clinic, Duplex, Hospital,
SampleHouse, Schependomlaan, Terminal. `_geo.db` exists ONLY for **Clinic and Hospital** — the
`_geoHeadOk` requirement means only buildings with BOTH ever commit to split mode. Terminal and LTU
were investigated for exactly this class of split-pair defect before (`project_split_db_live_vs_probe_
landmine.md`, "fleet CLEAN 2026-08-17, Terminal+LTU repaired") and Terminal currently ships with no
`_geo.db` at all — consistent with that repair. **Hospital and Clinic are the two buildings in the
current fleet where every Gantt edit is silently lost on reload, right now, in production**, unless a
user never refreshes the tab after editing.

### Why this is named, not fixed here
Three real candidate fixes exist and they are an architecture choice, not a bug-fix:
1. **Make `_tmPersistEdit` split-mode-aware**: persist under `metaUrl`'s canonical key instead of
   `A.DB_URL`'s when split mode is active. Cheapest, but freezes "the edit lives in meta.db" as the
   permanent model — does the Room lens / other meta.db readers expect task-edit columns to ever
   appear there?
2. **Merge on read**: when split mode is detected, ALSO check for a persisted extracted.db-keyed blob
   and fold its task rows over meta's. More correct, more moving parts, more places to get the merge
   wrong.
3. **Refuse to edit**: `_tmEditLocked`-style refusal when `A.db` was loaded via the split path, with a
   clear status message, until (1) or (2) ships. Safest short-term (no silent loss), costs the feature
   for Hospital and Clinic users today.
None of these is a "clean bounded fix" in the sense gap 7 was — each has a real design consequence for
how split-mode and the edit engine relate going forward. Named here with full mechanism and measured
blast radius so the next session does not have to re-derive it; left for the project owner's call.

### Cost numbers, measured (not the same shape as §S70's isolated `export()` figures)
`loadMs≈5-10s` (cold, real 252MB+229MB+25MB fleet), `dragToCommitMs≈6-7s` (includes the 1200ms
debounce), **persisted blob = 60,244KB — not 252MB**, because the persisted content in split mode is
`_meta.db`-shaped (small), not the monolithic extracted.db §S70's cost table measured. `reloadMs≈4-10s`.
Full round trip (fresh load → drag → persist → fresh reload) ≈ 60-65s including two full browser
launches — the majority of it is Hospital's real network/disk fetch time, not the persist mechanism.

### Artefacts
`scripts/probe_gantt_hospital_persist.js` (new, bim-ootb) — not gated into the suite (it needs the
real 507MB Hospital fleet files locally, same constraint as any other real-fixture probe in this repo)
but left committed as the reproduction for whoever picks up the design decision above. Two full runs'
raw logs: `/tmp/hospital_persist_run1.log` (crashed cleanly on the schema mismatch, which is what led
to the diagnostic rewrite), `/tmp/hospital_persist_run2.log` (the full H0-H6 result quoted above) —
scratchpad only, not committed (per this project's DB/binary discipline, a 507MB local fixture set is
never committed either).

---

# §S77 — Gap 3 from §S72's list, partial: live-fired the ScheduleAuthor-missing refusal cluster (2026-08-23)

Dispatched (concurrently with §S76) to attack the gap §S72 called "the big one": 216 of 344 `§` tags
and 101 of 154 functions in `time_machine.js` referenced by no test, 25 of them refusal-shaped —
"nothing checks that it still refuses." This lane's own recurring bug shape (§S68 painted-over cue,
§S70 the cache-key defect, §S72's own E7 1970-dates) is a guard that LOOKS alive but has silently
stopped firing. The job: prove each refusal still fires under its real trigger, live, not by reading
the `if`. Per the brief, this does not attempt all 25 — it does the highest-value cluster properly,
plus a reachability pass on the rest, rather than 25 thin one-off checks.

## Re-deriving the 25, corrected

§S72's own count is right but two of its named 12 examples are now closed by §S73's gesture work
(`§GANTT_EDIT_CYCLE_BLOCKED`, `§GANTT_PROPS_REJECT` both now referenced by
`witness_gantt_gesture_wiring.js` / `probe_gantt_gestures.js` / `witness_gantt_props_epoch.js`).
Re-grepping today (`time_machine.js` now 8930 lines, up from 8834): **232 uncovered tags, 18 confirmed
refusal/guard-shaped by reading the call site** (not just the tag name — several near-misses discarded
on inspection: `§TM_SUN_INHERIT` is an informational state log, not a refusal; `§GANTT_SHIFT_HOURS_DESYNC`
is a code comment on a variable, never actually logged).

## Cluster A — ScheduleAuthor-missing (highest value: 6 tags share one precondition)

`commitGanttDrag`, `undoLastGanttEdit`'s sibling paths, `linkGanttBars`, `setGanttBaseline`,
`generateGanttSchedule`, and `_tmPersistEdit` all open with the same shape: `var SA = (typeof window
!== 'undefined') && window.ScheduleAuthor; if (!app || !app.db || !SA || !SA.<method>) { console.log
('§GANTT_..._REJECT reason=ScheduleAuthor_not_loaded'); return; }` — a defensive load-order guard, not
a business rule. Live-fired by nulling `window.ScheduleAuthor` mid-session (simulating a script-load
failure) and driving each real control (`scripts/probe_gantt_refusals.js`, new, bim-ootb PR **#1493**,
real puppeteer, `SERVE_ROOT`=repo root per §S72's own lesson):

```
R1 §GANTT_EDIT_UNDO_REJECT reason=nothing_to_undo        — PASS (natural state, no SA tampering needed)
R2 §GANTT_DRAG_REJECT reason=ScheduleAuthor_not_loaded   — PASS, via __tmGanttDrag hookReturned=false
R3 §GANTT_SET_BASELINE_REJECT reason=ScheduleAuthor_not_loaded — PASS, real #tm-baseline click
R5 (recovery) drag SUCCEEDS once ScheduleAuthor restored — PASS, hookReturned=true, §GANTT_RETIME fires
R6 §GANTT_EDIT_PERSIST_SKIP what=drag reason=cache_disabled   — PASS, real _cacheDisabled precondition
```

R5 matters as much as the rejects: it proves the guard is transient, not corrupting — a script that
fails to load and later recovers doesn't leave the edit engine wedged.

**R4 (`§GANTT_LINK_REJECT`) is KNOWN_UNRESOLVED, not claimed as a product defect.** The positive
control — link succeeding, `ScheduleAuthor` present, a fully isolated fresh page load, zero preceding
interactions — ALSO produced no `§GANTT_LINK`/`§GANTT_EDIT_CYCLE_BLOCKED` output, using an event
sequence byte-identical to `probe_gantt_gestures.js`'s own working G7 (confirmed by reading that file,
not guessing). Ruled out before stopping: `_tmEditLocked` (measured not busy), `ScheduleAuthor`
presence, viewport size (neither probe sets one — both default 800×600). The positive case failing
the same way as the negative case is what makes this a harness question, not a guard question — but
it was NOT resolved this session. **Next step, precisely scoped:** run the identical gesture through
a real (non-headless) Chrome with a pointer-event trace, or instrument `ganttHit`/the pointerdown
handler directly, to see whether `_drag` is even being set. Do not re-attempt by tweaking coordinates
blind — that was tried (a corrected coordinate pick matching G7 exactly still failed identically).

## Cluster B — reachability-tested against the real fleet, not synthesized

- **`§SE_CPM_BAIL`** (computeCpm's dependency-cycle bail) — hypothesized reachable via the 2 fleet
  buildings §MILESTONE names as still carrying cycles (JKR, LTU_AHouse, per `§SUPPORT_CYCLE` in
  `4D_SCHEDULE_PERFECTION.md`). **Tested directly: JKR's Gantt drawer opens clean —
  `§GANTT_CPM_ANNOTATE tasks=67 critical=31 (46%) ... datesWritten=0`, no BAIL.** The hypothesis was
  wrong, not the test: `§SUPPORT_CYCLE` is the element support-DAG (physics, generation/buildup lane);
  `computeCpm`'s cycle check is the TASK dependency graph (FS/SS links this lane's authoring creates) —
  two different graphs that happen to share the word "cycle." No fleet building is currently known to
  carry a task-dependency cycle; `§SE_CPM_BAIL` may be unreachable on any building today without an
  artificial cyclic `linkGanttBars` call — which needs R4 resolved first to construct reliably.
- **`§TM_TWIN_MISS`** — already live-verified by §S72 itself ("fires at activation... Not a defect").
  No re-test needed.
- **`§CLASS_UNMATCHED`** — zero occurrences across every probe run this session (Duplex, JKR) — the
  fleet's classification rules currently cover every element class encountered. Consistent with
  "working, just never exercised by a hostile input" rather than broken.
- **`§GANTT_SCHEDULE_STALE_REGEN`** family (3 tags) — trigger is `sched.genVersion !== _GANTT_CACHE_VERSION`
  (the schedule-generation code changed since this schedule was last materialized) AND `sched.safeToRegen`.
  Real self-heal mechanism, correctly guarded against clobbering captured/baselined schedules. Not
  live-fired: needs a fixture DB with a deliberately stale `genVersion` stamped into its `schedules`
  row — a 10-minute follow-up, not attempted here.
- **`§GANTT_STALE_CACHE`** — trigger is a cached Gantt-places entry surviving a DB swap that no longer
  has a schedule. Needs a seeded stale IDB cache entry to reach; not attempted here.
- **`§CPE_BUILDUP_SOURCE`** (3 reject reasons), **`§MAXQ_TIME_ABORT`** (3 reject reasons),
  **`§GHOST_GROUND_TRIGGER_FAIL`** — all read and understood (Cinema Path Editor buildup-source and
  MaxQ orbit preconditions, a defensive SQL-exec catch respectively) but out of THIS lane's core
  edit-path scope (they're CPE/MaxQ features that happen to live in the same file) and not live-fired.
- **`§GANTT_AUTHOR_ENTRY_FAIL`**'s second variant (`reason=materialize_failed`, both `materializeZones`
  AND `materializeDefault` failing) and **`§TM_DURATION_SYNC_FALLBACK`** — real branches, but Duplex
  (and every fleet building tested) already carries a materialized/authored schedule, so the natural
  "generate from scratch" path isn't reachable without first deleting the existing schedule from a
  fixture DB. Not attempted here.

## What this leaves for the next session, in the order named above
1. Resolve R4's harness question (real-browser trace) — the one item that could still be hiding a
   real product gap behind a probe artefact, per §S72's own "rule out your own harness" discipline.
2. `§GANTT_SCHEDULE_STALE_REGEN` and `§GANTT_STALE_CACHE` — both need one seeded fixture DB each, cheap
   once someone sits down to build the seed.
3. Everything in Cluster B's CPE/MaxQ rows — same treatment as this session gave Cluster A, if that
   surface area is ever prioritized; not urgent, no defect found or suspected.

**Gap 3 status after this session:** not closed (25 tags was never going to close in one pass), but
narrowed with real evidence — 5 confirmed live, 1 honestly flagged unresolved, 2 hypotheses tested and
one corrected (SE_CPM_BAIL), the rest triaged with a named, cheap next step instead of left as an
undifferentiated pile of 216.

---

# §S78 — Gap 4's P0 CLOSED: split-mode Gantt edits now persist under the key the reload actually reads (2026-08-23)

§S76 found and named, but deliberately did not fix, a P0: Hospital and Clinic (the fleet's two
split-mode buildings — both ship `_meta.db` + `_geo.db`) silently lost every persisted Gantt edit on
reload, because the edit-persist path wrote under `A.DB_URL`'s key (the extracted.db) while `A.db`'s
actual content — and therefore what the reload reads back — comes from `_meta.db`. Three candidate
fixes were named; the project owner picked **option 1: make the persist path resolve to the same key
the loader reads, symmetric with §S70's original fix for the non-split case.** Rejected: option 2
(merge-on-read — a second synchronization point for no benefit once the root asymmetry is fixed) and
option 3 (refuse-to-edit — a feature regression for 2 of 7 fleet buildings).

## The fix — one source of truth, not a second independent check

`viewer/streaming.js` now sets `A._dbPersistUrl` at the EXACT point `A.db` is assigned, in both
branches: `metaUrl` in the split-mode branch (~:2304, where `A.db` is built from `metaBuf`), `A.DB_URL`
itself in the whole-db branch (~:2481). Nothing re-derives split state independently — every persist
call site now reads this one field instead of guessing. Both branches set it explicitly (not left
unset in one) so a hypothetical re-entry can never see a stale value from a prior building.

Three persist call sites updated to use `app._dbPersistUrl || app.DB_URL` instead of a bare
`app.DB_URL`:
- `viewer/time_machine.js` `_tmPersistEdit` (all 8 Gantt edit paths route through this one function —
  §S69 already consolidated them, so one call-site fix covers drag/resize/undo/ruler-shift/
  groupShift/link/unlink/propsApply).
- `viewer/kernel_ops.js` `_persistToIdb` — the general kernel-op persistence path, same `APP.db`
  object, same latent bug (found while fixing the Gantt path — §S70 originally touched this file
  alongside `persistDb`/the Editor, so leaving it unfixed here would have reintroduced exactly the
  asymmetry this fix exists to close).

**Deliberately NOT touched:** `viewer/schedule_editor_ui.js` (the standalone Editor tab). It loads its
`db` directly from whatever url it's launched with (`resolveDbUrl()` → `?db=<APP.DB_URL>`, always the
extracted.db url) and has **no split-mode detection of its own** — it never branches to a meta.db load
at all. Whether the Editor even correctly opens a split-mode building's task data today is a genuinely
separate, unverified question this session did not test — named here so it isn't silently assumed
fixed by this PR.

## Proof — three buildings, direct data-level, real browser, real reload

The obvious plan — reuse `scripts/probe_gantt_hospital_persist.js` (§S76's own drag→persist→reload
harness) — hit a wall: on THIS machine, `window.toggleTimeMachine` took **180327–180446ms to become
defined** across three separate runs (before AND after this fix, and on unmodified `origin/main` —
confirmed via `git stash`), and the Gantt drawer never got a single bar even after 120s of extra
polling. Root cause, found by process of elimination (not guessed): Chrome 127.0.6533.88 (the version
`puppeteer@22` pins by default) could not create a WebGL2 context under `--use-angle=swiftshader` in
this environment (`Could not create a WebGL2 context... Failed to create a WebGL2 context`), which
threw `§INIT_VIEWER_ERROR` and cascaded into aborting the sql.js library load itself
(`lib/sql-wasm.js net::ERR_ABORTED`) — so `A.db` never populated, for ANY building, regardless of this
fix. Switching to Chrome 152.0.7977.42 (already cached on this machine at
`~/.cache/puppeteer/chrome/linux-152.0.7977.42/`) fixed it: `window.APP.db` ready in **1.7–4.4s**,
matching §S76's original "loadMs≈5-10s" figures. Environment artefact, not a product or fix defect —
recorded here so the next session doesn't re-spend the time diagnosing it.

Given that, and since the actual claim under test is about DATA (which IDB slot gets read/written),
not rendering, a new probe (`scripts/probe_splitmode_persist_direct.js <Building>`) proves it without
ever touching the Gantt canvas: wait for `window.APP.db`, call `window.toggleTimeMachine()` once to
materialize the `tasks` table (schema-agnostic — split-mode's `meta.db`-sourced table starts as
`start_date`/`finish_date` before `activate()` normalizes it, per §S76's own observation), then mutate
`schedule_start` via direct SQL, `persistDb`, and check the ACTUAL cache key math
(`DbResolve.cacheKey`) matches what the reload will look up — before ever closing the browser. Then a
real second browser instance, same profile, confirms the edit reads back.

```
Hospital (252MB, split):  dataReadyMs=4051  activateMs=6398  isSplit=true
  D5 write=buildings/Hospital_meta.db expectedRead=buildings/Hospital_meta.db  MATCH
  §CACHE_HIT Hospital_meta.db size=53.9MB (reload)
  D6 THE ROUND TRIP — expected=2026-12-25 got=2026-12-25            PASS   8/8

Clinic (130MB, split):    dataReadyMs=3041  activateMs=1404  isSplit=true
  D5 write=buildings/Clinic_meta.db expectedRead=buildings/Clinic_meta.db      MATCH
  §CACHE_HIT Clinic_meta.db size=15.1MB (reload)
  D6 THE ROUND TRIP — expected=2026-12-25 got=2026-12-25            PASS   8/8

Duplex (9MB, whole-db — §S70 non-regression check): dataReadyMs=1680  isSplit=false
  D5 write=buildings/Duplex_extracted.db expectedRead=buildings/Duplex_extracted.db  MATCH
  §CACHE_HIT Duplex_extracted.db size=9.9MB (reload)
  D6 THE ROUND TRIP — expected=2026-12-25 got=2026-12-25            PASS   8/8
```

All three: 8/8, zero fails, real fleet DBs, real fresh-browser reload each time. Hospital and Clinic
were the two buildings §S76 measured losing every edit; both now survive. Duplex confirms §S70's
original (non-split) fix path is untouched by this change — same `_dbPersistUrl` field, just set to
`A.DB_URL` verbatim in that branch.

## Secondary fix, found while building the proof harness

`scripts/probe_gantt_hospital_persist.js`'s own H5 check asserted a cache hit on `Hospital_extracted`
specifically — which was never the right expectation (split mode bypasses extracted.db entirely, by
design, for both A.db and the reload lookup). Corrected to assert a hit on `Hospital_meta` instead —
the actual invariant that matters (a miss there means H6 passing wouldn't even be testing what it
claims to). The probe still can't complete a live run on this machine (the WebGL/Chrome-version issue
above), so this fix is unverified end-to-end here, but the assertion itself is correct per the fix's
own mechanism and left corrected for whenever the harness runs clean.

## Artefacts
- `scripts/probe_splitmode_persist_direct.js` (new) — the working proof, data-level, all 3 buildings.
- `scripts/_fast_static_server.js` (new) — a concurrent Node static server; `python3 -m http.server`
  was ruled out as a cause during diagnosis (it ignores Range headers, returning full 200s instead of
  206s — wasteful but not the actual blocker, confirmed by testing with both servers) but the fast
  server is a strict improvement for any future large-DB probe in this lane, so kept.
- `scripts/probe_gantt_hospital_persist.js` — H5 assertion corrected (see above), untouched otherwise.
- `viewer/sw.js` `CACHE_VERSION` v1078 → v1079 (streaming.js/time_machine.js/kernel_ops.js all changed).

**§S72's gap list, final status:** gap 1 ✅ (§S73), gap 2 ✅ (§S73), gap 3 narrowed not closed (§S77),
**gap 4 ✅ (this section)**, gap 5 ✅ (§S73), gap 6 ✅ (§S73), gap 7 ✅ (§S76), gap 8 open (structural,
not a witness gap — `time_machine.js` at 8834 lines, tracked separately in
`prompts/SCRIPT_LENGTH_REFACTOR_SEAMS.md`).

---

## §FUTURE — queued by user 2026-08-27, NOT started, for a future revisit

Four items raised after live review of a working Hospital run. Named here so they aren't lost — none
investigated or fixed yet, don't assume any of these are closed by today's other work.

1. **Late midair elements.** Today's own logs already carry a live count worth starting from, not
   re-deriving: `§CROSSTASK_JUDGE_PARITY` reports `floating=30/63415` (Hospital) and `floating=44/6880`
   (HHS) even after judge-rule repair. User wants these chased further — check whether this residual is
   a measurement artefact (§4D_MODEL_INTEGRITY.md's rescale/election findings) or genuine remaining
   support gaps.
2. **⛔ PROMOTED — NEXT TASK (user, 2026-08-27): elements must build up as sequential effort
   animation, not one-shot sudden appearance.** Right now every element inside a task appears to
   arrive crammed at the start of its bar instead of being revealed progressively across the bar's
   full declared duration — the animation reads as "the whole task springs into existence," not "the
   crew is working through it."

   **Where to start, from evidence already in hand — don't re-derive.** `schedule_author.js`'s
   `_writeTemplateSchedule` already emits `§TPL_MOVIE_BINDS_BARS remapped=N/N
   degenerateTasksSpreadEvenly=0` on every real building measured today (Hospital 63415/63415,
   HHS 6880/6880) — the counter name itself says the codebase already HAS a "spread evenly" concept,
   for a "degenerate tasks" special case, and it is firing **zero** times on real data. That is the
   first thing to read: find `degenerateTasksSpreadEvenly` in `schedule_author.js`, understand what
   condition makes a task "degenerate" versus normal, and why normal (non-degenerate) tasks — the
   entire real population — don't get any spreading logic at all. The per-element reveal-time
   assignment for the NORMAL case is the actual target of this fix; find it via
   `§TPL_MOVIE_BINDS_BARS`'s own call site, not by guessing a new mechanism.

   **What "fixed" looks like, stated as a witness claim before any code changes (Spec-First,
   CLAUDE.md):** for a task spanning declared duration `D` with `n` elements, each element's reveal
   timestamp inside that task should be distributed across `[task_start, task_start+D]` in a way that
   reads as sequential effort — evenly spread at minimum; ideally weighted by each element's own
   `duration_rule`/`installSecs` (a big element takes visibly longer to "install" than a small one,
   consistent with `§HEAVY_MEMBER_SPEED_LIMIT`'s existing real-size scaling for the trade-level rate).
   Measure the CURRENT distribution first (histogram of reveal-time-within-task-window across a real
   building's elements) as the red/before number, then measure the same histogram after the fix as
   the green/after number — this is the numeric proof, not a visual "looks smoother."

   **Item 3 folds into this, per the user's own hypothesis — check it as one task, not two.**
   "Resource/task effort timing seems too fast" may simply be the perceptual effect of item 2 (if
   every element appears in the first instant of a multi-day bar, the whole task visually reads as
   "done" almost immediately, even though the bar's declared duration and `§HR_COST`/`§CREW_DEMAND`
   numbers are correct). Verify this directly: after item 2's fix, re-observe whether the "too fast"
   perception persists. Only chase it as a separate defect if it does.

   **Boundaries for whoever picks this up:** this is a MOVIE/display-authoring change
   (`§ZONE_DISPLAY_AUTHORING`/`§TPL_MOVIE_BINDS_BARS` territory per §B's PROJECT layer) — it must not
   change the underlying task windows, dates, crew capacity, or cost numbers, only how elements are
   revealed *within* an already-correct bar. Do not touch `bar_model.js` (hook-blocked, unrelated).

   **2026-08-27 — RED/before measurement done (bim-ootb PR #1558, merged). Two findings, one
   correction, one open question — do not restart from "find `degenerateTasksSpreadEvenly`" above,
   that description is now stale.**

   - **Correction: the "where to start" text above describes CODE THAT NO LONGER EXISTS.** Read
     `schedule_author.js` `remapSolveToTasks` (bim-ootb `origin/main` @ `e63fa5d`, current as of
     today) directly — `§TPL_LAYER_ORDER` (2026-08-26, already merged) replaced the old two-branch
     structure ("even spread only if degenerate, affine only if not") with ONE rule for every task:
     members are bucketed into support-order layers, each layer gets a contiguous band of the
     window sized by its member count, and *within* a band elements are either affine-mapped
     (`gspan>0`) or evenly spread (`gspan<=0`) — degenerate or not. `degenerateTasksSpreadEvenly`
     still increments (whole-task span<=0 count) but no longer gates whether spreading happens; it
     happens for every task now. `4D_MODEL_INTEGRITY.md` §I's own ownership-table row for "where
     inside its task?" is *also* stale the same way — it says the `layerOf` 4th arg "exists only on
     unmerged `fix/tpl-layer-order`" at `6b12783`; that branch is merged into current `main`. Fix
     that row next time §I is touched. ✅ **DONE 2026-09-02 (queue item A-4 item 3)** — §I's row
     states MERGED in its own words, re-confirmed against `origin/main` @ `c8a6df61`, and is now
     cross-referenced with the "where inside its bar does it PLAY?" row PR #1605 added beneath it
     (same verb, two call sites, different arguments — the maps disagree on 99.6% of Hospital's
     elements). See also `4D_SCHEDULE_ARCHITECTURE_REDESIGN.md` §L1.
   - ⛔ **VOID — STRUCK 2026-09-02 (queue item A-0). Both bullets below measured a map nobody
     plays, in a configuration the browser never runs. Do not quote either number.** See
     §CACHE_PLAYED_LAYER §K at the end of this item for the re-measurement that replaces them.
   - ~~**Measured (Hospital, `bim-ootb scripts/probe_tpl_reveal_spread.js Hospital`, reads the cache
     — `cache_4d_run.js` extended to persist `res.tasks` so this didn't need re-deriving, PR #1558):
     `§TPL_REVEAL_SPREAD n=63182 skipped=0 decilePct=[12.8,9.7,10.0,9.7,9.4,10.4,9.0,8.8,10.0,10.3]`
     — roughly UNIFORM across all 42 tasks pooled (first-decile 1.28x uniform, "mild skew"). This
     contradicts the item's premise of bulk cramming — at the aggregate level `remapSolveToTasks`
     already spreads elements across the bar.**~~
   - ~~**But `§TPL_REVEAL_SPREAD_WORST` shows real localized cramming**, concentrated in short,
     dense tasks: `TASK_MEP_Final_Level_4` (n=499, 3-day window) had 42.7% of its elements in the
     FIRST DECILE (i.e. first ~7.2h of 3 days); `TASK_MEP_Final_Level_5` (n=564, 3 days) had 38.8%.
     Both are MEP Final phase — many small fixtures, short declared duration. This is the closest
     match to the user's "whole task springs into existence" complaint, and it is scoped to a
     specific phase shape (short window + high element count), not the general case.~~
   - **Open, unresolved caveat before either closing this or fixing it:** the measurement above ran
     `remapSolveToTasks` on the RAW `computeSchedule` output — the probe (like `cache_4d_run.js`)
     passes no `opts.displayRemap`. Every REAL UI call site (`time_machine.js:5330,6910,6952`) DOES
     pass `displayRemap: _tmDisplayRemap`, which runs the CPM two-tier remap
     (`_displayTimeline`) + a per-`(phase,storey)` Tukey-fence clamp BEFORE handing `schedule` to
     the same `remapSolveToTasks` call (`§ZONE_DISPLAY_AUTHORING`, schedule_author.js ~line 699).
     Task WINDOW bounds (`t.sDays`/`t.eDays`) come from the template regardless, so this can't
     change *that*, but it can change the per-element positions this probe measured. Tukey clamping
     only reins in tail outliers, so it probably doesn't overturn "roughly uniform" — but that is an
     assumption, not yet verified. **Next step, in this order:** (1) replicate `_tmDisplayRemap`
     faithfully (or run the real browser call site under `§`-logging) and re-run the same probe —
     confirm the MEP-Final-shape skew survives it; (2) if it does, the fix is scoped narrowly to
     short/dense tasks, not a rewrite of `remapSolveToTasks`'s general case; (3) only then re-check
     item 3's folded hypothesis ("too fast" = perceptual effect of cramming) against the *specific*
     MEP-Final-shaped tasks, since the general population already reads as spread.

   **2026-08-27, same day, user redirect: the BARS THEMSELVES are squashed — different, more
   upstream bug than reveal-distribution-within-a-bar. User pointed at `Pictures/Screenshots/4D.png`
   (live Gantt panel) + the newest `Downloads/BIM_MaxQ_Hospital_*.mp4` bake. NOT FIXED — "let me
   agree first" — this is the impact study only.**

   Root cause traced to `instantiateTemplate`'s `priceCell()` (schedule_author.js ~line 465):
   `days = ceil(bottleneck-trade-secs / (shiftSecs × max_crews))`, `min_days=1` floor. Two compounding
   effects, both verified against Hospital's persisted cache, not invented:
   1. **A real 3x unit mismatch already inside the shipped formula.** `_installSecs`'s
      `secsPerUnit = 28800/prod` is calibrated to an 8-HOUR reference shift (28800s), but `priceCell`
      divides by the ACTUAL `shiftSecs` = shiftHours(**24**, the standing "24hr is our default" ruling,
      `time_machine.js` ~line 8294, already shrank Hospital 2019.6d→369.2d) × 3600. Every task's day-
      count is computed on a clock 3x faster than the rate table's own calibration — not just the short
      ones, all 42.
   2. **`min_days=1` is a hard floor** that a naturally low-element-count (phase,level) cell hits fast.
      Measured, Hospital: 7/42 tasks land at EXACTLY 1 day (`Superstructure_L7A`, `Architecture_
      Closeup_L6`, `_L7`, `Architecture_Envelope_L7`, `MEP_Rough_in_L7`, `Finishes_L5`, `_L6`); 20/42
      are under 5 days (covering only 2821/63182 elements — the bulk of elements sit in the long,
      correctly-wide MEP Rough-in / Architecture Envelope bars, 14-64 days each). Verified NOT a
      `§TPL_ZERO_MINUTE` floor artifact (didn't fire) and NOT a fragmented-class pricing bug
      (`IfcCovering`, the Finishes-phase class, has real avg area 62.4m² on Hospital — well above the
      1.0m² fragmentation floor, so per-element pricing is the CORRECT mode for it, per
      `_classFragmentation`'s own documented rule). Against a 313-318-day total project, a 1-day task
      is 0.31% of the axis width — an unavoidable sliver no matter how correct its own math is.

   **Impact of "lengthening," each option's ripple, none applied:**
   - **Revert 24h→8h shift globally:** wrong lever — would 3x EVERY building's total days (undoing an
     already-standing user ruling), and the 7 tasks already floored at `min_days=1` mostly WON'T even
     grow (their true crewDays are under 1.0 even at 8h) — doesn't fix what it targets.
   - **Raise `min_days`:** simple, but invents a duration with no labor-content backing it — against
     PRIME RULE. Ripples: `§4D_BAND_MONOTONIC` ladder chains same-phase-next-level off `eDays`, so
     lengthening one task pushes the same phase on the level above later, compounding across 42 tasks;
     crew-capacity levelling (`fits()`) would need to re-run against the new spans; totalDays grows
     project-wide, not just for the edited task.
   - **Real-quantity basis per short phase:** check whether Finishes/MEP-Final/Architecture-Closeup
     classes are priced by raw count where a real m²/m³/lm quantity would represent them better
     (extract-driven). `IfcCovering` already checked clean (see above) — the other classes in these
     three phases are not yet checked.
   - **Rendering-only minimum bar width** (touch only the Gantt canvas draw, not the schedule dates):
     closest to the ORIGINAL item-2 boundary ("must not change task windows... only how elements are
     revealed"), but would desync the visible bar from `§TPL_MOVIE_BINDS_BARS`'s own reveal-time
     mapping — the movie would then finish an element before its visually-stretched bar ends, reopening
     the exact disagreement that tag was built to close.

   **⛔ DECISION 2026-08-27 (user) — direction chosen, dispatched, not yet built when this was
   written.** Reject the revert-24h and raise-min_days options outright (wrong lever; Prime Rule
   violation, as above — user's own words: "sounds dumb and regressing my earlier contention").
   Chosen instead, in this order:
   1. **Measure the 3x calibration mismatch's real scope FIRST** — across all 42 tasks, not just the
      7 already floored at `min_days=1`. This is the load-bearing unknown: if it meaningfully
      lengthens the other 35 tasks too, the whole 369-day project total moves, which is a materially
      bigger decision than fixing 7 short bars — STOP AND REPORT before implementing broadly if so.
   2. **If scoped as expected**, fix the calibration at its source (recalibrate the rate table's
      per-element install-time basis to the 24h shift it's actually divided by) and finish the
      real-quantity-basis check for the remaining Finishes/MEP-Final/Closeup classes — both
      extraction-based, no invented numbers.
   3. **Overlap across levels/independent trades is accepted as a natural consequence of lengthening**
      (standard for level-major/LBS scheduling) — but the existing `no-same-level-phase-overlap`
      invariant (`witness_4d_template_instantiation.js`) must still pass; this is NOT permission to
      loosen same-level ordering.
   4. **Elements reveal progressively across the corrected bar duration**, verified through the real
      `_tmDisplayRemap` path (not just the raw solve schedule the earlier probe used) — closing the
      open caveat from the RED measurement above before calling the MEP-Final skew confirmed.

   ### ⛔ STEP 1 DONE — MEASURED, AND IT TRIPPED ITS OWN STOP CONDITION (bim-ootb PR #1560)

   **Step 1's own escape clause fired: the effect is NOT confined to the 7 floored tasks, so step 2
   was NOT implemented.** Measurement only — `git diff --stat origin/main` on `viewer/` is EMPTY.
   Shipped as two probes: `scripts/probe_tpl_calibration_scope.js` (`§TPL_CALIB_SCOPE`) and
   `scripts/probe_tpl_parallel_reveal.js` (`§TPL_PARALLEL_REVEAL`). Both read the persisted
   `cache_4d_run.js` run and push it through the SHIPPED `instantiateTemplate`/`deriveBandRanks`;
   the baseline arm is asserted against the cached run's own `§AUTHOR_TPL totalDays` before any
   comparison is believed (Hospital 318 MATCH, HHS 50 MATCH), INCONCLUSIVE + exit 2 otherwise.

   - **`§TPL_CALIB_SAMELEVER` — the chosen fix and the rejected option are ONE LEVER, not two.**
     Recalibrating the numerator (`_installSecs` 28800 → 86400) and the already-rejected
     `shiftHours 24→8` revert give `tasksDiffering=0/42` and identical `totalDays` (Hospital 940 vs
     940, HHS 137 vs 137). `priceCell` is `days = ceil(secs / (shiftSecs × crews))`, so tripling the
     numerator and dividing the denominator by 3 cannot produce different answers. Step 2 as written
     ("fix the calibration at its source … do not revert the 24h shift ruling") asks for two things
     that are the same arithmetic. **This is the decision that now needs the user, and it is the
     reason nothing was built.**
   - **`§TPL_CALIB_SCOPE` — NOT CONFINED.** Hospital `totalDays 318→940` (**×2.96**), 38/42 tasks
     change, **35 of 35 non-floored tasks lengthen**, 63153/63182 elements (**100.0%**) sit in a bar
     that grows. Spot-check HHS_Office_Federated `50→137` (×2.74), 15/15 non-floored. The 369-day
     project total moves by ~3x — exactly the "materially bigger decision" step 1 named.
   - **`§TPL_CALIB_AXIS_FRACTION` — the lever makes the reported complaint WORSE.** A bar is
     "squashed" as a fraction of the DRAWN AXIS, not in days, and the project total grows faster
     than the short bars do: **26/42** Hospital bars end up RELATIVELY NARROWER
     (`Architecture_Closeup_Level_6` 1→1 day = 0.314%→0.106% of axis; `Superstructure_Level_7A`
     1→2 days = 0.314%→0.213%; `Finishes_Level_1` 2→4 days = 0.629%→0.426%). 4 of the 7 floored
     tasks do not grow at all — confirming the prediction already in the option table above.
   - **The "3x unit mismatch" framing above is itself wrong, and that matters.** `rates.js`
     `SHIFT_HOURS`' own header already says 8 is "the rate table's own crew-day length" and that 24
     was chosen deliberately because 8 "tripled every building's display span (Hospital ~2020d) —
     the user judged that too slow". `_installSecs` returns real crew-SECONDS (a labor-content
     quantity, correct at any shift length); dividing by a 24h shift is the standing 3-shift ruling,
     not a calibration bug. There is no free lengthening hiding in this formula.

   **`§TPL_PARALLEL_REVEAL` — step 4's addendum (parallel series) ANSWERED, and it PASSES.**
   - Reveal timestamps are **absolute project-timeline instants**: 63182/63182 Hospital elements
     inside their own task's `[sDays,eDays]` window, worst offset **0.000 days**. Structural reason,
     read off the code: `remapSolveToTasks` computes `wS = base + t.sDays*86400000` per task
     independently (`cursor` resets to `wS` each task), so overlapping windows overlap by
     construction — there is no per-task-exclusive animation sequence to serialise them.
   - **Overlapping tasks genuinely interleave.** Hospital: 44 cross-level overlapping task pairs,
     same-level 0 (the invariant). On the 3 widest overlaps, `alternations` = 949 / 684 / 1009 where
     a serialised (two back-to-back blocks) pair gives exactly **1**; mean same-task run 5.7–9.1
     elements out of thousands.
   - **`displayRemap` cannot change this, and here is why** (closing part of the RED measurement's
     open caveat): in the template path `opts.displayRemap` rewrites the RAW SOLVE **before**
     `instantiateTemplate`, but `instantiateTemplate` never reads the schedule — task windows are
     priced from `duration_rule` alone. So the remap can only move fine positions INSIDE a band; it
     cannot move a task window, and therefore cannot affect whether two tasks overlap. The
     MEP-Final within-band skew still needs the real remap to confirm; the interleaving does not.
   - **New, precisely located finding for whoever fixes item 2: intra-task DEAD AIR.**
     `TASK_Architecture_Envelope_Level_5` has **zero element starts on days 166–168 and 173** of its
     own [137,180] window. Cause: `remapSolveToTasks` gives each support layer a band sized by
     member COUNT, then affine-maps that layer's own solve range onto it — a layer whose solve range
     is narrow relative to its band bunches at the band's start and leaves the band's tail empty.
     That is the same defect as the MEP-Final cramming, seen from the other side, and it is
     independent of bar length: **lengthening the bar does not fill the gap, it stretches it.**
   - ⚠ Two invented-threshold traps hit while writing this probe, both corrected in the shipped
     version — worth not repeating: (a) scoring interleaving against a made-up `ratio > 0.5` vs a
     random mix called a CORRECT schedule FAIL (same-task clumping is `§TPL_LAYER_ORDER` working as
     designed; the ratio is now printed as descriptive only); (b) counting an element as revealing
     only at its START instant under-reported every band tail. A one-task slice is now ATTRIBUTED
     (serialisation vs the other task's dead air), never blamed on parallelism by default.

   **Invariant, before and after: `witness_4d_template_instantiation.js` pass=11 fail=0 ran=82,
   `no-same-level-phase-overlap` PASS** (Hospital `sameLevelPhaseOverlaps=0/98`). Unchanged by
   construction — no shipped code was touched.

   **⛔ OPEN, needs the user — do NOT pick step 2 up as written.** The direction as stated is
   arithmetically the option the same decision rejected. Real remaining levers, none of them
   "invent a duration": (a) accept the 3x and re-rule `SHIFT_HOURS` to 8 knowingly (it is the same
   change, honestly named — but note it makes the short-bar complaint WORSE, per
   `§TPL_CALIB_AXIS_FRACTION`); (b) leave durations alone and fix the actual visual defect, which
   the parallel-reveal probe just localised to intra-task dead air in `remapSolveToTasks`' band
   sizing — extraction-based, no duration invented, and it does not move the 318-day total;
   (c) the still-unchecked real-quantity-basis pass for the remaining Finishes/MEP-Final/
   Architecture-Closeup classes (`IfcCovering` already clean at 62.4m² avg) — this is the only
   part of step 2 that survives step 1's result, and it was NOT started.
   **2026-09-02 — §TM_REVEAL_SHIPPED: THE MOVIE NEVER PLAYED `remapSolveToTasks`. Root cause of
   "substructure and floor slabs appear all one shot" found on the SHIPPED path, measured on 4
   buildings, narrowest fix specced below (bim-ootb `fix/tm-buildup-reveal`).**
   User caution governing this item: *"do not impact what is already working without deeper impact
   awareness"* — this is a SMALL fix; nothing about bars, dates, crews, cost or the film cursor moves.

   **A. The layer every prior number in this item measured is not the layer the movie plays.**
   `materializeZones` returns `displaySchedule` (= `remapSolveToTasks`, `schedule_author.js:965`)
   and `cache_4d_run.js` persists it — but `time_machine.js` has ZERO readers of `displaySchedule`
   (grep: the only reference repo-wide is its own return statement, `schedule_author.js:1476`). The
   kernel_ops timestamps the Time Machine scrubber and the film read (`op.start_ts <= cursor`,
   `time_machine.js:169-170, 2576`) are written by `injectGantt` from
   `_displayTimeline(_twItems)` (CpmSchedule.run, `~4838`) → **`_tmRescaleToTaskWindow`** (`~4880`,
   §TM_ELEMENT_WINDOW_RESCALE 2026-08-25): a per-task AFFINE map of the CPM group's raw
   `[min,max]` onto the template window. So `§TPL_REVEAL_SPREAD`'s "roughly uniform", the
   `§TPL_LAYER_ORDER` bands, `§FUTURE`-item-2's duration tiling, `§TPL_MOVIE_BINDS_BARS`'s "every
   element now plays inside the bar that claims it", and `witness_day0_integrity.js`'s C2/C3 all
   describe a map nobody plays. `_tmDisplayRemap`'s Tukey clamp (the brief's mechanism 1) is also
   inert on the template path: it clamps only the WINDOW-authoring map, which the template then
   ignores (windows are priced from installSecs), and the affine reads the UNclamped CPM times.

   **B. Measured on the shipped chain, replicated in node by slicing the live functions out of
   `time_machine.js` (no browser, no bake): `bim-ootb scripts/probe_tm_reveal_shipped.js`, logs
   `scratchpad/reveal_ab_{Duplex,HHS_Office_Federated,Hospital,Terminal}.log`.** The CELL gate
   fires exactly as live (Hospital `§CELL_GATE repr=99.42% path=CELL`, Terminal 99.56% CELL, HHS
   85.21% GRAPH, Duplex 97.34% CELL).
   - The affine is outlier-sensitive by construction: CPM's GLOBAL per-resource crew pools give a
     task's members a raw span of up to **434 d for a 35-day bar** (`TASK_MEP_Rough_in_Level_1
     cpmRawSpan=434.27d coreSpan=56.14d`), so the Tukey-core mass lands in `coreFracOfWindow` =
     13% of the bar and the rest is dead air. `§TM_REVEAL_SHIPPED_TASK` Hospital:
     `TASK_MEP_Final_Level_5 n=564 days=3 PLAY.deciles=[3.5,0,0,0,0,0,0,0,0,96.5]`,
     `TASK_MEP_Rough_in_Level_2 n=5286 days=34 [0.4,4.2,94.2,0.9,0,0,0,0,0.2,0]`,
     `TASK_Substructure_Level_1 n=555 days=11 [18.4,17.8,17.8,18.4,17.5,8.8,1.1,0,0,0.2]` (90% of
     the footings in the first half of the bar, days 6-11 empty; 553 footings on only **200 distinct
     start instants**). Aggregate `§TM_REVEAL_SHIPPED_AGG Hospital PLAY.decilePct=
     [12.1,16.2,19.3,9.2,8,7.7,4.5,3.7,6.6,12.6]` vs the cache's `displaySchedule
     [9.8,10.1,10,9.7,10.5,10.2,9.5,10.2,9.9,10]` — same building, same run, the played map is
     the skewed one.
   - **`§TM_REVEAL_DEADAIR`** (share of a bar during which NO member is in progress, i.e. the bar
     is lit but nothing appears or glows): mean **44.1% Duplex / 63.2% HHS / 63.3% Hospital / 70.7%
     Terminal**, worst 98.2 / 99.7 / 99.5 / 99.9%. Pile-up (max share of a task n≥20 whose starts
     fall inside ONE 1%-of-bar bin): 13.8 / 48.0 / **77.0** / 62.5%.
   - **The user's acceptance shape — "a whole floor slab should not appear all at once" — reproduces
     on every building with multi-element floors** (`§TM_REVEAL_GROUP`, per (task,class)): HHS
     `TASK_Superstructure_Level_1 IfcSlab n=27 taskDays=11 maxDecile=100% max1pctBin=66.7%
     distinctStarts=15`; Hospital `TASK_Superstructure_Level_3 IfcSlab n=22 taskDays=9
     maxDecile=100% distinctStarts=8 groupSpan=0.07d = 0.03 s of a 135 s film`; Terminal
     `TASK_Superstructure_02_FIRST_FLOOR_LEVEL IfcSlab n=72 maxDecile=100%`, `_04_THIRD_FLOOR n=53
     maxDecile=100% groupSpan=0.08d`. Groups (n≥5) with one decile holding >50% of the group:
     Duplex 9/23, HHS 19/42, **Hospital 99/126, Terminal 86/128**.
   - **Cardinality (coordinator boundary question, answered from the cache, `§SLAB_CARDINALITY`):**
     Hospital Levels 2, 3, 4, 5, 6 each have exactly ONE IfcSlab of 7.6-9.2k m² (100% of the level's
     slab area) — on those levels "the whole floor slab" IS one element and progressive reveal would
     need sub-element geometry splitting = a new mechanism = invention. **Not built, not proposed.**
     Duplex (10 slabs/level, max 25% area share), HHS (37/27/12 per level), Terminal (420 ground-floor
     slabs, max 2%) and Hospital Level 3 TOS (21 deck slabs) are N-element floors — in lane.
   - Mechanism 2 (DAY-0 pile-up, `§W_D0 FAIL=5`) is NOT this bug: that witness judges
     `displaySchedule`; on the played layer DAY 0 is pure by window construction
     (`§TM_REVEAL_DAY0 Hospital SHIPPED onScreenDay0=93 impure=0 phases={Substructure:93}`).
   - Mechanism 3 (film budget) — REPORT ONLY, axis B is out of this lane by coordinator scope
     correction 2026-09-02: `§TM_REVEAL_ONSET_REPORT Hospital` substructure (11 d = 4.7 s of a 135 s
     film calendar-linear) completes at **1.7 s under §CPE_BUILDUP_ONSET_BLEND** (k-th-completion
     element pacing: 555 footings = 0.9% of elements = 0.9% of the film), peak **55 footings placed
     in one frame**. The blend is the dominant compressor of the substructure IN THE FILM (3.5x);
     the Time Machine scrubber does not have it. Named for the owner of that lane, not touched.

   **C. Owner and axis.** Axis A. The played "where inside its bar" owner is `injectGantt`'s
   `_tmRescaleToTaskWindow` (`time_machine.js`), which must CALL the verb the codebase already owns
   for this question — `ScheduleAuthor.remapSolveToTasks` (`4D_MODEL_INTEGRITY.md` §I "where inside
   its task?") — instead of re-deriving a layout with an affine. `§I` gets a row for the PLAYED
   layer (this section is its origin).

   **D. THE FIX (SPEC — written before code).** New module-level `_tmTilePlayWithinTasks(disp, cap,
   displayAuthored)` in `time_machine.js`, called once in `injectGantt` after `_winGroups` is
   built; `_tmRescaleToTaskWindow(guid, s)` returns the tiled interval when one exists and falls
   through to the affine otherwise (byte-identical prior behaviour for every element/schedule the
   tiling does not cover). The tiling = `ScheduleAuthor.remapSolveToTasks(_disp, tasksFromCap,
   isoOf(_cap.base), null)`: one band per task, members ordered by their CPM display start (ties on
   guid), each element's width = its own CPM duration share, tiled edge-to-edge across the task's
   real window. Gated on `schedules.display_authored=1` (the same flag `§CAP_RESCALE_SKIP` /
   `§OG_SWEEP_SKIP` key on — our own authored windows); imported/captured/baselined schedules keep
   the affine untouched. `_GANTT_CACHE_VERSION` 37→38 so an existing user's IDB-cached kernel_ops
   regenerate (the §GANTT_CACHE_HIT self-heal); `sw.js` CACHE_VERSION bump (time_machine.js is
   precached). New `§TM_REVEAL_TILED tasks= mapped= skipped=` line; `§TM_ELEMENT_WINDOW_BIND` gains
   `tiled=N` (nothing removed).
   - What it changes: WHEN each element appears inside its already-correct bar, on generated
     schedules, on every building (Hospital 63,182 elements move within their bars).
   - What it keeps, by construction and measured: every task window, date, crew, cost, and the
     film cursor untouched; CPM ORDER inside every bar preserved — a monotone map, the exact
     property the affine was chosen for (`§TM_REVEAL_ORDER violations=0/1099 Duplex, 0/6819 HHS,
     0/63140 Hospital, 0/48351 Terminal`); the §S50 cell order stays the live precedence carrier.
   - Measured A/B (candidate computed by calling the shipped verb, before any code change):
     `§TM_REVEAL_DEADAIR` mean 44.1/63.2/63.3/70.7% → **0.0% on all four**; pile-up 13.8/48.0/
     77.0/62.5% → 9.9/4.0/5.6/8.3%; groups >50%-in-one-decile 9/19/99/86 → 5/7/34/21; Hospital
     footings 200 → **553 distinct starts, deciles [10.1,9.9,10.1,9.9,9.9,10.1,9.9,10.1,9.9,9.8]**
     across the full 11 days (was 200 instants in the first 5.5 d); day-0 on-screen 93 → 51
     (= 555/11). Judges (same three injectGantt runs, `§TM_REVEAL_JUDGE`): auditFloating
     20→17 / 315→304 / 424→416 / 367→365; midair 25→27 / 183→218 / 482→498 / 1611→1400;
     cjpFloating 2→2 / 53→49 / 70→70 / 175→181 — small, both directions (cross-task pairs inside
     overlapping windows re-order either way under ANY within-window remap; the affine's early
     pile-ups happened to put some supports first). Reported, not gated: no threshold exists that
     is not invented.
   - **What it does NOT do, stated plainly (the residual is NOT this item's and lands on rulings):**
     a SUPERSTRUCTURE level's slab SET stays compact because (i) `_installSecs` prices every IfcSlab
     at a flat **823 s** regardless of area (`§LABOUR_SHARE Hospital TASK_Superstructure_Level_3
     IfcSlab n=22 secs=18106 = 0.8%` of the task's 2,258,870 s; a 9,192 m² floor plate gets 14 min)
     — the rate table's calibration, law-5 territory, not touched; (ii) CPM's §S50 cell order lays a
     level out trade-by-trade (all columns, all beams, then all slabs), so the slab block is
     contiguous at the bar's tail — a user ruling, not touched; (iii) the film's 135 s / 318 d budget
     makes 0.8% of a 9-day bar sub-frame regardless. Candidate widens the sets (HHS L1 27 slabs
     0.63 → 1.36 d, 15 → 27 distinct instants; Terminal 04 53 slabs 0.08 → 0.16 d, 18 → 53) but
     cannot make them "progressive" in film time. **Decision for the user:** if a floor's slabs must
     read as sequential effort, the lever is (i) or (ii) — both rulings — or the film's own
     dwell (axis B). None is small.

   **E. WITNESS CLAIM (before code): `viewer/tests/witness_tm_reveal_within_bar.js`, W-RWB.**
   Runs the shipped chain in node (sliced live functions, real DBs: Duplex, HHS, Hospital), reports
   the population of every claim, prints INCONCLUSIVE on an empty population:
   - W-RWB-R redControl: the affine-only map (tiling disabled) shows the defect on this input —
     mean dead air > 0 and ≥1 (task,class) group with >50% in one decile. Proves the fix is not vacuous.
   - W-RWB-1 no dead air: with the SHIPPED `_tmTilePlayWithinTasks` slice, every task (n≥2) has
     dead-air share 0 (≤1 ms rounding per element).
   - W-RWB-2 inside window: every tiled element satisfies wS ≤ start < end ≤ wE.
   - W-RWB-3 order preserved: within each task, starts are non-decreasing in CPM-start order.
   - W-RWB-4 contiguous tiles: first start == wS, last end == wE, each start == previous end.
   - W-RWB-5 acceptance shape: every (task,class) group (n≥5) has distinctStarts == n; the count of
     groups >50%-in-one-decile is ≤ the affine's (reported both).
   - W-RWB-6 fallback: an unmapped guid returns the affine result; `displayAuthored=false` returns
     null and logs `§TM_REVEAL_TILED skip`.
   - W-RWB-7 wiring (source text): injectGantt calls `_tmTilePlayWithinTasks(` before the write
     loop; `_tmRescaleToTaskWindow` consults `_tiledPlay` before the affine; `_GANTT_CACHE_VERSION` ≥ 38.
   Tripwire re-runs: `witness_tm_element_window_bind` (6/6), `witness_gantt_props_epoch` (W-PE-8
   regexes must still match — the affine line is kept verbatim), `witness_crosstask_judge_parity`,
   `witness_midair_zero` (baselines are on the CPM display map, must not move), `witness_day0_integrity`
   (reads the cache — unchanged by this), `witness_4d_movie_binds_bars`, `witness_bake_plays_schedule`.
   `witness_cpe_ghost_ground.js` is puppeteer-driven (a browser, not a bake) — run only if the
   cursor path is touched; it is not.

   **F. MEASURED after the code (same day, `bim-ootb fix/tm-buildup-reveal` = PR #1605, log
   `scratchpad/witness_rwb.log`): `§W_RWB_SUMMARY pass=22 fail=0 inconclusive=0` on Duplex + HHS +
   Hospital, through the SHIPPED `_tmTilePlayWithinTasks` slice.** Red control green on all three
   (`W-RWB-R Duplex meanDeadAir=44.1% groups>50%=9/23`, HHS `63.2% 19/42`, Hospital `63.3% 99/126`);
   `W-RWB-1 tiled meanDeadAir=0.000%` with `tiledElements=1119/1119, 6839/6839, 63182/63182`;
   W-RWB-2/3/4 judged 63182 / 63140 / 63224 on Hospital, bad=0; `W-RWB-5 Hospital groups>50%InOneDecile
   99 -> 34, Substructure_Level_1 IfcFooting n=553 maxDecile=10% distinct=553` (was 200 distinct);
   `§TM_REVEAL_TILED tasks=42 mapped=63182 skipped=0 degenerate=0`. Judges as predicted in §D.
   Residual named in §D ("does NOT do") confirmed on the shipped function: `Superstructure_Level_3
   IfcSlab n=22 maxDecile=100% distinct=22` — 22 distinct instants, but the set's width is its 0.8%
   labour share (flat 823 s/slab) placed as one CPM trade block — user decision, not code.

   **2026-09-02 — §CACHE_PLAYED_LAYER: THE JUDGES NOW NAME THE LAYER THEY JUDGE (queue item A-9,
   bim-ootb `fix/cache-played-layer`). SPEC, written before code.**

   **G. THE DEFECT BEING REMOVED.** §TM_REVEAL_SHIPPED (§A above) established that the movie and
   the scrubber never read `displaySchedule`. It did **not** change what `scripts/cache_4d_run.js`
   persists — so `~/.cache/bim4d/*/run.json` still carries exactly one schedule, the unplayed one,
   under the neutral key `sched`, and every cache reader silently inherited it:
   `viewer/tests/witness_day0_integrity.js` (§W_D0 C2/C3/C4), `scripts/probe_tpl_reveal_spread.js`
   (§TPL_REVEAL_SPREAD), `scripts/probe_tpl_parallel_reveal.js`, `scripts/probe_tpl_calibration_scope.js`,
   `viewer/tests/probe_stair_flight_support_pool.js`. **None of them prints which layer it judged**,
   which is why the wrong layer survived four weeks of measurement. That anonymity is the defect,
   not the layer choice — a judge that cannot name its own input cannot report being pointed at
   the wrong one (PRIMAL LAW clause 4).

   **G.1 A SECOND, INDEPENDENT DIVERGENCE FOUND WHILE SPECCING THIS — the cached run was not even
   the live CONFIGURATION.** `cache_4d_run.js` calls `materializeZones` **without `opts.displayRemap`**.
   Read `schedule_author.js:728-736`: that hook is what sets `_displayAuthored = 1` and what replaces
   the raw solve with the CPM display timeline before windows are authored. Measured consequences on
   the current Hospital cache (`~/.cache/bim4d/Hospital/567de7d89253_569fac128caf/witness.log`,
   29 lines, read in full): **no `§ZONE_DISPLAY_AUTHORING` line, no `§CELL_GATE` line, no
   `§CPM_DISPLAY` line** — the cached run authored its windows from the RAW schedule and never ran
   the CPM display pass at all, while the live probe on the same building reports
   `§CELL_GATE repr=99.42% path=CELL`. So the cache was not "the played layer's sibling"; it was a
   third configuration nobody runs. Persisting a played layer on top of that would still be wrong,
   so the hook is wired in as part of this change and `schedules.display_authored` is read from the
   DB, never assumed.

   **H. THE FIX (spec).**
   - **New module `scripts/lib/tm_played_layer.js` — ONE owner for "the played layer, in node".**
     It holds the brace-matched slicing of the live `time_machine.js` functions (`_tukeyBound`,
     `_displayTimelineRemember`, `_displayTimeline`, `_tmDisplayRemap`, `_tmRescaleToTaskWindow`,
     `_tmTilePlayWithinTasks`) and the `injectGantt` mirror that turns them into a `guid -> {s,e}`
     map. This is the approach `scripts/probe_tm_reveal_shipped.js` proved in PR #1605, **lifted,
     not re-invented** — the probe is refactored onto the module in the same commit so exactly one
     copy exists. `applyTiling:false` reproduces the pre-#1605 affine (the probe's A column and its
     red control); `applyTiling:true` reproduces the shipped play path byte-identically by setting
     the sandbox's `_tiledPlay` and calling the shipped `_tmRescaleToTaskWindow`.
   - **`cache_4d_run.js` persists BOTH layers, named.** `run.json` gains `play` (the kernel_ops
     timestamps the film and the scrubber read) and `layers` (a self-describing record: id, what
     writes it, whether `time_machine.js` reads it). `sched` is KEPT under its existing key so no
     reader breaks, and is additionally aliased as `display`. `INPUTS` gains `time_machine.js`,
     `gantt_model.js`, `lib/room_walker.js`, `lib/level_deriver.js`, `location_axis.js` — the
     played layer depends on all five, so a stale cache stays impossible.
   - **`read()` gains `layerOf(run, id)`** returning `{ id, map, desc }`. Every judge selects
     through it and prints `layer=<id>` on its own `§` line. Default = `played`; `LAYER=display`
     re-points a judge at the old map deliberately, and it still says so on every line.
   - **Re-pointed judges:** `§W_D0` (C2/C3/C4 — C1 is band geometry, layer-independent, and stays),
     `§TPL_REVEAL_SPREAD`, `§TPL_PARALLEL_REVEAL`, `probe_stair_flight_support_pool`,
     `probe_tpl_calibration_scope`.

   **I. WITNESS CLAIM (before code): `viewer/tests/witness_cache_layer_attribution.js`, W-CLA.**
   Reads the persisted cache only — no pipeline re-run, no browser, no bake.
   - **W-CLA-1 BOTH LAYERS** — every building with a current-code cache carries both `play` and
     `sched`, with equal guid coverage. Population = cached buildings; **INCONCLUSIVE, never PASS,
     when zero are cached.**
   - **W-CLA-2 NOT THE SAME MAP** (the anti-vacuous claim) — the two layers must actually differ,
     or re-pointing every judge is a no-op dressed as a fix. Asserted as: ≥1% of shared guids have
     a different start instant, AND the aggregate within-task decile vectors differ. Both vectors
     printed, both layers named.
   - **W-CLA-3 PLAYED IS IN-WINDOW** — every played interval satisfies `wS ≤ s ≤ e ≤ wE` for the
     task that claims it (the invariant `_tmRescaleToTaskWindow` exists to hold). Population =
     elements with a resolvable task.
   - **W-CLA-4 EVERY CACHE READER NAMES ITS LAYER** (source-text claim, the actual DONE-WHEN) —
     for each file that calls `CACHE.read(`, its source must reference `layerOf(` **and** emit
     `layer=` in a `§` line. Population = the reader files found by grep; a file added later and
     not re-pointed makes this claim FAIL, which is the point.
   - **W-CLA-5 NO SILENT DEFAULT** — `layerOf` on an unknown id throws rather than falling back,
     and on a cache built before this change reports `MISSING` rather than substituting `sched`.

   **J. WHAT THIS DOES NOT DO.** It does not change one line of shipped viewer behaviour — the
   film, the scrubber, task windows, dates, crews and cost are untouched; `time_machine.js` is
   READ (sliced) by node, never edited. It does not re-verify §TM_REVEAL_SHIPPED's numbers; those
   were measured on the played layer already and stand. It does not decide anything about the
   residual slab compaction (U-8/U-9 remain the user's).

   **K. MEASURED after the code (bim-ootb PR #1607 `fix/cache-played-layer`; all four buildings
   rebuilt = 119,568 elements; logs `scratchpad/cache_fleet.log`, `wcla_fleet.log`,
   `wd0_played.log`, `wd0_display.log`, `spread_both.log`).**
   - `§W_CLA_SUMMARY claims=5 PASS=5 FAIL=0 INCONCLUSIVE=0 GREEN`. C3 judged **119,568**
     element-task pairs, bad=0. C4 found **5 cache-reading files**, all now naming their layer
     (4 select through `layerOf`, `probe_tpl_calibration_scope` declares `layer=NONE`).
   - **C2, the anti-vacuous claim: the two layers really are different maps.** Share of shared
     guids whose START INSTANT differs — Duplex **97.1%**, HHS **99.8%**, Hospital **99.6%**,
     Terminal **99.6%**. They differ for two independent reasons: the played layer's solve input
     is the CPM display timeline, and it calls `remapSolveToTasks` with `layerOf = null` where
     `displaySchedule` passes the §TPL_LAYER_ORDER support-layer bands.
   - **The cached run is now the live configuration, and `§CELL_GATE` proves it** — it did not
     appear in the cache log at all before this change, and now matches `probe_tm_reveal_shipped`'s
     live values EXACTLY: Duplex **97.34% CELL**, HHS **85.21% GRAPH**, Hospital **99.42% CELL**,
     Terminal **99.56% CELL**.
   - **`§TPL_REVEAL_SPREAD` RE-MEASURED, replacing the struck `[12.8,9.7,…]`.** Aggregate
     within-task decile %, PLAYED layer, post-§TM_REVEAL_TILED:
     Duplex `[8.0,11.5,9.6,9.7,9.8,10.0,9.5,10.5,10.7,10.8]` ·
     HHS `[9.1,8.3,9.9,9.6,9.4,9.4,10.3,11.2,11.3,11.5]` ·
     **Hospital `[10.6,11.0,9.9,9.7,8.0,9.1,10.1,10.2,10.7,10.7]`** ·
     Terminal `[6.9,8.1,9.1,10.8,10.4,10.7,10.7,10.9,11.1,11.4]`. First-decile ratio 0.80x /
     0.91x / 1.06x / 0.69x — **roughly uniform, and now that is a statement about the film.**
     ⚠ Three different vectors exist for Hospital and they must not be confused:
     the struck `[12.8,…]` (unplayed map, no-displayRemap configuration), the PRE-#1605 played
     layer `[12.1,16.2,19.3,9.2,8,7.7,4.5,3.7,6.6,12.6]` (§TM_REVEAL_SHIPPED §B, the affine —
     that one is the real defect this lane fixed), and this one.
   - **`§W_D0` re-baselined on the played layer: `claims=16 PASS=5 FAIL=8 INCONCLUSIVE=3`.**
     (16 not 13 — the old table's 13 came from one building having no current cache, contributing
     a single INCONCLUSIVE instead of four claims. That is cache coverage, not a code regression:
     B-1's "reproduces `claims=13 PASS=4 FAIL=5 INCONCLUSIVE=4` on unmodified `origin/main`" was
     read off an incomplete cache.) Same run with `LAYER=display` gives the SAME 5/8/3 pattern but
     DIFFERENT populations and counts, which is exactly why the old numbers were void as
     measurements even where the verdict letter happened to agree: HHS C3 `judged=4 bad=3` (played)
     vs `judged=11 bad=5` (display); Duplex C4 `bad=83` vs `88`; Terminal C2 `bad=9` vs `10`;
     HHS C2 `judged=75` vs `86`. Hospital C2 on the played layer is `judged=51 impure=0`, which is
     `555/11` — the same value §TM_REVEAL_SHIPPED predicted for the tiled candidate.
   - Cross-checks that the cache's played layer IS the shipped one: `§STAIR_POOL Hospital
     floating 416` matches §TM_REVEAL_SHIPPED §D's predicted post-tiling `424 -> 416`; W-RWB
     re-run on Duplex `pass=8 fail=0`, `auditFloating 20 -> 17` unchanged;
     `§TPL_REVEAL_ABSOLUTE Hospital layer=played 63182/63182 outside=0`.

4. **Editor full-cycle review.** Whether the standalone Schedule Editor (`schedule_editor_ui.js`)
   actually supports a complete edit cycle end-to-end is *already* named as unverified above, in this
   same file (persist-fix section, "Deliberately NOT touched" — split-mode task-data loading was never
   confirmed). Folding the user's ask into that same open question rather than treating it as new.
5. **⛔ NEW (user, 2026-08-27): feature-wide audit — which scheduling constants live in code vs.
   `rates/sequence_rules.json` / `rates/4D_template.json`, and should they.** Trigger: the 8h/24h
   shift-calibration constant (`28800` in `_installSecs`, item 2 above) turned out to be a hardcoded
   JS literal, not a rate-file value — despite `sequence_rules.json` already being the declared home
   for trade rates and crew counts. The user's concern is systemic: **are there other constants like
   this scattered through the JS that should be data, and isn't**, and is the prompt-file bloat this
   whole file has been fighting today a contributing cause of that kind of thing going unnoticed.

   **This is a READ-ONLY INVENTORY task, not an implementation task — say that explicitly to whoever
   picks it up.** Deliverable: a table of every scheduling-relevant numeric/behavioral constant found
   hardcoded in `schedule_author.js`/`schedule_gate.js`/`time_machine.js`'s scheduling path (grep for
   bare numeric literals near `secs`/`days`/`shift`/`crew`/`rate` identifiers, cross-check each
   against whether an equivalent already exists in either JSON file), for each: what it is, where
   it lives now, whether the two JSON files are the natural home for it, and — **only as a
   recommendation, never applied in this pass** — whether moving it there is safe (does anything
   assume it's a compile-time constant vs. a runtime-read value; would a bad/missing JSON value need
   a sane fallback).

   **Safeguards, because this exact kind of task is what's been going wrong (verbatim user words:
   "such idiocy... don't trash around"):**
   - No code changes. No JSON edits. This session's job ends at a written inventory + recommendation
     table, committed to this file (in place, don't append yet another dated section — add it as a
     new subsection under this item).
   - Spec-First: before touching any file, state which files/functions are in scope
     (`schedule_author.js`, `schedule_gate.js`, `time_machine.js`'s scheduling calls only — not the
     whole viewer) and how "scheduling-relevant constant" is being defined, so the boundary is fixed
     before the grep starts, not discovered by how far the session happened to wander.
   - Every claim cited by file:line, verified by reading the actual code, not inferred from a
     variable name.
   - If the investigation surfaces something that looks like an active bug (like item 2's 3x
     mismatch) rather than a config-location question, name it and stop — do not fix it in the same
     pass, hand it back as a separate finding.
   - Read `4D_MODEL_INTEGRITY.md` §I (the ownership table) and this file's own §FUTURE items 1-4
     first — if a constant this audit finds is already the subject of a tracked item, cross-reference
     it, don't re-open it as new.

   ### §FUTURE-5A — THE INVENTORY (READ-ONLY PASS DONE 2026-08-27; nothing applied)

   Read-only, as specified. No code changed, no JSON changed. Every row below was verified by
   reading the cited lines on bim-ootb `origin/main` @ `676a71b` (checkout confirmed 0 ahead /
   0 behind), never inferred from a variable name.

   **SCOPE, fixed in writing before the first grep (Spec-First).** Files: `schedule_author.js`
   (whole), `schedule_gate.js` (whole), `time_machine.js` **scheduling call sites only** — defined
   as the functions that construct or consume a schedule (those passing `shiftHours`/`laborRates`/
   `displayRemap` into ScheduleAuthor/ScheduleGate, plus `getInstallSecs`, `_tmDisplayRemap`,
   `_twoTierRemap`), NOT the Gantt canvas drawing and NOT playback. A **"scheduling-relevant
   constant"** = all of: (a) it participates in producing a task/element DURATION, DATE, CREW count,
   COST, or ORDER — it changes a number the Gantt or the movie displays; (b) changing it changes a
   shipped number without changing any algorithm (a parameter, not a structure); (c) it is not a pure
   numerical/implementation detail. **Excluded up front, deliberately:** physical unit identities
   (`3600`, `86400000`, `1000`) — *except* where a literal encodes POLICY disguised as a unit
   conversion, which is the entire point of this audit; geometry epsilons/tolerances (`EPS`, `GAP`,
   Z-bands — owned by `support_sweep.js`, §E/§I.1); rendering constants; `bar_model.js` (hook-blocked).

   **THERE ARE THREE JSON HOMES, NOT TWO.** The task named `sequence_rules.json` and
   `4D_template.json`. `viewer/rates/4D_policy.json` also exists and self-describes as *"The ONLY
   authored input to 4D scheduling."* **It has ZERO production readers** — verified: the only files
   that read it are `tests/witness_bar_schedule.js:31` and `tests/witness_bar_composite.js:31`, and
   `bar_model.js` (which takes `policy` as a caller-supplied parameter, `:203`) is itself referenced
   by **no** production JS or HTML, only by those same two witnesses. This is NOT a new defect —
   it is exactly `4D_MODEL_INTEGRITY.md` §A ("⛔ SUPERSEDED 2026-08-27 — THIS MODEL IS DEAD CODE").
   Recorded here so a future session does not "fix" scheduling by editing a file nothing loads.
   Same class: `calendar.days_per_week` (`4D_template.json`) and `days_per_week` (`4D_policy.json`)
   are the same fact stored twice, and **neither is read by any production code** — no week calendar
   exists in the engine (consistent with `schedule_gate.js:1057`'s own `24/7 calendar unchanged`).

   #### Group A — the 8h/24h shift-basis family (the trigger; item 2 already owns the BUG)

   | # | constant | location (file:line) | natural home | safety / recommendation |
   |---|---|---|---|---|
   | A1 | `28800` — the install-time basis | `schedule_author.js:91` `_installSecs` (`secsPerUnit = 28800 / prod`) | **`sequence_rules.json`**, NOT the template calendar | ⚠ **The obvious move is the wrong one.** `28800` is the denominator the *productivity figures themselves* are quoted against — a property of the rate table. `4D_template.json` `calendar.hours_per_shift` (=24) is the crew's working day — a different quantity that merely shares the word "hours". Collapsing them into one key is precisely the 3x conflation item 2 is chasing. Recommend a NEW `LABOR_RATES._productivity_basis_secs: 28800` in `sequence_rules.json`, read alongside the table it calibrates. **Cross-ref: §FUTURE item 2** owns the bug; this row owns only the location question. |
   | A2 | `28800` (2 more copies) | `schedule_author.js:1534` (`materializeDefault`), `:1729` (`scheduleContiguous`) | same as A1 | Same literal, two more sites, on the alternate/legacy authoring paths. Any A1 move is incomplete until these read the same value. |
   | A3 | `28800` + `120` | `time_machine.js:4513` `getInstallSecs` fallback | same as A1 | **ALREADY TRACKED — `4D_MODEL_INTEGRITY.md` §I**, row *"how long does it take?"*: *"`time_machine.js:4494 getInstallSecs` already delegates here; its local fallback is documented as a divergence risk."* Cross-referenced, not re-opened. |
   | A4 | `/ 28800` crew-day divisor | `time_machine.js:4744` (§HR_COST) | same as A1 | Fourth consumer of the same basis. |
   | A5 | `SHIFT_MS = 8 * 3600 * 1000` | `schedule_gate.js:72` (module default), `:423` (per-call fallback) | `4D_template.json` `calendar.hours_per_shift` (=24) | **NOT safe to move blind.** The `:417` comment states the 8h default is load-bearing for back-compat: *every witness/probe that omits `shiftHours` is unaffected because a uniform rescale changes no order/floating assertion.* Flipping the default 8→24 moves every one of those baselines at once. If moved, keep 8 as the literal fallback and read 24 only from the template. |
   | A6 | `8` fallback (`_shiftMs`) | `schedule_author.js:781` (`materializeZones`) | same as A5 | **Dead branch only** — `:739` `if (opts.template) return _writeTemplateSchedule(...)` returns early, so every line from `:746` down (incl. `:770`, `:781`, `:846`, `:852`) runs ONLY on the `model=legacy-deriveZones` path §I:488 calls off-model. Lowest priority of the whole audit. |
   | A7 | `24` — `window.SHIFT_HOURS` fallback, **4 copies** | `time_machine.js:4688`, `:5329`, `:6909`, `:6951` | `rates.js SHIFT_HOURS` is the *declared* owner (per `4D_policy.json`), duplicated by `calendar.hours_per_shift` | Four hand-copied fallbacks of one value. Low risk individually (all agree at 24 today), but this is the shape that produced §GANTT_SHIFT_HOURS_DESYNC — one copy missed. |

   #### Group B — genuinely new findings, tracked nowhere

   | # | constant | location (file:line) | natural home | safety / recommendation |
   |---|---|---|---|---|
   | **B1** | **`seq <= 4` — the structure / non-structure boundary. 21 code sites in one file.** | `schedule_gate.js:132, 204, 205, 549, 570, 609, 669, 787, 806, 816, 868, 919, 933, 951, 1125, 1143, 1161, 1172, 1179, 1313, 1314` (comment sites excluded) | **Neither JSON — DERIVE it.** | **The highest-value finding of this audit.** Verified against `sequence_rules.json`: seq 1 = Substructure; seq 2-4 = Superstructure; seq 5+ = Architecture Envelope onward. So `4` is exactly `max(sequence)` over the phases the template declares structural — already fully determined by data, hardcoded 21 times. `4D_template.json` `phase_bands` *already declares* that phases own contiguous sequence bands, and §S65 #7 / PR #1527 has already moved a class between bands once (IfcRoof at seq 8). **Any future re-band silently mis-classifies structure at all 21 sites with no error.** Recommend one derived `STRUCT_MAX_SEQ` computed from the template at module init, not 21 literals — and note this is a *derivation*, so it needs no new JSON key and no fallback. |
   | **B2** | **`'2026-01-01'` — the project start date** | **In audited scope, 9 sites:** `schedule_author.js:670, 925, 1419, 1692, 2445, 2500` + `time_machine.js:5330, 5334, 7583`. **Outside audited scope, 14 more** (counted, not audited): `schedule_author_ui.js:197, 267, 276, 277, 289, 293, 294, 301, 311, 359, 511`; `schedule_diff.js:215`; `proj_control.js:83`; `proj_fold.js:160` — **23 total across `viewer/*.js`** | **`4D_template.json` `calendar`** (which already holds `days_per_week` + `holidays`, but has no `project_start`) | The two real UI call sites (`time_machine.js:5330/5334`) pass it as a **literal**, not via `opts.start`, so the shipped product cannot start a programme on any other date. Safe to move (pure input, nothing branches on its value); needs a documented fallback since an unparseable date would `NaN`-poison every derived day number. Note the blast radius is **wider than this audit's scope** — a fix must sweep `schedule_author_ui.js` too, or the editor and the engine will disagree on the epoch. |
   | B3 | `120` — the zero-minute install floor, **5 code sites** | `schedule_author.js:80`, `:90`; `schedule_gate.js:564`; `time_machine.js:4505`, `:4513` | `sequence_rules.json` (it is a property of the rate table) | §TPL_ZERO_MINUTE is a *named tag* and item 2 mentions it ("Verified NOT a `§TPL_ZERO_MINUTE` floor artifact"), but only as *did it fire* — the constant's **location** was never raised. New as a config question. Safe to move; needs a fallback (a 0 or missing value reintroduces the zero-width-bar stacking the tag exists to catch). |
   | **B4** | **Two disagreeing fallbacks for the SAME missing value: crew cap = `3` vs `1`** | `schedule_gate.js:46` `MAX_CREWS_DEFAULT = 3` (used `:441`) **vs** `schedule_author.js:470`, `:604`, `:845`, `:1533`, `:1728` — all `|| 1` | `sequence_rules.json` (a `LABOR_RATES._default_max_crews`, matching the existing `SEQUENCE_DEFAULT` pattern) | **Dormant but live.** Verified all 10 trades in `LABOR_RATES` carry `max_crews`, so named trades never hit either fallback. But `_DEFAULT`/unnamed resources do: the gate paces the solve at **3** crews while the author prices the same cell's bar at **1** — a 3x width disagreement on identical input. Same *shape* as item 2's mismatch, different constant. See separate finding #2 below. |
   | B5 | `95` — fallback labour day-rate | `time_machine.js:7992` (`var dailyRate = lr ? lr.rate_per_day * (lr.crew_size || 1) : 95;`) | `sequence_rules.json` `LABOR_RATES[t].rate_per_day` (already the real source, `:4782-4784`) | **The only constant in this entire audit with no documented derivation** — every other one carries a `§`-tagged provenance comment. A bare currency figure. Display-side (cost donut) so it moves no date, but it is a COST number and therefore in scope. See separate finding #3. |
   | B6 | `LEVEL_SCAN_MAX = 100000` | `schedule_author.js:610`, used `:613` | `4D_template.json` `capacity_rule` | The crew-levelling search cap. Moving it is safe; **its failure mode is not** — see separate finding #1. |
   | B7 | `phaseDays = opts.phaseDays \|\| 30` | `schedule_author.js:1420` (`materializeDefault`), `:1693` (`scheduleContiguous`) | `4D_template.json` | A 30-day default phase width on the alternate authoring paths. Low priority (not the canonical template path). |
   | B8 | `FRAGMENT_M2_FLOOR = 1.0` (m²) | `schedule_author.js:120` | `sequence_rules.json` | **Cross-ref, not new** — item 2's own prose already names it ("well above the 1.0m² fragmentation floor, per `_classFragmentation`'s own documented rule"). Changes durations by switching a class between count-priced and area-priced, so it *is* scheduling-relevant. Documented as measured, not invented. |
   | B9 | `BIG_ELEMENT_VOL = 1.556` (m³) | `schedule_gate.js:45` | `sequence_rules.json`, or leave in place | **Observability only** — gates the `§SUPPORT_UNCHECKED` log at `:1212`, touches no date, no duration (`:1209` says so explicitly). EXTRACTED p95 over 135,630 real elements with a "do not retune without re-measuring" warning. Listed for completeness; **recommend leaving it exactly where it is** — its comment is its provenance, and a JSON move would orphan that. |
   | B10 | Ordering sentinels `1e9` (`schedule_author.js:444`), `99` (`:574`) | as cited | — | Unranked-level / unknown-phase sort sentinels. Reported for completeness; **not** recommended for relocation (they are "sort last", not policy). |

   #### Group C — ALREADY DATA. Recorded so nobody "fixes" what is already correct.

   - `schedule_author.js:437` — `shiftSecs` **reads** `T.calendar.hours_per_shift`, with `24` only as
     a fallback. ✅
   - `schedule_author.js:438` — `minDays` **reads** `T.duration_rule.min_days`, with `1` only as a
     fallback. ✅ **Directly relevant to item 2**, which discusses `min_days=1` as though it were a
     code constant: it is not, it is already an editable JSON value. Raising it is a one-key edit —
     which does **not** make it a good idea (item 2's ⛔ DECISION rejects raising it on Prime Rule
     grounds), but the *mechanism* is not the obstacle.
   - `schedule_gate.js:1210` — `T.seq !== 1` ground exemption. **ALREADY TRACKED, `4D_MODEL_INTEGRITY.md`
     §I** row *"does T rest on soil?"* and §I.2. Cross-referenced, not re-opened.

   #### Separate findings — these are BUGS, not config-location questions. Named and NOT chased, per the spec.

   1. **`LEVEL_SCAN_MAX` exhausts silently and then commits an illegal placement.**
      `schedule_author.js:613` — `while (!fits(t, at) && guard++ < LEVEL_SCAN_MAX) at++;` — exits on
      guard exhaustion, and `:616` then **unconditionally** commits `t.sDays = at; t.eDays = at +
      t.days;`. That writes a placement which does **not** satisfy the crew cap. Worse, the only
      report (`:630` `capacity_levelled`) counts it as a *successful* levelling, because its test is
      merely `at > t.sDays`. Nothing anywhere distinguishes "found a fitting slot" from "gave up
      after 100,000 days." This is **PRIMAL LAW clause 4** (a pass that cannot report its own
      failure). A breach would eventually surface in `witness_4d_capacity_honoured.js` (which sweeps
      emitted times against `capacity_rule`), but with no pointer back to this cause. Not fixed here.
   2. **The `3` vs `1` crew fallback divergence (B4) is a latent 3x, structurally identical to item
      2's.** For any `_DEFAULT`/unnamed resource, `schedule_gate.js` solves at 3 crews and
      `schedule_author.js` prices the bar at 1 — the gate and the author disagree about the same
      cell by exactly 3x. Currently masked because all 10 named trades carry `max_crews`. Not fixed
      here; flagged because item 2 is already chasing a 3x that arose the same way.
   3. **`95` is an invented number (B5).** `time_machine.js:7992`. Every other constant in this audit
      carries a provenance comment; this one has none, and a real `rate_per_day` for all 10 trades is
      already sitting in `sequence_rules.json`. Prime-Rule-relevant. Not fixed here.

   #### Answer to the user's actual question ("are there others like this?")

   Yes — **eleven distinct constants, of which one (B1) is repeated 21 times and one (B2) 23 times.**
   But the systemic pattern is narrower and more useful than "constants are scattered": the failure
   mode is **not** that values live in code rather than JSON. It is **duplication of a value that
   already has a declared owner** — `28800` in 5 places, the `24` shift fallback in 4, `120` in 5,
   the crew fallback in 2 mutually-disagreeing forms, `seq<=4` in 21, the start date in 23. Every one
   of the three real defects above (and §GANTT_SHIFT_HOURS_DESYNC before them) is a *copy that
   drifted*, never a *literal that should have been a JSON key*. That points the remediation at
   single-source-of-truth, which is the same medicine §I's ownership table already prescribes for
   relations — the constants simply never got their own table. **Recommended order if this is ever
   actioned:** B1 (derive, no new key, largest blast radius), then B4 + B2 (real divergence, then the
   product-limiting one), then the A-family as ONE change or none at all.

**Separately, same day, same user concern:** a parallel task was dispatched to consolidate the
largest 4D prompt files (`4D_SCHEDULE_ARCHITECTURE_REDESIGN.md`, `TM_4D5D_VARIANCE_LANE.md`,
`RESUME_4D_TRUTH_AND_BE_HERE_WHEN.md`, and re-checking whether this file and `4D_MODEL_INTEGRITY.md`
themselves now overlap enough to merge) — on the user's own hypothesis that file bloat is a
contributing cause of drift. See whichever of those files carries the 2026-08-27 consolidation
commit for the result; not duplicated here.

## §FUTURE item 6 — ⛔ NEW (user, 2026-08-27, live editor test on HHS_Office_Federated): CPM-block
reason is computed and logged but never shown on screen

**The inline TM Gantt editor itself is confirmed working** — this is not a bug report about the
editor being broken. Live test evidence: dragging `TASK_Superstructure_Level_2` correctly clamps
against its dependency (`§GANTT_EDIT_CLAMP task=TASK_Superstructure_Level_2 requested=2026-09-04
clampedTo=2026-09-07 blockedBy=TASK_Superstructure_Level_1(FS)`), cascades ripple downstream
correctly (`cascaded=12`+ observed), and every edit persists (`§GANTT_EDIT_PERSIST ... ok=true`).

**The gap**: `blockedBy=TASK_X(FS)` is computed and printed to the console `§`-log every time a drag
gets clamped — but nothing surfaces it on screen. A user dragging a bar just sees it snap back with
no visible reason. Same shape as the day's earlier persist-fail fix (`§GANTT_EDIT_PERSIST_FAIL` went
from silent to a `_tmSay` toast, PR #1555) — this needs the identical treatment: when
`§GANTT_EDIT_CLAMP` fires, show the user the `blockedBy` reason (which task, which dependency type)
as an on-screen message, not just a log line. Find the `§GANTT_EDIT_CLAMP` call site (`time_machine.js`,
near the other `GANTT_EDIT_*` tags) and add the same toast mechanism already proven for the persist
failure — do not invent a new notification pattern, reuse `_tmSay`.

Not dispatched yet — queued alongside items 1-5.

## Note, same live test — a pre-existing named defect surfaced again, not new
The same session's log shows `§RETIME_OUTLIER_AUDIT outsideOldWindow=2 ... outliers ride outside
their bar` on a real edit — the log line itself says this is "the §S7 edit-path defect." Already
tracked elsewhere in this lane's history under §S7; recorded here only so a reader of this live test
doesn't mistake it for a new finding. Not re-opened, not re-scoped.

## §FUTURE item 7 — ⛔ CONSOLIDATED NEXT TASK (user-approved 2026-08-27), everything currently
queued from today's audit + build-up-animation threads, bundled for one properly-planned session

**MANDATORY STEP 0, before writing any code or running any dispatch: regain full context, then STOP
and pose a written plan for user confirmation before commencing anything below.** This is not
optional scaffolding — the whole reason this is bundled into one task instead of five scattered ones
is so the picking-up session sees the full shape before touching code. Read, in this order:
`4D_MODEL_INTEGRITY.md` §I.5 (the ownership-table audit and its evidence), the Stage 1/Stage 2
completion evidence (bim-ootb PRs #1561, #1562 — read the actual diffs, not just this summary), the
Stage 3 probe (PR #1563, not yet applied), and this file's §FUTURE items 2 and 6. Then write out: the
order you intend to do the items below in, which ones depend on which, and what witness/probe proves
each one before moving to the next. Post that plan and wait — do not proceed past it in the same
turn it's written.

### What's approved and ready to execute, once the plan above is posed
1. ✅ **DONE (bim-ootb PR #1567, merged branch pushed 2026-08-27) — §I.5c self-check predicate fix.**
   Both narrowing clauses dropped (`schedule_author.js:1345`,`:1412` — the `S.tz <= T.bz+GAP` upper
   bound that belonged only to `auditFloating`'s wall pool, applied here to every contact). Also
   registered `SupportSweep` in `witness_4d_template_instantiation.js`, which never ran the pass at
   all before this (`§TPL_LAYER_ORDER_FAIL`, silent no-op — confirmed live: baseline run showed
   `applied=0 moved=0 stillInverted=0 FAIL pass did not run` on all three buildings). MEASURED via
   the real witness, matching PR #1563's probe exactly: `stillInverted` Duplex 5, HHS 9, Hospital
   794 (cures 84–93% of real inversions). Task grid membership and `totalDays` byte-identical on all
   three (13/13, 50/50, 318/318) — confirmed both via the witness and a direct `materializeZones`
   membership check, not assumed. `witness_gantt_edit_coherence` (doesn't register `SupportSweep`)
   stayed 11/0, unaffected — confirms the change is inert wherever it isn't wired in. Full
   72-witness headless suite: 59 green, 6 new_red, all 6 verified pre-existing on unmodified
   `origin/main` (isolated in a clean throwaway baseline worktree, then removed) — zero regressions
   caused by this change. `probe_tpl_layer_bearing_scope.js` (PR #1563) now throws its own designed
   guard ("the predicate moved") — retired by the fix landing, not deleted.
2. ✅ **DONE (bim-ootb PR #1568, stacked on #1567) — dead-air gaps in `remapSolveToTasks` closed.**
   Sequenced after item 1 as required: re-measured dead-air post-item-1 first (still present,
   3-4/20 bins on Hospital/HHS's widest overlaps — item 1 didn't remove it, confirming the two are
   independent as predicted). Replaced the per-layer affine map with duration-weighted contiguous
   tiling (real solve order kept via sort, but each element's WIDTH in the band is its own duration
   weight, not raw solve-magnitude) — tiles every populated band edge-to-edge, so dead air is
   structurally impossible. MEASURED (`scripts/probe_tpl_parallel_reveal.js`, 3 buildings): dead-air
   slices in the 3 widest cross-level overlaps dropped 3-4/20 → **0/20 everywhere**. Task grid
   membership/`totalDays` unchanged (42/67/318, 20/30/50, 20/29/13). Found+fixed one real regression
   in the same pass (`witness_4d_movie_binds_bars`'s `remap-preserves-solve-order` — needed the same
   guid tie-break the witness itself uses for `solveStart` ties). Full suite: 58 green, 7 new_red,
   all 7 verified pre-existing (isolated against a clean `origin/main` baseline) — **including
   `witness_day0_integrity.js`, which surfaces a real, pre-existing DAY-0 regression unrelated to
   this fix or item 1**: it reproduces the identical `claims=13 PASS=4 FAIL=5 INCONCLUSIVE=4` on
   unmodified `origin/main` with a fresh cache. The "PASS" the FIRST full-suite sweep (item 1's own,
   see item 1 above) showed for this witness was a cache-miss artifact, not a real baseline — its
   cache for Hospital/HHS/Duplex didn't exist yet at that point in the session. **This means
   `4D_MODEL_INTEGRITY.md`'s "DAY-0 integrity is at ZERO / 14 PASS 0 FAIL 2 INCONCLUSIVE" headline
   is now STALE against current `origin/main`** (something between that measurement's commit and
   `a2e582b` regressed it) — flagged here for whoever next owns that lane; NOT fixed, NOT re-derived
   further, out of scope for §FUTURE item 7 stages 1-2.
3. ✅ **DONE (measured + RECOMMENDED, nothing applied) — Stage 4, bim-ootb PR #1627** (probe only,
   2026-09-02, queue item B-2). **The recommendation is NOT a silent pick and the code is unchanged.**
   Full evidence in `4D_MODEL_INTEGRITY.md` §I.5d's ✅ block. Headline: the two judges' offender sets
   are largely DISJOINT (Hospital onlyFloating 332 / onlyMidair 395; Terminal 209 / 474), so the AND
   is redundant in neither direction; across **32 simulated drags** `floatingOnly=0` and
   `midairOnly=0/0/2/3`, so the refusals are carried by `_midairAudit`; and the decisive number,
   **`lockVerdictFlipsIfCopy1GetsTheBound = 0/32`** — porting §S64's bound would change no verdict
   while ADDING 448 Hospital offenders (82% of the bound-violating elections are `IfcColumn`, not
   walls; §S64's bound is sound only in its own wall-pool context). **RECOMMEND: keep the AND, port
   nothing, fix the stale §I ROW** (done). No observability gap — `§GANTT_LOCK_BREACH` already prints
   both deltas separately.
4. ✅ **DONE — Stage 5, bim-ootb PRs #1628 / #1629 / #1630** (2026-09-02, queue item B-2). Per item:
   - **four floating judges** — named with file:line **and the LAYER each judges**
     (`4D_MODEL_INTEGRITY.md` §I.5e ✅ block). Two corrections: copy 3 has **FIVE** sites, not three,
     and **the layer is the CALLER's, not the judge's** — the same function scores PLAYED at
     `time_machine.js:4431`/`:4419` and RAW-SOLVE / CPM-DISPLAY at `:5109`/`:4058`. Copies 3 and 4
     deliberately NOT consolidated (copy 4 is a declared independent judge; copy 3's five sites
     already call the real graph and one uses the sliced `time_machine.js` copies on purpose).
   - **3 rival storey-suffix rules → PR #1629.** `collapsePhase` made a strict SUPERSET of
     `import_worker.js normalizeStorey` (`T.O.S.`, the one divergent token). Zero fleet change proved
     twice: 623 real storey names across seven DBs, and a full `materializeZones` A/B with
     byte-identical grid hashes. ⛔ Terminal's `Ceiling Level NN` PREFIX form (673 live elements) left
     alone — renaming live bands is a modelling decision, not a de-drift.
   - **untagged 3rd task-grid producer → PR #1628.** `materializeDefault` emits `§TPL_MODEL
     model=default-materialize`; log-only, all four producer grid hashes byte-identical to main.
   - **re-typed constants → PR #1630.** 2 consolidated, **3 blocked by a MEASURED mechanism** (the
     text-slicing witness family — `witness_og_guard_bearing_bound.js` supplies a STUB
     `ScheduleGate: { CELL: 4 }`), **7 stale `SEQUENCE_DEFAULT` literals NOT corrected** because that
     is a duration change and not a de-drift. A drift-detector witness now covers what could not be
     consolidated.
5. **§FUTURE item 6 — CPM-clamp on-screen feedback** (queued, low risk, independent of 1-4): surface
   `blockedBy=TASK_X(FS)` as a `_tmSay` toast when `§GANTT_EDIT_CLAMP` fires. Can be done any time
   relative to the others — no shared code path with items 1-4.

### Standing constraints, apply to every item above
Numeric before/after proof, never visual. Stop and report — do not push through — if any item's
measured scope turns out bigger than described here (same rule that already worked twice today).
Commit/PR per item, not one giant batch. Update this section in place marking each item done with
evidence when it lands.

### §STAGE45_PLAN — MANDATORY STEP 0 discharged (queue item B-2, 2026-09-02)

✅ **EXECUTED AND CLOSED, same day.** Every row below landed as its own PR off fresh `origin/main`
(none stacked, so they merge in any order): **#1627** Stage 4 probe (measure-only) · **#1628**
§TPL_MODEL third producer · **#1629** §STOREY_SUFFIX_PARITY · **#1630** §RETYPED_CONSTANTS. The
cache did NOT need rebuilding — code key `490944538d2f` was already CURRENT for all four buildings,
contrary to the dispatch's warning. **No per-building constant and no branch on a building name was
introduced**: the only building names added anywhere are inside comments recording a measurement.
Two deliberate NON-actions, both on evidence and both reported rather than pushed through: §S64's
bound is NOT ported into `_midairAudit` (0/32 verdict flips, +448 Hospital offenders), and the seven
stale `SEQUENCE_DEFAULT` literals are NOT corrected (a duration change, not a de-drift).

**Step 0 read, in the order the section demands, before any code:** `4D_MODEL_INTEGRITY.md` §I.5
(whole sweep, §I.5a–§I.5k, plus §I.1/§I.2 and the §I ownership table incl. the PLAYED-layer row);
the actual DIFFS of **#1567** (`cda73c17`) and **#1568** (`53f7f113`) — not their summaries; the
Stage 3 probe **#1563** (`3c4b6822`, `viewer/tests/probe_tpl_layer_bearing_scope.js` — its
guard-throws-if-the-predicate-moved design is what the fix retired); and §FUTURE items **2** and
**6**. Queue context read too: `AGENT_QUEUE.md` §SESSION 2026-09-02 (A-0/A-9/#1605/#1607/#1610 —
**the movie plays kernel_ops, never `remapSolveToTasks`'s `displaySchedule`**), B-1/#1615, #1551
(merged `59736505`), #1625.

**Baseline for every number below:** `origin/main` @ `bc470d71`; `~/.cache/bim4d` code key
`490944538d2f` is CURRENT for all four buildings (Duplex / HHS_Office_Federated / Hospital /
Terminal, 119,568 elements) — **no rebuild needed**, contrary to the dispatch's warning. No bake,
no browser: cache + node probes only.

#### Order, dependencies, and the witness/probe that proves each step

| # | item | depends on | what proves it BEFORE moving on |
|---|---|---|---|
| P0 | this plan | — | written here, in place, before any edit |
| S4 | **Stage 4 — edit legality (§I.5d).** `verifyGanttIntegrity()` (`time_machine.js:4395`) ANDs `ScheduleGate.auditFloating` (`:4419`) with `_midairAudit` (`:4431`). RECOMMEND ONLY — no silent pick. | P0 | a NEW probe measuring the two judges over the SAME population on all four buildings: (a) each judge's count and offender SET, (b) set overlap/disjointness, (c) **the decisive number — what fraction of `_designatedSupport`'s ELECTED supports would be rejected by §S64's `S.tz <= T.bz + GAP` bound**, i.e. the false-positive exposure `_midairAudit` carries and `auditFloating`'s wall pool does not, (d) a simulated EDIT (move a task earlier) and the DELTA each judge reports, since the gate is a delta gate not an absolute one. Recommendation is written here with those numbers; **code change, if any, is proposed not applied.** |
| S5a | **four `floating` judges named** with file:line **and the LAYER each judges** (A-9's warning: some disagreement may be layer, not physics) | S4's probe (same harness) | the §I row is rewritten to carry all four + their layer; no code consolidation unless a pair is proven byte-equivalent |
| S5b | **`materializeDefault` — tag the 3rd task-grid producer** (§I.5g) | none | purely additive `§TPL_MODEL model=default-materialize` line; witness asserts the line exists on the `materializeDefault` path and that `witness_gantt_edit_coherence`'s third state stops being unattributable. Task grid / totalDays byte-identical (nothing but a log line added). |
| S5c | **3 rival storey-suffix rules** (§I.5f) | S5a (same file family) | the ONE divergent token is `T.O.S.` — rule 2 (`import_worker.js` `normalizeStorey`) strips it, rule 1 (`schedule_gate.js:424` `collapsePhase`) does not, so the merge map's key cannot match the element's band key for such a name. §I.5f measured the fleet population as **EMPTY**. Proof required: (i) re-measure that population is still empty on the four cached buildings, (ii) if empty, aligning rule 1 to rule 2 is a **zero-fleet-change** de-drift — prove byte-identical band/task/totalDays, plus a RED control on a synthetic `Level 2 T.O.S.` that goes red without the fix. **Rule 3 (`panels.js:2042` `collapseLevel`) is a DIFFERENT concern (WBS task names, `Level`-anchored) — §I.5f already says so; NOT consolidated.** |
| S5d | **`SEQUENCE_DEFAULT` ×7** (§I.5i) | S5b/S5c independent | every copy is the PRE-§S65 object (`resource:null`, legacy `phase:'Architecture'`). Prove first whether any is REACHED: `cache_4d_run.js` passes `defaultRule: sb.SEQUENCE_DEFAULT`, so the fleet path does not reach the literal. If unreached ⇒ correcting the literals is a pure de-drift with a provable zero delta; if reached anywhere ⇒ it changes durations, which is a **calibration-lever-class change and is REPORTED, not shipped**. |
| S5e | **`EPS`/`GAP` re-typed** (§I.5b) | S5d | consolidate only sites where the same statement ALREADY reads the module (`time_machine.js:5133` reads `ScheduleGate.CELL` then hand-types EPS/GAP). ⚠ **The B-3 slicing trap governs here**: several witnesses slice one function out of a file as raw text and eval it standalone, so a symbol declared elsewhere in the file is `undefined` in that sandbox (this is why §FUTURE-5A's A7/B1 were reverted same-day). Any site inside a sliced block is LEFT with its literal and a comment saying why. `level_deriver.js:49`'s `EPS` is §I.5b's own OPEN QUESTION (different concern) — **not touched**. |

#### Standing constraints this plan adopts verbatim
- **No per-building constant, no branching on a building name** (user, 2026-09-02). Class + name
  pattern is data-driven and allowed; "if building === X" is not. Audited clean before starting.
- Numeric before/after, never visual. Commit/PR per item, not one batch.
- **Stop and report if any item's measured scope exceeds the brief** — that escape clause has
  fired twice on this lane and was right both times.
- Do NOT touch: `bar_model.js` (dead, hook-blocked), `viewer/rates/4D_policy.json` (deleted by
  #1617, do not resurrect), the calibration lever (`_installSecs` 28800 / `shiftHours` 24 /
  `min_days`), Alt+C / film files, `viewer/effects.js` + lighting, geometry/tessellation.

## §BUILDING_SCOPE_FLOOR — ✅ DONE (bim-ootb PR #1569, stacked on #1568/#1567), 2026-08-27, NOT part
of the plan above — surfaced from a live-log investigation mid-session

**User, reading a live Terminal console log: "why does Terminal substructure not finish first
before anything else?"** then, after the mechanism was traced: **"isn't this solved already? why
keep creeping back?"** — the answer is in `4D_SCHEDULE_PERFECTION.md` §CPM_GENERATOR_UPSTREAM_SPEC
(2026-08-15): the identical question was asked and scoped then, at the OLD `deriveZones` layer,
and never implemented (awaiting user go). The authoring layer was later replaced entirely
(§S68/§S69, 2026-08-22/23, the TEMPLATE PATH ruling) — a deliberately independent, declared task
grid, not derived from the solve — which reintroduced the same SHAPE of gap in a new mechanism.
The repair layer (`support_sweep.js` `_cjpJudgeParity`, `WINDOW_BLOCKED`) already refuses to fix
this by design, in its own comments, since a 2026-08-13 attempt to let repairs cross task-window
boundaries caused a 100-300 day desync regression — it explicitly names the fix as
"§CPM_GENERATOR_UPSTREAM_SPEC's territory."

**Root cause, traced to `instantiateTemplate` (`schedule_author.js` ~line 486-550):** a
`scope:"building"` phase (Substructure) instantiates exactly ONE task, filed under whichever
level sorts first by elevation rank. The `within_level` FS edge to its successor phase only fires
via `prevOnLevel`, which resets to `null` at the top of every OTHER level's own loop — so the
edge only ever reaches the one level the task happens to land on. **MEASURED on Terminal before
the fix: the 77-task graph was 5 disconnected chains, only 5/77 tasks reachable from Substructure**
(confirmed via the persisted `task_sequences` table, forward reachability, node-side — no browser,
no screenshot, per standing WITNESS rule). 3 tasks (513 elements) started at literal day 0 with
zero real dependency — the "Day 0 rushing" the user separately flagged from the same log.

**Fixed, generally — not a Terminal patch.** For every phase on every level, if its declared
`within_level` predecessor has `scope:"building"`, apply that predecessor's FS floor (and a real
edge) regardless of which level the building-scope task is filed under. Reads the template's own
declared `scope`/`within_level` fields; nothing keys off a building name or Terminal's specific
storey soup — generalizes to any IFC model with a `scope:"building"` phase. Skipped where the
ordinary edge already covers the pair (no duplicate constraint). Purely additive.

**MEASURED, full 7-building fleet, before → after (user's constraint: "as long not impact the
framework model at all" — verified, not assumed):**

| building | reachable from Substructure | totalDays | tasks with sDays/eDays changed |
|---|---|---|---|
| Clinic | 35/35 (already clean) → 35/35 | 111→111 | **0** |
| Duplex | 17/20 → **20/20** | 13→13 | (all newly-connected, no window shift) |
| HHS | no Substructure (legit, template's own `_empty_ok`) → unaffected | 50→50 | **0** |
| Hospital | 42/42 (already clean) → 42/42 | 318→318 | **0** |
| JKR | 39/67 → **66/67** | 56→55 | small |
| LTU_AHouse | 62/62 (already clean) → 62/62 | 788→788 | **0** |
| Terminal | 5/77 → **75/77** | 97→97 | 2 previously-day-0 tasks (492 elements) now correctly gated at day 2/4 |

Buildings already correctly connected are **byte-identical** — verified per-task, not just
aggregate totalDays (0/139 tasks differing across Clinic+Hospital+LTU+HHS). Full witness suite:
59 green, 6 new_red, all 6 previously verified pre-existing (see PR #1567/#1568's own sweeps).

**⛔→✅ The residual above is CLOSED — bim-ootb PR #1570 (stacked on #1569/#1568/#1567),
2026-08-27, same day.** User caught a live instance of the exact residual named above from real
playback (not eyeballed by Claude — the user's own report, verified node-side): 193
`IfcLightFixture` (MEP Final) on Terminal's "Ceiling Level Kedai" landing on day 1 of a 97-day
programme, chained off the orphaned Architecture Envelope root this section already named.

**The first attempt (searching backward through lower-RANKED levels for the nearest instance of
the predecessor phase) was itself rejected before shipping** — user: *"we dont do hardcoded fix..
but general rules.. phase of MEP is already known, oft repeated."* Level-rank adjacency is exactly
the proxy class `4D_MODEL_INTEGRITY.md` §E already names as unreliable (nearest-by-elevation
picks a coincidentally-early unrelated level when storey names are fragmented/duplicated, which
Terminal's federated ladder guarantees). Measured before rejecting: moved the 193 fixtures day
1→4, real but visibly still wrong relative to siblings (Ceiling Level 01/02/03 all land their own
MEP Final around day 82-90).

**Replaced with §PHASE_WATERMARK_FLOOR — no level/storey reasoning at all.** Track the
latest-finishing task seen so far for each phase NAME as `instantiateTemplate` walks levels
bottom-up (one running "watermark" per phase, updated on every task creation); when a level's own
chain has nothing local behind it (`prevOnLevel === null`), float its root against its declared
`within_level` predecessor's watermark directly. This SUBSUMES §BUILDING_SCOPE_FLOOR too (a
building-scope phase's one task simply updates the watermark like any other — no special case
needed) — one mechanism instead of two, and it needs nothing beyond what `within_level`/`scope`
already declare. **MEASURED, full closure:** Terminal 77/77 and JKR 67/67 now reachable from
Substructure, **exactly one root each (Substructure itself, correctly at day 0)** — the 193
fixtures moved day 1→6. Buildings that were already healthy (Clinic/Hospital/LTU_AHouse/HHS/
Duplex) stayed **byte-identical**, verified via two clean-checkout worktrees (0/159+42+56+40+40
tasks differing — safer than `git stash`, which a earlier pass discovered is REPO-WIDE shared
across every worktree of `bim-ootb`, not worktree-local, and collided with an 8-month-old
unrelated stash entry mid-measurement; recovered cleanly, no data lost, method changed for good).
Full witness suite clean throughout (59 green, same 6 pre-existing new_red each pass).

### ⚖ STANDING RULE (user, 2026-08-27) — sequencing policy lives in `4D_template.json`, never in JS
User's direct question, verified before answering: *"Is this easily set in the JSON?"* — yes,
already was: `phases[].scope` (`"building"` vs `"level"`) is the ONLY thing that decides whether
a phase is a single whole-building gate or repeats per floor, and `§PHASE_WATERMARK_FLOOR`/
§BUILDING_SCOPE_FLOOR read that field directly — no phase is named in the fix code (not
`"Substructure"`, not `"MEP Final"`). **Going forward, this is the bar for any future scheduling
CODE change on this lane**: if the change encodes a POLICY decision (which phase gates which,
what scope a phase has, what a duration basis is, what a crew cap is), it belongs as a field in
`4D_template.json`/`sequence_rules.json`, read by name-agnostic code — never as a hardcoded
phase/building name inside `schedule_author.js`/`schedule_gate.js`/`time_machine.js`.

**"4D and 5D" confirmed by the user, same conversation: "5D means rates/resources/costing/
weightage that influences work speed."** That is exactly `§FUTURE-5A`'s already-written scope —
`sequence_rules.json` `LABOR_RATES` (productivity, `max_crews`, `rate_per_day`) plus the regional
rate packs, all merged into `rates.js` — and the 11-constant inventory above (28800 install-basis
duplicated 5x, crew-cap disagreeing 3-vs-1 between `schedule_gate.js`/`schedule_author.js`, an
uncredited $95/day fallback, `LEVEL_SCAN_MAX`, `phaseDays=30`, the fragmentation floor) is the
concrete list of where 5D policy is currently hardcoded instead. **Why this matters, in the
user's own words: "editable so that user can control the speed of construction."** Both
`4D_template.json` and `sequence_rules.json` are already wired into this project's live JSON
editor (`4D_template.json`'s own header: *"Registered like every other project JSON… editable"*)
— a value trapped in JS is invisible and unreachable to that editor; the SAME value as a JSON
field is something a user can tune without a code change or a session like this one. That is the
concrete payoff of the rule above, not just tidiness. `§FUTURE-5A`'s 11 items are the standing
punch list for closing this gap on the 5D side; none applied yet, still needs its own pass.

**Also asked and settled the same conversation, recorded so it is not re-litigated:** should
Substructure-style whole-building gating extend to a strict global queue — all floor slabs
everywhere, then all columns everywhere, then all walls, then all openings, whole-building ARCH
before any MEP? **No — already tested and measured worse.** `4D_MODEL_INTEGRITY.md` §A's own
sandbox test (yesterday, 2026-08-26): forcing phase-major order (all-Superstructure-before-
all-Architecture) put an L2 slab before the L1 wall it rests on — 17 violations, worse than
level-major's 10. Real construction doesn't serialize per-phase across a whole tower either
(no floor-by-floor parallelism = far slower); the wave this codebase already models
(`across_levels`, same phase one floor at a time with a lag) is the correct shape. Substructure
is the ONE genuine whole-building exception because the template declares it `scope:"building"`,
not because "sub-first" generalizes to every other phase.

## §PHASE_WATERMARK_FLOOR — ✅ SUPERSEDES §BUILDING_SCOPE_FLOOR (bim-ootb PR #1571), same day,
found from a real user-reported live-playback bug the narrower fix missed

**User caught it directly from real playback, not eyeballed by Claude — reported "lots of light
fixtures midair on Day 3," verified node-side against real `materializeZones` output.** Traced to
`TASK_MEP_Final_Ceiling_Level_Kedai` (193 `IfcLightFixture`) at `sDays=1`. Two intermediate fixes
were tried and REJECTED before this one landed, both instructive:
1. **First attempt — search backward through lower-RANKED levels for the nearest instance of the
   predecessor phase.** Moved the fixtures day 1→4, real but user rejected it before shipping:
   *"we dont do hardcoded fix.. but general rules.. phase of MEP is already known, oft repeated."*
   Level-rank adjacency is exactly the proxy class `4D_MODEL_INTEGRITY.md` §E already names as
   unreliable — Terminal's fragmented/duplicate storey names make "nearest" pick a coincidentally-
   early unrelated level, not the real physical predecessor.
2. **Second attempt — §BUILDING_SCOPE_FLOOR generalized to `!prevOnLevel`, no level search at
   all**, tracking a running watermark per phase name instead. Moved the fixtures day 1→6 — but
   user, unprompted, spotted a real logical gap: *"It shows u lack in set theory"* → *"set theory
   means not breaking any other super set."* **Verified node-side, not guessed: `!prevOnLevel`
   and "my own declared predecessor has no local instance" are DIFFERENT SETS.** Terminal's
   "Ceiling Level Kedai" has local Architecture Envelope (so `prevOnLevel` is non-null when MEP
   Final's turn comes) but NO local Architecture Closeup — MEP Final's real predecessor. The
   narrower condition missed this because it checked "is ANY phase present locally" instead of
   "is MY declared phase present locally." A `§DEBUG_WM` trace confirmed it precisely:
   `wlPred=architecture_closeup localPredExists=false wmTaskEDays=undefined` — the watermark
   lookup was correct in shape but the GATE deciding when to consult it was the wrong set.

**Fixed: gate on `taskAt[predName + '||' + lv]` (does THIS phase's OWN declared predecessor have
a task on THIS level), not on `prevOnLevel`.** Subsumes the `scope:"building"` case for free (a
building-scope phase's one task updates the watermark like any other task — no special case
needed) — one mechanism, not two. No level/storey reasoning anywhere.

**MEASURED, full fleet, before (§BUILDING_SCOPE_FLOOR only) -> after — bigger and MORE severe than
either narrower fix found, because this is the first version that actually checks the right set:**

| building | reachable | totalDays | what moved |
|---|---|---|---|
| Clinic | 35/35 -> 35/35 | 111->111 | 1/35: `Finishes` on `Roof Main` day 38->110 — was landing near project START instead of the true end |
| Duplex | 20/20 -> 20/20 | 13->13 | 0 changed |
| HHS | no Substructure (legit) | 50->50 | unaffected |
| Hospital | 42/42 -> 42/42 | 318->318 | 0 changed |
| JKR | 66/67 -> **67/67** | 55->64 | residual root closed |
| LTU_AHouse | 62/62 -> 62/62 (already "fully reachable" under the narrower fix) | 788->**799** | **18/62 tasks were still wrong** — `Architecture Closeup` on `"VÅNING 2"` day 46->337, `MEP Final` on `"Storey 3"` day 368->754: severe pre-existing chain-bridging errors neither narrower fix could see |
| Terminal | 75/77 -> **77/77** | 97->98 | residual root closed; MEP Final `Ceiling Level Kedai` floored against Closeup's real day-88 watermark |

**Fleet now has exactly one root per building with a Substructure phase (Substructure itself,
correctly at day 0) — zero orphaned chains anywhere.** Full witness suite clean throughout (59
green, same 6 pre-existing new_red every pass, verified pre-existing on unmodified `origin/main`).

**Method note, worth keeping:** the eventual fix came from re-reading the CODE'S OWN CONDITION
against the declared data model after the user's abstract prompt ("set theory... supersets") —
not from any visual, not from guessing. `§DEBUG_WM`/`§DEBUG_ALL_LEVELS` traces (temporary,
inserted and removed same session) confirmed the exact mechanism before committing. Also
confirmed, same trace: "Ceiling Level Kedai" ranks BELOW all levels with real Architecture Closeup
work (rank 5 vs Aras Tanah@6, Aras 01@10, ...) — a thin, sparse space (21 railings/proxies + 193
fixtures, no floor slabs) — which is why even the CORRECTED watermark had nothing to float against
until this fix (the watermark for "Architecture Closeup" was genuinely empty at that point in the
walk, honestly, not a bug). Whether that RANK itself is correct is a separate, already-documented,
NOT-fixed-here question — `4D_MODEL_INTEGRITY.md` §I.3/§C ("level bucketing is INFERRED, not
read") and `LevelDeriver` (built, flag-off per §I.3a). Not touched this pass.
