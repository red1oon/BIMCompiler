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
- **Footing:** a bottom mesh at the stated spacing both ways. L-bars run along the long side, S-bars along the short side. Bars are straight, with cover at both ends. Counts = floor((side − 2·cover − d)/spacing) + 1, logged (**corrected 2026-11-18 at review**: cover is to the bar surface, so the first and last bar centres sit at cover + d/2; the earlier formula without the −d term put the last bar inside the cover line; bars are centred in the cover-bounded span).
- **Column:** the 6 main bars are continuous from the footing mesh top to the column top. They run through all three pieces, which are one drawn column found by plan position. The arrangement is 3 bars on each of two opposite faces (corners + mid), bar centres at cover + tie + d/2.
- **Column ties** are perimeter ties. The (A) spacing applies for the end-zone length from each end of the column's clear height (footing top to beam soffit), the (B) spacing between.
  - The end-zone length is the stated `20"` next to (A) on the typical long section.
  - The drawing also writes `L` / `4L/6`. Rule row `zone_A = max(20", L/6)`, `default: ours` (reading of the two labels). The run logs both values and which governs.
- **Defaults** (`default: ours`, industry practice, no clause read):
  - footing cover 75 mm (cast against earth), column cover 40 mm;
  - tie hooks not modelled (logged);
  - no cross-ties (logged);
  - no laps (every bar is shorter than a 12 m stock length: checked and logged per bar).
- **Truss welds (build 3):** every member–gusset contact gets one weld group (**corrected 2026-11-18 at review**: the first text said "member end" only; in a welded truss a chord running continuously through a node is welded to that node's gusset too). An end contact (the overlap reaches within 1 mm of a member end) and a through (mid-span) contact are treated alike: one fillet weld element with two beads along the member's two edges where it meets the plate face, over the overlap length of the member mesh clipped to the gusset box.
  - Size = AISC 360-16 Table J2.4 minimum for the thinner part, as already in `conn_rules`: 6.35 mm part → 5 mm. `default: AISC Table J2.4`.
  - Length = the overlap length, `default: ours`.
  - Members with no gusset contact are counted, not welded. A member lying across or against a plate face (axis perpendicular to the plate) has no bead rule: refused and counted with the reason.
  - **Bead solids (corrected 2026-11-18, found by the build-5 IFC export):** each weld bead (a triangular prism, 8 triangles) must be a closed solid with its faces wound outward, consistently. The first version wound the two end caps inward, so all 676 beads were closed but inconsistently wound and the IFC4 faceted solids were invalid. Witness `§SHEDRB_WELD_WINDING`: every directed edge appears exactly once, its reverse exactly once, signed volume > 0 (`SHEDRB_BREAK_WINDING=1` restores the old caps and the witness must FAIL).
- **Output:** a copy `SHED_rebar.db` (never the export). One `IfcReinforcingBar` element per host × bar set (footing L, footing S, column main, ties A, ties B), with real bar geometry (8-sided prisms at bar diameter; ties as closed loops). One `IfcFastener` per weld. `element_parts` host → set. An `upgrade_changes` table + a txt written from it (same format as the PJAM change list). Each set's name carries its stated value and source handle.

**Witnesses (`§SHEDRB_*`; INCONCLUSIVE when nothing was judged):**
- IDENT: every source row unchanged; out = in + added.
- STATED: every element with a `Sched_*` row got its sets, and each set's bar diameter and spacing equal the parsed stated value.
- INSIDE: every bar lies inside its host's mesh box with ≥ cover − 1 mm to the faces.
- COUNTS: bars per set = the count formula.
- WELDS: welds = member–gusset contacts, end and through (an independent recount by triangle-box tests, not the clipper, must give the same set; any contact refused is counted with its reason); size = the table row.
- COST: added vertices and estimated heap (PERF BUDGET).
- DETERMINISM: two builds give the same SHA-256.
- Break switch `SHEDRB_BREAK=1` drops the cover offset: INSIDE must FAIL.

### §6 RESULT 2026-11-18 (BUILD 1 run on the Shed export; `scripts/lod/rebar_from_schedule.py` + `scripts/lod/rebar_defaults.json`; re-run after the review corrections to the footing count formula and the weld rule, and again after the weld-bead winding fix)
**Verdict: every `§SHEDRB_*` witness PASSES on run 1 (including `§SHEDRB_WELD_WINDING`, added by the weld-winding fix below); run 2 is byte-identical (DETERMINISM PASS, DB and change list); the break switch makes INSIDE FAIL as required.** Private outputs (DB, change list, logs) stay under the local project folder, never in git.

**Run 1 log, verbatim (`§` lines):**
```
§SHEDRB_MODE break=0 cover_footing_rule_mm=75 cover_column_rule_mm=40 placement_cover_footing_mm=75 placement_cover_column_mm=40
§SHEDRB_INPUT footings_with_schedule=32 column_pieces_with_schedule=96 boxes_ok=128 refused=0
§SHEDRB_FOOTING sets_added=64 footings=32 bars=512
§SHEDRB_COLGROUP drawn_columns=32 pieces_per_column={3: 32} -> PASS
§SHEDRB_ZONE columns=32 governs={'L/6': 32} (stated 20in=0.5080 m; L/6 per column logged in the change list) sample_L=4.2418 L/6=0.7070
§SHEDRB_ASSUMED tie_hooks=no cross_ties=no laps=no stock_checked_bars=96
§SHEDRB_BEAMS beams=35 without_schedule_row=35 not_built=35 details_sheet_rebar_texts=21 -> PASS
§SHEDRB_WELD_SCAN members=168 plates=117 contacts=364 end_contacts=225 through_contacts=139 touch_only=0 members_without_any_contact=10
§SHEDRB_WELD_BUILT welds=338 skipped=26
§SHEDRB_IDENT source_tables=19 tables_identical=True src_elements=513 out_elements=1107 added=594 -> PASS
§SHEDRB_STATED elements_with_schedule=128 sets_checked=256 diameter_spacing_mismatches=0 missing_expected_sets=0 -> PASS
§SHEDRB_STATED_TIE_SPACING columns=32 violations=0 max_B_gap_mm=240.150 (stated B spacing 254.000) -> PASS
§SHEDRB_SIZE_CHECK stated sizes vs mesh boxes: elements=96 max_dev_mm=0.0519 -> PASS
§SHEDRB_INSIDE sets=256 vertices=208896 violating_vertices=0 min_margin_mm=40.000 (worst set GEN-RB-0R0XHocG_1t$2Oh7AAAAHT-MAIN) required>=cover-1mm (footing 75, column 40) -> PASS
§SHEDRB_COUNTS footing_sets=64 count_mismatches=0 formula floor((side-2*cover-d)/spacing)+1 (the spec formula without the -d term would give {'(7, 8)': 32, '(9, 10)': 32} as (placed, spec-literal)) -> PASS
§SHEDRB_WELDS welds=338 contacts_by_clip=364 (end 225, through 139) contacts_by_independent_sat=364 (end 225, through 139) only_in_welds=0 only_in_recount=0 size_mismatches=0 table_row_for_6.35mm=5mm skipped=26 -> PASS
§SHEDRB_WELD_WINDING beads=676 not_closed_or_inconsistent=0 min_signed_volume_mm3=3225.513 -> PASS
§SHEDRB_COST added_elements=594 added_vertices=225120 source_vertices=33168 added_pct=678.73 est_heap_added_MB=38.27 (0.17 GB per M vertices) of_which_rebar=256 welds=338 -> PASS
§SHEDRB_LOG txt_data_lines=665 table_rows=665 -> PASS
§SHEDRB_WRITTEN db_sha256=504440a5f5b0256c txt_sha256=c053303a9d8dd5b4 db_sha256_full=504440a5f5b0256c8051550bfc5eed7e53ec48dce2b3f7471508ee0626125755 txt_sha256_full=c053303a9d8dd5b46ad4f42f1c5cb0552807109f2586d94fd23c355b57d05f42
§SHEDRB_DETERMINISM single build; pass --expect-db-sha / --expect-txt-sha from an earlier run -> INCONCLUSIVE
§SHEDRB_SUMMARY failed_witnesses=none added=594 not_built=45 refused=26
```
**Run 2 (same inputs, `--expect-db-sha`/`--expect-txt-sha` from run 1):**
```
§SHEDRB_WRITTEN db_sha256=504440a5f5b0256c txt_sha256=c053303a9d8dd5b4
§SHEDRB_DETERMINISM this_db=504440a5f5b0256c expected_db=504440a5f5b0256c this_txt=c053303a9d8dd5b4 expected_txt=c053303a9d8dd5b4 -> PASS
```
**Break run (`SHEDRB_BREAK=1`, placement cover dropped, witnesses still judge against the rule rows; db sha256 prefix 4c80c9d10c4bd02d):**
```
§SHEDRB_INSIDE sets=256 vertices=215040 violating_vertices=215040 min_margin_mm=-0.000 (worst set GEN-RB-007izrUd4u9uIpn7AAAABL-L) required>=cover-1mm (footing 75, column 40) -> FAIL
§SHEDRB_COUNTS footing_sets=64 count_mismatches=64 formula floor((side-2*cover-d)/spacing)+1 (the spec formula without the -d term would give {'(8, 8)': 20, '(8, 9)': 12, '(10, 10)': 14, '(10, 11)': 18} as (placed, spec-literal)) first=('007izrUd4u9uIpn7AAAABL', 'L', 8, 7) -> FAIL
§SHEDRB_WELD_WINDING beads=676 not_closed_or_inconsistent=0 min_signed_volume_mm3=3225.513 -> PASS
§SHEDRB_BREAK_CHECK switch=on expected INSIDE=FAIL got INSIDE=FAIL -> PASS
§SHEDRB_SUMMARY failed_witnesses=INSIDE,COUNTS added=594 not_built=45 refused=26
```

**What was built (numbers from the log and the change list, 665 rows):**
- 128 schedule-bearing elements (32 IfcFooting + 96 IfcColumn pieces) -> 256 IfcReinforcingBar sets: 64 footing sets (224 L bars + 288 S bars), 32 column main sets (192 bars), 64 tie-(A) sets (384 loops) and 96 tie-(B) sets (352 loops). All 96 column pieces group into 32 drawn columns of exactly 3 pieces by plan position. Stated sizes vs mesh boxes: max deviation 0.052 mm (`§SHEDRB_SIZE_CHECK`, extra witness).
- Tie (A) zone: `max(stated 20 in = 508 mm, L/6)`; **L/6 governed on all 32 columns** (L = 4.2418 m, L/6 = 707 mm). The zone rule row stays `default: ours`; the 20" is `stated: 5_DETAILS_marked.dxf#25B/#263`.
- Welds (rule as corrected at review: every member-gusset contact): 364 contacts (225 end, 139 through), found by clipping the member mesh to the plate's oriented box; the independent recount (SAT of each member's end-cap triangles for end contacts, SAT of the whole mesh for through contacts) finds the same 364 pairs. 338 welds built: 221 end + 117 through (91 on the 26 chords `2 - 2"x2"x1/4"`, 26 on 'Section member' webs). All sizes read back from the stored beads = 5 mm (table row for 6.35 mm), 0 mismatches. 26 refused and counted: all on the 'Section run' members (4 end + 22 through contacts), whose axis lies perpendicular to the plate, so the "two edges along the member" bead has no meaning.
- Not built (45 NOT_BUILT rows + 26 REFUSED in `upgrade_changes`): 35 IfcBeam without a schedule row (the change-list rows carry the 21 rebar-like texts of the details sheet by drawing handle; the DB cannot attribute them to a beam, scope item 1b); 10 'Section run' members with no gusset contact at all.
- Cost: +225,120 vertices on 33,168 source vertices (+679 %), est. +38.3 MB heap at 0.17 GB per M vertices. Bars are 96 vertices each (8-sided prism, capped); tie loops 192; welds 48. A viewer that wants this at scale needs a shared-geometry or LOD route for bars (PERF BUDGET).

