# BIMEyes — THE STRUCTURAL ORACLE (the judge, not the scheduler)

## ⚠ DO NOT REMOVE
**Scope:** build ONE judge that answers *"is anything holding this up, at the instant the user sees
it?"* and make it agree with the screen. **Read the output log after every run — exit code is not
evidence.** Honour this block until the lane is DONE. Spec lives here; findings append here, NOT to
`MEMORY.md`.

**Origin:** user, 2026-08-26, after weeks of `midair=0` while the screen showed hanging pipes.
Sibling lane: `prompts/4D_BAR_MODEL.md` §14–§18 (the *scheduler*). **This file owns the JUDGE.**
Do not re-litigate the Bar model here; do not fix the judge there.

---

# SETTLED — READ BEFORE PROPOSING ANYTHING

## S1. Four independent mechanisms produce `midair=0`. Only one dies with the rescale.
1. **The judge runs before the last transform.** `_midairAudit` at `_displayTimeline`;
   `_tmRescaleToTaskWindow` (`time_machine.js:4843`, applied `:4870`) after it. **0 → 783 on HHS.**
   Dies when `injectGantt` reads Bar leaf times and the rescale is deleted (4D_BAR_MODEL §14.6).
2. **`grounded` is footprint-local and altitude-blind.** `support_sweep.js:399-417` —
   `var lowest = Infinity` … `grounded[i] = (lowest < T.bz - GAP) ? 0 : 1`. **No XY neighbour ⇒
   grounded, at any altitude.** Absence of evidence is read as "rests on the earth."
3. **`des = -1` is silently uncountable.** `_midairAudit`'s first statement is
   `if (sIdx < 0) continue`. 63/6839 on HHS, 62 above ground, max 16.20m.
4. **The election picks ONE support of 36, and can pick one ABOVE.** `support_sweep.js:465`
   `if (poolJ >= 0) { bestJ = poolJ; bestCls = poolCls; }` — **no class guard**, so a pool member
   overhead beats a non-pool member underneath. Second, must-mirror copy at `cpm_schedule.js:159`.

## S2. The traced defect, end to end (Duplex `2O2Fr$t4X7Zf8NOew3FNhv`)
`IfcWallStandardCase`, Architecture, Level 1, seq=5, z[−0.20, 2.90] — a ground-floor wall on a
basement wall. 36 contacts, including six `IfcFlowSegment` pipes classified **bearing-BELOW**.

```
IfcWallStandardCase  seq=5  inPool=no    z[-1.25, 0.00]  bearing-BELOW   playedDay=0.50
IfcSlab              seq=4  inPool=YES   z[ 2.79, 3.10]  carrier-ABOVE   playedDay=0.00  ◄ elected
```

E1 is `addEdge(des[i], i, SS, 1)` — **one edge, start-to-start** (`cpm_schedule.js:194`; SS defined
at `:9` as "cannot start until S starts"). Slab starts day 0.00 → wall starts day 0.00; the walls it
stands on start day 0.25 and 0.50. `h=0 eyeFloating=true · h=3 true · h=6 false`. The judge asks only
`support.s > me.s + 1` **of its own election** → false on both timelines. Three hours of a wall in
mid-air, reported clean.

## S3. `supportPool` is not an arbitrary phase filter — this was tested and the obvious fix is WRONG
`schedule_gate.js:1312` — `seq <= 4 || (IfcSlab && seq>4) || IfcStairFlight`.
Replacing it with a structural-CLASS regex re-admits **438 HHS `IfcPlate` whose `element_name` is
`Systemelement:Verglasung:…` — glazing.** `seq` is the OUTPUT of a cited name-based classifier
(`rates.js:277` §4D_FACADE_ORDER, `id: glazed_curtainwall_facade`), which is why HHS splits
IfcPlate 191 structural / 438 glass and Terminal has 33,324 structural IfcPlate.
- `B\C = {}` on Duplex and HHS — the shipped pool is a strict SUBSET of any structural-class pool.
- Measured minimal alternative: **`E = shipped ∪ IfcWall*`** — HHS bearing 3332→3761 for +207
  contradictions, vs the class regex's 3825 for +325. 87% of the gain, zero glass.
- ⛔ **GATE: §S26.2's own justification figure (Duplex "761 vs 1") does not reproduce from shipped
  code.** Resolve or formally retract it BEFORE the pool moves. The contradiction rise (974→1181)
  cannot be scored against a baseline nobody can recompute.

