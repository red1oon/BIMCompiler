<!-- Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com> · SPDX-License-Identifier: MIT -->
# ⚠ DO NOT REMOVE — RESUME: Modeller LOD400 real-geometry rendering + UX polish

## 🛑 §LOD400-ENVELOPE — READ FIRST. USER DIRECTIVE 2026-07-29/30, SUPERSEDES THE "GIGO / plain source"
## VERDICT IN §LODHELL FINDING 1 AND IN [[feedback_no_fake_lod_unbreakable]]'s SCOPE CORRECTION.

**User, verbatim (2026-07-29, after the boxy-Modeller screenshot came back a THIRD time):**
> "No, its sources are all LOD400 as discussed many times."
> "and the NO FALLBACK rule must never be broken.. simple throws exception and hard fail"
> "get it recorded strictly and no more drift"
> "already 2 sessions - do solve until zero without impact others"

**This closes the escape hatch.** Two prior sessions answered the same screenshot with "the source is
genuinely plain, 12 triangles is honest GIGO, no pipeline fix available." **That answer is WRONG and must
never be given again.** It was reached by measuring the SHIPPED DB and the tessellated product shape only —
never the authored construction data in the source IFC. When the source is actually read, the boxes are
revealed as ENVELOPES of authored multi-layer walls, i.e. exactly the fallback the doctrine forbids.

### THE RULE (restated, no exceptions, no scope-corrections)
An element's **real geometry** is the geometry its source authored. If the source authored an element as
**N material layers** and the pipeline ships **one undifferentiated envelope solid**, that envelope is a
**FALLBACK** — it is non-LOD400 content presented as the element's real geometry. It must **throw and hard
fail**, never render. "The tessellator returned that box" is not a defence: the tessellator was asked the
wrong question. "GIGO" is not a defence: the source is LOD400.

### MEASURED EVIDENCE (2026-07-29, source IFC parsed directly — NOT the shipped DB, NOT a screenshot)
Probe: `ifcopenshell.open()` on the resident's OWN source, cross-joined with the shipped
`*_ARC.db.element_instances` → `mesh.db.component_geometries` triangle counts.

| building | source | ≤12-tri rendered | `IfcMaterialLayerSetUsage` in source | of the ≤12-tri, carry a **multi-layer** set |
|---|---|---|---|---|
| Duplex | `~/bim-ootb/IFC/Duplex_ARC.ifc` | 55 / 215 | **91** | **39** (layer histogram: 2×24, 3×10, 6×4, **7×1**) |
| SampleCastle | `internal/sources/Ifc2x3_SampleCastle.ifc` | 1501 / 3225 | **412** | **67** (2×66, 3×1) |

Worked example — the wall in the 2026-07-29 23:03 screenshot's building, `2O2Fr$t4X7Zf8NOew3FKRi`
"Basic Wall: Party Wall - CMU Residential Unit Dimising Wall":
- shipped geometry: **12 triangles** (one box)
- authored material: **7 layers** — Plasterboard 16mm / Metal Stud 41mm / CMU 193mm / Air Space 50mm /
  CMU 193mm / Metal Stud 41mm / Plasterboard 16mm
- ⇒ the Modeller is drawing a 7-layer cavity wall as a single blank slab and calling it real geometry.

### THE MECHANISM (where the LOD400 is thrown away — three separate losses, all in OUR code)
1. `DAGCompiler/python/extractIFCtoDB.py:638 extract_material_layers()` writes `material_layers` keyed by
   **`layer_set_name` only**. `get_material_for_element()` (`:442`) collapses an element's whole
   `IfcMaterialLayerSetUsage` to **one material NAME string**. ⇒ **there is no element→layer-set link table
   anywhere in the schema.** The layer data survives; the link from a wall to its own layers does not.
2. The tessellation pass asks `create_shape()` for the **product** shape. For a Revit-exported compound
   wall that is one `IfcExtrudedAreaSolid` of the TOTAL thickness — the envelope. The per-layer geometry is
   implied by `IfcMaterialLayerSetUsage` (`ForLayerSet` + `LayerSetDirection` + `DirectionSense` +
   `OffsetFromReferenceLine`) and is never computed.