**Choices the spec left open, and additions:**
1. **Main bars are one element per drawn column** (3 pieces), with `element_parts` rows from each of the 3 pieces to it; "per host x set" cannot split a continuous bar at piece joints. They sit at cover + tie + d/2 from the faces of the *smallest* piece (12"). Bottom end = top of the footing's two-layer mesh; top end = column top minus cover (needed for INSIDE; the spec only says "to the column top").
2. **Layout rows added to the defaults file:** `footing_bottom_layer` = L bars lowest, `column_bar_face_normal_axis` = the 3 + 3 main bars on the two faces normal to x (neither is drawn); also `bar_sides`, `stock_length_mm` (12 m), `weld_contact_end_tol_mm` (1 mm), `inside_tol_mm` (1 mm). Of 15 rule rows, 14 are defaults, 1 is stated.
3. **Tie placement:** ties start at cover + d/2 above the column bottom and end the same below the top; (A) ties at the stated spacing from each end through the zone; (B) ties evenly spaced between the zones with spacing <= stated (max 240.2 mm vs 254 mm). Ties go to the piece containing their centre, one (A) and one (B) element per piece when non-empty.
4. **Weld beads:** two triangular beads per weld element, both on the plate's +normal face, at the two outer edges where the member section meets that plane (leg = table size, length = overlap length). The member section in the plate plane is taken from the whole prism, so a through contact finds its edges. Weld/member clash is not checked (not in the spec).
5. **Witness additions:** `STATED_TIE_SPACING` (loop gaps measured from the stored geometry) and `SIZE_CHECK`. DETERMINISM is judged with `--expect-*-sha` on the second run (run 1 prints INCONCLUSIVE by design). The break run also fails COUNTS (64 sets) as a side effect; INSIDE is the required one. Optional `--callouts <details.dxf>` lists the beam-sheet rebar texts in the change list.
6. `element_world_bbox` rows are added for new elements; the source has no `elements_rtree`, so none is created. `element_transforms` has 10 columns here (no tag column as in the PJAM DB).
7. **Weld-bead winding fix (found by the build-5 IFC export, §9).** The first version wound each bead's two end caps inward: all 676 beads were closed (every edge shared by two triangles) but inconsistently wound, so the IFC4 faceted solids were invalid. Fixed: caps are wound outward from the bead centroid. New witness `§SHEDRB_WELD_WINDING` (every directed edge exactly once and its reverse exactly once; signed volume > 0). Proof it bites: `SHEDRB_BREAK_WINDING=1` restores the old caps and gives `§SHEDRB_WELD_WINDING beads=676 not_closed_or_inconsistent=676 -> FAIL` (that old build also reproduces the earlier db sha256 prefix 13ff08698dd29442). Only weld geometry changed: the DB sha256 moved from 13ff08698dd29442 to 504440a5f5b0256c, the change-list txt sha256 is unchanged (c053303a9d8dd5b4).


## 7. BUILD 2 SPEC (2026-11-18, owner: "Proceed on build order tasks"): PJAM concrete beam reinforcement from the S-401 schedule
**Issue it proves or disproves:** can the stated S-401 beam schedule become real bars on every concrete beam of the model? The schedule is joined by the model's own type mark. One engine (`scripts/lod/rebar_from_schedule.py`) must serve both a DXF-attached schedule (the Shed) and a table read from a drawing (PJAM), with no per-building code.
**Measured inputs (2026-11-18):**
- **Schedule:** S-401 is machine-read as `S-401.json` (259 cells) and parsed by `beam_rules.py` (`bars()`) into 22 marks: CFB1, CRB1, FB1-FB7, FB10-FB13, GB1-GB3, RB1, RB2, RB4-RB7. Each mark has width, depth, bottom bars, top bars, side bars (e.g. `2T12-300`) and stirrups (dia, spacing).
- **Model:** 92 concrete beams in `JPAM.db`. Each carries a type mark in its name (`Beam - Concrete - Rectangular (M):GB1(300x600):<id>`), and the mark also sits in `Pset_BeamCommon.Reference`. **92 of 92 join** to a schedule mark (GB1 34, GB2 14, FB5 8, …).
- **Code stated (S-001):** ACI 318-19. Its cover and spacing clauses were NOT read here; their values below are therefore `default: ours`.

**Engine change (generic):**
- **Second schedule source:** `--schedule-json <marks.json> --mark-regex '<regex on element_name>'`. Rows `{mark: {bottom:[[n,dia]...], top:[...], side:'...', stirrup:[dia, spacing], w, h, source}}` are written by a small reader beside `beam_rules.py`, citing S-401.
- **Same output path as the DXF-attached rows:** a stated row wins; a mark with no row is reported, never guessed.

**Rules:**
- **Bottom and top bars:** one layer each at cover + stirrup + d/2, evenly across the width. A second layer only where one layer breaks the minimum clear spacing (R110, stated); minimum clear spacing = `default: ours` 25 mm, logged per beam.
- **Bar length:** the beam's own modelled length minus cover at each end. No anchorage into supports is modelled (logged). A bar over 12 m is flagged `needs lap (not modelled)`.
- **Side-face bars:** as stated per mark, each face, at the stated pitch over the web depth (R105). The parse of the stated string is logged.
- **Stirrups:** closed loops at the stated dia and spacing over the clear length. Hooks are not modelled (logged).
- **Defaults** (`default: ours`, ACI 318-19 not read): cover 40 mm to the stirrup; minimum clear spacing 25 mm.
- **Output:** a copy `JPAM_rebar.db` built from `JPAM.db` (JPAM.db unchanged), with one `IfcReinforcingBar` per beam × set and `element_parts` beam → set. Its change list `JPAM_rebar_changes.txt` is in the same format as `JPAM_changes.txt`.

**Witnesses (`§PJRB_*`):** IDENT · JOIN (beams 92, joined 92, unjoined listed) · STATED (each set's n, dia, spacing = the mark row) · INSIDE (every bar inside its beam's TRUE mesh box with ≥ cover − 1 mm, not the DB rtree: known bad) · LAYERS (second layers counted, with the spacing that forced each) · LAP (bars > 12 m listed) · COST (verts, heap) · DETERMINISM (two builds, same SHA-256) · break switch `PJRB_BREAK=1` drops cover, so INSIDE must FAIL. INCONCLUSIVE if nothing joined.

### §7 RESULT 2026-11-18 (BUILD 2 run on the PJAM model; `scripts/lod/rebar_from_schedule.py` + `scripts/lod/rebar_beams.py` + `scripts/lod/rebar_beam_defaults.json` + `scripts/lod/s401_marks.py`)
**Verdict: 8 of 9 spec witnesses PASS (IDENT, JOIN, INSIDE, LAYERS, LAP, COST, DETERMINISM on run 2, BREAK_CHECK); STATED FAILS: 7 set mismatches on 2 of the 92 beams. The FAIL is reported as a result, not tuned away.** Run 2 is byte-identical (DB and change list). The break switch makes INSIDE fail as required. Build 1 was re-run after the engine change: its DB and change list are byte-identical to the §6 run (`db_sha256=13ff08698dd29442`, `txt_sha256=c053303a9d8dd5b4`, DETERMINISM PASS; the §6 run used the details-sheet option `--callouts` with the Shed's 5_DETAILS sheet, without it the change list differs by the callout texts only). Private outputs (DB, change lists, logs) stay under the local project folder, never in git.

**The schedule reader (`s401_marks.py`, generic: table JSON in, marks JSON out), verbatim:**
```
§PJRB_MARKS source_sheet=S-401-SCHEDULES & DETAILS - 02.dxf beam_tables=3 marks=22 skipped_rows=0 unparsed_cells=0  -> PASS
§PJRB_MARKS_FIELDS with_stirrup=22 with_side=15 with_hanger_C=22 balance_differs_from_end=7 ['FB12', 'FB13', 'FB6', 'FB7', 'RB1', 'RB4', 'RB7'] with_inner_legs_text=11
§PJRB_MARKS_XCHECK reference_marks=22 compared=22 mismatches=0 extra_marks_not_in_reference=0  -> PASS
```
**Run 1 log, verbatim (`§` lines):**
```
§PJRB_MODE break=0 cover_rule_mm=40 placement_cover_mm=40 min_clear_mm=25 layer_clear_mm=25 sample_step_mm=10
§PJRB_INPUT host_class=IfcBeam hosts=92 schedule_marks=22 marks_used=22 marks_unused=[]
§PJRB_BUILT beams_built=92 sets_added=306 bar_lines=1345 bar_lines_placed=1336 stirrup_positions=4247 stirrup_loops_placed=4013
§PJRB_ASSUMED anchorage=no stirrup_hooks=no laps=no stock_checked_bars=1336 hanger_C_built=no hanger_C_marks=22 balance_zone_differs_marks=['FB12', 'FB13', 'FB6', 'FB7', 'RB1', 'RB4', 'RB7'] inner_legs_marks=11
§PJRB_SIDE_PARSE {'kind': 'count', 'n': 10, 'dia': 25, 'pitch': None} x1 | {'kind': 'count', 'n': 8, 'dia': 25, 'pitch': None} x7 | {'kind': 'pitch', 'n': 2, 'dia': 12, 'pitch': 300} x33
§PJRB_IDENT source_tables_compared=21 (rtree shadow tables skipped: 3) tables_identical=True src_elements=6828 out_elements=7134 added=306 source_upgrade_rows_kept=563 -> PASS
§PJRB_JOIN beams=92 joined=92 unjoined=0 listed_as_not_built=0 by_mark={'CFB1': 4, 'CRB1': 2, 'FB1': 2, 'FB10': 1, 'FB11': 1, 'FB12': 2, 'FB13': 2, 'FB2': 1, 'FB3': 4, 'FB4': 1, 'FB5': 8, 'FB6': 2, 'FB7': 4, 'GB1': 34, 'GB2': 14, 'GB3': 1, 'RB1': 1, 'RB2': 1, 'RB4': 1, 'RB5': 3, 'RB6': 2, 'RB7': 1} -> PASS
§PJRB_STATED beams_judged=92 set_mismatches=7 by_set={'SIDE': 6, 'TOP': 1} beams_affected=2 (mark, Revit id)=[('FB13', '2467901'), ('RB2', '2832505')] stirrup_gaps_checked=3921 skipped_positions_inside_gaps=71 first=('3ZaBg3G5TAQ96SNNNXP2tj', 'TOP', 'bars placed {} != stated {16: 5}') -> FAIL
§PJRB_INSIDE sets=306 distinct_vertices=152464 violating_vertices=0 sets_violating=0 min_margin_mm=40.099 (worst set GEN-RB-1b8Jj2ZrrDcfIh1jybnK5$-TOP) required>=cover-1mm (cover 40) -> PASS
§PJRB_LAYERS bar_sets_judged=177 by (set,layers)={'BOT:1': 85, 'BOT:2': 7, 'TOP:1': 24, 'TOP:2': 55, 'TOP:3': 6} multi_layer_sets=68 min_clear_rule_mm=25 forcing (mark,set,layers,one-layer clear mm)=[('FB11', 'TOP', 3, np.float64(-1.4)), ('FB12', 'TOP', 2, np.float64(-0.1)), ('FB3', 'BOT', 2, np.float64(24.0)), ('FB3', 'TOP', 2, np.float64(5.1)), ('FB5', 'TOP', 2, np.float64(2.5)), ('FB6', 'TOP', 2, np.float64(9.0)), ('FB7', 'TOP', 2, np.float64(-0.1)), ('GB1', 'TOP', 2, np.float64(5.7)), ('RB1', 'BOT', 2, np.float64(19.4)), ('RB1', 'TOP', 3, np.float64(-4.2)), ('RB2', 'BOT', 2, np.float64(15.2)), ('RB2', 'TOP', 3, np.float64(-0.4)), ('RB4', 'BOT', 2, np.float64(24.0)), ('RB4', 'TOP', 2, np.float64(24.0)), ('RB6', 'TOP', 3, np.float64(-1.7)), ('RB7', 'TOP', 3, np.float64(-2.2))] -> PASS
§PJRB_LAP bars_judged=1336 over_12m=90 in_beams=3 unflagged=0 list(mark,set,dia,length_m)=[('FB1', 'BOT', 25, 27.924), ('FB1', 'SIDE', 25, 27.924), ('FB1', 'SIDE', 25, 28.124), ('FB1', 'TOP', 25, 28.124), ('FB4', 'BOT', 25, 37.625), ('FB4', 'SIDE', 25, 37.625), ('FB4', 'SIDE', 25, 37.629), ('FB4', 'SIDE', 25, 38.061), ('FB4', 'TOP', 25, 38.061), ('RB2', 'BOT', 20, 32.02), ('RB2', 'TOP', 20, 32.02)] ... -> PASS
§PJRB_SIZE beams=92 width_within_5mm_of_stated=92 width_max_dev_mm=0.0 | depth stated minus mesh body (modal section) mm histogram={0: 31, 46: 2, 150: 33, 200: 8, 250: 8, 350: 5, 400: 5} | stated minus mesh bounding box={0: 44, 100: 1, 150: 28, 200: 7, 250: 10, 400: 2} | beams whose section changes along the axis=18 (the mesh is the truth for placement; the stated depth is reported, not used)
§PJRB_COVERAGE bar_lines=1345 placed=1336 not_placed=9 | stirrup_positions=4247 placed=4013 skipped=234 beams_with_zero_loops=0 | longest_bar_over_beam_length: min=0.17 median=0.97
§PJRB_COST added_elements=306 added_vertices=898752 source_vertices=4878557 added_pct=18.42 est_heap_added_MB=152.79 (0.17 GB per M vertices) of_which_loops=92 sets -> PASS
§PJRB_LOG txt_data_lines=408 table_rows_added=408 -> PASS
§PJRB_WRITTEN db_sha256=09f44ab753f708ec txt_sha256=5bdad7b9926763b5 db_sha256_full=09f44ab753f708ec24a78b33f43454111ad5eda840188dce4c6797fc03a8369b txt_sha256_full=5bdad7b9926763b5c302c056933b04a4f7f868e5da2de259c479ff38c6e80087
§PJRB_DETERMINISM single build; pass --expect-db-sha / --expect-txt-sha from an earlier run -> INCONCLUSIVE
§PJRB_SUMMARY failed_witnesses=STATED added=306 not_built=92 refused=10
```
**Run 2 (same inputs, `--expect-db-sha`/`--expect-txt-sha` from run 1):**
```
§PJRB_WRITTEN db_sha256=09f44ab753f708ec txt_sha256=5bdad7b9926763b5 db_sha256_full=09f44ab753f708ec24a78b33f43454111ad5eda840188dce4c6797fc03a8369b txt_sha256_full=5bdad7b9926763b5c302c056933b04a4f7f868e5da2de259c479ff38c6e80087
§PJRB_DETERMINISM this_db=09f44ab753f708ec expected_db=09f44ab753f708ec this_txt=5bdad7b9926763b5 expected_txt=5bdad7b9926763b5 -> PASS
§PJRB_SUMMARY failed_witnesses=STATED added=306 not_built=92 refused=10
```
**Break run (`PJRB_BREAK=1`, placement cover dropped, witnesses still judge against the rule row):**
```
§PJRB_MODE break=1 cover_rule_mm=40 placement_cover_mm=0 min_clear_mm=25 layer_clear_mm=25 sample_step_mm=10
§PJRB_STATED beams_judged=92 set_mismatches=6 by_set={'SIDE': 6} beams_affected=2 (mark, Revit id)=[('FB13', '2467901'), ('RB2', '2832505')] stirrup_gaps_checked=3967 skipped_positions_inside_gaps=69 first=('3ZaBg3G5TAQ96SNNNXP2tj', 'SIDE', 'levels per face 2/2 != expected 3 from the stored bottom/top bars') -> FAIL
§PJRB_INSIDE sets=311 distinct_vertices=154962 violating_vertices=154962 sets_violating=311 min_margin_mm=-0.001 (worst set GEN-RB-1b8Jj2ZrrDcfIh1jybnK5$-TOP) required>=cover-1mm (cover 40) -> FAIL
§PJRB_BREAK_CHECK switch=on expected INSIDE=FAIL got INSIDE=FAIL -> PASS
§PJRB_SUMMARY failed_witnesses=STATED,INSIDE added=311 not_built=92 refused=4
```

**What was built (numbers from the log):** 306 `IfcReinforcingBar` sets on 92 of 92 concrete beams (92 stirrup sets + bottom, top and side sets): 1,336 of 1,345 stated bar lines placed, 4,013 of 4,247 stirrup positions placed (234 skipped where the modelled section is cut). 22 of 22 schedule marks used; 92 of 92 beams joined by the mark in the element name. 68 bar sets needed more than one layer (up to 3 on a 250-400 mm web: a single layer would clear -4.2 .. 24.0 mm against the 25 mm rule). 90 bars are over 12 m (FB1, FB4, RB2), each flagged `needs lap (not modelled)`. Cost +898,752 vertices on 4,878,557 (+18.4 %), est. +152.8 MB heap.

**The 2 failing beams (STATED):** mark FB13 (Revit id 2467901): all 5 top bars T16 and 2 side-bar lines T12 could not be placed; mark RB2 (Revit id 2832505): 2 side-bar lines T12 could not be placed. The 4 missing side lines show as 6 SIDE mismatches (levels per face, pitch gaps) plus 1 TOP. Cause, measured for FB13: the mesh is composite (a 0.6 m deep lower part plus a narrow upper part, 70 % of its bounding-box volume, RB2 also 70 %), so no bar line at the schedule section lies inside the mesh with the cover kept. Nothing was loosened to make them pass; each is a REFUSED row in the change list with the stated value.

**Deviations from the §7 text, and why:**
1. **Beam rule rows are in `rebar_beam_defaults.json`, not added to `rebar_defaults.json`.** The build-1 change list embeds that file's hash and row count; adding rows would have changed build 1's outputs. Shared rows (`bar_sides`, `inside_tol_mm`, `stock_length_mm`) are still read from `rebar_defaults.json`. 12 beam rows, all `default: ours`.
2. **One engine, second source as a module.** `rebar_from_schedule.py` takes `--schedule-json --mark-regex [--host-class] [--beam-defaults]` and calls `rebar_beams.run(globals())`, sharing the copy, row writers, bar and tie geometry and IDENT digests. Section 6 code is untouched (diff: argument and schema guards only: a source that already has `upgrade_changes` keeps its rows, `element_world_bbox` / the normals column / the 11th transform column are written only when the source has them).
3. **Reference section = the body, not the bounding box.** Almost every beam mesh is not a box (91 of 92 fail a box test: columns, slabs and joins cut them; 18 change section along the axis; the stated depth equals the mesh depth on only 44 of 92). A first run used the bounding box and had 44 STATED mismatches (a stub 0.4 m long set the top bar level); the layout now uses the most common vertical extent measured along the beam (`modal_zrange`). A second fix: that extent was first rounded to 1 mm, which pushed 25 beams' stirrups 0.4 mm inside the cover line, so none fitted; it is now used at full precision. The bounding-box first-attempt log is kept privately. Bar ends, and every bar and stirrup, are fitted to the true mesh (distance to the surface plus ray parity), not to a box.
4. **Top bars = columns D + E only; hanger column C is not built.** The spec lists bottom/top/side/stirrups and the earlier hand parser also leaves C out. C is on all 22 marks and is reported as NOT_BUILT per beam. **Open question for the owner:** mark CRB1 (2 beams) states `7T25` only in C, so it gets no top steel in this build.
5. **Stirrup spacing = the end-zone value over the whole length.** The balance-zone spacing differs on 7 marks (FB6, FB7, FB12, FB13, RB1, RB4, RB7) and 11 marks carry inner legs; their zone lengths are not stated, so both are recorded as NOT_BUILT, not modelled.
6. **Side-bar string reading:** `2T12-300` = one bar per face per level at most 300 mm apart between the outermost bar centres; `8T25`/`10T25` (no pitch) = n/2 per face evenly spaced. Logged in `§PJRB_SIDE_PARSE`.
7. **The source's earlier 563 `upgrade_changes` rows are kept;** this run's 408 rows are appended from 564 and the txt lists only those.
8. **Witness limits:** INSIDE re-measures every stored vertex against the host mesh read back from the output DB in the world frame, but it uses the same distance + ray-parity primitive as the fit, so it is not an independent algorithm. SIZE and COVERAGE are reports with no verdict. LAYERS min-clear is judged on stored bar positions.

## 8. BUILD 4 SPEC (2026-11-18): PJAM bracing gusset connections (the 57 STEEL_SKEW ends)
**Issue it proves or disproves:** can every angle brace end of the model get a rule-based gusset connection? That means a gusset welded to the supporting beam and the angle bolted to it, laid out to AISC 360-16 detailing limits. Every joint that would clash is refused and counted, and the author's members are never moved.
**Measured inputs (2026-11-18):** the joint survey (`joint_survey.json`, §AD.2) classes 57 ends as STEEL_SKEW (30-60 deg to their support).
- **Braces:** L100x100x8 ×31, L200x200x16 ×18, L120x120x12 ×8.
- **Supports:** UB254x146x43 ×22, UB457x191x98 ×16, BU-500x300x50x25 ×12, BU BOX HSS 990X300X25 ×4.
- **Gussets in the model:** none. Its 495 IfcPlate are cladding and panels.
- **Engineer's details:** none. S-006..S-008 standard details are not in the package.

**AISC 360-16 read 2026-11-18 (local copy):**
- §J4 gives the STRENGTH of gussets (tensile yield and rupture, Whitmore section, block shear). It needs loads, which we do not have, so **no capacity check, and §J4 gives no size**.
- §J1.1: *"Where the gravity axes of intersecting axially loaded members do not intersect at one point, the effects of eccentricity shall be considered"*. The author's geometry is kept, so the eccentricity is MEASURED and reported per joint, never corrected.
- Detailing rows reuse `conn_rules.json`: M20 bolts, standard holes (Table J3.3M), pitch (§J3.3), edge distance (Table J3.4M, §J3.5), fillet min/max (Table J2.4, §J2.2b).

**Rules** (new rows marked `default: ours` unless a clause is named):
- **Gusset plane:** the plane of the angle leg that lies in the plane of the brace axis and the support axis. A joint where neither leg qualifies within 10 deg is refused (`AMBIGUOUS_PLANE`).
- **Gusset attachment:** the support flange face that the brace axis meets (top or bottom flange), welded along its contact edge. Weld = Table J2.4 minimum for the thinner part, both sides of the plate.
- **Bolts:** in the connected leg, on one gauge line at `leg/2` (ours; the AISC Manual gauge table not read), along the brace axis. Count `bolts_min` 2 (ours), pitch 60, end edge 35.
- **Gusset outline:** the smallest convex plate that holds the bolt group with the edge distance and reaches the flange edge. Thickness = max(angle leg thickness, 10 mm) (ours).
- **Clash:** the gusset, bolts and welds must not enter any element but the welded flange and the bolted angle. TRUE mesh boxes are used, not the DB rtree. A failing joint is refused (`REFUSED_CLASH`) with what it hit.
- **Output:** a copy `JPAM_gussets.db` built from `JPAM.db` (JPAM.db unchanged). Per joint, one assembly of IfcPlate (gusset) + IfcMechanicalFastener (bolt group) + IfcFastener (welds), each named "configuration only, capacity not checked". Change list `JPAM_gussets_changes.txt` in the PJAM change-list format.

**Witnesses (`§GUS_*`):** SURVEY (57 judged) · IDENT · RULES (every generated dimension = its row or clause, and each clause's own min/max holds) · CLEAR + CLEAR_POST (re-checked on the written DB) · ECCENT (eccentricity per joint, mm, reported: not a pass/fail) · COUNTS (generated + refused by reason = 57) · DETERMINISM (two builds, same SHA-256) · break switch `GUS_BREAK=1` disables the clash refusal, so CLEAR_POST must FAIL. INCONCLUSIVE if 0 generated.

### §8.1 Spec correction 2026-11-18 (after the probe, before any generator code)
**Probe (read-only):**
- The plane rule qualifies on 57 of 57 ends.
- The brace AXIS meets a flange face on only 6 ends. 51 axes pass between the flanges (web or box wall), and 1 meets nothing.
- The in-plane leg's thickness band overlaps a flange band on 47 ends and misses every flange on 10.
- So §8's "the flange face the axis meets" is replaced. Attachment follows the **leg plane**, not the axis.

The three open choices are decided as labelled defaults (`default: ours`), under the owner's ruling of 2026-11-18 that industry defaults may stand in where nothing is stated. The owner or engineer can override any of them as a rule row:
1. **Which face:** the gusset sits on the face of the in-plane leg AWAY from the outstanding leg, so it never meets the brace's own other leg.
2. **Contact and gap:** the gusset is OURS, so it is placed touching the support face it attaches to: flange face (lap, fillet along the flange edge) or web / box-wall face (T-joint, fillets both sides). The author's angle is never moved.
   - The measured gap between the gusset and the angle leg becomes a **filler**, recorded per joint.
   - AISC 360-16 §J5.2, read: a bolt through fillers ≤ 6 mm takes no shear reduction; above 6 mm a reduction or development applies. So each filler is tagged `≤ 6 mm` or `> 6 mm: engineer to check (§J5.2)`.
   - A gap above `filler_max_mm` 25 (ours) is refused (`GAP_TOO_LARGE`).
3. **No flange in the leg plane (10 ends):** attach to the web or box-wall face the leg plane meets, within the support's depth. If the plane meets no face of the support within `support_reach_mm`, refuse (`NO_ATTACHMENT`).

Witness additions:
- `§GUS_ATTACH`: count by attachment (flange lap / web T / box wall) and refused by reason.
- `§GUS_FILLER`: filler thickness min / median / max, and how many are over 6 mm.
- COUNTS must still add to 57.

### §8 RESULT 2026-11-18 (BUILD 4 run on the PJAM model; private generator + `gusset_rules.json`, 12 new rule rows, all `default: ours` or AISC-read)
**Headline: 1 of 57 brace ends got a gusset. 56 are refused, each with a counted reason. No witness failed on the real run; the break run failed CLEAR_POST as it must.**

**Run 1 (verbatim `§GUS_*`):**
```
§GUS_SURVEY judged=57 (STEEL_SKEW ends of joint_survey.json) present_in_model=57 braces={'L120x120x12.0': 8, 'L100x100x8.0': 31, 'L200x200x16.0': 18}
§GUS_IDENT source_tables_compared=21 identical=True src_elements=6828 out_elements=6831 added=3 (3 x 1 joints) source_upgrade_rows_kept=563 -> PASS
§GUS_RULES joints=1 clause_failures=0 (measured on the built meshes; checks per joint=14) -> PASS
§GUS_CLEAR_POST parts_checked=3 failures=0 (surface points of each written part vs every neighbour solid, ray parity, on the written DB; brace exempt; support exempt only where welded) -> PASS
§GUS_CLEAR judged=23 shipped=1 refused_for_clash=22 neighbours_tested_per_joint min=8 max=8 -> PASS
§GUS_REFUSED_CLASH plate x IfcSlab Slab - Concrete - 150mm (M) 2 joints=18
§GUS_REFUSED_CLASH weld x IfcMember L100x100x8.0 joints=4
§GUS_ECCENT (reported, not a pass/fail; J1.1 measured distance between the brace gravity axis and the support axis) generated: min=36.0 median=36.0 max=36.0 | all 57 judged ends: min=7.3 median=103.4 max=222.9 -> PASS
§GUS_ATTACH generated_by_attachment={'web T': 1} refused_by_reason={'REFUSED_CLASH': 22, 'NO_ATTACHMENT': 13, 'GAP_TOO_LARGE': 4, 'NO_ROOM': 17}
§GUS_FILLER generated=1 filler_mm min=0.0 median=0.0 max=0.0 | zero=1 | 0<f<=6 (no J5.2 reduction)=0 | >6 engineer to check=0 | gusset enters author angle (overlap_mm) n=0 none
§GUS_COUNTS generated=1 refused={'REFUSED_CLASH': 22, 'NO_ATTACHMENT': 13, 'GAP_TOO_LARGE': 4, 'NO_ROOM': 17} total=57 of 57 judged -> PASS
§GUS_WRITTEN db_sha256=c71e4e8e626f1923 txt_sha256=9e44c64765f46c3c
```
**Run 2 (same inputs, expected hashes from run 1):**
```
§GUS_DETERMINISM this_db=c71e4e8e626f1923 expected_db=c71e4e8e626f1923 this_txt=9e44c64765f46c3c expected_txt=9e44c64765f46c3c -> PASS
```
**Break run (`GUS_BREAK=1`, clash refusal off, witnesses unchanged):**
```
§GUS_IDENT ... out_elements=6897 added=69 (3 x 23 joints) -> PASS
§GUS_RULES joints=23 clause_failures=13 ... first=[('3D5QSRXD', 1, ['contact_le_tol']), ...] -> FAIL
§GUS_CLEAR_POST parts_checked=69 failures=56 ... -> FAIL
§GUS_CLEAR judged=23 shipped=23 refused_for_clash=0 ... BREAK=on ignored_clashes=22 -> FAIL
§GUS_BREAK_CHECK switch=on clash refusal disabled; clashing joints written=22; expected CLEAR_POST=FAIL got CLEAR_POST=FAIL -> PASS
```

**What the numbers say (from the logs):**
- **The roof slab decides most joints.** 18 of 22 clashes are the gusset plate against the 150 mm concrete roof slab. Its bottom face passes through the plate level (H 36-48 mm above the leg centroid axis), because the author's braces and top flanges sit at the slab underside. §8.1 rule 1 puts the gusset on the face away from the outstanding leg, i.e. up, so every flange-lap gusset is inside the slab. The other 4 clashes are a weld bead against a neighbouring L100x100x8 member.
- **17 NO_ROOM.** The contact face is within 26 mm of the angle's own end at the leg plane, so the first bolt cannot keep the edge distance to the end of the angle.
- **13 NO_ATTACHMENT:** 10 where the leg plane meets no support face within `support_reach_mm` 300, 2 where the contact slice found no face, 1 `web T: wall 249 mm is not a plate` (cause not investigated; the measured wall along the face normal is 249 mm, which an I-section web cannot give).
- **4 GAP_TOO_LARGE:** flange-lap fillers of 57.1-57.6 mm against `filler_max_mm` 25.
- **The one generated joint** is a web T: gusset 10 mm, plate 185 mm long, fillet 5 mm, filler 0, eccentricity 36.0 mm. Its 14 clause checks pass (pitch, edges, weld min/max, plate thickness, bolts inside the angle leg, contact gap).
- **Eccentricity over all 57 ends:** min 7.3, median 103.4, max 222.9 mm. Reported, not corrected (AISC J1.1).
- **Break run:** 22 clashing joints written, CLEAR_POST fails on 56 of 69 parts, so the clash check is able to fail. RULES also fails in the break run (13 joints, `contact_le_tol`), because the slab-clashing lap gussets sit on a flange face that the plate no longer touches within 5 mm.

**Deviations from §8 / §8.1, and why:**
1. New refusal reasons `NO_SECTION` (end cap unreadable), `NO_ROOM` (above) and `LEG_OVERLAP` (the gusset may enter the author's angle by less than its own thickness, since §8 lets the gusset enter the bolted angle; more is refused). NO_SECTION and LEG_OVERLAP were not hit on the 57.
2. Flange vs wall is decided by the material interval along the plate normal at the contact: flange if <= 0.25 x section depth (row `flange_interval_max_fraction`, ours). A lap is `max(5 x thinner part, 25 mm)` long (AISC 360-16 J2.2b(f), read) with two fillets along the lapped plate's lateral edges.
3. The brace gravity axis is the end-cap area centroid; the support axis is the vertex mean of the support mesh, so ECCENT is approximate for asymmetric sections.
4. Clash neighbours exclude `GEN-LY-` and `GEN-RB-` parts (duplicates of their hosts), and include `GEN-CR-` and earlier `GEN-GU-` parts. The brace is exempt; the support is exempt only for the welds and, for a lap, the plate.
5. Parity (swallowed-whole) test is skipped for 4 large shell elements (cables, mesh, curtain, roof coping); their surfaces are still tested.
6. The "wall 249 mm" refusal is not explained; no check was loosened to remove it.

**Files (private, not committed):** `~/Projects/Jebel/lod_sandbox/conn_rules/gen_gussets.py`, `gusset_rules.json`, `gus_probe.py`; outputs `jpam/JPAM_gussets.db`, `JPAM_gussets_changes.txt`, `run2_gussets/`, `break_gussets/`; logs `jpam/log/gus_run1.log`, `gus_run2.log`, `gus_break.log`, `gus_probe.log`.

## 9. BUILD 5 SPEC (2026-11-18, owner: "can export the rebar and gussets in IFCs"): add-on IFCs for the rebar and gussets
**Issue it proves or disproves:** can the parts built in §6-§8 leave our DBs as IFC that the receiving team opens on top of its own model? That means at the right place, with every value traceable, valid, and identical on every export.
**Generic exporter** `scripts/lod/export_parts_ifc.py <db> <out.ifc> --select <guid prefix>[,...] --schema IFC2X3|IFC4 [--frame frame.json]`:
- **Content:** writes ONLY the selected generated elements. It is an add-on file, like the delta IFC of 2026-11-17 (`ifc_delta/export_delta_ifc.py`), whose conventions it follows: fixed header timestamp, GlobalId = compressed UUID5 of our element id (stable, unique), storeys by the host's storey name.
- **Frame:** `--frame` gives a site placement and storey elevations. Without it, the DB frame is written as is and the file says so in its description.
- **Geometry:** the element's own DB mesh, written as IfcFacetedBrep (IFC2X3) or IfcTriangulatedFaceSet (IFC4).
- **Class map:**
  - `IfcReinforcingBar`, with NominalDiameter, CrossSectionArea and BarLength from the set, and BarRole MAIN (longitudinal, mesh) or LIGATURE (ties, stirrups); IFC4 PredefinedType the same.
  - `IfcPlate`, `IfcMechanicalFastener`, `IfcFastener`, grouped in an `IfcElementAssembly` per joint.
- **Material:** steel grade only as stated (the Shed: fy 500 MPa), else "grade not stated".
- **Pset `BIMC_Upgrade`:** HostGlobalId, Rule, Detail (the `upgrade_changes` row text, including the stated value and its source handle), Status ("configuration only, capacity not checked" for steel joints).

**Three files:**
1. **PJAM rebar:** `JPAM_rebar.db`, prefix `GEN-RB`, IFC2X3, their site frame. The frame is the same as the delta IFC: combined DB frame + measured shift = their shared coordinates, their IfcSite placement and storey elevations. Overlays their STR model.
2. **PJAM gussets:** `JPAM_gussets.db`, prefix of the generated gusset parts, IFC2X3, the same frame. It holds 1 joint, as built.
3. **Shed rebar + welds:** `SHED_rebar.db`, prefixes of the rebar sets and welds, IFC4, the DB frame. The Shed has no authored IFC with a site placement. Its frame is checked against the Modeller's own IFC export of the Shed.

**Witnesses (`§PIFC_*`, per file):**
- ROUNDTRIP: reopen with ifcopenshell; counts per class = DB counts; GlobalIds unique; `ifcopenshell.validate` 0 errors.
- FRAME: PJAM, each exported part's bbox within its host element's bbox from THEIR OWN IFC, + cover tolerance; Shed, against the Modeller IFC's host.
- VALUES: every NominalDiameter = the set's stated diameter.
- DETERMINISM: two exports, same SHA-256.
- INCONCLUSIVE if 0 exported.

### §9 RESULT 2026-11-18 (BUILD 5, generic `scripts/lod/export_parts_ifc.py`; private frame file and outputs, not committed)
**Headline: both PJAM add-on IFCs pass every witness and are byte-identical on a second export. The Shed IFC now passes MESH and SOLIDS (weld winding fixed 2026-11-18, §6 item 7) and is byte-identical on a second export; its frame check against the Modeller IFC still FAILS, because that IFC is an older build than the DB (open, not touched).**

**File 1, PJAM rebar** (IFC2X3, their frame; 46,734,172 bytes; SHA-256 `72c67a8805673ff1…`; run 2 identical):
```
§PIFC_SELECT schema=IFC2X3 elements=306 classes={'IfcReinforcingBar': 306} frame=given
§PIFC_TRACE elements=306 with_ADDED_row=306 untraced=0 -> PASS
§PIFC_MESH components_closed=5349 open=0 wound_inward_flipped=0 degenerate_triangles=0 -> PASS
§PIFC_ROUNDTRIP counts={'IfcReinforcingBar': 317} db_elements={'IfcReinforcingBar': 306} extra_parts_from_splitting_mixed_diameter_elements={'IfcReinforcingBar': 11} globalids=966 unique=966 validate_errors=0 -> PASS
§PIFC_SOLIDS breps=5349 invalid=0 -> PASS
§PIFC_VALUES parts_checked=317 mixed_diameter_elements_split=11 mismatches=0 -> PASS
§PIFC_VALUES_MIX mixed_elements=11 with_all_bars_placed=11 bars_per_diameter_from_mesh_equal_stated_counts=11 -> PASS
§PIFC_VALUES_MESH bars_measured=5349 mesh_thickness_over_stated: min=0.9999 max=1.0002 outside=0 -> PASS
§PIFC_BARLEN elements_with_stated_length=214 measured_vs_stated_mm max=1.500 median=0.235
§PIFC_SITE site_matrix_max_dev=1.40e-09 storeys=4 elevation_max_dev_m=1.33e-15 -> PASS
§PIFC_FRAME_FILE parts=306 file_vs_db_bbox_mm max=0.0007 -> PASS
§PIFC_FRAME_HOSTS hosts_named=92 found_in_their_ifc=92 their_host_vs_ours_bbox_mm max=0.014 over_tol=0 by_host_class={'IfcBeam': (92, 0.014)} -> PASS
§PIFC_FRAME_INSIDE parts_compared=306 overshoot_beyond_host_bbox_mm max=0.000 over_tol=0 tol_mm=1.0 -> PASS
§PIFC_FRAME_KERNEL sample=12 hand_bbox_vs_geometry_kernel_mm max=0.0000 -> PASS
§PIFC_DETERMINISM (run 2) this=72c67a8805673ff1 expected=72c67a8805673ff1 -> PASS
```
**File 2, PJAM gussets** (IFC2X3, their frame; 65,462 bytes; SHA-256 `1507ee24cdfd7af0…`; run 2 identical): 1 joint = IfcElementAssembly 1 + IfcPlate 1 + IfcMechanicalFastener 1 + IfcFastener 1; ROUNDTRIP PASS (validate_errors=0, GlobalIds 20 unique), SOLIDS breps=13 invalid=0, VALUES PASS (M20), FRAME_FILE max 0.0006 mm, FRAME_HOSTS (brace + support, both found) max 0.000 mm, FRAME_INSIDE max overshoot 0.000 mm, DETERMINISM PASS.
**File 3, Shed rebar + welds** (IFC4, DB frame as is; 3,130,014 bytes; SHA-256 `a3a67047433764b8…` after the weld-winding fix of §6 (was `7d2c878374fd0740…`); run 2 identical). `SHED_rebar.db` for this file has sha256 prefix 504440a5f5b0256c:
```
§PIFC_SELECT db=SHED_rebar.db prefixes=['GEN-RB-', 'GEN-WD-'] schema=IFC4 elements=594 classes={'IfcFastener': 338, 'IfcReinforcingBar': 256} frame=DB frame as is
§PIFC_TRACE elements=594 with_ADDED_row=594 untraced=0 elements_with_more_than_one_ADDED_row=0 -> PASS
§PIFC_MESH components_closed=2116 open=0 of_which_every_edge_has_2_triangles_but_winding_inconsistent=0 wound_inward_flipped=0 degenerate_triangles=0 -> PASS
§PIFC_ROUNDTRIP counts={'IfcReinforcingBar': 256, 'IfcFastener': 338} db_elements={'IfcReinforcingBar': 256, 'IfcFastener': 338} extra_parts_from_splitting_mixed_diameter_elements={} expected_in_file={'IfcReinforcingBar': 256, 'IfcFastener': 338} globalids=1792 unique=1792 validate_errors=0 schema=IFC4 -> PASS
§PIFC_SOLIDS facesets=594 invalid=0 {} -> PASS
§PIFC_VALUES parts_checked=256 mixed_diameter_elements_split=0 mismatches=0 (NominalDiameter read back from the file vs a diameter stated in the element upgrade row) -> PASS
§PIFC_VALUES_MESH bars_measured=1440 mesh_thickness_over_stated: min=0.9242 max=1.0000 allowed=[0.9139, 1.0100] outside=0 -> PASS
§PIFC_BARLEN elements_with_stated_length=96 measured_vs_stated_mm max=0.039 median=0.006 (mesh volume / 8-gon area vs the length in the upgrade row)
§PIFC_FRAME_FILE parts=594 file_vs_db_bbox_mm max=0.0005 over_0.01mm=0 -> PASS
§PIFC_FRAME_HOSTS hosts_named=399 found_in_their_ifc=399 missing_in_their_ifc=0 not_in_our_db=0 compared=399 their_host_vs_ours_bbox_mm max_xy=36591.896 max_all_axes=36591.896 over_tol=335 by_host_class_max_mm={'IfcColumn': (95, 15265.403), 'IfcDoor': (1, 36253.075), 'IfcFooting': (32, 0.028), 'IfcMember': (156, 36591.896), 'IfcPlate': (114, 36576.021), 'IfcSlab': (1, 36398.201)} rotated_x_or_y_hosts=0 tol_mm=1.0 -> FAIL
§PIFC_FRAME_INSIDE parts_compared=594 parts_without_a_host_found=0 overshoot_beyond_host_bbox_mm max_xy=36553.796 max_all_axes=36553.796 over_tol=434 by_first_host_class_max_mm={'IfcColumn': (189, 15200.003), 'IfcDoor': (1, 35589.638), 'IfcFooting': (64, 0.0), 'IfcMember': (147, 36553.796), 'IfcPlate': (190, 36553.796), 'IfcSlab': (3, 112.399)} tol_mm=1.0 worst=GEN-WD-0DDMR1SOBMDZnIWMAAAAEh-A-3prXnlPstzIrqfkvAAAAGW -> FAIL
§PIFC_FRAME_KERNEL sample=12 hand_bbox_vs_geometry_kernel_mm max=0.0000 -> PASS
§PIFC_DETERMINISM (run 2) this=a3a67047433764b8 expected=a3a67047433764b8 -> PASS
```
**Break run** (`PIFC_BREAK=1`, every part written 10 mm off in x, gussets): `§PIFC_FRAME_FILE file_vs_db_bbox_mm max=10.0001 -> FAIL`, verdict FAIL, as it must. FRAME_INSIDE still passes in that run: it tests containment in the host bbox, so 10 mm of shift inside the cover is not seen by it. FRAME_FILE is the witness that sees a shift.

**What the numbers say:**
- **PJAM frame is exact.** Their host beams vs ours: max 0.014 mm over 92 hosts (rebar) and 0.000 mm (gusset brace and support). The shift used is the measured one of the delta IFC; it was re-measured on 12 rebar hosts (spread 0).
- **Rebar values are consistent three ways:** NominalDiameter read back = stated diameter on all 317 parts; the measured bar thickness is 0.9999-1.0002 of it on all 5349 bars; BarLength from the mesh volume agrees with the length in the upgrade row within 1.5 mm.
- **Shed welds (fixed 2026-11-18).** The first export found all 676 weld beads (338 welds x 2) closed but inconsistently wound (`§PIFC_SOLIDS invalid=338`); the defect was in the build-3 weld generator (end caps wound inward), not in the export. Fixed in `rebar_from_schedule.py` (§6 item 7); re-exported with the same arguments: MESH components_closed=2116 open=0, SOLIDS invalid=0, validate_errors=0.
- **Shed frame check FAILS against `ShedDrawing_512.ifc`.** Footings match to 0.028 mm, but columns (up to 15.27 m), members and plates (up to 36.6 m) do not: that IFC is the 19 Oct build (`ShedDrawing_512_extracted.db`, 512 elements, column 668.89 / -95.85) while `SHED_rebar.db` derives from the 15 Nov export (`SHED_extracted_2026-11-15.db`, same column at -111.12). It is not only stale column tops. No IFC of the 15 Nov export exists on disk, so the Shed frame is proven only on its 32 footings (64 footing-bar parts overshoot 0.000 mm).

**Deviations from §9 and why:**
1. **11 PJAM beam elements hold bars of two diameters** (e.g. `14T25 + 6T20`). IFC2X3 IfcReinforcingBar requires one NominalDiameter, so one DB element becomes one IfcReinforcingBar per diameter: 306 DB elements give 317 IfcReinforcingBar (+11). Each bar is assigned to a stated diameter from its measured thickness; per-diameter bar counts equal the stated counts on all 11 (`§PIFC_VALUES_MIX`). A first export left the diameter unset and produced 22 schema errors, so it was not kept.
2. **FRAME tolerance is 1 mm (the frame accuracy), not the cover tolerance**: stricter, chosen before the runs.
3. **Gusset hosts = the brace plus the support named in the upgrade row text**; Shed welds likewise the member plus the named plate.
4. **Shed frame check verdict is over x/y only** (`--frame-axes xy`, as the spec allows). The 15 Nov / 19 Oct mismatch above is large in x/y too.
5. **Steel grade:** the Shed rebar carries `fy 500 MPa (stated)` from the host's `Note_fy_MPa` (513 occurrences in the file); every other part says "grade not stated".
6. GlobalIds use the fixed UUID5 namespace of the delta IFC, so a part has the same GlobalId in every add-on file.

**Files (private, not committed):** frame `~/Projects/Jebel/lod_sandbox/ifc_delta/pjam_frame.json`; outputs `~/Projects/Jebel/reports/send_2026-11-18/PJAM_rebar_addon.ifc`, `PJAM_gussets_addon.ifc` (+ `run2/`), `~/Projects/SYSNOVA/DXF2BIM/ShedDrawing/lod/SHED_rebar_welds_addon.ifc` (+ `run2/`); logs `ifc_delta/log/pifc_rebar.log`, `pifc_gussets.log`, `pifc_gussets_break.log`, `*_run2.log`, `lod/log/pifc_shed.log`, `pifc_shed_run2.log`.
