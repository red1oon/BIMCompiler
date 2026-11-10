<!-- Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com> · SPDX-License-Identifier: MIT -->
# ⚠ DO NOT REMOVE — MODELLER MASTER: the single entry point for "make the Modeller work"

```
SCOPE: the DAGeVu Modeller (bim-ootb `modeller/*`) as a WHOLE — every objective below must be met, not
a subset. This file is the INDEX + CONTRACT; the 15 per-topic files it triages stay authoritative for
their own detail. Read the log after every run (Log Mandate). Read the §PRIME LESSON before any
diagnosis. Created 2026-07-30 at the user's instruction: "triage the modeller prompts/# consolidate
them to some master prompts/# ... so that with that prompt we be launching a dedicated session to
study deeply how to make the Modeller work", and "all the objectives of the Modeller must be met.. as
i have no time to sight, i rely on a good vibe coder to do so."
```

## ⚖ §STRATEGY-ASSEMBLE-HANDOFF — the governing product direction (red1 2026-09-27). Ranks everything below.
> *"Our strategy is to leave fine detail creative authoring to those models that users are familiar with but to bring to
> us to assemble and hand off all the rest."*

**The true parametry is ours (red1, same day: "able to take any created model, those aesthetic bits and we refine it
more better").** Authoring tools hold parameters only for what the author typed in; we EXTRACT the grammar from any authored
model — BOM sets, bay ratios, storey heights, MEP densities, host↔filling relations — keep its aesthetic parts at LOD400, and
refine from that grammar. This is the Red Pill / "New from Reference" idea already written up: `docs/RED_PILL.md` §1 and
`docs/internal/NEW_FROM_REFERENCE.md` §1 (IFC → SQLite → verified reconstruction is the inverse; grammar → refined design is
the forward path). The Modeller is NOT a creative authoring tool. Users author in Revit/ArchiCAD; the Modeller must do three things well:
1. **IN — faithful import:** authored LOD400 geometry and relations survive (openings, fills, layers, anchors). A user's OWN
   IFC must get what the residents get — ~~whether the local-IFC open path writes `rel_fills_host` is UNVERIFIED~~ MEASURED + BUILT 2026-11-02 (P-X, §RESUME 2026-11-02).
2. **ASSEMBLE — edits on authored parts:** walkers generating MEP, BOM assembly, grid stretch, slide/insert openings,
   copy/array along a host, the universal handle set (§SLOPE-HANDLES) along measured build lines.
3. **OUT — hand-off:** IFC export carrying storeys, Psets, materials (§IFC-EXPORT-DEPTH), plus 4D/5D and ERP.
**No original object making (red1, same day: "we dispense off with original object making. We take any object and mould
it further").** Every object in the Modeller starts as an existing authored object — from a resident, a user's IFC, or the
extracted catalog/BOM libraries — and is MOULDED (stretch, slide, cut, copy, handles). Decided consequences:
- The Sketch tool (`#b-sketch`, `bonsai_sketch.js` + planegcs) is the LIFEBELT (red1: "we may create basic design from scratch,
  but it is just a lifebelt"): basic from-scratch design when no source object exists. Keep it working (its witnesses stay
  green); fix it when it breaks; do not grow it toward a full authoring tool — the main path is always mould-an-existing-object.
- **A sketched object is a PLACEHOLDER that a final crafted object replaces** (red1: "it can be a placeholder, where a final
  well crafted object replaces it"). This does NOT reopen the no-box rule: that rule bans a box SILENTLY standing in for
  missing geometry. A placeholder is DECLARED — created deliberately by the user, flagged on its op (`placeholder:true`),
  visibly marked, counted apart from LOD400 elements, and tagged as a placeholder on export. Automatic fallbacks stay refused.
- **REPLACE verb (not built — measured 0 hits for replace/swap in modeller/):** swap a placeholder (or any object) for a
  crafted one from any source as ONE signed op, keeping its placement and relations (host, fills, cuts). Queued after
  insert-with-opening, which it shares code with.
- A catalog product with no real source mesh is not an object to mould ⇒ insert REFUSED, never a box (answers the row-14
  question: rebind from the extraction source in the restored BOM libraries; what cannot be rebound stays unavailable).
- Insert-with-opening = place a COPY of an existing authored door/window (any source) into a wall, cutting its opening.
- The slide witness's sketched-wall case (S8 plain-extrude) is not a priority case.
**Out of scope (do not list as gaps):** from-scratch wall drawing, type/family editing, dimension constraints, stair/railing/
curtain generators, documentation sheets, generative layout from constraints (red1 2026-10-02 — see row 40).
**Queue, in order (decided 2026-09-27):** (a) §SLIDE-REAL-WALLS Phase B (in progress) · (b) §IFC-EXPORT-DEPTH — the OUT half is
thin today (products carry geometry + class only) · (c) IN-check: open a third-party IFC locally and measure that its
openings/fills/storeys survive · (d) insert-with-opening · (e) §SLOPE-HANDLES · (f) row 14 catalog rebind from the restored
`library/DX_BOM.db`/`SH_BOM.db` (May 22 backups, restored locally 2026-09-27).

## 🔎 §VISION-REVIEW 2026-09-28 — every shipped Modeller feature vs §STRATEGY-ASSEMBLE-HANDOFF (asked by red1)
Inventory: bim-ootb main toolbar (28 buttons) + 39 `modeller/*.js` modules, read 2026-09-28.
**Aligned:** Open (IN) · grid drag + openings anchor/ride (ASSEMBLE) · move / multi-select / snap · item drag + host snap ·
room move · walkers generating MEP from mined patterns, LOD400-or-refuse · Cut on authored walls · Insert library component
("assemble, don't draw") · Save + gate · Export (OUT, but thin) · World History / Connect / Teams (process + future sharing) ·
X-ray. Red Pill "New from Reference" (grammar → design) is the vision itself, not object making.
**CONFLICTS (fix):**
- C1 **LOD button (`#b-lod`, 200⇄300) + `lodFor(...,'200')` default** — LOD200 IS the box; the rule is LOD400 or refuse. The
  insert path still starts every catalog component as a box (`foldInsert` `boxArrays(c.bbox)` unless lod==='300').
  → retire the 200 state; an insert shows its real mesh or is refused (same fix as row 14 / §CATALOG-REBIND).
- C2 **ModellerGuide.md:216** tells users an insert "lands as a LOD-200 box that lazily refines" — the doc teaches the
  banned fallback. → rewrite with C1.
- C3 **Scale handles + typed `x1.5` (`GEOM_SCALE`) stretch ANY insert's mesh**, incl. real authored doors/furniture —
  that distorts authored geometry (a 1.5× door = a stretched door, not a wider real door). OK for plain extrusions (a wall
  lengthens = more wall), wrong for crafted objects. → gate scale to plain-extrusion hosts; crafted objects are
  REPLACED (the REPLACE verb) or edited via measured handles, never stretched.
**DRIFT (outside the vision, keep as lifebelt, do not grow):** Sketch/Extrude/Constrain (documented as the main way to
"draw a wall" in the guide — relabel as the lifebelt/placeholder path) · Fillet (fine creative detail) · Route sweep
(`#b-route`, manual MEP drawing — the walkers are the main path). None is flagged `placeholder:true` yet (the declared-
placeholder rule is not built).
**REDUNDANT / OVERLAPPING:**
- R1 §SLOPE-HANDLES vs the SHIPPED gizmo handles (MODELLER_DIRECT_MANIPULATION.md P1/H2/H3: move axis, rotate ring, scale
  cubes, snap) — the universal handle set must GENERALISE these, not add a second handle system.
- R2 Routing: `modeller/routewalker.js` + `viewer/routewalker.js` (duplicate, handed to Viewer lane) + `disc_walker.routeChains`
  + manual `#b-route` — four ways to make a run; one engine should own it.
- R3 Five outliners (`bonsai_outliner`, `bom_tree_outliner`, `building_parts_outliner`, `dw_instances_outliner`,
  `str_walker_outliner`) — row 5's incremental unification call stands; not re-litigated here.
**Vision now answers an old blocked row:** row 29 (`CONSTRUCTION_GRID_BOM_DUAL_MODEL.md`, grid ⊗ BOM as one substrate,
"is this still the intended architecture?") — the extracted grammar (BOM sets + bay ratios + grid) IS "the true parametry
is ours" ⇒ aligned; move it from ⛔ to the queue after the catalog rebind.
**Queue impact:** C1+C2 join row 14 (catalog rebind) and move up — they are live no-box violations, ahead of §SLOPE-HANDLES.
C3 lands with the REPLACE verb.

## ▶ §RESUME 2026-11-09c — START HERE (the one entry point; older resume blocks are archived, see the note below the specs)
**State at close, 2026-11-10 (bim-ootb main `d6054ce0`, modeller sw v268).** Every item below was merged, then verified at its merged head.
**Landed this session (bim-ootb):**
- #2753 a Walked Fixtures type row selects + frames its whole set; the category scrolls into view after a walk; class rows show counts (W-E2E-TYPESET-ZOOM 9/0).
- #2754 W-UX-DISC waits for its log line (8/0; its 3 reds were a timing artifact).
- #2756 + #2758 a walked leaf is framed at a visible size from the side it FACES: the walker writes `face` where it decides facing (schedule `rot`, shim BOTTOM/TOP/SIDE); close-ups stay inside the space the device faces (W-E2E-SINGLE-FRAME 9/0).
- #2759 §12a borrowed band re-anchor targets must contain an IfcSlab (owner "Contains a slab"; W-BAND-REANCHOR 12/0). Private set: 3 reference levels now `notFloor`.
- #2760 + #2762 the walk build-up runs on rendered time and is held until the walk's commit is done (W-E2E-REVEAL-CLOCK 5/0).
- #2763 + #2764 walker rules readable/editable as JSON: toolbar "Rules" → the project's ONE JSON editor, now `common/settings_editor.js`; edits are cells re-applied on every open, Reset, Download (W-E2E-RULES-EDIT 7/0). Spec bim-ootb `prompts/MODELLER_RULES_EDITOR.md`.
**Films:** `~/Videos/HVAC_FP_Walker_In_Action_narrated_EN_2026-11-09.mp4` (narrated EN, `FILM_NARRATION.md` §WALKER-FILM); silent take `~/Videos/Modeller_Walk_HVAC_FP_BeforeAfter_2026-11-09.mp4`. Recorder `scripts/film_modeller_walk.js` (spec §FILM-WALK-BEFORE-AFTER below). Private inputs (neutral-name copy, takes, narration parts) in the private walk folder `film_ba/`; never commit them.
**New 2026-11-07: §EDIT-REPORT (row 41) slice 1 LIVE, one grid move (bim-ootb #2674, sw v233). Spec and RESULTS at the end of this file. Later slices need red1's go.** **The proposer-test lane built on it resumes from `NEURO_SYMBOLIC_ORDER_CONTRACT.md` ▶ RESUME HERE.** *(carried from `master`, 2026-11-07, merged into this file 2026-11-10)*
**🤝 Design-lane inputs (handshake with the design / BIM Document lane, agreed 2026-11-10; this lane writes and keeps this block, the design lane adds one line here, or messages this lane, whenever it hands over a spec; specs stay in their own topic files; no project or client names):**
- **§12 Project inputs pre-processor**, bim-ootb `prompts/DISC_WALK_DRAWN_INTEGRATION.md` §12 (spec, design lane 2026-11-10; build = this lane). **Order of trust:** model → issued document → owner-stated row → named code default → borrowed/generated (always provisional); a lower step never overrides a higher; two sources disagreeing = `§INPUTS-CONFLICT`, neither applied.
- **One queue, in this order** (all under that order of trust):
  a. SampleHouse rooms from its own IFC (`IfcSpace` ×4, already in `SampleHouse_extracted.db`) → a generated section of its self-heal patch. A `WalkerDoctrine.md` §14 defect ("rooms are auto-infused into every ARC": extract `IfcSpace` when present). First. Detail: §NO-MESH-RESIDENTIAL below.
  b. The mesh miner (`build/project_rule_mesh_binding.py`) binds WITHIN the discipline the extraction records. A discipline with no real mesh for a class gets a gap row under (e), never a mesh from another discipline (`WalkerDoctrine.md` §11).
  c. §12b `element_pset_native` in the shared extractor (standard non-`Common` sets + the authoring tool's own sets; `native_unit_map` / `native_prop_map` are data rows; an untyped value with no unit row → `value_si` NULL, `unit unknown`). Census: Revit electrical data only on Duplex, HHS Office and WBDG Office (8 of 122 source IFCs), so the circuit/load first consumer is witnessed on Duplex MEP.
  d. §12a register gate: CO = placed, IP = provisional and out of totals, DR/RE = refused, no status = provisional. **Not blocked:** the tool path takes `--register=<json>`, so build and witness it now with a JSON fixture; only the later in-browser UI needs the BIM Document rows + the sha256 file-store route. The register EXPORT (ERP rows → JSON) is owned by the BIM Document lane, not this lane: its NEXT item in BIMCompiler `prompts/ERP_IDEMPIERE_UX_PARITY.md` ▶ RESUME HERE (BIMCompiler #500), an AD_Process under the BIM Document gear, JSON `[{no, rev, status, discipline, filekind, sha256, name}]` = the latest revision per deliverable plus the superseded rows (so this lane can log `§INPUTS-SUPERSEDED`). Until it ships, build (d) against a JSON fixture of exactly that shape. The register's discipline codes (ARC, STR, MEP, ELE, FPR, CIV) map to walk disciplines through ONE data row set, never code.
  e. §12c gap report `input_gap` / `§INPUTS-GAP`, reasons: `no rooms in model`, `no real mesh for class` (from a, b), `unit unknown` (§12b), `conflict` (§12a/b), plus §12c's own `not in model` / `no issued sheet`.
- **Seams to keep (do not break from this lane):** (1) BIM Document "Open" → the Modeller's open route + `common/file_store.js` (bim-ootb #2747; §BIMDOC-OPEN in the archive); §12a's later UI fetches register bytes through the same route. (2) The object layer, BIMCompiler `prompts/NEURO_SYMBOLIC_ORDER_CONTRACT.md` §0.5 + §0.8 (deferred): "Modeller edits through the object engine" would change how every Modeller edit is written. Read it before changing the edit write path. Its dictionary patch is on the Viewer's `buildings/Duplex_extracted.db` (#2772/#2778), the same DB the mesh miner reads (rows added only; no conflict measured).
- **⛔ Q9 (owner decides), SampleCastle has no rooms, a band row was measured from a MIX of devices:** design-lane advice now *proportional allocation*: the row's own source meshes are allocated in proportion to the measured mix (deterministic largest-remainder, stable order), so placed counts per mesh equal the row's mix. Each placement stays provisional (step 5), carries `meshFrom=<source guid>` and `mix=<k of N>`, is never shown or counted as an identified device, and stays out of totals. (Plain "in turn" was withdrawn: it gives each distinct mesh equal counts, which falsifies the measured mix.) If the owner wants no per-device claim at all: the doctrine fallback is the §11 bbox wireframe labelled with the mix.
**4D answer (owner asked):** `4D_MODEL_INTEGRITY.md` §SHIM-FACING. The shim face does not fix "midair" (that is schedule ORDER: the elected support is scheduled later); it can feed a §C ruling.
**⛔ Owner decisions open (ask one at a time):**
1. §C: "a hung element's work follows its carrier's task" (262 of 3,065 midair on Terminal).
2. Other language versions of the walker film.
3. Band density (borrowed counts give no location); extend `unhosted` to non-ceiling hosts?
4. Provisional devices still counted by the 4D schedule, `egress_sanity.js`, `rule_report.js`, offline `mep_qto_populate.js`.
5. Export a drawn run as an Axis-only IfcDuctSegment (no Body)?
6. Remove `build/disc_walker.js` (nothing reads it); gate ELEC like the others (it still reaches `planTrunk`).
7. A user-facing way to supply sheets on an opened building (mains spec §7 Q2).
**⚠ Review the new rules JSON against the other building models (owner, 2026-11-09: "Since the JSON is newly constructed, should we put a note that it be reviewed against the other building models?"):**
- The JSON VIEW is new, the values are not (it shows the shipped tables). Proven only on Duplex (`duplex_rules.db`, W-E2E-RULES-EDIT) and the private set (`terminal_rules.db`, the film still). Not yet opened on `farm_rules.db` or any other resident. Review = open it on every resident, and check that open-and-close with no edit leaves every walk byte-identical.
- An EDIT is per building TYPE, not per building: one cell changes every building of that class. Before an edit is trusted or contributed: re-walk the other buildings of that class (the fleet table, W-BAND-NO-HOST §7 method) and state what moved. Proposed: the editor's header says "these rules are shared by every <class> building"; the downloaded edit file carries `checkedOn: [buildings]`, empty until a fleet check fills it.
**✅ DONE 2026-11-10 ⛔8 answered (owner: "Go with your take") — an edit applies wherever its file is read (room-schedule source, FP borrow), header names those readers: bim-ootb #2779 merged `d6054ce0`, sw v268 (W-RULES-CLASS 9/0 + readers 4/0; RED on main held 0.85 / 172). Measured: no public resident serves a room from the schedule source (spaces=0 on HHS, Clinic, Terminal).**
**✅ DONE 2026-11-09 (a)(b)(c) — bim-ootb #2776 merged `a751e458`, modeller sw v267** (spec + RESULT: bim-ootb `prompts/MODELLER_RULES_EDITOR.md` §CLASS-SHARED). Header names the loaded file's class (`WalkRules.classOf`; a bug where farm said "terminal" was found and fixed); download carries `checkedOn: []`; W-RULES-CLASS no-edit sweep green on 6 of 8 residents (SampleHouse VACUOUS: page refuses all, no LOD400 mesh; HospitalGarage INCONCLUSIVE: headless tab died before the editor opened, twice); `modeller/tests/rules_edit_fleet_check.js` walks every READER of a file (own / schedule source / FP borrow) and fills `checkedOn`; W-RULES-FLEET 4/0 (one cell on Duplex moves exactly its 6 devices, nothing on the other 7 readers).
- **New measured facts:** Walk ALL skips services already present (a Walk-ALL re-walk judges nothing). A re-walk of the same services moves a few devices for 2-3 rounds before it settles (Duplex: 2/5/2, then 1/1/1, then stable), with no rule changed: a user who walks again sees devices move. Not traced.
- ~~**⛔ Owner question 8:**~~ ANSWERED 2026-11-10, built #2779. Was: a live edit reaches only buildings whose OWN rules are that file; terminal buildings read `duplex_rules.db` room schedules (and residential ones borrow `terminal_rules.db` FP) WITHOUT the edit. Should a live edit also apply there? Today: no; the fleet check reports both.
**✅ DONE 2026-11-09 the Modeller user guide** — BIMCompiler #490 merged `e68c872d`, published via `safe_gh_deploy.sh` (guard PASS, canaries 200, live page + 3 new images fetched back 200). Added: Rules editor (with type-shared header, `checkedOn`, fleet check), Walked Fixtures type set + device close-up, build-up after commit, provisional devices. Re-measured the walk table on sw v267 from `§DISC-WALK` lines: Duplex ACMV 19 / ELEC 102 / PLB 18 / FP 0 + 38 provisional; **SampleHouse and SampleCastle now refuse ELEC and PLB (no real mesh)**, so the old hero caption (270 SampleCastle ELEC) was false and is replaced with a Duplex frame. The three older tables (2026-06-28 logs) are marked dated, not re-run. Left as is, true to code: the LOD-200 insert line (~L214), because the insert still starts as a box (`bonsai_library.js:457`); §VISION-REVIEW C1 stays a CODE item.
- **New question this raises (for the owner, with ⛔ 8):** the residential walk now places no ELEC/PLB on 2 of its 3 buildings, because the catalog has no real mesh for their classes. Is a catalog rebind (row 14) the next priority, ahead of the buildable list below?
**🔎 §NO-MESH-RESIDENTIAL — DIAGNOSIS 2026-11-10 (owner: "Go with your take on both" → mesh gap first).** Why SampleHouse/SampleCastle get no ELEC/PLB:
- The gate's own lines (`§DW-LOD400-REFUSE`, probe on main `a751e458`): every placement reaches it with **no mesh hash** (SampleHouse ELEC `FlowTerminal(no hash)×14 …`, SampleCastle ELEC 269, PLB 72). Duplex: same devices carry a hash, `lod400=102`.
- Cause: Duplex walks from ROOM SCHEDULES (its `spatial_structure`, 26 rooms); a schedule row carries its device's own mesh (`disc_walker.js` ~L702). SampleHouse/SampleCastle have no rooms, so they walk MEASURED BANDS, whose mesh comes from `rule_mesh_binding` (~L859), and **`duplex_rules.db` has no `rule_mesh_binding` table** (`terminal_rules.db` has 13 rows).
- The miner exists (`build/project_rule_mesh_binding.py`, generic) and was never run for the residential rules. Run on a scratch copy against `bim-ootb/buildings/Duplex_extracted.db` (904 MEP): 10 bindings, plus `z_datum_offset=0.016` and `rule_frame_ref`. **Not shippable:** it binds by class and ignores discipline, which the extraction records (ELEC 81 / PLB 14 terminals, all fittings, segments and valves `MEP`). So PLB fixtures would get an electrical receptacle mesh and ELEC controllers a 50 mm ball valve. Several bindings are 1-of-N ties (segments 1/427).
- Per band row, the row's own `src_guids` are a MIX (Level 1 ELEC: receptacle, refrigerator, sconce); most rows' mode is a 1/5 tie.
- Rooms in the source IFCs: **SampleHouse 4 `IfcSpace`** (Living room, Bedroom, Entrance hall, +1; `internal/sources/Ifc4_SampleHouse.ifc`, also `bim-ootb/IFC/SampleHouse_ARC.ifc`), dropped by the extraction. **SampleCastle 0.**
**Take (buildable):** (1) SampleHouse: recover its 4 rooms verbatim into its self-heal patch (precedent: `patches/Terminal_ARC.db.sql` restores 79 `spatial_structure` rows), so it walks from schedules with each device's own real mesh. (2) Fix the miner to bind within the discipline the extraction records; a class with no instance of that discipline gets no row (refuse).
**▶ NEXT, buildable (take (1), SampleHouse rooms), measured 2026-11-10:** the 4 rooms are already extracted verbatim in `bim-ootb/modeller/SampleHouse_extracted.db` `spatial_structure` (Living room c=(−3.08,1.58,1.25) s=9.31×5.66×2.5; Bedroom; Entrance hall; Roof c.z=3.0); `SampleHouse_ARC.db` has no `spatial_structure` table. Room extents [−7.73,6.12]×[−1.25,4.41] line up with the ARC walls (x 6.24, y 4.55, y −1.22). Raw element centres differ between the two DBs (the extracted DB stores placement origins), so the witness must prove the frame, not assume it. Patch convention: `patches/SampleHouse_ARC.db.sql` is GENERATED ("regenerate, do not hand-edit", `scripts/gen_rel_fills_host_patch.py` + an aggregates section): add the rooms as a generated section (generator reads the extracted DB, `CREATE TABLE IF NOT EXISTS` + `INSERT OR IGNORE`), not a hand edit. Witness, RED on main: SampleHouse ELEC/PLB walk from schedules (`prov sched:space-schedule:*` > 0), every device inside its room box, `§DW-PRIM-LOD lod400` > 0, Duplex unchanged. Watch: space typing of "Living room / Bedroom / Entrance hall / Roof" against the residential schedule types (`typedNoSchedule` count in the log).
**⛔ Owner question 9 (SampleCastle, no rooms in its IFC):** moved into the 🤝 Design-lane inputs block above (with the design lane's proportional-allocation advice; the earlier "(b) in turn" advice is withdrawn).

**Buildable next, in order:**
1. Re-measure the private wall-alarm residual on main (predicted: the 13 above-slab alarms now `noTarget`).
2. Toolbar crowding: at 1,440 px every Modeller toolbar button is 14 px wide (41 px at 1,920). Measured, untraced.
3. Export gaps, spec §EXPORT-ROUNDTRIP below: GUIDs regenerated, `material_name` NULL, IfcWallStandardCase written as IfcWall, 0 storeys, no routed runs.
4. Reds on main, untraced: W-E2E-ZOOMSEL K5/K7, W-SCHED-SOURCE 35/1, W-BAND-NO-HOST P3, `tests/test_json_to_schema.js` (missing `viewer/initbubble.json`), W-MEP-OPENPATH M5/M7, W-DISC-DENSITY D3.
**On HOLD (red1):** §THREADS step 2 scoped undo (branch `wip/history-threads-scoped-undo`), §DOC-THREADS / §ADHOC-WF-BATCH, row 40 scripted edits.
**Method that worked this session:** spec section first; witness run RED on main first (several "fixes" were caught as vacuous only because of it); privacy grep on every diff and PR body; one look at a still for layout only, numbers from § lines; GPU takes under `flock gpu.lock` after `nvidia-smi`.

## §MESHBIND-DISC SPEC (2026-11-10, queue item (b) of the design-lane inputs block; written before code)
**Issue (measured, §NO-MESH-RESIDENTIAL above):** `build/project_rule_mesh_binding.py` picks each (disc, class)'s mode hash over ALL instances of the class, ignoring the discipline the extraction records on `elements_meta.discipline`. On Duplex: PLB FlowTerminal would get an ELEC receptacle mesh. WalkerDoctrine §11: a mesh from another discipline is never borrowed.
**Rule:** the instance population for a rule row `(disc, cls)` is `elements_meta.ifc_class = cls AND elements_meta.discipline = disc`. None found = no row, logged `NO-REAL-MESH` (walker refuses). `n_total` counts the same population. No mapping table is needed: where the rules' disc name differs from the extraction's (ACMV vs generic `MEP`), the honest outcome is no row.
**Witness W-MESHBIND-DISC (`tests/witness_meshbind_disc.py`, scratch copy of duplex_rules.db + Duplex_extracted.db):** M1 every written row's `src_guids` all carry `discipline = row.disc` in the DB; M2 no ELEC/PLB FlowTerminal pair shares a hash unless the hash is genuinely shared by both populations (cross-check by query); M3 ACMV rows absent (extraction records them as MEP); M4 VACUOUS guard: at least 1 row written. RED = unmodified miner (M1 fails).
**RESULT 2026-11-10 ✅ (witness):** RED on the unmodified miner (M1 25 wrong-discipline source elements, M2 9, M3 2 ACMV rows); GREEN after (M1/M2/M3 pass; Duplex now 2 bindings, ELEC and PLB `IfcFlowTerminal`, each from its own discipline; the other 8 pairs log `NO-REAL-MESH` and the walker refuses them). Fix: `build/project_rule_mesh_binding.py` +6/−3. Not yet re-run on `terminal_rules.db` / `farm_rules.db` (their extractions are not in this checkout). The shipped `duplex_rules.db` still has no `rule_mesh_binding`: shipping the mined table (patch + loader) is the next step and needs the rules-DB patch route, not a binary commit.

## §FILM-WALK-BEFORE-AFTER SPEC (2026-11-09, owner) — the walk film shows what a walker does
> Owner, 2026-11-09: *"It should show before and after a walker lays devices. User will be clueless how this walker works. When it says x-ray, there is no lip synch to the canvas. When a walker is clicked, the visual effect is not shown to appreciate the before changing to after. Just some glimpse is good enough. At the moment it is quite sketchy."*
**Issue, measured in the recorders (code read):**
- `scripts/film_modeller_trailer.js` cuts (`jump`) from the walk click until `§DISC-WALK-COMMIT`. The build-up reveal (§D64, `_dwRevealTick`, modeller.html ~4709) draws the devices in during that window (measured on Duplex: 18/102 shown at 1.7 s, 102/102 at 9 s). So the cut removes the before→after moment.
- The X-ray beat is stamped (`§FILM_BEAT`) BEFORE the cursor glides to the icon, so its narration starts ~1 s before the canvas changes.
- The 2026-11-09 films were stills cuts (canvas grabs), not a take.
**Rule (one recorder, generic, no building name in it):** `scripts/film_modeller_walk.js <db|resident> <discs> <outDir>`, CDP screencast like the trailer, the same cursor overlay, clicks through the real UI.
1. **Open:** Open icon → local row (or resident row) → cut over the load (`§FILM_JUMP`).
2. **Per discipline, five beats, in this order:**
   - **BEFORE** (≥ 2.5 s, uncut): X-ray ON, camera on the building overview. Line `§FILM_BEFORE disc= walked=0` read from `window.__dwWalks[disc]` (absent = 0).
   - **CLICK:** the cursor glides to the Outliner row for that discipline and clicks; the ripple shows.
   - **COMPUTE:** the cut starts at the click and ends at the FIRST frame of the reveal (`window.__dwRevealMeta[disc]` set, or `window.__dwReveal[disc].i > 0`). Never at the commit line.
   - **REVEAL** (uncut, real time, until `§DW-REVEAL disc= done`): once a second `§FILM_REVEAL_FRAME disc= i= n=` from `window.__dwReveal[disc]`. The log must show i rising over ≥ 3 samples, or the beat says `§FILM_REVEAL VACUOUS`.
   - **AFTER** (≥ 2.5 s, uncut): `§FILM_AFTER disc= placed= provisional=` copied from the walk's own `§DISC-WALK <disc> placed=` line.
   - **GLIMPSE:** click that discipline's largest type row in Walked Fixtures (W-E2E-TYPESET-ZOOM: set highlight + frame), hold 2 s, Escape, back to the overview.
3. **Sync rule ("lip sync"):** a beat whose words name a state change is stamped when that state's `§` line lands AND two frames have rendered, not before the click: `§FILM_SYNC beat= line= renderLag=` (line → visible; a beat BEFORE its line is the defect; corrected 2026-11-09 from "dt < 0.5 s", which flagged the page's own draw time of 0.55 s on 2,223 glass meshes as out of sync although the words start on the visible change). X-ray: `§MODELLER xray on`. Walk: the reveal's first frame. Type glimpse: `§INSTSET-SELECT`.
4. **Visibility (law of 2026-11-09):** at BEFORE/AFTER and in the glimpse, `§FILM_VIS disc= inFrame=<instances whose centre projects inside NDC> of=<n> medianPx=<projected size>`. A beat with inFrame=0 is not presented as showing devices.
5. **Privacy (owner ruling, this session): the private take uses a neutral-name COPY.** Storey names → `Level <k>` by elevation order, building/project/file name → `Building A`, logged mapping, kept private. Room names stay (they drive the walk's space typing); this limit is stated to the owner. The walk on the copy must give the same `§DISC-WALK` placed/provisional counts as on the source (`§FILM_COPY-PARITY`).
6. **Not in this film:** a Viewer bake, synthetic markers, a section tool (owner: none).
**Witness:** the take's own log. Every beat present in order; every `§FILM_SYNC` dt in [0, 0.5); every REVEAL with rising i; every AFTER count = its `§DISC-WALK` line; `§FILM_PAGEERR n=0`. Rehearsal first on public Duplex (software GL), then the private copy on the real GPU on the owner's go.

## §REVEAL-FRAME-CLOCK — the build-up must be SEEN even when the walk's commit blocks the page (2026-11-09, found by the first GPU take)
**Issue (measured, take 1 on the private copy, log `walk_film.page.log`):** `_dwRevealTick` (`modeller.html` ~4742) advances on WALL-CLOCK time: `k = (now − start) / dur`, dur 7,000 ms. The commit runs in that window (`§DISC-WALK-COMMIT` 207 ops + `§DISC-WALK-COMMIT-DRAWN` 554 line ops), so the page renders no frame for seconds and the reveal reaches `done` before anything is drawn. The recorder's first sample came 5.6 s after the reveal began and already read i = n = 95 (`§FILM_REVEAL … rising=0 VACUOUS`, ACMV and FP). On the residents (small commits) the build-up plays; on a real building it does not. That is the owner's *"When a walker is clicked, the visual effect is not shown."*
**Rule:** the build-up runs on RENDERED time. Each tick advances by the frame gap; a stall (a gap over 4x the page's own median of its last 8 frame gaps, and over 0.5 s) counts as one 250 ms step, so a blocked stretch costs at most a quarter second and a slow-but-drawing page keeps the stated speed, and the full duration plays once frames resume. The same clock drives the assembly-part reveal. `§DW-REVEAL … done n= ms=<rendered> wallMs=<wall> ticks=<n>`.
**Amendment, measured by take 2 (#2760 merged):** the clock no longer skips (ACMV rendered 7,511 ms, 0 stalls), but the commit runs in ~1.3 s chunks, so the page drew only 6 frames in the build-up's 8 s: a steady slow rate no gap rule can tell from a slow GPU. Cause-based rule added: the build-up is armed HELD and its clock does not advance until the walk's own commits finish (`_commitDiscWalk` + `_commitDrawnMains`), then it plays; released on every exit path; `§DW-REVEAL-RELEASE disc= heldMs=`. Claim C4: the release line comes after `§DISC-WALK-COMMIT`, and no front was drawn before it.
**Witness W-E2E-REVEAL-CLOCK:** Duplex ELEC walk; as soon as the reveal starts, block the page's main thread for 3 s; then sample `__dwReveal.ELEC.i`. C1: at least 3 distinct rising values after the block (RED on main: done at the first sample). C2: the done line's rendered ms is within 10% of the reveal's dur. C3: an unblocked walk ends with the same placements and `count = dwSub.length` (nothing left half-drawn).

## §REANCHOR-NONFLOOR — FINDING 2026-11-09 (traces the walk report's floating wall alarms; generic, measured on the private set, numbers only)
**Cause, read from the walk's own `§BAND-REANCHOR` line (private log 71) + code `disc_walker.js` `_reanchorCtx` (~L720-750):** the target ladder is EVERY declared storey elevation, grouped by tol (half the source's smallest floor-to-floor, here 2.0 m). The private set declares 7 groups, and 3 of them are reference levels, not floors: top of wall/parapet (~13.8-14.2 m), a level at 36.5 m, the top of a tall element (40 m). The source's 6 floors map by order, so source floors 4, 5 and the roof land on those three. Wall-hosted band alarms then bind to the tall walls that do exist there: the 13 "more than 3 m above the highest slab" in the report.
**Measured per target group (private set):** contained IfcSlab/IfcRoof by IFC storey: ground 63, ~4-4.8 m 20, ~9-9.3 m 23, ~13.8 m **56 IfcRoof, 0 IfcSlab**, 36.5 m **0**, 40 m **98 IfcRoof, 0 IfcSlab**. Slab/roof tops within 0.5 m of the group: 43 / 17 / 14 / **0 / 0 / 0**. Within the 2.0 m tol: 66 / 34 / 22 / 88 / 0 / 0. So the answer depends on the test chosen.
**Candidate rules (owner's call; §12 is the owner's "Re-anchor + host"):**
- (a) A target level counts only if it CONTAINS an IfcSlab (IFC containment, no number). Here: ground, ~4 m, ~9 m. Source floors above the third have no target and are refused (counted `noTarget`).
- (b) A level counts if a slab/roof top lies within a margin. Needs a stated margin: at 0.5 m it gives (a)'s answer, at the 2.0 m tol it keeps the parapet level.
- (c) As today (every declared level).
Advice: (a). It is data-only (IFC containment), refuses rather than floats, and leaves public residents unchanged (they state no storey elevations, so §12 is off for them). Not built.

> Archived 2026-11-09: the superseded resume/session blocks 2026-11-10 → 2026-09-26 (and 2026-09-21, 2026-09-15) now live verbatim in `prompts/archive/MODELLER_MASTER_resume_history_2026-09_to_11.md`; what still stands is carried in §RESUME 2026-11-09c above.

## ▶ §STRATEGY 2026-09-24 — How the Modeller closes the gap: GENERATE, then EDIT MINIMALLY. (The resume blocks it once pointed to are archived: `prompts/archive/MODELLER_MASTER_resume_history_2026-09_to_11.md`.)
## Every number here was measured on bim-ootb origin/main b8f844fb on the REAL user open path.

**THE THESIS (user, 2026-09-24):** *"start with blank ARC and walk route, edit minimally, making this more
productive than normal work."* We do not try to out-draw Revit or ArchiCAD by hand. The user opens an
ARC-only building. The walkers GENERATE the structure and services from measured rules. The user corrects
the result with a few handles (grid, seed, drag), and every step is a signed op. So **an ARC-only
substrate is the INPUT, not a defect.** A gap matters only if it BREAKS THIS LOOP:

```
1 Open ARC → 2 Walk (place) → 3 Route → 4 Sign → 5 Review (gate) → 6 Edit minimally → 7 Re-walk / re-route → 8 Save / Export
```

### Where the loop stands (measured; the evidence is in "§MEP EVIDENCE" below)
| step | state | evidence |
|---|---|---|
| 1 Open | ✅ all 8 residents | Terminal opens in 20.0 s, Hospital 17.8 s, the rest < 3 s; 0 pageerror |
| 2 Walk / place | ✅ works, at scale | Terminal Walk-ALL 66 s → 4,342 MEP fixtures (774 host-bound); Duplex reproduces W-E2E-WALK-ALL exactly (185) |
| 3 Route | 🔴 **BROKEN on 7 of 8** | chainSegs 0 on every resident except SampleCastle (32, and only via a fallback) |
| 4 Sign | 🟧 fixtures yes, networks never | fixtures are signed GEOM_INSERTs, verifyChain true; SampleCastle's 32 runs are refused 32/32 (no real cross-section product, WalkerDoctrine §8) |
| 5 Review | 🟧 partial | the gate runs before commit; no "accept this walk" step (it commits at once, `modeller.html:3805/3807`) |
| 6 Edit minimally | 🟧 | move works and is signed; **undo removes ONE fixture, then the whole generated layer vanishes from the canvas** |
| 7 Re-walk / re-route | 🔴 MEP none | a grid move moves generated fixtures like plain elements; no MEP re-route hook. STR does re-walk (W-E2E-STR-REWALK-COMMIT 9/9) |
| 8 Save / Export | ✅ young | IFC export full-building since #1747; no materials, property sets, storeys or openings yet |

**Read the table as the plan.** Steps 3, 4, 6 and 7 are where "more productive than normal work" is lost
today. Everything else is either working or polish.

### ▶ LANE STATUS 2026-09-24 (executed the same day; bim-ootb branch `feat/mep-loop`, NOT pushed yet, merges at session end)
| lane | state | evidence (baseline → fix, side by side on the same tree) |
|---|---|---|
| L0 | ✅ `2e52451d` | W-MEP-OPENPATH on main: 8/5, M0 control reproduces Walk-ALL 185 |
| L1+L2 | ✅ `30f51c20` | PLB runs on the real walk: Duplex 0 → 18 · Terminal 0 → 2,893 · SampleCastle 32 → 18 (a pairing-order effect; both variants pass the correct box). Run length median 2.2–3 m, max 24.9 m. A "try next-nearest on clash" variant was MEASURED and REJECTED (Duplex 18 fixtures → 110 runs). W-MEP-OPENPATH 8/5 → 10/3 |
| L4 | ✅ `54c7cf5a` | The real Ctrl+Z after a walk used to do NOTHING to the walk (not in the history tree). Now one node "Walk PLB (23)": Ctrl+Z → 0/23 rows, layer off; Ctrl+Y → all back. W-WALK-GESTURE 2/2 → 4/0 |
| L5 | ✅ `b78f2b4c` | a 1 m move of a routed fixture re-routes 22 → 21 runs ending at its new spot; Ctrl+Z routes back (±1 mm). W-MEP-REROUTE 3/2 → 5/0. Re-routed runs unsigned (waits on L3); bend fittings not re-derived (follow-up) |
| L3 | ✅ `2ec5f1b7` (red1: "Use measured Duplex pipes") | CW = Duplex "Pipe Types:Cold Water" 25.4 mm (mains size; ½" branches nearly as common — stated simplification), SP = "Pipe Types:Waste" 48.3 mm (41/43). Runs now SIGN: Duplex 18/18, SampleCastle 18/18, Terminal 60/2,915 (existing commit cap). W-MEP-OPENPATH 13/0 | Needs ONE named CW and ONE SP pipe product. The July audit in `routewalker.js` (RW_REAL_CROSSSECTION comment) found none clean; picking one extracted Duplex pipe as "the" cold-water pipe is a data call |
| L6 | ✅ **CLOSED by red1 2026-09-24: keep PLB unattached.** | PLB → CW+SP shims agree on host (IfcWall, SIDE) but not height (CW 1000, SP 600). No change; bim-compiler W-DWWALK-HOSTBIND W4 (PLB stays unbound) remains the contract. Do not re-open without red1. |
| L7 | ✅ `2ec5f1b7` (red1: "MEP only in Walk ALL") | Walk ALL skips STR/roof (own rows stay), row reads "Walk ALL Services"; Terminal Walk ALL 81 s → 61 s |
Every lane was regression-swept against its own pre-change commit (12–15 witnesses each): no witness moved except the one the lane targets.
Recorded, not fixed: `viewer/routewalker.js` has the same vertical-post clash box at 3 sites (Viewer scope).

### THE LANES — in order. Each one closes one break, and is proven on the real open path, not a fixture.
Rule for every lane: spec first, run the baseline on unmodified main, wait on a condition, prove it FIRES on
merged main (see the 09-21 method rules).

**L0 — Land the instrument (small, do first).** Turn this session's open-path probe into a committed witness,
`W-MEP-OPENPATH`: per resident × discipline, placed / host-bound / chainSegs (and their source) / tubes / signed
GEOM_SWEEP. Instrument control built in: Duplex must reproduce W-E2E-WALK-ALL's 185. Without it, every lane
below is judged by hand. *Done when:* it runs on 8 residents and prints today's table (below) as its baseline.

**L1 — Route on the production path (the #1 break).** `_discWalkOne` always calls `dwWalk(…,{schedule:true})`
(`modeller.html:3769`). The schedule branch and the measured-band branch return early
(`disc_walker.js:~2185/~2195`), calling only `route`+`routeChains`, so the §CAMPAIGN M1 `routePattern` bridge
(`:~2281`) is never reached. Smallest step: give both early returns the same bridge fallback, and log the
empty-but-not-refused case (`§WALK-PATTERN EMPTY` — today it is silent). *Done when:* W-MEP-OPENPATH shows
chainSegs > 0 for PLB on Duplex and Terminal, and W-ROUTE-PATTERN-BRIDGE is re-run.

**L2 — Repair the bridge (decayed 55 → 0 on Duplex, July).** Bisect: #683 = 55 → #684 = 34 → 670bf0f3 (§LIVEWIRE,
07-10) = 1 → #846 = 0. Cause measured: routewalker's OWN clash-skip (`routewalker.js:~539/~687 → _rwClashesWithArc
~820`) drops ~95% of pairs (Duplex 141 with an empty envelope vs 6 with the ARC; SampleCastle 316 vs 32). It is the
mis-oriented clash box that `disc_walker.js:1474-1487` already describes and fixes only in its post-filter.
Smallest step: orient routewalker's clash box along the run axis, the same AABB `_envelopeClash` uses, then
re-measure 141 → N. W-ROUTE-PATTERN-BRIDGE (6/4, red since ≤ #846) is the witness. **L1 without L2 routes almost nothing.**

**L3 — Make a generated network signable.** `RW_REAL_CROSSSECTION` (`routewalker.js:54-60`) holds only
FP_Drop_Pipe, so every CW/SP run is refused and never enters the op-log. `component_library.db` has 3,788 Pipe and
555 Duct rows, but they are all per-instance Terminal dumps, not a reusable product. Smallest step (DATA): register
ONE measured CW and ONE measured SP pipe product, sourced from a real IFC (non-invent; name the source row).
⚠ If no clean source exists, stop and ask red1 which product to use. Do not synthesize one.
*Done when:* a user walk writes ≥ 1 GEOM_SWEEP that verifies.

**L4 — A walk is ONE gesture.** Today `Bonsai.oplog.undo()` pops one fixture ('dwwalk-<disc>-N' gids are not gesture
gids), and `doUndo`/`doRedo` (`modeller.html:3554/3565`) never call `_redrawAllDiscWalks`, so after one Ctrl+Z the
generated layer disappears (SampleCastle tubes 32 → 0, still 0 after redo). The comment at `modeller.html:586-588`
claiming undo/redo re-applies it is STALE. Smallest step: redraw on undo/redo, and treat dwwalk/dwchain/dwfit gids
as one gesture group in `_isGestureGid`. *Done when:* Walk → Ctrl+Z removes the whole walk, Ctrl+Y restores it,
tubes visible both times. (W-E2E-WALK W6 stays green only because it uses scrubTo.)

**L5 — Re-route after an edit (the O15/O16 end-state for services).** Mirror the STR wrapper around
`gridmove.commit` (`str_walker_outliner.js:918-968`): after a grid move or GEOM_MOVE touches `_dw` fids, re-run the
bridge for that discipline from the moved placements, and sign the result. Measured today: `gridmove.commit('gx0',
0.3)` on Duplex moves 18 generated fixtures, `__dwWalks`/`__dwChains` go stale, no re-route. *Done when:* a
gridline drag on Duplex moves a PLB run and its new route is in the op-log. This is also the first piece of O16's
"drag in plan → services re-route". **O15 and O16 are one mechanism; L5 is its MEP leg.**

**L6 — Host-binding holes.** PLB host-binds 0 on all 8 residents: `rule_shim` keys CW/SP, never PLB, in both rules
DBs. Smallest step: resolve PLB → CW/SP shims through the same `_RW_PATTERN_DISC` mapping the bridge uses.
Separately, schedule-path placements record no host guid (`disc_walker.js:553-563`), so Duplex's fixtures cannot be
audited bound-vs-floating. Record it; fix it only if the audit is needed.

**L7 — ⛔ NEEDS red1's OK: what "Walk-ALL" means on big buildings.** On the terminal_rules residents, Walk-ALL
includes `roof` (IfcPlate, n_measured 33,324) and STR. HHS 42,960 plates, Hospital 47,526, so 46k–67k signed rows and
90–160 s walks, mostly not MEP. Taking roof/STR out of the MEP roster CHANGES existing behaviour, so it is red1's
call, not a lane to start alone.

**NEXT after the lanes (2026-09-24):** the productivity number (generated vs edits needed), re-deriving bend fittings on a
re-route, retarget/retire W-ROUTER-NNCHAIN N4/N6 (it expects guid-carrying nn runs), the Terminal chain commit cap
(60 of 2,915 runs signed), and the Viewer copy of routewalker.js (same clash-box bug, 3 sites).

**Engine-ready but not wired (after L1-L5, not before):** space-scoped walk (pick a room → walk it;
`_discWalkOne` passes only {schedule, geoDb, avoid}, `modeller.html:3769`) and the walker guards (they exist only in
bim-compiler `deploy/dev/walker_guards.js`, 0 hits in bim-ootb's `disc_walker.js`).

### The non-MEP gaps, placed on the same loop
- **Step 6, grid residual (row 7).** Unchanged, still its own heavy session, and it must first pick 0.0939 or 0.1039 (see 09-21).
- **Step 6, what touches what.** The residual 11 is FIXED on branch `fix/xedge-3axis` @ 511c1ca1 (bim-ootb, not
  pushed yet): 11 → 0, it was the rx/ry guard 11 of 11, and the "1,301 no-blob" suspect was a hash-vs-guid unit
  error. It merges at session end. Side effect: datums 657 → 643, which bears on next-list #4 and is not claimed as a correction.
- **Step 6, Cut on a layered wall is NOT proven.** W-E2E-CUT-LAYERS is 4/1 at L3: the click selects nothing
  (fid=null), twice. It could be the witness's aim or a real defect. Measure it before the guide ever claims it works.
- **Step 8, export depth.** IFC carries shapes and classes only. The status line reads `walls=0` for an opened building
  (`modeller.html:~3042`). Small, honest next items; they don't block the loop.
- **2D drawings.** 2D/PDF sheets are a deliberate deferral (§2D-AND-PDF), not a gap. The 2D value is O16's round-trip,
  which is L5 seen in plan.
- **Hand solid-modelling (fillet, push/pull, exact booleans).** Deliberately NOT pursued. It is the "normal work" the
  thesis replaces. The kernel stays `ops → mesh` (FeatureComparison.md).
- **Test net.** CI is never green (09-21 trap). Retarget or retire W-ROUTER-NNCHAIN (3/5): it expects a real nn-network
  from an MEP-bearing Terminal, which is the wrong test for an ARC-only strategy, and W-MEP-ROUTE-RENDER already covers
  that render seam, 12/12.

**§PRODUCTIVITY — measured 2026-09-25 (one "Walk ALL Services", W-MEP-OPENPATH ALL):** generated / flagged for review
(an unresolved clash, ≤1 edit each): SampleHouse 60/0 · Duplex 206/29 (15.7%) · SampleCastle 514/9 (1.8%) · HHS 3,415/0 ·
Clinic 5,140/0 · Hospital 39,979/22 (0.1%) · HospitalGarage 13,965/0 · Terminal 7,854/60 (1.4%). This is "little left to fix", NOT
"X times faster": there is no measured hand-modelling baseline. ⚠ The first run read 0 flagged EVERYWHERE. That was a gate
defect, not a result: the clash gate's global yield floor let FP's foundation-level sprinklers drag it to -1.257 m, and 20 Duplex
fixtures were "resolved" by sinking them ~1 m underground. Fixed as §GATE-STOREY-FLOOR (bim-ootb, W-GATE-STOREY-FLOOR: sunk 30/9/60 → 0).
Lesson: a "zero problems" measurement gets an instrument check against the app's own per-step log before it is believed.

The productivity claim needs its own number (original note below). "More productive than normal work" is so far a thesis, not a
measurement. Once L1-L5 hold, record per resident: fixtures + runs generated vs user edits needed to reach a network
the gate accepts. Until then, do not state it as a result.

**Dispatch (red1, 2026-09-24: "stick to Opus").** Every lane runs in Opus, in order L0 → L1+L2 → L4 → L6 → L5.
L1+L2 go together. L3 is data plus a possible red1 question. L7 is red1.

### §MEP EVIDENCE — the real open path, Walk-ALL (2026-09-24, bim-ootb b8f844fb)
Instrument control first: Duplex reproduced W-E2E-WALK-ALL (ACMV 19 / ELEC 102 / PLB 18 / FP 46 = 185) and W-E2E-WALK
(ELEC 102). bim-compiler W-BORROW-FP 6/6 reproduced SampleCastle's 247 FP. The fleet ELEC counts in
RESUME_DISC_WALKER_ENVELOPE_BOUND.md reproduce to the unit. Rules DBs match WalkerDoctrine §1/§2 on every resident.

| resident (rules) | ACMV | ELEC | PLB | FP | chainSegs | tubes |
|---|---|---|---|---|---|---|
| SampleHouse (duplex) | 4 / 4 bound | 28 / 17 | 11 / 0 | 17 / 16 | 0 (bridge silently empty) | 0 |
| Duplex (duplex, schedule path) | 19 | 102 | 18 | 46 / 29 | 0 (bridge never reached) | 0 |
| SampleCastle (duplex) | 12 / 12 | 270 / 269 | 84 / 0 | 126 / 125 | **32** (routePattern, CW 10 + SP 22), refused 32/32 for signing | 32 |
| HHS (terminal) | 1368 / 196 | 722 / 12 | 426 / 0 | 721 / 118 | 0 | 0 |
| Clinic (terminal) | 938 / 771 | 406 / 140 | 605 / 0 | 751 / 236 | 0 | 0 |
| HospitalGarage (terminal) | 4007 / 0 | 2756 / 49 | 3226 / 0 | 3310 / 143 | 0 | 0 |
| Hospital (terminal) | 5126 / 1510 | 3190 / 192 | 4036 / 0 | 4428 / 662 | 0 | 0 |
| Terminal (terminal) | 1375 / 407 | 896 / 110 | 969 / 0 | 1102 / 257 | 0 | 0 |

(Cells are placed / host-bound. The complex residents also walk STR 264–2,252 and roof 10,584–47,526 — see L7.)
Existing witnesses on origin/main: W-E2E-WALK 8/8 · W-E2E-WALK-ALL 13/13 · W-E2E-STR-REWALK-COMMIT 9/9 ·
W-MODELLER-DISC-WALK 8/8 · W-MEP-ROUTE-RENDER 12/12 · W-DISC-DENSITY 8/8 (needs the gitignored
`Terminal_arcstr_proof.db`; ELEC still 2.11× over, row 23) · W-ROUTE-PATTERN-BRIDGE **6/4** · W-ROUTER-NNCHAIN **3/5**.
The probe scripts were session scratch, not committed. That is why L0 exists.

### Corrections this evidence makes elsewhere (made here; the other files are left as-is, pointed to)
- **Row 6 is re-framed.** It is not "Terminal serves 0 MEP": that 0 is the input. It is now "generated routing is
  unreachable on the production walk path, and no generated network is ever signed" = lanes L1-L3. *Done when:* a real
  user Walk on Terminal AND Duplex renders ≥ 1 routed PLB run that is also in the signed op-log.
- **09-21 trap "playwright is NOT installed" is WRONG.** It is at `~/bim-ootb/tests/node_modules/playwright` (1.59.1).
  Witnesses with a bare `require('playwright')` need `NODE_PATH=~/bim-ootb/tests/node_modules`.
- **`prompts/Modeller/DISC_Walker/` (26 files) is now harvested.** Stale claims found: RESUME_MODELLER_WALK_SUBSTRATE
  "Duplex 0→55, chainSegs unchanged after M2" (bisect: 55→34→0); RESUME_MEP_SAMPLECASTLE "SC 2372 ARC envelopes baked in
  mep_rw.db" (it has 0; the 2,372 come from the building db); RESUME_TERMINAL_RULE_MINING's "124 rows / 47 avoidance"
  (now 37 / 10) and its Terminal-rules-on-houses model (contradicted by WalkerDoctrine, and the doctrine wins);
  SPEC_MESH_FIT_GRAFT / SPEC_SEAM_HEALING code lives only on unmerged feature branches.

## ▶ §SWEEP 2026-09-15 — the re-verify sweep §RESUME ordered, DONE. All 34 rows re-marked against
## bim-ootb `origin/main` @ `3e8c6be2` by grep/sqlite, plus 4 witnesses actually RUN. **Rows 24 and 28 were
## then CLOSED the same day by bim-ootb #1738 — see their rows.** Read this table,
## not the 2026-07-30 status column below it — where they disagree, this one is the measurement.

**Method, so the next session can falsify any line here:** every verdict below names either a file:line on
`origin/main`, a `sqlite3` count off the SHIPPED resident DB, a live `curl` + content-hash, or a witness
run with its own PASS/FAIL line. No verdict rests on a code comment (two comments turned out to be wrong —
rows 28 and 35). Witnesses run through `modeller/tests/e2e_harness.js`, which resolves puppeteer 24.42.0
out of `~/bim-compiler/node_modules` — no install needed, and **"needs a browser" was not a reason to skip
any of this.**

### CHANGED ROWS — the 8 that moved. Everything not listed here is unchanged from 2026-07-30.

| # | 2026-07-30 | 2026-09-15 verdict | the evidence |
|---|---|---|---|
| 19 | verified-open | ✅ **CLOSED** | `move-gizmo.png` was recaptured in bim-compiler **#73** (2026-08-07). Verified where the user sees it, not on master: `GET https://red1oon.github.io/BIMCompiler/img/modeller/move-gizmo.png` → HTTP 200, **423,928 B**, content sha1 **`22a794f4df215ec50231aa642b904303f72d4006`** == the `origin/master` blob. A 200 alone would not have been evidence (§PRIME LESSON) — the hash is. |
| 32 | verified-open (RED on main) | ✅ **CLOSED** | **#1704** (2026-09-10) routed soft-delete through `modeller_history.js`'s tree. RAN it: `W-E2E-DELETE: 8 PASS / 0 FAIL`, **D4 green** (`len 195→195 meshFid175=0`). The witness's own D4 header now records the supersession. |
| 23 | verified-open (D3 drift) | ✅ **the named defect is FIXED — RE-POINT the row** | RAN `witness_disc_density.js`: `§DW-DENSITY-TE: 8 PASS / 0 FAIL`, **D3 ENVELOPE = 100% on all four** (PLB 26/26, ELEC 1754/1754, FP 996/996, ACMV 1444/1444) against the row's 94.3 / 92.0 / 94.8. **But the witness prints a DIFFERENT live finding it does not fail on:** `⚠ FINDING ELEC over-count 1754 vs real 833 = 2.11× — density-transfer drift (ARC footprint ≠ disc coverage area)`. That is the open item now; the D3 wording is dead. |
| 24 | ✅ **CLOSED 2026-09-18 — see §SWEEP.** Root cause `e2e_harness.js:349` `process.exit()`; fixed in bim-ootb #1738 (§MULTIRUN). `§SMOKE-ALL runs=2/2`, SampleCastle was never broken | ✅ **ROOT-CAUSED AND FIXED** — bim-ootb **#1738** | Reproduced exactly: `smoke_arc_only.js` prints Duplex (`meshCount=196`, 2 PASS / 0 FAIL) and **exits 0** with the SampleCastle iteration never running. Cause: **`modeller/tests/e2e_harness.js:349`** — `runE2E` ends with `process.exit(fail ? 1 : 0)`, so the first `await runE2E(...)` never returns. Nothing is wrong with SampleCastle. **Generalised trap: ANY witness file that calls `runE2E` more than once is silently single-run and still exits 0.** `smoke_arc_only.js` is the only such caller today. **FIXED in #1738 (§MULTIRUN):** additive `opts.noExit` makes `runE2E` resolve with `{name, pass, fail}`; the exit stays the default so every single-run witness is byte-unchanged (regression-checked: green still exits 0, red still exits 1). `smoke_arc_only.js` now tallies both runs and refuses with exit 1 if one was skipped — `§SMOKE-ALL runs=2/2 4 PASS / 0 FAIL`. **SampleCastle was never broken**: `meshCount=3290`, 2/0. |
| 34 | verified-open ("NEXT SESSION START HERE") | ⛔ **ANSWERED — and it splits in two, one of them bigger than the question** | **(a) IFC export CANNOT leak an anchor.** `bonsai_ifc.js` `build()` handles exactly three op types — `GEOM_EXTRUDE_POLY` (:112), `GEOM_CUT` (:123), `GEOM_ARRAY` (:142). Anchors are `GEOM_INSERT` (`arc_editable.js:227`) → never reached. **(b) …but so is EVERY ARC-seeded element** (`arc_editable.js:342` is also `GEOM_INSERT`), so an IFC export of an opened resident exports **none of the seed**. That is a far larger finding than the anchor question and it is now row 36. **(c) Save / Native .db DOES carry anchors, by construction.** `modeller.html:3068` — `exportDb` = `await O.db.export()`, a raw byte dump of the whole signed op-log DB, zero filtering; `runSave()` calls that same writer (`modeller.html:2908`). Grep for `anchor` across `sdg_save.js` + `save_catalog.js` + the save path: **zero hits**. `saveModelDb` named in the row **does not exist** — the path is `runSave() → Bonsai.exportDb()`. Whether (c) is a leak is a real call, not a bug report: the anchors are signed ops tagged `anchorOnly:true` / `provenance:'void_anchor'` and re-open as invisible anchors, so a "full-fidelity" dump arguably SHOULD carry them. **Either way it is unwitnessed.** |
| 28 | verified-open (contradiction) | ✅ **DOES NOT REPRODUCE — CLOSED with a guard** (bim-ootb **#1738**) | New witness `witness_arc_3axis_rotation.js` (W-ARC-3AXIS), run on the FULL population of the shipped `SampleCastle_ARC.db`: `§ARC3AXIS-TILTED {n:293, real:293, seeded:293, pre:63, applied:230, dropped:0, other:0}` against a control of `§ARC3AXIS-FLAT {n:2405, real:2354, seeded:0, pre:2354, dropped:0}`. All 293 carry `placement.rotX/rotY` in their `GEOM_INSERT`; **230 genuinely need the rotation and get it** (their pre-placement mesh extent differs from their authored world AABB); 63 are already world-aligned; **0 dropped**. The 2026-07-10 finding predates **§GEO-SERVED (#1090)** — before that the Modeller drew bounding boxes, and a box has no orientation to lose. RED-first: neutering `place()`'s `pl.rotX \|\| pl.rotY` branch flips exactly 230 to dropped and takes R4+R5 RED (exit 1), control untouched. ⚠ **A WRONG TEST WAS TRIED FIRST AND LOOKED CONCLUSIVE** — comparing the rendered world AABB against `element_transforms.bbox_*` proves nothing, because `extractIFCtoDB.py:181` defines those columns AS the world AABB; the discriminating quantity is the PRE-PLACEMENT mesh bbox. That near-miss is written into the witness header so it is not repeated. `arc_editable.js`'s false comment ("0 non-zero rotation_x/rotation_y rows") corrected in the same PR: it is 293, all `rotation_y = ±π/2` exactly, across IfcCovering 125 · IfcWindow 80 · IfcWall 32 · IfcDoor 28 · IfcWallStandardCase 21 · IfcRailing 7. |
| 12 | verified-open | verified-open — **and its blast radius grew** | `rel_fills_host` ships as a SQL patch, never in the binary (so sqlite on `*_ARC.db` says "no table" for all 8 — that is the wrong instrument). Real census of `modeller/patches/*_ARC.db.sql`: **Duplex 54 · SampleCastle 83 · SampleHouse 11 mentions; Clinic, Garage, HHS, Hospital, Terminal = 0.** Exactly the five the row named. **New consequence the row predates:** `dagevu_engine.js:62` builds every `HostFillEdge` from a REAL `rel_fills_host` row, so **#1706's anchor-by-default engine — the headline of the whole DAGeVu arc — is inert on 5 of the 8 residents.** |
| 10 | re-measure | **RE-MEASURED (local only)** | RAN `witness_e2e_terminal_open.js`: `7 PASS / 0 FAIL`, **`§OPEN openMs=20592`**, 35,552 ARC elements seeded exactly, `verifyChain ok len=35552` in 1,176 ms. Signing is still a visible phase — 3 of the 8 distinct status lines are `signing 3000/13500/25500 of 35552`. ⚠ **This is headless-swiftshader on localhost. Do NOT set it against the old 14 s profile and call it a regression — different rig, and that is exactly the "hold every variable but one" trap §RESUME warns about. The LIVE number is still unmeasured**, and §RESUME's own rule says the live URL is where this has to be proven. |


### §ROW-12 FOLLOW-THROUGH — two things worth carrying forward (2026-09-18)

**Garage's source was ambiguous and the ambiguity was RESOLVED BY MEASUREMENT, not by picking.** Its
recorded `source_file` (`HospitalGarage_ARC.ifc`) is not on disk. Two candidates matched 5/5 GUIDs —
`HospitalGarage_IFC4.ifc` and `HospitalGarage_IFC2x3.ifc` — and they produce DIFFERENT `opening_guid`s, so
picking one blind would have been a coin flip presented as a fact. The 36 FILLED `host|filling` pairs, the
only ones the engine rides, are byte-identical across both schemas, so the choice is immaterial *for the
ride*. If anything ever needs `opening_guid` itself, this is unresolved and must be settled first.

**The witness raced, and it took two wrong conditions to get right — worth knowing before writing the next
multi-building witness.** `__dwName` flips at the START of an open, but `__arcFidByGuid` is rebuilt LATER,
in the geo-fetch continuation. So "the name matches and the bridge stopped changing" is satisfied by the
PREVIOUS building's untouched bridge, silently: the first re-run against merged main reported Hospital
`rideable=0` against an expected 506, with `bridge=1950` — Clinic's size. The data was correct the whole
time. The fix is to NULL `__arcFidByGuid`/`swXEdges` before opening and wait for repopulation, so a
non-empty bridge is necessarily this building's (bim-ootb #1750). **Any witness that opens more than one
resident needs this; a fixed sleep will pass locally and lie later.**

### §SWEEP FOLLOW-THROUGH 2026-09-18 — what is actually left, ranked

Rows 19, 23, 24, 28, 32 and 35 are now marked closed IN THE TABLE ITSELF, not just here — a row that
still reads `verified-open` after being closed is the same stale-claim trap this file exists to kill.

**The largest genuinely-open item is row 36, and it was found by accident.** IFC export handles only
`GEOM_EXTRUDE_POLY`/`GEOM_CUT`/`GEOM_ARRAY`; every ARC-seeded element is a `GEOM_INSERT`, so exporting an
opened resident emits **none of the building**. Nobody has ever reported it, which suggests nobody has
tried the feature on a resident. Ranked above the rest because it is a headline capability that silently
produces an empty file.

**Row 12 is the second, and its blast radius grew:** `rel_fills_host` ships for Duplex/SampleCastle/
SampleHouse only, and `dagevu_engine.js:62` builds every `HostFillEdge` from a real row — so **#1706's
anchor-by-default engine, the headline of the whole DAGeVu arc, is inert on 5 of the 8 residents.**

**Two threads §XEDGE-GEOWIRE (bim-ootb #1744) opened and did not close:**
- **The residual 11.** G4 is honestly RED at 11 of 12,983 on SampleCastle, deliberately not relaxed.
  Two suspects, unmeasured apart: `_readBoxes`' `rx/ry` guard (whose stated premise is the same false
  claim corrected in #1738 — 293 such rows exist, so the guard fires on real data and the 3-axis path it
  distrusts is now itself witnessed, making it probably liftable), and the 1,301 of 3,225 elements with
  no resolvable blob.
- **Datums 802 → 657 on SampleCastle.** Plausibly correct — anchor-displaced faces were manufacturing
  false alignment clusters — but still UNVERIFIED as a *correction* rather than a new artifact.
  ⚠ **RETRACTED 2026-09-21, the row-7 half of this claim was WRONG.** I wrote that it "bears directly on
  row 7 because that grid is built from these datums". It is not: `str_walker.js` derives its OWN emergent
  grid by 1D-clustering column centres and has ZERO references to `CrossEdges`/`swXEdges`. The two
  derivations are unrelated and #1744 did not move row 7's baseline. Row 7 was re-measured anyway
  (bim-ootb #1753) and the real finding is different — see row 7. The datum question itself stays open.

**A sibling consumer of the same substrate defect is on record but unmeasured:** `scripts/compile_rooms.py`
(Viewer room injection) reads `center_*`/`bbox_*` straight off `element_transforms` with no rotation and no
blob resolution. Exposure is NOT uniform — `door_dims` reads extents only and is safe (934/934 correct);
`storey_doors`/`storey_z_anchors`/stair footprints read positions and are exposed. See
`SPATIAL_DEPENDENCY_GRAPH.md` §ANCHOR-SUBSTRATE-SIBLINGS. Measure before touching it.

**Unchanged and still open:** 6 (Terminal 0 MEP), 7, 8, 9, 11, 13, 14, 22, 25. **Row 10 half-answered** —
re-measured at `openMs=20592` on 35,552 elements, but LOCAL headless only; the live number §RESUME asks
for is still unmeasured, and the old 14 s figure must not be diffed against it (different rig).
**Blocked on the user, nothing built:** 15, 21, 26, 27, 29, 31. **Deferred by design:** 30.

⚠ **Row 14's cited example does not reproduce** — Dining_Chair measures 0.443/0.427/**1.227** m, upright,
not "z=0.14 lying on its side". The item stands; re-source the example or its witness is green on arrival.

### NEW ROWS found by the sweep

| # | obj | item | proof required | status |
|---|---|---|---|---|
| 35 | O13 | **The LIVE guide contradicts shipped behaviour — and the fix is NOT a plain deploy.** The published ModellerGuide says *"Hosted doors and windows **ride**, never distort"* (1 hit live; **0** hits of "ANCHORED by default") — but **#1706** (2026-09-11) made openings **anchor by default with ride opt-in**, the exact reverse. Master fixed the text in `2c232661c`. ⚠ **DO NOT just run `mkdocs gh-deploy` from master — it would take live pages OFFLINE.** Measured 2026-09-15: the site was deployed from **`fable/meshdb-livewire` @ `58e7f344a`**, NOT from master, and `58e7f344a` is **not an ancestor of master** — they are two partly-overlapping doc trees, not old-vs-new. Deploying master would delete **11** published files, including two public pages that are live and in the fable branch's `mkdocs.yml` nav today (both HTTP 200): `docs/SpatialCompilationPaper.md` (the academic paper, 735 lines) and `docs/4DGenerator.md` — neither has ever existed on master. Master would add 4 files (`internal/LAST_MILE_PROBLEM.md`, `internal/PROJECT_CHRONOLOGY.md`, `internal/VibeProgramming.md`, `glassbowl_data.db`). This is the same two-production-paths shape `LFS_QUOTA_AUDIT §6.1` already recorded | **a decision first — which branch owns the published site** — then reconcile the two doc trees onto it, deploy, and re-curl: assert "ANCHORED by default" present, "ride, never distort" gone, and `SpatialCompilationPaper`/`4DGenerator` still HTTP 200 | ✅ **DONE 2026-09-18.** Site consolidated onto master (BIMCompiler #106 — 3-way against the merge-base, zero conflicts, 11 fable-only files ported) and published via `scripts/safe_gh_deploy.sh` (NOT bare `mkdocs gh-deploy`, which CLAUDE.md bans). Guard PASS live=290 → new=292 superset; all 7 canaries 200. Verified live: "ANCHORED by default" 1 hit, "ride, never distort" 0 hits, `SpatialCompilationPaper`+`4DGenerator` still 200 |
| 36 | O1/O8 | **IFC export ignores `GEOM_INSERT` entirely**, so exporting an opened resident emits nothing from the ARC seed (see row 34b). `bonsai_ifc.js` `build()` covers `GEOM_EXTRUDE_POLY`/`GEOM_CUT`/`GEOM_ARRAY` only; every seeded element is `GEOM_INSERT` (`arc_editable.js:342`) | open Duplex → Export ▸ IFC → count products in the emitted file vs the 196 seeded meshes; RED-first against current main | verified-open — found by the row-34 read, never previously stated |

### ROWS RE-CONFIRMED UNCHANGED (spot-checked, no movement)

- **✅ still shipped:** row 2 (`docs/ModellerGuide.md:164` "What a wall is made of" — **and live**: HTTP 200, 128,351 B, 3 hits) · rows 3 + 33 (Duplex `geoV: 6`, `str_walker_outliner.js:52`) · row 4 (§ANCHOR, 7 hits in `arc_editable.js`) · row 16 (`bonsai:refold`/`_paintSel`, 11 hits) · row 17 (`__ALL__`, 5 hits) · row 18 (`modeller.html:4095/4146/4150`).
- **verified-open, unmoved:** row 5 (one §ONE-DISC-TAB hit at `modeller.html:4811`; no unification slice built) · row 6 (`Terminal_ARC.db` still served — 35,552 elements across 13 classes, **0** Pipe/Duct/Cable/Flow rows) · row 7 (`witness_str_into_arc.js:5` still cites RMSE 0.104 m) · row 8 (#1245's `witness_e2e_gridmove_roof.js` is roof grid RECOMPOSE — not the per-element plate walk this row asks for) · row 9 (`sdg_gate.js:106` still calls apply "a future accept-gated op") · row 11 (`arc_editable.js:27-31` — colour stays the cosmetic PALETTE, only alpha recovered) · row 13 (`modeller.html:424` and `:1036` still name the un-vendored EffectComposer) · row 25 (no BCF import, no PBR texture code).
- **row 15** — the figures check out: `library/component_library.db` is **220 MB** with `component_definitions` = `component_geometries` = **23,888** rows, and there is still no `createDbWorker` anywhere in `modeller/`. ⛔ still the user's hosting call (GH vs OCI).
- **row 22 splits three ways:** one-click revert of a RED — not found, open. UBBL named checks — **partially shipped**, `sdg_gate.js:139-154` implements By-Law 42 (area ≥ 6.5 m², headroom ≥ 2.5 m) but the file itself marks it `STATIC, not part of evaluate()'s delta contract`. rtree prune — `cross_edges.js:38` replaced the Python rtree query, but `disc_walker.js:929` still records that Terminal has no `elements_rtree` and falls back to the raw unverified centre; open.
- **row 30** — still dead code (`bonsai_gridmove.js:166` hardcodes `ifcClass: 'IfcWall'`, so `isRoof` is always false). ⚠ **but it is now a one-liner**: `classByFid` is computed and used as a filter nine lines earlier (`:157`) — the real class is in hand at the emit site and thrown away. Still needs its own design pass; noting only that the blocker named in `GRID_ROTATION_GUARD.md §8` has dissolved.
- **⛔ still blocked on the user, nothing built:** rows 21, 26, 27, 29, 31. Greps for `siblingCluster` / external-IFC import / `DUAL_MODEL` return zero hits in `modeller/`.
- **row 14** — the item is real (no axis-permutation bake in `scripts/extract_dagevu_catalog.py`) but ⚠ **its cited example no longer reproduces**: Dining_Chair (hash `5e4c8c071b267e91`) measures **0.443 / 0.427 / 1.227 m** in `viewer/dagevu_geometries.json` — tallest axis IS z, upright. The row's "z=0.14, lying on its side" is stale. Re-source the example from a part that still fails before writing the `tallest-axis == h` witness, or the witness will be green on arrival and prove nothing.

## ⚖ THE USER IS NOT REVIEWING. YOU ARE THE ONLY CHECK.
The user has explicitly said they have no time to inspect this work. That REMOVES the safety net; it
does not lower the bar. Therefore, in this lane:
- **Every claim carries its own `§`-tagged log line or it is not done.** No exceptions, no "should work".
- **No screenshot, no "looks right", ever, as proof of anything** — that is FUNDAMENTAL LAW in
  `CLAUDE.md`. Numbers computed from real object state, read programmatically.
- **Prove it where the USER will see it — the live URL — not only on localhost.** See §PRIME LESSON.
- **A witness that cannot fail is not a witness.** Every test names the issue it proves, and must be
  shown failing on the pre-fix code.
- **Report only finished, verified outcomes.** One line each. Not plans, not progress.

## 🔴 §PRIME LESSON — read before diagnosing ANYTHING (learned the hard way, 2026-07-29/30)
The Modeller rendered every element as a bounding box on the LIVE site for months while every local
measurement said "real geometry, 215/215". Cause was two faults stacked:
1. **Hosting** — `modeller/mesh.db` is Git-LFS-tracked and **GitHub Pages does not resolve LFS**. The
   browser got HTTP **200** with a **134-byte** text stub (`version https://git-lfs.github.com/spec/v1`).
2. **Silent substitution** — with no mesh store at all, `arc_editable.js`'s hard-fail guard was SKIPPED
   (it only fires when a store exists but one element's link is broken), so every element fell back to
   `boxArrays(rawBox)`, its measured bounding box. The only log line was a `console.warn`, which
   DevTools hides by default.

**The diagnostic order this burns in — apply it to every "the Modeller looks/behaves wrong" report:**
1. `curl` every asset the live page needs. Check real size and magic header. **A 200 is not evidence.**
2. Read what the code does when an asset is missing or junk. **If it substitutes anything — a box, a
   default, a placeholder — that silent substitution IS a bug in its own right,** worse than the missing
   file. Fix both; fixing only the file leaves the trap armed.
3. Check the service-worker `CACHE_VERSION` and whether the file is precached. A landed fix that a
   cached script overrides reads to the user as "still broken".
4. Only then explain — one line, naming the asset and the substitution.

**Do NOT start with:** local DB queries, triangle counts, part-count comparisons, material/lighting
audits, or LOD definitions. None of those can see a deployment fault, so none of them can answer.

**Fixed 2026-07-30, both faults** (bim-ootb PR #1090 merged + #1091 cache bump): each resident now has
its own small geo file on object storage (Duplex 1.3MB instead of a shared 120MB; all 8 residents
resolve 100% of their element hashes, verified), and `_assertRealGeoDb()` refuses non-SQLite bytes,
names an LFS stub explicitly, and logs as `console.error`. Guard witnessed 4/4 against real live bytes.
⚠ **`modeller/mesh.db` is now DEAD WEIGHT in git** — nothing fetches it. Do not re-point anything at it.

## 🎯 THE OBJECTIVES — "the Modeller works" means ALL of these, measured
Derived from the 15 files below + `[[project_modeller_vision_lock]]`. Each line: the objective, then
where its detail lives. **None of these may be quietly dropped to make a report look finished.**

| # | objective | authoritative file |
|---|---|---|
| O1 | **Real authored geometry renders — never a substitute**, on the LIVE site, for every resident | `RESUME_MODELLER_LOD400_REAL_GEOMETRY.md` |
| O2 | **LOD400 means fabrication level** — an authored multi-layer wall is not one block (see §LOD400-ENVELOPE) | same, §LOD400-ENVELOPE + §LOD400-DISPATCH |
| O3 | **ONE coherent surface** — the Outliner leads (Building▸Storey▸Room▸disc▸class▸element), not 3 unlabelled tabs | `RESUME_MODELLER_UX_OUTLINER_PILL.md` |
| O4 | **Direct manipulation** — select · hover · move-on-axis · multi-select · snap · rotate | `MODELLER_DIRECT_MANIPULATION.md`, `RESUME_MODELLER_P3.md`, `RESUME_MODELLER_POLISH.md` |
| O5 | **Material at Viewer standard** — glass reads as glass; reflection/grain/roughness/light rig parity | `MODELLER_RENDER_MATERIAL_PARITY.md` |
| O6 | **Placement anchor semantics correct** — elements seat where the source says, not where a box implies | `RESUME_MODELLER_ARC_ANCHOR_PLACEMENT.md` |
| O7 | **Insert from the REAL BOM catalog**, not a hardcoded 3-component fixture | `MODELLER_BOM_CATALOG_SPEC.md` |
| O8 | **Save = validated snapshot promotion** (CompleteIt-shaped), not a raw dump | `MODELLER_SAVE_COMPLETEIT.md` |
| O9 | **Conformity gate** — RED/ORANGE planner's gate on edits | `RESUME_MODELLER_CONFORMITY_GATE.md` |
| O10 | **Spatial Dependency Graph as authoring truth** — typed cross-edges, host/filling rides its wall | `RESUME_GRAPH_MODELLER_INTEGRATION.md` |
| O11 | **Opens at Terminal scale** without a signing stall; roof/IfcPlate fast placement | `RESUME_MODELLER_TERMINAL_LOAD_LOD400.md` |
| O12 | **Zoom-to-selection parity** with the Viewer Find panel | `MODELLER_ZOOM_TO_SELECTION.md` |
| O13 | **Guide-worthy** — the public guide's screenshots are honest and current | `RESUME_MODELLER_GUIDE_SCREENSHOT_FIX.md` |
| O14 | **Competitive polish** — outline-pass selection, shadows/AO, BCF/IFC interop | `RESUME_MODELLER_COMPETITIVE_POLISH.md` |
| O15 | **3D Grid editing is the primary handle** — drag a gridline and the building RECOMPOSES (stretch, not scale); openings stay host-bound; rotated bays stay square; no state leaks between clears | the 9 `GRID_*.md` files + `CONSTRUCTION_GRID_BOM_DUAL_MODEL.md` — triaged below |
| O16 | **2D views ARE the drawings, and they are an INPUT surface** — orthographic elevations F/B/L/R + sections flatten ALL geometry, storey markers at real Z; end-state: drag a gridline in plan → write Δ to DB → recompile → services re-route | `[[project_2d_views_roadmap]]`; ⛔ **PDF/DXF sheet export is NOT yet an objective** — see §2D-AND-PDF below |

## 📋 TRIAGE — the 15 files, 3,742 lines total. Consolidation rule: this MASTER owns the OPEN LIST and
## the objectives; each file keeps its own history and detail. **Do not delete any of them.**

| file | lines | owns | first action for the study session |
|---|---|---|---|
| `RESUME_MODELLER_LOD400_REAL_GEOMETRY.md` | 599 | O1, O2 — geometry truth, the envelope defect, §GEO-SERVED history | its `§START HERE` + `§LOD400-ENVELOPE` are current; harvest OPEN items 1–6 |
| `RESUME_GRAPH_MODELLER_INTEGRATION.md` | 398 | O10 — graph/cross-edges into authoring | harvest open items |
| `MODELLER_BOM_CATALOG_SPEC.md` | 393 | O7 — real catalog INSERT | check whether the 3-component fixture still ships |
| `RESUME_MODELLER_GUIDE_SCREENSHOT_FIX.md` | 376 | O13 — guide screenshots + the old "geometry hell" thread | ⚠ its geometry-hell verdict is SUPERSEDED by §LOD400-ENVELOPE |
| `RESUME_MODELLER_TERMINAL_LOAD_LOD400.md` | 309 | O11 — open speed, roof/IfcPlate | re-measure at real Terminal scale, live |
| `RESUME_MODELLER_UX_OUTLINER_PILL.md` | 236 | O3 — one-surface UX | the 3-surface unification was DESCOPED, not shipped — decide |
| `MODELLER_RENDER_MATERIAL_PARITY.md` | 229 | O5 — material | glass opacity DONE; reflection/grain/roughness/lights NOT ported |
| `RESUME_MODELLER_COMPETITIVE_POLISH.md` | 208 | O14 — polish research (design only, no code) | ~11 quick wins already identified; rank them |
| `MODELLER_DIRECT_MANIPULATION.md` | 184 | O4 — the manipulation core | spine reported DONE; verify on the LIVE site |
| `MODELLER_ZOOM_TO_SELECTION.md` | 148 | O12 — camera parity | small, well-specified |
| `RESUME_MODELLER_ARC_ANCHOR_PLACEMENT.md` | 139 | O6 — anchor semantics | verify the flip actually shipped |
| `RESUME_MODELLER_POLISH.md` | 98 | O4 follow-ups | harvest |
| `RESUME_MODELLER_P3.md` | 87 | O4 multi-select | reported fully ✅ — confirm, then retire to a pointer |
| `RESUME_MODELLER_CONFORMITY_GATE.md` | 77 | O9 — RED/ORANGE gate | harvest |
| `MODELLER_SAVE_COMPLETEIT.md` | 61 | O8 — Save semantics | harvest |
| dir `prompts/Modeller/` | — | `COMPETITIVE_FREECAD_INTEROP.md`, `DISC_Walker/` | read, fold pointers in here |

### O15 — the GRID family, added 2026-07-30 (reviewer gap: the first harvest swept only `MODELLER_*`/
### `RESUME_MODELLER_*` filenames, so 10 files / 1,613 lines covering the Modeller's PRIMARY HANDLE were
### never triaged. The grid is how a user edits the building; it cannot be a single row in the queue.)

| file | lines | owns | first action |
|---|---|---|---|
| `GRID_ROTATION_GUARD.md` | 445 | rotated-bay correctness — the deepest of the family (20 done-marks) | verify the guard shipped, then harvest its 5 remaining |
| `GRID_ROTATED_SCALE_HARDENING.md` | 260 | scale hardening in `bonsai_kernel_worker.js` + its own witness | mostly ✅ — confirm, retire to a pointer if so |
| `GRID_KINEMATICS_SANDBOX_PROOF.md` | 233 | the 3D authoring-grid system proof (`bonsai_grid.js`, `grid_kinematics.js`) | this is the doctrine file for O15 — read FIRST |
| `CONSTRUCTION_GRID_BOM_DUAL_MODEL.md` | 162 | **grid ⊗ BOM as ONE authoring substrate** — 6 open, 0 done | spec-only, never built; decide if it is still the intended architecture |
| `GRID_PREDRAG_PREVIEW_SAVE_COMPLETEIT.md` | 151 | master design dialogue (reference only) — feeds O8 + pre-drag preview | reference; do not build from it directly |
| `GRID_SMART_ELEMENT_SCOPE.md` | 136 | which elements a drag legitimately takes with it | harvest — 10 open |
| `GRID_CLEAR_STATE_LEAK_FIX_ROUND2.md` | 100 | state leaking across a grid clear, round 2 | claims ✅ 2026-07-04 with "PR TBD" — **verify it actually landed** |
| `GRID_CLEAR_STATE_LEAK_FIX.md` | 72 | round 1 of the same | superseded by round 2 — confirm, then pointer |
| `GRID_PREDRAG_GREENORANGE_PREVIEW.md` | 54 | green/orange pre-drag preview | states shipped — confirm |
| plus queue row 7 | — | 🟥 the grid-lock crux, 0.104 m residual | already ranked; its own heavy session |

**Harvest rule for these, same as before:** verify against shipped code before listing anything as open —
two of these files claim DONE with no PR reference, which is exactly the stale-claim shape the first pass
found 11 of. Add the surviving rows to §OPEN LIST tagged `O15`.
**✅ HARVESTED 2026-07-30 (same day):** surviving rows = **28–31** in §OPEN LIST. Everything else in this
table verified SHIPPED against origin/main — including both suspect ✅s ("PR TBD" landed; tilt-guard merged
as PR #722 squash) — see the O15 stale-claims block. The one contradiction finding: row 28 (code present,
live measurement says inert).

### §2D-AND-PDF — the vision question, answered 2026-07-30 (user: *"Vision from there on can we do 2D
### professional drawing exporting to PDF?"*)

**Recorded position (`[[project_2d_views_roadmap]]`), unchanged:** *"The 2D views ARE the architectural
drawings. Full-screen + print-screen replaces export for now… No DXF/PDF export needed yet."* So PDF is a
**deliberate deferral, not a missing capability**, and the roadmap deliberately aims PAST export:

> *"End state: drag grid lines → write Δ to DB (like DXFSyncVerb) → recompile building → RouteWalker
> recomputes MEP. This is the BIM Designer Browser round-trip: 2D view is both output AND input surface."*

That is the same handle as O15 seen in plan. **O15 and O16 are one mechanism, two views — do not build
them as separate features.**

**Substrate that already exists** (verify each before assuming, per §PRIME LESSON): orthographic
elevations F/B/L/R, cross-sections showing slab/ceiling/roof heights, storey markers from
`detectStoreys()` at real Z, subtle gridlines with click-a-bay highlight (`viewer/elevation.js`).
Requirements already fixed by the roadmap: an elevation must flatten **ALL** geometry onto the view plane
(no empty spaces), and stairs must read from every side like a real drawing.

**⛔ NOT an objective until the user says so.** Professional PDF sheets = sheet frame + titleblock + real
scale + dimension strings + line-weight hierarchy — a genuinely new lane, not a small addition, and it
would be the first thing this product exports for print. Do NOT start it off this file. If greenlit it
becomes O17 with its own spec; until then the answer to "can we?" is **yes, and the 2D substrate is
already there — but the recorded priority is the round-trip, not the printout.**

## 🚚 THE DISPATCH — model allocation, stated honestly
Per `[[feedback_model_allocation_mastermind_vs_execution]]`:
- **Fable5 — YES for the wide mechanical pass, and it is the right tool for it.** Reading 3,742 lines
  across 15 files, extracting every open item verbatim with its file + section, de-duplicating,
  detecting claims that contradict shipped code, and filling in §OPEN LIST below. Long-context,
  mechanical, high-volume, fully specified. Fable5 does NOT write memory files.
- **Sonnet — required for the architecture calls**, of which at least three are already known and
  cannot be delegated to a mechanical pass: (a) §LOD400-ENVELOPE's one-mesh-per-element vs N-sub-instances
  decision; (b) whether the descoped 3-surface Outliner unification is still wanted; (c) whether a
  void-consumed host becomes a non-rendered logical anchor.
- **The user's own call** on anything that changes what the product IS, not how it is built.

**Sequence:** Fable5 harvest → §OPEN LIST filled and ranked → Sonnet takes the 3 calls → Fable5 builds
the mechanical items to zero → each item marked `✅ DONE (witness)` or `⛔ BLOCKED: <the one question>`.

## 📌 §OPEN LIST — FILLED 2026-07-30 (Fable5 harvest, all 15 files + `prompts/Modeller/`, every row
## verified against bim-ootb `origin/main` by grep/sqlite — not carried forward from prose)
Format, one row per item, ranked most-blocking first:

`| # | objective | item, in one plain line | source file §section | proof required | status |`

| # | obj | item | source | proof required | status |
|---|---|---|---|---|---|
| 1 | O2 | ⛔ ARCH CALL (a): layered-wall representation — N sub-instances per layer vs ONE layered mesh + per-layer index (file recommends b) | `RESUME_MODELLER_LOD400_REAL_GEOMETRY.md §LOD400-DISPATCH` step 2 | the choice stated in one line, recorded in that file | ✅ CALL MADE 2026-07-30 — **(b) one layered mesh + `component_geometry_layers` index**, recorded in the source file §LOD400-DISPATCH; row 3 unblocked |
| 2 | O2 | the plain-English "what a wall is made of" guide subsection — the user's PRIMARY asked-for deliverable, [[feedback_terse]] binding | same, step 1 | subsection in `docs/ModellerGuide.md` (zero "layer" hits there today) | ✅ DONE 2026-07-30 — "What a wall is made of" committed after §Realistic glass; deploy via `safe_gh_deploy.sh` post-merge |
| 3 | O2 | §LOD400-LAYERS-REAL: slice the authored envelope at authored layer thicknesses; ship layers+`surface_styles` to residents (patch + self-heal loader); then the Modeller half of the gate refuses envelopes | same, §THE FIX items 2–3 | `witness_lod400_envelope.py` gate GREEN; 7-layer wall `2O2Fr$t4X7Zf8NOew3FNbT` renders 7 slabs summing to authored total; falsified by removing one layer row | ✅ extractor half DONE 2026-07-30 (PR #57 merged; W-LOD400-ENVELOPE **12/12 exit 0 on Duplex, independently re-run by the orchestrator**, refusals: DX 0, SC 1 honest `sporenkap` pitched-roof → SC still exits 1 by design). ✅ **FULLY DONE 2026-07-30 — residents half shipped (bim-compiler PR #59 + bim-ootb PR #1096, both MERGED):** layer tables → `patches/Duplex_ARC.db.sql` self-heal; rebuilt `Duplex_geo.db` (layered buffers under the EXISTING hashes via per-guid measured change-of-basis — fresh hashes match 0/155 shipped, see the §LOD400-LAYERS-RESIDENTS record) uploaded to OCI + byte-verified live; `arc_editable.js` §LAYER-GATE refusal armed (schema-detected, Duplex only; SC untouched by design); geoV 3→4, sw v40→v41; W-E2E-LAYERS-RESIDENTS **8/8 against the LIVE geo URL** (party wall 124 tris / 7 rows Σ0.550 m / slabs 16-41-193-50-193 mm; falsification fires; unpatched residents byte-identical). Per-layer render COLOR deliberately not wired (needs face-group materials through the fold payload — own slice; data already ships). ⚠ **WATCHDOG CORRECTION 2026-07-30 (live-queried): the party wall renders 5 slabs, NOT 7** — layers 5-6 (Metal Stud 41mm, outer Plasterboard 16mm) have `face_count=0`, `face_start=124` = past the buffer end. 4 empty rows / 229 total, on 2 of 71 walls (both 7-layer, both opening-cut). The witness was BLIND BY CONSTRUCTION: thickness-sum (0.550) and face-count-sum (124) both reconcile while two layers are missing — a green computed over the wrong quantity, the same shape as §PRIME LESSON. → row 33 |
| 4 | O1 | ⛔ ARCH CALL (c): should a VOID-CONSUMED host become a non-rendered logical anchor (SC `stretchRide` reach 9/74 because 65/71 hosts are void-consumed) | `RESUME_MODELLER_LOD400_REAL_GEOMETRY.md §START HERE` OPEN 1 | doctrine analysis + recommendation recorded; **user's word before any build** | ✅ DONE (witness) 2026-07-30 — BOTH halves merged. Extractor: PR #58 (W-VOID-ANCHOR-EXTRACT 7/7, RED-falsified; SC patch independently verified: 65 anchors, instances unchanged 3225). bim-ootb: PR #1095 (W-E2E-VOID-ANCHOR 19/19, RED-first baseline committed; **reach 9/74 → 74/74**, rider dx == host delta exactly, filling mesh moved rigidly; guardrail proven surface-by-surface: visible 3225=3225, Outliner 3342/3418 identical, pick rays hit-for-hit identical through 8 anchor meshes, gmAudit/§SAVE_BASELINE/§XEDGE-ALL identical; one honest non-masked count: commitSeedGroup ops=3290, anchors named by §ANCHOR lines; CACHE_VERSION v39→v40) |
| 5 | O3 | ⛔ ARCH CALL (b): the descoped 3-surface Outliner unification — ARC tree + STR Walker tab still separate on main | `RESUME_MODELLER_UX_OUTLINER_PILL.md` + LOD400 §NIGHT 3 | re-scope verdict recorded (still wanted? safe incremental path?) | ✅ CALL MADE 2026-07-30 — unify INCREMENTALLY, 6 slices via the proven §ONE-DISC-TAB wrap, recorded in `RESUME_MODELLER_UX_OUTLINER_PILL.md`; slices 1-2 buildable now, no user decision load-bearing |
| 6 | O10 | ⚠ RE-FRAMED 2026-09-24 → §STRATEGY L1-L3 (the 0 MEP is the INPUT; the gap is routing + signing). Original: §8E-3 substrate gap: the shipped "Open Terminal" resident (`Terminal_ARC.db`) is ARC-only, 0 MEP — a real user's walk renders no routed network; the witness sidesteps via `Terminal_meta.db` | `RESUME_GRAPH_MODELLER_INTEGRATION.md` §DONE 2026-07-11 finding 1 | routed tubes render on the REAL user open path (or the gap recorded as accepted) | verified-open — RESIDENTS still serve `Terminal_ARC.db` |
| 7 | O10/O3 | grid-lock-to-ARC/STR crux — 0.104 m RMSE baseline residual on the emergent grid; prerequisite for RosettaStone-through-grid + clean fold | `RESUME_MODELLER_UX_OUTLINER_PILL.md` 🟥 | its own HEAVY investigation session, per-axis measured findings | **RE-MEASURED 2026-09-21 — bim-ootb #1753, W-ROW7-GRID-BASELINE 5/5.** The baseline is NOT stale, but the shipped measurement path UNDER-REPORTS it. On `Terminal_arcstr_proof.db` (158 columns, geometry 158/158, same metric as `witness_green_report.js:57-61`): **anchor centres → colRMS 0.0939 m; true mesh centres → 0.1039 m.** The recorded 0.104 matches the CORRECTED figure to 3 dp, not the shipped path's 0.0939 — correcting the substrate makes the residual **worse by 10.0 mm**, i.e. the anchor defect was FLATTERING it. Grid topology is unaffected (18×10 either way), so this is a residual story, not a grid-shape one. Cause: `str_walker_bridge.js:22/38/50` reads `center_x/y` = the placement ANCHOR; the offset VARIES per column (p50 19.7 mm, p90 148.1 mm, max 225.6 mm on 0.75 m columns), so it does not cancel even though the grid is derived from the same centres it measures. **Before the heavy session starts it must decide WHICH number it is chasing.** Still verified-open as a defect; the baseline question is closed |
| 8 | O10 | roof plates walked PER-ELEMENT on the measured pattern (user accepted 1.3% count err; gate = positional) — also the cadence source that tightens #7 | same 🟧 | plate-centre spacing uniformity measured; per-element pass-bar RMS sub-metre | verified-open |
| 9 | O10 | backprop APPLY: accept-gated hop-by-hop application of ORANGE suggestions (flagging shipped #647; applying not built) | `RESUME_GRAPH_MODELLER_INTEGRATION.md` §USEFUL-DIFF 2 + `sdg_gate.js:106` | one accepted ORANGE fires one signed op, one hop, witnessed | verified-open (partially shipped) |
| 10 | O11 | Terminal open speed: staged pre-sealed rows + incremental `sealFrom` HAVE shipped since the 14 s profile — re-measure on the LIVE URL, then decide if Candidate C (batch-sign bulk classes) is still needed | `RESUME_MODELLER_TERMINAL_LOAD_LOD400.md` ⛔ signing | live `§STAT-TRACE` numbers on the real URL | re-measure — `kernel_ops.js:210/404` supersedes the old profile |
| 11 | O5 | full colour-parity: Modeller still paints the cosmetic PALETTE; real `material_rgba` RGB unused (only alpha recovered) | `MODELLER_RENDER_MATERIAL_PARITY.md` §Still-open | real per-element colour, before/after on Duplex + HHS glazing, witness | verified-open — `arc_editable.js:30-31` says so in its own comment |
| 12 | O1 | `rel_fills_host` missing on ALL five new residents (Clinic/Hospital/HHS/Garage/Terminal); the fresh `Clinic_extracted.db` ALSO lacks the table | LOD400 §START HERE OPEN 2 | `gen_rel_fills_host_patch.py` per building once its source IFC is locatable; guide Grid-Stretch sentence extended | ✅ **DONE 2026-09-18 — bim-ootb #1749 + #1750.** All five sources WERE locatable, each identified by the DB's own `project_metadata.source_file` rather than a filename guess. Recovered verbatim via the existing `gen_rel_fills_host_patch.py`: **HHS 218 edges / 99 rideable · Clinic 403 / 302 · Hospital 665 / 506 · Garage 220 / 36** — 943 new rideable host↔filling edges, every one matching its generator-predicted reach EXACTLY on the live scene (Duplex, for scale, is 36/38). **Terminal is deliberately NOT patched:** its source `TerminalMerged.ifc` (567 MB, identified by 5/5 GUID match) declares ZERO `IfcRelVoidsElement`/`IfcRelFillsElement` — the author never authored a void/fill chain, so the generator refused to write a file rather than invent one. That is a SOURCE DATA GAP, asserted in W-RFH-RESIDENTS F4 so nobody 'fixes' it by fabricating edges. So §DAGEVU's anchor/ride now works on **7 of 8 residents**, with the 8th explained by its own data. Witness W-RFH-RESIDENTS 15/15, RED-first |
| 13 | O14 | ~~SSAO + OutlinePass selection — blocked on vendoring EffectComposer~~ **RE-SCOPED 2026-09-30 (§ROW13-RESCOPE below): ambient occlusion = reuse the Viewer's Alt+G N8AO path; OutlinePass dropped** | `RESUME_MODELLER_COMPETITIVE_POLISH.md` §NEEDS-DESIGN 6/7 | lazy N8AO in the Modeller behind the same key + witness | verified-open, **not blocked but PARKED** (CORE BEFORE LOOKS, 2026-09-30) — see §ROW13-RESCOPE |
| 14 | O7 | per-mesh furniture orientation normalize-at-extraction (metadata lies: Dining_Chair z=0.14, FURN_DESK z=2.0) | `MODELLER_BOM_CATALOG_SPEC.md` §ALSO QUEUED | bake axis-permutation into vertices; witness tallest-axis==h | verified-open — no bake code in `extract_dagevu_catalog.py` |
| 15 | O7 | full 23,888-part library via httpvfs range-load — ⛔ BLOCKED: **where does the 220 MB `component_library.db` live (GH vs OCI)? user's call** | same §BUILD LEGS L1–L3 + §OPEN | W-LIBDB-RANGE: bytes-read ≪ 220 MB | verified-open — no `createDbWorker` anywhere in `modeller/` |
| 16 | O1 | §SEL-TINT-REFOLD: an authoritative re-fold drops the selection tint while `_selSet` still holds the mesh | LOD400 §START HERE OPEN 4 | tint survives cut/undo re-fold, witnessed | ✅ DONE 2026-07-30 (bim-ootb PR #1094, MERGED + LIVE-verified): `bonsai:refold` event + `_paintSel` repaint at the true choke point (+ shadow-flag re-apply, same root cause); witness `witness_e2e_sel_tint_refold.js` proven RED on unmodified main first, 9/9 with fix; W-E2E-CUT C6 now pixel-EXACT |
| 17 | O1 | Walk-ALL row reuses the singular tooltip | LOD400 §START HERE OPEN 3 | one string | ✅ DONE 2026-07-30 (PR #1094, LIVE-verified byte-fetch): conditional on `__ALL__` row; W-E2E-WALK-ALL A9 asserts both rendered titles |
| 18 | O1 | Terminal-scale proxy-mode downgrade silent to the user | LOD400 §START HERE OPEN 5 | toast/badge on the batch-hold fallback | ✅ DONE 2026-07-30 (PR #1094): once-per-run toast via existing `toast()`; B3 asserts n=1 where per-disc would be 4; A10 negative control 0 below threshold; walk-all suite 13/13. CACHE_VERSION v38→v39 same commit |
| 19 | O13 | `move-gizmo.png` recapture (wide shot amid close-up neighbors) — parked in the retired `GUIDE_VISUAL_QUALITY.md` lane | `RESUME_MODELLER_GUIDE_SCREENSHOT_FIX.md` §NIGHT 1 | recaptured close-up, opened + live-verified | ✅ **CLOSED 2026-09-15 — see §SWEEP** (recaptured bim-compiler #73; live bytes sha `22a794f4`, 423,928 B) |
| 20 | O13 | one live-bytes sweep: guide screenshots + claims vs the LIVE site (all captures were localhost) | master §KNOWN TRAPS | content-hash/curl pass against live gh-pages | ✅ DONE 2026-07-30: `§GUIDE-LIVE-SWEEP imgs=33 bad=0` + `§GUIDE-LIVE-HASH checked=33 mismatch=0` — every live guide image byte-identical to origin/master; live page carries the new wall section (3 hits) |
| 21 | O1/O7 | multi-part window sibling-clustering as a BOM — creates NEW relations (an authoring act, not recovery) | LOD400 §NEW ARCHITECTURE QUESTION | design call | ⛔ BLOCKED: user's design call, unscoped |
| 22 | O9 | gate residuals: one-click revert of a RED · UBBL named checks · rtree prune at Terminal scale | `RESUME_MODELLER_CONFORMITY_GATE.md` §NEXT | each its own witness | verified-open (door-crush + abuts-realign + Save-gating SHIPPED — see stale-claims) |
| 23 | O10 | W-DW-DENSITY-TE D3 density drift (ELEC 94.3 / FP 92.0 / ACMV 94.8 vs ≥99%) — find what shifted, decide the band | `RESUME_GRAPH_MODELLER_INTEGRATION.md` §RESOLVED note | re-run + named cause | ✅ **the named D3 drift is FIXED — see §SWEEP** (D3 ENVELOPE 100% on all four discs). Row re-pointed at the live finding the witness still prints: ELEC over-count 1754 vs oracle 833 = 2.11× **→ 2026-09-30: stale (legacy walk); production measured-band walk 0.91–1.05×, per-class D4 green; the witness's one open RED is D4c (run classes as fixtures, ⛔ red1) — §SESSION 2026-09-30** |
| 24 | O5 | `smoke_arc_only.js` SampleCastle iteration produced no output/screenshot — flagged, never chased | `MODELLER_RENDER_MATERIAL_PARITY.md` §Still-open | root-caused or cleared | verified-open (flag only) |
| 25 | O14 | PBR texture maps (biggest lift) · per-instance hide + full virtualization · BCF IMPORT (export MVP shipped #620) | `RESUME_MODELLER_COMPETITIVE_POLISH.md` items 9, §DECISIONS 2, §COMPETITIVE | — | verified-open (deferred by design, in this order) |
| 26 | O4 | solid-scale B-rep (occt `Copy=true` recompile or shape-lifecycle rework) | `RESUME_MODELLER_POLISH.md` 3b | — | ⛔ user-gated deferred ("only if authored-wall scaling becomes a real need") |
| 27 | O14 | accept an EXTERNAL (FreeCAD/neutral) IFC → snap to substrate → walkers complete it | `prompts/Modeller/COMPETITIVE_FREECAD_INTEROP.md` §4 | — | ⛔ BLOCKED: future feature, user greenlight |
| 28 | O15 | render-layer tilt gap: **293** tilted elements in the shipped `SampleCastle_ARC.db` (post-embed-8) measured rendering with IDENTITY transforms live 2026-07-10 — yet `§ARC-3AXIS` code exists on main (`arc_editable.js:231` passes rotX/rotY, `bonsai_library.js:78` applies the Euler); the branch is not firing on this data and nobody knows why | `GRID_ROTATION_GUARD.md` §5 | re-measure fids 933/1291/2514 on today's main; if still identity, trace why the tilt branch never fires; witness vs analytic 3-axis AABB | ✅ **DOES NOT REPRODUCE — CLOSED 2026-09-18, see §SWEEP.** W-ARC-3AXIS on all 293: seeded 293, genuinely rotated 230, **0 dropped**, against a 2,354-element control. The 2026-07-10 finding predates §GEO-SERVED (#1090), when the Modeller still drew boxes. Guarded by W-ARC-3AXIS (bim-ootb #1738) |
| 29 | O15 | ⛔ `CONSTRUCTION_GRID_BOM_DUAL_MODEL.md`: grid ⊗ BOM as ONE authoring substrate — spec-only, 3-stage build plan + 5 witnesses, 0 built (except W-TYPICAL-N 26/26 which already exists via `bom_extract`) | that file §STATUS/NEXT | — | ⛔ BLOCKED: user — is this still the intended architecture? (Watchdog-flagged 2026-07-30) |
| 30 | O15 | `WALL_HEIGHT_SCALE` cascade hardcodes `axis:'y'` as vertical (Y-up assumption, wrong for the Z-up Modeller) — dead code today (`isRoof` always false) but armed the day roof/ifcClass support arrives | `GRID_ROTATION_GUARD.md` §8 note | own design pass when roofs become grid-governed | deferred — documented in-code, in-file, and here |
| 32 | O1 | `witness_e2e_delete` D4 is RED on unmodified bim-ootb main — found (not caused) by the rows-16-18 session, diagnosed pre-existing, left untouched | rows-16-18 report 2026-07-30 (PR #1094 findings) | root-cause + fix or re-point the witness, RED-first discipline | ✅ **CLOSED — see §SWEEP.** bim-ootb #1704 (2026-09-10) routed soft-delete through the history tree; W-E2E-DELETE re-run 8 PASS / 0 FAIL, D4 green |
| 33 | O2 | **empty-slab refusal (Watchdog directive):** an empty layer slab must be a REFUSAL, not an announced row. Extractor: per-layer assertion `face_count > 0` in `compile_layer_geometry()`/witness — any empty slab ⇒ loud refuse (element stays gated RED), never ship partial; then re-slice the 2 affected 7-layer walls — root-cause first: the shipped diagnosis says the authored body spans 0.493 m of the 0.550 m set (§LAYER-PARTIAL, "layers belong to the neighbour wall"), the Watchdog hypothesizes opening-boolean-cut leaves last slices outside remaining material — MEASURE which is true on `2O2Fr$t4X7Zf8NOew3FNbT` before fixing; if the source genuinely doesn't author those layers' material there, the refusal stands and the wall is honestly RED until resolved | Watchdog live-query 2026-07-30 + `RESUME_MODELLER_LOD400_REAL_GEOMETRY.md` §ROW33-EMPTY-SLAB-REFUSAL | witness gains per-row `face_count>0`; the 2 walls either 7 real slabs or loud RED; falsify by re-introducing an empty row | ✅ DONE 2026-07-30 (extractor half; W-LOD400-ENVELOPE **16/16**, RED-first: pre-fix code fails exactly the 4 new checks): root cause MEASURED — the Watchdog's opening-cut hypothesis is **FALSE** (both walls carry ZERO openings; an authored `IfcPolygonalBoundedHalfSpace` clip at the layer-4/5 boundary trims the neighbour-side stud+plasterboard — Revit unit-demising, material genuinely absent) → refusal stands per the directive; empty slab now raises `LayerRefusal`, `verify_layer_geometry` refuses `face_count<=0` rows, Duplex gate honestly RED 2/80 exit 1 BY DESIGN (like sporenkap — do not soften). Residents half ✅ SHIPPED same day (bim-ootb PR #1099): live `Duplex_geo.db` partial ship withdrawn — trimmed hashes reverted to original envelopes, geoV 4→5, sw v41→v42, W-E2E-LAYERS-RESIDENTS **8/8 vs LIVE** RED-first; the live Modeller refuses both walls loudly (`§LAYER-ENVELOPE-REFUSE` ×2, ops 196→194, hardfail 0/194). FULLY DONE**⚖ EXCEPTION RULING 2026-07-31 (user + Watchdog, supersedes the refusal end-state):** an honest whole-layer subset IS LOD400 ("legit material part of the wall… not a blocky fall back") — kept `face_count>0` per row, DROPPED count==layer_count; the two walls came BACK as 5 real slabs (bim-compiler #62: gate GREEN 0/80, W-LOD400-ENVELOPE 15/15 RED-first; bim-ootb #1102: geo v6, 196 meshes refused=0, W-E2E-LAYERS-RESIDENTS 8/8 vs LIVE). See §ROW33-EXCEPTION |
| 34 | O1/O8 | **anchor export/save leak — the guardrail's unchecked surface (Watchdog directive):** anchors are proven invisible to render/Outliner/picks/audits, but NOTHING checked whether the 65 phantom ops leave in an EXPORT — `bonsai_ifc.js` IFC export and `sdg_save.js`/`saveModelDb` physical snapshot both fold from the op-log where `commitSeedGroup ops=3290` includes them | Watchdog 2026-07-30; guardrail spec in `RESUME_MODELLER_LOD400_REAL_GEOMETRY.md` §START HERE OPEN 1 (✅ APPROVED block — "every count" includes exports) | witness: IFC export + Save snapshot with anchors present are element-identical to pre-anchor baseline (or anchors explicitly excluded + §ANCHOR-tagged in both paths); RED-first against current main | ✅ DONE (witness) 2026-09-27 — IFC half already closed by #1747 (E4 ANCHORS-OUT); Save half proven by bim-ootb #1787 W-E2E-ANCHOR-SAVE-ROUNDTRIP 6/6 (SampleCastle save→re-open: 65 anchors stay invisible, visible 3225 / gate 3225 / IFC 3225+65 identical, verify=true; falsify one stripped flag → 64/3226/verify=false). No leak. See LOD400 file §ROW34-ANCHOR-SAVE |
| 31 | O15 | oblique (non-orthogonal) grids — the scale-hardening lane's one genuinely open question; a NEW feature never requested | `GRID_ROTATED_SCALE_HARDENING.md` §3 | — | ⛔ BLOCKED: user interest; do not build unasked |
| 35 | O15 | **drag handle for walked fixtures** (red1 2026-09-30, Q4: "keep the POC simple"; NOT built now). A walked fixture (instanced) is identify-only: click → `walked PLB · FlowTerminal … (generated — identify only)`, Move stays disabled (measured, W-FIRST-STEPS-MEP step 5), Drag Item refuses walked items, and a gridline drag moves walls + hosted riders only (guide: "fixtures stay put"). So the MEP re-route (`W-MEP-REROUTE`, 524 ms on live Duplex) can only be driven by the engine's signed GEOM_MOVE today. | move a walked fixture by hand → the network re-routes; `W-FIRST-STEPS-MEP` step 5 driven by the gesture instead of the engine commit | `TM_4D5D_VARIANCE_LANE.md` §S9, First Steps Part 3 | ⬜ not built |
| 36 | O1 | **§GEOM-KEEP-RG — a Walk erased the building (FIXED 2026-09-30, bim-ootb #1801):** after `Walk PLB` the Duplex ARC meshes went 196 → 27 (214 × `§BONSAI insert fold fail … LOD400-REFUSE realGeomHash … not registered`). Root cause `bonsai_library.js` `ensureMesh` lazy catalog load did `this._geom = j`, wiping the `rg:` real meshes registered at seed; the next refold refused every ARC insert. Found only because the first-steps screenshot showed an empty grid. | `W-FIRST-STEPS-MEP` step 3/7 assert `buildingMeshes >= 196` after the walk and after undoing it | `witness_first_steps_mep.js` | ✅ fixed + witnessed (local 8/8) |
| 37 | O1 | x-ray state after a walk: the walk's x-ray reveal restores to SOLID (174 solid meshes) and the pipes then sit inside the opaque building; even the X-ray pill's glass still takes the click, so a pipe cannot be clicked/selected by hand (measured: 0 unobstructed points, sweep meshes did not select with the ARC hidden). After undoing the walk the x-ray was seen ON (196 glass) in one run — re-measure. | click a pipe → selected; x-ray state restored after undo | W-FIRST-STEPS-MEP step 4 note | ⬜ open |
| 38 | O15 | **§GRID-SPAN-GATE — a grid drag must not stretch a structural bay past its span limit** (red1 2026-10-02: "columns have to bear load as industry stds. We cannot drag long leaving columns stretched out"; "those coloring is brilliant"; "display ie 'limit for this column. Add one more?' when user hovers over the red"). EXISTS, unwired: `str_walker.js:192-215` `SW_SPAN_RULES` (Eurocode-cited preliminary rules — STEEL max 18 m, depth≈L/20, δ≤L/360; RC max 12 m, depth≈L/12, δ≤L/250) + `swCheckGirder` → GREEN/ORANGE/RED, used today only by the STR walker tab (`str_walker_bridge.js:331`). `bonsai_gridmove.js`/`sdg_gate.js` have NO span check. BUILD: (1) during a gridline drag, colour every bay the drag widens/narrows with `swCheckGirder` live (no new thresholds — the table is the only source; material from the building's measured beam/column class, else ⛔ refuse to colour rather than guess); (2) ORANGE hover = the required preliminary depth (span/ratio); (3) RED hover = "Limit for this column span (<max> m, <material>). Add one more?" → one click inserts a column line at the bay midpoint, columns COPIED from the building's own existing column type/section (never invented); cancel keeps the drag refused at the limit; (4) every message carries "preliminary — the structural engineer confirms". Applies only where the grid comes from columns (column-framed); wall-bearing bays use no beam rule. | `str_walker.js` §REGULATORY HANDLER; `GRID_KINEMATICS_SANDBOX_PROOF.md` | witness: drag a Garage (real IfcColumn 140 / IfcBeam 195 in its ARC) gridline across the RC/steel limit → `§GRID-SPAN` lines show GREEN→ORANGE→RED at the exact table spans; hover text carries the limit; "Add one more" adds N columns == lines crossed, each a copy of the measured type, bay spans halve, colour returns GREEN; undo = one step (§ONE-GESTURE-ONE-UNDO); RED-first: today's main colours nothing | ✅ **DONE 2026-10-02** — bim-ootb #1803 (sw v73) + witness #1806; W-GRID-SPAN-GATE **20/0 vs LIVE**; see §GRID-SPAN-GATE RESULT |
| 39 | O8 | **§THREADS — category/element threads on the history dotline + scoped undo along a glowing thread** (red1 2026-10-02). One log, many views: chips `+ Walls (4)` expand a per-type strip; tap → blue glow + "Undo: Walls only" → Ctrl+Z/Y travel that thread only; scoped undo APPENDS a revert (never erases); dependents cascade or are refused by name. Shared with Viewer/ERP via `common/history_bar.js` `categorize(entry)`. | `HISTORY_PARALLEL_TIMELINE.md` §THREADS (the spec) + §THREADS-STEP1 + §THREADS-STEP2-HOLD | 3 steps there, each RED-first | **step 1 ✅ / step 2 ⏸ HOLD (red1: ponder a better shape)** — step 1 = read-only category scrubber, LIVE (bim-ootb #1807 + follow-up), W-HISTORY-THREADS vs LIVE; step 2 on `wip/history-threads-scoped-undo`, no PR |
| 40 | O3 | **§SCRIPTED-EDITS — HOLD until §THREADS steps 1-2 + §ADHOC-WF-BATCH exist** (red1 2026-10-02 brainstorm, sobered and agreed: "Keep scope in check, align well, or hold off"). Script = Find selector + existing Modeller action + target values ("Level 2 windows → 1.2 m wide"), run as a PENDING branch (preview → accept/discard), every step through the same gates as a manual edit (span gate, LOD400-or-refuse, conformity), optional budget gate on the §S8 cost Δ. Later, only if the library grows: constraint SEARCH over existing designs ("fits A×B, 2 rooms, 3 windows, 1 door, <10k") → pick → mould. OUT OF SCOPE: generative layout (inventing a plan from constraints) — conflicts with §STRATEGY "no original object making". | this row | — | ⏸ HOLD — do not build before its prerequisites |
| 41 | O15 | **§EDIT-REPORT — after an edit, say what changed, what was checked, red ink before → after, and what was NOT checked** (red1 2026-11-07: "another wow feature"). Slice 1 = one grid move. Reports only. Slice 1 ✅ LIVE (bim-ootb #2674), RESULTS at the end of this file. Later slices need their own go. |

### STALE-CLAIMS — verified SHIPPED on origin/main; do NOT re-open (grep-verified 2026-07-30)
- **O12 zoom-to-selection**: SHIPPED — `§ZOOM-SEL` (#711), `modeller.html:1057`, `witness_e2e_zoom_to_selection.js` exists. The triage's "small, well-specified" read was stale.
- **O8 Save = CompleteIt-shaped**: SHIPPED — `sdg_save.js` + `modeller.html:2539-2690` (auto-heal, RED block, heal-induced clarity, 'Clean, saving…'), witnesses `witness_e2e_save.js`/`witness_e2e_save_blocked_focus.js`. DocAction question ANSWERED in code: Save does NOT call `erp/ad_docfsm.js` (mirrors its Error/Clean contract only) — `sdg_save.js:8`.
- **O11 op-log autosave quota**: SHIPPED — IndexedDB fallback (`§AUTOSAVE_FIX`, `bonsai_oplog.js:25-26`, `witness_e2e_autosave_idb_fallback.js`).
- **door width/crush RED**: SHIPPED — `sdg_gate.js:99` + witness A7 (the GRAPH file's "still missing" is stale).
- **backprop first slice**: abuts-realign ORANGE flags SHIPPED (#647) — only the accept-gated APPLY remains (row 9).
- **World History wiring**: SHIPPED — mount at `modeller.html:221` + `witness_modeller_worldhist_pill.js`.
- **disc-walker envelope-bound + yaw render**: SHIPPED — envelope-bound cells + `§DW-CAP` (`disc_walker.js:644-673`), `§DW-ROT-UNIT` yaw fix (`modeller.html:4053-4058`); guide Walk-ALL section re-landed (`docs/ModellerGuide.md:493`).
- **O6 anchor semantics**: DONE (PR #613, W-ANCHOR-SWEEP 15/15). Its parked "viewer can't stream a raw modeller extraction (`elements_meta.building` missing)" note: fixed at source, bim-compiler `dcd5260e9`/`74e0e3551` (§KUL001).
- **§LODHELL-FIX-2 dead no-boolean tier**: DELETED (`extractIFCtoDB.py:1179` records the deletion).
- **O4 direct-manipulation spine + H1 top-view Z-drag + polish batch**: all shipped (PRs #423-#631 arc) — the 2026-07-07 correction in `MODELLER_DIRECT_MANIPULATION.md` already said so; re-confirmed.
- **Resident roster changed under the triage**: RESIDENTS is now EIGHT per-building split entries (SH/DX/SC/HHS/Clinic/Hospital/Garage/Terminal, each `geoDb` on object storage, `str_walker_outliner.js:51-58`) — any older "4 residents"/"mesh.db" wording in the 15 files is historical.

**O15 stale-claims (grid family, verified 2026-07-30 — grep/sqlite against origin/main, do NOT re-open):**
- **Smart element scope**: SHIPPED — `_STRUCTURAL_CLASSES`/`_localityRadius` (`bonsai_gridmove.js:64/109`) + `witness_gridmove_smart_scope.js` on main. The triage's "harvest — 10 open" was stale; the file's own §4 records DONE 2026-07-09.
- **Green/orange pre-drag preview**: SHIPPED — `toggleOverride`/`applyOverrides` in `bonsai_gridmove.js` + `witness_e2e_grid_greenorange.js`.
- **Clear-state-leak rounds 1+2**: SHIPPED — all three `onClear()` wires live in `bClear.onclick` (`modeller.html:516`) + `witness_grid_clear_leak_round2.js`. The round-2 file's "PR TBD" resolved: it landed. Its cross_edges anchor-correction fork was ALSO resolved separately — PR #650 (real per-element AABB).
- **Tilt-guard + axis-scope**: MERGED as PR #722 (squash `3252d50`) — `_hasTilt`/`tiltXRad` + the x/y/z skip are on main, `witness_grid_tilt_guard.js` shipped, `W-GRID-SCALE-YAW-HARDENING` 21/21. The file's own §6-§9 "not merged, per instruction" is stale (it predated the push-pause lift). The remote branch `fix/grid-tilt-guard` is now redundant.
- **Kinematics sandbox**: all four tiers + the §3 worker-fold gap DONE 2026-07-09 per its own §5; `witness_grid_rotation_guard.js`/kinematics witnesses on main.
- **Scale hardening**: MERGED PR #721; only its §3 (oblique grids, row 31) stays open.

Rules that produced this list (keep for the next harvest):
- **Verbatim, with its home.** Never paraphrase an open item away from its file/section pointer.
- **Verify before listing.** A file claiming something is open may be stale — check the shipped code
  first (that mistake has already been made here: a 21-commit-stale checkout made shipped code read as
  missing). Mark each row `verified-open` or `stale-claim`.
- **Contradictions are findings.** Where two files disagree, list both and say which the code supports.
- **Live-vs-local is a first-class check** for anything user-visible — see §PRIME LESSON.
- **WORK-TO-ZERO** (`CLAUDE.md`): work top-to-bottom, never stop to report "parked", never loop on a
  blocked item — mark it `⛔` with the ONE question and move to the next.

### §ROW13-RESCOPE — 2026-09-30 (red1: "review whether EffectsComposer is deprecated … alt-g … good enough")
Measured on bim-ootb `origin/main` @ `3f962fb7`:
- **The "not vendored" blocker is stale.** `viewer/lib/` already ships `EffectComposer.js`, `SSAOPass.js`, `OutlinePass.js`
  (three's own, r184 headers) and `postprocessing-n8ao.bundle.js` (pmndrs composer + N8AO). The three core is **r186**
  (`viewer/lib/three.core.min.js` `REVISION="186"`). `modeller.html:434` and `:1078` still say "not in the vendored build".
- **EffectComposer is not deprecated for WebGL.** The r186 deprecation is WebGPU-only: `PostProcessing` → `RenderPipeline`
  (`three.webgpu.min.js` warns: *"PostProcessing" has been renamed to "RenderPipeline"*). Viewer and Modeller both draw with
  `WebGLRenderer`.
- **Use the Viewer's proven path, not SSAOPass.** `viewer/effects_gi_poc.js` (Alt+G) builds the pmndrs composer + N8AO
  **lazily on first press** (§GI_POC_LAZY — no GPU cost for sessions that never press it), skips mobile, and stays live
  while the camera moves. Alt+S is the slow still-only path. Its AO tuning history (§PHOTO_AO_DARK, radius/intensity) applies.
- **OutlinePass: dropped.** The Modeller's EdgesGeometry selection outline (`modeller.html:1078`) already does the job
  without a composer.
**Slice:** lazy-load the same bundle in the Modeller behind the same key; fix the two stale comments. **Witness:** `§` line
with composer built=false before the first press / true after, AO pass present, and frame time on Terminal (35,552
elements) before vs after — RED-first = the key does nothing on today's main. **Open, unmeasured:** N8AO frame cost at
Terminal scale; whether the Viewer's AO numbers suit the Modeller's lighting.

## 🚧 KNOWN TRAPS — do not rediscover these
- **`console.warn` is invisible** in DevTools' default filter. Failure paths use `console.error`.
- **A 12-triangle mesh is not proof of a fake box.** A plain extruded rectangle IS 12 triangles. But a
  fake box CANNOT carry a door/window cut — that is the real discriminator.
- **Both a fake proxy box and a plain wall's real shape are 12 triangles**, so the 2026-07-02 fake-box
  fix looked dramatic on SampleCastle and invisible on Duplex. Neither observation is a regression.
- **Guide screenshots were taken on localhost.** They are not evidence about the live site.
- **`disc_walker.dwInit` defaults to `terminal_rules.db`** — a residential caller must pass
  `duplex_rules.db` (Walker Doctrine, `CLAUDE.md`).
- **Never edit the shared `~/bim-ootb` checkout** — a PreToolUse hook blocks it. Work in a `/tmp/wt-*`
  worktree, and reuse an existing one (`git worktree list`) before creating another.
- **DB changes ship as a SQL patch + self-heal loader, never a committed binary** (`CLAUDE.md`).


---

## §CIVIL_IN_MODELLER — should the Modeller cover civil works? (recorded 2026-10-06, moved from CIVIL_HIGHWAY_JELAPANG.md)
User-pasted DeepSeek opinion, our reading: agrees with our position — Bonsai/Saikei give IFC4.3
civil SEMANTICS (IfcAlignment, IfcCourse, IfcRoad as a target schema), not our gap (compliance on messy IFC2X3, browser local-first, mesh-level
measurement). Its specific claims are UNVERIFIED by us (Bonsai alignment described as a "stop-gap", CSV import; rail-first workflow). Worth
taking: the IDS gate pattern (write contract → re-open → test → BCF) as the shape of the §MC report; IfcCourse layers as the IFC4.3 target.
Consistent with the Modeller strategy (memory project_modeller_assemble_handoff_strategy): we do not author roads from scratch — we ASSEMBLE
and HAND OFF; civil in the Modeller = consume IFC4.3 classes and mould authored objects.

**Status 2026-10-06:** BUILT — bim-ootb PR #1887 (sw v1579, auto-merge). `witness_civil_ref_look.js` GREEN L1/L2/G1/G0:
Merged.db ground 32.90 → 30.52 m (= sqlite oracle), ROW outline 43,256 segments in #d04fd0, earthworks 0.28 / depthWrite off;
JELAPANG_AFTER.db (no terrain) p2-bottom 43.46 m unchanged. RED control on main: L1/L2/G1 RED, G0 GREEN. Fleet: 18 DBs, 0 EARTHWORK/ROW rows.

### §MERGE_FOLD_TOPUP — merge into an already-drawn building (2026-10-06)
Measured RED on main (`witness_merge_fold_refresh.js`, partner-only DB folded into JELAPANG_AFTER.db): Find tree grew 0 of 9,490
AND 0 of 9,490 folded elements drawn — `added=[]` queues nothing. Fix (scene.js + streaming.js): rows NEW to the live DB
(`A._mergeNewGuids`) that land in a drawn building are re-queued as a guid-filtered top-up stream (`§MERGE_FOLD_TOPUP kept=`),
and the open Find tree refreshes at fold end (`§FIND_REFRESH why=merge-fold`). After: GREEN — tree +9,490, 9,490 drawn,
`guidMap=19903 streamed=19903 orphans=0` (no duplicates).
Regression: witness_scene_merge_ifc PASS. witness_scene_merge_2026-07-30 already RED on main (3 claims — its Duplex fixture copy
now holds 21 elements the served copy lacks); with the fix those 21 are drawn (`kept=21`), ~18 s of post-stream passes under
GPU=sw push its click past 30 s → harness timeout. merge_save_roundtrip / open_split_db_pair: fixtures live in old session
scratchpads (missing) → not run.


Related: IFC4.3 target classes and the alignment-first rule — docs/BrowserScaleBenchmark.md (§IFC43).
## §EXPORT-ROUNDTRIP — SPEC DRAFT 2026-11-08 (owner's queue item 2: "export gaps"). Measure first, then finish the spec, then code
**Issue (measured in G2, §RESUME 2026-11-07, on the private set):** a walked export held 0 `IfcBuildingStorey` (everything sat directly in the building) and none of the 3,170 routed runs (0 swept solids, 0 ports). Only 2,323 of the DB's 6,461 elements came through the seed. So what the Modeller assembles does not reach the hand-off. Writer owner: `modeller/bonsai_ifc.js`; export entry `viewer_db_export.js` / the Export menu.
**Design points (design lane, 2026-11-08; not measured by it):**
1. **Round trip with a denominator.** Export, re-open with the SAME route, then compare by class, by storey and by position in that route's frame, as X of N. Red control: an element deliberately dropped must turn the check red.
2. **What the IFC must carry back, beyond elements:**
   - storeys with their elevations (`storey_elevation`, so elements are contained in their storey, not in the building);
   - the stated grid (`ifc_grid_axis`, #2702);
   - the file's rooms (`ifc_spaces`);
   - the `BIMOOTB_Walk` set: provisional devices stay in the file, labelled. Only totals leave them out.
3. **Frame:** export writes the frame it read: the file's stated site placement / map conversion, not a map offset baked into every placement. This must agree with the owner's ONE-FRAME ruling below.
4. **Routed runs:** export only what the walker placed with a real basis. The drawn-route record is plan only, so it reaches the IFC only after the height step (§7.1), and then as the Axis-only duct the owner has yet to rule on.
**Owner ruling that touches this (2026-11-08, relayed by the design lane, CORRECTED the same day): ONE FRAME = "Local + recorded offset".**
- Both IFC routes follow the Viewer import's existing rule: shift a far-away model to a local origin and record the shift in `project_metadata` (`georef_offset_x/y/z`, import_worker.js 700-755). The map position stays exact and recoverable.
- Also restore the dropped site latitude/longitude: on the import today, `site_latitude` is empty and `site_latlong_source=unknown`.
- **So the change is the Modeller OPEN route** (`ifc_open_db.js` / `ifc_extract_core.js`, this lane): it keeps the map offset today. The import route needs only the lat/long part.
- Spec before code. W-IFC-GRID must stay green: the axes move with the elements.
- Export (point 3 above) writes the recorded offset back as the file's site placement.
- (An earlier relay, "keep map coords", was a misdescription and is withdrawn.)
**First step for the next session:** re-measure G2's gaps on main (`8d1ede96` or later) with a round-trip witness, as X of N per class, per storey and per carried table, on a public resident (Duplex) and then the private set. Write the measured table here, then the rule and the build.

## §IFC-EXPORT-DEPTH — SPEC, 2026-09-26. Priority 3 (builds on §IFC-EXPORT-SEED below).
Today the export carries shapes + classes only (status reads `walls=0` for an opened building, `modeller.html:~3042`).
A user hands the IFC to the next tool, so depth decides whether our output is usable. Add, each from data we already hold:
(1) IfcBuildingStorey containment (storey names on every seeded/walked element); (2) IfcMaterial from `material_rgba`/material
names (the §COLOR-PARITY source); (3) Psets — at minimum the element's extracted properties and, for walked MEP, the signed
provenance (`_dw.prov`, rule id, pipe product); (4) opening/void relations for cut walls. **Witness:** round-trip — export
Duplex → re-open with the same IFC extractor → per-class counts, storey assignment, material and Pset presence equal to the
source (numbers per class, base = today's export). Validate against IfcOpenShell (the user's fork is prior art).

## ▶ §IFC-EXPORT-SEED — SPEC for row 36 (2026-09-18). Written before any code.

**MEASURED DEFECT, not inferred.** Open Duplex — 196 elements on screen — then call `Bonsai.ifc.build()`:

```
§OPLOG      {"GEOM_INSERT":196}  total=196
§ON-SCREEN  meshes=196
§EXPORTED   {"walls":0,"openings":0,"rels":0,"arrays":0,"bytes":592}
```

**592 bytes. Zero products.** A user who opens a resident and picks Export ▸ IFC gets an empty IFC4 file
with a header and nothing else. `bonsai_ifc.js build()` branches on exactly three op types —
`GEOM_EXTRUDE_POLY` (:112), `GEOM_CUT` (:123), `GEOM_ARRAY` (:142) — and **every ARC-seeded element is a
`GEOM_INSERT`** (`arc_editable.js:342`). The three handled types match zero ops in a real resident.

### What to build
Handle `GEOM_INSERT` in `build()`. Per element, emit one IFC product typed from `params.ifc_class`.

**Geometry: reuse the RENDERER'S OWN vertices — do not re-derive the transform.** This is the direct
lesson of §XEDGE-GEOWIRE, learned today at the cost of 843 wrong edges: `cross_edges.js` re-implemented
"world = centre + R·vert", called it "the same final numbers, fewer steps", and was wrong for 798 of 934
elements. The folded scene meshes already carry **world-space positions baked into the geometry** —
measured: every mesh's `matrixWorld` is identity and `geometry.boundingBox` equals
`Box3.setFromObject`, max delta `0.000e+0` over 3,290 meshes. So the export reads
`mesh.geometry.attributes.position` for the fid and emits those coordinates verbatim. Byte-parity with
what the user sees is then structural, not something a witness has to chase.

**Encoding:** `IfcTriangulatedFaceSet` over an `IfcCartesianPointList3D` — both confirmed present in the
vendored web-ifc build, along with every class below. This is IFC4's native triangle-mesh form; no
tessellation, no approximation.

**Class map** (`params.ifc_class` → entity), extracted from the resident, never invented. Duplex's real
census: `IfcWallStandardCase` 56 · `IfcFurnishingElement` 61 · `IfcSlab` 21 · `IfcWindow` 24 · `IfcDoor`
14 · `IfcCovering` 13 · `IfcRailing` 4 · `IfcStairFlight` 2 · `IfcWall` 1. An unmapped class falls to
`IfcBuildingElementProxy` — the honest IFC answer for "a real product whose specific type this exporter
does not model", and it is COUNTED and `§`-logged, never silent.

### Binding constraints
1. **Anchors are excluded.** `params.anchorOnly` elements are invisible ride anchors; the user's binding
   condition is that they stay out of EVERY count, pick, audit — and an export is an audit. Duplex has 0,
   SampleCastle has 65, so this is not theoretical. Skipped and counted separately.
2. **No silent substitution.** An element whose mesh cannot be resolved is NOT quietly emitted as a
   bounding box. It is counted and named in the `§IFC-SEED` line. A box standing in for authored geometry
   is the §PRIME LESSON fault this file opens with.
3. **The three existing op types keep working byte-identically.** `GEOM_EXTRUDE_POLY`/`GEOM_CUT`/
   `GEOM_ARRAY` and their witness (`W-IFC-ROUNDTRIP` via `reimport()`) are untouched.

### The witness — W-IFC-EXPORT-SEED
Claims, each naming the issue it proves:
- **E1 NOT-EMPTY** — exporting Duplex yields > 0 products. RED today at exactly 0/592 bytes.
- **E2 COUNT-EXACT** — products == non-anchor `GEOM_INSERT` ops. Not "> 0": the exact number, so a
  partial export cannot pass.
- **E3 REAL-GEOMETRY** — re-import the emitted bytes and assert the triangle count of a named element
  matches the scene mesh's. Proves shapes, not just product rows.
- **E4 ANCHORS-EXCLUDED** — on SampleCastle (65 anchors), products == ops − 65.
- **E5 NO-BOX-SUBSTITUTION** — the `§IFC-SEED` line's fallback count is 0 on Duplex (196/196 resolve), and
  any non-zero value is reported, never hidden.

### Out of scope, stated so it is not mistaken for done
Materials/colours, property sets, spatial hierarchy (`IfcRelContainedInSpatialStructure`), and re-cutting
openings as `IfcOpeningElement` against seeded hosts. This slice makes the export carry the building's
real shape; it does not make it a fully-furnished IFC. Row 36 stays open until that is stated in the row.

## ▶ §GRID-SPAN-GATE — SPEC 2026-10-02 (row 38, queue item 1b). Written before any code.
**MEASURED before building (HospitalGarage, real Open, headless; log `§STRWALK-INIT` / `swbTabData`):**
(a) **The authoring grid is NOT column-derived on the real Open path.** After Open, `Bonsai.grid` is still the default
A–D × 1–3 (`xs=[0,4,8,12]`) — nowhere near the building (columns sit at x≈135, y≈171). The STR walker measured a column-framed
lattice (`grid=17×29`, rot −2.000°, 140 columns, 228 girders) but nothing hands it to `Bonsai.grid`. A span gate on today's grid
would colour nothing real. → Build step 0 below wires it, honestly (only when the walker is column-framed AND the grid is still
the untouched default; a user-authored grid is never replaced).
(b) Material is not in `elements_meta.material_name` (NULL for all 335 STR column/beam rows); it IS in `element_name`
("Concrete-Square-Column:24 x 24", "Precast-Rectangular Beam:15 x 28 …") → **RC**. Read by keyword over the building's own
IfcColumn/IfcBeam names (`concrete|precast|reinforced` → RC; `steel|wide flange|W-shape|HSS` → STEEL); mixed or neither →
`§GRID-SPAN material=unknown refused`, no colour.
(c) The scene's 140 IfcColumn are the walker's skeleton (`provenance derived:grid`, bbox boxes). The building's real column mesh
is `element_instances.geometry_hash` of the source IfcColumn → the geo db (`resolveHashes`). "Add one more" copies THAT (same
hash), never a box; no resolvable hash → refuse, reason named.
(d) Garage girder spans (walker): 5.486 m ×74, 16.764 m ×83 … Table: RC depthRatio 12, max 12 m.

**Definitions (one source each, nothing invented).**
- **Bay** = a walker girder piece (its two end datums). Span = |u(to) − u(from)| in the LATTICE frame (θ-aware, same frame
  `swReWalk` uses). Signal = `swCheckGirder(span, {material, proposedDepth})`, `proposedDepth` = the building's MEASURED median
  beam depth (`_state.section.depth`, 0.535 m on Garage). So **ORANGE** ⇔ span > depth × depthRatio (0.535×12 = 6.42 m),
  **RED** ⇔ span > `SW_SPAN_RULES[mat].maxBeamSpan` (12 m). Both thresholds are the table × a measured number.
- **Fold, not memory.** Gate spans = pristine walker base (`_state.base0`) + the ACTIVE op-log (GEOM_GRID_MOVE deltas, and
  `params.spanSplit` columns, in order, ≤ cursor) — so Ctrl+Z / Ctrl+Y / scrub revert spans deterministically (the walker's own
  `_state.base` is imperative and is NOT undone; the gate never reads it).
- **Add one more** = one `GEOM_INSERT` per girder piece of the over-limit bay, at the bay midpoint on that girder's datum, copy of
  the girder's FROM column (`realGeomHash`, measured bbox, yaw, colour) with `params.spanSplit = {axis, index, pos, girder, srcGuid}`.
  "Lines crossed" = the perpendicular gridlines carrying a girder in that bay = number of pieces split = columns added. The new
  line is folded into `Bonsai.grid` (`foldFromOplog` handles `spanSplit`), so the grid shows it and `gx/gy` indices stay right.
- **Gesture.** Release on RED does NOT commit; it opens the prompt. **Add one more** → ONE `commitGesture` =
  [GEOM_GRID_MOVE + riders (as today) + the added GEOM_INSERTs] → one Ctrl+Z. **Cancel** → the drag commits at the clamped delta
  (widest affected bay = max span). Wall-bearing walker state → gate off (`§GRID-SPAN system=wall-bearing skip`).
- Every message carries "preliminary — the structural engineer confirms".

**Witness W-GRID-SPAN-GATE** (`modeller/tests/witness_grid_span_gate.js`, real Open, real mouse, one `§GRID-SPAN` line per step).
RED-first: on main the gate does not exist → G1 (grid column-derived) and every colour step FAIL. Falsifier: `GSG_BREAK=1`
(page flag `__gsgBreakRule`, rule table lookup returns an unbounded limit) must turn the witness RED.

### §GRID-SPAN-GATE RESULT 2026-10-02 (log: scratchpad `w_final.log`, `live2.log`; witness `modeller/tests/witness_grid_span_gate.js`)
- **Local 20/0, LIVE 20/0** (live bytes sha1-matched origin/main for grid_span_gate.js, modeller.html, bonsai_grid.js). Falsifier `GSG_BREAK=1`: **4 PASS / 9 FAIL** (RED as required). Regressions green: gridundo 8/0, gridstretch_multi 21/0, gesture_undo 6/0, first_steps 9/0/0, str_rewalk 9/0, gridmove_real 8/0, gridstretch 7/0, greenorange 13/0.
- **Spec amendments found while building (supersede the SPEC text above where they differ):** (1) Garage names are MIXED (beams RC 166, steel/HSS 29 of 195) — material = strict majority of the building's IfcBeam names (logged `mixed=true`), tie/none -> refuse. (2) Garage sits at z≈165 m: the grid is drawn/dragged at the columns' foot (`Bonsai.grid.z`, `GROUND.constant` while Move Grid is armed); every authored grid keeps z=0. (3) Real Garage walker girders include far-apart artefact pairs (e.g. 125 m, RED at baseline) and 16.764 m spans (RC table: RED at baseline); the witness uses gy8 (5.486 m bays, 5 girders each) — the gate colours what the walker holds. (4) A line dragged past its neighbour is NOT blocked by this gate (gy8 +6.6 m crosses gy9 at 5.49 m); a separate rule. (5) Left open: the 12 m girder boxes of the walker skeleton are not split visually; only columns + grid line + spans fold.
- Measured transitions (gy8, 0.1 m steps): GREEN->ORANGE bracket 6.386|6.486 around T1 = 0.535 x 12 = 6.420; ORANGE->RED 11.986|12.086 around 12. Add one more: 5 columns == 5 girders in the bay, all hash 6f01c8f9014e540a == element_instances hash of their source columns; 12.086 m -> 6.043 m x10 pieces, GREEN; grid 29->30; one Ctrl+Z -> 0 added / 29 lines / 5.49 m; one Ctrl+Y -> 5 / 30.

## §2026-10-06 FINDING — Modeller never asks for persistent storage
Found by the dev-toolkit triage, `bim-ootb prompts/DEV_TOOLKIT_NO_AI.md` §7 (2026-10-06). Read from bim-ootb `origin/main` @ fb183ddf. Not fixed — this lane decides.
- `navigator.storage.persist()` is called in `erp/erp_persist.js` and `viewer/scene.js`; no call in `modeller/`.
  Without it the browser may evict Modeller's local data (Safari ~7-day rule, `erp/DistributedERP.md:323`).

## ▶ §EDIT-REPORT — SPEC 2026-11-07 (row 41). Written before any code. Nothing built.
red1 2026-11-07: *"giving underlying proofs, report on what is been changed, checked, and how much red ink (clash, safety, structural) comparison. This by itself can be a new feature in our Modeller during authoring of grid or bay"* · *"it be another wow feature."*

**The feature.** After an edit, the Modeller says what changed, what was checked, how the red ink moved before → after, and what was NOT checked. It reports only: the edit stands, the user decides (same spine as §GATE-1). A person dragging a grid is the first user; an outside proposer later reads the same record (`NEURO_SYMBOLIC_ORDER_CONTRACT.md` §7), with no AI in the runtime.

**Slice 1: one grid move, nothing wider.** Column-derived grid on HospitalGarage, the §GRID-SPAN-GATE witness building.

**Read 2026-11-07 at bim-ootb `cddb6188`; most is already there:**
| Needed | Owner | State |
|---|---|---|
| What changed | `commitGridMove` (`modeller.html:2312`): delta, `res.commands`, `res.riders`, `res.verify` | Exists, only reaches `setStat` |
| One undo step | §ONE-GESTURE-ONE-UNDO | Exists |
| New clash, door-out, door-crush, clearance, abuts | `SdgGate.evaluate` via `_runGate`, already called on a grid commit (`:2325`) with a before-snapshot (`:2317`); result in `__lastGateDetail` | Exists, but **DELTA-only: it never counts what was already there** |
| Span signal | `GridSpanGate.fold` + `check` | Exists, but `preview` covers only the bays touching the dragged line |
| Refusal states | `Bonsai.gridspan.refused`, `§GRID-SPAN … skip` | Exists |
| Report-composer pattern, verdict words | `reg_report.js` (composer takes numbers from owners; PASS / FINDINGS / INCONCLUSIVE) | Pattern to copy |
| Beam and column rules | `viewer/structural_sanity.js` takes a `dbQuery` | **Not usable on a live edit:** a grid move is an op-log fold and I found no path that writes the moved boxes back to the tables it reads. Reaches users through the Regulatory Report |

**To build (nothing else):**
1. **`modeller/edit_report.js`: a PURE composer**, node-testable, dual export, no DOM. Takes the owners' numbers, returns one JSON object. No threshold of its own.
2. **`SdgGate.pairsOver(boxes, moved, rel, opts)`: the one new count.** Moved elements vs every other, `penetration > clashTol`, skipping `related` pairs, using the SAME `penetration`, `CLASH_TOL` and `rel` as `evaluate`. Run on the before and after boxes. Without this there is no "before" number.
3. **Span tally:** every piece through `GridSpanGate.fold` + `check`, at the fold before and after the op, counted by signal. Whole building, because `check` is arithmetic. Same material and measured depth both sides.
4. **Wire at `commitGridMove`, on commit only, never per drag frame.** Emit `§EDIT_REPORT <json>`, set `window.__lastEditReport`, show a small panel beside the existing status. The panel only prints the JSON's values.

**Shape** (numbers invented, to show the layout only):
```
Grid y8 moved +0.60 m · 1 change, can undo
Changed: 12 recomposed, 3 riders · verify ok
                                     Before  After
Box overlap > 20 mm, moved elements     4      7    +3
Beam spans over limit, whole building   9     10    +1   Preliminary — the structural engineer confirms.
Beam spans needing depth check         21     20    −1
New door-out / door-crush               —      0
New clearance < 0.5 m                   —      2
NOT checked: …one line, from step 0…
```

**Rules that keep it honest:**
- **Like with like:** each row states its population and it must be the same on both sides, or the row prints INCONCLUSIVE with no delta.
- **State the scope:** the overlap row covers moved elements only, and whole-scene is not claimed. It is a box overlap, so never label it "Clashes": it can disagree with the Viewer's Clash panel (`clash_rules.json` tolerances, mesh narrow phase).
- **A refusal is shown, never a zero:** material unknown, wall-bearing or authored grid → that row says "not judged" and why.
- **Baseline red is shown:** Garage already holds RED spans (§GRID-SPAN-GATE RESULT item 3, artefact girders), which is why Before is not zero.
- **Words:** "structural checks", never "safety", "compliant" or "certified". An all-clear table is never summarised as "safe" or "OK".
- **NOT checked is mandatory:** no NOT-checked line, no report.

**Step 0, before any UI: W-EDIT-REPORT-COVERAGE.** `NEURO_SYMBOLIC_ORDER_CONTRACT.md` §3.1 measured the JAVA gates, not these. Inject the same defect classes (overlaps by class pair, floating column and beam, unit errors, unknown class, duplicate) into `SdgGate` and the span check. Print which fire. The NOT-checked line is generated from this table, never hand-written, and the witness pins it.

**Witness W-EDIT-REPORT** (`modeller/tests/witness_edit_report.js`, real Open, real mouse, on the `witness_grid_span_gate.js` pattern). RED first: on main the report does not exist. Each proves a named issue:
| Claim | Proves or disproves |
|---|---|
| Span row's Before/After equal an independent recount of the fold, and every reported bay's signal equals `check` | The table can be wrong |
| Overlap row's rise never exceeds what `§GATE red=` flagged new, plus any worsened pair it counts | Report and gate disagree |
| Ctrl+Z → a fresh recount equals Before; Ctrl+Y → equals After | Report does not follow undo |
| Same drag twice from a fresh Open → byte-identical JSON | Not deterministic |
| Drag under 0.05 m → no report, logged NO-OP | NO-OP reads as a pass |
| Material refused → "not judged", no number | VACUOUS reads as zero |
| Falsifier `EDIT_REPORT_BREAK=1` (the after-tally reuses the before boxes) must turn the witness RED | Witness cannot fail |
Log heap and element count at the end of the composer (§PERF BUDGET); no new geometry, no second copy of buffers.

**Not in slice 1:** reject gate (parked, `NEURO_SYMBOLIC_ORDER_CONTRACT.md` STATUS) · bay add, wall stretch, move · session total against the §SAVE-BASELINE · whole-scene overlaps (cost must be measured on Terminal first) · beam/column rules on a live edit · saving reports in the op-log · any new rule or threshold.

**Queue after slice 1, each needing its own go:** bay add (`bay_add.js`) → other gestures → session total at Save → structural_sanity on a live edit.

### §EDIT-REPORT STEP 0 RESULT 2026-11-07 (bim-ootb #2671, `modeller/tests/witness_edit_report_coverage.js`)
`§EDIT_COVERAGE_SUMMARY defects=28 none=15 by_design=2 verdict=DISPROVED`. `pass=11 fail=0 ran=30`. Falsifier `EDIT_COV_BREAK=1`: `fail=4`, exit 1. Pure node, real data: `SdgGate` on the Duplex's 203 seeded solids and recovered edges (50 fills, 696 abuts), `GridSpanGate` on the Garage's own 17×29 lattice, 228 girders, RC, mixed, depth 0.535 m. Table: `modeller/edit_report_coverage.json`.
| Defect | Java gates (`NEURO_SYMBOLIC_ORDER_CONTRACT.md` §3.1) | Live edit checks |
|---|---|---|
| Same-class overlap, door in slab, pipe in structure, pipe through wall | P06 / NONE / listed but passes / NONE | **RED, all four** |
| Duplicate position | P05 + P06 | RED |
| Column 50 m up, beam 200 m away | NONE | NONE |
| 3100 m wall clear of the building | P02 | **NONE** |
| 800 m wall clear of the building | NONE | NONE; RED only if it hits something |
| 0.2 mm thick | P03 | **NONE** |
| Unknown class | NONE | NONE: the gate receives boxes only |
| Duplicate guid | schema | NONE (read): boxes are keyed by fid |
**Only the live checks found:**
- **⚠ A wall driven 0.300 m into a wall it abuts: NONE** (real pair 15/3). `related` pairs are never a clash, and a grid stretch is exactly the edit that does this. `pairsOver` as specified inherits it. **Open, owner's call: fix the gate, or only report it. Not changed.**
- NaN coordinates and zero-size boxes: NONE, no throw.
- An element changed but left off the `moved` list: NONE. The judged set is `res.commands` + `res.riders`.
- A floating 30 m IfcBeam row: NONE on spans. Only girders the column walk derives are judged (228 before and after).
- A line dragged past its neighbour: ORANGE, only from the longer bay; no crossing rule. Two lines on top of each other, span 0: NONE.
- One material per building: on this mixed one, a steel girder at 15 m reads RED, inside its own 18 m limit.
- Delta-only (E3) and the 20 mm tolerance (E1) are by design, not blind spots. E3 is why `pairsOver` is needed.
**NOT-checked line today:** duplicate ids · elements changed outside the edit's own list · floating or unsupported elements · grid lines placed on top of each other · invalid coordinates · real beams: only girders walked from columns are span-checked · unknown element types · walls driven into a wall they already touch · wrong units or absurd sizes, unless they hit something · zero-size elements · load capacity · beam and column rules (Regulatory Report only).
**Amendments to the spec above:** (1) the last two items have no row, because no live check looks at them; they are a constant in the witness, pinned, not generated from a verdict. (2) Twelve items is too long for a small panel: the panel shows a count that opens the list; the JSON and `§EDIT_REPORT` always carry all of them.
**Not measured:** real meshes in a browser (this is node over folded boxes, the same arithmetic the page calls); Duplex and Garage only.

### §ABUTS-DEEPEN — SPEC 2026-11-07 (red1: "Go with your advice"). Own PR, before slice 1.
**Issue:** E2 above: `pairCheck` returns at once for any `related` pair, so a wall driven 0.3 m into a wall it abuts fires nothing, and a grid stretch is the edit that can do it.
**Rule:** an ABUTS pair (in `rel.abuts`, and not a host/filling pair) is RED `abuts-clash` when `penA > clashTol` AND `penA > penB + clashTol`, the same "new or worsened" test the clash branch uses, same 20 mm, no new threshold. Host/filling pairs stay expected contact: a door sits inside its wall by construction. `related` itself is unchanged.
**Why a new kind:** the toast prints it, Save blocks on it like any RED, and the report can name it apart from an ordinary overlap.
**Witness:** `witness_sdg_gate.js` A9: driven in → RED; moved together → none; pulled apart → no `abuts-clash`; a door pushed further into its host → none. Coverage E2 goes RED and leaves the NOT-checked line. **Regression check:** the gate-dependent witnesses, node and E2E; any newly RED edit must be shown to be real, not waved through.

### §ABUTS-DEEPEN RESULT 2026-11-07 (bim-ootb #2673)
W-SDG-GATE 18/0, A9–A9g new. Coverage E2 → RED, `none=14`, and it left the NOT-checked line. **One edit in the regression set logs `abuts-clash`, and it is real:** SampleHouse `gx1` +1 m, W-E2E-STRETCH-RIDE. Wall 23's end goes x=6.12 → 7.12 through wall 22 (6.12..6.41), and wall 6 likewise. 1 RED on main, 3 now. RED blocks Save, so a model carrying this overlap from an edit made in that session blocks until it is resolved.
**Corrected 2026-11-07: add a bay IS verified.** W-DXF-ADD-BAY 18/0 on main with this fix, its B7 gate check included; W-EDIT-RATES-LINK 4/0, W-DXF-GRID 4/0, W-DOOR-GAP 4/0. PR #2673's "not on this machine" was wrong: the 2026-11-06 cleanup moved the film workspace to `~/.cleanup_holding_2026-11-06/videos/dxf2bim_film_work`, so the default `~/Videos/dxf2bim_film_work/why/cli/marked` is empty. ⚠ Every shed witness needs `SHED_MARKED_DIR` (and `SHED_MARKED`, `SHED_RAW_DIR`) pointed there, and deleting that holding folder would remove their only input. W-BAY-RIDE 6/0 and W-CLIPBOARD 6/0 also pass. `witness_clipboard_keys` fails the same on clean main (K1 "no empty ground point"); the two `playwright` smokes cannot load the module, on either side.

### §EDIT-REPORT SLICE 1 RESULT 2026-11-07 (bim-ootb #2674, sw v233)
`modeller/edit_report.js`, `edit_report_panel.js`, `SdgGate.pairsOver`, `GridSpanGate.tally`, wired at `commitGridMove`. Witness `modeller/tests/witness_edit_report.js`: 42 pass, 0 fail across three sessions. Falsifier `EDIT_REPORT_BREAK=1`: 3 fails, exit 1. Regression set green. Live bytes match origin/main for all 7 files.
**Measured, Garage gy8 +1.5 m:** spans over limit 91 → 91, needing a depth check 14 → 19, both equal to a recount from the walker's own lattice and the rule table. Box overlap 2 → 4 on 1 moved element against 864, equal to brute force. New: 2 overlaps, 1 driven into a touching wall. Ctrl+Z and Ctrl+Y recounts return to Before and After. Same edit from two fresh Opens: byte-identical JSON, 1,877 bytes. Cost 7.6 ms, 0 vertices.
**SampleHouse gx1 +1 m:** "Driven into a wall it touches: 2", overlap 20 → 20, spans "Not judged: no column frame".
**Spec amendments found while building (supersede the SPEC above where they differ):**
1. A grid move can recompose no scene element. A clean 0 there would be a vacuous pass, so the overlap row and new rows print "not judged". Not in the spec's list; the first run showed it.
2. The panel sits at top 62, right 62, inside the toolbar's corner: the toolbar runs along the top and down the right edge. Checked at 1280×860 only, list open, with the toolbar, status and history. **Not run on a phone-sized screen.**
3. Gesture "Add one more" splits girders, so its span rows print INCONCLUSIVE, by the like-with-like rule. Composer pure-tested (W0c); that gesture was not driven end to end.
**Observed, not investigated:** on Garage a real mouse drag of gy8 by +1.2 m after an undo recomposed 0 elements, while the hook at +1.5 m on a fresh Open recomposed 1. The report prints this honestly as not judged. Whether the 0 is right is a question for the grid-move lane.
**Limits to keep in view:** on this building a grid move recomposes few scene elements, while the span row covers 228 girders; the overlap row's scope line says so. One building-wide material, so a mixed building can read a false RED (coverage SP7). The report is not in any user guide yet.

**2026-11-07, bim-ootb #2685 (`NEURO_SYMBOLIC_ORDER_CONTRACT.md` §13):** the span row now names the limit, the material and the over-limit bays whose span changed, W-EDIT-REPORT R12. Fixed in the same PR: any `GEOM_MOVE` of a 3-axis placed element also turned it and changed its height, W-BLOCK-SHIFT A1, A2. ⚠ The live Save gate on a rotated building still uses world boxes, so a long member's box is metres wide; that question is the owner's (§13.6).

**STATUS:** slice 1 shipped. Queue, each needing its own go: bay add → other gestures → session total at Save → structural_sanity on a live edit. A CLI call returning this JSON is red1's idea (2026-11-07), and needs the fold shown to run outside the browser first; §SCRIPTED-EDITS (row 40) stays on HOLD unless red1 lifts it.

