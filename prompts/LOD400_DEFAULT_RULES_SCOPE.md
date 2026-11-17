# ⚠ DO NOT REMOVE
SCOPE: which **default rule rows** the rule-based detail upgrade (layer split, steel connections, reinforcement) needs, building by building, and where a stated value already makes a default unnecessary. This is a scope, not a build. Read the log after every run; the exit code is not evidence. Spec before code: each build named in §5 gets its own spec section first.

## 1. The rule (applies to every row below)
- **A stated value always wins.** A default fills only a gap the drawings, schedules or model leave open.
- Every default is one row `{value, unit, source}`. `source` is either a clause actually read (`default: <code> <clause>`), or `default: ours` when no clause was read. Each run prints how many rows are still defaults. A stated value arriving later replaces the row with no code change (same as `conn_rules.json`).
- **Never default what changes the author's design.** That covers material grades, capacities, and geometry of the author's elements. Those are questions for the engineer, not rows.
- A default set belongs to a **code + jurisdiction pack** (the building states its codes, e.g. ACI 318-19 / AISC 360-16), never to one building.

## 2. Buildings in scope and what each states (measured 2026-11-18)
| Building | Source | States | Does not state |
|---|---|---|---|
| **Palm Jebel Ali Mosque (PJAM)**, Revit IFC2X3 ARC + STR | S-001 codes: ACI 318-19, AISC 360-16, ASCE 7-16, DBC 2021. S-401 beam schedule (22 marks). S-401 slab/wall/raft meshes | layer sets on 612 elements; beam bars and stirrups per mark (dia 10 or 12, spacing 100-200); side-face bars on beams ≥ 750 mm deep; meshes (250 mm slab T12@200 top and bottom, 200 mm slab T12@200, 200 mm wall T10@150, raft T12@150); 2 added stirrups each side of a beam opening; 460 mm minimum tension development; single bar layer unless spacing forces a second | any steel connection detail, bolt, weld or steel grade (S-003, S-006..S-008, S-400 not in the package); column, pile and footing reinforcement; cover; laps; the model's reinforcement property sets are empty (type mark only) |
| **Shed** (farm shed, DXF-converted; 511 elements, Modeller export 2026-11-15) | sheet 5 DETAILS (column and footing schedules, long sections); sheet 8 truss section | footing F-1 4'-0" x 5'-0" x 12", bars 12 mm @ 6" c/c both ways; column C-1 12"x12" (14"x14" below grade), 6-16Ø, ties 10Ø @ 5" in two 20" end zones (A), @ 10" between (B); grade beam GB-1 12"x12" and Beam-1 12"x10", stirrups 10 mm @ 6" c/c; the beam long sections (Beam-2, gable wall, EC pad area) carry 2-16Ø st, 3-16Ø st and 2-16Ø st + 1-16Ø ext. (which callout belongs to which beam needs the long-section geometry read); EC pad 10 mm @ 7" c/c; f'c 24 MPa, fy 500 MPa; mixes 1:2:4 (floor), 1:1.5:3 (footing/column/GB); truss members (angles, 1/4" gussets) "Welded" | design code; cover; laps; hooks; which bar is top or bottom (needs the long-section geometry read, not a default); weld size and length; truss-to-beam seat; purlin fixing; wall finishes (walls are single-material brick) |
| **Terminal** (airport, federation DB) | the Bonsai federation run of 2025-11-15 | (its reinforcement was all defaults) | — |

## 3. Rule families: stated vs default needed
### 3.1 Layer split (model-driven, no defaults)
- **PJAM:** done from the author's own layer sets: 88 elements give 220 layer solids, each within 0.00 mm of its stated thickness. **No default is needed, and none should be added.** 9 refusals need the author's model fixed, not a default: 6 roofs have no layer-set direction, and 3 ceilings' bodies don't match their layer set.
- **Shed:** nothing to split. Inventing a plaster or render build-up would be a default that changes the design, so none.

