# ARCHIVED 2026-08-19 — §S23 · §S24 · §S24_TRIAGE · §S25 · §S25_PROTO

Superseded design trail, moved out of `prompts/4D_GANTT_TM_REFACTOR.md` to keep the live file
readable. **Nothing here is a build target.** Kept verbatim because the reasoning is cited by the
sections that replaced it:

- **§S23** — lane process hardening. Proposed, never go'd.
- **§S24** — local phase-gate shell. ⛔ SUPERSEDED BY §S25 the same day.
- **§S24_TRIAGE** — the nine-defect review that killed §S24. Its §S24_TRIAGE.4 baseline table is
  still cited by §S26 and is reproduced there.
- **§S25** — the layer contract. Its §S25.5 deadlocked on first run (§S25_PROTO C1-C2).
- **§S25_PROTO** — §S25 built and measured; the run that exposed the deadlock.

Live file: `prompts/4D_GANTT_TM_REFACTOR.md`. §S25_REVIEW (which reviewed this trail and produced
the one ship-ready change) stayed in the live file deliberately.

---

# §S23 — LANE PROCESS HARDENING (2026-08-17, meta-review finding — PROPOSED, NOT GO'D, do not
# start without an explicit go). Not a schedule/rendering fix. The user asked, after S1-S22, "what
# is missing or lacking in this lane's design that causes constant session drift — is it the
# language or framing?" This is that review's answer, turned into a spec, so it doesn't evaporate.
# ⚠ Was briefly swept into the S1-S22 history archive by a housekeeping pass (2026-08-17/18) despite
# being "proposed, not go'd" — not a closed item, restored here 2026-08-18. Archiving is for DONE
# work; do not re-archive this section until Parts A-D below are actually shipped or explicitly dropped.