## S4. The support fix breaks three witnesses — and that is diagnostic, not incidental
Branch `fix/support-pool-walls` (unmerged): HHS 783→355, Duplex 104→48, Hospital Bar midair 92→58 —
but Terminal bandInversions 0→74, Clinic drops off the CELL path, Duplex zone-display floating 22→62.
**Every downstream subsystem is calibrated against the wrong support relation.** You cannot converge
by improving a proxy while four consumers are fitted to its errors. **Do not chase Terminal's 74
until S5 is answered** — that tunes the app to guess-v2.

## S5. ⛔ PARTIALLY RETRACTED 2026-08-26 — see S7. Provenance is real, but it does NOT solve support.
Three layers of discarded truth, all measured 2026-08-26:
1. **Authored topology never read.** `tools/extract.py` reads `IfcRelAssociatesMaterial`,
   `IfcRelDefinesByType`, `IfcRelVoidsElement`/`FillsElement`, `IfcRelAggregates`, containment.
   It does **not** read `IfcRelConnectsElements` / `IfcRelConnectsPathElements`, and **never reads
   `Pset_*.LoadBearing`.** Prior art exists in-repo: `tools/mine_geomap.py:268`,
   `tools/rooms_from_topology.py:131`.
2. **What IS extracted does not ship.** `extract.py:293` creates and populates `rel_fills_host`
   (R21, `:657-689`). Across all eight fleet DBs: `rel_fills_host` **ABSENT ×8**, `rel_aggregates`
   **ABSENT ×8**, `rel_contained_in_space` present in 5 of 8. `ScheduleGate.hostPairs:151` then
   re-derives that same relation geometrically.
3. **Real geometry present, unused.** `component_geometries` holds triangle meshes (HHS 4,710 rows,
   `vertices`/`faces` BLOBs). Every support predicate reads `element_transforms.bbox_*` instead.
   An AABB cannot express contact, bearing direction, or enclosure.

**The renderer draws meshes. The judge computes over boxes. Two models, one screen.** That is the
blindness for CONTACT. But see S7: the support RELATION is not authored in IFC at all, so extraction
cannot supply it. S5 items 1-3 remain true as facts; the conclusion drawn from them was wrong.

---

## S7. ⛔ POC RESULT — EXTRACTION DOES NOT SOLVE THE HELL. MEASURED, NOT ARGUED. (2026-08-26)
`scripts/poc_ifc_support_provenance.py`, run on the traced Duplex wall's own source
(`Ifc2x3_Duplex_Federated.ifc`, IFC2X3) plus `SampleHouse_ARC.ifc` and `Clinic.ifc`.

**1. IFC has no vertical support relation. Any building, any schema.**
```
Duplex        IfcRelConnectsElements=82  PathElements=82  VERTICAL=0
SampleHouse   IfcRelConnectsElements= 8  PathElements= 8  VERTICAL=0
Clinic                                 0               0  VERTICAL=0
Duplex connection types: ATEND/ATSTART 22 · ATPATH/ATSTART 21 · ATPATH/ATEND 16 ·
                         ATSTART/ATEND 16 · ATEND/ATEND 4 · ATEND/ATPATH 2 · ATSTART/ATPATH 1
```
`IfcRelConnectsPathElements` is **planar wall-end joining only**. The traced wall has 5 authored
connections — all to walls on its own level — and **the wall it stands on is NOT among them.**
There is no `IfcRelSupports` in the schema. "Stands on" is never authored; it must be computed.

**2. `LoadBearing` would elect the SAME wrong element.**
```
target  2O2Fr$t4X7Zf8NOew3FNhv  IfcWallStandardCase  LoadBearing=False  "Exterior - Brick on Block"
below   2O2Fr$t4X7Zf8NOew3FK80  IfcWallStandardCase  LoadBearing=True   "Foundation - Concrete 417mm"
elected 1hOSvn6df7F8_7GcBWlRqU  IfcSlab              LoadBearing=True   "Wood Joist with Subfloor"
```
A `LoadBearing` pool contains **both** the wall below and the slab above. With no direction guard the
slab overhead still wins. **`LoadBearing` changes eligibility, not direction.** Coverage is 54.1% on
Duplex anyway (35 true / 50 false / 72 absent of 157); 71.7% on SampleHouse.

**3. The deepest finding: 4D is not asking a structural question.**
The target wall is `LoadBearing=False` — a non-structural exterior partition — and it still must be
built after the foundation wall beneath it. **"What carries load" and "what must be built first" are
different questions.** Even perfect provenance answers the wrong one.

### What S7 changes
- ⛔ **The coverage probe (old step 1) is DONE and the answer is "absent."** Do not re-run it.
- The fix is **geometric, not archival**: the direction guard on both election copies, then
  ground-reachability (D1) over mesh contact (D2). Provenance is not on the critical path.