### 3.2 Steel connections (AISC 360-16 rows exist; gaps by joint class)
- **PJAM, beam into girder web (fin plate):** built, 50 of 234 ends. All 25 rows are defaults:
  - 6 are clause-backed: holes (Table J3.3M), spacing min and preferred (§J3.3), edge minimum (Table J3.4M), fillet minimum (Table J2.4) and maximum (§J2.2b).
  - 19 are `ours`: bolt M20 and grade, plate 10 mm, bolt count limits, edge used 35 mm, and survey tolerances.
  - 6 hardware dimensions (bolt head, nut, washer) are approximate; a fastener product standard was not read.
  - The engineer's S-003/S-006..S-008/S-400 would replace most of them.
- **Not built, each needs its own small row set:**

| Joint class (count) | Rule needed | Defaults it would need |
|---|---|---|
| bracing into a beam (STEEL_SKEW, 57) | gusset plate + bolted angle | gusset thickness, bolt count by angle leg, Whitmore/edge per AISC §J4 (not read) |
| steel into concrete (CONCRETE, 39) | embed plate + headed anchors | plate size, anchor dia and embedment per ACI 318-19 Ch. 17 (not read) |
| in-line splice (STEEL_INLINE, 22) | bolted flange and web splice plates | plate sizes, bolt rows |
| box or double-box members (21) | end plate or welded cap | plate thickness, weld |

- **Shed truss (welded, stated):** one family, two default rows:
  - fillet size = Table J2.4 minimum for the thinner part. 1/4" (6.35 mm) parts give 5 mm, from the table already in `conn_rules.json`.
  - weld length = the full contact length along both edges of each angle (`ours`).
  - The truss seat on the RC beam is not drawn. A bearing plate + cast-in anchors rule would be pure default: ask the client's engineer first.

### 3.3 Reinforcement (biggest gain where schedules are stated)
- **Existing engine:** Bonsai federation `structural/rebar_generator.py` + `rebar_to_discipline.py`.
  - **Proven on the Terminal:** the federation DB holds 2,660 `IfcReinforcingBar` groups (discipline REB) on 1,114 of 1,429 STR elements: 614 slabs × 2 groups, 432 beams × 3, 68 columns × 1. The 312 members and 3 walls were skipped.
  - That run's results are not in today's Terminal Viewer DBs (0 REB rows).
  - It computes from ratios with MS 1347:2020 defaults (Malaysian, right for the Terminal), writes one box per bar group, and has **no input for a stated schedule**.
- **Needed so stated values win:** a schedule input (mark → bars, ties, spacing, zones) that overrides the ratio defaults per element. A code pack selects the remaining defaults by the building's stated code.
- **Shed:** footing, column and beam bars are stated. Defaults needed only for cover, lap length, hooks, and the design code (not stated: client question). Which beam carries which callout, and top vs bottom, comes from reading the long-section geometry (a read, not a default).
- **PJAM:** beams join to the S-401 schedule by the model's type mark. Slabs, walls and raft come from the stated meshes. Defaults needed for cover, laps and hooks under ACI 318-19 (clauses to be read, not from memory), and for columns, piles and footings (no schedule in the package). Stirrups are a per-mark design value and must not be derived from the section (tested).

## 4. What is never a default here
Steel grade (PJAM: not stated), concrete cover on PJAM until ACI 318-19 is read, any load or capacity, sprinkler and MEP data, roof and ceiling layer fixes, the Shed's design code.

## 5. Proposed order (owner to pick; each = a spec section then a witness)
1. **Shed reinforcement from its stated schedules.** Most of it is stated already and it is small. The federation generator gets a schedule input plus an adapter to the extractor schema (`element_world_bbox`; no `elements_rtree`/`element_properties` needed). The witness counts every stated mark → bar group, and the defaults (cover, lap) are printed.
2. **PJAM beam reinforcement from S-401 by type mark.** Then slabs, walls and raft from the stated meshes. The ACI 318-19 cover and lap clauses are read first.
3. **Shed truss welds** (2 rows).
4. **PJAM bracing gussets** (57 ends): AISC §J4 read first.
5. Carry the Terminal's REB groups into its Viewer DB (a patch + self-heal loader, never a binary).