3. The ARC packaging that produces the Modeller residents **drops `material_layers` and `surface_styles`
   entirely**. Verified: `Duplex_extracted.db` has `material_layers` (41 rows) + `surface_styles` (33 rows);
   `Duplex_ARC.db`'s table list is `project_metadata, elements_meta, element_transforms, element_instances,
   schedules, tasks, task_sequences, task_elements, spatial_structure` — neither table is present. Same for
   `SampleCastle_ARC.db`. So even a Modeller that WANTED to honour layers has nothing to read.

### WHAT IS *NOT* THE PROBLEM (do not re-audit these — re-measured 2026-07-29, all clean)
- The renderer. Duplex **215/215** instances resolve a real mesh; `§GEOM-HARDFAIL` never fires.
- Decimation. Per-GUID triangle compare, `Duplex_ARC.db`+`mesh.db` vs the compiler's `Duplex_extracted.db`:
  **194/203 identical**, 7 richer in the Modeller store, 2 stair flights 1152→1062 (tessellation param).
  `mesh.db` is byte-faithful, not a proxy store. `git diff HEAD origin/main` on `mesh.db`, `Duplex_ARC.db`,
  `real_geometry.js`, `arc_editable.js` = **empty**, so the live gh-pages page serves exactly these bytes.
- Openings. All 30 Duplex `rel_fills_host` hosts carry 28–120 tris — cuts are applied, none at 12.
- VOID-CONSUMED (§LODHELL FINDING 2-CORRECTED) — still correct, still closed, unrelated to this.

### THE FIX — three items, in this order. Order is load-bearing: gating before supplying the layers would
### refuse 39 Duplex walls and empty the building.
- **§LOD400-LAYERS-EXTRACT — ✅ DONE (witness) 2026-07-29.** `rel_material_layer_set (element_guid,
  layer_set_name, layer_count, total_thickness_m, layer_set_direction, direction_sense,
  offset_from_reference_line, provenance)` + `extract_rel_material_layer_set()` /
  `write_rel_material_layer_set()` in `DAGCompiler/python/extractIFCtoDB.py`. Pure extraction from
  `IfcMaterialLayerSetUsage`, no computation, no invention — closes loss #1.
  **Measured on Duplex: 91 edges, 80 multi-layer, 91/91 carry DirectionSense, 91/91 a real summed
  thickness** (`§LOD400-LAYERS` log line). Witness `scripts/witness_lod400_envelope.py` **8/8**.
- **§LOD400-LAYERS-REAL — ✅ EXTRACTOR HALF DONE (witness) 2026-07-30, see the dated build record
  below (§LOD400-LAYERS-REAL BUILD).** Per-layer geometry compiled by slicing the authored envelope
  along the authored `LayerSetDirection` at the authored cumulative thicknesses. **This is COMPILATION
  FROM AUTHORED DATA, not invention** — thickness, order, sense and offset are all in the source; it is
  precisely what `IfcMaterialLayerSetUsage` *means*. Witness `scripts/witness_lod400_envelope.py`
  **12/12**, Duplex gate GREEN exit 0. ~~Still OPEN (next slice): ship layers + `surface_styles` into
  the ARC residents (patch + self-heal loader per the DB policy, never a binary) + the Modeller half.~~
  **✅ SHIPPED 2026-07-30 — see §LOD400-LAYERS-RESIDENTS below (Duplex live; SampleCastle deliberately
  NOT shipped while its `sporenkap` refusal stands).**
- **§LOD400-ENVELOPE-GATE — ✅ DONE (witness) 2026-07-29, extractor half.** P10 `LOD400_ENVELOPE` prints
  `§ILLEGAL_LOD_FALLBACK` **naming every offender** (guid + layer count + layer-set name, not just a
  count) and turns §PROOF red ⇒ non-zero exit via the existing `f7d00240b` path. Witnessed on Duplex:
  `§PROOF RESULT: 7 PASS, 1 FAIL`, `LOD400_ENVELOPE 79/80`, **exit=1**; worst offender
  `2O2Fr$t4X7Zf8NOew3FNbT` = 7 layers, "Party Wall - CMU Residential Unit Dimising Wall".
  **⚠ INTENDED CONSEQUENCE, do not "fix" it by softening the gate:** any re-extraction of a building with
  authored multi-layer elements now EXITS NON-ZERO until §LOD400-LAYERS-REAL ships. That is the point —
  an envelope DB can no longer be produced silently. The remedy is to supply the layers, never to lower
  the gate, add a threshold, or grant a per-building exemption.
  **Modeller half still OPEN** — refuse to seed an envelope element as real geometry once the residents
  carry the layer data (needs §LOD400-LAYERS-REAL first, or the refusal empties the building).

### ANTI-DRIFT — the exact sentences that must never be written again about this
- ~~"46.4% of what renders is genuinely a 12-triangle box at SOURCE … GIGO, not a violation"~~ — the
  element's SHAPE is 12 triangles; its authored CONSTRUCTION is not. Shape ≠ what the source authored.
- ~~"no pipeline fix available"~~ — three named fixes, all in our own code, listed above.
- ~~"this building's source IFC is genuinely simple"~~ — 91 layer-set usages in Duplex, 412 in SampleCastle.
- The [[feedback_no_fake_lod_unbreakable]] "scope correction" (GIGO is not a violation / pipeline-fidelity
  only) **does not apply where the source carries authored richness the pipeline discards.** Fidelity is to
  the SOURCE, not to whatever the tessellator happened to hand back.

### §LOD400-DISPATCH — the task prompt. **ASSIGN: Sonnet** (this is a reason-it-out + explain job, and it
### contains one architecture call). Fable5 takes over ONLY for step 3, after the call in step 2 is made.
Per [[feedback_model_allocation_mastermind_vs_execution]]. Requested by the user 2026-07-29 after five
rounds of me explaining this badly: *"Put this as a prompt for Fable5 session or Sonnet — which can reason
out the facts and cause and remedy for me to understand?"*

**⚠ Read the whole §LOD400-ENVELOPE section above first. Read the log after every run (Log Mandate). Do NOT
re-derive the measured facts below — they are witnessed; spend the session on steps 1–3, not on re-proving.**

**ALREADY SETTLED — quote these, do not re-measure:**
| fact | number |
|---|---|
| duplex parts the Modeller loads (architecture + structure only, by design) | **218** |
| duplex parts the Viewer loads (same building, federated, incl. 904 pipe/duct pieces) | **1119** |
| duplex parts resolving a real mesh in the Modeller | **215 / 215**, zero fallbacks fired |
| duplex walls that are a plain 12-triangle box | **35 / 57** (corrected 2026-07-30 by direct query — histogram over `Duplex_ARC.db⋈mesh.db`, tris = `length(faces)/12`) |
| duplex walls with a door/window hole cut through them | **18**, at 28–120 triangles ⇒ proves real mesh, a fake box cannot carry a hole (corrected 2026-07-30 — the old 21 (and the "30 hosts" phrasing) counted 10 IfcFurnishingElement + 1 IfcSlab hosts; wall hosts = 18 by `rel_fills_host⋈elements_meta WHERE ifc_class LIKE 'IfcWall%'`) |
| the party wall's own shipped mesh | **14 triangles** (hash `d4bad00ddbda7d4e`, 42 verts — a plain box is 12; corrected 2026-07-30, Watchdog-caught) |
| `IfcMaterialLayerSetUsage` in the duplex source / castle source | **91 / 412** |
| the worst offender | `2O2Fr$t4X7Zf8NOew3FNbT` — **7 authored layers**, shipped as one box |
| element→layer-set edges now extracted (just built, witnessed 8/8) | **91**, 80 of them multi-layer |
| the extractor gate, just built | prints `§ILLEGAL_LOD_FALLBACK` per offender, §PROOF red, **exit 1** |

**THE THREE STEPS — work top-to-bottom to zero ([[feedback_work_to_zero]]).**

1. **WRITE THE EXPLANATION THE USER ASKED FOR — this is the primary deliverable, not a preamble to code.**
   A short plain-English page: what a wall actually is in the file (one outer solid + a list of layer
   thicknesses, never layer shapes), why the box is real and not a fake, why the Viewer looks richer
   (904 extra pipe/duct parts on screen, identical walls), and why the 2026-07-02 fake-box fix looked
   dramatic on the castle and invisible on the duplex (a fake box is 12 triangles; a plain wall's real
   shape is *also* 12 triangles). **Language rules are binding here — [[feedback_terse]]: one-line verdict
   first, plain words, no jargon, every number something the user can picture. This exact topic has already
   cost five rounds of rephrasing; a wordy answer is a failed deliverable.** Put it in
   `docs/ModellerGuide.md` (a short "what a wall is made of" subsection) so it is answered permanently
   and publicly, not just in chat.

2. **⛔ MAKE THE ARCHITECTURE CALL, then say it in one line.** To draw 7 layers you need 7 shapes where
   there is 1. `element_instances` is keyed one-row-per-guid — one element, one mesh. Two ways:
   (a) **N sub-instances** — synthesize a child guid per layer; truthful and queryable, but touches every
   downstream consumer of `element_instances` (Viewer, Modeller, BOM, rooms, 4D);
   (b) **one layered mesh per element** — keep one row, store the layer slabs as one mesh plus a per-layer
   index; no schema blast radius, but layers are not individually selectable.
   Recommend (b) first — it is reversible, ships behind the existing hash, and answers the visual question
   without a fleet-wide migration. State the choice, then proceed. Do not build both.

   **✅ CALL MADE 2026-07-30 (Sonnet, dispatched per MODELLER_MASTER.md §OPEN LIST row 1): (b) — one row
   per element, one layered mesh (concatenated per-layer slab buffer) behind the existing `geometry_hash`,
   with a new sibling index table keyed by hash. Not (a).** Grounds (verified, cited by the deciding
   session): every mesh-resolution path assumes one geometry per guid (`real_geometry.js:93`,
   `viewer/streaming.js:71-137`, `arc_editable.js:129` + `§GEOM-HARDFAIL :159-166`); geometry is already
   addressed by HASH not element (dedup), so a hash can carry a richer composite mesh with zero guid-side
   change; (a) would force new guid rows onto every guid-keyed consumer (BOM lines, rooms, 4D
   `task_elements`) — the fleet-wide migration is real, not hypothetical. **Index location:**
   `component_geometry_layers (geometry_hash, layer_seq, material_name, thickness_m, face_start,
   face_count, PK(geometry_hash, layer_seq))` in the same geo store as `component_geometries` — the
   geometry-side analogue of `rel_material_layer_set`. **Witness claim for §LOD400-LAYERS-REAL:** the hash
   resolved for `2O2Fr$t4X7Zf8NOew3FNbT` contains 7 concatenated slab solids (72 tris = 7×12);
   `component_geometry_layers` has exactly 7 rows for it; `SUM(thickness_m)` == `total_thickness_m`
   (0.550 m); falsified by deleting one `material_layers` row and asserting extraction hard-fails (never
   silently ships 6 slabs). Step 1's guide subsection: **✅ DONE same day** — "What a wall is made of" in
   `docs/ModellerGuide.md` (after Realistic glass; deploy via `safe_gh_deploy.sh` once merged).
   §LOD400-LAYERS-REAL (step 3) is now unblocked for Fable5.

3. **§LOD400-LAYERS-REAL — build it. Fable5-suitable once step 2 is chosen (mechanical, fully specified).**
   Slice the authored envelope across its thickness at the authored cumulative thicknesses, in the authored
   direction. Every number comes from `rel_material_layer_set` (just added: `layer_set_name`, `layer_count`,
   `total_thickness_m`, `layer_set_direction`, `direction_sense`, `offset_from_reference_line`) joined to
   `material_layers` (per-layer `material_name`, `thickness_m`). **Nothing may be assumed or defaulted — if
   a thickness or sense is missing, refuse that element loudly, never guess** ([[feedback_no_invent_rules]]).
   Ship the layers + `surface_styles` into the Modeller residents as a **patch + self-heal loader, never a
   binary** (the DB policy in `CLAUDE.md`; mirror `str_walker_outliner.js _applyPendingPatch()`).
   Then the extractor gate goes green on its own, and the Modeller half of §LOD400-ENVELOPE-GATE can refuse
   any element still shipping as an envelope.
   *Issue the witness must prove:* that the 7-layer party wall `2O2Fr$t4X7Zf8NOew3FNbT` renders as **7
   slabs whose thicknesses sum to the authored total**, and that `scripts/witness_lod400_envelope.py`
   (currently 8/8 with the gate RED at 79/80) goes to gate-GREEN — falsified by removing one layer row and
   asserting the run fails again.

**Out of scope — do not touch:** the renderer's mesh resolution (measured clean), the VOID-CONSUMED
classifier (§LODHELL FINDING 2-CORRECTED, closed), the ARC-only load filter (deliberate — the user set that
purpose themselves and it is NOT the cause of anything here; do not "fix" it or re-explain it as the cause).

### ✅ §LOD400-LAYERS-REAL BUILD — 2026-07-30 (Fable5, extractor half; branch `feat/lod400-layers-real`)
**Built exactly per the CALL (option b):** `compile_layer_geometry()` in `DAGCompiler/python/extractIFCtoDB.py`
rewrites every multi-layer element's envelope mesh as N concatenated layer slabs behind the SAME
`geometry_hash`, indexed by the new `component_geometry_layers (geometry_hash, layer_seq, material_name,
thickness_m, face_start, face_count, PK(hash,seq))` in the same store as the mesh blobs. Runs inside every
extraction, before §PROOF; P10 now counts a multi-layer element as an envelope only when its hash does NOT
carry a matching layer index — compiled elements pass, refusals keep it RED (gate semantics unchanged,
nothing softened). New CLI `--compile-layers --ref <db> [--library <db>]` = idempotent compile + verify on
an existing DB (the falsification surface + the future resident-patch generator).
- **Slicing mechanism (stated per spec):** no OCC boolean available here (no pythonocc; ifcopenshell 0.8.4
  exposes none in python) → plane-clip of the tessellated closed solid: Sutherland-Hodgman sides + caps from
  edge-key-chained cross-section loops triangulated by GEOS constrained Delaunay (shapely 2.1, hole-aware,
  no Steiner points). Every slab PROVEN: welded, watertight, extent==authored thickness (±0.5 mm stated
  tol), slab volumes re-sum to the envelope volume (rel 1e-4). Any miss → loud `§LAYER-REFUSE`, envelope
  kept, gate stays red — a wrong-but-silent slice is worse than a loud refusal.
- **Two-mode boundary anchoring, both pure authored data (measured on Duplex):** ABSOLUTE — boundaries at
  `offset_from_reference_line ± cumsum(thickness)` when both body faces land on authored boundaries; the
  body may cover a contiguous WHOLE-layer subset. RELATIVE — body extent == authored total: anchor at the
  DirectionSense face (needed for the 13 Duplex ceilings: offset=0, body at z≈2.6). Neither fits → refuse.
- **MEASURED FINDING (corrects this file's own witness claim):** the party wall `2O2Fr$t4X7Zf8NOew3FNbT`'s
  authored BODY spans only **0.493 m of its 0.550 m layer set** — body faces sit exactly on authored
  boundaries b₀/b₅; layers 5-6 (neighbour-side stud+plasterboard) have NO body in this element (they belong
  to the neighbour wall's own body, Revit unit-demising). So it compiles as **7 index rows summing 0.550
  (5 slabs with geometry, extents 16/41/193/50/193 mm exact; L5/L6 face_count=0)**, announced loudly as
  `§LAYER-PARTIAL` — never invented. The "72 tris = 7×12" guess in the CALL was wrong anyway (buffer = 124
  tris); the witness asserts structure, not triangle counts.
- **Two real upstream defects found + fixed en route:** (1) `extract_material_layers`/
  `extract_rel_material_layer_set` stored RAW source units into `*_m` columns — correct only for metre
  files; SampleCastle is mm (total 90.0 vs body 0.09 m). Now scaled by the authored length unit. (2) some
  source envelopes carry MIXED triangle winding (castle party wall: ~21 m³ solid, signed volume −2.08) —
  `_orient_coherently()` normalizes winding (BFS propagation + positive-volume flip; refuses non-orientable
  or nested-cavity meshes).
- **Witness `scripts/witness_lod400_envelope.py` 12/12** (kept the original 8, now green-path): Duplex
  fresh extraction gate GREEN exit 0; 79/79 multi-layer elements compiled (230 slabs, 4 authored-empty
  rows, 0 refused); party-wall rows/tiling/extents as above; FALSIFY: delete one `material_layers` row →
  `--compile-layers` exits 1 with `§LAYER-VERIFY-FAIL` naming the element (never ships 6 slabs as 7).
- **SampleCastle measured: 74/75 compiled, 1 honest refusal** (`2vGfAAaCDC$u2rePIbFqLy` "sporenkap", a
  pitched rafter-roof IfcSlab whose body spans 0.692 m along AXIS3 vs an authored flat 0.206 m set — not
  sliceable from authored data). Castle extraction therefore still exits 1 BY DESIGN. Consequence:
  `scripts/witness_lodhell_classify.py` L3 (castle §PROOF green) was already red since the gate landed
  2026-07-29 (75/75 offenders then) and stays red for this 1 element — do not "fix" it by softening P10.
- ~~**Still OPEN (next slice, NOT this branch):** ship layers + `surface_styles` to the ARC residents
  (patch + self-heal loader), then the Modeller half of §LOD400-ENVELOPE-GATE.~~ ✅ DONE — next section.

### ✅ §LOD400-LAYERS-RESIDENTS — 2026-07-30 (Fable5, residents half; bim-compiler `feat/lod400-layers-ship`
### + bim-ootb `feat/layers-to-residents`). Duplex ONLY (SampleCastle excluded while `sporenkap` refuses).
**The compiled layer slabs now reach the live Modeller, and the Modeller-half §LOD400-ENVELOPE-GATE is armed.**
- **HASH LANDMINE (measured, do not assume otherwise):** a fresh extraction's `geometry_hash` ids do NOT
  match the shipped residents' — all 155 Duplex ARC hashes are absent from a fresh extraction (old store:
  unwelded buffers, different local anchors, some rotation baked into the blob; e.g. one wall is 17.8 m
  along Y with rot 0 in the old store vs 17.8 m along X with rot π/2 fresh). So layered buffers carry over
  **by GUID with a per-guid measured change of basis** `v_old = R_old⁻¹(C_f − C_o + R_f·v_fresh)` — both
  transforms are extracted data; VERIFIED per guid: all 79 layered guids agree old-vs-fresh in world space
  < 1e-5 m; layered guids are yaw-only in both stores (script REFUSES tilt rather than guess an Euler).
- **`scripts/gen_layered_geo_db.py`** — rebuilds a resident `*_geo.db`: swaps the layered buffers in under
  their EXISTING old hashes + adds `component_geometry_layers`, dedup-regroup aware (a guid whose group
  representative fails the world-AABB check gets a split hash + an `element_instances` re-point emitted for
  the patch — Duplex needed 0 splits), then verifies the OUTPUT: 155/155 hashes resolve, per-slab thin-axis
  extents == authored thicknesses (±1.5 mm). Duplex result: 71 buffers swapped, 229 layer rows / 71 hashes.
- **`scripts/gen_layer_tables_patch.py`** — sibling of `gen_void_anchor_patch.py`: emits
  `rel_material_layer_set` (91) + `material_layers` (41) + `surface_styles` (33) as the idempotent
  self-heal section appended to bim-ootb `modeller/patches/Duplex_ARC.db.sql`.
- **bim-ootb (`feat/layers-to-residents`):** `arc_editable.js` **§LAYER-GATE** — runtime-schema-armed
  (only when the ARC db carries `rel_material_layer_set` AND a geometry substrate exists): an authored
  multi-layer element whose resolved hash has no `component_geometry_layers` rows is REFUSED
  (`§LAYER-ENVELOPE-REFUSE` console.error + skip, mirror of §GEOM-HARDFAIL, never softened). Residents
  without the tables take zero new code paths. Duplex `geoV` 3→4, sw.js CACHE v40→v41. New witness
  `modeller/tests/witness_e2e_layers_residents.js` **8/8** (L0-L7): party wall `2O2Fr$t4X7Zf8NOew3FNbT`
  hash `d4bad00ddbda7d4e` = 124 tris (pre-fix 14, RED run against the old geo file proves the witness sees
  it), 7 rows Σ0.550 m, slab extents 16/41/193/50/193 mm + 2 honest empty rows, full face coverage,
  196 ops / 0 hardfail / 0 refusals armed, falsification (delete one hash's rows → refusal fires, op count
  drops by exactly 1), unpatched-ARC disarmed. Regressions: W-ARC-EDITABLE 10/10, W-GLASS-PARITY 4/4,
  anchor sweep green. **W-E2E-LOD-MATCH A3/A4 were RED on pristine origin/main BEFORE this branch**
  (SampleHouse door verts 3230 vs db 762, tris equal — a welding-count drift, likely the mesh-dedup lane;
  verified identical on untouched main) — pre-existing, NOT introduced here, left for its own lane.
- **Geo hosting (§GEO-SERVED pipeline reused):** rebuilt `Duplex_geo.db` uploaded to the same OCI object
  `bim-ootb/o/modeller/Duplex_geo.db` with `--content-type application/octet-stream`; fetched BACK and
  byte-verified (SQLite magic + the party-wall 124-tri/7-row query against the fetched copy).
- **Per-layer render COLOR deliberately not wired** (optional item): the data ships (surface_styles joins
  material_layers.material_name 17/17 clean — fully non-invent), but painting slabs needs face-group
  material arrays threaded through the signed-op fold payload into `bonsai_kernel._buildMesh` — not cheap,
  its own slice. Nothing invented, nothing lost: the tables are already in the resident.
- **Still OPEN after this:** SampleCastle layer shipping (blocked on its honest `sporenkap` refusal);
  per-layer slab colors (above); other residents' layer tables when their extractions go gate-green.

---

## ✅ 2026-07-30 — §ANCHOR-EXTRACT-SHIPPED: extractor half of the void-consumed anchor (OPEN item 1,
## USER-APPROVED same day) — built, witnessed 7/7 incl. RED falsification. bim-ootb half still open.

**What shipped (branch `feat/void-anchor-extract`, extractor half ONLY — no Modeller JS touched):**
- `extractIFCtoDB.py`: when an element classifies VOID-CONSUMED, the extractor now KEEPS what it had
  already computed instead of discarding it — `is_void_consumed()` returns the pre-boolean Body ITEM's
  LOCAL bbox extent (captured from the SAME classification tessellation, never a second one), and the
  world placement comes from `shape.transformation.matrix` via `decompose_iterator_matrix()`, the S173
  decomposition factored out VERBATIM (one implementation, shared with the normal path; P4 ROT_TRUTH
  still checks it at the event). Persisted as ONE `elements_meta` row + ONE `element_transforms` row
  per host, flushed AFTER the iterator loop so normal elements keep bit-identical ids.
- **Anchor marking (the user's binding condition, built in, not a follow-up):** `elements_meta.is_anchor
  INTEGER DEFAULT 0` (=1 on anchors) AND `element_transforms.transform_source='void_anchor'` — doubly
  unmistakable. One `§ANCHOR` log line per persisted host + an `anchors=N` count of their OWN on the
  §PROOF header (never folded into `elements=`). NO `element_instances` row (no geometry hash — nothing
  to render), NO `elements_rtree` row (never pickable). Excluded from: §NORMALIZE centroid (offset stays
  bit-identical; the offset still APPLIES to anchors so they share the frame), P1 SCALE, the by-class /
  by-discipline / materials summaries. `bbox_x/y/z` on a `void_anchor` row = the ITEM's LOCAL extent
  (NOT the world AABB the normal path stores) — the marker names the convention. Placement/tessellation
  unavailable ⇒ loud `§ANCHOR-SKIP` line, that host persists nothing (pre-anchor behaviour).
- `scripts/gen_void_anchor_patch.py` (mirrors `gen_rel_fills_host_patch.py`): reads a fresh extraction,
  emits the self-heal patch section for a shipped `modeller/<X>_ARC.db` (ALTER + `INSERT OR IGNORE` +
  flag UPDATEs; `--append` for merging into an existing patch file). **Measured finding baked into its
  frame guard:** shipped ARC `element_transforms.center_*` are world-AABB MIDPOINTS, not placement
  origins — the guard compares fresh rtree midpoints vs target centers and REFUSES on a systematic
  per-axis |meanΔ| > 0.05 m (SC measured: (0.0072, −0.0104, −0.0232) m, per-element scatter ≤ 2.6 m from
  tessellator-version AABB drift, not a frame error).
- **SC patch artifact (committed): `migration/modeller_patches/SampleCastle_ARC.db.sql`** — 65 anchors;
  the target already carried all 65 as meta-only rows (the FINDING 2 population), 0/65 transforms.
  Verified applied against a COPY of the real shipped `SampleCastle_ARC.db`: 65 flagged, transforms
  3225→3290, `element_instances` 3225 unchanged, meta count 3342 unchanged.
- Witness `scripts/witness_void_anchor_extract.py` — **7/7 PASS** (log: `logs/witness_void_anchor/`):
  A1 65 anchor rows doubly-marked · A2 real data (0 null/degenerate; 65/65 in the `rel_fills_host` host
  set; probe `1A9aTEU4z9SwaqEUwI8Lx4` extent = (1.210, 0.114, 1.850) m — the documented hand-probe) ·
  A3 `element_instances` 3583→3583, 0 anchor instances/rtree rows · A4 `elements=3583 failed=0
  void_consumed=65` identical pre↔post, `anchors=65` separate · A5 65 distinct `§ANCHOR` lines +
  summary · A6 gate set identical pre↔post (7 PASS + P10 FAIL), both exits 1 attributable to the ONE
  known honest `sporenkap` `2vGfAAaCDC$u2rePIbFqLy` §LAYER-REFUSE alone — unchanged by design, do not
  chase · A7 FALSIFICATION RED on pre-change code (`4e1c5756d`): no `is_anchor` column, 0 anchor rows,
  no `§ANCHOR` log. Regression: `witness_lod400_envelope.py` Duplex **12/12 exit 0**, `anchors=0`
  (no-op where nothing is void-consumed).
- ⚠ `§ANCHORED` (datum-plane cadence) is a DIFFERENT, pre-existing tag — grep `§ANCHOR ` with the
  trailing space/boundary, or you will count 1426 datum edges as anchors.

**Still open (the coordinated bim-ootb half, separate slice):** `buildSeedOps` `params.anchorOnly`
branch → `foldInsert` invisible mesh (`visible=false`), anchors excluded from every count/pick/audit
in the Modeller per the binding condition; ship the 65 SC rows by appending the generated section to
bim-ootb `modeller/patches/SampleCastle_ARC.db.sql` (loader `_applyPendingPatch` already exists);
witness = SC `stretchRide` reach 9/74 → ≥70/74, counts identical before/after anchors load.

## ⚠ 2026-07-30 WATCHDOG CORRECTIONS (post-ship, live-queried) — item 1 ✅ RESOLVED 2026-07-30 (§ROW33 below); item 2 (row 34) still open, next session starts THERE
1. ~~**Party wall renders 5 slabs, not 7.**~~ ✅ RESOLVED — see §ROW33-EMPTY-SLAB-REFUSAL below. (Original directive kept for history: layers 5-6 of `2O2Fr$t4X7Zf8NOew3FNbT` had `face_count=0`; the witness's two reconciliation sums were blind by construction. Directive: `face_count>0` per-layer assertion; an empty slab is a REFUSAL, not a row; root-cause first. ⚠ One factual premise in the directive was WRONG and is corrected in §ROW33: the walls are NOT opening-cut — they carry ZERO openings.)
2. **Anchor export/save leak unchecked.** The §ANCHOR guardrail proved render/Outliner/pick/audit invisibility but no witness covers `bonsai_ifc.js` export or `sdg_save.js` snapshot — both fold from an op-log that now carries 65 anchor ops. → MODELLER_MASTER row 34.
3. ~~**Anchor `elements_meta` rows write `building=NULL`**~~ ✅ FIXED 2026-08-03 (found merging this
   branch with `origin/master`). Two independent same-day commits never saw each other: §ANCHOR's insert
   (`4abc9dbfa`, on `fix/lod400-envelope-hardfail`) didn't set `building`; §KUL001 (`dcd5260e9`, on this
   branch) added that column to the OTHER insert only. Verified via `git blame` — not tampering, a
   genuine integration gap, first met at merge commit `127a695e5`. Fix: `extractIFCtoDB.py:2417-2422`
   anchor INSERT now also writes `_building_label` (same variable the normal path already uses, in scope
   in the same function). Note: the already-shipped `migration/modeller_patches/SampleCastle_ARC.db.sql`
   self-heal patch was NEVER affected — `gen_void_anchor_patch.py` already reads `building` from the
   target DB's own rows — so this gap only ever lived in the raw extractor, never in anything distributed
   to a live building. Regression check: `scripts/witness_void_anchor_extract.py --pre-ref 4abc9dbfa~1`
   (a real pre-anchor baseline, not the script's post-merge-stale `merge-base` default) — **7/7 PASS**.

### ✅ §ROW33-EMPTY-SLAB-REFUSAL — 2026-07-30 (row 33 executed: measured first, then refusal armed;
### bim-compiler branch `fix/layer-empty-slab-refusal`)
**ROOT CAUSE, MEASURED (logs: scratchpad `measure_row33.log` / `measure_row33_profile.log`, source
`~/bim-ootb/IFC/Duplex_ARC.ifc`):** the Watchdog's opening-boolean-cut hypothesis is **FALSE** — both
affected walls (`2O2Fr$t4X7Zf8NOew3FNbT`, `2O2Fr$t4X7Zf8NOew3FKRi`) carry **ZERO** `IfcRelVoidsElement`
(`§M-OPENINGS count=0`), and their body extent is byte-identical with and without opening subtraction
(0.4930 m both ways). The shipped §LAYER-PARTIAL diagnosis was CORRECT and is now deeper: the authored
base solid IS the full 7-layer prism (`IfcRectangleProfileDef YDim=0.550`), but an **authored
`IfcPolygonalBoundedHalfSpace` clip in the Body itself sits exactly at the layer-4/5 boundary
(y=−0.218)** and trims the neighbour-side Metal Stud (41 mm) + Plasterboard (16 mm) off the wall's full
length — Revit unit-demising: that material belongs to the neighbour wall's body. Duplex has FOUR
7-layer party walls; the other two (`…FKRH` 44 tris, `…FKau` 76 tris) span the full 0.550 m (their
clips are partial-length, AABB-invisible). So the source genuinely does not author layers 5-6 in the
two trimmed elements → **per the directive, the refusal stands; the walls are honestly RED.**
**BUILT (extractor half):**
- `compile_layer_geometry()`: an uncovered layer now raises `LayerRefusal` naming the layer, its
  material, and the body span — "an empty slab is a refusal, not a row (row 33)". §LAYER-PARTIAL and
  the `empty_slabs` bookkeeping are GONE; the schema comment on `component_geometry_layers` now states
  `face_count MUST be > 0`.
- `verify_layer_geometry()`: per-row `face_count>0` assertion FIRST in the loop (so a re-introduced
  empty row is named as such, not caught incidentally by the tiling sum) — the row-33 falsification
  surface. `gen_layered_geo_db.py` output-verify likewise hard-fails on any `face_count=0` row.
- **Witness `scripts/witness_lod400_envelope.py` 16/16** (`logs/witness_row33/witness_run1.log`):
  Duplex gate now honestly RED — `2/80` multi-layer elements ship as envelopes (the two trimmed
  walls), **exit 1 BY DESIGN** (same honest-refusal posture as SampleCastle's sporenkap — do NOT
  "fix" by softening). New checks: exemplar moved to full-span `…FKRH` (7 real slabs, extents
  16/41/193/50/193/41/16 mm exact, 424-tri buffer tiled); `NO_EMPTY_ROWS_ANYWHERE` (0 rows with
  `face_count<=0` store-wide); `TRIMMED_WALLS_REFUSED` (both walls `§LAYER-REFUSE`d by name with the
  row-33 reason); `TRIMMED_KEEP_ENVELOPE` (0 layer rows behind their hashes); `FALSIFY_EMPTY_ROW`
  (UPDATE one row to `face_count=0` → `--compile-layers` exit 1 naming the empty slab).
  **RED-first proven** (`witness_red_prefix.log`): against the pre-fix extractor exactly the 4 new
  checks FAIL (4 empty rows found, no refusals, 14 rows behind the trimmed hashes, wrong falsify
  message) — the blind-witness shape the Watchdog flagged is dead.
- ⚠ The 2026-07-30 §LOD400-LAYERS-REAL claim "12/12 exit 0 / gate GREEN on Duplex" above is
  SUPERSEDED by this policy: Duplex exits 1 by design while the two trimmed walls refuse.
**✅ Residents half SHIPPED (same session, second slice — bim-ootb PR #1099):** live `Duplex_geo.db`
still carried the partial ship (2 hashes `582223c5f6b2c1ae` + `d4bad00ddbda7d4e`, 124-tri layered
buffers + 7 index rows of which 2 empty). Fixed = both hashes' ORIGINAL envelope buffers restored
(12/14 tris, recovered from the pre-layer store) + their 14 index rows deleted → store now 215
rows / 69 layered hashes / ZERO `face_count<=0`; re-uploaded to OCI, fetch-back **byte-identical**
(md5 match, `application/octet-stream`). `geoV` 4→5, sw v41→v42. Witness
`witness_e2e_layers_residents.js` rewritten for the refusal posture and **8/8 against the LIVE geo
URL** — RED-first: against the pre-fix live bytes exactly the row-33 checks fail (4/8). Exemplar
moved to the full-span party wall `…FKRH` hash `50e205190088c27a` (7 real slabs
16/41/193/50/193/41/16 mm exact); L5 proves BOTH trimmed walls refused BY NAME with 2 loud
`§LAYER-ENVELOPE-REFUSE` console.error lines, ops 196→194, and all 215 instances / 155 hashes still
resolve; L6 falsification deletes the EXEMPLAR's rows → layerRefused=3 (gate live per-hash, not
hardcoded). Headless real-user open: 194 meshes, `§LAYER-GATE armed multiLayer=80 layeredHashes=69
refused=2`, `§GEOM-HARDFAIL total=0 of 194`. Regressions: W-ARC-EDITABLE 10/10, W-GLASS-PARITY 4/4
(after fixing ITS latent race: it sampled before the ARC seed landed on a cold OCI fetch — now
waits on the real seeded-meshes condition), W-E2E-VOID-ANCHOR 19/19, anchor sweep green through
HHS (later untouched residents cut by runner timeout only). **The live Duplex now renders the two
trimmed walls NOT AT ALL, by design — loud console refusal instead of a 5-slabs-as-7 partial.
"Until resolved" = a future authored-data decision (e.g. trim the authored usage to 5 layers at
source), not a rendering compromise.**

### ✅ §ROW33-EXCEPTION — 2026-07-31, USER + WATCHDOG RULING (same day, supersedes the refusal end-state
### above; bim-compiler PR #62 + bim-ootb PR #1102)
**The user overturned the refusal for this case:** *"that is exception if it is a legit material part
of the wall. It is granted free, it is not a blocky fall back."* Watchdog concurred: five authored
slabs of real material IS LOD400 — nothing invented, nothing substituted. **The no-fallback rule bans
INVENTED content, not fewer parts than the type list advertised.** The two conflated checks were
split; only one was ever right:
- **KEEP — `face_count>0` on every row that exists** (row 33 proper): a zero-face slab row is a lie.
  All falsification surfaces stay (empty-row injection → RED; set-inconsistency → RED).
- **DROP — slab count == authored `layer_count`:** a clipped instance carrying a whole-layer subset
  is normal and honest. Extractor announces it as `§LAYER-CLIP` naming the absent layers; the index
  records exactly the layers the instance's body carries (absent seq, never an empty row);
  `verify_layer_geometry` accepts per-sequence-matching subsets; P10 counts an envelope only when a
  hash has NO rows.
**Result:** Duplex gate **GREEN again** (0/80, exit 0) — W-LOD400-ENVELOPE **15/15**, RED-first (the
refusing extractor fails exactly the 2 new subset checks). Residents: `Duplex_geo.db` **v6** on OCI
(byte-verified) — both walls render **5 real slabs** seqs [0-4] Σ0.493 m, 225 rows / 71 hashes / 0
empty; geoV 5→6, sw v42→v43; `arc_editable.js` UNTOUCHED (§LAYER-GATE was always rows-existence-based
— subsets pass naturally, and the L6 falsification proves it still refuses a rows-less hash).
W-E2E-LAYERS-RESIDENTS **8/8 vs LIVE** (RED-first 5/8 vs pre-upload bytes); headless real-user open:
**196 meshes** (the walls are back), `refused=0`, hardfail 0/196; W-GLASS-PARITY 4/4, W-ARC-EDITABLE
10/10. SampleCastle's sporenkap still refuses — body misaligned with the authored set is a DIFFERENT
failure than a whole-layer clip; do not extend the exception to it.

## 🧭 START HERE — handoff as of 2026-07-28. Read this block, then only the sections it points at.

**Everything below §LODHELL-ROOTCAUSE is closed unless it is listed as OPEN here.** Do not re-walk the
2026-07-02/03 review sections looking for work — their surviving items are folded into the list below.
**⚠ §LODHELL FINDING 1's "GIGO" verdict is SUPERSEDED by §LOD400-ENVELOPE above — read that first.**

### Closed this pass (do NOT re-open, do NOT re-derive)
| what | proof | where |
|---|---|---|
| "LOD hell" root cause | W-LODHELL-CLASSIFY 5/5 | §LODHELL-ROOTCAUSE below |
| VOID-CONSUMED classifier, all-fails printing, honest P5, new P9, red §PROOF ⇒ exit≠0 | `f7d00240b` | `extractIFCtoDB.py` |
| dead no-boolean tier DELETED (measured: doesn't work + would invent uncut walls) | same commit | §LODHELL-FIX-2 |
| `rel_fills_host` shipped to SampleCastle / Duplex / SampleHouse | #1051, #1065 | `modeller/patches/*.sql` |
| IFC-open rendered ZERO ARC geometry — fixed, falsification-checked | #1062, W-ARC-SOURCE-PARITY 8/8 | `str_walker_outliner.js §IFC-OPEN-SEED-FIX` |
| published guide: hosted-door claim made true, Walk-ALL + IFC-open documented | live on gh-pages | `docs/ModellerGuide.md` |
| the 4 "stranded" Modeller branches | 3 were already landed; all deleted | PROGRESS.md §OPEN |

### OPEN — ranked, each one actionable as written
1. **⛔ DESIGN CALL (user's, not a build task): should a VOID-CONSUMED host be a non-rendered logical
   anchor?** Today a `kozijn` wall correctly has no geometry, so it never becomes a scene feature, so
   `fidByGuid[host_guid]` is null and `stretchRide()` skips its edge. Measured reach of the shipped
   relation: **SampleHouse 7/7 · Duplex 36/38 · SampleCastle 9/74**. SampleCastle is the outlier precisely
   because 65 of its 71 hosts are void-consumed. Making those hosts participate in the cascade WITHOUT
   rendering them would close the gap — but it means inventing a scene participant that has no geometry,
   which is a doctrine question, not an implementation one. **Do not build this unilaterally.**
   **▶ SONNET ANALYSIS 2026-07-30 (dispatched per MODELLER_MASTER.md §OPEN LIST row 4; user's word still
   required before any build):** recommendation = **yes-but-only-after-Y**, Y = the extractor first
   persisting the host's placement+extent. Data finding: the shipped DBs carry NOTHING for the 65 hosts
   (no `element_transforms`, no `element_instances`) — but the extractor DISCARDS data it already touches,
   it doesn't lack it: `shape.transformation.matrix` is free on the shape object, and `is_void_consumed()`
   (`extractIFCtoDB.py:770-808`) already tessellates the pre-boolean Body ITEM to classify, then throws
   the verts away (`:1247-1252` early `continue`). So persisting is "keep what's already computed," pure
   extract, no invention. Mechanism constraint (verified): a bare `fidByGuid` map entry will NOT work —
   `bonsai_gridmove.js:220-231 _buildBoxByFid()` requires a real `m.isMesh` in the scene group; the anchor
   must be an actual `THREE.Mesh` with `.visible=false` (seams: extractor flag row → `buildSeedOps`
   `params.anchorOnly` branch → `foldInsert` invisible-mesh branch; `sdg_cascade.js` untouched).
   Doctrine-against noted honestly: the extent is the PRE-boolean body repurposed, and §GEOM-HARDFAIL's
   skip is by design — carving an exception class needs its own spec. **THE ONE QUESTION FOR THE USER:
   should void-consumed hosts (65/71 on SampleCastle) get an invisible-but-real scene mesh — built from
   the host's own pre-boolean placement and body extent, never rendered — purely so `stretchRide()` can
   ride their fillings, or should this gap stay closed (SampleCastle 9/74 stays as-is)?**
   **✅ APPROVED — USER, 2026-07-30: "yes, build it."** Their grounds, recorded: the frame walls ARE
   architecture (author-drawn, absent only because the window ate the strip); keeping what the extractor
   already computes is extraction, not invention; never drawn ⇒ the LOD400 rule is untouched; payoff is
   SC 9/74 → nearly all. **ONE BINDING CONDITION, part of THIS spec, not a follow-up: the invisible
   anchor must be EXCLUDED from every count, pick, and audit, and tagged in the log as an anchor**
   (`§ANCHOR` line per seed; excluded from element/mesh counts, raycast/pick sets, `gmAudit`,
   `§DB_IDENTITY`-style coverage lines, and any witness that counts rendered geometry) — otherwise a
   future session finds 65 shapes with no visible geometry and reads it as the box bug all over again.
   Build spec = the Sonnet mechanism above (extractor persists placement+extent for void-consumed →
   `elements_meta`+`element_transforms` rows flagged anchor → `buildSeedOps` `params.anchorOnly` branch →
   `foldInsert` invisible mesh, `visible=false`, no material cost → residents get the 65 SC rows via
   `modeller/patches/SampleCastle_ARC.db.sql` + the existing `_applyPendingPatch()` loader, never a
   binary). Witness: SC `stretchRide` reach 9/74 → ≥70/74; anchors contribute 0 to every count/pick/audit
   (falsify by asserting counts identical before/after anchors load); a stretched kozijn host's window
   rides instead of warping.
   **▶ EXTRACTOR HALF SHIPPED 2026-07-30 — see §ANCHOR-EXTRACT-SHIPPED at the top of this file
   (witness 7/7 incl. RED falsification; SC patch SQL committed). Remaining: the bim-ootb
   seeding/invisible-mesh half.**
2. ~~**Clinic / Hospital / Terminal have no `rel_fills_host`**~~ ✅ CLOSED by bim-ootb #1749 (2026-09-18) — see §ROW34 correction. Original (stale) text: their source IFCs are not in this checkout,
   so there is nothing to recover from. Not an oversight. When a source lands, one command finishes it:
   `python3 scripts/gen_rel_fills_host_patch.py --ifc <src> --target ~/bim-ootb/modeller/<X>_ARC.db --out <wt>/modeller/patches/<X>_ARC.db.sql`
   The generator imports `extract_rel_fills_host()` (one recovery implementation) and measures reach
   against the real target. ⚠ `docs/ModellerGuide.md`'s Grid-Stretch section names only SH/DX/SC by
   design — **extend that sentence when a new building gains the relation**, or the guide goes stale.
3. **Walk-ALL row reuses the singular tooltip** — `bonsai_outliner.js:602` still renders
   `title="Walk this discipline"` on the synthetic `__ALL__` row. One string. Verified still open 07-28.
4. **§SEL-TINT-REFOLD** — a re-fold drops the selection tint while `_selSet` still holds the mesh. Zero
   hits for the tag in `modeller/`, so still unbuilt. Small, well-specified selection plumbing.
5. **Terminal-scale proxy-mode downgrade is silent to the user** — `modeller.html:3904` announces the walk
   start but nothing signals the batch-hold fallback. Geometry is identical either way (low severity).
6. **Window/opening composition as a BOM** — the original §NEW ARCHITECTURE QUESTION further below. It is
   now PARTLY answered: the host↔filling relation no longer has to be proximity-clustered, it is
   extracted (see FINDING 4). What remains is whether a multi-part window should fold as one assembly.

### Landmines — read before touching this area
- **Verify branches by CONTENT, never `git cherry`.** On 4 stale Modeller branches patch-id reported every
  commit as undelivered and was wrong every time; 300+ commits of drift changes patch-ids.
- **A 12-triangle mesh is not evidence of a fake box.** 46.4% of SampleCastle is genuinely 12-tri at
  source — a plain extruded rectangle IS 12 triangles. GIGO, not a violation.
- **An empty tessellation is not automatically a defect** — classify against the element's own openings
  first (`is_void_consumed()`), or you will report an author's deliberate void as a source bug.
- The renderer is clean and was re-measured (3225/3225 real meshes, mesh.db byte-faithful to the
  extractor). **Do not re-audit `real_geometry.js` for this.**

## 🔴 2026-07-27 — §LODHELL-ROOTCAUSE: "why is the LOD hell still there" — MEASURED. Renderer is clean; the
## loss is UPSTREAM, in extraction. Read this before touching `real_geometry.js`/`arc_editable.js` again.

Triggered by the live screenshot (`~/Pictures/Screenshots/Screenshot from 2026-07-27 14-08-06.png`,
`red1oon.github.io/bim-ootb/modeller/modeller.html`, SampleCastle, detailed lower facade + boxy upper masses,
`selected feature #2362`). Guids in the Outliner confirmed against `SampleCastle_ARC.db` — building identified
by query, not by eye. All figures below are SQL over the SHIPPED artifacts, no browser, no screenshot as
evidence (FUNDAMENTAL LAW). Resident under test: `str_walker_outliner.js:41` →
`db: SampleCastle_ARC.db`, `geoDb: mesh.db`.

**FINDING 0 — the renderer is NOT the culprit; stop re-auditing it.**
- `element_instances` = 3225 rows; **3225/3225 (100%) resolve a real mesh in `mesh.db`**. `hash_MISSING = 0`,
  `distinct_missing = 0`, `null_hash = 0`. `real_geometry.js buildGeometryIndex()` has nothing to fail on.
- `mesh.db` is **byte-faithful to the extractor**: of the 1924 hashes SampleCastle needs, all 1924 exist in
  `deploy/buildings/SampleCastle_extracted.db` too and `length(faces)` differs on **0** of them. `mesh.db` is
  not a proxy/decimated store — it carries exactly what the compiler emitted.
- `arc_editable.js:159-168` `§GEOM-HARDFAIL` is behaving correctly (refuse + log + skip, never a fake box).
  There is **no LOD-doctrine violation here** ([[feedback_no_fake_lod_unbreakable]] scope: pipeline fidelity,
  not source richness). Nothing shown is invented. What's wrong is what's MISSING and what's THIN.

**FINDING 1 — ⚠ SUPERSEDED 2026-07-29 by §LOD400-ENVELOPE at the top of this file. The COUNTS below are
correct and still usable; the VERDICT ("GIGO, not a violation") is WRONG — 67 of these ≤12-tri SampleCastle
elements are authored MULTI-LAYER (412 `IfcMaterialLayerSetUsage` in the source), so the box is an envelope
fallback, not the authored geometry. Do not cite this finding's conclusion.**

~~46.4% of what renders is genuinely a 12-triangle box at SOURCE (1498/3225).~~ This is the boxy
mass in the screenshot. Per class (`rendered` / `12-tri` / %):

| class | rendered | 12-tri | % |
|---|---|---|---|
| IfcWallStandardCase | 231 | 230 | **99.6** |
| IfcWall | 648 | 324 | 50.0 |
| IfcRailing | 90 | 42 | 46.7 |
| IfcBuildingElementPart | 277 | 126 | 45.5 |
| IfcCovering | 1214 | 515 | 42.4 |
| IfcSlab | 279 | 116 | 41.6 |
| IfcWindow | 259 | 92 | 35.5 |
| IfcDoor | 205 | 49 | 23.9 |

A plain uncut rectangular solid legitimately tessellates to 12 triangles, so this alone is GIGO, **not** a
violation — but `IfcWallStandardCase` at **230/231** is the tell, and Finding 2 explains it.

**FINDING 2 — the real defect: every wall that has an opening cut into it LOST ITS GEOMETRY and is not
rendered at all.** Parsed `internal/sources/Ifc2x3_SampleCastle.ifc` (714,485 entities): the source has
**79 `IFCRELVOIDSELEMENT` / 79 `IFCOPENINGELEMENT` / 74 `IFCRELFILLSELEMENT`** → 71 unique host elements
(60 `IfcWallStandardCase` named `kozijn` = Dutch *window frame*, 14 `IfcBuildingElementProxy`, 3 `IfcCovering`,
2 `IfcSlab`). Cross-joined against the shipped DBs:
- **65 of those 71 opening-hosts have NO `element_instances` row, NO `element_transforms` row, no geometry
  anywhere.** Only 6 survive with geometry.
- They are part of a **117-row meta-only population** identical in all three DBs
  (`deploy/buildings/SampleCastle_extracted.db` 3621 meta / 3504 inst; ootb `SampleCastle_extracted.db` and
  `SampleCastle_ARC.db` both 3342 / 3225) — i.e. this originates in the COMPILER, not in the ARC filter or
  the ootb copy. Breakdown: `IfcWallStandardCase` 51, `IfcCovering` 48, `IfcBuildingElementProxy` 14,
  `IfcWall` 4 (`kozijn`, `dakopstand`).
- `extractIFCtoDB.py:1351-1366` writes `elements_meta` + `element_instances` + `element_transforms` **in one
  block**, so a meta-only row cannot come from the geometry loop. These 117 have meta but zero transform ⇒
  written by a later meta-only pass (the BOM stage's `INSERT OR IGNORE INTO elements_meta (guid, discipline,
  ifc_class, element_name, element_type)` in `BOMTypeSystem.java:392` / `BOMBuilder.java:213` /
  `FloorAssemblyBuilder.java:340`), while the geometry pass had already dropped them into `failed`
  (`extractIFCtoDB.py:1426-1429`, which only prints the first 5).
- ~~Net effect: the frame-walls that carry the windows are hard-failed and never drawn.~~ **← RETRACTED,
  see FINDING 2-CORRECTED. The elements are absent, but that is CORRECT, not a loss.**

**FINDING 2-CORRECTED (2026-07-27, same day, by RUNNING the extractor — this supersedes the "lost geometry"
reading above; do not re-cite it).** Baseline re-extraction of the same IFC
(`log: scratchpad/lodhell/baseline.log`, `imported=3583 failed=65 bbox_fallback=0`, `§PATHB 79 host edges
recovered`) plus a per-element probe give the actual mechanism:
- All 65 empty-tessellation elements are the opening-hosts. Their **body representation tessellates
  perfectly** — probed `create_shape()` on the `Body` `IfcExtrudedAreaSolid` ITEM directly for
  `1A9aTEU4z9SwaqEUwI8Lx4`: **8 verts / 12 tris**, a 1.210 × 0.114 × 1.850 m strip.
- Its authored opening (`merk B1sp-R`) measures **1.210 × 0.342 × 1.850 m** — equal in width and height,
  *thicker* than the wall. The boolean subtraction correctly removes **100%** of the body ⇒ empty product.
- Classified all 65 programmatically: **65/65 VOID-CONSUMED** (body tessellates + has `HasOpenings` +
  product empty). **0** with an empty body, **0** empty without openings. There is no geometry defect here.
- And the content is not missing: `rel_fills_host` in the fresh DB has 79 rows / 74 with a filling, and
  **74/74 fillings (the actual windows/doors) DO have geometry**. A `kozijn` is the wall strip that exists
  only to host a window; the window is what you are meant to see. The author voided it deliberately.
- ⇒ **The "LOD hell" is FINDING 1 alone** — SampleCastle's own source detail (46.4% literal 12-tri boxes,
  `IfcWallStandardCase` 230/231). GIGO, honest, no pipeline fix available. What IS broken is the REPORTING
  around it (Finding 3) — a correct outcome is being screamed at as an illegal fallback.

**FINDING 3 — the reporting is wrong in three ways, and the "fix" I first proposed for it is wrong too.**
- `extractIFCtoDB.py:1179` raises `§ILLEGAL_PARAMETRIC_FALLBACK … "Add to NON_GEOMETRIC_CLASSES or fix IFC
  source"` for all 65 — **a correct, authored geometric outcome reported as a source defect.**
- `:1426-1429` prints only `if failed <= 5`. 60 of 65 are invisible. A genuine defect hiding among them
  would never be seen.
- P5 `FAIL_RATE` counts them ⇒ **`§PROOF RESULT: 5 PASS, 1 FAIL` (65/3648 = 1.78%)** — the gate cries wolf
  on every run, **and the script still `exit 0`** (verified). The one check that could have caught a real
  loss is permanently red for a non-reason and non-blocking.
- ⚠ **The Tier-2 no-boolean fallback must NOT be wired** (this reverses my own earlier fix-2 proposal).
  Measured: `DISABLE_BOOLEAN_RESULT=True` (readback confirmed `True`) still yields **v=0 t=0** at product
  level on ifcopenshell 0.8.4 — it does not work. And even if it did, it would resurrect a wall the author
  deliberately voided and render it as an uncut solid — **inventing content, a direct
  [[feedback_no_fake_lod_unbreakable]] violation.** `settings_no_bool` (`:1119-1123`) and
  `BOOL_DEPTH_THRESHOLD` (`:1125`) are unreferenced dead code and must be **deleted**, not activated.

**FINDING 4 — correction to an existing memory claim, do not re-cite it.**
[[project_modeller_lod400_real_geometry]] and the 2026-07-02 NIGHT note (item 1) state SampleCastle has no
`rel_fills_host` "confirmed absent in both the DB and the source IFC." **The DB half is true; the source-IFC
half is FALSE** — the IFC has 79 RelVoids / 74 RelFills. The relations are **dropped by the pipeline**, not
missing from the source. This changes the §STRETCH-RIDE / proximity-clustering design question below: the
host↔opening relation does not have to be re-derived by a geometry-clustering heuristic — it can be
**extracted**, which is the Prime-Rule-compliant path.

**FINDING 4 — correction to an existing memory claim, do not re-cite it.**
[[project_modeller_lod400_real_geometry]] and the 2026-07-02 NIGHT note (item 1) state SampleCastle has no
`rel_fills_host` "confirmed absent in both the DB and the source IFC." **The DB half is true; the source-IFC
half is FALSE** — the IFC has 79 RelVoids / 74 RelFills, and `extract_rel_fills_host()`
(`extractIFCtoDB.py:757`, called at `:1532`) already recovers all 79 verbatim. The shipped DBs simply predate
that function. So the §STRETCH-RIDE host↔opening relation does **not** need a proximity-clustering heuristic —
it is already extracted, it just was never shipped to the Modeller.

---

### §LODHELL-FIX — SPEC (written before code, per Spec-First). Three items, in order.

**§LODHELL-FIX-1 — classify empty tessellation; report all of it; make the gate mean something.**
*Issue it proves/disproves:* whether a genuine geometry loss can be distinguished from an authored full-void
in the extraction log, and whether the §PROOF gate can still fire on the genuine one.
- In the iterator loop, when `len(verts) < 3 or len(faces) < 1`, do NOT unconditionally raise. First classify,
  using authored data only (non-invent — no thresholds, no heuristics):
  - element has ≥1 `HasOpenings` **and** at least one `Body` representation ITEM that tessellates non-empty
    ⇒ **`§VOID-CONSUMED`**: the author's own opening removed the whole body. Counted in `void_consumed`,
    NOT `failed`. Recorded (see below), not rendered — the filling element carries the visible geometry.
  - anything else ⇒ real failure, keep the existing `§ILLEGAL_PARAMETRIC_FALLBACK` raise.
- Print **every** real `§FAIL` (drop the `failed <= 5` cap). Print `§VOID-CONSUMED` as one summary line plus
  a capped sample, since it is expected output, not an error.
- P5 `FAIL_RATE` counts real `failed` only. Add **P9 `VOID_CONSUMED`**: informational PASS carrying the count,
  and FAIL if any void-consumed element's **filling has no geometry** (that is the one case where a consumed
  host really does leave a hole — the check that would have caught a true loss).
- `main()` returns non-zero when `_proof_fail > 0`. A red §PROOF must fail the run, not exit 0.
- *Witness:* `scripts/witness_lodhell_classify.py` — re-extract SampleCastle, assert
  `failed == 0`, `void_consumed == 65`, `§PROOF RESULT` has 0 FAIL, exit code 0; then falsify it by forcing
  one host's filling out of the DB and asserting P9 turns FAIL + exit non-zero.

**§LODHELL-FIX-2 — delete the dead no-boolean tier (NOT wire it).** Evidence in FINDING 3: it does not work
on ifcopenshell 0.8.4 and activating it would invent uncut walls. Remove `settings_no_bool` and
`BOOL_DEPTH_THRESHOLD`, leave a comment recording the measurement so nobody re-adds it.
*Issue it proves:* that no code path can resurrect an author-voided body as real geometry.

**§LODHELL-FIX-3 — ship `rel_fills_host` to the Modeller's SampleCastle.** The extractor already produces it;
the shipped DBs have no such table, which is why `sdg_cascade.js stretchRide()` silently no-ops (2026-07-02
NIGHT item 1). Per the project DB policy (**patch + self-heal loader together, never a binary**):
`modeller/patches/SampleCastle_ARC.db.sql` = `CREATE TABLE IF NOT EXISTS rel_fills_host (…)` + 79 `INSERT OR
IGNORE` rows generated from the freshly-extracted DB, applied by the existing
`str_walker_outliner.js _applyPendingPatch()`.
*Issue it proves:* that `stretchRide()` stops no-opping on SampleCastle — a hosted window rides its wall
instead of warping.

## 🔎 2026-07-03 — deeper competitive-polish pass, see dedicated spec
5 more parallel investigations (Outliner↔canvas wiring, visual consistency, IFC/BCF interop, 3D-grid geometric
accuracy, authoring-toolset+canvas-render polish) went into their own file, not inline here — it's a big enough
thread to deserve one: **`prompts/RESUME_MODELLER_COMPETITIVE_POLISH.md`**. Headline: ~11 Fable5-ready quick
wins found (top pick: surface `ArcEditable.gmAudit()`'s already-computed confidence data, currently
console-only), plus real rendering-pipeline gaps (flat emissive-tint selection instead of an outline pass, no
shadows/AO/post-processing) and a real-but-incremental BCF/IFC interop opportunity (GUIDs + IFC export + camera
capture all already exist; the zip/XML container doesn't).

## 🔎 2026-07-02 NIGHT — watchdog quality-review pass (independent re-read of PRs #598/599/604/606/608/613,
no code changes). Verdict: the CLOSED items hold up — the anchor fix (`bonsai_library.js` `§ARC-ANCHOR`/
`rotAnchor`) is genuinely general (no building-type/IFC-class special-casing), no TODO/FIXME/HACK in any
touched file, `console.warn`/`console.error` calls all fire only in genuine failure paths. Five real, non-
urgent gaps found — sized and assigned below (per [[feedback_model_allocation_mastermind_vs_execution]]:
Sonnet = the user's own architecture/scoping call, Opus = well-scoped-but-nontrivial autonomous build, Fable5
= mechanical/well-specified execution):

1. **Root cause of the still-open item 3 below, now precisely characterized:** `modeller/sdg_cascade.js:39,47,50`
   `stretchRide()` silently no-ops whenever a building has no `rel_fills_host` relations (SampleCastle has
   none — each window is 4+ independent `elements_meta` rows held together by nothing but spatial proximity,
   confirmed absent in both the DB and the source IFC). Falls back to the default per-fragment TRANSLATE/SCALE,
   so stretching a SampleCastle host wall's grid would split/warp the window frame instead of riding it as one
   assembly. Honest fallback, not a crash — but this IS the mechanism item 3 (proximity-clustering-as-BOM) has
   to solve. **Assign: Sonnet dialogue with you first** (the design call was already flagged as yours to make —
   this just gives it a precise mechanism to design against), **then Opus to implement** (a real geometry-
   clustering heuristic + BOM synthesis, not mechanical).
2. ⛔ **STILL OPEN (re-verified 2026-07-28)** — **"Walk ALL Disciplines" reuses the singular per-row tooltip.**
   The line moved: it is now `modeller/bonsai_outliner.js:602`, still `title="Walk this discipline"` on the
   synthetic `__ALL__` row. **Assign: Fable5** (one string, fully specified).
3. **The Outliner 3-surface unification was descoped, not shipped, and it's undocumented that it was.**
   `modeller/modeller.html:2902-2906` has its own comment admitting the "risky Outliner restructure" was
   dropped in favor of just adding an ALL-row to the existing category — STR Walker tab and "Route trunk"
   remain separate, unlabelled categories, short of the one-panel VISION-LOCK doctrine. Honestly disclosed in
   code, but worth deciding whether it's still wanted. **Assign: Sonnet to re-scope** (is the restructure still
   wanted, what's a safe incremental path that doesn't risk the surfaces that already work) **→ Opus to build**
   if greenlit (multi-file UI refactor, real regression risk).
4. ✅ **DONE 2026-07-28 — do not re-assign.** ~~Zero end-user documentation for Walk-All-Disciplines or
   §STRETCH-RIDE's hosted-door behavior in `docs/ModellerGuide.md`.~~ Both now written and **live on
   gh-pages** (verified by content poll, not just a canary 200). Two corrections to the note as written:
   (a) the §STRETCH-RIDE half was already documented — the real defect was that the sentence was FALSE,
   because no resident shipped `rel_fills_host`; fixed at the source (#1051/#1065), not in prose;
   (b) IFC direct-open was ALSO undocumented and is now covered. ⚠ The Grid-Stretch text names only
   SH/DX/SC by design — extend it when another building gains the relation (OPEN item 2 in §START HERE).
5. **Terminal-scale proxy-mode downgrade is invisible to the user** — `modeller/modeller.html:2374-2384` only
   `console.log`s the batch-hold fallback; final geometry is identical either way (low severity) but nothing
   in the UI signals reduced reveal quality during a big walk. **Assign: Fable5** (add a small toast/badge,
   well-specified).

Also still unclaimed from the EVENING UPDATE below: **§SEL-TINT-REFOLD** (a re-fold drops the selection-tint
visual on an authoritative rebuild while `_selSet` still logically holds the mesh) — small, well-specified
selection-plumbing fix. **Assign: Fable5.**

## ✅ 2026-07-02 EVENING UPDATE — items 1+2 of the PM UPDATE both DONE+MERGED, read this first
- **Item 1 (Terminal-scale perf-guard) DONE — bim-ootb PR #606 MERGED (verified on origin/main, not assumed).**
  Ran Walk-ALL on the REAL Terminal for the first time (35,552 scene meshes, default threshold 50000, real
  Outliner row click). The guard MISBEHAVED, both suspicions confirmed and fixed:
  (a) proxyMode never fires on our largest building — the ~48k figure is elements_meta rows, the scene is
  35,552 group children < 50,000; (b) the un-guarded per-instance flash took **39,319ms for ACMV n=2829
  against its own 1200ms budget** (setInterval ~4ms clamp); (c) `_commitDiscChains` committed sweeps ONE at
  a time (~1.6–2s each at Terminal scale: full verifyChain over 38k rows + a 51k-row Outliner repaint per
  sweep). Fixes (scheduling-only): time-budgeted rAF batch settle in `_flashSettleDisc` (post-fix at real
  Terminal: ACMV 1416ms, ELEC 4943→1206ms, roof **74,629 instances→1242ms**) + ONE signed group via
  `commitSeedGroup` in `_commitDiscChains` (mirrors `_commitDiscWalk`). With the budget fix, proxyMode=false
  at Terminal is now CORRECT (guard kept as belt-and-braces >50k). Standing regression:
  `modeller/tests/witness_e2e_walkall_terminal_scale.js` (W-TERMINAL-WALKALL-PERF 6/6, ~8min headless).
  Also fixed en route: W-ROUTER-NNCHAIN N2 was stale (counted LineSegments; §DW-TUBE renders InstancedMesh
  tubes) — failed 7/1 identically on unmodified main; now 8/8.
- **Item 2 (guide-screenshot framing) DONE — bim-ootb PR #608 MERGED + bim-compiler guide frames LIVE**
  (branch `docs/modeller-guide-integrate`, deployed via safe_gh_deploy, canaries 200, live gizmo.png
  fetched back byte-identical). Real root causes, all measured: (a) `shotClip` never clamped its clip →
  puppeteer threw → SILENT full-wide-shot fallback (gizmo/scale-stretched/rotate-yaw); (b) `pick()` chose
  the biggest slab (cut-select's roof crop); (c) the hardcoded sketch/route spot (2,0)-(4.4,2.4) is UNDER
  THE DUPLEX ROOF — plan-clear ground is now DERIVED live (`t.clearGround`: plan-clear + on-screen +
  camera-unoccluded + on-grid); (d) route-run's click-to-select hit furniture (#152), replaced by
  `t.frameElement`. All 8 frames recaptured AND eyeballed. Witnesses 7/7·7/7·7/7·8/8·8/8 + consumer
  regressions delete 6/6, fillet 8/8, stretch-ride 9/9.
- **NEW app-level UX nit (found by the wall-subject cut witness, proven by render-state census, NOT fixed):
  §SEL-TINT-REFOLD — an authoritative re-fold (cut/undo/scrub) rebuilds a still-selected mesh WITHOUT its
  selection emissive (2b5a8c→000000) while `_selSet` still logically holds it.** Geometry/colour/centre
  restore EXACTLY (proven); only the tint visual is dropped. Small selection-plumbing fix, unclaimed.
- Item 3 (proximity-clustering-as-BOM design call) remains open and remains a USER decision — untouched.
- In-flight same evening: W-MV-PARITY witness (Modeller ARC open ≡ Viewer LOD400/spatial truth, user-asked)
  — see `prompts/RESUME_MODELLER_GUIDE_SCREENSHOT_FIX.md` sibling cards and the session summary.

## ✅ 2026-07-02 PM UPDATE — §STRETCH-RIDE DONE, session wrapping up, read this first
- **§STRETCH-RIDE MERGED: bim-ootb PR #604 (`cb7bc17`), on top of `main` post geomapping PRs #601-603, clean,
  no collision.** Grid-editing a wall no longer divorces or scales its hosted doors/windows — the ride resolves
  ONLY over the real `rel_fills_host` relation (no proximity heuristics, per the earlier watchdog decision):
  TRANSLATE rides the exact delta, SCALE keeps proportional position with the door's extent untouched.
  Independently re-verified (not just agent-reported): `witness_stretch_ride.js` 9/9 (math exact to 1e-9
  round-trip), `witness_e2e_stretch_ride.js` 9/9 including a real pixel-readback visibility check
  (`nonBg=386/400`) — this closes `RESUME_CASCADE_INTO_STRETCH.md`'s 2026-06-29 open rigor item ("prove
  visibility by maths, not an eyeball"), don't reopen it. `witness_stretch_gate_smoke.js` S4 fails identically
  before/after (pre-existing, not a regression from this PR) — stated, not hidden.
- **SampleCastle rides ZERO doors — verified directly against its DB (no `rel_fills_host` table exists at
  all) and its source IFC.** This is the honest non-invent boundary, not a gap: the multi-part `stelkozijn`
  window pieces have no relation to ride on. **This closes the "single-relation ride" layer of the
  §NEW ARCHITECTURE QUESTION below — the REMAINING open piece is specifically the proximity-clustering-as-BOM
  layer for SampleCastle's un-related sibling parts**, which would need to CREATE new relations/groupings, not
  recover existing ones — a different, still-unscoped design task, not this session's work.
- **Session wrapping up. Remaining open, ready for a fresh session, no shared context needed:**
  1. Terminal-scale (~48k elements) perf-guard verification for "Walk All Disciplines" — never exercised for
     real, only simulated at Duplex-scale (see below).
  2. Guide-screenshot framing fix (`cut-select.png`/`gizmo.png`/`route-spine.png`) — isolated to
     `e2e_harness.js`'s `shotClip`/`bboxScreen`, see `prompts/RESUME_MODELLER_GUIDE_SCREENSHOT_FIX.md`.
  3. The proximity-clustering-BOM design question (SampleCastle sibling parts) — now more precisely scoped per
     the finding above, still a genuine open design call, not a bug fix.

## ✅ 2026-07-02 UPDATE — merge plan + Walk All Disciplines BOTH DONE, read this first
- **Merge plan (§below) DONE**: `feat/samplecastle-tilt-visual-proof` rebased past #595/#596 (conflicts in
  `arc_editable.js` hand-merged — rotation-branch logic + real-geometry-resolution logic are additive, not
  contradictory; merged both, did not `--ours`/`--theirs`). bim-ootb **PR #598 MERGED** to `main`
  (`02e5a2a`). Re-verified independently post-rebase: `witness_arc_editable(+smoke)`, `witness_e2e_lod_match`,
  `witness_e2e_terminal_open` all green, PLUS a fresh triangle-count probe against the live Terminal scene
  (0/35,552 elements matched the 8-vert/12-tri box-fallback signature — real geometry confirmed building-wide,
  not just per a log line).
- **"Walk All Disciplines" UX polish (§NEXT below) DONE**: `window.discWalkAll(ctx)` loops
  `DiscWalker.disciplines()` sequentially, x-ray brackets the run, genuine per-instance orange-flash-then-settle
  reveal (`InstancedMesh.instanceColor`), perf guard above `window.DW_ALL_PROXY_THRESHOLD` (50000, animation-
  smoothness only). One new "▶▶ Walk ALL Disciplines" Outliner row folds the 3-surface gap; STR Walker tab
  left untouched. Stale MEP/RouteWalker comment fixed. Built in `/tmp/wt-walk-all-disc` (branch
  `feat/walk-all-disciplines`), bim-ootb **PR #599 MERGED**. `witness_e2e_walk_all_disciplines.js` 10/10 +
  5 regression witnesses all re-run and confirmed green by the orchestrating session itself, not agent-report-
  only. **Explicitly NOT verified**: a real Terminal-scale (~48k elements) run of the perf-guard branch — only
  a threshold-lowered simulation on Duplex-scale data ran. If Terminal-scale Walk-All is ever exercised for
  real and the guard misbehaves, start there.
- **Still open, not scoped**: the window/opening-as-BOM-assembly design question (§NEW ARCHITECTURE QUESTION
  below) — ✅ its non-invent PREREQUISITE CHECK now done (2026-07-02): queried
  `deploy/buildings/SampleCastle_extracted.db` directly, confirmed a physical window IS multiple independent
  `elements_meta` rows held together by spatial proximity alone (zero relation table anywhere in this schema) —
  the grid-stretch distortion risk is real, not moot. The FIX itself (proximity-clustering heuristic + BOM
  transform) is still unscoped, a fresh-session design call — see the updated §NEW ARCHITECTURE QUESTION
  section below for the full finding.
- **Coordination note (2026-07-02, RE-UPDATED — GeoMapping lane now CONCLUDED, this is the live-usable state) —**
  `prompts/RESUME_IFC_BOM_GEOMAPPING.md` (bim-compiler, gitignored `prompts/`) is DONE, not just shipped:
  Tiers 1+2 (PR #12), Tier 3 rooms (PR #13, 62% IoU), Rung-1 relational rooms (PR #14, **21/21 IoU on the
  ground-truth Duplex — verified independently by re-running `W-GEOMAP-RUNG1`, all 21 rooms recovered, every
  polygon cites a real `IfcRelSpaceBoundary` GUID, zero fabricated**), Terminal Tier-1 sidecar (PR #15,
  48,428/48,428 join), Clinic+Hospital onboarded (PR #16, 100% joins, own-in-band 94.5/94.9%) — all MERGED to
  bim-compiler `master`. **On the bim-ootb side, it's WIRED IN, not just available:** PR #601 wired
  `ClassifyGeom` into the modeller audit-first (an `arc_editable.js` audit channel + `wcGeomapSignal` +
  `validate_extraction.js` CLI, proven op-byte-identical, Duplex flag-rate 0.033 vs expected ~5%), PR #602
  refreshed the shipped data copies. **What this means for THIS session's work:** the classifier is live and
  callable NOW — if the window/opening-BOM-assembly fix (or anything else touching `arc_editable.js`) wants a
  real per-element classification/confidence signal, it exists, don't re-derive an ad-hoc one. Remaining open
  items on that lane (not this session's concern, tracked there): topology-transfer spike (item 5, explicitly
  told to coordinate with the RosettaStone graph-hypothesis thread first) and an alias-hardening spec (item 6,
  `§ALIAS-SPEC`, written but gated on onboarding HHS_Office first — its source IFCs are NOT yet in this repo,
  only at the old `/home/red1/Projects/bim-compiler/DAGCompiler/lib/input/IFC/opensourceBIM_HHS_Office_*.ifc`
  path, same copy-in-first situation Terminal's `merged_federation.ifc` needed).
  Original note follows, still correct on the CI-failure root cause (now historical): **bim-compiler PR #12 (`geomap/tier12-engine` → `master`)
  OPEN, `mergeable: MERGEABLE`, but its `system-is-real` CI check shows FAILURE** — I checked the actual log:
  it's `npm ci` failing because this repo has no root `package.json` on EITHER `master` or the PR branch (not
  something the PR broke) — confirmed the SAME failure on the last 2 merged PRs (#10, #11) too, both merged
  past it anyway. **This is a known pre-existing, repo-wide broken CI gate, not a real regression** — #12 is
  safe to manually merge on the same precedent, whenever whoever owns that lane is ready; I did not merge it
  myself since it's not my lane's work.
- Below this point is the ORIGINAL resume file, kept for history/detail — the merge-plan and NEXT sections it
  describes are now DONE per the update above; don't re-do them.

**Scope: close out Terminal's real-geometry gap, land the fix below on bim-ootb `main`, then move to the
animated "walk all disciplines" UX polish per bim-ootb `docs/ModellerGuide.md` /
`prompts/RESUME_MODELLER_GUIDE_POLISH.md`'s quality bar. This is a bim-ootb-side task (Modeller webapp) —
all file paths below are relative to `~/bim-ootb` unless stated otherwise. Read this whole file before
touching `arc_editable.js`/`bonsai_library.js` — two fixes below already edit both, do not re-derive what's
already done. Follows the `feedback_prompts_migrating_check_other_repos` convention: this repo's `prompts/`
is the canonical resume/handoff location even for bim-ootb-side work — the actual code lives in
`/tmp/wt-sc-tilt-visual` (a bim-ootb worktree), not here.**

## Settled facts (verified, do not re-derive)
- **Root cause found and fixed 2026-07-01/02**: the Modeller rendered EVERY element as a 12-triangle raw
  bounding-box ("LOD-200"), even though the building's own real mesh (`component_geometries`/
  `base_geometries`, keyed by `element_instances.geometry_hash`) was sitting unread in the same `.db`.
  Confirmed by instrumenting the live THREE.Scene: `boxCount=3225, otherCount=0` (100% fake) for
  SampleCastle before the fix. This was NOT caught by any of the 32 `modeller/tests/witness_*.js` files in
  bim-ootb — audited all 32, zero flagged; every browser-touching witness asserts something coarser than
  mesh shape (counts, bbox-centre/extent deltas, pixel-diffs) that a box satisfies identically to real
  geometry. The ONLY thing wrong was human trust: opening the Modeller looked like a real building and
  wasn't. Do not assume "witness green" ⇒ "looks right" in the bim-ootb Modeller without an actual
  screenshot check.
- **Fix built + independently verified (not just agent-reported — re-checked myself via Playwright + a
  fresh triangle-count probe + running the updated witness)**: real per-element geometry now renders for
  SampleHouse, Duplex, SampleCastle, and a new SampleCastle-ARC diagnostic resident. Hard-fail policy in
  place (`§GEOM-HARDFAIL`, loud + skip, never a silent box) — measured 0 unresolved across all four.
  Outliner↔scene bidirectional click sync + camera fly-to also verified working (camera position changes on
  Outliner-row click, zero console errors).
- **Terminal is the one bim-ootb resident NOT yet covered** — its real geometry lives in a SEPARATE file
  (`modeller/Terminal_geo.db`, 261MB local, `component_geometries` table, 9394 rows) that literally nothing
  in the codebase fetches. `Terminal_meta.db` (the walk substrate) has no geometry table at all. Verified:
  Terminal's 35,552 ARC elements need only 1,027 DISTINCT geometry hashes (heavy reuse), 100% coverage
  confirmed in `Terminal_geo.db`. An agent was dispatched to close this gap — **check
  `git -C /tmp/wt-sc-tilt-visual log --oneline` for a 3rd commit past `7d833dd` before doing anything else.**
  If it's there: read its commit message, re-verify independently (screenshot + triangle-count probe +
  `witness_e2e_terminal_open.js` + the 4 existing-resident regression witnesses), then fold into the merge
  plan below. If it's NOT there (agent died/incomplete): the brief that was given is reusable almost
  verbatim — see `## Terminal brief, if it needs re-launching` below.

## Where the work lives (all in bim-ootb, local, un-pushed except noted)
- Worktree `/tmp/wt-sc-tilt-visual`, branch `feat/samplecastle-tilt-visual-proof`, off `origin/main` as of
  `351992e` (BEFORE the two PRs below merged — this branch will need a rebase, see `## Merge plan`).
  - `4631d35` — SampleCastle-ARC diagnostic resident (ARC-only filtered copy of bim-compiler's VERBATIM
    `deploy/buildings/SampleCastle_extracted.db` — NOT bim-ootb's own PR #543 re-extraction, which is the
    already-known-corrupted copy per `feedback_modeller_gh_vs_viewer_oci_data.md`).
  - `7d833dd` — the real-geometry render fix + Outliner↔scene sync (see above).
  - possibly a 3rd Terminal commit (check before reading further).
- **bim-ootb PR #595 `fix(modeller): ARC-seed full 3-axis rotation + SampleCastle one-source-of-truth` —
  MERGED to `main`** 2026-07-01 (was worktree `/tmp/wt-arc-rot-fix`, branch `fix/arc-rotation-full-axes`).
- **bim-ootb PR #596 `fix(modeller): Outliner Components-category paint stall` — MERGED to `main`**
  2026-07-01 (was worktree `/tmp/wt-outliner-stall`, branch `fix/modeller-outliner-components-stall`).

## Merge plan for `feat/samplecastle-tilt-visual-proof` — DO THIS NEXT
This branch conflicts with the now-merged PR #595 — **both edit `modeller/arc_editable.js` and
`modeller/bonsai_library.js`** (rotation fix vs. real-geometry fix, different regions of the same
functions). Steps:
1. `git -C /tmp/wt-sc-tilt-visual fetch origin && git -C /tmp/wt-sc-tilt-visual rebase origin/main`
   (or merge — your call, bim-ootb has no `required_linear_history`, rebase is cleaner for a 2-3 commit
   branch). Resolve conflicts by UNDERSTANDING both diffs first (`git show 901bb08`, `git show b06e64b` for
   the rotation fix vs `git show 7d833dd` here) — they touch different concerns (rotation math vs.
   mesh-source resolution) in the same functions, so most conflicts should be additive, not contradictory.
   Do NOT blindly `--ours`/`--theirs`.
2. Re-run the full verification pass after rebasing (triangle-count probe, `witness_arc_editable*`,
   `witness_e2e_lod_match.js`, the Outliner-sync click check) — a rebase across two substrate-editing
   commits is exactly the kind of change that could silently reintroduce a regression.
3. Open the PR against bim-ootb `main`, let CI (`fast-checks`, `e2e-tests`, both required) run, auto-merge
   (`gh pr merge <n> --auto --squash`) same as #595/#596.
4. **Only after this merges**, the SampleCastle-ARC diagnostic resident + real-geometry rendering are on
   bim-ootb `main` and safe to reference as canonical for the guide screenshot (see `## Guide screenshot`
   below).

## Terminal — ✅ DONE 2026-07-02 (commit `8e5f5a6` on top of `7d833dd`, same branch)
Wired `Terminal_geo.db` as an optional split geometry source (`RESIDENTS` entry gains `geoDb:
'Terminal_geo.db'`, lazily fetched + IndexedDB-cached; `buildSeedOps(db, geoDb)` threads it through,
defaults to `db` so the 4 single-file residents are unaffected). Independently re-verified (not just
agent-reported): `witness_e2e_terminal_open.js` 7/7 (`node modeller/tests/witness_e2e_terminal_open.js` with
`NODE_PATH=~/bim-ootb/tests/node_modules`, ran it myself), 35,552/35,552 ARC elements seeded, chain verified.
Agent additionally reports 35,552/35,552 real meshes resolved (was 0/35,552 before), 0 `§GEOM-HARDFAIL`,
`witness_arc_editable*`/`witness_e2e_lod_match.js` all still green (regression-free) — I verified the
witness pass myself but not the triangle-count claim independently; worth a quick re-check before relying
on it further, same discipline as everything else in this file.

## CLOSED — the SampleCastle rotation "regression" thread (user call, 2026-07-02)
Chased and dropped. The user visually inspected the ground-truth example (`IfcWindow` guid
`2pFYENFv91ygvyAeZOYi93`, `stelkozijn`) in the Viewer's Find Panel directly and confirmed it's a thin,
flat, long, border-like sub-piece — a sill/trim member, not the pane — and believes the broader "497 tilted"
set is the same pattern (sills/trim naturally sitting at a different orientation than their parent window,
not a rotation bug). Don't re-open this thread or re-cite that guid as "proof of a bug." (bim-compiler's
Java extractor genuinely IS yaw-only end-to-end — `ElementPersistence.java:322-336` — that structural fact
still stands if it ever matters for something else, it just isn't the live concern here.) What DOES matter
going forward: confirming these sill/trim elements render as real LOD400 geometry (not a box) in
SampleCastle-ARC — **confirmed, same day.** Queried `SampleCastle_ARC_extracted.db` directly: `stelkozijn`
(guid `2pFYENFv91ygvyAeZOYi93`) resolves to a real 48-vert/28-tri blob (`component_geometries`, hash
`a99fec656be6339e`) — a genuine multi-facet sill shape, not a `boxArrays()` fallback. A sample of 10
IfcWindow/IfcCovering siblings: other `stelkozijn` instances are 24v/12t or 48v/28t (simple real sill
segments — some legitimately 12-tri because a sill genuinely can be a plain box, verified against the DB's
own blob, not synthesized), while `merk B1sp`/`merk B1sp-R` (the actual frame/sash) are 336-360v/188-200t —
markedly richer, consistent with "sills are simple, frames are detailed." Supports the user's read: this
looks like real geometric variety, not a fallback artifact. Not exhaustively checked across all ~500
flagged elements — if it matters again, this is the query pattern to extend.

## NEXT (after the merge above lands) — the UX polish per your vision
Discovered via an Explore-agent survey 2026-07-02 (do not re-survey, this is settled):
- **Three uncoordinated walker surfaces** in bim-ootb's Outliner today: "STR Walker" tab, "Walk ·
  Disciplines" (`discwalk`, `modeller.html:2704-2716`, per-class DiscWalker rules), "Route trunk · from
  entry" (`disctrunk`, `modeller.html:2719-2729`, SeedTrunk) — all sharing one generic cyan `▶` glyph
  (`bonsai_outliner.js:245`), no visual grouping. RouteWalker (MEP route/sweep from `mep_rw.db`) isn't in
  the Outliner at all — only triggers on dropping a library assembly, with its OWN pop-in reveal animation
  (`revealWalk()`, `modeller.html:459-494`, ~1.5s, sound cues) that DiscWalker's walk does NOT have (DiscWalker
  is instant/silent).
- **No "walk all disciplines" loop exists anywhere** — `DiscWalker.disciplines()` only enumerates a roster
  for manual per-click walking; nothing iterates it.
- **Doctrine**: DiscWalker supersedes RouteWalker for the MEP family now (`modeller.html:2096`) — one stale
  contradicting comment at `modeller.html:2074-2080` still says otherwise, worth a one-line cleanup when
  touching this area.
- **Design direction settled with the user 2026-07-02** (their call, "take charge as the expert"): ONE new
  "Walk All Disciplines" action that loops `DiscWalker.disciplines()` automatically, reusing/extending
  RouteWalker's existing pop-in reveal pattern as the animation base:
  - X-ray/ghost material over the whole building while walking (translucent, e.g. opacity ~0.15-0.25,
    depthWrite off).
  - Each element flashes ORANGE as it resolves/"takes shape," then settles to its real discipline colour —
    a build-up reveal, not instant.
  - **Performance guard**: above 50,000 total elements, switch the animation to bounding-box proxies instead
    of full real meshes for the reveal sequence (cheap 12-tri, smooth at scale) — the FINAL static
    display after the walk completes still shows real geometry per the fix above; only the animation itself
    downgrades at scale. Terminal (35,552 ARC + other disciplines, ~48k total instances) is the one resident
    that will actually exercise this threshold — test on it once its real-geometry gap (above) is closed.
  - Fold the three existing separate manual triggers under one clearly-grouped "Walk" Outliner section
    instead of three lookalike unlabelled rows.

## IDEAS FROM GEOMAP worth carrying into this lane (2026-07-02, Sonnet+user — not required, but cheap and relevant)
1. **Use the audit channel as a proactive bug-catcher.** PR #601's `arc_editable.js` audit signal (Duplex
   flag-rate 0.033) is the extraction-correctness sweep this whole LOD400 thread wished it had before the box-
   fallback bug needed a dedicated screenshot hunt to find. Worth running/checking it against SC/Terminal/SH
   too — already built, cheap, and it's exactly the mechanism that catches the NEXT "witness green but visually
   wrong" bug before it needs another session like this one.
2. **The frame-contract discipline isn't just GeoMap's problem, it's the same one this lane has fought twice**
   (ARC-seed yaw-only vs full-3-axis; F5's SH/DX/SC-baked-rotation vs Terminal's-real-Euler finding). GeoMap has
   a measured, cited `{frame, units, rotation_semantics}` answer per building already — if a third rotation/frame
   surprise shows up, check there before re-deriving it.

## NEW ARCHITECTURE QUESTION (user, 2026-07-02) — window/opening composition as a BOM, surviving wall-stretch
**⚠ READ `prompts/RESUME_CASCADE_INTO_STRETCH.md` FIRST, BEFORE ANYTHING BELOW IN THIS SECTION.** Found 2026-07-02
(Sonnet+user dialogue): that file specs the SAME "openings can't divorce their host under stretch" problem,
already fully designed and witness-first, dated 2026-06-29, marked **"LOCKED NEXT SLICE — start here next
session"** — and never cross-referenced by this doc, never implemented (no `W-STRETCH-RIDE`, no `keepInExtent`,
no seam code found anywhere in bim-ootb, no `PROGRESS.md` mention — checked before writing this). **Do
`§STRETCH-RIDE` from that file FIRST** (single-relation ride/keep-in-extent via the real `fills_host` edge,
now doubly confirmed by geomapping's mined Tier-1 data — fully spec'd, seam identified, witness spec ready,
lowest risk). **Only THEN** come back to the proximity-clustering-BOM design question below — it's the
complementary NEXT layer (for the sibling sub-parts — sills/jambs — that have NO relation at all, not even to
each other, confirmed by direct DB query below), not a duplicate or a replacement of `§STRETCH-RIDE`.

**✅ 2026-07-02 DONE — `§STRETCH-RIDE` shipped, bim-ootb PR #604 (auto-merge armed onto main).** Full detail +
witness results in `RESUME_CASCADE_INTO_STRETCH.md`'s DONE block — don't re-derive. One NEW source-level fact
from that work (extends the DB finding below): the SOURCE IFC (`internal/sources/Ifc2x3_SampleCastle.ifc`)
ALSO has zero relations for the 182 `stelkozijn` parts (its 74 IfcRelFillsElement cover 40 other windows + 34
doors; IfcRelAggregates only parents IfcBuildingElementPart) — so even a fresh re-extraction with today's
extractor (which DOES recover rel_fills_host, `extractIFCtoDB.py:757`) cannot produce edges for them. Any
future sibling-clustering layer must create NEW relations (a modelling/authoring act), not recover existing
ones — that remains the genuinely open, unscoped design question below (sills/jambs with no relation at all).

**Not scoped or implemented — a design question for a fresh session to pick up, not a bug report.**

The user's framing: per the standing BOM doctrine (`CLAUDE.md` §BOM PRINCIPLE — one parent, N children, each
with a quantity, recursive, each level atomic/self-contained), a BOM set is meant to be reusable/recomposable
across any model. The immediate concern is whether the **room envelope** (walls + their openings) should get
the same treatment: an abstract BOM-composed window/opening (frame + sill + pane + trim as declared children
with relative offsets/rotations from a parent origin — the SAME pattern `bonsai_library.js`'s
`expandAssembly()` already implements for BUILDING/FLOOR/ROOM/SET assemblies, ~line 104-152) — so that when a
host wall is **grid-stretched**, the window's internal composition doesn't distort (each sub-part
independently scaled/warped by its raw world position inside the stretch zone), but instead **rides the
stretch as one rigid assembly**, exactly the way `project_arc_editable_substrate`'s hosted-by SDG cascade
already makes a whole window/door rigidly RIDE a dragged/moved wall (`sdg_cascade.js ridersFor` +
`commitMove`'s induced `GEOM_MOVE`).

**Why this surfaced now:** the `stelkozijn` (window frame) IfcWindow guid discussed above turned out, on
visual inspection, to likely be a multi-part assembly (pane + sill/trim at a different orientation) — exactly
the shape of thing that gets silently mangled if each sub-part is seeded and folded as an independent raw
element rather than as a BOM with declared relative geometry.

**My read (not decided, just a starting hypothesis for whoever picks this up):**
- The RIDE mechanism already exists for MOVE (translation) via `ridersFor`/hosted-by. Grid-STRETCH
  (`foldInsert`'s `gridCmds` TRANSLATE/SCALE branch, `bonsai_library.js` ~line 355-368) currently applies
  scale/translate to RAW WORLD POSITIONS per element independently — it has no concept of "this element is a
  rigid sub-assembly of that element," so a stretched wall's hosted window would currently have its own
  raw-bbox/real-mesh positions scaled directly, which for a SINGLE rigid window is probably fine (uniform
  scale of one box/mesh doesn't internally distort it) — the distortion risk is specifically for a
  MULTI-PART window (pane+sill+frame each separately seeded) where each part could get a slightly different
  effective transform if the stretch isn't applied as ONE rigid delta to the whole assembly.
- **✅ NON-INVENT PREREQUISITE CHECK DONE 2026-07-02 — the distortion risk is REAL, not moot.** Queried
  `deploy/buildings/SampleCastle_extracted.db` directly (bim-compiler's canonical source, same file the
  Modeller now plain-copies per `feedback_modeller_gh_vs_viewer_oci_data`). Findings:
  - `element_instances.guid` is the table's PRIMARY KEY (one row per guid) — `stelkozijn`'s own guid
    (`2pFYENFv91ygvyAeZOYi93`) maps to exactly ONE `geometry_hash` (`a99fec656be6339e`), so `stelkozijn` ITSELF
    is a single leaf with one baked mesh blob — confirms the earlier finding, unchanged.
  - **BUT the physical window is not just that one guid.** At `(x≈-0.119, y≈15.855)` there are TWO separate
    `stelkozijn` `elements_meta` rows at different `z` (0.772 and 1.6995 — top/bottom sill segments), plus more
    `stelkozijn` rows at `x≈-0.065/-0.059/-0.0495` (same y, different x/z — jamb segments), plus a `merk B1sp-R`
    (the actual sash/frame) at `(x≈-0.1114, y≈18.255, z≈1.7518)` — a DIFFERENT opening's cluster showing the
    same pattern. One physical window = MULTIPLE independent top-level ARC elements clustered at nearly the
    same (x,y), each its own row.
  - **No relation ties them together anywhere in this schema.** `elements_meta` columns:
    `guid, ifc_class, element_name, storey, discipline, material_name, material_rgba, building` — no parent/host
    column. `element_transforms`: `guid, center_x/y/z, rotation_x/y/z, bbox_x/y/z` — same, no relation column.
    **No `rel_aggregates`/`rel_fills_host`/any `rel_*`/`*edge*`/`*host*`/`*aggreg*` table exists in this DB at
    all** (checked `.tables` — only `component_geometries, element_instances, element_transforms, elements_meta,
    m_bom, m_bom_line, project_metadata, schedules, task_elements, task_sequences, tasks`). `m_bom`/`m_bom_line`
    are RECIPE/template tables (`target_ifc_class` etc, `host_element_ref`/`element_ref` columns) — 0 rows target
    `IfcWindow` (`SELECT ... FROM m_bom WHERE target_ifc_class='IfcWindow'` → empty), so no BOM recipe covers
    this either. **Conclusion: the multi-part window's siblings are held together by nothing but spatial
    proximity** — exactly the distortion-risk shape the design question worried about, now confirmed with data,
    not assumed. (Any door↔host "fills" bridge referenced elsewhere in this codebase, e.g. `arc_editable_smoke`'s
    `fillsBoth=7/7`, is a bim-ootb Modeller-side RUNTIME construct computed from geometry — not stored data in
    this `.db`, and not window-sibling-aware regardless.)
- **Fix direction (still not decided, now backed by data, not just hypothesis):** treat a window's clustered
  siblings (detected by tight spatial proximity within one opening, since there's no declared relation to key
  off) as a BOM (reusing `expandAssembly`'s existing relative-offset/rotation math) with ONE rigid transform
  applied by grid-stretch to the assembly's parent anchor, then re-expanded — not each leaf independently
  rescaled. Whoever picks this up next still needs to decide: (a) the proximity-clustering heuristic itself
  (what counts as "one window" — same opening host? distance threshold? shared `element_name` prefix like
  `stelkozijn`?), and (b) whether to retrofit existing seeded buildings or only apply going forward. Not
  scoped further this session — a design call, not a mechanical follow-up.

## Guide screenshot (the other ask this session — lower priority than the merge above)
**Check `PROGRESS.md`'s MODELLER USER GUIDE entry before acting here — it has been corrected since this file
was first written.** bim-ootb `prompts/RESUME_MODELLER_GUIDE_POLISH.md`'s "ALL GAPS CLOSED" claim does NOT
hold: a docs session re-opened the actual PNGs on disk (not just checked they exist) and found `cut-select.png`,
`gizmo.png`, `route-spine.png` still mis-framed after the "recapture all 21 frames" commit (`59746bf5b`) —
that commit only changed resolution/DPR, not camera framing. Root cause + resume steps:
`prompts/RESUME_MODELLER_GUIDE_SCREENSHOT_FIX.md §ORIGINAL CARD` (`e2e_harness.js`'s `shotClip`/`bboxScreen`
needs the actual fix). A NEW SampleCastle-ARC frame is a separate, genuinely new addition on top of that —
don't conflate the two. Do NOT point the guide-capture session at bim-ootb `main` until the merge plan above
lands — it can capture a preview shot directly from `/tmp/wt-sc-tilt-visual` right now (that worktree
already has the verified real render), but treat it as throwaway/preview, not the guide's canonical source,
until this is on `main`.

## Non-invent / process notes
- Every claim above marked "verified"/"confirmed" was independently re-checked by the orchestrating session
  (fresh Playwright triangle-count probes, re-running witnesses, screenshot review) — not taken on an
  agent's word alone. Keep doing this; this whole gap existed BECAUSE past verification stopped at "witness
  green" without a visual check. See `feedback_test_real_user_path_not_seams` memory.
- Don't re-run the 32-file witness audit — it's done, 0 flagged, detail in this session's transcript if ever
  needed, not worth re-deriving.

## §WALK-LOD400-ONLY — SPEC (2026-09-27, red1: "One first principle is no BBoxes or cubes, or LOD200 fallback. All must be LOD400 or fail hard")
```
SCOPE: bim-ootb modeller/modeller.html — _discWalkOne (gate before register/render/commit), _renderDiscWalk (no box path),
_renderDiscAssembly (no box path). Reference-only harvest unchanged (Duplex/Terminal, WalkerDoctrine §2). Read the log after every run.
```
**Measured violation (2026-09-27, §DW-PRIM-LOD):** SampleCastle walks render ELEC 270 + ACMV 12 + PLB 84 = **366 LOD200 boxes**
(legacy fallback walk after `§SCHED-FALLBACK`: placements carry no `device` and no `geometry_hash` — only a generic class, so no
reference mesh can be bound without inventing). Duplex ELEC/PLB rendered `lod200=102/18` in runs where the walk resolved before
`__dwGeoBuf` had loaded (race; `lod400=102` otherwise). FP borrowed from terminal_rules is already LOD400 on SampleCastle (126).
§5's "POC = primitive box" is superseded by §11 / the unbreakable no-fake-LOD rule.
**Rule:** a walked placement is kept ONLY if its `geometry_hash` resolves to a real mesh in the building's geo buffer. Otherwise it is
REFUSED — not registered, not rendered, not committed — and logged `§DW-LOD400-REFUSE disc=… refused=N kept=M (class×count …)`.
The gate first waits for the geo buffer (cap 60 s) so a resident's own meshes never refuse from a race. All refused → the walk
returns the existing honest REFUSE path (0 fabricated). `_renderDiscWalk` never calls the box/LOD300 path; assembly parts with no
real mesh are refused, not boxed. `§DW-PRIM-LOD` must read `lod300=0 lod200=0` on every walk.
**Witness W-WALK-LOD400-ONLY:** SampleCastle ELEC/ACMV/PLB → lod200=0, all 366 refused and logged, 0 box meshes under dwRoot;
SampleCastle FP → lod400=126 kept; Duplex ELEC walked immediately after open → lod400=102, lod200=0. RED on base (lod200=270).
**Next (separate item):** ARC seed `§GEO-SERVED-DEGRADED` (geo fetch fails → measured bounding boxes rendered, arc_editable path)
violates the same rule → must hard-fail/refuse instead.
**§WALK-LOD400-ONLY — ✅ DONE (witness) 2026-09-27** on bim-ootb `test/modeller-net-audit` (no PR): W-WALK-LOD400-ONLY 7/0 (base 4/3).
**§FOLD-NO-BOX — ✅ DONE (witness) 2026-09-27 PM, bim-ootb PR #1788 (auto-merge on) — see §FOLD-NO-BOX-DONE below. Original WIP note kept:** ⏸ WIP, PAUSED (red1) 2026-09-27. Finding: a reopened building folded every saved walk op as a box (Duplex 102/102) because
`foldInsert` fell back to `boxArrays(bbox)` when `realGeomHash` was unregistered. Fix (committed WIP): fold throws §LOD400-REFUSE (never boxes);
saved walk meshes registered from the building geo on open → 102/102 real after reload. Node witnesses now pass `registerGeometry` like production
(5 recovered; sdg_gate 11/0 with A1 restated; arc_editable A3/A4-extent retired → W-ANCHOR-SWEEP, A10 = unit guard).
**RESUME HERE — still red on the WIP:** arc_editable A9 (matched-catalog half), opening_slide 0/8 (slide rule requires a "plain axis-aligned box"
host — real-mesh hosts refuse; decide: slide on real hosts vs refuse), room_move T3, arc_3axis_rotation R1/R2 (real=0 — check its own registration),
e2e_instpick P4. Then: `_renderDiscAssembly` box parts, ARC seed §GEO-SERVED-DEGRADED bbox path, catalog inserts without a mesh (fold boxes;
527/794 products have no matching mesh — tie to §CATALOG-REBIND). Preview ghosts/gizmos are UI, not element geometry.

### ✅ §FOLD-NO-BOX-DONE — 2026-09-27 PM (bim-ootb `test/modeller-net-audit` → PR #1788, auto-merge on)
The 5 WIP reds, triaged on real geometry (read the §-log, not the exit code):
- **arc_editable A9** — stale: `foldInsert`'s own rule is *own registered mesh wins over a catalog match*; the 1 matched
  SampleHouse door folds its own 762-vertex mesh. Assertion now strict vertex-count. 8/1 → **9/0**.
- **opening_slide 0/8** — ⚖ decided REFUSE (the no-invent default, reversible): fills come only from extracted IFC hosts and
  every one carries a BAKED opening (host meshes 106/106/44 tris), so sliding would leave the hole behind. **Finding: the
  #1710 slide was never reachable by a real user** — its witness passed only on box-folded hosts. S0 proves the refusal,
  S1–S7 INCONCLUSIVE. → 2/0/7 INC. **⛔ OPEN for red1: build slide-on-real-walls?** (needs pre-boolean host body + the
  opening as a GEOM_CUT void — the §CUT-MOVE machinery then carries it.)
- **room_move T3** — on real meshes no filling centre lies inside any room footprint (nearest: window 13 at 6.2 mm, door 8
  at 26 mm — they sit in the boundary walls); "SampleHouse has one" was a box artefact. T3 real-data + T3b constructed
  counterfactual (excluded with fills, swept without). 9/1 → **11/0**.
- **arc_3axis R1/R2**, **e2e_instpick P4** — green on the merged branch, no change needed.
Then the two spec'd follow-ons:
- **`_renderDiscAssembly`** — parts render only from a resolved `geometry_hash`; the Ø×length box is gone. `assemble()` emits
  no mesh today ⇒ every part refused + `§DW-LOD400-REFUSE asm` logged. W-E2E-INSTPICK 8/0 (new P2c).
- **ARC seed `§GEO-SERVED-DEGRADED`** — no geometry substrate ⇒ every element refused (`no-geometry-substrate`), nothing
  seeded as a box, loud `§GEOM-HARDFAIL`. New W-SEED-NO-SUBSTRATE 3/0, RED on main (39 ops, 38 boxes).
Regression: node sweep 51 → branch 46 green / main 35; only branch-vs-main regression W-DW-OPLOG (SampleHouse FP's 17
hashless placements now refuse) retargeted to Duplex ELEC 102 real-mesh → 6/0. 13 browser witnesses green (list in PR).
**Still open (needs red1):** catalog inserts fold a box at LOD200 or when the product has no mesh (527/794) — refusing
them removes the LOD200 option + makes those products un-insertable; tied to row 14 / §CATALOG-REBIND. Pre-existing red,
not touched: W-E2E-INSTHIDE H1-rig (no fixture pose on main too ⇒ its assembly leg H5–H8 unexercised); node
dw_rot_units · git_history · terminal_walk · render_fidelity (red on main).

---

## §ROW34-ANCHOR-SAVE — SPEC 2026-09-27 (MODELLER_MASTER row 34, re-verified against bim-ootb origin/main `363ba414` first)
**Re-verify result (code read, not grep):**
- **IFC export half — ALREADY CLOSED** by bim-ootb #1747 (`58bce229`, 2026-09-18): `bonsai_ifc.js:181`
  `if (P.anchorOnly) { seedAnchors++; continue; }`, `§IFC-SEED … anchorsExcluded=N`, witness
  `witness_ifc_export_seed.js` E4 ANCHORS-OUT asserts SampleCastle 65 excluded. Not re-opened.
- **Save half — STILL UNWITNESSED.** `runSave()` (`modeller.html:2867`) → `Bonsai.exportDb()` (`:3113`)
  writes the signed op-log bytes VERBATIM (`O.db.export()`), so the 65 `GEOM_INSERT params.anchorOnly`
  ops are IN every Save/Native-.db snapshot. That is correct by construction — they are part of the
  signed hash chain (dropping them breaks `verifyChain`) and the cascade needs them after re-open. So the
  leak question is NOT "are they in the bytes" but **"does a re-opened snapshot still treat them as
  anchors"** (invisible, out of every count/gate/export). The one save/re-open witness
  (`witness_e2e_export_db.js` E4) runs on **Duplex = 0 anchors ⇒ VACUOUS for this question.**
- Mechanism that SHOULD make it hold (read, unproven): `importBytes` (`bonsai_oplog.js:234`) re-folds
  the ops; the fold keys on `params.anchorOnly` → `bonsai_kernel.js:257` invisible `userData.anchor`
  mesh; `_gateBoxes` (`modeller.html:2710`) and IFC export both key on that flag, not on the seed-time
  `window.__arcAnchorFids`.

**BUILD (bim-ootb):**
1. `§EXPORT-NATIVE` log line gains `anchors=N` (count of `GEOM_INSERT` ops whose parameters carry
   `anchorOnly`, read from the SAME `O.db` bytes being exported) — the save path becomes §ANCHOR-tagged,
   as the row-34 spec requires. Log-only, no behaviour change.
2. Witness **W-E2E-ANCHOR-SAVE-ROUNDTRIP** (`modeller/tests/witness_e2e_anchor_save_roundtrip.js`),
   SampleCastle, real `#b-open ▸ Open local .db…` door:
   - **R0 NON-VACUOUS** — baseline anchor meshes == anchorOnly ops == 65, else INCONCLUSIVE (not PASS).
   - **R1 TAGGED** — exported bytes carry exactly 65 anchorOnly ops AND `§EXPORT-NATIVE … anchors=65`.
   - **R2 RE-OPEN STAYS ANCHORED** — after `oplog.clear()` + re-open from the file: 65 `userData.anchor`
     meshes, all `visible=false`; visible-mesh count, `_gateBoxes` key count IDENTICAL to baseline.
   - **R3 EXPORT AFTER RE-OPEN** — IFC build on the re-opened model: `seeded` == baseline,
     `anchorsExcluded` == 65.
   - **R4 FALSIFY** — the same bytes with ONE op's `anchorOnly` stripped, re-opened: anchors 64, visible
     meshes baseline+1 (the flag in the bytes is what drives it; the witness sees a real leak), and
     `verify=false` (the chain detects the tamper).
**Done =** R0–R4 PASS, log read, PR merged. If R2/R3 FAIL, the leak is real → fix, RED-first.

### ✅ §ROW34-ANCHOR-SAVE — DONE (witness) 2026-09-27, bim-ootb PR #1787 (`feat/anchor-save-roundtrip`, auto-merge on)
**No leak. It was never a leak, only unproven.** W-E2E-ANCHOR-SAVE-ROUNDTRIP **6/6**, SampleCastle:
- R0 baseline: 65 anchor meshes == 65 anchorOnly ops, 0 visible · 3225 visible meshes · 3225 gate boxes · IFC 3225 seeded + 65 excluded.
- R1 snapshot 2,375,680 bytes carries 65 anchorOnly ops; `§EXPORT-NATIVE ops=3290 anchors=65 sealed=3290` (new tag;
  RED on prior code by construction — the line had no `anchors=`).
- R2/R3 after `clear()` + real Open-local-.db door: `verify=true`, every number above IDENTICAL.
- R4 falsify (one anchorOnly stripped in the bytes): anchors 64 · visible 3226 · gate 3226 · IFC 3226/64 · `verify=false`.
Regression W-E2E-EXPORT-DB 6/6. sw v60→v61. Logs: session scratchpad `ancsave_run1.log`, `expdb.log`.
**This file's LOD400 lane has no open build items left.** Still open elsewhere, not here: SampleCastle layer
shipping (blocked on `sporenkap`'s honest refusal); per-layer slab colours (optional).
⚠ CORRECTION (user, same day): `rel_fills_host` for the other residents is NOT open and was never blocked on
sources — bim-ootb #1749 shipped HHS/Clinic/Hospital/Garage on 2026-09-18; Terminal's source authors no
void/fill chain. The 'sources not in this checkout' line in §START HERE OPEN 2 was stale; always check
`reference_source_ifc_locations` memory before repeating a 'source missing' claim.

---

## §SLIDE-REAL-WALLS — SPEC 2026-09-27 (red1 direction: "It should allow … the embedded ARCs are cohesive designs with own openings and trappings and they are editable likewise")
```
SCOPE: slide a door/window along its REAL host wall in the Modeller, for the embedded ARC residents' own authored
openings (rel_fills_host). No invention: the wall and the opening are both authored in the source IFC. Read the log after
every run. User-imported IFCs take the same path only if their open path writes rel_fills_host (unverified — not in scope).
```
**Why it fails today (measured, §FOLD-NO-BOX-DONE):** the shipped host mesh has the opening BAKED IN (the tessellator
subtracted `IfcRelVoidsElement` at extraction), so sliding the door would leave the hole behind → refused.
**IFC fact this rests on:** a wall's `Body` is authored UNCUT; openings are separate `IfcOpeningElement`s applied by the
consumer. So the extractor can obtain (a) the host body with opening subtraction DISABLED and (b) each opening's own solid —
both pure extraction. The Modeller already has the rest: `GEOM_CUT` (kernel box-void subtraction) and §CUT-MOVE (a cut rides
its filling).
**Phase M (measure — decides cost, no build):** per building (SampleHouse, Duplex, SampleCastle), per `IfcRelFillsElement`:
  M1 opening solid kind — a plain axis-aligned rectangular extrusion (kernel-cuttable box) vs anything else (arched, polygon,
     clipped → REFUSE, never approximated);
  M2 host body kind with openings disabled — plain extrusion vs boolean/clipped/brep;
  M3 the source's own cut: host tris with openings vs without (proves the bake is exactly the opening subtraction);
  M4 box opening vs host frame: opening axis-aligned in the host's local frame (yaw-only), fully through the wall thickness.
  Log `§SLIDE-MEASURE bldg=… fills=N boxOpenings=a hostPlain=b through=c` + per-row reasons for every non-box.
**Phase B (build, only for rows that pass M1–M4):** extractor persists host uncut body (own geometry hash) + opening box
params; residents get them via the patch + self-heal loader (never a binary); the seed folds the host as uncut body +
one `GEOM_CUT` per opening; slide then runs through the existing engine + §CUT-MOVE. Rows failing M keep today's honest
refusal, named. **Witness W-SLIDE-REAL-WALL:** the re-cut host (kernel) matches the source's baked mesh (AABB + volume within
tolerance) BEFORE any move; after a slide the hole is at the new position and the old position is solid; undo restores;
RED on today's main (refusal).