- S5's items 1-3 stay true and stay worth fixing — `rel_fills_host` ABSENT ×8 is still a real
  regression, and host/opening IS authored. It is just not the midair fix.
- Whoever reasons about this next: **the temptation to reach for IFC metadata is now closed by
  measurement.** The building never wrote down what holds what.

---

## S5-ORIGINAL (kept for the facts, conclusion superseded by S7)

## S6. The user's ENCLOSURE rule — measured, and it holds with one guard
*"Midair is all OK as long as it is within walls, floor slab and a roof."* Probe:
`bim-ootb scripts/probe_enclosure_rule.js` (PR #1545, base `44f42dd`). R=5m, K=2, guard ON:

| | day-0 photo | des=-1 blind | played-783 | whole movie | worst concurrent left |
|---|---|---|---|---|---|
| HHS 6,839 | **0/15 forgiven** | 0/62 | 509/783 | 90.1% | 63 (d19) |
| Terminal 48,428 | **0/23 forgiven** | 49/118 | 537/2355 | 60.9% | 645 (d79) |
| Duplex 1,119 | 5/22 | 4/26 | 10/104 | 53.6% | 15 (d6) |

- The photograph is forgiven **zero** times on HHS/Terminal at every R∈{2,5,10}, K∈{0,1,2,4}.
- `NOGUARD=1` reproduces the Duplex misfire (5→9, two of them walls). **Never forgive a load-bearing
  class** — a floating wall is visible.
- **The wall clause does almost nothing** (K=0 → 93.6% vs K=2 → 91.6% on HHS; identical on Duplex).
  The slab sandwich carries the rule. It is a TOLERANCE, not physics — it must gate `unforgiven`
  while `eyeFloating` stays the reported number.

---

# THE DESIGN — what to build

## D1. The correct midair test is GROUND-REACHABILITY, not a neighbour test
Over the elements visible at time *t*: root the contact graph at everything whose `bz ≈ ground
datum`, flood-fill through contacts, and anything unreached is floating. This is what the eye does.
It collapses `census()` / `midairAudit` / `auditFloating` into ONE definition; it dissolves #1435's
symmetric-vs-directional question (reachability is direction-free, and "I hang from a carrier" is
correct by construction — you are supported iff your carrier is); and `des = -1` and the
grounded-exemption stop being special cases, because they are simply unreachable.

## D2. The visual judge that is not a screenshot: raycast the scene graph
The 4D canvas already holds true geometry at time *t*. For each visible element, cast a ray down and
ask what it hits and when that thing appears. `Raycaster` against the BVH the viewer already builds —
numeric, reproducible, assertable. Enclosure (S6) becomes "does a ray up and a ray down both hit
something already placed." **Sample instants, never per frame** — the enclosure probe uses 42 daily
samples on HHS and that is the right shape.

## D3. One persisted support graph, computed once, read by all four consumers
Authored IFC relations where present; mesh contact where not. Persist as a table. This permanently
closes the divergence disease — 4D_BAR_MODEL §9.4 (re-derived judge), §14.3 (wrong stage), §17.2
(blind metric) are three costumes of *two derivations of one fact*.

---

# ⛔ ORDER OF WORK

0. ~~COVERAGE PROBE ON THE SOURCE IFCs~~ — **DONE 2026-08-26, answer = ABSENT. See S7.**
   Superseded text kept below for the method; do not re-run it.

1. ~~COVERAGE PROBE ON THE SOURCE IFCs — do this first, it is hours not weeks.~~ (DONE, see S7)
   For every fleet IFC (locations: `MEMORY.md` → `reference_source_ifc_locations.md`), count
   `IfcRelConnectsElements` + `IfcRelConnectsPathElements` edges and the fraction of elements
   carrying `Pset_*.LoadBearing`. Three outcomes, all decisive:
   - **dense** → the pool question dissolves; `LoadBearing` replaces `seq<=4` with an extracted fact
     and the 761-vs-1 gate (S3) stops blocking.
   - **sparse** → hybrid, and the coverage number names which elements remain guesses.
   - **absent** → you have MEASURED that guessing is necessary; go to mesh-face contact with normals,
     where direction is free (a bearing surface points up, so a slab overhead can never be elected).
2. **Ship `rel_fills_host` + `rel_aggregates` into the viewer DBs** and make `hostPairs` read them
   instead of re-deriving. Smallest possible proof that provenance beats inference.
3. **Build the reachability judge (D1)** against `kernel_ops.start_ts`. Expect it red immediately —
   that is the point. Gate it, with the #1435 lock fixed in the SAME commit (the witness is already
   known not to track the judge: breaking the shipped judge 86,400,000× leaves
   `witness_midair_zero` at `pass=49 fail=0`).