## 6. BUILD 1 SPEC (2026-11-18, owner: "Proceed"): Shed reinforcement from its stated schedules, + build 3 (truss welds)
**Issue it proves or disproves:** can the stated schedules already attached to each element by the Modeller's table reader become real bar geometry, with every value traced to the drawing and only cover/hook as defaults, on a copy of the Shed DB, identically on every run?
**Measured inputs (2026-11-18, Modeller export of 2026-11-15, 511 bodies):** `element_dxf2bim` already holds, per element, with source handles in `5_DETAILS_marked.dxf`:
- **96 IfcColumn** (32 columns × 3 pieces: below grade 14"×14" z −1.143..0, grade to base 12"×12" 0..0.61, above grade 12"×12" to the beam soffit): `Sched_Column_Type C-1`, `Main_Bar 6-16dia`, `Stirrup_A 10dia @ 5" C/C (A)`, `Stirrup_B 10dia @ 10" C/C (B)`.
- **32 IfcFooting** (1.219 × 1.524 × 0.305 m): `F-1`, `L_Bar` and `S_Bar 12 mm dia @ 6" C/C`, `T 12"`.
- **164 concrete elements:** `Note_fc_MPa 24`, `Note_fy_MPa 500`.
- **35 IfcBeam carry NO schedule row.** Their callouts are on long sections, not in a table. They are not built here; they are reported with the callout texts (a reader task, §5 item 1b).
- **Truss:** 168 IfcMember (angles 1.5"×1.5"×1/4", chords 2 - 2"×2"×1/4") and 117 IfcPlate 1/4" gussets; sheet 8 text "Welded".

**Rules (stated first; each default is a row in `scripts/lod/rebar_defaults.json` with its source):**
- **Footing:** a bottom mesh at the stated spacing both ways. L-bars run along the long side, S-bars along the short side. Bars are straight, with cover at both ends. Counts = floor((side − 2·cover)/spacing) + 1, logged.
- **Column:** the 6 main bars are continuous from the footing mesh top to the column top. They run through all three pieces, which are one drawn column found by plan position. The arrangement is 3 bars on each of two opposite faces (corners + mid), bar centres at cover + tie + d/2.
- **Column ties** are perimeter ties. The (A) spacing applies for the end-zone length from each end of the column's clear height (footing top to beam soffit), the (B) spacing between.
  - The end-zone length is the stated `20"` next to (A) on the typical long section.
  - The drawing also writes `L` / `4L/6`. Rule row `zone_A = max(20", L/6)`, `default: ours` (reading of the two labels). The run logs both values and which governs.
- **Defaults** (`default: ours`, industry practice, no clause read):
  - footing cover 75 mm (cast against earth), column cover 40 mm;
  - tie hooks not modelled (logged);
  - no cross-ties (logged);
  - no laps (every bar is shorter than a 12 m stock length: checked and logged per bar).
- **Truss welds (build 3):** for every member end whose mesh overlaps a gusset plate's box, one fillet weld element along the two outer edges of the overlap.
  - Size = AISC 360-16 Table J2.4 minimum for the thinner part, as already in `conn_rules`: 6.35 mm part → 5 mm. `default: AISC Table J2.4`.
  - Length = the overlap length, `default: ours`.
  - Members with no gusset contact are counted, not welded.
- **Output:** a copy `SHED_rebar.db` (never the export). One `IfcReinforcingBar` element per host × bar set (footing L, footing S, column main, ties A, ties B), with real bar geometry (8-sided prisms at bar diameter; ties as closed loops). One `IfcFastener` per weld. `element_parts` host → set. An `upgrade_changes` table + a txt written from it (same format as the PJAM change list). Each set's name carries its stated value and source handle.

**Witnesses (`§SHEDRB_*`; INCONCLUSIVE when nothing was judged):**
- IDENT: every source row unchanged; out = in + added.
- STATED: every element with a `Sched_*` row got its sets, and each set's bar diameter and spacing equal the parsed stated value.
- INSIDE: every bar lies inside its host's mesh box with ≥ cover − 1 mm to the faces.
- COUNTS: bars per set = the count formula.
- WELDS: welds = member–gusset contacts; size = the table row.
- COST: added vertices and estimated heap (PERF BUDGET).
- DETERMINISM: two builds give the same SHA-256.
- Break switch `SHEDRB_BREAK=1` drops the cover offset: INSIDE must FAIL.
