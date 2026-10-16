# ARCHIVED 2026-08-19 — §S27 · §S28 (both NOT VETTED) · §RESULTS (superseded)

Moved out of `prompts/4D_GANTT_TM_REFACTOR.md` to keep the live file to facts. **Nothing here is a
build target.** Kept verbatim because §S27.R and §S28.R record WHY each design failed, and that
reasoning is cited by §S32 and §S37.

Live file: `prompts/4D_GANTT_TM_REFACTOR.md`.

---

# §S27 — THE GRID: implementable spec (2026-08-19)

**Standing: PROPOSED, NOT VETTED.** Written to be reviewed and torn apart before any build agent is
dispatched — user directive 2026-08-19: *"do not do so until the specs are fully vetted."*
No build work may start against this section until §S27.R records a review verdict.

**Supersedes:** nothing. §S25/§S25_REVIEW stand; §S25_REVIEW.6's `designatedSupport` election win is
independent and should ship on its own merits regardless of §S27's fate. §S26 is the evidence base
this spec sits on — every measurement §S27 relies on is cited there with its `§`-tag, and §S27
introduces NO new measurement of its own.

## §S27.0 — the one-sentence claim, stated so it can be falsified

> A construction schedule is a **grid of (location × trade) cells** whose order comes from two
> ordered lists, not from a derived graph; physics is a post-hoc check on the answer, not an input
> to it; and the result is written into the IFC-native `schedules`/`tasks`/`task_sequences`/
> `task_elements` tables this repo already declares as source of truth.

**It is FALSE if any of these is false, and each is measurable before the next is built:**

- F1 — a location layer can be computed that covers **100%** of scheduled elements (§S26.16 measured
  the room layer at 0-13%; that is the specific failure this must beat).
- F2 — trade order within a location is total and needs no solving (i.e. `sequence_rules.json`'s
  existing `seq` is already a total order over trades).
- F3 — the schedule that results is not worse than today's on the two invariants already locked:
  `auditFloating` float and the directional midair judge.