4. **Then** the class guard on BOTH copies of the election (`support_sweep.js:465` +
   `cpm_schedule.js:159`, one commit) and the S3 pool decision.
5. **Then** Terminal's 74 band inversions — not before.

---

# §1 ASSESSMENT — Gemini's "Structural Sequence Oracle" proposal (2026-08-26)

**Right nail, wrong hammer, and written against a schema that does not exist.** Keep the framing;
do not implement it as specified.

## What it gets right
- Downward trace + a hard gate rather than a log line. Correct — `4D_BAR_MODEL.md` §12.5 lesson 7 is
  *"a logged number no invariant reads defends nothing."*
- Naming the check as a first-class rule rather than a helper.
- "Oracle" framing: the judge is a separate concern from the scheduler. That is why this file exists.

## Seven defects, each measured this session
1. **It uses the AABB again.** *"Trace its Axis-Aligned Bounding Box downwards."* That is the exact
   predicate that produced the hell — see S2, where six pipes are classified bearing-BELOW a wall.
2. **`bom.depth < target.depth` is the wrong ordering.** The 4D order is not BOM depth; it is the
   solve, then a per-task affine rescale. 783 HHS elements float ONLY on the played timeline (S1.1).
   The only honest clock is `kernel_ops.start_ts`.
3. **A 5mm scan under the bottom face flags every hanging element as a violation.** The traced duct
   elbow has 8 contacts, all carrier-above, and hangs legitimately. `carrier-above` is already a
   support class in this codebase.
4. **One-level check, not reachability.** Cannot see three mutually-supporting elements floating as a
   cluster, and cannot distinguish an orphan from a data gap. See D1.
5. **The schema is not there.** `elements_meta` in the shipped viewer DB is 8 columns — `guid,
   ifc_class, element_name, storey, discipline, material_name, material_rgba, building`. There is no
   `elements_rtree`, no `min_x/max_x/min_z`, no `product` column, and no `m_bom_line`. Every query in
   the proposal fails on the real fleet.
6. **`FATAL_COMPILATION_ERROR` is unusable on real IFCs.** 63/6839 HHS elements are structurally
   uncountable and 30.8% have no storey at all. A fatal gate refuses to compile every real building
   on day one. It must be a counted metric with a committed baseline, like everything else here.
7. **It solves detection; the defect is ELECTION and PROVENANCE.** Nothing in the proposal touches
   `support_sweep.js:465`, and nothing touches the fact that the building already told us what holds
   what and the extractor dropped it (S5).

## The one line worth keeping
*"See geometry through the lens of topological dependencies."* Correct — but the topology should be
**read from the IFC**, not re-inferred from boxes. That is step 1 of the order of work.

---

