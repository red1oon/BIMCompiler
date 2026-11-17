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

### §6 RESULT 2026-11-18 (BUILD 1 run on the Shed export; `scripts/lod/rebar_from_schedule.py` + `scripts/lod/rebar_defaults.json`)
**Verdict: every `§SHEDRB_*` witness PASSES on run 1; run 2 is byte-identical (DETERMINISM PASS); the break switch makes INSIDE FAIL as required.** Three places where the spec as written could not be followed to the letter are listed under "Deviations" (the first one matters). Private outputs (DB, change list, logs) stay under the local project folder, never in git.

**Run 1 log, verbatim (`§` lines):**
```
§SHEDRB_MODE break=0 cover_footing_rule_mm=75 cover_column_rule_mm=40 placement_cover_footing_mm=75 placement_cover_column_mm=40
§SHEDRB_INPUT footings_with_schedule=32 column_pieces_with_schedule=96 boxes_ok=128 refused=0
§SHEDRB_FOOTING sets_added=64 footings=32 bars=512
§SHEDRB_COLGROUP drawn_columns=32 pieces_per_column={3: 32} -> PASS
§SHEDRB_ZONE columns=32 governs={'L/6': 32} (stated 20in=0.5080 m; L/6 per column logged in the change list) sample_L=4.2418 L/6=0.7070
§SHEDRB_ASSUMED tie_hooks=no cross_ties=no laps=no stock_checked_bars=96
§SHEDRB_BEAMS beams=35 without_schedule_row=35 not_built=35 details_sheet_rebar_texts=21 -> PASS
§SHEDRB_WELD_SCAN members=168 plates=117 end_contacts=225 mid_span_contacts_not_welded=139 touch_only=0 members_without_end_contact=49
§SHEDRB_WELD_BUILT welds=221 skipped=4
§SHEDRB_IDENT source_tables=19 tables_identical=True src_elements=513 out_elements=990 added=477 -> PASS
§SHEDRB_STATED elements_with_schedule=128 sets_checked=256 diameter_spacing_mismatches=0 missing_expected_sets=0 -> PASS
§SHEDRB_STATED_TIE_SPACING columns=32 violations=0 max_B_gap_mm=240.150 (stated B spacing 254.000) -> PASS
§SHEDRB_SIZE_CHECK stated sizes vs mesh boxes: elements=96 max_dev_mm=0.0519 -> PASS
§SHEDRB_INSIDE sets=256 vertices=208896 violating_vertices=0 min_margin_mm=40.000 (worst set GEN-RB-0R0XHocG_1t$2Oh7AAAAHT-MAIN) required>=cover-1mm (footing 75, column 40) -> PASS
§SHEDRB_COUNTS footing_sets=64 count_mismatches=0 formula floor((side-2*cover-d)/spacing)+1 (the spec formula without the -d term would give {'(7, 8)': 32, '(9, 10)': 32} as (placed, spec-literal)) -> PASS
§SHEDRB_WELDS welds=221 end_contacts_by_clip=225 end_contacts_by_independent_end_cap_test=225 only_in_welds=0 only_in_recount=0 size_mismatches=0 table_row_for_6.35mm=5mm skipped=4 -> PASS
§SHEDRB_COST added_elements=477 added_vertices=219504 source_vertices=33168 added_pct=661.79 est_heap_added_MB=37.32 (0.17 GB per M vertices) of_which_rebar=256 welds=221 -> PASS
§SHEDRB_LOG txt_data_lines=704 table_rows=704 -> PASS
§SHEDRB_WRITTEN db_sha256=53a3de9a4df69175 txt_sha256=2cb48b302c74eaba db_sha256_full=53a3de9a4df6917540e1f4076495599fa64a8e3ca40c2a05e435d0aeec9efef9 txt_sha256_full=2cb48b302c74eabab12536958680dcaf4d3dbddf67b84f637e7c223004341d5d
§SHEDRB_DETERMINISM single build; pass --expect-db-sha / --expect-txt-sha from an earlier run -> INCONCLUSIVE
§SHEDRB_SUMMARY failed_witnesses=none added=477 not_built=223 refused=4
```
**Run 2 (same inputs, `--expect-db-sha`/`--expect-txt-sha` from run 1):**
```
§SHEDRB_WRITTEN db_sha256=53a3de9a4df69175 txt_sha256=2cb48b302c74eaba
§SHEDRB_DETERMINISM this_db=53a3de9a4df69175 expected_db=53a3de9a4df69175 this_txt=2cb48b302c74eaba expected_txt=2cb48b302c74eaba -> PASS
```
**Break run (`SHEDRB_BREAK=1`, placement cover dropped, witnesses still judge against the rule rows):**
```
§SHEDRB_INSIDE sets=256 vertices=215040 violating_vertices=215040 min_margin_mm=-0.000 (worst set GEN-RB-007izrUd4u9uIpn7AAAABL-L) required>=cover-1mm (footing 75, column 40) -> FAIL
§SHEDRB_COUNTS footing_sets=64 count_mismatches=64 formula floor((side-2*cover-d)/spacing)+1 (the spec formula without the -d term would give {'(8, 8)': 20, '(8, 9)': 12, '(10, 10)': 14, '(10, 11)': 18} as (placed, spec-literal)) first=('007izrUd4u9uIpn7AAAABL', 'L', 8, 7) -> FAIL
§SHEDRB_BREAK_CHECK switch=on expected INSIDE=FAIL got INSIDE=FAIL -> PASS
§SHEDRB_SUMMARY failed_witnesses=INSIDE,COUNTS added=477 not_built=223 refused=4
```

