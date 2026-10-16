# 4D BAR MODEL — SPEC

> **⚠ READ `prompts/4D_MODEL_INTEGRITY.md` FIRST (opened 2026-08-26).** It carries the model
> construct, the separation-of-concerns table every defect in this file violates, the
> addressing/default-bucket findings, and the geometry rules — including the measurement that
> §14.2's *63 uncountable elements* are really **10** once enclosure is applied. A witness
> cannot rescue a poor construct; check the design there before adding a gate here.

## ⚠ DO NOT REMOVE
**Scope:** replace the 4D scheduling chain with ONE model: a `Bar` base type, a composite tree, and a
single resource-constrained pass. **Read the output log after every run — exit code is not evidence.**
Honour this block until the lane is DONE. Spec lives here; findings append here, NOT to `MEMORY.md`.

**Origin:** user, 2026-08-25 — *"in Java thinking its use of interface inheritance classes model is
simple as Object"* · *"inherit a first Object a 'bar' defined as start/stop like any gant chart bar"*
· *"like Java class properties etc.. the OOP already sorted software design out"*.
Predecessor analysis: `4D_SCHEDULE_PERFECTION.md` §S68–§S71.

---

# SETTLED STATE — READ THIS FIRST

> **⛔ NOT LIVE. BUILT, NOT SHIPPED — corrected 2026-08-26 (§15.1).** bim-ootb PR #1543
> (`§BAR_LIVE`, `sw.js` v1090) is **OPEN / mergeStateStatus BLOCKED, `mergedAt: null`**.
> `git grep barModel origin/main` and `git grep BAR_LIVE origin/main` both return **nothing** —
> `origin/main` is at `44f42dd` (#1542, the Bar model CORE) and the live 4D authoring path is still
> the legacy one. The wiring (`opts.barModel` at all four call sites, `viewer.html` calling
> `loadFourDPolicy()`) exists **only on the unmerged #1543 branch**. §11's title says SHIPPED; read
> it as BUILT. **Every midair number below is UNSAFE — see §14.5 and §15.2.**
*(formerly §10.6 CONSOLIDATION — moved to the top of this file 2026-08-26, retitled, so a fresh
session sees the settled position before the history in §1–§10.5 below, which records its corrections
IN PLACE and will hand you withdrawn claims if read linearly. The label "§10.6" stays live — every
cross-reference elsewhere in this file or in `4D_SCHEDULE_PERFECTION.md` that cites "(§10.6)" still
means this section. A one-line stub sits at its old position, end of file.)*

**Where §1–§10.5 and this section disagree, this section (§10.6) wins.**

### Numbers, judged by `census()` sliced from `witness_midair_zero.js`
| | Duplex | HHS | Hospital | Terminal |
|---|---|---|---|---|
| shipping midair | 17 | 147 | 139 | 226 |
| **Bar model midair** | **12** | **70** | **92** | **336** |
| shipping band inversions | 64 | 654 | 29,013 | 30,318 |
| **Bar model band inversions** | **1** | **0** | **4** | **4** |
| phase stacking · zero-min · outside-bar · crew | **0** | **0** | **0** | **0** |

`witness_bar_schedule` 13/13 · `witness_bar_composite` 12/12 · `witness_bar_needs` 15/15 ·
suite `green=62 new_red=1 known_red=7` (the red is the long-standing unrelated
`witness_cpe_buildup_require_tm_first`).

### WITHDRAWN — do not act on these, they are still in the text below (§1–§10.5)
- **§9.5's recommendation** (partition by phase only) — withdrawn by §9.6. Phase-only is WORSE than
  shipping on band inversions: Hospital 48,589 vs 4. §9.5's *law* stands; its conclusion does not.
- **§9.4's superseded numbers** — the integration probe's `0/4/0/0` midair. Real judge: `18/129/124/697`.
- **§10.3 item 5's original text** — "elevation VERIFIED ABSENT / fix the extractor". Wrong on both.
- **`correctLevelsByGeometry`** — added and DELETED the same session. It was a symptom patch for the
  storey gap: 1,986 fires on Terminal, 0 once levels are right. Removing it is free on three
  buildings and takes Terminal 513 → 336.

### The three open items, in order
1. **`room_walker.js:1352`** — emit a `COMPILED` storey row for every distinct `elements_meta.storey`,
   not only room-bearing ones; widen `stZ` to match. Room lane's file. Predicted Terminal 336 → 48.
2. **Fold the scratchpad probes into `witness_bar_schedule`** (§10.3 item 1) — every §9 number came
   from `/tmp` scripts that no longer exist. Without this there is no regression detection.
3. **§8 DELETE LIST** — untouched. Until it is done this lane has ADDED a translator, not removed five.

### Still true and unchanged
The five policy lines each earn their place by a measured margin (§9.6). The design law (§9.5) holds:
midair and discipline trade at an exchange rate set by how the partition cuts across gravity. The
composite rule (§2.1, only leaves store time) holds — 119,565 rows, gated.

---

## §1 WHY — the four hells are one defect

`prompts/4D_SCHEDULE_PERFECTION.md` §S68 established that **the solver has no concept of a phase**
(`phaseTrade` is keyed by `collapsePhase(el.STOREY)` — a storey-name normaliser with a phase-sounding
name). §S71 established that midair, stacking, zero-minute and movie-vs-bars are **not four bugs**.
They are four symptoms of one structural defect:

> **Element time and task time are stored separately, in two modules, with no shared type — so every
> crossing needs a translator, and every translator is where a hell got in.**

The translators, all five of which this spec deletes:

| translator | direction | stores |
|---|---|---|
| `ScheduleGate.deriveZones` | elements → tasks | task times as an ENVELOPE |
| `ScheduleAuthor._writeTemplateSchedule` (§S69) | template → tasks | task times as a WINDOW |
| `ScheduleAuthor.remapSolveToTasks` (§S70) | tasks → elements | element times, to match the windows |
| `§DEQ_REPAIR` 16-sweep loop | elements → elements | repairs what the gates broke |
| `§CREW_CAP_FINAL` re-pack (§S67) | elements → elements | repairs what the repair broke |

OOP names the violations exactly: **encapsulation** (two stored copies of one fact), **Liskov** (no
common supertype, hence translators), **open/closed** (`placeNonst`'s
`Math.max(gg, wg, hangGate, openingGate, hostGate, tg, bg, slot.time)` — eight terms, edited by every
new rule), **single responsibility** (`supportPool` re-derived by hand instead of called — measured
cost: 4,706 Duplex edges instead of 716, and 52 midair instead of 0).

---

## §2 THE MODEL

```java
class Bar {                                  // the root Object
    long start, stop;
    long    duration()        { return stop - start; }
    boolean contains(Bar b)   { return b.start >= start && b.stop <= stop; }
    boolean overlaps(Bar b)   { return start < b.stop && b.start < stop; }
}

interface WorkBar extends Bar {
    long              work();                // seconds of labour
    Trade             trade();               // whose crews
    List<WorkBar>     needs();               // must finish first
    List<WorkBar>     children();            // empty = leaf
}
```

```
Bar
 └─ WorkBar
     ├─ ElementBar   leaf.       start/stop STORED.    children() = []
     └─ GroupBar     composite.  start/stop COMPUTED = min/max of children
         ├─ TaskBar     (phase × level)
         ├─ LevelBar
         └─ ProjectBar
```

### §2.1 THE ONE RULE
**Only leaves store time. Every group derives it.**

`GroupBar.start` is a **getter**, never a field. This is the whole spec in one line: with one stored
timeline there is nothing to reconcile, so no translator can exist, so no hell can enter through one.

Consequences that become **true by construction, not by test**:
- a bar contains its own elements — `contains()` is a tautology on a `GroupBar`
- the movie and the bars are the same numbers — there is only one set
- a phase bar cannot disagree with its contents

---

## §3 `needs()` — ONE LIST, MANY PROVIDERS

Every constraint becomes an edge. **No priority ordering, no `Math.max` line, no gate arithmetic.**

| provider | source | edge |
|---|---|---|
| `SupportNeeds` | geometry, filtered by **`ScheduleGate.supportPool`** (§S26.2 — call it, never re-derive) | bearing element → supported element |
| `HostNeeds` | `ScheduleGate.hostPairs` | host → hosted (§HOSTED_BEFORE_HOST) |
| `CarrierNeeds` | geometry | carrier above → hanging element |
| `OpeningNeeds` | existing `openingGate` predicate | wall/curtain-wall → opening |
| `WallNeeds` | existing `wallGate` predicate | wall → promoted roof slab (§4D_WALLS_BEFORE_ROOF) |
| `PhaseNeeds` | `sequence_rules.json` phase order | `TaskBar(P,L)` → `TaskBar(next P,L)` |
| `LadderNeeds` | policy | `TaskBar(P,L)` → `TaskBar(P,L+1)` (§4D_BAND_MONOTONIC) |

**Adding a rule = adding a provider. The scheduler never changes.** That is the open/closed fix.

### §3.1 EXTRACTION IS MANDATORY
Every provider LIFTS an existing shipped predicate. **Do not re-derive one.** Verified cost of
re-deriving: hand-written "support = anything below" gave Duplex 4,706 edges / 52 midair; calling
`supportPool()` gave 716 edges / **0 midair**. §S26.2 had already measured and rejected that exact
definition. Cite the source function in a comment beside every provider.

---

## §4 THE POLICY FILE — all that is left of `4D_template.json`

Audited 2026-08-25: v1.2.0 was **123 lines, 146 keys, 52 of them prose**, and its data keys were
copies — `phases[].sequence` and `phases[].trades` duplicated `sequence_rules.json`; the ten
dependency edges restated the phase list order and one flag; `scope` and `replicate_per_level` were
the same fact twice, with an **invariant written to check they agreed instead of deleting one**.

Everything else is EXTRACTED. What survives:

```yaml
days_per_week:  7
phase_link:     serial          # FS+0 between consecutive phases on a level
level_link:     self            # a phase waits for itself one level below
building_scope: [Substructure]  # everything else repeats per level
```

`phase order` ← min sequence per phase in `sequence_rules.json` · `trades` ← union of that phase's
classes' resources · `level` ← `deriveBandRanks` · `work` ← `_installSecs` · `crews` ←
`LABOR_RATES.max_crews` · `shift` ← `rates.js SHIFT_HOURS`.

---

## §5 THE SINGLE PASS

```
schedule(ProjectBar root):
  tasks   = topological order of TaskBars over PhaseNeeds + LadderNeeds
  for each task:
      gate = max(stop of its needs())
      elements = its children, topological over their own needs()
      for each element:
          start = max(gate, earliest stop among its placed supports, earliest free crew of its trade)
          stop  = start + work()/1 crew
      # groups need no pass — their span is their children's
```

### §5.1 CYCLES ARE DATA DEFECTS, NOT SCHEDULING PROBLEMS
A support edge pointing backwards against phase order is a **cycle**. **Report it by name; never
schedule around it.** Measured backwards-support today: Terminal 27, Hospital 38, HHS 35, Duplex 8 —
e.g. `Architecture IfcWall` holding up `Superstructure IfcMember`, `Finishes IfcCovering` holding up
`MEP Rough-in`. Those are wrong classifications. The graph must name its own bad data.
`§BAR_CYCLE` — one aggregated line per (predPhase, predClass → succPhase, succClass), with counts.

---

## §6 MEASURED BASELINE — prototype, real fleet, 2026-08-25

Prototype (`Bar`/`GroupBar` + one pass, `supportPool` edges only):

| | Duplex | HHS | Hospital | Terminal |
|---|---|---|---|---|
| **midair** | **0** | **9** | **10** | **16** |
| zero-minute | 0 | 0 | 0 | 0 |
| element outside its bar | **0** | **0** | **0** | **0** |
| phase stacking | 2/34 | 0/29 | 1/65 | 0/105 |
| crew breaches | 0 | 0 | 0 | 0 |
| span | 8.7d | 44.6d | 292.3d | 84.4d |
| runtime | 29ms | 53ms | 1.4s | 0.7s |

Shipping today, for comparison: midair 17 / 147 / 139 / 226 (raw solve); elements outside their bar
up to **81%** (§S70); phase stacking 18% / 34% / — / 17% (§S68).

**Prototype caveats that the build must close, not inherit:**
1. only ONE support predicate was used (bearing via `supportPool`). Four shipped gates — wall, hang,
   opening, host — are not yet providers. **Expect midair to move when they are added.**
2. Hospital reported **1,194 classification cycles** (1.9% of elements). Unexplained. Explain before
   trusting any Hospital number.
3. phase stacking is not exactly 0 because the building-scope Substructure bar spans every level and
   overlaps level tasks — a prototype artifact of putting it under one `LevelBar`. `TaskBar(scope=building)`
   must hang off `ProjectBar`, not a level.

---

## §7 WITNESS CONTRACT

Start from `witness_kit/contract.js`. One witness per LAYER, layer named in the header
(`WITNESS_INTERFACE_FRAMEWORK.md` §CRISIS LESSON 1). Every gate carries its own red control —
`feedback_extract_dont_author_then_gate.md`: **a gate that checks two of my own fields agree is a
deletion request, not a gate.**

| witness | gates |
|---|---|
| `witness_bar_composite.js` | `GroupBar.start/stop` are GETTERS (no stored field, verified in source) · `contains()` holds for every group/child pair · leaf times are the only stored times |
| `witness_bar_needs.js` | every provider LIFTS a shipped predicate (cite + call, never re-derive) · edge counts match the source predicate's own count · `supportPool` is called, not reimplemented |
| `witness_bar_schedule.js` | midair · zero-minute · phase stacking · crew caps · float exists — fleet, real DBs |
| `witness_bar_cycles.js` | every backwards edge is REPORTED, none silently scheduled around |

Fleet: Duplex · HHS_Office_Federated · Hospital · Terminal (the four with measured baselines above).
**Hospital and Terminal are mandatory** — §S69's PLUMBER breach and §S71's midair both needed a tall
or large building to appear at all.

---

## §8 DELETE LIST — the lane is not done until these are gone
`deriveZones` · `_writeTemplateSchedule` · `remapSolveToTasks` · `§DEQ_REPAIR` loop ·
`§CREW_CAP_FINAL` re-pack · `_midairAudit` · `4D_template.json`'s 119 non-policy lines.

Each exists only to keep two stored copies of time in agreement. Remove the second copy and they
have nothing to do. **A PR that adds the Bar model without removing these has not done the job** —
it has added a sixth translator.

---

## ⛔ RESUME HERE
Spec written 2026-08-25. Build not started. Next: §9 build log, appended below as work lands.

---

## §9 BUILD LOG

### §9.1 CORE — DONE (bim-ootb PR #1537, 2026-08-25)
`viewer/bar_model.js` + `viewer/rates/4D_policy.json` + `witness_bar_composite.js`. Additive only,
nothing wired, no existing file touched.

`§WITNESS_BAR_COMPOSITE pass=12 fail=0 ran=119748` over all four mandatory buildings:

| | Duplex | HHS | Hospital | Terminal |
|---|---|---|---|---|
| elements | 1,119 | 6,839 | 63,182 | 48,428 |
| tasks / levels | 18 / 4 | 17 / 4 | 35 / 8 | 72 / 22 |
| span | 8.7d | 44.4d | 287.1d | 84.1d |

**`group-contains-every-child`: 119,748 / 119,748.** That is the number that was 54.5% Hospital /
35.4% Terminal / 18.8% Duplex under the pre-Bar code (§S70). It is now a **tautology, not a
measurement** — a group's span IS min/max of its children, so the check cannot fail without someone
reintroducing a stored group time, which `group-time-is-a-getter` catches in SOURCE.

Gates carry **4 per-gate red controls** plus the contract's own, per
`feedback_extract_dont_author_then_gate.md` — a gate added without proof it can fail is decoration.

Two §6 prototype caveats CLOSED here rather than inherited:
- a building-scope `TaskBar` hangs off `ProjectBar`, never a `LevelBar` (was 2/34 false stacking pairs)
- building-scope tasks collect elements from EVERY level (dropping upper ones lost 1 of Hospital's
  63,182, invisible in every other number)

Suite after: `green=60 new_red=1 known_red=7 total=68` — the one red is the long-standing unrelated
`witness_cpe_buildup_require_tm_first.js`, baselined in §S67.

### §9.2 NEEDS PROVIDERS — in flight
`viewer/bar_needs.js` (support · host · carrier · opening · wall), dispatched to a Sonnet agent with
§3.1's extraction rule as the hard constraint. Core takes `needs()` by injection, so the two compose
without touching the same files.

### §9.3 NOT STARTED
`witness_bar_schedule.js` (the fleet hell measurements — needs §9.2) · `witness_bar_cycles.js` ·
wiring · **§8 DELETE LIST**. Until §8 is done this lane has added a sixth translator, not removed five.

### §9.2 NEEDS PROVIDERS — DONE, plus two integration findings the providers alone could not show
> ⛔ WITHDRAWN by §10.6 — this section's INTEGRATED RESULT midair numbers (Duplex/HHS/Hospital/
> Terminal `0/25/10/16`) came from a hand-derived judge, not the real `census()`. Re-judged with the
> project's own sliced judge: `18/129/124/697` (§9.4). The structural findings (a) any-of vs all-of
> needs and (b) bearing-vs-support relation still stand — only the numbers below are wrong.