## S8. ⛔ THE DIRECTION GUARD, MEASURED ON BOTH COPIES — NECESSARY, NOT SUFFICIENT (2026-08-26)
One line, both copies, clean baseline `origin/main` @ `7c8c599` (PR #1545 merged; no pool change):
```js
if (poolJ >= 0 && poolCls <= bestCls) { bestJ = poolJ; bestCls = poolCls; }
```
`support_sweep.js:465` + `cpm_schedule.js:159`. Probe: `scripts/probe_floating_guid_audit.js`.

| metric | Duplex | HHS | Terminal |
|---|---|---|---|
| `§FGA_TIMELINE_MISMATCH` played-floating | 104 → **76** ✅ | 783 → **813** ⛔ **worse** | 2355 → **1883** ✅ |
| `§FGA_JUDGE_BLIND` des=-1 | 28 → **12** ✅ | 63 → **53** ✅ | 354 → **273** ✅ |
| `§CPM_RUN` stragglers | 639 → 354 ✅ | 3249 → 2328 ✅ | 9941 → **11970** ⛔ worse |

**Read it correctly.** `judgedOnCPMtimes=0` in EVERY run, before and after — all movement is in the
played column, i.e. downstream of `_tmRescaleToTaskWindow`. The guard measurably improves the support
graph itself (des=-1 down 57%/16%/23% — the class winner now survives instead of being replaced by a
carrier-above that the grounded clause then discards). **HHS's 783→813 is not the guard failing; it is
the rescale redistributing a different set of elections.** You cannot score a support fix through a
transform that re-orders across task boundaries.

**Conclusion: ship the guard, but not first, and not alone.** §14.6's ordering is confirmed by
measurement — delete the rescale, THEN re-measure the guard. Anyone quoting 783→813 as evidence the
guard is wrong has repeated §14.3's error (right change, wrong stage).

## S8b. ⛔ RESCALE DELETED FIRST — THEN THE GUARD IS UNAMBIGUOUS. (2026-08-26)
Same baseline `7c8c599`. `NORESCALE=1` in `probe_floating_guid_audit.js` short-circuits stage 5, i.e.
simulates `_tmRescaleToTaskWindow` being deleted and `kernel_ops` taking the CPM leaf times directly.

| | Duplex | HHS | Terminal |
|---|---|---|---|
| played-floating, rescale ON, no guard | 104 | 783 | 2355 |
| **played-floating, rescale OFF** | **0** | **0** | **0** |
| played-floating, rescale OFF + guard | 0 | 0 | 0 |
| `floatingToEye` @DAY0 HR3, rescale OFF | 7 | 4 | 12 |
| **`floatingToEye`, rescale OFF + guard** | **1** | **3** | **3** |
| des=-1, rescale OFF | 28 | 63 | 354 |
| **des=-1, rescale OFF + guard** | **12** | **53** | **273** |
| stragglers, rescale OFF | 639 | 3249 | 9941 |
| stragglers, rescale OFF + guard | **354** | **2328** | **11970** ⛔ |

**100% of played-timeline floating is manufactured by the rescale.** Not most — all of it, on all
three buildings. §14.3 is confirmed to the element.

⚠ **That 0 is partly tautological** and must not be quoted as "no elements float": with the rescale
gone, played == CPM, and CPM is 0 *by the judge's own election*. It proves the rescale is the sole
source of THAT metric's failures — nothing more. The independent metric is `floatingToEye`, which
uses no election at all, and there the guard is a real win on all three (**7→1, 4→3, 12→3**).

**Verdict: the sequencing is correct and now measured.** Delete the rescale, then ship the guard on
both copies. One open item: **Terminal stragglers +20% (9941→11970)** — almost certainly the source
of the 74 band inversions on `fix/support-pool-walls`. Explain that before merging, not after.

## S10. ⛔ WHY BAR/TEMPLATE SEPARATION CANNOT SOLVE IT ALONE — THE FUNDAMENTAL LAYER (2026-08-26)
User: *"isn't each bar containing the element sets... why not position them as the template already
cleanly separated them?"* Measured — `bim-ootb scripts/probe_intrabar.js`, branch
`probe/intrabar-share`. BEARING-BELOW pairs only (real gravity), asking whether the support sits in
the element's OWN (phase × storey) bar:

| | Duplex | HHS | Terminal |
|---|---|---|---|
| support in the **SAME bar** — template has no authority | **10.2%** | **28.9%** | **69.3%** |
| support in a different bar — template/ladder DOES order it | 89.8% | 71.1% | 30.7% |
| … different PHASE | 81.6% | 57.4% | 23.0% |
| … different STOREY | 50.8% | 38.6% | 22.1% |
| elements with **NO bearing-below at all** | 15.5% | 21.7% | 8.9% |

**The instinct is right and already working — for the cross-bar share.** That is why Duplex is 17
midair and not 4,706: 89.8% of its gravity crosses a phase or storey boundary and the template orders
it for free.

**It cannot work intra-bar, and that is the whole problem on Terminal (69.3%).** Inside one bar the
template has said everything it has to say; the leaves still need an order, and that order is the
support relation. This is why Terminal is worst in every table in this lane (513 vs Duplex's 17) —
not size, but that its physics lives *inside* its bars. Confirms `bar_model.js:436` directionally.

**Third row kills the fallback:** 8.9–21.7% of elements have NO bearing-below contact at all. Nothing
beneath them can order them; bar containment is the only thing positioning them.

### The law
> **A bar is a CONTAINMENT constraint. The support graph is a PRECEDENCE constraint. Both necessary,
> neither sufficient.** They nearly coincide on a duplex — which is why the intuition is reasonable,
> and why it fails first on the biggest building.

**Do not "spread evenly inside the bar."** It randomizes the 69% Terminal gets right today, and
collapsing to the bar start is the `§TPL_ZERO_MINUTE` pile-up already on record (18 identical
`§GANTT_OPS_FIRST20` entries when everything clamped to one instant).

## S11. THE BOM-INJECTION ROUTE — right shape, one blocker (2026-08-26)
User: *"or use the BOM hierarchy which requires the Java-era mechanism to inject first, similar to
room space?"*

**Using EXISTING BOM depth does not help.** BOM depth is containment (building→floor→room→set→leaf),
the same *kind* of relation a bar already encodes. It helps exactly where bars help (cross-bucket)
and is silent exactly where bars are silent (intra-bucket, S10). A wall standing on a wall is two
SIBLINGS at one depth.

**INJECTING a support level is the right idea, and it is the established doctrine here.** Rooms are
compiled from geometry (`build/room_walker.js`, `scripts/compile_rooms.py`) precisely because IFC did
not carry them usefully; S7 measured that IFC does not carry "stands on" either. Same problem, same
answer: compile the relation, don't look for it. And it matches the paper's own thesis — if the
PARENT is the supporting element then `child.start = parent.finish + lag`, the tack convention
applied to time, and the BOM walk IS the schedule.

**⛔ The blocker: support is a DAG, a BOM line is a tree.** An element rests on several things.
Forcing one parent re-creates the election — the exact defect in S2/S9. Plus measured backwards-
support (Terminal 27, Hospital 38, HHS 35, Duplex 8) are cycles a tree cannot hold, and 8.9–21.7%
of elements have no parent at all.

**Resolution:** inject the relation as a **graph beside the BOM, not a level inside it** — the same
injection mechanism and the same "compile what IFC didn't author" doctrine, typed as a DAG because
the physics is a DAG. Keep the set (S9), root it at the ground datum (D1). Cycles get NAMED as data
defects per `4D_BAR_MODEL.md` §5.1, never scheduled around.

## S12. ⛔ THE INJECTED SUPPORT DAG — BUILT AND MEASURED. ZERO MIDAIR IS REACHABLE. (2026-08-26)
`bim-ootb scripts/probe_support_dag.js`, branch `probe/support-dag`, base `origin/main` @ `7c8c599`.
Support relation COMPILED from geometry (S7: IFC carries no "stands on"), **full set kept per element,
no election (S9)**. Judge is any-of: *at my start, is at least one thing I rest on already started?*

| floating (any-of judge) | Duplex | HHS | Terminal |
|---|---|---|---|
| base — `CpmSchedule`, one elected edge | 21 (intra 3 / cross 18) | 117 (38 / 79) | 1195 (158 / 1037) |
| per-bar topo layering | 255 ⛔ | 777 ⛔ | 4189 ⛔ |
| **ONE GLOBAL pass, full set, bar window as LOWER BOUND** | **0** | **0** | **0** |

| cost | Duplex | HHS | Terminal |
|---|---|---|---|
| makespan days, base → global | 7.6 → 5.9 | 41.8 → 24.3 | 80.6 → 79.3 |
| elements outside their OWN bar window | 0/1119 | 5/6839 | 10/48428 |
| intra-bar support **cycles** | 0 | 0 | 0 |

### What this settles
1. **Intra-bar ordering by the DAG works perfectly — 3/38/158 → 0.** S10's intra-bar share is fully
   solvable. Answered.
2. **⛔ Doing it PER BAR is worse than doing nothing** (21→255, 117→777, 1195→4189). Redistributing
   inside a bar breaks the cross-bar relations the template was already getting right (S10: 30–90%
   of gravity crosses bars). **A bar-local optimisation cannot be correct** — this is the measured
   refutation of "just position them inside their bar."
3. **Zero midair is REACHABLE on real data at 48k elements.** This is the real finding. It
   contradicts `4D_BAR_MODEL.md` §9.5's "design law" that midair and phase discipline trade at an
   exchange rate — with the full set and the window as a LOWER BOUND rather than a redistribution
   target, the exchange rate is **zero**.
4. **Every intra-bar support subgraph is acyclic on all three buildings.** The recorded backwards-
   support (Terminal 27, Hospital 38, HHS 35, Duplex 8) is a CROSS-bar phase-order problem, not an
   intra-bar one.
5. **The fix is not a new pass.** `CpmSchedule` already does a global forward pass. It is fed ONE
   elected edge per node instead of the full set. **Feed it the set and the election disappears** —
   with it, S2's direction bug, S3's pool question, the tie-break, and `des = -1`.

### ⚠ What this does NOT prove — read before quoting
- **`floating=0` is partly by construction.** The pass places each element after one of its supports
  finishes, which is what the judge tests. What it genuinely proves is **satisfiability**: no
  contradiction exists between the bar envelope and gravity. That was not known.
- **Crews are NOT levelled.** The makespan improvement (41.8 → 24.3 on HHS) is mostly unlimited
  crews, not a real gain. **The next measurement is what crew capping costs this schedule** — that
  decides whether this is a scheduler or a feasibility proof.
- The `noSupportAnywhere` population (167 / 1483 / 4081) is excluded from the judge by definition.
  Hangers and orphans are untouched; only bar containment positions them.

## S13. ⛔ WIRED INTO `CpmSchedule` AND MEASURED AGAINST THE USER'S OWN BAR (2026-08-26)
User's acceptance bar, verbatim: *"the holy grail is not perfection yet but usability and editable
correct start of ARCH, not stack issue and no MEP dangling before ARCH completes."*

`bim-ootb` branch **`feat/support-set-e1`**. `cpm_schedule.js` `buildGraph`: `SUPPORT_SET=1`
replaces the single `designatedSupport` E1 edge with **one edge per bearing-below contact**;
`SUPPORT_FS=1` makes them finish-to-start. Default path unchanged. Probe:
`scripts/probe_grail_criteria.js`.

| | Duplex BASE→SET_FS | HHS BASE→SET_FS | Terminal BASE→SET_FS |
|---|---|---|---|
| midair (any-of) | 21 → **0** ✅ | 117 → **0** ✅ | 1195 → **0** ✅ |
| **ARCH starts before its structure finishes** | 6/101 → **2** ✅ | 331/1422 → **111** ✅ | 466/1259 → **55** ✅ |
| **MEP starts before what it rests on finishes** | 99/904 → **2** ✅ | 39/3393 → **27** ✅ | 3468/11850 → **1466** ✅ |
| **band inversions** | 522 → **346** ✅ | 2949 → **1635** ✅ | 22757 → **17945** ✅ |
| makespan days | 7.6 → 7.6 | 41.8 → **29.5** ✅ | 80.6 → 84.8 (+5%) |
| **STACK max at one minute** | 15 → 12 ✅ | 11 → **255** ⛔ | 11 → **901** ⛔ |

### Four of five grail criteria met; one hard regression
- **Band inversions IMPROVE, on all three.** This is the number that killed the last three attempts
  (`fix/support-pool-walls` went 0→74 on Terminal). Removing the election **reduces** them 21–41%.
  The support relation and the band ladder were never in tension — the ELECTION was.
- **FS beats SS on every criterion** (HHS ARCH_early 164 SS vs 111 FS). *"Nothing appears before what
  it rests on has FINISHED"* is the right semantic, and it is the user's own sentence.
- ⛔ **STACKING is the blocker.** 381 (HHS) / 2,277 (Terminal) elements in piles ≥20 at one instant.
  Cause: with all-of edges many elements share one latest predecessor and land on the same minute;
  the single elected edge used to spread them by accident. **This is `§TPL_ZERO_MINUTE` returning.**
  Fix before merge — stagger inside the crew pass, not by jitter.

### ⚠ One metric of mine is bad — do not use it
`MEP_before_ARCH_complete` (measured against the LAST architecture element project-wide) rises
1127 → 3392 on HHS. That metric demands global serialisation — MEP on level 1 waiting for
architecture on level 3 — and the rise is an artifact of a SHORTER, more parallel schedule
(41.8 → 29.5 days). **`MEP_early` is the metric that matches the concern**, and it improves.

### Order from here
1. Fix the stacking regression (`§TPL_ZERO_MINUTE` pattern), re-measure all five.
2. Run the existing witness suite on `feat/support-set-e1` — S4's three reds must be re-checked
   against this, since the election is now gone rather than guarded.
3. Then the guard (§S8) becomes moot: with no election there is nothing to guard, and
   `_designatedSupport` can be deleted from BOTH copies instead of mirrored forever (§S9).

## S14. ⛔ STOP — §S13 IS PARTLY SELF-CERTIFYING, AND THE STACK FIX ALREADY EXISTS (2026-08-26)
User: *"Why are we going in circles... didn't we already solve stacking with the 4D_template model?"*
Re-examined. Three corrections, one of them to §S13's headline.

### 14.1 ⛔ §S13's `midair → 0` IS SELF-CERTIFYING. The shipped judge says 3154.
`§FGA_TIMELINE_MISMATCH`, HHS, `feat/support-set-e1`:
```
BASE     judgedOnCPMtimes=0     judgedOnPLAYEDtimes=783
SET_FS   judgedOnCPMtimes=3154  judgedOnPLAYEDtimes=3492
```
§S13's table used the **any-of judge over bearing-below** — the *same relation the scheduler was
built from*. A schedule built to satisfy a predicate satisfies it. **That is §9.4's error, committed
here.** The independent instrument — the shipped `_designatedSupport` + `_midairAudit` — goes
**0 → 3154** on the same data.

That number is not automatically damning (the shipped judge elects a slab 3m overhead, §S2, so its
verdict is suspect too). But **two judges now disagree by 3154 and neither is trusted.** No midair
claim from §S13 may be quoted until they are reconciled. Reconciling them IS the lane (D1).

### 14.2 The stacking regression is REAL — not a wrong-stage artifact
Checked at both stages, HHS:
```
BASE    rawCPM max=11  piles>=20=0   |  kernel_ops(played) max=12   piles>=20=0
SET_FS  rawCPM max=255 piles>=20=376 |  kernel_ops(played) max=139  piles>=20=315
```
The rescale halves it (255→139) and does not remove it. 315 elements still land in piles of ≥20 on
the timeline that actually plays.

### 14.3 ⛔ I MISLABELLED IT, AND THE FIX ALREADY EXISTS IN CODE SCHEDULED FOR DELETION
`§TPL_ZERO_MINUTE` (§S65) is about **duration** — `resource:null`, missing `default_productivity`,
CARPENTER/FINISHER productivity gaps, `IfcRoof` 8→6 — elements falling to the 120s floor and drawing
a zero-WIDTH bar. **It is not about simultaneous starts.** Calling my regression "§TPL_ZERO_MINUTE
returning" was wrong and is exactly the kind of stale-label reuse that makes a lane feel circular.

**The thing that DID solve stacking is `remapSolveToTasks` (`schedule_author.js:884`)** — the
template path's remap:
```js
if (span <= 0) {   // Degenerate: everything solved at one instant.
  // Spread evenly, in a deterministic order, so the bar shows work progressing
  // instead of one silent stack at its left edge.
  var step = (wE - wS) / Math.max(1, ordered.length); ...
}
...
if (ne <= ns) ne = ns + 1;   // never a zero-width element
```
**`4D_BAR_MODEL.md` §13.1 lists `remapSolveToTasks` as "DELETE NOW, no conditions — dead code, zero
risk."** It is dead only because no production caller passes `opts.template` (verified). The circle
is: the template solved stacking → the template was never wired → it was ruled dead → the election
was removed → stacking returned → "fix it in the crew pass," i.e. rebuild what is about to be deleted.

### 14.4 "Apply the template back at the end" — right instinct, ONE PART ONLY
User, same turn. Correct, but take only **two clauses**, not the function:
- ✅ the **degenerate spread** (`span <= 0` → even, deterministic order)
- ✅ the **never-zero-width** clamp (`if (ne <= ns) ne = ns + 1`)
- ⛔ **NOT the affine branch** (`scale = (wE - wS) / span`). That is `_tmRescaleToTaskWindow` in
  another costume, and §S8b measured that the affine per-task remap manufactures **100%** of
  played-timeline floating (104/783/2355 → 0 when removed). Re-applying it at the end re-imports
  the defect §14.6 exists to delete.

**So: extract the spreader, do not re-adopt the remap.** Before deleting `remapSolveToTasks`, lift
those two clauses out — otherwise the deletion loses a real fix, which is what §13.1's "zero risk"
grading missed a second time (§S15.5 caught the first).

## S9. THE DESIGN ANGLE — do not guard the election, DELETE it
`_designatedSupport` reduces 36 contacts to 1 so the DAG gets one edge per node. **Every defect in
this file lives in that reduction:** direction (S2), eligibility (S3), tie-break (the traced wall wins
only because its top is 0.00 vs the pipes' −0.45 — invert those and a pipe is elected), and des=-1
(S1.3). It is also duplicated in two files that must be hand-mirrored.

`bar_model.js` already does the right thing — `contact` / `bearing` / `needs` / `hardNeeds` are
**lists**, and `attachContacts` (§BAR_CONTACT) installs the judge's own contact relation as the any-of
set. The scheduler already works with sets; only the judge collapses to one.

**Judge on the set:** *at time t, is at least one of my below-contacts placed?* No election → no
direction bug, no tie-break luck, no pool question, and no exemption (an element with an empty
below-set above ground is FLOATING, not uncountable). This is already written and already running:
it is `eyeFloating()` in `probe_floating_guid_audit.js` / `probe_enclosure_rule.js`. **The better
judge was built as an instrument and never adopted as the metric.** Promote it, root it at the ground
datum (D1), and `_designatedSupport` can be deleted rather than guarded in two places forever.

---

# INSTRUMENTS (do not rebuild these)
- `bim-ootb scripts/probe_floating_guid_audit.js` — replays the live chain to `kernel_ops`; judge
  REQUIRED from `support_sweep.js`, never re-derived. Produces §FGA_EYE_FLOATING / §FGA_JUDGE_BLIND /
  §FGA_TIMELINE_MISMATCH.
- `bim-ootb scripts/probe_enclosure_rule.js` — the S6 tolerance, fleet-measured. `TRACE=<guid>` dumps
  one element's full mechanics incl. `supportPool` membership per contact; that mode produced S2.
- Both on `probe/floating-guid-audit`, **PR #1545**, base `44f42dd`.

# ⛔ RESUME HERE
Nothing started. Step 1 (the coverage probe) is unclaimed and blocks the most.