**What was built (numbers from the log and the change list, 704 rows):**
- 128 schedule-bearing elements (32 IfcFooting + 96 IfcColumn pieces) -> 256 IfcReinforcingBar sets: 64 footing sets (224 L bars + 288 S bars), 32 column main sets (192 bars), 64 tie-(A) sets (384 loops) and 96 tie-(B) sets (352 loops). All 96 column pieces group into 32 drawn columns of exactly 3 pieces by plan position (`§SHEDRB_COLGROUP`). Stated sizes vs mesh boxes: max deviation 0.052 mm (`§SHEDRB_SIZE_CHECK`, extra witness).
- Tie (A) zone: `max(stated 20 in = 508 mm, L/6)`; **L/6 governed on all 32 columns** (L = 4.2418 m, L/6 = 707 mm). Zone rule row stays `default: ours`; the 20" is `stated: 5_DETAILS_marked.dxf#25B/#263`.
- Welds: AISC 360-16 Table J2.4 row for 6.35 mm = 5 mm (all 221 measured, 0 size mismatches). 225 member-end/gusset contacts found by clipping the member mesh to the plate's oriented box; an independent recount (SAT of each member's end-cap triangles against the plate box) finds the same 225 pairs.
- Not built (all in `upgrade_changes`, 223 NOT_BUILT + 4 REFUSED): 35 IfcBeam without a schedule row (change-list rows carry the 21 rebar-like texts of the details sheet by drawing handle; the DB cannot attribute them to a beam, scope item 1b); 49 truss members with no end touching a plate; 139 mid-span contacts; 4 refused welds.
- Cost: +219,504 vertices on 33,168 source vertices (+662 %), est. +37.3 MB heap at 0.17 GB per M vertices. Bars are 96 vertices each (8-sided prism, capped); tie loops 192. A viewer that wants this at scale needs a shared-geometry or LOD route for bars (PERF BUDGET).

**Deviations from §6 as written, and what the spec did not anticipate:**
1. **Footing bar count formula.** `floor((side - 2*cover)/spacing) + 1` treats cover as distance to the bar *centre*; INSIDE demands `>= cover - 1 mm` to the bar *surface*. Both cannot hold: the literal formula gives 8 L bars / 10 S bars, but the 8th bar's surface would be 4.8 mm inside the cover line. Implemented `floor((side - 2*cover - d)/spacing) + 1` = 7 L / 9 S (bars centred in the cover-bounded span), logged as `(placed, spec-literal)` in `§SHEDRB_COUNTS` and per set in the change list. **Needs the owner's call**: keep clear-cover-to-surface (current), or define cover to the bar centre and relax INSIDE.
2. **Main bars are one element per drawn column** (3 pieces), with `element_parts` rows from each of the 3 pieces to it; the spec's "per host x set" cannot split a continuous bar at piece joints. They sit at cover + tie + d/2 from the faces of the *smallest* piece (12"), so the 14" piece has more cover. Bottom end = top of the footing's two-layer mesh (`footing mesh top` read as the mesh, not the concrete top, so the bars land on the mesh); top end = column top minus cover (needed to satisfy INSIDE; the spec only says "to the column top").
3. **Two layout rows added to the defaults file, not in the spec's default list:** `footing_bottom_layer` = L bars lowest, and `column_bar_face_normal_axis` = the 3 + 3 main bars sit on the two faces normal to x. Neither is drawn. Also rows `bar_sides`, `stock_length_mm` (12 m), `weld_contact_end_tol_mm` (1 mm), `inside_tol_mm` (1 mm). Of 15 rule rows, 14 are defaults, 1 is stated.
4. **Tie placement choices:** ties start at cover + d/2 above the column bottom and end the same below the top; (A) ties at the stated spacing from each end through the zone; (B) ties evenly spaced between the two zones with spacing <= stated (max 240.2 mm vs 254 mm), not at exactly 254 mm. Ties are assigned to the piece that contains their centre (half-open), one (A) and one (B) element per piece when non-empty.
5. **Weld contact definition.** Spec text says "member end"; its witness says "member-gusset contacts". Implemented the strict end reading (overlap interval reaches within 1 mm of a member end): this leaves **all 26 chords (2 - 2"x2"x1/4") with no weld at all** (their 91 contacts are mid-span, at gussets along the chord) plus 26 + 22 mid-span contacts on webs and the long 'Section run' members. The 4 refused welds are 'Section run' ends lying *against* a plate face (axis perpendicular to the plate; no bead rule in the spec). **Needs the owner's call**: weld mid-span contacts too (139 more welds)?
6. Beads: two triangular beads per weld element, both on the plate's +normal face, at the two outer edges where the member meets the plate (leg = table size, length = overlap length). Weld/member clash is not checked (not in the spec).
7. Witness additions beyond the spec's list: `STATED_TIE_SPACING` (loop gaps measured from the stored geometry) and `SIZE_CHECK`. DETERMINISM is judged by `--expect-*-sha` on the second run (run 1 prints INCONCLUSIVE by design, nothing to compare). The break run also fails COUNTS (64 sets) as a side effect of dropping the cover; that is expected, INSIDE is the required one.
8. `element_world_bbox` rows are added for new elements; the source has no `elements_rtree`, so none is created. `element_transforms` has 10 columns here (no tag column as in the PJAM DB).