- F4 — a planner-grade programme (Hospital's own 121 tasks / 43 links, §S26.13) is expressible in
  the resulting tables without loss.

## §S27.1 — data model (4 objects, nothing else)

```
ZONE     { id, band, name, storeyRefs[], polygon|rasterMask, area_m2, elementCount }
CELL     { zoneId, tradeSeq }                    -- the unit of scheduling; == one Gantt bar
TASK     { id, cellId, name, start, end, durationSecs, elementGuids[] }
LINK     { fromTaskId, toTaskId, type=FS, lagSecs, origin: 'template'|'manual'|'physics' }
```

`CELL` is the whole model. An element belongs to exactly one cell. A cell is one bar. **Elements
carry no links.**

## §S27.2 — STAGE 1: the zone compiler (`compile_zones`)

**Reuse, do not rewrite:** `scripts/compile_rooms.py` / `build/room_walker.js` already rasterize a
storey's wall/door/column/window footprint at `RES=0.20m` with `SEAL=2` dilation and
`RASTER_EPS=1e-6` translation invariance (§S26.16). **Take that rasterizer verbatim. Change only the
consumer.** Rooms flood-fill the pockets the exterior CANNOT reach; zones partition the storey's
OCCUPIED extent, so fabric is included.

1. **Band the storeys first.** `spatial_structure` reports 63 storeys for Hospital, 73 for Terminal,
   38 for LTU (§S26.16) — federated pseudo-storeys. Merge by the shipped 3m band rank
   (`§S1_BAND_RANK`, already used by two consumers). A storey NAME is a display label and is never
   an identity. **A band, after merge, is a LEVEL.**
2. **Per level, rasterize the union of all element footprints** (not just wall-like — every
   scheduled element, because every one must land somewhere).
3. **Zone = connected component of that occupancy raster**, min area `ZONE_MIN_AREA` (start at
   `MIN_AREA=4.0` m², the room compiler's own constant — do not invent a new one). Components below
   it merge into their nearest neighbour by centroid distance.
4. **If a level yields ONE component, that level is ONE zone.** This is expected and correct — it is
   the coarse LBMS case, and it degenerates the grid to level × trade, which is still a valid grid.
   **It is NOT a failure and must not be "fixed" by forcing a k-way split.**
5. Zone names are deterministic: `L{bandRank}-Z{componentIndex}`, ordered by centroid (x then y).
   Hospital's own hand-authored programme names them `Zone A/B/C` (§S26.13) — a display alias may
   map onto these, but the identity is the computed one.

**STOP CONDITION S1 (independently checkable, no scheduler needed):** every scheduled element on
every one of the 7 fleet buildings is assigned to exactly one zone. Report `unassigned=0`. Anything
above 0 is a STOP, not a default-bucket. **This is F1 and it is the gate for the whole spec.**

## §S27.3 — STAGE 2: element → cell

`cell(e) = (zone(e), tradeSeq(e))`.

- `zone(e)`: the zone whose raster the element's XY centre falls in, on its own band. For an element
  spanning bands (16.3-16.7% of elements, §S26.5), use its **base** band — that is when it starts
  being built.
- `tradeSeq(e)`: the existing `e.seq` from `viewer/rates/sequence_rules.json`. **Not re-derived.**
- Declared containment (`rel_contained_in_space`) is used where present as a FINER sub-location for
  reporting only. **It does not select the cell** — coverage is 0-13% (§S26.16) and a
  minority-coverage key must never be load-bearing.

**STOP CONDITION S2:** `count(distinct cell) ` is reported per building, and no cell holds more than
`CELL_MAX_FRAC = 40%` of the building's elements. LTU's `Plan 1` currently holds 36% of the building
in one storey group (§S26.6 C2) — if the grid reproduces that, the zone split is not doing its job
and the cause must be reported, not tuned around.

## §S27.4 — STAGE 3: order, from two lists

- **Trades within a level:** ascending `seq`. Verify F2 first — that `sequence_rules.json` yields a
  TOTAL order over the trade values actually present (no ties that matter, no gaps that imply
  concurrency). If it does not, report and STOP; do not invent a tiebreak.
- **Levels:** ascending band rank.
- **Nothing else orders anything.** No graph, no topological sort, no SCC pass, no cycle-breaker.

## §S27.5 — STAGE 4: the template (the only tunable)

A template is a JSON document, shipped as data, editable without a rebuild:

```json
{ "name": "in-situ concrete, floor by floor",
  "trains": ["Substructure","Superstructure","Architecture","MEP","Finishes"],
  "offsets": { "Superstructure": {"after":"Substructure","levels":0},
               "Architecture":   {"after":"Superstructure","levels":1},
               "MEP":            {"after":"Architecture","levels":1},
               "Finishes":       {"after":"MEP","levels":1} },
  "structureRunsAhead": 0 }
```

`structureRunsAhead: 0` = in-situ concrete (a storey completes before the next starts).
`structureRunsAhead: 3` = the steel-frame case the USER named — frame erected 3 levels ahead of
slabs. **Default ships as in-situ concrete**, per the user's product ruling: the long tail of DIY /
small firms wants a sensible OOTB default and experts adjust or replace it.

**Durations** come from `installSecs` exactly as today (`§S25.8`) — a cell's duration is the sum
over its elements, divided by its crew count. **Not re-derived, not invented.**

**STOP CONDITION S4:** changing one offset value changes the schedule and nothing else; the shipped
default reproduces Stage 3's ordering exactly.

## §S27.6 — STAGE 5: links are the exception

Only three origins, and the count is reported per building:

- `template` — the offsets above, materialised as cell→cell FS links.
- `manual` — a person adds one where the grid is genuinely wrong (transfer beam, long-span truss,
  temporary works). Expected order: **tens per building, not thousands.**
- `physics` — **NOT generated in v1.** The 2.46-million-arrow web (§S26.12) is exactly what this
  spec exists to delete. See §S27.8 for the explicit prohibition.

**Cycle policy, taking the field's approach over this engine's (§S26.10):** a link that would close
a cycle is **REFUSED at insertion and reported**, never created-then-contracted. No Tarjan, no
condensation, no cycle-breaker anywhere in v1.

**STOP CONDITION S5:** `linkCount` per building is reported and the `manual` bucket is 0 on a
first run. If the template alone cannot produce a schedule without manual links, say so — do not
back-fill with physics links.

## §S27.7 — STAGE 6: physics becomes a check

Run the existing, unchanged judges on the finished schedule:

- `ScheduleGate.auditFloating` — the float number `witness_midair_zero.js` W-MZ-8 already locks.
- the directional midair judge (`_midairAudit`).

**STOP CONDITION S6 (this is F3, and it is the real acceptance test):** per building, float and
midair must be **no worse** than the live engine's current numbers — the §S26.14 "before" column
(Terminal float 4,756 / midair 0; Hospital 7,753 / 0; Clinic 1,102 / 0; LTU 12,712 / 0; Duplex
247 / 0; HHS 1,531 / 0; JKR 3,183 / 0). A regression here kills §S27 regardless of how clean the
grid is. **Note explicitly: a "0 violations" result from a check built on the grid's own definitions
is NOT evidence** — §S25_REVIEW's `engineGap` tautology is the standing precedent. Only the
pre-existing judges count.

## §S27.8 — STAGE 7: write into the tables that already exist

`schedules` / `tasks` / `task_sequences` / `task_elements` — declared source of truth at
`schedule_author.js:6`, built by the user in PR #59 / #502, currently **0 rows on every shipped
building** (§S26.13).

- One `tasks` row per CELL. Hospital's own planner-authored programme is 121 tasks for 63,182
  elements (§S26.13); a grid of ~7 levels × ~5 trades × 1-3 zones lands in the same order of
  magnitude. **That similarity is the sanity check for F4.**
- One `task_sequences` row per LINK.
- `task_elements` maps elements to their cell's task.
- `Terminal_meta.db` lacks these tables entirely while the other six have them empty — establish
  which extraction vintage is current BEFORE writing (§S26.15).

**PROHIBITION, and it is the most important line in this spec:** do **not** write element-level
physics arrows into `task_sequences`. That would persist the 2.46-million-edge web into the
IFC-native container and make the blob permanent instead of ephemeral (§S26.15).

## §S27.9 — build order and model assignment

| stage | deliverable | model | why |
|---|---|---|---|
| — | this spec, vetted | **Fable** (review) | the role that caught `engineGap` being arithmetically incapable of failing |
| S1 | `compile_zones` + coverage report | **Sonnet** | mechanical once §S27.2 is fixed; stop condition is a single number |
| S2 | element→cell + cell-size report | **Sonnet** | same |
| S3-S4 | order + template loader | **Sonnet** | data-driven, no judgment |
| S5-S6 | links + judge run | **Sonnet** | judges already exist and are unchanged |
| S7 | table writer | **Sonnet** | DDL already shipped |
| any | a stage that STOPS | **Opus** | a stop condition firing is a design question, not a coding one |

**No stage may begin before its predecessor's stop condition is reported green with its number.**
Stages S1-S2 need no scheduler at all — they are properties of the data.

## §S27.10 — what §S27 does NOT solve (stated in full, per §S26.7's precedent)

- **Crew levelling quality, duration realism, makespan credibility.** `installSecs` is carried
  through unchanged; whether the resulting durations are believable to a planner is untested.
- **The construction-practice claims in §S26.4/§S26.11 have not been checked by a real planner.**
  They are general knowledge. F4's Hospital comparison is the only empirical anchor.
- **Zone semantics.** A connected component is a computable proxy for a planner's zone, not the same
  thing. If S1 yields one zone per level on most buildings, the grid is level×trade and this spec
  delivers no zone benefit — only the deletion of the graph. **That would still be a win, but it
  must be reported as what it is, not dressed up.**
- **`rel_contained_in_space` at 0-13%** stays unused for cell selection (§S27.3).
- **The host/opening declared-relation gap** (§S26.12.2 — read on import, dropped before the shipped
  DB, geometric guesses backwards 18-40%/76%) is NOT fixed here. It is an extraction fix and belongs
  in its own lane.
- **The `designatedSupport` election win** (§S25_REVIEW.6) is orthogonal and unaffected.
- **Nothing about steel-frame templates is verified** beyond the user's own observation.

## §S27.R — REVIEW VERDICT (to be filled by the vetting pass; empty = NOT VETTED = do not build)

**VERDICT: NOT VETTED.** The evidence base (§S26) held up under independent re-derivation almost
completely — but §S27 itself carries four blocking defects (R1-R4), each of which would force a
Sonnet build agent to invent, and inventing is the one thing this project forbids. Written
2026-08-19 by the vetting pass §S27.9 row 1 asked for. Method: per the WATCHDOG mandate, nothing
was inherited — every number below was re-measured by this pass's own commands (logs in the session
scratchpad; probe re-runs via `scripts/probe_s26_rank_monotone.js`, DB queries via python3/sqlite3
read-only, IFC via grep). `viewer/` untouched; bim-ootb read-only throughout.

### §S27.R.0 — VERIFIED, re-derived independently (the §S26 base is real)

| claim | source | re-derived result |
|---|---|---|
| room-coverage table, all 7 rows | §S26.16 | **exact**: Hospital 63,415 el / 63 storeys / 142 spaces / 8,474 (13.4%) · Clinic 16,114/3/118/2,133 (13.2%) · Terminal 48,428/73/73/1,009 (2.1%) · JKR 9,410/4/79/107 (1.1%) · HHS 6,880/3/14/88 (1.3%) · LTU 125,698/38/0/0 (0%) · Duplex tables absent |
| 63/73/38 pseudo-storeys | §S27.2.1 | **exact** (`spatial_structure WHERE type LIKE '%Storey%'`) |
| §S26.5 backward-relation table | §S26.5 | **exact** on the 2 re-run buildings: `STRUCT=1 EMBED=0 HANG=0` → Duplex 51/850 (6.00%), bearing 30/702, host 9/104, opening 12/44; Clinic 834/11,325 (7.36%), bearing 261/8,189, host 484/2,737, opening 89/399; both `kahnLeftover=0 largestSCC=1` |
| §S26.1 live vs corrected SCC | §S26.1 | **exact** on Duplex: live 672, `STRUCT=1 EMBED=0` 5, n=1,119; bearing-only acyclic (§S25_REVIEW.5) confirmed by the same run's `bearingKahnLeftover=0` |
| task tables empty | §S26.13 | **confirmed with a correction — see R9**: Hospital/Clinic/JKR/HHS/Duplex all 0 rows; Terminal_meta AND LTU_AHouse_meta lack the tables entirely |
| §S26.14 branch | §S26.14 | branch `fix/s26-drop-carrier-ordering` exists (local+origin, `c30623d` off `6a395ca`); diff is exactly the one-line `if (bestCls === 2) continue` twin change at `cpm_schedule.js:138` + `time_machine.js:4593`. Fleet before/after numbers NOT re-run (cost); the before column matches §S25_REVIEW.2's independently-printed CPM column 7/7 — but see R8 |
| code citations | §S26.12/13, §S27.7/8 | `schedule_author.js:6` SOURCE-OF-TRUTH line ✓ · `schedule_gate.js:92-93` host-inference honesty note ✓ · `import_worker.js:315-317/:329` voids/fills readers ✓ · `witness_midair_zero.js:127` slices `_designatedSupport` by source text ✓ · `storey_walkable_raster` persisted in exactly 2 DBs (Hospital_meta, Terminal_meta) ✓ · Hospital's 8,474 containment rows all `RM_*` guids — compiled, not IFC-read ✓ |
| Hospital 2.0.ifc programme | §S26.13 | 43 `IFCRELSEQUENCE` ✓ · 1 `IFCWORKSCHEDULE` ✓ · 1 `IFCWORKPLAN` ✓ · **121 IfcTask is WRONG — see R6** |

A bonus reconciliation the file never states: the two different element counts it carries per
building (§S26.1's n vs §S26.16's) are BOTH right — "scheduled n" = `elements_meta` −
IfcOpeningElement/IfcSpace (`schedule_author.js:295`) − rows with no usable transform. Verified
exactly: LTU 125,698−3,368−0=122,330 · Duplex 1,193−71−3=1,119 · Hospital 63,415−0−233=63,182.
That definition is load-bearing for F1/S1 and appears nowhere in §S27 — see R3.

### §S27.R.1 — findings, ordered by how much they change the build

**R1 — BLOCKING, WRONG AS WRITTEN: F2 fails in the spec's own vocabulary — §S27.4 and §S27.5
specify two contradictory orders.** Re-derived from `viewer/rates/sequence_rules.json` (58 classes):
`seq` runs 1-11 with no gaps and each seq maps to one phase in the class map — so at SEQ grain F2
holds (a total order exists). But the class map gives Architecture = seqs **{5,6,8}** with MEP
Rough-in = **{7}** *interleaved between them*, and MEP Final = {9}; meanwhile §S27.5's template
trains are PHASES (`"Architecture"` strictly before `"MEP"`), and `"MEP"` matches NO phase value in
the rules (they are `MEP Rough-in`/`MEP Final`). Worse, `NAME_OVERRIDES[0]`
(glazed_curtainwall_facade) assigns phase=Architecture at sequence=**7**, so seq 7 maps to two
phases and phase(seq) is not even a function. §S27.4 (sort by seq → MEP Rough-in runs *inside* the
Architecture band) and §S27.5 (offset trains → all Architecture before all MEP) are both normative
and disagree. Per §S27.4's own rule this is report-and-STOP, delivered at vetting time instead of
build time. **Required amendment: declare ONE normative order (seq is the defensible one — it is
what the class map actually totals) and define the train↔seq mapping explicitly (which seqs
constitute each train, and what train owns seq 7's two phases).** Until then S3, S4, S5 and S6 all
stand on an undefined order.

**R2 — BLOCKING, WRONG CITATION: the level ladder §S27.2.1 tells the builder to reuse does not
exist as shipped code, and the nearest shipped thing is the construction §S26.6 C2 forbids.**
`§S1_BAND_RANK` appears in shipped viewer code only as a changelog comment (`sw.js:57`). The
"already used by two consumers" function is `deriveBandRanks` (`schedule_gate.js:329`; consumers
:469 computeSchedule, :1154 deriveZones) — and it is a **storey-NAME ladder** (groups by
`collapsePhase(e.storey)`, ranks names by median base_z), i.e. exactly the "rank came from storey
labels, and labels are junk" defect C2 guards against. The per-element `floor(base_z/3)` dense rank
§S26's numbers were measured with exists ONLY in `probe_s26_rank_monotone.js:15-17` (study-only,
bim-compiler). Two other shipped 3m constructs are near-misses: `time_machine.js:4947`
`Math.floor(cz/3)` (CENTER z, display banding) and `cpm_schedule.js:197` `floor(levelMeanZ/3)`
(name-keyed levels). A build agent following §S27.2.1 literally would wire in the name ladder and
believe it complied. **Required amendment: name the exact construction (per-element
floor(base_z/3), dense-ranked, the probe's) and state that it must be ported, not found.**

**R3 — BLOCKING, ENGINEGAP-CLASS: STOP CONDITION S1 (`unassigned=0`) is arithmetically near-unable
to fail, and its only failable population is nonzero TODAY on 4/7 buildings.** The zone raster is
the union of ALL element bbox footprints (§S27.2.2) rasterized as filled rects
(`compile_rooms.py:333` `_rasterize` fills the whole bbox); an element's XY centre always lies
inside its own bbox, so every element WITH a transform lands in an occupied cell — and merge-below-
MIN_AREA still assigns. `unassigned` can therefore only count elements with no usable transform.
Pre-computed today, no scheduler: **Hospital 233, Clinic 43, HHS 41, Duplex 3, Terminal/JKR/LTU 0.**
So as written S1 either (a) includes them → guaranteed day-one STOP on 4/7 buildings, or (b)
excludes them → the check cannot fail and F1 is a tautology, the precise §S25_REVIEW.1 trap §S27.7
warns about — for a different stage than the one it actually bites. **Required amendment: define
the S1 denominator (the R0 reconciliation above is the real one, in code at
`schedule_author.js:295`) and state the no-geo policy explicitly** — these are §S25_REVIEW.8's
`{s:0,e:0}` day-0 population and they must not be silently dropped OR silently day-0'd. The
meaningful F1 content then lives in S2, not S1.

**R4 — BLOCKING, UNDER-SPECIFIED: the computation that produces `TASK.start/end` is not in the
spec.** §S27.4 gives order, §S27.5 durations and offsets, §S27.6 links — no stage says how times
are computed from them: do sibling zones within a level run serial (Hospital's planner chains
Zone A→B→C `.FINISH_START.` — §S26.13) or parallel (completely different makespan and float)? What
lag does `"levels": 1` materialise as? How is a multi-resource cell's "crew count" chosen — seq 4
holds IfcSlab (CONCRETE_GANG) and IfcPlate (STEEL_ERECTOR) in ONE cell, and `SEQUENCE_DEFAULT`
(`rates.js:260`) is resource:**null**? Which calendar (`toWall`/`toProductive`, §S25.8)? S4's and
S6's stop conditions both measure this unspecified computation, so neither is currently checkable.
**Required amendment: one §S27.4b-style paragraph defining the forward pass over cells** — it can
be ten lines, but it must exist before a builder writes it by taste.

**R5 — CONDITION, WRONG NUMBER: STOP CONDITION S2's threshold misses its own motivating case and
trips a different building on day one.** Pre-computed today (band=floor(base_z/3), seq from the
class map, degenerate 1 zone/level): max cell share **LTU 19.2%** — the LTU `Plan 1` 36% worry
§S27.3 cites dissolves at cell grain because trades subdivide it — while **Terminal = 40.3%**
(19,521/48,428 in band 6 × seq 4: the Metal Deck IfcPlate population) already exceeds
`CELL_MAX_FRAC=40%`. Others: Duplex 37.9%, Clinic 20.3%, JKR 13.7%, HHS 12.9%, Hospital 11.0%.
As configured, S2 = a guaranteed Terminal STOP (→ Opus per §S27.9) unless zones genuinely split
band 6, and near-vacuous everywhere else. The threshold was set without computing the distribution
it gates. **Amend: either re-derive the threshold from the failure it is meant to catch, or
pre-declare Terminal's stop as the expected first Opus question.** (Method caveat: computed from
the JSON mirror's class map without NAME_OVERRIDES; the curtain-wall override matches zero Terminal
elements by that rule's own documentation, so band6×seq4 stands.)

**R6 — CONDITION, WRONG NUMBER: Hospital's programme is 75 IfcTask, not 121.** `grep -o
"IFCTASK("` on `/home/red1/Downloads/Hospital 2.0.ifc` → **75**; `grep -c "IFCTASK"` → 121 = 75 +
46 `IFCTASKTIME` — the 121 is a substring conflation, the exact GIGO shape the WATCHDOG names. The
project's own importer agrees: `Downloads/Hospital 2.0_meta.db` holds tasks=**75**,
task_sequences=43, schedules=1, task_elements=2,900 (the "2900 links" §S26.13 itself quotes).
43 IfcRelSequence and 1 IfcWorkSchedule verify. Correct §S26.13's table, F4's text, and §S27.8's
sanity line. The order-of-magnitude argument survives — today's occupied (band×seq) cell counts are
Hospital 94, Terminal 74, LTU 68, Clinic 45, JKR 42, HHS 35, Duplex 27, same order as 75.

**R7 — CONDITION, F4 IS UNVERIFIABLE AS WRITTEN, and its anchor contradicts the zone definition.**
(a) No stage measures F4: §S27.8's "same order of magnitude" is not "expressible without loss", and
round-tripping the planner's actual 75 tasks/43 links through the tables is PR #59's importer path,
which §S27 never schedules as a check. (b) Zone = connected component of an occupancy union that
INCLUDES floor slabs (§S27.2.2 "every scheduled element") — a continuous floor plate is one
component by construction, so k=1 per level is the near-certain outcome, which §S27.2.4/§S27.10
accept; but Hospital's planner cut THIS connected building into Zone A/B/C — a spatial split of one
plate. The spec's own F4 anchor is evidence that connectivity cannot reproduce planner zones.
**Amend: give F4 a real check (import the planner's programme into the same tables and diff), and
state in §S27.10 that connectivity-zoning cannot produce Hospital's A/B/C — only disjoint plates
ever split.**

**R8 — CONDITION, INSTRUMENT MISMATCH in STOP CONDITION S6.** S6 pins the §S26.14 "before" column
(probe-measured, e.g. Duplex float **247**) but mandates "the existing, unchanged judges" as the
instrument. Run today on live `main` (`ONLY=Duplex node viewer/tests/witness_midair_zero.js`): the
judge-side measure is `auditFloating 0 → 237`, and W-MZ-8 currently **FAILS** (locked 289, got 237)
— the §RESULTS-addendum Duplex regression, still open. Two instruments, 247 vs 237, ten apart on
the smallest building. "No worse than live" is unfalsifiable until the baseline names its
instrument, shift-hours, and DB set — and until the addendum's two open items (Duplex/HHS TRADE
regression; the #1427/#1428 Hospital/Terminal meta elevation-patch integrity check, which sits
directly under §S27.2's banding input) are resolved or explicitly carried as known-dirty baseline.
S6 is otherwise the one genuinely external check in the spec — this is fixable with one table.

**R9 — CONDITION, WRONG: §S27.8 "Terminal_meta.db lacks these tables entirely while the other six
have them empty."** Re-derived via sqlite_master: **LTU_AHouse_meta.db also lacks all four tables**
(and `qto_cache`/`storey_walkable_raster`). Five empty + TWO absent. The "which extraction vintage
is current" question §S27.8 defers is therefore bigger than stated and blocks S7 on two buildings,
not one.

**R10 — NOTE, WRONG SOURCE CITED: §S27.3's `tradeSeq` source.** `viewer/rates/sequence_rules.json`
is a documented MIRROR — its own `meta.note`, `rates.js:109` and `sw.js:186` all state viewer.html
never calls `loadSequenceRules()`; the executed tables are `rates.js`'s hardcoded
`SEQUENCE_RULES`/`SEQUENCE_DEFAULT`/`SEQUENCE_NAME_OVERRIDES`. The mirror has drifted before
(worth 37d of Hospital programme, per its own header). Cite `rates.js` as the source, or declare
the JSON authoritative for the new engine and say the divergence risk out loud.

**R11 — NOTE, §S27.10 honesty gaps (Q: is the not-solved list complete? No — five omissions):**
1. the **#1427/#1428 elevation-patch integrity question** (§RESULTS addendum, §S25_REVIEW.8) —
   open, and §S27.2's bands are computed from exactly those possibly-patched base_z values;
2. the **Duplex/HHS TRADE-invariant regression** (addendum: "real/unexplained") — open, and it
   lives inside S6's baseline (R8);
3. the **no-geo population** (R3) and its consumer contract (§S25_REVIEW.8's `{s:0,e:0}` day-0
   poison) — never mentioned;
4. the **template-blind midair judge**: §S26.4b names "a hard-coded assumption about how buildings
   go up" a latent defect, §S27.5 ships steel-frame as template two, §S27.7 runs today's judge
   unchanged — a steel-template run will fail S6's judge on legitimate schedules; only the in-situ
   default is protected, and §S27.10's "nothing about steel-frame is verified" understates this;
5. **manual links assume an editing surface that does not exist** — §S27.6 expects a person to add
   tens of links, §S25_REVIEW.8's "Gantt-drag is still not a design" is the same missing UX,
   unlisted. (Minor: §S26.7's LTU 32×-density perf flag also applies to S6's `auditFloating` run.)

### §S27.R.2 — the stop-condition audit §S27 asked for (Q3, answered directly)

No stage's condition depends on a LATER stage — that §S25.11 defect is genuinely absent (S1's
coverage report needs the `zone(e)` lookup that §S27.3 nominally owns, but §S27.9 puts the report
in S1's deliverable, so it is a blurred boundary, not a forward dependency). The cannot-fail trap
is present twice: **S1** (R3) and **S5**, whose `manual=0` on a first run is true by definition
(nobody has added manual links) and whose "if the template alone cannot produce a schedule" has no
defined failure mode — a grid of two sorted lists ALWAYS produces a schedule. S2 can fail (R5 —
and will, on Terminal). S4 is checkable only after R4 is fixed. S6 is real and external (R8
caveat). S7 has no stop condition at all — F4's check should become it (R7).

### §S27.R.3 — Room Path separability (Q4, answered directly)

§S27.2's "take the rasterizer verbatim, change only the consumer" is **honest at the function
boundary but understates what changes**. Genuinely separable and worth taking verbatim:
`_rasterize` (`compile_rooms.py:333-346` — pure: rects+grid+origin → occupancy bytearray),
`_dilate` (:348-362), the `RASTER_EPS` quantizers and extent formulas (`flood_rooms`:561-562; JS
twin `build/room_walker.js:249-272`, constants :22-40). NOT reusable, must be new code: (a) the
INPUT — `storey_walls` (:256-283) is hardwired to WALL_LIKE classes + `discipline='ARC'` +
§STOREY-Z name-anchor assignment, while §S27.2.2 needs all scheduled elements keyed by band rank
(so the producer changes too, not "only the consumer"); (b) connected components over OCCUPIED
cells — the room code labels components only of FREE space (`flood_rooms` pocket loop,
`_flood_exterior`:716); a CC pass over the blocked set exists nowhere in it; (c) a decision the
spec does not make: does the ZONE raster apply `SEAL=2` dilation (0.4m bridging — fuses anything
within 0.8m into one zone) or the raw raster? It is outcome-determining for zone count and is
unspecified. Constants verified as claimed: RES=0.20 (:19), MIN_AREA=4.0 (:20), SEAL=2 (:34),
RASTER_EPS=1e-6 (:46), §STAIR-EXCLUDE (:51-52), §SUSPECT thresholds (:709, :870). The three
walker copies have drifted in surface area (build/room_walker.js 1,347 lines vs
viewer/lib/room_walker.js 1,474 — the viewer copy adds camera-room-index functions); the
rasterizer core matches, but the spec should name WHICH copy is canonical for the port.

### §S27.R.4 — what this review did NOT check

§S26.14's after-column fleet numbers (branch verified, diff verified, numbers not re-run);
§S26.3's hang-redundancy percentages and §S26.2's 4,706 all-below count (the 702 load-bearing
denominator DID reproduce inside the §S26.5 re-run); §S26.5 on the 5 buildings not re-run
(Terminal/Hospital/LTU/JKR/HHS — the two re-run were exact, and §S26.1's three-probe agreement
covers the SCC side); whether `rates.js` and the JSON mirror are in sync TODAY (R10 is about which
to cite, not a measured drift); and the §S26.4 construction-practice claims, which remain
planner-unverified exactly as §S26.9 says.

### §S27.R.5 — what must change before a build agent is dispatched

R1 (one order + train↔seq map), R2 (name the real band-rank construction), R3 (S1 denominator +
no-geo policy), R4 (define the forward pass) are spec amendments — none is large, all four are
prose, and every one of them is a place a Sonnet builder would otherwise invent. R5-R9 are
corrections/decisions that can land in the same editing pass. **If only one thing is fixed first,
fix R1: every stage from S3 on stands on an order the spec currently defines twice,
contradictorily.** Re-vet is cheap after amendment — this review's commands are all cited and
re-runnable.

---
# §S28 — TWO LANES, NOT ONE PIPELINE (2026-08-19)

**Standing: PROPOSED, NOT VETTED.** Supersedes **§S27's SHAPE**, keeps most of its content. §S27 and
§S27.R stay verbatim as record (same treatment §S24 got from §S25). No build agent may be dispatched
until §S28.R records a verdict.

## §S28.0 — why the shape changed, not just the four findings

§S27.R returned NOT VETTED with 4 blocking findings. Three (R1, R2, R3) are one afternoon's spec
sloppiness and are fixed below. R4 is a real gap and is filled below. **But the reason §S28 exists is
a fifth problem §S27.R did not have to name, because it is about layout rather than content:**

§S27 was a **seven-stage parallel build of a new engine beside a live one with locked witnesses**.
That is the same shape as §S23, §S24 and §S25 — three grand designs in this file, none shipped.
Meanwhile the §S26.14 branch moved measured numbers on 7 buildings with a ONE-LINE change in an
afternoon. A fourth grand design is the predictable failure here, and it is a process risk, not a
technical one.

**§S28 splits the work into two lanes that ship independently and neither of which is big-bang:**

- **Lane A — the engine, by DELETION.** Order stops being derived from a graph. Removes machinery.
  Judged entirely by witnesses that already exist. Does not need Lane B.
- **Lane B — the product, by ADDITION.** The cell grid is written into the IFC-native tables so a
  planner gets something editable. Does not need Lane A.

Neither lane blocks the other. Either can be abandoned without stranding the other.

## §S28.1 — R1 RESOLVED: `seq` is the order; `phase` is a label (and the data was right)

§S27.4 asserted trade order comes from `phase`. Measured against
`viewer/rates/sequence_rules.json`:

```
seq 1        Substructure
seq 2,3,4    Superstructure
seq 5,6      Architecture         (IfcWall, IfcDoor, IfcWindow, IfcStair, …)
seq 7        Architecture         (curtain-wall glazing, via NAME_OVERRIDE 'glazed_curtainwall_facade')
seq 7        MEP Rough-in         (IfcFlowSegment, IfcDuctSegment, IfcCableCarrier, …)
seq 8        Architecture         (IfcRoof)
seq 9        MEP Final
seq 10,11    Finishes
```

`seq` is a **total order over 1..11**. `phase` is **not monotone in seq** — "Architecture" occupies
5,6,7,8 and straddles "MEP Rough-in" at 7. Ordering by phase is therefore ambiguous; ordering by seq
never was.

**RESOLUTION: `seq` is the single normative order everywhere in §S28. `phase` is a DISPLAY LABEL for
the Gantt bar and orders nothing.** A cell is `(location, seq)`, never `(location, phase)`. The
`trains` array in the §S27.5 template is replaced by seq bands; a template names its trains by seq
range, and the phase string is carried through for display only.

**Two elements sharing seq 7 across different phases are CONCURRENT, and that is correct, not a
collision** — curtain-wall glazing and MEP first fix genuinely overlap on site.

**The pattern worth naming, because it is now twice:** a human-readable LABEL used as an IDENTITY.
Storey label `"Roof - Main"` at three elevations (§S26.6 C2); phase label `"Architecture"` across
four seq values straddling another trade (here). **Anywhere this codebase keys off a name a human
typed is a candidate for the same defect.** That is a standing search, not a one-off fix.

## §S28.2 — R2 RESOLVED: the band rank must be BUILT, not cited

§S27.2 told the builder to "use the shipped `§S1_BAND_RANK`". §S27.R found no such shipped function.
Confirmed independently — `schedule_gate.js:476, 483, 856`:

```js
var r = _bandRank[collapsePhase(el.storey)];
rankKey[t] = _bandRank[collapsePhase(elements[t].storey)] || 0;
```

`_bandRank` is keyed on `collapsePhase(el.storey)` — the **storey NAME**. It is the label ladder
§S26.6 C2 forbids, not an elevation banding. Real elevation banding exists only in
`bim-compiler/scripts/probe_s26_rank_monotone.js` (`Math.floor(bz / 3)`, dense-ranked).

**RESOLUTION: Lane B builds `bandRankOf(element)` as new, small, named code**, ported from the
probe's construction, with its own witness. It is NOT a citation of existing work. The existing
`_bandRank` is left alone — Lane A does not touch it and Lane B does not consume it.

## §S28.3 — R3 RESOLVED: a stop condition that can actually fail

§S27's STOP CONDITION S1 was `unassigned = 0` where zones are built FROM the elements' own
footprints — guaranteed by construction, the `engineGap` tautology class (§S25_REVIEW).

**RESOLUTION — S1 is replaced by three numbers, each of which can fail:**

- **S1a — `noGeometry`**: elements with no usable bbox, which genuinely cannot be placed. Non-zero
  today (§S27.R measured Hospital 233, non-zero on 4/7). **Report the count and the class histogram.
  It is a data finding, not a pass/fail** — but a change in it between runs is a regression.
- **S1b — `bandSpan`**: elements whose bbox spans more than one band, assigned to their BASE band.
  §S26.5 measured 16.3-16.7%. **Report it; a large move means the banding changed underneath.**
- **S1c — `zoneCount` per level, and the largest zone's share of its level.** If every level yields
  exactly one zone on every building, **say so plainly** — the grid is level×seq, zones add nothing,
  and §S28.6's zone step should be dropped rather than kept as ceremony (§S27.10's own honesty note).

§S27's S2 threshold (`CELL_MAX_FRAC = 40%`) is **withdrawn as a gate** — §S27.R found it trips
Terminal at 40.3% on day one from a genuine metal-deck concentration, while the LTU case that
motivated it dissolves to 19.2% at cell grain. **Report the distribution; do not gate on it.**

## §S28.4 — R4 RESOLVED: how a task's dates are computed (the gap §S27 left)

§S27 never said how `TASK.start`/`end` are produced. The arithmetic already exists and is reused,
not invented — `time_machine.js:5105-5130` `§CREW_DEMAND`:

```js
_crewWorkDays[_r] += (el.installSecs || 0) / 28800;      // crew-days, 8h shift
var _capacityCd = _crews * projectDays;                  // capacity in the SAME unit
```

**A cell's duration is that same computation at cell grain instead of project grain:**

```
cellDemandCrewDays  = Σ (installSecs of the cell's elements) / 28800
cellDurationDays    = cellDemandCrewDays / crews(resource)
```

**UNITS ARE PART OF THE SPEC, and this is why:** `§ARCH_START_TEMPO / M1` records that this exact
ratio was silently wrong for months because demand was quoted in 8-hour crew-days while
`projectDays` was counted on a 24-hour clock — **one calendar day was worth three crew-days of
capacity and every utilisation printed was ~3× overstated.** Any implementation must state the shift
length at every conversion and assert the two sides agree.

**Scheduling within a level:** cells run in ascending `seq`. Zones within one `(level, seq)` run
**SERIALLY** — see §S28.5. Levels run per the template offset.

**STOP CONDITION D:** total makespan is reported next to today's engine per building (§S26.14's
"before" column). A wildly different number is a finding to report, not a result to accept.

## §S28.5 — MEASURED: what a real planner's zones actually are (Hospital 2.0.ifc)

§S27 assumed zones were parallel work areas. **Wrong.** Extracted from the hand-authored programme
in the project's own test model (`/home/red1/Downloads/Hospital 2.0.ifc`, task names in file order):

```
Structures
  Piles                 -> Zone A -> Zone B -> Zone C
  Pile Caps · Foundation Slab · Strip Footing · Footing Columns
  Level 1
    Floor Slab
    Columns             -> Zone A -> Zone B -> Zone C
    Structural Framing  -> Zone A -> Zone B -> Zone C
  Level 2
    Columns             -> Zone A -> Zone B -> Zone C
  Level 3
    Columns             -> Zone C -> Zone B -> Zone A      <-- REVERSED
```

Four facts, all load-bearing for the spec:

1. **The hierarchy is LEVEL → TRADE → ZONE.** Exactly the cell grid, with zone as a third level.
2. **Zones are SPATIAL, not categorical** — same level, same trade, different part of the plan.
3. **Zones are SEQUENTIAL, not parallel.** Every `IfcRelSequence` between them is `.FINISH_START.`
   (§S26.13). A zone split is one crew FLOWING through a floor — the LBMS mechanism (§S26.10) —
   not concurrency.
4. **Level 3's columns run C → B → A.** Serpentine: the crew works back the way it came rather than
   teleporting to Zone A. That is a human planning crew movement, and it is the strongest single
   piece of evidence in this file that the model carries a genuine programme.
5. **The planner zoned STRUCTURE, not architecture** — Piles, Columns, Structural Framing. Nothing
   in the architecture trades is zoned.

**Consequence for §S28.6: build zone-capable, default to one zone per level.** If a level's raster
yields one component, that level is one zone and the grid is level×seq — reported as such per
§S28.3 S1c, never forced into a k-way split.

**Correction to the record:** §S26.13 and §S27.8 say Hospital carries "121 IfcTask". §S27.R found
this is a grep conflation — `IFCTASK(` = **75**, plus 46 `IFCTASKTIME` = 121. The project's own
importer agrees (75). The 43 `IfcRelSequence` figure stands. **The programme is real; the count was
wrong.** Also: §S27.8's "the other six have them empty" is wrong — `LTU_AHouse_meta.db` lacks the
task tables too, so it is 5 empty + 2 absent (Terminal, LTU).

## §S28.6 — LANE B: the product, by addition

Order of work, each step reporting its number before the next begins:

- **B1** `bandRankOf()` — new code per §S28.2, with a witness. Stop: band count and membership
  reported per building; a level is never a storey name.
- **B2** zone compiler — reuse `compile_rooms.py`/`room_walker.js`'s rasterizer, change the consumer
  from exterior-unreachable pockets to occupancy components (§S26.16). Stop: §S28.3 S1a/S1b/S1c.
  **§S27.R raised whether that rasterizer is separable from the flood-fill at all — B2 must answer
  that with function/line boundaries BEFORE writing code, and report if it is not.**
- **B3** element → cell `(level, zone, seq)`. Stop: cell count + size distribution, no gate.
- **B4** durations per §S28.4. Stop: makespan vs §S26.14 baseline.
- **B5** write `schedules`/`tasks`/`task_sequences`/`task_elements`. Stop: row counts; task count in
  the same order of magnitude as Hospital's own 75.
- **PROHIBITION (unchanged from §S27.8, and it is still the most important line):** never write
  element-level physics arrows into `task_sequences`. That makes the 2.46M-edge web permanent
  instead of ephemeral.

Lane B changes **no scheduling behaviour**. It is a new output. Nothing it does can regress a
witness, which is exactly why it is separable.

## §S28.7 — LANE A: the engine, by deletion

Independent of Lane B. The hypothesis, and it is falsifiable in one run:

> Order comes from a sort — `(bandRank, seq, base_z, guid)` — and physics returns to being a
> `max()` delay over already-placed elements, as it was before `0fe8eb2` (2026-08-07). The SCC
> pass, the condensation, the cycle-breaker and the contraction counters become unreachable.

Deletable surface, measured: `viewer/cpm_schedule.js` is 650 lines with **38** lines matching
`tarjan|scc|contract`.

**The one hazard, and it is documented in the code that was deleted** — `0fe8eb2^
schedule_gate.js:252-262`: re-sorting made 2,341 elements float again because the gate scanned a
PARTIAL grid of already-placed elements. **Guard (§S26.6 C1): the gate uses the judge's global scan
(`auditFloating`'s grids, `schedule_gate.js:1055-1059`), which was always global and correct.** A
backward relation is then REPORTED and counted, never silently skipped.

**STOP CONDITION A (this is the whole lane):** float and midair, from the UNCHANGED existing judges,
no worse than §S26.14's "before" column per building. Better is a win; worse kills the lane. **A "0"
produced by any check built on the sort's own definitions is not evidence** (§S25_REVIEW precedent).

§S27.R also flagged that the Duplex float baseline is quoted as 247 (probe) while the witness-side
measure is 237 — **name the instrument in every number this lane reports.**

## §S28.8 — what §S28 does NOT solve

Everything in §S27.10 still applies, plus:

- **Whether Lane A's sort actually reproduces float parity is UNTESTED.** It is the lane's whole
  hypothesis and it may simply fail — that is the point of running it first and cheaply.
- **Crew realism.** §S28.4 reuses `§CREW_DEMAND`'s arithmetic; whether the resulting durations are
  credible to a planner is untested and F4's Hospital comparison is still the only anchor.
- **Zone semantics remain a computable proxy** for what a planner means by a zone. Hospital's
  A/B/C are named regions on a plan; a connected component of an occupancy raster is not obviously
  the same partition, and §S28.5's evidence does not establish that it is.
- **Serpentine order (§S28.5 fact 4) is NOT modelled.** Zones run A→B→C every level; the real
  programme alternates. Named so it is not mistaken for an oversight.
- **The host/opening extraction gap** (§S26.12.2) and the **`designatedSupport` election win**
  (§S25_REVIEW.6) are both untouched and both belong to other lanes.

## §S28.R — REVIEW VERDICT (empty = NOT VETTED = do not build)

**VERDICT: NOT VETTED.** §S28 genuinely fixed R1's order question and R2 (verified below), half-fixed
R3 and R4 — and its two NEW load-bearing pieces both fail re-derivation: §S28.5's headline
observation (the Level 3 reversal, "the strongest single piece of evidence in this file") is a
file-ordering artifact contradicted by both the IfcRelSequence links and the task dates, and BOTH
lanes carry a blocking defect that makes §S28.0's independence claim false. Written 2026-08-19 by
the vetting pass. Method per the WATCHDOG mandate: every number below re-measured by this pass's own
commands — IFC via grep + a paren-aware entity parser, DBs via python3/sqlite3 read-only,
`ONLY=Duplex node viewer/tests/witness_midair_zero.js` run fresh (log saved and read), pre-#1242
code via `git show 0fe8eb2^:viewer/schedule_gate.js`. bim-ootb read-only throughout; `viewer/`
untouched.

### §S28.R.0 — VERIFIED, re-derived independently

| claim | source | re-derived result |
|---|---|---|
| seq/phase table | §S28.1 | **exact** against `sequence_rules.json` (58 classes): seq total over 1..11; Architecture = {5,6,8} + seq 7 via `glazed_curtainwall_facade` override; MEP Rough-in = {7}; MEP Final = {9}; Finishes = {10,11}. Phase is not monotone in seq ✓. One omission: `SEQUENCE_DEFAULT` = phase Architecture, **seq 6, resource null** — absent from the table and load-bearing for R5 below |
| `_bandRank` is a storey-NAME ladder | §S28.2 | **exact** — `schedule_gate.js:476` `_bandRank[collapsePhase(el.storey)]`, `:856` `rankKey[t]=...`; probe's `floor(bz/3)` dense rank confirmed at `probe_s26_rank_monotone.js` (BAND_M=3) |
| noGeometry counts | §S28.3 S1a | **exact**: Hospital 233, Clinic 43, HHS 41, Duplex 3, Terminal/JKR/LTU 0 (elements_meta minus Opening/Space, LEFT JOIN element_transforms IS NULL; zero-bbox rows = 0 everywhere) |
| `§CREW_DEMAND` citation + units history | §S28.4 | **exact** — `time_machine.js:5104-5106` `installSecs/28800`, `:5130` `_capacityCd = _crews * projectDays`, §ARCH_START_TEMPO/M1 3× overstatement comment verbatim at :5112-5116 |
| Hospital counts | §S28.5 | **exact**: `IFCTASK(`=75, `IFCTASKTIME(`=46 (75+46=121 conflation confirmed), `IFCRELSEQUENCE(`=43 all `.FINISH_START.`, `IFCWORKSCHEDULE(`=1; importer DB (`Downloads/Hospital 2.0_meta.db`) tasks=75/task_sequences=43/task_elements=2,900 |
| 5 empty + 2 absent | §S28.5 correction | **exact**: Terminal_meta + LTU_AHouse_meta lack all four tables; the other five have them at 0 rows |
| zones are SPATIAL | §S28.5 fact 2 | **confirmed with data §S28.5 never had**: joining task_elements→element_transforms, L1 Columns Zone A x∈[−12.1,22.5], B x∈[29.3,45.3], C x∈[52.2,86.7] — clean disjoint X-bands of ONE plate (which also confirms §S27.R R7: connectivity-zoning cannot produce them) |
| pre-#1242 order + 2,341-float note | §S28.7 | **exact text** at `0fe8eb2^ schedule_gate.js:245-262`; `auditFloating` builds grids from ALL elements at `schedule_gate.js:1056-1060` ✓; cpm_schedule.js = 650 lines, `tarjan\|scc\|contract` case-insensitive = **40** lines today (spec says 38 — immaterial) |
| W-MZ-8 instrument gap | §S28.7 last ¶ | **worse than stated — see R4**: witness re-run today, `FAIL W-MZ-8 Duplex locked 289 got 237` |

### §S28.R.1 — findings, ordered by how much they change the build

**R1 — BLOCKING, LANE A'S HYPOTHESIS IS NOT THE MEASURED ONE: the sort key §S28.7 states was never
measured, and the evidence cited for it was produced by a different key that §S28.1 just outlawed.**
`probe_s26_rank_monotone.js` (header + :43-46) ranks by **(bandRank, phaseRank, depth, bz, guid)**
with two components §S28.7's `(bandRank, seq, base_z, guid)` does not have: (a) **phaseRank**
(Substructure < Superstructure < Architecture < everything else) — a PHASE order, the exact thing
§S28.1 demoted to a display label, sits inside the probe that produced every §S26.5/§S26.6 monotone
number Lane A leans on; (b) **INHERITANCE** — "a hosted element takes its HOST's bandRank, a hanging
element takes its CARRIER's bandRank", the probe's own hole-closer for the two down-pointing
families — plus (c) `depth` (longest bearing path). So the 93-97%-monotone framing is un-inherited
by Lane A's key: seq≠phaseRank, no depth, and without inheritance a band-major sort puts a hanger's
carrier-above (the slab whose base_z is the next band) systematically LATER than the hanger.
Additionally the claim "as it was before 0fe8eb2" is wrong: the pre-#1242 engine (re-read via git
show) was TWO passes — struct-only `(base_z, seq)`, then non-struct `(seq, bandRank-name, base_z)`
with ALL structure placed before ANY non-structure — never one band-major sort. Every carrier was
placed before any hanger by construction; Lane A's unified sort forfeits exactly that property.
**Required amendment: state the actual key (and whether it includes inheritance — which requires
computing hang/host relations, i.e. the "no graph" framing dies), or re-run the probe with the
literal §S28.7 key and quote THOSE violation numbers.** STOP-AND-REPORT: if the seq-keyed re-run's
backward-relation counts differ materially from §S26.5's table, Lane A's cost is unknown — report,
do not proceed on the phaseRank-keyed numbers.

**R2 — BLOCKING, LANE B IS NOT INERT: any dated rows B5 writes flip every shipped building to the
captured-schedule path in the live viewer.** `injectGantt`'s `_cap` probe (`time_machine.js:
4790-4818`) does `SELECT ... FROM tasks WHERE schedule_start IS NOT NULL ... AND (is_summary IS NULL
OR is_summary=0)` — no schedule_id filter, no status filter, no display_authored gate. One dated
non-summary row + task_elements links ⇒ `_cap` non-null ⇒ timeline rebased to `_cap.base`, covered
elements overlaid with task dates/names (`:5377+`), `_capWindowRescale`/`_ogSupportSweep` engaged.
B5 maps EVERY element to a cell task — near-100% coverage — so "Lane B changes no scheduling
behaviour. It is a new output" (§S28.6) is FALSE as written; the write target is live input to the
display pipeline. (`witness_midair_zero.js` itself does NOT read the tasks tables — verified by
grep — so "cannot regress a witness" is literally true while the live viewer changes completely:
proxy-green, ground-truth-changed, the WATCHDOG's own named failure shape.) This also collides with
the file's DO-NOT-REMOVE header: Lane B's §S28.4 forward pass is a SECOND computation of schedule
timing, persisted where the viewer reads it. **Required amendment: an explicit adoption policy —
either B5's rows are meant to drive the viewer (then say so, spec the interaction with Lane A's
engine output and the §S26.14 baselines, and reuse ScheduleAuthor's writer conventions
`schedule_author.js:448-466` including schedule_id scoping and delete-first), or they must be
invisible to `_cap` (then name the mechanism, which is an engine-side change and breaks Lane B's
"no engine edits" premise).** Note also: shipped-DB writes must ship per the project's
patch+self-heal-loader rule, never as binaries — B5 says nothing about distribution.

**R3 — BLOCKING FOR THE RECORD, WRONG: §S28.5 fact 4 ("Level 3's columns run C→B→A ... REVERSED
... serpentine") is a file-ordering artifact.** Re-derived from the entities, not the file order:
Level 3 Columns' IfcRelSequence links run **Floor Slab→Zone A→Zone B→Zone C** — identical to every
other level — and the IfcTaskTime dates agree: Zone A #3462440 Aug 14-18, Zone B #3462434 Aug
19-23, Zone C #3462428 Aug 24-28 (C carries P75D total float, non-critical). The C,B,A appearance
is entity-ID/file order only (#3462271 C < #3462275 B < #3462277 A). §S28.5's own method line
("task names in file order") is the GIGO mechanism, same class as the 121-task grep conflation it
corrects. Consequences: fact 4 is deleted, not amended; §S28.8's "the real programme alternates" is
also false; and the genuineness of the programme rests on the (real, verified) links/dates/float,
not on serpentine. **The serpentine instinct IS in the data — one level down and §S28.5 missed
it:** Zone A of Piles is the EAST band (x∈[51.8,76.1]) while Zone A of Columns is the WEST band
(x∈[−12.1,22.5]) — the crew flows E→W piling, W→E on columns, and the planner RELABELS so A→B→C
always equals work order. Zone labels are per-(trade) orderings, not fixed regions — which
§S28.6's fixed-zone cell identity cannot represent and must at least name.

**R4 — BLOCKING, THE STOP CONDITIONS CITE NUMBERS THAT DISAGREE OR DON'T EXIST.** (a) STOP A pins
"§S26.14's before column" measured by "the UNCHANGED existing judges" — but three Duplex floats now
coexist: W-MZ-8's lock **289**, §S26.14's before **247** (probe-side), today's judge **237**
(re-run this pass: `FAIL W-MZ-8 Duplex locked 289 got 237`, witness RED on main `6a395ca`). A build
agent literally cannot satisfy the witness and the baseline at once. (b) STOP D and B4 compare
"makespan ... §S26.14's before column" — §S26.14's table has NO makespan column (SCCs/float/midair
only); the nearest real makespan baseline is §S25_REVIEW.2's CPM column (Terminal 85.1d, Hospital
263.5d ... at ITS shift settings; the probe runs SHIFT_HOURS=24, the witness differs). **Required
amendment: ONE baseline table — building × {float, midair, makespan} × named instrument × shift ×
DB set — measured fresh, plus the W-MZ-8 relock/repair decision (the §RESULTS-addendum Duplex
regression is still open), BEFORE either lane's stop condition is evaluable.**

**R5 — CONDITION, §S28.4 RESOLVES R4's FORMULA BUT NOT R4's QUESTIONS.** Still undefined, each a
place a Sonnet builder invents: (a) **multi-resource cells** — seq 4 = CONCRETE_GANG+STEEL_ERECTOR,
seq 7 = 4 resources, seq 9 = 3, seq 6 = CARPENTER+CONCRETE_GANG+null: `crews(resource)` singular
has no value for most real cells; (b) **resource null** (SEQUENCE_DEFAULT, IfcSpace,
IfcBuildingElementProxy) — §CREW_DEMAND itself SKIPS the `_DEFAULT` bucket (`if (!_cdr) continue`);
(c) **what lag `"levels":1` materialises as** — asked by §S27.R R4, still unanswered; (d)
**calendar** (toWall/toProductive, shift hours) unstated — M1's own trap; (e) the formula grants
each cell the FULL crew pool while the live engine's §S6_CREW_PASS (`cpm_schedule.js:398-420`)
serializes elements onto ONE project-wide slot pool per resource — same-resource cells overlapped
by template offsets (PLUMBER at seq 7 level N+1 vs seq 9 level N, CONCRETE_GANG at seqs 1/4/6)
overcommit capacity with no check, and Lane B runs no crewViol judge; (f) the planner's own
programme PIPELINES trades within a level — Framing Zone A starts after Columns Zone **B** (link
verified), while Columns Zone C is still running — which strict serial ascending-seq cannot
express, so STOP D's makespan will run structurally long against the one real anchor.

**R6 — CONDITION, §S28.3 REPLACED A TAUTOLOGY WITH NO GATE AT ALL, and S1b's number is wrong.**
S1a/S1b/S1c are each "report the number" — none has a pass/fail bound, so none can FAIL in the stop
condition sense; with S2's CELL_MAX_FRAC withdrawn, NOTHING gates a pathological grid (a banding
bug putting 90% of a building in one cell passes silently, reported at best). Acceptable only if
declared: Lane B v1 has no hard gates, human reviews the three reports. And S1b's baseline
"§S26.5 measured 16.3-16.7%" fails re-derivation twice: §S26.5 contains no bandSpan measurement
(dangling citation), and the fleet range is actually **8.8-25.0%** (Terminal 8.8, LTU 12.5,
Hospital 16.3, Clinic 16.7, Duplex 16.7, JKR 22.1, HHS 25.0) — "16.3-16.7%" is a three-building
coincidence quoted as the fleet band.

**R7 — CONDITION, THE DEFAULT TEMPLATE STILL DOES NOT EXIST AT SEQ GRAIN.** §S28.1 says "a
template names its trains by seq range" but never writes the default template's ranges, and the
only concrete template in the spec (§S27.5's JSON) still names PHASE trains. Contiguous seq RANGES
cannot express Architecture {5,6,8} straddling MEP Rough-in {7} — the trains must be re-cut at seq
boundaries (e.g. [1],[2-4],[5-6],[7],[8],[9],[10-11]) with offsets redefined between THOSE, and
the phase display labels straddling train boundaries acknowledged. Until the default template JSON
is written into the spec, §S27.R R1's "a builder would invent" verdict still stands for §S28.4's
"levels run per the template offset" and all of B4.

**R8 — CONDITION, §S28.5's remaining facts need three corrections.** (a) Fact 1: the hierarchy is
**DISCIPLINE → LEVEL → WORKTYPE → ZONE** — the roots are `Structures`, `Architecture`, `Site
Works`; levels sit UNDER the Structures train (and substructure worktypes sit directly under it
with no level node). That top discipline layer actually strengthens the trains model — say it.
(b) Fact 5 ("the planner zoned STRUCTURE, not architecture") over-reads the data: the Architecture
root's 7 child tasks are **unnamed ($), undated, unsequenced stubs** — the programme does not
cover architecture at all, so no zoning CHOICE about architecture can be inferred from it. (c) The
sketch omits `Site Works > Site Excavation` (dated, and the true programme start:
Site Excavation → Piles Zone A), and the partial-zone levels (L6 Framing has ONLY Zone B, L6b only
Zone C, L4 no Columns) — the planner's grid has holes, which B3's cell model should expect rather
than "fix".

**R9 — NOTE, LANE INDEPENDENCE (§S28.0) IS FALSE IN BOTH DIRECTIONS, in ways R1/R2 imply but the
spec must state.** A→B: Lane A's sort key names `bandRank`, §S28.2 assigns building `bandRankOf()`
to Lane B (B1) and forbids both lanes the existing name-keyed `_bandRank` — so Lane A either waits
on B1, duplicates it (the DO-NOT-REMOVE header's named defect), or silently uses the C2 junk
ladder. B→A: R2's `_cap` adoption — if B5 lands first, every live building displays Lane B's
captured overlay and Lane A's engine changes become invisible in the product until the adoption
policy exists. The `designatedSupport` twins are NOT a coupling here (neither lane edits them;
witness slices `_designatedSupport` from time_machine source text at witness:127, verified), and
`witness_midair_zero.js` is Lane-A-only (does not read tasks tables, verified). **Amend §S28.0 to
"independent once B1 is extracted as a shared, lane-neutral prerequisite and R2's adoption policy
is decided" — as written, "neither blocks the other" is untrue.**

### §S28.R.2 — the six questions, answered directly

1. **R1-R4 fixed?** R1: order fix REAL (seq table verified exact) but template half missing (R7)
   and the evidence base is phase-ranked (R1 above). R2: FIXED (build-new is right; `_bandRank`
   re-verified as name-keyed). R3: tautology removed, replaced by gate-free reports with one wrong
   number (R6). R4: formula + units citation REAL and exact; the five semantic questions §S27.R R4
   actually asked remain open (R5).
2. **§S28.5 re-derived:** counts exact; zones spatial (proven with coordinates, which §S28.5 never
   did); zones sequential FS ✓; hierarchy needs the discipline root (R8a); **reversal FALSE —
   file-order artifact, links and dates both A→B→C** (R3); "zoned structure not architecture" —
   architecture is an empty stub, programme covers structure+site only (R8b).
3. **Stop conditions:** S1a-c can produce surprising numbers but cannot FAIL — no bounds (R6);
   Hospital 233 verified exact (plus 43/41/3/0/0/0); withdrawing S2 leaves NO gate on cell
   concentration anywhere in Lane B.
4. **§S28.4:** citation and units history verbatim-correct; the formula is §CREW_DEMAND's
   arithmetic at cell grain, but §CREW_DEMAND is a REPORTING block — the engine's actual allocator
   is a global serial slot pool (§S6_CREW_PASS), which the formula ignores along with
   multi-resource/null-resource cells and the calendar (R5).
5. **Lane A guard:** the C1 guard fixes support VISIBILITY, not the CLOCK — a support that sorts
   later has no finish time to `max()` against, so "reported and counted" is not float parity; the
   partial-grid problem survives as a partial-clock problem, made systematic for hang carriers by
   the band-major key, and the "as before 0fe8eb2" precedent claim is factually wrong (R1).
6. **Independence:** false both directions (R9); Lane B's "cannot regress a witness" is true of
   the witness and false of the live viewer (R2).

### §S28.R.3 — what this review did NOT check

§S26.14's after-column numbers (still not re-run); the probe's §S26.5 violation table beyond the
two buildings §S27.R already reproduced; whether `rates.js`'s hardcoded tables and the JSON mirror
are in sync today (R10's citation point stands unfixed — §S28.1 again cites the mirror);
`compile_rooms.py` separability beyond §S27.R.3's function-boundary audit (B2 rightly carries that
as its own gate); LTU's 32×-density perf ceiling; and every construction-practice claim, which
remains planner-unverified except where Hospital's own programme now speaks (R3/R5f/R8).

### §S28.R.4 — what must change before a build agent is dispatched

Same treatment §S27 got: amendments first, re-vet cheap after. (1) R1 — state Lane A's real key
and re-measure the violation table with it, or adopt the probe's key and say what that does to
"seq is the single normative order" and to "no graph"; fix the 0fe8eb2 precedent sentence.
(2) R2 — write the adoption policy for B5 (drive the viewer, or be invisible to `_cap` — named
mechanism either way) and the patch+loader distribution note. (3) R4 — one instrument-named
baseline table + the W-MZ-8 Duplex relock decision. (4) R3/R8 — correct §S28.5 (delete fact 4,
fix facts 1/5, add Site Works + partial zones + label-direction flip) and §S28.8's serpentine
line. (5) R7 — write the default template JSON at seq grain. (6) R5 — one paragraph each:
multi-resource/null-resource crews, offset lag semantics, calendar, and the named decision that
v1 ignores cross-cell crew contention (with R6's "Lane B has no hard gates" declaration made
explicit). **If only one thing is fixed first, fix R1: Lane A is the cheap falsifiable experiment
this spec's whole shape argues for, and as written it would be run with a key nobody measured,
scored by an instrument that is currently red, against a baseline quoted from a different
instrument.**

---
# §RESULTS (2026-08-18, session close — pending a full spec overhaul, not a continuation point)

Five real bugs found and fixed this session, each hand-verified before being trusted, each shipped
(bim-ootb PRs #1431-#1435): the Gantt bar aggregation's untrimmed small-group cliff; a duplicate copy
of the same cliff sitting in the separate axis/ruler calculation; the phase-completion gate's
straggler exemption (was silently letting a phase count as "done" while most of it wasn't, measured
54-100% of a phase on real buildings); a grounded element (footing, base slab) getting a backwards
"I depend on what's built on top of me" relationship; and the floating-violation checker itself,
which could only tell "something nearby" from "something I actually depend on" once the grounded-
element bug above stopped accidentally masking that it couldn't. `floating=0/7` holds, confirmed two
independent ways, live on `origin/main`. 7/7 synthetic cases pass, hand-computed before running the
engine, re-run directly against the merged code, not taken on a report's word.

**The honest gap, named plainly, not smoothed over — this is why the session stopped here, not a
success note.** None of the above answers, in the terms a person on site would ask it, whether
substructure — or floor slabs — are ACTUALLY complete before a single beam of the first storey goes
up. The engine's phase-completion gate (fixed this session) is built to enforce exactly this,
structurally — but "the gate exists and requires the whole group" is not the same claim as "measured:
substructure fully finishes before the first beam starts, on this building, by this many days." No
test in this file asks that specific question directly, at that specific granularity (phase A vs. the
very next physical element of phase B), and it has not been measured against real fleet data at that
granularity either. The synthetic suite's case 1 shows one hand-built column starting exactly when
its one hand-built footing finishes — a toy proof of the shape, not a general one, and not something
that stands in for a real answer.

**What a spec overhaul needs to make first-class, not an afterthought:** an acceptance test stated in
construction terms — "does phase A fully finish, on this floor, before the first element of phase B
starts" — checkable directly, by name, not inferred from a graph-construction argument about what the
gate SHOULD enforce. Everything shipped this session is real and independently verified for what it
claims; what it does not yet claim is the one thing actually being asked for.

---

## §RESULTS addendum (2026-08-18, later same day — the session above has closed and can't correct its
## own claim, so this does)

**"`floating=0/7` holds, confirmed two independent ways" above needs correction, not retraction.** A
follow-up fleet-gate run on the SAME merged code found `witness_midair_zero`'s separate TRADE
invariant (does a dependent START before its support FINISHES — a different check from the
midair/appear-order one this session fixed) failing on 4/7 buildings: Terminal 12→10011, Hospital
0→8103, Duplex 0→237, HHS_Office_Federated 9→1491. Terminal and Hospital are confirmed **measurement
artifacts** — the witness read stale `Terminal_extracted.db`/`Hospital_extracted.db` (untouched since
June/Aug 3) instead of the correct, same-day-patched `_meta.db` pair (PRs #1427/#1428) — not a real
regression for those two. **Duplex and HHS have no meta/geo split**, so that explanation does not
apply — their regression is still real/unexplained, not cleared either way.

Separately, unresolved: whether yesterday's `Terminal_meta.db`/`Hospital_meta.db` elevation+parentage
patch (#1427/#1428) is itself clean, or a fresh data-integrity problem — self-contradiction check
in progress, same method §S10 used to catch the earlier real corruption.

A live forensic measurement is in progress on Terminal, using `Terminal_meta.db` specifically (not
the stale extracted copy): does storey 1's Substructure phase actually finish, in real days, before
the first Superstructure element starts — the exact acceptance test named as missing above, on a real
building for the first time. Result pending.

**Do not read "floating=0/7" or "5 bugs fixed" as this lane's closing state.** The TRADE-invariant
question (Duplex/HHS) and the meta.db integrity question are both open as of this addendum — whoever
picks this up next should resolve those before treating today's merges as the end of the story.

---

---

