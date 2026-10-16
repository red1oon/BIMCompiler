# DAGeVu Modeller — BOM-hierarchy INSERT catalog (httpvfs range-load)

```
# ⚠ DO NOT REMOVE
SCOPE: Replace the 3-component hardcoded fixture in viewer/bonsai_library.js with the FULL
component_library.db (23,888 parts) via httpvfs RANGE-LOAD, organised as a browsable/searchable BOM
HIERARCHY (discipline → component_type → part). Keep the EXISTING library seam (catalog/get/meshArrays/
foldInsert/previewArrays) so INSERT + LOD-200/300 + Connect-Scene selection-by-ifc_class all keep working.
User decree 2026-06-18 ("organize INSERT component by BOM hierarchy"). Foundation, not whistles.
NON-INVENT: every category/part/mesh READ from BOM.db / component_library.db — nothing fabricated.
LOG MANDATE: read the witness log before conclusions. Spec-first; witness-first per leg.
STATUS 2026-06-19: catalog + filter + cheat-sheet + lazy REAL mesh = DONE/LIVE (PRs #386, #387). The plan
  below was reshaped by user steering (BOM.db organiser, not raw 23,888; curated practical set; lazy mesh).
  NEXT SESSION = §RECURSIVE GRANULARITY (drop at any BOM level). See §RESUME at the bottom.
```

## ▶▶ RESUME (start a NEW session here)

### 🔴 TOP PRIORITY — SERIOUSLY SOLVE: full LOD300 mesh + ORIGINAL-BOM SPATIAL ARRANGEMENT on drop (user 2026-06-19)
User dropped BATHROOM_PREFAB_MY and it is STILL not proper: **(1) leaves render as non-LOD bbox boxes — not
fully meshed to LOD300; (2) the children are NOT spatially arranged as the original BOM intends** (they spread
on a bare grid, not placed wall-anchored/room-relative like the real cascade). The role-resolution fix (below,
✅) made the set CONTENTS sensible; this leg makes the set GEOMETRY + LAYOUT faithful. This is the BOM-as-
**Rosetta-Stone** thesis — a dropped assembly must reconstruct exactly what the Java cascade compiled.
**MANDATE: do NOT invent. Read the Java cascade AND the Rosetta-Stone specs first, then port — witness-first.**

**READ FIRST (Rosetta-Stone + cascade specs, in `docs/`):** `TheRosettaStoneStrategy.md`, `BOM_AS_CONTEXT.md`,
`BOMBasedCompilation.md` (§3.5 Selection Cascade), `BOM_ENGINE_SPEC.md`, `SPATIAL_COMPILATION_PAPER.md`,
`GENERATIVE_HOUSE_SRS.md`, `SPATIAL_PICKING_SPEC.md`. Plus the BOM-validation SRS (`prompts/BOM_VALIDATION_SRS*`).

**THE AUTHORITATIVE JAVA SPATIAL CASCADE (cite file:line, replicate — this is the "it worked perfectly" code):**
`DAGCompiler/src/main/java/com/bim/compiler/library/BOMTierResolver.java` → `resolveForRoom(roomMinX,minY,maxX,
maxY, storeyZ, roomName, roomType, openings, bomId, ceilingZ)` dispatches each child by `locator_ref` into THREE
placement paths:
  1. **Fixture children** (placement_wall/position) → `resolveFixtureChildren` (L245) — wall-anchored, room-relative.
  2. **Wall-locator children** (`locator_ref`=NORTH_WALL/…) → `resolveWithGPD` (L451) — GPD walk via
     `com.bim.compiler.dsl.PhantomLayout.forLocator(...).placeNext(...)` (the spacer/extent walk along a wall).
  3. **FLOAT children** (`locator_ref`=FLOAT) → `resolveFloatChildren` (L575) — the dx/dy `expandBOMNode` path,
     incl. a CENTER-grid that splits the room into N zones for repeated sets.
Geometry per leaf = `FurnitureWorker.execute` → `ComponentLibrary.getByName(namePattern)` → `def.geometryHash()`
(already ported for CONTENTS). `m_bom_line` rotation_rule symbolic (FACE_INTO_ROOM/FACE_AWAY_FROM_WALL/EW/NS)
is **host-relative** → resolved against the room/wall, NOT 0° (we currently drop it to 0° = the wrong orientation).

**KEY OBSTACLE (state it honestly):** all three faithful paths need a **ROOM ENVELOPE** (minX/minY/maxX/maxY +
walls + openings). A bare grid-drop has none, so today only the room-independent LINEAR fallback runs → wrong
layout. The session must decide + spec: (A) synthesize a room envelope from the assembly's aabb (origin + w/d/h)
and run resolveFixtureChildren/resolveWithGPD/resolveFloatChildren relative to it; or (B) drop into a real room
context (the modeller has a grid — derive a cell/room rect). NON-INVENT: the inputs (`dx/dy/dz`, `allocated_*_mm`,
`anchor_face`, `rotation_rule`, `locator_ref`, `layout_strategy`) are all in the data.

**DATA AVAILABILITY — DECIDED WITH EVIDENCE (verified by direct query 2026-06-19):**
The brief hypothesised that faithful wall-anchoring could be SOURCED from "richer per-prefix `XX_BOM.db`".
**DISPROVEN.** Direct queries across `archive/BOM.db`, `DX_BOM.db`, `SH_BOM.db`:
- ALL are **100% `locator_ref=FLOAT` / `layout_strategy=LINEAR` / `anchor_face=BACK`** (the column DEFAULTS) —
  the `anchor_face`(205)/`allocated_width_mm`(169) counts in the old note were just rows present, all = default
  `BACK` / a slot width; NOT wall locators.