**Verdict the review reached:** drift here is mostly ARCHITECTURAL (a real 6-layer pipeline: raw
engine → `CpmSchedule.run` E1-E5 → task-window authoring on a *separate real-calendar clock* →
`kernel_ops` physics timestamps on the TM's *own zero-anchored clock* → render/visibility/xray/DLOD
→ Gantt-drag edit commit — §S22's bug was those two clocks colliding), not sloppy prose — this
file's discipline (dated sections, `§`-log evidence, retractions kept verbatim, `§PATHS NOT TO
TAKE`) is already tight. But one language-level lever DID measurably work: specs that bake an
explicit "if X doesn't hold, STOP — don't force" clause into the SAME paragraph as the ask (§S22's
"if none of the 3 candidates reproduce, report, don't force a fix onto the wrong one") prevented the
next drift instance; specs without one (§S13.6, before that discipline existed) didn't. Four parts,
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

**Part D — verify code-behavior claims against a fresh read, not memory (2026-08-18).** A session
narrated the E3 cycle-breaking mechanism from memory, unread — correct by luck, only confirmed by an
outside check, not itself. Rule (in `CLAUDE.md` Standing Rules, general, not lane-specific): before a
code claim justifies a decision — dispatch, "it's proven" — re-read the file:lines and cite them,
unless already read this turn. Gated at the decision point, not every mention, so it can't become
ceremony. **Confirmed firing correctly same day:** the fork's "carrier-above has no distance cap =
false-support artifact" claim got re-checked against the actual code before being reported settled —
found a pre-existing, deliberate 2026-08-15 design decision (uncapped distance is correct for hung
MEP, tested and chosen on purpose) the fork's framing had missed. Sent back to reconcile instead of
reporting a half-picture. This is Part D working, not a new open item.

**Acceptance:** all four parts are documentation-only — no code, no witness, no fleet-probe rerun
needed. "Done" is the map existing and being accurate to what S1-S22 already measured, the
catch-all clause being added to §DISPATCH, one worked example of the inline-STOP-AND-REPORT
convention on the NEXT stage spec written after this one, and the Part D re-read-and-cite reflex
demonstrably applied at least once more without the user having to ask for it.

**STOP-AND-REPORT if:** Part A's layer map can't be extracted cleanly from what's already measured
in S1-S22 (i.e. it would require guessing at a layer nobody has actually profiled yet) — report
which layer is unclear, don't invent its behavior to complete the table.

---

# ⛔ SUPERSEDED BY §S25 (2026-08-18, same day) — DO NOT IMPLEMENT §S24.3. Kept verbatim as the record
# of how §S25 was reached; §S24_TRIAGE below is the review that superseded it. If you are here to
# build, go to §S25.
#
# §S24 — ARCHITECTURE SPEC: LOCAL PHASE-GATE SHELL, replacing whole-graph Tarjan cycle-breaking
# (2026-08-18, PROPOSED, NOT GO'D — do not implement without an explicit go). A new session must
# triage this spec deeply, end to end, BEFORE any code is touched. If anything below is wrong,
# incomplete, or contradicted by re-checking the code, STOP and report it — do not patch around a
# spec gap silently. Correctness and completeness of the SPEC come first, per this project's own
# Spec-First rule; nothing here has been implemented.

## §S24.1 — Problem statement (real numbers, all measured today, not estimated)

`viewer/cpm_schedule.js` (PR #1396, days old — NOT the same age as the rest of this feature) builds
ONE combined graph across an ENTIRE building — every element, every physical-support edge (E1/E2),
every phase/storey ordering edge (E3/E4/member) — in one shared adjacency structure, then runs Tarjan
SCC over the WHOLE thing. When Round-1 (`solve()`, lines ~424-440) finds a multi-node component, it
drops EVERY E3/E4/member edge touching ANY node in that component — not just the specific edge(s)
that actually close the cycle.

Measured on Terminal (`Terminal_meta.db`, 48,428 elements, 48,513 graph nodes):
- The Ground-Floor Substructure→Superstructure gate fails: all 56 Superstructure elements at that
  storey start (earliest day 15.47) before Substructure fully finishes (day 46.22) — a −30.74 day
  violation, 56/56 offenders, zero exceptions.
- Traced to: the Substructure milestone for Ground Floor sits in a pre-drop SCC of **45,182 nodes —
  93% of the entire graph.** Next-largest component anywhere is size 3.
- Restricted to physics-only edges (E1+E2), the largest genuine cycle anywhere in the whole building
  is **size 5**. 0/56 of the offending columns have any physics-only path back to their own
  milestone's ancestors — they have NO conflict of their own.
- Cause: E4 (storey-band hammock) edges alone number **79,011 — more than the building's element
  count.** That density, combined with a handful of scattered, genuinely-real 3-5-element physics
  knots elsewhere in the building, is enough to glue 93% of the graph into one shared component.
  Round-1 then wipes the phase/storey ordering safety net across that whole component, not just near
  the real knots.
- **Tested and REJECTED**: swapping the E4 grouping key from a derived Z-height band to the real,
  now-patched storey identity cut E4 edges 40% (79,011→47,702) but did NOT shrink the specific giant
  component (45,182→45,558, slightly BIGGER) and did NOT fix the violation (still 56/56 offenders).
  **This rules out "wrong grouping" as the cause** — the failure is the algorithm's granularity
  (whole-SCC blanket drop), not which edges feed it.

## §S24.2 — Precedent this spec is built on, not invented

`viewer/schedule_gate.js` (PR #67, 2026-05-30, ~2.5 months before this spec) already solved the same
CLASS of problem — floating beams — with an explicitly **local, no-shared-graph** design: *"an
element cannot start until the structure topping out within ±0.5m of its base_z is complete... No
CPM/deps."* Verified on real Hospital data at full scale (63,415 elements): floating beams 1128→0,
clean. That design cannot produce today's failure mode BY CONSTRUCTION — there is no shared graph
node for an unrelated local conflict anywhere in the building to collapse through.

## §S24.3 — Proposed architecture

**Core insight:** phase order is a FIXED, KNOWN, small sequence (`TIER1_ORDER`: Substructure →
Superstructure → Architecture, then Tier-2 phases after Tier-1 completes) — not a general graph
requiring cycle detection. It can be computed as a bounded, sequential forward pass instead of a
whole-building shared graph.

**Step 1 — physical support, local, per-element, UNCHANGED.** `designatedSupport()`'s bearing-
below/embedded/carrier-above logic plus §GROUNDED_NEVER_HANGS (grounded elements never get a
carrier-above fallback) is already correct and already local — it does not participate in today's
failure and does not need to change. Keep it exactly as-is.

**Step 2 — phase/storey group finish times, computed as a bounded aggregate, NOT a graph edge.** For
each `(level, phase)` group, in fixed `TIER1_ORDER` sequence (then Tier-2 after Tier-1 completes):
compute the group's finish time = MAX(finish time of every member). A member's own finish time comes
from (a) its Step-1 local physical-support constraint, and (b) the PRECEDING phase-group's
already-computed finish time (a plain number by this point, not a live graph node). Because phase
order is fixed and processed strictly in sequence, group N's gate is always a known constant before
group N+1 is computed — no backward edge, no cycle possible, by construction. Storey/band gating
(today's E4) is the same shape one level up: process levels in real-elevation order (§S24.4 below),
each level's group finish time gates the next level's same-phase group, again a sequential number
comparison, never a shared graph edge.

**Step 3 — narrow, LOCAL override for genuine physics-vs-phase-order conflicts.** For an element whose
Step-1 support constraint would force it earlier than its Step-2 phase gate allows: check ONLY that
element's own direct support relationship against ONLY its own phase gate. If forcing the phase gate
would contradict that element's own physical reality (the bracket-on-wall / hung-MEP / grounded-root
shape already characterized in this file), relax the gate for THAT element alone — matching the
originally-intended narrow exception ("physical support absolute, phase order dropped only for the
specific element(s) genuinely caught"), never for anything it happens to share a milestone with.
This is a per-element numeric comparison (two already-computed times), not a graph traversal — it
cannot cascade to unrelated elements because there is no shared component for it to cascade through.

**Why this can't reproduce today's failure:** there is no whole-building adjacency structure and no
Tarjan pass over it. A local conflict for element X is resolved by comparing two numbers belonging to
X; it has no mechanism to reach, let alone drop a gate for, element Y elsewhere in the building.

## §S24.4 — Known sub-problems this spec must also close, not defer

- **Federated pseudo-level name duplicates are real and wider than previously scoped.** Confirmed
  today: 8 near-duplicate storey-name pairs building-wide on Terminal (not just the known Kedai/
  Jalan/Tanah cluster), ~0.15m apart at every level from ground to roof. The sequential level-order
  in Step 2 must collapse these deliberately (by real elevation proximity, a small explicit tolerance
  band) — NOT accidentally via a derived Z-band the way the current code does. Tested today: treating
  them as fully separate does NOT create a false gate between pairs (checked, 8/8 clean) — so
  collapsing is a cleanliness/precision improvement here, not a correctness blocker, but the
  triaging session must re-verify this on the other 6 buildings, not assume Terminal generalizes.
- **E2 (host/opening pairs)** — already local/per-pair, should compose with this shell unchanged;
  triaging session should confirm no hidden dependency on the whole-graph structure exists.
- **Crew-capacity leveling (§S6_CREW_PASS)** — today's crew-aware Kahn pass walks the SCC
  condensation. Under this spec it would instead walk the much smaller, well-defined sequence of
  phase-groups (Step 2/3's own order) — same crew-pool/claim-slot mechanism, smaller and simpler
  input. Not yet designed in detail — triaging session must specify this concretely before build.
  Do not assume it "just works" without writing it out.
- **Gantt-drag editing** — does an edit require re-running the full sequential pass, or can it be
  incremental? Not addressed by this spec. Named as open, not silently assumed either way.
- **MEP-typing/zone-capacity problem (separate, still open, NOT closed by this spec)**: the
  untyped-`IfcBuildingElementProxy`-defaults-to-Architecture issue and its zone-capacity side effects
  (two failed attempts today, see §RESULTS addendum) are ORTHOGONAL to this architecture change — do
  not conflate the two lanes. This spec does not fix MEP typing, and MEP typing does not block this.

## §S24.5 — Acceptance criteria (the same real test that found today's bug, not a new one invented)

On a real building, storey 1, using the correct current DB (`_meta.db` where one exists, never a
stale `_extracted.db` — check mtimes first, this bit the team once already today): does the LATEST
Substructure finish time come at or before the EARLIEST Superstructure start time? Real days, real
elements, gap ≥ 0. Re-run on Terminal first (Ground Floor: today's exact failing case, −30.74 days),
then the rest of the fleet. The 8-element synthetic sandbox (§E3_SYNTHETIC_SUITE CASE1) stays as a
supplementary regression gate but is NOT sufficient proof by itself — today's whole investigation
exists because it structurally cannot see this failure mode (too small to ever form a large SCC).
`floating=0/7` and `gate_4d.sh` green are necessary, not sufficient, same reason.

## §S24.6 — What this spec does NOT claim

This is a design, not a verified fix. Nothing in §S24.3 has been built or measured. The triaging
session's job is to find what's wrong or missing here BEFORE writing code — if the sequential
group-finish-time computation turns out to have its own hidden cross-group cycle risk, or the
crew-leveling redesign in §S24.4 doesn't actually fit this shape once specified in full, that is
exactly the kind of finding this spec exists to be checked against, not evidence the checker did
something wrong.

---

# §S24_TRIAGE — the deep review §S24 asked for, done before any code (2026-08-18). VERDICT:
# **§S24's diagnosis is real and reproduces exactly; its ARCHITECTURE is not yet buildable as
# written.** Nine defects below, each measured, not argued. §S24 stays PROPOSED, NOT GO'D — and now
# additionally NOT CLEARED TO BUILD until §S24_TRIAGE.3's amendments are made to the spec itself.
#
# Method (per this file's own WATCHDOG mandate — re-derive, don't inherit): every §S24.1 number was
# re-measured from scratch on the DB the viewer actually serves, then the checks §S24 does NOT make
# were added. Tool: **`bim-compiler/scripts/probe_phase_gate.js`** (new, study-only, committed with
# this section) — the first place the §S24.5 acceptance question is asked directly, per (level,
# phase-pair), on BOTH engines. Reproduce: `node scripts/probe_phase_gate.js` (7 buildings, ~12 min).
# Logs behind every number below: `§PG_*` lines of that run.

## §S24_TRIAGE.1 — VERIFIED, independently re-derived (Terminal_meta.db, mtime 2026-08-17T10:12Z, 48,428 elements)

Every headline number in §S24.1 is exact, not approximate:
- Ground Floor Substructure→Superstructure gap **−30.74d**, offenders **56/56**, Substructure finish
  46.22d vs Superstructure start 15.47d — reproduced to 2 decimals (`§PG_GAP_CPM_TABLE`).
- Pre-drop SCC **45,182** nodes of 48,513; next-largest component **3** (`§PG_SCC`).
- Physics-only (E1+E2) largest SCC **5** (`§PG_SCC_PHYSICS`).
- **E4 = 79,011** edges, more than the 48,428 element count (`§PG_EDGES`).
- §S24.2's PR #67 quotes are verbatim from commit `ca1d656` (2026-05-30): "an element cannot start
  until the structure topping out within ±0.5m of its base_z is complete… No CPM/deps", Hospital
  63,415 elements, floating 1128→0.
- The engine under review IS the live one — `time_machine.js:4322` `_displayTimeline` calls
  `CpmSchedule.run` and writes its times onto the display items; the legacy fallback is deleted.
  §S13.6's "the mechanism doesn't run on the live path" trap does NOT apply here.
- One wording correction, not a refutation: Round 1 (`cpm_schedule.js:411-424`) drops every
  E3/E4/member edge whose **both** endpoints are inside a multi-node SCC — not every edge "touching
  ANY node" (an edge leaving the component survives). At 93% coverage the practical effect is what
  §S24.1 says: measured drops **E3 13,079/13,442, E4 70,886/79,011, member 45,086/45,513**.

**New, and it strengthens the motive §S24 only argued on one building:** the pathology is fleet-wide.
Giant pre-drop component as a share of nodes — Duplex 51%, HHS 83%, Clinic 87%, LTU 90%, JKR 91%,
Terminal 93%, Hospital 98%. 0/7 buildings pass the acceptance question today.

## §S24_TRIAGE.2 — WRONG or INCOMPLETE in the spec (T1-T9, ordered by how much they change the build)

**T1 — §S24.2's precedent does not carry the weight the architecture puts on it. The local shell
fails the same acceptance test, on every building.** `ScheduleGate.computeSchedule` has NO
phase-completion gate at all: it has a trade-`seq` gate within one collapsed level
(`schedule_gate.js:886-887 phaseTrade[ph][seq]`) and a per-trade cross-band gate
(`:475 bandGate`) — neither knows the word Substructure. Measured on its RAW output
(`§PG_GAP_RAW`): Terminal 11/17 level-phase pairs negative (worst −21.5d), Hospital 5/10 (−41.5d),
Clinic 7/10 (−14.7d), LTU 18/20 (−112.8d), Duplex 4/4 (−0.4d), HHS 4/4 (−22.0d), JKR 14/17 (−11.7d).
PR #67 solved FLOATING (nothing before its support), which is a different invariant from PHASE
ORDER. So §S24.3 Step 2 is **new code with no working precedent**, not a revert to a design that
already worked — and the spec must stop describing it as the latter. (CPM is still far worse —
Terminal 17/17 −76.0d, Hospital 10/10 −246.6d, LTU 19/20 −747.2d — so the redesign's direction is
not what is in doubt; its stated pedigree is.)
Second-order consequence the spec must also answer: `§4D_BAND_MONOTONIC` (`schedule_gate.js:455-460`)
records a still-standing design ruling that "a global floor gate would serialize the project and
destroy the trade train". A hard phase-completion gate is exactly that shape one level down. Say
explicitly why the same objection does not apply, or which ruling is being superseded.

**T2 — "no backward edge, no cycle possible, by construction" (§S24.3 Step 2) is true of the GATE
edges only. The PHYSICS edges the same pass must honour run backward, in quantity.** Designated
supports whose SUPPORT sits in a strictly LATER (band, phase) group than the element it supports
(`§PG_BACKWARD`): Terminal **2,821/48,116**, Hospital **6,833/62,643 (10.9%)**, Clinic
**3,051/15,740 (19.4%)**, LTU 5,836/119,620, HHS 956/6,786, JKR 566/8,885, Duplex 95/1,107. These
are NOT exotic: the dominant designation class is **cls=0 genuine bearing-below** (Terminal 2,103,
Hospital 4,759, Clinic 2,204, LTU 4,204) — not hung MEP, not carrier-above artifacts. A strictly
sequential group-by-group forward pass reaches these elements with their support's time **not yet
computed**. §S24.3 says a member's finish comes from "(a) its Step-1 local physical-support
constraint" — for 6-19% of elements, (a) is a forward reference. The spec must state the rule:
defer-and-revisit, iterate to fixpoint, or ignore the constraint — and "ignore" silently re-creates
"starts before its support finishes", the invariant already open in the §RESULTS addendum.

**T3 — §S24.3 Step 3 and §S24.5 contradict each other, and the population is large.** Step 3 grants
a per-element relaxation of the phase gate for genuine conflicts; §S24.5 accepts only "LATEST phase-A
finish ≤ EARLIEST phase-B start", which any single relaxed element breaks by definition. The
candidate population is T2's counts (up to 2,821 on Terminal, 6,833 on Hospital). Pick one and write
it into both sections: either (a) relaxed elements are excluded from the acceptance measure AND
their count is locked as a baseline that cannot silently grow (the discipline W-MZ-8 already uses),
or (b) relaxation is forbidden across a Tier-1 phase boundary and only permitted inside Tier-2.

**T4 — Step 1's "designatedSupport() … is already correct … Keep it exactly as-is" is the spec's
most load-bearing unproven claim, and Step 3 makes a wrong support dangerous instead of merely
inert.** Among the backward supports of T2, measured phase pairs include same-level
**Architecture→Superstructure** — a wall designated as the support of a column on its own level:
Hospital 513, HHS 427, Clinic 386, JKR 77, Duplex 14 — and **MEP Rough-in→Superstructure** (Terminal
644, Clinic 914 MEP→MEP cross-level). Today a wrong support merely gets contracted into an SCC.
Under Step 3 it becomes the TRIGGER that licenses a per-element gate exemption — silently, one
element at a time, with no shared component to make it visible. Validate the trigger before building
the mechanism that trusts it.

**T5 — §S24.1's cause attribution ("E4 density + a handful of genuinely-real 3-5-element physics
knots") is incomplete, and the correction points at a much cheaper first experiment.** Ablation on
the identical graph (`§PG_ABLATE`, largest component after removing one population):

| building | base | −backward-E1 | −all E4 | −all E3 | −all E1 | −all E2 |
|---|---|---|---|---|---|---|
| Terminal | 45,182 | **11,531** | 13,045 | 44,490 | 79 | 45,171 |
| Hospital | 62,132 | **19,014** | 21,188 | 52,780 | 1 | 62,132 |
| Clinic | 14,087 | **7** | 2,997 | 13,120 | 7 | 14,087 |
| LTU_AHouse | 110,351 | **685** | 11,256 | 104,571 | 674 | 109,819 |
| HHS | 5,661 | **11** | 3,407 | 2,744 | 1 | 5,661 |
| JKR | 8,232 | **112** | 3,040 | 6,755 | 3 | 8,231 |
| Duplex | 577 | **2** | 143 | 467 | 1 | 576 |

Removing the T2 backward-support edges alone dissolves the pathology outright on 5 of 7 buildings —
a ~2-6% edge population, not the 79,011-edge E4 mass. The size-≤5 pure-physics knots §S24.1 names
are not the closers at all; 2,805 of Terminal's 2,821 backward edges sit inside the giant component.
Two real cycles dumped from it, both a single backward physics edge closed through the forward
gate net: (1) 6 hops, `IfcWall Aras02/Architecture →member→ M(Aras02,Architecture) →E3→
M(Aras02,_T1_COMPLETE) →E3→ IfcFlowTerminal Aras02/MEP-Final →E1→ IfcSlab Aras02/Superstructure
→member→ M(Aras02,Superstructure) →E3→` back; (2) 3 hops, `IfcWall Aras02/Architecture →E2→
IfcWindow Aras01/Architecture →member→ M(Aras01,Architecture) →E4→` back. **Consequence for
sequencing the work:** a bounded experiment — refuse to emit (or defer) an E1/E2 edge that
contradicts the group order, inside the existing engine — is testable in hours against the same
§PG numbers and would discriminate before a whole-engine rewrite is committed to. It is not a
complete fix (Terminal/Hospital keep an 11.5k/19k residual), which is itself information the spec
does not currently have.

**T6 — §S24.4's "E2 … should compose with this shell unchanged" is false as measured.** Host/opening
pairs run backward in group order too: Terminal **650/2,099** host pairs (31%) + 76/802 opening
pairs, Clinic 490/2,737, HHS 206/725, Hospital 172/2,830, LTU 644/5,466 + 849/3,072. T5's cycle (2)
is an E2 edge closing a 3-hop cycle. E2 is a cycle SOURCE today, not a neutral passenger, and the
same forward-reference question as T2 applies to it.

**T7 — §S24.4's federated-duplicate scoping is too narrow, and the part it misses lands directly on
Step 2's group key.** The ~0.15m near-duplicate pairs are real (Terminal's `spatial_structure` has 73
storey rows; Aras 01/02/03/04/Tanah/Bumbung each repeat at ~0.035-0.15m apart). But the same NAME
also appears at datums **15-16m apart**: GROUND FLOOR LEVEL at elev −15.03 AND 0.0; 02 FIRST FLOOR at
−7.03 AND +8.0; 03 SECOND at −3.03 AND +12.0; 04 THIRD at +0.97 AND +16.0; 06 ROOF at 7.55 AND 22.57;
00 Aras Asas at −17.03 AND −2.0. Both engines group by `collapsePhase(storey)` = the NAME;
`deriveStoreyMergeMap`'s elevation-band merge (`schedule_gate.js:373`) is NOT applied on the CPM
path. Element-level effect (`§PG_LEVEL_SPLIT`): Terminal's "GROUND FLOOR LEVEL" pools **236 elements
centred at −15.6m with 1,052 centred at +0.9m**; LTU has 5 such levels ("VÅN 4" = 1,867 at 0.0 +
1,525 at 13.7m); JKR 1. Step 2's "group finish = MAX over members" inherits that pooling wholesale —
so level identity is a **prerequisite**, not the "cleanliness/precision improvement" §S24.4 calls it.
(§S24.4's "collapsing is not a correctness blocker, verified 8/8 clean on Terminal" was checked
against the 0.15m case only; it does not cover this one.)

> **⚠ T7 CORRECTED, same day, before §S25 was written — the finding survives, its headline example
> does not.** The Terminal "236 elements centred at −15.6m" cluster is NOT a second datum: they are
> the 236 `jkrST_str-fo_pc_rcp` **30m precast piles** (bbox_z 30.15, base −30.69, top −0.64) that
> `schedule_gate.js auditFloating`'s own `foundation_pile_misclassified_slab` note already documents
> — real Substructure, correctly on the ground floor, sitting exactly where a pile sits. The error
> was in the detection, not the data: clustering on **centre-z** mistakes any tall element for a
> separate datum. Re-measured with vertical **interval-overlap** clustering (tolerance = the shipped
> `GAP` 0.5m), which a 30m pile and the slab above it correctly share: Terminal 5 levels / **99**
> elements in minor clusters (sub-storey strays, e.g. Level 02 = 170 at 10.8-11.0m + 6 at 11.8-11.9m),
> JKR 3 levels / 31, and **zero on Hospital, Clinic, Duplex and HHS**. The one building where this is
> a real, large defect is **LTU_AHouse: 5 levels, 4,887 elements (4% of 122,330)** whose geometry does
> not overlap their own level's body at all — "VÅN 4" carries 1,867 elements at −1.4..1.4m alongside
> 1,525 at 10.9..16.5m; "VÅNING 3" 158 at −0.6..1.9m alongside 2,049 at 6.0..13.4m. So T7's
> conclusion stands (name-based level identity is unsound and Step 2's MAX-over-members inherits it)
> but its **scope is one building plus strays, not the fleet** — and any level-identity rule must
> cluster by interval overlap, never by centre distance. `probe_phase_gate.js` §PG_LEVEL_SPLIT was
> fixed to the interval rule in the same commit as §S25.

**T8 — §S24.5's DB rule is right for the wrong reason and picks the wrong file on Clinic.** The
viewer fetches `<Building>_meta.db` whenever the meta+geo pair exists (`streaming.js:2190-2218`
§DB_SPLIT_DETECT) — **regardless of mtime**. `Clinic_meta.db` (Jun 6) is OLDER than
`Clinic_extracted.db` (Aug 3) and is still the served half, so "check mtimes first" selects a file
the live viewer never loads. Rule should be "the half the viewer serves". Worse, this is still live
in committed code, not just in one session's ad-hoc run: `viewer/tests/witness_midair_zero.js:169`
maps only `LTU_AHouse` to a `_meta.db` and falls back to `<name>_extracted.db` for everything else —
so **every W-MZ baseline for Terminal, Hospital and Clinic is measured on a DB the live viewer does
not serve** (Terminal_extracted.db is Jun 5, 74 days stale). That is the §RESULTS-addendum
"measurement artifact" still sitting in the fleet gate. Fix it there before any before/after
comparison is trusted; the Duplex/HHS TRADE regression the addendum could not explain is NOT covered
by this (both are single-DB buildings) and stays open.

**T9 — the spec is silent on E1's SS-vs-FS semantics, which is exactly the open question it inherits.**
`cpm_schedule.js:157` emits E1 as **SS** ("T cannot start until S STARTS"). That is why a dependent
can legitimately start before its support FINISHES, which is the separate TRADE invariant W-MZ-8
locks per building (Terminal 8,789, Hospital 5,107, LTU 15,896 — deliberate, baselined, not zero).
§S24.3 Step 1 keeps designatedSupport "exactly as-is" but never says whether the new shell keeps SS.
Under §S24 as written the number stays where it is — so the spec should say so out loud rather than
leave a reader to assume the redesign answers the addendum's open TRADE question. It does not.

**Two smaller ones, named so they aren't discovered late:** (a) §S24.4 calls the crew redesign "same
crew-pool/claim-slot mechanism, smaller and simpler input" — it is not the same ORDER. Today's
allocator is one global priority queue over the whole condensation keyed (earliest feasible time, bz,
guid) with project-wide pools (`cpm_schedule.js` solve, §S6_CREW_PASS); a group-sequential pass hands
slots out in GROUP order, so groups that legitimately overlap in time (the trade train) compete
differently. State the claim order explicitly. (b) Consolidation: this file's own DO-NOT-REMOVE
header mandates ONE class wrapping `computeSchedule → CpmSchedule.run`. §S24 replaces the second
half while `computeSchedule` still runs first (CPM reads only its DURATIONS, `DUR = e-s`) — meaning
its geoGate/hangGate/bandGate/phaseTrade gates and its 16-sweep §DEQ_REPAIR fixpoint would become a
third gate layer under the new shell. Say whether Steps 1-2 subsume them or duplicate them.

## §S24_TRIAGE.3 — what must change in the spec BEFORE code (each maps to a finding above)

- **A (T2, T6)** — a written rule for physics constraints that point into a later group, with the
  measured population as its acceptance number. This is the single biggest hole.
- **B (T3)** — reconcile Step 3 with §S24.5: exempt-and-lock-the-count, or forbid cross-Tier-1
  relaxation. Both sections must say the same thing.
- **C (T7)** — level identity (datum-split names) resolved first, as a prerequisite step, not a
  §S24.4 footnote.
- **D (T4)** — validate designatedSupport's backward designations before Step 3 is allowed to trust
  them as its trigger.
- **E (T1)** — restate §S24.2 as "precedent for LOCAL support gating", not for phase gating, and
  reconcile with §4D_BAND_MONOTONIC's standing anti-serialization ruling.
- **F (T8)** — fix the DB-selection rule, and fix `witness_midair_zero.js:169` before any
  before/after fleet claim.
- **G (T9 + smaller ones)** — state E1 SS-vs-FS, the crew claim order, and what happens to
  computeSchedule's own gates.
- **H (T5)** — sequence the work: run the bounded backward-edge experiment inside the existing
  engine first. If it clears 5/7 buildings as the ablation predicts, the rewrite's scope changes.

**STOP-AND-REPORT (inline, per §S23 Part B — this is the worked example that section's acceptance
asks for):** if the backward-edge experiment (H) does NOT move `§PG_GAP_CPM` on the buildings the
ablation predicts it will, STOP and report that the ablation model is wrong — do not proceed to
build §S24.3 on the strength of a prediction that just failed, and do not re-frame the target to
whatever the experiment did happen to improve.

## §S24_TRIAGE.4 — the baseline every future fix is judged against (`node scripts/probe_phase_gate.js`, 2026-08-18)

| building (served DB) | n | RAW neg/pairs, worst | CPM neg/pairs, worst | giant SCC / nodes | backward supports |
|---|---|---|---|---|---|
| Terminal_meta | 48,428 | 11/17, −21.5d | 17/17, −76.0d | 45,182 / 48,513 | 2,821 / 48,116 |
| Hospital_meta | 63,182 | 5/10, −41.5d | 10/10, −246.6d | 62,132 / 63,222 | 6,833 / 62,643 |
| Clinic_meta | 16,071 | 7/10, −14.7d | 10/10, −85.0d | 14,087 / 16,106 | 3,051 / 15,740 |
| LTU_AHouse_meta | 122,330 | 18/20, −112.8d | 19/20, −747.2d | 110,351 / 122,398 | 5,836 / 119,620 |
| Duplex_extracted | 1,119 | 4/4, −0.4d | 3/4, −6.3d | 577 / 1,138 | 95 / 1,107 |
| HHS_Office_Federated_extracted | 6,839 | 4/4, −22.0d | 4/4, −27.4d | 5,661 / 6,856 | 956 / 6,786 |
| JKR_extracted | 8,985 | 14/17, −11.7d | 16/17, −16.4d | 8,232 / 9,058 | 566 / 8,885 |

`gate_4d.sh` green and `floating=0/7` remain necessary-not-sufficient, for the reason §S24.5 already
gives — neither can see this failure class.

## §S24_TRIAGE.5 — what this triage did NOT check (so nobody reads it as broader than it is)

Not re-derived: §S24.1's "0/56 offending columns have any physics-only path back to their own
milestone's ancestors" (plausible and consistent with the size-5 physics SCC, but not measured here),
and §S24.4's "8/8 clean" federated-pair check on the 0.15m case. Not touched: the MEP-typing/zone-
capacity lane (§S24.4 is right that it is orthogonal), Gantt-drag incremental re-run (still open,
correctly named), the Duplex/HHS TRADE regression, and the `Terminal_meta.db`/`Hospital_meta.db`
(#1427/#1428) integrity question — all four remain exactly as open as the §RESULTS addendum left
them. No code in `viewer/` was changed by this triage; the only artifact is the study-only probe.

---

# §S25 — THE LAYER CONTRACT AND ONE FORWARD PASS (2026-08-18). **SUPERSEDES §S24 — do not implement
# §S24.3.** §S24 and §S24_TRIAGE stay in this file as the record of how this was reached; they are
# history now, not instructions. This section is the whole design, start to finish, and it is meant
# to be read alone.
#
# Why superseded rather than amended: §S24 built a phase gate on a precedent that has no phase layer
# (§S24_TRIAGE T1), and defined its conflict rule in terms of GROUP ORDER — "relax the gate for an
# element the gate would force too early" — when the fact that decides the conflict is GEOMETRY.
# Patching those two would have left the same shape. The layering below is what the user named, and
# it resolves both by construction.

## §S25.0 — The statement this whole design rests on
> **⚠ ITS CENTRAL PREMISE IS HALF WRONG — corrected by measurement 2026-08-19, see §S25_REVIEW.5.**
> "Physical support is a strict order by elevation, so it cannot contain a cycle" is true ONLY of
> bearing-below. The hang, host and opening families point DOWN or sideways and make the physics
> layer genuinely cyclic. Acyclicity is manufactured by contraction, not inherited from geometry.

**A construction schedule is not a general dependency graph. It is four layers, each already an
order, composed in a fixed precedence.** Physical support is a strict order by elevation, so it
cannot contain a cycle — every physics cycle measured is a data error, and they are tiny (largest
physics-only SCC on any building in the fleet: 5-17 nodes). Phase order is a fixed list of 3+2
entries. Level order is a total order by height. Crew capacity is not an order at all — it delays.

The 45,182-node component is therefore **manufactured**, not discovered: it appears only when the
layers are flattened into one edge set and a general solver is asked to sort out the contradictions,
at which point the information about which layer each edge came from — the only thing that could
decide the conflict — has already been thrown away. Ablation proves it (§S24_TRIAGE T5): removing a
2-6% edge population dissolves the giant component outright on 5 of 7 buildings.

Stop flattening, and the entire apparatus goes with it: no Tarjan, no SCC condensation, no
contraction, no milestone nodes, no hammock edges, no membership edges, no straggler ancestry, no
16-sweep repair fixpoint, no sweep cap. What replaces them is one forward pass whose termination is
a one-line argument (§S25.5).

## §S25.1 — The four layers, and who wins

| layer | what it is | source | may it reorder? |
|---|---|---|---|
| **L1 LEVEL LADDER** | level identity + level order | element geometry + storey names | — (it is the coordinate system L3 uses) |
| **L2 PHYSICS** | "this cannot be built until that is finished" | geometry, per element | **absolute — always wins** |
| **L3 CONVENTION** | phase order within a level, level order within a phase | fixed lists | **default only — applies where L2 is silent, yields where L2 speaks** |
| **L4 CAPACITY** | crews per resource | rates table | **never reorders — delays only** |

**The precedence rule, in one sentence:** *physics is absolute, convention is a default, capacity is
a delay, and every place where physics and convention disagree is named, counted and reported — never
silently relaxed and never silently enforced.*

That last clause is the part both previous designs lacked. §CPM_STRAGGLER_MEMBERSHIP silently
exempted; §CPM_STRAGGLER_EXEMPTION_DROPPED silently enforced and let Tarjan clean up; §S24.3 Step 3
would have silently relaxed per element. All three are the same mistake — resolving a contradiction
without recording that one occurred.

## §S25.2 — L1: the level ladder

Two distinct jobs, both from measured data, neither invented:

**Identity.** A level is a storey name PLUS a vertical body. Cluster a name's elements by
**interval overlap** of `[base_z, top_z]` with tolerance `GAP` (0.5m, the shipped constant): two
elements share a level if their vertical extents touch. **Never cluster by centre-z distance** — that
reports any tall element as its own datum, which is exactly the error §S24_TRIAGE T7 had to correct
(Terminal's 236 real 30m precast piles read as a phantom second ground floor). Distinct names whose
bodies overlap collapse to ONE level: that is the correct treatment of federated ladders (Terminal's
`Aras 01` @8.15m and `02 FIRST FLOOR LEVEL` @8.00m are one physical storey exported twice).

Measured need, on the scheduler's own element set (`§PG_LEVEL_SPLIT`, 2026-08-18): **LTU_AHouse 5
levels / 5,045 elements (4.1%)** whose geometry does not overlap their own level's body at all
("VÅN 4" holds 1,867 elements at −1.4..1.4m alongside 1,525 at 10.9..16.5m); JKR 2 levels / 94;
Terminal 1 level / 41; and **zero on Hospital, Clinic, Duplex and HHS**. So this layer is mandatory
for one building and near-noop on four — build it, but do not let it grow into a project.

**Order.** Rank levels by ascending body base. Keep the shipped M1 rule for the ORDERING relation:
band = `floor(meanZ / 3m)`, dense-ranked over the bands actually present, and the level gate is
band-to-band. Levels sharing a band are parallel sub-buildings (Terminal's Kedai shop block vs the
main hall) and are never chained to each other. Identity is what changes here; the band ordering is
already measured and stays.

Print the derived ladder every run (`§S25_LADDER`), for the same reason §4D_BAND_MONOTONIC prints
its own: a wrong ladder enforces a wrong order confidently.

## §S25.3 — L2: physics
> **⚠ AMENDED by §S25_PROTO C3-C4 and §S25_REVIEW (2026-08-19):** the same-group "contradiction drop"
> below is DELETED (acyclicity comes from contracting physics cycles, not from an ordering rule), and
> "FS closes the float invariant" is FALSE as stated — it holds only for the one designated support.
> Read §S25_PROTO C3, C4 and §S25_REVIEW.5 before implementing this section.

**Relation (unchanged geometry, keep it):** `contactGraph` → `designatedSupport` (bearing-below,
embedded, carrier-above, with §GROUNDED_NEVER_HANGS) plus `hostPairs` / `openingPairs`. One
predecessor per element from support, plus host/opening predecessors.

**Semantics: FINISH-to-START.** A dependent may not START until its support FINISHES. This replaces
today's start-to-start edge (`cpm_schedule.js:157`, `addEdge(des[i], i, SS, 1, 'e1')`), and it is the
literal statement of what this lane was asked for — *the floor is finished before the beam goes up*.
Consequences, stated up front so they are not read later as regressions: `auditFloating`'s TRADE
count (a dependent starting before its support finishes) should collapse from its locked baselines
(Terminal 8,789, Hospital 5,107, LTU_AHouse 15,896 — W-MZ-8) toward zero, and the makespan will grow.
Both are the intended effect. FS is uniform across all three support classes — a column on a cured
footing, a window in a finished wall, a duct hung from a poured slab.

**Within one group**, order by `base_z` (guid tie-break). A same-group physics constraint whose
support does not sort earlier is a **contradiction in the data**: drop it, count it
(`§S25_CONTRADICTION`), never contract it. This is what retires Round-2 contraction; the population
it replaces is small and already characterised (physics-only SCCs of size ≤5 on most buildings, 1,291
of them on Terminal, 17 max on HHS).

## §S25.4 — L3: convention. Gates are numbers, never edges

- **Phase gate:** at a level, `Substructure → Superstructure → Architecture`, then every Tier-2 phase
  after all Tier-1 phases present at that level.
- **Level gate:** same phase, previous band.
- **A gate's value is the completion time of the gating group**, where completion is
  `max end over that group's members that were NOT deferred` (§S25.5), and the excluded set is
  reported per group.

No milestone nodes exist. No E3/E4/member edges exist. A gate is a `Float64` that becomes known when
a counter reaches zero, and it is read by a `max()`.

## §S25.5 — The deferral rule: the entire conflict resolution, and why it terminates
> **⛔ SUPERSEDED IN PLACE by §S25_PROTO C1-C2 (2026-08-19). The rule as written below DEADLOCKS on
> first contact with real data (975 of 1,119 elements stuck on Duplex).** Kept verbatim because this
> file keeps its retractions. Implement the effective-rank mechanism in §S25_PROTO C1-C2, never this.

Pass order is `(bandRank, phaseRank)` — a **total order**. For each physics constraint `p → e`:

- `group(p) < group(e)` → ordinary predecessor. Nothing special.
- `group(p) == group(e)` → ordinary predecessor if `p` sorts earlier by `base_z`; otherwise a
  contradiction (§S25.3), dropped and counted.
- **`group(p) > group(e)` → `e` is DEFERRED**: it keeps the constraint (physics is absolute), it
  becomes schedulable only when `p` is finalized, and **it is excluded from its own group's
  completion time**.

**Termination, in one line: a deferral always points strictly forward in a total order, so a chain of
deferrals strictly increases and cannot close.** That is the proof that replaces Tarjan. There is no
fixpoint, no iteration cap, and no cycle to break — not because cycles are broken well, but because
none can be formed.

**Deferral is LOCAL and non-transitive** — decided by an element's own direct predecessor, never by
ancestry through a condensation. That single word is the difference from §CPM_STRAGGLER_MEMBERSHIP,
whose transitive definition classified 54-100% of a phase as stragglers and made "phase complete"
meaningless. The local population is measured and small: **Terminal 5.9% (2,821 of 48,116), Hospital
10.9%, HHS 14.1%, Clinic 19.4%, Duplex 8.6%, JKR 6.4%, LTU_AHouse 4.9%**, plus backward host/opening
pairs (Terminal 726, Clinic 495, LTU_AHouse 1,493).

**Excluding a deferred element from its group's completion is not a fudge — it is the honest
statement.** A physically-late element is not doing that group's work at that time; it merely carries
the group's label. But the exclusion is only honest while it is *visible*: the deferred count per
group is a reported number with a locked baseline, and a group with a large deferred share is a
**data-quality alarm**, not something to schedule around. Clinic's 19.4% is exactly such an alarm and
should be read as one.

## §S25.6 — L4: capacity

Same allocator as today and as `computeSchedule`: per-resource slot array, claim the earliest free
slot, `MAX_CREWS_DEFAULT = 3`, pools shared project-wide. One rule made explicit because §S24.4 got
it wrong ("same mechanism, smaller input"): **crew slots are claimed in TIME order, not in group
order.** The ready set is a min-heap keyed `(precedence-feasible start, base_z, guid)`. A
group-sequential claim order would let a group that is later in the pass but earlier in time claim
after one that runs later — measurably wrong wherever a pool spans phases (`CONCRETE_GANG` appears in
both Substructure and Superstructure). Capacity delays; it never reorders.

## §S25.7 — The algorithm, whole

```
compute(elements, opts):
  ladder      = levelLadder(elements)                  # §S25.2 — identity by interval overlap, order by band
  group(e)    = (bandRank[level(e)], phaseRank(e.phase))         # the pass order: a TOTAL order
  C           = contactGraph(elements)                 # §S25.3 — unchanged geometry
  preds(e)    = designatedSupport(e,C) + hostPairs + openingPairs        # FS, every one of them

  for each constraint p->e:                            # §S25.5 — classify, never merge
      forward | sameGroup-ordered   -> predecessor
      sameGroup-unordered           -> DROP, count §S25_CONTRADICTION
      group(p) > group(e)           -> predecessor AND mark e DEFERRED

  predCount[e]     = # unfinalized predecessors
  groupRemaining[g]= # NON-deferred members of g
  gatePending[g]   = # gating groups (prev phase @ level, same phase @ prev band) not yet complete
  gateTime[g]      = max completion of those gating groups                # a number, not a node

  ready(e)  iff predCount[e]==0 and gatePending[group(e)]==0
  heap key  = ( max(gateTime[group(e)], finish of finalized preds), base_z, guid )

  while heap:
      e     = pop()
      start = max(gateTime[group(e)], every predecessor's finish, earliest free slot of e.resource)
      end   = toWall(toProductive(start) + dur(e))     # §S25.8
      commit that crew slot to `end`
      for each dependent d: if --predCount[d]==0 and gate open -> push d
      if not deferred(e) and --groupRemaining[group(e)]==0:
          complete(g) = max end over g's non-deferred members
          for each h gated by g: gateTime[h] = max(gateTime[h], complete(g))
                                 if --gatePending[h]==0 -> push h's ready members

  assert processed == elements.length                  # MUST be 0 leftover; print it, never repair it
```

`O((V+E) log V)`, one pass, no fixpoint, no sweep cap. **A non-zero leftover is a bug in this design
and must be reported as one** — not swept up by a fallback loop, which is how `computeSchedule`'s
`§SUPPORT_CYCLE` residue and `§DEQ_REPAIR`'s 16 sweeps came to exist.

Elements with no level (no storey) get no group gate: physics and crews only, counted separately.

## §S25.8 — Durations, and why this can be ONE engine

`dur = round(installSecs * scaleFactor * 1000)` productive ms, and
`end = toWall(toProductive(start) + dur)`. Verified pure by direct read (`schedule_gate.js:554-558`):
it depends on the element and the shift window and on **nothing about placement**. So the layered
pass computes its own durations and does **not** need `ScheduleGate.computeSchedule` as a duration
oracle — which is precisely what makes one engine possible instead of two-and-a-bridge. `installSecs`
keeps coming from `ScheduleAuthor._installSecs` (real class fragmentation + linear weighting), the
one existing source; nothing about classification moves.

## §S25.9 — Where it lands, and what dies

`viewer/schedule_engine.js` **already exists** as the `compute(elements, opts) → ScheduleModel` class
this file's DO-NOT-REMOVE header mandates, and today it is wired to nothing but two probes. §S25 is
its BODY: its Step 1 (`SG.computeSchedule`) and Step 2 (`CPM.run`) are replaced by §S25.7. Order of
wiring, each step independently checkable:

1. `time_machine.js:4322` `_displayTimeline` → `ScheduleEngine.compute` (the live movie + Gantt).
2. `schedule_author.js:404` → the same call (task-window authoring, today a second `computeSchedule`).
3. `time_machine.js:5179` stops calling `computeSchedule`.

Then delete, not deprecate: `cpm_schedule.js`'s `buildGraph` / `tarjanScc` / `solve` and
`computeSchedule`'s scheduling machinery — `geoGate`, `wallGate`, `hangGate`, `openingGate`,
`hostGate`, `bandGate`/`bandCommit`, `phaseTrade`, the Kahn placement loop, `§SUPPORT_CYCLE`'s
fallback and the 16-sweep `§DEQ_REPAIR` fixpoint. Their job is done by L2+L3+L4 and leaving them
resident is exactly the third gate layer §S24_TRIAGE flagged.

**Stays, untouched:** `contactGraph`, `designatedSupport`, `hostPairs`, `openingPairs`,
`collapsePhase`, `deriveBandRanks`, `toWall`/`toProductive`, `auditFloating`, `deriveZones`,
`_buildScheduleElements`, `_installSecs` — geometry, classification and audit, none of which is
scheduling. `stragglerOf` becomes `deferredOf`: safe, because the bar-window formula that once read
it is already classification-free (`time_machine.js:4422-4427`) and nothing else consumes it.

Bump `_GANTT_CACHE_VERSION` (`time_machine.js:7903`) — the schedule shape changes — and bump
`sw.js CACHE_VERSION` in the same PR as any `viewer/*.js` change, per this project's standing rule.

## §S25.10 — Acceptance: what "done" means, against today's measured baselines

1. **`§PG_GAP_CPM` = 0 negative gaps on 7/7 buildings**, or every remaining negative gap attributable
   by guid to a listed deferral, with that count locked. Today: 7/7 fail, worst −747.2d (LTU).
2. **`auditFloating` → 0**, or a locked, listed exception set. Today: Terminal 8,789 / Hospital 5,107
   / LTU 15,896 (W-MZ-8). This is the FS invariant of §S25.3 and it is the acceptance the user asked
   for in construction terms.
3. `_midairAudit` stays 0/7 (nothing appears before what it touches).
4. `§CREW_FEASIBILITY` stays 0 violations.
5. **Leftover elements = 0**, printed every run.
6. The 7 hand-computed synthetic cases still pass, plus **three new ones this design's own failure
   modes require**: a deferral chain across three groups; a same-group contradiction pair; a level
   with a genuine datum split. Hand-compute each before running it, per §VERIFICATION rule 1, and
   wire them into the existing fleet gate — not a second gate.
7. `§PG_LEVEL_SPLIT` ladder correct on 7/7, and every measurement taken on the DB half the viewer
   actually serves (fix `witness_midair_zero.js:169` first — §S24_TRIAGE T8).

## §S25.11 — Build order (each stage lands alone, each has its own stop condition)

- **S25-1 — L1 ladder only.** No scheduling change. Prove the ladder on 7/7 via `§PG_LEVEL_SPLIT`.
  *STOP-AND-REPORT if* a building's ladder disagrees with its `spatial_structure` elevations in a way
  the interval rule cannot explain — report it, do not tune the tolerance until the table looks nice.
- **S25-2 — the forward pass, physics FS + gates, no crews.** Measure `§PG_GAP` and `auditFloating`.
  *STOP-AND-REPORT if* leftover ≠ 0, or if negative gaps survive that are not explained by a listed
  deferral — the deferral model is then wrong and must be reported wrong, not widened until it fits.
- **S25-3 — L4 crews**, time-ordered claims. Re-check `§CREW_FEASIBILITY` and makespan.
  *STOP-AND-REPORT if* adding crews reintroduces a negative gap: capacity must only delay.
- **S25-4 — wiring + deletion** (§S25.9), cache versions bumped, dead gates removed.
  *STOP-AND-REPORT if* any deleted function still has a live caller outside tests.
- **S25-5 — Gantt-drag**, the question §S24 left open: an edit is a **re-run of the same pure pass
  with the dragged element pinned** (its start fixed, everything downstream recomputed). Same
  function, one extra constraint — no incremental variant, no second code path. Verify the lock gate
  (`verifyGanttIntegrity`) judges the re-run by the same rules.

Before S25-2, run the bounded experiment §S24_TRIAGE H already specified (refuse or defer the
backward physics constraints inside today's engine): it costs hours, and it either confirms the
ablation model on 5/7 buildings or proves it wrong before any of this is built. *STOP-AND-REPORT if
it does not move `§PG_GAP_CPM` where the ablation predicts* — that would mean this section's
diagnosis is wrong, and that finding outranks the plan.

## §S25.12 — What this does NOT solve, said plainly

- **The LTU_AHouse 5,045 mislabelled elements are a DATA defect.** The ladder makes them visible and
  schedules them where their geometry actually is; it does not repair the source model. An element at
  z≈0 labelled level 4 is wrong in the IFC, and that belongs to extraction, not scheduling.
- **MEP typing / zone capacity** (untyped `IfcBuildingElementProxy` → Architecture) is orthogonal and
  stays open, exactly as §S24.4 had it.
- **The Duplex/HHS TRADE regression** in the §RESULTS addendum is *expected* to be subsumed by
  §S25.3's FS semantics, since it is the same invariant. That is a prediction, not a claim — if FS
  lands and those two buildings still show it, STOP and report, do not fold it into this section.
- **`Terminal_meta.db` / `Hospital_meta.db` integrity** (#1427/#1428 elevation+parentage patch) is
  still unverified and unrelated to this design.
- **Nothing here is measured yet.** §S25.0-§S25.6 are grounded in numbers already taken (§S24_TRIAGE.4
  is the baseline table); §S25.7's pass has not been run against a building even once. The first
  session to build it should expect to find something in here that the data does not support — and
  should report that, not route around it.

---

# §S25_PROTO — §S25 BUILT AND MEASURED ON ALL 7 BUILDINGS (2026-08-19). Still a prototype
# (`bim-compiler/scripts/proto_s25_forward_pass.js`, study-only) — `viewer/` is unchanged. This is
# §S25.11's stages S25-1..S25-3 executed as one measurement instead of argued about.
#
# **Headline: the layer contract works mechanically and is provably clean on its own terms —
# leftover 0, gate violations 0, midair 0, crew violations 0, on 7/7 buildings. And it still cannot
# make the phase statement true as LABELLED, because 17-64% of elements carry a phase label their own
# physics contradicts.** The remaining problem is not the scheduler. It is classification.

## §S25_PROTO.1 — Four corrections the prototype forced on §S25, each found by running it

**C1 — §S25.5 as written DEADLOCKS. Excluding a deferred element from its group's completion is not
enough.** First run, Duplex: **975 of 1,119 elements stuck**. The cycle is: a NON-deferred element X
waits on a deferred element Y in its own group → the group never completes → the later group Y waits
for never opens → Y never runs → X never runs. Lateness has to MOVE the element, not excuse it.
**Replacement rule:** `effectiveRank(e) = max(passRank(group(e)), max over predecessors p of
effectiveRank(p))` — one longest-path propagation. Every constraint is then forward-or-same by
construction, group completion means "all my work is done" with no exclusion accounting, and no
deadlock can form. Re-homed elements are counted and reported exactly as deferred ones were.

**C2 — that propagation must run over the CONDENSATION, not over elements.** Propagating per element
and then giving a contracted component its members' max rank afterwards re-broke it (**674 of 1,119
stuck**): raising a member's rank after the fact leaves its successors ranked BELOW their own
predecessor. Compute component ranks first, propagate over the condensation, then assign.

**C3 — physics cycles must be CONTRACTED, not dropped.** Dropping the edges inside a mutual-support
component cost **53 midair violations on Duplex** (the dependent had nothing holding it). Contracting
them — one shared start, the judge's own equality contract — restores **midair 0**. This is a Tarjan
on the PHYSICS LAYER ONLY (largest component in the fleet: 4-17 nodes), where a cycle means the model
is wrong; it is not the merged-graph Tarjan §S25.0 rejects. Consequence: §S25.3's invented same-group
"contradiction drop" is unnecessary — acyclicity comes from the contraction — and is deleted.
Measured contradictions dropped fleet-wide after this change: **0**.

**C4 — §S25.3's "FS closes the float invariant" is true only for the DESIGNATED support, and the
obvious fix is measurably worse.** `auditFloating` tests every qualifying support; the designated
edge covers one. Constraining against all of them was tried (`ALL_SUPPORTS=1`, kept in the probe so
this stays checkable): contact relations in real data are mutual, so the physics cycles explode —
Duplex largest component **5 → 672**, contracted edges **76 → 4,821**, re-homed **31.6% → 93.3%**,
makespan **8.1d → 2.7d**. A schedule where almost everything shares a start is not a schedule.
The RAW shell reaches float=0 by a different mechanism entirely (a grid gate that only sees supports
ALREADY PLACED, plus its 16-sweep repair loop). So float stays a **counted residual**, not zero, and
§S25.10 acceptance #2 must be rewritten to say so.

## §S25_PROTO.2 — Results, 7/7 buildings, one run, same shift (24h) for all three engines

RAW = `computeSchedule` · CPM = `CpmSchedule.run` (live today) · S25 = this pass.
`engineGap` = the acceptance question measured on the ENGINE's own level identity, effective
membership — what §S25 actually enforces. `asLabelled` = the same test with the re-homed tail counted
back into its labelled phase — what a planner reading phase names sees.

| building | n | leftover | engineGap | asLabelled (worst) | midair CPM→S25 | float CPM→S25 | crew | re-homed | pass ms |
|---|---|---|---|---|---|---|---|---|---|
| Terminal_meta | 48,428 | **0** | **0/14** | 14/15 (−30.98d) | 0→0 | 4,756→**3,523** | 0 | 25.9% | 406 |
| Hospital_meta | 63,182 | **0** | **0/10** | 8/10 (−216.81d) | 0→0 | 7,753→**4,095** | 0 | 16.9% | 784 |
| Clinic_meta | 16,071 | **0** | **0/7** | 10/10 (−80.34d) | 0→0 | 1,102→3,086 | 0 | 39.9% | 121 |
| LTU_AHouse_meta | 122,330 | **0** | **0/11** | 13/14 (−768.47d) | 0→0 | 12,712→19,327 | 0 | 34.7% | 1,515 |
| Duplex_extracted | 1,119 | **0** | **0/2** | 4/4 (−5.95d) | 0→0 | 247→280 | 0 | 31.6% | 5 |
| HHS_Office_Federated | 6,839 | **0** | **0/4** | 4/4 (−22.03d) | 0→0 | 1,531→**1,436** | 0 | 33.4% | 54 |
| JKR_extracted | 8,985 | **0** | **0/4** | 9/9 (−19.21d) | 0→0 | 3,183→**3,078** | 0 | 63.6% | 84 |

Read it honestly, both halves:

- **What is now proven.** The pass terminates with **zero leftover on 7/7** — the total-order
  termination argument holds on real data, at 122k elements, in 1.5s. The gate it enforces is
  enforced **exactly: 0 violations, worst 0.00d, on every building**. `midair` stays 0 (parity with
  CPM). Crew feasibility stays 0. No Tarjan over a merged graph, no fixpoint, no sweep cap, no
  straggler ancestry — the machinery §S25.0 said was unnecessary is in fact unnecessary.
- **What is not fixed, and is not a scheduler problem.** `asLabelled` is still 8/10 to 14/15
  negative. That is the direct arithmetic consequence of re-homing 17-64% of elements: when a
  "Substructure" pipe is physically forced to wait for a level-3 slab, the Substructure phase — AS
  LABELLED — cannot finish before Superstructure starts, under any scheduler. **No algorithm can make
  that statement true. Only re-classifying the element can.**
- **float is a mixed result, and C4 explains it:** better on Terminal (−26%), Hospital (−47%), HHS,
  JKR; worse on Clinic, LTU, Duplex. It tracks how much of each building's support structure the one
  designated edge happens to cover.
- **The amplification is the real lever.** JKR: **609 backward constraints → 5,715 re-homed elements
  (9.4×)**. Terminal: 4,263 → 12,547. A handful of wrong support designations relabels a large part
  of a building. §S24_TRIAGE T4/D (validate `designatedSupport`'s backward cases) is therefore not a
  follow-up — it is the highest-leverage item in this lane, and it now has a number attached.

## §S25_PROTO.3 — Two new gaps the prototype exposed in §S25.2 (level ladder)

- **The acceptance test must use the ENGINE's level identity, not the storey name.** Measured by
  name, Clinic and LTU "failed" — but the engine had split Clinic's `Roof - Main` into **three**
  physical levels (median 4.5m, 7.3m, 11.3m) and merged federated names elsewhere
  (`Level 2=Roof - Main`, `VÅN 3=VÅN 4=VÅNING 4=Ref.`). Comparing a re-derived ladder against a
  by-name grouping measures the mismatch, not the schedule. §S25.10 #1 needs this stated.
- **Tiny levels get a full band rank and gate real work.** LTU's ladder contains levels with **n=2 at
  −45.8m** and n=2 at −13.9m, each occupying its own band rank ahead of 44,383 elements at 5.3m.
  §S25.2 needs a minimum-population / merge-into-nearest rule, derived from data, not a guessed
  threshold. Not yet designed.

## §S25_PROTO.4 — Where this leaves the lane (the honest next move, not a plan to write another plan)

1. **Fix the support designation before anything else** (§S24_TRIAGE T4/D). The 9.4× amplification
   makes this the only change with fleet-scale leverage. Specifically: the same-level
   `Architecture→Superstructure` designations (a wall elected as a column's support — Hospital 513,
   HHS 427, Clinic 386) and `MEP→Superstructure` (Terminal 644). Each is a candidate misclassification
   that today silently re-homes everything resting on it.
2. **Then re-run this prototype.** `asLabelled` is the number that should move. If it does not move
   when the bad designations are fixed, **STOP and report** — that would mean the re-homing is
   dominated by genuine physics, and the phase labels themselves (not the supports) are what disagree
   with the building.
3. **Only then wire §S25 into `schedule_engine.js`** (§S25.11 S25-4). Wiring an engine whose
   `asLabelled` output is still 8/10 negative would ship a correct scheduler that still looks wrong
   on a planner's screen — the exact trap this whole file exists to avoid.

**STOP-AND-REPORT, inline:** if fixing the designations moves `asLabelled` but breaks `engineGap`
(currently 0/7), the layer contract is not as separable as §S25.1 claims — report that, do not
re-tune the ladder to make both numbers look good at once.

---