`viewer/bar_needs.js` (bim-ootb PR #1538, Sonnet agent) — `support · host · carrier · opening · wall`,
every provider lifted from a shipped predicate by balanced-brace slicing or by calling the exported
function. `§WITNESS_BAR_NEEDS pass=15 fail=0 ran=964091`; its anti-re-derivation gate matches the
real `computeSchedule`'s own `§GEO_ORDER edges=` count on all four buildings.
Agent-reported caveat, verified: `wall=0` on all four because `_buildScheduleElements` never runs
`_promoteRoofLoadPath()`, so `isPromotedSlab()` never fires on this element source —
`materializeZones` has the identical gap. Lift verified against a synthetic fixture.

**Integration then exposed two defects neither the core nor the providers could show alone.**

**(a) `needs()` is ANY-OF and ALL-OF, not one flat list** (PR #1540). An element's edges do not all
mean the same thing:
- `support`/`bearing` — **any-of**. Something must be under me. A slab on twelve columns starts when
  the first few are up; requiring all twelve serialises the frame and is not how anything is built.
- `host`, `carrier`, `opening`, `wall` — **all-of**. There is one host and you need it.

Flattened into a single `min()`: **HHS midair 609** — the soft support edge finished early and
satisfied the gate, releasing hosted and hanging elements before their host.

**(b) The scheduler must gate on the relation the JUDGE measures** (PR #1539). The provider emitted
geoGate's `below` — anything overlapping underneath, contact or not — while
`witness_midair_zero.js` `census()` tests **bearing contact** (`S.top_z >= E.base_z - GAP`).
Different sets, so the two could never agree: the any-of `min()` released an element on a distant
slab far below it while its real bearing neighbour was unbuilt. Provider now tags `bearing` vs
`support`; the model prefers bearing when present. Same edges, one more bit of information.

**INTEGRATED RESULT — `bar_model` + `bar_needs`, four buildings, real DBs:**

| building | midair | zero-min | outside-bar | stacking | crew | span | ms |
|---|---|---|---|---|---|---|---|
| Duplex | **0** | 0 | 0 | 0/29 | 0 | 8.8d | 5 |
| HHS_Office_Federated | **25** | 0 | 0 | 0/29 | 0 | 46.7d | 17 |
| Hospital | **10** | 0 | 0 | 0/60 | 0 | 294.7d | 105 |
| Terminal | **16** | 0 | 0 | 0/100 | 0 | 84.2d | 62 |

Shipping today: midair 17 / 147 / 139 / 226 (raw solve) · elements outside their own bar up to
**81%** (§S70) · phase stacking 18% / 34% / — / 17% (§S68).

**⛔ OPEN, reported not hidden: cycles are high — 329 / 2,716 / 9,911 / 3,668.** Hospital's 9,911 is
**15.7% of its elements**, force-placed because a hard need was unplaceable inside their task. This
is the §6 caveat 2 that the spec said must be explained, and it is bigger now that host/carrier/
opening are edges. **No Hospital number is trustworthy until it is explained.** Next task in this lane.

### §9.4 ⛔ RETRACTION — the integration probe's midair numbers were WRONG (2026-08-25)

**User: "Again without visual check, how sure are the WITNESS logging?" — asked twice. The second
asking caught a real error.**

`scratchpad/integrate.js` reported midair **0 / 4 / 0 / 0** (Duplex/HHS/Hospital/Terminal). Re-judged
with `census()` **sliced verbatim from `witness_midair_zero.js`** — the project's own judge, the one
the fleet baselines were set with:

| building | shipping (raw solve) | **Bar model, real judge** | probe claimed |
|---|---|---|---|
| Duplex | 17 | **18** | 0 |
| HHS_Office_Federated | 147 | **129** | 4 |
| Hospital | 139 | **124** | 0 |
| **Terminal** | 226 | **697** | 0 |

**Terminal is 3× worse than what ships. The Bar model is NOT yet better than the current engine.**
Every midair claim in §9.2 and §9.3 from the integration probe is withdrawn.

**Cause — the same mirrored-predicate error twice in one session.** `census()` counts a contact as
**bearing OR carrier OR embedded**, over **every** element. The probe's inline judge tested only
`supportPool`-filtered **bearing** — the exact relation the scheduler gates on. A judge built from
the scheduler's own predicate cannot contradict the scheduler. `probe_4d_midair_under_template.js`
(§S70) sliced the real `census()` and was right; when `integrate.js` was written the judge was
re-derived by hand instead.

This is `feedback_extract_dont_author_then_gate.md` in its other form: **re-deriving a predicate you
could have called is how a wrong result gets certified.** It cost 4,706-vs-716 support edges earlier
in the same session, and it cost this.

**Standing rule for this lane, from here:** the midair judge is `census()`, sliced from
`witness_midair_zero.js`, never reimplemented. Any probe or witness in this lane that measures
floating and does not slice it is invalid on its face.

**What survives:** `witness_bar_composite.js` (119,748 pairs) — it tests tree arithmetic, which is
self-contained and needs no external judge. The composite rule (only leaves store time) holds.

**⛔ RESUME: Terminal 697.** Find why the Bar model triples Terminal's midair while improving HHS and
Hospital. Worst cases are `IfcPipeSegment`/MEP Rough-in hanging 41d and `IfcValve`/MEP Rough-in 24d —
carrier relations, which the model treats as ALL-OF hard needs and which `census()` counts but the
probe's judge did not. Suspect the `ceiling_link` upward edge interacting with Terminal's 22 levels.

### §9.5 THE DESIGN LAW — midair and phase discipline are in direct tension (2026-08-25)

> ⛔ WITHDRAWN by §10.6 — phase-only is worse than shipping on band inversions (Hospital 48,589 vs 4).
> §9.5's *law* (midair and phase discipline trade against each other) stands; its §6 *recommendation*
> ("partition by PHASE, derive levels") does not — corrected by §9.6, which found level bars are
> load-bearing for band monotonicity.

**User: "Explore this design property issue. See what we can learn."** Held the graph, the crews and
the judge (`census()`, sliced) fixed; varied ONLY how elements are cut into bars.

| building (raw solve) | no partition | **phase only** | level only | phase × level |
|---|---|---|---|---|
| Duplex (17) | **0** | 17 | 47 | 14 |
| HHS_Office_Federated (147) | **1** | **43** | 899 | 86 |
| Hospital (139) | **1** | **22** | 2,885 | 228 |
| Terminal (226) | **0** | **0** | 1,558 | 413 |

Spans move the same way: unpartitioned 8/35/277/88d, phase×level 11/55/395/132d.

#### 1. The graph was never the problem
**Unpartitioned midair is 0/1/1/0 on the real judge.** One graph + the judge's own contact relation
+ crew caps schedules 63,182 Hospital elements with ONE floater. Every hell this lane chased came
from a layer above the graph.

#### 2. But unpartitioned has NO phase discipline at all
Derived phase bars from that same run: **every phase starts on day 0 and 15/15 phase pairs overlap.**
Terminal — Superstructure 0-88d, Architecture 0-52d, MEP Rough-in 0-88d, MEP Final 0-88d,
simultaneously. **That is hell #1, the overstacked Gantt, in its purest form.**

#### 3. A priority cannot fix that — measured, not assumed
Tried phase order as an RCPSP-style priority rule on the ready set instead of a barrier
(§BAR_PHASE_PRIORITY). **No effect: still 15/15 overlapping, still all day 0.** The reason is
resources, not ordering — **different trades have INDEPENDENT crew pools**, so a ground-floor pipe
crew is free to start on day 1 beside the frame crew, and no geometric constraint forbids it.
Priority orders the ready set; it cannot stop parallel trades starting in parallel.

**Therefore a phase TIME BARRIER is necessary. Discipline cannot emerge from physics.**

#### 4. The barrier's cost scales with how badly the partition cuts VERTICAL contact chains
Contacts are overwhelmingly vertical — a column meets the slab above, a wall meets the slab below.
- **A level boundary cuts straight across them** → catastrophic (Hospital 2,885, Terminal 1,558).
- **A phase boundary runs WITH gravity** (structure → envelope → services already respects it) → cheap.
- `contactsCutByBars` does NOT predict the damage (Duplex phase×level cuts 89.1% for 14 midair;
  Hospital level-only cuts 74.2% for 2,885). It is not how many are cut, it is WHICH.

#### 5. THE LAW
> **Midair and phase discipline trade against each other, and the exchange rate is set by how much
> the partition cuts across gravity. Partition along gravity (phases) and it is nearly free.
> Partition across it (levels) and it is ruinous.**

This is why every fix in this lane's history re-broke the other side, and why §S68's diagnosis
("the solver has no phase in it") was correct but incomplete: adding the phase necessarily costs
midair. The question was never whether to pay, only where.

#### 6. WHAT TO BUILD — partition by PHASE, derive levels
**Schedule on 6 phase bars.** Measured against the shipping engine:

| | shipping | phase-bar model |
|---|---|---|
| Duplex | 17 | 17 |
| HHS | 147 | **43** |
| Hospital | 139 | **22** |
| Terminal | 226 | **0** |

zero-minute 0 · elements outside their bar 0 · crew breaches 0 · phase order perfect.
**Levels become DERIVED children of the phase bar** — 19/17/36/73 reporting sub-bars, spans computed
by the composite, never gated. Free, because a GroupBar's span already IS its children's.

This also reconciles with LBMS: locations stay a reporting and production dimension, but they are
not a scheduling barrier — which is exactly why LBMS defines locations deliberately rather than
inheriting storey strings.

**⛔ RESUME: rebuild the tree as Project > Phase > Level > Element** (level as a derived group, not a
task), re-run the full fleet on `census()`, and gate it in `witness_bar_schedule.js`. Spans grow
against phase×level (Hospital 521d vs 395d) — price that before shipping.

### §9.6 ⛔ §9.5's RECOMMENDATION IS WITHDRAWN — level bars are load-bearing (2026-08-25)

**User: "Will this break our 4D template principle?"** Yes. Measured before acting, and it reverses
§9.6's predecessor.

§9.5 recommended partitioning by PHASE ONLY because it minimised midair. That optimised the one
number being watched and destroyed the one that was not. **§4D_BAND_MONOTONIC** — *"a trade may not
run ahead of ITSELF on the floor below"*, from the user's own report *"upper floors gets walled
first"* — counted as elements on storey rank r+1 starting before that trade's last element on rank r
finishes:

| building | shipping (raw solve) | **phase × level** | phase only |
|---|---|---|---|
| Duplex | 64 | **1** | 118 |
| HHS_Office_Federated | 654 | **1** | 3,857 |
| Hospital | 29,013 | **7** | **48,589** |
| Terminal | 30,318 | **14** | 29,993 |

**Phase-only is worse than the shipping engine**, by 48,589 on Hospital. `level_link: self` holds
inversions at 7 instead of 48,589 — **four orders of magnitude**. It is not a decorative policy line
and it cannot be dropped.

#### The trade is THREE-WAY, not two
| configuration | midair | band inversions |
|---|---|---|
| shipping | 17 / 147 / 139 / 226 | 64 / 654 / 29,013 / 30,318 |
| **phase × level** | 14 / 86 / 228 / 413 | **1 / 1 / 7 / 14** |
| phase only | **0 / 43 / 22 / 0** | 118 / 3,857 / 48,589 / 29,993 |
| no partition | **0 / 1 / 1 / 0** | (all phases day 0 — hell #1) |

**§9.5's LAW STANDS, its CONCLUSION DOES NOT.** Midair and discipline do trade against each other at
an exchange rate set by how the partition cuts gravity — but "discipline" is TWO constraints, not
one: phase order AND band monotonicity. Level bars cost midair and buy band monotonicity. §9.5
priced only half the purchase.

#### VERDICT — the 4D policy is VALIDATED, not broken
All five lines earn their place, each by a measured margin:

| policy line | what it buys | measured without it |
|---|---|---|
| `phase_link: serial` | phase order | every phase starts day 0, 15/15 pairs overlap |
| `level_link: self` | band monotonicity | 7 → **48,589** inversions (Hospital) |
| `ceiling_link: frame_above` | fit-out after the slab it hangs from | 9,911 → 1,765 premature placements |
| `building_scope` | Substructure once, elements not lost | 1 of Hospital's 63,182 silently dropped |
| `days_per_week` | the calendar | — |

**Keep `phase × level`.** It beats shipping on band inversions by four orders of magnitude and on
midair for the two smaller buildings; it is worse on midair for Hospital (228 vs 139) and Terminal
(413 vs 226). **That midair gap is the remaining work** — and §9.5 proved it is not the graph's
fault, since the same graph unpartitioned scores 0/1/1/0. It is the level-boundary cost, and the
target is to pay less of it without giving up the ladder.

**⛔ RESUME:** close the Hospital/Terminal midair gap WITHOUT weakening `level_link`. First idea to
test, not yet tried: the ladder currently chains whole level TASKS; chain the TRADE across levels
instead (the actual §4D_BAND_MONOTONIC wording is per-trade, not per-task), which may hold
inversions near zero while leaving elements freer to follow their contacts.

---

# §10 — WITNESS ACCURACY IS THE WHOLE JOB NOW. START A NEW SESSION HERE.

**User standing constraint, stated three times across 2026-08-25: there is NO visual check. The
`§` logs are the only channel. A number that is wrong is worse than no number, because it gets
believed.** This session produced one full retraction (§9.4) and two near-misses. Every one came
from the witness, not the code.

## §10.1 THE FIVE RULES THIS SESSION PAID FOR

**1. The judge is SLICED, never re-derived.**
`census()` comes out of `witness_midair_zero.js` by balanced-brace slice. §9.4: a hand-written inline
judge testing only `supportPool`-filtered BEARING reported midair `0/4/0/0`; the real judge — which
accepts bearing OR carrier OR embedded over EVERY element — reported `18/129/124/697`. **A judge
built from the scheduler's own predicate cannot contradict the scheduler.** Same error, same day,
cost `4,706` support edges instead of `716` (§S26.2's already-rejected definition, re-derived by hand).
→ *Any probe or witness in this lane that measures floating and does not slice `census()` is invalid
on its face.*

**2. Every gate carries its own red control, committed.**
The contract allows ONE `.redControl()`, which proves the WITNESS can fail — not that each GATE can.
`witness_4d_template.js` carries 10 per-gate controls, `witness_bar_composite.js` 4,
`witness_bar_schedule.js` 3. A gate verified once in a throwaway console is not verified.

**3. A gate that checks two of your own fields agree is a DELETION REQUEST.**
`4D_template.json` v1.2.0 had `scope` and `replicate_per_level` saying the same thing, with an
invariant written to check they matched. 123 lines / 146 keys, of which 4 were genuinely authored.
See `feedback_extract_dont_author_then_gate.md`.

**4. A fleet witness must key on the BUILDING as well.**
`witness_4d_movie_binds_bars.js` failed on its first run: task ids are phase+storey derived, so
`TASK_SUPERSTRUCTURE_LEVEL_1` exists in Hospital, HHS *and* Duplex. Grouping on `taskId` alone pooled
three buildings into one "task" and manufactured order inversions that did not exist.

**5. A crash is not a red, and a red is not a regression.**
A `/tmp/wt-*` worktree has NO `node_modules` — 5 witnesses died `Cannot find module 'sql.js'` and the
runner reported them `new_red`. `ln -s /home/red1/bim-ootb/node_modules <wt>/node_modules` first.
And BASELINE every `new_red` by stashing your own diff and re-running before calling it yours:
`witness_cpe_buildup_require_tm_first.js` has been byte-identically red all session and is nobody's.

## §10.2 WHERE THE NUMBERS STAND — judged by the sliced `census()`

| | shipping | Bar model | gated by |
|---|---|---|---|
| midair | 17 / 147 / 139 / 226 | **12 / 70 / 92 / 336** | `witness_bar_schedule` |
| band inversions | 64 / 654 / 29,013 / 30,318 | **1 / 0 / 4 / 4** | same |
| phase stacking | 18% / 34% / — / 17% | **0 everywhere** | same |
| zero-minute · outside-bar · crew | — | **0 / 0 / 0** | same + `witness_bar_composite` |

Order is Duplex / HHS_Office_Federated / Hospital / Terminal. **All four are mandatory** — §S69's
PLUMBER breach needed 8 levels to appear, §S71's midair needed Terminal.

PRs: **#1537** core (MERGED) · **#1538** providers · **#1539** bearing/below split · **#1542** this
lane's semantics, upward edge, geometry levels, trade ladder, granularity dial.

## §10.3 ⛔ RESUME — HARDEN THE WITNESS UNTIL THE LOGS CAN BE TRUSTED ALONE

In order. Do not wire anything live until 1–3 are done.

1. **Kill the scratchpad probes.** Every number quoted in §9 came from `/tmp` scripts that no suite
   runs and nothing gates. `integrate.js`, `judge.js`, `granularity.js`, `band.js`, `coarse.js`,
   `gap.js`, `labels.js`, `terminal.js`, `outside.js`, `why.js`, `phaseonly.js` are all gone with the
   session. **Fold what matters into `witness_bar_schedule.js` or lose the ability to detect a
   regression at all.** This is the single highest-value task in the lane.

2. **Audit every existing witness in this lane against §10.1 rule 1.** Grep for any predicate that
   duplicates a shipped one instead of calling or slicing it. That is the error that produced the
   only retraction so far, and it produced it twice in one day.

3. **`witness_bar_needs.js` is the agent's, and its anti-re-derivation gate compares against
   `computeSchedule`'s own `§GEO_ORDER edges=` count — verify that claim directly** rather than
   trusting the agent's report. §10.1 rule 1 applies to subagent output too.

4. **Terminal midair 336 vs a shipping 226** — the only axis where the model still loses.
   §9.5 proved it is the level-boundary cost and not the graph (same graph unpartitioned: `0/1/1/0`).
   *Was 513 until `correctLevelsByGeometry` was deleted 2026-08-26 (§10.6).*

5. **⚠ CORRECTED 2026-08-26 — see `4D_SCHEDULE_PERFECTION.md` §S72.2. Everything the earlier version
   of this item said was wrong.** The mechanism is NOT missing and needs NO source IFC and NO
   extractor change. `viewer/lib/room_walker.js` `writeRooms()` already injects storey rows from the
   DB alone — `STC_` guid, `object_type='COMPILED'`, `center_z` = mean wall centre-Z
   (`room_walker.js:1191`), idempotent, version-stamped via `rooms_meta`. **It has already run on
   Terminal: all six of Terminal's storey rows are its output — Terminal has ZERO real extracted
   storeys.** §S18 `deriveStoreyMergeMap` DOES run; it merges 0 because the injector emits a storey
   row **only where it compiled a room** (`room_walker.js:1352`), so 17 of Terminal's 23
   `elements_meta.storey` labels get none. **The gap is that one line**, in the room lane's file, not
   in extraction and not in the scheduler. Predicted payoff (SIMULATED, §S72.1): Terminal midair
   **336 → 48**, span 126 → 105d — a simulation of 6 bands, NOT a measurement of the fix.

6. **§8 DELETE LIST — still untouched.** `deriveZones` · `_writeTemplateSchedule` ·
   `remapSolveToTasks` · `§DEQ_REPAIR` · `§CREW_CAP_FINAL` · `_midairAudit`. **Until these go, this
   lane has ADDED a sixth translator, not removed five**, and §1's whole argument is unspent.

7. **⛔ SUPERSEDED 2026-08-26 — IT IS NOW WIRED AND SHIPPED (bim-ootb PR #1543). See §11.** Was: Nothing is wired. No call site passes the Bar model. P6/XML interop and the editable bars are
   untouched and verified green (`witness_tm_p6_interop_fold` 42/42).

## §10.4 THE ONE THING NOT TO REPEAT
Do not report a number to the user without knowing which judge produced it and whether that judge
shares a predicate with the thing it is judging. Every wrong claim this session passed a green gate.

## §10.5 ⚠ A SQUASH-MERGE ORPHANED A FIX. CHECK FOR THIS BEFORE TRUSTING ANY "MERGED" PR.
**PR #1539 (the bearing/below split) never reached `main`.** It was based on `feat/bar-needs`; that
branch was squash-merged into main as #1538, so #1539 then merged into a branch main had already
absorbed. `gh pr view 1539` says **MERGED**. It was not, where it counts.
**Verified by reading main directly:** `origin/main viewer/bar_needs.js:190` still carried
`addEdge(S.guid, E.guid, 'support')` — the pre-split form. Restored on this branch.

CLAUDE.md already records this hazard verbatim — *"a squash-merge + a late push ORPHANS the new
commit … after a branch is squash-merged, start the follow-up off fresh `origin/main` — never re-use
it"* — and this session stacked on the feature branch anyway.

**Rule for this lane: a PR's MERGED status is not evidence its content is in `main`. Grep main for
the actual line.** Same discipline as §10.1 rule 1: read the source of truth, do not trust a report.


## §10.6 CONSOLIDATION — moved to the top of this file (2026-08-26)

Retitled **"SETTLED STATE — READ THIS FIRST"** and placed immediately after the `⚠ DO NOT REMOVE`
block, so a fresh reader sees the settled position before wading through §1–§10.5's withdrawn claims.
Content relocated, not duplicated — see the top of this file. **"Where §1–§10.5 and §10.6 disagree,
§10.6 wins"** still applies to every cross-reference elsewhere in this file (or in
`4D_SCHEDULE_PERFECTION.md`) that cites "(§10.6)".


---

# §11 — SHIPPED (2026-08-26, bim-ootb PR #1543)

`sw.js` **v1090**. `schedule_author.js` `_writeBarSchedule` runs whenever `opts.barModel` is present;
all four call sites pass it (`time_machine.js` :5287/:6858/:6900, `schedule_author_ui.js`:284).
`rates.js` holds `FOURD_POLICY` as a literal AND `loadFourDPolicy()`, and **`viewer.html` calls it** —
the thing `loadSequenceRules()` never got, which is why `sequence_rules.json` is a dead mirror
(§S65 STAGE 1). The literal carries the same five values, so a generation that races the fetch is
identical rather than broken, and drift between the two is a witness failure.

**The movie and the bars are the same numbers.** `_writeBarSchedule` returns `displaySchedule` = the
leaf times of the tree the bars came from. No remap, because there is no second timeline — §S70
dissolved, not patched. End-to-end: HHS **6,839/6,839** and Hospital **63,182/63,182** elements
inside their own persisted task window, 0 outside, 0 unassigned.

## Two real defects that only appeared on wiring
1. **`require is not defined`.** `bar_needs.js` read `schedule_gate.js`'s SOURCE at load and sliced
   predicates out of `computeSchedule`'s closure — node-only, and it broke the instant the live path
   met a browser (`witness_real_placement_resolver.js` caught it). **Fixed properly:**
   `isPromotedSlab`, `edgeBelow`, `edgeContained`, `edgeBearing`, `wallCarries`, `edgeCarrier` are
   LIFTED to module scope in `schedule_gate.js` and EXPORTED with `cellsOf`/`overlap`/`bboxVol` —
   the same move and the same reason as §S26.2's `supportPool`. `bar_needs` now holds the engine's
   own function objects instead of a copy of its text, so there is nothing left to drift.
   `contactClauses()` likewise stops reading a TEST FILE at runtime; `witness_bar_needs` still
   slices `census()` in node and asserts behavioural equality on all four buildings.
2. **Day rounding** put 295 HHS / 693 Hospital elements outside their own bar — §S70 returning as an
   off-by-a-fraction. Fixed with §ZONE_ENVELOPE_DAYS' own rule: floor the start, ceil the finish.

## ⛔ STILL OPEN after the ship
- **§8 DELETE LIST untouched.** `deriveZones` · `_writeTemplateSchedule` · `remapSolveToTasks` ·
  `§DEQ_REPAIR` · `§CREW_CAP_FINAL` · `_midairAudit`. They are now DEAD on the live path but still
  present. **Do not delete them until the live path has been seen working on a real device** —
  deleting the fallback before the replacement is observed is how a bad day happens.
- **`room_walker.js:1352`** — one line; Terminal 336 → 48 predicted (a SIMULATION, not a measurement).
- **Fold the scratchpad probes into `witness_bar_schedule`** (§10.3 item 2). Still true.
- **No witness exercises the LIVE call sites.** Every schedule witness calls `materializeZones`
  directly without `barModel`, so the suite green above proves the legacy path is intact — NOT that
  the wiring works. The end-to-end check was a scratchpad script. **That is the next gap to close.**

---

# §12 — ⛔ STOP. THE BASELINE WAS WRONG AND THE METRIC DOES NOT MATCH THE EYE. (2026-08-26)

**Read this before acting on ANY number in §1–§11.** A live console log from the user's own device,
`HHS_Office_Federated`, GitHub Pages build, changed the picture twice.

## 12.1 The build was not live — expected, but check it FIRST every time
The log contains `§SCHEDULE_AUTHOR_LOADED v8` and `§AUTHOR_ZONES schedule=SCH_AUTHORED zones=17
edges=23` — the LEGACY path. It contains **no** `§BAR_MODEL_LOADED`, **no** `§4D_POLICY`, **no**
`§BAR_LIVE`, and `§PRECACHE-TRIM install set=162` (not v1090). PR #1543 was still open.

**Before concluding anything from a user screenshot, grep their log for `§BAR_LIVE`.** If it is
absent you are looking at the old engine and the screenshot says nothing about your work.

## 12.2 ⛔ MY "SHIPPING" BASELINE WAS THE RAW SOLVE, NOT WHAT SHIPS
Every comparison in §1–§11 used **`ScheduleGate.computeSchedule`'s raw output** as "shipping":
`midair 17 / 147 / 139 / 226`. **That is not what plays.** The live chain runs
`_displayTimeline` → `CpmSchedule.run` → `_midairAudit` → `§CROSSTASK_JUDGE_PARITY`, and the user's
own log reports, on the SAME building where I claimed shipping was 147:

```
§CPM_DISPLAY on — one-DAG schedule authored the display timeline midair=0 orphans=36 stragglers=3246
§SUPPORT_CHECK floating=4/6880 (ALL classes, bearing-below + hang-carrier) gated=6880
§CROSSTASK_JUDGE_PARITY pushed=67 sweeps=3 maxShiftDays=10.0 floating=8/6880 windowBlocked=8
```

**Live HHS is 0–8 floating. I measured 147 and called it the thing to beat. The Bar model's 70 is
very likely WORSE than the engine it was going to replace.**

This is the §9.4 error a second time in a different costume: not a hand-written judge this time, but
**the right judge pointed at the wrong stage of the pipeline.** RAW is an intermediate; the display
timeline is the product.

**⛔ EVERY midair comparison in this file is now UNSAFE. Re-baseline against `_displayTimeline`
output — the same times `kernel_ops` is written from — before any of it is quoted again.**

## 12.3 THE DEEPEST FINDING — the metric says 0 and the user sees floating
The same log that says `§CPM_DISPLAY … midair=0` accompanies a photograph of MEP pipes hanging in
the air with nothing beneath them, at `DAY 0 | HR 3`, `73 placed`.

**So `midair=0` is not measuring what the user is looking at.** Every number this lane produced —
mine and the shipped engine's — comes from that same family of contact-graph judge. The user's
acceptance bar is the screen. **A judge that reports 0 while the screen shows a hanging pipe is the
real defect, and it outranks every scheduling improvement in this file.**

Candidate explanations, NONE verified — do not pick one without measuring:
- the judge's contact test (`bearing` + `carrier` + `embedded`, XY-overlap + Z-band) may accept a
  "support" that is metres away in XY within the same CELL bucket;
- `§CELL_GATE … REFUSED=990 repr=85.47%` and `§CPM_RUN … stragglers=3246 cycleDrops={member:2000}` —
  a third of the model is not represented in the DAG at all, and a straggler cannot be judged;
- `§SUPPORT_UNCHECKED_SUMMARY n=20/6880 … warn-only — reported not gated`;
- the thing hanging may be a `ghost`/x-ray element the judge excludes but the eye does not.

**First task of the next session: reproduce the photograph numerically.** Take one visibly floating
element's GUID from the live model at DAY 0 HR 3, and print what the judge thinks supports it and
when. Until that is done, no midair number from anyone means anything.

## 12.4 What the live log ALSO confirms, unchanged
- `§GANTT_CPM_ANNOTATE … critical=17 (100%) … float=0..0` — the tautology, exactly as §S67 measured.
- `§S18_STOREY_MERGE_FAIL no such column: elevation` — §S72's gap, live.
- `§ZONE_INDEX … noStorey=2120 (30.8% — zone is a median-Z INFERENCE, not IFC truth)` and
  `§GANTT_STOREY_Z reassigned=2120`. Nearly a third of HHS has no storey at all.
- `§LOC_AXIS … elementsInCompiledRoom=1522 (22.12%) levelOnly=5358 (77.88%)`.
- `§CREW_DAY_CLOCK rawDays=185.2 … projectDays=186` beside `§GANTT_AXIS axisDays=42.0`.

## 12.5 LEARNING RETAINED — the full list, all of it paid for
1. **Slice the judge, never re-derive it** (§9.4 — cost a full retraction; also 4,706-vs-716 edges).
2. **Point the judge at the stage the USER sees** (§12.2 — this one; the right judge, wrong stage).
3. **Every gate carries its own committed red control**; a console check is not a check.
4. **A gate that checks two of your own fields agree is a deletion request.**
5. **A fleet witness must key on the BUILDING as well** — task ids collide across buildings.
6. **A crash is not a red; a red is not a regression.** Symlink `node_modules` into `/tmp/wt-*`;
   baseline every `new_red` by stashing your own diff.
7. **A logged number no invariant reads defends nothing** — midair was printed, not gated, until §11.
8. **A PR's MERGED status is not evidence its content is in `main`** (§10.5, PR #1539 orphaned).
9. **Never `rm` a file then `git add -A`** — it deleted `bar_needs.js` and a fix already lost once.
10. **Wiring finds what witnesses cannot** — `require is not defined`, and day-rounding putting 295
    elements outside their own bar. Both invisible to a green suite.
11. **Check the user's log for your own `§` tag before believing a screenshot is about your work.**
12. **A NULL RESULT IS ONLY AS STRONG AS THE METRIC'S ABILITY TO SEE THE EFFECT** (§18.6 — the third
    costume of #2). Before concluding "X contributes nothing", state what a contribution would have
    looked like *in the number you are reading*. §17.2 measured "the `seq<=4` filter contributes
    nothing" on bearing/contradictions/`des=-1` — three metrics structurally blind to glazing — and
    nearly deleted §4D_FACADE_ORDER on the strength of it.
13. **Deterministic ≠ true. A witness proves what it asserts, not what is real** (§18.7). `midair=0`
    was reproducible for months while FOUR mechanisms produced it. Logging frees you from the
    screenshot; it cannot validate the predicate being measured.

## ⛔ RESUME — in this order, nothing else first
1. **§12.3.** Reproduce the photograph numerically. One GUID, one timestamp, what supports it and when.
2. **§12.2.** Re-baseline every midair number against `_displayTimeline`, not raw `computeSchedule`.
3. Only then: is the Bar model better or worse than what ships? **Assume WORSE until measured.**
4. `#1543` — do not merge it on the strength of anything in §1–§11.


---

# §13 — THE DELETE LIST WAS WRONG. GO FORWARD, BUT FIX THE INSTRUMENT FIRST. (2026-08-26)

**User directive:** *"we should not fall back but go forward. Let things break. Fixing will happen."*
Adopted. §8's list is corrected here — it lumped six things together as "translators" and three of
them are not translators at all.

## 13.1 DELETE NOW, no conditions — dead code, zero risk
| | what it actually is |
|---|---|
| `_writeTemplateSchedule` (§S69) | mine. No call site has ever passed `opts.template`. Pure dead weight. |
| `remapSolveToTasks` (§S70) | mine. Superseded outright by the composite — a group's span IS its children's, so there is nothing to remap. |
| `deriveZones` | a genuine translator: rolls the solve up into an envelope. Delete the moment `§BAR_LIVE` is confirmed in a real console. |

Also delete `correctLevelsByGeometry` — already done 2026-08-26, and it was mine too. **Three of the
four dead things in this lane were added by this lane.** That is the honest pattern: the fastest way
to a delete list is to stop writing the entries.

## 13.2 ⛔ NOT TRANSLATORS — §8 mislabelled these. They do real work.
`§DEQ_REPAIR` · `§CREW_CAP_FINAL` · `_midairAudit`

`_midairAudit` is what produces `§CPM_DISPLAY … midair=0` in the user's live log — the chain that
takes HHS from a raw 147 to 0–8 floating (§12.2). `§DEQ_REPAIR` closes real geometry-gate violations;
`§CREW_CAP_FINAL` closes a measured 10× carpenter breach on Terminal. **Deleting these is not
removing a fallback, it is removing the current product quality.** §8's framing — "until these go,
the lane has added a sixth translator" — was rhetorically satisfying and factually wrong about half
the list.

## 13.3 THE ORDER, and the reason is instrumentation, not caution
"Let it break, fixing will happen" requires the break to be **visible**. §12.3 established that it is
not: **the log says `midair=0` while the screen shows a hanging pipe.** Delete the repair chain today
and the log will still say `midair=0`. You would have broken it and been told everything is fine.

> **Fix the instrument first (§12.3 — reproduce one floating GUID numerically), then delete forward
> freely.** One task, not a phase. This is not "verify before deleting" — it is "you cannot practise
> break-and-fix with an instrument that cannot see the break."

## 13.4 THE FORWARD ORDER
1. **§12.3** — one visibly floating GUID at DAY 0 HR 3: what does the judge think supports it, and
   when? Make the metric agree with the eye, or replace the metric.
2. **Delete §13.1's three** — no ceremony, no flag, no fallback branch.
3. **§12.2** — re-baseline against `_displayTimeline`. Then decide whether the Bar model ships or is
   abandoned. **Assume it is worse until measured** — it may be that its real contribution was the
   phase discipline and the policy, not the midair number.
4. **Delete §13.2's three only after step 1 proves the instrument can see them go.** Then it is a
   real experiment instead of a blind one.

**No `barModel` feature flag.** When the Bar model wins on a judge that matches the eye, it becomes
the only path and the old one goes. A permanent opt-in is the same hedge under a nicer name.

---

# §14 — THE INSTRUMENT IS BROKEN IN TWO PLACES. BOTH MEASURED. (2026-08-26)

**§13.4 step 1 / §12.3 — DONE.** The photograph is reproduced numerically. Probe:
`bim-ootb scripts/probe_floating_guid_audit.js` (branch `probe/floating-guid-audit`, pushed), run
against `origin/main` @ `44f42dd` — i.e. **without** PR #1543, exactly the engine the user's log came
from. Log: every number below is a `§FGA_*` line from that run, nothing eyeballed, no screenshot.

## 14.0 The replay is faithful — check this before quoting anything else
The probe replays the live chain in node, stage for stage, each mirroring a named live function:
`materializeZones` → `_tmDisplayRemap` (Tukey clip) → `_displayTimeline`/`CpmSchedule.run` →
`deriveZones` → `_tmRescaleToTaskWindow` → **`kernel_ops.start_ts`, which is what the DAY/HR HUD
counts.** The judge is `require`d from `viewer/support_sweep.js` — never re-derived (§10.1 rule 1).

| | user's live console | probe |
|---|---|---|
| `§AUTHOR_ZONES` zones / edges | 17 / 23 | **17 / 23** |
| `§CPM_DISPLAY` midair | 0 | **0** |
| `§CPM_DISPLAY` orphans | 36 | **36** |
| stragglers | 3246 | 3249 |
| placed at DAY 0 HR 3 | 73 | 83 |

The last two gaps are one known thing, not noise: **schedule_author's element recipe builds 6839,
time_machine's builds 6880** (`§SUPPORT_CHECK … gated=6880` in the user's own log) — the
`§CPM_DISPLAY_ONE_TRUTH` split. The schedule is authored on the 6839 set; the extra 41 are written
to `kernel_ops` off the cached map. Nothing here depends on which of the two you count.

## 14.1 THE ANSWER TO §12.3 — at DAY 0 HR 3 the eye sees 15 hanging, the judge counts 0
```
§FGA_CURSOR          DAY=0 HR=3 placed=83/6839
§FGA_EYE_FLOATING    floatingToEye=15  byClass={IfcBuildingElementProxy:12, IfcStairFlight:2, IfcWallStandardCase:1}
§FGA_JUDGE_ON_SAME_POP  judgeCallsFloating=0  eyeCallsFloating=15  DELTA=15
```
"Floating to the eye" is NOT a second physics — it is `_contactGraph`'s own contact list and its own
three clauses, asked one question the judge never asks: *of the things holding this up, is a single
one on screen yet?* For all 15 the answer is none.

**Correction to §12.3's wording, and it matters for what gets fixed:** the hanging elements at that
instant are **not MEP**. `§FGA_PLACED_CENSUS` — the whole on-screen population at DAY 0 HR 3 is
`{Wall:33, Slab:14, Proxy:13, Door:10, Column:9, StairFlight:4}`. **No MEP-classed element is on
screen at all in the first 72 hours** (`§FGA_HOUR` h=0..72, `ofWhichMEP=0` at every hour). The 12
proxies that ARE hanging are `Stahlbalkon:…` steel-balcony elements — bbox `0.09m × 1.00m` wide and
**7.07m tall**, base at `Z=3.74`, `8.44m above the model ground`. Thin, vertical, at height: on
screen they read as pipes. The photograph is real, the diagnosis of *what* was hanging was not.

## 14.2 BLIND SPOT 1 — 63 elements the judge can never count, at any time, on any timeline
```
§FGA_JUDGE_BLIND total=63/6839  orphan(noContactAnywhere)=39  groundedExempt(carrier-above-only)=24
                 ofThoseAboveGround=62  maxHeightOrphan=16.20m  maxHeightGrounded=7.09m
```
`_midairAudit`'s first statement is `if (sIdx < 0) continue`. 63 elements have
`_designatedSupport = -1`, so they are skipped unconditionally. **62 of the 63 are above ground.**
Two separate causes, and only one of them is the documented "orphans are reported, never moved":

1. **39 orphans** — `_contactGraph` found zero contacts anywhere in the model
   (`{Proxy:28, IfcFlowTerminal:10, IfcFlowSegment:1}`). Genuinely an extraction fact.
2. **24 grounded-exempt** — these have real contacts, all of them *above*, and
   `_designatedSupport`'s last line `if (bestCls === 2 && G.grounded[i]) continue` throws the
   carrier-above edge away. `grounded` is **footprint-local**: `grounded[i] = (lowest < T.bz - GAP) ? 0 : 1`
   over things whose XY bbox overlaps mine. Nothing below me *in my own footprint* ⇒ I am declared
   the ground layer — **at any altitude.**

### The specimen — a real MEP element, fully dumped
```
§FGA_SUBJECT      guid=00szGmqsL8Tv_ErgPOhgVh  cls=IfcFlowFitting  phase=MEP Rough-in  storey=Level 1
                  name="M_Rectangular Duct Elbow - Mitered:Standard:Standard:479112"  resource=PLUMBER
§FGA_SUBJECT_BBOX x=[49.44,49.87] y=[-2.91,-2.49] baseZ=2.385 topZ=2.735
                  heightAboveModelGround=7.085m  (groundZ=-4.700)
§FGA_SUBJECT_TIME opStart=2026-01-16T04:41:27Z = DAY 15 HR 4   task=TASK_MEP_Rough_in_Level_1
§FGA_SUBJECT_EYE  {bearingPlaced:0, embeddedPlaced:0, carrierPlaced:0, carrierAny:8, onGround:false, floatingToEye:true}
§FGA_JUDGE_GROUNDED grounded=1
§FGA_JUDGE_CONTACTS n=8 — ALL EIGHT ARE carrier-above:
   IfcFlowSegment  dz=+0.09m  DAY 15 HR 14      IfcFlowSegment  dz=+0.09m  DAY 15 HR 15
   IfcFlowSegment  dz=+3.64m  DAY 23 HR 12      IfcFlowFitting  dz=+3.64m  DAY 23 HR 12
   IfcFlowSegment  dz=+3.64m  DAY 23 HR 14      IfcFlowSegment  dz=+7.19m  DAY 40 HR 04
   IfcFlowFitting  dz=+7.19m  DAY 40 HR 04      IfcFlowSegment  dz=+7.19m  DAY 40 HR 04
§FGA_JUDGE_SUPPORT designatedSupport = -1
```
A mitered duct elbow, **7.09m in the air**, with eight neighbours, **every one of them above it**,
and the judge's verdict is *this element depends on nothing.* It appears at DAY 15 HR 4; the nearest
thing it touches appears ten hours later; the rest, eight and twenty-five days later. It hangs from
the moment it appears until the end of the film and the metric is 0 the whole way.
`§FGA_MEP_BLIND n=13` — this class of blindness covers 10 recessed lighting fixtures at 14.42m, a
mitered duct elbow at 14.29m, this one, and a pipe at ground.

## 14.3 BLIND SPOT 2 — ⛔ THE JUDGE READS A TIMELINE THE MOVIE DOES NOT PLAY. 0 → 783.
**This is bigger than §12.2 and it is a different error.** §12.2 said the *baseline* was pointed at
the raw solve. This says the **judge itself, on the display path, still is.**
```
§FGA_TIMELINE_MISMATCH  judgedOnCPMtimes=0   judgedOnPLAYEDtimes(kernel_ops)=783
                        becameFloatingOnlyWhenPlayed=783   fixedByTheRescale=0
```
Same judge. Same graph. Same `_designatedSupport` edges. The *only* change is which `.s` it reads.

`_displayTimeline` runs `_midairAudit(items)` and prints `midair=0` — then `injectGantt` takes those
same items and runs them through **`_tmRescaleToTaskWindow`** (§TM_ELEMENT_WINDOW_BIND, 2026-08-25)
before writing `kernel_ops`. That is a **per-task affine rescale**: each task maps its own raw CPM
span onto its own authored window, so **every task gets a different scale factor** and any support
edge crossing a task boundary is re-ordered. Nothing re-audits after it.

```
§FGA_MISMATCH guid=3XrBtx9eX7mQE6EqWHPf6F cls=IfcPlate   task=TASK_Architecture_Level_1   scale=0.275
              support=3XrBtx9eX7mQE6EqWHPf59 cls=IfcMember task=TASK_Superstructure_Level_1 scale=1.024
              cpmGapDays=+0.02  →  playedGapDays=-16.33
§FGA_MISMATCH guid=3XrBtx9eX7mQE6EqWHPfKr cls=IfcRailing task=TASK_Architecture_Level_1   scale=0.275
              support=3XrBtx9eX7mQE6EqWHPk0u cls=IfcSlab   task=TASK_Superstructure_Level_3 scale=0.460
              cpmGapDays=+0.00  →  playedGapDays=-16.18
```
A plate that the CPM put 0.02 days *after* its member plays **16.33 days before it** — 0.275 against
1.024, a 3.7× scale disagreement between two tasks. 783 elements do this. Every one of them is
`midair=0` in the log the user reads.

**Note what this does to §12.2's own instruction.** §12.2 said "re-baseline against `_displayTimeline`."
That is still not far enough — `_displayTimeline`'s output is rescaled again after it. **The only
honest baseline is `kernel_ops.start_ts`**, the thing the HUD counts and the frames are drawn from.

## 14.4 THE INSTRUMENT'S THREE DEFECTS, RANKED
1. **The judge runs before the last transform.** `_midairAudit` at `_displayTimeline`; the rescale
   after it. 0 vs 783 on HHS. Cheapest real fix in the lane: run the existing judge once more on the
   written `kernel_ops` times and gate on it. No new physics, no new definition — one more call.
2. **`grounded` is footprint-local and altitude-blind.** A duct elbow 7m up with eight contacts, all
   above, is classified as ground. 24 elements on HHS. `§GROUNDED_OVERRIDE_FIX` (2026-08-13) already
   fought this exact clause once and only narrowed it; the altitude case survived.
3. **`des = -1` is silently uncountable.** 63 on HHS, 62 above ground, max 16.20m. Orphans being
   unmovable is real; being *invisible to the metric that names this lane* is not the same thing.
   They should be reported in the same breath as `midair`, not in a separate line nobody totals.

## 14.5 WHAT DOES NOT CHANGE
- **#1543 stays unmerged.** Nothing here evaluates it.
- **Every midair number in §1–§11 stays UNSAFE**, and §12.2's replacement baseline is now also known
  to be one transform short. Do not quote 17/147/139/226, do not quote 70, do not quote 0–8.
- **§13.4 step 2 (delete §13.1's three) is now unblocked** — §13.3's condition was "fix the instrument
  first," and the instrument is now at least *legible*: 783 and 63 are numbers a deletion can move.
  §13.2's three still wait on defect 1 being closed, per §13.4 step 4.

## 14.6 ⛔ AMENDED 2026-08-26 — DELETE THE RESCALE FIRST, THEN GATE. The 783 is a MODEL defect.
The first cut of this RESUME said "gate the judge on post-rescale `kernel_ops` times" as step 1.
**Reordered after an independent review, and the reason survived my own re-verification against
`origin/feat/bar-live` — not taken on report:**

| claim | verified |
|---|---|
| `_disp` still comes from `CpmSchedule.run` on `feat/bar-live` | `time_machine.js` §TM_ELEMENT_WINDOW_BIND comment, unchanged, verbatim |
| `_tmRescaleToTaskWindow` still fires unconditionally at the `kernel_ops` write | same file, `var bound = _tmRescaleToTaskWindow(el.guid, s);` inside `elements.forEach` |
| `_writeBarSchedule` persists windows through `dayFloor`/`dayCeil` | `schedule_author.js` §ZONE_ENVELOPE_DAYS — so `realSpan ≠ rawSpan` ⇒ **`scale ≠ 1` by construction, per task** |
| **the Bar leaves already carry a real epoch** | `_writeBarSchedule` calls `BM.schedule(tree, { … baseMs: Date.parse(start) … })`; `bar_model.js` `schedule()` seeds `crews[tr]` slots and `gate` with `baseMs`. **Leaf times are absolute ms from the real project start.** |

That last row is the whole argument. `_tmRescaleToTaskWindow` exists for one stated reason — its own
header: *"`CpmSchedule.run()`, a pure relative CPM solver with **NO epoch concept anywhere** in
`cpm_schedule.js`."* **The Bar model does not have that problem.** So the rescale is not a stage to
audit around; it is a **workaround for a defect the Bar model deletes**, and §14.3's 783 is produced
*downstream* of the Bar model and survives it untouched.

**Consequences to record:**
- **`_tmRescaleToTaskWindow` is a SIXTH translator.** §8 counted five. It belongs on §13's list.
- **§11's "the movie and the bars are the same numbers — no remap, because there is no second
  timeline" is true inside `bar_model.js` and FALSE at `kernel_ops`.** The claim was made one layer
  above where it stops being true.
- **§11's `dayFloor`/`dayCeil` may be a symptom, not a fix.** It was added for "295 HHS / 693
  Hospital elements outside their own bar" — patched at the far end of the same rescale. If the
  rescale goes, revisit whether the envelope can go back to being purely a display envelope.
- **Gating first would lock in the workaround**: a gate that sits red at 783 forever, guarding a
  stage that should not exist. Deleting takes 783 → 0 structurally.

## ⛔ RESUME — in this order
1. **Make `injectGantt` read the Bar leaf times instead of `CpmSchedule.run()`, then delete
   `_tmRescaleToTaskWindow`** (§14.6). The leaves already carry the epoch the rescale was written to
   supply. Target: 783 → 0 structurally, not a permanently-red gate.
2. **Then** gate `_midairAudit` on the written `kernel_ops` times (§14.4 defect 1) — now it guards a
   real invariant instead of a workaround. **Fix the `census()`/`midairAudit` #1435 divergence in the
   SAME commit** (§15.4 / §S58.5): breaking the shipped judge by 86,400,000× still leaves
   `witness_midair_zero` at `pass=49 fail=0`, so the lock does not track the judge and the new gate
   would ship unguarded the day it goes green.
3. Defects 2 and 3 (§14.4 — footprint-local `grounded`, silently-uncountable `des = -1`) are inside
   the judge and are unaffected by either of the above. Still open, still 63 elements on HHS.
4. Re-run `probe_floating_guid_audit.js` across the fleet (`ONLY=` env) — HHS is one building.
5. Only then re-baseline (§12.2 as amended by §14.3) and decide the Bar model's fate.
6. Deleting §13.1's pair: on the CORRECTED premise (§15.5) — `opts.template` IS passed by three test
   files. Delete those in the same commit; budget two new reds, one guarding movie-vs-bars.

---

# §15 — WATCHDOG REVIEW (2026-08-26, independent session). TWO ITEMS §14 DID NOT COVER.

*(Written before §14 as a review of §11–§13; renumbered 14→15 and moved here 2026-08-26 after a
collision — both sections were called "§14". See §15.7 for how that happened.)*

## 15.0 §14 VERIFIED, AND IT CORRECTS ME
§14's code claims were re-checked independently against `origin/main` @ `44f42dd`. **All hold:**
`support_sweep.js:417` (`grounded[i] = (lowest < T.bz - GAP) ? 0 : 1` — footprint-local, altitude-
blind, exactly as claimed) · `:466` (`if (bestCls === 2 && G.grounded[i]) continue`) · `:508`
(`var sIdx = des[i]; if (sIdx < 0) continue`) · `time_machine.js:4843` `_tmRescaleToTaskWindow`,
applied at `:4870` (`var bound = _tmRescaleToTaskWindow(el.guid, s)`) **after** `_midairAudit` and
before the `kernel_ops` write. `scripts/probe_floating_guid_audit.js` is on
`origin/probe/floating-guid-audit`. The judge is required from `support_sweep.js`, not re-derived —
§10.1 rule 1 honoured.

**⛔ §15.3 below is WRONG and §14.3 is why.** I wrote that §12.2's re-baseline was "not a project —
just read W-MZ-2." W-MZ-2 is the post-CPM number, and the post-CPM timeline is **still rescaled
again** by `_tmRescaleToTaskWindow` before anything is played. `census()` judging `_displayTimeline`
is one transform short of the movie, exactly as the shipped judge is. §14.3's `0 → 783` is the
proof. **The only honest baseline is `kernel_ops.start_ts`** — §14's conclusion, not mine.

**Still standing after §14: §15.1, §15.4, §15.5.** §15.2's stage critique is absorbed and extended
by §14.3; its cross-judge point (three different instruments quoted as one) still stands as a
reading rule.

## 15.1 ⛔ STILL OPEN → **FIXED 2026-08-26.** The top of this file was false.
`SETTLED STATE` (line ~17) says **"🚀 LIVE as of 2026-08-26, bim-ootb PR #1543"** and §11 is titled
**SHIPPED**. Measured now:

```
gh pr view 1543 → {"state":"OPEN","mergedAt":null,"mergeStateStatus":"BLOCKED"}
git grep BAR_LIVE origin/main → (nothing)
git grep barModel  origin/main → (nothing)
```

**Nothing shipped.** §12.1 notices this in passing ("PR #1543 was still open") but only about the
user's console log, and neither §12 nor §13 corrects the block a fresh session reads FIRST. The file
currently hands a new session "LIVE" as settled truth, 680 lines above the retraction.
This is §10.5's own lesson inverted: there, MERGED was not evidence of landing; here, SHIPPED was
claimed for a PR that never merged at all.

## 15.2 ⛔ §12.2 COMPARES THREE DIFFERENT JUDGES AND CALLS IT A RE-BASELINE
The retraction rests on `147` (mine) vs `floating=4` / `midair=0` (live log). Those are **not the
same instrument**:

| number | judge | where |
|---|---|---|
| `midair 17/147/139/226` | `census()` — *independent by design*, re-derives contact geometry | `witness_midair_zero.js:308` |
| `§SUPPORT_CHECK floating=4/6880` | `ScheduleGate.auditFloating` | `schedule_gate.js:1122` |
| `§CPM_DISPLAY … midair=0` | `SupportSweep.midairAudit` via `_midairAudit` | `time_machine.js:4196` |

§12.2 asserts they are "the same family of contact-graph judge" without measuring it. That is
**§10.1 rule 1 in its cross-judge form** — the exact error §12.2 is diagnosing. The stage point
(raw solve ≠ what plays) is valid and worth keeping; the conclusion **"the Bar model's 70 is very
likely WORSE"** is not supported by the evidence given. Correct status is UNKNOWN, not WORSE.

## 15.3 ⛔ RETRACTED by §14.3 — `census()` judges the display timeline, but the movie plays a LATER one
`witness_midair_zero.js` header, verbatim: *"This witness judges the DISPLAY timeline — the times
`kernel_ops` is written from, i.e. what the movie plays"*, authored via *"`_displayTimeline`'s CPM
success branch (`CpmSchedule.run`)"*. And `W-MZ-1` is explicitly **"the RAW `computeSchedule`
output, before `_displayTimeline` authors anything… the before-number"**; `W-MZ-2` is the post-CPM
locked one.

So the table in `SETTLED STATE` quoted **W-MZ-1** when W-MZ-2 was sitting in the same run.
**§12.2's re-baseline is not a project — it is reading the other line the witness already prints.**

## 15.4 ⛔ §12.3's REAL LEAD IS ALREADY DOCUMENTED AND IS NOT IN ITS CANDIDATE LIST
Directly above `census()` in `witness_midair_zero.js`, already `⛔ OPEN`, already measured:

> *"it no longer encodes the same rule as the shipped judge: it mirrors `_contactGraph`'s symmetric
> carrier clause, while `SupportSweep.midairAudit` went DIRECTIONAL in #1435. Measured 2026-08-22:
> breaking the shipped judge by 86,400,000x leaves this witness at pass=49 fail=0 — **the lock does
> not track the engine**."* (tracked at `4D_GANTT_TM_REFACTOR.md` §S58.5)

And `auditFloating`'s blind spot, same file's header: *"its support pools are seq<=4 + promoted
slabs + walls, so an element whose only neighbours are outside those pools … is reported clean while
hanging in plain sight."* **A hanging MEP pipe is precisely that element.** §12.3 lists four
candidate explanations and neither of these is among them. Start here — the divergence is measured,
not hypothetical.

## 15.5 §13.1's "zero risk" IS OVERSTATED (the claim is right, the grading is not)
"No call site has ever passed `opts.template`" is **true for production** — verified, all four sites
(`time_machine.js` :5287/:6858/:6900, `schedule_author_ui.js`:284) omit it. But **three test files
pass it**: `witness_4d_template_instantiation.js:67`, `witness_4d_movie_binds_bars.js:66`,
`probe_4d_movie_vs_bars.js:44`. `remapSolveToTasks` is reached only from inside
`_writeTemplateSchedule` (`schedule_author.js:1005`) plus its export at :2325.

Deleting the pair is still correct — but budget **two new reds**, one of them
`witness_4d_movie_binds_bars`, which guards movie-vs-bars, a hell in this lane's own scope. Delete
the witnesses in the same commit or the next session will read them as a regression.

## 15.6 PROCESS — the local `~/bim-ootb` checkout was 12 commits stale
Every claim above was re-checked against `origin/main` via `git grep origin/main` / `git show`.
A first pass against the stale local tree reported `_writeTemplateSchedule` and `remapSolveToTasks`
as *already absent* — i.e. it would have marked §13.1 done. `CLAUDE.md` Session Startup step 0
exists for exactly this. **Fetch before reading this repo as canon.**

## 15.7 PROCESS — two §14s, and an uncommitted append swept into someone else's commit
This section was appended to the working tree while another session was working the same file. That
session committed it inside `b52e2dd9f` under **its own** commit message, so the file carried two
sections numbered §14 with colliding sub-numbers 14.1–14.6. Renumbered to §15 and moved below §14
here. **`bim-compiler` has no shared-tree hook** (`CLAUDE.md` says so explicitly) — this is the
predicted collision, and §12.5 lesson 9 is the same lesson in a different costume.

**⛔ CORRECTED 2026-08-26 — the first version of this section blamed `git add -A` and prescribed
"stage by path, never `-A`". Both wrong, and the prescription does not work.** Measured:
`git show --stat b52e2dd9f` → **`1 file changed, 230 insertions(+)`**, and both `# §14` headings are
inside that single diff (`+38` and `+125`). The command was `git add prompts/4D_BAR_MODEL.md` — a
path, not `-A`. **`git add <path>` stages the whole file, appends from every session included**, so
path-staging could never have prevented this: the collision was two appends to the SAME FILE, which
is the one case path-staging does not separate.
**The real preventive, in order:** (a) work in a `/tmp/wt-*` worktree — `CLAUDE.md` already says so
for `bim-compiler` precisely because there is no hook here; (b) failing that, `git diff <file>`
before committing in a shared tree and read what you are about to author under your own name.
A lesson that names the wrong mechanism is worse than no lesson — it gets followed and still fails.

## ⛔ WHAT IS STILL OPEN AFTER §14 — two items, neither covered by it
1. **The `census()`-vs-`midairAudit` divergence (§15.4).** `git grep` over §14: no mention of #1435,
   "directional", `census`, or §S58.5. §14's defects 2 and 3 are inside the **shipped** judge
   (`grounded`, `des = -1`). The separate, already-measured fact is that the **witness lock** does
   not track that judge: `census()` mirrors `_contactGraph`'s *symmetric* carrier clause while
   `SupportSweep.midairAudit` went **directional** in #1435, and breaking the shipped judge by
   86,400,000× still leaves `witness_midair_zero` at `pass=49 fail=0`.
   **This lands directly on §14's RESUME step 1.** Gating `_midairAudit` on post-rescale
   `kernel_ops` times is right — but the witness that is supposed to protect that gate is already
   known not to track it. Fix the lock in the same commit as the gate, or the gate is unguarded the
   day it goes green.
2. **§15.5 — deleting §13.1's pair breaks three test files.** §14.5 declares §13.4 step 2
   "unblocked"; that is fine, but `witness_4d_template_instantiation.js:67`,
   `witness_4d_movie_binds_bars.js:66` and `probe_4d_movie_vs_bars.js:44` all pass `template:`.
   Budget two new reds, one of them guarding movie-vs-bars. Delete them in the same commit.

**Not open any more:** §15.1 (banner corrected above), §15.3 (retracted, §15.0).


---

# §16 — DEFECT 4: THE POOL OVERRIDE BEATS DIRECTION. A WALL IS TOLD IT HANGS FROM THE CEILING. (2026-08-26)

Raised by the review session, **re-verified here by running it, not by reading it.** Probe:
`probe_floating_guid_audit.js`, `ONLY=Duplex_extracted GUID='2O2Fr$t4X7Zf8NOew3FNhv'`, against
`origin/main` @ `44f42dd`. Every number below is a `§FGA_*` line.

## 16.1 The traced element — confirmed, exactly as reported
`2O2Fr$t4X7Zf8NOew3FNhv` · `IfcWallStandardCase` "Basic Wall:Exterior - Brick on Block:138310" ·
Architecture · Level 1 · `seq=5` · MASON · `z[-0.195 → 2.905]`. A ground-floor wall standing on a
basement wall. Pure ARCH/STR — **no MEP anywhere in the causal chain**, unlike §14.2's duct elbow.

```
§FGA_JUDGE_CONTACTS n=36
§FGA_JUDGE_SUPPORT  guid=1hOSvn6df7F8_7GcBWlRqU cls=IfcSlab bz=2.79 tz=3.10 dz=+2.99m  ◄ DESIGNATED
   …the real wall below: 2O2Fr$t4X7Zf8NOew3FK80 IfcWallStandardCase z[-1.25,0.00] pool=FALSE, DAY 0 HR 6
§FGA_JUDGE_TEST     support.s > self.s + 1 ?  FALSE     (clean pass)
§FGA_SUBJECT_EYE    bearingPlaced:0 embeddedPlaced:0 carrierPlaced:12 → floatingToEye TRUE
```
**The wall's designated support is a slab three metres over its head.** It is modelled as hanging
from the second-floor ceiling. And six `IfcFlowSegment` pipes at `z[-0.69…-0.45]` are classified
**bearing-below** — the contact graph believes a wall can rest on a pipe.

The mechanism, verified line by line:
- `schedule_gate.js:1312` `supportPool(e) = e.seq <= 4 || (IfcSlab && seq>4) || IfcStairFlight`.
  **No walls.** Every Architecture wall is invisible *as a support*.
- `support_sweep.js:465` `if (poolJ >= 0) { bestJ = poolJ; bestCls = poolCls; }` — **no class guard.**
  The cls-0 (bearing-below) winner is discarded for a cls-2 (carrier-above) pool member.
- `cpm_schedule.js:193` `addEdge(des[i], i, SS, 1, 'e1')`. `SS` = *"T cannot start until S **starts**"*
  (:9). One edge, start-to-start: 36 contacts collapse to one, and it never says "after it finishes".

## 16.2 ⛔ THIS IS THE FOURTH DEFECT, AND THE RESCALE DELETION DOES NOT TOUCH IT
`§FGA_JUDGE_TEST` is **false on the CPM timeline AND on the played `kernel_ops` timeline** — the
designated slab starts *earlier* than the wall, so no comparison can flag it, at any stage.

**Read §14.6 with this correction: "783 → 0 structurally" means the RESCALE defect goes to zero. It
does NOT mean floating goes to zero.** §16 survives the deletion completely untouched. Four
independent defects now, each producing `midair=0`:

| # | defect | fixed by deleting the rescale? |
|---|---|---|
| 1 (§14.3) | judge runs before the last transform — 783 on HHS | **yes, structurally** |
| 2 (§14.2) | `grounded` footprint-local, altitude-blind — duct elbow 7m up | no |
| 3 (§14.2) | `des = -1` silently uncountable — 63 on HHS | no |
| 4 (§16)   | pool override beats direction — a wall hangs from its ceiling | **no** |

## 16.3 I MEASURED THE PROPOSED GUARD. IT IS RIGHT, AND IT IS BIGGER THAN "SMALLEST FIX".
Proposed: `if (poolJ >= 0 && poolCls <= bestCls)` — a pool member may replace the winner only if it
is at least as good a *direction*. Applied to the **judge only** and re-run:

| | shipped | with guard |
|---|---|---|
| HHS `§CPM_DISPLAY midair` | **0** | **316** |
| Duplex `§CPM_DISPLAY midair` | **0** | **88** |
| HHS judge-vs-eye DELTA at DAY 0 HR 3 | 15 | 14 |
| HHS `judgedOnPLAYEDtimes` | 783 | 886 |

**That 0 → 316 is the measurement of how much the pool override is currently hiding.** It is the
strongest single argument the guard is correct — and it is also the reason it cannot ship casually.

### ⛔ TWO THINGS THE PROPOSAL MISSES
1. **There are TWO copies of the override, and the proposal names one.**
   `support_sweep.js:465` (**the judge**) and `cpm_schedule.js:159` (**the scheduler**, which builds
   the E1 DAG). The 0 → 316 above is judge-side only — the scheduler still elected the ceiling. Patch
   one and the two judges disagree by 316 elements: that is precisely the `§CPM_PARITY` drift
   `probe_cpm_schedule.js` was written to catch (`_designatedSupport`'s own header says it "mirrors
   cpm_schedule.js's designatedSupport EXACTLY … a diverging edit here fails that witness loudly").
   **Both copies, one commit, or nothing.**
2. **The guard rescues this wall partly by tie-break luck.** Among cls-0 candidates the score is
   `-S.tz` — highest top wins. The basement wall tops at `0.00`; the pipes top at `-0.45`. The wall
   wins **because it happens to be taller**, not because a pipe cannot bear a wall. Invert those two
   numbers and the pipe is elected again. So the guard is **necessary and not sufficient**: the
   review's own root cause #1 — *`supportPool` contains no walls, so a wall standing on a wall is
   unrepresentable* — is untouched by it. Fixing the pool is the real repair; the guard stops the
   worst symptom.

## 16.4 RESUME — §16 slots in, it does not reorder §14.6
§14.6's ordering stands: the rescale deletion is still first, because defect 1 is the only one it
fixes and it fixes it structurally. §16 is **parallel work on the judge**, not a competitor:
1. (unchanged) delete the rescale — defect 1 → 0.
2. (unchanged) gate `_midairAudit` on `kernel_ops` times **+ fix the #1435 `census()` lock in the
   same commit**.
3. **NEW — §16.** Guard the pool override **in both copies**, then measure: expect the judge to go
   loudly red (HHS 316, Duplex 88) and expect the scheduler to actually re-time those elements.
   Then re-check §S26.2's own motivating number (Duplex 761-vs-1 physics-vs-phase contradictions) —
   the guard partially un-restricts what §S26.2 restricted, and that is exactly the thing to measure
   rather than assert.
4. Then the pool itself: walls as support candidates. And `SS` → whether E1 should ever be `FS`.
5. Defects 2 and 3 (§14.4) still open, 63 elements on HHS.

**Do not quote `midair=0` from anywhere as evidence of anything. Four separate mechanisms produce it.**


---

# §17 — THE POOL IS THE WRONG PREDICATE. MEASURED, AND IT BEATS THE GUARD. (2026-08-26)

The review asked the right question — *"is `supportPool` the wrong predicate?"* — so I measured it
instead of arguing it. Four pool variants × two election rules, judge `require`d from
`support_sweep.js`, the guarded variant a **sed'd copy of that same file** (never a hand-written
election — §10.1 rule 1). `origin/main` @ `44f42dd`.

## 17.1 §S26.2's OWN NUMBERS — half reproduce EXACTLY, half do not reproduce at all
`schedule_gate.js:1310`: *"support = anything below gives 4,706 bearing relations and 761
physics-vs-phase contradictions; support = load-bearing classes gives 702 and 1."*

```
Duplex_extracted  n=1119
  ALL contact pairs                = 19550
  BEARING-BELOW pairs (anything)   =  4706   ◄ §S26.2's 4,706, EXACT
  BEARING pairs, shipped pool      =   716   ◄ §3.1's 716, EXACT (the comment says 702 — stale by 14)
  BEARING pairs, structural classes =  1807
```
So **"bearing relations" means all bearing-below CONTACT PAIRS**, not designated supports — worth
knowing, because every other number in this lane counts designated supports (one per element).
**The contradiction half does not reproduce.** Under the obvious reading (support's `seq` later than
the element's) I get 2,170 / 8 on pairs and 152 / 16 on designated — never 761 / 1. ⛔ **Do not
re-quote 761-vs-1 until someone finds the definition that produces it.** It is the number the pool
is justified by, and it is currently unreproducible from the code as shipped.

## 17.2 THE POOL VARIANTS, on designated supports
`STRUCT = /^Ifc(Wall|Column|Beam|Slab|Footing|Pile|Member|StairFlight|Plate|Roof)/` — structure by
CLASS, independent of the phase-sequence number. That is §S26.2's own phrase, "load-bearing
classes", taken literally.

| pool | Duplex bearing / contra / des=-1 | HHS bearing / contra / des=-1 |
|---|---|---|
| A none (anything below) | 945 / 152 / 12 | 5355 / 2066 / 53 |
| **B shipped** (`seq<=4 ∪ slab ∪ stair`) | **348 / 16 / 28** | **3332 / 974 / 63** |
| **C structural CLASS** | **789 / 31 / 27** | **3825 / 1299 / 56** |
| D union (B ∪ C) | 789 / 31 / 27 | 3825 / 1299 / 56 |

**`D === C`, exactly, on both buildings.** The `seq <= 4` filter contributes nothing the class filter
does not already provide — its extra members never win an election. **It is replaceable, not merely
supplementable.** That is the empirical form of the review's point: `seq <= 4` means *"scheduled in
an early phase"*, not *"can carry weight"*, and nothing is lost by saying what was meant.

The class pool **doubles real bearing supports** (Duplex 348 → 789, +127%; HHS 3332 → 3825, +15%)
and also **reduces the uncountable population** (`des = -1`: Duplex 28 → 27, HHS 63 → 56), so it
nibbles at §14.4 defect 3 as a side effect. Cost: contradictions roughly double (16 → 31, 974 →
1299) — under *my* metric, which is not §S26.2's. **That trade must be re-measured with the real
metric once §17.1 is resolved, not with mine and not by assertion.**

## 17.3 ⛔ THE CLASS POOL FIXES §16's WALL. THE GUARD IS NOT NEEDED FOR IT.
Same element, same graph, only the pool swapped:
```
B_shipped (seq<=4|slab|stair)  -> des = IfcSlab            1hOSvn6df7F8_7GcBWlRqU  dz = +2.99m  ABOVE  ✗
C_structClass (by CLASS)       -> des = IfcWallStandardCase 2O2Fr$t4X7Zf8NOew3FK80  dz = -1.05m  BELOW  ✓
```
The basement wall is `IfcWallStandardCase seq=5` — **excluded from the shipped pool purely by its
phase number.** Make the pool structural and it is eligible, wins cls-0 outright, and the ceiling
never enters the election. **No guard, no tie-break luck, no override to reason about.**

This reverses §16.3's recommendation. The guard treats the symptom — *"don't let a pool member
outrank a better direction"* — and §16.3 already showed it works partly by accident (the wall wins
on `-S.tz` because it happens to be taller than the pipes). The pool fix removes the cause: the
right support was never in the running.

## 17.4 AMENDED ORDER for §16.4 step 3
Was: *guard both copies, then measure.* **Now: fix the pool first, then ask whether the guard is
still needed.**
1. Resolve §17.1 — find the definition that yields 761-vs-1, or mark the comment unreproducible.
   The pool's entire justification rests on it.
2. Change `supportPool` (`schedule_gate.js:1312`) to structural classes. **One definition, one
   place** — `cpm_schedule.js:159` and `support_sweep.js:465` both call it, so unlike the guard this
   fix has **no second copy to keep in parity**. That is a further argument for it over §16.3.
3. Re-measure §S26.2's real metric, `midair` on both timelines, and the §16 wall.
4. **Only then** decide on the direction guard. It may be redundant; if it is not, it lands in both
   copies in one commit (§16.3).

**Unchanged:** §14.6's ordering (rescale first), and the standing rule that `midair=0` proves
nothing — four mechanisms produce it.


---

# §18 — §17 WAS WRONG. `seq<=4` IS NOT ARBITRARY, AND MY CLASS LIST WAS AN INVENTION. (2026-08-26)

The review's third point — *"replacing `seq<=4` with a hand-written class list moves the
arbitrariness from a phase number to a regex; a glass panel as a load-bearing support is a claim,
not an extraction"* — is correct, and chasing it down reverses §17.4.

## 18.1 THERE IS NO EXTRACTABLE LOAD-BEARING SIGNAL. Checked, not assumed.
```
sqlite3 Duplex_extracted.db ".schema elements_meta"
  → guid, ifc_class, element_name, storey, discipline, material_name, material_rgba, building
```
**No `LoadBearing`, no Pset table, no property table** — in any shipped building DB. And
`material_name` is not a material: HHS carries `≈ White` / `≈ Purple` / `≈ Cyan` — colour
placeholders. **So "is this structural?" cannot be extracted from the data we ship today.** Every
candidate predicate is a proxy. The only question is which proxy has a written derivation.

## 18.2 ⛔ `seq <= 4` IS THE CLASSIFIER'S OUTPUT, NOT A PHASE NUMBER STANDING IN FOR STRUCTURE
Measured — the classifier already splits `IfcPlate` into structure and cladding **by name**:
```
HHS_Office_Federated   IfcPlate seq=4 phase=Superstructure  n=  191   inShippedPool=TRUE
                       IfcPlate seq=6 phase=Architecture    n=  438   inShippedPool=false
                       IfcMember seq=3 phase=Superstructure n= 1450   inShippedPool=TRUE
Terminal               IfcPlate seq=4 phase=Superstructure  n=33324   inShippedPool=TRUE
```
That split is `rates.js SEQUENCE_NAME_OVERRIDES.glazed_curtainwall_facade` (§4D_FACADE_ORDER,
`pattern: glaz|glass|verglas|vitrage|vidrio|curtain|mullion` → `sequence: 6`), whose own comment
says it exists because *"ifc_class alone cannot tell curtain-wall glazing/framing from genuinely
structural plates/members (e.g. Terminal's Metal Deck IfcPlate, seq 4 is correct there) — name is
the only extracted signal."*

**So `seq <= 4` carries a cited derivation after all, and §17's regex would have deleted it.**
`/^Ifc(…|Plate|…)/` puts all 438 HHS curtain-wall glass panels back in the pool as load-bearing
supports — re-breaking a shipped, documented, deliberate fix. §17.2's *"the `seq<=4` filter
contributes nothing"* was measured on `bearing / contradictions / des=-1` and those three numbers
did not see it. **A metric that cannot see the thing you are about to delete is not a licence to
delete it** — the §14.3 lesson (right judge, wrong stage) in a third costume.

## 18.3 THE MINIMAL FIX, MEASURED — `E = shipped ∪ IfcWall*`
§16's defect is specific: **a wall standing on a wall is unrepresentable**, because
`IfcWallStandardCase seq=5` is excluded. Nothing in the codebase claims an architectural wall cannot
carry load — unlike glazing, which §4D_FACADE_ORDER explicitly separates. So add exactly walls:

| pool | Duplex bearing / contra / des=-1 | HHS bearing / contra / des=-1 |
|---|---|---|
| B shipped | 348 / 16 / 28 | 3332 / 974 / 63 |
| C structural CLASS (§17, **rejected**) | 789 / 31 / 27 | 3825 / 1299 / 56 |
| **E shipped ∪ `IfcWall*`** | **789 / 31 / 27** | **3761 / 1181 / 57** |

**E === C on Duplex** (its `C\B` was only walls anyway) and on HHS **E captures 87% of C's bearing
gain for 118 fewer contradictions** — because the 438 glass panels are the difference. And it fixes
the traced element:
```
B_shipped                 -> des = IfcSlab             dz = +2.99m  ABOVE  ✗
C_structClass (rejected)  -> des = IfcWallStandardCase dz = -1.05m  BELOW  ✓
E_shipped+walls           -> des = IfcWallStandardCase dz = -1.05m  BELOW  ✓
```
E is still a proxy and still needs its own written justification — but it is **one class, one
sentence, one measured defect**, not a ten-class regex nobody derived.

## 18.4 THE CONTRADICTION RISE IS STILL UNJUDGED, AND IT IS NOW THE GATING QUESTION
E moves HHS contradictions `974 → 1181` (+207). That is the number §S26.2 built the pool to
suppress, and §17.1 established **the pool's justifying figure (761-vs-1) does not reproduce.** So:
1. **Resolve §17.1 first.** Either 761-vs-1 reproduces under a stated definition, or §S26.2's
   conclusion is recorded as having no reproducible basis. **Do not change the pool before this** —
   the rise from 974 → 1181 cannot be judged against a number nobody can recompute.
2. Then decide whether the rise is a defect or a disclosure. Bar spec §5.1 (*"cycles are data
   defects — name them, never schedule around them"*) argues a rise can be correct: it surfaces bad
   classification instead of hiding it. **That is a judgment, and it has not been made.**
3. Then `E`, not `C`. And record its one-sentence justification in `supportPool`'s own comment.

## 18.5 AMENDS §17.4
~~"Change `supportPool` to structural classes."~~ **Retracted.** Replaced by §18.3's `E`, gated on
§18.4 step 1. §17.1 (the unreproducible 761-vs-1), §17.2's table, and §17.3's demonstration that the
pool — not the override — is the lever all stand unchanged. §16.3's direction guard stays deferred:
decide it after `E`, since `E` may make it redundant.

## 18.6 THE LESSON — a null result is only as strong as the metric's ability to see the effect
§17.2 concluded *"the `seq<=4` filter contributes nothing the class filter does not already give"*
from `D === C` on three numbers: bearing relations, phase contradictions, `des = -1`. All three are
**structurally blind to the thing `seq<=4` was doing**, which was keeping 438 window panes out of
the support pool. Confirmed by name, not inferred:
```
HHS IfcPlate by element_name:   Verglasung (glazing) = 438      other = 191
HHS IfcPlate by assigned seq:   seq=6 Architecture   = 438      seq=4 Superstructure = 191
```
Exact correspondence. The classifier is doing precisely what §4D_FACADE_ORDER says it does, and the
metrics I chose could not register it either way.

**The rule: before concluding "X contributes nothing", state what a contribution would have looked
like in the number you are reading.** If you cannot answer that, the null result is not evidence —
it is an unmeasured question wearing the costume of a measured one. This is §14.3's right-judge-
wrong-stage applied to *negative* findings, and it is now the third time this lane has paid for the
same mistake in a different disguise (§9.4 re-derived judge → §14.3 wrong stage → §17.2 blind metric).

## 18.7 AND THE ANSWER TO THE QUESTION THAT STARTED IT
*"Can witness logging free us from probabilistic visual proof? We want deterministic geometry in
maths truth."*

**For WHETHER something floats: yes, and it already has.** `§FGA_EYE_FLOATING` is a per-instant,
geometry-derived predicate — contact list ∩ placement times. Same DB, same code, same 15 floaters,
forever. The photograph's only remaining job was to make someone *ask*; once the question became an
invariant the image was disposable, and no screenshot has been needed since.

**For WHAT COUNTS AS SUPPORT: no, and no amount of logging will.** `midair=0` was deterministic and
reproducible for months while four separate mechanisms produced it. The predicate underneath —
`supportPool`, `grounded`, `designatedSupport` — is where the physics actually lives, and §18.1
established there is **no extractable load-bearing signal in any shipped DB** (no `LoadBearing`, no
Pset table, `material_name` = colour placeholders). Every pool is a proxy.

**So the standard is not "is the number deterministic" but "does the predicate have a written,
cited derivation."** `seq <= 4` has one (§4D_FACADE_ORDER). My class regex had none. That is the
entire difference between the two, and it is invisible to every metric in §17.2's table.
**Where no derivation exists, the correct output is a flagged unknown, not a confident number** —
which is what §17.1's unreproducible 761-vs-1 is, and the one thing in this lane that must not ship
as "flagged."