- `archive/BOM.db` has **5 `m_attribute` rows total, ZERO `placement_wall`/`position`** → `resolveFixtureChildren`
  has NOTHING to drive it; `resolveWithGPD` has no wall `locator_ref` → also inert. DX/SH have **0** m_attribute.
- **No BOM db has `ad_room_boundary`.** So no room envelope is stored either.
- What IS in the data: relative `dx/dy/dz` (1259 rows ≠0), `allocated_width_mm` (1268 >0), `rotation_rule`
  (92 ≠0, of which **88 symbolic** FACE_INTO_ROOM/FACE_AWAY_FROM_WALL/PARALLEL_TO_WALL — currently dropped to 0°).

**THE GROUND TRUTH (state plainly):** The BOM db is the RECIPE (relative offsets + symbolic rules). The
wall-anchored "it worked perfectly" ABSOLUTE positions were computed at RUNTIME by `resolveForRoom(...)` against
a real room envelope from the BUILDING being compiled — they live in each building's `extracted.db` (the cooked
output), NOT in any BOM recipe. A modeller drop has no building/room, so those positions are not copy-able and
the fixture/GPD paths can't run. **Faithful, non-invent levers that REMAIN (this is the leg):**
  - **(L-ROT) resolve symbolic `rotation_rule`** the Java way (`LocalCoord.resolveRotation`) against a SYNTHESIZED
    envelope's walls — the single biggest faithful win (furniture faces correctly instead of all pointing +X).
  - **(L-WALL) envelope-relative anchoring** via the SAME `computeZoneAnchor` logic (anchor a set against a work
    wall + walk along it) instead of a bare +X line — so e.g. a bathroom's fixtures line a wall.
**ENVELOPE DECISION = (A) synthesize a deterministic square envelope from the assembly's OWN aabb (w×d, the 4
cardinal walls = its bbox edges).** Non-invent (aabb is real data), self-contained (every drop carries it),
minimal frame that unlocks L-ROT + L-WALL. NOT the modeller grid cell (arbitrary size → distorts recipe dims).
**HONEST CEILING:** this is faithful to the RECIPE + the cascade's placement LOGIC, but it is a SYNTHESIZED room,
not the building's real room (no door-wall avoidance / exterior-wall logic / real dims). Say so in the witness.

**LOD300 leg:** on assembly drop, EVERY leaf that HAS a `gh` must upgrade to its real LOD-300 mesh, not stay a
12-tri box. Path: `viewer/bonsai_library.js` `expandAssembly`/`ensureMesh`/`lodFor` + the modeller `placeAssembly`
(modeller.html). Single inserts auto-upgrade (placeComponent); verify the ASSEMBLY path calls ensureMesh + setLod
300 for each leaf (the log shows `geometries lazy-loaded meshes=117` but some leaves stay boxes). Leaves with NO
library mesh (e.g. Floor Trap — class has 0 parts) are HONEST boxes — say so; don't fake. Witness: drop a set →
count leaves with real mesh == leaves with a gh; 0 unintended 12-tri boxes; tris >> 12·N.

**WITNESS-FIRST (claim before code):** W-BOM-SPATIAL (a dropped set's leaf world-positions match the cascade's
room-relative placement within tol; rotation_rule honored) + W-BOM-LOD300 (every gh-bearing leaf renders its real
mesh). Spec each in this card before implementing. Update `scripts/extract_dagevu_catalog.py` (emit the layout
inputs) + `bonsai_library.expandAssembly` (compose the room-relative transform) — BOM.db stays READ-ONLY.

### ✅✅ TOP-PRIORITY LEG DONE + SHIPPED (2026-06-19) — bim-ootb PR #411 (auto-merge armed, fast-checks ✅, e2e running)
The 🔴 spatial + LOD300 leg is COMPLETE and confirmed by TESTING (user mandate: "your code tells you, not my eyes").
- **Extractor** (bim-compiler `4206f1f6`+`fed3d385`, pushed): Java-faithful wall-anchored layout + rotation (detail ↓).
- **Witness W-BOM-SPATIAL** (`scripts/witness_bom_spatial.py`, pushed) = INDEPENDENT Java-transcription (cited
  file:line) — §W-BOM-SPATIAL **PASS 1359/1359 children match to the cent** (pos+rot); §W-LOD300 165/165 meshes
  present + 6 honest boxes justified (0 library parts of class). Caught + forced fixes for 2 real extractor bugs
  (leaf-closure dims not in by_id at layout → two-pass; zero-aabb sub-assembly extent → 0.5 fallback).
- **bim-ootb PR #411** (`feat/bom-spatial-layout`): regen catalog (?v=5) + geometries (?v=4); `bonsai_library.js`
  threads `boxOnly`; `bom_assembly_live` LINEAR→WALL_LINEAR axis-agnostic; `bom_mesh_live` honors boxOnly; GPU fix
  (drop per-button backdrop-filter blur on ~29 rail buttons → solid opaque pill, per viewer #407). LIVE witnesses
  ALL PASS: bom_catalog ✅ bom_assembly ✅ (linearSpread/recursion/signed-chain/deterministic) bom_mesh ✅
  (allDetailed; Wardrobe honest box) bom_orientation ✅. Synced past origin/main (erp-only, clean). NEXT: confirm
  auto-merge landed + hard-refresh live modeller. The client `placeAssembly` LOD300 path was already correct — the
  boxes were STALE pre-role-resolution data; shipping the regen fixes them.

**✅ EXTRACTOR LEG DONE (bim-compiler, 2026-06-19) — W-BOM-SPATIAL + W-BOM-LOD300 PASS (§-log + assertion witness).**
Ported into `scripts/extract_dagevu_catalog.py` (BOM.db read-only): module-level `card_to_rad` /
`resolve_symbolic_rot` (faithful ports of `LocalCoord.cardinalToRadians` / `resolveRotation`) + an envelope-relative
layout pass. (1) L-WALL: a zero-offset set synthesizes a square envelope from its aabb (children-derived when aabb
is degenerate), backs the run to its LONGEST wall (`autoLayout=WALL_LINEAR`, `wall=south|west`), and GPD-walks
children along it backed flush to the wall — bathroom fixtures now LINE a wall, not a bare +X row. Authored-offset
sets keep their dx/dy (SH_DINING_SET stays chairs-around-table). (2) L-ROT: ALL 85 symbolic `rotation_rule`s now
resolve — absolute EW→0°/NS→90° (wall run-direction, confirmed via `WitnessBuilder.wallMountedFixture` javadoc);
host-relative FACE_INTO_ROOM/FACE_AWAY_FROM_WALL→face-off-wall, FACE_OUTSIDE→+π, PARALLEL_TO_WALL→+90° resolved
against the established back wall; FACE_* in a float set (no established wall) honestly stays 0°+label (NOT a guessed
nearest-wall = invention). §DAGEVU-SPATIAL wallAnchoredSets=19 floatOffsetSets=30 rotSymbolicResolved=72
unresolvable=13(honest). §W-LOD300 leafProducts=171 withGh=165 meshPresent=165 missingMesh=0 honestBoxes=6
(FAN/FLOOR_TRAP/HARDWARE/OUTLET/PARENT/SWITCH — classes the library genuinely has no part for). Witness harness:
inline assertion script (toilet-block monotonic wall-backed spread; NS/EW absolute; dining float-preserved; every
gh→mesh present). **REMAINING = the bim-ootb CLIENT legs:** (a) ship the regenerated `dagevu_catalog.json` +
`dagevu_geometries.json` to `viewer/`; (b) LOD300 wiring — `expandAssembly`/`placeAssembly` must call
`ensureMesh`+setLod300 PER LEAF on assembly drop (meshes ARE emitted; the box-on-drop is the client not upgrading
each leaf) + W-BOM-LOD300-LIVE; (c) confirm `expandAssembly` already consumes dx/dy/rotDeg unchanged (it composes
the transform; `wall`/`autoLayout` are advisory metadata, no client change expected).

---
**NEXT SESSION — pick up here (2026-06-19), two tracks:**
1. **This card's open legs** (read §INVESTIGATE + §ALSO QUEUED below, both under §LAYOUT FIX): (a) 🔬 role-aware
   child-resolution — ✅ DONE 2026-06-19 (ported the Java `ComponentLibrary.getByName` exact-name-first / largest-XY
   resolver + `normalizeRole` ROLE_NAME map into `extract_dagevu_catalog.py`; PHANTOM/BUFFER skipped; TABLE→Dining
   Table, SINK→Sink, TOILET/PIANO/SOFA real meshes; 0 leftover placeholders; W-BOM-CATALOG/ASSEMBLY PASS). Set
   CONTENTS are now correct — the remaining work is the 🔴 TOP-PRIORITY leg above (LOD300 + spatial); (b) per-mesh
   orientation normalize-at-extraction (the floating/tilted furniture — e.g. dining-chair mesh z=1.227 lies on its
   side; subsumed into the spatial leg's rotation_rule work); (c) scale lazy loader to the 220MB
   component_library.db via httpvfs (§BUILD LEGS L1–L3 below, §OPEN hosting decision).
2. **Main modeller roadmap** — `prompts/BONSAI_KERNEL_RESEARCH.md §RESUME` (the DAGeVu authoring kernel spine) +
   `prompts/project_connect_scene` / `project_modeller_bom_catalog` topic cards. The recursive BOM-assembly
   INSERT (this card) is ✅ DONE/LIVE (#393/#394); the BOM-PRINCIPLE-as-INSERT goal is met.
SHIPPED THIS SESSION (2026-06-19, all live on GH Pages): grid-reads-as-floor (#392), recursive BOM-assembly
INSERT (#393), LINEAR child-layout + picker-detach (#394). Witnesses: W-BOM-ASSEMBLY (incl. linearSpread +
ghostDetaches), W-BOM-ORIENT(grid). Extractor in BIMCompiler feat/erp-substrate-phase012.

DONE/LIVE (bim-ootb main; witnesses in viewer/tests/):
- ✅ **Catalog + UI** (#386, W-BOM-CATALOG): INSERT panel = search + ⭐cheat-sheet rail + group chips
  (Structure/Wall-Openings/Furniture) + collapsible category tree. 80 products EXTRACTED from
  `library/archive/BOM.db` (M_Product_Category + M_Product) via `scripts/extract_dagevu_catalog.py` →
  `viewer/dagevu_catalog.json` (16KB). Browse/insert need NO 220MB/httpvfs (box proxies from w/d/h dims).
- ✅ **Lazy real mesh** (#387, W-BOM-MESH): each product matched to nearest real `component_definitions`
  part (ifc_class + bbox vol) → `gh`; `viewer/dagevu_geometries.json` (56 meshes, 626KB) fetched ONLY on
  first insert; placed row refines box→real in place (desk 12→152 tris). `bonsai_library.js` ensureMesh/
  meshArrays(own-bbox seating); `placeComponent` auto-upgrades LOD-300.
- Regen anytime: `python3 scripts/extract_dagevu_catalog.py <viewer>/dagevu_catalog.json <viewer>/dagevu_geometries.json`.

### ✅ SCENE/CAMERA GRID ORIENTATION — RESOLVED #392 (2026-06-19) — do NOT redo
The "background grid not a floor" was a BACKWARDS witness invariant (`gridAxisDeg<28` rewarded an axis-aligned
camera = exactly what grazes the floor edge-on). Fixed deterministically: one Z-up convention
(`THREE.DEFAULT_UP=Z`, level orbit) + classic-iso camera (~43° floor incidence, ~45° azimuth → readable diamond
floor). Witness W-BOM-ORIENT corrected to assert `floorIncidence∈[38,60]°` + `bothFamiliesOblique`. LIVE.
(NOTE: this was the SCENE grid/camera — distinct from PER-MESH furniture orientation, still open below.)
<details><summary>history of the prior failed rounds (#389/#390/#391) — kept for reference</summary>
The headless harness (puppeteer+swiftshader, MATH projection asserts) didn't reproduce the real render; the fix
was identifying the wrong-invariant, calibrated once against a real screenshot then verified by math.</details>

What was already tried (so you don't redo it) — each PASSED its witness yet the user still reported a problem:
- #389 `camera.up=Z` (was Y) — geometry verified correct Z-up (door tall in Z 0→2.1, bed flat) by decoding the
  actual vertex blobs; this was NOT a geometry bug.
- #390 front-elevated framing (camera (8,-7,6)→target (4,2,0.4), Iso dir (0.45,-1,0.7)) — to stop the XY
  feature-grid rendering as a 45° diamond; witness measured world-X axis 45°→13° off horizontal.
- #391 `GridHelper.rotation.x=π/2` (THREE GridHelper defaults to XZ/Y-up → stood as a wall) + Outliner product
  names. Witness: GridHelper Z-extent=0.
VERIFIED FACTS (don't re-derive): library geometry IS Z-up per metadata+blobs; feature grid (bonsai_grid.js)
draws on XY (z=0); GROUND=Plane(0,0,1); occt sketch/extrude is Z-up. So the WORLD is Z-up and THREE's default
is Y-up — the modeller MIXES conventions (camera.up flips per view; GridHelper needed manual rotation).
OPEN HYPOTHESES for fresh eyes: (a) headless≠real-GPU render — verify FIRST; (b) browser HTTP cache served a
stale mix across the rounds (modeller.html un-versioned, GH Pages max-age=600) — hard-refresh / check live
content hash before believing a regression; (c) OrbitControls behaviour once the USER orbits with up=Z (the
witness only checks preset views, never a live orbit) — orbiting may re-introduce roll/tilt; (d) the per-mesh
furniture meshes are genuinely non-Z-up in their OWN data (see below) — independent of camera/grid; (e) consider
a HOLISTIC fix: make the whole modeller consistently Z-up (set THREE.Object3D.DEFAULT_UP=Z, or rotate the whole
scene), rather than per-surface camera.up band-aids that fight each other. RECOMMEND: reproduce visually → pick
ONE convention → re-witness with a real-GPU screenshot in the loop, not just projection math.

### ⏳ NOTED FOR LATER (user 2026-06-19 — do NOT build yet, just recorded)
- **ORIENTATION ✅ FIXED (#389, W-BOM-ORIENT):** placed library meshes stand upright — geometry was always
  correct Z-up; bug was camera.up=Y. Fix = view-dependent up (Iso/3D Z-up, Top/sketch/route Y-up). The
  component metadata DOES carry orientation (`component_definitions.up_axis=Z, forward_axis=Y, attachment_face
  ∈ TOP/BOTTOM/CENTER/ENDS/SIDE, orientation ∈ PENDANT/UPRIGHT/VERTICAL/HORIZONTAL/WALL_MOUNT/CEILING`) — not
  needed for the upright fix, but it IS the hook for the snapping leg below.
- **✅ SCENE GRID + OUTLINER NAMES FIXED (#391, 2026-06-19):** the "scene outline grid on its side" was the
  THREE.GridHelper (modeller.html ~131) — it defaults to XZ (Y-up) so it stood as a wall in our Z-up world;
  `grid.rotation.x=π/2` lays it flat (the FEATURE grid bonsai_grid.js was always correct — that was a
  miscommunication). Outliner component rows now show the PRODUCT NAME (c.name, e.g. "Bed King") not bare
  ifc_class. W-SCENE-GRID-OUTLINER.
- **DIMS-MATCH PICKS ANOTHER ITEM (user: "its OK"):** match_hash uses ifc_class + nearest bbox-volume, so a
  product can map to a different same-class part's geometry (chair→table). Acceptable for now; a better key
  (name similarity / explicit component_id when present) is a nice-to-have, not urgent.
- **⚠ PER-MESH ORIENTATION (user 2026-06-19: "chair still on side", solve next session — STILL OPEN after
  #389/#390/#391; those fixed the camera/scene-grid, NOT the individual mis-framed meshes):** #389 fixed the
  SCENE (camera Z-up) so globally-consistent Z-up meshes stand (doors/walls/beds). BUT some library FURNITURE
  geometries are NOT actually Z-up despite `up_axis=Z` (the metadata LIES — vertices don't honor it). Measured
  from dagevu_geometries.json: Dining_Chair ext x=1.00/y=0.62/**z=0.14** (lying on its side — real height is in
  X), FURN_BED_SINGLE / FURN_DESK **z=2.00** (length in Z → standing on end), Coffee_Table z=0.14. So these
  render on-side/upended regardless of camera. **FIX = normalize each mesh to Z-up at EXTRACTION**: the M_Product
  (w,d,h) is authoritative (h=height); find the axis permutation/rotation that maps the mesh's bbox extents
  →(w,d,h) with h on +Z, BAKE it into the vertices in scripts/extract_dagevu_catalog.py (then re-emit
  dagevu_geometries.json, bump ?v). Deterministic, NON-INVENT (uses the product's own dims). Do NOT trust
  up_axis/forward_axis for this — verify against the actual vertex extents. Add a witness: every product's mesh
  tallest-or-intended axis aligns with its h within tolerance.
- **SURFACE-SNAPPING (later sophistication, user):** snap an insert to an arbitrary host surface — ground /
  slab / wall — instead of always the z=0 grid. Use the LBD "tack" logic + the BOM intelligence we built
  (`prompts/BOM_VALIDATION_SRS*`, `attachment_face`/`anchor_face`/`host_element_ref`/`requires_host`). Pick a
  face → seat + orient the component against it (a WALL_MOUNT light tacks to a wall face, a slab finish to a
  slab top). NON-INVENT: the host/attachment rules are already in the data.
- **BOM-LAYER SELECTION = a killer (user 2026-06-19):** selecting a whole HOUSE / FLOOR / ROOM / SET drops the
  ENTIRE BOM subtree at once with all spatial relationships intact. DATA CONFIRMED PRESENT in BOM.db:
  `m_bom_line` has dx/dy/dz (1416/1416 populated) + `rotation_rule` (FACE_INTO_ROOM / FACE_AWAY_FROM_WALL /
  radians) + sequence + role; real assemblies exist (BATHROOM_PREFAB_MY, BEDROOM_PREFAB_MY_3100, KITCHEN_
  PREFAB_MY → wall+door+bed-set+light each at an offset). The per-prefix `library/XX_BOM.db` (SH/DX/TE/…) are
  RICHER still: `anchor_face, layout_strategy, allocated_{width,depth,height}_mm, host_element_ref, locator_ref,
  fit_priority, min_space_mm, shape_archetype, verb_ref` — full layout intelligence. So the recursive drop
  folds the subtree: for each m_bom_line, place child at parent-relative (dx,dy,dz) with rotation_rule → a
  signed GEOM_INSERT; recurse if the child is itself a BOM. This = the BOM PRINCIPLE as INSERT.

**NEXT LEG — RECURSIVE GRANULARITY ("drop at any BOM level: house→floor→room→set→leaf", user 2026-06-18).**
The data is in BOM.db: `m_bom` (64 assemblies: BUILDING/FLOOR/ROOM/SET levels, bom_type/bom_category) +
`m_bom_line` (1416 child rows: child_product_id, role, qty_type, sequence, dx/dy/dz, z_rule, rotation_rule).
Plan: (a) extend the extractor to emit a `level` (building/floor/room/set/leaf) + assemblies w/ their child
expansion; (b) add a "Level" axis to the panel (or an Assemblies group); (c) dropping a non-leaf EXPANDS
its m_bom_line children into N placed signed GEOM_INSERTs (relative placement via dx/dy/dz/z_rule), recursive.
This realises the BOM PRINCIPLE as INSERT and is what "truly deprecates the Red-Pill 2D editor" (user).
Witness-first: W-BOM-ASSEMBLY (drop a SET → N children placed + signed + chain verifies).
THEN scale: point the lazy mesh loader at the full 220MB `component_library.db` via `lib/httpvfs.js`
(createDbWorker, serverMode:"full") for all 23,888 parts — §OPEN hosting decision below still applies.

### §SPEC RESOLVED 2026-06-19 — RECURSIVE BOM-ASSEMBLY INSERT (W-BOM-ASSEMBLY) — ✅ DONE/LIVE
**SHIPPED (bim-ootb PR #393, live on GH Pages; extractor BIMCompiler 3ab35bcc).** W-BOM-ASSEMBLY PASS:
dropping `BUILDING_DX_STD` folds RECURSIVELY into **1099 signed GEOM_INSERT rows** — chain verifies, every
row signed, 1099 distinct placements + meshes; recursion/relative-placement/rotation-compose/determinism all
verified by DATA MATH (no GPU). Live catalog = 58 assemblies (3 BUILDING/15 FLOOR/5 ROOM/35 SET) + 163
products. UI = insert-panel "Sets" chip + Level-grouped list; visual sanity = a kitchen-cabinet SET drops as a
coherent run. Regression green (bom_catalog chips→5, bom_mesh curated-scope). NEXT open legs below ↓ (per-mesh
furniture orientation normalize-at-extraction; 220MB component_library.db scale via httpvfs).
THE SPEC (as built):
CLAIM (witness-first): dropping a non-leaf BOM (BUILDING/FLOOR/ROOM/SET) at a grid point expands its
`m_bom_line` subtree into N signed GEOM_INSERT op-rows — one per LEAF product — each seated at its
parent-relative (dx,dy,dz)+rotation, recursing through nested BOMs; the op-chain verifies (signed,
replay-deterministic) and renders. = the BOM PRINCIPLE as INSERT.
DATA (BOM.db, non-invent, verified): 59 assemblies w/ children (3 BUILDING / 15 FLOOR / 5 ROOM / 36 SET);
`m_bom_line` 1416 rows; `child_product_id` always → M_Product, and 69 of those ALSO match a `bom_id` = the
nested sub-assemblies (recursion key: `isBom = ref ∈ bom_ids`). dx/dy/dz in METERS. `rotation_rule`: numeric =
RADIANS (`0`, `1.5708`=π/2, `3.14159…`=π) → applied; symbolic (`EW`/`NS`/`FACE_OUTSIDE`/`FACE_INTO_ROOM`/
`FACE_AWAY_FROM_WALL`/`PARALLEL_TO_WALL`) = host-relative, NOT inventable at drop-time → applied as 0° with the
rule label retained (honest, non-invent). 147 distinct leaf products, ALL present in M_Product.
EXTRACTOR (`extract_dagevu_catalog.py`): emit `assemblies:[{id,name,level,category,w,d,h (aabb_*_mm/1000),
children:[{ref,role,seq,dx,dy,dz,rotDeg,rotRule,isBom}]}]`; CLOSE the leaf set — every leaf reachable from a
shipped assembly is added to `products` (tagged `asmOnly` when not in a Structure/Openings/Furniture browse
category, so it resolves in get()/meshArrays() without cluttering the tree) + its `gh` geometry emitted.
LIBRARY SEAM (`bonsai_library.js`): `assemblies()` / `assembly(id)`; `expandAssembly(id, placement)` → flat
`[{hash,x,y,z,rot}]` by composing parent transforms (worldPos = parentPos + Rz(parentRot)·(dx,dy,dz);
worldRot = parentRot + childRotDeg; recurse when isBom else emit leaf). Depth cap + cycle-guard (visited set).
MODELLER UI (`modeller.html`): insert panel gains an "Assemblies" group with a Level axis (Building/Floor/
Room/Set, collapsible like categories) + a chip; pick → pending assembly; ghost = assembly aabb box; click →
`placeComponent` detects an assembly hash → commits expandAssembly's N GEOM_INSERTs as one signed chain.
WITNESS `viewer/tests/bom_assembly_live.js`: drop a NESTED set → oplog length == expandAssembly length AND
> raw child-line count (proves recursion expanded a nested BOM); chain tip verifies (signed); leaf world
positions distinct + match composed dx/dy/dz; group renders N child meshes; replay deterministic.

### §LAYOUT FIX 2026-06-19 — ZERO-OFFSET SETS SPREAD (ported PhantomLayout) + picker detach — ✅ DONE/LIVE
SHIPPED (bim-ootb PR #394, live; extractor BIMCompiler 83179023). archive/BOM.db is 100% FLOAT+LINEAR; sets
with explicit dx/dy keep them, sets with all-zero offsets were STACKED. PORTED `DAGCompiler/.../dsl/PhantomLayout.
placeNext` + `library/BOMTierResolver` hasOffsets branch: zero-offset set → GPD-walk children along host axis,
anchor advances by extent (allocated_width_mm, fallback product/sub-assembly width), centre=anchor+half; baked
at extraction (`autoLayout='LINEAR'`), expandAssembly stays a pure transform. e.g. DUPLEX_BATHROOM_SET → dx
0.2/0.65/1.35/2.25. Picker `disarmPick()` detaches the ghost after each drop. W-BOM-ASSEMBLY += linearSpread +
ghostDetaches PASS. CAVEAT (honest): full room-aware fixture placement (resolveFixtureChildren, wall locators,
door-wall) needs a ROOM ENVELOPE a bare grid-drop lacks — only the room-independent linear walk is ported.

### 🔬 ROLE-AWARE CHILD-RESOLUTION AUDIT — ✅ DONE (read-only, 2026-06-19) — FIX STILL PENDING (do NOT fix yet)
User saw items wrongly associated by name + sets with unexpected children (e.g. a furniture set rendering as a
fire-ex). Verdict: **PARTLY OURS — a resolution gap in `extract_dagevu_catalog.py`, not bad source data.**
Audited against `library/archive/BOM.db` (1387 active `m_bom_line` rows, 58 shipped assemblies). Numbers verified:

**QUANTIFIED.** 74 of 1387 child lines (5.3%) reference a BARE IFC CLASS as a placeholder (24 distinct classes;
`IfcFurniture`×33 / `IfcSanitaryTerminal`×6 / `IfcPipeSegment`×5 / `IfcPipeFitting`×3 / `IfcFireSuppressionTerminal`×3
/ rest ≤2). Every such placeholder DOES resolve in M_Product — but to a **degenerate row: 0.001³ dims, EMPTY Name,
`ifc_class`=itself**. The real intent lives in `m_bom_line.role` (BED/DESK/PIANO/CHAIR_A…/TABLE/SINK…). The
extractor's "CLOSE the leaf set" loop (extract_dagevu_catalog.py:179) resolves `child_product_id` LITERALLY and
**drops `role` entirely** → all N same-class children of a set collapse to ONE product, ONE `gh` mesh (one
`match_hash` per placeholder class), ONE (empty→titlecased-class) name. = "wrong name" + identical-looking siblings.

**11 assemblies visibly broken** (≥2 distinct-role children → identical mesh): SH_DINING_SET 7 (TABLE+CHAIR_A..F),
CANTEEN_SET 5, TOILET_BLOCK_FIXTURES 5 (TOILET/BIDET/TRAP/SINK/SINK), WORKSTATION_SET 5 (DESK/CHAIR/MONITOR/…),
FP_PIPE_ASSEMBLY 4, BED_SET 3, SOFA_AREA 3, BED_SET_MASTER 2, SH_BED_SET 2, SH_LIVING_SET 2 (PIANO+SOFA), 
T_CONNECTOR_ASSEMBLY 2. IfcFurniture alone spans 21 roles × 12 BOMs → 1 mesh.

**CLASSIFICATION (ours vs source):**
1. **OURS — resolution gap (FIXABLE).** Placeholder-collapse above. Fix = role-aware resolution: map
   (`role` token, ifc_class hint) → a concrete real-dim product. Proven feasible NON-INVENT: **19 / 21 IfcFurniture
   roles resolve by role token across real-dim M_Product** (BED→Bed_King, DESK→Desk, CHAIR_*→Dining_Chair,
   PIANO→Piano, SOFA_B→Sofa, COFFEE_TABLE/TABLE→Coffee tables, SIDE_TABLE→Side_Table); only generic `FURNITURE`
   + `MONITOR` have no concrete catalog part. ⚠ Do NOT gate the role-match on the placeholder's `ifc_class` —
   concrete furniture (Bed_King, Desk, FURN_BED_*) carry **blank/NULL ifc_class**, so a strict same-class join
   misses them (a strict-class probe found only 23 pairs; ignoring class → 19/21 furniture).
2. **SOURCE — correct, leave alone.** Fire/MEP/pipe terminals (IfcPipeSegment/Fitting, IfcSanitaryTerminal,
   IfcFireSuppressionTerminal, IfcAirTerminal, IfcFan, IfcOutlet, …) as children of MEP_ROOM / FP_PIPE_ASSEMBLY /
   sprinkler assemblies are legitimate — a dropped BUILDING recursively includes them; only LOOKS odd mixed among
   furniture. These placeholders also have **0 concrete catalog parts of their class** (37 role-class pairs are
   genuinely unresolvable: all MEP/sanitary/fire roles + generic FURNITURE/MONITOR) → cannot role-resolve; keep a
   generic proxy + the role LABEL. The "furniture set rendering as a fire-ex" the user saw = either (b) a BUILDING
   recursively pulling MEP_ROOM's fire children (source-correct), or (c) match_hash picking a fire-ex mesh for a
   degenerate 0.25-cube placeholder (our amplification, below).
3. **OURS — match_hash amplification.** Nearest-volume same-ifc_class mesh (extract_dagevu_catalog.py:49) → a
   product renders as another same-class part's geometry; the 0.001→0.25 placeholder cubes ALL fall to the SAME
   nearest mesh, so #1 forces this. A role-resolved concrete product (with real dims) largely dissolves it;
   residual key improvement = name/role similarity, not bare volume.

**✅ CROSS-CHECKED vs OLD JAVA CASCADE (user ask 2026-06-19).** `DesignerAPIImpl.explodeBomTree`
(BonsaiBIMDesigner, BBC.md §3.5) is the whole-building→furniture cascade: load BOM → walk `m_bom_line` →
recurse if child is a BOM, else insert a LEAF C_OrderLine using **`child_product_id` LITERALLY** (role is NOT
used for product resolution). So the Java does the SAME thing my extractor does — it does NOT role-resolve; it
DEPENDS on the source db carrying concrete child ids. CONFIRMED by the data: the **per-prefix `library/XX_BOM.db`**
(DX/SH/TE…, extracted by the Java IFCtoBOM `ProductResolver` which dim-bands every IFC element) carry CONCRETE
children — e.g. DX_A202_SET = `BED_1981x2032x635` / `TABLE_610x610x610` / `FURNITURE_800x545x2000` (0 placeholders);
identity is in `child_product_id`, `role`=generic ifc_class. The **`archive/BOM.db`** my extractor sources from is a
CURATED/hand-authored db that INVERTS this: furniture sets use `child_product_id`=bare ifc_class placeholder +
identity in `role` (86 placeholder lines; M_Product has named furniture Bed_King/Dining_Chair but NO dim-banded
FURNITURE_* ids). 22 shipped assemblies touch placeholders (the furniture/MEP/structure sets listed in this
session's log). NET: my audit mechanism is RIGHT; the Java cascade confirms literal-id resolution; the cleaner
non-invent fix is therefore either (i) **source furniture assemblies from the concrete per-prefix XX_BOM.db**
(authoritative Java reconstruction) instead of archive's placeholders, or (ii) map archive `role`→a concrete named
M_Product. Prefer (i) where a per-prefix concrete set exists; fall back to (ii) for archive-only curated sets.

**FIX PROPOSAL (next session, witness-first — NOT built here):** in the leaf-resolution + child-expansion path,
when a child's `child_product_id` is a placeholder (degenerate dims / `ifc_class`==product_id), resolve its
concrete product from `role` (token map, ifc_class as a soft hint only) and carry the resolved product's name+dims
+gh into the child; unresolvable roles (MEP/sanitary/fire/generic) keep the proxy + role label. Witness
W-BOM-ROLE-RESOLVE: SH_DINING_SET drops a TABLE + 6 distinct chair meshes (not 7 identical); per-child name ==
resolved product, not "Ifcfurniture"; 0 furniture-set children collapse to a shared hash; MEP terminals unchanged.
Repro of audit: `python3 /tmp/role_audit2.py` (role→product feasibility) + the §-queries in this session's log.

### ⏭ ALSO QUEUED — PER-MESH ORIENTATION (normalize-at-extraction), the "floating/tilted" furniture
Some library geometries are NOT actually Z-up despite `up_axis=Z` metadata (vertices don't honor it) → parts
seat floating/on-side regardless of camera. FIX (later): at extraction, find the axis permutation mapping the
mesh bbox extents → product (w,d,h) with h on +Z, BAKE into vertices in `extract_dagevu_catalog.py`, re-emit
geometries, bump ?v. Verify against actual vertex extents (metadata LIES). Witness: each product's tallest/
intended axis aligns with its h within tolerance. (See the NOTED-FOR-LATER per-mesh bullet above for measured
examples: Dining_Chair z=0.14, FURN_DESK/BED z=2.0.)

## GROUND TRUTH (verified 2026-06-18)
- `library/component_library.db` = **220 MB** → MUST range-load (cannot download whole). lib/bom.db is EMPTY.
- `component_types` (35 rows: id, ifc_class, category, discipline) = the BOM categories. 8 disciplines
  (FP/ELEC/ACMV/STR/ARC/SP/MEP/from_element).
- `component_definitions` (**23,888**: id, type_id→component_types, name, geometry_hash, bbox local_min/max_xyz)
  = the leaf parts. e.g. type 24 has 8022 parts, type 4 has 4200.
- `component_geometries` (23,888: geometry_hash, vertices/faces/normals blobs, vertex_count, face_count) =
  the mesh per part (vertices≈24KB, faces≈47KB). EXACT pattern the viewer already reads (streaming.js §S260).
- `placement_rules` (4,801) + `ad_building_bom` = real placement/assembly (later leg).

## INFRA (present, but DORMANT — must be wired)
- `viewer/lib/httpvfs.js` exports `createDbWorker(configs, workerUrl, wasmUrl, maxBytes=Inf)` → wraps
  `lib/sqlite.worker.js` + `lib/httpvfs-sql-wasm.wasm`. serverMode:"full" = single-file byte-RANGE (no split).
- streaming.js HAS a range-read path (`A._rangeDb.exec`) but `A._rangeDb` is NEVER assigned → dead infra.
  So this is greenfield wiring, not a copy. Call shape:
    `createDbWorker([{from:"inline", config:{serverMode:"full", url:"<db>", requestChunkSize:4096}}],
       "lib/sqlite.worker.js", "lib/httpvfs-sql-wasm.wasm")` → `worker.db.exec("SELECT …")`.
- Range serving: GH Pages/Fastly support byte-range; the WITNESS server must too (add 206 handling).

## SEAM TO PRESERVE (viewer/bonsai_library.js)
`catalog()`, `get(hash)`, `meshArrays(hash)`, `foldInsert(op)`, `previewArrays(hash,pl)`, `lodFor/setLod`.
Today these read a 3-row in-memory CATALOG keyed by geometry_hash. The DB catalog keys by geometry_hash too
(component_definitions.geometry_hash) → the INSERT op already stores `{hash}` → foldInsert stays identical;
only the DATA SOURCE changes (in-memory → range-db, async geometry fetch + a small LRU mesh cache).

## BUILD LEGS — ORIGINAL PLAN (SUPERSEDED by §RESUME; kept for the httpvfs-220MB scale path only)
- **L1 — range-load backend (W-LIBDB-RANGE):** `viewer/bonsai_library_db.js` — lazily create the httpvfs
  worker over component_library.db; expose `tree()` (disciplines→types w/ part counts), `parts(typeId,
  {search,limit,offset})`, `meshFor(geometry_hash)` (range-fetch blob → {positions,indices}). Witness: tree
  has 35 types across 8 disciplines, parts(type) paginates, meshFor returns a valid mesh for a REAL part —
  and TOTAL BYTES READ « 220 MB (the range-load proof, asserted via the witness server's served-byte count).
- **L2 — INSERT panel as a BOM tree (W-LIBDB-UI):** the `#ins-panel` becomes discipline→category→part tree +
  a search box (debounced query over component_definitions.name). Pick a part → existing place/ghost/commit
  path. Witness: tree renders, search narrows, a picked DB part commits a signed GEOM_INSERT that renders.
- **L3 — provider swap (W-LIBDB-SWAP):** route bonsai_library.catalog/get/meshArrays through the DB provider
  (fixture = offline fallback). Witness: the 3 legacy hashes still resolve; INSERT + LOD-300 + Connect
  selection-by-ifc_class regress GREEN on a DB-sourced part.

## OPEN (a "whistle", defer per user) — HOSTING the 220 MB db
GH Pages can serve it (Range ok) but 220 MB is heavy for the Pages repo; OCI is the other home (buildings
already stream from a bucket). DECISION DEFERRED: build/witness against a locally-served copy; wire the
production URL when hosting is chosen. Do NOT commit the 220 MB db to bim-ootb.

## RELATED
[[project_modeller_bom_catalog]] · [[project_connect_scene]] · bonsai_library.js §W-BONSAI-INSERT.
```

## §CATALOG-REBIND — SPEC, 2026-09-26. Priority 2 (MODELLER_MASTER row 14, parked with cause).
```
SCOPE: bim-compiler scripts/extract_dagevu_catalog.py → bim-ootb viewer/dagevu_catalog.json + dagevu_geometries.json
(read ONLY by the Modeller — verified). Read the log after every run.
```
**Measured:** 794 products with a mesh — 201 mesh extents == declared w/d/h · 52 same numbers axes permuted (mostly the METADATA
order, e.g. SLAB_SH_SIMPLE) · 14 placeholder dims (d=h=1) · 527 no match, many because `get_by_name` (name-substring, largest
footprint — a port of the retired Java resolver) binds the WRONG part (GABLE_PORCH_MY and HIP_ROOF_MY both got a 14.8×7.3 m
flat-roof mesh). Dining_Chair metadata h=0.45 vs its own mesh 1.227 m.
**Blocker first:** `library/DX_BOM.db` and `library/SH_BOM.db` are 0 bytes locally; the generator reads per-building SET layouts
from them — regenerating now silently drops the furniture sets. Find them (OCI / another clone / reference_source_ifc_locations
memory) before any regeneration. Never commit a .db binary (CLAUDE.md DB rule).
**Then:** (1) per product, bind the mesh whose extents match its measured dims (or its own extracted instance), not a name guess;
report bound/unbound counts; (2) w/d/h := the bound mesh's extents (industry practice: geometry is the source of truth);
(3) unbindable → keep the LOD-200 box, flagged. **Witness W-CATALOG-BIND:** every product with `gh` has mesh extents == w/d/h
(±5 %), base 201/794; assemblies (layout_assembly uses w) re-verified; W-BEND-FITTING, T7 FOLD-CLEAN unchanged.
